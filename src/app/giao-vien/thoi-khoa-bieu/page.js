'use client';

import {useEffect, useMemo, useState} from "react";
import {Button, Col, message, Modal, Row, Select, Spin, Table} from "antd";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {layDsTkb, themTkb, xoaTkb} from "@/services/giao-vien/thoi-khoa-bieu";
import {useTruongLopSelect} from "@/hook/useTruongLop";
import {layDsBoMon} from "@/services/giao-vien/bo-mon";

/* ====== hằng số ====== */
const THU_TRONG_TUAN = [
    {label: 'Thứ 2', value: 1},
    {label: 'Thứ 3', value: 2},
    {label: 'Thứ 4', value: 3},
    {label: 'Thứ 5', value: 4},
    {label: 'Thứ 6', value: 5},
    {label: 'Thứ 7', value: 6},
];

const SO_TIET = [
    {label: 'Tiết 1', value: 1},
    {label: 'Tiết 2', value: 2},
    {label: 'Tiết 3', value: 3},
    {label: 'Tiết 4', value: 4},
    {label: 'Tiết 5', value: 5},
    {label: 'Tiết 1 (Chiều)', value: 6},
    {label: 'Tiết 2 (Chiều)', value: 7},
    {label: 'Tiết 3 (Chiều)', value: 8},
    {label: 'Tiết 4 (Chiều)', value: 9},
    {label: 'Tiết 5 (Chiều)', value: 10},
];

