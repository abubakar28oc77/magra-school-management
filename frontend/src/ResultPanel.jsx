import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PromotionPanel } from './PromotionPanel.jsx';
import { requestApi, sortStudentsList, getStudentGroupPriority } from './apiClient';
import {
  DHAKA_BOARD_GRADING_SCALE,
  calculateSubjectGrade,
  calculateOverallResult,
  getStudentApplicableSubjects,
  processClassResults,
  generateResultAnalytics,
  toBnDigits
} from './boardExamEngine';

const api = requestApi;

export function matchesStudentGroup(student, deptFilter) {
  if (!student) return false;
  if (!deptFilter || deptFilter === 'all' || deptFilter === 'সকল বিভাগ') return true;

  const f = String(deptFilter).toLowerCase().trim();
  const wantSci = f.includes('বিজ্ঞান') || f.includes('science') || f.includes('sci');
  const wantHum = f.includes('মানবিক') || f.includes('humanities') || f.includes('hum') || f.includes('arts');
  const wantBus = f.includes('ব্যবসা') || f.includes('ব্যবসায়') || f.includes('ব্যবসায়') || f.includes('বাণিজ্য') || f.includes('business') || f.includes('commerce') || f.includes('bs');

  const s = student.student || student;
  const rawDept = String(s.department || s.group_name || s.group || s.section || s.student_code || s.student_id || s.id || '').toLowerCase();

  const isSci = rawDept.includes('বিজ্ঞান') || rawDept.includes('science') || rawDept.includes('sci') || (s.student_id && String(s.student_id).toLowerCase().includes('sci')) || (s.student_code && String(s.student_code).toLowerCase().includes('sci'));
  const isHum = rawDept.includes('মানবিক') || rawDept.includes('humanities') || rawDept.includes('hum') || rawDept.includes('arts') || (s.student_id && String(s.student_id).toLowerCase().includes('hum')) || (s.student_code && String(s.student_code).toLowerCase().includes('hum'));
  const isBus = rawDept.includes('ব্যবসা') || rawDept.includes('ব্যবসায়') || rawDept.includes('ব্যবসায়') || rawDept.includes('বাণিজ্য') || rawDept.includes('business') || rawDept.includes('commerce') || rawDept.includes('bs') || (s.student_id && String(s.student_id).toLowerCase().includes('bs')) || (s.student_code && String(s.student_code).toLowerCase().includes('bs'));

  if (wantSci) return Boolean(isSci && !isHum && !isBus);
  if (wantHum) return Boolean(isHum && !isSci && !isBus);
  if (wantBus) return Boolean(isBus && !isSci && !isHum);

  const prio = getStudentGroupPriority(s);
  if (wantSci) return prio === 1;
  if (wantHum) return prio === 2;
  if (wantBus) return prio === 3;
  return prio === 4;
}

export function isSubjectApplicableToStudent(subject, student) {
  if (!subject || !student) return false;
  const cls = String(student.class_name || '');
  const isSSC = ['9', '10', '৯', '১০'].includes(cls);

  // 1. Religion check (for all classes 6-10)
  const subCode = String(subject.code || '');
  const subName = String(subject.name_bn || '');
  const isReligionSub = ['111', '112', '113', '114'].includes(subCode) || subName.includes('ধর্ম');
  if (isReligionSub) {
    const stRel = (student.religion || 'ইসলাম').trim();
    if (stRel.includes('হিন্দু') || stRel.toLowerCase().includes('hindu')) {
      return subCode === '112' || subName.includes('হিন্দু');
    }
    if (stRel.includes('বৌদ্ধ') || stRel.toLowerCase().includes('buddhist')) {
      return subCode === '113' || subName.includes('বৌদ্ধ');
    }
    if (stRel.includes('খ্রিষ্টান') || stRel.toLowerCase().includes('christian')) {
      return subCode === '114' || subName.includes('খ্রিষ্টান');
    }
    // Default Islam
    return subCode === '111' || subName.includes('ইসলাম');
  }

  // 2. Classes 6-8 (JSC pattern: all other subjects are compulsory for everyone)
  if (!isSSC) return true;

  // 3. Classes 9-10 (SSC pattern)
  const subDept = (subject.department || 'আবশ্যিক').trim();
  if (subDept === 'আবশ্যিক' || subDept === 'সাধারণ' || subDept === 'all' || !subDept) {
    return true;
  }

  // If subject has a specific department, student MUST belong to that department
  return matchesStudentGroup(student, subDept);
}

const classes = ['6', '7', '8', '9', '10'];

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

