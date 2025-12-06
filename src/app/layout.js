'use client';

import "./globals.css";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import {isTokenValid} from "@/utils/auth";

export default function RootLayout({children}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await isTokenValid();
            if (!valid && pathname !== '/login') {
                router.replace('/login');
            }
            if (valid && pathname === '/login') {
                if (JSON.parse(localStorage.getItem('userInfo')).role === "ADMIN")
                    router.replace('/quan-tri-vien/dashboard');
                else if (JSON.parse(localStorage.getItem('userInfo')).role === "TEACHER")
                    router.replace('/giao-vien/dashboard');
                else router.replace('/hoc-sinh/dashboard');
            }

        };

        checkAuth();
    }, [pathname, router]);

    return (
        <html lang="en">
        <body className={'h-screen w-screen p-0 m-0 overflow-x-hidden'}>
        {children}
        </body>
        </html>
    );
}
