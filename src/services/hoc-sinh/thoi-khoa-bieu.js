import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/hoc-sinh/thoi-khoa-bieu',
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
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