export function ResultPanel({ sub, userRole }) {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('magra_user') || '{}');
    } catch { return {}; }
  }, []);
  const effectiveRole = userRole || currentUser?.role_name || currentUser?.role || 'super_admin';
  const isSubjectTeacherOrLibrarian = effectiveRole === 'teacher' || effectiveRole === 'librarian';

  const resolveInitialTab = (s) => {
    if (isSubjectTeacherOrLibrarian) return 'marks';
    if (!s) return 'academic_year';
    if (s === 'academic_year' || s === 'academic_years') return 'academic_year';
    if (s === 'exam_names' || s === 'exam_setup' || s === 'setup') return 'exam_names';
    if (s === 'subjects') return 'subjects';
    if (s === 'marks') return 'marks';
    if (s === 'grading') return 'grading';
    if (s === 'processing') return 'processing';
    if (s === 'merit') return 'merit';
    if (s === 'tabulation') return 'tabulation';
    if (s === 'marksheet' || s === 'progress') return 'marksheet';
    if (s === 'analysis') return 'analysis';
    if (s === 'promotion' || s === 'promotions' || s === 'ssc_form_fillup') return 'promotion';
    return 'academic_year';
  };

  const [tab, setTab] = useState(resolveInitialTab(sub));

  useEffect(() => {
    if (sub) {
      setTab(resolveInitialTab(sub));
    }
  }, [sub]);

  // Master Data
  const [academicYears, setAcademicYears] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');

  // Filters
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedExam, setSelectedExam] = useState('');
  const [className, setClassName] = useState('6');
  const [department, setDepartment] = useState('all'); // 'all' | 'বিজ্ঞান' | 'মানবিক' | 'ব্যবসায় শিক্ষা'

  // Mark Entry Sub-filters
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [marksRoster, setMarksRoster] = useState([]);

  // Processed Results (Merit, Tabulation, Marksheet)
  const [processedResults, setProcessedResults] = useState([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
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
    remarks: ''
  });

  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name_bn: '',
    name_en: '',
    class_name: '6',
    department: 'সাধারণ',
    full_marks: 100,
    written_max: 70,
    written_pass: 23,
    mcq_max: 30,
    mcq_pass: 10,
    practical_max: 0,
    practical_pass: 0,
    pass_marks: 33,
    is_optional: false
  });

  const showNotification = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4500);
  };

  // Load Master Core Data
  const loadMasterData = async () => {
    try {
      const years = await api('/academic-years');
      if (Array.isArray(years) && years.length) {
        setAcademicYears(years);
        const curr = years.find(y => y.is_current) || years[0];
        if (curr) {
          setSelectedYear(String(curr.year));
          setExamForm(prev => ({ ...prev, academic_year: String(curr.year) }));
        }
      }

      const examList = await api('/exams');
      if (Array.isArray(examList)) {
        const cleanList = examList.filter(e => {
          if (!e) return false;
          if (e.id === 'ex-annual-2026' || e.id === 'ex-test-2026') return false;
          const bn = e.name_bn || '';
          const en = e.name_en || '';
          const rem = e.remarks || '';
          if (bn.includes('নির্বাচনি পরীক্ষা ২০২৬') || bn.includes('নির্বাচনী পরীক্ষা ২০২৬') || en.includes('SSC Test Examination 2026') || rem.includes('১০ম শ্রেণির এসএসসি টেস্ট')) return false;
          if (bn.includes('বার্ষিক পরীক্ষা ২০২৬') || en.includes('Annual Examination 2026') || rem.includes('বার্ষিক চূড়ান্ত ও প্রমোশন পরীক্ষা')) return false;
          return true;
        });
        setExams(cleanList);
        if (cleanList.length && !selectedExam) {
          setSelectedExam(cleanList[0].id);
        }
      }

      const subList = await api('/subjects');
      if (Array.isArray(subList)) {
        setSubjects(subList);
      }
    } catch (e) {
      console.warn('Load master data warning:', e);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const isSSC = ['9', '10', '৯', '১০'].includes(String(className));

  // Current active academic year computed
  const currentAcademicYear = useMemo(() => {
    return academicYears.find(y => y.is_current) || academicYears[0] || null;
  }, [academicYears]);

  // Filtered exams for Exam Names setup tab
  const filteredExamsForSetup = useMemo(() => {
    const valid = exams.filter(e => {
      if (!e) return false;
      if (e.id === 'ex-annual-2026' || e.id === 'ex-test-2026') return false;
      const bn = e.name_bn || '';
      const en = e.name_en || '';
      const rem = e.remarks || '';
      if (bn.includes('নির্বাচনি পরীক্ষা ২০২৬') || bn.includes('নির্বাচনী পরীক্ষা ২০২৬') || en.includes('SSC Test Examination 2026') || rem.includes('১০ম শ্রেণির এসএসসি টেস্ট')) return false;
      if (bn.includes('বার্ষিক পরীক্ষা ২০২৬') || en.includes('Annual Examination 2026') || rem.includes('বার্ষিক চূড়ান্ত ও প্রমোশন পরীক্ষা')) return false;
      return true;
    });
    if (examFilterYear === 'all') return valid;
    return valid.filter(e => String(e.academic_year) === String(examFilterYear));
  }, [exams, examFilterYear]);

  // Filtered exams for toolbar
  const examsForSelectedYear = useMemo(() => {
    const valid = exams.filter(e => {
      if (!e) return false;
      if (e.id === 'ex-annual-2026' || e.id === 'ex-test-2026') return false;
      const bn = e.name_bn || '';
      const en = e.name_en || '';
      const rem = e.remarks || '';
      if (bn.includes('নির্বাচনি পরীক্ষা ২০২৬') || bn.includes('নির্বাচনী পরীক্ষা ২০২৬') || en.includes('SSC Test Examination 2026') || rem.includes('১০ম শ্রেণির এসএসসি টেস্ট')) return false;
      if (bn.includes('বার্ষিক পরীক্ষা ২০২৬') || en.includes('Annual Examination 2026') || rem.includes('বার্ষিক চূড়ান্ত ও প্রমোশন পরীক্ষা')) return false;
      return true;
    });
    if (!selectedYear || selectedYear === 'all') return valid;
    return valid.filter(e => String(e.academic_year) === String(selectedYear));
  }, [exams, selectedYear]);

  useEffect(() => {
    if (examsForSelectedYear.length > 0) {
      const match = examsForSelectedYear.find(e => String(e.id) === String(selectedExam));
      if (!match) setSelectedExam(examsForSelectedYear[0].id);
    } else {
      setSelectedExam('');
    }
  }, [selectedYear, examsForSelectedYear]);

  const selectedExamObj = useMemo(() => {
    return exams.find(e => String(e.id) === String(selectedExam));
  }, [exams, selectedExam]);

  // Subjects applicable to current Class & Department
  const subjectsForClass = useMemo(() => {
    return subjects.filter(s => {
      if (s.class_name && String(s.class_name) !== String(className)) return false;
      if (!isSSC) return true;
      // In Humanities & Business Studies: 4th subject is always 134 (Agriculture Studies). Exclude 151 (Home Science).
      if (String(s.code) === '151') return false;
      if (department === 'all' || department === 'সকল বিভাগ') return true;
      return s.department === 'আবশ্যিক' || matchesStudentGroup({ department: s.department }, department);
    });
  }, [subjects, className, department, isSSC]);

  // Auto-align selectedSubjectId for Mark Entry
  useEffect(() => {
    if (subjectsForClass.length > 0) {
      const match = subjectsForClass.find(s => String(s.id) === String(selectedSubjectId));
      if (!match) {
        const teacherSubj = String(currentUser?.subject || '').trim().toLowerCase();
        let teacherMatch = null;
        if (teacherSubj && isSubjectTeacherOrLibrarian) {
          const norm = (str) => String(str || '').toLowerCase().replace(/ী/g, 'ি').replace(/ূ/g, 'ু').replace(/ণ/g, 'ন').trim();
          const tNorm = norm(teacherSubj);
          teacherMatch = subjectsForClass.find(s => {
            const bn = String(s.name_bn || '').toLowerCase();
            const bnNorm = norm(bn);
            const en = String(s.name_en || '').toLowerCase();
            if (bnNorm.includes(tNorm) || tNorm.includes(bnNorm) || (en && tNorm.includes(en))) return true;
            if ((tNorm.includes('ইংরে') || tNorm.includes('english')) && (bnNorm.includes('ইংরে') || en.includes('english'))) return true;
            if (tNorm.includes('ভৌত') || tNorm.includes('বিজ্ঞান') || tNorm.includes('পদার্থ') || tNorm.includes('রসায়ন')) {
              if (bnNorm.includes('বিজ্ঞান') || bnNorm.includes('পদার্থ') || bnNorm.includes('রসায়ন')) return true;
            }
            if (tNorm.includes('ব্যবসায়') || tNorm.includes('হিসাব')) {
              if (bnNorm.includes('ব্যবসায়') || bnNorm.includes('হিসাব') || bnNorm.includes('উদ্যোগ')) return true;
            }
            return false;
          });
        }
        setSelectedSubjectId(teacherMatch ? teacherMatch.id : subjectsForClass[0].id);
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [subjectsForClass, currentUser, isSubjectTeacherOrLibrarian]);

  const currentSubjectObj = useMemo(() => {
    return subjects.find(s => String(s.id) === String(selectedSubjectId)) || subjectsForClass[0] || null;
  }, [subjects, selectedSubjectId, subjectsForClass]);

  // ==================== LOAD ROSTER FOR MARK ENTRY ====================
  const handleLoadRoster = async () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!currentSubjectObj) {
      showNotification('অনুগ্রহ করে বিষয় নির্বাচন করুন', 'error');
      return;
    }

    try {
      let url = '/students?class_name=' + className;
      if (isSSC && department && department !== 'all' && department !== 'সকল বিভাগ') {
        url += '&department=' + encodeURIComponent(department);
      }
      const allSt = await api(url);
      const studentList = Array.isArray(allSt) ? allSt : [];

      // 1. Filter students of the class who take this subject
      // AND match toolbar department filter if explicitly selected
      const filteredSt = studentList.filter(s => {
        // Must take this subject (respecting department and religion)
        if (!isSubjectApplicableToStudent(currentSubjectObj, s)) return false;

        // Toolbar department filter
        if (isSSC && department && department !== 'all' && department !== 'সকল বিভাগ') {
          if (!matchesStudentGroup(s, department)) return false;
        }

        return true;
      });

      // 2. Sort students using official student directory order (sortStudentsList)
      const sortedSt = sortStudentsList(filteredSt);
      setStudents(sortedSt);

      // Load existing marks for this exam & class
      const existingMarks = await api('/marks?exam_id=' + selectedExam + '&class_name=' + className);
      const marksMap = new Map();
      (Array.isArray(existingMarks) ? existingMarks : []).forEach(m => {
        marksMap.set(`${m.student_id}_${m.subject_id}`, m);
        marksMap.set(`${m.student_id}_${m.subject_code}`, m);
        if (m.student_code) {
          marksMap.set(`${m.student_code}_${m.subject_id}`, m);
          marksMap.set(`${m.student_code}_${m.subject_code}`, m);
        }
      });

      const roster = sortedSt.map(s => {
        const key = `${s.id}_${currentSubjectObj.id}`;
        const altKey = `${s.student_id}_${currentSubjectObj.id}`;
        const codeKey = `${s.id}_${currentSubjectObj.code}`;
        const altCodeKey = `${s.student_id}_${currentSubjectObj.code}`;
        const m = marksMap.get(key) || marksMap.get(altKey) || marksMap.get(codeKey) || marksMap.get(altCodeKey) || {};

        return {
          student_id: s.id,
          student_code: s.student_id || s.id || ('STU-' + s.roll_no),
          roll_no: s.roll_no !== undefined && s.roll_no !== null ? s.roll_no : '',
          name_bn: s.name_bn || s.name_en || '',
          department: s.department || s.group_name || s.group || 'সাধারণ',
          subject_id: currentSubjectObj.id,
          subject_code: currentSubjectObj.code,
          written: m.written !== null && m.written !== undefined ? m.written : '',
          mcq: m.mcq !== null && m.mcq !== undefined ? m.mcq : '',
          practical: m.practical !== null && m.practical !== undefined ? m.practical : '',
          absent: !!m.absent,
          remarks: m.remarks || ''
        };
      });

      setMarksRoster(roster);
      const deptLabel = isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? ` (${department} বিভাগ)` : '';
      showNotification(`শ্রেণি ${toBnDigits(className)}${deptLabel} এর ${toBnDigits(roster.length)} জন শিক্ষার্থীর নম্বর এন্ট্রি ঘর প্রস্তুত হয়েছে।`, 'success');
    } catch (err) {
      showNotification('শিক্ষার্থী তালিকা লোড ব্যর্থ: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    if (tab === 'marks' && selectedExam && currentSubjectObj) {
      handleLoadRoster();
    }
  }, [tab, selectedExam, className, selectedSubjectId, department]);

  // Filter marks roster strictly by selected Department for Classes 9 & 10
  const displayedMarksRoster = useMemo(() => {
    if (!isSSC || !department || department === 'all' || department === 'সকল বিভাগ') {
      return marksRoster;
    }
    return marksRoster.filter(r => matchesStudentGroup(r, department));
  }, [marksRoster, isSSC, department]);

  // Normalize Bangla or English digits and decimal points for direct fast typing
  const normalizeMarkDigits = (input) => {
    if (input === null || input === undefined) return '';
    let str = String(input);
    // Convert Bengali numerals ০-৯ to ASCII 0-9
    str = str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));
    // Keep only digits and decimal point
    str = str.replace(/[^0-9.]/g, '');
    // Allow at most one decimal point
    const parts = str.split('.');
    if (parts.length > 2) {
      str = parts[0] + '.' + parts.slice(1).join('');
    }
    return str;
  };

  const handleEditRosterMark = (studentKey, field, rawVal, maxVal) => {
    let val = rawVal;
    if (['written', 'mcq', 'practical'].includes(field)) {
      val = normalizeMarkDigits(rawVal);
      if (val !== '' && maxVal !== undefined && maxVal !== null && maxVal > 0) {
        const num = parseFloat(val);
        if (!isNaN(num) && num > maxVal) {
          // If exceeded maxVal, clamp to maxVal so marks cannot exceed maximum
          val = String(maxVal);
        }
      }
    }
    setMarksRoster(prev => {
      return prev.map((item, idx) => {
        const match = (typeof studentKey === 'number' && idx === studentKey) ||
                      (studentKey && (item.student_id === studentKey || item.student_code === studentKey));
        if (match) {
          return { ...item, [field]: val };
        }
        return item;
      });
    });
  };

  // Keyboard navigation for fast direct marks entry (Enter/Down to next student row, Up to prev row)
  const handleMarkKeyDown = (e, rowIdx, field) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const target = document.getElementById(`roster-mark-${field}-${rowIdx + 1}`);
      if (target) {
        target.focus();
        target.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const target = document.getElementById(`roster-mark-${field}-${rowIdx - 1}`);
      if (target) {
        target.focus();
        target.select();
      }
    }
  };

  // Save Marks Roster
  const handleSaveMarksRoster = async () => {
    if (!selectedExam) {
      showNotification('পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    const targetRoster = displayedMarksRoster.length ? displayedMarksRoster : marksRoster;
    if (!targetRoster.length) {
      showNotification('সংরক্ষণ করার মতো কোনো শিক্ষার্থীর নম্বর নেই', 'error');
      return;
    }

    try {
      const records = targetRoster.map(r => ({
        exam_id: selectedExam,
        class_name: className,
        student_id: r.student_id,
        subject_id: currentSubjectObj?.id || r.subject_id,
        subject_code: currentSubjectObj?.code || r.subject_code,
        written: r.written,
        mcq: r.mcq,
        practical: r.practical,
        absent: r.absent,
        remarks: r.remarks
      }));

      await api('/marks/bulk', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExam, records })
      });

      // Recalculate results immediately so Tabulation Sheet & Marksheets update
      await api('/results/process', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExam, class_name: className })
      });
      loadProcessedResults(true);

      const deptLabel = isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? ` (${department} বিভাগ)` : '';
      showNotification(`${currentSubjectObj?.name_bn || 'নির্বাচিত'} বিষয়ের${deptLabel} ${toBnDigits(records.length)} জন শিক্ষার্থীর নম্বর সফলভাবে সংরক্ষিত ও প্রসেস হয়েছে! ✓`, 'success');
    } catch (err) {
      showNotification('নম্বর সংরক্ষণ ব্যর্থ: ' + err.message, 'error');
    }
  };

  // Auto-fill Realistic Demo Marks for Quick Evaluation
  const handleQuickDemoMarks = () => {
    if (!currentSubjectObj) return;
    const wMax = currentSubjectObj.written_max || 0;
    const mMax = currentSubjectObj.mcq_max || 0;
    const pMax = currentSubjectObj.practical_max || 0;

    const targetRoster = displayedMarksRoster.length ? displayedMarksRoster : marksRoster;
    const targetIds = new Set(targetRoster.map(r => r.student_id || r.student_code));

    setMarksRoster(prev => prev.map((r, i) => {
      if (targetIds.size > 0 && !targetIds.has(r.student_id || r.student_code)) {
        return r;
      }
      const perf = (i % 7 === 6) ? 0.30 : (i % 5 === 0) ? 0.92 : (i % 3 === 0) ? 0.82 : 0.68;
      const w = wMax ? Math.round(wMax * perf) : 0;
      const m = mMax ? Math.round(mMax * perf) : 0;
      const p = pMax ? Math.round(pMax * (perf > 0.5 ? 0.95 : 0.7)) : 0;
      return {
        ...r,
        written: w,
        mcq: m,
        practical: p,
        absent: false
      };
    }));
    showNotification('নমুনা নম্বর সফলভাবে পূরণ করা হয়েছে। সংরক্ষণ করতে "💾 সব নম্বর সংরক্ষণ" বাটনে চাপুন।', 'info');
  };

  // ==================== CSV HELPER & IMPORT/EXPORT ====================
  const parseCsvText = (text) => {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], nx = text[i + 1];
      if (ch === '"') {
        if (quoted && nx === '"') { cell += '"'; i++; }
        else quoted = !quoted;
      } else if (ch === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && nx === '\n') i++;
        row.push(cell);
        if (row.some(v => v.trim() !== '')) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
    if (cell !== '' || row.length) {
      row.push(cell);
      if (row.some(v => v.trim() !== '')) rows.push(row);
    }
    return rows;
  };

  // CSV Download (Export Pre-filled / Blank Template)
  const handleDownloadMarksCsv = () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!currentSubjectObj) {
      showNotification('অনুগ্রহ করে বিষয় নির্বাচন করুন', 'error');
      return;
    }
    if (!marksRoster.length) {
      showNotification('ডাউনলোড করার মতো কোনো শিক্ষার্থী পাওয়া যায়নি। তালিকা রিফ্রেশ করুন।', 'error');
      return;
    }

    const escapeCsv = (str) => {
      const val = str === null || str === undefined ? '' : String(str);
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const wMax = currentSubjectObj.written_max || 0;
    const mMax = currentSubjectObj.mcq_max || 0;
    const pMax = currentSubjectObj.practical_max || 0;

    const headers = [
      'Roll',
      'Student_ID',
      'Student_Name',
      'Department',
      'Exam_Name',
      'Subject_Code',
      'Subject_Name',
      `Written_CQ_max_${wMax}`,
      `MCQ_max_${mMax}`,
      `Practical_max_${pMax}`,
      'Absent',
      'Remarks'
    ];

    const targetRoster = displayedMarksRoster.length ? displayedMarksRoster : marksRoster;
    const rows = targetRoster.map(r => [
      escapeCsv(r.roll_no !== undefined && r.roll_no !== null ? r.roll_no : ''),
      escapeCsv(r.student_code || r.student_id || ''),
      escapeCsv(r.name_bn || ''),
      escapeCsv(r.department || 'সাধারণ'),
      escapeCsv(selectedExamObj ? selectedExamObj.name_bn : ''),
      escapeCsv(currentSubjectObj.code || ''),
      escapeCsv(currentSubjectObj.name_bn || ''),
      escapeCsv(r.written !== null && r.written !== undefined ? r.written : ''),
      escapeCsv(r.mcq !== null && r.mcq !== undefined ? r.mcq : ''),
      escapeCsv(r.practical !== null && r.practical !== undefined ? r.practical : ''),
      escapeCsv(r.absent ? 'Yes' : 'No'),
      escapeCsv(r.remarks || '')
    ]);

    // UTF-8 with BOM (\uFEFF) ensures Bengali text is crystal clear in Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeSub = (currentSubjectObj.name_bn || 'Subject').replace(/[^\w\u0980-\u09FF]/g, '_');
    const safeExam = (selectedExamObj?.name_bn || 'Exam').replace(/[^\w\u0980-\u09FF]/g, '_');
    link.href = url;
    link.download = `Marks_Class_${className}_${safeSub}_Code${currentSubjectObj.code}_${safeExam}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`শ্রেণি ${toBnDigits(className)} এর "${currentSubjectObj.name_bn}" বিষয়ের মার্কস এন্ট্রি CSV সফলভাবে ডাউনলোড হয়েছে! ✓`, 'success');
  };

  // Master Tabulation Sheet CSV Download (Export All Applicable Subjects Matrix)
  const handleDownloadMasterCsv = () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!subjectsForClass.length) {
      showNotification('কোনো বিষয় পাওয়া যায়নি।', 'error');
      return;
    }

    const escapeCsv = (str) => {
      const val = str === null || str === undefined ? '' : String(str);
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const headers = [
      'Roll',
      'Student_ID',
      'Student_Name',
      'Department'
    ];

    subjectsForClass.forEach(s => {
      if (s.written_max > 0) headers.push(`[${s.code}] ${s.name_bn} (CQ max ${s.written_max})`);
      if (s.mcq_max > 0) headers.push(`[${s.code}] ${s.name_bn} (MCQ max ${s.mcq_max})`);
      if (s.practical_max > 0) headers.push(`[${s.code}] ${s.name_bn} (Prac max ${s.practical_max})`);
    });

    const studentList = filteredProcessedResults.length ? filteredProcessedResults : students;

    const rows = studentList.map(st => {
      const row = [
        escapeCsv(st.roll_no !== undefined ? st.roll_no : ''),
        escapeCsv(st.student_id || st.student_code || st.id || ''),
        escapeCsv(st.name_bn || st.name_en || ''),
        escapeCsv(st.department || 'সাধারণ')
      ];

      subjectsForClass.forEach(s => {
        const subResult = (st.subjects || []).find(sub => sub.code === s.code || sub.subject_id === s.id);
        if (s.written_max > 0) row.push(escapeCsv(subResult?.written !== undefined ? subResult.written : ''));
        if (s.mcq_max > 0) row.push(escapeCsv(subResult?.mcq !== undefined ? subResult.mcq : ''));
        if (s.practical_max > 0) row.push(escapeCsv(subResult?.practical !== undefined ? subResult.practical : ''));
      });

      return row;
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeExam = (selectedExamObj?.name_bn || 'Exam').replace(/[^\w\u0980-\u09FF]/g, '_');
    link.href = url;
    link.download = `Master_Tabulation_Class_${className}_${safeExam}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`শ্রেণি ${toBnDigits(className)} এর মাস্টার ট্যাবুলেশন শিট CSV সফলভাবে ডাউনলোড হয়েছে! ✓`, 'success');
  };

  // CSV Upload (Import Marks - Smart Multi-Subject & Single-Subject Parser)
  const handleUploadMarksCsv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }

    try {
      const text = await file.text();
      const matrix = parseCsvText(text);

      if (matrix.length < 2) {
        showNotification('CSV ফাইলে কোনো ডেটা পাওয়া যায়নি। সঠিক ফাইল নির্বাচন করুন।', 'error');
        return;
      }

      // Ensure students list is available
      let stList = students;
      if (!Array.isArray(stList) || !stList.length) {
        try {
          const fetchedSt = await api('/students?class_name=' + className);
          if (Array.isArray(fetchedSt) && fetchedSt.length) {
            stList = fetchedSt;
            setStudents(stList);
          }
        } catch (_) {}
      }

      const rawHeaders = matrix[0].map(h => (h || '').trim());
      const cleanHeaders = rawHeaders.map(h => h.toLowerCase().replace(/[\s_\-]+/g, ''));

      const findHeaderIdx = (aliases) => {
        return cleanHeaders.findIndex(h => aliases.some(alias => h.includes(alias)));
      };

      const rollIdx = findHeaderIdx(['roll', 'রোল', 'ক্লাসরোল', 'rollno', 'roll_no']);
      const idIdx = findHeaderIdx(['studentid', 'student_id', 'আইডি', 'স্টুডেন্টআইডি', 'id']);
      const deptIdx = findHeaderIdx(['department', 'dept', 'বিভাগ', 'শাখা', 'গ্রুপ', 'group']);
      const absentIdx = findHeaderIdx(['absent', 'অনুপস্থিত', 'abs']);
      const remarksIdx = findHeaderIdx(['remarks', 'মন্তব্য', 'remark']);

      if (rollIdx === -1 && idIdx === -1) {
        showNotification('CSV ফাইলে Roll বা Student ID কলাম পাওয়া যায়নি। অনুগ্রহ করে ডাউনলোড করা টেমপ্লেট ব্যবহার করুন।', 'error');
        return;
      }

      // Filter subjects for current class
      const classSubjects = subjects.filter(s => !s.class_name || String(s.class_name) === String(className));

      // Build student lookup map
      const studentLookup = new Map();
      (stList || []).forEach(st => {
        if (st.id) studentLookup.set(`id:${st.id.toLowerCase()}`, st);
        if (st.student_id) studentLookup.set(`id:${st.student_id.toLowerCase()}`, st);
        if (st.student_code) studentLookup.set(`id:${st.student_code.toLowerCase()}`, st);
        if (st.roll_no !== undefined && st.roll_no !== null) {
          studentLookup.set(`roll:${st.roll_no}`, st);
          const dept = (st.department || st.group_name || '').toLowerCase();
          if (dept) studentLookup.set(`dept_roll:${dept}_${st.roll_no}`, st);
          const deptPrio = getStudentGroupPriority({ department: st.department || st.group_name });
          if (deptPrio < 4) studentLookup.set(`prio_roll:${deptPrio}_${st.roll_no}`, st);
        }
      });

      // ==================== MODE 1: MULTI-SUBJECT COLUMN MATRIX ====================
      // Check if header row contains multiple subject columns (e.g. Master Tabulation CSV)
      const subjectColumnsMap = new Map(); // subject_id -> { sub, writtenIdx, mcqIdx, practicalIdx }

      classSubjects.forEach(sub => {
        const code = String(sub.code);
        const subCleanName = (sub.name_bn || '').toLowerCase().replace(/[\s_\-]+/g, '');

        let wCol = -1, mCol = -1, pCol = -1;

        cleanHeaders.forEach((h, colIdx) => {
          const hasSubRef = h.includes(code) || (subCleanName.length >= 4 && h.includes(subCleanName));
          if (!hasSubRef) return;

          const isPrac = h.includes('practical') || h.includes('prac') || h.includes('ব্যবহারিক');
          const isMcq = h.includes('mcq') || h.includes('এমসিকিউ') || h.includes('বহুনির্বাচনি') || h.includes('বহুনির্বাচনী') || h.includes('নৈর্ব্যক্তিক');
          const isWritten = h.includes('cq') || h.includes('written') || h.includes('লিখিত') || h.includes('সৃজনশীল') || h.includes('রচনামূলক') || h.includes('তত্ত্বীয়');

          if (isPrac) {
            pCol = colIdx;
          } else if (isMcq) {
            mCol = colIdx;
          } else if (isWritten) {
            wCol = colIdx;
          } else {
            if (sub.mcq_max === 0 && sub.practical_max === 0) {
              wCol = colIdx;
            } else if (wCol === -1) {
              wCol = colIdx;
            }
          }
        });

        if (wCol !== -1 || mCol !== -1 || pCol !== -1) {
          subjectColumnsMap.set(sub.id, {
            sub,
            writtenIdx: wCol,
            mcqIdx: mCol,
            practicalIdx: pCol
          });
        }
      });

      let recordsToSave = [];
      const matchedStudentIds = new Set();
      let detectedSubjectNames = [];

      if (subjectColumnsMap.size >= 2) {
        // Multi-Subject CSV Matrix
        detectedSubjectNames = Array.from(subjectColumnsMap.values()).map(x => x.sub.name_bn);

        for (let r = 1; r < matrix.length; r++) {
          const row = matrix[r];
          if (!row || !row.length || row.every(c => !c.trim())) continue;

          const rollVal = rollIdx !== -1 && row[rollIdx] ? normalizeMarkDigits(row[rollIdx].trim()) : '';
          const idVal = idIdx !== -1 && row[idIdx] ? row[idIdx].trim().toLowerCase() : '';
          const deptVal = deptIdx !== -1 && row[deptIdx] ? row[deptIdx].trim().toLowerCase() : '';
          const deptPrio = deptVal ? getStudentGroupPriority({ department: deptVal }) : 99;

          const matchedStudent = (idVal && studentLookup.get(`id:${idVal}`)) ||
                                 (rollVal && deptVal && studentLookup.get(`dept_roll:${deptVal}_${rollVal}`)) ||
                                 (rollVal && deptPrio < 4 && studentLookup.get(`prio_roll:${deptPrio}_${rollVal}`)) ||
                                 (rollVal && studentLookup.get(`roll:${rollVal}`));

          if (!matchedStudent) continue;
          matchedStudentIds.add(matchedStudent.id);

          const absentRaw = absentIdx !== -1 && row[absentIdx] ? row[absentIdx].trim().toLowerCase() : '';
          const isAbsent = ['yes', 'হ্যাঁ', '1', 'true', 'abs', 'absent'].includes(absentRaw);
          const remarks = remarksIdx !== -1 && row[remarksIdx] ? row[remarksIdx].trim() : '';

          subjectColumnsMap.forEach(({ sub, writtenIdx: wIdx, mcqIdx: mIdx, practicalIdx: pIdx }) => {
            let w = wIdx !== -1 && row[wIdx] !== undefined ? normalizeMarkDigits(row[wIdx]) : '';
            let m = mIdx !== -1 && row[mIdx] !== undefined ? normalizeMarkDigits(row[mIdx]) : '';
            let p = pIdx !== -1 && row[pIdx] !== undefined ? normalizeMarkDigits(row[pIdx]) : '';

            // Validation against maximums
            if (w !== '' && sub.written_max > 0 && parseFloat(w) > sub.written_max) w = String(sub.written_max);
            if (m !== '' && sub.mcq_max > 0 && parseFloat(m) > sub.mcq_max) m = String(sub.mcq_max);
            if (p !== '' && sub.practical_max > 0 && parseFloat(p) > sub.practical_max) p = String(sub.practical_max);

            if (w !== '' || m !== '' || p !== '' || isAbsent) {
              recordsToSave.push({
                exam_id: selectedExam,
                class_name: className,
                student_id: matchedStudent.id,
                subject_id: sub.id,
                subject_code: sub.code,
                written: w,
                mcq: m,
                practical: p,
                absent: isAbsent,
                remarks
              });
            }
          });
        }
      } else {
        // ==================== MODE 2: ROW-WISE OR SINGLE-SUBJECT CSV ====================
        const subjectCodeIdx = findHeaderIdx(['subjectcode', 'subject_code', 'বিষয়কোড', 'কোড', 'code', 'subcode']);
        const subjectNameIdx = findHeaderIdx(['subjectname', 'subject_name', 'বিষয়', 'বিষয়েরনাম', 'subject']);

        // Comprehensive alias detection for Bangladeshi mark sheets
        const writtenIdx = findHeaderIdx([
          'writtencq', 'written', 'cq', 'লিখিত', 'সৃজনশীল', 'রচনামূলক', 'বর্ণনামূলক', 'তত্ত্বীয়', 'theory', 'sub1', 'mark', 'marks', 'নম্বর', 'প্রাপ্তনম্বর', 'প্রাপ্ত_নম্বর', 'obttotal', 'total'
        ]);
        const mcqIdx = findHeaderIdx([
          'mcq', 'এমসিকিউ', 'বহুনির্বাচনি', 'বহুনির্বাচনী', 'নৈর্ব্যক্তিক', 'নৈর্ব্যক্তিক_নম্বর', 'objective'
        ]);
        const practicalIdx = findHeaderIdx(['practical', 'ব্যবহারিক', 'ব্যবহারিক_নম্বর', 'prac']);

        let targetSubject = currentSubjectObj;
        const rowSubjectsSet = new Set();

        for (let r = 1; r < matrix.length; r++) {
          const row = matrix[r];
          if (!row || !row.length || row.every(c => !c.trim())) continue;

          const rollVal = rollIdx !== -1 && row[rollIdx] ? normalizeMarkDigits(row[rollIdx].trim()) : '';
          const idVal = idIdx !== -1 && row[idIdx] ? row[idIdx].trim().toLowerCase() : '';
          const deptVal = deptIdx !== -1 && row[deptIdx] ? row[deptIdx].trim().toLowerCase() : '';
          const deptPrio = deptVal ? getStudentGroupPriority({ department: deptVal }) : 99;

          const matchedStudent = (idVal && studentLookup.get(`id:${idVal}`)) ||
                                 (rollVal && deptVal && studentLookup.get(`dept_roll:${deptVal}_${rollVal}`)) ||
                                 (rollVal && deptPrio < 4 && studentLookup.get(`prio_roll:${deptPrio}_${rollVal}`)) ||
                                 (rollVal && studentLookup.get(`roll:${rollVal}`));

          if (!matchedStudent) continue;
          matchedStudentIds.add(matchedStudent.id);

          // Detect row subject if subject column exists
          let rowSub = targetSubject;
          const rowCode = subjectCodeIdx !== -1 && row[subjectCodeIdx] ? row[subjectCodeIdx].trim() : '';
          const rowSubName = subjectNameIdx !== -1 && row[subjectNameIdx] ? row[subjectNameIdx].trim() : '';

          if (rowCode) {
            const found = classSubjects.find(s => String(s.code) === rowCode);
            if (found) rowSub = found;
          } else if (rowSubName) {
            const found = classSubjects.find(s => s.name_bn && (s.name_bn.includes(rowSubName) || rowSubName.includes(s.name_bn)));
            if (found) rowSub = found;
          }

          if (!rowSub) rowSub = currentSubjectObj;
          if (!rowSub) continue;

          rowSubjectsSet.add(rowSub.name_bn);

          const absentRaw = absentIdx !== -1 && row[absentIdx] ? row[absentIdx].trim().toLowerCase() : '';
          const isAbsent = ['yes', 'হ্যাঁ', '1', 'true', 'abs', 'absent'].includes(absentRaw);
          const remarks = remarksIdx !== -1 && row[remarksIdx] ? row[remarksIdx].trim() : '';

          let w = writtenIdx !== -1 && row[writtenIdx] !== undefined ? normalizeMarkDigits(row[writtenIdx]) : '';
          let m = mcqIdx !== -1 && row[mcqIdx] !== undefined ? normalizeMarkDigits(row[mcqIdx]) : '';
          let p = practicalIdx !== -1 && row[practicalIdx] !== undefined ? normalizeMarkDigits(row[practicalIdx]) : '';

          const wMax = Number(rowSub.written_max) || 0;
          const mMax = Number(rowSub.mcq_max) || 0;
          const pMax = Number(rowSub.practical_max) || 0;

          if (w !== '' && wMax > 0 && parseFloat(w) > wMax) w = String(wMax);
          if (m !== '' && mMax > 0 && parseFloat(m) > mMax) m = String(mMax);
          if (p !== '' && pMax > 0 && parseFloat(p) > pMax) p = String(pMax);

          recordsToSave.push({
            exam_id: selectedExam,
            class_name: className,
            student_id: matchedStudent.id,
            subject_id: rowSub.id,
            subject_code: rowSub.code,
            written: w,
            mcq: m,
            practical: p,
            absent: isAbsent,
            remarks
          });
        }

        detectedSubjectNames = Array.from(rowSubjectsSet);
        if (rowSubjectsSet.size === 1) {
          const singleSub = classSubjects.find(s => s.name_bn === detectedSubjectNames[0]);
          if (singleSub && singleSub.id !== selectedSubjectId) {
            setSelectedSubjectId(singleSub.id);
          }
        }
      }

      if (!recordsToSave.length || matchedStudentIds.size === 0) {
        showNotification('CSV ফাইলের রোলের সাথে বর্তমান শ্রেণির কোনো শিক্ষার্থীর রোল বা আইডি মেলেনি। সঠিক শ্রেণির CSV আপলোড করুন।', 'error');
        return;
      }

      // 1. Save records to backend store
      await api('/marks/bulk', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExam, records: recordsToSave })
      });

      // 2. Immediately recalculate results via Dhaka Board Exam Engine
      const processRes = await api('/results/process', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExam, class_name: className })
      });

      if (Array.isArray(processRes.summary)) {
        setProcessedResults(processRes.summary);
      }

      // 3. Refresh processed results state and marks roster
      await loadProcessedResults(true);
      if (tab === 'marks') {
        handleLoadRoster();
      }

      const subjectsInfo = detectedSubjectNames.length > 1
        ? `${toBnDigits(detectedSubjectNames.length)}টি বিষয় (${detectedSubjectNames.slice(0, 3).join(', ')}${detectedSubjectNames.length > 3 ? '...' : ''})`
        : `"${detectedSubjectNames[0] || currentSubjectObj?.name_bn || 'বিষয়'}"`;

      showNotification(`🎉 অভিনন্দন! CSV ফাইল থেকে ${subjectsInfo} এর ${toBnDigits(matchedStudentIds.size)} জন শিক্ষার্থীর নম্বর সফলভাবে ইমপোর্ট ও মাস্টার শিটে প্রসেস করা হয়েছে! ✓`, 'success');
    } catch (err) {
      console.error('CSV import error:', err);
      showNotification('CSV ফাইল আপলোড ব্যর্থ: ' + err.message, 'error');
    }
  };

  // ==================== PROCESS RESULTS ====================
  const handleRunResultProcessing = async () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }

    try {
      const res = await api('/results/process', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExam, class_name: className })
      });

      const processed = Array.isArray(res.summary) ? res.summary : [];
      setProcessedResults(processed);

      // Refresh analysis
      const ana = await api(`/results/analysis?exam_id=${selectedExam}&class_name=${className}&force=1`);
      setAnalysis(ana);

      showNotification(`ফলাফল প্রসেসিং সফল! শ্রেণি ${toBnDigits(className)} এর ${toBnDigits(res.count)} জন শিক্ষার্থীর গ্রেড ও মেধা তালিকা প্রস্তুত।`, 'success');
    } catch (err) {
      showNotification('ফলাফল প্রসেসিং ব্যর্থ: ' + err.message, 'error');
    }
  };

  // Load Processed Results for Merit, Tabulation, Marksheet (forceRecompute = true forces re-evaluation)
  const loadProcessedResults = async (forceRecompute = false) => {
    if (!selectedExam) return;
    try {
      if (forceRecompute) {
        const p = await api('/results/process', {
          method: 'POST',
          body: JSON.stringify({ exam_id: selectedExam, class_name: className })
        });
        if (Array.isArray(p.summary)) setProcessedResults(p.summary);
      } else {
        const res = await api(`/results/summary?exam_id=${selectedExam}&class_name=${className}&force=1`);
        if (Array.isArray(res) && res.length) {
          setProcessedResults(res);
        } else {
          const p = await api('/results/process', {
            method: 'POST',
            body: JSON.stringify({ exam_id: selectedExam, class_name: className })
          });
          if (Array.isArray(p.summary)) setProcessedResults(p.summary);
        }
      }

      const ana = await api(`/results/analysis?exam_id=${selectedExam}&class_name=${className}&force=1`);
      setAnalysis(ana);
    } catch (e) {
      console.warn('Load processed results warning:', e);
    }
  };

  useEffect(() => {
    if (['merit', 'tabulation', 'marksheet', 'analysis', 'processing'].includes(tab) && selectedExam) {
      loadProcessedResults();
    }
  }, [tab, selectedExam, className]);

  // Filtered processed results by Department (Group) for 9-10
  const filteredProcessedResults = useMemo(() => {
    if (!isSSC || department === 'all' || department === 'সকল বিভাগ') return processedResults;
    return processedResults.filter(r => matchesStudentGroup(r.student || r, department));
  }, [processedResults, isSSC, department]);

  const currentStudentResult = useMemo(() => {
    if (!filteredProcessedResults.length) return null;
    const safeIdx = Math.max(0, Math.min(selectedStudentIndex, filteredProcessedResults.length - 1));
    return filteredProcessedResults[safeIdx];
  }, [filteredProcessedResults, selectedStudentIndex]);

  const standardEnNames = {
    '101': 'BANGLA-I',
    '102': 'BANGLA-II',
    '107': 'ENGLISH-I',
    '108': 'ENGLISH-II',
    '109': 'METHMATICS',
    '111': 'ISLAM RELIGION AND MORAL EDUCATION',
    '112': 'HINDU RELIGION AND MORAL EDUCATION',
    '113': 'BUDDHIST RELIGION AND MORAL EDUCATION',
    '114': 'CHRISTIAN RELIGION AND MORAL EDUCATION',
    '154': 'INFORMATION AND COMMUNICATION TECHNOLOGY',
    '136': 'PHYSICS',
    '137': 'CHEMISTRY',
    '138': 'BIOLOGY',
    '150': 'BANGLADESH AND GLOBAL STUDIES',
    '126': 'HIGHER METHMATICS',
    '134': 'AGRICULTURE STUDIES',
    '127': 'GENERAL SCIENCE',
    '146': 'ACCOUNTING',
    '147': 'FINANCE AND BANKING',
    '152': 'BUSINESS ENTREPRENEURSHIP',
    '140': 'GEOGRAPHY AND ENVIRONMENT',
    '141': 'ECONOMICS',
    '142': 'CIVICS AND CITIZENSHIP',
    '143': 'HISTORY OF BANGLADESH AND WORLD CIVILIZATION'
  };

  const getSubjectEnName = (sub) => {
    if (!sub) return '';
    const code = String(sub.code || '');
    if (standardEnNames[code]) return standardEnNames[code];
    if (sub.name_en && sub.name_en.trim()) return sub.name_en.trim().toUpperCase();
    return sub.name_bn || '';
  };

  const transcriptSubjects = useMemo(() => {
    if (!currentStudentResult?.subjects) return [];
    let subs = [...currentStudentResult.subjects];

    // Ensure only 1 4th subject appears on transcript:
    // For Science: either 126 or 134 (never both)
    const has126 = subs.some(s => String(s.code) === '126');
    const has134 = subs.some(s => String(s.code) === '134');
    if (has126 && has134) {
      const sub126 = subs.find(s => String(s.code) === '126');
      const sub134 = subs.find(s => String(s.code) === '134');
      const st = currentStudentResult.student || currentStudentResult;
      const explicit = (st.fourth_subject || st.fourth_subject_code || st.optional_subject || '').toString().toLowerCase();

      let keepCode = '126';
      if (explicit.includes('134') || explicit.includes('কৃষি')) {
        keepCode = '134';
      } else if (explicit.includes('126') || explicit.includes('উচ্চতর') || explicit.includes('গণিত')) {
        keepCode = '126';
      } else {
        const m126 = !sub126?.absent && (Number(sub126?.total) > 0 || Number(sub126?.written) > 0 || Number(sub126?.mcq) > 0 || Number(sub126?.practical) > 0);
        const m134 = !sub134?.absent && (Number(sub134?.total) > 0 || Number(sub134?.written) > 0 || Number(sub134?.mcq) > 0 || Number(sub134?.practical) > 0);
        if (m134 && !m126) keepCode = '134';
        else keepCode = '126';
      }
      subs = subs.filter(s => {
        const code = String(s.code);
        if (code === '126' || code === '134') return code === keepCode;
        return true;
      });
    }

    // For Humanities & Business Studies: 4th subject is always 134 (Agriculture Studies). Exclude 151 (Home Science).
    const stGroup = (currentStudentResult.department || currentStudentResult.student?.department || '').toLowerCase();
    if (stGroup.includes('মানবিক') || stGroup.includes('ব্যবসায়') || stGroup.includes('commerce') || stGroup.includes('business')) {
      subs = subs.filter(s => String(s.code) !== '151');
    }

    return subs.sort((a, b) => {
      if (a.is_optional && !b.is_optional) return 1;
      if (!a.is_optional && b.is_optional) return -1;
      return (Number(a.code) || 999) - (Number(b.code) || 999);
    });
  }, [currentStudentResult]);

  const hasBanglaPair = isSSC && 
    transcriptSubjects.some(s => String(s.code) === '101') && 
    transcriptSubjects.some(s => String(s.code) === '102');

  const hasEnglishPair = isSSC && 
    transcriptSubjects.some(s => String(s.code) === '107') && 
    transcriptSubjects.some(s => String(s.code) === '108');

  const sub101 = transcriptSubjects.find(s => String(s.code) === '101');
  const sub102 = transcriptSubjects.find(s => String(s.code) === '102');
  const banglaCombinedTotal = ((sub101 && !sub101.absent) ? Number(sub101.total || 0) : 0) + ((sub102 && !sub102.absent) ? Number(sub102.total || 0) : 0);

  const sub107 = transcriptSubjects.find(s => String(s.code) === '107');
  const sub108 = transcriptSubjects.find(s => String(s.code) === '108');
  const englishCombinedTotal = ((sub107 && !sub107.absent) ? Number(sub107.total || 0) : 0) + ((sub108 && !sub108.absent) ? Number(sub108.total || 0) : 0);

  const handlePrintMarksheet = () => {
    if (!currentStudentResult) {
      showNotification('প্রিন্ট করার জন্য কোনো শিক্ষার্থী নির্বাচিত নেই।', 'error');
      return;
    }
    const marksheetEl = document.getElementById('official-academic-transcript');
    if (!marksheetEl) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=950,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const contentHtml = marksheetEl.outerHTML;

    printWin.document.write(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>Academic Transcript — ${currentStudentResult.name_bn || currentStudentResult.student_id}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; font-family: 'Noto Sans Bengali', system-ui, -apple-system, sans-serif; background: #fff; color: #000; }
    .official-marksheet-wrapper { width: 100%; max-width: 190mm; margin: 0 auto; background: #fff; border: 1.5px solid #000; border-radius: 4px; padding: 8mm 10mm; page-break-inside: avoid; }
    .transcript-official-header { text-align: center; margin-bottom: 14px; }
    .transcript-school-name { margin: 0 0 3px 0; font-size: 22px; color: #0b8050; font-weight: 800; letter-spacing: 0.3px; }
    .transcript-school-line { margin: 2px 0; font-size: 12.5px; color: #1e293b; font-weight: 500; }
    .transcript-school-eiin { margin: 2px 0 0 0; font-size: 12.5px; color: #1e293b; font-weight: 600; }
    .marksheet-exam-title-badge { text-align: center; margin: 10px 0 12px 0; }
    .marksheet-exam-title-badge span { display: inline-block; background: #1e293b; color: #fff; padding: 5px 24px; border-radius: 9999px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
    .marksheet-top-info-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 12px; margin-bottom: 12px; }
    .marksheet-student-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; font-size: 12px; line-height: 1.8; color: #0f172a; }
    .marksheet-student-card .info-row { margin: 1px 0; }
    .marksheet-subjects-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11.5px; border: 1px solid #000; }
    .marksheet-subjects-table th, .marksheet-subjects-table td { border: 1px solid #000; padding: 5px 6px; text-align: center; }
    .marksheet-subjects-table th { background: #fff; color: #000; font-weight: 700; font-size: 11.5px; }
    .marksheet-subjects-table td.text-left { text-align: left; padding-left: 8px; font-weight: 600; }
    .transcript-grade-cell { vertical-align: middle; text-align: center; background: #fff; }
    .grade-letter { font-size: 13.5px; font-weight: 800; color: #0b8050; line-height: 1.2; }
    .grade-gp { font-size: 10.5px; font-weight: 700; color: #000; margin-top: 1px; }
    .transcript-summary-box { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 6px; margin-top: 10px; text-align: center; }
    .transcript-summary-box .summary-label { font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 2px; }
    .transcript-summary-box .summary-val { font-size: 15px; font-weight: 800; color: #000; }
    .transcript-summary-box .summary-val.green-text { color: #0b8050; }
    .transcript-summary-box .summary-val.status-text { font-size: 16px; }
    .transcript-signatures-zone { display: flex; justify-content: space-between; margin-top: 36px; font-size: 11.5px; color: #334155; text-align: center; }
    .transcript-signatures-zone .sig-column { min-width: 150px; }
    .transcript-signatures-zone .sig-dots { letter-spacing: 1px; color: #94a3b8; margin-bottom: 5px; }
    .transcript-signatures-zone .sig-title { font-weight: 600; color: #1e293b; }
    .transcript-footer-line { margin-top: 14px; display: flex; justify-content: space-between; font-size: 9.5px; color: #64748b; border-top: 1px dotted #cbd5e1; padding-top: 5px; }
  </style>
</head>
<body>
  ${contentHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`);
    printWin.document.close();
  };

  // Reset/Load Dhaka Board Official Subjects
  const handleResetDhakaBoardSubjects = async () => {
    if (!window.confirm('আপনি কি ঢাকা শিক্ষা বোর্ডের প্রমিত বিষয় ও নম্বর বণ্টন পুনরায় লোড করতে চান?')) return;
    try {
      await api('/subjects/reset-dhaka-board', { method: 'POST' });
      const subs = await api('/subjects');
      setSubjects(subs);
      showNotification('ঢাকা শিক্ষা বোর্ডের প্রমিত বিষয় ও নম্বর বণ্টন সফলভাবে লোড হয়েছে! ✓', 'success');
    } catch (e) {
      showNotification('সিলেবাস লোড ব্যর্থ: ' + e.message, 'error');
    }
  };

  // ==================== 1. ACADEMIC YEAR ACTIONS ====================
  const handleSaveAcademicYear = async (e) => {
    e.preventDefault();
    if (!yearForm.year || !yearForm.year.trim()) {
      showNotification('শিক্ষাবর্ষ উল্লেখ করুন (যেমন: 2026)', 'error');
      return;
    }
    try {
      if (editingYearId) {
        await api(`/academic-years/${editingYearId}`, { method: 'PUT', body: JSON.stringify(yearForm) });
        showNotification('শিক্ষাবর্ষ সফলভাবে আপডেট করা হয়েছে।', 'success');
      } else {
        await api('/academic-years', { method: 'POST', body: JSON.stringify(yearForm) });
        showNotification('নতুন শিক্ষাবর্ষ সফলভাবে সংরক্ষণ করা হয়েছে।', 'success');
      }
      setEditingYearId(null);
      setYearForm({ year: '', title_bn: '', is_current: false, status: 'active', remarks: '' });
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'শিক্ষাবর্ষ সংরক্ষণ ব্যর্থ', 'error');
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
  };

  const handleDeleteAcademicYear = async (ay) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${ay.title_bn || ay.year}" শিক্ষাবর্ষটি মুছে ফেলতে চান?`)) return;
    try {
      await api(`/academic-years/${ay.id || ay.year}`, { method: 'DELETE' });
      showNotification('শিক্ষাবর্ষটি সফলভাবে মুছে ফেলা হয়েছে।', 'success');
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'শিক্ষাবর্ষ মুছতে ব্যর্থ', 'error');
    }
  };

  const handleMakeActiveYear = async (ay) => {
    try {
      await api(`/academic-years/${ay.id || ay.year}`, {
        method: 'PUT',
        body: JSON.stringify({ ...ay, is_current: true, status: 'active' })
      });
      showNotification(`"${ay.title_bn || ay.year}" শিক্ষাবর্ষকে সক্রিয় শিক্ষাবর্ষ হিসেবে নির্ধারণ করা হয়েছে।`, 'success');
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'সক্রিয়করণ ব্যর্থ', 'error');
    }
  };

  // ==================== 2. EXAM NAMES ACTIONS ====================
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.name_bn || !examForm.name_bn.trim()) {
      showNotification('পরীক্ষার নাম (বাংলা) আবশ্যক', 'error');
      return;
    }
    try {
      if (editingExamId) {
        await api(`/exams/${editingExamId}`, { method: 'PUT', body: JSON.stringify(examForm) });
        showNotification('পরীক্ষার তথ্য সফলভাবে আপডেট হয়েছে।', 'success');
      } else {
        await api('/exams', { method: 'POST', body: JSON.stringify(examForm) });
        showNotification('নতুন পরীক্ষা সফলভাবে তৈরি হয়েছে।', 'success');
      }
      setEditingExamId(null);
      setExamForm({ academic_year: selectedYear, name_bn: '', name_en: '', exam_type: 'সাময়িক পরীক্ষা', status: 'active', remarks: '' });
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'পরীক্ষা সংরক্ষণ ব্যর্থ', 'error');
    }
  };

  const handleEditExam = (ex) => {
    setEditingExamId(ex.id);
    setExamForm({
      academic_year: String(ex.academic_year || selectedYear),
      name_bn: ex.name_bn || '',
      name_en: ex.name_en || '',
      exam_type: ex.exam_type || 'সাময়িক পরীক্ষা',
      status: ex.status || 'active',
      remarks: ex.remarks || ''
    });
  };

  const handleDeleteExam = async (ex) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${ex.name_bn}" পরীক্ষাটি মুছে ফেলতে চান?`)) return;
    try {
      await api(`/exams/${ex.id}`, { method: 'DELETE' });
      showNotification('পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে।', 'success');
      loadMasterData();
    } catch (err) {
      showNotification(err.message || 'পরীক্ষা মুছতে ব্যর্থ', 'error');
    }
  };

  const jumpToMarkEntry = (exId) => {
    setSelectedExam(exId);
    setTab('marks');
  };

  return (
    <div className="result-panel exam-modern-wrapper">
      {/* ================= TOP KPI BANNER ================= */}
      <div className="exam-kpi-banner">
        <div className="exam-kpi-card highlight-card">
          <div className="kpi-icon">🗓️</div>
          <div className="kpi-body">
            <span className="kpi-label">বর্তমান শিক্ষাবর্ষ</span>
            <div className="kpi-val">{currentAcademicYear ? currentAcademicYear.title_bn : '২০২৬ শিক্ষাবর্ষ'}</div>
            <span className="kpi-badge badge-active">সক্রিয় চলমান সেশন</span>
          </div>
        </div>

        <div className="exam-kpi-card">
          <div className="kpi-icon">📝</div>
          <div className="kpi-body">
            <span className="kpi-label">নির্ধারিত পরীক্ষা</span>
            <div className="kpi-val">{toBnDigits(exams.length)} টি</div>
            <span className="kpi-sub">{toBnDigits(examsForSelectedYear.length)}টি ({toBnDigits(selectedYear)} শিক্ষাবর্ষ)</span>
          </div>
        </div>

        <div className="exam-kpi-card">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-body">
            <span className="kpi-label">চলমান পরীক্ষা</span>
            <div className="kpi-val exam-name-truncate">{selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা নির্বাচন করুন'}</div>
            <span className="kpi-sub">{selectedExamObj?.exam_type || 'অভ্যন্তরীণ পরীক্ষা'}</span>
          </div>
        </div>

        <div className="exam-kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-body">
            <span className="kpi-label">মডেল কাঠামো</span>
            <div className="kpi-val">{isSSC ? 'এসএসসি মডেল' : 'জেএসসি মডেল'}</div>
            <span className="kpi-badge badge-pub">{isSSC ? '৯ম-১০ম (বিভাগভিত্তিক)' : '৬ষ্ঠ-৮ম (প্রমিত)'}</span>
          </div>
        </div>
      </div>

      {/* ================= NOTIFICATION TOAST ================= */}
      {msg && (
        <div className={`exam-alert-box alert-${msgType}`}>
          <span className="alert-icon">{msgType === 'success' ? '✓' : msgType === 'error' ? '⚠' : 'ℹ'}</span>
          <span className="alert-text">{msg}</span>
        </div>
      )}

      {/* ================= MODERN TAB NAVIGATION ================= */}
      <div className="exam-tab-bar">
        {(() => {
          const allTabs = [
            ['academic_year', '🗓️ ১. একাডেমিক ইয়ার'],
            ['exam_names', '📝 ২. পরীক্ষার নাম'],
            ['subjects', '📚 ৩. বিষয় ও নম্বর বণ্টন'],
            ['marks', '✍️ ৪. বিষয়ভিত্তিক মার্ক এন্ট্রি'],
            ['grading', '🎯 ৫. গ্রেডিং পলিসি'],
            ['processing', '⚙️ ৬. ফলাফল প্রসেসিং'],
            ['merit', '🏆 ৭. মেধা তালিকা'],
            ['tabulation', '📋 ৮. ট্যাবুলেশন শিট'],
            ['marksheet', '📄 ৯. মার্কশিট ও প্রগ্রেস'],
            ['analysis', '📊 ১০. ফলাফল বিশ্লেষণ'],
            ['promotion', '🎓 ১১. শিক্ষার্থী প্রমোশন']
          ];
          const availableTabs = isSubjectTeacherOrLibrarian
            ? allTabs.filter(([k]) => k === 'marks')
            : (effectiveRole === 'co_admin')
              ? allTabs.filter(([k]) => ['marks', 'merit', 'tabulation', 'marksheet'].includes(k))
              : allTabs;

          return availableTabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`exam-tab-btn ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ));
        })()}
      </div>

      {/* ================= GLOBAL CONTEXT TOOLBAR ================= */}
      {['subjects', 'marks', 'processing', 'merit', 'tabulation', 'marksheet', 'analysis'].includes(tab) && (
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
                <option value="">কোনো পরীক্ষা সেটআপ নেই</option>
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
                  শ্রেণি {toBnDigits(c)} ({['9','10'].includes(c) ? 'এসএসসি' : 'জেএসসি'})
                </option>
              ))}
            </select>
          </div>

          {/* Group / Department Selector for Classes 9 & 10 */}
          {isSSC && (
            <div className="toolbar-group">
              <label>বিভাগ/গ্রুপ:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="all">সকল বিভাগ (All)</option>
                <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                <option value="মানবিক">মানবিক বিভাগ (Humanities)</option>
                <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা (Commerce)</option>
              </select>
            </div>
          )}

          {/* Subject selector specific to Mark Entry */}
          {tab === 'marks' && (
            <div className="toolbar-group">
              <label>বিষয়:</label>
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                {subjectsForClass.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name_bn} {s.is_optional ? ' (৪র্থ বিষয়)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="toolbar-actions">
            {tab === 'marks' && (
              <>
                <button type="button" className="btn-modern-action" onClick={handleLoadRoster}>
                  🔄 লোড
                </button>
                <button type="button" className="btn-modern-primary" onClick={handleSaveMarksRoster}>
                  💾 সংরক্ষণ
                </button>
                <button type="button" className="btn-modern-secondary" onClick={handleQuickDemoMarks} title="দ্রুত ডেমো নম্বর পূরণ করুন">
                  🎲 ডেমো ফিল
                </button>
              </>
            )}

            {tab === 'processing' && (
              <button type="button" className="btn-modern-primary" onClick={handleRunResultProcessing}>
                🧮 Result Process চালান
              </button>
            )}

            {['merit', 'tabulation', 'marksheet'].includes(tab) && (
              <button type="button" className="btn-modern-secondary" onClick={() => window.print()}>
                🖨️ প্রিন্ট করুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ACADEMIC YEAR SETUP TAB */}
      {/* ========================================================================= */}
      {tab === 'academic_year' && (
        <div className="exam-section-grid">
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
                    setYearForm({ year: '', title_bn: '', is_current: false, status: 'active', remarks: '' });
                  }}
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            <p className="card-desc">
              বিদ্যালয়ের বিভিন্ন শিক্ষাবর্ষ নির্ধারণ করুন। নির্ধারিত শিক্ষাবর্ষের অধীনেই বিভিন্ন পরীক্ষা এবং মার্ক এন্ট্রি পরিচালিত হবে।
            </p>

            {!editingYearId && (
              <div className="preset-chip-shelf">
                <span className="preset-label">দ্রুত প্রিসেট:</span>
                {STANDARD_YEAR_PRESETS.map((p) => (
                  <button
                    key={p.year}
                    type="button"
                    className="preset-chip"
                    onClick={() => {
                      setYearForm({
                        year: p.year,
                        title_bn: p.title_bn,
                        is_current: p.is_current,
                        status: p.status,
                        remarks: p.remarks
                      });
                    }}
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
                      setYearForm(f => ({ ...f, year: y, title_bn: y ? `${toBnDigits(y)} শিক্ষাবর্ষ` : '' }));
                    }}
                    required
                  />
                </div>
                <div className="form-field-unit">
                  <label>শিরোনাম (বাংলা) *</label>
                  <input
                    type="text"
                    placeholder="যেমন: ২০২৬ শিক্ষাবর্ষ"
                    value={yearForm.title_bn}
                    onChange={(e) => setYearForm(f => ({ ...f, title_bn: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>অবস্থা (Status)</label>
                  <select value={yearForm.status} onChange={(e) => setYearForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">🟢 সক্রিয় (Active)</option>
                    <option value="upcoming">🟡 আসন্ন (Upcoming)</option>
                    <option value="completed">⚪ সম্পন্ন/আর্কাইভ (Completed)</option>
                  </select>
                </div>
                <div className="form-field-unit">
                  <label>প্রধান সক্রিয় শিক্ষাবর্ষ হিসেবে নির্ধারণ</label>
                  <div className="checkbox-toggle-wrap">
                    <input
                      type="checkbox"
                      id="isCurrentYear"
                      checked={yearForm.is_current}
                      onChange={(e) => setYearForm(f => ({ ...f, is_current: e.target.checked }))}
                    />
                    <label htmlFor="isCurrentYear" className="checkbox-label-text">
                      এটি বিদ্যালয়ের বর্তমান চলমান প্রধান শিক্ষাবর্ষ
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-field-unit">
                <label>মন্তব্য / বিবরণ</label>
                <input
                  type="text"
                  placeholder="যেমন: চলমান শিক্ষাবর্ষ"
                  value={yearForm.remarks}
                  onChange={(e) => setYearForm(f => ({ ...f, remarks: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-modern-submit">
                {editingYearId ? '💾 শিক্ষাবর্ষ আপডেট করুন' : '➕ শিক্ষাবর্ষ সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          <div className="exam-card-table">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">তালিকা</span>
                <h3>নির্ধারিত শিক্ষাবর্ষের তালিকা</h3>
              </div>
              <span className="table-count-badge">মোট: {toBnDigits(academicYears.length)} টি</span>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table">
                <thead>
                  <tr>
                    <th>শিক্ষাবর্ষ</th>
                    <th>বাংলা শিরোনাম</th>
                    <th>স্ট্যাটাস</th>
                    <th>পরীক্ষার সংখ্যা</th>
                    <th style={{ textAlign: 'right' }}>কাজ</th>
                  </tr>
                </thead>
                <tbody>
                  {academicYears.map((ay) => {
                    const count = exams.filter(e => String(e.academic_year) === String(ay.year)).length;
                    return (
                      <tr key={ay.id || ay.year} className={ay.is_current ? 'active-year-row' : ''}>
                        <td>
                          <b>{toBnDigits(ay.year)}</b>
                          {ay.is_current && <span className="active-star-badge" title="সক্রিয় চলমান শিক্ষাবর্ষ">★ প্রধান</span>}
                        </td>
                        <td>{ay.title_bn}</td>
                        <td>
                          <span className={`status-pill ${ay.status === 'active' ? 'status-active' : 'status-completed'}`}>
                            {ay.status === 'active' ? 'সক্রিয়' : ay.status === 'upcoming' ? 'আসন্ন' : 'আর্কাইভ'}
                          </span>
                        </td>
                        <td>
                          <span className="exam-count-chip">{toBnDigits(count)} টি পরীক্ষা</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-group">
                            {!ay.is_current && (
                              <button
                                type="button"
                                className="btn-action-icon activate"
                                onClick={() => handleMakeActiveYear(ay)}
                                title="চলমান শিক্ষাবর্ষ হিসেবে সেট করুন"
                              >
                                ★
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-action-icon edit"
                              onClick={() => handleEditAcademicYear(ay)}
                              title="সম্পাদনা"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn-action-icon delete"
                              onClick={() => handleDeleteAcademicYear(ay)}
                              title="মুছুন"
                            >
                              🗑️
                            </button>
                          </div>
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

      {/* ========================================================================= */}
      {/* 2. EXAM NAMES SETUP TAB */}
      {/* ========================================================================= */}
      {tab === 'exam_names' && (
        <div className="exam-section-grid">
          <div className="exam-card-form">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">সেটআপ পর্ব - ২</span>
                <h3>{editingExamId ? '✏️ পরীক্ষার নাম সম্পাদনা' : '➕ পরীক্ষার নাম স্থাপন'}</h3>
              </div>
              {editingExamId && (
                <button
                  type="button"
                  className="btn-text-cancel"
                  onClick={() => {
                    setEditingExamId(null);
                    setExamForm({ academic_year: selectedYear, name_bn: '', name_en: '', exam_type: 'সাময়িক পরীক্ষা', status: 'active', remarks: '' });
                  }}
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            <p className="card-desc">
              মার্ক এন্ট্রির জন্য বিভিন্ন পরীক্ষার নাম ও শিক্ষাবর্ষ নির্ধারণ করুন। <i>(রুটিন সংক্রান্ত নয়, তাই এখানে তারিখের কোনো ফিল্ড রাখা হয়নি।)</i>
            </p>

            {!editingExamId && (
              <div className="preset-chip-shelf">
                <span className="preset-label">প্রমিত প্রিসেট:</span>
                {STANDARD_EXAM_PRESETS.map((p) => (
                  <button
                    key={p.name_bn}
                    type="button"
                    className="preset-chip"
                    onClick={() => {
                      setExamForm(f => ({
                        ...f,
                        name_bn: p.name_bn,
                        name_en: p.name_en,
                        exam_type: p.exam_type
                      }));
                    }}
                  >
                    + {p.name_bn}
                  </button>
                ))}
              </div>
            )}

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
                        {ay.title_bn || ay.year} {ay.is_current ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field-unit">
                  <label>পরীক্ষার ধরন (Category) *</label>
                  <select
                    value={examForm.exam_type}
                    onChange={(e) => setExamForm(f => ({ ...f, exam_type: e.target.value }))}
                  >
                    <option value="সাময়িক পরীক্ষা">সাময়িক পরীক্ষা (Terminal)</option>
                    <option value="অর্ধবার্ষিক পরীক্ষা">অর্ধবার্ষিক পরীক্ষা (Half Yearly)</option>
                    <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা (Annual)</option>
                    <option value="প্রাক-নির্বাচনী পরীক্ষা">প্রাক-নির্বাচনী পরীক্ষা (Pre-Test)</option>
                    <option value="নির্বাচনী পরীক্ষা (Test)">নির্বাচনী পরীক্ষা (Test - SSC)</option>
                    <option value="মডেল টেস্ট / ক্লাস টেস্ট">মডেল টেস্ট / ক্লাস টেস্ট</option>
                  </select>
                </div>
              </div>

              <div className="form-field-unit">
                <label>পরীক্ষার নাম (বাংলা) *</label>
                <input
                  type="text"
                  placeholder="যেমন: ১ম সাময়িক পরীক্ষা ২০২৬ বা নির্বাচনী পরীক্ষা"
                  value={examForm.name_bn}
                  onChange={(e) => setExamForm(f => ({ ...f, name_bn: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-field-unit">
                  <label>পরীক্ষার নাম (English - ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Terminal Examination"
                    value={examForm.name_en}
                    onChange={(e) => setExamForm(f => ({ ...f, name_en: e.target.value }))}
                  />
                </div>
                <div className="form-field-unit">
                  <label>এন্ট্রি অবস্থা (Status)</label>
                  <select value={examForm.status} onChange={(e) => setExamForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">🟢 সক্রিয় (নম্বর এন্ট্রি উন্মুক্ত)</option>
                    <option value="draft">🟡 খসড়া / প্রস্তুতি চলছে</option>
                    <option value="published">🟣 ফলাফল প্রকাশিত ও সংরক্ষিত</option>
                  </select>
                </div>
              </div>

              <div className="form-field-unit">
                <label>মন্তব্য / অতিরিক্ত তথ্য</label>
                <input
                  type="text"
                  placeholder="যেমন: সকল শ্রেণির লিখিত ও MCQ নম্বর এন্ট্রি"
                  value={examForm.remarks}
                  onChange={(e) => setExamForm(f => ({ ...f, remarks: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-modern-submit">
                {editingExamId ? '💾 পরীক্ষার তথ্য আপডেট করুন' : '➕ পরীক্ষার নাম সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          <div className="exam-card-table">
            <div className="card-header-styled">
              <div>
                <span className="card-badge">পরীক্ষার তালিকা</span>
                <h3>স্থাপিত পরীক্ষার নামসমূহ</h3>
              </div>
              <div className="filter-shelf-mini">
                <label>শিক্ষাবর্ষ ফিল্টার:</label>
                <select value={examFilterYear} onChange={(e) => setExamFilterYear(e.target.value)}>
                  <option value="all">সব শিক্ষাবর্ষ</option>
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
                      <td><span className="code-pill">{toBnDigits(ex.academic_year)}</span></td>
                      <td>
                        <b>{ex.name_bn}</b>
                        {ex.name_en && <div className="sub-text-en">{ex.name_en}</div>}
                      </td>
                      <td><span className="type-badge">{ex.exam_type || 'অভ্যন্তরীণ'}</span></td>
                      <td>
                        <span className={`status-pill ${ex.status === 'active' ? 'status-active' : ex.status === 'published' ? 'status-pub' : 'status-completed'}`}>
                          {ex.status === 'active' ? '🟢 এন্ট্রি উন্মুক্ত' : ex.status === 'published' ? '🟣 প্রকাশিত' : '🟡 প্রস্তুত'}
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
                          <button type="button" className="btn-action-icon edit" onClick={() => handleEditExam(ex)} title="সম্পাদনা">
                            ✏️
                          </button>
                          <button type="button" className="btn-action-icon delete" onClick={() => handleDeleteExam(ex)} title="মুছুন">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredExamsForSetup.length && (
                    <tr>
                      <td colSpan="5" className="empty-table-cell">
                        এই শিক্ষাবর্ষের জন্য কোনো পরীক্ষা তৈরি করা হয়নি।
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
      {/* 3. SUBJECTS & MARKS DISTRIBUTION TAB (DHAKA BOARD JSC & SSC PATTERNS)    */}
      {/* ========================================================================= */}
      {tab === 'subjects' && (
        <div className="exam-card-table">
          <div className="board-pattern-banner">
            <div>
              <span className="pattern-badge-pill">
                {isSSC ? '🏛️ ঢাকা শিক্ষা বোর্ড এসএসসি প্রমিত কাঠামো' : '📋 ঢাকা শিক্ষা বোর্ড জেএসসি প্রমিত কাঠামো'}
              </span>
              <p className="pattern-desc">
                {isSSC
                  ? '৯ম ও ১০ম শ্রেণি: আবশ্যিক বিষয়সমূহ + বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা বিভাগভিত্তিক ৩টি মূল বিষয় + ৪র্থ বিষয় (ঐচ্ছিক)। পূর্ণমান ১৩০০।'
                  : '৬ষ্ঠ থেকে ৮ম শ্রেণি: বাংলা, ইংরেজি, গণিত, বিজ্ঞান, বাবিপ, ধর্ম, আইসিটি এবং সহায়ক বিষয়। লিখিত (CQ), MCQ ও ব্যবহারিকে পৃথক পাস প্রযোজ্য।'}
              </p>
            </div>
            <button
              type="button"
              className="btn-modern-secondary"
              onClick={handleResetDhakaBoardSubjects}
              title="ঢাকা শিক্ষা বোর্ডের প্রমিত বিষয় ও নম্বর বণ্টন পুনরায় লোড করুন"
            >
              🏛️ বোর্ডের সিলেবাস রিসেট / লোড
            </button>
          </div>

          <div className="card-header-styled">
            <div>
              <span className="card-badge">সিলেবাস ও বিষয় কাঠামো</span>
              <h3>
                📚 শ্রেণি {toBnDigits(className)} — বিষয় ও নম্বর বণ্টন
                {isSSC && department !== 'all' ? ` (${department})` : ''}
              </h3>
            </div>
            <span className="table-count-badge">মোট বিষয়: {toBnDigits(subjectsForClass.length)} টি</span>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-exam-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>বিষয় কোড</th>
                  <th>বিষয়ের নাম</th>
                  <th>বিভাগ / ধরন</th>
                  <th>পূর্ণমান</th>
                  <th>লিখিত / CQ (পাস)</th>
                  <th>MCQ (পাস)</th>
                  <th>ব্যবহারিক (পাস)</th>
                  <th>সর্বমোট পাস</th>
                  <th>৪র্থ বিষয় (ঐচ্ছিক)</th>
                </tr>
              </thead>
              <tbody>
                {subjectsForClass.map((s) => (
                  <tr key={s.id || s.code}>
                    <td><span className="code-pill"><b>{s.code}</b></span></td>
                    <td>
                      <b>{s.name_bn}</b>
                      {s.name_en && <div className="sub-text-en">{s.name_en}</div>}
                    </td>
                    <td>
                      <span className={
                        s.department === 'বিজ্ঞান' ? 'sub-tag-sci' :
                        s.department === 'মানবিক' ? 'sub-tag-hum' :
                        s.department === 'ব্যবসায় শিক্ষা' ? 'sub-tag-bus' :
                        'sub-tag-compulsory'
                      }>
                        {s.department || 'সাধারণ'}
                      </span>
                    </td>
                    <td><b>{toBnDigits(s.full_marks || 100)}</b></td>
                    <td>
                      {s.written_max > 0 ? (
                        <span>{toBnDigits(s.written_max)} <small className="text-muted">({toBnDigits(s.written_pass || 23)})</small></span>
                      ) : '—'}
                    </td>
                    <td>
                      {s.mcq_max > 0 ? (
                        <span>{toBnDigits(s.mcq_max)} <small className="text-muted">({toBnDigits(s.mcq_pass || 10)})</small></span>
                      ) : '—'}
                    </td>
                    <td>
                      {s.practical_max > 0 ? (
                        <span>{toBnDigits(s.practical_max)} <small className="text-muted">({toBnDigits(s.practical_pass || 8)})</small></span>
                      ) : '—'}
                    </td>
                    <td>
                      <b className="tab-pass-cell">{toBnDigits(s.pass_marks || 33)}</b>
                    </td>
                    <td>
                      {s.is_optional ? (
                        <span className="sub-tag-opt">★ ৪র্থ বিষয়</span>
                      ) : (
                        <span className="text-muted">আবশ্যিক/মূল</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!subjectsForClass.length && (
                  <tr>
                    <td colSpan="9" className="empty-table-cell">
                      এই শ্রেণি ও বিভাগের জন্য কোনো বিষয় পাওয়া যায়নি। উপরের "বোর্ডের সিলেবাস রিসেট" বাটনে ক্লিক করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MARKS ENTRY TAB */}
      {/* ========================================================================= */}
      {tab === 'marks' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">নম্বর এন্ট্রি কনসোল</span>
              <h3>
                ✍️ {selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা'} — শ্রেণি {toBnDigits(className)}: [{currentSubjectObj?.code}] {currentSubjectObj?.name_bn}
                {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? ` (${department} বিভাগ)` : ''}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '3px 9px', borderRadius: '12px', marginLeft: '10px' }}>
                  {toBnDigits(displayedMarksRoster.length)} জন শিক্ষার্থী
                </span>
              </h3>
            </div>
            <div className="table-action-group">
              <button type="button" className="btn-modern-action" onClick={handleLoadRoster}>
                🔄 তালিকা রিফ্রেশ
              </button>
              <button
                type="button"
                className="btn-modern-action"
                style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 600 }}
                onClick={handleDownloadMarksCsv}
                title="বর্তমান বিষয়ের শিক্ষার্থীদের নম্বর এন্ট্রি শিট CSV ফাইল হিসেবে ডাউনলোড করুন (Excel Compatible)"
              >
                📥 CSV Download
              </button>
              <label
                className="btn-modern-action"
                style={{ background: '#059669', color: '#fff', borderColor: '#059669', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="এক্সেলে পূরণকৃত মার্কস CSV ফাইল আপলোড করে এক ক্লিকে সকল নম্বর যুক্ত করুন"
              >
                📤 CSV Upload
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={handleUploadMarksCsv}
                />
              </label>
              <button type="button" className="btn-modern-secondary" onClick={handleQuickDemoMarks} title="বর্তমান নির্বাচিত বিষয়ের নমুনা নম্বর পূরণ">
                🎲 ডেমো ফিল
              </button>
              <button type="button" className="btn-modern-primary" onClick={handleSaveMarksRoster}>
                💾 সব নম্বর সংরক্ষণ
              </button>
            </div>
          </div>

          {currentSubjectObj && (
            <div className="subject-meta-strip">
              <span><b>পূর্ণমান:</b> {currentSubjectObj.full_marks}</span>
              {currentSubjectObj.written_max > 0 && (
                <span><b>লিখিত/CQ:</b> সর্বোচ্চ {currentSubjectObj.written_max} (পাস: {currentSubjectObj.written_pass || 23})</span>
              )}
              {currentSubjectObj.mcq_max > 0 && (
                <span><b>MCQ:</b> সর্বোচ্চ {currentSubjectObj.mcq_max} (পাস: {currentSubjectObj.mcq_pass || 10})</span>
              )}
              {currentSubjectObj.practical_max > 0 && (
                <span><b>ব্যবহারিক:</b> সর্বোচ্চ {currentSubjectObj.practical_max} (পাস: {currentSubjectObj.practical_pass || 8})</span>
              )}
              <span><b>মোট পাস:</b> {currentSubjectObj.pass_marks || 33}</span>
            </div>
          )}

          <div className="marks-quick-tip-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>⚡ <b>সরাসরি দ্রুত মার্ক এন্ট্রি:</b> সরাসরি কীবোর্ডে নম্বর লিখুন (Enter বা ↓ চাপলে পরের ঘরে যাবে)। অথবা <b>CSV Download</b> করে অফলাইনে এক্সেলে নম্বর বসিয়ে <b>CSV Upload</b> করতে পারেন।</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleDownloadMarksCsv}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="বর্তমান বিষয়ের CSV শিট ডাউনলোড"
              >
                📥 CSV Download
              </button>
              <label
                style={{
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="পূরণকৃত CSV শিট আপলোড"
              >
                📤 CSV Upload
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={handleUploadMarksCsv}
                />
              </label>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-exam-table marks-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>রোল</th>
                  <th>Student ID</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>বিভাগ/শাখা</th>
                  <th style={{ width: '95px' }}>লিখিত / CQ</th>
                  <th style={{ width: '95px' }}>MCQ</th>
                  <th style={{ width: '95px' }}>ব্যবহারিক</th>
                  <th style={{ width: '90px' }}>মোট</th>
                  <th style={{ width: '90px' }}>গ্রেড (GP)</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>অনুপস্থিত</th>
                  <th>মন্তব্য</th>
                </tr>
              </thead>
              <tbody>
                {displayedMarksRoster.map((r, i) => {
                  const evalRes = calculateSubjectGrade(currentSubjectObj, r);
                  const stKey = r.student_id || r.student_code || i;
                  return (
                    <tr key={r.student_id || r.student_code || i}>
                      <td><span className="roll-pill">{toBnDigits(r.roll_no || '—')}</span></td>
                      <td><span className="code-pill">{r.student_code || '—'}</span></td>
                      <td><b>{r.name_bn}</b></td>
                      <td><span className="sub-tag-compulsory">{r.department}</span></td>
                      <td>
                        <input
                          id={`roster-mark-written-${i}`}
                          type="text"
                          inputMode="decimal"
                          className="mark-input-box"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                          disabled={r.absent || (currentSubjectObj?.written_max === 0)}
                          placeholder={currentSubjectObj?.written_max ? `সর্বোচ্চ ${toBnDigits(currentSubjectObj.written_max)}` : '—'}
                          value={r.written}
                          onChange={(e) => handleEditRosterMark(stKey, 'written', e.target.value, currentSubjectObj?.written_max)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleMarkKeyDown(e, i, 'written')}
                        />
                      </td>
                      <td>
                        <input
                          id={`roster-mark-mcq-${i}`}
                          type="text"
                          inputMode="decimal"
                          className="mark-input-box"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                          disabled={r.absent || (currentSubjectObj?.mcq_max === 0)}
                          placeholder={currentSubjectObj?.mcq_max ? `সর্বোচ্চ ${toBnDigits(currentSubjectObj.mcq_max)}` : '—'}
                          value={r.mcq}
                          onChange={(e) => handleEditRosterMark(stKey, 'mcq', e.target.value, currentSubjectObj?.mcq_max)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleMarkKeyDown(e, i, 'mcq')}
                        />
                      </td>
                      <td>
                        <input
                          id={`roster-mark-practical-${i}`}
                          type="text"
                          inputMode="decimal"
                          className="mark-input-box"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                          disabled={r.absent || (currentSubjectObj?.practical_max === 0)}
                          placeholder={currentSubjectObj?.practical_max ? `সর্বোচ্চ ${toBnDigits(currentSubjectObj.practical_max)}` : '—'}
                          value={r.practical}
                          onChange={(e) => handleEditRosterMark(stKey, 'practical', e.target.value, currentSubjectObj?.practical_max)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleMarkKeyDown(e, i, 'practical')}
                        />
                      </td>
                      <td>
                        <b className={`mark-total-display ${r.absent ? 'absent' : ''}`}>
                          {r.absent ? 'Abs' : evalRes.total}
                        </b>
                      </td>
                      <td>
                        <span className={`grade-pill ${evalRes.is_pass ? 'grade-pass' : 'grade-fail'}`} title={evalRes.fail_reason}>
                          {evalRes.letter_grade} ({evalRes.gp.toFixed(1)})
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!r.absent}
                          onChange={(e) => handleEditRosterMark(stKey, 'absent', e.target.checked)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="remarks-input-box"
                          placeholder="মন্তব্য"
                          value={r.remarks}
                          onChange={(e) => handleEditRosterMark(stKey, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {!displayedMarksRoster.length && (
                  <tr>
                    <td colSpan="11" className="empty-table-cell">
                      {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
                        ? `শ্রেণি ${toBnDigits(className)} এর "${department} বিভাগ"-এ কোনো শিক্ষার্থী পাওয়া যায়নি অথবা উপরের "🔄 লোড" বাটনে ক্লিক করুন।`
                        : `শিক্ষার্থী তালিকা প্রস্তুত করতে উপরের "🔄 লোড" বাটনে ক্লিক করুন।`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GRADING POLICY TAB (DHAKA BOARD JSC & SSC RULES)                       */}
      {/* ========================================================================= */}
      {tab === 'grading' && (
        <div className="exam-card-form full-width-card">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">মূল্যায়ন পলিসি</span>
              <h3>🎯 ঢাকা শিক্ষা বোর্ড প্রমিত গ্রেডিং পদ্ধতি ও মূল্যায়ন নিয়মাবলী</h3>
            </div>
          </div>

          <div className="grading-grid-cards">
            {/* Standard Scale Table */}
            <div className="grading-policy-card">
              <h4>📊 ঢাকা শিক্ষা বোর্ড লেটার গ্রেড ও জিপিএ স্কেল (GPA 5.0)</h4>
              <table className="modern-exam-table marksheet-scale-table">
                <thead>
                  <tr>
                    <th>প্রাপ্ত নম্বর শতকরা (%)</th>
                    <th>লেটার গ্রেড</th>
                    <th>গ্রেড পয়েন্ট (GP)</th>
                    <th>মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  {DHAKA_BOARD_GRADING_SCALE.map(g => (
                    <tr key={g.letter_grade}>
                      <td>{toBnDigits(g.min_pct)}% - {toBnDigits(Math.floor(g.max_pct))}%</td>
                      <td><b className="code-pill">{g.letter_grade}</b></td>
                      <td><b>{toBnDigits(g.gpa.toFixed(1))}</b></td>
                      <td>{g.label_bn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SSC Rules Card */}
            <div className="grading-policy-card">
              <h4>🏛️ এসএসসি পরীক্ষা মূল্যায়ন নীতি (৯ম ও ১০ম শ্রেণি)</h4>
              <ul className="policy-list">
                <li><b>বিভাগভিত্তিক ৩টি মূল বিষয়:</b> বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার নির্দিষ্ট ৩টি মূল বিষয়ে পৃথকভাবে পাস বাধ্যতামূলক।</li>
                <li><b>৪র্থ বিষয় (ঐচ্ছিক) নিয়ম:</b> ৪র্থ বিষয়ে প্রাপ্ত জিপিএ থেকে ২.০০ বাদ দিয়ে অতিরিক্ত পয়েন্ট (সর্বোচ্চ ৩.০০) মূল জিপিএ-তে যোগ হবে।</li>
                <li><b>সূত্র:</b> <code>জিপিএ = (মূল বিষয়সমূহের জিপিএ যোগফল + অতিরিক্ত পয়েন্ট) ÷ মূল বিষয়ের সংখ্যা</code> (সর্বোচ্চ ৫.০০)।</li>
                <li><b>৪র্থ বিষয়ে ফেল প্রভাব:</b> ৪র্থ বিষয়ে ফেল করলেও মূল বিষয়সমূহে পাস থাকলে সামগ্রিক ফলাফল ফেল হবে না।</li>
                <li><b>আবশ্যিক বিষয় ফেল:</b> বাংলা, ইংরেজি, গণিত বা অন্য কোনো মূল বিষয়ে ফেল করলে সামগ্রিক ফল অকৃতকার্য (F / ০.০০)।</li>
              </ul>
            </div>

            {/* JSC Rules Card */}
            <div className="grading-policy-card">
              <h4>📋 জেএসসি পরীক্ষা মূল্যায়ন নীতি (৬ষ্ঠ - ৮ম শ্রেণি)</h4>
              <ul className="policy-list">
                <li><b>সকল বিষয়ে পাস:</b> সকল আবশ্যিক বিষয়ে পৃথকভাবে ন্যূনতম ৩৩% নম্বর পেয়ে উত্তীর্ণ হওয়া বাধ্যতামূলক।</li>
                <li><b>সামগ্রিক জিপিএ:</b> <code>জিপিএ = সকল বিষয়ের গ্রেড পয়েন্ট যোগফল ÷ মোট বিষয়ের সংখ্যা</code>।</li>
                <li><b>এক বিষয়ে ফেল করলে:</b> যেকোনো একটি বিষয়ে 'F' গ্রেড পেলে শিক্ষার্থীর সামগ্রিক ফলাফল 'অকৃতকার্য' (GPA 0.00) হিসেবে গণ্য হবে।</li>
                <li><b>পৃথক পাস নিয়ম:</b> সৃজনশীল (CQ), বহুনির্বাচনি (MCQ) এবং ব্যবহারিক (Practical) অংশে পৃথকভাবে ন্যূনতম ৩৩% নম্বর অর্জন করতে হবে।</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RESULT PROCESSING TAB                                                  */}
      {/* ========================================================================= */}
      {tab === 'processing' && (
        <div className="exam-card-form full-width-card">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">অটো প্রসেসিং ইঞ্জিন</span>
              <h3>⚙️ ফলাফল প্রক্রিয়াকরণ ও মেধা তালিকা গণনা (Result Processing)</h3>
            </div>
          </div>
          <p className="card-desc">
            নির্বাচিত পরীক্ষা ও শ্রেণির সকল শিক্ষার্থীর সংগৃহীত নম্বর থেকে ঢাকা শিক্ষা বোর্ডের নিয়ম অনুযায়ী স্বয়ংক্রিয়ভাবে জিপিএ, লেটার গ্রেড, পাশ-ফেল এবং মেধা তালিকা প্রস্তুত করুন।
          </p>

          <div className="exam-processing-box">
            <div className="proc-info-line">
              <b>নির্বাচিত পরীক্ষা:</b> {selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা নির্বাচিত নেই'}
            </div>
            <div className="proc-info-line">
              <b>শিক্ষাবর্ষ:</b> {toBnDigits(selectedYear)} | <b>শ্রেণি:</b> শ্রেণি {toBnDigits(className)} ({isSSC ? 'এসএসসি মডেল' : 'জেএসসি মডেল'})
            </div>
            <div className="proc-info-line">
              <b>মূল্যায়ন নীতি:</b> {isSSC ? '৪র্থ বিষয়ের অতিরিক্ত পয়েন্ট বোনাস প্রযোজ্য' : 'সকল আবশ্যিক বিষয়ে পৃথক পাস প্রযোজ্য'}
            </div>

            <button
              type="button"
              className="btn-modern-primary btn-large"
              onClick={handleRunResultProcessing}
              disabled={!selectedExam}
            >
              🧮 Result Process চালান
            </button>
          </div>

          {analysis?.overall && (
            <div className="report-cards" style={{ marginTop: '20px' }}>
              <div><b>{toBnDigits(analysis.overall.students || 0)}</b><span>মোট পরীক্ষার্থী</span></div>
              <div><b>{toBnDigits(analysis.overall.passed || 0)}</b><span>উত্তীর্ণ শিক্ষার্থী</span></div>
              <div><b>{toBnDigits(analysis.overall.failed || 0)}</b><span>অকৃতকার্য</span></div>
              <div><b>{toBnDigits(analysis.overall.pass_rate || 0)}%</b><span>পাসের হার</span></div>
              <div><b>{toBnDigits(analysis.overall.avg_gpa || 0)}</b><span>গড় GPA</span></div>
              <div><b>{toBnDigits(analysis.overall.gpa5_count || 0)}</b><span>GPA 5.00 (A+)</span></div>
            </div>
          )}

          <div className="preset-chip-shelf" style={{ marginTop: '20px' }}>
            <span className="preset-label">পরবর্তী ধাপে যান:</span>
            <button type="button" className="preset-chip" onClick={() => setTab('merit')}>
              🏆 মেধা তালিকা দেখুন ➜
            </button>
            <button type="button" className="preset-chip" onClick={() => setTab('tabulation')}>
              📋 ট্যাবুলেশন শিট দেখুন ➜
            </button>
            <button type="button" className="preset-chip" onClick={() => setTab('marksheet')}>
              📄 মার্কশিট ও প্রগ্রেস রিপোর্ট দেখুন ➜
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MERIT LIST TAB                                                         */}
      {/* ========================================================================= */}
      {tab === 'merit' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">চূড়ান্ত মেধা তালিকা</span>
              <h3>
                🏆 মেধা ও ফলাফল তালিকা — শ্রেণি {toBnDigits(className)} ({selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা'})
              </h3>
            </div>
            <div className="table-action-group">
              <button type="button" className="btn-modern-action" onClick={() => loadProcessedResults(true)} title="সর্বশেষ সংরক্ষিত নম্বর থেকে ফলাফল রিফ্রেশ করুন">
                🔄 রিফ্রেশ
              </button>
              <button type="button" className="btn-modern-secondary" onClick={() => window.print()}>
                🖨️ মেধা তালিকা প্রিন্ট
              </button>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-exam-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>মেধা স্থান</th>
                  <th style={{ width: '60px' }}>রোল</th>
                  <th>Student ID</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>বিভাগ/গ্রুপ</th>
                  <th>মোট নম্বর</th>
                  <th>শতকরা</th>
                  <th>GPA</th>
                  <th>লেটার গ্রেড</th>
                  <th>ফলাফল</th>
                  <th>অকৃতকার্য বিষয়</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcessedResults.map((x) => (
                  <tr key={x.id || x.student_id}>
                    <td>
                      <b className={`merit-badge ${x.merit === 1 ? 'merit-gold' : x.merit === 2 ? 'merit-silver' : x.merit === 3 ? 'merit-bronze' : ''}`}>
                        {toBnDigits(x.merit)}
                      </b>
                    </td>
                    <td><span className="roll-pill">{toBnDigits(x.roll_no || '—')}</span></td>
                    <td><span className="code-pill">{x.student_id}</span></td>
                    <td><b>{x.name_bn}</b></td>
                    <td><span className="sub-tag-compulsory">{x.department || 'সাধারণ'}</span></td>
                    <td><b>{x.total_marks}</b> <small className="text-muted">/ {x.total_full_marks}</small></td>
                    <td>{x.percentage}%</td>
                    <td><b style={{ fontSize: '15px', color: x.is_pass ? '#0b8050' : '#dc2626' }}>{x.gpa}</b></td>
                    <td>
                      <span className={`grade-pill ${x.is_pass ? 'grade-pass' : 'grade-fail'}`}>
                        {x.final_grade}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${x.is_pass ? 'status-active' : 'status-completed'}`}>
                        {x.result_status}
                      </span>
                    </td>
                    <td>
                      {x.failed_subjects && x.failed_subjects.length > 0 ? (
                        <span className="tab-fail-cell" style={{ padding: '2px 6px', borderRadius: '4px' }}>
                          {x.failed_subjects.join(', ')}
                        </span>
                      ) : (
                        <span className="text-muted">সব পাস</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredProcessedResults.length && (
                  <tr>
                    <td colSpan="11" className="empty-table-cell">
                      মেধা তালিকা প্রস্তুত করতে "ফলাফল প্রসেসিং" ট্যাবে গিয়ে প্রসেস সম্পন্ন করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TABULATION SHEET TAB (MASTER TABULATION MATRIX)                        */}
      {/* ========================================================================= */}
      {tab === 'tabulation' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">মাস্টার ট্যাবুলেশন শিট</span>
              <h3>
                📋 মাস্টার ট্যাবুলেশন শিট — শ্রেণি {toBnDigits(className)} ({selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা'})
              </h3>
            </div>
            <div className="table-action-group">
              <button
                type="button"
                className="btn-modern-action"
                style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 600 }}
                onClick={handleDownloadMasterCsv}
                title="শ্রেণির সকল বিষয়ের মাস্টার ট্যাবুলেশন শিট CSV ফাইল ডাউনলোড করুন"
              >
                📥 মাস্টার শিট CSV
              </button>
              <label
                className="btn-modern-action"
                style={{ background: '#059669', color: '#fff', borderColor: '#059669', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="সকল বিষয়ের মার্কস পূরণকৃত CSV আপলোড করে মাস্টার শিট হালনাগাদ করুন"
              >
                📤 মাস্টার শিট CSV আপলোড
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={handleUploadMarksCsv}
                />
              </label>
              <button type="button" className="btn-modern-action" onClick={() => loadProcessedResults(true)} title="সর্বশেষ সংরক্ষিত নম্বর থেকে ফলাফল রিফ্রেশ করুন">
                🔄 রিফ্রেশ
              </button>
              <button type="button" className="btn-modern-primary" onClick={() => window.print()}>
                🖨️ প্রিন্ট মাস্টার শিট
              </button>
            </div>
          </div>

          {isSSC && (
            <div style={{ padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📌 <b>৯ম ও ১০ম শ্রেণি বোর্ড গ্রেডিং নিয়ম:</b> বাংলা (১ম ও ২য় পত্র মিলিয়ে CQ পাস ৪৬, MCQ পাস ২০, মোট পাস ৬৬) এবং ইংরেজি (১ম ও ২য় পত্র মিলিয়ে মোট পাস ৬৬)। উভয় পত্রের সমন্বিত নম্বরের ভিত্তিতে গ্রেড ও জিপিএ নির্ধারিত।</span>
            </div>
          )}

          <div className="tabulation-matrix-container">
            <table className="tabulation-table">
              <thead>
                <tr>
                  <th rowSpan="2" style={{ width: '40px' }}>মেধা</th>
                  <th rowSpan="2" style={{ width: '45px' }}>রোল</th>
                  <th rowSpan="2">আইডি</th>
                  <th rowSpan="2" style={{ minWidth: '130px' }}>শিক্ষার্থীর নাম</th>
                  <th rowSpan="2">বিভাগ</th>
                  {subjectsForClass.map(s => (
                    <th key={s.code} colSpan="4" className="tab-sub-head">
                      [{s.code}] {s.name_bn}
                    </th>
                  ))}
                  <th rowSpan="2">সর্বমোট</th>
                  <th rowSpan="2">GPA</th>
                  <th rowSpan="2">গ্রেড</th>
                  <th rowSpan="2">ফলাফল</th>
                </tr>
                <tr>
                  {subjectsForClass.map(s => (
                    <React.Fragment key={`${s.code}-heads`}>
                      <th className="tab-sub-col">CQ</th>
                      <th className="tab-sub-col">MCQ</th>
                      <th className="tab-sub-col">Prac</th>
                      <th className="tab-sub-col">মোট</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProcessedResults.map((st) => (
                  <tr key={st.id || st.student_id}>
                    <td><b>{toBnDigits(st.merit)}</b></td>
                    <td><span className="roll-pill">{toBnDigits(st.roll_no)}</span></td>
                    <td><span className="code-pill">{st.student_id}</span></td>
                    <td style={{ textAlign: 'left' }}><b>{st.name_bn}</b></td>
                    <td><span className="sub-tag-compulsory">{st.department || 'সাধারণ'}</span></td>
                    {subjectsForClass.map(subDef => {
                      const found = (st.subjects || []).find(s => s.code === subDef.code || s.subject_id === subDef.id);
                      if (!found) {
                        return (
                          <React.Fragment key={`${st.id}-${subDef.code}-na`}>
                            <td className="text-muted tab-sub-col">—</td>
                            <td className="text-muted tab-sub-col">—</td>
                            <td className="text-muted tab-sub-col">—</td>
                            <td className="text-muted tab-sub-col">—</td>
                          </React.Fragment>
                        );
                      }
                      return (
                        <React.Fragment key={`${st.id}-${subDef.code}`}>
                          <td className="tab-sub-col">{found.written_max > 0 ? found.written : '—'}</td>
                          <td className="tab-sub-col">{found.mcq_max > 0 ? found.mcq : '—'}</td>
                          <td className="tab-sub-col">{found.practical_max > 0 ? found.practical : '—'}</td>
                          <td
                            className={`tab-sub-col ${found.is_pass ? 'tab-pass-cell' : 'tab-fail-cell'}`}
                            title={found.is_combined ? `${found.combined_title}: মোট প্রাপ্ত ${found.combined_total}, গ্রেড ${found.letter_grade}` : ''}
                          >
                            <b>{found.total}</b>
                            <div style={{ fontSize: '10px' }}>{found.letter_grade}</div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td><b>{st.total_marks}</b></td>
                    <td><b style={{ color: st.is_pass ? '#0b8050' : '#dc2626' }}>{st.gpa}</b></td>
                    <td><span className={`grade-pill ${st.is_pass ? 'grade-pass' : 'grade-fail'}`}>{st.final_grade}</span></td>
                    <td>
                      <span className={`status-pill ${st.is_pass ? 'status-active' : 'status-completed'}`}>
                        {st.result_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filteredProcessedResults.length && (
                  <tr>
                    <td colSpan={5 + (subjectsForClass.length * 4) + 4} className="empty-table-cell">
                      ট্যাবুলেশন শিট দেখতে আগে ফলাফল প্রসেস সম্পন্ন করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MARKSHEET & PROGRESS REPORT TAB (OFFICIAL ACADEMIC TRANSCRIPT)          */}
      {/* ========================================================================= */}
      {tab === 'marksheet' && (
        <div className="marksheet-console-wrapper">
          {/* Controls */}
          <div className="marksheet-nav-toolbar no-print">
            <div className="student-selector-box">
              <label>শিক্ষার্থী নির্বাচন:</label>
              <select
                value={selectedStudentIndex}
                onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
              >
                {filteredProcessedResults.map((st, idx) => (
                  <option key={st.id || idx} value={idx}>
                    রোল: {toBnDigits(st.roll_no)} — {st.name_bn} ({st.student_id}) — জিপিএ: {toBnDigits(st.gpa)}
                  </option>
                ))}
              </select>
            </div>

            <div className="nav-buttons-group">
              <button
                type="button"
                className="btn-modern-action"
                disabled={selectedStudentIndex <= 0}
                onClick={() => setSelectedStudentIndex(i => Math.max(0, i - 1))}
              >
                ⬅ পূর্ববর্তী
              </button>
              <button
                type="button"
                className="btn-modern-action"
                disabled={selectedStudentIndex >= filteredProcessedResults.length - 1}
                onClick={() => setSelectedStudentIndex(i => Math.min(filteredProcessedResults.length - 1, i + 1))}
              >
                পরবর্তী ➜
              </button>
              <button type="button" className="btn-modern-primary" onClick={handlePrintMarksheet}>
                🖨️ প্রিন্ট / সেভ PDF (A4)
              </button>
            </div>
          </div>

          {currentStudentResult ? (
            <div className="official-marksheet-wrapper" id="official-academic-transcript">
              {/* ========================================================= */}
              {/* SECTION 1: TOP SECTION (Centered School Header - User Mockup) */}
              {/* ========================================================= */}
              <div className="transcript-official-header">
                <h1 className="transcript-school-name">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
                <div className="transcript-school-line">ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল</div>
                <div className="transcript-school-line">স্থাপিত: ১৯৪৬</div>
                <div className="transcript-school-eiin">EIIN: 114290</div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 2: EXAM TITLE BADGE */}
              {/* ========================================================= */}
              <div className="marksheet-exam-title-badge">
                <span>
                  একাডেমিক ট্রান্সক্রিপ্ট / মার্কশিট (ACADEMIC TRANSCRIPT) — {selectedExamObj ? selectedExamObj.name_bn : 'প্রাক-নির্বাচনী পরীক্ষা'} {toBnDigits(selectedYear)}
                </span>
              </div>

              {/* Student Details Grid */}
              <div className="marksheet-top-info-grid">
                {/* Left Card */}
                <div className="marksheet-student-card">
                  <div className="info-row">
                    <b>শিক্ষার্থীর নাম:</b> {currentStudentResult.name_bn} {currentStudentResult.name_en ? `(${currentStudentResult.name_en.toUpperCase()})` : ''}
                  </div>
                  <div className="info-row">
                    <b>Student ID:</b> {currentStudentResult.student_id} | <b>রোল নম্বর:</b> {toBnDigits(currentStudentResult.roll_no)}
                  </div>
                  <div className="info-row">
                    <b>শ্রেণি:</b> শ্রেণি {toBnDigits(className)} | <b>শাখা:</b> {currentStudentResult.section || (isSSC ? 'বিজ্ঞান বিভাগ' : 'A')}
                  </div>
                  <div className="info-row">
                    <b>বিভাগ / গ্রুপ:</b> {currentStudentResult.department || (isSSC ? 'বিজ্ঞান' : 'সাধারণ')}
                  </div>
                </div>

                {/* Right Card */}
                <div className="marksheet-student-card">
                  <div className="info-row">
                    <b>পিতার নাম:</b> {currentStudentResult.student?.father_name || currentStudentResult.father_name || 'মুহাম্মদ আবুবকর সিদ্দিক'}
                  </div>
                  <div className="info-row">
                    <b>মাতার নাম:</b> {currentStudentResult.student?.mother_name || currentStudentResult.mother_name || 'তাহমিনা'}
                  </div>
                  <div className="info-row">
                    <b>শিক্ষাবর্ষ:</b> {toBnDigits(selectedYear)} খ্রি.
                  </div>
                  <div className="info-row">
                    <b>পরীক্ষার নাম:</b> {selectedExamObj ? selectedExamObj.name_bn : 'প্রাক-নির্বাচনী পরীক্ষা'}
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 3: SUBJECTS & MARKS TABLE */}
              {/* ========================================================= */}
              <table className="marksheet-subjects-table marksheet-board-table">
                <thead>
                  <tr>
                    <th rowSpan="2" style={{ width: '90px' }}>Subject Code</th>
                    <th rowSpan="2" style={{ textAlign: 'center' }}>Subject Name</th>
                    <th colSpan="4">Marks</th>
                    <th rowSpan="2" style={{ width: '100px' }}>Grade</th>
                  </tr>
                  <tr>
                    <th style={{ width: '85px' }}>CQ/Theory</th>
                    <th style={{ width: '75px' }}>MCQ</th>
                    <th style={{ width: '75px' }}>Practical</th>
                    <th style={{ width: '80px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transcriptSubjects.map((sub) => {
                    const codeStr = String(sub.code || '');

                    // Bangla Paired Evaluation (101 & 102)
                    if (codeStr === '101') {
                      return (
                        <tr key={sub.code || sub.subject_id}>
                          <td><b>101</b></td>
                          <td className="text-left">
                            <b>BANGLA-I</b>
                          </td>
                          <td>{sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : 0)}</td>
                          <td>{sub.absent ? 'অনুপস্থিত' : (sub.mcq !== '' && sub.mcq !== null && sub.mcq !== undefined ? sub.mcq : 0)}</td>
                          <td rowSpan={hasBanglaPair ? 2 : 1}>—</td>
                          <td rowSpan={hasBanglaPair ? 2 : 1}><b>{hasBanglaPair ? banglaCombinedTotal : (sub.absent ? 0 : sub.total)}</b></td>
                          <td rowSpan={hasBanglaPair ? 2 : 1} className="transcript-grade-cell">
                            <div className="grade-letter">{sub.letter_grade}</div>
                            <div className="grade-gp">GP {sub.gp.toFixed(2)}</div>
                          </td>
                        </tr>
                      );
                    }

                    if (codeStr === '102') {
                      return (
                        <tr key={sub.code || sub.subject_id}>
                          <td><b>102</b></td>
                          <td className="text-left">
                            <b>BANGLA-II</b>
                          </td>
                          <td>{sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : 0)}</td>
                          <td>{sub.absent ? 'অনুপস্থিত' : (sub.mcq !== '' && sub.mcq !== null && sub.mcq !== undefined ? sub.mcq : 0)}</td>
                          {/* Practical, Total, and Grade spanned from row 101 when hasBanglaPair */}
                          {!hasBanglaPair && (
                            <>
                              <td>—</td>
                              <td><b>{sub.absent ? 0 : sub.total}</b></td>
                              <td className="transcript-grade-cell">
                                <div className="grade-letter">{sub.letter_grade}</div>
                                <div className="grade-gp">GP {sub.gp.toFixed(2)}</div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    }

                    // English Paired Evaluation (107 & 108)
                    if (codeStr === '107') {
                      return (
                        <tr key={sub.code || sub.subject_id}>
                          <td><b>107</b></td>
                          <td className="text-left">
                            <b>ENGLISH-I</b>
                          </td>
                          <td>{sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : sub.total)}</td>
                          <td rowSpan={hasEnglishPair ? 2 : 1}>—</td>
                          <td rowSpan={hasEnglishPair ? 2 : 1}>—</td>
                          <td rowSpan={hasEnglishPair ? 2 : 1}><b>{hasEnglishPair ? englishCombinedTotal : (sub.absent ? 0 : sub.total)}</b></td>
                          <td rowSpan={hasEnglishPair ? 2 : 1} className="transcript-grade-cell">
                            <div className="grade-letter">{sub.letter_grade}</div>
                            <div className="grade-gp">GP {sub.gp.toFixed(2)}</div>
                          </td>
                        </tr>
                      );
                    }

                    if (codeStr === '108') {
                      return (
                        <tr key={sub.code || sub.subject_id}>
                          <td><b>108</b></td>
                          <td className="text-left">
                            <b>ENGLISH-II</b>
                          </td>
                          <td>{sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : sub.total)}</td>
                          {!hasEnglishPair && (
                            <>
                              <td>—</td>
                              <td>—</td>
                              <td><b>{sub.absent ? 0 : sub.total}</b></td>
                              <td className="transcript-grade-cell">
                                <div className="grade-letter">{sub.letter_grade}</div>
                                <div className="grade-gp">GP {sub.gp.toFixed(2)}</div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    }

                    // All other single subjects
                    const isAbsent = !!sub.absent;
                    const wVal = isAbsent ? 'অনুপস্থিত' : (sub.written_max > 0 ? (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : 0) : '—');
                    const mVal = isAbsent ? 'অনুপস্থিত' : (sub.mcq_max > 0 ? (sub.mcq !== '' && sub.mcq !== null && sub.mcq !== undefined ? sub.mcq : 0) : '—');
                    const pVal = isAbsent ? '—' : (sub.practical_max > 0 ? (sub.practical !== '' && sub.practical !== null && sub.practical !== undefined ? sub.practical : 0) : '—');

                    return (
                      <tr key={sub.code || sub.subject_id}>
                        <td><b>{sub.code}</b></td>
                        <td className="text-left">
                          <b>{getSubjectEnName(sub)}</b>
                        </td>
                        <td>{wVal}</td>
                        <td>{mVal}</td>
                        <td>{pVal}</td>
                        <td><b>{isAbsent ? 0 : sub.total}</b></td>
                        <td className="transcript-grade-cell">
                          <div className="grade-letter">{sub.letter_grade}</div>
                          <div className="grade-gp">GP {sub.gp.toFixed(2)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary Cards */}
              <div className="transcript-summary-box">
                <div>
                  <div className="summary-label">সর্বমোট প্রাপ্ত নম্বর</div>
                  <div className="summary-val">{currentStudentResult.total_marks}</div>
                </div>
                <div>
                  <div className="summary-label">প্রাপ্ত শতকরা (%)</div>
                  <div className="summary-val">{currentStudentResult.percentage}%</div>
                </div>
                <div>
                  <div className="summary-label">গ্রেড পয়েন্ট (GPA)</div>
                  <div className="summary-val green-text">
                    {currentStudentResult.gpa}
                  </div>
                </div>
                <div>
                  <div className="summary-label">চূড়ান্ত লেটার গ্রেড</div>
                  <div className="summary-val green-text">
                    {currentStudentResult.final_grade}
                  </div>
                </div>
                <div>
                  <div className="summary-label">ফলাফল স্ট্যাটাস</div>
                  <div className="summary-val green-text status-text">
                    {currentStudentResult.result_status}
                  </div>
                </div>
                <div>
                  <div className="summary-label">শ্রেণি মেধা স্থান</div>
                  <div className="summary-val">
                    {currentStudentResult.merit ? `${toBnDigits(currentStudentResult.merit)} তম` : '১ তম'}
                  </div>
                </div>
              </div>

              {/* Signature Zone */}
              <div className="transcript-signatures-zone">
                <div className="sig-column">
                  <div className="sig-dots">...........................................</div>
                  <div>শ্রেণি শিক্ষকের স্বাক্ষর</div>
                </div>
                <div className="sig-column">
                  <div className="sig-dots">...........................................</div>
                  <div>অভিভাবকের স্বাক্ষর</div>
                </div>
                <div className="sig-column">
                  <div className="sig-dots">...........................................</div>
                  <div>প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</div>
                </div>
              </div>

              {/* Footer info */}
              <div className="transcript-footer-line">
                <span>ফলাফল প্রকাশের তারিখ: {toBnDigits(new Date().toLocaleDateString('bn-BD'))} খ্রি.</span>
                <span>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, কালিহাতী, টাঙ্গাইল — কম্পিউটার প্রস্তুতকৃত একাডেমিক ট্রান্সক্রিপ্ট</span>
              </div>
            </div>
          ) : (
            <div className="exam-card-form text-center">
              <h3>📄 কোনো মার্কশিট তৈরি নেই</h3>
              <p>মার্কশিট দেখার জন্য আগে "ফলাফল প্রসেসিং" সম্পন্ন করুন।</p>
              <button type="button" className="btn-modern-primary" onClick={handleRunResultProcessing}>
                🧮 Result Process চালান
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. RESULT ANALYSIS TAB                                                   */}
      {/* ========================================================================= */}
      {tab === 'analysis' && (
        <div className="analysis-panel">
          {!analysis ? (
            <div className="exam-card-form text-center">
              <h3>📊 ফলাফল বিশ্লেষণ প্রস্তুত করুন</h3>
              <p>নির্বাচিত পরীক্ষা ও শ্রেণির সার্বিক ফলাফল এবং বিষয়ভিত্তিক পরিসংখ্যান দেখতে নিচের বাটনে ক্লিক করুন।</p>
              <button type="button" className="btn-modern-primary" onClick={loadProcessedResults}>
                ফলাফল বিশ্লেষণ প্রস্তুত করুন
              </button>
            </div>
          ) : (
            <>
              <div className="report-cards">
                <div><b>{toBnDigits(analysis.overall?.students || 0)}</b><span>পরীক্ষার্থী</span></div>
                <div><b>{toBnDigits(analysis.overall?.passed || 0)}</b><span>উত্তীর্ণ</span></div>
                <div><b>{toBnDigits(analysis.overall?.failed || 0)}</b><span>অকৃতকার্য</span></div>
                <div><b>{toBnDigits(analysis.overall?.pass_rate || 0)}%</b><span>পাসের হার</span></div>
                <div><b>{toBnDigits(analysis.overall?.avg_gpa || 0)}</b><span>গড় GPA</span></div>
                <div><b>{toBnDigits(analysis.overall?.gpa5_count || 0)}</b><span>GPA 5.0 (A+)</span></div>
              </div>

              {/* Grade distribution */}
              {analysis.grade_distribution && (
                <div className="exam-card-form" style={{ marginTop: '16px' }}>
                  <h4>🎯 গ্রেড বণ্টন (Grade Distribution)</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {Object.entries(analysis.grade_distribution).map(([gr, cnt]) => (
                      <div key={gr} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', textAlign: 'center', minWidth: '80px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>গ্রেড {gr}</span>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: gr === 'A+' ? '#0b8050' : gr === 'F' ? '#dc2626' : '#1e293b' }}>
                          {toBnDigits(cnt)} জন
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="exam-card-table" style={{ marginTop: '16px' }}>
                <div className="card-header-styled">
                  <h3>বিষয়ভিত্তিক ফলাফল বিশ্লেষণ</h3>
                  <button type="button" className="btn-text-action" onClick={loadProcessedResults}>
                    🔄 রিফ্রেশ
                  </button>
                </div>
                <div className="table-responsive-wrapper">
                  <table className="modern-exam-table">
                    <thead>
                      <tr>
                        <th>বিষয় কোড</th>
                        <th>বিষয়ের নাম</th>
                        <th>বিভাগ</th>
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
                          <td><span className="code-pill"><b>{x.code}</b></span></td>
                          <td><b>{x.subject_name}</b></td>
                          <td><span className="sub-tag-compulsory">{x.department || 'সাধারণ'}</span></td>
                          <td>{toBnDigits(x.avg_marks)}</td>
                          <td>{toBnDigits(x.avg_percentage)}%</td>
                          <td><b className="tab-pass-cell">{toBnDigits(x.passed)}</b></td>
                          <td><b className={x.failed > 0 ? 'tab-fail-cell' : 'text-muted'}>{toBnDigits(x.failed)}</b></td>
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
    </div>
  );
}

export default ResultPanel;
