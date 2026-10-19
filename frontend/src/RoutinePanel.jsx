import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_SCHOOL, MOCK_EXAMS, MOCK_SUBJECTS, MOCK_TEACHERS } from './mockData';
import { WEEK_DAYS, DEFAULT_PERIODS, DEFAULT_CLASS_ROUTINES, DEFAULT_EXAM_ROUTINES, GOVT_STANDARD_PERIODS, getSubjectTheme, EXAM_INSTRUCTIONS } from './routineData';

// Normalization Helpers for robust routine matching
export const normClass = (val) => {
  if (val === null || val === undefined) return '';
  const s = String(val).replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]).trim();
  const m = s.match(/\d+/);
  return m ? m[0] : s;
};

export const normDay = (val) => {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (s === '1' || s === '১' || s === 'রবিবার' || s === 'রবি' || s.toLowerCase() === 'sunday' || s.toLowerCase() === 'sun' || s === '0') return '1';
  if (s === '2' || s === '২' || s === 'সোমবার' || s === 'সোম' || s.toLowerCase() === 'monday' || s.toLowerCase() === 'mon') return '2';
  if (s === '3' || s === '৩' || s === 'মঙ্গলবার' || s === 'মঙ্গল' || s.toLowerCase() === 'tuesday' || s.toLowerCase() === 'tue') return '3';
  if (s === '4' || s === '৪' || s === 'বুধবার' || s === 'বুধ' || s.toLowerCase() === 'wednesday' || s.toLowerCase() === 'wed') return '4';
  if (s === '5' || s === '৫' || s === 'বৃহস্পতিবার' || s === 'বৃহস্পতি' || s.toLowerCase() === 'thursday' || s.toLowerCase() === 'thu') return '5';
  const num = normClass(s);
  return num || s;
};

export const normPeriod = (p, startTime) => {
  if (p !== null && p !== undefined && String(p).trim() !== '') {
    const s = String(p).trim();
    const num = normClass(s);
    if (num) return num;
    if (s.includes('১') || s.includes('1')) return '1';
    if (s.includes('২') || s.includes('2')) return '2';
    if (s.includes('৩') || s.includes('3')) return '3';
    if (s.includes('৪') || s.includes('4')) return '4';
    if (s.includes('৫') || s.includes('5')) return '5';
    if (s.includes('৬') || s.includes('6')) return '6';
  }
  if (startTime) {
    const st = String(startTime).trim();
    if (st.startsWith('10:')) return '1';
    if (st.startsWith('11:')) return '2';
    if (st.startsWith('12:')) return '3';
    if (st.startsWith('13:') || st.startsWith('01:') || st.startsWith('1:')) return '4';
    if (st.startsWith('14:') || st.startsWith('02:') || st.startsWith('2:')) return '5';
    if (st.startsWith('15:') || st.startsWith('03:') || st.startsWith('3:')) return '6';
  }
  return '';
};
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

