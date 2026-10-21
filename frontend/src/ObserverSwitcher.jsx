import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_USERS } from './mockData';

export function ObserverSwitcher() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const rawUser = localStorage.getItem('magra_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

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
      matchedUser = MOCK_USERS.find(u => u.username === 'head_teacher') || MOCK_USERS[1];
    } else if (roleKey === 'asst_head_teacher') {
      matchedUser = MOCK_USERS.find(u => u.username === 'assistant_head_teacher') || MOCK_USERS[2];
    } else if (roleKey === 'co_admin') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'co_admin' && u.assigned_class === '৮ম') || MOCK_USERS.find(u => u.role_name === 'co_admin');
    } else if (roleKey === 'teacher') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'teacher');
    } else if (roleKey === 'librarian') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'librarian');
    } else if (roleKey === 'staff' || roleKey === 'office') {
      matchedUser = MOCK_USERS.find(u => u.role_name === 'staff');
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

  return (
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
              className={'observer-btn ' + (currentPath === '/admin' && currentUser?.role_name === 'admin' ? 'active' : '')}
              onClick={() => handleRoleSwitch('head_teacher')}
              title="প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষক: একাডেমিক তদারকি, ভর্তি অনুমোদন ও পূর্ণ রিপোর্ট"
            >
              🎓 প্রধান শিক্ষক (অ্যাডমিন)
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentUser?.role_name === 'co_admin' ? 'active' : '')}
              onClick={() => handleRoleSwitch('co_admin')}
              title="শ্রেণি শিক্ষক (কো-অ্যাডমিন): উপস্থিতি, ক্লাসে ভর্তি, ফি আদায় ও ফলাফল স্ক্রুটিনি"
            >
              👥 কো-অ্যাডমিন (শ্রেণি শিক্ষক)
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentUser?.role_name === 'teacher' ? 'active' : '')}
              onClick={() => handleRoleSwitch('teacher')}
              title="বিষয় শিক্ষক: পরীক্ষার বিষয়ভিত্তিক নম্বর এন্ট্রি ও রুটিন"
            >
              📝 বিষয় শিক্ষক (নম্বর এন্ট্রি)
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentUser?.role_name === 'librarian' ? 'active' : '')}
              onClick={() => handleRoleSwitch('librarian')}
              title="গ্রন্থাগার: ক্যাটালগ, বই ইস্যু-জমা, নষ্ট বই ও মাসিক রিপোর্ট"
            >
              📚 গ্রন্থাগার
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentUser?.role_name === 'staff' ? 'active' : '')}
              onClick={() => handleRoleSwitch('staff')}
              title="অফিস সহকারী: ভর্তি, ক্যাশ কাউন্টার ফি আদায়, সনদ/টিসি/আইডি প্রিন্ট ও রেজিস্টার"
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
  );
}
