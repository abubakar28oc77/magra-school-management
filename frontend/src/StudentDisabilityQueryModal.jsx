import React, { useState, useMemo } from 'react';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

function getStudentPhone(s) {
  if (!s) return '—';
  const gp = (s.guardian_phone || '').trim();
  if (gp) return gp;
  const fp = (s.father_mobile || '').trim();
  if (fp) return fp;
  const mp = (s.mother_mobile || '').trim();
  if (mp) return mp;
  return (s.emergency_phone || '—').trim();
}

function formatGroup(grp) {
  if (!grp || grp === '—' || grp === 'none' || grp === '') return '—';
  return grp;
}

export function parseNum(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  const bnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const s = String(val).replace(/[০-৯]/g, d => bnMap[d]).replace(/[^\d-]/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
}

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='%2394a3b8'%3E%3Ccircle cx='40' cy='30' r='18'/%3E%3Cpath d='M14 70 C14 52 26 48 40 48 C54 48 66 52 66 70 Z'/%3E%3C/svg%3E";

export const DISABILITY_CATEGORIES = [
  'অটিস্টিক',
  'শারীরিক প্রতিবন্ধিতা',
  'মানসিক অসুস্থতাজনিত প্রতিবন্ধিতা',
  'দৃষ্টি প্রতিবন্ধিতা',
  'বাক প্রতিবন্ধিতা',
  'বুদ্ধি প্রতিবন্ধিতা',
  'শ্রবণ প্রতিবন্ধিতা',
  'শ্রবণ-দৃষ্টি প্রতিবন্ধিতা',
  'ডাউন সিন্ড্রোম',
  'অন্যান্য'
];

export function getDisabilityType(s) {
  if (!s) return '';
  if (s.disability_type) return s.disability_type;
  if (s.is_special_needs === 'হ্যাঁ' && s.special_needs) return s.special_needs;
  if (s.special_needs && s.special_needs !== 'না') return s.special_needs;
  return '';
}

export function isSpecialNeedsStudent(s) {
  if (!s) return false;
  if (s.is_special_needs === 'হ্যাঁ') return true;
  if (s.disability_type) return true;
  if (s.special_needs && s.special_needs !== 'না') return true;
  return false;
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

export function StudentDisabilityQueryModal({ isOpen, onClose, students = [] }) {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDisability, setSelectedDisability] = useState('all_special'); // 'all_special', specific type, or 'all_students'
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const rawList = Array.isArray(students) ? students : (students?.items || []);

  // Filter students based on Class & Disability query
  const filteredStudents = useMemo(() => {
    return rawList.filter(s => {
      // 1. Class filter
      if (selectedClass && selectedClass !== 'all') {
        const selC = parseNum(selectedClass, -1);
        const stuC = parseNum(s.class_name, -2);
        if (selC !== stuC && String(s.class_name).trim() !== String(selectedClass).trim()) {
          return false;
        }
      }

      // 2. Disability filter
      const isSpecial = isSpecialNeedsStudent(s);
      const disType = getDisabilityType(s);

      if (selectedDisability === 'all_special') {
        if (!isSpecial) return false;
      } else if (selectedDisability && selectedDisability !== 'all_students') {
        if (!disType || !disType.includes(selectedDisability)) {
          return false;
        }
      }

      // 3. Group filter
      if (selectedGroup) {
        const grp = String(s.department || s.group_name || s.group || s.section || '').toLowerCase();
        const gf = selectedGroup.toLowerCase();
        if (gf.includes('বিজ্ঞান') && !(grp.includes('বিজ্ঞান') || grp.includes('sci'))) return false;
        if (gf.includes('মানবিক') && !(grp.includes('মানবিক') || grp.includes('hum') || grp.includes('arts'))) return false;
        if (gf.includes('ব্যবসায়') && !(grp.includes('ব্যবসা') || grp.includes('বাণিজ্য') || grp.includes('bs'))) return false;
      }

      // 4. Section filter
      if (selectedSection && String(s.section || '').toLowerCase() !== String(selectedSection).toLowerCase()) {
        return false;
      }

      // 5. Gender filter
      if (selectedGender) {
        const g = (s.gender || '').toLowerCase();
        if (selectedGender === 'female' && !(g === 'female' || g === 'ছাত্রী' || g === 'নারী' || g === 'মহিলা')) return false;
        if (selectedGender === 'male' && (g === 'female' || g === 'ছাত্রী' || g === 'নারী' || g === 'মহিলা')) return false;
      }

      // 6. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          s.student_id,
          s.name_bn,
          s.name_en,
          s.roll_no,
          s.father_name,
          s.mother_name,
          s.current_village,
          s.guardian_phone,
          s.father_mobile,
          disType
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      const ca = parseNum(a.class_name, 99);
      const cb = parseNum(b.class_name, 99);
      if (ca !== cb) return ca - cb;

      if (ca === 9 || ca === 10 || String(a.class_name).includes('9') || String(a.class_name).includes('10') || String(a.class_name).includes('৯') || String(a.class_name).includes('১০')) {
        const pa = getStudentGroupPriority(a);
        const pb = getStudentGroupPriority(b);
        if (pa !== pb) return pa - pb;
      }

      const ra = parseNum(a.roll_no, 9999);
      const rb = parseNum(b.roll_no, 9999);
      if (ra !== rb) return ra - rb;

      return String(a.student_id || a.name_bn || '').localeCompare(String(b.student_id || b.name_bn || ''));
    });
  }, [rawList, selectedClass, selectedDisability, selectedGroup, selectedSection, selectedGender, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;
    const typeCounts = {};

    filteredStudents.forEach(s => {
      const g = (s.gender || '').toLowerCase();
      if (g === 'female' || g === 'ছাত্রী' || g === 'নারী' || g === 'মহিলা') {
        femaleCount++;
      } else {
        maleCount++;
      }

      const dt = getDisabilityType(s) || 'অনির্দিষ্ট';
      typeCounts[dt] = (typeCounts[dt] || 0) + 1;
    });

    return {
      total: filteredStudents.length,
      male: maleCount,
      female: femaleCount,
      typeCounts
    };
  }, [filteredStudents]);

  // Print Official Disability & Special Needs Report
  const printReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    const classLabel = selectedClass === 'all' 
      ? 'সকল শ্রেণি (৬ষ্ঠ - ১০ম)' 
      : `শ্রেণি ${selectedClass} (${selectedClass === '6' ? '৬ষ্ঠ শ্রেণি' : selectedClass === '7' ? '৭ম শ্রেণি' : selectedClass === '8' ? '৮ম শ্রেণি' : selectedClass === '9' ? '৯ম শ্রেণি' : selectedClass === '10' ? '১০ম শ্রেণি' : selectedClass})`;

    const disabilityLabel = selectedDisability === 'all_special'
      ? 'সকল বিশেষ চাহিদাসম্পন্ন শিক্ষার্থী'
      : selectedDisability === 'all_students'
      ? 'সকল শিক্ষার্থী'
      : selectedDisability;

    const groupLabel = selectedGroup ? selectedGroup : 'সকল বিভাগ / শাখা';

    const rowsHtml = filteredStudents.map((s, idx) => {
      const photoSrc = s.photo_url || DEFAULT_AVATAR;
      const fatherName = s.father_name || s.father_name_en || '—';
      const motherName = s.mother_name || s.mother_name_en || '—';
      const village = s.current_village || s.permanent_village || s.address || 'মগড়া';
      const mobile = getStudentPhone(s);
      const disType = getDisabilityType(s) || 'প্রযোজ্য নয়';
      const groupText = s.department || s.group_name || s.group || (parseNum(s.class_name, 10) <= 8 ? 'সাধারণ' : '—');
      const classText = `শ্রেণি ${s.class_name || '—'}`;

      return `
        <tr>
          <td style="text-align:center;font-weight:700;vertical-align:middle;">${idx + 1}</td>
          <td style="text-align:center;vertical-align:middle;padding:4px;">
            <div style="width:44px;height:44px;border:1px solid #cbd5e1;border-radius:4px;overflow:hidden;margin:0 auto;display:flex;align-items:center;justify-content:center;background:#f8fafc;">
              <img src="${photoSrc}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='${DEFAULT_AVATAR}'"/>
            </div>
          </td>
          <td style="text-align:center;font-weight:800;font-size:13px;color:#0b6b43;vertical-align:middle;">${s.roll_no || '—'}</td>
          <td style="text-align:center;font-family:monospace;font-size:11px;font-weight:600;vertical-align:middle;">${s.student_id || '—'}</td>
          <td style="vertical-align:middle;">
            <div style="font-weight:800;font-size:13px;color:#0f172a;">${s.name_bn || s.name_en || '—'}</div>
            ${s.name_en && s.name_bn !== s.name_en ? `<div style="font-size:11px;color:#64748b;">${s.name_en}</div>` : ''}
          </td>
          <td style="text-align:center;vertical-align:middle;font-weight:600;font-size:12px;">
            <div>${classText}</div>
            <div style="font-size:10.5px;color:#0369a1;">${groupText}</div>
          </td>
          <td style="text-align:center;vertical-align:middle;">
            <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fde68a;padding:3px 8px;border-radius:999px;font-weight:700;font-size:11.5px;">
              ♿ ${disType}
            </span>
          </td>
          <td style="vertical-align:middle;font-size:11.5px;">
            <div><b>পিতা:</b> ${fatherName}</div>
            <div><b>মাতা:</b> ${motherName}</div>
          </td>
          <td style="text-align:center;vertical-align:middle;font-family:monospace;font-size:12px;font-weight:600;">${mobile}</td>
          <td style="vertical-align:middle;font-size:11.5px;">${village}</td>
          <td style="text-align:center;vertical-align:middle;width:60px;"></td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বিশেষ চাহিদাসম্পন্ন শিক্ষার্থী শ্রেণিভিত্তিক প্রতিবেদন - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page { size: A4 landscape; margin: 8mm 10mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; font-size: 12px; }
          .header { text-align: center; border-bottom: 2.5px solid #047857; padding-bottom: 6px; margin-bottom: 8px; }
          .school-title { font-size: 22px; font-weight: 800; color: #047857; margin: 0; }
          .school-sub { font-size: 12px; color: #475569; margin: 2px 0 0 0; }
          .report-title { font-size: 14.5px; font-weight: 800; color: #92400e; margin: 6px 0 2px 0; background: #fef3c7; display: inline-block; padding: 4px 20px; border-radius: 4px; border: 1px solid #fde68a; letter-spacing: 0.5px; }
          .meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; color: #334155; font-weight: 700; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          th { background: #f8fafc; color: #0f172a; font-weight: 700; border: 1px solid #475569; padding: 6px 4px; font-size: 11.5px; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 11.5px; }
          tr:nth-child(even) { background-color: #fafaf9; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 12px; display: flex; gap: 10px; justify-content: flex-end; background: #fef3c7; padding: 8px 12px; border-radius: 8px; border: 1px solid #fde68a;">
          <button onclick="window.print()" style="background:#d97706;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;">🖨️ প্রিন্ট করুন / Save as PDF</button>
          <button onclick="window.close()" style="background:#64748b;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;">✕ বন্ধ করুন</button>
        </div>
        <div class="header">
          <div class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          <div class="school-sub">ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল • EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.</div>
          <div class="report-title">♿ বিশেষ চাহিদাসম্পন্ন ও প্রতিবন্ধী শিক্ষার্থী শ্রেণিভিত্তিক প্রতিবেদন — ২০২৬</div>
        </div>
        <div class="meta-bar">
          <div><b>🏫 শ্রেণি:</b> ${classLabel} | <b>♿ ক্যাটাগরি:</b> ${disabilityLabel} | <b>বিভাগ/শাখা:</b> ${groupLabel}</div>
          <div><b>📊 মোট শিক্ষার্থী:</b> ${toBengaliDigits(filteredStudents.length)} জন (ছাত্র: ${toBengaliDigits(stats.male)}, ছাত্রী: ${toBengaliDigits(stats.female)}) | <b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:28px;">ক্র.নং</th>
              <th style="width:48px;">ছবি</th>
              <th style="width:36px;background:#fef3c7;color:#92400e;">রোল</th>
              <th style="width:68px;">আইডি (ID)</th>
              <th style="text-align:left;padding-left:8px;">শিক্ষার্থীর নাম</th>
              <th style="width:80px;">শ্রেণি ও বিভাগ</th>
              <th style="width:130px;background:#fef3c7;color:#92400e;">প্রতিবন্ধিতার ধরন</th>
              <th style="text-align:left;padding-left:8px;">পিতা ও মাতার নাম</th>
              <th style="width:92px;">মোবাইল নম্বর</th>
              <th style="width:105px;">গ্রামের নাম</th>
              <th style="width:55px;">স্বাক্ষর/মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">কোনো বিশেষ চাহিদাসম্পন্ন শিক্ষার্থী পাওয়া যায়নি</td></tr>'}
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:40px;padding:0 20px;">
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">শ্রেণি শিক্ষকের স্বাক্ষর</div>
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">কাউন্সেলর / প্রত্যয়নকারী</div>
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  // CSV Export
  const downloadCsv = () => {
    const headers = [
      'Roll No',
      'Student ID',
      'Student Name (Bangla)',
      'Student Name (English)',
      'Class',
      'Department / Group',
      'Disability Type',
      'Special Needs Status',
      'Gender',
      'Father Name',
      'Mother Name',
      'Guardian Phone',
      'Village'
    ];

    const rows = filteredStudents.map(s => ({
      'Roll No': s.roll_no || '',
      'Student ID': s.student_id || '',
      'Student Name (Bangla)': s.name_bn || '',
      'Student Name (English)': s.name_en || '',
      'Class': s.class_name || '',
      'Department / Group': s.department || s.group_name || s.group || '',
      'Disability Type': getDisabilityType(s) || '—',
      'Special Needs Status': isSpecialNeedsStudent(s) ? 'হ্যাঁ' : 'না',
      'Gender': s.gender || '',
      'Father Name': s.father_name || s.father_name_en || '',
      'Mother Name': s.mother_name || s.mother_name_en || '',
      'Guardian Phone': getStudentPhone(s),
      'Village': s.current_village || s.permanent_village || s.address || ''
    }));

    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `magra-special-needs-students-${selectedClass}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="custom-modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
      padding: '16px'
    }}>
      <div className="custom-modal-container" style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '1240px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fde68a'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>♿</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                বিশেষ চাহিদা ও প্রতিবন্ধিতা কুয়েরি ও রিপোর্ট
              </h2>
            </div>
            <p style={{ margin: '3px 0 0 32px', fontSize: '12px', color: '#fef3c7' }}>
              শ্রেণিভিত্তিক ও প্রতিবন্ধিতার ধরন অনুযায়ী শিক্ষার্থী কুয়েরি, তালিকা এবং প্রিন্ট/PDF জেনারেটর
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={printReport}
              style={{
                background: '#fff',
                color: '#92400e',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}
            >
              🖨️ প্রিন্ট / PDF রিপোর্ট
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              📊 CSV
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                color: '#fff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Query Controls & Filter Toolbar */}
        <div style={{
          padding: '14px 20px',
          background: '#fffbeb',
          borderBottom: '1px solid #fef3c7',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
            {/* Class Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>🏫 শ্রেণি:</span>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d97706',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#92400e',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">🏫 সকল শ্রেণি (৬ষ্ঠ - ১০ম)</option>
                <option value="6">শ্রেণি ৬ (৬ষ্ঠ)</option>
                <option value="7">শ্রেণি ৭ (৭ম)</option>
                <option value="8">শ্রেণি ৮ (৮ম)</option>
                <option value="9">শ্রেণি ৯ (৯ম)</option>
                <option value="10">শ্রেণি ১০ (১০ম)</option>
              </select>
            </div>

            {/* Disability Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>♿ প্রতিবন্ধিতা:</span>
              <select
                value={selectedDisability}
                onChange={e => setSelectedDisability(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d97706',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#b45309',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all_special">♿ সকল বিশেষ চাহিদাসম্পন্ন শিক্ষার্থী</option>
                {DISABILITY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="all_students">👥 সকল শিক্ষার্থী (সাধারণসহ)</option>
              </select>
            </div>

            {/* Group Filter */}
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#fff'
              }}
            >
              <option value="">সব বিভাগ / শাখা</option>
              <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
              <option value="মানবিক">মানবিক বিভাগ</option>
              <option value="ব্যবসায়">ব্যবসায় শিক্ষা শাখা</option>
            </select>

            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#fff'
              }}
            >
              <option value="">সব জেন্ডার</option>
              <option value="male">ছাত্র (পুরুষ)</option>
              <option value="female">ছাত্রী (নারী)</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 নাম / আইডি / মোবাইল / গ্রাম..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 12px',
                  paddingLeft: '28px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  width: '200px',
                  backgroundColor: '#fff'
                }}
              />
              <span style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '12px', color: '#94a3b8' }}>🔍</span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#fff' : 'transparent',
                color: viewMode === 'table' ? '#92400e' : '#64748b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📋 তালিকা ভিউ
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#fff' : 'transparent',
                color: viewMode === 'grid' ? '#92400e' : '#64748b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🎴 কার্ড ভিউ
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{
          padding: '10px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: '12.5px'
        }}>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            padding: '4px 12px',
            borderRadius: '6px',
            color: '#92400e',
            fontWeight: 800
          }}>
            ♿ মোট ফলাফল: {toBengaliDigits(stats.total)} জন
          </div>
          <div style={{ color: '#0369a1', fontWeight: 700 }}>
            👦 ছাত্র: {toBengaliDigits(stats.male)} জন
          </div>
          <div style={{ color: '#be185d', fontWeight: 700 }}>
            👧 ছাত্রী: {toBengaliDigits(stats.female)} জন
          </div>
          <div style={{ color: '#475569', fontSize: '11.5px', marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(stats.typeCounts).slice(0, 4).map(([t, cnt]) => (
              <span key={t} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                <b>{t}:</b> {toBengaliDigits(cnt)}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Body / Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>♿</div>
              <h3 style={{ fontSize: '16px', color: '#334155', margin: '0 0 6px' }}>
                কোনো শিক্ষার্থী পাওয়া যায়নি
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                নির্বাচিত শ্রেণি বা প্রতিবন্ধিতার ধরন অনুযায়ী কোনো তথ্য মেলেনি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#0f172a', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>ক্র.নং</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '50px' }}>ছবি</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '60px' }}>রোল</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '100px' }}>আইডি</th>
                    <th style={{ padding: '8px 10px' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '90px' }}>শ্রেণি ও শাখা</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '160px' }}>প্রতিবন্ধিতার ধরন</th>
                    <th style={{ padding: '8px 10px' }}>অভিভাবক ও সম্পর্ক</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '110px' }}>মোবাইল</th>
                    <th style={{ padding: '8px 10px' }}>গ্রাম / ঠিকানা</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const disType = getDisabilityType(s) || 'সাধারণ / প্রযোজ্য নয়';
                    const isSpec = isSpecialNeedsStudent(s);
                    return (
                      <tr
                        key={s.id || idx}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: idx % 2 === 0 ? '#fff' : '#fefce8'
                        }}
                      >
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <img
                            src={s.photo_url || DEFAULT_AVATAR}
                            alt=""
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid #cbd5e1'
                            }}
                            onError={e => { e.target.src = DEFAULT_AVATAR; }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: '#047857', fontSize: '13px' }}>
                          {s.roll_no || '—'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: '11.5px', color: '#0284c7', fontWeight: 600 }}>
                          {s.student_id || '—'}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                            {s.name_bn || s.name_en}
                          </div>
                          {s.name_en && s.name_bn !== s.name_en && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{s.name_en}</div>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>
                          <div>শ্রেণি {s.class_name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#0369a1' }}>
                            {s.department || s.group_name || s.group || s.section || 'সাধারণ'}
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: isSpec ? '#fef3c7' : '#f1f5f9',
                            color: isSpec ? '#92400e' : '#64748b',
                            border: `1px solid ${isSpec ? '#fde68a' : '#e2e8f0'}`,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontWeight: 700,
                            fontSize: '11.5px'
                          }}>
                            {isSpec ? `♿ ${disType}` : 'না'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 700, color: '#334155' }}>
                            {s.guardian_name || s.father_name || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {s.guardian_relation ? `(${s.guardian_relation})` : s.father_name ? '(পিতা)' : ''}
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                          {getStudentPhone(s)}
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: '12px', color: '#475569' }}>
                          {s.current_village || s.permanent_village || s.address || 'মগড়া'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px'
            }}>
              {filteredStudents.map((s, idx) => {
                const disType = getDisabilityType(s) || 'সাধারণ';
                const isSpec = isSpecialNeedsStudent(s);
                return (
                  <div
                    key={s.id || idx}
                    style={{
                      background: '#fff',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      boxShadow: '0 2px 6px rgba(180, 83, 9, 0.08)'
                    }}
                  >
                    <img
                      src={s.photo_url || DEFAULT_AVATAR}
                      alt=""
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1.5px solid #cbd5e1',
                        flexShrink: 0
                      }}
                      onError={e => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 800, color: '#047857', fontSize: '13px' }}>
                          রোল: {s.roll_no || '—'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#0284c7', fontFamily: 'monospace', fontWeight: 700 }}>
                          {s.student_id}
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.name_bn || s.name_en}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 4px' }}>
                        শ্রেণি {s.class_name} • {s.department || s.group_name || s.section || 'সাধারণ'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{
                          background: isSpec ? '#fef3c7' : '#f1f5f9',
                          color: isSpec ? '#92400e' : '#64748b',
                          border: '1px solid #fde68a',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          ♿ {disType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            প্রদর্শিত হচ্ছে: <b>{toBengaliDigits(filteredStudents.length)}</b> জন শিক্ষার্থী • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={printReport}
              style={{
                background: '#d97706',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🖨️ প্রিন্ট / PDF রিপোর্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#64748b',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
