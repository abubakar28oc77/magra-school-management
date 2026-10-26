import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_SCHOOL } from './mockData.js';
import schoolLogo from '../public/school-logo.png';

export const STUDENT_CERT_CONFIG = {
  testimonial: { label: '📜 প্রশংসাপত্র', title: 'প্রশংসাপত্র (Testimonial)', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  transfer: { label: '📑 ছাড়পত্র (TC)', title: 'ছাড়পত্র / Transfer Certificate (TC)', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  bonafide: { label: '📄 প্রত্যয়ন পত্র', title: 'প্রত্যয়ন পত্র (Bonafide Certificate)', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' }
};

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export function getDepartmentLabel(s) {
  if (!s) return 'সাধারণ';
  const sid = String(s.student_id || s.id || '').toUpperCase();
  if (sid.includes('-HUM') || sid.includes('_HUM') || sid.includes('/HUM') || sid.includes('HUM-') || sid.includes('-ARTS-')) return 'মানবিক বিভাগ';
  if (sid.includes('-BS') || sid.includes('_BS') || sid.includes('/BS') || sid.includes('BS-') || sid.includes('-COM-') || sid.includes('-BUS-')) return 'ব্যবসায় শিক্ষা শাখা';
  if (sid.includes('-SCI') || sid.includes('_SCI') || sid.includes('/SCI') || sid.includes('SCI-')) return 'বিজ্ঞান বিভাগ';

  const dept = String(s.department || '').trim().toLowerCase();
  if (dept.includes('মানবিক') || dept.includes('humanities') || dept.includes('arts')) return 'মানবিক বিভাগ';
  if (dept.includes('ব্যবসা') || dept.includes('বাণিজ্য') || dept.includes('business') || dept.includes('commerce') || dept === 'bs') return 'ব্যবসায় শিক্ষা শাখা';
  if (dept.includes('বিজ্ঞান') || dept.includes('science') || dept === 'sci') return 'বিজ্ঞান বিভাগ';

  const grp = String(s.group_name || s.group || s.section || '').trim().toLowerCase();
  if (grp.includes('মানবিক') || grp.includes('humanities') || grp.includes('arts')) return 'মানবিক বিভাগ';
  if (grp.includes('ব্যবসা') || grp.includes('বাণিজ্য') || grp.includes('business') || grp.includes('commerce') || grp === 'bs') return 'ব্যবসায় শিক্ষা শাখা';
  if (grp.includes('বিজ্ঞান') || grp.includes('science') || grp === 'sci') return 'বিজ্ঞান বিভাগ';

  return s?.department || s?.group_name || 'সাধারণ';
}

export function StudentCertificatesModal({
  isOpen,
  onClose,
  students = [],
  initialStudentId = '',
  initialCertType = 'testimonial' // 'testimonial', 'transfer', 'bonafide', 'office_copies'
}) {
  const [certType, setCertType] = useState(initialCertType || 'testimonial');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || (students[0]?.id || ''));
  const [searchQuery, setSearchQuery] = useState('');

  // Soft Office Copies Archive & Tracking State
  const [officeCopies, setOfficeCopies] = useState(() => {
    try {
      const raw = localStorage.getItem('magra_student_certificate_office_copies');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load student office copies', e);
      return [];
    }
  });
  const [officeNotes, setOfficeNotes] = useState('');
  const [saveToast, setSaveToast] = useState(null);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveTypeFilter, setArchiveTypeFilter] = useState('all');
  const [archiveClassFilter, setArchiveClassFilter] = useState('all');
  const [previewCopyModal, setPreviewCopyModal] = useState(null);
  const [previewCopyFormat, setPreviewCopyFormat] = useState('office'); // 'office' | 'original'

  // Customizable certificate fields
  const [customMemoNo, setCustomMemoNo] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [passingYear, setPassingYear] = useState('২০২৬');
  const [examName, setExamName] = useState('মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)');
  const [gpaResult, setGpaResult] = useState('৫.০০ (A+)');
  const [conductRemark, setConductRemark] = useState('উত্তম ও প্রশংসনীয়');
  const [tcReason, setTcReason] = useState('অভিভাবকের বাসস্থান স্থানান্তর ও সুবিধার জন্য');
  const [paidUptoMonth, setPaidUptoMonth] = useState('ডিসেম্বর ২০২৬');
  const [signeeTitle, setSigneeTitle] = useState('মুহাম্মদ শফিকুল ইসলাম, প্রধান শিক্ষক');
  const [customBirthDate, setCustomBirthDate] = useState('');

  // Sync prop changes
  useEffect(() => {
    if (initialCertType) setCertType(initialCertType);
  }, [initialCertType]);

  useEffect(() => {
    if (initialStudentId) setSelectedStudentId(initialStudentId);
  }, [initialStudentId]);

  // Persist office copies to localStorage
  const persistOfficeCopies = (newList) => {
    setOfficeCopies(newList);
    try {
      localStorage.setItem('magra_student_certificate_office_copies', JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save student office copies to localStorage', e);
    }
  };

  // Date formatter for Bengali certificate display (DD-MM-YYYY)
  const formatBnDate = (dStr) => {
    if (!dStr) return '০১-০১-২০১০';
    const clean = String(dStr).slice(0, 10);
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return toBengaliDigits(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return toBengaliDigits(clean);
  };

  // Active student object
  const student = useMemo(() => {
    return students.find(s => String(s.id) === String(selectedStudentId) || String(s.student_id) === String(selectedStudentId)) || students[0] || null;
  }, [students, selectedStudentId]);

  // Memo number (default empty so it displays only "স্মারক নংঃ")
  const memoNo = (customMemoNo || '').trim();
  const birthDate = customBirthDate || formatBnDate(student?.date_of_birth || student?.extended_profile?.dob || '2010-01-01');

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

  // Unique classes for archive filter
  const availableClasses = useMemo(() => {
    const set = new Set();
    students.forEach(s => { if (s.class_name) set.add(String(s.class_name)); });
    officeCopies.forEach(c => { if (c.class_name) set.add(String(c.class_name)); });
    return Array.from(set).sort();
  }, [students, officeCopies]);

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

  // Render certificate HTML for preview and printing
  const generateCertificateHtml = (customType = null) => {
    const effectiveType = customType || certType;
    let contentHtml = '';
    let titleBn = '';
    let titleEn = '';

    if (effectiveType === 'testimonial') {
      titleBn = 'প্রশংসাপত্র';
      titleEn = 'TESTIMONIAL / COMMENDATION CERTIFICATE';
      contentHtml = `
        <div class="cert-body-text">
          <p class="cert-para">
            এই মর্মে প্রশংসাপত্র প্রদান করা যাইতেছে যে, <b class="cert-highlight-name">${studentNameBn}</b>${student?.name_en ? ` (${student.name_en})` : ''}, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>, গ্রাম: <b>${village}</b>, ডাকঘর: <b>${postOffice}</b>, উপজেলা: <b>${upazila}</b>, জেলা: <b>${district}</b>; সে ঐতিহ্যবাহী <b>${school.nameBn}</b>-এর <b>${deptName}</b> হইতে <b>${passingYear}</b> সনের <b>${examName}</b>-এ নিয়মিত পরীক্ষার্থী হিসেবে অংশগ্রহণ করিয়া গ্রেড পয়েন্ট এভারেজ (GPA) <b>${gpaResult}</b> পাইয়া সাফল্যের সহিত উত্তীর্ণ হইয়াছে। বিদ্যালয়ের ভর্তি বহির রেকর্ড অনুযায়ী তাহার জন্ম তারিখ: <b>${birthDate}</b> খ্রি.।
          </p>
          <p class="cert-para">
            বিদ্যালয়ে অধ্যয়নকালে সে সর্বদা নম্র, ভদ্র, বিনয়ী এবং অধ্যবসায়ী ছিল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা পরিপন্থী বা নৈতিকতা বিরোধী কোনো কার্যকলাপে সে কখনো লিপ্ত ছিল না। তাহার নৈতিক চরিত্র <b>${conductRemark || 'উত্তম ও প্রশংসনীয়'}</b>।
          </p>
          <p class="cert-para cert-closing-para">
            আমি তাহার ভবিষ্যৎ জীবনের সর্বাঙ্গীন উন্নতি ও উজ্জ্বল সাফল্য কামনা করি।
          </p>
        </div>
      `;
    } else if (effectiveType === 'transfer') {
      titleBn = 'ছাড়পত্র';
      titleEn = 'TRANSFER CERTIFICATE (TC)';
      contentHtml = `
        <div class="cert-body-text">
          <p class="cert-para">
            এই মর্মে ছাড়পত্র প্রদান করা যাইতেছে যে, <b class="cert-highlight-name">${studentNameBn}</b>${student?.name_en ? ` (${student.name_en})` : ''}, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>, গ্রাম: <b>${village}</b>, ডাকঘর: <b>${postOffice}</b>, উপজেলা: <b>${upazila}</b>, জেলা: <b>${district}</b>; সে ঐতিহ্যবাহী <b>${school.nameBn}</b>-এর <b>শ্রেণি ${className}</b> (${deptName})-এ নিয়মিত অধ্যয়নরত ছিল। তাহার স্টুডেন্ট আইডি: <b>${studentId}</b> এবং শ্রেণি রোল নম্বর: <b>${rollNo}</b>। বিদ্যালয়ের ভর্তি বহির রেকর্ড অনুযায়ী তাহার জন্ম তারিখ: <b>${birthDate}</b> খ্রি.${student?.birth_registration_no ? ` (জন্ম নিবন্ধন নং: ${toBengaliDigits(student.birth_registration_no)})` : ''}।
          </p>
          <p class="cert-para">
            বিদ্যালয়ের রেকর্ড ও হিসাব বহির তথ্যানুযায়ী তাহার <b>${paidUptoMonth}</b> পর্যন্ত সর্বপ্রকার বেতন, সেশন চার্জ ও ফি পরিশোধিত রহিয়াছে এবং অত্র প্রতিষ্ঠানের নিকট তাহার কোনো প্রকার আর্থিক বা প্রাতিষ্ঠানিক দেনা-পাওনা বকেয়া নাই। <b>${tcReason}</b> তাহার অভিভাবকের আবেদনের প্রেক্ষিতে অত্র বিদ্যালয় হইতে এই ছাড়পত্র (Transfer Certificate) মঞ্জুর ও প্রদান করা হইল।
          </p>
          <p class="cert-para">
            বিদ্যালয়ে অধ্যয়নকালে সে সর্বদা নম্র, ভদ্র, বিনয়ী ও নিয়মানুবর্তী ছিল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা পরিপন্থী বা নৈতিকতা বিরোধী কোনো কার্যকলাপে সে কখনো লিপ্ত ছিল না। তাহার নৈতিক চরিত্র <b>${conductRemark || 'উত্তম ও প্রশংসনীয়'}</b>।
          </p>
          <p class="cert-para cert-closing-para">
            আমি তাহার ভবিষ্যৎ শিক্ষা ও ব্যক্তিজীবনের সর্বাঙ্গীন মঙ্গল, উন্নতি ও উত্তরোত্তর সাফল্য কামনা করি।
          </p>
        </div>
      `;
    } else {
      // Bonafide / প্রত্যয়নপত্র
      titleBn = 'প্রত্যয়নপত্র';
      titleEn = 'STUDENT BONAFIDE / CITIZEN CERTIFICATE';
      contentHtml = `
        <div class="cert-body-text">
          <p class="cert-para">
            এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <b class="cert-highlight-name">${studentNameBn}</b>${student?.name_en ? ` (${student.name_en})` : ''}, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>, গ্রাম: <b>${village}</b>, ডাকঘর: <b>${postOffice}</b>, উপজেলা: <b>${upazila}</b>, জেলা: <b>${district}</b>; সে ঐতিহ্যবাহী <b>${school.nameBn}</b>-এর <b>শ্রেণি ${className}</b> (${deptName})-এর একজন নিয়মিত ও বাধ্যগত শিক্ষার্থী। তাহার শ্রেণি রোল নম্বর <b>${rollNo}</b>। বিদ্যালয়ের ভর্তি বহির রেকর্ড অনুযায়ী তাহার জন্ম তারিখ: <b>${birthDate}</b> খ্রি.।
          </p>
          <p class="cert-para">
            বিদ্যালয়ে অধ্যয়নকালে সে সর্বদা নম্র, ভদ্র, বিনয়ী এবং অধ্যবসায়ী ছিল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা পরিপন্থী বা নৈতিকতা বিরোধী কোনো কার্যকলাপে সে কখনো লিপ্ত ছিল না। তাহার নৈতিক চরিত্র <b>${conductRemark || 'উত্তম ও প্রশংসনীয়'}</b>।
          </p>
          <p class="cert-para cert-closing-para">
            আমি তাহার ভবিষ্যৎ জীবনের সর্বাঙ্গীন উন্নতি ও উজ্জ্বল সাফল্য কামনা করি।
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
                <img src="${schoolLogo}" class="cert-logo" alt="Logo">
                <div class="cert-school-title">
                  <h1>${school.nameBn}</h1>
                  <h2>${school.nameEn}</h2>
                  <p class="cert-school-sub">
                    EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬ • ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল
                  </p>
                  <p class="cert-school-contact">Email: ${school.email}</p>
                </div>
              </div>
              <div class="cert-type-ribbon">
                <div class="ribbon-bn">${titleBn}</div>
                <div class="ribbon-en">${titleEn}</div>
              </div>
            </div>

            <!-- Reference & Date Line -->
            <div class="cert-ref-date">
              <div class="ref-col">স্মারক নংঃ <b>${memoNo}</b></div>
              <div class="date-col">তারিখ: <b>${formatBnDate(issueDate)}</b> খ্রি.</div>
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

              <div class="sign-block right-sign">
                <div class="sign-space"></div>
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

  // Generate Reference No: SOC-STU-YYYY-XXXX
  const generateRefNo = () => {
    const year = new Date().getFullYear();
    const count = officeCopies.length + 1;
    const seq = String(count).padStart(4, '0');
    return `SOC-STU-${year}-${seq}`;
  };

  // Save Soft Office Copy into local database
  const handleSaveOfficeCopy = (silent = false) => {
    if (!student) {
      alert('অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন।');
      return null;
    }
    const currentDocHtml = generateCertificateHtml();
    const refNo = generateRefNo();
    const newRecord = {
      id: 'soc_stu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      ref_no: refNo,
      memo_no: memoNo || 'স্মারক নং অনুল্লেখিত',
      issue_date: issueDate,
      saved_at: new Date().toISOString(),
      certificate_type: certType,
      certificate_title: STUDENT_CERT_CONFIG[certType]?.title || (certType === 'testimonial' ? 'প্রশংসাপত্র' : certType === 'transfer' ? 'ছাড়পত্র (TC)' : 'প্রত্যয়ন পত্র'),
      student_id: student.id,
      student_code: student.student_id || student.id,
      student_name_bn: studentNameBn,
      student_name_en: student?.name_en || '',
      roll_no: rollNo,
      class_name: className,
      department: deptName,
      father_name: fatherName,
      mother_name: motherName,
      custom_fields: {
        customMemoNo,
        issueDate,
        passingYear,
        examName,
        gpaResult,
        conductRemark,
        tcReason,
        paidUptoMonth,
        signeeTitle,
        customBirthDate,
        officeNotes: officeNotes.trim()
      },
      document_html: currentDocHtml,
      status: 'active'
    };

    const updated = [newRecord, ...officeCopies];
    persistOfficeCopies(updated);

    if (!silent) {
      setSaveToast({
        type: 'success',
        msg: `✅ সফলভাবে সফট অফিস কপি জমা রাখা হয়েছে! (রেফারেন্স: ${refNo})`
      });
      setTimeout(() => setSaveToast(null), 3500);
    }
    return newRecord;
  };

  // Standard Print
  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=1000,height=850');
    if (!w) {
      alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে ব্রাউজার থেকে অনুমতি দিন।');
      return;
    }

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${certType === 'testimonial' ? 'প্রশংসাপত্র' : certType === 'transfer' ? 'ছাড়পত্র (TC)' : 'প্রত্যয়নপত্র'} - ${student?.name_bn || 'Student'}</title>
        <style>
          ${certificateStyles}
          body {
            background: #ffffff;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          @media print {
            body { padding: 0; background: #fff !important; }
            .no-print { display: none !important; }
            .certificate-sheet { box-shadow: none !important; border: none !important; }
            .cert-type-ribbon {
              padding: 9px 52px !important;
              background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%) !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ribbon-bn {
              font-size: 32px !important;
              font-weight: 900 !important;
              letter-spacing: 2px !important;
              line-height: 1.25 !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ribbon-en {
              font-size: 10px !important;
              letter-spacing: 1.5px !important;
              color: #fef08a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .official-seal-circle {
              width: 100px !important;
              height: 100px !important;
              border: 1.5px dashed #94a3b8 !important;
              background: transparent !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .seal-caption {
              font-size: 11px !important;
              color: #64748b !important;
            }
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

  // One-click Print and Save Office Copy
  const handlePrintAndSave = () => {
    const saved = handleSaveOfficeCopy(true);
    handlePrint();
    setSaveToast({
      type: 'success',
      msg: `🖨️ প্রিন্ট সম্পন্ন ও সফট অফিস কপি সংরক্ষিত হয়েছে! (${saved ? saved.ref_no : ''})`
    });
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Re-print or print as official Office Copy from archive
  const handlePrintArchived = (record, asOfficeCopy = false) => {
    const w = window.open('', '_blank', 'width=1000,height=850');
    if (!w) {
      alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে ব্রাউজার থেকে অনুমতি দিন।');
      return;
    }

    const officeHeaderHtml = asOfficeCopy ? `
      <div class="office-copy-top-banner">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="background:#047857;color:#fff;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;letter-spacing:0.5px;">📁 অফিস রেকর্ড কপি • STUDENT OFFICE COPY</span>
            <span style="font-size:12px;font-weight:800;color:#064e3b;">রেফারেন্স: ${record.ref_no}</span>
          </div>
          <div style="font-size:11px;color:#334155;margin-top:3px;">
            স্মারক নং: <b>${record.memo_no}</b> • ইস্যু তারিখ: <b>${formatBnDate(record.issue_date)}</b> • সনদ: <b>${record.certificate_title}</b>
          </div>
        </div>
        <div style="text-align:right;font-size:11px;color:#475569;">
          <div>ডিজিটাল সংরক্ষণ: <b>${new Date(record.saved_at).toLocaleString('bn-BD')}</b></div>
          <div>শিক্ষার্থী: <b>${record.student_name_bn}</b> (শ্রেণি: ${record.class_name}, রোল: ${record.roll_no})</div>
        </div>
      </div>
    ` : '';

    const officeFooterHtml = asOfficeCopy ? `
      <div class="office-copy-bottom-meta">
        <div>
          <div>দাপ্তরিক রেজিস্টার পৃষ্ঠা নং: ____________________</div>
          <div style="margin-top:3px;">নথি/ফাইল নং: ____________________</div>
          <div style="margin-top:3px;color:#047857;font-weight:600;font-size:10px;">ডিজিটাল সফট কপি ডাটাবেসে নথিভুক্ত সংরক্ষিত</div>
        </div>
        <div style="text-align:center;">
          <div style="border-top:1px dotted #475569;width:140px;margin:18px auto 3px;"></div>
          <b>অফিস সহকারী / রেজিস্টার রক্ষক</b>
        </div>
        <div style="text-align:right;">
          <div style="border-top:1px dotted #475569;width:150px;margin:18px 0 3px auto;"></div>
          <b>প্রতিষ্ঠান প্রধানের প্রতিস্বাক্ষর</b>
        </div>
      </div>
    ` : '';

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${asOfficeCopy ? '[অফিস কপি] ' : ''}${record.ref_no} - ${record.student_name_bn}</title>
        <style>
          ${certificateStyles}
          body {
            background: #ffffff;
            padding: 20px;
            margin: 0;
            display: flex;
            justify-content: center;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          @media print {
            body { padding: 0; background: transparent; }
            .no-print { display: none !important; }
            .certificate-sheet { box-shadow: none !important; border: none !important; }
            .cert-type-ribbon {
              padding: 9px 52px !important;
              background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%) !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ribbon-bn {
              font-size: 32px !important;
              font-weight: 900 !important;
              letter-spacing: 2px !important;
              line-height: 1.25 !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ribbon-en {
              font-size: 10px !important;
              letter-spacing: 1.5px !important;
              color: #fef08a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .official-seal-circle {
              width: 100px !important;
              height: 100px !important;
              border: 1.5px dashed #94a3b8 !important;
              background: transparent !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .seal-caption {
              font-size: 11px !important;
              color: #64748b !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container" style="width: 100%; max-width: 820px; position: relative;">
          ${asOfficeCopy ? '<div class="office-copy-watermark">OFFICE COPY • অফিস কপি</div>' : ''}
          ${officeHeaderHtml}
          ${record.document_html}
          ${officeFooterHtml}
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // Download standalone HTML soft copy file
  const handleDownloadHtml = (record) => {
    const fullHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${record.ref_no} - ${record.student_name_bn} - ${record.certificate_title}</title>
  <style>
    ${certificateStyles}
    body { background: #ffffff; padding: 20px; margin: 0; display: flex; justify-content: center; }
    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      body { padding: 0; background: transparent; }
      .no-print { display: none !important; }
      .certificate-sheet { box-shadow: none !important; border: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-container" style="max-width: 820px; margin: 0 auto;">
    ${record.document_html}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (record.student_name_bn || 'student').replace(/\s+/g, '_');
    a.download = `SoftCopy_${record.ref_no}_${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export full CSV register of saved office copies
  const handleExportRegistryCSV = () => {
    if (!officeCopies.length) {
      alert('কোনো সংরক্ষিত রেকর্ড নেই।');
      return;
    }
    const headers = ['ক্রমিক', 'রেফারেন্স আইডি', 'স্মারক নং', 'ইস্যুর তারিখ', 'সনদের ধরন', 'শিক্ষার্থীর নাম (বাংলা)', 'শিক্ষার্থীর নাম (ইংরেজি)', 'শ্রেণি', 'বিভাগ/শাখা', 'রোল নম্বর', 'শিক্ষার্থী আইডি', 'পিতার নাম', 'মাতার নাম', 'অফিস ট্র্যাকিং নোট', 'সংরক্ষণের সময়'];
    const rows = officeCopies.map((r, idx) => [
      idx + 1,
      `"${r.ref_no || ''}"`,
      `"${r.memo_no || ''}"`,
      `"${r.issue_date || ''}"`,
      `"${r.certificate_title || ''}"`,
      `"${r.student_name_bn || ''}"`,
      `"${r.student_name_en || ''}"`,
      `"${r.class_name || ''}"`,
      `"${r.department || ''}"`,
      `"${r.roll_no || ''}"`,
      `"${r.student_code || ''}"`,
      `"${r.father_name || ''}"`,
      `"${r.mother_name || ''}"`,
      `"${(r.custom_fields?.officeNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(r.saved_at).toLocaleString('bn-BD')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Certificates_Office_Copy_Registry_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export JSON backup of all office copies
  const handleExportJSON = () => {
    if (!officeCopies.length) {
      alert('কোনো সংরক্ষিত রেকর্ড নেই।');
      return;
    }
    const jsonStr = JSON.stringify(officeCopies, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Certificates_Archive_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data)) {
          const existingIds = new Set(officeCopies.map(c => c.id));
          const newItems = data.filter(d => !existingIds.has(d.id));
          const combined = [...newItems, ...officeCopies];
          persistOfficeCopies(combined);
          setSaveToast({
            type: 'success',
            msg: `✅ ব্যাকআপ থেকে ${newItems.length} টি রেকর্ড সফলভাবে ইমপোর্ট করা হয়েছে!`
          });
          setTimeout(() => setSaveToast(null), 3500);
        } else {
          alert('ফাইলটি সঠিক ফরম্যাটে নেই।');
        }
      } catch (err) {
        alert('ফাইল পড়তে ত্রুটি হয়েছে: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Delete an archived office copy
  const handleDeleteOfficeCopy = (id) => {
    const target = officeCopies.find(c => c.id === id);
    if (!target) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${target.student_name_bn}" এর জন্য সংরক্ষিত অফিস কপি (${target.ref_no}) মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = officeCopies.filter(c => c.id !== id);
    persistOfficeCopies(updated);
    if (previewCopyModal?.id === id) {
      setPreviewCopyModal(null);
    }
    setSaveToast({
      type: 'success',
      msg: `🗑️ অফিস কপি (${target.ref_no}) সফলভাবে মুছে ফেলা হয়েছে।`
    });
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Filter archived copies
  const filteredOfficeCopies = useMemo(() => {
    return officeCopies.filter(c => {
      if (archiveTypeFilter !== 'all' && c.certificate_type !== archiveTypeFilter) return false;
      if (archiveClassFilter !== 'all' && String(c.class_name) !== String(archiveClassFilter)) return false;
      if (archiveSearch.trim()) {
        const q = archiveSearch.toLowerCase();
        const match =
          (c.student_name_bn && c.student_name_bn.toLowerCase().includes(q)) ||
          (c.student_name_en && c.student_name_en.toLowerCase().includes(q)) ||
          (c.student_code && String(c.student_code).toLowerCase().includes(q)) ||
          (c.roll_no && String(c.roll_no).includes(q)) ||
          (c.ref_no && c.ref_no.toLowerCase().includes(q)) ||
          (c.memo_no && c.memo_no.toLowerCase().includes(q)) ||
          (c.father_name && c.father_name.toLowerCase().includes(q)) ||
          (c.custom_fields?.officeNotes && c.custom_fields.officeNotes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [officeCopies, archiveTypeFilter, archiveClassFilter, archiveSearch]);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="modal-card" style={{
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1200px',
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

        {/* Certificate Type Switcher & Action Bar */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setCertType('testimonial'); setCustomMemoNo(''); }}
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
              onClick={() => { setCertType('transfer'); setCustomMemoNo(''); }}
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
              onClick={() => { setCertType('bonafide'); setCustomMemoNo(''); }}
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
            <button
              type="button"
              onClick={() => setCertType('office_copies')}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                border: certType === 'office_copies' ? '2px solid #047857' : '1px solid #cbd5e1',
                background: certType === 'office_copies' ? '#047857' : '#ffffff',
                color: certType === 'office_copies' ? '#ffffff' : '#047857',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: certType === 'office_copies' ? '0 2px 4px rgba(4, 120, 87, 0.2)' : 'none'
              }}
            >
              📁 সংরক্ষিত অফিস কপি ({toBengaliDigits(officeCopies.length)})
            </button>
          </div>

          {certType !== 'office_copies' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleSaveOfficeCopy()}
                style={{
                  background: '#ffffff',
                  color: '#047857',
                  border: '1.5px solid #047857',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
                title="প্রিন্ট না করে শুধু সফট অফিস কপি জমা রাখুন"
              >
                💾 সফট অফিস কপি জমা রাখুন
              </button>

              <button
                type="button"
                onClick={handlePrintAndSave}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 6px rgba(4, 120, 87, 0.25)'
                }}
                title="সফট অফিস কপি সংরক্ষণ এবং সরাসরি প্রিন্ট/PDF করুন"
              >
                🖨️ প্রিন্ট ও অফিস কপি সংরক্ষণ
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="সরাসরি প্রিন্ট (অফিস কপি সংরক্ষণ ব্যতীত)"
              >
                🖨️ শুধু প্রিন্ট
              </button>
            </div>
          )}
        </div>

        {/* Save Toast Notification */}
        {saveToast && (
          <div style={{
            background: saveToast.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: saveToast.type === 'success' ? '#065f46' : '#991b1b',
            borderBottom: `1.5px solid ${saveToast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            padding: '9px 24px', fontSize: '13px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease-in'
          }}>
            <span>{saveToast.msg}</span>
            <button
              onClick={() => setSaveToast(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Main Content */}
        {certType === 'office_copies' ? (
          /* ========================================================================= */
          /* Archive / Registrar Tab for Student Soft Office Copies                    */
          /* ========================================================================= */
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* KPI Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>মোট সংরক্ষিত সফট অফিস কপি</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {toBengaliDigits(officeCopies.length)} টি
                </div>
                <div style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600 }}>ডিজিটাল আর্কাইভ ডাটাবেস</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #bae6fd', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>📜 প্রশংসাপত্র কপি</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>
                  {toBengaliDigits(officeCopies.filter(c => c.certificate_type === 'testimonial').length)} টি
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Testimonials</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309' }}>📑 ছাড়পত্র (TC) কপি</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#92400e', marginTop: '2px' }}>
                  {toBengaliDigits(officeCopies.filter(c => c.certificate_type === 'transfer').length)} টি
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Transfer Certificates</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>📄 প্রত্যয়ন পত্র কপি</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>
                  {toBengaliDigits(officeCopies.filter(c => c.certificate_type === 'bonafide').length)} টি
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Bonafide Certificates</div>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '320px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '220px', flex: 1.5 }}>
                  <input
                    type="text"
                    placeholder="🔍 নাম, রোল, শ্রেণি, স্মারক নং, রেফারেন্স বা নোট খুঁজুন..."
                    value={archiveSearch}
                    onChange={e => setArchiveSearch(e.target.value)}
                    style={{ width: '100%', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
                <div style={{ minWidth: '170px', flex: 1 }}>
                  <select
                    value={archiveTypeFilter}
                    onChange={e => setArchiveTypeFilter(e.target.value)}
                    style={{ width: '100%', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                  >
                    <option value="all">সব ধরনের সনদ ও ডকুমেন্ট</option>
                    <option value="testimonial">📜 প্রশংসাপত্র (Testimonial)</option>
                    <option value="transfer">📑 ছাড়পত্র (TC)</option>
                    <option value="bonafide">📄 প্রত্যয়ন পত্র (Bonafide)</option>
                  </select>
                </div>
                <div style={{ minWidth: '150px', flex: 1 }}>
                  <select
                    value={archiveClassFilter}
                    onChange={e => setArchiveClassFilter(e.target.value)}
                    style={{ width: '100%', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                  >
                    <option value="all">সকল শ্রেণি ({availableClasses.length})</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>শ্রেণি {cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleExportRegistryCSV}
                  style={{
                    background: '#ffffff', color: '#047857', border: '1px solid #047857',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px'
                  }}
                  title="সংরক্ষিত অফিস কপির পূর্ণাঙ্গ রেজিস্টার CSV ডাউনলোড করুন"
                >
                  📥 রেজিস্টার CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  style={{
                    background: '#ffffff', color: '#0369a1', border: '1px solid #0369a1',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px'
                  }}
                  title="ডিজিটাল আর্কাইভের পূর্ণাঙ্গ ব্যাকআপ JSON ফাইল ডাউনলোড করুন"
                >
                  💾 JSON ব্যাকআপ
                </button>
                <label
                  style={{
                    background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px'
                  }}
                  title="পূর্ববর্তী ব্যাকআপ JSON থেকে ডাটা ইমপোর্ট করুন"
                >
                  📤 ইমপোর্ট
                  <input type="file" accept=".json,application/json" hidden onChange={handleImportJSON} />
                </label>
              </div>
            </div>

            {/* Registrar Table */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {filteredOfficeCopies.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '42px', marginBottom: '10px' }}>📁</div>
                  <h3 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '16px', fontWeight: 700 }}>কোনো সফট অফিস কপি পাওয়া যায়নি</h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', maxWidth: '480px', marginInline: 'auto' }}>
                    {officeCopies.length === 0 
                      ? 'আপনি যেকোনো সনদে গিয়ে "💾 সফট অফিস কপি জমা রাখুন" বা "🖨️ প্রিন্ট ও অফিস কপি সংরক্ষণ" বাটনে ক্লিক করলে তা স্বয়ংক্রিয়ভাবে এখানে অফিস রেকর্ড ফাইল হিসেবে সংরক্ষিত থাকবে।'
                      : 'অনুসন্ধানের শর্তের সাথে মিলে এমন কোনো অফিস কপি পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে সন্ধান করুন।'}
                  </p>
                  {officeCopies.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setCertType('testimonial')}
                      style={{
                        background: '#0369a1', color: '#fff', border: 'none', padding: '8px 18px',
                        borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                      }}
                    >
                      📜 প্রশংসাপত্র তৈরি ও অফিস কপি সংরক্ষণ করুন
                    </button>
                  )}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#0f172a' }}>
                      <th style={{ padding: '10px 12px', width: '110px', textAlign: 'center' }}>রেফারেন্স নং</th>
                      <th style={{ padding: '10px 12px', width: '140px' }}>স্মারক ও তারিখ</th>
                      <th style={{ padding: '10px 12px', minWidth: '180px' }}>শিক্ষার্থী ও রোল</th>
                      <th style={{ padding: '10px 12px', width: '150px' }}>সনদের ধরন</th>
                      <th style={{ padding: '10px 12px', minWidth: '170px' }}>পিতা ও মাতা</th>
                      <th style={{ padding: '10px 12px', minWidth: '160px' }}>নোট / বিবরণ</th>
                      <th style={{ padding: '10px 12px', width: '130px', textAlign: 'center' }}>সংরক্ষণের সময়</th>
                      <th style={{ padding: '10px 12px', width: '220px', textAlign: 'center' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOfficeCopies.map((item, idx) => {
                      const cfg = STUDENT_CERT_CONFIG[item.certificate_type] || {
                        label: item.certificate_title || item.certificate_type,
                        color: '#0369a1',
                        bg: '#f0f9ff',
                        border: '#bae6fd'
                      };
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fbfcfd' }}>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>#{toBengaliDigits(idx + 1)}</div>
                            <span style={{
                              display: 'inline-block', background: '#ecfdf5', color: '#047857',
                              fontWeight: 800, fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                              border: '1px solid #a7f3d0', fontFamily: 'monospace'
                            }}>
                              {item.ref_no}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.memo_no || 'অনুল্লেখিত'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>ইস্যু: {formatBnDate(item.issue_date)}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '13px' }}>{item.student_name_bn}</div>
                            <div style={{ fontSize: '11.5px', color: '#475569' }}>
                              শ্রেণি: <b>{item.class_name}</b> • রোল: <b>{item.roll_no}</b> {item.department ? `• ${item.department}` : ''}
                            </div>
                            {item.student_code && (
                              <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>ID: {item.student_code}</div>
                            )}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-block', padding: '3px 8px', borderRadius: '6px',
                              fontSize: '11px', fontWeight: 700, background: cfg.bg, color: cfg.color,
                              border: `1px solid ${cfg.border}`
                            }}>
                              {cfg.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '11.5px', color: '#334155' }}>
                            <div>পিতা: {item.father_name || '—'}</div>
                            <div>মাতা: {item.mother_name || '—'}</div>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '11.5px', color: '#475569' }}>
                            {item.custom_fields?.officeNotes ? (
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-block' }}>
                                📌 {item.custom_fields.officeNotes}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                            <div>{new Date(item.saved_at).toLocaleDateString('bn-BD')}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(item.saved_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setPreviewCopyModal(item)}
                                style={{
                                  background: '#0284c7', color: '#fff', border: 'none', padding: '4px 8px',
                                  borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                                }}
                                title="প্রিভিউ দেখুন"
                              >
                                👁️ দেখুন
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintArchived(item, false)}
                                style={{
                                  background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                                  padding: '4px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                                }}
                                title="মূল সনদ সরাসরি প্রিন্ট করুন"
                              >
                                🖨️ প্রিন্ট
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintArchived(item, true)}
                                style={{
                                  background: '#047857', color: '#fff', border: 'none',
                                  padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                                }}
                                title="অফিস রেকর্ড কপি ফরম্যাটে প্রিন্ট করুন (সিল ও রেজিস্টার সহ)"
                              >
                                📑 অফিস কপি
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadHtml(item)}
                                style={{
                                  background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1',
                                  padding: '4px 7px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer'
                                }}
                                title="এইচটিএমএল ফাইল হিসেবে ডাউনলোড করুন"
                              >
                                📥
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOfficeCopy(item.id)}
                                style={{
                                  background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3',
                                  padding: '4px 7px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer'
                                }}
                                title="এই সফট অফিস কপিটি মুছে ফেলুন"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* Main Certificate Editor & Live Preview Panel                              */
          /* ========================================================================= */
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
                  onChange={e => {
                    setSelectedStudentId(e.target.value);
                    setCustomBirthDate('');
                    setCustomMemoNo('');
                  }}
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
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>স্মারক নংঃ</label>
                  <input
                    type="text"
                    placeholder="স্মারক নং (ঐচ্ছিক)"
                    value={customMemoNo}
                    onChange={e => setCustomMemoNo(e.target.value)}
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

              {/* Birth Date Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>জন্ম তারিখ (ভর্তি বহির রেকর্ড অনুযায়ী):</label>
                <input
                  type="text"
                  value={birthDate}
                  onChange={e => setCustomBirthDate(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  placeholder="DD-MM-YYYY"
                />
              </div>

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

              {/* Office Tracking Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#047857' }}>📁 অফিস ট্র্যাকিং নোট (ঐচ্ছিক):</label>
                <input
                  type="text"
                  placeholder="উদাঃ বোর্ড পরীক্ষার জন্য বা আবেদনক্রমে ইস্যুকৃত..."
                  value={officeNotes}
                  onChange={e => setOfficeNotes(e.target.value)}
                  style={{ padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveOfficeCopy()}
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1.5px dashed #059669',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '4px'
                  }}
                >
                  💾 এই কপির সফট অফিস কপি জমা রাখুন
                </button>
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
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • অফিসিয়াল প্রত্যয়ন ও প্রশংসাপত্র সিস্টেম (EIIN: 114290) • সংরক্ষিত কপি: {toBengaliDigits(officeCopies.length)} টি
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

      {/* ========================================================================= */}
      {/* Archived Document Preview Modal                                           */}
      {/* ========================================================================= */}
      {previewCopyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 10000, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '890px',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#047857', color: '#ffffff', padding: '12px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>📁</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                    সংরক্ষিত অফিস কপি প্রিভিউ: {previewCopyModal.student_name_bn}
                  </h3>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    রেফারেন্স: {previewCopyModal.ref_no} • স্মারক: {previewCopyModal.memo_no} • শ্রেণি: {previewCopyModal.class_name} • রোল: {previewCopyModal.roll_no}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewCopyModal(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Format Toggle Bar */}
            <div style={{
              padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewCopyFormat('office')}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    border: previewCopyFormat === 'office' ? '2px solid #047857' : '1px solid #cbd5e1',
                    background: previewCopyFormat === 'office' ? '#ecfdf5' : '#ffffff',
                    color: previewCopyFormat === 'office' ? '#047857' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  📑 অফিস কপি ফরম্যাট (সিল ও রেজিস্টার সহ)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCopyFormat('original')}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    border: previewCopyFormat === 'original' ? '2px solid #0369a1' : '1px solid #cbd5e1',
                    background: previewCopyFormat === 'original' ? '#f0f9ff' : '#ffffff',
                    color: previewCopyFormat === 'original' ? '#0369a1' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  📜 মূল সনদ ফরম্যাট
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handlePrintArchived(previewCopyModal, previewCopyFormat === 'office')}
                  style={{
                    background: '#047857', color: '#ffffff', border: 'none',
                    padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  🖨️ প্রিন্ট / PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadHtml(previewCopyModal)}
                  style={{
                    background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1',
                    padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📥 HTML ডাউনলোড
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '24px', background: '#cbd5e1',
              display: 'flex', justifyContent: 'center'
            }}>
              <div style={{ width: '100%', maxWidth: '780px', position: 'relative' }}>
                {previewCopyFormat === 'office' && (
                  <>
                    <div className="office-copy-watermark">OFFICE COPY • অফিস কপি</div>
                    <div className="office-copy-top-banner">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#047857', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                            📁 অফিস রেকর্ড কপি • STUDENT OFFICE COPY
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#064e3b' }}>রেফারেন্স: {previewCopyModal.ref_no}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#334155', margin: '4px 0 0' }}>
                          স্মারক নং: <b>{previewCopyModal.memo_no}</b> • ইস্যু তারিখ: <b>{formatBnDate(previewCopyModal.issue_date)}</b> • সনদ: <b>{previewCopyModal.certificate_title}</b>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                        <div>ডিজিটাল সংরক্ষণ: <b>{new Date(previewCopyModal.saved_at).toLocaleString('bn-BD')}</b></div>
                        <div>শিক্ষার্থী: <b>{previewCopyModal.student_name_bn}</b> (শ্রেণি: {previewCopyModal.class_name}, রোল: {previewCopyModal.roll_no})</div>
                      </div>
                    </div>
                  </>
                )}

                <div
                  className="cert-preview-holder"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <style>${certificateStyles}</style>
                      ${previewCopyModal.document_html}
                    `
                  }}
                />

                {previewCopyFormat === 'office' && (
                  <div className="office-copy-bottom-meta" style={{ background: '#fff', padding: '12px 16px', borderRadius: '6px', marginTop: '12px' }}>
                    <div>
                      <div>দাপ্তরিক রেজিস্টার পৃষ্ঠা নং: ____________________</div>
                      <div style={{ marginTop: '3px' }}>নথি/ফাইল নং: ____________________</div>
                      <div style={{ marginTop: '3px', color: '#047857', fontWeight: 600, fontSize: '10px' }}>ডিজিটাল সফট কপি ডাটাবেসে নথিভুক্ত সংরক্ষিত</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1px dotted #475569', width: '140px', margin: '18px auto 3px' }}></div>
                      <b>অফিস সহকারী / রেজিস্টার রক্ষক</b>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ borderTop: '1px dotted #475569', width: '150px', margin: '18px 0 3px auto' }}></div>
                      <b>প্রতিষ্ঠান প্রধানের প্রতিস্বাক্ষর</b>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
  }

  .cert-school-title h1 {
    font-family: 'Noto Sans Bengali', sans-serif;
    font-size: 26px;
    font-weight: 900;
    color: #1e3a8a;
    margin: 0;
    line-height: 1.2;
    letter-spacing: 0.5px;
  }

  .cert-school-title h2 {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    font-weight: 700;
    color: #0369a1;
    margin: 3px 0 0;
    letter-spacing: 1.5px;
  }

  .cert-school-sub {
    font-size: 11.5px;
    font-weight: 600;
    color: #334155;
    margin: 4px 0 0;
  }

  .cert-school-contact {
    font-size: 10.5px;
    color: #64748b;
    margin: 2px 0 0;
  }

  /* Ribbon Title */
  .cert-type-ribbon {
    margin: 10px auto 0;
    display: inline-block;
    background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%);
    color: #ffffff;
    padding: 6px 36px;
    border-radius: 30px;
    box-shadow: 0 4px 10px rgba(3, 105, 161, 0.35);
    border: 2px solid #fbbf24;
    text-align: center;
  }

  .ribbon-bn {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 1.5px;
    line-height: 1.2;
  }

  .ribbon-en {
    font-family: 'Cinzel', serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: #fef08a;
    margin-top: 2px;
  }

  /* Reference & Date Line */
  .cert-ref-date {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #1e293b;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 8px;
    margin-bottom: 20px;
  }

  .ref-col b, .date-col b {
    color: #0f172a;
  }

  /* Main Body with classical typography */
  .cert-main-wrapper {
    position: relative;
    min-height: 250px;
    padding: 10px 4px;
    z-index: 1;
  }

  .watermark-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 240px;
    height: 240px;
    background-image: url('${schoolLogo}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }

  .cert-body-text {
    position: relative;
    z-index: 2;
  }

  .cert-para {
    font-size: 15px;
    line-height: 2.2;
    text-align: justify;
    color: #1e293b;
    margin: 0 0 16px 0;
    text-indent: 40px;
    letter-spacing: 0.2px;
  }

  .cert-closing-para {
    margin-top: 24px;
    font-weight: 600;
    color: #047857;
  }

  .cert-highlight-name {
    font-size: 17px;
    color: #1e3a8a;
    font-weight: 800;
    padding: 0 4px;
  }

  .cert-para b {
    color: #0f172a;
    font-weight: 700;
  }

  .cert-meta-tag {
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
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: 170px;
  }

  .official-seal-circle {
    width: 96px;
    height: 96px;
    border: 1.5px dashed #94a3b8;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    margin: 0 auto 6px;
  }

  .seal-caption {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-align: center;
    letter-spacing: 0.5px;
  }

  /* Office Copy Specific Styles */
  .office-copy-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-28deg);
    font-size: 50px;
    font-weight: 900;
    color: rgba(6, 78, 59, 0.08);
    text-transform: uppercase;
    letter-spacing: 4px;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    border: 4px dashed rgba(6, 78, 59, 0.15);
    padding: 10px 30px;
    border-radius: 12px;
  }

  .office-copy-top-banner {
    background: #f0fdf4;
    border: 1.5px dashed #047857;
    border-radius: 6px;
    padding: 8px 14px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Noto Sans Bengali', Arial, sans-serif;
  }

  .office-copy-bottom-meta {
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1.5px dashed #64748b;
    display: flex;
    justify-content: space-between;
    font-family: 'Noto Sans Bengali', Arial, sans-serif;
  }
`;
