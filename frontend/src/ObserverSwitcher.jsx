import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_USERS } from './mockData';

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
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const rawUser = localStorage.getItem('magra_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const coAdminClasses = getCoAdminClasses();

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
    if (roleKey === 'super_admin' || roleKey === 'admin') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'super_admin') || MOCK_USERS[0];
    } else if (roleKey === 'head_teacher') {
      matchedUser = MOCK_USERS.find(u => u.login_id === 'head_teacher' || u.username === 'head_teacher') || MOCK_USERS[1];
    } else if (roleKey === 'asst_head_teacher') {
      matchedUser = MOCK_USERS.find(u => u.login_id === 'assistant_head_teacher' || u.username === 'assistant_head_teacher') || MOCK_USERS[2];
    } else if (roleKey === 'librarian') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'librarian');
      localStorage.setItem('magra_admin_active_tab', 'library');
      localStorage.setItem('magra_admin_active_sub', 'catalog');
    } else if (roleKey === 'staff' || roleKey === 'office') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'staff');
    } else if (roleKey === 'teacher') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'teacher');
    } else {
      matchedUser = MOCK_USERS.find(u => u.role_name === roleKey) || MOCK_USERS[0];
    }

    localStorage.setItem('magra_token', 'demo-token-' + Date.now());
    localStorage.setItem('magra_user', JSON.stringify(matchedUser));

    if (matchedUser.role_name === 'teacher') {
      navigate('/portal');
    } else {
      navigate('/admin');
    }
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
    </>
  );
}
