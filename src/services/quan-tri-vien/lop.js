import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/quan-tri/lop',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});


export async function suaLop(id, lop) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(lop));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaLop(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}
