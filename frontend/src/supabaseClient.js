// Supabase Client & Real-time Cloud Sync Engine for Magra School Management ERP V118

const STORAGE_KEY_URL = 'magra_supabase_url';
const STORAGE_KEY_KEY = 'magra_supabase_anon_key';
const STORAGE_KEY_AUTO_SYNC = 'magra_supabase_auto_sync';

export function getSupabaseConfig() {
  const url = (localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (localStorage.getItem(STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const autoSync = localStorage.getItem(STORAGE_KEY_AUTO_SYNC) !== 'false';
  return { url, anonKey, autoSync, isConfigured: Boolean(url && anonKey) };
}

export function saveSupabaseConfig(url, anonKey, autoSync = true) {
  const cleanUrl = (url || '').trim().replace(/\/+$/, '');
  const cleanKey = (anonKey || '').trim();
  if (cleanUrl) localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (cleanKey) localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
  else localStorage.removeItem(STORAGE_KEY_KEY);

  localStorage.setItem(STORAGE_KEY_AUTO_SYNC, String(autoSync));
  return getSupabaseConfig();
}

export async function testSupabaseConnection(url, anonKey) {
  const targetUrl = (url || '').trim().replace(/\/+$/, '');
  const targetKey = (anonKey || '').trim();
  if (!targetUrl || !targetKey) throw new Error('Supabase URL এবং Anon Key উভয়ই প্রয়োজন');

  const endpoint = `${targetUrl}/rest/v1/teachers?select=count`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: targetKey,
      Authorization: `Bearer ${targetKey}`,
      Prefer: 'count=exact'
    }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`সংযোগে ত্রুটি (${res.status}): ${txt || 'URL বা Key সঠিক নয়'}`);
  }
  return { ok: true, status: res.status };
}

export async function supabaseRequest(table, options = {}) {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const { method = 'GET', query = '', body = null, headers = {} } = options;
  const queryString = query ? (query.startsWith('?') ? query : `?${query}`) : '';
  const endpoint = `${url}/rest/v1/${table}${queryString}`;

  const defaultHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    ...headers
  };

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!defaultHeaders['Prefer']) {
      defaultHeaders['Prefer'] = 'return=representation,resolution=merge-duplicates';
    }
  }

  const fetchOptions = {
    method,
    headers: defaultHeaders
  };
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(endpoint, fetchOptions);
  if (!res.ok) {
    const errorText = await res.text();
    console.warn(`Supabase ${method} on ${table} error:`, errorText);
    throw new Error(errorText || `Supabase error (${res.status})`);
  }

  if (res.status === 204) return null;
  return await res.json();
}

