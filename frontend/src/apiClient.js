import {
  MOCK_SCHOOL,
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_STAFF,
  MOCK_COMMITTEE,
  MOCK_NOTICES,
  MOCK_EXAMS,
  MOCK_SUBJECTS,
  MOCK_ROUTINES,
  MOCK_FEES,
  MOCK_EXPENSES,
  MOCK_BOOKS,
  MOCK_ADMISSIONS,
  MOCK_SCHOLARSHIPS,
  MOCK_PUBLIC_CONTENT,
  MOCK_SSC_RESULTS
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Clean legacy mock databases once
try {
  if (typeof localStorage !== 'undefined') {
    const isCleaned = localStorage.getItem('magra_cleaned_v3');
    if (!isCleaned) {
      localStorage.removeItem('magra_db_teachers');
      localStorage.removeItem('magra_db_students');
      localStorage.removeItem('magra_db_staff');
      localStorage.removeItem('magra_db_fees');
      localStorage.removeItem('magra_db_scholarships');
      localStorage.setItem('magra_cleaned_v3', 'true');
    }
  }
} catch {}

function getLocalStore(key, defaultVal) {
  try {
    const raw = localStorage.getItem('magra_db_' + key);
    if (!raw) {
      localStorage.setItem('magra_db_' + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalStore(key, val) {
  try {
    localStorage.setItem('magra_db_' + key, JSON.stringify(val));
  } catch {}
}

let backendState = 'probing'; // 'probing' | 'online' | 'offline'

export async function requestApi(path, opts = {}) {
  const token = localStorage.getItem('magra_token');

  // If backend is known to be offline, return mock data in 0ms without network latency
  if (backendState === 'offline') {
    return handleMockRequest(path, opts);
  }

  try {
    const controller = new AbortController();
    const timeoutMs = backendState === 'online' ? 4000 : 350;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(API_BASE + path, {
      ...opts,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      }
    });
    clearTimeout(timer);
    if (res.ok) {
      backendState = 'online';
      return await res.json();
    }
    if (res.status === 401) {
      const err = await res.json().catch(() => ({ message: 'অননুমোদিত এক্সেস' }));
      throw new Error(err.message || 'অননুমোদিত এক্সেস');
    }
  } catch (err) {
    if (backendState !== 'online') {
      backendState = 'offline';
    }
  }

  return handleMockRequest(path, opts);
}

function handleMockRequest(path, opts = {}) {
  const method = (opts.method || 'GET').toUpperCase();
  const body = opts.body ? JSON.parse(opts.body) : {};
  const [cleanPath, queryStr] = path.split('?');
  const params = new URLSearchParams(queryStr || '');

  // 1. Auth & Me
  if (cleanPath === '/auth/login' && method === 'POST') {
    const { loginId } = body;
    const cleanId = (loginId || '').trim().toLowerCase();
    const users = getLocalStore('users', MOCK_USERS);
    
    let matched = users.find(u => u.login_id.toLowerCase() === cleanId);
    
    if (!matched) {
      if (cleanId === 'head' || cleanId.includes('head_teacher')) {
        matched = users.find(u => u.role_name === 'head_teacher');
      } else if (cleanId === 'asst' || cleanId.includes('assistant')) {
        matched = users.find(u => u.role_name === 'assistant_head_teacher');
      } else if (cleanId === 'teacher' || cleanId.includes('teacher')) {
        matched = users.find(u => u.role_name === 'teacher');
      } else if (cleanId === 'student10' || cleanId.includes('10')) {
        matched = users.find(u => u.role_name === 'student' && u.class_name === '10');
      } else if (cleanId === 'student' || cleanId === 'student6' || cleanId.includes('student')) {
        matched = users.find(u => u.role_name === 'student' && u.class_name === '6');
      } else if (cleanId === 'guardian' || cleanId.includes('guardian')) {
        matched = users.find(u => u.role_name === 'guardian');
      } else if (cleanId === 'accountant') {
        matched = users.find(u => u.role_name === 'accountant');
      } else if (cleanId === 'librarian') {
        matched = users.find(u => u.role_name === 'librarian');
      } else if (cleanId === 'staff') {
        matched = users.find(u => u.role_name === 'staff');
      } else if (cleanId === 'admin' || cleanId.includes('admin')) {
        matched = users.find(u => u.role_name === 'super_admin');
      }
    }

    if (!matched) {
      matched = {
        id: 'u-custom',
        login_id: loginId,
        full_name: loginId.includes('student') ? 'মাহির আহমেদ (শিক্ষার্থী)' : loginId.includes('teacher') ? 'শিক্ষক ইউজার' : 'প্রশাসক ইউজার',
        role_name: loginId.includes('student') ? 'student' : loginId.includes('teacher') ? 'teacher' : loginId.includes('guardian') ? 'guardian' : 'super_admin',
        role_label: 'সিস্টেম ইউজার',
        is_active: true
      };
    }

    return {
      token: 'demo-jwt-token-' + Date.now(),
      user: matched
    };
  }

  if (cleanPath === '/auth/logout') {
    return { success: true };
  }

  if (cleanPath === '/me') {
    const rawUser = localStorage.getItem('magra_user');
    if (rawUser) {
      return JSON.parse(rawUser);
    }
    return MOCK_USERS[0];
  }

  if (cleanPath === '/portal/me') {
    const rawUser = localStorage.getItem('magra_user');
    const user = rawUser ? JSON.parse(rawUser) : MOCK_USERS[4];
    const students = getLocalStore('students', MOCK_STUDENTS);
    const routines = getLocalStore('routines', MOCK_ROUTINES);
    const exams = getLocalStore('exams', MOCK_EXAMS);
    const st = students.find(s => s.student_id === user.student_id) || students[0];

    return {
      user,
      student: st,
      students: [st],
      attendance: [
        { status: 'present', count: 48 },
        { status: 'absent', count: 2 },
        { status: 'late', count: 1 }
      ],
      results: [
        { id: 'r1', exam_name: 'অর্ধবার্ষিক মূল্যায়ন ২০২৬', subject_name: 'বাংলা', total: 88, grade: 'A+', gpa: 5.00 },
        { id: 'r2', exam_name: 'অর্ধবার্ষিক মূল্যায়ন ২০২৬', subject_name: 'ইংরেজি', total: 84, grade: 'A+', gpa: 5.00 },
        { id: 'r3', exam_name: 'অর্ধবার্ষিক মূল্যায়ন ২০২৬', subject_name: 'গণিত', total: 92, grade: 'A+', gpa: 5.00 },
        { id: 'r4', exam_name: 'অর্ধবার্ষিক মূল্যায়ন ২০২৬', subject_name: 'বিজ্ঞান', total: 80, grade: 'A+', gpa: 5.00 },
        { id: 'r5', exam_name: 'অর্ধবার্ষিক মূল্যায়ন ২০২৬', subject_name: 'আইসিটি', total: 46, grade: 'A+', gpa: 5.00 }
      ],
      finance: {
        billed: 3200,
        paid: 3200,
        due: 0
      },
      library: [
        { id: 'lib-1', title: 'বাংলা সাহিত্যের ইতিহাস', issued_at: '2026-02-10', due_at: '2026-03-10', returned_at: null }
      ],
      routine: routines.filter(r => r.class_name === (st.class_name || '6')),
      assignments: [
        { id: 'asgn-1', title_bn: 'বীজগণিতের সূত্রের প্রয়োগ ও বিশ্লেষণ', subject_name: 'গণিত', max_marks: 20, due_at: '2026-03-25T23:59:59Z', submission_id: null, description: 'অনুশীলনী ৩.১ এর ১ থেকে ১০ নম্বর সমস্যা সমাধান করে জমা দিতে হবে।' },
        { id: 'asgn-2', title_bn: 'স্বাধীনতার সুবর্ণজয়ন্তী ও বাংলাদেশের অর্জন', subject_name: 'বাংলাদেশ ও বিশ্বপরিচয়', max_marks: 25, due_at: '2026-03-28T23:59:59Z', submission_id: 'sub-1', marks: 23, teacher_feedback: 'উত্তম বিশ্লেষণ ও তথ্য উপস্থাপন।' }
      ],
      learning: [
        { id: 'lrn-1', class_name: st.class_name || '6', title_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি - অধ্যায় ১ ডিজিটাল ক্লাস লেকচার', subject_name: 'আইসিটি', content_type: 'video', body: 'ডিজিটাল প্রযুক্তির মৌলিক উপাদান ও কম্পিউটার নেটওয়ার্কের প্রাথমিক ধারণা।', content_url: 'https://www.youtube.com' },
        { id: 'lrn-2', class_name: st.class_name || '6', title_bn: 'সাধারণ বিজ্ঞান - সালোকসংশ্লেষণ প্রক্রিয়া পূর্ণাঙ্গ নোট', subject_name: 'বিজ্ঞান', content_type: 'pdf', body: 'উদ্ভিদে খাদ্য তৈরি ও সালোকসংশ্লেষণের আলোক ও অন্ধকার পর্যায়।', content_url: '' }
      ],
      onlineExams: [
        {
          id: 'ox-1',
          title_bn: 'আইসিটি ও ডিজিটাল প্রযুক্তি মডেল কুইজ',
          duration_minutes: 15,
          total_marks: 20,
          pass_marks: 10,
          attempt_status: 'pending',
          questions: [
            { question_id: 'q1', question_bn: 'নিচের কোনটি ইনপুট ডিভাইস?', options: ['মনিটর', 'কিবোর্ড', 'প্রিন্টার', 'স্পিকার'], answer: 'কিবোর্ড', marks: 5 },
            { question_id: 'q2', question_bn: 'কম্পিউটারের মস্তিষ্ক কাকে বলা হয়?', options: ['RAM', 'CPU', 'Hard Disk', 'Motherboard'], answer: 'CPU', marks: 5 },
            { question_id: 'q3', question_bn: 'মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়ের EIIN কত?', options: ['114290', '114291', '114292', '114293'], answer: '114290', marks: 5 },
            { question_id: 'q4', question_bn: 'HTTP এর পূর্ণরূপ কি?', options: ['HyperText Transfer Protocol', 'High Text Total Protocol', 'Hyperlink Test Protocol', 'Hyper Text Tool Program'], answer: 'HyperText Transfer Protocol', marks: 5 }
          ]
        }
      ],
      guardianSummary: [
        { student_id: st.id, total: 50, present: 48, absent: 2, late: 1, avg_marks: 86.5, avg_gpa: '5.00', passed: 5, failed: 0 }
      ],
      examSchedule: exams,
      notifications: [
        { id: 'notif-1', title_bn: '১ম সাময়িক পরীক্ষার চূড়ান্ত রুটিন প্রকাশিত', body: 'সকল শ্রেণির ১ম সাময়িক পরীক্ষা আগামী ১৫ এপ্রিল থেকে শুরু হবে। বিস্তারিত রুটিন সংগ্রহ করুন।', created_at: '2026-03-01T10:00:00Z', is_read: false },
        { id: 'notif-2', title_bn: 'ডিজিটাল ক্লাসরুম ও AI Tutor চালু', body: 'শিক্ষার্থীরা এখন থেকে ওয়েবসাইটে সরাসরি AI শিক্ষা সহকারীর সাথে পড়াশোনা সংক্রান্ত আলোচনা করতে পারবে।', created_at: '2026-03-02T12:30:00Z', is_read: true }
      ]
    };
  }

  // 2. Dashboard KPIs
  if (cleanPath === '/dashboard') {
    const students = getLocalStore('students', MOCK_STUDENTS);
    const teachers = getLocalStore('teachers', MOCK_TEACHERS);
    const notices = getLocalStore('notices', MOCK_NOTICES);
    return {
      students: students.length + 645,
      teachers: teachers.length + 16,
      notices: notices.length,
      users: 12
    };
  }

  // 3. Public & Admin features control
  const DEFAULT_FEATURES = [
    { feature_key: 'public.nav.home', label_bn: 'হোম', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.institution', label_bn: 'প্রাতিষ্ঠানিক তথ্য', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.sport', label_bn: 'ক্রীড়া ও সংস্কৃতি', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.staff', label_bn: 'শিক্ষক ও কর্মচারী', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.students', label_bn: 'শিক্ষার্থীর তথ্য', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.results', label_bn: 'পরীক্ষার ফলাফল', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.guide', label_bn: 'শিক্ষার্থীর গাইড', scope: 'public', group_name: 'মূল মেনু', enabled: true },
    { feature_key: 'public.nav.notice', label_bn: 'নোটিশ', scope: 'public', group_name: 'যোগাযোগ', enabled: true },
    { feature_key: 'public.nav.gallery', label_bn: 'গ্যালারি', scope: 'public', group_name: 'মিডিয়া', enabled: true },
    { feature_key: 'public.nav.contact', label_bn: 'যোগাযোগ', scope: 'public', group_name: 'যোগাযোগ', enabled: true },
    { feature_key: 'admin.dashboard', label_bn: 'ড্যাশবোর্ড', scope: 'admin', group_name: 'সারাংশ', enabled: true },
    { feature_key: 'admin.students', label_bn: 'শিক্ষার্থী ব্যবস্থাপনা', scope: 'admin', group_name: 'একাডেমিক', enabled: true },
    { feature_key: 'admin.staff', label_bn: 'শিক্ষক ও কর্মচারী', scope: 'admin', group_name: 'একাডেমিক', enabled: true },
    { feature_key: 'admin.admission', label_bn: 'ভর্তি ব্যবস্থাপনা', scope: 'admin', group_name: 'একাডেমিক', enabled: true },
    { feature_key: 'admin.attendance', label_bn: 'স্মার্ট উপস্থিতি', scope: 'admin', group_name: 'একাডেমিক', enabled: true },
    { feature_key: 'admin.results', label_bn: 'পরীক্ষা ও ফলাফল', scope: 'admin', group_name: 'একাডেমিক', enabled: true },
    { feature_key: 'admin.routine', label_bn: 'ক্লাস রুটিন', scope: 'admin', group_name: 'একাডেমিক', enabled: true },
    { feature_key: 'admin.finance', label_bn: 'ফি ও হিসাব', scope: 'admin', group_name: 'প্রশাসন', enabled: true },
    { feature_key: 'admin.library', label_bn: 'লাইব্রেরি', scope: 'admin', group_name: 'প্রশাসন', enabled: true },
    { feature_key: 'admin.learning', label_bn: 'ডিজিটাল লার্নিং', scope: 'admin', group_name: 'শিক্ষা', enabled: true },
    { feature_key: 'admin.question', label_bn: 'প্রশ্নব্যাংক', scope: 'admin', group_name: 'শিক্ষা', enabled: true },
    { feature_key: 'admin.assignment', label_bn: 'অ্যাসাইনমেন্ট', scope: 'admin', group_name: 'শিক্ষা', enabled: true },
    { feature_key: 'admin.online_exam', label_bn: 'অনলাইন পরীক্ষা', scope: 'admin', group_name: 'শিক্ষা', enabled: true },
    { feature_key: 'admin.ai', label_bn: 'AI শিক্ষা ও বিশ্লেষণ', scope: 'admin', group_name: 'শিক্ষা', enabled: true },
    { feature_key: 'admin.reports', label_bn: 'রিপোর্ট', scope: 'admin', group_name: 'রিপোর্ট ও ডকুমেন্ট', enabled: true },
    { feature_key: 'admin.documents', label_bn: 'ডকুমেন্ট ও প্রিন্ট', scope: 'admin', group_name: 'রিপোর্ট ও ডকুমেন্ট', enabled: true },
    { feature_key: 'admin.notice', label_bn: 'নোটিশ প্রকাশ', scope: 'admin', group_name: 'যোগাযোগ', enabled: true },
    { feature_key: 'admin.notifications', label_bn: 'নোটিফিকেশন পাঠান', scope: 'admin', group_name: 'যোগাযোগ', enabled: true },
    { feature_key: 'admin.users', label_bn: 'ইউজার ও রোল ব্যবস্থাপনা', scope: 'admin', group_name: 'নিরাপত্তা', enabled: true },
    { feature_key: 'admin.settings', label_bn: 'সেটিংস ও পাসওয়ার্ড', scope: 'admin', group_name: 'নিরাপত্তা', enabled: true },
    { feature_key: 'admin.content', label_bn: 'সহশিক্ষা ও অর্জন', scope: 'admin', group_name: 'কনটেন্ট ও সুবিধা', enabled: true },
    { feature_key: 'admin.transport', label_bn: 'পরিবহন', scope: 'admin', group_name: 'কনটেন্ট ও সুবিধা', enabled: true },
    { feature_key: 'admin.hostel', label_bn: 'হোস্টেল', scope: 'admin', group_name: 'কনটেন্ট ও সুবিধা', enabled: true }
  ];

  if (cleanPath === '/public/features' || cleanPath === '/admin/features') {
    const features = getLocalStore('features', DEFAULT_FEATURES);
    const custom = getLocalStore('custom_features', []);
    return { features, custom };
  }

  if (cleanPath.startsWith('/admin/features/') && method === 'PATCH') {
    const key = decodeURIComponent(cleanPath.replace('/admin/features/', ''));
    let features = getLocalStore('features', DEFAULT_FEATURES);
    features = features.map(f => f.feature_key === key ? { ...f, enabled: body.enabled } : f);
    setLocalStore('features', features);
    return { success: true };
  }

  if (cleanPath === '/admin/custom-features') {
    let custom = getLocalStore('custom_features', []);
    if (method === 'POST') {
      const newCustom = { id: 'cf-' + Date.now(), ...body };
      custom.push(newCustom);
      setLocalStore('custom_features', custom);
      return newCustom;
    }
    return custom;
  }

  if (cleanPath.startsWith('/admin/custom-features/') && method === 'DELETE') {
    const id = cleanPath.replace('/admin/custom-features/', '');
    let custom = getLocalStore('custom_features', []);
    custom = custom.filter(c => String(c.id) !== String(id));
    setLocalStore('custom_features', custom);
    return { success: true };
  }

  if (cleanPath === '/public/content' || cleanPath === '/content') {
    return getLocalStore('content', MOCK_PUBLIC_CONTENT);
  }

  if (cleanPath === '/public/student-stats') {
    return {
      total: 654,
      teachers: 24,
      religion: [
        { label: 'ইসলাম', count: 590 },
        { label: 'হিন্দু', count: 64 }
      ],
      gender: [
        { label: 'ছাত্র', count: 320 },
        { label: 'ছাত্রী', count: 334 }
      ],
      classes: [
        { label: '৬ষ্ঠ', count: 140 },
        { label: '৭ম', count: 135 },
        { label: '৮ম', count: 130 },
        { label: '৯ম', count: 125 },
        { label: '১০ম', count: 124 }
      ]
    };
  }

  if (cleanPath === '/public/contact') {
    const teachers = getLocalStore('teachers', MOCK_TEACHERS);
    const staff = getLocalStore('staff', MOCK_STAFF);
    const head = teachers.find(t => t && (t.public_contact_role === 'head_teacher' || t.designation?.includes('প্রধান শিক্ষক'))) || { name_bn: 'মুহাম্মদ শফিকুল ইসলাম', phone: '01712-345678', email: 'headteacher.magra@gmail.com', designation: 'প্রধান শিক্ষক' };
    const assistant = teachers.find(t => t && (t.public_contact_role === 'assistant_head_teacher' || t.designation?.includes('সহকারী প্রধান শিক্ষক'))) || { name_bn: 'তাপসী সরকার', phone: '01713-456789', email: 'assthead.magra@gmail.com', designation: 'সহকারী প্রধান শিক্ষক' };
    const ict = teachers.find(t => t && (t.public_contact_role === 'ict_teacher' || t.subject?.includes('আইসিটি') || t.designation?.includes('আইসিটি'))) || { name_bn: 'মুহাম্মদ আবুবকর সিদ্দিক', phone: '01714-567890', email: 'ict.magra@gmail.com', designation: 'সহকারী শিক্ষক (আইসিটি)' };
    const office = staff.find(s => s && (s.public_contact_role === 'office_assistant' || s.designation?.includes('অফিস'))) || { name_bn: 'মোঃ আলমগীর হোসেন', phone: '01722-345678', email: 'office.magra@gmail.com', designation: 'অফিস সহকারী' };
    return {
      contacts: [
        { key: 'head', role: 'প্রধান শিক্ষক', person: head },
        { key: 'assistant', role: 'সহকারী প্রধান শিক্ষক', person: assistant },
        { key: 'ict', role: 'আইসিটি শিক্ষক', person: ict },
        { key: 'office', role: 'অফিস সহকারী', person: office }
      ]
    };
  }

  // 4. Students
  if (cleanPath === '/students') {
    if (method === 'POST') {
      const allStudents = getLocalStore('students', MOCK_STUDENTS);
      const newSt = { 
        id: 'std_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), 
        student_id: body.student_id || ('STU-' + new Date().getFullYear() + '-' + String(allStudents.length + 1).padStart(4, '0')), 
        status: body.status || 'active',
        ...body 
      };
      allStudents.unshift(newSt);
      setLocalStore('students', allStudents);
      return newSt;
    }

    let students = getLocalStore('students', MOCK_STUDENTS);
    const q = params.get('q')?.trim().toLowerCase();
    const c = params.get('class_name');
    const sec = params.get('section');
    const st = params.get('status');
    const customKey = params.get('custom_field_key');
    const customVal = params.get('custom_field_value')?.trim().toLowerCase();

    if (q) {
      students = students.filter(s => {
        if (!s) return false;
        const haystack = [
          s.student_id,
          s.name_bn,
          s.name_en,
          s.roll_no,
          s.guardian_name,
          s.guardian_phone,
          s.father_name,
          s.mother_name,
          s.current_village,
          s.permanent_village,
          s.class_name,
          s.section,
          s.birth_registration_no,
          s.student_nid_no
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }
    if (c) {
      students = students.filter(s => s && String(s.class_name) === String(c));
    }
    if (sec) {
      students = students.filter(s => s && String(s.section || '').toLowerCase() === String(sec).toLowerCase());
    }
    if (st) {
      students = students.filter(s => s && s.status === st);
    }
    if (customKey && customVal) {
      students = students.filter(s => {
        const val = s?.extended_profile?.custom_fields?.[customKey];
        return val && String(val).toLowerCase().includes(customVal);
      });
    }
    return students;
  }

  if (cleanPath.startsWith('/students/') && !cleanPath.includes('village-wise')) {
    const id = cleanPath.replace('/students/', '');
    let students = getLocalStore('students', MOCK_STUDENTS);
    if (method === 'PUT') {
      students = students.map(s => String(s.id) === String(id) ? { ...s, ...body } : s);
      setLocalStore('students', students);
      return { success: true };
    }
    if (method === 'DELETE') {
      students = students.filter(s => String(s.id) !== String(id));
      setLocalStore('students', students);
      return { success: true };
    }
  }

  if (cleanPath === '/students/bulk-import') {
    const list = body.students || [];
    let students = getLocalStore('students', MOCK_STUDENTS);
    const added = list.map((st, i) => ({ id: 'std_' + (Date.now() + i), status: st.status || 'active', ...st }));
    students = [...added, ...students];
    setLocalStore('students', students);
    return { success: true, count: added.length, message: `${added.length} জন শিক্ষার্থী সফলভাবে ইমপোর্ট হয়েছে` };
  }

  // 5. Voter List
  if (cleanPath === '/voter-list') {
    const q = (params.get('q') || '').trim().toLowerCase();
    let students = getLocalStore('students', MOCK_STUDENTS);
    if (q) {
      students = students.filter(s =>
        s && (s.current_village || s.permanent_village || '').toLowerCase().includes(q)
      );
    }
    return students.map((s, idx) => ({
      id: s.id,
      voter_no: s.voter_no || ('V-' + (idx + 101)),
      voter_name: s.voter_name || (s.father_name && !s.father_name.includes('মৃত') ? s.father_name : s.mother_name || s.guardian_name || s.name_bn),
      name_bn: s.name_bn,
      name_en: s.name_en,
      class_name: s.class_name,
      father_name: s.father_name,
      mother_name: s.mother_name,
      current_village: s.current_village || 'মগড়া',
      current_upazila: s.current_upazila || 'কালিহাতি',
      current_district: s.current_district || 'টাঙ্গাইল',
      permanent_village: s.permanent_village || 'মগড়া',
      permanent_upazila: s.permanent_upazila || 'কালিহাতি',
      permanent_district: s.permanent_district || 'টাঙ্গাইল'
    }));
  }

  if (cleanPath.startsWith('/voter-list/')) {
    const id = cleanPath.replace('/voter-list/', '');
    let students = getLocalStore('students', MOCK_STUDENTS);
    students = students.map(s => String(s.id) === String(id) ? { ...s, ...body, voter_name: body.voter_name_override || s.voter_name } : s);
    setLocalStore('students', students);
    return { success: true };
  }

  // 6. Village Wise Students
  if (cleanPath === '/students/village-wise') {
    const v = (params.get('village') || '').trim();
    const students = getLocalStore('students', MOCK_STUDENTS);
    const matched = students.filter(s =>
      s && (!v || (s.current_village || '').includes(v) || (s.permanent_village || '').includes(v))
    );
    const groups = { '6': [], '7': [], '8': [], '9': [], '10': [] };
    matched.forEach(s => {
      const c = String(s.class_name);
      if (groups[c]) groups[c].push(s);
    });
    return {
      village: v || 'সকল গ্রাম',
      count: matched.length,
      groups
    };
  }

  // 7. Teachers & Staff
  if (cleanPath === '/teachers') {
    if (method === 'POST') {
      const allTeachers = getLocalStore('teachers', MOCK_TEACHERS);
      const newT = { 
        id: 'tch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), 
        employee_id: body.employee_id || ('EMP-' + String(allTeachers.length + 1).padStart(3, '0')), 
        status: body.status || 'active',
        ...body 
      };
      allTeachers.unshift(newT);
      setLocalStore('teachers', allTeachers);
      return newT;
    }

    let teachers = getLocalStore('teachers', MOCK_TEACHERS);
    const q = params.get('q')?.trim().toLowerCase();
    const st = params.get('status');
    const customKey = params.get('custom_field_key');
    const customVal = params.get('custom_field_value')?.trim().toLowerCase();

    if (q) {
      teachers = teachers.filter(t => {
        if (!t) return false;
        const haystack = [
          t.employee_id,
          t.name_bn,
          t.name_en,
          t.designation,
          t.designation_en,
          t.subject,
          t.phone,
          t.email,
          t.nid_no,
          t.teacher_portal_id,
          t.teacher_registration_no,
          t.mpo_index_no
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }
    if (st) {
      teachers = teachers.filter(t => t && t.status === st);
    }
    if (customKey && customVal) {
      teachers = teachers.filter(t => {
        const val = t?.extended_profile?.custom_fields?.[customKey];
        return val && String(val).toLowerCase().includes(customVal);
      });
    }
    return teachers;
  }

  if (cleanPath.startsWith('/teachers/')) {
    const id = cleanPath.replace('/teachers/', '');
    let teachers = getLocalStore('teachers', MOCK_TEACHERS);
    if (method === 'PUT') {
      teachers = teachers.map(t => String(t.id) === String(id) ? { ...t, ...body } : t);
      setLocalStore('teachers', teachers);
      return { success: true };
    }
    if (method === 'DELETE') {
      teachers = teachers.filter(t => String(t.id) !== String(id));
      setLocalStore('teachers', teachers);
      return { success: true };
    }
  }

  if (cleanPath === '/teachers/bulk-import') {
    const list = body.people || [];
    let teachers = getLocalStore('teachers', MOCK_TEACHERS);
    const added = list.map((p, i) => ({ id: 'tch_' + (Date.now() + i), status: p.status || 'active', ...p }));
    teachers = [...added, ...teachers];
    setLocalStore('teachers', teachers);
    return { success: true, count: added.length, message: `${added.length} জন শিক্ষক সফলভাবে ইমপোর্ট হয়েছে` };
  }

  if (cleanPath === '/staff') {
    if (method === 'POST') {
      const allStaff = getLocalStore('staff', MOCK_STAFF);
      const newStf = { 
        id: 'stf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), 
        employee_id: body.employee_id || ('STF-' + String(allStaff.length + 1).padStart(3, '0')), 
        status: body.status || 'active',
        ...body 
      };
      allStaff.unshift(newStf);
      setLocalStore('staff', allStaff);
      return newStf;
    }

    let staff = getLocalStore('staff', MOCK_STAFF);
    const q = params.get('q')?.trim().toLowerCase();
    const st = params.get('status');
    const customKey = params.get('custom_field_key');
    const customVal = params.get('custom_field_value')?.trim().toLowerCase();

    if (q) {
      staff = staff.filter(s => {
        if (!s) return false;
        const haystack = [
          s.employee_id,
          s.name_bn,
          s.name_en,
          s.designation,
          s.phone,
          s.email,
          s.nid_no
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }
    if (st) {
      staff = staff.filter(s => s && s.status === st);
    }
    if (customKey && customVal) {
      staff = staff.filter(s => {
        const val = s?.extended_profile?.custom_fields?.[customKey];
        return val && String(val).toLowerCase().includes(customVal);
      });
    }
    return staff;
  }

  if (cleanPath.startsWith('/staff/')) {
    const id = cleanPath.replace('/staff/', '');
    let staff = getLocalStore('staff', MOCK_STAFF);
    if (method === 'PUT') {
      staff = staff.map(s => String(s.id) === String(id) ? { ...s, ...body } : s);
      setLocalStore('staff', staff);
      return { success: true };
    }
    if (method === 'DELETE') {
      staff = staff.filter(s => String(s.id) !== String(id));
      setLocalStore('staff', staff);
      return { success: true };
    }
  }

  if (cleanPath === '/staff/bulk-import') {
    const list = body.people || [];
    let staff = getLocalStore('staff', MOCK_STAFF);
    const added = list.map((p, i) => ({ id: 'stf_' + (Date.now() + i), status: p.status || 'active', ...p }));
    staff = [...added, ...staff];
    setLocalStore('staff', staff);
    return { success: true, count: added.length, message: `${added.length} জন কর্মচারী সফলভাবে ইমপোর্ট হয়েছে` };
  }

  // 8. Notices
  if (cleanPath === '/notices') {
    let notices = getLocalStore('notices', MOCK_NOTICES);
    if (method === 'POST') {
      const newNotice = { id: Date.now(), notice_date: new Date().toISOString().slice(0, 10), ...body };
      notices.unshift(newNotice);
      setLocalStore('notices', notices);
      return newNotice;
    }
    return notices;
  }

  // 9. Exams & Subjects
  if (cleanPath === '/exams') {
    return getLocalStore('exams', MOCK_EXAMS);
  }

  if (cleanPath === '/subjects') {
    return getLocalStore('subjects', MOCK_SUBJECTS);
  }

  if (cleanPath.startsWith('/exams/') && cleanPath.endsWith('/subjects')) {
    return getLocalStore('subjects', MOCK_SUBJECTS);
  }

  // 10. Routines
  if (cleanPath === '/routines') {
    let routines = getLocalStore('routines', MOCK_ROUTINES);
    if (method === 'POST') {
      const newR = { id: 'r-' + Date.now(), ...body };
      routines.push(newR);
      setLocalStore('routines', routines);
      return newR;
    }
    return routines;
  }

  // 11. Attendance
  if (cleanPath === '/attendance/roster') {
    const students = getLocalStore('students', MOCK_STUDENTS);
    const c = params.get('class_name') || '6';
    const classStudents = students.filter(s => String(s.class_name) === String(c));
    return classStudents.map(s => ({
      id: s.id,
      student_id: s.student_id,
      name_bn: s.name_bn,
      roll_no: s.roll_no,
      status: 'present'
    }));
  }

  if (cleanPath === '/attendance/bulk' && method === 'POST') {
    return { count: (body.records || []).length, message: 'উপস্থিতি সফলভাবে সংরক্ষিত হয়েছে' };
  }

  // 12. Finance
  if (cleanPath === '/finance/summary') {
    return { billed: 320000, paid: 285000, due: 35000, expense: 64900 };
  }
  if (cleanPath === '/finance/fees') {
    return getLocalStore('fees', MOCK_FEES);
  }
  if (cleanPath === '/finance/expenses') {
    return getLocalStore('expenses', MOCK_EXPENSES);
  }
  if (cleanPath === '/finance/fees' && method === 'POST') {
    const fees = getLocalStore('fees', MOCK_FEES);
    const newFee = { id: 'f-' + Date.now(), ...body, paid_amount: 0, status: 'unpaid' };
    fees.unshift(newFee);
    setLocalStore('fees', fees);
    return newFee;
  }
  if (cleanPath === '/finance/payments' && method === 'POST') {
    const fees = getLocalStore('fees', MOCK_FEES);
    const updated = fees.map(f => f.id === body.fee_id ? { ...f, paid_amount: f.amount, status: 'paid' } : f);
    setLocalStore('fees', updated);
    return { success: true };
  }

  // 13. Library
  if (cleanPath === '/library/books') {
    let books = getLocalStore('books', MOCK_BOOKS);
    if (method === 'POST') {
      const newBook = { id: 'b-' + Date.now(), available_quantity: body.quantity || 1, ...body };
      books.unshift(newBook);
      setLocalStore('books', books);
      return newBook;
    }
    return books;
  }
  if (cleanPath === '/library/loans') {
    return [
      { id: 'l-1', book_title: 'আমার বন্ধু রাশেদ', student_name: 'মাহির আহমেদ', student_id: 'STU-2026-0601', due_date: '2026-02-28', status: 'issued' }
    ];
  }

  // 14. Admissions
  if (cleanPath === '/admissions') {
    return getLocalStore('admissions', MOCK_ADMISSIONS);
  }
  if (cleanPath === '/admissions/summary') {
    return { total: 45, submitted: 8, under_review: 12, selected: 15, admitted: 10 };
  }

  // 15. Scholarships
  if (cleanPath === '/scholarships') {
    return getLocalStore('scholarships', MOCK_SCHOLARSHIPS);
  }

  // 16. Documents
  if (cleanPath.startsWith('/documents/student/')) {
    const type = params.get('type') || 'id_card';
    const students = getLocalStore('students', MOCK_STUDENTS);
    const st = students[0];
    return {
      school: MOCK_SCHOOL,
      student: st,
      exam: MOCK_EXAMS[0],
      summary: { total_marks: 568, full_marks: 650, percentage: '87.38', gpa: '5.00', result_status: 'PASSED' },
      marks: [
        { subject_name: 'বাংলা', full_marks: 100, written: 72, mcq: 18, practical: 0, total: 90, grade: 'A+', gpa: '5.00' },
        { subject_name: 'ইংরেজি', full_marks: 100, written: 84, mcq: 0, practical: 0, total: 84, grade: 'A+', gpa: '5.00' },
        { subject_name: 'গণিত', full_marks: 100, written: 68, mcq: 26, practical: 0, total: 94, grade: 'A+', gpa: '5.00' },
        { subject_name: 'বিজ্ঞান', full_marks: 100, written: 58, mcq: 22, practical: 0, total: 80, grade: 'A+', gpa: '5.00' },
        { subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', full_marks: 50, written: 25, mcq: 20, practical: 0, total: 45, grade: 'A+', gpa: '5.00' }
      ],
      list: students.map((s, i) => ({
        merit: i + 1,
        roll_no: s.roll_no,
        name_bn: s.name_bn,
        subjects: 5,
        total_marks: 480 - i * 15,
        gpa: (5.00 - i * 0.2).toFixed(2),
        result_status: 'PASSED'
      }))
    };
  }
  if (cleanPath === '/documents/issued') {
    return [
      { id: 'doc-1', document_no: 'ID-2026-0601', issue_date: '2026-01-10', document_type: 'id_card', name_bn: 'মাহির আহমেদ' },
      { id: 'doc-2', document_no: 'CERT-2025-1001', issue_date: '2025-12-28', document_type: 'commendation_certificate', name_bn: 'সাকিব আল হাসান' }
    ];
  }

  // 17. Reports
  if (cleanPath === '/reports/overview') {
    return {
      students: { active: 654 },
      teachers: { active: 24 },
      attendance: { present: 598, absent: 42, late: 14, total: 654 },
      finance: { collected: 285000, due: 35000, expense: 64900 },
      library: { outstanding: 18 },
      results: { avg_marks: 78.4, below_pass: 4 },
      admission: { total: 45, admitted: 10 }
    };
  }
  if (cleanPath.startsWith('/reports/')) {
    return [
      { attendance_date: '2026-02-01', total: 654, present: 610, absent: 34, late: 10, rate: 93.2 },
      { attendance_date: '2026-02-02', total: 654, present: 618, absent: 28, late: 8, rate: 94.5 },
      { attendance_date: '2026-02-03', total: 654, present: 622, absent: 24, late: 8, rate: 95.1 },
      { attendance_date: '2026-02-04', total: 654, present: 605, absent: 39, late: 10, rate: 92.5 }
    ];
  }

  // 18. AI education assistant
  if (cleanPath === '/ai/conversations' && method === 'POST') {
    return { id: 'conv-' + Date.now(), title: body.title || 'AI Tutor আলোচনা' };
  }
  if (cleanPath.includes('/ai/conversations/') && cleanPath.endsWith('/messages') && method === 'POST') {
    const userMsg = body.message || '';
    let reply = 'মগড়া স্কুলের AI শিক্ষা সহকারী: ';
    if (userMsg.includes('রুটিন') || userMsg.includes('পড়া')) {
      reply += 'দৈনিক পড়াশোনার জন্য নির্দিষ্ট রুটিন তৈরি করা গুরুত্বপূর্ণ। প্রতিদিন গণিত ও বিজ্ঞানের জন্য অন্তত ১.৫ ঘণ্টা এবং ভাষা শিক্ষার জন্য ১ ঘণ্টা সময় বরাদ্দ রাখুন।';
    } else if (userMsg.includes('গণিত') || userMsg.includes('সূত্র')) {
      reply += 'বীজগণিতের সাধারণ সূত্রাবলি: (a+b)² = a² + 2ab + b², (a-b)² = a² - 2ab + b²। কোনো নির্দিষ্ট সমস্যায় সহায়তা লাগলে বলুন।';
    } else {
      reply += `আপনার প্রশ্নের উত্তর তৈরি করা হচ্ছে। নিয়মিত ক্লাস নোট ও পাঠ্যবইয়ের অধ্যায় অনুশীলনের মাধ্যমে প্রস্তুতি আরও দৃঢ় করুন। প্রশ্ন: "${userMsg}"`;
    }
    return { role: 'assistant', message: reply };
  }

  if (cleanPath === '/ai/student-insights') {
    return {
      attendance: { rate: 94.2, absent: 3 },
      weakSubjects: [
        { subject_name: 'উচ্চতর গণিত', avg_marks: 62 },
        { subject_name: 'ইংরেজি ২য় পত্র', avg_marks: 68 }
      ],
      tips: [
        'ত্রিকোণমিতি ও জ্যামিতির অনুশীলনীতে আরও বেশি সময় দিন।',
        'ইংরেজি Grammar ও Vocabulary প্রতিদিন ৩০ মিনিট চর্চা করুন।',
        'আসন্ন ১ম সাময়িক পরীক্ষার আগে মডেল টেস্ট সমাধান করুন।'
      ]
    };
  }

  if (cleanPath === '/ai/study-plans') {
    return {
      plan_json: [
        { day: '১', subject: 'গণিত', focus: 'বীজগণিত অনুশীলনী ৩.১ ও ৩.২', minutes: 60 },
        { day: '২', subject: 'বিজ্ঞান', focus: 'পদার্থবিজ্ঞান অধ্যায় ২ (গতি)', minutes: 50 },
        { day: '৩', subject: 'ইংরেজি', focus: 'Grammar: Right Form of Verbs', minutes: 45 },
        { day: '৪', subject: 'আইসিটি', focus: 'HTML ও ওয়েব পেজ ডিজাইন', minutes: 40 },
        { day: '৫', subject: 'বাংলা', focus: 'বাংলা সাহিত্য কবিতা ও সৃজনশীল প্রশ্ন', minutes: 45 }
      ]
    };
  }

  // 19. Form fields
  if (cleanPath === '/admin/form-fields') {
    return [];
  }

  // 20. Users list
  // 22. Online Exam actions
  if (cleanPath === '/online-exams') {
    return [
      { id: 'ox-1', title_bn: 'আইসিটি ও ডিজিটাল প্রযুক্তি মডেল কুইজ', class_name: '6', duration_minutes: 15, total_marks: 20, pass_marks: 10, status: 'active' },
      { id: 'ox-2', title_bn: 'সাধারণ বিজ্ঞান মডেল টেস্ট', class_name: '6', duration_minutes: 20, total_marks: 25, pass_marks: 12, status: 'active' }
    ];
  }
  if (cleanPath.startsWith('/online-exams/') && cleanPath.endsWith('/start')) {
    return {
      attempt: { id: 'att-' + Date.now() },
      exam: { id: 'ox-1', title_bn: 'আইসিটি ও ডিজিটাল প্রযুক্তি মডেল কুইজ', duration_minutes: 15, total_marks: 20 },
      questions: [
        { question_id: 'q1', question_bn: 'নিচের কোনটি ইনপুট ডিভাইস?', options: ['মনিটর', 'কিবোর্ড', 'প্রিন্টার', 'স্পিকার'], marks: 5 },
        { question_id: 'q2', question_bn: 'কম্পিউটারের মস্তিষ্ক কাকে বলা হয়?', options: ['RAM', 'CPU', 'Hard Disk', 'Motherboard'], marks: 5 },
        { question_id: 'q3', question_bn: 'মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়ের EIIN কত?', options: ['114290', '114291', '114292', '114293'], marks: 5 },
        { question_id: 'q4', question_bn: 'HTTP এর পূর্ণরূপ কি?', options: ['HyperText Transfer Protocol', 'High Text Total Protocol', 'Hyperlink Test Protocol', 'Hyper Text Tool Program'], marks: 5 }
      ]
    };
  }
  if (cleanPath.includes('/online-exams/attempts/') && cleanPath.endsWith('/submit')) {
    return { score: 20, passed: true, message: 'পরীক্ষা সফলভাবে জমা হয়েছে' };
  }
  // 20. Users & Admin Management CRUD
  if (cleanPath === '/users') {
    let users = getLocalStore('users', MOCK_USERS);
    if (method === 'POST') {
      const roleLabels = {
        super_admin: 'সুপার অ্যাডমিন',
        admin: 'অ্যাডমিন',
        head_teacher: 'প্রধান শিক্ষক',
        assistant_head_teacher: 'সহকারী প্রধান শিক্ষক',
        teacher: 'সহকারী শিক্ষক',
        accountant: 'হিসাবরক্ষক',
        librarian: 'গ্রন্থাগারিক',
        staff: 'অফিস সহকারী',
        student: 'শিক্ষার্থী',
        guardian: 'অভিভাবক'
      };
      const roleName = body.role || body.role_name || 'admin';
      const newUser = {
        id: 'u-' + Date.now(),
        login_id: (body.login_id || '').trim(),
        full_name: (body.full_name || '').trim(),
        password: body.password || '12345678',
        role_name: roleName,
        role_label: roleLabels[roleName] || 'ব্যবহারকারী',
        is_active: true,
        email: body.email || '',
        phone: body.phone || '',
        created_at: new Date().toISOString()
      };
      users.unshift(newUser);
      setLocalStore('users', users);
      return newUser;
    }
    return users;
  }

  if (cleanPath.startsWith('/users/') && !cleanPath.includes('reset-password') && !cleanPath.includes('invalidate-sessions')) {
    const id = cleanPath.replace('/users/', '');
    let users = getLocalStore('users', MOCK_USERS);
    if (method === 'PATCH' || method === 'PUT') {
      const roleLabels = {
        super_admin: 'সুপার অ্যাডমিন',
        admin: 'অ্যাডমিন',
        head_teacher: 'প্রধান শিক্ষক',
        assistant_head_teacher: 'সহকারী প্রধান শিক্ষক',
        teacher: 'সহকারী শিক্ষক',
        accountant: 'হিসাবরক্ষক',
        librarian: 'গ্রন্থাগারিক',
        staff: 'অফিস সহকারী',
        student: 'শিক্ষার্থী',
        guardian: 'অভিভাবক'
      };
      users = users.map(u => {
        if (String(u.id) === String(id)) {
          const roleName = body.role || body.role_name || u.role_name;
          return {
            ...u,
            ...body,
            role_name: roleName,
            role_label: roleLabels[roleName] || u.role_label || 'ব্যবহারকারী'
          };
        }
        return u;
      });
      setLocalStore('users', users);
      return { success: true, message: 'ব্যবহারকারীর তথ্য সংরক্ষিত হয়েছে' };
    }
    if (method === 'DELETE') {
      users = users.filter(u => String(u.id) !== String(id));
      setLocalStore('users', users);
      return { success: true, message: 'ব্যবহারকারী মুছে ফেলা হয়েছে' };
    }
  }

  if (cleanPath.includes('/users/') && cleanPath.endsWith('/reset-password') && method === 'POST') {
    const id = cleanPath.replace('/users/', '').replace('/reset-password', '');
    let users = getLocalStore('users', MOCK_USERS);
    const nextPassword = body.newPassword || body.password || '12345678';
    users = users.map(u => String(u.id) === String(id) ? { ...u, password: nextPassword } : u);
    setLocalStore('users', users);
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে।' };
  }

  if (cleanPath === '/auth/change-password' && method === 'POST') {
    const rawUser = localStorage.getItem('magra_user');
    const curUser = rawUser ? JSON.parse(rawUser) : null;
    if (curUser) {
      let users = getLocalStore('users', MOCK_USERS);
      users = users.map(u => String(u.id) === String(curUser.id) ? { ...u, password: body.newPassword } : u);
      setLocalStore('users', users);
    }
    return { success: true, message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।' };
  }

  if (cleanPath === '/portal/links') {
    return [
      { id: 'link-1', guardian_name: 'রফিকুল ইসলাম', guardian_login: 'pilot-guardian-01', student_name: 'মাহির আহমেদ', student_code: 'STU-2026-0601', class_name: '6', roll_no: 1, relation: 'পিতা' }
    ];
  }

  // Default fallback
  return [];
}
