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

import React,{useEffect,useMemo,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter,useNavigate,useLocation,Link} from 'react-router-dom';
import './styles.css';
import {publicNavConfig} from './publicNavConfig';
import {LanguageProvider,useLanguage,bilingual,LanguageSwitcher} from './i18n';
import {requestApi} from './apiClient';
import {ObserverSwitcher} from './ObserverSwitcher';
import {SubmenuDetailModal} from './SubmenuDetailModal';
import SupabaseSyncModal from './SupabaseSyncModal';
import {calculateStudentAge, matchesAgeFilter, parseNum} from './StudentAgeQueryModal';
import {StudentTotListModal} from './StudentTotListModal';
import {StudentDisabilityQueryModal, isSpecialNeedsStudent, getDisabilityType} from './StudentDisabilityQueryModal';
import {StudentProfessionQueryModal, ALL_PROFESSIONS_LIST, matchesStudentProfession} from './StudentProfessionQueryModal';
import {
  MOCK_USERS,
  MOCK_TEACHERS,
  MOCK_STAFF,
  PHOTO_PRESIDENT,
  PHOTO_HEAD_TEACHER,
  PHOTO_ASST_HEAD_TEACHER,
  PHOTO_ICT_TEACHER,
  PHOTO_OFFICE_ASSISTANT,
  getTeacherPhoto,
  getLeadershipData,
  DEFAULT_LEADERSHIP_DATA
} from './mockData';
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
 const gp = (s.guardian_phone||'').trim();
 if(gp) return gp;
 const fp = (s.father_mobile||'').trim();
 if(fp) return fp;
 const mp = (s.mother_mobile||'').trim();
 if(mp) return mp;
 const ep = (s.emergency_phone||'').trim();
 if(ep) return ep;
 return '—';
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
              style={{ padding: '8px 18px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => { 
                this.setState({ hasError: false, error: null }); 
                window.location.reload(); 
              }}
            >
              🔄 পেজ রিলোড করুন
            </button>
            <button 
              style={{ padding: '8px 18px', background: '#0b8050', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => {
                try {
                  localStorage.setItem('magra_admin_active_tab', 'dashboard');
                  localStorage.removeItem('magra_admin_active_sub');
                } catch {}
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              📊 ড্যাশবোর্ডে ফিরে যান
            </button>
            <button 
              style={{ padding: '8px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => { this.setState({ hasError: false, error: null }); }}
            >
              পুনরায় চেষ্টা করুন
            </button>
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
  <div className="header-inner"><a className="brand" href="#home" onClick={closeNav}><img src={logo} alt="বিদ্যালয়ের লোগো"/><div><h1>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h1><p>মগড়া, কালিহাতি, টাংগাইল</p></div></a><div className="header-actions"><button type="button" className="header-admission-btn" onClick={()=>handleSubmenuClick(null,'public.nav.admission.apply','অনলাইন শিক্ষার্থী ভর্তি আবেদন','#admission')}>🎓 অনলাইন ভর্তি</button><LanguageSwitcher/><a className="header-login" href="#/login" onClick={closeNav}>{label('লগইন',lang)}</a><button className="nav-toggle" onClick={()=>setOpen(!open)} aria-label="মেনু" aria-controls="public-navigation" aria-expanded={open}>☰</button></div></div>
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

 useEffect(()=>{
  api('/notices').then(setNotices).catch(()=>{});
  api('/public/content').then(setItems).catch(()=>{});
  api('/public/student-stats').then(setStats).catch(()=>setStats(null));
  api('/teachers?status=active').then(d=>{
   if(Array.isArray(d)&&d.length) setTeachersList(d);
   else {
     try {
       const local=JSON.parse(localStorage.getItem('magra_db_teachers')||'[]');
       setTeachersList(local.length>=15?local:MOCK_TEACHERS);
     } catch { setTeachersList(MOCK_TEACHERS); }
   }
  }).catch(()=>{
     try {
       const local=JSON.parse(localStorage.getItem('magra_db_teachers')||'[]');
       setTeachersList(local.length>=15?local:MOCK_TEACHERS);
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
   'স্মার্ট উপস্থিতি':'public.nav.guide.syllabus',
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

    <section id="distinguished" className="ref-section distinguished"><div className="distinguished-head"><h2>কৃতি শিক্ষার্থী</h2><p>বিদ্যালয়ের মেধাবী ও কৃতিত্বপূর্ণ শিক্ষার্থীদের তথ্য</p></div><div className="distinguished-grid">{[1,2,3,4].map(n=><article key={n} style={{cursor:'pointer'}} onClick={()=>setActiveModal({key:'public.nav.students.distinguished',title:'কৃতি ও বৃত্তিপ্রাপ্ত শিক্ষার্থী'})}><div className="student-silhouette">●</div><h3>কৃতি শিক্ষার্থী</h3><p>শিক্ষাবর্ষ ও অর্জনের তথ্য দেখুন</p></article>)}</div></section>

    <section id="gallery" className="ref-section"><div className="ref-title"><h2>ফটো ও ভিডিও গ্যালারি</h2><span></span></div><div className="gallery-tabs"><b>All</b><span>Photo</span><span>Video</span></div>{gallery.length?<div className="ref-gallery">{gallery.map(x=><button key={x.id} className="ref-gallery-item" onClick={()=>setLightbox(x)} aria-label={`${x.title_bn} বড় করে দেখুন`}><img src={x.image_url} alt={x.title_bn}/></button>)}</div>:<div className="gallery-placeholder"><span>🖼️</span><p>বিদ্যালয়ের ছবি ও ভিডিও এখানে প্রকাশিত হবে।</p></div>}</section>{lightbox&&<div className="ref-lightbox" role="dialog" aria-modal="true" aria-label="ছবির পূর্বরূপ" onClick={()=>setLightbox(null)}><div className="ref-lightbox-card" onClick={e=>e.stopPropagation()}><button className="ref-lightbox-close" onClick={()=>setLightbox(null)} aria-label="বন্ধ করুন">×</button><img src={lightbox.image_url} alt={lightbox.title_bn}/><h3>{lightbox.title_bn}</h3></div></div>}
   </div></section>

   <section className="ref-bottom"><div className="ref-container bottom-grid"><div><h3>বিদ্যালয় সম্পর্কিত</h3><a href="#school-info">বিদ্যালয় পরিচিতি</a><a href="#teachers">শিক্ষকবৃন্দ</a><a href="#notice">নোটিশবোর্ড</a><a href="#gallery">গ্যালারি</a></div><div><h3>শিক্ষার্থী ও অভিভাবক</h3><a href="#admission">অনলাইন ভর্তি</a><a href="#services">ফলাফল</a><a href="#services">উপস্থিতি</a><a href="#services">অনলাইন পরীক্ষা</a></div><div><h3>গুরুত্বপূর্ণ</h3><a href="#school-info">পরিচালনা কমিটি</a><a href="#school-info">নিয়ম-কানুন</a><a href="#contact">যোগাযোগ</a><a href="#/login">লগইন</a></div><div><h3>বিদ্যালয়ের ঠিকানা</h3><p>মগড়া, কালিহাতি, টাংগাইল</p><p>EIIN: 114290</p><p>ই-মেইল: magrapuhs.46@gmail.com</p></div></div><div className="ref-footer-line"><div className="ref-container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}><span>© মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয় • প্রতিষ্ঠিত ১৯৪৬ খ্রি.</span><button type="button" onClick={()=>setSupabaseSyncOpen(true)} style={{background:'rgba(255,255,255,0.18)',border:'1px solid rgba(255,255,255,0.35)',color:'#fff',padding:'5px 12px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',fontWeight:600}}>☁️ ক্লাউড ডেটাবেস সিঙ্ক (Supabase)</button></div></div></section>
  </main>
  {activeModal && <SubmenuDetailModal menuKey={activeModal.key} title={activeModal.title} onClose={()=>setActiveModal(null)} onNavigateRole={(role)=>{ setActiveModal(null); const matched=MOCK_USERS.find(u=>u.role_name===role)||MOCK_USERS[0]; localStorage.setItem('magra_token','demo-'+Date.now()); localStorage.setItem('magra_user',JSON.stringify(matched)); nav(['student','guardian','teacher','head_teacher','assistant_head_teacher'].includes(matched.role_name)?'/portal':'/admin'); }} />}
  {supabaseSyncOpen && <SupabaseSyncModal isOpen={supabaseSyncOpen} onClose={()=>setSupabaseSyncOpen(false)} />}
 </div>
}

function Login(){
 const {lang}=useLanguage();
 const[loginId,setLoginId]=useState('admin'),[password,setPassword]=useState('admin123'),[show,setShow]=useState(false),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
 const nav=useNavigate();

 const quickAccounts = [
  { key: 'admin', icon: '👑', label: 'সুপার অ্যাডমিন ERP', id: 'admin', pass: 'admin123', role: 'Super Admin', desc: 'সকল মডিউল ও কনফিগারেশন', user: MOCK_USERS[0] },
  { key: 'head', icon: '🎓', label: 'প্রধান শিক্ষক', id: 'head_teacher', pass: 'head123', role: 'Head Teacher', desc: 'একাডেমিক অনুমোদন ও রিপোর্ট', user: MOCK_USERS[1] },
  { key: 'asst', icon: '👩‍🏫', label: 'সহকারী প্রধান শিক্ষক', id: 'assistant_head_teacher', pass: 'asst123', role: 'Asst. Head Teacher', desc: 'রুটিন, উপস্থিতি ও পরীক্ষা', user: MOCK_USERS[2] },
  { key: 'teacher', icon: '👨‍🏫', label: 'সহকারী শিক্ষক (আইসিটি)', id: 'pilot-teacher-01', pass: 'teacher123', role: 'Teacher', desc: 'মার্ক এন্ট্রি ও লার্নিং', user: MOCK_USERS[3] },
  { key: 'student6', icon: '🧑‍🎓', label: 'শিক্ষার্থী (৬ষ্ঠ শ্রেণি)', id: 'pilot-student-06-01', pass: 'student123', role: 'Student 6', desc: 'ব্যক্তিগত রেজাল্ট ও AI Tutor', user: MOCK_USERS[4] },
  { key: 'student10', icon: '🧑‍🎓', label: 'শিক্ষার্থী (১০ম শ্রেণি)', id: 'pilot-student-10-01', pass: 'student123', role: 'Student 10', desc: 'এসএসসি প্রস্তুতি ও টেস্ট', user: MOCK_USERS[5] },
  { key: 'guardian', icon: '👨‍👩‍👧', label: 'অভিভাবক পোর্টাল', id: 'pilot-guardian-01', pass: 'guardian123', role: 'Guardian', desc: 'সন্তানের উপস্থিতি ও বেতন', user: MOCK_USERS[6] },
  { key: 'accountant', icon: '💰', label: 'হিসাবরক্ষক', id: 'accountant', pass: 'accountant123', role: 'Accountant', desc: 'ফি আদায় ও খরচের হিসাব', user: MOCK_USERS[7] },
  { key: 'librarian', icon: '📚', label: 'গ্রন্থাগারিক', id: 'librarian', pass: 'librarian123', role: 'Librarian', desc: 'বই ইস্যু ও রিটার্ন', user: MOCK_USERS[8] },
  { key: 'staff', icon: '🧑‍💼', label: 'অফিস সহকারী', id: 'staff', pass: 'staff123', role: 'Staff', desc: 'ডকুমেন্ট ও ভোটার তালিকা', user: MOCK_USERS[9] }
 ];

 const fillAndLogin = (item) => {
  setLoginId(item.id);
  setPassword(item.pass);
  localStorage.setItem('magra_token', 'demo-token-' + Date.now());
  localStorage.setItem('magra_user', JSON.stringify(item.user));
  if (['student', 'guardian', 'teacher', 'head_teacher', 'assistant_head_teacher'].includes(item.user.role_name)) {
   nav('/portal');
  } else {
   nav('/admin');
  }
 };

 async function submit(e){
  e.preventDefault();
  if(loading)return;
  setLoading(true);
  setMsg('লগইন হচ্ছে...');
  try{
   const d=await api('/auth/login',{method:'POST',body:JSON.stringify({loginId:loginId.trim(),password})});
   localStorage.setItem('magra_token',d.token);
   localStorage.setItem('magra_user',JSON.stringify(d.user));
   if(['student','guardian','teacher','head_teacher','assistant_head_teacher'].includes(d.user.role_name||d.user.role)){
    nav('/portal');
   } else {
    nav('/admin');
   }
  }catch(e){
   setMsg(e.message);
  }finally{
   setLoading(false);
  }
 }

 return <section id="login" className="login-section"><div className="login-shell"><div className="login-intro"><span className="section-kicker">SECURE SCHOOL PORTAL</span><h2>{bilingual('আপনার ডিজিটাল বিদ্যালয়ে স্বাগতম','Welcome to your Digital School',lang)}</h2><p>{bilingual('আপনার ব্যক্তিগত Login ID ও Password দিয়ে প্রবেশ করুন। নিচে সকল রোলের ডেমো আইডি ও পাসওয়ার্ড দেওয়া আছে, এক ক্লিকেই প্রবেশ করতে পারবেন।','Sign in with your personal Login ID and Password. Below are the demo credentials for all roles for instant access.',lang)}</p><div className="login-points"><span>✓ {bilingual('নিরাপদ ও ব্যক্তিগত অ্যাকাউন্ট','Secure personal account',lang)}</span><span>✓ {bilingual('Attendance ও Result','Attendance & Results',lang)}</span><span>✓ {bilingual('Digital Learning ও AI Tutor','Digital Learning & AI Tutor',lang)}</span></div></div><div className="loginbox loginbox-modern"><div className="login-logo"><img src={logo} alt="মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়ের লোগো"/></div><span className="login-label">SCHOOL ERP</span><h2>{bilingual('সিস্টেম লগইন','System Login',lang)}</h2><p className="login-help">{bilingual('নিচের আইডি ও পাসওয়ার্ড ব্যবহার করুন','Use the Login ID & Password below',lang)}</p><form onSubmit={submit}><label>Login ID<input autoFocus autoComplete="username" placeholder={lang==='en'?'Your Login ID':'আপনার Login ID (যেমন: admin, head_teacher)'} value={loginId} onChange={e=>setLoginId(e.target.value)} required/></label><label>Password<div className="password-field"><input autoComplete="current-password" type={show?'text':'password'} placeholder={lang==='en'?'Your Password':'আপনার Password'} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)} aria-label="পাসওয়ার্ড দেখুন">{show?'◉':'○'}</button></div></label><button className="btn btn-primary login-submit" disabled={loading} aria-busy={loading}>{loading?(lang==='en'?'Signing in...':'লগইন হচ্ছে...'):(lang==='en'?'Sign in →':'লগইন করুন →')}</button></form>{msg&&<p className="msg login-msg" role="status" aria-live="polite">{msg}</p>}<div className="login-actions"><a href="#/" className="login-back">← {lang==='en'?'Main Website':'মূল ওয়েবসাইট'}</a><small>{lang==='en'?'Default password for all demo accounts is set.':'সকল ডেমো একাউন্টের পাসওয়ার্ড সেট করা আছে।'}</small></div>

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

 </div></div></section>
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
function ContentPanel({ sub }){
 const[tab,setTab]=useState(sub==='achievements'||sub==='scholarships'?'scholarship':sub==='events'?'event_participants':'content');
 const types=[['institution','বিদ্যালয় পরিচিতি'],['event','অনুষ্ঠান/ইভেন্ট'],['sport','ক্রীড়া/সংস্কৃতি'],['achievement','অর্জন/পুরস্কার'],['facility','সুবিধা/অবকাঠামো'],['transport','পরিবহন'],['hostel','হোস্টেল'],['club','ক্লাব/সংগঠন'],['library_info','লাইব্রেরি তথ্য'],['gallery','গ্যালারি']];
 const empty={content_type:'event',title_bn:'',title_en:'',description:'',event_date:'',location:'',image_url:'',status:'published',sort_order:0};
 const[rows,setRows]=useState([]),[form,setForm]=useState(empty),[editing,setEditing]=useState(null),[msg,setMsg]=useState(''),[filter,setFilter]=useState(''),[typeFilter,setTypeFilter]=useState('');

 useEffect(()=>{
  if(sub==='achievements'||sub==='scholarships') setTab('scholarship');
  else if(sub==='events') setTab('event_participants');
  else if(sub==='clubs') { setTab('content'); setTypeFilter('club'); }
  else if(sub==='school') { setTab('content'); setTypeFilter('institution'); }
  else if(sub==='content') { setTab('content'); }
 },[sub]);

 const load=()=>api('/content').then(setRows).catch(e=>setMsg(e.message));useEffect(load,[]);const visible=rows.filter(r=>(!typeFilter||r.content_type===typeFilter)&&(!filter||[r.title_bn,r.title_en,r.description,r.location].filter(Boolean).join(' ').toLowerCase().includes(filter.toLowerCase())));
 async function save(e){e.preventDefault();try{await api(editing?'/content/'+editing:'/content',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setMsg(editing?'তথ্য আপডেট হয়েছে':'তথ্য প্রকাশ হয়েছে');setEditing(null);setForm(empty);load()}catch(e){setMsg(e.message)}}
 function edit(r){setEditing(r.id);setForm({content_type:r.content_type||'event',title_bn:r.title_bn||'',title_en:r.title_en||'',description:r.description||'',event_date:r.event_date?.slice(0,10)||'',location:r.location||'',image_url:r.image_url||'',status:r.status||'published',sort_order:r.sort_order||0});window.scrollTo({top:0,behavior:'smooth'})}
 async function remove(id){if(!confirm('এই কনটেন্ট মুছে ফেলবেন?'))return;try{await api('/content/'+id,{method:'DELETE'});setMsg('কনটেন্ট মুছে ফেলা হয়েছে');load()}catch(e){setMsg(e.message)}}

 if(tab==='scholarship') return <div><div className="tabs" style={{marginBottom:'16px'}}><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button></div><ScholarshipPanel/></div>;
 if(tab==='event_participants') return <div><div className="tabs" style={{marginBottom:'16px'}}><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button></div><EventParticipantsPanel/></div>;

 return <div className="module-grid"><div className="form-card full" style={{gridColumn:'1 / -1'}}><div className="tabs"><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>কনটেন্ট ও সুবিধা</button><button className={tab==='scholarship'?'active':''} onClick={()=>setTab('scholarship')}>বৃত্তি ও কৃতি শিক্ষার্থী</button><button className={tab==='event_participants'?'active':''} onClick={()=>setTab('event_participants')}>ইভেন্ট ও অংশগ্রহণকারী</button></div></div><div className="form-card"><div className="toolbar"><h2>{editing?'কনটেন্ট সম্পাদনা':'নতুন কনটেন্ট যোগ'}</h2>{editing&&<button className="mini" onClick={()=>{setEditing(null);setForm(empty)}}>বাতিল</button>}</div><form onSubmit={save} className="form-grid"><select value={form.content_type} onChange={e=>setForm({...form,content_type:e.target.value})}>{types.map(t=><option key={t[0]} value={t[0]}>{t[1]}</option>)}</select><input placeholder="শিরোনাম (বাংলা) *" value={form.title_bn} onChange={e=>setForm({...form,title_bn:e.target.value})} required/><input placeholder="শিরোনাম (English)" value={form.title_en} onChange={e=>setForm({...form,title_en:e.target.value})}/><input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})}/><input placeholder="স্থান/বিভাগ" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input placeholder="ছবির URL" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/><textarea className="full" placeholder="বিস্তারিত বিবরণ" rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><button className="btn full">{editing?'আপডেট করুন':'প্রকাশ করুন'}</button></form>{msg&&<p className="msg">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>কনটেন্ট তালিকা</h2><span>{visible.length} টি</span></div><div className="filters"><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="">সব ক্যাটাগরি</option>{types.map(t=><option key={t[0]} value={t[0]}>{t[1]}</option>)}</select><input placeholder="খুঁজুন..." value={filter} onChange={e=>setFilter(e.target.value)}/></div><div className="table-wrap"><table><thead><tr><th>টাইপ</th><th>শিরোনাম</th><th>তারিখ</th><th>স্থান</th><th></th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td>{types.find(t=>t[0]===r.content_type)?.[1]||r.content_type}</td><td><b>{r.title_bn}</b><br/><small>{r.title_en}</small></td><td>{r.event_date?.slice(0,10)||'—'}</td><td>{r.location||'—'}</td><td><button className="mini" onClick={()=>edit(r)}>সম্পাদনা</button> <button className="mini" onClick={()=>remove(r.id)}>মুছুন</button></td></tr>)}{!visible.length&&<tr><td colSpan="5">কোনো কনটেন্ট পাওয়া যায়নি।</td></tr>}</tbody></table></div></div></div>
}

function Admin(){
 const {lang}=useLanguage();
 const adminLabel=(bn)=>adminEn[bn]||bn;
 const nav=useNavigate(),[data,setData]=useState(null),[me,setMe]=useState(null);
 const [active,setActive]=useState(()=>{
  try {
   return localStorage.getItem('magra_admin_active_tab') || 'dashboard';
  } catch { return 'dashboard'; }
 });
 const [sub,setSub]=useState(()=>{
  try {
   return localStorage.getItem('magra_admin_active_sub') || null;
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

 useEffect(()=>{api('/me').then(setMe).catch(()=>{localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');nav('/login')});api('/dashboard').then(setData).catch(()=>{});api('/admin/features').then(d=>{const m={};(d.features||[]).forEach(f=>m[f.feature_key]=f.enabled!==false);setEnabled(m)}).catch(()=>setEnabled(null))},[nav]);
 const isOn=k=>enabled===null||enabled['admin.'+k]!==false;
 const logout=async()=>{try{await api('/auth/logout',{method:'POST'})}catch{}localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');localStorage.removeItem('magra_admin_active_tab');localStorage.removeItem('magra_admin_active_sub');nav('/login')};
 const choose=(k,s)=>{setActive(k);if(s){setSub(s);setExpanded(x=>({...x,[k]:true}));}else{if(k==='settings')setSub('leadership');else if(k==='feature_control')setSub('system');else setSub(null);setExpanded(x=>({...x,[k]:true}));}};
 const groups=ADMIN_NAV_GROUPS.map(g=>({...g,items:g.items.filter(x=>isOn(x.k)||x.k==='feature_control').map(x=>({...x,subs:(x.subs||[]).filter(([sk])=>enabled===null||enabled['admin.'+x.k+'.'+sk]!==false)}))})).filter(g=>g.items.length);
  if(!me)return <div className="portal-loading">Admin Panel লোড হচ্ছে...</div>;
  return <div className="admin"><aside><img src={logo}/><h2>School ERP</h2><p>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</p><div className="side-nav">{groups.map(g=><React.Fragment key={g.group}><div className="side-group-title">{lang==='en'?adminEn[g.group]||g.group:g.group}</div>{g.items.map(x=><div className="side-item-wrap" key={x.k}><button className={'side-main '+(active===x.k?'active':'')} onClick={()=>choose(x.k)}><span>{x.i}</span><b>{lang==='bi'?<>{x.n}<small className="lang-secondary">{x.e||''}</small></>:lang==='en'?adminLabel(x.n):x.n}</b>{Boolean(x.subs && x.subs.length > 0) ? <span className="side-caret">{expanded[x.k]?'▾':'▸'}</span> : null}</button>{Boolean(x.subs && x.subs.length > 0 && expanded[x.k]) ? <div className="side-subnav">{x.subs.map(([sk,label])=><button key={sk} className={active===x.k&&sub===sk?'active':''} onClick={()=>{setActive(x.k);setSub(sk)}}>↳ {lang==='en'?adminEn[label]||label:label}</button>)}</div> : null}</div>)}</React.Fragment>)}{enabled===null&&<div className="side-note">Feature control চালুর জন্য database migration প্রয়োজন।</div>}</div><button className="logout" onClick={logout}>লগআউট</button></aside><section className="panel"><div className="top"><div><span className="eyebrow">ADMINISTRATION</span><h1>{(()=>{const x=ADMIN_NAV_GROUPS.flatMap(g=>g.items).find(x=>x.k===active);return lang==='en'?adminLabel(x?.n||'ড্যাশবোর্ড'):x?.n||'ড্যাশবোর্ড'})()}</h1><p>{me?.full_name||'ব্যবহারকারী'} • {me?.role_label||me?.role_name||''}{sub?' • '+sub:''}</p></div><div className="admin-top-actions"><button type="button" className="btn mini" onClick={()=>setSupabaseSyncOpen(true)} style={{background:'#0b8050',color:'#fff',fontWeight:700,display:'flex',alignItems:'center',gap:'4px'}}>☁️ ক্লাউড সিঙ্ক</button><LanguageSwitcher/><div className="pill">EIIN 114290</div></div></div><ErrorBoundary>{active==='dashboard'&&<Dashboard data={data}/>} {active==='students'&&sub==='village'?<VillageStudentPanel/>:active==='students'&&<StudentPanel sub={sub}/>} {active==='staff'&&<StaffPanel sub={sub}/>} {active==='admission'&&<AdmissionPanel sub={sub}/>} {active==='attendance'&&<AttendancePanel/>} {active==='results'&&<ResultPanel sub={sub}/>} {active==='routine'&&<RoutinePanel/>} {active==='users'&&<UsersPanel sub={sub}/>} {active==='finance'&&<FinancePanel/>} {active==='library'&&<LibraryPanel/>} {active==='learning'&&<LearningPanel/>} {active==='question'&&<QuestionPanel/>} {active==='assignment'&&<AssignmentPanel/>} {active==='online_exam'&&<OnlineExamPanel/>} {active==='ai'&&<AIPanel/>} {active==='reports'&&<ReportsPanel/>} {active==='documents'&&<DocumentPanel sub={sub}/>} {active==='settings'&&<SettingsPanelWrapper sub={sub} setSub={setSub}/>} {active==='notice'&&<NoticePanel/>} {active==='notifications'&&<NotificationPanel/>} {active==='content'&&<ContentPanel sub={sub}/>} {active==='transport'&&<TransportPanel/>} {active==='hostel'&&<HostelPanel/>} {active==='feature_control'&&<FeatureControlPanel sub={sub}/>}</ErrorBoundary></section>{supabaseSyncOpen && <SupabaseSyncModal isOpen={supabaseSyncOpen} onClose={()=>setSupabaseSyncOpen(false)} />}</div>
 }

 const adminEn={
 'সারাংশ':'Summary','একাডেমিক':'Academic','প্রশাসন':'Administration','শিক্ষা':'Learning','রিপোর্ট ও ডকুমেন্ট':'Reports & Documents','কনটেন্ট ও সুবিধা':'Content & Facilities','যোগাযোগ':'Communication','নিরাপত্তা':'Security','ড্যাশবোর্ড':'Dashboard','শিক্ষার্থী':'Students','শিক্ষার্থী তালিকা':'Student Directory','নতুন শিক্ষার্থী এন্ট্রি':'New Student Entry','শিক্ষার্থী অনুসন্ধান':'Student Search','ভোটার তালিকা':'Voter List','গ্রামভিত্তিক তালিকা':'Village-wise List','শিক্ষক ও কর্মচারী':'Teachers & Staff','শিক্ষকবৃন্দের তালিকা':'Teachers List','নতুন শিক্ষক এন্ট্রি':'New Teacher Entry','কর্মচারীর তালিকা':'Staff List','নতুন কর্মচারী এন্ট্রি':'New Staff Entry','ভর্তি':'Admission','ভর্তি আবেদন':'Admission Applications','ভর্তি পরীক্ষা':'Admission Test','নির্বাচন ও ভর্তি':'Selection & Enrollment','উপস্থিতি':'Attendance','দৈনিক উপস্থিতি':'Daily Attendance','উপস্থিতি রিপোর্ট':'Attendance Reports','অভিভাবক সতর্কতা':'Guardian Alerts','পরীক্ষা ও ফলাফল':'Exams & Results','পরীক্ষা ও বিষয় সেটআপ':'Exam & Subject Setup','মার্ক এন্ট্রি':'Marks Entry','ফলাফল প্রসেসিং':'Result Processing','মার্কশিট ও প্রগ্রেস রিপোর্ট':'Marksheet & Progress Report','ট্যাবুলেশন শিট':'Tabulation Sheet','মেধা তালিকা':'Merit List','রুটিন':'Routine','ফি ও হিসাব':'Fees & Accounts','লাইব্রেরি':'Library','ডিজিটাল লার্নিং':'Digital Learning','ডিজিটাল কনটেন্ট':'Digital Content','সিলেবাস':'Syllabus','শিক্ষার্থী অগ্রগতি':'Student Progress','প্রশ্নব্যাংক':'Question Bank','মডেল প্রশ্ন':'Model Questions','অ্যাসাইনমেন্ট':'Assignments','মূল্যায়ন':'Evaluation','অনলাইন পরীক্ষা':'Online Exams','পরীক্ষা সেটআপ':'Exam Setup','পরীক্ষার ফলাফল':'Exam Results','AI শিক্ষা':'AI Education','AI বিশ্লেষণ':'AI Analytics','রিপোর্ট':'Reports','ডকুমেন্ট ও প্রিন্ট':'Documents & Print','প্রশংসাপত্র':'Commendation Certificate','সহশিক্ষা ও অর্জন':'School Life & Achievements','বিদ্যালয় তথ্য':'School Information','ক্লাব ও সংগঠন':'Clubs & Organizations','ইভেন্ট ও অংশগ্রহণকারী':'Events & Participants','অর্জন ও পুরস্কার':'Achievements & Awards','পরিবহন':'Transport','হোস্টেল':'Hostel','নোটিশ':'Notices','নোটিফিকেশন':'Notifications','ইউজার ও রোল':'Users & Roles','ব্যবহারকারী':'Users','রোল ও অনুমতি':'Roles & Permissions','সেশন ও নিরাপত্তা':'Sessions & Security','সেটিংস':'Settings','বাণী ও ফটো সেটিংস':'Leadership Speeches & Photos','পাসওয়ার্ড পরিবর্তন':'Change Password','ফিচার কন্ট্রোল':'Feature Control','সিস্টেম Feature ON/OFF':'System Feature ON/OFF','View Site Menu ON/OFF':'View Site Menu ON/OFF','নতুন Feature যোগ':'Add New Feature'};
 const ADMIN_NAV_GROUPS=[
  {group:'সারাংশ',items:[{k:'dashboard',n:'ড্যাশবোর্ড',e:'Dashboard',i:'📊'}]},
  {group:'একাডেমিক',items:[
   {k:'students',n:'শিক্ষার্থী',i:'🎓',subs:[['list','শিক্ষার্থী তালিকা'],['new','নতুন শিক্ষার্থী এন্ট্রি'],['csv','CSV শিক্ষার্থী আপলোড']]},
   {k:'staff',n:'শিক্ষক ও কর্মচারী',i:'👨‍🏫',subs:[['teachers_list','শিক্ষকবৃন্দের তালিকা'],['teacher_new','নতুন শিক্ষক এন্ট্রি'],['staff_list','কর্মচারীর তালিকা'],['staff_new','নতুন কর্মচারী এন্ট্রি']]},
   {k:'admission',n:'ভর্তি',i:'📝',subs:[['applications','ভর্তি আবেদন'],['test','ভর্তি পরীক্ষা'],['selection','নির্বাচন ও ভর্তি']]},
   {k:'attendance',n:'উপস্থিতি',i:'🕘',subs:[['daily','দৈনিক উপস্থিতি'],['reports','উপস্থিতি রিপোর্ট'],['alerts','অভিভাবক সতর্কতা']]},
   {k:'results',n:'পরীক্ষা ও ফলাফল',i:'📈',subs:[['setup','পরীক্ষা ও বিষয় সেটআপ'],['marks','মার্ক এন্ট্রি'],['processing','ফলাফল প্রসেসিং'],['marksheet','মার্কশিট ও প্রগ্রেস রিপোর্ট'],['tabulation','ট্যাবুলেশন শিট'],['merit','মেধা তালিকা']]},
   {k:'routine',n:'রুটিন',i:'🗓️'}
  ]},
  {group:'প্রশাসন',items:[{k:'finance',n:'ফি ও হিসাব',i:'💳'},{k:'library',n:'লাইব্রেরি',i:'📚'}]},
  {group:'শিক্ষা',items:[
   {k:'learning',n:'ডিজিটাল লার্নিং',i:'💻',subs:[['content','ডিজিটাল কনটেন্ট'],['syllabus','সিলেবাস'],['progress','শিক্ষার্থী অগ্রগতি']]},
   {k:'question',n:'প্রশ্নব্যাংক',i:'❓',subs:[['bank','প্রশ্নব্যাংক'],['model','মডেল প্রশ্ন']]},
   {k:'assignment',n:'অ্যাসাইনমেন্ট',i:'📘',subs:[['manage','অ্যাসাইনমেন্ট'],['review','মূল্যায়ন']]},
   {k:'online_exam',n:'অনলাইন পরীক্ষা',i:'🧪',subs:[['setup','পরীক্ষা সেটআপ'],['results','পরীক্ষার ফলাফল']]},
   {k:'ai',n:'AI শিক্ষা',i:'✨',subs:[['tutor','AI Tutor'],['analytics','AI বিশ্লেষণ']]}
  ]},
  {group:'রিপোর্ট ও ডকুমেন্ট',items:[{k:'reports',n:'রিপোর্ট',i:'📑'},{k:'documents',n:'ডকুমেন্ট ও প্রিন্ট',i:'🖨️',subs:[['id','ID Card'],['marksheet','Marksheet'],['certificate','Certificate'],['commendation_certificate','প্রশংসাপত্র'],['admit','Admit Card'],['tabulation','Tabulation'],['merit','Merit List']]}]},
  {group:'কনটেন্ট ও সুবিধা',items:[{k:'content',n:'সহশিক্ষা ও অর্জন',i:'🏆',subs:[['school','বিদ্যালয় তথ্য'],['clubs','ক্লাব ও সংগঠন'],['events','ইভেন্ট ও অংশগ্রহণকারী'],['achievements','অর্জন ও পুরস্কার']]},{k:'transport',n:'পরিবহন',i:'🚌'},{k:'hostel',n:'হোস্টেল',i:'🛏️'}]},
  {group:'যোগাযোগ',items:[{k:'notice',n:'নোটিশ',i:'📢'},{k:'notifications',n:'নোটিফিকেশন',i:'🔔'}]},
  {group:'নিরাপত্তা',items:[{k:'users',n:'ইউজার ও রোল',i:'👥',subs:[['accounts','ব্যবহারকারী'],['roles','রোল ও অনুমতি'],['links','Student/Guardian Link'],['provision','Profile → Login'],['sessions','সেশন ও নিরাপত্তা']]},{k:'settings',n:'সেটিংস',i:'⚙️',subs:[['leadership','বাণী ও ফটো সেটিংস'],['password','পাসওয়ার্ড পরিবর্তন']]},{k:'feature_control',n:'ফিচার কন্ট্রোল',i:'🧩',subs:[['system','সিস্টেম Feature ON/OFF'],['public','View Site Menu ON/OFF'],['custom','নতুন Feature যোগ']]}]}
 ];


function AttendancePanel(){const today=new Date().toISOString().slice(0,10);const[d,setD]=useState(today),[c,setC]=useState('6'),[rows,setRows]=useState([]),[msg,setMsg]=useState('');const load=()=>api(`/attendance/roster?date=${d}&class_name=${c}`).then(setRows).catch(e=>setMsg(e.message));useEffect(()=>{load();},[d,c]);const mark=(id,status)=>setRows(a=>a.map(x=>x.id===id?{...x,status}:x));const all=status=>setRows(a=>a.map(x=>({...x,status})));async function save(){try{const x=await api('/attendance/bulk',{method:'POST',body:JSON.stringify({date:d,records:rows.map(x=>({student_id:x.id,status:x.status}))})});setMsg(`${x.count} জনের উপস্থিতি সংরক্ষণ হয়েছে`)}catch(e){setMsg(e.message)}}return <div className="form-card"><div className="toolbar"><h2>Smart Attendance</h2><span>{rows.length} জন</span></div><div className="filters"><input type="date" value={d} onChange={e=>setD(e.target.value)}/><select value={c} onChange={e=>setC(e.target.value)}>{classes.map(x=><option key={x} value={x}>শ্রেণি {x}</option>)}</select></div><div className="attendance-actions"><button className="mini" onClick={()=>all('present')}>সবাই উপস্থিত</button><button className="mini" onClick={()=>all('absent')}>সবাই অনুপস্থিত</button><button className="btn" onClick={save}>সংরক্ষণ</button></div><div className="table-wrap"><table><thead><tr><th>রোল</th><th>Student ID</th><th>নাম</th><th>অবস্থা</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.roll_no||'—'}</td><td>{x.student_id}</td><td>{x.name_bn}</td><td>{['present','absent','late','leave'].map(v=><button key={v} className={x.status===v?'mini active':''} onClick={()=>mark(x.id,v)}>{v==='present'?'উপস্থিত':v==='absent'?'অনুপস্থিত':v==='late'?'দেরি':'ছুটি'}</button>)}</td></tr>)}</tbody></table></div>{msg&&<p className="success">{msg}</p>}</div>}
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
      ...custom.map(f => 'custom:' + f.field_key)
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
        ...c
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
  if (form.is_special_needs === 'হ্যাঁ' && !form.disability_type) {
    setMsg('অনুগ্রহ করে বিশেষ চাহিদাসম্পন্ন শিক্ষার্থীর প্রতিবন্ধিতার ধরন নির্বাচন করুন');
    setStep(0);
    return;
  }
  setMsg('সংরক্ষণ হচ্ছে...');
  try{
   const method=editing?'PUT':'POST';
   const path=editing?`/students/${editing}`:'/students';
   const payload = {
     ...form,
     is_special_needs: form.is_special_needs || 'না',
     disability_type: form.is_special_needs === 'হ্যাঁ' ? form.disability_type : '',
     special_needs: form.is_special_needs === 'হ্যাঁ' ? (form.disability_type || form.special_needs || 'হ্যাঁ') : ''
   };
   await api(path,{method,body:JSON.stringify(payload)});
   setMsg(editing?'শিক্ষার্থী তথ্য আপডেট হয়েছে':'নতুন শিক্ষার্থী সংরক্ষিত হয়েছে');
   setEditing(null);
   setForm({...emptyStudent,extended_profile:{education:[]}});
   setView('list');
   load();
  }catch(e){setMsg(e.message)}
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
     {step===4&&<><div className="form-section-title full"><b>ভর্তি ও অতিরিক্ত তথ্য</b></div><div className="field"><label>ভর্তির শ্রেণি</label><select value={form.admission_class} onChange={e=>change('admission_class',e.target.value)}>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select></div><div className="field"><label>ভর্তির বিভাগ {['9','10','৯','১০'].includes(String(form.admission_class).trim())?'* (৯ম/১০ম শ্রেণির জন্য)':'(৯ম ও ১০ম শ্রেণির জন্য)'}</label><select value={form.admission_group||''} onChange={e=>change('admission_group',e.target.value)} style={{borderColor:['9','10','৯','১০'].includes(String(form.admission_class).trim())?'#16a34a':undefined,fontWeight:['9','10','৯','১০'].includes(String(form.admission_class).trim())?600:'normal'}}><option value="">{['9','10','৯','১০'].includes(String(form.admission_class).trim())?'বিভাগ নির্বাচন করুন *':'প্রযোজ্য নয় / সাধারণ (৬ষ্ঠ-৮ম)'}</option><option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option><option value="মানবিক বিভাগ">মানবিক বিভাগ</option><option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option></select></div><div className="field"><label>ভর্তির তারিখ</label><input type="date" value={form.admission_date} onChange={e=>change('admission_date',e.target.value)}/></div><div className="field"><label>জরুরি মোবাইল</label><input value={form.emergency_phone} onChange={e=>change('emergency_phone',e.target.value)}/></div><div className="field"><label>বিশেষ চাহিদা/মন্তব্য</label><input value={form.special_needs} onChange={e=>change('special_needs',e.target.value)}/></div><div className="field"><label>অবস্থা</label><select value={form.status} onChange={e=>change('status',e.target.value)}><option value="active">সক্রিয়</option><option value="inactive">নিষ্ক্রিয়</option><option value="graduated">উত্তীর্ণ</option><option value="transferred">স্থানান্তরিত</option><option value="dropped_out">ঝরে পড়া</option></select></div><div className="field"><label>ছবি আপলোড</label><input type="file" accept="image/png,image/jpeg" onChange={file}/><small>JPG/PNG, সর্বোচ্চ 2MB</small></div><div className="field full"><label>অতিরিক্ত নোট</label><textarea rows="3" value={form.additional_notes} onChange={e=>change('additional_notes',e.target.value)}/></div><div className="form-section-title full"><b>শিক্ষাগত যোগ্যতার ইতিহাস</b><button type="button" className="mini" onClick={addEdu}>+ নতুন রেকর্ড</button></div>{(form.extended_profile?.education||[]).map((r,i)=><div className="repeat-card full" key={i}><input placeholder="পরীক্ষার নাম" value={r.exam} onChange={e=>updateEdu(i,'exam',e.target.value)}/><input placeholder="প্রতিষ্ঠান" value={r.institution} onChange={e=>updateEdu(i,'institution',e.target.value)}/><input placeholder="বোর্ড/বিশ্ববিদ্যালয়" value={r.board} onChange={e=>updateEdu(i,'board',e.target.value)}/><input placeholder="পাশের সন" value={r.year} onChange={e=>updateEdu(i,'year',e.target.value)}/><input placeholder="ফলাফল" value={r.result} onChange={e=>updateEdu(i,'result',e.target.value)}/><input placeholder="বিষয়" value={r.subject} onChange={e=>updateEdu(i,'subject',e.target.value)}/><button type="button" className="mini" onClick={()=>removeEdu(i)}>মুছুন</button></div>)}{form.photo_url&&<img className="form-photo-preview full" src={form.photo_url} alt="শিক্ষার্থীর ছবি"/>}</>}
     {step===4&&<CustomFields formKey="student" form={form} setForm={setForm}/>}
     <div className="form-actions full">
      <button type="button" className="mini" onClick={()=>setForm({...emptyStudent,extended_profile:{education:[]}})}>↺ ফর্ম রিসেট</button>
      {step>0&&<button type="button" className="mini" onClick={()=>setStep(step-1)}>← পূর্ববর্তী</button>}
      {step<4?<button type="button" className="btn" onClick={()=>{
        if(step===0 && form.is_special_needs==='হ্যাঁ' && !form.disability_type){
          setMsg('অনুগ্রহ করে বিশেষ চাহিদাসম্পন্ন শিক্ষার্থীর প্রতিবন্ধিতার ধরন নির্বাচন করুন');
          return;
        }
        setMsg('');
        setStep(step+1);
      }}>পরবর্তী ধাপ →</button>:<button className="btn">✓ {editing?'তথ্য আপডেট করুন':'শিক্ষার্থী সংরক্ষণ করুন'}</button>}
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
       <tr>
        <th style={{width:'36px',textAlign:'center'}}><input type="checkbox" style={{cursor:'pointer'}} checked={studentList.length>0 && selectedIds.length===studentList.length} onChange={toggleSelectAll}/></th>
        <th>{lang==='en'?'Student ID':'আইডি (ID)'}</th>
        <th>{lang==='en'?'Student Name':'শিক্ষার্থীর নাম'}</th>
        <th>{lang==='en'?'Class':'শ্রেণি'}</th>
        <th style={{color:'#0284c7'}}>{lang==='en'?'Department / Group':'বিভাগ'}</th>
        <th>{lang==='en'?'Roll':'রোল'}</th>
         <th>{lang==='en'?'Religion':'ধর্ম'}</th>
        <th>{lang==='en'?'Guardian':'অভিভাবক'}</th>
        <th>{lang==='en'?'Mobile':'মোবাইল'}</th>
        <th>{lang==='en'?'Status':'অবস্থা'}</th>
        <th style={{textAlign:'center',minWidth:'140px'}}>{lang==='en'?'Actions':'কাজ'}</th>
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
           <tr key={s.id} style={{background:selectedIds.includes(s.id)?'#f0fdf4':undefined}}>
            <td style={{textAlign:'center'}}><input type="checkbox" style={{cursor:'pointer'}} checked={selectedIds.includes(s.id)} onChange={()=>toggleSelectOne(s.id)}/></td>
            <td><code>{s.student_id}</code></td>
            <td><b>{studentName || '—'}</b></td>
            <td>{classDisplay}</td>
            <td>
              {s.department || s.group_name || s.group ? (
                <span style={{background:'#e0f2fe',color:'#0369a1',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',fontWeight:600}}>
                  {studentGroup}
                </span>
              ) : (
                <span style={{color:'#94a3b8'}}>—</span>
              )}
            </td>
            <td>{s.roll_no || '—'}</td>
             <td><span style={{background:(s.religion||'ইসলাম')==='হিন্দু'?'#fef3c7':(s.religion||'ইসলাম')==='বৌদ্ধ'?'#f3e8ff':(s.religion||'ইসলাম')==='খ্রিষ্টান'?'#e0e7ff':'#f0fdf4',color:(s.religion||'ইসলাম')==='হিন্দু'?'#b45309':(s.religion||'ইসলাম')==='বৌদ্ধ'?'#7e22ce':(s.religion||'ইসলাম')==='খ্রিষ্টান'?'#4338ca':'#15803d',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',fontWeight:600}}>{s.religion||'ইসলাম'}</span></td>
            <td>{studentGuardian}</td>
            <td>{getStudentPhone(s)}</td>
            <td><span style={{color: s.status==='active'?'#16a34a':'#dc2626', fontWeight:600}}>{studentStatus}</span></td>
            <td style={{textAlign:'center',whiteSpace:'nowrap'}}>
             <button className="mini" type="button" onClick={()=>edit(s)} style={{marginRight:'6px'}}>✏️ {isEn?'Edit':'সম্পাদনা'}</button>
             <button className="mini" type="button" onClick={()=>remove(s)} style={{background:'#fee2e2',color:'#b91c1c',border:'1px solid #fca5a5',fontWeight:600,cursor:'pointer'}}>🗑️ {isEn?'Delete':'মুছুন'}</button>
            </td>
           </tr>
         );
       })}
       {!studentList.length&&<tr><td colSpan="11" style={{textAlign:'center',padding:'24px',color:'#64748b'}}>{lang==='en'?'No student records found.':'কোনো শিক্ষার্থী পাওয়া যায়নি।'}</td></tr>}
      </tbody>
     </table>
    </div>
   </div>
  )}
   <StudentTotListModal isOpen={showTotListModal} onClose={()=>setShowTotListModal(false)} students={students}/>
   <StudentDisabilityQueryModal isOpen={showDisabilityQueryModal} onClose={()=>setShowDisabilityQueryModal(false)} students={students}/>
   <StudentProfessionQueryModal isOpen={showProfessionQueryModal} onClose={()=>setShowProfessionQueryModal(false)} students={students}/>
 </div>;
}
function AdmissionPanel({ sub }){
 const [apps,setApps]=useState([]),[summary,setSummary]=useState({total:0,submitted:0,under_review:0,selected:0,admitted:0}),[q,setQ]=useState(''),[year,setYear]=useState(String(new Date().getFullYear())),[className,setClassName]=useState(''),[status,setStatus]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState(emptyAdmission),[msg,setMsg]=useState('');
 useEffect(()=>{
  if(sub==='test') setStatus('under_review');
  else if(sub==='selection') setStatus('selected');
  else if(sub==='applications') setStatus('');
 },[sub]);
 const load=()=>{api(`/admissions?q=${encodeURIComponent(q)}&academic_year=${year}&applied_class=${encodeURIComponent(className)}&status=${status}`).then(setApps).catch(e=>setMsg(e.message));api(`/admissions/summary?academic_year=${year}`).then(setSummary).catch(()=>{})};
 useEffect(()=>{load();},[q,year,className,status]);
 const change=(k,v)=>setForm(f=>({...f,[k]:v}));
 const begin=a=>{setEditing(a.id);setForm({...emptyAdmission,...a,application_date:a.application_date?.slice(0,10)||'',date_of_birth:a.date_of_birth?.slice(0,10)||''});window.scrollTo({top:0,behavior:'smooth'})};
 async function save(e){e.preventDefault();try{await api(editing?`/admissions/${editing}`:'/admissions',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setMsg(editing?'আবেদন আপডেট হয়েছে':'ভর্তি আবেদন সংরক্ষণ হয়েছে');setEditing(null);setForm(emptyAdmission);load()}catch(e){setMsg(e.message)}}
 async function convert(a){if(!confirm(`${a.applicant_name_bn}-কে শিক্ষার্থী হিসেবে ভর্তি রেকর্ডে রূপান্তর করবেন?`))return;try{await api(`/admissions/${a.id}/convert`,{method:'POST',body:JSON.stringify({})});setMsg('শিক্ষার্থী রেকর্ড তৈরি হয়েছে');load()}catch(e){setMsg(e.message)}}
 return <div><div className="stats-row admission-stats"><div className="stat-card"><strong>{summary.total}</strong><span>মোট আবেদন</span></div><div className="stat-card"><strong>{summary.submitted}</strong><span>নতুন</span></div><div className="stat-card"><strong>{summary.under_review}</strong><span>পর্যালোচনায়</span></div><div className="stat-card"><strong>{summary.selected}</strong><span>নির্বাচিত</span></div><div className="stat-card"><strong>{summary.admitted}</strong><span>ভর্তি সম্পন্ন</span></div></div>
 <div className="module-grid"><div className="form-card"><div className="toolbar"><h2>{editing?'আবেদন সম্পাদনা':'নতুন ভর্তি আবেদন'}</h2>{editing&&<button className="mini" type="button" onClick={()=>{setEditing(null);setForm(emptyAdmission)}}>বাতিল</button>}</div>
 <form onSubmit={save} className="form-grid"><input type="number" placeholder="শিক্ষাবর্ষ" value={form.academic_year} onChange={e=>change('academic_year',e.target.value)} required/><select value={form.applied_class} onChange={e=>change('applied_class',e.target.value)} required><option value="" disabled>ভর্তির শ্রেণি *</option>{['৬','৭','৮','৯','১০'].map(x=><option key={x} value={x}>শ্রেণি {x}</option>)}</select><input placeholder="আবেদনকারীর বাংলা নাম *" value={form.applicant_name_bn} onChange={e=>change('applicant_name_bn',e.target.value)} required/><input placeholder="Applicant English Name" value={form.applicant_name_en} onChange={e=>change('applicant_name_en',e.target.value)}/><input type="date" value={form.date_of_birth||''} onChange={e=>change('date_of_birth',e.target.value)}/><select value={form.gender||''} onChange={e=>change('gender',e.target.value)}><option value="">লিঙ্গ</option><option>পুরুষ</option><option>নারী</option></select><input placeholder="জন্মনিবন্ধন নম্বর" value={form.birth_registration_no||''} onChange={e=>change('birth_registration_no',e.target.value)}/><input placeholder="পিতার নাম" value={form.father_name||''} onChange={e=>change('father_name',e.target.value)}/><input placeholder="মাতার নাম" value={form.mother_name||''} onChange={e=>change('mother_name',e.target.value)}/><input placeholder="অভিভাবকের নাম" value={form.guardian_name||''} onChange={e=>change('guardian_name',e.target.value)}/><input placeholder="অভিভাবকের মোবাইল *" value={form.guardian_phone||''} onChange={e=>change('guardian_phone',e.target.value)} required/><input placeholder="অভিভাবকের Email" value={form.guardian_email||''} onChange={e=>change('guardian_email',e.target.value)}/><input placeholder="পূর্বের বিদ্যালয়" value={form.previous_school||''} onChange={e=>change('previous_school',e.target.value)}/><input placeholder="কোটা (যদি থাকে)" value={form.quota||''} onChange={e=>change('quota',e.target.value)}/><input type="date" value={form.application_date||''} onChange={e=>change('application_date',e.target.value)}/><select value={form.status} onChange={e=>change('status',e.target.value)}>{Object.entries(admissionStatus).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><input type="number" step="0.01" placeholder="ভর্তি পরীক্ষার নম্বর" value={form.admission_test_mark||''} onChange={e=>change('admission_test_mark',e.target.value)}/><input type="number" step="0.01" placeholder="আবেদন/ভর্তি ফি" value={form.payment_amount||''} onChange={e=>change('payment_amount',e.target.value)}/><select value={form.payment_status} onChange={e=>change('payment_status',e.target.value)}><option value="unpaid">ফি বাকি</option><option value="partial">আংশিক</option><option value="paid">পরিশোধিত</option></select><textarea className="full" placeholder="ঠিকানা" value={form.address||''} onChange={e=>change('address',e.target.value)}/><textarea className="full" placeholder="অতিরিক্ত নোট" value={form.notes||''} onChange={e=>change('notes',e.target.value)}/><button className="btn full">{editing?'আপডেট করুন':'আবেদন সংরক্ষণ করুন'}</button></form>{msg&&<p className="msg">{msg}</p>}</div>
 <div className="table-card"><div className="toolbar"><h2>ভর্তি আবেদন তালিকা</h2><span>{apps.length} টি</span></div><div className="filters"><input placeholder="আবেদন নম্বর / নাম / মোবাইল" value={q} onChange={e=>setQ(e.target.value)}/><select value={year} onChange={e=>setYear(e.target.value)}><option value="2026">২০২৬</option><option value="2027">২০২৭</option><option value="2028">২০২৮</option></select><select value={className} onChange={e=>setClassName(e.target.value)}><option value="">সব শ্রেণি</option>{['৬','৭','৮','৯','১০'].map(x=><option key={x} value={x}>শ্রেণি {x}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">সব অবস্থা</option>{Object.entries(admissionStatus).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>আবেদন নং</th><th>নাম</th><th>শ্রেণি</th><th>অভিভাবক</th><th>মোবাইল</th><th>অবস্থা</th><th>কাজ</th></tr></thead><tbody>{apps.map(a=><tr key={a.id}><td>{a.application_no}</td><td>{a.applicant_name_bn}</td><td>{a.applied_class}</td><td>{a.guardian_name||'—'}</td><td>{a.guardian_phone}</td><td>{admissionStatus[a.status]||a.status}</td><td><button className="mini" type="button" onClick={()=>begin(a)}>সম্পাদনা</button>{a.status!=='admitted'&&<button className="mini" type="button" onClick={()=>convert(a)}>ভর্তি</button>}</td></tr>)}</tbody></table></div></div></div></div>}


const defaultRules=[['80','100','A+','5'],['70','79.99','A','4'],['60','69.99','A-','3.5'],['50','59.99','B','3'],['40','49.99','C','2'],['33','39.99','D','1'],['0','32.99','F','0']];
function ResultPanel({sub}){
 const[tab,setTab]=useState(({marks:'marks',setup:'setup',processing:'processing',marksheet:'marksheet',tabulation:'tabulation',merit:'merit'})[sub]||'marks');
 const[exams,setExams]=useState([]),[subjects,setSubjects]=useState([]),[schemes,setSchemes]=useState([]),[selectedExam,setSelectedExam]=useState(''),[className,setClassName]=useState('6'),[students,setStudents]=useState([]),[rows,setRows]=useState([]),[msg,setMsg]=useState(''),[analysis,setAnalysis]=useState(null);
 useEffect(()=>{if(sub){const m={marks:'marks',setup:'setup',processing:'processing',marksheet:'marksheet',tabulation:'tabulation',merit:'merit'};if(m[sub])setTab(m[sub])}},[sub]);
 const[examForm,setExamForm]=useState({name_bn:'',exam_type:'অভ্যন্তরীণ',start_date:'',end_date:'',status:'draft',grading_scheme_id:''});
 const[subjectForm,setSubjectForm]=useState({subject_id:'',full_marks:100,pass_marks:33,written_max:100,mcq_max:0,practical_max:0});
 const[schemeForm,setSchemeForm]=useState({name_bn:'বাংলাদেশ মাধ্যমিক সাধারণ গ্রেডিং',board:'মাধ্যমিক শিক্ষা',academic_year:new Date().getFullYear(),pass_percent:33,rules:defaultRules.map(x=>({min_percent:x[0],max_percent:x[1],letter_grade:x[2],gpa:x[3]}))});
 const load=()=>{api('/exams').then(setExams).catch(e=>setMsg(e.message));api('/subjects').then(setSubjects).catch(()=>{});api('/grading-schemes').then(setSchemes).catch(()=>{})};useEffect(load,[]);
 useEffect(()=>{if(selectedExam)api(`/exams/${selectedExam}/subjects`).then(setRows).catch(()=>{})},[selectedExam]);
 async function createExam(e){e.preventDefault();try{await api('/exams',{method:'POST',body:JSON.stringify(examForm)});setMsg('পরীক্ষা তৈরি হয়েছে');setExamForm({name_bn:'',exam_type:'অভ্যন্তরীণ',start_date:'',end_date:'',status:'draft',grading_scheme_id:''});load()}catch(e){setMsg(e.message)}}
 async function saveSubject(e){e.preventDefault();try{await api(`/exams/${selectedExam}/subjects`,{method:'POST',body:JSON.stringify(subjectForm)});setMsg('পরীক্ষার বিষয় সেটআপ হয়েছে');api(`/exams/${selectedExam}/subjects`).then(setRows)}catch(e){setMsg(e.message)}}
 async function createScheme(e){e.preventDefault();try{await api('/grading-schemes',{method:'POST',body:JSON.stringify(schemeForm)});setMsg('Grading scheme তৈরি হয়েছে');load()}catch(e){setMsg(e.message)}}
 async function loadMarks(){if(!selectedExam){setMsg('আগে পরীক্ষা নির্বাচন করুন');return}try{const st=await api(`/students?class_name=${className}&status=active`);const es=await api(`/exams/${selectedExam}/subjects`);const m=await api(`/marks?exam_id=${selectedExam}`);const map=new Map(m.map(x=>[x.student_id+'-'+x.subject_id,x]));const flat=[];st.forEach(x=>es.forEach(sub=>flat.push({...x,subject_id:sub.subject_id,subject_name:sub.name_bn,full_marks:sub.full_marks,written_max:sub.written_max,mcq_max:sub.mcq_max,practical_max:sub.practical_max,...(map.get(x.id+'-'+sub.subject_id)||{})})));setStudents(flat);setMsg(`${flat.length}টি নম্বর ঘর প্রস্তুত`)}catch(e){setMsg(e.message)}}
 function editMark(i,k,v){setStudents(a=>a.map((x,n)=>n===i?{...x,[k]:v}:x))}
 async function saveMarks(){try{const d=await api('/marks/bulk',{method:'POST',body:JSON.stringify({exam_id:selectedExam,records:students.map(x=>({student_id:x.id,subject_id:x.subject_id,written:x.written,mcq:x.mcq,practical:x.practical,absent:x.absent,remarks:x.remarks}))})});setMsg(`${d.count}টি নম্বর সংরক্ষণ হয়েছে`)}catch(e){setMsg(e.message)}}
 async function process(){try{const d=await api('/results/process',{method:'POST',body:JSON.stringify({exam_id:selectedExam})});setMsg(`${d.count}টি subject result process হয়েছে`)}catch(e){setMsg(e.message)}}
 async function loadAnalysis(){if(!selectedExam){setMsg('পরীক্ষা নির্বাচন করুন');return}try{setAnalysis(await api(`/results/analysis?exam_id=${selectedExam}&class_name=${className}`));setTab('analysis')}catch(e){setMsg(e.message)}}
 async function merit(){if(!selectedExam){setMsg('পরীক্ষা নির্বাচন করুন');return}try{const d=await api(`/results/summary?exam_id=${selectedExam}&class_name=${className}`);setRows(d);setTab('merit')}catch(e){setMsg(e.message)}}
 return <div className="result-panel"><div className="tabs">{[['marks','নম্বর এন্ট্রি'],['analysis','ফলাফল বিশ্লেষণ'],['setup','পরীক্ষা সেটআপ'],['subjects','বিষয় সেটআপ'],['grading','গ্রেডিং'],['processing','ফলাফল প্রসেসিং'],['marksheet','মার্কশিট'],['tabulation','ট্যাবুলেশন শিট'],['merit','মেধা তালিকা']].map(x=><button key={x[0]} className={tab===x[0]?'active':''} onClick={()=>setTab(x[0])}>{x[1]}</button>)}</div>
 <div className="result-toolbar"><select value={selectedExam} onChange={e=>setSelectedExam(e.target.value)}><option value="">পরীক্ষা নির্বাচন করুন</option>{exams.map(e=><option key={e.id} value={e.id}>{e.name_bn}</option>)}</select><select value={className} onChange={e=>setClassName(e.target.value)}>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select>{msg&&<span className="msg">{msg}</span>}</div>
 {tab==='setup'&&<div className="form-card"><h2>নতুন পরীক্ষা</h2><form onSubmit={createExam} className="form-grid"><input placeholder="পরীক্ষার নাম *" value={examForm.name_bn} onChange={e=>setExamForm({...examForm,name_bn:e.target.value})} required/><input placeholder="পরীক্ষার ধরন" value={examForm.exam_type} onChange={e=>setExamForm({...examForm,exam_type:e.target.value})}/><input type="date" value={examForm.start_date} onChange={e=>setExamForm({...examForm,start_date:e.target.value})}/><input type="date" value={examForm.end_date} onChange={e=>setExamForm({...examForm,end_date:e.target.value})}/><select value={examForm.grading_scheme_id} onChange={e=>setExamForm({...examForm,grading_scheme_id:e.target.value})}><option value="">Grading scheme (পরে সেট করা যাবে)</option>{schemes.map(g=><option key={g.id} value={g.id}>{g.name_bn}</option>)}</select><select value={examForm.status} onChange={e=>setExamForm({...examForm,status:e.target.value})}><option value="draft">খসড়া</option><option value="published">প্রকাশিত</option></select><button className="btn full">পরীক্ষা সংরক্ষণ</button></form><div className="table-wrap"><table><thead><tr><th>পরীক্ষা</th><th>ধরন</th><th>তারিখ</th><th>অবস্থা</th></tr></thead><tbody>{exams.map(e=><tr key={e.id}><td>{e.name_bn}</td><td>{e.exam_type||'—'}</td><td>{e.start_date||'—'}</td><td>{e.status}</td></tr>)}</tbody></table></div></div>}
 {tab==='subjects'&&<div className="module-grid"><div className="form-card"><h2>পরীক্ষার বিষয় ও নম্বর বণ্টন</h2><form onSubmit={saveSubject} className="form-grid"><select value={subjectForm.subject_id} onChange={e=>setSubjectForm({...subjectForm,subject_id:e.target.value})} required><option value="">বিষয় নির্বাচন করুন</option>{subjects.filter(x=>!x.class_name||x.class_name===className).map(x=><option key={x.id} value={x.id}>{x.code} — {x.name_bn}</option>)}</select>{[['full_marks','পূর্ণ নম্বর'],['pass_marks','পাস নম্বর'],['written_max','লিখিত'],['mcq_max','MCQ'],['practical_max','ব্যবহারিক']].map(([k,l])=><input key={k} type="number" step="0.01" placeholder={l} value={subjectForm[k]} onChange={e=>setSubjectForm({...subjectForm,[k]:e.target.value})}/>) }<button className="btn full" disabled={!selectedExam}>সেটআপ সংরক্ষণ</button></form></div><div className="table-card"><h2>{selectedExam?'নির্বাচিত পরীক্ষার বিষয়':'আগে পরীক্ষা নির্বাচন করুন'}</h2><div className="table-wrap"><table><thead><tr><th>কোড</th><th>বিষয়</th><th>পূর্ণ</th><th>পাস</th><th>বণ্টন</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.code}</td><td>{x.name_bn}</td><td>{x.full_marks}</td><td>{x.pass_marks}</td><td>{x.written_max}+{x.mcq_max}+{x.practical_max}</td></tr>)}</tbody></table></div></div></div>}
 {tab==='grading'&&<div className="form-card"><h2>Configurable Grading Scheme</h2><form onSubmit={createScheme}><input placeholder="Scheme নাম" value={schemeForm.name_bn} onChange={e=>setSchemeForm({...schemeForm,name_bn:e.target.value})} required/><input placeholder="Board" value={schemeForm.board} onChange={e=>setSchemeForm({...schemeForm,board:e.target.value})}/><input type="number" placeholder="শিক্ষাবর্ষ" value={schemeForm.academic_year} onChange={e=>setSchemeForm({...schemeForm,academic_year:e.target.value})}/><input type="number" step="0.01" placeholder="Pass %" value={schemeForm.pass_percent} onChange={e=>setSchemeForm({...schemeForm,pass_percent:e.target.value})}/><div className="table-wrap"><table><thead><tr><th>Min %</th><th>Max %</th><th>Grade</th><th>GPA</th></tr></thead><tbody>{schemeForm.rules.map((r,i)=><tr key={i}>{['min_percent','max_percent','letter_grade','gpa'].map(k=><td key={k}><input value={r[k]} onChange={e=>setSchemeForm({...schemeForm,rules:schemeForm.rules.map((z,n)=>n===i?{...z,[k]:e.target.value}:z)})}/></td>)}</tr>)}</tbody></table></div><button className="btn">Grading scheme সংরক্ষণ</button></form></div>}
 {tab==='analysis'&&<div className="analysis-panel">{!analysis?<div className="form-card"><h2>ফলাফল বিশ্লেষণ</h2><p>নির্বাচিত পরীক্ষা ও শ্রেণির জন্য বিশ্লেষণ তৈরি করুন।</p><button className="btn" onClick={loadAnalysis}>বিশ্লেষণ তৈরি করুন</button></div>:<><div className="report-cards"><div><b>{analysis.overall?.students||0}</b><span>শিক্ষার্থী</span></div><div><b>{analysis.overall?.passed||0}</b><span>উত্তীর্ণ</span></div><div><b>{analysis.overall?.failed||0}</b><span>অকৃতকার্য</span></div><div><b>{analysis.overall?.incomplete||0}</b><span>অসম্পূর্ণ</span></div><div><b>{analysis.overall?.avg_percentage||0}%</b><span>গড় শতকরা</span></div><div><b>{analysis.overall?.avg_gpa||0}</b><span>গড় GPA</span></div><div><b>{Number(analysis.overall?.highest_percentage||0).toFixed(2)}%</b><span>সর্বোচ্চ</span></div><div><b>{Number(analysis.overall?.lowest_percentage||0).toFixed(2)}%</b><span>সর্বনিম্ন</span></div></div><div className="module-grid"><div className="table-card"><div className="toolbar"><h2>বিষয়ভিত্তিক বিশ্লেষণ</h2><button className="mini" onClick={loadAnalysis}>রিফ্রেশ</button></div><div className="table-wrap"><table><thead><tr><th>বিষয়</th><th>গড় নম্বর</th><th>গড় %</th><th>উত্তীর্ণ</th><th>অকৃতকার্য</th><th>Pass Rate</th></tr></thead><tbody>{(analysis.subjects||[]).map(x=><tr key={x.code}><td>{x.code} — {x.subject_name}</td><td>{x.avg_marks}</td><td>{x.avg_percentage}%</td><td>{x.passed}</td><td>{x.failed}</td><td>{x.pass_rate}%</td></tr>)}</tbody></table></div></div><div className="table-card"><h2>শ্রেণিভিত্তিক সারাংশ</h2><div className="table-wrap"><table><thead><tr><th>শ্রেণি</th><th>শিক্ষার্থী</th><th>উত্তীর্ণ</th><th>অকৃতকার্য</th><th>গড় %</th><th>গড় GPA</th></tr></thead><tbody>{(analysis.classes||[]).map(x=><tr key={x.class_name}><td>{x.class_name}</td><td>{x.students}</td><td>{x.passed}</td><td>{x.failed}</td><td>{x.avg_percentage}%</td><td>{x.avg_gpa||0}</td></tr>)}</tbody></table></div></div></div><div className="table-card"><h2>Grade Distribution</h2><div className="grade-grid">{(analysis.grades||[]).map(x=><div key={x.grade}><b>{x.grade}</b><span>{x.count}</span></div>)}</div></div></>}</div>}
 {tab==='marks'&&<div className="table-card"><div className="toolbar"><h2>নম্বর এন্ট্রি</h2><div><button className="mini" onClick={loadMarks}>Roster/Marks Load</button><button className="btn" onClick={saveMarks}>সব নম্বর সংরক্ষণ</button><button className="mini" onClick={process}>Result Process</button><button className="mini" onClick={merit}>মেধা দেখুন</button></div></div><div className="table-wrap"><table><thead><tr><th>রোল</th><th>নাম</th><th>বিষয়</th><th>লিখিত</th><th>MCQ</th><th>ব্যবহারিক</th><th>মোট</th></tr></thead><tbody>{students.map((x,i)=><tr key={x.id+'-'+x.subject_id}><td>{x.roll_no||'—'}</td><td>{x.name_bn}</td><td>{x.subject_name}</td>{['written','mcq','practical'].map(k=><td key={k}><input className="score-input" type="number" min="0" step="0.01" value={x[k]??''} onChange={e=>editMark(i,k,e.target.value)}/></td>)}<td>{[x.written,x.mcq,x.practical].reduce((a,v)=>a+(Number(v)||0),0)}</td></tr>)}</tbody></table></div></div>}
 {tab==='processing'&&<div className="form-card"><h2>ফলাফল প্রসেসিং</h2><p>নির্বাচিত পরীক্ষা ও শ্রেণির নম্বর থেকে ফলাফল গণনা করুন।</p><button className="btn" onClick={process} disabled={!selectedExam}>🧮 Result Process চালান</button>{msg&&<p className="msg">{msg}</p>}</div>}
 {tab==='marksheet'&&<div className="form-card"><h2>মার্কশিট</h2><p>শিক্ষার্থী নির্বাচন করে Official Document Generator-এর Marksheet থেকে Print/PDF তৈরি করুন।</p><button className="btn" onClick={()=>window.dispatchEvent(new CustomEvent('open-document',{detail:'marksheet'}))}>মার্কশিট মডিউলে যান</button></div>}
 {tab==='tabulation'&&<div className="form-card"><h2>ট্যাবুলেশন শিট</h2><p>নির্বাচিত পরীক্ষা ও শ্রেণির aggregate result থেকে Tabulation তৈরি করুন।</p><button className="btn" onClick={()=>window.dispatchEvent(new CustomEvent('open-document',{detail:'tabulation'}))}>ট্যাবুলেশন মডিউলে যান</button></div>}
 {tab==='merit'&&<div className="table-card"><div className="toolbar"><h2>মেধা ও ফলাফল তালিকা</h2><button className="btn" onClick={merit}>Refresh</button></div><div className="table-wrap"><table><thead><tr><th>মেধা</th><th>রোল</th><th>Student ID</th><th>নাম</th><th>বিষয়</th><th>মোট নম্বর</th><th>শতকরা</th><th>GPA</th><th>ফলাফল</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.merit}</td><td>{x.roll_no||'—'}</td><td>{x.student_id}</td><td>{x.name_bn}</td><td>{x.subjects}</td><td>{x.total_marks}</td><td>{x.percentage}%</td><td>{x.gpa??'—'}</td><td>{x.result_status}</td></tr>)}</tbody></table></div></div>}
 </div>}

const emptyTeacher={public_contact_role:'',public_contact_enabled:true,employee_id:'',name_bn:'',name_en:'',designation:'',designation_en:'',subject:'',phone:'',email:'',joining_date:'',gender:'',address:'',photo_url:'',status:'active',nid_no:'',tin_no:'',birth_registration_no:'',whatsapp_no:'',blood_group:'',religion:'',marital_status:'',nationality:'বাংলাদেশী',father_name_bn:'',father_name_en:'',mother_name_bn:'',mother_name_en:'',first_joining_date:'',first_mpo_date:'',current_post_joining_date:'',current_mpo_date:'',previous_institution_joining_date:'',previous_institution_mpo_date:'',appointment_date:'',appointment_authority:'',mpo_index_no:'',teacher_registration_no:'',registration_date:'',teacher_portal_id:'',permanent_address:'',extended_profile:{education:[],professional_qualifications:[],training:[],ntrca:{},dob:'',professional_note:''}};
const emptyStaff={public_contact_role:'',public_contact_enabled:true,employee_id:'',name_bn:'',name_en:'',designation:'',phone:'',email:'',joining_date:'',gender:'',address:'',photo_url:'',status:'active',nid_no:'',tin_no:'',birth_registration_no:'',whatsapp_no:'',blood_group:'',religion:'',marital_status:'',nationality:'বাংলাদেশী',father_name_bn:'',father_name_en:'',mother_name_bn:'',mother_name_en:'',first_joining_date:'',current_post_joining_date:'',appointment_date:'',appointment_authority:'',permanent_address:'',extended_profile:{education:[],professional_qualifications:[],training:[],dob:'',professional_note:''}};

function StaffPanel({sub}){
 const getInitialTab = (s) => (s==='staff'||s==='staff_list'||s==='staff_new'||s==='employees') ? 'staff' : 'teachers';
 const getInitialView = (s) => (s==='teacher_new'||s==='staff_new') ? 'form' : 'list';

 const [tab, setTab] = useState(getInitialTab(sub));
 const [view, setView] = useState(getInitialView(sub));
 const [teachers,setTeachers]=useState([]);
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
  }
 },[sub]);

 const isTeacher = tab === 'teachers';
  const rawList = isTeacher ? teachers : staff;
  const list = useMemo(() => sortPeopleByEmployeeId(rawList), [rawList]);
  const blank = isTeacher ? emptyTeacher : emptyStaff;
 
 const load=()=>{
  api(`/teachers?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&custom_field_key=${encodeURIComponent(customFieldKey)}&custom_field_value=${encodeURIComponent(customFieldValue)}`)
    .then(data => setTeachers(sortPeopleByEmployeeId(Array.isArray(data) ? data : [])))
   .catch(e=>setMsg(e.message));
  api(`/staff?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&custom_field_key=${encodeURIComponent(customFieldKey)}&custom_field_value=${encodeURIComponent(customFieldValue)}`)
    .then(data => setStaff(sortPeopleByEmployeeId(Array.isArray(data) ? data : [])))
   .catch(()=>{});
 };

 useEffect(()=>{
  api('/admin/form-fields?form_key='+(isTeacher?'teacher':'staff')).then(d=>setCustomFields(Array.isArray(d)?d:[])).catch(()=>setCustomFields([]));
 },[isTeacher]);

 useEffect(()=>{load();},[q,status,customFieldKey,customFieldValue]);

 const exportPeople=()=>{
  const custom=customFields.filter(f=>f.enabled&&!f.is_system);
  const headers=['Employee ID','Name','Designation',...(isTeacher?['Subject']:[]),'Mobile','Status',...custom.map(f=>'custom:'+f.field_key)];
  const rows=(list||[]).map(x=>{
   const c=flattenCustom(x);
   return {'Employee ID':x.employee_id||'',Name:x.name_bn||'',Designation:x.designation||'',...(isTeacher?{Subject:x.subject||''}:{}),Mobile:x.phone||'',Status:statusBn(x.status),...c};
  });
  downloadCsv(isTeacher?'magra-teachers.csv':'magra-staff.csv',rows,headers);
 };

 const peopleImportHeaders=isTeacher?['public_contact_role','public_contact_enabled','employee_id','name_bn','name_en','designation','designation_en','subject','phone','email','joining_date','gender','address','nid_no','tin_no','birth_registration_no','whatsapp_no','blood_group','religion','marital_status','nationality','father_name_bn','father_name_en','mother_name_bn','mother_name_en','first_joining_date','first_mpo_date','current_post_joining_date','current_mpo_date','previous_institution_joining_date','previous_institution_mpo_date','appointment_date','appointment_authority','mpo_index_no','teacher_registration_no','registration_date','teacher_portal_id','permanent_address','status','extended_profile_json']:['public_contact_role','public_contact_enabled','employee_id','name_bn','name_en','designation','phone','email','joining_date','gender','address','nid_no','tin_no','birth_registration_no','whatsapp_no','blood_group','religion','marital_status','nationality','father_name_bn','father_name_en','mother_name_bn','mother_name_en','first_joining_date','current_post_joining_date','appointment_date','appointment_authority','permanent_address','status','extended_profile_json'];
 const downloadPeopleTemplate=()=>downloadCsv(isTeacher?'magra-teacher-import-template.csv':'magra-staff-import-template.csv',[Object.fromEntries(peopleImportHeaders.map(k=>[k,k==='employee_id'?(isTeacher?'TCH-001':'STF-001'):k==='name_bn'?'নমুনা নাম':k==='designation'?(isTeacher?'সহকারী শিক্ষক':'অফিস সহকারী'):k==='status'?'active':k==='nationality'?'বাংলাদেশী':k==='extended_profile_json'?'{}':'']))],peopleImportHeaders);
 
 const importPeople=async(e)=>{
  const file=e.target.files?.[0];
  e.target.value='';
  if(!file)return;
  try{
   const matrix=parseCsvText(await file.text());
   if(matrix.length<2)throw new Error('CSV-তে কোনো তথ্য পাওয়া যায়নি');
   const headers=matrix[0].map(x=>x.trim().toLowerCase());
   const required=['employee_id','name_bn','designation'];
   const missing=required.filter(x=>!headers.includes(x));
   if(missing.length)throw new Error(`আবশ্যিক কলাম নেই: ${missing.join(', ')}`);
   const rows=matrix.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]??'').trim()]))).filter(x=>Object.values(x).some(Boolean));
   const result=await api(isTeacher?'/teachers/bulk-import':'/staff/bulk-import',{method:'POST',body:JSON.stringify({people:rows})});
   setMsg(`${result.message||'ইমপোর্ট সম্পন্ন'}${result.error_count?` — ${result.error_count}টি সারিতে সমস্যা`:''}`);
   setView('list');
   load();
  }catch(err){
   setMsg(err.message||'CSV আপলোড ব্যর্থ');
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

 const updateTrainingField = (i, field, val) => {
  ext('training', (form?.extended_profile?.training || []).map((r, n) => {
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

 const setTrainingSaved = (i, isSaved) => {
  ext('training', (form?.extended_profile?.training || []).map((r, n) => n === i ? { ...r, is_saved: isSaved } : r));
  if (isSaved) setMsg('প্রশিক্ষণ তথ্য সফলভাবে সংরক্ষিত হয়েছে');
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

 const switchTab=(t, v)=>{
  setTab(t);
  if(v) setView(v);
  setEditing(null);
  setForm(initNewForm(t));
  setStep(0);
 };

 const steps=[['👤','পরিচয় ও পরিবার'],['💼','চাকরি ও MPO'],['🎓','শিক্ষাগত যোগ্যতার বিবরণ'],['📜','পেশাগত যোগ্যতার বিবরণ'],['📚','প্রশিক্ষণ'],['📝','নিবন্ধন/NTRCA'],['📞','যোগাযোগ']];

 return <div>
  <div className="tabs" style={{marginBottom:'16px'}}>
   <button type="button" className={isTeacher&&view==='list'?'active':''} onClick={()=>switchTab('teachers','list')}>👨‍🏫 শিক্ষকবৃন্দ তালিকা ({teachers.length})</button>
   <button type="button" className={isTeacher&&view==='form'?'active':''} onClick={()=>switchTab('teachers','form')}>➕ {isTeacher&&editing?'শিক্ষক তথ্য সম্পাদনা':'নতুন শিক্ষক এন্ট্রি'}</button>
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
     {step===1&&<><div className="form-section-title full"><b>পেশাগত/চাকরির তথ্য</b></div><div className="field"><label>পদবী *</label><input value={form.designation||''} onChange={e=>change('designation',e.target.value)} required/></div>{isTeacher&&<><div className="field"><label>English Designation</label><input value={form.designation_en||''} onChange={e=>change('designation_en',e.target.value)}/></div><div className="field"><label>মূল বিষয়</label><input value={form.subject||''} onChange={e=>change('subject',e.target.value)}/></div></>}<div className="field"><label>১ম যোগদানের তারিখ</label><input type="date" value={form.first_joining_date||''} onChange={e=>change('first_joining_date',e.target.value)}/></div><div className="field"><label>১ম এমপিওভুক্তির তারিখ</label><input type="date" value={form.first_mpo_date||''} onChange={e=>change('first_mpo_date',e.target.value)}/></div><div className="field"><label>বর্তমান পদে যোগদানের তারিখ</label><input type="date" value={form.current_post_joining_date||form.joining_date||''} onChange={e=>{change('current_post_joining_date',e.target.value);change('joining_date',e.target.value)}}/></div>{isTeacher&&<div className="field"><label>বর্তমান পদে এমপিও তারিখ</label><input type="date" value={form.current_mpo_date||''} onChange={e=>change('current_mpo_date',e.target.value)}/></div>}<div className="field"><label>পূর্ববর্তী প্রতিষ্ঠানে যোগদানের তারিখ</label><input type="date" value={form.previous_institution_joining_date||''} onChange={e=>change('previous_institution_joining_date',e.target.value)}/></div>{isTeacher&&<div className="field"><label>পূর্ববর্তী প্রতিষ্ঠানে এমপিও তারিখ</label><input type="date" value={form.previous_institution_mpo_date||''} onChange={e=>change('previous_institution_mpo_date',e.target.value)}/></div>}<div className="field"><label>নিয়োগের তারিখ</label><input type="date" value={form.appointment_date||''} onChange={e=>change('appointment_date',e.target.value)}/></div><div className="field"><label>নিয়োগকারী কর্তৃপক্ষ</label><input value={form.appointment_authority||''} onChange={e=>change('appointment_authority',e.target.value)}/></div>{isTeacher&&<div className="field"><label>এমপিও কোড/ইনডেক্স নম্বর</label><input value={form.mpo_index_no||''} onChange={e=>change('mpo_index_no',e.target.value)}/></div>}<div className="field"><label>অবস্থা</label><select value={form.status||'active'} onChange={e=>change('status',e.target.value)}>{(isTeacher?['active','inactive','retired','former']:['active','inactive']).map(x=><option key={x} value={x}>{statusBn(x)}</option>)}</select></div></>}
     {step===2&&<><div className="form-section-title full"><b>শিক্ষাগত যোগ্যতার বিবরণ</b><button type="button" className="mini" onClick={()=>addRow('education')}>+ নতুন শিক্ষাগত যোগ্যতা</button></div>{(form.extended_profile?.education||[]).map((r,i)=><div className="repeat-card full" key={i} style={{background:r.is_saved?'#f0fdf4':'#fbfdff',border:r.is_saved?'1px solid #bbf7d0':'1px solid #dfe8f2'}}><select value={r.exam||''} onChange={e=>updateRow('education',i,'exam',e.target.value)} disabled={!!r.is_saved} style={{padding:'8px 10px',borderRadius:'8px',border:'1px solid #cbd5e1',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',minWidth:0,width:'100%'}}><option value="">পরীক্ষার নাম নির্বাচন</option><option value="এসএসসি/সমমান">এসএসসি/সমমান</option><option value="এইচএসসি/সমমান">এইচএসসি/সমমান</option><option value="স্নাতক (পাস)/সমমান">স্নাতক (পাস)/সমমান</option><option value="স্নাতক সম্মান(৩ বছর মেয়াদী)">স্নাতক সম্মান(৩ বছর মেয়াদী)</option><option value="স্নাতক সম্মান(৪ বছর মেয়াদী)">স্নাতক সম্মান(৪ বছর মেয়াদী)</option><option value="স্নাতকোত্তর (অনার্সসহ)">স্নাতকোত্তর (অনার্সসহ)</option><option value="স্নাতকোত্তর (অনার্সবিহীন)">স্নাতকোত্তর (অনার্সবিহীন)</option><option value="কামিল">কামিল</option>{r.exam&&!['এসএসসি/সমমান','এইচএসসি/সমমান','স্নাতক (পাস)/সমমান','স্নাতক সম্মান(৩ বছর মেয়াদী)','স্নাতক সম্মান(৪ বছর মেয়াদী)','স্নাতকোত্তর (অনার্সসহ)','স্নাতকোত্তর (অনার্সবিহীন)','কামিল'].includes(r.exam)&&<option value={r.exam}>{r.exam}</option>}</select><input placeholder="প্রতিষ্ঠান" value={r.institution||''} onChange={e=>updateRow('education',i,'institution',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="বোর্ড/বিশ্ববিদ্যালয়" value={r.board||''} onChange={e=>updateRow('education',i,'board',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="গ্রুপ/বিষয়" value={r.subject||''} onChange={e=>updateRow('education',i,'subject',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="পাশের সন" value={r.year||''} onChange={e=>updateRow('education',i,'year',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="ফলাফল/GPA" value={r.result||''} onChange={e=>updateRow('education',i,'result',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><div style={{display:'inline-flex',alignItems:'center',gap:'4px',whiteSpace:'nowrap',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setEduSaved(i,true)} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setEduSaved(i,false)} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('education',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></div>)}{!(form.extended_profile?.education||[]).length&&<p className="portal-muted full">+ নতুন শিক্ষাগত যোগ্যতা চাপলে SSC/HSC/স্নাতক/স্নাতকোত্তরসহ যত খুশি শিক্ষাগত যোগ্যতার রেকর্ড যোগ করা যাবে।</p>}</>}
     {step===3&&<><div className="form-section-title full"><b>পেশাগত যোগ্যতার বিবরণ</b><button type="button" className="mini" onClick={()=>addRow('professional_qualifications')}>+ নতুন পেশাগত যোগ্যতা</button></div>{(form.extended_profile?.professional_qualifications||[]).map((r,i)=><div className="repeat-card full" key={i} style={{background:r.is_saved?'#f0fdf4':'#fbfdff',border:r.is_saved?'1px solid #bbf7d0':'1px solid #dfe8f2'}}><select value={r.exam||''} onChange={e=>updateRow('professional_qualifications',i,'exam',e.target.value)} disabled={!!r.is_saved} style={{padding:'8px 10px',borderRadius:'8px',border:'1px solid #cbd5e1',background:r.is_saved?'#f8fafc':'#fff',fontSize:'13px',minWidth:0,width:'100%'}}><option value="">পরীক্ষার নাম নির্বাচন</option><option value="এসএসসি/সমমান">এসএসসি/সমমান</option><option value="এইচএসসি/সমমান">এইচএসসি/সমমান</option><option value="স্নাতক (পাস)/সমমান">স্নাতক (পাস)/সমমান</option><option value="স্নাতক সম্মান(৩ বছর মেয়াদী)">স্নাতক সম্মান(৩ বছর মেয়াদী)</option><option value="স্নাতক সম্মান(৪ বছর মেয়াদী)">স্নাতক সম্মান(৪ বছর মেয়াদী)</option><option value="স্নাতকোত্তর (অনার্সসহ)">স্নাতকোত্তর (অনার্সসহ)</option><option value="স্নাতকোত্তর (অনার্সবিহীন)">স্নাতকোত্তর (অনার্সবিহীন)</option><option value="কামিল">কামিল</option>{r.exam&&!['এসএসসি/সমমান','এইচএসসি/সমমান','স্নাতক (পাস)/সমমান','স্নাতক সম্মান(৩ বছর মেয়াদী)','স্নাতক সম্মান(৪ বছর মেয়াদী)','স্নাতকোত্তর (অনার্সসহ)','স্নাতকোত্তর (অনার্সবিহীন)','কামিল'].includes(r.exam)&&<option value={r.exam}>{r.exam}</option>}</select><input placeholder="প্রতিষ্ঠান" value={r.institution||''} onChange={e=>updateRow('professional_qualifications',i,'institution',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="বোর্ড/বিশ্ববিদ্যালয়" value={r.board||''} onChange={e=>updateRow('professional_qualifications',i,'board',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="গ্রুপ/বিষয়" value={r.subject||''} onChange={e=>updateRow('professional_qualifications',i,'subject',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="পাশের সন" value={r.year||''} onChange={e=>updateRow('professional_qualifications',i,'year',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><input placeholder="ফলাফল/GPA" value={r.result||''} onChange={e=>updateRow('professional_qualifications',i,'result',e.target.value)} disabled={!!r.is_saved} style={{background:r.is_saved?'#f8fafc':'#fff'}}/><div style={{display:'inline-flex',alignItems:'center',gap:'4px',whiteSpace:'nowrap',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setProfEduSaved(i,true)} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setProfEduSaved(i,false)} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 9px',borderRadius:'6px',cursor:'pointer',fontSize:'11.5px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('professional_qualifications',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></div>)}{!(form.extended_profile?.professional_qualifications||[]).length&&<p className="portal-muted full">+ নতুন পেশাগত যোগ্যতা চাপলে B.Ed/M.Ed/ডিপ্লোমাসহ যত খুশি পেশাগত যোগ্যতার রেকর্ড যোগ করা যাবে।</p>}</>}
     {step===4&&<><div className="form-section-title full" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><b>শিক্ষকবৃন্দের প্রশিক্ষণ</b><span style={{marginLeft:'10px',fontSize:'12px',color:'#64748b'}}>({(form.extended_profile?.training||[]).length}টি রেকর্ড)</span></div><button type="button" className="mini" style={{background:'#0284c7',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600}} onClick={()=>addRow('training')}>+ নতুন প্রশিক্ষণ যোগ করুন</button></div><div className="full" style={{overflowX:'auto',border:'1px solid #cbd5e1',borderRadius:'10px',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',margin:'6px 0 10px'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'1220px'}}><thead><tr style={{background:'#f1f5f9',borderBottom:'2px solid #cbd5e1',color:'#1e293b'}}><th style={{padding:'10px 8px',width:'60px',textAlign:'center',whiteSpace:'nowrap'}}>ক্রমিক নং</th><th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>শিরোনাম *</th><th style={{padding:'10px 8px',minWidth:'130px',textAlign:'left',whiteSpace:'nowrap'}}>বিষয়</th><th style={{padding:'10px 8px',minWidth:'170px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ গ্রহণের স্থান/প্রতিষ্ঠান</th><th style={{padding:'10px 8px',minWidth:'110px',textAlign:'left',whiteSpace:'nowrap'}}>অবস্থান</th><th style={{padding:'10px 8px',width:'140px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ শুরু তারিখ</th><th style={{padding:'10px 8px',width:'140px',textAlign:'left',whiteSpace:'nowrap'}}>প্রশিক্ষণ শেষের তারিখ</th><th style={{padding:'10px 8px',width:'120px',textAlign:'left',whiteSpace:'nowrap'}}>স্থিতিকাল (অটো)</th><th style={{padding:'10px 8px',width:'210px',minWidth:'200px',textAlign:'center',whiteSpace:'nowrap'}}>কাজ (সংরক্ষণ • সম্পাদনা • মুছুন)</th></tr></thead><tbody>{(form.extended_profile?.training||[]).map((r,i)=><tr key={i} style={{borderBottom:'1px solid #e2e8f0',background:r.is_saved?'#f0fdf4':(i%2===0?'#ffffff':'#f8fafc')}}><td style={{padding:'8px 6px',textAlign:'center'}}><input style={{width:'100%',padding:'6px 2px',textAlign:'center',fontWeight:700,border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#dcfce7':'#f1f5f9'}} value={r.sl_no??(i+1)} onChange={e=>updateTrainingField(i,'sl_no',e.target.value)} disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="প্রশিক্ষণের শিরোনাম" value={r.title||r.name||''} onChange={e=>{updateTrainingField(i,'title',e.target.value);updateTrainingField(i,'name',e.target.value);}} required disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="বিষয়" value={r.subject||''} onChange={e=>updateTrainingField(i,'subject',e.target.value)} disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="স্থান/প্রতিষ্ঠান" value={r.institution||r.place||''} onChange={e=>updateTrainingField(i,'institution',e.target.value)} disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} placeholder="অবস্থান" value={r.location||''} onChange={e=>updateTrainingField(i,'location',e.target.value)} disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input type="date" style={{width:'100%',padding:'5px 4px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} value={r.start_date||''} onChange={e=>updateTrainingField(i,'start_date',e.target.value)} disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input type="date" style={{width:'100%',padding:'5px 4px',border:'1px solid #cbd5e1',borderRadius:'4px',background:r.is_saved?'#f8fafc':'#fff'}} value={r.end_date||''} onChange={e=>updateTrainingField(i,'end_date',e.target.value)} disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px'}}><input style={{width:'100%',padding:'6px 8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:'#f1f5f9',fontWeight:600,color:'#166534'}} placeholder="অটো স্থিতিকাল" value={r.duration||''} onChange={e=>updateTrainingField(i,'duration',e.target.value)} title="শুরু ও শেষের তারিখ দিলে স্বয়ংক্রিয়ভাবে হিসাব হবে" disabled={!!r.is_saved}/></td><td style={{padding:'8px 6px',textAlign:'center',whiteSpace:'nowrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'4px',justifyContent:'center'}}>{!r.is_saved?<button type="button" className="mini" style={{background:'#16a34a',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setTrainingSaved(i,true)} title="সংরক্ষণ করুন">💾 সংরক্ষণ</button>:<button type="button" className="mini" style={{background:'#2563eb',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>setTrainingSaved(i,false)} title="সম্পাদনা করুন">✏️ সম্পাদনা</button>}<button type="button" className="mini" style={{background:'#ef4444',color:'#fff',border:'none',padding:'5px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'2px'}} onClick={()=>removeRow('training',i)} title="মুছে ফেলুন">🗑️ মুছুন</button></div></td></tr>)}{!(form.extended_profile?.training||[]).length&&<tr><td colSpan="9" style={{padding:'20px',textAlign:'center',color:'#64748b'}}>কোনো প্রশিক্ষণ রেকর্ড যুক্ত করা হয়নি। <button type="button" className="mini" style={{marginLeft:'8px',background:'#0284c7',color:'#fff',border:'none',padding:'5px 12px',borderRadius:'4px'}} onClick={()=>addRow('training')}>+ প্রথম প্রশিক্ষণ যোগ করুন</button></td></tr>}</tbody></table></div>{(form.extended_profile?.training||[]).length>0&&<div className="full" style={{display:'flex',justifyContent:'flex-end',marginBottom:'10px'}}><button type="button" className="mini" style={{background:'#0284c7',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600}} onClick={()=>addRow('training')}>+ আরও প্রশিক্ষণ যোগ করুন</button></div>}<div className="form-section-title full"><b>শিক্ষক বাতায়ন/অন্যান্য পেশাগত পরিচিতি</b></div>{isTeacher&&<div className="field"><label>শিক্ষক বাতায়ন ID</label><input value={form.teacher_portal_id||''} onChange={e=>change('teacher_portal_id',e.target.value)}/></div>}<div className="field"><label>অতিরিক্ত পেশাগত তথ্য</label><input value={form.extended_profile?.professional_note||''} onChange={e=>ext('professional_note',e.target.value)}/></div></>}
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
    </div>
    <div className="table-wrap">
     <table>
      <thead>
       <tr>
        <th>Employee ID</th>
        <th>নাম</th>
        <th>পদবি</th>
        {isTeacher&&<th>বিষয়</th>}
        <th>মোবাইল</th>
        <th>অবস্থা</th>
        <th>কাজ</th>
       </tr>
      </thead>
      <tbody>
       {(list||[]).map(x=><tr key={x.id}>
        <td><strong style={{color:'#1e293b',fontWeight:700}}>{x.employee_id}</strong></td>
        <td>
         <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src={getTeacherPhoto(x)} alt="" style={{width:30,height:30,borderRadius:'50%',objectFit:'cover',border:'1px solid #cbd5e1',flexShrink:0}}/>
          <span>{x.name_bn}</span>
         </div>
        </td>
        <td>{x.designation}</td>
        {isTeacher&&<td>{x.subject||'—'}</td>}
        <td>{x.phone||'—'}</td>
        <td>{statusBn(x.status)}</td>
        <td>
         <button className="mini" onClick={()=>begin(x)}>সম্পাদনা</button>
         <label className="mini" style={{marginLeft:4,cursor:'pointer',background:'#0b8050',color:'#fff',border:'none',display:'inline-block'}}>📷 ছবি<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e)=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2*1024*1024){setMsg('ছবির আকার সর্বোচ্চ 2MB হতে হবে');return;}const r=new FileReader();r.onload=async()=>{try{const base=isTeacher?'teachers':'staff';await api(`/${base}/${x.id}`,{method:'PUT',body:JSON.stringify({...x,photo_url:r.result})});
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
load();}catch(err){setMsg(err.message||'ছবি সংরক্ষণে ত্রুটি');}};r.readAsDataURL(f);}}/></label>
         <button className="mini" style={{marginLeft:4,color:'#dc2626'}} onClick={()=>remove(x.id)}>মুছুন</button>
        </td>
       </tr>)}
       {!(list||[]).length&&<tr><td colSpan={isTeacher?7:6}>কোনো তথ্য পাওয়া যায়নি।</td></tr>}
      </tbody>
     </table>
    </div>
   </div>
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
  ['super_admin','সুপার অ্যাডমিন (Full ERP)'],
  ['admin','অ্যাডমিন'],
  ['head_teacher','প্রধান শিক্ষক'],
  ['assistant_head_teacher','সহকারী প্রধান শিক্ষক'],
  ['teacher','সহকারী শিক্ষক'],
  ['accountant','হিসাবরক্ষক'],
  ['librarian','গ্রন্থাগারিক'],
  ['staff','অফিস সহকারী'],
  ['student','শিক্ষার্থী'],
  ['guardian','অভিভাবক']
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
     <span>{visibleUsers.length} / {users.length} জন</span>
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
      <option value="admin">👑 সকল অ্যাডমিন (Super Admin + Admin)</option>
      <option value="super_admin">সুপার অ্যাডমিন</option>
      <option value="head_teacher">প্রধান শিক্ষক</option>
      <option value="assistant_head_teacher">সহকারী প্রধান শিক্ষক</option>
      <option value="teacher">সহকারী শিক্ষক</option>
      <option value="accountant">হিসাবরক্ষক</option>
      <option value="librarian">গ্রন্থাগারিক</option>
      <option value="staff">অফিস সহকারী</option>
      <option value="student">শিক্ষার্থী</option>
      <option value="guardian">অভিভাবক</option>
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

function FinancePanel(){
 const[summary,setSummary]=useState({}),[fees,setFees]=useState([]),[expenses,setExpenses]=useState([]),[students,setStudents]=useState([]),[msg,setMsg]=useState('');
 const[fee,setFee]=useState({student_id:'',fee_type:'মাসিক বেতন',amount:'',due_date:''}),[exp,setExp]=useState({title:'',category:'',amount:'',expense_date:''});
 async function load(){try{setSummary(await api('/finance/summary'));setFees(await api('/finance/fees'));setExpenses(await api('/finance/expenses'));setStudents(await api('/students?status=active'))}catch(e){setMsg(e.message)}} useEffect(()=>{load()},[]);
 async function addFee(e){e.preventDefault();try{await api('/finance/fees',{method:'POST',body:JSON.stringify(fee)});setMsg('ফি তৈরি হয়েছে');setFee({student_id:'',fee_type:'মাসিক বেতন',amount:'',due_date:''});load()}catch(e){setMsg(e.message)}}
 async function pay(f){const amount=prompt('পরিশোধের পরিমাণ',String(Number(f.amount)-Number(f.paid_amount||0)));if(!amount)return;try{await api('/finance/payments',{method:'POST',body:JSON.stringify({fee_id:f.id,amount,payment_method:'cash'})});setMsg('পেমেন্ট সংরক্ষণ হয়েছে');load()}catch(e){setMsg(e.message)}}
 async function addExp(e){e.preventDefault();try{await api('/finance/expenses',{method:'POST',body:JSON.stringify(exp)});setMsg('খরচ সংরক্ষণ হয়েছে');setExp({title:'',category:'',amount:'',expense_date:''});load()}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="stats"><div><b>{summary.billed||0}</b><span>মোট বিল</span></div><div><b>{summary.paid||0}</b><span>আদায়</span></div><div><b>{summary.due||0}</b><span>বকেয়া</span></div><div><b>{summary.expense||0}</b><span>খরচ</span></div></div><div className="form-card"><h2>নতুন ফি</h2><form onSubmit={addFee} className="form-grid"><select value={fee.student_id} onChange={e=>setFee({...fee,student_id:e.target.value})}><option value="">শিক্ষার্থী নির্বাচন</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no||'—'} • {s.name_bn}</option>)}</select><input placeholder="ফি-এর ধরন" value={fee.fee_type} onChange={e=>setFee({...fee,fee_type:e.target.value})} required/><input type="number" step="0.01" placeholder="পরিমাণ" value={fee.amount} onChange={e=>setFee({...fee,amount:e.target.value})} required/><input type="date" value={fee.due_date} onChange={e=>setFee({...fee,due_date:e.target.value})}/><button className="btn">ফি তৈরি</button></form></div><div className="table-card"><div className="toolbar"><h2>ফি ও পেমেন্ট</h2><span>{fees.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>শিক্ষার্থী</th><th>ধরন</th><th>বিল</th><th>আদায়</th><th>অবস্থা</th><th>কাজ</th></tr></thead><tbody>{fees.map(f=><tr key={f.id}><td>{f.name_bn||'সাধারণ ফি'}</td><td>{f.fee_type}</td><td>{f.amount}</td><td>{f.paid_amount||0}</td><td>{f.status}</td><td>{f.status!=='paid'&&<button className="mini" onClick={()=>pay(f)}>পেমেন্ট</button>}</td></tr>)}</tbody></table></div></div><div className="form-card"><h2>নতুন খরচ</h2><form onSubmit={addExp} className="form-grid"><input placeholder="খরচের বিবরণ" value={exp.title} onChange={e=>setExp({...exp,title:e.target.value})} required/><input placeholder="ক্যাটাগরি" value={exp.category} onChange={e=>setExp({...exp,category:e.target.value})}/><input type="number" step="0.01" placeholder="পরিমাণ" value={exp.amount} onChange={e=>setExp({...exp,amount:e.target.value})} required/><input type="date" value={exp.expense_date} onChange={e=>setExp({...exp,expense_date:e.target.value})}/><button className="btn">খরচ সংরক্ষণ</button></form>{msg&&<p className="msg">{msg}</p>}</div></div>}
function LibraryPanel(){const[books,setBooks]=useState([]),[loans,setLoans]=useState([]),[students,setStudents]=useState([]),[form,setForm]=useState({title:'',author:'',isbn:'',category:'',quantity:1}),[loan,setLoan]=useState({book_id:'',student_id:'',due_at:''}),[msg,setMsg]=useState('');async function load(){try{setBooks(await api('/library/books'));setLoans(await api('/library/loans'));setStudents(await api('/students?status=active'))}catch(e){setMsg(e.message)}}useEffect(()=>{load()},[]);async function add(e){e.preventDefault();try{await api('/library/books',{method:'POST',body:JSON.stringify(form)});setMsg('বই যুক্ত হয়েছে');setForm({title:'',author:'',isbn:'',category:'',quantity:1});load()}catch(e){setMsg(e.message)}}async function issue(e){e.preventDefault();try{await api('/library/loans',{method:'POST',body:JSON.stringify(loan)});setMsg('বই ইস্যু হয়েছে');load()}catch(e){setMsg(e.message)}}async function ret(l){try{await api('/library/loans/'+l.id+'/return',{method:'POST',body:JSON.stringify({fine:0})});setMsg('বই ফেরত নেওয়া হয়েছে');load()}catch(e){setMsg(e.message)}}return <div className="module-grid"><div className="form-card"><h2>নতুন বই</h2><form onSubmit={add} className="form-grid"><input placeholder="বইয়ের নাম" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/><input placeholder="লেখক" value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/><input placeholder="ISBN" value={form.isbn} onChange={e=>setForm({...form,isbn:e.target.value})}/><input placeholder="বিষয়/ক্যাটাগরি" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/><button className="btn">বই সংরক্ষণ</button></form></div><div className="table-card"><div className="toolbar"><h2>বইয়ের তালিকা</h2><span>{books.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>বই</th><th>লেখক</th><th>মোট</th><th>উপলভ্য</th></tr></thead><tbody>{books.map(b=><tr key={b.id}><td>{b.title}</td><td>{b.author||'—'}</td><td>{b.quantity}</td><td>{b.available_quantity}</td></tr>)}</tbody></table></div></div><div className="form-card"><h2>বই ইস্যু</h2><form onSubmit={issue} className="form-grid"><select value={loan.book_id} onChange={e=>setLoan({...loan,book_id:e.target.value})} required><option value="">বই নির্বাচন</option>{books.filter(b=>b.available_quantity>0).map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select><select value={loan.student_id} onChange={e=>setLoan({...loan,student_id:e.target.value})} required><option value="">শিক্ষার্থী নির্বাচন</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no||'—'} • {s.name_bn}</option>)}</select><input type="date" value={loan.due_at} onChange={e=>setLoan({...loan,due_at:e.target.value})}/><button className="btn">ইস্যু করুন</button></form></div><div className="table-card"><div className="toolbar"><h2>ইস্যু/ফেরত তালিকা</h2></div><div className="table-wrap"><table><thead><tr><th>বই</th><th>শিক্ষার্থী</th><th>ইস্যু</th><th>শেষ তারিখ</th><th>ফেরত</th></tr></thead><tbody>{loans.map(l=><tr key={l.id}><td>{l.title}</td><td>{l.name_bn||'—'}</td><td>{l.issued_at}</td><td>{l.due_at||'—'}</td><td>{l.returned_at||<button className="mini" onClick={()=>ret(l)}>ফেরত নিন</button>}</td></tr>)}</tbody></table></div></div>{msg&&<p className="msg">{msg}</p>}</div>}
function LearningPanel(){
 const[items,setItems]=useState([]),[form,setForm]=useState({class_name:'6',title_bn:'',title_en:'',content_type:'note',content_url:'',body:'',published:true}),[msg,setMsg]=useState('');
 async function load(){try{setItems(await api('/learning?published='));}catch(e){setMsg(e.message)}}useEffect(()=>{load()},[]);
 async function add(e){e.preventDefault();try{await api('/learning',{method:'POST',body:JSON.stringify(form)});setMsg('ডিজিটাল কনটেন্ট প্রকাশ/সংরক্ষণ হয়েছে');setForm({class_name:'6',title_bn:'',title_en:'',content_type:'note',content_url:'',body:'',published:true});load()}catch(e){setMsg(e.message)}}
 return <div className="module-grid"><div className="form-card"><h2>ডিজিটাল লার্নিং কনটেন্ট</h2><form onSubmit={add} className="form-grid"><select value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})}>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select><input placeholder="বাংলা শিরোনাম" value={form.title_bn} onChange={e=>setForm({...form,title_bn:e.target.value})} required/><input placeholder="English title" value={form.title_en} onChange={e=>setForm({...form,title_en:e.target.value})}/><select value={form.content_type} onChange={e=>setForm({...form,content_type:e.target.value})}><option value="note">নোট</option><option value="pdf">PDF</option><option value="video">ভিডিও</option><option value="lecture">লেকচার</option><option value="link">লিংক</option></select><input placeholder="Content URL (যদি থাকে)" value={form.content_url} onChange={e=>setForm({...form,content_url:e.target.value})}/><textarea placeholder="বিষয়বস্তু/নোট" rows="7" value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/><label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> প্রকাশিত</label><button className="btn">সংরক্ষণ করুন</button></form>{msg&&<p className="msg">{msg}</p>}</div><div className="table-card"><div className="toolbar"><h2>কনটেন্ট তালিকা</h2><span>{items.length} টি</span></div><div className="table-wrap"><table><thead><tr><th>শ্রেণি</th><th>শিরোনাম</th><th>ধরন</th><th>অবস্থা</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.class_name}</td><td>{x.title_bn}</td><td>{x.content_type}</td><td>{x.published?'প্রকাশিত':'খসড়া'}</td></tr>)}</tbody></table></div></div></div>}
function Portal(){const[data,setData]=useState(null),[msg,setMsg]=useState('');const nav=useNavigate();useEffect(()=>{api('/portal/me').then(setData).catch(e=>{setMsg(e.message);localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');nav('/')})},[nav]);if(!data)return <div className="portal-loading">{msg||'Portal লোড হচ্ছে...'}</div>;const role=data.user?.role_name;return <div className="portal"><header><div className="brand"><img src={logo}/><div><h1>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h1><p>{data.user.full_name} • {data.user.role_label}</p></div></div><button className="btn" onClick={async()=>{try{await api('/auth/logout',{method:'POST'})}catch{} localStorage.removeItem('magra_token');localStorage.removeItem('magra_user');nav('/')}}>লগআউট</button></header><main className="portal-main"><section className="portal-hero"><span className="tag">DIGITAL SCHOOL PORTAL</span><h2>স্বাগতম, {data.user.full_name}</h2><p>আপনার জন্য প্রয়োজনীয় তথ্য এক জায়গায়।</p></section>{role==='student'&&<StudentPortal data={data}/>} {role==='guardian'&&<GuardianPortal data={data}/>} {(role==='teacher'||role==='head_teacher'||role==='assistant_head_teacher')&&<TeacherPortal data={data}/>}</main></div>}
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
 const classesForTeacher=[...new Map((data.today_routine||[]).map(r=>[`${r.class_name}|${r.section||''}`,{class_name:r.class_name,section:r.section||''}])).values()];
 const[date,setDate]=useState(new Date().toISOString().slice(0,10)),[selected,setSelected]=useState(''),[roster,setRoster]=useState([]),[msg,setMsg]=useState('');
 const[exams,setExams]=useState([]),[subjects,setSubjects]=useState([]),[examId,setExamId]=useState(''),[subjectId,setSubjectId]=useState(''),[marks,setMarks]=useState([]),[marksMeta,setMarksMeta]=useState(null),[marksMsg,setMarksMsg]=useState('');
 const[submissionRows,setSubmissionRows]=useState([]),[submissionMsg,setSubmissionMsg]=useState(''); const[gradeDraft,setGradeDraft]=useState({});
 useEffect(()=>{if(classesForTeacher.length&&!selected)setSelected(`${classesForTeacher[0].class_name}|${classesForTeacher[0].section}`)},[classesForTeacher.length]);
 const chosen=classesForTeacher.find(x=>`${x.class_name}|${x.section}`===selected)||classesForTeacher[0];
 async function loadRoster(){if(!chosen)return setMsg('রুটিনে কোনো শ্রেণি পাওয়া যায়নি');try{setMsg('');const d=await api(`/portal/teacher/roster?date=${date}&class_name=${encodeURIComponent(chosen.class_name)}&section=${encodeURIComponent(chosen.section||'')}`);setRoster(d)}catch(e){setMsg(e.message)}}
 useEffect(()=>{if(chosen)loadRoster()},[date,selected]);
 useEffect(()=>{api('/exams').then(setExams).catch(()=>{});},[]);
 useEffect(()=>{if(chosen)api(`/subjects?class_name=${encodeURIComponent(chosen.class_name)}`).then(setSubjects).catch(()=>{})},[selected]);
 useEffect(()=>{if(!examId||!subjectId||!chosen)return;loadMarks()},[examId,subjectId,selected]);
 async function loadMarks(){try{setMarksMsg('');const d=await api(`/portal/teacher/marks-roster?exam_id=${examId}&class_name=${encodeURIComponent(chosen.class_name)}&section=${encodeURIComponent(chosen.section||'')}&subject_id=${subjectId}`);setMarksMeta(d.meta);setMarks(d.students)}catch(e){setMarks([]);setMarksMeta(null);setMarksMsg(e.message)}}
 function setStatus(i,status){setRoster(a=>a.map((x,n)=>n===i?{...x,status}:x))}
 async function saveAttendance(){try{const d=await api('/attendance/bulk',{method:'POST',body:JSON.stringify({date,records:roster.map(x=>({student_id:x.id,status:x.status,remarks:x.remarks}))})});setMsg(`${d.count} জনের উপস্থিতি সংরক্ষণ হয়েছে`)}catch(e){setMsg(e.message)}}
 function updateMark(i,k,v){setMarks(a=>a.map((x,n)=>n===i?{...x,[k]:v}:x))}
 async function loadSubmissions(id){if(!id){setSubmissionRows([]);return}try{setSubmissionMsg('');setSubmissionRows(await api(`/portal/teacher/assignment-submissions?assignment_id=${id}`))}catch(e){setSubmissionMsg(e.message);setSubmissionRows([])}}
 async function gradeSubmission(id){const d=gradeDraft[id]||{};try{await api(`/portal/teacher/assignment-submissions/${id}`,{method:'PATCH',body:JSON.stringify({marks:d.marks,teacher_feedback:d.teacher_feedback})});setSubmissionMsg('মূল্যায়ন সংরক্ষণ হয়েছে');loadSubmissions(d.assignment_id)}catch(e){setSubmissionMsg(e.message)}}
 async function saveMarks(){try{if(!marks.length)return;const d=await api('/portal/teacher/marks-save',{method:'POST',body:JSON.stringify({exam_id:examId,class_name:chosen.class_name,section:chosen.section||'',records:marks.map(x=>({student_id:x.id,subject_id:subjectId,written:x.written,mcq:x.mcq,practical:x.practical,absent:x.absent,remarks:x.remarks}))})});setMarksMsg(`${d.count} জনের নম্বর সংরক্ষণ হয়েছে`);loadMarks()}catch(e){setMarksMsg(e.message)}}
 return <div className="portal-shell"><div className="portal-cards"><article className="portal-card"><h3>👨‍🏫 প্রোফাইল</h3><p><b>{data.teacher?.name_bn||data.user.full_name}</b></p><p>পদ: {data.teacher?.designation||'—'}<br/>বিষয়: {data.teacher?.subject||'—'}</p></article><article className="portal-card"><h3>📚 অ্যাসাইনমেন্ট</h3><div className="portal-kpi">{data.assignments?.length||0}</div><p>আপনার তৈরি</p></article><article className="portal-card"><h3>👥 দায়িত্বপ্রাপ্ত শ্রেণি</h3><div className="portal-kpi">{classesForTeacher.length}</div><p>রুটিন অনুযায়ী</p></article></div>
 <section className="portal-section"><div className="toolbar"><div><span className="eyebrow">TEACHER TOOLS</span><h2>দ্রুত উপস্থিতি</h2></div><button className="btn" onClick={saveAttendance} disabled={!roster.length}>উপস্থিতি সংরক্ষণ</button></div><div className="filters"><input type="date" value={date} onChange={e=>setDate(e.target.value)}/><select value={selected} onChange={e=>setSelected(e.target.value)}>{classesForTeacher.map(x=><option key={`${x.class_name}|${x.section}`} value={`${x.class_name}|${x.section}`}>শ্রেণি {x.class_name}{x.section?' • '+x.section:''}</option>)}</select></div>{msg&&<p className="msg">{msg}</p>}<div className="portal-scroll"><table className="portal-table"><thead><tr><th>রোল</th><th>শিক্ষার্থী</th><th>উপস্থিতি</th></tr></thead><tbody>{roster.map((r,i)=><tr key={r.id}><td>{r.roll_no||'—'}</td><td>{r.name_bn}</td><td><div className="attendance-actions"><button className={r.status==='present'?'active':''} onClick={()=>setStatus(i,'present')}>উপস্থিত</button><button className={r.status==='absent'?'active':''} onClick={()=>setStatus(i,'absent')}>অনুপস্থিত</button><button className={r.status==='late'?'active':''} onClick={()=>setStatus(i,'late')}>দেরি</button></div></td></tr>)}{!roster.length&&<tr><td colSpan="3">এই তারিখে কোনো শিক্ষার্থী পাওয়া যায়নি।</td></tr>}</tbody></table></div></section>
 <section className="portal-section"><div className="toolbar"><div><span className="eyebrow">RESULT MANAGEMENT</span><h2>নম্বর এন্ট্রি</h2></div><button className="btn" onClick={saveMarks} disabled={!marks.length}>নম্বর সংরক্ষণ</button></div><div className="filters"><select value={examId} onChange={e=>setExamId(e.target.value)}><option value="">পরীক্ষা নির্বাচন</option>{exams.map(e=><option key={e.id} value={e.id}>{e.name_bn}</option>)}</select><select value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">বিষয় নির্বাচন</option>{subjects.map(x=><option key={x.id} value={x.id}>{x.code} — {x.name_bn}</option>)}</select></div>{marksMeta&&<p className="msg">{marksMeta.name_bn} • পূর্ণমান {marksMeta.full_marks} • লিখিত {marksMeta.written_max||0} • MCQ {marksMeta.mcq_max||0} • ব্যবহারিক {marksMeta.practical_max||0}</p>}{marksMsg&&<p className="msg">{marksMsg}</p>}<div className="portal-scroll"><table className="portal-table"><thead><tr><th>রোল</th><th>শিক্ষার্থী</th><th>লিখিত</th><th>MCQ</th><th>ব্যবহারিক</th><th>অনুপস্থিত</th></tr></thead><tbody>{marks.map((r,i)=><tr key={r.id}><td>{r.roll_no||'—'}</td><td>{r.name_bn}</td><td><input className="mark-input" type="number" min="0" max={marksMeta?.written_max||undefined} value={r.written??''} onChange={e=>updateMark(i,'written',e.target.value)}/></td><td><input className="mark-input" type="number" min="0" max={marksMeta?.mcq_max||undefined} value={r.mcq??''} onChange={e=>updateMark(i,'mcq',e.target.value)}/></td><td><input className="mark-input" type="number" min="0" max={marksMeta?.practical_max||undefined} value={r.practical??''} onChange={e=>updateMark(i,'practical',e.target.value)}/></td><td><input type="checkbox" checked={!!r.absent} onChange={e=>updateMark(i,'absent',e.target.checked)}/></td></tr>)}{!marks.length&&<tr><td colSpan="6">পরীক্ষা ও বিষয় নির্বাচন করলে শিক্ষার্থীদের নম্বর এন্ট্রি তালিকা আসবে।</td></tr>}</tbody></table></div></section>
 <section className="portal-section"><h2>রুটিন</h2><div className="portal-scroll"><table className="portal-table"><thead><tr><th>দিন</th><th>সময়</th><th>বিষয়</th><th>শ্রেণি</th><th>কক্ষ</th></tr></thead><tbody>{(data.today_routine||[]).map(r=><tr key={r.id}><td>{r.day_of_week}</td><td>{String(r.start_time).slice(0,5)}–{String(r.end_time).slice(0,5)}</td><td>{r.subject_name||'—'}</td><td>{r.class_name}</td><td>{r.room||'—'}</td></tr>)}</tbody></table></div></section><section className="portal-section"><div className="toolbar"><div><span className="eyebrow">HOMEWORK REVIEW</span><h2>অ্যাসাইনমেন্ট ও জমা মূল্যায়ন</h2></div></div><div className="form-grid"><select onChange={e=>{const id=e.target.value;setGradeDraft({});loadSubmissions(id)}}><option value="">অ্যাসাইনমেন্ট নির্বাচন</option>{(data.assignments||[]).map(a=><option key={a.id} value={a.id}>{a.title_bn} • {a.submission_count||0} জমা</option>)}</select></div>{submissionMsg&&<p className="msg">{submissionMsg}</p>}<div className="portal-scroll"><table className="portal-table"><thead><tr><th>রোল</th><th>শিক্ষার্থী</th><th>উত্তর</th><th>নম্বর</th><th>মন্তব্য</th><th>কাজ</th></tr></thead><tbody>{submissionRows.map(r=>{const d=gradeDraft[r.id]||{marks:r.marks??'',teacher_feedback:r.teacher_feedback||'',assignment_id:r.assignment_id};return <tr key={r.id}><td>{r.roll_no||'—'}</td><td>{r.name_bn}</td><td>{r.answer_text||'—'}{r.attachment_url&&<><br/><a href={r.attachment_url} target="_blank" rel="noreferrer">Attachment</a></>}</td><td><input className="mark-input" type="number" min="0" max={r.max_marks} value={d.marks} onChange={e=>setGradeDraft({...gradeDraft,[r.id]:{...d,marks:e.target.value}})}/><small>/{r.max_marks}</small></td><td><input value={d.teacher_feedback} onChange={e=>setGradeDraft({...gradeDraft,[r.id]:{...d,teacher_feedback:e.target.value}})}/></td><td><button className="mini" onClick={()=>gradeSubmission(r.id)}>মূল্যায়ন</button></td></tr>})}{!submissionRows.length&&<tr><td colSpan="6">অ্যাসাইনমেন্ট নির্বাচন করলে জমা দেওয়া শিক্ষার্থীদের তালিকা আসবে।</td></tr>}</tbody></table></div></section><Notifications items={data.notifications}/></div>}

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
 const types=[['id_card',docLabel('শিক্ষার্থী পরিচয়পত্র','Student ID Card')],['marksheet',docLabel('মার্কশিট','Marksheet')],['progress_report',docLabel('প্রগ্রেস রিপোর্ট','Progress Report')],['certificate',docLabel('সনদপত্র','Certificate')],['commendation_certificate',docLabel('প্রশংসাপত্র','Commendation Certificate')],['admit_card',docLabel('প্রবেশপত্র','Admit Card')],['tabulation',docLabel('ট্যাবুলেশন শিট','Tabulation Sheet')],['merit_list',docLabel('মেধা তালিকা','Merit List')]];
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
 else if(type==='admit_card')body=`<div class="doc admit"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(L('প্রবেশপত্র','Admit Card'))}</h2><h3>${esc(examName)}</h3><div class="admit-grid"><p><b>${esc(L('নাম','Name'))}:</b> ${esc(studentName)}</p><p><b>Student ID:</b> ${esc(student.student_id)}</p><p><b>${esc(L('রোল','Roll'))}:</b> ${esc(student.roll_no)}</p><p><b>${esc(L('শ্রেণি','Class'))}:</b> ${esc(student.class_name)} • <b>${esc(L('শাখা','Section'))}:</b> ${esc(student.section||'—')}</p><p><b>${esc(L('পরীক্ষার সময়','Exam Period'))}:</b> ${esc(exam.start_date||'—')} ${esc(L('থেকে','to'))} ${esc(exam.end_date||'—')}</p></div><div class="sign"><span>${esc(L('শ্রেণি শিক্ষক','Class Teacher'))}</span><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span></div></div>`;
 else if(type==='marksheet'||type==='progress_report')body=`<div class="doc"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(type==='marksheet'?L('মার্কশিট','Marksheet'):L('প্রগ্রেস রিপোর্ট','Progress Report'))}</h2><p><b>${esc(L('পরীক্ষা','Exam'))}:</b> ${esc(examName)}</p><p><b>${esc(L('নাম','Name'))}:</b> ${esc(studentName)} &nbsp; <b>${esc(L('রোল','Roll'))}:</b> ${esc(student.roll_no)} &nbsp; <b>${esc(L('শ্রেণি','Class'))}:</b> ${esc(student.class_name)}</p><table><thead><tr><th>${esc(L('বিষয়','Subject'))}</th><th>${esc(L('পূর্ণমান','Full Marks'))}</th><th>${esc(L('লিখিত','Written'))}</th><th>MCQ</th><th>${esc(L('ব্যবহারিক','Practical'))}</th><th>${esc(L('মোট','Total'))}</th><th>${esc(L('গ্রেড','Grade'))}</th><th>GPA</th></tr></thead><tbody>${(doc.marks||[]).map(m=>`<tr><td>${esc(lang==='en'?(m.subject_name_en||m.subject_name):m.subject_name)}</td><td>${esc(m.full_marks||100)}</td><td>${esc(m.written??0)}</td><td>${esc(m.mcq??0)}</td><td>${esc(m.practical??0)}</td><td>${esc(m.total??0)}</td><td>${esc(m.grade||'')}</td><td>${esc(m.gpa??'')}</td></tr>`).join('')}</tbody></table><div class="sign"><span>${esc(L('শ্রেণি শিক্ষক','Class Teacher'))}</span><span>${esc(L('প্রধান শিক্ষক','Head Teacher'))}</span></div></div>`;
 else {const title=type==='tabulation'?L('ট্যাবুলেশন শিট','Tabulation Sheet'):L('মেধা তালিকা','Merit List');body=`<div class="doc"><img src="/school-logo.png"><h1>${esc(schoolName)}</h1><p>${esc(address)} • EIIN ${esc(school.eiin)}</p><h2>${esc(title)}</h2><p>${esc(L('পরীক্ষা','Exam'))}: ${esc(examName)} • ${esc(L('শ্রেণি','Class'))}: ${esc(className)}</p><table><thead><tr><th>${esc(L('মেধা','Merit'))}</th><th>${esc(L('রোল','Roll'))}</th><th>${esc(L('নাম','Name'))}</th><th>${esc(L('বিষয়','Subject'))}</th><th>${esc(L('মোট','Total'))}</th><th>GPA</th><th>${esc(L('ফলাফল','Result'))}</th></tr></thead><tbody>${(doc.list||[]).map(r=>`<tr><td>${esc(r.merit)}</td><td>${esc(r.roll_no||'')}</td><td>${esc(lang==='en'?(r.name_en||r.name_bn):r.name_bn)}</td><td>${esc(r.subjects)}</td><td>${esc(r.total_marks)}</td><td>${esc(r.gpa)}</td><td>${esc(r.result_status)}</td></tr>`).join('')}</tbody></table></div>`}
 w.document.write(`<html><head><title>${esc(types.find(x=>x[0]===type)?.[1]||'Document')}</title><meta charset="utf-8"><style>body{font-family:Arial,'Noto Sans Bengali',sans-serif;margin:0;padding:30px;color:#17352a}.doc,.certificate,.id{max-width:900px;margin:auto;text-align:center;border:2px solid #176b4b;padding:28px;border-radius:14px}img{width:80px}.doc table{width:100%;border-collapse:collapse;margin-top:20px}.doc th,.doc td{border:1px solid #999;padding:8px}.certificate h1{font-size:38px}.certificate h2{font-size:30px}.photo{margin:15px auto;width:100px;height:120px;border:1px solid #aaa;display:grid;place-items:center}.photo img{width:100%;height:100%;object-fit:cover}.sign{display:flex;justify-content:space-between;margin-top:60px;padding:0 50px}.admit-grid{text-align:left;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:25px}@media(max-width:600px){.admit-grid{grid-template-columns:1fr}}@media print{body{padding:0}.doc,.certificate,.id{border:0}}</style></head><body>${body}<script>window.onload=()=>window.print()</script></body></html>`);w.document.close()};
 return <div className="documents-panel"><div className="form-card"><div className="tabs">{types.map(x=><button className={type===x[0]?'active':''} key={x[0]} onClick={()=>{setType(x[0]);setDoc(null);setMsg('')}}>{x[1]}</button>)}</div><h2>{docLabel('অফিশিয়াল ডকুমেন্ট জেনারেটর','Official Document Generator')}</h2><p className="portal-muted">{docLabel('প্রিভিউ, Print/PDF এবং Official Issue একই document workflow-এ পরিচালনা করুন।','Preview, Print/PDF and Official Issue are handled in one document workflow.')}</p><div className="form-grid">{!classBased.includes(type)&&<select value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">{docLabel('শিক্ষার্থী নির্বাচন','Select Student')}</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no||'—'} • {s.name_bn}</option>)}</select>}{classBased.includes(type)&&<select value={className} onChange={e=>setClassName(e.target.value)}><option value="">{docLabel('শ্রেণি নির্বাচন','Select Class')}</option>{classes.map(c=><option key={c} value={c}>শ্রেণি {c}</option>)}</select>}{examBased.includes(type)&&<select value={examId} onChange={e=>setExamId(e.target.value)}><option value="">{docLabel('পরীক্ষা নির্বাচন','Select Exam')}</option>{exams.map(e=><option key={e.id} value={e.id}>{e.name_bn}</option>)}</select>}<button className="btn full" onClick={load}>{docLabel('Preview তৈরি করুন','Create Preview')}</button></div>{msg&&<p className="msg" role="status">{msg}</p>}</div>{doc&&<div className="table-card document-preview"><div className="toolbar"><h2>{types.find(x=>x[0]===type)?.[1]}</h2><div><button className="btn" onClick={print}>🖨️ {docLabel('প্রিন্ট / PDF','Print / PDF')}</button> <button className="btn" onClick={issue}>✓ {docLabel('অফিশিয়ালি ইস্যু','Officially Issue')}</button></div></div><div className="preview-sheet"><img src="/school-logo.png"/><h2>{doc.school?.nameBn}</h2><p>{doc.school?.address} • EIIN {doc.school?.eiin}</p><h3>{types.find(x=>x[0]===type)?.[1]}</h3>{type==='id_card'&&<p><b>{lang==='en'?(doc.student?.name_en||doc.student?.name_bn):doc.student?.name_bn}</b><br/>{docLabel('Student ID','Student ID')}: {doc.student?.student_id} • {docLabel('রোল','Roll')}: {doc.student?.roll_no}<br/>{docLabel('শ্রেণি','Class')}: {doc.student?.class_name} • {docLabel('শাখা','Section')}: {doc.student?.section||'—'}</p>}{(type==='certificate'||type==='commendation_certificate')&&<p>{docLabel('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে','This is to certify that')} <b>{lang==='en'?(doc.student?.name_en||doc.student?.name_bn):doc.student?.name_bn}</b> {docLabel(`এই প্রতিষ্ঠানের ${doc.student?.class_name} শ্রেণির শিক্ষার্থী।`,`is a student of Class ${doc.student?.class_name} at this institution.`)} {type==='commendation_certificate'&&docLabel('তাঁর শৃঙ্খলা, আচরণ, অধ্যবসায় ও কৃতিত্বের স্বীকৃতিস্বরূপ এই প্রশংসাপত্র প্রদান করা হলো।','This commendation is awarded in recognition of the student’s discipline, conduct, diligence and achievement.')}</p>}{type==='admit_card'&&doc.exam&&<p><b>{lang==='en'?(doc.exam.name_en||doc.exam.name_bn):doc.exam.name_bn}</b><br/>{docLabel('পরীক্ষা','Exam')}: {doc.exam.start_date||'—'} → {doc.exam.end_date||'—'}<br/>{docLabel('রোল','Roll')}: {doc.student?.roll_no||'—'}</p>}{(type==='marksheet'||type==='progress_report')&&doc.summary&&<div className="document-summary"><b>{docLabel('মোট','Total')}: {doc.summary.total_marks} / {doc.summary.full_marks}</b><span>{docLabel('শতকরা','Percentage')}: {doc.summary.percentage}%</span><span>GPA: {doc.summary.gpa??'—'}</span><span>{docLabel('ফলাফল','Result')}: {doc.summary.result_status}</span></div>}{(type==='marksheet'||type==='progress_report')&&<div className="table-wrap"><table><thead><tr><th>{docLabel('বিষয়','Subject')}</th><th>{docLabel('পূর্ণমান','Full Marks')}</th><th>{docLabel('মোট','Total')}</th><th>{docLabel('গ্রেড','Grade')}</th><th>GPA</th></tr></thead><tbody>{(doc.marks||[]).map(m=><tr key={m.id}><td>{m.subject_name}</td><td>{m.full_marks||100}</td><td>{m.total}</td><td>{m.grade}</td><td>{m.gpa}</td></tr>)}</tbody></table></div>}{(type==='tabulation'||type==='merit_list')&&<div className="table-wrap"><table><thead><tr><th>{docLabel('মেধা','Merit')}</th><th>{docLabel('রোল','Roll')}</th><th>{docLabel('নাম','Name')}</th><th>{docLabel('মোট','Total')}</th><th>GPA</th><th>{docLabel('ফলাফল','Result')}</th></tr></thead><tbody>{(doc.list||[]).map(r=><tr key={r.id}><td>{r.merit}</td><td>{r.roll_no}</td><td>{r.name_bn}</td><td>{r.total_marks}</td><td>{r.gpa}</td><td>{r.result_status}</td></tr>)}</tbody></table></div>}</div></div>}{<div className="table-card"><div className="toolbar"><h2>{docLabel('ইস্যু করা ডকুমেন্ট','Issued Documents')}</h2><span>{issued.length} {docLabel('টি','items')}</span></div><div className="table-wrap"><table><thead><tr><th>{docLabel('ডকুমেন্ট নং','Document No.')}</th><th>{docLabel('তারিখ','Date')}</th><th>{docLabel('ধরন','Type')}</th><th>{docLabel('শিক্ষার্থী','Student')}</th><th>{docLabel('পরীক্ষা','Exam')}</th></tr></thead><tbody>{issued.map(d=><tr key={d.id}><td>{d.document_no}</td><td>{d.issue_date}</td><td>{types.find(x=>x[0]===d.document_type)?.[1]||d.document_type}</td><td>{d.name_bn||'—'}</td><td>{d.exam_id||'—'}</td></tr>)}</tbody></table></div></div>}</div>}

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

function RoutinePanel(){
 const days=[['1','শনিবার'],['2','রবিবার'],['3','সোমবার'],['4','মঙ্গলবার'],['5','বুধবার'],['6','বৃহস্পতিবার'],['7','শুক্রবার']];
 const [rows,setRows]=useState([]),[subjects,setSubjects]=useState([]),[teachers,setTeachers]=useState([]),[editing,setEditing]=useState(null),[form,setForm]=useState({class_name:'6',section:'',day_of_week:'1',start_time:'10:00',end_time:'10:45',subject_id:'',teacher_id:'',room:''}),[msg,setMsg]=useState('');
 const load=()=>api('/routines').then(setRows).catch(e=>setMsg(e.message));
 useEffect(()=>{load();api('/subjects').then(setSubjects).catch(()=>{});api('/teachers?status=active').then(setTeachers).catch(()=>{})},[]);
 async function save(e){e.preventDefault();try{await api(editing?'/routines/'+editing:'/routines',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setMsg(editing?'রুটিন আপডেট হয়েছে':'রুটিন সংরক্ষণ হয়েছে');setEditing(null);setForm({class_name:'6',section:'',day_of_week:'1',start_time:'10:00',end_time:'10:45',subject_id:'',teacher_id:'',room:''});load()}catch(e){setMsg(e.message)}}
 function edit(r){setEditing(r.id);setForm({class_name:r.class_name||'6',section:r.section||'',day_of_week:String(r.day_of_week||'1'),start_time:String(r.start_time||'10:00').slice(0,5),end_time:String(r.end_time||'10:45').slice(0,5),subject_id:r.subject_id||'',teacher_id:r.teacher_id||'',room:r.room||''});window.scrollTo({top:0,behavior:'smooth'})} async function remove(id){if(!confirm('এই রুটিনটি মুছে ফেলবেন?'))return;try{await api('/routines/'+id,{method:'DELETE'});setMsg('রুটিন মুছে ফেলা হয়েছে');load()}catch(e){setMsg(e.message)}}
 return <div className="form-card"><div className="toolbar"><div><span className="eyebrow">ACADEMIC SCHEDULE</span><h2>{editing?'রুটিন সম্পাদনা':'ক্লাস রুটিন ব্যবস্থাপনা'}</h2></div><div>{editing&&<button className="mini" onClick={()=>{setEditing(null);setForm({class_name:'6',section:'',day_of_week:'1',start_time:'10:00',end_time:'10:45',subject_id:'',teacher_id:'',room:''})}}>বাতিল</button>} <span>{rows.length} টি slot</span></div></div>
 <form onSubmit={save} className="form-grid"><select value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})}>{classes.map(c=><option key={c}>{c}</option>)}</select><input placeholder="শাখা (ঐচ্ছিক)" value={form.section} onChange={e=>setForm({...form,section:e.target.value})}/><select value={form.day_of_week} onChange={e=>setForm({...form,day_of_week:e.target.value})}>{days.map(d=><option key={d[0]} value={d[0]}>{d[1]}</option>)}</select><input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})}/><input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})}/><select value={form.subject_id} onChange={e=>setForm({...form,subject_id:e.target.value})}><option value="">বিষয় নির্বাচন</option>{subjects.filter(x=>!x.class_name||x.class_name===form.class_name).map(x=><option key={x.id} value={x.id}>{x.name_bn}</option>)}</select><select value={form.teacher_id} onChange={e=>setForm({...form,teacher_id:e.target.value})}><option value="">শিক্ষক নির্বাচন</option>{teachers.map(x=><option key={x.id} value={x.id}>{x.name_bn}</option>)}</select><input placeholder="কক্ষ" value={form.room} onChange={e=>setForm({...form,room:e.target.value})}/><button className="btn full">{editing?'রুটিন আপডেট করুন':'রুটিন যোগ করুন'}</button></form>{msg&&<p className="msg">{msg}</p>}
 <div className="table-wrap"><table><thead><tr><th>শ্রেণি</th><th>দিন</th><th>সময়</th><th>বিষয়</th><th>শিক্ষক</th><th>কক্ষ</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.class_name}{r.section?' - '+r.section:''}</td><td>{days.find(d=>Number(d[0])===Number(r.day_of_week))?.[1]||r.day_of_week}</td><td>{String(r.start_time).slice(0,5)}–{String(r.end_time).slice(0,5)}</td><td>{r.subject_name||'—'}</td><td>{r.teacher_name||'—'}</td><td>{r.room||'—'}</td><td><button className="mini" onClick={()=>edit(r)}>সম্পাদনা</button> <button className="mini" onClick={()=>remove(r.id)}>মুছুন</button></td></tr>)}{!rows.length&&<tr><td colSpan="7">এখনো কোনো রুটিন যোগ করা হয়নি।</td></tr>}</tbody></table></div></div>}


function App(){
 const location = useLocation();
 if(location.pathname==="/admin") return <Admin/>;
 if(location.pathname==="/portal") return <Portal/>;
 if(location.pathname==="/login") return <div className="login-page"><Header/><Login/></div>;
 return <Home/>;
}

const rootEl = document.getElementById("root");
if (!window.__magra_root) {
 window.__magra_root = createRoot(rootEl);
}
window.__magra_root.render(<ErrorBoundary><LanguageProvider><HashRouter><App/></HashRouter></LanguageProvider></ErrorBoundary>);
