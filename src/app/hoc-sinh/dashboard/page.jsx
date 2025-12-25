'use client';

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {App, Avatar, Card, Col, Descriptions, Grid, Row, Spin, Tabs} from "antd";
import {UserOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {layThongTinCaNhanHocSinh} from "@/services/auth";
import HuongNghiepLogTab from "@/app/hoc-sinh/dashboard/HuongNghiepLogTab";
import HollandTab from "@/app/hoc-sinh/dashboard/HollandTab";
import ThoiKhoaBieuTab from "@/app/hoc-sinh/dashboard/TkbTab";


export default function HocSinhDetailPage() {
    const {id} = useParams();
    const {message} = App.useApp();
    const screens = Grid.useBreakpoint();

    const [loading, setLoading] = useState(true);
    const [hocSinh, setHocSinh] = useState(null);

    /* ================= FETCH HỌC SINH ================= */
    useEffect(() => {
        const fetchHocSinh = async () => {
            setLoading(true);
            try {
                const res = await layThongTinCaNhanHocSinh();
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
            children: <HuongNghiepLogTab/>
        },
        {
            key: 'holland',
            label: 'Nhật ký làm bài Holland',
            children: <HollandTab/>
        },
        {
            key: 'tkb',
            label: 'Thời khóa biểu',
            children: <ThoiKhoaBieuTab/>
        }
    ];


    return (
        <Row gutter={[16, 16]}>
            {/* ================= RIGHT: THÔNG TIN CƠ BẢN ================= */}
            <Col xs={24} sm={24} md={8} lg={6}>
                <Card>
                    <div style={{textAlign: "center", marginBottom: 16}}>
                        <Avatar
                            size={screens.xs ? 80 : 100}
                            src={hocSinh.avatar}
                            icon={<UserOutlined/>}
                        />
                        <h3 style={{marginTop: 12, fontSize: screens.xs ? 16 : 18}}>
                            {hocSinh.hoTen}
                        </h3>
                        <div style={{fontSize: screens.xs ? 12 : 14, color: "#555"}}>
                            {hocSinh?.lop?.ten} – {hocSinh?.lop?.truong?.ten}
                        </div>
                    </div>

                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Ngày sinh">
                            {hocSinh.ngaySinh ? dayjs(hocSinh.ngaySinh).format("DD/MM/YYYY") : "--"}
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
            <Col xs={24} sm={24} md={16} lg={18}>
                <Card>
                    <Tabs
                        defaultActiveKey="nhat-ky"
                        items={tabItems}
                        tabPosition={screens.xs ? "top" : "left"}
                        style={{minHeight: 500}}
                    />
                </Card>
            </Col>
        </Row>
    );
}
