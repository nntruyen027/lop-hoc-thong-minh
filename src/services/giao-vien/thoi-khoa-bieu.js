import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/thoi-khoa-bieu/lop/',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsTkb(id) {
    try {
        const res = await api.get(`${id}`)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function themTkb(id, body) {
    try {
        const res = await api.post(`${id}`, JSON.stringify(body));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaTkb(id, thu, tiet) {
    try {
        await api.delete(`${id}/thu/${thu}/tiet/${tiet}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layTkbHomNay(id) {
    try {
        const res = await api.get(`${id}/hom-nay`)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layTkbNgayMai(id) {
    try {
        const res = await api.get(`${id}/ngay-mai`)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}