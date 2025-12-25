import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/auth/bo-mon',
    headers: {
        "Content-Type": "application/json",
    }
});

export async function layDsBoMon({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}