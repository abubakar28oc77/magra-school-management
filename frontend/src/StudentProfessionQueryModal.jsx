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

export function parseNum(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  const bnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const s = String(val).replace(/[০-৯]/g, d => bnMap[d]).replace(/[^\d-]/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
}

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='%2394a3b8'%3E%3Ccircle cx='40' cy='30' r='18'/%3E%3Cpath d='M14 70 C14 52 26 48 40 48 C54 48 66 52 66 70 Z'/%3E%3C/svg%3E";

export const ALL_PROFESSIONS_LIST = [
  'কৃষি শ্রমিক',
  'অকৃষি শ্রমিক',
  'দিনমজুর',
  'ব্যবসায়ী',
  'ক্ষুদ্র ব্যবসায়ী',
  'শিক্ষকতা',
  'সরকারি চাকুরিজীবী',
  'বেসরকারি চাকুরিজীবী',
  'গৃহিনী',
  'প্রবাসী',
  'চালক / ড্রাইভার',
  'ডাক্তার / চিকিৎসক',
  'ডাক্তার / নার্স',
  'পল্লী চিকিৎসক',
  'প্রকৌশলী',
  'আইনজীবী',
  'জেলে',
  'তাঁতী',
  'কামার/কুমার',
  'গৃহকর্মী / সহায়িকা',
  'অবসরপ্রাপ্ত',
  'মৃত',
  'অন্যান্য'
];

export function matchesStudentProfession(s, professionFilter, scope = 'any') {
  if (!s) return false;
  if (!professionFilter || professionFilter === 'all') return true;

  const fp = (s.father_profession || '').trim().toLowerCase();
  const mp = (s.mother_profession || '').trim().toLowerCase();
  const gp = (s.guardian_profession || '').trim().toLowerCase();
  const target = professionFilter.trim().toLowerCase();

  const matchStr = (source, targetStr) => {
    if (!source) return false;
    if (source === targetStr) return true;
    if (source.includes(targetStr) || targetStr.includes(source)) return true;
    // Handle aliases
    if (targetStr.includes('কৃষি শ্রমিক') && (source.includes('কৃষি') || source.includes('কৃষক'))) return true;
    if (targetStr.includes('ব্যবসা') && source.includes('ব্যবসা')) return true;
    if (targetStr.includes('চাকুরি') && (source.includes('চাকরি') || source.includes('চাকুরি') || source.includes('service'))) return true;
    if (targetStr.includes('শিক্ষক') && (source.includes('শিক্ষক') || source.includes('teacher'))) return true;
    if (targetStr.includes('চালক') && (source.includes('ড্রাইভার') || source.includes('চালক') || source.includes('driver'))) return true;
    if (targetStr.includes('গৃহিনী') && (source.includes('গৃহিনী') || source.includes('গৃহিণী') || source.includes('housewife'))) return true;
    if (targetStr.includes('ডাক্তার') && (source.includes('ডাক্তার') || source.includes('চিকিৎসক') || source.includes('নার্স') || source.includes('doctor'))) return true;
    if (targetStr.includes('প্রবাসী') && (source.includes('প্রবাসী') || source.includes('প্রবাস'))) return true;
    return false;
  };

  if (scope === 'father') {
    return matchStr(fp, target);
  }
  if (scope === 'mother') {
    return matchStr(mp, target);
  }
  // scope === 'any' (default)
  return matchStr(fp, target) || matchStr(mp, target) || matchStr(gp, target);
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

export function StudentProfessionQueryModal({ isOpen, onClose, students = [] }) {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedScope, setSelectedScope] = useState('any'); // 'any', 'father', 'mother'
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const rawList = Array.isArray(students) ? students : (students?.items || []);

  // Filter students based on Class & Profession query
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

      // 2. Profession filter
      if (selectedProfession && selectedProfession !== 'all') {
        if (!matchesStudentProfession(s, selectedProfession, selectedScope)) {
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
          s.father_profession,
          s.mother_profession,
          s.guardian_name,
          s.guardian_phone,
          s.father_mobile,
          s.mother_mobile,
          s.current_village
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
  }, [rawList, selectedClass, selectedProfession, selectedScope, selectedGroup, selectedSection, selectedGender, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;
    const fatherProfCounts = {};
    const motherProfCounts = {};

    filteredStudents.forEach(s => {
      const g = (s.gender || '').toLowerCase();
      if (g === 'female' || g === 'ছাত্রী' || g === 'নারী' || g === 'মহিলা') {
        femaleCount++;
      } else {
        maleCount++;
      }

      const fp = (s.father_profession || '').trim() || 'অনির্দিষ্ট / উল্লেখ নেই';
      const mp = (s.mother_profession || '').trim() || 'গৃহিনী / উল্লেখ নেই';

      fatherProfCounts[fp] = (fatherProfCounts[fp] || 0) + 1;
      motherProfCounts[mp] = (motherProfCounts[mp] || 0) + 1;
    });

    return {
      total: filteredStudents.length,
      male: maleCount,
      female: femaleCount,
      fatherProfCounts,
      motherProfCounts
    };
  }, [filteredStudents]);

  // Print Official Profession Report
  const printReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    const classLabel = selectedClass === 'all' 
      ? 'সকল শ্রেণি (৬ষ্ঠ - ১০ম)' 
      : `শ্রেণি ${selectedClass} (${selectedClass === '6' ? '৬ষ্ঠ শ্রেণি' : selectedClass === '7' ? '৭ম শ্রেণি' : selectedClass === '8' ? '৮ম শ্রেণি' : selectedClass === '9' ? '৯ম শ্রেণি' : selectedClass === '10' ? '১০ম শ্রেণি' : selectedClass})`;

    const scopeLabel = selectedScope === 'father'
      ? 'শুধুমাত্র পিতার পেশা'
      : selectedScope === 'mother'
      ? 'শুধুমাত্র মাতার পেশা'
      : 'পিতা বা মাতা (উভয়)';

    const professionLabel = selectedProfession === 'all'
      ? 'সকল পেশা'
      : selectedProfession;

    const groupLabel = selectedGroup ? selectedGroup : 'সকল বিভাগ / শাখা';

    const rowsHtml = filteredStudents.map((s, idx) => {
      const photoSrc = s.photo_url || DEFAULT_AVATAR;
      const fatherName = s.father_name || s.father_name_en || '—';
      const motherName = s.mother_name || s.mother_name_en || '—';
      const fatherProf = s.father_profession || '—';
      const motherProf = s.mother_profession || 'গৃহিনী';
      const village = s.current_village || s.permanent_village || s.address || '—';
      const mobile = getStudentPhone(s);
      const groupText = s.department || s.group_name || s.group || (parseNum(s.class_name, 10) <= 8 ? 'সাধারণ' : '—');
      const classText = `শ্রেণি ${s.class_name || '—'}`;

      return `
        <tr>
          <td style="text-align:center;font-weight:700;vertical-align:middle;">${idx + 1}</td>
          <td style="text-align:center;vertical-align:middle;padding:4px;">
            <div style="width:40px;height:40px;border:1px solid #cbd5e1;border-radius:4px;overflow:hidden;margin:0 auto;display:flex;align-items:center;justify-content:center;background:#f8fafc;">
              <img src="${photoSrc}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='${DEFAULT_AVATAR}'"/>
            </div>
          </td>
          <td style="text-align:center;font-weight:800;font-size:13px;color:#0b6b43;vertical-align:middle;">${s.roll_no || '—'}</td>
          <td style="text-align:center;font-family:monospace;font-size:11px;font-weight:600;vertical-align:middle;">${s.student_id || '—'}</td>
          <td style="vertical-align:middle;">
            <div style="font-weight:800;font-size:13px;color:#0f172a;">${s.name_bn || s.name_en || '—'}</div>
            ${s.name_en && s.name_bn !== s.name_en ? `<div style="font-size:10.5px;color:#64748b;">${s.name_en}</div>` : ''}
          </td>
          <td style="text-align:center;vertical-align:middle;font-weight:600;font-size:12px;">
            <div>${classText}</div>
            <div style="font-size:10px;color:#0369a1;">${groupText}</div>
          </td>
          <td style="text-align:center;vertical-align:middle;font-size:12px;">
            ${(s.gender === 'female' || s.gender === 'ছাত্রী' || s.gender === 'নারী') ? '<span style="color:#b91c1c;font-weight:700;">ছাত্রী</span>' : '<span style="color:#1e40af;font-weight:700;">ছাত্র</span>'}
          </td>
          <td style="vertical-align:middle;">
            <div style="font-weight:700;font-size:12px;color:#1e293b;">${fatherName}</div>
            <div style="font-size:11px;color:#b45309;font-weight:600;background:#fef3c7;display:inline-block;padding:1px 6px;border-radius:4px;margin-top:2px;">পেশা: ${fatherProf}</div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-weight:700;font-size:12px;color:#1e293b;">${motherName}</div>
            <div style="font-size:11px;color:#4338ca;font-weight:600;background:#e0e7ff;display:inline-block;padding:1px 6px;border-radius:4px;margin-top:2px;">পেশা: ${motherProf}</div>
          </td>
          <td style="vertical-align:middle;font-size:11.5px;color:#334155;">
            <div>${village}</div>
          </td>
          <td style="text-align:center;font-family:monospace;font-size:11.5px;font-weight:700;color:#047857;vertical-align:middle;">
            ${mobile}
          </td>
        </tr>
      `;
    }).join('');

    const topProfSummary = Object.entries(stats.fatherProfCounts)
      .filter(([k]) => k !== 'অনির্দিষ্ট / উল্লেখ নেই')
      .slice(0, 6)
      .map(([k, v]) => `<b>${k}:</b> ${v} জন`)
      .join(' | ');

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>অভিভাবকের পেশাভিত্তিক শিক্ষার্থী প্রতিবেদন - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm 10mm 10mm 10mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif;
            margin: 0;
            padding: 10px;
            color: #0f172a;
            background: #fff;
            font-size: 12px;
            line-height: 1.35;
          }
          .no-print {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fffbeb;
            border: 1.5px solid #fde68a;
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 12px;
          }
          .btn-print {
            background: #0b6b43;
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 13px;
          }
          .btn-close {
            background: #64748b;
            color: #fff;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
          }
          .official-header {
            text-align: center;
            border-bottom: 2.5px double #0b6b43;
            padding-bottom: 8px;
            margin-bottom: 10px;
            position: relative;
          }
          .school-title {
            font-size: 24px;
            font-weight: 900;
            color: #0b6b43;
            letter-spacing: 0.5px;
            margin: 0;
          }
          .school-meta {
            font-size: 12.5px;
            color: #334155;
            font-weight: 600;
            margin: 3px 0;
          }
          .report-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            border: 1.5px solid #d97706;
            font-size: 14px;
            font-weight: 800;
            padding: 4px 20px;
            border-radius: 999px;
            margin-top: 4px;
          }
          .meta-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 6px 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            font-size: 11.5px;
            font-weight: 700;
            color: #1e293b;
          }
          .stats-chips {
            display: flex;
            gap: 12px;
            align-items: center;
          }
          .stat-tag {
            background: #fff;
            border: 1px solid #cbd5e1;
            padding: 2px 8px;
            border-radius: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 800;
            border: 1px solid #475569;
            padding: 6px 4px;
            font-size: 11.5px;
            text-align: center;
          }
          td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            font-size: 11.5px;
          }
          tr:nth-child(even) {
            background-color: #fafaf9;
          }
          .footer-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding: 0 30px;
            page-break-inside: avoid;
          }
          .sign-col {
            text-align: center;
            width: 180px;
            border-top: 1.5px solid #334155;
            padding-top: 5px;
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              padding: 0;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>
            <b>💼 অভিভাবকের পেশাভিত্তিক শিক্ষার্থী কুয়েরি ও প্রিন্ট প্রিভিউ</b> (মোট: ${filteredStudents.length} জন শিক্ষার্থী)
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-print" onclick="window.print()">🖨️ প্রিন্ট করুন / Save PDF</button>
            <button class="btn-close" onclick="window.close()">✕ বন্ধ করুন</button>
          </div>
        </div>

        <div class="official-header">
          <div class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          <div class="school-meta">ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল • EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.</div>
          <div class="report-badge">💼 অভিভাবকের পেশাভিত্তিক শিক্ষার্থী প্রতিবেদন</div>
        </div>

        <div class="meta-bar">
          <div>
            <span>🏫 শ্রেণি: <b>${classLabel}</b></span> | 
            <span>🎯 ফিল্টার আওতা: <b>${scopeLabel}</b></span> | 
            <span>💼 পেশা: <b>${professionLabel}</b></span>
            ${selectedGroup ? ` | <span>বিভাগ: <b>${groupLabel}</b></span>` : ''}
          </div>
          <div class="stats-chips">
            <span class="stat-tag">মোট শিক্ষার্থী: <b style="color:#0b6b43;">${filteredStudents.length} জন</b></span>
            <span class="stat-tag">ছাত্র: <b>${stats.male}</b></span>
            <span class="stat-tag">ছাত্রী: <b>${stats.female}</b></span>
            <span>তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        ${topProfSummary ? `
        <div style="font-size:11px;color:#475569;margin-bottom:8px;padding:3px 8px;background:#f1f5f9;border-radius:4px;">
          📊 <b>পিতার পেশা সারাংশ:</b> ${topProfSummary}
        </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th style="width:30px;">ক্র.</th>
              <th style="width:46px;">ছবি</th>
              <th style="width:38px;">রোল</th>
              <th style="width:65px;">আইডি</th>
              <th style="width:130px;">শিক্ষার্থীর নাম</th>
              <th style="width:65px;">শ্রেণি ও বিভাগ</th>
              <th style="width:40px;">জেন্ডার</th>
              <th style="width:130px;">পিতার নাম ও পেশা</th>
              <th style="width:130px;">মাতার নাম ও পেশা</th>
              <th>ঠিকানা (গ্রাম)</th>
              <th style="width:90px;">অভিভাবকের মোবাইল</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length ? rowsHtml : `<tr><td colspan="11" style="text-align:center;padding:30px;color:#64748b;font-weight:700;">নির্বাচিত শ্রেণি ও পেশার কোনো শিক্ষার্থী পাওয়া যায়নি</td></tr>`}
          </tbody>
        </table>

        <div class="footer-signatures">
          <div class="sign-col">শ্রেণি শিক্ষকের স্বাক্ষর</div>
          <div class="sign-col">যাচাইকারীর স্বাক্ষর</div>
          <div class="sign-col">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  // CSV Export
  const downloadCsv = () => {
    if (!filteredStudents.length) {
      alert('এক্সপোর্ট করার মতো কোনো ডেটা নেই।');
      return;
    }

    const headers = [
      'ক্র.নং',
      'Student ID',
      'রোল',
      'শিক্ষার্থীর নাম (বাংলা)',
      'নাম (ইংরেজি)',
      'শ্রেণি',
      'বিভাগ',
      'শাখা',
      'লিঙ্গ',
      'ধর্ম',
      'পিতার নাম',
      'পিতার পেশা',
      'পিতার মোবাইল',
      'মাতার নাম',
      'মাতার পেশা',
      'মাতার মোবাইল',
      'অভিভাবকের নাম',
      'অভিভাবকের সম্পর্ক',
      'অভিভাবকের মোবাইল',
      'গ্রাম',
      'ডাকঘর',
      'উপজেলা',
      'জেলা'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.student_id || '',
      s.roll_no || '',
      s.name_bn || '',
      s.name_en || '',
      s.class_name || '',
      s.department || s.group_name || s.group || '',
      s.section || '',
      s.gender || '',
      s.religion || 'ইসলাম',
      s.father_name || '',
      s.father_profession || '',
      s.father_mobile || '',
      s.mother_name || '',
      s.mother_profession || '',
      s.mother_mobile || '',
      s.guardian_name || '',
      s.guardian_relation || '',
      s.guardian_phone || '',
      s.current_village || s.permanent_village || '',
      s.current_post_office || s.permanent_post_office || '',
      s.current_upazila || s.permanent_upazila || '',
      s.current_district || s.permanent_district || ''
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `magra-student-profession-report-class-${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '1240px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
          color: '#fff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              backdropFilter: 'blur(4px)'
            }}>
              💼
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '0.3px' }}>
                  অভিভাবকের পেশাভিত্তিক শিক্ষার্থী কুয়েরি ও রিপোর্ট
                </h2>
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  EIIN: 114290
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • পিতা ও মাতার পেশার শ্রেণিভিত্তিক অনুসন্ধান ও PDF প্রিন্ট
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={printReport}
              style={{
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
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
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📊 CSV এক্সপোর্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '6px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Class Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>🏫 শ্রেণি নির্বাচন:</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '13px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '130px'
              }}
            >
              <option value="all">🏫 সকল শ্রেণি</option>
              <option value="6">৬ষ্ঠ শ্রেণি</option>
              <option value="7">৭ম শ্রেণি</option>
              <option value="8">৮ম শ্রেণি</option>
              <option value="9">৯ম শ্রেণি</option>
              <option value="10">১০ম শ্রেণি</option>
            </select>
          </div>

          {/* Scope Select (Father, Mother, Any) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>🎯 ফিল্টার আওতা:</label>
            <select
              value={selectedScope}
              onChange={e => setSelectedScope(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontWeight: 700,
                color: '#1e3a8a',
                fontSize: '13px',
                backgroundColor: '#eff6ff',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              <option value="any">👨‍👩‍👧‍👦 পিতা বা মাতা (উভয়)</option>
              <option value="father">👨 শুধুমাত্র পিতার পেশা</option>
              <option value="mother">👩 শুধুমাত্র মাতার পেশা</option>
            </select>
          </div>

          {/* Profession Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>💼 পেশার ধরন:</label>
            <select
              value={selectedProfession}
              onChange={e => setSelectedProfession(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #3b82f6',
                fontWeight: 700,
                color: '#1e3a8a',
                fontSize: '13px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '180px'
              }}
            >
              <option value="all">🌟 সকল পেশা</option>
              {ALL_PROFESSIONS_LIST.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Group / Department */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>📚 বিভাগ / গ্রুপ:</label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">সব বিভাগ</option>
              <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
              <option value="মানবিক">মানবিক বিভাগ</option>
              <option value="ব্যবসায়">ব্যবসায় শিক্ষা শাখা</option>
            </select>
          </div>

          {/* Gender */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>👥 জেন্ডার:</label>
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">সব জেন্ডার</option>
              <option value="male">ছাত্র (পুরুষ)</option>
              <option value="female">ছাত্রী (নারী)</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>🔍 লাইভ অনুসন্ধান:</label>
            <input
              type="text"
              placeholder="নাম / রোল / পিতা / মাতা / মোবাইল..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#fff'
              }}
            />
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>ভিউ মোড:</label>
            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '7px 12px',
                  border: 'none',
                  background: viewMode === 'table' ? '#1e3a8a' : '#fff',
                  color: viewMode === 'table' ? '#fff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                📋 টেবিল
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '7px 12px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#1e3a8a' : '#fff',
                  color: viewMode === 'grid' ? '#fff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                📇 কার্ড
              </button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '10px 24px',
          borderBottom: '1px solid #dbeafe',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#1e40af', fontWeight: 700 }}>📊 ফলাফল:</span>
            <span style={{
              backgroundColor: '#1e40af',
              color: '#fff',
              padding: '2px 10px',
              borderRadius: '999px',
              fontWeight: 800
            }}>
              মোট {filteredStudents.length} জন
            </span>
          </div>

          <div style={{ color: '#1e3a8a' }}>
            ছাত্র: <b>{stats.male}</b> জন | ছাত্রী: <b>{stats.female}</b> জন
          </div>

          <div style={{ height: '16px', width: '1px', backgroundColor: '#bfdbfe' }} />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>শীর্ষ পিতার পেশা:</span>
            {Object.entries(stats.fatherProfCounts)
              .filter(([k]) => k !== 'অনির্দিষ্ট / উল্লেখ নেই')
              .slice(0, 5)
              .map(([cat, count]) => (
                <span
                  key={cat}
                  onClick={() => setSelectedProfession(cat)}
                  style={{
                    backgroundColor: selectedProfession === cat ? '#1e3a8a' : '#fff',
                    color: selectedProfession === cat ? '#fff' : '#1e3a8a',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="এই পেশা দিয়ে ফিল্টার করতে ক্লিক করুন"
                >
                  {cat}: {count}
                </span>
              ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💼</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#334155' }}>
                কোনো শিক্ষার্থী তথ্য পাওয়া যায়নি
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                শ্রেণি, পেশার ধরন অথবা অনুসন্ধানের ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <div style={{
              overflowX: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 8px', textAlign: 'center', width: '45px' }}>ক্র.</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', width: '55px' }}>ছবি</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', width: '55px' }}>রোল</th>
                    <th style={{ padding: '10px 10px', width: '90px' }}>Student ID</th>
                    <th style={{ padding: '10px 12px' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center', width: '85px' }}>শ্রেণি/গ্রুপ</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center', width: '65px' }}>জেন্ডার</th>
                    <th style={{ padding: '10px 12px' }}>পিতার নাম ও পেশা</th>
                    <th style={{ padding: '10px 12px' }}>মাতার নাম ও পেশা</th>
                    <th style={{ padding: '10px 12px' }}>ঠিকানা (গ্রাম)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', width: '110px' }}>মোবাইল নম্বর</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const photoSrc = s.photo_url || DEFAULT_AVATAR;
                    const fatherName = s.father_name || s.father_name_en || '—';
                    const motherName = s.mother_name || s.mother_name_en || '—';
                    const fatherProf = s.father_profession || '—';
                    const motherProf = s.mother_profession || 'গৃহিনী';
                    const village = s.current_village || s.permanent_village || s.address || '—';
                    const mobile = getStudentPhone(s);
                    const isFemale = s.gender === 'female' || s.gender === 'ছাত্রী' || s.gender === 'নারী';

                    return (
                      <tr
                        key={s.id || idx}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            margin: '0 auto',
                            border: '1px solid #cbd5e1',
                            background: '#f1f5f9'
                          }}>
                            <img
                              src={photoSrc}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#0b6b43' }}>
                          {s.roll_no || '—'}
                        </td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: '11.5px', fontWeight: 600 }}>
                          {s.student_id || '—'}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.name_bn || s.name_en}</div>
                          {s.name_en && s.name_bn !== s.name_en && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{s.name_en}</div>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontWeight: 700 }}>শ্রেণি {s.class_name}</div>
                          <div style={{ fontSize: '11px', color: '#0284c7' }}>
                            {s.department || s.group_name || s.group || (parseNum(s.class_name, 10) <= 8 ? 'সাধারণ' : '—')}
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: isFemale ? '#fee2e2' : '#dbeafe',
                            color: isFemale ? '#b91c1c' : '#1e40af',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11.5px'
                          }}>
                            {isFemale ? 'ছাত্রী' : 'ছাত্র'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{fatherName}</div>
                          <div style={{
                            display: 'inline-block',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            marginTop: '2px'
                          }}>
                            💼 {fatherProf}
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{motherName}</div>
                          <div style={{
                            display: 'inline-block',
                            backgroundColor: '#e0e7ff',
                            color: '#4338ca',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            marginTop: '2px'
                          }}>
                            💼 {motherProf}
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: '#475569' }}>
                          {village}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                          {mobile}
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {filteredStudents.map((s, idx) => {
                const photoSrc = s.photo_url || DEFAULT_AVATAR;
                const fatherName = s.father_name || s.father_name_en || '—';
                const motherName = s.mother_name || s.mother_name_en || '—';
                const fatherProf = s.father_profession || '—';
                const motherProf = s.mother_profession || 'গৃহিনী';
                const mobile = getStudentPhone(s);

                return (
                  <div
                    key={s.id || idx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid #cbd5e1',
                        flexShrink: 0
                      }}>
                        <img
                          src={photoSrc}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {s.name_bn || s.name_en}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          ID: {s.student_id || '—'} • রোল: <b style={{ color: '#0b6b43' }}>{s.roll_no || '—'}</b>
                        </div>
                        <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#0369a1', marginTop: '2px' }}>
                          শ্রেণি {s.class_name} {s.department ? `(${s.department})` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>পিতার পেশা:</span>
                        <span style={{ fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                          {fatherProf} ({fatherName})
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>মাতার পেশা:</span>
                        <span style={{ fontWeight: 700, color: '#4338ca', background: '#e0e7ff', padding: '1px 6px', borderRadius: '4px' }}>
                          {motherProf} ({motherName})
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>মোবাইল:</span>
                        <span style={{ fontWeight: 700, color: '#047857', fontFamily: 'monospace' }}>
                          {mobile}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            মোট প্রদর্শিত: <b>{filteredStudents.length}</b> জন শিক্ষার্থী
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={printReport}
              style={{
                backgroundColor: '#0b6b43',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🖨️ প্রিন্ট করুন
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#e2e8f0',
                color: '#334155',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
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
