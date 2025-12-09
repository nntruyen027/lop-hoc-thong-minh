'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {
    importTruong,
    layDsTruong,
    layFileImport,
    suaTruong,
    themTruong,
    xoaTruong
} from "@/services/quan-tri-vien/truong";
import {getTinh, getXa} from "@/services/auth";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";


export default function Page() {

    /* --------------------------------------------
     * 1. STATE
     * -------------------------------------------- */

    const {message} = App.useApp()
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [editingTruong, setEditingTruong] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [importing, setImporting] = useState(false);

    const [dsTinh, setDsTinh] = useState([]);
    const [tinhId, setTinhId] = useState(null);
    const [dsXa, setDsXa] = useState([]);
    const [searchXa, setSearchXa] = useState("");
    const [searchTinh, setSearchTinh] = useState("");
    const [tinhPagi, setTinhPagi] = useState({page: 1, limit: 20, total: 0});
    const [xaPagi, setXaPagi] = useState({page: 1, limit: 20, total: 0});
    const [searchText, setSearchText] = useState("");

    const debouncedSearch = useDebounce(searchText, 400);

    /* ---- NEW: MODAL CHỌN TỈNH ĐỂ DOWNLOAD TEMPLATE ---- */
    const [openDownloadModal, setOpenDownloadModal] = useState(false);
    const [downloadTinhId, setDownloadTinhId] = useState(null);

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
        {title: "Tên trường", dataIndex: "ten", key: "ten", width: 250},
        {title: "Logo", dataIndex: "logo", key: "logo"},
        {
            title: 'Địa chỉ chi tiết',
            dataIndex: "diaChiChiTiet",
            key: "diaChiChiTiet",
            width: 200
        },
        {
            title: "Tên xã",
            dataIndex: "xa",
            key: "xa",
            width: 200,
            render: (xa) => xa?.ten || ""
        },
        {
            title: "Tên tỉnh",
            dataIndex: "xa",
            key: "tinh",
            width: 200,
            render: (xa) => xa?.tinh?.ten || ""
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
            const res = await layDsTruong({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách trường");
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

    const fetchXa = async (reset = false) => {
        if (!tinhId) return;
        const page = reset ? 1 : xaPagi.page;
        const result = await getXa(searchXa, tinhId, page, xaPagi.limit);
        setDsXa(reset ? result.dsXa : [...dsXa, ...result.dsXa]);
        setXaPagi({page, limit: xaPagi.limit, total: result.total || 0});
    };


    /* --------------------------------------------
     * 5. CRUD HANDLERS
     * -------------------------------------------- */
    const handleEdit = async (record) => {
        setEditingTruong(record);

        const tinh = record.xa?.tinh?.id;
        const xa = record.xa?.id;

        form.setFieldsValue({
            ...record,
            tinhId: tinh,
            xaId: xa,
        });

        setTinhId(tinh);

        setDsXa([]);
        setXaPagi({page: 1, limit: 20, total: 0});

        const result = await getXa("", tinh, 1, 20);
        setDsXa(result.dsXa || []);

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingTruong) {
                await suaTruong(editingTruong.id, values);
                message.success("Cập nhật thành công");
            } else {
                await themTruong(values);
                message.success("Thêm trường thành công");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingTruong(null);
            fetchData(pagination.current, pagination.pageSize);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    /* --------------------------------------------
     * 6. DOWNLOAD / IMPORT FILE
     * -------------------------------------------- */

    // **NEW: Mở modal chọn tỉnh**
    const openDownload = () => {
        setOpenDownloadModal(true);
        setDownloadTinhId(null);
        setDsTinh([]);
        setTinhPagi({page: 1, limit: 20, total: 0});
        fetchTinh(true);
    };

    // **NEW: Xử lý tải file import**
    const handleDownloadTemplate = async () => {
        if (!downloadTinhId) {
            message.warning("Vui lòng chọn tỉnh!");
            return;
        }

        try {
            const res = await layFileImport(downloadTinhId); // axios blob

            const url = window.URL.createObjectURL(new Blob([res]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "mau_import_truong.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);

            setOpenDownloadModal(false);

        } catch (e) {
            message.error("Không thể tải file mẫu!");
        }
    };


    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setImporting(true);
            await importTruong(formData);
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
     * 7. INFINITE SCROLL SELECT
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

    const handleXaScroll = (e) => {
        const target = e.target;
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 5 && dsXa.length < xaPagi.total) {
            setXaPagi(prev => ({...prev, page: prev.page + 1}));
        }
    };


    /* --------------------------------------------
     * 8. USE EFFECTS
     * -------------------------------------------- */
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tinhId) fetchXa(true);
    }, [tinhId]);

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
                    placeholder="Tìm kiếm trường..."
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
                            setEditingTruong(null);
                        }}
                    >
                        Thêm trường
                    </Button>

                    {/* NEW: Mở modal chọn tỉnh */}
                    <Button onClick={openDownload}>Tải file mẫu</Button>

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
                title={editingTruong ? "Sửa trường" : "Thêm trường"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingTruong(null);
                }}
            >
                <Form form={form} layout="vertical">

                    <Form.Item label="Tên trường" name="ten" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Tỉnh/Thành phố" name="tinhId" rules={[{required: true}]}>
                        <Select
                            showSearch
                            placeholder="Chọn tỉnh/thành phố"
                            value={form.getFieldValue("tinhId")}
                            onChange={(val) => {
                                setTinhId(val);
                                form.setFieldsValue({xaId: null});
                                setDsXa([]);
                                setXaPagi({page: 1, limit: 20, total: 0});
                            }}
                            onSearch={(val) => setSearchTinh(val)}
                            filterOption={false}
                            notFoundContent={null}
                            onPopupScroll={handleTinhScroll}
                        >
                            {dsTinh.map(t => (
                                <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Xã/Phường" name="xaId" rules={[{required: true}]}>
                        <Select
                            showSearch
                            placeholder="Chọn xã/phường"
                            disabled={!dsXa.length}
                            value={form.getFieldValue("xaId")}
                            onSearch={(val) => setSearchXa(val)}
                            filterOption={false}
                            dropdownStyle={{maxHeight: 200, overflowY: "auto"}}
                            onPopupScroll={handleXaScroll}
                        >
                            {dsXa.map(x => (
                                <Select.Option key={x.id} value={x.id}>{x.ten}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Địa chỉ chi tiết" name="diaChiChiTiet">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Hình ảnh" name="hinhAnh">
                        <Input placeholder="Nhập link hình ảnh..."/>
                    </Form.Item>

                    <Form.Item label="Logo" name="logo">
                        <Input placeholder="Nhập link logo..."/>
                    </Form.Item>

                </Form>

            </Modal>

            {/* DELETE CONFIRM MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaTruong(deletingId);
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
                Bạn có chắc muốn xóa trường này không?
            </Modal>

            {/* NEW: MODAL CHỌN TỈNH ĐỂ DOWNLOAD TEMPLATE */}
            <Modal
                title="Chọn tỉnh để tải file mẫu"
                open={openDownloadModal}
                onOk={handleDownloadTemplate}
                onCancel={() => setOpenDownloadModal(false)}
                okButtonProps={{disabled: !downloadTinhId}}
            >
                <Form layout="vertical">
                    <Form.Item label="Tỉnh/Thành phố">
                        <Select
                            showSearch
                            placeholder="Chọn tỉnh/thành phố"
                            onChange={val => setDownloadTinhId(val)}
                            onSearch={val => setSearchTinh(val)}
                            filterOption={false}
                            notFoundContent={null}
                            onPopupScroll={handleTinhScroll}
                        >
                            {dsTinh.map(t => (
                                <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
}
