import React, { useState, useEffect } from 'react';
import { 
  getStoredFormerPersonnelData, 
  saveStoredFormerPersonnelData, 
  DEFAULT_FORMER_PERSONNEL 
} from './formerPersonnelData';
import { 
  MOCK_TEACHERS, 
  MOCK_STAFF, 
  getTeacherPhoto, 
  getLeadershipData 
} from './mockData';
import { SubmenuDetailModal } from './SubmenuDetailModal';

export function StaffMasterAdminPanel({ sub, setSub, StaffPanelComponent }) {
  const [activeTab, setActiveTab] = useState(sub || 'head');
  const [formerData, setFormerData] = useState(getStoredFormerPersonnelData);
  const [toastMsg, setToastMsg] = useState('');
  const [previewModal, setPreviewModal] = useState(null); // { key, title }

  // Form states for Former personnel CRUD
  const [editingFormerId, setEditingFormerId] = useState(null);
  const [formerForm, setFormerForm] = useState({
    name_bn: '',
    name_en: '',
    designation: '',
    subject: '',
    tenure: '',
    education: '',
    retired_year: '',
    phone: '',
    photo_url: '',
    notes: ''
  });

  // Leadership live state for Head Teacher and Asst Head Teacher
  const [teachersList, setTeachersList] = useState(() => {
    try {
      const raw = localStorage.getItem('magra_db_teachers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return MOCK_TEACHERS;
  });

  // Leadership settings
  const [leadershipSettings, setLeadershipSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('magra_db_leadership_settings');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  // Current Head and Asst objects
  const headTeacher = teachersList.find(t => 
    t && (
      t.public_contact_role === 'head_teacher' || 
      (t.designation && t.designation.includes('প্রধান শিক্ষক') && !t.designation.includes('সহকারী')) ||
      t.id === 't-1' ||
      (t.name_bn && t.name_bn.includes('শফিকুল'))
    )
  ) || teachersList[0] || {};

  const asstTeacher = teachersList.find(t => 
    t && (
      t.public_contact_role === 'assistant_head_teacher' || 
      (t.designation && t.designation.includes('সহকারী প্রধান শিক্ষক')) ||
      t.id === 't-2' ||
      (t.name_bn && t.name_bn.includes('তাপসী'))
    )
  ) || teachersList[1] || {};

  // Head/Asst edit form
  const [leaderForm, setLeaderForm] = useState({
    name_bn: '',
    name_en: '',
    designation: '',
    subject: '',
    phone: '',
    email: '',
    first_joining_date: '',
    current_post_joining_date: '',
    mpo_index_no: '',
    educational_qualifications: '',
    photo_url: '',
    speech: ''
  });

  useEffect(() => {
    if (sub && sub !== activeTab) {
      setActiveTab(sub);
      setEditingFormerId(null);
    }
  }, [sub]);

  // Sync leader form when switching to head or assistant
  useEffect(() => {
    if (activeTab === 'head') {
      const speech = leadershipSettings.head?.speech || 
        (Array.isArray(getLeadershipData().map['public.nav.leadership.head']?.speech) 
          ? getLeadershipData().map['public.nav.leadership.head'].speech.join('\n\n')
          : getLeadershipData().map['public.nav.leadership.head']?.speech || '');
      setLeaderForm({
        name_bn: headTeacher.name_bn || 'মুহাম্মদ শফিকুল ইসলাম',
        name_en: headTeacher.name_en || 'MUHAMMAD SHAFIQUL ISLAM',
        designation: headTeacher.designation || 'প্রধান শিক্ষক',
        subject: headTeacher.subject || 'প্রশাসনিক',
        phone: headTeacher.phone || '01753539680',
        email: headTeacher.email || 'shafiht.mhs@gmail.com',
        first_joining_date: headTeacher.first_joining_date || '2002-05-01',
        current_post_joining_date: headTeacher.current_post_joining_date || '2014-06-26',
        mpo_index_no: headTeacher.mpo_index_no || 'N489587',
        educational_qualifications: headTeacher.educational_qualifications || 'এসএসসি, এইচএসসি, বিএসএস (সম্মান), এমএসএস (অর্থনীতি), বিএড',
        photo_url: headTeacher.photo_url || headTeacher.photo || '',
        speech: typeof speech === 'string' ? speech : ''
      });
    } else if (activeTab === 'assistant') {
      const speech = leadershipSettings.asst_head?.speech || 
        (Array.isArray(getLeadershipData().map['public.nav.leadership.asst_head']?.speech) 
          ? getLeadershipData().map['public.nav.leadership.asst_head'].speech.join('\n\n')
          : getLeadershipData().map['public.nav.leadership.asst_head']?.speech || '');
      setLeaderForm({
        name_bn: asstTeacher.name_bn || 'তাপসী সরকার',
        name_en: asstTeacher.name_en || 'TAPASI SARKER',
        designation: asstTeacher.designation || 'সহকারী প্রধান শিক্ষক',
        subject: asstTeacher.subject || 'সামাজিক বিজ্ঞান',
        phone: asstTeacher.phone || '01718-293847',
        email: asstTeacher.email || 'tapasi.teacher@gmail.com',
        first_joining_date: asstTeacher.first_joining_date || '2004-03-01',
        current_post_joining_date: asstTeacher.current_post_joining_date || '2016-08-15',
        mpo_index_no: asstTeacher.mpo_index_no || '1042730',
        educational_qualifications: asstTeacher.educational_qualifications || 'বি.এ (সম্মান), এম.এ (সমাজবিজ্ঞান), বি.এড',
        photo_url: asstTeacher.photo_url || asstTeacher.photo || '',
        speech: typeof speech === 'string' ? speech : ''
      });
    }
  }, [activeTab, headTeacher, asstTeacher, leadershipSettings]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (setSub) setSub(key);
    setEditingFormerId(null);
  };

  // Save Head / Assistant leader profile
  const handleSaveLeader = (e) => {
    e.preventDefault();
    const isHead = activeTab === 'head';
    const targetId = isHead ? headTeacher.id : asstTeacher.id;

    // 1. Update teachers list in localStorage
    const updatedTeachers = teachersList.map(t => {
      if (String(t.id) === String(targetId)) {
        return {
          ...t,
          name_bn: leaderForm.name_bn,
          name_en: leaderForm.name_en,
          designation: leaderForm.designation,
          subject: leaderForm.subject,
          phone: leaderForm.phone,
          email: leaderForm.email,
          first_joining_date: leaderForm.first_joining_date,
          current_post_joining_date: leaderForm.current_post_joining_date,
          mpo_index_no: leaderForm.mpo_index_no,
          educational_qualifications: leaderForm.educational_qualifications,
          photo_url: leaderForm.photo_url,
          photo: leaderForm.photo_url
        };
      }
      return t;
    });

    setTeachersList(updatedTeachers);
    try {
      localStorage.setItem('magra_db_teachers', JSON.stringify(updatedTeachers));
    } catch {}

    // 2. Update leadership settings speech
    const roleKey = isHead ? 'head' : 'asst_head';
    const updatedLeadership = {
      ...leadershipSettings,
      [roleKey]: {
        ...(leadershipSettings[roleKey] || {}),
        name: leaderForm.name_bn,
        title: leaderForm.designation,
        photo: leaderForm.photo_url || (isHead ? headTeacher.photo : asstTeacher.photo),
        speech: leaderForm.speech.split('\n\n').filter(Boolean)
      }
    };
    setLeadershipSettings(updatedLeadership);
    try {
      localStorage.setItem('magra_db_leadership_settings', JSON.stringify(updatedLeadership));
    } catch {}

    showToast(`✓ ${isHead ? 'প্রধান শিক্ষক' : 'সহকারী প্রধান শিক্ষক'} এর প্রোফাইল ও তথ্য সফলভাবে সংরক্ষিত হয়েছে!`);
  };

  // Former Personnel CRUD
  const handleSaveFormer = (e) => {
    e.preventDefault();
    if (!formerForm.name_bn.trim()) {
      alert('অনুগ্রহ করে নাম (বাংলা) প্রদান করুন।');
      return;
    }

    const categoryKey = activeTab; // 'former_heads', 'former_assistants', 'former_teachers', 'former_staff'
    const currentList = [...(formerData[categoryKey] || [])];

    if (editingFormerId) {
      const idx = currentList.findIndex(x => x.id === editingFormerId);
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          ...formerForm
        };
      }
    } else {
      const newId = `${categoryKey.slice(0, 2)}-${Date.now()}`;
      currentList.unshift({
        id: newId,
        ...formerForm
      });
    }

    const updatedData = {
      ...formerData,
      [categoryKey]: currentList
    };

    setFormerData(updatedData);
    saveStoredFormerPersonnelData(updatedData);
    setEditingFormerId(null);
    setFormerForm({
      name_bn: '',
      name_en: '',
      designation: '',
      subject: '',
      tenure: '',
      education: '',
      retired_year: '',
      phone: '',
      photo_url: '',
      notes: ''
    });
    showToast(`✓ তথ্য সফলভাবে সংরক্ষিত হয়েছে এবং ভিউ পেজে লাইভ আপডেট হয়েছে!`);
  };

  const handleEditFormer = (item) => {
    setEditingFormerId(item.id);
    setFormerForm({
      name_bn: item.name_bn || '',
      name_en: item.name_en || '',
      designation: item.designation || '',
      subject: item.subject || '',
      tenure: item.tenure || '',
      education: item.education || '',
      retired_year: item.retired_year || '',
      phone: item.phone || '',
      photo_url: item.photo_url || '',
      notes: item.notes || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteFormer = (id) => {
    if (!confirm('আপনি কি এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    const categoryKey = activeTab;
    const currentList = (formerData[categoryKey] || []).filter(x => x.id !== id);
    const updatedData = {
      ...formerData,
      [categoryKey]: currentList
    };
    setFormerData(updatedData);
    saveStoredFormerPersonnelData(updatedData);
    showToast('✓ রেকর্ডটি মুছে ফেলা হয়েছে।');
  };

  const handleResetFormerCategory = () => {
    if (!confirm(`আপনি কি এই ক্যাটাগরির তথ্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?`)) return;
    const categoryKey = activeTab;
    const updatedData = {
      ...formerData,
      [categoryKey]: JSON.parse(JSON.stringify(DEFAULT_FORMER_PERSONNEL[categoryKey]))
    };
    setFormerData(updatedData);
    saveStoredFormerPersonnelData(updatedData);
    showToast('✓ ক্যাটাগরি সফলভাবে ডিফল্ট অবস্থায় রিসেট করা হয়েছে।');
  };

  const tabsList = [
    { key: 'head', label: 'প্রধান শিক্ষক', icon: '🎓' },
    { key: 'assistant', label: 'সহকারী প্রধান শিক্ষক', icon: '📖' },
    { key: 'active_teachers', label: 'কর্মরত শিক্ষকবৃন্দ', icon: '👨‍🏫' },
    { key: 'active_staff', label: 'কর্মরত কর্মচারীবৃন্দ', icon: '🧑‍💼' },
    { key: 'former_heads', label: 'প্রাক্তন প্রধান শিক্ষকবৃন্দ', icon: '🏛️' },
    { key: 'former_assistants', label: 'প্রাক্তন সহকারী প্রধান শিক্ষকবৃন্দ', icon: '🏛️' },
    { key: 'former_teachers', label: 'প্রাক্তন শিক্ষকবৃন্দ', icon: '👨‍🏫' },
    { key: 'former_staff', label: 'প্রাক্তন কর্মচারীবৃন্দ', icon: '🧑‍💼' },
  ];

  const currentTabObj = tabsList.find(t => t.key === activeTab) || tabsList[0];

  return (
    <div className="staff-master-admin-panel" style={{ paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
        color: '#ffffff',
        padding: '20px 24px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(15,23,42,0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#6ee7b7', marginBottom: '8px' }}>
              <span>👨‍🏫 TEACHERS & STAFF MASTER MANAGEMENT • V118</span>
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px' }}>
              শিক্ষক ও কর্মচারীবৃন্দ ব্যবস্থাপনা প্যানেল
            </h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, maxWidth: '780px', lineHeight: 1.5 }}>
              ভিউ পেজের শিক্ষক ও কর্মচারী মেনুর ৮টি সাবমেনুর তথ্য ইনপুট, আপডেট ও লাইভ নিয়ন্ত্রণ।
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setPreviewModal({ key: `public.nav.staff.${activeTab}`, title: currentTabObj.label })}
              style={{
                background: '#059669',
                color: '#fff',
                fontWeight: 700,
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                boxShadow: '0 2px 6px rgba(5,150,105,0.3)'
              }}
            >
              👁️ ভিউ পেজে লাইভ প্রিভিউ দেখুন
            </button>
          </div>
        </div>
      </div>

      {/* 8 Sequential Submenu Navigation Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        background: '#ffffff',
        padding: '10px 12px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        {tabsList.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid #047857' : '1px solid transparent',
                background: isActive ? '#047857' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 6px rgba(4,120,87,0.25)' : 'none'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Head Teacher Management (প্রধান শিক্ষক) */}
      {activeTab === 'head' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Profile Overview Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #047857', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img 
                  src={leaderForm.photo_url || getTeacherPhoto(headTeacher)} 
                  alt={leaderForm.name_bn} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                  প্রতিষ্ঠান প্রধান
                </span>
                <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', color: '#0f172a' }}>{leaderForm.name_bn}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: 700 }}>{leaderForm.designation}</p>
                <small style={{ color: '#64748b' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • EIIN 114290</small>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>মোবাইল:</span>
                <b>{leaderForm.phone}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>ইমেইল:</span>
                <b>{leaderForm.email}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>১ম যোগদান:</span>
                <b>{leaderForm.first_joining_date}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>বর্তমান পদে যোগদান:</span>
                <b>{leaderForm.current_post_joining_date}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>MPO ইনডেক্স:</span>
                <b>{leaderForm.mpo_index_no}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>মূল বিষয়:</span>
                <b>{leaderForm.subject}</b>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                📜 শিক্ষাগত যোগ্যতা:
              </span>
              <p style={{ margin: 0, fontSize: '13px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', color: '#334155' }}>
                {leaderForm.educational_qualifications}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✏️ প্রধান শিক্ষকের তথ্য ও বাণী সম্পাদনা</span>
            </h3>

            <form onSubmit={handleSaveLeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>নাম (বাংলা) *</label>
                <input 
                  type="text" 
                  value={leaderForm.name_bn} 
                  onChange={e => setLeaderForm({ ...leaderForm, name_bn: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Name (English)</label>
                <input 
                  type="text" 
                  value={leaderForm.name_en} 
                  onChange={e => setLeaderForm({ ...leaderForm, name_en: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>মোবাইল নম্বর</label>
                <input 
                  type="text" 
                  value={leaderForm.phone} 
                  onChange={e => setLeaderForm({ ...leaderForm, phone: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ইমেইল</label>
                <input 
                  type="email" 
                  value={leaderForm.email} 
                  onChange={e => setLeaderForm({ ...leaderForm, email: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>বর্তমান পদে যোগদান</label>
                <input 
                  type="date" 
                  value={leaderForm.current_post_joining_date} 
                  onChange={e => setLeaderForm({ ...leaderForm, current_post_joining_date: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>MPO ইনডেক্স নম্বর</label>
                <input 
                  type="text" 
                  value={leaderForm.mpo_index_no} 
                  onChange={e => setLeaderForm({ ...leaderForm, mpo_index_no: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ছবি (URL অথবা Base64)</label>
                <input 
                  type="text" 
                  placeholder="https://... অথবা data:image/..." 
                  value={leaderForm.photo_url} 
                  onChange={e => setLeaderForm({ ...leaderForm, photo_url: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>শিক্ষাগত যোগ্যতা</label>
                <input 
                  type="text" 
                  value={leaderForm.educational_qualifications} 
                  onChange={e => setLeaderForm({ ...leaderForm, educational_qualifications: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>প্রধান শিক্ষকের বাণী / বক্তব্য</label>
                <textarea 
                  rows="4" 
                  value={leaderForm.speech} 
                  onChange={e => setLeaderForm({ ...leaderForm, speech: e.target.value })} 
                  placeholder="প্রধান শিক্ষকের শুভেচ্ছা বাণী লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ background: '#047857', color: '#fff', fontWeight: 700, padding: '10px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  ✓ প্রধান শিক্ষকের তথ্য সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Assistant Head Teacher Management (সহকারী প্রধান শিক্ষক) */}
      {activeTab === 'assistant' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Profile Overview Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #0d9488', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img 
                  src={leaderForm.photo_url || getTeacherPhoto(asstTeacher)} 
                  alt={leaderForm.name_bn} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px' }}>
                  সহকারী প্রতিষ্ঠান প্রধান
                </span>
                <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', color: '#0f172a' }}>{leaderForm.name_bn}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#0d9488', fontWeight: 700 }}>{leaderForm.designation}</p>
                <small style={{ color: '#64748b' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • EIIN 114290</small>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>মোবাইল:</span>
                <b>{leaderForm.phone}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>ইমেইল:</span>
                <b>{leaderForm.email}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>১ম যোগদান:</span>
                <b>{leaderForm.first_joining_date}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>বর্তমান পদে যোগদান:</span>
                <b>{leaderForm.current_post_joining_date}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>MPO ইনডেক্স:</span>
                <b>{leaderForm.mpo_index_no}</b>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b', display: 'block' }}>মূল বিষয়:</span>
                <b>{leaderForm.subject}</b>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                📜 শিক্ষাগত যোগ্যতা:
              </span>
              <p style={{ margin: 0, fontSize: '13px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', color: '#334155' }}>
                {leaderForm.educational_qualifications}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#0d9488', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✏️ সহকারী প্রধান শিক্ষকের তথ্য ও বার্তা সম্পাদনা</span>
            </h3>

            <form onSubmit={handleSaveLeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>নাম (বাংলা) *</label>
                <input 
                  type="text" 
                  value={leaderForm.name_bn} 
                  onChange={e => setLeaderForm({ ...leaderForm, name_bn: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Name (English)</label>
                <input 
                  type="text" 
                  value={leaderForm.name_en} 
                  onChange={e => setLeaderForm({ ...leaderForm, name_en: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>মোবাইল নম্বর</label>
                <input 
                  type="text" 
                  value={leaderForm.phone} 
                  onChange={e => setLeaderForm({ ...leaderForm, phone: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ইমেইল</label>
                <input 
                  type="email" 
                  value={leaderForm.email} 
                  onChange={e => setLeaderForm({ ...leaderForm, email: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>বর্তমান পদে যোগদান</label>
                <input 
                  type="date" 
                  value={leaderForm.current_post_joining_date} 
                  onChange={e => setLeaderForm({ ...leaderForm, current_post_joining_date: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>MPO ইনডেক্স নম্বর</label>
                <input 
                  type="text" 
                  value={leaderForm.mpo_index_no} 
                  onChange={e => setLeaderForm({ ...leaderForm, mpo_index_no: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ছবি (URL অথবা Base64)</label>
                <input 
                  type="text" 
                  placeholder="https://... অথবা data:image/..." 
                  value={leaderForm.photo_url} 
                  onChange={e => setLeaderForm({ ...leaderForm, photo_url: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>শিক্ষাগত যোগ্যতা</label>
                <input 
                  type="text" 
                  value={leaderForm.educational_qualifications} 
                  onChange={e => setLeaderForm({ ...leaderForm, educational_qualifications: e.target.value })} 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>সহকারী প্রধান শিক্ষকের একাডেমিক বার্তা</label>
                <textarea 
                  rows="4" 
                  value={leaderForm.speech} 
                  onChange={e => setLeaderForm({ ...leaderForm, speech: e.target.value })} 
                  placeholder="সহকারী প্রধান শিক্ষকের একাডেমিক বার্তা লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ background: '#0d9488', color: '#fff', fontWeight: 700, padding: '10px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  ✓ সহকারী প্রধান শিক্ষকের তথ্য সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Active Teachers (কর্মরত শিক্ষকবৃন্দ) */}
      {activeTab === 'active_teachers' && StaffPanelComponent && (
        <div>
          <StaffPanelComponent sub="teachers_list" />
        </div>
      )}

      {/* TAB 4: Active Staff (কর্মরত কর্মচারীবৃন্দ) */}
      {activeTab === 'active_staff' && StaffPanelComponent && (
        <div>
          <StaffPanelComponent sub="staff_list" />
        </div>
      )}

      {/* TABS 5, 6, 7, 8: Former Heads, Former Assistants, Former Teachers, Former Staff */}
      {['former_heads', 'former_assistants', 'former_teachers', 'former_staff'].includes(activeTab) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Data Input Form Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{editingFormerId ? '✏️ তথ্য সম্পাদনা' : '➕ নতুন এন্ট্রি ফরম'}</span>
                <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                  {currentTabObj.label}
                </span>
              </h3>
              {editingFormerId && (
                <button 
                  type="button" 
                  className="mini" 
                  onClick={() => {
                    setEditingFormerId(null);
                    setFormerForm({
                      name_bn: '',
                      name_en: '',
                      designation: '',
                      subject: '',
                      tenure: '',
                      education: '',
                      retired_year: '',
                      phone: '',
                      photo_url: '',
                      notes: ''
                    });
                  }}
                  style={{ background: '#64748b', color: '#fff' }}
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={handleSaveFormer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>নাম (বাংলা) *</label>
                <input 
                  type="text" 
                  value={formerForm.name_bn} 
                  onChange={e => setFormerForm({ ...formerForm, name_bn: e.target.value })} 
                  required 
                  placeholder="যেমন: বাবু নরেশ চন্দ্র বর্মন"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Name (English)</label>
                <input 
                  type="text" 
                  value={formerForm.name_en} 
                  onChange={e => setFormerForm({ ...formerForm, name_en: e.target.value })} 
                  placeholder="e.g. Naresh Chandra Barman"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>কার্যকাল / মেয়াদ *</label>
                <input 
                  type="text" 
                  value={formerForm.tenure} 
                  onChange={e => setFormerForm({ ...formerForm, tenure: e.target.value })} 
                  required
                  placeholder="যেমন: ১৯৮৯ – ২০০৫"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>পদবি</label>
                <input 
                  type="text" 
                  value={formerForm.designation} 
                  onChange={e => setFormerForm({ ...formerForm, designation: e.target.value })} 
                  placeholder={
                    activeTab === 'former_heads' ? 'প্রাক্তন প্রধান শিক্ষক' :
                    activeTab === 'former_assistants' ? 'প্রাক্তন সহকারী প্রধান শিক্ষক' :
                    activeTab === 'former_teachers' ? 'সিনিয়র শিক্ষক (অবসরপ্রাপ্ত)' : 'সাবেক অফিস সহকারী'
                  }
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {activeTab === 'former_teachers' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>মূল বিষয়</label>
                    <input 
                      type="text" 
                      value={formerForm.subject} 
                      onChange={e => setFormerForm({ ...formerForm, subject: e.target.value })} 
                      placeholder="যেমন: গণিত / ইংরেজি / বিজ্ঞান"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>অবসর সন</label>
                    <input 
                      type="text" 
                      value={formerForm.retired_year} 
                      onChange={e => setFormerForm({ ...formerForm, retired_year: e.target.value })} 
                      placeholder="যেমন: ২০১০"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </>
              )}

              <div style={{ gridColumn: activeTab === 'former_teachers' ? 'span 2' : 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>শিক্ষাগত যোগ্যতা</label>
                <input 
                  type="text" 
                  value={formerForm.education} 
                  onChange={e => setFormerForm({ ...formerForm, education: e.target.value })} 
                  placeholder="যেমন: এম.এ, বি.এড"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ছবি (URL অথবা Base64)</label>
                <input 
                  type="text" 
                  value={formerForm.photo_url} 
                  onChange={e => setFormerForm({ ...formerForm, photo_url: e.target.value })} 
                  placeholder="https://... অথবা data:image/..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>বিশেষ অবদান ও সংক্ষিপ্ত পরিচিতি</label>
                <textarea 
                  rows="3" 
                  value={formerForm.notes} 
                  onChange={e => setFormerForm({ ...formerForm, notes: e.target.value })} 
                  placeholder="বিদ্যালয়ে দায়িত্ব পালনকালীন বিশেষ অবদান বা স্মরণীয় ভূমিকা..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ background: '#047857', color: '#fff', fontWeight: 700, padding: '10px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  ✓ {editingFormerId ? 'তথ্য আপডেট করুন' : 'রেকর্ড সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Records Table and List Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{currentTabObj.label}</h3>
                <small style={{ color: '#64748b' }}>মোট তালিকাভুক্ত: {(formerData[activeTab] || []).length} জন</small>
              </div>
              <button 
                type="button" 
                className="mini" 
                onClick={handleResetFormerCategory}
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
              >
                ↻ ডিফল্ট রিসেট
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
              {(formerData[activeTab] || []).map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#e2e8f0',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    border: '2px solid #047857'
                  }}>
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>{currentTabObj.icon}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{item.name_bn}</h4>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>
                        📅 {item.tenure}
                      </span>
                    </div>

                    <p style={{ margin: '3px 0 2px 0', fontSize: '12.5px', color: '#047857', fontWeight: 600 }}>
                      {item.designation || currentTabObj.label}
                      {item.subject ? ` • বিষয়: ${item.subject}` : ''}
                    </p>

                    {item.education && (
                      <small style={{ display: 'block', color: '#475569', fontSize: '12px' }}>
                        🎓 {item.education}
                      </small>
                    )}

                    {item.notes && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        {item.notes}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button 
                        type="button" 
                        className="mini" 
                        onClick={() => handleEditFormer(item)}
                        style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ✏️ সম্পাদনা
                      </button>
                      <button 
                        type="button" 
                        className="mini" 
                        onClick={() => handleDeleteFormer(item.id)}
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        🗑️ মুছুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!formerData[activeTab] || formerData[activeTab].length === 0) && (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>কোনো তথ্য পাওয়া যায়নি। বামপাশের ফর্ম থেকে নতুন তথ্য যোগ করুন।</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewModal && (
        <SubmenuDetailModal
          menuKey={previewModal.key}
          title={previewModal.title}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
}
