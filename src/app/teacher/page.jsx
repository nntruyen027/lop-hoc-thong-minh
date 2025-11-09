'use client';

import {useEffect, useState} from 'react';
import {Button, Card, Descriptions, Form, Input, message, Modal, Table, Tabs, Tag, Typography} from 'antd';
import TextArea from 'antd/es/input/TextArea';

const {Title} = Typography;

export default function TeacherPage() {
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    // -------------------- Fetch data --------------------
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BE}/students`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
                }
            });
            if (!res.ok) throw new Error('Không thể tải danh sách học sinh');
            const data = await res.json();
            setStudents(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // -------------------- Search --------------------
    const handleSearch = (value) => {
        setSearch(value);
        const lower = value.toLowerCase();
        const result = students.filter(
            (s) =>
                s.hoTen.toLowerCase().includes(lower) ||
                s.lop.toLowerCase().includes(lower)
        );
        setFiltered(result);
    };

    // -------------------- Open modal --------------------
    const openModal = (record) => {
        setSelected(record);
        // Cập nhật giá trị cho form
        form.setFieldsValue({
            nhanXetGiaoVien: record.nhanXetGiaoVien || '',
            ghiChu: record.ghiChu || '',
        });
        setModalVisible(true);
    };

    // -------------------- Save update --------------------
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const studentId = selected.id;

            const res = await fetch(`${process.env.NEXT_PUBLIC_BE}/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
                },
                body: JSON.stringify({
                    ...selected,
                    ...values
                }),
            });
            if (!res.ok) throw new Error('Không thể cập nhật thông tin');
            message.success('Cập nhật thành công');
            setModalVisible(false);
            fetchStudents();
        } catch (err) {
            console.error(err);
            message.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    // -------------------- Table columns --------------------
    const columns = [
        {title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen'},
        {title: 'Lớp', dataIndex: 'lop', key: 'lop'},
        {title: 'Ngày sinh', dataIndex: 'ngaySinh', key: 'ngaySinh', render: text => text},
        {title: 'Giới tính', dataIndex: 'laNam', key: 'laNam', render: val => (val ? 'Nam' : 'Nữ')},
        {
            title: 'Điểm Holland',
            children: [
                {title: 'R', dataIndex: 'realisticScore', key: 'realisticScore'},
                {title: 'I', dataIndex: 'investigativeScore', key: 'investigativeScore'},
                {title: 'A', dataIndex: 'artisticScore', key: 'artisticScore'},
                {title: 'S', dataIndex: 'socialScore', key: 'socialScore'},
                {title: 'E', dataIndex: 'enterprisingScore', key: 'enterprisingScore'},
                {title: 'C', dataIndex: 'conventionalScore', key: 'conventionalScore'},
            ],
        },
        {
            title: 'Nhóm nổi bật',
            dataIndex: 'assessmentResult',
            key: 'assessmentResult',
            render: val => (
                <Tag color="blue" style={{fontSize: 14, padding: '4px 8px'}}>
                    {val}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => openModal(record)}>
                    Xem chi tiết / Chỉnh sửa
                </Button>
            ),
        },
    ];

    // -------------------- Mô tả nhóm --------------------
    const hollandDescriptions = {
        R: 'Nhóm Thực tế (Realistic): Thích công việc kỹ thuật, vận hành máy móc, nông nghiệp, thể thao...',
        I: 'Nhóm Nghiên cứu (Investigative): Thích khám phá, khoa học, công nghệ, toán học...',
        A: 'Nhóm Nghệ thuật (Artistic): Sáng tạo, yêu thích âm nhạc, hội họa, viết lách...',
        S: 'Nhóm Xã hội (Social): Thích giao tiếp, giúp đỡ, giảng dạy, tư vấn...',
        E: 'Nhóm Quản lý (Enterprising): Năng động, lãnh đạo, kinh doanh, thuyết phục...',
        C: 'Nhóm Quy ước (Conventional): Tỉ mỉ, làm việc có tổ chức, hành chính, kế toán...',
    };

    return (
        <div style={{maxWidth: 1200, margin: '50px auto'}}>
            <Title level={3} style={{textAlign: 'center'}}>
                📋 Danh sách học sinh tham gia khảo sát Holland
            </Title>

            <Card style={{marginBottom: 20, padding: 16}}>
                <Input.Search
                    placeholder="Tìm theo họ tên hoặc lớp..."
                    allowClear
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    style={{width: 400}}
                />
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={filtered.map((s, i) => ({...s, key: i}))}
                    loading={loading}
                    bordered
                    pagination={{pageSize: 10}}
                    scroll={{x: true}}
                />
            </Card>

            <Modal
                open={modalVisible}
                title={selected ? `Thông tin học sinh: ${selected.hoTen}` : ''}
                width={800}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                {selected && (
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: '1',
                                label: 'Thông tin & Kết quả',
                                children: (
                                    <Descriptions bordered column={1} size="small">
                                        <Descriptions.Item label="Họ tên">{selected.hoTen}</Descriptions.Item>
                                        <Descriptions.Item label="Lớp">{selected.lop}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày sinh">{selected.ngaySinh}</Descriptions.Item>
                                        <Descriptions.Item
                                            label="Giới tính">{selected.laNam ? 'Nam' : 'Nữ'}</Descriptions.Item>
                                        <Descriptions.Item label="Sở thích">{selected.soThich}</Descriptions.Item>
                                        <Descriptions.Item
                                            label="Môn học yêu thích">{selected.monHocYeuThich}</Descriptions.Item>
                                        <Descriptions.Item label="Điểm mạnh">{selected.diemManh}</Descriptions.Item>
                                        <Descriptions.Item label="Điểm yếu">{selected.diemYeu}</Descriptions.Item>
                                        <Descriptions.Item
                                            label="Nghề mong muốn">{selected.ngheNghiepMongMuon}</Descriptions.Item>
                                        <Descriptions.Item label="Nhóm nổi bật">
                                            <Tag color="blue">{selected.assessmentResult}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Điểm chi tiết">
                                            R: {selected.realisticScore}, I: {selected.investigativeScore},
                                            A: {selected.artisticScore}, S: {selected.socialScore},
                                            E: {selected.enterprisingScore}, C: {selected.conventionalScore}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Mô tả nhóm">
                                            {selected.assessmentResult?.split(',').map(t => (
                                                <p key={t}>
                                                    <strong>{t.trim()}</strong>: {hollandDescriptions[t.trim()]}
                                                </p>
                                            ))}
                                        </Descriptions.Item>
                                    </Descriptions>
                                ),
                            },
                            {
                                key: '2',
                                label: 'Nhận xét / Ghi chú',
                                children: (
                                    <Form layout="vertical" form={form}>
                                        <Form.Item
                                            label="Nhận xét của giáo viên"
                                            name="nhanXetGiaoVien"
                                            rules={[{required: true, message: 'Vui lòng nhập nhận xét'}]}
                                        >
                                            <TextArea rows={4}/>
                                        </Form.Item>
                                        <Form.Item label="Ghi chú thêm" name="ghiChu">
                                            <TextArea rows={3}/>
                                        </Form.Item>
                                        <Button type="primary" loading={saving} onClick={handleSave}>
                                            Lưu thay đổi
                                        </Button>
                                    </Form>
                                ),
                            },
                        ]}
                    />
                )}
            </Modal>
        </div>
    );
}
