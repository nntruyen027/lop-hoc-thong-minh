'use client';

import {useState} from 'react';
import {
    Button,
    Card,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Progress,
    Radio,
    Select,
    Space,
    Typography
} from 'antd';
import {hollandQuestions} from './questions';
import dayjs from 'dayjs';

const {Title, Text, Paragraph} = Typography;
const {Option} = Select;
const pageSize = 6;
const hollandDescriptions = {
    R: {
        name: "Nhóm Thực tế",
        description: "Thích công việc kỹ thuật, vận hành máy móc, nông nghiệp, thể thao...",
        careers: ["Kỹ sư", "Công nhân", "Nông nghiệp"]
    },
    I: {
        name: "Nhóm Nghiên cứu",
        description: "Thích khám phá, khoa học, công nghệ, toán học...",
        careers: ["Nhà nghiên cứu", "Khoa học", "IT"]
    },
    A: {
        name: "Nhóm Nghệ thuật",
        description: "Sáng tạo, yêu thích âm nhạc, hội họa, viết lách...",
        careers: ["Nghệ sĩ", "Nhạc sĩ", "Họa sĩ"]
    },
    S: {
        name: "Nhóm Xã hội",
        description: "Thích giao tiếp, giúp đỡ, giảng dạy, tư vấn...",
        careers: ["Giáo viên", "Tư vấn", "Nhân viên xã hội"]
    },
    E: {
        name: "Nhóm Quản lý",
        description: "Năng động, lãnh đạo, kinh doanh, thuyết phục...",
        careers: ["Quản lý", "Doanh nhân", "Trưởng phòng"]
    },
    C: {
        name: "Nhóm Quy ước",
        description: "Tỉ mỉ, làm việc có tổ chức, hành chính, kế toán...",
        careers: ["Kế toán", "Hành chính", "Nhân viên văn phòng"]
    },
};


