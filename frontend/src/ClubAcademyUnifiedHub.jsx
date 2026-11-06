import React, { useState, useEffect } from 'react';
import { PHOTO_HEAD_TEACHER, PHOTO_PRESIDENT, MOCK_TEACHERS } from './mockData';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

const ADVISORY_STORAGE_KEY = 'magra_clubs_advisory_v1';

export const DEFAULT_ADVISORY_DATA = {
  chiefPatron: {
    name: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    role: 'প্রধান পৃষ্ঠপোষক',
    school: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়',
    desc: 'ক্লাব একাডেমির সার্বিক নীতি নির্ধারণ, বাৎসরিক ক্লাব বাজেট অনুমোদন ও প্রাতিষ্ঠানিক দিকনির্দেশনা প্রদান।'
  },
  managingCommitteePatron: {
    name: 'নেয়ামুল হক খান',
    designation: 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ (ম্যানেজিং কমিটি)',
    role: 'সার্বিক পৃষ্ঠপোষক',
    school: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়',
    desc: 'সহশিক্ষা অবকাঠামো উন্নয়ন, অর্থায়ন ও পরিচালনা পর্ষদের সার্বিক পৃষ্ঠপোষকতা ও উৎসাহ প্রদান।'
  },
  chiefAdvisor: {
    teacherId: 'T02',
    name: 'মোঃ খোরশেদ আলম',
    designation: 'সহকারী প্রধান শিক্ষক',
    role: 'প্রধান উপদেষ্টা',
    phone: '01712-445566'
  },
  clubAdvisors: [
    {
      id: 'adv-sci-1',
      clubKey: 'science',
      clubName: 'মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)',
      teacherId: 'T08',
      teacherName: 'মোঃ হাবিবুর রহমান',
      teacherDesignation: 'সহকারী শিক্ষক (গণিত ও বিজ্ঞান)',
      roleTitle: 'প্রধান উপদেষ্টা ও ইনোভেশন কিউরেটর',
      phone: '01718-445566'
    },
    {
      id: 'adv-sci-2',
      clubKey: 'science',
      clubName: 'মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)',
      teacherId: 'T14',
      teacherName: 'মোঃ রফিকুল ইসলাম',
      teacherDesignation: 'সহকারী শিক্ষক (ভৌত বিজ্ঞান)',
      roleTitle: 'সহ-উপদেষ্টা ও ল্যাব মেন্টর',
      phone: '01719-556677'
    },
    {
      id: 'adv-ict-1',
      clubKey: 'ict',
      clubName: 'মগড়া আইসিটি ও কোডিং ক্লাব',
      teacherId: 'T06',
      teacherName: 'মুহাম্মদ আবুবকর সিদ্দিক',
      teacherDesignation: 'সহকারী শিক্ষক (আইসিটি)',
      roleTitle: 'প্রধান উপদেষ্টা ও কোডিং মেন্টর',
      phone: '01717-334455'
    },
    {
      id: 'adv-lit-1',
      clubKey: 'literature',
      clubName: 'মগড়া ভাষা ও সাহিত্য ক্লাব',
      teacherId: 'T03',
      teacherName: 'মোঃ আব্দুল খালেক',
      teacherDesignation: 'সহকারী শিক্ষক (বাংলা)',
      roleTitle: 'প্রধান উপদেষ্টা ও কিশলয় সম্পাদক',
      phone: '01716-223344'
    },
    {
      id: 'adv-lit-2',
      clubKey: 'literature',
      clubName: 'মগড়া ভাষা ও সাহিত্য ক্লাব',
      teacherId: 'T04',
      teacherName: 'মোঃ আশরাফুল আলম',
      teacherDesignation: 'সহকারী শিক্ষক (ইংরেজি)',
      roleTitle: 'সহ-উপদেষ্টা (ভাষা ও সাহিত্যচর্চা)',
      phone: '01715-112233'
    },
    {
      id: 'adv-deb-1',
      clubKey: 'debate',
      clubName: 'মগড়া ডিবেটিং ক্লাব (বিতর্ক)',
      teacherId: 'T04',
      teacherName: 'মোঃ আশরাফুল আলম',
      teacherDesignation: 'সহকারী শিক্ষক (ইংরেজি)',
      roleTitle: 'প্রধান উপদেষ্টা ও মডারেটর',
      phone: '01715-112233'
    },
    {
      id: 'adv-deb-2',
      clubKey: 'debate',
      clubName: 'মগড়া ডিবেটিং ক্লাব (বিতর্ক)',
      teacherId: 'T03',
      teacherName: 'মোঃ আব্দুল খালেক',
      teacherDesignation: 'সহকারী শিক্ষক (বাংলা)',
      roleTitle: 'সহ-উপদেষ্টা ও যুক্তি বিচারক',
      phone: '01716-223344'
    }
  ]
};

export const CLUB_ORDER_PRIORITY = {
  science: 1,
  ict: 2,
  literature: 3,
  debate: 4,
  all: 5
};

