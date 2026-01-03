'use client';

import {Avatar, Badge, Button, Dropdown, Grid, Menu, Modal, Space} from "antd";
import {BellOutlined, LogoutOutlined, MenuOutlined, SafetyOutlined, UserOutlined} from "@ant-design/icons";
import {usePathname, useRouter} from "next/navigation";
import {useModal} from "@/store/modal";
import {useEffect, useState} from "react";
import {layThongTinCaNhanHocSinh} from "@/services/auth";
import {layDsThongBao, xemThongBao} from "@/services/hoc-sinh/thong-bao";
import useHocSinhOnline from "@/hook/useHocSinhOnline";
import {renderNoiDungWithLink} from "@/utils/valid";

export default function AppHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const {SetIsUpdatePassOpen, setIsEditOpen} = useModal();
    const screens = Grid.useBreakpoint();

    const [userInfo, setUserInfo] = useState(null);
    const [thongBao, setThongBao] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 11;
    const [openModal, setOpenModal] = useState(false);
    const [selectedThongBao, setSelectedThongBao] = useState(null);

    // ================= LOAD STUDENT =================
    useEffect(() => {
        let ignore = false;
        const loadStudent = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
                if (!localUser?.roles?.includes("STUDENT")) {
                    router.replace("/login");
                    return;
                }
                const student = await layThongTinCaNhanHocSinh();
                if (ignore) return;
                const merged = {...localUser, ...student};
                setUserInfo(merged);
                localStorage.setItem("userInfo", JSON.stringify(merged));
            } catch {
                router.replace("/login");
            }
        };
        loadStudent();
        return () => {
            ignore = true;
        };
    }, [setIsEditOpen]);

    useHocSinhOnline();

    // ================= LOAD THÔNG BÁO =================
    const loadThongBao = async (pageLoad = 1, append = false) => {
        if (!userInfo) return;
        const res = await layDsThongBao({page: pageLoad, limit: PAGE_SIZE});
        const data = res?.data || [];
        setThongBao(prev => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);
        const allData = append ? [...thongBao, ...data] : data;
        const unread = allData.filter(tb => !tb.ds_user_da_xem?.some(u => u.id === userInfo.id));
        setCount(unread.length);
    };

    useEffect(() => {
        if (userInfo) {
            setPage(1);
            loadThongBao(1, false);
        }
    }, [userInfo]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadThongBao(nextPage, true);
    };

    const handleClickThongBao = async tb => {
        setSelectedThongBao(tb);
        setOpenModal(true);
        const daXem = tb.ds_user_da_xem?.some(u => u.id === userInfo.id);
        if (!daXem) {
            await xemThongBao(tb.thongBaoId);
            setThongBao(prev => prev.map(item =>
                item.thongBaoId === tb.thongBaoId
                    ? {...item, ds_user_da_xem: [...(item.ds_user_da_xem || []), {id: userInfo.id}]}
                    : item
            ));
            setCount(c => Math.max(c - 1, 0));
        }
    };

    if (!userInfo) return null;

    // ================= MENU ITEMS =================
    const menuItems = [
        {key: "/hoc-sinh/dashboard", label: "Trang chủ"},
        {key: "/hoc-sinh/huong-nghiep", label: "Hướng nghiệp"},
        {key: "/hoc-sinh/holland", label: "Trắc nghiệm Holland"},
    ];

    const userMenuItems = [
        {key: "profile", label: "Thông tin tài khoản", icon: <UserOutlined/>, onClick: () => setIsEditOpen()},
        {key: "password", label: "Đổi mật khẩu", icon: <SafetyOutlined/>, onClick: () => SetIsUpdatePassOpen()},
        {
            key: "logout", label: "Đăng xuất", icon: <LogoutOutlined/>, onClick: () => {
                localStorage.clear();
                router.replace("/login");
            }
        },
    ];

    const mobileMenuItems = menuItems.map(i => ({...i, onClick: () => router.push(i.key)}));

    const thongBaoMenuItems = [
        {
            key: "list", label: (
                <div style={{width: screens.xs ? 280 : 340}}>
                    <div style={{maxHeight: 360, overflowY: "auto"}}>
                        {thongBao.map(tb => {
                            const daXem = tb.ds_user_da_xem?.some(u => u.id === userInfo.id);
                            return (
                                <div key={tb.thongBaoId} onClick={() => handleClickThongBao(tb)}
                                     style={{
                                         padding: 10,
                                         cursor: "pointer",
                                         background: daXem ? "#fff" : "#f6faff",
                                         fontWeight: daXem ? 400 : 600,
                                         borderBottom: "1px solid #f0f0f0"
                                     }}>
                                    <div>{tb.tieuDe}</div>
                                    <div style={{fontSize: 12, color: "#888"}}>
                                        {new Date(tb.thoiGianTao).toLocaleString()}
                                    </div>
                                    <div>{tb.noiDung.length > 40 ? tb.noiDung.slice(0, 40) + "…" : tb.noiDung}</div>
                                </div>
                            );
                        })}
                    </div>
                    {hasMore && (
                        <div onClick={e => {
                            e.stopPropagation();
                            handleLoadMore();
                        }}
                             style={{
                                 textAlign: "center",
                                 padding: 10,
                                 cursor: "pointer",
                                 fontWeight: 600,
                                 color: "#1677ff",
                                 borderTop: "1px solid #f0f0f0"
                             }}>
                            Tải thêm thông báo
                        </div>
                    )}
                </div>
            )
        },
    ];

    return (
        <>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: screens.xs ? "0 12px" : "0 16px",
                height: 64,
                gap: screens.xs ? 8 : 20
            }}>
                {/* Logo + Menu */}
                <div style={{display: "flex", alignItems: "center", gap: screens.xs ? 12 : 32, flex: 1}}>
                    <div style={{fontWeight: 600, fontSize: screens.xs ? 16 : 18, cursor: "pointer"}}
                         onClick={() => router.push("/hoc-sinh")}>
                        🎓 Homeroom
                    </div>

                    {!screens.xs ? (
                        <Menu mode="horizontal" selectedKeys={[pathname]} items={menuItems}
                              onClick={({key}) => router.push(key)} style={{flex: 1}}/>
                    ) : (
                        <Dropdown menu={{items: mobileMenuItems}} trigger={["click"]} placement="bottomLeft">
                            <Button icon={<MenuOutlined/>} type="text"/>
                        </Dropdown>
                    )}
                </div>

                {/* Notification + User */}
                <div style={{display: "flex", gap: screens.xs ? 12 : 20, alignItems: "center"}}>
                    <Dropdown trigger={["click"]} placement="bottomRight" menu={{items: thongBaoMenuItems}}>
                        <Badge count={count} overflowCount={10} size="small">
                            <BellOutlined style={{fontSize: screens.xs ? 18 : 20, cursor: "pointer"}}/>
                        </Badge>
                    </Dropdown>

                    <Dropdown menu={{items: userMenuItems}} trigger={["click"]} placement="bottomRight">
                        <Space style={{cursor: "pointer"}}>
                            <Avatar size={screens.xs ? 28 : 32} src={userInfo.avatar} icon={<UserOutlined/>}/>
                            {!screens.xs && <span>{userInfo.hoTen || "Học sinh"}</span>}
                        </Space>
                    </Dropdown>
                </div>
            </div>

            <Modal open={openModal} onCancel={() => setOpenModal(false)} footer={null} title={selectedThongBao?.tieuDe}>
                <div style={{color: "#888", fontSize: 12, marginBottom: 8}}>
                    {selectedThongBao && new Date(selectedThongBao.thoiGianTao).toLocaleString()}
                </div>
                <div style={{lineHeight: 1.6}}>
                    {renderNoiDungWithLink(selectedThongBao?.noiDung, router)}
                </div>

            </Modal>
        </>
    );
}
