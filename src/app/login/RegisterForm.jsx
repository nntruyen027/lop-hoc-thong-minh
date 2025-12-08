'use client';

import {Button, DatePicker, Divider, Form, Input, Radio, Select, Tabs, Typography} from "antd";
import {useEffect, useRef, useState} from "react";
import {getTinh, getXa} from "@/services/auth";
import {isStrongPassword} from "@/utils/valid";

export default function RegisterForm({form, onRegister, onSwitch}) {
    const [activeTab, setActiveTab] = useState("1");
    const [dsTinh, setDsTinh] = useState([]);
    const [dsXa, setDsXa] = useState([]);
    const [tinhId, setTinhId] = useState(null);
    const [searchTinh, setSearchTinh] = useState("");
    const [searchXa, setSearchXa] = useState("");
    const [tinhPagi, setTinhPagi] = useState({page: 1, limit: 20, total: 0});
    const [xaPagi, setXaPagi] = useState({page: 1, limit: 20, total: 0});
    const {Option} = Select;

    const searchTinhRef = useRef(null);
    const searchXaRef = useRef(null);

    // ---------------- FETCH DATA ----------------
    const fetchTinh = async (reset = false) => {
        const page = reset ? 1 : tinhPagi.page;
        const result = await getTinh(searchTinh, page, tinhPagi.limit);
        setDsTinh(reset ? result.dsTinh : [...dsTinh, ...result.dsTinh]);
        setTinhPagi({page, limit: tinhPagi.limit, total: result.total || 0});
    };

    const fetchXa = async (reset = false) => {
        if (!tinhId) return;
        const page = reset ? 1 : xaPagi.page;
        const result = await getXa(searchXa, tinhId, page, xaPagi.limit);
        setDsXa(reset ? result.dsXa : [...dsXa, ...result.dsXa]);
        setXaPagi({page, limit: xaPagi.limit, total: result.total || 0});
    };

    // ---------------- EFFECTS ----------------
    useEffect(() => {
        if (searchTinhRef.current) clearTimeout(searchTinhRef.current);
        searchTinhRef.current = setTimeout(() => fetchTinh(true), 300);
        return () => clearTimeout(searchTinhRef.current);
    }, [searchTinh]);

    useEffect(() => {
        if (searchXaRef.current) clearTimeout(searchXaRef.current);
        searchXaRef.current = setTimeout(() => fetchXa(true), 300);
        return () => clearTimeout(searchXaRef.current);
    }, [searchXa, tinhId]);

    useEffect(() => {
        if (tinhPagi.page > 1) fetchTinh();
    }, [tinhPagi.page]);
    useEffect(() => {
        if (xaPagi.page > 1) fetchXa();
    }, [xaPagi.page]);

    // ---------------- SCROLL ----------------
    const handleTinhScroll = (e) => {
        const t = e.target;
        if (t.scrollTop + t.offsetHeight >= t.scrollHeight - 5 && dsTinh.length < tinhPagi.total)
            setTinhPagi(prev => ({...prev, page: prev.page + 1}));
    };

    const handleXaScroll = (e) => {
        const t = e.target;
        if (t.scrollTop + t.offsetHeight >= t.scrollHeight - 5 && dsXa.length < xaPagi.total)
            setXaPagi(prev => ({...prev, page: prev.page + 1}));
    };

    // ---------------- VALIDATION ----------------
    const validateBasicTab = async () => {
        try {
            await form.validateFields(["hoTen", "ngaySinh", "laNam", "boMon", "chucVu", "tinhId", "xaId"]);
            return true;
        } catch {
            return false;
        }
    };

    const handleTabChange = async (key) => {
        if (key === "2" && !(await validateBasicTab())) return setActiveTab("1");
        setActiveTab(key);
    };

    const nextTab = async () => {
        if (await validateBasicTab()) setActiveTab("2");
    };

    const handleRegister = async () => {
        try {
            await form.validateFields();
            onRegister();
        } catch {
            const basicFields = ["hoTen", "ngaySinh", "laNam", "boMon", "chucVu", "tinhId", "xaId"];
            if (form.getFieldsError().some(f => basicFields.includes(f.name[0]) && f.errors.length > 0))
                setActiveTab("1");
        }
    };

    // ---------------- RENDER ----------------
    return (
        <div style={{
            width: "100%", maxWidth: 400, maxHeight: "100vh", overflowY: "auto",
            margin: "0 auto", padding: "16px 16px 32px", display: "flex",
            flexDirection: "column", scrollbarWidth: "none"
        }} className={'hide-scrollbar'}>
            <Typography.Title level={2}>Đăng ký</Typography.Title>
            <Form form={form} layout="vertical" size="middle" autoComplete="off">
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    {/* Thông tin cơ bản */}
                    <Tabs.TabPane tab="Thông tin cơ bản" key="1">
                        <Form.Item label="Họ tên" name="hoTen"
                                   rules={[{required: true, message: "Vui lòng nhập họ tên"}]}><Input/></Form.Item>
                        <Form.Item label="Ngày sinh" name="ngaySinh"
                                   rules={[{required: true, message: "Vui lòng nhập ngày sinh"}]}>
                            <DatePicker style={{width: "100%"}} placeholder="Nhập ngày sinh" format="DD/MM/YYYY"
                                        allowInput/>
                        </Form.Item>
                        <Form.Item label="Giới tính" name="laNam"
                                   rules={[{required: true, message: "Vui lòng chọn giới tính"}]}>
                            <Radio.Group><Radio value={true}>Nam</Radio><Radio value={false}>Nữ</Radio></Radio.Group>
                        </Form.Item>
                        <Form.Item label="Bộ môn" name="boMon"
                                   rules={[{required: true, message: "Vui lòng nhập bộ môn"}]}><Input/></Form.Item>
                        <Form.Item label="Chức vụ" name="chucVu"
                                   rules={[{required: true, message: "Vui lòng nhập chức vụ"}]}><Input/></Form.Item>
                        <Form.Item label="Tỉnh/Thành phố" name="tinhId"
                                   rules={[{required: true, message: "Vui lòng chọn tỉnh/thành phố"}]}>
                            <Select showSearch placeholder="Chọn tỉnh/thành phố" value={form.getFieldValue("tinhId")}
                                    onChange={(val) => {
                                        setTinhId(val);
                                        form.setFieldsValue({xaId: null});
                                        setDsXa([]);
                                        setXaPagi({page: 1, limit: 20, total: 0});
                                    }}
                                    onSearch={setSearchTinh} filterOption={false} notFoundContent={null}
                                    dropdownStyle={{maxHeight: 200, overflowY: "auto"}}
                                    onPopupScroll={handleTinhScroll}>
                                {dsTinh.map(t => <Option key={t.id} value={t.id}>{t.ten}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Xã/Phường" name="xaId"
                                   rules={[{required: true, message: "Vui lòng chọn xã/phường"}]}>
                            <Select showSearch placeholder="Chọn xã/phường" value={form.getFieldValue("xaId")}
                                    disabled={!dsXa.length}
                                    onSearch={setSearchXa} filterOption={false} notFoundContent={null}
                                    dropdownStyle={{maxHeight: 200, overflowY: "auto"}}
                                    onPopupScroll={handleXaScroll}>
                                {dsXa.map(x => <Option key={x.id} value={x.id}>{x.ten}</Option>)}
                            </Select>
                        </Form.Item>
                        <Button type="primary" block onClick={nextTab}>Tiếp tục</Button>
                    </Tabs.TabPane>

                    {/* Thông tin đăng nhập */}
                    <Tabs.TabPane tab="Thông tin đăng nhập" key="2">
                        <Form.Item label="Tên tài khoản" name="username" rules={[{
                            required: true,
                            message: "Vui lòng nhập tên tài khoản"
                        }]}><Input/></Form.Item>
                        <Form.Item label="Mật khẩu" name="password" rules={[
                            {required: true, message: "Vui lòng nhập mật khẩu"},
                            () => ({
                                validator(_, value) {
                                    if (!value || isStrongPassword(value)) return Promise.resolve();
                                    return Promise.reject(new Error("Mật khẩu phải ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."));
                                }
                            })
                        ]}><Input.Password/></Form.Item>
                        <Form.Item label="Nhập lại mật khẩu" name="repeatPass" dependencies={["password"]} rules={[
                            {required: true, message: "Vui lòng nhập lại mật khẩu"},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) return Promise.resolve();
                                    return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
                                }
                            })
                        ]}><Input.Password/></Form.Item>
                        <Button type="primary" block onClick={handleRegister}>Đăng ký</Button>
                    </Tabs.TabPane>
                </Tabs>
                <Divider>Hoặc</Divider>
                <Button block onClick={onSwitch}>Quay lại đăng nhập</Button>
            </Form>
        </div>
    );
}
