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
  // Check 4th subject choice for Science (126 vs 134)
  const stDept = (student.department || student.group_name || student.group || 'বিজ্ঞান').trim();
  const isHumanities = stDept.includes('মানবিক') || stDept.toLowerCase().includes('humanities') || stDept.includes('আর্টস');
  const isBusiness = stDept.includes('ব্যবসায়') || stDept.toLowerCase().includes('commerce') || stDept.includes('বাণিজ্য');
  const isScience = !isHumanities && !isBusiness;

  if (isScience && (subCode === '126' || subCode === '134')) {
    const explicit = (
      student.fourth_subject || 
      student.fourth_subject_code || 
      student.optional_subject || 
      student.optional_subject_name || 
      student.elective_subject || 
      ''
    ).toString().toLowerCase();

    if (explicit) {
      if (explicit.includes('134') || explicit.includes('কৃষি') || explicit.includes('agri')) {
        return subCode === '134';
      }
      if (explicit.includes('126') || explicit.includes('উচ্চতর') || explicit.includes('গণিত') || explicit.includes('higher') || explicit.includes('math')) {
        return subCode === '126';
      }
    }
  }

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
  { name_bn: 'অর্ধ-বার্ষিক পরীক্ষা', name_en: 'Half Yearly Examination', exam_type: 'সাময়িক পরীক্ষা' },
  { name_bn: '২য় সাময়িক পরীক্ষা', name_en: '2nd Terminal Examination', exam_type: 'সাময়িক পরীক্ষা' },
  { name_bn: 'প্রাক-নির্বাচনী পরীক্ষা', name_en: 'Pre-Test Examination', exam_type: 'নির্বাচনী পরীক্ষা' },
  { name_bn: 'নির্বাচনী পরীক্ষা', name_en: 'Test Examination', exam_type: 'নির্বাচনী পরীক্ষা' },
  { name_bn: 'বার্ষিক পরীক্ষা', name_en: 'Annual Examination', exam_type: 'চূড়ান্ত পরীক্ষা' },
  { name_bn: 'মডেল টেস্ট / ক্লাস টেস্ট', name_en: 'Model Test / Class Assessment', exam_type: 'সাময়িক পরীক্ষা' }
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
    if (s === 'failed_list' || s === 'failed') return 'failed_list';
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
  const [showBatchPrintDrawer, setShowBatchPrintDrawer] = useState(false);
  const [batchPrintMode, setBatchPrintMode] = useState('all'); // 'all' | 'range' | 'passed' | 'failed'
  const [batchRollFrom, setBatchRollFrom] = useState('');
  const [batchRollTo, setBatchRollTo] = useState('');
  const [failedFilterMode, setFailedFilterMode] = useState('all'); // 'all' | '1' | '2' | '3+'
  const [signatureLayout, setSignatureLayout] = useState('auto'); // 'auto' | 'both' | 'preparer' | 'guardian'

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
        const cleanList = examList.filter(Boolean);
        setExams(cleanList);
        
        let targetExam = null;
        try {
          const reqType = localStorage.getItem('magra_selected_exam_type');
          if (reqType === 'half_yearly') {
            targetExam = cleanList.find(e => (e.name_bn && e.name_bn.includes('অর্ধ')) || (e.exam_type && e.exam_type.includes('অর্ধ')));
          } else if (reqType === 'annual') {
            targetExam = cleanList.find(e => (e.name_bn && e.name_bn.includes('বার্ষিক')) || (e.exam_type && e.exam_type.includes('বার্ষিক')));
          } else if (reqType === 'pre_test') {
            targetExam = cleanList.find(e => (e.name_bn && e.name_bn.includes('প্রাক')) || (e.exam_type && e.exam_type.includes('প্রাক')));
          } else if (reqType === 'test') {
            targetExam = cleanList.find(e => ((e.name_bn && !e.name_bn.includes('প্রাক') && e.name_bn.includes('নির্বাচন')) || (e.name_en && e.name_en.toLowerCase().includes('test'))));
          }
          if (targetExam) {
            localStorage.removeItem('magra_selected_exam_type');
          }
        } catch(e){}

        if (targetExam) {
          setSelectedExam(targetExam.id);
        } else if (cleanList.length && !selectedExam) {
          setSelectedExam(cleanList[0].id);
        } else if (!cleanList.length) {
          setSelectedExam('');
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
    const valid = exams.filter(Boolean);
    if (examFilterYear === 'all') return valid;
    return valid.filter(e => String(e.academic_year) === String(examFilterYear));
  }, [exams, examFilterYear]);

  // Filtered exams for toolbar (All 2026 exams: Half-Yearly, Annual, Pre-Test, Test)
  const examsForSelectedYear = useMemo(() => {
    const valid = exams.filter(Boolean);
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

  // Auto-switch to Class 10 for SSC Test or Pre-Test exams
  useEffect(() => {
    if (selectedExam) {
      const ex = exams.find(e => String(e.id) === String(selectedExam));
      const bn = (ex?.name_bn || '').toLowerCase();
      const rem = (ex?.remarks || '').toLowerCase();
      const id = String(selectedExam).toLowerCase();
      if (id.includes('test') || id.includes('pre-test') || bn.includes('নির্বাচন') || rem.includes('১০ম') || rem.includes('ssc')) {
        if (className !== '10') {
          setClassName('10');
        }
      }
    }
  }, [selectedExam]);

  const selectedExamObj = useMemo(() => {
    return exams.find(e => String(e.id) === String(selectedExam));
  }, [exams, selectedExam]);

  // Smart determination of Exam Document Category (Academic Transcript vs Progress Report)
  const isProgressReportExam = useMemo(() => {
    const examName = (selectedExamObj?.name_bn || '').trim();
    const examType = (selectedExamObj?.exam_type || '').trim().toLowerCase();
    return (
      examName.includes('অর্ধ') || 
      examName.includes('প্রাক') || 
      examName.includes('সাময়িক') || 
      examName.includes('সাময়িক') || 
      examName.includes('টিউটোরিয়াল') || 
      examName.includes('টিউটোরিয়াল') || 
      examName.includes('মাসিক') ||
      examType.includes('half') ||
      examType.includes('mid') ||
      examType.includes('pre')
    );
  }, [selectedExamObj]);

  const isTranscriptExam = useMemo(() => {
    if (isProgressReportExam) return false;
    const examName = (selectedExamObj?.name_bn || '').trim();
    const examType = (selectedExamObj?.exam_type || '').trim().toLowerCase();
    return (
      examName.includes('বার্ষিক') ||
      examName.includes('নির্বাচন') ||
      examName.includes('টেস্ট') ||
      examName.includes('test') ||
      examName.includes('মডেল') ||
      examName.includes('সমাপনী') ||
      examType.includes('annual') ||
      examType.includes('final') ||
      true // Default to transcript if not explicitly a progress report exam
    );
  }, [isProgressReportExam, selectedExamObj]);

  // When 'auto': Progress Reports (অর্ধ-বার্ষিক, প্রাক-নির্বাচনী) automatically get BOTH (৪টি স্বাক্ষর: শ্রেণি শিক্ষক, প্রস্তুতকারী, অভিভাবক, প্রধান শিক্ষক)
  // Academic Transcripts (নির্বাচনী, বার্ষিক) get ৩টি স্বাক্ষর (শ্রেণি শিক্ষক, প্রস্তুতকারী, প্রধান শিক্ষক)
  const isFourSignatures = useMemo(() => {
    if (signatureLayout === 'both') return true;
    if (signatureLayout === 'preparer' || signatureLayout === 'guardian') return false;
    return isProgressReportExam;
  }, [signatureLayout, isProgressReportExam]);

  const activeCenterSig = useMemo(() => {
    if (signatureLayout === 'guardian') return 'অভিভাবকের স্বাক্ষর';
    return 'প্রস্তুতকারীর স্বাক্ষর';
  }, [signatureLayout]);

  const sigDotsText = useMemo(() => {
    return isFourSignatures ? '..............................' : '...........................................';
  }, [isFourSignatures]);

  const marksheetDocTitle = useMemo(() => {
    const examDisplayName = selectedExamObj ? selectedExamObj.name_bn : (isTranscriptExam ? 'নির্বাচনী পরীক্ষা' : 'অর্ধ-বার্ষিক পরীক্ষা');
    if (isTranscriptExam) {
      return `একাডেমিক ট্রান্সক্রিপ্ট / মার্কশিট (ACADEMIC TRANSCRIPT) — ${examDisplayName} ${toBnDigits(selectedYear)}`;
    }
    return `শিক্ষার্থীর প্রোগ্রেস রিপোর্ট (STUDENT PROGRESS REPORT) — ${examDisplayName} ${toBnDigits(selectedYear)}`;
  }, [selectedExamObj, isTranscriptExam, selectedYear]);

  const marksheetFooterDocType = useMemo(() => {
    return isTranscriptExam ? 'একাডেমিক ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট';
  }, [isTranscriptExam]);

  // Subjects applicable to current Class & Department
  const subjectsForClass = useMemo(() => {
    return subjects.filter(s => {
      if (s.class_name && String(s.class_name) !== String(className)) return false;
      if (!isSSC) return true;
      // In Humanities & Business Studies: 4th subject is always 134 (Agriculture Studies). Exclude 151 (Home Science).
      if (String(s.code) === '151') return false;
      // In Humanities: 140 is Civics & Citizenship, not taken in this school (group has 153 History, 110 Geography, 141 Economics)
      if (department && (department.includes('মানবিক') || department.includes('humanities')) && String(s.code) === '140') return false;
      if (department === 'all' || department === 'সকল বিভাগ') return true;
      return s.department === 'আবশ্যিক' || matchesStudentGroup({ department: s.department }, department);
    });
  }, [subjects, className, department, isSSC]);

  // Smart Columns for Tabulation Sheet:
  // 1. Merging Religion: [111] ইসলাম ও নৈতিক শিক্ষা and [112] হিন্দুধর্ম into single column "[111/112] ইসলাম ধর্ম / হিন্দু ধর্ম"
  // 2. Merging Science 4th Subject: [126] উচ্চতর গণিত and [134] কৃষি শিক্ষা into single column "[126/134] উচ্চতর গণিত / কৃষি শিক্ষা"
  const tabulationColumns = useMemo(() => {
    const cols = [];
    const processedCodes = new Set();

    const has111 = subjectsForClass.some(s => String(s.code) === '111');
    const has112 = subjectsForClass.some(s => String(s.code) === '112');
    const mergeReligion = has111 || has112;

    const has126 = subjectsForClass.some(s => String(s.code) === '126');
    const has134 = subjectsForClass.some(s => String(s.code) === '134');
    const mergeFourthSubject = has126 && has134;

    subjectsForClass.forEach(s => {
      const code = String(s.code);
      if (processedCodes.has(code)) return;

      // Religion group merge (111, 112, 113, 114)
      if (['111', '112', '113', '114'].includes(code) && mergeReligion) {
        if (!processedCodes.has('rel_merged')) {
          processedCodes.add('rel_merged');
          processedCodes.add('111');
          processedCodes.add('112');
          processedCodes.add('113');
          processedCodes.add('114');
          cols.push({
            isMerged: true,
            type: 'religion',
            code: '111/112',
            codes: ['111', '112', '113', '114'],
            name_bn: 'ইসলাম ধর্ম / হিন্দু ধর্ম',
            headerTitle: '[111/112] ইসলাম ধর্ম / হিন্দু ধর্ম',
            written_max: s.written_max || 70,
            mcq_max: s.mcq_max || 30,
            practical_max: s.practical_max || 0,
            full_marks: 100
          });
        }
        return;
      }

      // Science 4th subject merge (126 Higher Math & 134 Agriculture Studies)
      if ((code === '126' || code === '134') && mergeFourthSubject) {
        if (!processedCodes.has('fourth_merged')) {
          processedCodes.add('fourth_merged');
          processedCodes.add('126');
          processedCodes.add('134');
          cols.push({
            isMerged: true,
            type: 'fourth_subject',
            code: '126/134',
            codes: ['126', '134'],
            name_bn: 'উচ্চতর গণিত / কৃষি শিক্ষা',
            headerTitle: '[126/134] উচ্চতর গণিত / কৃষি শিক্ষা',
            written_max: 50,
            mcq_max: 25,
            practical_max: 25,
            full_marks: 100
          });
        }
        return;
      }

      // Regular single subject
      processedCodes.add(code);
      cols.push({
        isMerged: false,
        id: s.id,
        code: s.code,
        codes: [code],
        name_bn: s.name_bn,
        headerTitle: `[${s.code}] ${s.name_bn}`,
        written_max: s.written_max,
        mcq_max: s.mcq_max,
        practical_max: s.practical_max,
        full_marks: s.full_marks
      });
    });

    return cols;
  }, [subjectsForClass]);

  const getStudentMarkForColumn = (st, colDef) => {
    if (!st || !st.subjects || !st.subjects.length) return null;

    if (colDef.isMerged) {
      for (const c of colDef.codes) {
        const found = st.subjects.find(s => String(s.code) === String(c));
        if (found) return found;
      }
      if (colDef.type === 'religion') {
        const foundRel = st.subjects.find(s => 
          ['111', '112', '113', '114'].includes(String(s.code)) ||
          String(s.name_bn || '').includes('ধর্ম') ||
          String(s.name_bn || '').includes('ইসলাম') ||
          String(s.name_bn || '').includes('হিন্দু')
        );
        if (foundRel) return foundRel;
      }
      if (colDef.type === 'fourth_subject') {
        const found4th = st.subjects.find(s => 
          ['126', '134'].includes(String(s.code)) ||
          String(s.name_bn || '').includes('উচ্চতর') ||
          String(s.name_bn || '').includes('গণিত') ||
          String(s.name_bn || '').includes('কৃষি')
        );
        if (found4th) return found4th;
      }
      return null;
    }

    return st.subjects.find(s => 
      String(s.code) === String(colDef.code) || 
      (colDef.id && String(s.subject_id) === String(colDef.id))
    ) || null;
  };

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
    if (!tabulationColumns.length) {
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
      'Student_Name'
    ];

    tabulationColumns.forEach(col => {
      if (col.written_max > 0) headers.push(`${col.headerTitle} (CQ max ${col.written_max})`);
      if (col.mcq_max > 0) headers.push(`${col.headerTitle} (MCQ max ${col.mcq_max})`);
      if (col.practical_max > 0) headers.push(`${col.headerTitle} (Prac max ${col.practical_max})`);
      headers.push(`${col.headerTitle} (Total)`);
      headers.push(`${col.headerTitle} (Grade)`);
    });
    headers.push('Total_Marks', 'GPA', 'Grade', 'Result');

    const rawList = filteredProcessedResults.length ? filteredProcessedResults : students;
    const studentList = [...rawList].sort((a, b) => {
      const rA = Number(a.roll_no) || 0;
      const rB = Number(b.roll_no) || 0;
      if (rA !== rB) return rA - rB;
      return (a.student_id || '').localeCompare(b.student_id || '');
    });

    const rows = studentList.map((st) => {
      const row = [
        escapeCsv(st.roll_no !== undefined ? st.roll_no : ''),
        escapeCsv(st.name_bn || st.name_en || '')
      ];

      tabulationColumns.forEach(col => {
        const subResult = getStudentMarkForColumn(st, col);
        if (col.written_max > 0) row.push(escapeCsv(subResult?.written !== undefined && subResult?.written !== null ? subResult.written : ''));
        if (col.mcq_max > 0) row.push(escapeCsv(subResult?.mcq !== undefined && subResult?.mcq !== null ? subResult.mcq : ''));
        if (col.practical_max > 0) row.push(escapeCsv(subResult?.practical !== undefined && subResult?.practical !== null ? subResult.practical : ''));
        row.push(escapeCsv(subResult?.total !== undefined && subResult?.total !== null ? subResult.total : ''));
        row.push(escapeCsv(subResult?.letter_grade || ''));
      });

      row.push(
        escapeCsv(st.total_marks !== undefined ? st.total_marks : ''),
        escapeCsv(st.gpa !== undefined ? st.gpa : ''),
        escapeCsv(st.final_grade || ''),
        escapeCsv(st.result_status || (st.is_pass ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'))
      );

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

  // Dedicated Official Tabulation Sheet Print in Legal Landscape
  const handlePrintTabulationSheet = () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!filteredProcessedResults.length) {
      showNotification('ট্যাবুলেশন শিটে প্রদর্শনের মতো কোনো শিক্ষার্থীর ফলাফল নেই', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      window.print();
      return;
    }

    const examTitle = selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা';
    const deptTitle = isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
      ? `${department} বিভাগ`
      : 'সকল বিভাগ/শাখা';
    const totalStudents = filteredProcessedResults.length;
    const passedCount = filteredProcessedResults.filter(s => s.is_pass).length;
    const failedCount = totalStudents - passedCount;
    const gpa5Count = filteredProcessedResults.filter(s => Number(s.gpa) >= 5.0 && s.is_pass).length;
    const passPercentage = totalStudents ? ((passedCount / totalStudents) * 100).toFixed(1) : '0';

    const subjectsHtml = tabulationColumns.map(col => `
      <th colspan="4" class="sub-head-cell">
        ${col.headerTitle}
      </th>
    `).join('');

    const subColsHtml = tabulationColumns.map(() => `
      <th class="col-sub">CQ</th>
      <th class="col-sub">MCQ</th>
      <th class="col-sub">Prac</th>
      <th class="col-sub">মোট</th>
    `).join('');

    const printStudentList = [...filteredProcessedResults].sort((a, b) => {
      const rA = Number(a.roll_no) || 0;
      const rB = Number(b.roll_no) || 0;
      if (rA !== rB) return rA - rB;
      return (a.student_id || '').localeCompare(b.student_id || '');
    });

    const rowsHtml = printStudentList.map((st) => {
      const isPass = st.is_pass;
      const rollBn = toBnDigits(st.roll_no);
      const nameBn = st.name_bn || '—';

      const subjectCells = tabulationColumns.map(colDef => {
        const found = getStudentMarkForColumn(st, colDef);
        if (!found) {
          return `
            <td class="cell-muted">—</td>
            <td class="cell-muted">—</td>
            <td class="cell-muted">—</td>
            <td class="cell-muted">—</td>
          `;
        }
        const cq = found.written_max > 0 ? (found.written !== null && found.written !== undefined ? found.written : '—') : '—';
        const mcq = found.mcq_max > 0 ? (found.mcq !== null && found.mcq !== undefined ? found.mcq : '—') : '—';
        const prac = found.practical_max > 0 ? (found.practical !== null && found.practical !== undefined ? found.practical : '—') : '—';
        const tot = found.total !== null && found.total !== undefined ? found.total : '—';
        const grade = found.letter_grade || 'F';
        const passClass = found.is_pass ? 'cell-pass' : 'cell-fail';

        let tag = '';
        if (colDef.isMerged) {
          if (String(found.code) === '111') tag = '<br><span style="font-size:7px;color:#047857;font-weight:600;">ইসলাম</span>';
          else if (String(found.code) === '112') tag = '<br><span style="font-size:7px;color:#b45309;font-weight:600;">হিন্দু</span>';
          else if (String(found.code) === '126') tag = '<br><span style="font-size:7px;color:#1d4ed8;font-weight:600;">উ: গণিত</span>';
          else if (String(found.code) === '134') tag = '<br><span style="font-size:7px;color:#15803d;font-weight:600;">কৃষি</span>';
        }

        return `
          <td>${cq}</td>
          <td>${mcq}</td>
          <td>${prac}</td>
          <td class="${passClass}"><b>${tot}</b><br><small style="font-size:7.5px;">${grade}</small>${tag}</td>
        `;
      }).join('');

      const totalMarks = st.total_marks !== undefined ? st.total_marks : '—';
      const gpa = st.gpa !== undefined ? st.gpa : '0.00';
      const finalGrade = st.final_grade || 'F';
      const statusText = isPass ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
      const statusClass = isPass ? 'badge-pass' : 'badge-fail';

      return `
        <tr>
          <td><b>${rollBn}</b></td>
          <td style="text-align:left;white-space:nowrap;padding-left:4px;"><b>${nameBn}</b></td>
          ${subjectCells}
          <td><b>${totalMarks}</b></td>
          <td style="font-weight:700;color:${isPass ? '#065f46' : '#dc2626'};">${gpa}</td>
          <td><b>${finalGrade}</b></td>
          <td><span class="${statusClass}">${statusText}</span></td>
        </tr>
      `;
    }).join('');

    const content = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>ট্যাবুলেশন_শিট_${className}_${deptTitle}_${selectedYear}.pdf</title>
  <style>
    @page {
      size: legal landscape;
      margin: 5mm 6mm 6mm 6mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'SolaimanLipi', Arial, 'Noto Sans Bengali', sans-serif;
      margin: 0;
      padding: 4px;
      color: #0f172a;
      background: #ffffff;
      font-size: 8.5px;
      line-height: 1.15;
    }
    .no-print-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #064e3b;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .btn-action {
      background: #ffffff;
      color: #064e3b;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-action:hover { background: #e2e8f0; }
    @media print {
      .no-print-bar { display: none !important; }
      body { margin: 0; padding: 0; }
    }

    /* Header */
    .sheet-header {
      text-align: center;
      border-bottom: 2px solid #064e3b;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .school-title {
      font-size: 18px;
      font-weight: 900;
      color: #064e3b;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
    }
    .school-address {
      font-size: 10px;
      color: #334155;
      margin: 0 0 3px 0;
    }
    .sheet-title-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1.5px solid #065f46;
      color: #064e3b;
      padding: 2px 14px;
      border-radius: 4px;
      font-size: 12.5px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .meta-line {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      font-weight: 700;
      color: #1e293b;
      padding: 2px 4px;
    }

    /* Table Matrix */
    table.tab-matrix {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      margin-top: 4px;
    }
    table.tab-matrix th, table.tab-matrix td {
      border: 1px solid #334155;
      padding: 2px 1px;
      text-align: center;
      font-size: 8px;
    }
    table.tab-matrix th {
      background: #e2e8f0;
      color: #0f172a;
      font-weight: 700;
    }
    .sub-head-cell {
      background: #cbd5e1 !important;
      font-size: 8.5px;
      padding: 3px 1px;
    }
    .col-sub {
      width: 20px;
      font-size: 7.5px;
    }
    .cell-pass {
      color: #065f46;
      font-weight: 700;
      background: #f0fdf4;
    }
    .cell-fail {
      color: #b91c1c;
      font-weight: 800;
      background: #fee2e2 !important;
    }
    .cell-muted {
      color: #94a3b8;
    }
    .badge-pass {
      display: inline-block;
      padding: 1px 3px;
      background: #dcfce7;
      color: #15803d;
      border-radius: 2px;
      font-weight: 700;
      font-size: 7.5px;
    }
    .badge-fail {
      display: inline-block;
      padding: 1px 3px;
      background: #fee2e2;
      color: #b91c1c;
      border-radius: 2px;
      font-weight: 700;
      font-size: 7.5px;
    }

    /* Signatures */
    .signatures-grid {
      margin-top: 32px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
      text-align: center;
      font-size: 9px;
      page-break-inside: avoid;
    }
    .signature-item {
      border-top: 1px dashed #334155;
      padding-top: 4px;
      font-weight: 700;
      color: #0f172a;
    }
    .sheet-footer-line {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #64748b;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <b>📄 মাস্টার ট্যাবুলেশন শিট — Legal Landscape প্রিন্ট ও PDF প্রিভিউ</b>
      <span style="font-size:11px;opacity:0.9;margin-left:10px;">(📌 PDF হিসেবে সংরক্ষণ করতে Destination-এ <b>"Save as PDF"</b> এবং Paper Size: <b>Legal Landscape</b> নির্বাচন করুন)</span>
    </div>
    <div style="display:flex;gap:8px;">
      <button type="button" class="btn-action" style="background:#0284c7;color:#fff;" onclick="window.print()">📥 PDF ডাউনলোড / সেভ করুন</button>
      <button type="button" class="btn-action" style="background:#059669;color:#fff;" onclick="window.print()">🖨️ প্রিন্ট করুন</button>
      <button type="button" class="btn-action" onclick="window.close()" style="background:#e2e8f0;color:#0f172a;">✕ বন্ধ করুন</button>
    </div>
  </div>

  <div class="sheet-header">
    <div class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
    <div class="school-sub">ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৪৬ • EIIN: 114290</div>
    <div class="sheet-title-badge">মাস্টার ট্যাবুলেশন শিট — ${examTitle}</div>
    <div class="meta-line">
      <span><b>শিক্ষাবর্ষ:</b> ${toBnDigits(selectedYear)}</span>
      <span><b>শ্রেণি:</b> শ্রেণি ${toBnDigits(className)}</span>
      <span><b>বিভাগ/শাখা:</b> ${deptTitle}</span>
      <span><b>মোট পরীক্ষার্থী:</b> ${toBnDigits(totalStudents)} জন</span>
      <span><b>উত্তীর্ণ:</b> <span style="color:#059669">${toBnDigits(passedCount)} জন (${toBnDigits(passPercentage)}%)</span></span>
      <span><b>অনুত্তীর্ণ:</b> <span style="color:#dc2626">${toBnDigits(failedCount)} জন</span></span>
      <span><b>GPA-5:</b> <span style="color:#d97706">${toBnDigits(gpa5Count)} জন</span></span>
    </div>
  </div>

  <table class="tab-matrix">
    <thead>
      <tr>
        <th rowspan="2" style="width:36px;">রোল</th>
        <th rowspan="2" style="width:145px;text-align:left;padding-left:6px;">শিক্ষার্থীর নাম</th>
        ${subjectsHtml}
        <th rowspan="2" style="width:38px;">সর্বমোট</th>
        <th rowspan="2" style="width:32px;">GPA</th>
        <th rowspan="2" style="width:28px;">গ্রেড</th>
        <th rowspan="2" style="width:40px;">ফলাফল</th>
      </tr>
      <tr>
        ${subColsHtml}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signatures-grid">
    <div>
      <br><br>
      <div class="signature-item">প্রস্তুতকারীর স্বাক্ষর</div>
    </div>
    <div>
      <br><br>
      <div class="signature-item">যাচাইকারীর স্বাক্ষর</div>
    </div>
    <div>
      <br><br>
      <div class="signature-item">শ্রেণি শিক্ষকের স্বাক্ষর</div>
    </div>
    <div>
      <br><br>
      <div class="signature-item">প্রধান শিক্ষকের স্বাক্ষর ও সীল</div>
    </div>
  </div>

  <div class="sheet-footer-line">
    <span>সফটওয়্যার প্রস্তুতকারক: মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয় ডিজিটাল ম্যানেজমেন্ট সিস্টেম • প্রিন্টের তারিখ ও সময়: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    <span>পৃষ্ঠা সাইজ: Legal (8.5 × 14 ইঞ্চি) Landscape</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Dedicated Official Print for Department-wise Failed Students List
  const handlePrintFailedList = () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!failedStudentsList.length) {
      showNotification('নির্বাচিত বিভাগ/শ্রেণিতে কোনো অকৃতকার্য শিক্ষার্থী নেই', 'info');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      window.print();
      return;
    }

    const examTitle = selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা';
    const deptTitle = isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
      ? `${department} বিভাগ`
      : 'সকল বিভাগ/শাখা';
    const totalStudents = filteredProcessedResults.length;
    const failedCount = failedStudentsList.length;
    const failPercentage = totalStudents ? ((failedCount / totalStudents) * 100).toFixed(1) : '0';

    const fail1Count = failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 1) === 1).length;
    const fail2Count = failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 0) === 2).length;
    const fail3PlusCount = failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 0) >= 3).length;

    const rowsHtml = failedStudentsList.map((st, idx) => {
      const slBn = toBnDigits(idx + 1);
      const rollBn = toBnDigits(st.roll_no);
      const nameBn = st.name_bn || '—';
      const studentId = st.student_id || '—';
      const deptBn = st.department || 'সাধারণ';
      const phone = st.student?.guardian_phone || st.student?.phone || st.guardian_phone || '—';
      const totalMarks = st.total_marks !== undefined ? st.total_marks : '—';
      const gpa = st.gpa !== undefined ? st.gpa : '0.00';
      const fails = getStudentFailedSubjectsSummary(st);
      const failCountBn = toBnDigits(fails.length || st.failed_count || 1);
      const failSubsText = fails.length
        ? fails.map(f => `<b>${f.name}</b>` + (f.total !== '' ? ` (প্রাপ্ত: ${f.total})` : '') + (f.reason ? ` <small>[${f.reason}]</small>` : '')).join('<br>')
        : (st.failed_subjects && st.failed_subjects.length ? st.failed_subjects.join(', ') : 'সকল বিষয়');

      return `
        <tr>
          <td style="text-align:center;">${slBn}</td>
          <td style="text-align:center;"><b>${rollBn}</b></td>
          <td style="text-align:center;font-size:10px;">${studentId}</td>
          <td style="text-align:left;padding-left:6px;"><b>${nameBn}</b></td>
          <td style="text-align:center;">${deptBn}</td>
          <td style="text-align:center;"><span class="badge-fail-count">${failCountBn}টি</span></td>
          <td style="text-align:left;padding-left:6px;font-size:10px;line-height:1.4;">${failSubsText}</td>
          <td style="text-align:center;"><b>${totalMarks}</b></td>
          <td style="text-align:center;color:#dc2626;font-weight:700;">${gpa}</td>
          <td style="text-align:center;font-size:10.5px;">${phone}</td>
          <td style="min-width:65px;">&nbsp;</td>
        </tr>
      `;
    }).join('');

    const content = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>অকৃতকার্য_তালিকা_${className}_${deptTitle}_${selectedYear}.pdf</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'SolaimanLipi', 'Kalpurush', 'Nikosh', 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #fff;
      font-size: 11px;
    }
    .print-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    .transcript-official-header {
      text-align: center;
      margin-bottom: 6px;
    }
    .transcript-school-name {
      font-size: 24px;
      font-weight: 900;
      color: #0b8050;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
      line-height: 1.15;
    }
    .transcript-school-line {
      font-size: 12px;
      color: #334155;
      font-weight: 600;
      line-height: 1.35;
      margin: 0;
    }
    .transcript-school-eiin {
      font-size: 11.5px;
      color: #0f172a;
      font-weight: 700;
      line-height: 1.35;
      margin: 0;
    }
    .marksheet-exam-title-badge {
      text-align: center;
      margin: 6px 0 10px 0;
    }
    .marksheet-exam-title-badge span {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      padding: 4px 22px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 11px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .stats-bar {
      display: flex;
      justify-content: space-around;
      background: #fff1f2;
      border: 1px dashed #f43f5e;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10.5px;
      margin-bottom: 10px;
      color: #9f1239;
      font-weight: 600;
    }
    .failed-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 20px;
    }
    .failed-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      border: 1px solid #64748b;
      padding: 5px 4px;
      text-align: center;
    }
    .failed-table td {
      border: 1px solid #94a3b8;
      padding: 4px 4px;
      vertical-align: middle;
    }
    .badge-fail-count {
      display: inline-block;
      background: #dc2626;
      color: #fff;
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .signatures-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 35px;
      padding: 0 15px;
      page-break-inside: avoid;
    }
    .sig-col {
      text-align: center;
      width: 28%;
    }
    .sig-dots {
      border-top: 1px dashed #64748b;
      margin-bottom: 4px;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #fff;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 12px;
    }
    .no-print-bar .btn-action {
      border: none;
      padding: 6px 14px;
      border-radius: 5px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    @media print {
      body { margin: 0; padding: 0; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .no-print { display: none !important; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <b>⚠️ অকৃতকার্য শিক্ষার্থীর তালিকা — PDF ও প্রিন্ট প্রিভিউ</b>
      <span style="font-size:11px;opacity:0.9;margin-left:10px;">(📌 PDF ডাউনলোড করতে Destination-এ <b>"Save as PDF"</b> নির্বাচন করুন)</span>
    </div>
    <div style="display:flex;gap:8px;">
      <button type="button" class="btn-action" style="background:#0284c7;color:#fff;" onclick="window.print()">📥 PDF ডাউনলোড / সেভ করুন</button>
      <button type="button" class="btn-action" style="background:#b91c1c;color:#fff;" onclick="window.print()">🖨️ প্রিন্ট করুন</button>
      <button type="button" class="btn-action" onclick="window.close()" style="background:#e2e8f0;color:#0f172a;">✕ বন্ধ করুন</button>
    </div>
  </div>
  <div class="print-container">
    <div class="transcript-official-header">
      <h1 class="transcript-school-name">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
      <div class="transcript-school-line">ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল</div>
      <div class="transcript-school-line">স্থাপিত: ১৯৪৬</div>
      <div class="transcript-school-eiin">EIIN: 114290</div>
    </div>

    <div class="marksheet-exam-title-badge">
      <span>⚠️ অকৃতকার্য শিক্ষার্থীদের তালিকা ও প্রতিকারমূলক মূল্যায়ন খতিয়ান</span>
    </div>

    <div class="meta-bar">
      <span><b>শিক্ষাবর্ষ:</b> ${toBnDigits(selectedYear)}</span>
      <span><b>শ্রেণি:</b> ${toBnDigits(className)}</span>
      <span><b>বিভাগ/শাখা:</b> ${deptTitle}</span>
      <span><b>পরীক্ষা:</b> ${examTitle}</span>
      <span><b>তারিখ:</b> ${toBnDigits(new Date().toLocaleDateString('bn-BD'))}</span>
    </div>

    <div class="stats-bar">
      <span>মোট পরীক্ষার্থী: <b>${toBnDigits(totalStudents)} জন</b></span>
      <span>মোট অকৃতকার্য: <b style="color:#b91c1c;">${toBnDigits(failedCount)} জন</b></span>
      <span>অকৃতকার্যের হার: <b>${toBnDigits(failPercentage)}%</b></span>
      <span>১ বিষয়ে ফেল: <b>${toBnDigits(fail1Count)} জন</b></span>
      <span>২ বিষয়ে ফেল: <b>${toBnDigits(fail2Count)} জন</b></span>
      <span>৩ বা ততোধিক বিষয়ে ফেল: <b>${toBnDigits(fail3PlusCount)} জন</b></span>
    </div>

    <table class="failed-table">
      <thead>
        <tr>
          <th style="width:30px;">ক্র.</th>
          <th style="width:38px;">রোল</th>
          <th style="width:65px;">আইডি</th>
          <th style="width:130px;text-align:left;padding-left:6px;">শিক্ষার্থীর নাম</th>
          <th style="width:70px;">বিভাগ/গ্রুপ</th>
          <th style="width:50px;">ফেল সংখ্যা</th>
          <th style="min-width:160px;text-align:left;padding-left:6px;">অকৃতকার্য বিষয়ের বিবরণ ও নম্বর</th>
          <th style="width:45px;">মোট নম্বর</th>
          <th style="width:35px;">GPA</th>
          <th style="width:75px;">অভিভাবকের ফোন</th>
          <th style="width:65px;">মন্তব্য/স্বাক্ষর</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="signatures-grid">
      <div class="sig-col">
        <div class="sig-dots"></div>
        <div class="sig-title">শ্রেণি শিক্ষকের স্বাক্ষর</div>
      </div>
      <div class="sig-col">
        <div class="sig-dots"></div>
        <div class="sig-title">পরীক্ষা কমিটির আহ্বায়কের স্বাক্ষর</div>
      </div>
      <div class="sig-col">
        <div class="sig-dots"></div>
        <div class="sig-title">প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Download Failed Students CSV
  const handleDownloadFailedCsv = () => {
    if (!failedStudentsList.length) {
      showNotification('ডাউনলোড করার মতো কোনো অকৃতকার্য শিক্ষার্থী নেই', 'info');
      return;
    }
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const headers = ['SL', 'Roll', 'Student_ID', 'Student_Name', 'Department', 'Failed_Count', 'Failed_Subjects', 'Total_Marks', 'GPA', 'Grade', 'Guardian_Phone'];
    const rows = failedStudentsList.map((st, idx) => {
      const fails = getStudentFailedSubjectsSummary(st);
      const failSubsText = fails.length
        ? fails.map(f => `${f.name}${f.total !== '' ? ` (${f.total})` : ''}`).join('; ')
        : (st.failed_subjects || []).join('; ');
      return [
        idx + 1,
        escapeCsv(st.roll_no),
        escapeCsv(st.student_id),
        escapeCsv(st.name_bn || st.name_en),
        escapeCsv(st.department || 'সাধারণ'),
        escapeCsv(fails.length || st.failed_count || 1),
        escapeCsv(failSubsText),
        escapeCsv(st.total_marks),
        escapeCsv(st.gpa),
        escapeCsv(st.final_grade || 'F'),
        escapeCsv(st.student?.guardian_phone || st.student?.phone || st.guardian_phone || '')
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeDept = (department && department !== 'all' && department !== 'সকল বিভাগ') ? department : 'All_Dept';
    link.setAttribute('download', `failed_students_${className}_${safeDept}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('অকৃতকার্য শিক্ষার্থীদের তালিকা CSV সফলভাবে ডাউনলোড হয়েছে! ✓', 'success');
  };

  // Dedicated Official Print and PDF for Merit List
  const handlePrintMeritList = () => {
    if (!selectedExam) {
      showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }
    if (!filteredProcessedResults.length) {
      showNotification('মেধা তালিকায় প্রদর্শনের মতো কোনো শিক্ষার্থীর ফলাফল নেই', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      window.print();
      return;
    }

    const examTitle = selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা';
    const deptTitle = isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
      ? `${department} বিভাগ`
      : 'সকল বিভাগ/শাখা';
    const totalStudents = filteredProcessedResults.length;
    const passedCount = filteredProcessedResults.filter(s => s.is_pass).length;
    const failedCount = totalStudents - passedCount;
    const gpa5Count = filteredProcessedResults.filter(s => Number(s.gpa) >= 5.0 && s.is_pass).length;
    const passPercentage = totalStudents ? ((passedCount / totalStudents) * 100).toFixed(1) : '0';

    const rowsHtml = filteredProcessedResults.map((x) => {
      const mRank = x.display_merit || x.dept_merit || x.merit;
      const mRankBn = toBnDigits(mRank);
      const rollBn = toBnDigits(x.roll_no || '—');
      const studentId = x.student_id || '—';
      const nameBn = x.name_bn || '—';
      const deptBn = x.department || 'সাধারণ';
      const totalMarks = x.total_marks !== undefined ? x.total_marks : '—';
      const pct = x.percentage !== undefined ? `${x.percentage}%` : '—';
      const gpa = x.gpa !== undefined ? x.gpa : '0.00';
      const grade = x.final_grade || 'F';
      const statusText = x.result_status || (x.is_pass ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ');
      const failsText = x.failed_subjects && x.failed_subjects.length > 0 ? x.failed_subjects.join(', ') : 'সব পাস';
      const rankBadgeClass = mRank === 1 ? 'rank-gold' : mRank === 2 ? 'rank-silver' : mRank === 3 ? 'rank-bronze' : '';

      return `
        <tr>
          <td style="text-align:center;"><b class="rank-badge ${rankBadgeClass}">${mRankBn}</b></td>
          <td style="text-align:center;"><b>${rollBn}</b></td>
          <td style="text-align:center;font-size:10px;">${studentId}</td>
          <td style="text-align:left;padding-left:6px;"><b>${nameBn}</b></td>
          <td style="text-align:center;">${deptBn}</td>
          <td style="text-align:center;"><b>${totalMarks}</b></td>
          <td style="text-align:center;">${pct}</td>
          <td style="text-align:center;font-weight:700;color:${x.is_pass ? '#047857' : '#dc2626'};">${gpa}</td>
          <td style="text-align:center;"><b>${grade}</b></td>
          <td style="text-align:center;"><span class="${x.is_pass ? 'badge-pass' : 'badge-fail'}">${statusText}</span></td>
          <td style="text-align:left;padding-left:6px;font-size:10px;color:${x.is_pass ? '#475569' : '#dc2626'};">${failsText}</td>
        </tr>
      `;
    }).join('');

    const content = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>মেধা_তালিকা_${className}_${deptTitle}_${selectedYear}.pdf</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'SolaimanLipi', 'Kalpurush', 'Nikosh', 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #fff;
      font-size: 11px;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #fff;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 12px;
    }
    .no-print-bar .btn-action {
      border: none;
      padding: 6px 14px;
      border-radius: 5px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .transcript-official-header {
      text-align: center;
      margin-bottom: 6px;
    }
    .transcript-school-name {
      font-size: 24px;
      font-weight: 900;
      color: #0b8050;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
      line-height: 1.15;
    }
    .transcript-school-line {
      font-size: 12px;
      color: #334155;
      font-weight: 600;
      line-height: 1.35;
      margin: 0;
    }
    .transcript-school-eiin {
      font-size: 11.5px;
      color: #0f172a;
      font-weight: 700;
      line-height: 1.35;
      margin: 0;
    }
    .marksheet-exam-title-badge {
      text-align: center;
      margin: 6px 0 10px 0;
    }
    .marksheet-exam-title-badge span {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      padding: 4px 22px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 11px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .stats-bar {
      display: flex;
      justify-content: space-around;
      background: #f1f5f9;
      border: 1px dashed #64748b;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10.5px;
      margin-bottom: 10px;
      color: #1e293b;
      font-weight: 600;
    }
    .merit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 20px;
    }
    .merit-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      border: 1px solid #64748b;
      padding: 5px 4px;
      text-align: center;
    }
    .merit-table td {
      border: 1px solid #94a3b8;
      padding: 4px 4px;
      vertical-align: middle;
    }
    .rank-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 11px;
    }
    .rank-gold { background: #fef08a; color: #854d0e; border: 1px solid #eab308; }
    .rank-silver { background: #e2e8f0; color: #334155; border: 1px solid #94a3b8; }
    .rank-bronze { background: #ffedd5; color: #9a3412; border: 1px solid #f97316; }
    .badge-pass { color: #047857; font-weight: 700; }
    .badge-fail { color: #dc2626; font-weight: 700; }
    .signatures-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 35px;
      padding: 0 15px;
      page-break-inside: avoid;
    }
    .sig-col {
      text-align: center;
      width: 28%;
    }
    .sig-dots {
      border-top: 1px dashed #64748b;
      margin-bottom: 4px;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }
    @media print {
      body { margin: 0; padding: 0; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .no-print { display: none !important; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <b>🏆 মেধা তালিকা ও ফলাফল বিবরণী — PDF ও প্রিন্ট প্রিভিউ</b>
      <span style="font-size:11px;opacity:0.9;margin-left:10px;">(📌 PDF ডাউনলোড করতে Destination-এ <b>"Save as PDF"</b> নির্বাচন করুন)</span>
    </div>
    <div style="display:flex;gap:8px;">
      <button type="button" class="btn-action" style="background:#0284c7;color:#fff;" onclick="window.print()">📥 PDF ডাউনলোড / সেভ করুন</button>
      <button type="button" class="btn-action" style="background:#059669;color:#fff;" onclick="window.print()">🖨️ প্রিন্ট করুন</button>
      <button type="button" class="btn-action" onclick="window.close()" style="background:#e2e8f0;color:#0f172a;">✕ বন্ধ করুন</button>
    </div>
  </div>

  <div class="print-container">
    <div class="transcript-official-header">
      <h1 class="transcript-school-name">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
      <div class="transcript-school-line">ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল</div>
      <div class="transcript-school-line">স্থাপিত: ১৯৪৬</div>
      <div class="transcript-school-eiin">EIIN: 114290</div>
    </div>

    <div class="marksheet-exam-title-badge">
      <span>🏆 চূড়ান্ত মেধা ও ফলাফল বিবরণী — ${examTitle}</span>
    </div>

    <div class="meta-bar">
      <span><b>শিক্ষাবর্ষ:</b> ${toBnDigits(selectedYear)}</span>
      <span><b>শ্রেণি:</b> শ্রেণি ${toBnDigits(className)}</span>
      <span><b>বিভাগ/শাখা:</b> ${deptTitle}</span>
      <span><b>পরীক্ষা:</b> ${examTitle}</span>
      <span><b>তারিখ:</b> ${toBnDigits(new Date().toLocaleDateString('bn-BD'))}</span>
    </div>

    <div class="stats-bar">
      <span>মোট পরীক্ষার্থী: <b>${toBnDigits(totalStudents)} জন</b></span>
      <span>উত্তীর্ণ: <b style="color:#047857;">${toBnDigits(passedCount)} জন (${toBnDigits(passPercentage)}%)</b></span>
      <span>অনুত্তীর্ণ: <b style="color:#dc2626;">${toBnDigits(failedCount)} জন</b></span>
      <span>GPA-5.0: <b style="color:#d97706;">${toBnDigits(gpa5Count)} জন</b></span>
    </div>

    <table class="merit-table">
      <thead>
        <tr>
          <th style="width:50px;">মেধা স্থান</th>
          <th style="width:40px;">রোল</th>
          <th style="width:65px;">আইডি</th>
          <th style="width:140px;text-align:left;padding-left:6px;">শিক্ষার্থীর নাম</th>
          <th style="width:70px;">বিভাগ/গ্রুপ</th>
          <th style="width:50px;">মোট নম্বর</th>
          <th style="width:45px;">শতকরা</th>
          <th style="width:38px;">GPA</th>
          <th style="width:35px;">গ্রেড</th>
          <th style="width:55px;">ফলাফল</th>
          <th style="min-width:130px;text-align:left;padding-left:6px;">অকৃতকার্য বিষয়</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="signatures-grid">
      <div class="sig-col">
        <div class="sig-dots"></div>
        <div class="sig-title">শ্রেণি শিক্ষকের স্বাক্ষর</div>
      </div>
      <div class="sig-col">
        <div class="sig-dots"></div>
        <div class="sig-title">পরীক্ষা কমিটির আহ্বায়কের স্বাক্ষর</div>
      </div>
      <div class="sig-col">
        <div class="sig-dots"></div>
        <div class="sig-title">প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Download Merit List CSV
  const handleDownloadMeritCsv = () => {
    if (!filteredProcessedResults.length) {
      showNotification('ডাউনলোড করার মতো কোনো মেধা তালিকা নেই', 'info');
      return;
    }
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const headers = ['Merit_Rank', 'Roll', 'Student_ID', 'Student_Name', 'Department', 'Total_Marks', 'Percentage', 'GPA', 'Grade', 'Result', 'Failed_Subjects'];
    const rows = filteredProcessedResults.map((st) => {
      const mRank = st.display_merit || st.dept_merit || st.merit || '';
      return [
        escapeCsv(mRank),
        escapeCsv(st.roll_no),
        escapeCsv(st.student_id),
        escapeCsv(st.name_bn || st.name_en),
        escapeCsv(st.department || 'সাধারণ'),
        escapeCsv(st.total_marks),
        escapeCsv(st.percentage),
        escapeCsv(st.gpa),
        escapeCsv(st.final_grade || 'F'),
        escapeCsv(st.result_status || ''),
        escapeCsv((st.failed_subjects || []).join('; '))
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeDept = (department && department !== 'all' && department !== 'সকল বিভাগ') ? department : 'All_Dept';
    link.setAttribute('download', `merit_list_${className}_${safeDept}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('মেধা তালিকা CSV সফলভাবে ডাউনলোড হয়েছে! ✓', 'success');
  };

  // CSV Upload (Import Marks - Smart Multi-Subject & Single-Subject Parser)
  const handleUploadMarksCsv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const rawText = await file.text();
      const text = rawText.replace(/^\uFEFF/, '');
      const matrix = parseCsvText(text);

      if (matrix.length < 2) {
        showNotification('CSV ফাইলে কোনো ডেটা পাওয়া যায়নি। সঠিক ফাইল নির্বাচন করুন।', 'error');
        return;
      }

      const rawHeaders = matrix[0].map(h => (h || '').trim());
      const normBn = (str) => (str || '')
        .toLowerCase()
        .replace(/[\u09AF][\u09BC]/g, '\u09DF')
        .replace(/[\u09DF]/g, 'য়')
        .replace(/[\u09A1][\u09BC]/g, '\u09DC')
        .replace(/[\u09A2][\u09BC]/g, '\u09DD')
        .replace(/ী/g, 'ি')
        .replace(/[\s_\-\/\(\)\.]+/g, '');
      const cleanHeaders = rawHeaders.map(h => normBn(h));

      const findHeaderIdx = (aliases) => {
        return cleanHeaders.findIndex(h => aliases.some(alias => {
          const normAlias = normBn(alias);
          return h.includes(normAlias) || (normAlias.length >= 4 && normAlias.includes(h));
        }));
      };

      const rollIdx = findHeaderIdx(['roll', 'রোল', 'ক্লাসরোল', 'rollno', 'roll_no']);
      const idIdx = findHeaderIdx(['studentid', 'student_id', 'আইডি', 'স্টুডেন্টআইডি', 'id']);
      const nameIdx = findHeaderIdx(['studentname', 'name', 'নাম', 'শিক্ষার্থীরনাম', 'student_name']);
      const deptIdx = findHeaderIdx(['department', 'dept', 'বিভাগ', 'শাখা', 'গ্রুপ', 'group']);
      const examNameIdx = findHeaderIdx(['examname', 'exam_name', 'পরীক্ষা', 'পরীক্ষারনাম', 'exam']);
      const absentIdx = findHeaderIdx(['absent', 'অনুপস্থিত', 'abs']);
      const remarksIdx = findHeaderIdx(['remarks', 'মন্তব্য', 'remark']);

      if (rollIdx === -1 && idIdx === -1) {
        showNotification('CSV ফাইলে Roll বা Student ID কলাম পাওয়া যায়নি। অনুগ্রহ করে ডাউনলোড করা টেমপ্লেট ব্যবহার করুন।', 'error');
        return;
      }

      // 1. Smart Class Detection: Check filename, row IDs, codes, or selected exam
      const fname = (file.name || '').toLowerCase();
      const isClass10InFile = fname.includes('class_10') || fname.includes('class10') || fname.includes('১০ম') || fname.includes('ssc');
      const isClass10InRows = matrix.slice(1, 15).some(row => {
        const id = (idIdx !== -1 && row[idIdx] ? row[idIdx] : '').toLowerCase();
        const code = row[5] ? String(row[5]).trim() : '';
        return id.includes('-10-') || ['102', '136', '137', '138', '126', '150', '134', '140', '141', '142', '143', '146', '147', '152'].includes(code);
      });
      const isSscExam = String(selectedExam).toLowerCase().includes('test') ||
                        (selectedExamObj?.name_bn || '').includes('নির্বাচন') ||
                        (selectedExamObj?.remarks || '').includes('১০ম') ||
                        cleanHeaders.some(h => ['136', '137', '138', '126', 'পদার্থ', 'রসায়ন', 'রসায়ন', 'জীববিজ্ঞান', 'উচ্চতর'].some(sub => h.includes(sub)));

      let effectiveClass = className;
      if (isClass10InFile || isClass10InRows || isSscExam) {
        effectiveClass = '10';
        if (className !== '10') {
          setClassName('10');
        }
      }

      // 2. Exam ID: Use selectedExam from toolbar if set, or auto-detect from CSV if not selected
      let effectiveExamId = selectedExam;
      if (!effectiveExamId) {
        let csvExamName = '';
        if (examNameIdx !== -1 && matrix[1] && matrix[1][examNameIdx]) {
          csvExamName = matrix[1][examNameIdx].trim();
        }
        if (csvExamName) {
          const isPre = csvExamName.includes('প্রাক');
          const matchedEx = exams.find(e => {
            if (!e) return false;
            const bn = e.name_bn || '';
            if (isPre) return bn.includes('প্রাক');
            return !bn.includes('প্রাক') && (bn === csvExamName || bn.includes(csvExamName) || csvExamName.includes(bn));
          });
          if (matchedEx) {
            effectiveExamId = matchedEx.id;
            setSelectedExam(matchedEx.id);
          }
        }
        if (!effectiveExamId && exams.length > 0) {
          effectiveExamId = exams[0].id;
          setSelectedExam(effectiveExamId);
        }
      }

      // 3. Smart Department Detection from CSV rows
      let effectiveDept = department;
      if (deptIdx !== -1 && matrix[1] && matrix[1][deptIdx]) {
        const rawDept = matrix[1][deptIdx].trim().toLowerCase();
        if (rawDept.includes('বিজ্ঞান') || rawDept.includes('sci')) {
          effectiveDept = 'বিজ্ঞান';
          if (department !== 'বিজ্ঞান') setDepartment('বিজ্ঞান');
        } else if (rawDept.includes('মানবিক') || rawDept.includes('hum') || rawDept.includes('arts')) {
          effectiveDept = 'মানবিক';
          if (department !== 'মানবিক') setDepartment('মানবিক');
        } else if (rawDept.includes('ব্যবসায়') || rawDept.includes('com') || rawDept.includes('business')) {
          effectiveDept = 'ব্যবসায় শিক্ষা';
          if (department !== 'ব্যবসায় শিক্ষা') setDepartment('ব্যবসায় শিক্ষা');
        }
      }

      // Always load the complete student roster for effectiveClass to ensure 100% match rate
      let allClassStudents = [];
      try {
        const fetchedSt = await api('/students?class_name=' + effectiveClass);
        if (Array.isArray(fetchedSt) && fetchedSt.length) {
          allClassStudents = fetchedSt;
        }
      } catch (_) {}
      if (!allClassStudents.length) {
        allClassStudents = Array.isArray(students) && students.length ? students : [];
      }

      // Filter subjects for current class
      const classSubjects = subjects.filter(s => !s.class_name || String(s.class_name) === String(effectiveClass));

      // Build robust student lookup map
      const studentLookup = new Map();
      allClassStudents.forEach(st => {
        if (st.id) studentLookup.set(`id:${st.id.toLowerCase()}`, st);
        if (st.student_id) studentLookup.set(`id:${st.student_id.toLowerCase()}`, st);
        if (st.student_code) studentLookup.set(`id:${st.student_code.toLowerCase()}`, st);

        if (st.name_bn) {
          studentLookup.set(`name:${st.name_bn.trim().toLowerCase()}`, st);
          studentLookup.set(`name_clean:${st.name_bn.replace(/\s+/g, '').toLowerCase()}`, st);
        }
        if (st.name_en) {
          studentLookup.set(`name:${st.name_en.trim().toLowerCase()}`, st);
          studentLookup.set(`name_clean:${st.name_en.replace(/\s+/g, '').toLowerCase()}`, st);
        }

        if (st.roll_no !== undefined && st.roll_no !== null) {
          const r = String(st.roll_no).trim();
          const dept = (st.department || st.group_name || st.group || st.section || '').toLowerCase();
          if (dept) {
            studentLookup.set(`dept_roll:${dept}_${r}`, st);
            if (dept.includes('বিজ্ঞান') || dept.includes('sci')) {
              studentLookup.set(`dept_roll:বিজ্ঞান_${r}`, st);
              studentLookup.set(`dept_roll:বিজ্ঞান বিভাগ_${r}`, st);
              studentLookup.set(`dept_roll:science_${r}`, st);
              studentLookup.set(`dept_roll:sci_${r}`, st);
            } else if (dept.includes('মানবিক') || dept.includes('hum') || dept.includes('arts')) {
              studentLookup.set(`dept_roll:মানবিক_${r}`, st);
              studentLookup.set(`dept_roll:humanities_${r}`, st);
            } else if (dept.includes('ব্যবসায়') || dept.includes('com') || dept.includes('business') || dept.includes('bs')) {
              studentLookup.set(`dept_roll:ব্যবসায় শিক্ষা_${r}`, st);
              studentLookup.set(`dept_roll:commerce_${r}`, st);
            }
          }
          const deptPrio = getStudentGroupPriority({ department: st.department || st.group_name });
          if (deptPrio < 4) studentLookup.set(`prio_roll:${deptPrio}_${r}`, st);

          if (!studentLookup.has(`roll:${r}`) || dept.includes('বিজ্ঞান') || dept.includes('sci')) {
            studentLookup.set(`roll:${r}`, st);
          }
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
          const hasSubRef = h.includes(code) || (subCleanName.length >= 4 && (h.includes(normBn(subCleanName)) || normBn(subCleanName).includes(h)));
          if (!hasSubRef) return;

          const isPrac = h.includes('practical') || h.includes('prac') || h.includes(normBn('ব্যবহারিক'));
          const isMcq = h.includes('mcq') || h.includes(normBn('এমসিকিউ')) || h.includes(normBn('বহুনির্বাচনি')) || h.includes(normBn('বহুনির্বাচনী')) || h.includes(normBn('নৈর্ব্যক্তিক'));
          const isWritten = h.includes('cq') || h.includes('written') || h.includes(normBn('লিখিত')) || h.includes(normBn('সৃজনশীল')) || h.includes(normBn('রচনামূলক')) || h.includes(normBn('তত্ত্বীয়')) || h.includes(normBn('তত্ত্বীয়'));

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
      let effectiveSubject = currentSubjectObj;

      if (subjectColumnsMap.size >= 2) {
        // Multi-Subject CSV Matrix
        detectedSubjectNames = Array.from(subjectColumnsMap.values()).map(x => x.sub.name_bn);
        effectiveSubject = Array.from(subjectColumnsMap.values())[0]?.sub || currentSubjectObj;

        for (let r = 1; r < matrix.length; r++) {
          const row = matrix[r];
          if (!row || !row.length || row.every(c => !c.trim())) continue;

          const rollVal = rollIdx !== -1 && row[rollIdx] ? normalizeMarkDigits(row[rollIdx].trim()) : '';
          const idVal = idIdx !== -1 && row[idIdx] ? row[idIdx].trim().toLowerCase() : '';
          const nameVal = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim().toLowerCase() : '';
          const nameClean = nameVal.replace(/\s+/g, '');
          const deptVal = deptIdx !== -1 && row[deptIdx] ? row[deptIdx].trim().toLowerCase() : '';
          const targetDept = deptVal || (effectiveDept && effectiveDept !== 'all' && effectiveDept !== 'সকল বিভাগ' ? effectiveDept.toLowerCase() : '');
          const deptPrio = targetDept ? getStudentGroupPriority({ department: targetDept }) : 99;

          const matchedStudent = (idVal && studentLookup.get(`id:${idVal}`)) ||
                                 (nameVal && studentLookup.get(`name:${nameVal}`)) ||
                                 (nameClean && studentLookup.get(`name_clean:${nameClean}`)) ||
                                 (rollVal && targetDept && studentLookup.get(`dept_roll:${targetDept}_${rollVal}`)) ||
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
                exam_id: effectiveExamId,
                class_name: effectiveClass,
                student_id: matchedStudent.id,
                student_code: matchedStudent.student_id || matchedStudent.id,
                department: matchedStudent.department || targetDept,
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
          'writtencq', 'written', 'cq', 'লিখিত', 'সৃজনশীল', 'রচনামূলক', 'বর্ণনামূলক', 'তত্ত্বীয়', 'তত্ত্বীয়', 'theory', 'sub1', 'mark', 'marks', 'নম্বর', 'প্রাপ্তনম্বর', 'প্রাপ্ত_নম্বর', 'obttotal', 'total'
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

          // 1. Detect row subject first so department context is 100% accurate!
          let rowSub = targetSubject;
          const rowCode = subjectCodeIdx !== -1 && row[subjectCodeIdx] ? row[subjectCodeIdx].trim() : '';
          const rowSubName = subjectNameIdx !== -1 && row[subjectNameIdx] ? row[subjectNameIdx].trim() : '';

          if (rowCode) {
            const found = classSubjects.find(s => String(s.code) === rowCode) || subjects.find(s => String(s.code) === rowCode && String(s.class_name) === effectiveClass);
            if (found) rowSub = found;
          } else if (rowSubName) {
            const found = classSubjects.find(s => s.name_bn && (s.name_bn.includes(rowSubName) || rowSubName.includes(s.name_bn))) || subjects.find(s => s.name_bn && (s.name_bn.includes(rowSubName) || rowSubName.includes(s.name_bn)) && String(s.class_name) === effectiveClass);
            if (found) rowSub = found;
          }

          if (!rowSub) rowSub = currentSubjectObj;
          if (!rowSub) continue;

          rowSubjectsSet.add(rowSub.name_bn);

          const rollVal = rollIdx !== -1 && row[rollIdx] ? normalizeMarkDigits(row[rollIdx].trim()) : '';
          const idVal = idIdx !== -1 && row[idIdx] ? row[idIdx].trim().toLowerCase() : '';
          const nameVal = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim().toLowerCase() : '';
          const nameClean = nameVal.replace(/\s+/g, '');
          const deptVal = deptIdx !== -1 && row[deptIdx] ? row[deptIdx].trim().toLowerCase() : '';

          // Determine department context from CSV row, subject department, or subject code
          let targetDept = deptVal;
          if (!targetDept && rowSub?.department && !['আবশ্যিক', 'সাধারণ'].includes(rowSub.department)) {
            targetDept = rowSub.department.toLowerCase();
          }
          if (!targetDept && rowSub?.code) {
            const c = String(rowSub.code);
            if (['136', '137', '138', '126'].includes(c)) targetDept = 'বিজ্ঞান';
            else if (['146', '152', '143'].includes(c)) targetDept = 'ব্যবসায় শিক্ষা';
            else if (['153', '110', '141', '140', '151'].includes(c)) targetDept = 'মানবিক';
          }
          if (!targetDept && effectiveDept && effectiveDept !== 'all' && effectiveDept !== 'সকল বিভাগ') {
            targetDept = effectiveDept.toLowerCase();
          }

          const deptPrio = targetDept ? getStudentGroupPriority({ department: targetDept }) : 99;

          const matchedStudent = (idVal && studentLookup.get(`id:${idVal}`)) ||
                                 (nameVal && studentLookup.get(`name:${nameVal}`)) ||
                                 (nameClean && studentLookup.get(`name_clean:${nameClean}`)) ||
                                 (rollVal && targetDept && studentLookup.get(`dept_roll:${targetDept}_${rollVal}`)) ||
                                 (rollVal && deptPrio < 4 && studentLookup.get(`prio_roll:${deptPrio}_${rollVal}`)) ||
                                 (rollVal && studentLookup.get(`roll:${rollVal}`));

          if (!matchedStudent) continue;
          matchedStudentIds.add(matchedStudent.id);

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
            exam_id: effectiveExamId,
            class_name: effectiveClass,
            student_id: matchedStudent.id,
            student_code: matchedStudent.student_id || matchedStudent.id,
            department: matchedStudent.department || targetDept,
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
          const singleSub = classSubjects.find(s => s.name_bn === detectedSubjectNames[0]) || subjects.find(s => s.name_bn === detectedSubjectNames[0] && String(s.class_name) === effectiveClass);
          if (singleSub) {
            effectiveSubject = singleSub;
            if (singleSub.id !== selectedSubjectId) {
              setSelectedSubjectId(singleSub.id);
            }
          }
        }
      }

      if (!recordsToSave.length || matchedStudentIds.size === 0) {
        showNotification('CSV ফাইলের রোলের সাথে বর্তমান শ্রেণির কোনো শিক্ষার্থীর রোল বা আইডি মেলেনি। সঠিক শ্রেণির CSV আপলোড করুন।', 'error');
        return;
      }

      // 4. Save records to backend store (persisted across aliases)
      await api('/marks/bulk', {
        method: 'POST',
        body: JSON.stringify({ exam_id: effectiveExamId, records: recordsToSave })
      });

      if (selectedExam && String(selectedExam) !== String(effectiveExamId)) {
        await api('/marks/bulk', {
          method: 'POST',
          body: JSON.stringify({ exam_id: selectedExam, records: recordsToSave.map(r => ({ ...r, exam_id: selectedExam })) })
        });
      }

      // 5. Immediately recalculate results via Dhaka Board Exam Engine
      const processRes = await api('/results/process', {
        method: 'POST',
        body: JSON.stringify({ exam_id: effectiveExamId, class_name: effectiveClass })
      });

      if (selectedExam && String(selectedExam) !== String(effectiveExamId)) {
        await api('/results/process', {
          method: 'POST',
          body: JSON.stringify({ exam_id: selectedExam, class_name: effectiveClass })
        });
      }

      if (Array.isArray(processRes.summary)) {
        setProcessedResults(processRes.summary);
      }
      await loadProcessedResults(true);

      // 6. Direct Marks Roster population for instantaneous UI update without waiting for async refetches
      const targetSubObj = effectiveSubject || currentSubjectObj;
      const filteredStudents = allClassStudents.filter(s => {
        if (targetSubObj && !isSubjectApplicableToStudent(targetSubObj, s)) return false;
        if (effectiveDept && effectiveDept !== 'all' && effectiveDept !== 'সকল বিভাগ') {
          if (!matchesStudentGroup(s, effectiveDept)) return false;
        }
        return true;
      });
      const sortedStudents = sortStudentsList(filteredStudents);
      setStudents(sortedStudents);

      const uploadedMarksMap = new Map();
      recordsToSave.forEach(r => {
        const sId = String(r.student_id).toLowerCase();
        uploadedMarksMap.set(sId, r);
        if (r.student_code) uploadedMarksMap.set(String(r.student_code).toLowerCase(), r);
      });

      if (targetSubObj) {
        const newRoster = sortedStudents.map(s => {
          const sId = String(s.id || '').toLowerCase();
          const stCode = String(s.student_id || s.id || '').toLowerCase();
          const m = uploadedMarksMap.get(sId) || uploadedMarksMap.get(stCode) || {};
          return {
            student_id: s.id,
            student_code: s.student_id || s.id || ('STU-' + s.roll_no),
            roll_no: s.roll_no !== undefined && s.roll_no !== null ? s.roll_no : '',
            name_bn: s.name_bn || s.name_en || '',
            department: s.department || s.group_name || s.group || 'সাধারণ',
            subject_id: targetSubObj.id,
            subject_code: targetSubObj.code,
            written: m.written !== null && m.written !== undefined ? m.written : '',
            mcq: m.mcq !== null && m.mcq !== undefined ? m.mcq : '',
            practical: m.practical !== null && m.practical !== undefined ? m.practical : '',
            absent: !!m.absent,
            remarks: m.remarks || ''
          };
        });
        setMarksRoster(newRoster);
      }

      // 7. Refresh processed results state
      await loadProcessedResults(true);

      const subjectsInfo = detectedSubjectNames.length > 1
        ? `${toBnDigits(detectedSubjectNames.length)}টি বিষয় (${detectedSubjectNames.slice(0, 3).join(', ')}${detectedSubjectNames.length > 3 ? '...' : ''})`
        : `"${targetSubObj?.name_bn || detectedSubjectNames[0] || 'বিষয়'}"`;

      showNotification(`🎉 অভিনন্দন! CSV ফাইল থেকে ${subjectsInfo} এর ${toBnDigits(matchedStudentIds.size)} জন শিক্ষার্থীর নম্বর সফলভাবে সেভ ও মাস্টার শিটে প্রসেস করা হয়েছে! ✓`, 'success');
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
    if (['merit', 'failed_list', 'tabulation', 'marksheet', 'analysis', 'processing'].includes(tab) && selectedExam) {
      loadProcessedResults(true);
    }
  }, [tab, selectedExam, className]);

  // Filtered processed results by Department (Group) for 9-10
  const filteredProcessedResults = useMemo(() => {
    const isDeptFilter = isSSC && department && department !== 'all' && department !== 'সকল বিভাগ';
    let list = processedResults;
    if (isDeptFilter) {
      list = processedResults.filter(r => matchesStudentGroup(r.student || r, department));
    }
    const mapped = list.map(st => ({ ...st }));
    if (isDeptFilter) {
      // Re-rank within this department (1 to list.length) based on department's total students
      const passed = mapped.filter(s => s.is_pass);
      const failed = mapped.filter(s => !s.is_pass);

      passed.sort((a, b) => {
        const gpaDiff = Number(b.gpa) - Number(a.gpa);
        if (Math.abs(gpaDiff) > 0.001) return gpaDiff;
        const markDiff = (Number(b.total_marks) || 0) - (Number(a.total_marks) || 0);
        if (markDiff !== 0) return markDiff;
        return (Number(a.roll_no) || 0) - (Number(b.roll_no) || 0);
      });

      failed.sort((a, b) => {
        const markDiff = (Number(b.total_marks) || 0) - (Number(a.total_marks) || 0);
        if (markDiff !== 0) return markDiff;
        return (Number(a.roll_no) || 0) - (Number(b.roll_no) || 0);
      });

      let r = 1;
      passed.forEach(s => {
        s.dept_merit = r;
        s.display_merit = r;
        s.dept_total = mapped.length;
        r++;
      });
      failed.forEach(s => {
        s.dept_merit = r;
        s.display_merit = r;
        s.dept_total = mapped.length;
        r++;
      });
      return [...passed, ...failed];
    } else {
      mapped.forEach((s, idx) => {
        s.display_merit = s.merit || (idx + 1);
        s.dept_merit = s.merit || (idx + 1);
      });
      return mapped;
    }
  }, [processedResults, isSSC, department]);

  // Tabulation Sheet: strictly sorted by student's roll number ascending (no merit serial)
  const tabulationResults = useMemo(() => {
    return [...filteredProcessedResults].sort((a, b) => {
      const rA = Number(a.roll_no) || 0;
      const rB = Number(b.roll_no) || 0;
      if (rA !== rB) return rA - rB;
      return (a.student_id || '').localeCompare(b.student_id || '');
    });
  }, [filteredProcessedResults]);

  // Failed Students List: filtered for failed/unsuccessful students
  const failedStudentsList = useMemo(() => {
    return filteredProcessedResults
      .filter(s => !s.is_pass || s.final_grade === 'F' || s.result_status !== 'উত্তীর্ণ')
      .sort((a, b) => {
        const rA = Number(a.roll_no) || 0;
        const rB = Number(b.roll_no) || 0;
        if (rA !== rB) return rA - rB;
        return (a.student_id || '').localeCompare(b.student_id || '');
      });
  }, [filteredProcessedResults]);

  // Displayed Failed Students with sub-filter
  const displayedFailedStudents = useMemo(() => {
    if (failedFilterMode === '1') {
      return failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 1) === 1);
    }
    if (failedFilterMode === '2') {
      return failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 0) === 2);
    }
    if (failedFilterMode === '3+') {
      return failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 0) >= 3);
    }
    return failedStudentsList;
  }, [failedStudentsList, failedFilterMode]);

  const getStudentFailedSubjectsSummary = (st) => {
    if (!st) return [];
    if (Array.isArray(st.subjects) && st.subjects.length > 0) {
      const fails = st.subjects.filter(s => !s.is_pass || s.letter_grade === 'F');
      if (fails.length > 0) {
        return fails.map(f => ({
          name: f.subject_name || f.code,
          code: f.code,
          total: f.total !== null && f.total !== undefined ? f.total : '',
          grade: f.letter_grade || 'F',
          written: f.written,
          mcq: f.mcq,
          practical: f.practical,
          reason: f.fail_reason || ''
        }));
      }
    }
    if (Array.isArray(st.failed_subjects) && st.failed_subjects.length > 0) {
      return st.failed_subjects.map(name => ({
        name,
        code: '',
        total: '',
        grade: 'F',
        reason: ''
      }));
    }
    return [];
  };

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
    '109': 'MATHEMATICS',
    '110': 'GEOGRAPHY AND ENVIRONMENT',
    '111': 'ISLAM AND MORAL EDUCATION',
    '112': 'HINDU RELIGION AND MORAL EDUCATION',
    '113': 'BUDDHIST RELIGION AND MORAL EDUCATION',
    '114': 'CHRISTIAN RELIGION AND MORAL EDUCATION',
    '126': 'HIGHER MATHEMATICS',
    '127': 'GENERAL SCIENCE',
    '134': 'AGRICULTURE STUDIES',
    '136': 'PHYSICS',
    '137': 'CHEMISTRY',
    '138': 'BIOLOGY',
    '140': 'CIVICS AND CITIZENSHIP',
    '141': 'ECONOMICS',
    '142': 'CIVICS AND CITIZENSHIP',
    '143': 'HISTORY OF BANGLADESH AND WORLD CIVILIZATION',
    '146': 'ACCOUNTING',
    '147': 'FINANCE AND BANKING',
    '150': 'BANGLADESH AND GLOBAL STUDIES',
    '151': 'HOME SCIENCE',
    '152': 'BUSINESS ENTREPRENEURSHIP',
    '153': 'HISTORY OF BANGLADESH AND WORLD CIVILIZATION',
    '154': 'INFORMATION AND COMMUNICATION TECHNOLOGY'
  };

  const getSubjectEnName = (sub) => {
    if (!sub) return '';
    const rawCode = String(sub.code || '').trim();
    const code = rawCode.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));
    if (standardEnNames[code]) return standardEnNames[code];
    if (sub.name_en && sub.name_en.trim()) return sub.name_en.trim().toUpperCase();
    return sub.name_bn || '';
  };

  const getStudentTranscriptSubjects = (st) => {
    if (!st?.subjects) return [];
    let subs = [...st.subjects];

    // Ensure only 1 4th subject appears on transcript:
    // 1. For Science: either 126 or 134 (never both)
    const has126 = subs.some(s => String(s.code) === '126');
    const has134 = subs.some(s => String(s.code) === '134');
    if (has126 && has134) {
      const sub126 = subs.find(s => String(s.code) === '126');
      const sub134 = subs.find(s => String(s.code) === '134');
      const studentObj = st.student || st;
      const explicit = (studentObj.fourth_subject || studentObj.fourth_subject_code || studentObj.optional_subject || '').toString().toLowerCase();

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

    // 2. For Humanities & Business Studies: 4th subject is either 134 (Agriculture Studies) or 151 (Home Science)
    const has151 = subs.some(s => String(s.code) === '151');
    if (has134 && has151) {
      const sub134 = subs.find(s => String(s.code) === '134');
      const sub151 = subs.find(s => String(s.code) === '151');
      const studentObj = st.student || st;
      const explicit = (studentObj.fourth_subject || studentObj.fourth_subject_code || studentObj.optional_subject || '').toString().toLowerCase();

      let keepCode = '134';
      if (explicit.includes('151') || explicit.includes('গার্হস্থ্য') || explicit.includes('home')) {
        keepCode = '151';
      } else {
        const m134 = !sub134?.absent && (Number(sub134?.total) > 0 || Number(sub134?.written) > 0 || Number(sub134?.mcq) > 0 || Number(sub134?.practical) > 0);
        const m151 = !sub151?.absent && (Number(sub151?.total) > 0 || Number(sub151?.written) > 0 || Number(sub151?.mcq) > 0 || Number(sub151?.practical) > 0);
        if (m151 && !m134) keepCode = '151';
        else keepCode = '134';
      }
      subs = subs.filter(s => {
        const code = String(s.code);
        if (code === '134' || code === '151') return code === keepCode;
        return true;
      });
    }

    // 3. For Humanities: Exclude 140 (Civics & Citizenship) so group subjects are strictly 3:
    // 153 (History), 110 (Geography), 141 (Economics)
    const stGroup = (st.department || st.student?.department || '').toLowerCase();
    if (stGroup.includes('মানবিক') || stGroup.includes('humanities') || stGroup.includes('arts') || stGroup.includes('আর্টস')) {
      subs = subs.filter(s => {
        if (String(s.code) === '140') {
          const hasMarks = !s.absent && (Number(s.total) > 0 || Number(s.written) > 0 || Number(s.mcq) > 0 || Number(s.practical) > 0);
          return hasMarks;
        }
        return true;
      });
    }

    return subs.sort((a, b) => {
      if (a.is_optional && !b.is_optional) return 1;
      if (!a.is_optional && b.is_optional) return -1;
      const codeA = Number(String(a.code || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))) || 999;
      const codeB = Number(String(b.code || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))) || 999;
      return codeA - codeB;
    });
  };

  const transcriptSubjects = useMemo(() => {
    return getStudentTranscriptSubjects(currentStudentResult);
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

  // Generate single marksheet HTML document block for any student
  const generateStudentMarksheetHtml = (st) => {
    if (!st) return '';
    const subs = getStudentTranscriptSubjects(st);
    const hasBp = isSSC && subs.some(s => String(s.code) === '101') && subs.some(s => String(s.code) === '102');
    const hasEp = isSSC && subs.some(s => String(s.code) === '107') && subs.some(s => String(s.code) === '108');

    const s101 = subs.find(s => String(s.code) === '101');
    const s102 = subs.find(s => String(s.code) === '102');
    const bComb = ((s101 && !s101.absent) ? Number(s101.total || 0) : 0) + ((s102 && !s102.absent) ? Number(s102.total || 0) : 0);

    const s107 = subs.find(s => String(s.code) === '107');
    const s108 = subs.find(s => String(s.code) === '108');
    const eComb = ((s107 && !s107.absent) ? Number(s107.total || 0) : 0) + ((s108 && !s108.absent) ? Number(s108.total || 0) : 0);

    const rowsHtml = subs.map(sub => {
      const codeStr = String(sub.code || '');

      if (codeStr === '101') {
        return `
          <tr>
            <td><b>101</b></td>
            <td class="text-left"><b>BANGLA-I</b></td>
            <td>${sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : 0)}</td>
            <td>${sub.absent ? 'অনুপস্থিত' : (sub.mcq !== '' && sub.mcq !== null && sub.mcq !== undefined ? sub.mcq : 0)}</td>
            <td rowspan="${hasBp ? 2 : 1}">—</td>
            <td rowspan="${hasBp ? 2 : 1}"><b>${hasBp ? bComb : (sub.absent ? 0 : sub.total)}</b></td>
            <td rowspan="${hasBp ? 2 : 1}" class="transcript-grade-cell">
              <div class="grade-letter">${sub.letter_grade || 'F'}</div>
              <div class="grade-gp">GP ${Number(sub.gp || 0).toFixed(2)}</div>
            </td>
          </tr>
        `;
      }

      if (codeStr === '102') {
        return `
          <tr>
            <td><b>102</b></td>
            <td class="text-left"><b>BANGLA-II</b></td>
            <td>${sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : 0)}</td>
            <td>${sub.absent ? 'অনুপস্থিত' : (sub.mcq !== '' && sub.mcq !== null && sub.mcq !== undefined ? sub.mcq : 0)}</td>
            ${!hasBp ? `
              <td>—</td>
              <td><b>${sub.absent ? 0 : sub.total}</b></td>
              <td class="transcript-grade-cell">
                <div class="grade-letter">${sub.letter_grade || 'F'}</div>
                <div class="grade-gp">GP ${Number(sub.gp || 0).toFixed(2)}</div>
              </td>
            ` : ''}
          </tr>
        `;
      }

      if (codeStr === '107') {
        return `
          <tr>
            <td><b>107</b></td>
            <td class="text-left"><b>ENGLISH-I</b></td>
            <td>${sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : sub.total)}</td>
            <td rowspan="${hasEp ? 2 : 1}">—</td>
            <td rowspan="${hasEp ? 2 : 1}">—</td>
            <td rowspan="${hasEp ? 2 : 1}"><b>${hasEp ? eComb : (sub.absent ? 0 : sub.total)}</b></td>
            <td rowspan="${hasEp ? 2 : 1}" class="transcript-grade-cell">
              <div class="grade-letter">${sub.letter_grade || 'F'}</div>
              <div class="grade-gp">GP ${Number(sub.gp || 0).toFixed(2)}</div>
            </td>
          </tr>
        `;
      }

      if (codeStr === '108') {
        return `
          <tr>
            <td><b>108</b></td>
            <td class="text-left"><b>ENGLISH-II</b></td>
            <td>${sub.absent ? 'অনুপস্থিত' : (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : sub.total)}</td>
            ${!hasEp ? `
              <td>—</td>
              <td>—</td>
              <td><b>${sub.absent ? 0 : sub.total}</b></td>
              <td class="transcript-grade-cell">
                <div class="grade-letter">${sub.letter_grade || 'F'}</div>
                <div class="grade-gp">GP ${Number(sub.gp || 0).toFixed(2)}</div>
              </td>
            ` : ''}
          </tr>
        `;
      }

      const isAb = !!sub.absent;
      const wVal = isAb ? 'অনুপস্থিত' : (sub.written_max > 0 ? (sub.written !== '' && sub.written !== null && sub.written !== undefined ? sub.written : 0) : '—');
      const mVal = isAb ? 'অনুপস্থিত' : (sub.mcq_max > 0 ? (sub.mcq !== '' && sub.mcq !== null && sub.mcq !== undefined ? sub.mcq : 0) : '—');
      const pVal = isAb ? '—' : (sub.practical_max > 0 ? (sub.practical !== '' && sub.practical !== null && sub.practical !== undefined ? sub.practical : 0) : '—');

      return `
        <tr>
          <td><b>${sub.code}</b></td>
          <td class="text-left"><b>${getSubjectEnName(sub)}</b></td>
          <td>${wVal}</td>
          <td>${mVal}</td>
          <td>${pVal}</td>
          <td><b>${isAb ? 0 : sub.total}</b></td>
          <td class="transcript-grade-cell">
            <div class="grade-letter">${sub.letter_grade || 'F'}</div>
            <div class="grade-gp">GP ${Number(sub.gp || 0).toFixed(2)}</div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="official-marksheet-wrapper">
        <div class="transcript-top-content">
          <div class="transcript-official-header">
            <h1 class="transcript-school-name">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
            <div class="transcript-school-line">ডাকঘর: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল</div>
            <div class="transcript-school-line">স্থাপিত: ১৯৪৬</div>
            <div class="transcript-school-eiin">EIIN: 114290</div>
          </div>

          <div class="marksheet-exam-title-badge">
            <span>${marksheetDocTitle}</span>
          </div>

          <div class="marksheet-top-info-grid">
            <div class="marksheet-student-card">
              <div class="info-row"><b>শিক্ষার্থীর নাম:</b> ${st.name_bn} ${st.name_en ? `(${st.name_en.toUpperCase()})` : ''}</div>
              <div class="info-row"><b>Student ID:</b> ${st.student_id} | <b>রোল নম্বর:</b> ${toBnDigits(st.roll_no)}</div>
              <div class="info-row"><b>শ্রেণি:</b> শ্রেণি ${toBnDigits(className)} | <b>শাখা:</b> ${st.section || (isSSC ? 'বিজ্ঞান বিভাগ' : 'A')}</div>
              <div class="info-row"><b>বিভাগ / গ্রুপ:</b> ${st.department || (isSSC ? 'বিজ্ঞান' : 'সাধারণ')}</div>
            </div>
            <div class="marksheet-student-card">
              <div class="info-row"><b>পিতার নাম:</b> ${st.student?.father_name || st.father_name || 'মুহাম্মদ আবুবকর সিদ্দিক'}</div>
              <div class="info-row"><b>মাতার নাম:</b> ${st.student?.mother_name || st.mother_name || 'তাহমিনা'}</div>
              <div class="info-row"><b>শিক্ষাবর্ষ:</b> ${toBnDigits(selectedYear)} খ্রি.</div>
              <div class="info-row"><b>পরীক্ষার নাম:</b> ${selectedExamObj ? selectedExamObj.name_bn : (isTranscriptExam ? 'নির্বাচনী পরীক্ষা' : 'অর্ধ-বার্ষিক পরীক্ষা')}</div>
            </div>
          </div>

          <table class="marksheet-subjects-table marksheet-board-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 75px;">Subject Code</th>
                <th rowspan="2" style="text-align: center;">Subject Name</th>
                <th colspan="4">Marks</th>
                <th rowspan="2" style="width: 80px;">Grade</th>
              </tr>
              <tr>
                <th style="width: 75px;">CQ/Theory</th>
                <th style="width: 65px;">MCQ</th>
                <th style="width: 65px;">Practical</th>
                <th style="width: 70px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="transcript-summary-box">
            <div>
              <div class="summary-label">সর্বমোট প্রাপ্ত নম্বর</div>
              <div class="summary-val">${st.total_marks || 0}</div>
            </div>
            <div>
              <div class="summary-label">প্রাপ্ত শতকরা (%)</div>
              <div class="summary-val">${st.percentage || 0}%</div>
            </div>
            <div>
              <div class="summary-label">গ্রেড পয়েন্ট (GPA)</div>
              <div class="summary-val green-text">${st.gpa || '0.00'}</div>
            </div>
            <div>
              <div class="summary-label">চূড়ান্ত লেটার গ্রেড</div>
              <div class="summary-val green-text">${st.final_grade || 'F'}</div>
            </div>
            <div>
              <div class="summary-label">ফলাফল স্ট্যাটাস</div>
              <div class="summary-val green-text status-text">${st.result_status || 'অকৃতকার্য'}</div>
            </div>
            <div>
              <div class="summary-label">${isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? `${department} মেধা স্থান` : 'শ্রেণি মেধা স্থান'}</div>
              <div class="summary-val">${(st.display_merit || st.dept_merit || st.merit) ? `${toBnDigits(st.display_merit || st.dept_merit || st.merit)} তম` : '—'}</div>
            </div>
          </div>
        </div>

        <div class="transcript-bottom-content">
          <div class="transcript-signatures-zone ${isFourSignatures ? 'four-columns' : 'three-columns'}">
            <div class="sig-column">
              <div class="sig-dots">${sigDotsText}</div>
              <div class="sig-title">শ্রেণি শিক্ষকের স্বাক্ষর</div>
            </div>
            ${isFourSignatures ? `
              <div class="sig-column">
                <div class="sig-dots">${sigDotsText}</div>
                <div class="sig-title">প্রস্তুতকারীর স্বাক্ষর</div>
              </div>
              <div class="sig-column">
                <div class="sig-dots">${sigDotsText}</div>
                <div class="sig-title">অভিভাবকের স্বাক্ষর</div>
              </div>
            ` : `
              <div class="sig-column">
                <div class="sig-dots">${sigDotsText}</div>
                <div class="sig-title">${activeCenterSig}</div>
              </div>
            `}
            <div class="sig-column">
              <div class="sig-dots">${sigDotsText}</div>
              <div class="sig-title">প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</div>
            </div>
          </div>

          <!-- স্বাক্ষরের নিচে সিলদেয়ার জায়গা (Space for Official Seal below Signature) -->
          <div class="transcript-seal-space" style="height: 52px; margin: 6px 0 8px 0;"></div>

          <div class="transcript-footer-line">
            <span>ফলাফল প্রকাশের তারিখ: ${toBnDigits(new Date().toLocaleDateString('bn-BD'))} খ্রি.</span>
            <span>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, কালিহাতী, টাঙ্গাইল — কম্পিউটার প্রস্তুতকৃত ${marksheetFooterDocType}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Batch Print Marksheets Handler (Supports 1 to all students with automatic page-break)
  const handleBatchPrintMarksheet = (studentsToPrint) => {
    const list = studentsToPrint && studentsToPrint.length ? studentsToPrint : filteredProcessedResults;
    if (!list || !list.length) {
      showNotification('প্রিন্ট করার মতো কোনো শিক্ষার্থী পাওয়া যায়নি।', 'error');
      return;
    }

    const printWin = window.open('', '_blank', 'width=950,height=900');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজার পপ-আপ অনুমোদন করুন।');
      return;
    }

    const allMarkSheetsHtml = list.map(st => generateStudentMarksheetHtml(st)).join('\n');

    printWin.document.write(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${isTranscriptExam ? 'একাডেমিক_ট্রান্সক্রিপ্ট' : 'মার্কশিট_ও_প্রোগ্রেস_রিপোর্ট'}_${className}_${selectedYear}.pdf</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 5mm 6mm; 
    }
    * { 
      box-sizing: border-box; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Noto Sans Bengali', system-ui, -apple-system, sans-serif; 
      background: #fff; 
      color: #000; 
    }
    .official-marksheet-wrapper { 
      width: 100%; 
      max-width: 194mm; 
      height: 284mm; 
      min-height: 284mm; 
      max-height: 284mm; 
      margin: 0 auto; 
      background: #fff; 
      border: 1.5px solid #000; 
      border-radius: 4px; 
      padding: 5mm 8mm; 
      box-sizing: border-box; 
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid !important; 
      break-inside: avoid !important; 
      page-break-after: always; 
      break-after: page; 
      overflow: hidden;
    }
    .official-marksheet-wrapper:last-child { 
      page-break-after: auto; 
      break-after: auto; 
      margin-bottom: 0; 
    }
    .transcript-top-content {
      display: flex;
      flex-direction: column;
    }
    .transcript-official-header { 
      text-align: center; 
      margin-bottom: 6px; 
    }
    .transcript-school-name { 
      margin: 0 0 2px 0; 
      font-size: 22px; 
      color: #0b8050; 
      font-weight: 800; 
      letter-spacing: 0.3px; 
      line-height: 1.2; 
    }
    .transcript-school-line { 
      margin: 1.5px 0; 
      font-size: 11.5px; 
      color: #1e293b; 
      font-weight: 500; 
      line-height: 1.25; 
    }
    .transcript-school-eiin { 
      margin: 1.5px 0 0 0; 
      font-size: 11.5px; 
      color: #1e293b; 
      font-weight: 700; 
      line-height: 1.25; 
    }
    .marksheet-exam-title-badge { 
      text-align: center; 
      margin: 6px 0 8px 0; 
    }
    .marksheet-exam-title-badge span { 
      display: inline-block; 
      background: #1e293b; 
      color: #fff; 
      padding: 4px 22px; 
      border-radius: 9999px; 
      font-size: 12.5px; 
      font-weight: 700; 
      letter-spacing: 0.4px; 
    }
    .marksheet-top-info-grid { 
      display: grid; 
      grid-template-columns: 1.15fr 0.85fr; 
      gap: 10px; 
      margin-bottom: 8px; 
    }
    .marksheet-student-card { 
      background: #f8fafc; 
      border: 1px solid #cbd5e1; 
      border-radius: 5px; 
      padding: 6px 12px; 
      font-size: 11.5px; 
      line-height: 1.55; 
      color: #0f172a; 
    }
    .marksheet-student-card .info-row { 
      margin: 1px 0; 
    }
    .marksheet-subjects-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 8px 0; 
      font-size: 11.5px; 
      border: 1px solid #000; 
    }
    .marksheet-subjects-table th, .marksheet-subjects-table td { 
      border: 1px solid #000; 
      padding: 7px 6px; 
      text-align: center; 
      line-height: 1.35; 
    }
    .marksheet-subjects-table th { 
      background: #fff; 
      color: #000; 
      font-weight: 700; 
      font-size: 11.5px; 
      padding: 6.5px 6px;
    }
    .marksheet-subjects-table td.text-left { 
      text-align: left; 
      padding-left: 8px; 
      font-weight: 700; 
    }
    .transcript-grade-cell { 
      vertical-align: middle; 
      text-align: center; 
      background: #fff; 
    }
    .grade-letter { 
      font-size: 13px; 
      font-weight: 800; 
      color: #0b8050; 
      line-height: 1.15; 
    }
    .grade-gp { 
      font-size: 10px; 
      font-weight: 700; 
      color: #000; 
      margin-top: 1px; 
    }
    .transcript-summary-box { 
      display: grid; 
      grid-template-columns: repeat(6, 1fr); 
      gap: 5px; 
      background: #f8fafc; 
      border: 1px solid #cbd5e1; 
      border-radius: 5px; 
      padding: 6px 5px; 
      margin-top: 8px; 
      text-align: center; 
    }
    .transcript-summary-box .summary-label { 
      font-size: 10px; 
      color: #64748b; 
      font-weight: 600; 
      margin-bottom: 2px; 
    }
    .transcript-summary-box .summary-val { 
      font-size: 14.5px; 
      font-weight: 800; 
      color: #000; 
    }
    .transcript-summary-box .summary-val.green-text { 
      color: #0b8050; 
    }
    .transcript-summary-box .summary-val.status-text { 
      font-size: 14.5px; 
    }
    .transcript-bottom-content {
      margin-top: auto;
      padding-top: 10px;
    }
    .transcript-signatures-zone { 
      display: flex; 
      justify-content: space-between; 
      font-size: 11px; 
      color: #334155; 
      text-align: center; 
      margin-bottom: 4px;
    }
    .transcript-signatures-zone .sig-column { 
      min-width: 140px; 
    }
    .transcript-signatures-zone.four-columns .sig-column { 
      min-width: 105px; 
      flex: 1;
      padding: 0 4px;
    }
    .transcript-signatures-zone .sig-dots { 
      letter-spacing: 1px; 
      color: #94a3b8; 
      margin-bottom: 5px; 
    }
    .transcript-signatures-zone .sig-title { 
      font-weight: 600; 
      color: #1e293b; 
    }
    .transcript-footer-line { 
      display: flex; 
      justify-content: space-between; 
      font-size: 9px; 
      color: #64748b; 
      border-top: 1px dotted #cbd5e1; 
      padding-top: 4px; 
    }
    @media print {
      body { padding: 0; }
      .no-print-bar { display: none !important; }
      .official-marksheet-wrapper { 
        page-break-after: always !important; 
        break-after: page !important; 
        page-break-inside: avoid !important; 
        break-inside: avoid !important; 
        height: 284mm !important;
        min-height: 284mm !important;
        max-height: 284mm !important;
        overflow: hidden !important;
      }
      .official-marksheet-wrapper:last-child { page-break-after: auto !important; break-after: auto !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar" style="position:sticky;top:0;z-index:1000;background:#0f172a;color:#fff;padding:8px 14px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);margin-bottom:12px;">
    <div>
      <b>📄 ${isTranscriptExam ? 'একাডেমিক ট্রান্সক্রিপ্ট / মার্কশিট' : 'মার্কশিট ও প্রোগ্রেস রিপোর্ট'} — প্রিন্ট ও PDF প্রিভিউ (${toBnDigits(list.length)} জন)</b>
      <span style="font-size:11px;opacity:0.9;margin-left:10px;">(📌 PDF হিসেবে ডাউনলোড করতে Destination-এ <b>"Save as PDF"</b> নির্বাচন করুন)</span>
    </div>
    <div style="display:flex;gap:8px;">
      <button type="button" style="background:#0284c7;color:#fff;border:none;padding:6px 14px;border-radius:5px;font-weight:700;cursor:pointer;font-size:12px;" onclick="window.print()">📥 PDF ডাউনলোড / সেভ করুন</button>
      <button type="button" style="background:#047857;color:#fff;border:none;padding:6px 14px;border-radius:5px;font-weight:700;cursor:pointer;font-size:12px;" onclick="window.print()">🖨️ প্রিন্ট করুন</button>
      <button type="button" onclick="window.close()" style="background:#e2e8f0;color:#0f172a;border:none;padding:6px 14px;border-radius:5px;font-weight:700;cursor:pointer;font-size:12px;">✕ বন্ধ করুন</button>
    </div>
  </div>
  ${allMarkSheetsHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`);
    printWin.document.close();
  };

  // Single student print shortcut
  const handlePrintMarksheet = () => {
    if (!currentStudentResult) {
      showNotification('প্রিন্ট করার জন্য কোনো শিক্ষার্থী নির্বাচিত নেই।', 'error');
      return;
    }
    handleBatchPrintMarksheet([currentStudentResult]);
  };

  // Batch Filter helper
  const getSelectedBatchStudents = () => {
    if (batchPrintMode === 'all') return filteredProcessedResults;
    if (batchPrintMode === 'passed') return filteredProcessedResults.filter(s => s.result_status === 'উত্তীর্ণ' || s.final_grade !== 'F');
    if (batchPrintMode === 'failed') return filteredProcessedResults.filter(s => s.result_status !== 'উত্তীর্ণ' && s.final_grade === 'F');
    if (batchPrintMode === 'range') {
      const from = Number(batchRollFrom) || 0;
      const to = Number(batchRollTo) || 999999;
      return filteredProcessedResults.filter(s => {
        const roll = Number(s.roll_no) || 0;
        return roll >= from && roll <= to;
      });
    }
    return filteredProcessedResults;
  };

  const handleExecuteBatchPrint = () => {
    const list = getSelectedBatchStudents();
    if (!list.length) {
      alert('নির্বাচিত শর্তে কোনো শিক্ষার্থী পাওয়া যায়নি।');
      return;
    }
    handleBatchPrintMarksheet(list);
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
        const created = await api('/exams', { method: 'POST', body: JSON.stringify(examForm) });
        showNotification('নতুন পরীক্ষা সফলভাবে তৈরি হয়েছে।', 'success');
        if (created && created.id) {
          setSelectedExam(created.id);
        }
      }
      setEditingExamId(null);
      setExamForm({ academic_year: selectedYear, name_bn: '', name_en: '', exam_type: 'সাময়িক পরীক্ষা', status: 'active', remarks: '' });
      await loadMasterData();
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
            <span className="kpi-label">শ্রেণি স্তর</span>
            <div className="kpi-val">{isSSC ? '৯ম-১০ম শ্রেণি' : '৬ষ্ঠ-৮ম শ্রেণি'}</div>
            <span className="kpi-badge badge-pub">{isSSC ? 'বিভাগভিত্তিক' : 'সাধারণ প্রমিত'}</span>
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

      {/* ================= MODERN TAB NAVIGATION (TWO PARALLEL ROWS) ================= */}
      <div className="exam-tab-bar">
        {(() => {
          const allTabs = [
            ['academic_year', '🗓️ ১. একাডেমিক ইয়ার'],
            ['exam_names', '📝 ২. পরীক্ষার নাম'],
            ['subjects', '📚 ৩. বিষয় ও নম্বর বণ্টন'],
            ['marks', '✍️ ৪. বিষয়ভিত্তিক মার্ক এন্ট্রি'],
            ['grading', '🎯 ৫. গ্রেডিং পলিসি'],
            ['processing', '⚙️ ৬. ফলাফল প্রসেসিং'],
            ['tabulation', '📋 ৭. ট্যাবুলেশন শিট'],
            ['marksheet', '📄 ৮. মার্কশিট ও প্রোগ্রেস রিপোর্ট'],
            ['merit', '🏆 ৯. মেধা তালিকা'],
            ['failed_list', '⚠️ ১০. অকৃতকার্য তালিকা'],
            ['analysis', '📊 ১১. ফলাফল বিশ্লেষণ'],
            ['promotion', '🎓 ১২. শিক্ষার্থী প্রমোশন']
          ];
          const availableTabs = isSubjectTeacherOrLibrarian
            ? allTabs.filter(([k]) => k === 'marks')
            : (effectiveRole === 'co_admin')
              ? allTabs.filter(([k]) => ['marks', 'tabulation', 'marksheet', 'merit', 'failed_list'].includes(k))
              : allTabs;

          if (availableTabs.length <= 4) {
            return (
              <div className="exam-tab-row">
                {availableTabs.map(([key, label]) => (
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
            );
          }

          // Split into two parallel rows: Row 1 (first 6 items), Row 2 (remaining 5 items)
          const midPoint = Math.min(6, Math.ceil(availableTabs.length / 2));
          const row1 = availableTabs.slice(0, midPoint);
          const row2 = availableTabs.slice(midPoint);

          return (
            <div className="exam-tab-two-rows">
              <div className="exam-tab-row">
                {row1.map(([key, label]) => (
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
              <div className="exam-tab-row">
                {row2.map(([key, label]) => (
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
            </div>
          );
        })()}
      </div>

      {/* ================= GLOBAL CONTEXT TOOLBAR ================= */}
      {['subjects', 'marks', 'processing', 'merit', 'failed_list', 'tabulation', 'marksheet', 'analysis'].includes(tab) && (
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
                  শ্রেণি {toBnDigits(c)}
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

            {tab === 'failed_list' ? (
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-modern-primary"
                  style={{ background: '#b91c1c', color: '#fff', borderColor: '#b91c1c', fontWeight: 700 }}
                  onClick={handlePrintFailedList}
                  title="অকৃতকার্য শিক্ষার্থীদের তালিকা PDF ডাউনলোড করুন"
                >
                  📥 অকৃতকার্য PDF
                </button>
                <button
                  type="button"
                  className="btn-modern-secondary"
                  onClick={handlePrintFailedList}
                  title="অকৃতকার্য শিক্ষার্থীদের তালিকা প্রিন্ট করুন"
                >
                  🖨️ প্রিন্ট
                </button>
              </div>
            ) : tab === 'tabulation' ? (
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-modern-primary"
                  style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 700 }}
                  onClick={handlePrintTabulationSheet}
                  title="ট্যাবুলেশন শিট PDF ডাউনলোড করুন (Legal Landscape)"
                >
                  📥 ট্যাবুলেশন PDF
                </button>
                <button
                  type="button"
                  className="btn-modern-primary"
                  style={{ background: '#047857', color: '#fff', borderColor: '#047857', fontWeight: 700 }}
                  onClick={handlePrintTabulationSheet}
                  title="Legal Landscape (লিগ্যাল পেজ ল্যান্ডস্কেপ) সাইজে প্রিন্ট করুন"
                >
                  🖨️ প্রিন্ট শিট
                </button>
              </div>
            ) : tab === 'merit' ? (
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-modern-primary"
                  style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 700 }}
                  onClick={handlePrintMeritList}
                  title="মেধা তালিকা PDF ডাউনলোড করুন"
                >
                  📥 মেধা তালিকা PDF
                </button>
                <button
                  type="button"
                  className="btn-modern-secondary"
                  onClick={handlePrintMeritList}
                  title="অফিশিয়াল মেধা তালিকা প্রিন্ট করুন"
                >
                  🖨️ প্রিন্ট
                </button>
              </div>
            ) : tab === 'marksheet' ? (
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-modern-primary"
                  style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 700 }}
                  onClick={handlePrintMarksheet}
                  title={`নির্বাচিত শিক্ষার্থীর ${marksheetFooterDocType} PDF ডাউনলোড করুন`}
                >
                  📥 {isTranscriptExam ? 'ট্রান্সক্রিপ্ট PDF' : 'প্রোগ্রেস PDF'}
                </button>
                <button
                  type="button"
                  className="btn-modern-secondary"
                  onClick={handlePrintMarksheet}
                  title={`${marksheetFooterDocType} প্রিন্ট করুন`}
                >
                  🖨️ প্রিন্ট
                </button>
              </div>
            ) : null}
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
                {isSSC ? '🏛️ ঢাকা শিক্ষা বোর্ড প্রমিত কাঠামো (৯ম ও ১০ম শ্রেণি)' : '📋 ঢাকা শিক্ষা বোর্ড প্রমিত কাঠামো (৬ষ্ঠ - ৮ম শ্রেণি)'}
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
              <h4>🏛️ মূল্যায়ন নীতি (৯ম ও ১০ম শ্রেণি)</h4>
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
              <h4>📋 মূল্যায়ন নীতি (৬ষ্ঠ - ৮ম শ্রেণি)</h4>
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
              <b>শিক্ষাবর্ষ:</b> {toBnDigits(selectedYear)} | <b>শ্রেণি:</b> শ্রেণি {toBnDigits(className)}
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
            <button type="button" className="preset-chip" onClick={() => setTab('tabulation')}>
              📋 ট্যাবুলেশন শিট দেখুন ➜
            </button>
            <button type="button" className="preset-chip" onClick={() => setTab('marksheet')}>
              📄 মার্কশিট ও প্রোগ্রেস রিপোর্ট দেখুন ➜
            </button>
            <button type="button" className="preset-chip" onClick={() => setTab('merit')}>
              🏆 মেধা তালিকা দেখুন ➜
            </button>
            <button type="button" className="preset-chip" style={{ color: '#b91c1c' }} onClick={() => setTab('failed_list')}>
              ⚠️ অকৃতকার্য তালিকা দেখুন ➜
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MERIT LIST TAB                                                         */}
      {/* ========================================================================= */}
      {tab === 'merit' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge">
                {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
                  ? `${department} চূড়ান্ত মেধা তালিকা`
                  : 'চূড়ান্ত মেধা তালিকা'}
              </span>
              <h3>
                🏆 মেধা ও ফলাফল তালিকা — শ্রেণি {toBnDigits(className)} {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? `(${department} — মোট ${toBnDigits(filteredProcessedResults.length)} জন)` : `(মোট ${toBnDigits(filteredProcessedResults.length)} জন)`} ({selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা'})
              </h3>
            </div>
            <div className="table-action-group">
              <button
                type="button"
                className="btn-modern-primary"
                style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 700 }}
                onClick={handlePrintMeritList}
                title="মেধা তালিকা অফিশিয়াল PDF ফরম্যাটে ডাউনলোড করুন"
              >
                📥 মেধা তালিকা PDF ডাউনলোড
              </button>
              <button
                type="button"
                className="btn-modern-secondary"
                onClick={handlePrintMeritList}
                title="অফিশিয়াল মেধা তালিকা প্রিন্ট করুন"
              >
                🖨️ মেধা তালিকা প্রিন্ট
              </button>
              <button
                type="button"
                className="btn-modern-action"
                onClick={handleDownloadMeritCsv}
                title="মেধা তালিকা CSV ফাইল ডাউনলোড করুন"
              >
                📥 মেধা তালিকা CSV
              </button>
              <button type="button" className="btn-modern-action" onClick={() => loadProcessedResults(true)} title="সর্বশেষ সংরক্ষিত নম্বর থেকে ফলাফল রিফ্রেশ করুন">
                🔄 রিফ্রেশ
              </button>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-exam-table">
              <thead>
                <tr>
                  <th style={{ width: '85px' }}>
                    {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
                      ? `${department} মেধা`
                      : 'মেধা স্থান'}
                  </th>
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
                {filteredProcessedResults.map((x) => {
                  const mRank = x.display_merit || x.dept_merit || x.merit;
                  return (
                    <tr key={x.id || x.student_id}>
                      <td>
                        <b className={`merit-badge ${mRank === 1 ? 'merit-gold' : mRank === 2 ? 'merit-silver' : mRank === 3 ? 'merit-bronze' : ''}`}>
                          {toBnDigits(mRank)}
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
                );
              })}
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
      {/* 10. FAILED STUDENTS LIST TAB (DEPARTMENT-WISE FAILED MATRIX)              */}
      {/* ========================================================================= */}
      {tab === 'failed_list' && (
        <div className="exam-card-table">
          <div className="card-header-styled">
            <div>
              <span className="card-badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ'
                  ? `${department} অকৃতকার্য তালিকা`
                  : 'অকৃতকার্য শিক্ষার্থী তালিকা'}
              </span>
              <h3>
                ⚠️ অকৃতকার্য শিক্ষার্থীর তালিকা — শ্রেণি {toBnDigits(className)} {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? `(${department} — মোট ${toBnDigits(failedStudentsList.length)} জন)` : `(মোট ${toBnDigits(failedStudentsList.length)} জন)`} ({selectedExamObj ? selectedExamObj.name_bn : 'পরীক্ষা'})
              </h3>
            </div>
            <div className="table-action-group">
              <button
                type="button"
                className="btn-modern-primary"
                style={{ background: '#b91c1c', color: '#fff', borderColor: '#b91c1c', fontWeight: 700 }}
                onClick={handlePrintFailedList}
                title="অকৃতকার্য শিক্ষার্থীদের তালিকা অফিশিয়াল PDF ফরম্যাটে ডাউনলোড করুন"
              >
                📥 অকৃতকার্য তালিকা PDF ডাউনলোড
              </button>
              <button
                type="button"
                className="btn-modern-secondary"
                onClick={handlePrintFailedList}
                title="বিভাগভিত্তিক অকৃতকার্য শিক্ষার্থীদের তালিকা অফিশিয়াল ফরম্যাটে প্রিন্ট করুন"
              >
                🖨️ অকৃতকার্য তালিকা প্রিন্ট
              </button>
              <button
                type="button"
                className="btn-modern-action"
                style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 600 }}
                onClick={handleDownloadFailedCsv}
                title="অকৃতকার্য শিক্ষার্থীদের তালিকা CSV ফাইল ডাউনলোড করুন"
              >
                📥 অকৃতকার্য তালিকা CSV
              </button>
              <button type="button" className="btn-modern-action" onClick={() => loadProcessedResults(true)} title="সর্বশেষ সংরক্ষিত নম্বর থেকে ফলাফল রিফ্রেশ করুন">
                🔄 রিফ্রেশ
              </button>
            </div>
          </div>

          {/* Summary KPI Badges */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ flex: '1 1 130px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>মোট পরীক্ষার্থী</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{toBnDigits(filteredProcessedResults.length)} জন</div>
            </div>
            <div style={{ flex: '1 1 130px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>মোট অকৃতকার্য</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>{toBnDigits(failedStudentsList.length)} জন</div>
            </div>
            <div style={{ flex: '1 1 130px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>অকৃতকার্যের হার</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#b91c1c' }}>
                {toBnDigits(filteredProcessedResults.length ? ((failedStudentsList.length / filteredProcessedResults.length) * 100).toFixed(1) : '0')}%
              </div>
            </div>
            <div style={{ flex: '1 1 130px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>১ বিষয়ে ফেল</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>
                {toBnDigits(failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 1) === 1).length)} জন
              </div>
            </div>
            <div style={{ flex: '1 1 130px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>২ বিষয়ে ফেল</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
                {toBnDigits(failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 0) === 2).length)} জন
              </div>
            </div>
            <div style={{ flex: '1 1 130px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>৩+ বিষয়ে ফেল</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
                {toBnDigits(failedStudentsList.filter(s => (s.failed_count || (s.failed_subjects && s.failed_subjects.length) || 0) >= 3).length)} জন
              </div>
            </div>
          </div>

          {/* Sub-filter Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>🔍 ফিল্টার:</span>
              <select
                value={failedFilterMode}
                onChange={(e) => setFailedFilterMode(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="all">সকল অকৃতকার্য শিক্ষার্থী ({toBnDigits(failedStudentsList.length)} জন)</option>
                <option value="1">শুধুমাত্র ১ বিষয়ে ফেল</option>
                <option value="2">শুধুমাত্র ২ বিষয়ে ফেল</option>
                <option value="3+">৩ বা ততোধিক বিষয়ে ফেল</option>
              </select>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              প্রদর্শিত হচ্ছে: <b>{toBnDigits(displayedFailedStudents.length)}</b> জন
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="modern-exam-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>ক্র.</th>
                  <th style={{ width: '55px' }}>রোল</th>
                  <th style={{ width: '90px' }}>Student ID</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>বিভাগ/গ্রুপ</th>
                  <th style={{ width: '85px' }}>ফেল সংখ্যা</th>
                  <th style={{ minWidth: '220px' }}>অকৃতকার্য বিষয় ও বিবরণ</th>
                  <th style={{ width: '80px' }}>মোট নম্বর</th>
                  <th style={{ width: '60px' }}>GPA</th>
                  <th style={{ width: '60px' }}>গ্রেড</th>
                  <th>অভিভাবকের ফোন</th>
                </tr>
              </thead>
              <tbody>
                {displayedFailedStudents.map((x, idx) => {
                  const fails = getStudentFailedSubjectsSummary(x);
                  const failCount = fails.length || x.failed_count || 1;
                  const phone = x.student?.guardian_phone || x.student?.phone || x.guardian_phone || '';
                  return (
                    <tr key={x.id || x.student_id}>
                      <td><span className="text-muted">{toBnDigits(idx + 1)}</span></td>
                      <td><span className="roll-pill">{toBnDigits(x.roll_no || '—')}</span></td>
                      <td><span className="code-pill">{x.student_id}</span></td>
                      <td><b>{x.name_bn}</b></td>
                      <td><span className="sub-tag-compulsory">{x.department || 'সাধারণ'}</span></td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                          {toBnDigits(failCount)}টি বিষয়
                        </span>
                      </td>
                      <td>
                        {fails.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {fails.map((f, i) => (
                              <div key={i} style={{ fontSize: '11px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '3px 6px', color: '#991b1b', textAlign: 'left' }}>
                                <b>{f.name}</b> {f.total !== '' && <span style={{ color: '#b91c1c', fontWeight: 600 }}>({f.total} নম্বর, {f.grade})</span>}
                                {f.reason && <small style={{ display: 'block', color: '#7f1d1d' }}>{f.reason}</small>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="tab-fail-cell" style={{ padding: '2px 6px', borderRadius: '4px' }}>
                            {x.failed_subjects && x.failed_subjects.length ? x.failed_subjects.join(', ') : 'সকল বিষয়'}
                          </span>
                        )}
                      </td>
                      <td><b>{x.total_marks}</b> <small className="text-muted">/ {x.total_full_marks}</small></td>
                      <td><b style={{ fontSize: '15px', color: '#dc2626' }}>{x.gpa}</b></td>
                      <td><span className="grade-pill grade-fail">{x.final_grade || 'F'}</span></td>
                      <td>
                        {phone ? (
                          <a href={`tel:${phone}`} style={{ color: '#0369a1', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}>
                            📞 {phone}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!failedStudentsList.length && (
                  <tr>
                    <td colSpan="11" className="empty-table-cell" style={{ padding: '32px 16px', background: '#f0fdf4', color: '#166534' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
                      <b>অভিনন্দন! নির্বাচিত শ্রেণি ও বিভাগে কোনো অকৃতকার্য শিক্ষার্থী নেই।</b>
                      <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>শতভাগ (১০০%) শিক্ষার্থী সফলভাবে উত্তীর্ণ হয়েছে।</div>
                    </td>
                  </tr>
                )}
                {failedStudentsList.length > 0 && !displayedFailedStudents.length && (
                  <tr>
                    <td colSpan="11" className="empty-table-cell">
                      নির্বাচিত ফিল্টারে কোনো অকৃতকার্য শিক্ষার্থী পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TABULATION SHEET TAB (MASTER TABULATION MATRIX)                        */}
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
              <button
                type="button"
                className="btn-modern-primary"
                style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 700 }}
                onClick={handlePrintTabulationSheet}
                title="ট্যাবুলেশন শিট সরাসরি PDF ডাউনলোড ও সংরক্ষণ করুন (Legal Landscape)"
              >
                📥 ট্যাবুলেশন শিট PDF ডাউনলোড
              </button>
              <button
                type="button"
                className="btn-modern-primary"
                style={{ background: '#047857', color: '#fff', borderColor: '#047857', fontWeight: 700 }}
                onClick={handlePrintTabulationSheet}
                title="Legal Landscape (লিগ্যাল পেজ ল্যান্ডস্কেপ) সাইজে প্রিন্ট করুন"
              >
                🖨️ প্রিন্ট মাস্টার শিট (Legal Landscape)
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
                  <th rowSpan="2" style={{ width: '50px' }}>রোল</th>
                  <th rowSpan="2" style={{ minWidth: '150px' }}>শিক্ষার্থীর নাম</th>
                  {tabulationColumns.map(col => (
                    <th key={col.code} colSpan="4" className="tab-sub-head">
                      {col.headerTitle}
                    </th>
                  ))}
                  <th rowSpan="2">সর্বমোট</th>
                  <th rowSpan="2">GPA</th>
                  <th rowSpan="2">গ্রেড</th>
                  <th rowSpan="2">ফলাফল</th>
                </tr>
                <tr>
                  {tabulationColumns.map(col => (
                    <React.Fragment key={`${col.code}-heads`}>
                      <th className="tab-sub-col">CQ</th>
                      <th className="tab-sub-col">MCQ</th>
                      <th className="tab-sub-col">Prac</th>
                      <th className="tab-sub-col">মোট</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabulationResults.map((st) => (
                  <tr key={st.id || st.student_id}>
                    <td><span className="roll-pill">{toBnDigits(st.roll_no)}</span></td>
                    <td style={{ textAlign: 'left' }}><b>{st.name_bn}</b></td>
                    {tabulationColumns.map(colDef => {
                      const found = getStudentMarkForColumn(st, colDef);
                      if (!found) {
                        return (
                          <React.Fragment key={`${st.id}-${colDef.code}-na`}>
                            <td className="text-muted tab-sub-col">—</td>
                            <td className="text-muted tab-sub-col">—</td>
                            <td className="text-muted tab-sub-col">—</td>
                            <td className="text-muted tab-sub-col">—</td>
                          </React.Fragment>
                        );
                      }
                      let tag = null;
                      if (colDef.isMerged) {
                        if (String(found.code) === '111') tag = <span style={{ fontSize: '9px', color: '#047857', display: 'block', fontWeight: 600 }}>ইসলাম</span>;
                        else if (String(found.code) === '112') tag = <span style={{ fontSize: '9px', color: '#b45309', display: 'block', fontWeight: 600 }}>হিন্দু</span>;
                        else if (String(found.code) === '126') tag = <span style={{ fontSize: '9px', color: '#1d4ed8', display: 'block', fontWeight: 600 }}>উ: গণিত</span>;
                        else if (String(found.code) === '134') tag = <span style={{ fontSize: '9px', color: '#15803d', display: 'block', fontWeight: 600 }}>কৃষি</span>;
                      }
                      return (
                        <React.Fragment key={`${st.id}-${colDef.code}`}>
                          <td className="tab-sub-col">{found.written_max > 0 ? (found.written !== null && found.written !== undefined ? found.written : '—') : '—'}</td>
                          <td className="tab-sub-col">{found.mcq_max > 0 ? (found.mcq !== null && found.mcq !== undefined ? found.mcq : '—') : '—'}</td>
                          <td className="tab-sub-col">{found.practical_max > 0 ? (found.practical !== null && found.practical !== undefined ? found.practical : '—') : '—'}</td>
                          <td
                            className={`tab-sub-col ${found.is_pass ? 'tab-pass-cell' : 'tab-fail-cell'}`}
                            title={found.is_combined ? `${found.combined_title}: মোট প্রাপ্ত ${found.combined_total}, গ্রেড ${found.letter_grade}` : ''}
                          >
                            <b>{found.total}</b>
                            <div style={{ fontSize: '10px' }}>{found.letter_grade}</div>
                            {tag}
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
                {!tabulationResults.length && (
                  <tr>
                    <td colSpan={2 + (tabulationColumns.length * 4) + 4} className="empty-table-cell">
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
      {/* 8. MARKSHEET & PROGRESS REPORT TAB (OFFICIAL ACADEMIC TRANSCRIPT)          */}
      {/* ========================================================================= */}
      {tab === 'marksheet' && (
        <div className="marksheet-console-wrapper">
          {/* Controls */}
          <div className="marksheet-nav-toolbar no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div className="student-selector-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '13px' }}>শিক্ষার্থী নির্বাচন:</label>
              <select
                value={selectedStudentIndex}
                onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px', background: '#fff' }}
              >
                {filteredProcessedResults.map((st, idx) => (
                  <option key={st.id || idx} value={idx}>
                    রোল: {toBnDigits(st.roll_no)} — {st.name_bn} ({st.student_id}) — জিপিএ: {toBnDigits(st.gpa)}
                  </option>
                ))}
              </select>
            </div>

            {/* Signature Option Selector */}
            <div className="signature-type-selector-box" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '12px', color: '#334155' }}>
                ✍️ স্বাক্ষর:
              </span>
              <button
                type="button"
                onClick={() => setSignatureLayout('auto')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: signatureLayout === 'auto' ? 700 : 500,
                  background: signatureLayout === 'auto' ? '#0284c7' : '#f1f5f9',
                  color: signatureLayout === 'auto' ? '#fff' : '#475569',
                  border: '1px solid',
                  borderColor: signatureLayout === 'auto' ? '#0284c7' : '#cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="স্বয়ংক্রিয় প্রমিত নিয়ম: প্রোগ্রেস রিপোর্টে ৪টি স্বাক্ষর (প্রস্তুতকারী ও অভিভাবক উভয়ই), একাডেমিক ট্রান্সক্রিপ্টে ৩টি স্বাক্ষর (প্রস্তুতকারী)"
              >
                স্বয়ংক্রিয় ({isFourSignatures ? '৪টি' : '৩টি'})
              </button>
              <button
                type="button"
                onClick={() => setSignatureLayout('both')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: signatureLayout === 'both' ? 700 : 500,
                  background: signatureLayout === 'both' ? '#0284c7' : '#f1f5f9',
                  color: signatureLayout === 'both' ? '#fff' : '#475569',
                  border: '1px solid',
                  borderColor: signatureLayout === 'both' ? '#0284c7' : '#cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="শ্রেণি শিক্ষক | প্রস্তুতকারী | অভিভাবক | প্রধান শিক্ষক (৪ কলাম)"
              >
                ৪টি স্বাক্ষর (উভয়ই)
              </button>
              <button
                type="button"
                onClick={() => setSignatureLayout('preparer')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: signatureLayout === 'preparer' ? 700 : 500,
                  background: signatureLayout === 'preparer' ? '#0284c7' : '#f1f5f9',
                  color: signatureLayout === 'preparer' ? '#fff' : '#475569',
                  border: '1px solid',
                  borderColor: signatureLayout === 'preparer' ? '#0284c7' : '#cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="শ্রেণি শিক্ষক | প্রস্তুতকারী | প্রধান শিক্ষক (৩ কলাম)"
              >
                প্রস্তুতকারী (৩টি)
              </button>
              <button
                type="button"
                onClick={() => setSignatureLayout('guardian')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: signatureLayout === 'guardian' ? 700 : 500,
                  background: signatureLayout === 'guardian' ? '#0284c7' : '#f1f5f9',
                  color: signatureLayout === 'guardian' ? '#fff' : '#475569',
                  border: '1px solid',
                  borderColor: signatureLayout === 'guardian' ? '#0284c7' : '#cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="শ্রেণি শিক্ষক | অভিভাবক | প্রধান শিক্ষক (৩ কলাম)"
              >
                অভিভাবক (৩টি)
              </button>
            </div>

            <div className="nav-buttons-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-modern-action"
                onClick={() => loadProcessedResults(true)}
                title="সর্বশেষ সংরক্ষিত নম্বর থেকে ফলাফল রিফ্রেশ করুন"
                style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 600 }}
              >
                🔄 রিফ্রেশ
              </button>
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

              {/* Single Student Print & PDF Buttons */}
              <button
                type="button"
                className="btn-modern-primary"
                onClick={handlePrintMarksheet}
                title={`বর্তমানে নির্বাচিত একক শিক্ষার্থীর ${marksheetFooterDocType} সরাসরি PDF ডাউনলোড ও সংরক্ষণ করুন`}
                style={{ background: '#0284c7', borderColor: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}
              >
                📥 এই {isTranscriptExam ? 'ট্রান্সক্রিপ্ট' : 'মার্কশিট'} PDF ডাউনলোড
              </button>
              <button
                type="button"
                className="btn-modern-secondary"
                onClick={handlePrintMarksheet}
                title={`বর্তমানে নির্বাচিত একক শিক্ষার্থীর ${marksheetFooterDocType} প্রিন্ট করুন (A4)`}
                style={{ padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}
              >
                🖨️ এই {isTranscriptExam ? 'ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট'} প্রিন্ট (A4)
              </button>

              {/* Batch Print All Students in 1-click */}
              <button
                type="button"
                onClick={() => handleBatchPrintMarksheet(filteredProcessedResults)}
                title={`শ্রেণির সকল শিক্ষার্থীর ${marksheetFooterDocType} একসাথে PDF ডাউনলোড ও সেভ করুন`}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                }}
              >
                📥 সকল {isTranscriptExam ? 'একাডেমিক ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট'} PDF ({toBnDigits(filteredProcessedResults.length)} জন)
              </button>
              <button
                type="button"
                onClick={() => handleBatchPrintMarksheet(filteredProcessedResults)}
                title={`শ্রেণির সকল শিক্ষার্থীর ${marksheetFooterDocType} একসাথে একের পর এক আলাদা পৃষ্ঠায় প্রিন্ট করুন`}
                style={{
                  background: '#047857',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(4, 120, 87, 0.25)'
                }}
              >
                🖨️ সকল {isTranscriptExam ? 'একাডেমিক ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট'} প্রিন্ট
              </button>

              {/* Advanced Batch Range Options */}
              <button
                type="button"
                onClick={() => setShowBatchPrintDrawer(!showBatchPrintDrawer)}
                title="রোল নম্বর রেঞ্জ বা পাস/ফেল অনুসারে একাধিক প্রগ্রেস রিপোর্ট প্রিন্ট"
                style={{
                  background: showBatchPrintDrawer ? '#334155' : '#fff',
                  color: showBatchPrintDrawer ? '#fff' : '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '12.5px'
                }}
              >
                ⚙️ রোল রেঞ্জ / কাস্টম ব্যাচ {showBatchPrintDrawer ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Collapsible Batch Print Drawer */}
          {showBatchPrintDrawer && (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #059669',
              borderRadius: '8px',
              padding: '12px 18px',
              marginBottom: '16px',
              animation: 'fadeIn 0.2s ease'
            }} className="no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px dashed #a7f3d0', paddingBottom: '6px' }}>
                <b style={{ color: '#065f46', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📑 একাধিক শিক্ষার্থীর {isTranscriptExam ? 'একাডেমিক ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট'} একসাথে প্রিন্ট অপশন (ব্যাচ প্রিন্ট)
                </b>
                <span style={{ fontSize: '12px', color: '#047857' }}>
                  * প্রতিটি শিক্ষার্থীর {isTranscriptExam ? 'ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট'} স্বয়ংক্রিয়ভাবে আলাদা আলাদা A4 পেজে প্রিন্ট হবে
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="radio"
                    name="batchMode"
                    value="all"
                    checked={batchPrintMode === 'all'}
                    onChange={() => setBatchPrintMode('all')}
                  />
                  শ্রেণির সকল শিক্ষার্থী ({toBnDigits(filteredProcessedResults.length)} জন)
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="radio"
                    name="batchMode"
                    value="range"
                    checked={batchPrintMode === 'range'}
                    onChange={() => setBatchPrintMode('range')}
                  />
                  রোল নম্বর রেঞ্জ:
                </label>

                {batchPrintMode === 'range' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>রোল হতে:</span>
                    <input
                      type="number"
                      placeholder="যেমন: ১"
                      value={batchRollFrom}
                      onChange={e => setBatchRollFrom(e.target.value)}
                      style={{ width: '65px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12.5px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>পর্যন্ত:</span>
                    <input
                      type="number"
                      placeholder="যেমন: ২৫"
                      value={batchRollTo}
                      onChange={e => setBatchRollTo(e.target.value)}
                      style={{ width: '65px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12.5px' }}
                    />
                  </div>
                )}

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="radio"
                    name="batchMode"
                    value="passed"
                    checked={batchPrintMode === 'passed'}
                    onChange={() => setBatchPrintMode('passed')}
                  />
                  শুধুমাত্র উত্তীর্ণ / পাস ({toBnDigits(filteredProcessedResults.filter(s => s.result_status === 'উত্তীর্ণ' || s.final_grade !== 'F').length)} জন)
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="radio"
                    name="batchMode"
                    value="failed"
                    checked={batchPrintMode === 'failed'}
                    onChange={() => setBatchPrintMode('failed')}
                  />
                  অনুত্তীর্ণ / ফেল ({toBnDigits(filteredProcessedResults.filter(s => s.result_status !== 'উত্তীর্ণ' && s.final_grade === 'F').length)} জন)
                </label>

                <div style={{ display: 'inline-flex', gap: '8px', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={handleExecuteBatchPrint}
                    style={{
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                    }}
                    title={`নির্বাচিত শিক্ষার্থীদের ${marksheetFooterDocType} PDF হিসেবে সেভ করুন`}
                  >
                    📥 নির্বাচিত {isTranscriptExam ? 'ট্রান্সক্রিপ্ট' : 'প্রোগ্রেস রিপোর্ট'} PDF ({toBnDigits(getSelectedBatchStudents().length)} জন)
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBatchPrint}
                    style={{
                      background: '#047857',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      boxShadow: '0 2px 4px rgba(4, 120, 87, 0.25)'
                    }}
                    title="নির্বাচিত শিক্ষার্থীদের প্রগ্রেস রিপোর্ট সরাসরি প্রিন্ট করুন"
                  >
                    🖨️ প্রিন্ট করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStudentResult ? (
            <div className="official-marksheet-wrapper" id="official-academic-transcript">
              <div className="transcript-top-content">
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
                  {marksheetDocTitle}
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
                    <b>পরীক্ষার নাম:</b> {selectedExamObj ? selectedExamObj.name_bn : (isTranscriptExam ? 'নির্বাচনী পরীক্ষা' : 'অর্ধ-বার্ষিক পরীক্ষা')}
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 3: SUBJECTS & MARKS TABLE */}
              {/* ========================================================= */}
              <table className="marksheet-subjects-table marksheet-board-table">
                <thead>
                  <tr>
                    <th rowSpan="2" style={{ width: '75px' }}>Subject Code</th>
                    <th rowSpan="2" style={{ textAlign: 'center' }}>Subject Name</th>
                    <th colSpan="4">Marks</th>
                    <th rowSpan="2" style={{ width: '80px' }}>Grade</th>
                  </tr>
                  <tr>
                    <th style={{ width: '75px' }}>CQ/Theory</th>
                    <th style={{ width: '65px' }}>MCQ</th>
                    <th style={{ width: '65px' }}>Practical</th>
                    <th style={{ width: '70px' }}>Total</th>
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
                  <div className="summary-label">
                    {isSSC && department && department !== 'all' && department !== 'সকল বিভাগ' ? `${department} মেধা স্থান` : 'শ্রেণি মেধা স্থান'}
                  </div>
                  <div className="summary-val">
                    {(currentStudentResult.display_merit || currentStudentResult.dept_merit || currentStudentResult.merit) ? `${toBnDigits(currentStudentResult.display_merit || currentStudentResult.dept_merit || currentStudentResult.merit)} তম` : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="transcript-bottom-content">
                {/* Signature Zone */}
                <div className={`transcript-signatures-zone ${isFourSignatures ? 'four-columns' : 'three-columns'}`}>
                  <div className="sig-column">
                    <div className="sig-dots">{sigDotsText}</div>
                    <div>শ্রেণি শিক্ষকের স্বাক্ষর</div>
                  </div>
                  {isFourSignatures ? (
                    <>
                      <div className="sig-column">
                        <div className="sig-dots">{sigDotsText}</div>
                        <div>প্রস্তুতকারীর স্বাক্ষর</div>
                      </div>
                      <div className="sig-column">
                        <div className="sig-dots">{sigDotsText}</div>
                        <div>অভিভাবকের স্বাক্ষর</div>
                      </div>
                    </>
                  ) : (
                    <div className="sig-column">
                      <div className="sig-dots">{sigDotsText}</div>
                      <div>{activeCenterSig}</div>
                    </div>
                  )}
                  <div className="sig-column">
                    <div className="sig-dots">{sigDotsText}</div>
                    <div>প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</div>
                  </div>
                </div>

                {/* স্বাক্ষরের নিচে সিলদেয়ার জায়গা (Space for Official Seal below Signature) */}
                <div className="transcript-seal-space" style={{ height: '52px', margin: '6px 0 8px 0' }}></div>

                {/* Footer info */}
                <div className="transcript-footer-line">
                  <span>ফলাফল প্রকাশের তারিখ: {toBnDigits(new Date().toLocaleDateString('bn-BD'))} খ্রি.</span>
                  <span>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, কালিহাতী, টাঙ্গাইল — কম্পিউটার প্রস্তুতকৃত {marksheetFooterDocType}</span>
                </div>
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
      {/* 11. RESULT ANALYSIS TAB                                                   */}
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
