'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Table} from "antd";
import {EllipsisOutlined} from "@ant-design/icons";
import {importTinh, layDsTinh, layFileImport, suaTinh, themTinh, xoaTinh} from "@/services/quan-tri-vien/tinh";
import {useDebounce} from "@/hook/data";


export default function Page() {

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp()

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTinh, setEditingTinh] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [importing, setImporting] = useState(false);

    // Search
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    // -----------------------------
    // REF + FORM
    // -----------------------------
    const fileInputRef = useRef(null);
    const [form] = Form.useForm();

    // -----------------------------
    // FETCH DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsTinh({page, limit: pageSize, search});
            setData(res.data || []);

            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách tỉnh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, []);


    // -----------------------------
    // HANDLERS: ADD / EDIT
    // -----------------------------
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingTinh) {
                await suaTinh(editingTinh.id, values);
                message.success("Cập nhật thành công");
            } else {
                await themTinh(values);
                message.success("Thêm tỉnh thành công");
            }

            setModalVisible(false);
            setEditingTinh(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingTinh(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    // -----------------------------
    // HANDLERS: DELETE
    // -----------------------------
    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaTinh(deletingId);
            message.success("Xóa thành công");

            if (data.length === 1 && pagination.current > 1)
                fetchData(pagination.current - 1, pagination.pageSize, debouncedSearch);
            else
                fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message);
        } finally {
            setDeleteModalVisible(false);
            setDeletingId(null);
        }
    };

    // -----------------------------
    // HANDLERS: IMPORT / TEMPLATE
    // -----------------------------
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
            await importTinh(formData);

            message.success("Import thành công");
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (err) {
            message.error(err.message || "Lỗi import");
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };

    // -----------------------------
    // TABLE COLUMNS
    // -----------------------------
    const columns = [
        {
            title: "#",
            key: "stt",
            width: 80,
            align: "right",
            render: (text, record, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tên tỉnh", dataIndex: "ten", key: "ten"},
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


    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <div style={{padding: 16}}>

            {/* SEARCH + ACTION BUTTONS */}
            <div
                style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {/* LEFT: SEARCH */}
                <Input.Search
                    placeholder="Tìm tỉnh..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                {/* RIGHT: BUTTONS */}
                <div style={{display: "flex", gap: 8}}>
                    <Button
                        type="primary"
                        onClick={() => {
                            setModalVisible(true);
                            setEditingTinh(null);
                            form.resetFields();
                        }}
                    >
                        Thêm tỉnh
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
                onChange={(pag) => fetchData(pag.current, pag.pageSize, debouncedSearch)}
            />

            {/* ADD/EDIT MODAL */}
            <Modal
                title={editingTinh ? "Sửa tỉnh" : "Thêm tỉnh"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingTinh(null);
                }}
            >

                <Form form={form} layout="vertical" initialValues={{ten: ""}}>
                    <Form.Item
                        label="Tên tỉnh"
                        name="ten"
                        rules={[{required: true, message: "Vui lòng nhập tên tỉnh"}]}
                    >
                        <Input/>
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
                onOk={confirmDelete}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeletingId(null);
                }}
            >
                Bạn có chắc muốn xóa tỉnh này không?
            </Modal>
        </div>
    );
}