export default function ThoiKhoaBieu() {

    /* ====== chọn trường – lớp ====== */
    const {
        dsTruong,
        setSearchTruong,
        truongId,
        setTruongId,
        truongPagi,
        setTruongPagi,

        dsLop,
        setSearchLop,
        lopPagi,
        setLopPagi
    } = useTruongLopSelect();

    /* ====== thời khóa biểu ====== */
    const [lopId, setLopId] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ====== modal thêm ====== */
    const [open, setOpen] = useState(false);
    const [thu, setThu] = useState(null);
    const [tiet, setTiet] = useState(null);
    const [monHocId, setMonHocId] = useState(null);

    /* ====== môn học ====== */
    const [dsMonHoc, setDsMonHoc] = useState([]);
    const [monHocLoading, setMonHocLoading] = useState(false);
    const [searchMonHoc, setSearchMonHoc] = useState('');
    const [monHocPagi, setMonHocPagi] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    /* ====== load TKB ====== */
    const loadTkb = async () => {
        if (!lopId) return;
        try {
            setLoading(true);
            const res = await layDsTkb(lopId);
            setData(res || []);
        } catch (e) {
            message.error(e.message || 'Lỗi tải thời khóa biểu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTkb();
    }, [lopId]);

    /* ====== map TKB ====== */
    const mapTkb = useMemo(() => {
        const map = {};
        data.forEach(i => {
            map[`${i.thuTrongTuan}-${i.tietHoc}`] = i;
        });
        return map;
    }, [data]);

    /* ====== load môn học ====== */
    const loadMonHoc = async (reset = false) => {
        try {
            setMonHocLoading(true);
            const page = reset ? 1 : monHocPagi.page;

            const res = await layDsBoMon({
                search: searchMonHoc,
                page,
                limit: monHocPagi.limit
            });

            setDsMonHoc(prev =>
                reset ? res.data : [...prev, ...res.data]
            );

            setMonHocPagi(p => ({
                ...p,
                page,
                total: res.total
            }));
        } catch (e) {
            message.error(e.message || 'Lỗi tải môn học');
        } finally {
            setMonHocLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            setDsMonHoc([]);
            setMonHocPagi(p => ({...p, page: 1}));
            loadMonHoc(true);
        }
    }, [open, searchMonHoc]);

    /* ====== thêm tiết ====== */
    const handleThem = async () => {
        if (!lopId || !thu || !tiet || !monHocId) {
            message.warning("Vui lòng nhập đủ thông tin");
            return;
        }
        try {
            await themTkb(lopId, {
                monHocId,
                thuTrongTuan: thu,
                tietHoc: tiet
            });
            message.success("Thêm tiết học thành công");
            setOpen(false);
            setMonHocId(null);
            loadTkb();
        } catch (e) {
            message.error(e.message);
        }
    };

    /* ====== xóa tiết ====== */
    const handleXoa = async (thu, tiet) => {
        try {
            await xoaTkb(lopId, thu, tiet);
            message.success("Đã xóa");
            loadTkb();
        } catch (e) {
            message.error(e.message);
        }
    };

    /* ====== columns ====== */
    const columns = [
        {
            title: 'Tiết',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <>
                    <div className="text-sm">
                        <div className="font-medium">{record.label}</div>
                        <div className="text-gray-500">
                            {record.tiet <= 5 ? 'Buổi sáng' : 'Buổi chiều'}
                        </div>
                    </div>

                </>
            )
        },
        ...THU_TRONG_TUAN.map(t => ({
            title: t.label,
            align: 'center',
            width: 200,
            render: (_, record) => {
                const cell = mapTkb[`${t.value}-${record.tiet}`];

                if (!lopId)
                    return <></>

                if (!cell) {
                    return (
                        <Button
                            size="small"
                            type="dashed"
                            icon={<PlusOutlined/>}
                            onClick={() => {
                                setThu(t.value);
                                setTiet(record.tiet);
                                setOpen(true);
                            }}
                        />
                    );
                }

                return (
                    <div
                        className="max-w-[calc(1/7*100%)] flex items-center justify-between bg-blue-50 px-2 py-1 rounded">
                        <span className="text-blue-700 font-medium">
                            {cell.tenMonHoc}
                        </span>
                        <DeleteOutlined
                            className="text-red-500 cursor-pointer"
                            onClick={() => handleXoa(t.value, record.tiet)}
                        />
                    </div>
                );
            }
        }))
    ];

    return (
        <div className="p-6 space-y-4">

            {/* ====== chọn trường – lớp ====== */}
            <Row gutter={10} style={{marginBottom: '2rem'}}>
                <Col sm={24} md={4}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Chọn trường"
                        className="w-full"
                        onSearch={setSearchTruong}
                        onClear={() => setTruongId(null)}
                        onChange={setTruongId}
                        options={dsTruong.map(t => ({
                            label: t.ten,
                            value: t.id
                        }))}
                        onPopupScroll={e => {
                            const target = e.target;
                            if (
                                target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
                                dsTruong.length < truongPagi.total
                            ) {
                                setTruongPagi(p => ({...p, page: p.page + 1}));
                            }
                        }}
                    />
                </Col>

                <Col sm={24} md={4}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Chọn lớp"
                        className="w-full"
                        disabled={!truongId}
                        onSearch={setSearchLop}
                        onChange={setLopId}
                        options={dsLop.map(l => ({
                            label: l.ten,
                            value: l.id
                        }))}
                        onPopupScroll={e => {
                            const target = e.target;
                            if (
                                target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
                                dsLop.length < lopPagi.total
                            ) {
                                setLopPagi(p => ({...p, page: p.page + 1}));
                            }
                        }}
                    />
                </Col>
            </Row>

            {/* ====== bảng TKB ====== */}
            <Spin spinning={loading}>
                <Table
                    bordered
                    pagination={false}
                    columns={columns}
                    dataSource={SO_TIET.map(t => ({
                        key: t.value,
                        tiet: t.value,
                        label: t.label
                    }))}
                />
            </Spin>

            {/* ====== modal thêm ====== */}
            <Modal
                open={open}
                title="Thêm tiết học"
                onCancel={() => {
                    setOpen(false);
                    setMonHocId(null);
                    setSearchMonHoc('');
                }}
                onOk={handleThem}
            >
                <Select
                    showSearch
                    allowClear
                    placeholder="Chọn môn học"
                    className="w-full"
                    value={monHocId}
                    loading={monHocLoading}
                    onChange={setMonHocId}
                    onSearch={setSearchMonHoc}
                    filterOption={false}
                    options={dsMonHoc.map(m => ({
                        label: m.ten,
                        value: m.id
                    }))}
                    onPopupScroll={e => {
                        const target = e.target;
                        if (
                            target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
                            dsMonHoc.length < monHocPagi.total
                        ) {
                            setMonHocPagi(p => ({...p, page: p.page + 1}));
                            loadMonHoc();
                        }
                    }}
                />

                <div className="mt-2">
                    Thứ <b>{thu}</b> – Tiết <b>{tiet}</b>
                </div>
            </Modal>
        </div>
    );
}
