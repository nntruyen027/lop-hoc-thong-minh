"use client";

import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import {isTokenValid} from "@/utils/auth";
import {App} from "antd";

export default function ClientLayout({children}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await isTokenValid();

            if (!valid && pathname !== "/login") {
                router.replace("/login");
                return;
            }

            if (valid && pathname === "/login") {
                const user = JSON.parse(localStorage.getItem("userInfo"));
                if (!user) return;

                if (user.role === "ADMIN") router.replace("/quan-tri-vien/dashboard");
                else if (user.role === "TEACHER") router.replace("/giao-vien/dashboard");
                else router.replace("/hoc-sinh/dashboard");
            }
        };

        checkAuth();
    }, [pathname, router]);

    return (
        <App
            message={{
                maxCount: 3,
                duration: 3,
                top: 70,
            }}
        >
            {children}
        </App>
    );
}
