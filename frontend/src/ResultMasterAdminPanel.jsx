import React, { useState, useEffect } from 'react';
import { 
  getStoredAdmissionResults,
  saveStoredAdmissionResults,
  getStoredHalfYearlyResults,
  saveStoredHalfYearlyResults,
  getStoredAnnualResults,
  saveStoredAnnualResults,
  getStoredPreTestResults,
  saveStoredPreTestResults,
  getStoredTestResults,
  saveStoredTestResults,
  getStoredPublicExamResults,
  saveStoredPublicExamResults
} from './examResultsDataStore';
import { SubmenuDetailModal } from './SubmenuDetailModal';

export function ResultMasterAdminPanel({ 
  sub, 
  setSub, 
  ResultPanelComponent, 
  userRole, 
  onNavigate 
}) {
  // Normalize initial tab
  const getInitialTab = (s) => {
    if (!s) return 'half_yearly';
    if (['admission', 'admission_test'].includes(s)) return 'admission';
    if (['half_yearly', 'internal'].includes(s)) return 'half_yearly';
    if (['annual'].includes(s)) return 'annual';
    if (['pre_test'].includes(s)) return 'pre_test';
    if (['test'].includes(s)) return 'test';
    if (['public_exams', 'ssc', 'analysis'].includes(s)) return 'public_exams';
    // If navigating to legacy mark entry, keep tab
    if (['marks', 'academic_year', 'exam_names', 'subjects', 'grading', 'processing', 'marksheet', 'tabulation', 'merit', 'promotion'].includes(s)) {
      return 'advanced_system';
    }
    return 'half_yearly';
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab(sub));
  const [toastMsg, setToastMsg] = useState('');
  const [previewModal, setPreviewModal] = useState(null);

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

  // Helper for printing official exam reports
  const printExamReport = (title, metaHtml, tableHtml) => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজার পপ-আপ অনুমোদন করুন।');
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
          .header { text-align: center; border-bottom: 2px double #0284c7; padding-bottom: 12px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #15803d; }
          .header p { margin: 4px 0 0; font-size: 13px; color: #475569; }
          .report-title { text-align: center; font-size: 18px; font-weight: 800; color: #0369a1; margin-bottom: 8px; }
          .meta-box { display: flex; justify-content: space-between; font-size: 12.5px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; color: #334155; }
          .footer-signs { margin-top: 45px; display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
          <p>ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল | EIIN: 114321</p>
        </div>
        <div class="report-title">${title}</div>
        <div class="meta-box">${metaHtml}</div>
        ${tableHtml}
        <div class="footer-signs">
          <div>শ্রেণি শিক্ষকের স্বাক্ষর</div>
          <div>পরীক্ষা কমিটির আহ্বায়ক</div>
          <div>প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>
        <script>
          window.onload = function() { setTimeout(function(){ window.print(); }, 250); };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // 1. Admission Results State & CRUD
  const [admissionResults, setAdmissionResults] = useState(getStoredAdmissionResults);
  const [editingAdmId, setEditingAdmId] = useState(null);
  const [admSearch, setAdmSearch] = useState('');
  const [admClassFilter, setAdmClassFilter] = useState('all');
  const [admForm, setAdmForm] = useState({
    application_no: '',
    roll_no: '',
    applicant_name: '',
    applied_class: '৬ষ্ঠ',
    marks: 85,
    merit_position: 1,
    status: 'মেধা তালিকায় নির্বাচিত',
    guardian_name: '',
    guardian_phone: ''
  });

  const saveAdmissionResult = (e) => {
    e.preventDefault();
    if (!admForm.applicant_name.trim()) {
      alert('পরীক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingAdmId) {
      updated = admissionResults.map(item => item.id === editingAdmId ? { ...item, ...admForm } : item);
      showToast('ভর্তি পরীক্ষার ফলাফল সফলভাবে আপডেট হয়েছে!');
    } else {
      const newItem = {
        ...admForm,
        id: 'adm-res-' + Date.now(),
      };
      updated = [newItem, ...admissionResults];
      showToast('নতুন ভর্তি পরীক্ষার ফলাফল রেকর্ড যুক্ত হয়েছে!');
    }
    setAdmissionResults(updated);
    saveStoredAdmissionResults(updated);
    setEditingAdmId(null);
    setAdmForm({
      application_no: '',
      roll_no: '',
      applicant_name: '',
      applied_class: '৬ষ্ঠ',
      marks: 85,
      merit_position: 1,
      status: 'মেধা তালিকায় নির্বাচিত',
      guardian_name: '',
      guardian_phone: ''
    });
  };

  // 2. Half-Yearly Results State & CRUD (Classes 6-10)
  const [halfYearlyResults, setHalfYearlyResults] = useState(getStoredHalfYearlyResults);
  const [editingHyId, setEditingHyId] = useState(null);
  const [hySearch, setHySearch] = useState('');
  const [hyClassFilter, setHyClassFilter] = useState('all');
  const [hyForm, setHyForm] = useState({
    roll_no: '',
    student_id: '',
    name_bn: '',
    class_name: '৬ষ্ঠ',
    section: 'ক শাখা',
    marks: 650,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 1,
    status: 'উত্তীর্ণ'
  });

  const saveHalfYearlyResult = (e) => {
    e.preventDefault();
    if (!hyForm.name_bn.trim()) {
      alert('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingHyId) {
      updated = halfYearlyResults.map(item => item.id === editingHyId ? { ...item, ...hyForm } : item);
      showToast('অর্ধ-বার্ষিক পরীক্ষার ফলাফল আপডেট হয়েছে!');
    } else {
      const newItem = { ...hyForm, id: 'hy-' + Date.now() };
      updated = [newItem, ...halfYearlyResults];
      showToast('অর্ধ-বার্ষিক ফলাফল সফলভাবে সংরক্ষিত হয়েছে!');
    }
    setHalfYearlyResults(updated);
    saveStoredHalfYearlyResults(updated);
    setEditingHyId(null);
  };

  // 3. Annual Results State & CRUD (Classes 6-9 strictly)
  const [annualResults, setAnnualResults] = useState(getStoredAnnualResults);
  const [editingAnId, setEditingAnId] = useState(null);
  const [anSearch, setAnSearch] = useState('');
  const [anClassFilter, setAnClassFilter] = useState('all');
  const [anForm, setAnForm] = useState({
    roll_no: '',
    student_id: '',
    name_bn: '',
    class_name: '৬ষ্ঠ',
    section: 'ক শাখা',
    marks: 660,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 1,
    promotion_status: '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত'
  });

  const saveAnnualResult = (e) => {
    e.preventDefault();
    if (!anForm.name_bn.trim()) {
      alert('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    // Strict safety: Annual exam is only for 6th-9th grade
    if (anForm.class_name === '১০ম') {
      alert('১০ম শ্রেণির জন্য বার্ষিক পরীক্ষা প্রযোজ্য নয়। ১০ম শ্রেণির জন্য প্রাক-নির্বাচনী ও নির্বাচনী পরীক্ষা নির্বাচন করুন।');
      return;
    }
    let updated;
    if (editingAnId) {
      updated = annualResults.map(item => item.id === editingAnId ? { ...item, ...anForm } : item);
      showToast('বার্ষিক পরীক্ষার ফলাফল ও প্রমোশন আপডেট হয়েছে!');
    } else {
      const newItem = { ...anForm, id: 'an-' + Date.now() };
      updated = [newItem, ...annualResults];
      showToast('নতুন বার্ষিক ফলাফল সফলভাবে সংরক্ষিত হয়েছে!');
    }
    setAnnualResults(updated);
    saveStoredAnnualResults(updated);
    setEditingAnId(null);
  };

  // 4. Pre-Test Results State & CRUD (Class 10 only)
  const [preTestResults, setPreTestResults] = useState(getStoredPreTestResults);
  const [editingPtId, setEditingPtId] = useState(null);
  const [ptSearch, setPtSearch] = useState('');
  const [ptDeptFilter, setPtDeptFilter] = useState('all');
  const [ptForm, setPtForm] = useState({
    roll_no: '',
    student_id: '',
    name_bn: '',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    marks: 850,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 1,
    status: 'উত্তীর্ণ (সন্তোষজনক প্রস্তুতি)',
    notes: ''
  });

  const savePreTestResult = (e) => {
    e.preventDefault();
    if (!ptForm.name_bn.trim()) {
      alert('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingPtId) {
      updated = preTestResults.map(item => item.id === editingPtId ? { ...item, ...ptForm } : item);
      showToast('প্রাক-নির্বাচনী পরীক্ষার ফলাফল আপডেট হয়েছে!');
    } else {
      const newItem = { ...ptForm, id: 'pt-' + Date.now(), class_name: '১০ম' };
      updated = [newItem, ...preTestResults];
      showToast('১০ম শ্রেণির প্রাক-নির্বাচনী ফলাফল যোগ হয়েছে!');
    }
    setPreTestResults(updated);
    saveStoredPreTestResults(updated);
    setEditingPtId(null);
  };

  // 5. Test Results State & CRUD (Class 10 only)
  const [testResults, setTestResults] = useState(getStoredTestResults);
  const [editingTestId, setEditingTestId] = useState(null);
  const [testSearch, setTestSearch] = useState('');
  const [testDeptFilter, setTestDeptFilter] = useState('all');
  const [testForm, setTestForm] = useState({
    roll_no: '',
    student_id: '',
    name_bn: '',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    marks: 880,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 1,
    ssc_clearance: 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)',
    notes: 'এসএসসি ফরমপূরণ অনুমোদিত'
  });

  const saveTestResult = (e) => {
    e.preventDefault();
    if (!testForm.name_bn.trim()) {
      alert('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }
    let updated;
    if (editingTestId) {
      updated = testResults.map(item => item.id === editingTestId ? { ...item, ...testForm } : item);
      showToast('নির্বাচনী পরীক্ষার ফলাফল ও এসএসসি ছাড়পত্র আপডেট হয়েছে!');
    } else {
      const newItem = { ...testForm, id: 'test-' + Date.now(), class_name: '১০ম' };
      updated = [newItem, ...testResults];
      showToast('১০ম শ্রেণির নির্বাচনী ফলাফল ও ছাড়পত্র সংরক্ষিত হয়েছে!');
    }
    setTestResults(updated);
    saveStoredTestResults(updated);
    setEditingTestId(null);
  };

  // 6. Public Exams State & CRUD (SSC / JSC)
  const [publicExams, setPublicExams] = useState(getStoredPublicExamResults);
  const [editingPubId, setEditingPubId] = useState(null);
  const [pubForm, setPubForm] = useState({
    year: '২০২৬',
    exam_name: 'এসএসসি পরীক্ষা ২০২৬',
    candidates: 145,
    passed: 142,
    gpa5: 42,
    golden_gpa5: 22,
    failed: 3,
    pass_rate: '97.93%',
    board: 'ঢাকা শিক্ষা বোর্ড',
    highlights: 'গৌরবোজ্জ্বল ফলাফল'
  });

  const savePublicExam = (e) => {
    e.preventDefault();
    let updated;
    if (editingPubId) {
      updated = publicExams.map(item => item.id === editingPubId ? { ...item, ...pubForm } : item);
      showToast('পাবলিক পরীক্ষার ফলাফল পরিসংখ্যান আপডেট হয়েছে!');
    } else {
      const newItem = { ...pubForm, id: 'pub-' + Date.now() };
      updated = [newItem, ...publicExams];
      showToast('নতুন পাবলিক পরীক্ষার ফলাফল রেকর্ড সংরক্ষিত হয়েছে!');
    }
    setPublicExams(updated);
    saveStoredPublicExamResults(updated);
    setEditingPubId(null);
  };

  return (
    <div className="result-master-admin-panel" style={{ paddingBottom: '40px' }}>
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
          gap: '10px'
        }}>
          <span>✅</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #0284c7 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '14px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(4,120,87,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '36px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>📈</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>পরীক্ষা ও ফলাফল ব্যবস্থাপনা কেন্দ্র</h2>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                অফিসিয়াল রেজাল্ট প্যানেল
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              ভর্তি পরীক্ষা, অর্ধ-বার্ষিক (৬ষ্ঠ-১০ম), বার্ষিক (৬ষ্ঠ-৯ম), প্রাক-নির্বাচনী (১০ম), নির্বাচনী (১০ম) ও পাবলিক পরীক্ষার ফলাফল
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="mini"
            onClick={() => setPreviewModal({ key: 'public.nav.results.' + activeTab, title: 'ভিউপেজ রেজাল্ট প্রিভিউ' })}
            style={{
              background: '#ffffff',
              color: '#047857',
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

      {/* 6 Ordered Submenus Tab Bar */}
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
          { key: 'admission', label: '১. ভর্তি পরীক্ষার ফলাফল', icon: '📝', badge: 'সকল আবেদন' },
          { key: 'half_yearly', label: '২. অর্ধ-বার্ষিক পরীক্ষার ফলাফল', icon: '📊', badge: '৬ষ্ঠ-১০ম শ্রেণি' },
          { key: 'annual', label: '৩. বার্ষিক পরীক্ষার ফলাফল', icon: '🏆', badge: '৬ষ্ঠ-৯ম শ্রেণি' },
          { key: 'pre_test', label: '৪. প্রাক-নির্বাচনী পরীক্ষার ফলাফল', icon: '📑', badge: '১০ম শ্রেণি' },
          { key: 'test', label: '৫. নির্বাচনী পরীক্ষার ফলাফল', icon: '🎯', badge: '১০ম শ্রেণি (SSC)' },
          { key: 'public_exams', label: '৬. পাবলিক পরীক্ষার ফলাফল', icon: '🏛️', badge: 'SSC/JSC আর্কাইভ' }
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
                background: isActive ? 'linear-gradient(135deg, #047857 0%, #059669 100%)' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 3px 8px rgba(4,120,87,0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 700
              }}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ভর্তি পরীক্ষার ফলাফল */}
      {activeTab === 'admission' && (
        <div>
          {/* Notice & Action Banner */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📝</span>
              <span style={{ fontSize: '13.5px', color: '#1e40af', fontWeight: 700 }}>
                ভর্তি পরীক্ষা: সকল শ্রেণির ভর্তিচ্ছু শিক্ষার্থীদের লিখিত ও মৌখিক পরীক্ষার নম্বর এন্ট্রি ও মেধা তালিকা ব্যবস্থাপনা।
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onNavigate && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => onNavigate('admission', 'applications')}
                  style={{ background: '#0284c7', color: '#fff', fontWeight: 700 }}
                >
                  📋 ভর্তি আবেদন স্ক্রুটিনি ➔
                </button>
              )}
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const el = document.querySelector('form.form-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
              >
                ✏️ ভর্তি পরীক্ষার নম্বর এন্ট্রি ফরম ➔
              </button>
            </div>
          </div>
        <div className="module-grid">
          {/* Form */}
          <div className="form-card">
            <div className="toolbar">
              <div>
                <span className="eyebrow">ADMISSION TEST RESULT</span>
                <h2>{editingAdmId ? 'ভর্তি ফলাফল সম্পাদনা' : 'নতুন ভর্তি পরীক্ষার ফলাফল যোগ'}</h2>
              </div>
              {editingAdmId && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    setEditingAdmId(null);
                    setAdmForm({
                      application_no: '',
                      roll_no: '',
                      applicant_name: '',
                      applied_class: '৬ষ্ঠ',
                      marks: 85,
                      merit_position: 1,
                      status: 'মেধা তালিকায় নির্বাচিত',
                      guardian_name: '',
                      guardian_phone: ''
                    });
                  }}
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={saveAdmissionResult} className="form-grid">
              <input
                placeholder="পরীক্ষার্থীর নাম *"
                value={admForm.applicant_name}
                onChange={e => setAdmForm({ ...admForm, applicant_name: e.target.value })}
                required
              />
              <input
                placeholder="ভর্তি রোল নম্বর *"
                value={admForm.roll_no}
                onChange={e => setAdmForm({ ...admForm, roll_no: e.target.value })}
                required
              />
              <input
                placeholder="আবেদন নম্বর (যেমন: ADM-2026-001)"
                value={admForm.application_no}
                onChange={e => setAdmForm({ ...admForm, application_no: e.target.value })}
              />
              <select
                value={admForm.applied_class}
                onChange={e => setAdmForm({ ...admForm, applied_class: e.target.value })}
              >
                <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম">৭ম শ্রেণি</option>
                <option value="৮ম">৮ম শ্রেণি</option>
                <option value="৯ম">৯ম শ্রেণি</option>
              </select>
              <input
                type="number"
                placeholder="প্রাপ্ত নম্বর (১০০ তে) *"
                value={admForm.marks}
                onChange={e => setAdmForm({ ...admForm, marks: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="মেধা স্থান (Merit Rank)"
                value={admForm.merit_position}
                onChange={e => setAdmForm({ ...admForm, merit_position: e.target.value })}
              />
              <select
                value={admForm.status}
                onChange={e => setAdmForm({ ...admForm, status: e.target.value })}
              >
                <option value="মেধা তালিকায় নির্বাচিত">মেধা তালিকায় নির্বাচিত (Selected)</option>
                <option value="অপেক্ষমাণ তালিকা (১ম)">অপেক্ষমাণ তালিকা (Waiting List)</option>
                <option value="উত্তীর্ণ কিন্তু আসন সীমিত">উত্তীর্ণ</option>
              </select>
              <input
                placeholder="অভিভাবকের নাম"
                value={admForm.guardian_name}
                onChange={e => setAdmForm({ ...admForm, guardian_name: e.target.value })}
              />
              <input
                placeholder="অভিভাবকের মোবাইল"
                value={admForm.guardian_phone}
                onChange={e => setAdmForm({ ...admForm, guardian_phone: e.target.value })}
              />

              <button type="submit" className="btn full" style={{ background: '#0284c7' }}>
                {editingAdmId ? '✓ ফলাফল আপডেট করুন' : '➕ ভর্তি ফলাফল প্রকাশ করুন'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>ভর্তি পরীক্ষার ফলাফল ও মেধা তালিকা</h2>
                <span>মোট পরীক্ষার্থী: {admissionResults.length} জন</span>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = admissionResults.map((r, i) => `
                    <tr>
                      <td style="text-align:center;">${i + 1}</td>
                      <td style="text-align:center;font-weight:700;">${r.roll_no}</td>
                      <td><b>${r.applicant_name}</b><br><small>${r.application_no || '—'}</small></td>
                      <td style="text-align:center;">শ্রেণি ${r.applied_class}</td>
                      <td style="text-align:center;font-weight:700;color:#047857;">${r.marks}</td>
                      <td style="text-align:center;font-weight:700;">${r.merit_position || '—'}</td>
                      <td><b>${r.status}</b></td>
                      <td>${r.guardian_phone || '—'}</td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>ক্রম</th>
                          <th>ভর্তি রোল</th>
                          <th>পরীক্ষার্থীর নাম</th>
                          <th>ভর্তিকৃত শ্রেণি</th>
                          <th>প্রাপ্ত নম্বর</th>
                          <th>মেধা স্থান</th>
                          <th>ফলাফল / অবস্থা</th>
                          <th>যোগাযোগ</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printExamReport('ভর্তি পরীক্ষা ২০২৬ — চূড়ান্ত ফলাফল ও মেধা তালিকা', '<span><b>শিক্ষাবর্ষ:</b> ২০২৬</span><span><b>প্রকাশের তারিখ:</b> ২০২৬-০১-০৫</span>', tableHtml);
                }}
                style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট মেধা তালিকা
              </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                placeholder="পরীক্ষার্থীর নাম / রোল খুঁজুন..."
                value={admSearch}
                onChange={e => setAdmSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <select value={admClassFilter} onChange={e => setAdmClassFilter(e.target.value)}>
                <option value="all">সকল শ্রেণি</option>
                <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম">৭ম শ্রেণি</option>
                <option value="৮ম">৮ম শ্রেণি</option>
                <option value="৯ম">৯ম শ্রেণি</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ভর্তি রোল</th>
                    <th>পরীক্ষার্থীর নাম ও আইডি</th>
                    <th>শ্রেণি</th>
                    <th>প্রাপ্ত নম্বর</th>
                    <th>মেধা স্থান</th>
                    <th>ফলাফল স্ট্যাটাস</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {admissionResults
                    .filter(item => {
                      if (admClassFilter !== 'all' && item.applied_class !== admClassFilter) return false;
                      if (!admSearch) return true;
                      return [item.applicant_name, item.roll_no, item.application_no, item.guardian_name].filter(Boolean).join(' ').toLowerCase().includes(admSearch.toLowerCase());
                    })
                    .map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 800 }}>{item.roll_no}</td>
                        <td>
                          <b>{item.applicant_name}</b>
                          {item.application_no && <small style={{ display: 'block', color: '#64748b' }}>{item.application_no}</small>}
                        </td>
                        <td>শ্রেণি {item.applied_class}</td>
                        <td style={{ fontWeight: 700, color: '#047857' }}>{item.marks} / ১০০</td>
                        <td><b style={{ color: '#0369a1' }}>#{item.merit_position || '—'}</b></td>
                        <td>
                          <span style={{
                            background: item.status.includes('নির্বাচিত') ? '#dcfce7' : '#fef3c7',
                            color: item.status.includes('নির্বাচিত') ? '#14532d' : '#92400e',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="mini" onClick={() => { setEditingAdmId(item.id); setAdmForm({ ...item }); }}>সম্পাদনা</button>
                          <button
                            type="button"
                            className="mini"
                            style={{ color: '#dc2626' }}
                            onClick={() => {
                              if (confirm('রেকর্ড মুছে ফেলবেন?')) {
                                const up = admissionResults.filter(x => x.id !== item.id);
                                setAdmissionResults(up);
                                saveStoredAdmissionResults(up);
                              }
                            }}
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* TAB 2: অর্ধ-বার্ষিক পরীক্ষার ফলাফল (৬ষ্ঠ-১০ম শ্রেণি) */}
      {activeTab === 'half_yearly' && (
        <div>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
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
              <span style={{ fontSize: '13.5px', color: '#1e40af', fontWeight: 700 }}>
                অর্ধ-বার্ষিক পরীক্ষা: ৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য প্রযোজ্য।
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="mini"
                onClick={() => {
                  try { localStorage.setItem('magra_selected_exam_type', 'half_yearly'); } catch(e){}
                  onNavigate('results', 'marks');
                }}
                style={{ background: '#0284c7', color: '#fff', fontWeight: 700 }}
              >
                ✏️ বিষয়ভিত্তিক নম্বর এন্ট্রি শিট ➔
              </button>
            )}
          </div>

          <div className="module-grid">
            {/* Form */}
            <div className="form-card">
              <div className="toolbar">
                <h2>{editingHyId ? 'অর্ধ-বার্ষিক ফলাফল সম্পাদনা' : 'নতুন অর্ধ-বার্ষিক ফলাফল যোগ'}</h2>
                {editingHyId && <button type="button" className="mini" onClick={() => setEditingHyId(null)}>বাতিল</button>}
              </div>

              <form onSubmit={saveHalfYearlyResult} className="form-grid">
                <input
                  placeholder="শিক্ষার্থীর নাম *"
                  value={hyForm.name_bn}
                  onChange={e => setHyForm({ ...hyForm, name_bn: e.target.value })}
                  required
                />
                <input
                  placeholder="রোল নম্বর *"
                  value={hyForm.roll_no}
                  onChange={e => setHyForm({ ...hyForm, roll_no: e.target.value })}
                  required
                />
                <select
                  value={hyForm.class_name}
                  onChange={e => setHyForm({ ...hyForm, class_name: e.target.value })}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
                <input
                  placeholder="শাখা / বিভাগ (যেমন: বিজ্ঞান বিভাগ)"
                  value={hyForm.section}
                  onChange={e => setHyForm({ ...hyForm, section: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="মোট প্রাপ্ত নম্বর"
                  value={hyForm.marks}
                  onChange={e => setHyForm({ ...hyForm, marks: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="GPA (যেমন: 5.00)"
                  value={hyForm.gpa}
                  onChange={e => setHyForm({ ...hyForm, gpa: e.target.value })}
                />
                <select
                  value={hyForm.grade}
                  onChange={e => setHyForm({ ...hyForm, grade: e.target.value })}
                >
                  <option value="A+">A+ (GPA 5.00)</option>
                  <option value="A">A (GPA 4.00 - 4.99)</option>
                  <option value="A-">A- (GPA 3.50 - 3.99)</option>
                  <option value="B">B (GPA 3.00 - 3.49)</option>
                  <option value="C">C (GPA 2.00 - 2.99)</option>
                  <option value="D">D (GPA 1.00 - 1.99)</option>
                  <option value="F">F (অকৃতকার্য)</option>
                </select>
                <input
                  type="number"
                  placeholder="মেধা স্থান (Merit Rank)"
                  value={hyForm.merit_pos}
                  onChange={e => setHyForm({ ...hyForm, merit_pos: e.target.value })}
                />

                <button type="submit" className="btn full" style={{ background: '#0284c7' }}>
                  {editingHyId ? '✓ ফলাফল আপডেট করুন' : '➕ অর্ধ-বার্ষিক ফলাফল প্রকাশ করুন'}
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="toolbar">
                <div>
                  <h2>অর্ধ-বার্ষিক ফলাফল তালিকা (৬ষ্ঠ-১০ম)</h2>
                  <span>মোট: {halfYearlyResults.length} জন</span>
                </div>
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    const rows = halfYearlyResults.map((r, i) => `
                      <tr>
                        <td style="text-align:center;">${i + 1}</td>
                        <td style="text-align:center;font-weight:700;">${r.roll_no}</td>
                        <td><b>${r.name_bn}</b></td>
                        <td style="text-align:center;">শ্রেণি ${r.class_name} (${r.section || '—'})</td>
                        <td style="text-align:center;">${r.marks}</td>
                        <td style="text-align:center;font-weight:700;color:#047857;">${r.gpa}</td>
                        <td style="text-align:center;"><b>${r.grade}</b></td>
                        <td style="text-align:center;">#${r.merit_pos || '—'}</td>
                        <td style="text-align:center;">${r.status}</td>
                      </tr>
                    `).join('');
                    const tableHtml = `
                      <table>
                        <thead>
                          <tr>
                            <th>ক্রম</th>
                            <th>রোল</th>
                            <th>শিক্ষার্থীর নাম</th>
                            <th>শ্রেণি ও শাখা</th>
                            <th>মোট নম্বর</th>
                            <th>GPA</th>
                            <th>গ্রেড</th>
                            <th>মেধা স্থান</th>
                            <th>অবস্থা</th>
                          </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                      </table>
                    `;
                    printExamReport('অর্ধ-বার্ষিক পরীক্ষা — শ্রেণিভিত্তিক ফলাফল ও মূল্যায়ন শিট', '<span><b>পরীক্ষা:</b> অর্ধ-বার্ষিক পরীক্ষা</span><span><b>শ্রেণি:</b> ৬ষ্ঠ থেকে ১০ম</span>', tableHtml);
                  }}
                  style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
                >
                  🖨️ প্রিন্ট ফলাফল শিট
                </button>
              </div>

              <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  placeholder="শিক্ষার্থীর নাম / রোল খুঁজুন..."
                  value={hySearch}
                  onChange={e => setHySearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select value={hyClassFilter} onChange={e => setHyClassFilter(e.target.value)}>
                  <option value="all">সকল শ্রেণি (৬ষ্ঠ-১০ম)</option>
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
                      <th>রোল</th>
                      <th>শিক্ষার্থীর নাম</th>
                      <th>শ্রেণি ও শাখা</th>
                      <th>প্রাপ্ত নম্বর</th>
                      <th>GPA ও গ্রেড</th>
                      <th>মেধা স্থান</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {halfYearlyResults
                      .filter(item => {
                        if (hyClassFilter !== 'all' && item.class_name !== hyClassFilter) return false;
                        if (!hySearch) return true;
                        return [item.name_bn, item.roll_no, item.section].filter(Boolean).join(' ').toLowerCase().includes(hySearch.toLowerCase());
                      })
                      .map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800 }}>{item.roll_no}</td>
                          <td><b>{item.name_bn}</b></td>
                          <td>শ্রেণি {item.class_name} ({item.section || '—'})</td>
                          <td>{item.marks}</td>
                          <td>
                            <b style={{ color: '#047857' }}>{item.gpa}</b>
                            <span style={{ marginLeft: '6px', background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>
                              {item.grade}
                            </span>
                          </td>
                          <td><b>#{item.merit_pos || '—'}</b></td>
                          <td>
                            <button type="button" className="mini" onClick={() => { setEditingHyId(item.id); setHyForm({ ...item }); }}>সম্পাদনা</button>
                            <button
                              type="button"
                              className="mini"
                              style={{ color: '#dc2626' }}
                              onClick={() => {
                                if (confirm('মুছে ফেলতে চান?')) {
                                  const up = halfYearlyResults.filter(x => x.id !== item.id);
                                  setHalfYearlyResults(up);
                                  saveStoredHalfYearlyResults(up);
                                }
                              }}
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: বার্ষিক পরীক্ষার ফলাফল (৬ষ্ঠ-৯ম শ্রেণি strictly) */}
      {activeTab === 'annual' && (
        <div>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
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
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '13.5px', color: '#92400e', fontWeight: 700 }}>
                বার্ষিক পরীক্ষা: শুধুমাত্র ৬ষ্ঠ থেকে ৯ম শ্রেণির শিক্ষার্থীদের জন্য প্রযোজ্য (১০ম শ্রেণির জন্য প্রাক-নির্বাচনী ও নির্বাচনী পরীক্ষা নির্ধারিত)।
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onNavigate && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    try { localStorage.setItem('magra_selected_exam_type', 'annual'); } catch(e){}
                    onNavigate('results', 'marks');
                  }}
                  style={{ background: '#0284c7', color: '#fff', fontWeight: 700 }}
                >
                  ✏️ বিষয়ভিত্তিক নম্বর এন্ট্রি শিট ➔
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  className="mini"
                  onClick={() => onNavigate('results', 'promotion')}
                  style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
                >
                  🎓 প্রমোশন শিট ➔
                </button>
              )}
            </div>
          </div>

          <div className="module-grid">
            {/* Form */}
            <div className="form-card">
              <div className="toolbar">
                <h2>{editingAnId ? 'বার্ষিক ফলাফল সম্পাদনা' : 'নতুন বার্ষিক ফলাফল ও প্রমোশন'}</h2>
                {editingAnId && <button type="button" className="mini" onClick={() => setEditingAnId(null)}>বাতিল</button>}
              </div>

              <form onSubmit={saveAnnualResult} className="form-grid">
                <input
                  placeholder="শিক্ষার্থীর নাম *"
                  value={anForm.name_bn}
                  onChange={e => setAnForm({ ...anForm, name_bn: e.target.value })}
                  required
                />
                <input
                  placeholder="রোল নম্বর *"
                  value={anForm.roll_no}
                  onChange={e => setAnForm({ ...anForm, roll_no: e.target.value })}
                  required
                />
                <select
                  value={anForm.class_name}
                  onChange={e => setAnForm({ ...anForm, class_name: e.target.value })}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                </select>
                <input
                  placeholder="শাখা / বিভাগ"
                  value={anForm.section}
                  onChange={e => setAnForm({ ...anForm, section: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="মোট প্রাপ্ত নম্বর"
                  value={anForm.marks}
                  onChange={e => setAnForm({ ...anForm, marks: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="GPA (যেমন: 5.00)"
                  value={anForm.gpa}
                  onChange={e => setAnForm({ ...anForm, gpa: e.target.value })}
                />
                <select
                  value={anForm.grade}
                  onChange={e => setAnForm({ ...anForm, grade: e.target.value })}
                >
                  <option value="A+">A+ (GPA 5.00)</option>
                  <option value="A">A (GPA 4.00 - 4.99)</option>
                  <option value="A-">A- (GPA 3.50 - 3.99)</option>
                  <option value="B">B (GPA 3.00 - 3.49)</option>
                  <option value="C">C (GPA 2.00 - 2.99)</option>
                  <option value="D">D (GPA 1.00 - 1.99)</option>
                  <option value="F">F (অকৃতকার্য)</option>
                </select>
                <input
                  type="number"
                  placeholder="মেধা স্থান (Merit Rank)"
                  value={anForm.merit_pos}
                  onChange={e => setAnForm({ ...anForm, merit_pos: e.target.value })}
                />
                <input
                  className="full"
                  placeholder="প্রমোশন স্ট্যাটাস (যেমন: ৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত)"
                  value={anForm.promotion_status}
                  onChange={e => setAnForm({ ...anForm, promotion_status: e.target.value })}
                />

                <button type="submit" className="btn full" style={{ background: '#b45309' }}>
                  {editingAnId ? '✓ ফলাফল আপডেট করুন' : '🏆 বার্ষিক ফলাফল ও প্রমোশন প্রকাশ করুন'}
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="toolbar">
                <div>
                  <h2>বার্ষিক পরীক্ষার ফলাফল তালিকা (৬ষ্ঠ-৯ম)</h2>
                  <span>মোট: {annualResults.length} জন</span>
                </div>
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    const rows = annualResults.map((r, i) => `
                      <tr>
                        <td style="text-align:center;">${i + 1}</td>
                        <td style="text-align:center;font-weight:700;">${r.roll_no}</td>
                        <td><b>${r.name_bn}</b></td>
                        <td style="text-align:center;">শ্রেণি ${r.class_name}</td>
                        <td style="text-align:center;font-weight:700;color:#047857;">${r.gpa} (${r.grade})</td>
                        <td style="text-align:center;">#${r.merit_pos || '—'}</td>
                        <td><span style="color:#047857;font-weight:700;">${r.promotion_status}</span></td>
                      </tr>
                    `).join('');
                    const tableHtml = `
                      <table>
                        <thead>
                          <tr>
                            <th>ক্রম</th>
                            <th>রোল</th>
                            <th>শিক্ষার্থীর নাম</th>
                            <th>শ্রেণি</th>
                            <th>GPA ও গ্রেড</th>
                            <th>মেধা স্থান</th>
                            <th>প্রমোশন স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                      </table>
                    `;
                    printExamReport('বার্ষিক পরীক্ষা — বার্ষিক ফলাফল ও পরবর্তী শ্রেণিতে প্রমোশন রেজিস্ট্রি', '<span><b>পরীক্ষা:</b> বার্ষিক পরীক্ষা</span><span><b>শ্রেণি:</b> ৬ষ্ঠ থেকে ৯ম (১০ম শ্রেণি বহির্ভূত)</span>', tableHtml);
                  }}
                  style={{ background: '#047857', color: '#fff', fontWeight: 700 }}
                >
                  🖨️ প্রিন্ট বার্ষিক প্রমোশন শিট
                </button>
              </div>

              <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  placeholder="শিক্ষার্থীর নাম / রোল খুঁজুন..."
                  value={anSearch}
                  onChange={e => setAnSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select value={anClassFilter} onChange={e => setAnClassFilter(e.target.value)}>
                  <option value="all">সকল শ্রেণি (৬ষ্ঠ-৯ম)</option>
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>রোল</th>
                      <th>শিক্ষার্থীর নাম</th>
                      <th>শ্রেণি</th>
                      <th>প্রাপ্ত নম্বর</th>
                      <th>GPA</th>
                      <th>মেধা স্থান</th>
                      <th>প্রমোশন স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annualResults
                      .filter(item => {
                        if (anClassFilter !== 'all' && item.class_name !== anClassFilter) return false;
                        if (!anSearch) return true;
                        return [item.name_bn, item.roll_no, item.promotion_status].filter(Boolean).join(' ').toLowerCase().includes(anSearch.toLowerCase());
                      })
                      .map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800 }}>{item.roll_no}</td>
                          <td><b>{item.name_bn}</b></td>
                          <td>শ্রেণি {item.class_name}</td>
                          <td>{item.marks}</td>
                          <td>
                            <b style={{ color: '#047857' }}>{item.gpa}</b> ({item.grade})
                          </td>
                          <td><b>#{item.merit_pos || '—'}</b></td>
                          <td>
                            <span className="status-green">✓ {item.promotion_status}</span>
                          </td>
                          <td>
                            <button type="button" className="mini" onClick={() => { setEditingAnId(item.id); setAnForm({ ...item }); }}>সম্পাদনা</button>
                            <button
                              type="button"
                              className="mini"
                              style={{ color: '#dc2626' }}
                              onClick={() => {
                                if (confirm('মুছে ফেলতে চান?')) {
                                  const up = annualResults.filter(x => x.id !== item.id);
                                  setAnnualResults(up);
                                  saveStoredAnnualResults(up);
                                }
                              }}
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: প্রাক-নির্বাচনী পরীক্ষার ফলাফল (১০ম শ্রেণি strictly) */}
      {activeTab === 'pre_test' && (
        <div>
          <div style={{
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
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
              <span style={{ fontSize: '20px' }}>🎯</span>
              <span style={{ fontSize: '13.5px', color: '#6d28d9', fontWeight: 700 }}>
                প্রাক-নির্বাচনী পরীক্ষা (Pre-Test): শুধুমাত্র ১০ম শ্রেণির শিক্ষার্থীদের এসএসসি প্রস্তুতি মূল্যায়নের জন্য নির্ধারিত।
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="mini"
                onClick={() => {
                  try { localStorage.setItem('magra_selected_exam_type', 'pre_test'); } catch(e){}
                  onNavigate('results', 'marks');
                }}
                style={{ background: '#6d28d9', color: '#fff', fontWeight: 700 }}
              >
                ✏️ বিষয়ভিত্তিক নম্বর এন্ট্রি শিট ➔
              </button>
            )}
          </div>

          <div className="module-grid">
            {/* Form */}
            <div className="form-card">
              <div className="toolbar">
                <h2>{editingPtId ? 'প্রাক-নির্বাচনী ফলাফল সম্পাদনা' : 'নতুন প্রাক-নির্বাচনী ফলাফল (১০ম)'}</h2>
                {editingPtId && <button type="button" className="mini" onClick={() => setEditingPtId(null)}>বাতিল</button>}
              </div>

              <form onSubmit={savePreTestResult} className="form-grid">
                <input
                  placeholder="১০ম শ্রেণির শিক্ষার্থীর নাম *"
                  value={ptForm.name_bn}
                  onChange={e => setPtForm({ ...ptForm, name_bn: e.target.value })}
                  required
                />
                <input
                  placeholder="রোল নম্বর *"
                  value={ptForm.roll_no}
                  onChange={e => setPtForm({ ...ptForm, roll_no: e.target.value })}
                  required
                />
                <select
                  value={ptForm.section}
                  onChange={e => setPtForm({ ...ptForm, section: e.target.value })}
                >
                  <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                  <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                  <option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option>
                </select>
                <input
                  type="number"
                  placeholder="মোট নম্বর"
                  value={ptForm.marks}
                  onChange={e => setPtForm({ ...ptForm, marks: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="GPA (যেমন: 5.00)"
                  value={ptForm.gpa}
                  onChange={e => setPtForm({ ...ptForm, gpa: e.target.value })}
                />
                <select
                  value={ptForm.grade}
                  onChange={e => setPtForm({ ...ptForm, grade: e.target.value })}
                >
                  <option value="A+">A+ (GPA 5.00)</option>
                  <option value="A">A (GPA 4.00 - 4.99)</option>
                  <option value="A-">A- (GPA 3.50 - 3.99)</option>
                  <option value="B">B (GPA 3.00 - 3.49)</option>
                  <option value="C">C (GPA 2.00 - 2.99)</option>
                  <option value="F">F (অকৃতকার্য)</option>
                </select>
                <select
                  value={ptForm.status}
                  onChange={e => setPtForm({ ...ptForm, status: e.target.value })}
                >
                  <option value="উত্তীর্ণ (চমৎকার প্রস্তুতি)">উত্তীর্ণ (চমৎকার প্রস্তুতি)</option>
                  <option value="উত্তীর্ণ (সন্তোষজনক)">উত্তীর্ণ (সন্তোষজনক)</option>
                  <option value="উত্তীর্ণ (অগ্রগতিশীল)">উত্তীর্ণ (অগ্রগতিশীল)</option>
                  <option value="বিশেষ তদারকি প্রয়োজন">বিশেষ তদারকি প্রয়োজন (Weak)</option>
                </select>
                <textarea
                  className="full"
                  rows="2"
                  placeholder="দুর্বল বিষয় বা বিশেষ দিকনির্দেশনা (ঐচ্ছিক)"
                  value={ptForm.notes}
                  onChange={e => setPtForm({ ...ptForm, notes: e.target.value })}
                />

                <button type="submit" className="btn full" style={{ background: '#7c3aed' }}>
                  {editingPtId ? '✓ প্রাক-নির্বাচনী ফলাফল আপডেট' : '➕ প্রাক-নির্বাচনী ফলাফল সংরক্ষণ'}
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="toolbar">
                <div>
                  <h2>১০ম শ্রেণির প্রাক-নির্বাচনী ফলাফল</h2>
                  <span>মোট: {preTestResults.length} জন</span>
                </div>
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    const rows = preTestResults.map((r, i) => `
                      <tr>
                        <td style="text-align:center;">${i + 1}</td>
                        <td style="text-align:center;font-weight:700;">${r.roll_no}</td>
                        <td><b>${r.name_bn}</b></td>
                        <td>${r.section}</td>
                        <td style="text-align:center;">${r.marks}</td>
                        <td style="text-align:center;font-weight:700;color:#047857;">${r.gpa} (${r.grade})</td>
                        <td>${r.status}</td>
                        <td>${r.notes || '—'}</td>
                      </tr>
                    `).join('');
                    const tableHtml = `
                      <table>
                        <thead>
                          <tr>
                            <th>ক্রম</th>
                            <th>রোল</th>
                            <th>শিক্ষার্থীর নাম</th>
                            <th>বিভাগ</th>
                            <th>নম্বর</th>
                            <th>GPA ও গ্রেড</th>
                            <th>প্রস্তুতি মূল্যায়ন</th>
                            <th>দিকনির্দেশনা</th>
                          </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                      </table>
                    `;
                    printExamReport('১০ম শ্রেণি — প্রাক-নির্বাচনী (Pre-Test) পরীক্ষার মূল্যায়ন রেজিস্ট্রি', '<span><b>শ্রেণি:</b> ১০ম শ্রেণি (এসএসসি পরীক্ষার্থী)</span><span><b>পরীক্ষা:</b> প্রাক-নির্বাচনী পরীক্ষা</span>', tableHtml);
                  }}
                  style={{ background: '#7c3aed', color: '#fff', fontWeight: 700 }}
                >
                  🖨️ প্রিন্ট প্রাক-নির্বাচনী রিপোর্ট
                </button>
              </div>

              <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  placeholder="শিক্ষার্থীর নাম / রোল খুঁজুন..."
                  value={ptSearch}
                  onChange={e => setPtSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select value={ptDeptFilter} onChange={e => setPtDeptFilter(e.target.value)}>
                  <option value="all">সকল বিভাগ (১০ম)</option>
                  <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                  <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                  <option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>রোল</th>
                      <th>শিক্ষার্থীর নাম</th>
                      <th>বিভাগ</th>
                      <th>প্রাপ্ত নম্বর</th>
                      <th>GPA</th>
                      <th>প্রস্তুতি অবস্থা</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preTestResults
                      .filter(item => {
                        if (ptDeptFilter !== 'all' && item.section !== ptDeptFilter) return false;
                        if (!ptSearch) return true;
                        return [item.name_bn, item.roll_no, item.section, item.notes].filter(Boolean).join(' ').toLowerCase().includes(ptSearch.toLowerCase());
                      })
                      .map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800 }}>{item.roll_no}</td>
                          <td><b>{item.name_bn}</b></td>
                          <td>{item.section}</td>
                          <td>{item.marks}</td>
                          <td><b style={{ color: '#047857' }}>{item.gpa}</b> ({item.grade})</td>
                          <td><span className="badge">{item.status}</span></td>
                          <td>
                            <button type="button" className="mini" onClick={() => { setEditingPtId(item.id); setPtForm({ ...item }); }}>সম্পাদনা</button>
                            <button
                              type="button"
                              className="mini"
                              style={{ color: '#dc2626' }}
                              onClick={() => {
                                if (confirm('মুছতে চান?')) {
                                  const up = preTestResults.filter(x => x.id !== item.id);
                                  setPreTestResults(up);
                                  saveStoredPreTestResults(up);
                                }
                              }}
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: নির্বাচনী পরীক্ষার ফলাফল (১০ম শ্রেণি strictly) */}
      {activeTab === 'test' && (
        <div>
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
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
              <span style={{ fontSize: '20px' }}>🎓</span>
              <span style={{ fontSize: '13.5px', color: '#065f46', fontWeight: 700 }}>
                নির্বাচনী পরীক্ষা (Test Examination): শুধুমাত্র ১০ম শ্রেণির এসএসসি পরীক্ষার্থীদের বোর্ড ফরমপূরণ ছাড়পত্রের জন্য প্রযোজ্য।
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="mini"
                onClick={() => {
                  try { localStorage.setItem('magra_selected_exam_type', 'test'); } catch(e){}
                  onNavigate('results', 'marks');
                }}
                style={{ background: '#059669', color: '#fff', fontWeight: 700 }}
              >
                ✏️ বিষয়ভিত্তিক নম্বর এন্ট্রি শিট ➔
              </button>
            )}
          </div>

          <div className="module-grid">
            {/* Form */}
            <div className="form-card">
              <div className="toolbar">
                <h2>{editingTestId ? 'নির্বাচনী ফলাফল সম্পাদনা' : 'নতুন নির্বাচনী ফলাফল ও এসএসসি ছাড়পত্র'}</h2>
                {editingTestId && <button type="button" className="mini" onClick={() => setEditingTestId(null)}>বাতিল</button>}
              </div>

              <form onSubmit={saveTestResult} className="form-grid">
                <input
                  placeholder="১০ম শ্রেণির পরীক্ষার্থীর নাম *"
                  value={testForm.name_bn}
                  onChange={e => setTestForm({ ...testForm, name_bn: e.target.value })}
                  required
                />
                <input
                  placeholder="টেস্ট রোল নম্বর *"
                  value={testForm.roll_no}
                  onChange={e => setTestForm({ ...testForm, roll_no: e.target.value })}
                  required
                />
                <select
                  value={testForm.section}
                  onChange={e => setTestForm({ ...testForm, section: e.target.value })}
                >
                  <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                  <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                  <option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option>
                </select>
                <input
                  type="number"
                  placeholder="মোট নম্বর"
                  value={testForm.marks}
                  onChange={e => setTestForm({ ...testForm, marks: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="GPA (যেমন: 5.00)"
                  value={testForm.gpa}
                  onChange={e => setTestForm({ ...testForm, gpa: e.target.value })}
                />
                <select
                  value={testForm.grade}
                  onChange={e => setTestForm({ ...testForm, grade: e.target.value })}
                >
                  <option value="A+">A+ (GPA 5.00)</option>
                  <option value="A">A (GPA 4.00 - 4.99)</option>
                  <option value="A-">A- (GPA 3.50 - 3.99)</option>
                  <option value="B">B (GPA 3.00 - 3.49)</option>
                  <option value="C">C (GPA 2.00 - 2.99)</option>
                  <option value="F">F (অকৃতকার্য)</option>
                </select>
                <input
                  className="full"
                  placeholder="বোর্ড পরীক্ষার ছাড়পত্র স্ট্যাটাস *"
                  value={testForm.ssc_clearance}
                  onChange={e => setTestForm({ ...testForm, ssc_clearance: e.target.value })}
                  required
                />

                <button type="submit" className="btn full" style={{ background: '#059669' }}>
                  {editingTestId ? '✓ নির্বাচনী ফলাফল আপডেট' : '🎯 এসএসসি ছাড়পত্র ও নির্বাচনী ফলাফল প্রকাশ'}
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="toolbar">
                <div>
                  <h2>১০ম শ্রেণির নির্বাচনী ফলাফল ও ফরমপূরণ ছাড়পত্র তালিকা</h2>
                  <span>মোট: {testResults.length} জন</span>
                </div>
                <button
                  type="button"
                  className="mini"
                  onClick={() => {
                    const rows = testResults.map((r, i) => `
                      <tr>
                        <td style="text-align:center;">${i + 1}</td>
                        <td style="text-align:center;font-weight:700;">${r.roll_no}</td>
                        <td><b>${r.name_bn}</b></td>
                        <td>${r.section}</td>
                        <td style="text-align:center;font-weight:700;color:#047857;">${r.gpa} (${r.grade})</td>
                        <td><b>${r.ssc_clearance}</b></td>
                        <td>${r.notes || '—'}</td>
                      </tr>
                    `).join('');
                    const tableHtml = `
                      <table>
                        <thead>
                          <tr>
                            <th>ক্রম</th>
                            <th>রোল</th>
                            <th>পরীক্ষার্থীর নাম</th>
                            <th>বিভাগ</th>
                            <th>GPA ও গ্রেড</th>
                            <th>এসএসসি পরীক্ষার ছাড়পত্র অবস্থা</th>
                            <th>মন্তব্য</th>
                          </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                      </table>
                    `;
                    printExamReport('১০ম শ্রেণি — নির্বাচনী (Test) পরীক্ষার ফলাফল ও এসএসসি ফরমপূরণ ছাড়পত্র তালিকা', '<span><b>শ্রেণি:</b> ১০ম শ্রেণি (এসএসসি পরীক্ষার্থী)</span><span><b>বোর্ড:</b> ঢাকা শিক্ষা বোর্ড</span>', tableHtml);
                  }}
                  style={{ background: '#059669', color: '#fff', fontWeight: 700 }}
                >
                  🖨️ প্রিন্ট এসএসসি ছাড়পত্র তালিকা
                </button>
              </div>

              <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  placeholder="শিক্ষার্থীর নাম / রোল খুঁজুন..."
                  value={testSearch}
                  onChange={e => setTestSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select value={testDeptFilter} onChange={e => setTestDeptFilter(e.target.value)}>
                  <option value="all">সকল বিভাগ (১০ম)</option>
                  <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                  <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                  <option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>রোল</th>
                      <th>শিক্ষার্থীর নাম</th>
                      <th>বিভাগ</th>
                      <th>প্রাপ্ত নম্বর</th>
                      <th>GPA</th>
                      <th>এসএসসি ছাড়পত্র</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults
                      .filter(item => {
                        if (testDeptFilter !== 'all' && item.section !== testDeptFilter) return false;
                        if (!testSearch) return true;
                        return [item.name_bn, item.roll_no, item.section, item.ssc_clearance].filter(Boolean).join(' ').toLowerCase().includes(testSearch.toLowerCase());
                      })
                      .map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800 }}>{item.roll_no}</td>
                          <td><b>{item.name_bn}</b></td>
                          <td>{item.section}</td>
                          <td>{item.marks}</td>
                          <td><b style={{ color: '#047857' }}>{item.gpa}</b> ({item.grade})</td>
                          <td>
                            <span className="status-green">✓ {item.ssc_clearance}</span>
                          </td>
                          <td>
                            <button type="button" className="mini" onClick={() => { setEditingTestId(item.id); setTestForm({ ...item }); }}>সম্পাদনা</button>
                            <button
                              type="button"
                              className="mini"
                              style={{ color: '#dc2626' }}
                              onClick={() => {
                                if (confirm('মুছতে চান?')) {
                                  const up = testResults.filter(x => x.id !== item.id);
                                  setTestResults(up);
                                  saveStoredTestResults(up);
                                }
                              }}
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: পাবলিক পরীক্ষার ফলাফল (SSC ও JSC) */}
      {activeTab === 'public_exams' && (
        <div className="module-grid">
          {/* Form */}
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingPubId ? 'পাবলিক ফলাফল সম্পাদনা' : 'নতুন পাবলিক পরীক্ষা (SSC) রেকর্ড যোগ'}</h2>
              {editingPubId && <button type="button" className="mini" onClick={() => setEditingPubId(null)}>বাতিল</button>}
            </div>

            <form onSubmit={savePublicExam} className="form-grid">
              <input
                placeholder="শিক্ষাবর্ষ (যেমন: ২০২৬) *"
                value={pubForm.year}
                onChange={e => setPubForm({ ...pubForm, year: e.target.value })}
                required
              />
              <input
                placeholder="পরীক্ষার নাম (যেমন: এসএসসি পরীক্ষা ২০২৬) *"
                value={pubForm.exam_name}
                onChange={e => setPubForm({ ...pubForm, exam_name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="মোট পরীক্ষার্থী *"
                value={pubForm.candidates}
                onChange={e => setPubForm({ ...pubForm, candidates: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="মোট উত্তীর্ণ *"
                value={pubForm.passed}
                onChange={e => setPubForm({ ...pubForm, passed: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="GPA 5.00 প্রাপ্ত"
                value={pubForm.gpa5}
                onChange={e => setPubForm({ ...pubForm, gpa5: e.target.value })}
              />
              <input
                type="number"
                placeholder="গোল্ডেন GPA 5.00"
                value={pubForm.golden_gpa5}
                onChange={e => setPubForm({ ...pubForm, golden_gpa5: e.target.value })}
              />
              <input
                placeholder="পাশের হার (যেমন: 98.50%)"
                value={pubForm.pass_rate}
                onChange={e => setPubForm({ ...pubForm, pass_rate: e.target.value })}
              />
              <input
                placeholder="শিক্ষা বোর্ড (যেমন: ঢাকা শিক্ষা বোর্ড)"
                value={pubForm.board}
                onChange={e => setPubForm({ ...pubForm, board: e.target.value })}
              />
              <textarea
                className="full"
                rows="2"
                placeholder="বিশেষ অর্জন ও হাইলাইটস"
                value={pubForm.highlights}
                onChange={e => setPubForm({ ...pubForm, highlights: e.target.value })}
              />

              <button type="submit" className="btn full" style={{ background: '#0f766e' }}>
                {editingPubId ? '✓ পাবলিক ফলাফল আপডেট' : '🏛️ পাবলিক ফলাফল আর্কাইভ সংরক্ষণ'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="toolbar">
              <div>
                <h2>বিগত বছরের পাবলিক পরীক্ষার (SSC) ঐতিহাসিক ফলাফল</h2>
                <span>মোট সেশন: {publicExams.length} টি</span>
              </div>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const rows = publicExams.map((r, i) => `
                    <tr>
                      <td style="text-align:center;font-weight:700;">${r.year}</td>
                      <td><b>${r.exam_name}</b></td>
                      <td style="text-align:center;">${r.candidates}</td>
                      <td style="text-align:center;color:#047857;font-weight:700;">${r.passed}</td>
                      <td style="text-align:center;color:#0369a1;font-weight:700;">${r.gpa5} (${r.golden_gpa5 || '—'} গোল্ডেন)</td>
                      <td style="text-align:center;font-weight:700;">${r.pass_rate}</td>
                      <td>${r.board}</td>
                    </tr>
                  `).join('');
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>সাল</th>
                          <th>পরীক্ষার নাম</th>
                          <th>পরীক্ষার্থী</th>
                          <th>উত্তীর্ণ</th>
                          <th>GPA 5.00</th>
                          <th>পাশের হার</th>
                          <th>বোর্ড</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  `;
                  printExamReport('মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — এসএসসি পাবলিক পরীক্ষার ঐতিহাসিক সাফল্য ও ফলাফল', '<span><b>বোর্ড:</b> মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা</span>', tableHtml);
                }}
                style={{ background: '#0f766e', color: '#fff', fontWeight: 700 }}
              >
                🖨️ প্রিন্ট পাবলিক ফলাফল
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শিক্ষাবর্ষ</th>
                    <th>পরীক্ষার নাম</th>
                    <th>পরীক্ষার্থী</th>
                    <th>উত্তীর্ণ</th>
                    <th>GPA 5 (A+)</th>
                    <th>পাশের হার</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {publicExams.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800 }}>{item.year}</td>
                      <td><b>{item.exam_name}</b></td>
                      <td>{item.candidates} জন</td>
                      <td style={{ color: '#047857', fontWeight: 700 }}>{item.passed} জন</td>
                      <td>
                        <b style={{ color: '#0369a1' }}>{item.gpa5} জন</b>
                        {item.golden_gpa5 && <small style={{ display: 'block', color: '#b45309' }}>গোল্ডেন: {item.golden_gpa5} জন</small>}
                      </td>
                      <td><span className="status-green">{item.pass_rate}</span></td>
                      <td>
                        <button type="button" className="mini" onClick={() => { setEditingPubId(item.id); setPubForm({ ...item }); }}>সম্পাদনা</button>
                        <button
                          type="button"
                          className="mini"
                          style={{ color: '#dc2626' }}
                          onClick={() => {
                            if (confirm('মুছতে চান?')) {
                              const up = publicExams.filter(x => x.id !== item.id);
                              setPublicExams(up);
                              saveStoredPublicExamResults(up);
                            }
                          }}
                        >
                          মুছুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Legacy Exam System / ResultPanel Wrapper (If needed) */}
      {activeTab === 'advanced_system' && ResultPanelComponent && (
        <div style={{ marginTop: '10px' }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <button
              type="button"
              className="mini"
              onClick={() => handleTabChange('half_yearly')}
              style={{ background: '#047857', color: '#ffffff', fontWeight: 800, padding: '7px 14px', borderRadius: '6px' }}
            >
              ⬅️ পরীক্ষার ফলাফল (৬টি সাবমেনু) ড্যাশবোর্ডে ফিরে যান
            </button>
            <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>
              📈 বিষয়ভিত্তিক নম্বর এন্ট্রি ও মূল্যায়ন শিট
            </span>
          </div>
          <ResultPanelComponent sub={sub} userRole={userRole} />
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
