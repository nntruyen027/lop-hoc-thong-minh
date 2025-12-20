import api from "@/services/api";

export async function layDiemHollandCuaHs(hsId) {
    try {
        const res = await api.get(
            `/giao-vien/holland/hoc-sinh/${hsId}`
        );

        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "không thành công"
        );
    }
}

export async function thongKeKetQuanHollad(lopId) {
    try {
        const res = await api.get(
            `/giao-vien/holland/thong-ke/lop/${lopId}`
        );

        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "không thành công"
        );
    }
}

