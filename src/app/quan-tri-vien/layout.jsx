'use client';

import {Avatar, Button, Dropdown, Layout, Menu, theme, Typography} from 'antd';
import {
    BarChartOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    TableOutlined,
    UsergroupAddOutlined,
    UserOutlined
} from '@ant-design/icons';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useModal} from "@/store/modal";

const {Sider, Header, Content} = Layout;

const roleTrans = {
    ADMIN: "Quản trị viên",
    TEACHER: "Giáo viên",
    STUDENT: "Học sinh",
};

const adminMenuItems = [
    {key: '/quan-tri-vien/dashboard', label: 'Dashboard', icon: <BarChartOutlined/>},

    {
        key: 'quan-ly-nguoi-dung',
        label: 'Quản lý người dùng',
        icon: <UsergroupAddOutlined/>,
        children: [
            {key: '/quan-tri-vien/giao-vien', label: 'Giáo viên'},
            {key: '/quan-tri-vien/hoc-sinh', label: 'Học sinh'},
        ],
    },

    {
        key: 'danh-muc',
        label: 'Quản lý danh mục',
        icon: <TableOutlined/>,
        children: [
            {key: '/quan-tri-vien/tinh', label: 'Tỉnh/Thành phố'},
            {key: '/quan-tri-vien/xa', label: 'Xã/Phường'},
            {key: '/quan-tri-vien/truong', label: 'Trường'},
            {key: '/quan-tri-vien/lop', label: 'Lớp'},
        ],
    },
];

export default function RootLayout({children}) {
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const router = useRouter();

    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();
    const {SetIsUpdatePassOpen} = useModal();

    // Fetch userInfo & auth check
    useEffect(() => {
        const info = JSON.parse(localStorage.getItem('userInfo') || "{}");

        if (!info?.role || info.role !== 'ADMIN') {
            router.replace('/login');
            return;
        }

        setUserInfo(info);
    }, [router]);

    if (!userInfo) return null; // tránh render trước khi có user

    const userRole = roleTrans[userInfo.role] || "Người dùng";
    const userName = userInfo.hoTen || "Người dùng";

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userInfo");
        router.push('/login');
    };

    const userMenu = (
        <Menu
            items={[
                {
                    key: "profile",
                    label: "Thông tin tài khoản",
                    icon: <UserOutlined/>,
                    onClick: () => alert("Thông tin tài khoản"),
                },
                {
                    key: "password",
                    label: "Đổi mật khẩu",
                    icon: <SafetyOutlined/>,
                    onClick: () => SetIsUpdatePassOpen(),
                },
                {
                    key: "logout",
                    label: "Đăng xuất",
                    icon: <LogoutOutlined/>,
                    onClick: handleLogout,
                },
            ]}
        />
    );

    return (
        <Layout>

            {/* SIDEBAR */}
            <Sider
                width={300}
                collapsible
                collapsed={collapsed}
                trigger={null}
                style={{
                    maxHeight: "100vh",
                    height: "100vh",
                    background: "white",
                    overflowY: "auto",
                }}
            >
                {!collapsed && (
                    <div className="text-black text-2xl pb-10 text-center p-2 font-black bg-white">
                        Sổ chủ nhiệm điện tử
                    </div>
                )}

                <Menu
                    style={{fontSize: 18}}
                    mode="inline"
                    items={adminMenuItems}
                    onClick={({key}) => key.startsWith("/") && router.push(key)}
                />
            </Sider>

            {/* MAIN CONTENT */}
            <Layout>

                {/* HEADER */}
                <Header
                    className="flex justify-between items-center"
                    style={{background: colorBgContainer, paddingLeft: 0}}
                >
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{fontSize: 16, width: 64, height: 64}}
                        />
                        <Typography.Text style={{fontSize: 18}}>
                            {userRole}
                        </Typography.Text>
                    </div>

                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar src={userInfo.avatar} size="large" icon={<UserOutlined/>}/>
                            <Typography.Text className="font-medium text-lg">
                                {userName}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                {/* PAGE CONTENT */}
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>

            </Layout>
        </Layout>
    );
}
