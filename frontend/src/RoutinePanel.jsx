import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_SCHOOL, MOCK_EXAMS, MOCK_SUBJECTS, MOCK_TEACHERS } from './mockData';
import { WEEK_DAYS, DEFAULT_PERIODS, getSubjectTheme, EXAM_INSTRUCTIONS } from './routineData';
import { requestApi } from './apiClient';
import schoolLogo from '../public/school-logo.png';

// Bengali Digits & Helpers
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBnDigits = (num) => {
  if (num === null || num === undefined || num === '') return '০';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
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

export function RoutinePanel({ sub }) {
  // Navigation tabs: 'class_routine' | 'exam_routine' | 'teacher_schedule' | 'print_routine'
  const [activeTab, setActiveTab] = useState(() => {
    if (sub === 'exam_routine') return 'exam_routine';
    if (sub === 'teacher_schedule') return 'teacher_schedule';
    if (sub === 'print_routine') return 'print_routine';
    return 'class_routine';
  });

  useEffect(() => {
    if (sub === 'exam_routine') setActiveTab('exam_routine');
    else if (sub === 'teacher_schedule') setActiveTab('teacher_schedule');
    else if (sub === 'print_routine') setActiveTab('print_routine');
    else if (sub === 'class_routine') setActiveTab('class_routine');
  }, [sub]);

  // Main state
  const [classRoutines, setClassRoutines] = useState([]);
  const [examRoutines, setExamRoutines] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'success' });

  // Class Routine filters
  const [selectedClass, setSelectedClass] = useState('6');
  const [selectedSection, setSelectedSection] = useState('all');
  const [classViewMode, setClassViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // Exam Routine filters
  const [selectedExamId, setSelectedExamId] = useState('ex-2');
  const [selectedExamClass, setSelectedExamClass] = useState('all');

  // Teacher Schedule filter
  const [selectedTeacherName, setSelectedTeacherName] = useState('মোঃ আনোয়ার হোসেন');

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassSlot, setEditingClassSlot] = useState(null);
  const [classForm, setClassForm] = useState({
    class_name: '6',
    section: 'পদ্মা শাখা',
    day_of_week: '1',
    period_no: '1',
    start_time: '10:00',
    end_time: '10:45',
    subject_name: 'বাংলা ১ম পত্র',
    subject_code: '১০১',
    teacher_name: 'মোঃ সাইদুর রহমান',
    room: '১০১'
  });

  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExamSlot, setEditingExamSlot] = useState(null);
  const [examForm, setExamForm] = useState({
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'বাংলা ১ম পত্র',
    subject_code: '১০১',
    exam_date: '2026-06-15',
    day_name: 'রবিবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোঃ আনোয়ার হোসেন, তাপসী সরকার',
    instructions: 'পরীক্ষা শুরুর ৩০ মিনিট পূর্বে হলে উপস্থিত হতে হবে।'
  });

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, erData, sData, tData, exData] = await Promise.all([
        requestApi('/routines'),
        requestApi('/exam_routines'),
        requestApi('/subjects'),
        requestApi('/teachers?status=active'),
        requestApi('/exams')
      ]);

      setClassRoutines(Array.isArray(rData) ? rData : []);
      setExamRoutines(Array.isArray(erData) ? erData : []);
      setSubjects(Array.isArray(sData) ? sData : MOCK_SUBJECTS);
      setTeachers(Array.isArray(tData) && tData.length ? tData : MOCK_TEACHERS);
      setExams(Array.isArray(exData) && exData.length ? exData : MOCK_EXAMS);
    } catch (err) {
      console.error('Failed to load routine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Today's day indicator (1: Sunday, 2: Monday, ..., 5: Thursday)
  const currentJsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const todayWeekDayId = currentJsDay === 0 ? '1' : String(currentJsDay);

  // Filtered Class Routines
  const filteredClassRoutines = useMemo(() => {
    return classRoutines.filter(r => {
      if (selectedClass !== 'all' && String(r.class_name) !== String(selectedClass)) return false;
      if (selectedSection !== 'all' && r.section && !r.section.includes(selectedSection) && !selectedSection.includes(r.section)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSub = (r.subject_name || '').toLowerCase().includes(q);
        const matchTeach = (r.teacher_name || '').toLowerCase().includes(q);
        const matchRoom = (r.room || '').toLowerCase().includes(q);
        const matchCode = (r.subject_code || '').toLowerCase().includes(q);
        if (!matchSub && !matchTeach && !matchRoom && !matchCode) return false;
      }
      return true;
    });
  }, [classRoutines, selectedClass, selectedSection, searchQuery]);

  // Filtered Exam Routines
  const filteredExamRoutines = useMemo(() => {
    return examRoutines.filter(e => {
      if (selectedExamId !== 'all' && String(e.exam_id) !== String(selectedExamId)) return false;
      if (selectedExamClass !== 'all' && String(e.class_name) !== String(selectedExamClass) && e.class_name !== 'all' && e.class_name !== 'সকল শ্রেণি') return false;
      return true;
    });
  }, [examRoutines, selectedExamId, selectedExamClass]);

  // Teacher Schedule List
  const teacherRoutines = useMemo(() => {
    if (!selectedTeacherName) return [];
    return classRoutines.filter(r => (r.teacher_name || '').includes(selectedTeacherName) || selectedTeacherName.includes(r.teacher_name || ''));
  }, [classRoutines, selectedTeacherName]);

  // Summary Counters
  const summaryStats = useMemo(() => {
    const totalSlots = classRoutines.length;
    const totalExamsCount = examRoutines.length;
    const activeClasses = ['৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];
    const todayClassesCount = classRoutines.filter(r => String(r.day_of_week) === todayWeekDayId).length;
    return { totalSlots, totalExamsCount, activeClasses, todayClassesCount };
  }, [classRoutines, examRoutines, todayWeekDayId]);

  // Handle Class Routine Save
  const handleSaveClassSlot = async (e) => {
    e.preventDefault();
    try {
      if (editingClassSlot) {
        await requestApi(`/routines/${editingClassSlot.id}`, {
          method: 'PUT',
          body: JSON.stringify(classForm)
        });
        setMsg({ text: 'ক্লাস রুটিন স্লট সফলভাবে আপডেট করা হয়েছে!', type: 'success' });
      } else {
        await requestApi('/routines', {
          method: 'POST',
          body: JSON.stringify(classForm)
        });
        setMsg({ text: 'নতুন ক্লাস রুটিন পিরিয়ড সফলভাবে যোগ করা হয়েছে!', type: 'success' });
      }
      setShowClassModal(false);
      setEditingClassSlot(null);
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleDeleteClassSlot = async (slotId) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ক্লাস পিরিয়ড স্লটটি মুছে ফেলতে চান?')) return;
    try {
      await requestApi(`/routines/${slotId}`, { method: 'DELETE' });
      setMsg({ text: 'স্লটটি সফলভাবে মুছে ফেলা হয়েছে।', type: 'success' });
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  // Handle Exam Routine Save
  const handleSaveExamSlot = async (e) => {
    e.preventDefault();
    try {
      if (editingExamSlot) {
        await requestApi(`/exam_routines/${editingExamSlot.id}`, {
          method: 'PUT',
          body: JSON.stringify(examForm)
        });
        setMsg({ text: 'পরীক্ষার সময়সূচি সফলভাবে আপডেট হয়েছে!', type: 'success' });
      } else {
        await requestApi('/exam_routines', {
          method: 'POST',
          body: JSON.stringify(examForm)
        });
        setMsg({ text: 'নতুন পরীক্ষার সময়সূচি সফলভাবে তৈরি হয়েছে!', type: 'success' });
      }
      setShowExamModal(false);
      setEditingExamSlot(null);
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleDeleteExamSlot = async (slotId) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই পরীক্ষার সময়সূচিটি মুছে ফেলতে চান?')) return;
    try {
      await requestApi(`/exam_routines/${slotId}`, { method: 'DELETE' });
      setMsg({ text: 'পরীক্ষার সময়সূচি মুছে ফেলা হয়েছে।', type: 'success' });
      loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  // Official Print Function
  const handlePrintRoutine = (type = 'class') => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে পপ-আপ অনুমোদন করুন।');
      return;
    }

    const school = MOCK_SCHOOL;
    const isClass = type === 'class';

    let titleText = '';
    let bodyContent = '';

    if (isClass) {
      const clsLabel = selectedClass === 'all' ? 'সকল শ্রেণি' : `${toBnDigits(selectedClass)}ম শ্রেণি`;
      titleText = `${clsLabel}র প্রাতিষ্ঠানিক সাপ্তাহিক ক্লাস রুটিন - ২০২৬`;

      // Build grid table for print
      bodyContent = `
        <div style="text-align:center; margin-bottom: 15px;">
          <h2 style="margin: 0 0 4px; font-size: 19px; color: #0f172a;">${titleText}</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">শ্রেণি: <b>${clsLabel}</b> | শাখা/বিভাগ: <b>${selectedSection === 'all' ? 'সকল শাখা' : selectedSection}</b> | শিক্ষাবর্ষ: <b>২০২৬ খ্রি.</b></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px;">
          <thead>
            <tr style="background: #f1f5f9; color: #0f172a;">
              <th style="border: 1px solid #94a3b8; padding: 8px; width: 85px;">বার / দিন</th>
              ${DEFAULT_PERIODS.map(p => `
                <th style="border: 1px solid #94a3b8; padding: 6px; text-align: center;">
                  <b>${p.name_bn}</b><br/>
                  <small style="font-size: 10px; color: #475569;">${toBnDigits(p.start_time)} - ${toBnDigits(p.end_time)}</small>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${WEEK_DAYS.map(day => `
              <tr>
                <td style="border: 1px solid #94a3b8; padding: 8px; font-weight: bold; background: #f8fafc; text-align: center;">
                  ${day.name_bn}
                </td>
                ${DEFAULT_PERIODS.map(period => {
                  if (period.is_break) {
                    return `
                      <td style="border: 1px solid #94a3b8; padding: 4px; text-align: center; background: #fffbeb; font-size: 10.5px; color: #b45309; font-weight: bold;">
                        🥪 টিফিন ও নামাজ বিরতি
                      </td>
                    `;
                  }
                  const slot = filteredClassRoutines.find(r => String(r.day_of_week) === String(day.id) && String(r.period_no) === String(period.period_no));
                  if (!slot) {
                    return `<td style="border: 1px solid #94a3b8; padding: 4px; text-align: center; color: #cbd5e1;">—</td>`;
                  }
                  return `
                    <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center; background: #ffffff;">
                      <b style="color: #0369a1; font-size: 12px;">${slot.subject_name}</b><br/>
                      <small style="color: #334155;">👨‍🏫 ${slot.teacher_name}</small><br/>
                      <small style="color: #64748b; font-size: 10px;">🚪 কক্ষ: ${slot.room || '১০১'}</small>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      const activeExamObj = exams.find(e => String(e.id) === String(selectedExamId)) || { name_bn: 'অর্ধবার্ষিক পরীক্ষা ২০২৬' };
      titleText = `${activeExamObj.name_bn} এর প্রাতিষ্ঠানিক সময়সূচি ও পরীক্ষার রুটিন`;

      bodyContent = `
        <div style="text-align:center; margin-bottom: 15px;">
          <h2 style="margin: 0 0 4px; font-size: 19px; color: #0f172a;">${titleText}</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">শিক্ষাবর্ষ: <b>২০২৬ খ্রি.</b> | কেন্দ্র কোড: <b>১১৭ (কালিহাতি)</b> | সময়: <b>সকাল ১০:০০ টা হতে দুপুর ০১:০০ টা</b></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f1f5f9; color: #0f172a;">
              <th style="border: 1px solid #94a3b8; padding: 8px; width: 45px; text-align: center;">ক্র.</th>
              <th style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">তারিখ ও বার</th>
              <th style="border: 1px solid #94a3b8; padding: 8px;">শ্রেণি ও বিভাগ</th>
              <th style="border: 1px solid #94a3b8; padding: 8px;">বিষয় ও বিষয় কোড</th>
              <th style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">সময়</th>
              <th style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">পূর্ণমান</th>
              <th style="border: 1px solid #94a3b8; padding: 8px;">পরীক্ষা কক্ষ</th>
              <th style="border: 1px solid #94a3b8; padding: 8px;">হল পরিদর্শক</th>
            </tr>
          </thead>
          <tbody>
            ${filteredExamRoutines.map((ex, idx) => `
              <tr>
                <td style="border: 1px solid #94a3b8; padding: 7px; text-align: center; font-weight: bold;">${toBnDigits(idx + 1)}</td>
                <td style="border: 1px solid #94a3b8; padding: 7px; text-align: center;">
                  <b>${formatDateBn(ex.exam_date)}</b><br/>
                  <small style="color: #64748b;">${ex.day_name}</small>
                </td>
                <td style="border: 1px solid #94a3b8; padding: 7px;">
                  <b>${ex.class_name === 'all' || ex.class_name === 'সকল শ্রেণি' ? '৬ষ্ঠ থেকে ১০ম' : `${toBnDigits(ex.class_name)}ম শ্রেণি`}</b><br/>
                  <small style="color: #475569;">${ex.section || 'সকল শাখা'}</small>
                </td>
                <td style="border: 1px solid #94a3b8; padding: 7px;">
                  <b style="color: #0369a1;">${ex.subject_name}</b><br/>
                  <small style="color: #64748b;">বিষয় কোড: ${toBnDigits(ex.subject_code || '১০১')}</small>
                </td>
                <td style="border: 1px solid #94a3b8; padding: 7px; text-align: center; font-weight: 600;">
                  ${toBnDigits(ex.start_time)} - ${toBnDigits(ex.end_time)}
                </td>
                <td style="border: 1px solid #94a3b8; padding: 7px; text-align: center; font-weight: bold; color: #047857;">
                  ${toBnDigits(ex.full_marks || 100)}
                </td>
                <td style="border: 1px solid #94a3b8; padding: 7px;">${ex.room_no || '১০১-২০৩'}</td>
                <td style="border: 1px solid #94a3b8; padding: 7px; font-size: 11px;">${ex.invigilator || 'নির্ধারিত শিক্ষকবৃন্দ'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 6px; font-size: 11.5px; margin-bottom: 25px;">
          <h4 style="margin: 0 0 6px; color: #92400e; font-size: 12.5px;">📌 পরীক্ষার্থীদের জন্য জরুরি সাধারণ নির্দেশনাবলী:</h4>
          <ol style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.6;">
            ${EXAM_INSTRUCTIONS.slice(0, 5).map(ins => `<li>${ins}</li>`).join('')}
          </ol>
        </div>
      `;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${titleText}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: ${isClass ? 'landscape' : 'portrait'}; margin: 12mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Segoe UI', Tahoma, sans-serif; color: #0f172a; margin: 0; padding: 10px; background: #fff; }
          .official-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px double #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
          .header-left { display: flex; align-items: center; gap: 14px; }
          .school-logo { width: 68px; height: 68px; object-fit: contain; }
          .school-info h1 { margin: 0; font-size: 21px; font-weight: 800; color: #0369a1; }
          .school-info p { margin: 2px 0 0; font-size: 12.5px; color: #334155; }
          .header-right { text-align: right; font-size: 11.5px; color: #475569; }
          .pill-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-bottom: 3px; font-size: 11px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 20px; }
          .sig-box { text-align: center; width: 180px; }
          .sig-line { border-top: 1.5px dashed #475569; margin-bottom: 5px; }
          .sig-title { font-size: 12px; font-weight: bold; color: #0f172a; }
          .sig-sub { font-size: 10.5px; color: #64748b; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="official-header">
          <div class="header-left">
            <img src="${schoolLogo}" class="school-logo" alt="School Logo" />
            <div class="school-info">
              <h1>${school.name_bn}</h1>
              <p>${school.address} • স্থাপিত: ১৯৪৬ খ্রি.</p>
              <p style="font-size: 11px; color: #64748b;">ই-মেইল: magrapuhighschool@gmail.com | মোবাইল: ০১৭১২-৩৪৫৬৭৮</p>
            </div>
          </div>
          <div class="header-right">
            <span class="pill-badge">EIIN: ${toBnDigits(school.eiin || 114290)}</span><br/>
            <span>স্মারক নং: মপাউবি/রুটিন/২০২৬</span><br/>
            <span>মুদ্রণের তারিখ: ${formatDateBn(new Date().toISOString().slice(0, 10))}</span>
          </div>
        </div>

        ${bodyContent}

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">আহ্বায়ক / সদস্য সচিব</div>
            <div class="sig-sub">রুটিন প্রণয়ন কমিটি</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">সহকারী প্রধান শিক্ষক</div>
            <div class="sig-sub">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">প্রধান শিক্ষক</div>
            <div class="sig-sub">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWin.document.close();
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 450);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Banner & Quick Actions */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0369a1 100%)',
        borderRadius: '14px',
        padding: '20px 24px',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(15, 118, 110, 0.15)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            🗓️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>একাডেমিক রুটিন ও সময়সূচি ব্যবস্থাপনা</h2>
              <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                ২০২৬ শিক্ষাবর্ষ
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', opacity: 0.9 }}>
              শ্রেণিভিত্তিক সাপ্তাহিক ক্লাস রুটিন এবং পরীক্ষার পূর্ণাঙ্গ সময়সূচি প্রণয়ন, ট্র্যাকিং ও অফিসিয়াল মুদ্রণ
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handlePrintRoutine(activeTab === 'exam_routine' ? 'exam' : 'class')}
            style={{
              background: '#ffffff',
              color: '#0f766e',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <span>🖨️</span> রুটিন প্রিন্ট / PDF
          </button>

          {activeTab === 'exam_routine' ? (
            <button
              type="button"
              onClick={() => {
                setEditingExamSlot(null);
                setExamForm({
                  exam_id: selectedExamId !== 'all' ? selectedExamId : 'ex-2',
                  exam_name: exams.find(e => String(e.id) === String(selectedExamId))?.name_bn || 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
                  academic_year: '2026',
                  class_name: '6',
                  section: 'সকল শাখা',
                  subject_name: 'বাংলা ১ম পত্র',
                  subject_code: '১০১',
                  exam_date: new Date().toISOString().slice(0, 10),
                  day_name: 'রবিবার',
                  start_time: '10:00',
                  end_time: '13:00',
                  duration: '৩ ঘণ্টা',
                  full_marks: 100,
                  room_no: '১০১, ১০২, ২০১',
                  invigilator: 'মোঃ আনোয়ার হোসেন',
                  instructions: 'পরীক্ষা শুরুর ৩০ মিনিট পূর্বে হলে উপস্থিত হতে হবে।'
                });
                setShowExamModal(true);
              }}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন পরীক্ষার সময়সূচি
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingClassSlot(null);
                setClassForm({
                  class_name: selectedClass !== 'all' ? selectedClass : '6',
                  section: ['9', '10'].includes(String(selectedClass)) ? 'বিজ্ঞান বিভাগ' : 'পদ্মা শাখা',
                  day_of_week: '1',
                  period_no: '1',
                  start_time: '10:00',
                  end_time: '10:45',
                  subject_name: 'বাংলা ১ম পত্র',
                  subject_code: '১০১',
                  teacher_name: 'মোঃ সাইদুর রহমান',
                  room: '১০১'
                });
                setShowClassModal(true);
              }}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন ক্লাস পিরিয়ড
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {msg.text && (
        <div style={{
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fca5a5'}`,
          color: msg.type === 'success' ? '#166534' : '#b91c1c',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
          {msg.text}
        </div>
      )}

      {/* 2. Top Metric Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>সাপ্তাহিক ক্লাস পিরিয়ড</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f766e', marginTop: '4px' }}>
            {toBnDigits(summaryStats.totalSlots)} টি
          </div>
          <small style={{ color: '#0f766e', fontSize: '11px' }}>৫টি শ্রেণিতে সক্রিয় স্লট</small>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>দৈনিক পিরিয়ড সংখ্যা</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
            ৭ টি + বিরতি
          </div>
          <small style={{ color: '#0284c7', fontSize: '11px' }}>সকাল ১০:০০ হতে বিকাল ৩:৪০</small>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>পরীক্ষার নির্ধারিত বিষয়</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
            {toBnDigits(summaryStats.totalExamsCount)} টি
          </div>
          <small style={{ color: '#b45309', fontSize: '11px' }}>অর্ধবার্ষিক ও সাময়িক রুটিন</small>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>আজকের সক্রিয় ক্লাস</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
            {toBnDigits(summaryStats.todayClassesCount)} টি
          </div>
          <small style={{ color: '#15803d', fontSize: '11px' }}>
            {WEEK_DAYS.find(d => d.id === todayWeekDayId)?.name_bn || 'আজকের দিন'} এর সময়সূচি
          </small>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '4px'
      }}>
        {[
          { key: 'class_routine', label: '📅 ক্লাস রুটিন (Class Routine)', badge: `${classRoutines.length}` },
          { key: 'exam_routine', label: '📝 পরীক্ষার রুটিন (Exam Schedule)', badge: `${examRoutines.length}` },
          { key: 'teacher_schedule', label: '👨‍🏫 শিক্ষকভিত্তিক সময়সূচি (Teacher Schedule)' },
          { key: 'print_routine', label: '🖨️ প্রিন্ট ও অফিসিয়াল রুটিন ডাউনলোড' }
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: activeTab === t.key ? '#0f766e' : '#f1f5f9',
              color: activeTab === t.key ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            {t.label}
            {t.badge && (
              <span style={{
                background: activeTab === t.key ? '#ffffff' : '#cbd5e1',
                color: activeTab === t.key ? '#0f766e' : '#334155',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 900
              }}>
                {toBnDigits(t.badge)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CLASS ROUTINE (সাপ্তাহিক ক্লাস রুটিন)           */}
      {/* ======================================================== */}
      {activeTab === 'class_routine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Filters Bar */}
          <div style={{
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>শ্রেণি নির্বাচন:</label>
                <select
                  value={selectedClass}
                  onChange={e => {
                    setSelectedClass(e.target.value);
                    if (['9', '10'].includes(e.target.value)) setSelectedSection('all');
                  }}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: '1.5px solid #0f766e', fontSize: '13px', fontWeight: 700, color: '#0f766e' }}
                >
                  <option value="all">সকল শ্রেণি</option>
                  <option value="6">৬ষ্ঠ শ্রেণি</option>
                  <option value="7">৭ম শ্রেণি</option>
                  <option value="8">৮ম শ্রেণি</option>
                  <option value="9">৯ম শ্রেণি</option>
                  <option value="10">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  {['9', '10'].includes(String(selectedClass)) ? 'বিভাগ নির্বাচন:' : 'শাখা নির্বাচন:'}
                </label>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                >
                  <option value="all">সকল শাখা / বিভাগ</option>
                  {['9', '10'].includes(String(selectedClass)) ? (
                    <>
                      <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                      <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
                    </>
                  ) : (
                    <>
                      <option value="পদ্মা শাখা">পদ্মা শাখা</option>
                      <option value="মেঘনা শাখা">মেঘনা শাখা</option>
                      <option value="যমুনা শাখা">যমুনা শাখা</option>
                      <option value="ক শাখা">ক শাখা</option>
                      <option value="খ শাখা">খ শাখা</option>
                      <option value="সাধারণ শাখা">সাধারণ শাখা</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>অনুসন্ধান:</label>
                <input
                  type="text"
                  placeholder="বিষয়, শিক্ষক বা রুম নং..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '180px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#f1f5f9', padding: '3px', borderRadius: '6px', display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => setClassViewMode('grid')}
                  style={{
                    background: classViewMode === 'grid' ? '#ffffff' : 'transparent',
                    color: classViewMode === 'grid' ? '#0f766e' : '#64748b',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: classViewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  ▦ গ্রিড টাইমটেবিল
                </button>
                <button
                  type="button"
                  onClick={() => setClassViewMode('list')}
                  style={{
                    background: classViewMode === 'list' ? '#ffffff' : 'transparent',
                    color: classViewMode === 'list' ? '#0f766e' : '#64748b',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: classViewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  ☰ তালিকা ভিউ
                </button>
              </div>
            </div>
          </div>

          {/* VIEW A: WEEKLY GRID TIMETABLE */}
          {classViewMode === 'grid' ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                    {selectedClass === 'all' ? 'সকল শ্রেণির সাপ্তাহিক ক্লাস শিডিউল' : `${toBnDigits(selectedClass)}ম শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন`}
                  </h3>
                  <small style={{ color: '#64748b' }}>সকাল ১০:০০ হতে বিকাল ৩:৪০ পর্যন্ত • প্রতি পিরিয়ড ৪৫/৪০ মিনিট</small>
                </div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                  লাইভ একাডেমিক শিডিউল সক্রিয়
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'center', width: '110px', fontSize: '12.5px', color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                      বার / দিন
                    </th>
                    {DEFAULT_PERIODS.map(p => (
                      <th
                        key={p.period_no}
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '12px',
                          color: p.is_break ? '#b45309' : '#0f766e',
                          borderRight: '1px solid #e2e8f0',
                          background: p.is_break ? '#fefce8' : '#f8fafc'
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>{p.name_bn}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                          {toBnDigits(p.start_time)} - {toBnDigits(p.end_time)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEEK_DAYS.map(day => {
                    const isToday = day.id === todayWeekDayId;
                    return (
                      <tr
                        key={day.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          background: isToday ? '#f0fdf4' : '#ffffff'
                        }}
                      >
                        {/* Day Cell */}
                        <td style={{
                          padding: '14px 10px',
                          textAlign: 'center',
                          borderRight: '1px solid #e2e8f0',
                          background: isToday ? '#dcfce7' : '#f8fafc'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: isToday ? '#15803d' : '#1e293b' }}>
                            {day.name_bn}
                          </div>
                          {isToday && (
                            <span style={{ display: 'inline-block', background: '#16a34a', color: '#fff', fontSize: '9.5px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', marginTop: '3px' }}>
                              আজকের ক্লাস
                            </span>
                          )}
                        </td>

                        {/* Period Cells */}
                        {DEFAULT_PERIODS.map(period => {
                          if (period.is_break) {
                            return (
                              <td
                                key={period.period_no}
                                style={{
                                  padding: '8px 4px',
                                  textAlign: 'center',
                                  background: '#fffbeb',
                                  borderRight: '1px solid #e2e8f0',
                                  color: '#b45309',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}
                              >
                                🥪 টিফিন ও নামাজ
                              </td>
                            );
                          }

                          // Find slot for this day & period
                          const slot = filteredClassRoutines.find(r =>
                            String(r.day_of_week) === String(day.id) &&
                            String(r.period_no) === String(period.period_no)
                          );

                          if (!slot) {
                            return (
                              <td
                                key={period.period_no}
                                style={{
                                  padding: '10px 8px',
                                  textAlign: 'center',
                                  borderRight: '1px solid #e2e8f0',
                                  color: '#94a3b8'
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingClassSlot(null);
                                    setClassForm({
                                      class_name: selectedClass !== 'all' ? selectedClass : '6',
                                      section: ['9', '10'].includes(String(selectedClass)) ? 'বিজ্ঞান বিভাগ' : 'পদ্মা শাখা',
                                      day_of_week: day.id,
                                      period_no: period.period_no,
                                      start_time: period.start_time,
                                      end_time: period.end_time,
                                      subject_name: 'বাংলা ১ম পত্র',
                                      subject_code: '১০১',
                                      teacher_name: 'মোঃ সাইদুর রহমান',
                                      room: '১০১'
                                    });
                                    setShowClassModal(true);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: '1px dashed #cbd5e1',
                                    color: '#94a3b8',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  + যোগ করুন
                                </button>
                              </td>
                            );
                          }

                          const theme = getSubjectTheme(slot.subject_name);

                          return (
                            <td
                              key={period.period_no}
                              style={{
                                padding: '8px',
                                borderRight: '1px solid #e2e8f0',
                                verticalAlign: 'top'
                              }}
                            >
                              <div style={{
                                background: theme.bg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                padding: '8px',
                                position: 'relative'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ fontWeight: 800, fontSize: '12px', color: theme.text }}>
                                    {theme.icon} {slot.subject_name}
                                  </div>
                                  <div style={{ display: 'flex', gap: '2px' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingClassSlot(slot);
                                        setClassForm({ ...slot });
                                        setShowClassModal(true);
                                      }}
                                      title="সম্পাদনা"
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', fontSize: '11px' }}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClassSlot(slot.id)}
                                      title="মুছুন"
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', fontSize: '11px' }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>

                                <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600, marginTop: '4px' }}>
                                  👨‍🏫 {slot.teacher_name}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
                                  <span>🚪 কক্ষ {toBnDigits(slot.room || '১০১')}</span>
                                  {slot.class_name && (
                                    <span style={{ background: '#ffffff', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                                      {toBnDigits(slot.class_name)}ম
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW B: LIST TABLE */
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                  ক্লাস রুটিন স্লট তালিকা ({toBnDigits(filteredClassRoutines.length)} টি)
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>শ্রেণি ও শাখা</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>বার</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>পিরিয়ড</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>সময়</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>বিষয়</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>শিক্ষক</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>কক্ষ নং</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>কাজ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClassRoutines.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f766e' }}>
                          {toBnDigits(r.class_name)}ম শ্রেণি {r.section ? `(${r.section})` : ''}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                          {WEEK_DAYS.find(d => d.id === String(r.day_of_week))?.name_bn || r.day_of_week}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                            {toBnDigits(r.period_no)}ম
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>
                          {toBnDigits(r.start_time)} - {toBnDigits(r.end_time)}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {r.subject_name}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#334155' }}>
                          👨‍🏫 {r.teacher_name}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                          🚪 {toBnDigits(r.room || '১০১')}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClassSlot(r);
                              setClassForm({ ...r });
                              setShowClassModal(true);
                            }}
                            style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginRight: '6px' }}
                          >
                            সম্পাদনা
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClassSlot(r.id)}
                            style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filteredClassRoutines.length && (
                      <tr>
                        <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          কোনো ক্লাস রুটিন তথ্য পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EXAM ROUTINE (পরীক্ষার রুটিন ও সময়সূচি)           */}
      {/* ======================================================== */}
      {activeTab === 'exam_routine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Exam Filters Bar */}
          <div style={{
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>পরীক্ষা নির্বাচন:</label>
                <select
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: '1.5px solid #f59e0b', fontSize: '13px', fontWeight: 700, color: '#b45309' }}
                >
                  <option value="all">সকল পরীক্ষা</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name_bn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>শ্রেণি নির্বাচন:</label>
                <select
                  value={selectedExamClass}
                  onChange={e => setSelectedExamClass(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                >
                  <option value="all">সকল শ্রেণি (৬ষ্ঠ - ১০ম)</option>
                  <option value="6">৬ষ্ঠ শ্রেণি</option>
                  <option value="7">৭ম শ্রেণি</option>
                  <option value="8">৮ম শ্রেণি</option>
                  <option value="9">৯ম শ্রেণি</option>
                  <option value="10">১০ম শ্রেণি</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePrintRoutine('exam')}
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>🖨️</span> পরীক্ষার রুটিন প্রিন্ট
              </button>
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#92400e', fontWeight: 800 }}>
                  {exams.find(e => String(e.id) === String(selectedExamId))?.name_bn || 'পরীক্ষার পূর্ণাঙ্গ সময়সূচি'}
                </h3>
                <small style={{ color: '#78350f' }}>কেন্দ্র: মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় (কোড: ১১৭) • সময়: সকাল ১০:০০ - দুপুর ০১:০০</small>
              </div>
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                মোট পরীক্ষা: {toBnDigits(filteredExamRoutines.length)} টি
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '50px' }}>ক্র.</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>তারিখ ও বার</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>শ্রেণি ও বিভাগ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>বিষয় ও কোড</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>সময়</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>পূর্ণমান</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>কক্ষ নম্বর</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>হল পরিদর্শক</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamRoutines.map((ex, idx) => (
                    <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>
                        {toBnDigits(idx + 1)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '13px' }}>
                          {formatDateBn(ex.exam_date)}
                        </div>
                        <small style={{ color: '#64748b', fontWeight: 600 }}>{ex.day_name}</small>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {ex.class_name === 'all' || ex.class_name === 'সকল শ্রেণি' ? '৬ষ্ঠ থেকে ১০ম' : `${toBnDigits(ex.class_name)}ম শ্রেণি`}
                        </div>
                        <small style={{ color: '#475569' }}>{ex.section || 'সকল শাখা'}</small>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '13px' }}>
                          {ex.subject_name}
                        </div>
                        <small style={{ color: '#64748b' }}>কোড: {toBnDigits(ex.subject_code || '১০১')}</small>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                        {toBnDigits(ex.start_time)} - {toBnDigits(ex.end_time)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                          {toBnDigits(ex.full_marks || 100)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>
                        🚪 {ex.room_no || '১০১-২০৩'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '12px' }}>
                        {ex.invigilator || 'নির্ধারিত শিক্ষকবৃন্দ'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExamSlot(ex);
                            setExamForm({ ...ex });
                            setShowExamModal(true);
                          }}
                          style={{ background: '#fef3c7', color: '#92400e', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginRight: '6px' }}
                        >
                          সম্পাদনা
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExamSlot(ex.id)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          মুছুন
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredExamRoutines.length && (
                    <tr>
                      <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        কোনো পরীক্ষার সময়সূচি তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Guidelines Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #fed7aa', padding: '18px 22px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>📜</span>
              <h4 style={{ margin: 0, color: '#9a3412', fontSize: '15px', fontWeight: 800 }}>
                পরীক্ষার্থীদের জন্য জরুরি সাধারণ নির্দেশনাবলী:
              </h4>
            </div>
            <ol style={{ margin: 0, paddingLeft: '22px', color: '#7c2d12', fontSize: '12.5px', lineHeight: 1.8 }}>
              {EXAM_INSTRUCTIONS.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TEACHER SCHEDULE (শিক্ষকভিত্তিক ক্লাস শিডিউল)     */}
      {/* ======================================================== */}
      {activeTab === 'teacher_schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                শিক্ষক নির্বাচন করুন:
              </label>
              <select
                value={selectedTeacherName}
                onChange={e => setSelectedTeacherName(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #0f766e', fontSize: '13.5px', fontWeight: 700, color: '#0f766e', minWidth: '240px' }}
              >
                {teachers.map(t => (
                  <option key={t.id || t.name_bn} value={t.name_bn}>{t.name_bn} ({t.designation || 'সহকারী শিক্ষক'})</option>
                ))}
              </select>
            </div>

            <div style={{ background: '#f0fdf4', padding: '10px 16px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>সাপ্তাহিক মোট ক্লাস লোড</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>
                {toBnDigits(teacherRoutines.length)} টি পিরিয়ড
              </div>
            </div>
          </div>

          {/* Teacher Weekly Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                {selectedTeacherName} - এর সাপ্তাহিক ক্লাস সময়সূচি
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>বার / দিন</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>পিরিয়ড নং</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>সময়</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>শ্রেণি ও শাখা</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>বিষয়</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>কক্ষ নম্বর</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherRoutines.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f766e' }}>
                        {WEEK_DAYS.find(d => d.id === String(r.day_of_week))?.name_bn || r.day_of_week}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                          {toBnDigits(r.period_no)}ম পিরিয়ড
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>
                        {toBnDigits(r.start_time)} - {toBnDigits(r.end_time)}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                        {toBnDigits(r.class_name)}ম শ্রেণি {r.section ? `(${r.section})` : ''}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1' }}>
                        {r.subject_name}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                        🚪 কক্ষ {toBnDigits(r.room || '১০১')}
                      </td>
                    </tr>
                  ))}
                  {!teacherRoutines.length && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        নির্বাচিত শিক্ষকের কোনো নির্ধারিত ক্লাস স্লট পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PRINT & PDF CENTER (অফিসিয়াল প্রিন্ট সেন্টার)       */}
      {/* ======================================================== */}
      {activeTab === 'print_routine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#0f766e', fontWeight: 800 }}>
              🖨️ অফিসিয়াল প্রাতিষ্ঠানিক রুটিন প্রিন্ট ও PDF ডাউনলোড
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#475569' }}>
              নিচের অপশনসমূহ ব্যবহার করে প্রাতিষ্ঠানিক প্যাড, লোগো এবং প্রধান শিক্ষক ও রুটিন কমিটির স্বাক্ষর সহ সরাসরি রঙিন অথবা সাদা-কালো প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন।
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1.5px solid #0f766e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📅</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>সাপ্তাহিক ক্লাস রুটিন</h4>
                    <small style={{ color: '#64748b' }}>শ্রেণি ও শাখা ভিত্তিক সাপ্তাহিক টাইমটেবিল</small>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  সকল শ্রেণির পিরিয়ড ও টিফিন বিরতি সংবলিত পরিষ্কার ল্যান্ডস্কেপ গ্রিড শিট।
                </p>
                <button
                  type="button"
                  onClick={() => handlePrintRoutine('class')}
                  style={{
                    width: '100%',
                    background: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  🖨️ ক্লাস রুটিন প্রিন্ট / PDF সংরক্ষণ
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1.5px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📝</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>পরীক্ষার রুটিন ও সময়সূচি</h4>
                    <small style={{ color: '#64748b' }}>অর্ধবার্ষিক ও চূড়ান্ত পরীক্ষার সময়সূচি</small>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  তারিখ, বার, বিষয় কোড, সময় ও পরীক্ষার্থীদের নির্দেশনাবলী সংবলিত পোর্ট্রেট শিট।
                </p>
                <button
                  type="button"
                  onClick={() => handlePrintRoutine('exam')}
                  style={{
                    width: '100%',
                    background: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  🖨️ পরীক্ষার রুটিন প্রিন্ট / PDF সংরক্ষণ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT CLASS ROUTINE SLOT                   */}
      {/* ======================================================== */}
      {showClassModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '540px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {editingClassSlot ? '✏️ ক্লাস রুটিন স্লট সম্পাদনা' : '➕ নতুন ক্লাস পিরিয়ড স্লট তৈরি'}
              </h3>
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClassSlot} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>শ্রেণি *</label>
                  <select
                    value={classForm.class_name}
                    onChange={e => {
                      const c = e.target.value;
                      const isHigh = ['9', '10'].includes(c);
                      setClassForm({
                        ...classForm,
                        class_name: c,
                        section: isHigh ? 'বিজ্ঞান বিভাগ' : 'পদ্মা শাখা'
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    <option value="6">৬ষ্ঠ শ্রেণি</option>
                    <option value="7">৭ম শ্রেণি</option>
                    <option value="8">৮ম শ্রেণি</option>
                    <option value="9">৯ম শ্রেণি</option>
                    <option value="10">১০ম শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                    {['9', '10'].includes(String(classForm.class_name)) ? 'বিভাগ নির্বাচন *' : 'শাখা নির্ধারণ / এডিট *'}
                  </label>
                  {['9', '10'].includes(String(classForm.class_name)) ? (
                    <select
                      value={classForm.section}
                      onChange={e => setClassForm({ ...classForm, section: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #16a34a', fontSize: '13px', fontWeight: 700, color: '#15803d', background: '#f0fdf4' }}
                      required
                    >
                      <option value="বিজ্ঞান বিভাগ">বিজ্ঞান বিভাগ</option>
                      <option value="মানবিক বিভাগ">মানবিক বিভাগ</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={classForm.section}
                      onChange={e => setClassForm({ ...classForm, section: e.target.value })}
                      placeholder="যেমন: পদ্মা শাখা, ক শাখা বা সাধারণ"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                      required
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বার / দিন *</label>
                  <select
                    value={classForm.day_of_week}
                    onChange={e => setClassForm({ ...classForm, day_of_week: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    {WEEK_DAYS.map(d => (
                      <option key={d.id} value={d.id}>{d.name_bn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পিরিয়ড নম্বর *</label>
                  <select
                    value={classForm.period_no}
                    onChange={e => {
                      const p = DEFAULT_PERIODS.find(x => x.period_no === e.target.value);
                      setClassForm({
                        ...classForm,
                        period_no: e.target.value,
                        start_time: p?.start_time || classForm.start_time,
                        end_time: p?.end_time || classForm.end_time
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    {DEFAULT_PERIODS.filter(p => !p.is_break).map(p => (
                      <option key={p.period_no} value={p.period_no}>{p.name_bn} ({toBnDigits(p.start_time)} - {toBnDigits(p.end_time)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বিষয় *</label>
                  <select
                    value={classForm.subject_name}
                    onChange={e => {
                      const subName = e.target.value;
                      const sObj = subjects.find(s => s.name_bn === subName);
                      setClassForm({
                        ...classForm,
                        subject_name: subName,
                        subject_code: sObj?.code || classForm.subject_code
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id || s.name_bn} value={s.name_bn}>{s.name_bn} (কোড: {s.code || '১০১'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>শিক্ষক *</label>
                  <select
                    value={classForm.teacher_name}
                    onChange={e => setClassForm({ ...classForm, teacher_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    {teachers.map(t => (
                      <option key={t.id || t.name_bn} value={t.name_bn}>{t.name_bn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>কক্ষ নম্বর (Room No) *</label>
                  <input
                    type="text"
                    value={classForm.room}
                    onChange={e => setClassForm({ ...classForm, room: e.target.value })}
                    placeholder="যেমন: ১০১, ১০২, ডিজিটাল ল্যাব"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বিষয় কোড</label>
                  <input
                    type="text"
                    value={classForm.subject_code}
                    onChange={e => setClassForm({ ...classForm, subject_code: e.target.value })}
                    placeholder="যেমন: ১০১"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingClassSlot ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT EXAM SCHEDULE SLOT                  */}
      {/* ======================================================== */}
      {showExamModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {editingExamSlot ? '✏️ পরীক্ষার সময়সূচি সম্পাদনা' : '➕ নতুন পরীক্ষার সময়সূচি যোগ'}
              </h3>
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExamSlot} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পরীক্ষা *</label>
                  <select
                    value={examForm.exam_id}
                    onChange={e => {
                      const ex = exams.find(x => x.id === e.target.value);
                      setExamForm({ ...examForm, exam_id: e.target.value, exam_name: ex?.name_bn || examForm.exam_name });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    {exams.map(x => (
                      <option key={x.id} value={x.id}>{x.name_bn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>শ্রেণি *</label>
                  <select
                    value={examForm.class_name}
                    onChange={e => setExamForm({ ...examForm, class_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  >
                    <option value="all">সকল শ্রেণি (৬ষ্ঠ-১০ম)</option>
                    <option value="6">৬ষ্ঠ শ্রেণি</option>
                    <option value="7">৭ম শ্রেণি</option>
                    <option value="8">৮ম শ্রেণি</option>
                    <option value="9">৯ম শ্রেণি</option>
                    <option value="10">১০ম শ্রেণি</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বিষয় *</label>
                  <input
                    type="text"
                    value={examForm.subject_name}
                    onChange={e => setExamForm({ ...examForm, subject_name: e.target.value })}
                    placeholder="যেমন: বাংলা ১ম পত্র"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বিষয় কোড</label>
                  <input
                    type="text"
                    value={examForm.subject_code}
                    onChange={e => setExamForm({ ...examForm, subject_code: e.target.value })}
                    placeholder="যেমন: ১০১"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পরীক্ষার তারিখ *</label>
                  <input
                    type="date"
                    value={examForm.exam_date}
                    onChange={e => setExamForm({ ...examForm, exam_date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বার / দিন</label>
                  <input
                    type="text"
                    value={examForm.day_name}
                    onChange={e => setExamForm({ ...examForm, day_name: e.target.value })}
                    placeholder="যেমন: রবিবার"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>সময় (শুরু ও শেষ) *</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="time"
                      value={examForm.start_time}
                      onChange={e => setExamForm({ ...examForm, start_time: e.target.value })}
                      style={{ width: '50%', padding: '8px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      required
                    />
                    <input
                      type="time"
                      value={examForm.end_time}
                      onChange={e => setExamForm({ ...examForm, end_time: e.target.value })}
                      style={{ width: '50%', padding: '8px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পূর্ণমান</label>
                  <input
                    type="number"
                    value={examForm.full_marks}
                    onChange={e => setExamForm({ ...examForm, full_marks: Number(e.target.value) || 100 })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পরীক্ষা কক্ষ নম্বর</label>
                  <input
                    type="text"
                    value={examForm.room_no}
                    onChange={e => setExamForm({ ...examForm, room_no: e.target.value })}
                    placeholder="যেমন: ১০১, ১০২, ২০১"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>হল পরিদর্শক শিক্ষকবৃন্দ</label>
                  <input
                    type="text"
                    value={examForm.invigilator}
                    onChange={e => setExamForm({ ...examForm, invigilator: e.target.value })}
                    placeholder="যেমন: মোঃ আনোয়ার হোসেন, তাপসী সরকার"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingExamSlot ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
