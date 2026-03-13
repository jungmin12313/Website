export default function Report() {
  return (
    <div style={{ maxWidth: '37.5rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>신고센터</h1>
      <p style={{ color: '#6C757D', marginBottom: '2rem' }}>축제 현장에서 불편사항을 발견하셨나요? 신고해주시면 빠르게 반영하겠습니다.</p>
      <div style={{ background: 'white', border: '1px solid #E9ECEF', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {[
          { label: '이름', placeholder: '홍길동', type: 'text' },
          { label: '연락처', placeholder: '010-0000-0000', type: 'tel' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} style={{ border: '1px solid #E9ECEF', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none' }} />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>해당 축제</label>
          <select style={{ border: '1px solid #E9ECEF', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none' }}>
            <option>겨울공주 군밤축제</option>
            <option>강진청자축제</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>신고 내용</label>
          <textarea rows={5} placeholder="불편하셨던 내용을 자세히 적어주세요." style={{ border: '1px solid #E9ECEF', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>사진 첨부 (선택)</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', border: '1.5px dashed #A8CCEC', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#2C6EA6', cursor: 'pointer', background: '#EEF6FC' }}>
            📎 사진 선택
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} />
          </label>
        </div>
        <button style={{ background: '#5BA4CF', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'Noto Sans KR, sans-serif', cursor: 'pointer', border: 'none' }}>
          신고 제출
        </button>
      </div>
    </div>
  )
}
