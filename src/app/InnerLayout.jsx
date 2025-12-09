"use client";

import {App, Button, Form, Input, Modal} from "antd";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {useModal} from "@/store/modal";
import {doiMatKhau} from "@/services/auth";
import {isTokenValid} from "@/utils/auth";
import {isStrongPassword} from "@/utils/valid";

export default function InnerLayout({children}) {
    const {message} = App.useApp();      // ✔ NOW WORKS — bên trong <App>
    const router = useRouter();
    const pathname = usePathname();
    const {isUpdatePassOpen, SetIsUpdatePassClose} = useModal();
    const [passForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        try {
            const values = await passForm.validateFields();
            setLoading(true);

            await doiMatKhau(values);

            message.success("Đổi mật khẩu thành công!");
            passForm.resetFields();
            SetIsUpdatePassClose();
        } catch (err) {
            message.error(
                err?.response?.data?.message ||
                err?.message ||
                "Có lỗi xảy ra"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await isTokenValid();

            if (!valid && pathname !== "/login") {
                router.replace("/login");
                return;
            }

            if (valid && pathname === "/login") {
                const user = JSON.parse(localStorage.getItem("userInfo"));
                if (!user) return;

                if (user.role === "ADMIN") router.replace("/quan-tri-vien/dashboard");
                else if (user.role === "TEACHER") router.replace("/giao-vien/dashboard");
                else router.replace("/hoc-sinh/dashboard");
            }
        };

        checkAuth();
    }, [pathname, router]);

    return (
        <>
            <Modal
                title="Đổi mật khẩu"
                open={isUpdatePassOpen}
                onCancel={SetIsUpdatePassClose}
                footer={[
                    <Button key="cancel" onClick={SetIsUpdatePassClose}>
                        Hủy
                    </Button>,
                    <Button
                        key="ok"
                        type="primary"
                        loading={loading}
                        onClick={handleUpdatePassword}
                    >
                        Cập nhật
                    </Button>
                ]}
            >
                <Form form={passForm} layout="vertical">
                    <Form.Item
                        label="Mật khẩu cũ"
                        name="oldPass"
                        rules={[{required: true}]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPass"
                        rules={[
                            {required: true},
                            () => ({
                                validator(_, value) {
                                    if (!value || isStrongPassword(value)) return Promise.resolve();
                                    return Promise.reject(
                                        new Error("Mật khẩu phải ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.")
                                    );
                                }
                            })
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="repeatNewPass"
                        dependencies={["newPass"]}
                        rules={[
                            {required: true},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPass") === value)
                                        return Promise.resolve();
                                    return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
                                }
                            })
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>
                </Form>
            </Modal>

            {children}
        </>
    );
}
