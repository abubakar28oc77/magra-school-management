export function parseEmployeeIdNum(empId, fallback = 999999) {
  if (empId === null || empId === undefined || empId === '') return fallback;
  const bnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const s = String(empId).replace(/[০-৯]/g, d => bnMap[d]);
  const matches = s.match(/\d+/g);
  if (matches && matches.length) {
    const num = parseInt(matches[matches.length - 1], 10);
    return isNaN(num) ? fallback : num;
  }
  return fallback;
}

export function sortPeopleByEmployeeId(list = []) {
  return [...(list || [])].sort((a, b) => {
    const na = parseEmployeeIdNum(a?.employee_id || a?.id);
    const nb = parseEmployeeIdNum(b?.employee_id || b?.id);
    if (na !== nb) return na - nb;
    return String(a?.employee_id || a?.name_bn || '').localeCompare(String(b?.employee_id || b?.name_bn || ''), undefined, { numeric: true });
  });
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

export function sortStudentsList(list) {
  if (!Array.isArray(list)) return [];
  const bnDigits = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
  const parseNum = (val) => {
    if (!val) return 99999;
    const str = String(val).trim();
    const converted = str.split('').map(ch => bnDigits[ch] !== undefined ? bnDigits[ch] : ch).join('');
    const m = converted.match(/\d+/);
    return m ? parseInt(m[0], 10) : 99999;
  };

  return [...list].sort((a, b) => {
    const ca = parseNum(a.class_name);
    const cb = parseNum(b.class_name);
    if (ca !== cb) return ca - cb;

    if (ca === 9 || ca === 10 || String(a.class_name).includes('9') || String(a.class_name).includes('10') || String(a.class_name).includes('৯') || String(a.class_name).includes('১০')) {
      const pa = getStudentGroupPriority(a);
      const pb = getStudentGroupPriority(b);
      if (pa !== pb) return pa - pb;
    }

    const ra = parseNum(a.roll_no);
    const rb = parseNum(b.roll_no);
    if (ra !== rb) return ra - rb;

    return String(a.student_id || a.name_bn || '').localeCompare(String(b.student_id || b.name_bn || ''));
  });
}

import {
  MOCK_SCHOOL,
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_STAFF,
  MOCK_COMMITTEE,
  DEFAULT_ACADEMIC_YEARS,
  MOCK_NOTICES,
  MOCK_EXAMS,
  MOCK_SUBJECTS,
  MOCK_ROUTINES,
  MOCK_FEES,
  MOCK_EXPENSES,
  MOCK_BOOKS,
  MOCK_ADMISSIONS,
  getStudentPhoto,
  MOCK_SCHOLARSHIPS,
  MOCK_PUBLIC_CONTENT,
  MOCK_SSC_RESULTS,
  CANONICAL_TEACHER_EDUCATION
} from './mockData.js';
import { getSupabaseConfig, supabaseRequest } from './supabaseClient.js';
import { processClassResults, generateResultAnalytics } from './boardExamEngine.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Purge legacy mock staff from localStorage on startup
try {
  const rawStaff = JSON.parse(localStorage.getItem('magra_db_staff') || '[]');
  if (Array.isArray(rawStaff)) {
    const cleaned = rawStaff.filter(s => {
      if (!s) return false;
      const isMock = s.id === 's-1' || s.id === 's-2' || s.id === 's-3' || 
                     s.employee_id === 'STF-2001' || s.employee_id === 'STF-2002' || s.employee_id === 'STF-2003' ||
                     (s.name_bn && (s.name_bn.includes('জালাল উদ্দিন') || s.name_bn.includes('জহিরুল ইসলাম')));
      return !isMock;
    });
    if (cleaned.length !== rawStaff.length) {
      localStorage.setItem('magra_db_staff', JSON.stringify(cleaned));
    }
  }
} catch {}

// Purge deleted/legacy exams from localStorage on startup
try {
  const rawExams = JSON.parse(localStorage.getItem('magra_db_exams') || '[]');
  if (Array.isArray(rawExams)) {
    const cleaned = rawExams.filter(e => {
      if (!e) return false;
      const bn = e.name_bn || '';
      const en = e.name_en || '';
      const rem = e.remarks || '';
      const isTarget = e.id === 'ex-annual-2026' || e.id === 'ex-test-2026' ||
                       bn.includes('নির্বাচনি পরীক্ষা ২০২৬') || bn.includes('নির্বাচনী পরীক্ষা ২০২৬') ||
                       bn.includes('বার্ষিক পরীক্ষা ২০২৬') ||
                       en.includes('SSC Test Examination 2026') || en.includes('Annual Examination 2026') ||
                       rem.includes('১০ম শ্রেণির এসএসসি টেস্ট') || rem.includes('বার্ষিক চূড়ান্ত ও প্রমোশন পরীক্ষা');
      return !isTarget;
    });
    if (cleaned.length !== rawExams.length) {
      localStorage.setItem('magra_db_exams', JSON.stringify(cleaned));
    }
  }
} catch {}

// Religion normalization helper
export function normalizeReligion(raw) {
  if (!raw || typeof raw !== 'string') return 'ইসলাম';
  const val = raw.trim().toLowerCase();
  if (!val) return 'ইসলাম';
  
  if (val.includes('ইসলাম') || val.includes('islam') || val.includes('মুসলিম') || val.includes('muslim') || val.includes('mus')) {
    return 'ইসলাম';
  }
  if (val.includes('হিন্দু') || val.includes('hindu') || val.includes('সনাতন') || val.includes('sanatan') || val.includes('hin')) {
    return 'হিন্দু';
  }
  if (val.includes('বৌদ্ধ') || val.includes('buddhist') || val.includes('buddhism') || val.includes('bouddho') || val.includes('buddha')) {
    return 'বৌদ্ধ';
  }
  if (val.includes('খ্রিষ্টান') || val.includes('খ্রিস্টান') || val.includes('christian') || val.includes('christianity') || val.includes('isai')) {
    return 'খ্রিষ্টান';
  }
  if (val.includes('অন্যান্য') || val.includes('other')) {
    return 'অন্যান্য';
  }
  return raw.trim();
}

// Fast lookup map for authentic mock students
const mockMap = new Map();
MOCK_STUDENTS.forEach(s => {
  if (!s) return;
  if (s.student_id) mockMap.set(String(s.student_id).toLowerCase().trim(), s);
  if (s.id) mockMap.set(String(s.id).toLowerCase().trim(), s);
  if (s.roll_no && s.name_bn) {
    mockMap.set(`${s.class_name || '10'}_${s.roll_no}_${(s.name_bn || '').trim()}`, s);
  }
  if (s.roll_no && (s.department || s.group_name)) {
    mockMap.set(`${s.class_name || '10'}_${s.roll_no}_${(s.department || s.group_name || '').trim().toLowerCase()}`, s);
  }
});

export function enrichStudentProfile(s) {
  if (!s || typeof s !== 'object') return s;
  
  const currentVill = s.current_village !== undefined ? s.current_village : '';
  const currentPost = s.current_post_office !== undefined ? s.current_post_office : '';
  const currentUp = s.current_upazila !== undefined ? s.current_upazila : '';
  const currentDist = s.current_district !== undefined ? s.current_district : '';
  const permVill = s.permanent_village !== undefined ? s.permanent_village : currentVill;
  const permPost = s.permanent_post_office !== undefined ? s.permanent_post_office : currentPost;
  const permUp = s.permanent_upazila !== undefined ? s.permanent_upazila : currentUp;
  const permDist = s.permanent_district !== undefined ? s.permanent_district : currentDist;
  
  const addressParts = [
    currentVill ? `গ্রাম: ${currentVill}` : '',
    currentPost ? `ডাকঘর: ${currentPost}` : '',
    currentUp ? `উপজেলা: ${currentUp}` : '',
    currentDist ? `জেলা: ${currentDist}` : ''
  ].filter(Boolean);
  const defaultAddress = addressParts.length ? addressParts.join(', ') : (s.address || '');

  const c = s.class_name ? String(s.class_name).replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d) : '10';
  const isSSC = ['9', '10'].includes(c);

  let canonicalDept = 'সাধারণ';
  let canonicalGroup = 'সাধারণ';

  if (isSSC) {
    const sid = String(s.student_id || s.id || '').toUpperCase();
    if (sid.includes('-HUM') || sid.includes('_HUM') || sid.includes('/HUM') || sid.includes('HUM-') || sid.includes('-ARTS-')) {
      canonicalDept = 'মানবিক';
    } else if (sid.includes('-BS') || sid.includes('_BS') || sid.includes('/BS') || sid.includes('BS-') || sid.includes('-COM-') || sid.includes('-BUS-')) {
      canonicalDept = 'ব্যবসায় শিক্ষা';
    } else if (sid.includes('-SCI') || sid.includes('_SCI') || sid.includes('/SCI') || sid.includes('SCI-')) {
      canonicalDept = 'বিজ্ঞান';
    } else {
      const explicitDept = String(s.department || '').trim().toLowerCase();
      if (explicitDept.includes('মানবিক') || explicitDept.includes('humanities') || explicitDept.includes('arts')) {
        canonicalDept = 'মানবিক';
      } else if (explicitDept.includes('ব্যবসা') || explicitDept.includes('ব্যবসায়') || explicitDept.includes('ব্যবসায়') || explicitDept.includes('বাণিজ্য') || explicitDept.includes('business') || explicitDept.includes('commerce') || explicitDept === 'bs') {
        canonicalDept = 'ব্যবসায় শিক্ষা';
      } else if (explicitDept.includes('বিজ্ঞান') || explicitDept.includes('science') || explicitDept === 'sci') {
        canonicalDept = 'বিজ্ঞান';
      } else {
        const grp = String(s.group_name || s.group || s.section || '').trim().toLowerCase();
        if (grp.includes('মানবিক') || grp.includes('humanities') || grp.includes('arts')) {
          canonicalDept = 'মানবিক';
        } else if (grp.includes('ব্যবসা') || grp.includes('ব্যবসায়') || grp.includes('ব্যবসায়') || grp.includes('বাণিজ্য') || grp.includes('business') || grp.includes('commerce') || grp === 'bs') {
          canonicalDept = 'ব্যবসায় শিক্ষা';
        } else {
          canonicalDept = 'বিজ্ঞান';
        }
      }
    }
    canonicalGroup = canonicalDept === 'বিজ্ঞান' ? 'বিজ্ঞান বিভাগ' : canonicalDept === 'মানবিক' ? 'মানবিক বিভাগ' : 'ব্যবসায় শিক্ষা শাখা';
  }

  const cleanSection = isSSC
    ? canonicalGroup
    : (s.section && !['বিজ্ঞান', 'মানবিক', 'ব্যবসায়'].some(d => String(s.section).includes(d)) ? s.section : 'ক');

  return {
    ...s,
    name_bn: s.name_bn || '',
    name_en: s.name_en || '',
    class_name: c,
    department: canonicalDept,
    group_name: canonicalGroup,
    group: canonicalGroup,
    section: cleanSection,
    gender: s.gender || 'পুরুষ',
    father_name: s.father_name || '',
    father_name_en: s.father_name_en || '',
    father_mobile: s.father_mobile || '',
    father_profession: s.father_profession || '',
    father_nid_no: s.father_nid_no || '',
    mother_name: s.mother_name || '',
    mother_name_en: s.mother_name_en || '',
    mother_mobile: s.mother_mobile || '',
    mother_profession: s.mother_profession || '',
    mother_nid_no: s.mother_nid_no || '',
    guardian_name: s.guardian_name || s.father_name || '',
    guardian_name_en: s.guardian_name_en || s.father_name_en || '',
    guardian_relation: s.guardian_relation || 'পিতা',
    guardian_phone: s.guardian_phone || s.father_mobile || '',
    emergency_phone: s.emergency_phone || s.guardian_phone || s.father_mobile || '',
    current_village: currentVill,
    current_post_office: currentPost,
    current_upazila: currentUp,
    current_district: currentDist,
    permanent_village: permVill,
    permanent_post_office: permPost,
    permanent_upazila: permUp,
    permanent_district: permDist,
    address: s.address || defaultAddress,
    religion: normalizeReligion(s.religion || 'ইসলাম'),
    status: (s.status || 'active').trim().toLowerCase()
  };
}