export default function HollandSurvey() {
    const [step, setStep] = useState('info');
    const [userInfo, setUserInfo] = useState({
        hoTen: '', lop: '', ngaySinh: null, laNam: null,
        soThich: '', monHocYeuThich: '', diemManh: '', diemYeu: '', ngheNghiepMongMuon: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [form] = Form.useForm();

    const totalPages = Math.ceil(hollandQuestions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentQuestions = hollandQuestions.slice(startIndex, startIndex + pageSize);
    const progressPercent = Math.round((Object.keys(answers).length / hollandQuestions.length) * 100);

    const startSurvey = async () => {
        try {
            await form.validateFields();
            setStep('survey');
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    const handleAnswerChange = (questionId, value) => setAnswers(prev => ({...prev, [questionId]: value}));
    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleSubmit = async () => {
        const scores = {R: 0, I: 0, A: 0, S: 0, E: 0, C: 0};
        hollandQuestions.forEach(q => {
            scores[q.type] += answers[q.id] || 0;
        });
        const maxScore = Math.max(...Object.values(scores));
        const mainTypes = Object.entries(scores).filter(([_, s]) => s === maxScore).map(([type]) => type);
        setResult({scores, mainTypes});
        setStep('result');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BE}/students`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    hoTen: userInfo.hoTen,
                    lop: userInfo.lop,
                    ngaySinh: dayjs(userInfo.ngaySinh).format('DD/MM/YYYY'),
                    laNam: userInfo.laNam,
                    soThich: userInfo.soThich,
                    monHocYeuThich: userInfo.monHocYeuThich,
                    diemManh: userInfo.diemManh,
                    diemYeu: userInfo.diemYeu,
                    ngheNghiepMongMuon: userInfo.ngheNghiepMongMuon,
                    realisticScore: scores.R,
                    investigativeScore: scores.I,
                    artisticScore: scores.A,
                    socialScore: scores.S,
                    enterprisingScore: scores.E,
                    conventionalScore: scores.C,
                    assessmentResult: mainTypes.join(', ')
                })
            });
            if (!res.ok) throw new Error();
            message.success('Dữ liệu đã được lưu thành công!');
        } catch {
            message.error('Không thể gửi dữ liệu lên server');
        }
    };

    const renderInfoForm = () => (
        <Card style={{padding: 32, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
            <Form layout="vertical" form={form}>
                <Space direction="vertical" size="small" style={{width: '100%'}}>
                    <Form.Item label="Họ và tên" name="hoTen" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, fullName: e.target.value}))}/>
                    </Form.Item>
                    <Form.Item label="Lớp" name="lop" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, className: e.target.value}))}/>
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="ngaySinh" rules={[{required: true}]}>
                        <DatePicker
                            style={{width: '100%'}}
                            format="DD/MM/YYYY"
                            onChange={date => setUserInfo(prev => ({...prev, dob: date ? date.toDate() : null}))}
                        />
                    </Form.Item>
                    <Form.Item label="Giới tính" name="laNam" rules={[{required: true}]}>
                        <Select onChange={val => setUserInfo(prev => ({...prev, laNam: val}))}>
                            <Option value={true}>Nam</Option>
                            <Option value={false}>Nữ</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Sở thích" name="soThich" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, soThich: e.target.value}))}/>
                    </Form.Item>
                    <Form.Item label="Môn học yêu thích" name="monHocYeuThich" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, monHocYeuThich: e.target.value}))}/>
                    </Form.Item>
                    <Form.Item label="Điểm mạnh" name="diemManh" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, diemManh: e.target.value}))}/>
                    </Form.Item>
                    <Form.Item label="Điểm yếu" name="diemYeu" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, diemYeu: e.target.value}))}/>
                    </Form.Item>
                    <Form.Item label="Nghề nghiệp mong muốn" name="ngheNghiepMongMuon" rules={[{required: true}]}>
                        <Input onChange={e => setUserInfo(prev => ({...prev, ngheNghiepMongMuon: e.target.value}))}/>
                    </Form.Item>
                    <Button type="primary" block size="large" onClick={startSurvey}>
                        Bắt đầu khảo sát
                    </Button>
                </Space>
            </Form>
        </Card>
    );

    const renderSurvey = () => (
        <>
            <Progress
                percent={progressPercent}
                status="active"
                style={{marginBottom: 24, borderRadius: 8}}
            />
            {currentQuestions.map(q => (
                <Card
                    key={q.id}
                    style={{
                        marginBottom: 20,
                        borderRadius: 12,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        padding: 24,
                    }}
                >
                    <Text strong style={{fontSize: 16, display: 'block', marginBottom: 16}}>
                        {q.id}. {q.text}
                    </Text>
                    <div
                        style={{
                            backgroundColor: '#f9f9f9',
                            padding: 16,
                            borderRadius: 8,
                        }}
                    >
                        <Radio.Group
                            value={answers[q.id]}
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                        >
                            <Space direction="vertical" size="large">
                                <Radio value={0}>Không phù hợp</Radio>
                                <Radio value={1}>Bình thường</Radio>
                                <Radio value={2}>Rất phù hợp</Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                </Card>
            ))}

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 24}}>
                {currentPage === 1 ? (
                    <Button onClick={() => setStep('info')}>Quay lại thông tin</Button>
                ) : (
                    <Button onClick={handlePrev}>Trở lại</Button>
                )}
                {currentPage < totalPages ? (
                    <Button type="primary" onClick={handleNext}>
                        Tiếp tục
                    </Button>
                ) : (
                    <Button type="primary" onClick={handleSubmit}>
                        Hoàn tất khảo sát
                    </Button>
                )}
            </div>
        </>
    );


    const renderResult = () => (
        <Card title="Kết quả trắc nghiệm Holland" style={{marginTop: 30, borderRadius: 12}}>
            <Text strong>Nhóm nổi bật: {result.mainTypes.join(', ')}</Text>
            <Divider/>
            <Space direction="vertical" size="middle">
                {Object.entries(result.scores).map(([type, score]) => (
                    <Text key={type}><strong>{type}</strong>: {score}</Text>
                ))}
            </Space>
            <Divider/>
            <Title level={4}>Phân tích & Gợi ý nghề nghiệp</Title>
            {result.mainTypes.map(type => {
                const info = hollandDescriptions[type];
                return (
                    <Card key={type} type="inner" style={{marginTop: 16}}>
                        <Paragraph><strong>{info.name}</strong><br/>{info.description}</Paragraph>
                        <Paragraph><strong>Ngành nghề phù hợp:</strong> {info.careers.join(', ')}</Paragraph>
                    </Card>
                );
            })}
            <div style={{textAlign: 'center', marginTop: 24}}>
                <Button type="default" onClick={() => setStep('info')}>Làm lại khảo sát</Button>
            </div>
        </Card>
    );

    return (
        <div style={{maxWidth: 800, margin: '50px auto', padding: '0 16px'}}>
            <div
                style={{
                    textAlign: 'center',
                    marginBottom: 32,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
            >
                {/* Ảnh bìa */}
                <img
                    src="/z7202836683164_61015cbf28796aba7c1d22708f2303fe.jpg" // copy vào public
                    alt="Cover"
                    style={{
                        width: '100%',
                        maxHeight: 180,
                        objectFit: 'cover',
                    }}
                />

                {/* Tiêu đề */}
                <div
                    style={{
                        backgroundColor: '#fff',
                        padding: '24px 16px',
                        textAlign: 'left',
                    }}
                >
                    <h2 style={{
                        margin: 0,
                        fontSize: '50px',
                        fontWeight: 600,
                        color: '#000',
                    }}>
                        Khảo sát Holland
                    </h2>
                    <p style={{marginTop: 8, fontSize: 16, color: '#555'}}>
                        Mời các em học sinh điền thông tin và thực hiện khảo sát
                    </p>
                </div>
            </div>


            {step === 'info' && renderInfoForm()}
            {step === 'survey' && renderSurvey()}
            {step === 'result' && result && renderResult()}
        </div>
    );
}
