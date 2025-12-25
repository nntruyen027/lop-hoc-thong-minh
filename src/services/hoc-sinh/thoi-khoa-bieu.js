import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/hoc-sinh/thoi-khoa-bieu',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsTkb() {
    try {
        const res = await api.get()
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layTkbHomNay() {
    try {
        const res = await api.get(`lop/hom-nay`)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layTkbNgayMai() {
    try {
        const res = await api.get(`lop/ngay-mai`)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}