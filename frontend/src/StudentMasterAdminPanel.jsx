import React, { useState, useEffect } from 'react';
import { 
  getStoredGovtScholarships, 
  saveStoredGovtScholarships, 
  getStoredStipendStudents, 
  saveStoredStipendStudents, 
  getStoredMeritoriousStudents, 
  saveStoredMeritoriousStudents, 
  getStoredFormerMeritorious, 
  saveStoredFormerMeritorious, 
  getStoredClassSeats, 
  saveStoredClassSeats 
} from './studentDataStore';
import { SubmenuDetailModal } from './SubmenuDetailModal';

export function StudentMasterAdminPanel({ 
  sub, 
  setSub, 
  StudentPanelComponent, 
  ResultPanelComponent, 
  VillageStudentPanelComponent,
  onNavigate 
}) {
  // Normalize initial tab
  const getInitialTab = (s) => {
    if (!s) return 'enrolled';
    if (['enrolled', 'list', 'new', 'csv', 'promotion', 'village'].includes(s)) return 'enrolled';
    if (['govt_scholarship', 'scholarship'].includes(s)) return 'govt_scholarship';
    if (['stipend'].includes(s)) return 'stipend';
    if (['meritorious', 'distinguished'].includes(s)) return 'meritorious';
    if (['former_meritorious', 'formerDistinguished'].includes(s)) return 'former_meritorious';
    if (['class_seats', 'seats'].includes(s)) return 'class_seats';
    if (['attendance_records', 'attendance'].includes(s)) return 'attendance_records';
    return 'enrolled';
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab(sub));
  const [toastMsg, setToastMsg] = useState('');
  const [previewModal, setPreviewModal] = useState(null);

  // Sync with prop sub
  useEffect(() => {
    if (sub) {
      setActiveTab(getInitialTab(sub));
    }
  }, [sub]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (setSub) setSub(tabKey);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // 1. Govt Scholarships State & CRUD
  const [govtScholarships, setGovtScholarships] = useState(getStoredGovtScholarships);
  const [editingGovtId, setEditingGovtId] = useState(null);
  const [govtSearch, setGovtSearch] = useState('');
  const [govtFilterType, setGovtFilterType] = useState('all');
  const [govtForm, setGovtForm] = useState({
    student_id: '',
    name_bn: '',
    roll_no: '',
    class_name: '১০ম',
    exam_type: '৮ম শ্রেণি মেধা বৃত্তি',
    scholarship_type: 'ট্যালেন্টপুল বৃত্তি',
    academic_year: '২০২৫',
    amount: '৪,৫০০',
    provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর, ঢাকা',
    status: 'চলমান',
    notes: ''
  });

  const saveGovtScholarship = (e) => {
    e.preventDefault();
    if (!govtForm.name_bn.trim()) {
      alert('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingGovtId) {
      updated = govtScholarships.map(item => item.id === editingGovtId ? { ...item, ...govtForm } : item);
      showToast('সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      const newItem = {
        ...govtForm,
        id: 'gov-sch-' + Date.now(),
      };
      updated = [newItem, ...govtScholarships];
      showToast('নতুন সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থী সফলভাবে যোগ করা হয়েছে!');
    }
    setGovtScholarships(updated);
    saveStoredGovtScholarships(updated);
    setEditingGovtId(null);
    setGovtForm({
      student_id: '',
      name_bn: '',
      roll_no: '',
      class_name: '১০ম',
      exam_type: '৮ম শ্রেণি মেধা বৃত্তি',
      scholarship_type: 'ট্যালেন্টপুল বৃত্তি',
      academic_year: '২০২৫',
      amount: '৪,৫০০',
      provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর, ঢাকা',
      status: 'চলমান',
      notes: ''
    });
  };

  const editGovtScholarship = (item) => {
    setEditingGovtId(item.id);
    setGovtForm({ ...item });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deleteGovtScholarship = (id) => {
    if (!confirm('আপনি কি এই সরকারি বৃত্তির রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = govtScholarships.filter(item => item.id !== id);
    setGovtScholarships(updated);
    saveStoredGovtScholarships(updated);
    showToast('সরকারি বৃত্তির রেকর্ড মুছে ফেলা হয়েছে!');
  };

  // 2. Stipend Students State & CRUD
  const [stipendStudents, setStipendStudents] = useState(getStoredStipendStudents);
  const [editingStipendId, setEditingStipendId] = useState(null);
  const [stipendSearch, setStipendSearch] = useState('');
  const [stipendClassFilter, setStipendClassFilter] = useState('all');
  const [stipendForm, setStipendForm] = useState({
    student_id: '',
    name_bn: '',
    roll_no: '',
    class_name: '৬ষ্ঠ',
    section: 'ক শাখা',
    guardian_name: '',
    guardian_phone: '',
    mfs_provider: 'নগদ',
    mfs_account: '',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৩,০০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: ''
  });

  const saveStipendStudent = (e) => {
    e.preventDefault();
    if (!stipendForm.name_bn.trim()) {
      alert('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingStipendId) {
      updated = stipendStudents.map(item => item.id === editingStipendId ? { ...item, ...stipendForm } : item);
      showToast('উপবৃত্তি সুবিধাভোগী শিক্ষার্থীর তথ্য আপডেট করা হয়েছে!');
    } else {
      const newItem = {
        ...stipendForm,
        id: 'stp-' + Date.now(),
      };
      updated = [newItem, ...stipendStudents];
      showToast('নতুন উপবৃত্তি সুবিধাভোগী শিক্ষার্থী সফলভাবে নথিভুক্ত হয়েছে!');
    }
    setStipendStudents(updated);
    saveStoredStipendStudents(updated);
    setEditingStipendId(null);
    setStipendForm({
      student_id: '',
      name_bn: '',
      roll_no: '',
      class_name: '৬ষ্ঠ',
      section: 'ক শাখা',
      guardian_name: '',
      guardian_phone: '',
      mfs_provider: 'নগদ',
      mfs_account: '',
      scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
      academic_year: '২০২৬',
      amount: '৩,০০০',
      cycle: 'দ্বি-বার্ষিক',
      status: 'অনুমোদিত ও সক্রিয়',
      notes: ''
    });
  };

  const editStipendStudent = (item) => {
    setEditingStipendId(item.id);
    setStipendForm({ ...item });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deleteStipendStudent = (id) => {
    if (!confirm('আপনি কি এই উপবৃত্তি সুবিধাভোগী শিক্ষার্থীর রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = stipendStudents.filter(item => item.id !== id);
    setStipendStudents(updated);
    saveStoredStipendStudents(updated);
    showToast('উপবৃত্তি রেকর্ড মুছে ফেলা হয়েছে!');
  };

  // 3. Meritorious Enrolled Students State & CRUD
  const [meritoriousList, setMeritoriousList] = useState(getStoredMeritoriousStudents);
  const [editingMeritId, setEditingMeritId] = useState(null);
  const [meritSearch, setMeritSearch] = useState('');
  const [meritForm, setMeritForm] = useState({
    student_id: '',
    name_bn: '',
    roll_no: '',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    category: 'বার্ষিক মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
    academic_year: '২০২৫-২০২৬',
    achievement_title: '',
    photo_url: '',
    notes: ''
  });

  const saveMeritoriousStudent = (e) => {
    e.preventDefault();
    if (!meritForm.name_bn.trim()) {
      alert('কৃতি শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingMeritId) {
      updated = meritoriousList.map(item => item.id === editingMeritId ? { ...item, ...meritForm } : item);
      showToast('কৃতি শিক্ষার্থীর অর্জন আপডেট করা হয়েছে!');
    } else {
      const newItem = {
        ...meritForm,
        id: 'merit-' + Date.now(),
        photo_url: meritForm.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&h=240&fit=crop'
      };
      updated = [newItem, ...meritoriousList];
      showToast('নতুন কৃতি শিক্ষার্থী সম্মাননা তালিকায় যুক্ত হয়েছে!');
    }
    setMeritoriousList(updated);
    saveStoredMeritoriousStudents(updated);
    setEditingMeritId(null);
    setMeritForm({
      student_id: '',
      name_bn: '',
      roll_no: '',
      class_name: '১০ম',
      section: 'বিজ্ঞান বিভাগ',
      category: 'বার্ষিক মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
      academic_year: '২০২৫-২০২৬',
      achievement_title: '',
      photo_url: '',
      notes: ''
    });
  };

  const editMeritoriousStudent = (item) => {
    setEditingMeritId(item.id);
    setMeritForm({ ...item });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deleteMeritoriousStudent = (id) => {
    if (!confirm('আপনি কি এই কৃতি শিক্ষার্থীর সম্মাননা রেকর্ড মুছে ফেলতে চান?')) return;
    const updated = meritoriousList.filter(item => item.id !== id);
    setMeritoriousList(updated);
    saveStoredMeritoriousStudents(updated);
    showToast('কৃতি শিক্ষার্থীর রেকর্ড মুছে ফেলা হয়েছে!');
  };

  // 4. Former Meritorious Alumni State & CRUD
  const [formerMeritList, setFormerMeritList] = useState(getStoredFormerMeritorious);
  const [editingFormerMeritId, setEditingFormerMeritId] = useState(null);
  const [formerMeritSearch, setFormerMeritSearch] = useState('');
  const [formerMeritForm, setFormerMeritForm] = useState({
    name_bn: '',
    passing_year: '২০২৪',
    exam_result: 'এসএসসি ২০২৪ — গোল্ডেন জিপিএ ৫.০০',
    current_status: '',
    higher_education: '',
    photo_url: '',
    phone: '',
    notes: ''
  });

  const saveFormerMeritorious = (e) => {
    e.preventDefault();
    if (!formerMeritForm.name_bn.trim()) {
      alert('সাবেক কৃতি শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingFormerMeritId) {
      updated = formerMeritList.map(item => item.id === editingFormerMeritId ? { ...item, ...formerMeritForm } : item);
      showToast('সাবেক কৃতি শিক্ষার্থীর তথ্য আপডেট করা হয়েছে!');
    } else {
      const newItem = {
        ...formerMeritForm,
        id: 'fmerit-' + Date.now(),
        photo_url: formerMeritForm.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop'
      };
      updated = [newItem, ...formerMeritList];
      showToast('নতুন সাবেক কৃতি শিক্ষার্থী গ্যালারিতে যুক্ত হয়েছে!');
    }
    setFormerMeritList(updated);
    saveStoredFormerMeritorious(updated);
    setEditingFormerMeritId(null);
    setFormerMeritForm({
      name_bn: '',
      passing_year: '২০২৪',
      exam_result: 'এসএসসি ২০২৪ — গোল্ডেন জিপিএ ৫.০০',
      current_status: '',
      higher_education: '',
      photo_url: '',
      phone: '',
      notes: ''
    });
  };

  const editFormerMeritorious = (item) => {
    setEditingFormerMeritId(item.id);
    setFormerMeritForm({ ...item });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deleteFormerMeritorious = (id) => {
    if (!confirm('আপনি কি এই সাবেক কৃতি শিক্ষার্থীর রেকর্ড মুছে ফেলতে চান?')) return;
    const updated = formerMeritList.filter(item => item.id !== id);
    setFormerMeritList(updated);
    saveStoredFormerMeritorious(updated);
    showToast('সাবেক কৃতি শিক্ষার্থীর রেকর্ড মুছে ফেলা হয়েছে!');
  };

  // 5. Class Seats State & Settings
  const [classSeats, setClassSeats] = useState(getStoredClassSeats);
  const [editingClassId, setEditingClassId] = useState(null);
  const [seatForm, setSeatForm] = useState({
    capacity: 120,
    boys: 50,
    girls: 50,
    admission_status: 'চলমান'
  });

  const saveSeatConfig = (item) => {
    const updated = classSeats.map(cs => {
      if (cs.class_id === item.class_id) {
        const cap = parseInt(seatForm.capacity, 10) || cs.capacity;
        const b = parseInt(seatForm.boys, 10) || cs.boys;
        const g = parseInt(seatForm.girls, 10) || cs.girls;
        const total = b + g;
        const vac = Math.max(0, cap - total);
        return {
          ...cs,
          capacity: cap,
          boys: b,
          girls: g,
          enrolled: total,
          vacant: vac,
          admission_status: seatForm.admission_status || cs.admission_status
        };
      }
      return cs;
    });
    setClassSeats(updated);
    saveStoredClassSeats(updated);
    setEditingClassId(null);
    showToast('শ্রেণি ও আসন বিন্যাস সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  // Print helper with official header
  const printContent = (title, tableHtml) => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজার পপ-আপ অনুমোদন করুন।');
      return;
    }
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <title>${title} - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Segoe UI', Tahoma, sans-serif; padding: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px double #0284c7; padding-bottom: 12px; margin-bottom: 18px; }
          .header h1 { margin: 0; font-size: 24px; color: #15803d; }
          .header p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
          .report-title { text-align: center; font-size: 18px; font-weight: 800; margin-bottom: 16px; color: #0369a1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; color: #334155; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
          <p>স্থাপিত: ১৯৪৬ খ্রি. | ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল | EIIN: 114321</p>
        </div>
        <div class="report-title">${title}</div>
        ${tableHtml}
        <div class="footer">
          <div>শ্রেণি শিক্ষকের স্বাক্ষর</div>
          <div>সহকারী প্রধান শিক্ষকের স্বাক্ষর</div>
          <div>প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="student-master-admin-panel" style={{ paddingBottom: '40px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease'
        }}>
          <span>✅</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '14px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(3,105,161,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '36px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🎓</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>শিক্ষার্থীর তথ্য ব্যবস্থাপনা ও রেজিস্ট্রি</h2>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                অফিসিয়াল প্যানেল
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              অধ্যয়নরত শিক্ষার্থী, সরকারি বৃত্তি, উপবৃত্তি, কৃতি শিক্ষার্থী, শ্রেণি আসন ও স্মার্ট উপস্থিতির সমন্বিত ডাটা সেন্টার
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="mini"
            onClick={() => setPreviewModal({ key: 'public.nav.students.' + activeTab, title: 'ভিউপেজ প্রিভিউ: শিক্ষার্থীর তথ্য' })}
            style={{
              background: '#ffffff',
              color: '#0369a1',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            🌐 ভিউপেজে কেমন দেখায় (Live Preview)
          </button>
        </div>
      </div>

      {/* 7 Ordered Submenus Tab Bar */}
      <div style={{
        background: '#ffffff',
        padding: '8px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        {[
          { key: 'enrolled', label: '১. অধ্যয়নরত শিক্ষার্থী', icon: '👥' },
          { key: 'govt_scholarship', label: '২. সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থী', icon: '🎖️' },
          { key: 'stipend', label: '৩. উপবৃত্তি প্রাপ্ত শিক্ষার্থী', icon: '💳' },
          { key: 'meritorious', label: '৪. অধ্যয়নরত কৃতি শিক্ষার্থী', icon: '🏆' },
          { key: 'former_meritorious', label: '৫. সাবেক কৃতি শিক্ষার্থী', icon: '⭐' },
          { key: 'class_seats', label: '৬. শিক্ষার্থীর শ্রেণি ও আসন', icon: '🪑' },
          { key: 'attendance_records', label: '৭. শিক্ষার্থীর স্মার্ট উপস্থিতি ও রেকর্ড', icon: '🕘' }
        ].map(item => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabChange(item.key)}
              style={{
                flex: '1 1 auto',
                minWidth: '150px',
                padding: '11px 14px',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 3px 8px rgba(3,105,161,0.25)' : 'none'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: অধ্যয়নরত শিক্ষার্থী (Wraps StudentPanelComponent) */}
      {activeTab === 'enrolled' && (
        <div>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>ℹ️</span>
              <span style={{ fontSize: '13.5px', color: '#166534', fontWeight: 600 }}>
                অধ্যয়নরত সকল শিক্ষার্থীর ডাটাবেস, নতুন শিক্ষার্থী ভর্তি এন্ট্রি, আইডি কার্ড, প্রত্যয়ন ও প্রমোশন মডিউল।
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onNavigate && (
                <>
                  <button
                    type="button"
                    className="mini"
                    onClick={() => onNavigate('results', 'promotion')}
                    style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
                  >
                    📈 প্রমোশন ও SSC ফরমপূরণ ➔
                  </button>
                </>
              )}
            </div>
          </div>
          {StudentPanelComponent && <StudentPanelComponent sub={sub === 'new' ? 'new' : sub === 'csv' ? 'csv' : 'list'} />}
        </div>
      )}

      {/* TAB 2: সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থী */}
      {activeTab === 'govt_scholarship' && (
        <div className="module-grid">
          {/* Form Card */}
          <div className="form-card">
            <div className="toolbar">
              <div>
                <span className="eyebrow">GOVERNMENT SCHOLARSHIP</span>
                <h2>{editingGovtId ? 'বৃত্তি রেকর্ড সম্পাদনা' : 'নতুন সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থী যোগ'}</h2>
              </div>
              {editingGovtId && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    setEditingGovtId(null);
                    setGovtForm({
                      student_id: '',
                      name_bn: '',
                      roll_no: '',
                      class_name: '১০ম',
                      exam_type: '৮ম শ্রেণি মেধা বৃত্তি',
                      scholarship_type: 'ট্যালেন্টপুল বৃত্তি',
                      academic_year: '২০২৫',
                      amount: '৪,৫০০',
                      provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর, ঢাকা',
                      status: 'চলমান',
                      notes: ''
                    });
                  }}
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={saveGovtScholarship} className="form-grid">
              <input
                placeholder="শিক্ষার্থীর পূর্ণ নাম *"
                value={govtForm.name_bn}
                onChange={e => setGovtForm({ ...govtForm, name_bn: e.target.value })}
                required
              />
              <input
                placeholder="Student ID (যেমন: stu-10-sci-01)"
                value={govtForm.student_id}
                onChange={e => setGovtForm({ ...govtForm, student_id: e.target.value })}
              />
              <input
                placeholder="রোল নম্বর (যেমন: ০১)"
                value={govtForm.roll_no}
                onChange={e => setGovtForm({ ...govtForm, roll_no: e.target.value })}
              />
              <select
                value={govtForm.class_name}
                onChange={e => setGovtForm({ ...govtForm, class_name: e.target.value })}
              >
                <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম">৭ম শ্রেণি</option>
                <option value="৮ম">৮ম শ্রেণি</option>
                <option value="৯ম">৯ম শ্রেণি</option>
                <option value="১০ম">১০ম শ্রেণি</option>
              </select>

              <select
                value={govtForm.scholarship_type}
                onChange={e => setGovtForm({ ...govtForm, scholarship_type: e.target.value })}
              >
                <option value="ট্যালেন্টপুল বৃত্তি">ট্যালেন্টপুল বৃত্তি (Talentpool)</option>
                <option value="সাধারণ বৃত্তি">সাধারণ বৃত্তি (General)</option>
                <option value="মেধা বৃত্তি">বিশেষ মেধা বৃত্তি</option>
              </select>

              <input
                placeholder="বৃত্তি/পরীক্ষার নাম (যেমন: ৮ম শ্রেণি মেধা বৃত্তি)"
                value={govtForm.exam_type}
                onChange={e => setGovtForm({ ...govtForm, exam_type: e.target.value })}
              />
              <input
                placeholder="শিক্ষাবর্ষ (যেমন: ২০২৫)"
                value={govtForm.academic_year}
                onChange={e => setGovtForm({ ...govtForm, academic_year: e.target.value })}
              />
              <input
                placeholder="বার্ষিক অনুদানের পরিমাণ (টাকা)"
                value={govtForm.amount}
                onChange={e => setGovtForm({ ...govtForm, amount: e.target.value })}
              />
              <input
                placeholder="প্রদানকারী কর্তৃপক্ষ (যেমন: মাউশি, ঢাকা)"
                value={govtForm.provider}
                onChange={e => setGovtForm({ ...govtForm, provider: e.target.value })}
              />
              <select
                value={govtForm.status}
                onChange={e => setGovtForm({ ...govtForm, status: e.target.value })}
              >
                <option value="চলমান">চলমান</option>
                <option value="সমাপ্ত">সমাপ্ত/উত্তীর্ণ</option>
                <option value="অপেক্ষমাণ">অপেক্ষমাণ</option>
              </select>

              <textarea
                className="full"
                rows="2"
                placeholder="কৃতিত্ব ও বিশেষ মন্তব্য (ঐচ্ছিক)"
                value={govtForm.notes}
                onChange={e => setGovtForm({ ...govtForm, notes: e.target.value })}
              />

              <button type="submit" className="btn full" style={{ background: '#0284c7' }}>
                {editingGovtId ? '✓ তথ্য আপডেট করুন' : '➕ সরকারি বৃত্তি রেকর্ড সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          {/* Table Card */}
          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>সরকারি বৃত্তিপ্রাপ্ত শিক্ষার্থীর তালিকা</h2>
                <span>মোট: {govtScholarships.length} জন</span>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = govtScholarships.map((r, i) => `
                    <tr>
                      <td style="text-align:center;">${i + 1}</td>
                      <td><b>${r.name_bn}</b><br><small>${r.student_id || '—'}</small></td>
                      <td style="text-align:center;">শ্রেণি ${r.class_name} (রোল ${r.roll_no || '—'})</td>
                      <td><span style="color:#0284c7;font-weight:700;">${r.scholarship_type}</span><br><small>${r.exam_type}</small></td>
                      <td style="text-align:center;">${r.academic_year}</td>
                      <td style="text-align:center;font-weight:700;">৳ ${r.amount}</td>
                      <td style="text-align:center;">${r.status}</td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>ক্রম</th>
                          <th>শিক্ষার্থীর নাম</th>
                          <th>শ্রেণি ও রোল</th>
                          <th>বৃত্তির ক্যাটাগরি ও পরীক্ষা</th>
                          <th>শিক্ষাবর্ষ</th>
                          <th>অনুদান</th>
                          <th>অবস্থা</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printContent('সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থীদের অফিসিয়াল রেজিস্ট্রি', tableHtml);
                }}
                style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট / PDF রিপোর্ট
              </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                placeholder="শিক্ষার্থীর নাম / আইডি খুঁজুন..."
                value={govtSearch}
                onChange={e => setGovtSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <select value={govtFilterType} onChange={e => setGovtFilterType(e.target.value)}>
                <option value="all">সকল বৃত্তি ক্যাটাগরি</option>
                <option value="ট্যালেন্টপুল বৃত্তি">ট্যালেন্টপুল বৃত্তি</option>
                <option value="সাধারণ বৃত্তি">সাধারণ বৃত্তি</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শিক্ষার্থীর নাম ও আইডি</th>
                    <th>শ্রেণি ও রোল</th>
                    <th>বৃত্তির ধরন ও পরীক্ষা</th>
                    <th>শিক্ষাবর্ষ</th>
                    <th>টাকার পরিমাণ</th>
                    <th>স্ট্যাটাস</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {govtScholarships
                    .filter(item => {
                      if (govtFilterType !== 'all' && item.scholarship_type !== govtFilterType) return false;
                      if (!govtSearch) return true;
                      return [item.name_bn, item.student_id, item.roll_no, item.exam_type].filter(Boolean).join(' ').toLowerCase().includes(govtSearch.toLowerCase());
                    })
                    .map(item => (
                      <tr key={item.id}>
                        <td>
                          <b>{item.name_bn}</b>
                          {item.student_id && <small style={{ display: 'block', color: '#64748b' }}>{item.student_id}</small>}
                        </td>
                        <td>{item.class_name} (রোল {item.roll_no || '—'})</td>
                        <td>
                          <span style={{
                            background: item.scholarship_type.includes('ট্যালেন্টপুল') ? '#fef3c7' : '#e0f2fe',
                            color: item.scholarship_type.includes('ট্যালেন্টপুল') ? '#b45309' : '#0369a1',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {item.scholarship_type}
                          </span>
                          <small style={{ display: 'block', color: '#475569', marginTop: '2px' }}>{item.exam_type}</small>
                        </td>
                        <td>{item.academic_year}</td>
                        <td style={{ fontWeight: 700, color: '#047857' }}>৳ {item.amount}</td>
                        <td>
                          <span className={item.status === 'চলমান' ? 'status-green' : 'badge'}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="mini" onClick={() => editGovtScholarship(item)}>সম্পাদনা</button>
                          <button type="button" className="mini" style={{ color: '#dc2626' }} onClick={() => deleteGovtScholarship(item.id)}>মুছুন</button>
                        </td>
                      </tr>
                    ))}
                  {!govtScholarships.length && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '16px' }}>কোনো সরকারি বৃত্তির রেকর্ড পাওয়া যায়নি।</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: উপবৃত্তি প্রাপ্ত শিক্ষার্থী */}
      {activeTab === 'stipend' && (
        <div className="module-grid">
          {/* Form Card */}
          <div className="form-card">
            <div className="toolbar">
              <div>
                <span className="eyebrow">STIPEND BENEFICIARY MANAGEMENT</span>
                <h2>{editingStipendId ? 'উপবৃত্তি তথ্য সম্পাদনা' : 'নতুন উপবৃত্তি সুবিধাভোগী শিক্ষার্থী যোগ'}</h2>
              </div>
              {editingStipendId && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    setEditingStipendId(null);
                    setStipendForm({
                      student_id: '',
                      name_bn: '',
                      roll_no: '',
                      class_name: '৬ষ্ঠ',
                      section: 'ক শাখা',
                      guardian_name: '',
                      guardian_phone: '',
                      mfs_provider: 'নগদ',
                      mfs_account: '',
                      scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
                      academic_year: '২০২৬',
                      amount: '৩,০০০',
                      cycle: 'দ্বি-বার্ষিক',
                      status: 'অনুমোদিত ও সক্রিয়',
                      notes: ''
                    });
                  }}
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={saveStipendStudent} className="form-grid">
              <input
                placeholder="শিক্ষার্থীর পূর্ণ নাম *"
                value={stipendForm.name_bn}
                onChange={e => setStipendForm({ ...stipendForm, name_bn: e.target.value })}
                required
              />
              <input
                placeholder="Student ID (যেমন: stu-06-05)"
                value={stipendForm.student_id}
                onChange={e => setStipendForm({ ...stipendForm, student_id: e.target.value })}
              />
              <select
                value={stipendForm.class_name}
                onChange={e => setStipendForm({ ...stipendForm, class_name: e.target.value })}
              >
                <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম">৭ম শ্রেণি</option>
                <option value="৮ম">৮ম শ্রেণি</option>
                <option value="৯ম">৯ম শ্রেণি</option>
                <option value="১০ম">১০ম শ্রেণি</option>
              </select>
              <input
                placeholder="রোল নম্বর (যেমন: ০৫)"
                value={stipendForm.roll_no}
                onChange={e => setStipendForm({ ...stipendForm, roll_no: e.target.value })}
              />
              <input
                placeholder="অভিভাবকের নাম *"
                value={stipendForm.guardian_name}
                onChange={e => setStipendForm({ ...stipendForm, guardian_name: e.target.value })}
              />
              <input
                placeholder="অভিভাবকের মোবাইল নম্বর"
                value={stipendForm.guardian_phone}
                onChange={e => setStipendForm({ ...stipendForm, guardian_phone: e.target.value })}
              />
              <select
                value={stipendForm.mfs_provider}
                onChange={e => setStipendForm({ ...stipendForm, mfs_provider: e.target.value })}
              >
                <option value="নগদ">নগদ (Nagad)</option>
                <option value="বিকাশ">বিকাশ (bKash)</option>
                <option value="রকেট">রকেট (Rocket)</option>
                <option value="উপায়">উপায় (Upay)</option>
                <option value="ব্যাংক একাউন্ট">ব্যাংক একাউন্ট</option>
              </select>
              <input
                placeholder="MFS ওয়ালেট / হিসাব নম্বর *"
                value={stipendForm.mfs_account}
                onChange={e => setStipendForm({ ...stipendForm, mfs_account: e.target.value })}
              />
              <select
                value={stipendForm.scheme_name}
                onChange={e => setStipendForm({ ...stipendForm, scheme_name: e.target.value })}
              >
                <option value="সমন্বিত উপবৃত্তি কর্মসূচি (HSP)">সমন্বিত উপবৃত্তি কর্মসূচি (HSP)</option>
                <option value="প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট">প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট</option>
                <option value="বিদ্যালয় কল্যাণ তহবিল উপবৃত্তি">বিদ্যালয় কল্যাণ তহবিল উপবৃত্তি</option>
              </select>
              <input
                placeholder="শিক্ষাবর্ষ (যেমন: ২০২৬)"
                value={stipendForm.academic_year}
                onChange={e => setStipendForm({ ...stipendForm, academic_year: e.target.value })}
              />
              <input
                placeholder="উপবৃত্তির পরিমাণ (টাকা)"
                value={stipendForm.amount}
                onChange={e => setStipendForm({ ...stipendForm, amount: e.target.value })}
              />
              <select
                value={stipendForm.status}
                onChange={e => setStipendForm({ ...stipendForm, status: e.target.value })}
              >
                <option value="অনুমোদিত ও সক্রিয়">অনুমোদিত ও সক্রিয়</option>
                <option value="অপেক্ষমাণ">যাচাই ও অনুমোদনের অপেক্ষায়</option>
                <option value="স্থগিত">স্থগিত</option>
              </select>

              <textarea
                className="full"
                rows="2"
                placeholder="উপবৃত্তি সুবিধাভোগী কোড বা অতিরিক্ত মন্তব্য"
                value={stipendForm.notes}
                onChange={e => setStipendForm({ ...stipendForm, notes: e.target.value })}
              />

              <button type="submit" className="btn full" style={{ background: '#059669' }}>
                {editingStipendId ? '✓ উপবৃত্তি তথ্য আপডেট করুন' : '➕ উপবৃত্তি শিক্ষার্থী সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          {/* Table Card */}
          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>উপবৃত্তি প্রাপ্ত শিক্ষার্থীদের তালিকা</h2>
                <span>মোট: {stipendStudents.length} জন</span>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = stipendStudents.map((r, i) => `
                    <tr>
                      <td style="text-align:center;">${i + 1}</td>
                      <td><b>${r.name_bn}</b><br><small>${r.student_id || '—'}</small></td>
                      <td style="text-align:center;">শ্রেণি ${r.class_name} (রোল ${r.roll_no || '—'})</td>
                      <td>${r.guardian_name || '—'}<br><small>${r.guardian_phone || ''}</small></td>
                      <td><span style="font-weight:700;">${r.mfs_provider}:</span> ${r.mfs_account || '—'}</td>
                      <td>${r.scheme_name}</td>
                      <td style="text-align:center;font-weight:700;">৳ ${r.amount}</td>
                      <td style="text-align:center;">${r.status}</td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>ক্রম</th>
                          <th>শিক্ষার্থীর নাম</th>
                          <th>শ্রেণি ও রোল</th>
                          <th>অভিভাবক</th>
                          <th>MFS / ব্যাংক একাউন্ট</th>
                          <th>প্রকল্পের নাম</th>
                          <th>পরিমাণ</th>
                          <th>স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printContent('উপবৃত্তি প্রাপ্ত শিক্ষার্থীদের মাস্টার রোল ও পে-রোল তালিকা', tableHtml);
                }}
                style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট মাস্টার রোল
              </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                placeholder="শিক্ষার্থী / অভিভাবক / মোবাইল খুঁজুন..."
                value={stipendSearch}
                onChange={e => setStipendSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <select value={stipendClassFilter} onChange={e => setStipendClassFilter(e.target.value)}>
                <option value="all">সকল শ্রেণি</option>
                <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম">৭ম শ্রেণি</option>
                <option value="৮ম">৮ম শ্রেণি</option>
                <option value="৯ম">৯ম শ্রেণি</option>
                <option value="১০ম">১০ম শ্রেণি</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শিক্ষার্থীর নাম ও আইডি</th>
                    <th>শ্রেণি ও রোল</th>
                    <th>অভিভাবক ও মোবাইল</th>
                    <th>MFS গেটওয়ে</th>
                    <th>প্রকল্পের নাম</th>
                    <th>পরিমাণ</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {stipendStudents
                    .filter(item => {
                      if (stipendClassFilter !== 'all' && item.class_name !== stipendClassFilter) return false;
                      if (!stipendSearch) return true;
                      return [item.name_bn, item.student_id, item.guardian_name, item.guardian_phone, item.mfs_account].filter(Boolean).join(' ').toLowerCase().includes(stipendSearch.toLowerCase());
                    })
                    .map(item => (
                      <tr key={item.id}>
                        <td>
                          <b>{item.name_bn}</b>
                          {item.student_id && <small style={{ display: 'block', color: '#64748b' }}>{item.student_id}</small>}
                        </td>
                        <td>{item.class_name} (রোল {item.roll_no || '—'})</td>
                        <td>
                          {item.guardian_name || '—'}
                          <small style={{ display: 'block', color: '#64748b' }}>{item.guardian_phone}</small>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0369a1' }}>{item.mfs_provider}:</span> {item.mfs_account || '—'}
                        </td>
                        <td><small>{item.scheme_name}</small></td>
                        <td style={{ fontWeight: 700, color: '#047857' }}>৳ {item.amount}</td>
                        <td>
                          <button type="button" className="mini" onClick={() => editStipendStudent(item)}>সম্পাদনা</button>
                          <button type="button" className="mini" style={{ color: '#dc2626' }} onClick={() => deleteStipendStudent(item.id)}>মুছুন</button>
                        </td>
                      </tr>
                    ))}
                  {!stipendStudents.length && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '16px' }}>কোনো উপবৃত্তি রেকর্ড পাওয়া যায়নি।</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: অধ্যয়নরত কৃতি শিক্ষার্থী */}
      {activeTab === 'meritorious' && (
        <div className="module-grid">
          {/* Form Card */}
          <div className="form-card">
            <div className="toolbar">
              <div>
                <span className="eyebrow">HONOR ROLL & TALENT</span>
                <h2>{editingMeritId ? 'কৃতি শিক্ষার্থী সম্পাদনা' : 'নতুন কৃতি শিক্ষার্থী সম্মাননা এন্ট্রি'}</h2>
              </div>
              {editingMeritId && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    setEditingMeritId(null);
                    setMeritForm({
                      student_id: '',
                      name_bn: '',
                      roll_no: '',
                      class_name: '১০ম',
                      section: 'বিজ্ঞান বিভাগ',
                      category: 'বার্ষিক মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
                      academic_year: '২০২৫-২০২৬',
                      achievement_title: '',
                      photo_url: '',
                      notes: ''
                    });
                  }}
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={saveMeritoriousStudent} className="form-grid">
              <input
                placeholder="কৃতি শিক্ষার্থীর নাম *"
                value={meritForm.name_bn}
                onChange={e => setMeritForm({ ...meritForm, name_bn: e.target.value })}
                required
              />
              <input
                placeholder="Student ID (যেমন: stu-10-sci-01)"
                value={meritForm.student_id}
                onChange={e => setMeritForm({ ...meritForm, student_id: e.target.value })}
              />
              <select
                value={meritForm.class_name}
                onChange={e => setMeritForm({ ...meritForm, class_name: e.target.value })}
              >
                <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম">৭ম শ্রেণি</option>
                <option value="৮ম">৮ম শ্রেণি</option>
                <option value="৯ম">৯ম শ্রেণি</option>
                <option value="১০ম">১০ম শ্রেণি</option>
              </select>
              <input
                placeholder="রোল নম্বর (যেমন: ০১)"
                value={meritForm.roll_no}
                onChange={e => setMeritForm({ ...meritForm, roll_no: e.target.value })}
              />
              <input
                placeholder="বিভাগ/শাখা (যেমন: বিজ্ঞান বিভাগ)"
                value={meritForm.section}
                onChange={e => setMeritForm({ ...meritForm, section: e.target.value })}
              />
              <select
                value={meritForm.category}
                onChange={e => setMeritForm({ ...meritForm, category: e.target.value })}
              >
                <option value="বার্ষিক মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০">মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০</option>
                <option value="বিজ্ঞান ও গণিত অলিম্পিয়াড বিজয়ী">বিজ্ঞান ও গণিত অলিম্পিয়াড বিজয়ী</option>
                <option value="সাহিত্য, বিতর্ক ও আবৃত্তি চ্যাম্পিয়ন">সাহিত্য, বিতর্ক ও আবৃত্তি চ্যাম্পিয়ন</option>
                <option value="জাতীয় পর্যায়ে বিশেষ অর্জন">জাতীয় পর্যায়ে বিশেষ অর্জন</option>
                <option value="ভর্তি পরীক্ষায় সর্বোচ্চ নম্বর অর্জনকারী">ভর্তি পরীক্ষায় সর্বোচ্চ নম্বর অর্জনকারী</option>
              </select>
              <input
                placeholder="শিক্ষাবর্ষ / সেশন (যেমন: ২০২৫-২০২৬)"
                value={meritForm.academic_year}
                onChange={e => setMeritForm({ ...meritForm, academic_year: e.target.value })}
              />
              <input
                placeholder="ছবির লিংক বা URL (ঐচ্ছিক)"
                value={meritForm.photo_url}
                onChange={e => setMeritForm({ ...meritForm, photo_url: e.target.value })}
              />
              <input
                className="full"
                placeholder="বিশেষ অর্জনের বিবরণ ও পদকের নাম *"
                value={meritForm.achievement_title}
                onChange={e => setMeritForm({ ...meritForm, achievement_title: e.target.value })}
                required
              />
              <textarea
                className="full"
                rows="2"
                placeholder="অতিরিক্ত প্রশংসা ও বিবরণী"
                value={meritForm.notes}
                onChange={e => setMeritForm({ ...meritForm, notes: e.target.value })}
              />

              <button type="submit" className="btn full" style={{ background: '#b45309' }}>
                {editingMeritId ? '✓ সম্মাননা আপডেট করুন' : '🏆 কৃতি শিক্ষার্থী সম্মাননা তালিকায় যুক্ত করুন'}
              </button>
            </form>
          </div>

          {/* Table Card */}
          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>অধ্যয়নরত কৃতি শিক্ষার্থীদের তালিকা</h2>
                <span>মোট: {meritoriousList.length} জন</span>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = meritoriousList.map((r, i) => `
                    <tr>
                      <td style="text-align:center;">${i + 1}</td>
                      <td><b>${r.name_bn}</b><br><small>${r.student_id || '—'}</small></td>
                      <td style="text-align:center;">শ্রেণি ${r.class_name} (${r.section || '—'})</td>
                      <td><span style="color:#b45309;font-weight:700;">${r.category}</span></td>
                      <td><b>${r.achievement_title}</b></td>
                      <td style="text-align:center;">${r.academic_year}</td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>ক্রম</th>
                          <th>কৃতি শিক্ষার্থীর নাম</th>
                          <th>শ্রেণি ও বিভাগ</th>
                          <th>মেধার ক্যাটাগরি</th>
                          <th>বিশেষ অর্জন</th>
                          <th>সেশন</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printContent('মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — অধ্যয়নরত কৃতি শিক্ষার্থী সম্মাননা তালিকা', tableHtml);
                }}
                style={{ background: '#b45309', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট সম্মাননা তালিকা
              </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                placeholder="কৃতি শিক্ষার্থীর নাম / অর্জন খুঁজুন..."
                value={meritSearch}
                onChange={e => setMeritSearch(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শিক্ষার্থী</th>
                    <th>শ্রেণি ও বিভাগ</th>
                    <th>মেধার ক্যাটাগরি</th>
                    <th>বিশেষ অর্জন</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {meritoriousList
                    .filter(item => {
                      if (!meritSearch) return true;
                      return [item.name_bn, item.student_id, item.category, item.achievement_title].filter(Boolean).join(' ').toLowerCase().includes(meritSearch.toLowerCase());
                    })
                    .map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={item.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop'}
                              alt=""
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            <div>
                              <b>{item.name_bn}</b>
                              <small style={{ display: 'block', color: '#64748b' }}>রোল {item.roll_no || '—'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{item.class_name} ({item.section || '—'})</td>
                        <td>
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                            {item.category}
                          </span>
                        </td>
                        <td><b>{item.achievement_title}</b></td>
                        <td>
                          <button type="button" className="mini" onClick={() => editMeritoriousStudent(item)}>সম্পাদনা</button>
                          <button type="button" className="mini" style={{ color: '#dc2626' }} onClick={() => deleteMeritoriousStudent(item.id)}>মুছুন</button>
                        </td>
                      </tr>
                    ))}
                  {!meritoriousList.length && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>কোনো কৃতি শিক্ষার্থীর রেকর্ড নেই।</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: সাবেক কৃতি শিক্ষার্থী */}
      {activeTab === 'former_meritorious' && (
        <div className="module-grid">
          {/* Form Card */}
          <div className="form-card">
            <div className="toolbar">
              <div>
                <span className="eyebrow">ALUMNI WALL OF FAME</span>
                <h2>{editingFormerMeritId ? 'সাবেক কৃতি শিক্ষার্থী সম্পাদনা' : 'নতুন সাবেক কৃতি শিক্ষার্থী যোগ'}</h2>
              </div>
              {editingFormerMeritId && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    setEditingFormerMeritId(null);
                    setFormerMeritForm({
                      name_bn: '',
                      passing_year: '২০২৪',
                      exam_result: 'এসএসসি ২০২৪ — গোল্ডেন জিপিএ ৫.০০',
                      current_status: '',
                      higher_education: '',
                      photo_url: '',
                      phone: '',
                      notes: ''
                    });
                  }}
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={saveFormerMeritorious} className="form-grid">
              <input
                placeholder="সাবেক শিক্ষার্থীর নাম *"
                value={formerMeritForm.name_bn}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, name_bn: e.target.value })}
                required
              />
              <input
                placeholder="এসএসসি পাসের বছর (যেমন: ২০১৮) *"
                value={formerMeritForm.passing_year}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, passing_year: e.target.value })}
                required
              />
              <input
                className="full"
                placeholder="পরীক্ষার ফলাফল (যেমন: এসএসসি ২০১৮ — গোল্ডেন জিপিএ ৫.০০) *"
                value={formerMeritForm.exam_result}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, exam_result: e.target.value })}
                required
              />
              <input
                className="full"
                placeholder="উচ্চশিক্ষা প্রতিষ্ঠান (যেমন: বুয়েট সিএসই / ঢামেক এমবিবিএস / ঢাবি)"
                value={formerMeritForm.higher_education}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, higher_education: e.target.value })}
              />
              <input
                className="full"
                placeholder="বর্তমান পেশা বা পদবী (যেমন: সফটওয়্যার ইঞ্জিনিয়ার, স্যামসাং আরঅ্যান্ডডি)"
                value={formerMeritForm.current_status}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, current_status: e.target.value })}
              />
              <input
                placeholder="ছবির লিংক বা URL (ঐচ্ছিক)"
                value={formerMeritForm.photo_url}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, photo_url: e.target.value })}
              />
              <input
                placeholder="যোগাযোগ / মোবাইল নম্বর"
                value={formerMeritForm.phone}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, phone: e.target.value })}
              />
              <textarea
                className="full"
                rows="2"
                placeholder="অনুপ্রেরণামূলক বার্তা বা স্কুলের অবদান"
                value={formerMeritForm.notes}
                onChange={e => setFormerMeritForm({ ...formerMeritForm, notes: e.target.value })}
              />

              <button type="submit" className="btn full" style={{ background: '#7c3aed' }}>
                {editingFormerMeritId ? '✓ সাবেক কৃতি শিক্ষার্থী আপডেট করুন' : '⭐ সাবেক কৃতি শিক্ষার্থী গ্যালারিতে যোগ করুন'}
              </button>
            </form>
          </div>

          {/* Table Card */}
          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>সাবেক কৃতি শিক্ষার্থীদের গৌরবোজ্জ্বল তালিকা</h2>
                <span>মোট: {formerMeritList.length} জন</span>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = formerMeritList.map((r, i) => `
                    <tr>
                      <td style="text-align:center;">${i + 1}</td>
                      <td><b>${r.name_bn}</b></td>
                      <td style="text-align:center;">${r.passing_year}</td>
                      <td><span style="color:#7c3aed;font-weight:700;">${r.exam_result}</span></td>
                      <td>${r.higher_education || '—'}</td>
                      <td><b>${r.current_status || '—'}</b></td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>ক্রম</th>
                          <th>সাবেক কৃতি শিক্ষার্থীর নাম</th>
                          <th>পাসের বছর</th>
                          <th>ফলাফল</th>
                          <th>উচ্চশিক্ষা</th>
                          <th>বর্তমান পেশা/অবস্থান</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printContent('মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — সাবেক কৃতি শিক্ষার্থী অ্যালামনাই রেজিস্ট্রি', tableHtml);
                }}
                style={{ background: '#7c3aed', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট অ্যালামনাই তালিকা
              </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                placeholder="সাবেক কৃতি শিক্ষার্থী / প্রতিষ্ঠান খুঁজুন..."
                value={formerMeritSearch}
                onChange={e => setFormerMeritSearch(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>সাবেক শিক্ষার্থী</th>
                    <th>পাসের সাল ও ফলাফল</th>
                    <th>উচ্চশিক্ষা</th>
                    <th>বর্তমান অবস্থান</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {formerMeritList
                    .filter(item => {
                      if (!formerMeritSearch) return true;
                      return [item.name_bn, item.passing_year, item.exam_result, item.higher_education, item.current_status].filter(Boolean).join(' ').toLowerCase().includes(formerMeritSearch.toLowerCase());
                    })
                    .map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={item.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop'}
                              alt=""
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            <b>{item.name_bn}</b>
                          </div>
                        </td>
                        <td>
                          <b>ব্যাচ {item.passing_year}</b>
                          <small style={{ display: 'block', color: '#7c3aed' }}>{item.exam_result}</small>
                        </td>
                        <td>{item.higher_education || '—'}</td>
                        <td><b>{item.current_status || '—'}</b></td>
                        <td>
                          <button type="button" className="mini" onClick={() => editFormerMeritorious(item)}>সম্পাদনা</button>
                          <button type="button" className="mini" style={{ color: '#dc2626' }} onClick={() => deleteFormerMeritorious(item.id)}>মুছুন</button>
                        </td>
                      </tr>
                    ))}
                  {!formerMeritList.length && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>কোনো সাবেক কৃতি শিক্ষার্থীর রেকর্ড নেই।</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: শিক্ষার্থীর শ্রেণি ও আসন */}
      {activeTab === 'class_seats' && (
        <div>
          {/* Summary Stats */}
          <div className="stats" style={{ marginBottom: '20px' }}>
            <div>
              <b>{classSeats.reduce((acc, c) => acc + (c.capacity || 0), 0)}</b>
              <span>মোট অনুমোদিত আসন</span>
            </div>
            <div>
              <b style={{ color: '#0369a1' }}>{classSeats.reduce((acc, c) => acc + (c.enrolled || 0), 0)}</b>
              <span>ভর্তিকৃত শিক্ষার্থী</span>
            </div>
            <div>
              <b style={{ color: '#059669' }}>{classSeats.reduce((acc, c) => acc + (c.boys || 0), 0)}</b>
              <span>ছাত্র সংখ্যা</span>
            </div>
            <div>
              <b style={{ color: '#d97706' }}>{classSeats.reduce((acc, c) => acc + (c.girls || 0), 0)}</b>
              <span>ছাত্রী সংখ্যা</span>
            </div>
            <div>
              <b style={{ color: '#dc2626' }}>{classSeats.reduce((acc, c) => acc + (c.vacant || 0), 0)}</b>
              <span>অবশিষ্ট খালি আসন</span>
            </div>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>শ্রেণি ও শাখাভিত্তিক আসন বণ্টন ও ক্যাপাসিটি</h2>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                  ৬ষ্ঠ থেকে ১০ম শ্রেণি পর্যন্ত প্রতিটি শ্রেণির অনুমোদিত ধারণক্ষমতা ও ভর্তি পরিসংখ্যান
                </p>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = classSeats.map(c => `
                    <tr>
                      <td style="font-weight:700;">${c.class_name}</td>
                      <td>${c.sections}</td>
                      <td style="text-align:center;font-weight:700;">${c.capacity}</td>
                      <td style="text-align:center;">${c.boys}</td>
                      <td style="text-align:center;">${c.girls}</td>
                      <td style="text-align:center;font-weight:700;color:#0369a1;">${c.enrolled}</td>
                      <td style="text-align:center;font-weight:700;color:#dc2626;">${c.vacant}</td>
                      <td style="text-align:center;">${c.admission_status}</td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>শ্রেণি</th>
                          <th>শাখা / বিভাগ</th>
                          <th>অনুমোদিত আসন</th>
                          <th>ছাত্র</th>
                          <th>ছাত্রী</th>
                          <th>মোট শিক্ষার্থী</th>
                          <th>খালি আসন</th>
                          <th>ভর্তি অবস্থা</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printContent('মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — শ্রেণি ও আসন ধারণক্ষমতা রিপোর্ট', tableHtml);
                }}
                style={{ background: '#0284c7', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট আসন রিপোর্ট
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি</th>
                    <th>শাখা / বিভাগ</th>
                    <th>অনুমোদিত আসন</th>
                    <th>ছাত্র</th>
                    <th>ছাত্রী</th>
                    <th>মোট ভর্তি</th>
                    <th>খালি আসন</th>
                    <th>ভর্তি অবস্থা</th>
                    <th>সেটিংস</th>
                  </tr>
                </thead>
                <tbody>
                  {classSeats.map(item => {
                    const isEditing = editingClassId === item.class_id;
                    const percent = Math.round(((item.enrolled || 0) / (item.capacity || 1)) * 100);
                    return (
                      <tr key={item.class_id}>
                        <td style={{ fontWeight: 700 }}>{item.class_name}</td>
                        <td>{item.sections}</td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={seatForm.capacity}
                              onChange={e => setSeatForm({ ...seatForm, capacity: e.target.value })}
                              style={{ width: '80px', padding: '4px' }}
                            />
                          ) : (
                            <b style={{ fontSize: '15px' }}>{item.capacity}</b>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={seatForm.boys}
                              onChange={e => setSeatForm({ ...seatForm, boys: e.target.value })}
                              style={{ width: '65px', padding: '4px' }}
                            />
                          ) : (
                            <span>{item.boys}</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={seatForm.girls}
                              onChange={e => setSeatForm({ ...seatForm, girls: e.target.value })}
                              style={{ width: '65px', padding: '4px' }}
                            />
                          ) : (
                            <span>{item.girls}</span>
                          )}
                        </td>
                        <td>
                          <b style={{ color: '#0369a1' }}>{item.enrolled}</b>
                          <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '4px', height: '6px', marginTop: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, percent)}%`, background: percent >= 95 ? '#dc2626' : '#0284c7', height: '100%' }} />
                          </div>
                        </td>
                        <td style={{ fontWeight: 800, color: item.vacant > 0 ? '#059669' : '#dc2626' }}>
                          {item.vacant} টি
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              value={seatForm.admission_status}
                              onChange={e => setSeatForm({ ...seatForm, admission_status: e.target.value })}
                              style={{ width: '130px', padding: '4px' }}
                            />
                          ) : (
                            <span className="badge">{item.admission_status}</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button type="button" className="mini" style={{ background: '#047857', color: '#fff' }} onClick={() => saveSeatConfig(item)}>সংরক্ষণ</button>
                              <button type="button" className="mini" onClick={() => setEditingClassId(null)}>বাতিল</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="mini"
                              onClick={() => {
                                setEditingClassId(item.class_id);
                                setSeatForm({
                                  capacity: item.capacity,
                                  boys: item.boys,
                                  girls: item.girls,
                                  admission_status: item.admission_status
                                });
                              }}
                            >
                              ⚙️ পরিবর্তন
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: শিক্ষার্থীর স্মার্ট উপস্থিতি ও রেকর্ড */}
      {activeTab === 'attendance_records' && (
        <div>
          {/* Action cards & KPI */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(6,78,59,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>🕘</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>শিক্ষার্থী স্মার্ট উপস্থিতি কন্ট্রোল ও লাইভ রেকর্ড</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', opacity: 0.9 }}>
                    ডিজিটাল বায়োমেট্রিক ও শ্রেণি শিক্ষক কর্তৃক ইনপুটকৃত প্রতিদিনের শিক্ষার্থী উপস্থিতির রিয়েল-টাইম পরিসংখ্যান
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {onNavigate && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance', 'daily')}
                    style={{
                      background: '#ffffff',
                      color: '#064e3b',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '13px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    📝 আজ উপস্থিত নিন (Daily Attendance) ➔
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance', 'reports')}
                    style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    📊 উপস্থিতি রিপোর্ট ও নোটিফিকেশন ➔
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="stats" style={{ marginBottom: '20px' }}>
            <div>
              <b style={{ color: '#047857' }}>৯৬.৫%</b>
              <span>আজকের উপস্থিতি হার</span>
            </div>
            <div>
              <b style={{ color: '#0284c7' }}>৫৮৭ জন</b>
              <span>আজ উপস্থিত শিক্ষার্থী</span>
            </div>
            <div>
              <b style={{ color: '#dc2626' }}>২১ জন</b>
              <span>অনুপস্থিত শিক্ষার্থী</span>
            </div>
            <div>
              <b style={{ color: '#d97706' }}>০ জন</b>
              <span>ছুটিতে শিক্ষার্থী</span>
            </div>
          </div>

          {/* Class Attendance Breakdown Table */}
          <div className="table-card">
            <div className="toolbar">
              <h2>আজকের শ্রেণিভিত্তিক শিক্ষার্থী উপস্থিতি বিবরণী</h2>
              <span className="badge">সরাসরি রিয়েল-টাইম তথ্য</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি</th>
                    <th>মোট শিক্ষার্থী</th>
                    <th>আজকের উপস্থিত</th>
                    <th>অনুপস্থিত</th>
                    <th>উপস্থিতির হার (%)</th>
                    <th>স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c: '৬ষ্ঠ শ্রেণি', total: 110, present: 107, absent: 3, rate: '৯৭.২%' },
                    { c: '৭ম শ্রেণি', total: 107, present: 103, absent: 4, rate: '৯৬.২%' },
                    { c: '৮ম শ্রেণি', total: 103, present: 100, absent: 3, rate: '৯৭.০%' },
                    { c: '৯ম শ্রেণি', total: 130, present: 124, absent: 6, rate: '৯৫.৩%' },
                    { c: '১০ম শ্রেণি', total: 138, present: 133, absent: 5, rate: '৯৬.৩%' }
                  ].map(row => (
                    <tr key={row.c}>
                      <td style={{ fontWeight: 700 }}>{row.c}</td>
                      <td><b>{row.total}</b> জন</td>
                      <td style={{ color: '#047857', fontWeight: 700 }}>{row.present} জন</td>
                      <td style={{ color: '#dc2626', fontWeight: 700 }}>{row.absent} জন</td>
                      <td>
                        <b>{row.rate}</b>
                        <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ width: row.rate.replace('%', '') + '%', background: '#059669', height: '100%' }} />
                        </div>
                      </td>
                      <td><span className="status-green">✓ সন্তোষজনক</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewModal && (
        <SubmenuDetailModal
          menuKey={previewModal.key}
          title={previewModal.title}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
}