export function ClubAcademyUnifiedHub({ teachers = [], onSelectClub }) {
  // Feature Tab: 'necessity' (ফিচার ১) by default on entry
  const [activeFeatureTab, setActiveFeatureTab] = useState('necessity'); // 'necessity' | 'advisory' | 'directory' | 'all'
  const [feature1Filter, setFeature1Filter] = useState('all');
  const [guideCollapsed, setGuideCollapsed] = useState(false);
  const [advisorySaveMsg, setAdvisorySaveMsg] = useState('');

  // Advisory State
  const [advisoryData, setAdvisoryData] = useState(() => {
    try {
      const raw = localStorage.getItem(ADVISORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.chiefPatron && Array.isArray(parsed.clubAdvisors)) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_ADVISORY_DATA;
  });

  // Effective teachers list
  const activeTeachers = teachers && teachers.length ? teachers : MOCK_TEACHERS;

  // New advisor form fields
  const [newAdvClubKey, setNewAdvClubKey] = useState('science');
  const [newAdvTeacherId, setNewAdvTeacherId] = useState(activeTeachers[0]?.id || activeTeachers[0]?.employee_id || 'T01');
  const [newAdvRoleTitle, setNewAdvRoleTitle] = useState('উপদেষ্টা ও মডারেটর');

  // Edit advisor state
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [editForm, setEditForm] = useState({
    clubKey: 'science',
    teacherId: '',
    roleTitle: ''
  });

  useEffect(() => {
    if (activeTeachers.length && !newAdvTeacherId) {
      setNewAdvTeacherId(activeTeachers[0].id || activeTeachers[0].employee_id || 'T01');
    }
  }, [activeTeachers, newAdvTeacherId]);

  // Persist Advisory helper
  const persistAdvisory = (data) => {
    try {
      localStorage.setItem(ADVISORY_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save advisory data:', e);
    }
  };

  // Chief Advisor change handler
  const handleChiefAdvisorChange = (e) => {
    const selectedId = e.target.value;
    const foundTeacher = activeTeachers.find(t => (t.id === selectedId || t.employee_id === selectedId));
    if (foundTeacher) {
      const updated = {
        ...advisoryData,
        chiefAdvisor: {
          teacherId: selectedId,
          name: foundTeacher.name_bn || foundTeacher.name_en,
          designation: foundTeacher.designation || 'সহকারী শিক্ষক',
          role: 'প্রধান উপদেষ্টা',
          phone: foundTeacher.phone || '01712-445566'
        }
      };
      setAdvisoryData(updated);
      persistAdvisory(updated);
      setAdvisorySaveMsg('উপদেষ্টা পরিষদের প্রধান উপদেষ্টা সফলভাবে নির্বাচিত ও সংরক্ষিত হয়েছে!');
      setTimeout(() => setAdvisorySaveMsg(''), 3500);
    }
  };

  // Add new Club Advisor
  const handleAddClubAdvisor = (e) => {
    e.preventDefault();
    const foundTeacher = activeTeachers.find(t => (t.id === newAdvTeacherId || t.employee_id === newAdvTeacherId)) || activeTeachers[0];
    if (!foundTeacher) return;

    const clubNameMap = {
      debate: 'মগড়া ডিবেটিং ক্লাব (বিতর্ক)',
      science: 'মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)',
      ict: 'মগড়া আইসিটি ও কোডিং ক্লাব',
      literature: 'মগড়া ভাষা ও সাহিত্য ক্লাব',
      all: 'সার্বিক একাডেমি পরিষদ'
    };

    const newAdvisor = {
      id: 'adv-' + Date.now(),
      clubKey: newAdvClubKey,
      clubName: clubNameMap[newAdvClubKey] || 'স্কুল ক্লাব',
      teacherId: foundTeacher.id || foundTeacher.employee_id,
      teacherName: foundTeacher.name_bn || foundTeacher.name_en,
      teacherDesignation: foundTeacher.designation || 'সহকারী শিক্ষক',
      roleTitle: newAdvRoleTitle.trim() || 'উপদেষ্টা',
      phone: foundTeacher.phone || '—'
    };

    const updated = {
      ...advisoryData,
      clubAdvisors: [...(advisoryData.clubAdvisors || []), newAdvisor]
    };
    setAdvisoryData(updated);
    persistAdvisory(updated);
    setAdvisorySaveMsg(`নতুন উপদেষ্টা "${newAdvisor.teacherName}" সফলভাবে যুক্ত ও সংরক্ষিত হয়েছে!`);
    setTimeout(() => setAdvisorySaveMsg(''), 3500);
  };

  // Remove Advisor
  const handleRemoveAdvisor = (id) => {
    if (!window.confirm('আপনি কি এই উপদেষ্টাকে পরিষদ থেকে অপসারণ করতে চান?')) return;
    const updated = {
      ...advisoryData,
      clubAdvisors: (advisoryData.clubAdvisors || []).filter(a => a.id !== id)
    };
    setAdvisoryData(updated);
    persistAdvisory(updated);
    setAdvisorySaveMsg('উপদেষ্টা সফলভাবে অপসারিত হয়েছে!');
    setTimeout(() => setAdvisorySaveMsg(''), 3000);
  };

  // Start Edit Advisor
  const handleStartEditAdvisor = (adv) => {
    setEditingAdvisor(adv);
    setEditForm({
      clubKey: adv.clubKey || 'debate',
      teacherId: adv.teacherId || activeTeachers[0]?.id || activeTeachers[0]?.employee_id || 'T01',
      roleTitle: adv.roleTitle || 'উপদেষ্টা'
    });
  };

  // Save Updated Advisor
  const handleUpdateAdvisor = (e) => {
    e.preventDefault();
    if (!editingAdvisor) return;

    const foundTeacher = activeTeachers.find(t => (t.id === editForm.teacherId || t.employee_id === editForm.teacherId)) || activeTeachers[0];

    const clubNameMap = {
      debate: 'মগড়া ডিবেটিং ক্লাব (বিতর্ক)',
      science: 'মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)',
      ict: 'মগড়া আইসিটি ও কোডিং ক্লাব',
      literature: 'মগড়া ভাষা ও সাহিত্য ক্লাব',
      all: 'সার্বিক একাডেমি পরিষদ'
    };

    const updatedList = (advisoryData.clubAdvisors || []).map(adv => {
      if (adv.id === editingAdvisor.id) {
        return {
          ...adv,
          clubKey: editForm.clubKey,
          clubName: clubNameMap[editForm.clubKey] || adv.clubName || 'স্কুল ক্লাব',
          teacherId: foundTeacher.id || foundTeacher.employee_id,
          teacherName: foundTeacher.name_bn || foundTeacher.name_en,
          teacherDesignation: foundTeacher.designation || 'সহকারী শিক্ষক',
          roleTitle: (editForm.roleTitle || '').trim() || 'উপদেষ্টা',
          phone: foundTeacher.phone || adv.phone || '—'
        };
      }
      return adv;
    });

    const updated = {
      ...advisoryData,
      clubAdvisors: updatedList
    };

    setAdvisoryData(updated);
    persistAdvisory(updated);
    setEditingAdvisor(null);
    setAdvisorySaveMsg('উপদেষ্টার তথ্য সফলভাবে হালনাগাদ ও সংরক্ষিত হয়েছে!');
    setTimeout(() => setAdvisorySaveMsg(''), 3500);
  };

  // Manual Save
  const handleManualSaveAdvisory = () => {
    persistAdvisory(advisoryData);
    setAdvisorySaveMsg('পৃষ্ঠপোষক ও উপদেষ্টা পরিষদের সকল তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setAdvisorySaveMsg(''), 3500);
  };

  // Reset Advisory
  const handleResetAdvisoryToDefault = () => {
    if (!window.confirm('আপনি কি উপদেষ্টা পরিষদকে মূল ডিফল্ট তথ্যে ফিরিয়ে নিতে চান?')) return;
    setAdvisoryData(DEFAULT_ADVISORY_DATA);
    persistAdvisory(DEFAULT_ADVISORY_DATA);
    setAdvisorySaveMsg('ডিফল্ট তথ্যে সফলভাবে পুনর্স্থাপন করা হয়েছে!');
    setTimeout(() => setAdvisorySaveMsg(''), 3500);
  };

  // Print Official School Pad
  const handlePrintAdvisoryPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const chiefPatron = advisoryData.chiefPatron || DEFAULT_ADVISORY_DATA.chiefPatron;
    const committeePatron = advisoryData.managingCommitteePatron || DEFAULT_ADVISORY_DATA.managingCommitteePatron;
    const chiefAdvisor = advisoryData.chiefAdvisor || DEFAULT_ADVISORY_DATA.chiefAdvisor;
    const clubAdvisors = [...(advisoryData.clubAdvisors || [])].sort((a, b) => {
      const pA = CLUB_ORDER_PRIORITY[a.clubKey] || 99;
      const pB = CLUB_ORDER_PRIORITY[b.clubKey] || 99;
      return pA - pB;
    });

    const advisorRows = clubAdvisors.map((adv, idx) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(idx + 1)}.</td>
        <td style="font-weight:700;color:#0f172a;">${adv.clubName || '—'}</td>
        <td>
          <b>${adv.teacherName || '—'}</b>
          <br><small style="color:#64748b;">${adv.teacherDesignation || ''}</small>
        </td>
        <td style="font-weight:700;color:#047857;">${adv.roleTitle || 'উপদেষ্টা'}</td>
        <td style="text-align:center;">${adv.phone || '—'}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ — মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page {
            size: A4 portrait;
            margin: 6mm 12mm 12mm 12mm;
          }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .doc-meta { font-size: 12.5px; color: #475569; margin-bottom: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
          .section-box { border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; background: #f8fafc; }
          .section-box h3 { margin: 0 0 8px 0; font-size: 14.5px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: middle; }
          th { background: #f0fdf4; color: #166534; font-weight: 800; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13.5px; }
          .sig-box-left { text-align: center; }
          .sig-box-right { text-align: center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">🏛️ সহশিক্ষা ও একাডেমি পরিষদ</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">মগড়া পালস্ সহশিক্ষা ও ক্লাব একাডেমি — পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ</h2>
          <div class="doc-meta">
            অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬ • সক্রিয় ক্লাবসত্ত্বা: ৪টি
          </div>
        </div>

        <div class="section-box">
          <h3>🌟 শীর্ষ পৃষ্ঠপোষকমণ্ডলী</h3>
          <div class="grid-2">
            <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:6px;">
              <span style="font-size:11px; font-weight:800; background:#e0e7ff; color:#3730a3; padding:2px 6px; border-radius:4px;">প্রধান পৃষ্ঠপোষক</span>
              <div style="font-size:14px; font-weight:800; margin-top:4px;">${chiefPatron.name}</div>
              <div style="font-size:12px; color:#475569;">${chiefPatron.designation}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">${chiefPatron.school}</div>
            </div>
            <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:6px;">
              <span style="font-size:11px; font-weight:800; background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px;">সার্বিক পৃষ্ঠপোষক</span>
              <div style="font-size:14px; font-weight:800; margin-top:4px;">${committeePatron.name}</div>
              <div style="font-size:12px; color:#475569;">${committeePatron.designation}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">${committeePatron.school}</div>
            </div>
          </div>
        </div>

        <div class="section-box" style="background:#f0fdf4; border-color:#86efac;">
          <h3 style="color:#065f46; border-color:#bbf7d0;">⭐ উপদেষ্টা পরিষদের প্রধান উপদেষ্টা</h3>
          <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #bbf7d0; padding:10px 14px; border-radius:6px;">
            <div>
              <b style="font-size:14px; color:#0f172a;">${chiefAdvisor.name}</b>
              <span style="color:#64748b; font-size:12.5px;"> — ${chiefAdvisor.designation}</span>
            </div>
            <div style="font-size:12px; font-weight:700; color:#047857;">
              ফোন: ${chiefAdvisor.phone || '—'}
            </div>
          </div>
        </div>

        <div class="section-box" style="background:#ffffff;">
          <h3 style="color:#1e293b;">📋 বিভিন্ন ক্লাবের উপদেষ্টা ও মডারেটর পরিষদের পূর্ণাঙ্গ তালিকা</h3>
          <table>
            <thead>
              <tr>
                <th style="width:36px; text-align:center;">ক্র.নং</th>
                <th>ক্লাবের নাম</th>
                <th>উপদেষ্টার নাম ও মূল পদবী</th>
                <th>ক্লাবে অর্পিত দায়িত্ব</th>
                <th style="width:110px; text-align:center;">যোগাযোগ</th>
              </tr>
            </thead>
            <tbody>
              ${advisorRows}
            </tbody>
          </table>
        </div>

        <div class="sig-grid">
          <div class="sig-box-left">
            <div class="sig-line"></div>
            <b>নেয়ামুল হক খান</b><br>
            <span>সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ</span><br>
            <small>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</small>
          </div>
          <div class="sig-box-right">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span><br>
            <small>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</small>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 450);
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif" }}>
      {/* ======================================================== */}
      {/* TOP FEATURE NAVIGATOR TABS */}
      {/* ======================================================== */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '18px',
        background: '#f8fafc',
        padding: '10px',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
      }}>
        <button
          type="button"
          onClick={() => setActiveFeatureTab('necessity')}
          style={{
            flex: '1 1 210px',
            padding: '11px 16px',
            borderRadius: '8px',
            border: activeFeatureTab === 'necessity' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: activeFeatureTab === 'necessity' ? '#ecfdf5' : '#ffffff',
            color: activeFeatureTab === 'necessity' ? '#065f46' : '#334155',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeFeatureTab === 'necessity' ? '0 2px 8px rgba(5,150,105,0.18)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '18px' }}>💡</span>
          <span>ফিচার ১: প্রয়োজনীয়তা ও করণীয়</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFeatureTab('advisory')}
          style={{
            flex: '1 1 210px',
            padding: '11px 16px',
            borderRadius: '8px',
            border: activeFeatureTab === 'advisory' ? '2px solid #312e81' : '1px solid #cbd5e1',
            background: activeFeatureTab === 'advisory' ? '#eef2ff' : '#ffffff',
            color: activeFeatureTab === 'advisory' ? '#312e81' : '#334155',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeFeatureTab === 'advisory' ? '0 2px 8px rgba(49,46,129,0.18)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '18px' }}>🏛️</span>
          <span>ফিচার ২: পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFeatureTab('directory')}
          style={{
            flex: '1 1 210px',
            padding: '11px 16px',
            borderRadius: '8px',
            border: activeFeatureTab === 'directory' ? '2px solid #0284c7' : '1px solid #cbd5e1',
            background: activeFeatureTab === 'directory' ? '#e0f2fe' : '#ffffff',
            color: activeFeatureTab === 'directory' ? '#0369a1' : '#334155',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeFeatureTab === 'directory' ? '0 2px 8px rgba(2,132,199,0.18)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '18px' }}>🚀</span>
          <span>ফিচার ৩: সক্রিয় ৪টি ক্লাব ডিরেক্টরি</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFeatureTab('all')}
          style={{
            padding: '11px 18px',
            borderRadius: '8px',
            border: activeFeatureTab === 'all' ? '2px solid #475569' : '1px solid #cbd5e1',
            background: activeFeatureTab === 'all' ? '#f1f5f9' : '#ffffff',
            color: '#1e293b',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>📜</span>
          <span>একনজরে সকল ফিচার</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* FEATURE 1: ক্লাব গঠনের প্রয়োজনীয়তা ও আমাদের করণীয় অবহিতকরণ */}
      {/* ======================================================== */}
      {(activeFeatureTab === 'necessity' || activeFeatureTab === 'all') && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #d1fae5',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(4, 120, 87, 0.05)'
        }}>
          {/* Header Badge & Title */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '3px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '4px'
              }}>
                💡 ফিচার ১: অবহিতকরণ ও দিকনির্দেশনা
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '19px', fontWeight: 900, color: '#065f46' }}>
                বিজ্ঞান, আইসিটি, ভাষা-সাহিত্য ও ডিবেটিং ক্লাব গঠনের প্রয়োজনীয়তা এবং আমাদের করণীয়
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের সহশিক্ষা অগ্রযাত্রায় সক্রিয় ৪টি ক্লাবের গুরুত্ব, শিক্ষার্থীদের ভূমিকা ও বাস্তবমুখী কর্মপরিকল্পনা
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'all', label: 'সবগুলো (৪টি ক্লাব)' },
                { id: 'science', label: '🔬 বিজ্ঞান ক্লাব' },
                { id: 'ict', label: '💻 আইসিটি ক্লাব' },
                { id: 'literature', label: '📚 ভাষা ও সাহিত্য' },
                { id: 'debate', label: '🎤 ডিবেটিং ক্লাব' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeature1Filter(f.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    border: feature1Filter === f.id ? '1.5px solid #047857' : '1px solid #cbd5e1',
                    background: feature1Filter === f.id ? '#047857' : '#f8fafc',
                    color: feature1Filter === f.id ? '#ffffff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {/* 1. SCIENCE CLUB CARD */}
            {(feature1Filter === 'all' || feature1Filter === 'science') && (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>🔬</span>
                    <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                      উদ্ভাবন ও গবেষণা
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16.5px', color: '#14532d', fontWeight: 800 }}>
                    মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান ক্লাব)
                  </h4>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#15803d', marginBottom: '10px', fontWeight: 600 }}>
                    “উদ্ভাবনে তাক লাগাবে গ্রাম, বিজ্ঞানেই গড়ব দেশের নাম”
                  </div>

                  {/* Necessity */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', border: '1px solid #bbf7d0' }}>
                    <b style={{ color: '#166534', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>📌</span> ক্লাব গঠনের প্রয়োজনীয়তা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li>বিজ্ঞান শিক্ষাকে মুখস্থের বদলে ব্যবহারিক পরীক্ষা ও বাস্তব পর্যবেক্ষণে রূপান্তর।</li>
                      <li>শিক্ষার্থীদের মাঝে অনুসন্ধানমূলক মন ও কুসংস্কারমুক্ত যৌক্তিক দৃষ্টিভঙ্গি তৈরি।</li>
                      <li>সৌরশক্তি, বর্জ্য ব্যবস্থাপনা, রোবোটিক্স ও পরিবেশবান্ধব প্রযুক্তির সাথে পরিচয়।</li>
                      <li>উপজেলা ও জাতীয় বিজ্ঞান মেলায় অংশগ্রহণের উপযোগী ক্ষুদে গবেষক তৈরি।</li>
                    </ul>
                  </div>

                  {/* Our Duties */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                    <b style={{ color: '#047857', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>🎯</span> আমাদের করণীয় ও কর্মপরিকল্পনা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li><b>বিদ্যালয় ও কমিটি:</b> বিজ্ঞানাগার সার্বক্ষণিক সচল রাখা ও প্রয়োজনীয় উপকরণ সরবরাহ।</li>
                      <li><b>উপদেষ্টামণ্ডলী:</b> প্রতি মাসে ২টি উদ্ভাবনী প্র্যাকটিক্যাল সেশন ও প্রজেক্ট মেন্টরিং।</li>
                      <li><b>শিক্ষার্থীবৃন্দ:</b> দৈনন্দিন জীবনের সমস্যা সমাধানে নতুন মডেল ও সায়েন্স প্রজেক্ট তৈরি।</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                  <span>🎯 বাৎসরিক লক্ষ্য: সায়েন্স ফেয়ার ২০২৬</span>
                  <button
                    type="button"
                    onClick={() => onSelectClub && onSelectClub('science', 'overview')}
                    style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    বিজ্ঞান ক্লাবে প্রবেশ ➔
                  </button>
                </div>
              </div>
            )}

            {/* 2. ICT CLUB CARD */}
            {(feature1Filter === 'all' || feature1Filter === 'ict') && (
              <div style={{
                background: '#f0f9ff',
                border: '2px solid #7dd3fc',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>💻</span>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                      কোডিং ও প্রযুক্তি
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16.5px', color: '#075985', fontWeight: 800 }}>
                    মগড়া আইসিটি ও কোডিং ক্লাব
                  </h4>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#0284c7', marginBottom: '10px', fontWeight: 600 }}>
                    “কোডের ছন্দে গড়ব ভবিষ্যৎ, প্রযুক্তির আলোয় আলোকিত হোক জগৎ”
                  </div>

                  {/* Necessity */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', border: '1px solid #bae6fd' }}>
                    <b style={{ color: '#0284c7', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>📌</span> ক্লাব গঠনের প্রয়োজনীয়তা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li>৪র্থ শিল্পবিপ্লব ও স্মার্ট বাংলাদেশের উপযোগী কম্পিউটার ও প্রোগ্রামিং দক্ষতা অর্জন।</li>
                      <li>মুখস্থ বিদ্যার বিকল্প হিসেবে অ্যালগরিদম ও লজিক্যাল থিংকিংয়ের ভিত্তি স্থাপন।</li>
                      <li>সাইবার নিরাপত্তা, নিরাপদ ইন্টারনেট ও সোশ্যাল মিডিয়ার দায়িত্বশীল ব্যবহার শিক্ষা।</li>
                      <li>গ্রাফিক্স ডিজাইন, ওয়েব ডিজাইন ও ভবিষ্যৎ প্রযুক্তি পেশার প্রাথমিক বুনিয়াদ।</li>
                    </ul>
                  </div>

                  {/* Our Duties */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #bae6fd' }}>
                    <b style={{ color: '#0369a1', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>🎯</span> আমাদের করণীয় ও কর্মপরিকল্পনা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li><b>বিদ্যালয় ও কমিটি:</b> শেখ রাসেল ডিজিটাল ল্যাব ও উচ্চগতির ইন্টারনেট নিরবচ্ছিন্ন রাখা।</li>
                      <li><b>উপদেষ্টামণ্ডলী:</b> স্ক্র্যাচ কোডিং, পাইথন ও অফিস অ্যাপ্লিকেশন কর্মশালা পরিচালনা।</li>
                      <li><b>শিক্ষার্থীবৃন্দ:</b> কোডিং প্রজেক্ট, ওয়েব পেজ ডিজাইন ও টাইপিং প্রতিযোগিতায় সক্রিয় থাকা।</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #7dd3fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                  <span>🎯 বাৎসরিক লক্ষ্য: কোডিং অলিম্পিয়াড ২০২৬</span>
                  <button
                    type="button"
                    onClick={() => onSelectClub && onSelectClub('ict', 'overview')}
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    আইসিটি ক্লাবে প্রবেশ ➔
                  </button>
                </div>
              </div>
            )}

            {/* 3. LITERATURE CLUB CARD */}
            {(feature1Filter === 'all' || feature1Filter === 'literature') && (
              <div style={{
                background: '#fffbeb',
                border: '2px solid #fde68a',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>📚</span>
                    <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                      ভাষা ও সাহিত্যচর্চা
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16.5px', color: '#78350f', fontWeight: 800 }}>
                    মগড়া ভাষা ও সাহিত্য ক্লাব
                  </h4>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#b45309', marginBottom: '10px', fontWeight: 600 }}>
                    “শব্দের শক্তিতে বিকশিত মেধা, সাহিত্যের আলোয় আলোকিত চেতনা”
                  </div>

                  {/* Necessity */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', border: '1px solid #fde68a' }}>
                    <b style={{ color: '#b45309', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>📌</span> ক্লাব গঠনের প্রয়োজনীয়তা:
                        </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li>বাংলা ও ইংরেজি উভয় ভাষায় প্রমিত উচ্চারণ, বানানরীতি ও শুদ্ধ বাচনভঙ্গি বিকাশ।</li>
                      <li>বইপড়ার অভ্যাস সৃষ্টি ও শিক্ষার্থীদের লাইব্রেরিমুখী করে মননশীলতা বৃদ্ধি।</li>
                      <li>স্বরচিত গল্প, কবিতা, প্রবন্ধ ও চিত্রাঙ্কনের মাধ্যমে সৃজনশীল মেধার উন্মেষ।</li>
                      <li>জাতীয় ঐতিহ্য, লোকসংস্কৃতি ও বিশ্বসাহিত্যের সাথে পরিচয় করিয়ে দেওয়া।</li>
                    </ul>
                  </div>

                  {/* Our Duties */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #fde68a' }}>
                    <b style={{ color: '#92400e', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>🎯</span> আমাদের করণীয় ও কর্মপরিকল্পনা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li><b>বিদ্যালয় ও কমিটি:</b> সমৃদ্ধ লাইব্রেরি পরিচালনা ও দেয়াল পত্রিকার বার্ষিক বাজেট বরাদ্দ।</li>
                      <li><b>উপদেষ্টামণ্ডলী:</b> সাহিত্য আসর পরিচালনা, ‘কিশলয়’ সম্পাদনা ও আবৃত্তি কর্মশালা আয়োজন।</li>
                      <li><b>শিক্ষার্থীবৃন্দ:</b> স্বরচিত লেখা নিয়মিত জমা দেওয়া ও ‘সেরা পাঠক’ সম্মাননা অর্জন।</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#b45309', fontWeight: 700 }}>
                  <span>🎯 বাৎসরিক লক্ষ্য: দেয়াল পত্রিকা ‘কিশলয়’</span>
                  <button
                    type="button"
                    onClick={() => onSelectClub && onSelectClub('literature', 'overview')}
                    style={{ background: '#c2410c', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    সাহিত্য ক্লাবে প্রবেশ ➔
                  </button>
                </div>
              </div>
            )}

            {/* 4. DEBATE CLUB CARD */}
            {(feature1Filter === 'all' || feature1Filter === 'debate') && (
              <div style={{
                background: '#eef2ff',
                border: '2px solid #a5b4fc',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>🎤</span>
                    <span style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                      যুক্তি ও বাচনভঙ্গি
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16.5px', color: '#312e81', fontWeight: 800 }}>
                    মগড়া ডিবেটিং ক্লাব (বিতর্ক ক্লাব)
                  </h4>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#4338ca', marginBottom: '10px', fontWeight: 600 }}>
                    “যুক্তির আলোয় কাটুক অন্ধকারের মেঘ, শাণিত হোক সত্যের বিবেক”
                  </div>

                  {/* Necessity */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', border: '1px solid #c7d2fe' }}>
                    <b style={{ color: '#3730a3', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>📌</span> ক্লাব গঠনের প্রয়োজনীয়তা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li>যৌক্তিক চিন্তা, বস্তুনিষ্ঠ তথ্য বিশ্লেষণ ও নির্ভীক বাচনভঙ্গির স্ফুরণ ঘটানো।</li>
                      <li>ভিন্নমতের প্রতি সহনশীলতা ও সুস্থ পরমতশ্রদ্ধাবোধের মানসিকতা গঠন।</li>
                      <li>জনসমক্ষে সাবলীল বক্তৃতা প্রদান ও তাৎক্ষণিক প্রত্যুৎপন্নমতিত্বের উন্নয়ন।</li>
                      <li>জাতীয় সংসদীয় বিতর্কের নিয়মকানুন রপ্ত করে সুনাগরিক ও নেতা হিসেবে গড়ে ওঠা।</li>
                    </ul>
                  </div>

                  {/* Our Duties */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #c7d2fe' }}>
                    <b style={{ color: '#312e81', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span>🎯</span> আমাদের করণীয় ও কর্মপরিকল্পনা:
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.55' }}>
                      <li><b>বিদ্যালয় ও কমিটি:</b> বিতর্ক মঞ্চ, সাউন্ড সিস্টেম ও বিতর্ক রিসোর্স কর্নার স্থাপন।</li>
                      <li><b>উপদেষ্টামণ্ডলী:</b> সংসদীয় ও সনাতনী বিতর্কের নিয়মাবলী প্রশিক্ষণ ও মোশন নির্বাচন।</li>
                      <li><b>শিক্ষার্থীবৃন্দ:</b> সমসাময়িক জাতীয় বিষয়ে নিয়মিত তথ্য টোকা ও যুক্তির মহড়ায় অংশ নেওয়া।</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #a5b4fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#3730a3', fontWeight: 700 }}>
                  <span>🎯 বাৎসরিক লক্ষ্য: আন্তঃক্লাস বিতর্ক উৎসব</span>
                  <button
                    type="button"
                    onClick={() => onSelectClub && onSelectClub('debate', 'competitions')}
                    style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ডিবেটিং ক্লাবে প্রবেশ ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Quick Jump Action for Feature 1 */}
          <div style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              পরবর্তী ধাপে ক্লাবের সাংগঠনিক নেতৃত্ব ও পৃষ্ঠপোষক পরিষদ দেখুন:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('advisory')}
                style={{
                  background: '#312e81',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>👉 পরবর্তী ফিচার: পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ (ফিচার ২) ➔</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('directory')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🚀 সক্রিয় ৪টি ক্লাব ডিরেক্টরি (ফিচার ৩) ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FEATURE 2: পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ */}
      {/* ======================================================== */}
      {(activeFeatureTab === 'advisory' || activeFeatureTab === 'all') && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(49, 46, 129, 0.05)'
        }}>
          {/* Header Badge, Title & Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: '#eef2ff',
                color: '#312e81',
                border: '1px solid #c7d2fe',
                padding: '3px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '4px'
              }}>
                🏛️ ফিচার ২: একাডেমি নেতৃত্ব ও কমিটি
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '19px', fontWeight: 900, color: '#1e1b4b' }}>
                পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                প্রধান পৃষ্ঠপোষক (প্রধান শিক্ষক), সার্বিক পৃষ্ঠপোষকতা (ম্যানেজিং কমিটি) এবং শিক্ষকদের ড্রপ-ডাউন থেকে উপদেষ্টা নির্বাচন ও পরিচালনা
              </p>
            </div>

            {/* Top Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrintAdvisoryPad}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 5px rgba(4,120,87,0.2)'
                }}
              >
                <span>🖨️</span>
                <span>অফিসিয়াল প্যাডে প্রিন্ট করুন</span>
              </button>

              <button
                type="button"
                onClick={handleManualSaveAdvisory}
                style={{
                  background: '#312e81',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 5px rgba(49,46,129,0.2)'
                }}
              >
                <span>💾</span>
                <span>তথ্য সংরক্ষণ</span>
              </button>

              <button
                type="button"
                onClick={handleResetAdvisoryToDefault}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="ডিফল্ট উপদেষ্টা তালিকায় ফিরিয়ে নিন"
              >
                <span>🔄 ডিফল্ট</span>
              </button>
            </div>
          </div>

          {/* Alert message if saved */}
          {advisorySaveMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #86efac',
              color: '#065f46',
              padding: '9px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✅</span>
              <span>{advisorySaveMsg}</span>
            </div>
          )}

          {/* SECTION A: PERMANENT TOP PATRONS */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#1e293b',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🌟</span>
              <span>শীর্ষ পৃষ্ঠপোষকমণ্ডলী (Permanent Patrons)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {/* Card 1: Chief Patron (Head Teacher) */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <img
                  src={PHOTO_HEAD_TEACHER}
                  alt="প্রধান শিক্ষক"
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #312e81',
                    flexShrink: 0
                  }}
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Head+Teacher&background=312e81&color=fff'; }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}>
                    প্রধান পৃষ্ঠপোষক
                  </span>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                    {advisoryData.chiefPatron?.name || 'মুহাম্মদ শফিকুল ইসলাম'}
                  </h4>
                  <div style={{ fontSize: '12.5px', color: '#047857', fontWeight: 700 }}>
                    {advisoryData.chiefPatron?.designation || 'প্রধান শিক্ষক'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
                    {advisoryData.chiefPatron?.desc || 'সার্বিক নীতি নির্ধারণ, বাৎসরিক ক্লাব বাজেট অনুমোদন ও প্রাতিষ্ঠানিক দিকনির্দেশনা প্রদান।'}
                  </div>
                </div>
              </div>

              {/* Card 2: Managing Committee Patron (President) */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <img
                  src={PHOTO_PRESIDENT}
                  alt="সভাপতি"
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #b45309',
                    flexShrink: 0
                  }}
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Managing+Committee&background=b45309&color=fff'; }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}>
                    সার্বিক পৃষ্ঠপোষকতা
                  </span>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                    {advisoryData.managingCommitteePatron?.name || 'নেয়ামুল হক খান'}
                  </h4>
                  <div style={{ fontSize: '12.5px', color: '#b45309', fontWeight: 700 }}>
                    {advisoryData.managingCommitteePatron?.designation || 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ (ম্যানেজিং কমিটি)'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
                    {advisoryData.managingCommitteePatron?.desc || 'সহশিক্ষা অবকাঠামো উন্নয়ন, অর্থায়ন ও পরিচালনা পর্ষদের পৃষ্ঠপোষকতা ও উৎসাহ প্রদান।'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: CHIEF ADVISOR DROPDOWN SELECTION */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⭐</span>
                <div>
                  <b style={{ color: '#065f46', fontSize: '14.5px' }}>
                    উপদেষ্টা পরিষদের প্রধান উপদেষ্টা নির্বাচন
                  </b>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
                    বিদ্যালয়ের শিক্ষকদের তালিকা থেকে ড্রপ-ডাউনে প্রধান উপদেষ্টা নির্বাচন করুন:
                  </div>
                </div>
              </div>

              {/* Chief Advisor Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', whiteSpace: 'nowrap' }}>শিক্ষক নির্বাচন:</span>
                <select
                  value={advisoryData.chiefAdvisor?.teacherId || ''}
                  onChange={handleChiefAdvisorChange}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #059669',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#065f46',
                    background: '#ffffff',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  {activeTeachers.map(t => (
                    <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                      {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Display Current Selected Chief Advisor */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  border: '2px solid #059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  👨‍🏫
                </div>
                <div>
                  <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    {advisoryData.chiefAdvisor?.role || 'প্রধান উপদেষ্টা'}
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                    {advisoryData.chiefAdvisor?.name || 'মোঃ খোরশেদ আলম'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {advisoryData.chiefAdvisor?.designation || 'সহকারী প্রধান শিক্ষক'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                  📱 {advisoryData.chiefAdvisor?.phone || '01712-445566'}
                </div>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  সহশিক্ষা ও ক্লাব একাডেমি কেন্দ্রীয় সমন্বয়ক
                </small>
              </div>
            </div>
          </div>

          {/* SECTION C: MULTI-CLUB ADVISORS MANAGEMENT */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>👥</span>
              <div>
                <b style={{ color: '#1e293b', fontSize: '14.5px' }}>
                  বিভিন্ন ক্লাবের জন্য একাধিক উপদেষ্টা নির্বাচন ও অন্তর্ভুক্তি
                </b>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  বিজ্ঞান, আইসিটি, সাহিত্য ও ডিবেটিং ক্লাবের জন্য শিক্ষকদের ড্রপ-ডাউন থেকে নতুন উপদেষ্টা যুক্ত করুন:
                </div>
              </div>
            </div>

            {/* Inline Add Advisor Form */}
            <form onSubmit={handleAddClubAdvisor} style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              {/* Select Club */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  ১. ক্লাব নির্বাচন:
                </label>
                <select
                  value={newAdvClubKey}
                  onChange={(e) => setNewAdvClubKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #94a3b8',
                    fontSize: '12.5px',
                    background: '#ffffff'
                  }}
                >
                  <option value="science">🔬 মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)</option>
                  <option value="ict">💻 মগড়া আইসিটি ও কোডিং ক্লাব</option>
                  <option value="literature">📚 মগড়া ভাষা ও সাহিত্য ক্লাব</option>
                  <option value="debate">🎤 মগড়া ডিবেটিং ক্লাব (বিতর্ক)</option>
                  <option value="all">🏛️ সকল ক্লাব (সার্বিক একাডেমি পরিষদ)</option>
                </select>
              </div>

              {/* Select Teacher */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  ২. শিক্ষক নির্বাচন (ড্রপ-ডাউন):
                </label>
                <select
                  value={newAdvTeacherId}
                  onChange={(e) => setNewAdvTeacherId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #94a3b8',
                    fontSize: '12.5px',
                    background: '#ffffff'
                  }}
                >
                  {activeTeachers.map(t => (
                    <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                      {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  ৩. ক্লাবে অর্পিত দায়িত্ব / পদবী:
                </label>
                <input
                  type="text"
                  value={newAdvRoleTitle}
                  onChange={(e) => setNewAdvRoleTitle(e.target.value)}
                  placeholder="যেমন: উপদেষ্টা ও মডারেটর"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #94a3b8',
                    fontSize: '12.5px'
                  }}
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#312e81',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>➕</span>
                  <span>উপদেষ্টা যুক্ত করুন</span>
                </button>
              </div>
            </form>

            {/* Current Appointed Advisors Grid */}
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
              📋 বর্তমান নিয়োজিত উপদেষ্টাবৃন্দ (মোট: {toBn(advisoryData.clubAdvisors?.length || 0)} জন):
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {[...(advisoryData.clubAdvisors || [])].sort((a, b) => {
                const pA = CLUB_ORDER_PRIORITY[a.clubKey] || 99;
                const pB = CLUB_ORDER_PRIORITY[b.clubKey] || 99;
                return pA - pB;
              }).map((adv) => {
                const badgeBg =
                  adv.clubKey === 'debate' ? '#e0e7ff' :
                  adv.clubKey === 'science' ? '#dcfce7' :
                  adv.clubKey === 'ict' ? '#e0f2fe' :
                  adv.clubKey === 'literature' ? '#ffedd5' : '#f1f5f9';
                const badgeColor =
                  adv.clubKey === 'debate' ? '#3730a3' :
                  adv.clubKey === 'science' ? '#166534' :
                  adv.clubKey === 'ict' ? '#0369a1' :
                  adv.clubKey === 'literature' ? '#9a3412' : '#334155';

                return (
                  <div
                    key={adv.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{
                        background: badgeBg,
                        color: badgeColor,
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        {adv.clubName}
                      </span>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                        {adv.teacherName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {adv.teacherDesignation}
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                        দায়িত্ব: {adv.roleTitle}
                      </div>
                      {adv.phone && adv.phone !== '—' && (
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                          📱 {adv.phone}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditAdvisor(adv)}
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="উপদেষ্টার তথ্য এডিট করুন"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveAdvisor(adv.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="উপদেষ্টাকে তালিকা থেকে সরান"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Quick Jump Action for Feature 2 */}
          <div style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <button
              type="button"
              onClick={() => setActiveFeatureTab('necessity')}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⬅️ পূর্ববর্তী ফিচার: প্রয়োজনীয়তা ও করণীয় (ফিচার ১)
            </button>

            <button
              type="button"
              onClick={() => setActiveFeatureTab('directory')}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>👉 পরবর্তী ফিচার: সক্রিয় ৪টি ক্লাবের কার্যক্রম (ফিচার ৩) ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FEATURE 3: সক্রিয় ৪টি ক্লাব ডিরেক্টরি (ছবিতে উল্লেখিত অংশ) */}
      {/* ======================================================== */}
      {(activeFeatureTab === 'directory' || activeFeatureTab === 'all') && (
        <div>
          {/* EXACT GUIDANCE CARD FROM USER IMAGE */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            boxShadow: '0 2px 5px rgba(4,120,87,0.05)'
          }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setGuideCollapsed(!guideCollapsed)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <b style={{ color: '#065f46', fontSize: '14.5px' }}>
                  সহজ ও সাবলীল নির্দেশনা গাইড: সকল ক্লাব ও সংগঠন (ডিরেক্টরি)
                </b>
                <span style={{
                  fontSize: '11px',
                  background: '#bbf7d0',
                  color: '#166534',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  নির্দেশিকা
                </span>
              </div>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {!guideCollapsed ? 'সংকুচিত করুন ▲' : 'বিস্তারিত দেখুন ▼'}
              </button>
            </div>

            {!guideCollapsed && (
              <div style={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
                fontSize: '12.5px',
                color: '#166534'
              }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '8px'
                }}>
                  <b style={{ display: 'block', marginBottom: '4px', color: '#047857' }}>
                    📌 ডাটা ইনপুটের সহজ ধাপসমূহ:
                  </b>
                  <div style={{ lineHeight: '1.6', color: '#334155' }}>
                    <div>• ১. বিদ্যালয়ের সকল ক্লাবের কেন্দ্রীয় সমন্বয় ও সেশনের স্থিতি মনিটর করুন।</div>
                    <div>• ২. ক্লাব সভাপতি, সাধারণ সম্পাদক ও মডারেটর শিক্ষকদের তথ্য আপডেট রাখুন।</div>
                    <div>• ৩. নতুন ক্লাব সদস্য নিবন্ধন ও বাৎসরিক কার্যক্রম ক্যালেন্ডার হালনাগাদ করুন।</div>
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '1px dashed #86efac',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <b style={{ display: 'block', marginBottom: '4px', color: '#047857' }}>
                    ✨ গুরুত্বপূর্ণ টিপস:
                  </b>
                  <div style={{ lineHeight: '1.5', color: '#475569' }}>
                    ক্লাব হাব থেকে সরাসরি যেকোনো ক্লাবের বিস্তারিত পাতা ও কার্যক্রমে প্রবেশ করা যায়।
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DARK ACADEMY BANNER FROM USER IMAGE */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
          }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, marginBottom: '6px' }}>
              🏛️ সহশিক্ষা ও ক্লাব একাডেমি
            </div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 900 }}>
              মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয় — সক্রিয় ৪টি ক্লাব
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              আমাদের বিদ্যালয়ের ৪টি সক্রিয় ক্লাবের একক কার্যক্রম ও সেশন দেখতে যেকোনো একটি ক্লাবে প্রবেশ করুন:
            </p>
          </div>

          {/* 4 CARDS GRID FROM USER IMAGE (বিজ্ঞানে প্রথমে, এরপর আইসিটি, এরপর সাহিত্য, এরপর বিতর্ক) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* CARD 1: SCIENCE (বিজ্ঞান) */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #a7f3d0',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 10px rgba(4, 120, 87, 0.06)'
            }}>
              <div>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔬</div>
                <span style={{ background: '#dcfce7', color: '#065f46', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  উদ্ভাবন ও গবেষণা
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#0f172a', fontWeight: 900 }}>
                  মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  “উদ্ভাবনে তাক লাগাবে গ্রাম, বিজ্ঞানেই গড়ব দেশের নাম” — রোবটিক্স, সোলার প্রজেক্ট ও বার্ষিক বিজ্ঞান মেলা উদ্ভাবন প্রতিযোগিতা।
                </p>
                <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700, marginBottom: '14px' }}>
                  👨‍🏫 মডারেটর: মোঃ হাবিবুর রহমান ও মোঃ রফিকুল ইসলাম
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectClub && onSelectClub('science', 'overview')}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                👉 বিজ্ঞান ক্লাবের একক কার্যক্রম ও মেলা ➔
              </button>
            </div>

            {/* CARD 2: ICT (আইসিটি ও কোডিং) */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #bae6fd',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.06)'
            }}>
              <div>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>💻</div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  কোডিং ও প্রযুক্তি
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#0f172a', fontWeight: 900 }}>
                  মগড়া আইসিটি ও কোডিং ক্লাব
                </h3>
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  “কোডের ছন্দে গড়ব ভবিষ্যৎ, প্রযুক্তির আলোয় আলোকিত হোক জগৎ” — শেখ রাসেল ডিজিটাল ল্যাব, পাইথন ও স্ক্র্যাচ কোডিং অলিম্পিয়াড।
                </p>
                <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 700, marginBottom: '14px' }}>
                  👨‍🏫 মডারেটর: মোঃ আবুবকর সিদ্দিক (সহকারী শিক্ষক আইসিটি)
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectClub && onSelectClub('ict', 'overview')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                👉 আইসিটি ও কোডিং ক্লাবের কার্যক্রম ➔
              </button>
            </div>

            {/* CARD 3: LITERATURE (ভাষা ও সাহিত্য) */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #fed7aa',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 10px rgba(180, 83, 9, 0.06)'
            }}>
              <div>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📚</div>
                <span style={{ background: '#ffedd5', color: '#9a3412', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ভাষা ও সাহিত্যচর্চা
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#0f172a', fontWeight: 900 }}>
                  মগড়া ভাষা ও সাহিত্য ক্লাব
                </h3>
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  “শব্দের শক্তিতে বিকশিত মেধা, সাহিত্যের আলোয় আলোকিত চেতনা” — প্রমিত বাচন, দেয়াল পত্রিকা ‘কিশলয়’ ও সাহিত্য প্রতিযোগিতা।
                </p>
                <div style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 700, marginBottom: '14px' }}>
                  👨‍🏫 মডারেটর: মোঃ আব্দুল খালেক ও মোঃ আশরাফুল আলম
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectClub && onSelectClub('literature', 'overview')}
                style={{
                  background: '#c2410c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                👉 ভাষা ও সাহিত্য ক্লাবের কার্যক্রম ➔
              </button>
            </div>

            {/* CARD 4: DEBATE (বিতর্ক) */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #c7d2fe',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 10px rgba(49, 46, 129, 0.06)'
            }}>
              <div>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎤</div>
                <span style={{ background: '#e0e7ff', color: '#312e81', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  যুক্তি ও বাচনভঙ্গি
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#0f172a', fontWeight: 900 }}>
                  মগড়া ডিবেটিং ক্লাব (বিতর্ক)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  “যুক্তির আলোয় কাটুক অন্ধকারের মেঘ, শাণিত হোক সত্যের বিবেক” — সংসদীয় বিতর্কচর্চা, বিচারকমণ্ডলী ও মডারেটর নিয়োগ, স্কোরিং ও প্রিন্ট।
                </p>
                <div style={{ fontSize: '11.5px', color: '#312e81', fontWeight: 700, marginBottom: '14px' }}>
                  👨‍🏫 মডারেটর: মোঃ আশরাফুল আলম ও মোঃ আব্দুল খালেক
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectClub && onSelectClub('debate', 'competitions')}
                style={{
                  background: '#312e81',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                👉 ডিবেটিং ক্লাবের একক কার্যক্রম ও ফলাফল ➔
              </button>
            </div>
          </div>

          {/* Bottom Quick Jump Action for Feature 3 */}
          <div style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <button
              type="button"
              onClick={() => setActiveFeatureTab('advisory')}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⬅️ পূর্ববর্তী ফিচার: পৃষ্ঠপোষক ও উপদেষ্টা পরিষদ (ফিচার ২)
            </button>

            <button
              type="button"
              onClick={() => setActiveFeatureTab('necessity')}
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⬅️ ১ম ফিচার: প্রয়োজনীয়তা ও করণীয় (ফিচার ১)
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT ADVISOR MODAL */}
      {/* ======================================================== */}
      {editingAdvisor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '2px solid #312e81',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>✏️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900 }}>
                    উপদেষ্টা তথ্য সম্পাদনা
                  </h3>
                  <small style={{ color: '#cbd5e1', fontSize: '11.5px' }}>
                    ক্লাবের নাম, শিক্ষক ও দায়িত্ব পরিবর্তন করে সংরক্ষণ করুন
                  </small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdvisor(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUpdateAdvisor} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  ১. ক্লাব নির্বাচন:
                </label>
                <select
                  value={editForm.clubKey}
                  onChange={(e) => setEditForm(prev => ({ ...prev, clubKey: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                >
                  <option value="science">🔬 মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান)</option>
                  <option value="ict">💻 মগড়া আইসিটি ও কোডিং ক্লাব</option>
                  <option value="literature">📚 মগড়া ভাষা ও সাহিত্য ক্লাব</option>
                  <option value="debate">🎤 মগড়া ডিবেটিং ক্লাব (বিতর্ক)</option>
                  <option value="all">🏛️ সকল ক্লাব (সার্বিক একাডেমি পরিষদ)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  ২. শিক্ষক নির্বাচন (ড্রপ-ডাউন):
                </label>
                <select
                  value={editForm.teacherId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, teacherId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                >
                  {activeTeachers.map(t => (
                    <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                      {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  ৩. ক্লাবে অর্পিত দায়িত্ব / পদবী:
                </label>
                <input
                  type="text"
                  value={editForm.roleTitle}
                  onChange={(e) => setEditForm(prev => ({ ...prev, roleTitle: e.target.value }))}
                  placeholder="যেমন: উপদেষ্টা ও মডারেটর / সহ-উপদেষ্টা"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  style={{
                    background: '#312e81',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(49, 46, 129, 0.25)'
                  }}
                >
                  <span>💾</span>
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

