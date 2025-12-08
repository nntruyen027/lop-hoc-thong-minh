import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/quan-tri/giao-vien',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsGiaoVien({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layDsLopCuaGiaoVien({search, page, limit}) {
    try {
        const res = await api.get(`/${id}/lop`, {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function suaGiaoVien(id, body) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(body));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaGiaoVien(id) {
    try {
        await api.delete(`/${id}`);

    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}


export async function resetPassWord(id, newPass) {
    try {
        const res = await api.put(`/password/${id}`, JSON.stringify({
            "newPass": newPass,
        }));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}
