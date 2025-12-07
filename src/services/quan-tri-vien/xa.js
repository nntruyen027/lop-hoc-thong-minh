import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/quan-tri/xa',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsXa({search, tinhId, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, tinhId, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function themXa(xa) {
    try {
        const res = await api.post("", JSON.stringify(xa));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function suaXa(id, xa) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(xa));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaXa(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layFileImport() {
    try {
        const response = await api.get("/importer/template", {
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


export async function importXa(formData) {
    try {
        // không dùng api.headers mặc định "Content-Type"
        const response = await axios.post(
            process.env.NEXT_PUBLIC_BE + '/quan-tri/xa/importer',
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
