'use client';

import {Col, message, Row} from "antd";
import {useForm} from "antd/es/form/Form";
import {useEffect, useState} from "react";
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
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Detect screen size
    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth <= 471);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const onFinishLogin = async () => {
        try {
            const {token, user} = await login(formLogin.getFieldValue()?.username, formLogin.getFieldValue()?.password);
            api.success("Đăng nhập thành công");
            if (user.role === 'TEACHER') router.push("/giao-vien");
            else if (user.role === 'ADMIN') router.push("/quan-tri-vien/dashboard");
            else router.push("/hoc-sinh");
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

    if (isSmallScreen) {
        return (
            <>
                {contextHolder}
                <div
                    style={{
                        height: "100vh",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 16,
                        boxSizing: "border-box",
                        background: "#f5f5f5",
                    }}
                >
                    {/* scroll container */}
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 400,
                            maxHeight: "100%",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center", // nếu form nhỏ vẫn căn giữa
                        }}
                    >
                        {isRegister ? (
                            <RegisterForm
                                form={formRegister}
                                onRegister={onFinishRegister}
                                onSwitch={() => setIsRegister(false)}
                            />
                        ) : (
                            <LoginForm
                                form={formLogin}
                                onLogin={onFinishLogin}
                                onSwitch={() => setIsRegister(true)}
                            />
                        )}
                    </div>
                </div>
            </>
        );
    }


    const containerWidth = "200%";
    const translateX = isRegister ? "-50%" : "0";

    return (
        <>
            {contextHolder}
            <div
                style={{
                    width: containerWidth,
                    height: "100vh",
                    display: "flex",
                    transition: "transform 0.6s ease",
                    transform: `translateX(${translateX})`,
                }}
            >
                {/* Login Panel */}
                <div style={{width: "50%", height: "100vh"}}>
                    <Row style={{height: "100vh"}}>
                        <Col span={12} style={{padding: 0}}>
                            <LoginCarousel/>
                        </Col>
                        <Col span={12} style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            maxHeight: "100vh",
                            overflowY: "auto"
                        }}>
                            <LoginForm
                                form={formLogin}
                                onLogin={onFinishLogin}
                                onSwitch={() => setIsRegister(true)}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Register Panel */}
                <div style={{width: "50%", height: "100vh"}}>
                    <Row style={{height: "100vh"}}>
                        <Col span={12} style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            maxHeight: "100vh",
                            overflowY: "auto"
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
