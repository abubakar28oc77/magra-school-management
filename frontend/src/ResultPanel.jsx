import React, { useState, useEffect, useMemo } from 'react';
import { requestApi } from './apiClient';

const api = requestApi;
const classes = ['6', '7', '8', '9', '10'];

const toBnDigits = (n) => {
  if (n === null || n === undefined || n === '') return '';
  return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
};

const defaultRules = [
  ['80', '100', 'A+', '5'],
  ['70', '79.99', 'A', '4'],
  ['60', '69.99', 'A-', '3.5'],
  ['50', '59.99', 'B', '3'],
  ['40', '49.99', 'C', '2'],
  ['33', '39.99', 'D', '1'],
  ['0', '32.99', 'F', '0']
];

const STANDARD_EXAM_PRESETS = [
  { name_bn: '১ম সাময়িক পরীক্ষা', name_en: '1st Terminal Examination', exam_type: 'সাময়িক পরীক্ষা' },
  { name_bn: 'অর্ধবার্ষিক পরীক্ষা', name_en: 'Half Yearly Examination', exam_type: 'অর্ধবার্ষিক পরীক্ষা' },
  { name_bn: '২য় সাময়িক পরীক্ষা', name_en: '2nd Terminal Examination', exam_type: 'সাময়িক পরীক্ষা' },
  { name_bn: 'প্রাক-নির্বাচনী পরীক্ষা', name_en: 'Pre-Test Examination', exam_type: 'প্রাক-নির্বাচনী পরীক্ষা' },
  { name_bn: 'নির্বাচনী পরীক্ষা (Test)', name_en: 'Test Examination (SSC Candidate)', exam_type: 'নির্বাচনী পরীক্ষা (Test)' },
  { name_bn: 'বার্ষিক পরীক্ষা', name_en: 'Annual Examination', exam_type: 'বার্ষিক পরীক্ষা' },
  { name_bn: 'মডেল টেস্ট / ক্লাস টেস্ট', name_en: 'Model Test / Class Assessment', exam_type: 'মডেল টেস্ট / ক্লাস টেস্ট' }
];

const STANDARD_YEAR_PRESETS = [
  { year: '2026', title_bn: '২০২৬ শিক্ষাবর্ষ', is_current: true, status: 'active', remarks: 'চলমান প্রধান শিক্ষাবর্ষ' },
  { year: '2027', title_bn: '২০২৭ শিক্ষাবর্ষ', is_current: false, status: 'upcoming', remarks: 'আসন্ন শিক্ষাবর্ষ' },
  { year: '2025', title_bn: '২০২৫ শিক্ষাবর্ষ', is_current: false, status: 'completed', remarks: 'বিগত শিক্ষাবর্ষ' },
  { year: '2024', title_bn: '২০২৪ শিক্ষাবর্ষ', is_current: false, status: 'completed', remarks: 'আর্কাইভ শিক্ষাবর্ষ' }
];

