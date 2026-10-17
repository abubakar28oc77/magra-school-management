import React, { useState, useMemo } from 'react';
import { MOCK_SCHOOL } from './mockData.js';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export function getDepartmentLabel(s) {
  const g = [s?.department, s?.group_name, s?.group, s?.section, s?.student_id]
    .filter(Boolean).map(x => String(x).toLowerCase()).join(' ');
  if (g.includes('বিজ্ঞান') || g.includes('science') || g.includes('sci')) return 'বিজ্ঞান বিভাগ';
  if (g.includes('মানবিক') || g.includes('humanities') || g.includes('hum') || g.includes('arts')) return 'মানবিক বিভাগ';
  if (g.includes('ব্যবসা') || g.includes('বাণিজ্য') || g.includes('business') || g.includes('commerce')) return 'ব্যবসায় শিক্ষা শাখা';
  return s?.department || s?.group_name || 'সাধারণ';
}

export function StudentCertificatesModal({
  isOpen,
  onClose,
  students = [],
  initialStudentId = '',
  initialCertType = 'testimonial' // 'testimonial', 'transfer', 'bonafide'
}) {
  const [certType, setCertType] = useState(initialCertType || 'testimonial');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || (students[0]?.id || ''));
  const [searchQuery, setSearchQuery] = useState('');

  // Customizable certificate fields
  const [memoNo, setMemoNo] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [passingYear, setPassingYear] = useState('২০২৬');
  const [examName, setExamName] = useState('মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)');
  const [gpaResult, setGpaResult] = useState('৫.০০ (A+)');
  const [conductRemark, setConductRemark] = useState('উত্তম ও প্রশংসনীয়');
  const [tcReason, setTcReason] = useState('অভিভাবকের বাসস্থান স্থানান্তর ও সুবিধার জন্য');
  const [paidUptoMonth, setPaidUptoMonth] = useState('ডিসেম্বর ২০২৬');
  const [signeeTitle, setSigneeTitle] = useState('মুহাম্মদ শফিকুল ইসলাম, প্রধান শিক্ষক');

  // Active student object
  const student = useMemo(() => {
    return students.find(s => String(s.id) === String(selectedStudentId) || String(s.student_id) === String(selectedStudentId)) || students[0] || null;
  }, [students, selectedStudentId]);

  // Generate dynamic default memo number based on student & type
  useMemo(() => {
    const code = student?.roll_no ? String(student.roll_no).padStart(3, '0') : '001';
    const prefix = certType === 'testimonial' ? 'মপাউবি/প্রশংসা' : certType === 'transfer' ? 'মপাউবি/ছাড়পত্র' : 'মপাউবি/প্রত্যয়ন';
    setMemoNo(`${prefix}/২০২৬/${code}`);
  }, [certType, student?.id]);

  // Filtered student list for dropdown
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      (s.name_bn && s.name_bn.toLowerCase().includes(q)) ||
      (s.name_en && s.name_en.toLowerCase().includes(q)) ||
      (s.student_id && s.student_id.toLowerCase().includes(q)) ||
      (s.roll_no && String(s.roll_no).includes(q))
    );
  }, [students, searchQuery]);

  if (!isOpen) return null;

  const school = MOCK_SCHOOL;
  const deptName = getDepartmentLabel(student);
  const studentNameBn = student?.name_bn || '—';
  const fatherName = student?.father_name || '—';
  const motherName = student?.mother_name || '—';
  const rollNo = toBengaliDigits(student?.roll_no) || student?.roll_no || '—';
  const studentId = student?.student_id || '—';
  const className = toBengaliDigits(student?.class_name) || student?.class_name || '১০';
  const village = student?.current_village || student?.permanent_village || 'মগড়া';
  const postOffice = student?.current_post_office || student?.permanent_post_office || 'মগড়া';
  const upazila = student?.current_upazila || student?.permanent_upazila || 'কালিহাতি';
  const district = student?.current_district || student?.permanent_district || 'টাঙ্গাইল';
  const birthDate = student?.date_of_birth ? toBengaliDigits(student.date_of_birth.slice(0, 10)) : '০১-০১-২০১০';

  // Render certificate HTML for preview and printing
  const generateCertificateHtml = () => {
    let contentHtml = '';
    let titleBn = '';
    let titleEn = '';

    if (certType === 'testimonial') {
      titleBn = 'প্রশংসাপত্র';
      titleEn = 'TESTIMONIAL / COMMENDATION CERTIFICATE';
      contentHtml = `
        <div class="cert-body-text">
          <p class="cert-lead">এই মর্মে প্রশংসাপত্র প্রদান করা যাইতেছে যে,</p>
          <div class="recipient-box">
            <span class="recipient-name">${studentNameBn}</span>
            ${student?.name_en ? `<span class="recipient-name-en">(${student.name_en})</span>` : ''}
          </div>
          <p class="cert-para">
            পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>, 
            গ্রাম: <b>${village}</b>, ডাকঘর: <b>${postOffice}</b>, 
            উপজেলা: <b>${upazila}</b>, জেলা: <b>${district}</b>।
          </p>
          <p class="cert-para">
            সে ঐতিহ্যবাহী <b>${school.nameBn}</b>-এর <b>${deptName}</b> হইতে <b>${passingYear}</b> সনের 
            <b>${examName}</b>-এ নিয়মিত পরীক্ষার্থী হিসেবে অংশগ্রহণ করিয়া গ্রেড পয়েন্ট এভারেজ (GPA) 
            <b>${gpaResult}</b> পাইয়া সাফল্যের সহিত উত্তীর্ণ হইয়াছে। তাহার শ্রেণি রোল নম্বর 
            <b>${rollNo}</b> এবং স্টুডেন্ট আইডি: <b>${studentId}</b>।
          </p>
          <p class="cert-para">
            বিদ্যালয়ে অধ্যয়নকালে সে সর্বদা নম্র, ভদ্র, বিনয়ী এবং অধ্যবসায়ী ছিল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা পরিপন্থী বা নৈতিকতা বিরোধী কোনো কার্যকলাপে সে কখনো লিপ্ত ছিল না। তাহার নৈতিক চরিত্র <b>${conductRemark}</b>।
          </p>
          <p class="cert-wish">
            আমি তাহার ভবিষ্যৎ জীবনের সর্বাঙ্গীন উন্নতি ও উজ্জ্বল সাফল্য কামনা করি।
          </p>
        </div>
      `;
    } else if (certType === 'transfer') {
      titleBn = 'ছাড়পত্র / Transfer Certificate (TC)';
      titleEn = 'TRANSFER CERTIFICATE / RELEASE ORDER';
      contentHtml = `
        <div class="cert-body-text tc-body">
          <p class="cert-lead">এই মর্মে ছাড়পত্র প্রদান করা যাইতেছে যে,</p>
          <div class="recipient-box">
            <span class="recipient-name">${studentNameBn}</span>
            ${student?.name_en ? `<span class="recipient-name-en">(${student.name_en})</span>` : ''}
          </div>
          <table class="tc-details-table">
            <tr>
              <td class="lbl">১. শিক্ষার্থীর আইডি ও রোল:</td>
              <td class="val">স্টুডেন্ট আইডি: <b>${studentId}</b> • শ্রেণি রোল: <b>${rollNo}</b></td>
            </tr>
            <tr>
              <td class="lbl">২. পিতা ও মাতার নাম:</td>
              <td class="val">পিতা: <b>${fatherName}</b> • মাতা: <b>${motherName}</b></td>
            </tr>
            <tr>
              <td class="lbl">৩. বর্তমান ও স্থায়ী ঠিকানা:</td>
              <td class="val">গ্রাম: ${village}, ডাকঘর: ${postOffice}, উপজেলা: ${upazila}, জেলা: ${district}</td>
            </tr>
            <tr>
              <td class="lbl">৪. জন্মতারিখ (রেকর্ড অনুযায়ী):</td>
              <td class="val"><b>${birthDate}</b> ${student?.birth_registration_no ? `(জন্ম নিবন্ধন: ${student.birth_registration_no})` : ''}</td>
            </tr>
            <tr>
              <td class="lbl">৫. ভর্তির শ্রেণি ও তারিখ:</td>
              <td class="val">শ্রেণি: ${toBengaliDigits(student?.admission_class || student?.class_name || '৬')} • তারিখ: ${student?.admission_date ? toBengaliDigits(student.admission_date.slice(0, 10)) : '০১-০১-২০২৪'}</td>
            </tr>
            <tr>
              <td class="lbl">৬. সর্বশেষ অধ্যয়নকৃত শ্রেণি:</td>
              <td class="val">শ্রেণি: <b>${className}</b> (${deptName})</td>
            </tr>
            <tr>
              <td class="lbl">৭. পাওনা পরিশোধের অবস্থা:</td>
              <td class="val"><span class="badge-success">✓ <b>${paidUptoMonth}</b> পর্যন্ত বিদ্যালয়ের সকল বেতন ও ফি পরিশোধিত</span></td>
            </tr>
            <tr>
              <td class="lbl">৮. আচরণ ও শৃঙ্খলা:</td>
              <td class="val">তাহার আচরণ ও নৈতিক চরিত্র <b>${conductRemark}</b> এবং সন্তোষজনক।</td>
            </tr>
            <tr>
              <td class="lbl">৯. ছাড়পত্র প্রদানের কারণ:</td>
              <td class="val"><b>${tcReason}</b></td>
            </tr>
          </table>
          <p class="cert-wish" style="margin-top: 15px;">
            তাঁহার ভবিষ্যৎ শিক্ষা জীবনে সর্বাঙ্গীন মঙ্গল ও সাফল্য কামনা করি।
          </p>
        </div>
      `;
    } else {
      // Bonafide / প্রত্যয়নপত্র
      titleBn = 'প্রত্যয়ন পত্র';
      titleEn = 'STUDENT BONAFIDE / CITIZEN CERTIFICATE';
      contentHtml = `
        <div class="cert-body-text">
          <p class="cert-lead">এই মর্মে প্রত্যয়ন করা যাইতেছে যে,</p>
          <div class="recipient-box">
            <span class="recipient-name">${studentNameBn}</span>
            ${student?.name_en ? `<span class="recipient-name-en">(${student.name_en})</span>` : ''}
          </div>
          <p class="cert-para">
            পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>, 
            গ্রাম: <b>${village}</b>, ডাকঘর: <b>${postOffice}</b>, 
            উপজেলা: <b>${upazila}</b>, জেলা: <b>${district}</b>।
          </p>
          <p class="cert-para">
            সে ঐতিহ্যবাহী <b>${school.nameBn}</b>-এর <b>শ্রেণি ${className}</b> (${deptName})-এর একজন 
            নিয়মিত ও বাধ্যগত শিক্ষার্থী। বিদ্যালয়ের ভর্তি বহির রেকর্ড অনুযায়ী তাহার শ্রেণি রোল নম্বর 
            <b>${rollNo}</b>, স্টুডেন্ট আইডি: <b>${studentId}</b> এবং জন্মতারিখ: <b>${birthDate}</b>।
          </p>
          <p class="cert-para">
            সে নিয়মিত শ্রেণিকক্ষে উপস্থিত থাকে এবং পাঠ্যক্রম ও সহশিক্ষা কার্যক্রমে সক্রিয় অংশগ্রহণ করে। বিদ্যালয়ের কোনো শৃঙ্খলাবিরোধী কাজে তাহার কোনো সংশ্লিষ্টতা নাই। আমার জানামতে তাহার নৈতিক চরিত্র <b>${conductRemark}</b>।
          </p>
          <p class="cert-para">
            তাহার প্রাতিষ্ঠানিক ও দাপ্তরিক প্রয়োজন (যেমন: <b>পাসপোর্ট আবেদন / শিক্ষাবৃত্তি / উপবৃত্তি / ব্যাংক হিসাব খোলা / জাতীয় পরিচয়পত্র বা সরকারি সুবিধা গ্রহণ</b>)-এর সুবিধার্থে তাহার আবেদনের প্রেক্ষিতে এই প্রত্যয়নপত্র প্রদান করা হইল।
          </p>
          <p class="cert-wish">
            আমি তাহার জীবনের সার্বিক কল্যাণ ও সাফল্য কামনা করি।
          </p>
        </div>
      `;
    }

    return `
      <div class="certificate-sheet">
        <div class="cert-outer-border">
          <div class="cert-inner-border">
            <!-- School Header -->
            <div class="cert-header">
              <div class="cert-header-meta">
                <img src="/school-logo.png" class="cert-logo" alt="Logo" onerror="this.style.display='none'">
                <div class="cert-school-title">
                  <h1>${school.nameBn}</h1>
                  <h2>${school.nameEn}</h2>
                  <p class="cert-school-sub">
                    EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬ • ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল
                  </p>
                  <p class="cert-school-contact">Email: ${school.email} • Mobile: ${school.phone}</p>
                </div>
              </div>
              <div class="cert-type-ribbon">
                <div class="ribbon-bn">${titleBn}</div>
                <div class="ribbon-en">${titleEn}</div>
              </div>
            </div>

            <!-- Reference & Date Line -->
            <div class="cert-ref-date">
              <div class="ref-col">স্মারক নং: <b>${memoNo}</b></div>
              <div class="date-col">তারিখ: <b>${toBengaliDigits(issueDate)}</b> খ্রি.</div>
            </div>

            <!-- Main Content with Watermark -->
            <div class="cert-main-wrapper">
              <div class="watermark-bg"></div>
              ${contentHtml}
            </div>

            <!-- Signature Section -->
            <div class="cert-footer-signs">
              <div class="sign-block left-sign">
                <div class="sign-space"></div>
                <div class="sign-bar"></div>
                <div class="sign-name">শ্রেণি শিক্ষকের স্বাক্ষর</div>
                <div class="sign-desig">${school.nameBn}</div>
              </div>
              <div class="sign-block seal-block">
                <div class="official-seal-circle">
                  <span>অফিসিয়াল গোল সিল</span>
                  <small>মগড়া পালস্ ইউ. উচ্চ বিদ্যালয়</small>
                </div>
              </div>
              <div class="sign-block right-sign">
                <div class="sign-space">
                  <div class="digital-sign-mock">${school.headTeacher}</div>
                </div>
                <div class="sign-bar"></div>
                <div class="sign-name">${school.headTeacher}</div>
                <div class="sign-desig">প্রধান শিক্ষক</div>
                <div class="sign-school">${school.nameBn}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=1000,height=850');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${certType === 'testimonial' ? 'প্রশংসাপত্র' : certType === 'transfer' ? 'ছাড়পত্র (TC)' : 'প্রত্যয়ন পত্র'} - ${student?.name_bn || 'Student'}</title>
        <style>
          ${certificateStyles}
          body {
            background: #ffffff;
            margin: 0;
            padding: 20px;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            .certificate-sheet { box-shadow: none !important; border: none !important; }
          }
        </style>
      </head>
      <body>
        ${generateCertificateHtml()}
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="modal-card" style={{
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1150px',
        maxHeight: '95vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
          color: '#ffffff', padding: '16px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
              INSTITUTIONAL CERTIFICATE STUDIO
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📜</span> শিক্ষার্থী প্রশংসাপত্র, ছাড়পত্র (TC) ও প্রত্যয়ন পত্র কনসোল
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff',
              fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        {/* Certificate Type Switcher */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCertType('testimonial')}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                border: certType === 'testimonial' ? '2px solid #0369a1' : '1px solid #cbd5e1',
                background: certType === 'testimonial' ? '#0369a1' : '#ffffff',
                color: certType === 'testimonial' ? '#ffffff' : '#334155',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              📜 প্রশংসাপত্র (Testimonial)
            </button>
            <button
              type="button"
              onClick={() => setCertType('transfer')}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                border: certType === 'transfer' ? '2px solid #0369a1' : '1px solid #cbd5e1',
                background: certType === 'transfer' ? '#0369a1' : '#ffffff',
                color: certType === 'transfer' ? '#ffffff' : '#334155',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              📑 ছাড়পত্র / Transfer Certificate (TC)
            </button>
            <button
              type="button"
              onClick={() => setCertType('bonafide')}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                border: certType === 'bonafide' ? '2px solid #0369a1' : '1px solid #cbd5e1',
                background: certType === 'bonafide' ? '#0369a1' : '#ffffff',
                color: certType === 'bonafide' ? '#ffffff' : '#334155',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              📄 প্রত্যয়ন পত্র (Bonafide Certificate)
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff', border: 'none', padding: '9px 22px', borderRadius: '8px',
              fontWeight: 800, fontSize: '13.5px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 3px 6px rgba(4, 120, 87, 0.25)'
            }}
          >
            🖨️ প্রিন্ট / অফিসিয়াল PDF ডাউনলোড
          </button>
        </div>

        {/* Modal Main Content: Split Grid (Customizer Form Left, Live Preview Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Customizer Panel */}
          <div style={{
            padding: '18px 20px', background: '#f8fafc', borderRight: '1px solid #e2e8f0',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '6px' }}>
              ⚙️ ডকুমেন্টের তথ্য ও কাস্টমাইজেশন
            </div>

            {/* Student Search & Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>শিক্ষার্থী অনুসন্ধান ও নির্বাচন:</label>
              <input
                type="text"
                placeholder="🔍 নাম / আইডি / রোল দিয়ে ফিল্টার..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '12.5px', marginTop: '4px' }}
              >
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    [শ্রেণি {s.class_name} • রোল {s.roll_no || '—'}] {s.name_bn || s.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Memo No & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>স্মারক নং:</label>
                <input
                  type="text"
                  value={memoNo}
                  onChange={e => setMemoNo(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>ইস্যু তারিখ:</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Fields for Testimonial */}
            {certType === 'testimonial' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>পরীক্ষার নাম:</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>পাসের সন / শিক্ষাবর্ষ:</label>
                    <input
                      type="text"
                      value={passingYear}
                      onChange={e => setPassingYear(e.target.value)}
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>প্রাপ্ত ফলাফল (GPA):</label>
                    <input
                      type="text"
                      value={gpaResult}
                      onChange={e => setGpaResult(e.target.value)}
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Fields for Transfer Certificate */}
            {certType === 'transfer' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>ছাড়পত্র প্রদানের কারণ:</label>
                  <input
                    type="text"
                    value={tcReason}
                    onChange={e => setTcReason(e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>পাওনা পরিশোধিত মাস:</label>
                  <input
                    type="text"
                    value={paidUptoMonth}
                    onChange={e => setPaidUptoMonth(e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </>
            )}

            {/* Common Conduct Remarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>আচরণ সংক্রান্ত মন্তব্য:</label>
              <select
                value={conductRemark}
                onChange={e => setConductRemark(e.target.value)}
                style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="উত্তম ও প্রশংসনীয়">উত্তম ও প্রশংসনীয়</option>
                <option value="সন্তোষজনক">সন্তোষজনক</option>
                <option value="অতীব উত্তম">অতীব উত্তম</option>
                <option value="শৃঙ্খলাবদ্ধ ও অনুকরণীয়">শৃঙ্খলাবদ্ধ ও অনুকরণীয়</option>
              </select>
            </div>

            {/* Selected Student Meta Summary */}
            {student && (
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px',
                padding: '10px 12px', fontSize: '12px', lineHeight: '1.6', marginTop: 'auto'
              }}>
                <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>নির্বাচিত শিক্ষার্থী তথ্য:</div>
                <div><b>নাম:</b> {student.name_bn}</div>
                <div><b>শ্রেণি:</b> {student.class_name} • <b>রোল:</b> {student.roll_no}</div>
                <div><b>বিভাগ:</b> {deptName}</div>
                <div><b>আইডি:</b> <code>{student.student_id}</code></div>
                <div><b>পিতা:</b> {student.father_name}</div>
              </div>
            )}
          </div>

          {/* Live Certificate Preview Panel */}
          <div style={{
            padding: '24px', background: '#cbd5e1', overflowY: 'auto',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start'
          }}>
            <div
              className="cert-preview-holder"
              style={{ width: '100%', maxWidth: '780px' }}
              dangerouslySetInnerHTML={{
                __html: `
                  <style>${certificateStyles}</style>
                  ${generateCertificateHtml()}
                `
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • অফিসিয়াল প্রত্যয়ন ও প্রশংসাপত্র সিস্টেম (EIIN: 114290)
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
              background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer'
            }}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// Master Classical Bangladeshi Certificate CSS
export const certificateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Cinzel:wght@600;700;800&family=Outfit:wght@400;600;700&display=swap');

  * { box-sizing: border-box; }

  .certificate-sheet {
    background: #ffffff;
    font-family: 'Noto Sans Bengali', 'SolaimanLipi', Arial, sans-serif;
    color: #0f172a;
    padding: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    border-radius: 4px;
    width: 100%;
    position: relative;
    box-sizing: border-box;
  }

  .cert-outer-border {
    border: 4px double #1e3a8a;
    padding: 6px;
    background: #fdfbf7;
    border-radius: 2px;
  }

  .cert-inner-border {
    border: 1.5px solid #d97706;
    padding: 24px 28px;
    position: relative;
  }

  /* Header */
  .cert-header {
    text-align: center;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }

  .cert-header-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 8px;
  }

  .cert-logo {
    width: 65px;
    height: 65px;
    object-fit: contain;
    border-radius: 50%;
    background: #fff;
    padding: 3px;
    border: 1.5px solid #1e3a8a;
  }

  .cert-school-title h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    color: #1e3a8a;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }

  .cert-school-title h2 {
    margin: 2px 0 0;
    font-size: 14px;
    font-family: 'Cinzel', serif;
    font-weight: 700;
    color: #b45309;
    letter-spacing: 0.5px;
  }

  .cert-school-sub {
    margin: 4px 0 0;
    font-size: 11.5px;
    font-weight: 600;
    color: #334155;
  }

  .cert-school-contact {
    margin: 2px 0 0;
    font-size: 10.5px;
    color: #64748b;
  }

  .cert-type-ribbon {
    margin: 12px auto 0;
    display: inline-block;
    background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%);
    color: #ffffff;
    padding: 6px 36px;
    border-radius: 20px;
    border: 2px solid #f59e0b;
    box-shadow: 0 2px 6px rgba(30, 58, 138, 0.25);
  }

  .ribbon-bn {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
    line-height: 1.2;
  }

  .ribbon-en {
    font-size: 8.5px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    color: #fef08a;
    letter-spacing: 1.2px;
  }

  /* Reference & Date */
  .cert-ref-date {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #334155;
    margin-bottom: 16px;
    padding: 0 4px;
  }

  /* Watermark and Main Text */
  .cert-main-wrapper {
    position: relative;
    min-height: 340px;
    padding: 10px 8px;
  }

  .watermark-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background-image: url('/school-logo.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    opacity: 0.055;
    pointer-events: none;
  }

  .cert-body-text {
    position: relative;
    z-index: 2;
    line-height: 1.85;
    font-size: 14.5px;
    color: #1e293b;
    text-align: justify;
  }

  .cert-lead {
    font-size: 15.5px;
    font-weight: 700;
    color: #1e3a8a;
    margin-bottom: 8px;
    text-align: center;
  }

  .recipient-box {
    text-align: center;
    margin: 8px 0 16px;
  }

  .recipient-name {
    font-size: 24px;
    font-weight: 900;
    color: #b91c1c;
    border-bottom: 2px dashed #b91c1c;
    padding-bottom: 2px;
    display: inline-block;
  }

  .recipient-name-en {
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    color: #0369a1;
    margin-left: 8px;
  }

  .cert-para {
    margin: 0 0 12px;
    text-indent: 28px;
  }

  .cert-wish {
    margin-top: 18px;
    text-align: center;
    font-size: 15px;
    font-weight: 700;
    color: #065f46;
  }

  /* TC Table */
  .tc-details-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 13.5px;
  }

  .tc-details-table td {
    padding: 6px 8px;
    border-bottom: 1px dashed #cbd5e1;
    vertical-align: top;
  }

  .tc-details-table .lbl {
    width: 220px;
    font-weight: 700;
    color: #334155;
  }

  .tc-details-table .val {
    color: #0f172a;
  }

  .badge-success {
    background: #ecfdf5;
    color: #047857;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #a7f3d0;
    display: inline-block;
  }

  /* Footer Signs */
  .cert-footer-signs {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 45px;
    padding: 0 10px;
    position: relative;
    z-index: 2;
  }

  .sign-block {
    text-align: center;
    width: 200px;
  }

  .sign-space {
    height: 48px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 4px;
  }

  .digital-sign-mock {
    font-family: 'Brush Script MT', cursive, sans-serif;
    font-size: 20px;
    color: #1e3a8a;
    font-style: italic;
  }

  .sign-bar {
    border-top: 1.5px solid #1e293b;
    margin-bottom: 4px;
  }

  .sign-name {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
  }

  .sign-desig {
    font-size: 11.5px;
    font-weight: 700;
    color: #047857;
  }

  .sign-school {
    font-size: 10px;
    color: #64748b;
  }

  .seal-block {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .official-seal-circle {
    width: 88px;
    height: 88px;
    border: 2px dashed #b91c1c;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #b91c1c;
    font-size: 9px;
    font-weight: 800;
    padding: 4px;
    background: rgba(254, 242, 242, 0.6);
  }

  .official-seal-circle small {
    font-size: 7.5px;
    margin-top: 2px;
  }
`;
