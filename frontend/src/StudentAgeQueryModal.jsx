import React, { useState, useMemo } from 'react';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

function getStudentGuardian(s) {
  if (!s) return '—';
  const g = (s.guardian_name || '').trim();
  if (g) return g;
  const f = (s.father_name || '').trim();
  if (f && !f.includes('মৃত')) return f;
  const m = (s.mother_name || '').trim();
  if (m && !m.includes('মৃত')) return m;
  if (f) return f;
  if (m) return m;
  return '—';
}

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

export function parseDateOfBirth(val) {
  if (!val) return null;
  let s = String(val).trim();
  const bnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  s = s.replace(/[০-৯]/g, d => bnMap[d]);

  // YYYY-MM-DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(s)) {
    const parts = s.split(/[-/T ]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) return dt;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}/.test(s)) {
    const parts = s.split(/[/-]/);
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) return dt;
  }

  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt;
  return null;
}

export function calculateStudentAge(student, asOfDate = new Date()) {
  if (!student) return { years: 0, months: 0, text: '—', exactYears: 0, hasDob: false, dobFormatted: '—', dobRaw: '' };

  let dobStr = student.date_of_birth || student.dob || '';
  let isEstimated = false;
  let birthDate = parseDateOfBirth(dobStr);

  // If student doesn't have an explicit DOB, estimate based on Class:
  // Class 6 ~ 11-12 yrs, Class 7 ~ 12-13, Class 8 ~ 13-14, Class 9 ~ 14-15, Class 10 ~ 15-16
  if (!birthDate && student.class_name) {
    const cNum = parseInt(student.class_name) || 10;
    const estAge = cNum + 5; // Class 6 -> 11, Class 7 -> 12, Class 8 -> 13, Class 9 -> 14, Class 10 -> 15
    const estBirthYear = asOfDate.getFullYear() - estAge;
    birthDate = new Date(estBirthYear, 0, 1);
    isEstimated = true;
  }

  if (!birthDate) {
    return { years: 0, months: 0, text: '—', exactYears: 0, hasDob: false, dobFormatted: '—', dobRaw: '' };
  }

  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) years = 0;
  if (months < 0) months = 0;

  let text = `${toBengaliDigits(years)} বছর`;
  if (months > 0 && !isEstimated) {
    text += ` ${toBengaliDigits(months)} মাস`;
  }

  const dobFormatted = student.date_of_birth && !isEstimated
    ? birthDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })
    : (isEstimated ? `শ্রেণি অনুযায়ী (${toBengaliDigits(years)} বছর)` : '—');

  return {
    years,
    months,
    text,
    exactYears: years + (months / 12),
    hasDob: !!student.date_of_birth,
    isEstimated,
    dobFormatted,
    dobRaw: student.date_of_birth ? String(student.date_of_birth).slice(0, 10) : ''
  };
}

export function matchesAgeFilter(student, ageFilter) {
  if (!ageFilter || ageFilter === 'all') return true;
  const ageInfo = calculateStudentAge(student);
  const y = ageInfo.years;
  const ey = ageInfo.exactYears;

  switch (ageFilter) {
    case 'under_11':
      return y < 11;
    case 'above_11':
    case '11_plus':
      return y >= 12 || ey > 11.5;
    case 'above_12':
    case '12_plus':
      return y >= 13 || ey > 12.5;
    case 'above_13':
    case '13_plus':
      return y >= 14 || ey > 13.5;
    case 'above_14':
    case '14_plus':
      return y >= 15 || ey > 14.5;
    case 'above_15':
    case '15_plus':
      return y >= 16 || ey > 15.5;
    case 'above_16':
    case '16_plus':
      return y >= 17 || ey > 16.5;
    case 'above_17':
    case '17_plus':
      return y >= 18 || ey > 17.5;
    case 'above_18':
    case '18_plus':
      return y >= 18;
    default:
      return true;
  }
}

