'use client';
import {Avatar, Button, Dropdown, Layout, Menu, theme, Typography} from 'antd'
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
import Sider from "antd/es/layout/Sider";
import {Content, Header} from "antd/es/layout/layout";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

const roleTrans = {
    'ADMIN': 'Quản trị viên',
    'TEACHER': 'Giáo viên',
    'STUDENT': 'Học sinh'
}

const items = [
    {
        key: '/quan-tri-vien/dashboard',
        label: 'Dashboard',
        icon: <BarChartOutlined/>,
    },
    {
        key: 'quan-ly-nguoi-dung',
        label: 'Quản lý người dùng',
        icon: <UsergroupAddOutlined/>,
        children: [
            {key: '/quan-tri-vien/giao-vien', label: 'Giáo viên'},
            {key: '/quan-tri-vien/hoc-sinh', label: 'Học sinh'}
        ]
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
        ]
    }
];

export default function RootLayout({children}) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    useEffect(() => {
        const role = JSON.parse(localStorage.getItem('userInfo'))?.role || '';
        if (role != 'ADMIN') {
            router.replace('/login');
        }
    }, []);

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
    const userRole = roleTrans[userInfo.role] || 'Người dùng';
    const userName = userInfo.hoTen || 'Người dùng';

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined/>} onClick={() => alert('Thông tin tài khoản')}>
                Thông tin tài khoản
            </Menu.Item>
            <Menu.Item key="password" icon={<SafetyOutlined/>} onClick={() => alert('Đổi mật khẩu')}>
                Đổi mật khẩu
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined/>} onClick={() => {
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("userInfo");
                router.push('/login');
            }}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout>
            <Sider width={300} style={{maxHeight: '100vh', height: '100vh', background: 'white', overflowY: 'auto'}}
                   trigger={null} collapsible collapsed={collapsed}>
                <div
                    className={`text-black text-2xl pb-10 text-center p-2 font-black bg-white ${collapsed ? 'hidden' : ''}`}>
                    Hệ thống quản lý<br/>trường học<br/>thông minh
                </div>
                <Menu
                    style={{fontSize: '18px'}}
                    defaultSelectedKeys={['menu-1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    onClick={({key}) => {
                        if (key.startsWith('/')) router.push(key);
                    }}
                    items={items}
                />
            </Sider>
            <Layout>
                <Header className="flex justify-between items-center pl-0 pr-4"
                        style={{paddingLeft: 0, background: colorBgContainer}}>
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{fontSize: '16px', width: 64, height: 64}}
                        />
                        <Typography.Text style={{fontSize: '18px'}}>{userRole}</Typography.Text>
                    </div>

                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar size="large" src={userInfo.avatar} icon={<UserOutlined/>}/>
                            <Typography.Text className="font-medium text-lg">{userName}</Typography.Text>
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{
                    margin: '24px 16px',
                    padding: 24,
                    minHeight: 280,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
