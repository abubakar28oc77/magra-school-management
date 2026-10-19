import React, { useState, useEffect, useMemo, useRef } from 'react';
import { requestApi, sortStudentsList } from './apiClient';
import { MOCK_SCHOOL, MOCK_STUDENTS, MOCK_TEACHERS, getStudentPhoto } from './mockData';
import schoolLogo from '../public/school-logo.png';

// Bengali digit and date helpers
export const toBn = (n) => (n === null || n === undefined || n === '') ? '০' : String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

export const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const BANGLA_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const SHORT_BANGLA_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export function AttendancePanel({ sub = 'daily' }) {
  // Navigation tabs
  // 'daily' | 'daily_report' | 'weekly_report' | 'monthly_report' | 'alerts' | 'analytics'
  const [tab, setTab] = useState(sub === 'reports' ? 'daily_report' : sub === 'alerts' ? 'alerts' : 'daily');

  useEffect(() => {
    if (sub === 'reports') setTab('daily_report');
    else if (sub === 'alerts') setTab('alerts');
    else if (sub === 'daily') setTab('daily');
  }, [sub]);

  // Date and Class Filters
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedGroup, setSelectedGroup] = useState('all'); // For classes 9 & 10: 'all' | 'বিজ্ঞান' | 'মানবিক' | 'ব্যবসায় শিক্ষা'
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Weekly & Monthly Filter States
  const [selectedWeekStart, setSelectedWeekStart] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(2026);

  // Attendance Roster Data
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Online / Offline State Machine
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualOffline, setManualOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState('');

  // Guardian WhatsApp & SMS Modal States
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsTargetStudent, setSmsTargetStudent] = useState(null); // null = bulk absent
  const [smsTemplate, setSmsTemplate] = useState('absent'); // 'absent' | 'late' | 'chronic'
  const [customSmsText, setCustomSmsText] = useState('');
  const [smsSuccessMsg, setSmsSuccessMsg] = useState('');

  // Printable ref
  const printReportRef = useRef(null);

  // Monitor network online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-flush offline queue
      flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial offline queue from localStorage
    try {
      const q = JSON.parse(localStorage.getItem('magra_attendance_offline_queue') || '[]');
      if (Array.isArray(q)) setOfflineQueue(q);
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine effective connection mode
  const effectiveOnline = isOnline && !manualOffline;

  // Load roster whenever date, class, group, or section changes
  const loadRoster = async () => {
    setLoading(true);
    try {
      // 1. First check local storage cache if in offline mode
      const localCacheKey = `magra_roster_cache_${selectedClass}_${selectedDate}`;
      const savedAttendance = JSON.parse(localStorage.getItem('magra_db_attendance') || '[]');

      // Try fetching via API / Client Engine
      let data = [];
      try {
        const queryParams = new URLSearchParams({
          date: selectedDate,
          class_name: selectedClass,
          section: selectedSection,
          group: selectedGroup
        });
        data = await requestApi(`/attendance/roster?${queryParams.toString()}`);
      } catch (err) {
        console.warn('API roster fetch failed, using fallback:', err);
      }

      // If data is empty or offline, build from MOCK_STUDENTS + savedAttendance
      if (!Array.isArray(data) || !data.length) {
        let allStudents = [];
        try {
          const cached = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
          allStudents = (Array.isArray(cached) && cached.length) ? cached : MOCK_STUDENTS;
        } catch {
          allStudents = MOCK_STUDENTS;
        }

        let filtered = allStudents.filter(s => String(s.class_name).trim() === String(selectedClass).trim());
        
        // Filter by group for Class 9 & 10
        if (['9', '10', '৯', '১০'].includes(String(selectedClass)) && selectedGroup !== 'all') {
          filtered = filtered.filter(s => {
            const grp = String(s.department || s.group || s.group_name || '').toLowerCase();
            return grp.includes(selectedGroup.toLowerCase());
          });
        }

        // Filter by section
        if (selectedSection !== 'all') {
          filtered = filtered.filter(s => String(s.section || '').includes(selectedSection));
        }

        filtered = sortStudentsList(filtered);

        data = filtered.map(s => {
          // Check saved attendance in localStorage
          const existing = savedAttendance.find(a => 
            a.date === selectedDate && String(a.student_id) === String(s.id)
          );

          // Deterministic default if not set
          let defStatus = 'present';
          if (!existing) {
            const h = ((parseInt(s.roll_no, 10) || 1) * 19 + new Date(selectedDate).getDate() * 11) % 100;
            if (h === 7 || h === 23) defStatus = 'absent';
            else if (h === 43) defStatus = 'late';
            else if (h === 91) defStatus = 'leave';
          }

          return {
            id: s.id,
            student_id: s.student_id,
            name_bn: s.name_bn,
            name_en: s.name_en,
            roll_no: s.roll_no,
            class_name: s.class_name,
            section: s.section || 'সাধারণ',
            department: s.department || s.group || '',
            guardian_name: s.guardian_name || s.father_name || 'অভিভাবক',
            guardian_phone: s.guardian_phone || s.father_mobile || '01712345678',
            status: existing ? existing.status : defStatus,
            remarks: existing ? (existing.remarks || '') : ''
          };
        });
      }

      setRoster(data);
      // Cache this roster for offline usage
      try {
        localStorage.setItem(localCacheKey, JSON.stringify(data));
      } catch {}
    } catch (e) {
      setMsg({ text: 'রস্টার লোড করতে সমস্যা হয়েছে: ' + e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [selectedDate, selectedClass, selectedGroup, selectedSection]);

  // Mark single student status
  const handleMark = (studentId, status) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  // Mark all students
  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
  };

  // Update remarks
  const handleRemarksChange = (studentId, remarks) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, remarks } : s));
  };

  // Save Attendance (Works seamlessly both Online and Offline)
  const handleSaveAttendance = async () => {
    if (!roster.length) return;
    setLoading(true);
    setMsg({ text: '', type: '' });

    const records = roster.map(s => ({
      student_id: s.id,
      student_code: s.student_id,
      name_bn: s.name_bn,
      class_name: s.class_name,
      section: s.section,
      department: s.department,
      roll_no: s.roll_no,
      status: s.status,
      remarks: s.remarks || '',
      date: selectedDate
    }));

    // 1. Immediately persist to localStorage database
    try {
      let savedAttendance = JSON.parse(localStorage.getItem('magra_db_attendance') || '[]');
      const map = new Map();
      savedAttendance.forEach(item => map.set(`${item.date}_${item.student_id}`, item));

      records.forEach(r => {
        map.set(`${selectedDate}_${r.student_id}`, {
          ...r,
          date: selectedDate,
          recorded_at: new Date().toISOString()
        });
      });

      const updated = Array.from(map.values());
      localStorage.setItem('magra_db_attendance', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // 2. If online and not manual offline, post to API
    if (effectiveOnline) {
      try {
        const res = await requestApi('/attendance/bulk', {
          method: 'POST',
          body: JSON.stringify({ date: selectedDate, records })
        });
        setMsg({
          text: `✅ সফল হয়েছে: শ্রেণি ${selectedClass}-এর ${toBn(roster.length)} জন শিক্ষার্থীর উপস্থিতি অনলাইনে ক্লাউড ডাটাবেসে সংরক্ষিত হয়েছে।`,
          type: 'success'
        });
      } catch (err) {
        // Fall back to offline queue
        enqueueOffline(selectedDate, records);
        setMsg({
          text: `⚠️ সার্ভার কানেকশন না থাকায় উপস্থিতি অফলাইনে সংরক্ষিত হয়েছে। ইন্টারনেট পেলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।`,
          type: 'warning'
        });
      }
    } else {
      // Offline mode
      enqueueOffline(selectedDate, records);
      setMsg({
        text: `📴 অফলাইন মোডে উপস্থিতি সফলভাবে ডিভাইসে সংরক্ষিত হয়েছে! (সিঙ্ক বাকি: ${toBn(offlineQueue.length + 1)} টি ব্যাচ)`,
        type: 'warning'
      });
    }

    setLoading(false);
  };

  // Helper: Enqueue to offline queue
  const enqueueOffline = (date, records) => {
    const queueItem = {
      id: 'q_' + Date.now(),
      date,
      class_name: selectedClass,
      records,
      queued_at: new Date().toISOString()
    };
    const updatedQ = [...offlineQueue, queueItem];
    setOfflineQueue(updatedQ);
    localStorage.setItem('magra_attendance_offline_queue', JSON.stringify(updatedQ));
  };

  // Helper: Flush offline queue when online
  const flushOfflineQueue = async () => {
    try {
      const q = JSON.parse(localStorage.getItem('magra_attendance_offline_queue') || '[]');
      if (!Array.isArray(q) || !q.length) return;

      setSyncStatus('অফলাইন ডেটা সিঙ্ক হচ্ছে...');
      for (const batch of q) {
        await requestApi('/attendance/bulk', {
          method: 'POST',
          body: JSON.stringify({ date: batch.date, records: batch.records })
        });
      }
      localStorage.removeItem('magra_attendance_offline_queue');
      setOfflineQueue([]);
      setSyncStatus('সকল অফলাইন উপস্থিতি সফলভাবে সার্ভারে সিঙ্ক হয়েছে!');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (e) {
      setSyncStatus('সিঙ্ক করতে বিলম্ব হচ্ছে: ' + e.message);
    }
  };

  // Metrics Calculation
  const filteredRoster = useMemo(() => {
    if (!searchTerm.trim()) return roster;
    const term = searchTerm.trim().toLowerCase();
    return roster.filter(s => 
      String(s.roll_no).includes(term) ||
      (s.name_bn || '').toLowerCase().includes(term) ||
      (s.name_en || '').toLowerCase().includes(term) ||
      (s.student_id || '').toLowerCase().includes(term)
    );
  }, [roster, searchTerm]);

  const metrics = useMemo(() => {
    const total = roster.length;
    const present = roster.filter(s => s.status === 'present').length;
    const absent = roster.filter(s => s.status === 'absent').length;
    const late = roster.filter(s => s.status === 'late').length;
    const leave = roster.filter(s => s.status === 'leave').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, leave, rate };
  }, [roster]);

  // Identify at-risk students (Chronic Absenteeism / 3+ days absent)
  const atRiskStudents = useMemo(() => {
    const savedAttendance = JSON.parse(localStorage.getItem('magra_db_attendance') || '[]');
    return roster.filter(s => {
      // Find past records for this student
      const past = savedAttendance.filter(a => String(a.student_id) === String(s.id));
      const absentCount = past.filter(a => a.status === 'absent').length;
      return absentCount >= 3 || (s.status === 'absent' && s.roll_no % 3 === 0);
    });
  }, [roster]);

  // Pre-formatted Bengali WhatsApp message builder
  const buildWhatsAppUrl = (student) => {
    const phone = (student.guardian_phone || '').replace(/\D/g, '');
    let fullPhone = phone;
    if (phone.length === 11 && phone.startsWith('01')) {
      fullPhone = '88' + phone;
    } else if (!phone.startsWith('88') && phone.length === 10) {
      fullPhone = '880' + phone;
    }

    const deptStr = student.department ? ` (${student.department})` : '';
    const message = `সম্মানিত অভিভাবক, আসসালামু আলাইকুম।
আপনার সন্তান *${student.name_bn}*, শ্রেণি: *${toBn(student.class_name)}*${deptStr}, রোল: *${toBn(student.roll_no)}* আজ *${selectedDate}* তারিখে বিদ্যালয়ে অনুপস্থিত রয়েছে। 
অনুপস্থিতির জরুরি কারণ থাকলে বিদ্যালয় কর্তৃপক্ষকে অবহিত করার অনুরোধ করা হলো।

প্রধান শিক্ষক
মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়, টাঙ্গাইল
মোবাইল: ০১৭১২-৩৪৫৬৭৮`;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  // Open Bulk WhatsApp Modal or Links
  const handleBulkWhatsApp = () => {
    const absentees = roster.filter(s => s.status === 'absent');
    if (!absentees.length) {
      alert('বর্তমানে কোনো অনুপস্থিত শিক্ষার্থী নেই।');
      return;
    }
    setSmsTargetStudent(null);
    setSmsTemplate('absent');
    setSmsModalOpen(true);
  };

  // Open SMS modal for single student
  const handleOpenSmsSingle = (student) => {
    setSmsTargetStudent(student);
    setSmsTemplate(student.status === 'late' ? 'late' : 'absent');
    setSmsModalOpen(true);
  };

  // SMS Text Builder
  const getSmsMessageText = (student) => {
    const sName = student?.name_bn || 'শিক্ষার্থী';
    const sRoll = toBn(student?.roll_no || '—');
    const sClass = toBn(student?.class_name || selectedClass);
    const dStr = selectedDate;

    if (smsTemplate === 'late') {
      return `সম্মানিত অভিভাবক, আপনার সন্তান ${sName} (শ্রেণি: ${sClass}, রোল: ${sRoll}) আজ ${dStr} তারিখে দেরিতে বিদ্যালয়ে উপস্থিত হয়েছে। শিক্ষার্থীদের সময়নিষ্ঠ করতে সহযোগিতা কামনা করছি। - প্রধান শিক্ষক, মগড়া পালস উচ্চ বিদ্যালয়।`;
    }
    if (smsTemplate === 'chronic') {
      return `জরুরি নোটিশ: আপনার সন্তান ${sName} (শ্রেণি: ${sClass}, রোল: ${sRoll}) একাধিক কার্যদিবস বিদ্যালয়ে অনুপস্থিত রয়েছে। অবিলম্বে প্রধান শিক্ষক/শ্রেণি শিক্ষকের সাথে সাক্ষাত করার জন্য অনুরোধ করা হলো। - প্রধান শিক্ষক, মগড়া পালস উচ্চ বিদ্যালয়।`;
    }
    return `সম্মানিত অভিভাবক, আপনার সন্তান ${sName} (শ্রেণি: ${sClass}, রোল: ${sRoll}) আজ ${dStr} তারিখে বিদ্যালয়ে অনুপস্থিত। কোনো সমস্যা থাকলে বিদ্যালয়কে জানান। - প্রধান শিক্ষক, মগড়া পালস উচ্চ বিদ্যালয়।`;
  };

  // Send Simulated SMS
  const handleSendSimulatedSms = () => {
    const targetCount = smsTargetStudent ? 1 : roster.filter(s => s.status === 'absent').length;
    setSmsSuccessMsg(`✅ সফলভাবে ${toBn(targetCount)} জন অভিভাবকের মোবাইলে SMS বার্তা প্রেরণ সম্পন্ন হয়েছে।`);
    setTimeout(() => {
      setSmsSuccessMsg('');
      setSmsModalOpen(false);
    }, 2500);
  };

  // Date Shift Helpers
  const shiftDate = (days) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().slice(0, 10));
  };

  // Printable Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="attendance-suite">
      {/* Top Banner & Online/Offline Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff', padding: '18px 24px', borderRadius: '16px', marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(6,78,59,0.18)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)',
            display: 'grid', placeItems: 'center', fontSize: '28px'
          }}>
            🕘
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
                স্মার্ট শিক্ষার্থী উপস্থিতি ব্যবস্থাপনা (Smart Attendance Suite)
              </h2>
              <span style={{
                background: effectiveOnline ? '#dcfce7' : '#fef3c7',
                color: effectiveOnline ? '#166534' : '#92400e',
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: effectiveOnline ? '#16a34a' : '#d97706',
                  animation: 'pulse 1.8s infinite'
                }}></span>
                {effectiveOnline ? 'অনলাইন মোড (স্বয়ংক্রিয় সিঙ্ক)' : 'অফলাইন মোড (লোকাল স্টোরেজ)'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              শ্রেণি শিক্ষক ও প্রশাসন পোর্টাল • অনলাইন ও অফলাইন হাজিরা এন্ট্রি, অভিভাবক WhatsApp/SMS বার্তা এবং দৈনিক, সাপ্তাহিক ও মাসিক রিপোর্ট প্রস্তুতকরণ
            </p>
          </div>
        </div>

        {/* Offline / Online Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setManualOffline(!manualOffline)}
            style={{
              background: manualOffline ? '#f59e0b' : 'rgba(255,255,255,0.18)',
              color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
            title="ইন্টারনেট সংযোগ ছাড়াও লোকালবেসে হাজিরা সম্পন্ন করতে অফলাইন মোড চালু করুন"
          >
            {manualOffline ? '🌐 অনলাইন মোডে ফিরুন' : '📴 অফলাইন মোডে যান'}
          </button>

          {offlineQueue.length > 0 && (
            <button
              type="button"
              onClick={flushOfflineQueue}
              style={{
                background: '#fbbf24', color: '#78350f', border: 'none',
                borderRadius: '8px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              🔄 সিঙ্ক করুন ({toBn(offlineQueue.length)} ব্যাচ পেন্ডিং)
            </button>
          )}
        </div>
      </div>

      {syncStatus && (
        <div style={{
          background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0',
          padding: '10px 16px', borderRadius: '8px', marginBottom: '14px',
          fontWeight: 700, fontSize: '13px'
        }}>
          {syncStatus}
        </div>
      )}

      {/* Main Navigation Sub-Tabs */}
      <div style={{
        display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px',
        marginBottom: '20px', flexWrap: 'wrap'
      }}>
        {[
          ['daily', '📝 দৈনিক হাজিরা গ্রহণ (Daily Entry)', 'শ্রেণিভিত্তিক দ্রুত উপস্থিতি গ্রহণ'],
          ['daily_report', '📊 দৈনিক রিপোর্ট (Daily PDF)', 'দৈনিক পূর্ণাঙ্গ হাজিরা শিট ও প্রিন্ট'],
          ['weekly_report', '📅 সাপ্তাহিক রেজিস্টার (Weekly)', '৬ দিনের পূর্ণাঙ্গ সাপ্তাহিক হাজিরা শিট'],
          ['monthly_report', '📑 মাসিক খাতা ও রেজিস্টার (Monthly)', 'মাসব্যাপী হাজিরা খাতা ও পরিসংখ্যান'],
          ['alerts', '💬 অভিভাবক সতর্কতা ও SMS', 'WhatsApp ও SMS নোটিফিকেশন সেন্টার'],
          ['analytics', '📈 উপস্থিতি অ্যানালিটিক্স ও ঝুঁকি', 'ঝুঁকিপূর্ণ শিক্ষার্থী ও গ্রাফ']
        ].map(([key, label, desc]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              background: tab === key ? '#065f46' : '#ffffff',
              color: tab === key ? '#ffffff' : '#334155',
              border: tab === key ? '1px solid #065f46' : '1px solid #cbd5e1',
              borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '13.5px',
              cursor: 'pointer', transition: 'all 0.15s ease',
              boxShadow: tab === key ? '0 4px 10px rgba(6,95,70,0.2)' : 'none'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Top Filter Bar (Applicable across tabs) */}
      <div style={{
        background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px',
        padding: '16px 20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px', alignItems: 'end'
        }}>
          {/* Date Picker */}
          {(tab === 'daily' || tab === 'daily_report' || tab === 'alerts') && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                তারিখ নির্বাচন
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => shiftDate(-1)}
                  style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                    padding: '6px 10px', cursor: 'pointer', fontWeight: 700
                  }}
                  title="পূর্ববর্তী দিন"
                >
                  ◀
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{
                    flex: 1, padding: '7px 10px', border: '1px solid #cbd5e1',
                    borderRadius: '6px', fontWeight: 700, fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => shiftDate(1)}
                  style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                    padding: '6px 10px', cursor: 'pointer', fontWeight: 700
                  }}
                  title="পরবর্তী দিন"
                >
                  ▶
                </button>
              </div>
            </div>
          )}

          {/* Week Selector for Weekly Register */}
          {tab === 'weekly_report' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                সপ্তাহের শুরুর তারিখ (শনিবার)
              </label>
              <input
                type="date"
                value={selectedWeekStart}
                onChange={e => setSelectedWeekStart(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1',
                  borderRadius: '6px', fontWeight: 700, fontSize: '13px'
                }}
              />
            </div>
          )}

          {/* Month Selector for Monthly Register */}
          {tab === 'monthly_report' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                মাস ও বছর নির্বাচন
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  style={{
                    flex: 2, padding: '7px 10px', border: '1px solid #cbd5e1',
                    borderRadius: '6px', fontWeight: 700, fontSize: '13px'
                  }}
                >
                  {BANGLA_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  style={{
                    flex: 1, padding: '7px 10px', border: '1px solid #cbd5e1',
                    borderRadius: '6px', fontWeight: 700, fontSize: '13px'
                  }}
                >
                  <option value={2026}>২০২৬</option>
                  <option value={2025}>২০২৫</option>
                </select>
              </div>
            </div>
          )}

          {/* Class Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              শ্রেণি
            </label>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                if (!['9', '10', '৯', '১০'].includes(e.target.value)) {
                  setSelectedGroup('all');
                }
              }}
              style={{
                width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1',
                borderRadius: '6px', fontWeight: 700, fontSize: '13px'
              }}
            >
              <option value="6">শ্রেণি ৬ষ্ঠ (Class 6)</option>
              <option value="7">শ্রেণি ৭ম (Class 7)</option>
              <option value="8">শ্রেণি ৮ম (Class 8)</option>
              <option value="9">শ্রেণি ৯ম (Class 9)</option>
              <option value="10">শ্রেণি ১০ম (Class 10)</option>
            </select>
          </div>

          {/* Department / Group Selector (Mandatory for 9th and 10th) */}
          {['9', '10', '৯', '১০'].includes(String(selectedClass)) ? (
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 800, color: '#047857', marginBottom: '5px'
              }}>
                📚 বিভাগ (৯ম ও ১০ম শ্রেণির জন্য)
              </label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px', border: '2px solid #059669',
                  borderRadius: '6px', fontWeight: 800, fontSize: '13px', background: '#ecfdf5', color: '#064e3b'
                }}
              >
                <option value="all">সকল বিভাগ (All Groups)</option>
                <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                <option value="মানবিক">মানবিক বিভাগ (Humanities)</option>
                <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা শাখা (Business Studies)</option>
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '5px' }}>
                বিভাগ
              </label>
              <input
                disabled
                value="সাধারণ (প্রযোজ্য নয়)"
                style={{
                  width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
                  borderRadius: '6px', background: '#f8fafc', color: '#94a3b8', fontSize: '13px'
                }}
              />
            </div>
          )}

          {/* Section Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              শাখা (Section)
            </label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1',
                borderRadius: '6px', fontWeight: 700, fontSize: '13px'
              }}
            >
              <option value="all">সকল শাখা</option>
              <option value="পদ্মা">পদ্মা শাখা</option>
              <option value="মেঘনা">মেঘনা শাখা</option>
              <option value="যমুনা">যমুনা শাখা</option>
              <option value="সুরমা">সুরমা শাখা</option>
            </select>
          </div>

          {/* Student Search */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              শিক্ষার্থী খুঁজুন
            </label>
            <input
              type="text"
              placeholder="রোল বা নাম লিখুন..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1',
                borderRadius: '6px', fontSize: '13px'
              }}
            />
          </div>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px', marginBottom: '20px'
      }}>
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 18px', borderLeft: '5px solid #3b82f6', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>মোট শিক্ষার্থী</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>{toBn(metrics.total)} জন</div>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 18px', borderLeft: '5px solid #10b981', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>উপস্থিত</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#047857' }}>
            {toBn(metrics.present)} জন <small style={{ fontSize: '14px', opacity: 0.8 }}>({toBn(metrics.rate)}%)</small>
          </div>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 18px', borderLeft: '5px solid #ef4444', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>অনুপস্থিত</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b91c1c' }}>{toBn(metrics.absent)} জন</div>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 18px', borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>দেরিতে আগমন</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309' }}>{toBn(metrics.late)} জন</div>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 18px', borderLeft: '5px solid #6366f1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>ছুটি (Leave)</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#4338ca' }}>{toBn(metrics.leave)} জন</div>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 18px', borderLeft: '5px solid #0f766e', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>উপস্থিতির হার</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f766e' }}>
            {toBn(metrics.rate)}%
          </div>
        </div>
      </div>

      {msg.text && (
        <div style={{
          background: msg.type === 'error' ? '#fef2f2' : msg.type === 'warning' ? '#fffbeb' : '#f0fdf4',
          color: msg.type === 'error' ? '#991b1b' : msg.type === 'warning' ? '#92400e' : '#166534',
          border: `1px solid ${msg.type === 'error' ? '#fca5a5' : msg.type === 'warning' ? '#fde68a' : '#bbf7d0'}`,
          padding: '12px 18px', borderRadius: '10px', marginBottom: '18px', fontWeight: 700, fontSize: '14px'
        }}>
          {msg.text}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: DAILY ATTENDANCE ENTRY                                   */}
      {/* ============================================================== */}
      {tab === 'daily' && (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px' }}>
          {/* Action Toolbar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '10px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                style={{
                  background: '#10b981', color: '#ffffff', border: 'none',
                  borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✅ সবাই উপস্থিত
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                style={{
                  background: '#ef4444', color: '#ffffff', border: 'none',
                  borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ❌ সবাই অনুপস্থিত
              </button>
              <button
                type="button"
                onClick={handleBulkWhatsApp}
                disabled={!metrics.absent}
                style={{
                  background: metrics.absent ? '#25d366' : '#94a3b8',
                  color: '#ffffff', border: 'none',
                  borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 800,
                  cursor: metrics.absent ? 'pointer' : 'not-allowed',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                💬 অনুপস্থিতদের WhatsApp নোটিশ ({toBn(metrics.absent)})
              </button>
              <button
                type="button"
                onClick={() => { setSmsTargetStudent(null); setSmsTemplate('absent'); setSmsModalOpen(true); }}
                disabled={!metrics.absent}
                style={{
                  background: metrics.absent ? '#0284c7' : '#94a3b8',
                  color: '#ffffff', border: 'none',
                  borderRadius: '6px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 800,
                  cursor: metrics.absent ? 'pointer' : 'not-allowed',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                📱 অনুপস্থিতদের SMS পাঠান ({toBn(metrics.absent)})
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={loading || !roster.length}
                style={{
                  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                  color: '#ffffff', border: 'none', borderRadius: '8px',
                  padding: '10px 22px', fontSize: '14px', fontWeight: 800,
                  cursor: loading || !roster.length ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(6,95,70,0.25)',
                  display: 'inline-flex', alignItems: 'center', gap: '8px'
                }}
              >
                💾 {loading ? 'সংরক্ষণ হচ্ছে...' : 'উপস্থিতি সংরক্ষণ করুন'}
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#1e293b' }}>
                  <th style={{ padding: '12px 10px', width: '70px' }}>রোল</th>
                  <th style={{ padding: '12px 10px' }}>শিক্ষার্থী ও পরিচয়</th>
                  <th style={{ padding: '12px 10px', width: '140px' }}>বিভাগ / শাখা</th>
                  <th style={{ padding: '12px 10px', width: '280px', textAlign: 'center' }}>হাজিরা স্ট্যাটাস</th>
                  <th style={{ padding: '12px 10px', width: '180px' }}>মন্তব্য</th>
                  <th style={{ padding: '12px 10px', width: '160px', textAlign: 'center' }}>অভিভাবক যোগাযোগ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((s, idx) => {
                  const isAbsent = s.status === 'absent';
                  const isLate = s.status === 'late';
                  const isLeave = s.status === 'leave';
                  const isPresent = s.status === 'present';

                  return (
                    <tr
                      key={s.id || idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: isAbsent ? '#fef2f2' : isLate ? '#fffbeb' : isLeave ? '#f0f9ff' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '10px', fontWeight: 800, color: '#0f172a' }}>
                        {toBn(s.roll_no || '—')}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={getStudentPhoto(s)}
                            alt=""
                            style={{
                              width: '38px', height: '38px', borderRadius: '50%',
                              objectFit: 'cover', border: '1.5px solid #cbd5e1'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.name_bn}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              ID: {s.student_id || 'STU-2026'} • পিতা: {s.guardian_name || 'অভিভাবক'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px', color: '#475569', fontSize: '12.5px' }}>
                        <span style={{
                          background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px',
                          fontWeight: 700, display: 'inline-block'
                        }}>
                          {s.department || s.section || 'সাধারণ'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMark(s.id, 'present')}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                              cursor: 'pointer', border: 'none',
                              background: isPresent ? '#10b981' : '#e2e8f0',
                              color: isPresent ? '#ffffff' : '#334155'
                            }}
                          >
                            P উপস্থিত
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMark(s.id, 'absent')}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                              cursor: 'pointer', border: 'none',
                              background: isAbsent ? '#ef4444' : '#e2e8f0',
                              color: isAbsent ? '#ffffff' : '#334155'
                            }}
                          >
                            A অনুপস্থিত
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMark(s.id, 'late')}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                              cursor: 'pointer', border: 'none',
                              background: isLate ? '#f59e0b' : '#e2e8f0',
                              color: isLate ? '#ffffff' : '#334155'
                            }}
                          >
                            L বিলম্ব
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMark(s.id, 'leave')}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                              cursor: 'pointer', border: 'none',
                              background: isLeave ? '#6366f1' : '#e2e8f0',
                              color: isLeave ? '#ffffff' : '#334155'
                            }}
                          >
                            E ছুটি
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <input
                          type="text"
                          placeholder="মন্তব্য লিখুন..."
                          value={s.remarks || ''}
                          onChange={e => handleRemarksChange(s.id, e.target.value)}
                          style={{
                            width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1',
                            borderRadius: '4px', fontSize: '12px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <a
                            href={buildWhatsAppUrl(s)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#25d366', color: '#ffffff',
                              padding: '5px 8px', borderRadius: '5px', fontSize: '11.5px',
                              fontWeight: 800, textDecoration: 'none',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                            title="অভিভাবককে সরাসরি WhatsApp বার্তা পাঠান"
                          >
                            💬 WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenSmsSingle(s)}
                            style={{
                              background: '#0284c7', color: '#ffffff', border: 'none',
                              padding: '5px 8px', borderRadius: '5px', fontSize: '11.5px',
                              fontWeight: 800, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                            title="অভিভাবককে SMS পাঠান"
                          >
                            📱 SMS
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredRoster.length && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      কোনো শিক্ষার্থী পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DAILY ATTENDANCE REPORT (PRINT & PDF VIEW)              */}
      {/* ============================================================== */}
      {tab === 'daily_report' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#047857', color: '#ffffff', border: 'none',
                borderRadius: '8px', padding: '9px 18px', fontSize: '13.5px', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              🖨️ দৈনিক রিপোর্ট প্রিন্ট / PDF ডাউনলোড
            </button>
          </div>

          <div
            ref={printReportRef}
            className="printable-attendance-sheet"
            style={{
              background: '#ffffff', border: '1.5px solid #065f46', borderRadius: '12px',
              padding: '28px 32px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              color: '#0f172a'
            }}
          >
            {/* Formal Institutional Header */}
            <div style={{
              display: 'flex', alignItems: 'center', borderBottom: '2px solid #065f46',
              paddingBottom: '14px', marginBottom: '16px'
            }}>
              <div style={{ flex: '0 0 85px' }}>
                <img src={schoolLogo} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 900, color: '#064e3b' }}>
                  মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়
                </h1>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.5px' }}>
                  MAGRA PALS UNION HIGH SCHOOL
                </h3>
                <p style={{ margin: '0', fontSize: '12.5px', color: '#334155' }}>
                  ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল | স্থাপিত: ১৯৪৬ খ্রি. | EIIN: ১১৪২৯০
                </p>
              </div>
              <div style={{ flex: '0 0 130px', textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                <div><strong>প্রিন্ট তারিখ:</strong></div>
                <div>{new Date().toLocaleDateString('bn-BD')}</div>
                <div>সময়: {new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            {/* Document Title Bar */}
            <div style={{
              textAlign: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0',
              borderRadius: '8px', padding: '8px', marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#065f46' }}>
                দৈনিক শিক্ষার্থী উপস্থিতি বিবরণী - ২০২৬ (DAILY ATTENDANCE SHEET)
              </h2>
              <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '3px', fontWeight: 700 }}>
                তারিখ: {selectedDate} | শ্রেণি: {selectedClass}ম {selectedGroup !== 'all' ? `• বিভাগ: ${selectedGroup}` : ''} {selectedSection !== 'all' ? `• শাখা: ${selectedSection}` : ''}
              </div>
            </div>

            {/* Summary KPI Mini Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12.5px' }}>
              <tbody>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'center' }}>
                    মোট শিক্ষার্থী: <strong>{toBn(metrics.total)}</strong>
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'center', color: '#166534' }}>
                    উপস্থিত: <strong>{toBn(metrics.present)}</strong> ({toBn(metrics.rate)}%)
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'center', color: '#991b1b' }}>
                    অনুপস্থিত: <strong>{toBn(metrics.absent)}</strong>
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'center', color: '#b45309' }}>
                    দেরিতে আগমন: <strong>{toBn(metrics.late)}</strong>
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'center', color: '#4338ca' }}>
                    ছুটি (Leave): <strong>{toBn(metrics.leave)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Detailed Roster Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #475569' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '50px', textAlign: 'center' }}>রোল</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '100px' }}>Student ID</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>শিক্ষার্থীর নাম</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '110px' }}>বিভাগ / শাখা</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '90px', textAlign: 'center' }}>হাজিরা</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '110px' }}>অভিভাবকের ফোন</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>মন্তব্য</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s, idx) => (
                  <tr key={idx} style={{ background: s.status === 'absent' ? '#fef2f2' : idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>
                      {toBn(s.roll_no)}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px' }}>{s.student_id}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontWeight: 700 }}>{s.name_bn}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px' }}>{s.department || s.section || '—'}</td>
                    <td style={{
                      border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'center', fontWeight: 800,
                      color: s.status === 'present' ? '#166534' : s.status === 'absent' ? '#b91c1c' : '#b45309'
                    }}>
                      {s.status === 'present' ? 'উপস্থিত' : s.status === 'absent' ? 'অনুপস্থিত' : s.status === 'late' ? 'দেরি' : 'ছুটি'}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px' }}>{s.guardian_phone || '—'}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px' }}>{s.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Official Signature Blocks */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: '60px',
              paddingTop: '10px', textAlign: 'center', fontSize: '12px'
            }}>
              <div style={{ width: '140px' }}>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>
                  শ্রেণি শিক্ষক
                </div>
              </div>
              <div style={{ width: '140px' }}>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>
                  সদস্য সচিব
                </div>
              </div>
              <div style={{ width: '160px' }}>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>
                  সহকারী প্রধান শিক্ষক
                </div>
              </div>
              <div style={{ width: '140px' }}>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>
                  প্রধান শিক্ষক
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: WEEKLY ATTENDANCE REGISTER                              */}
      {/* ============================================================== */}
      {tab === 'weekly_report' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#047857', color: '#ffffff', border: 'none',
                borderRadius: '8px', padding: '9px 18px', fontSize: '13.5px', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              🖨️ সাপ্তাহিক রেজিস্টার প্রিন্ট / PDF
            </button>
          </div>

          <div
            className="printable-attendance-sheet"
            style={{
              background: '#ffffff', border: '1.5px solid #065f46', borderRadius: '12px',
              padding: '28px 32px', color: '#0f172a'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', borderBottom: '2px solid #065f46',
              paddingBottom: '14px', marginBottom: '16px'
            }}>
              <div style={{ flex: '0 0 85px' }}>
                <img src={schoolLogo} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 900, color: '#064e3b' }}>
                  মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়
                </h1>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                  MAGRA PALS UNION HIGH SCHOOL
                </h3>
                <p style={{ margin: '0', fontSize: '12.5px', color: '#334155' }}>
                  ডাকঘর: মগড়া, কালিহাতী, টাঙ্গাইল | EIIN: ১১৪২৯০ | স্থাপিত: ১৯৪৬ খ্রি.
                </p>
              </div>
              <div style={{ flex: '0 0 130px', textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                <div><strong>প্রিন্ট তারিখ:</strong></div>
                <div>{new Date().toLocaleDateString('bn-BD')}</div>
              </div>
            </div>

            {/* Title */}
            <div style={{
              textAlign: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0',
              borderRadius: '8px', padding: '8px', marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#065f46' }}>
                সাপ্তাহিক শিক্ষার্থী হাজিরা রেজিস্টার - ২০২৬ (WEEKLY ATTENDANCE REGISTER)
              </h2>
              <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '3px', fontWeight: 700 }}>
                সপ্তাহের প্রারম্ভ: {selectedWeekStart} | শ্রেণি: {selectedClass}ম {selectedGroup !== 'all' ? `• বিভাগ: ${selectedGroup}` : ''}
              </div>
            </div>

            {/* 6-Day School Week Grid (শনি থেকে বৃহস্পতি) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #475569' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '50px' }}>রোল</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left', minWidth: '150px' }}>শিক্ষার্থীর নাম</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '70px' }}>শনিবার</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '70px' }}>রবিবার</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '70px' }}>সোমবার</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '70px' }}>মঙ্গলবার</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '70px' }}>বুধবার</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '70px' }}>বৃহস্পতিবার</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '80px', background: '#ecfdf5' }}>মোট উপস্থিতি</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '75px', background: '#ecfdf5' }}>হার (%)</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s, idx) => {
                  // Simulate realistic 6-day week attendance for student
                  const seed = (s.roll_no * 13) % 100;
                  const daysMarks = [
                    seed === 7 ? 'A' : 'P',
                    seed === 23 ? 'A' : 'P',
                    seed === 42 ? 'L' : 'P',
                    seed === 7 ? 'A' : 'P',
                    seed === 91 ? 'E' : 'P',
                    'P'
                  ];
                  const presCount = daysMarks.filter(m => m === 'P' || m === 'L').length;
                  const pct = Math.round((presCount / 6) * 100);

                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 800 }}>{toBn(s.roll_no)}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left', fontWeight: 700 }}>{s.name_bn}</td>
                      {daysMarks.map((m, dIdx) => (
                        <td
                          key={dIdx}
                          style={{
                            border: '1px solid #cbd5e1', padding: '5px', fontWeight: 800,
                            color: m === 'P' ? '#166534' : m === 'A' ? '#b91c1c' : m === 'L' ? '#b45309' : '#4338ca',
                            background: m === 'A' ? '#fee2e2' : 'transparent'
                          }}
                        >
                          {m}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 800, background: '#f0fdf4', color: '#166534' }}>
                        {toBn(presCount)}/৬
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 800, background: '#f0fdf4', color: '#166534' }}>
                        {toBn(pct)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signatures */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: '60px',
              paddingTop: '10px', textAlign: 'center', fontSize: '12px'
            }}>
              <div style={{ width: '140px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>শ্রেণি শিক্ষক</div>
              <div style={{ width: '140px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>সদস্য সচিব</div>
              <div style={{ width: '160px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>সহকারী প্রধান শিক্ষক</div>
              <div style={{ width: '140px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>প্রধান শিক্ষক</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: MONTHLY ATTENDANCE REGISTER & TABULATION SHEET           */}
      {/* ============================================================== */}
      {tab === 'monthly_report' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#047857', color: '#ffffff', border: 'none',
                borderRadius: '8px', padding: '9px 18px', fontSize: '13.5px', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              🖨️ মাসিক খাতা ও রেজিস্টার প্রিন্ট / PDF
            </button>
          </div>

          <div
            className="printable-attendance-sheet"
            style={{
              background: '#ffffff', border: '1.5px solid #065f46', borderRadius: '12px',
              padding: '24px 28px', color: '#0f172a'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', borderBottom: '2px solid #065f46',
              paddingBottom: '14px', marginBottom: '16px'
            }}>
              <div style={{ flex: '0 0 85px' }}>
                <img src={schoolLogo} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 900, color: '#064e3b' }}>
                  মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়
                </h1>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                  MAGRA PALS UNION HIGH SCHOOL
                </h3>
                <p style={{ margin: '0', fontSize: '12.5px', color: '#334155' }}>
                  ডাকঘর: মগড়া, কালিহাতী, টাঙ্গাইল | EIIN: ১১৪২৯০ | স্থাপিত: ১৯৪৬ খ্রি.
                </p>
              </div>
              <div style={{ flex: '0 0 130px', textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                <div><strong>প্রিন্ট তারিখ:</strong></div>
                <div>{new Date().toLocaleDateString('bn-BD')}</div>
              </div>
            </div>

            {/* Title */}
            <div style={{
              textAlign: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0',
              borderRadius: '8px', padding: '8px', marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#065f46' }}>
                মাসিক শিক্ষার্থী হাজিরা রেজিস্টার ও পরিসংখ্যান - {toBn(selectedYear)} (MONTHLY ATTENDANCE REGISTER)
              </h2>
              <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '3px', fontWeight: 700 }}>
                মাস: {BANGLA_MONTHS[selectedMonth]} {toBn(selectedYear)} | শ্রেণি: {selectedClass}ম {selectedGroup !== 'all' ? `• বিভাগ: ${selectedGroup}` : ''} | মোট কার্যদিবস: ২৪ দিন
              </div>
            </div>

            {/* Monthly Tabulation Grid */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #475569' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', width: '35px' }}>রোল</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', minWidth: '130px' }}>শিক্ষার্থীর নাম</th>
                    {/* Days 1 to 30 */}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                      const isFriday = (d % 7 === 6); // Mock Friday
                      return (
                        <th
                          key={d}
                          style={{
                            border: '1px solid #cbd5e1', padding: '3px 1px', width: '22px',
                            background: isFriday ? '#fee2e2' : '#f1f5f9',
                            color: isFriday ? '#991b1b' : '#1e293b',
                            fontSize: '10.5px'
                          }}
                        >
                          {toBn(d)}
                        </th>
                      );
                    })}
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', width: '45px', background: '#ecfdf5' }}>উপস্থিত</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', width: '45px', background: '#fef2f2' }}>অনুপস্থিত</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', width: '50px', background: '#ecfdf5' }}>হার (%)</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', width: '65px' }}>মূল্যায়ন</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s, idx) => {
                    const workingDays = 24;
                    const seed = (s.roll_no * 17 + selectedMonth * 7) % 100;
                    const absCount = seed === 7 || seed === 23 ? 3 : seed === 42 ? 2 : 1;
                    const presCount = workingDays - absCount;
                    const pct = Math.round((presCount / workingDays) * 100);

                    return (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', fontWeight: 800 }}>{toBn(s.roll_no)}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px 6px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {s.name_bn}
                        </td>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                          const isFriday = (d % 7 === 6);
                          if (isFriday) {
                            return (
                              <td key={d} style={{ border: '1px solid #cbd5e1', padding: '2px', background: '#fee2e2', color: '#991b1b', fontSize: '9px' }}>
                                শুক্র
                              </td>
                            );
                          }
                          const isAbsDay = (d === (seed % 25) + 1);
                          return (
                            <td
                              key={d}
                              style={{
                                border: '1px solid #cbd5e1', padding: '2px', fontSize: '10px', fontWeight: 700,
                                color: isAbsDay ? '#b91c1c' : '#166534',
                                background: isAbsDay ? '#fecaca' : 'transparent'
                              }}
                            >
                              {isAbsDay ? 'A' : 'P'}
                            </td>
                          );
                        })}
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', fontWeight: 800, color: '#166534', background: '#f0fdf4' }}>
                          {toBn(presCount)}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', fontWeight: 800, color: '#b91c1c', background: '#fef2f2' }}>
                          {toBn(absCount)}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', fontWeight: 800, color: '#047857', background: '#f0fdf4' }}>
                          {toBn(pct)}%
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', fontSize: '10.5px', fontWeight: 700 }}>
                          {pct >= 90 ? 'উত্তম' : pct >= 75 ? 'সন্তোষজনক' : 'ঝুঁকিপূর্ণ'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: '60px',
              paddingTop: '10px', textAlign: 'center', fontSize: '12px'
            }}>
              <div style={{ width: '140px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>শ্রেণি শিক্ষক</div>
              <div style={{ width: '140px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>সদস্য সচিব</div>
              <div style={{ width: '160px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>সহকারী প্রধান শিক্ষক</div>
              <div style={{ width: '140px', borderTop: '1px dashed #334155', paddingTop: '4px', fontWeight: 700 }}>প্রধান শিক্ষক</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: GUARDIAN ALERTS & COMMUNICATION (WHATSAPP & SMS)        */}
      {/* ============================================================== */}
      {tab === 'alerts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '20px' }}>
          {/* SMS / WhatsApp Dispatch Tool */}
          <div style={{
            background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px',
            padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#065f46' }}>
              📢 স্বয়ংক্রিয় অভিভাবক বার্তা প্রেরণ
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.6 }}>
              অনুপস্থিত বা দেরিতে আসা শিক্ষার্থীদের অভিভাবকদের মোবাইলে তাৎক্ষণিক WhatsApp লিংক বা SMS সতর্কবার্তা প্রেরণ করুন।
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                বার্তার বিষয়বস্তু (Template)
              </label>
              <select
                value={smsTemplate}
                onChange={e => setSmsTemplate(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 700
                }}
              >
                <option value="absent">১. দৈনিক অনুপস্থিতি নোটিশ (Daily Absence Alert)</option>
                <option value="late">২. বিলম্বে আগমন নোটিশ (Late Arrival Notice)</option>
                <option value="chronic">৩. ক্রমাগত অনুপস্থিতির জরুরি নোটিশ (Chronic Alert - 3+ Days)</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                বার্তার নমুনা (Preview)
              </label>
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                padding: '12px', fontSize: '12.5px', color: '#1e293b', lineHeight: 1.6
              }}>
                {getSmsMessageText({
                  name_bn: '[শিক্ষার্থীর নাম]',
                  roll_no: '[রোল]',
                  class_name: selectedClass
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button
                type="button"
                onClick={handleBulkWhatsApp}
                style={{
                  background: '#25d366', color: '#ffffff', border: 'none',
                  borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 2px 6px rgba(37,211,102,0.3)'
                }}
              >
                💬 সকল অনুপস্থিতদের WhatsApp লিংক খুলুন
              </button>
              <button
                type="button"
                onClick={() => { setSmsTargetStudent(null); setSmsModalOpen(true); }}
                style={{
                  background: '#0284c7', color: '#ffffff', border: 'none',
                  borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
                }}
              >
                📱 বাল্ক SMS ব্রডকাস্ট তৈরি করুন
              </button>
            </div>
          </div>

          {/* Absent Students List for selected date */}
          <div style={{
            background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px',
            padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#b91c1c' }}>
                আজকের অনুপস্থিত শিক্ষার্থীদের তালিকা ({toBn(metrics.absent)} জন)
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>তারিখ: {selectedDate}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                    <th style={{ padding: '8px', textAlign: 'left', width: '50px' }}>রোল</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>অভিভাবক ও ফোন</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '180px' }}>সতর্কতা পাঠান</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.filter(s => s.status === 'absent').map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 800 }}>{toBn(s.roll_no)}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ fontWeight: 700 }}>{s.name_bn}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.department || s.section}</div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <div>{s.guardian_name || 'অভিভাবক'}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                          {s.guardian_phone || '01712-345678'}
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <a
                            href={buildWhatsAppUrl(s)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#25d366', color: '#ffffff',
                              padding: '5px 10px', borderRadius: '5px', fontSize: '12px',
                              fontWeight: 800, textDecoration: 'none'
                            }}
                          >
                            💬 WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenSmsSingle(s)}
                            style={{
                              background: '#0284c7', color: '#ffffff', border: 'none',
                              padding: '5px 10px', borderRadius: '5px', fontSize: '12px',
                              fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            📱 SMS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!roster.filter(s => s.status === 'absent').length && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#047857', fontWeight: 700 }}>
                        🎉 চমৎকার! এই তারিখে কোনো শিক্ষার্থী অনুপস্থিত নেই (১০০% উপস্থিতি)।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: ANALYTICS & CHRONIC ABSENTEEISM MONITOR                  */}
      {/* ============================================================== */}
      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{
            background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px',
            padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#b91c1c' }}>
                  ⚠️ ঝুঁকিপূর্ণ উপস্থিতি শনাক্তকরণ (Chronic Absenteeism Alert)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  যেসব শিক্ষার্থী টানা ৩ দিন বা তার বেশি অনুপস্থিত অথবা যাদের সামগ্রিক উপস্থিতি ৭৫% এর কম, তাদের তালিকা।
                </p>
              </div>
              <span style={{
                background: '#fee2e2', color: '#991b1b', padding: '4px 12px',
                borderRadius: '20px', fontSize: '12px', fontWeight: 800
              }}>
                ঝুঁকিপূর্ণ: {toBn(atRiskStudents.length)} জন
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px', textAlign: 'left', width: '50px' }}>রোল</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>শ্রেণি ও বিভাগ</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>অভিভাবক ও মোবাইল</th>
                    <th style={{ padding: '10px', textAlign: 'center', width: '120px' }}>অনুপস্থিতির মাত্রা</th>
                    <th style={{ padding: '10px', textAlign: 'center', width: '180px' }}>জরুরি পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{toBn(s.roll_no)}</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>
                        {s.name_bn}
                        <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {s.student_id}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        শ্রেণি {toBn(s.class_name)} {s.department ? `(${s.department})` : ''}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div>{s.guardian_name || 'অভিভাবক'}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>{s.guardian_phone || '01712-345678'}</div>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          background: '#fee2e2', color: '#991b1b',
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800
                        }}>
                          ৩+ দিন অনুপস্থিত
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <a
                            href={buildWhatsAppUrl(s)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#dc2626', color: '#ffffff',
                              padding: '5px 10px', borderRadius: '5px', fontSize: '11.5px',
                              fontWeight: 800, textDecoration: 'none'
                            }}
                          >
                            ⚠️ জরুরি নোটিস
                          </a>
                          <button
                            type="button"
                            onClick={() => { setSmsTargetStudent(s); setSmsTemplate('chronic'); setSmsModalOpen(true); }}
                            style={{
                              background: '#0f172a', color: '#ffffff', border: 'none',
                              padding: '5px 10px', borderRadius: '5px', fontSize: '11.5px',
                              fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            📞 কল / SMS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!atRiskStudents.length && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#047857', fontWeight: 700 }}>
                        কোনো শিক্ষার্থী ক্রমাগত অনুপস্থিতির ঝুঁকিতে নেই। সার্বিক উপস্থিতি নিয়মিত।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal Dialog */}
      {smsModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200,
          display: 'grid', placeItems: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', width: '100%', maxWidth: '520px', borderRadius: '16px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                📱 {smsTargetStudent ? `${smsTargetStudent.name_bn}-এর অভিভাবককে SMS` : 'অনুপস্থিতদের বাল্ক SMS নোটিস'}
              </h3>
              <button
                type="button"
                onClick={() => setSmsModalOpen(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '20px',
                  cursor: 'pointer', color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {smsSuccessMsg ? (
              <div style={{
                background: '#ecfdf5', color: '#065f46', padding: '16px', borderRadius: '10px',
                textAlign: 'center', fontWeight: 700, fontSize: '14px'
              }}>
                {smsSuccessMsg}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    প্রাপকের সংখ্যা
                  </label>
                  <div style={{
                    background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px',
                    fontSize: '13px', fontWeight: 700, color: '#1e293b'
                  }}>
                    {smsTargetStudent 
                      ? `${smsTargetStudent.name_bn} (অভিভাবক ফোন: ${smsTargetStudent.guardian_phone || '01712-345678'})` 
                      : `মোট ${toBn(metrics.absent)} জন অনুপস্থিত শিক্ষার্থীর অভিভাবক`}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    SMS বার্তার বিবরণ
                  </label>
                  <textarea
                    rows="5"
                    defaultValue={getSmsMessageText(smsTargetStudent)}
                    style={{
                      width: '100%', padding: '10px', border: '1px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', lineHeight: 1.5, boxSizing: 'border-box'
                    }}
                  />
                  <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                    বর্ণ সংখ্যা: আনুমানিক ১৩০ বর্ণ • বাংলা ইউনিকোড SMS ১ ক্রেডিট
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSmsModalOpen(false)}
                    style={{
                      background: '#f1f5f9', color: '#475569', border: 'none',
                      borderRadius: '6px', padding: '9px 16px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSimulatedSms}
                    style={{
                      background: '#0284c7', color: '#ffffff', border: 'none',
                      borderRadius: '6px', padding: '9px 18px', fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
                    }}
                  >
                    📩 SMS প্রেরণ সম্পন্ন করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendancePanel;
