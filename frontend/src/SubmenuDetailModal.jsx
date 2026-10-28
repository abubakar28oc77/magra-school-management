
function parseEmployeeIdNum(raw) {
  if (!raw) return 999999;
  const s = String(raw).trim();
  const bnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
  const converted = s.replace(/[০-৯]/g, d => bnMap[d] || d);
  const digits = converted.replace(/\D/g, '');
  if (digits) {
    const n = parseInt(digits, 10);
    if (!isNaN(n)) return n;
  }
  return 999999;
}

function sortPeopleByEmployeeId(list = []) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const na = parseEmployeeIdNum(a?.employee_id || a?.id);
    const nb = parseEmployeeIdNum(b?.employee_id || b?.id);
    if (na !== nb) return na - nb;
    return String(a?.employee_id || a?.name_bn || '').localeCompare(String(b?.employee_id || b?.name_bn || ''), undefined, { numeric: true });
  });
}

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

import React, { useState, useEffect } from 'react';
import {
  MOCK_SCHOOL,
  MOCK_COMMITTEE,
  MOCK_TEACHERS,
  MOCK_STAFF,
  MOCK_STUDENTS,
  MOCK_SCHOLARSHIPS,
  MOCK_SSC_RESULTS,
  MOCK_NOTICES,
  MOCK_BOOKS,
  MOCK_SUBJECTS,
  MOCK_ROUTINES,
  PHOTO_PRESIDENT,
  PHOTO_HEAD_TEACHER,
  PHOTO_ASST_HEAD_TEACHER,
  PHOTO_ICT_TEACHER,
  PHOTO_OFFICE_ASSISTANT,
  getTeacherPhoto,
  getLeadershipData
} from './mockData';
import { requestApi } from './apiClient';
import schoolLogo from '../public/school-logo.png';
import { RoutinePanel } from './RoutinePanel';
import { getStoredInstitutionData } from './defaultInstitutionData';
import { getStoredReligiousEventsData } from './religiousEventsData';
import { SEED_BOOKS, BOOK_CATEGORIES, LIBRARIAN_TEACHER } from './libraryData';
import { PublicAttendancePortal } from './PublicAttendancePortal';
import { LanguageLiteratureClubSection } from './LanguageLiteratureClubSection';
import { SportsCultureModernSection } from './SportsCultureModernSection';
import { getStoredFormerPersonnelData } from './formerPersonnelData';

