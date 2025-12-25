'use client';

import {Avatar, Button, Dropdown, Layout, Menu, theme, Typography} from 'antd';
import {
    BarChartOutlined,
    ClockCircleOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    SnippetsOutlined,
    UserOutlined,
    WechatOutlined
} from '@ant-design/icons';
import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useModal} from "@/store/modal";
import {layThongTinCaNhanGiaoVien} from "@/services/auth";

const {Sider, Header, Content} = Layout;

export default function RootLayout({children}) {
    const router = useRouter();
    const {token} = theme.useToken();
    const {setIsEditOpen, SetIsUpdatePassOpen, isEditOpen} = useModal();

    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const adminMenuItems = [
        {key: '/giao-vien/dashboard', label: 'Dashboard', icon: <BarChartOutlined/>},

        {
            key: 'chu-nhiem',
            label: 'Chủ nhiệm',
            icon: <SnippetsOutlined/>,
            children: [
                {key: '/giao-vien/lop', label: 'Lớp'},
                {key: '/giao-vien/hoc-sinh', label: 'Học sinh'},
                {key: '/giao-vien/thoi-khoa-bieu', label: 'Thời khóa biểu'},
            ],
        },
        {
            key: 'hoat-dong',
            label: 'Hoạt động',
            icon: <ClockCircleOutlined/>,
            children: [
                {key: '/giao-vien/hoat-dong-huong-nghiep', label: 'Hướng nghiệp'},
            ],
        },
        {
            key: 'lien-he',
            label: 'Liên hệ',
            icon: <WechatOutlined/>,
            children: [
                {key: '/giao-vien/thong-bao', label: 'Thông báo'},
            ],
        }
    ]

    /* ================= FETCH + MERGE CHUẨN ================= */
    const loadUserInfo = useCallback(async () => {
        const localUser = JSON.parse(localStorage.getItem("userInfo") || "{}");

        // ⛔ auth guard
        if (!localUser?.roles?.includes("TEACHER")) {
            router.replace("/login");
            return;
        }

        // ✅ LẤY DATA TRỰC TIẾP
        const teacherInfo = await layThongTinCaNhanGiaoVien();

        // ✅ MERGE NGAY TẠI ĐÂY
        const mergedUser = {
            ...localUser,
            ...teacherInfo,
        };

        setUserInfo(mergedUser);
        localStorage.setItem("userInfo", JSON.stringify(mergedUser));
    }, [router]);

    useEffect(() => {
        loadUserInfo();
    }, [loadUserInfo, isEditOpen]);

    if (!userInfo) return null;

    /* ================= ACTION ================= */
    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const userMenuItems = [
        {
            key: "profile",
            label: "Thông tin tài khoản",
            icon: <UserOutlined/>,
            onClick: () => setIsEditOpen(true),
        },
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <SafetyOutlined/>,
            onClick: () => SetIsUpdatePassOpen(true),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined/>,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Sider
                width={280}
                collapsible
                collapsed={collapsed}
                trigger={null}
                style={{background: "#fff"}}
            >
                {!collapsed && (
                    <div className="text-2xl font-bold text-center py-4">
                        Sổ chủ nhiệm điện tử
                    </div>
                )}

                <Menu
                    mode="inline"
                    items={adminMenuItems}
                    onClick={({key}) => router.push(key)}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: token.colorBgContainer,
                        padding: "0 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div className={'p-0'}>
                        <Button

                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                        <Typography.Text>Giáo viên</Typography.Text>
                    </div>


                    <Dropdown menu={{items: userMenuItems}} placement="bottomRight">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar src={userInfo.avatar} icon={<UserOutlined/>}/>
                            <Typography.Text strong>
                                {userInfo.hoTen}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: 16,
                        padding: 24,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
