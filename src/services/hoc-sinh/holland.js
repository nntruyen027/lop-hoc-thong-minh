import api from "@/services/api";

export async function lamBaiHolland(body) {
    try {
        const res = await api.post(
            "/hoc-sinh/holland",
            body
        );

        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Làm bài không thành công"
        );
    }
}

export async function layLichSuLamBai() {
    try {
        const res = await api.get(
            "/hoc-sinh/holland"
        );

        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Lấy không thành công"
        );
    }
}

