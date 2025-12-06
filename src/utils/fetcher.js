import {useAuthStore} from "@/store/auth";

export async function authFetch(url, options = {}) {
    const token = useAuthStore.getState().token;

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        }
    });

    if (res.status === 401) {
        useAuthStore.getState().logout();
    }

    return res.json();
}
