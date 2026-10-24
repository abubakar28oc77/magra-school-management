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

export function toBnDigits(n) {
  if (n === null || n === undefined || n === '') return '';
  return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

export function sortPeopleByEmployeeId(list = []) {
  return [...(list || [])].sort((a, b) => {
    const na = parseEmployeeIdNum(a?.employee_id || a?.id);
    const nb = parseEmployeeIdNum(b?.employee_id || b?.id);
    if (na !== nb) return na - nb;
    return String(a?.employee_id || a?.name_bn || '').localeCompare(String(b?.employee_id || b?.name_bn || ''), undefined, { numeric: true });
  });
}

import React,{useEffect,useMemo,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter,useNavigate,useLocation,Link} from 'react-router-dom';
import './styles.css';
import {publicNavConfig} from './publicNavConfig';
import {LanguageProvider,useLanguage,bilingual,LanguageSwitcher} from './i18n';
import {requestApi, deduplicateTeachers} from './apiClient';
import {getSchoolTeachers, isAssignedRoleTeacher, getRoleDefaultDesk} from './mockData';
import {SubmenuDetailModal} from './SubmenuDetailModal';
import SupabaseSyncModal from './SupabaseSyncModal';
import {calculateStudentAge, matchesAgeFilter, parseNum} from './StudentAgeQueryModal';
import {StudentTotListModal} from './StudentTotListModal';
import {StudentDisabilityQueryModal, isSpecialNeedsStudent, getDisabilityType} from './StudentDisabilityQueryModal';
import {StudentProfessionQueryModal, ALL_PROFESSIONS_LIST, matchesStudentProfession} from './StudentProfessionQueryModal';
import {TeacherQueryModal, IN_SERVICE_TITLES_LIST, getTeacherAllEducation} from './TeacherQueryModal';
import {StudentIdCardModal} from './StudentIdCardModal';
import {StudentCertificatesModal} from './StudentCertificatesModal';
import { StaffCertificatesModal } from './StaffCertificatesModal.jsx';
import {StudentProfileModal} from './StudentProfileModal';
import { ResultPanel } from './ResultPanel.jsx';
import { FinancePanel } from './FinancePanel.jsx';
import { AdmissionPanel } from './AdmissionPanel.jsx';
import { RoutinePanel } from './RoutinePanel.jsx';
import { AttendancePanel } from './AttendancePanel.jsx';
import { PublicAttendancePortal } from './PublicAttendancePortal.jsx';
import { LibraryPanel } from './LibraryPanel.jsx';
import { QuestionBankPanel } from './QuestionBankPanel.jsx';
import {
  sanitizeStoredUser,
  MOCK_USERS,
  MOCK_TEACHERS,
  MOCK_STAFF,
  MOCK_STUDENTS,
  PHOTO_PRESIDENT,
  PHOTO_HEAD_TEACHER,
  PHOTO_ASST_HEAD_TEACHER,
  PHOTO_ICT_TEACHER,
  PHOTO_OFFICE_ASSISTANT,
  PHOTO_STUDENT_MALE_1,
  PHOTO_STUDENT_MALE_2,
  PHOTO_STUDENT_FEMALE_1,
  PHOTO_REAL_STUDENT_7,
  PHOTO_REAL_STUDENT_8,
  PHOTO_REAL_STUDENT_9,
  getTeacherPhoto,
  getStudentPhoto,
  saveStudentCustomPhoto,
  getLeadershipData,
  DEFAULT_LEADERSHIP_DATA
} from './mockData';

// Immediate Startup Session Sanitizer
try {
  const rawBootUser = localStorage.getItem('magra_user');
  if (rawBootUser && rawBootUser !== 'undefined' && rawBootUser !== 'null') {
    const parsedBoot = JSON.parse(rawBootUser);
    if (parsedBoot && (parsedBoot.login_id || parsedBoot.id)) {
      const sanitizedBoot = sanitizeStoredUser(parsedBoot);
      localStorage.setItem('magra_user', JSON.stringify(sanitizedBoot));
    }
  }
} catch {}


export function resolveDistinguishedStudents(allStudents = []) {
  const normClass = (c) => {
    if (c === null || c === undefined) return '';
    return String(c)
      .replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d)
      .replace(/[^0-9]/g, '');
  };

  const normRoll = (r) => {
    if (r === null || r === undefined || r === '') return -1;
    const clean = String(r).replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d);
    const n = parseInt(clean, 10);
    return isNaN(n) ? -1 : n;
  };

  const isScience = (s) => {
    const sid = String(s.student_id || s.id || '').toUpperCase();
    if (sid.includes('-SCI') || sid.includes('_SCI') || sid.includes('SCI-') || sid.includes('/SCI')) return true;
    const dept = (s.department || '').toLowerCase();
    if (dept.includes('বিজ্ঞান') || dept.includes('science') || dept === 'sci') return true;
    const grp = (s.group_name || s.group || s.section || '').toLowerCase();
    if (grp.includes('বিজ্ঞান') || grp.includes('science')) return true;
    return false;
  };

  const targets = [
    {
      slotKey: 'class-7-roll-1',
      classNum: '7',
      classLabel: '৭ম শ্রেণি',
      rollNo: 1,
      rollLabel: '১',
      hasDept: false,
      deptLabel: '',
      fallback: {
        id: 'stu-07-01',
        student_id: 'STU-07-01',
        name_bn: 'মাহির ফয়সাল',
        name_en: 'Mahir Faysal',
        class_name: '7',
        roll_no: 1,
        gender: 'পুরুষ',
        department: 'সাধারণ',
        photo_url: PHOTO_REAL_STUDENT_7
      }
    },
    {
      slotKey: 'class-8-roll-1',
      classNum: '8',
      classLabel: '৮ম শ্রেণি',
      rollNo: 1,
      rollLabel: '১',
      hasDept: false,
      deptLabel: '',
      fallback: {
        id: 'stu-08-01',
        student_id: 'STU-08-01',
        name_bn: 'সাদিয়া আক্তার',
        name_en: 'Sadia Akter',
        class_name: '8',
        roll_no: 1,
        gender: 'নারী',
        department: 'সাধারণ',
        photo_url: PHOTO_REAL_STUDENT_8
      }
    },
    {
      slotKey: 'class-9-sci-roll-1',
      classNum: '9',
      classLabel: '৯ম শ্রেণি',
      rollNo: 1,
      rollLabel: '১',
      hasDept: true,
      deptLabel: 'বিজ্ঞান বিভাগ',
      fallback: {
        id: 'stu-09-sci-01',
        student_id: 'STU-09-SCI-01',
        name_bn: 'তাহমিদ হাসান',
        name_en: 'Tahmid Hasan',
        class_name: '9',
        roll_no: 1,
        gender: 'পুরুষ',
        department: 'বিজ্ঞান',
        group_name: 'বিজ্ঞান বিভাগ',
        photo_url: PHOTO_REAL_STUDENT_9
      }
    },
    {
      slotKey: 'class-10-sci-roll-1',
      classNum: '10',
      classLabel: '১০ম শ্রেণি',
      rollNo: 1,
      rollLabel: '১',
      hasDept: true,
      deptLabel: 'বিজ্ঞান বিভাগ',
      fallback: {
        id: 'stu-10-sci-1',
        student_id: 'STU-10-SCI-01',
        name_bn: 'আহনাফ সিদ্দিক',
        name_en: 'Ahnaf Siddique',
        class_name: '10',
        roll_no: 1,
        gender: 'পুরুষ',
        department: 'বিজ্ঞান',
        group_name: 'বিজ্ঞান বিভাগ',
        photo_url: PHOTO_REAL_STUDENT_9
      }
    }
  ];

  return targets.map(target => {
    let found = null;
    if (Array.isArray(allStudents) && allStudents.length > 0) {
      found = allStudents.find(s => {
        if (!s) return false;
        if (s.status && s.status !== 'active') return false;
        const c = normClass(s.class_name);
        const r = normRoll(s.roll_no);
        if (c !== target.classNum || r !== target.rollNo) return false;
        if (target.hasDept) {
          return isScience(s);
        }
        return true;
      });
    }

    const s = found || target.fallback;
    return {
      ...s,
      slotKey: target.slotKey,
      displayClass: target.classLabel,
      displayRoll: target.rollLabel,
      hasDept: target.hasDept,
      displayDept: target.hasDept ? (s.department && s.department !== 'সাধারণ' ? s.department : 'বিজ্ঞান বিভাগ') : null,
      isEntered: true
    };
  });
}
import logo from '../public/school-logo.png';
import building from '../public/school-building.jpg';

const leadership=[['সভাপতি','নেয়ামুল হক খান'],['প্রধান শিক্ষক','মুহাম্মদ শফিকুল ইসলাম'],['সহকারী প্রধান শিক্ষক','তাপসী সরকার'],['আইসিটি শিক্ষক','মুহাম্মদ আবুবকর সিদ্দিক']];
const modules=[['ড্যাশবোর্ড','dashboard'],['শিক্ষার্থী','students'],['শিক্ষক ও কর্মচারী','staff'],['ভর্তি','admission'],['উপস্থিতি','attendance'],['পরীক্ষা ও ফলাফল','results'],['রুটিন','routine'],['ফি ও হিসাব','finance'],['লাইব্রেরি','library'],['নোটিশ','notice'],['নোটিফিケーション','notifications'],['ডিজিটাল লার্নিং','learning'],['প্রশ্নব্যাংক','question'],['অ্যাসাইনমেন্ট','assignment'],['অনলাইন পরীক্ষা','online_exam'],['AI শিক্ষা','ai'],['রিপোর্ট','reports'],['ডকুমেন্ট ও প্রিন্ট','documents'],['ইউজার ও রোল','users'],['সহশিক্ষা ও অর্জন','content'],['পরিবহন','transport'],['হোস্টেল','hostel'],['সেটিংস','settings']];
const classes=['6','7','8','9','10'];
const ERP_VERSION='V118';
const api = requestApi;
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function downloadCsv(filename,rows,headers){const lines=[headers.map(csvCell).join(','),...rows.map(r=>headers.map(h=>csvCell(r[h])).join(','))];const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
function parseCsvText(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const ch=text[i],nx=text[i+1];if(ch==='"'){if(quoted&&nx==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&nx==='\n')i++;row.push(cell);if(row.some(v=>v.trim()!==''))rows.push(row);row=[];cell='';}else cell+=ch;}if(cell!==''||row.length){row.push(cell);if(row.some(v=>v.trim()!==''))rows.push(row);}return rows;}
function flattenCustom(row){const c=row?.extended_profile?.custom_fields||{};return Object.fromEntries(Object.entries(c).map(([k,v])=>['custom:'+k,Array.isArray(v)?v.join(' | '):typeof v==='object'?JSON.stringify(v):v]))}

export function formatGroup(grp, lang = 'bn') {
  if (!grp || grp === '—' || grp === 'none' || grp === '') return '—';
  if (lang === 'en') {
    if (grp.includes('বিজ্ঞান') || grp.toLowerCase().includes('science')) return 'Science';
    if (grp.includes('মানবিক') || grp.toLowerCase().includes('humanities')) return 'Humanities';
    if (grp.includes('ব্যবসায়') || grp.toLowerCase().includes('business') || grp.toLowerCase().includes('commerce')) return 'Business Studies';
    return grp;
  }
  return grp;
}

export function getStudentGuardian(s, lang = 'bn'){
 if(!s) return '—';
 if(lang === 'en'){
   const ge = (s.guardian_name_en || '').trim();
   if(ge) return ge;
   const fe = (s.father_name_en || '').trim();
   if(fe && !fe.toLowerCase().includes('late') && !fe.toLowerCase().includes('deceased')) return fe;
   const me = (s.mother_name_en || '').trim();
   if(me && !me.toLowerCase().includes('late') && !me.toLowerCase().includes('deceased')) return me;
   if(fe) return fe;
   if(me) return me;
 }
 const g = (s.guardian_name || '').trim();
 if(g) return g;
 const f = (s.father_name || '').trim();
 if(f && !f.includes('মৃত')) return f;
 const m = (s.mother_name || '').trim();
 if(m && !m.includes('মৃত')) return m;
 if(f) return f;
 if(m) return m;
 if(s.guardian_name_en) return s.guardian_name_en;
 if(s.father_name_en) return s.father_name_en;
 if(s.mother_name_en) return s.mother_name_en;
 return '—';
}

export function getStudentPhone(s){
 if(!s) return '—';
 let p = (s.guardian_phone||'').trim() || (s.father_mobile||'').trim() || (s.mother_mobile||'').trim() || (s.emergency_phone||'').trim() || '';
 if (/^1[3-9]\d{8}$/.test(p)) {
   p = '0' + p;
 }
 return p || '—';
}

function CustomFields({ formKey, form, setForm }) {
  const [fields, setFields] = useState([]);
  useEffect(() => {
    if (!formKey) return;
    api(`/admin/form-fields?form_key=${encodeURIComponent(formKey)}`)
      .then(data => {
        if (Array.isArray(data)) {
          setFields(data.filter(f => f && f.enabled !== false && !f.is_system));
        } else {
          setFields([]);
        }
      })
      .catch(() => setFields([]));
  }, [formKey]);

  if (!fields.length) return null;

  const updateCustom = (key, val) => {
    setForm(prev => ({
      ...prev,
      extended_profile: {
        ...(prev.extended_profile || {}),
        custom_fields: {
          ...((prev.extended_profile && prev.extended_profile.custom_fields) || {}),
          [key]: val
        }
      }
    }));
  };

  const customValues = (form && form.extended_profile && form.extended_profile.custom_fields) || {};

  return (
    <>
      <div className="form-section-title full">
        <b>অতিরিক্ত নির্ধারিত ফিল্ড (Custom Fields)</b>
      </div>
      {fields.map(f => {
        const val = customValues[f.field_key] ?? '';
        return (
          <div className="field" key={f.field_key || f.id}>
            <label>{f.label_bn || f.field_label || f.field_key} {f.required ? '*' : ''}</label>
            {f.field_type === 'select' ? (
              <select
                value={val}
                onChange={e => updateCustom(f.field_key, e.target.value)}
                required={!!f.required}
              >
                <option value="">নির্বাচন করুন</option>
                {(f.options || []).map((opt, idx) => (
                  <option key={idx} value={typeof opt === 'string' ? opt : opt.value || opt.label}>
                    {typeof opt === 'string' ? opt : opt.label || opt.value}
                  </option>
                ))}
              </select>
            ) : f.field_type === 'textarea' ? (
              <textarea
                value={val}
                onChange={e => updateCustom(f.field_key, e.target.value)}
                required={!!f.required}
                rows={2}
              />
            ) : (
              <input
                type={f.field_type || 'text'}
                value={val}
                onChange={e => updateCustom(f.field_key, e.target.value)}
                required={!!f.required}
                placeholder={f.placeholder || ''}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', textAlign: 'center', background: '#fff', margin: '20px auto', maxWidth: '600px', borderRadius: '8px', border: '1px solid #fed7d7', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#c53030', margin: '0 0 10px' }}>⚠️ কিছু সমস্যা হয়েছে</h2>
          <p style={{ color: '#4a5568', margin: '0 0 16px' }}>নিচের বাটনে ক্লিক করে পেজটি আবার চালু করুন।</p>
          {this.state.error?.message && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px', margin: '10px 0 16px', textAlign: 'left', wordBreak: 'break-word', fontFamily: 'monospace' }}>
              <strong>ত্রুটি বিবরণ:</strong> {this.state.error.message}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              style={{ padding: '10px 20px', background: '#0b8050', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 6px rgba(11,128,80,0.3)' }}
              onClick={() => {
                try {
                  localStorage.setItem('magra_admin_active_tab', 'dashboard');
                  localStorage.removeItem('magra_admin_active_sub');
                  sessionStorage.clear();
                } catch {}
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              📊 ড্যাশবোর্ডে ফিরে যান (নিরাপদ রিলোড)
            </button>
            <button 
              style={{ padding: '10px 20px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              onClick={() => { 
                try {
                  localStorage.removeItem('magra_admin_active_sub');
                  sessionStorage.clear();
                } catch {}
                this.setState({ hasError: false, error: null }); 
                const base = window.location.href.split('?')[0].split('#')[0];
                window.location.replace(base + '?v=' + Date.now());
                window.location.reload();
              }}
            >
              🔄 ক্যাশ ক্লিয়ার ও রিফ্রেশ করুন
            </button>
            <button 
              style={{ padding: '10px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              onClick={() => { 
                this.setState({ hasError: false, error: null }); 
                window.location.reload();
              }}
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#718096' }}>
            💡 টিপস: ব্রাউজারের পুরাতন ক্যাশ দ্রুত দূর করতে কীবোর্ডে <b>Ctrl + F5</b> অথবা <b>Ctrl + Shift + R</b> চাপুন।
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
const STATUS_BN = {
  active: 'সক্রিয়',
  inactive: 'নিষ্ক্রিয়',
  retired: 'অবসরপ্রাপ্ত',
  former: 'প্রাক্তন',
  graduated: 'উত্তীর্ণ',
  transferred: 'স্থানান্তরিত',
  dropped_out: 'ঝরে পড়া',
  draft: 'খসড়া',
  published: 'প্রকাশিত',
  present: 'উপস্থিত',
  absent: 'অনুপস্থিত',
  late: 'দেরি',
  leave: 'ছুটি'
};
const STATUS_EN = {
  active: 'Active',
  inactive: 'Inactive',
  retired: 'Retired',
  former: 'Former',
  graduated: 'Graduated',
  transferred: 'Transferred',
  dropped_out: 'Dropped Out',
  draft: 'Draft',
  published: 'Published',
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  leave: 'Leave'
};
function statusBn(s, lang = 'bn'){
  if(lang === 'en') return STATUS_EN[s] || s || 'Active';
  return STATUS_BN[s] || s || 'সক্রিয়';
}
function PWAStatus(){
 const[online,setOnline]=useState(navigator.onLine),[installEvent,setInstallEvent]=useState(null),[installed,setInstalled]=useState(false);
 useEffect(()=>{
  const on=()=>setOnline(true),off=()=>setOnline(false),before=e=>{e.preventDefault();setInstallEvent(e)},installedHandler=()=>{setInstalled(true);setInstallEvent(null)};
  window.addEventListener('online',on);window.addEventListener('offline',off);window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',installedHandler);
  return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',installedHandler)};
 },[]);
 async function install(){if(!installEvent)return;await installEvent.prompt();setInstallEvent(null)}
 return <>{!online&&<div className="offline-bar">অফলাইন মোড • সংরক্ষিত পেজ দেখা যাবে; নতুন তথ্যের জন্য ইন্টারনেট প্রয়োজন।</div>}{installEvent&&!installed&&<button className="pwa-install" onClick={install}>📱 অ্যাপ হিসেবে ইনস্টল করুন</button>}</>;
}

const NAV_EN={
 'হোম':'Home','প্রাতিষ্ঠানিক তথ্য':'Institution','ক্রীড়া ও সংস্কৃতি':'Sports & Culture','শিক্ষক ও কর্মচারী':'Teachers & Staff','শিক্ষার্থীর তথ্য':'Students','পরীক্ষার ফলাফল':'Examination & Results','শিক্ষার্থীর গাইড':'Student Guide','নোটিশ':'Notice','গ্যালারি':'Gallery','যোগাযোগ':'Contact','লগইন':'Login',
 'বিদ্যালয় পরিচিতি':'School Profile','সভাপতি ও প্রধান শিক্ষকের বাণী':'Chairman & Head Teacher Messages','পরিচালনা কমিটি':'Governing Committee','নিয়ম-কানুন':'Rules & Regulations','লাইব্রেরি':'Library','পাঠ্যক্রম ও পাঠ্যপুস্তক':'Curriculum & Textbooks','বার্ষিক ক্রীড়া':'Annual Sports','ক্লাব ও সংগঠন':'Clubs & Organizations','সাংস্কৃতিক অনুষ্ঠান':'Cultural Programs','অর্জন ও পুরস্কার':'Achievements & Awards','শিক্ষা সফর':'Educational Tour','বিতর্ক':'Debate','কম্পিউটার ল্যাব':'Computer Lab','মাল্টিমিডিয়া ক্লাস':'Multimedia Class','স্কাউট/গার্লস গাইড':'Scouts / Guides','আন্তঃবিদ্যালয় ক্রীড়া':'Inter-school Sports','প্রধান শিক্ষক':'Head Teacher','সহকারী প্রধান শিক্ষক':'Assistant Head Teacher','সক্রিয় শিক্ষকবৃন্দ':'Active Teachers','সাবেক শিক্ষকবৃন্দ':'Former Teachers','কর্মচারীবৃন্দ':'Staff','সাবেক কর্মচারীবৃন্দ':'Former Staff','সকল শিক্ষার্থী':'All Students','বৃত্তিপ্রাপ্ত শিক্ষার্থী':'Scholarship Students','শ্রেণি ও আসন তথ্য':'Class & Seat Information','কৃতি শিক্ষার্থী':'Distinguished Students','সাবেক কৃতি শিক্ষার্থী':'Former Distinguished Students','ভর্তি পরীক্ষা':'Admission Test','অভ্যন্তরীণ পরীক্ষা':'Internal Exams','SSC ফলাফল':'SSC Results','ফলাফল বিশ্লেষণ':'Result Analysis','মার্কশিট':'Marksheet','প্রগ্রেস রিপোর্ট':'Progress Report','সিলেবাস':'Syllabus','ডিজিটাল লার্নিং':'Digital Learning','নোট/লেকচার':'Notes / Lectures','প্রশ্নব্যাংক ও মডেল প্রশ্ন':'Question Bank & Model Questions','অ্যাসাইনমেন্ট ও মক টেস্ট':'Assignments & Mock Tests','অনলাইন পরীক্ষা':'Online Exam','AI শিক্ষা সহকারী':'AI Study Assistant','প্রধান শিক্ষক':'Head Teacher','সহকারী প্রধান শিক্ষক':'Assistant Head Teacher','আইসিটি শিক্ষক':'ICT Teacher','অফিস সহকারী':'Office Assistant','যোগাযোগ ও ঠিকানা':'Contact & Address'};
const label=(bn,lang)=>lang==='en'?(NAV_EN[bn]||bn):bn;
function Header({ onOpenSubmenu }){
 const {lang}=useLanguage();
 const [open,setOpen]=useState(false),[dropdown,setDropdown]=useState(null),[enabled,setEnabled]=useState(null),[custom,setCustom]=useState([]);
 const closeNav=()=>{setOpen(false);setDropdown(null)};
 const [sessionUser, setSessionUser] = useState(() => {
  try {
   const raw = localStorage.getItem('magra_user');
   if (raw && raw !== 'undefined' && raw !== 'null') {
    const u = JSON.parse(raw);
    if (u && (u.login_id || u.id)) return sanitizeStoredUser(u);
   }
  } catch {}
  return null;
 });
 useEffect(() => {
  const syncSession = () => {
   try {
    const raw = localStorage.getItem('magra_user');
    if (raw && raw !== 'undefined' && raw !== 'null') {
     const u = JSON.parse(raw);
     if (u && (u.login_id || u.id)) {
      setSessionUser(sanitizeStoredUser(u));
      return;
     }
    }
   } catch {}
   setSessionUser(null);
  };
  window.addEventListener('magra_auth_change', syncSession);
  window.addEventListener('storage', syncSession);
  return () => {
   window.removeEventListener('magra_auth_change', syncSession);
   window.removeEventListener('storage', syncSession);
  };
 }, []);
 useEffect(()=>{api('/public/features').then(d=>{const map={};(d.features||[]).forEach(f=>{map[f.feature_key]=f.enabled!==false});setEnabled(map);setCustom(d.custom||[])}).catch(()=>setEnabled(null));const onKey=e=>{if(e.key==='Escape')closeNav()};const onPointer=e=>{if(!e.target.closest('.reference-shell'))closeNav()};window.addEventListener('keydown',onKey);document.addEventListener('pointerdown',onPointer);return()=>{window.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',onPointer)}},[]);
 const isOn=(key)=>enabled===null||enabled[key]!==false;
 const nav=publicNavConfig.filter(item=>isOn(item.key)).map(item=>item.children?{...item,children:item.children.filter(([key])=>isOn(key))}:item).filter(item=>!item.children||item.children.length);

 const handleSubmenuClick=(e, key, text, href)=>{
  if(onOpenSubmenu){
   onOpenSubmenu(key, text);
  }
  if(href && href.startsWith('#')){
   const el=document.querySelector(href);
   if(el){el.scrollIntoView({behavior:'smooth'})}
  }
  closeNav();
 };

 return <header className="site-header reference-shell">
  <div className="topbar"><div className="topbar-inner"><div className="topbar-info"><span>EIIN: <b>114290</b></span><span>MPO: <b>4206071302</b></span><span>Email: <b>magrapuhs.46@gmail.com</b></span></div><div className="topbar-social" aria-label="সামাজিক যোগাযোগ"><span aria-label="Facebook">f</span><span aria-label="YouTube">▶</span></div></div></div>
  <div className="header-inner"><a className="brand" href="#home" onClick={closeNav}><img src={logo} alt="বিদ্যালয়ের লোগো"/><div><h1>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h1><p>মগড়া, কালিহাতি, টাংগাইল</p></div></a><div className="header-actions"><button type="button" className="header-admission-btn" onClick={()=>handleSubmenuClick(null,'public.nav.admission.apply','অনলাইন শিক্ষার্থী ভর্তি আবেদন','#admission')}>🎓 অনলাইন ভর্তি</button><LanguageSwitcher/>{sessionUser ? (
 <a
  className="header-login"
  href="#/admin"
  onClick={closeNav}
  style={{background:'linear-gradient(135deg, #047857 0%, #065f46 100%)',color:'#fff',border:'1px solid #10b981',display:'inline-flex',alignItems:'center',gap:'5px',fontWeight:800}}
  title={`${sessionUser.full_name || 'ইউজার'} (${sessionUser.role_label || sessionUser.role_name}) - পোর্টালে প্রবেশ করুন`}
 >
  {sessionUser.role_name === 'super_admin' ? '👑 সুপার অ্যাডমিন ERP' :
   sessionUser.role_name === 'admin' ? '🎓 প্রধান শিক্ষক / অ্যাডমিন' :
   sessionUser.role_name === 'co_admin' ? `👨‍🏫 শ্রেণি শিক্ষক (${sessionUser.assigned_class ? (sessionUser.assigned_class==='6'?'৬ষ্ঠ':sessionUser.assigned_class==='7'?'৭ম':sessionUser.assigned_class==='8'?'৮ম':sessionUser.assigned_class==='9'?'৯ম':'১০ম')+' শ্রেণি':''})` :
   sessionUser.role_name === 'teacher' ? '📖 বিষয় শিক্ষক ডেস্ক' :
   sessionUser.role_name === 'staff' ? '🏢 অফিস সহকারী ডেস্ক' :
   sessionUser.role_name === 'librarian' ? '📚 লাইব্রেরি ডেস্ক' : 'ড্যাশবোর্ড'}
 </a>
) : (
 <a className="header-login" href="#/login" onClick={closeNav}>{label('লগইন',lang)}</a>
)}<button className="nav-toggle" onClick={()=>setOpen(!open)} aria-label="মেনু" aria-controls="public-navigation" aria-expanded={open}>☰</button></div></div>
  <div className="nav-band"><nav id="public-navigation" className={open?'open':''} aria-label="প্রধান নেভিগেশন">
   {nav.map((item,i)=>item.children ? <div className={'nav-dropdown '+(dropdown===i?'active':'')} key={item.key}>
    <button className="nav-drop-trigger" type="button" aria-expanded={dropdown===i} aria-haspopup="menu" onClick={()=>setDropdown(dropdown===i?null:i)}>{lang==='bi'?<>{item.label}<small className="lang-secondary">{NAV_EN[item.label]||''}</small></>:label(item.label,lang)}<span className="chevron">⌄</span></button>
    <div className="nav-menu" role="menu">{item.children.map(([key,text,href])=><a key={key} href={href} role="menuitem" onClick={(e)=>handleSubmenuClick(e,key,text,href)}>{lang==='bi'?<>{text}<small className="lang-secondary">{NAV_EN[text]||''}</small></>:label(text,lang)}</a>)}</div>
   </div> : item.emphasis ? <a className="nav-login-link" key={item.key} href={item.href} onClick={closeNav}>🔐 {lang==='bi'?<>{item.label}<small className="lang-secondary">{NAV_EN[item.label]||''}</small></>:label(item.label,lang)}</a> : <a key={item.key} href={item.href} onClick={closeNav}>{lang==='bi'?<>{item.label}<small className="lang-secondary">{NAV_EN[item.label]||''}</small></>:label(item.label,lang)}</a>)}
   {custom.filter(x=>x.enabled!==false&&['public','both'].includes(x.placement)).map(x=><a key={'custom-'+x.id} href={x.target_url} onClick={closeNav}>{x.icon||'✨'} {x.title_bn}</a>)}
  </nav></div>
 </header>
}

try {
  const rawS = JSON.parse(localStorage.getItem('magra_db_staff') || '[]');
  if (Array.isArray(rawS)) {
    const cleaned = rawS.filter(s => {
      if (!s) return false;
      const isMock = s.id === 's-1' || s.id === 's-2' || s.id === 's-3' || 
                     s.employee_id === 'STF-2001' || s.employee_id === 'STF-2002' || s.employee_id === 'STF-2003' ||
                     (s.name_bn && (s.name_bn.includes('জালাল উদ্দিন') || s.name_bn.includes('জহিরুল ইসলাম')));
      return !isMock;
    });
    if (cleaned.length !== rawS.length) {
      localStorage.setItem('magra_db_staff', JSON.stringify(cleaned));
    }
  }
} catch {}

function Home(){
 const[notices,setNotices]=useState([]),[items,setItems]=useState([]),[contacts,setContacts]=useState([]),[teachersList,setTeachersList]=useState([]),[stats,setStats]=useState(null),[activeModal,setActiveModal]=useState(null);
 const[customLinks,setCustomLinks]=useState(()=>{try{return JSON.parse(localStorage.getItem('magra_important_links')||'[]')}catch{return []}});
 const[showAddLink,setShowAddLink]=useState(false),[newLinkTitle,setNewLinkTitle]=useState(''),[newLinkUrl,setNewLinkUrl]=useState('');
 const[isRollingPaused,setIsRollingPaused]=useState(false);
 const[supabaseSyncOpen,setSupabaseSyncOpen]=useState(false);
 const teachersTrackRef=useRef(null);
 const nav=useNavigate();
 
 const emptyAdmissionForm={
  academic_year:'2026',
  applied_class:'৬',
  applicant_name_bn:'',
  applicant_name_en:'',
  date_of_birth:'',
  gender:'পুরুষ',
  religion:'ইসলাম',
  blood_group:'A+',
  birth_registration_no:'',
  father_name:'',
  father_phone:'',
  mother_name:'',
  mother_phone:'',
  guardian_name:'',
  guardian_phone:'',
  address:'',
  previous_school:'',
  quota:'সাধারণ',
  notes:''
 };
 const[admissionForm,setAdmissionForm]=useState(emptyAdmissionForm);
 const[admissionSubmitting,setAdmissionSubmitting]=useState(false);
 const[admissionMsg,setAdmissionMsg]=useState('');
 const[admissionReceipt,setAdmissionReceipt]=useState(null);

 const toBn=n=>String(n??0).replace(/[0-9]/g,d=>'০১২৩৪৫৬৭৮৯'[d]);

 const [photoUpdateVersion, setPhotoUpdateVersion] = useState(0);

 const resolvedDistinguished = useMemo(() => {
   let rawList = [];
   try {
     const local = localStorage.getItem('magra_db_students');
     if (local) {
       const parsed = JSON.parse(local);
       if (Array.isArray(parsed) && parsed.length) rawList = parsed;
     }
   } catch {}
   if (!rawList.length && Array.isArray(MOCK_STUDENTS)) {
     rawList = MOCK_STUDENTS;
   }
   return resolveDistinguishedStudents(rawList);
 }, [photoUpdateVersion]);

 const handleStudentPhotoDirectUpload = (e, targetStudent) => {
   const f = e.target.files?.[0];
   if (!f || !targetStudent) return;
   if (f.size > 5 * 1024 * 1024) {
     alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে হবে');
     return;
   }
   const r = new FileReader();
   r.onload = () => {
     const img = new Image();
     img.onload = () => {
       const canvas = document.createElement('canvas');
       const maxW = 320, maxH = 380;
       let w = img.width, h = img.height;
       if (w > maxW || h > maxH) {
         const ratio = Math.min(maxW / w, maxH / h);
         w = Math.round(w * ratio);
         h = Math.round(h * ratio);
       }
       canvas.width = w;
       canvas.height = h;
       const ctx = canvas.getContext('2d');
       ctx.drawImage(img, 0, 0, w, h);
       const compressed = canvas.toDataURL('image/jpeg', 0.88);

       const sId = targetStudent.id || targetStudent.student_id;
       const cName = String(targetStudent.class_name || targetStudent.classNum || '').replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d);
       const rNo = String(targetStudent.roll_no || targetStudent.rollNo || '1').replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d);

       try {
         if (sId) localStorage.setItem('magra_photo_' + sId, compressed);
         if (targetStudent.student_id) localStorage.setItem('magra_photo_' + targetStudent.student_id, compressed);
         if (cName && rNo) {
           localStorage.setItem(`magra_photo_cls_${cName}_roll_${rNo}`, compressed);
           localStorage.setItem(`magra_photo_${cName}_${rNo}`, compressed);
         }
         if (cName === '10' && rNo === '1') localStorage.setItem('magra_photo_STU-10-SCI-01', compressed);
         if (cName === '9' && rNo === '1') localStorage.setItem('magra_photo_STU-09-SCI-01', compressed);
         if (cName === '8' && rNo === '1') localStorage.setItem('magra_photo_STU-08-01', compressed);
         if (cName === '7' && rNo === '1') localStorage.setItem('magra_photo_STU-07-01', compressed);

         const raw = localStorage.getItem('magra_db_students');
         if (raw) {
           const list = JSON.parse(raw);
           if (Array.isArray(list)) {
             const updated = list.map(x => {
               const xc = String(x.class_name || '').replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d);
               const xr = String(x.roll_no || '').replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d);
               if (String(x.id) === String(sId) || String(x.student_id) === String(targetStudent.student_id) || (xc === cName && xr === rNo)) {
                 return { ...x, photo_url: compressed, photo: compressed };
               }
               return x;
             });
             localStorage.setItem('magra_db_students', JSON.stringify(updated));
           }
         }
       } catch {}

       setPhotoUpdateVersion(v => v + 1);
       alert(`${targetStudent.name_bn}-এর ছবি সফলভাবে আপলোড ও হালনাগাদ করা হয়েছে!`);
     };
     img.src = r.result;
   };
   r.readAsDataURL(f);
 };

 const ensureTeachersEducation = (list) => {
   if (!Array.isArray(list) || !list.length) return list;
   const cleanList = deduplicateTeachers(list);
   let changed = cleanList.length !== list.length;
   const enriched = cleanList.map(t => {
     const curEdu = t.extended_profile?.education || [];
     if (!curEdu.length) {
       const fullEdu = getTeacherAllEducation(t);
       if (fullEdu.length) {
         changed = true;
         return {
           ...t,
           extended_profile: {
             ...(t.extended_profile || {}),
             education: fullEdu
           }
         };
       }
     }
     return t;
   });
   if (changed) {
     try { localStorage.setItem('magra_db_teachers', JSON.stringify(enriched)); } catch {}
   }
   return enriched;
 };

 useEffect(()=>{
  api('/notices').then(setNotices).catch(()=>{});
  api('/public/content').then(setItems).catch(()=>{});
  api('/public/student-stats').then(setStats).catch(()=>setStats(null));
  api('/teachers?status=active').then(d=>{
   if(Array.isArray(d)&&d.length) setTeachersList(ensureTeachersEducation(d));
   else {
     try {
       const local=JSON.parse(localStorage.getItem('magra_db_teachers')||'[]');
       setTeachersList(ensureTeachersEducation(local.length>0?local:MOCK_TEACHERS));
     } catch { setTeachersList(MOCK_TEACHERS); }
   }
  }).catch(()=>{
     try {
       const local=JSON.parse(localStorage.getItem('magra_db_teachers')||'[]');
       setTeachersList(ensureTeachersEducation(local.length>0?local:MOCK_TEACHERS));
     } catch { setTeachersList(MOCK_TEACHERS); }
  });
  api('/public/contact').then(d=>{
   if(d&&Array.isArray(d.contacts)&&d.contacts.length) setContacts(d.contacts);
  }).catch(()=>{});
 },[]);

 const normalizeRows = (rows) => {
    if (!rows || !Array.isArray(rows)) return [];
    const map = {};
    rows.forEach(r => {
      let label = r.label || 'অনির্দিষ্ট';
      if (typeof label === 'string') {
        const l = label.trim().toLowerCase().normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '');
        if (l.includes('ইসলাম') || l.includes('islam') || l.includes('মুসলিম') || l.includes('muslim')) label = 'ইসলাম';
        else if (l.includes('হিন্দু') || l.includes('hindu') || l.includes('সনাতন') || l.includes('sanatan')) label = 'হিন্দু';
        else if (l.includes('বৌদ্ধ') || l.includes('buddhist')) label = 'বৌদ্ধ';
        else if (l.includes('খ্রিষ্টান') || l.includes('খ্রিস্টান') || l.includes('christian')) label = 'খ্রিষ্টান';
        else if (l.includes('অন্যান্য') || l.includes('other')) label = 'অন্যান্য';
      }
      map[label] = (map[label] || 0) + Number(r.count || 0);
    });
    return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  };
  const pct = (rows) => {
    const clean = normalizeRows(rows);
    const total = clean.reduce((a, x) => a + Number(x.count || 0), 0);
    if (!total) return '—';
    const top = clean[0];
    return top ? toBn(Math.round(Number(top.count) * 100 / total)) + '%' : '—';
  };
  const labels = (rows) => {
    const clean = normalizeRows(rows);
    return clean && clean.length ? clean.filter(x => x.count > 0).slice(0, 3).map(x => `${x.label} ${toBn(x.count)}`).join(' | ') || 'এন্ট্রি অনুযায়ী হালনাগাদ হবে' : 'এন্ট্রি অনুযায়ী হালনাগাদ হবে';
  };
 
 const [lightbox,setLightbox]=useState(null); const gallery=items.filter(x=>x.content_type==='gallery'&&x.image_url).slice(0,8);
 const services=[
  ['🎓','অনলাইন ভর্তি','ভর্তি আবেদন, তথ্য ও প্রক্রিয়া'],['📊','অনলাইন ফলাফল','ফলাফল, GPA ও মার্কশিট'],['📚','ডিজিটাল শিক্ষা','সিলেবাস, নোট, MCQ ও CQ'],['🕘','স্মার্ট উপস্থিতি','দৈনিক উপস্থিতি ও অভিভাবক সতর্কতা'],
  ['🗓️','ডিজিটাল রুটিন','ক্লাস, পরীক্ষা ও শিক্ষক রুটিন'],['📢','নোটিশ ও যোগাযোগ','নোটিশ, ঘোষণা ও জরুরি তথ্য'],['📝','অনলাইন পরীক্ষা','কুইজ, মডেল টেস্ট ও অনলাইন পরীক্ষা'],['🏆','বৃত্তি ও অর্জন','বৃত্তি, পুরস্কার ও সাফল্যের তথ্য'],
  ['📖','লাইব্রেরি','বই, সদস্য ও পাঠাভ্যাস'],['👨‍🏫','শিক্ষক ও কর্মচারী','শিক্ষকবৃন্দ ও কর্মচারী তথ্য'],['⚽','ক্রীড়া ও সংস্কৃতি','ক্রীড়া, বিতর্ক ও সাংস্কৃতিক কার্যক্রম'],['🔬','বিজ্ঞান ক্লাব','বিজ্ঞানচর্চা, প্রকল্প, প্রদর্শনী ও বিজ্ঞান মেলা'],['💻','আইসিটি ক্লাব','প্রযুক্তি, প্রোগ্রামিং, ডিজিটাল দক্ষতা ও উদ্ভাবন'],['📚','ভাষা ও সাহিত্য ক্লাব','বাংলা-ইংরেজি ভাষা, সাহিত্যচর্চা, আবৃত্তি ও সৃজনশীল লেখা'],['🎤','ডিবেটিং ক্লাব','বিতর্কচর্চা, যুক্তি, উপস্থাপনা ও প্রতিযোগিতা'],['🖼️','ফটো ও ভিডিও গ্যালারি','বিদ্যালয়ের স্মরণীয় মুহূর্ত']
 ];

 const defaultLinks=[
  ['শিক্ষা মন্ত্রণালয়','https://moedu.gov.bd/'],
  ['মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর','https://dshe.gov.bd/'],
  ['ব্যানবেইস (BANBEIS)','https://www.banbeis.gov.bd/'],
  ['এনটিআরসিএ (NTRCA)','http://www.ntrca.gov.bd/'],
  ['বাংলাদেশ জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড','https://nctb.gov.bd/'],
  ['শিক্ষক বাতায়ন','https://teachers.gov.bd/'],
  ['বাংলাদেশ জাতীয় তথ্য বাতায়ন','https://bangladesh.gov.bd/'],
  ['জাতীয় শিক্ষার্থী নিবন্ধন','https://www.educationboardresults.gov.bd/']
 ];
 const boardLinks=[['ঢাকা শিক্ষা বোর্ড','https://www.dhakaeducationboard.gov.bd/'],['রাজশাহী শিক্ষা বোর্ড','https://rajshahieducationboard.gov.bd/'],['চট্টগ্রাম শিক্ষা বোর্ড','https://bise-ctg.portal.gov.bd/'],['কুমিল্লা শিক্ষা বোর্ড','https://comillaboard.portal.gov.bd/'],['যশোর শিক্ষা বোর্ড','https://www.jessoreboard.gov.bd/'],['ময়মনসিংহ শিক্ষা বোর্ড','https://mymensingheducationboard.gov.bd/']];
 
 const [leadershipVer, setLeadershipVer] = useState(0);
 useEffect(() => {
  const handleLeadershipUpdate = () => {
   setLeadershipVer(v => v + 1);
   try {
    const local = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
    if (Array.isArray(local) && local.length) setTeachersList(local);
   } catch {}
   api('/teachers?status=active').then(d => {
    if (Array.isArray(d) && d.length) setTeachersList(d);
   }).catch(() => {});
  };
  window.addEventListener('magra_leadership_updated', handleLeadershipUpdate);
  window.addEventListener('storage', handleLeadershipUpdate);
  return () => {
   window.removeEventListener('magra_leadership_updated', handleLeadershipUpdate);
   window.removeEventListener('storage', handleLeadershipUpdate);
  };
 }, []);

 const leadershipCards = useMemo(() => {
  return getLeadershipData(teachersList).cards;
 }, [teachersList, leadershipVer]);
 const emergencyServices=[['333','তথ্য ও সেবা','সরকারি তথ্য ও সেবা'],['999','জরুরি সেবা','জাতীয় জরুরি সেবা'],['109','নারী ও শিশু নির্যাতন প্রতিরোধে','সহায়তা ও প্রতিরোধ সেবা'],['106','দুদক হটলাইন','দুর্নীতি ও অনিয়মের অভিযোগ'],['1090','দুর্যোগের আগাম বার্তা','দুর্যোগ সংক্রান্ত আগাম তথ্য'],['1098','শিশুর সহায়তায় ফোন','চাইল্ড হেল্পলাইন']];

 const handleAddLink=(e)=>{
  e.preventDefault();
  if(!newLinkTitle.trim()||!newLinkUrl.trim())return;
  let url=newLinkUrl.trim();
  if(!url.startsWith('http://')&&!url.startsWith('https://')){
   url='https://'+url;
  }
  const updated=[...customLinks,[newLinkTitle.trim(),url,true]];
  setCustomLinks(updated);
  localStorage.setItem('magra_important_links',JSON.stringify(updated));
  setNewLinkTitle('');
  setNewLinkUrl('');
  setShowAddLink(false);
 };

 const handleDeleteLink=(customIdx)=>{
  const updated=customLinks.filter((_,i)=>i!==customIdx);
  setCustomLinks(updated);
  localStorage.setItem('magra_important_links',JSON.stringify(updated));
 };

 const allImportantLinks=[...defaultLinks,...customLinks];

 const handleServiceClick=(e, title)=>{
  if(title==='অনলাইন ভর্তি'){
   e.preventDefault();
   setActiveModal({key:'public.nav.admission.apply',title:'অনলাইন শিক্ষার্থী ভর্তি আবেদন'});
   return;
  }
  const map={
   'অনলাইন ভর্তি':'public.nav.admission.apply',
   'অনলাইন ফলাফল':'public.nav.results.analysis',
   'ডিজিটাল শিক্ষা':'public.nav.guide.learning',
   'স্মার্ট উপস্থিতি':'public.nav.students.attendance',
   'ডিজিটাল রুটিন':'public.nav.institution.curriculum',
   'অনলাইন পরীক্ষা':'public.nav.guide.online',
   'বৃত্তি ও অর্জন':'public.nav.students.scholarship',
   'লাইব্রেরি':'public.nav.institution.library',
   'শিক্ষক ও কর্মচারী':'public.nav.staff.active',
   'ক্রীড়া ও সংস্কৃতি':'public.nav.sport.sports',
   'বিজ্ঞান ক্লাব':'public.nav.sport.clubs',
   'আইসিটি ক্লাব':'public.nav.sport.lab',
   'ভাষা ও সাহিত্য ক্লাব':'public.nav.sport.clubs',
   'ডিবেটিং ক্লাব':'public.nav.sport.debate'
  };
  if(map[title]){
   e.preventDefault();
   setActiveModal({ key: map[title], title });
  }
 };

 const displayContacts=useMemo(()=>{
  let tList=[];
  let sList=[];
  try {
    const localT = JSON.parse(localStorage.getItem('magra_db_teachers')||'[]');
    if(Array.isArray(localT)&&localT.length>0) tList=localT;
    const localS = JSON.parse(localStorage.getItem('magra_db_staff')||'[]');
    if(Array.isArray(localS)&&localS.length>0) sList=localS;
  } catch {}
  if(!tList.length) tList=teachersList.length?teachersList:MOCK_TEACHERS;
  if(!sList.length) sList=MOCK_STAFF;
  const head=tList.find(t=>t.public_contact_role==='head_teacher'||(t.designation&&t.designation.includes('প্রধান শিক্ষক')&&!t.designation.includes('সহকারী')))||tList[0]||MOCK_TEACHERS[0];
  const asst=tList.find(t=>t.public_contact_role==='assistant_head_teacher'||(t.designation&&t.designation.includes('সহকারী প্রধান শিক্ষক')))||tList[1]||MOCK_TEACHERS[1];
  const ict=tList.find(t=>t.public_contact_role==='ict_teacher'||(t.subject&&(t.subject.includes('আইসিটি')||t.subject.includes('ICT')))||(t.designation&&(t.designation.includes('আইসিটি')||t.designation.includes('ICT'))))||tList.find(t=>(t.name_bn||'').includes('আবুবকর'))||tList[2]||MOCK_TEACHERS[2];
  const office=(sList&&sList.find(s=>s.public_contact_role==='office_assistant'||(s.designation&&s.designation.includes('অফিস'))))||sList[0]||tList.find(t=>t.designation&&t.designation.includes('অফিস'))||{
    name_bn: 'মো: আলমগীর হোসেন',
    designation: 'অফিস সহকারী কাম কম্পিউটার অপারেটর',
    phone: '01722-345678',
    email: 'office.magra@gmail.com',
    public_contact_role: 'office_assistant'
  };
  return [
   { key:'head', role:'প্রধান শিক্ষক', person:head },
   { key:'assistant', role:'সহকারী প্রধান শিক্ষক', person:asst },
   { key:'ict', role:'আইসিটি শিক্ষক', person:ict },
   { key:'office', role:'অফিস সহকারী', person:office }
  ];
 },[teachersList]);

 const activeTeachersToRoll=useMemo(()=>{
  let list=[];
  try {
    const local=JSON.parse(localStorage.getItem('magra_db_teachers')||'[]');
    if(Array.isArray(local)&&local.length>0) list=local;
  } catch {}
  if(!list.length) list=teachersList.length?teachersList:MOCK_TEACHERS;

  const filtered=list.filter(t=>{
   if (!t) return false;
   const isAct = t.status === 'active' || t.status === 'সক্রিয়' || !t.status;
   const desig = (t.designation || '').toLowerCase();
   const role = (t.role || t.public_contact_role || '').toLowerCase();
   const empId = (t.employee_id || '').toUpperCase();
   const isPresident = desig.includes('সভাপতি') || role.includes('president') || role === 'সভাপতি';
   const isStaff = empId.startsWith('STF') || desig.includes('অফিস সহকারী') || desig.includes('হিসাব সহকারী') || desig.includes('অফিস সহায়ক') || desig.includes('এমএলএসএস') || desig.includes('mlss') || role.includes('staff');
   return isAct && !isPresident && !isStaff;
  });

  return sortPeopleByEmployeeId(filtered);
 },[teachersList]);

 const loopedTeachers=[...activeTeachersToRoll,...activeTeachersToRoll];

 const handleAdmissionSubmit=async(e)=>{
  e.preventDefault();
  if(!admissionForm.applicant_name_bn.trim()){
   setAdmissionMsg('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।');
   return;
  }
  if(!admissionForm.guardian_phone.trim()){
   setAdmissionMsg('অনুগ্রহ করে অভিভাবকের মোবাইল নম্বর প্রদান করুন।');
   return;
  }
  setAdmissionSubmitting(true);
  setAdmissionMsg('');
  try{
   const res=await api('/admissions',{
    method:'POST',
    body:JSON.stringify({
     ...admissionForm,
     father_name:admissionForm.father_name||admissionForm.guardian_name,
     application_date:new Date().toISOString().slice(0,10),
     status:'submitted'
    })
   });
   setAdmissionReceipt(res);
   setAdmissionMsg('অভিনন্দন! আপনার অনলাইন ভর্তি আবেদন সফলভাবে গ্রহণ করা হয়েছে।');
  }catch(err){
   setAdmissionMsg('আবেদন জমাদানে ত্রুটি: '+err.message);
  }finally{
   setAdmissionSubmitting(false);
  }
 };

 return <div className="reference-public">
  <a className="skip-link" href="#main-content">মূল কনটেন্টে যান</a>
  <Header onOpenSubmenu={(key, title) => setActiveModal({ key, title })} />
  <main id="main-content">
   <section id="home" className="ref-hero-wrap"><div className="ref-container"><div className="ref-hero"><img src={building} alt="মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়ের ভবন"/><div className="ref-hero-caption"><h2>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h2><p>মগড়া, কালিহাতি, টাংগাইল • প্রতিষ্ঠিত ১৯৪৬ খ্রি.</p></div></div><div className="ref-ticker"><b>সর্বশেষ:</b><div>{notices[0]?.title_bn||'বিদ্যালয়ের সর্বশেষ নোটিশ ও গুরুত্বপূর্ণ ঘোষণা এখানে প্রদর্শিত হবে।'}</div></div></div></section>

   <section className="ref-stats ref-container" aria-label="বিদ্যালয়ের পরিসংখ্যান">
    <div className="ref-stat"><strong>{toBn(stats?.total??0)}</strong><span>শিক্ষার্থী</span></div>
    <div className="ref-stat"><strong>{toBn(stats?.teachers ?? (activeTeachersToRoll.length || teachersList.length || 0))}</strong><span>শিক্ষক ও কর্মচারী</span></div>
    <div className="ref-stat"><strong>৬–১০</strong><span>শ্রেণি</span></div>
    <div className="ref-stat"><strong>১৯৪৬</strong><span>প্রতিষ্ঠিত</span></div>
   </section>

   <section className="ref-demographic-stats ref-container" aria-label="শিক্ষার্থী পরিসংখ্যান">
    <div className="ref-demographic-card religion"><h3>ধর্ম ভিত্তিক শিক্ষার্থী</h3><div className="stat-circle"><strong>{stats&&stats.total>0?pct(stats.religion):'—'}</strong></div><p>{stats&&stats.total>0?labels(stats.religion):'এন্ট্রি অনুযায়ী হালনাগাদ হবে'}</p></div>
    <div className="ref-demographic-card gender"><h3>জেন্ডার ভিত্তিক শিক্ষার্থী</h3><div className="stat-circle"><strong>{stats&&stats.total>0?pct(stats.gender):'—'}</strong></div><p>{stats&&stats.total>0?labels(stats.gender):'এন্ট্রি অনুযায়ী হালনাগাদ হবে'}</p></div>
    <div className="ref-demographic-card classwise"><h3>শ্রেণি ভিত্তিক শিক্ষার্থী</h3><div className="stat-circle"><strong>{toBn(stats?.total??0)}</strong></div><p>{stats&&stats.total>0?(stats.classes||[]).filter(x=>x.count>0).map(x=>`${x.label}: ${toBn(x.count)}`).slice(0,5).join(' | ')||'এন্ট্রি অনুযায়ী হালনাগাদ হবে':'এন্ট্রি অনুযায়ী হালনাগাদ হবে'}</p></div>
   </section>

   <section className="ref-main ref-container"><div className="ref-layout"><div className="ref-primary">
    {/* Guardian Quick Smart Attendance Banner */}
    <div style={{
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)',
      borderRadius: '16px', padding: '16px 22px', color: '#ffffff', marginBottom: '20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px',
      boxShadow: '0 4px 16px rgba(6,78,59,0.18)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          fontSize: '30px', background: 'rgba(255,255,255,0.18)', borderRadius: '12px',
          width: '50px', height: '50px', display: 'grid', placeItems: 'center'
        }}>
          🕘
        </div>
        <div>
          <h3 style={{ margin: '0 0 3px', fontSize: '17px', fontWeight: 800 }}>
            অভিভাবক কর্নার: শিক্ষার্থীর স্মার্ট উপস্থিতি ও প্রত্যয়নপত্র অনুসন্ধান
          </h3>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            শ্রেণি, বিভাগ (৯ম/১০ম শ্রেণির জন্য বাধ্যতামূলক), শাখা ও রোল নম্বর দিয়ে শিক্ষার্থীর উপস্থিতি খতিয়ান ও ডাউনলোডযোগ্য প্রত্যয়নপত্র দেখুন
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setActiveModal({ key: 'public.nav.students.attendance', title: 'শিক্ষার্থী স্মার্ট উপস্থিতি পোর্টাল' })}
        style={{
          background: '#ffd34f', color: '#17352a', border: 'none',
          borderRadius: '8px', padding: '10px 18px', fontWeight: 800, fontSize: '13px',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
        }}
      >
        🔍 উপস্থিতি দেখুন ও প্রিন্ট করুন →
      </button>
    </div>

    <section id="services" className="ref-section"><div className="ref-title"><h2>আমাদের বিভিন্ন শিক্ষা কার্যক্রম</h2><span></span></div><div className="service-grid">{services.map(([icon,title,desc])=><a className="service-card" href="#school-info" onClick={(e)=>handleServiceClick(e,title)} key={title}><div className="service-icon">{icon}</div><h3>{title}</h3><p>{desc}</p></a>)}</div></section>

    <section id="notice" className="ref-section"><div className="ref-panel"><div className="panel-head"><h2>নোটিশবোর্ড</h2><a href="#notice" onClick={(e)=>{e.preventDefault();setActiveModal({key:'public.nav.notice',title:'বিদ্যালয়ের সকল নোটিশবোর্ড'});}}>🔗 সকল নোটিশ দেখুন</a></div><div className="notice-table"><div className="notice-row notice-head"><span>আইডি</span><span>টাইটেল</span><span>তারিখ</span><span>প্রকাশ</span></div>{notices.length?notices.slice(0,6).map((n,i)=><div className="notice-row" key={n.id}><span>{n.id?.toString().slice(-3)||i+1}</span><span>{n.title_bn}</span><span>{n.notice_date||'—'}</span><a href="#notice" onClick={(e)=>{e.preventDefault();setActiveModal({key:'public.nav.notice',title:n.title_bn});}}>View</a></div>):<div className="notice-empty-row">এখনও কোনো নোটিশ প্রকাশিত হয়নি।</div>}</div></div></section>

    <section className="ref-section link-panels">
     <div className="link-panel">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#cfe3fb',padding:'11px 13px',borderBottom:'2px solid #2874c6'}}>
       <h2 style={{margin:0,padding:0,background:'none',border:'none',fontSize:'16px'}}>গুরুত্বপূর্ণ লিংকসমূহ</h2>
       <button type="button" onClick={()=>setShowAddLink(!showAddLink)} style={{background:'#1d4ed8',color:'#fff',border:'none',borderRadius:'4px',padding:'3px 8px',fontSize:'11px',cursor:'pointer',fontWeight:'bold'}} title="নতুন লিংক যুক্ত করুন">+ লিংক যোগ</button>
      </div>
      {showAddLink && (
       <form onSubmit={handleAddLink} style={{background:'#f1f5f9',padding:'10px 12px',borderBottom:'1px solid #cbd5e1',display:'flex',flexDirection:'column',gap:'6px'}}>
        <input type="text" placeholder="লিংকের নাম (যেমন: কারিগরি শিক্ষা বোর্ড)" value={newLinkTitle} onChange={e=>setNewLinkTitle(e.target.value)} style={{padding:'6px 8px',fontSize:'12px',border:'1px solid #94a3b8',borderRadius:'4px'}} required/>
        <input type="text" placeholder="ওয়েব ঠিকানা (URL যেমন: https://...)" value={newLinkUrl} onChange={e=>setNewLinkUrl(e.target.value)} style={{padding:'6px 8px',fontSize:'12px',border:'1px solid #94a3b8',borderRadius:'4px'}} required/>
        <div style={{display:'flex',gap:'6px',justifyContent:'flex-end',marginTop:'2px'}}>
         <button type="button" onClick={()=>setShowAddLink(false)} style={{background:'#64748b',color:'#fff',border:'none',borderRadius:'4px',padding:'4px 10px',fontSize:'11px',cursor:'pointer'}}>বাতিল</button>
         <button type="submit" style={{background:'#16a34a',color:'#fff',border:'none',borderRadius:'4px',padding:'4px 12px',fontSize:'11px',fontWeight:'bold',cursor:'pointer'}}>সেভ করুন</button>
        </div>
       </form>
      )}
      {allImportantLinks.map(([t,h,isCustom],idx)=>(
       <div key={t+idx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingRight:'8px'}}>
        <a href={h} target="_blank" rel="noopener noreferrer" style={{flex:1}}>🔗 {t}</a>
        {isCustom && <button type="button" onClick={()=>handleDeleteLink(idx-defaultLinks.length)} style={{background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontSize:'14px',padding:'0 4px'}} title="লিংকটি মুছে ফেলুন">✕</button>}
       </div>
      ))}
     </div>
     <div className="link-panel"><h2>শিক্ষা বোর্ডসমূহ</h2>{boardLinks.map(([t,h])=><a key={t} href={h} target="_blank" rel="noopener noreferrer">🔗 {t}</a>)}</div>
     <div className="link-panel"><h2>বোর্ড গুরুত্বপূর্ণ লিংকসমূহ</h2>{[['ভূমি মন্ত্রণালয়','https://land.gov.bd/'],['শিক্ষার্থী নিবন্ধন','https://www.educationboardresults.gov.bd/'],['প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট','https://pmeat.gov.bd/'],['নৈমিত্তিক তথ্যসেবা','https://bangladesh.gov.bd/'],['MPO Teachers Verify','https://emis.gov.bd/']].map(([t,h])=><a key={t} href={h} target="_blank" rel="noopener noreferrer">🔗 {t}</a>)}</div>
    </section>



    </div>
   <aside className="ref-sidebar">
    {leadershipCards.map(leader=>(
     <article className="side-card leader-side" key={leader.role}>
      <h2>{leader.title}</h2>
      <div className="side-avatar-wrap">
       <img src={leader.photo} alt={leader.name} className="side-avatar-img"/>
      </div>
      <h3>{leader.name}</h3>
      <b>{leader.role}</b>
      <p>{leader.msg}</p>
      <button className="mini" style={{cursor:'pointer'}} onClick={()=>setActiveModal({key:leader.key,title:leader.title})}>বিস্তারিত বাণী →</button>
     </article>
    ))}
    <article className="side-card quick-side"><h2>জরুরি ও গুরুত্বপূর্ণ সেবা</h2>{emergencyServices.map(([num,title,desc])=><a className="quick-service" href={`tel:${num}`} key={num}><b>📞 {num}</b><span>{title}</span><small>{desc}</small></a>)}</article><article className="side-card quick-side"><h2>বিদ্যালয়ের যোগাযোগ</h2><div className="quick-number"><b>✉️</b><span>ই-মেইল</span><strong>magrapuhs.46@gmail.com</strong></div><div className="quick-number"><b>📍</b><span>ঠিকানা</span><strong>মগড়া, কালিহাতি, টাংগাইল</strong></div></article>
   </aside></div>

   {/* নিচের সেকশনগুলো উভয় পাশে সমান্তরালভাবে পুরো পেজ জুড়ে বিস্তৃত (Full Width 100%) */}
   <div className="ref-fullwidth-sections" style={{marginTop:'28px',display:'flex',flexDirection:'column',gap:'24px'}}>
    {/* ১. বিদ্যালয় সম্পর্কে (পুরো পেজের প্রস্থ জুড়ে সমান্তরাল) */}
    <section id="school-info" className="ref-section about-panel" style={{marginBottom:0,borderRadius:'10px'}}>
     <div className="about-logo"><img src={logo} alt="বিদ্যালয়ের লোগো"/></div>
     <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px',marginBottom:'6px'}}>
       <h2 style={{margin:0}}>বিদ্যালয় সম্পর্কে</h2>
       <button
        type="button"
        className="mini"
        style={{background:'#0b8050',color:'#fff',border:'none',fontWeight:700,padding:'5px 12px',cursor:'pointer',borderRadius:'6px'}}
        onClick={()=>setActiveModal({key:'public.nav.institution.about',title:'বিদ্যালয় পরিচিতি'})}
       >
        🏛️ বিস্তারিত পরিচিতি ও ইতিহাস →
       </button>
      </div>
      <p style={{fontSize:'13px',lineHeight:'1.8',margin:0}}>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয় মগড়া, কালিহাতি, টাংগাইলে অবস্থিত একটি ঐতিহ্যবাহী মাধ্যমিক শিক্ষা প্রতিষ্ঠান। ১৯৪৬ খ্রি. প্রতিষ্ঠিত এই বিদ্যালয়ের লক্ষ্য মানসম্মত শিক্ষা, শৃঙ্খলা, নৈতিকতা ও আধুনিক প্রযুক্তিনির্ভর শিক্ষার সমন্বয়ে শিক্ষার্থীদের প্রস্তুত করা। এই ডিজিটাল প্ল্যাটফর্মে বিদ্যালয়ের প্রশাসনিক তথ্য, শিক্ষা কার্যক্রম, ফলাফল, নোটিশ, শিক্ষক-শিক্ষার্থী তথ্য এবং অনলাইন সেবা পূর্ণাঙ্গভাবে পরিচালিত হচ্ছে।</p>
     </div>
    </section>
    {/* ৩. সক্রিয় সকল শিক্ষকের ছবিসহ নাম, পদবী, মোবাইলসহ রোলিং ক্যারোসেল (সভাপতি বাদ) */}
    <section id="teachers" className="ref-section rolling-teachers-section">
     <div className="rolling-teachers-header">
      <div className="ref-title" style={{margin:0,flex:1}}>
       <h2>👨‍🏫 সক্রিয় শিক্ষকবৃন্দ</h2>
       <span></span>
      </div>
      <div className="rolling-teachers-actions">
       <button type="button" className="rolling-nav-btn" onClick={()=>{if(teachersTrackRef.current)teachersTrackRef.current.scrollLeft-=240;}} aria-label="পূর্ববর্তী শিক্ষক">◀</button>
       <button type="button" className="rolling-nav-btn" onClick={()=>{if(teachersTrackRef.current)teachersTrackRef.current.scrollLeft+=240;}} aria-label="পরবর্তী শিক্ষক">▶</button>
       <button type="button" className="rolling-nav-btn" onClick={()=>setIsRollingPaused(!isRollingPaused)} title={isRollingPaused?"রোলিং চালু করুন":"রোলিং থামান"}>
        {isRollingPaused?"▶":"⏸"}
       </button>
       <button
        type="button"
        className="mini"
        style={{background:'#0b8050',color:'#fff',border:'none',fontWeight:700,padding:'6px 12px',cursor:'pointer',borderRadius:'6px',marginLeft:'4px'}}
        onClick={()=>setActiveModal({key:'public.nav.staff.active',title:'শিক্ষক ও কর্মচারীবৃন্দ'})}
       >
        📋 সকল শিক্ষক পূর্ণতালিকা →
       </button>
      </div>
     </div>

     <div
      className="rolling-teachers-viewport"
      ref={teachersTrackRef}
      onMouseEnter={()=>setIsRollingPaused(true)}
      onMouseLeave={()=>setIsRollingPaused(false)}
     >
      <div
       className="rolling-teachers-track"
       style={{animationPlayState:isRollingPaused?'paused':'running'}}
      >
       {loopedTeachers.map((t,idx)=>(
        <article
         className="rolling-teacher-card"
         key={(t.id||'tch')+'-'+idx}
         onClick={()=>setActiveModal({key:'public.nav.staff.active',title:'শিক্ষক ও কর্মচারীবৃন্দ'})}
         title={`${t.name_bn||t.name_en} — ${t.designation||'সহকারী শিক্ষক'}`}
        >
         <div>
          <div className="rolling-teacher-avatar-wrap">
           <img src={getTeacherPhoto(t)} alt={t.name_bn||t.name_en} className="rolling-teacher-avatar-img"/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
            <span style={{ background: '#1d4ed8', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>Employee ID: {t.employee_id}</span>
          </div>
          <h3>{t.name_bn||t.name_en}</h3>
          <div className="rolling-teacher-desig">{t.designation||'সহকারী শিক্ষক'}</div>
          {t.subject&&<span className="rolling-teacher-subject">বিষয়: {t.subject}</span>}
         </div>
         <div>
          {t.phone&&(
           <p className="rolling-teacher-contact">
            📱 <a href={`tel:${t.phone}`} onClick={e=>e.stopPropagation()}>{t.phone}</a>
           </p>
          )}
          {t.email&&(
           <p className="rolling-teacher-contact">
            ✉️ <a href={`mailto:${t.email}`} onClick={e=>e.stopPropagation()}>{t.email}</a>
           </p>
          )}
          <span className="rolling-teacher-status">সক্রিয় শিক্ষক</span>
         </div>
        </article>
       ))}
      </div>
     </div>
    </section>

    {/* ৪. যোগাযোগ অংশ — শিক্ষক ও কর্মচারী তালিকা থেকে স্বয়ংক্রিয়ভাবে যুক্ত */}
    <section id="contact" className="ref-section contact-section">
     <div className="ref-title">
      <h2>📞 জরুরি যোগাযোগ ও দায়িত্বপ্রাপ্ত কর্মকর্তা</h2>
      <span></span>
     </div>
     <div className="contact-grid">
      {displayContacts.map(c=>{
       const p=c.person;
       const name=p?.name_bn||p?.name_en||'তথ্য সংযোজনযোগ্য';
       const desig=p?.designation||c.role;
       const phone=p?.phone||'';
       const email=p?.email||'';
       const photo=getTeacherPhoto(p);
       return (
        <article className="contact-card" id={'contact-'+c.key} key={c.key} onClick={()=>setActiveModal({key:'public.nav.staff.active',title:'শিক্ষক ও কর্মচারীবৃন্দ'})} title={`${name} — ${desig}`}>
         <div className="contact-avatar-wrap">
          <img src={photo} alt={name} className="contact-avatar-img"/>
         </div>
         <span className="contact-role-badge">{c.role}</span>
         <h3>{name}</h3>
         <p className="contact-desig">{desig}</p>
         {phone&&(
          <p className="contact-phone">
           📱 <a href={`tel:${phone}`} onClick={e=>e.stopPropagation()}>{phone}</a>
          </p>
         )}
         {email&&(
          <p className="contact-email">
           ✉️ <a href={`mailto:${email}`} onClick={e=>e.stopPropagation()}>{email}</a>
          </p>
         )}
        </article>
       );
      })}
     </div>
     <div className="contact-note">
      ℹ️ শিক্ষক ও কর্মচারী প্রোফাইল এবং লগইন তালিকা থেকে এই যোগাযোগ তথ্য সার্বক্ষণিক স্বয়ংক্রিয়ভাবে হালনাগাদ থাকে।
     </div>
    </section>

    <section id="distinguished" className="ref-section distinguished">
     <div className="distinguished-head">
      <h2>কৃতি শিক্ষার্থী</h2>
      <p>বিদ্যালয়ের বর্তমান শিক্ষাবর্ষের মেধাবী ও কৃতিত্বপূর্ণ শিক্ষার্থীদের তথ্য</p>
     </div>
     <div className="distinguished-grid">
      {resolvedDistinguished.map((student, idx) => {
       const photoSrc = student.isEntered ? getStudentPhoto(student) : PHOTO_STUDENT_MALE_1;
       return (
        <article
         key={student.slotKey || idx}
         className="distinguished-card"
         style={{cursor: student.isEntered ? 'pointer' : 'default', opacity: student.isEntered ? 1 : 0.85}}
         onClick={()=>{
          if (student.isEntered) {
           setActiveModal({key:'public.nav.students.distinguished',title:'কৃতি ও বৃত্তিপ্রাপ্ত শিক্ষার্থী'});
          }
         }}
         title={student.isEntered ? `${student.name_bn} • ${student.displayClass} • রোল নং ${student.displayRoll}${student.hasDept && student.displayDept ? ` • বিভাগ: ${student.displayDept}` : ''}` : `${student.displayClass} রোল নং ${student.displayRoll}: লগইন পেজ থেকে শিক্ষার্থী তালিকা হালনাগাদ করা হলে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে`}
        >
         <div className="distinguished-avatar-box">
          <img
           src={photoSrc}
           alt={student.name_bn}
           className="distinguished-avatar-img"
           loading="lazy"
           style={{filter: student.isEntered ? 'none' : 'grayscale(40%)'}}
           onError={(e)=>{
            e.currentTarget.onerror = null;
            e.currentTarget.src = PHOTO_STUDENT_MALE_1;
           }}
          />
          <span className="distinguished-rank-badge">১ম স্থান</span>
          {student.isEntered && (
           <label
            className="distinguished-photo-change-btn"
            title={`${student.name_bn}-এর ছবি আপলোড বা পরিবর্তন করুন`}
            onClick={(e)=>e.stopPropagation()}
           >
            <input
             type="file"
             accept="image/*"
             style={{display:'none'}}
             onChange={(e)=>handleStudentPhotoDirectUpload(e, student)}
            />
            <span className="camera-btn-icon" aria-hidden="true">📷</span>
           </label>
          )}
         </div>
         <h3 className="distinguished-student-name" style={{color: student.isEntered ? '#0f172a' : '#64748b'}}>
          {student.name_bn}
         </h3>
         <div className="distinguished-details">
          <div className="dist-class-roll">
           <span className="dist-class">{student.displayClass}</span>
           <span className="dist-dot">•</span>
           <span className="dist-roll">রোল নং {student.displayRoll}</span>
          </div>
          {student.hasDept && student.displayDept ? (
           <div className="dist-dept">
            বিভাগ: {student.displayDept}
           </div>
          ) : (
           <div className="dist-dept dist-dept-empty" aria-hidden="true">
            &nbsp;
           </div>
          )}
         </div>
        </article>
       );
      })}
     </div>
    </section>

    <section id="gallery" className="ref-section"><div className="ref-title"><h2>ফটো ও ভিডিও গ্যালারি</h2><span></span></div><div className="gallery-tabs"><b>All</b><span>Photo</span><span>Video</span></div>{gallery.length?<div className="ref-gallery">{gallery.map(x=><button key={x.id} className="ref-gallery-item" onClick={()=>setLightbox(x)} aria-label={`${x.title_bn} বড় করে দেখুন`}><img src={x.image_url} alt={x.title_bn}/></button>)}</div>:<div className="gallery-placeholder"><span>🖼️</span><p>বিদ্যালয়ের ছবি ও ভিডিও এখানে প্রকাশিত হবে।</p></div>}</section>{lightbox&&<div className="ref-lightbox" role="dialog" aria-modal="true" aria-label="ছবির পূর্বরূপ" onClick={()=>setLightbox(null)}><div className="ref-lightbox-card" onClick={e=>e.stopPropagation()}><button className="ref-lightbox-close" onClick={()=>setLightbox(null)} aria-label="বন্ধ করুন">×</button><img src={lightbox.image_url} alt={lightbox.title_bn}/><h3>{lightbox.title_bn}</h3></div></div>}
   </div></section>

   <section className="ref-bottom"><div className="ref-container bottom-grid"><div><h3>বিদ্যালয় সম্পর্কিত</h3><a href="#school-info">বিদ্যালয় পরিচিতি</a><a href="#teachers">শিক্ষকবৃন্দ</a><a href="#notice">নোটিশবোর্ড</a><a href="#gallery">গ্যালারি</a></div><div><h3>শিক্ষার্থী ও অভিভাবক</h3><a href="#admission">অনলাইন ভর্তি</a><a href="#services">ফলাফল</a><a href="#services">উপস্থিতি</a><a href="#services">অনলাইন পরীক্ষা</a></div><div><h3>গুরুত্বপূর্ণ</h3><a href="#school-info">পরিচালনা কমিটি</a><a href="#school-info">নিয়ম-কানুন</a><a href="#contact">যোগাযোগ</a><a href="#/login">লগইন</a></div><div><h3>বিদ্যালয়ের ঠিকানা</h3><p>মগড়া, কালিহাতি, টাংগাইল</p><p>EIIN: 114290</p><p>ই-মেইল: magrapuhs.46@gmail.com</p></div></div><div className="ref-footer-line"><div className="ref-container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}><span>© মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয় • প্রতিষ্ঠিত ১৯৪৬ খ্রি.</span><button type="button" onClick={()=>setSupabaseSyncOpen(true)} style={{background:'rgba(255,255,255,0.18)',border:'1px solid rgba(255,255,255,0.35)',color:'#fff',padding:'5px 12px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',fontWeight:600}}>☁️ ক্লাউড ডেটাবেস সিঙ্ক (Supabase)</button></div></div></section>
  </main>
  {activeModal && <SubmenuDetailModal menuKey={activeModal.key} title={activeModal.title} onClose={()=>setActiveModal(null)} onNavigateRole={(role)=>{ setActiveModal(null); const matched=MOCK_USERS.find(u=>u.role_name===role)||MOCK_USERS[0]; localStorage.setItem('magra_token','demo-'+Date.now()); localStorage.setItem('magra_user',JSON.stringify(matched)); nav(matched.role_name==='teacher'?'/portal':'/admin'); }} />}
  {supabaseSyncOpen && <SupabaseSyncModal isOpen={supabaseSyncOpen} onClose={()=>setSupabaseSyncOpen(false)} />}
 </div>
}

function Login(){
 const {lang}=useLanguage();
 const[loginId,setLoginId]=useState('admin'),[password,setPassword]=useState('admin123'),[show,setShow]=useState(false),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
 const [showSubjectTeacherModal, setShowSubjectTeacherModal] = useState(false);
 const nav=useNavigate();

 const allSchoolTeachers = useMemo(() => {
  try {
    const raw = localStorage.getItem('magra_db_teachers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return deduplicateTeachers(parsed);
    }
  } catch {}
  return Array.isArray(MOCK_TEACHERS) ? deduplicateTeachers(MOCK_TEACHERS) : [];
 }, []);

 const remainingSubjectTeachers = useMemo(() => {
  const canonIds = ['3', '4', '5', '9', '12', '13', '14'];
  const matched = allSchoolTeachers.filter(t => canonIds.includes(String(t.employee_id)));
  if (matched && matched.length >= 7) return matched;
  return MOCK_TEACHERS.filter(t => canonIds.includes(String(t.employee_id)));
 }, [allSchoolTeachers]);
const quickAccounts = [
   { key: 'admin', icon: '👑', label: 'সুপার অ্যাডমিন ERP', id: 'admin', pass: 'admin123', role: 'Super Admin', desc: 'মুহাম্মদ আবুবকর সিদ্দিক • আইসিটি শিক্ষক ও সুপার অ্যাডমিন', user: MOCK_USERS[0] },
   { key: 'head', icon: '🎓', label: 'প্রধান শিক্ষক', id: 'head_teacher', pass: 'head123', role: 'Head Teacher', desc: 'মুহাম্মদ শফিকুল ইসলাম • প্রধান শিক্ষক ও অ্যাডমিন', user: MOCK_USERS[1] },
   { key: 'asst', icon: '👩‍🏫', label: 'সহকারী প্রধান শিক্ষক', id: 'assistant_head_teacher', pass: 'asst123', role: 'Asst. Head Teacher', desc: 'তাপসী সরকার • সহকারী প্রধান শিক্ষক ও অ্যাডমিন', user: MOCK_USERS[2] },
   { key: 'co_admin6', icon: '👥', label: 'কো-অ্যাডমিন (৬ষ্ঠ শ্রেণি)', id: 'class6_teacher', pass: 'teacher123', role: 'Co-Admin (Class 6)', desc: 'মোঃ আব্দুল খালেক • ৬ষ্ঠ শ্রেণির উপস্থিতি, ভর্তি ও ফি', user: MOCK_USERS.find(u=>u.login_id==='class6_teacher')||MOCK_USERS[3] },
   { key: 'co_admin7', icon: '👥', label: 'কো-অ্যাডমিন (৭ম শ্রেণি)', id: 'class7_teacher', pass: 'teacher123', role: 'Co-Admin (Class 7)', desc: 'মুহাম্মদ আব্দুর রহিম লিটন • ৭ম শ্রেণির উপস্থিতি, ভর্তি ও স্ক্রুটিনি', user: MOCK_USERS.find(u=>u.login_id==='class7_teacher')||MOCK_USERS[4] },
   { key: 'co_admin8', icon: '👥', label: 'কো-অ্যাডমিন (৮ম শ্রেণি)', id: 'class8_teacher', pass: 'teacher123', role: 'Co-Admin (Class 8)', desc: 'মুহাম্মদ আবুবকর সিদ্দিক • ৮ম শ্রেণির উপস্থিতি, ভর্তি ও স্ক্রুটিনি', user: MOCK_USERS.find(u=>u.login_id==='class8_teacher')||MOCK_USERS[5] },
   { key: 'co_admin9', icon: '👥', label: 'কো-অ্যাডমিন (৯ম শ্রেণি)', id: 'class9_teacher', pass: 'teacher123', role: 'Co-Admin (Class 9)', desc: 'মোঃ হাবিবুর রহমান • ৯ম শ্রেণির উপস্থিতি, ভর্তি ও স্ক্রুটিনি', user: MOCK_USERS.find(u=>u.login_id==='class9_teacher')||MOCK_USERS[6] },
   { key: 'co_admin10', icon: '👥', label: 'কো-অ্যাডমিন (১০ম শ্রেণি)', id: 'class10_teacher', pass: 'teacher123', role: 'Co-Admin (Class 10)', desc: 'মোঃ ওয়াহিদুর রহমান • ১০ম শ্রেণির উপস্থিতি, ভর্তি ও স্ক্রুটিনি', user: MOCK_USERS.find(u=>u.login_id==='class10_teacher')||MOCK_USERS[7] },
   { key: 'office', icon: '🏢', label: 'অফিস সহকারী', id: 'office', pass: 'staff123', role: 'Staff', desc: 'মোঃ আলমগীর হোসেন • ক্যাশ কাউন্টার ফি, সনদ ও ভোটার তালিকা', user: MOCK_USERS.find(u=>u.role_name==='staff') },
   { key: 'librarian', icon: '📚', label: 'গ্রন্থাগার ও বিষয় শিক্ষক', id: 'librarian', pass: 'librarian123', role: 'Librarian', desc: 'মোঃ শাহিন মিয়া • বই ক্যাটালগ ও বিষয় নম্বর এন্ট্রি', user: MOCK_USERS.find(u=>u.role_name==='librarian') },
   
   // ৭ জন বিষয় শিক্ষক (সরাসরি ১-ক্লিকে নম্বর এন্ট্রি ডেস্কে লগইন)
   { key: 'teacher_3', icon: '📖', label: 'বিষয় শিক্ষক (মোঃ আনোয়ার হোসেন)', id: 'teacher_3', pass: 'teacher123', role: 'Subject Teacher', desc: 'মোঃ আনোয়ার হোসেন • বিষয় শিক্ষক (ইসলাম ধর্ম) - সরাসরি নম্বর এন্ট্রি', user: MOCK_USERS.find(u => u.login_id === 'teacher_3') },
   { key: 'teacher_4', icon: '📖', label: 'বিষয় শিক্ষক (মোঃ ছানোয়ার হোসেন)', id: 'teacher_4', pass: 'teacher123', role: 'Subject Teacher', desc: 'মোঃ ছানোয়ার হোসেন • বিষয় শিক্ষক (বাংলাদেশ ও বিশ্বপরিচয়)', user: MOCK_USERS.find(u => u.login_id === 'teacher_4') },
   { key: 'teacher_5', icon: '📖', label: 'বিষয় শিক্ষক (মোহাম্মদ খালিদুর রহমান)', id: 'teacher_5', pass: 'teacher123', role: 'Subject Teacher', desc: 'মোহাম্মদ খালিদুর রহমান তাং • বিষয় শিক্ষক (কৃষি শিক্ষা)', user: MOCK_USERS.find(u => u.login_id === 'teacher_5') },
   { key: 'teacher_9', icon: '📖', label: 'বিষয় শিক্ষক (আরতী রানী সরকার)', id: 'teacher_9', pass: 'teacher123', role: 'Subject Teacher', desc: 'আরতী রানী সরকার • বিষয় শিক্ষক (হিন্দু ধর্ম)', user: MOCK_USERS.find(u => u.login_id === 'teacher_9') },
   { key: 'teacher_12', icon: '📖', label: 'বিষয় শিক্ষক (মোঃ আশরাফুল ইসলাম)', id: 'teacher_12', pass: 'teacher123', role: 'Subject Teacher', desc: 'মোঃ আশরাফুল ইসলাম • বিষয় শিক্ষক (ইংরেজি)', user: MOCK_USERS.find(u => u.login_id === 'teacher_12') },
   { key: 'teacher_13', icon: '📖', label: 'বিষয় শিক্ষক (কান্তা মনি)', id: 'teacher_13', pass: 'teacher123', role: 'Subject Teacher', desc: 'কান্তা মনি • বিষয় শিক্ষক (ব্যবসায় শিক্ষা)', user: MOCK_USERS.find(u => u.login_id === 'teacher_13') },
   { key: 'teacher_14', icon: '📖', label: 'বিষয় শিক্ষক (মোঃ রফিকুল ইসলাম)', id: 'teacher_14', pass: 'teacher123', role: 'Subject Teacher', desc: 'মোঃ রফিকুল ইসলাম • বিষয় শিক্ষক (ভৌত বিজ্ঞান)', user: MOCK_USERS.find(u => u.login_id === 'teacher_14') }
  ];

 const fillAndLogin = (item) => {
   setLoginId(item.id);
   setPassword(item.pass);
   let userObj = item.user;
   if (!userObj && item.teacher) {
     const empId = String(item.teacher.employee_id || item.teacher.id || '').replace(/\D/g, '') || '3';
     userObj = {
       id: `u-t-${empId}`,
       login_id: `teacher_${empId}`,
       full_name: `${item.teacher.name_bn} (${item.teacher.subject})`,
       role_name: 'teacher',
       role_label: `বিষয় শিক্ষক (${item.teacher.subject})`,
       teacher_name: item.teacher.name_bn,
       subject: item.teacher.subject,
       employee_id: empId,
       is_active: true
     };
   }
   if (!userObj) {
     userObj = MOCK_USERS.find(u => u.login_id === item.id);
   }
   if (!userObj) return;
   userObj = sanitizeStoredUser(userObj);
   const role = userObj?.role_name || userObj?.role || '';
   const desk = getRoleDefaultDesk(role);

   try {
     localStorage.setItem('magra_token', 'demo-token-' + Date.now());
     localStorage.setItem('magra_user', JSON.stringify(userObj));
     localStorage.setItem('magra_admin_active_tab', desk.tab);
     if (desk.sub) localStorage.setItem('magra_admin_active_sub', desk.sub);
     else localStorage.removeItem('magra_admin_active_sub');
   } catch {}

   window.dispatchEvent(new Event('magra_auth_change'));
   window.dispatchEvent(new Event('magra_role_changed'));
   nav('/admin');
 };

  const selectSubjectTeacherAndLogin = (teacher) => {
  const empId = String(teacher.employee_id || teacher.id || '').replace(/\D/g, '') || '3';
  const teacherName = teacher.name_bn || teacher.teacher_name || 'বিষয় শিক্ষক';
  const subject = teacher.subject || 'নির্ধারিত বিষয়';

  const userObj = sanitizeStoredUser({
    id: `u-teacher-${empId}`,
    login_id: `teacher_${empId}`,
    full_name: `${teacherName} (${subject})`,
    role_name: 'teacher',
    role_label: `বিষয় শিক্ষক (${subject})`,
    employee_id: empId,
    teacher_name: teacherName,
    subject: subject,
    phone: teacher.phone,
    photo_url: teacher.photo_url || getTeacherPhoto(teacher),
    is_active: true
  });
  try {
    localStorage.setItem('magra_token', 'demo-token-' + Date.now());
    localStorage.setItem('magra_user', JSON.stringify(userObj));
    localStorage.setItem('magra_admin_active_tab', 'results');
    localStorage.setItem('magra_admin_active_sub', 'marks');
  } catch {}
  setShowSubjectTeacherModal(false);
  window.dispatchEvent(new Event('magra_auth_change'));
  window.dispatchEvent(new Event('magra_role_changed'));
  nav('/admin');
 };

 async function submit(e){
  e.preventDefault();
  if(loading)return;
  setLoading(true);
  setMsg('লগইন হচ্ছে...');
  try{
   const d=await api('/auth/login',{method:'POST',body:JSON.stringify({loginId:loginId.trim(),password})});
   const userToSave = sanitizeStoredUser(d.user || MOCK_USERS.find(u => u.login_id.toLowerCase() === loginId.trim().toLowerCase()) || MOCK_USERS[0]);
   const role = userToSave?.role_name || userToSave?.role || '';
   let defTab = 'dashboard';
   let defSub = null;
   let targetRoute = '/admin';
   if (role === 'teacher') {
     defTab = 'results';
     defSub = 'marks';
     targetRoute = '/admin';
   } else if (role === 'co_admin') {
     defTab = 'attendance';
     defSub = 'daily';
     targetRoute = '/admin';
   } else if (role === 'staff') {
     defTab = 'office';
     defSub = 'fees';
     targetRoute = '/admin';
   } else if (role === 'librarian') {
     defTab = 'library';
     defSub = 'catalog';
     targetRoute = '/admin';
   } else {
     defTab = 'dashboard';
     defSub = null;
     targetRoute = '/admin';
   }
   try {
     localStorage.setItem('magra_token', d.token || ('demo-token-' + Date.now()));
     localStorage.setItem('magra_user', JSON.stringify(userToSave));
     localStorage.setItem('magra_admin_active_tab', defTab);
     if (defSub) localStorage.setItem('magra_admin_active_sub', defSub);
     else localStorage.removeItem('magra_admin_active_sub');
   } catch {}
   window.dispatchEvent(new Event('magra_auth_change'));
   window.dispatchEvent(new Event('magra_role_changed'));
    nav(targetRoute);
   }catch(err){
   const cleanId = loginId.trim().toLowerCase();
   const matched = sanitizeStoredUser(MOCK_USERS.find(u => u.login_id.toLowerCase() === cleanId) || MOCK_USERS[0]);
   const role = matched?.role_name || matched?.role || '';
   let defTab = 'dashboard';
   let defSub = null;
   let targetRoute = '/admin';
   if (role === 'teacher') {
     defTab = 'results';
     defSub = 'marks';
     targetRoute = '/admin';
   } else if (role === 'co_admin') {
     defTab = 'attendance';
     defSub = 'daily';
     targetRoute = '/admin';
   } else if (role === 'staff') {
     defTab = 'office';
     defSub = 'fees';
     targetRoute = '/admin';
   } else if (role === 'librarian') {
     defTab = 'library';
     defSub = 'catalog';
     targetRoute = '/admin';
   } else {
     defTab = 'dashboard';
     defSub = null;
     targetRoute = '/admin';
   }
   try {
     localStorage.setItem('magra_token', 'demo-token-' + Date.now());
     localStorage.setItem('magra_user', JSON.stringify(matched));
     localStorage.setItem('magra_admin_active_tab', defTab);
     if (defSub) localStorage.setItem('magra_admin_active_sub', defSub);
     else localStorage.removeItem('magra_admin_active_sub');
   } catch {}
   window.dispatchEvent(new Event('magra_auth_change'));
   window.dispatchEvent(new Event('magra_role_changed'));
    nav(targetRoute);
   }finally{
   setLoading(false);
  }
 }

 return (
  <section id="login" className="login-section">
   <div className="login-shell">
    <div className="login-intro">
      <span className="section-kicker">SECURE SCHOOL PORTAL</span>
      <h2>{bilingual('আপনার ডিজিটাল বিদ্যালয়ে স্বাগতম','Welcome to your Digital School',lang)}</h2>
      <p>{bilingual('আপনার ব্যক্তিগত Login ID ও Password দিয়ে প্রবেশ করুন। নিচে সকল রোলের ডেমো আইডি ও পাসওয়ার্ড দেওয়া আছে, এক ক্লিকেই প্রবেশ করতে পারবেন।','Sign in with your personal Login ID and Password. Below are the demo credentials for all roles for instant access.',lang)}</p>
      <div className="login-points">
        <span>✓ {bilingual('নিরাপদ ও ব্যক্তিগত অ্যাকাউন্ট','Secure personal account',lang)}</span>
        <span>✓ {bilingual('Attendance ও Result','Attendance & Results',lang)}</span>
        <span>✓ {bilingual('Digital Learning ও AI Tutor','Digital Learning & AI Tutor',lang)}</span>
      </div>
    </div>
    <div className="loginbox loginbox-modern">
      <div className="login-logo"><img src={logo} alt="মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়ের লোগো"/></div>
      <span className="login-label">SCHOOL ERP</span>
      <h2>{bilingual('সিস্টেম লগইন','System Login',lang)}</h2>
      <p className="login-help">{bilingual('নিচের আইডি ও পাসওয়ার্ড ব্যবহার করুন অথবা এক ক্লিকে রোল নির্বাচন করুন','Use the Login ID & Password below or select any role button',lang)}</p>

      
      <form onSubmit={submit}>
        <label>Login ID<input autoFocus autoComplete="username" placeholder={lang==='en'?'Your Login ID':'আপনার Login ID (যেমন: admin, head_teacher)'} value={loginId} onChange={e=>setLoginId(e.target.value)} required/></label>
        <label>Password<div className="password-field"><input autoComplete="current-password" type={show?'text':'password'} placeholder={lang==='en'?'Your Password':'আপনার Password'} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)} aria-label="পাসওয়ার্ড দেখুন">{show?'◉':'○'}</button></div></label>
        <button className="btn btn-primary login-submit" disabled={loading} aria-busy={loading}>{loading?(lang==='en'?'Signing in...':'লগইন হচ্ছে...'):(lang==='en'?'Sign in →':'লগইন করুন →')}</button>
      </form>
      {msg&&<p className="msg login-msg" role="status" aria-live="polite">{msg}</p>}
      <div className="login-actions">
        <a href="#/" className="login-back">← {lang==='en'?'Main Website':'মূল ওয়েবসাইট'}</a>
        <small>{lang==='en'?'Default password for all demo accounts is set.':'সকল ডেমো একাউন্টের পাসওয়ার্ড সেট করা আছে।'}</small>
      </div>

      <div className="quick-login-section">
        <div className="quick-login-header">
          <h3>⚡ এক ক্লিকে লগইন ও পর্যবেক্ষণ (Click to Login)</h3>
          <p style={{fontSize:'12px',color:'#555',margin:'4px 0 10px'}}>যেকোনো রোলে ক্লিক করলেই সাথে সাথে সংশ্লিষ্ট পোর্টালে লগইন হয়ে যাবে:</p>
        </div>
        <div className="quick-login-grid">
          {quickAccounts.map(q => (
            <button
              key={q.key}
              type="button"
              className="quick-login-btn"
              onClick={() => fillAndLogin(q)}
              title={`${q.label} | ID: ${q.id} | Pass: ${q.pass}`}
            >
              <span className="quick-login-icon">{q.icon}</span>
              <span className="quick-login-title">{q.label}</span>
              <span className="quick-login-role">ID: <code>{q.id}</code></span>
            </button>
          ))}
        </div>
      </div>

    </div>
   </div>

   {/* বিষয় শিক্ষক সেবা বক্স (৭ জন শিক্ষকের রোল স্ক্রীন পপআপ মোডাল) */}
   {showSubjectTeacherModal && (
    <div
      className="submenu-modal-overlay"
      onClick={() => setShowSubjectTeacherModal(false)}
      style={{ zIndex: 999999 }}
    >
      <div
        className="submenu-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px' }}
      >
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📖</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>বিষয় শিক্ষক রোল স্ক্রীন (সেবা বক্স)</h2>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.88)' }}>
                বিদ্যালয়ের ৭ জন বিষয় শিক্ষকের তালিকা — ক্লিক করলেই সরাসরি বিষয় নম্বর এন্ট্রি ও প্রশ্নব্যাংক ডেস্কে লগইন হয়ে যাবে
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setShowSubjectTeacherModal(false)}
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <span className="modal-hero-badge" style={{ background: '#e0f2fe', color: '#0369a1', margin: 0 }}>
              ⭐ আপনার শিক্ষক নির্বাচন করুন ({remainingSubjectTeachers.length} জন বিষয় শিক্ষক)
            </span>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              নির্ধারিত বিষয়ের লিখিত, MCQ ও ব্যবহারিক নম্বর এন্ট্রি
            </small>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px'
          }}>
            {remainingSubjectTeachers.map((t, idx) => {
              const photo = t.photo_url || getTeacherPhoto(t);
              return (
                <div
                  key={t.id || t.employee_id || idx}
                  onClick={() => selectSubjectTeacherAndLogin(t)}
                  style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.background = '#f0f9ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(2,132,199,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                    <img
                      src={photo}
                      alt={t.name_bn}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #0284c7',
                        background: '#e2e8f0'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '-3px',
                      right: '-3px',
                      background: '#0284c7',
                      color: '#fff',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '0 5px',
                      borderRadius: '8px',
                      border: '1px solid #fff'
                    }}>
                      {toBnDigits(t.employee_id || idx + 1)}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.name_bn}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.designation || 'সহকারী শিক্ষক'}
                    </div>
                    <div style={{
                      marginTop: '4px',
                      display: 'inline-block',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}>
                      📖 {t.subject || 'সাধারণ'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            fontSize: '12px',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span>
              <b>নির্দেশনা:</b> যে কোনো বিষয় শিক্ষকে ক্লিক করলেই তিনি সরাসরি তার পাঠদান বিষয়ের পরীক্ষা নম্বর এন্ট্রি ডেস্কে প্রবেশ করবেন।
            </span>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '10px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button
            type="button"
            className="btn mini"
            onClick={() => setShowSubjectTeacherModal(false)}
            style={{ background: '#64748b', color: '#ffffff', fontWeight: 700 }}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
   )}
  </section>
 );
}

function ReportsPanel(){
 const [tab,setTab]=useState('overview'),[data,setData]=useState(null),[rows,setRows]=useState([]),[msg,setMsg]=useState('');
 const paths={attendance:'/reports/attendance-trend?days=30',classatt:'/reports/class-attendance',result:'/reports/result-summary',finance:'/reports/finance-monthly',admission:'/reports/admission-summary',risk:'/reports/student-risk'};
 const tabs=[['overview','সারসংক্ষেপ'],['attendance','উপস্থিতি'],['classatt','শ্রেণিভিত্তিক'],['result','ফলাফল'],['finance','আয়-ব্যয়'],['admission','ভর্তি'],['risk','ঝুঁকি']];
 const load=async()=>{try{setMsg('');if(tab==='overview')setData(await api('/reports/overview'));else setRows(await api(paths[tab]));}catch(e){setMsg(e.message)}};
 useEffect(()=>{load()},[tab]);
 const money=v=>Number(v||0).toLocaleString('bn-BD');
 const pct=(v,d=0)=>Number(v||0).toFixed(d);
 const printReport=()=>{window.print()};
 const max=(arr,key)=>Math.max(1,...arr.map(x=>Number(x[key]||0)));
 return <div className="reports-panel">
  <div className="toolbar"><div><span className="eyebrow">REPORTING & ANALYTICS</span><h2>রিপোর্ট ও বিশ্লেষণ</h2></div><button className="btn" onClick={printReport}>🖨️ Print / PDF</button></div>
  <div className="tabs">{tabs.map(([k,n])=><button className={tab===k?'active':''} key={k} onClick={()=>setTab(k)}>{n}</button>)}</div>
  {tab==='overview'&&data&&<>
   <div className="report-cards"><div><b>{data.students.active}</b><span>সক্রিয় শিক্ষার্থী</span></div><div><b>{data.teachers.active}</b><span>সক্রিয় শিক্ষক</span></div><div><b>{data.attendance.present}</b><span>৩০ দিনে উপস্থিত</span></div><div><b>{money(data.finance.collected)}</b><span>আদায়</span></div><div><b>{money(data.finance.due)}</b><span>বকেয়া</span></div><div><b>{data.library.outstanding}</b><span>বকেয়া বই</span></div></div>
   <div className="report-grid"><article><h3>ফলাফল</h3><p>গড় নম্বর: <strong>{data.results.avg_marks}</strong></p><p>Pass-এর নিচে: <strong>{data.results.below_pass}</strong></p></article><article><h3>ভর্তি</h3><p>আবেদন: <strong>{data.admission.total}</strong></p><p>ভর্তি: <strong>{data.admission.admitted}</strong></p></article><article><h3>আয়-ব্যয়</h3><p>আদায়: <strong>{money(data.finance.collected)}</strong></p><p>খরচ: <strong>{money(data.finance.expense)}</strong></p></article></div>
   <div className="analytics-grid"><article className="chart-card"><h3>আয় বনাম ব্যয়</h3><div className="bar-chart"><div className="bar-row"><span>আদায়</span><div><i style={{width:`${Math.min(100,Number(data.finance.collected)/(Math.max(Number(data.finance.collected),Number(data.finance.expense),1))*100)}%`}}></i></div><b>{money(data.finance.collected)}</b></div><div className="bar-row"><span>খরচ</span><div><i style={{width:`${Math.min(100,Number(data.finance.expense)/(Math.max(Number(data.finance.collected),Number(data.finance.expense),1))*100)}%`}}></i></div><b>{money(data.finance.expense)}</b></div></div></article><article className="chart-card"><h3>উপস্থিতি</h3><div className="donut-stat"><b>{data.attendance.total?pct(Number(data.attendance.present)*100/Number(data.attendance.total),1):'0.0'}%</b><span>উপস্থিতির হার (৩০ দিন)</span></div><div className="mini-legend"><span>উপস্থিত {data.attendance.present}</span><span>অনুপস্থিত {data.attendance.absent}</span><span>দেরি {data.attendance.late}</span></div></article></div>
  </>}
  {tab==='attendance'&&<div className="analytics-grid"><div className="chart-card"><h3>দৈনিক উপস্থিতির হার</h3><div className="vertical-bars">{rows.map((r,i)=><div className="vbar" key={i}><div className="vbar-fill" style={{height:`${Math.min(100,Number(r.rate||0))}%`}} title={`${r.rate}%`}></div><small>{String(r.attendance_date).slice(5)}</small></div>)}</div></div><div className="table-card"><div className="toolbar"><h3>ডেটা</h3><button className="mini" onClick={load}>রিফ্রেশ</button></div><div className="table-wrap"><table><thead><tr><th>তারিখ</th><th>মোট</th><th>উপস্থিত</th><th>অনুপস্থিত</th><th>দেরি</th><th>হার</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{String(r.attendance_date).slice(0,10)}</td><td>{r.total}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.late}</td><td>{r.rate}%</td></tr>)}</tbody></table></div></div></div>}
  {tab==='classatt'&&<div className="table-card"><div className="toolbar"><h2>শ্রেণিভিত্তিক উপস্থিতি</h2><button className="mini" onClick={load}>রিফ্রেশ</button></div><div className="class-report-grid">{rows.map((r,i)=><article key={i}><h3>শ্রেণি {r.class_name}</h3><div className="progress"><i style={{width:`${Math.min(100,Number(r.rate||0))}%`}}></i></div><b>{r.rate||0}%</b><p>{r.present||0} উপস্থিত • {r.absent||0} অনুপস্থিত</p></article>)}</div></div>}
  {tab==='result'&&<div className="table-card"><div className="toolbar"><h2>বিষয়ভিত্তিক ফলাফল</h2><button className="mini" onClick={load}>রিফ্রেশ</button></div><div className="table-wrap"><table><thead><tr><th>শ্রেণি</th><th>বিষয়</th><th>এন্ট্রি</th><th>গড় নম্বর</th><th>Pass-এর নিচে</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.class_name}</td><td>{r.subject_name}</td><td>{r.entries}</td><td>{r.avg_marks}</td><td>{r.below_pass}</td></tr>)}</tbody></table></div></div>}
  {tab==='finance'&&<div className="table-card"><div className="toolbar"><h2>মাসিক আয়-ব্যয়</h2><button className="mini" onClick={load}>রিফ্রেশ</button></div><div className="vertical-bars finance-bars">{rows.map((r,i)=><div className="vbar" key={i}><div className="finance-pair"><div className="vbar-fill" style={{height:`${Number(r.collected||0)/Math.max(1,max(rows,'collected'))*100}%`}}></div><div className="vbar-fill expense-fill" style={{height:`${Number(r.expense||0)/Math.max(1,max(rows,'expense'))*100}%`}}></div></div><small>{r.month}</small></div>)}</div><div className="table-wrap"><table><thead><tr><th>মাস</th><th>আদায়</th><th>খরচ</th><th>নিট</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.month}</td><td>{money(r.collected)}</td><td>{money(r.expense)}</td><td>{money(Number(r.collected||0)-Number(r.expense||0))}</td></tr>)}</tbody></table></div></div>}
  {tab==='admission'&&<div className="table-card"><div className="toolbar"><h2>ভর্তি রিপোর্ট</h2><button className="mini" onClick={load}>রিফ্রেশ</button></div><div className="table-wrap"><table><thead><tr><th>শিক্ষাবর্ষ</th><th>শ্রেণি</th><th>আবেদন</th><th>ভর্তি</th><th>বাতিল</th><th>Admission Rate</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.academic_year}</td><td>{r.applied_class}</td><td>{r.applications}</td><td>{r.admitted}</td><td>{r.rejected}</td><td>{r.applications?pct(Number(r.admitted)*100/Number(r.applications),1):'0.0'}%</td></tr>)}</tbody></table></div></div>}
  {tab==='risk'&&<div className="table-card"><div className="toolbar"><h2>শিক্ষার্থী ঝুঁকি রিপোর্ট</h2><button className="mini" onClick={load}>রিফ্রেশ</button></div><div className="table-wrap"><table><thead><tr><th>রোল</th><th>নাম</th><th>শ্রেণি</th><th>Attendance</th><th>গড় নম্বর</th><th>Risk</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.roll_no||'—'}</td><td>{r.name_bn}</td><td>{r.class_name}</td><td>{r.attendance_rate}%</td><td>{r.avg_marks}</td><td><span className={`risk-badge risk-${r.risk}`}>{r.risk}</span></td></tr>)}</tbody></table></div></div>}
  {msg&&<p className="msg">{msg}</p>}
 </div>
}
function PublicContentSection(){
 const[items,setItems]=useState([]),[lightbox,setLightbox]=useState(null),[filter,setFilter]=useState('all'),[query,setQuery]=useState('');
 useEffect(()=>{api('/public/content').then(setItems).catch(()=>{})},[]);
 const groups=[['institution','🏛️','বিদ্যালয় পরিচিতি'],['event','📅','অনুষ্ঠান ও সহশিক্ষা'],['sport','⚽','ক্রীড়া ও সংস্কৃতি'],['achievement','🏆','অর্জন ও পুরস্কার'],['scholarship','🎓','বৃত্তি ও সম্মাননা'],['facility','🏫','সুবিধা ও অবকাঠামো'],['transport','🚌','পরিবহন'],['hostel','🛏️','হোস্টেল'],['club','🤝','ক্লাব ও সংগঠন'],['library_info','📚','লাইব্রেরি']];
 const q=query.trim().toLowerCase();
 const visible=items.filter(x=>(filter==='all'||x.content_type===filter)&&(!q||[x.title_bn,x.title_en,x.description,x.location].filter(Boolean).join(' ').toLowerCase().includes(q)));
 const gallery=visible.filter(x=>x.content_type==='gallery'&&x.image_url);
 return <section className="section modern-section content-public" id="school-info">
  <div className="public-anchor-shelf" aria-hidden="true">{['committee','rules','library','curriculum','sports','culture','tour','clubs','achievements','headteacher','assistant-headteacher','teachers','staff','students','scholarship','distinguished','admission','results','ssc-results','result-analysis','syllabus','learning','question-bank','online-exam','ai'].map(id=><span id={id} key={id}></span>)}</div>
  <div className="section-heading"><span className="section-kicker">SCHOOL LIFE</span><h2>বিদ্যালয়ের কার্যক্রম, তথ্য ও অর্জন</h2><p>প্রতিষ্ঠানের পরিচিতি, সহশিক্ষা, ক্রীড়া, বৃত্তি, অর্জন, সুবিধা ও লাইব্রেরির প্রকাশিত তথ্য এক জায়গায়।</p></div>
  <div className="public-content-toolbar"><input aria-label="বিদ্যালয়ের তথ্য খুঁজুন" placeholder="বিদ্যালয়ের তথ্য খুঁজুন…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="content-filter-chips"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>সব</button>{groups.map(([type,,title])=><button key={type} className={filter===type?'active':''} onClick={()=>setFilter(type)}>{title}</button>)}</div></div>
  <div className="content-public-grid">{groups.map(([type,icon,title])=><article key={type} className={filter!=='all'&&filter!==type?'filtered-out':''}><div className="content-public-head"><span>{icon}</span><h3>{title}</h3></div>{visible.filter(x=>x.content_type===type).slice(0,3).map(x=><div className="content-item" key={x.id}><b>{x.title_bn}</b><small>{x.event_date||x.location||''}</small>{x.image_url&&<img className="content-thumb" src={x.image_url} alt=""/>}<p>{x.description||'বিস্তারিত তথ্য শিগগির প্রকাশিত হবে।'}</p></div>)}{!visible.some(x=>x.content_type===type)&&<p className="empty-content">এই বিভাগে প্রকাশিত তথ্য পাওয়া যায়নি।</p>}</article>)}</div>
  <div id="gallery" className="public-gallery"><div className="section-heading compact"><span className="section-kicker">PHOTO GALLERY</span><h2>বিদ্যালয়ের ছবি</h2></div>{gallery.length?<div className="gallery-grid">{gallery.slice(0,12).map(x=><button className="gallery-tile" key={x.id} onClick={()=>setLightbox(x)}><img src={x.image_url} alt={x.title_bn}/><span>{x.title_bn}</span></button>)}</div>:<p className="empty-content">এই অনুসন্ধানে কোনো ছবি পাওয়া যায়নি।</p>}</div>
  {lightbox&&<div className="lightbox" role="dialog" aria-modal="true" onClick={()=>setLightbox(null)}><div className="lightbox-card" onClick={e=>e.stopPropagation()}><button className="lightbox-close" onClick={()=>setLightbox(null)}>×</button><img src={lightbox.image_url} alt={lightbox.title_bn}/><h3>{lightbox.title_bn}</h3><p>{lightbox.description||''}</p></div></div>}
 </section>
}
function ScholarshipPanel(){
 const[students,setStudents]=useState([]),[rows,setRows]=useState([]),[editing,setEditing]=useState(null),[filter,setFilter]=useState(''),[msg,setMsg]=useState('');
 const empty={student_id:'',scholarship_name:'',academic_year:new Date().getFullYear(),provider:'',amount:0,award_date:'',status:'awarded',notes:''};
 const[form,setForm]=useState(empty); const load=()=>{api('/students?status=active').then(setStudents).catch(()=>{});api('/scholarships').then(setRows).catch(e=>setMsg(e.message))};useEffect(load,[]);
 const visible=rows.filter(r=>!filter||[r.name_bn,r.student_id,r.scholarship_name,r.provider].filter(Boolean).join(' ').toLowerCase().includes(filter.toLowerCase()));
 async function save(e){e.preventDefault();try{await api(editing?`/scholarships/${editing}`:'/scholarships',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setMsg(editing?'বৃত্তির রেকর্ড আপডেট হয়েছে':'বৃত্তির রেকর্ড সংরক্ষণ হয়েছে');setEditing(null);setForm(empty);load()}catch(e){setMsg(e.message)}}
 function edit(r){setEditing(r.id);setForm({...empty,...r,award_date:r.award_date?.slice(0,10)||''});window.scrollTo({top:0,behavior:'smooth'})}
 async function remove(id){if(!confirm('এই বৃত্তির রেকর্ড মুছে ফেলবেন?'))return;try{await api(`/scholarships/${id}`,{method:'DELETE'});setMsg('রেকর্ড মুছে ফেলা হয়েছে');load()}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><div className="toolbar"><div><span className="eyebrow">SCHOLARSHIP MANAGEMENT</span><h2>{editing?'বৃত্তি সম্পাদনা':'নতুন বৃত্তি রেকর্ড'}</h2></div>{editing&&<button className="mini" onClick={()=>{setEditing(null);setForm(empty)}}>বাতিল</button>}</div><form onSubmit={save} className="form-grid"><select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})} required><option value="">শিক্ষার্থী নির্বাচন *</option>{students.map(x=><option key={x.id} value={x.id}>{x.name_bn} — {x.student_id} — শ্রেণি {x.class_name}</option>)}</select><input placeholder="বৃত্তির নাম *" value={form.scholarship_name} onChange={e=>setForm({...form,scholarship_name:e.target.value})} required/><input type="number" placeholder="শিক্ষাবর্ষ *" value={form.academic_year} onChange={e=>setForm({...form,academic_year:e.target.value})} required/><input placeholder="প্রদানকারী প্রতিষ্ঠান" value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})}/><input type="number" min="0" step="0.01" placeholder="পরিমাণ" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/><input type="date" value={form.award_date} onChange={e=>setForm({...form,award_date:e.target.value})}/><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="awarded">প্রদান করা হয়েছে</option><option value="pending">অপেক্ষমাণ</option><option value="cancelled">বাতিল</option></select><textarea className="full" rows="3" placeholder="মন্তব্য" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><button className="btn full">{editing?'আপডেট করুন':'বৃত্তি সংরক্ষণ করুন'}</button></form>{msg&&<p className="msg">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>বৃত্তিপ্রাপ্ত শিক্ষার্থী</h2><span>{rows.length} টি</span></div><input placeholder="শিক্ষার্থী/বৃত্তি খুঁজুন…" value={filter} onChange={e=>setFilter(e.target.value)}/><div className="table-wrap"><table><thead><tr><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>বৃত্তি</th><th>বছর</th><th>পরিমাণ</th><th>অবস্থা</th><th></th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td>{r.name_bn}<small>{r.student_id}</small></td><td>{r.class_name}</td><td>{r.scholarship_name}</td><td>{r.academic_year}</td><td>{r.amount}</td><td>{r.status}</td><td><button className="mini" onClick={()=>edit(r)}>সম্পাদনা</button> <button className="mini" onClick={()=>remove(r.id)}>মুছুন</button></td></tr>)}{!visible.length&&<tr><td colSpan="7">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>}</tbody></table></div></div></div>
}
function EventParticipantsPanel(){
 const[events,setEvents]=useState([]),[students,setStudents]=useState([]),[participants,setParticipants]=useState([]),[eventId,setEventId]=useState(''),[form,setForm]=useState({student_id:'',role:'',position:'',notes:''}),[msg,setMsg]=useState('');
 const load=()=>{api('/content?type=event').then(setEvents).catch(()=>{});api('/students?status=active').then(setStudents).catch(()=>{})};useEffect(load,[]);useEffect(()=>{if(eventId)api(`/events/${eventId}/participants`).then(setParticipants).catch(e=>setMsg(e.message));else setParticipants([])},[eventId]);
 async function add(e){e.preventDefault();try{await api(`/events/${eventId}/participants`,{method:'POST',body:JSON.stringify(form)});setMsg('অংশগ্রহণকারী যুক্ত হয়েছে');setForm({student_id:'',role:'',position:'',notes:''});api(`/events/${eventId}/participants`).then(setParticipants)}catch(e){setMsg(e.message)}}
 async function remove(id){try{await api(`/events/${eventId}/participants/${id}`,{method:'DELETE'});setParticipants(x=>x.filter(p=>p.id!==id));setMsg('অংশগ্রহণকারী বাদ দেওয়া হয়েছে')}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><span className="eyebrow">EVENT PARTICIPANTS</span><h2>ইভেন্ট নির্বাচন</h2><select value={eventId} onChange={e=>setEventId(e.target.value)}><option value="">ইভেন্ট নির্বাচন করুন</option>{events.map(x=><option key={x.id} value={x.id}>{x.title_bn} {x.event_date?`— ${x.event_date}`:''}</option>)}</select>{eventId&&<form onSubmit={add} className="form-grid"><select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})} required><option value="">শিক্ষার্থী *</option>{students.map(x=><option key={x.id} value={x.id}>{x.name_bn} — {x.student_id}</option>)}</select><input placeholder="ভূমিকা (যেমন: খেলোয়াড়)" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/><input placeholder="অবস্থান/পুরস্কার" value={form.position} onChange={e=>setForm({...form,position:e.target.value})}/><textarea className="full" placeholder="মন্তব্য" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><button className="btn full">অংশগ্রহণকারী যোগ করুন</button></form>}{msg&&<p className="msg">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>অংশগ্রহণকারীর তালিকা</h2><span>{participants.length} জন</span></div><div className="table-wrap"><table><thead><tr><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>ভূমিকা</th><th>অবস্থান/পুরস্কার</th><th></th></tr></thead><tbody>{participants.map(p=><tr key={p.id}><td>{p.name_bn}<small>{p.student_id}</small></td><td>{p.class_name}</td><td>{p.role||'—'}</td><td>{p.position||'—'}</td><td><button className="mini" onClick={()=>remove(p.id)}>বাদ দিন</button></td></tr>)}{!participants.length&&<tr><td colSpan="5">ইভেন্ট নির্বাচন করলে অংশগ্রহণকারীর তালিকা দেখা যাবে।</td></tr>}</tbody></table></div></div></div>
}
function ClubSubmissionsPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [clubFilter, setClubFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [msg, setMsg] = useState('');
  const [reading, setReading] = useState(null);

  const load = () => {
    api('/club-submissions').then(res => {
      if (Array.isArray(res)) setSubmissions(res);
    }).catch(e => setMsg(e.message));
  };
  useEffect(load, []);

  async function approve(id) {
    try {
      await api('/club-submissions/' + id, { method: 'PUT', body: JSON.stringify({ status: 'approved' }) });
      setMsg('✓ আবেদনটি সফলভাবে অনুমোদিত হয়েছে এবং ক্লাব শোকেসে যুক্ত হয়েছে।');
      load();
    } catch(e) { setMsg(e.message); }
  }

  async function remove(id) {
    if (!confirm('এই লেখা বা প্রজেক্ট আবেদনটি মুছে ফেলবেন?')) return;
    try {
      await api('/club-submissions/' + id, { method: 'DELETE' });
      setMsg('আবেদনটি মুছে ফেলা হয়েছে।');
      load();
    } catch(e) { setMsg(e.message); }
  }

  async function publishToContent(item) {
    try {
      const cId = item.club_id || (item.tracking_id?.startsWith('DEB') ? 'debate' : item.tracking_id?.startsWith('SCI') ? 'science' : item.tracking_id?.startsWith('ICT') ? 'ict' : 'literature');
      const prefix = cId === 'debate' ? 'মগড়া ডিবেট যুক্তিমঞ্চ' :
                     cId === 'science' ? 'খুদে বিজ্ঞানীর উদ্ভাবন' :
                     cId === 'ict' ? 'ডিজিটাল আইসিটি শোকেস' :
                     "দেয়াল পত্রিকা 'কিশলয়'";
      await api('/content', {
        method: 'POST',
        body: JSON.stringify({
          content_type: 'club',
          title_bn: `${prefix}: ${item.title} — ${item.student_name}`,
          description: item.content,
          location: `শ্রেণি ${item.class_name}, রোল ${item.roll_no || '—'}`,
          event_date: new Date().toISOString().slice(0, 10),
          status: 'published'
        })
      });
      await api('/club-submissions/' + item.id, { method: 'PUT', body: JSON.stringify({ status: 'approved' }) });
      setMsg('✓ লেখাটি বিদ্যালয়ের সহশিক্ষা ও ক্লাব কনটেন্টে সফলভাবে প্রকাশিত হয়েছে!');
      load();
    } catch(e) { setMsg(e.message); }
  }

  const visible = submissions.filter(s => {
    const cId = s.club_id || (s.tracking_id?.startsWith('DEB') ? 'debate' : s.tracking_id?.startsWith('SCI') ? 'science' : s.tracking_id?.startsWith('ICT') ? 'ict' : 'literature');
    if (clubFilter !== 'all' && cId !== clubFilter) return false;
    if (statusFilter === 'pending' && s.status !== 'pending') return false;
    if (statusFilter === 'approved' && s.status !== 'approved') return false;
    if (statusFilter === 'membership' && s.type !== 'membership') return false;
    return true;
  });

  return (
    <div className="module-grid">
      <div className="form-card full" style={{ gridColumn: '1 / -1' }}>
        {/* Moderation Guidance Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
              মডারেটর ও সহশিক্ষা শিক্ষক প্যানেল
            </span>
            <h2 style={{ margin: '4px 0 2px 0', fontSize: '18px', color: '#ffffff' }}>
              সহশিক্ষা ও স্কুল ক্লাব ম্যানেজমেন্ট ডেস্ক
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', opacity: 0.9 }}>
              দায়িত্বপ্রাপ্ত শিক্ষকমণ্ডলী এখান থেকে নিজ নিজ ক্লাবের জমা পড়া লেখা, বিতর্ক প্রস্তাবনা, সায়েন্স প্রজেক্ট ও সদস্যপদ স্ক্রুটিনি করে ১-ক্লিকে অনুমোদন ও সাইটে প্রকাশ করতে পারেন।
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11.5px' }}>
            <span style={{ background: '#312e81', padding: '4px 8px', borderRadius: '4px' }}>🎤 ডিবেট: খালেক ও আশরাফুল</span>
            <span style={{ background: '#047857', padding: '4px 8px', borderRadius: '4px' }}>🔬 বিজ্ঞান: হাবিবুর ও রফিকুল</span>
            <span style={{ background: '#0284c7', padding: '4px 8px', borderRadius: '4px' }}>💻 আইসিটি: আবুবকর সিদ্দিক</span>
            <span style={{ background: '#b45309', padding: '4px 8px', borderRadius: '4px' }}>📚 সাহিত্য: খালেক ও আশরাফুল</span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`mini ${clubFilter === 'all' ? 'btn' : 'btn-ghost'}`}
              onClick={() => setClubFilter('all')}
            >
              সকল ক্লাব ({submissions.length})
            </button>
            <button
              type="button"
              className={`mini ${clubFilter === 'literature' ? 'btn' : 'btn-ghost'}`}
              onClick={() => setClubFilter('literature')}
            >
              📚 সাহিত্য ('কিশলয়')
            </button>
            <button
              type="button"
              className={`mini ${clubFilter === 'debate' ? 'btn' : 'btn-ghost'}`}
              onClick={() => setClubFilter('debate')}
            >
              🎤 ডিবেটিং ক্লাব
            </button>
            <button
              type="button"
              className={`mini ${clubFilter === 'science' ? 'btn' : 'btn-ghost'}`}
              onClick={() => setClubFilter('science')}
            >
              🔬 বিজ্ঞান ক্লাব
            </button>
            <button
              type="button"
              className={`mini ${clubFilter === 'ict' ? 'btn' : 'btn-ghost'}`}
              onClick={() => setClubFilter('ict')}
            >
              💻 আইসিটি ক্লাব
            </button>
          </div>

          <div className="filters" style={{ margin: 0 }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">সকল অবস্থা</option>
              <option value="pending">⏳ অপেক্ষমাণ (Pending)</option>
              <option value="approved">✓ অনুমোদিত (Approved)</option>
              <option value="membership">👥 সদস্যপদ আবেদন</option>
            </select>
          </div>
        </div>

        {msg && <p className="msg" style={{ margin: '8px 0' }}>{msg}</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ট্র্যাকিং আইডি</th>
                <th>ক্লাব</th>
                <th>শিক্ষার্থীর নাম</th>
                <th>শ্রেণি ও রোল</th>
                <th>ধরন</th>
                <th>শিরোনাম / প্রজেক্ট</th>
                <th>তারিখ</th>
                <th>অবস্থা</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(s => {
                const cId = s.club_id || (s.tracking_id?.startsWith('DEB') ? 'debate' : s.tracking_id?.startsWith('SCI') ? 'science' : s.tracking_id?.startsWith('ICT') ? 'ict' : 'literature');
                const badgeColor = cId === 'debate' ? '#312e81' : cId === 'science' ? '#047857' : cId === 'ict' ? '#0284c7' : '#b45309';
                const cName = cId === 'debate' ? 'ডিবেট' : cId === 'science' ? 'বিজ্ঞান' : cId === 'ict' ? 'আইসিটি' : 'সাহিত্য';
                return (
                  <tr key={s.id}>
                    <td><code>{s.tracking_id || s.id}</code></td>
                    <td>
                      <span style={{ background: badgeColor, color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {cName}
                      </span>
                    </td>
                    <td><b>{s.student_name}</b><br/><small>{s.mobile || '—'}</small></td>
                    <td>শ্রেণি {s.class_name} {s.roll_no ? `• রোল ${s.roll_no}` : ''}</td>
                    <td><span className="badge">{s.type_label || s.type}</span></td>
                    <td><b>{s.title}</b></td>
                    <td>{s.submitted_at || '—'}</td>
                    <td>
                      {s.status === 'approved' ? (
                        <span className="status-green">✓ অনুমোদিত</span>
                      ) : (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          ⏳ অপেক্ষমাণ
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button type="button" className="mini" onClick={() => setReading(s)}>পড়ুন</button>
                        {s.status !== 'approved' && (
                          <button type="button" className="mini" style={{ background: '#047857', color: '#fff' }} onClick={() => approve(s.id)}>অনুমোদন</button>
                        )}
                        <button type="button" className="mini" style={{ background: '#1e3a8a', color: '#fff' }} onClick={() => publishToContent(s)}>প্রকাশ করুন</button>
                        <button type="button" className="mini" onClick={() => remove(s.id)}>মুছুন</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visible.length && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>কোনো জমা দেওয়া লেখা বা প্রজেক্ট পাওয়া যায়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reading && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setReading(null)}>
          <div className="lightbox-card" style={{ maxWidth: '640px', width: '92%' }} onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setReading(null)}>×</button>
            <span className="badge" style={{ marginBottom: '8px', display: 'inline-block' }}>
              {reading.club_name || 'স্কুল ক্লাব'} • {reading.type_label || reading.type} • শ্রেণি {reading.class_name}
            </span>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0f172a' }}>{reading.title}</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#047857', fontWeight: 700 }}>
              শিক্ষার্থী: {reading.student_name} (রোল {reading.roll_no || '—'}) • যোগাযোগ: {reading.mobile || '—'}
            </p>
            <div style={{ background: '#fdfbf7', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '14px', maxHeight: '50vh', overflowY: 'auto' }}>
              {reading.content}
            </div>
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {reading.status !== 'approved' && (
                <button type="button" className="btn" style={{ background: '#047857' }} onClick={() => { approve(reading.id); setReading(null); }}>
                  ✓ অনুমোদন করুন
                </button>
              )}
              <button type="button" className="btn" onClick={() => { publishToContent(reading); setReading(null); }}>
                🌐 পাবলিক সাইটে প্রকাশ করুন
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setReading(null)}>বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentPanel({ sub }){
 const[tab,setTab]=useState(sub==='achievements'||sub==='scholarships'?'scholarship':sub==='events'?'event_participants':sub==='submissions'?'club_submissions':'content');
 const types=[['institution','বিদ্যালয় পরিচিতি'],['event','অনুষ্ঠান/ইভেন্ট'],['sport','ক্রীড়া/সংস্কৃতি'],['achievement','অর্জন/পুরস্কার'],['facility','সুবিধা/অবকাঠামো'],['transport','পরিবহন'],['hostel','হোস্টেল'],['club','ক্লাব/সংগঠন'],['library_info','লাইব্রেরি তথ্য'],['gallery','গ্যালারি']];
 const empty={content_type:'event',title_bn:'',title_en:'',description:'',event_date:'',location:'',image_url:'',status:'published',sort_order:0};
 const[rows,setRows]=useState([]),[form,setForm]=useState(empty),[editing,setEditing]=useState(null),[msg,setMsg]=useState(''),[filter,setFilter]=useState(''),[typeFilter,setTypeFilter]=useState('');

 useEffect(()=>{
  if(sub==='achievements'||sub==='scholarships') setTab('scholarship');
  else if(sub==='events') setTab('event_participants');
  else if(sub==='clubs') { setTab('content'); setTypeFilter('club'); }
  else if(sub==='school') { setTab('content'); setTypeFilter('institution'); }
  else if(sub==='submissions') { setTab('club_submissions'); }
  else if(sub==='content') { setTab('content'); }
 },[sub]);

 const load=()=>api('/content').then(setRows).catch(e=>setMsg(e.message));useEffect(load,[]);const visible=rows.filter(r=>(!typeFilter||r.content_type===typeFilter)&&(!filter||[r.title_bn,r.title_en,r.description,r.location].filter(Boolean).join(' ').toLowerCase().includes(filter.toLowerCase())));
 async function save(e){e.preventDefault();try{await api(editing?'/content/'+editing:'/content',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setMsg(editing?'তথ্য আপডেট হয়েছে':'তথ্য প্রকাশ হয়েছে');setEditing(null);setForm(empty);load()}catch(e){setMsg(e.message)}}
 function edit(r){setEditing(r.id);setForm({content_type:r.content_type||'event',title_bn:r.title_bn||'',title_en:r.title_en||'',description:r.description||'',event_date:r.event_date?.slice(0,10)||'',location:r.location||'',image_url:r.image_url||'',status:r.status||'published',sort_order:r.sort_order||0});window.scrollTo({top:0,behavior:'smooth'})}
 async function remove(id){if(!confirm('এই কনটেন্ট মুছে ফেলবেন?'))return;try{await api('/content/'+id,{method:'DELETE'});setMsg('কনটেন্ট মুছে ফেলা হয়েছে');load()}catch(e){setMsg(e.message)}}

 if(tab==='scholarship') return <div><div className="tabs" style={{marginBottom:'16px'}}><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button><button className={tab==='club_submissions'?'active':''} onClick={()=>setTab('club_submissions')}>📝 দেয়াল পত্রিকা ও ক্লাব লেখা</button></div><ScholarshipPanel/></div>;
 if(tab==='event_participants') return <div><div className="tabs" style={{marginBottom:'16px'}}><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button><button className={tab==='club_submissions'?'active':''} onClick={()=>setTab('club_submissions')}>📝 দেয়াল পত্রিকা ও ক্লাব লেখা</button></div><EventParticipantsPanel/></div>;
 if(tab==='club_submissions') return <div><div className="tabs" style={{marginBottom:'16px'}}><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button><button className={tab==='club_submissions'?'active':''} onClick={()=>setTab('club_submissions')}>📝 দেয়াল পত্রিকা ও ক্লাব লেখা</button></div><ClubSubmissionsPanel/></div>;

 return <div className="module-grid"><div className="form-card full" style={{gridColumn:'1 / -1'}}><div className="tabs"><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button><button className={tab==='club_submissions'?'active':''} onClick={()=>setTab('club_submissions')}>📝 দেয়াল পত্রিকা ও ক্লাব লেখা</button></div></div><div className="form-card"><div className="toolbar"><h2>{editing?'কনটেন্ট সম্পাদনা':'নতুন কনটেন্ট যোগ'}</h2>{editing&&<button className="mini" onClick={()=>{setEditing(null);setForm(empty)}}>বাতিল</button>}</div><form onSubmit={save} className="form-grid"><select value={form.content_type} onChange={e=>setForm({...form,content_type:e.target.value})}>{types.map(t=><option key={t[0]} value={t[0]}>{t[1]}</option>)}</select><input placeholder="শিরোনাম (বাংলা) *" value={form.title_bn} onChange={e=>setForm({...form,title_bn:e.target.value})} required/><input placeholder="শিরোনাম (English)" value={form.title_en} onChange={e=>setForm({...form,title_en:e.target.value})}/><input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})}/><input placeholder="স্থান/বিভাগ" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input placeholder="ছবির URL" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/><textarea className="full" placeholder="বিস্তারিত বিবরণ" rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><button className="btn full">{editing?'আপডেট করুন':'প্রকাশ করুন'}</button></form>{msg&&<p className="msg">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>কনটেন্ট তালিকা</h2><span>{visible.length} টি</span></div><div className="filters"><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="">সব ক্যাটাগরি</option>{types.map(t=><option key={t[0]} value={t[0]}>{t[1]}</option>)}</select><input placeholder="খুঁজুন..." value={filter} onChange={e=>setFilter(e.target.value)}/></div><div className="table-wrap"><table><thead><tr><th>টাইপ</th><th>শিরোনাম</th><th>তারিখ</th><th>স্থান</th><th></th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td>{types.find(t=>t[0]===r.content_type)?.[1]||r.content_type}</td><td><b>{r.title_bn}</b><br/><small>{r.title_en}</small></td><td>{r.event_date?.slice(0,10)||'—'}</td><td>{r.location||'—'}</td><td><button className="mini" onClick={()=>edit(r)}>সম্পাদনা</button> <button className="mini" onClick={()=>remove(r.id)}>মুছুন</button></td></tr>)}{!visible.length&&<tr><td colSpan="5">কোনো কনটেন্ট পাওয়া যায়নি।</td></tr>}</tbody></table></div></div></div>
}

function OfficeAssistantPanel({ sub, setSub }){
 const [tab,setTab]=useState(sub==='admission'?'admission':sub==='docs'?'docs':sub==='idcards'?'idcards':sub==='voters'?'voters':'fees');
 useEffect(()=>{if(sub)setTab(sub==='admission'?'admission':sub==='docs'?'docs':sub==='idcards'?'idcards':sub==='voters'?'voters':'fees')},[sub]);
 const chooseTab=(t)=>{setTab(t);if(setSub)setSub(t);};
 return <div className="office-assistant-panel">
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px',background:'linear-gradient(135deg, #1e293b 0%, #334155 100%)',color:'#ffffff',padding:'16px 20px',borderRadius:'12px',marginBottom:'18px',boxShadow:'0 4px 12px rgba(30,41,59,0.15)'}}>
   <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
    <span style={{fontSize:'32px'}}>🏢</span>
    <div>
     <h2 style={{margin:0,fontSize:'18px',fontWeight:800}}>অফিস সহকারী ফ্রন্ট ডেস্ক ও রেজিস্টার</h2>
     <p style={{margin:'3px 0 0',fontSize:'12.5px',opacity:0.85}}>মোঃ আলমগীর হোসেন • ক্যাশ কাউন্টার ফি আদায় ও মানি রসিদ, ভর্তি ফরম স্ক্রুটিনি, প্রত্যয়ন ও প্রশংসাপত্র প্রিন্ট</p>
    </div>
   </div>
   <div className="tabs" style={{margin:0}}>
    <button className={tab==='fees'?'active':''} onClick={()=>chooseTab('fees')}>💳 ফি আদায় ও মানি রসিদ</button>
    <button className={tab==='admission'?'active':''} onClick={()=>chooseTab('admission')}>📝 ভর্তি ও আবেদন</button>
    <button className={tab==='docs'?'active':''} onClick={()=>chooseTab('docs')}>🖨️ প্রত্যয়ন, প্রশংসাপত্র ও TC</button>
    <button className={tab==='idcards'?'active':''} onClick={()=>chooseTab('idcards')}>🪪 আইডি কার্ড প্রিন্ট</button>
    <button className={tab==='voters'?'active':''} onClick={()=>chooseTab('voters')}>📋 ভোটার ও শিক্ষার্থী তালিকা</button>
   </div>
  </div>
  {tab==='fees'&&<FinancePanel sub="collect"/>}
  {tab==='admission'&&<AdmissionPanel sub="applications"/>}
  {tab==='docs'&&<DocumentPanel sub="bonafide_certificate"/>}
  {tab==='idcards'&&<DocumentPanel sub="id"/>}
  {tab==='voters'&&<StaffPanel sub="teacher_voters"/>}
 </div>;
}

function Admin(){
 const {lang}=useLanguage();
 const adminLabel=(bn)=>adminEn[bn]||bn;
 const nav=useNavigate(),[data,setData]=useState(null);
 const [me,setMe]=useState(()=>{
  try {
   const raw = localStorage.getItem('magra_user');
   if (raw && raw !== 'undefined' && raw !== 'null') {
    const u = JSON.parse(raw);
    if (u && (u.login_id || u.id)) return sanitizeStoredUser(u);
   }
  } catch {}
  return null;
 });
  const [active, setActive] = useState(() => {
   try {
    const raw = localStorage.getItem('magra_user');
    const u = raw ? JSON.parse(raw) : null;
    const r = u?.role_name || u?.role;
    const saved = localStorage.getItem('magra_admin_active_tab');
    if (r === 'teacher') return (saved && ['results','routine','question','notice','notifications'].includes(saved) && saved !== 'dashboard') ? saved : 'results';
    if (r === 'co_admin') return (saved && ['attendance','admission','results','routine','finance','question','notice','notifications'].includes(saved) && saved !== 'dashboard') ? saved : 'attendance';
    if (r === 'staff') return (saved && ['office','admission','finance','documents','students','notice','notifications'].includes(saved) && saved !== 'dashboard') ? saved : 'office';
    if (r === 'librarian') return (saved && ['library','results','routine','question','notice','notifications'].includes(saved) && saved !== 'dashboard') ? saved : 'library';
    if (r === 'admin') return (saved && saved !== 'users' && saved !== 'feature_control' && saved !== 'supabase_sync') ? saved : 'dashboard';
    if (r === 'super_admin') return saved || 'dashboard';
    return 'results';
   } catch { return 'results'; }
  });
  const [sub, setSub] = useState(() => {
   try {
    const raw = localStorage.getItem('magra_user');
    const u = raw ? JSON.parse(raw) : null;
    const r = u?.role_name || u?.role;
    const savedSub = localStorage.getItem('magra_admin_active_sub');
    if (r === 'teacher') return 'marks';
    if (r === 'co_admin') return (savedSub && ['daily','reports','teacher_enrollment','admitted_list','marks','marksheet','tabulation','merit','class_routine','exam_routine','collect','receipts'].includes(savedSub)) ? savedSub : 'daily';
    if (r === 'staff') return (savedSub && ['fees','admission','docs','idcards','voters','applications','teacher_enrollment','admitted_list','collect','receipts','id','commendation_certificate','transfer_certificate','bonafide_certificate','marksheet','admit','list','new','csv'].includes(savedSub)) ? savedSub : 'fees';
    if (r === 'librarian') return (savedSub && ['catalog','issue','overdue','reports','damaged','marks'].includes(savedSub)) ? savedSub : 'catalog';
    return savedSub || null;
   } catch { return null; }
  });
 const [enabled,setEnabled]=useState(null);
 const [expanded,setExpanded]=useState(()=>{
  try {
   const initTab = localStorage.getItem('magra_admin_active_tab') || 'dashboard';
   return { students: true, results: true, feature_control: true, settings: true, [initTab]: true };
  } catch {
   return { students: true, results: true, feature_control: true, settings: true };
  }
 });
 const [supabaseSyncOpen,setSupabaseSyncOpen]=useState(false);

 useEffect(()=>{
  try {
   localStorage.setItem('magra_admin_active_tab', active);
   if(sub) localStorage.setItem('magra_admin_active_sub', sub);
   else localStorage.removeItem('magra_admin_active_sub');
  } catch {}
 },[active, sub]);

 useEffect(()=>{
  const syncMe = () => {
   try {
    const raw = localStorage.getItem('magra_user');
    if (raw && raw !== 'undefined' && raw !== 'null') {
     const u = sanitizeStoredUser(JSON.parse(raw));
     if (u && (u.login_id || u.id)) {
      setMe(u);
      const r = u.role_name || u.role;
      let tab = localStorage.getItem('magra_admin_active_tab');
      let subTab = localStorage.getItem('magra_admin_active_sub');
      if (r === 'co_admin' && (!tab || tab === 'dashboard')) { tab = 'attendance'; subTab = 'daily'; }
      else if (r === 'staff' && (!tab || tab === 'dashboard')) { tab = 'office'; subTab = 'fees'; }
      else if (r === 'librarian' && (!tab || tab === 'dashboard')) { tab = 'library'; subTab = 'catalog'; }
      else if (r === 'teacher' && (!tab || tab === 'dashboard')) { tab = 'results'; subTab = 'marks'; }
      else if ((r === 'admin' || r === 'super_admin') && (!tab || !tab.length)) { tab = 'dashboard'; subTab = null; }
      if (tab) setActive(tab);
      setSub(subTab || null);
      return;
     }
    }
   } catch {}
   nav('/login');
  };

  syncMe();
  window.addEventListener('magra_auth_change', syncMe);
  window.addEventListener('magra_role_changed', syncMe);
  window.addEventListener('storage', syncMe);

  api('/me').then(u => {
   if (u && (u.login_id || u.id)) {
    setMe(u);
    try { localStorage.setItem('magra_user', JSON.stringify(u)); } catch {}
   }
  }).catch(()=>{});
  api('/dashboard').then(setData).catch(()=>{});
  api('/admin/features').then(d=>{const m={};(d.features||[]).forEach(f=>m[f.feature_key]=f.enabled!==false);setEnabled(m)}).catch(()=>setEnabled(null));

  return () => {
   window.removeEventListener('magra_auth_change', syncMe);
   window.removeEventListener('magra_role_changed', syncMe);
   window.removeEventListener('storage', syncMe);
  };
 },[nav]);
 const isOn=k=>enabled===null||enabled['admin.'+k]!==false;
 const logout=async()=>{try{await api('/auth/logout',{method:'POST'})}catch{}localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');localStorage.removeItem('magra_admin_active_tab');localStorage.removeItem('magra_admin_active_sub');window.dispatchEvent(new Event('magra_auth_change'));nav('/login')};
 const userRole=(me?.role_name||me?.role||'');
 const roleAllowedKeys={
  super_admin: null,
  admin: ['dashboard','students','staff','admission','attendance','results','routine','finance','library','office','learning','question','assignment','online_exam','ai','reports','documents','content','transport','hostel','notice','notifications','settings'],
  co_admin: ['attendance','admission','results','routine','finance','question','notice','notifications'],
  librarian: ['library','results','routine','question','notice','notifications'],
  staff: ['office','admission','finance','documents','students','notice','notifications'],
  teacher: ['results','routine','question','notice','notifications']
 };
 const allowedModules = userRole === 'super_admin' ? null : (roleAllowedKeys[userRole] || []);
 const isModuleAllowed=(k)=>allowedModules===null||allowedModules.includes(k);
 const choose=(k,s)=>{
  if(!isModuleAllowed(k))return;
  setActive(k);
  if(s){setSub(s);setExpanded(x=>({...x,[k]:true}));}
  else{if(k==='settings')setSub('leadership');else if(k==='feature_control')setSub('system');else setSub(null);setExpanded(x=>({...x,[k]:true}));}
 };

 useEffect(() => {
   if (allowedModules && (!allowedModules.includes(active) || (active === 'dashboard' && userRole !== 'admin' && userRole !== 'super_admin'))) {
    const defaultTab = userRole === 'teacher' ? 'results' : userRole === 'co_admin' ? 'attendance' : userRole === 'staff' ? 'office' : userRole === 'librarian' ? 'library' : (allowedModules[0] || 'results');
    setActive(defaultTab);
    if (defaultTab === 'results' && (userRole === 'teacher' || userRole === 'librarian')) {
     setSub('marks');
    } else if (defaultTab === 'attendance' && userRole === 'co_admin') {
     setSub('daily');
    } else if (defaultTab === 'office' && userRole === 'staff') {
     setSub('fees');
    } else if (defaultTab === 'library' && userRole === 'librarian') {
     setSub('catalog');
    } else {
     setSub(null);
    }
   }
  }, [userRole, active, allowedModules]);
 const coAdminSubFilters={
  attendance:['daily','reports'],
  admission:['teacher_enrollment','admitted_list'],
  finance:['collect','receipts'],
  results:['marks','marksheet','tabulation','merit'],
  routine:['class_routine','exam_routine'],
 };
 const staffSubFilters={
  office:['fees','admission','docs','idcards','voters'],
  admission:['applications','teacher_enrollment','admitted_list','fees'],
  finance:['collect','receipts'],
  documents:['id','commendation_certificate','transfer_certificate','bonafide_certificate','marksheet','admit'],
  students:['list','new','csv']
 };
 const teacherSubFilters={
  results:['marks'],
  routine:['class_routine','teacher_schedule'],
  question:['generator','omr','bank','saved','model']
 };
 const librarianSubFilters={
  library:['catalog','issue','overdue','reports','damaged'],
  results:['marks'],
  routine:['class_routine','teacher_schedule'],
  question:['generator','omr','bank','saved','model']
 };
 const rawGroups = allowedModules === null
  ? ADMIN_NAV_GROUPS
  : ADMIN_NAV_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(x => allowedModules.includes(x.k))
    })).filter(g => g.items.length > 0);

 const groups = rawGroups.map(g => {
  const filteredItems = g.items
   .filter(x => isOn(x.k) || x.k === 'feature_control')
   .map(x => {
    let allowedSubs = x.subs || [];
    if (userRole === 'co_admin' && coAdminSubFilters[x.k]) {
     allowedSubs = allowedSubs.filter(([sk]) => coAdminSubFilters[x.k].includes(sk));
    } else if (userRole === 'staff' && staffSubFilters[x.k]) {
     allowedSubs = allowedSubs.filter(([sk]) => staffSubFilters[x.k].includes(sk));
    } else if (userRole === 'teacher' && teacherSubFilters[x.k]) {
     allowedSubs = allowedSubs.filter(([sk]) => teacherSubFilters[x.k].includes(sk));
    } else if (userRole === 'librarian' && librarianSubFilters[x.k]) {
     allowedSubs = allowedSubs.filter(([sk]) => librarianSubFilters[x.k].includes(sk));
    }
    return {
     ...x,
     subs: allowedSubs.filter(([sk]) => enabled === null || enabled['admin.' + x.k + '.' + sk] !== false)
    };
   });
  return { ...g, items: filteredItems };
 }).filter(g => g.items.length > 0);
  if (!me) return null;
  const effectiveMe = me;
  const deskTitle = userRole === 'co_admin' ? `শ্রেণি শিক্ষক ডেস্ক (${String(effectiveMe?.assigned_class) === '6' ? '৬ষ্ঠ' : String(effectiveMe?.assigned_class) === '7' ? '৭ম' : String(effectiveMe?.assigned_class) === '8' ? '৮ম' : String(effectiveMe?.assigned_class) === '9' ? '৯ম' : String(effectiveMe?.assigned_class) === '10' ? '১০ম' : (effectiveMe?.assigned_class || '')} শ্রেণি)` :
    userRole === 'staff' ? 'অফিস সহকারী ডেস্ক' :
    userRole === 'librarian' ? 'লাইব্রেরি ও বিষয় শিক্ষক ডেস্ক' :
    userRole === 'teacher' ? `বিষয় শিক্ষক ডেস্ক (${effectiveMe?.subject || 'নির্ধারিত বিষয়'})` :
    (effectiveMe?.login_id === 'assistant_head_teacher' || effectiveMe?.username === 'assistant_head_teacher') ? 'সহকারী প্রধান শিক্ষক একাডেমি' :
    userRole === 'admin' ? 'প্রধান শিক্ষক একাডেমি' :
    'School ERP (সুপার অ্যাডমিন)';
  return <div className="admin"><aside><img src={logo}/><h2>{deskTitle}</h2><p>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</p><div className="side-nav">{groups.map(g=><React.Fragment key={g.group}><div className="side-group-title">{lang==='en'?adminEn[g.group]||g.group:g.group}</div>{g.items.map(x=><div className="side-item-wrap" key={x.k}><button className={'side-main '+(active===x.k?'active':'')} onClick={()=>choose(x.k)}><span>{x.i}</span><b>{lang==='bi'?<>{x.n}<small className="lang-secondary">{x.e||''}</small></>:lang==='en'?adminLabel(x.n):x.n}</b>{Boolean(x.subs && x.subs.length > 0) ? <span className="side-caret">{expanded[x.k]?'▾':'▸'}</span> : null}</button>{Boolean(x.subs && x.subs.length > 0 && expanded[x.k]) ? <div className="side-subnav">{x.subs.map(([sk,label])=><button key={sk} className={active===x.k&&sub===sk?'active':''} onClick={()=>{setActive(x.k);setSub(sk)}}>↳ {lang==='en'?adminEn[label]||label:label}</button>)}</div> : null}</div>)}</React.Fragment>)}{enabled===null&&<div className="side-note">Feature control চালুর জন্য database migration প্রয়োজন।</div>}</div><button className="logout" onClick={logout}>লগআউট</button></aside><section className="panel"><div className="top"><div><span className="eyebrow">{userRole==='co_admin'?`শ্রেণি শিক্ষক ডেস্ক (${String(effectiveMe?.assigned_class)==='6'?'৬ষ্ঠ':String(effectiveMe?.assigned_class)==='7'?'৭ম':String(effectiveMe?.assigned_class)==='8'?'৮ম':String(effectiveMe?.assigned_class)==='9'?'৯ম':String(effectiveMe?.assigned_class)==='10'?'১০ম':(effectiveMe?.assigned_class||'')} শ্রেণি)`:userRole==='staff'?'অফিস সহকারী ডেস্ক':userRole==='librarian'?'লাইব্রেরি ও বিষয় শিক্ষক ডেস্ক':userRole==='teacher'?`বিষয় শিক্ষক ডেস্ক (${effectiveMe?.subject||'নির্ধারিত বিষয়'})`:userRole==='admin'?'প্রধান শিক্ষক একাডেমি ও প্রশাসনিক প্রশাসন':'সুপার অ্যাডমিন ERP কন্ট্রোল'}</span><h1>{(()=>{const x=ADMIN_NAV_GROUPS.flatMap(g=>g.items).find(x=>x.k===active);return lang==='en'?adminLabel(x?.n||'ড্যাশবোর্ড'):x?.n||'ড্যাশবোর্ড'})()}</h1><p>{effectiveMe?.full_name||'ব্যবহারকারী'} • {effectiveMe?.role_label||effectiveMe?.role_name||''}{sub?' • '+sub:''}</p></div><div className="admin-top-actions">{(userRole==='super_admin'||userRole==='admin'||userRole==='co_admin'||userRole==='teacher'||userRole==='librarian')&&<button type="button" className="btn mini" onClick={()=>choose('results','marks')} style={{background:'#0284c7',color:'#fff',fontWeight:700,display:'flex',alignItems:'center',gap:'5px'}} title="সরাসরি বিষয়ভিত্তিক নম্বর এন্ট্রি ফর্মে যান">📈 বিষয় নম্বর এন্ট্রি</button>}{(userRole==='super_admin'||userRole==='admin'||userRole==='co_admin'||userRole==='teacher'||userRole==='librarian')&&<button type="button" className="btn mini" onClick={()=>choose('question','generator')} style={{background:'#7c3aed',color:'#fff',fontWeight:700,display:'flex',alignItems:'center',gap:'5px'}} title="১-ক্লিকে প্রশ্ন তৈরী, অধ্যায়ভিত্তিক প্রশ্নভাণ্ডার ও OMR মূল্যায়ন">❓ প্রশ্নব্যাংক</button>}{userRole==='super_admin'&&<button type="button" className="btn mini" onClick={()=>setSupabaseSyncOpen(true)} style={{background:'#0b8050',color:'#fff',fontWeight:700,display:'flex',alignItems:'center',gap:'4px'}}>☁️ ক্লাউড সিঙ্ক</button>}<LanguageSwitcher/><div className="pill">EIIN 114290</div></div></div>{userRole==='super_admin'&&<div style={{background:'linear-gradient(135deg, #14532d 0%, #15803d 100%)',color:'#ffffff',padding:'12px 18px',borderRadius:'10px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 8px rgba(20,83,45,0.15)',flexWrap:'wrap',gap:'10px'}}><div><div style={{fontWeight:800,fontSize:'14.5px'}}>👑 {effectiveMe?.full_name||'মুহাম্মদ আবুবকর সিদ্দিক'} • সুপার অ্যাডমিন (আইসিটি শিক্ষক)</div><div style={{fontSize:'12px',opacity:0.9,marginTop:'2px'}}>পূর্ণ সিস্টেম ক্ষমতা: ইউজার ম্যানেজমেন্ট, ফিচার কন্ট্রোল, রোল ও পারমিশন, ক্লাউড সিঙ্ক ও কোর সিকিউরিটি।</div></div><div style={{display:'flex',gap:'8px'}}><button type="button" className="mini" onClick={()=>choose('users')} style={{background:'#ffffff',color:'#14532d',fontWeight:700}}>👥 ইউজার ও রোল</button><button type="button" className="mini" onClick={()=>choose('feature_control')} style={{background:'#fef3c7',color:'#92400e',fontWeight:700}}>🧩 ফিচার কন্ট্রোল</button><button type="button" className="mini" onClick={()=>setSupabaseSyncOpen(true)} style={{background:'#dcfce7',color:'#14532d',fontWeight:700}}>☁️ ক্লাউড সিঙ্ক</button></div></div>}{userRole==='admin'&&<div style={{background:'linear-gradient(135deg, #1e293b 0%, #334155 100%)',color:'#ffffff',padding:'12px 18px',borderRadius:'10px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 8px rgba(30,41,59,0.15)',flexWrap:'wrap',gap:'10px'}}><div><div style={{fontWeight:800,fontSize:'15px'}}>🎓 {effectiveMe?.full_name} • {effectiveMe?.role_label||'একাডেমিক অ্যাডমিন'}</div><div style={{fontSize:'12px',opacity:0.9,marginTop:'2px'}}>আপনার দায়িত্ব: একাডেমিক কার্যক্রম, শিক্ষক ও কর্মচারী সুপারভিশন, শিক্ষার্থী ভর্তি ও পরীক্ষার সামগ্রিক প্রশাসন।</div></div><div style={{display:'flex',gap:'8px'}}><button type="button" className="mini" onClick={()=>choose('dashboard')} style={{background:'#ffffff',color:'#1e293b',fontWeight:700}}>📊 ড্যাশবোর্ড</button><button type="button" className="mini" onClick={()=>choose('students')} style={{background:'#ecfdf5',color:'#065f46',fontWeight:700}}>🎓 শিক্ষার্থী</button><button type="button" className="mini" onClick={()=>choose('staff')} style={{background:'#eff6ff',color:'#1e3a8a',fontWeight:700}}>👨‍🏫 শিক্ষক-কর্মচারী</button></div></div>}{userRole==='co_admin'&&<div style={{background:'linear-gradient(135deg, #065f46 0%, #047857 100%)',color:'#ffffff',padding:'12px 18px',borderRadius:'10px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 8px rgba(6,95,70,0.15)'}}><div><div style={{fontWeight:800,fontSize:'15px'}}>👨‍🏫 {effectiveMe?.full_name} • কো-অ্যাডমিন ও শ্রেণি শিক্ষক ({String(effectiveMe?.assigned_class)==='6'?'৬ষ্ঠ':String(effectiveMe?.assigned_class)==='7'?'৭ম':String(effectiveMe?.assigned_class)==='8'?'৮ম':String(effectiveMe?.assigned_class)==='9'?'৯ম':String(effectiveMe?.assigned_class)==='10'?'১০ম':effectiveMe?.assigned_class||'৮ম'} শ্রেণি)</div><div style={{fontSize:'12px',opacity:0.9,marginTop:'2px'}}>আপনার দায়িত্ব: প্রতিদিনের শিক্ষার্থী উপস্থিতি, ক্লাসে ভর্তি অন্তর্ভুক্তি, শ্রেণি ফি আদায় ও পরীক্ষার ফলাফল নিরীক্ষণ (Scrutiny)।</div></div><div style={{display:'flex',gap:'8px'}}><button type="button" className="mini" onClick={()=>choose('attendance','daily')} style={{background:'#ffffff',color:'#065f46',fontWeight:700}}>🕘 উপস্থিতি নিন</button><button type="button" className="mini" onClick={()=>choose('results','marks')} style={{background:'#ecfdf5',color:'#065f46',fontWeight:700}}>📈 নম্বর দিন</button><button type="button" className="mini" onClick={()=>choose('question','generator')} style={{background:'#fef3c7',color:'#92400e',fontWeight:700}}>❓ প্রশ্নব্যাংক</button></div></div>}{userRole==='librarian'&&<div style={{background:'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)',color:'#ffffff',padding:'12px 18px',borderRadius:'10px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 8px rgba(6,78,59,0.15)',flexWrap:'wrap',gap:'10px'}}><div><div style={{fontWeight:800,fontSize:'15px'}}>📚 {effectiveMe?.full_name||'মোঃ শাহিন মিয়া'} • সহকারী শিক্ষক (গ্রন্থাগার ও বিষয় শিক্ষক)</div><div style={{fontSize:'12px',opacity:0.9,marginTop:'2px'}}>আপনার দায়িত্ব: কেন্দ্রীয় গ্রন্থাগার ও রিডিং রুম পরিচালনা, বই ইস্যু-জমা এবং নির্ধারিত বিষয়ের পরীক্ষার নম্বর এন্ট্রি।</div></div><div style={{display:'flex',gap:'8px'}}><button type="button" className="mini" onClick={()=>choose('library','catalog')} style={{background:'#ffffff',color:'#064e3b',fontWeight:700}}>📚 লাইব্রেরি</button><button type="button" className="mini" onClick={()=>choose('results','marks')} style={{background:'#0284c7',color:'#ffffff',fontWeight:700}}>📈 বিষয় নম্বর এন্ট্রি</button><button type="button" className="mini" onClick={()=>choose('question','generator')} style={{background:'#fef3c7',color:'#92400e',fontWeight:700}}>❓ প্রশ্নব্যাংক</button></div></div>}{userRole==='staff'&&<div style={{background:'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',color:'#ffffff',padding:'12px 18px',borderRadius:'10px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 8px rgba(30,58,138,0.15)',flexWrap:'wrap',gap:'10px'}}><div><div style={{fontWeight:800,fontSize:'15px'}}>🏢 {effectiveMe?.full_name||'মোঃ আলমগীর হোসেন'} • অফিস সহকারী</div><div style={{fontSize:'12px',opacity:0.9,marginTop:'2px'}}>আপনার দায়িত্ব: শিক্ষার্থী ফি আদায়, রশিদ প্রদান, প্রশংসাপত্র/প্রত্যয়ন/TC প্রস্তুত এবং ভোটার ও শিক্ষার্থী তালিকা তৈরি।</div></div><div style={{display:'flex',gap:'8px'}}><button type="button" className="mini" onClick={()=>choose('office','fees')} style={{background:'#ffffff',color:'#1e3a8a',fontWeight:700}}>💳 ফি আদায়</button><button type="button" className="mini" onClick={()=>choose('office','docs')} style={{background:'#eff6ff',color:'#1e3a8a',fontWeight:700}}>📜 সনদ ও প্রত্যয়ন</button><button type="button" className="mini" onClick={()=>choose('office','idcards')} style={{background:'#fef3c7',color:'#92400e',fontWeight:700}}>🪪 আইডি কার্ড</button></div></div>}{userRole==='teacher'&&<div style={{background:'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',color:'#ffffff',padding:'12px 18px',borderRadius:'10px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 8px rgba(2,132,199,0.15)',flexWrap:'wrap',gap:'10px'}}><div><div style={{fontWeight:800,fontSize:'15px'}}>📖 {effectiveMe?.teacher_name||effectiveMe?.full_name||'বিষয় শিক্ষক'} • বিষয় শিক্ষক ({effectiveMe?.subject||'নির্ধারিত বিষয়'})</div><div style={{fontSize:'12px',opacity:0.9,marginTop:'2px'}}>আপনার দায়িত্ব: নিজ নির্ধারিত বিষয়ের পরীক্ষার লিখিত ও MCQ নম্বর এন্ট্রি, ১-ক্লিকে প্রশ্ন তৈরী, শিক্ষক সময়সূচি ও শ্রেণি রুটিন।</div></div><div style={{display:'flex',gap:'8px'}}><button type="button" className="mini" onClick={()=>choose('results','marks')} style={{background:'#ffffff',color:'#0284c7',fontWeight:700}}>📈 বিষয় নম্বর দিন</button><button type="button" className="mini" onClick={()=>choose('question','generator')} style={{background:'#fef3c7',color:'#92400e',fontWeight:700}}>❓ প্রশ্নব্যাংক</button><button type="button" className="mini" onClick={()=>choose('routine','teacher_schedule')} style={{background:'#e0f2fe',color:'#0369a1',fontWeight:700}}>🗓️ ক্লাস রুটিন</button></div></div>}<ErrorBoundary>{isModuleAllowed('office')&&active==='office'&&<OfficeAssistantPanel sub={sub} setSub={setSub}/>} {isModuleAllowed('dashboard')&&active==='dashboard'&&<Dashboard data={data}/>} {isModuleAllowed('students')&&active==='students'&&sub==='promotion'?<ResultPanel sub="promotion"/>:isModuleAllowed('students')&&active==='students'&&sub==='village'?<VillageStudentPanel/>:isModuleAllowed('students')&&active==='students'&&userRole!=='co_admin'&&<StudentPanel sub={sub}/>} {isModuleAllowed('staff')&&active==='staff'&&<StaffPanel sub={sub}/>} {isModuleAllowed('admission')&&active==='admission'&&<AdmissionPanel sub={sub}/>} {isModuleAllowed('attendance')&&active==='attendance'&&<AttendancePanel sub={sub}/>} {isModuleAllowed('results')&&active==='results'&&<ResultPanel sub={sub} userRole={userRole}/>} {isModuleAllowed('routine')&&active==='routine'&&<RoutinePanel sub={sub}/>} {isModuleAllowed('users')&&active==='users'&&<UsersPanel sub={sub}/>} {isModuleAllowed('finance')&&active==='finance'&&<FinancePanel sub={sub}/>} {isModuleAllowed('library')&&active==='library'&&<LibraryPanel sub={sub} setSub={setSub} onNavigate={(k,s)=>choose(k,s)}/>} {isModuleAllowed('learning')&&active==='learning'&&<LearningPanel/>} {isModuleAllowed('question')&&active==='question'&&<QuestionBankPanel sub={sub} setSub={setSub}/>} {isModuleAllowed('assignment')&&active==='assignment'&&<AssignmentPanel/>} {isModuleAllowed('online_exam')&&active==='online_exam'&&<OnlineExamPanel/>} {isModuleAllowed('ai')&&active==='ai'&&<AIPanel/>} {isModuleAllowed('reports')&&active==='reports'&&<ReportsPanel/>} {isModuleAllowed('documents')&&active==='documents'&&<DocumentPanel sub={sub}/>} {isModuleAllowed('settings')&&active==='settings'&&<SettingsPanelWrapper sub={sub} setSub={setSub}/>} {isModuleAllowed('notice')&&active==='notice'&&<NoticePanel/>} {isModuleAllowed('notifications')&&active==='notifications'&&<NotificationPanel/>} {isModuleAllowed('content')&&active==='content'&&<ContentPanel sub={sub}/>} {isModuleAllowed('transport')&&active==='transport'&&<TransportPanel/>} {isModuleAllowed('hostel')&&active==='hostel'&&<HostelPanel/>} {isModuleAllowed('feature_control')&&active==='feature_control'&&<FeatureControlPanel sub={sub}/>}</ErrorBoundary></section>{supabaseSyncOpen && <SupabaseSyncModal isOpen={supabaseSyncOpen} onClose={()=>setSupabaseSyncOpen(false)} />}</div>
 }

 const adminEn={
 'সারাংশ':'Summary','একাডেমিক':'Academic','প্রশাসন':'Administration','শিক্ষা':'Learning','রিপোর্ট ও ডকুমেন্ট':'Reports & Documents','অফিস সহকারী':'Office Assistant','অফিস সহকারী ডেস্ক':'Office Assistant Desk','গ্রন্থাগার':'Library','কনটেন্ট ও সুবিধা':'Content & Facilities','যোগাযোগ':'Communication','নিরাপত্তা':'Security','ড্যাশবোর্ড':'Dashboard','শিক্ষার্থী':'Students','শিক্ষার্থী তালিকা':'Student Directory','নতুন শিক্ষার্থী এন্ট্রি':'New Student Entry','শিক্ষার্থী অনুসন্ধান':'Student Search','ভোটার তালিকা':'Voter List','শিক্ষক ভোটার তালিকা':'Teacher Voter List','গ্রামভিত্তিক তালিকা':'Village-wise List','শিক্ষক ও কর্মচারী':'Teachers & Staff','শিক্ষকবৃন্দের তালিকা':'Teachers List','নতুন শিক্ষক এন্ট্রি':'New Teacher Entry','কর্মচারীর তালিকা':'Staff List','নতুন কর্মচারী এন্ট্রি':'New Staff Entry','ভর্তি':'Admission','ভর্তি আবেদন':'Admission Applications','ভর্তি পরীক্ষা':'Admission Test','নির্বাচন ও ভর্তি':'Selection & Enrollment','উপস্থিতি':'Attendance','দৈনিক উপস্থিতি':'Daily Attendance','উপস্থিতি রিপোর্ট':'Attendance Reports','অভিভাবক সতর্কতা':'Guardian Alerts','পরীক্ষা ও ফলাফল':'Exams & Results','পরীক্ষা ও বিষয় সেটআপ':'Exam & Subject Setup','মার্ক এন্ট্রি':'Marks Entry','ফলাফল প্রসেসিং':'Result Processing','মার্কশিট ও প্রগ্রেস রিপোর্ট':'Marksheet & Progress Report','ট্যাবুলেশন শিট':'Tabulation Sheet','মেধা তালিকা':'Merit List','প্রমোশন':'Promotion','প্রমোশন ও SSC ফরমপূরণ':'Promotion & SSC Form Fill-up','শিক্ষার্থী প্রমোশন':'Student Promotion','রুটিন':'Routine','রুটিন ও সময়সূচি':'Routine & Schedule','ক্লাস রুটিন':'Class Routine','পরীক্ষার রুটিন':'Exam Routine','শিক্ষক সময়সূচি':'Teacher Schedule','প্রিন্ট ও PDF রুটিন':'Print & PDF Routine','ফি ও হিসাব':'Fees & Accounts','শিক্ষার্থী ফি আদায়':'Student Fee Collection','রশিদ ও ইতিহাস':'Receipts & History', 'বিদ্যালয়ের আয়':'School Income','বিদ্যালয়ের ব্যয়':'School Expense','বার্ষিক বাজেট':'Annual Budget','ক্যাশ বুক ও বিবরণী':'Cash Book & Statement','ফি রেট সেটিংস':'Fee Rate Settings','শ্রেণি শিক্ষক নির্ধারণ':'Class Teacher Assignment','লাইব্রেরি':'Library','বই ক্যাটালগ ও রেজিস্টার':'Book Catalog & Inventory','বই ইস্যু ও জমার হিসাব':'Book Issue & Return','বকেয়া/অনাদায়ী তালিকা':'Overdue List','সাপ্তাহিক ও মাসিক রিপোর্ট':'Weekly & Monthly Reports','নষ্ট ও বাতিল বই রেজিস্টার':'Damaged & Discarded Register','ডিজিটাল লার্নিং':'Digital Learning','ডিজিটাল কনটেন্ট':'Digital Content','সিলেবাস':'Syllabus','শিক্ষার্থী অগ্রগতি':'Student Progress','প্রশ্নব্যাংক':'Question Bank','১-ক্লিকে প্রশ্ন তৈরী':'1-Click Question Generator','OMR Evaluator ও শিট':'OMR Evaluator & Sheet','অধ্যায়ভিত্তিক প্রশ্নভাণ্ডার':'Chapter Question Bank','সংরক্ষিত প্রশ্নপত্র':'Saved Exam Papers','মডেল প্রশ্ন':'Model Questions','অ্যাসাইনমেন্ট':'Assignments','মূল্যায়ন':'Evaluation','অনলাইন পরীক্ষা':'Online Exams','পরীক্ষা সেটআপ':'Exam Setup','পরীক্ষার ফলাফল':'Exam Results','AI শিক্ষা':'AI Education','AI বিশ্লেষণ':'AI Analytics','রিপোর্ট':'Reports','ডকুমেন্ট ও প্রিন্ট':'Documents & Print','প্রশংসাপত্র':'Commendation Certificate','ছাড়পত্র (TC)':'Transfer Certificate (TC)','প্রত্যয়ন পত্র':'Bonafide Certificate','সহশিক্ষা ও অর্জন':'School Life & Achievements','বিদ্যালয় তথ্য':'School Information','ক্লাব ও সংগঠন':'Clubs & Organizations','ইভেন্ট ও অংশগ্রহণকারী':'Events & Participants','অর্জন ও পুরস্কার':'Achievements & Awards','পরিবহন':'Transport','হোস্টেল':'Hostel','নোটিশ':'Notices','নোটিফিকেশন':'Notifications','ইউজার ও রোল':'Users & Roles','ব্যবহারকারী':'Users','রোল ও অনুমতি':'Roles & Permissions','সেশন ও নিরাপত্তা':'Sessions & Security','সেটিংস':'Settings','বাণী ও ফটো সেটিংস':'Leadership Speeches & Photos','পাসওয়ার্ড পরিবর্তন':'Change Password','ফিচার কন্ট্রোল':'Feature Control','সিস্টেম Feature ON/OFF':'System Feature ON/OFF','View Site Menu ON/OFF':'View Site Menu ON/OFF','নতুন Feature যোগ':'Add New Feature'};
 const ADMIN_NAV_GROUPS=[
   {group:'সারাংশ',items:[{k:'dashboard',n:'ড্যাশবোর্ড',e:'Dashboard',i:'📊'}]},
   {group:'একাডেমিক',items:[
    {k:'students',n:'শিক্ষার্থী',i:'🎓',subs:[['list','শিক্ষার্থী তালিকা'],['new','নতুন শিক্ষার্থী এন্ট্রি'],['csv','CSV শিক্ষার্থী আপলোড'],['promotion','শিক্ষার্থী প্রমোশন']]},
    {k:'staff',n:'শিক্ষক ও কর্মচারী',i:'👨‍🏫',subs:[['teachers_list','শিক্ষকবৃন্দের তালিকা'],['teacher_new','নতুন শিক্ষক এন্ট্রি'],['teacher_voters','শিক্ষক ভোটার তালিকা'],['staff_list','কর্মচারীর তালিকা'],['staff_new','নতুন কর্মচারী এন্ট্রি']]},
    {k:'admission',n:'ভর্তি ব্যবস্থাপনা',i:'📝',subs:[['applications','সকল আবেদন ও স্ক্রুটিনি'],['head_approval','প্রধান শিক্ষকের অনুমোদন ডেক্স'],['teacher_enrollment','শ্রেণি শিক্ষকের ক্লাসে অন্তর্ভুক্তকরণ'],['admitted_list','চূড়ান্ত ভর্তিকৃত রেজিস্টার'],['fees','ভর্তি ফি ও পেমেন্ট মনিটরিং']]},
    {k:'attendance',n:'উপস্থিতি',i:'🕘',subs:[['daily','দৈনিক উপস্থিতি'],['reports','উপস্থিতি রিপোর্ট'],['alerts','অভিভাবক সতর্কতা']]},
    {k:'results',n:'পরীক্ষা ও ফলাফল',i:'📈',subs:[['academic_year','একাডেমিক ইয়ার সেটআপ'],['exam_names','পরীক্ষার নাম সেটআপ'],['marks','মার্ক এন্ট্রি'],['subjects','বিষয় ও নম্বর বণ্টন'],['grading','গ্রেডিং পলিসি'],['processing','ফলাফল প্রসেসিং'],['analysis','ফলাফল বিশ্লেষণ'],['marksheet','মার্কশিট ও প্রগ্রেস রিপোর্ট'],['tabulation','ট্যাবুলেশন শিট'],['merit','মেধা তালিকা'],['promotion','শিক্ষার্থী প্রমোশন']]},
    {k:'routine',n:'রুটিন ও সময়সূচি',i:'🗓️',subs:[['class_routine','ক্লাস রুটিন'],['exam_routine','পরীক্ষার রুটিন'],['teacher_schedule','শিক্ষক সময়সূচি'],['print_routine','প্রিন্ট ও PDF রুটিন']]},
   ]},
   {group:'প্রশাসন',items:[{k:'finance',n:'ফি ও হিসাব',i:'💳',subs:[['collect','শিক্ষার্থী ফি আদায়'],['receipts','রশিদ ও ইতিহাস'],['income','বিদ্যালয়ের আয়'],['expense','বিদ্যালয়ের ব্যয়'],['budget','বার্ষিক বাজেট'],['cashbook','ক্যাশ বুক ও বিবরণী'],['rates','ফি রেট সেটিংস'],['teachers','শ্রেণি শিক্ষক নির্ধারণ']]},{k:'library',n:'গ্রন্থাগার',i:'📚',subs:[['catalog','বই ক্যাটালগ ও রেজিস্টার'],['issue','বই ইস্যু ও জমার হিসাব'],['overdue','বকেয়া/অনাদায়ী তালিকা'],['reports','সাপ্তাহিক ও মাসিক রিপোর্ট'],['damaged','নষ্ট ও বাতিল বই রেজিস্টার']]}]},
   {group:'অফিস সহকারী',items:[{k:'office',n:'অফিস সহকারী ডেস্ক',i:'🏢',subs:[['fees','ফি আদায় ও মানি রসিদ'],['admission','ভর্তি ও আবেদন'],['docs','প্রত্যয়ন, প্রশংসাপত্র ও TC'],['idcards','আইডি কার্ড প্রিন্ট'],['voters','ভোটার ও শিক্ষার্থী তালিকা']]}]},
   {group:'শিক্ষা',items:[
    {k:'learning',n:'ডিজিটাল লার্নিং',i:'💻',subs:[['content','ডিজিটাল কনটেন্ট'],['syllabus','সিলেবাস'],['progress','শিক্ষার্থী অগ্রগতি']]},
    {k:'question',n:'প্রশ্নব্যাংক',i:'❓',subs:[['generator','১-ক্লিকে প্রশ্ন তৈরী'],['omr','OMR Evaluator ও শিট'],['bank','অধ্যায়ভিত্তিক প্রশ্নভাণ্ডার'],['saved','সংরক্ষিত প্রশ্নপত্র'],['model','মডেল প্রশ্ন']]},
    {k:'assignment',n:'অ্যাসাইনমেন্ট',i:'📘',subs:[['manage','অ্যাসাইনমেন্ট'],['review','মূল্যায়ন']]},
    {k:'online_exam',n:'অনলাইন পরীক্ষা',i:'🧪',subs:[['setup','পরীক্ষা সেটআপ'],['results','পরীক্ষার ফলাফল']]},
    {k:'ai',n:'AI শিক্ষা',i:'✨',subs:[['tutor','AI Tutor'],['analytics','AI বিশ্লেষণ']]}
   ]},
   {group:'রিপোর্ট ও ডকুমেন্ট',items:[{k:'reports',n:'রিপোর্ট',i:'📑'},{k:'documents',n:'ডকুমেন্ট ও প্রিন্ট',i:'🖨️',subs:[['id','ID Card'],['commendation_certificate','প্রশংসাপত্র'],['transfer_certificate','ছাড়পত্র (TC)'],['bonafide_certificate','প্রত্যয়ন পত্র'],['marksheet','Marksheet'],['certificate','Certificate'],['admit','Admit Card'],['tabulation','Tabulation'],['merit','Merit List']]}]},
   {group:'কনটেন্ট ও সুবিধা',items:[{k:'content',n:'সহশিক্ষা ও অর্জন',i:'🏆',subs:[['school','বিদ্যালয় তথ্য'],['clubs','ক্লাব ও সংগঠন'],['submissions','দেয়াল পত্রিকা ও ক্লাব লেখা'],['events','ইভেন্ট ও অংশগ্রহণকারী'],['achievements','অর্জন ও পুরস্কার']]},{k:'transport',n:'পরিবহন',i:'🚌'},{k:'hostel',n:'হোস্টেল',i:'🛏️'}]},
   {group:'যোগাযোগ',items:[{k:'notice',n:'নোটিশ',i:'📢'},{k:'notifications',n:'নোটিফিকেশন',i:'🔔'}]},
   {group:'নিরাপত্তা',items:[{k:'users',n:'ইউজার ও রোল',i:'👥',subs:[['accounts','ব্যবহারকারী'],['roles','রোল ও অনুমতি'],['provision','Profile → Login'],['sessions','সেশন ও নিরাপত্তা']]},{k:'settings',n:'সেটিংস',i:'⚙️',subs:[['leadership','বাণী ও ফটো সেটিংস'],['password','পাসওয়ার্ড পরিবর্তন']]},{k:'feature_control',n:'ফিচার কন্ট্রোল',i:'🧩',subs:[['system','সিস্টেম Feature ON/OFF'],['public','View Site Menu ON/OFF'],['custom','নতুন Feature যোগ']]}]}
  ];

function Dashboard({data}){const d=data||{};return <><div className="stats adminstats"><div><b>{d.students??'—'}</b><span>সক্রিয় শিক্ষার্থী</span></div><div><b>{d.teachers??'—'}</b><span>সক্রিয় শিক্ষক</span></div><div><b>{d.notices??'—'}</b><span>প্রকাশিত নোটিশ</span></div><div><b>{d.users??'—'}</b><span>সক্রিয় ব্যবহারকারী</span></div></div><div className="dash-grid"><article><h2>V118 সিস্টেম স্ট্যাটাস</h2><p>শিক্ষার্থী, শিক্ষক, attendance, result, learning, portal ও official document workflows সক্রিয় আছে।</p></article><article><h2>Pilot Ready</h2><p>লাইভ পর্যবেক্ষণ ইঞ্জিন, ডেটাবেস ফলব্যাক এবং RBAC পোর্টাল সক্রিয়।</p></article><article><h2>নিরাপত্তা</h2><p>RBAC, JWT session, password hashing, audit log ও rate limiting চালু আছে।</p></article></div></>}
const FATHER_PROFESSIONS = [
  'কৃষি শ্রমিক',
  'অকৃষি শ্রমিক',
  'ব্যবসায়ী',
  'ক্ষুদ্র ব্যবসায়ী',
  'সরকারি চাকুরিজীবী',
  'বেসরকারি চাকুরিজীবী',
  'পল্লী চিকিৎসক',
  'আইনজীবী',
  'শিক্ষকতা',
  'জেলে',
  'তাঁতী',
  'কামার/কুমার',
  'প্রবাসী',
  'প্রকৌশলী',
  'ডাক্তার / চিকিৎসক',
  'চালক / ড্রাইভার',
  'দিনমজুর',
  'অবসরপ্রাপ্ত',
  'মৃত',
  'অন্যান্য'
];

const MOTHER_PROFESSIONS = [
  'গৃহিনী',
  'শিক্ষকতা',
  'বেসরকারি চাকুরিজীবী',
  'সরকারি চাকুরিজীবী',
  'ব্যবসায়ী',
  'ক্ষুদ্র ব্যবসায়ী',
  'কৃষি শ্রমিক',
  'অকৃষি শ্রমিক',
  'পল্লী চিকিৎসক',
  'আইনজীবী',
  'ডাক্তার / নার্স',
  'প্রবাসী',
  'গৃহকর্মী / সহায়িকা',
  'অন্যান্য'
];


function getStudentGroupPriority(s) {
  if (!s) return 99;
  const sid = String(s.student_id || s.id || '').toUpperCase();
  if (sid.includes('-HUM') || sid.includes('_HUM') || sid.includes('/HUM') || sid.includes('HUM-') || sid.includes('-ARTS-')) return 2;
  if (sid.includes('-BS') || sid.includes('_BS') || sid.includes('/BS') || sid.includes('BS-') || sid.includes('-COM-') || sid.includes('-BUS-')) return 3;
  if (sid.includes('-SCI') || sid.includes('_SCI') || sid.includes('/SCI') || sid.includes('SCI-')) return 1;

  const dept = String(s.department || '').trim().toLowerCase();
  if (dept.includes('মানবিক') || dept.includes('humanities') || dept.includes('arts')) return 2;
  if (dept.includes('ব্যবসা') || dept.includes('ব্যবসায়') || dept.includes('ব্যবসায়') || dept.includes('বাণিজ্য') || dept.includes('business') || dept.includes('commerce') || dept === 'bs') return 3;
  if (dept.includes('বিজ্ঞান') || dept.includes('science') || dept === 'sci') return 1;

  const grp = String(s.group_name || s.group || s.section || '').trim().toLowerCase();
  if (grp.includes('মানবিক') || grp.includes('humanities') || grp.includes('arts')) return 2;
  if (grp.includes('ব্যবসা') || grp.includes('ব্যবসায়') || grp.includes('ব্যবসায়') || grp.includes('বাণিজ্য') || grp.includes('business') || grp.includes('commerce') || grp === 'bs') return 3;
  if (grp.includes('বিজ্ঞান') || grp.includes('science') || grp === 'sci') return 1;

  return 1;
}

function sortStudentsList(list) {
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

const DISABILITY_OPTIONS = [
  'অটিস্টিক',
  'শারীরিক প্রতিবন্ধিতা',
  'মানসিক অসুস্থতাজনিত প্রতিবন্ধিতা',
  'দৃষ্টি প্রতিবন্ধিতা',
  'বাক প্রতিবন্ধিতা',
  'বুদ্ধি প্রতিবন্ধিতা',
  'শ্রবণ প্রতিবন্ধিতা',
  'শ্রবণ-দৃষ্টি প্রতিবন্ধিতা',
  'ডাউন সিন্ড্রোম',
  'অন্যান্য'
];

const emptyStudent={student_id:'',roll_no:'',name_bn:'',name_en:'',class_name:'6',group_name:'',group:'',section:'',gender:'',date_of_birth:'',blood_group:'',religion:'ইসলাম',is_special_needs:'না',disability_type:'',father_name:'',father_name_en:'',father_nid_no:'',father_profession:'',father_mobile:'',father_abroad_country:'',mother_name:'',mother_name_en:'',mother_nid_no:'',mother_profession:'',mother_mobile:'',mother_death_year:'',guardian_name:'',guardian_name_en:'',guardian_nid_no:'',guardian_relation:'',guardian_phone:'',guardian_email:'',address:'',current_village:'',current_post_office:'',current_upazila:'',current_district:'',permanent_village:'',permanent_post_office:'',permanent_upazila:'',permanent_district:'',admission_date:'',admission_class:'6',admission_group:'',previous_school:'',birth_registration_no:'',student_nid_no:'',primary_school_name:'',primary_registration_no:'',primary_completion_year:'',emergency_phone:'',photo_url:'',special_needs:'',additional_notes:'',status:'active',extended_profile:{}};

function StudentPanel({sub}){
 const { lang } = useLanguage();
 const [view, setView] = useState(sub==='new' ? 'form' : sub==='csv' ? 'csv' : sub==='voter' ? 'voter' : 'list');
 const [students,setStudents]=useState([]);
 const [form,setForm]=useState({...emptyStudent,extended_profile:{education:[],notes:''}});
 const [editing,setEditing]=useState(null);
 const [q,setQ]=useState('');
 const [className,setClassName]=useState('');
 const [section,setSection]=useState('');
 const [groupFilter,setGroupFilter]=useState('');
 const [genderFilter,setGenderFilter]=useState('');
 const [status,setStatus]=useState('active');
 const [religionFilter,setReligionFilter]=useState('');
 const [msg,setMsg]=useState('');
 const [step,setStep]=useState(0);
 const [customFields,setCustomFields]=useState([]);
 const [customFieldKey,setCustomFieldKey]=useState('');
 const [customFieldValue,setCustomFieldValue]=useState('');
 const [importing,setImporting]=useState(false);
 const [importMsg,setImportMsg]=useState('');
 const [showTotListModal,setShowTotListModal]=useState(false);
 const [showDisabilityQueryModal,setShowDisabilityQueryModal]=useState(false);
 const [showProfessionQueryModal,setShowProfessionQueryModal]=useState(false);
 const [profileStudent, setProfileStudent] = useState(null);
 const [showIdCardModal, setShowIdCardModal] = useState(false);
 const [idCardStudentId, setIdCardStudentId] = useState('');
 const [showCertModal, setShowCertModal] = useState(false);
 const [certStudentId, setCertStudentId] = useState('');
 const [certType, setCertType] = useState('testimonial');
 const [, setPhotoVersion] = useState(0);

 useEffect(() => {
   const handlePhotoSync = () => setPhotoVersion(v => v + 1);
   window.addEventListener('magra_photos_synced', handlePhotoSync);
   return () => window.removeEventListener('magra_photos_synced', handlePhotoSync);
 }, []);

 const handleOpenIdCard = (stuId = '') => {
   setIdCardStudentId(stuId || (students[0]?.id || ''));
   setShowIdCardModal(true);
 };

 const handleOpenCert = (stuId = '', type = 'testimonial') => {
   setCertStudentId(stuId || (students[0]?.id || ''));
   setCertType(type);
   setShowCertModal(true);
 };

 const handleOpenProfile = (s) => {
   setProfileStudent(s);
 };
 const [actionMenu, setActionMenu] = useState(null);

 useEffect(() => {
   const handleScroll = () => {
     if (actionMenu) setActionMenu(null);
   };
   window.addEventListener('scroll', handleScroll, true);
   return () => window.removeEventListener('scroll', handleScroll, true);
 }, [actionMenu]);

 const toggleActionMenu = (e, s) => {
   e.stopPropagation();
   if (actionMenu?.studentId === s.id) {
     setActionMenu(null);
   } else {
     const rect = e.currentTarget.getBoundingClientRect();
     const menuWidth = 195;
     let left = rect.right - menuWidth;
     if (left < 10) left = 10;
     const menuHeight = 220;
     let top = rect.bottom + 4;
     if (top + menuHeight > window.innerHeight) {
       top = Math.max(10, rect.top - menuHeight - 4);
     }
     setActionMenu({
       studentId: s.id,
       top,
       left,
       student: s
     });
   }
 };
 const [disabilityFilter,setDisabilityFilter]=useState('');
 const [professionFilter,setProfessionFilter]=useState('');
 const [professionScope,setProfessionScope]=useState('any');
 const [ageFilter,setAgeFilter]=useState('');
  const [sameAddress,setSameAddress]=useState(false);
  const [selectedIds,setSelectedIds]=useState([]);

  const remove=async(s)=>{
    if(!confirm(`আপনি কি নিশ্চিত যে "${s.name_bn || s.student_id}" শিক্ষার্থীর সকল তথ্য স্থায়ীভাবে মুছে ফেলতে চান?`))return;
    try{
      await api(`/students/${s.id}`,{method:'DELETE'});
      setMsg(`"${s.name_bn || 'শিক্ষার্থী'}" মুছে ফেলা হয়েছে`);
      setSelectedIds(prev=>prev.filter(x=>x!==s.id));
      load();
    }catch(err){
      setMsg(err.message||'শিক্ষার্থী মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const toggleSelectAll=(e)=>{
    if(e.target.checked){
      setSelectedIds(students.map(s=>s.id));
    }else{
      setSelectedIds([]);
    }
  };

  const toggleSelectOne=(id)=>{
    setSelectedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  };

  const deleteSelected=async()=>{
    if(!selectedIds.length)return;
    if(!confirm(`আপনি কি নির্বাচিত ${selectedIds.length} জন শিক্ষার্থীর তথ্য মুছে ফেলতে চান?`))return;
    setMsg('নির্বাচিত রেকর্ড মুছে ফেলা হচ্ছে...');
    try{
      for(const id of selectedIds){
        await api(`/students/${id}`,{method:'DELETE'});
      }
      setMsg(`সফলভাবে নির্বাচিত ${selectedIds.length} জন শিক্ষার্থী মুছে ফেলা হয়েছে`);
      setSelectedIds([]);
      load();
    }catch(err){
      setMsg(err.message||'শিক্ষার্থী মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const clearAllStudents=async()=>{
    if(!students.length)return;
    if(!confirm(`⚠️ চূড়ান্ত সতর্কবার্তা: আপনি কি বর্তমান তালিকার মোট ${students.length} জন শিক্ষার্থীর সম্পূর্ণ তথ্য মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`))return;
    setMsg('সকল শিক্ষার্থীর তথ্য মুছে ফেলা হচ্ছে...');
    try{
      for(const s of students){
        await api(`/students/${s.id}`,{method:'DELETE'});
      }
      setMsg('সকল শিক্ষার্থীর তালিকা সফলভাবে খালি করা হয়েছে');
      setSelectedIds([]);
      load();
    }catch(err){
      setMsg(err.message||'শিক্ষার্থী তালিকা খালি করা সম্ভব হয়নি');
    }
  };

  const studentList = sortStudentsList(Array.isArray(students) ? students : (students?.items || [])).filter(s => {
    if (disabilityFilter) {
      if (disabilityFilter === 'special_only') {
        if (!isSpecialNeedsStudent(s)) return false;
      } else {
        const dt = getDisabilityType(s);
        if (!dt || !dt.includes(disabilityFilter)) return false;
      }
    }
    if (professionFilter && !matchesStudentProfession(s, professionFilter, professionScope)) {
      return false;
    }
    if (!ageFilter || ageFilter === 'all') return true;
    return matchesAgeFilter(s, ageFilter);
  });

  const printStudentReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    let listToPrint = [...studentList];
    let reportHeading = 'শিক্ষার্থী তালিকা প্রতিবেদন';
    let filterLabel = 'সকল শিক্ষার্থী';

    const filterInfo = [];
    if (className) filterInfo.push(`শ্রেণি: শ্রেণি ${className}`);
    if (groupFilter) filterInfo.push(`বিভাগ: ${groupFilter.includes('বিজ্ঞান') ? 'বিজ্ঞান বিভাগ' : groupFilter.includes('মানবিক') ? 'মানবিক বিভাগ' : groupFilter.includes('ব্যবসায়') ? 'ব্যবসায় শিক্ষা শাখা' : groupFilter}`);
    if (disabilityFilter) filterInfo.push(`প্রতিবন্ধিতা: ${disabilityFilter === 'special_only' ? 'সকল বিশেষ চাহিদা' : disabilityFilter}`);
    if (professionFilter) filterInfo.push(`পেশা: ${professionFilter} (${professionScope==='father'?'পিতা':professionScope==='mother'?'মাতা':'অভিভাবক'})`);
    if (religionFilter) filterInfo.push(`ধর্ম: ${religionFilter}`);
    if (genderFilter) filterInfo.push(`জেন্ডার: ${genderFilter === 'female' ? 'ছাত্রী (নারী)' : genderFilter === 'male' ? 'ছাত্র (পুরুষ)' : genderFilter}`);
    if (status) filterInfo.push(`অবস্থা: ${status === 'active' ? 'সক্রিয়' : status === 'inactive' ? 'নিষ্ক্রিয়' : status}`);
    if (q) filterInfo.push(`অনুসন্ধান: "${q}"`);

    if (filterInfo.length > 0) {
      filterLabel = filterInfo.join(' | ');
      reportHeading = className ? `শ্রেণি ${className} শিক্ষার্থী তালিকা` : groupFilter ? `${groupFilter} শিক্ষার্থী তালিকা` : 'ফিল্টারকৃত শিক্ষার্থী তালিকা';
    } else {
      reportHeading = 'বিদ্যালয়ের সকল শিক্ষার্থীর তালিকা';
      filterLabel = 'সকল শ্রেণি ও বিভাগ';
    }

    // Grouping helper:
    // Classes 6, 7, 8 -> Group by Class (শ্রেণি ভিত্তিক)
    // Classes 9, 10 -> Group by Class + Department (বিভাগ ভিত্তিক)
    const groups = {};
    const groupOrder = [];

    const getGroupKey = (s) => {
      const c = String(s.class_name || '10').trim();
      const num = parseNum(c, 10);
      if (num <= 8) {
        const title = `শ্রেণি ${c} (${num === 6 ? '৬ষ্ঠ শ্রেণি' : num === 7 ? '৭ম শ্রেণি' : '৮ম শ্রেণি'})`;
        return { key: `class_${num}`, title, type: 'class', classNum: num, order: num };
      } else {
        const rawGrp = (s.department || s.group_name || s.group || s.section || 'সাধারণ').trim();
        const grpClean = rawGrp.includes('বিজ্ঞান') ? 'বিজ্ঞান বিভাগ' : rawGrp.includes('মানবিক') ? 'মানবিক বিভাগ' : (rawGrp.includes('ব্যবসা') || rawGrp.includes('বাণিজ্য')) ? 'ব্যবসায় শিক্ষা শাখা' : rawGrp;
        const title = `শ্রেণি ${c} (${num === 9 ? '৯ম শ্রেণি' : '১০ম শ্রেণি'}) • ${grpClean}`;
        const deptOrder = grpClean.includes('বিজ্ঞান') ? 1 : grpClean.includes('মানবিক') ? 2 : 3;
        return { key: `class_${num}_${grpClean}`, title, type: 'dept', classNum: num, dept: grpClean, order: num * 10 + deptOrder };
      }
    };

    listToPrint.forEach(s => {
      const g = getGroupKey(s);
      if (!groups[g.key]) {
        groups[g.key] = { ...g, students: [] };
        groupOrder.push(g.key);
      }
      groups[g.key].students.push(s);
    });

    // Sort groups
    groupOrder.sort((a, b) => (groups[a].order || 0) - (groups[b].order || 0));

    // Sort students within each group by roll_no
    groupOrder.forEach(k => {
      groups[k].students.sort((a, b) => (parseNum(a.roll_no, 9999) - parseNum(b.roll_no, 9999)));
    });

    const sectionsHtml = groupOrder.map((k, gIdx) => {
      const grp = groups[k];
      const rowsHtml = grp.students.map((s, idx) => `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="text-align:center;font-family:monospace;font-weight:600;">${s.student_id || '—'}</td>
          <td style="text-align:center;font-weight:700;">${s.roll_no || '—'}</td>
          <td style="font-weight:600;">${s.name_bn || s.name_en || '—'}</td>
          <td style="text-align:center;">শ্রেণি ${s.class_name || '—'}</td>
          <td style="text-align:center;font-weight:600;color:#0369a1;">${s.department || s.group_name || s.group || s.section || '—'}</td>
          <td style="text-align:center;">${s.religion || 'ইসলাম'}</td>
          <td style="text-align:center;">${s.gender === 'female' || s.gender === 'ছাত্রী' || s.gender === 'নারী' ? 'ছাত্রী' : 'ছাত্র'}</td>
          <td>${s.guardian_name || s.father_name || '—'}</td>
          <td style="text-align:center;font-family:monospace;">${s.guardian_phone || s.father_mobile || '—'}</td>
          <td style="text-align:center;font-weight:600;color:${s.status === 'inactive' ? '#dc2626' : '#16a34a'};">${s.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়'}</td>
        </tr>
      `).join('');

      return `
        <div class="report-group-section" style="${gIdx > 0 ? 'page-break-before: always; margin-top: 30px;' : ''}">
          <div style="background: #f1f5f9; border-left: 5px solid #047857; padding: 8px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">
              ${grp.type === 'class' ? '🏫 শ্রেণি ভিত্তিক তালিকা:' : '📚 বিভাগ ভিত্তিক তালিকা:'} ${grp.title}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #047857; background: #fff; padding: 3px 10px; border-radius: 4px; border: 1px solid #cbd5e1;">
              মোট: ${grp.students.length} জন
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;">ক্র.নং</th>
                <th style="width:65px;">আইডি</th>
                <th style="width:40px;">রোল</th>
                <th>শিক্ষার্থীর নাম</th>
                <th style="width:55px;">শ্রেণি</th>
                <th style="width:110px;">বিভাগ/শাখা</th>
                <th style="width:60px;">ধর্ম</th>
                <th style="width:50px;">লিঙ্গ</th>
                <th>অভিভাবকের নাম</th>
                <th style="width:95px;">মোবাইল</th>
                <th style="width:55px;">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer-signs" style="display: flex; justify-content: space-between; margin-top: 40px; padding: 0 20px;">
            <div class="sign-box" style="text-align: center; border-top: 1px solid #334155; width: 170px; padding-top: 4px; font-size: 11px; font-weight: 700;">শ্রেণি শিক্ষকের স্বাক্ষর</div>
            <div class="sign-box" style="text-align: center; border-top: 1px solid #334155; width: 170px; padding-top: 4px; font-size: 11px; font-weight: 700;">যাচাইকারীর স্বাক্ষর</div>
            <div class="sign-box" style="text-align: center; border-top: 1px solid #334155; width: 170px; padding-top: 4px; font-size: 11px; font-weight: 700;">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${reportHeading} - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; }
          .school-title { font-size: 22px; font-weight: 800; color: #047857; margin: 0; }
          .school-sub { font-size: 13px; color: #475569; margin: 3px 0 0 0; }
          .report-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 8px 0 2px 0; background: #f1f5f9; display: inline-block; padding: 3px 16px; border-radius: 4px; border: 1px solid #cbd5e1; }
          .meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; color: #334155; font-weight: 600; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          th { background: #f8fafc; color: #0f172a; font-weight: 700; border: 1px solid #64748b; padding: 6px 8px; font-size: 12px; }
          td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 12px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            .report-group-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 12px; display: flex; gap: 10px; justify-content: flex-end; background: #f0fdf4; padding: 8px 12px; border-radius: 8px; border: 1px solid #86efac;">
          <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">🖨️ প্রিন্ট করুন / Save as PDF</button>
          <button onclick="window.close()" style="background:#64748b;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;">✕ বন্ধ করুন</button>
        </div>
        <div class="header">
          <div class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          <div class="school-sub">ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল • EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.</div>
          <div class="report-title">📋 ${reportHeading}</div>
        </div>
        <div class="meta-bar">
          <div><b>🔍 প্রতিবেদন টাইপ / ফিল্টার:</b> ${filterLabel}</div>
          <div><b>📊 মোট শিক্ষার্থী:</b> ${listToPrint.length} জন | <b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ${sectionsHtml || '<p style="text-align:center;padding:30px;color:#64748b;">কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি</p>'}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(()=>{
   if(sub==='new'){
    setEditing(null);
    setForm({...emptyStudent,extended_profile:{education:[]}});
    setStep(0);
    setView('form');
   } else if(sub==='list'||sub==='search'){
    setView('list');
   } else if(sub==='csv'){
    setView('csv');
   } else if(sub==='voter'){
    setView('voter');
   }
  },[sub]);

  useEffect(()=>{
   api('/admin/form-fields?form_key=student').then(setCustomFields).catch(()=>setCustomFields([]));
  },[]);

  const load = () => {
    api(`/students?q=${encodeURIComponent(q)}&class_name=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&group=${encodeURIComponent(groupFilter)}&gender=${encodeURIComponent(genderFilter)}&status=${encodeURIComponent(status)}&religion=${encodeURIComponent(religionFilter)}&custom_field_key=${encodeURIComponent(customFieldKey)}&custom_field_value=${encodeURIComponent(customFieldValue)}`)
      .then(data => {
        setStudents(Array.isArray(data) ? data : (data?.items || []));
      })
      .catch(e => {
        setStudents([]);
        setMsg(e.message || 'ডাটা লোড ব্যর্থ হয়েছে');
      });
  };

  useEffect(() => {
    load();
  }, [q, className, section, groupFilter, genderFilter, status, religionFilter, customFieldKey, customFieldValue]);

  const exportStudents = () => {
    const custom = customFields.filter(f => f.enabled && !f.is_system);
    const headers = [
      'Student ID',
      'Roll',
      'Name (Bangla)',
      'Name (English)',
      'Class',
      'Department',
      'Section',
      'Gender',
      'Religion',
      'Date of Birth',
      'Blood Group',
      'Birth Registration No',
      'Student NID',
      'Father Name (Bangla)',
      'Father Name (English)',
      'Father NID',
      'Father Profession',
      'Father Mobile',
      'Mother Name (Bangla)',
      'Mother Name (English)',
      'Mother NID',
      'Mother Profession',
      'Mother Mobile',
      'Guardian Name',
      'Guardian Relation',
      'Guardian Mobile',
      'Guardian NID',
      'Guardian Email',
      'Current Village',
      'Current Post Office',
      'Current Upazila',
      'Current District',
      'Permanent Village',
      'Permanent Post Office',
      'Permanent Upazila',
      'Permanent District',
      'Full Address',
      'Admission Class',
      'Admission Date',
      'Previous School',
      'Emergency Phone',
      'Special Needs / Notes',
      'Status',
      ...custom.map(f => 'custom:' + f.field_key),
      'extended_profile_json'
    ];

    const rows = studentList.map(x => {
      const c = flattenCustom(x);
      return {
        'Student ID': x.student_id || '',
        'Roll': x.roll_no || '',
        'Name (Bangla)': x.name_bn || '',
        'Name (English)': x.name_en || '',
        'Class': x.class_name || '',
        'Department': x.department || x.group_name || x.group || (['9','10','৯','১০'].includes(String(x.class_name)) ? 'সাধারণ' : '—'),
        'Section': x.section || '',
        'Gender': x.gender === 'female' || x.gender === 'ছাত্রী' || x.gender === 'নারী' ? 'নারী (ছাত্রী)' : 'পুরুষ (ছাত্র)',
        'Religion': x.religion || 'ইসলাম',
        'Date of Birth': x.date_of_birth || '',
        'Blood Group': x.blood_group || '',
        'Birth Registration No': x.birth_registration_no || '',
        'Student NID': x.student_nid_no || '',
        'Father Name (Bangla)': x.father_name || '',
        'Father Name (English)': x.father_name_en || '',
        'Father NID': x.father_nid_no || '',
        'Father Profession': x.father_profession || '',
        'Father Mobile': x.father_mobile || '',
        'Mother Name (Bangla)': x.mother_name || '',
        'Mother Name (English)': x.mother_name_en || '',
        'Mother NID': x.mother_nid_no || '',
        'Mother Profession': x.mother_profession || '',
        'Mother Mobile': x.mother_mobile || '',
        'Guardian Name': x.guardian_name || getStudentGuardian(x),
        'Guardian Relation': x.guardian_relation || (x.guardian_name ? 'অভিভাবক' : 'পিতা'),
        'Guardian Mobile': x.guardian_phone || getStudentPhone(x),
        'Guardian NID': x.guardian_nid_no || '',
        'Guardian Email': x.guardian_email || '',
        'Current Village': x.current_village || '',
        'Current Post Office': x.current_post_office || '',
        'Current Upazila': x.current_upazila || '',
        'Current District': x.current_district || '',
        'Permanent Village': x.permanent_village || '',
        'Permanent Post Office': x.permanent_post_office || '',
        'Permanent Upazila': x.permanent_upazila || '',
        'Permanent District': x.permanent_district || '',
        'Full Address': x.address || '',
        'Admission Class': x.admission_class || x.class_name || '',
        'Admission Date': x.admission_date || '',
        'Previous School': x.previous_school || '',
        'Emergency Phone': x.emergency_phone || x.guardian_phone || '',
        'Special Needs / Notes': x.special_needs || x.additional_notes || '',
        'Status': x.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়',
        ...c,
        'extended_profile_json': JSON.stringify(x.extended_profile || {})
      };
    });
    const filename = 'magra-students.csv';
    downloadCsv(filename, rows, headers);
  };

 const studentImportHeaders=['student_id','roll_no','name_bn','name_en','class_name','department','section','gender','date_of_birth','blood_group','religion','birth_registration_no','student_nid_no','father_name','father_name_en','father_nid_no','father_profession','father_mobile','father_abroad_country','mother_name','mother_name_en','mother_nid_no','mother_profession','mother_mobile','mother_death_year','guardian_name','guardian_name_en','guardian_relation','guardian_phone','guardian_nid_no','guardian_email','address','current_village','current_post_office','current_upazila','current_district','permanent_village','permanent_post_office','permanent_upazila','permanent_district','admission_class','admission_date','previous_school','emergency_phone','special_needs','additional_notes','status','extended_profile_json'];

 const downloadStudentTemplate=()=>downloadCsv('magra-student-import-template.csv',[{
  student_id:'STU-2026-0001',
  roll_no:'01',
  name_bn:'আহনাফ সিদ্দিক',
  name_en:'Ahnaf Siddique',
  class_name:'6',
  department:'সাধারণ',
  section:'A',
  gender:'পুরুষ',
  date_of_birth:'2014-01-01',
  blood_group:'B+',
  religion:'ইসলাম',
  birth_registration_no:'20140000000000000',
  student_nid_no:'',
  father_name:'মোঃ রফিকুল ইসলাম',
  father_name_en:'Md. Rafiqul Islam',
  father_nid_no:'',
  father_profession:'ব্যবসায়ী',
  father_mobile:'01711000000',
  father_abroad_country:'',
  mother_name:'মোছাঃ ফাতেমা খাতুন',
  mother_name_en:'Fatema Khatun',
  mother_nid_no:'',
  mother_profession:'গৃহিণী',
  mother_mobile:'01722000000',
  mother_death_year:'',
  guardian_name:'',
  guardian_name_en:'',
  guardian_relation:'',
  guardian_phone:'',
  guardian_nid_no:'',
  guardian_email:'',
  address:'গ্রাম: মগড়া, কালিহাতি, টাঙ্গাইল',
  current_village:'মগড়া',
  current_post_office:'মগড়া',
  current_upazila:'কালিহাতি',
  current_district:'টাঙ্গাইল',
  permanent_village:'মগড়া',
  permanent_post_office:'মগড়া',
  permanent_upazila:'কালিহাতি',
  permanent_district:'টাঙ্গাইল',
  admission_class:'6',
  admission_date:'2026-01-01',
  previous_school:'মগড়া সরকারি প্রাথমিক বিদ্যালয়',
  emergency_phone:'01711000000',
  special_needs:'',
  additional_notes:'',
  status:'active',
  extended_profile_json:'{}'
 }],studentImportHeaders);

 const importStudents=async(e)=>{
  const file=e.target.files?.[0];
  e.target.value='';
  if(!file)return;
  setImporting(true);
  setMsg('CSV ফাইল প্রসেস ও আপলোড হচ্ছে...');
  try{
   const text=await file.text();
   const matrix=parseCsvText(text);
   if(matrix.length<2)throw new Error('CSV-তে কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি');
   const rawHeaders=matrix[0].map(x=>x.trim().toLowerCase());
   const aliasMap={
    'id':'student_id','student id':'student_id','studentid':'student_id',
    'roll':'roll_no','roll no':'roll_no','roll_number':'roll_no','রোল':'roll_no',
    'name':'name_bn','name (bangla)':'name_bn','নাম':'name_bn','name_bangla':'name_bn','শিক্ষার্থীর নাম':'name_bn',
    'name (english)':'name_en','name_english':'name_en','নাম (ইংরেজি)':'name_en',
    'class':'class_name','class_name':'class_name','শ্রেণি':'class_name',
    'department':'department','group':'department','group_name':'department','বিভাগ':'department','বিভাগ / গ্রুপ':'department',
    'section':'section','শাখা':'section',
    'gender':'gender','লিঙ্গ':'gender','জেন্ডার':'gender',
    'religion':'religion','ধর্ম':'religion','religion_name':'religion',
    'date of birth':'date_of_birth','date_of_birth':'date_of_birth','জন্ম তারিখ':'date_of_birth','dob':'date_of_birth',
    'blood group':'blood_group','blood_group':'blood_group','রক্তের গ্রুপ':'blood_group',
    'birth registration no':'birth_registration_no','birth_registration_no':'birth_registration_no','জন্ম নিবন্ধন':'birth_registration_no','জন্ম নিবন্ধন নম্বর':'birth_registration_no',
    'student nid':'student_nid_no','student_nid_no':'student_nid_no','student_nid':'student_nid_no','শিক্ষার্থী nid':'student_nid_no',
    'father name':'father_name','father_name':'father_name','father name (bangla)':'father_name','পিতার নাম':'father_name','পিতার নাম (বাংলা)':'father_name',
    'father name (english)':'father_name_en','father_name_en':'father_name_en','পিতার নাম (ইংরেজি)':'father_name_en',
    'father nid':'father_nid_no','father_nid_no':'father_nid_no','পিতার nid':'father_nid_no',
    'father profession':'father_profession','father_profession':'father_profession','পিতার পেশা':'father_profession',
    'father phone':'father_mobile','father mobile':'father_mobile','father_mobile':'father_mobile','পিতার মোবাইল':'father_mobile',
    'mother name':'mother_name','mother_name':'mother_name','mother name (bangla)':'mother_name','মাতার নাম':'mother_name','মাতার নাম (বাংলা)':'mother_name',
    'mother name (english)':'mother_name_en','mother_name_en':'mother_name_en','মাতার নাম (ইংরেজি)':'mother_name_en',
    'mother nid':'mother_nid_no','mother_nid_no':'mother_nid_no','মাতার nid':'mother_nid_no',
    'mother profession':'mother_profession','mother_profession':'mother_profession','মাতার পেশা':'mother_profession',
    'mother mobile':'mother_mobile','mother_mobile':'mother_mobile','মাতার মোবাইল':'mother_mobile',
    'guardian':'guardian_name','guardian name':'guardian_name','guardian_name':'guardian_name','অভিভাবক':'guardian_name','অভিভাবকের নাম':'guardian_name',
    'guardian relation':'guardian_relation','guardian_relation':'guardian_relation','সম্পর্ক':'guardian_relation',
    'guardian phone':'guardian_phone','guardian mobile':'guardian_phone','guardian_phone':'guardian_phone','মোবাইল':'guardian_phone','অভিভাবকের মোবাইল':'guardian_phone',
    'guardian nid':'guardian_nid_no','guardian_nid_no':'guardian_nid_no','অভিভাবকের nid':'guardian_nid_no',
    'guardian email':'guardian_email','guardian_email':'guardian_email','অভিভাবকের ইমেইল':'guardian_email',
    'village':'current_village','current_village':'current_village','current village':'current_village','বর্তমান গ্রাম':'current_village','গ্রাম':'current_village',
    'current post office':'current_post_office','current_post_office':'current_post_office','বর্তমান ডাকঘর':'current_post_office','ডাকঘর':'current_post_office',
    'current upazila':'current_upazila','current_upazila':'current_upazila','বর্তমান উপজেলা':'current_upazila','উপজেলা':'current_upazila',
    'current district':'current_district','current_district':'current_district','বর্তমান জেলা':'current_district','জেলা':'current_district',
    'permanent village':'permanent_village','permanent_village':'permanent_village','স্থায়ী গ্রাম':'permanent_village',
    'permanent post office':'permanent_post_office','permanent_post_office':'permanent_post_office','স্থায়ী ডাকঘর':'permanent_post_office',
    'permanent upazila':'permanent_upazila','permanent_upazila':'permanent_upazila','স্থায়ী উপজেলা':'permanent_upazila',
    'permanent district':'permanent_district','permanent_district':'permanent_district','স্থায়ী জেলা':'permanent_district',
    'address':'address','full address':'address','ঠিকানা':'address','পূর্ণ ঠিকানা':'address',
    'admission class':'admission_class','admission_class':'admission_class','ভর্তির শ্রেণি':'admission_class',
    'admission date':'admission_date','admission_date':'admission_date','ভর্তির তারিখ':'admission_date',
    'previous school':'previous_school','previous_school':'previous_school','পূর্ববর্তী বিদ্যালয়':'previous_school',
    'emergency phone':'emergency_phone','emergency_phone':'emergency_phone','জরুরি মোবাইল':'emergency_phone','জরুরি ফোন':'emergency_phone',
    'status':'status','অবস্থা':'status'
   };
   const headers=rawHeaders.map(h=>aliasMap[h]||h);
   if(!headers.includes('name_bn')){
    throw new Error('আবশ্যিক কলাম অনুপস্থিত: name_bn (বা নাম / Name)');
   }
   const rows=matrix.slice(1).map((r,rowIdx)=>{
    const obj={};
    headers.forEach((h,i)=>{
     const val=(r[i]??'').trim();
     if(val)obj[h]=val;
    });
    if(!obj.name_bn)return null;
    if(!obj.class_name)obj.class_name='6';
    if(!obj.student_id){
     obj.student_id='STU-'+new Date().getFullYear()+'-'+String(Date.now()+rowIdx).slice(-5);
    }
    if(obj.extended_profile_json){
     try{obj.extended_profile=JSON.parse(obj.extended_profile_json)}catch{}
    }
    return obj;
   }).filter(Boolean);
   if(!rows.length)throw new Error('কোনো বৈধ শিক্ষার্থী তথ্য পাওয়া যায়নি');
   const result=await api('/students/bulk-import',{method:'POST',body:JSON.stringify({students:rows})});
   setMsg(result.message||`${rows.length} জন শিক্ষার্থী সফলভাবে ইমপোর্ট হয়েছে`);
   setView('list');
   load();
  }catch(err){
   setMsg(err.message||'শিক্ষার্থী CSV আপলোড ব্যর্থ হয়েছে');
  }finally{
   setImporting(false);
  }
 };


 const change=(k,v)=>setForm(f=>{
    const updated={...f,[k]:v};
    if(sameAddress && k.startsWith('current_')){
      const permKey=k.replace('current_','permanent_');
      updated[permKey]=v;
    }
    return updated;
  });
  const handleSameAddress=(e)=>{
    const checked=e.target.checked;
    setSameAddress(checked);
    if(checked){
      setForm(f=>({
        ...f,
        permanent_village:f.current_village||'',
        permanent_post_office:f.current_post_office||'',
        permanent_upazila:f.current_upazila||'',
        permanent_district:f.current_district||''
      }));
    }
  };
 const ext=(k,v)=>setForm(f=>({...f,extended_profile:{...(f.extended_profile||{}),[k]:v}}));
 const addEdu=()=>ext('education',[...(form.extended_profile?.education||[]),{exam:'',institution:'',board:'',year:'',result:'',subject:''}]);
 const updateEdu=(i,k,v)=>ext('education',(form.extended_profile?.education||[]).map((r,n)=>n===i?{...r,[k]:v}:r));
 const removeEdu=i=>ext('education',(form.extended_profile?.education||[]).filter((_,n)=>n!==i));

  const handleTableStudentPhotoUpload = (e, targetStudent) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !targetStudent) return;
    if (f.size > 5 * 1024 * 1024) {
      setMsg('ছবির আকার সর্বোচ্চ 5MB হতে হবে');
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxW = 240, maxH = 280;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        saveStudentCustomPhoto(targetStudent, compressed);
        try {
          await api('/students/' + targetStudent.id, {
            method: 'PUT',
            body: JSON.stringify({ ...targetStudent, photo_url: compressed, photo: compressed })
          });
        } catch {}
        setStudents(prev => prev.map(item => {
          if (String(item.id).toLowerCase() === String(targetStudent.id).toLowerCase() || String(item.student_id).toLowerCase() === String(targetStudent.student_id).toLowerCase()) {
            return { ...item, photo_url: compressed, photo: compressed };
          }
          return item;
        }));
        setMsg(`✓ ${targetStudent.name_bn || 'শিক্ষার্থী'}-এর ছবি সফলভাবে আপডেট হয়েছে`);
      };
      img.src = r.result;
    };
    r.readAsDataURL(f);
  };

  const file = e => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setMsg('ছবির আকার সর্বোচ্চ 5MB হতে হবে'); return; }
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 240, maxH = 280;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        change('photo_url', compressed);
        change('photo', compressed);
        saveStudentCustomPhoto({ ...form, photo_url: compressed, photo: compressed }, compressed);
        setMsg('✓ ছবি সিলেক্ট ও প্রস্তুত হয়েছে। নিচের "তথ্য আপডেট করুন" বাটনে ক্লিক করে সেভ সম্পন্ন করুন।');
      };
      img.src = r.result;
    };
    r.readAsDataURL(f);
  };

  const save = async e => {
    e.preventDefault();
    if (form.is_special_needs === 'হ্যাঁ' && !form.disability_type) {
      setMsg('অনুগ্রহ করে বিশেষ চাহিদাসম্পন্ন শিক্ষার্থীর প্রতিবন্ধিতার ধরন নির্বাচন করুন');
      setStep(0);
      return;
    }
    setMsg('সংরক্ষণ হচ্ছে...');
    try {
      const method = editing ? 'PUT' : 'POST';
      const path = editing ? `/students/${editing}` : '/students';
      const cleanClass = form.class_name ? String(form.class_name).replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d) : '6';
      const cleanRoll = form.roll_no ? String(form.roll_no).replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d) : '1';
      const defaultSid = 'STU-' + String(cleanClass).padStart(2, '0') + '-' + String(cleanRoll).padStart(2, '0');
      const payload = {
        ...form,
        student_id: form.student_id || defaultSid,
        class_name: cleanClass,
        roll_no: parseInt(cleanRoll, 10) || cleanRoll,
        is_special_needs: form.is_special_needs || 'না',
        disability_type: form.is_special_needs === 'হ্যাঁ' ? form.disability_type : '',
        special_needs: form.is_special_needs === 'হ্যাঁ' ? (form.disability_type || form.special_needs || 'হ্যাঁ') : ''
      };
      if (form.photo_url || form.photo) {
        payload.photo_url = form.photo_url || form.photo;
        payload.photo = form.photo_url || form.photo;
        saveStudentCustomPhoto(payload, form.photo_url || form.photo);
      }
      const savedStudent = await api(path, { method, body: JSON.stringify(payload) });

      if (editing) {
        setStudents(prev => prev.map(s => {
          if (String(s.id).toLowerCase() === String(editing).toLowerCase() || 
              String(s.student_id).toLowerCase() === String(payload.student_id || editing).toLowerCase()) {
            return { ...s, ...payload, photo_url: form.photo_url || s.photo_url, photo: form.photo_url || s.photo };
          }
          return s;
        }));
      } else {
        setClassName(cleanClass);
        setGroupFilter('');
        setSection('');
        setQ('');
        setStatus('active');
        if (savedStudent) {
          setStudents(prev => [savedStudent, ...prev.filter(x => x.id !== savedStudent.id && x.student_id !== savedStudent.student_id)]);
        }
      }

      setMsg(editing ? '✓ শিক্ষার্থী তথ্য ও ছবি সফলভাবে আপডেট হয়েছে' : '✓ নতুন শিক্ষার্থী সফলভাবে তালিকায় যুক্ত হয়েছে');
      setEditing(null);
      setForm({ ...emptyStudent, extended_profile: { education: [] } });
      setView('list');
      load();
    } catch (e) { setMsg(e.message) }
  };

 const edit=s=>{
  setEditing(s.id);
  const isSpecial = s.is_special_needs ? s.is_special_needs : (s.disability_type || (s.special_needs && s.special_needs !== 'না') ? 'হ্যাঁ' : 'না');
  const disType = s.disability_type || (isSpecial === 'হ্যাঁ' ? (s.special_needs || '') : '');
  setForm({
    ...emptyStudent,
    ...s,
    is_special_needs: isSpecial,
    disability_type: disType,
    admission_date: s.admission_date?.slice(0,10)||'',
    date_of_birth: s.date_of_birth?.slice(0,10)||'',
    extended_profile: s.extended_profile||{education:[]}
  });
  setStep(0);
  setView('form');
  window.scrollTo({top:0,behavior:'smooth'});
 };

 return <div>
  <div className="tabs" style={{marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
   <div style={{display:'flex',gap:'8px'}}>
    <button type="button" className={view==='list'?'active':''} onClick={()=>setView('list')}>📋 শিক্ষার্থী তালিকা ({students.length})</button>
    <button type="button" className={view==='form'?'active':''} onClick={()=>{setEditing(null);setSameAddress(false);setForm({...emptyStudent,extended_profile:{education:[]}});setStep(0);setView('form');}}>➕ {editing?'তথ্য সম্পাদনা':'নতুন শিক্ষার্থী এন্ট্রি'}</button>
    <button type="button" className={view==='csv'?'active':''} onClick={()=>setView('csv')}>📁 CSV শিক্ষার্থী আপলোড</button>
     <button type="button" className={view==='voter'?'active':''} onClick={()=>setView('voter')}>🗳️ ভোটার তালিকা</button>
   </div>
   <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
    <button className="mini" type="button" onClick={downloadStudentTemplate} style={{background:'#f0fdf4',border:'1px solid #16a34a',color:'#16a34a',fontWeight:700,padding:'6px 14px',borderRadius:'6px',display:'inline-flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'13px'}}>⬇️ নমুনা CSV ডাউনলোড</button>
    <label className="mini btn-upload" style={{background:'#16a34a',color:'#fff',fontWeight:700,padding:'6px 14px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'13px',boxShadow:'0 2px 4px rgba(22,163,74,0.3)'}}>⬆️ শিক্ষার্থী CSV আপলোড<input type="file" accept=".csv,text/csv" hidden onChange={importStudents} disabled={importing}/></label>
   </div>
  </div>
  
  {view==='voter' && (
    <VoterListPanel onBack={()=>setView('list')} />
  )}
  
  {view==='csv' && (
   <div className="form-card full-form-v90" style={{maxWidth:'950px',margin:'0 auto'}}>
    <div className="toolbar" style={{borderBottom:'1px solid #e2e8f0',paddingBottom:'16px',marginBottom:'20px'}}>
     <div>
      <span className="eyebrow" style={{color:'#16a34a',fontWeight:700}}>BULK IMPORT & EXPORT</span>
      <h2 style={{fontSize:'22px',margin:'4px 0'}}>শিক্ষার্থী CSV আপলোড ও ব্যাকআপ</h2>
      <p style={{color:'#64748b',fontSize:'14px',margin:0}}>এক্সেল বা সিএসভি ফাইলের মাধ্যমে একসাথে শত শত শিক্ষার্থীর তথ্য সহজে আপলোড করুন।</p>
     </div>
     <button className="mini" type="button" onClick={()=>setView('list')}>📋 তালিকায় ফিরুন</button>
    </div>

    {msg && <p className="msg" style={{marginBottom:'20px',padding:'12px 16px',borderRadius:'8px',background:msg.includes('ব্যর্থ')||msg.includes('ভুল')?'#fef2f2':'#ecfdf5',color:msg.includes('ব্যর্থ')||msg.includes('ভুল')?'#991b1b':'#065f46',border:msg.includes('ব্যর্থ')||msg.includes('ভুল')?'1px solid #fecaca':'1px solid #a7f3d0',fontWeight:600}}>{msg}</p>}

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'20px',marginBottom:'28px'}}>
     {/* Step 1: Download Template */}
     <div style={{border:'2px dashed #cbd5e1',borderRadius:'12px',padding:'24px',textAlign:'center',background:'#f8fafc',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div>
       <div style={{fontSize:'36px',marginBottom:'10px'}}>📥</div>
       <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:'#1e293b'}}>ধাপ ১: নমুনা CSV ডাউনলোড করুন</h3>
       <p style={{fontSize:'13px',color:'#64748b',marginBottom:'16px',lineHeight:'1.5'}}>প্রথমে আমাদের স্ট্যান্ডার্ড ফরম্যাটযুক্ত ডেমো ফাইলটি নামিয়ে নিন এবং শিক্ষার্থীদের তথ্য বসিয়ে সেভ করুন।</p>
      </div>
      <button type="button" onClick={downloadStudentTemplate} style={{background:'#0b6b43',color:'#fff',padding:'10px 18px',borderRadius:'8px',fontWeight:700,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 2px 4px rgba(11,107,67,0.2)'}}>⬇️ Template CSV ডাউনলোড</button>
     </div>

     {/* Step 2: Upload CSV */}
     <div style={{border:'2px dashed #86efac',borderRadius:'12px',padding:'24px',textAlign:'center',background:'#f0fdf4',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div>
       <div style={{fontSize:'36px',marginBottom:'10px'}}>📤</div>
       <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:'#166534'}}>ধাপ ২: CSV ফাইল আপলোড করুন</h3>
       <p style={{fontSize:'13px',color:'#4b5563',marginBottom:'16px',lineHeight:'1.5'}}>আপনার প্রস্তুতকৃত .csv ফাইলটি এখানে নির্বাচন করুন। সিস্টেম স্বয়ংক্রিয়ভাবে ডাটা ভ্যালিডেট করে যোগ করবে।</p>
      </div>
      <label style={{background:'#16a34a',color:'#fff',padding:'10px 18px',borderRadius:'8px',fontWeight:700,cursor:importing?'not-allowed':'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 2px 4px rgba(22,163,74,0.3)',opacity:importing?0.7:1}}>
       {importing ? '⏳ প্রসেসিং হচ্ছে...' : '⬆️ ফাইল বাছাই ও আপলোড করুন'}
       <input type="file" accept=".csv,text/csv" hidden onChange={importStudents} disabled={importing}/>
      </label>
     </div>

     {/* Step 3: Export Existing */}
     <div style={{border:'2px dashed #93c5fd',borderRadius:'12px',padding:'24px',textAlign:'center',background:'#eff6ff',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div>
       <div style={{fontSize:'36px',marginBottom:'10px'}}>📊</div>
       <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:'#1e40af'}}>ব্যাকআপ: বর্তমান শিক্ষার্থী ডাটা</h3>
       <p style={{fontSize:'13px',color:'#64748b',marginBottom:'16px',lineHeight:'1.5'}}>সিস্টেমে বর্তমানে থাকা মোট ({studentList.length}) জন শিক্ষার্থীর সম্পূর্ণ তালিকা CSV ফরম্যাটে ডাউনলোড করুন।</p>
      </div>
      <button type="button" onClick={exportStudents} style={{background:'#2563eb',color:'#fff',padding:'10px 18px',borderRadius:'8px',fontWeight:700,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 2px 4px rgba(37,99,235,0.2)'}}>📋 সকল শিক্ষার্থী CSV রিপোর্ট</button>
     </div>
    </div>

    {/* Column guidelines table */}
    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'20px'}}>
     <h4 style={{fontSize:'15px',fontWeight:700,marginBottom:'12px',color:'#0f172a'}}>📌 CSV ফাইলের কলাম নির্দেশিকা:</h4>
     <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
       <thead>
        <tr style={{background:'#f1f5f9',textAlign:'left'}}>
         <th style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>কলামের নাম (CSV Header)</th>
         <th style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>বাংলা বিকল্প</th>
         <th style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>বাধ্যতামূলক?</th>
         <th style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>নমুনা মান / বিবরণ</th>
        </tr>
       </thead>
       <tbody>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>name_bn</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>নাম, Name</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#dc2626',fontWeight:700}}>হ্যাঁ (আবশ্যক)</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>আহনাফ সিদ্দিক</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>class_name</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>শ্রেণি, Class</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#16a34a'}}>ঐচ্ছিক (ডিফল্ট: 6)</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>6, 7, 8, 9, 10</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>roll_no</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>রোল, Roll</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#64748b'}}>ঐচ্ছিক</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>01, 02, ...</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>section</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>শাখা, Section</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#64748b'}}>ঐচ্ছিক</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>A, B, পদ্মা, মেঘনা</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>gender</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>লিঙ্গ, Gender</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#64748b'}}>ঐচ্ছিক</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>পুরুষ / নারী</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>father_name</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>পিতার নাম</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#64748b'}}>ঐচ্ছিক</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>মোঃ রফিকুল ইসলাম</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>guardian_phone</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>মোবাইল, ফোন</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#64748b'}}>ঐচ্ছিক</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>01711000000</td>
        </tr>
        <tr>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',fontFamily:'monospace',color:'#0284c7'}}>current_village</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>গ্রাম, Village</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0',color:'#64748b'}}>ঐচ্ছিক</td>
         <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>মগড়া</td>
        </tr>
       </tbody>
      </table>
     </div>
    </div>
   </div>
  )}

  {view==='form' && (
   <div className="form-card full-form-v90">
    <div className="toolbar">
     <div>
      <span className="eyebrow">STUDENT PROFILE • V91</span>
      <h2>{editing?'শিক্ষার্থী তথ্য সম্পাদনা':'নতুন শিক্ষার্থী এন্ট্রি'}</h2>
     </div>
     <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
      <button className="mini" type="button" onClick={()=>{setEditing(null);setForm({...emptyStudent,extended_profile:{education:[]}});setView('list');}}>📋 তালিকায় ফিরুন</button>
      <button className="mini" type="button" onClick={downloadStudentTemplate}>⬇ Template CSV</button>
      <label className="mini btn-upload" style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px'}}>⬆ শিক্ষার্থী CSV আপলোড<input type="file" accept=".csv,text/csv" hidden onChange={importStudents} disabled={importing}/></label>
      <span>ধাপ {step+1}/5</span>
     </div>
    </div>
    <div className="wizard-steps">
     {['প্রাথমিক','পিতা-মাতা','ঠিকানা','অভিভাবক','ভর্তি ও শিক্ষা'].map((st,idx)=><button key={st} type="button" className={'wizard-step '+(step===idx?'active':step>idx?'completed':'')} onClick={()=>setStep(idx)}>{idx+1}. {st}</button>)}
    </div>
    <form onSubmit={save} className="form-grid">
     {step===0&&<>
       <div className="form-section-title full"><b>ব্যক্তিগত ও পরিচিতি</b></div>
       <div className="field full" style={{background:'#f0fdf4',border:'1.5px dashed #16a34a',borderRadius:'10px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap',marginBottom:'12px'}}>
         <div style={{position:'relative',width:'84px',height:'96px',flexShrink:0}}>
           <img
             src={form.photo_url || getStudentPhoto(form)}
             alt="শিক্ষার্থীর ছবি"
             style={{width:'84px',height:'96px',borderRadius:'8px',objectFit:'cover',border:'2px solid #16a34a',display:'block',boxShadow:'0 3px 10px rgba(0,0,0,0.12)',background:'#fff'}}
             onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=PHOTO_STUDENT_MALE_1;}}
           />
         </div>
         <div style={{flex:1,minWidth:'220px'}}>
           <label style={{fontSize:'14px',fontWeight:700,color:'#0f172a',marginBottom:'4px',display:'block'}}>
             📷 শিক্ষার্থীর ছবি (Student Photo)
           </label>
           <p style={{fontSize:'12.5px',color:'#475569',margin:'0 0 10px 0'}}>
             {form.photo_url ? '✓ কাস্টম পাসপোর্ট ছবি সংযুক্ত রয়েছে। পরিবর্তন করতে নিচের বাটনে চাপুন।' : 'বর্তমানে সিস্টেম ডিফল্ট ছবি সক্রিয় রয়েছে। শিক্ষার্থীর নিজস্ব ছবি আপলোড করতে নিচের বাটনে চাপুন।'}
           </p>
           <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
             <label className="btn mini" style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',background:'#16a34a',color:'#fff',fontWeight:700,padding:'7px 16px',borderRadius:'6px',boxShadow:'0 2px 4px rgba(22,163,74,0.3)'}}>
               📁 ছবি বাছাই ও আপলোড করুন
               <input type="file" accept="image/*" hidden onChange={file}/>
             </label>
             {editing && form.photo_url && (
               <button
                 type="button"
                 className="btn mini"
                 onClick={async () => {
                   try {
                     setMsg('ছবি সংরক্ষণ হচ্ছে...');
                     saveStudentCustomPhoto(form, form.photo_url);
                     await api('/students/' + editing, {
                       method: 'PUT',
                       body: JSON.stringify({ ...form, photo_url: form.photo_url, photo: form.photo_url })
                     });
                     setMsg('✓ ' + (form.name_bn || 'শিক্ষার্থী') + '-এর ছবি সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!');
                     load();
                   } catch (err) {
                     setMsg(err.message || 'ছবি সংরক্ষণ ব্যর্থ হয়েছে');
                   }
                 }}
                 style={{background:'#0284c7',color:'#fff',fontWeight:700,padding:'7px 16px',borderRadius:'6px',boxShadow:'0 2px 4px rgba(2,132,199,0.3)',cursor:'pointer'}}
               >
                 💾 ছবি অবিলম্বে সেভ করুন
               </button>
             )}
             {form.photo_url && (
               <button
                 type="button"
                 className="mini"
                 onClick={()=>{ change('photo_url',''); change('photo',''); setMsg('ছবি সরানো হয়েছে'); }}
                 style={{background:'#fff1f2',border:'1px solid #fecdd3',color:'#e11d48',fontWeight:600,padding:'6px 12px',borderRadius:'6px',cursor:'pointer'}}
               >
                 🗑️ ছবি বাতিল
               </button>
             )}
           </div>
         </div>
       </div>
       <div className="field"><label>Student ID *</label><input value={form.student_id} onChange={e=>change('student_id',e.target.value)} required disabled={!!editing}/></div>
       <div className="field"><label>নাম (বাংলা) *</label><input value={form.name_bn} onChange={e=>change('name_bn',e.target.value)} required/></div>
       <div className="field"><label>নাম (ইংরেজি)</label><input value={form.name_en} onChange={e=>change('name_en',e.target.value)}/></div>
       <div className="field"><label>শ্রেণি *</label><select value={form.class_name} onChange={e=>change('class_name',e.target.value)}>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select></div>
       <div className="field"><label>বিভাগ {['9','10','৯','১০'].includes(String(form.class_name).trim())?'* (৯ম/১০ম শ্রেণির জন্য)':'(৯ম ও ১০ম শ্রেণির জন্য)'}</label><select value={form.group_name||form.group||''} onChange={e=>{change('group_name',e.target.value);change('group',e.target.value)}} style={{borderColor:['9','10','৯','১০'].includes(String(form.class_name).trim())?'#16a34a':undefined,fontWeight:['9','10','৯','১০'].includes(String(form.class_name).trim())?600:'normal'}}><option value="">{['9','10','৯','১০'].includes(String(form.class_name).trim())?'বিভাগ নির্বাচন করুন *':'প্রযোজ্য নয় / সাধারণ (৬ষ্ঠ-৮ম)'}</option><option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option><option value="মানবিক বিভাগ">মানবিক বিভাগ</option><option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option></select></div>
       <div className="field"><label>রোল নম্বর</label><input type="number" value={form.roll_no} onChange={e=>change('roll_no',e.target.value)}/></div>
       <div className="field"><label> শাখা</label><input value={form.section} onChange={e=>change('section',e.target.value)}/></div>
       <div className="field"><label>জন্ম তারিখ</label><input type="date" value={form.date_of_birth} onChange={e=>change('date_of_birth',e.target.value)}/></div>
       <div className="field"><label>লিঙ্গ</label><select value={form.gender} onChange={e=>change('gender',e.target.value)}><option value="">নির্বাচন করুন</option><option>পুরুষ</option><option>নারী</option><option>অন্যান্য</option></select></div>
       <div className="field"><label>রক্তের গ্রুপ</label><input value={form.blood_group} onChange={e=>change('blood_group',e.target.value)}/></div>
       <div className="field"><label>ধর্ম</label><select value={form.religion||'ইসলাম'} onChange={e=>change('religion',e.target.value)}><option value="ইসলাম">ইসলাম</option><option value="হিন্দু">হিন্দু</option><option value="বৌদ্ধ">বৌদ্ধ</option><option value="খ্রিষ্টান">খ্রিষ্টান</option><option value="অন্যান্য">অন্যান্য</option></select></div>
       <div className="field"><label>জন্ম নিবন্ধন নম্বর</label><input value={form.birth_registration_no} onChange={e=>change('birth_registration_no',e.target.value)}/></div>
       <div className="field">
         <label>বিশেষ চাহিদাসম্পন্ন কিনা</label>
         <select
           value={form.is_special_needs || 'না'}
           onChange={e=>{
             const val=e.target.value;
             change('is_special_needs',val);
             if(val!=='হ্যাঁ'){
               change('disability_type','');
               change('special_needs','');
             }
           }}
           style={{borderColor: form.is_special_needs === 'হ্যাঁ' ? '#0284c7' : undefined, fontWeight: form.is_special_needs === 'হ্যাঁ' ? 600 : 'normal'}}
         >
           <option value="না">না</option>
           <option value="হ্যাঁ">হ্যাঁ</option>
         </select>
       </div>
       <div className="field">
         <label>প্রতিবন্ধিতার ধরন {form.is_special_needs === 'হ্যাঁ' ? <span style={{color:'#dc2626'}}>* (আবশ্যক)</span> : <span style={{color:'#94a3b8',fontSize:'11px'}}>(হ্যাঁ হলে প্রযোজ্য)</span>}</label>
         <select
           value={form.disability_type || ''}
           onChange={e=>{
             const val=e.target.value;
             change('disability_type',val);
             change('special_needs',val);
           }}
           disabled={form.is_special_needs !== 'হ্যাঁ'}
           required={form.is_special_needs === 'হ্যাঁ'}
           style={{
             borderColor: form.is_special_needs === 'হ্যাঁ' ? (!form.disability_type ? '#f59e0b' : '#16a34a') : undefined,
             backgroundColor: form.is_special_needs === 'হ্যাঁ' ? '#f0f9ff' : '#f8fafc',
             color: form.is_special_needs === 'হ্যাঁ' ? '#0f172a' : '#94a3b8',
             cursor: form.is_special_needs === 'হ্যাঁ' ? 'pointer' : 'not-allowed'
           }}
         >
           <option value="">{form.is_special_needs === 'হ্যাঁ' ? 'প্রতিবন্ধিতার ধরন নির্বাচন করুন *' : 'প্রযোজ্য নয় (না নির্বাচিত)'}</option>
           {DISABILITY_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
         </select>
       </div>
     </>}
     {step===1&&<>
        <div className="form-section-title full"><b>পিতা ও মাতার বিবরণ</b></div>
        <div className="field"><label>পিতার নাম (বাংলা)</label><input value={form.father_name||''} onChange={e=>change('father_name',e.target.value)}/></div>
        <div className="field"><label>পিতার নাম (ইংরেজি)</label><input value={form.father_name_en||''} onChange={e=>change('father_name_en',e.target.value)}/></div>
        <div className="field"><label>পিতার NID</label><input value={form.father_nid_no||''} onChange={e=>change('father_nid_no',e.target.value)}/></div>
        <div className="field">
          <label>পিতার পেশা</label>
          <select value={form.father_profession||''} onChange={e=>change('father_profession',e.target.value)}>
            <option value="">পিতার পেশা নির্বাচন করুন</option>
            {FATHER_PROFESSIONS.map(p=><option key={p} value={p}>{p}</option>)}
            {form.father_profession && !FATHER_PROFESSIONS.includes(form.father_profession) && (
              <option value={form.father_profession}>{form.father_profession}</option>
            )}
          </select>
        </div>
        <div className="field"><label>পিতার মোবাইল</label><input value={form.father_mobile||''} onChange={e=>change('father_mobile',e.target.value)}/></div>
        <div className="field"><label>প্রবাসের দেশ (প্রযোজ্য ক্ষেত্রে)</label><input value={form.father_abroad_country||''} onChange={e=>change('father_abroad_country',e.target.value)}/></div>
        <div className="field"><label>মাতার নাম (বাংলা)</label><input value={form.mother_name||''} onChange={e=>change('mother_name',e.target.value)}/></div>
        <div className="field"><label>মাতার নাম (ইংরেজি)</label><input value={form.mother_name_en||''} onChange={e=>change('mother_name_en',e.target.value)}/></div>
        <div className="field"><label>মাতার NID</label><input value={form.mother_nid_no||''} onChange={e=>change('mother_nid_no',e.target.value)}/></div>
        <div className="field">
          <label>মাতার পেশা</label>
          <select value={form.mother_profession||''} onChange={e=>change('mother_profession',e.target.value)}>
            <option value="">মাতার পেশা নির্বাচন করুন</option>
            {MOTHER_PROFESSIONS.map(p=><option key={p} value={p}>{p}</option>)}
            {form.mother_profession && !MOTHER_PROFESSIONS.includes(form.mother_profession) && (
              <option value={form.mother_profession}>{form.mother_profession}</option>
            )}
          </select>
        </div>
        <div className="field"><label>মাতার মোবাইল</label><input value={form.mother_mobile||''} onChange={e=>change('mother_mobile',e.target.value)}/></div>
        <div className="field"><label>মাতার মৃত্যুর সন (যদি প্রযোজ্য)</label><input value={form.mother_death_year||''} onChange={e=>change('mother_death_year',e.target.value)}/></div>
      </>}
     {step===2&&<><div className="form-section-title full"><b>বর্তমান ঠিকানা</b></div>{[['current_village','গ্রাম/মহল্লা'],['current_post_office','ডাকঘর'],['current_upazila','উপজেলা'],['current_district','জেলা']].map(([k,l])=><div className="field" key={k}><label>{l}</label><input value={form[k]||''} onChange={e=>change(k,e.target.value)}/></div>)}<div className="form-section-title full"><b>স্থায়ী ঠিকানা</b></div><div className="field full" style={{background:'#f0fdf4',border:'1.5px solid #86efac',padding:'10px 14px',borderRadius:'8px',margin:'4px 0 10px'}}><label style={{cursor:'pointer',fontSize:'14px',fontWeight:700,display:'inline-flex',alignItems:'center',gap:'10px',color:'#166534',margin:0}}><input type="checkbox" style={{width:'18px',height:'18px',accentColor:'#16a34a',cursor:'pointer'}} checked={sameAddress} onChange={handleSameAddress}/> ☑️ বর্তমান ঠিকানা ও স্থায়ী ঠিকানা একই (স্বয়ংক্রিয় পূরণ)</label></div>{[['permanent_village','গ্রাম/মহল্লা'],['permanent_post_office','ডাকঘর'],['permanent_upazila','উপজেলা'],['permanent_district','জেলা']].map(([k,l])=><div className="field" key={k}><label>{l}</label><input value={form[k]||''} onChange={e=>change(k,e.target.value)}/></div>)}<div className="field full"><label>সম্পূর্ণ ঠিকানা বিবরণ</label><textarea rows="2" value={form.address} onChange={e=>change('address',e.target.value)}/></div></>}
     {step===3&&<><div className="form-section-title full"><b>অভিভাবকের তথ্য (পিতা-মাতা উভয়ের অনুপস্থিতিতে প্রযোজ্য)</b></div><div className="field"><label>অভিভাবকের নাম (বাংলা)</label><input value={form.guardian_name} onChange={e=>change('guardian_name',e.target.value)}/></div><div className="field"><label>অভিভাবকের নাম (ইংরেজি)</label><input value={form.guardian_name_en} onChange={e=>change('guardian_name_en',e.target.value)}/></div><div className="field"><label>সম্পর্ক</label><input value={form.guardian_relation} onChange={e=>change('guardian_relation',e.target.value)}/></div><div className="field"><label>অভিভাবকের মোবাইল</label><input value={form.guardian_phone} onChange={e=>change('guardian_phone',e.target.value)}/></div><div className="field"><label>অভিভাবকের NID</label><input value={form.guardian_nid_no} onChange={e=>change('guardian_nid_no',e.target.value)}/></div><div className="field"><label>অভিভাবকের ইমেইল</label><input value={form.guardian_email} onChange={e=>change('guardian_email',e.target.value)}/></div></>}
     {step===4&&<><div className="form-section-title full"><b>ভর্তি ও অতিরিক্ত তথ্য</b></div><div className="field"><label>ভর্তির শ্রেণি</label><select value={form.admission_class} onChange={e=>change('admission_class',e.target.value)}>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select></div><div className="field"><label>ভর্তির বিভাগ {['9','10','৯','১০'].includes(String(form.admission_class).trim())?'* (৯ম/১০ম শ্রেণির জন্য)':'(৯ম ও ১০ম শ্রেণির জন্য)'}</label><select value={form.admission_group||''} onChange={e=>change('admission_group',e.target.value)} style={{borderColor:['9','10','৯','১০'].includes(String(form.admission_class).trim())?'#16a34a':undefined,fontWeight:['9','10','৯','১০'].includes(String(form.admission_class).trim())?600:'normal'}}><option value="">{['9','10','৯','১০'].includes(String(form.admission_class).trim())?'বিভাগ নির্বাচন করুন *':'প্রযোজ্য নয় / সাধারণ (৬ষ্ঠ-৮ম)'}</option><option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option><option value="মানবিক বিভাগ">মানবিক বিভাগ</option><option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option></select></div><div className="field"><label>ভর্তির তারিখ</label><input type="date" value={form.admission_date} onChange={e=>change('admission_date',e.target.value)}/></div><div className="field"><label>জরুরি মোবাইল</label><input value={form.emergency_phone} onChange={e=>change('emergency_phone',e.target.value)}/></div><div className="field"><label>বিশেষ চাহিদা/মন্তব্য</label><input value={form.special_needs} onChange={e=>change('special_needs',e.target.value)}/></div><div className="field"><label>অবস্থা</label><select value={form.status} onChange={e=>change('status',e.target.value)}><option value="active">সক্রিয়</option><option value="inactive">নিষ্ক্রিয়</option><option value="graduated">উত্তীর্ণ</option><option value="transferred">স্থানান্তরিত</option><option value="dropped_out">ঝরে পড়া</option></select></div><div className="field"><label>ছবি আপলোড</label><input type="file" accept="image/*" onChange={file}/><small>JPG/PNG/WebP, সর্বোচ্চ 5MB</small></div><div className="field full"><label>অতিরিক্ত নোট</label><textarea rows="3" value={form.additional_notes} onChange={e=>change('additional_notes',e.target.value)}/></div><div className="form-section-title full"><b>শিক্ষাগত যোগ্যতার ইতিহাস</b><button type="button" className="mini" onClick={addEdu}>+ নতুন রেকর্ড</button></div>{(form.extended_profile?.education||[]).map((r,i)=><div className="repeat-card full" key={i}><input placeholder="পরীক্ষার নাম" value={r.exam} onChange={e=>updateEdu(i,'exam',e.target.value)}/><input placeholder="প্রতিষ্ঠান" value={r.institution} onChange={e=>updateEdu(i,'institution',e.target.value)}/><input placeholder="বোর্ড/বিশ্ববিদ্যালয়" value={r.board} onChange={e=>updateEdu(i,'board',e.target.value)}/><input placeholder="পাশের সন" value={r.year} onChange={e=>updateEdu(i,'year',e.target.value)}/><input placeholder="ফলাফল" value={r.result} onChange={e=>updateEdu(i,'result',e.target.value)}/><input placeholder="বিষয়" value={r.subject} onChange={e=>updateEdu(i,'subject',e.target.value)}/><button type="button" className="mini" onClick={()=>removeEdu(i)}>মুছুন</button></div>)}{form.photo_url&&<img className="form-photo-preview full" src={form.photo_url} alt="শিক্ষার্থীর ছবি"/>}</>}
     {step===4&&<CustomFields formKey="student" form={form} setForm={setForm}/>}
     <div className="form-actions full">
      <button type="button" className="mini" onClick={()=>setForm({...emptyStudent,extended_profile:{education:[]}})}>↺ ফর্ম রিসেট</button>
      {step>0&&<button type="button" className="mini" onClick={()=>setStep(step-1)}>← পূর্ববর্তী</button>}
      {step<4 && <button type="button" className="btn" onClick={()=>{
        if(step===0 && form.is_special_needs==='হ্যাঁ' && !form.disability_type){
          setMsg('অনুগ্রহ করে বিশেষ চাহিদাসম্পন্ন শিক্ষার্থীর প্রতিবন্ধিতার ধরন নির্বাচন করুন');
          return;
        }
        setMsg('');
        setStep(step+1);
      }}>পরবর্তী ধাপ →</button>}
      <button type="submit" className="btn" style={{background:editing?'#0284c7':'#16a34a',fontWeight:700}}>
        ✓ {editing?'তথ্য আপডেট করুন':'শিক্ষার্থী সংরক্ষণ করুন'}
      </button>
     </div>
    </form>
    {msg&&<p className="msg" role="status">{msg}</p>}
   </div>
  )}
  {view==='list' && (
   <div className="table-card">
    <div className="toolbar">
     <div>
      <span className="eyebrow">STUDENT DIRECTORY • V91</span>
      <h2>শিক্ষার্থী তালিকা</h2>
     </div>
     <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
      <button className="mini" type="button" onClick={()=>printStudentReport()} style={{background:'#0b6b43',color:'#fff',fontWeight:700,border:'none',padding:'7px 14px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(11,107,67,0.25)'}}>
        🖨️ প্রিন্ট / PDF রিপোর্ট
      </button>
      <button className="mini" type="button" onClick={()=>handleOpenIdCard()} style={{background:'#047857',color:'#fff',fontWeight:700,border:'none',padding:'7px 14px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(4,120,87,0.25)'}}>
        🪪 আইডি কার্ড স্টুডিও (একক ও বাল্ক)
      </button>
      <button className="mini" type="button" onClick={()=>handleOpenCert('', 'testimonial')} style={{background:'#1d4ed8',color:'#fff',fontWeight:700,border:'none',padding:'7px 14px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(29,78,216,0.25)'}}>
        📜 প্রশংসাপত্র, ছাড়পত্র ও প্রত্যয়ন
      </button>
      <button className="mini" type="button" onClick={()=>setShowTotListModal(true)} style={{background:'#f0f9ff',border:'1.5px solid #0284c7',color:'#0284c7',fontWeight:700,padding:'7px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(2,132,199,0.15)'}}>
        📑 শ্রেণি ভিত্তিক টট লিস্ট
      </button>
      <button className="mini" type="button" onClick={()=>setShowDisabilityQueryModal(true)} style={{background:'#fef3c7',border:'1.5px solid #d97706',color:'#b45309',fontWeight:700,padding:'7px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(217,119,6,0.15)'}}>
        ♿ প্রতিবন্ধিতা কুয়েরি ও রিপোর্ট
      </button>
      <button className="mini" type="button" onClick={()=>setShowProfessionQueryModal(true)} style={{background:'#eff6ff',border:'1.5px solid #2563eb',color:'#1d4ed8',fontWeight:700,padding:'7px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(37,99,235,0.15)'}}>
        💼 অভিভাবকের পেশা কুয়েরি ও রিপোর্ট
      </button>
      <button className="mini" type="button" onClick={()=>setView('voter')} style={{background:'#fdf4ff',border:'1.5px solid #c026d3',color:'#c026d3',fontWeight:700,padding:'7px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 4px rgba(192,38,211,0.15)'}}>
        🗳️ ভোটার তালিকা
      </button>
      {selectedIds.length > 0 && (
        <button className="mini" type="button" onClick={deleteSelected} style={{background:'#dc2626',color:'#fff',border:'none',fontWeight:700,cursor:'pointer',padding:'6px 14px',borderRadius:'6px',boxShadow:'0 2px 4px rgba(220,38,38,0.2)'}}>
          🗑️ নির্বাচিত ({selectedIds.length}) মুছুন
        </button>
      )}
      {studentList.length > 0 && (
        <button className="mini" type="button" onClick={clearAllStudents} style={{background:'#fff1f2',color:'#be123c',border:'1px solid #fecdd3',fontWeight:600,cursor:'pointer',padding:'6px 12px',borderRadius:'6px'}}>
          ⚠️ সব মুছুন / রিসেট
        </button>
      )}
      <button className="btn mini" type="button" onClick={()=>{setEditing(null);setSameAddress(false);setForm({...emptyStudent,extended_profile:{education:[]}});setStep(0);setView('form');}}>➕ নতুন শিক্ষার্থী এন্ট্রি</button>
      <button className="mini" type="button" onClick={downloadStudentTemplate}>⬇ Template CSV</button>
      <label className="mini btn-upload" style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px'}}>⬆ CSV আপলোড<input type="file" accept=".csv,text/csv" hidden onChange={importStudents} disabled={importing}/></label>
      <span style={{fontWeight:700,color:'#0f172a',background:'#f1f5f9',padding:'4px 10px',borderRadius:'6px'}}>{studentList.length} জন</span>
     </div>
    </div>
    <div className="filters" style={{display:'flex',flexWrap:'wrap',gap:'8px',alignItems:'center',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',marginBottom:'16px'}}>
     <input placeholder="🔍 নাম / ID / অভিভাবক / মোবাইল খুঁজুন" style={{minWidth:'220px',flex:1}} value={q} onChange={e=>setQ(e.target.value)}/>
     <select value={className} onChange={e=>setClassName(e.target.value)} style={{fontWeight:600}}>
      <option value="">🏫 সব শ্রেণি</option>
      {classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}
     </select>
     <select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)} style={{fontWeight:600,color:groupFilter?'#0284c7':undefined}}>
      <option value="">📚 সব বিভাগ / গ্রুপ</option>
      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
      <option value="মানবিক">মানবিক বিভাগ</option>
      <option value="ব্যবসায়">ব্যবসায় শিক্ষা শাখা</option>
     </select>
     <input placeholder="শাখা (Section)" style={{maxWidth:'110px'}} value={section} onChange={e=>setSection(e.target.value)}/>
     <select value={religionFilter} onChange={e=>setReligionFilter(e.target.value)} style={{fontWeight:600,color:religionFilter?'#059669':undefined}}>
      <option value="">☪️ 🕉️ সব ধর্ম</option>
      <option value="ইসলাম">ইসলাম</option>
      <option value="হিন্দু">হিন্দু</option>
      <option value="বৌদ্ধ">বৌদ্ধ</option>
      <option value="খ্রিষ্টান">খ্রিষ্টান</option>
      <option value="অন্যান্য">অন্যান্য</option>
     </select>
     <select value={genderFilter} onChange={e=>setGenderFilter(e.target.value)} style={{fontWeight:600}}>
      <option value="">👥 সব জেন্ডার</option>
      <option value="male">ছাত্র (পুরুষ)</option>
      <option value="female">ছাত্রী (নারী)</option>
     </select>
     <select value={status} onChange={e=>setStatus(e.target.value)} style={{fontWeight:600,color:status==='active'?'#16a34a':status==='inactive'?'#dc2626':undefined}}>
      <option value="">সব অবস্থা</option>
      <option value="active">সক্রিয়</option>
      <option value="inactive">নিষ্ক্রিয়</option>
      <option value="graduated">উত্তীর্ণ</option>
      <option value="transferred">স্থানান্তরিত</option>
      <option value="dropped_out">ঝরে পড়া</option>
     </select>
     <select value={ageFilter} onChange={e=>setAgeFilter(e.target.value)} style={{fontWeight:600,color:ageFilter?'#7c3aed':undefined}}>
        <option value="">🎂 সব বয়স</option>
        <option value="under_11">১১ বছরের নীচে (&lt;১১)</option>
        <option value="range_11_12">১১-১২ বছর</option>
        <option value="range_12_13">১২-১৩ বছর</option>
        <option value="range_13_14">১৩-১৪ বছর</option>
        <option value="range_14_15">১৪-১৫ বছর</option>
        <option value="range_15_16">১৫-১৬ বছর</option>
        <option value="range_16_17">১৬-১৭ বছর</option>
        <option value="range_17_18">১৭-১৮ বছর</option>
        <option value="above_18">১৮ বছরের উপরে (১৮+)</option>
       </select>
     <select value={disabilityFilter} onChange={e=>setDisabilityFilter(e.target.value)} style={{fontWeight:600,color:disabilityFilter?'#d97706':undefined,borderColor:disabilityFilter?'#d97706':undefined,backgroundColor:disabilityFilter?'#fffbeb':undefined}}>
        <option value="">♿ সব প্রতিবন্ধিতা</option>
        <option value="special_only">♿ সকল বিশেষ চাহিদা</option>
        <option value="অটিস্টিক">অটিস্টিক</option>
        <option value="শারীরিক প্রতিবন্ধিতা">শারীরিক প্রতিবন্ধিতা</option>
        <option value="মানসিক অসুস্থতাজনিত প্রতিবন্ধিতা">মানসিক অসুস্থতাজনিত প্রতিবন্ধিতা</option>
        <option value="দৃষ্টি প্রতিবন্ধিতা">দৃষ্টি প্রতিবন্ধিতা</option>
        <option value="বাক প্রতিবন্ধিতা">বাক প্রতিবন্ধিতা</option>
        <option value="বুদ্ধি প্রতিবন্ধিতা">বুদ্ধি প্রতিবন্ধিতা</option>
        <option value="শ্রবণ প্রতিবন্ধিতা">শ্রবণ প্রতিবন্ধিতা</option>
        <option value="শ্রবণ-দৃষ্টি প্রতিবন্ধিতা">শ্রবণ-দৃষ্টি প্রতিবন্ধিতা</option>
        <option value="ডাউন সিন্ড্রোম">ডাউন সিন্ড্রোম</option>
        <option value="অন্যান্য">অন্যান্য</option>
       </select>
      <select value={professionFilter} onChange={e=>setProfessionFilter(e.target.value)} style={{fontWeight:600,color:professionFilter?'#1d4ed8':undefined,borderColor:professionFilter?'#2563eb':undefined,backgroundColor:professionFilter?'#eff6ff':undefined}}>
         <option value="">💼 সব অভিভাবক পেশা</option>
         {ALL_PROFESSIONS_LIST.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
     {customFields.filter(f=>f.enabled&&!f.is_system).length>0&&<select value={customFieldKey} onChange={e=>setCustomFieldKey(e.target.value)}><option value="">Custom field</option>{customFields.filter(f=>f.enabled&&!f.is_system).map(f=><option key={f.id} value={f.field_key}>{f.label_bn}</option>)}</select>}
     {customFieldKey&&<input placeholder="Custom value" value={customFieldValue} onChange={e=>setCustomFieldValue(e.target.value)}/>}
     <button type="button" className="mini" onClick={()=>printStudentReport()} style={{background:'#16a34a',color:'#fff',fontWeight:700,border:'none',padding:'6px 12px',borderRadius:'6px',cursor:'pointer'}}>🖨️ প্রিন্ট / PDF</button>
     <button type="button" className="mini" onClick={exportStudents} style={{background:'#2563eb',color:'#fff',fontWeight:700,border:'none',padding:'6px 12px',borderRadius:'6px',cursor:'pointer'}}>📊 CSV রিপোর্ট</button>
     <button type="button" className="mini" onClick={()=>setShowTotListModal(true)} style={{background:'#0284c7',color:'#fff',fontWeight:700,border:'none',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'5px',boxShadow:'0 2px 4px rgba(2,132,199,0.2)'}}>📑 শ্রেণি ভিত্তিক টট লিস্ট</button>
     <button type="button" className="mini" onClick={()=>setShowDisabilityQueryModal(true)} style={{background:'#d97706',color:'#fff',fontWeight:700,border:'none',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'5px',boxShadow:'0 2px 4px rgba(217,119,6,0.2)'}}>♿ প্রতিবন্ধিতা কুয়েরি</button>
      <button type="button" className="mini" onClick={()=>setShowProfessionQueryModal(true)} style={{background:'#2563eb',color:'#fff',fontWeight:700,border:'none',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'5px',boxShadow:'0 2px 4px rgba(37,99,235,0.2)'}}>💼 পেশা কুয়েরি</button>
     <button type="button" className="mini" onClick={()=>setView('voter')} style={{background:'#c026d3',color:'#fff',fontWeight:700,border:'none',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'5px',boxShadow:'0 2px 4px rgba(192,38,211,0.2)'}}>🗳️ ভোটার তালিকা</button>
    </div>
    <div className="table-wrap">
     <table>
      <thead>
       <tr style={{whiteSpace:'nowrap'}}>
        <th style={{width:'36px',textAlign:'center'}}><input type="checkbox" style={{cursor:'pointer'}} checked={studentList.length>0 && selectedIds.length===studentList.length} onChange={toggleSelectAll}/></th>
        <th style={{width:'50px',textAlign:'center'}}>{lang==='en'?'Photo':'ছবি'}</th>
        <th style={{whiteSpace:'nowrap'}}>{lang==='en'?'Student ID':'আইডি (ID)'}</th>
        <th style={{whiteSpace:'nowrap'}}>{lang==='en'?'Student Name':'শিক্ষার্থীর নাম'}</th>
        <th style={{whiteSpace:'nowrap'}}>{lang==='en'?'Class':'শ্রেণি'}</th>
        <th style={{color:'#0284c7',whiteSpace:'nowrap'}}>{lang==='en'?'Department / Group':'বিভাগ'}</th>
        <th style={{textAlign:'center',whiteSpace:'nowrap'}}>{lang==='en'?'Roll':'রোল'}</th>
        <th style={{textAlign:'center',whiteSpace:'nowrap'}}>{lang==='en'?'Religion':'ধর্ম'}</th>
        <th style={{whiteSpace:'nowrap'}}>{lang==='en'?'Guardian':'অভিভাবক'}</th>
        <th style={{whiteSpace:'nowrap'}}>{lang==='en'?'Mobile':'মোবাইল'}</th>
        <th style={{textAlign:'center',whiteSpace:'nowrap'}}>{lang==='en'?'Status':'অবস্থা'}</th>
        <th style={{textAlign:'center',width:'80px',whiteSpace:'nowrap'}}>{lang==='en'?'Actions':'অ্যাকশন'}</th>
       </tr>
      </thead>
      <tbody>
       {studentList.map(s=>{
         const isEn = lang === 'en';
         const studentName = isEn ? (s.name_en || s.name_bn) : (s.name_bn || s.name_en);
         const studentGuardian = getStudentGuardian(s, lang);
         const studentGroup = formatGroup(s.department || s.group_name || s.group, lang);
         const classDisplay = isEn ? `Class ${s.class_name}` : `শ্রেণি ${s.class_name}`;
         const studentStatus = statusBn(s.status, lang);

         return (
           <tr key={s.id} style={{background:selectedIds.includes(s.id)?'#f0fdf4':undefined,whiteSpace:'nowrap'}}>
            <td style={{textAlign:'center'}}><input type="checkbox" style={{cursor:'pointer'}} checked={selectedIds.includes(s.id)} onChange={()=>toggleSelectOne(s.id)}/></td>
            <td style={{textAlign:'center',padding:'4px 6px'}}>
              <div style={{position:'relative',width:'38px',height:'42px',margin:'0 auto'}}>
                <div style={{width:'38px',height:'42px',borderRadius:'5px',overflow:'hidden',border:'1.5px solid #cbd5e1',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 2px rgba(0,0,0,0.06)'}}>
                  <img
                    src={getStudentPhoto(s)}
                    alt=""
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=PHOTO_STUDENT_MALE_1; }}
                  />
                </div>
                <label
                  title={`${studentName}-এর ছবি সরাসরি আপলোড বা পরিবর্তন করুন`}
                  style={{
                    position:'absolute',
                    bottom:'-3px',
                    right:'-3px',
                    background:'#0284c7',
                    color:'#fff',
                    width:'16px',
                    height:'16px',
                    borderRadius:'4px',
                    display:'grid',
                    placeItems:'center',
                    fontSize:'9px',
                    cursor:'pointer',
                    border:'1.5px solid #fff',
                    boxShadow:'0 1px 3px rgba(0,0,0,0.35)'
                  }}
                  onClick={(e)=>e.stopPropagation()}
                >
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>handleTableStudentPhotoUpload(e, s)}/>
                  📷
                </label>
              </div>
            </td>
            <td style={{whiteSpace:'nowrap'}}><code>{s.student_id}</code></td>
            <td style={{whiteSpace:'nowrap'}}><b>{studentName || '—'}</b></td>
            <td style={{whiteSpace:'nowrap'}}>{classDisplay}</td>
            <td style={{whiteSpace:'nowrap'}}>
              {s.department || s.group_name || s.group ? (
                <span style={{background:'#e0f2fe',color:'#0369a1',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',fontWeight:600}}>
                  {studentGroup}
                </span>
              ) : (
                <span style={{color:'#94a3b8'}}>—</span>
              )}
            </td>
            <td style={{textAlign:'center',whiteSpace:'nowrap'}}>{s.roll_no || '—'}</td>
             <td style={{textAlign:'center',whiteSpace:'nowrap'}}><span style={{background:(s.religion||'ইসলাম')==='হিন্দু'?'#fef3c7':(s.religion||'ইসলাম')==='বৌদ্ধ'?'#f3e8ff':(s.religion||'ইসলাম')==='খ্রিষ্টান'?'#e0e7ff':'#f0fdf4',color:(s.religion||'ইসলাম')==='হিন্দু'?'#b45309':(s.religion||'ইসলাম')==='বৌদ্ধ'?'#7e22ce':(s.religion||'ইসলাম')==='খ্রিষ্টান'?'#4338ca':'#15803d',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',fontWeight:600}}>{s.religion||'ইসলাম'}</span></td>
            <td style={{whiteSpace:'nowrap'}}>{studentGuardian}</td>
            <td style={{whiteSpace:'nowrap'}}>{getStudentPhone(s)}</td>
            <td style={{textAlign:'center',whiteSpace:'nowrap'}}><span style={{color: s.status==='active'?'#16a34a':'#dc2626', fontWeight:600}}>{studentStatus}</span></td>
            <td style={{textAlign:'center',whiteSpace:'nowrap',width:'80px'}}>
             <button
               type="button"
               className="mini"
               onClick={(e)=>toggleActionMenu(e, s)}
               style={{
                 background: actionMenu?.studentId===s.id ? '#047857' : '#ffffff',
                 color: actionMenu?.studentId===s.id ? '#ffffff' : '#334155',
                 border: actionMenu?.studentId===s.id ? '1.5px solid #047857' : '1px solid #cbd5e1',
                 fontWeight: 700,
                 cursor: 'pointer',
                 padding: '4px 8px',
                 borderRadius: '6px',
                 display: 'inline-flex',
                 alignItems: 'center',
                 gap: '4px',
                 boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                 transition: 'all 0.15s ease'
               }}
               title={isEn ? 'Actions & Services' : 'সেবা ও অ্যাকশন'}
             >
               <span style={{fontSize:'16px',lineHeight:1,fontWeight:900}}>⋮</span>
               <span style={{fontSize:'11.5px'}}>{isEn ? 'Actions' : 'সেবা'}</span>
             </button>
            </td>
           </tr>
         );
       })}
       {!studentList.length&&<tr><td colSpan="12" style={{textAlign:'center',padding:'24px',color:'#64748b'}}>{lang==='en'?'No student records found.':'কোনো শিক্ষার্থী পাওয়া যায়নি।'}</td></tr>}
      </tbody>
     </table>
     {actionMenu && (
       <>
         <div
           style={{position:'fixed',inset:0,zIndex:9998}}
           onClick={()=>setActionMenu(null)}
         />
         <div
           style={{
             position: 'fixed',
             top: actionMenu.top,
             left: actionMenu.left,
             zIndex: 9999,
             background: '#ffffff',
             borderRadius: '10px',
             boxShadow: '0 12px 30px -5px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.1)',
             border: '1px solid #cbd5e1',
             minWidth: '195px',
             padding: '6px 0',
             textAlign: 'left'
           }}
           onClick={e=>e.stopPropagation()}
         >
           <button
             type="button"
             onClick={()=>{const s=actionMenu.student; setActionMenu(null); handleOpenProfile(s);}}
             style={{
               width:'100%',
               padding:'8px 14px',
               background:'none',
               border:'none',
               display:'flex',
               alignItems:'center',
               gap:'9px',
               fontSize:'13px',
               fontWeight:600,
               color:'#166534',
               cursor:'pointer',
               textAlign:'left'
             }}
             onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
             onMouseLeave={e=>e.currentTarget.style.background='none'}
           >
             <span style={{fontSize:'15px'}}>👁️</span> {lang==='en'?'Student Profile':'শিক্ষার্থী প্রোফাইল'}
           </button>
           <button
             type="button"
             onClick={()=>{const s=actionMenu.student; setActionMenu(null); handleOpenIdCard(s.id);}}
             style={{
               width:'100%',
               padding:'8px 14px',
               background:'none',
               border:'none',
               display:'flex',
               alignItems:'center',
               gap:'9px',
               fontSize:'13px',
               fontWeight:600,
               color:'#1d4ed8',
               cursor:'pointer',
               textAlign:'left'
             }}
             onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
             onMouseLeave={e=>e.currentTarget.style.background='none'}
           >
             <span style={{fontSize:'15px'}}>🪪</span> {lang==='en'?'ID Card Studio':'পরিচয়পত্র (ID Card)'}
           </button>
           <button
             type="button"
             onClick={()=>{const s=actionMenu.student; setActionMenu(null); handleOpenCert(s.id, 'testimonial');}}
             style={{
               width:'100%',
               padding:'8px 14px',
               background:'none',
               border:'none',
               display:'flex',
               alignItems:'center',
               gap:'9px',
               fontSize:'13px',
               fontWeight:600,
               color:'#b45309',
               cursor:'pointer',
               textAlign:'left'
             }}
             onMouseEnter={e=>e.currentTarget.style.background='#fef3c7'}
             onMouseLeave={e=>e.currentTarget.style.background='none'}
           >
             <span style={{fontSize:'15px'}}>📜</span> {lang==='en'?'Certificates / TC':'প্রশংসাপত্র / সনদ / TC'}
           </button>
           <div style={{borderTop:'1px solid #f1f5f9',margin:'4px 0'}}/>
           <button
             type="button"
             onClick={()=>{const s=actionMenu.student; setActionMenu(null); edit(s);}}
             style={{
               width:'100%',
               padding:'8px 14px',
               background:'none',
               border:'none',
               display:'flex',
               alignItems:'center',
               gap:'9px',
               fontSize:'13px',
               fontWeight:600,
               color:'#0f172a',
               cursor:'pointer',
               textAlign:'left'
             }}
             onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
             onMouseLeave={e=>e.currentTarget.style.background='none'}
           >
             <span style={{fontSize:'15px'}}>✏️</span> {lang==='en'?'Edit Information':'তথ্য সম্পাদনা'}
           </button>
           <button
             type="button"
             onClick={()=>{const s=actionMenu.student; setActionMenu(null); remove(s);}}
             style={{
               width:'100%',
               padding:'8px 14px',
               background:'none',
               border:'none',
               display:'flex',
               alignItems:'center',
               gap:'9px',
               fontSize:'13px',
               fontWeight:600,
               color:'#dc2626',
               cursor:'pointer',
               textAlign:'left'
             }}
             onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'}
             onMouseLeave={e=>e.currentTarget.style.background='none'}
           >
             <span style={{fontSize:'15px'}}>🗑️</span> {lang==='en'?'Delete Record':'শিক্ষার্থী রেকর্ড মুছুন'}
           </button>
         </div>
       </>
     )}
    </div>
   </div>
  )}
   <StudentTotListModal isOpen={showTotListModal} onClose={()=>setShowTotListModal(false)} students={students}/>
   <StudentDisabilityQueryModal isOpen={showDisabilityQueryModal} onClose={()=>setShowDisabilityQueryModal(false)} students={students}/>
   <StudentProfessionQueryModal isOpen={showProfessionQueryModal} onClose={()=>setShowProfessionQueryModal(false)} students={students}/>
   {showIdCardModal && <StudentIdCardModal isOpen={showIdCardModal} onClose={()=>setShowIdCardModal(false)} students={students} initialStudentId={idCardStudentId}/>}
   {showCertModal && <StudentCertificatesModal isOpen={showCertModal} onClose={()=>setShowCertModal(false)} students={students} initialStudentId={certStudentId} initialCertType={certType}/>}
   {profileStudent && <StudentProfileModal isOpen={!!profileStudent} onClose={()=>setProfileStudent(null)} student={profileStudent} onEditStudent={edit} onOpenIdCard={handleOpenIdCard} onOpenCertificate={handleOpenCert}/>}
 </div>;
}
// AdmissionPanel is modernized and modularized in AdmissionPanel.jsx


// ResultPanel is modernized and modularized in ResultPanel.jsx



const emptyTeacher={public_contact_role:'',public_contact_enabled:true,employee_id:'',name_bn:'',name_en:'',designation:'',designation_en:'',subject:'',phone:'',email:'',joining_date:'',gender:'',address:'',photo_url:'',status:'active',nid_no:'',tin_no:'',birth_registration_no:'',whatsapp_no:'',blood_group:'',religion:'',marital_status:'',nationality:'বাংলাদেশী',father_name_bn:'',father_name_en:'',mother_name_bn:'',mother_name_en:'',first_joining_date:'',first_mpo_date:'',current_post_joining_date:'',current_mpo_date:'',previous_institution_joining_date:'',previous_institution_mpo_date:'',appointment_date:'',appointment_authority:'',mpo_index_no:'',teacher_registration_no:'',registration_date:'',teacher_portal_id:'',permanent_address:'',extended_profile:{education:[],professional_qualifications:[],training:[],in_service_training:[],ntrca:{},dob:'',professional_note:''}};
const emptyStaff={public_contact_role:'',public_contact_enabled:true,employee_id:'',name_bn:'',name_en:'',designation:'',phone:'',email:'',joining_date:'',gender:'',address:'',photo_url:'',status:'active',nid_no:'',tin_no:'',birth_registration_no:'',whatsapp_no:'',blood_group:'',religion:'',marital_status:'',nationality:'বাংলাদেশী',father_name_bn:'',father_name_en:'',mother_name_bn:'',mother_name_en:'',first_joining_date:'',current_post_joining_date:'',appointment_date:'',appointment_authority:'',permanent_address:'',extended_profile:{education:[],professional_qualifications:[],training:[],in_service_training:[],dob:'',professional_note:''}};

function StaffPanel({sub}){
 const getInitialTab = (s) => (s==='staff'||s==='staff_list'||s==='staff_new'||s==='employees') ? 'staff' : 'teachers';
 const getInitialView = (s) => (s==='teacher_new'||s==='staff_new') ? 'form' : (s==='teacher_voters'||s==='teacher_voter_list') ? 'voter' : 'list';

 const getInitialTeachers = () => {
   try {
     const raw = localStorage.getItem('magra_db_teachers');
     if (raw) {
       const parsed = JSON.parse(raw);
       if (Array.isArray(parsed) && parsed.length) return sortPeopleByEmployeeId(parsed);
     }
   } catch {}
   return Array.isArray(MOCK_TEACHERS) ? sortPeopleByEmployeeId(MOCK_TEACHERS) : [];
 };

 const [tab, setTab] = useState(getInitialTab(sub));
 const [view, setView] = useState(getInitialView(sub));
 const [teachers,setTeachers]=useState(getInitialTeachers);
 const [allTeachers,setAllTeachers]=useState(getInitialTeachers);
 const [staff,setStaff]=useState([]);
 const [q,setQ]=useState('');
 const [status,setStatus]=useState('active');
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState(getInitialTab(sub)==='staff'?{...emptyStaff}:{...emptyTeacher});
 const [msg,setMsg]=useState('');
 const [step,setStep]=useState(0);
 const [customFields,setCustomFields]=useState([]);
 const [customFieldKey,setCustomFieldKey]=useState('');
 const [customFieldValue,setCustomFieldValue]=useState('');
 const [voterSearch, setVoterSearch] = useState('');
 const [voterRemarks, setVoterRemarks] = useState({});
 const [teacherQueryModal, setTeacherQueryModal] = useState({ isOpen: false, mode: 'education' });
 const [showStaffCertModal, setShowStaffCertModal] = useState(false);
 const [staffCertPersonId, setStaffCertPersonId] = useState('');
 const [staffCertTab, setStaffCertTab] = useState('bonafide');
 const [staffActionMenu, setStaffActionMenu] = useState(null);

 useEffect(() => {
   const handleScroll = () => {
     if (staffActionMenu) setStaffActionMenu(null);
   };
   window.addEventListener('scroll', handleScroll, true);
   return () => window.removeEventListener('scroll', handleScroll, true);
 }, [staffActionMenu]);

 const toggleStaffActionMenu = (e, person) => {
   e.stopPropagation();
   if (staffActionMenu?.personId === person.id) {
     setStaffActionMenu(null);
   } else {
     const rect = e.currentTarget.getBoundingClientRect();
     const menuWidth = 230;
     let left = rect.right - menuWidth;
     if (left < 10) left = 10;
     const menuHeight = 360;
     let top = rect.bottom + 4;
     if (top + menuHeight > window.innerHeight) {
       top = Math.max(10, rect.top - menuHeight - 4);
     }
     setStaffActionMenu({
       personId: person.id,
       top,
       left,
       person
     });
   }
 };

 const handleOpenStaffDocs = (personId = '', initialTab = 'bonafide') => {
   setStaffCertPersonId(personId || (rawList[0]?.id || ''));
   setStaffCertTab(initialTab);
   setShowStaffCertModal(true);
 };

 const isExcludedVoter = (t) => {
   if (!t) return true;
   const d = (t?.designation || '').trim();
   const dEn = (t?.designation_en || '').toLowerCase().trim();
   const r = (t?.public_contact_role || '').toLowerCase().trim();

   // Exclude Head Teacher
   if (r === 'head_teacher') return true;
   if (d === 'প্রধান শিক্ষক' || d.startsWith('প্রধান শিক্ষক')) return true;
   if (dEn === 'head teacher' || dEn.startsWith('head teacher') || dEn.includes('headmaster') || dEn.includes('principal')) return true;

   // Exclude Assistant Head Teacher
   if (r === 'assistant_head_teacher') return true;
   if (d.includes('সহকারী প্রধান শিক্ষক') || d.includes('সহ: প্রধান শিক্ষক') || d.includes('সহ-প্রধান শিক্ষক')) return true;
   if (dEn.includes('assistant head') || dEn.includes('asst head') || dEn.includes('asst. head') || dEn.includes('assistant headmaster')) return true;

   // Exclude known default seed IDs if designation matches head/asst head
   if ((t?.id === 't-1' || t?.employee_id === '1') && (d.includes('প্রধান') || dEn.includes('head') || !d)) return true;
   if ((t?.id === 't-2' || t?.employee_id === '2') && (d.includes('সহকারী প্রধান') || dEn.includes('assistant head') || !d)) return true;

   return false;
 };

 const voterTeachers = useMemo(() => {
   const list = (allTeachers && allTeachers.length)
     ? allTeachers
     : (teachers && teachers.length)
       ? teachers
       : getInitialTeachers();

   return list.filter(t => {
     const s = (t.status || 'active').toLowerCase().trim();
     const isActive = s === 'active' || s === 'সক্রিয়' || !s;
     return isActive && !isExcludedVoter(t);
   });
 }, [allTeachers, teachers]);

 const filteredVoters = useMemo(() => {
   if (!voterSearch.trim()) return voterTeachers;
   const qLower = voterSearch.toLowerCase().trim();
   return voterTeachers.filter(t => 
     (t.name_bn || '').toLowerCase().includes(qLower) ||
     (t.name_en || '').toLowerCase().includes(qLower) ||
     (t.employee_id || '').toLowerCase().includes(qLower) ||
     (t.designation || '').toLowerCase().includes(qLower) ||
     (t.subject || '').toLowerCase().includes(qLower) ||
     (t.mpo_index_no || '').toLowerCase().includes(qLower) ||
     (t.phone || '').includes(qLower)
   );
 }, [voterTeachers, voterSearch]);

 const printTeacherVoterList = () => {
   const w = window.open('', '_blank');
   if (!w) { alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে অনুমতি দিন।'); return; }
   const printRows = filteredVoters;
   const content = `<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <title>শিক্ষক ভোটার তালিকা ২০২৬</title>
 <style>
   @page { size: A4 portrait; margin: 12mm; }
   body { font-family: 'SolaimanLipi', Arial, 'Noto Sans Bengali', sans-serif; margin: 15px; color: #111; font-size: 11px; }
   .print-header { text-align: center; margin-bottom: 14px; border-bottom: 2px solid #0f4c3a; padding-bottom: 8px; }
   .print-header h1 { font-size: 20px; margin: 0 0 3px; color: #0f4c3a; font-weight: 800; }
   .print-header p { font-size: 11px; margin: 0 0 4px; color: #444; }
   .print-header h2 { font-size: 15px; margin: 4px 0 6px; color: #1e293b; text-decoration: underline; }
   .meta-line { display: flex; justify-content: space-between; font-weight: 700; font-size: 11px; margin-top: 6px; }
   .voter-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
   .voter-table th, .voter-table td { border: 1px solid #475569; padding: 6px 8px; font-size: 11px; }
   .voter-table th { background: #e2e8f0; color: #0f172a; text-align: left; }
   .signature-area { margin-top: 50px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; font-size: 10.5px; page-break-inside: avoid; }
   .signature-line { border-top: 1px dashed #333; padding-top: 4px; }
 </style>
</head>
<body>
 <div class="print-header">
   <h1>মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</h1>
   <p>মগড়া, কালিহাতি, টাঙ্গাইল • EIIN: 114290</p>
   <h2>শিক্ষক প্রতিনিধি নির্বাচনের চূড়ান্ত ভোটার তালিকা - ২০২৬</h2>
   <div class="meta-line">
     <span><b>যোগ্যতা:</b> প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষক ব্যতিত সকল সক্রিয় শিক্ষকবৃন্দ</span>
     <span><b>মোট ভোটার:</b> ${printRows.length} জন</span>
   </div>
 </div>
 <table class="voter-table">
   <thead>
     <tr>
       <th style="width:65px;text-align:center">ভোটার নং</th>
       <th style="width:180px">ভোটারের নাম</th>
       <th style="width:140px">পদবী</th>
       <th style="width:130px;text-align:center">অত্র প্রতিষ্ঠানে যোগদানের তারিখ</th>
       <th style="width:130px;text-align:center">এমপিও কোড/ইনডেক্স নম্বর</th>
       <th style="width:110px;text-align:center">মন্তব্য</th>
     </tr>
   </thead>
   <tbody>
     ${printRows.map((r, idx) => {
       const jDate = r.current_post_joining_date || r.joining_date || r.first_joining_date || r.appointment_date || r.extended_profile?.joining_date || '—';
       const mpo = r.mpo_index_no || r.mpo_code || r.index_no || r.extended_profile?.mpo_index_no || '—';
       const rem = voterRemarks[r.id] ?? r.remarks ?? ((r.status === 'active' || !r.status) ? 'যোগ্য ভোটার' : '—');
       return `
       <tr>
         <td style="text-align:center;font-weight:700">${idx + 1}</td>
         <td><b>${r.name_bn || r.name || '—'}</b>${r.name_en ? `<br><span style="font-size:10px;color:#475569">${r.name_en}</span>` : ''}</td>
         <td>${r.designation || 'সহকারী শিক্ষক'}${r.subject ? ` (${r.subject})` : ''}</td>
         <td style="text-align:center">${jDate}</td>
         <td style="text-align:center;font-weight:600">${mpo}</td>
         <td style="text-align:center">${rem}</td>
       </tr>
     `;}).join('')}
   </tbody>
 </table>
 <div class="signature-area">
   <div>
     <br><br>
     <div class="signature-line">প্রস্তুতকারীর স্বাক্ষর</div>
   </div>
   <div>
     <br><br>
     <div class="signature-line">যাচাইকারীর স্বাক্ষর</div>
   </div>
   <div>
     <br><br>
     <div class="signature-line">প্রধান শিক্ষক</div>
   </div>
   <div>
     <br><br>
     <div class="signature-line">নির্বাচন কমিশনার / প্রিজাইডিং অফিসার</div>
   </div>
 </div>
 <script>
   window.onload = function() { window.print(); };
 </script>
</body>
</html>`;
   w.document.write(content);
   w.document.close();
 };

 const exportTeacherVoterCSV = () => {
   const headers = ['ভোটার নং', 'ভোটারের নাম (বাংলা)', 'ভোটারের নাম (ইংরেজি)', 'পদবী', 'মূল বিষয়', 'অত্র প্রতিষ্ঠানে যোগদানের তারিখ', 'এমপিও কোড/ইনডেক্স নম্বর', 'মন্তব্য'];
   const rows = filteredVoters.map((r, idx) => [
     idx + 1,
     `"${(r.name_bn || r.name || '').replace(/"/g, '""')}"`,
     `"${(r.name_en || '').replace(/"/g, '""')}"`,
     `"${(r.designation || 'সহকারী শিক্ষক').replace(/"/g, '""')}"`,
     `"${(r.subject || '').replace(/"/g, '""')}"`,
     `"${r.current_post_joining_date || r.joining_date || r.first_joining_date || r.appointment_date || ''}"`,
     `"${r.mpo_index_no || r.mpo_code || r.index_no || ''}"`,
     `"${voterRemarks[r.id] ?? r.remarks ?? ((r.status === 'active' || !r.status) ? 'যোগ্য ভোটার' : '')}"`
   ]);
   const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
   const encodedUri = encodeURI(csvContent);
   const link = document.createElement('a');
   link.setAttribute('href', encodedUri);
   link.setAttribute('download', `Teacher_Voter_List_${new Date().toISOString().slice(0, 10)}.csv`);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
 };

 const getNextEmployeeId = (arr) => {
   const max = (arr || []).reduce((acc, curr) => {
     const n = parseEmployeeIdNum(curr?.employee_id || curr?.id);
     return n > acc ? n : acc;
   }, 0);
   return String(max + 1);
 };

 const initNewForm = (t = tab) => {
   const targetIsTeacher = t === 'teachers';
   const targetList = targetIsTeacher ? teachers : staff;
   const base = targetIsTeacher ? emptyTeacher : emptyStaff;
   return { ...base, employee_id: getNextEmployeeId(targetList) };
 };

 useEffect(()=>{
  if(sub==='staff_new'){
   setTab('staff');
   setView('form');
   setEditing(null);
   setForm(initNewForm('staff'));
   setStep(0);
  } else if(sub==='staff_list'||sub==='staff'||sub==='employees'){
   setTab('staff');
   setView('list');
  } else if(sub==='teacher_new'){
   setTab('teachers');
   setView('form');
   setEditing(null);
   setForm(initNewForm('teachers'));
   setStep(0);
  } else if(sub==='teachers_list'||sub==='teachers'){
   setTab('teachers');
   setView('list');
  } else if(sub==='teacher_voters'||sub==='teacher_voter_list'){
   setTab('teachers');
   setView('voter');
  }
 },[sub]);

 const isTeacher = tab === 'teachers';
  const rawList = isTeacher ? teachers : staff;
  const list = useMemo(() => sortPeopleByEmployeeId(rawList), [rawList]);
  const blank = isTeacher ? emptyTeacher : emptyStaff;
 
 const load=()=>{
  api(`/teachers?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&custom_field_key=${encodeURIComponent(customFieldKey)}&custom_field_value=${encodeURIComponent(customFieldValue)}`)
    .then(data => setTeachers(deduplicateTeachers(Array.isArray(data) ? data : [])))
   .catch(e=>setMsg(e.message));
  api(`/staff?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&custom_field_key=${encodeURIComponent(customFieldKey)}&custom_field_value=${encodeURIComponent(customFieldValue)}`)
    .then(data => setStaff(sortPeopleByEmployeeId(Array.isArray(data) ? data : [])))
   .catch(()=>{});
 };

 useEffect(()=>{
  api('/admin/form-fields?form_key='+(isTeacher?'teacher':'staff')).then(d=>setCustomFields(Array.isArray(d)?d:[])).catch(()=>setCustomFields([]));
 },[isTeacher]);

 useEffect(()=>{load();},[q,status,customFieldKey,customFieldValue]);

   const formatEduSummary = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return '';
    return arr.map(e => [e.exam, e.institution, e.board, e.subject, e.year, e.result].filter(Boolean).join(' - ')).join(' ; ');
  };

  const formatTrainingSummary = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return '';
    return arr.map(t => [t.title || t.name, t.subject, t.institution || t.place, t.location, t.duration, t.start_date, t.end_date].filter(Boolean).join(' - ')).join(' ; ');
  };

  const parseEduText = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str.split(';').map(part => {
      const tokens = part.split('-').map(s => s.trim());
      if (!tokens.length || !tokens[0]) return null;
      return {
        exam: tokens[0] || '',
        institution: tokens[1] || '',
        board: tokens[2] || '',
        subject: tokens[3] || '',
        year: tokens[4] || '',
        result: tokens[5] || '',
        is_saved: true
      };
    }).filter(Boolean);
  };

  const parseTrainingText = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str.split(';').map(part => {
      const tokens = part.split('-').map(s => s.trim());
      if (!tokens.length || !tokens[0]) return null;
      return {
        title: tokens[0] || '',
        subject: tokens[1] || '',
        institution: tokens[2] || '',
        location: tokens[3] || '',
        duration: tokens[4] || '',
        start_date: tokens[5] || '',
        end_date: tokens[6] || '',
        is_saved: true
      };
    }).filter(Boolean);
  };

  const exportPeople = (targetPerson = null) => {
    const isSingle = targetPerson && typeof targetPerson === 'object' && targetPerson.id;
    const targetList = isSingle ? [targetPerson] : (list || []);

    const custom = customFields.filter(f => f.enabled && !f.is_system);
    const headers = [
      // ধাপ ১: পরিচয় ও পরিবার
      'Employee ID',
      'Name (Bangla)',
      'Name (English)',
      'Date of Birth',
      'Gender',
      'Blood Group',
      'Religion',
      'Marital Status',
      'Nationality',
      'NID No',
      'TIN No',
      'Birth Registration No',
      'Father Name (Bangla)',
      'Father Name (English)',
      'Mother Name (Bangla)',
      'Mother Name (English)',

      // ধাপ ২: চাকরি ও MPO
      'Designation',
      ...(isTeacher ? ['Designation (English)', 'Subject'] : []),
      'Status',
      'First Joining Date',
      ...(isTeacher ? ['First MPO Date'] : []),
      'Current Post Joining Date',
      ...(isTeacher ? ['Current MPO Date'] : []),
      'Previous Institution Joining Date',
      ...(isTeacher ? ['Previous Institution MPO Date'] : []),
      'Appointment Date',
      'Appointment Authority',
      ...(isTeacher ? ['MPO Index No'] : []),

      // ধাপ ৩: শিক্ষাগত যোগ্যতার বিবরণ
      'Educational Qualifications',

      // ধাপ ৪: পেশাগত যোগ্যতার বিবরণ
      'Professional Degrees',

      // ধাপ ৫: প্রশিক্ষণের বিবরণ
      'ICT Trainings',
      'In-Service Trainings',
      ...(isTeacher ? ['Teacher Portal ID'] : []),
      'Professional Note',

      // ধাপ ৬: নিবন্ধন / NTRCA ও যোগাযোগ
      ...(isTeacher ? [
        'Teacher Registration No',
        'Registration Date',
        'NTRCA Registered',
        'NTRCA Recommended',
        'NTRCA Year',
        'NTRCA Subject',
        'NTRCA Remarks'
      ] : []),
      'Mobile',
      'WhatsApp',
      'Email',
      'Present Address',
      'Permanent Address',

      // অতিরিক্ত ও সিস্টেম ফিল্ড
      'Public Contact Role',
      'Public Contact Enabled',
      ...custom.map(f => 'custom:' + f.field_key),
      'extended_profile_json'
    ];

    const rows = targetList.map(x => {
      const c = flattenCustom(x);
      const ext = x.extended_profile || {};
      const ntrca = ext.ntrca || {};
      const eduList = isTeacher ? getTeacherAllEducation(x) : (ext.education || []);
      const profList = ext.professional_qualifications || [];
      const ictList = ext.training || [];
      const inServiceList = ext.in_service_training || [];

      return {
        // ধাপ ১: পরিচয় ও পরিবার
        'Employee ID': x.employee_id || '',
        'Name (Bangla)': x.name_bn || '',
        'Name (English)': x.name_en || '',
        'Date of Birth': ext.dob || x.date_of_birth || '',
        'Gender': x.gender || '',
        'Blood Group': x.blood_group || '',
        'Religion': x.religion || 'ইসলাম',
        'Marital Status': x.marital_status || '',
        'Nationality': x.nationality || 'বাংলাদেশী',
        'NID No': x.nid_no || '',
        'TIN No': x.tin_no || '',
        'Birth Registration No': x.birth_registration_no || '',
        'Father Name (Bangla)': x.father_name_bn || '',
        'Father Name (English)': x.father_name_en || '',
        'Mother Name (Bangla)': x.mother_name_bn || '',
        'Mother Name (English)': x.mother_name_en || '',

        // ধাপ ২: চাকরি ও MPO
        'Designation': x.designation || '',
        ...(isTeacher ? {
          'Designation (English)': x.designation_en || '',
          'Subject': x.subject || ''
        } : {}),
        'Status': statusBn(x.status),
        'First Joining Date': x.first_joining_date || '',
        ...(isTeacher ? {
          'First MPO Date': x.first_mpo_date || ''
        } : {}),
        'Current Post Joining Date': x.current_post_joining_date || x.joining_date || '',
        ...(isTeacher ? {
          'Current MPO Date': x.current_mpo_date || ''
        } : {}),
        'Previous Institution Joining Date': x.previous_institution_joining_date || '',
        ...(isTeacher ? {
          'Previous Institution MPO Date': x.previous_institution_mpo_date || ''
        } : {}),
        'Appointment Date': x.appointment_date || '',
        'Appointment Authority': x.appointment_authority || '',
        ...(isTeacher ? {
          'MPO Index No': x.mpo_index_no || ''
        } : {}),

        // ধাপ ৩: শিক্ষাগত যোগ্যতার বিবরণ
        'Educational Qualifications': formatEduSummary(eduList),

        // ধাপ ৪: পেশাগত যোগ্যতার বিবরণ
        'Professional Degrees': formatEduSummary(profList),

        // ধাপ ৫: প্রশিক্ষণের বিবরণ
        'ICT Trainings': formatTrainingSummary(ictList),
        'In-Service Trainings': formatTrainingSummary(inServiceList),
        ...(isTeacher ? {
          'Teacher Portal ID': x.teacher_portal_id || ''
        } : {}),
        'Professional Note': ext.professional_note || '',

        // ধাপ ৬: নিবন্ধন / NTRCA ও যোগাযোগ
        ...(isTeacher ? {
          'Teacher Registration No': x.teacher_registration_no || '',
          'Registration Date': x.registration_date || '',
          'NTRCA Registered': ntrca.registered || '',
          'NTRCA Recommended': ntrca.recommended || '',
          'NTRCA Year': ntrca.year || '',
          'NTRCA Subject': ntrca.subject || '',
          'NTRCA Remarks': ntrca.remarks || ''
        } : {}),
        'Mobile': x.phone || '',
        'WhatsApp': x.whatsapp_no || '',
        'Email': x.email || '',
        'Present Address': x.address || '',
        'Permanent Address': x.permanent_address || '',

        // অতিরিক্ত ও সিস্টেম ফিল্ড
        'Public Contact Role': x.public_contact_role || '',
        'Public Contact Enabled': x.public_contact_enabled !== false ? 'হ্যাঁ' : 'না',
        ...c,
        'extended_profile_json': JSON.stringify(ext)
      };
    });

    let filename = isTeacher ? 'magra-teachers.csv' : 'magra-staff.csv';
    if (isSingle) {
      const cleanName = (targetPerson.name_bn || targetPerson.name_en || 'teacher').replace(/[\s/\\:*?"<>|]+/g, '_');
      const empTag = targetPerson.employee_id ? `_ID${targetPerson.employee_id}` : '';
      filename = `${cleanName}${empTag}_CSV_Report.csv`;
    }

    downloadCsv(filename, rows, headers);
  };

  const peopleImportHeaders = isTeacher ? [
    // ধাপ ১: পরিচয় ও পরিবার
    'Employee ID', 'Name (Bangla)', 'Name (English)', 'Date of Birth', 'Gender', 'Blood Group', 'Religion', 'Marital Status', 'Nationality',
    'NID No', 'TIN No', 'Birth Registration No',
    'Father Name (Bangla)', 'Father Name (English)', 'Mother Name (Bangla)', 'Mother Name (English)',

    // ধাপ ২: চাকরি ও MPO
    'Designation', 'Designation (English)', 'Subject', 'Status',
    'First Joining Date', 'First MPO Date', 'Current Post Joining Date', 'Current MPO Date',
    'Previous Institution Joining Date', 'Previous Institution MPO Date', 'Appointment Date', 'Appointment Authority',
    'MPO Index No',

    // ধাপ ৩: শিক্ষাগত যোগ্যতার বিবরণ
    'Educational Qualifications',

    // ধাপ ৪: পেশাগত যোগ্যতার বিবরণ
    'Professional Degrees',

    // ধাপ ৫: প্রশিক্ষণের বিবরণ
    'ICT Trainings', 'In-Service Trainings', 'Teacher Portal ID', 'Professional Note',

    // ধাপ ৬: নিবন্ধন / NTRCA ও যোগাযোগ
    'Teacher Registration No', 'Registration Date', 'NTRCA Registered', 'NTRCA Recommended', 'NTRCA Year', 'NTRCA Subject', 'NTRCA Remarks',
    'Mobile', 'WhatsApp', 'Email', 'Present Address', 'Permanent Address',

    // অতিরিক্ত ও সিস্টেম ফিল্ড
    'Public Contact Role', 'Public Contact Enabled', 'extended_profile_json'
  ] : [
    // ধাপ ১: পরিচয় ও পরিবার
    'Employee ID', 'Name (Bangla)', 'Name (English)', 'Date of Birth', 'Gender', 'Blood Group', 'Religion', 'Marital Status', 'Nationality',
    'NID No', 'TIN No', 'Birth Registration No',
    'Father Name (Bangla)', 'Father Name (English)', 'Mother Name (Bangla)', 'Mother Name (English)',

    // ধাপ ২: চাকরি ও MPO
    'Designation', 'Status',
    'First Joining Date', 'Current Post Joining Date', 'Appointment Date', 'Appointment Authority',

    // ধাপ ৩: শিক্ষাগত যোগ্যতার বিবরণ
    'Educational Qualifications',

    // ধাপ ৪: পেশাগত যোগ্যতার বিবরণ
    'Professional Degrees',

    // ধাপ ৫: প্রশিক্ষণের বিবরণ
    'ICT Trainings', 'In-Service Trainings', 'Professional Note',

    // ধাপ ৬: যোগাযোগ
    'Mobile', 'WhatsApp', 'Email', 'Present Address', 'Permanent Address',

    // অতিরিক্ত ও সিস্টেম ফিল্ড
    'Public Contact Role', 'Public Contact Enabled', 'extended_profile_json'
  ];

  const downloadPeopleTemplate = () => {
    const sampleRow = isTeacher ? {
      // ধাপ ১: পরিচয় ও পরিবার
      'Employee ID': '1',
      'Name (Bangla)': 'মুহাম্মদ শফিকুল ইসলাম',
      'Name (English)': 'MUHAMMAD SHAFIQUL ISLAM',
      'Date of Birth': '1975-02-10',
      'Gender': 'পুরুষ',
      'Blood Group': 'B+',
      'Religion': 'ইসলাম',
      'Marital Status': 'বিবাহিত',
      'Nationality': 'বাংলাদেশী',
      'NID No': '19759312345678901',
      'TIN No': '123456789012',
      'Birth Registration No': '19759312345678902',
      'Father Name (Bangla)': 'মরহুম আব্দুল কাদের',
      'Father Name (English)': 'Late Abdul Kader',
      'Mother Name (Bangla)': 'মোছাঃ ফাতেমা খাতুন',
      'Mother Name (English)': 'Mst Fatema Khatun',

      // ধাপ ২: চাকরি ও MPO
      'Designation': 'প্রধান শিক্ষক',
      'Designation (English)': 'Head Teacher',
      'Subject': 'প্রশাসনিক',
      'Status': 'সক্রিয়',
      'First Joining Date': '2000-03-01',
      'First MPO Date': '2000-05-01',
      'Current Post Joining Date': '2010-01-15',
      'Current MPO Date': '2010-05-01',
      'Previous Institution Joining Date': '',
      'Previous Institution MPO Date': '',
      'Appointment Date': '2000-02-15',
      'Appointment Authority': 'ব্যবস্থাপনা কমিটি',
      'MPO Index No': '4206071302',

      // ধাপ ৩: শিক্ষাগত যোগ্যতার বিবরণ
      'Educational Qualifications': 'এসএসসি/সমমান - টাঙ্গাইল জিলা স্কুল - ঢাকা - বিজ্ঞান - ১৯৯০ - ১ম বিভাগ ; এইচএসসি/সমমান - করটিয়া সা’দত কলেজ - ঢাকা - বিজ্ঞান - ১৯৯২ - ১ম বিভাগ ; স্নাতক (সম্মান)/সমমান - ঢাকা বিশ্ববিদ্যালয় - ঢাকা - গণিত - ১৯৯৫ - ১ম শ্রেণি ; স্নাতকোত্তর/সমমান - ঢাকা বিশ্ববিদ্যালয় - ঢাকা - গণিত - ১৯৯৬ - ১ম শ্রেণি',

      // ধাপ ৪: পেশাগত যোগ্যতার বিবরণ
      'Professional Degrees': 'বিএড - সরকারি টিটিসি ঢাকা - জাতীয় বিশ্ববিদ্যালয় - শিক্ষা প্রশাসন - ১৯৯৮ - ১ম শ্রেণি',

      // ধাপ ৫: প্রশিক্ষণের বিবরণ
      'ICT Trainings': 'আইসিটি - ডিজিটাল কনটেন্ট ডেভলপমেন্ট - NAEM - ঢাকা - ১৪ দিন - 2021-03-01 - 2021-03-14',
      'In-Service Trainings': 'কারিকুলাম বিস্তরণ - নতুন শিক্ষাক্রম - HSTTI - ময়মনসিংহ - ৭ দিন - 2023-01-05 - 2023-01-11',
      'Teacher Portal ID': 'shafiqul.magra',
      'Professional Note': 'প্রধান শিক্ষক হিসেবে দায়িত্ব পালনরত।',

      // ধাপ ৬: নিবন্ধন / NTRCA ও যোগাযোগ
      'Teacher Registration No': 'NTRCA-1234567',
      'Registration Date': '2006-05-15',
      'NTRCA Registered': 'হ্যাঁ',
      'NTRCA Recommended': 'হ্যাঁ',
      'NTRCA Year': '2006',
      'NTRCA Subject': 'গণিত',
      'NTRCA Remarks': 'সুপারিশপ্রাপ্ত ও এমপিওভুক্ত',
      'Mobile': '01753539680',
      'WhatsApp': '01753539680',
      'Email': 'headteacher.magra@gmail.com',
      'Present Address': 'গ্রাম: মগড়া, ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল',
      'Permanent Address': 'গ্রাম: মগড়া, ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল',

      // অতিরিক্ত ও সিস্টেম ফিল্ড
      'Public Contact Role': 'head_teacher',
      'Public Contact Enabled': 'হ্যাঁ',
      'extended_profile_json': '{}'
    } : {
      // স্টাফ টেমপ্লেট
      'Employee ID': 'STF-001',
      'Name (Bangla)': 'মোঃ আলমগীর হোসেন',
      'Name (English)': 'MD. ALAMGIR HOSSAIN',
      'Date of Birth': '1985-06-15',
      'Gender': 'পুরুষ',
      'Blood Group': 'O+',
      'Religion': 'ইসলাম',
      'Marital Status': 'বিবাহিত',
      'Nationality': 'বাংলাদেশী',
      'NID No': '19859312345678903',
      'TIN No': '',
      'Birth Registration No': '',
      'Father Name (Bangla)': 'পিতার নাম',
      'Father Name (English)': "Father's Name",
      'Mother Name (Bangla)': 'মাতার নাম',
      'Mother Name (English)': "Mother's Name",
      'Designation': 'অফিস সহকারী কাম কম্পিউটার অপারেটর',
      'Status': 'সক্রিয়',
      'First Joining Date': '2015-01-01',
      'Current Post Joining Date': '2015-01-01',
      'Appointment Date': '2014-12-15',
      'Appointment Authority': 'ব্যবস্থাপনা কমিটি',
      'Educational Qualifications': 'এইচএসসি/সমমান - সরকারি এম এম আলী কলেজ - ঢাকা - মানবিক - ২০০৪ - ২য় বিভাগ',
      'Professional Degrees': 'ডিপ্লোমা ইন কম্পিউটার এপ্লিকেশন - যুব উন্নয়ন অধিদপ্তর - ঢাকা - আইসিটি - ২০০৬ - এ গ্রেড',
      'ICT Trainings': 'কম্পিউটার অফিস এপ্লিকেশন - কারিগরি শিক্ষা বোর্ড - ঢাকা - ৬ মাস - 2008-01-01 - 2008-06-30',
      'In-Service Trainings': '',
      'Professional Note': '',
      'Mobile': '01726223355',
      'WhatsApp': '01726223355',
      'Email': 'alamgir.magra@gmail.com',
      'Present Address': 'গ্রাম: মগড়া, কালিহাতী, টাঙ্গাইল',
      'Permanent Address': 'গ্রাম: মগড়া, কালিহাতী, টাঙ্গাইল',
      'Public Contact Role': 'office_assistant',
      'Public Contact Enabled': 'হ্যাঁ',
      'extended_profile_json': '{}'
    };
    downloadCsv(isTeacher ? 'magra-teacher-import-template.csv' : 'magra-staff-import-template.csv', [sampleRow], peopleImportHeaders);
  };

  const importPeople = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const matrix = parseCsvText(await file.text());
      if (matrix.length < 2) throw new Error('CSV-তে কোনো তথ্য পাওয়া যায়নি');
      const rawHeaders = matrix[0].map(x => x.trim().toLowerCase());
      const aliasMap = {
        'employee id': 'employee_id',
        'employee_id': 'employee_id',
        'id': 'employee_id',
        'কর্মচারী আইডি': 'employee_id',
        'শিক্ষক আইডি': 'employee_id',
        'name': 'name_bn',
        'name (bangla)': 'name_bn',
        'name_bn': 'name_bn',
        'নাম': 'name_bn',
        'নাম (বাংলা)': 'name_bn',
        'শিক্ষকের নাম': 'name_bn',
        'কর্মচারীর নাম': 'name_bn',
        'name (english)': 'name_en',
        'name_en': 'name_en',
        'নাম (ইংরেজি)': 'name_en',
        'designation': 'designation',
        'designation_bn': 'designation',
        'পদবি': 'designation',
        'পদবী': 'designation',
        'designation (english)': 'designation_en',
        'designation_en': 'designation_en',
        'পদবি (ইংরেজি)': 'designation_en',
        'subject': 'subject',
        'মূল বিষয়': 'subject',
        'বিষয়': 'subject',
        'date of birth': 'dob',
        'date_of_birth': 'dob',
        'dob': 'dob',
        'জন্ম তারিখ': 'dob',
        'gender': 'gender',
        'লিঙ্গ': 'gender',
        'জেন্ডার': 'gender',
        'blood group': 'blood_group',
        'blood_group': 'blood_group',
        'রক্তের গ্রুপ': 'blood_group',
        'religion': 'religion',
        'ধর্ম': 'religion',
        'marital status': 'marital_status',
        'marital_status': 'marital_status',
        'বৈবাহিক অবস্থা': 'marital_status',
        'nationality': 'nationality',
        'জাতীয়তা': 'nationality',
        'nid no': 'nid_no',
        'nid': 'nid_no',
        'nid_no': 'nid_no',
        'জাতীয় পরিচয়পত্র নম্বর': 'nid_no',
        'tin no': 'tin_no',
        'tin': 'tin_no',
        'tin_no': 'tin_no',
        'tin নম্বর': 'tin_no',
        'birth registration no': 'birth_registration_no',
        'birth_registration_no': 'birth_registration_no',
        'জন্ম নিবন্ধন নম্বর': 'birth_registration_no',
        'father name (bangla)': 'father_name_bn',
        'father_name_bn': 'father_name_bn',
        'পিতার নাম (বাংলা)': 'father_name_bn',
        'পিতার নাম': 'father_name_bn',
        'father name (english)': 'father_name_en',
        'father_name_en': 'father_name_en',
        'পিতার নাম (ইংরেজি)': 'father_name_en',
        'mother name (bangla)': 'mother_name_bn',
        'mother_name_bn': 'mother_name_bn',
        'মাতার নাম (বাংলা)': 'mother_name_bn',
        'মাতার নাম': 'mother_name_bn',
        'mother name (english)': 'mother_name_en',
        'mother_name_en': 'mother_name_en',
        'মাতার নাম (ইংরেজি)': 'mother_name_en',
        'first joining date': 'first_joining_date',
        'first_joining_date': 'first_joining_date',
        '১ম যোগদানের তারিখ': 'first_joining_date',
        'first mpo date': 'first_mpo_date',
        'first_mpo_date': 'first_mpo_date',
        '১ম এমপিওভুক্তির তারিখ': 'first_mpo_date',
        'current post joining date': 'current_post_joining_date',
        'current_post_joining_date': 'current_post_joining_date',
        'joining_date': 'current_post_joining_date',
        'joining date': 'current_post_joining_date',
        'বর্তমান পদে যোগদানের তারিখ': 'current_post_joining_date',
        'current mpo date': 'current_mpo_date',
        'current_mpo_date': 'current_mpo_date',
        'বর্তমান পদে এমপিও তারিখ': 'current_mpo_date',
        'previous institution joining date': 'previous_institution_joining_date',
        'previous_institution_joining_date': 'previous_institution_joining_date',
        'অত্র প্রতিষ্ঠানে যোগদানের তারিখ': 'previous_institution_joining_date',
        'previous institution mpo date': 'previous_institution_mpo_date',
        'previous_institution_mpo_date': 'previous_institution_mpo_date',
        'অত্র প্রতিষ্ঠানে এমপিও তারিখ': 'previous_institution_mpo_date',
        'appointment date': 'appointment_date',
        'appointment_date': 'appointment_date',
        'নিয়োগের তারিখ': 'appointment_date',
        'appointment authority': 'appointment_authority',
        'appointment_authority': 'appointment_authority',
        'নিয়োগকারী কর্তৃপক্ষ': 'appointment_authority',
        'mpo index no': 'mpo_index_no',
        'mpo_index_no': 'mpo_index_no',
        'এমপিও কোড/ইনডেক্স নম্বর': 'mpo_index_no',
        'teacher registration no': 'teacher_registration_no',
        'teacher_registration_no': 'teacher_registration_no',
        'শিক্ষক নিবন্ধন নম্বর': 'teacher_registration_no',
        'registration date': 'registration_date',
        'registration_date': 'registration_date',
        'নিবন্ধনের তারিখ': 'registration_date',
        'ntrca registered': 'ntrca_registered',
        'ntrca_registered': 'ntrca_registered',
        'ntrca নিবন্ধিত?': 'ntrca_registered',
        'ntrca recommended': 'ntrca_recommended',
        'ntrca_recommended': 'ntrca_recommended',
        'ntrca সুপারিশপ্রাপ্ত?': 'ntrca_recommended',
        'ntrca year': 'ntrca_year',
        'ntrca_year': 'ntrca_year',
        'ntrca নিবন্ধন/সুপারিশের সন': 'ntrca_year',
        'ntrca subject': 'ntrca_subject',
        'ntrca_subject': 'ntrca_subject',
        'ntrca বিষয়': 'ntrca_subject',
        'ntrca remarks': 'ntrca_remarks',
        'ntrca_remarks': 'ntrca_remarks',
        'ntrca মন্তব্য': 'ntrca_remarks',
        'teacher portal id': 'teacher_portal_id',
        'teacher_portal_id': 'teacher_portal_id',
        'শিক্ষক বাতায়ন id': 'teacher_portal_id',
        'educational qualifications': 'educational_qualifications',
        'educational_qualifications': 'educational_qualifications',
        'শিক্ষাগত যোগ্যতার বিবরণ': 'educational_qualifications',
        'professional degrees': 'professional_degrees',
        'professional_degrees': 'professional_degrees',
        'পেশাগত যোগ্যতার বিবরণ': 'professional_degrees',
        'ict trainings': 'ict_trainings',
        'ict_trainings': 'ict_trainings',
        'আইসিটি প্রশিক্ষণ': 'ict_trainings',
        'in-service trainings': 'in_service_trainings',
        'in_service_trainings': 'in_service_trainings',
        'কর্মকালীন বিভিন্ন প্রশিক্ষণ': 'in_service_trainings',
        'professional note': 'professional_note',
        'professional_note': 'professional_note',
        'অতিরিক্ত পেশাগত তথ্য': 'professional_note',
        'mobile': 'phone',
        'phone': 'phone',
        'মোবাইল': 'phone',
        'ফোন': 'phone',
        'whatsapp': 'whatsapp_no',
        'whatsapp_no': 'whatsapp_no',
        'হোয়াটসঅ্যাপ': 'whatsapp_no',
        'হোয়াটসঅ্যাপ': 'whatsapp_no',
        'email': 'email',
        'ই-মেইল': 'email',
        'ইমেইল': 'email',
        'present address': 'address',
        'address': 'address',
        'বর্তমান ঠিকানা': 'address',
        'ঠিকানা': 'address',
        'permanent address': 'permanent_address',
        'permanent_address': 'permanent_address',
        'স্থায়ী ঠিকানা': 'permanent_address',
        'public contact role': 'public_contact_role',
        'public_contact_role': 'public_contact_role',
        'public contact enabled': 'public_contact_enabled',
        'public_contact_enabled': 'public_contact_enabled',
        'status': 'status',
        'অবস্থা': 'status',
        'extended_profile_json': 'extended_profile_json'
      };

      const headers = rawHeaders.map(h => aliasMap[h] || h);
      if (!headers.includes('name_bn')) {
        throw new Error('আবশ্যিক কলাম অনুপস্থিত: নাম (বা Name / name_bn)');
      }

      const rows = matrix.slice(1).map(r => {
        const obj = {};
        headers.forEach((h, i) => {
          const val = (r[i] ?? '').trim();
          if (val) obj[h] = val;
        });
        if (!obj.name_bn) return null;

        let ext = {
          education: [],
          professional_qualifications: [],
          training: [],
          in_service_training: [],
          ntrca: {},
          dob: obj.dob || '',
          professional_note: obj.professional_note || ''
        };

        if (obj.extended_profile_json) {
          try {
            const parsed = JSON.parse(obj.extended_profile_json);
            ext = { ...ext, ...parsed };
          } catch {}
        }

        if (!ext.education?.length && obj.educational_qualifications) {
          ext.education = parseEduText(obj.educational_qualifications);
        }
        if (!ext.professional_qualifications?.length && obj.professional_degrees) {
          ext.professional_qualifications = parseEduText(obj.professional_degrees);
        }
        if (!ext.training?.length && obj.ict_trainings) {
          ext.training = parseTrainingText(obj.ict_trainings);
        }
        if (!ext.in_service_training?.length && obj.in_service_trainings) {
          ext.in_service_training = parseTrainingText(obj.in_service_trainings);
        }

        if (obj.dob) ext.dob = obj.dob;
        if (obj.professional_note) ext.professional_note = obj.professional_note;

        if (obj.ntrca_registered || obj.ntrca_recommended || obj.ntrca_year || obj.ntrca_subject || obj.ntrca_remarks) {
          ext.ntrca = {
            registered: obj.ntrca_registered || ext.ntrca?.registered || '',
            recommended: obj.ntrca_recommended || ext.ntrca?.recommended || '',
            year: obj.ntrca_year || ext.ntrca?.year || '',
            subject: obj.ntrca_subject || ext.ntrca?.subject || '',
            remarks: obj.ntrca_remarks || ext.ntrca?.remarks || ''
          };
        }

        obj.extended_profile = ext;

        if (obj.public_contact_enabled !== undefined) {
          const pce = String(obj.public_contact_enabled).toLowerCase();
          obj.public_contact_enabled = !(pce === 'না' || pce === 'no' || pce === 'false');
        }

        if (obj.current_post_joining_date && !obj.joining_date) {
          obj.joining_date = obj.current_post_joining_date;
        }

        return obj;
      }).filter(Boolean);

      if (!rows.length) throw new Error('কোনো বৈধ রেকর্ড পাওয়া যায়নি');
      const result = await api(isTeacher ? '/teachers/bulk-import' : '/staff/bulk-import', { method: 'POST', body: JSON.stringify({ people: rows }) });
      setMsg(result.message || 'ইমপোর্ট সম্পন্ন হয়েছে');
      setView('list');
      load();
    } catch (err) {
      setMsg(err.message || 'CSV আপলোড ব্যর্থ');
    }
  };

  const change=(k,v)=>setForm(f=>({...f,[k]:v}));
 const ext=(k,v)=>setForm(f=>({...f,extended_profile:{...(f?.extended_profile||{}),[k]:v}}));
 const addRow=k=>ext(k,[...(form?.extended_profile?.[k]||[]),{}]);
 const updateRow=(k,i,f,v)=>ext(k,(form?.extended_profile?.[k]||[]).map((r,n)=>n===i?{...r,[f]:v}:r));
 const removeRow=(k,i)=>ext(k,(form?.extended_profile?.[k]||[]).filter((_,n)=>n!==i));
 const updateNtrca=(k,v)=>ext('ntrca',{...(form?.extended_profile?.ntrca||{}),[k]:v});
 
 const calcTrainingDuration = (start, end) => {
  if (!start || !end) return '';
  try {
    const s = new Date(start);
    const e = new Date(end);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diffMs = e.getTime() - s.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) return `${diffDays} দিন`;
    }
  } catch {}
  return '';
 };

 const updateTrainingField = (i, field, val, key = 'training') => {
  ext(key, (form?.extended_profile?.[key] || []).map((r, n) => {
   if (n !== i) return r;
   const updated = { ...r, [field]: val };
   if (field === 'start_date' || field === 'end_date') {
    const s = field === 'start_date' ? val : updated.start_date;
    const e = field === 'end_date' ? val : updated.end_date;
    const d = calcTrainingDuration(s, e);
    if (d) updated.duration = d;
   }
   return updated;
  }));
 };

 const setTrainingSaved = (i, isSaved, key = 'training') => {
  ext(key, (form?.extended_profile?.[key] || []).map((r, n) => n === i ? { ...r, is_saved: isSaved } : r));
  if (isSaved) setMsg((key === 'in_service_training' ? 'কর্মকালীন প্রশিক্ষণ' : 'আইসিটি প্রশিক্ষণ') + ' তথ্য সফলভাবে সংরক্ষিত হয়েছে');
 };

 const setEduSaved = (i, isSaved) => {
  ext('education', (form?.extended_profile?.education || []).map((r, n) => n === i ? { ...r, is_saved: isSaved } : r));
  if (isSaved) setMsg('শিক্ষাগত যোগ্যতার তথ্য সফলভাবে সংরক্ষিত হয়েছে');
 };

 const setProfEduSaved = (i, isSaved) => {
  ext('professional_qualifications', (form?.extended_profile?.professional_qualifications || []).map((r, n) => n === i ? { ...r, is_saved: isSaved } : r));
  if (isSaved) setMsg('পেশাগত যোগ্যতার তথ্য সফলভাবে সংরক্ষিত হয়েছে');
 };
 
 const file=e=>{
  const f=e.target.files?.[0];
  if(!f)return;
  if(f.size>2*1024*1024){setMsg('ছবির আকার সর্বোচ্চ 2MB হতে হবে');return;}
  const r=new FileReader();
  r.onload=()=>change('photo_url',r.result);
  r.readAsDataURL(f);
 };

 const save=async e=>{
  e.preventDefault();
  setMsg('সংরক্ষণ হচ্ছে...');
  try{
   const base=isTeacher?'teachers':'staff';
   await api(editing?`/${base}/${editing}`:`/${base}`,{method:editing?'PUT':'POST',body:JSON.stringify(form)});
   setMsg(editing?'তথ্য আপডেট হয়েছে':(isTeacher?'শিক্ষক সফলভাবে যুক্ত হয়েছে':'কর্মচারী সফলভাবে যুক্ত হয়েছে'));
   setEditing(null);
   setForm(initNewForm(tab));
   setStep(0);
   setView('list');
   window.dispatchEvent(new CustomEvent('magra_leadership_updated'));
   load();
  }catch(e){
   setMsg(e.message||'সংরক্ষণ ব্যর্থ হয়েছে');
  }
 };

 const begin=item=>{
  setEditing(item.id);
  setForm({
   ...(isTeacher?emptyTeacher:emptyStaff),
   ...item,
   extended_profile:{
    education:[],
    professional_qualifications:[],
    training:[],
    ntrca:{},
    dob:item.extended_profile?.dob||item.date_of_birth||'',
    ...(item.extended_profile||{})
   },
   joining_date:item.joining_date?.slice(0,10)||'',
   first_joining_date:item.first_joining_date?.slice(0,10)||'',
   first_mpo_date:item.first_mpo_date?.slice(0,10)||'',
   current_post_joining_date:item.current_post_joining_date?.slice(0,10)||item.joining_date?.slice(0,10)||'',
   current_mpo_date:item.current_mpo_date?.slice(0,10)||'',
   previous_institution_joining_date:item.previous_institution_joining_date?.slice(0,10)||'',
   previous_institution_mpo_date:item.previous_institution_mpo_date?.slice(0,10)||'',
   appointment_date:item.appointment_date?.slice(0,10)||'',
   registration_date:item.registration_date?.slice(0,10)||''
  });
  setStep(0);
  setView('form');
  window.scrollTo({top:0,behavior:'smooth'});
 };

 const remove=async id=>{
  if(!confirm('আপনি কি নিশ্চিত এই রেকর্ডটি মুছে ফেলতে চান?'))return;
  try{
   const base=isTeacher?'teachers':'staff';
   await api(`/${base}/${id}`,{method:'DELETE'});
   setMsg('সফলভাবে মুছে ফেলা হয়েছে');
   load();
  }catch(e){
   setMsg(e.message||'মুছে ফেলা ব্যর্থ হয়েছে');
  }
 };

  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineForm, setInlineForm] = useState({});

  const uploadPhoto = (x, e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setMsg('ছবির আকার সর্বোচ্চ 2MB হতে হবে');
      return;
    }
    const r = new FileReader();
    r.onload = async () => {
      try {
        const base = isTeacher ? 'teachers' : 'staff';
        await api(`/${base}/${x.id}`, { method: 'PUT', body: JSON.stringify({ ...x, photo_url: r.result }) });
        try {
          let leaderStored = JSON.parse(localStorage.getItem('magra_db_leadership_settings') || '{}');
          const dName = (x.designation || '').toLowerCase();
          const nBn = (x.name_bn || '').toLowerCase();
          if (x.id === 't-1' || dName.includes('প্রধান শিক্ষক') || nBn.includes('শফিকুল')) {
            leaderStored.head = { ...(leaderStored.head || {}), photo: r.result, name: x.name_bn || leaderStored.head?.name };
          } else if (x.id === 't-2' || dName.includes('সহকারী প্রধান শিক্ষক') || nBn.includes('তাপসী')) {
            leaderStored.asst_head = { ...(leaderStored.asst_head || {}), photo: r.result, name: x.name_bn || leaderStored.asst_head?.name };
          } else if (dName.includes('সভাপতি') || nBn.includes('নেয়ামুল')) {
            leaderStored.president = { ...(leaderStored.president || {}), photo: r.result, name: x.name_bn || leaderStored.president?.name };
          }
          localStorage.setItem('magra_db_leadership_settings', JSON.stringify(leaderStored));
        } catch {}
        setMsg(`${x.name_bn}-এর ছবি সফলভাবে আপডেট হয়েছে এবং মূল সাইটের বাণীতে যুক্ত হয়েছে`);
        window.dispatchEvent(new CustomEvent('magra_leadership_updated'));
        window.dispatchEvent(new Event('storage'));
        load();
      } catch (err) {
        setMsg(err.message || 'ছবি সংরক্ষণে ত্রুটি');
      }
    };
    r.readAsDataURL(f);
  };

  const printPersonProfile = (x) => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে ব্রাউজারে পপআপ অনুমোদন দিন।');
      return;
    }
    const eduList = isTeacher ? getTeacherAllEducation(x) : (x.extended_profile?.education || []);
    const profList = x.extended_profile?.professional_qualifications || [];
    const ictTrainingList = x.extended_profile?.training || [];
    const inServiceList = x.extended_profile?.in_service_training || [];
    const ntrca = x.extended_profile?.ntrca || {};
    const photo = getTeacherPhoto(x);

    const safeVal = (v) => (v !== undefined && v !== null && String(v).trim() !== '' ? v : '—');

    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${x.name_bn || x.name_en} - ${isTeacher ? 'শিক্ষক' : 'কর্মচারী'} পূর্ণাঙ্গ তথ্য বিবরণী ও প্রোফাইল</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif; color: #0f172a; margin: 0; padding: 10px; font-size: 11px; line-height: 1.35; background: #fff; }
    .header-box { text-align: center; border-bottom: 2.5px solid #0b8050; padding-bottom: 6px; margin-bottom: 10px; }
    .header-box h1 { font-size: 19px; color: #0b8050; margin: 0 0 2px; font-weight: 800; letter-spacing: -0.2px; }
    .header-box p { margin: 1px 0; font-size: 10.5px; color: #475569; }
    .header-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1.5px solid #10b981; padding: 2.5px 14px; border-radius: 12px; font-weight: 700; font-size: 11.5px; margin-top: 5px; }

    .top-summary { display: flex; gap: 14px; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc; margin-bottom: 10px; }
    .top-photo { width: 85px; height: 100px; border: 1px solid #94a3b8; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #fff; }
    .top-photo img { width: 100%; height: 100%; object-fit: cover; }
    .top-info { flex: 1; }
    .top-name-bn { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .top-name-en { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .top-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; font-size: 11px; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
    .top-grid div b { color: #334155; }

    .sec-title { background: #f0fdf4; color: #065f46; border: 1px solid #bbf7d0; padding: 4px 8px; font-weight: 700; font-size: 11.5px; margin: 10px 0 4px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; page-break-after: avoid; }
    .sec-sub { font-weight: 700; font-size: 11px; color: #1e293b; margin: 6px 0 3px; display: flex; align-items: center; gap: 4px; }

    .table-info { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10.5px; }
    .table-info td { border: 1px solid #cbd5e1; padding: 4px 6px; vertical-align: middle; }
    .table-info td.lbl { background: #f8fafc; font-weight: 700; color: #334155; width: 18%; }
    .table-info td.val { width: 32%; color: #0f172a; }

    .table-grid { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10px; }
    .table-grid th, .table-grid td { border: 1px solid #cbd5e1; padding: 4px 5px; text-align: left; }
    .table-grid th { background: #f1f5f9; font-weight: 700; color: #1e293b; }
    .table-grid td.c { text-align: center; }

    .signatures { margin-top: 35px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-box { text-align: center; width: 190px; border-top: 1px dashed #475569; padding-top: 4px; font-size: 10.5px; font-weight: 600; color: #1e293b; }

    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      .sec-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .table-info td.lbl, .table-grid th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <h1>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
    <p>ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল • EIIN: 114290 • MPO: 4206071302 • স্থাপিত: ১৯৪৬</p>
    <div class="header-badge">📋 ${isTeacher ? 'শিক্ষক' : 'কর্মচারী'} পূর্ণাঙ্গ তথ্য বিবরণী ও জীবনবৃত্তান্ত (Official Profile Record)</div>
  </div>

  <div class="top-summary">
    <div class="top-photo">
      <img src="${photo}" alt="" />
    </div>
    <div class="top-info">
      <div class="top-name-bn">${safeVal(x.name_bn)}</div>
      <div class="top-name-en">${safeVal(x.name_en)}</div>
      <div class="top-grid">
        <div><b>Employee ID:</b> ${safeVal(x.employee_id)}</div>
        <div><b>পদবী:</b> ${safeVal(x.designation)}</div>
        <div><b>অবস্থা:</b> ${statusBn(x.status)}</div>
        <div><b>মূল বিষয়:</b> ${safeVal(x.subject)}</div>
        <div><b>মোবাইল:</b> ${safeVal(x.phone)}</div>
        <div><b>এমপিও ইনডেক্স:</b> ${safeVal(x.mpo_index_no)}</div>
      </div>
    </div>
  </div>

  <!-- ১. পরিচয় ও পরিবার -->
  <div class="sec-title"><span>👤 ১. পরিচয় ও পরিবারের বিবরণ</span><small>ধাপ ১</small></div>
  <table class="table-info">
    <tr>
      <td class="lbl">Employee ID:</td>
      <td class="val"><b>${safeVal(x.employee_id)}</b></td>
      <td class="lbl">নাম (বাংলা):</td>
      <td class="val"><b>${safeVal(x.name_bn)}</b></td>
    </tr>
    <tr>
      <td class="lbl">নাম (ইংরেজি):</td>
      <td class="val">${safeVal(x.name_en)}</td>
      <td class="lbl">জন্ম তারিখ:</td>
      <td class="val">${safeVal(x.extended_profile?.dob || x.date_of_birth)}</td>
    </tr>
    <tr>
      <td class="lbl">লিঙ্গ:</td>
      <td class="val">${safeVal(x.gender)}</td>
      <td class="lbl">জাতীয় পরিচয়পত্র (NID):</td>
      <td class="val">${safeVal(x.nid_no)}</td>
    </tr>
    <tr>
      <td class="lbl">TIN নম্বর:</td>
      <td class="val">${safeVal(x.tin_no)}</td>
      <td class="lbl">জন্ম নিবন্ধন নম্বর:</td>
      <td class="val">${safeVal(x.birth_registration_no)}</td>
    </tr>
    <tr>
      <td class="lbl">রক্তের গ্রুপ:</td>
      <td class="val"><b>${safeVal(x.blood_group)}</b></td>
      <td class="lbl">ধর্ম:</td>
      <td class="val">${safeVal(x.religion || 'ইসলাম')}</td>
    </tr>
    <tr>
      <td class="lbl">বৈবাহিক অবস্থা:</td>
      <td class="val">${safeVal(x.marital_status)}</td>
      <td class="lbl">জাতীয়তা:</td>
      <td class="val">${safeVal(x.nationality || 'বাংলাদেশী')}</td>
    </tr>
    <tr>
      <td class="lbl">পিতার নাম (বাংলা):</td>
      <td class="val">${safeVal(x.father_name_bn)}</td>
      <td class="lbl">পিতার নাম (ইংরেজি):</td>
      <td class="val">${safeVal(x.father_name_en)}</td>
    </tr>
    <tr>
      <td class="lbl">মাতার নাম (বাংলা):</td>
      <td class="val">${safeVal(x.mother_name_bn)}</td>
      <td class="lbl">মাতার নাম (ইংরেজি):</td>
      <td class="val">${safeVal(x.mother_name_en)}</td>
    </tr>
  </table>

  <!-- ২. চাকরি ও MPO -->
  <div class="sec-title"><span>💼 ২. চাকরি ও MPO সংক্রান্ত বিবরণ</span><small>ধাপ ২</small></div>
  <table class="table-info">
    <tr>
      <td class="lbl">পদবী (Designation):</td>
      <td class="val"><b>${safeVal(x.designation)}</b></td>
      <td class="lbl">Designation (English):</td>
      <td class="val">${safeVal(x.designation_en)}</td>
    </tr>
    <tr>
      <td class="lbl">মূল বিষয় (Subject):</td>
      <td class="val"><b>${safeVal(x.subject)}</b></td>
      <td class="lbl">বর্তমান অবস্থা (Status):</td>
      <td class="val"><b>${statusBn(x.status)}</b></td>
    </tr>
    <tr>
      <td class="lbl">১ম যোগদানের তারিখ:</td>
      <td class="val">${safeVal(x.first_joining_date)}</td>
      <td class="lbl">১ম এমপিওভুক্তির তারিখ:</td>
      <td class="val">${safeVal(x.first_mpo_date)}</td>
    </tr>
    <tr>
      <td class="lbl">বর্তমান পদে যোগদানের তারিখ:</td>
      <td class="val">${safeVal(x.current_post_joining_date || x.joining_date)}</td>
      <td class="lbl">বর্তমান পদে এমপিও তারিখ:</td>
      <td class="val">${safeVal(x.current_mpo_date)}</td>
    </tr>
    <tr>
      <td class="lbl">অত্র প্রতিষ্ঠানে যোগদানের তারিখ:</td>
      <td class="val">${safeVal(x.previous_institution_joining_date)}</td>
      <td class="lbl">অত্র প্রতিষ্ঠানে এমপিও তারিখ:</td>
      <td class="val">${safeVal(x.previous_institution_mpo_date)}</td>
    </tr>
    <tr>
      <td class="lbl">নিয়োগের তারিখ:</td>
      <td class="val">${safeVal(x.appointment_date)}</td>
      <td class="lbl">নিয়োগকারী কর্তৃপক্ষ:</td>
      <td class="val">${safeVal(x.appointment_authority)}</td>
    </tr>
    <tr>
      <td class="lbl">এমপিও কোড / ইনডেক্স নম্বর:</td>
      <td class="val" colspan="3"><b>${safeVal(x.mpo_index_no)}</b></td>
    </tr>
  </table>

  <!-- ৩. শিক্ষাগত যোগ্যতার বিবরণ -->
  <div class="sec-title"><span>🎓 ৩. শিক্ষাগত যোগ্যতার বিবরণ</span><small>ধাপ ৩</small></div>
  <table class="table-grid">
    <thead>
      <tr>
        <th style="width:35px" class="c">ক্র.নং</th>
        <th style="width:130px">পরীক্ষার নাম</th>
        <th>শিক্ষা প্রতিষ্ঠান</th>
        <th>বোর্ড / বিশ্ববিদ্যালয়</th>
        <th>গ্রুপ / বিষয়</th>
        <th style="width:65px" class="c">পাশের সন</th>
        <th style="width:75px" class="c">ফলাফল / GPA</th>
      </tr>
    </thead>
    <tbody>
      ${eduList && eduList.length ? eduList.map((ed, idx) => `
        <tr>
          <td class="c">${idx + 1}</td>
          <td><b>${safeVal(ed.exam)}</b></td>
          <td>${safeVal(ed.institution)}</td>
          <td>${safeVal(ed.board)}</td>
          <td>${safeVal(ed.subject)}</td>
          <td class="c"><b>${safeVal(ed.year)}</b></td>
          <td class="c">${safeVal(ed.result)}</td>
        </tr>
      `).join('') : '<tr><td colspan="7" class="c" style="color:#64748b;padding:8px">কোনো শিক্ষাগত যোগ্যতার তথ্য পাওয়া যায়নি</td></tr>'}
    </tbody>
  </table>

  <!-- ৪. পেশাগত যোগ্যতার বিবরণ -->
  <div class="sec-title"><span>📜 ৪. পেশাগত যোগ্যতার বিবরণ</span><small>ধাপ ৪</small></div>
  <table class="table-grid">
    <thead>
      <tr>
        <th style="width:35px" class="c">ক্র.নং</th>
        <th style="width:130px">পেশাগত ডিগ্রী</th>
        <th>শিক্ষা প্রতিষ্ঠান</th>
        <th>বোর্ড / বিশ্ববিদ্যালয়</th>
        <th>গ্রুপ / বিষয়</th>
        <th style="width:65px" class="c">পাশের সন</th>
        <th style="width:75px" class="c">ফলাফল / GPA</th>
      </tr>
    </thead>
    <tbody>
      ${profList && profList.length ? profList.map((pr, idx) => `
        <tr>
          <td class="c">${idx + 1}</td>
          <td><b>${safeVal(pr.exam)}</b></td>
          <td>${safeVal(pr.institution)}</td>
          <td>${safeVal(pr.board)}</td>
          <td>${safeVal(pr.subject)}</td>
          <td class="c"><b>${safeVal(pr.year)}</b></td>
          <td class="c">${safeVal(pr.result)}</td>
        </tr>
      `).join('') : '<tr><td colspan="7" class="c" style="color:#64748b;padding:8px">কোনো পেশাগত যোগ্যতার তথ্য সংরক্ষিত নেই</td></tr>'}
    </tbody>
  </table>

  <!-- ৫. প্রশিক্ষণের বিবরণ -->
  <div class="sec-title"><span>📚 ৫. প্রশিক্ষণের বিবরণ (আইসিটি ও কর্মকালীন)</span><small>ধাপ ৫</small></div>
  <div class="sec-sub">🔹 ৫.১ আইসিটি প্রশিক্ষণ (ICT Training)</div>
  <table class="table-grid">
    <thead>
      <tr>
        <th style="width:35px" class="c">ক্র.নং</th>
        <th style="width:140px">প্রশিক্ষণের শিরোনাম</th>
        <th>প্রশিক্ষণের বিষয়</th>
        <th>স্থান / প্রতিষ্ঠান</th>
        <th>অবস্থান</th>
        <th style="width:75px" class="c">শুরুর তারিখ</th>
        <th style="width:75px" class="c">শেষের তারিখ</th>
        <th style="width:75px" class="c">স্থিতিকাল</th>
      </tr>
    </thead>
    <tbody>
      ${ictTrainingList && ictTrainingList.length ? ictTrainingList.map((tr, idx) => `
        <tr>
          <td class="c">${idx + 1}</td>
          <td><b>${safeVal(tr.title || tr.name)}</b></td>
          <td>${safeVal(tr.subject)}</td>
          <td>${safeVal(tr.institution || tr.place)}</td>
          <td>${safeVal(tr.location)}</td>
          <td class="c">${safeVal(tr.start_date)}</td>
          <td class="c">${safeVal(tr.end_date)}</td>
          <td class="c">${safeVal(tr.duration)}</td>
        </tr>
      `).join('') : '<tr><td colspan="8" class="c" style="color:#64748b;padding:6px">কোনো আইসিটি প্রশিক্ষণ রেকর্ড পাওয়া যায়নি</td></tr>'}
    </tbody>
  </table>

  <div class="sec-sub">🔹 ৫.২ কর্মকালীন বিভিন্ন প্রশিক্ষণ (In-service Training)</div>
  <table class="table-grid">
    <thead>
      <tr>
        <th style="width:35px" class="c">ক্র.নং</th>
        <th style="width:140px">প্রশিক্ষণের শিরোনাম</th>
        <th>প্রশিক্ষণের বিষয়</th>
        <th>স্থান / প্রতিষ্ঠান</th>
        <th>অবস্থান</th>
        <th style="width:75px" class="c">শুরুর তারিখ</th>
        <th style="width:75px" class="c">শেষের তারিখ</th>
        <th style="width:75px" class="c">স্থিতিকাল</th>
      </tr>
    </thead>
    <tbody>
      ${inServiceList && inServiceList.length ? inServiceList.map((tr, idx) => `
        <tr>
          <td class="c">${idx + 1}</td>
          <td><b>${safeVal(tr.title || tr.name)}</b></td>
          <td>${safeVal(tr.subject)}</td>
          <td>${safeVal(tr.institution || tr.place)}</td>
          <td>${safeVal(tr.location)}</td>
          <td class="c">${safeVal(tr.start_date)}</td>
          <td class="c">${safeVal(tr.end_date)}</td>
          <td class="c">${safeVal(tr.duration)}</td>
        </tr>
      `).join('') : '<tr><td colspan="8" class="c" style="color:#64748b;padding:6px">কোনো কর্মকালীন প্রশিক্ষণ রেকর্ড পাওয়া যায়নি</td></tr>'}
    </tbody>
  </table>

  <table class="table-info" style="margin-top:4px">
    <tr>
      <td class="lbl">শিক্ষক বাতায়ন ID:</td>
      <td class="val">${safeVal(x.teacher_portal_id)}</td>
      <td class="lbl">অতিরিক্ত পেশাগত তথ্য:</td>
      <td class="val">${safeVal(x.extended_profile?.professional_note)}</td>
    </tr>
  </table>

  <!-- ৬. নিবন্ধন / NTRCA ও যোগাযোগ -->
  <div class="sec-title"><span>📝 ৬. নিবন্ধন/NTRCA ও যোগাযোগের বিবরণ</span><small>ধাপ ৬</small></div>
  <table class="table-info">
    <tr>
      <td class="lbl">শিক্ষক নিবন্ধন নম্বর:</td>
      <td class="val"><b>${safeVal(x.teacher_registration_no)}</b></td>
      <td class="lbl">নিবন্ধনের তারিখ:</td>
      <td class="val">${safeVal(x.registration_date)}</td>
    </tr>
    <tr>
      <td class="lbl">NTRCA নিবন্ধিত?</td>
      <td class="val">${safeVal(ntrca.registered)}</td>
      <td class="lbl">NTRCA সুপারিশপ্রাপ্ত?</td>
      <td class="val">${safeVal(ntrca.recommended)}</td>
    </tr>
    <tr>
      <td class="lbl">নিবন্ধন/সুপারিশের সন:</td>
      <td class="val">${safeVal(ntrca.year)}</td>
      <td class="lbl">NTRCA বিষয়:</td>
      <td class="val">${safeVal(ntrca.subject)}</td>
    </tr>
    <tr>
      <td class="lbl">NTRCA মন্তব্য:</td>
      <td class="val" colspan="3">${safeVal(ntrca.remarks)}</td>
    </tr>
    <tr>
      <td class="lbl">মোবাইল নম্বর:</td>
      <td class="val"><b>${safeVal(x.phone)}</b></td>
      <td class="lbl">WhatsApp নম্বর:</td>
      <td class="val">${safeVal(x.whatsapp_no)}</td>
    </tr>
    <tr>
      <td class="lbl">ই-মেইল ঠিকানা:</td>
      <td class="val">${safeVal(x.email)}</td>
      <td class="lbl">বর্তমান ঠিকানা:</td>
      <td class="val">${safeVal(x.address)}</td>
    </tr>
    <tr>
      <td class="lbl">স্থায়ী ঠিকানা:</td>
      <td class="val" colspan="3">${safeVal(x.permanent_address)}</td>
    </tr>
  </table>

  <div class="signatures">
    <div class="sig-box">সংশ্লিষ্ট শিক্ষক/কর্মচারীর স্বাক্ষর ও তারিখ</div>
    <div class="sig-box">সহকারী প্রধান শিক্ষকের স্বাক্ষর</div>
    <div class="sig-box">প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
    w.document.write(content);
    w.document.close();
  };

  const saveInline = async (x) => {
    if (!inlineForm.name_bn?.trim()) {
      setMsg('নাম আবশ্যিক');
      return;
    }
    try {
      const base = isTeacher ? 'teachers' : 'staff';
      const updated = {
        ...x,
        name_bn: inlineForm.name_bn.trim(),
        designation: inlineForm.designation?.trim() || x.designation,
        ...(isTeacher ? { subject: inlineForm.subject?.trim() || x.subject } : {}),
        phone: inlineForm.phone?.trim() || x.phone,
        status: inlineForm.status || x.status || 'active'
      };
      await api(`/${base}/${x.id}`, { method: 'PUT', body: JSON.stringify(updated) });
      setMsg(`✅ ${updated.name_bn}-এর তথ্য সফলভাবে সংরক্ষিত হয়েছে`);
      setInlineEditId(null);
      load();
    } catch (err) {
      setMsg(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

 const switchTab=(t, v)=>{
  setTab(t);
  if(v) setView(v);
  setEditing(null);
  setInlineEditId(null);
  setForm(initNewForm(t));
  setStep(0);
 };

 const steps=[['👤','পরিচয় ও পরিবার'],['💼','চাকরি ও MPO'],['🎓','শিক্ষাগত যোগ্যতার বিবরণ'],['📜','পেশাগত যোগ্যতার বিবরণ'],['📚','প্রশিক্ষণ'],['📝','নিবন্ধন/NTRCA'],['📞','যোগাযোগ']];

 return <div>
  <div className="tabs" style={{marginBottom:'16px'}}>
   <button type="button" className={isTeacher&&view==='list'?'active':''} onClick={()=>switchTab('teachers','list')}>👨‍🏫 শিক্ষকবৃন্দ তালিকা ({teachers.length})</button>
   <button type="button" className={isTeacher&&view==='form'?'active':''} onClick={()=>switchTab('teachers','form')}>➕ {isTeacher&&editing?'শিক্ষক তথ্য সম্পাদনা':'নতুন শিক্ষক এন্ট্রি'}</button>
    <button type="button" className={isTeacher&&view==='voter'?'active':''} onClick={()=>switchTab('teachers','voter')}>🗳️ শিক্ষক ভোটার তালিকা ({voterTeachers.length})</button>
   <button type="button" className={!isTeacher&&view==='list'?'active':''} onClick={()=>switchTab('staff','list')}>🧑‍💼 কর্মচারীবৃন্দ তালিকা ({staff.length})</button>
   <button type="button" className={!isTeacher&&view==='form'?'active':''} onClick={()=>switchTab('staff','form')}>➕ {!isTeacher&&editing?'কর্মচারী তথ্য সম্পাদনা':'নতুন কর্মচারী এন্ট্রি'}</button>
  </div>

  {view==='form' && (
   <div className="form-card modern-form full-form-v90">
    <div className="form-head">
     <div>
      <span className="eyebrow">TEACHER & STAFF MANAGEMENT • V91</span>
      <h2>{editing?'তথ্য সম্পাদনা':isTeacher?'নতুন শিক্ষক এন্ট্রি ফরম':'নতুন কর্মচারী এন্ট্রি ফরম'}</h2>
      <p>আপনার দেওয়া ১ নম্বর ফরমের field-গুলো ধাপে ধাপে সাজানো হয়েছে।</p>
     </div>
     <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
      <button className="mini" type="button" onClick={()=>{setEditing(null);setForm(isTeacher?{...emptyTeacher}:{...emptyStaff});setStep(0);setView('list');}}>📋 তালিকায় ফিরুন</button>
      <button className="mini" type="button" onClick={downloadPeopleTemplate}>⬇ Template CSV</button>
      <label className="mini" style={{cursor:'pointer'}}>⬆ {isTeacher?'শিক্ষক':'কর্মচারী'} CSV আপলোড<input type="file" accept=".csv,text/csv" hidden onChange={importPeople}/></label>
     </div>
    </div>
    <div className="step-tabs">
     {steps.map((x,i)=><button type="button" key={x[0]} className={step===i?'active':''} onClick={()=>setStep(i)}><span>{x[0]}</span>{i+1}. {x[1]}</button>)}
    </div>
    <form onSubmit={save} className="form-grid">
     {step===0&&<><div className="form-section-title full"><b>ব্যক্তিগত পরিচয়</b></div><div className="field"><label>Employee ID *</label><input value={form.employee_id||''} onChange={e=>change('employee_id',e.target.value)} required disabled={!!editing}/></div><div className="field"><label>নাম (বাংলা) *</label><input value={form.name_bn||''} onChange={e=>change('name_bn',e.target.value)} required/></div><div className="field"><label>নাম (ইংরেজি)</label><input value={form.name_en||''} onChange={e=>change('name_en',e.target.value)}/></div><div className="field"><label>জন্ম তারিখ</label><input type="date" value={form.extended_profile?.dob||form.joining_date||''} onChange={e=>ext('dob',e.target.value)}/></div><div className="field"><label>লিঙ্গ</label><select value={form.gender||''} onChange={e=>change('gender',e.target.value)}><option value="">নির্বাচন করুন</option><option>পুরুষ</option><option>নারী</option><option>অন্যান্য</option></select></div><div className="field"><label>জাতীয় পরিচয়পত্র নম্বর</label><input value={form.nid_no||''} onChange={e=>change('nid_no',e.target.value)}/></div><div className="field"><label>TIN নম্বর</label><input value={form.tin_no||''} onChange={e=>change('tin_no',e.target.value)}/></div><div className="field"><label>জন্ম নিবন্ধন নম্বর</label><input value={form.birth_registration_no||''} onChange={e=>change('birth_registration_no',e.target.value)}/></div><div className="field"><label>রক্তের গ্রুপ</label><input value={form.blood_group||''} onChange={e=>change('blood_group',e.target.value)}/></div><div className="field"><label>ধর্ম</label><select value={form.religion||'ইসলাম'} onChange={e=>change('religion',e.target.value)}><option value="ইসলাম">ইসলাম</option><option value="হিন্দু">হিন্দু</option><option value="বৌদ্ধ">বৌদ্ধ</option><option value="খ্রিষ্টান">খ্রিষ্টান</option><option value="অন্যান্য">অন্যান্য</option></select></div><div className="field"><label>বৈবাহিক অবস্থা</label><select value={form.marital_status||''} onChange={e=>change('marital_status',e.target.value)}><option value="">নির্বাচন করুন</option><option>অবিবাহিত</option><option>বিবাহিত</option><option>বিধবা/বিপত্নীক</option><option>তালাকপ্রাপ্ত</option></select></div><div className="field"><label>জাতীয়তা</label><input value={form.nationality||'বাংলাদেশী'} onChange={e=>change('nationality',e.target.value)}/></div><div className="form-section-title full"><b>পিতা ও মাতার তথ্য</b></div>{[['father_name_bn','পিতার নাম (বাংলা)'],['father_name_en','পিতার নাম (ইংরেজি)'],['mother_name_bn','মাতার নাম (বাংলা)'],['mother_name_en','মাতার নাম (ইংরেজি)']].map(([k,l])=><div className="field" key={k}><label>{l}</label><input value={form[k]||''} onChange={e=>change(k,e.target.value)}/></div>)}</>}
     {step===1&&<><div className="form-section-title full"><b>পেশাগত/চাকরির তথ্য</b></div><div className="field"><label>পদবী *</label><input value={form.designation||''} onChange={e=>change('designation',e.target.value)} required/></div>{isTeacher&&<><div className="field"><label>English Designation</label><input value={form.designation_en||''} onChange={e=>change('designation_en',e.target.value)}/></div><div className="field"><label>মূল বিষয়</label><input value={form.subject||''} onChange={e=>change('subject',e.target.value)}/></div></>}<div className="field"><label>১ম যোগদানের তারিখ</label><input type="date" value={form.first_joining_date||''} onChange={e=>change('first_joining_date',e.target.value)}/></div><div className="field"><label>১ম এমপিওভুক্তির তারিখ</label><input type="date" value={form.first_mpo_date||''} onChange={e=>change('first_mpo_date',e.target.value)}/></div><div className="field"><label>বর্তমান পদে যোগদানের তারিখ</label><input type="date" value={form.current_post_joining_date||form.joining_date||''} onChange={e=>{change('current_post_joining_date',e.target.value);change('joining_date',e.target.value)}}/></div>{isTeacher&&<div className="field"><label>বর্তমান পদে এমপিও তারিখ</label><input type="date" value={form.current_mpo_date||''} onChange={e=>change('current_mpo_date',e.target.value)}/></div>}<div className="field"><label>অত্র প্রতিষ্ঠানে যোগদানের তারিখ</label><input type="date" value={form.previous_institution_joining_date||''} onChange={e=>change('previous_institution_joining_date',e.target.value)}/></div>{isTeacher&&<div className="field"><label>অত্র প্রতিষ্ঠানে এমপিও তারিখ</label><input type="date" value={form.previous_institution_mpo_date||''} onChange={e=>change('previous_institution_mpo_date',e.target.value)}/></div>}<div className="field"><label>নিয়োগের তারিখ</label><input type="date" value={form.appointment_date||''} onChange={e=>change('appointment_date',e.target.value)}/></div><div className="field"><label>নিয়োগকারী কর্তৃপক্ষ</label><input value={form.appointment_authority||''} onChange={e=>change('appointment_authority',e.target.value)}/></div>{isTeacher&&<div className="field"><label>এমপিও কোড/ইনডেক্স নম্বর</label><input value={form.mpo_index_no||''} onChange={e=>change('mpo_index_no',e.target.value)}/></div>}<div className="field"><label>অবস্থা</label><select value={form.status||'active'} onChange={e=>change('status',e.target.value)}>{(isTeacher?['active','inactive','retired','former']:['active','inactive']).map(x=><option key={x} value={x}>{statusBn(x)}</option>)}</select></div></>}
     {step===2&&<><div className="form-section-title full"><b>শিক্ষাগত যোগ্যতার বিবরণ</b><button type="button" className="mini" onClick={()=>addRow('education')}>+ নতুন শিক্ষাগত যোগ্যতা</button></div>{(form.extended_profile?.education||[]).map((r,i)=><div className="repeat-card full" key={i} style={{background:r.is_saved?'#f0fdf4':'#fbfdff',border:r.is_saved?'1px solid #bbf7d0':'1px solid #dfe8f2'}}><select value={r.exam||''} onChange={e=>updateRow('education',i,'exam',e.target.value)} disabled={!!r.is_saved} style={{padding:'8px 10px',borderRadius:'8px',border:'1px solid #cbd5e1',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',minWidth:0,width:'100%'}}><option value="">পরীক্ষার নাম নির্বাচন</option><option value="এসএসসি/সমমান">এসএসসি/সমমান</option><option value="এইচএসসি/সমমান">এইচএসসি/সমমান</option><option value="স্নাতক (পাস)/সমমান">স্নাতক (পাস)/সমমান</option><option value="স্নাতক সম্মান(৩ বছর মেয়াদী)">স্নাতক সম্মান(৩ বছর মেয়াদী)</option><option value="স্নাতক সম্মান(৪ বছর মেয়াদী)">স্নাতক সম্মান(৪ বছর মেয়াদী)</option><option value="স্নাতকোত্তর (অনার্সসহ)">স্নাতকোত্তর (অনার্সসহ)</option><option value="স্নাতকোত্তর (অনার্সবিহীন)">স্নাতকোত্তর (অনার্সবিহীন)</option><option value="কামিল">কামিল</option>{r.exam&&!['এসএসসি/সমমান','এইচএসসি/সমমান','স্নাতক (পাস)/সমমান','স্নাতক সম্মান(৩ বছর মেয়াদী)','স্নাতক সম্মান(৪ বছর মেয়াদী)','স্নাতকোত্তর (অনার্সসহ)','স্নাতকোত্তর (অনার্সবিহীন)','কামিল'].includes(r.exam)&&<option value={r.exam}>{r.exam}</option>}</select><input placeholder="প্রতিষ্ঠান" value={r.institution||''} onChange={e=>updateRow('education',i,'institution',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="বোর্ড/বিশ্ববিদ্যালয়" value={r.board||''} onChange={e=>updateRow('education',i,'board',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="গ্রুপ/বিষয়" value={r.subject||''} onChange={e=>updateRow('education',i,'subject',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="পাশের সন" value={r.year||''} onChange={e=>updateRow('education',i,'year',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="ফলাফল/GPA" value={r.result||''} onChange={e=>updateRow('education',i,'result',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><div style={{display:'inline-flex',alignItems:'center',gap:'4px',whiteSpace:'nowrap',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setEduSaved(i,true)} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setEduSaved(i,false)} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('education',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></div>)}{!(form.extended_profile?.education||[]).length&&<p className="portal-muted full">+ নতুন শিক্ষাগত যোগ্যতা চাপলে SSC/HSC/স্নাতক/স্নাতকোত্তরসহ যত খুশি শিক্ষাগত যোগ্যতার রেকর্ড যোগ করা যাবে।</p>}</>}
     {step===3&&<><div className="form-section-title full"><b>পেশাগত যোগ্যতার বিবরণ</b><button type="button" className="mini" onClick={()=>addRow('professional_qualifications')}>+ নতুন পেশাগত যোগ্যতা</button></div>{(form.extended_profile?.professional_qualifications||[]).map((r,i)=><div className="repeat-card full" key={i} style={{background:r.is_saved?'#f0fdf4':'#fbfdff',border:r.is_saved?'1px solid #bbf7d0':'1px solid #dfe8f2'}}><select value={r.exam||''} onChange={e=>updateRow('professional_qualifications',i,'exam',e.target.value)} disabled={!!r.is_saved} style={{padding:'8px 10px',borderRadius:'8px',border:'1px solid #cbd5e1',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',minWidth:0,width:'100%'}}><option value="">পেশাগত ডিগ্রী</option><option value="বিএড">বিএড</option><option value="এমএড">এমএড</option><option value="বিপিএড">বিপিএড</option><option value="বিএজিএড">বিএজিএড</option><option value="ডিপইনএড">ডিপইনএড</option><option value="ডিপ্লোমা">ডিপ্লোমা</option><option value="ডিপ্লোমা ইন লাইব্রেরি অ্যান্ড ইনফরমেসন সাইন্স">ডিপ্লোমা ইন লাইব্রেরি অ্যান্ড ইনফরমেসন সাইন্স</option>{r.exam&&!['বিএড','এমএড','বিপিএড','বিএজিএড','ডিপইনএড','ডিপ্লোমা','ডিপ্লোমা ইন লাইব্রেরি অ্যান্ড ইনফরমেসন সাইন্স'].includes(r.exam)&&<option value={r.exam}>{r.exam}</option>}</select><input placeholder="প্রতিষ্ঠান" value={r.institution||''} onChange={e=>updateRow('professional_qualifications',i,'institution',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="বোর্ড/বিশ্ববিদ্যালয়" value={r.board||''} onChange={e=>updateRow('professional_qualifications',i,'board',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="গ্রুপ/বিষয়" value={r.subject||''} onChange={e=>updateRow('professional_qualifications',i,'subject',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="পাশের সন" value={r.year||''} onChange={e=>updateRow('professional_qualifications',i,'year',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="ফলাফল/GPA" value={r.result||''} onChange={e=>updateRow('professional_qualifications',i,'result',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><div style={{display:'inline-flex',alignItems:'center',gap:'4px',whiteSpace:'nowrap',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setProfEduSaved(i,true)} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setProfEduSaved(i,false)} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('professional_qualifications',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></div>)}{!(form.extended_profile?.professional_qualifications||[]).length&&<p className="portal-muted full">+ নতুন পেশাগত যোগ্যতা চাপলে B.Ed/M.Ed/ডিপ্লোমাসহ যত খুশি পেশাগত যোগ্যতার রেকর্ড যোগ করা যাবে।</p>}</>}
     {step===4&&<>
     {/* ১. আইসিটি প্রশিক্ষণ টেবিল */}
     <div className="form-section-title full" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><b>আইসিটি প্রশিক্ষণ</b><span style={{marginLeft:'10px',fontSize:'12px',color:'#64748b'}}>({(form.extended_profile?.training||[]).length}টি রেকর্ড)</span></div>
      <button type="button" className="mini" style={{background:'#0284c7',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600}} onClick={()=>addRow('training')}>+ আইসিটি প্রশিক্ষণ যোগ করুন</button>
     </div>
     <div className="full" style={{overflowX:'auto',border:'1px solid #cbd5e1',borderRadius:'10px',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',margin:'6px 0 10px'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'1220px'}}>
       <thead>
        <tr style={{background:'#f1f5f9',borderBottom:'2px solid #cbd5e1',color:'#1e293b'}}>
         <th style={{padding:'10px 8px',width:'60px',textAlign:'center',whiteSpace:'nowrap'}}>ক্রমিক নং</th>
         <th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>শিরোনাম *</th>
         <th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণের বিষয়</th>
         <th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ গ্রহণের স্থান/প্রতিষ্ঠান</th>
         <th style={{padding:'10px 8px',minWidth:'110px',textAlign:'left',whiteSpace:'nowrap'}}>অবস্থান</th>
         <th style={{padding:'10px 8px',width:'140px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ শুরু তারিখ</th>
         <th style={{padding:'10px 8px',width:'140px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ শেষের তারিখ</th>
         <th style={{padding:'10px 8px',width:'120px',textAlign:'left',whiteSpace:'nowrap'}}>স্থিতিকাল (অটো)</th>
         <th style={{padding:'10px 8px',width:'210px',minWidth:'200px',textAlign:'center',whiteSpace:'nowrap'}}>কাজ (সংরক্ষণ • সম্পাদনা • মুছুন)</th>
        </tr>
       </thead>
       <tbody>
        {(form.extended_profile?.training||[]).map((r,i)=><tr key={i} style={{borderBottom:'1px solid #e2e8f0',background:r.is_saved?'#f0fdf4':(i%2===0?'#ffffff':'#f8fafc')}}>
         <td style={{padding:'8px 6px',textAlign:'center'}}><input style={{width:'100%',padding:'6px 2px',textAlign:'center',fontWeight:700,border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#dcfce7':'#f1f5f9'}} value={r.sl_no??(i+1)} onChange={e=>updateTrainingField(i,'sl_no',e.target.value)} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><select style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',color:'#0f172a'}} value={r.title||r.name||''} onChange={e=>{updateTrainingField(i,'title',e.target.value);updateTrainingField(i,'name',e.target.value);}} required disabled={!!r.is_saved}><option value="">প্রশিক্ষণের শিরোনাম নির্বাচন</option><option value="কম্পিউটার">কম্পিউটার</option><option value="আইসিটি">আইসিটি</option><option value="আইসিটি (মাস্টার ট্রেইনার)">আইসিটি (মাস্টার ট্রেইনার)</option><option value="বেসিক টিচার্স ট্রেনিং (BTT)">বেসিক টিচার্স ট্রেনিং (BTT)</option><option value="অন্যান্য (আইসিটি সংশ্লিষ্ট)">অন্যান্য (আইসিটি সংশ্লিষ্ট)</option>{(r.title||r.name)&&!['কম্পিউটার','আইসিটি','আইসিটি (মাস্টার ট্রেইনার)','বেসিক টিচার্স ট্রেনিং (BTT)','অন্যান্য (আইসিটি সংশ্লিষ্ট)'].includes(r.title||r.name)&&<option value={r.title||r.name}>{r.title||r.name}</option>}</select></td>
         <td style={{padding:'8px 6px'}}><select style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',color:'#0f172a'}} value={r.subject||''} onChange={e=>updateTrainingField(i,'subject',e.target.value)} disabled={!!r.is_saved}><option value="">প্রশিক্ষণের বিষয় নির্বাচন</option><option value="ডিজিটাল কনটেন্ট ডেভলপমেন্ট">ডিজিটাল কনটেন্ট ডেভলপমেন্ট</option><option value="ডিজিটাল কনটেন্ট ডেভলপমেন্ট (ফলোআপ ট্রেনিং)">ডিজিটাল কনটেন্ট ডেভলপমেন্ট (ফলোআপ ট্রেনিং)</option><option value="হার্ডওয়্যার এন্ড ট্রাবলশুটিং">হার্ডওয়্যার এন্ড ট্রাবলশুটিং</option><option value="হার্ডওয়্যার নেটওয়ার্ক এন্ড ট্রাবলশুটিং">হার্ডওয়্যার নেটওয়ার্ক এন্ড ট্রাবলশুটিং</option><option value="নেটওয়ার্কিং এন্ড প্রোগ্রামিং">নেটওয়ার্কিং এন্ড প্রোগ্রামিং</option><option value="বেসিক আইসিটি ট্রেনিং">বেসিক আইসিটি ট্রেনিং</option><option value="বিষয়ভিত্তিক প্রশিক্ষণ (আইসিটি)">বিষয়ভিত্তিক প্রশিক্ষণ (আইসিটি)</option><option value="শেখ রাসেল ডিজিটাল ল্যাব পরিচালনা">শেখ রাসেল ডিজিটাল ল্যাব পরিচালনা</option><option value="ইন্টারেক্টিভ টিচিং এন্ড লাইভ ক্লাস ম্যানেজমেন্ট">ইন্টারেক্টিভ টিচিং এন্ড লাইভ ক্লাস ম্যানেজমেন্ট</option><option value="কম্পিউটার অপারেশন এবংব্যবহার">কম্পিউটার অপারেশন এবংব্যবহার</option><option value="(ডিজিটাল কনটেন্ট ডেভলপমেন্ট, মুক্তপাঠ, শিক্ষক বাতায়ন, গুগলড্রাইভ ইত্যাদী)">(ডিজিটাল কনটেন্ট ডেভলপমেন্ট, মুক্তপাঠ, শিক্ষক বাতায়ন, গুগলড্রাইভ ইত্যাদী)</option>{r.subject&&!['ডিজিটাল কনটেন্ট ডেভলপমেন্ট','ডিজিটাল কনটেন্ট ডেভলপমেন্ট (ফলোআপ ট্রেনিং)','হার্ডওয়্যার এন্ড ট্রাবলশুটিং','হার্ডওয়্যার নেটওয়ার্ক এন্ড ট্রাবলশুটিং','নেটওয়ার্কিং এন্ড প্রোগ্রামিং','বেসিক আইসিটি ট্রেনিং','বিষয়ভিত্তিক প্রশিক্ষণ (আইসিটি)','শেখ রাসেল ডিজিটাল ল্যাব পরিচালনা','ইন্টারেক্টিভ টিচিং এন্ড লাইভ ক্লাস ম্যানেজমেন্ট','কম্পিউটার অপারেশন এবংব্যবহার','(ডিজিটাল কনটেন্ট ডেভলপমেন্ট, মুক্তপাঠ, শিক্ষক বাতায়ন, গুগলড্রাইভ ইত্যাদী)'].includes(r.subject)&&<option value={r.subject}>{r.subject}</option>}</select></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="স্থান/প্রতিষ্ঠান" value={r.institution||r.place||''} onChange={e=>updateTrainingField(i,'institution',e.target.value)} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="অবস্থান" value={r.location||''} onChange={e=>updateTrainingField(i,'location',e.target.value)} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input type="date" style={{width:'100%',padding:'5px 4px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} value={r.start_date||''} onChange={e=>updateTrainingField(i,'start_date',e.target.value)} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input type="date" style={{width:'100%',padding:'5px 4px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} value={r.end_date||''} onChange={e=>updateTrainingField(i,'end_date',e.target.value)} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:'#f1f5f9',fontWeight:600,color:'#166534'}} placeholder="অটো স্থিতিকাল" value={r.duration||''} onChange={e=>updateTrainingField(i,'duration',e.target.value)} title="শুরু ও শেষের তারিখ দিলে স্বয়ংক্রিয়ভাবে হিসাব হবে" disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px',textAlign:'center',whiteSpace:'nowrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'4px',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setTrainingSaved(i,true)} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setTrainingSaved(i,false)} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('training',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></td>
        </tr>)}
        {!(form.extended_profile?.training||[]).length&&<tr><td colSpan="9" style={{padding:'20px',textAlign:'center',color:'#64748b'}}>কোনো আইসিটি প্রশিক্ষণ রেকর্ড যুক্ত করা হয়নি। <button type="button" className="mini" style={{marginLeft:'8px',background:'#0284c7',color:'#fff',border:'none',padding:'5px 12px',borderRadius:'4px'}} onClick={()=>addRow('training')}>+ প্রথম আইসিটি প্রশিক্ষণ যোগ করুন</button></td></tr>}
       </tbody>
      </table>
     </div>
     {(form.extended_profile?.training||[]).length>0&&<div className="full" style={{display:'flex',justifyContent:'flex-end',marginBottom:'14px'}}><button type="button" className="mini" style={{background:'#0284c7',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600}} onClick={()=>addRow('training')}>+ আরও আইসিটি প্রশিক্ষণ যোগ করুন</button></div>}

     {/* ২. কর্মকালীন বিভিন্ন প্রশিক্ষণ টেবিল */}
     <div className="form-section-title full" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'18px'}}>
      <div><b>কর্মকালীন বিভিন্ন প্রশিক্ষণ</b><span style={{marginLeft:'10px',fontSize:'12px',color:'#64748b'}}>({(form.extended_profile?.in_service_training||[]).length}টি রেকর্ড)</span></div>
      <button type="button" className="mini" style={{background:'#0d9488',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600}} onClick={()=>addRow('in_service_training')}>+ কর্মকালীন বিভিন্ন ট্রেনিং যোগ করুন</button>
     </div>
     <div className="full" style={{overflowX:'auto',border:'1px solid #cbd5e1',borderRadius:'10px',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',margin:'6px 0 10px'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'1220px'}}>
       <thead>
        <tr style={{background:'#f0fdfa',borderBottom:'2px solid #99f6e4',color:'#134e4a'}}>
         <th style={{padding:'10px 8px',width:'60px',textAlign:'center',whiteSpace:'nowrap'}}>ক্রমিক নং</th>
         <th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>শিরোনাম *</th>
         <th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণের বিষয়</th>
         <th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ গ্রহণের স্থান/প্রতিষ্ঠান</th>
         <th style={{padding:'10px 8px',minWidth:'110px',textAlign:'left',whiteSpace:'nowrap'}}>অবস্থান</th>
         <th style={{padding:'10px 8px',width:'140px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ শুরু তারিখ</th>
         <th style={{padding:'10px 8px',width:'140px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ শেষের তারিখ</th>
         <th style={{padding:'10px 8px',width:'120px',textAlign:'left',whiteSpace:'nowrap'}}>স্থিতিকাল (অটো)</th>
         <th style={{padding:'10px 8px',width:'210px',minWidth:'200px',textAlign:'center',whiteSpace:'nowrap'}}>কাজ (সংরক্ষণ • সম্পাদনা • মুছুন)</th>
        </tr>
       </thead>
       <tbody>
        {(form.extended_profile?.in_service_training||[]).map((r,i)=><tr key={i} style={{borderBottom:'1px solid #e2e8f0',background:r.is_saved?'#f0fdf4':(i%2===0?'#ffffff':'#f8fafc')}}>
         <td style={{padding:'8px 6px',textAlign:'center'}}><input style={{width:'100%',padding:'6px 2px',textAlign:'center',fontWeight:700,border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#dcfce7':'#f1f5f9'}} value={r.sl_no??(i+1)} onChange={e=>updateTrainingField(i,'sl_no',e.target.value,'in_service_training')} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><select style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',color:'#0f172a'}} value={r.title||r.name||''} onChange={e=>{updateTrainingField(i,'title',e.target.value,'in_service_training');updateTrainingField(i,'name',e.target.value,'in_service_training');}} required disabled={!!r.is_saved}><option value="">প্রশিক্ষণের শিরোনাম নির্বাচন</option>{IN_SERVICE_TITLES_LIST.map(title=><option key={title} value={title}>{title}</option>)}{(r.title||r.name)&&!IN_SERVICE_TITLES_LIST.includes(r.title||r.name)&&<option value={r.title||r.name}>{r.title||r.name}</option>}</select></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',color:'#0f172a'}} placeholder="প্রশিক্ষণের বিষয়" value={r.subject||''} onChange={e=>updateTrainingField(i,'subject',e.target.value,'in_service_training')} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="স্থান/প্রতিষ্ঠান" value={r.institution||r.place||''} onChange={e=>updateTrainingField(i,'institution',e.target.value,'in_service_training')} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="অবস্থান" value={r.location||''} onChange={e=>updateTrainingField(i,'location',e.target.value,'in_service_training')} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input type="date" style={{width:'100%',padding:'5px 4px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} value={r.start_date||''} onChange={e=>updateTrainingField(i,'start_date',e.target.value,'in_service_training')} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input type="date" style={{width:'100%',padding:'5px 4px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} value={r.end_date||''} onChange={e=>updateTrainingField(i,'end_date',e.target.value,'in_service_training')} disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:'#f1f5f9',fontWeight:600,color:'#166534'}} placeholder="অটো স্থিতিকাল" value={r.duration||''} onChange={e=>updateTrainingField(i,'duration',e.target.value,'in_service_training')} title="শুরু ও শেষের তারিখ দিলে স্বয়ংক্রিয়ভাবে হিসাব হবে" disabled={!!r.is_saved}/></td>
         <td style={{padding:'8px 6px',textAlign:'center',whiteSpace:'nowrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'4px',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setTrainingSaved(i,true,'in_service_training')} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setTrainingSaved(i,false,'in_service_training')} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('in_service_training',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></td>
        </tr>)}
        {!(form.extended_profile?.in_service_training||[]).length&&<tr><td colSpan="9" style={{padding:'20px',textAlign:'center',color:'#64748b'}}>কোনো কর্মকালীন প্রশিক্ষণ রেকর্ড যুক্ত করা হয়নি। <button type="button" className="mini" style={{marginLeft:'8px',background:'#0d9488',color:'#fff',border:'none',padding:'5px 12px',borderRadius:'4px'}} onClick={()=>addRow('in_service_training')}>+ প্রথম কর্মকালীন প্রশিক্ষণ যোগ করুন</button></td></tr>}
       </tbody>
      </table>
     </div>
     {(form.extended_profile?.in_service_training||[]).length>0&&<div className="full" style={{display:'flex',justifyContent:'flex-end',marginBottom:'14px'}}><button type="button" className="mini" style={{background:'#0d9488',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600}} onClick={()=>addRow('in_service_training')}>+ আরও কর্মকালীন ট্রেনিং যোগ করুন</button></div>}
     <div className="form-section-title full"><b>শিক্ষক বাতায়ন/অন্যান্য পেশাগত পরিচিতি</b></div>{isTeacher&&<div className="field"><label>শিক্ষক বাতায়ন ID</label><input value={form.teacher_portal_id||''} onChange={e=>change('teacher_portal_id',e.target.value)}/></div>}<div className="field"><label>অতিরিক্ত পেশাগত তথ্য</label><input value={form.extended_profile?.professional_note||''} onChange={e=>ext('professional_note',e.target.value)}/></div></>}
     {step===5&&<><div className="form-section-title full"><b>NTRCA / নিবন্ধন তথ্য</b></div>{isTeacher&&<><div className="field"><label>শিক্ষক নিবন্ধন নম্বর</label><input value={form.teacher_registration_no||''} onChange={e=>change('teacher_registration_no',e.target.value)}/></div><div className="field"><label>নিবন্ধনের তারিখ</label><input type="date" value={form.registration_date||''} onChange={e=>change('registration_date',e.target.value)}/></div>{[['registered','NTRCA নিবন্ধিত?'],['recommended','NTRCA সুপারিশপ্রাপ্ত?'],['year','NTRCA নিবন্ধন/সুপারিশের সন'],['subject','NTRCA বিষয়'],['remarks','NTRCA মন্তব্য']].map(([k,l])=><div className="field" key={k}><label>{l}</label><input value={form.extended_profile?.ntrca?.[k]||''} onChange={e=>updateNtrca(k,e.target.value)}/></div>)}</>}<div className="form-section-title full"><b>যোগাযোগ ও ঠিকানা</b></div><div className="field"><label>মোবাইল</label><input value={form.phone||''} onChange={e=>change('phone',e.target.value)}/></div><div className="field"><label>WhatsApp</label><input value={form.whatsapp_no||''} onChange={e=>change('whatsapp_no',e.target.value)}/></div><div className="field"><label>ই-মেইল</label><input type="email" value={form.email||''} onChange={e=>change('email',e.target.value)}/></div><div className="field"><label>বর্তমান ঠিকানা</label><input value={form.address||''} onChange={e=>change('address',e.target.value)}/></div><div className="field"><label>স্থায়ী ঠিকানা</label><input value={form.permanent_address||''} onChange={e=>change('permanent_address',e.target.value)}/></div><div className="field"><label>ছবি আপলোড</label><input type="file" accept="image/png,image/jpeg" onChange={file}/><small>JPG/PNG, সর্বোচ্চ 2MB</small></div>{form.photo_url&&<img className="form-photo-preview full" src={form.photo_url} alt="প্রোফাইল ছবি"/>}</>}
     {step===6&&<><div className="form-section-title full"><b>🌐 ওয়েবসাইটে যোগাযোগ</b><span>এই profile থেকে Home Page-এর Contact অংশ স্বয়ংক্রিয়ভাবে তথ্য নেবে।</span></div><div className="field"><label>Public Contact Role</label><select value={form.public_contact_role||''} onChange={e=>change('public_contact_role',e.target.value)}><option value="">স্বয়ংক্রিয়ভাবে পদবি/বিষয় দেখে নির্ধারণ</option>{isTeacher&&<><option value="head_teacher">প্রধান শিক্ষক</option><option value="assistant_head_teacher">সহকারী প্রধান শিক্ষক</option><option value="ict_teacher">আইসিটি শিক্ষক</option></>}{!isTeacher&&<option value="office_assistant">অফিস সহকারী</option>}</select></div><div className="field"><label className="check"><input type="checkbox" checked={form.public_contact_enabled!==false} onChange={e=>change('public_contact_enabled',e.target.checked)}/> ওয়েবসাইটের যোগাযোগ অংশে প্রদর্শনযোগ্য</label></div><CustomFields formKey={isTeacher?"teacher":"staff"} form={form} setForm={setForm}/></>}<div className="form-actions full"><button type="button" className="mini" onClick={()=>setForm(isTeacher?{...emptyTeacher}:{...emptyStaff})}>↻ ফর্ম রিসেট</button>{step>0&&<button type="button" className="mini" onClick={()=>setStep(step-1)}>← পূর্ববর্তী</button>}{step<6?<button type="button" className="btn" onClick={()=>setStep(step+1)}>পরবর্তী ধাপ →</button>:<button className="btn">✓ {editing?'তথ্য আপডেট করুন':'সংরক্ষণ করুন'}</button>}</div>
    </form>
    {msg&&<p className="msg" role="status">{msg}</p>}
   </div>
  )}

  {view==='list' && (
   <div className="table-card">
    <div className="toolbar">
     <div>
      <span className="eyebrow">DIRECTORY • V91</span>
      <h2>{isTeacher?'শিক্ষকবৃন্দের তালিকা':'কর্মচারীর তালিকা'}</h2>
     </div>
     {isTeacher ? (
      <div style={{display:'inline-flex',gap:'8px',alignItems:'center',flexWrap:'nowrap',overflowX:'auto',maxWidth:'100%',padding:'2px 0'}}>
       <button 
         type="button" 
         className="mini" 
         style={{background:'linear-gradient(135deg, #047857 0%, #065f46 100%)',color:'#fff',fontWeight:700,height:'36px',padding:'0 14px',borderRadius:'8px',border:'none',boxShadow:'0 2px 5px rgba(4,120,87,0.3)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',cursor:'pointer',fontSize:'12.5px',whiteSpace:'nowrap',flex:'1 1 auto'}} 
         onClick={()=>handleOpenStaffDocs('', 'bonafide')}
         title="শিক্ষক সনদ, প্রত্যয়নপত্র, ছাড়পত্র, বায়োডাটা ও পরিচয়পত্র স্টুডিও"
       >
         📜 শিক্ষক সনদ ও বায়োডাটা
       </button>
       <button 
         type="button" 
         className="mini" 
         style={{background:'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',color:'#fff',fontWeight:600,height:'36px',padding:'0 12px',borderRadius:'8px',border:'none',boxShadow:'0 2px 4px rgba(79,70,229,0.25)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',cursor:'pointer',fontSize:'12px',whiteSpace:'nowrap',flex:'1 1 auto'}} 
         onClick={()=>setTeacherQueryModal({ isOpen: true, mode: 'education' })}
         title="শিক্ষাগত যোগ্যতা (জেন্ডার ভিত্তিক) কুয়েরি ও রিপোর্ট"
       >
         🎓 শিক্ষাগত যোগ্যতা কুয়েরি
       </button>
       <button 
         type="button" 
         className="mini" 
         style={{background:'linear-gradient(135deg, #0d9488 0%, #059669 100%)',color:'#fff',fontWeight:600,height:'36px',padding:'0 12px',borderRadius:'8px',border:'none',boxShadow:'0 2px 4px rgba(13,148,136,0.25)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',cursor:'pointer',fontSize:'12px',whiteSpace:'nowrap',flex:'1 1 auto'}} 
         onClick={()=>setTeacherQueryModal({ isOpen: true, mode: 'professional' })}
         title="পেশাগত ডিগ্রী (জেন্ডার ভিত্তিক) কুয়েরি ও রিপোর্ট"
       >
         📜 পেশাগত ডিগ্রী কুয়েরি
       </button>
       <button 
         type="button" 
         className="mini" 
         style={{background:'linear-gradient(135deg, #d97706 0%, #b45309 100%)',color:'#fff',fontWeight:600,height:'36px',padding:'0 12px',borderRadius:'8px',border:'none',boxShadow:'0 2px 4px rgba(217,119,6,0.25)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',cursor:'pointer',fontSize:'12px',whiteSpace:'nowrap',flex:'1 1 auto'}} 
         onClick={()=>setTeacherQueryModal({ isOpen: true, mode: 'ict' })}
         title="আইসিটি প্রশিক্ষণ (জেন্ডার ভিত্তিক) কুয়েরি ও রিপোর্ট"
       >
         💻 আইসিটি প্রশিক্ষণ কুয়েরি
       </button>
       <button 
         type="button" 
         className="mini" 
         style={{background:'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',color:'#fff',fontWeight:600,height:'36px',padding:'0 12px',borderRadius:'8px',border:'none',boxShadow:'0 2px 4px rgba(2,132,199,0.25)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',cursor:'pointer',fontSize:'12px',whiteSpace:'nowrap',flex:'1 1 auto'}} 
         onClick={()=>setTeacherQueryModal({ isOpen: true, mode: 'training' })}
         title="কর্মকালীন প্রশিক্ষণ (জেন্ডার ভিত্তিক) কুয়েরি ও রিপোর্ট"
       >
         📚 কর্মকালীন প্রশিক্ষণ কুয়েরি
       </button>
      </div>
     ) : (
      <div style={{display:'inline-flex',gap:'8px',alignItems:'center'}}>
       <button 
         type="button" 
         className="mini" 
         style={{background:'linear-gradient(135deg, #047857 0%, #065f46 100%)',color:'#fff',fontWeight:700,height:'36px',padding:'0 14px',borderRadius:'8px',border:'none',boxShadow:'0 2px 5px rgba(4,120,87,0.3)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',cursor:'pointer',fontSize:'12.5px',whiteSpace:'nowrap'}} 
         onClick={()=>handleOpenStaffDocs('', 'bonafide')}
         title="কর্মচারী সনদ, প্রত্যয়নপত্র, ছাড়পত্র, বায়োডাটা ও পরিচয়পত্র স্টুডিও"
       >
         📜 কর্মচারী সনদ ও বায়োডাটা
       </button>
      </div>
     )}
     <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
      <button className="btn mini" type="button" onClick={()=>{setEditing(null);setForm(isTeacher?{...emptyTeacher}:{...emptyStaff});setStep(0);setView('form');}}>➕ {isTeacher?'নতুন শিক্ষক এন্ট্রি':'নতুন কর্মচারী এন্ট্রি'}</button>
      <span>{(list||[]).length} জন</span>
     </div>
    </div>
    <div className="filters">
     <input placeholder="নাম / ID / বিষয় / NID খুঁজুন" value={q} onChange={e=>setQ(e.target.value)}/>
     <select value={status} onChange={e=>setStatus(e.target.value)}>
      <option value="">সব অবস্থা</option>
      {(isTeacher?['active','inactive','retired','former']:['active','inactive']).map(x=><option key={x} value={x}>{statusBn(x)}</option>)}
     </select>
     {customFields.filter(f=>f.enabled&&!f.is_system).length>0&&<select value={customFieldKey} onChange={e=>setCustomFieldKey(e.target.value)}><option value="">Custom field</option>{customFields.filter(f=>f.enabled&&!f.is_system).map(f=><option key={f.id} value={f.field_key}>{f.label_bn}</option>)}</select>}
     {customFieldKey&&<input placeholder="Custom value" value={customFieldValue} onChange={e=>setCustomFieldValue(e.target.value)}/>}
     <button type="button" className="mini" onClick={exportPeople}>CSV রিপোর্ট</button>
     <button type="button" className="mini" onClick={downloadPeopleTemplate} title="Template CSV ডাউনলোড করুন">⬇ Template CSV</button>
     <label className="mini" style={{background:'#0d9488',color:'#fff',border:'none',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'12px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'4px',margin:0}} title="CSV ফাইল আপলোড করুন">
      ⬆ CSV আপলোড
      <input type="file" accept=".csv,text/csv" hidden onChange={importPeople}/>
     </label>
    </div>
    <div className="table-wrap">
     <table>
      <thead>
       <tr style={{background:'#f2f8f5',borderBottom:'1.5px solid #bbf7d0'}}>
        <th style={{textAlign:'center',width:'65px',padding:'10px 4px',color:'#065f46',fontWeight:700,fontSize:'12.5px',lineHeight:'1.2'}}>Employee<br/>ID</th>
        <th style={{textAlign:'center',width:'58px',padding:'10px 4px',color:'#065f46',fontWeight:700,fontSize:'12.5px'}}>ছবি</th>
        <th style={{textAlign:'left',width:'220px',padding:'10px 10px',color:'#065f46',fontWeight:700,fontSize:'12.5px'}}>নাম</th>
        <th style={{textAlign:'left',width:'150px',padding:'10px 8px',color:'#065f46',fontWeight:700,fontSize:'12.5px'}}>পদবি</th>
        {isTeacher&&<th style={{textAlign:'left',width:'165px',padding:'10px 8px',color:'#065f46',fontWeight:700,fontSize:'12.5px'}}>বিষয়</th>}
        <th style={{textAlign:'left',width:'120px',padding:'10px 8px',color:'#065f46',fontWeight:700,fontSize:'12.5px'}}>মোবাইল</th>
        <th style={{textAlign:'center',width:'75px',padding:'10px 6px',color:'#065f46',fontWeight:700,fontSize:'12.5px'}}>অবস্থা</th>
        <th style={{textAlign:'center',width:'85px',padding:'10px 4px',color:'#065f46',fontWeight:700,fontSize:'12px',whiteSpace:'nowrap'}}>সেবা</th>
       </tr>
      </thead>
      <tbody>
       {(list||[]).map(x=>{
        const isInline = inlineEditId === x.id;
        return (
         <tr key={x.id} style={{background: isInline ? '#f0fdf4' : undefined}}>
          <td style={{textAlign:'center',padding:'8px 4px'}}><strong style={{color:'#1e293b',fontWeight:700,fontSize:'13px'}}>{toBnDigits(x.employee_id || (list.indexOf(x) >= 0 ? list.indexOf(x) + 1 : ''))}</strong></td>
          <td style={{textAlign:'center',padding:'5px 4px'}}>
           <label style={{cursor:'pointer',display:'inline-block',position:'relative'}} title="ছবি পরিবর্তন করতে ক্লিক করুন">
            <div style={{width:'40px',height:'44px',borderRadius:'6px',overflow:'hidden',border:'1px solid #cbd5e1',margin:'0 auto',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 2px rgba(0,0,0,0.05)',position:'relative'}}>
             <img src={getTeacherPhoto(x)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';}}/>
             <span style={{position:'absolute',bottom:0,right:0,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'8px',padding:'1px 2px',borderRadius:'2px',lineHeight:1}}>📷</span>
            </div>
            <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e)=>uploadPhoto(x, e)}/>
           </label>
          </td>
          <td style={{padding:'8px 10px',textAlign:'left'}}>
           {isInline ? (
            <input 
             value={inlineForm.name_bn} 
             onChange={e=>setInlineForm(f=>({...f,name_bn:e.target.value}))} 
             style={{padding:'4px 6px',fontSize:'13px',borderRadius:'5px',border:'1px solid #3b82f6',width:'100%',fontWeight:600}} 
             placeholder="নাম (বাংলা)"
            />
           ) : (
            <div>
             <div style={{fontWeight:700,color:'#0f172a',fontSize:'13.5px',lineHeight:'1.3'}}>{x.name_bn}</div>
             {x.name_en&&<div style={{fontSize:'10px',fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.4px',marginTop:'2px'}}>{x.name_en}</div>}
            </div>
           )}
          </td>
          <td style={{padding:'8px 8px',textAlign:'left',fontSize:'12.5px',color:'#334155'}}>
           {isInline ? (
            <input 
             value={inlineForm.designation} 
             onChange={e=>setInlineForm(f=>({...f,designation:e.target.value}))} 
             style={{padding:'4px 6px',fontSize:'12.5px',borderRadius:'5px',border:'1px solid #3b82f6',width:'100%'}} 
             placeholder="পদবি"
            />
           ) : (
            x.designation
           )}
          </td>
          {isTeacher && (
           <td style={{padding:'8px 8px',textAlign:'left',fontSize:'12.5px',color:'#334155'}}>
            {isInline ? (
             <input 
              value={inlineForm.subject} 
              onChange={e=>setInlineForm(f=>({...f,subject:e.target.value}))} 
              style={{padding:'4px 6px',fontSize:'12.5px',borderRadius:'5px',border:'1px solid #3b82f6',width:'100%'}} 
              placeholder="মূল বিষয়"
             />
            ) : (
             x.subject || '—'
            )}
           </td>
          )}
          <td style={{padding:'8px 8px',textAlign:'left',fontSize:'12px',color:'#334155',letterSpacing:'0.2px'}}>
           {isInline ? (
            <input 
             value={inlineForm.phone} 
             onChange={e=>setInlineForm(f=>({...f,phone:e.target.value}))} 
             style={{padding:'4px 6px',fontSize:'12px',borderRadius:'5px',border:'1px solid #3b82f6',width:'100%'}} 
             placeholder="মোবাইল"
            />
           ) : (
            x.phone || '—'
           )}
          </td>
          <td style={{textAlign:'center',padding:'8px 6px',fontSize:'12px',color:'#334155',fontWeight:500}}>
           {isInline ? (
            <select 
             value={inlineForm.status} 
             onChange={e=>setInlineForm(f=>({...f,status:e.target.value}))} 
             style={{padding:'3px 6px',fontSize:'11.5px',borderRadius:'5px',border:'1px solid #3b82f6'}}
            >
             {(isTeacher?['active','inactive','retired','former']:['active','inactive']).map(st=><option key={st} value={st}>{statusBn(st)}</option>)}
            </select>
           ) : (
            statusBn(x.status)
           )}
          </td>
          <td style={{textAlign:'center',padding:'4px 4px',whiteSpace:'nowrap'}}>
           {isInline ? (
            <div style={{display:'inline-flex',alignItems:'center',gap:'3px',justifyContent:'center'}}>
             <button 
              type="button" 
              className="mini" 
              style={{background:'#16a34a',color:'#fff',border:'none',padding:'3px 6px',borderRadius:'4px',cursor:'pointer',fontSize:'10px',fontWeight:600}} 
              onClick={()=>saveInline(x)} 
              title="সংরক্ষণ করুন"
             >
              💾 সংরক্ষণ
             </button>
             <button 
              type="button" 
              className="mini" 
              style={{background:'#64748b',color:'#fff',border:'none',padding:'3px 5px',borderRadius:'4px',cursor:'pointer',fontSize:'10px',fontWeight:600}} 
              onClick={()=>setInlineEditId(null)} 
              title="সম্পাদনা বাতিল"
             >
              ✕
             </button>
             <button 
              type="button" 
              className="mini" 
              style={{background:'#0284c7',color:'#fff',border:'none',padding:'3px 5px',borderRadius:'4px',cursor:'pointer',fontSize:'9.5px',fontWeight:600}} 
              onClick={()=>begin(x)} 
              title="পূর্ণাঙ্গ ৭ ধাপের এন্ট্রি ফরম"
             >
              📝 ফরম
             </button>
            </div>
           ) : (
            <button
             type="button"
             className="mini"
             onClick={(e)=>toggleStaffActionMenu(e, x)}
             style={{
               background: staffActionMenu?.personId===x.id ? '#047857' : '#ffffff',
               color: staffActionMenu?.personId===x.id ? '#ffffff' : '#334155',
               border: staffActionMenu?.personId===x.id ? '1.5px solid #047857' : '1px solid #cbd5e1',
               fontWeight: 700,
               cursor: 'pointer',
               padding: '4px 8px',
               borderRadius: '6px',
               display: 'inline-flex',
               alignItems: 'center',
               gap: '4px',
               boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
               transition: 'all 0.15s ease'
             }}
             title="সেবা ও অ্যাকশন মেন্যু"
            >
              <span style={{fontSize:'16px',lineHeight:1,fontWeight:900}}>⋮</span>
              <span style={{fontSize:'11.5px'}}>সেবা</span>
            </button>
           )}
          </td>
         </tr>
        );
       })}
       {!(list||[]).length&&<tr><td colSpan={isTeacher?8:7}>কোনো তথ্য পাওয়া যায়নি।</td></tr>}
      </tbody>
     </table>
     {staffActionMenu && (
      <>
        <div
          style={{position:'fixed',inset:0,zIndex:9998}}
          onClick={()=>setStaffActionMenu(null)}
        />
        <div
          style={{
            position: 'fixed',
            top: staffActionMenu.top,
            left: staffActionMenu.left,
            zIndex: 9999,
            background: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 12px 30px -5px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.1)',
            border: '1px solid #cbd5e1',
            minWidth: '225px',
            padding: '6px 0',
            textAlign: 'left'
          }}
          onClick={e=>e.stopPropagation()}
        >
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'biodata');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#166534',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>📄</span> পূর্ণাঙ্গ বায়োডাটা (CV)
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'id_card');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#1d4ed8',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>🪪</span> পরিচয়পত্র (ID Card Studio)
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'bonafide');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#047857',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>📜</span> প্রত্যয়নপত্র (Bonafide)
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'experience');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#b45309',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#fef3c7'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>🏆</span> অভিজ্ঞতার সনদ
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'professional');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#0d9488',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#f0fdfa'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>🎖️</span> পেশাগত সনদ
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'continuous');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#7e22ce',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#faf5ff'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>⏱️</span> নিরবিচ্ছিন্ন চাকুরী সনদ
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); handleOpenStaffDocs(p.id, 'release_order');}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#c2410c',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#fff7ed'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>✈️</span> প্রশিক্ষণ ছাড়পত্র / অবমুক্তি
          </button>
          <div style={{borderTop:'1px solid #f1f5f9',margin:'4px 0'}}/>
          <button
            type="button"
            onClick={()=>{
              const p=staffActionMenu.person;
              setStaffActionMenu(null);
              setInlineEditId(p.id);
              setInlineForm({
                name_bn: p.name_bn || '',
                designation: p.designation || '',
                subject: p.subject || '',
                phone: p.phone || '',
                status: p.status || 'active'
              });
            }}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#2563eb',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>✏️</span> দ্রুত সম্পাদনা
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); begin(p);}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#0f172a',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>📝</span> পূর্ণাঙ্গ এন্ট্রি ফরম
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); printPersonProfile(p);}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#475569',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>🖨️</span> প্রোফাইল প্রিন্ট
          </button>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); exportPeople(p);}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#059669',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>📊</span> CSV একক রিপোর্ট
          </button>
          <div style={{borderTop:'1px solid #f1f5f9',margin:'4px 0'}}/>
          <button
            type="button"
            onClick={()=>{const p=staffActionMenu.person; setStaffActionMenu(null); remove(p.id);}}
            style={{width:'100%',padding:'7px 14px',background:'none',border:'none',display:'flex',alignItems:'center',gap:'9px',fontSize:'12.5px',fontWeight:600,color:'#dc2626',cursor:'pointer',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}
          >
            <span style={{fontSize:'14px'}}>🗑️</span> রেকর্ড মুছুন
          </button>
        </div>
      </>
     )}
    </div>
   </div>
  )}

   {view==='voter' && (
    <div className="table-card" style={{borderTop:'4px solid #16a34a'}}>
     <div className="toolbar" style={{borderBottom:'1px solid #e2e8f0',paddingBottom:'14px',marginBottom:'16px'}}>
      <div>
       <span className="eyebrow" style={{color:'#16a34a',fontWeight:700}}>ELECTION & VOTER LIST • V118</span>
       <h2 style={{display:'flex',alignItems:'center',gap:'8px',margin:'4px 0'}}>🗳️ শিক্ষক ভোটার তালিকা</h2>
       <p className="portal-muted" style={{margin:0,fontSize:'13px'}}>
        প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষক ব্যতিত সকল সক্রিয় শিক্ষকবৃন্দের চূড়ান্ত ভোটার তালিকা।
       </p>
      </div>
      <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
       <span style={{background:'#dcfce7',color:'#166534',fontWeight:700,padding:'6px 12px',borderRadius:'20px',fontSize:'13px'}}>
        মোট ভোটার: {filteredVoters.length} জন
       </span>
       <button className="btn mini" type="button" style={{background:'#16a34a',color:'#fff',display:'inline-flex',alignItems:'center',gap:'6px'}} onClick={printTeacherVoterList}>
        🖨️ ভোটার তালিকা প্রিন্ট / PDF
       </button>
       <button className="mini" type="button" onClick={exportTeacherVoterCSV} style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
        📥 CSV ডাউনলোড
       </button>
       <button className="mini" type="button" onClick={()=>switchTab('teachers','list')}>
        📋 মূল তালিকায় ফিরুন
       </button>
      </div>
     </div>

     <div className="filters" style={{marginBottom:'16px',display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
      <input 
       placeholder="ভোটারের নাম / পদবী / ইনডেক্স নম্বর খুঁজুন..." 
       value={voterSearch} 
       onChange={e=>setVoterSearch(e.target.value)}
       style={{minWidth:'280px',flex:1}}
      />
      {voterSearch && (
       <button className="mini" type="button" onClick={()=>setVoterSearch('')}>রিসেট</button>
      )}
     </div>

     <div className="table-wrap" style={{border:'1px solid #cbd5e1',borderRadius:'8px',overflowX:'auto'}}>
      <table>
       <thead>
        <tr style={{background:'#f8fafc',borderBottom:'2px solid #cbd5e1'}}>
         <th style={{width:'80px',textAlign:'center',padding:'12px 8px',fontWeight:700}}>ভোটার নং</th>
         <th style={{minWidth:'200px',textAlign:'left',padding:'12px 10px'}}>ভোটারের নাম</th>
         <th style={{minWidth:'150px',textAlign:'left',padding:'12px 10px'}}>পদবী</th>
         <th style={{minWidth:'140px',textAlign:'center',padding:'12px 10px'}}>অত্র প্রতিষ্ঠানে যোগদানের তারিখ</th>
         <th style={{minWidth:'140px',textAlign:'center',padding:'12px 10px'}}>এমপিও কোড/ইনডেক্স নম্বর</th>
         <th style={{minWidth:'180px',textAlign:'left',padding:'12px 10px'}}>মন্তব্য</th>
        </tr>
       </thead>
       <tbody>
        {filteredVoters.map((t, idx) => {
         const voterNo = idx + 1;
         const joiningDate = t.current_post_joining_date || t.joining_date || t.first_joining_date || t.appointment_date || t.extended_profile?.joining_date || '—';
         const mpoIndex = t.mpo_index_no || t.mpo_code || t.index_no || t.extended_profile?.mpo_index_no || '—';
         const remarkVal = voterRemarks[t.id] ?? t.remarks ?? ((t.status === 'active' || !t.status) ? 'যোগ্য ভোটার' : '');

         return (
          <tr key={t.id} style={{borderBottom:'1px solid #e2e8f0',background:idx%2===0?'#ffffff':'#fbfcfe'}}>
           <td style={{textAlign:'center',fontWeight:700,color:'#166534',fontSize:'14px',padding:'10px 8px'}}>
            <span style={{background:'#dcfce7',padding:'4px 10px',borderRadius:'12px',display:'inline-block',minWidth:'32px'}}>
             {voterNo}
            </span>
           </td>
           <td style={{padding:'10px 10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
             <img 
              src={getTeacherPhoto(t)} 
              alt="" 
              style={{width:36,height:36,borderRadius:'6px',objectFit:'cover',border:'1px solid #cbd5e1',flexShrink:0}}
             />
             <div>
              <div style={{fontWeight:600,color:'#0f172a'}}>{t.name_bn}</div>
              {t.name_en && <div style={{fontSize:'12px',color:'#64748b'}}>{t.name_en}</div>}
             </div>
            </div>
           </td>
           <td style={{padding:'10px 10px'}}>
            <div style={{fontWeight:500,color:'#334155'}}>{t.designation || 'সহকারী শিক্ষক'}</div>
            {t.subject && <div style={{fontSize:'12px',color:'#0284c7'}}>{t.subject}</div>}
           </td>
           <td style={{textAlign:'center',padding:'10px 10px',color:'#334155',fontWeight:500}}>
            {joiningDate}
           </td>
           <td style={{textAlign:'center',padding:'10px 10px'}}>
            <span style={{fontFamily:'monospace',fontWeight:600,color:'#0369a1',background:'#f0f9ff',padding:'3px 8px',borderRadius:'4px',border:'1px solid #bae6fd'}}>
             {mpoIndex}
            </span>
           </td>
           <td style={{padding:'10px 10px'}}>
            <input 
             type="text"
             value={remarkVal}
             placeholder="মন্তব্য লিখুন..."
             onChange={e => setVoterRemarks(prev => ({ ...prev, [t.id]: e.target.value }))}
             style={{width:'100%',padding:'6px 10px',fontSize:'12.5px',borderRadius:'6px',border:'1px solid #cbd5e1',background:'#fff'}}
            />
           </td>
          </tr>
         );
        })}
        {!filteredVoters.length && (
         <tr>
          <td colSpan="6" style={{padding:'30px',textAlign:'center',color:'#64748b'}}>
           কোনো ভোটার তথ্য পাওয়া যায়নি।
          </td>
         </tr>
        )}
       </tbody>
      </table>
     </div>

     <div style={{marginTop:'14px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',color:'#64748b',flexWrap:'wrap',gap:'8px'}}>
      <div>
       ℹ️ <strong>শর্তাবলী:</strong> প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষক ব্যতিত সকল সক্রিয় শিক্ষকবৃন্দ এই ভোটার তালিকায় অন্তর্ভুক্ত।
      </div>
      <div style={{display:'flex',gap:'8px'}}>
       <button className="mini" type="button" onClick={printTeacherVoterList}>🖨️ প্রিন্ট করুন</button>
       <button className="mini" type="button" onClick={exportTeacherVoterCSV}>📥 CSV এক্সপোর্ট</button>
      </div>
     </div>
    </div>
   )}
 
   {showStaffCertModal && (
    <StaffCertificatesModal
     isOpen={showStaffCertModal}
     onClose={() => setShowStaffCertModal(false)}
     people={rawList && rawList.length ? rawList : (isTeacher ? teachers : staff)}
     initialPersonId={staffCertPersonId}
     initialTab={staffCertTab}
    />
   )}

   {teacherQueryModal.isOpen && (
    <TeacherQueryModal
     isOpen={teacherQueryModal.isOpen}
     onClose={() => setTeacherQueryModal(prev => ({ ...prev, isOpen: false }))}
     teachers={allTeachers && allTeachers.length ? allTeachers : teachers}
     initialMode={teacherQueryModal.mode}
    />
   )}
</div>;
}

function SecuritySessionsPanel(){
 const[rows,setRows]=useState([]),[msg,setMsg]=useState('');
 const load=()=>api('/users/security-sessions').then(setRows).catch(e=>setMsg(e.message));
 useEffect(load,[]);
 async function invalidate(u){if(!confirm(`${u.full_name}-এর সব পুরোনো session বাতিল করবেন?`))return;try{const d=await api('/users/'+u.id+'/invalidate-sessions',{method:'POST'});setMsg(d.message);load()}catch(e){setMsg(e.message)}}
 return <div className="table-card"><div className="toolbar"><div><span className="eyebrow">SESSION SECURITY • V103</span><h2>সেশন ও নিরাপত্তা</h2><p className="portal-muted">Account বন্ধ, password reset বা সন্দেহজনক activity-এর পরে পুরোনো session একসঙ্গে বাতিল করুন।</p></div><button className="mini" onClick={load}>↻ Refresh</button></div>{msg&&<p className="msg" role="status">{msg}</p>}<div className="table-wrap"><table><thead><tr><th>Login ID</th><th>নাম</th><th>Role</th><th>শেষ Login</th><th>Password</th><th>Account</th><th>কাজ</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td>{u.login_id}</td><td>{u.full_name}</td><td>{u.role_label||u.role_name}</td><td>{u.last_login_at?new Date(u.last_login_at).toLocaleString():'কখনো নয়'}</td><td>{u.must_change_password?'পরিবর্তন আবশ্যক':'স্বাভাবিক'}</td><td>{u.is_active?'সক্রিয়':'বন্ধ'}</td><td>{u.role_name!=='super_admin'&&<button className="mini" onClick={()=>invalidate(u)}>সব Session বাতিল</button>}</td></tr>)}{!rows.length&&<tr><td colSpan="7">কোনো user পাওয়া যায়নি।</td></tr>}</tbody></table></div></div>
}

function ProfileProvisionPanel(){
 const [entity,setEntity]=useState('student'),[profiles,setProfiles]=useState([]),[selected,setSelected]=useState(''),[login,setLogin]=useState(''),[password,setPassword]=useState(''),[relation,setRelation]=useState('guardian'),[guardianName,setGuardianName]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
 const load=async()=>{try{const url=entity==='student'?'/students?status=active':entity==='teacher'?'/teachers?status=active':entity==='staff'?'/staff?status=active':'/students?status=active';const rows=await api(url);setProfiles(entity==='guardian'?rows:rows.filter(x=>!x.user_id));setSelected('');setGuardianName('')}catch(e){setMsg(e.message)}};
 useEffect(()=>{load()},[entity]);
 const chosen=profiles.find(x=>String(x.id)===String(selected));
 const defaultLogin=chosen?(entity==='student'?chosen.student_id:entity==='guardian'?`${chosen.student_id}-g`:chosen.employee_id):'';
 useEffect(()=>{if(chosen){if(!login)setLogin(defaultLogin);if(entity==='guardian'){const n=relation==='mother'?chosen.mother_name:relation==='father'?chosen.father_name:chosen.guardian_name;setGuardianName(n||'')}}},[selected,relation]);
 async function submit(e){e.preventDefault();setLoading(true);try{const path=entity==='guardian'?'/users/provision-guardian-from-student':'/users/provision-profile';const body=entity==='guardian'?{student_id:selected,relation,guardian_name:guardianName,phone:chosen?.guardian_phone||'',login_id:login,password}:{entity_type:entity,entity_id:selected,login_id:login,password};const d=await api(path,{method:'POST',body:JSON.stringify(body)});setMsg(d.message);setPassword('');setLogin('');setGuardianName('');await load()}catch(e){setMsg(e.message)}finally{setLoading(false)}}
 const label=entity==='student'?'শিক্ষার্থী':entity==='teacher'?'শিক্ষক':entity==='staff'?'কর্মচারী':'অভিভাবক';
 return <div className="module-grid"><div className="form-card"><div className="toolbar"><div><span className="eyebrow">ACCOUNT IDENTITY • V102</span><h2>Profile → Login Account + Guardian</h2></div><span className="badge">Secure Provisioning</span></div><p className="portal-muted">আগে থেকে থাকা Student/Teacher/Staff profile থেকেই login account তৈরি ও একই সঙ্গে profile-এর সঙ্গে link করুন।</p><form onSubmit={submit} className="form-grid"><select value={entity} onChange={e=>{setEntity(e.target.value);setLogin('');setPassword('')}}><option value="student">শিক্ষার্থী</option><option value="teacher">শিক্ষক</option><option value="staff">কর্মচারী</option><option value="guardian">অভিভাবক (শিক্ষার্থী থেকে)</option></select><select value={selected} onChange={e=>{setSelected(e.target.value);const p=profiles.find(x=>String(x.id)===e.target.value);setLogin(p?(entity==='student'?p.student_id:entity==='guardian'?`${p.student_id}-g`:p.employee_id):'')}} required><option value="">{label} profile নির্বাচন করুন</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.name_bn} • {entity==='student'?p.student_id:p.employee_id}{p.class_name?` • শ্রেণি ${p.class_name}`:''}</option>)}</select><input value={login} onChange={e=>setLogin(e.target.value)} placeholder="Login ID" required/>{entity==='guardian'&&<><select value={relation} onChange={e=>setRelation(e.target.value)}><option value="guardian">অভিভাবক</option><option value="father">পিতা</option><option value="mother">মাতা</option><option value="local_guardian">স্থানীয় অভিভাবক</option></select><input value={guardianName} onChange={e=>setGuardianName(e.target.value)} placeholder="Guardian-এর নাম" required/></>}<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="অস্থায়ী Password (৮+)" minLength="8" required/><button className="btn full" disabled={loading||!selected}>{loading?'তৈরি হচ্ছে...':'Account তৈরি ও Link করুন'}</button></form>{chosen&&<div className="info-card"><b>নির্বাচিত profile</b><p>{chosen.name_bn} • {entity==='student'?chosen.student_id:chosen.employee_id}</p><p>{chosen.email||chosen.phone?'যোগাযোগের তথ্য পাওয়া গেছে এবং account-এ ব্যবহার হবে।':'Email/মোবাইল profile-এ নেই; পরে User Management থেকে যোগ করা যাবে।'}</p></div>}{msg&&<p className="msg" role="status">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>Account তৈরির অপেক্ষায়</h2><span>{profiles.length} জন</span></div><div className="table-wrap"><table><thead><tr><th>Profile</th><th>ID</th><th>যোগাযোগ</th><th>অবস্থা</th></tr></thead><tbody>{profiles.map(p=><tr key={p.id}><td>{p.name_bn}</td><td>{entity==='student'?p.student_id:p.employee_id}</td><td>{p.phone||p.email||'—'}</td><td>Login নেই</td></tr>)}{!profiles.length&&<tr><td colSpan="4">এই category-তে কোনো unlinked profile নেই।</td></tr>}</tbody></table></div></div></div>
}
function UsersPanel({sub}){
 const roleOptions=[
  ['super_admin','সুপার অ্যাডমিন (আইসিটি শিক্ষক - Full ERP)'],
  ['admin','অ্যাডমিন (প্রধান ও সহকারী প্রধান শিক্ষক)'],
  ['co_admin','কো-অ্যাডমিন (শ্রেণি শিক্ষক)'],
  ['teacher','বিষয় শিক্ষক / সহকারী শিক্ষক'],
  ['librarian','গ্রন্থাগার'],
  ['staff','অফিস সহকারী']
 ];

 const emptyUser = { login_id:'', full_name:'', password:'', role:'admin', email:'', phone:'' };
 const [users,setUsers]=useState([]),[students,setStudents]=useState([]),[links,setLinks]=useState([]);
 const [form,setForm]=useState(emptyUser),[editing,setEditing]=useState(null);
 const [link,setLink]=useState({user_id:'',student_id:'',relation:'guardian'});
 const [msg,setMsg]=useState(''),[roleFilter,setRoleFilter]=useState(''),[searchQuery,setSearchQuery]=useState('');
 const [resetModalUser,setResetModalUser]=useState(null),[newPass,setNewPass]=useState('');

 const refresh=()=>api('/users').then(setUsers).catch(e=>setMsg(e.message));
 const loadLinks=()=>Promise.all([api('/portal/links'),api('/students?status=active')]).then(([a,b])=>{setLinks(a);setStudents(b)}).catch(e=>setMsg(e.message));
 useEffect(()=>{refresh();if(sub==='links')loadLinks()},[sub]);

 async function save(e){
  e.preventDefault();
  try{
   if(editing){
    await api('/users/'+editing,{method:'PATCH',body:JSON.stringify({
     login_id: form.login_id.trim(),
     full_name: form.full_name.trim(),
     role: form.role,
     role_name: form.role,
     email: form.email,
     phone: form.phone
    })});
    setMsg('ব্যবহারকারীর তথ্য সফলভাবে আপডেট হয়েছে');
   } else {
    if(!form.password || form.password.length<6){
     setMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
     return;
    }
    await api('/users',{method:'POST',body:JSON.stringify({
     ...form,
     login_id: form.login_id.trim(),
     full_name: form.full_name.trim()
    })});
    setMsg('নতুন অ্যাডমিন / ব্যবহারকারী সফলভাবে তৈরি হয়েছে');
   }
   setEditing(null);
   setForm(emptyUser);
   refresh();
  }catch(e){
   setMsg(e.message);
  }
 }

 function editUser(u){
  setEditing(u.id);
  setForm({
   login_id: u.login_id,
   full_name: u.full_name,
   role: u.role_name||u.role||'admin',
   email: u.email||'',
   phone: u.phone||'',
   password: ''
  });
  window.scrollTo({top:0,behavior:'smooth'});
 }

 async function removeUser(u){
  const isSuper = u.role_name === 'super_admin';
  if(!confirm(`আপনি কি নিশ্চিত যে "${u.full_name}" (${u.login_id}) ইউজারটি মুছে ফেলতে চান?`)) return;
  try{
   await api('/users/'+u.id,{method:'DELETE'});
   setMsg(`"${u.full_name}" অ্যাকাউন্টটি মুছে ফেলা হয়েছে`);
   refresh();
  }catch(e){
   setMsg(e.message);
  }
 }

 async function toggle(u){
  try{
   await api('/users/'+u.id,{method:'PATCH',body:JSON.stringify({is_active:!u.is_active})});
   setMsg(u.is_active?'অ্যাকাউন্ট সাময়িক বন্ধ করা হয়েছে':'অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে');
   refresh();
  }catch(e){
   setMsg(e.message);
  }
 }

 async function setRole(u,next){
  if(!next||next===u.role_name)return;
  try{
   await api('/users/'+u.id,{method:'PATCH',body:JSON.stringify({role:next})});
   setMsg(`${u.full_name}-এর Role "${next}"-এ পরিবর্তন হয়েছে`);
   refresh();
  }catch(e){
   setMsg(e.message);
  }
 }

 async function handleResetPassword(e){
  e.preventDefault();
  if(!newPass || newPass.length<6){
   alert('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
   return;
  }
  try{
   const d=await api('/users/'+resetModalUser.id+'/reset-password',{method:'POST',body:JSON.stringify({newPassword:newPass})});
   setMsg(`${resetModalUser.full_name}-এর পাসওয়ার্ড সফলভাবে রিসেট হয়েছে: "${newPass}"`);
   setResetModalUser(null);
   setNewPass('');
   refresh();
  }catch(e){
   alert(e.message);
  }
 }

 async function linkGuardian(e){
  e.preventDefault();
  try{
   await api('/portal/link-student',{method:'POST',body:JSON.stringify(link)});
   setMsg('Guardian account-এর সঙ্গে শিক্ষার্থী link হয়েছে');
   setLink({user_id:'',student_id:'',relation:'guardian'});
   loadLinks();
  }catch(e){
   setMsg(e.message);
  }
 }

 async function linkStudent(e){
  e.preventDefault();
  try{
   await api('/portal/student-user',{method:'PATCH',body:JSON.stringify({student_id:link.student_id,user_id:link.user_id})});
   setMsg('Student account-এর সঙ্গে শিক্ষার্থী profile link হয়েছে');
   loadLinks();
  }catch(e){
   setMsg(e.message);
  }
 }

 if(sub==='sessions')return <SecuritySessionsPanel/>;
 if(sub==='provision')return <ProfileProvisionPanel/>;
 if(sub==='links')return <div className="module-grid"><div className="form-card"><span className="eyebrow">ACCOUNT IDENTITY</span><h2>Student / Guardian Link</h2><p className="portal-muted">Login account-এর সঙ্গে বাস্তব Student profile এবং Guardian–Student সম্পর্ক সংযুক্ত করুন।</p><form onSubmit={linkGuardian} className="form-grid"><select value={link.user_id} onChange={e=>setLink({...link,user_id:e.target.value})} required><option value="">Guardian account নির্বাচন করুন</option>{users.filter(u=>u.role_name==='guardian').map(u=><option key={u.id} value={u.id}>{u.full_name} • {u.login_id}</option>)}</select><select value={link.student_id} onChange={e=>setLink({...link,student_id:e.target.value})} required><option value="">শিক্ষার্থী নির্বাচন করুন</option>{students.map(s=><option key={s.id} value={s.id}>{s.name_bn} • {s.student_id} • শ্রেণি {s.class_name}</option>)}</select><select value={link.relation} onChange={e=>setLink({...link,relation:e.target.value})}><option value="guardian">অভিভাবক</option><option value="father">পিতা</option><option value="mother">মাতা</option><option value="local_guardian">স্থানীয় অভিভাবক</option></select><button className="btn">Guardian Link সংরক্ষণ</button></form><hr/><form onSubmit={linkStudent} className="form-grid"><select value={link.user_id} onChange={e=>setLink({...link,user_id:e.target.value})} required><option value="">Student account নির্বাচন করুন</option>{users.filter(u=>u.role_name==='student').map(u=><option key={u.id} value={u.id}>{u.full_name} • {u.login_id}</option>)}</select><select value={link.student_id} onChange={e=>setLink({...link,student_id:e.target.value})} required><option value="">Student profile নির্বাচন করুন</option>{students.map(s=><option key={s.id} value={s.id}>{s.name_bn} • {s.student_id} • শ্রেণি {s.class_name}</option>)}</select><button className="btn">Student Link সংরক্ষণ</button></form>{msg&&<p className="msg" role="status">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>Guardian–Student সম্পর্ক</h2><span>{links.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>Guardian</th><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>রোল</th><th>সম্পর্ক</th></tr></thead><tbody>{links.map(x=><tr key={x.id}><td>{x.guardian_name}<br/><small>{x.guardian_login}</small></td><td>{x.student_name}<br/><small>{x.student_code}</small></td><td>{x.class_name}</td><td>{x.roll_no||'—'}</td><td>{x.relation||'guardian'}</td></tr>)}{!links.length&&<tr><td colSpan="5">কোনো Guardian link নেই।</td></tr>}</tbody></table></div></div></div>;

 const visibleUsers = users.filter(u => {
  const matchesRole = !roleFilter || u.role_name === roleFilter || (roleFilter === 'admin' && (u.role_name === 'super_admin' || u.role_name === 'admin'));
  const matchesSearch = !searchQuery || [u.full_name, u.login_id, u.email, u.phone, u.role_label].filter(Boolean).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
  return matchesRole && matchesSearch;
 });

 const adminCount = users.filter(u => u.role_name === 'super_admin' || u.role_name === 'admin').length;
 const teacherCount = users.filter(u => ['teacher','head_teacher','assistant_head_teacher'].includes(u.role_name)).length;
 const studentCount = users.filter(u => u.role_name === 'student').length;
 const otherCount = users.length - (adminCount + teacherCount + studentCount);

 return <div className="users-management-panel">
  {/* KPI Top Cards */}
  <div className="stats" style={{marginBottom:'20px'}}>
   <div><b>{users.length}</b><span>মোট ইউজার</span></div>
   <div><b>{adminCount}</b><span>অ্যাডমিন ও কন্ট্রোল</span></div>
   <div><b>{teacherCount}</b><span>শিক্ষক অ্যাকাউন্ট</span></div>
   <div><b>{studentCount}</b><span>শিক্ষার্থী অ্যাকাউন্ট</span></div>
  </div>

  <div className="users-grid">
   {/* Form Card */}
   <div className="form-card">
    <div className="toolbar">
     <div>
      <span className="eyebrow">USER ADMINISTRATION</span>
      <h2>{editing ? '📝 অ্যাকাউন্ট সম্পাদনা' : '➕ নতুন অ্যাডমিন / ইউজার তৈরি'}</h2>
     </div>
     {editing && <button className="mini" onClick={()=>{setEditing(null);setForm(emptyUser);}}>বাতিল</button>}
    </div>
    <p className="portal-muted">
     {editing ? 'অ্যাকাউন্টের নাম, Login ID বা রোল পরিবর্তন করে আপডেট করুন।' : 'এখানে নতুন অ্যাডমিন, শিক্ষক, শিক্ষার্থী বা অন্য যেকোনো রোলে অ্যাকাউন্ট যোগ করতে পারেন।'}
    </p>
    <form onSubmit={save} className="form-grid">
     <div className="field">
      <label>Login ID *</label>
      <input
        placeholder="যেমন: admin_walton, head_teacher"
        value={form.login_id}
        onChange={e=>setForm({...form,login_id:e.target.value})}
        required
      />
     </div>
     <div className="field">
      <label>পূর্ণ নাম *</label>
      <input
        placeholder="ব্যবহারকারীর পুরো নাম"
        value={form.full_name}
        onChange={e=>setForm({...form,full_name:e.target.value})}
        required
      />
     </div>
     <div className="field">
      <label>ভূমিকা / রোল (Role) *</label>
      <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
       {roleOptions.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}
      </select>
     </div>
     {!editing && (
      <div className="field">
       <label>পাসওয়ার্ড (Password) *</label>
       <input
         type="password"
         placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
         minLength="6"
         value={form.password}
         onChange={e=>setForm({...form,password:e.target.value})}
         required
       />
      </div>
     )}
     <div className="field">
      <label>ইমেইল (ঐচ্ছিক)</label>
      <input
        type="email"
        placeholder="user@example.com"
        value={form.email}
        onChange={e=>setForm({...form,email:e.target.value})}
      />
     </div>
     <div className="field">
      <label>মোবাইল নম্বর (ঐচ্ছিক)</label>
      <input
        placeholder="017xxxxxxxx"
        value={form.phone}
        onChange={e=>setForm({...form,phone:e.target.value})}
      />
     </div>
     <button className="btn full" style={{marginTop:'10px'}}>
      {editing ? '✓ তথ্য আপডেট করুন' : '➕ অ্যাকাউন্ট তৈরি করুন'}
     </button>
    </form>
    {msg && <p className="msg" role="status" style={{marginTop:'15px'}}>{msg}</p>}
   </div>

   {/* Table Card */}
   <div className="table-card">
    <div className="toolbar">
     <div>
      <h2>ব্যবহারকারী ও অ্যাডমিন তালিকা</h2>
      <span style={{fontSize:'12px',color:'#666'}}>পাসওয়ার্ড রিসেট, রোল পরিবর্তন ও ডিলিট অপশন সক্রিয়</span>
     </div>
     <div style={{display:'flex',gap:'8px',alignItems:'center'}}><button type="button" className="mini" onClick={()=>{try{localStorage.removeItem('magra_db_users');refresh();setMsg('বিদ্যালয়ের সকল ১৫ জন শিক্ষক, অফিস সহকারী ও অ্যাডমিনদের তালিকা সফলভাবে সিঙ্ক হয়েছে।');}catch(e){alert(e.message)}}} style={{background:'#ecfdf5',color:'#065f46',borderColor:'#a7f3d0',fontWeight:700}} title="সকল ১৫ জন শিক্ষক ও অ্যাডমিনদের স্বয়ংক্রিয় সিঙ্ক">🔄 সকল শিক্ষক ও অ্যাডমিন সিঙ্ক করুন</button><span>{visibleUsers.length} / {users.length} জন</span></div>
    </div>

    {/* Filter Row */}
    <div className="filters" style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'15px'}}>
     <input
       placeholder="🔍 নাম / Login ID দিয়ে খুঁজুন…"
       value={searchQuery}
       onChange={e=>setSearchQuery(e.target.value)}
       style={{flex:1,minWidth:'200px'}}
     />
     <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{minWidth:'160px'}}>
      <option value="">সকল রোল (All Roles)</option>
      <option value="super_admin">👑 সুপার অ্যাডমিন (আইসিটি শিক্ষক)</option>
      <option value="admin">🎓 অ্যাডমিন (প্রধান ও সহকারী প্রধান শিক্ষক)</option>
      <option value="co_admin">👥 কো-অ্যাডমিন (শ্রেণি শিক্ষক)</option>
      <option value="teacher">📝 বিষয় শিক্ষক</option>
      <option value="librarian">📚 গ্রন্থাগার</option>
      <option value="staff">🏢 অফিস সহকারী</option>
     </select>
    </div>

    <div className="table-wrap">
     <table>
      <thead>
       <tr>
        <th>Login ID</th>
        <th>পূর্ণ নাম</th>
        <th>রোল (Role)</th>
        <th>অবস্থা</th>
        <th>অ্যাকশন / কাজ</th>
       </tr>
      </thead>
      <tbody>
       {visibleUsers.map(u => (
        <tr key={u.id}>
         <td>
          <b>{u.login_id}</b>
          {u.email && <div style={{fontSize:'11px',color:'#777'}}>{u.email}</div>}
         </td>
         <td>{u.full_name}</td>
         <td>
          <select
            value={u.role_name || u.role || 'teacher'}
            onChange={e=>setRole(u, e.target.value)}
            aria-label={`${u.full_name} role`}
            style={{padding:'4px 8px',borderRadius:'6px',fontSize:'13px'}}
          >
           {roleOptions.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}
          </select>
         </td>
         <td>
          <span className={'badge ' + (u.is_active ? 'badge-success' : 'badge-danger')} style={{padding:'4px 8px',borderRadius:'12px',fontSize:'12px',background:u.is_active?'#e6f4ea':'#fce8e6',color:u.is_active?'#137333':'#c5221f'}}>
           {u.is_active ? '● সক্রিয়' : '○ বন্ধ'}
          </span>
         </td>
         <td>
          <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
           <button
             type="button"
             className="mini"
             onClick={()=>setResetModalUser(u)}
             title="পাসওয়ার্ড রিসেট করুন"
             style={{background:'#e8f0fe',color:'#1967d2',borderColor:'#d2e3fc'}}
           >
            🔑 পাসওয়ার্ড রিসেট
           </button>
           <button
             type="button"
             className="mini"
             onClick={()=>editUser(u)}
             title="সম্পাদনা করুন"
           >
            ✏️ সম্পাদনা
           </button>
           <button
             type="button"
             className="mini"
             onClick={()=>toggle(u)}
             title={u.is_active ? 'অ্যাকাউন্ট বন্ধ করুন' : 'অ্যাকাউন্ট চালু করুন'}
           >
            {u.is_active ? '⏸ বন্ধ' : '▶ চালু'}
           </button>
           <button
             type="button"
             className="mini"
             onClick={()=>removeUser(u)}
             title="অ্যাকাউন্ট মুছে ফেলুন"
             style={{background:'#fce8e6',color:'#c5221f',borderColor:'#fad2cf'}}
           >
            🗑️ মুছুন
           </button>
          </div>
         </td>
        </tr>
       ))}
       {!visibleUsers.length && (
        <tr>
         <td colSpan="5" style={{textAlign:'center',padding:'30px',color:'#777'}}>
          কোনো ব্যবহারকারী পাওয়া যায়নি।
         </td>
        </tr>
       )}
      </tbody>
     </table>
    </div>
   </div>
  </div>

  {/* Password Reset Modal */}
  {resetModalUser && (
   <div className="modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div className="modal-content" style={{background:'#fff',padding:'24px',borderRadius:'14px',maxWidth:'450px',width:'90%',boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
     <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'15px'}}>
      <h3 style={{margin:0,fontSize:'18px',color:'#17352a'}}>🔑 পাসওয়ার্ড রিসেট</h3>
      <button className="mini" onClick={()=>{setResetModalUser(null);setNewPass('');}}>✕</button>
     </div>
     <p style={{fontSize:'13px',color:'#555',margin:'0 0 15px'}}>
      <b>{resetModalUser.full_name}</b> (Login ID: <code>{resetModalUser.login_id}</code>)-এর জন্য নতুন পাসওয়ার্ড সেট করুন:
     </p>
     <form onSubmit={handleResetPassword}>
      <input
        type="text"
        placeholder="নতুন পাসওয়ার্ড লিখুন (যেমন: newpass123)"
        value={newPass}
        onChange={e=>setNewPass(e.target.value)}
        required
        autoFocus
        style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ccc',marginBottom:'15px',fontSize:'15px'}}
      />
      <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
       <button type="button" className="mini" onClick={()=>{setResetModalUser(null);setNewPass('');}}>বাতিল</button>
       <button type="submit" className="btn">✓ পাসওয়ার্ড নিশ্চিত করুন</button>
      </div>
     </form>
    </div>
   </div>
  )}
 </div>;
}

function SettingsPanelWrapper({sub, setSub}){
  const currentSub = sub === 'password' ? 'password' : 'leadership';
  return <div>
    <div className="tabs" style={{marginBottom:'20px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
      <button
        type="button"
        className={currentSub==='leadership'?'active':''}
        onClick={()=>setSub('leadership')}
        style={{padding:'10px 18px',fontSize:'15px',fontWeight:700,borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}
      >
        <span>🖼️</span> বাণী ও ফটো সেটিংস (Leadership Speeches & Photos)
      </button>
      <button
        type="button"
        className={currentSub==='password'?'active':''}
        onClick={()=>setSub('password')}
        style={{padding:'10px 18px',fontSize:'15px',fontWeight:700,borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}
      >
        <span>🔑</span> পাসওয়ার্ড পরিবর্তন (Change Password)
      </button>
    </div>
    {currentSub==='password' ? <ChangePassword/> : <LeadershipSettingsPanel sub={sub}/>}
  </div>;
}

function LeadershipSettingsPanel() {
  const [data, setData] = useState(() => getLeadershipData());
  const [msg, setMsg] = useState('');
  const [activeLeaderKey, setActiveLeaderKey] = useState('head');
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
      if (Array.isArray(local) && local.length) setTeachers(local);
    } catch {}
    api('/teachers?status=active').then(d => {
      if (Array.isArray(d) && d.length) {
        setTeachers(d);
        setData(getLeadershipData(d));
      }
    }).catch(() => {});
  }, []);

  const updateLeader = (roleKey, field, val) => {
    setData(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [field]: val
      }
    }));
  };

  const handleFileUpload = (roleKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setMsg('ছবির আকার সর্বোচ্চ 2.5 MB হতে হবে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateLeader(roleKey, 'photo', reader.result);
      setMsg(`📷 ছবি নির্বাচন করা হয়েছে! পরিবর্তন সংরক্ষণ করতে নিচে "সংরক্ষণ ও লাইভ সাইটে আপডেট করুন" বাটনে ক্লিক করুন।`);
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = async (roleKey) => {
    try {
      const current = data[roleKey];
      // 1. Save leadership custom settings to localStorage
      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem('magra_db_leadership_settings') || '{}');
      } catch {}
      stored[roleKey] = {
        name: current.name,
        designation: current.designation || current.role,
        photo: current.photo,
        msg: current.msg,
        speech: typeof current.speech === 'string' ? current.speech.split('\n\n').filter(Boolean) : current.speech
      };
      localStorage.setItem('magra_db_leadership_settings', JSON.stringify(stored));

      // 2. Synchronize with teachers table if it's head or assistant head
      let localT = [];
      try {
        localT = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
      } catch {}
      if (!localT.length) localT = [...MOCK_TEACHERS];

      let targetTeacher = null;
      if (roleKey === 'head') {
        targetTeacher = localT.find(t => 
          t.public_contact_role === 'head_teacher' || 
          (t.designation && t.designation.includes('প্রধান শিক্ষক') && !t.designation.includes('সহকারী')) ||
          t.id === 't-1' ||
          (t.name_bn && t.name_bn.includes('শফিকুল'))
        );
      } else if (roleKey === 'asst_head') {
        targetTeacher = localT.find(t => 
          t.public_contact_role === 'assistant_head_teacher' || 
          (t.designation && t.designation.includes('সহকারী প্রধান শিক্ষক')) ||
          t.id === 't-2' ||
          (t.name_bn && t.name_bn.includes('তাপসী'))
        );
      }

      if (targetTeacher) {
        const updatedTeacher = {
          ...targetTeacher,
          name_bn: current.name || targetTeacher.name_bn,
          photo_url: current.photo || targetTeacher.photo_url
        };
        const updatedList = localT.map(t => t.id === targetTeacher.id ? updatedTeacher : t);
        localStorage.setItem('magra_db_teachers', JSON.stringify(updatedList));
        try {
          await api(`/teachers/${targetTeacher.id}`, { method: 'PUT', body: JSON.stringify(updatedTeacher) });
        } catch {}
      }

      // 3. Dispatch update event across tabs and public site
      window.dispatchEvent(new CustomEvent('magra_leadership_updated'));
      setMsg(`✅ ${current.role} (${current.name})-এর ছবি ও বাণী সফলভাবে আপডেট ও লাইভ ওয়েবসাইটে প্রকাশ হয়েছে!`);
      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      setMsg('সংরক্ষণে ত্রুটি: ' + (err.message || 'অপ্রত্যাশিত সমস্যা'));
    }
  };

  const leaders = [
    { key: 'head', title: 'প্রধান শিক্ষক', icon: '🎓', desc: 'প্রধান শিক্ষকের ছবি ও বাণী' },
    { key: 'asst_head', title: 'সহকারী প্রধান শিক্ষক', icon: '👩‍🏫', desc: 'সহকারী প্রধান শিক্ষকের ছবি ও বাণী' },
    { key: 'president', title: 'সভাপতি', icon: '👑', desc: 'সভাপতি ম্যানেজিং কমিটির ছবি ও বাণী' }
  ];

  return (
    <div className="module-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="eyebrow" style={{ color: '#0b8050', fontWeight: 700, fontSize: '12px' }}>WEBSITE LEADERSHIP & SPEECHES</span>
            <h2 style={{ margin: '4px 0', fontSize: '20px', color: '#0f172a' }}>বাণী ও ফটো ব্যবস্থাপনা (প্রধান শিক্ষক, সহকারী প্রধান শিক্ষক ও সভাপতি)</h2>
            <p className="portal-muted" style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              লগইন সাইট / অ্যাডমিন প্যানেল থেকে প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষকের ছবি সরাসরি যুক্ত করুন বা পরিবর্তন করুন। এটি সাথে সাথে মূল ওয়েবসাইটের সাইডবার ও বাণী মডালে সরাসরি যুক্ত হবে।
            </p>
          </div>
          <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '20px', fontWeight: 600 }}>
            🌐 সরাসরি লাইভ সাইটে যুক্ত
          </span>
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#065f46' : '#991b1b', border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`, marginBottom: '18px', fontWeight: 600, fontSize: '14px' }}>
            {msg}
          </div>
        )}

        {/* Tab selection */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap' }}>
          {leaders.map(l => (
            <button
              key={l.key}
              type="button"
              onClick={() => setActiveLeaderKey(l.key)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: activeLeaderKey === l.key ? '2px solid #0b8050' : '1px solid #cbd5e1',
                background: activeLeaderKey === l.key ? '#f0fdf4' : '#fff',
                color: activeLeaderKey === l.key ? '#166534' : '#334155',
                fontWeight: activeLeaderKey === l.key ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{l.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{l.title}</div>
                <small style={{ fontSize: '11px', opacity: 0.8 }}>{l.desc}</small>
              </div>
            </button>
          ))}
        </div>

        {/* Active leader form */}
        {(() => {
          const l = data[activeLeaderKey] || DEFAULT_LEADERSHIP_DATA[activeLeaderKey];
          const speechText = Array.isArray(l.speech) ? l.speech.join('\n\n') : (l.speech || '');

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 310px) 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Photo & Preview column */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '15px' }}>বর্তমান ছবি ও প্রোফাইল</h4>
                <div style={{ width: '160px', height: '160px', margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #0b8050', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', background: '#fff' }}>
                  <img src={l.photo} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#0f172a' }}>{l.name}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#0b8050', fontWeight: 700 }}>{l.designation || l.role}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ cursor: 'pointer', background: '#0b8050', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(11,128,80,0.3)' }}>
                    📷 ছবি আপলোড করুন
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/jpg" hidden onChange={(e) => handleFileUpload(activeLeaderKey, e)} />
                  </label>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>JPG, PNG বা WEBP (সর্বোচ্চ 2.5 MB)</small>
                </div>
              </div>

              {/* Information & Speeches column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="field">
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>পূর্ণ নাম (বাংলা) *</label>
                    <input
                      value={l.name || ''}
                      onChange={(e) => updateLeader(activeLeaderKey, 'name', e.target.value)}
                      placeholder="নাম লিখুন"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>পদবী (Designation) *</label>
                    <input
                      value={l.designation || l.role || ''}
                      onChange={(e) => updateLeader(activeLeaderKey, 'designation', e.target.value)}
                      placeholder="পদবী লিখুন"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>ছবির সরাসরি URL / ওয়েব লিংক (ঐচ্ছিক)</label>
                  <input
                    value={l.photo?.startsWith('data:') ? 'uploaded_base64_photo' : (l.photo || '')}
                    onChange={(e) => {
                      if (e.target.value !== 'uploaded_base64_photo') {
                        updateLeader(activeLeaderKey, 'photo', e.target.value);
                      }
                    }}
                    placeholder="https://... অথবা উপরের 'ছবি আপলোড করুন' বাটন ব্যবহার করুন"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>হোমপেজ সাইডবার সংক্ষিপ্ত বার্তা *</label>
                  <textarea
                    rows={2}
                    value={l.msg || ''}
                    onChange={(e) => updateLeader(activeLeaderKey, 'msg', e.target.value)}
                    placeholder="ওয়েবসাইটের হোমপেজে সাইডবারে প্রদর্শিত ১-২ লাইনের সংক্ষিপ্ত বার্তা..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>পূর্ণাঙ্গ বাণী (Modal Speech) — প্যারাগ্রাফের মাঝে এক লাইন ফাঁকা রাখুন *</label>
                  <textarea
                    rows={6}
                    value={speechText}
                    onChange={(e) => updateLeader(activeLeaderKey, 'speech', e.target.value)}
                    placeholder="বিস্তারিত দিকনির্দেশনামূলক বাণী লিখুন..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', lineHeight: '1.6' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => saveSettings(activeLeaderKey)}
                    className="btn"
                    style={{ background: '#0b8050', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(11,128,80,0.3)' }}
                  >
                    💾 সংরক্ষণ ও লাইভ সাইটে আপডেট করুন
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function ChangePassword(){const[cur,setCur]=useState(''),[next,setNext]=useState(''),[msg,setMsg]=useState('');async function submit(e){e.preventDefault();try{const d=await api('/auth/change-password',{method:'POST',body:JSON.stringify({currentPassword:cur,newPassword:next})});setMsg(d.message);setCur('');setNext('');if(d.relogin_required){setTimeout(()=>{localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');window.location.hash='#/login'},700)}}catch(e){setMsg(e.message)}}return <div className="form-card narrow"><h2>নিজের Password পরিবর্তন</h2><form onSubmit={submit}><input type="password" placeholder="বর্তমান Password" value={cur} onChange={e=>setCur(e.target.value)} required/><input type="password" placeholder="নতুন Password (৮+)" minLength="8" value={next} onChange={e=>setNext(e.target.value)} required/><button className="btn">Password পরিবর্তন</button></form>{msg&&<p className="msg">{msg}</p>}</div>}
function NoticePanel(){const[title,setTitle]=useState(''),[body,setBody]=useState(''),[urgent,setUrgent]=useState(false),[msg,setMsg]=useState('');async function submit(e){e.preventDefault();try{await api('/notices',{method:'POST',body:JSON.stringify({title_bn:title,body,published:true,urgent})});setTitle('');setBody('');setUrgent(false);setMsg('নোটিশ প্রকাশ হয়েছে')}catch(e){setMsg(e.message)}}return <div className="form-card"><h2>নতুন নোটিশ প্রকাশ</h2><form onSubmit={submit}><input placeholder="নোটিশের শিরোনাম" value={title} onChange={e=>setTitle(e.target.value)} required/><textarea placeholder="নোটিশের বিস্তারিত" value={body} onChange={e=>setBody(e.target.value)} rows="7"/><label className="check"><input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)}/> জরুরি নোটিশ</label><button className="btn">প্রকাশ করুন</button></form>{msg&&<p className="success">{msg}</p>}</div>}
function NotificationPanel(){
 const [users,setUsers]=useState([]),[selected,setSelected]=useState([]),[title,setTitle]=useState(''),[body,setBody]=useState(''),[group,setGroup]=useState('individual'),[priority,setPriority]=useState('normal'),[type,setType]=useState('general'),[days,setDays]=useState(3),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
 const loadUsers=async(q='')=>{try{setUsers(await api('/notifications/admin/users?q='+encodeURIComponent(q)))}catch(e){setMsg(e.message)}};
 useEffect(()=>{loadUsers()},[]);
 const toggle=id=>setSelected(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);
 async function send(e){e.preventDefault();setLoading(true);try{let d;if(group==='individual'){d=await api('/notifications/send',{method:'POST',body:JSON.stringify({recipient_user_ids:selected,title_bn:title,body,type,priority})})}else{d=await api('/notifications/broadcast',{method:'POST',body:JSON.stringify({recipient_group:group,title_bn:title,body,type,priority})})}setMsg(d.message);setTitle('');setBody('');setSelected([])}catch(e){setMsg(e.message)}finally{setLoading(false)}}
 async function attendanceAlerts(){try{const d=await api('/notifications/attendance-alerts',{method:'POST',body:JSON.stringify({days:Number(days)})});setMsg(`${d.notified} জন অভিভাবককে attendance alert পাঠানো হয়েছে`)}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><div className="toolbar"><div><span className="eyebrow">COMMUNICATION</span><h2>নোটিফিকেশন পাঠান</h2></div><span className="badge">In-app</span></div><form onSubmit={send} className="form-grid"><select value={group} onChange={e=>{setGroup(e.target.value);setSelected([])}}><option value="individual">নির্দিষ্ট ব্যবহারকারী</option><option value="student">সব শিক্ষার্থী</option><option value="guardian">সব অভিভাবক</option><option value="teacher">সব শিক্ষক</option><option value="staff">সব কর্মচারী</option><option value="all">সব সক্রিয় ব্যবহারকারী</option></select><input placeholder="নোটিফিকেশনের শিরোনাম" value={title} onChange={e=>setTitle(e.target.value)} required/><select value={type} onChange={e=>setType(e.target.value)}><option value="general">সাধারণ</option><option value="notice">নোটিশ</option><option value="exam">পরীক্ষা</option><option value="attendance">উপস্থিতি</option><option value="result">ফলাফল</option><option value="fee">ফি</option></select><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="low">সাধারণ</option><option value="normal">Normal</option><option value="high">গুরুত্বপূর্ণ</option><option value="urgent">জরুরি</option></select><textarea rows="6" placeholder="বার্তার বিস্তারিত" value={body} onChange={e=>setBody(e.target.value)} required/>{group==='individual'&&<div className="user-picker"><input placeholder="নাম/Login ID দিয়ে খুঁজুন" onChange={e=>loadUsers(e.target.value)}/><div className="user-list">{users.map(u=><label key={u.id} className="check"><input type="checkbox" checked={selected.includes(u.id)} onChange={()=>toggle(u.id)}/>{u.full_name} <small>• {u.label_bn}</small></label>)}</div><p className="muted">নির্বাচিত: {selected.length} জন</p></div>}<button className="btn full" disabled={loading}>{loading?'পাঠানো হচ্ছে...':'নোটিফিকেশন পাঠান'}</button></form>{msg&&<p className="success">{msg}</p>}</div><div className="form-card"><div className="toolbar"><h2>Smart Attendance Alert</h2><span className="badge">Guardian</span></div><p>নির্দিষ্ট সময়ের মধ্যে একাধিক অনুপস্থিত শিক্ষার্থীর সঙ্গে যুক্ত guardian account-এ স্বয়ংক্রিয় in-app সতর্কতা পাঠানো হবে।</p><div className="form-grid"><input type="number" min="2" max="30" value={days} onChange={e=>setDays(e.target.value)} placeholder="দিন"/><button className="btn" onClick={attendanceAlerts}>Alert তৈরি করুন</button></div><div className="info-card"><b>পরবর্তী ধাপ</b><p>Email, SMS ও Push provider যুক্ত হলে একই notification workflow থেকে multi-channel delivery করা যাবে।</p></div></div></div>
}

/* Old FinancePanel and LibraryPanel replaced by dedicated component files */

function LearningPanel(){
 const[items,setItems]=useState([]),[form,setForm]=useState({class_name:'6',title_bn:'',title_en:'',content_type:'note',content_url:'',body:'',published:true}),[msg,setMsg]=useState('');
 async function load(){try{setItems(await api('/learning?published='));}catch(e){setMsg(e.message)}}useEffect(()=>{load()},[]);
 async function add(e){e.preventDefault();try{await api('/learning',{method:'POST',body:JSON.stringify(form)});setMsg('ডিজিটাল কনটেন্ট প্রকাশ/সংরক্ষণ হয়েছে');setForm({class_name:'6',title_bn:'',title_en:'',content_type:'note',content_url:'',body:'',published:true});load()}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><h2>ডিজিটাল লার্নিং কনটেন্ট</h2><form onSubmit={add} className="form-grid"><select value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})}>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select><input placeholder="বাংলা শিরোনাম" value={form.title_bn} onChange={e=>setForm({...form,title_bn:e.target.value})} required/><input placeholder="English title" value={form.title_en} onChange={e=>setForm({...form,title_en:e.target.value})}/><select value={form.content_type} onChange={e=>setForm({...form,content_type:e.target.value})}><option value="note">নোট</option><option value="pdf">PDF</option><option value="video">ভিডিও</option><option value="lecture">লেকচার</option><option value="link">লিংক</option></select><input placeholder="Content URL (যদি থাকে)" value={form.content_url} onChange={e=>setForm({...form,content_url:e.target.value})}/><textarea placeholder="বিষয়বস্তু/নোট" rows="7" value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/><label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> প্রকাশিত</label><button className="btn">সংরক্ষণ করুন</button></form>{msg&&<p className="msg">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>কনটেন্ট তালিকা</h2><span>{items.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>শ্রেণি</th><th>শিরোনাম</th><th>ধরন</th><th>অবস্থা</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.class_name}</td><td>{x.title_bn}</td><td>{x.content_type}</td><td>{x.published?'প্রকাশিত':'খসড়া'}</td></tr>)}</tbody></table></div></div></div>}
function Portal(){const[data,setData]=useState(null),[msg,setMsg]=useState('');const nav=useNavigate();useEffect(()=>{api('/portal/me').then(setData).catch(e=>{setMsg(e.message);localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');nav('/')})},[nav]);if(!data)return <div className="portal-loading">{msg||'Portal লোড হচ্ছে...'}</div>;return <div className="portal"><header><div className="brand"><img src={logo}/><div><h1>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h1><p>{data.user.full_name} • {data.user.role_label}</p></div></div><button className="btn" onClick={async()=>{try{await api('/auth/logout',{method:'POST'})}catch{} localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');nav('/')}}>লগআউট</button></header><main className="portal-main"><section className="portal-hero"><span className="tag">SUBJECT TEACHER PANEL</span><h2>স্বাগতম, {data.user.full_name}</h2><p>আপনার নির্ধারিত বিষয়ের নম্বর এন্ট্রি, ক্লাস রুটিন ও অ্যাকাডেমিক তথ্য।</p></section><TeacherPortal data={data}/></main></div>}
function Notifications({items=[]}){const[rows,setRows]=useState(items);useEffect(()=>setRows(items),[items]);const unread=rows.filter(x=>!x.is_read).length;const markRead=async(id)=>{try{await api(`/notifications/${id}/read`,{method:'POST'});setRows(rs=>rs.map(x=>x.id===id?{...x,is_read:true}:x))}catch{}};const markAll=async()=>{try{await api('/notifications/read-all',{method:'POST'});setRows(rs=>rs.map(x=>({...x,is_read:true})))}catch{}};return <section className="portal-section"><div className="toolbar"><h2>নোটিফিকেশন</h2><div className="toolbar-actions"><span className="badge">{unread} unread</span>{unread>0&&<button className="mini" onClick={markAll}>সব পড়া হয়েছে</button>}</div></div><div className="notification-list">{rows.length?rows.map(n=><div className={'notification-item '+(!n.is_read?'unread':'')} key={n.id}><div><b>{n.title_bn}</b><p>{n.body||''}</p><small>{n.created_at?new Date(n.created_at).toLocaleString('bn-BD'):''}</small></div>{!n.is_read&&<button className="mini" onClick={()=>markRead(n.id)}>পড়ে ফেলেছি</button>}</div>):<p className="portal-muted">নতুন কোনো নোটিফিকেশন নেই।</p>}</div></section>}
function StudentPortal({data}){
 const s=data.student; const att=Object.fromEntries((data.attendance||[]).map(x=>[x.status,x.count])); const total=(att.present||0)+(att.absent||0)+(att.late||0); const rate=total?Math.round(((att.present||0)/total)*100):null;
 const[activeExam,setActiveExam]=useState(null),[answers,setAnswers]=useState({}),[seconds,setSeconds]=useState(0),[examMsg,setExamMsg]=useState(''),[submitting,setSubmitting]=useState(false);
 const[assignmentDraft,setAssignmentDraft]=useState({}),[assignmentMsg,setAssignmentMsg]=useState('');
 const submitAssignment=async(a)=>{const d=assignmentDraft[a.id]||{};if(!String(d.answer_text||'').trim()&&!String(d.attachment_url||'').trim())return setAssignmentMsg('উত্তর লিখুন অথবা attachment link দিন।');try{await api(`/assignments/${a.id}/submit`,{method:'POST',body:JSON.stringify(d)});setAssignmentMsg('অ্যাসাইনমেন্ট সফলভাবে জমা হয়েছে।');window.location.reload()}catch(e){setAssignmentMsg(e.message)}};
 useEffect(()=>{if(!activeExam)return; const id=setInterval(()=>setSeconds(x=>Math.max(0,x-1)),1000); return()=>clearInterval(id)},[activeExam]);
 useEffect(()=>{if(activeExam&&seconds===0&&activeExam.started){setExamMsg('সময় শেষ হয়েছে। উত্তর জমা দিন।')}},[seconds,activeExam]);
 const startExam=async e=>{try{const r=await api(`/online-exams/${e.id}/start`,{method:'POST'});const attempt=r.attempt||r;const exam=r.exam||e;const qs=r.questions||[];setAnswers({});setExamMsg('');setSeconds(Number(exam.duration_minutes||30)*60);setActiveExam({...exam,attempt,questions:qs,started:true})}catch(err){setExamMsg(err.message)}};
 const submitExam=async()=>{if(!activeExam)return;setSubmitting(true);try{const r=await api(`/online-exams/attempts/${activeExam.attempt.id}/submit`,{method:'POST',body:JSON.stringify({answers:Object.entries(answers).map(([question_id,answer])=>({question_id,answer}))})});setExamMsg(`পরীক্ষা জমা হয়েছে। প্রাপ্ত নম্বর: ${r.score??0}`);setActiveExam(null);window.location.reload()}catch(err){setExamMsg(err.message)}finally{setSubmitting(false)}};
 const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
 return <div className="portal-shell"><div className="portal-cards"><article className="portal-card"><h3>👤 প্রোফাইল</h3><p><b>{s?.name_bn||'প্রোফাইল সংযুক্ত হয়নি'}</b></p><p>আইডি: {s?.student_id||'—'}<br/>শ্রেণি: {s?.class_name||'—'} • রোল: {s?.roll_no||'—'}</p></article><article className="portal-card"><h3>📊 উপস্থিতি</h3><div className="portal-kpi">{rate===null?'—':rate+'%'}</div><p>উপস্থিত {att.present||0} • অনুপস্থিত {att.absent||0} • দেরি {att.late||0}</p></article><article className="portal-card"><h3>📈 ফলাফল</h3><div className="portal-kpi">{data.results?.length?Math.round((data.results.reduce((a,r)=>a+Number(r.total||0),0)/data.results.length)*100)/100:'—'}</div><p>গড় প্রাপ্ত নম্বর • {data.results?.filter(r=>r.grade==='F').length||0} বিষয়ে F</p></article><article className="portal-card"><h3>💳 ফি</h3><p>মোট বিল <b>{data.finance?.billed||0}</b></p><p>পরিশোধ <b>{data.finance?.paid||0}</b></p><p>বকেয়া <b>{Math.max(0,Number(data.finance?.billed||0)-Number(data.finance?.paid||0))}</b></p></article><article className="portal-card"><h3>📚 লাইব্রেরি</h3><div className="portal-kpi">{(data.library||[]).filter(x=>!x.returned_at).length}</div><p>চলমান বই</p></article></div>
 <section className="portal-section"><h2>ফলাফল</h2><div className="portal-scroll"><table className="portal-table"><thead><tr><th>পরীক্ষা</th><th>বিষয়</th><th>মোট</th><th>গ্রেড</th><th>GPA</th></tr></thead><tbody>{(data.results||[]).map(r=><tr key={r.id}><td>{r.exam_name}</td><td>{r.subject_name||'—'}</td><td>{r.total??'—'}</td><td>{r.grade||'—'}</td><td>{r.gpa??'—'}</td></tr>)}{!data.results?.length&&<tr><td colSpan="5">এখনো ফলাফল প্রকাশিত হয়নি।</td></tr>}</tbody></table></div></section>
 <section className="portal-section"><h2>ক্লাস রুটিন</h2><div className="portal-scroll"><table className="portal-table"><thead><tr><th>দিন</th><th>সময়</th><th>বিষয়</th><th>শিক্ষক</th><th>কক্ষ</th></tr></thead><tbody>{(data.routine||[]).map(r=><tr key={r.id}><td>{['','শনিবার','রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার'][r.day_of_week]||r.day_of_week}</td><td>{String(r.start_time).slice(0,5)}–{String(r.end_time).slice(0,5)}</td><td>{r.subject_name||'—'}</td><td>{r.teacher_name||'—'}</td><td>{r.room||'—'}</td></tr>)}</tbody></table></div></section>
 <section className="portal-section"><div className="toolbar"><div><span className="eyebrow">HOMEWORK</span><h2>অ্যাসাইনমেন্ট</h2></div><span className="badge">{(data.assignments||[]).length} টি</span></div><div className="content-list">{(data.assignments||[]).map(a=>{const d=assignmentDraft[a.id]||{};const submitted=!!a.submission_id;return <div className="content-item" key={a.id}><b>{a.title_bn}</b><p>{a.subject_name||'সাধারণ'} • পূর্ণমান {a.max_marks}</p><p>{a.description||''}</p><small>জমাদানের সময়: {a.due_at?new Date(a.due_at).toLocaleString('bn-BD'):'নির্ধারিত নয়'} • {submitted?`জমা হয়েছে${a.marks!=null?` • নম্বর ${a.marks}`:''}`:'এখনো জমা হয়নি'}</small>{!submitted&&<div className="form-grid"><textarea rows="3" placeholder="আপনার উত্তর লিখুন" value={d.answer_text||''} onChange={e=>setAssignmentDraft({...assignmentDraft,[a.id]:{...d,answer_text:e.target.value}})}/><input placeholder="Attachment URL (ঐচ্ছিক)" value={d.attachment_url||''} onChange={e=>setAssignmentDraft({...assignmentDraft,[a.id]:{...d,attachment_url:e.target.value}})}/><button className="mini" onClick={()=>submitAssignment(a)}>অ্যাসাইনমেন্ট জমা দিন</button></div>}{a.teacher_feedback&&<p className="msg">শিক্ষকের মন্তব্য: {a.teacher_feedback}</p>}</div>})}{!data.assignments?.length&&<p className="portal-muted">কোনো অ্যাসাইনমেন্ট নেই।</p>}</div>{assignmentMsg&&<p className="msg">{assignmentMsg}</p>}</section>
 <section className="portal-section"><h2>ডিজিটাল লার্নিং</h2><div className="content-list">{(data.learning||[]).map(x=><div className="content-item" key={x.id}><b>{x.title_bn}</b><p>{x.subject_name||'সাধারণ'} • {x.content_type}</p><p>{x.body||''}</p>{x.content_url&&<a href={x.content_url} target="_blank" rel="noreferrer">কনটেন্ট খুলুন →</a>}</div>)}</div>{!data.learning?.length&&<p className="portal-muted">এখনো কোনো ডিজিটাল কনটেন্ট প্রকাশিত হয়নি।</p>}</section>
 <section className="portal-section"><div className="toolbar"><div><span className="eyebrow">ONLINE ASSESSMENT</span><h2>অনলাইন পরীক্ষা ও কুইজ</h2></div><span className="badge">{(data.onlineExams||[]).length} টি</span></div><div className="content-list">{(data.onlineExams||[]).map(e=><div className="content-item" key={e.id}><b>{e.title_bn}</b><p>সময়: {e.duration_minutes} মিনিট • পূর্ণমান: {e.total_marks} • পাস: {e.pass_marks}</p><p>অবস্থা: {e.attempt_status==='submitted'?`জমা হয়েছে • স্কোর ${e.score??0}`:'অংশগ্রহণ করা হয়নি'}</p>{e.attempt_status!=='submitted'&&<button className="mini" onClick={()=>startExam(e)}>পরীক্ষা শুরু করুন</button>}</div>)}{!data.onlineExams?.length&&<p className="portal-muted">বর্তমানে কোনো প্রকাশিত অনলাইন পরীক্ষা নেই।</p>}</div>{examMsg&&<p className="msg">{examMsg}</p>}</section>
 {activeExam&&<div className="exam-overlay"><div className="exam-modal"><div className="exam-head"><div><span className="eyebrow">ONLINE EXAM</span><h2>{activeExam.title_bn}</h2><p>{activeExam.questions.length}টি প্রশ্ন • পূর্ণমান {activeExam.total_marks}</p></div><div className="exam-timer">⏱ {fmt(seconds)}</div></div><div className="exam-questions">{activeExam.questions.map((q,i)=><article className="exam-question" key={q.question_id}><h3>{i+1}. {q.question_bn}</h3>{q.question_en&&<p className="muted">{q.question_en}</p>}{Array.isArray(q.options)&&q.options.length>0?<div className="option-list">{q.options.map((o,j)=>{const val=typeof o==='object'?(o.value??o.label??''):o;return <label key={j} className="option"><input type="radio" name={`q-${q.question_id}`} checked={String(answers[q.question_id]??'')===String(val)} onChange={()=>setAnswers({...answers,[q.question_id]:val})}/><span>{String.fromCharCode(65+j)}. {val}</span></label>})}</div>:<textarea rows="4" placeholder="আপনার উত্তর লিখুন" value={answers[q.question_id]??''} onChange={e=>setAnswers({...answers,[q.question_id]:e.target.value})}/>}<small>নম্বর: {q.marks}</small></article>)}</div><div className="exam-footer"><span>উত্তর দেওয়া হয়েছে: {Object.keys(answers).length}/{activeExam.questions.length}</span><div><button className="mini" onClick={()=>setActiveExam(null)}>বাতিল</button><button className="btn" onClick={submitExam} disabled={submitting}>{submitting?'জমা হচ্ছে...':'✓ পরীক্ষা জমা দিন'}</button></div></div></div></div>}
 <Notifications items={data.notifications}/></div>}
function GuardianPortal({data}){
 const students=data.students||[];
 const summary=(id)=> (data.guardianSummary||[]).find(x=>x.student_id===id)||{};
 const attendancePct=(x)=>x.total?Math.round((Number(x.present||0)/Number(x.total))*100):0;
 return <div className="portal-shell">
  <section className="portal-section"><div className="toolbar"><div><span className="eyebrow">GUARDIAN DASHBOARD</span><h2>আমার শিক্ষার্থীরা</h2></div><span className="badge">{students.length} জন</span></div><div className="portal-cards">{students.map(s=>{const x=summary(s.id);return <article className="portal-card guardian-student" key={s.id}><h3>{s.name_bn}</h3><p>শ্রেণি {s.class_name} • রোল {s.roll_no||'—'} • সম্পর্ক: {s.relation}</p><div className="metric-row"><span><b>{attendancePct(x)}%</b><small>উপস্থিতি</small></span><span><b>{x.avg_marks??'—'}</b><small>গড় নম্বর</small></span><span><b>{x.avg_gpa??'—'}</b><small>গড় GPA</small></span></div></article>})}</div>{!students.length&&<p className="portal-muted">প্রশাসন থেকে guardian account-এর সঙ্গে শিক্ষার্থী link করতে হবে।</p>}</section>
  <section className="portal-section"><div className="toolbar"><h2>উপস্থিতি ও পারফরম্যান্স</h2><span>সারাংশ</span></div><div className="portal-cards">{students.map(s=>{const x=summary(s.id);return <article className="portal-card" key={s.id}><h3>{s.name_bn}</h3><div className="progress-label"><span>উপস্থিতি</span><b>{attendancePct(x)}%</b></div><div className="progress"><i style={{width:`${attendancePct(x)}%`}}/></div><p>উপস্থিত {x.present||0} • অনুপস্থিত {x.absent||0} • দেরি {x.late||0}</p><p>পাস বিষয়: {x.passed||0} • অকৃতকার্য: {x.failed||0}</p></article>})}</div></section>
  <section className="portal-section"><h2>সাম্প্রতিক ফলাফল</h2><div className="portal-scroll"><table className="portal-table"><thead><tr><th>শিক্ষার্থী</th><th>পরীক্ষা</th><th>বিষয়</th><th>মোট</th><th>গ্রেড</th><th>GPA</th></tr></thead><tbody>{(data.results||[]).map((r,i)=><tr key={i}><td>{students.find(s=>s.id===r.student_id)?.name_bn||'—'}</td><td>{r.exam_name}</td><td>{r.subject_name||'—'}</td><td>{r.total??'—'}</td><td>{r.grade||'—'}</td><td>{r.gpa??'—'}</td></tr>)}{!data.results?.length&&<tr><td colSpan="6">ফলাফল নেই।</td></tr>}</tbody></table></div></section>
  <section className="portal-section"><h2>পরীক্ষার সময়সূচি</h2><div className="portal-cards">{(data.examSchedule||[]).map(e=><article className="portal-card" key={e.id}><h3>{e.name_bn}</h3><p>{e.exam_type||'পরীক্ষা'} • {e.subject_count||0} বিষয়</p><b>{e.start_date||'—'} → {e.end_date||'—'}</b></article>)}{!data.examSchedule?.length&&<p className="portal-muted">কোনো প্রকাশিত পরীক্ষার সময়সূচি নেই।</p>}</div></section>
  <section className="portal-section"><h2>অনলাইন পরীক্ষা</h2><div className="portal-cards">{(data.onlineExams||[]).map(e=><article className="portal-card" key={e.id}><h3>{e.title_bn}</h3><p>{e.class_name} • {e.subject_name||'সাধারণ'} • {e.duration_minutes} মিনিট</p><p>পূর্ণমান: <b>{e.total_marks}</b> • পাস: <b>{e.pass_marks}</b></p><small>{e.starts_at?new Date(e.starts_at).toLocaleString('bn-BD'):''} থেকে {e.ends_at?new Date(e.ends_at).toLocaleString('bn-BD'):''}</small></article>)}{!data.onlineExams?.length&&<p className="portal-muted">বর্তমানে কোনো অনলাইন পরীক্ষা প্রকাশিত নেই।</p>}</div></section>
  <section className="portal-section"><h2>ফি ও বকেয়া</h2><div className="portal-cards">{students.map(st=>{const f=(data.finance||[]).find(x=>x.student_id===st.id)||{};const due=Math.max(0,Number(f.billed||0)-Number(f.paid||0));return <article className="portal-card" key={st.id}><h3>{st.name_bn}</h3><p>মোট বিল: <b>{f.billed||0}</b></p><p>পরিশোধ: <b>{f.paid||0}</b></p><p className={due>0?'due-text':''}>বকেয়া: <b>{due}</b></p></article>})}</div></section>
  <section className="portal-section"><h2>অ্যাসাইনমেন্ট</h2><div className="content-list">{(data.assignments||[]).map(a=><div className="content-item" key={a.id}><b>{a.title_bn}</b><p>{a.class_name} • {a.subject_name||'সাধারণ'} • পূর্ণমান {a.max_marks}</p><small>জমা: {a.due_at?new Date(a.due_at).toLocaleString('bn-BD'):'নির্ধারিত নয়'}</small></div>)}{!data.assignments?.length&&<p className="portal-muted">কোনো অ্যাসাইনমেন্ট নেই।</p>}</div></section>
  <section className="portal-section"><div className="toolbar"><h2>শিক্ষক/বিদ্যালয় যোগাযোগ</h2><span className="badge">নোটিফিকেশন</span></div><p className="portal-muted">বিদ্যালয় বা শিক্ষকের পাঠানো বার্তা ও গুরুত্বপূর্ণ ঘোষণা এখানে দেখুন।</p><Notifications items={data.notifications}/></section>
  <section className="portal-section"><h2>ক্লাস রুটিন</h2><div className="portal-scroll"><table className="portal-table"><thead><tr><th>শ্রেণি</th><th>দিন</th><th>সময়</th><th>বিষয়</th><th>শিক্ষক</th></tr></thead><tbody>{(data.routine||[]).map((r,i)=><tr key={i}><td>{r.class_name}</td><td>{r.day_of_week}</td><td>{String(r.start_time).slice(0,5)}–{String(r.end_time).slice(0,5)}</td><td>{r.subject_name||'—'}</td><td>{r.teacher_name||'—'}</td></tr>)}</tbody></table></div></section>
 </div>
}
function TeacherPortal({data}){
 const nav = useNavigate();
 const [portalTab, setPortalTab] = useState('results'); // 'overview' | 'finance' | 'results'
 const classesForTeacher=[...new Map((data.today_routine||[]).map(r=>[`${r.class_name}|${r.section||''}`,{class_name:r.class_name,section:r.section||''}])) .values()];
 const[date,setDate]=useState(new Date().toISOString().slice(0,10)),[selected,setSelected]=useState(''),[roster,setRoster]=useState([]),[msg,setMsg]=useState('');
 const[exams,setExams]=useState([]),[subjects,setSubjects]=useState([]),[examId,setExamId]=useState(''),[subjectId,setSubjectId]=useState(''),[marks,setMarks]=useState([]),[marksMeta,setMarksMeta]=useState(null),[marksMsg,setMarksMsg]=useState('');
 const[submissionRows,setSubmissionRows]=useState([]),[submissionMsg,setSubmissionMsg]=useState(''); const[gradeDraft,setGradeDraft]=useState({});

 useEffect(()=>{if(classesForTeacher.length&&!selected)setSelected(`${classesForTeacher[0].class_name}|${classesForTeacher[0].section}`)},[classesForTeacher.length]);
 const chosen=classesForTeacher.find(x=>`${x.class_name}|${x.section}`===selected)||classesForTeacher[0];

 async function loadRoster(){if(!chosen)return setMsg('রুটিনে কোনো শ্রেণি পাওয়া যায়নি');try{setMsg('');const d=await api(`/portal/teacher/roster?date=${date}&class_name=${encodeURIComponent(chosen.class_name)}&section=${encodeURIComponent(chosen.section||'')}`);setRoster(Array.isArray(d)?d:[])}catch(e){setMsg(e.message)}}
 useEffect(()=>{if(chosen)loadRoster()},[date,selected]);
 useEffect(()=>{api('/exams').then(setExams).catch(()=>{});},[]);
 useEffect(()=>{if(chosen)api(`/subjects?class_name=${encodeURIComponent(chosen.class_name)}`).then(setSubjects).catch(()=>{})},[selected]);
 useEffect(()=>{if(!examId||!subjectId||!chosen)return;loadMarks()},[examId,subjectId,selected]);

 async function loadMarks(){try{setMarksMsg('');const d=await api(`/portal/teacher/marks-roster?exam_id=${examId}&class_name=${encodeURIComponent(chosen.class_name)}&section=${encodeURIComponent(chosen.section||'')}&subject_id=${subjectId}`);setMarksMeta(d.meta);setMarks(Array.isArray(d.students)?d.students:[])}catch(e){setMarks([]);setMarksMeta(null);setMarksMsg(e.message)}}
 function setStatus(i,status){setRoster(a=>a.map((x,n)=>n===i?{...x,status}:x))}
 async function saveAttendance(){try{const d=await api('/attendance/bulk',{method:'POST',body:JSON.stringify({date,records:roster.map(x=>({student_id:x.id,status:x.status,remarks:x.remarks}))})});setMsg(`${d.count} জনের উপস্থিতি সংরক্ষণ হয়েছে`)}catch(e){setMsg(e.message)}}
 function updateMark(i,k,v){setMarks(a=>a.map((x,n)=>n===i?{...x,[k]:v}:x))}
 async function loadSubmissions(id){if(!id){setSubmissionRows([]);return}try{setSubmissionMsg('');setSubmissionRows(await api(`/portal/teacher/assignment-submissions?assignment_id=${id}`))}catch(e){setSubmissionMsg(e.message);setSubmissionRows([])}}
 async function gradeSubmission(id){const d=gradeDraft[id]||{};try{await api(`/portal/teacher/assignment-submissions/${id}`,{method:'PATCH',body:JSON.stringify({marks:d.marks,teacher_feedback:d.teacher_feedback})});setSubmissionMsg('মূল্যায়ন সংরক্ষণ হয়েছে');loadSubmissions(d.assignment_id)}catch(e){setSubmissionMsg(e.message)}}
 async function saveMarks(){try{if(!marks.length)return;const d=await api('/portal/teacher/marks-save',{method:'POST',body:JSON.stringify({exam_id:examId,class_name:chosen.class_name,section:chosen.section||'',records:marks.map(x=>({student_id:x.id,subject_id:subjectId,written:x.written,mcq:x.mcq,practical:x.practical,absent:x.absent,remarks:x.remarks}))})});setMarksMsg(`${d.count} জনের নম্বর সংরক্ষণ হয়েছে`);loadMarks()}catch(e){setMarksMsg(e.message)}}

 // VIEW: Attendance Panel (Class Teacher Smart Attendance Suite)
 if (portalTab === 'attendance') {
   return (
     <div className="portal-shell">
       <div style={{
         display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
         background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
         color: '#ffffff', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
         boxShadow: '0 4px 12px rgba(6,78,59,0.2)'
       }}>
         <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '24px' }}>🕘</span>
             <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
               স্মার্ট শিক্ষার্থী উপস্থিতি ও অভিভাবক যোগাযোগ (শ্রেণি শিক্ষক প্যানেল)
             </h2>
             <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
               অনলাইন ও অফলাইন মোড
             </span>
           </div>
           <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.9 }}>
             {data.teacher?.name_bn || data.user.full_name} • শ্রেণি শিক্ষক হিসেবে উপস্থিতি গ্রহণ করুন, WhatsApp/SMS সতর্কবার্তা পাঠান এবং দৈনিক, সাপ্তাহিক ও মাসিক রিপোর্ট প্রস্তুত করুন
           </p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
           <button
             type="button"
             className="btn"
             onClick={() => setPortalTab('overview')}
             style={{ background: '#ffffff', color: '#064e3b', fontWeight: 800, fontSize: '13px' }}
           >
             ← শিক্ষক পোর্টালে ফিরুন
           </button>
         </div>
       </div>
       <AttendancePanel sub="daily" />
     </div>
   );
 }

 // VIEW: Finance Panel (Class Teacher Fee Collection)
 if (portalTab === 'finance') {
   return (
     <div className="portal-shell">
       <div style={{
         display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
         background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
         color: '#ffffff', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
         boxShadow: '0 4px 12px rgba(6,78,59,0.2)'
       }}>
         <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '24px' }}>💳</span>
             <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
               শ্রেণি ফি আদায় ও মানি রসিদ (শ্রেণি শিক্ষক প্যানেল)
             </h2>
             <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
               শ্রেণি শিক্ষক মোড
             </span>
           </div>
           <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.9 }}>
             {data.teacher?.name_bn || data.user.full_name} • শ্রেণি শিক্ষক হিসেবে আপনার শ্রেণির ফি আদায় করুন এবং মানি রসিদ প্রিন্ট করুন
           </p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
           <button
             type="button"
             className="btn"
             onClick={() => setPortalTab('overview')}
             style={{ background: '#ffffff', color: '#064e3b', fontWeight: 800, fontSize: '13px' }}
           >
             ← শিক্ষক পোর্টালে ফিরুন
           </button>
         </div>
       </div>
       <FinancePanel sub="collect" />
     </div>
   );
 }

 // VIEW: Result Panel (Subject Teacher Marks Entry)
 if (portalTab === 'results') {
   return (
     <div className="portal-shell">
       <div style={{
         display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
         background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
         color: '#ffffff', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
         boxShadow: '0 4px 12px rgba(15,118,110,0.2)'
       }}>
         <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '24px' }}>📈</span>
             <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
               বিষয়ভিত্তিক নম্বর এন্ট্রি (পরীক্ষা ও ফলাফল - বিষয় শিক্ষক প্যানেল)
             </h2>
             <span style={{ background: '#ccfbf1', color: '#115e59', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
               বিষয় শিক্ষক মোড
             </span>
           </div>
           <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.9 }}>
             {data.teacher?.name_bn || data.user.full_name} • বিষয় শিক্ষক হিসেবে আপনার নির্ধারিত বিষয়ের পরীক্ষার লিখিত, MCQ ও ব্যবহারিক নম্বর এন্ট্রি করুন
           </p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
           <button
             type="button"
             className="btn"
             onClick={() => setPortalTab('overview')}
             style={{ background: '#ffffff', color: '#0f766e', fontWeight: 800, fontSize: '13px' }}
           >
             ← শিক্ষক পোর্টালে ফিরুন
           </button>
         </div>
       </div>
       <ResultPanel sub="marks" />
     </div>
   );
 }

 // VIEW: Teacher Portal Overview
 return (
   <div className="portal-shell">
     {/* Portal Navigation & Dual-Role Banner */}
     <div style={{
       display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
       background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '14px 20px', marginBottom: '18px',
       boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
     }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
         <span style={{ fontSize: '26px' }}>👨‍🏫</span>
         <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <b style={{ fontSize: '16px', color: '#0f172a' }}>{data.teacher?.name_bn || data.user.full_name}</b>
             <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
               শ্রেণি শিক্ষক ও বিষয় শিক্ষক
             </span>
           </div>
           <small style={{ color: '#64748b', fontSize: '12px' }}>
             পদবী: {data.teacher?.designation || 'সহকারী শিক্ষক'} • বিষয়: {data.teacher?.subject || 'সকল বিষয়'}
           </small>
         </div>
       </div>

       <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
         <button
           type="button"
           onClick={() => setPortalTab('attendance')}
           style={{
             background: '#059669', color: '#ffffff', border: 'none',
             padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
             fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
           }}
         >
           🕘 স্মার্ট উপস্থিতি ও রিপোর্ট
         </button>
         <button
           type="button"
           onClick={() => setPortalTab('finance')}
           style={{
             background: '#047857', color: '#ffffff', border: 'none',
             padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
             fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
           }}
         >
           💳 শ্রেণি ফি আদায়
         </button>
         <button
           type="button"
           onClick={() => setPortalTab('results')}
           style={{
             background: '#0284c7', color: '#ffffff', border: 'none',
             padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
             fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
           }}
         >
           📈 নম্বর এন্ট্রি (পরীক্ষা ও ফলাফল)
         </button>
         <button
           type="button"
           onClick={() => nav('/admin')}
           style={{
             background: '#1e293b', color: '#ffffff', border: 'none',
             padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px',
             fontWeight: 700, cursor: 'pointer'
           }}
         >
           🏛️ সম্পূর্ণ ERP প্যানেল
         </button>
       </div>
     </div>

     {/* Quick Feature Cards */}
     <div className="portal-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
       <article className="portal-card" style={{ borderLeft: '4px solid #059669', background: '#f0fdf4' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
             <h3 style={{ margin: 0, color: '#065f46', fontSize: '16px' }}>💳 শ্রেণি ফি আদায়</h3>
             <small style={{ color: '#047857', fontWeight: 600 }}>শ্রেণি শিক্ষক হিসেবে আদায় করুন</small>
           </div>
           <span style={{ fontSize: '24px' }}>💵</span>
         </div>
         <p style={{ margin: '8px 0 12px', fontSize: '12px', color: '#334155' }}>
           আপনার শ্রেণির শিক্ষার্থীদের মাসিক বেতন, সেশন ও পরীক্ষার ফি আদায় করে ডাবল-স্লিপ মানি রসিদ প্রিন্ট করুন।
         </p>
         <button
           type="button"
           onClick={() => setPortalTab('finance')}
           style={{
             background: '#047857', color: '#ffffff', border: 'none',
             padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
             fontWeight: 700, cursor: 'pointer', width: '100%'
           }}
         >
           ফি আদায় উইন্ডো খুলুন →
         </button>
       </article>

       <article className="portal-card" style={{ borderLeft: '4px solid #0284c7', background: '#f0f9ff' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
             <h3 style={{ margin: 0, color: '#0369a1', fontSize: '16px' }}>📈 বিষয়ভিত্তিক নম্বর এন্ট্রি</h3>
             <small style={{ color: '#0284c7', fontWeight: 600 }}>বিষয় শিক্ষক হিসেবে এন্ট্রি করুন</small>
           </div>
           <span style={{ fontSize: '24px' }}>📝</span>
         </div>
         <p style={{ margin: '8px 0 12px', fontSize: '12px', color: '#334155' }}>
           পরীক্ষা ও শ্রেণি নির্বাচন করে আপনার নির্ধারিত বিষয়ের শিক্ষার্থীদের লিখিত, MCQ ও ব্যবহারিক নম্বর এন্ট্রি করুন।
         </p>
         <button
           type="button"
           onClick={() => setPortalTab('results')}
           style={{
             background: '#0284c7', color: '#ffffff', border: 'none',
             padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
             fontWeight: 700, cursor: 'pointer', width: '100%'
           }}
         >
           নম্বর এন্ট্রি উইন্ডো খুলুন →
         </button>
       </article>

       <article className="portal-card">
         <h3>📚 অ্যাসাইনমেন্ট</h3>
         <div className="portal-kpi">{data.assignments?.length||0}</div>
         <p>আপনার তৈরি ও মূল্যায়নযোগ্য</p>
       </article>

       <article className="portal-card">
         <h3>👥 দায়িত্বপ্রাপ্ত শ্রেণি</h3>
         <div className="portal-kpi">{classesForTeacher.length}</div>
         <p>রুটিন অনুযায়ী নির্ধারিত</p>
       </article>
     </div>

     {/* Smart Attendance Tool */}
     <section className="portal-section">
       <div className="toolbar">
         <div>
           <span className="eyebrow">TEACHER TOOLS</span>
           <h2>দ্রুত উপস্থিতি (Daily Attendance)</h2>
         </div>
         <button className="btn" onClick={saveAttendance} disabled={!roster.length}>
           উপস্থিতি সংরক্ষণ
         </button>
       </div>
       <div className="filters">
         <input type="date" value={date} onChange={e=>setDate(e.target.value)}/>
         <select value={selected} onChange={e=>setSelected(e.target.value)}>
           {classesForTeacher.map(x=><option key={`${x.class_name}|${x.section}`} value={`${x.class_name}|${x.section}`}>শ্রেণি {x.class_name}{x.section?' • '+x.section:''}</option>)}
         </select>
       </div>
       {msg&&<p className="msg">{msg}</p>}
       <div className="portal-scroll">
         <table className="portal-table">
           <thead>
             <tr><th>রোল</th><th>শিক্ষার্থী</th><th>উপস্থিতি</th></tr>
           </thead>
           <tbody>
             {roster.map((r,i)=>(
               <tr key={r.id}>
                 <td>{r.roll_no||'—'}</td>
                 <td>{r.name_bn}</td>
                 <td>
                   <div className="attendance-actions">
                     <button className={r.status==='present'?'active':''} onClick={()=>setStatus(i,'present')}>উপস্থিত</button>
                     <button className={r.status==='absent'?'active':''} onClick={()=>setStatus(i,'absent')}>অনুপস্থিত</button>
                     <button className={r.status==='late'?'active':''} onClick={()=>setStatus(i,'late')}>দেরি</button>
                   </div>
                 </td>
               </tr>
             ))}
             {!roster.length&&<tr><td colSpan="3">এই তারিখে কোনো শিক্ষার্থী পাওয়া যায়নি।</td></tr>}
           </tbody>
         </table>
       </div>
     </section>

     {/* Marks Entry Mini-Section */}
     <section className="portal-section">
       <div className="toolbar">
         <div>
           <span className="eyebrow">RESULT MANAGEMENT</span>
           <h2>নম্বর এন্ট্রি (Marks Entry)</h2>
         </div>
         <div style={{ display: 'flex', gap: '8px' }}>
           <button className="btn" onClick={saveMarks} disabled={!marks.length}>নম্বর সংরক্ষণ</button>
           <button className="btn mini" onClick={() => setPortalTab('results')} style={{ background: '#0284c7', color: '#fff' }}>
             পূর্ণাঙ্গ রেজাল্ট প্যানেল →
           </button>
         </div>
       </div>
       <div className="filters">
         <select value={examId} onChange={e=>setExamId(e.target.value)}>
           <option value="">পরীক্ষা নির্বাচন</option>
           {exams.map(e=><option key={e.id} value={e.id}>{e.name_bn}</option>)}
         </select>
         <select value={subjectId} onChange={e=>setSubjectId(e.target.value)}>
           <option value="">বিষয় নির্বাচন</option>
           {subjects.map(x=><option key={x.id} value={x.id}>{x.code} — {x.name_bn}</option>)}
         </select>
       </div>
       {marksMeta&&<p className="msg">{marksMeta.name_bn} • পূর্ণমান {marksMeta.full_marks} • লিখিত {marksMeta.written_max||0} • MCQ {marksMeta.mcq_max||0} • ব্যবহারিক {marksMeta.practical_max||0}</p>}
       {marksMsg&&<p className="msg">{marksMsg}</p>}
       <div className="portal-scroll">
         <table className="portal-table">
           <thead>
             <tr><th>রোল</th><th>শিক্ষার্থী</th><th>লিখিত</th><th>MCQ</th><th>ব্যবহারিক</th><th>অনুপস্থিত</th></tr>
           </thead>
           <tbody>
             {marks.map((r,i)=>(
               <tr key={r.id}>
                 <td>{r.roll_no||'—'}</td>
                 <td>{r.name_bn}</td>
                 <td><input className="mark-input" type="number" min="0" max={marksMeta?.written_max||undefined} value={r.written??''} onChange={e=>updateMark(i,'written',e.target.value)}/></td>
                 <td><input className="mark-input" type="number" min="0" max={marksMeta?.mcq_max||undefined} value={r.mcq??''} onChange={e=>updateMark(i,'mcq',e.target.value)}/></td>
                 <td><input className="mark-input" type="number" min="0" max={marksMeta?.practical_max||undefined} value={r.practical??''} onChange={e=>updateMark(i,'practical',e.target.value)}/></td>
                 <td><input type="checkbox" checked={!!r.absent} onChange={e=>updateMark(i,'absent',e.target.checked)}/></td>
               </tr>
             ))}
             {!marks.length&&<tr><td colSpan="6">পরীক্ষা ও বিষয় নির্বাচন করলে শিক্ষার্থীদের নম্বর এন্ট্রি তালিকা আসবে।</td></tr>}
           </tbody>
         </table>
       </div>
     </section>

     {/* Class Routine */}
     <section className="portal-section">
       <h2>ক্লাস রুটিন</h2>
       <div className="portal-scroll">
         <table className="portal-table">
           <thead>
             <tr><th>দিন</th><th>সময়</th><th>বিষয়</th><th>শ্রেণি</th><th>কক্ষ</th></tr>
           </thead>
           <tbody>
             {(data.today_routine||[]).map(r=>(
               <tr key={r.id}>
                 <td>{r.day_of_week}</td>
                 <td>{String(r.start_time).slice(0,5)}–{String(r.end_time).slice(0,5)}</td>
                 <td>{r.subject_name||'—'}</td>
                 <td>{r.class_name}</td>
                 <td>{r.room||'—'}</td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </section>

     {/* Homework & Assignment Review */}
     <section className="portal-section">
       <div className="toolbar">
         <div>
           <span className="eyebrow">HOMEWORK REVIEW</span>
           <h2>অ্যাসাইনমেন্ট ও জমা মূল্যায়ন</h2>
         </div>
       </div>
       <div className="form-grid">
         <select onChange={e=>{const id=e.target.value;setGradeDraft({});loadSubmissions(id)}}>
           <option value="">অ্যাসাইনমেন্ট নির্বাচন</option>
           {(data.assignments||[]).map(a=><option key={a.id} value={a.id}>{a.title_bn} • {a.submission_count||0} জমা</option>)}
         </select>
       </div>
       {submissionMsg&&<p className="msg">{submissionMsg}</p>}
       <div className="portal-scroll">
         <table className="portal-table">
           <thead>
             <tr><th>রোল</th><th>শিক্ষার্থী</th><th>উত্তর</th><th>নম্বর</th><th>মন্তব্য</th><th>কাজ</th></tr>
           </thead>
           <tbody>
             {submissionRows.map(r=>{
               const d=gradeDraft[r.id]||{marks:r.marks??'',teacher_feedback:r.teacher_feedback||'',assignment_id:r.assignment_id};
               return (
                 <tr key={r.id}>
                   <td>{r.roll_no||'—'}</td>
                   <td>{r.name_bn}</td>
                   <td>{r.answer_text||'—'}{r.attachment_url&&<><br/><a href={r.attachment_url} target="_blank" rel="noreferrer">Attachment</a></>}</td>
                   <td><input className="mark-input" type="number" min="0" max={r.max_marks} value={d.marks} onChange={e=>setGradeDraft({...gradeDraft,[r.id]:{...d,marks:e.target.value}})}/><small>/{r.max_marks}</small></td>
                   <td><input value={d.teacher_feedback} onChange={e=>setGradeDraft({...gradeDraft,[r.id]:{...d,teacher_feedback:e.target.value}})}/></td>
                   <td><button className="mini" onClick={()=>gradeSubmission(r.id)}>মূল্যায়ন</button></td>
                 </tr>
               );
             })}
             {!submissionRows.length&&<tr><td colSpan="6">অ্যাসাইনমেন্ট নির্বাচন করলে জমা দেওয়া শিক্ষার্থীদের তালিকা আসবে।</td></tr>}
           </tbody>
         </table>
       </div>
     </section>

     <Notifications items={data.notifications}/>
   </div>
 );
}

function QuestionPanel(){const[rows,setRows]=useState([]),[form,setForm]=useState({class_name:'6',question_type:'mcq',question_bn:'',chapter:'',marks:1,correct_answer:'',options:['ক','খ','গ','ঘ']}),[msg,setMsg]=useState('');const load=()=>api('/questions').then(setRows).catch(e=>setMsg(e.message));useEffect(load,[]);async function save(e){e.preventDefault();try{await api('/questions',{method:'POST',body:JSON.stringify(form)});setMsg('প্রশ্ন সংরক্ষণ হয়েছে');setForm({...form,question_bn:'',correct_answer:''});load()}catch(e){setMsg(e.message)}}return <div className="form-card"><h2>প্রশ্ন ব্যাংক</h2><form onSubmit={save} className="form-grid"><select value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})}>{classes.map(c=><option key={c}>{c}</option>)}</select><select value={form.question_type} onChange={e=>setForm({...form,question_type:e.target.value})}><option value="mcq">MCQ</option><option value="cq">CQ</option><option value="short">সংক্ষিপ্ত</option></select><input placeholder="অধ্যায়" value={form.chapter} onChange={e=>setForm({...form,chapter:e.target.value})}/><input className="full" placeholder="প্রশ্ন *" value={form.question_bn} onChange={e=>setForm({...form,question_bn:e.target.value})} required/><input placeholder="সঠিক উত্তর" value={form.correct_answer} onChange={e=>setForm({...form,correct_answer:e.target.value})}/><input type="number" min="0.5" step="0.5" placeholder="নম্বর" value={form.marks} onChange={e=>setForm({...form,marks:e.target.value})}/><button className="btn full">প্রশ্ন যোগ করুন</button></form>{msg&&<p className="msg">{msg}</p>}<div className="table-wrap"><table><thead><tr><th>শ্রেণি</th><th>ধরন</th><th>অধ্যায়</th><th>প্রশ্ন</th><th>নম্বর</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.class_name}</td><td>{r.question_type}</td><td>{r.chapter||'—'}</td><td>{r.question_bn}</td><td>{r.marks}</td></tr>)}</tbody></table></div></div>}
function AssignmentPanel(){const[rows,setRows]=useState([]),[form,setForm]=useState({title_bn:'',class_name:'6',description:'',due_at:'',max_marks:100}),[msg,setMsg]=useState('');const load=()=>api('/assignments').then(setRows).catch(e=>setMsg(e.message));useEffect(load,[]);async function save(e){e.preventDefault();try{await api('/assignments',{method:'POST',body:JSON.stringify(form)});setMsg('অ্যাসাইনমেন্ট প্রকাশ হয়েছে');setForm({...form,title_bn:''});load()}catch(e){setMsg(e.message)}}return <div className="form-card"><h2>অ্যাসাইনমেন্ট</h2><form onSubmit={save} className="form-grid"><input placeholder="অ্যাসাইনমেন্টের শিরোনাম *" value={form.title_bn} onChange={e=>setForm({...form,title_bn:e.target.value})} required/><select value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})}>{classes.map(c=><option key={c}>{c}</option>)}</select><textarea className="full" placeholder="নির্দেশনা/বিবরণ" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><input type="datetime-local" value={form.due_at} onChange={e=>setForm({...form,due_at:e.target.value})}/><input type="number" min="1" value={form.max_marks} onChange={e=>setForm({...form,max_marks:e.target.value})}/><button className="btn full">অ্যাসাইনমেন্ট সংরক্ষণ</button></form>{msg&&<p className="msg">{msg}</p>}<div className="table-wrap"><table><thead><tr><th>শিরোনাম</th><th>শ্রেণি</th><th>সর্বোচ্চ নম্বর</th><th>অবস্থা</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.title_bn}</td><td>{r.class_name}</td><td>{r.max_marks}</td><td>{r.status}</td></tr>)}</tbody></table></div></div>}
function OnlineExamPanel(){const[rows,setRows]=useState([]),[form,setForm]=useState({title_bn:'',class_name:'6',duration_minutes:30,total_marks:20,pass_marks:7}),[msg,setMsg]=useState('');const load=()=>api('/online-exams').then(setRows).catch(e=>setMsg(e.message));useEffect(load,[]);async function save(e){e.preventDefault();try{await api('/online-exams',{method:'POST',body:JSON.stringify(form)});setMsg('অনলাইন পরীক্ষা তৈরি হয়েছে');setForm({...form,title_bn:''});load()}catch(e){setMsg(e.message)}}return <div className="form-card"><h2>অনলাইন পরীক্ষা / কুইজ</h2><form onSubmit={save} className="form-grid"><input placeholder="পরীক্ষার নাম *" value={form.title_bn} onChange={e=>setForm({...form,title_bn:e.target.value})} required/><select value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})}>{classes.map(c=><option key={c}>{c}</option>)}</select><input type="number" min="1" value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:e.target.value})} placeholder="সময় (মিনিট)"/><input type="number" min="1" value={form.total_marks} onChange={e=>setForm({...form,total_marks:e.target.value})} placeholder="পূর্ণমান"/><input type="number" min="0" value={form.pass_marks} onChange={e=>setForm({...form,pass_marks:e.target.value})} placeholder="পাস নম্বর"/><button className="btn full">পরীক্ষা সংরক্ষণ</button></form>{msg&&<p className="msg">{msg}</p>}<div className="table-wrap"><table><thead><tr><th>পরীক্ষা</th><th>শ্রেণি</th><th>সময়</th><th>পূর্ণমান</th><th>অবস্থা</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.title_bn}</td><td>{r.class_name}</td><td>{r.duration_minutes} মিনিট</td><td>{r.total_marks}</td><td>{r.status}</td></tr>)}</tbody></table></div></div>}

function TransportPanel(){
 const [vehicles,setVehicles]=useState([]),[students,setStudents]=useState([]),[assignments,setAssignments]=useState([]),[form,setForm]=useState({vehicle_no:'',vehicle_type:'bus',capacity:40,driver_name:'',driver_phone:'',route_name:'',active:true}),[assign,setAssign]=useState({vehicle_id:'',student_id:'',pickup_point:'',monthly_fee:0}),[msg,setMsg]=useState('');
 const load=async()=>{try{setVehicles(await api('/transport/vehicles'));setStudents(await api('/students?status=active'));setAssignments(await api('/transport/assignments'))}catch(e){setMsg(e.message)}};useEffect(()=>{load()},[]);
 async function save(e){e.preventDefault();try{await api('/transport/vehicles',{method:'POST',body:JSON.stringify(form)});setMsg('গাড়ির তথ্য সংরক্ষণ হয়েছে');setForm({vehicle_no:'',vehicle_type:'bus',capacity:40,driver_name:'',driver_phone:'',route_name:'',active:true});load()}catch(e){setMsg(e.message)}}
 async function add(e){e.preventDefault();try{await api('/transport/assignments',{method:'POST',body:JSON.stringify(assign)});setMsg('শিক্ষার্থী পরিবহনে যুক্ত হয়েছে');setAssign({vehicle_id:'',student_id:'',pickup_point:'',monthly_fee:0});load()}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><h2>নতুন যানবাহন</h2><form onSubmit={save} className="form-grid"><input placeholder="গাড়ি/বাস নম্বর *" value={form.vehicle_no} onChange={e=>setForm({...form,vehicle_no:e.target.value})} required/><select value={form.vehicle_type} onChange={e=>setForm({...form,vehicle_type:e.target.value})}><option value="bus">বাস</option><option value="microbus">মাইক্রোবাস</option><option value="van">ভ্যান</option></select><input type="number" min="0" placeholder="ধারণক্ষমতা" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/><input placeholder="চালকের নাম" value={form.driver_name} onChange={e=>setForm({...form,driver_name:e.target.value})}/><input placeholder="চালকের মোবাইল" value={form.driver_phone} onChange={e=>setForm({...form,driver_phone:e.target.value})}/><input placeholder="রুট" value={form.route_name} onChange={e=>setForm({...form,route_name:e.target.value})}/><button className="btn">যানবাহন সংরক্ষণ</button></form></div><div className="table-card"><div className="toolbar"><h2>যানবাহন</h2><span>{vehicles.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>নম্বর</th><th>ধরন</th><th>ধারণক্ষমতা</th><th>চালক</th><th>রুট</th></tr></thead><tbody>{vehicles.map(v=><tr key={v.id}><td>{v.vehicle_no}</td><td>{v.vehicle_type}</td><td>{v.capacity}</td><td>{v.driver_name||'—'}</td><td>{v.route_name||'—'}</td></tr>)}</tbody></table></div></div><div className="form-card"><h2>শিক্ষার্থী পরিবহন বরাদ্দ</h2><form onSubmit={add} className="form-grid"><select value={assign.vehicle_id} onChange={e=>setAssign({...assign,vehicle_id:e.target.value})} required><option value="">যানবাহন নির্বাচন</option>{vehicles.filter(v=>v.active).map(v=><option key={v.id} value={v.id}>{v.vehicle_no} • {v.route_name||'রুট নির্ধারিত নয়'}</option>)}</select><select value={assign.student_id} onChange={e=>setAssign({...assign,student_id:e.target.value})} required><option value="">শিক্ষার্থী নির্বাচন</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no||'—'} • {s.name_bn}</option>)}</select><input placeholder="Pickup Point" value={assign.pickup_point} onChange={e=>setAssign({...assign,pickup_point:e.target.value})}/><input type="number" min="0" step="0.01" placeholder="মাসিক ফি" value={assign.monthly_fee} onChange={e=>setAssign({...assign,monthly_fee:e.target.value})}/><button className="btn">বরাদ্দ করুন</button></form></div><div className="table-card"><div className="toolbar"><h2>পরিবহন বরাদ্দ</h2><span>{assignments.length} জন</span></div><div className="table-wrap"><table><thead><tr><th>শিক্ষার্থী</th><th>যানবাহন</th><th>রুট</th><th>Pickup</th><th>ফি</th></tr></thead><tbody>{assignments.map(a=><tr key={a.id}><td>{a.name_bn}</td><td>{a.vehicle_no}</td><td>{a.route_name||'—'}</td><td>{a.pickup_point||'—'}</td><td>{a.monthly_fee}</td></tr>)}</tbody></table></div></div>{msg&&<p className="msg">{msg}</p>}</div>
}
function HostelPanel(){
 const [rooms,setRooms]=useState([]),[students,setStudents]=useState([]),[assignments,setAssignments]=useState([]),[form,setForm]=useState({room_no:'',building:'',floor_no:'',capacity:4,gender:'',supervisor_name:''}),[assign,setAssign]=useState({room_id:'',student_id:'',bed_no:'',monthly_fee:0}),[msg,setMsg]=useState('');
 const load=async()=>{try{setRooms(await api('/hostel/rooms'));setStudents(await api('/students?status=active'));setAssignments(await api('/hostel/assignments'))}catch(e){setMsg(e.message)}};useEffect(()=>{load()},[]);
 async function save(e){e.preventDefault();try{await api('/hostel/rooms',{method:'POST',body:JSON.stringify(form)});setMsg('হোস্টেল কক্ষ সংরক্ষণ হয়েছে');setForm({room_no:'',building:'',floor_no:'',capacity:4,gender:'',supervisor_name:''});load()}catch(e){setMsg(e.message)}}
 async function add(e){e.preventDefault();try{await api('/hostel/assignments',{method:'POST',body:JSON.stringify(assign)});setMsg('শিক্ষার্থী কক্ষে বরাদ্দ হয়েছে');setAssign({room_id:'',student_id:'',bed_no:'',monthly_fee:0});load()}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><h2>নতুন হোস্টেল কক্ষ</h2><form onSubmit={save} className="form-grid"><input placeholder="কক্ষ নম্বর *" value={form.room_no} onChange={e=>setForm({...form,room_no:e.target.value})} required/><input placeholder="ভবন" value={form.building} onChange={e=>setForm({...form,building:e.target.value})}/><input placeholder="তলা" value={form.floor_no} onChange={e=>setForm({...form,floor_no:e.target.value})}/><input type="number" min="0" placeholder="ধারণক্ষমতা" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/><input placeholder="ছাত্র/ছাত্রী" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}/><input placeholder="তত্ত্বাবধায়ক" value={form.supervisor_name} onChange={e=>setForm({...form,supervisor_name:e.target.value})}/><button className="btn">কক্ষ সংরক্ষণ</button></form></div><div className="table-card"><div className="toolbar"><h2>হোস্টেল কক্ষ</h2><span>{rooms.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>কক্ষ</th><th>ভবন</th><th>তলা</th><th>ধারণক্ষমতা</th><th>তত্ত্বাবধায়ক</th></tr></thead><tbody>{rooms.map(r=><tr key={r.id}><td>{r.room_no}</td><td>{r.building||'—'}</td><td>{r.floor_no||'—'}</td><td>{r.occupied}/{r.capacity}</td><td>{r.supervisor_name||'—'}</td></tr>)}</tbody></table></div></div><div className="form-card"><h2>শিক্ষার্থী কক্ষ বরাদ্দ</h2><form onSubmit={add} className="form-grid"><select value={assign.room_id} onChange={e=>setAssign({...assign,room_id:e.target.value})} required><option value="">কক্ষ নির্বাচন</option>{rooms.filter(r=>r.active&&Number(r.occupied)<Number(r.capacity)).map(r=><option key={r.id} value={r.id}>{r.room_no} • {r.occupied}/{r.capacity}</option>)}</select><select value={assign.student_id} onChange={e=>setAssign({...assign,student_id:e.target.value})} required><option value="">শিক্ষার্থী নির্বাচন</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no||'—'} • {s.name_bn}</option>)}</select><input placeholder="Bed No" value={assign.bed_no} onChange={e=>setAssign({...assign,bed_no:e.target.value})}/><input type="number" min="0" step="0.01" placeholder="মাসিক ফি" value={assign.monthly_fee} onChange={e=>setAssign({...assign,monthly_fee:e.target.value})}/><button className="btn">বরাদ্দ করুন</button></form></div><div className="table-card"><div className="toolbar"><h2>হোস্টেল বরাদ্দ</h2><span>{assignments.length} জন</span></div><div className="table-wrap"><table><thead><tr><th>শিক্ষার্থী</th><th>কক্ষ</th><th>Bed</th><th>ফি</th></tr></thead><tbody>{assignments.map(a=><tr key={a.id}><td>{a.name_bn}</td><td>{a.room_no}</td><td>{a.bed_no||'—'}</td><td>{a.monthly_fee}</td></tr>)}</tbody></table></div></div>{msg&&<p className="msg">{msg}</p>}</div>
}
function AIPanel(){const[msg,setMsg]=useState(''),[conversation,setConversation]=useState(null),[text,setText]=useState(''),[messages,setMessages]=useState([]),[insight,setInsight]=useState(null),[plan,setPlan]=useState(null);async function start(){try{const c=await api('/ai/conversations',{method:'POST',body:JSON.stringify({title:'AI Tutor আলোচনা'})});setConversation(c);setMessages([]);setMsg('নতুন AI Tutor session তৈরি হয়েছে')}catch(e){setMsg(e.message)}}async function send(e){e.preventDefault();if(!conversation||!text.trim())return;const t=text;setText('');setMessages(m=>[...m,{role:'user',message:t}]);try{const a=await api(`/ai/conversations/${conversation.id}/messages`,{method:'POST',body:JSON.stringify({message:t})});setMessages(m=>[...m,a])}catch(e){setMsg(e.message)}}async function loadInsight(){try{const d=await api('/ai/student-insights');setInsight(d)}catch(e){setMsg(e.message)}}async function makePlan(){try{const d=await api('/ai/study-plans',{method:'POST',body:JSON.stringify({title_bn:'ব্যক্তিগত Study Plan'})});setPlan(d);setMsg('Study Plan তৈরি হয়েছে')}catch(e){setMsg(e.message)}}return <div className="ai-grid"><div className="form-card"><div className="toolbar"><div><span className="eyebrow">AI EDUCATION</span><h2>AI Tutor</h2></div><button className="btn" onClick={start}>নতুন আলোচনা</button></div><div className="ai-disclaimer">AI সহায়তা শিক্ষকের বিকল্প নয়। গুরুত্বপূর্ণ তথ্য শিক্ষক/অভিভাবকের সঙ্গে যাচাই করুন।</div><div className="chat-box">{messages.length?messages.map((m,i)=><div key={i} className={'chat '+m.role}><b>{m.role==='user'?'আপনি':'AI Tutor'}</b><p>{m.message}</p></div>):<div className="empty">নতুন আলোচনা শুরু করে আপনার পড়াশোনার প্রশ্ন লিখুন।</div>}</div><form className="chat-form" onSubmit={send}><input disabled={!conversation} value={text} onChange={e=>setText(e.target.value)} placeholder={conversation?'যেমন: নবম শ্রেণির পদার্থবিজ্ঞানের পড়ার রুটিন কীভাবে করব?':'প্রথমে “নতুন আলোচনা” চাপুন'}/><button className="btn" disabled={!conversation}>পাঠান</button></form></div><div className="form-card"><div className="toolbar"><h2>Learning Insights</h2><button className="mini" onClick={loadInsight}>বিশ্লেষণ</button></div>{insight?<><div className="stats mini-stats"><div><b>{insight.attendance.rate??'—'}{insight.attendance.rate!==null?'%':''}</b><span>উপস্থিতি</span></div><div><b>{insight.attendance.absent}</b><span>অনুপস্থিত</span></div></div><h3>উন্নতির বিষয়</h3>{insight.weakSubjects?.length?insight.weakSubjects.map(x=><p key={x.subject_name}>• {x.subject_name}: গড় {x.avg_marks}</p>):<p>দুর্বল বিষয় শনাক্ত হয়নি।</p>}<h3>পরামর্শ</h3>{insight.tips.map((x,i)=><p key={i}>✓ {x}</p>)}</>:<p>Student account link থাকলে ব্যক্তিগত attendance ও result data থেকে insights তৈরি হবে।</p>}<button className="btn full" onClick={makePlan}>Study Plan তৈরি করুন</button>{plan&&<div className="plan-list">{(plan.plan_json||[]).map((x,i)=><div key={i}><b>দিন {x.day} — {x.subject}</b><p>{x.focus} • {x.minutes} মিনিট</p></div>)}</div>}{msg&&<p className="msg">{msg}</p>}</div></div>}

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}

function getVoterDepartmentName(r, lang) {
  const p = getStudentGroupPriority(r);
  if (p === 1) return lang === 'en' ? 'Science' : 'বিজ্ঞান বিভাগ';
  if (p === 2) return lang === 'en' ? 'Humanities' : 'মানবিক বিভাগ';
  if (p === 3) return lang === 'en' ? 'Business Studies' : 'ব্যবসায় শিক্ষা শাখা';
  const raw = (r.department || r.group_name || r.group || '').trim();
  if (raw && raw !== 'null' && raw !== 'undefined') return raw;
  return lang === 'en' ? 'General' : 'সাধারণ';
}

function VoterListPanel({ onBack }){
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ voter_no: '', voter_name_override: '' });

  const t = (bn, en) => lang === 'en' ? en : lang === 'bi' ? `${bn} / ${en}` : bn;

  const load = async () => {
    try {
      const data = await api(`/voter-list?q=${encodeURIComponent(q)}`);
      setRows(Array.isArray(data) ? data : []);
      setMsg('');
    } catch(e) {
      setMsg(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const begin = (r) => {
    setEditing(r.id);
    setDraft({
      voter_no: r.voter_no || '',
      voter_name_override: r.voter_name_override || ''
    });
  };

  const save = async (r) => {
    try {
      await api(`/voter-list/${r.id}`, { method: 'PATCH', body: JSON.stringify(draft) });
      setEditing(null);
      setMsg(t('ভোটার তথ্য সংরক্ষিত হয়েছে', 'Voter information saved successfully'));
      load();
    } catch(e) {
      setMsg(e.message);
    }
  };

  // Filter & Sort according to requirement:
  // 1. Class 6 to 8: sorted by class roll number
  // 2. Class 9 & 10: sorted by 1st: Science (বিজ্ঞান), 2nd: Humanities (মানবিক), 3rd: Business Studies (ব্যবসায় শিক্ষা), then Roll No.
  const filteredRows = rows.filter(r => {
    if (selectedClass !== 'all' && String(r.class_name).trim() !== String(selectedClass).trim()) {
      return false;
    }
    if (selectedGroup !== 'all') {
      const p = getStudentGroupPriority(r);
      if (selectedGroup === 'science' && p !== 1) return false;
      if (selectedGroup === 'humanities' && p !== 2) return false;
      if (selectedGroup === 'business' && p !== 3) return false;
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      const haystack = [
        r.voter_no,
        r.voter_name,
        r.voter_name_override,
        r.name_bn,
        r.name_en,
        r.roll_no,
        r.class_name,
        r.father_name,
        r.mother_name,
        r.guardian_name,
        r.current_village,
        r.permanent_village,
        r.current_upazila,
        r.permanent_upazila,
        r.current_district,
        r.permanent_district
      ].filter(Boolean).map(String).join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sortedRows = sortStudentsList(filteredRows);

  const print = () => {
    const w = window.open('', '_blank', 'width=1100,height=850');
    if (!w) return;
    const esc = escapeHtml;
    const h = (bn, en) => lang === 'en' ? en : lang === 'bi' ? `${bn} / ${en}` : bn;

    const classSubtitle = selectedClass === 'all'
      ? h('৬ষ্ঠ থেকে ১০ম শ্রেণি', 'Classes 6-10')
      : `${h('শ্রেণি', 'Class')}: ${esc(selectedClass)}`;

    const groupSubtitle = selectedGroup === 'all'
      ? ''
      : ` • ${h('বিভাগ', 'Group')}: ${selectedGroup === 'science' ? h('বিজ্ঞান বিভাগ', 'Science') : selectedGroup === 'humanities' ? h('মানবিক বিভাগ', 'Humanities') : h('ব্যবসায় শিক্ষা শাখা', 'Business Studies')}`;

    const villageSubtitle = q ? ` • ${h('অনুসন্ধান', 'Search')}: ${esc(q)}` : '';

    const body = `
      <div class="print-header">
        <h1>মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</h1>
        <p>মগড়া, কালিহাতি, টাঙ্গাইল • EIIN: 114290</p>
        <h2>${h('খসড়া / চূড়ান্ত ভোটার তালিকা - ২০২৬', 'Draft / Final Voter List - 2026')}</h2>
        <div class="meta-line">
          <span>${classSubtitle}${groupSubtitle}${villageSubtitle}</span>
          <span>${h('মোট ভোটার সংখ্যা', 'Total Voters')}: ${sortedRows.length} ${h('জন', 'persons')}</span>
        </div>
      </div>
      <table class="voter-table">
        <thead>
          <tr>
            <th style="width:75px">${h('ভোটার নং', 'Voter No.')}</th>
            <th style="width:160px">${h('ভোটারের নাম', 'Voter Name')}</th>
            <th style="width:160px">${h('শিক্ষার্থীর নাম', 'Student Name')}</th>
            <th style="width:100px">${h('শ্রেণি রোল নং', 'Class Roll No.')}</th>
            <th style="width:110px">${h('বিভাগ', 'Department')}</th>
            <th style="width:130px">${h('গ্রাম', 'Village')}</th>
            <th style="width:100px">${h('উপজেলা', 'Upazila')}</th>
            <th style="width:90px">${h('জেলা', 'District')}</th>
          </tr>
        </thead>
        <tbody>
          ${sortedRows.map((r, idx) => `
            <tr>
              <td style="text-align:center;font-weight:700">${esc(r.voter_no || (idx + 1))}</td>
              <td><b>${esc(r.voter_name || r.father_name || r.mother_name || r.guardian_name || r.name_bn)}</b></td>
              <td>${esc(lang === 'en' ? (r.name_en || r.name_bn) : r.name_bn)}</td>
              <td style="text-align:center">${esc(r.class_name)} (${esc(r.roll_no || '—')})</td>
              <td style="text-align:center">${esc(getVoterDepartmentName(r, lang))}</td>
              <td>${esc(r.current_village || r.permanent_village || '—')}</td>
              <td>${esc(r.current_upazila || r.permanent_upazila || 'কালিহাতি')}</td>
              <td>${esc(r.current_district || r.permanent_district || 'টাঙ্গাইল')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="signature-area">
        <div>
          <br><br>
          <div style="border-top:1px dashed #333;padding-top:4px">${h('প্রস্তুতকারীর স্বাক্ষর', 'Prepared By')}</div>
        </div>
        <div>
          <br><br>
          <div style="border-top:1px dashed #333;padding-top:4px">${h('যাচাইকারীর স্বাক্ষর', 'Verified By')}</div>
        </div>
        <div>
          <br><br>
          <div style="border-top:1px dashed #333;padding-top:4px">${h('প্রধান শিক্ষক', 'Head Teacher')}</div>
        </div>
        <div>
          <br><br>
          <div style="border-top:1px dashed #333;padding-top:4px">${h('নির্বাচন কমিশনার / সভাপতি', 'Election Commissioner / President')}</div>
        </div>
      </div>
    `;

    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${h('ভোটার তালিকা ২০২৬', 'Voter List 2026')}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: 'SolaimanLipi', Arial, 'Noto Sans Bengali', sans-serif; margin: 15px; color: #111; font-size: 11px; }
    .print-header { text-align: center; margin-bottom: 12px; }
    .print-header h1 { font-size: 19px; margin: 0 0 3px; color: #0f4c3a; }
    .print-header p { font-size: 11px; margin: 0 0 4px; color: #444; }
    .print-header h2 { font-size: 14px; margin: 4px 0 6px; text-decoration: underline; }
    .meta-line { display: flex; justify-content: space-between; font-weight: 700; font-size: 11px; margin-top: 6px; padding: 3px 0; border-bottom: 1px solid #333; }
    table.voter-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    table.voter-table th, table.voter-table td { border: 1px solid #333; padding: 4px 6px; font-size: 10.5px; }
    table.voter-table th { background: #f0f3f2; font-weight: 700; text-align: center; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 45px; text-align: center; font-size: 10.5px; }
    @media print {
      body { margin: 0; }
      table.voter-table th { background: #e8ecea !important; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${body}
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
    w.document.close();
  };

  const exportCSV = () => {
    const headers = [
      'ভোটার নং',
      'ভোটারের নাম',
      'শিক্ষার্থীর নাম',
      'শ্রেণি রোল নং',
      'বিভাগ',
      'গ্রাম',
      'উপজেলা',
      'জেলা'
    ];
    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
    const rowsCsv = sortedRows.map((r, idx) => [
      escapeCsv(r.voter_no || (idx + 1)),
      escapeCsv(r.voter_name || r.father_name || r.mother_name || r.guardian_name || r.name_bn),
      escapeCsv(r.name_bn),
      escapeCsv(`শ্রেণি ${r.class_name} (রোল ${r.roll_no || ''})`),
      escapeCsv(getVoterDepartmentName(r, 'bn')),
      escapeCsv(r.current_village || r.permanent_village || ''),
      escapeCsv(r.current_upazila || r.permanent_upazila || 'কালিহাতি'),
      escapeCsv(r.current_district || r.permanent_district || 'টাঙ্গাইল')
    ].join(','));

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rowsCsv].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voter_list_2026_${selectedClass !== 'all' ? 'class_' + selectedClass : 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="module-grid">
      <div className="form-card full" style={{ gridColumn: '1 / -1' }}>
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="eyebrow">STUDENT &amp; GUARDIAN DATABASE</span>
            <h2>🗳️ {t('শ্রেণিভিত্তিক ভোটার তালিকা', 'Class-wise Voter List')}</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {onBack && (
              <button
                type="button"
                className="mini"
                onClick={onBack}
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' }}
              >
                📋 {t('শিক্ষার্থী তালিকায় ফিরুন', 'Back to Student List')}
              </button>
            )}
            <button className="btn" onClick={exportCSV} style={{ background: '#0284c7', color: '#fff' }}>
              📊 {t('CSV ডাউনলোড', 'Export CSV')}
            </button>
            <button className="btn" onClick={print} style={{ background: '#166534', color: '#fff' }}>
              🖨️ {t('প্রিন্ট / PDF রিপোর্ট', 'Print / PDF Report')}
            </button>
          </div>
        </div>

        <p className="portal-muted" style={{ margin: '8px 0 14px' }}>
          {t(
            '✓ ভোটার তালিকা বিন্যাস: ৬ষ্ঠ-৮ম শ্রেণি শ্রেণি রোলের ক্রমানুসারে এবং ৯ম-১০ম শ্রেণি ১ম: বিজ্ঞান বিভাগ, ২য়: মানবিক বিভাগ, ৩য়: ব্যবসায় শিক্ষা শাখা অনুসারে ক্রমান্বয়ে সজ্জিত। পিতার নামে “মৃত” থাকলে মাতার নাম স্বয়ংক্রিয়ভাবে ভোটার হিসেবে অন্তর্ভুক্ত হয়।',
            '✓ Voter List Sorting: Classes 6-8 by class roll no; Classes 9-10 by 1st: Science, 2nd: Humanities, 3rd: Business Studies, then by roll no. If father is deceased, mother name is automatically selected.'
          )}
        </p>

        {/* Class Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {[
            ['all', t('সকল শ্রেণি (৬ষ্ঠ-১০ম)', 'All Classes (6-10)')],
            ['6', t('৬ষ্ঠ শ্রেণি', 'Class 6')],
            ['7', t('৭ম শ্রেণি', 'Class 7')],
            ['8', t('৮ম শ্রেণি', 'Class 8')],
            ['9', t('৯ম শ্রেণি', 'Class 9')],
            ['10', t('১০ম শ্রেণি', 'Class 10')]
          ].map(([clsVal, clsLabel]) => (
            <button
              key={clsVal}
              type="button"
              onClick={() => setSelectedClass(clsVal)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: selectedClass === clsVal ? 700 : 500,
                border: selectedClass === clsVal ? '2px solid #0f4c3a' : '1px solid #cbd5e1',
                background: selectedClass === clsVal ? '#0f4c3a' : '#f8fafc',
                color: selectedClass === clsVal ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {clsLabel}
            </button>
          ))}
        </div>

        {/* Filters Bar: Group + Village / Search */}
        <div className="filters" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {(selectedClass === 'all' || selectedClass === '9' || selectedClass === '10') && (
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', minWidth: '150px' }}
            >
              <option value="all">{t('সকল বিভাগ / শাখা', 'All Departments')}</option>
              <option value="science">{t('বিজ্ঞান বিভাগ', 'Science Group')}</option>
              <option value="humanities">{t('মানবিক বিভাগ', 'Humanities Group')}</option>
              <option value="business">{t('ব্যবসায় শিক্ষা শাখা', 'Business Studies Group')}</option>
            </select>
          )}

          <input
            style={{ flex: 1, minWidth: '220px' }}
            placeholder={t('গ্রাম, ভোটার নং, শিক্ষার্থী বা অভিভাবকের নাম লিখে খুঁজুন...', 'Search by village, voter no, student or guardian...')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />

          <button className="btn" onClick={load}>
            🔎 {t('খুঁজুন', 'Search')}
          </button>

          {q && (
            <button
              type="button"
              className="mini"
              onClick={() => { setQ(''); load(); }}
              style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
            >
              ✕ {t('রিসেট', 'Reset')}
            </button>
          )}
        </div>

        {msg && <p className="msg" style={{ marginTop: '10px' }}>{msg}</p>}
      </div>

      <div className="table-card full" style={{ gridColumn: '1 / -1' }}>
        <div className="toolbar">
          <div>
            <h2>{t('ভোটার তালিকা', 'Voter List')}</h2>
            <p className="portal-muted" style={{ margin: 0, fontSize: '12px' }}>
              {selectedClass === 'all' ? t('৬ষ্ঠ থেকে ১০ম শ্রেণি', 'Classes 6-10') : `${t('শ্রেণি', 'Class')} ${selectedClass}`}
              {selectedGroup !== 'all' ? ` • ${selectedGroup === 'science' ? 'বিজ্ঞান বিভাগ' : selectedGroup === 'humanities' ? 'মানবিক বিভাগ' : 'ব্যবসায় শিক্ষা শাখা'}` : ''}
            </p>
          </div>
          <span style={{ fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
            {sortedRows.length} {t('জন ভোটার', 'voters')}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '90px', textAlign: 'center' }}>{t('ভোটার নং', 'Voter No.')}</th>
                <th>{t('ভোটারের নাম', 'Voter Name')}</th>
                <th>{t('শিক্ষার্থীর নাম', 'Student Name')}</th>
                <th style={{ width: '130px', textAlign: 'center' }}>{t('শ্রেণি রোল নং', 'Class Roll No.')}</th>
                <th style={{ width: '130px', textAlign: 'center' }}>{t('বিভাগ', 'Department')}</th>
                <th>{t('গ্রাম', 'Village')}</th>
                <th>{t('উপজেলা', 'Upazila')}</th>
                <th>{t('জেলা', 'District')}</th>
                <th style={{ width: '90px', textAlign: 'center' }}>{t('সম্পাদনা', 'Edit')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    {t('কোনো ভোটার তথ্য পাওয়া যায়নি', 'No voter records found')}
                  </td>
                </tr>
              ) : (
                sortedRows.map((r, idx) => (
                  <tr key={r.id}>
                    {/* 1st Column: Voter No */}
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>
                      {editing === r.id ? (
                        <input
                          className="inline-edit"
                          style={{ width: '70px', textAlign: 'center' }}
                          value={draft.voter_no}
                          placeholder={String(idx + 1)}
                          onChange={(e) => setDraft(d => ({ ...d, voter_no: e.target.value }))}
                        />
                      ) : (
                        r.voter_no || (idx + 1)
                      )}
                    </td>

                    {/* 2nd Column: Voter Name */}
                    <td>
                      {editing === r.id ? (
                        <input
                          className="inline-edit"
                          style={{ width: '100%' }}
                          value={draft.voter_name_override}
                          placeholder={t('স্বয়ংক্রিয় নাম রাখতে খালি রাখুন', 'Leave blank for auto name')}
                          onChange={(e) => setDraft(d => ({ ...d, voter_name_override: e.target.value }))}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {r.voter_name || r.father_name || r.mother_name || r.guardian_name || r.name_bn}
                        </span>
                      )}
                    </td>

                    {/* 3rd Column: Student Name */}
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {lang === 'en' ? (r.name_en || r.name_bn) : r.name_bn}
                      </span>
                    </td>

                    {/* 4th Column: Class Roll No */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                        {t('শ্রেণি', 'Class')} {r.class_name} • {t('রোল', 'Roll')} {r.roll_no || '—'}
                      </span>
                    </td>

                    {/* 5th Column: Department */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: getStudentGroupPriority(r) === 1 ? '#dbeafe' : getStudentGroupPriority(r) === 2 ? '#fef3c7' : getStudentGroupPriority(r) === 3 ? '#dcfce7' : '#f1f5f9',
                        color: getStudentGroupPriority(r) === 1 ? '#1e40af' : getStudentGroupPriority(r) === 2 ? '#92400e' : getStudentGroupPriority(r) === 3 ? '#166534' : '#475569'
                      }}>
                        {getVoterDepartmentName(r, lang)}
                      </span>
                    </td>

                    {/* 6th Column: Village */}
                    <td>
                      {r.current_village || r.permanent_village || '—'}
                    </td>

                    {/* 7th Column: Upazila */}
                    <td>
                      {r.current_upazila || r.permanent_upazila || 'কালিহাতি'}
                    </td>

                    {/* 8th Column: District */}
                    <td>
                      {r.current_district || r.permanent_district || 'টাঙ্গাইল'}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {editing === r.id ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button className="mini" style={{ background: '#16a34a', color: '#fff' }} onClick={() => save(r)}>
                            ✓ {t('সংরক্ষণ', 'Save')}
                          </button>
                          <button className="mini" onClick={() => setEditing(null)}>
                            × {t('বাতিল', 'Cancel')}
                          </button>
                        </div>
                      ) : (
                        <button className="mini" onClick={() => begin(r)}>
                          ✎ {t('সম্পাদনা', 'Edit')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function VillageStudentPanel(){
 const {lang}=useLanguage();
 const [village,setVillage]=useState(''),[data,setData]=useState(null),[msg,setMsg]=useState('');
 const t=(bn,en)=>lang==='en'?en:lang==='bi'?`${bn} / ${en}`:bn;
 const search=async()=>{try{setData(await api(`/students/village-wise?village=${encodeURIComponent(village)}`));setMsg('')}catch(e){setMsg(e.message)}};
 const print=()=>{if(!data)return;const w=window.open('','_blank','width=1000,height=800');if(!w)return;const esc=escapeHtml;const h=(bn,en)=>lang==='en'?en:lang==='bi'?`${bn} / ${en}`:bn;let body=`<h1>মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</h1><p>মগড়া, কালিহাতি, টাঙ্গাইল • EIIN 114290</p><h2>${h('গ্রামভিত্তিক শিক্ষার্থী তালিকা','Village-wise Student List')}</h2><p>${h('গ্রাম','Village')}: ${esc(data.village)} • ${h('মোট','Total')}: ${data.count}</p>`;for(const c of classes){const rows=data.groups?.[c]||[];body+=`<h3>${h('শ্রেণি','Class')} ${esc(c)} — ${rows.length} ${h('জন','students')}</h3><table><thead><tr><th>${h('ক্রম','SL')}</th><th>${h('রোল','Roll')}</th><th>Student ID</th><th>${h('নাম','Name')}</th><th>${h('পিতা','Father')}</th><th>${h('মাতা','Mother')}</th><th>${h('মোবাইল','Mobile')}</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.roll_no||'')}</td><td>${esc(r.student_id)}</td><td>${esc(lang==='en'?(r.name_en||r.name_bn):r.name_bn)}</td><td>${esc(r.father_name||'')}</td><td>${esc(r.mother_name||'')}</td><td>${esc(getStudentPhone(r))}</td></tr>`).join('')}</tbody></table>`}w.document.write(`<html><head><meta charset="utf-8"><style>body{font-family:Arial,'Noto Sans Bengali',sans-serif;margin:25px}table{width:100%;border-collapse:collapse;margin:8px 0 20px}th,td{border:1px solid #222;padding:5px;font-size:12px}h1,h2{text-align:center}</style></head><body>${body}<script>window.onload=()=>window.print()</script></body></html>`);w.document.close()};
 return <div className="module-grid"><div className="form-card"><span className="eyebrow">SMART QUERY</span><h2>{t('গ্রামভিত্তিক শিক্ষার্থী তালিকা','Village-wise Student List')}</h2><p className="portal-muted">{t('যে কোনো গ্রামের নাম লিখলে ৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের শ্রেণিভিত্তিক আলাদা তালিকা পাওয়া যাবে। বর্তমান বা স্থায়ী ঠিকানার গ্রাম—দুটিই অনুসন্ধান করা হবে।','Search any village to list students from Classes 6-10 separately. Both present and permanent village addresses are searched.')}</p><div className="filters"><input placeholder={t('যেমন: মগড়া','Example: Magra')} value={village} onChange={e=>setVillage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}/><button className="btn" onClick={search}>🔎 {t('খুঁজুন','Search')}</button>{data&&<button className="btn" onClick={print}>🖨️ {t('প্রিন্ট / PDF','Print / PDF')}</button>}</div>{msg&&<p className="msg">{msg}</p>}</div>{data&&classes.map(c=>{const rows=data.groups?.[c]||[];return <div className="table-card" key={c}><div className="toolbar"><h2>{t('শ্রেণি','Class')} {c}</h2><span>{rows.length} {t('জন','students')}</span></div><div className="table-wrap"><table><thead><tr><th>{t('রোল','Roll')}</th><th>Student ID</th><th>{t('নাম','Name')}</th><th>{t('পিতা','Father')}</th><th>{t('মাতা','Mother')}</th><th>{t('অভিভাবকের মোবাইল','Guardian Mobile')}</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.roll_no||'—'}</td><td>{r.student_id}</td><td>{lang==='en'?(r.name_en||r.name_bn):r.name_bn}</td><td>{r.father_name||'—'}</td><td>{r.mother_name||'—'}</td><td>{getStudentPhone(r)}</td></tr>)}</tbody></table></div></div>})}</div>
}

function DocumentPanel({sub}){
 const {lang}=useLanguage();
 const docLabel=(bn,en)=>lang==='en'?en:lang==='bi'?`${bn} / ${en}`:bn;
 const [type,setType]=useState('id_card'),[students,setStudents]=useState([]),[exams,setExams]=useState([]),[studentId,setStudentId]=useState(''),[examId,setExamId]=useState(''),[className,setClassName]=useState('6'),[doc,setDoc]=useState(null),[issued,setIssued]=useState([]),[msg,setMsg]=useState('');
 const types=[['id_card',docLabel('শিক্ষার্থী পরিচয়পত্র','Student ID Card')],['commendation_certificate',docLabel('প্রশংসাপত্র','Commendation Certificate')],['transfer_certificate',docLabel('ছাড়পত্র (TC)','Transfer Certificate')],['bonafide_certificate',docLabel('প্রত্যয়ন পত্র','Bonafide Certificate')],['certificate',docLabel('সনদপত্র','Certificate')],['admit_card',docLabel('প্রবেশপত্র','Admit Card')],['marksheet',docLabel('মার্কশিট','Marksheet')],['progress_report',docLabel('প্রগ্রেস রিপোর্ট','Progress Report')],['tabulation',docLabel('ট্যাবুলেশন শিট','Tabulation Sheet')],['merit_list',docLabel('মেধা তালিকা','Merit List')]];
 const classBased=['tabulation','merit_list'], examBased=['marksheet','progress_report','admit_card','tabulation','merit_list'];
 const loadIssued=async()=>{try{const q=[];if(type)q.push(`document_type=${encodeURIComponent(type)}`);if(studentId)q.push(`student_id=${encodeURIComponent(studentId)}`);setIssued(await api('/documents/issued'+(q.length?'?'+q.join('&'):'')))}catch{setIssued([])}};
 useEffect(()=>{api('/students?status=active').then(setStudents).catch(e=>setMsg(e.message));api('/exams').then(setExams).catch(()=>{})},[]);
 useEffect(()=>{if(studentId){const st=students.find(x=>x.id===studentId);if(st)setClassName(st.class_name||'6')}},[studentId,students]);
 useEffect(()=>{loadIssued()},[type,studentId]);
 const load=async()=>{try{
   if(!classBased.includes(type)&&!studentId){setMsg('শিক্ষার্থী নির্বাচন করুন');return}
   if(examBased.includes(type)&&!examId){setMsg('পরীক্ষা নির্বাচন করুন');return}
   const q=`/documents/student/${studentId||students[0]?.id}?type=${type}${examId?`&exam_id=${examId}`:''}${classBased.includes(type)?`&class_name=${encodeURIComponent(className)}`:''}`;
   setDoc(await api(q));setMsg('');
 }catch(e){setMsg(e.message)}};
 const issue=async()=>{if(!doc)return;try{const data_snapshot={type,school:doc.school,student:doc.student||null,exam:doc.exam||null,class_name:className,list:doc.list||null,marks:doc.marks||null,summary:doc.summary||null};const saved=await api('/documents/issue',{method:'POST',body:JSON.stringify({document_type:type,student_id:doc.student?.id||studentId||null,exam_id:doc.exam?.id||examId||null,data_snapshot})});setMsg(`ডকুমেন্ট ইস্যু হয়েছে: ${saved.document_no}`);loadIssued()}catch(e){setMsg(e.message)}};
 const print=()=>{if(!doc)return;const w=window.open('','_blank','width=1000,height=800');if(!w)return;const school=doc.school||{},student=doc.student||{},exam=doc.exam||{},esc=escapeHtml;const L=(bn,en)=>lang==='en'?en:lang==='bi'?`${bn} / ${en}`:bn;const val=(bn,en)=>lang==='en'?(en||bn):lang==='bi'?(bn||en):bn;const studentName=val(student.name_bn,student.name_en);const schoolName=val(school.nameBn,school.nameEn||school.name_bn);const examName=val(exam.name_bn,exam.name_en);const address=school.address||'Magra, Kalihati, Tangail';let body='';
 if(type==='id_card')body=`<div class="id"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(L('শিক্ষার্থী পরিচয়পত্র','Student ID Card'))}</h2><hr><div class="photo">${student.photo_url?`<img src="${esc(student.photo_url)}">`:esc(L('ছবি','Photo'))}</div><p><b>${esc(L('নাম','Name'))}:</b> ${esc(studentName)}</p><p><b>Student ID:</b> ${esc(student.student_id)} &nbsp; <b>${esc(L('রোল','Roll'))}:</b> ${esc(student.roll_no)}</p><p><b>${esc(L('শ্রেণি','Class'))}:</b> ${esc(student.class_name)} &nbsp; <b>${esc(L('শাখা','Section'))}:</b> ${esc(student.section||'—')}</p><p><b>${esc(L('অভিভাবক','Guardian'))}:</b> ${esc(getStudentGuardian(student))}</p><p><b>${esc(L('মোবাইল','Mobile'))}:</b> ${esc(getStudentPhone(student))}</p></div>`;
 else if(type==='certificate'||type==='commendation_certificate'){const title=type==='commendation_certificate'?L('প্রশংসাপত্র','Commendation Certificate'):L('সনদপত্র','Certificate');const intro=L('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে','This is to certify that');const desc=type==='commendation_certificate'?L(`তাঁর শৃঙ্খলা, আচরণ, অধ্যবসায় ও কৃতিত্বের স্বীকৃতিস্বরূপ এই প্রশংসাপত্র প্রদান করা হলো।`,`This commendation is awarded in recognition of the student's discipline, conduct, diligence and achievement.`):L('এই প্রতিষ্ঠানের শ্রেণির শিক্ষার্থী হিসেবে তাঁর পরিচয় নথিভুক্ত আছে।','The student is duly recorded as a student of this institution.');body=`<div class="certificate"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h1>${esc(title)}</h1><p>${esc(intro)}</p><h2>${esc(studentName)}</h2><p>Student ID: ${esc(student.student_id)} • ${esc(L('রোল','Roll'))}: ${esc(student.roll_no)}</p><p>${esc(desc).replace('শ্রেণির',esc(student.class_name)+' শ্রেণির')}</p><div class="sign"><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span><span>${esc(L('সভাপতি','President'))}<br>${esc(school.president||'')}</span></div></div>`}
 else if(type==='transfer_certificate'){body=`<div class="certificate"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h1>${esc(L('ছাড়পত্র / Transfer Certificate (TC)','Transfer Certificate'))}</h1><p>${esc(L('এই মর্মে ছাড়পত্র প্রদান করা যাচ্ছে যে','This is to certify that transfer certificate is granted to'))}</p><h2>${esc(studentName)}</h2><p>Student ID: ${esc(student.student_id)} • ${esc(L('রোল','Roll'))}: ${esc(student.roll_no)} • ${esc(L('শ্রেণি','Class'))}: ${esc(student.class_name)}</p><p>পিতা: ${esc(student.father_name||'—')} • মাতা: ${esc(student.mother_name||'—')}</p><p>গ্রাম: ${esc(student.current_village||'মগড়া')}, ডাকঘর: ${esc(student.current_post_office||'মগড়া')}, উপজেলা: ${esc(student.current_upazila||'কালিহাতি')}, জেলা: ${esc(student.current_district||'টাঙ্গাইল')}</p><p>বিদ্যালয়ের যাবতীয় পাওনাদি সম্পূর্ণ পরিশোধিত হয়েছে এবং অধ্যয়নকালে তাহার চরিত্র উত্তম ছিল।</p><div class="sign"><span>${esc(L('শ্রেণি শিক্ষক','Class Teacher'))}</span><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span></div></div>`}
 else if(type==='bonafide_certificate'){body=`<div class="certificate"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h1>${esc(L('প্রত্যয়ন পত্র','Bonafide Student Certificate'))}</h1><p>${esc(L('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে','This is to certify that'))}</p><h2>${esc(studentName)}</h2><p>Student ID: ${esc(student.student_id)} • ${esc(L('রোল','Roll'))}: ${esc(student.roll_no)} • ${esc(L('শ্রেণি','Class'))}: ${esc(student.class_name)}</p><p>পিতা: ${esc(student.father_name||'—')} • মাতা: ${esc(student.mother_name||'—')}</p><p>সে অত্র বিদ্যালয়ের একজন নিয়মিত ও বাধ্যগত শিক্ষার্থী। তাহার প্রাতিষ্ঠানিক ও দাপ্তরিক সুবিধার জন্য এই প্রত্যয়নপত্র প্রদান করা হলো।</p><div class="sign"><span>${esc(L('শ্রেণি শিক্ষক','Class Teacher'))}</span><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span></div></div>`}
 else if(type==='admit_card')body=`<div class="doc admit"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(L('প্রবেশপত্র','Admit Card'))}</h2><h3>${esc(examName)}</h3><div class="admit-grid"><p><b>${esc(L('নাম','Name'))}:</b> ${esc(studentName)}</p><p><b>Student ID:</b> ${esc(student.student_id)}</p><p><b>${esc(L('রোল','Roll'))}:</b> ${esc(student.roll_no)}</p><p><b>${esc(L('শ্রেণি','Class'))}:</b> ${esc(student.class_name)} • <b>${esc(L('শাখা','Section'))}:</b> ${esc(student.section||'—')}</p><p><b>${esc(L('পরীক্ষার সময়','Exam Period'))}:</b> ${esc(exam.start_date||'—')} ${esc(L('থেকে','to'))} ${esc(exam.end_date||'—')}</p></div><div class="sign"><span>${esc(L('শ্রেণি শিক্ষক','Class Teacher'))}</span><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span></div></div>`;
 else if(type==='marksheet'||type==='progress_report')body=`<div class="doc"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(type==='marksheet'?L('মার্কশিট','Marksheet'):L('প্রগ্রেস রিপোর্ট','Progress Report'))}</h2><p><b>${esc(L('পরীক্ষা','Exam'))}:</b> ${esc(examName)}</p><p><b>${esc(L('নাম','Name'))}:</b> ${esc(studentName)} &nbsp; <b>${esc(L('রোল','Roll'))}:</b> ${esc(student.roll_no)} &nbsp; <b>${esc(L('শ্রেণি','Class'))}:</b> ${esc(student.class_name)}</p><table><thead><tr><th>${esc(L('বিষয়','Subject'))}</th><th>${esc(L('পূর্ণমান','Full Marks'))}</th><th>${esc(L('লিখিত','Written'))}</th><th>MCQ</th><th>${esc(L('ব্যবহারিক','Practical'))}</th><th>${esc(L('মোট','Total'))}</th><th>${esc(L('গ্রেড','Grade'))}</th><th>GPA</th></tr></thead><tbody>${(doc.marks||[]).map(m=>`<tr><td>${esc(lang==='en'?(m.subject_name_en||m.subject_name):m.subject_name)}</td><td>${esc(m.full_marks||100)}</td><td>${esc(m.written??0)}</td><td>${esc(m.mcq??0)}</td><td>${esc(m.practical??0)}</td><td>${esc(m.total??0)}</td><td>${esc(m.grade||'')}</td><td>${esc(m.gpa??'')}</td></tr>`).join('')}</tbody></table><div class="sign"><span>${esc(L('শ্রেণি শিক্ষক','Class Teacher'))}</span><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span></div></div>`;
 else {const title=type==='tabulation'?L('ট্যাবুলেশন শিট','Tabulation Sheet'):L('মেধা তালিকা','Merit List');body=`<div class="doc"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(title)}</h2><p>${esc(L('পরীক্ষা','Exam'))}: ${esc(examName)} • ${esc(L('শ্রেণি','Class'))}: ${esc(className)}</p><table><thead><tr><th>${esc(L('মেধা','Merit'))}</th><th>${esc(L('রোল','Roll'))}</th><th>${esc(L('নাম','Name'))}</th><th>${esc(L('বিষয়','Subject'))}</th><th>${esc(L('মোট','Total'))}</th><th>GPA</th><th>${esc(L('ফলাফল','Result'))}</th></tr></thead><tbody>${(doc.list||[]).map(r=>`<tr><td>${esc(r.merit)}</td><td>${esc(r.roll_no||'')}</td><td>${esc(lang==='en'?(r.name_en||r.name_bn):r.name_bn)}</td><td>${esc(r.subjects)}</td><td>${esc(r.total_marks)}</td><td>${esc(r.gpa)}</td><td>${esc(r.result_status)}</td></tr>`).join('')}</tbody></table></div>`}
 w.document.write(`<html><head><title>${esc(types.find(x=>x[0]===type)?.[1]||'Document')}</title><meta charset="utf-8"><style>body{font-family:Arial,'Noto Sans Bengali',sans-serif;margin:0;padding:30px;color:#17352a}.doc,.certificate,.id{max-width:900px;margin:auto;text-align:center;border:2px solid #176b4b;padding:28px;border-radius:14px}img{width:80px}.doc table{width:100%;border-collapse:collapse;margin-top:20px}.doc th,.doc td{border:1px solid #999;padding:8px}.certificate h1{font-size:38px}.certificate h2{font-size:30px}.photo{margin:15px auto;width:100px;height:120px;border:1px solid #aaa;display:grid;place-items:center}.photo img{width:100%;height:100%;object-fit:cover}.sign{display:flex;justify-content:space-between;margin-top:60px;padding:0 50px}.admit-grid{text-align:left;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:25px}@media(max-width:600px){.admit-grid{grid-template-columns:1fr}}@media print{body{padding:0}.doc,.certificate,.id{border:0}}</style></head><body>${body}<script>window.onload=()=>window.print()</script></body></html>`);w.document.close()};
 return <div className="documents-panel"><div className="form-card"><div className="tabs">{types.map(x=><button className={type===x[0]?'active':''} key={x[0]} onClick={()=>{setType(x[0]);setDoc(null);setMsg('')}}>{x[1]}</button>)}</div><h2>{docLabel('অফিশিয়াল ডকুমেন্ট জেনারেটর','Official Document Generator')}</h2><p className="portal-muted">{docLabel('প্রিভিউ, Print/PDF এবং Official Issue একই document workflow-এ পরিচালনা করুন।','Preview, Print/PDF and Official Issue are handled in one document workflow.')}</p><div className="form-grid">{!classBased.includes(type)&&<select value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">{docLabel('শিক্ষার্থী নির্বাচন','Select Student')}</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no||'—'} • {s.name_bn}</option>)}</select>}{classBased.includes(type)&&<select value={className} onChange={e=>setClassName(e.target.value)}><option value="">{docLabel('শ্রেণি নির্বাচন','Select Class')}</option>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select>}{examBased.includes(type)&&<select value={examId} onChange={e=>setExamId(e.target.value)}><option value="">{docLabel('পরীক্ষা নির্বাচন','Select Exam')}</option>{exams.map(e=><option key={e.id} value={e.id}>{e.name_bn}</option>)}</select>}<button className="btn full" onClick={load}>{docLabel('Preview তৈরি করুন','Create Preview')}</button></div>{msg&&<p className="msg" role="status">{msg}</p>}</div>{doc&&<div className="table-card document-preview"><div className="toolbar"><h2>{types.find(x=>x[0]===type)?.[1]}</h2><div><button className="btn" onClick={print}>🖨️ {docLabel('প্রিন্ট / PDF','Print / PDF')}</button> <button className="btn" onClick={issue}>✓ {docLabel('অফিশিয়ালি ইস্যু','Officially Issue')}</button></div></div><div className="preview-sheet"><img src="/school-logo.png"/><h2>{doc.school?.nameBn}</h2><p>{doc.school?.address} • EIIN {doc.school?.eiin}</p><h3>{types.find(x=>x[0]===type)?.[1]}</h3>{type==='id_card'&&<p><b>{lang==='en'?(doc.student?.name_en||doc.student?.name_bn):doc.student?.name_bn}</b><br/>{docLabel('Student ID','Student ID')}: {doc.student?.student_id} • {docLabel('রোল','Roll')}: {doc.student?.roll_no}<br/>{docLabel('শ্রেণি','Class')}: {doc.student?.class_name} • {docLabel('শাখা','Section')}: {doc.student?.section||'—'}</p>}{(type==='certificate'||type==='commendation_certificate')&&<p>{docLabel('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে','This is to certify that')} <b>{lang==='en'?(doc.student?.name_en||doc.student?.name_bn):doc.student?.name_bn}</b> {docLabel(`এই প্রতিষ্ঠানের ${doc.student?.class_name} শ্রেণির শিক্ষার্থী।`,`is a student of Class ${doc.student?.class_name} at this institution.`)} {type==='commendation_certificate'&&docLabel('তাঁর শৃঙ্খলা, আচরণ, অধ্যবসায় ও কৃতিত্বের স্বীকৃতিস্বরূপ এই প্রশংসাপত্র প্রদান করা হলো।','This commendation is awarded in recognition of the student’s discipline, conduct, diligence and achievement.')}</p>}{type==='transfer_certificate'&&<p>{docLabel('এই মর্মে ছাড়পত্র প্রদান করা যাচ্ছে যে','This is to certify that transfer certificate is granted to')} <b>{lang==='en'?(doc.student?.name_en||doc.student?.name_bn):doc.student?.name_bn}</b><br/>{docLabel('শ্রেণি','Class')}: {doc.student?.class_name} • {docLabel('রোল','Roll')}: {doc.student?.roll_no} • {docLabel('আইডি','ID')}: {doc.student?.student_id}<br/>{docLabel('পিতা','Father')}: {doc.student?.father_name||'—'} • {docLabel('মাতা','Mother')}: {doc.student?.mother_name||'—'}<br/>{docLabel('বিদ্যালয়ের সকল পাওনাদি পরিশোধিত হয়েছে।','All school fees and dues have been cleared.')}</p>}{type==='bonafide_certificate'&&<p>{docLabel('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে','This is to certify that')} <b>{lang==='en'?(doc.student?.name_en||doc.student?.name_bn):doc.student?.name_bn}</b> {docLabel(`অত্র বিদ্যালয়ের শ্রেণি ${doc.student?.class_name}-এর একজন নিয়মিত শিক্ষার্থী।`,`is a bona fide and regular student of Class ${doc.student?.class_name}.`)}<br/>{docLabel('রোল','Roll')}: {doc.student?.roll_no} • {docLabel('আইডি','ID')}: {doc.student?.student_id}<br/>{docLabel('দাপ্তরিক সুবিধার জন্য এই প্রত্যয়নপত্র প্রদান করা হলো।','Issued for official and verification purposes.')}</p>}{type==='admit_card'&&doc.exam&&<p><b>{lang==='en'?(doc.exam.name_en||doc.exam.name_bn):doc.exam.name_bn}</b><br/>{docLabel('পরীক্ষা','Exam')}: {doc.exam.start_date||'—'} → {doc.exam.end_date||'—'}<br/>{docLabel('রোল','Roll')}: {doc.student?.roll_no||'—'}</p>}{(type==='marksheet'||type==='progress_report')&&doc.summary&&<div className="document-summary"><b>{docLabel('মোট','Total')}: {doc.summary.total_marks} / {doc.summary.full_marks}</b><span>{docLabel('শতকরা','Percentage')}: {doc.summary.percentage}%</span><span>GPA: {doc.summary.gpa??'—'}</span><span>{docLabel('ফলাফল','Result')}: {doc.summary.result_status}</span></div>}{(type==='marksheet'||type==='progress_report')&&<div className="table-wrap"><table><thead><tr><th>{docLabel('বিষয়','Subject')}</th><th>{docLabel('পূর্ণমান','Full Marks')}</th><th>{docLabel('মোট','Total')}</th><th>{docLabel('গ্রেড','Grade')}</th><th>GPA</th></tr></thead><tbody>{(doc.marks||[]).map(m=><tr key={m.id}><td>{m.subject_name}</td><td>{m.full_marks||100}</td><td>{m.total}</td><td>{m.grade}</td><td>{m.gpa}</td></tr>)}</tbody></table></div>}{(type==='tabulation'||type==='merit_list')&&<div className="table-wrap"><table><thead><tr><th>{docLabel('মেধা','Merit')}</th><th>{docLabel('রোল','Roll')}</th><th>{docLabel('নাম','Name')}</th><th>{docLabel('মোট','Total')}</th><th>GPA</th><th>{docLabel('ফলাফল','Result')}</th></tr></thead><tbody>{(doc.list||[]).map(r=><tr key={r.id}><td>{r.merit}</td><td>{r.roll_no}</td><td>{r.name_bn}</td><td>{r.total_marks}</td><td>{r.gpa}</td><td>{r.result_status}</td></tr>)}</tbody></table></div>}</div></div>}{<div className="table-card"><div className="toolbar"><h2>{docLabel('ইস্যু করা ডকুমেন্ট','Issued Documents')}</h2><span>{issued.length} {docLabel('টি','items')}</span></div><div className="table-wrap"><table><thead><tr><th>{docLabel('ডকুমেন্ট নং','Document No.')}</th><th>{docLabel('তারিখ','Date')}</th><th>{docLabel('ধরন','Type')}</th><th>{docLabel('শিক্ষার্থী','Student')}</th><th>{docLabel('পরীক্ষা','Exam')}</th></tr></thead><tbody>{issued.map(d=><tr key={d.id}><td>{d.document_no}</td><td>{d.issue_date}</td><td>{types.find(x=>x[0]===d.document_type)?.[1]||d.document_type}</td><td>{d.name_bn||'—'}</td><td>{d.exam_id||'—'}</td></tr>)}</tbody></table></div></div>}</div>}

function FeatureControlPanel({ sub }){
 const [tab, setTab] = useState(sub === 'public' ? 'public' : sub === 'custom' ? 'custom' : 'system');
 const [features, setFeatures] = useState([]);
 const [customList, setCustomList] = useState([]);
 const [loading, setLoading] = useState(false);
 const [msg, setMsg] = useState('');
 const [filter, setFilter] = useState('');
 
 const [customForm, setCustomForm] = useState({ title_bn: '', title_en: '', icon: '⭐', target_url: '', placement: 'both', description: '' });
 const [editingCustomId, setEditingCustomId] = useState(null);

 useEffect(() => {
  if (sub === 'public') setTab('public');
  else if (sub === 'custom') setTab('custom');
  else if (sub === 'system') setTab('system');
 }, [sub]);

 const load = async () => {
  setLoading(true);
  try {
   const d = await api('/admin/features');
   if (d) {
    setFeatures(d.features || []);
    setCustomList(d.custom || []);
   }
   setMsg('');
  } catch(e) {
   setMsg(e.message || 'ফিচার লোড করা সম্ভব হয়নি');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { load(); }, []);

 const toggleFeature = async (f) => {
  const nextEnabled = f.enabled === false ? true : false;
  try {
   await api('/admin/features/' + encodeURIComponent(f.feature_key), {
    method: 'PATCH',
    body: JSON.stringify({ enabled: nextEnabled })
   });
   setFeatures(prev => prev.map(x => x.feature_key === f.feature_key ? { ...x, enabled: nextEnabled } : x));
   setMsg('"' + (f.label_bn || f.feature_key) + '" ফিচারটি ' + (nextEnabled ? 'সক্রিয় (ON)' : 'নিষ্ক্রিয় (OFF)') + ' করা হয়েছে');
  } catch(e) {
   setMsg(e.message || 'ফিচার স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
  }
 };

 const saveCustom = async (e) => {
  e.preventDefault();
  try {
   if (editingCustomId) {
    await api('/admin/custom-features/' + editingCustomId, {
     method: 'PATCH',
     body: JSON.stringify(customForm)
    });
    setMsg('কাস্টম ফিচার আপডেট হয়েছে');
   } else {
    await api('/admin/custom-features', {
     method: 'POST',
     body: JSON.stringify(customForm)
    });
    setMsg('নতুন কাস্টম ফিচার যোগ করা হয়েছে');
   }
   setCustomForm({ title_bn: '', title_en: '', icon: '⭐', target_url: '', placement: 'both', description: '' });
   setEditingCustomId(null);
   load();
  } catch(e) {
   setMsg(e.message || 'কাস্টম ফিচার সংরক্ষণ ব্যর্থ হয়েছে');
  }
 };

 const toggleCustom = async (cf) => {
  const nextEnabled = cf.enabled === false ? true : false;
  try {
   await api('/admin/custom-features/' + cf.id, {
    method: 'PATCH',
    body: JSON.stringify({ enabled: nextEnabled })
   });
   setCustomList(prev => prev.map(x => x.id === cf.id ? { ...x, enabled: nextEnabled } : x));
   setMsg('"' + cf.title_bn + '" ' + (nextEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়') + ' করা হয়েছে');
  } catch(e) {
   setMsg(e.message || 'পরিবর্তন ব্যর্থ');
  }
 };

 const deleteCustom = async (id) => {
  if (!confirm('আপনি কি নিশ্চিত যে এই কাস্টম ফিচারটি মুছে ফেলতে চান?')) return;
  try {
   await api('/admin/custom-features/' + id, { method: 'DELETE' });
   setMsg('কাস্টম ফিচার মুছে ফেলা হয়েছে');
   load();
  } catch(e) {
   setMsg(e.message || 'মুছে ফেলা ব্যর্থ');
  }
 };

 const editCustom = (cf) => {
  setEditingCustomId(cf.id);
  setCustomForm({
   title_bn: cf.title_bn || '',
   title_en: cf.title_en || '',
   icon: cf.icon || '⭐',
   target_url: cf.target_url || '',
   placement: cf.placement || 'both',
   description: cf.description || ''
  });
  setTab('custom');
  window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const systemFeatures = features.filter(f => !f.feature_key?.startsWith('public.') && (f.scope === 'admin' || f.feature_type === 'system' || !f.scope));
 const publicFeatures = features.filter(f => f.feature_key?.startsWith('public.') || f.scope === 'public');

 const filteredFeatures = (tab === 'public' ? publicFeatures : systemFeatures).filter(f => {
  if (!filter) return true;
  const q = filter.toLowerCase();
  return (f.label_bn && f.label_bn.toLowerCase().includes(q)) ||
         (f.label_en && f.label_en.toLowerCase().includes(q)) ||
         (f.feature_key && f.feature_key.toLowerCase().includes(q)) ||
         (f.group_name && f.group_name.toLowerCase().includes(q));
 });

 return (
  <div className="module-grid feature-control-panel">
   <div className="form-card full" style={{ gridColumn: '1 / -1' }}>
    <div className="tabs">
     <button className={tab === 'system' ? 'active' : ''} onClick={() => setTab('system')}>⚙️ সিস্টেম Feature ON/OFF ({systemFeatures.length})</button>
     <button className={tab === 'public' ? 'active' : ''} onClick={() => setTab('public')}>🌐 View Site Menu ON/OFF ({publicFeatures.length})</button>
     <button className={tab === 'custom' ? 'active' : ''} onClick={() => setTab('custom')}>➕ নতুন Feature যোগ ({customList.length})</button>
    </div>
    {msg && <p className="msg" role="status">{msg}</p>}
   </div>

   {tab === 'custom' ? (
    <>
     <div className="form-card">
      <div className="toolbar">
       <div>
        <span className="eyebrow">CUSTOM NAVIGATION & FEATURES</span>
        <h2>{editingCustomId ? 'কাস্টম ফিচার সম্পাদনা' : 'নতুন কাস্টম লিঙ্ক / ফিচার যোগ'}</h2>
       </div>
       {editingCustomId && (
        <button className="mini" onClick={() => { setEditingCustomId(null); setCustomForm({ title_bn: '', title_en: '', icon: '⭐', target_url: '', placement: 'both', description: '' }); }}>বাতিল</button>
       )}
      </div>
      <form onSubmit={saveCustom} className="form-grid">
       <input placeholder="ফিচারের নাম (বাংলা) *" value={customForm.title_bn} onChange={e => setCustomForm({ ...customForm, title_bn: e.target.value })} required />
       <input placeholder="Feature Name (English)" value={customForm.title_en} onChange={e => setCustomForm({ ...customForm, title_en: e.target.value })} />
       <input placeholder="আইকন / ইমোজি (যেমন: 🔗, 🚀, 📚)" value={customForm.icon} onChange={e => setCustomForm({ ...customForm, icon: e.target.value })} />
       <select value={customForm.placement} onChange={e => setCustomForm({ ...customForm, placement: e.target.value })}>
        <option value="both">পাবলিক সাইট ও অ্যাডমিন উভয় জায়গায় (Both)</option>
        <option value="public">শুধুমাত্র পাবলিক ওয়েবসাইটে (Public Site)</option>
        <option value="admin">শুধুমাত্র অ্যাডমিন প্যানেলে (Admin Panel)</option>
       </select>
       <input className="full" placeholder="টার্গেট লিঙ্ক / URL (যেমন: #notice বা https://moedu.gov.bd) *" value={customForm.target_url} onChange={e => setCustomForm({ ...customForm, target_url: e.target.value })} required />
       <textarea className="full" placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" rows={2} value={customForm.description} onChange={e => setCustomForm({ ...customForm, description: e.target.value })} />
       <button className="btn full">{editingCustomId ? 'আপডেট করুন' : 'যোগ করুন'}</button>
      </form>
     </div>

     <div className="table-card">
      <div className="toolbar">
       <h2>কাস্টম ফিচারের তালিকা</h2>
       <span>{customList.length} টি</span>
      </div>
      <div className="table-wrap">
       <table>
        <thead>
         <tr>
          <th>আইকন</th>
          <th>নাম</th>
          <th>অবস্থান</th>
          <th>লিঙ্ক</th>
          <th>অবস্থা</th>
          <th>কাজ</th>
         </tr>
        </thead>
        <tbody>
         {customList.map(cf => (
          <tr key={cf.id}>
           <td style={{ fontSize: '18px' }}>{cf.icon || '⭐'}</td>
           <td><b>{cf.title_bn}</b>{cf.title_en && <><br/><small>{cf.title_en}</small></>}</td>
           <td><span className="badge">{cf.placement === 'both' ? 'উভয়' : cf.placement === 'public' ? 'পাবলিক' : 'অ্যাডমিন'}</span></td>
           <td><a href={cf.target_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0b8050' }}>{cf.target_url}</a></td>
           <td>
            <button className={'mini ' + (cf.enabled !== false ? 'active' : '')} style={{ background: cf.enabled !== false ? '#0b8050' : '#94a3b8', color: '#fff' }} onClick={() => toggleCustom(cf)}>
             {cf.enabled !== false ? '✓ চালু (ON)' : '✕ বন্ধ (OFF)'}
            </button>
           </td>
           <td>
            <button className="mini" onClick={() => editCustom(cf)}>সম্পাদনা</button>{' '}
            <button className="mini" onClick={() => deleteCustom(cf.id)} style={{ color: '#dc2626' }}>মুছুন</button>
           </td>
          </tr>
         ))}
         {!customList.length && (
          <tr>
           <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
            কোনো কাস্টম ফিচার বা লিঙ্ক এখনো যোগ করা হয়নি। বামপাশের ফর্ম থেকে যুক্ত করুন।
           </td>
          </tr>
         )}
        </tbody>
       </table>
      </div>
     </div>
    </>
   ) : (
    <div className="table-card full" style={{ gridColumn: '1 / -1' }}>
     <div className="toolbar">
      <div>
       <h2>{tab === 'public' ? '🌐 পাবলিক ওয়েবসাইট মেনু ও ফিচার নিয়ন্ত্রণ' : '⚙️ অ্যাডমিন ERP মডিউল ও ফিচার নিয়ন্ত্রণ'}</h2>
       <p className="portal-muted">যেকোনো মডিউল বন্ধ (OFF) করলে তা সংশ্লিষ্ট মেনু বা প্যানেলে আর প্রদর্শিত হবে না।</p>
      </div>
      <div className="filters" style={{ margin: 0 }}>
       <input placeholder="ফিচার অনুসন্ধান..." value={filter} onChange={e => setFilter(e.target.value)} />
       <button className="mini" onClick={load}>🔄 রিফ্রেশ</button>
      </div>
     </div>

     <div className="table-wrap">
      <table>
       <thead>
        <tr>
         <th>গ্রুপ / বিভাগ</th>
         <th>ফিচারের নাম</th>
         <th>Feature Key</th>
         <th>বর্তমান অবস্থা</th>
         <th>অ্যাকশন</th>
        </tr>
       </thead>
       <tbody>
        {filteredFeatures.map(f => {
         const isAct = f.enabled !== false;
         return (
          <tr key={f.feature_key || f.id}>
           <td><b>{f.group_name || 'সাধারণ'}</b></td>
           <td>
            <strong>{f.label_bn || f.feature_key}</strong>
            {f.label_en && <><br/><small style={{ color: '#64748b' }}>{f.label_en}</small></>}
           </td>
           <td><code style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{f.feature_key}</code></td>
           <td>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isAct ? '#0b8050' : '#dc2626' }}>
             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAct ? '#0b8050' : '#dc2626' }} />
             {isAct ? 'সক্রিয় (ON)' : 'নিষ্ক্রিয় (OFF)'}
            </span>
           </td>
           <td>
            <button
             type="button"
             onClick={() => toggleFeature(f)}
             className={'mini ' + (isAct ? 'active' : '')}
             style={{
              background: isAct ? '#0b8050' : '#64748b',
              color: '#fff',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
             }}
            >
             {isAct ? '✓ সক্রিয় (ON)' : '✕ বন্ধ (OFF)'}
            </button>
           </td>
          </tr>
         );
        })}
        {!filteredFeatures.length && (
         <tr>
          <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
           {loading ? 'লোড হচ্ছে...' : 'কোনো ফিচার পাওয়া যায়নি। ডেটাবেস সিঙ্ক বা টেবিল সক্রিয় রয়েছে কিনা যাচাই করুন।'}
          </td>
         </tr>
        )}
       </tbody>
      </table>
     </div>
    </div>
   )}
  </div>
 );
}

// RoutinePanel is modernized and modularized in RoutinePanel.jsx


function App(){
 const location = useLocation();
 const [roleStamp, setRoleStamp] = useState(() => {
  try {
    const raw = localStorage.getItem('magra_user');
    const u = raw ? JSON.parse(raw) : null;
    return (u?.login_id || u?.id || 'guest') + '_' + (u?.assigned_class || '') + '_' + Date.now();
  } catch { return 'guest_' + Date.now(); }
 });

 useEffect(() => {
  const syncRole = () => {
    try {
      const raw = localStorage.getItem('magra_user');
      const u = raw ? JSON.parse(raw) : null;
      setRoleStamp((u?.login_id || u?.id || 'guest') + '_' + (u?.assigned_class || '') + '_' + Date.now());
    } catch {
      setRoleStamp('user_' + Date.now());
    }
  };
  window.addEventListener('magra_auth_change', syncRole);
  window.addEventListener('magra_role_changed', syncRole);
  window.addEventListener('storage', syncRole);
  return () => {
    window.removeEventListener('magra_auth_change', syncRole);
    window.removeEventListener('magra_role_changed', syncRole);
    window.removeEventListener('storage', syncRole);
  };
 }, []);

 return (
  <>
      {location.pathname==="/admin" && <Admin key={'admin-' + roleStamp}/>}
   {location.pathname==="/portal" && <Portal key={'portal-' + roleStamp}/>}
   {location.pathname==="/login" && <div className="login-page"><Header/><Login/></div>}
   {location.pathname!=="/admin" && location.pathname!=="/portal" && location.pathname!=="/login" && <Home/>}
  </>
 );
}

const rootEl = document.getElementById("root");
if (!window.__magra_root) {
 window.__magra_root = createRoot(rootEl);
}
window.__magra_root.render(<ErrorBoundary><LanguageProvider><HashRouter><App/></HashRouter></LanguageProvider></ErrorBoundary>);
