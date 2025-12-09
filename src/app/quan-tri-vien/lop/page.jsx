'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {layDsTruong, layTatCaLopThuocTruong} from "@/services/quan-tri-vien/truong";
import {suaLop, xoaLop} from "@/services/quan-tri-vien/lop";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";

export default function Page() {

    /* --------------------------------------------------
     * 1. STATE
     * -------------------------------------------------- */
    const {message} = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [editingRecord, setEditingRecord] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Select trường ngoài bảng
    const [dsTruong, setDsTruong] = useState([]);
    const [searchTruong, setSearchTruong] = useState("");
    const [truongPagi, setTruongPagi] = useState({page: 1, limit: 20, total: 0});
    const [selectedTruongId, setSelectedTruongId] = useState(null);

    // Select trường trong modal
    const [dsTruong2, setDsTruong2] = useState([]);
    const [searchTruong2, setSearchTruong2] = useState("");
    const [truongPagi2, setTruongPagi2] = useState({page: 1, limit: 20, total: 0});

    // Search lớp
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [form] = Form.useForm();

    const searchTruongRef = useRef(null);
    const searchTruongRef2 = useRef(null);


    /* --------------------------------------------------
     * 2. TABLE COLUMNS
     * -------------------------------------------------- */
    const columns = [
        {
            title: "#",
            key: "stt",
            width: 80,
            align: "right",
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {title: "Tên lớp", dataIndex: "ten", key: "ten", width: 250},
        {
            title: "Trường",
            dataIndex: "truong",
            key: "truong",
            render: (t) => t?.ten,
        },
        {
            title: "Giáo viên chủ nhiệm",
            dataIndex: "giaoVien",
            key: "giaoVien",
            render: (giaoVien) => giaoVien?.hoTen
        },
        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                const items = [
                    {key: "edit", label: "Cập nhật", onClick: () => handleEdit(record)},
                    {key: "delete", label: "Xóa", onClick: () => handleDelete(record.id)},
                ];

                return (
                    <Dropdown menu={{items}} trigger={["click"]}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                );
            },
        },
    ];


    /* --------------------------------------------------
     * 3. FETCH DATA
     * -------------------------------------------------- */
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        if (!selectedTruongId) return;

        setLoading(true);
        try {
            const res = await layTatCaLopThuocTruong(selectedTruongId, {
                page,
                limit: pageSize,
                search
            });

            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });

        } catch (err) {
            message.error(err.message || "Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };


    /* Load trường (select ngoài bảng) */
    const fetchTruong = async (reset = false) => {
        const page = reset ? 1 : truongPagi.page;

        const res = await layDsTruong({
            search: searchTruong,
            page,
            limit: truongPagi.limit,
        });

        setDsTruong(reset ? res.data : [...dsTruong, ...res.data]);
        setTruongPagi({...truongPagi, page, total: res.total || 0});
    };

    /* Load trường (select trong modal) */
    const fetchTruong2 = async (reset = false) => {
        const page = reset ? 1 : truongPagi2.page;

        const res = await layDsTruong({
            search: searchTruong2,
            page,
            limit: truongPagi2.limit, // FIX BUG
        });

        setDsTruong2(reset ? res.data : [...dsTruong2, ...res.data]);
        setTruongPagi2({...truongPagi2, page, total: res.total || 0});
    };


    /* --------------------------------------------------
     * 4. CRUD
     * -------------------------------------------------- */
    const handleEdit = (record) => {
        setEditingRecord(record);

        form.setFieldsValue({
            ten: record?.ten,
            truongId: record?.truong?.id,
            hinhAnh: record?.hinhAnh,
        });

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            await suaLop(editingRecord.id, values);

            message.success("Cập nhật thành công");

            setSelectedTruongId(values.truongId)

            setModalVisible(false);
            form.resetFields();
            setEditingRecord(null);

            fetchData(pagination.current, pagination.pageSize);
        } catch (err) {
            message.error(err.message || "Lỗi cập nhật");
        }
    };


    /* --------------------------------------------------
     * 5. SCROLL LOAD MORE
     * -------------------------------------------------- */
    const handleTruongScroll = (e) => {
        const {scrollTop, offsetHeight, scrollHeight} = e.target;
        if (scrollTop + offsetHeight >= scrollHeight - 5 &&
            dsTruong.length < truongPagi.total) {
            setTruongPagi(prev => ({...prev, page: prev.page + 1}));
        }
    };

    const handleTruongScroll2 = (e) => {
        const {scrollTop, offsetHeight, scrollHeight} = e.target;
        if (scrollTop + offsetHeight >= scrollHeight - 5 &&
            dsTruong2.length < truongPagi2.total) {
            setTruongPagi2(prev => ({...prev, page: prev.page + 1}));
        }
    };


    /* --------------------------------------------------
     * 6. EFFECTS
     * -------------------------------------------------- */

    // Load bảng khi chọn trường
    useEffect(() => {
        if (selectedTruongId) fetchData();
    }, [selectedTruongId]);


    // Tìm kiếm lớp
    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);


    // Search + debounce cho select trường 1
    useEffect(() => {
        clearTimeout(searchTruongRef.current);
        searchTruongRef.current = setTimeout(() => fetchTruong(true), 300);
        return () => clearTimeout(searchTruongRef.current);
    }, [searchTruong]);


    // Search + debounce cho select trường 2
    useEffect(() => {
        if (!modalVisible) return;
        clearTimeout(searchTruongRef2.current);

        searchTruongRef2.current = setTimeout(() => fetchTruong2(true), 300);

        return () => clearTimeout(searchTruongRef2.current);
    }, [searchTruong2, modalVisible]);


    // Load more trường 1
    useEffect(() => {
        if (truongPagi.page > 1) fetchTruong(false);
    }, [truongPagi.page]);


    // Load more trường 2
    useEffect(() => {
        if (modalVisible && truongPagi2.page > 1) fetchTruong2(false);
    }, [truongPagi2.page, modalVisible]);


    /* --------------------------------------------------
     * 7. UI
     * -------------------------------------------------- */
    return (
        <div style={{padding: 16}}>

            {/* SEARCH + FILTER */}
            <div style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Input.Search
                    placeholder="Tìm kiếm lớp..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <Select
                    showSearch
                    placeholder="Chọn trường"
                    value={selectedTruongId}
                    onChange={setSelectedTruongId}
                    onSearch={setSearchTruong}
                    filterOption={false}
                    notFoundContent={null}
                    onPopupScroll={handleTruongScroll}
                    style={{minWidth: 250}}
                >
                    {dsTruong.map((t) => (
                        <Select.Option key={t.id} value={t.id}>
                            {t.ten}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* TABLE */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchData(p.current, p.pageSize)}
            />

            {/* EDIT MODAL */}
            <Modal
                title="Sửa lớp"
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                }}
            >
                <Form form={form} layout="vertical">

                    <Form.Item
                        label="Tên lớp"
                        name="ten"
                        rules={[{required: true, message: "Không được để trống"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Tên trường" name="truongId"
                               rules={[{required: true, message: "Vui lòng chọn trường"}]}>
                        <Select
                            showSearch
                            placeholder="Chọn trường"
                            onSearch={setSearchTruong2}
                            filterOption={false}
                            notFoundContent={null}
                            onPopupScroll={handleTruongScroll2}
                        >
                            {dsTruong2.map((t) => (
                                <Select.Option key={t.id} value={t.id}>
                                    {t.ten}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Hình ảnh" name="hinhAnh">
                        <Input placeholder="Nhập link hình ảnh..."/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaLop(deletingId);
                        message.success("Xóa thành công");

                        if (data.length === 1 && pagination.current > 1)
                            fetchData(pagination.current - 1, pagination.pageSize);
                        else fetchData(pagination.current, pagination.pageSize);

                    } catch (err) {
                        message.error(err.message || "Lỗi khi xóa");
                    } finally {
                        setDeleteModalVisible(false);
                        setDeletingId(null);
                    }
                }}
                onCancel={() => setDeleteModalVisible(false)}
            >
                Bạn có chắc muốn xóa lớp này không?
            </Modal>
        </div>
    );
}
