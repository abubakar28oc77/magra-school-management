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

  // 1. Teachers
  try {
    const teachers = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
    if (teachers.length) {
      const cleanTeachers = teachers.map(t => ({
        id: String(t.id || ('t_' + Date.now())),
        employee_id: t.employee_id || null,
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
      results.teachers = cleanTeachers.length;
    }
  } catch (e) {
    console.error('Teachers cloud upload error:', e);
  }

  // 2. Staff
  try {
    const staff = JSON.parse(localStorage.getItem('magra_db_staff') || '[]');
    if (staff.length) {
      const cleanStaff = staff.map(s => ({
        id: String(s.id || ('stf_' + Date.now())),
        employee_id: s.employee_id || null,
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
      results.staff = cleanStaff.length;
    }
  } catch (e) {
    console.error('Staff cloud upload error:', e);
  }

  // 3. Students
  try {
    const students = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
    if (students.length) {
      const cleanStudents = students.map(s => ({
        id: String(s.id || ('st_' + Date.now())),
        student_id: s.student_id || null,
        roll_no: s.roll_no ? Number(s.roll_no) : null,
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
      results.students = cleanStudents.length;
    }
  } catch (e) {
    console.error('Students cloud upload error:', e);
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
