import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_SCHOOL, getStudentPhoto } from './mockData';
import { DEFAULT_CLASS_TEACHERS } from './FinancePanel';
import { requestApi } from './apiClient';
import schoolLogo from '../public/school-logo.png';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

// Bengali Digits & Helpers
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBnDigits = (num) => {
  if (num === null || num === undefined || num === '') return '০';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export const formatMoney = (amount) => {
  const val = Number(amount) || 0;
  return `৳ ${toBnDigits(val.toLocaleString('en-US'))}`;
};

export const formatDateBn = (dateStr) => {
  if (!dateStr) return '—';
  const clean = String(dateStr).slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return toBnDigits(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return toBnDigits(clean);
};

export function AdmissionPanel({ sub }) {
  // Navigation tabs:
  // applications | head_approval | teacher_enrollment | admitted_list | fees
  const [activeTab, setActiveTab] = useState(() => {
    if (sub === 'head_approval' || sub === 'selection') return 'head_approval';
    if (sub === 'teacher_enrollment' || sub === 'test') return 'teacher_enrollment';
    if (sub === 'admitted_list') return 'admitted_list';
    if (sub === 'fees') return 'fees';
    return 'applications';
  });

  useEffect(() => {
    if (sub === 'head_approval' || sub === 'selection') setActiveTab('head_approval');
    else if (sub === 'teacher_enrollment' || sub === 'test') setActiveTab('teacher_enrollment');
    else if (sub === 'admitted_list') setActiveTab('admitted_list');
    else if (sub === 'fees') setActiveTab('fees');
    else if (sub === 'applications') setActiveTab('applications');
  }, [sub]);

  // Main state
  const [apps, setApps] = useState([]);
  const [summary, setSummary] = useState({ total: 0, submitted: 0, under_review: 0, head_approved: 0, admitted: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'success' });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');

  // Modals state
  const [inspectModalApp, setInspectModalApp] = useState(null);
  const [enrollModalApp, setEnrollModalApp] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    roll_no: '',
    section: 'পদ্মা',
    department: 'বিজ্ঞান',
    student_id: '',
    teacher_name: ''
  });

  // Class Teachers resolution
  const [classTeachers, setClassTeachers] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_class_teachers_config');
      return saved ? JSON.parse(saved) : DEFAULT_CLASS_TEACHERS;
    } catch {
      return DEFAULT_CLASS_TEACHERS;
    }
  });

  // Fetch applications & summary
  const loadData = async () => {
    setLoading(true);
    try {
      let q = `/admissions?academic_year=${selectedYear}`;
      if (searchQuery.trim()) q += `&q=${encodeURIComponent(searchQuery.trim())}`;
      if (selectedClass !== 'all') q += `&applied_class=${encodeURIComponent(selectedClass)}`;
      if (selectedStatus !== 'all') q += `&status=${encodeURIComponent(selectedStatus)}`;
      if (selectedPaymentStatus !== 'all') q += `&payment_status=${encodeURIComponent(selectedPaymentStatus)}`;
      
      const list = await requestApi(q);
      setApps(Array.isArray(list) ? list : []);

      const sum = await requestApi(`/admissions/summary?academic_year=${selectedYear}`);
      if (sum) setSummary(sum);
    } catch (err) {
      setMsg({ text: 'তথ্য লোড করতে ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedYear, selectedClass, selectedStatus, selectedPaymentStatus]);

  // Status Labels and Colors
  const STATUS_CONFIG = {
    submitted: { label: 'নতুন জমা', bg: '#e0f2fe', color: '#0369a1', icon: '📩' },
    under_review: { label: 'পর্যালোচনায়', bg: '#fef3c7', color: '#92400e', icon: '🔍' },
    head_approved: { label: 'প্রধান শিক্ষক অনুমোদিত', bg: '#dcfce7', color: '#15803d', icon: '✓' },
    selected: { label: 'নির্বাচিত', bg: '#dcfce7', color: '#15803d', icon: '✓' },
    admitted: { label: 'চূড়ান্ত ভর্তি সম্পন্ন', bg: '#ecfdf5', color: '#065f46', icon: '🎓' },
    rejected: { label: 'বাতিলকৃত', bg: '#fee2e2', color: '#b91c1c', icon: '✕' }
  };

  // Payment Status Config
  const PAYMENT_CONFIG = {
    paid: { label: 'পরিশোধিত', bg: '#dcfce7', color: '#166534', icon: '✓' },
    partial: { label: 'আংশিক', bg: '#fef3c7', color: '#b45309', icon: '⏳' },
    unpaid: { label: 'অপরিশোধিত', bg: '#fee2e2', color: '#991b1b', icon: '✕' }
  };

  // Filtered lists for distinct tabs
  const pendingHeadApprovalApps = useMemo(() => {
    return apps.filter(a => a.status === 'submitted' || a.status === 'under_review');
  }, [apps]);

  const approvedPendingEnrollmentApps = useMemo(() => {
    return apps.filter(a => a.status === 'head_approved' || a.status === 'selected');
  }, [apps]);

  const fullyAdmittedApps = useMemo(() => {
    return apps.filter(a => a.status === 'admitted');
  }, [apps]);

  // Class teacher helper for a specific class
  const getTeacherForClass = (cls) => {
    const key = String(cls);
    const assigned = classTeachers[key] || DEFAULT_CLASS_TEACHERS[key];
    return assigned ? assigned.teacher_name : 'শ্রেণি শিক্ষক';
  };

  // 1. ACTION: Headmaster Approval
  const handleHeadmasterApprove = async (app) => {
    const remarks = window.prompt(
      `"${app.applicant_name_bn}" এর ভর্তি আবেদন অনুমোদন করতে চান?\nঅনুমোদন মন্তব্য (ঐচ্ছিক):`,
      'যাবতীয় তথ্য, অনলাইন ফি ও কাগজপত্র নিরীক্ষা সাপেক্ষে ভর্তির চূড়ান্ত অনুমোদন প্রদান করা হলো।'
    );
    if (remarks === null) return; // user cancelled

    try {
      await requestApi(`/admissions/${app.id}/head_approve`, {
        method: 'POST',
        body: JSON.stringify({
          approved_by: MOCK_SCHOOL.headTeacher || 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
          remarks: remarks.trim()
        })
      });
      setMsg({ text: `✓ আবেদনকারী "${app.applicant_name_bn}" এর ভর্তি আবেদন প্রধান শিক্ষক কর্তৃক অনুমোদিত হয়েছে। এখন শ্রেণি শিক্ষক তাকে ক্লাসে অন্তর্ভুক্ত করতে পারবেন।`, type: 'success' });
      setInspectModalApp(null);
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4500);
    } catch (err) {
      alert('অনুমোদনে সমস্যা: ' + err.message);
    }
  };

  // 2. ACTION: Headmaster Rejection
  const handleHeadmasterReject = async (app) => {
    const reason = window.prompt(`"${app.applicant_name_bn}" এর আবেদন বাতিল করার কারণ লিখুন:`, 'কাগজপত্রে অসঙ্গতি বা বয়স সংক্রান্ত ত্রুটি');
    if (!reason || !reason.trim()) return;

    try {
      await requestApi(`/admissions/${app.id}/head_reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() })
      });
      setMsg({ text: `আবেদনকারী "${app.applicant_name_bn}" এর আবেদন বাতিল করা হয়েছে।`, type: 'error' });
      setInspectModalApp(null);
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4500);
    } catch (err) {
      alert('বাতিল করতে সমস্যা: ' + err.message);
    }
  };

  // 3. ACTION: Open Class Teacher Enrollment Modal
  const handleOpenEnrollModal = async (app) => {
    const targetClass = app.applied_class || '৬';
    const teacherName = getTeacherForClass(targetClass);

    // Fetch existing students of targetClass to calculate next available roll
    let nextRoll = 1;
    try {
      const classStudents = await requestApi(`/students?class_name=${encodeURIComponent(targetClass)}`);
      if (Array.isArray(classStudents) && classStudents.length > 0) {
        const maxRoll = classStudents.reduce((max, s) => Math.max(max, Number(s.roll_no) || 0), 0);
        nextRoll = maxRoll + 1;
      }
    } catch {
      nextRoll = 1;
    }

    const yr = app.academic_year || '2026';
    const autoId = `MPUHS-${yr}-${targetClass}${String(nextRoll).padStart(2, '0')}`;
    const defaultDept = ['9', '10'].includes(String(targetClass)) ? (app.department || 'বিজ্ঞান') : 'সাধারণ';

    setEnrollForm({
      roll_no: String(nextRoll),
      section: app.section || 'পদ্মা',
      department: defaultDept,
      student_id: autoId,
      teacher_name: teacherName
    });
    setEnrollModalApp(app);
  };

  // 4. ACTION: Class Teacher Confirm Enrollment
  const handleConfirmEnrollment = async (e) => {
    e.preventDefault();
    if (!enrollModalApp) return;

    if (!enrollForm.roll_no || !enrollForm.roll_no.trim()) {
      alert('অনুগ্রহ করে ক্লাসের রোল নম্বর প্রদান করুন।');
      return;
    }

    try {
      const res = await requestApi(`/admissions/${enrollModalApp.id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({
          class_name: enrollModalApp.applied_class,
          roll_no: enrollForm.roll_no,
          section: enrollForm.section,
          department: enrollForm.department,
          student_id: enrollForm.student_id,
          teacher_name: enrollForm.teacher_name
        })
      });

      setMsg({
        text: `🎉 অভিনন্দন! শ্রেণি শিক্ষক কর্তৃক "${enrollModalApp.applicant_name_bn}" সফলভাবে ${enrollModalApp.applied_class}ম শ্রেণিতে অন্তর্ভুক্ত ও ভর্তি সম্পন্ন হয়েছে! রোল: ${toBnDigits(enrollForm.roll_no)}, শাখা: ${enrollForm.section}, আইডি: ${enrollForm.student_id}`,
        type: 'success'
      });
      setEnrollModalApp(null);
      setInspectModalApp(null);
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 6000);
    } catch (err) {
      alert('ভর্তি প্রক্রিয়ায় ত্রুটি: ' + err.message);
    }
  };

  // 5. ACTION: Print Approved Admission List / Full Register
  const handlePrintAdmissionRegister = (type = 'all') => {
    const w = window.open('', '_blank', 'width=1150,height=900');
    if (!w) {
      alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে ব্রাউজারের পপআপ অনুমতি দিন।');
      return;
    }
    const school = MOCK_SCHOOL;
    const isApprovedList = type === 'approved';
    const isEnrolledList = type === 'enrolled';
    
    let targetList = apps;
    let titleText = 'শিক্ষার্থী অনলাইন ভর্তি আবেদন রেজিস্টার';
    if (isApprovedList) {
      targetList = apps.filter(a => a.status === 'head_approved' || a.status === 'selected' || a.status === 'admitted');
      titleText = 'প্রধান শিক্ষক কর্তৃক অনুমোদিত ভর্তি মেধা ও নির্বাচন তালিকা';
    } else if (isEnrolledList) {
      targetList = fullyAdmittedApps;
      titleText = 'শ্রেণি শিক্ষক কর্তৃক চূড়ান্ত ভর্তিকৃত শিক্ষার্থীদের অফিশিয়াল রেজিস্টার';
    }

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${titleText} - ${school.nameBn}</title>
        <style>
          ${SCHOOL_PAD_STYLES}

          @page { size: A4 portrait; margin: 12mm 10mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 15px; font-size: 11px; color: #0f172a; margin: 0; }
          .no-print { background: #f0fdf4; border: 1.5px solid #059669; border-radius: 8px; padding: 10px 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
          .btn-group { display: flex; gap: 8px; }
          .btn { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
          .btn-print { background: #047857; color: #fff; }
          .btn-close { background: #e2e8f0; color: #334155; }
          @media print { .no-print { display: none !important; } body { padding: 0; } }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 21px; color: #047857; font-weight: 900; }
          .header p { margin: 2px 0; font-size: 11px; color: #475569; }
          .title-box { background: #f0fdf4; border: 1.5px solid #059669; border-radius: 6px; padding: 6px 12px; margin: 8px auto; display: inline-block; }
          .title-box h2 { margin: 0; font-size: 14px; color: #047857; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #475569; padding: 5px 7px; vertical-align: middle; }
          th { background: #e2e8f0; font-weight: 700; text-align: left; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 20px; page-break-inside: avoid; }
          .sig-box { width: 180px; text-align: center; border-top: 1px dashed #334155; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>
            <b>📑 ${titleText}</b>
            <div style="font-size:11px;color:#64748b">PDF সংরক্ষণ করতে 'Save as PDF' নির্বাচন করুন।</div>
          </div>
          <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ প্রিন্ট / Save as PDF</button>
            <button onclick="window.close()" class="btn btn-close">✕ বন্ধ করুন</button>
          </div>
        </div>

        <div class="header" style="border-bottom:none; margin-bottom:0; padding-bottom:0;">
          ${SCHOOL_PAD_HEADER_HTML}
          <div class="title-box">
            <h2>${toBnDigits(selectedYear)} শিক্ষাবর্ষে ${titleText}</h2>
          </div>
          <p>তারিখ: ${formatDateBn(new Date().toISOString().slice(0, 10))} খ্রি. • মোট শিক্ষার্থী: ${toBnDigits(targetList.length)} জন</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;" class="text-center">ক্র.</th>
              <th style="width: 85px;">আবেদন নং</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="width: 50px;" class="text-center">শ্রেণি</th>
              <th style="width: 50px;" class="text-center">রোল</th>
              <th style="width: 60px;" class="text-center">শাখা</th>
              <th style="width: 110px;">পিতা / অভিভাবক</th>
              <th style="width: 95px;">মোবাইল</th>
              <th style="width: 70px;" class="text-center">ফি স্থিতি</th>
              <th style="width: 90px;" class="text-center">ভর্তি স্থিতি</th>
            </tr>
          </thead>
          <tbody>
            ${targetList.map((a, idx) => `
              <tr>
                <td class="text-center">${toBnDigits(idx + 1)}</td>
                <td style="font-family:monospace;font-weight:700;color:#047857">${a.application_no}</td>
                <td>
                  <b>${a.applicant_name_bn}</b>
                  ${a.enrolled_student_id ? `<br/><small style="color:#0369a1;font-family:monospace">ID: ${a.enrolled_student_id}</small>` : ''}
                </td>
                <td class="text-center"><b>${toBnDigits(a.applied_class)}ম</b></td>
                <td class="text-center" style="font-weight:700;color:#047857">${a.enrolled_roll_no ? toBnDigits(a.enrolled_roll_no) : '—'}</td>
                <td class="text-center">${a.enrolled_section || a.section || '—'}</td>
                <td>${a.guardian_name || a.father_name || '—'}</td>
                <td>${a.guardian_phone || '—'}</td>
                <td class="text-center" style="color:${a.payment_status === 'paid' ? '#047857' : '#b91c1c'};font-weight:700">
                  ${a.payment_status === 'paid' ? 'পরিশোধিত' : 'বাকি'}
                </td>
                <td class="text-center" style="font-weight:700;color:${a.status === 'admitted' ? '#065f46' : '#15803d'}">
                  ${a.status === 'admitted' ? 'ভর্তি সম্পন্ন' : a.status === 'head_approved' ? 'প্রধান শিক্ষক অনুমোদিত' : 'নতুন আবেদন'}
                </td>
              </tr>
            `).join('')}
            ${!targetList.length ? `<tr><td colspan="10" class="text-center" style="padding:15px;color:#64748b">কোনো আবেদন তথ্য পাওয়া যায়নি।</td></tr>` : ''}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <b>হিসাব সহকারী / ভর্তি সহকারী</b>
            <div style="font-size: 10px; color: #64748b;">ভর্তি তথ্য কেন্দ্র</div>
          </div>
          <div class="sig-box">
            <b>সংশ্লিষ্ট শ্রেণি শিক্ষক</b>
            <div style="font-size: 10px; color: #64748b;">শ্রেণি প্রশাসন ও রোল বরাদ্দ</div>
          </div>
          <div class="sig-box">
            <b>${school.headTeacher || 'মুহাম্মদ শফিকুল ইসলাম'}</b>
            <div style="font-size: 10px; color: #64748b;">প্রধান শিক্ষক ও সদস্য সচিব</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="admission-panel-container" style={{ padding: '4px 0 30px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0d9488 100%)',
        borderRadius: '14px', padding: '20px 24px', color: '#fff', marginBottom: '20px',
        boxShadow: '0 4px 15px rgba(4,120,87,0.25)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: 700 }}>
              ONLINE ADMISSION MANAGEMENT & AUTOMATED ENROLLMENT ERP
            </span>
            <h1 style={{ margin: '4px 0 4px', fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎓</span> আধুনিক অনলাইন শিক্ষার্থী ভর্তি ব্যবস্থাপনা
            </h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.95 }}>
              শিক্ষার্থী ঘরে বসে আবেদন ও ফি পরিশোধ, প্রধান শিক্ষকের স্ক্রুটিনি ও অনুমোদন, এবং শ্রেণি শিক্ষক কর্তৃক স্বয়ংক্রিয় ক্লাসে অন্তর্ভুক্তি।
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handlePrintAdmissionRegister('all')}
              style={{
                background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff', padding: '7px 14px', borderRadius: '7px', fontWeight: 700,
                fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🖨️ আবেদন রেজিস্টার প্রিন্ট
            </button>
            <button
              type="button"
              onClick={() => handlePrintAdmissionRegister('approved')}
              style={{
                background: '#facc15', border: 'none', color: '#0f172a', padding: '7px 14px',
                borderRadius: '7px', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              📜 অনুমোদিত মেধা তালিকা PDF
            </button>
          </div>
        </div>

        {/* 5 KPI Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '18px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '11px', opacity: 0.9, display: 'block' }}>মোট আবেদনপত্র</span>
            <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px' }}>{toBnDigits(summary.total)} টি</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '11px', opacity: 0.9, display: 'block' }}>📩 নতুন জমা ও নিরীক্ষাধীন</span>
            <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px', color: '#fef08a' }}>{toBnDigits(summary.submitted + summary.under_review)} টি</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '11px', opacity: 0.9, display: 'block' }}>✓ প্রধান শিক্ষক অনুমোদিত</span>
            <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px', color: '#a7f3d0' }}>{toBnDigits(summary.head_approved || summary.selected)} টি</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '11px', opacity: 0.9, display: 'block' }}>🎓 শ্রেণি শিক্ষক চূড়ান্ত অন্তর্ভুক্ত</span>
            <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px', color: '#67e8f9' }}>{toBnDigits(summary.admitted)} জন</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '11px', opacity: 0.9, display: 'block' }}>💳 সংগৃহীত অনলাইন ফি</span>
            <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '4px', color: '#fed7aa' }}>
              {formatMoney(apps.filter(a => a.payment_status === 'paid').reduce((sum, a) => sum + (Number(a.payment_amount) || 1400), 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification message */}
      {msg.text && (
        <div style={{
          background: msg.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: msg.type === 'error' ? '#991b1b' : '#166534',
          border: `1.5px solid ${msg.type === 'error' ? '#fca5a5' : '#86efac'}`,
          padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
          marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2.5px solid #047857', paddingBottom: '8px', marginBottom: '18px', overflowX: 'auto' }}>
        {[
          ['applications', '📋 সকল আবেদন ও স্ক্রুটিনি', apps.length],
          ['head_approval', '⚖️ প্রধান শিক্ষকের অনুমোদন ডেক্স', pendingHeadApprovalApps.length],
          ['teacher_enrollment', '🎓 শ্রেণি শিক্ষকের ক্লাসে অন্তর্ভুক্তি', approvedPendingEnrollmentApps.length],
          ['admitted_list', '📑 চূড়ান্ত ভর্তিকৃত রেজিস্টার', fullyAdmittedApps.length],
          ['fees', '💳 ভর্তি ফি ও পেমেন্ট মনিটরিং', apps.filter(a => a.payment_status === 'paid').length]
        ].map(([key, label, count]) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              style={{
                background: isActive ? '#047857' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? '1px solid #047857' : '1px solid #cbd5e1',
                borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap', boxShadow: isActive ? '0 2px 8px rgba(4,120,87,0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{label}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: isActive ? '#fff' : '#0f172a',
                padding: '2px 7px', borderRadius: '12px', fontSize: '11px', fontWeight: 800
              }}>
                {toBnDigits(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Top Filter and Search Bar */}
      <div style={{
        background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1',
        padding: '12px 16px', marginBottom: '18px', display: 'flex', gap: '12px',
        alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="🔍 আবেদন নং / শিক্ষার্থীর নাম / মোবাইল / TrxID দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>শিক্ষাবর্ষ:</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
          >
            <option value="2026">২০২৬ খ্রি.</option>
            <option value="2027">২০২৭ খ্রি.</option>
            <option value="2025">২০২৫ খ্রি.</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>শ্রেণি:</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
          >
            <option value="all">সকল শ্রেণি</option>
            {['৬', '৭', '৮', '৯', '১০'].map(c => (
              <option key={c} value={c}>{toBnDigits(c)}ম শ্রেণি</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>অবস্থা:</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
          >
            <option value="all">সকল অবস্থা</option>
            <option value="submitted">নতুন জমা</option>
            <option value="under_review">পর্যালোচনায়</option>
            <option value="head_approved">প্রধান শিক্ষক অনুমোদিত</option>
            <option value="admitted">চূড়ান্ত ভর্তি সম্পন্ন</option>
            <option value="rejected">বাতিলকৃত</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadData}
          style={{
            background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
            borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🔄 রিফ্রেশ
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALL APPLICATIONS TABLE                            */}
      {/* ========================================================= */}
      {activeTab === 'applications' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#047857' }}>
                অনলাইন ভর্তি আবেদন রেজিস্টার (Applications Register)
              </h3>
              <small style={{ color: '#64748b' }}>শিক্ষার্থীদের যাবতীয় তথ্যাদি ও আবেদন স্থিতি</small>
            </div>
            <span style={{ background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '15px', fontWeight: 700, fontSize: '12px' }}>
              মোট প্রদর্শিত আবেদন: {toBnDigits(apps.length)} টি
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>ক্র.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px' }}>আবেদন নং</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>শিক্ষার্থীর নাম ও তথ্য</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '65px' }}>শ্রেণি</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>পিতা / অভিভাবক</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '115px' }}>মোবাইল</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '100px' }}>ফি পেমেন্ট</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '135px' }}>ভর্তি স্থিতি</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '150px' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, idx) => {
                  const st = STATUS_CONFIG[app.status] || { label: app.status, bg: '#f1f5f9', color: '#334155', icon: '•' };
                  const pay = PAYMENT_CONFIG[app.payment_status] || PAYMENT_CONFIG.paid;
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{toBnDigits(idx + 1)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                        {app.application_no}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                            <img
                              src={app.scanned_photo || app.photo_url || getStudentPhoto({ gender: app.gender, class_name: app.applied_class })}
                              alt={app.applicant_name_bn}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{app.applicant_name_bn}</strong>
                            <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>
                              {app.applicant_name_en || 'জন্ম: ' + formatDateBn(app.date_of_birth)}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px', fontWeight: 700, color: '#047857' }}>
                        {toBnDigits(app.applied_class)}ম
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155' }}>
                        {app.guardian_name || app.father_name || '—'}
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                        {app.guardian_phone || app.father_phone || '—'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>
                        <span style={{
                          background: pay.bg, color: pay.color, padding: '3px 8px',
                          borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'inline-block'
                        }}>
                          {pay.icon} {pay.label} ({formatMoney(app.payment_amount || 1400)})
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>
                        <span style={{
                          background: st.bg, color: st.color, padding: '3px 8px',
                          borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'inline-block'
                        }}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => setInspectModalApp(app)}
                          style={{
                            background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc',
                            padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                            cursor: 'pointer', marginRight: '4px'
                          }}
                          title="আবেদনকারীর বিস্তারিত তথ্য ও স্ক্যানকৃত ডকুমেন্ট দেখুন"
                        >
                          👁️ ডকুমেন্ট
                        </button>
                        {app.status !== 'admitted' && (
                          <button
                            type="button"
                            onClick={() => handleOpenEnrollModal(app)}
                            style={{
                              background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                              padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="শ্রেণি শিক্ষক কর্তৃক শ্রেণিতে অন্তর্ভুক্ত করুন"
                          >
                            🎓 অন্তর্ভুক্তি
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!apps.length && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      কোনো অনলাইন ভর্তি আবেদন পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: HEADMASTER SCRUTINY & APPROVAL DESK               */}
      {/* ========================================================= */}
      {activeTab === 'head_approval' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff', borderRadius: '12px', border: '1.5px solid #059669',
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚖️</span> প্রধান শিক্ষকের স্ক্রুটিনি ও অনুমোদন ডেক্স (Headmaster Scrutiny Desk)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#475569' }}>
                শিক্ষার্থীদের সনদপত্র ও ফি পরিশোধ নিরীক্ষাপূর্বক প্রধান শিক্ষক কর্তৃক চূড়ান্ত ভর্তি অনুমোদন দেওয়া হয়। অনুমোদনের পর সংশ্লিষ্ট শ্রেণি শিক্ষক শিক্ষার্থীকে ক্লাসে অন্তর্ভুক্ত করতে পারেন।
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePrintAdmissionRegister('approved')}
                style={{
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                  color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px',
                  fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '5px'
                }}
              >
                📜 অনুমোদিত মেধা ও নির্বাচন তালিকা প্রিন্ট
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {pendingHeadApprovalApps.map(app => (
              <div
                key={app.id}
                style={{
                  background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1',
                  padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex',
                  flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '2px solid #059669' }}>
                        <img
                          src={app.scanned_photo || app.photo_url || getStudentPhoto({ gender: app.gender, class_name: app.applied_class })}
                          alt={app.applicant_name_bn}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>{app.applicant_name_bn}</h4>
                        <span style={{ fontFamily: 'monospace', color: '#047857', fontWeight: 700, fontSize: '12px' }}>{app.application_no}</span>
                      </div>
                    </div>
                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 9px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                      শ্রেণি: {toBnDigits(app.applied_class)}ম
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                    <div><b>পিতা:</b> {app.father_name || '—'}</div>
                    <div><b>মোবাইল:</b> {app.guardian_phone || '—'}</div>
                    <div><b>জন্ম তারিখ:</b> {formatDateBn(app.date_of_birth)}</div>
                    <div><b>অনলাইন ফি:</b> <span style={{ color: '#047857', fontWeight: 700 }}>পরিশোধিত ({formatMoney(app.payment_amount || 1400)})</span></div>
                    <div style={{ gridColumn: '1/-1' }}><b>TrxID:</b> <code style={{ color: '#0284c7', fontWeight: 700 }}>{app.payment_trx_id || 'TRX-ONLINE-OK'}</code></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>
                      📷 ছবি সংযুক্ত
                    </span>
                    <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px' }}>
                      📑 জন্ম সনদ আপলোডকৃত
                    </span>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                      📋 পূর্বের স্কুলের TC
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => setInspectModalApp(app)}
                    style={{
                      flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                      padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    🔍 স্ক্রুটিনি ও সনদ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHeadmasterApprove(app)}
                    style={{
                      flex: 1.4, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#fff', border: 'none', padding: '8px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    ✓ প্রধান শিক্ষকের অনুমোদন
                  </button>
                </div>
              </div>
            ))}

            {!pendingHeadApprovalApps.length && (
              <div style={{ gridColumn: '1/-1', background: '#ffffff', borderRadius: '12px', border: '1px dashed #059669', padding: '40px', textAlign: 'center' }}>
                <span style={{ fontSize: '32px' }}>✅</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '16px', color: '#047857' }}>প্রধান শিক্ষকের অনুমোদনের অপেক্ষায় কোনো আবেদন নেই!</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  সকল আবেদনকারী অনুমোদিত অথবা শ্রেণিতে অন্তর্ভুক্ত সম্পন্ন হয়েছে।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CLASS TEACHER ENROLLMENT DESK                     */}
      {/* ========================================================= */}
      {activeTab === 'teacher_enrollment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff', borderRadius: '12px', border: '1.5px solid #0284c7',
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎓</span> শ্রেণি শিক্ষকের ক্লাসে অন্তর্ভুক্তকরণ ডেক্স (Class Teacher Enrollment Desk)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#475569' }}>
                প্রধান শিক্ষকের অনুমোদনকৃত শিক্ষার্থীদের শ্রেণি শিক্ষক রোল নম্বর, শাখা ও বিভাগ বরাদ্দ করে শ্রেণিতে অন্তর্ভুক্ত করেন।
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '5px 12px', borderRadius: '12px' }}>
                অপেক্ষমাণ অনুমোদিত শিক্ষার্থী: {toBnDigits(approvedPendingEnrollmentApps.length)} জন
              </span>
            </div>
          </div>

          {/* Class Switcher for Class Teacher View */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', '৬', '৭', '৮', '৯', '১০'].map(c => {
              const count = c === 'all'
                ? approvedPendingEnrollmentApps.length
                : approvedPendingEnrollmentApps.filter(a => String(a.applied_class) === c).length;
              const isSel = selectedClass === c;
              const tName = c !== 'all' ? getTeacherForClass(c) : '';
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedClass(c)}
                  style={{
                    background: isSel ? '#0284c7' : '#ffffff',
                    color: isSel ? '#ffffff' : '#334155',
                    border: isSel ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    borderRadius: '8px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <span>{c === 'all' ? 'সকল শ্রেণি' : `${toBnDigits(c)}ম শ্রেণি`}</span>
                  <span style={{
                    background: isSel ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isSel ? '#fff' : '#0f172a',
                    padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px'
                  }}>
                    {toBnDigits(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Display designated Class Teacher info card if a specific class is selected */}
          {selectedClass !== 'all' && (
            <div style={{
              background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: '8px',
              padding: '10px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👨‍🏫</span>
                <div>
                  <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700 }}>দায়িত্বপ্রাপ্ত শ্রেণি শিক্ষক ({toBnDigits(selectedClass)}ম শ্রেণি):</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c4a6e' }}>{getTeacherForClass(selectedClass)}</div>
                </div>
              </div>
              <span style={{ fontSize: '11.5px', color: '#0369a1', background: '#e0f2fe', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                ভর্তি অনুমোদন প্রাপ্তির পর রোল ও শাখা বরাদ্দের দায়িত্ব শ্রেণি শিক্ষকের
              </span>
            </div>
          )}

          {/* List of Approved candidates ready for enrollment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {approvedPendingEnrollmentApps
              .filter(a => selectedClass === 'all' || String(a.applied_class) === selectedClass)
              .map(app => (
                <div
                  key={app.id}
                  style={{
                    background: '#ffffff', borderRadius: '12px', border: '1.5px solid #7dd3fc',
                    borderLeft: '5px solid #0284c7', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '2px solid #0284c7' }}>
                          <img
                            src={app.scanned_photo || app.photo_url || getStudentPhoto({ gender: app.gender, class_name: app.applied_class })}
                            alt={app.applicant_name_bn}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>{app.applicant_name_bn}</h4>
                          <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 700, fontSize: '12px' }}>{app.application_no}</span>
                        </div>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                        ✓ প্রধান শিক্ষক অনুমোদিত
                      </span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '10px 0' }}>
                      <div><b>শ্রেণি:</b> {toBnDigits(app.applied_class)}ম শ্রেণি</div>
                      <div><b>অভিভাবক:</b> {app.guardian_name || app.father_name}</div>
                      <div><b>মোবাইল:</b> {app.guardian_phone}</div>
                      <div><b>অনলাইন ফি:</b> <span style={{ color: '#047857', fontWeight: 700 }}>পরিশোধিত</span></div>
                      <div style={{ gridColumn: '1/-1' }}>
                        <b>শ্রেণি শিক্ষক:</b> {getTeacherForClass(app.applied_class)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setInspectModalApp(app)}
                      style={{
                        background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1',
                        padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      👁️ বিবরণ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEnrollModal(app)}
                      style={{
                        flex: 1, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px',
                        fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                        boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
                      }}
                    >
                      🎓 শ্রেণিতে রোল ও শাখা বরাদ্দ দিন
                    </button>
                  </div>
                </div>
              ))}

            {!approvedPendingEnrollmentApps.filter(a => selectedClass === 'all' || String(a.applied_class) === selectedClass).length && (
              <div style={{ gridColumn: '1/-1', background: '#ffffff', borderRadius: '12px', border: '1px dashed #0284c7', padding: '40px', textAlign: 'center' }}>
                <span style={{ fontSize: '32px' }}>🎉</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '16px', color: '#0369a1' }}>
                  {selectedClass === 'all' ? 'কোনো অনুমোদিত শিক্ষার্থী ভর্তির অপেক্ষায় নেই!' : `${toBnDigits(selectedClass)}ম শ্রেণিতে ভর্তির জন্য কোনো শিক্ষার্থী অপেক্ষমাণ নেই।`}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  প্রধান শিক্ষক কর্তৃক নতুন কোনো আবেদন অনুমোদিত হলে স্বয়ংক্রিয়ভাবে এখানে রোল ও শাখা বরাদ্দের জন্য প্রদর্শিত হবে।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ADMITTED STUDENTS REGISTER                         */}
      {/* ========================================================= */}
      {activeTab === 'admitted_list' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#065f46' }}>
                চূড়ান্ত ভর্তিকৃত শিক্ষার্থীদের তালিকা (Officially Admitted Students)
              </h3>
              <small style={{ color: '#64748b' }}>প্রধান শিক্ষক অনুমোদিত ও শ্রেণি শিক্ষক কর্তৃক ক্লাসে অন্তর্ভুক্তকৃত শিক্ষার্থী</small>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePrintAdmissionRegister('enrolled')}
                style={{
                  background: '#047857', color: '#fff', border: 'none', padding: '6px 14px',
                  borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                🖨️ ভর্তি রেজিস্টার প্রিন্ট / PDF
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>ক্র.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '120px' }}>স্টুডেন্ট আইডি</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '65px' }}>শ্রেণি</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>রোল</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '75px' }}>শাখা</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>অভিভাবক ও মোবাইল</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>অন্তর্ভুক্তকারী শিক্ষক</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '90px' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {fullyAdmittedApps.map((app, idx) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{toBnDigits(idx + 1)}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 800, color: '#0369a1' }}>
                      {app.enrolled_student_id || `MPUHS-2026-${app.applied_class}${String(app.enrolled_roll_no || 1).padStart(2, '0')}`}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <strong style={{ color: '#0f172a' }}>{app.applicant_name_bn}</strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>
                        {app.applicant_name_en} • জন্ম নিবন্ধন: {app.birth_registration_no || '—'}
                      </small>
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', fontWeight: 800, color: '#047857' }}>
                      {toBnDigits(app.applied_class)}ম
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', fontWeight: 900, color: '#047857', fontSize: '13px' }}>
                      {toBnDigits(app.enrolled_roll_no || 1)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {app.enrolled_section || app.section || 'পদ্মা'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div>{app.guardian_name || app.father_name}</div>
                      <small style={{ color: '#64748b', fontFamily: 'monospace' }}>{app.guardian_phone}</small>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#334155', fontSize: '11.5px' }}>
                      <b>{app.enrolled_by_teacher || getTeacherForClass(app.applied_class)}</b>
                    </td>
                    <td style={{ textAlign: 'center', padding: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setInspectModalApp(app)}
                        style={{
                          background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        👁️ প্রত্যয়ন
                      </button>
                    </td>
                  </tr>
                ))}
                {!fullyAdmittedApps.length && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      এখনো কোনো শিক্ষার্থীর চূড়ান্ত ভর্তি সম্পন্ন হয়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: FEES & PAYMENT MONITORING                          */}
      {/* ========================================================= */}
      {activeTab === 'fees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1.5px solid #86efac', borderLeft: '5px solid #059669', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>মোট সংগৃহীত ভর্তি ফি</span>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#047857', marginTop: '4px' }}>
                {formatMoney(apps.filter(a => a.payment_status === 'paid').reduce((sum, a) => sum + (Number(a.payment_amount) || 1400), 0))}
              </div>
              <small style={{ color: '#64748b' }}>পরিশোধকৃত আবেদন: {toBnDigits(apps.filter(a => a.payment_status === 'paid').length)} টি</small>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1.5px solid #bae6fd', borderLeft: '5px solid #0284c7', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>বিকাশ / নগদ পেমেন্ট</span>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#0369a1', marginTop: '4px' }}>
                {formatMoney(apps.filter(a => a.payment_status === 'paid' && ['bkash', 'nagad', 'rocket'].includes(a.payment_method || 'bkash')).reduce((sum, a) => sum + (Number(a.payment_amount) || 1400), 0))}
              </div>
              <small style={{ color: '#64748b' }}>মোবাইল ফিন্যান্সিয়াল সার্ভিসেস</small>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1.5px solid #fed7aa', borderLeft: '5px solid #ea580c', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#c2410c' }}>ব্যাংক একাউন্ট পেমেন্ট</span>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#ea580c', marginTop: '4px' }}>
                {formatMoney(apps.filter(a => a.payment_status === 'paid' && a.payment_method === 'bank').reduce((sum, a) => sum + (Number(a.payment_amount) || 1400), 0))}
              </div>
              <small style={{ color: '#64748b' }}>সোনালী ব্যাংক কালিহাতি শাখা</small>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#047857' }}>
              অনলাইন ফি আদায়ের বিস্তারিত ট্রানজাকশন লগ
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>ক্র.</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>আবেদন নং ও নাম</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '65px' }}>শ্রেণি</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px' }}>গেটওয়ে</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '130px' }}>TrxID</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px' }}>প্রেরক মোবাইল</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '90px' }}>টাকা</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '90px' }}>ভেরিফিকেশন</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a, idx) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{toBnDigits(idx + 1)}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>{a.application_no}</span>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.applicant_name_bn}</div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{toBnDigits(a.applied_class)}ম</td>
                      <td style={{ padding: '8px 10px', textTransform: 'uppercase', fontWeight: 700, color: a.payment_method === 'bkash' ? '#e11d48' : a.payment_method === 'nagad' ? '#ea580c' : '#0369a1' }}>
                        {a.payment_method || 'bKash'}
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700 }}>
                        {a.payment_trx_id || `TRX${a.id.slice(-6).toUpperCase()}`}
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                        {a.payment_sender_mobile || a.guardian_phone}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                        {formatMoney(a.payment_amount || 1400)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                          ✓ অনুমোদিত
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: APPLICANT SCRUTINY & DOCUMENT INSPECT MODAL     */}
      {/* ========================================================= */}
      {inspectModalApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '720px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
              color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>📑</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>ভর্তি আবেদন ও সনদপত্র স্ক্রুটিনি</h3>
                  <small style={{ opacity: 0.9 }}>আবেদন নং: {inspectModalApp.application_no} • শ্রেণি: {toBnDigits(inspectModalApp.applied_class)}ম</small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalApp(null)}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Profile Card */}
              <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #047857', flexShrink: 0, background: '#fff' }}>
                  <img
                    src={inspectModalApp.scanned_photo || inspectModalApp.photo_url || getStudentPhoto({ gender: inspectModalApp.gender, class_name: inspectModalApp.applied_class })}
                    alt={inspectModalApp.applicant_name_bn}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 2px', fontSize: '17px', color: '#0f172a' }}>{inspectModalApp.applicant_name_bn}</h3>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {inspectModalApp.applicant_name_en} • জন্ম: <b>{formatDateBn(inspectModalApp.date_of_birth)}</b> • লিঙ্গ: <b>{inspectModalApp.gender}</b>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '3px' }}>
                    ডিজিটাল জন্ম নিবন্ধন: <b>{inspectModalApp.birth_registration_no || '—'}</b>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: STATUS_CONFIG[inspectModalApp.status]?.bg || '#f1f5f9',
                    color: STATUS_CONFIG[inspectModalApp.status]?.color || '#334155',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800, display: 'inline-block'
                  }}>
                    {STATUS_CONFIG[inspectModalApp.status]?.label || inspectModalApp.status}
                  </span>
                </div>
              </div>

              {/* Parents & Address details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>পিতার তথ্য:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectModalApp.father_name || '—'}</div>
                  <div style={{ color: '#475569' }}>পেশা: {inspectModalApp.father_profession || '—'} • NID: {inspectModalApp.father_nid || '—'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>মাতার তথ্য:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectModalApp.mother_name || '—'}</div>
                  <div style={{ color: '#475569' }}>পেশা: {inspectModalApp.mother_profession || '—'} • NID: {inspectModalApp.mother_nid || '—'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>অভিভাবক ও যোগাযোগ:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectModalApp.guardian_name} ({inspectModalApp.guardian_relation || 'পিতা'})</div>
                  <div style={{ color: '#047857', fontWeight: 700, fontFamily: 'monospace' }}>মোবাইল: {inspectModalApp.guardian_phone}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>বর্তমান ঠিকানা ও পূর্বের স্কুল:</span>
                  <div style={{ color: '#0f172a' }}>{inspectModalApp.address || 'মগড়া, কালিহাতি, টাঙ্গাইল'}</div>
                  <div style={{ color: '#475569' }}>পূর্ববর্তী স্কুল: {inspectModalApp.previous_school || 'স্থানীয় সরকারি প্রাথমিক বিদ্যালয়'}</div>
                </div>
              </div>

              {/* Scanned Documents Inspection Zone */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#047857', fontWeight: 800 }}>
                  📂 অনলাইনে আপলোডকৃত প্রয়োজনীয় কাগজপত্র ও স্ক্যান কপি:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#f8fafc' }}>
                    <span style={{ fontSize: '20px' }}>📸</span>
                    <b style={{ display: 'block', fontSize: '11.5px', marginTop: '2px' }}>পাসপোর্ট ছবি</b>
                    <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>✓ যাচাইকৃত</span>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#f8fafc' }}>
                    <span style={{ fontSize: '20px' }}>📑</span>
                    <b style={{ display: 'block', fontSize: '11.5px', marginTop: '2px' }}>ডিজিটাল জন্ম সনদ</b>
                    <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>✓ ১৭ ডিজিট অনলাইন</span>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#f8fafc' }}>
                    <span style={{ fontSize: '20px' }}>📋</span>
                    <b style={{ display: 'block', fontSize: '11.5px', marginTop: '2px' }}>পূর্বের স্কুলের TC/মার্কশিট</b>
                    <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>✓ সংযুক্ত রয়েছে</span>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#f8fafc' }}>
                    <span style={{ fontSize: '20px' }}>🪪</span>
                    <b style={{ display: 'block', fontSize: '11.5px', marginTop: '2px' }}>পিতা/মাতার NID</b>
                    <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>✓ সত্যায়িত ফটোকপি</span>
                  </div>
                </div>
              </div>

              {/* Online Fee Payment Verification */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>অনলাইন ভর্তি ফি পরিশোধ স্থিতি:</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#065f46' }}>
                      পরিশোধিত: {formatMoney(inspectModalApp.payment_amount || 1400)}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '2px' }}>
                      গেটওয়ে: <b style={{ textTransform: 'uppercase' }}>{inspectModalApp.payment_method || 'bKash'}</b> • TrxID: <code style={{ fontWeight: 800 }}>{inspectModalApp.payment_trx_id || 'TRX-ONLINE-OK'}</code>
                    </div>
                  </div>
                  <span style={{ background: '#059669', color: '#fff', padding: '4px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 800 }}>
                    ✓ ফি প্রাপ্তি নিশ্চিত
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleHeadmasterReject(inspectModalApp)}
                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✕ বাতিল করুন
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInspectModalApp(null)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বন্ধ করুন
                </button>
                {inspectModalApp.status !== 'head_approved' && inspectModalApp.status !== 'admitted' && (
                  <button
                    type="button"
                    onClick={() => handleHeadmasterApprove(inspectModalApp)}
                    style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ✓ প্রধান শিক্ষকের অনুমোদন দিন
                  </button>
                )}
                {inspectModalApp.status !== 'admitted' && (
                  <button
                    type="button"
                    onClick={() => { setInspectModalApp(null); handleOpenEnrollModal(inspectModalApp); }}
                    style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    🎓 শ্রেণি শিক্ষকের অন্তর্ভুক্তি ডেক্স →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CLASS TEACHER ENROLLMENT MODAL (SMART ENROLL)    */}
      {/* ========================================================= */}
      {enrollModalApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '580px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎓</span> শ্রেণি শিক্ষক কর্তৃক ক্লাসে শিক্ষার্থী অন্তর্ভুক্তি
                </h3>
                <small style={{ opacity: 0.9 }}>শ্রেণি: {toBnDigits(enrollModalApp.applied_class)}ম শ্রেণি • শিক্ষাবর্ষ: ২০২৬ খ্রি.</small>
              </div>
              <button
                type="button"
                onClick={() => setEnrollModalApp(null)}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmEnrollment} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #0284c7' }}>
                  <img
                    src={enrollModalApp.scanned_photo || enrollModalApp.photo_url || getStudentPhoto({ gender: enrollModalApp.gender, class_name: enrollModalApp.applied_class })}
                    alt={enrollModalApp.applicant_name_bn}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#0c4a6e' }}>{enrollModalApp.applicant_name_bn}</h4>
                  <div style={{ fontSize: '12px', color: '#0369a1' }}>
                    আবেদন নং: <b>{enrollModalApp.application_no}</b> • অভিভাবক: {enrollModalApp.guardian_name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    ✓ প্রধান শিক্ষক কর্তৃক ভর্তির অনুমোদন নিশ্চিত হয়েছে
                  </div>
                </div>
              </div>

              {/* Conditional Fields: 
                  - ৬ষ্ঠ থেকে ৮ম শ্রেণি: শাখা নির্বাচনের জন্য ড্রপ-ডাউন মেনু না দিয়ে সরাসরি এডিট করার অপশন (Editable input with suggestions)
                  - ৯ম ও ১০ম শ্রেণি: বিজ্ঞান বিভাগ, মানবিক বিভাগ, ব্যবসায় শিক্ষা সম্বলিত ড্রপ-ডাউন মেনু
              */}
              {(() => {
                const clsStr = String(enrollModalApp.applied_class || '').trim();
                const isClass9or10 = ['9', '10', '৯', '১০'].includes(clsStr);
                const isClass6to8 = !isClass9or10;

                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* Left Column: Roll Number */}
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                          বরাদ্দকৃত ক্লাস রোল নম্বর *
                        </label>
                        <input
                          type="number"
                          value={enrollForm.roll_no}
                          onChange={e => {
                            const r = e.target.value;
                            const yr = enrollModalApp.academic_year || '2026';
                            const autoId = `MPUHS-${yr}-${enrollModalApp.applied_class}${String(r).padStart(2, '0')}`;
                            setEnrollForm({ ...enrollForm, roll_no: r, student_id: autoId });
                          }}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #0284c7', fontSize: '14px', fontWeight: 800, color: '#0369a1' }}
                          required
                        />
                        <small style={{ color: '#64748b', fontSize: '10.5px' }}>পরবর্তী উন্মুক্ত ক্রমিক রোল প্রস্তাব করা হয়েছে</small>
                      </div>

                      {/* Right Column:
                          - ৬ষ্ঠ-৮ম শ্রেণির শিক্ষার্থী হলে: শাখা নির্বাচনের ড্রপ-ডাউন মেনু ছাড়া সরাসরি এডিট করার টেক্সট ইনপুট
                          - ৯ম-১০ম শ্রেণির শিক্ষার্থী হলে: বিজ্ঞান বিভাগ, মানবিক বিভাগ, ব্যবসায় শিক্ষা সম্বলিত ড্রপ-ডাউন মেনু
                      */}
                      {isClass6to8 ? (
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#0369a1', display: 'block', marginBottom: '3px' }}>
                            শাখা নির্ধারণ / এডিট করুন (Section) *
                          </label>
                          <input
                            type="text"
                            value={enrollForm.section}
                            onChange={e => setEnrollForm({ ...enrollForm, section: e.target.value })}
                            placeholder="শাখার নাম লিখুন (যেমন: পদ্মা শাখা, ক শাখা বা সাধারণ)"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #0284c7', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}
                            required
                          />
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>সাজেশন:</span>
                            {['পদ্মা শাখা', 'মেঘনা শাখা', 'যমুনা শাখা', 'ক শাখা', 'খ শাখা', 'সাধারণ শাখা'].map(secName => (
                              <button
                                key={secName}
                                type="button"
                                onClick={() => setEnrollForm({ ...enrollForm, section: secName })}
                                style={{
                                  background: enrollForm.section === secName ? '#e0f2fe' : '#f8fafc',
                                  color: enrollForm.section === secName ? '#0369a1' : '#475569',
                                  border: enrollForm.section === secName ? '1px solid #38bdf8' : '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  padding: '1px 6px',
                                  fontSize: '10.5px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                {secName}
                              </button>
                            ))}
                          </div>
                          <small style={{ color: '#0369a1', fontSize: '10px', marginTop: '2px', display: 'block' }}>
                            ✏️ ৬ষ্ঠ-৮ম শ্রেণির ক্ষেত্রে কোনো ফিক্সড ড্রপ-ডাউন মেনু নেই, সরাসরি এডিটযোগ্য
                          </small>
                        </div>
                      ) : (
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '3px' }}>
                            বিভাগ নির্বাচন (Department) *
                          </label>
                          <select
                            value={enrollForm.department}
                            onChange={e => {
                              const dept = e.target.value;
                              setEnrollForm(prev => ({
                                ...prev,
                                department: dept,
                                section: (!prev.section || prev.section === 'বিজ্ঞান বিভাগ' || prev.section === 'মানবিক বিভাগ' || prev.section === 'ব্যবসায় শিক্ষা' || prev.section.includes('শাখা')) ? dept : prev.section
                              }));
                            }}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #16a34a', fontSize: '13px', fontWeight: 700, color: '#15803d', background: '#f0fdf4' }}
                            required
                          >
                            <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                            <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                            <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
                          </select>
                          <small style={{ color: '#15803d', fontSize: '10.5px', fontWeight: 600 }}>
                            ৯ম ও ১০ম শ্রেণির জন্য বিজ্ঞান বিভাগ, মানবিক বিভাগ, ব্যবসায় শিক্ষা সম্বলিত ড্রপ-ডাউন মেনু
                          </small>
                        </div>
                      )}
                    </div>

                    {/* For 9-10: also provide optional editable section field if needed */}
                    {isClass9or10 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                            শাখা (Section - ঐচ্ছিক / বিভাগ অনুসারে এডিট করুন)
                          </label>
                          <input
                            type="text"
                            value={enrollForm.section}
                            onChange={e => setEnrollForm({ ...enrollForm, section: e.target.value })}
                            placeholder="যেমন: বিজ্ঞান - ক শাখা বা সাধারণ"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600 }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '16px' }}>
                          <small style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.4 }}>
                            💡 ৯ম-১০ম শ্রেণিতে বিভাগই মূলত প্রধান শাখা। প্রয়োজনবোধে উপ-শাখা থাকলে এডিট করতে পারেন।
                          </small>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                    স্বয়ংক্রিয় স্টুডেন্ট আইডি (Student ID) *
                  </label>
                  <input
                    type="text"
                    value={enrollForm.student_id}
                    onChange={e => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                    অন্তর্ভুক্তকারী শ্রেণি শিক্ষক
                  </label>
                  <input
                    type="text"
                    value={enrollForm.teacher_name}
                    onChange={e => setEnrollForm({ ...enrollForm, teacher_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '10px 14px', borderRadius: '6px', fontSize: '11.5px', color: '#854d0e', lineHeight: 1.5 }}>
                📌 <b>নিশ্চিতকরণ নোট:</b> এই বাটনে ক্লিক করামাত্র শিক্ষার্থী স্বয়ংক্রিয়ভাবে মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়ের সক্রিয় শিক্ষার্থী রেজিস্টারে অন্তর্ভুক্ত হবে এবং ক্লাস উপস্থিতি শিট, ফি খাতা ও ফলাফল সিস্টেমে প্রদর্শিত হবে।
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEnrollModalApp(null)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '6px',
                    fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '6px', boxShadow: '0 3px 8px rgba(2,132,199,0.3)'
                  }}
                >
                  ✓ চূড়ান্ত অন্তর্ভুক্তি সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdmissionPanel;
