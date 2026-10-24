import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_USERS, MOCK_TEACHERS, getTeacherPhoto } from './mockData';
import { deduplicateTeachers } from './apiClient';

export function getSchoolTeachers() {
  try {
    const raw = localStorage.getItem('magra_db_teachers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = deduplicateTeachers(parsed);
        if (cleaned.length !== parsed.length) {
          try { localStorage.setItem('magra_db_teachers', JSON.stringify(cleaned)); } catch (e) {}
        }
        return cleaned;
      }
    }
  } catch (e) {}
  return MOCK_TEACHERS;
}

export function isAssignedRoleTeacher(t) {
  if (!t) return false;
  const name = String(t.name_bn || t.name_en || '').toLowerCase();
  const desig = String(t.designation || '').toLowerCase();
  const subj = String(t.subject || '').toLowerCase();

  // 1. প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষক
  if (desig.includes('প্রধান শিক্ষক') || name.includes('শফিকুল') || name.includes('তাপসী')) return true;

  // 2. ৫ জন শ্রেণি শিক্ষক (৬ষ্ঠ: খালেক, ৭ম: রহিম/লিটন, ৮ম: আবুবকর, ৯ম: হাবিবুর, ১০ম: ওয়াহিদুর)
  if (name.includes('খালেক') || name.includes('লিটন') || (name.includes('আব্দুর রহিম') && !name.includes('খালিদুর')) || name.includes('আবুবকর') || name.includes('হাবিবুর') || name.includes('ওয়াহিদুর') || name.includes('ওয়াহিদুর')) return true;

  // 3. গ্রন্থাগারিক (মোঃ শাহিন মিয়া)
  if (desig.includes('গ্রন্থাগার') || subj.includes('গ্রন্থাগার') || name.includes('শাহিন')) return true;

  return false;
}

export function getCoAdminClasses() {
  const defaults = {
    '6': { key: '6', name: '৬ষ্ঠ শ্রেণি', en: 'Class 6', teacher_name: 'মোঃ আব্দুল খালেক', designation: 'সহকারী শিক্ষক', subject: 'বাংলা', phone: '01735175681' },
    '7': { key: '7', name: '৭ম শ্রেণি', en: 'Class 7', teacher_name: 'মুহাম্মদ আব্দুর রহিম লিটন', designation: 'সিনিয়র শিক্ষক', subject: 'জীববিজ্ঞান', phone: '01712004657' },
    '8': { key: '8', name: '৮ম শ্রেণি', en: 'Class 8', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', designation: 'সিনিয়র শিক্ষক (আইসিটি)', subject: 'আইসিটি', phone: '01710688646' },
    '9': { key: '9', name: '৯ম শ্রেণি', en: 'Class 9', teacher_name: 'মোঃ হাবিবুর রহমান', designation: 'সিনিয়র শিক্ষক', subject: 'গণিত ও বিজ্ঞান', phone: '01728046188' },
    '10': { key: '10', name: '১০ম শ্রেণি', en: 'Class 10', teacher_name: 'মোঃ ওয়াহিদুর রহমান', designation: 'সহকারী শিক্ষক', subject: 'শারীরিক শিক্ষা', phone: '01703538300' }
  };

  try {
    const raw = localStorage.getItem('magra_class_teachers_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      ['6', '7', '8', '9', '10'].forEach(k => {
        if (parsed[k]) {
          defaults[k] = {
            ...defaults[k],
            teacher_name: parsed[k].teacher_name || defaults[k].teacher_name,
            designation: parsed[k].designation || defaults[k].designation,
            subject: parsed[k].subject || defaults[k].subject,
            phone: parsed[k].phone || defaults[k].phone
          };
        }
      });
    }
  } catch (e) {}

  return Object.values(defaults);
}

