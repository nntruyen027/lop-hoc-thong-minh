"use client";

import {useEffect, useState} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {layLichSuLamBai} from "@/services/hoc-sinh/holland";
import {Card, Col, Divider, Row, Statistic} from "antd";
import hollandTypes from './y-nghia.json'


export default function HollandTab() {
    const [data, setData] = useState([]);


    useEffect(() => {
        async function fetchData() {
            try {
                const raw = await layLichSuLamBai();
                const formatted = raw.map(item => ({
                    ngay: new Date(item.ngayDanhGia).toLocaleDateString(),
                    R: item.diemR,
                    I: item.diemI,
                    A: item.diemA,
                    S: item.diemS,
                    E: item.diemE,
                    C: item.diemC,
                    maHolland: item.maHolland,
                }));
                setData(formatted);
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
    }, []);

    const stats = [
        {key: "A", color: "#73d13d"},
        {key: "C", color: "#13c2c2"},
        {key: "E", color: "#9254de"},
        {key: "I", color: "#40a9ff"},
        {key: "R", color: "#ff4d4f"},
        {key: "S", color: "#ffa940"},
    ];

    return (
        <div style={{width: "100%"}} className="flex flex-col gap-5">
            <div className={'text-center'}>
                <div
                    className={'font-extrabold text-8xl mb-4 text-shadow-2xs text-orange-500'}>{data?.[0]?.maHolland}</div>
                <div className={'w-full px-20 text-center '}>
                    {data?.[0]?.maHolland.split('').map(key =>
                        hollandTypes.find(h => h.key === key)
                    ).map((g, i) => (
                        <span key={i}>{g.description + " "}</span>

                    ))}
                </div>
            </div>
            <Divider/>
            <Row gutter={16} style={{marginBottom: 24}}>
                {stats.map((item) => {
                    console.log(data?.[0]?.[item.key]);
                    return (
                        <Col span={4} key={item.key}>
                            <Card
                                style={{
                                    background: item.color,
                                    textAlign: "center",
                                    borderRadius: 8,
                                }}
                            >
                                <Statistic
                                    title={<span
                                        style={{fontSize: 20, fontWeight: 700, color: "#fff"}}>{item.key}</span>}
                                    value={data?.[0]?.[item.key] ?? 0}

                                    precision={0}
                                />
                            </Card>
                        </Col>
                    )

                })}
            </Row>
            <Divider/>
            {/* Line Chart */}
            <div style={{width: "100%", height: 400}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="ngay"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Line type="monotone" dataKey="R" stroke="#ff4d4f"/>
                        <Line type="monotone" dataKey="I" stroke="#40a9ff"/>
                        <Line type="monotone" dataKey="A" stroke="#73d13d"/>
                        <Line type="monotone" dataKey="S" stroke="#ffa940"/>
                        <Line type="monotone" dataKey="E" stroke="#9254de"/>
                        <Line type="monotone" dataKey="C" stroke="#13c2c2"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