export function SubmenuDetailModal({ menuKey, title, onClose, onNavigateRole }) {
  if (menuKey && (menuKey.includes('attendance') || menuKey.includes('উপস্থিতি'))) {
    return <PublicAttendancePortal isOpen={true} onClose={onClose} />;
  }
  const [filterClass, setFilterClass] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterReligion, setFilterReligion] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [examScore, setExamScore] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const instData = getStoredInstitutionData();

  // Bengali helpers
  const toBn = (n) => (n === null || n === undefined || n === '') ? '০' : String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const formatTk = (n) => `৳ ${toBn(Number(n) || 0)}`;

  // Admission tab state
  const initialTab = menuKey?.includes('docs') ? 'docs' : menuKey?.includes('rules') ? 'rules' : menuKey?.includes('tracking') ? 'tracking' : 'apply';
  const [admTab, setAdmTab] = useState(initialTab);

  const emptyAdm = {
    academic_year: '2026',
    applied_class: '৬',
    department: 'বিজ্ঞান',
    applicant_name_bn: '',
    applicant_name_en: '',
    date_of_birth: '',
    gender: 'পুরুষ',
    religion: 'ইসলাম',
    blood_group: 'A+',
    birth_registration_no: '',
    father_name: '',
    father_nid: '',
    father_phone: '',
    father_profession: '',
    mother_name: '',
    mother_nid: '',
    mother_phone: '',
    mother_profession: '',
    guardian_name: '',
    guardian_relation: 'পিতা',
    guardian_phone: '',
    address: '',
    previous_school: '',
    previous_gpa: '',
    quota: 'সাধারণ',
    // Scanned documents
    scanned_photo: '',
    scanned_birth_cert: '',
    scanned_tc: '',
    scanned_nid: '',
    // Online Fee Payment
    payment_amount: 1400,
    payment_method: 'bkash',
    payment_trx_id: '',
    payment_sender_mobile: '',
    payment_verified: false,
    notes: ''
  };

  const [admForm, setAdmForm] = useState(emptyAdm);
  const [admReceipt, setAdmReceipt] = useState(null);
  const [admSubmitting, setAdmSubmitting] = useState(false);
  const [admMsg, setAdmMsg] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingMsg, setTrackingMsg] = useState('');

  // Auto calculate total fee based on class and department
  useEffect(() => {
    let fee = 1400; // 6, 7, 8: 200 form + 1200 session/admission
    if (['9', '10'].includes(String(admForm.applied_class))) {
      if (admForm.department === 'বিজ্ঞান') fee = 1700; // 200 + 1500
      else fee = 1600; // 200 + 1400
    }
    setAdmForm(prev => ({ ...prev, payment_amount: fee }));
  }, [admForm.applied_class, admForm.department]);

  useEffect(() => {
    if (menuKey?.includes('docs')) setAdmTab('docs');
    else if (menuKey?.includes('rules')) setAdmTab('rules');
    else if (menuKey?.includes('tracking')) setAdmTab('tracking');
    else if (menuKey?.includes('apply') || menuKey?.startsWith('public.nav.admission')) setAdmTab('apply');
  }, [menuKey]);

  // File Upload Helper to convert file to DataURL
  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAdmForm(prev => ({ ...prev, [field]: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Quick 1-click Demo Data Filler for ease of testing
  const handleFillDemoData = () => {
    setAdmForm({
      academic_year: '2026',
      applied_class: '৬',
      department: 'সাধারণ',
      applicant_name_bn: 'তানভীর আহমেদ',
      applicant_name_en: 'Tanvir Ahmed',
      date_of_birth: '2014-03-15',
      gender: 'পুরুষ',
      religion: 'ইসলাম',
      blood_group: 'B+',
      birth_registration_no: '20149315610004521',
      father_name: 'মোঃ রফিকুল ইসলাম',
      father_nid: '19829315610001234',
      father_phone: '01712-345678',
      father_profession: 'ব্যবসায়ী',
      mother_name: 'রোকেয়া বেগম',
      mother_nid: '19859315610005678',
      mother_phone: '01715-987654',
      mother_profession: 'গৃহিণী',
      guardian_name: 'মোঃ রফিকুল ইসলাম',
      guardian_relation: 'পিতা',
      guardian_phone: '01712-345678',
      address: 'গ্রাম: মগড়া উত্তর পাড়া, ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল',
      previous_school: 'মগড়া সরকারি প্রাথমিক বিদ্যালয়',
      previous_gpa: '৫.০০',
      quota: 'সাধারণ',
      scanned_photo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23047857"/><text x="50" y="55" font-family="Arial" font-size="28" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">ছবি</text></svg>',
      scanned_birth_cert: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e0f2fe"/><text x="50" y="55" font-size="14" fill="%230369a1" text-anchor="middle">জন্মসনদ</text></svg>',
      scanned_tc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23fef3c7"/><text x="50" y="55" font-size="14" fill="%2392400e" text-anchor="middle">টিসি/মার্কশিট</text></svg>',
      scanned_nid: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23dcfce7"/><text x="50" y="55" font-size="14" fill="%23166534" text-anchor="middle">পিতা এনআইডি</text></svg>',
      payment_amount: 1400,
      payment_method: 'bkash',
      payment_trx_id: 'BK92837461',
      payment_sender_mobile: '01712-345678',
      payment_verified: true,
      notes: 'কোনো শারীরিক প্রতিবন্ধিতা নেই। ক্রীড়ায় পারদর্শী।'
    });
    setAdmMsg('✓ ডেমো শিক্ষার্থীর সকল তথ্য, স্ক্যান কপি ও পেমেন্ট সফলভাবে পূরণ করা হয়েছে।');
    setTimeout(() => setAdmMsg(''), 3000);
  };

  const handleAdmSubmit = async (e) => {
    e.preventDefault();
    if (!admForm.applicant_name_bn.trim()) {
      setAdmMsg('অনুগ্রহ করে শিক্ষার্থীর পুরো নাম লিখুন।');
      return;
    }
    if (!admForm.guardian_phone.trim()) {
      setAdmMsg('অনুগ্রহ করে অভিভাবকের সচল মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!admForm.payment_trx_id.trim()) {
      setAdmMsg('অনুগ্রহ করে অনলাইন পেমেন্টের Transaction ID (TrxID) প্রদান করুন।');
      return;
    }
    setAdmSubmitting(true);
    setAdmMsg('');
    try {
      const res = await requestApi('/admissions', {
        method: 'POST',
        body: JSON.stringify({
          ...admForm,
          father_name: admForm.father_name || admForm.guardian_name,
          application_date: new Date().toISOString().slice(0, 10),
          status: 'submitted',
          payment_status: 'paid'
        })
      });
      setAdmReceipt(res);
      setAdmMsg('অভিনন্দন! আপনার অনলাইন ভর্তি আবেদন ও ফি সফলভাবে গ্রহণ করা হয়েছে।');
    } catch (err) {
      setAdmMsg('আবেদন জমাদানে ত্রুটি: ' + err.message);
    } finally {
      setAdmSubmitting(false);
    }
  };

  const handleTrackingSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setTrackingMsg('');
    setTrackingResult(null);
    try {
      const list = await requestApi('/admissions?q=' + encodeURIComponent(trackingId.trim()));
      if (Array.isArray(list) && list.length > 0) {
        setTrackingResult(list[0]);
      } else {
        setTrackingMsg('প্রদত্ত আবেদন নম্বর বা মোবাইল নম্বরে কোনো আবেদন পাওয়া যায়নি।');
      }
    } catch {
      setTrackingMsg('তথ্য অনুসন্ধানে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const renderContent = () => {
    // Co-curricular & 4 Major Clubs (Literature, Debate, Science, ICT)
    if (
      menuKey === 'public.nav.sport.clubs' || 
      menuKey === 'public.nav.sport.debate' ||
      menuKey === 'public.nav.sport.science' ||
      menuKey === 'public.nav.sport.ict' ||
      menuKey === 'public.nav.sport.literature' ||
      menuKey?.includes('clubs') ||
      menuKey?.includes('debate') ||
      menuKey?.includes('science') ||
      menuKey?.includes('ict') ||
      menuKey?.includes('literature') ||
      title?.includes('ভাষা ও সাহিত্য') || 
      title?.includes('সাহিত্য ক্লাব') || 
      title?.includes('ক্লাব ও সংগঠন') ||
      title?.includes('ক্লাব') ||
      title?.includes('ডিবেট') ||
      title?.includes('বিতর্ক') ||
      title?.includes('বিজ্ঞান') ||
      title?.includes('আইসিটি')
    ) {
      return <LanguageLiteratureClubSection initialTitle={title} menuKey={menuKey} onClose={onClose} />;
    }

    // 1. Annual Sports (বার্ষিক ক্রীড়া) - Standalone
    if (
      menuKey === 'public.nav.sport.sports' || 
      menuKey === 'public.nav.sport.inter' ||
      title?.includes('বার্ষিক ক্রীড়া') ||
      (title?.includes('ক্রীড়া') && !title?.includes('সংস্কৃতি'))
    ) {
      return <SportsCultureModernSection category="sports" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 2. Cultural Programs (সাংস্কৃতিক অনুষ্ঠান) - Standalone
    if (
      menuKey === 'public.nav.sport.culture' ||
      title?.includes('সাংস্কৃতিক') ||
      (title?.includes('সংস্কৃতি') && !title?.includes('ক্রীড়া'))
    ) {
      return <SportsCultureModernSection category="culture" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 3. Achievements & Awards (অর্জন ও পুরস্কার) - Standalone
    if (
      menuKey === 'public.nav.sport.achievements' ||
      title?.includes('অর্জন') ||
      title?.includes('পুরস্কার')
    ) {
      return <SportsCultureModernSection category="achievements" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 4. Educational Tour (শিক্ষা সফর) - Standalone
    if (
      menuKey === 'public.nav.sport.tour' ||
      title?.includes('শিক্ষা সফর') ||
      title?.includes('ট্যুর')
    ) {
      return <SportsCultureModernSection category="tour" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 5. Computer Lab (কম্পিউটার ল্যাব) - Standalone
    if (
      menuKey === 'public.nav.sport.lab' || 
      title?.includes('কম্পিউটার ল্যাব') ||
      title?.includes('ল্যাব')
    ) {
      return <SportsCultureModernSection category="lab" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 6. Multimedia Classroom (মাল্টিমিডিয়া ক্লাস) - Standalone
    if (
      menuKey === 'public.nav.sport.multimedia' || 
      title?.includes('মাল্টিমিডিয়া')
    ) {
      return <SportsCultureModernSection category="multimedia" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 7. Scouts & Girls Guide (স্কাউট/গার্লস গাইড) - Standalone
    if (
      menuKey === 'public.nav.sport.scouts' || 
      title?.includes('স্কাউট') ||
      title?.includes('গার্লস গাইড') ||
      title?.includes('গাইড')
    ) {
      return <SportsCultureModernSection category="scouts" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    // 8. Inter-School Sports (আন্তঃবিদ্যালয় ক্রীড়া) - Standalone
    if (
      menuKey === 'public.nav.sport.inter' || 
      title?.includes('আন্তঃবিদ্যালয়')
    ) {
      return <SportsCultureModernSection category="inter_sports" menuKey={menuKey} initialTitle={title} onClose={onClose} />;
    }

    
    // 9. Milad Mahfil (মিলাদ-মাহফিল ও দোয়া মাহফিল) - Live Synchronized
    if (menuKey === 'public.nav.sport.milad' || title === 'মিলাদ-মাহফিল' || title?.includes('মিলাদ') || title?.includes('মাহফিল')) {
      const relData = getStoredReligiousEventsData();
      const m = relData.milad || {};
      const schedule = m.schedule || [];

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>🕌 {m.title || 'বার্ষিক দোয়া ও মিলাদ মাহফিল'}</span>
            <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
            </span>
          </div>

          <p className="lead-text">
            {m.occasion || 'পবিত্র শবে বরাত ও এসএসসি পরীক্ষার্থীদের শুভকামনায় বার্ষিক দোয়া ও মিলাদ মাহফিল।'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 700 }}>📅 তারিখ ও সময়:</span>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{m.date || '২০২৬-০২-১২'} • {m.time || 'সকাল ১০:০০'}</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 700 }}>📍 স্থান / ভেন্যু:</span>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>{m.venue || 'বিদ্যালয় অডিটোরিয়াম ও মূল প্রাঙ্গণ'}</div>
            </div>
            <div style={{ background: '#fefce8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <span style={{ fontSize: '12px', color: '#854d0e', fontWeight: 700 }}>🎤 প্রধান আলোচক / ইমাম:</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#854d0e', marginTop: '2px' }}>{m.speaker || 'মাওলানা মোঃ আনোয়ার হোসেন'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>👑 প্রধান অতিথি:</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{m.chief_guest || 'নেয়ামুল হক খান (সভাপতি)'}</div>
            </div>
          </div>

          {/* Program Schedule Table */}
          <h4 style={{ color: '#047857', marginBottom: '8px', fontSize: '15px', fontWeight: 800 }}>
            📜 অনুষ্ঠানের কর্মসূচি ও সময়সূচি:
          </h4>
          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }}>
            <table className="modal-table" style={{ margin: 0, width: '100%' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ width: '150px', padding: '8px 12px' }}>সময়সূচি</th>
                  <th style={{ padding: '8px 12px' }}>কর্মসূচির বিষয় ও বিবরণ</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#047857' }}>{it.time}</td>
                    <td style={{ color: '#334155' }}>{it.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Special Dua & Tabarruk */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            {m.special_dua && (
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <b style={{ color: '#047857', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🤲 বিশেষ দোয়া ও মুনাজাতের উদ্দেশ্য:</b>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>{m.special_dua}</p>
              </div>
            )}
            {m.tabarruk_details && (
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <b style={{ color: '#0284c7', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🍬 তাবাররুক ও আপ্যায়ন:</b>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>{m.tabarruk_details}</p>
              </div>
            )}
          </div>

          {m.committee && (
            <div style={{ background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#065f46' }}>
              <b>আহ্বায়ক ও সমন্বয়ক:</b> {m.committee}
            </div>
          )}
        </div>
      );
    }

    // 10. Puja & Vani Archana (পূজা ও ধর্মীয় উৎসব) - Live Synchronized
    if (menuKey === 'public.nav.sport.puja' || title === 'পূজা' || title?.includes('পূজা') || title?.includes('পুজা') || title?.includes('বাণী অর্চনা')) {
      const relData = getStoredReligiousEventsData();
      const p = relData.puja || {};
      const schedule = p.schedule || [];

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>🪔 {p.title || 'শ্রী শ্রী সরস্বতী পূজা ও বাণী অর্চনা'}</span>
            <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
            </span>
          </div>

          <p className="lead-text">
            {p.occasion || 'বিদ্যার দেবী শ্রী শ্রী সরস্বতীর শুভ আবির্ভাব উপলক্ষে বাৎসরিক বাণী অর্চনা ও পুষ্পাঞ্জলি প্রদান।'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#fdf4ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f0abfc' }}>
              <span style={{ fontSize: '12px', color: '#86198f', fontWeight: 700 }}>📅 পূজার তিথি ও সময়:</span>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#86198f', marginTop: '2px' }}>{p.date || '২০২৬-০১-২৩'} • {p.time || 'সকাল ৮:০০'}</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 700 }}>📍 মণ্ডপ ও পূজার স্থান:</span>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>{p.venue || 'বিদ্যালয় প্রাঙ্গণ ও বিশেষ পূজা মণ্ডপ'}</div>
            </div>
            <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 700 }}>🪔 প্রধান পুরোহিত:</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400e', marginTop: '2px' }}>{p.purohit || 'পণ্ডিত শ্রী রামকৃষ্ণ চক্রবর্তী'}</div>
            </div>
            <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 700 }}>👩‍🏫 সমন্বয়ক শিক্ষিকা:</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{p.coordinator || 'শ্রীমতী আরতী রানী ভদ্র'}</div>
            </div>
          </div>

          {/* Program Schedule Table */}
          <h4 style={{ color: '#047857', marginBottom: '8px', fontSize: '15px', fontWeight: 800 }}>
            📜 পূজার বাৎসরিক নির্ঘণ্ট ও অঞ্জলি সময়সূচি:
          </h4>
          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }}>
            <table className="modal-table" style={{ margin: 0, width: '100%' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ width: '150px', padding: '8px 12px' }}>সময়</th>
                  <th style={{ padding: '8px 12px' }}>পূজা কর্মসূচি ও ধর্মীয় আচার</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#86198f' }}>{it.time}</td>
                    <td style={{ color: '#334155' }}>{it.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message & Prasad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            {p.message && (
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <b style={{ color: '#86198f', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🕊️ বাণীর সারসংক্ষেপ ও শুভেচ্ছা বার্তা:</b>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>{p.message}</p>
              </div>
            )}
            {p.prasad_details && (
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <b style={{ color: '#d97706', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🍎 মহাপ্রসাদ বিতরণ ও আপ্যায়ন:</b>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>{p.prasad_details}</p>
              </div>
            )}
          </div>

          {p.committee && (
            <div style={{ background: '#fdf4ff', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#86198f' }}>
              <b>পূজা উদযাপন কমিটি:</b> {p.committee}
            </div>
          )}
        </div>
      );
    }

// Routine & Schedule (Class & Exam Routine)
    if (menuKey?.includes('routine') || title?.includes('রুটিন')) {
      return (
        <div className="submenu-content" style={{ padding: '4px' }}>
          <RoutinePanel sub={menuKey?.includes('exam') ? 'exam_routine' : 'class_routine'} />
        </div>
      );
    }
    // 0. Online Admission Module & Submenus
    if (menuKey.startsWith('public.nav.admission') || menuKey === 'public.nav.results.admission' || title.includes('ভর্তি')) {
      return (
        <div className="submenu-content admission-modal-flow">
          <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>🎓 অনলাইন শিক্ষার্থী ভর্তি পোর্টাল — শিক্ষাবর্ষ ২০২৬</span>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</span>
          </div>
          
          {/* Submenu Navigation Tabs */}
          <div className="adm-modal-tabs">
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'apply' ? 'active' : ''}`}
              onClick={() => setAdmTab('apply')}
            >
              📝 ভর্তির আবেদন ও ফি পরিশোধ
            </button>
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'docs' ? 'active' : ''}`}
              onClick={() => setAdmTab('docs')}
            >
              📑 প্রয়োজনীয় কাগজপত্র ও সনদ
            </button>
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'rules' ? 'active' : ''}`}
              onClick={() => setAdmTab('rules')}
            >
              📜 ভর্তি নিয়মাবলী ও আসন সংখ্যা
            </button>
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setAdmTab('tracking')}
            >
              🔍 আবেদন ট্র্যাকিং ও চূড়ান্ত স্থিতি
            </button>
          </div>

          {/* TAB 1: Online Application Form & Fee Payment */}
          {admTab === 'apply' && (
            <div className="adm-tab-content">
              {admReceipt ? (
                <div className="admission-slip" style={{ border: '2px solid #047857', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #047857', paddingBottom: '10px', marginBottom: '14px' }}>
                    <img src={schoolLogo} style={{ height: '50px', width: 'auto', marginBottom: '4px' }} alt="Logo" />
                    <h2 style={{ margin: 0, color: '#047857', fontSize: '20px', fontWeight: 900 }}>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h2>
                    <p style={{ margin: '2px 0', fontSize: '11.5px', color: '#475569' }}>মগড়া, কালিহাতি, টাঙ্গাইল • EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.</p>
                    <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', borderRadius: '6px', padding: '5px 12px', margin: '6px auto', display: 'inline-block', fontWeight: 800, fontSize: '13px' }}>
                      অনলাইন ভর্তি আবেদনপত্র ও ফি পরিশোধ রসিদ (শিক্ষাবর্ষ ২০২৬)
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0f2fe', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700 }}>আবেদন ট্র্যাকিং নম্বর (Application No):</span>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0369a1', fontFamily: 'monospace' }}>{admReceipt.application_no}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#059669', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800 }}>
                        ✓ ফি পরিশোধিত: {formatTk(admReceipt.payment_amount || 1400)}
                      </span>
                      <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '2px', fontFamily: 'monospace' }}>TrxID: {admReceipt.payment_trx_id || 'TRX-PAID'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '80px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1.5px solid #047857', background: '#f1f5f9', flexShrink: 0, textAlign: 'center' }}>
                      {admReceipt.scanned_photo ? (
                        <img src={admReceipt.scanned_photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ paddingTop: '24px', fontSize: '11px', color: '#64748b' }}>ছবি সংযুক্ত</div>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', textAlign: 'left' }}>
                      <div><b>শিক্ষার্থীর নাম:</b> {admReceipt.applicant_name_bn}</div>
                      <div><b>আবেদনকৃত শ্রেণি:</b> {toBn(admReceipt.applied_class)}ম শ্রেণি {admReceipt.department ? `(${admReceipt.department})` : ''}</div>
                      <div><b>পিতার নাম:</b> {admReceipt.father_name || admReceipt.guardian_name}</div>
                      <div><b>মাতার নাম:</b> {admReceipt.mother_name || '—'}</div>
                      <div><b>জন্ম তারিখ:</b> {admReceipt.date_of_birth}</div>
                      <div><b>জন্ম নিবন্ধন নং:</b> {admReceipt.birth_registration_no}</div>
                      <div><b>মোবাইল:</b> {admReceipt.guardian_phone}</div>
                      <div><b>আবেদনের তারিখ:</b> {admReceipt.application_date}</div>
                      <div style={{ gridColumn: '1/-1' }}><b>ঠিকানা:</b> {admReceipt.address || '—'}</div>
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '12px', borderRadius: '8px', fontSize: '11.5px', color: '#166534', textAlign: 'left', lineHeight: 1.6, marginBottom: '14px' }}>
                    <b>📌 ভর্তি প্রক্রিয়া ও পরবর্তী করণীয়:</b><br/>
                    ১. আপনার আবেদন ও ফি সফলভাবে গৃহীত হয়েছে। এটি এখন <b>প্রধান শিক্ষকের স্ক্রুটিনি ও অনুমোদনের</b> জন্য জমা হয়েছে।<br/>
                    ২. প্রধান শিক্ষকের অনুমোদন শেষে <b>শ্রেণি শিক্ষক শিক্ষার্থীকে শ্রেণিতে রোল ও শাখা বরাদ্দ করবেন।</b><br/>
                    ৩. উপরের <b>"আবেদন ট্র্যাকিং"</b> ট্যাবে আবেদন নম্বর বা মোবাইল দিয়ে যেকোনো সময় ভর্তির লাইভ স্থিতি ও বরাদ্দকৃত রোল নম্বর জানতে পারবেন।
                  </div>

                  <div className="admission-slip-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button type="button" className="adm-submit-btn" onClick={() => window.print()}>
                      🖨️ আবেদনপত্র ও ফি রসিদ প্রিন্ট / Save as PDF
                    </button>
                    <button
                      type="button"
                      style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => { setTrackingId(admReceipt.application_no); setAdmTab('tracking'); }}
                    >
                      🔍 আবেদন ট্র্যাক করুন
                    </button>
                    <button
                      type="button"
                      style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => { setAdmReceipt(null); setAdmForm(emptyAdm); setAdmMsg(''); }}
                    >
                      + নতুন আবেদন
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdmSubmit} className="adm-form-grid">
                  <div style={{ gridColumn: '1/-1', background: '#f0fdf4', border: '1px solid #86efac', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>
                      💡 ঘরে বসে সহজে অনলাইনে আবেদন ফরম পূরণ ও ফি পরিশোধ সম্পন্ন করুন
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemoData}
                      style={{ background: '#047857', color: '#fff', border: 'none', padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⚡ ডেমো ডেটা পূরণ করুন
                    </button>
                  </div>

                  {/* Section 1: Academic & Personal */}
                  <div style={{ gridColumn: '1/-1', borderBottom: '1.5px solid #047857', paddingBottom: '4px', margin: '6px 0 2px' }}>
                    <h4 style={{ margin: 0, color: '#047857', fontSize: '13.5px' }}>১. ভর্তির শ্রেণি ও শিক্ষার্থীর ব্যক্তিগত তথ্য</h4>
                  </div>

                  <div className="adm-form-field">
                    <label>ভর্তির শ্রেণি *</label>
                    <select value={admForm.applied_class} onChange={e => setAdmForm({ ...admForm, applied_class: e.target.value })} required>
                      {['৬', '৭', '৮', '৯', '১০'].map(c => (
                        <option key={c} value={c}>শ্রেণি {toBn(c)}</option>
                      ))}
                    </select>
                  </div>

                  {['9', '10', '৯', '১০'].includes(String(admForm.applied_class)) ? (
                    <div className="adm-form-field">
                      <label>বিভাগ (Department for Class 9/10) *</label>
                      <select value={admForm.department} onChange={e => setAdmForm({ ...admForm, department: e.target.value })} required>
                        <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                        <option value="মানবিক">মানবিক বিভাগ (Humanities)</option>
                        <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ (Business Studies)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="adm-form-field">
                      <label>শিক্ষাবর্ষ *</label>
                      <select value={admForm.academic_year} onChange={e => setAdmForm({ ...admForm, academic_year: e.target.value })} required>
                        <option value="2026">২০২৬ খ্রি.</option>
                        <option value="2027">২০২৭ খ্রি.</option>
                      </select>
                    </div>
                  )}

                  <div className="adm-form-field full">
                    <label>শিক্ষার্থীর পুরো নাম (বাংলায়) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={admForm.applicant_name_bn}
                      onChange={e => setAdmForm({ ...admForm, applicant_name_bn: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field full">
                    <label>Applicant Full Name (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={admForm.applicant_name_en}
                      onChange={e => setAdmForm({ ...admForm, applicant_name_en: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>জন্ম তারিখ *</label>
                    <input
                      type="date"
                      value={admForm.date_of_birth}
                      onChange={e => setAdmForm({ ...admForm, date_of_birth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>লিঙ্গ *</label>
                    <select value={admForm.gender} onChange={e => setAdmForm({ ...admForm, gender: e.target.value })} required>
                      <option value="পুরুষ">পুরুষ</option>
                      <option value="নারী">নারী</option>
                    </select>
                  </div>

                  <div className="adm-form-field">
                    <label>ধর্ম</label>
                    <select value={admForm.religion} onChange={e => setAdmForm({ ...admForm, religion: e.target.value })}>
                      <option value="ইসলাম">ইসলাম</option>
                      <option value="হিন্দু">হিন্দু</option>
                      <option value="বৌদ্ধ">বৌদ্ধ</option>
                      <option value="খ্রিষ্টান">খ্রিষ্টান</option>
                    </select>
                  </div>

                  <div className="adm-form-field">
                    <label>রক্তের গ্রুপ</label>
                    <select value={admForm.blood_group} onChange={e => setAdmForm({ ...admForm, blood_group: e.target.value })}>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-form-field full">
                    <label>ডিজিটাল জন্ম নিবন্ধন নম্বর (অনলাইন ভেরিফায়েড ১৭ ডিজিট) *</label>
                    <input
                      type="text"
                      placeholder="১৭ ডিজিটের অনলাইন জন্ম নিবন্ধন নম্বর"
                      value={admForm.birth_registration_no}
                      onChange={e => setAdmForm({ ...admForm, birth_registration_no: e.target.value })}
                      required
                    />
                  </div>

                  {/* Section 2: Parents & Guardian */}
                  <div style={{ gridColumn: '1/-1', borderBottom: '1.5px solid #047857', paddingBottom: '4px', margin: '8px 0 2px' }}>
                    <h4 style={{ margin: 0, color: '#047857', fontSize: '13.5px' }}>২. পিতা, মাতা ও অভিভাবকের তথ্যাদি</h4>
                  </div>

                  <div className="adm-form-field">
                    <label>পিতার নাম *</label>
                    <input
                      type="text"
                      placeholder="পিতার নাম"
                      value={admForm.father_name}
                      onChange={e => setAdmForm({ ...admForm, father_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>পিতার NID নম্বর</label>
                    <input
                      type="text"
                      placeholder="১০/১৩/১৭ ডিজিট NID"
                      value={admForm.father_nid}
                      onChange={e => setAdmForm({ ...admForm, father_nid: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>মাতার নাম *</label>
                    <input
                      type="text"
                      placeholder="মাতার নাম"
                      value={admForm.mother_name}
                      onChange={e => setAdmForm({ ...admForm, mother_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>মাতার NID নম্বর</label>
                    <input
                      type="text"
                      placeholder="১০/১৩/১৭ ডিজিট NID"
                      value={admForm.mother_nid}
                      onChange={e => setAdmForm({ ...admForm, mother_nid: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>অভিভাবকের নাম *</label>
                    <input
                      type="text"
                      placeholder="পিতা / মাতা / বৈধ অভিভাবক"
                      value={admForm.guardian_name}
                      onChange={e => setAdmForm({ ...admForm, guardian_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>অভিভাবকের সচল মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={admForm.guardian_phone}
                      onChange={e => setAdmForm({ ...admForm, guardian_phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-field full">
                    <label>বর্তমান ঠিকানা (গ্রাম, ডাকঘর, উপজেলা, জেলা) *</label>
                    <textarea
                      rows="2"
                      placeholder="যেমন: গ্রাম: মগড়া, ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল"
                      value={admForm.address}
                      onChange={e => setAdmForm({ ...admForm, address: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="adm-form-field">
                    <label>পূর্ববর্তী বিদ্যালয়ের নাম</label>
                    <input
                      type="text"
                      placeholder="পূর্বে যে বিদ্যালয়ে পড়ত"
                      value={admForm.previous_school}
                      onChange={e => setAdmForm({ ...admForm, previous_school: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-field">
                    <label>পূর্ববর্তী শ্রেণির ফলাফল / GPA</label>
                    <input
                      type="text"
                      placeholder="যেমন: ৫.০০ বা ৪.৮০"
                      value={admForm.previous_gpa}
                      onChange={e => setAdmForm({ ...admForm, previous_gpa: e.target.value })}
                    />
                  </div>

                  {/* Section 3: Document Uploads & Scans */}
                  <div style={{ gridColumn: '1/-1', borderBottom: '1.5px solid #047857', paddingBottom: '4px', margin: '8px 0 2px' }}>
                    <h4 style={{ margin: 0, color: '#047857', fontSize: '13.5px' }}>৩. প্রয়োজনীয় ডকুমেন্ট স্ক্যান ও আপলোড (Document Scans)</h4>
                  </div>

                  <div className="adm-form-field">
                    <label>📷 শিক্ষার্থীর পাসপোর্ট সাইজের রঙিন ছবি *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload('scanned_photo', e)}
                    />
                    {admForm.scanned_photo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <img src={admForm.scanned_photo} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #047857' }} />
                        <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>✓ ছবি সংযুক্ত হয়েছে</span>
                      </div>
                    )}
                  </div>

                  <div className="adm-form-field">
                    <label>📑 ডিজিটাল জন্ম নিবন্ধন সনদের স্ক্যান কপি *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => handleFileUpload('scanned_birth_cert', e)}
                    />
                    {admForm.scanned_birth_cert && (
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, marginTop: '4px', display: 'block' }}>✓ জন্ম সনদ সংযুক্ত হয়েছে</span>
                    )}
                  </div>

                  <div className="adm-form-field">
                    <label>📋 পূর্ববর্তী ক্লাসের মার্কশিট / ছাড়পত্র (TC) *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => handleFileUpload('scanned_tc', e)}
                    />
                    {admForm.scanned_tc && (
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, marginTop: '4px', display: 'block' }}>✓ ছাড়পত্র/মার্কশিট সংযুক্ত হয়েছে</span>
                    )}
                  </div>

                  <div className="adm-form-field">
                    <label>🪪 পিতা বা মাতার NID ফটোকপি</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => handleFileUpload('scanned_nid', e)}
                    />
                    {admForm.scanned_nid && (
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, marginTop: '4px', display: 'block' }}>✓ এনআইডি কপি সংযুক্ত হয়েছে</span>
                    )}
                  </div>

                  {/* Section 4: Online Fee Payment Gateway */}
                  <div style={{ gridColumn: '1/-1', borderBottom: '1.5px solid #047857', paddingBottom: '4px', margin: '8px 0 2px' }}>
                    <h4 style={{ margin: 0, color: '#047857', fontSize: '13.5px' }}>৪. অনলাইনে ভর্তি সংক্রান্ত ফি পরিশোধ (Online Payment Gateway)</h4>
                  </div>

                  <div style={{ gridColumn: '1/-1', background: '#ecfdf5', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>ভর্তি শ্রেণি অনুযায়ী নির্ধারিত প্রদেয় ফি:</span>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857' }}>
                          সর্বমোট: {formatTk(admForm.payment_amount)}
                        </div>
                        <small style={{ color: '#475569' }}>(আবেদন ফরম ফি ৳ ২০০ + সেশন চার্জ ও শ্রেণি ফি {formatTk(admForm.payment_amount - 200)})</small>
                      </div>

                      {/* Payment Method Selector */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          ['bkash', 'বিকাশ', '#e11d48'],
                          ['nagad', 'নগদ', '#ea580c'],
                          ['rocket', 'রকেট', '#7c3aed'],
                          ['bank', 'ব্যাংক', '#0284c7']
                        ].map(([mKey, mLabel, mColor]) => {
                          const isSel = admForm.payment_method === mKey;
                          return (
                            <button
                              key={mKey}
                              type="button"
                              onClick={() => setAdmForm({ ...admForm, payment_method: mKey })}
                              style={{
                                background: isSel ? mColor : '#ffffff',
                                color: isSel ? '#ffffff' : '#334155',
                                border: `1.5px solid ${mColor}`,
                                padding: '6px 12px', borderRadius: '6px', fontWeight: 800,
                                fontSize: '11.5px', cursor: 'pointer'
                              }}
                            >
                              {mLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '6px', padding: '10px 12px', fontSize: '11.5px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span><b>মার্চেন্ট/হিসাব নম্বর:</b> <code style={{ fontSize: '13px', color: '#047857', fontWeight: 800 }}>01711-998877</code> (বিকাশ/নগদ পেমেন্ট)</span>
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>সোনালী ব্যাংক কালিহাতি শাখা: ১২৩৪৫৬৭৮৯০</span>
                      </div>
                      <p style={{ margin: 0, color: '#475569', fontSize: '11px', lineHeight: 1.45 }}>
                        ১. আপনার মোবাইল অ্যাপ থেকে উল্লেখিত নম্বরে নির্ধারিত <b>{formatTk(admForm.payment_amount)}</b> টাকা পাঠান।<br/>
                        ২. ফিরতি SMS-এ প্রাপ্ত Transaction ID (TrxID) এবং আপনার মোবাইল নম্বর নিচে এন্ট্রি করুন।
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '3px' }}>
                          Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: BK92837461 বা 9H34DF98"
                          value={admForm.payment_trx_id}
                          onChange={e => setAdmForm({ ...admForm, payment_trx_id: e.target.value, payment_verified: true })}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #047857', fontSize: '12.5px', fontWeight: 700 }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '3px' }}>
                          যে মোবাইল থেকে ফি পাঠিয়েছেন *
                        </label>
                        <input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={admForm.payment_sender_mobile}
                          onChange={e => setAdmForm({ ...admForm, payment_sender_mobile: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-field full" style={{ marginTop: '10px' }}>
                    <button type="submit" className="adm-submit-btn" disabled={admSubmitting} style={{ width: '100%', padding: '12px', fontSize: '14px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                      {admSubmitting ? 'আবেদন ও ফি জমা হচ্ছে...' : '✓ অনলাইনে ভর্তি আবেদন ও ফি জমা দিন'}
                    </button>
                  </div>
                </form>
              )}
              {admMsg && <p className="msg" style={{ marginTop: '10px', fontSize: '13px' }}>{admMsg}</p>}
            </div>
          )}

          {/* TAB 2: Required Documents Checklist */}
          {admTab === 'docs' && (
            <div className="adm-tab-content">
              <h4 style={{ margin: '0 0 12px 0', color: '#065f46', fontSize: '16px' }}>
                📑 ভর্তির সময় সাথে আনার প্রয়োজনীয় ৭টি আবশ্যক সনদ ও ডকুমেন্টস:
              </h4>
              <div className="doc-checklist">
                <div className="doc-item">
                  <div className="doc-num">১</div>
                  <div className="doc-info">
                    <h4>অনলাইন পূরণকৃত আবেদনপত্র ও ফি রসিদের প্রিন্ট কপি</h4>
                    <p>অনলাইনে ফরম পূরণের পর প্রিন্টকৃত অথবা ডাউনলোডকৃত আবেদন কপি (১ সেট)।</p>
                    <span className="doc-tag">প্রিন্ট কপি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">২</div>
                  <div className="doc-info">
                    <h4>সদ্য তোলা পাসপোর্ট সাইজের রঙিন ছবি</h4>
                    <p>শিক্ষার্থীর ৪ কপি এবং পিতা ও মাতার ১ কপি করে স্পষ্ট রঙিন ছবি।</p>
                    <span className="doc-tag">ছবি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৩</div>
                  <div className="doc-info">
                    <h4>ডিজিটাল জন্ম নিবন্ধন সনদের সত্যায়িত ফটোকপি</h4>
                    <p>অনলাইন ভেরিফায়েড ১৭ ডিজিটের ডিজিটাল জন্ম নিবন্ধন সনদের মূল ও সত্যায়িত ফটোকপি।</p>
                    <span className="doc-tag">অনলাইন ভেরিফায়েড</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৪</div>
                  <div className="doc-info">
                    <h4>পূর্ববর্তী শ্রেণি পাশের মূল মার্কশিট ও প্রশংসাপত্র/TC</h4>
                    <p>পূর্ববর্তী বিদ্যালয়ের ছাড়পত্র (Transfer Certificate) ও একাডেমিক ট্রান্সক্রিপ্ট।</p>
                    <span className="doc-tag">মূল কপি ও ফটোকপি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৫</div>
                  <div className="doc-info">
                    <h4>পিতা ও মাতার জাতীয় পরিচয়পত্র (NID)-এর ফটোকপি</h4>
                    <p>পিতা ও মাতার জাতীয় পরিচয়পত্রের স্পষ্ট ফটোকপি (১ কপি করে)।</p>
                    <span className="doc-tag">NID ফটোকপি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৬</div>
                  <div className="doc-info">
                    <h4>কোটা বা বিশেষ সুবিধা সংক্রান্ত সনদ (প্রযোজ্য ক্ষেত্রে)</h4>
                    <p>মুক্তিযোদ্ধা, ক্ষুদ্র নৃগোষ্ঠী, প্রতিবন্ধী বা অন্যান্য কোটার সমর্থনে প্রমাণপত্র।</p>
                    <span className="doc-tag">প্রযোজ্য ক্ষেত্রে</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৭</div>
                  <div className="doc-info">
                    <h4>রক্তের গ্রুপ পরীক্ষার রিপোর্ট</h4>
                    <p>শিক্ষার্থীর রক্তের গ্রুপ নিশ্চিতকরণে অনুমোদিত ল্যাবের পরীক্ষার রিপোর্ট।</p>
                    <span className="doc-tag">মেডিকেল রিপোর্ট</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button type="button" className="adm-submit-btn" onClick={() => setAdmTab('apply')} style={{ maxWidth: '280px', margin: '0 auto' }}>
                  📝 এখনই আবেদন ফরম পূরণ করুন →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Rules & Eligibility */}
          {admTab === 'rules' && (
            <div className="adm-tab-content">
              <h4 style={{ margin: '0 0 12px 0', color: '#1e3a8a', fontSize: '16px' }}>
                📜 ২০২৬ শিক্ষাবর্ষের ভর্তি সংক্রান্ত নীতিমালা ও নির্দেশনা:
              </h4>
              <div className="rules-section" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <ul className="bullet-list" style={{ lineHeight: 1.8 }}>
                  <li><b>বয়সসীমা:</b> ৬ষ্ঠ শ্রেণিতে ভর্তির ক্ষেত্রে সরকারি নীতিমালা অনুযায়ী সর্বনিম্ন ১১+ বছর বয়স হতে হবে।</li>
                  <li><b>আবেদন মাধ্যম:</b> অনলাইনে ঘরে বসে অথবা বিদ্যালয়ের ডিজিটাল সেবা কেন্দ্র থেকে ফরম পূরণ করা যাবে।</li>
                  <li><b>ভর্তি মূল্যায়ন ও নির্বাচন:</b> প্রধান শিক্ষক মহোদয়ের নেতৃত্বাধীন ভর্তি কমিটি দ্বারা আবেদনপত্র যাচাই ও নির্বাচন সম্পন্ন হবে।</li>
                  <li><b>অনলাইন ফি পরিশোধ:</b> নির্ধারিত ভর্তি ফরম ও সেশন ফি বিকাশ, নগদ, রকেট বা ব্যাংকের মাধ্যমে পরিশোধ করতে হবে।</li>
                  <li><b>শ্রেণি শিক্ষকের ভূমিকা:</b> প্রধান শিক্ষকের চূড়ান্ত অনুমোদনের পর সংশ্লিষ্ট শ্রেণির শ্রেণি শিক্ষক শিক্ষার্থীকে রোল নম্বর ও শাখা বরাদ্দ করবেন।</li>
                  <li><b>জরুরি হেল্পলাইন:</b> প্রধান শিক্ষক: ০১৭৭৭-XXXXXX, অফিস সহকারী: ০১৭২২-৩৪৫৬৭৮।</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Application Tracking & Status */}
          {admTab === 'tracking' && (
            <div className="adm-tab-content">
              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '16px' }}>
                🔍 আবেদন ট্র্যাকিং ও রিয়েল-টাইম ভর্তি স্থিতি:
              </h4>
              <form onSubmit={handleTrackingSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="আবেদন নম্বর (ADM-2026-XXX) বা অভিভাবকের মোবাইল নম্বর দিন..."
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                />
                <button type="submit" className="adm-submit-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                  অনুসন্ধান করুন
                </button>
              </form>
              {trackingMsg && <p className="msg" style={{ color: '#dc2626' }}>{trackingMsg}</p>}

              {trackingResult && (
                <div className="admission-slip" style={{ border: '2px solid #0284c7', background: '#f0f9ff', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px', color: '#0369a1', fontSize: '18px' }}>{trackingResult.applicant_name_bn}</h3>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', fontSize: '14px' }}>
                        আবেদন নং: {trackingResult.application_no}
                      </div>
                    </div>
                    <span style={{
                      background: trackingResult.status === 'admitted' ? '#047857' : trackingResult.status === 'head_approved' ? '#0284c7' : '#f59e0b',
                      color: '#fff', padding: '5px 14px', borderRadius: '15px', fontWeight: 800, fontSize: '12px'
                    }}>
                      {trackingResult.status === 'admitted' ? '🎓 চূড়ান্ত ভর্তি সম্পন্ন' : trackingResult.status === 'head_approved' ? '✓ প্রধান শিক্ষক অনুমোদিত' : '⏳ নিরীক্ষাধীন'}
                    </span>
                  </div>

                  {/* 4-Step Progress Tracker */}
                  <div style={{ background: '#fff', borderRadius: '8px', padding: '14px', border: '1px solid #bae6fd', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>ভর্তি প্রক্রিয়ার অগ্রগতি স্থিতি:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', fontSize: '11px' }}>
                      <div style={{ background: '#dcfce7', color: '#166534', padding: '6px', borderRadius: '6px', fontWeight: 700, border: '1px solid #86efac' }}>
                        ১. আবেদন ও ফি জমা<br/>✓ সম্পন্ন
                      </div>
                      <div style={{
                        background: ['head_approved', 'selected', 'admitted'].includes(trackingResult.status) ? '#dcfce7' : '#fef3c7',
                        color: ['head_approved', 'selected', 'admitted'].includes(trackingResult.status) ? '#166534' : '#92400e',
                        padding: '6px', borderRadius: '6px', fontWeight: 700, border: '1px solid #cbd5e1'
                      }}>
                        ২. প্রধান শিক্ষকের অনুমোদন<br/>{['head_approved', 'selected', 'admitted'].includes(trackingResult.status) ? '✓ অনুমোদিত' : '⏳ চলমান'}
                      </div>
                      <div style={{
                        background: trackingResult.status === 'admitted' ? '#dcfce7' : '#f8fafc',
                        color: trackingResult.status === 'admitted' ? '#166534' : '#64748b',
                        padding: '6px', borderRadius: '6px', fontWeight: 700, border: '1px solid #cbd5e1'
                      }}>
                        ৩. শ্রেণি শিক্ষক রোল বরাদ্দ<br/>{trackingResult.status === 'admitted' ? '✓ সম্পন্ন' : 'অপেক্ষমাণ'}
                      </div>
                      <div style={{
                        background: trackingResult.status === 'admitted' ? '#dcfce7' : '#f8fafc',
                        color: trackingResult.status === 'admitted' ? '#166534' : '#64748b',
                        padding: '6px', borderRadius: '6px', fontWeight: 700, border: '1px solid #cbd5e1'
                      }}>
                        ৪. আইডি ও ক্লাসে অন্তর্ভুক্তি<br/>{trackingResult.status === 'admitted' ? '✓ সক্রিয়' : 'অপেক্ষমাণ'}
                      </div>
                    </div>
                  </div>

                  {/* If Admitted, Celebrate with Class & Roll */}
                  {trackingResult.status === 'admitted' && (
                    <div style={{ background: '#dcfce7', border: '2px solid #22c55e', borderRadius: '8px', padding: '14px', marginBottom: '14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '28px' }}>🎉</span>
                      <h4 style={{ margin: '4px 0', fontSize: '17px', color: '#15803d', fontWeight: 900 }}>
                        অভিনন্দন! আপনার ভর্তি সফলভাবে চূড়ান্ত সম্পন্ন হয়েছে!
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <div style={{ background: '#fff', padding: '6px 14px', borderRadius: '6px', border: '1px solid #86efac' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>শ্রেণি</span>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>{toBn(trackingResult.applied_class)}ম শ্রেণি</div>
                        </div>
                        <div style={{ background: '#fff', padding: '6px 14px', borderRadius: '6px', border: '1px solid #86efac' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>বরাদ্দকৃত রোল</span>
                          <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857' }}>{toBn(trackingResult.enrolled_roll_no || 1)}</div>
                        </div>
                        <div style={{ background: '#fff', padding: '6px 14px', borderRadius: '6px', border: '1px solid #86efac' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>শাখা</span>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>{trackingResult.enrolled_section || 'পদ্মা'}</div>
                        </div>
                        <div style={{ background: '#fff', padding: '6px 14px', borderRadius: '6px', border: '1px solid #86efac' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>স্টুডেন্ট আইডি</span>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1', fontFamily: 'monospace' }}>{trackingResult.enrolled_student_id || 'MPUHS-2026-601'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="admission-slip-details">
                    <div><b>পিতা/অভিভাবক:</b> {trackingResult.guardian_name || trackingResult.father_name}</div>
                    <div><b>মোবাইল:</b> {trackingResult.guardian_phone}</div>
                    <div><b>জন্ম তারিখ:</b> {trackingResult.date_of_birth || '—'}</div>
                    <div><b>অনলাইন ফি:</b> <span style={{ color: '#047857', fontWeight: 700 }}>পরিশোধিত (TrxID: {trackingResult.payment_trx_id || 'TRX-OK'})</span></div>
                    <div style={{ gridColumn: '1/-1' }}><b>ঠিকানা:</b> {trackingResult.address || '—'}</div>
                  </div>

                  <div className="admission-slip-actions">
                    <button type="button" className="adm-submit-btn" onClick={() => window.print()}>
                      🖨️ ভর্তি প্রত্যয়নপত্র ও রসিদ প্রিন্ট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    // 1. Leadership Speeches (President, Head Teacher, Assistant Head Teacher)
    if (menuKey.startsWith('public.nav.leadership') || title.includes('বাণী') || menuKey === 'public.nav.institution.message') {
      const leaderData = getLeadershipData();
      const leaderInfo = leaderData.map;

      const selectedKey = menuKey in leaderInfo ? menuKey : (title.includes('সহকারী') ? 'public.nav.leadership.asst_head' : (title.includes('প্রধান শিক্ষক') ? 'public.nav.leadership.head' : (title.includes('সভাপতি') ? 'public.nav.leadership.president' : null)));

      if (selectedKey && leaderInfo[selectedKey]) {
        const leader = leaderInfo[selectedKey];
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">{leader.badge}</div>
            <div className="leader-modal-profile" style={{ display: 'flex', gap: '18px', alignItems: 'center', margin: '16px 0', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: '3px solid #2874c6' }}>
                <img src={leader.photo} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#1a202c', fontSize: '18px' }}>{leader.name}</h3>
                <p style={{ margin: '0 0 2px 0', color: '#1d4ed8', fontWeight: 700, fontSize: '14px' }}>{leader.designation || leader.role}</p>
                <small style={{ color: '#64748b', fontSize: '12px' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, কালিহাতি, টাঙ্গাইল</small>
              </div>
            </div>
            <div className="leader-speech" style={{ lineHeight: '1.8', color: '#2d3748', fontSize: '15px' }}>
              {(Array.isArray(leader.speech) ? leader.speech : [leader.speech]).map((para, i) => (
                <p key={i} style={{ marginBottom: '12px' }}>{para}</p>
              ))}
            </div>
          </div>
        );
      }

      // Show all 3 messages together if general 'বাণী' menu clicked
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📜 সভাপতি, প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষকের বাণী</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {Object.values(leaderInfo).map((leader, idx) => (
              <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '2px solid #2874c6' }}>
                    <img src={leader.photo} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#1a202c', fontSize: '16px' }}>{leader.title}</h4>
                    <p style={{ margin: 0, color: '#1d4ed8', fontSize: '13px', fontWeight: 700 }}>{leader.name} — {leader.designation || leader.role}</p>
                  </div>
                </div>
                <div style={{ lineHeight: '1.7', color: '#2d3748', fontSize: '14px' }}>
                  {(Array.isArray(leader.speech) ? leader.speech : [leader.speech]).map((para, i) => (
                    <p key={i} style={{ marginBottom: '8px' }}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 1. Institutional Information Submenus (12 items) - Live Synchronized with Login Admin Panel
    if (menuKey === 'public.nav.institution.about' || title === 'বিদ্যালয় পরিচিতি') {
      const ab = instData.about || {};
      const stats = ab.stats || {};
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🏛️ বিদ্যালয় পরিচিতি</div>
          <h3>{ab.name_bn || 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়'} (স্থাপিত: {ab.established || '১৯৪৬'} খ্রি.)</h3>
          <p className="lead-text">
            {ab.profile_text || 'টাঙ্গাইল জেলার কালিহাতি উপজেলার মগড়া ইউনিয়নে অবস্থিত একটি ঐতিহ্যবাহী ও সুপ্রাচীন বিদ্যাপীঠ। বিগত ৮ দশকেরও বেশি সময় ধরে প্রতিষ্ঠানটি স্থানীয় পর্যায়ে মানসম্মত শিক্ষা, শৃঙ্খলা, নৈতিকতা ও আধুনিক কারিগরি শিক্ষার আলো ছড়িয়ে আসছে।'}
          </p>
          <div className="info-stats-grid">
            <div className="info-stat-card"><b>{ab.eiin || '১১৪২৯০'}</b><span>EIIN নম্বর</span></div>
            <div className="info-stat-card"><b>{ab.mpo || '৪২০৬০৭১৩০২'}</b><span>MPO কোড</span></div>
            <div className="info-stat-card"><b>{ab.established || '১৯৪৬'}</b><span>প্রতিষ্ঠার সন</span></div>
            <div className="info-stat-card"><b>{stats.students || '১২৫০+ জন'}</b><span>মোট শিক্ষার্থী</span></div>
            <div className="info-stat-card"><b>{stats.teachers || '২৮ জন'}</b><span>শিক্ষক সংখ্যা</span></div>
            <div className="info-stat-card"><b>{stats.staff || '৬ জন'}</b><span>কর্মচারী সংখ্যা</span></div>
            <div className="info-stat-card"><b>{stats.land_area || '৩.৫০ একর'}</b><span>জমির পরিমাণ</span></div>
            <div className="info-stat-card"><b>{stats.buildings || '৩টি ভবন'}</b><span>একাডেমিক ভবন</span></div>
            <div className="info-stat-card"><b>{stats.classrooms || '২৪টি'}</b><span>শ্রেণিকক্ষ</span></div>
            <div className="info-stat-card"><b>{stats.pass_rate || '৯৮.৫%'}</b><span>গড় পাসের হার</span></div>
          </div>
          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 6px', color: '#047857' }}>📍 ক্যাম্পাস যোগাযোগ ও অবস্থান:</h4>
            <p style={{ margin: '2px 0', fontSize: '13.5px', color: '#334155' }}><b>ঠিকানা:</b> {ab.address || 'গ্রাম ও ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল'}</p>
            <p style={{ margin: '2px 0', fontSize: '13.5px', color: '#334155' }}><b>মোবাইল/ফোন:</b> {ab.phone || '01712-345678'} • <b>ইমেইল:</b> {ab.email || 'magrapuhs.46@gmail.com'}</p>
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.history' || title === 'বিদ্যালয়ের ইতিহাস') {
      const hist = instData.history || {};
      const milestones = hist.milestones || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📜 বিদ্যালয়ের ইতিহাস ও ঐতিহ্য</div>
          <h3>আট দশকের গৌরবময় ইতিহাস (১৯৪৬ - বর্তমান)</h3>
          <p className="lead-text">
            {hist.founding_story || 'ব্রিটিশ শাসনামলের শেষলগ্নে ১৯৪৬ খ্রিষ্টাব্দে টাঙ্গাইল জেলার কালিহাতি উপজেলার মগড়া ইউনিয়নের শিক্ষানুরাগী ও বিশিষ্ট ব্যক্তিবর্গের ঐকান্তিক প্রচেষ্টায় এই বিদ্যাপীঠ প্রতিষ্ঠিত হয়।'}
          </p>
          <div style={{ display: 'grid', gap: '14px', margin: '18px 0' }}>
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #047857', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 6px', color: '#065f46' }}>🏛️ প্রতিষ্ঠা ও পটভূমি</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                {hist.founding_story}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #2563eb', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 6px', color: '#1d4ed8' }}>🎖️ মহান মুক্তিযুদ্ধে গৌরবোজ্জ্বল ভূমিকা</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                {hist.liberation_war || '১৯৭১ সালের মহান মুক্তিযুদ্ধে অত্র বিদ্যালয়ের শিক্ষক, তৎকালীন ছাত্র ও স্থানীয় বীর মুক্তিযোদ্ধারা সক্রিয়ভাবে পাকিস্তানি হানাদার বাহিনীর বিরুদ্ধে প্রতিরোধ গড়ে তোলেন।'}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #d97706', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 6px', color: '#b45309' }}>🚀 আধুনিকায়ন ও ডিজিটাল যুগে পদার্পণ</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                {hist.modernization || 'কাঁচা টিনশেড ঘর থেকে আজ সুবিশাল বহুতল একাডেমিক ভবন, আধুনিক বিজ্ঞানাগার, শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব ও সম্পূর্ণ স্বয়ংক্রিয় অনলাইন স্কুল ম্যানেজমেন্ট সিস্টেম সমৃদ্ধ প্রতিষ্ঠানে রূপান্তর লাভ করেছে।'}
              </p>
            </div>
          </div>
          {milestones.length > 0 && (
            <div style={{ marginTop: '18px' }}>
              <h4 style={{ color: '#047857', marginBottom: '10px' }}>⏳ ঐতিহাসিক কালক্রম ও মাইলফলক:</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {milestones.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f1f5f9', padding: '10px 14px', borderRadius: '6px' }}>
                    <span style={{ background: '#047857', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>{m.year}</span>
                    <div>
                      <b style={{ color: '#0f172a', fontSize: '14px' }}>{m.title}</b>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.committee' || title === 'পরিচালনা পর্ষদ' || title === 'পরিচালনা কমিটি') {
      const comm = instData.committee || {};
      const members = comm.members && comm.members.length ? comm.members : MOCK_COMMITTEE;
      const tenure = comm.tenure || '২০২৪–২০২৬';
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👥 পরিচালনা পর্ষদ (Managing Committee) • মেয়াদকাল: {tenure}</div>
          <p className="lead-text">বিদ্যালয়ের সার্বিক শিক্ষা, প্রশাসনিক ও ভৌত অবকাঠামোগত উন্নয়নের দায়িত্বে নিয়োজিত গভর্নিং বডি:</p>
          <div className="committee-grid">
            {members.map((m, idx) => {
              const ld = getLeadershipData();
              const photoSrc = m.role === 'সভাপতি' ? (ld.president.photo || PHOTO_PRESIDENT) : m.role === 'সদস্য সচিব' ? (ld.head.photo || PHOTO_HEAD_TEACHER) : (m.photo || PHOTO_PRESIDENT);
              return (
                <div key={idx} className="committee-card">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #047857' }}>
                    <img src={photoSrc} alt={m.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="member-info">
                    <span className="member-role">{m.role}</span>
                    <h4>{m.name_bn}</h4>
                    <p>{m.designation}</p>
                    <small>মেয়াদকাল: {m.tenure || tenure}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.regulations' || title === 'বিধি বিধান' || menuKey === 'public.nav.institution.rules') {
      const regs = instData.regulations || {};
      const rules = regs.rules || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">⚖️ প্রাতিষ্ঠানিক বিধি বিধান ও নীতিমালা</div>
          <div className="rules-section">
            <p className="lead-text">{regs.overview || 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (মাউশি) এবং ঢাকা শিক্ষা বোর্ডের বিধিমালা অনুযায়ী পরিচালিত নীতিসমূহ:'}</p>
            <ul className="bullet-list" style={{ lineHeight: '1.8', fontSize: '14.5px' }}>
              {rules.map((r, idx) => (
                <li key={idx}><b>{r.title}:</b> {r.detail}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.code_of_conduct' || title === 'আচরন বিধি' || title === 'আচরণবিধি') {
      const coc = instData.code_of_conduct || {};
      const studentConduct = coc.student_conduct || [];
      const guardianConduct = coc.guardian_conduct || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🛡️ আচরন বিধি ও শৃঙ্খলা নীতিমালা</div>
          <div className="rules-section">
            <h4 style={{ color: '#047857', margin: '14px 0 8px', fontSize: '16px' }}>🎓 শিক্ষার্থীদের জন্য পালনীয় আচরণবিধি:</h4>
            <ul className="bullet-list" style={{ lineHeight: '1.8', fontSize: '14px' }}>
              {studentConduct.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            {guardianConduct.length > 0 && (
              <>
                <h4 style={{ color: '#0369a1', margin: '18px 0 8px', fontSize: '16px' }}>👨‍👩‍👧 সম্মানিত অভিভাবকদের প্রতি নির্দেশনা:</h4>
                <ul className="bullet-list" style={{ lineHeight: '1.8', fontSize: '14px' }}>
                  {guardianConduct.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.master_plan' || title === 'মুখ্য পরিকল্পনা') {
      const mp = instData.master_plan || {};
      const plans = mp.plans || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🎯 প্রাতিষ্ঠানিক মুখ্য পরিকল্পনা ও কৌশলগত রূপরেখা</div>
          <p className="lead-text">{mp.overview || 'আগামী শিক্ষাবর্ষগুলোতে গুণগত শিক্ষা ও ক্যাম্পাস উন্নয়নে গৃহীত মহাপরিকল্পনা:'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '16px 0' }}>
            {plans.map((p, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <b style={{ color: '#065f46', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{p.icon || '🎯'}</span>
                  <span>{p.title}</span>
                </b>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.library' || title === 'গ্রন্থাগার/লাইব্রেরী' || title === 'পাঠাগার/লাইব্রেরী' || title?.includes('গ্রন্থাগার') || title?.includes('লাইব্রেরি')) {
      const lib = instData.library || {};
      const sections = lib.sections || [];

      // Retrieve live library books from Login Page / Admin Library Database
      let liveBooks = [];
      try {
        const saved = localStorage.getItem('magra_db_library_books');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) liveBooks = parsed;
        }
      } catch {}
      if (!liveBooks.length) liveBooks = SEED_BOOKS;

      // Calculate Stock Totals
      const totalCopies = liveBooks.reduce((acc, b) => acc + (Number(b.quantity) || 1), 0);
      const availableCopies = liveBooks.reduce((acc, b) => acc + (Number(b.available_quantity !== undefined ? b.available_quantity : b.quantity) || 0), 0);
      const borrowedCopies = Math.max(0, totalCopies - availableCopies);

      // Filter books
      const filteredBooks = liveBooks.filter(b => {
        const matchesCategory = libraryCategory === 'all' || b.category === libraryCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery = !q || [b.title, b.author, b.accession_no, b.publisher, b.shelf, b.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);
        return matchesCategory && matchesQuery;
      });

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>📚 বিদ্যালয় কেন্দ্রীয় গ্রন্থাগার ও লাইব্রেরী</span>
            <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
              EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.
            </span>
          </div>

          <p className="lead-text">
            {lib.summary || 'বিদ্যালয়ের সমৃদ্ধ কেন্দ্রীয় গ্রন্থাগারে পাঠ্যবই, রেফারেন্স গ্রন্থ, বিশ্বসাহিত্য, বিজ্ঞান, মুক্তিযুদ্ধ ও সাধারণ জ্ঞানের সমৃদ্ধ সংগ্রহ রয়েছে।'}
          </p>

          {/* Librarian Info Card */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '16px',
            boxShadow: '0 2px 6px rgba(6,78,59,0.15)'
          }}>
            <div style={{ fontWeight: 800, fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👨‍🏫 দায়িত্বপ্রাপ্ত শিক্ষক:</span>
              <span>{LIBRARIAN_TEACHER.name_bn}</span>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '3px' }}>
              {LIBRARIAN_TEACHER.designation} • রিডিং রুম সময়সূচি: <b>{lib.reading_hours || 'সকাল ১০:০০ - বিকাল ৪:০০ (কর্মদিবসে)'}</b>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="info-stats-grid" style={{ marginBottom: '16px' }}>
            <div className="info-stat-card" style={{ borderLeft: '4px solid #047857' }}>
              <b>{toBn(totalCopies)} টি</b>
              <span>মোট বইয়ের স্টক</span>
            </div>
            <div className="info-stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <b>{toBn(liveBooks.length)} টি</b>
              <span>অনন্য বই / শিরোনাম</span>
            </div>
            <div className="info-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <b>{toBn(availableCopies)} টি</b>
              <span>বর্তমানে শেলফে মজুত</span>
            </div>
            <div className="info-stat-card" style={{ borderLeft: '4px solid #d97706' }}>
              <b>{toBn(borrowedCopies)} টি</b>
              <span>শিক্ষার্থীদের ইস্যুকৃত</span>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px' }}>
              <span style={{ fontSize: '15px' }}>🔍</span>
              <input
                type="text"
                placeholder="বইয়ের নাম, লেখক, অ্যাকসেশন নং বা প্রকাশনী দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>ক্যাটাগরি:</span>
              <select
                value={libraryCategory}
                onChange={(e) => setLibraryCategory(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff'
                }}
              >
                <option value="all">সব ক্যাটাগরি ({liveBooks.length})</option>
                {BOOK_CATEGORIES.map(c => {
                  const count = liveBooks.filter(b => b.category === c.label).length;
                  return (
                    <option key={c.key} value={c.label}>
                      {c.icon} {c.label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Book Catalog & Stock Register Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, color: '#047857', fontSize: '15px', fontWeight: 800 }}>
              📖 বইয়ের তালিকা ও স্টক রেজিস্টার (মোট {toBn(filteredBooks.length)} টি প্রদর্শিত):
            </h4>
            {searchQuery && (
              <button
                type="button"
                className="mini"
                onClick={() => setSearchQuery('')}
                style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}
              >
                ফিল্টার মুছুন ✕
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }}>
            <table className="modal-table" style={{ margin: 0, width: '100%' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px' }}>অ্যাকসেশন নং</th>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px' }}>বইয়ের নাম ও লেখক</th>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px' }}>ক্যাটাগরি</th>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px' }}>প্রকাশনী ও তাক</th>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px', textAlign: 'center' }}>মোট কপি</th>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px', textAlign: 'center' }}>মজুত স্থিতি</th>
                  <th style={{ padding: '9px 10px', fontSize: '12.5px' }}>সংগ্রহ সূত্র</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map(b => {
                    const avail = Number(b.available_quantity !== undefined ? b.available_quantity : b.quantity) || 0;
                    return (
                      <tr key={b.id || b.accession_no}>
                        <td style={{ fontFamily: 'monospace', fontSize: '11.5px', fontWeight: 700, color: '#0369a1' }}>
                          {b.accession_no || 'MAG-BK'}
                        </td>
                        <td>
                          <b style={{ color: '#0f172a', fontSize: '13.5px' }}>{b.title}</b>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>✍️ {b.author}</div>
                        </td>
                        <td>
                          <span className="badge" style={{ fontSize: '11.5px' }}>{b.category}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>
                          <div>{b.publisher || '—'}</div>
                          <small style={{ color: '#64748b' }}>📍 {b.shelf || 'সাধারণ তাক'}</small>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>
                          {toBn(b.quantity || 1)} টি
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {avail > 0 ? (
                            <span style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #86efac',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: 800
                            }}>
                              ✓ {toBn(avail)}টি মজুত
                            </span>
                          ) : (
                            <span style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fca5a5',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: 800
                            }}>
                              ইস্যুকৃত (স্টকে নেই)
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '11.5px', color: '#475569' }}>
                          {b.source || 'বিদ্যালয়ের নিজস্ব তহবিল'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      কোনো বইয়ের রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Library Rules */}
          {lib.rules && (
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', color: '#475569' }}>
              <b style={{ color: '#047857' }}>📜 বই ইস্যু ও ব্যবহারের নীতিমালা:</b> {lib.rules}
            </div>
          )}
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.curriculum' || title === 'পাঠ্যক্রম') {
      const cur = instData.curriculum || {};
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📖 জাতীয় শিক্ষাক্রম রূপরেখা (NCTB Curriculum)</div>
          <p className="lead-text">{cur.overview || 'এনসিটিবি (NCTB) অনুমোদিত শিক্ষাক্রম অনুযায়ী শ্রেণিভিত্তিক পাঠদান ও মূল্যায়ন পদ্ধতি:'}</p>
          <div style={{ display: 'grid', gap: '12px', margin: '16px 0' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <b style={{ color: '#0369a1', fontSize: '15px' }}>৬ষ্ঠ হতে ৮ম শ্রেণি (নিম্ন মাধ্যমিক):</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                {cur.lower_secondary || 'বাংলা, ইংরেজি, গণিত, বিজ্ঞান, ইতিহাস ও সামাজিক বিজ্ঞান, ডিজিটাল প্রযুক্তি, জীবন ও জীবিকা, স্বাস্থ্য সুরক্ষা, ধর্ম ও নৈতিক শিক্ষা, শিল্প ও সংস্কৃতি।'}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <b style={{ color: '#15803d', fontSize: '15px' }}>৯ম ও ১০ম শ্রেণি — বিজ্ঞান বিভাগ:</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                {cur.secondary_science || 'বাংলা, ইংরেজি, গণিত, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত/কৃষি শিক্ষা, তথ্য ও যোগাযোগ প্রযুক্তি, ধর্ম ও নৈতিক শিক্ষা।'}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <b style={{ color: '#854d0e', fontSize: '15px' }}>৯ম ও ১০ম শ্রেণি — মানবিক বিভাগ:</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                {cur.secondary_humanities || 'বাংলা, ইংরেজি, গণিত, বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা, ভূগোল ও পরিবেশ, পৌরনীতি ও নাগরিকতা, অর্থনীতি/কৃষি শিক্ষা, সাধারণ বিজ্ঞান, ধর্ম।'}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <b style={{ color: '#86198f', fontSize: '15px' }}>৯ম ও ১০ম শ্রেণি — ব্যবসায় শিক্ষা শাখা:</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                {cur.secondary_business || 'বাংলা, ইংরেজি, গণিত, হিসাববিজ্ঞান, ফিন্যান্স ও ব্যাংকিং, ব্যবসায় উদ্যোগ, সাধারণ বিজ্ঞান, তথ্য ও যোগাযোগ প্রযুক্তি, ধর্ম।'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.syllabus' || title === 'পাঠ্যতালিকা') {
      const syl = instData.syllabus || {};
      const classes = syl.classes || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📑 শ্রেণিভিত্তিক পাঠ্যতালিকা ও পাঠ্যসূচি — শিক্ষাবর্ষ {syl.year || '২০২৬'}</div>
          <p className="lead-text">চলতি শিক্ষাবর্ষের অর্ধবার্ষিক, প্রাক-নির্বাচনী ও বার্ষিক পরীক্ষার পাঠ্যবই ও সিলেবাস বিভাজন:</p>
          <div style={{ display: 'grid', gap: '10px', margin: '16px 0' }}>
            {classes.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div>
                  <b style={{ color: '#0f172a', fontSize: '15px' }}>{c.class_name}</b>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#475569' }}>{c.syllabus_title}</p>
                </div>
                <span style={{ background: '#047857', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                  {c.status || 'সিলেবাস অনুমোদিত'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.publications' || title === 'প্রকাশনা') {
      const pub = instData.publications || {};
      const items = pub.items || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📰 বিদ্যালয় প্রকাশনা ও সাময়িকী</div>
          <p className="lead-text">{pub.summary || 'শিক্ষার্থীদের সৃজনশীল লেখালেখি, কবিতা, চিত্রাঙ্কন ও প্রাতিষ্ঠানিক স্মরণিকা:'}</p>
          <div style={{ display: 'grid', gap: '14px', margin: '16px 0' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ background: idx === 0 ? '#fdf4ff' : idx === 1 ? '#ecfdf5' : '#fffbeb', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <b style={{ color: '#0f172a', fontSize: '15px' }}>📖 {it.title} <small style={{ color: '#047857', fontWeight: 700 }}>({it.type})</small></b>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.hostel' || title === 'ছাত্রাবাস') {
      const hos = instData.hostel || {};
      const features = hos.features || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🏢 ছাত্রাবাস ও আবাসিক সুবিধা</div>
          <p className="lead-text"><b>{hos.name || 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় আবাসিক ছাত্রাবাস'}</b></p>
          <div style={{ background: '#eff6ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 700 }}>{hos.superintendent || 'হোস্টেল সুপারিনটেনডেন্ট কর্তৃক সার্বক্ষণিক পরিচালিত'}</span>
            <span style={{ display: 'block', fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>মোট ধারণক্ষমতা: {hos.capacity || '৬০ জন শিক্ষার্থী'} • {hos.fees || 'ভর্তুকিমূল্যে নির্ধারিত'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '16px 0' }}>
            {features.map((feat, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <b style={{ color: '#0f172a' }}>{feat.title}</b>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.transport' || title === 'পরিবহণ সুবিধা') {
      const tr = instData.transport || {};
      const guidelines = tr.safety_guidelines || [];
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🚌 পরিবহণ ও যাতায়াত সুবিধা</div>
          <p className="lead-text">বিদ্যালয়ে ছাত্র-ছাত্রীদের নিরাপদে যাতায়াতের সামগ্রিক ব্যবস্থা ও দিকনির্দেশনা:</p>
          <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13.5px', color: '#334155' }}><b>ক্যাম্পাস সংযোগ:</b> {tr.road_connectivity || 'কালিহাতি উপজেলার মগড়া ইউনিয়ন ও পার্শ্ববর্তী গ্রামগুলো থেকে পাকা সড়কপথে সুলভ যোগাযোগের সুবিধা।'}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13.5px', color: '#334155' }}><b>সাইকেল শেড:</b> {tr.bicycle_shed || 'শিক্ষার্থীদের জন্য ক্যাম্পাসে নিরাপদ ও সুপরিসর সাইকেল শেড ব্যবস্থা রয়েছে।'}</p>
            {tr.future_bus && <p style={{ margin: 0, fontSize: '13.5px', color: '#047857' }}><b>ভবিষ্যৎ পরিকল্পনা:</b> {tr.future_bus}</p>}
          </div>
          {guidelines.length > 0 && (
            <>
              <h4 style={{ color: '#047857', marginBottom: '8px' }}>সড়ক নিরাপত্তা ও শৃঙ্খলা নির্দেশনাবলী:</h4>
              <ul className="bullet-list" style={{ lineHeight: '1.8', fontSize: '14px' }}>
                {guidelines.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      );
    }

    // 2. Staff / Teachers submenus (8 distinct modules)
    if (menuKey.startsWith('public.nav.staff') || title?.includes('শিক্ষক') || title?.includes('কর্মচারী')) {
      const formerPersonnel = getStoredFormerPersonnelData();
      
      // A. Head Teacher (প্রধান শিক্ষক)
      if (menuKey === 'public.nav.staff.head' || title === 'প্রধান শিক্ষক' || title?.includes('প্রধান শিক্ষক পরিচিতি')) {
        let liveTeachers = [];
        try { liveTeachers = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]'); } catch {}
        const rawList = liveTeachers.length ? liveTeachers : MOCK_TEACHERS;
        const head = rawList.find(t => 
          t && (
            t.public_contact_role === 'head_teacher' || 
            (t.designation && t.designation.includes('প্রধান শিক্ষক') && !t.designation.includes('সহকারী')) ||
            t.id === 't-1' ||
            (t.name_bn && t.name_bn.includes('শফিকুল'))
          )
        ) || rawList[0] || {};

        const leaderData = getLeadershipData(rawList);
        const headLeader = leaderData.map['public.nav.leadership.head'] || {};
        const speechParas = Array.isArray(headLeader.speech) ? headLeader.speech : [headLeader.speech || 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ে আপনাকে স্বাগতম। মানসম্মত শিক্ষা ও নৈতিক চরিত্র গঠনে আমাদের প্রচেষ্টা সর্বদা অব্যাহত।'];

        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>🎓 প্রতিষ্ঠান প্রধান পরিচিতি</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • EIIN 114290
              </span>
            </div>

            <div className="leader-modal-profile" style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '16px 0', padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(4,120,87,0.25)', border: '3px solid #047857' }}>
                <img src={getTeacherPhoto(head)} alt={head.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#047857', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    Employee ID: {head.employee_id || 'EMP-001'}
                  </span>
                  {head.mpo_index_no && (
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      MPO Index: {head.mpo_index_no}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 2px 0', color: '#0f172a', fontSize: '20px', fontWeight: 800 }}>{head.name_bn || 'মুহাম্মদ শফিকুল ইসলাম'}</h3>
                <p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{head.name_en || 'MUHAMMAD SHAFIQUL ISLAM'}</p>
                <p style={{ margin: '0 0 4px 0', color: '#047857', fontWeight: 700, fontSize: '15px' }}>{head.designation || 'প্রধান শিক্ষক'}</p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px', color: '#475569', marginTop: '6px' }}>
                  {head.phone && <span>📱 {head.phone}</span>}
                  {head.email && <span>✉️ {head.email}</span>}
                  {head.current_post_joining_date && <span>📅 বর্তমান পদে যোগদান: {head.current_post_joining_date}</span>}
                </div>
              </div>
            </div>

            {head.educational_qualifications && (
              <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#065f46', display: 'block', marginBottom: '2px' }}>
                  📜 শিক্ষাগত যোগ্যতা:
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: 600 }}>
                  {head.educational_qualifications}
                </p>
              </div>
            )}

            <div className="leader-speech" style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', lineHeight: 1.8, color: '#334155', fontSize: '14.5px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#047857', fontSize: '16px', fontWeight: 800 }}>
                💬 প্রধান শিক্ষকের শুভেচ্ছা বাণী:
              </h4>
              {speechParas.map((para, i) => (
                <p key={i} style={{ marginBottom: '10px' }}>{para}</p>
              ))}
            </div>
          </div>
        );
      }

      // B. Assistant Head Teacher (সহকারী প্রধান শিক্ষক)
      if (menuKey === 'public.nav.staff.assistant' || title === 'সহকারী প্রধান শিক্ষক' || title?.includes('সহকারী প্রধান শিক্ষক পরিচিতি')) {
        let liveTeachers = [];
        try { liveTeachers = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]'); } catch {}
        const rawList = liveTeachers.length ? liveTeachers : MOCK_TEACHERS;
        const asst = rawList.find(t => 
          t && (
            t.public_contact_role === 'assistant_head_teacher' || 
            (t.designation && t.designation.includes('সহকারী প্রধান শিক্ষক')) ||
            t.id === 't-2' ||
            (t.name_bn && t.name_bn.includes('তাপসী'))
          )
        ) || rawList[1] || {};

        const leaderData = getLeadershipData(rawList);
        const asstLeader = leaderData.map['public.nav.leadership.asst_head'] || {};
        const speechParas = Array.isArray(asstLeader.speech) ? asstLeader.speech : [asstLeader.speech || 'শিক্ষার্থীদের মেধা বিকাশ ও পাঠদানের গুণগত মান বজায় রাখতে আমরা প্রতিটি ক্ষেত্রে যত্নশীল।'];

        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>📖 সহকারী প্রতিষ্ঠান প্রধান পরিচিতি</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • EIIN 114290
              </span>
            </div>

            <div className="leader-modal-profile" style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '16px 0', padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(13,148,136,0.25)', border: '3px solid #0d9488' }}>
                <img src={getTeacherPhoto(asst)} alt={asst.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#0d9488', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    Employee ID: {asst.employee_id || 'EMP-002'}
                  </span>
                  {asst.mpo_index_no && (
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      MPO Index: {asst.mpo_index_no}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 2px 0', color: '#0f172a', fontSize: '20px', fontWeight: 800 }}>{asst.name_bn || 'তাপসী সরকার'}</h3>
                <p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{asst.name_en || 'TAPASI SARKER'}</p>
                <p style={{ margin: '0 0 4px 0', color: '#0d9488', fontWeight: 700, fontSize: '15px' }}>{asst.designation || 'সহকারী প্রধান শিক্ষক'} {asst.subject ? ('(' + asst.subject + ')') : ''}</p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px', color: '#475569', marginTop: '6px' }}>
                  {asst.phone && <span>📱 {asst.phone}</span>}
                  {asst.email && <span>✉️ {asst.email}</span>}
                  {asst.current_post_joining_date && <span>📅 বর্তমান পদে যোগদান: {asst.current_post_joining_date}</span>}
                </div>
              </div>
            </div>

            {asst.educational_qualifications && (
              <div style={{ background: '#f0fdfa', padding: '12px 16px', borderRadius: '8px', border: '1px solid #99f6e4', marginBottom: '16px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f766e', display: 'block', marginBottom: '2px' }}>
                  📜 শিক্ষাগত যোগ্যতা:
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#0d9488', fontWeight: 600 }}>
                  {asst.educational_qualifications}
                </p>
              </div>
            )}

            <div className="leader-speech" style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', lineHeight: 1.8, color: '#334155', fontSize: '14.5px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0d9488', fontSize: '16px', fontWeight: 800 }}>
                💬 সহকারী প্রধান শিক্ষকের একাডেমিক বার্তা:
              </h4>
              {speechParas.map((para, i) => (
                <p key={i} style={{ marginBottom: '10px' }}>{para}</p>
              ))}
            </div>
          </div>
        );
      }

      // C. Active Teachers (কর্মরত শিক্ষকবৃন্দ)
      if (menuKey === 'public.nav.staff.active_teachers' || menuKey === 'public.nav.staff.active' || title === 'কর্মরত শিক্ষকবৃন্দ' || title === 'সক্রিয় শিক্ষকবৃন্দ') {
        let liveTeachers = [];
        try { liveTeachers = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]'); } catch {}
        const rawList = liveTeachers.length ? liveTeachers : MOCK_TEACHERS;
        let listToDisplay = rawList.filter(t => {
          if (!t) return false;
          const isAct = t.status === 'active' || t.status === 'সক্রিয়' || !t.status;
          const desig = (t.designation || '').toLowerCase();
          const role = (t.role || t.public_contact_role || '').toLowerCase();
          const empId = (t.employee_id || '').toUpperCase();
          const isPresident = desig.includes('সভাপতি') || role.includes('president') || role === 'সভাপতি';
          const isStaff = empId.startsWith('STF') || desig.includes('অফিস সহকারী') || desig.includes('হিসাব সহকারী') || desig.includes('অফিস সহায়ক') || desig.includes('এমএলএসএস') || desig.includes('mlss') || role.includes('staff');
          return isAct && !isPresident && !isStaff;
        });

        listToDisplay = sortPeopleByEmployeeId(listToDisplay);

        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>👨‍🏫 কর্মরত সম্মানিত শিক্ষকবৃন্দ ({listToDisplay.length} জন)</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
              </span>
            </div>
            <p className="lead-text">বিদ্যালয়ের দক্ষ, অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী:</p>
            <div className="teachers-modal-grid">
              {listToDisplay.map((t, idx) => (
                <div key={t.id || idx} className="teacher-modal-card" style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '64px', height: '64px', minWidth: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #047857', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <img src={getTeacherPhoto(t)} alt={t.name_bn || t.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#047857', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>ID: {t.employee_id}</span>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{t.name_bn || t.name_en}</h4>
                    </div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#047857', fontWeight: 600 }}>{t.designation || 'সহকারী শিক্ষক'}{t.subject ? (' (' + t.subject + ')') : ''}</p>
                    {t.phone && <small style={{ display: 'block', color: '#475569' }}>📱 {t.phone}</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // D. Active Staff (কর্মরত কর্মচারীবৃন্দ)
      if (menuKey === 'public.nav.staff.active_staff' || menuKey === 'public.nav.staff.employees' || title === 'কর্মরত কর্মচারীবৃন্দ' || title === 'কর্মচারীবৃন্দ') {
        let liveStaff = [];
        try { liveStaff = JSON.parse(localStorage.getItem('magra_db_staff') || '[]'); } catch {}
        const staffList = liveStaff.length ? liveStaff : MOCK_STAFF;
        const sortedStaff = sortPeopleByEmployeeId(staffList.filter(s => s && s.status !== 'inactive'));

        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>🧑‍💼 কর্মরত কর্মচারীবৃন্দ ({sortedStaff.length} জন)</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
              </span>
            </div>
            <p className="lead-text">বিদ্যালয়ের প্রশাসনিক, অফিস ও সেবামূলক কার্যক্রমে নিয়োজিত দায়িত্বশীল কর্মচারীবৃন্দ:</p>
            <div className="teachers-modal-grid">
              {sortedStaff.map((s, idx) => (
                <div key={s.id || idx} className="teacher-modal-card" style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '60px', height: '60px', minWidth: '60px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #2563eb', background: '#eff6ff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '26px' }}>🧑‍💼</span>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>ID: {s.employee_id}</span>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{s.name_bn || s.name_en}</h4>
                    </div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>{s.designation}</p>
                    {s.phone && <small style={{ display: 'block', color: '#475569' }}>📱 {s.phone}</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // E. Former Head Teachers (প্রাক্তন প্রধান শিক্ষকবৃন্দ)
      if (menuKey === 'public.nav.staff.former_heads' || title === 'প্রাক্তন প্রধান শিক্ষকবৃন্দ' || title?.includes('প্রাক্তন প্রধান শিক্ষক')) {
        const formerHeads = formerPersonnel.former_heads || [];
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>🏛️ প্রাক্তন প্রধান শিক্ষকবৃন্দের তালিকা ({formerHeads.length} জন)</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                প্রতিষ্ঠাকাল: ১৯৪৬ খ্রি.
              </span>
            </div>
            <p className="lead-text">
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ে প্রতিষ্ঠালগ্ন থেকে বিভিন্ন মেয়াদে নিষ্ঠা ও সুনামের সাথে দায়িত্ব পালনকারী শ্রদ্ধেয় প্রাক্তন প্রধান শিক্ষকবৃন্দ:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '14px' }}>
              {formerHeads.map((fh, idx) => (
                <div key={fh.id || idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '64px', height: '64px', minWidth: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #047857', background: '#ecfdf5', display: 'grid', placeItems: 'center' }}>
                    {fh.photo_url ? (
                      <img src={fh.photo_url} alt={fh.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '28px' }}>🎓</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>{fh.name_bn}</h4>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                        📅 {fh.tenure}
                      </span>
                    </div>
                    {fh.name_en && <small style={{ color: '#64748b', display: 'block' }}>{fh.name_en}</small>}
                    <p style={{ margin: '4px 0 2px 0', fontSize: '13px', color: '#047857', fontWeight: 700 }}>{fh.designation || 'প্রাক্তন প্রধান শিক্ষক'}</p>
                    {fh.education && <small style={{ color: '#475569', display: 'block' }}>📜 {fh.education}</small>}
                    {fh.notes && <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>{fh.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // F. Former Assistant Head Teachers (প্রাক্তন সহকারী প্রধান শিক্ষকবৃন্দ)
      if (menuKey === 'public.nav.staff.former_assistants' || title === 'প্রাক্তন সহকারী প্রধান শিক্ষকবৃন্দ' || title?.includes('প্রাক্তন সহকারী প্রধান')) {
        const formerAssistants = formerPersonnel.former_assistants || [];
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>🏛️ প্রাক্তন সহকারী প্রধান শিক্ষকবৃন্দের তালিকা ({formerAssistants.length} জন)</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
              </span>
            </div>
            <p className="lead-text">
              বিদ্যালয়ে বিভিন্ন মেয়াদে প্রাত্যহিক একাডেমিক ও প্রশাসনিক পরিচালনায় নিষ্ঠার সাথে দায়িত্ব পালনকারী শ্রদ্ধেয় প্রাক্তন সহকারী প্রধান শিক্ষকবৃন্দ:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '14px' }}>
              {formerAssistants.map((fa, idx) => (
                <div key={fa.id || idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '64px', height: '64px', minWidth: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #0d9488', background: '#f0fdfa', display: 'grid', placeItems: 'center' }}>
                    {fa.photo_url ? (
                      <img src={fa.photo_url} alt={fa.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '28px' }}>📖</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>{fa.name_bn}</h4>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px' }}>
                        📅 {fa.tenure}
                      </span>
                    </div>
                    {fa.name_en && <small style={{ color: '#64748b', display: 'block' }}>{fa.name_en}</small>}
                    <p style={{ margin: '4px 0 2px 0', fontSize: '13px', color: '#0d9488', fontWeight: 700 }}>{fa.designation || 'প্রাক্তন সহকারী প্রধান শিক্ষক'}</p>
                    {fa.education && <small style={{ color: '#475569', display: 'block' }}>📜 {fa.education}</small>}
                    {fa.notes && <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>{fa.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // G. Former Teachers (প্রাক্তন শিক্ষকবৃন্দ)
      if (menuKey === 'public.nav.staff.former_teachers' || menuKey === 'public.nav.staff.former' || title === 'প্রাক্তন শিক্ষকবৃন্দ' || title === 'সাবেক শিক্ষকবৃন্দ') {
        const formerTeachers = formerPersonnel.former_teachers || [];
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>👨‍🏫 প্রাক্তন শিক্ষকবৃন্দের তালিকা ({formerTeachers.length} জন)</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                স্মরণীয় শিক্ষকবৃন্দ
              </span>
            </div>
            <p className="lead-text">
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের প্রাক্তন ও অবসরপ্রাপ্ত সম্মানিত শিক্ষকবৃন্দ, যাঁদের অক্লান্ত পরিশ্রমে গড়ে উঠেছে হাজারো কৃতী শিক্ষার্থী:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '14px' }}>
              {formerTeachers.map((ft, idx) => (
                <div key={ft.id || idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '60px', height: '60px', minWidth: '60px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #047857', background: '#ecfdf5', display: 'grid', placeItems: 'center' }}>
                    {ft.photo_url ? (
                      <img src={ft.photo_url} alt={ft.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '26px' }}>👨‍🏫</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>{ft.name_bn}</h4>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>
                        📅 {ft.tenure}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 2px 0', fontSize: '13px', color: '#047857', fontWeight: 700 }}>
                      {ft.designation || 'প্রাক্তন শিক্ষক'} {ft.subject ? ('• বিষয়: ' + ft.subject) : ''}
                    </p>
                    {ft.education && <small style={{ color: '#475569', display: 'block' }}>🎓 {ft.education}</small>}
                    {ft.notes && <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{ft.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // H. Former Staff (প্রাক্তন কর্মচারীবৃন্দ)
      if (menuKey === 'public.nav.staff.former_staff' || menuKey === 'public.nav.staff.formerEmployees' || title === 'প্রাক্তন কর্মচারীবৃন্দ' || title === 'সাবেক কর্মচারীবৃন্দ') {
        const formerStaff = formerPersonnel.former_staff || [];
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>🧑‍💼 প্রাক্তন কর্মচারীবৃন্দের তালিকা ({formerStaff.length} জন)</span>
              <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                শ্রদ্ধেয় কর্মচারীবৃন্দ
              </span>
            </div>
            <p className="lead-text">
              বিদ্যালয়ে অতীতে নিষ্ঠা ও আন্তরিকতার সাথে সেবা প্রদানকারী সম্মানিত প্রাক্তন কর্মচারীবৃন্দ:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '14px' }}>
              {formerStaff.map((fs, idx) => (
                <div key={fs.id || idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '56px', height: '56px', minWidth: '56px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #2563eb', background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                    {fs.photo_url ? (
                      <img src={fs.photo_url} alt={fs.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>🧑‍💼</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>{fs.name_bn}</h4>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px' }}>
                        📅 {fs.tenure}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 2px 0', fontSize: '13px', color: '#2563eb', fontWeight: 700 }}>
                      {fs.designation || 'প্রাক্তন কর্মচারী'}
                    </p>
                    {fs.notes && <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{fs.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    // 3. Students
    if (menuKey.startsWith('public.nav.students')) {
      let liveStudents = [];
      try {
        const raw = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
        liveStudents = Array.isArray(raw) && raw.length ? raw : (Array.isArray(MOCK_STUDENTS) ? MOCK_STUDENTS : []);
      } catch {
        liveStudents = Array.isArray(MOCK_STUDENTS) ? MOCK_STUDENTS : [];
      }

      const filteredList = sortStudentsList(liveStudents)
        .filter(s => filterClass === 'all' || String(s.class_name) === String(filterClass))
        .filter(s => {
          if (filterGroup === 'all') return true;
          const grp = (s.department || s.group_name || s.group || s.section || '').trim().toLowerCase();
          const target = filterGroup.trim().toLowerCase();
          if (target.includes('বিজ্ঞান')) return grp.includes('বিজ্ঞান');
          if (target.includes('মানবিক')) return grp.includes('মানবিক');
          if (target.includes('ব্যবসা')) return grp.includes('ব্যবসা');
          return grp === target;
        })
        .filter(s => {
          if (filterReligion === 'all') return true;
          const rel = (s.religion || 'ইসলাম').trim();
          return rel === filterReligion;
        })
        .filter(s => {
          if (filterGender === 'all') return true;
          const gen = (s.gender || 'male').toLowerCase();
          if (filterGender === 'male') return gen.includes('পুরুষ') || gen.includes('male') || gen.includes('ছাত্র') || gen === 'm';
          if (filterGender === 'female') return gen.includes('নারী') || gen.includes('female') || gen.includes('মহিলা') || gen.includes('ছাত্রী') || gen === 'f';
          return true;
        })
        .filter(s => {
          if (!searchQuery) return true;
          const haystack = [s.student_id, s.name_bn, s.name_en, s.roll_no, s.guardian_name, s.father_name, s.mother_name, s.group_name, s.group, s.current_village, s.current_post_office, s.current_upazila, s.current_district, s.permanent_village, s.permanent_post_office, s.permanent_upazila, s.permanent_district, s.address].filter(Boolean).map(String).join(' ').toLowerCase();
          return haystack.includes(searchQuery.toLowerCase());
        });

      const handlePrintPublicStudents = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
          return;
        }
        const filterInfo = [];
        if (filterClass !== 'all') filterInfo.push(`শ্রেণি: শ্রেণি ${filterClass}`);
        if (filterGroup !== 'all') filterInfo.push(`বিভাগ: ${filterGroup}`);
        if (filterReligion !== 'all') filterInfo.push(`ধর্ম: ${filterReligion}`);
        if (filterGender !== 'all') filterInfo.push(`জেন্ডার: ${filterGender === 'male' ? 'ছাত্র' : 'ছাত্রী'}`);
        const filterText = filterInfo.length ? filterInfo.join(' | ') : 'সকল শিক্ষার্থী (ফিল্টারহীন)';

        const rowsHtml = filteredList.map((s, idx) => `
          <tr>
            <td style="text-align:center;font-weight:600;">${idx + 1}</td>
            <td style="text-align:center;font-family:monospace;font-weight:600;">${s.student_id || '—'}</td>
            <td style="text-align:center;font-weight:700;">${s.roll_no || '—'}</td>
            <td style="font-weight:600;">${s.name_bn || s.name_en || '—'}</td>
            <td style="text-align:center;">শ্রেণি ${s.class_name || '১০'}</td>
            <td style="text-align:center;">${s.group_name || s.group || s.section || '—'}</td>
            <td style="text-align:center;">${s.religion || 'ইসলাম'}</td>
            <td>${s.guardian_name || s.father_name || '—'}</td>
            <td>${s.current_village || s.permanent_village || '—'}</td>
            <td>${s.current_post_office || s.permanent_post_office || '—'}</td>
            <td>${s.current_upazila || s.permanent_upazila || '—'}</td>
            <td style="text-align:center;font-family:monospace;">${s.guardian_phone || s.father_mobile || '—'}</td>
          </tr>
        `).join('');

        const htmlContent = `
          <!DOCTYPE html>
          <html lang="bn">
          <head>
            <meta charset="utf-8">
            <title>শিক্ষার্থী তালিকা প্রতিবেদন - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
            <style>
              @page { size: A4 landscape; margin: 10mm; }
              body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; font-size: 13px; }
              .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; }
              .school-title { font-size: 22px; font-weight: 800; color: #047857; margin: 0; }
              .school-sub { font-size: 13px; color: #475569; margin: 3px 0 0 0; }
              .report-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 8px 0 2px 0; background: #f1f5f9; display: inline-block; padding: 3px 16px; border-radius: 4px; border: 1px solid #cbd5e1; }
              .meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; color: #334155; font-weight: 600; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
              table { width: 100%; border-collapse: collapse; margin-top: 4px; }
              th { background: #f1f5f9; color: #0f172a; font-weight: 700; border: 1px solid #64748b; padding: 6px 8px; font-size: 12px; }
              td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 12px; }
              tr:nth-child(even) { background-color: #f8fafc; }
              .footer-signs { display: flex; justify-content: space-between; margin-top: 45px; padding: 0 30px; }
              .sign-box { text-align: center; border-top: 1px solid #334155; width: 180px; padding-top: 5px; font-size: 12px; font-weight: 700; }
              @media print {
                .no-print { display: none !important; }
                body { padding: 0; }
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
              <div class="report-title">📋 শিক্ষার্থী তালিকা প্রতিবেদন</div>
            </div>
            <div class="meta-bar">
              <div><b>🔍 ফিল্টার কুয়েরি:</b> ${filterText}</div>
              <div><b>📊 মোট শিক্ষার্থী:</b> ${filteredList.length} জন | <b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width:30px;">ক্র.নং</th>
                  <th style="width:65px;">আইডি</th>
                  <th style="width:40px;">রোল</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th style="width:60px;">শ্রেণি</th>
                  <th style="width:110px;">বিভাগ/ শাখা</th>
                  <th style="width:60px;">ধর্ম</th>
                  <th style="width:50px;">লিঙ্গ</th>
                  <th>অভিভাবকের নাম</th>
                  <th style="width:95px;">মোবাইল</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="10" style="text-align:center;padding:20px;">কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি</td></tr>'}
              </tbody>
            </table>
            <div class="footer-signs">
              <div class="sign-box">শ্রেণি শিক্ষকের স্বাক্ষর</div>
              <div class="sign-box">যাচাইকারীর স্বাক্ষর</div>
              <div class="sign-box">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
            </div>
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

      return (
        <div className="submenu-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div className="modal-hero-badge" style={{ margin: 0 }}>👥 শিক্ষার্থী তালিকা ও পরিসংখ্যান ({filteredList.length} জন)</div>
            <button
              type="button"
              onClick={handlePrintPublicStudents}
              style={{
                background: '#047857',
                color: '#fff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                boxShadow: '0 2px 4px rgba(4,120,87,0.2)'
              }}
            >
              🖨️ প্রিন্ট / PDF রিপোর্ট
            </button>
          </div>
          <div className="filter-bar-modal" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <input
              placeholder="শিক্ষার্থীর নাম / Student ID / পিতা / গ্রাম খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '180px' }}
            />
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="all">🏫 সকল শ্রেণি</option>
              <option value="6">শ্রেণি ৬</option>
              <option value="7">শ্রেণি ৭</option>
              <option value="8">শ্রেণি ৮</option>
              <option value="9">শ্রেণি ৯</option>
              <option value="10">শ্রেণি ১০</option>
            </select>
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
              <option value="all">📚 সকল বিভাগ</option>
              <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
              <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
              <option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option>
            </select>
            <select value={filterReligion} onChange={e => setFilterReligion(e.target.value)}>
              <option value="all">☪️ 🕉️ সকল ধর্ম</option>
              <option value="ইসলাম">ইসলাম</option>
              <option value="হিন্দু">হিন্দু</option>
              <option value="বৌদ্ধ">বৌদ্ধ</option>
              <option value="খ্রিষ্টান">খ্রিষ্টান</option>
            </select>
            <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              <option value="all">👥 সকল জেন্ডার</option>
              <option value="male">ছাত্র (পুরুষ)</option>
              <option value="female">ছাত্রী (নারী)</option>
            </select>
          </div>
          <table className="modal-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>রোল</th>
                <th>নাম</th>
                <th>শ্রেণি</th>
                <th>বিভাগ</th>
                <th>ধর্ম</th>
                <th>পিতা / অভিভাবক</th>
                <th>গ্রাম</th>
                <th>ডাকঘর</th>
                <th>উপজেলা</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(s => (
                <tr key={s.id}>
                  <td><code>{s.student_id}</code></td>
                  <td><b>{s.roll_no || '—'}</b></td>
                  <td>{s.name_bn || s.name_en || '—'}</td>
                  <td>শ্রেণি {s.class_name || '—'}</td>
                  <td>{s.group_name || s.group || s.section || '—'}</td>
                  <td>{s.religion || 'ইসলাম'}</td>
                  <td>{s.guardian_name || s.father_name || '—'}</td>
                  <td>{s.current_village || s.permanent_village || '—'}</td>
                  <td>{s.current_post_office || s.permanent_post_office || '—'}</td>
                  <td>{s.current_upazila || s.permanent_upazila || '—'}</td>
                </tr>
              ))}
              {!filteredList.length && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '18px', color: '#718096' }}>কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    // 4. Results
    if (menuKey.startsWith('public.nav.results')) {
      if (menuKey === 'public.nav.results.ssc') {
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">📈 বিগত বছরের SSC পরীক্ষার ফলাফল ও পরিসংখ্যান</div>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>শিক্ষাবর্ষ</th>
                  <th>পরীক্ষার্থী</th>
                  <th>উত্তীর্ণ</th>
                  <th>GPA 5 (A+)</th>
                  <th>পাশের হার</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SSC_RESULTS.map((r, i) => (
                  <tr key={i}>
                    <td><b>{r.year}</b></td>
                    <td>{r.candidates} জন</td>
                    <td>{r.passed} জন</td>
                    <td><b style={{ color: '#075c3a' }}>{r.gpa5} জন</b></td>
                    <td><span className="status-green">{r.pass_rate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📊 পরীক্ষার ফলাফল ও মূল্যায়ন</div>
          <p className="lead-text">বিদ্যালয়ের অভ্যন্তরীণ ও পাবলিক পরীক্ষার ফলাফল সংক্রান্ত তথ্যাদি নিয়মিত হালনাগাদ করা হয়।</p>
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="submenu-content">
        <div className="modal-hero-badge">ℹ️ {title}</div>
        <h3>{title}</h3>
        <p className="lead-text">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের {title} সম্পর্কিত তথ্য ও আপডেট।</p>
      </div>
    );
  };

    const isClubModal = menuKey === 'public.nav.sport.clubs' || title?.includes('ভাষা ও সাহিত্য') || title?.includes('সাহিত্য') || title?.includes('ক্লাব');
  const isWideModal = isClubModal || 
    menuKey?.startsWith('public.nav.sport') || 
    title?.includes('ক্রীড়া') || 
    title?.includes('সাংস্কৃতিক') || 
    title?.includes('সংস্কৃতি') || 
    title?.includes('অর্জন') || 
    title?.includes('পুরস্কার') || 
    title?.includes('শিক্ষা সফর');

  return (
    <div className="submenu-modal-overlay" onClick={onClose}>
      <div className="submenu-modal-card" style={isWideModal ? { maxWidth: '1100px', width: '96%' } : undefined} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>বন্ধ করুন</button>
        </div>
      </div>
    </div>
  );
}
