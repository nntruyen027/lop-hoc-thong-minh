import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/quan-tri/truong',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsTruong({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function themTruong(truong) {
    try {
        const res = await api.post("", JSON.stringify(truong));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function suaTruong(id, truong) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(truong));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaTruong(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layFileImport(tinhId) {
    try {
        const response = await api.get("/importer/template/tinh/" + tinhId, {
            responseType: "blob",
        });

        // Tạo blob đúng loại file Excel
        const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);

        // Lấy tên file từ header
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "file_import.xlsx";

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match?.[1]) fileName = match[1];
        }

        // Tạo link tải xuống
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || "Tải file thất bại");
    }
}


export async function importTruong(formData) {
    try {
        // không dùng api.headers mặc định "Content-Type"
        const response = await axios.post(
            process.env.NEXT_PUBLIC_BE + '/quan-tri/truong/importer',
            formData,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
                }
            }
        );
        return response.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || "Lỗi import");
    }
}