export const AGE_FILTER_PILLS = [
  { key: 'all', label: 'সব বয়স' },
  { key: 'under_11', label: '১১ বছরের নীচে (<১১)' },
  { key: 'above_11', label: '১১ বছরের উপরে (>১২)' },
  { key: 'above_12', label: '১২ বছরের উপরে (>১৩)' },
  { key: 'above_13', label: '১৩ বছরের উপরে (>১৪)' },
  { key: 'above_14', label: '১৪ বছরের উপরে (>১৫)' },
  { key: 'above_15', label: '১৫ বছরের উপরে (>১৬)' },
  { key: 'above_16', label: '১৬ বছরের উপরে (>১৭)' },
  { key: 'above_17', label: '১৭ বছরের উপরে (>১৮)' },
  { key: 'above_18', label: '১৮ বছরের উপরে (১৮+)' }
];

export function StudentAgeQueryModal({ isOpen, onClose, students = [] }) {
  const [ageFilter, setAgeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Calculate age for each student
  const studentsWithAge = useMemo(() => {
    const list = Array.isArray(students) ? students : (students?.items || []);
    return list.map(s => {
      const ageInfo = calculateStudentAge(s);
      return {
        ...s,
        ageInfo
      };
    });
  }, [students]);

  // Filter students based on criteria
  const filteredStudents = useMemo(() => {
    return studentsWithAge.filter(s => {
      // Age filter
      if (!matchesAgeFilter(s, ageFilter)) return false;

      // Class filter
      if (classFilter && String(s.class_name) !== String(classFilter)) return false;

      // Group filter
      if (groupFilter) {
        const grp = String(s.department || s.group_name || s.group || s.section || '').toLowerCase();
        const gf = groupFilter.toLowerCase();
        if (gf.includes('বিজ্ঞান') && !(grp.includes('বিজ্ঞান') || grp.includes('sci'))) return false;
        if (gf.includes('মানবিক') && !(grp.includes('মানবিক') || grp.includes('hum') || grp.includes('arts'))) return false;
        if (gf.includes('ব্যবসায়') && !(grp.includes('ব্যবসা') || grp.includes('বাণিজ্য') || grp.includes('bs'))) return false;
      }

      // Gender filter
      if (genderFilter) {
        const g = (s.gender || '').toLowerCase();
        if (genderFilter === 'male' && !(g === 'male' || g === 'পুরুষ' || g === 'ছাত্র')) return false;
        if (genderFilter === 'female' && !(g === 'female' || g === 'নারী' || g === 'মহিলা' || g === 'ছাত্রী')) return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== 'all') {
        const st = (s.status || 'active').toLowerCase();
        if (statusFilter === 'active' && !(st === 'active' || st === 'সক্রিয়')) return false;
        if (statusFilter === 'inactive' && !(st === 'inactive' || st === 'নিষ্ক্রিয়')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          s.student_id,
          s.name_bn,
          s.name_en,
          s.roll_no,
          s.guardian_name,
          s.guardian_phone,
          s.father_name,
          s.father_mobile,
          s.current_village
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      const ca = parseInt(a.class_name) || 99;
      const cb = parseInt(b.class_name) || 99;
      if (ca !== cb) return ca - cb;
      const ra = parseInt(a.roll_no) || 999;
      const rb = parseInt(b.roll_no) || 999;
      return ra - rb;
    });
  }, [studentsWithAge, ageFilter, classFilter, groupFilter, genderFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!filteredStudents.length) {
      return { total: 0, avgAge: 0, minAge: 0, maxAge: 0, distribution: {} };
    }
    let sum = 0;
    let min = 999;
    let max = 0;
    const dist = {
      '< ১১ বছর': 0,
      '১১-১২ বছর': 0,
      '১২-১৩ বছর': 0,
      '১৩-১৪ বছর': 0,
      '১৪-১৫ বছর': 0,
      '১৫-১৬ বছর': 0,
      '১৬-১৭ বছর': 0,
      '১৮+ বছর': 0
    };

    filteredStudents.forEach(s => {
      const y = s.ageInfo.years;
      sum += s.ageInfo.exactYears;
      if (y < min) min = y;
      if (y > max) max = y;

      if (y < 11) dist['< ১১ বছর']++;
      else if (y === 11) dist['১১-১২ বছর']++;
      else if (y === 12) dist['১২-১৩ বছর']++;
      else if (y === 13) dist['১৩-১৪ বছর']++;
      else if (y === 14) dist['১৪-১৫ বছর']++;
      else if (y === 15) dist['১৫-১৬ বছর']++;
      else if (y === 16) dist['১৬-১৭ বছর']++;
      else dist['১৮+ বছর']++;
    });

    return {
      total: filteredStudents.length,
      avgAge: (sum / filteredStudents.length).toFixed(1),
      minAge: min === 999 ? 0 : min,
      maxAge: max,
      distribution: dist
    };
  }, [filteredStudents]);

  // Print Age Report
  const printAgeReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    const currentPill = AGE_FILTER_PILLS.find(p => p.key === ageFilter);
    const filterTitle = currentPill ? currentPill.label : 'সকল বয়স';

    const rowsHtml = filteredStudents.map((s, idx) => `
      <tr>
        <td style="text-align:center;font-weight:600;">${idx + 1}</td>
        <td style="text-align:center;font-family:monospace;font-weight:600;">${s.student_id || '—'}</td>
        <td style="font-weight:700;">${s.name_bn || s.name_en || '—'}</td>
        <td style="text-align:center;font-weight:600;">শ্রেণি ${s.class_name || '—'}</td>
        <td style="text-align:center;color:#0369a1;">${s.department || s.group_name || s.group || '—'}</td>
        <td style="text-align:center;font-weight:700;">${s.roll_no || '—'}</td>
        <td style="text-align:center;">${s.ageInfo.dobFormatted || s.ageInfo.dobRaw || '—'}</td>
        <td style="text-align:center;font-weight:800;color:#0b6b43;background:#f0fdf4;">${s.ageInfo.text}</td>
        <td style="text-align:center;">${s.gender === 'female' || s.gender === 'ছাত্রী' || s.gender === 'নারী' ? 'ছাত্রী' : 'ছাত্র'}</td>
        <td>${getStudentGuardian(s)}</td>
        <td style="text-align:center;font-family:monospace;">${getStudentPhone(s)}</td>
      </tr>
    `).join('');

    const distCardsHtml = Object.entries(stats.distribution)
      .filter(([_, count]) => count > 0)
      .map(([label, count]) => `
        <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:6px 12px;border-radius:6px;font-size:12px;text-align:center;">
          <div style="color:#64748b;font-weight:600;">${label}</div>
          <div style="font-size:15px;font-weight:800;color:#0f172a;">${toBengaliDigits(count)} জন</div>
        </div>
      `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শিক্ষার্থীদের বয়স ভিত্তিক কুয়েরি প্রতিবেদন - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; }
          .school-title { font-size: 22px; font-weight: 800; color: #047857; margin: 0; }
          .school-sub { font-size: 13px; color: #475569; margin: 3px 0 0 0; }
          .report-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 8px 0 2px 0; background: #f1f5f9; display: inline-block; padding: 3px 16px; border-radius: 4px; border: 1px solid #cbd5e1; }
          .meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; color: #334155; font-weight: 600; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
          .dist-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          th { background: #f8fafc; color: #0f172a; font-weight: 700; border: 1px solid #64748b; padding: 6px 8px; font-size: 12px; }
          td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 12px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 12px; display: flex; gap: 10px; justify-content: flex-end; background: #f0fdf4; padding: 8px 12px; border-radius: 8px; border: 1px solid #86efac;">
          <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;">🖨️ প্রিন্ট করুন / Save as PDF</button>
          <button onclick="window.close()" style="background:#64748b;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;">✕ বন্ধ করুন</button>
        </div>
        <div class="header">
          <div class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          <div class="school-sub">ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল • EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.</div>
          <div class="report-title">🎂 শিক্ষার্থীদের বয়স ভিত্তিক কুয়েরি ও পরিসংখ্যান প্রতিবেদন</div>
        </div>
        <div class="meta-bar">
          <div><b>🔍 বয়সের মানদণ্ড:</b> ${filterTitle} ${classFilter ? `| <b>শ্রেণি:</b> শ্রেণি ${classFilter}` : ''} ${groupFilter ? `| <b>বিভাগ:</b> ${groupFilter}` : ''}</div>
          <div><b>📊 মোট শিক্ষার্থী:</b> ${toBengaliDigits(filteredStudents.length)} জন | <b>গড় বয়স:</b> ${toBengaliDigits(stats.avgAge)} বছর | <b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="dist-grid">
          ${distCardsHtml}
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:30px;">ক্র.নং</th>
              <th style="width:75px;">আইডি (ID)</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="width:55px;">শ্রেণি</th>
              <th style="width:90px;">বিভাগ/শাখা</th>
              <th style="width:40px;">রোল</th>
              <th style="width:90px;">জন্ম তারিখ</th>
              <th style="width:95px;background:#e6f4ea;color:#0b6b43;">বর্তমান বয়স</th>
              <th style="width:50px;">লিঙ্গ</th>
              <th>অভিভাবকের নাম</th>
              <th style="width:95px;">মোবাইল</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি</td></tr>'}
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:40px;padding:0 20px;">
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">শ্রেণি শিক্ষকের স্বাক্ষর</div>
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">যাচাইকারীর স্বাক্ষর</div>
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

  // Download CSV
  const downloadAgeCsv = () => {
    const headers = [
      'Student ID',
      'Roll',
      'Name (Bangla)',
      'Name (English)',
      'Class',
      'Department',
      'Section',
      'Gender',
      'Date of Birth',
      'Age (Years)',
      'Age (Months)',
      'Age Text (Bangla)',
      'Guardian Name',
      'Mobile Phone',
      'Village',
      'Status'
    ];

    const rows = filteredStudents.map(s => ({
      'Student ID': s.student_id || '',
      'Roll': s.roll_no || '',
      'Name (Bangla)': s.name_bn || '',
      'Name (English)': s.name_en || '',
      'Class': s.class_name || '',
      'Department': s.department || s.group_name || s.group || '',
      'Section': s.section || '',
      'Gender': s.gender || '',
      'Date of Birth': s.ageInfo.dobRaw || '',
      'Age (Years)': s.ageInfo.years,
      'Age (Months)': s.ageInfo.months,
      'Age Text (Bangla)': s.ageInfo.text,
      'Guardian Name': getStudentGuardian(s),
      'Mobile Phone': getStudentPhone(s),
      'Village': s.current_village || s.permanent_village || s.address || '',
      'Status': s.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়'
    }));

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => headers.map(h => escapeCsv(row[h])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magra_students_age_report_${ageFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="submenu-modal-overlay" onClick={onClose}>
      <div className="submenu-modal-card" style={{ maxWidth: '1050px', width: '96%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#7c3aed' }}>
          <div>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AGE ANALYTICS & QUERY
            </span>
            <h2 style={{ marginTop: '2px', fontSize: '18px' }}>🎂 শিক্ষার্থীদের বয়স ভিত্তিক কুয়েরি ও বিশ্লেষণ</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          {/* Quick Filter Badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {AGE_FILTER_PILLS.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => setAgeFilter(p.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: ageFilter === p.key ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: ageFilter === p.key ? '#7c3aed' : '#f8fafc',
                  color: ageFilter === p.key ? '#fff' : '#334155',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Filter Controls Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px', alignItems: 'center' }}>
            <input
              placeholder="🔍 নাম / ID / অভিভাবক / মোবাইল..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: '1 1 180px', minWidth: '160px', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />

            <select
              value={ageFilter}
              onChange={e => setAgeFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#7c3aed', fontSize: '13px' }}
            >
              {AGE_FILTER_PILLS.map(p => (
                <option key={p.key} value={p.key}>
                  {p.key === 'all' ? '🎂 ' : ''}{p.label}
                </option>
              ))}
            </select>

            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px' }}
            >
              <option value="">🏫 সব শ্রেণি</option>
              {['6', '7', '8', '9', '10'].map(c => (
                <option key={c} value={c}>শ্রেণি {c}</option>
              ))}
            </select>

            <select
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px' }}
            >
              <option value="">📚 সব বিভাগ / গ্রুপ</option>
              <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
              <option value="মানবিক">মানবিক বিভাগ</option>
              <option value="ব্যবসায়">ব্যবসায় শিক্ষা শাখা</option>
            </select>

            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px' }}
            >
              <option value="">👥 সব জেন্ডার</option>
              <option value="male">ছাত্র (পুরুষ)</option>
              <option value="female">ছাত্রী (নারী)</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px' }}
            >
              <option value="all">সব অবস্থা</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>

          {/* Real-time Statistics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 700 }}>মোট শিক্ষার্থী</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#5b21b6' }}>{toBengaliDigits(stats.total)} জন</div>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700 }}>গড় বয়স (Average)</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>{toBengaliDigits(stats.avgAge)} বছর</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>সর্বনিম্ন বয়স</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534' }}>{toBengaliDigits(stats.minAge)} বছর</div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>সর্বোচ্চ বয়স</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#92400e' }}>{toBengaliDigits(stats.maxAge)} বছর</div>
            </div>
          </div>

          {/* Results Table */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1 }}>
                <tr>
                  <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                  <th>আইডি (ID)</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th style={{ width: '60px' }}>শ্রেণি</th>
                  <th>বিভাগ / শাখা</th>
                  <th style={{ width: '40px', textAlign: 'center' }}>রোল</th>
                  <th>জন্ম তারিখ</th>
                  <th style={{ textAlign: 'center', background: '#e0e7ff', color: '#4338ca' }}>বর্তমান বয়স</th>
                  <th>জেন্ডার</th>
                  <th>অভিভাবক</th>
                  <th>মোবাইল</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                    <td><code style={{ fontSize: '11px' }}>{s.student_id}</code></td>
                    <td><b>{s.name_bn || s.name_en}</b></td>
                    <td>শ্রেণি {s.class_name}</td>
                    <td>
                      {s.department || s.group_name || s.group ? (
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {formatGroup(s.department || s.group_name || s.group)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.roll_no || '—'}</td>
                    <td>{s.ageInfo.dobFormatted || s.ageInfo.dobRaw || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px', border: '1px solid #d8b4fe' }}>
                        {s.ageInfo.text}
                      </span>
                    </td>
                    <td>{s.gender === 'female' || s.gender === 'ছাত্রী' || s.gender === 'নারী' ? 'ছাত্রী' : 'ছাত্র'}</td>
                    <td>{getStudentGuardian(s)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{getStudentPhone(s)}</td>
                  </tr>
                ))}
                {!filteredStudents.length && (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      🚫 এই বয়সের মানদণ্ডে কোনো শিক্ষার্থী পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            ফলাফল: <span style={{ color: '#7c3aed', fontWeight: 800 }}>{toBengaliDigits(filteredStudents.length)}</span> জন
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={printAgeReport}
              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🖨️ বয়স রিপোর্ট প্রিন্ট / PDF
            </button>
            <button
              type="button"
              onClick={downloadAgeCsv}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              📊 CSV এক্সপোর্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: '#64748b', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              ✕ বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
