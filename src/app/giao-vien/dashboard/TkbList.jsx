'use client';

export default function TkbList({data}) {
    if (!data || data.length === 0) {
        return <div style={{color: '#999'}}>Không có tiết học</div>;
    }

    return data.map((t, idx) => (
        <div
            key={idx}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px dashed #eee'
            }}
        >
            <span>
                <b>Tiết {t.tietHoc}</b> – {t.tenMonHoc}
            </span>
            <span style={{color: '#888'}}>
                {t.tietHoc <= 5 ? 'Sáng' : 'Chiều'}
            </span>
        </div>
    ));
};