export const calculateDurationBn = (startTime, endTime) => {
  if (!startTime || !endTime) return '—';
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '—';
  let diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diffMin <= 0) return '—';
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours > 0 && mins > 0) return `${toBnDigits(hours)} ঘণ্টা ${toBnDigits(mins)} মি.`;
  if (hours > 0) return `${toBnDigits(hours)} ঘণ্টা`;
  return `${toBnDigits(mins)} মি.`;
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
  const [classRoutines, setClassRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_db_routines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CLASS_ROUTINES;
  });
  const [examRoutines, setExamRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_db_exam_routines') || localStorage.getItem('exam_routines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 12) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EXAM_ROUTINES;
  });
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS);
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [exams, setExams] = useState(MOCK_EXAMS);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'success' });

  // Dynamic Periods State (সরকার নির্ধারিত কর্মদিবস ও পিরিয়ড বিন্যাস)
  const [periods, setPeriods] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_routine_periods');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          const p1 = parsed.find(p => p.period_no === '1');
          if (p1 && p1.start_time === '10:20') return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PERIODS;
  });

  // Period Edit Modal State (অ্যাকশন কলামে সমাবেশ, পিরিয়ড ও টিফিন বিরতির সময় নির্ধারণ)
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [periodForm, setPeriodForm] = useState({
    period_no: '1',
    name_bn: '১ম পিরিয়ড',
    type: 'period',
    start_time: '10:20',
    end_time: '11:20',
    duration: '৬০ মি.',
    activity: '১ম ঘণ্টার একাডেমিক পাঠদান'
  });

  // Class Routine filters
  const [selectedClass, setSelectedClass] = useState('6');
  const [selectedSection, setSelectedSection] = useState('all');
  const [classViewMode, setClassViewMode] = useState('grid'); // 'grid' | 'periods' | 'list'
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
    start_time: '10:20',
    end_time: '11:20',
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
      const [rData, erData, sData, tData, exData, pData] = await Promise.all([
        requestApi('/routines'),
        requestApi('/exam_routines'),
        requestApi('/subjects'),
        requestApi('/teachers?status=active'),
        requestApi('/exams'),
        requestApi('/routine_periods')
      ]);

      const validRoutines = Array.isArray(rData) && rData.length >= 10 ? rData : DEFAULT_CLASS_ROUTINES;
      setClassRoutines(validRoutines);
      setExamRoutines(Array.isArray(erData) && erData.length >= 12 ? erData : DEFAULT_EXAM_ROUTINES);
      setSubjects(Array.isArray(sData) && sData.length ? sData : MOCK_SUBJECTS);
      setTeachers(Array.isArray(tData) && tData.length ? tData : MOCK_TEACHERS);
      setExams(Array.isArray(exData) && exData.length ? exData : MOCK_EXAMS);
      if (Array.isArray(pData) && pData.length >= 6) {
        setPeriods(pData);
      }
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
    const targetClass = selectedClass !== 'all' ? normClass(selectedClass) : 'all';
    return classRoutines.filter(r => {
      if (targetClass !== 'all') {
        const rCls = normClass(r.class_name);
        if (rCls && rCls !== targetClass) return false;
      }
      if (selectedSection !== 'all' && r.section) {
        const sec = selectedSection.trim();
        const rSec = String(r.section).trim();
        if (!rSec.includes(sec) && !sec.includes(rSec)) return false;
      }
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

  // Reset to Govt Standard Routines
  // Reset to 13-Day Govt Standard Exam Schedule
  const handleResetDefaultExamRoutines = async () => {
    if (!window.confirm('আপনি কি মাধ্যমিক বিদ্যালয়ের প্রমিত ১৩ দিবসের পূর্ণাঙ্গ পরীক্ষার রুটিন (৯ম-১০ম শ্রেণির ১২-১৩টি বিষয়সহ) লোড করতে চান?')) return;
    try {
      await requestApi('/exam_routines/reset-defaults', { method: 'POST' });
      setMsg({ text: 'প্রমিত ১৩ দিবসের পরীক্ষার রুটিন সফলভাবে লোড করা হয়েছে!', type: 'success' });
      await loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleResetDefaultRoutines = async () => {
    if (!window.confirm('আপনি কি সরকারি প্রমিত সাপ্তাহিক ক্লাস রুটিন (৬ষ্ঠ-১০ম শ্রেণি, দৈনিক ৬টি পিরিয়ড ও বিষয় শিক্ষকসহ) পুনরায় লোড করতে চান?')) return;
    try {
      await requestApi('/routines/reset-defaults', { method: 'POST' });
      setMsg({ text: 'সরকারি প্রমিত ক্লাস রুটিন সফলভাবে লোড করা হয়েছে!', type: 'success' });
      await loadData();
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

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
      const payload = {
        ...classForm,
        class_name: normClass(classForm.class_name) || classForm.class_name,
        day_of_week: normDay(classForm.day_of_week) || classForm.day_of_week,
        period_no: normPeriod(classForm.period_no, classForm.start_time) || classForm.period_no
      };

      if (editingClassSlot) {
        await requestApi(`/routines/${editingClassSlot.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setMsg({ text: 'ক্লাস রুটিন স্লট সফলভাবে আপডেট করা হয়েছে!', type: 'success' });
      } else {
        await requestApi('/routines', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setMsg({ text: 'নতুন ক্লাস রুটিন পিরিয়ড সফলভাবে যোগ করা হয়েছে!', type: 'success' });
      }
      setShowClassModal(false);
      setEditingClassSlot(null);
      await loadData();
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

  // Handle Period Timing Edit (অ্যাকশন কলামে সমাবেশ, পিরিয়ড ও টিফিন বিরতি সম্পাদনা)
  const openEditPeriodModal = (period) => {
    setEditingPeriod(period);
    setPeriodForm({
      period_no: period.period_no,
      name_bn: period.name_bn,
      type: period.type || (period.is_assembly ? 'assembly' : period.is_break ? 'break' : 'period'),
      start_time: period.start_time,
      end_time: period.end_time,
      duration: period.duration || calculateDurationBn(period.start_time, period.end_time),
      activity: period.activity || ''
    });
    setShowPeriodModal(true);
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    try {
      const calculatedDur = calculateDurationBn(periodForm.start_time, periodForm.end_time);
      const updatedPeriods = periods.map(p => {
        if (String(p.period_no) === String(periodForm.period_no)) {
          return {
            ...p,
            name_bn: periodForm.name_bn,
            type: periodForm.type,
            start_time: periodForm.start_time,
            end_time: periodForm.end_time,
            duration: periodForm.duration || calculatedDur,
            activity: periodForm.activity,
            is_assembly: periodForm.type === 'assembly' || periodForm.period_no === 'assembly',
            is_break: periodForm.type === 'break' || periodForm.period_no === 'tiffin'
          };
        }
        return p;
      });

      setPeriods(updatedPeriods);
      localStorage.setItem('magra_routine_periods', JSON.stringify(updatedPeriods));

      // Sync class routine slots that use this period
      const updatedSlots = classRoutines.map(r => {
        if (String(r.period_no) === String(periodForm.period_no)) {
          return { ...r, start_time: periodForm.start_time, end_time: periodForm.end_time };
        }
        return r;
      });
      setClassRoutines(updatedSlots);
      localStorage.setItem('routines', JSON.stringify(updatedSlots));

      try {
        await requestApi(`/routine_periods/${periodForm.period_no}`, {
          method: 'PUT',
          body: JSON.stringify(periodForm)
        });
      } catch (errApi) {
        console.warn('API sync warning:', errApi);
      }

      setShowPeriodModal(false);
      setEditingPeriod(null);
      setMsg({
        text: `"${periodForm.name_bn}" এর সময়সূচি (${toBnDigits(periodForm.start_time)} - ${toBnDigits(periodForm.end_time)}) সফলভাবে আপডেট হয়েছে!`,
        type: 'success'
      });
      setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleResetGovtPeriods = async () => {
    if (!window.confirm('আপনি কি সরকারি প্রমিত সময়সূচি (সকাল ১০:০০ হতে বিকাল ০৪:০০, দৈনিক সমাবেশ, ৬টি পিরিয়ড ও টিফিন বিরতি)-তে রিসেট করতে চান?')) return;
    setPeriods(DEFAULT_PERIODS);
    localStorage.setItem('magra_routine_periods', JSON.stringify(DEFAULT_PERIODS));

    const updatedSlots = classRoutines.map(slot => {
      const p = DEFAULT_PERIODS.find(x => String(x.period_no) === String(slot.period_no));
      if (p) {
        return { ...slot, start_time: p.start_time, end_time: p.end_time };
      }
      return slot;
    });
    setClassRoutines(updatedSlots);
    localStorage.setItem('routines', JSON.stringify(updatedSlots));

    try {
      await requestApi('/routine_periods', {
        method: 'PUT',
        body: JSON.stringify(DEFAULT_PERIODS)
      });
    } catch (err) {
      console.warn(err);
    }

    setMsg({ text: 'সরকারি প্রমিত সময়সূচি (১০:০০ - ০৪:০০) সফলভাবে সেট করা হয়েছে!', type: 'success' });
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
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

      // Build grid table for print (ক্লাস রুটিনে শুধু বিষয়ের নাম ও শিক্ষকের নাম থাকবে, কক্ষ নং থাকবে না)
      bodyContent = `
        <div style="text-align:center; margin-bottom: 8px;">
          <h2 style="margin: 0 0 2px; font-size: 16px; color: #0f172a; font-weight: 900;">${titleText}</h2>
          <div style="font-size: 10.5px; color: #b45309; font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.8px; margin-bottom: 3px;">ACADEMIC CLASS ROUTINE & TIMETABLE - 2026</div>
          <p style="margin: 0; font-size: 11.5px; color: #475569;">শ্রেণি: <b>${clsLabel}</b> | শাখা/বিভাগ: <b>${selectedSection === 'all' ? 'সকল শাখা' : selectedSection}</b> | শিক্ষাবর্ষ: <b>২০২৬ খ্রি.</b></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; table-layout: fixed;">
          <thead>
            <tr style="background: #f1f5f9; color: #0f172a;">
              <th style="border: 1px solid #94a3b8; padding: 6px 2px; width: 85px; text-align: center; font-size: 11.5px;">বার / দিন</th>
              ${periods.map(p => `
                <th style="border: 1px solid #94a3b8; padding: 6px 2px; text-align: center; ${p.is_break ? 'width: 80px; background: #fffbeb; color: #92400e;' : p.is_assembly ? 'width: 80px; background: #f0fdf4; color: #166534;' : ''}">
                  <b style="font-size: 11.5px;">${p.name_bn}</b><br/>
                  <small style="font-size: 9.5px; color: #475569;">${toBnDigits(p.start_time)} - ${toBnDigits(p.end_time)}</small>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${WEEK_DAYS.map(day => `
              <tr>
                <td style="border: 1px solid #94a3b8; padding: 6px 4px; font-weight: bold; background: #f8fafc; text-align: center; font-size: 12.5px;">
                  ${day.name_bn}
                </td>
                ${periods.map(period => {
                  if (period.is_assembly) {
                    return `
                      <td style="border: 1px solid #94a3b8; padding: 5px 2px; text-align: center; background: #f0fdf4; font-size: 10px; color: #166534; font-weight: bold;">
                        🏛️ সমাবেশ ও শপথ
                      </td>
                    `;
                  }
                  if (period.is_break) {
                    return `
                      <td style="border: 1px solid #94a3b8; padding: 5px 2px; text-align: center; background: #fffbeb; font-size: 10px; color: #b45309; font-weight: bold;">
                        🥪 টিফিন ও নামাজ
                      </td>
                    `;
                  }
                  const slot = filteredClassRoutines.find(r => normDay(r.day_of_week) === normDay(day.id) && normPeriod(r.period_no, r.start_time) === normPeriod(period.period_no, period.start_time));
                  if (!slot) {
                    return `<td style="border: 1px solid #94a3b8; padding: 5px 2px; text-align: center; color: #cbd5e1;">—</td>`;
                  }
                  return `
                    <td style="border: 1px solid #94a3b8; padding: 6px 3px; text-align: center; background: #ffffff;">
                      <div style="font-weight: 800; color: #0369a1; font-size: 11.5px; line-height: 1.25;">${slot.subject_name}</div>
                      <div style="color: #334155; font-size: 10px; font-weight: 600; margin-top: 2px;">👨‍🏫 ${slot.teacher_name}</div>
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
        <div style="text-align:center; margin-bottom: 6px;">
          <h2 style="margin: 0 0 2px; font-size: 15px; color: #0f172a; font-weight: 900;">${titleText}</h2>
          <div style="font-size: 9.5px; color: #b45309; font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.8px; margin-bottom: 3px;">OFFICIAL EXAMINATION TIMETABLE - 2026</div>
          <p style="margin: 0; font-size: 10.5px; color: #475569;">শিক্ষাবর্ষ: <b>২০২৬ খ্রি.</b> | কেন্দ্র কোড: <b>১১৭ (কালিহাতি)</b> | সময়: <b>সকাল ১০:০০ টা হতে দুপুর ০১:০০ টা</b></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px; table-layout: fixed;">
          <thead>
            <tr style="background: #f1f5f9; color: #0f172a;">
              <th style="border: 1px solid #94a3b8; padding: 3px 2px; width: 25px; text-align: center;">ক্র.</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 2px; width: 68px; text-align: center;">তারিখ ও বার</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 3px; width: 70px;">শ্রেণি ও বিভাগ</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 4px;">বিষয় ও বিষয় কোড</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 2px; width: 68px; text-align: center;">সময়</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 2px; width: 36px; text-align: center;">পূর্ণমান</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 2px; width: 45px; text-align: center;">পরীক্ষা কক্ষ</th>
              <th style="border: 1px solid #94a3b8; padding: 3px 3px; width: 85px;">হল পরিদর্শক</th>
            </tr>
          </thead>
          <tbody>
            ${filteredExamRoutines.map((ex, idx) => `
              <tr>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 2px; text-align: center; font-weight: bold;">${toBnDigits(idx + 1)}</td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 2px; text-align: center;">
                  <b>${formatDateBn(ex.exam_date)}</b><br/>
                  <small style="color: #64748b; font-size: 8.5px;">${ex.day_name}</small>
                </td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 3px;">
                  <b>${ex.class_name === 'all' || ex.class_name === 'সকল শ্রেণি' ? '৬ষ্ঠ থেকে ১০ম' : `${toBnDigits(ex.class_name)}ম`}</b><br/>
                  <small style="color: #475569; font-size: 8.5px;">${ex.section || 'সকল শাখা'}</small>
                </td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 4px;">
                  <b style="color: #0369a1; font-size: 9.5px;">${ex.subject_name}</b><br/>
                  <small style="color: #64748b; font-size: 8.5px;">কোড: ${toBnDigits(ex.subject_code || '১০১')}</small>
                </td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 2px; text-align: center; font-weight: 600; font-size: 9px;">
                  ${toBnDigits(ex.start_time)} - ${toBnDigits(ex.end_time)}
                </td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 2px; text-align: center; font-weight: bold; color: #047857;">
                  ${toBnDigits(ex.full_marks || 100)}
                </td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 2px; text-align: center; font-size: 9px;">${ex.room_no || '১০১-২০৩'}</td>
                <td style="border: 1px solid #94a3b8; padding: 2.5px 3px; font-size: 8.5px;">${ex.invigilator || 'নির্ধারিত শিক্ষক'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 3.5px 8px; border-radius: 4px; font-size: 8.5px; line-height: 1.25; margin-bottom: 5px;">
          <div style="font-weight: 800; color: #92400e; margin-bottom: 1px;">📌 পরীক্ষার্থীদের জরুরি সাধারণ নির্দেশনাবলী:</div>
          <ol style="margin: 0; padding-left: 15px; color: #78350f;">
            ${EXAM_INSTRUCTIONS.slice(0, 4).map(ins => `<li>${ins}</li>`).join('')}
          </ol>
        </div>
      `;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <title>${titleText} - ${school.nameBn || school.name}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${isClass ? 'landscape' : 'portrait'};
            margin: ${isClass ? '5mm 8mm' : '4mm 6mm'};
          }
          body {
            font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', 'Segoe UI', Tahoma, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 4px 6px;
            background: #ffffff;
            position: relative;
          }
          .official-header {
            border-bottom: 2px double #0284c7;
            padding-bottom: ${isClass ? '5px' : '4px'};
            margin-bottom: ${isClass ? '6px' : '5px'};
            width: 100%;
          }
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 2px;
          }
          .header-logo-left {
            flex-shrink: 0;
            width: ${isClass ? '74px' : '66px'};
            text-align: left;
          }
          .school-logo {
            width: ${isClass ? '68px' : '60px'};
            height: ${isClass ? '68px' : '60px'};
            object-fit: contain;
            border-radius: 50%;
            background: #ffffff;
            padding: 2px;
            border: 2px solid #0369a1;
            box-shadow: 0 1px 4px rgba(3, 105, 161, 0.12);
          }
          .school-titles {
            flex: 1;
            text-align: center;
            padding: 0 6px;
          }
          .school-name-bn {
            margin: 0;
            font-size: ${isClass ? '24px' : '22px'};
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.2px;
            line-height: 1.1;
            text-shadow: 0 1px 1px rgba(0,0,0,0.06);
          }
          .school-name-en {
            margin: 1px 0 0;
            font-size: ${isClass ? '12.5px' : '11.5px'};
            font-family: 'Cinzel', 'Outfit', serif, sans-serif;
            font-weight: 800;
            color: #b45309;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            line-height: 1.1;
          }
          .school-meta {
            margin: 1.5px 0 0;
            font-size: ${isClass ? '11px' : '10px'};
            font-weight: 700;
            color: #334155;
            letter-spacing: 0.1px;
            line-height: 1.15;
          }
          .school-contact {
            margin: 1px 0 0;
            font-size: ${isClass ? '10px' : '9px'};
            color: #64748b;
            font-weight: 600;
            line-height: 1.15;
          }
          .header-right-shield {
            flex-shrink: 0;
            width: ${isClass ? '74px' : '66px'};
            display: flex;
            justify-content: flex-end;
          }
          .gov-seal-box {
            width: ${isClass ? '68px' : '60px'};
            height: ${isClass ? '68px' : '60px'};
            border-radius: 50%;
            border: 1.5px dashed #0284c7;
            background: #f0fdfa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2px;
            box-sizing: border-box;
          }
          .seal-icon {
            font-size: ${isClass ? '13px' : '11px'};
            line-height: 1;
          }
          .seal-text-top {
            font-size: ${isClass ? '7.5px' : '6.5px'};
            font-weight: 800;
            color: #0369a1;
            line-height: 1.1;
            margin-top: 1px;
          }
          .seal-text-mid {
            font-size: ${isClass ? '6px' : '5px'};
            color: #475569;
            line-height: 1;
            margin-top: 0.5px;
          }
          .seal-text-bot {
            font-size: ${isClass ? '7.5px' : '6.5px'};
            font-weight: 800;
            color: #b45309;
            margin-top: 1px;
          }
          .header-memo-date {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: ${isClass ? '10.5px' : '9.5px'};
            color: #475569;
            margin-top: 6px;
            padding: 0 4px;
          }
          .watermark-bg {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${isClass ? '270px' : '230px'};
            height: ${isClass ? '270px' : '230px'};
            background-image: url('${schoolLogo}');
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            opacity: 0.04;
            pointer-events: none;
            z-index: 0;
          }
          .content-wrap {
            position: relative;
            z-index: 1;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: ${isClass ? '55px' : '28px'};
            padding: 0 20px;
            position: relative;
            z-index: 1;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: ${isClass ? '195px' : '155px'};
          }
          .sig-space {
            height: ${isClass ? '45px' : '26px'};
          }
          .sig-line {
            border-top: 1.5px dashed #475569;
            margin-bottom: 5px;
          }
          .sig-title {
            font-size: ${isClass ? '11.5px' : '10px'};
            font-weight: 800;
            color: #0f172a;
            line-height: 1.25;
          }
          .sig-sub {
            font-size: ${isClass ? '9.5px' : '8.5px'};
            color: #64748b;
            margin-top: 2px;
          }
          @media print {
            html, body {
              height: 100%;
              margin: 0 !important;
              padding: 0 !important;
            }
            .content-wrap {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table, tr, td, th {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .no-print { display: none; }
            .gov-seal-box {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark-bg"></div>
        <div class="content-wrap">
          <div class="official-header">
            <div class="header-top">
              <div class="header-logo-left">
                <img src="${schoolLogo}" class="school-logo" alt="School Logo" />
              </div>
              <div class="school-titles">
                <h1 class="school-name-bn">${school.nameBn || school.name || 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়'}</h1>
                <h2 class="school-name-en">${school.nameEn || 'MAGRA PALS UNION HIGH SCHOOL'}</h2>
                <p class="school-meta">
                  EIIN: <b>${toBnDigits(school.eiin || 114290)}</b> &nbsp;•&nbsp;
                  স্থাপিত: <b>${toBnDigits(school.established || 1946)} খ্রি.</b> &nbsp;•&nbsp;
                  ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল
                </p>
                <p class="school-contact">
                  ই-মেইল: ${school.email || 'magrapuhs.46@gmail.com'} &nbsp;|&nbsp;
                  মোবাইল: ${toBnDigits(school.phone || '০১৭১২-৩৪৫৬৭৮')}
                </p>
              </div>
              <div class="header-right-shield">
                <div class="gov-seal-box">
                  <span class="seal-icon">🏛️</span>
                  <div class="seal-text-top">গণপ্রজাতন্ত্রী বাংলাদেশ</div>
                  <div class="seal-text-mid">মাধ্যমিক শিক্ষা অধিদপ্তর</div>
                  <div class="seal-text-bot">EIIN: ${toBnDigits(school.eiin || 114290)}</div>
                </div>
              </div>
            </div>

            <div class="header-memo-date">
              <div>স্মারক নং: <b>মপাউবি/একাডেমিক/${isClass ? 'ক্লাস-রুটিন' : 'পরীক্ষা-রুটিন'}/২০২৬</b></div>
              <div>মুদ্রণের তারিখ: <b>${formatDateBn(new Date().toISOString().slice(0, 10))} খ্রি.</b></div>
            </div>
          </div>

          ${bodyContent}

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-space"></div>
              <div class="sig-line"></div>
              <div class="sig-title">আহ্বায়ক / সদস্য সচিব</div>
              <div class="sig-sub">${isClass ? 'রুটিন প্রণয়ন কমিটি' : 'পরীক্ষা পরিচালনা কমিটি'}</div>
            </div>
            <div class="sig-box">
              <div class="sig-space"></div>
              <div class="sig-line"></div>
              <div class="sig-title">সহকারী প্রধান শিক্ষক</div>
              <div class="sig-sub">${school.nameBn || school.name}</div>
            </div>
            <div class="sig-box">
              <div class="sig-space"></div>
              <div class="sig-line"></div>
              <div class="sig-title">${school.headTeacher || 'মুহাম্মদ শফিকুল ইসলাম'}</div>
              <div class="sig-sub">প্রধান শিক্ষক, ${school.nameBn || school.name}</div>
            </div>
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
              দৈনিক ৬টি পিরিয়ড, সমাবেশ ও টিফিন বিরতি (সকাল ১০:০০ - বিকাল ৪:০০) • সরকারি নির্দেশনা অনুযায়ী রুটিন প্রণয়ন ও ট্র্যাকিং
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
                  start_time: periods.find(p => p.period_no === '1')?.start_time || '10:20',
                  end_time: periods.find(p => p.period_no === '1')?.end_time || '11:20',
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
            ৬ টি + সমাবেশ ও বিরতি
          </div>
          <small style={{ color: '#0284c7', fontSize: '11px' }}>সকাল ১০:০০ হতে বিকাল ৪:০০ (৬ ঘণ্টা)</small>
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
                  onClick={() => setClassViewMode('periods')}
                  style={{
                    background: classViewMode === 'periods' ? '#ffffff' : 'transparent',
                    color: classViewMode === 'periods' ? '#0f766e' : '#64748b',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: classViewMode === 'periods' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  ⏰ পিরিয়ড ও সময়সূচি নির্ধারণ (অ্যাকশন কলাম)
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
          {classViewMode === 'grid' && (
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
                  <small style={{ color: '#64748b' }}>সকাল ১০:০০ হতে বিকাল ৪:০০ পর্যন্ত • দৈনিক ৬টি পিরিয়ড, সমাবেশ ও টিফিন বিরতি</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setClassViewMode('periods')}
                    style={{
                      background: '#f0fdfa',
                      color: '#0f766e',
                      border: '1.5px solid #99f6e4',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>⏰</span> পিরিয়ড ও সময়সূচি সম্পাদনা (অ্যাকশন)
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaultRoutines}
                    style={{
                      background: '#f8fafc',
                      color: '#0369a1',
                      border: '1.5px solid #bae6fd',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="সরকারি প্রমিত ৬টি পিরিয়ডের সাপ্তাহিক ক্লাস রুটিন লোড করুন"
                  >
                    <span>🔄</span> প্রমিত রুটিন লোড
                  </button>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                    লাইভ সক্রিয়
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '950px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 4px', textAlign: 'center', width: '92px', fontSize: '12px', color: '#334155', borderRight: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                      বার / দিন
                    </th>
                    {periods.map(p => (
                      <th
                        key={p.period_no}
                        style={{
                          padding: '10px 4px',
                          textAlign: 'center',
                          width: (p.is_break || p.is_assembly) ? '82px' : 'auto',
                          fontSize: '12px',
                          color: p.is_break ? '#b45309' : p.is_assembly ? '#166534' : '#0f766e',
                          borderRight: '1px solid #e2e8f0',
                          background: p.is_break ? '#fefce8' : p.is_assembly ? '#f0fdf4' : '#f8fafc',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <span style={{ fontWeight: 800 }}>{p.name_bn}</span>
                          <button
                            type="button"
                            onClick={() => openEditPeriodModal(p)}
                            title="সময়সূচি সম্পাদনা (অ্যাকশন)"
                            style={{
                              background: 'rgba(0,0,0,0.06)',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '1px 4px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              color: '#334155'
                            }}
                          >
                            ✏️
                          </button>
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                          {toBnDigits(p.start_time)} - {toBnDigits(p.end_time)}
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500 }}>
                          {p.duration || calculateDurationBn(p.start_time, p.end_time)}
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
                          padding: '4px',
                          textAlign: 'center',
                          borderRight: '1px solid #e2e8f0',
                          background: isToday ? '#dcfce7' : '#f8fafc',
                          verticalAlign: 'middle',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '68px',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ fontWeight: 800, fontSize: '13px', color: isToday ? '#15803d' : '#1e293b' }}>
                              {day.name_bn}
                            </div>
                            {isToday && (
                              <span style={{ display: 'inline-block', background: '#16a34a', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', marginTop: '3px' }}>
                                আজকের ক্লাস
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Period Cells */}
                        {periods.map(period => {
                          if (period.is_assembly) {
                            return (
                              <td
                                key={period.period_no}
                                style={{
                                  padding: '4px',
                                  textAlign: 'center',
                                  borderRight: '1px solid #e2e8f0',
                                  verticalAlign: 'middle',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div style={{
                                  background: '#f0fdf4',
                                  border: '1.5px dashed #86efac',
                                  borderRadius: '8px',
                                  padding: '6px 4px',
                                  height: '68px',
                                  boxSizing: 'border-box',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#166534'
                                }}>
                                  <div style={{ fontSize: '15px', lineHeight: 1 }}>🏛️</div>
                                  <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '2px' }}>দৈনিক সমাবেশ</div>
                                  <small style={{ fontSize: '9px', color: '#15803d', fontWeight: 600 }}>পতাকা ও শপথ</small>
                                </div>
                              </td>
                            );
                          }

                          if (period.is_break) {
                            return (
                              <td
                                key={period.period_no}
                                style={{
                                  padding: '4px',
                                  textAlign: 'center',
                                  borderRight: '1px solid #e2e8f0',
                                  verticalAlign: 'middle',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div style={{
                                  background: '#fffbeb',
                                  border: '1.5px dashed #fcd34d',
                                  borderRadius: '8px',
                                  padding: '6px 4px',
                                  height: '68px',
                                  boxSizing: 'border-box',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#b45309'
                                }}>
                                  <div style={{ fontSize: '15px', lineHeight: 1 }}>🥪</div>
                                  <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '2px' }}>টিফিন ও নামাজ</div>
                                  <small style={{ fontSize: '9px', color: '#92400e', fontWeight: 600 }}>বিরতি</small>
                                </div>
                              </td>
                            );
                          }

                          // Find slot for this day & period using robust normalizers
                          const dayIdNorm = normDay(day.id);
                          const periodNoNorm = normPeriod(period.period_no, period.start_time);
                          const slot = filteredClassRoutines.find(r =>
                            normDay(r.day_of_week) === dayIdNorm &&
                            normPeriod(r.period_no, r.start_time) === periodNoNorm
                          );

                          if (!slot) {
                            return (
                              <td
                                key={period.period_no}
                                style={{
                                  padding: '4px',
                                  textAlign: 'center',
                                  borderRight: '1px solid #e2e8f0',
                                  verticalAlign: 'middle',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div style={{
                                  background: '#f8fafc',
                                  border: '1.5px dashed #cbd5e1',
                                  borderRadius: '8px',
                                  padding: '6px 4px',
                                  height: '68px',
                                  boxSizing: 'border-box',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
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
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      color: '#64748b',
                                      padding: '4px 8px',
                                      borderRadius: '5px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                    }}
                                  >
                                    + যোগ করুন
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          const theme = getSubjectTheme(slot.subject_name);

                          return (
                            <td
                              key={period.period_no}
                              style={{
                                padding: '4px',
                                borderRight: '1px solid #e2e8f0',
                                verticalAlign: 'middle',
                                background: '#ffffff',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{
                                background: theme.bg,
                                border: `1.5px solid ${theme.border}`,
                                borderRadius: '8px',
                                padding: '6px 8px',
                                position: 'relative',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '68px',
                                boxSizing: 'border-box'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '3px' }}>
                                  <div
                                    title={slot.subject_name}
                                    style={{
                                      fontWeight: 800,
                                      fontSize: '12px',
                                      color: theme.text,
                                      lineHeight: 1.25,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      wordBreak: 'break-word'
                                    }}
                                  >
                                    {theme.icon} {slot.subject_name}
                                  </div>
                                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingClassSlot(slot);
                                        setClassForm({
                                          ...slot,
                                          class_name: normClass(slot.class_name) || slot.class_name,
                                          day_of_week: normDay(slot.day_of_week) || slot.day_of_week,
                                          period_no: normPeriod(slot.period_no, slot.start_time) || slot.period_no
                                        });
                                        setShowClassModal(true);
                                      }}
                                      title="সম্পাদনা"
                                      style={{
                                        background: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        padding: '1px 4px',
                                        fontSize: '10px',
                                        lineHeight: 1,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClassSlot(slot.id)}
                                      title="মুছুন"
                                      style={{
                                        background: '#ffffff',
                                        border: '1px solid #fca5a5',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        padding: '1px 4px',
                                        fontSize: '10px',
                                        lineHeight: 1,
                                        color: '#dc2626',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>

                                <div
                                  title={slot.teacher_name}
                                  style={{
                                    fontSize: '11px',
                                    color: '#1e293b',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  <span style={{ fontSize: '11px' }}>👨‍🏫</span>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.teacher_name}</span>
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
          )}

          {/* VIEW B: PERIODS & TIMING CONFIGURATION TABLE (অ্যাকশন কলাম সহ সমাবেশ, পিরিয়ড ও টিফিন বিরতি সম্পাদনা) */}
          {classViewMode === 'periods' && (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f766e', fontWeight: 800 }}>
                      ⏰ দৈনিক কর্মঘণ্টা, সমাবেশ ও পিরিয়ডের সময়সূচি (Bell Schedule & Timing)
                    </h3>
                    <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                      সরকারি প্রমিত মান (১০:০০ - ১৬:০০)
                    </span>
                  </div>
                  <small style={{ color: '#475569', marginTop: '3px', display: 'block' }}>
                    মাধ্যমিক বিদ্যালয়ের সরকারি প্রমিত নীতিমালা অনুযায়ী: দৈনিক সমাবেশ, ৬টি পাঠদান পিরিয়ড এবং টিফিন ও নামাজ বিরতি নির্ধারণ ও সম্পাদনা
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleResetGovtPeriods}
                    style={{
                      background: '#f8fafc',
                      color: '#0f766e',
                      border: '1.5px solid #0f766e',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔄</span> সরকারি প্রমিত সময়ে রিসেট
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'center', width: '50px' }}>ক্র.</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>পিরিয়ড / ইভেন্টের নাম</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>ক্যাটাগরি / ধরন</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>শুরুর সময়</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>শেষের সময়</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>সময়ব্যাপ্তি (ডিউরেশন)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>কার্যক্রম / বিবরণ</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p, idx) => {
                      const isAsm = p.is_assembly || p.type === 'assembly';
                      const isBrk = p.is_break || p.type === 'break';
                      return (
                        <tr key={p.period_no} style={{ borderBottom: '1px solid #f1f5f9', background: isAsm ? '#f0fdf4' : isBrk ? '#fffbeb' : '#ffffff' }}>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>
                            {toBnDigits(idx + 1)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 800, fontSize: '13px', color: isAsm ? '#15803d' : isBrk ? '#b45309' : '#0f766e' }}>
                              {isAsm ? '🏛️ ' : isBrk ? '🥪 ' : '📚 '} {p.name_bn}
                            </div>
                            <small style={{ color: '#64748b' }}>কোড / আইডি: {p.period_no}</small>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              background: isAsm ? '#dcfce7' : isBrk ? '#fef3c7' : '#e0f2fe',
                              color: isAsm ? '#15803d' : isBrk ? '#b45309' : '#0369a1',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '11px'
                            }}>
                              {isAsm ? 'দৈনিক সমাবেশ' : isBrk ? 'নামাজ ও টিফিন বিরতি' : 'শ্রেণিকক্ষে পাঠদান'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            🕒 {toBnDigits(p.start_time)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            🕒 {toBnDigits(p.end_time)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                              {p.duration || calculateDurationBn(p.start_time, p.end_time)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {p.activity || (isAsm ? 'জাতীয় পতাকা উত্তোলন ও শপথ' : isBrk ? 'টিফিন ও জোহরের নামাজ' : `${toBnDigits(p.period_no)}ম ঘণ্টার পাঠদান`)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => openEditPeriodModal(p)}
                              style={{
                                background: '#0f766e',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span>✏️</span> সম্পাদনা
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW C: LIST TABLE */}
          {classViewMode === 'list' && (
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
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherRoutines.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f766e' }}>
                        {WEEK_DAYS.find(d => normDay(d.id) === normDay(r.day_of_week))?.name_bn || r.day_of_week}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                          {toBnDigits(normPeriod(r.period_no, r.start_time) || r.period_no)}ম পিরিয়ড
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>
                        {toBnDigits(r.start_time)} - {toBnDigits(r.end_time)}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                        {toBnDigits(normClass(r.class_name) || r.class_name)}ম শ্রেণি {r.section ? `(${r.section})` : ''}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1' }}>
                        {r.subject_name}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                        🚪 কক্ষ {toBnDigits(r.room || '১০১')}
                      </td>
                      <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClassSlot(r);
                              setClassForm({
                                ...r,
                                class_name: normClass(r.class_name) || r.class_name,
                                day_of_week: normDay(r.day_of_week) || r.day_of_week,
                                period_no: normPeriod(r.period_no, r.start_time) || r.period_no
                              });
                              setShowClassModal(true);
                            }}
                            title="সম্পাদনা"
                            style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>✏️</span> সম্পাদনা
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClassSlot(r.id)}
                            title="মুছুন"
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>🗑️</span> মুছুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!teacherRoutines.length && (
                    <tr>
                      <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
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
                    value={normDay(classForm.day_of_week) || '1'}
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
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পিরিয়ড নির্বাচন *</label>
                  <select
                    value={normPeriod(classForm.period_no, classForm.start_time) || '1'}
                    onChange={e => {
                      const p = periods.find(x => String(x.period_no) === String(e.target.value));
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
                    {periods.filter(p => !p.is_break && !p.is_assembly).map(p => (
                      <option key={p.period_no} value={p.period_no}>
                        {p.name_bn} ({toBnDigits(p.start_time)} - {toBnDigits(p.end_time)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>সময় (শুরু ও শেষ) *</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="time"
                      value={classForm.start_time}
                      onChange={e => setClassForm({ ...classForm, start_time: e.target.value })}
                      style={{ width: '50%', padding: '8px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      required
                    />
                    <input
                      type="time"
                      value={classForm.end_time}
                      onChange={e => setClassForm({ ...classForm, end_time: e.target.value })}
                      style={{ width: '50%', padding: '8px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বিষয় নির্বাচন বা লিখুন *</label>
                  <input
                    list="routine-subject-list"
                    type="text"
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
                    placeholder="যেমন: বাংলা ১ম পত্র, গণিত..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #0f766e', fontSize: '13px', fontWeight: 700 }}
                    required
                  />
                  <datalist id="routine-subject-list">
                    {subjects.map(s => (
                      <option key={s.id || s.name_bn} value={s.name_bn}>{s.name_bn} (কোড: {s.code || '১০১'})</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>বিষয় শিক্ষক নির্বাচন বা নাম *</label>
                  <input
                    list="routine-teacher-list"
                    type="text"
                    value={classForm.teacher_name}
                    onChange={e => setClassForm({ ...classForm, teacher_name: e.target.value })}
                    placeholder="যেমন: মোঃ সাইদুর রহমান..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #0f766e', fontSize: '13px', fontWeight: 700 }}
                    required
                  />
                  <datalist id="routine-teacher-list">
                    {teachers.map(t => (
                      <option key={t.id || t.name_bn} value={t.name_bn}>{t.name_bn} ({t.designation || 'সহকারী শিক্ষক'})</option>
                    ))}
                  </datalist>
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
      {/* MODAL 0: EDIT PERIOD & TIMING (অ্যাকশন কলামে সম্পাদনা)  */}
      {/* ======================================================== */}
      {showPeriodModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                ✏️ পিরিয়ড ও সময়সূচি সম্পাদনা ({periodForm.name_bn})
              </h3>
              <button
                type="button"
                onClick={() => setShowPeriodModal(false)}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePeriod} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>পিরিয়ড / ইভেন্টের নাম *</label>
                  <input
                    type="text"
                    value={periodForm.name_bn}
                    onChange={e => setPeriodForm({ ...periodForm, name_bn: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>ধরন / ক্যাটাগরি *</label>
                  <select
                    value={periodForm.type}
                    onChange={e => setPeriodForm({ ...periodForm, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="period">পাঠদান পিরিয়ড</option>
                    <option value="assembly">দৈনিক সমাবেশ</option>
                    <option value="break">নামাজ ও টিফিন বিরতি</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>শুরুর সময় (Start Time) *</label>
                  <input
                    type="time"
                    value={periodForm.start_time}
                    onChange={e => {
                      const newStart = e.target.value;
                      const dur = calculateDurationBn(newStart, periodForm.end_time);
                      setPeriodForm({ ...periodForm, start_time: newStart, duration: dur });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #0f766e', fontSize: '13px', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>শেষের সময় (End Time) *</label>
                  <input
                    type="time"
                    value={periodForm.end_time}
                    onChange={e => {
                      const newEnd = e.target.value;
                      const dur = calculateDurationBn(periodForm.start_time, newEnd);
                      setPeriodForm({ ...periodForm, end_time: newEnd, duration: dur });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #0f766e', fontSize: '13px', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>সময়ব্যাপ্তি (ডিউরেশন)</label>
                  <input
                    type="text"
                    value={periodForm.duration}
                    onChange={e => setPeriodForm({ ...periodForm, duration: e.target.value })}
                    placeholder="যেমন: ৫০ মি."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>কার্যক্রম / বিবরণ</label>
                  <input
                    type="text"
                    value={periodForm.activity}
                    onChange={e => setPeriodForm({ ...periodForm, activity: e.target.value })}
                    placeholder="যেমন: ১ম ঘণ্টার একাডেমিক পাঠদান"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569' }}>
                💡 <b>টিপস:</b> এই পিরিয়ডের শুরুর সময় ও শেষের সময় পরিবর্তন করলে সংশ্লিষ্ট সকল শ্রেণির সাপ্তাহিক রুটিন এবং প্রিন্ট ভিউতে সময় স্বয়ংক্রিয়ভাবে সমন্বিত হবে।
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(15,118,110,0.3)' }}
                >
                  সংরক্ষণ করুন
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
