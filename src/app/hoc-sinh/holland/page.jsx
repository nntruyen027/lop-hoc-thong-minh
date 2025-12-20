"use client";

import {useEffect, useRef, useState} from "react";
import {Button, Col, Modal, Progress, Row} from "antd";
import {lamBaiHolland} from "@/services/hoc-sinh/holland";
import questions from "./cau-hoi.json";
import {useRouter} from "next/navigation";

export default function Page() {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 phút
    const [ketQua, setKetQua] = useState(null);
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [showStartModal, setShowStartModal] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);

    const questionRefs = useRef({});
    const router = useRouter();

    const timerRef = useRef(null);

// Đồng hồ đếm ngược
    useEffect(() => {
        if (!started || ketQua) return; // nếu chưa bắt đầu hoặc đã có kết quả thì không chạy
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(); // tự nộp bài khi hết thời gian
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [started, ketQua]);


    const handleSelect = (qid, val) => {
        setAnswers((prev) => ({...prev, [qid]: val}));
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const diem = {diemR: 0, diemI: 0, diemA: 0, diemS: 0, diemE: 0, diemC: 0};
            questions.forEach((q) => {
                const val = answers[q.id] ?? 0;
                diem[`diem${q.type}`] += val;
            });
            diem.thoiGianLam = 60 * 60 - timeLeft;

            const res = await lamBaiHolland(diem);
            setKetQua(res);
            setShowResultModal(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToQuestion = (qid) => {
        questionRefs.current[qid]?.scrollIntoView({behavior: "smooth", block: "center"});
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const startTest = () => {
        setShowStartModal(false);
        setStarted(true);
    };

    const restartTest = () => {
        setAnswers({});
        setTimeLeft(60 * 60);
        setKetQua(null);
        setStarted(false);
        setShowResultModal(false);
        setShowStartModal(true);
    };

    return (
        <div style={{padding: 16}}>
            {/* Modal bắt đầu */}
            <Modal
                open={showStartModal}
                title="Bắt đầu bài Holland"
                footer={[

                    <Button key="start" type="primary" onClick={startTest}>
                        Bắt đầu
                    </Button>,
                    <Button key="start" onClick={() => router.back()}>
                        Trở lại
                    </Button>
                ]}
                closable={false}
            >
                <p>Bạn có 60 phút để làm bài. </p>
            </Modal>

            {/* Modal kết quả */}
            <Modal
                open={showResultModal}
                title="Kết quả Holland"
                footer={[
                    <Button key="restart" type="primary" onClick={restartTest}>
                        Bắt đầu lại
                    </Button>,
                    <Button key="close" onClick={() => setShowResultModal(false)}>
                        Đóng
                    </Button>
                ]}
                onCancel={() => setShowResultModal(false)}
            >
                {ketQua ? (
                    <>
                        <p><strong>Học sinh:</strong> {ketQua.hoTen}</p>
                        <p><strong>Mã Holland:</strong> {ketQua.maHolland}</p>
                        <p><strong>Thời gian làm bài:</strong> {ketQua.thoiGianLam} giây</p>
                        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                            {['R', 'I', 'A', 'S', 'E', 'C'].map((type) => (
                                <div key={type}>
                                    <span style={{width: 40, display: 'inline-block'}}>{type}</span>
                                    <Progress
                                        percent={Math.min(ketQua[`diem${type}`] * 20, 100)}
                                        status="active"
                                        strokeColor="#1890ff"
                                        showInfo
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>Đang tải kết quả...</p>
                )}
            </Modal>


            <Row gutter={16}>
                <Col span={18}>
                    {questions.map((q, index) => (
                        <div
                            key={q.id}
                            ref={(el) => (questionRefs.current[q.id] = el)}
                            style={{
                                marginBottom: 16,
                                padding: 12,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                backgroundColor: answers[q.id] !== undefined ? "#f0fff0" : "#fff",
                            }}
                        >
                            <p style={{fontWeight: 500}}>{index + 1}. {q.text}</p>
                            <div style={{display: "flex", gap: 8}}>
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <Button
                                        key={val}
                                        type={answers[q.id] === val ? "primary" : "default"}
                                        onClick={() => handleSelect(q.id, val)}
                                    >
                                        {val}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <Button type="primary" onClick={handleSubmit} loading={loading}>
                        Hoàn thành bài
                    </Button>
                </Col>

                <Col span={6}>
                    <div
                        style={{
                            position: "sticky",
                            top: 90,
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                padding: 12,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                textAlign: "center",
                            }}
                        >
                            <h4>Thời gian còn lại</h4>
                            <div style={{fontSize: 24, fontWeight: "bold"}}>{formatTime(timeLeft)}</div>
                        </div>

                        <Progress
                            percent={100}
                            strokeColor="#1890ff"
                            status={answeredCount === totalQuestions ? "success" : "active"}
                            format={() => `${answeredCount} / ${totalQuestions} câu`}
                        />

                        <div
                            style={{
                                padding: 12,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                maxHeight: "60vh",
                                overflowY: "auto",
                            }}
                        >
                            <h4>Trạng thái câu hỏi</h4>
                            <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
                                {questions.map((q) => (
                                    <div
                                        key={q.id}
                                        onClick={() => scrollToQuestion(q.id)}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            lineHeight: "32px",
                                            textAlign: "center",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                            backgroundColor: answers[q.id] !== undefined ? "#52c41a" : "#fff",
                                            border: "1px solid #ccc",
                                        }}
                                    >
                                        {q.id}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
