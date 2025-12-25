'use client';

import {useEffect, useMemo, useState} from "react";
import {Card, Col, Empty, Row, Spin, Tag} from "antd";
import dayjs from "dayjs";
import {layDsTkb, layTkbHomNay, layTkbNgayMai} from "@/services/hoc-sinh/thoi-khoa-bieu";

/* ====== cấu hình ====== */
const THU_TRONG_TUAN = [
    {label: 'Thứ 2', value: 1},
    {label: 'Thứ 3', value: 2},
    {label: 'Thứ 4', value: 3},
    {label: 'Thứ 5', value: 4},
    {label: 'Thứ 6', value: 5},
    {label: 'Thứ 7', value: 6},
];

const SO_TIET = [
    {label: 'Tiết 1', value: 1, start: '07:00', end: '07:45'},
    {label: 'Tiết 2', value: 2, start: '07:50', end: '08:35'},
    {label: 'Tiết 3', value: 3, start: '08:40', end: '09:25'},
    {label: 'Tiết 4', value: 4, start: '09:35', end: '10:20'},
    {label: 'Tiết 5', value: 5, start: '10:25', end: '11:10'},
    {label: 'Tiết 1 (Chiều)', value: 6, start: '13:00', end: '13:45'},
    {label: 'Tiết 2 (Chiều)', value: 7, start: '13:50', end: '14:35'},
    {label: 'Tiết 3 (Chiều)', value: 8, start: '14:40', end: '15:25'},
    {label: 'Tiết 4 (Chiều)', value: 9, start: '15:35', end: '16:20'},
    {label: 'Tiết 5 (Chiều)', value: 10, start: '16:25', end: '17:10'},
];

/* ====== hiển thị 1 tiết (hôm nay / ngày mai) ====== */
function TietItem({item}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px dashed #eee"
            }}
        >
            <div>
                <b>Tiết {item.tietHoc}</b> – {item.tenMonHoc}
            </div>
            <Tag color={item.tietHoc <= 5 ? "blue" : "orange"}>
                {item.tietHoc <= 5 ? "Buổi sáng" : "Buổi chiều"}
            </Tag>
        </div>
    );
}

function TkbList({data, loading}) {
    if (loading) return <Spin/>;
    if (!data || data.length === 0) return <Empty description="Không có tiết học"/>;
    return data.map((item, idx) => <TietItem key={idx} item={item}/>);
}

/* ================= MAIN ================= */
export default function ThoiKhoaBieuTab() {
    const [loading, setLoading] = useState(true);
    const [tkbHomNay, setTkbHomNay] = useState([]);
    const [tkbNgayMai, setTkbNgayMai] = useState([]);
    const [tkbTuan, setTkbTuan] = useState([]);

    useEffect(() => {
        const fetchTkb = async () => {
            try {
                setLoading(true);
                const [hn, nm, all] = await Promise.all([
                    layTkbHomNay(),
                    layTkbNgayMai(),
                    layDsTkb()
                ]);
                setTkbHomNay(hn || []);
                setTkbNgayMai(nm || []);
                setTkbTuan(all || []);
            } finally {
                setLoading(false);
            }
        };
        fetchTkb();
    }, []);

    /* ====== map TKB tuần ====== */
    const mapTkb = useMemo(() => {
        const map = {};
        tkbTuan.forEach(i => {
            map[`${i.thuTrongTuan}-${i.tietHoc}`] = i;
        });
        return map;
    }, [tkbTuan]);


    return (
        <div>
            {/* ====== hôm nay & ngày mai ====== */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title={`📅 Hôm nay (${dayjs().format("DD/MM/YYYY")})`} bordered={false}>
                        <TkbList data={tkbHomNay} loading={loading}/>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title={`📆 Ngày mai (${dayjs().add(1, "day").format("DD/MM/YYYY")})`} bordered={false}>
                        <TkbList data={tkbNgayMai} loading={loading}/>
                    </Card>
                </Col>
            </Row>

            {/* ====== thời khóa biểu cả tuần (BẢNG) ====== */}
            <Card title="📖 Thời khóa biểu cả tuần" bordered={false} style={{marginTop: 16}}>
                <div style={{overflowX: "auto"}}>
                    <table style={{width: "100%", borderCollapse: "collapse", minWidth: 800}}>
                        <thead>
                        <tr>
                            <th style={thStyle}>Tiết</th>
                            {THU_TRONG_TUAN.map(t => (
                                <th key={t.value} style={thStyle}>{t.label}</th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {SO_TIET.map(tiet => (
                            <tr key={tiet.value}>
                                <td style={tdTietStyle}>{tiet.label}</td>

                                {THU_TRONG_TUAN.map(thu => {
                                    const cell = mapTkb[`${thu.value}-${tiet.value}`];

                                    return (
                                        <td
                                            key={thu.value}
                                            style={{
                                                ...tdStyle,
                                                background: "#fff",
                                                border: "1px solid #eee"
                                            }}
                                        >
                                            {cell ? (
                                                <div style={{fontWeight: 500, color: "#1677ff"}}>
                                                    {cell.tenMonHoc}
                                                </div>
                                            ) : (
                                                <span style={{color: "#bbb"}}>—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

/* ====== style ====== */
const thStyle = {
    border: "1px solid #eee",
    padding: 8,
    textAlign: "center",
    background: "#fafafa",
    fontWeight: 600,
    whiteSpace: "nowrap"
};

const tdStyle = {
    border: "1px solid #eee",
    padding: 8,
    textAlign: "center",
    minWidth: 120
};

const tdTietStyle = {
    ...tdStyle,
    fontWeight: 600,
    background: "#fafafa"
};
