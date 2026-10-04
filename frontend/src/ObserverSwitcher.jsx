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

    const matchedUser = MOCK_USERS.find(u =>
      u.role_name === roleKey ||
      (roleKey === 'student' && u.role_name === 'student') ||
      (roleKey === 'teacher' && u.role_name === 'teacher') ||
      (roleKey === 'admin' && u.role_name === 'super_admin')
    ) || MOCK_USERS[0];

    localStorage.setItem('magra_token', 'demo-token-' + Date.now());
    localStorage.setItem('magra_user', JSON.stringify(matchedUser));

    if (['student', 'guardian', 'teacher', 'head_teacher', 'assistant_head_teacher'].includes(matchedUser.role_name)) {
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
              className={'observer-btn ' + (currentPath === '/admin' && (currentUser?.role_name === 'super_admin' || currentUser?.role_name === 'admin') ? 'active' : '')}
              onClick={() => handleRoleSwitch('admin')}
              title="সকল মডিউল, সেটিংস ও ফিচার কন্ট্রোল"
            >
              👑 সুপার অ্যাডমিন ERP
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/portal' && currentUser?.role_name === 'head_teacher' ? 'active' : '')}
              onClick={() => handleRoleSwitch('head_teacher')}
              title="একাডেমিক তদারকি ও রিপোর্ট"
            >
              🎓 প্রধান শিক্ষক
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/portal' && currentUser?.role_name === 'teacher' ? 'active' : '')}
              onClick={() => handleRoleSwitch('teacher')}
              title="মার্ক এন্ট্রি, উপস্থিতি ও ক্লাস রুটিন"
            >
              👨‍🏫 সহকারী শিক্ষক
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/portal' && currentUser?.role_name === 'student' ? 'active' : '')}
              onClick={() => handleRoleSwitch('student')}
              title="ফলাফল, উপস্থিতি, AI Tutor ও রুটিন"
            >
              🧑‍🎓 শিক্ষার্থী পোর্টাল
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/portal' && currentUser?.role_name === 'guardian' ? 'active' : '')}
              onClick={() => handleRoleSwitch('guardian')}
              title="সন্তানের উপস্থিতি, ফি ও প্রগ্রেস"
            >
              👨‍👩‍👧 অভিভাবক পোর্টাল
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/admin' && currentUser?.role_name === 'accountant' ? 'active' : '')}
              onClick={() => handleRoleSwitch('accountant')}
              title="ফি আদায় ও আয়-ব্যয়"
            >
              💰 হিসাবরক্ষক
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/admin' && currentUser?.role_name === 'librarian' ? 'active' : '')}
              onClick={() => handleRoleSwitch('librarian')}
              title="বই ইস্যু ও লাইব্রেরি"
            >
              📚 গ্রন্থাগারিক
            </button>

            <button
              type="button"
              className={'observer-btn ' + (currentPath === '/login' ? 'active' : '')}
              onClick={() => handleRoleSwitch('login')}
              title="লগইন স্ক্রিন ও অপশনসমূহ"
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