// CRITICAL: Strictly protect and preserve all user data (15 teachers, 241 students, etc.)
// NEVER overwrite magra_db_students or magra_db_teachers if data already exists in localStorage.
try {
  const rawSt = localStorage.getItem('magra_db_students');
  if (!rawSt) {
    localStorage.setItem('magra_db_students', JSON.stringify(MOCK_STUDENTS.map(enrichStudentProfile)));
  } else {
    try {
      const parsed = JSON.parse(rawSt);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('magra_db_students', JSON.stringify(MOCK_STUDENTS.map(enrichStudentProfile)));
      } else {
        // Heal any corrupted student departments in localStorage
        const healed = parsed.map(enrichStudentProfile);
        localStorage.setItem('magra_db_students', JSON.stringify(healed));
      }
    } catch {}
  }
} catch (e) {
  console.warn('LocalStorage student check error:', e);
}

// Local storage database helpers (preserves user data completely)
function getLocalStore(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem('magra_db_' + key);
    if (raw === null || raw === undefined) {
      if (defaultVal !== undefined) {
        localStorage.setItem('magra_db_' + key, JSON.stringify(defaultVal));
      }
      return defaultVal;
    }
    const parsed = JSON.parse(raw);
    if (key === 'exams' && Array.isArray(parsed)) {
      const filtered = parsed.filter(e => {
        if (!e) return false;
        if (e.id === 'ex-annual-2026' || e.id === 'ex-test-2026') return false;
        if (e.name_bn && (e.name_bn.includes('নির্বাচনি পরীক্ষা ২০২৬') || e.name_bn.includes('বার্ষিক পরীক্ষা ২০২৬'))) return false;
        if (e.name_en && (e.name_en.includes('SSC Test Examination 2026') || e.name_en.includes('Annual Examination 2026'))) return false;
        return true;
      });
      if (filtered.length !== parsed.length) {
        try { localStorage.setItem('magra_db_exams', JSON.stringify(filtered)); } catch(e){}
      }
      return filtered;
    }
    if (key === 'students' && Array.isArray(parsed)) {
      const enriched = parsed.map(enrichStudentProfile);
      return enriched;
    }
    if (key === 'teachers' && Array.isArray(parsed)) {
      let changed = false;
      const healed = parsed.map(t => {
        if (!t) return t;
        const curEdu = t.extended_profile?.education;
        if (!Array.isArray(curEdu) || curEdu.length === 0) {
          const empId = String(t.employee_id || t.id || '').replace(/^t-/, '');
          const fallback = CANONICAL_TEACHER_EDUCATION[empId] || [];
          if (fallback.length) {
            changed = true;
            return {
              ...t,
              extended_profile: {
                ...(t.extended_profile || {}),
                education: fallback
              }
            };
          }
        }
        return t;
      });
      if (changed) {
        try { localStorage.setItem('magra_db_teachers', JSON.stringify(healed)); } catch {}
      }
      return healed;
    }
    return parsed !== null && parsed !== undefined ? parsed : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalStore(key, val) {
  try {
    if (key === 'students' && Array.isArray(val)) {
      val = val.map(enrichStudentProfile);
    }
    localStorage.setItem('magra_db_' + key, JSON.stringify(val));
  } catch {}
}

let backendState = 'probing'; // 'probing' | 'online' | 'offline'

export async function requestApi(path, opts = {}) {
  const token = localStorage.getItem('magra_token');
  const method = (opts.method || 'GET').toUpperCase();
  const [cleanPath, queryStr] = path.split('?');
  const params = new URLSearchParams(queryStr || '');
  const body = opts.body ? JSON.parse(opts.body) : {};

  // 1. Check if Supabase Cloud is configured
  const { isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      if (cleanPath === '/teachers' && method === 'GET') {
        const st = params.get('status');
        let query = 'select=*&order=name_bn.asc';
        if (st && st !== 'all') query += `&status=eq.${st}`;
        const cloudTeachers = await supabaseRequest('teachers', { query });
        if (Array.isArray(cloudTeachers) && cloudTeachers.length) {
          localStorage.setItem('magra_db_teachers', JSON.stringify(cloudTeachers));
          return cloudTeachers;
        }
      } else if (cleanPath === '/students' && method === 'GET') {
        const cls = params.get('class_name');
        let query = 'select=*&order=roll_no.asc';
        if (cls) query += `&class_name=eq.${cls}`;
        const cloudStudents = await supabaseRequest('students', { query });
        if (Array.isArray(cloudStudents) && cloudStudents.length) {
          localStorage.setItem('magra_db_students', JSON.stringify(cloudStudents));
          return cloudStudents;
        }
      } else if (cleanPath === '/staff' && method === 'GET') {
        const cloudStaff = await supabaseRequest('staff', { query: 'select=*&order=name_bn.asc' });
        if (Array.isArray(cloudStaff)) {
          localStorage.setItem('magra_db_staff', JSON.stringify(cloudStaff));
          return cloudStaff;
        }
      } else if (cleanPath === '/notices' && method === 'GET') {
        const cloudNotices = await supabaseRequest('notices', { query: 'select=*&order=id.desc' });
        if (Array.isArray(cloudNotices) && cloudNotices.length) {
          localStorage.setItem('magra_db_notices', JSON.stringify(cloudNotices));
          return cloudNotices;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  // 2. Local Backend Express check (if running locally on PC)
  if (backendState !== 'offline') {
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
  }

  // 3. Handle via Mock / Local Client Engine
  const localRes = handleMockRequest(path, opts);

  // Background Cloud Sync on writes
  if (isConfigured && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    setTimeout(async () => {
      try {
        if (cleanPath === '/teachers' && method === 'POST') {
          await supabaseRequest('teachers', { method: 'POST', body: localRes });
        } else if (cleanPath.startsWith('/teachers/') && (method === 'PUT' || method === 'PATCH')) {
          const id = cleanPath.replace('/teachers/', '');
          await supabaseRequest('teachers', { method: 'PATCH', query: `id=eq.${id}`, body });
        } else if (cleanPath.startsWith('/teachers/') && method === 'DELETE') {
          const id = cleanPath.replace('/teachers/', '');
          await supabaseRequest('teachers', { method: 'DELETE', query: `id=eq.${id}` });
        } else if (cleanPath === '/students' && method === 'POST') {
          await supabaseRequest('students', { method: 'POST', body: localRes });
        } else if (cleanPath.startsWith('/students/') && (method === 'PUT' || method === 'PATCH')) {
          const id = cleanPath.replace('/students/', '');
          await supabaseRequest('students', { method: 'PATCH', query: `id=eq.${id}`, body });
        } else if (cleanPath.startsWith('/students/') && method === 'DELETE') {
          const id = cleanPath.replace('/students/', '');
          await supabaseRequest('students', { method: 'DELETE', query: `id=eq.${id}` });
        }
      } catch (err) {
        console.warn('Background Supabase write failed:', err);
      }
    }, 50);
  }

  return localRes;
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
    const staff = getLocalStore('staff', MOCK_STAFF);
    const notices = getLocalStore('notices', MOCK_NOTICES);
    return {
      students: students.length,
      teachers: teachers.length + staff.length,
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
    const students = getLocalStore('students', MOCK_STUDENTS);
    const teachers = getLocalStore('teachers', MOCK_TEACHERS);
    const staff = getLocalStore('staff', MOCK_STAFF);

    // Calculate religion breakdown with proper normalization
    const relOrder = ['ইসলাম', 'হিন্দু', 'বৌদ্ধ', 'খ্রিষ্টান', 'অন্যান্য'];
    const relMap = {};
    relOrder.forEach(r => { relMap[r] = 0; });

    students.forEach(s => {
      const rel = normalizeReligion(s.religion);
      relMap[rel] = (relMap[rel] || 0) + 1;
    });

    const religion = Object.entries(relMap)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

    // Calculate gender breakdown
    const genMap = { 'ছাত্রী': 0, 'ছাত্র': 0 };
    students.forEach(s => {
      const g = (s.gender === 'female' || s.gender === 'নারী' || s.gender === 'ছাত্রী') ? 'ছাত্রী' : 'ছাত্র';
      genMap[g] = (genMap[g] || 0) + 1;
    });
    const gender = Object.entries(genMap).map(([label, count]) => ({ label, count }));

    // Calculate class-wise breakdown
    const clsMap = {};
    students.forEach(s => {
      const c = String(s.class_name || '10').trim();
      const clsKey = c === '6' ? '৬ষ্ঠ' : c === '7' ? '৭ম' : c === '8' ? '৮ম' : c === '9' ? '৯ম' : (c === '10' || c === '১০' || c === '১০ম') ? '১০ম' : c + ' শ্রেণি';
      clsMap[clsKey] = (clsMap[clsKey] || 0) + 1;
    });
    const classes = Object.entries(clsMap).filter(([_, count]) => count > 0).map(([label, count]) => ({ label, count }));

    return {
      total: students.length,
      teachers: teachers.length + staff.length,
      religion: religion.length ? religion : [{ label: 'তথ্য সংযোজনযোগ্য', count: 0 }],
      gender,
      classes
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

  // 3.5 Admissions & Online Application Engine
  if (cleanPath === '/admissions') {
    let admissions = getLocalStore('admissions', MOCK_ADMISSIONS);
    if (method === 'POST') {
      const all = admissions;
      const yr = body.academic_year || '2026';
      const seq = String(all.length + 1).padStart(3, '0');
      const appNo = body.application_no || `ADM-${yr}-${seq}`;
      const newApp = {
        id: 'adm-' + Date.now(),
        application_no: appNo,
        academic_year: yr,
        applied_class: body.applied_class || '৬',
        department: body.department || '',
        applicant_name_bn: body.applicant_name_bn || '',
        applicant_name_en: body.applicant_name_en || '',
        date_of_birth: body.date_of_birth || '',
        gender: body.gender || 'পুরুষ',
        religion: body.religion || 'ইসলাম',
        blood_group: body.blood_group || 'A+',
        birth_registration_no: body.birth_registration_no || '',
        father_name: body.father_name || '',
        father_nid: body.father_nid || '',
        father_phone: body.father_phone || '',
        father_profession: body.father_profession || '',
        mother_name: body.mother_name || '',
        mother_nid: body.mother_nid || '',
        mother_phone: body.mother_phone || '',
        mother_profession: body.mother_profession || '',
        guardian_name: body.guardian_name || '',
        guardian_relation: body.guardian_relation || 'পিতা',
        guardian_phone: body.guardian_phone || '',
        address: body.address || '',
        current_village: body.current_village || '',
        permanent_village: body.permanent_village || '',
        previous_school: body.previous_school || '',
        previous_gpa: body.previous_gpa || '',
        quota: body.quota || 'সাধারণ',
        // Document Scans
        photo_url: body.photo_url || '',
        scanned_photo: body.scanned_photo || body.photo_url || '',
        scanned_birth_cert: body.scanned_birth_cert || '',
        scanned_tc: body.scanned_tc || '',
        scanned_nid: body.scanned_nid || '',
        scanned_quota_cert: body.scanned_quota_cert || '',
        // Fee Payment Info
        payment_amount: Number(body.payment_amount) || 1400,
        payment_method: body.payment_method || 'bkash',
        payment_trx_id: body.payment_trx_id || `TRX${Date.now().toString().slice(-8)}`,
        payment_sender_mobile: body.payment_sender_mobile || body.guardian_phone || '',
        payment_status: body.payment_status || 'paid',
        payment_date: body.payment_date || new Date().toISOString(),
        // Workflow States: submitted -> head_approved -> admitted (or rejected)
        status: body.status || 'submitted',
        application_date: body.application_date || new Date().toISOString().slice(0, 10),
        notes: body.notes || ''
      };
      admissions = [newApp, ...admissions];
      setLocalStore('admissions', admissions);
      return newApp;
    }

    // GET /admissions
    const q = (params.get('q') || '').trim().toLowerCase();
    const yr = params.get('academic_year');
    const cls = params.get('applied_class');
    const st = params.get('status');
    const paySt = params.get('payment_status');

    if (q) {
      admissions = admissions.filter(a => {
        const h = [
          a.application_no,
          a.applicant_name_bn,
          a.applicant_name_en,
          a.guardian_phone,
          a.father_phone,
          a.guardian_name,
          a.father_name,
          a.birth_registration_no,
          a.payment_trx_id
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        return h.includes(q);
      });
    }
    if (yr && yr !== 'all') {
      admissions = admissions.filter(a => String(a.academic_year) === String(yr));
    }
    if (cls && cls !== 'all') {
      admissions = admissions.filter(a => String(a.applied_class) === String(cls));
    }
    if (st && st !== 'all') {
      admissions = admissions.filter(a => a.status === st);
    }
    if (paySt && paySt !== 'all') {
      admissions = admissions.filter(a => a.payment_status === paySt);
    }
    return admissions;
  }

  if (cleanPath === '/admissions/summary') {
    const admissions = getLocalStore('admissions', MOCK_ADMISSIONS);
    const yr = params.get('academic_year');
    const filtered = yr ? admissions.filter(a => String(a.academic_year) === String(yr)) : admissions;
    return {
      total: filtered.length,
      submitted: filtered.filter(a => a.status === 'submitted' || a.status === 'new').length,
      under_review: filtered.filter(a => a.status === 'under_review').length,
      head_approved: filtered.filter(a => a.status === 'head_approved' || a.status === 'selected').length,
      selected: filtered.filter(a => a.status === 'selected' || a.status === 'head_approved').length,
      admitted: filtered.filter(a => a.status === 'admitted').length,
      rejected: filtered.filter(a => a.status === 'rejected').length
    };
  }

  if (cleanPath.startsWith('/admissions/')) {
    let admissions = getLocalStore('admissions', MOCK_ADMISSIONS);
    const subRoute = cleanPath.replace('/admissions/', '');
    
    // 1. Headmaster Approval Action
    if (subRoute.includes('/head_approve')) {
      const id = subRoute.replace('/head_approve', '');
      const app = admissions.find(a => String(a.id) === String(id));
      if (!app) throw new Error('আবেদন পাওয়া যায়নি');
      app.status = 'head_approved';
      app.head_approved_date = new Date().toISOString();
      app.head_approved_by = body.approved_by || 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)';
      app.head_remarks = body.remarks || 'যাবতীয় তথ্য ও কাগজপত্র নিরীক্ষা সাপেক্ষে ভর্তির অনুমোদন প্রদান করা হলো।';
      setLocalStore('admissions', admissions);
      return { success: true, admission: app };
    }

    // 2. Headmaster Rejection Action
    if (subRoute.includes('/head_reject')) {
      const id = subRoute.replace('/head_reject', '');
      const app = admissions.find(a => String(a.id) === String(id));
      if (!app) throw new Error('আবেদন পাওয়া যায়নি');
      app.status = 'rejected';
      app.rejection_reason = body.reason || 'কাগজপত্রে ত্রুটি পরিলক্ষিত হয়েছে।';
      setLocalStore('admissions', admissions);
      return { success: true, admission: app };
    }

    // 3. Class Teacher Enrollment Action (Enrolls into Class & active students roster)
    if (subRoute.includes('/enroll') || subRoute.includes('/convert')) {
      const id = subRoute.replace('/enroll', '').replace('/convert', '');
      const app = admissions.find(a => String(a.id) === String(id));
      if (!app) throw new Error('আবেদন পাওয়া যায়নি');

      let students = getLocalStore('students', MOCK_STUDENTS);
      const targetClass = body.class_name || app.applied_class || '৬';
      const targetSection = body.section || app.section || 'পদ্মা';
      const targetDept = body.department || app.department || (['9', '10'].includes(String(targetClass)) ? 'বিজ্ঞান' : 'সাধারণ');
      
      // Auto Roll resolution
      let assignedRoll = Number(body.roll_no);
      if (!assignedRoll) {
        const classStudents = students.filter(s => String(s.class_name) === String(targetClass));
        const maxRoll = classStudents.reduce((max, s) => Math.max(max, Number(s.roll_no) || 0), 0);
        assignedRoll = maxRoll + 1;
      }

      // Auto Student ID
      const yr = app.academic_year || '2026';
      const stuId = body.student_id || `MPUHS-${yr}-${targetClass}${String(assignedRoll).padStart(2, '0')}`;

      const newStudent = {
        id: 'std_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        student_id: stuId,
        roll_no: assignedRoll,
        class_name: String(targetClass),
        section: targetSection,
        department: targetDept,
        group_name: targetDept,
        group: targetDept,
        name_bn: app.applicant_name_bn,
        name_en: app.applicant_name_en || app.applicant_name_bn,
        gender: app.gender || 'পুরুষ',
        date_of_birth: app.date_of_birth || '',
        blood_group: app.blood_group || 'A+',
        religion: normalizeReligion(app.religion || 'ইসলাম'),
        birth_registration_no: app.birth_registration_no || '',
        father_name: app.father_name || app.guardian_name,
        father_mobile: app.father_phone || app.guardian_phone,
        mother_name: app.mother_name || '',
        mother_mobile: app.mother_phone || '',
        guardian_name: app.guardian_name || app.father_name,
        guardian_phone: app.guardian_phone || app.father_phone,
        current_village: app.current_village || (app.address ? app.address.split(',')[0] : 'মগড়া'),
        permanent_village: app.permanent_village || (app.address ? app.address.split(',')[0] : 'মগড়া'),
        current_upazila: 'কালিহাতি',
        current_district: 'টাঙ্গাইল',
        permanent_upazila: 'কালিহাতি',
        permanent_district: 'টাঙ্গাইল',
        admission_date: new Date().toISOString().slice(0, 10),
        admission_class: String(targetClass),
        status: 'active',
        photo_url: app.scanned_photo || app.photo_url || getStudentPhoto({ gender: app.gender, class_name: targetClass }),
        enrolled_by: body.teacher_name || 'শ্রেণি শিক্ষক'
      };

      // Add to active students list
      students = [newStudent, ...students];
      setLocalStore('students', students);

      // Update admission application record
      app.status = 'admitted';
      app.enrolled_student_id = stuId;
      app.enrolled_roll_no = assignedRoll;
      app.enrolled_section = targetSection;
      app.enrolled_department = targetDept;
      app.enrolled_by_teacher = body.teacher_name || 'শ্রেণি শিক্ষক';
      app.enrolled_date = new Date().toISOString();

      setLocalStore('admissions', admissions);
      return { success: true, student: newStudent, admission: app };
    }

    // Direct Single Update or Delete
    const id = subRoute;
    if (method === 'PUT') {
      admissions = admissions.map(a => String(a.id) === String(id) ? { ...a, ...body } : a);
      setLocalStore('admissions', admissions);
      return { success: true };
    }
    if (method === 'DELETE') {
      admissions = admissions.filter(a => String(a.id) !== String(id));
      setLocalStore('admissions', admissions);
      return { success: true };
    }
  }

  // 4. Students
  if (cleanPath === '/students') {
    if (method === 'POST') {
      const allStudents = getLocalStore('students', MOCK_STUDENTS);
      const rawStatus = (body.status || '').trim().toLowerCase();
      const st = (!rawStatus || rawStatus === 'active' || rawStatus === 'সক্রিয়') ? 'active' : rawStatus;
      const newSt = { 
        ...body,
        id: 'std_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), 
        student_id: body.student_id || ('STU-' + new Date().getFullYear() + '-' + String(allStudents.length + 1).padStart(4, '0')), 
        religion: normalizeReligion(body.religion),
        status: st
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
    const relFilter = params.get('religion');
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
          s.father_mobile,
          s.mother_name,
          s.mother_mobile,
          s.emergency_phone,
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
    if (st && st !== 'all') {
      students = students.filter(s => {
        if (!s) return false;
        const curStatus = (s.status || 'active').trim().toLowerCase();
        if (st === 'active') return curStatus === 'active' || curStatus === 'সক্রিয়' || !curStatus;
        if (st === 'inactive') return curStatus === 'inactive' || curStatus === 'নিষ্ক্রিয়';
        return curStatus === st.toLowerCase();
      });
    }
    if (relFilter) {
      students = students.filter(s => s && normalizeReligion(s.religion) === normalizeReligion(relFilter));
    }
    const groupFilter = params.get('group') || params.get('group_name') || params.get('department');
    if (groupFilter && groupFilter !== 'all' && groupFilter !== 'সকল বিভাগ' && groupFilter !== '') {
      students = students.filter(s => {
        if (!s) return false;
        const raw = String(s.department || s.group_name || s.group || s.section || s.student_code || s.student_id || s.id || '').toLowerCase();
        const gf = groupFilter.trim().toLowerCase();

        const isSci = raw.includes('বিজ্ঞান') || raw.includes('science') || raw.includes('sci') || String(s.student_id || '').toLowerCase().includes('sci') || String(s.id || '').toLowerCase().includes('sci');
        const isHum = raw.includes('মানবিক') || raw.includes('humanities') || raw.includes('hum') || raw.includes('arts') || String(s.student_id || '').toLowerCase().includes('hum') || String(s.id || '').toLowerCase().includes('hum');
        const isBus = raw.includes('ব্যবসা') || raw.includes('ব্যবসায়') || raw.includes('ব্যবসায়') || raw.includes('বাণিজ্য') || raw.includes('business') || raw.includes('commerce') || raw.includes('bs') || String(s.student_id || '').toLowerCase().includes('bs') || String(s.id || '').toLowerCase().includes('bs');

        if (gf.includes('বিজ্ঞান') || gf.includes('science') || gf.includes('sci')) {
          return isSci && !isHum && !isBus;
        }
        if (gf.includes('মানবিক') || gf.includes('humanities') || gf.includes('hum') || gf.includes('arts')) {
          return isHum && !isSci && !isBus;
        }
        if (gf.includes('ব্যবসা') || gf.includes('ব্যবসায়') || gf.includes('ব্যবসায়') || gf.includes('বাণিজ্য') || gf.includes('business') || gf.includes('commerce') || gf.includes('bs')) {
          return isBus && !isSci && !isHum;
        }
        return raw.includes(gf) || gf.includes(raw);
      });
    }
    const genderFilter = params.get('gender');
    if (genderFilter) {
      students = students.filter(s => {
        if (!s) return false;
        const g = (s.gender || '').toLowerCase();
        const gf = genderFilter.toLowerCase();
        if (gf.includes('female') || gf.includes('ছাত্রী') || gf.includes('নারী') || gf.includes('মহিলা')) {
          return g === 'female' || g === 'ছাত্রী' || g === 'নারী' || g === 'মহিলা';
        }
        if (gf.includes('male') || gf.includes('ছাত্র') || gf.includes('পুরুষ')) {
          return g === 'male' || g === 'ছাত্র' || g === 'পুরুষ';
        }
        return true;
      });
    }
    if (customKey && customVal) {
      students = students.filter(s => {
        const val = s?.extended_profile?.custom_fields?.[customKey];
        return val && String(val).toLowerCase().includes(customVal);
      });
    }
    return sortStudentsList(students);
  }

  if (cleanPath.startsWith('/students/') && !cleanPath.includes('village-wise')) {
    const id = cleanPath.replace('/students/', '');
    let students = getLocalStore('students', MOCK_STUDENTS);
    if (method === 'PUT') {
      students = students.map(s => String(s.id) === String(id) ? { ...s, ...body, religion: normalizeReligion(body.religion || s.religion) } : s);
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
    const added = list.map((st, i) => {
      const rawStatus = (st.status || '').trim().toLowerCase();
      const statusVal = (!rawStatus || rawStatus === 'active' || rawStatus === 'সক্রিয়') ? 'active' : rawStatus;
      return {
        ...st,
        id: 'std_' + (Date.now() + i) + '_' + Math.random().toString(36).slice(2, 6),
        religion: normalizeReligion(st.religion),
        status: statusVal
      };
    });
    students = [...added, ...students];
    setLocalStore('students', students);
    return { success: true, count: added.length, message: `${added.length} জন শিক্ষার্থী সফলভাবে ইমপোর্ট হয়েছে` };
  }

  // 5. Voter List
  if (cleanPath === '/voter-list') {
    const q = (params.get('q') || '').trim().toLowerCase();
    const className = (params.get('class_name') || '').trim();
    let students = getLocalStore('students', MOCK_STUDENTS);
    if (className && className !== 'all') {
      students = students.filter(s => String(s.class_name).trim() === String(className).trim());
    }
    if (q) {
      students = students.filter(s => {
        const h = [
          s.current_village,
          s.permanent_village,
          s.name_bn,
          s.name_en,
          s.roll_no,
          s.voter_no,
          s.voter_name,
          s.father_name,
          s.mother_name,
          s.guardian_name
        ].filter(Boolean).map(String).join(' ').toLowerCase();
        return h.includes(q);
      });
    }
    return students.map((s, idx) => ({
      id: s.id,
      student_id: s.student_id,
      roll_no: s.roll_no,
      voter_no: s.voter_no || '',
      voter_name: s.voter_name || (s.father_name && !s.father_name.includes('মৃত') ? s.father_name : s.mother_name && !s.mother_name.includes('মৃত') ? s.mother_name : s.guardian_name || s.name_bn),
      voter_name_override: s.voter_name_override || '',
      name_bn: s.name_bn,
      name_en: s.name_en,
      class_name: s.class_name,
      department: s.department || s.group_name || s.group || '',
      section: s.section || '',
      father_name: s.father_name,
      mother_name: s.mother_name,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone || s.father_mobile || s.mother_mobile || '',
      current_village: s.current_village || s.permanent_village || s.address || 'মগড়া',
      current_upazila: s.current_upazila || s.permanent_upazila || 'কালিহাতি',
      current_district: s.current_district || s.permanent_district || 'টাঙ্গাইল',
      permanent_village: s.permanent_village || '',
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
      const rawStatus = (body.status || '').trim().toLowerCase();
      const st = (!rawStatus || rawStatus === 'active' || rawStatus === 'সক্রিয়') ? 'active' : rawStatus;
      const newT = { 
        ...body,
        id: 'tch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), 
        employee_id: body.employee_id || String(allTeachers.length + 1), 
        status: st
      };
      allTeachers.push(newT);
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
    if (st && st !== 'all') {
      teachers = teachers.filter(t => {
        if (!t) return false;
        const curStatus = (t.status || 'active').trim().toLowerCase();
        if (st === 'active') return curStatus === 'active' || curStatus === 'সক্রিয়' || !curStatus;
        return curStatus === st.toLowerCase();
      });
    }
    if (customKey && customVal) {
      teachers = teachers.filter(t => {
        const val = t?.extended_profile?.custom_fields?.[customKey];
        return val && String(val).toLowerCase().includes(customVal);
      });
    }
    return sortPeopleByEmployeeId(teachers);
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
    let updatedCount = 0;
    let addedCount = 0;

    list.forEach((p, i) => {
      const rawStatus = (p.status || '').trim().toLowerCase();
      const st = (!rawStatus || rawStatus === 'active' || rawStatus === 'সক্রিয়') ? 'active' : rawStatus;

      let extProfile = p.extended_profile || {
        education: [],
        professional_qualifications: [],
        training: [],
        in_service_training: [],
        ntrca: {},
        dob: '',
        professional_note: ''
      };
      if (typeof p.extended_profile_json === 'string' && p.extended_profile_json.trim()) {
        try {
          const parsed = JSON.parse(p.extended_profile_json);
          extProfile = { ...extProfile, ...parsed };
        } catch {}
      }
      if (p.dob && !extProfile.dob) {
        extProfile.dob = p.dob;
      }

      const empId = (p.employee_id || '').trim();
      const existingIdx = empId ? teachers.findIndex(t => String(t.employee_id || '').trim() === empId) : -1;

      const record = {
        ...(existingIdx >= 0 ? teachers[existingIdx] : {}),
        ...p,
        id: existingIdx >= 0 ? teachers[existingIdx].id : (p.id || ('tch_' + (Date.now() + i) + '_' + Math.random().toString(36).slice(2, 6))),
        employee_id: empId || (existingIdx >= 0 ? teachers[existingIdx].employee_id : ('EMP-' + String(teachers.length + i + 1).padStart(3, '0'))),
        status: st,
        name_bn: p.name_bn || p.name_en || (existingIdx >= 0 ? teachers[existingIdx].name_bn : 'শিক্ষক'),
        designation: p.designation || (existingIdx >= 0 ? teachers[existingIdx].designation : 'সহকারী শিক্ষক'),
        extended_profile: extProfile
      };

      if (existingIdx >= 0) {
        teachers[existingIdx] = record;
        updatedCount++;
      } else {
        teachers.push(record);
        addedCount++;
      }
    });

    teachers = sortPeopleByEmployeeId(teachers);
    setLocalStore('teachers', teachers);
    return {
      success: true,
      count: list.length,
      updated_count: updatedCount,
      added_count: addedCount,
      message: `${list.length} জন শিক্ষকের তথ্য সফলভাবে সিঙ্ক/ইমপোর্ট হয়েছে (নতুন: ${addedCount}, আপডেট: ${updatedCount})`
    };
  }

  if (cleanPath === '/staff') {
    if (method === 'POST') {
      const allStaff = getLocalStore('staff', MOCK_STAFF);
      const rawStatus = (body.status || '').trim().toLowerCase();
      const st = (!rawStatus || rawStatus === 'active' || rawStatus === 'সক্রিয়') ? 'active' : rawStatus;
      const newStf = { 
        ...body,
        id: 'stf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), 
        employee_id: body.employee_id || String(allStaff.length + 1), 
        status: st
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
    if (st && st !== 'all') {
      staff = staff.filter(s => {
        if (!s) return false;
        const curStatus = (s.status || 'active').trim().toLowerCase();
        if (st === 'active') return curStatus === 'active' || curStatus === 'সক্রিয়' || !curStatus;
        return curStatus === st.toLowerCase();
      });
    }
    if (customKey && customVal) {
      staff = staff.filter(s => {
        const val = s?.extended_profile?.custom_fields?.[customKey];
        return val && String(val).toLowerCase().includes(customVal);
      });
    }
    return sortPeopleByEmployeeId(staff);
  }

  if (cleanPath.startsWith('/staff/')) {
    const id = cleanPath.replace('/staff/', '');
    let staff = getLocalStore('staff', []);
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
    let staff = getLocalStore('staff', []);
    let updatedCount = 0;
    let addedCount = 0;

    list.forEach((p, i) => {
      const rawStatus = (p.status || '').trim().toLowerCase();
      const st = (!rawStatus || rawStatus === 'active' || rawStatus === 'সক্রিয়') ? 'active' : rawStatus;

      let extProfile = p.extended_profile || {
        education: [],
        professional_qualifications: [],
        training: [],
        in_service_training: [],
        dob: '',
        professional_note: ''
      };
      if (typeof p.extended_profile_json === 'string' && p.extended_profile_json.trim()) {
        try {
          const parsed = JSON.parse(p.extended_profile_json);
          extProfile = { ...extProfile, ...parsed };
        } catch {}
      }
      if (p.dob && !extProfile.dob) {
        extProfile.dob = p.dob;
      }

      const empId = (p.employee_id || '').trim();
      const existingIdx = empId ? staff.findIndex(s => String(s.employee_id || '').trim() === empId) : -1;

      const record = {
        ...(existingIdx >= 0 ? staff[existingIdx] : {}),
        ...p,
        id: existingIdx >= 0 ? staff[existingIdx].id : (p.id || ('stf_' + (Date.now() + i) + '_' + Math.random().toString(36).slice(2, 6))),
        employee_id: empId || (existingIdx >= 0 ? staff[existingIdx].employee_id : ('STF-' + String(staff.length + i + 1).padStart(3, '0'))),
        status: st,
        name_bn: p.name_bn || p.name_en || (existingIdx >= 0 ? staff[existingIdx].name_bn : 'কর্মচারী'),
        designation: p.designation || (existingIdx >= 0 ? staff[existingIdx].designation : 'কর্মচারী'),
        extended_profile: extProfile
      };

      if (existingIdx >= 0) {
        staff[existingIdx] = record;
        updatedCount++;
      } else {
        staff.push(record);
        addedCount++;
      }
    });

    staff = sortPeopleByEmployeeId(staff);
    setLocalStore('staff', staff);
    return {
      success: true,
      count: list.length,
      updated_count: updatedCount,
      added_count: addedCount,
      message: `${list.length} জন কর্মচারীর তথ্য সফলভাবে সিঙ্ক/ইমপোর্ট হয়েছে (নতুন: ${addedCount}, আপডেট: ${updatedCount})`
    };
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

  // 9. Academic Years, Exams & Results (Modernized)
  if (cleanPath === '/academic-years') {
    let years = getLocalStore('academic_years', DEFAULT_ACADEMIC_YEARS);
    if (method === 'POST') {
      const yearStr = String(body.year || '').trim();
      const newY = {
        id: 'ay-' + (yearStr || Date.now()),
        year: yearStr || String(new Date().getFullYear()),
        title_bn: body.title_bn || (yearStr ? yearStr + ' শিক্ষাবর্ষ' : 'নতুন শিক্ষাবর্ষ'),
        is_current: !!body.is_current,
        status: body.status || 'active',
        remarks: body.remarks || '',
        created_at: new Date().toISOString()
      };
      if (newY.is_current) {
        years = years.map(y => ({ ...y, is_current: false }));
      }
      years = [newY, ...years.filter(y => String(y.id) !== String(newY.id) && String(y.year) !== String(newY.year))];
      setLocalStore('academic_years', years);
      return newY;
    }
    return years;
  }

  if (cleanPath.startsWith('/academic-years/') && (method === 'PUT' || method === 'PATCH')) {
    const id = cleanPath.split('/')[2];
    let years = getLocalStore('academic_years', DEFAULT_ACADEMIC_YEARS);
    if (body.is_current) {
      years = years.map(y => ({ ...y, is_current: false }));
    }
    years = years.map(y => {
      if (String(y.id) === String(id) || String(y.year) === String(id)) {
        return { ...y, ...body };
      }
      return y;
    });
    setLocalStore('academic_years', years);
    return { success: true, updated: id };
  }

  if (cleanPath.startsWith('/academic-years/') && method === 'DELETE') {
    const id = cleanPath.split('/')[2];
    let years = getLocalStore('academic_years', DEFAULT_ACADEMIC_YEARS);
    years = years.filter(y => String(y.id) !== String(id) && String(y.year) !== String(id));
    setLocalStore('academic_years', years);
    return { success: true, deleted: id };
  }

  if (cleanPath === '/exams') {
    let exams = getLocalStore('exams', MOCK_EXAMS);
    if (method === 'POST') {
      const newExam = {
        id: 'ex-' + Date.now(),
        academic_year: String(body.academic_year || '2026').trim(),
        name_bn: (body.name_bn || '').trim(),
        name_en: (body.name_en || '').trim(),
        exam_type: body.exam_type || 'সাময়িক পরীক্ষা',
        status: body.status || 'active',
        grading_scheme_id: body.grading_scheme_id || '',
        remarks: body.remarks || '',
        created_at: new Date().toISOString()
      };
      exams = [newExam, ...exams];
      setLocalStore('exams', exams);
      return newExam;
    }
    const yearFilter = params.get('academic_year');
    if (yearFilter) {
      return exams.filter(e => String(e.academic_year) === String(yearFilter));
    }
    return exams;
  }

  if (cleanPath.startsWith('/exams/') && !cleanPath.endsWith('/subjects')) {
    const examId = cleanPath.split('/')[2];
    let exams = getLocalStore('exams', MOCK_EXAMS);
    if (method === 'PUT' || method === 'PATCH') {
      exams = exams.map(e => String(e.id) === String(examId) ? { ...e, ...body } : e);
      setLocalStore('exams', exams);
      return { success: true, exam: exams.find(e => String(e.id) === String(examId)) };
    }
    if (method === 'DELETE') {
      exams = exams.filter(e => String(e.id) !== String(examId));
      setLocalStore('exams', exams);
      return { success: true, deleted: examId };
    }
    return exams.find(e => String(e.id) === String(examId)) || null;
  }

  if (cleanPath === '/subjects') {
    const cls = params.get('class_name');
    const dept = params.get('department') || params.get('group');
    let subs = getLocalStore('subjects', MOCK_SUBJECTS);
    if (!Array.isArray(subs) || subs.length < 20) {
      subs = MOCK_SUBJECTS;
      setLocalStore('subjects', subs);
    }
    if (cls) {
      subs = subs.filter(s => !s.class_name || String(s.class_name) === String(cls));
    }
    if (dept && dept !== 'all' && dept !== 'সকল বিভাগ') {
      subs = subs.filter(s => s.department === 'আবশ্যিক' || s.department === 'সাধারণ' || s.department === dept);
    }
    return subs;
  }

  if (cleanPath === '/subjects/reset-dhaka-board' && method === 'POST') {
    setLocalStore('subjects', MOCK_SUBJECTS);
    return { ok: true, count: MOCK_SUBJECTS.length };
  }

  if (cleanPath.startsWith('/exams/') && cleanPath.endsWith('/subjects')) {
    const examId = cleanPath.split('/')[2];
    if (method === 'POST') {
      let examSubs = getLocalStore('exam_subjects_' + examId, []);
      const newSub = { id: 'es-' + Date.now(), exam_id: examId, ...body };
      examSubs = examSubs.filter(s => String(s.subject_id) !== String(body.subject_id));
      examSubs.push(newSub);
      setLocalStore('exam_subjects_' + examId, examSubs);
      return newSub;
    }
    const stored = getLocalStore('exam_subjects_' + examId, []);
    if (stored.length) return stored;
    return getLocalStore('subjects', MOCK_SUBJECTS);
  }

  if (cleanPath === '/grading-schemes') {
    const defaultSchemes = [
      { id: 'gs-1', name_bn: 'বাংলাদেশ মাধ্যমিক সাধারণ গ্রেডিং (SSC Standard)', board: 'ঢাকা / মাদ্রাসা শিক্ষা বোর্ড', academic_year: 2026, pass_percent: 33 }
    ];
    let schemes = getLocalStore('grading_schemes', defaultSchemes);
    if (method === 'POST') {
      const newGs = { id: 'gs-' + Date.now(), ...body };
      schemes = [newGs, ...schemes];
      setLocalStore('grading_schemes', schemes);
      return newGs;
    }
    return schemes;
  }

  if (cleanPath === '/marks') {
    const examId = params.get('exam_id');
    const cls = params.get('class_name');
    const marks = getLocalStore('marks', []);
    let filtered = marks;
    if (examId) {
      filtered = filtered.filter(m => String(m.exam_id) === String(examId));
    }
    if (cls) {
      filtered = filtered.filter(m => String(m.class_name || '') === String(cls));
    }
    return filtered;
  }

  if (cleanPath === '/marks/bulk' && method === 'POST') {
    const examId = body.exam_id;
    const records = Array.isArray(body.records) ? body.records : [];
    let marks = getLocalStore('marks', []);
    const map = new Map();
    marks.forEach(m => map.set(`${m.exam_id}_${m.student_id}_${m.subject_id}`, m));
    records.forEach(r => {
      const w = r.written !== '' && r.written !== undefined && r.written !== null ? Number(r.written) : null;
      const m = r.mcq !== '' && r.mcq !== undefined && r.mcq !== null ? Number(r.mcq) : null;
      const p = r.practical !== '' && r.practical !== undefined && r.practical !== null ? Number(r.practical) : null;
      const tot = (w || 0) + (m || 0) + (p || 0);
      map.set(`${examId}_${r.student_id}_${r.subject_id}`, {
        ...r,
        exam_id: examId,
        written: w,
        mcq: m,
        practical: p,
        total: r.absent ? 0 : tot,
        updated_at: new Date().toISOString()
      });
    });
    const updatedList = Array.from(map.values());
    setLocalStore('marks', updatedList);

    // Invalidate cached results for this exam across all classes so Tabulation & Merit lists immediately update
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(window.localStorage).forEach(k => {
          if (k.startsWith(`magra_db_results_${examId}_`)) {
            window.localStorage.removeItem(k);
          }
        });
      }
    } catch (_) {}

    return { ok: true, count: records.length };
  }

  if (cleanPath === '/results/process' && method === 'POST') {
    const examId = body.exam_id;
    const cls = body.class_name || '6';
    let exams = getLocalStore('exams', MOCK_EXAMS);
    exams = exams.map(e => String(e.id) === String(examId) ? { ...e, status: 'published' } : e);
    setLocalStore('exams', exams);

    const students = getLocalStore('students', MOCK_STUDENTS);
    let subs = getLocalStore('subjects', MOCK_SUBJECTS);
    if (!Array.isArray(subs) || subs.length < 20) subs = MOCK_SUBJECTS;
    const marks = getLocalStore('marks', []);

    // Compute real results via Dhaka Board Exam Engine
    const processed = processClassResults(students, subs, marks, cls, examId);
    setLocalStore(`results_${examId}_${cls}`, processed);
    return { ok: true, count: processed.length, summary: processed };
  }

  if (cleanPath === '/results/summary') {
    const examId = params.get('exam_id');
    const cls = params.get('class_name') || '6';
    const dept = params.get('department');
    const force = params.get('force') === '1' || params.get('force') === 'true';
    
    // Check cache
    let processed = force ? null : getLocalStore(`results_${examId}_${cls}`, null);
    if (!processed || !Array.isArray(processed) || !processed.length) {
      const students = getLocalStore('students', MOCK_STUDENTS);
      let subs = getLocalStore('subjects', MOCK_SUBJECTS);
      if (!Array.isArray(subs) || subs.length < 20) subs = MOCK_SUBJECTS;
      const marks = getLocalStore('marks', []);
      processed = processClassResults(students, subs, marks, cls, examId);
      setLocalStore(`results_${examId}_${cls}`, processed);
    }

    if (dept && dept !== 'all' && dept !== 'সকল বিভাগ') {
      return processed.filter(s => s.department === dept);
    }
    return processed;
  }

  if (cleanPath === '/results/analysis') {
    const examId = params.get('exam_id');
    const cls = params.get('class_name') || '6';
    const force = params.get('force') === '1' || params.get('force') === 'true';
    let processed = force ? null : getLocalStore(`results_${examId}_${cls}`, null);
    if (!processed || !Array.isArray(processed) || !processed.length) {
      const students = getLocalStore('students', MOCK_STUDENTS);
      let subs = getLocalStore('subjects', MOCK_SUBJECTS);
      if (!Array.isArray(subs) || subs.length < 20) subs = MOCK_SUBJECTS;
      const marks = getLocalStore('marks', []);
      processed = processClassResults(students, subs, marks, cls, examId);
      setLocalStore(`results_${examId}_${cls}`, processed);
    }
    let subs = getLocalStore('subjects', MOCK_SUBJECTS);
    return generateResultAnalytics(processed, subs);
  }
  // 10. Student Promotion and SSC Form Fill-up Endpoints
  if (cleanPath === '/promotion/execute' && method === 'POST') {
    const { source_year, target_year, source_class, target_class, promotions } = body;
    let students = getLocalStore('students', MOCK_STUDENTS);
    let promotedCount = 0;
    const promoMap = new Map();
    (promotions || []).forEach(p => {
      if (p.student_id) promoMap.set(String(p.student_id), p);
      if (p.id) promoMap.set(String(p.id), p);
    });

    students = students.map(s => {
      const p = promoMap.get(String(s.student_id)) || promoMap.get(String(s.id));
      if (!p) return s;

      const oldClass = s.class_name;
      const oldRoll = s.roll_no;
      const historyItem = {
        date: new Date().toISOString().slice(0, 10),
        from_year: source_year || '2026',
        to_year: target_year || '2027',
        from_class: oldClass,
        to_class: p.action === 'promote' ? String(target_class) : oldClass,
        from_roll: oldRoll,
        to_roll: Number(p.new_roll) || oldRoll,
        action: p.action, // 'promote' or 'repeat'
        method: p.method, // 'merit' or 'special_approval'
        approval_note: p.approval_note || ''
      };

      const ext = s.extended_profile || {};
      const history = Array.isArray(ext.promotion_history) ? [...ext.promotion_history, historyItem] : [historyItem];

      if (p.action === 'promote') {
        promotedCount++;
        return {
          ...s,
          class_name: String(target_class),
          roll_no: Number(p.new_roll) || oldRoll,
          department: p.department || s.department || 'সাধারণ',
          section: p.section || s.section || 'A',
          extended_profile: {
            ...ext,
            promotion_history: history
          }
        };
      } else {
        return {
          ...s,
          roll_no: Number(p.new_roll) || oldRoll,
          extended_profile: {
            ...ext,
            promotion_history: history
          }
        };
      }
    });

    setLocalStore('students', students);
    return {
      ok: true,
      count: promotedCount,
      message: `শ্রেণি ${source_class} থেকে শ্রেণি ${target_class} এ ${promotedCount} জন শিক্ষার্থীর প্রমোশন সফলভাবে সম্পন্ন ও সংরক্ষিত হয়েছে`
    };
  }

  if (cleanPath === '/ssc-form-fillup/save' && method === 'POST') {
    const { exam_id, academic_year, candidates } = body;
    let students = getLocalStore('students', MOCK_STUDENTS);
    let updatedCount = 0;
    const candMap = new Map();
    (candidates || []).forEach(c => {
      if (c.student_id) candMap.set(String(c.student_id), c);
      if (c.id) candMap.set(String(c.id), c);
    });

    students = students.map(s => {
      const c = candMap.get(String(s.student_id)) || candMap.get(String(s.id));
      if (!c) return s;

      updatedCount++;
      return {
        ...s,
        ssc_candidate_status: c.status, // 'approved', 'special_approved', 'detained'
        ssc_approval_type: c.approval_type, // 'regular', 'head_teacher_special'
        ssc_approval_note: c.approval_note || '',
        ssc_academic_year: academic_year || '2026',
        ssc_exam_id: exam_id || ''
      };
    });

    setLocalStore('students', students);
    return {
      ok: true,
      count: updatedCount,
      message: `১০ম শ্রেণির ${updatedCount} জন শিক্ষার্থীর এসএসসি পরীক্ষার ফরমপূরণ অনুমোদন তালিকা সফলভাবে সংরক্ষিত হয়েছে`
    };
  }

  if (cleanPath === '/promotion/history') {
    const students = getLocalStore('students', MOCK_STUDENTS);
    const historyList = [];
    students.forEach(s => {
      const hist = s?.extended_profile?.promotion_history;
      if (Array.isArray(hist) && hist.length) {
        hist.forEach(h => {
          historyList.push({
            student_id: s.student_id,
            name_bn: s.name_bn,
            ...h
          });
        });
      }
    });
    return historyList.reverse();
  }


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

  
  // Teacher Portal Endpoints (Smart Attendance & Marks Roster)
  if (cleanPath === '/portal/teacher/roster') {
    const cls = params.get('class_name') || '6';
    const sec = params.get('section') || '';
    const students = getLocalStore('students', MOCK_STUDENTS);
    let filtered = students.filter(s => String(s.class_name).trim() === String(cls).trim());
    if (sec) {
      filtered = filtered.filter(s => !s.section || String(s.section).includes(sec));
    }
    if (!filtered.length && students.length) {
      filtered = students.slice(0, 15);
    }
    return filtered.map(s => ({
      id: s.id,
      student_id: s.student_id,
      name_bn: s.name_bn,
      roll_no: s.roll_no,
      status: 'present',
      remarks: ''
    }));
  }

  if (cleanPath === '/portal/teacher/marks-roster') {
    const examId = params.get('exam_id');
    const cls = params.get('class_name') || '6';
    const subId = params.get('subject_id');
    const students = getLocalStore('students', MOCK_STUDENTS);
    const subjects = getLocalStore('subjects', MOCK_SUBJECTS);
    const marks = getLocalStore('marks', []);

    const sub = subjects.find(s => String(s.id) === String(subId) || String(s.code) === String(subId)) || subjects[0] || {
      name_bn: 'বাংলা',
      full_marks: 100,
      written_max: 70,
      mcq_max: 30,
      practical_max: 0
    };

    let classStudents = students.filter(s => String(s.class_name).trim() === String(cls).trim());
    if (!classStudents.length) classStudents = students.slice(0, 15);

    const studentRows = classStudents.map(s => {
      const existing = marks.find(m => String(m.exam_id) === String(examId) && String(m.student_id) === String(s.id) && String(m.subject_id) === String(subId));
      return {
        id: s.id,
        student_id: s.student_id,
        name_bn: s.name_bn,
        roll_no: s.roll_no,
        written: existing ? existing.written : '',
        mcq: existing ? existing.mcq : '',
        practical: existing ? existing.practical : '',
        absent: existing ? existing.absent : false,
        remarks: existing ? existing.remarks : ''
      };
    });

    return {
      meta: sub,
      students: studentRows
    };
  }

  if (cleanPath === '/portal/teacher/marks-save' && method === 'POST') {
    const { exam_id, records } = body || {};
    let marks = getLocalStore('marks', []);
    const map = new Map();
    marks.forEach(m => map.set(`${m.exam_id}_${m.student_id}_${m.subject_id}`, m));
    (records || []).forEach(r => {
      const w = r.written !== '' && r.written !== undefined && r.written !== null ? Number(r.written) : null;
      const m = r.mcq !== '' && r.mcq !== undefined && r.mcq !== null ? Number(r.mcq) : null;
      const p = r.practical !== '' && r.practical !== undefined && r.practical !== null ? Number(r.practical) : null;
      const tot = (w || 0) + (m || 0) + (p || 0);
      map.set(`${exam_id}_${r.student_id}_${r.subject_id}`, {
        ...r,
        exam_id,
        written: w,
        mcq: m,
        practical: p,
        total: r.absent ? 0 : tot,
        updated_at: new Date().toISOString()
      });
    });
    setLocalStore('marks', Array.from(map.values()));
    return { ok: true, count: (records || []).length };
  }

  if (cleanPath === '/portal/links') {
    return [
      { id: 'link-1', guardian_name: 'রফিকুল ইসলাম', guardian_login: 'pilot-guardian-01', student_name: 'মাহির আহমেদ', student_code: 'STU-2026-0601', class_name: '6', roll_no: 1, relation: 'পিতা' }
    ];
  }

  // Document Management & Generation Endpoints
  if (cleanPath === '/documents/issued') {
    const docType = params.get('document_type');
    const stuId = params.get('student_id');
    const defaultIssued = [
      { id: 'iss-1', document_no: 'DOC-2026-1001', issue_date: '2026-01-15', document_type: 'id_card', name_bn: 'আহনাফ সিদ্দিক', roll_no: 1, class_name: '10' },
      { id: 'iss-2', document_no: 'DOC-2026-1002', issue_date: '2026-02-10', document_type: 'commendation_certificate', name_bn: 'তানজিনা আক্তার', roll_no: 1, class_name: '10' },
      { id: 'iss-3', document_no: 'DOC-2026-1003', issue_date: '2026-03-01', document_type: 'bonafide_certificate', name_bn: 'শিহাব উদ্দিন', roll_no: 2, class_name: '10' },
      { id: 'iss-4', document_no: 'DOC-2026-1004', issue_date: '2026-03-15', document_type: 'transfer_certificate', name_bn: 'আসাদুজ্জামান নূর', roll_no: 2, class_name: '10' }
    ];
    let issued = getLocalStore('issued_documents', defaultIssued);
    if (docType) issued = issued.filter(d => d.document_type === docType);
    if (stuId) issued = issued.filter(d => String(d.student_id) === String(stuId));
    return issued;
  }

  if (cleanPath === '/documents/issue' && method === 'POST') {
    const x = body || {};
    const no = x.document_no || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc = {
      id: 'iss-' + Date.now(),
      document_type: x.document_type,
      student_id: x.student_id || null,
      exam_id: x.exam_id || null,
      document_no: no,
      issue_date: x.issue_date || new Date().toISOString().slice(0, 10),
      data_snapshot: x.data_snapshot || {},
      name_bn: x.data_snapshot?.student?.name_bn || '',
      created_at: new Date().toISOString()
    };
    let issued = getLocalStore('issued_documents', []);
    issued.unshift(newDoc);
    setLocalStore('issued_documents', issued);
    return newDoc;
  }

  if (cleanPath.startsWith('/documents/student/')) {
    const stuId = cleanPath.replace('/documents/student/', '').split('?')[0];
    const type = params.get('type') || 'id_card';
    const examId = params.get('exam_id');
    const cls = params.get('class_name') || '6';

    const students = getLocalStore('students', MOCK_STUDENTS);
    let student = students.find(s => String(s.id) === String(stuId) || String(s.student_id) === String(stuId));
    if (!student && students.length) student = students[0];

    const school = MOCK_SCHOOL;
    const exams = getLocalStore('exams', MOCK_EXAMS);
    const exam = exams.find(e => String(e.id) === String(examId)) || exams[0] || null;

    if (['id_card', 'certificate', 'commendation_certificate', 'transfer_certificate', 'bonafide_certificate'].includes(type)) {
      return {
        type,
        school,
        student,
        issue_date: new Date().toISOString().slice(0, 10)
      };
    }

    if (type === 'admit_card') {
      return {
        type,
        school,
        student,
        exam: exam || { name_bn: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', start_date: '2026-10-20', end_date: '2026-11-05' },
        issue_date: new Date().toISOString().slice(0, 10)
      };
    }

    if (type === 'marksheet' || type === 'progress_report') {
      let subs = getLocalStore('subjects', MOCK_SUBJECTS);
      const studentClass = student?.class_name || cls;
      const classSubs = subs.filter(s => !s.class_name || String(s.class_name) === String(studentClass));
      const marks = classSubs.slice(0, 8).map((sub, i) => ({
        id: 'm-' + i,
        subject_name: sub.name_bn,
        subject_name_en: sub.name_en,
        full_marks: sub.full_marks || 100,
        written: 50 + (i * 3) % 20,
        mcq: 20 + (i * 2) % 10,
        practical: sub.practical_marks ? 20 : 0,
        total: 70 + (i * 3) % 25,
        grade: 'A',
        gpa: 4.0
      }));
      return {
        type,
        school,
        student,
        exam: exam || { name_bn: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬' },
        marks,
        summary: { total_marks: 615, full_marks: 800, percentage: 76.8, gpa: 4.50, result_status: 'উত্তীর্ণ' },
        issue_date: new Date().toISOString().slice(0, 10)
      };
    }

    if (type === 'tabulation' || type === 'merit_list') {
      const targetClass = cls || student?.class_name || '10';
      const classStudents = students.filter(s => String(s.class_name) === String(targetClass)).slice(0, 20);
      const list = classStudents.map((s, idx) => ({
        id: s.id,
        merit: idx + 1,
        roll_no: s.roll_no,
        name_bn: s.name_bn,
        name_en: s.name_en,
        subjects: 8,
        total_marks: 750 - idx * 12,
        gpa: (5.0 - idx * 0.08).toFixed(2),
        result_status: 'উত্তীর্ণ'
      }));
      return {
        type,
        school,
        student,
        exam: exam || { name_bn: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬' },
        list,
        issue_date: new Date().toISOString().slice(0, 10)
      };
    }

    return {
      type,
      school,
      student,
      issue_date: new Date().toISOString().slice(0, 10)
    };
  }

  // Default fallback
  return [];
}