export function ResultPanel({ sub }) {
  // Tab mapping
  const resolveInitialTab = (s) => {
    if (!s) return 'academic_year';
    if (s === 'academic_year' || s === 'academic_years') return 'academic_year';
    if (s === 'exam_names' || s === 'exam_setup' || s === 'setup') return 'exam_names';
    if (s === 'marks') return 'marks';
    if (s === 'subjects') return 'subjects';
    if (s === 'grading') return 'grading';
    if (s === 'processing') return 'processing';
    if (s === 'analysis') return 'analysis';
    if (s === 'marksheet') return 'marksheet';
    if (s === 'tabulation') return 'tabulation';
    if (s === 'merit') return 'merit';
    return 'academic_year';
  };

  const [tab, setTab] = useState(resolveInitialTab(sub));

  useEffect(() => {
    if (sub) {
      setTab(resolveInitialTab(sub));
    }
  }, [sub]);

  // Master Data States
  const [academicYears, setAcademicYears] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info'); // 'info' | 'success' | 'error'

  // Selection Filters for Marks & Processing
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedExam, setSelectedExam] = useState('');
  const [className, setClassName] = useState('6');

  // Operational States
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // Forms
  const [editingYearId, setEditingYearId] = useState(null);
  const [yearForm, setYearForm] = useState({
    year: '2026',
    title_bn: '২০২৬ শিক্ষাবর্ষ',
    is_current: true,
    status: 'active',
    remarks: 'চলমান শিক্ষাবর্ষ'
  });

  const [editingExamId, setEditingExamId] = useState(null);
  const [examFilterYear, setExamFilterYear] = useState('all');
  const [examForm, setExamForm] = useState({
    academic_year: '2026',
    name_bn: '',
    name_en: '',
    exam_type: 'সাময়িক পরীক্ষা',
    status: 'active',
    grading_scheme_id: '',
    remarks: ''
  });

  const [subjectForm, setSubjectForm] = useState({
    subject_id: '',
    full_marks: 100,
    pass_marks: 33,
    written_max: 100,
    mcq_max: 0,
    practical_max: 0
  });

  const [schemeForm, setSchemeForm] = useState({
    name_bn: 'বাংলাদেশ মাধ্যমিক সাধারণ গ্রেডিং',
    board: 'মাধ্যমিক শিক্ষা বোর্ড',
    academic_year: 2026,
    pass_percent: 33,
    rules: defaultRules.map(x => ({ min_percent: x[0], max_percent: x[1], letter_grade: x[2], gpa: x[3] }))
  });

  const showNotification = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => {
      setMsg('');
    }, 4500);
  };

  // Load Initial Core Data
  const loadMasterData = () => {
    api('/academic-years')
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setAcademicYears(list);
        const curr = list.find(y => y.is_current) || list[0];
        if (curr) {
          setSelectedYear(String(curr.year));
          setExamForm(prev => ({ ...prev, academic_year: String(curr.year) }));
        }
      })
      .catch(() => {});

    api('/exams')
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setExams(list);
        if (list.length && !selectedExam) {
          setSelectedExam(list[0].id);
        }
      })
      .catch(e => showNotification(e.message, 'error'));

    api('/subjects')
      .then(setSubjects)
      .catch(() => {});

    api('/grading-schemes')
      .then(setSchemes)
      .catch(() => {});
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  // When selected exam changes, load its subject setups
  useEffect(() => {
    if (selectedExam) {
      api(`/exams/${selectedExam}/subjects`)
        .then(setRows)
        .catch(() => {});
    }
  }, [selectedExam]);

  // Current active academic year computed
  const currentAcademicYear = useMemo(() => {
    return academicYears.find(y => y.is_current) || academicYears[0] || null;
  }, [academicYears]);

  // Filtered exams for Exam Names setup tab
  const filteredExamsForSetup = useMemo(() => {
    if (examFilterYear === 'all') return exams;
    return exams.filter(e => String(e.academic_year) === String(examFilterYear));
  }, [exams, examFilterYear]);

  // Filtered exams for Marks Entry toolbar
  const examsForSelectedYear = useMemo(() => {
    if (!selectedYear || selectedYear === 'all') return exams;
    return exams.filter(e => String(e.academic_year) === String(selectedYear));
  }, [exams, selectedYear]);

  // Auto-align selectedExam when selectedYear changes in toolbar
  useEffect(() => {
    if (examsForSelectedYear.length > 0) {
      const match = examsForSelectedYear.find(e => String(e.id) === String(selectedExam));
      if (!match) {
        setSelectedExam(examsForSelectedYear[0].id);
      }
    } else {
      setSelectedExam('');
    }
  }, [selectedYear, examsForSelectedYear]);

  // ==================== 1. ACADEMIC YEAR ACTIONS ====================
  const handleSaveAcademicYear = async (e) => {
    e.preventDefault();
    if (!yearForm.year || !yearForm.year.trim()) {
      showNotification('শিক্ষাবর্ষ উল্লেখ করুন (যেমন: 2026)', 'error');
      return;
    }

    try {
      if (editingYearId) {
        await api(`/academic-years/${editingYearId}`, {
          method: 'PUT',
          body: JSON.stringify(yearForm)
        });
        showNotification('শিক্ষাবর্ষ সফলভাবে আপডেট করা হয়েছে।', 'success');
      } else {
        await api('/academic-years', {
          method: 'POST',
          body: JSON.stringify(yearForm)
        });
        showNotification('নতুন শিক্ষাবর্ষ সফলভাবে সংরক্ষণ করা হয়েছে।', 'success');
      }
      setEditingYearId(null);
      setYearForm({
        year: '',
        title_bn: '',
        is_current: false,
        status: 'active',
        remarks: ''
      });
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'শিক্ষাবর্ষ সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleEditAcademicYear = (ay) => {
    setEditingYearId(ay.id || ay.year);
    setYearForm({
      year: ay.year || '',
      title_bn: ay.title_bn || '',
      is_current: !!ay.is_current,
      status: ay.status || 'active',
      remarks: ay.remarks || ''
    });
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSetCurrentAcademicYear = async (ay) => {
    try {
      await api(`/academic-years/${ay.id || ay.year}`, {
        method: 'PUT',
        body: JSON.stringify({ is_current: true })
      });
      showNotification(`${ay.title_bn || ay.year}-কে বর্তমান সক্রিয় শিক্ষাবর্ষ হিসেবে নির্ধারণ করা হয়েছে।`, 'success');
      setSelectedYear(String(ay.year));
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'সক্রিয় শিক্ষাবর্ষ পরিবর্তন ব্যর্থ', 'error');
    }
  };

  const handleDeleteAcademicYear = async (ay) => {
    const yearStr = String(ay.year);
    const linkedExams = exams.filter(e => String(e.academic_year) === yearStr);
    if (linkedExams.length > 0) {
      if (!confirm(`সতর্কতা: এই শিক্ষাবর্ষের অধীনে ${linkedExams.length}টি পরীক্ষা রয়েছে। তবুও কি মুছে ফেলতে চান?`)) {
        return;
      }
    } else {
      if (!confirm(`আপনি কি নিশ্চিত যে "${ay.title_bn || ay.year}" শিক্ষাবর্ষটি মুছে ফেলতে চান?`)) {
        return;
      }
    }

    try {
      await api(`/academic-years/${ay.id || ay.year}`, { method: 'DELETE' });
      showNotification('শিক্ষাবর্ষ মুছে ফেলা হয়েছে।', 'info');
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'মুছে ফেলতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const applyYearPreset = (preset) => {
    setYearForm({
      year: preset.year,
      title_bn: preset.title_bn,
      is_current: preset.is_current,
      status: preset.status,
      remarks: preset.remarks
    });
    setEditingYearId(null);
  };

  // ==================== 2. EXAM NAMES SETUP ACTIONS ====================
  // CRITICAL REQUIREMENT: NO DATE FIELDS HERE!
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.name_bn || !examForm.name_bn.trim()) {
      showNotification('পরীক্ষার বাংলা নাম আবশ্যক', 'error');
      return;
    }
    if (!examForm.academic_year) {
      showNotification('শিক্ষাবর্ষ নির্বাচন করুন', 'error');
      return;
    }

    try {
      if (editingExamId) {
        await api(`/exams/${editingExamId}`, {
          method: 'PUT',
          body: JSON.stringify({
            academic_year: examForm.academic_year,
            name_bn: examForm.name_bn.trim(),
            name_en: (examForm.name_en || '').trim(),
            exam_type: examForm.exam_type || 'সাময়িক পরীক্ষা',
            status: examForm.status || 'active',
            grading_scheme_id: examForm.grading_scheme_id || '',
            remarks: examForm.remarks || ''
          })
        });
        showNotification('পরীক্ষার নাম সফলভাবে আপডেট করা হয়েছে।', 'success');
      } else {
        const created = await api('/exams', {
          method: 'POST',
          body: JSON.stringify({
            academic_year: examForm.academic_year,
            name_bn: examForm.name_bn.trim(),
            name_en: (examForm.name_en || '').trim(),
            exam_type: examForm.exam_type || 'সাময়িক পরীক্ষা',
            status: examForm.status || 'active',
            grading_scheme_id: examForm.grading_scheme_id || '',
            remarks: examForm.remarks || ''
          })
        });
        showNotification(`"${examForm.name_bn}" পরীক্ষা সফলভাবে তৈরি হয়েছে।`, 'success');
        if (created?.id) setSelectedExam(created.id);
      }
      setEditingExamId(null);
      setExamForm({
        academic_year: selectedYear || '2026',
        name_bn: '',
        name_en: '',
        exam_type: 'সাময়িক পরীক্ষা',
        status: 'active',
        grading_scheme_id: '',
        remarks: ''
      });
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'পরীক্ষা সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleEditExam = (exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      academic_year: exam.academic_year || selectedYear || '2026',
      name_bn: exam.name_bn || '',
      name_en: exam.name_en || '',
      exam_type: exam.exam_type || 'সাময়িক পরীক্ষা',
      status: exam.status || 'active',
      grading_scheme_id: exam.grading_scheme_id || '',
      remarks: exam.remarks || ''
    });
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleDeleteExam = async (exam) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${exam.name_bn}" পরীক্ষাটি মুছে ফেলতে চান?`)) return;
    try {
      await api(`/exams/${exam.id}`, { method: 'DELETE' });
      showNotification('পরীক্ষা মুছে ফেলা হয়েছে।', 'info');
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'মুছে ফেলতে ব্যর্থ', 'error');
    }
  };

  const applyExamPreset = (preset) => {
    setExamForm(prev => ({
      ...prev,
      name_bn: preset.name_bn,
      name_en: preset.name_en,
      exam_type: preset.exam_type,
      academic_year: prev.academic_year || selectedYear || '2026'
    }));
  };

  const jumpToMarkEntry = (examId) => {
    setSelectedExam(examId);
    setTab('marks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================== 3. SUBJECT & GRADING ACTIONS ====================
  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!selectedExam) {
      showNotification('আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    try {
      await api(`/exams/${selectedExam}/subjects`, {
        method: 'POST',
        body: JSON.stringify(subjectForm)
      });
      showNotification('পরীক্ষার বিষয় ও নম্বর বণ্টন সেটআপ হয়েছে।', 'success');
      api(`/exams/${selectedExam}/subjects`).then(setRows);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      await api('/grading-schemes', {
        method: 'POST',
        body: JSON.stringify(schemeForm)
      });
      showNotification('Grading Scheme তৈরি হয়েছে।', 'success');
      loadMasterData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ==================== 4. MARKS ENTRY & RESULTS ====================
  const handleLoadMarks = async () => {
    if (!selectedExam) {
      showNotification('আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    try {
      const st = await api(`/students?class_name=${className}&status=active`);
      const es = await api(`/exams/${selectedExam}/subjects`);
      const m = await api(`/marks?exam_id=${selectedExam}`);
      const map = new Map(m.map(x => [x.student_id + '-' + x.subject_id, x]));
      const flat = [];
      st.forEach(x => {
        es.forEach(sub => {
          flat.push({
            ...x,
            subject_id: sub.subject_id || sub.id,
            subject_name: sub.name_bn,
            full_marks: sub.full_marks || 100,
            written_max: sub.written_max ?? 100,
            mcq_max: sub.mcq_max ?? 0,
            practical_max: sub.practical_max ?? 0,
            ...(map.get(x.id + '-' + (sub.subject_id || sub.id)) || {})
          });
        });
      });
      setStudents(flat);
      showNotification(`${flat.length}টি নম্বর এন্ট্রি সেল প্রস্তুত হয়েছে।`, 'info');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleEditMark = (i, k, v) => {
    setStudents(arr => arr.map((x, n) => (n === i ? { ...x, [k]: v } : x)));
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) {
      showNotification('পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!students.length) {
      showNotification('কোনো নম্বর রেকর্ড লোড করা নেই', 'error');
      return;
    }
    try {
      const d = await api('/marks/bulk', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: selectedExam,
          records: students.map(x => ({
            student_id: x.id,
            subject_id: x.subject_id,
            written: x.written,
            mcq: x.mcq,
            practical: x.practical,
            absent: !!x.absent,
            remarks: x.remarks || ''
          }))
        })
      });
      showNotification(`সফল! ${d.count || students.length}টি নম্বর সফলভাবে সংরক্ষণ হয়েছে।`, 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleProcessResults = async () => {
    if (!selectedExam) {
      showNotification('পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    try {
      const d = await api('/results/process', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExam })
      });
      showNotification(`ফলাফল প্রসেসিং সম্পন্ন! মোট ${d.count || 0}টি বিষয়ের গ্রেড প্রস্তুত হয়েছে।`, 'success');
      loadMasterData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleLoadAnalysis = async () => {
    if (!selectedExam) {
      showNotification('পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    try {
      const data = await api(`/results/analysis?exam_id=${selectedExam}&class_name=${className}`);
      setAnalysis(data);
      setTab('analysis');
      showNotification('ফলাফল বিশ্লেষণ প্রস্তুত হয়েছে।', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleLoadMerit = async () => {
    if (!selectedExam) {
      showNotification('পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    try {
      const d = await api(`/results/summary?exam_id=${selectedExam}&class_name=${className}`);
      setRows(d);
      setTab('merit');
      showNotification('মেধা তালিকা প্রস্তুত হয়েছে।', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const selectedExamObj = useMemo(() => {
    return exams.find(e => String(e.id) === String(selectedExam));
  }, [exams, selectedExam]);

  return (
    <div className="result-panel exam-modern-wrapper">
      {/* ================= TOP MODERN KPI BANNER ================= */}
      <div className="exam-kpi-banner">
        <div className="exam-kpi-card highlight-card">
          <div className="kpi-icon">🗓️</div>
          <div className="kpi-body">
            <span className="kpi-label">বর্তমান শিক্ষাবর্ষ</span>
            <div className="kpi-val">
              {currentAcademicYear ? currentAcademicYear.title_bn : '২০২৬ শিক্ষাবর্ষ'}
            </div>
            <span className="kpi-badge badge-active">সক্রিয় চলমান সেশন</span>
          </div>
        </div>

        <div className="exam-kpi-card">
          <div className="kpi-icon">📝</div>
          <div className="kpi-body">
            <span className="kpi-label">নির্ধারিত পরীক্ষার সংখ্যা</span>
            <div className="kpi-val">{toBnDigits(exams.length)} টি</div>
            <span className="kpi-sub">
              {toBnDigits(examsForSelectedYear.length)}টি পরীক্ষা ({toBnDigits(selectedYear)} শিক্ষাবর্ষ)
            </span>
          </div>
        </div>

        <div className="exam-kpi-card">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-body">
            <span className="kpi-label">চলমান পরীক্ষা</span>
            <div className="kpi-val exam-name-truncate">
              {selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা নির্বাচন করুন'}
            </div>
            <span className="kpi-sub">
              {selectedExamObj?.exam_type || 'অভ্যন্তরীণ পরীক্ষা'}
            </span>
          </div>
        </div>

        <div className="exam-kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-body">
            <span className="kpi-label">মার্ক এন্ট্রি ও ফলাফল</span>
            <div className="kpi-val">
              {selectedExamObj?.status === 'published' ? 'ফলাফল প্রকাশিত' : 'এন্ট্রি প্রস্তুত'}
            </div>
            <span className={`kpi-badge ${selectedExamObj?.status === 'published' ? 'badge-pub' : 'badge-draft'}`}>
              {selectedExamObj?.status === 'published' ? 'প্রকাশিত' : 'সক্রিয় খসড়া'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= NOTIFICATION TOAST ================= */}
      {msg && (
        <div className={`exam-alert-box alert-${msgType}`}>
          <span className="alert-icon">
            {msgType === 'success' ? '✓' : msgType === 'error' ? '⚠' : 'ℹ'}
          </span>
          <span className="alert-text">{msg}</span>
        </div>
      )}

      {/* ================= MODERN TAB NAVIGATION ================= */}
      <div className="exam-tab-bar">
        {[
          ['academic_year', '🗓️ ১. একাডেমিক ইয়ার সেটআপ'],
          ['exam_names', '📝 ২. পরীক্ষার নাম সেটআপ (মার্ক এন্ট্রি)'],
          ['marks', '✍️ মার্ক এন্ট্রি'],
          ['subjects', '📚 বিষয় ও নম্বর বণ্টন'],
          ['analysis', '📊 ফলাফল বিশ্লেষণ'],
          ['grading', '🎯 গ্রেডিং পলিসি'],
          ['processing', '⚙️ ফলাফল প্রসেসিং'],
          ['marksheet', '📄 মার্কশিট'],
          ['tabulation', '📋 ট্যাবুলেশন শিট'],
          ['merit', '🏆 মেধা তালিকা']
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`exam-tab-btn ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================= GLOBAL CONTEXT TOOLBAR (For Marks, Subjects, Analysis) ================= */}
      {['marks', 'subjects', 'processing', 'analysis', 'tabulation', 'merit'].includes(tab) && (
        <div className="exam-context-toolbar">
          <div className="toolbar-group">
            <label>শিক্ষাবর্ষ:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setExamForm(prev => ({ ...prev, academic_year: e.target.value }));
              }}
            >
              {academicYears.map(ay => (
                <option key={ay.id || ay.year} value={ay.year}>
                  {ay.title_bn || ay.year} {ay.is_current ? ' ★ (সক্রিয়)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar-group">
            <label>পরীক্ষা:</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={!examsForSelectedYear.length}
            >
              {examsForSelectedYear.length === 0 ? (
                <option value="">কোনো পরীক্ষা সেটআপ করা নেই</option>
              ) : (
                examsForSelectedYear.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name_bn} {e.status === 'published' ? '✓ (প্রকাশিত)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="toolbar-group">
            <label>শ্রেণি:</label>
            <select value={className} onChange={(e) => setClassName(e.target.value)}>
              {classes.map(c => (
                <option key={c} value={c}>
                  শ্রেণি {toBnDigits(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar-actions">
            {tab === 'marks' && (
              <>
                <button type="button" className="btn-modern-action" onClick={handleLoadMarks}>
                  📥 Roster / Marks লোড
                </button>
                <button type="button" className="btn-modern-primary" onClick={handleSaveMarks}>
                  💾 সব নম্বর সংরক্ষণ
                </button>
              </>
            )}
            <button
              type="button"
              className="btn-modern-secondary"
              onClick={() => {
                setTab('exam_names');
              }}
              title="নতুন পরীক্ষার নাম সেটআপ করতে যান"
            >
              + নতুন পরীক্ষা যোগ
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ACADEMIC YEAR SETUP TAB */}
      {/* ========================================================================= */}
      {tab === 'academic_year' && (
        <div className="exam-section-grid">
          {/* Left Form: Add / Edit Academic Year */}
          <div className="exam-card-form">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">সেটআপ পর্ব - ১</span>
                <h3>{editingYearId ? '✏️ শিক্ষাবর্ষ সম্পাদনা' : '➕ নতুন শিক্ষাবর্ষ সেটআপ'}</h3>
              </div>
              {editingYearId && (
                <button
                  type="button"
                  className="btn-text-cancel"
                  onClick={() => {
                    setEditingYearId(null);
                    setYearForm({
                      year: '',
                      title_bn: '',
                      is_current: false,
                      status: 'active',
                      remarks: ''
                    });
                  }}
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            <p className="card-desc">
              বিদ্যালয়ের বিভিন্ন শিক্ষাবর্ষ নির্ধারণ করুন। নির্ধারিত শিক্ষাবর্ষের অধীনেই বিভিন্ন পরীক্ষা এবং মার্ক এন্ট্রি পরিচালিত হবে।
            </p>

            {/* Quick Year Presets */}
            {!editingYearId && (
              <div className="preset-chip-shelf">
                <span className="preset-label">দ্রুত প্রিসেট:</span>
                {STANDARD_YEAR_PRESETS.map((p) => (
                  <button
                    key={p.year}
                    type="button"
                    className="preset-chip"
                    onClick={() => applyYearPreset(p)}
                  >
                    + {p.title_bn}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveAcademicYear} className="exam-form-body">
              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>শিক্ষাবর্ষ (বছর) *</label>
                  <input
                    type="number"
                    placeholder="যেমন: 2026"
                    value={yearForm.year}
                    onChange={(e) => {
                      const y = e.target.value;
                      setYearForm(f => ({
                        ...f,
                        year: y,
                        title_bn: f.title_bn && !f.title_bn.includes('শিক্ষাবর্ষ') ? f.title_bn : (y ? `${toBnDigits(y)} শিক্ষাবর্ষ` : '')
                      }));
                    }}
                    required
                  />
                  <small className="field-hint">৪ ডিজিটের ইংরেজি সাল (যেমন: 2026, 2027)</small>
                </div>

                <div className="form-field-unit">
                  <label>শিক্ষাবর্ষের নাম / শিরোনাম *</label>
                  <input
                    type="text"
                    placeholder="যেমন: ২০২৬ শিক্ষাবর্ষ"
                    value={yearForm.title_bn}
                    onChange={(e) => setYearForm(f => ({ ...f, title_bn: e.target.value }))}
                    required
                  />
                  <small className="field-hint">বাংলায় শিরোনাম যা সনদে ও রিপোর্টে প্রদর্শিত হবে</small>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>শিক্ষাবর্ষের অবস্থা (Status)</label>
                  <select
                    value={yearForm.status}
                    onChange={(e) => setYearForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">🟢 সক্রিয় / চলমান শিক্ষাবর্ষ</option>
                    <option value="upcoming">🔵 আসন্ন শিক্ষাবর্ষ</option>
                    <option value="completed">⚪ সম্পন্ন / বিগত শিক্ষাবর্ষ</option>
                  </select>
                </div>

                <div className="form-field-unit">
                  <label>মন্তব্য / অতিরিক্ত তথ্য</label>
                  <input
                    type="text"
                    placeholder="যেমন: চলমান শিক্ষাবর্ষ / আর্কাইভ"
                    value={yearForm.remarks}
                    onChange={(e) => setYearForm(f => ({ ...f, remarks: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-checkbox-unit">
                <label className="checkbox-label-modern">
                  <input
                    type="checkbox"
                    checked={yearForm.is_current}
                    onChange={(e) => setYearForm(f => ({ ...f, is_current: e.target.checked }))}
                  />
                  <span>
                    ⭐ <b>এই শিক্ষাবর্ষটিকে বিদ্যালয়ের বর্তমান প্রধান শিক্ষাবর্ষ হিসেবে নির্ধারণ করুন</b>
                  </span>
                </label>
                <small className="field-hint checkbox-hint">
                  সক্রিয় করলে সিস্টেমে ডিফল্টভাবে এই শিক্ষাবর্ষটি স্বয়ংক্রিয়ভাবে নির্বাচিত থাকবে।
                </small>
              </div>

              <button type="submit" className="btn-modern-submit full-width">
                {editingYearId ? '💾 শিক্ষাবর্ষ আপডেট করুন' : '💾 শিক্ষাবর্ষ সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          {/* Right Table: Academic Years List */}
          <div className="exam-card-table">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">শিক্ষাবর্ষ তালিকা</span>
                <h3>📋 তালিকাভুক্ত শিক্ষাবর্ষসমূহ</h3>
              </div>
              <span className="count-pill">মোট: {toBnDigits(academicYears.length)} টি</span>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table">
                <thead>
                  <tr>
                    <th>শিক্ষাবর্ষ</th>
                    <th>শিরোনাম</th>
                    <th>অবস্থা</th>
                    <th>প্রধান শিক্ষাবর্ষ</th>
                    <th>পরীক্ষার সংখ্যা</th>
                    <th style={{ textAlign: 'right' }}>কাজ</th>
                  </tr>
                </thead>
                <tbody>
                  {academicYears.map((ay) => {
                    const count = exams.filter(e => String(e.academic_year) === String(ay.year)).length;
                    return (
                      <tr key={ay.id || ay.year} className={ay.is_current ? 'row-current-year' : ''}>
                        <td>
                          <b className="year-pill">{toBnDigits(ay.year)}</b>
                        </td>
                        <td>
                          <b>{ay.title_bn || `${ay.year} শিক্ষাবর্ষ`}</b>
                          {ay.remarks && <div className="sub-desc">{ay.remarks}</div>}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              ay.status === 'active'
                                ? 'status-active'
                                : ay.status === 'upcoming'
                                ? 'status-upcoming'
                                : 'status-completed'
                            }`}
                          >
                            {ay.status === 'active'
                              ? 'চলমান'
                              : ay.status === 'upcoming'
                              ? 'আসন্ন'
                              : 'সম্পন্ন'}
                          </span>
                        </td>
                        <td>
                          {ay.is_current ? (
                            <span className="badge-active-main">
                              ★ বর্তমান সক্রিয়
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-set-current"
                              onClick={() => handleSetCurrentAcademicYear(ay)}
                              title="বর্তমান প্রধান সক্রিয় শিক্ষাবর্ষ করুন"
                            >
                              সক্রিয় করুন
                            </button>
                          )}
                        </td>
                        <td>
                          <span className="badge-exam-count">
                            {toBnDigits(count)} টি পরীক্ষা
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-group">
                            <button
                              type="button"
                              className="btn-action-icon view-exam"
                              onClick={() => {
                                setExamFilterYear(String(ay.year));
                                setExamForm(prev => ({ ...prev, academic_year: String(ay.year) }));
                                setTab('exam_names');
                              }}
                              title="এই শিক্ষাবর্ষের পরীক্ষাসমূহ দেখুন"
                            >
                              📝 পরীক্ষা
                            </button>
                            <button
                              type="button"
                              className="btn-action-icon edit"
                              onClick={() => handleEditAcademicYear(ay)}
                              title="সম্পাদনা করুন"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn-action-icon delete"
                              onClick={() => handleDeleteAcademicYear(ay)}
                              title="মুছে ফেলুন"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!academicYears.length && (
                    <tr>
                      <td colSpan="6" className="empty-table-cell">
                        কোনো শিক্ষাবর্ষ সেটআপ করা নেই। বামপাশের ফর্ম থেকে যুক্ত করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer-notice">
              💡 <b>পরামর্শ:</b> শিক্ষাবর্ষ সেটআপ সম্পন্ন করার পর পরবর্তী ধাপ হিসেবে <b>"২. পরীক্ষার নাম সেটআপ"</b> ট্যাবে গিয়ে বিভিন্ন পরীক্ষার নাম নির্ধারণ করুন।
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXAM NAMES SETUP TAB (FOR MARKS ENTRY - ZERO DATE FIELDS!) */}
      {/* ========================================================================= */}
      {tab === 'exam_names' && (
        <div className="exam-section-grid">
          {/* Left Form: Add / Edit Exam Name */}
          <div className="exam-card-form">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">সেটআপ পর্ব - ২</span>
                <h3>{editingExamId ? '✏️ পরীক্ষার নাম সম্পাদনা' : '➕ নতুন পরীক্ষার নাম স্থাপন'}</h3>
              </div>
              {editingExamId && (
                <button
                  type="button"
                  className="btn-text-cancel"
                  onClick={() => {
                    setEditingExamId(null);
                    setExamForm({
                      academic_year: selectedYear || '2026',
                      name_bn: '',
                      name_en: '',
                      exam_type: 'সাময়িক পরীক্ষা',
                      status: 'active',
                      grading_scheme_id: '',
                      remarks: ''
                    });
                  }}
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            {/* Note highlighting NO DATE FIELDS */}
            <div className="exam-no-date-notice">
              <span className="notice-icon">📌</span>
              <div>
                <b>মার্ক এন্ট্রি ও ফলাফল প্রস্তুতের জন্য পরীক্ষা স্থাপন</b>
                <p>
                  এখানে <b>কোনো তারিখের ফিল্ড নেই</b>, কারণ এটি পরীক্ষার রুটিনের জন্য নয়—এটি সরাসরি শিক্ষক কর্তৃক মার্ক এন্ট্রি, নম্বর সংরক্ষণ ও ফলাফল প্রক্রিয়াকরণের জন্য তৈরি।
                </p>
              </div>
            </div>

            {/* Standard Bangladeshi Exam Quick Presets */}
            <div className="preset-chip-shelf">
              <span className="preset-label">বাংলা মাধ্যমের প্রচলিত প্রিসেট:</span>
              <div className="preset-chip-wrap">
                {STANDARD_EXAM_PRESETS.map((p) => (
                  <button
                    key={p.name_bn}
                    type="button"
                    className="preset-chip"
                    onClick={() => applyExamPreset(p)}
                  >
                    ⚡ {p.name_bn}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveExam} className="exam-form-body">
              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>শিক্ষাবর্ষ *</label>
                  <select
                    value={examForm.academic_year}
                    onChange={(e) => setExamForm(f => ({ ...f, academic_year: e.target.value }))}
                    required
                  >
                    {academicYears.map(ay => (
                      <option key={ay.id || ay.year} value={ay.year}>
                        {ay.title_bn || ay.year} {ay.is_current ? ' ★ (সক্রিয়)' : ''}
                      </option>
                    ))}
                    {!academicYears.length && <option value="2026">২০২৬ শিক্ষাবর্ষ</option>}
                  </select>
                  <small className="field-hint">যে শিক্ষাবর্ষের আওতায় পরীক্ষাটি অনুষ্ঠিত হবে</small>
                </div>

                <div className="form-field-unit">
                  <label>পরীক্ষার ধরন / ক্যাটাগরি *</label>
                  <select
                    value={examForm.exam_type}
                    onChange={(e) => setExamForm(f => ({ ...f, exam_type: e.target.value }))}
                  >
                    <option value="সাময়িক পরীক্ষা">সাময়িক পরীক্ষা</option>
                    <option value="অর্ধবার্ষিক পরীক্ষা">অর্ধবার্ষিক পরীক্ষা</option>
                    <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
                    <option value="প্রাক-নির্বাচনী পরীক্ষা">প্রাক-নির্বাচনী পরীক্ষা</option>
                    <option value="নির্বাচনী পরীক্ষা (Test)">নির্বাচনী পরীক্ষা (Test)</option>
                    <option value="মডেল টেস্ট / ক্লাস টেস্ট">মডেল টেস্ট / ক্লাস টেস্ট</option>
                    <option value="অভ্যন্তরীণ মূল্যায়ন">অভ্যন্তরীণ মূল্যায়ন</option>
                  </select>
                </div>
              </div>

              <div className="form-field-unit">
                <label>পরীক্ষার নাম (বাংলায়) *</label>
                <input
                  type="text"
                  placeholder="যেমন: ১ম সাময়িক পরীক্ষা / অর্ধবার্ষিক পরীক্ষা"
                  value={examForm.name_bn}
                  onChange={(e) => setExamForm(f => ({ ...f, name_bn: e.target.value }))}
                  required
                />
                <small className="field-hint">মার্কশিট ও ফলাফলে এই নামটি প্রদর্শিত হবে</small>
              </div>

              <div className="form-field-unit">
                <label>পরীক্ষার নাম (ইংরেজিতে - ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: 1st Terminal Examination / Half Yearly Exam"
                  value={examForm.name_en}
                  onChange={(e) => setExamForm(f => ({ ...f, name_en: e.target.value }))}
                />
              </div>

              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>নম্বর এন্ট্রি ও ফলাফল অবস্থা (Status)</label>
                  <select
                    value={examForm.status}
                    onChange={(e) => setExamForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">🟢 সক্রিয় (নম্বর এন্ট্রি উন্মুক্ত)</option>
                    <option value="draft">🟡 প্রস্তুত / খসড়া</option>
                    <option value="published">🟣 ফলাফল প্রকাশিত</option>
                  </select>
                </div>

                <div className="form-field-unit">
                  <label>গ্রেডিং স্কিম (পরেও পরিবর্তনযোগ্য)</label>
                  <select
                    value={examForm.grading_scheme_id}
                    onChange={(e) => setExamForm(f => ({ ...f, grading_scheme_id: e.target.value }))}
                  >
                    <option value="">ডিফল্ট সাধারণ গ্রেডিং (SSC Standard)</option>
                    {schemes.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name_bn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field-unit">
                <label>প্রযোজ্য শ্রেণি বা অতিরিক্ত মন্তব্য</label>
                <input
                  type="text"
                  placeholder="যেমন: ৬ষ্ঠ থেকে ১০ম শ্রেণি"
                  value={examForm.remarks}
                  onChange={(e) => setExamForm(f => ({ ...f, remarks: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-modern-submit full-width">
                {editingExamId ? '💾 পরীক্ষার নাম আপডেট করুন' : '💾 পরীক্ষার নাম সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          {/* Right Table: Exam Names List */}
          <div className="exam-card-table">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">পরীক্ষার তালিকা</span>
                <h3>📋 তালিকাভুক্ত পরীক্ষাসমূহ</h3>
              </div>
              <div className="table-filter-wrap">
                <label>শিক্ষাবর্ষ ফিল্টার:</label>
                <select
                  value={examFilterYear}
                  onChange={(e) => setExamFilterYear(e.target.value)}
                  className="filter-select-mini"
                >
                  <option value="all">সকল শিক্ষাবর্ষ ({toBnDigits(exams.length)})</option>
                  {academicYears.map(ay => (
                    <option key={ay.id || ay.year} value={ay.year}>
                      {ay.title_bn || ay.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table">
                <thead>
                  <tr>
                    <th>শিক্ষাবর্ষ</th>
                    <th>পরীক্ষার নাম</th>
                    <th>ধরন</th>
                    <th>অবস্থা</th>
                    <th style={{ textAlign: 'right' }}>কাজ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamsForSetup.map((ex) => (
                    <tr key={ex.id}>
                      <td>
                        <span className="year-pill-mini">
                          {toBnDigits(ex.academic_year || '2026')}
                        </span>
                      </td>
                      <td>
                        <div className="exam-main-title">
                          <b>{ex.name_bn}</b>
                          {ex.name_en && <span className="exam-en-title">{ex.name_en}</span>}
                        </div>
                        {ex.remarks && <div className="sub-desc">{ex.remarks}</div>}
                      </td>
                      <td>
                        <span className="exam-type-pill">{ex.exam_type || 'অভ্যন্তরীণ'}</span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            ex.status === 'active'
                              ? 'status-active'
                              : ex.status === 'published'
                              ? 'status-published'
                              : 'status-draft'
                          }`}
                        >
                          {ex.status === 'active'
                            ? '🟢 এন্ট্রি উন্মুক্ত'
                            : ex.status === 'published'
                            ? '🟣 ফলাফল প্রকাশিত'
                            : '🟡 প্রস্তুত'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-group">
                          <button
                            type="button"
                            className="btn-action-jump-marks"
                            onClick={() => jumpToMarkEntry(ex.id)}
                            title="এই পরীক্ষায় নম্বর এন্ট্রি করুন"
                          >
                            ✍️ মার্ক এন্ট্রি ➜
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon edit"
                            onClick={() => handleEditExam(ex)}
                            title="সম্পাদনা"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon delete"
                            onClick={() => handleDeleteExam(ex)}
                            title="মুছুন"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredExamsForSetup.length && (
                    <tr>
                      <td colSpan="5" className="empty-table-cell">
                        এই শিক্ষাবর্ষের জন্য কোনো পরীক্ষা তৈরি করা হয়নি। বামপাশের ফর্ম বা প্রিসেট থেকে যুক্ত করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer-notice">
              💡 <b>টিপস:</b> যেকোনো পরীক্ষার পাশে <b>"✍️ মার্ক এন্ট্রি ➜"</b> বাটনে ক্লিক করলে সরাসরি ওই পরীক্ষার নম্বর এন্ট্রি স্ক্রিনে নিয়ে যাবে।
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MARKS ENTRY TAB */}
      {/* ========================================================================= */}
      {tab === 'marks' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">নম্বর এন্ট্রি কনসোল</span>
              <h3>
                ✍️ {selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা নির্বাচন করুন'} — শ্রেণি {toBnDigits(className)} এর নম্বর এন্ট্রি
              </h3>
            </div>
            <div className="table-action-group">
              <button type="button" className="btn-modern-action" onClick={handleLoadMarks}>
                📥 তালিকা লোড করুন
              </button>
              <button type="button" className="btn-modern-primary" onClick={handleSaveMarks}>
                💾 সব নম্বর সংরক্ষণ
              </button>
              <button type="button" className="btn-modern-secondary" onClick={handleProcessResults}>
                🧮 Result Process
              </button>
              <button type="button" className="btn-modern-secondary" onClick={handleLoadMerit}>
                🏆 মেধা দেখুন
              </button>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-exam-table marks-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>রোল</th>
                  <th>Student ID</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>বিষয়</th>
                  <th style={{ width: '90px' }}>লিখিত</th>
                  <th style={{ width: '90px' }}>MCQ</th>
                  <th style={{ width: '90px' }}>ব্যবহারিক</th>
                  <th style={{ width: '90px' }}>মোট</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>অনুপস্থিত</th>
                  <th>মন্তব্য</th>
                </tr>
              </thead>
              <tbody>
                {students.map((x, i) => {
                  const written = Number(x.written) || 0;
                  const mcq = Number(x.mcq) || 0;
                  const prac = Number(x.practical) || 0;
                  const total = x.absent ? 0 : written + mcq + prac;
                  return (
                    <tr key={`${x.id}-${x.subject_id}`}>
                      <td>
                        <span className="roll-pill">{toBnDigits(x.roll_no || '—')}</span>
                      </td>
                      <td>
                        <span className="code-pill">{x.student_id || '—'}</span>
                      </td>
                      <td>
                        <b>{x.name_bn}</b>
                      </td>
                      <td>
                        <span className="subject-tag">{x.subject_name || 'বিষয়'}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="mark-input-box"
                          min="0"
                          max={x.written_max ?? 100}
                          step="0.5"
                          disabled={x.absent}
                          value={x.written ?? ''}
                          onChange={(e) => handleEditMark(i, 'written', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="mark-input-box"
                          min="0"
                          max={x.mcq_max ?? 100}
                          step="0.5"
                          disabled={x.absent}
                          value={x.mcq ?? ''}
                          onChange={(e) => handleEditMark(i, 'mcq', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="mark-input-box"
                          min="0"
                          max={x.practical_max ?? 100}
                          step="0.5"
                          disabled={x.absent}
                          value={x.practical ?? ''}
                          onChange={(e) => handleEditMark(i, 'practical', e.target.value)}
                        />
                      </td>
                      <td>
                        <b className={`mark-total-display ${x.absent ? 'absent' : ''}`}>
                          {x.absent ? 'Abs' : toBnDigits(total)}
                        </b>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!x.absent}
                          onChange={(e) => handleEditMark(i, 'absent', e.target.checked)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="remarks-input-box"
                          placeholder="মন্তব্য"
                          value={x.remarks || ''}
                          onChange={(e) => handleEditMark(i, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {!students.length && (
                  <tr>
                    <td colSpan="10" className="empty-table-cell">
                      উপরের "📥 তালিকা লোড করুন" বাটনে ক্লিক করে নির্বাচিত শ্রেণির শিক্ষার্থীদের নম্বর এন্ট্রি ঘর প্রস্তুত করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBJECTS SETUP TAB */}
      {/* ========================================================================= */}
      {tab === 'subjects' && (
        <div className="exam-section-grid">
          <div className="exam-card-form">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">বিষয় কনফিগারেশন</span>
                <h3>পরীক্ষার বিষয় ও নম্বর বণ্টন</h3>
              </div>
            </div>
            <p className="card-desc">
              নির্বাচিত পরীক্ষার জন্য বিষয়ভিত্তিক পূর্ণমান ও পাস নম্বর বণ্টন নির্ধারণ করুন।
            </p>
            <form onSubmit={handleSaveSubject} className="exam-form-body">
              <div className="form-field-unit">
                <label>বিষয় নির্বাচন *</label>
                <select
                  value={subjectForm.subject_id}
                  onChange={(e) => setSubjectForm(f => ({ ...f, subject_id: e.target.value }))}
                  required
                >
                  <option value="">বিষয় নির্বাচন করুন</option>
                  {subjects
                    .filter(x => !x.class_name || String(x.class_name) === String(className))
                    .map(x => (
                      <option key={x.id} value={x.id}>
                        {x.code} — {x.name_bn}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>পূর্ণ নম্বর (Full Marks)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subjectForm.full_marks}
                    onChange={(e) => setSubjectForm(f => ({ ...f, full_marks: e.target.value }))}
                  />
                </div>
                <div className="form-field-unit">
                  <label>পাস নম্বর (Pass Marks)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subjectForm.pass_marks}
                    onChange={(e) => setSubjectForm(f => ({ ...f, pass_marks: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>লিখিত (Written)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subjectForm.written_max}
                    onChange={(e) => setSubjectForm(f => ({ ...f, written_max: e.target.value }))}
                  />
                </div>
                <div className="form-field-unit">
                  <label>MCQ</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subjectForm.mcq_max}
                    onChange={(e) => setSubjectForm(f => ({ ...f, mcq_max: e.target.value }))}
                  />
                </div>
                <div className="form-field-unit">
                  <label>ব্যবহারিক (Practical)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subjectForm.practical_max}
                    onChange={(e) => setSubjectForm(f => ({ ...f, practical_max: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-modern-submit full-width"
                disabled={!selectedExam}
              >
                💾 বিষয় সেটআপ সংরক্ষণ
              </button>
            </form>
          </div>

          <div className="exam-card-table">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">নির্ধারিত বিষয়সমূহ</span>
                <h3>{selectedExamObj ? `${selectedExamObj.name_bn}-এর বিষয় তালিকা` : 'আগে পরীক্ষা নির্বাচন করুন'}</h3>
              </div>
            </div>
            <div className="table-responsive-wrapper">
              <table className="modern-exam-table">
                <thead>
                  <tr>
                    <th>কোড</th>
                    <th>বিষয়</th>
                    <th>পূর্ণমান</th>
                    <th>পাস</th>
                    <th>নম্বর বণ্টন (লিখিত + MCQ + ব্যবহারিক)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id}>
                      <td><span className="code-pill">{x.code}</span></td>
                      <td><b>{x.name_bn}</b></td>
                      <td>{toBnDigits(x.full_marks)}</td>
                      <td>{toBnDigits(x.pass_marks)}</td>
                      <td>
                        {toBnDigits(x.written_max || 0)} + {toBnDigits(x.mcq_max || 0)} + {toBnDigits(x.practical_max || 0)}
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan="5" className="empty-table-cell">
                        এই পরীক্ষার জন্য এখনো আলাদা বিষয় বণ্টন তৈরি করা হয়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GRADING SCHEME TAB */}
      {/* ========================================================================= */}
      {tab === 'grading' && (
        <div className="exam-card-form full-width-card">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">মূল্যায়ন পলিসি</span>
              <h3>🎯 Grading Scheme Configuration</h3>
            </div>
          </div>
          <form onSubmit={handleCreateScheme} className="exam-form-body">
            <div className="form-group-row">
              <div className="form-field-unit">
                <label>Scheme নাম</label>
                <input
                  value={schemeForm.name_bn}
                  onChange={(e) => setSchemeForm(f => ({ ...f, name_bn: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field-unit">
                <label>শিক্ষা বোর্ড</label>
                <input
                  value={schemeForm.board}
                  onChange={(e) => setSchemeForm(f => ({ ...f, board: e.target.value }))}
                />
              </div>
              <div className="form-field-unit">
                <label>শিক্ষাবর্ষ</label>
                <input
                  type="number"
                  value={schemeForm.academic_year}
                  onChange={(e) => setSchemeForm(f => ({ ...f, academic_year: e.target.value }))}
                />
              </div>
              <div className="form-field-unit">
                <label>পাস শতকরা (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={schemeForm.pass_percent}
                  onChange={(e) => setSchemeForm(f => ({ ...f, pass_percent: e.target.value }))}
                />
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table">
                <thead>
                  <tr>
                    <th>Min %</th>
                    <th>Max %</th>
                    <th>Letter Grade</th>
                    <th>GPA Point</th>
                  </tr>
                </thead>
                <tbody>
                  {schemeForm.rules.map((r, i) => (
                    <tr key={i}>
                      {['min_percent', 'max_percent', 'letter_grade', 'gpa'].map((k) => (
                        <td key={k}>
                          <input
                            className="mark-input-box"
                            value={r[k]}
                            onChange={(e) =>
                              setSchemeForm(f => ({
                                ...f,
                                rules: f.rules.map((z, n) => (n === i ? { ...z, [k]: e.target.value } : z))
                              }))
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="submit" className="btn-modern-submit">
              💾 Grading Scheme সংরক্ষণ
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RESULT PROCESSING TAB */}
      {/* ========================================================================= */}
      {tab === 'processing' && (
        <div className="exam-card-form">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">অটো প্রসেসিং</span>
              <h3>⚙️ ফলাফল প্রক্রিয়াকরণ (Result Processing)</h3>
            </div>
          </div>
          <p className="card-desc">
            নির্বাচিত পরীক্ষা ও শ্রেণির সকল শিক্ষার্থীর সংগৃহীত নম্বর থেকে স্বয়ংক্রিয়ভাবে জিপিএ, লেটার গ্রেড ও মেধা তালিকা গণনা করুন।
          </p>
          <div className="exam-processing-box">
            <div className="proc-info-line">
              <b>নির্বাচিত পরীক্ষা:</b> {selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা নির্বাচিত নেই'}
            </div>
            <div className="proc-info-line">
              <b>শিক্ষাবর্ষ:</b> {toBnDigits(selectedYear)}
            </div>
            <div className="proc-info-line">
              <b>শ্রেণি:</b> শ্রেণি {toBnDigits(className)}
            </div>
            <button
              type="button"
              className="btn-modern-primary btn-large"
              onClick={handleProcessResults}
              disabled={!selectedExam}
            >
              🧮 Result Process চালান
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. RESULT ANALYSIS TAB */}
      {/* ========================================================================= */}
      {tab === 'analysis' && (
        <div className="analysis-panel">
          {!analysis ? (
            <div className="exam-card-form text-center">
              <h3>📊 ফলাফল বিশ্লেষণ প্রস্তুত করুন</h3>
              <p>নির্বাচিত পরীক্ষা ও শ্রেণির সার্বিক ফলাফল এবং বিষয়ভিত্তিক পরিসংখ্যান দেখতে নিচের বাটনে ক্লিক করুন।</p>
              <button type="button" className="btn-modern-primary" onClick={handleLoadAnalysis}>
                ফলাফল বিশ্লেষণ প্রস্তুত করুন
              </button>
            </div>
          ) : (
            <>
              <div className="report-cards">
                <div><b>{toBnDigits(analysis.overall?.students || 0)}</b><span>পরীক্ষার্থী</span></div>
                <div><b>{toBnDigits(analysis.overall?.passed || 0)}</b><span>উত্তীর্ণ</span></div>
                <div><b>{toBnDigits(analysis.overall?.failed || 0)}</b><span>অকৃতকার্য</span></div>
                <div><b>{toBnDigits(analysis.overall?.avg_percentage || 0)}%</b><span>গড় শতকরা</span></div>
                <div><b>{analysis.overall?.avg_gpa || 0}</b><span>গড় GPA</span></div>
                <div><b>{analysis.overall?.highest_percentage || 0}%</b><span>সর্বোচ্চ</span></div>
              </div>

              <div className="exam-card-table">
                <div className="card-header-styled">
                  <h3>বিষয়ভিত্তিক ফলাফল বিশ্লেষণ</h3>
                  <button type="button" className="btn-text-action" onClick={handleLoadAnalysis}>
                    🔄 রিফ্রেশ
                  </button>
                </div>
                <div className="table-responsive-wrapper">
                  <table className="modern-exam-table">
                    <thead>
                      <tr>
                        <th>বিষয়</th>
                        <th>গড় নম্বর</th>
                        <th>গড় %</th>
                        <th>উত্তীর্ণ</th>
                        <th>অকৃতকার্য</th>
                        <th>পাসের হার (Pass Rate)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analysis.subjects || []).map((x) => (
                        <tr key={x.code}>
                          <td><b>{x.code} — {x.subject_name}</b></td>
                          <td>{toBnDigits(x.avg_marks)}</td>
                          <td>{toBnDigits(x.avg_percentage)}%</td>
                          <td>{toBnDigits(x.passed)}</td>
                          <td>{toBnDigits(x.failed)}</td>
                          <td><b>{toBnDigits(x.pass_rate)}%</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MARKSHEET TAB */}
      {/* ========================================================================= */}
      {tab === 'marksheet' && (
        <div className="exam-card-form">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">অফিসিয়াল ডকুমেন্ট</span>
              <h3>📄 মার্কশিট ও প্রগ্রেস রিপোর্ট তৈরি</h3>
            </div>
          </div>
          <p className="card-desc">
            শিক্ষার্থী ও পরীক্ষা নির্বাচন করে অফিশিয়াল মার্কশিট প্রিন্ট অথবা ডাউনলোড করতে ডকুমেন্ট সেন্টারে যান।
          </p>
          <button
            type="button"
            className="btn-modern-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('open-document', { detail: 'marksheet' }))}
          >
            🖨️ মার্কশিট জেনারেটরে যান
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TABULATION SHEET TAB */}
      {/* ========================================================================= */}
      {tab === 'tabulation' && (
        <div className="exam-card-form">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">অফিসিয়াল ডকুমেন্ট</span>
              <h3>📋 ট্যাবুলেশন শিট তৈরি</h3>
            </div>
          </div>
          <p className="card-desc">
            নির্বাচিত পরীক্ষা ও শ্রেণির সকল বিষয়ের নম্বর সংবলিত পূর্ণাঙ্গ মাস্টার ট্যাবুলেশন শিট প্রস্তুত করতে ডকুমেন্ট সেন্টারে যান।
          </p>
          <button
            type="button"
            className="btn-modern-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('open-document', { detail: 'tabulation' }))}
          >
            🖨️ ট্যাবুলেশন শিট জেনারেটরে যান
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MERIT LIST TAB */}
      {/* ========================================================================= */}
      {tab === 'merit' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">চূড়ান্ত মেধা তালিকা</span>
              <h3>🏆 মেধা ও ফলাফল তালিকা ({selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা'})</h3>
            </div>
            <button type="button" className="btn-modern-primary" onClick={handleLoadMerit}>
              🔄 রিফ্রেশ
            </button>
          </div>
          <div className="table-responsive-wrapper">
            <table className="modern-exam-table">
              <thead>
                <tr>
                  <th>মেধা</th>
                  <th>রোল</th>
                  <th>Student ID</th>
                  <th>নাম</th>
                  <th>মোট নম্বর</th>
                  <th>শতকরা</th>
                  <th>GPA</th>
                  <th>ফলাফল</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td><b className="merit-badge">{x.merit ? toBnDigits(x.merit) : '—'}</b></td>
                    <td><span className="roll-pill">{toBnDigits(x.roll_no || '—')}</span></td>
                    <td><span className="code-pill">{x.student_id}</span></td>
                    <td><b>{x.name_bn}</b></td>
                    <td>{toBnDigits(x.total_marks)}</td>
                    <td>{toBnDigits(x.percentage)}%</td>
                    <td><b>{x.gpa ?? '—'}</b></td>
                    <td>
                      <span className={`status-pill ${x.result_status === 'উত্তীর্ণ' ? 'status-active' : 'status-completed'}`}>
                        {x.result_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan="8" className="empty-table-cell">
                      মেধা তালিকা দেখতে "ফলাফল প্রসেস" সম্পন্ন করে উপরের "রিফ্রেশ" বাটনে ক্লিক করুন।
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

export default ResultPanel;
