import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_STUDENTS, getStudentPhoto } from './mockData';
import schoolLogo from '../public/school-logo.png';
import { sortStudentsList } from './apiClient';
import { getHeadTeacher, getAssistantHeadTeacher } from './AttendancePanel';

// Bengali digit helper
const toBn = (n) => (n === null || n === undefined || n === '') ? '০' : String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export function PublicAttendancePortal({ isOpen, onClose }) {
  // Dynamic Head Teacher & Assistant Head Teacher from teacher list (REQ 5 & user rule: strictly no memo number)
  const headTeacher = useMemo(() => getHeadTeacher(), []);
  const asstHeadTeacher = useMemo(() => getAssistantHeadTeacher(), []);

  // Search parameters
  const [searchClass, setSearchClass] = useState('10');
  const [searchGroup, setSearchGroup] = useState('বিজ্ঞান'); // Mandatory choice for 9/10
  const [searchSection, setSearchSection] = useState('all');
  const [searchRoll, setSearchRoll] = useState('1');
  const [searchName, setSearchName] = useState('');

  // Results & Certificate view states
  const [searched, setSearched] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'certificate'
  const [certType, setCertType] = useState('yearly'); // 'yearly' | 'monthly'
  const [selectedCertMonth, setSelectedCertMonth] = useState(9); // default to October (index 9)

  // Retrieve current student database (from localStorage or mockData)
  const allStudents = useMemo(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
      if (Array.isArray(cached) && cached.length) return cached;
    } catch {}
    return MOCK_STUDENTS;
  }, []);

  // Perform search
  const performSearch = (cls = searchClass, grp = searchGroup, roll = searchRoll, name = searchName, autoView = 'summary') => {
    setSearched(true);

    let candidates = allStudents.filter(s => String(s.class_name).trim() === String(cls).trim());

    // Filter by group for Class 9 & 10
    if (['9', '10', '৯', '১০'].includes(String(cls)) && grp && grp !== 'all') {
      candidates = candidates.filter(s => {
        const dpt = String(s.department || s.group || s.group_name || '').toLowerCase();
        return dpt.includes(grp.toLowerCase());
      });
    }

    // Filter by section if not 'all'
    if (searchSection !== 'all') {
      candidates = candidates.filter(s => String(s.section || '').includes(searchSection));
    }

    // Filter by roll number
    if (roll) {
      const cleanRoll = parseInt(roll, 10);
      const rollMatches = candidates.filter(s => parseInt(s.roll_no, 10) === cleanRoll);
      if (rollMatches.length) candidates = rollMatches;
    }

    // Filter by name if provided
    if (name.trim()) {
      const term = name.trim().toLowerCase();
      const nameMatches = candidates.filter(s => 
        (s.name_bn || '').toLowerCase().includes(term) ||
        (s.name_en || '').toLowerCase().includes(term)
      );
      if (nameMatches.length) candidates = nameMatches;
    }

    if (candidates.length) {
      setMatchedStudent(candidates[0]);
    } else {
      setMatchedStudent(null);
    }
    setViewMode(autoView);
  };

  // Quick preset selections
  const handleQuickDemo = (cls, grp, roll, name = '') => {
    setSearchClass(cls);
    setSearchGroup(grp);
    setSearchRoll(String(roll));
    setSearchName(name);
    setTimeout(() => {
      performSearch(cls, grp, String(roll), name, 'summary');
    }, 50);
  };

  // Initial auto-populate default candidate (Class 10, Science, Roll 1 - Ahnaf)
  useEffect(() => {
    if (isOpen && !matchedStudent && allStudents.length) {
      performSearch('10', 'বিজ্ঞান', '1', '', 'summary');
    }
  }, [isOpen, allStudents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchClass, searchGroup, searchRoll, searchName, 'summary');
  };

  // Compute realistic attendance stats for matched student
  const attendanceStats = useMemo(() => {
    if (!matchedStudent) return null;

    const savedAttendance = JSON.parse(localStorage.getItem('magra_db_attendance') || '[]');
    const studentRecords = savedAttendance.filter(a => String(a.student_id) === String(matchedStudent.id));

    // Base yearly simulation for 2026 (Jan to Oct: 10 months)
    const baseWorkingDays = 196;
    const seed = ((parseInt(matchedStudent.roll_no, 10) || 1) * 23) % 100;
    
    // Calculate realistic variance based on seed and actual records
    const simulatedAbsents = seed === 7 || seed === 23 ? 12 : seed === 42 ? 8 : (seed % 6) + 3;
    const actualAbsents = studentRecords.filter(r => r.status === 'absent').length;
    const totalAbsent = Math.max(actualAbsents, simulatedAbsents);

    const simulatedLate = (seed % 4) + 1;
    const actualLate = studentRecords.filter(r => r.status === 'late').length;
    const totalLate = Math.max(actualLate, simulatedLate);

    const simulatedLeave = (seed % 3) + 1;
    const actualLeave = studentRecords.filter(r => r.status === 'leave').length;
    const totalLeave = Math.max(actualLeave, simulatedLeave);

    const totalPresent = baseWorkingDays - totalAbsent;
    const rate = Math.round((totalPresent / baseWorkingDays) * 100);

    // Month-by-month breakdown
    const monthsData = [
      { month: 'জানুয়ারি', days: 22, abs: seed === 7 ? 2 : 1, late: 0, leave: 0 },
      { month: 'ফেব্রুয়ারি', days: 20, abs: seed === 23 ? 2 : 0, late: 1, leave: 0 },
      { month: 'মার্চ', days: 24, abs: seed === 42 ? 2 : 1, late: 0, leave: 1 },
      { month: 'এপ্রিল', days: 18, abs: 0, late: 0, leave: 0 },
      { month: 'মে', days: 22, abs: 1, late: 1, leave: 0 },
      { month: 'জুন', days: 20, abs: 1, late: 0, leave: 0 },
      { month: 'জুলাই', days: 23, abs: seed === 7 ? 2 : 1, late: 1, leave: 1 },
      { month: 'আগস্ট', days: 22, abs: 1, late: 0, leave: 0 },
      { month: 'সেপ্টেম্বর', days: 24, abs: seed === 23 ? 2 : 1, late: 0, leave: 0 },
      { month: 'অক্টোবর (চলতি)', days: 19, abs: actualAbsents > 0 ? actualAbsents : 1, late: actualLate, leave: actualLeave }
    ].map(m => {
      const pres = m.days - m.abs;
      const pct = Math.round((pres / m.days) * 100);
      return {
        ...m,
        present: pres,
        rate: pct,
        status: pct >= 90 ? 'উত্তম ও নিয়মিত' : pct >= 75 ? 'নিয়মিত ও সন্তোষজনক' : 'ঝুঁকিপূর্ণ'
      };
    });

    // Recent 30 school days dot matrix (Friday & Saturday are weekly holidays)
    const recentDays = Array.from({ length: 30 }, (_, i) => {
      const dayNum = 30 - i;
      const dObj = new Date(2026, 9, dayNum); // October 2026
      const dow = dObj.getDay();
      const isFri = (dow === 5);
      const isSat = (dow === 6);
      if (isFri) return { day: dayNum, status: 'holiday', label: `${toBn(dayNum)} অক্টোবর: শুক্রবার (সাপ্তাহিক ছুটি)` };
      if (isSat) return { day: dayNum, status: 'holiday', label: `${toBn(dayNum)} অক্টোবর: শনিবার (সাপ্তাহিক ছুটি)` };
      const isAbs = (dayNum === (seed % 28) + 1);
      const isLateDay = (dayNum === (seed % 14) + 1);
      const isLeaveDay = (dayNum === 14);
      if (isAbs) return { day: dayNum, status: 'absent', label: `${toBn(dayNum)} অক্টোবর: অনুপস্থিত` };
      if (isLateDay) return { day: dayNum, status: 'late', label: `${toBn(dayNum)} অক্টোবর: বিলম্বে আগমন` };
      if (isLeaveDay) return { day: dayNum, status: 'leave', label: `${toBn(dayNum)} অক্টোবর: ছুটি` };
      return { day: dayNum, status: 'present', label: `${toBn(dayNum)} অক্টোবর: উপস্থিত` };
    });

    return {
      workingDays: baseWorkingDays,
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      leave: totalLeave,
      rate,
      performance: rate >= 92 ? 'চমৎকার ও নিয়মিত' : rate >= 80 ? 'নিয়মিত ও সন্তোষজনক' : rate >= 75 ? 'সন্তোষজনক' : 'ঝুঁকিপূর্ণ (অভিভাবক যোগাযোগ কাম্য)',
      monthsData,
      recentDays
    };
  }, [matchedStudent]);

  // Selected Month Data for Monthly Certificate
  const currentMonthData = useMemo(() => {
    if (!attendanceStats?.monthsData?.length) return null;
    const idx = Math.min(Math.max(0, selectedCertMonth), attendanceStats.monthsData.length - 1);
    return attendanceStats.monthsData[idx];
  }, [attendanceStats, selectedCertMonth]);

  // Weekly breakdown calculation for the selected month (Sunday to Thursday = 5 school days per week)
  const monthlyWeeks = useMemo(() => {
    if (!currentMonthData) return [];
    const totalDays = currentMonthData.days || 20;
    const totalAbs = currentMonthData.abs || 0;
    
    // Divide into 4 or 5 weeks of 5 days (Sunday to Thursday)
    const chunks = [];
    let rem = totalDays;
    while (rem > 0) {
      const c = rem >= 5 ? 5 : rem;
      chunks.push(c);
      rem -= c;
    }

    let remAbs = totalAbs;
    return chunks.map((wDays, idx) => {
      let wAbs = 0;
      if (remAbs > 0) {
        wAbs = 1;
        remAbs -= 1;
      }
      const wPres = wDays - wAbs;
      const wRate = Math.round((wPres / wDays) * 100);
      return {
        weekName: `সপ্তাহ ${toBn(idx + 1)}`,
        days: wDays,
        present: wPres,
        absent: wAbs,
        rate: wRate,
        status: wRate >= 90 ? 'চমৎকার' : wRate >= 75 ? 'সন্তোষজনক' : 'সতর্কতা'
      };
    });
  }, [currentMonthData]);

  if (!isOpen) return null;

  return (
    <div
      className="portal-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 26, 18, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'grid',
        placeItems: 'center',
        padding: viewMode === 'certificate' ? '12px' : '20px',
        overflowY: 'auto'
      }}
    >
      {/* Dynamic inline style tag for Strict A4 Print Page Setup */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 10mm 12mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .portal-modal-overlay {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            display: block !important;
            width: 100% !important;
          }
          .portal-modal-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            overflow: visible !important;
            max-height: none !important;
          }
          .portal-scroll-area {
            padding: 0 !important;
            overflow: visible !important;
            background: transparent !important;
          }
          .printable-attendance-certificate {
            width: 100% !important;
            max-width: 186mm !important;
            margin: 0 auto !important;
            border: 2px solid #065f46 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            padding: 10mm 14mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <div
        className="portal-modal-container"
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: viewMode === 'certificate' ? '880px' : '1060px',
          borderRadius: viewMode === 'certificate' ? '14px' : '20px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh'
        }}
      >
        {/* =========================================================================
            VIEW MODE: CERTIFICATE (A4 Official Attendance Certificate & Report)
            USER SPEC: In Certificate view, REMOVE the portion above the school pad 
            (Modal Header, Search Form Card, and Tab row) so the certificate starts 
            directly with the official school pad!
           ========================================================================= */}
        {viewMode === 'certificate' && matchedStudent && attendanceStats ? (
          <>
            {/* Non-printing Sleek Action Bar for Parents/Guardians */}
            <div
              className="no-print"
              style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
                color: '#ffffff',
                padding: '11px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                borderBottom: '2px solid #047857'
              }}
            >
              {/* Back to summary */}
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: '7px',
                  padding: '6px 14px',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← উপস্থিতি বিবরণীতে ফিরুন
              </button>

              {/* Mode switch: বাৎসরিক vs মাসিক & Month Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.22)',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#a7f3d0' }}>
                  রিপোর্টের ধরন:
                </span>
                <button
                  type="button"
                  onClick={() => setCertType('yearly')}
                  style={{
                    background: certType === 'yearly' ? '#10b981' : 'transparent',
                    color: '#ffffff',
                    border: certType === 'yearly' ? '1px solid #34d399' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📅 বাৎসরিক প্রত্যয়নপত্র
                </button>
                <button
                  type="button"
                  onClick={() => setCertType('monthly')}
                  style={{
                    background: certType === 'monthly' ? '#10b981' : 'transparent',
                    color: '#ffffff',
                    border: certType === 'monthly' ? '1px solid #34d399' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📆 মাসিক প্রত্যয়নপত্র ও রিপোর্ট
                </button>

                {certType === 'monthly' && (
                  <select
                    value={selectedCertMonth}
                    onChange={(e) => setSelectedCertMonth(Number(e.target.value))}
                    style={{
                      background: '#ffffff',
                      color: '#064e3b',
                      border: '1.5px solid #34d399',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {attendanceStats.monthsData.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m.month} ২০২৬ ({toBn(m.rate)}%)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Print and Close buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#ffd34f',
                    color: '#064e3b',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '7px 16px',
                    fontWeight: 900,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  🖨️ A4 সাইজে প্রিন্ট / PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: 'none',
                    color: '#ffffff',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                  title="উইন্ডো বন্ধ করুন"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Preview Area for A4 Certificate */}
            <div
              className="portal-scroll-area"
              style={{
                padding: '24px 20px',
                overflowY: 'auto',
                flex: 1,
                background: '#f1f5f9'
              }}
            >
              {/* THE OFFICIAL CERTIFICATE: Starts DIRECTLY with the School Pad Header */}
              <div
                className="printable-attendance-certificate"
                style={{
                  background: '#ffffff',
                  border: '2px solid #065f46',
                  borderRadius: '12px',
                  padding: '26px 36px',
                  color: '#0f172a',
                  position: 'relative',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                  maxWidth: '820px',
                  margin: '0 auto',
                  boxSizing: 'border-box'
                }}
              >
                {/* Decorative Inset Border */}
                <div style={{
                  position: 'absolute',
                  inset: '5px',
                  border: '1px solid #047857',
                  borderRadius: '8px',
                  pointerEvents: 'none'
                }} />

                {/* 1. Official School Pad Header (মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '2.5px solid #065f46',
                  paddingBottom: '14px',
                  marginBottom: '18px'
                }}>
                  <div style={{ flex: '0 0 85px' }}>
                    <img
                      src={schoolLogo}
                      alt="Logo"
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0 10px' }}>
                    <h1 style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 900, color: '#064e3b', letterSpacing: '0.5px' }}>
                      মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
                    </h1>
                    <h3 style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.8px' }}>
                      MAGRA PALS UNION HIGH SCHOOL
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                      ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল | স্থাপিত: ১৯৪৬ খ্রি. | EIIN: ১১৪২৯০
                    </p>
                  </div>
                  <div style={{ flex: '0 0 120px', textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>প্রিন্ট তারিখ:</div>
                    <div>{new Date().toLocaleDateString('bn-BD')}</div>
                  </div>
                </div>

                {/* 2. Certificate Title Banner (Yearly or Monthly) */}
                <div style={{ textAlign: 'center', margin: '14px 0 18px' }}>
                  <span style={{
                    display: 'inline-block',
                    border: '2px solid #047857',
                    padding: '6px 24px',
                    borderRadius: '30px',
                    fontSize: '15.5px',
                    fontWeight: 900,
                    color: '#064e3b',
                    background: '#ecfdf5',
                    letterSpacing: '0.5px'
                  }}>
                    {certType === 'yearly' 
                      ? 'শিক্ষার্থী বার্ষিক উপস্থিতি বিবরণী ও প্রত্যয়নপত্র - ২০২৬'
                      : `শিক্ষার্থী মাসিক উপস্থিতি প্রতিবেদন ও প্রত্যয়নপত্র - ${currentMonthData?.month || ''} ২০২৬`
                    }
                  </span>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', fontStyle: 'italic', fontWeight: 600 }}>
                    {certType === 'yearly' 
                      ? 'OFFICIAL ANNUAL ATTENDANCE CERTIFICATE & REPORT'
                      : 'OFFICIAL MONTHLY ATTENDANCE CERTIFICATE & REPORT'
                    }
                  </div>
                </div>

                {/* 3. Certified Statement Body */}
                <div style={{
                  fontSize: '14px',
                  lineHeight: '2.0',
                  color: '#1e293b',
                  textAlign: 'justify',
                  marginBottom: '20px'
                }}>
                  এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong>{matchedStudent.name_bn}</strong>
                  {matchedStudent.name_en ? ` (${matchedStudent.name_en})` : ''}, 
                  পিতা: <strong>{matchedStudent.father_name || '—'}</strong>, 
                  মাতা: <strong>{matchedStudent.mother_name || '—'}</strong>, 
                  শ্রেণি: <strong>{toBn(matchedStudent.class_name)}ম</strong>
                  {matchedStudent.department ? <>, বিভাগ: <strong>{matchedStudent.department}</strong></> : ''}
                  {matchedStudent.section && matchedStudent.section !== matchedStudent.department && !matchedStudent.section.includes('বিভাগ') ? (
                    <>, শাখা: <strong>{matchedStudent.section}</strong></>
                  ) : ''}, 
                  রোল নং: <strong>{toBn(matchedStudent.roll_no)}</strong>, 
                  শিক্ষার্থী আইডি নং: <strong>{matchedStudent.student_id}</strong>, 
                  অত্র বিদ্যালয়ের একজন নিয়মিত ও পাঠরত শিক্ষার্থী। 
                  <br />
                  {certType === 'yearly' ? (
                    <>
                      ২০২৬ শিক্ষাবর্ষে বিদ্যালয়ের প্রাতিষ্ঠানিক মোট <strong>{toBn(attendanceStats.workingDays)}</strong> কার্যদিবসের মধ্যে সে <strong>{toBn(attendanceStats.present)}</strong> দিন সশরীরে উপস্থিত ছিল এবং <strong>{toBn(attendanceStats.absent)}</strong> দিন অনুপস্থিত ছিল{attendanceStats.late > 0 || attendanceStats.leave > 0 ? <> (বিলম্বে আগমন: <strong>{toBn(attendanceStats.late)}</strong> দিন, ছুটি: <strong>{toBn(attendanceStats.leave)}</strong> দিন)</> : ''}। তার সার্বিক বার্ষিক গড় উপস্থিতির হার <strong>{toBn(attendanceStats.rate)}%</strong>, যা প্রাতিষ্ঠানিক মানদণ্ডে <strong>{attendanceStats.performance}</strong> হিসেবে পরিগণিত।
                    </>
                  ) : (
                    <>
                      ২০২৬ শিক্ষাবর্ষের <strong>{currentMonthData?.month}</strong> মাসে বিদ্যালয়ের প্রাতিষ্ঠানিক মোট <strong>{toBn(currentMonthData?.days)}</strong> কার্যদিবসের মধ্যে সে <strong>{toBn(currentMonthData?.present)}</strong> দিন সশরীরে উপস্থিত ছিল এবং <strong>{toBn(currentMonthData?.abs)}</strong> দিন অনুপস্থিত ছিল{currentMonthData?.late > 0 || currentMonthData?.leave > 0 ? <> (দেরি: <strong>{toBn(currentMonthData?.late)}</strong> দিন, ছুটি: <strong>{toBn(currentMonthData?.leave)}</strong> দিন)</> : ''}। উক্ত মাসে তার মাসিক উপস্থিতির হার <strong>{toBn(currentMonthData?.rate)}%</strong>, যা প্রাতিষ্ঠানিক মানদণ্ডে <strong>{currentMonthData?.status === 'উত্তম ও নিয়মিত' ? 'চমৎকার ও নিয়মিত' : currentMonthData?.status}</strong> হিসেবে পরিগণিত।
                    </>
                  )}
                  <br />
                  বিদ্যালয়ের দৈনিক ডিজিটাল হাজিরা খাতা এবং প্রাতিষ্ঠানিক রেজিস্টার অনুযায়ী তার আচরণ ও পাঠাভ্যাস সন্তোষজনক। আমি তার জীবনের সার্বিক মঙ্গল ও ভবিষ্যৎ সাফল্য কামনা করি।
                </div>

                {/* 4. Formal Attendance Summary Tables */}
                {certType === 'yearly' ? (
                  <>
                    {/* Annual KPI Table */}
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12.5px',
                      textAlign: 'center',
                      marginBottom: '16px'
                    }}>
                      <tbody>
                        <tr style={{ background: '#f8fafc' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px' }}>
                            মোট কার্যদিবস: <strong>{toBn(attendanceStats.workingDays)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#166534' }}>
                            মোট উপস্থিত: <strong>{toBn(attendanceStats.present)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#991b1b' }}>
                            মোট অনুপস্থিত: <strong>{toBn(attendanceStats.absent)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#b45309' }}>
                            দেরি ও ছুটি: <strong>{toBn(attendanceStats.late + attendanceStats.leave)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#047857', fontWeight: 800, background: '#f0fdf4' }}>
                            গড় হার: <strong>{toBn(attendanceStats.rate)}%</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', fontWeight: 800 }}>
                            {attendanceStats.performance}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Academic Year 10-Month Breakdown Mini-Table */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#064e3b', marginBottom: '4px' }}>
                        📊 শিক্ষাবর্ষের মাসভিত্তিক উপস্থিতি বিবরণী (Academic Year Monthly Summary):
                      </div>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11px',
                        textAlign: 'center'
                      }}>
                        <thead>
                          <tr style={{ background: '#ecfdf5', borderBottom: '1.5px solid #a7f3d0' }}>
                            <th style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left' }}>মাস</th>
                            {attendanceStats.monthsData.map((m, i) => (
                              <th key={i} style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{m.month.replace(' (চলতি)', '')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', fontWeight: 700 }}>কার্যদিবস</td>
                            {attendanceStats.monthsData.map((m, i) => (
                              <td key={i} style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{toBn(m.days)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', fontWeight: 700, color: '#166534' }}>উপস্থিত</td>
                            {attendanceStats.monthsData.map((m, i) => (
                              <td key={i} style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#166534', fontWeight: 700 }}>{toBn(m.present)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', fontWeight: 700, color: '#991b1b' }}>অনুপস্থিত</td>
                            {attendanceStats.monthsData.map((m, i) => (
                              <td key={i} style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#991b1b' }}>{toBn(m.abs)}</td>
                            ))}
                          </tr>
                          <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', color: '#047857' }}>হার (%)</td>
                            {attendanceStats.monthsData.map((m, i) => (
                              <td key={i} style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#047857' }}>{toBn(m.rate)}%</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Monthly KPI Table */}
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12.5px',
                      textAlign: 'center',
                      marginBottom: '16px'
                    }}>
                      <tbody>
                        <tr style={{ background: '#f8fafc' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px' }}>
                            সংশ্লিষ্ট মাস: <strong>{currentMonthData?.month} ২০২৬</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px' }}>
                            মোট কার্যদিবস: <strong>{toBn(currentMonthData?.days)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#166534' }}>
                            সশরীরে উপস্থিত: <strong>{toBn(currentMonthData?.present)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#991b1b' }}>
                            অনুপস্থিত: <strong>{toBn(currentMonthData?.abs)} দিন</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', color: '#047857', fontWeight: 800, background: '#f0fdf4' }}>
                            মাসিক হার: <strong>{toBn(currentMonthData?.rate)}%</strong>
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '7px 10px', fontWeight: 800 }}>
                            {currentMonthData?.status}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Week-by-Week Breakdown for the Month */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#064e3b', marginBottom: '4px' }}>
                        📅 সাপ্তাহিক উপস্থিতির ধারাবাহিক খতিয়ান (রবিবার থেকে বৃহস্পতিবার - সরকারি ছুটির দিন ব্যতীত):
                      </div>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11.5px',
                        textAlign: 'center'
                      }}>
                        <thead>
                          <tr style={{ background: '#ecfdf5', borderBottom: '1.5px solid #a7f3d0' }}>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>সপ্তাহ</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>সাপ্তাহিক কার্যদিবস</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px', color: '#166534' }}>উপস্থিত</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px', color: '#991b1b' }}>অনুপস্থিত</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px', color: '#047857' }}>উপস্থিতির হার (%)</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>মূল্যায়ন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyWeeks.map((w, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                              <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left', fontWeight: 700 }}>{w.weekName}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '5px' }}>{toBn(w.days)} দিন</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '5px', color: '#166534', fontWeight: 700 }}>{toBn(w.present)} দিন</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '5px', color: '#991b1b', fontWeight: 700 }}>{toBn(w.absent)} দিন</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '5px', color: '#047857', fontWeight: 800 }}>{toBn(w.rate)}%</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 700 }}>
                                <span style={{
                                  background: w.rate >= 90 ? '#dcfce7' : w.rate >= 75 ? '#eff6ff' : '#fee2e2',
                                  color: w.rate >= 90 ? '#166534' : w.rate >= 75 ? '#1e40af' : '#991b1b',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px'
                                }}>
                                  {w.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* 5. Official Signatures (No memo number, dynamic names from teacher list) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '36px',
                  paddingTop: '6px',
                  textAlign: 'center',
                  fontSize: '12.5px'
                }}>
                  <div style={{ width: '150px' }}>
                    <div style={{ borderTop: '1.5px dashed #334155', paddingTop: '4px', fontWeight: 800, color: '#0f172a' }}>
                      <div>শ্রেণি শিক্ষক</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>স্বাক্ষর ও তারিখ</div>
                    </div>
                  </div>
                  <div style={{ width: '180px' }}>
                    <div style={{ borderTop: '1.5px dashed #334155', paddingTop: '4px', fontWeight: 800, color: '#0f172a' }}>
                      <div>{asstHeadTeacher.name_bn}</div>
                      <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
                        {asstHeadTeacher.designation || 'সহকারী প্রধান শিক্ষক'}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '160px' }}>
                    <div style={{ borderTop: '1.5px dashed #334155', paddingTop: '4px', fontWeight: 800, color: '#0f172a' }}>
                      <div>{headTeacher.name_bn}</div>
                      <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
                        {headTeacher.designation || 'প্রধান শিক্ষক'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* =========================================================================
             VIEW MODE: SUMMARY DASHBOARD & SEARCH (Regular Portal Modal View)
             ========================================================================= */
          <>
            {/* Modal Top Header */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
              color: '#ffffff',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={schoolLogo} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                      স্মার্ট শিক্ষার্থী উপস্থিতি পোর্টাল (অভিভাবক ও শিক্ষার্থী কর্নার)
                    </h3>
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      EIIN: ১১৪২৯০
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.9 }}>
                    মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয় • শিক্ষার্থী উপস্থিতি প্রতিবেদন, উপস্থিতি শতকরা হার ও প্রত্যয়নপত্র
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
                title="উইন্ডো বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
              {/* Search Form Card */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '22px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    🔍 শিক্ষার্থীর উপস্থিতি তথ্য অনুসন্ধান
                  </div>
                  {/* Quick Demo Previews */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '11.5px' }}>
                    <span style={{ color: '#64748b', alignSelf: 'center' }}>ডেমো পরীক্ষা:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('10', 'বিজ্ঞান', 1, 'আহনাফ')}
                      style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ১০ম বিজ্ঞান (রোল ১)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('10', 'বিজ্ঞান', 2, 'তানজিনা')}
                      style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ১০ম বিজ্ঞান (রোল ২)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('10', 'মানবিক', 1, 'শিহাব')}
                      style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ১০ম মানবিক (রোল ১)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('6', 'all', 1, 'মাহির')}
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ৬ষ্ঠ শ্রেণি (রোল ১)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    alignItems: 'end'
                  }}>
                    {/* Class */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        শ্রেণি (Class) *
                      </label>
                      <select
                        value={searchClass}
                        onChange={e => setSearchClass(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: 700
                        }}
                        required
                      >
                        <option value="6">৬ষ্ঠ শ্রেণি (Class 6)</option>
                        <option value="7">৭ম শ্রেণি (Class 7)</option>
                        <option value="8">৮ম শ্রেণি (Class 8)</option>
                        <option value="9">৯ম শ্রেণি (Class 9)</option>
                        <option value="10">১০ম শ্রেণি (Class 10)</option>
                      </select>
                    </div>

                    {/* Group / Department (MANDATORY for Class 9 & 10) */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: ['9', '10', '৯', '১০'].includes(String(searchClass)) ? '#047857' : '#94a3b8',
                        marginBottom: '5px'
                      }}>
                        {['9', '10', '৯', '১০'].includes(String(searchClass)) ? '📚 বিভাগ (৯ম/১০ম শ্রেণির জন্য বাধ্যতামূলক) *' : 'বিভাগ (Group)'}
                      </label>
                      {['9', '10', '৯', '১০'].includes(String(searchClass)) ? (
                        <select
                          value={searchGroup}
                          onChange={e => setSearchGroup(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '2px solid #059669',
                            borderRadius: '8px',
                            fontSize: '13.5px',
                            fontWeight: 800,
                            background: '#ecfdf5',
                            color: '#064e3b'
                          }}
                          required
                        >
                          <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                          <option value="মানবিক">মানবিক বিভাগ (Humanities)</option>
                          <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা শাখা (Business Studies)</option>
                        </select>
                      ) : (
                        <input
                          disabled
                          value="সাধারণ (প্রযোজ্য নয়)"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            color: '#94a3b8',
                            fontSize: '13px'
                          }}
                        />
                      )}
                    </div>

                    {/* Section */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                         শাখা (Section)
                      </label>
                      <select
                        value={searchSection}
                        onChange={e => setSearchSection(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: 700
                        }}
                      >
                        <option value="all">যে কোনো শাখা</option>
                        <option value="পদ্মা">পদ্মা শাখা</option>
                        <option value="মেঘনা">মেঘনা শাখা</option>
                        <option value="যমুনা">যমুনা শাখা</option>
                        <option value="সুরমা">সুরমা শাখা</option>
                      </select>
                    </div>

                    {/* Roll Number */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        রোল নং (Roll No) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="যেমন: ১"
                        value={searchRoll}
                        onChange={e => setSearchRoll(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: 700
                        }}
                        required
                      />
                    </div>

                    {/* Student Name (Optional Filter) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        শিক্ষার্থীর নাম (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        placeholder="নাম দিয়ে নিশ্চিত করুন..."
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    {/* Search Button */}
                    <div>
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '11px',
                          fontSize: '14px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(6,95,70,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        🔍 উপস্থিতি রিপোর্ট দেখুন
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Search Result Presentation */}
              {searched && !matchedStudent && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '14px',
                  padding: '36px',
                  textAlign: 'center',
                  color: '#991b1b'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍❌</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    অনুগ্রহ করে শ্রেণি, রোল নং এবং ৯ম/১০ম শ্রেণির ক্ষেত্রে সঠিক বিভাগ (বিজ্ঞান/মানবিক/ব্যবসায় শিক্ষা) মিলিয়ে পুনরায় অনুসন্ধান করুন।
                  </p>
                </div>
              )}

              {matchedStudent && attendanceStats && (
                <div>
                  {/* Action Bar (View Switcher & Print Button) */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setViewMode('summary')}
                        style={{
                          background: '#065f46',
                          color: '#ffffff',
                          border: '1px solid #065f46',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        📊 উপস্থিতি বিবরণী ও বিশ্লেষণ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCertType('yearly');
                          setViewMode('certificate');
                        }}
                        style={{
                          background: '#ffffff',
                          color: '#065f46',
                          border: '1.5px solid #059669',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        📅 বাৎসরিক প্রত্যয়নপত্র ও সনদ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCertType('monthly');
                          setSelectedCertMonth(9);
                          setViewMode('certificate');
                        }}
                        style={{
                          background: '#ffffff',
                          color: '#0284c7',
                          border: '1.5px solid #0284c7',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        📆 মাসিক প্রত্যয়নপত্র ও রিপোর্ট
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCertType('yearly');
                        setViewMode('certificate');
                        setTimeout(() => window.print(), 250);
                      }}
                      style={{
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      🖨️ A4 প্রত্যয়নপত্র প্রিন্ট / PDF
                    </button>
                  </div>

                  {/* Student Identity Card */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={getStudentPhoto(matchedStudent)}
                        alt=""
                        style={{
                          width: '75px',
                          height: '75px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #059669',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h2 style={{ margin: 0, fontSize: '20px', color: '#064e3b', fontWeight: 900 }}>
                            {matchedStudent.name_bn}
                          </h2>
                          <span style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 800
                          }}>
                            রোল নং: {toBn(matchedStudent.roll_no)}
                          </span>
                        </div>
                        <div style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155' }}>
                          শ্রেণি: <strong>{toBn(matchedStudent.class_name)}ম</strong>
                          {matchedStudent.department ? ` • বিভাগ: ${matchedStudent.department}` : ''}
                          {matchedStudent.section && matchedStudent.section !== matchedStudent.department && !matchedStudent.section.includes('বিভাগ') ? (
                            ` • শাখা: ${matchedStudent.section}`
                          ) : ''}
                          {` • Student ID: ${matchedStudent.student_id}`}
                        </div>
                        <div style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                          পিতা: {matchedStudent.father_name || '—'} • মাতা: {matchedStudent.mother_name || '—'} • অভিভাবক ফোন: {matchedStudent.guardian_phone || '—'}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      background: '#f0fdf4',
                      border: '1.5px solid #a7f3d0',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      minWidth: '150px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#064e3b', fontWeight: 800, textTransform: 'uppercase' }}>
                        বার্ষিক উপস্থিতির হার
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 900, color: '#047857' }}>
                        {toBn(attendanceStats.rate)}%
                      </div>
                      <span style={{
                        background: attendanceStats.rate >= 75 ? '#10b981' : '#ef4444',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {attendanceStats.performance}
                      </span>
                    </div>
                  </div>

                  {/* 4 Metric KPI Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '14px',
                    marginBottom: '22px'
                  }}>
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      borderLeft: '5px solid #3b82f6',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>মোট কার্যদিবস</div>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b' }}>
                        {toBn(attendanceStats.workingDays)} দিন
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      borderLeft: '5px solid #10b981',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>উপস্থিত দিন</div>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: '#047857' }}>
                        {toBn(attendanceStats.present)} দিন
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      borderLeft: '5px solid #ef4444',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>অনুপস্থিত দিন</div>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: '#b91c1c' }}>
                        {toBn(attendanceStats.absent)} দিন
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      borderLeft: '5px solid #f59e0b',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>দেরি ও ছুটি</div>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: '#b45309' }}>
                        {toBn(attendanceStats.late + attendanceStats.leave)} দিন
                      </div>
                    </div>
                  </div>

                  {/* Recent 30 Days Dot Matrix */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '20px',
                    marginBottom: '22px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#064e3b', fontWeight: 800 }}>
                        📅 সাম্প্রতিক কার্যদিবসের উপস্থিতি ম্যাট্রিক্স (Recent School Days)
                      </h4>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#64748b' }}>
                        <span>🟢 উপস্থিত</span>
                        <span>🔴 অনুপস্থিত</span>
                        <span>🟡 বিলম্ব</span>
                        <span>🔵 ছুটি</span>
                        <span>⚪ শুক্র ও শনিবার (সাপ্তাহিক ছুটি)</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
                      gap: '6px',
                      padding: '6px 0'
                    }}>
                      {attendanceStats.recentDays.map((d, i) => (
                        <div
                          key={i}
                          title={d.label}
                          style={{
                            aspectRatio: '1',
                            borderRadius: '6px',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: d.status === 'present' ? '#dcfce7' : d.status === 'absent' ? '#fee2e2' : d.status === 'late' ? '#fef3c7' : d.status === 'leave' ? '#e0e7ff' : '#f1f5f9',
                            color: d.status === 'present' ? '#166534' : d.status === 'absent' ? '#991b1b' : d.status === 'late' ? '#92400e' : d.status === 'leave' ? '#3730a3' : '#94a3b8',
                            border: `1px solid ${d.status === 'present' ? '#86efac' : d.status === 'absent' ? '#fca5a5' : '#e2e8f0'}`
                          }}
                        >
                          {toBn(d.day)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Month-by-Month Breakdown Table with Direct Certificate Download Action */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '20px',
                    overflowX: 'auto'
                  }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: '15px', color: '#064e3b', fontWeight: 800 }}>
                      📑 মাসভিত্তিক পূর্ণাঙ্গ উপস্থিতি খতিয়ান ও মাসিক প্রত্যয়নপত্র - ২০২৬ (Monthly Breakdown & Certificate)
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>মাস</th>
                          <th style={{ padding: '8px' }}>মোট কার্যদিবস</th>
                          <th style={{ padding: '8px', color: '#166534' }}>উপস্থিত</th>
                          <th style={{ padding: '8px', color: '#991b1b' }}>অনুপস্থিত</th>
                          <th style={{ padding: '8px', color: '#b45309' }}>দেরি</th>
                          <th style={{ padding: '8px', color: '#4338ca' }}>ছুটি</th>
                          <th style={{ padding: '8px', background: '#ecfdf5' }}>শতকরা হার (%)</th>
                          <th style={{ padding: '8px' }}>মূল্যায়ন</th>
                          <th style={{ padding: '8px' }}>প্রত্যয়নপত্র / রিপোর্ট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceStats.monthsData.map((m, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>{m.month}</td>
                            <td style={{ padding: '8px' }}>{toBn(m.days)}</td>
                            <td style={{ padding: '8px', fontWeight: 700, color: '#166534' }}>{toBn(m.present)}</td>
                            <td style={{ padding: '8px', fontWeight: 700, color: '#991b1b' }}>{toBn(m.abs)}</td>
                            <td style={{ padding: '8px', color: '#b45309' }}>{toBn(m.late)}</td>
                            <td style={{ padding: '8px', color: '#4338ca' }}>{toBn(m.leave)}</td>
                            <td style={{ padding: '8px', fontWeight: 800, color: '#047857', background: '#f0fdf4' }}>
                              {toBn(m.rate)}%
                            </td>
                            <td style={{ padding: '8px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                background: m.rate >= 90 ? '#dcfce7' : m.rate >= 75 ? '#eff6ff' : '#fee2e2',
                                color: m.rate >= 90 ? '#166534' : m.rate >= 75 ? '#1e40af' : '#991b1b'
                              }}>
                                {m.status}
                              </span>
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCertMonth(idx);
                                  setCertType('monthly');
                                  setViewMode('certificate');
                                }}
                                style={{
                                  background: '#ecfdf5',
                                  color: '#065f46',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                📜 মাসিক প্রত্যয়ন নিন
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicAttendancePortal;
