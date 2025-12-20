'use client';

import {Avatar, Badge, Dropdown, Menu, Modal, Space} from "antd";
import {BellOutlined, LogoutOutlined, SafetyOutlined, UserOutlined} from "@ant-design/icons";
import {usePathname, useRouter} from "next/navigation";
import {useModal} from "@/store/modal";
import {useEffect, useState} from "react";
import {layThongTinCaNhanHocSinh} from "@/services/auth";
import {layDsThongBao, xemThongBao} from "@/services/hoc-sinh/thong-bao";

export default function AppHeader() {
    const router = useRouter();
    const pathname = usePathname();

    const {SetIsUpdatePassOpen, setIsEditOpen, isEditOpen} = useModal();

    const [userInfo, setUserInfo] = useState(null);

    const [thongBao, setThongBao] = useState([]);
    const [count, setCount] = useState(0);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 11;

    const [openModal, setOpenModal] = useState(false);
    const [selectedThongBao, setSelectedThongBao] = useState(null);

    /* ================= MENU ================= */
    const menuItems = [
        {key: "/hoc-sinh/dashboard", label: "Trang chủ"},
        {key: "/hoc-sinh/huong-nghiep", label: "Hướng nghiệp"},
        {key: "/hoc-sinh/holland", label: "Trắc nghiệm Holland"},
    ];

    const userMenuItems = [
        {
            key: "profile",
            label: "Thông tin tài khoản",
            icon: <UserOutlined/>,
            onClick: () => setIsEditOpen(),
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
            onClick: () => {
                localStorage.clear();
                router.replace("/login");
            },
        },
    ];

    /* ================= LOAD STUDENT ================= */
    useEffect(() => {
        let ignore = false;

        const loadStudent = async () => {
            try {
                const localUser = JSON.parse(
                    localStorage.getItem("userInfo") || "{}"
                );

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
    }, [router, isEditOpen]);

    /* ================= LOAD THÔNG BÁO ================= */
    const loadThongBao = async (pageLoad = 1, append = false) => {
        const res = await layDsThongBao({
            page: pageLoad,
            limit: PAGE_SIZE,
        });

        const data = res?.data || [];

        setThongBao((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);

        const allData = append ? [...thongBao, ...data] : data;
        const unread = allData.filter(
            (tb) =>
                !tb.ds_user_da_xem?.some((u) => u.id === userInfo.id)
        );

        setCount(unread.length);
    };

    useEffect(() => {
        if (!userInfo) return;
        setPage(1);
        loadThongBao(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]);

    /* ================= LOAD MORE ================= */
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadThongBao(nextPage, true);
    };

    if (!userInfo) return null;

    /* ================= CLICK THÔNG BÁO ================= */
    const handleClickThongBao = async (tb) => {
        setSelectedThongBao(tb);
        setOpenModal(true);

        const daXem = tb.ds_user_da_xem?.some(
            (u) => u.id === userInfo.id
        );

        if (!daXem) {
            await xemThongBao(tb.thongBaoId);

            setThongBao((prev) =>
                prev.map((item) =>
                    item.thongBaoId === tb.thongBaoId
                        ? {
                            ...item,
                            ds_user_da_xem: [
                                ...(item.ds_user_da_xem || []),
                                {id: userInfo.id},
                            ],
                        }
                        : item
                )
            );

            setCount((c) => Math.max(c - 1, 0));
        }
    };

    /* ================= DROPDOWN ITEMS ================= */
    const thongBaoMenuItems = [
        {
            key: "list",
            label: (
                <div style={{width: 340}}>
                    {/* LIST */}
                    <div
                        style={{
                            maxHeight: 360,
                            overflowY: "auto",
                        }}
                    >
                        {thongBao.map((tb) => {
                            const daXem = tb.ds_user_da_xem?.some(
                                (u) => u.id === userInfo.id
                            );

                            return (
                                <div
                                    key={tb.thongBaoId}
                                    onClick={() =>
                                        handleClickThongBao(tb)
                                    }
                                    style={{
                                        padding: 10,
                                        cursor: "pointer",
                                        background: daXem
                                            ? "#fff"
                                            : "#f6faff",
                                        fontWeight: daXem ? 400 : 600,
                                        borderBottom:
                                            "1px solid #f0f0f0",
                                    }}
                                >
                                    <div>{tb.tieuDe}</div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#888",
                                        }}
                                    >
                                        {new Date(
                                            tb.thoiGianTao
                                        ).toLocaleString()}
                                    </div>
                                    <div>
                                        {tb.noiDung.length > 40
                                            ? tb.noiDung.slice(0, 40) +
                                            "…"
                                            : tb.noiDung}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* LOAD MORE */}
                    {hasMore && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();   // 🔥 QUAN TRỌNG
                                handleLoadMore();
                            }}
                            style={{
                                textAlign: "center",
                                padding: 10,
                                cursor: "pointer",
                                fontWeight: 600,
                                color: "#1677ff",
                                borderTop:
                                    "1px solid #f0f0f0",
                            }}
                        >
                            Tải thêm thông báo
                        </div>
                    )}
                </div>
            ),
        },
    ];

    /* ================= RENDER ================= */
    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    height: 64,
                }}
            >
                {/* LEFT */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 32,
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 18,
                            cursor: "pointer",
                        }}
                        onClick={() => router.push("/hoc-sinh")}
                    >
                        🎓 Homeroom
                    </div>

                    <Menu
                        mode="horizontal"
                        selectedKeys={[pathname]}
                        items={menuItems}
                        onClick={({key}) => router.push(key)}
                        style={{flex: 1}}
                    />
                </div>

                {/* RIGHT */}
                <div
                    style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "center",
                    }}
                >
                    <Dropdown
                        trigger={["click"]}
                        placement="bottomRight"
                        menu={{items: thongBaoMenuItems}}
                    >
                        <Badge
                            count={count}
                            overflowCount={10}
                            size="small"
                        >
                            <BellOutlined
                                style={{
                                    fontSize: 20,
                                    cursor: "pointer",
                                }}
                            />
                        </Badge>
                    </Dropdown>

                    <Dropdown
                        menu={{items: userMenuItems}}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Space style={{cursor: "pointer"}}>
                            <Avatar
                                src={userInfo.avatar}
                                icon={<UserOutlined/>}
                            />
                            <span>
                                {userInfo.hoTen || "Học sinh"}
                            </span>
                        </Space>
                    </Dropdown>
                </div>
            </div>

            {/* MODAL CHI TIẾT */}
            <Modal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                footer={null}
                title={selectedThongBao?.tieuDe}
            >
                <div
                    style={{
                        color: "#888",
                        fontSize: 12,
                        marginBottom: 8,
                    }}
                >
                    {selectedThongBao &&
                        new Date(
                            selectedThongBao.thoiGianTao
                        ).toLocaleString()}
                </div>
                <div>{selectedThongBao?.noiDung}</div>
            </Modal>
        </>
    );
}
