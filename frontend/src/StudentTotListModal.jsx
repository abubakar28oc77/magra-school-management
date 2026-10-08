import React, { useState, useMemo } from 'react';
import { getStudentPhone, formatGroup } from './main.jsx';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

// Default clean student avatar for cases where photo_url is not set
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='%2394a3b8'%3E%3Ccircle cx='40' cy='30' r='18'/%3E%3Cpath d='M14 70 C14 52 26 48 40 48 C54 48 66 52 66 70 Z'/%3E%3C/svg%3E";

export function StudentTotListModal({ isOpen, onClose, students = [] }) {
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  if (!isOpen) return null;

  const rawList = Array.isArray(students) ? students : (students?.items || []);

  // Filter students for Tot List
  const filteredStudents = useMemo(() => {
    return rawList.filter(s => {
      // Class filter
      if (selectedClass && selectedClass !== 'all' && String(s.class_name) !== String(selectedClass)) {
        return false;
      }

      // Group filter
      if (selectedGroup) {
        const grp = String(s.department || s.group_name || s.group || s.section || '').toLowerCase();
        const gf = selectedGroup.toLowerCase();
        if (gf.includes('বিজ্ঞান') && !(grp.includes('বিজ্ঞান') || grp.includes('sci'))) return false;
        if (gf.includes('মানবিক') && !(grp.includes('মানবিক') || grp.includes('hum') || grp.includes('arts'))) return false;
        if (gf.includes('ব্যবসায়') && !(grp.includes('ব্যবসা') || grp.includes('বাণিজ্য') || grp.includes('bs'))) return false;
      }

      // Section filter
      if (selectedSection && String(s.section || '').toLowerCase() !== String(selectedSection).toLowerCase()) {
        return false;
      }

      // Search
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
          s.father_mobile
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
  }, [rawList, selectedClass, selectedGroup, selectedSection, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;
    filteredStudents.forEach(s => {
      const g = (s.gender || '').toLowerCase();
      if (g === 'female' || g === 'ছাত্রী' || g === 'নারী' || g === 'মহিলা') {
        femaleCount++;
      } else {
        maleCount++;
      }
    });
    return {
      total: filteredStudents.length,
      male: maleCount,
      female: femaleCount
    };
  }, [filteredStudents]);

  // Print Official Tot List
  const printTotList = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    const classLabel = selectedClass === 'all' ? 'সকল শ্রেণি' : `শ্রেণি ${selectedClass} (${selectedClass === '6' ? '৬ষ্ঠ শ্রেণি' : selectedClass === '7' ? '৭ম শ্রেণি' : selectedClass === '8' ? '৮ম শ্রেণি' : selectedClass === '9' ? '৯ম শ্রেণি' : selectedClass === '10' ? '১০ম শ্রেণি' : selectedClass})`;
    const groupLabel = selectedGroup ? selectedGroup : 'সকল বিভাগ / শাখা';

    const rowsHtml = filteredStudents.map((s, idx) => {
      const photoSrc = s.photo_url || DEFAULT_AVATAR;
      const fatherName = s.father_name || s.father_name_en || '—';
      const motherName = s.mother_name || s.mother_name_en || '—';
      const village = s.current_village || s.permanent_village || s.address || 'মগড়া';
      const mobile = getStudentPhone(s);
      const groupText = s.department || s.group_name || s.group || (parseInt(s.class_name) <= 8 ? 'সাধারণ' : '—');

      return `
        <tr>
          <td style="text-align:center;font-weight:700;vertical-align:middle;">${idx + 1}</td>
          <td style="text-align:center;vertical-align:middle;padding:4px;">
            <div style="width:46px;height:46px;border:1px solid #cbd5e1;border-radius:4px;overflow:hidden;margin:0 auto;display:flex;align-items:center;justify-content:center;background:#f8fafc;">
              <img src="${photoSrc}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='${DEFAULT_AVATAR}'"/>
            </div>
          </td>
          <td style="text-align:center;font-weight:800;font-size:14px;color:#0b6b43;vertical-align:middle;">${s.roll_no || '—'}</td>
          <td style="text-align:center;font-family:monospace;font-size:11px;font-weight:600;vertical-align:middle;">${s.student_id || '—'}</td>
          <td style="vertical-align:middle;">
            <div style="font-weight:800;font-size:13px;color:#0f172a;">${s.name_bn || s.name_en || '—'}</div>
            ${s.name_en && s.name_bn !== s.name_en ? `<div style="font-size:11px;color:#64748b;">${s.name_en}</div>` : ''}
          </td>
          <td style="vertical-align:middle;font-weight:600;">${fatherName}</td>
          <td style="vertical-align:middle;font-weight:600;">${motherName}</td>
          <td style="text-align:center;vertical-align:middle;font-weight:600;">${groupText}</td>
          <td style="text-align:center;vertical-align:middle;font-family:monospace;font-weight:600;">${mobile}</td>
          <td style="vertical-align:middle;font-size:12px;">${village}</td>
          <td style="text-align:center;vertical-align:middle;width:60px;"></td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>টট লিস্ট (Tot List) - ${classLabel} - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 10px; color: #0f172a; background: #fff; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px; }
          .school-title { font-size: 22px; font-weight: 800; color: #047857; margin: 0; }
          .school-sub { font-size: 12px; color: #475569; margin: 2px 0 0 0; }
          .report-title { font-size: 14px; font-weight: 800; color: #1e293b; margin: 6px 0 2px 0; background: #f1f5f9; display: inline-block; padding: 3px 18px; border-radius: 4px; border: 1px solid #cbd5e1; letter-spacing: 0.5px; }
          .meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; color: #334155; font-weight: 700; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          th { background: #f1f5f9; color: #0f172a; font-weight: 700; border: 1px solid #475569; padding: 6px 4px; font-size: 11px; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 11.5px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            tr { page-break-inside: avoid; }
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
          <div class="report-title">📑 শিক্ষার্থী শ্রেণি ভিত্তিক টট লিস্ট (Tabulation / Master Roster) — ২০২৬</div>
        </div>
        <div class="meta-bar">
          <div><b>🏫 শ্রেণি:</b> ${classLabel} | <b>বিভাগ/শাখা:</b> ${groupLabel}</div>
          <div><b>📊 মোট শিক্ষার্থী:</b> ${toBengaliDigits(filteredStudents.length)} জন (ছাত্র: ${toBengaliDigits(stats.male)}, ছাত্রী: ${toBengaliDigits(stats.female)}) | <b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:28px;">ক্র.নং</th>
              <th style="width:50px;">ছবি</th>
              <th style="width:36px;background:#e6f4ea;color:#047857;">রোল</th>
              <th style="width:70px;">আইডি (ID)</th>
              <th style="text-align:left;padding-left:8px;">শিক্ষার্থীর নাম</th>
              <th style="text-align:left;padding-left:8px;">পিতার নাম</th>
              <th style="text-align:left;padding-left:8px;">মাতার নাম</th>
              <th style="width:75px;">বিভাগ/শাখা</th>
              <th style="width:90px;">মোবাইল নাম্বার</th>
              <th style="width:110px;">গ্রামের নাম</th>
              <th style="width:60px;">স্বাক্ষর/মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি</td></tr>'}
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:45px;padding:0 20px;">
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">শ্রেণি শিক্ষকের স্বাক্ষর</div>
          <div style="text-align:center;border-top:1px solid #334155;width:170px;padding-top:4px;font-size:11px;font-weight:700;">প্রত্যয়নকারীর স্বাক্ষর</div>
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

  // CSV Export for Tot List
  const downloadTotListCsv = () => {
    const headers = [
      'Roll No',
      'Student ID',
      'Student Name (Bangla)',
      'Student Name (English)',
      'Class',
      'Department / Group',
      'Section',
      'Father Name',
      'Mother Name',
      'Mobile Number',
      'Village',
      'Date of Birth',
      'Gender',
      'Religion'
    ];

    const rows = filteredStudents.map(s => ({
      'Roll No': s.roll_no || '',
      'Student ID': s.student_id || '',
      'Student Name (Bangla)': s.name_bn || '',
      'Student Name (English)': s.name_en || '',
      'Class': s.class_name || '',
      'Department / Group': s.department || s.group_name || s.group || '',
      'Section': s.section || '',
      'Father Name': s.father_name || s.father_name_en || '',
      'Mother Name': s.mother_name || s.mother_name_en || '',
      'Mobile Number': getStudentPhone(s),
      'Village': s.current_village || s.permanent_village || s.address || '',
      'Date of Birth': s.date_of_birth ? s.date_of_birth.slice(0, 10) : '',
      'Gender': s.gender || '',
      'Religion': s.religion || 'ইসলাম'
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
    a.download = `magra_tot_list_class_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const classButtons = [
    { key: 'all', label: 'সকল শ্রেণি' },
    { key: '6', label: 'শ্রেণি ৬' },
    { key: '7', label: 'শ্রেণি ৭' },
    { key: '8', label: 'শ্রেণি ৮' },
    { key: '9', label: 'শ্রেণি ৯' },
    { key: '10', label: 'শ্রেণি ১০' }
  ];

  return (
    <div className="submenu-modal-overlay" onClick={onClose}>
      <div className="submenu-modal-card" style={{ maxWidth: '1150px', width: '96%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#0284c7' }}>
          <div>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TABULATION / MASTER ROSTER
            </span>
            <h2 style={{ marginTop: '2px', fontSize: '18px' }}>📑 শ্রেণি ভিত্তিক টট লিস্ট (Tot List Register)</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          {/* Class Switcher Pill Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>শ্রেণি বাছাই:</span>
            {classButtons.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedClass(c.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedClass === c.key ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: selectedClass === c.key ? '#0284c7' : '#f8fafc',
                  color: selectedClass === c.key ? '#fff' : '#334155',
                  boxShadow: selectedClass === c.key ? '0 2px 6px rgba(2,132,199,0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '14px', alignItems: 'center' }}>
            <input
              placeholder="🔍 নাম / রোল / পিতা / মাতা / গ্রাম..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: '1 1 200px', minWidth: '180px', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '13px', background: '#fff' }}
            />

            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd', fontWeight: 600, fontSize: '13px', background: '#fff' }}
            >
              <option value="">📚 সব বিভাগ / গ্রুপ</option>
              <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
              <option value="মানবিক">মানবিক বিভাগ</option>
              <option value="ব্যবসায়">ব্যবসায় শিক্ষা শাখা</option>
            </select>

            <input
              placeholder="শাখা (Section)"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              style={{ width: '110px', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '13px', background: '#fff' }}
            />

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: viewMode === 'table' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: viewMode === 'table' ? '#e0f2fe' : '#fff',
                  color: '#0369a1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 টেবিল ভিউ
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: viewMode === 'grid' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: viewMode === 'grid' ? '#e0f2fe' : '#fff',
                  color: '#0369a1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🪪 কার্ড ভিউ
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', color: '#1e293b' }}>
              <b>🏫 {selectedClass === 'all' ? 'সকল শ্রেণি' : `শ্রেণি ${selectedClass}`}</b> • <b>মোট শিক্ষার্থী:</b> <span style={{ color: '#0284c7', fontWeight: 800 }}>{toBengaliDigits(stats.total)}</span> জন
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
              <span style={{ color: '#1d4ed8', fontWeight: 700 }}>👨 ছাত্র: {toBengaliDigits(stats.male)}</span>
              <span style={{ color: '#be185d', fontWeight: 700 }}>👩 ছাত্রী: {toBengaliDigits(stats.female)}</span>
            </div>
          </div>

          {/* Results: Table View */}
          {viewMode === 'table' && (
            <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '32px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>ছবি</th>
                    <th style={{ width: '45px', textAlign: 'center', background: '#e0f2fe', color: '#0369a1' }}>রোল</th>
                    <th style={{ width: '75px' }}>আইডি</th>
                    <th>শিক্ষার্থীর নাম</th>
                    <th>পিতার নাম</th>
                    <th>মাতার নাম</th>
                    <th style={{ width: '55px', textAlign: 'center' }}>শ্রেণি</th>
                    <th>বিভাগ/শাখা</th>
                    <th>মোবাইল নম্বর</th>
                    <th>গ্রামের নাম</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const photoSrc = s.photo_url || DEFAULT_AVATAR;
                    const fatherName = s.father_name || s.father_name_en || '—';
                    const motherName = s.mother_name || s.mother_name_en || '—';
                    const village = s.current_village || s.permanent_village || s.address || '—';

                    return (
                      <tr key={s.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ textAlign: 'center', padding: '4px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', margin: '0 auto', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={photoSrc}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.src = DEFAULT_AVATAR; }}
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '13px' }}>
                            {s.roll_no || '—'}
                          </span>
                        </td>
                        <td><code style={{ fontSize: '11px' }}>{s.student_id}</code></td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name_bn || s.name_en}</div>
                          {s.name_en && s.name_bn !== s.name_en && <div style={{ fontSize: '11px', color: '#64748b' }}>{s.name_en}</div>}
                        </td>
                        <td style={{ fontWeight: 600 }}>{fatherName}</td>
                        <td style={{ fontWeight: 600 }}>{motherName}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.class_name}</td>
                        <td>
                          {s.department || s.group_name || s.group ? (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                              {formatGroup(s.department || s.group_name || s.group)}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>সাধারণ</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{getStudentPhone(s)}</td>
                        <td style={{ color: '#334155' }}>{village}</td>
                      </tr>
                    );
                  })}
                  {!filteredStudents.length && (
                    <tr>
                      <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        🚫 এই শ্রেণিতে কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Results: Grid View */}
          {viewMode === 'grid' && (
            <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', padding: '4px' }}>
              {filteredStudents.map((s, idx) => {
                const photoSrc = s.photo_url || DEFAULT_AVATAR;
                return (
                  <div key={s.id || idx} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', background: '#fff', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0, background: '#f8fafc' }}>
                      <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = DEFAULT_AVATAR; }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '11px' }}>রোল: {s.roll_no || '—'}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>শ্রেণি {s.class_name}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {s.name_bn || s.name_en}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                        👨 পিতা: {s.father_name || s.father_name_en || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>
                        👩 মাতা: {s.mother_name || s.mother_name_en || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#2563eb', fontFamily: 'monospace', marginTop: '2px' }}>
                        📞 {getStudentPhone(s)}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        🏡 গ্রাম: {s.current_village || s.permanent_village || s.address || '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!filteredStudents.length && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  🚫 কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            মোট শিক্ষার্থী: <span style={{ color: '#0284c7', fontWeight: 800 }}>{toBengaliDigits(filteredStudents.length)}</span> জন
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={printTotList}
              style={{ background: '#0b6b43', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🖨️ টট লিস্ট প্রিন্ট / PDF
            </button>
            <button
              type="button"
              onClick={downloadTotListCsv}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              📊 টট লিস্ট CSV এক্সপোর্ট
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
