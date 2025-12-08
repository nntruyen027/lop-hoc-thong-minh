'use client';

import {useEffect, useRef, useState} from "react";
import {Button, Dropdown, Form, Input, message, Modal, Select, Table} from "antd";
import {importXa, layDsXa, layFileImport, suaXa, themXa, xoaXa} from "@/services/quan-tri-vien/xa";
import {getTinh} from "@/services/auth";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";

export default function Page() {

    /* --------------------------------------------
     * 1. STATE
     * -------------------------------------------- */
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [editingXa, setEditingXa] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [importing, setImporting] = useState(false);

    const [dsTinh, setDsTinh] = useState([]);
    const [searchTinh, setSearchTinh] = useState("");
    const [tinhPagi, setTinhPagi] = useState({page: 1, limit: 20, total: 0});
    const [searchText, setSearchText] = useState("");


    const debouncedSearch = useDebounce(searchText, 400);
    /* --------------------------------------------
     * 2. REFS
     * -------------------------------------------- */
    const searchTinhRef = useRef(null);
    const fileInputRef = useRef(null);
    const [form] = Form.useForm();


    /* --------------------------------------------
     * 3. TABLE COLUMNS
     * -------------------------------------------- */
    const columns = [
        {
            title: "#",
            key: "stt",
            width: 80,
            align: "right",
            render: (text, record, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },

        {title: "Tên xã", dataIndex: "ten", key: "ten"},
        {
            title: "Tên tỉnh",
            dataIndex: "tinh",
            key: "tinh",
            render: (tinh) => tinh?.ten || ""
        },
        {title: "Ghi chú", dataIndex: "ghiChu", key: "ghiChu"},
        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                const items = [
                    {
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: "xoa",
                        label: "Xóa",
                        onClick: () => handleDelete(record.id)
                    }
                ]
                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                )
            }
        }
    ];


    /* --------------------------------------------
     * 4. FETCH DATA
     * -------------------------------------------- */
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsXa({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách xã");
        } finally {
            setLoading(false);
        }
    };

    const fetchTinh = async (reset = false) => {
        const page = reset ? 1 : tinhPagi.page;
        const result = await getTinh(searchTinh, page, tinhPagi.limit);

        setDsTinh(reset ? result.dsTinh : [...dsTinh, ...result.dsTinh]);
        setTinhPagi({page, limit: tinhPagi.limit, total: result.total || 0});
    };


    /* --------------------------------------------
     * 5. CRUD HANDLERS
     * -------------------------------------------- */
    const handleEdit = (record) => {
        setEditingXa(record);

        form.setFieldsValue({
            ...record,
            tinhId: record.tinh?.id || null,
        });

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingXa) {
                await suaXa(editingXa.id, values);
                message.success("Cập nhật thành công");
            } else {
                await themXa(values);
                message.success("Thêm xã thành công");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingXa(null);
            fetchData(pagination.current, pagination.pageSize);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };


    /* --------------------------------------------
     * 6. DOWNLOAD / IMPORT FILE
     * -------------------------------------------- */
    const handleDownloadTemplate = async () => {
        try {
            await layFileImport();
        } catch (e) {
            message.error(e.message);
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setImporting(true);
            await importXa(formData);
            message.success("Import thành công");
            fetchData(pagination.current, pagination.pageSize);
        } catch (err) {
            message.error(err.message || "Lỗi import");
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };


    /* --------------------------------------------
     * 7. INFINITE SCROLL SELECT TỈNH
     * -------------------------------------------- */
    const handleTinhScroll = (e) => {
        const target = e.target;
        if (
            target.scrollTop + target.offsetHeight >= target.scrollHeight - 5 &&
            dsTinh.length < tinhPagi.total
        ) {
            setTinhPagi(prev => ({...prev, page: prev.page + 1}));
        }
    };


    /* --------------------------------------------
     * 8. USE EFFECTS
     * -------------------------------------------- */
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        if (searchTinhRef.current) clearTimeout(searchTinhRef.current);

        searchTinhRef.current = setTimeout(() => fetchTinh(true), 300);

        return () => clearTimeout(searchTinhRef.current);
    }, [searchTinh]);

    useEffect(() => {
        if (tinhPagi.page > 1) fetchTinh(false);
    }, [tinhPagi.page]);


    /* --------------------------------------------
     * 9. UI RENDER
     * -------------------------------------------- */
    return (
        <div style={{padding: 16}}>

            {/* SEARCH + ACTION BUTTONS */}
            <div style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                {/* SEARCH BOX */}
                <Input.Search
                    placeholder="Tìm kiếm xã..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}

                />

                {/* ACTION BUTTONS */}
                <div style={{display: "flex", gap: 8}}>
                    <Button
                        type="primary"
                        onClick={() => {
                            setModalVisible(true);
                            form.resetFields();
                            setEditingXa(null);
                        }}
                    >
                        Thêm xã
                    </Button>

                    <Button onClick={handleDownloadTemplate}>Tải file mẫu</Button>

                    <Button onClick={() => fileInputRef.current.click()} loading={importing}>
                        Import file
                    </Button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{display: "none"}}
                        accept=".xlsx"
                        onChange={handleImportFile}
                    />
                </div>
            </div>

            {/* TABLE */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(pag) => fetchData(pag.current, pag.pageSize)}
            />

            {/* ADD / EDIT MODAL */}
            <Modal
                title={editingXa ? "Sửa xã" : "Thêm xã"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingXa(null);
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên xã"
                        name="ten"
                        rules={[{required: true, message: "Vui lòng nhập tên xã"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Tỉnh/Thành phố"
                        name="tinhId"
                        rules={[{required: true, message: "Vui lòng chọn tỉnh/thành phố"}]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn tỉnh/thành phố"
                            onSearch={setSearchTinh}
                            filterOption={false}
                            dropdownStyle={{maxHeight: 200, overflowY: "auto"}}
                            onPopupScroll={handleTinhScroll}
                        >
                            {dsTinh.map(t => (
                                <Select.Option key={t.id} value={t.id}>
                                    {t.ten}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="ghiChu">
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DELETE CONFIRM MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaXa(deletingId);
                        message.success("Xóa thành công");

                        if (data.length === 1 && pagination.current > 1)
                            fetchData(pagination.current - 1, pagination.pageSize);
                        else
                            fetchData(pagination.current, pagination.pageSize);

                    } catch (e) {
                        message.error(e.message);
                    } finally {
                        setDeleteModalVisible(false);
                        setDeletingId(null);
                    }
                }}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeletingId(null);
                }}
            >
                Bạn có chắc muốn xóa xã này không?
            </Modal>
        </div>
    );
}