export function ObserverSwitcher() {
  const [collapsed, setCollapsed] = useState(false);
  const [showCoAdminModal, setShowCoAdminModal] = useState(false);
  const [showSubjectTeacherModal, setShowSubjectTeacherModal] = useState(false);
  const [subjectTeacherTab, setSubjectTeacherTab] = useState('remaining'); // 'remaining' | 'all'
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('magra_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem('magra_user');
        setCurrentUser(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    window.addEventListener('magra_auth_change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('magra_auth_change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const coAdminClasses = getCoAdminClasses();
  const teachersList = getSchoolTeachers();
  const remainingSubjectTeachers = useMemo(() => teachersList.filter(t => !isAssignedRoleTeacher(t)), [teachersList]);

  const handleRoleSwitch = (roleKey) => {
    if (roleKey === 'public') {
      navigate('/');
      return;
    }
    if (roleKey === 'login') {
      navigate('/login');
      return;
    }

    let matchedUser = null;
    let defTab = 'dashboard';
    let defSub = null;

    if (roleKey === 'super_admin' || roleKey === 'admin') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'super_admin') || MOCK_USERS[0];
      defTab = 'dashboard';
    } else if (roleKey === 'head_teacher') {
      matchedUser = MOCK_USERS.find(u => u.login_id === 'head_teacher' || u.username === 'head_teacher') || MOCK_USERS[1];
      defTab = 'dashboard';
    } else if (roleKey === 'asst_head_teacher') {
      matchedUser = MOCK_USERS.find(u => u.login_id === 'assistant_head_teacher' || u.username === 'assistant_head_teacher') || MOCK_USERS[2];
      defTab = 'dashboard';
    } else if (roleKey === 'librarian') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'librarian');
      defTab = 'library';
      defSub = 'catalog';
    } else if (roleKey === 'staff' || roleKey === 'office') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'staff');
      defTab = 'office';
      defSub = 'fees';
    } else if (roleKey === 'teacher') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'teacher');
      defTab = 'results';
      defSub = 'marks';
    } else {
      matchedUser = MOCK_USERS.find(u => u.role_name === roleKey) || MOCK_USERS[0];
      defTab = 'dashboard';
    }

    localStorage.setItem('magra_token', 'demo-token-' + Date.now());
    localStorage.setItem('magra_user', JSON.stringify(matchedUser));
    localStorage.setItem('magra_admin_active_tab', defTab);
    if (defSub) localStorage.setItem('magra_admin_active_sub', defSub);
    else localStorage.removeItem('magra_admin_active_sub');

    window.dispatchEvent(new Event('magra_auth_change'));
    navigate('/admin');
  };

  const handleSelectClassTeacher = (cls) => {
    const matchedUser = {
      id: `u-class-${cls.key}`,
      login_id: `class${cls.key}_teacher`,
      full_name: `${cls.teacher_name} (${cls.name} শ্রেণি শিক্ষক)`,
      role_name: 'co_admin',
      role_label: `কো-অ্যাডমিন (${cls.name} শ্রেণি শিক্ষক)`,
      assigned_class: cls.key,
      teacher_name: cls.teacher_name,
      phone: cls.phone,
      is_active: true
    };

    localStorage.setItem('magra_token', 'demo-token-' + Date.now());
    localStorage.setItem('magra_user', JSON.stringify(matchedUser));
    localStorage.setItem('magra_admin_active_tab', 'attendance');
    localStorage.setItem('magra_admin_active_sub', 'daily');

    setShowCoAdminModal(false);
    window.dispatchEvent(new Event('magra_auth_change'));
    navigate('/admin');
  };

  const handleSelectSubjectTeacher = (t) => {
    const matchedUser = {
      id: `u-teacher-${t.employee_id || t.id}`,
      login_id: `teacher_${t.employee_id || t.id}`,
      full_name: `${t.name_bn} (${t.subject || 'বিষয় শিক্ষক'})`,
      role_name: 'teacher',
      role_label: `বিষয় শিক্ষক (${t.subject || 'সহকারী শিক্ষক'})`,
      employee_id: t.employee_id || t.id,
      teacher_name: t.name_bn,
      subject: t.subject,
      phone: t.phone,
      is_active: true
    };

    localStorage.setItem('magra_token', 'demo-token-' + Date.now());
    localStorage.setItem('magra_user', JSON.stringify(matchedUser));
    localStorage.setItem('magra_admin_active_tab', 'results');
    localStorage.setItem('magra_admin_active_sub', 'marks');

    setShowSubjectTeacherModal(false);
    window.dispatchEvent(new Event('magra_auth_change'));
    navigate('/admin');
  };

  return (
    <>
      <aside className={'demo-observer-bar ' + (collapsed ? 'collapsed' : '')} aria-label="সফটওয়্যার পর্যবেক্ষণ ও ভূমিকা পরিবর্তন">
        <div className="observer-bar-inner">
          <div className="observer-badge">
            <span className="live-dot"></span>
            <b>পর্যবেক্ষণ ও রোল সুইচ প্যানেল</b>
            {currentUser && currentPath !== '/' && currentPath !== '/login' && (
              <span className="current-role-tag">সক্রিয়: {currentUser.role_label || currentUser.role_name}</span>
            )}
          </div>

          {!collapsed && (
            <div className="observer-roles-list">
              <button
                type="button"
                className={'observer-btn ' + (currentPath === '/' ? 'active' : '')}
                onClick={() => handleRoleSwitch('public')}
                title="ওয়েবসাইটের মূল ভিউ পেজ ও মেন্যু-সাবমেন্যু পর্যবেক্ষণ"
              >
                🌐 পাবলিক ভিউ পেজ
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentPath === '/admin' && currentUser?.role_name === 'super_admin' ? 'active' : '')}
                onClick={() => handleRoleSwitch('admin')}
                title="আইসিটি শিক্ষক ও সুপার অ্যাডমিন: পূর্ণ সিস্টেম নিয়ন্ত্রণ ও ফিচার কন্ট্রোল"
              >
                👑 সুপার অ্যাডমিন ERP
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentPath === '/admin' && (currentUser?.login_id === 'head_teacher' || currentUser?.username === 'head_teacher') ? 'active' : '')}
                onClick={() => handleRoleSwitch('head_teacher')}
                title="মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক): একাডেমিক তদারকি, ভর্তি অনুমোদন ও পূর্ণ রিপোর্ট"
              >
                🎓 প্রধান শিক্ষক
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentPath === '/admin' && (currentUser?.login_id === 'assistant_head_teacher' || currentUser?.username === 'assistant_head_teacher') ? 'active' : '')}
                onClick={() => handleRoleSwitch('asst_head_teacher')}
                title="তাপসী সরকার (সহকারী প্রধান শিক্ষক): রুটিন, উপস্থিতি ও একাডেমিক তদারকি"
              >
                👩‍🏫 সহকারী প্রধান শিক্ষক
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentUser?.role_name === 'co_admin' ? 'active' : '')}
                onClick={() => setShowCoAdminModal(true)}
                style={{ background: currentUser?.role_name === 'co_admin' ? '#047857' : undefined, fontWeight: 700 }}
                title="৬ষ্ঠ, ৭ম, ৮ম, ৯ম ও ১০ম শ্রেণির ৫ জন শ্রেণি শিক্ষকের কো-অ্যাডমিন রোল স্ক্রিন খুলুন"
              >
                👥 কো-অ্যাডমিন (শ্রেণি শিক্ষক) ▾
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentUser?.role_name === 'teacher' ? 'active' : '')}
                onClick={() => setShowSubjectTeacherModal(true)}
                style={{ background: currentUser?.role_name === 'teacher' ? '#0284c7' : undefined, fontWeight: 700 }}
                title="বিদ্যালয়ের শিক্ষক তালিকায় থাকা বাকি বিষয় শিক্ষকদের মধ্য থেকে শিক্ষক নির্বাচন করে সরাসরি বিষয় নম্বর এন্ট্রি করুন"
              >
                📖 বিষয় শিক্ষক ▾
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentUser?.role_name === 'librarian' ? 'active' : '')}
                onClick={() => handleRoleSwitch('librarian')}
                title="মোঃ শাহিন মিয়া: সহকারী শিক্ষক (গ্রন্থাগার ও বিষয় শিক্ষক) - লাইব্রেরি ব্যবস্থাপনা ও বিষয় নম্বর এন্ট্রি"
              >
                📚 গ্রন্থাগার ও বিষয় শিক্ষক
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentUser?.role_name === 'staff' ? 'active' : '')}
                onClick={() => handleRoleSwitch('staff')}
                title="মোঃ আলমগীর হোসেন: ক্যাশ কাউন্টার ফি আদায়, সনদ ও রেজিস্টার"
              >
                🏢 অফিস সহকারী
              </button>

              <button
                type="button"
                className={'observer-btn ' + (currentPath === '/login' ? 'active' : '')}
                onClick={() => handleRoleSwitch('login')}
                title="লগইন স্ক্রিন ও ডেমো আইডি অপশন"
              >
                🔐 লগইন স্ক্রিন
              </button>
            </div>
          )}

          <button
            type="button"
            className="observer-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'প্যানেল খুলুন' : 'প্যানেল সংক্ষেপ করুন'}
          >
            {collapsed ? '👀 সুইচ প্যানেল খুলুন ▾' : '▴ সংক্ষেপ'}
          </button>
        </div>
      </aside>

      {/* Co-Admin Class Teacher Selection Modal */}
      {showCoAdminModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCoAdminModal(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 70%, #0f766e 100%)',
                color: '#ffffff',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>👨‍🏫</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                    কো-অ্যাডমিন (শ্রেণি শিক্ষক) রোল স্ক্রিন
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', opacity: 0.95 }}>
                    দায়িত্বপ্রাপ্ত শ্রেণি নির্বাচন করুন। নির্বাচিত শ্রেণির শ্রেণি শিক্ষক সরাসরি কো-অ্যাডমিন হিসেবে প্রবেশ করবেন:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCoAdminModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
                  gap: '16px'
                }}
              >
                {coAdminClasses.map((cls) => {
                  const isCurrent = currentUser?.role_name === 'co_admin' && (String(currentUser?.assigned_class) === String(cls.key) || currentUser?.assigned_class === cls.name);
                  return (
                    <div
                      key={cls.key}
                      onClick={() => handleSelectClassTeacher(cls)}
                      style={{
                        border: isCurrent ? '2px solid #047857' : '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '16px',
                        background: isCurrent ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: isCurrent ? '0 4px 12px rgba(4,120,87,0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#047857';
                        e.currentTarget.style.background = '#f0fdf4';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(4,120,87,0.18)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isCurrent ? '#047857' : '#cbd5e1';
                        e.currentTarget.style.background = isCurrent ? '#f0fdf4' : '#f8fafc';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = isCurrent ? '0 4px 12px rgba(4,120,87,0.15)' : '0 2px 4px rgba(0,0,0,0.03)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                            🎓 {cls.name} <small style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>({cls.en})</small>
                          </span>
                          <span
                            style={{
                              background: isCurrent ? '#047857' : '#e2e8f0',
                              color: isCurrent ? '#ffffff' : '#334155',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            {isCurrent ? '✓ বর্তমানে সক্রিয়' : 'কো-অ্যাডমিন'}
                          </span>
                        </div>

                        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 12px', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ color: '#64748b' }}>শ্রেণি শিক্ষক:</span>
                            <b style={{ color: '#064e3b', fontSize: '13.5px' }}>{cls.teacher_name}</b>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ color: '#64748b' }}>পদবী ও বিষয়:</span>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {cls.designation} {cls.subject ? `(${cls.subject})` : ''}
                            </span>
                          </div>
                          {cls.phone && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>মোবাইল:</span>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{cls.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{
                          background: isCurrent ? '#047857' : '#0f766e',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        👉 {cls.name} কো-অ্যাডমিন হিসেবে প্রবেশ করুন
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Informative Note */}
              <div
                style={{
                  marginTop: '18px',
                  padding: '12px 16px',
                  background: '#f0fdf4',
                  borderRadius: '10px',
                  border: '1px solid #86efac',
                  fontSize: '12px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '18px' }}>🛡️</span>
                <span>
                  <b>তথ্যসূত্র:</b> সুপার অ্যাডমিন প্যানেলের <b>'শ্রেণি শিক্ষক নির্ধারণ ও দায়িত্ব বণ্টন'</b> স্ক্রীনে সংরক্ষিত তথ্য অনুযায়ী শ্রেণি শিক্ষকগণ তাদের নিজ নিজ শ্রেণির উপস্থিতি, ক্লাসে অন্তর্ভুক্তি, শ্রেণি ফি আদায় ও ফলাফল স্ক্রুটিনি পরিচালনা করবেন।
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Teacher Modal */}
      {showSubjectTeacherModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 999999,
            display: 'grid',
            placeItems: 'center',
            padding: '20px'
          }}
          onClick={() => setShowSubjectTeacherModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #cbd5e1',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 10px rgba(2,132,199,0.3)'
                }}>
                  📖
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    বিদ্যালয়ের বিষয় শিক্ষক নির্বাচন (বিষয় নম্বর এন্ট্রি)
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    বিদ্যালয়ের ১৫ জন শিক্ষকের মধ্য হতে বাকি বিষয় শিক্ষক অথবা যেকোনো শিক্ষক নির্বাচন করে সরাসরি বিষয় নম্বর এন্ট্রি করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectTeacherModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#475569',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setSubjectTeacherTab('remaining')}
                style={{
                  background: subjectTeacherTab === 'remaining' ? '#0284c7' : '#f1f5f9',
                  color: subjectTeacherTab === 'remaining' ? '#ffffff' : '#334155',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>⭐</span> বাকী বিষয় শিক্ষকবৃন্দ ({remainingSubjectTeachers.length} জন)
              </button>
              <button
                type="button"
                onClick={() => setSubjectTeacherTab('all')}
                style={{
                  background: subjectTeacherTab === 'all' ? '#0284c7' : '#f1f5f9',
                  color: subjectTeacherTab === 'all' ? '#ffffff' : '#334155',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>👥</span> বিদ্যালয়ের সকল শিক্ষক ({teachersList.length} জন)
              </button>
            </div>

            {/* Teacher Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              {(subjectTeacherTab === 'remaining' ? remainingSubjectTeachers : teachersList).map((t, idx) => {
                const isCurrent = currentUser?.role_name === 'teacher' && (currentUser?.teacher_name === t.name_bn || currentUser?.full_name?.includes(t.name_bn));
                return (
                  <div
                    key={t.id || t.employee_id || idx}
                    onClick={() => handleSelectSubjectTeacher(t)}
                    style={{
                      border: isCurrent ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '14px',
                      background: isCurrent ? '#f0f9ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                      boxShadow: isCurrent ? '0 4px 12px rgba(2,132,199,0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.background = '#f0f9ff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(2,132,199,0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isCurrent ? '#0284c7' : '#cbd5e1';
                      e.currentTarget.style.background = isCurrent ? '#f0f9ff' : '#f8fafc';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isCurrent ? '0 4px 12px rgba(2,132,199,0.15)' : '0 2px 4px rgba(0,0,0,0.03)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          আইডি #{t.employee_id || idx + 1}
                        </span>
                        <span style={{
                          background: isCurrent ? '#0284c7' : '#e2e8f0',
                          color: isCurrent ? '#ffffff' : '#475569',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {isCurrent ? '✓ সক্রিয়' : 'বিষয় শিক্ষক'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <img 
                          src={t.photo_url || getTeacherPhoto(t)} 
                          alt={t.name_bn}
                          style={{
                            width: '44px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.name_bn}
                          </div>
                          {t.name_en && (
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, letterSpacing: '0.4px', marginTop: '2px' }}>
                              {t.name_en}
                            </div>
                          )}
                          <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                            {t.designation || 'সহকারী শিক্ষক'}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 10px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ color: '#64748b' }}>পাঠদান বিষয়:</span>
                          <b style={{ color: '#0369a1' }}>{t.subject || 'সাধারণ'}</b>
                        </div>
                        {t.phone && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>মোবাইল:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>{t.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        background: isCurrent ? '#0284c7' : '#0369a1',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      📈 বিষয় নম্বর এন্ট্রি করুন ➔
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div style={{
              marginTop: '18px',
              padding: '12px 16px',
              background: '#f0fdf4',
              borderRadius: '10px',
              border: '1px solid #86efac',
              fontSize: '12px',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '18px' }}>ℹ️</span>
              <span>
                <b>নির্দেশনা:</b> যে কোনো বিষয় শিক্ষকে ক্লিক করলে তিনি সরাসরি তার পাঠদান বিষয়ের পরীক্ষা নম্বর এন্ট্রি ডেস্কে প্রবেশ করবেন এবং ৬ষ্ঠ থেকে ১০ম শ্রেণির যে কোনো পরীক্ষা ও সেকশনে নম্বর ইনপুট দিতে পারবেন।
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
