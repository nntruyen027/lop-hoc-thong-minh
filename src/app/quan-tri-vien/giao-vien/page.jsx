'use client';

import {useEffect, useRef, useState} from "react";
import {Button, Dropdown, Form, Input, message, Modal, Radio, Select, Table} from "antd";
import {layDsGiaoVien, resetPassWord, suaGiaoVien, xoaGiaoVien} from "@/services/quan-tri-vien/giao-vien";
import {getTinh, getXa} from "@/services/auth";
import {useDebounce} from "@/hook/data";
import {isStrongPassword} from "@/utils/valid";
import {EllipsisOutlined} from "@ant-design/icons";

const {Option} = Select;

export default function Page() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [dsTinh, setDsTinh] = useState([]);
    const [tinhId, setTinhId] = useState(null);
    const [dsXa, setDsXa] = useState([]);
    const [searchXa, setSearchXa] = useState("");
    const [searchTinh, setSearchTinh] = useState("");
    const [tinhPagi, setTinhPagi] = useState({page: 1, limit: 20, total: 0});
    const [xaPagi, setXaPagi] = useState({page: 1, limit: 20, total: 0});
    const [searchText, setSearchText] = useState("");

    const [selectedGv, setSelectedGv] = useState(null);
    const [isOpenResetModal, setIsOpenResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const debouncedSearch = useDebounce(searchText, 400);
    const [form] = Form.useForm();
    const [isOpenEditModal, setIsEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

    const searchTinhRef = useRef(null);

    const columns = [
        {
            title: "#",
            key: "stt",
            width: 80,
            align: "right",
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Giáo viên",
            dataIndex: "hoTen",
            key: "hoTen",
            render: (hoTen, record) => (record.laNam ? "Thầy " : "Cô ") + hoTen,
        },
        {title: "Địa chỉ chi tiết", dataIndex: "diaChiChiTiet", key: "diaChiChiTiet"},
        {
            title: "Tên xã",
            dataIndex: "xa",
            key: "xa",
            render: (xa) => xa?.ten || "",
        },
        {
            title: "Tên tỉnh",
            dataIndex: "xa",
            key: "tinh",
            render: (xa) => xa?.tinh?.ten || "",
        },
        {title: "Bộ môn", dataIndex: "boMon", key: "boMon"},
        {title: "Chức vụ", dataIndex: "chucVu", key: "chucVu"},
        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                const items = [
                    {key: 'suaGiaoVien', label: 'Cập nhật thông tin', onClick: () => handleEdit(record)},
                    {key: "resetPassword", label: 'Đặt lại mật khẩu', onClick: () => moDatLaiMatKhauModal(record)},
                    {
                        key: 'xoaGiaoVien', label: 'Xóa', onClick: () => handleDelete(record)
                    }
                ];

                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                );
            },
        },
    ];

    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsGiaoVien({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách giáo viên");
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

    const handleOk = async () => {
        const value = await form.validateFields();
        try {
            setEditLoading(true);

            // Convert dayjs object to ISO string (or desired format) before sending to API
            const payload = {
                ...value,
            };

            await suaGiaoVien(form.getFieldValue("id"), payload);
            message.success(`Sửa giáo viên: ${payload.hoTen} thành công!`);
            setIsEditModal(false);
        } catch (e) {
            message.error(e.message || "Lỗi sửa giáo viên");
        } finally {
            await fetchData(pagination.current, pagination.pageSize, debouncedSearch);
            setIsEditModal(false);
            setEditLoading(false);
            setSelectedGv(null);
        }
    };

    const handleEdit = (record) => {
        setSelectedGv(record);


        form.setFieldsValue({
            ...record,
            tinhId: record?.xa?.tinh?.id,
            xaId: record?.xa?.id,
        });

        setTinhId(record?.xa?.tinh?.id);
        setIsEditModal(true);
    };

    const handleDelete = async (record) => {
        setSelectedGv(record);
        console.log(selectedGv)

        setIsOpenDeleteModal(true);
    }

    const confirmDelete = async () => {
        try {
            await xoaGiaoVien(selectedGv.id);
            message.success("Xóa thành công");

            if (data.length === 1 && pagination.current > 1)
                await fetchData(pagination.current - 1, pagination.pageSize, debouncedSearch);
            else
                await fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message);
        } finally {
            setIsOpenDeleteModal(false);
            setSelectedGv(null);
        }
    };

    const handleResetPassword = async () => {
        if (!isStrongPassword(resetPassword)) return message.error("Mật khẩu không đủ mạnh!");

        setResetLoading(true);
        try {
            await resetPassWord(selectedGv.id, resetPassword);
            message.success("Đặt lại mật khẩu thành công");
            setIsOpenResetModal(false);
        } catch (e) {
            message.error(e?.message || "Lỗi đặt lại mật khẩu");
        } finally {
            setResetLoading(false);
        }
    };

    const moDatLaiMatKhauModal = (record) => {
        setSelectedGv(record);
        setResetPassword('');
        setIsOpenResetModal(true);
    };

    const generateRandomPassword = () => {
        const length = 10;
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const special = "!@#$%^&*()_+-={}[]<>?/";

        let password =
            upper[Math.floor(Math.random() * upper.length)] +
            lower[Math.floor(Math.random() * lower.length)] +
            numbers[Math.floor(Math.random() * numbers.length)] +
            special[Math.floor(Math.random() * special.length)];

        const all = upper + lower + numbers + special;
        while (password.length < length) password += all[Math.floor(Math.random() * all.length)];

        password = password.split("").sort(() => 0.5 - Math.random()).join("");
        setResetPassword(password);
        message.success(`Mật khẩu mới: ${password}`);
    };

    const handleTinhScroll = (e) => {
        const target = e.target;
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 5 && dsTinh.length < tinhPagi.total) {
            setTinhPagi((prev) => ({...prev, page: prev.page + 1}));
        }
    };

    const handleXaScroll = (e) => {
        const target = e.target;
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 5 && dsXa.length < xaPagi.total) {
            setXaPagi((prev) => ({...prev, page: prev.page + 1}));
        }
    };

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

    useEffect(() => {
        if (tinhId) {
            setXaPagi({page: 1, limit: 20, total: 0});
            fetchXa(true);
        }
    }, [searchXa]);

    return (
        <div style={{padding: 16}}>
            <div style={{marginBottom: 16, display: "flex", justifyContent: "space-between"}}>
                <Input.Search
                    placeholder="Tìm kiếm giáo viên..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(pag) => fetchData(pag.current, pag.pageSize)}
            />

            <Modal
                title="Đặt lại mật khẩu"
                open={isOpenResetModal}
                onCancel={() => setIsOpenResetModal(false)}
                footer={[
                    <Button key="random" onClick={generateRandomPassword}>Tạo mật khẩu ngẫu nhiên</Button>,
                    <Button key="cancel" onClick={() => setIsOpenResetModal(false)}>Hủy</Button>,
                    <Button key="ok" type="primary" loading={resetLoading} onClick={handleResetPassword}>Lưu</Button>,
                ]}
            >
                <p>Giáo viên: <b>{selectedGv?.hoTen}</b></p>
                <Input.Password
                    placeholder="Nhập mật khẩu mới"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    status={resetPassword && !isStrongPassword(resetPassword) ? "error" : ""}
                />
            </Modal>

            <Modal
                title="Sửa giáo viên"
                open={isOpenEditModal}
                onOk={handleOk}
                confirmLoading={editLoading}
                onCancel={() => {
                    setIsEditModal(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Họ tên" name="hoTen" rules={[{required: true}]}><Input/></Form.Item>

                    <Form.Item label="Giới tính" name="laNam" rules={[{required: true}]}>
                        <Radio.Group><Radio value={true}>Nam</Radio><Radio value={false}>Nữ</Radio></Radio.Group>
                    </Form.Item>
                    <Form.Item label="Bộ môn" name="boMon" rules={[{required: true}]}><Input/></Form.Item>
                    <Form.Item label="Chức vụ" name="chucVu" rules={[{required: true}]}><Input/></Form.Item>

                    <Form.Item label="Tỉnh/Thành phố" name="tinhId" rules={[{required: true}]}>
                        <Select
                            showSearch
                            placeholder="Chọn tỉnh/thành phố"
                            onChange={(val) => {
                                setTinhId(val);
                                form.setFieldsValue({xaId: null});
                                setDsXa([]);
                                setXaPagi({page: 1, limit: 20, total: 0});
                            }}
                            onSearch={setSearchTinh}
                            filterOption={false}
                            dropdownStyle={{maxHeight: 200, overflowY: "auto"}}
                            onPopupScroll={handleTinhScroll}
                        >
                            {dsTinh.map((t) => <Option key={t.id} value={t.id}>{t.ten}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Xã/Phường" name="xaId" rules={[{required: true}]}>
                        <Select
                            showSearch
                            placeholder="Chọn xã/phường"
                            disabled={!tinhId}
                            onSearch={setSearchXa}
                            filterOption={false}
                            dropdownStyle={{maxHeight: 200, overflowY: "auto"}}
                            onPopupScroll={handleXaScroll}
                        >
                            {dsXa.map((x) => <Option key={x.id} value={x.id}>{x.ten}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={'Địa chỉ chi tiết'} name={'diaChiChiTiet'}>
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Xác nhận xóa"
                open={isOpenDeleteModal}
                onOk={confirmDelete}
                onCancel={() => {
                    setIsOpenDeleteModal(false);
                    setSelectedGv(null);
                }}
            >
                Bạn có chắc muốn xóa giáo viên này không?
            </Modal>
        </div>
    );
}
