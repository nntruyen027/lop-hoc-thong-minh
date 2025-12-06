import axios from "axios";
import {useAuthStore} from '@/store/auth'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/auth',
    headers: {
        "Content-Type": "application/json"
    }
});

export async function login(username, password) {
    try {
        const res = await api.post("/login", {username, password});

        const token = res.data.token;
        if (!token) throw new Error("Không nhận được token từ server!");

        localStorage.setItem("jwtToken", token);

        const resMe = await api.get("/me", {
            headers: {Authorization: "Bearer " + token}
        });

        const user = resMe.data;
        localStorage.setItem("userInfo", JSON.stringify(user));

        useAuthStore.getState().setAuth(token, user);

        return {
            token,
            user
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
}

export async function getTinh(search, page = 1, limit = 10) {
    try {
        const res = await api.get("/tinh", {
            params: {
                search,
                page,
                limit
            }
        })
        const dsTinh = res.data.data;
        const {totalPages, totalElements} = res.data;
        return {
            dsTinh,
            totalElements,
            totalPages,
        }
    } catch (error) {
        throw new Error(error.response?.data?.message || "Không tải được danh sách");
    }
}

export async function getXa(search, tinhId, page = 1, limit = 10) {
    try {
        const res = await api.get(`/tinh/${tinhId}/xa`, {
            params: {
                search,
                page,
                limit
            }
        })
        const dsXa = res.data.data;
        const {totalPages, totalElements} = res.data;
        return {
            dsXa,
            totalElements,
            totalPages,
        }
    } catch (error) {
        throw new Error(error.response?.data?.message || "Không tải được danh sách");

    }
}


export async function dangKyGiaoVien(body) {
    try {
        const res = await api.post("/dang-ky-giao-vien", body);
        return res.data;

        // Ví dụ res data
        // {
        //     "id": 26,
        //     "username": "nntruyengv2",
        //     "avatar": null,
        //     "hoTen": "Nguyễn Ngọc Truyện - Giáo viên",
        //     "ngaySinh": "27/06/2002",
        //     "laNam": true,
        //     "boMon": "Toán",
        //     "chucVu": "Giáo viên chủ nhiệm"
        // }
    } catch (error) {
        throw new Error(error.response?.data?.message || "Không thể đăng ký");
    }
}