// 1-Click Upload Local Storage Database to Supabase Cloud
export async function uploadLocalToSupabase() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) throw new Error('প্রথমে Supabase URL ও Anon Key সংরক্ষণ করুন');

  const results = { teachers: 0, students: 0, staff: 0, notices: 0 };
  const errors = [];

  // Helper to find data across possible localStorage keys
  function findLocalStorageData(primaryKey, fallbackKeys = []) {
    const allKeys = [primaryKey, ...fallbackKeys];
    for (const k of allKeys) {
      try {
        const item = localStorage.getItem(k);
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    // Also scan all localStorage keys for partial matches if still not found
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.toLowerCase().includes(primaryKey.replace('magra_db_', ''))) {
          const item = localStorage.getItem(k);
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return [];
  }

  // 1. Teachers
  try {
    const teachers = findLocalStorageData('magra_db_teachers', ['teachers', 'magra_teachers', 'magra_db_teachers_list']);
    if (teachers.length) {
      const cleanTeachers = teachers.map((t, idx) => ({
        id: String(t.id || ('t_' + (idx + 1) + '_' + Date.now())),
        employee_id: t.employee_id || ('EMP-' + (1000 + idx + 1)),
        name_bn: t.name_bn || t.name_en || 'শিক্ষক',
        name_en: t.name_en || null,
        designation: t.designation || null,
        designation_en: t.designation_en || null,
        subject: t.subject || null,
        phone: t.phone || null,
        email: t.email || null,
        gender: t.gender || null,
        address: t.address || null,
        photo_url: t.photo_url || null,
        status: t.status || 'active',
        joining_date: t.joining_date || null,
        public_contact_role: t.public_contact_role || null,
        public_contact_enabled: t.public_contact_enabled !== false,
        mpo_index_no: t.mpo_index_no || null,
        teacher_registration_no: t.teacher_registration_no || null,
        nid_no: t.nid_no || null,
        extended_profile: t.extended_profile || {}
      }));
      await supabaseRequest('teachers', {
        method: 'POST',
        body: cleanTeachers,
        headers: { Prefer: 'resolution=merge-duplicates' }
      });
      // Also ensure stored in standard local key
      localStorage.setItem('magra_db_teachers', JSON.stringify(cleanTeachers));
      results.teachers = cleanTeachers.length;
    }
  } catch (e) {
    console.error('Teachers cloud upload error:', e);
    errors.push('শিক্ষক: ' + (e.message || 'ত্রুটি'));
  }

  // 2. Staff
  try {
    const staff = findLocalStorageData('magra_db_staff', ['staff', 'magra_staff']);
    if (staff.length) {
      const cleanStaff = staff.map((s, idx) => ({
        id: String(s.id || ('stf_' + (idx + 1) + '_' + Date.now())),
        employee_id: s.employee_id || ('STF-' + (2000 + idx + 1)),
        name_bn: s.name_bn || s.name_en || 'কর্মচারী',
        name_en: s.name_en || null,
        designation: s.designation || null,
        designation_en: s.designation_en || null,
        phone: s.phone || null,
        email: s.email || null,
        photo_url: s.photo_url || null,
        status: s.status || 'active',
        joining_date: s.joining_date || null,
        public_contact_role: s.public_contact_role || null,
        public_contact_enabled: s.public_contact_enabled !== false
      }));
      await supabaseRequest('staff', {
        method: 'POST',
        body: cleanStaff,
        headers: { Prefer: 'resolution=merge-duplicates' }
      });
      localStorage.setItem('magra_db_staff', JSON.stringify(cleanStaff));
      results.staff = cleanStaff.length;
    }
  } catch (e) {
    console.error('Staff cloud upload error:', e);
    errors.push('কর্মচারী: ' + (e.message || 'ত্রুটি'));
  }

  // 3. Students
  try {
    const students = findLocalStorageData('magra_db_students', ['students', 'magra_students']);
    if (students.length) {
      const cleanStudents = students.map((s, idx) => ({
        id: String(s.id || ('st_' + (idx + 1) + '_' + Date.now())),
        student_id: s.student_id || ('STU-' + (1000 + idx + 1)),
        roll_no: s.roll_no ? Number(s.roll_no) : (idx + 1),
        name_bn: s.name_bn || s.name_en || 'শিক্ষার্থী',
        name_en: s.name_en || null,
        class_name: String(s.class_name || '6'),
        section: s.section || null,
        gender: s.gender || null,
        date_of_birth: s.date_of_birth || null,
        blood_group: s.blood_group || null,
        religion: s.religion || null,
        father_name: s.father_name || null,
        mother_name: s.mother_name || null,
        guardian_name: s.guardian_name || null,
        guardian_phone: s.guardian_phone || null,
        current_village: s.current_village || null,
        current_upazila: s.current_upazila || null,
        current_district: s.current_district || null,
        permanent_village: s.permanent_village || null,
        permanent_upazila: s.permanent_upazila || null,
        permanent_district: s.permanent_district || null,
        photo_url: s.photo_url || null,
        status: s.status || 'active',
        admission_date: s.admission_date || null,
        voter_no: s.voter_no || null,
        voter_name: s.voter_name || null
      }));
      await supabaseRequest('students', {
        method: 'POST',
        body: cleanStudents,
        headers: { Prefer: 'resolution=merge-duplicates' }
      });
      localStorage.setItem('magra_db_students', JSON.stringify(cleanStudents));
      results.students = cleanStudents.length;
    }
  } catch (e) {
    console.error('Students cloud upload error:', e);
    errors.push('শিক্ষার্থী: ' + (e.message || 'ত্রুটি'));
  }

  if (errors.length && (results.teachers === 0 && results.students === 0 && results.staff === 0)) {
    throw new Error(errors.join(', '));
  }

  return results;
}

// 1-Click Download Supabase Cloud Database to Local Storage
export async function downloadSupabaseToLocal() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) throw new Error('প্রথমে Supabase URL ও Anon Key সংরক্ষণ করুন');

  const results = { teachers: 0, students: 0, staff: 0, notices: 0 };

  try {
    const teachers = await supabaseRequest('teachers', { query: 'select=*&order=name_bn.asc' });
    if (Array.isArray(teachers) && teachers.length) {
      localStorage.setItem('magra_db_teachers', JSON.stringify(teachers));
      results.teachers = teachers.length;
    }
  } catch (e) {
    console.error('Download teachers error:', e);
  }

  try {
    const staff = await supabaseRequest('staff', { query: 'select=*&order=name_bn.asc' });
    if (Array.isArray(staff) && staff.length) {
      localStorage.setItem('magra_db_staff', JSON.stringify(staff));
      results.staff = staff.length;
    }
  } catch (e) {
    console.error('Download staff error:', e);
  }

  try {
    const students = await supabaseRequest('students', { query: 'select=*&order=roll_no.asc' });
    if (Array.isArray(students) && students.length) {
      localStorage.setItem('magra_db_students', JSON.stringify(students));
      results.students = students.length;
    }
  } catch (e) {
    console.error('Download students error:', e);
  }

  try {
    const notices = await supabaseRequest('notices', { query: 'select=*&order=id.desc' });
    if (Array.isArray(notices) && notices.length) {
      localStorage.setItem('magra_db_notices', JSON.stringify(notices));
      results.notices = notices.length;
    }
  } catch (e) {
    console.error('Download notices error:', e);
  }

  return results;
}
