'use client';

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {App, Avatar, Card, Col, Descriptions, Row, Spin, Tabs} from "antd";
import {UserOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

import {layHocSinhTheoId} from "@/services/giao-vien/hoc-sinh";
import HuongNghiepLogTab from "@/app/giao-vien/hoc-sinh/[id]/HuongNghiepLogTab";
import HollandTab from "@/app/giao-vien/hoc-sinh/[id]/HollandTab";

export default function HocSinhDetailPage() {
    const {id} = useParams();
    const {message} = App.useApp();

    const [loading, setLoading] = useState(true);
    const [hocSinh, setHocSinh] = useState(null);


    /* ================= FETCH HỌC SINH ================= */
    useEffect(() => {
        if (!id) return;

        const fetchHocSinh = async () => {
            setLoading(true);
            try {
                const res = await layHocSinhTheoId(id);
                setHocSinh(res);
            } catch {
                message.error("Không lấy được hồ sơ học sinh");
            } finally {
                setLoading(false);
            }
        };

        fetchHocSinh();
    }, [id]);

    /* ================= LOADING ================= */
    if (loading) {
        return (
            <div style={{textAlign: "center", padding: 50}}>
                <Spin size="large"/>
            </div>
        );
    }

    if (!hocSinh) return null;

    /* ================= TAB ITEMS ================= */
    const tabItems = [
        {
            key: 'nhat-ky',
            label: 'Nhật ký hướng nghiệp',
            children: (
                <>

                    <HuongNghiepLogTab
                        hocSinhId={id}
                    />

                </>
            )
        },
        {
            key: 'holland',
            label: 'Nhật ký Holland',
            children: (
                <>

                    <HollandTab hsId={id}/>
                </>
            )
        }
    ];

    return (
        <Row gutter={16}>
            {/* ================= RIGHT: THÔNG TIN CƠ BẢN ================= */}
            <Col span={6}>
                <Card>
                    <div style={{textAlign: "center", marginBottom: 16}}>
                        <Avatar
                            size={100}
                            src={hocSinh.avatar}
                            icon={<UserOutlined/>}
                        />
                        <h3 style={{marginTop: 12}}>
                            {hocSinh.hoTen}
                        </h3>
                        <div>
                            {hocSinh?.lop?.ten} – {hocSinh?.lop?.truong?.ten}
                        </div>
                    </div>

                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Ngày sinh">
                            {hocSinh.ngaySinh
                                ? dayjs(hocSinh.ngaySinh).format("DD/MM/YYYY")
                                : "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {hocSinh.laNam ? "Nam" : "Nữ"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tỉnh/Thành phố">
                            {hocSinh?.xa?.tinh?.ten || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Xã/phường">
                            {hocSinh?.xa?.ten || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ chi tiết">
                            {hocSinh.diaChiChiTiet || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sở thích">
                            {hocSinh.soThich || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Môn học yêu thích">
                            {hocSinh.monHocYeuThich || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm mạnh">
                            {hocSinh.diemManh || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm yếu">
                            {hocSinh.diemYeu || "--"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>

            {/* ================= LEFT: NỘI DUNG CHÍNH ================= */}
            <Col span={16}>
                <Card>
                    <Tabs defaultActiveKey="nhat-ky" items={tabItems}/>
                </Card>
            </Col>
        </Row>
    );
}
