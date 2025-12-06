"use client";

import {Button, Divider, Form, Input, Typography} from "antd";

export default function LoginForm({form, onLogin, onSwitch}) {
    return (
        <div style={{width: '50%'}}>
            <Typography.Title>Đăng nhập</Typography.Title>

            <Form form={form} layout="vertical" size="large">
                <Form.Item
                    label="Tên tài khoản"
                    name="username"
                    rules={[{required: true, message: 'Vui lòng nhập tên tài khoản!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{required: true, message: 'Vui lòng nhập mật khẩu!'}]}
                >
                    <Input.Password/>
                </Form.Item>

                <Button type="primary" block onClick={onLogin}>
                    Đăng nhập
                </Button>

                <Divider>Hoặc</Divider>

                <Button block onClick={onSwitch}>
                    Đăng ký
                </Button>
            </Form>
        </div>
    );
}
