'use client';

import {Card, Col, Divider, Row, Select, Statistic} from "antd";
import {useEffect, useState} from "react";
import {layStatisticGiaoVien} from "@/services/auth";
import {useTruongLopSelect} from "@/hook/useTruongLop";
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {thongKeKetQuanHollad} from "@/services/giao-vien/holland";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#8884D8'];
const descriptions = [
    {name: 'R', color: COLORS[0], desc: 'Realistic – Thực tế, thích làm việc với vật chất, máy móc, kỹ thuật'},
    {name: 'I', color: COLORS[1], desc: 'Investigative – Phân tích, nghiên cứu, giải quyết vấn đề'},
    {name: 'A', color: COLORS[2], desc: 'Artistic – Sáng tạo, nghệ thuật, biểu đạt cá nhân'},
    {name: 'S', color: COLORS[3], desc: 'Social – Giúp đỡ người khác, giáo dục, tư vấn'},
    {name: 'E', color: COLORS[4], desc: 'Enterprising – Lãnh đạo, kinh doanh, thuyết phục'},
    {name: 'C', color: COLORS[5], desc: 'Conventional – Tuân thủ, quản lý, tổ chức, văn phòng'},
];

export default function Page() {
    const [data, setData] = useState();
    const [lopId, setLopId] = useState();
    const [tkHollander, setTkHollander] = useState([]);

    const {
        dsTruong,
        setSearchTruong,
        setTruongPagi,
        truongPagi,
        lopPagi,
        setLopPagi,
        dsLop,
        setSearchLop,
        setTruongId,
        truongId
    } = useTruongLopSelect();

    useEffect(() => {
        const fetchStatistic = async () => {
            try {
                const sta = await layStatisticGiaoVien();
                setData(sta);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStatistic();
    }, []);

    useEffect(() => {
        const fetchHolland = async () => {
            try {
                const hld = await thongKeKetQuanHollad(lopId);
                setTkHollander([
                    {name: 'R', value: hld.top2R},
                    {name: 'I', value: hld.top2I},
                    {name: 'A', value: hld.top2A},
                    {name: 'S', value: hld.top2S},
                    {name: 'E', value: hld.top2E},
                    {name: 'C', value: hld.top2C},
                ]);
            } catch (err) {
                console.error(err);
            }
        };
        if (lopId) {
            fetchHolland();
        }
    }, [lopId]);

    return (
        <div style={{padding: 20, background: '#f0f2f5'}}>
            {/* Thống kê tổng quan */}
            <Row gutter={[20, 20]}>
                {[
                    {title: "Tuần học hiện tại", value: data?.tuanHocHienTai || 0, color: '#1890ff'},
                    {title: "Số hoạt động hướng nghiệp", value: data?.tongSoHdhn || 0, color: '#52c41a'},
                    {title: "Số học sinh", value: data?.tongSoHsCn || 0, color: '#faad14'},
                    {title: "Số lớp", value: data?.tongSoLopCn || 0, color: '#eb2f96'},
                ].map((item, idx) => (
                    <Col key={idx} xs={24} sm={12} md={8} lg={6}>
                        <Card bordered={false} style={{borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                            <Statistic
                                title={<span style={{color: item.color, fontWeight: 600}}>{item.title}</span>}
                                value={item.value}
                                valueStyle={{fontSize: 24, fontWeight: 700}}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Divider/>
            {/* Chọn trường & lớp */}
            <Row gutter={[20, 20]} style={{marginTop: 20, marginBottom: 20}}>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        showSearch
                        allowClear
                        style={{width: '100%'}}
                        placeholder="Chọn trường"
                        onPopupScroll={e => {
                            if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                setTruongPagi(p => ({...p, page: p.page + 1}));
                        }}
                        onSearch={setSearchTruong}
                        onChange={val => {
                            setTruongId(val);
                            if (!val) setLopId(null);
                        }}
                        filterOption={false}
                    >
                        {dsTruong?.map(t => (
                            <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        showSearch
                        allowClear
                        style={{width: '100%'}}
                        disabled={!truongId}
                        placeholder="Chọn lớp"
                        value={lopId}
                        onPopupScroll={e => {
                            if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                setLopPagi(p => ({...p, page: p.page + 1}));
                        }}
                        onSearch={setSearchLop}
                        onChange={val => setLopId(val)}
                        filterOption={false}
                    >
                        {dsLop?.map(t => (
                            <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                        ))}
                    </Select>
                </Col>
            </Row>


            {/* Biểu đồ Holland + mô tả */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12}>
                    <Card bordered={false}
                          style={{borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                        <h3 style={{textAlign: 'center', marginBottom: 20}}>Thống kê nhóm Holland</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={tkHollander}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {tkHollander?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip formatter={value => `${value} học sinh`}/>
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false}
                          style={{borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                        <h3 style={{textAlign: 'center', marginBottom: 20}}>Mô tả nhóm nghề</h3>
                        {descriptions.map(item => (
                            <Card
                                key={item.name}
                                size="small"
                                style={{
                                    marginBottom: 12,
                                    borderLeft: `5px solid ${item.color}`,
                                    background: '#fafafa',
                                    borderRadius: 8,
                                }}
                            >
                                <h4 style={{marginBottom: 5}}>{item.name} - {item.desc.split('–')[0]}</h4>
                                <p style={{margin: 0, color: '#555'}}>{item.desc.split('–')[1]}</p>
                            </Card>
                        ))}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
