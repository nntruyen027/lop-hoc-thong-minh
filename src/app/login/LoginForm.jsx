'use client';

import {Button, Divider, Form, Input, Typography} from "antd";

export default function LoginForm({form, onLogin, onSwitch}) {
    return (
        <div style={{
            width: '100%',
            maxWidth: 400,
            margin: '0 auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxHeight: '90vh',
            overflowY: 'auto'
        }}>
            <Typography.Title level={2} style={{textAlign: 'center'}}>Đăng nhập</Typography.Title>

            <Form onFinish={onLogin} form={form} layout="vertical" size="middle" autoComplete="off">
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

                <Button type="primary" block htmlType={'submit'}>
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
