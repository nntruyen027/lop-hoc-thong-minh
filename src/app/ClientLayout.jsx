"use client";

import {App} from "antd";
import InnerLayout from "./InnerLayout";

export default function ClientLayout({children}) {
    return (
        <App
            message={{
                maxCount: 3,
                duration: 3,
                top: 70,
            }}
        >
            <InnerLayout>{children}</InnerLayout>
        </App>
    );
}
