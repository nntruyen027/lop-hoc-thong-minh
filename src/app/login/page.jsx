"use client";

import {Col, message, Row} from "antd";
import {useForm} from "antd/es/form/Form";
import {useState} from "react";
import {dangKyGiaoVien, login} from "@/services/auth";

import LoginCarousel from "./LoginCarousel";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import {useRouter} from "next/navigation";

export default function LoginPage() {

    const [api, contextHolder] = message.useMessage();
    const [formLogin] = useForm();
    const [formRegister] = useForm();
    const router = useRouter();

    const [isRegister, setIsRegister] = useState(false);

    const onFinishLogin = async () => {
        try {
            const {token, user} = await login(formLogin.getFieldValue()?.username, formLogin.getFieldValue()?.password);
            api.success("Đăng nhập thành công");
            if (user.role === 'TEACHER') {
                router.push("/giao-vien");
            } else if (user.role === 'ADMIN') {
                router.push("/quan-tri-vien/dashboard");
            } else {
                router.push("/hoc-sinh");
            }

        } catch (e) {
            api.error(e.message);
        }
    };

    const onFinishRegister = async () => {
        try {
            await dangKyGiaoVien(formRegister.getFieldValue());
            api.success("Đăng ký thành công");
            setIsRegister(false);
        } catch (e) {
            api.error(e.message);
        }
    };

    return (
        <>
            {contextHolder}

            <div
                style={{
                    width: "200%",
                    height: "100vh",
                    display: "flex",
                    transition: "transform 0.6s ease",
                    transform: isRegister ? "translateX(-50%)" : "translateX(0)"
                }}
            >

                {/* Layout 1 */}
                <div style={{width: "50%", height: "100vh"}}>
                    <Row style={{height: "100vh"}}>
                        <Col span={12} style={{padding: 0}}>
                            <LoginCarousel/>
                        </Col>

                        <Col span={12} style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <LoginForm
                                form={formLogin}
                                onLogin={onFinishLogin}
                                onSwitch={() => setIsRegister(true)}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Layout 2 */}
                <div style={{width: "50%", height: "100vh"}}>
                    <Row style={{height: "100vh"}}>
                        <Col span={12} style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            maxHeight: "100vh",
                            overflowY: "auto",

                        }}>
                            <RegisterForm
                                form={formRegister}
                                onRegister={onFinishRegister}
                                onSwitch={() => setIsRegister(false)}
                            />
                        </Col>

                        <Col span={12} style={{padding: 0}}>
                            <LoginCarousel/>
                        </Col>
                    </Row>
                </div>

            </div>
        </>
    );
}
