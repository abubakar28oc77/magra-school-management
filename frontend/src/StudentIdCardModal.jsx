import React, { useState, useMemo } from 'react';
import { MOCK_SCHOOL } from './mockData.js';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export function parseNum(val, fallback = 99999) {
  if (val === null || val === undefined || val === '') return fallback;
  const bnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const s = String(val).replace(/[০-৯]/g, d => bnMap[d]).replace(/[^\d-]/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
}

export function getStudentGroupPriority(s) {
  if (!s) return 99;
  const g = [
    s.department,
    s.group_name,
    s.group,
    s.section,
    s.student_id,
    s.id
  ].filter(Boolean).map(x => String(x).toLowerCase()).join(' ');

  if (g.includes('বিজ্ঞান') || g.includes('science') || g.includes('sci')) return 1;
  if (g.includes('মানবিক') || g.includes('humanities') || g.includes('hum') || g.includes('arts')) return 2;
  if (g.includes('ব্যবসা') || g.includes('ব্যবসায়') || g.includes('ব্যবসায়') || g.includes('বাণিজ্য') || g.includes('business') || g.includes('commerce') || g.includes('bs')) return 3;
  return 4;
}

const DEFAULT_STUDENT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 115'%3E%3Cdefs%3E%3ClinearGradient id='bgA' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23e0f2fe'/%3E%3Cstop offset='100%25' stop-color='%23bae6fd'/%3E%3C/linearGradient%3E%3ClinearGradient id='skinA' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fed7aa'/%3E%3Cstop offset='100%25' stop-color='%23fba96b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='115' fill='url(%23bgA)'/%3E%3Ccircle cx='50' cy='42' r='24' fill='url(%23skinA)'/%3E%3Cpath d='M26 36 C26 14 74 14 74 36 C74 18 64 8 50 8 C36 8 26 18 26 36 Z' fill='%231e293b'/%3E%3Ccircle cx='42' cy='40' r='2.5' fill='%230f172a'/%3E%3Ccircle cx='58' cy='40' r='2.5' fill='%230f172a'/%3E%3Cpath d='M44 52 Q50 57 56 52' stroke='%23b45309' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3Cpath d='M14 115 C14 82 28 72 50 72 C72 72 86 82 86 115 Z' fill='%230369a1'/%3E%3Cpath d='M40 72 L50 96 L60 72 Z' fill='%23ffffff'/%3E%3Cpolygon points='50,78 45,83 55,83' fill='%230284c7'/%3E%3C/svg%3E";

export function StudentIdCardModal({ isOpen, onClose, students = [], initialStudentId = '' }) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || (students[0]?.id || ''));
  const [cardSide, setCardSide] = useState('both'); // 'front', 'back', 'both'
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [bulkClass, setBulkClass] = useState('10');
  const [bulkGroup, setBulkGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected single student
  const activeStudent = useMemo(() => {
    return students.find(s => String(s.id) === String(selectedStudentId) || String(s.student_id) === String(selectedStudentId)) || students[0] || null;
  }, [students, selectedStudentId]);

  // Bulk student list filtered and sorted
  const bulkStudents = useMemo(() => {
    return students.filter(s => {
      const clsMatch = !bulkClass || bulkClass === 'all' || String(s.class_name) === String(bulkClass);
      if (!clsMatch) return false;

      if (['9', '10', '৯', '১০'].includes(String(s.class_name))) {
        const prio = getStudentGroupPriority(s);
        if (bulkGroup === 'science' && prio !== 1) return false;
        if (bulkGroup === 'humanities' && prio !== 2) return false;
        if (bulkGroup === 'business' && prio !== 3) return false;
      }
      return true;
    }).sort((a, b) => {
      const ca = parseNum(a.class_name, 0);
      const cb = parseNum(b.class_name, 0);
      if (ca !== cb) return ca - cb;
      const pa = getStudentGroupPriority(a);
      const pb = getStudentGroupPriority(b);
      if (pa !== pb) return pa - pb;
      const ra = parseNum(a.roll_no, 9999);
      const rb = parseNum(b.roll_no, 9999);
      return ra - rb;
    });
  }, [students, bulkClass, bulkGroup]);

  // Filtered dropdown for single student selector
  const filteredStudentList = useMemo(() => {
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

  const getDepartmentName = (s) => {
    const p = getStudentGroupPriority(s);
    if (p === 1) return 'বিজ্ঞান বিভাগ (Science)';
    if (p === 2) return 'মানবিক বিভাগ (Humanities)';
    if (p === 3) return 'ব্যবসায় শিক্ষা (Commerce)';
    return s?.department || s?.group_name || 'সাধারণ';
  };

  const getGuardianPhone = (s) => {
    return s?.guardian_phone || s?.father_mobile || s?.mother_mobile || s?.emergency_phone || '—';
  };

  const generateSingleHtml = (s) => {
    const photo = s.photo_url || DEFAULT_STUDENT_AVATAR;
    const dept = getDepartmentName(s);
    const phone = getGuardianPhone(s);
    const blood = s.blood_group || 'O+';
    const guardian = s.guardian_name || s.father_name || s.mother_name || 'অভিভাবক';

    return `
      <div class="id-card-wrap">
        <!-- FRONT CARD -->
        <div class="id-card front-card">
          <div class="card-header">
            <img src="/school-logo.png" class="school-logo" alt="Logo" onerror="this.style.display='none'">
            <div class="school-meta">
              <h3>${school.nameBn}</h3>
              <h4>${school.nameEn}</h4>
              <p class="school-sub">EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬ • কালিহাতি, টাঙ্গাইল</p>
            </div>
          </div>
          <div class="card-ribbon">
            <span>STUDENT ID CARD • শিক্ষার্থী পরিচয়পত্র</span>
          </div>
          <div class="card-body">
            <div class="photo-col">
              <div class="photo-frame">
                <img src="${photo}" alt="Student Photo">
              </div>
              <div class="blood-badge">
                <span class="blood-icon">🩸</span>
                <span class="blood-val">${blood}</span>
              </div>
            </div>
            <div class="info-col">
              <div class="student-name-bn">${s.name_bn || '—'}</div>
              <div class="student-name-en">${s.name_en || ''}</div>
              <table class="card-table">
                <tr><td>আইডি (ID)</td><td>: <b>${s.student_id || '—'}</b></td></tr>
                <tr><td>শ্রেণি</td><td>: <b>শ্রেণি ${s.class_name || '—'} ${s.section ? '('+s.section+')' : ''}</b></td></tr>
                <tr><td>বিভাগ</td><td>: <span class="dept-tag">${dept}</span></td></tr>
                <tr><td>রোল নং</td><td>: <b class="roll-highlight">${toBengaliDigits(s.roll_no) || s.roll_no || '—'}</b></td></tr>
                <tr><td>অভিভাবক</td><td>: ${guardian}</td></tr>
                <tr><td>মোবাইল</td><td>: <span class="mono">${phone}</span></td></tr>
              </table>
            </div>
          </div>
          <div class="card-footer">
            <div class="barcode-box">
              <div class="barcode-bars">||| | |||| || ||| || |||| | ||| ||||</div>
              <span class="barcode-text">${s.student_id || 'ID-MAGRA'}</span>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <span class="sign-title">প্রধান শিক্ষক</span>
            </div>
          </div>
        </div>

        <!-- BACK CARD -->
        <div class="id-card back-card">
          <div class="back-header">
            <h4>জরুরি নির্দেশনাবলি ও বিদ্যালয়ের নিয়মাবলি</h4>
          </div>
          <div class="back-body">
            <ol class="rules-list">
              <li>এই পরিচয়পত্রটি সার্বক্ষণিক সাথে রাখা এবং প্রদর্শন করা বাধ্যতামূলক।</li>
              <li>কার্ডটি হস্তান্তরযোগ্য নয়; কোনো অবস্থাতেই অন্যের ব্যবহার নিষিদ্ধ।</li>
              <li>কার্ড হারিয়ে গেলে অবিলম্বে প্রধান শিক্ষক বা শ্রেণি শিক্ষককে অবহিত করতে হবে।</li>
              <li>পরীক্ষা হলে ও ক্লাস রুমে প্রবেশের সময় কার্ডটি দৃশ্যমান থাকা আবশ্যক।</li>
              <li>কার্ডটি পাওয়া গেলে নিচের ঠিকানায় জমা দেওয়ার জন্য অনুরোধ করা যাচ্ছে।</li>
            </ol>
            <div class="school-contact-box">
              <p><b>প্রতিষ্ঠানের ঠিকানা:</b> ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল</p>
              <p><b>হেল্পলাইন / অফিস:</b> 01712-345678 • <b>Email:</b> magrapuhs.46@gmail.com</p>
              <p class="validity">মেয়াদকাল: <b>২০২৬ শিক্ষাবর্ষ (৩১ ডিসেম্বর পর্যন্ত বৈধ)</b></p>
            </div>
          </div>
          <div class="back-footer">
            <div class="back-seal-box">
              <span class="seal-mark">★ অফিসিয়াল সিল ★</span>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <span class="sign-title">অনুমোদিত স্বাক্ষর</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handlePrintSingle = () => {
    if (!activeStudent) return;
    const w = window.open('', '_blank', 'width=950,height=800');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শিক্ষার্থী পরিচয়পত্র - ${activeStudent.name_bn || activeStudent.student_id}</title>
        <style>
          ${idCardStyles}
          body {
            background: #f1f5f9;
            padding: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          @media print {
            body { background: transparent; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="single-print-container">
          ${generateSingleHtml(activeStudent)}
        </div>
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  const handlePrintBulk = () => {
    if (!bulkStudents.length) return;
    const w = window.open('', '_blank', 'width=1100,height=900');
    if (!w) return;

    const cardsHtml = bulkStudents.map(s => `
      <div class="sheet-card-item">
        ${generateSingleHtml(s)}
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বাল্ক শিক্ষার্থী পরিচয়পত্র - শ্রেণি ${bulkClass} (${bulkStudents.length} জন)</title>
        <style>
          ${idCardStyles}
          body {
            background: #f8fafc;
            padding: 20px;
            margin: 0;
            font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif;
          }
          .sheet-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            max-width: 1000px;
            margin: 0 auto;
          }
          .sheet-card-item {
            page-break-inside: avoid;
            margin-bottom: 12px;
          }
          .id-card-wrap {
            display: flex;
            flex-direction: row;
            gap: 10px;
            justify-content: center;
          }
          @media print {
            body { padding: 0; background: transparent; }
            .sheet-grid {
              gap: 8px;
              width: 100%;
              max-width: 100%;
            }
            .no-print { display: none !important; }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet-grid">
          ${cardsHtml}
        </div>
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
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1080px',
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          color: '#ffffff', padding: '16px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
              OFFICIAL STUDENT IDENTITY STUDIO
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🪪</span> শিক্ষার্থী পরিচয়পত্র (Student ID Card)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff',
              fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', transition: 'all 0.15s ease'
            }}
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        {/* Toolbar / Mode Switcher */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setMode('single')}
              style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                border: mode === 'single' ? '2px solid #047857' : '1px solid #cbd5e1',
                background: mode === 'single' ? '#047857' : '#ffffff',
                color: mode === 'single' ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              👤 একক শিক্ষার্থী কার্ড
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                border: mode === 'bulk' ? '2px solid #047857' : '1px solid #cbd5e1',
                background: mode === 'bulk' ? '#047857' : '#ffffff',
                color: mode === 'bulk' ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              🖨️ শ্রেণিভিত্তিক বাল্ক প্রিন্ট (একসাথে সবার)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {mode === 'single' ? (
              <button
                type="button"
                onClick={handlePrintSingle}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 2px 4px rgba(4, 120, 87, 0.25)'
                }}
              >
                🖨️ এই কার্ডটি প্রিন্ট / PDF
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrintBulk}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                }}
              >
                🖨️ নির্বাচিত {bulkStudents.length} জনের কার্ড বাল্ক প্রিন্ট (A4 Sheet)
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {mode === 'single' ? (
            <div>
              {/* Single Student Selector */}
              <div style={{
                background: '#f1f5f9', padding: '12px 16px', borderRadius: '10px',
                marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'
              }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="🔍 নাম / আইডি / রোল দিয়ে খুঁজুন..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '6px',
                      border: '1px solid #cbd5e1', fontSize: '13px'
                    }}
                  />
                </div>
                <div style={{ minWidth: '280px', flex: 1 }}>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '6px',
                      border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px'
                    }}
                  >
                    {filteredStudentList.map(s => (
                      <option key={s.id} value={s.id}>
                        [শ্রেণি {s.class_name} • রোল {s.roll_no || '—'}] {s.name_bn || s.name_en} ({s.student_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCardSide('both')}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      border: cardSide === 'both' ? '1.5px solid #047857' : '1px solid #cbd5e1',
                      background: cardSide === 'both' ? '#ecfdf5' : '#fff',
                      color: cardSide === 'both' ? '#047857' : '#475569', cursor: 'pointer'
                    }}
                  >
                    উভয় দিক (Front + Back)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('front')}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      border: cardSide === 'front' ? '1.5px solid #047857' : '1px solid #cbd5e1',
                      background: cardSide === 'front' ? '#ecfdf5' : '#fff',
                      color: cardSide === 'front' ? '#047857' : '#475569', cursor: 'pointer'
                    }}
                  >
                    সম্মুখ ভাগ (Front)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('back')}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      border: cardSide === 'back' ? '1.5px solid #047857' : '1px solid #cbd5e1',
                      background: cardSide === 'back' ? '#ecfdf5' : '#fff',
                      color: cardSide === 'back' ? '#047857' : '#475569', cursor: 'pointer'
                    }}
                  >
                    বিপরীত ভাগ (Back)
                  </button>
                </div>
              </div>

              {/* Card Live Preview */}
              {activeStudent ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', padding: '10px 0' }}>
                  {(cardSide === 'front' || cardSide === 'both') && (
                    <div style={{ maxWidth: '350px', width: '100%' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', marginBottom: '6px', textAlign: 'center' }}>
                        ★ সম্মুখ ভাগ (Front Side)
                      </div>
                      <div
                        className="live-card-container"
                        dangerouslySetInnerHTML={{
                          __html: `
                            <style>${idCardStyles}</style>
                            <div class="id-card-wrap">
                              <div class="id-card front-card">
                                <div class="card-header">
                                  <img src="/school-logo.png" class="school-logo" alt="Logo" onerror="this.style.display='none'">
                                  <div class="school-meta">
                                    <h3>${school.nameBn}</h3>
                                    <h4>${school.nameEn}</h4>
                                    <p class="school-sub">EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬</p>
                                  </div>
                                </div>
                                <div class="card-ribbon">
                                  <span>STUDENT ID CARD • শিক্ষার্থী পরিচয়পত্র</span>
                                </div>
                                <div class="card-body">
                                  <div class="photo-col">
                                    <div class="photo-frame">
                                      <img src="${activeStudent.photo_url || DEFAULT_STUDENT_AVATAR}" alt="Photo">
                                    </div>
                                    <div class="blood-badge">
                                      <span class="blood-icon">🩸</span>
                                      <span class="blood-val">${activeStudent.blood_group || 'O+'}</span>
                                    </div>
                                  </div>
                                  <div class="info-col">
                                    <div class="student-name-bn">${activeStudent.name_bn || '—'}</div>
                                    <div class="student-name-en">${activeStudent.name_en || ''}</div>
                                    <table class="card-table">
                                      <tr><td>আইডি (ID)</td><td>: <b>${activeStudent.student_id || '—'}</b></td></tr>
                                      <tr><td>শ্রেণি</td><td>: <b>শ্রেণি ${activeStudent.class_name || '—'}</b></td></tr>
                                      <tr><td>বিভাগ</td><td>: <span class="dept-tag">${getDepartmentName(activeStudent)}</span></td></tr>
                                      <tr><td>রোল নং</td><td>: <b class="roll-highlight">${toBengaliDigits(activeStudent.roll_no) || activeStudent.roll_no || '—'}</b></td></tr>
                                      <tr><td>অভিভাবক</td><td>: ${activeStudent.guardian_name || activeStudent.father_name || 'অভিভাবক'}</td></tr>
                                      <tr><td>মোবাইল</td><td>: <span class="mono">${getGuardianPhone(activeStudent)}</span></td></tr>
                                    </table>
                                  </div>
                                </div>
                                <div class="card-footer">
                                  <div class="barcode-box">
                                    <div class="barcode-bars">||| | |||| || ||| || ||||</div>
                                    <span class="barcode-text">${activeStudent.student_id || 'ID-MAGRA'}</span>
                                  </div>
                                  <div class="sign-box">
                                    <div class="sign-line"></div>
                                    <span class="sign-title">প্রধান শিক্ষক</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          `
                        }}
                      />
                    </div>
                  )}

                  {(cardSide === 'back' || cardSide === 'both') && (
                    <div style={{ maxWidth: '350px', width: '100%' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', marginBottom: '6px', textAlign: 'center' }}>
                        ★ বিপরীত ভাগ (Back Side)
                      </div>
                      <div
                        className="live-card-container"
                        dangerouslySetInnerHTML={{
                          __html: `
                            <style>${idCardStyles}</style>
                            <div class="id-card-wrap">
                              <div class="id-card back-card">
                                <div class="back-header">
                                  <h4>জরুরি নির্দেশনাবলি ও বিদ্যালয়ের নিয়মাবলি</h4>
                                </div>
                                <div class="back-body">
                                  <ol class="rules-list">
                                    <li>এই পরিচয়পত্রটি সার্বক্ষণিক সাথে রাখা এবং প্রদর্শন করা বাধ্যতামূলক।</li>
                                    <li>কার্ডটি অহস্তান্তরযোগ্য; অন্যের ব্যবহার দণ্ডনীয়।</li>
                                    <li>কার্ড হারিয়ে গেলে অবিলম্বে প্রধান শিক্ষককে অবহিত করতে হবে।</li>
                                    <li>পরীক্ষা হলে ও ক্লাসে প্রবেশের সময় কার্ডটি দৃশ্যমান থাকা আবশ্যক।</li>
                                  </ol>
                                  <div class="school-contact-box">
                                    <p><b>ঠিকানা:</b> মগড়া, কালিহাতি, টাঙ্গাইল • EIIN ${school.eiin}</p>
                                    <p><b>হেল্পলাইন:</b> 01712-345678 • <b>Email:</b> magrapuhs.46@gmail.com</p>
                                    <p class="validity">মেয়াদকাল: <b>২০২৬ শিক্ষাবর্ষ (৩১ ডিসেম্বর পর্যন্ত বৈধ)</b></p>
                                  </div>
                                </div>
                                <div class="back-footer">
                                  <div class="back-seal-box">
                                    <span class="seal-mark">★ অফিসিয়াল সিল ★</span>
                                  </div>
                                  <div class="sign-box">
                                    <div class="sign-line"></div>
                                    <span class="sign-title">অনুমোদিত স্বাক্ষর</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          `
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>কোনো শিক্ষার্থী পাওয়া যায়নি।</div>
              )}
            </div>
          ) : (
            <div>
              {/* Bulk Mode Controls */}
              <div style={{
                background: '#f0fdf4', border: '1.5px solid #86efac', padding: '16px',
                borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '14px',
                alignItems: 'center', flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>শ্রেণি নির্বাচন:</label>
                  <select
                    value={bulkClass}
                    onChange={e => setBulkClass(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                  >
                    <option value="all">সকল শ্রেণি (৬ষ্ঠ-১০ম)</option>
                    <option value="6">শ্রেণি ৬ষ্ঠ</option>
                    <option value="7">শ্রেণি ৭ম</option>
                    <option value="8">শ্রেণি ৮ম</option>
                    <option value="9">শ্রেণি ৯ম</option>
                    <option value="10">শ্রেণি ১০ম (এসএসসি)</option>
                  </select>
                </div>

                {['9', '10', '৯', '১০', 'all'].includes(String(bulkClass)) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>বিভাগ / গ্রুপ:</label>
                    <select
                      value={bulkGroup}
                      onChange={e => setBulkGroup(e.target.value)}
                      style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                    >
                      <option value="all">সকল বিভাগ</option>
                      <option value="science">বিজ্ঞান বিভাগ (Science)</option>
                      <option value="humanities">মানবিক বিভাগ (Humanities)</option>
                      <option value="business">ব্যবসায় শিক্ষা (Commerce)</option>
                    </select>
                  </div>
                )}

                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#166534', fontWeight: 700 }}>
                    মুদ্রণযোগ্য শিক্ষার্থী: <span style={{ fontSize: '16px', color: '#047857' }}>{bulkStudents.length} জন</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#4b5563' }}>A4 পেপারে প্রতি শিটে ৮টি করে কার্ড স্বয়ংক্রিয় পেজিনেশন হবে</div>
                </div>
              </div>

              {/* Bulk Preview Table */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: '40px' }}>ক্র.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>স্টুডেন্ট আইডি</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: '60px' }}>রোল</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: '80px' }}>শ্রেণি</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>বিভাগ</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: '70px' }}>রক্তের গ্রুপ</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>অভিভাবকের মোবাইল</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkStudents.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{s.student_id}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{toBengaliDigits(s.roll_no) || s.roll_no}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.name_bn || s.name_en}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>শ্রেণি {s.class_name}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {getDepartmentName(s)}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                            {s.blood_group || 'O+'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{getGuardianPhone(s)}</td>
                      </tr>
                    ))}
                    {!bulkStudents.length && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          নির্বাচিত শ্রেণি বা বিভাগে কোনো শিক্ষার্থী পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • অফিসিয়াল ডিজিটাল আইডি কার্ড স্টুডিও (EIIN: 114290)
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

// Master ID Card Styling (CR-80 standard card proportion: 85.6mm x 53.98mm)
export const idCardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Outfit:wght@400;600;700&display=swap');

  * { box-sizing: border-box; }

  .id-card-wrap {
    display: flex;
    gap: 16px;
    justify-content: center;
    font-family: 'Noto Sans Bengali', 'SolaimanLipi', Arial, sans-serif;
  }

  .id-card {
    width: 320px;
    height: 480px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    color: #0f172a;
    page-break-inside: avoid;
  }

  /* FRONT CARD STYLES */
  .front-card .card-header {
    background: linear-gradient(135deg, #064e3b 0%, #047857 70%, #059669 100%);
    color: #ffffff;
    padding: 10px 10px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #fbbf24;
  }

  .school-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
    border-radius: 50%;
    background: #ffffff;
    padding: 2px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    flex-shrink: 0;
  }

  .school-meta {
    flex: 1;
    text-align: center;
  }

  .school-meta h3 {
    margin: 0;
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: -0.2px;
    line-height: 1.2;
    color: #ffffff;
  }

  .school-meta h4 {
    margin: 2px 0 0;
    font-size: 9px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    color: #fef08a;
    letter-spacing: 0.3px;
  }

  .school-sub {
    margin: 2px 0 0;
    font-size: 8.5px;
    color: #d1fae5;
  }

  .card-ribbon {
    background: #0f172a;
    color: #38bdf8;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    padding: 2.5px 4px;
    text-transform: uppercase;
  }

  .front-card .card-body {
    flex: 1;
    padding: 10px;
    display: flex;
    gap: 10px;
  }

  .photo-col {
    width: 82px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .photo-frame {
    width: 80px;
    height: 98px;
    border-radius: 6px;
    border: 2px solid #047857;
    overflow: hidden;
    background: #f1f5f9;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .blood-badge {
    background: #fef2f2;
    border: 1px solid #f87171;
    border-radius: 4px;
    padding: 2px 6px;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10.5px;
    font-weight: 800;
    color: #b91c1c;
  }

  .blood-icon { font-size: 10px; }

  .info-col {
    flex: 1;
    min-width: 0;
  }

  .student-name-bn {
    font-size: 13.5px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .student-name-en {
    font-size: 10px;
    font-family: 'Outfit', sans-serif;
    color: #0284c7;
    font-weight: 600;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-table {
    width: 100%;
    font-size: 10.5px;
    border-collapse: collapse;
  }

  .card-table td {
    padding: 2.2px 0;
    vertical-align: top;
    color: #334155;
  }

  .card-table td:first-child {
    width: 60px;
    color: #64748b;
    font-weight: 600;
  }

  .dept-tag {
    background: #ecfdf5;
    color: #047857;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 9.5px;
    font-weight: 700;
    border: 0.5px solid #a7f3d0;
  }

  .roll-highlight {
    font-size: 12.5px;
    color: #b91c1c;
  }

  .mono {
    font-family: monospace;
    font-weight: 700;
    font-size: 10px;
  }

  .front-card .card-footer {
    padding: 6px 12px 8px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .barcode-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .barcode-bars {
    font-family: monospace;
    letter-spacing: 2px;
    font-weight: 900;
    font-size: 13px;
    color: #1e293b;
    line-height: 1;
  }

  .barcode-text {
    font-size: 8px;
    font-family: monospace;
    color: #64748b;
    letter-spacing: 1px;
  }

  .sign-box {
    text-align: center;
    width: 80px;
  }

  .sign-line {
    border-top: 1px dashed #334155;
    margin-bottom: 2px;
  }

  .sign-title {
    font-size: 9px;
    font-weight: 700;
    color: #047857;
  }

  /* BACK CARD STYLES */
  .back-card {
    background: #fafaf9;
    display: flex;
    flex-direction: column;
  }

  .back-header {
    background: #0f172a;
    color: #ffffff;
    padding: 8px 10px;
    text-align: center;
  }

  .back-header h4 {
    margin: 0;
    font-size: 11px;
    font-weight: 700;
    color: #fde047;
  }

  .back-body {
    flex: 1;
    padding: 10px 12px;
    font-size: 9.5px;
    color: #334155;
    line-height: 1.45;
  }

  .rules-list {
    margin: 0;
    padding-left: 16px;
    margin-bottom: 10px;
  }

  .rules-list li {
    margin-bottom: 4px;
  }

  .school-contact-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;
    font-size: 9px;
    margin-top: 6px;
  }

  .school-contact-box p {
    margin: 2px 0;
  }

  .validity {
    color: #047857;
    font-weight: 700;
    margin-top: 4px !important;
  }

  .back-footer {
    padding: 8px 12px 10px;
    background: #f5f5f4;
    border-top: 1px solid #e7e5e4;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .seal-mark {
    font-size: 8.5px;
    font-weight: 700;
    color: #b91c1c;
    border: 1px dashed #b91c1c;
    padding: 2px 6px;
    border-radius: 4px;
    background: #fef2f2;
  }

  @media print {
    .id-card {
      box-shadow: none !important;
      border: 1px solid #94a3b8 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;
