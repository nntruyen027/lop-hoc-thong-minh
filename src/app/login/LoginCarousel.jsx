"use client";

import {Carousel} from "antd";

export default function LoginCarousel() {
    return (
        <Carousel autoplay style={{height: "100%"}}>
            <div><img style={{height: "100vh", objectFit: "cover"}} src={'bts.gif'}/></div>
            <div><img style={{height: "100vh", objectFit: "cover"}} src={'book.gif'}/></div>
            <div><img style={{height: "100vh", objectFit: "cover"}} src={'easyschool.webp'}/></div>
            <div><img style={{height: "100vh", objectFit: "cover"}} src={'pencil.webp'}/></div>
        </Carousel>
    );
}
