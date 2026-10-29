// Data Store for Exam Results: Admission, Half-Yearly, Annual, Pre-Test, Test & Public Exams
// Strictly respects class restrictions:
// - অর্ধ-বার্ষিক পরীক্ষা: ৬ষ্ঠ-১০ম শ্রেণি
// - বার্ষিক পরীক্ষা: ৬ষ্ঠ-৯ম শ্রেণি (১০ম শ্রেণির বার্ষিক পরীক্ষা হয় না)
// - প্রাক-নির্বাচনী পরীক্ষা: ১০ম শ্রেণি (এসএসসি প্রস্তুতি)
// - নির্বাচনী পরীক্ষা: ১০ম শ্রেণি (এসএসসি টেস্ট পরীক্ষা)

import { processClassResults, toBnDigits } from './boardExamEngine.js';
import { MOCK_STUDENTS, MOCK_SUBJECTS, MOCK_MARKS } from './mockData.js';

const CLASS_BN_MAP = {
  '6': '৬ষ্ঠ', '7': '৭ম', '8': '৮ম', '9': '৯ম', '10': '১০ম',
  '৬': '৬ষ্ঠ', '৭': '৭ম', '৮': '৮ম', '৯': '৯ম', '১০': '১০ম',
  '৬ষ্ঠ': '৬ষ্ঠ', '৭ম': '৭ম', '৮ম': '৮ম', '৯ম': '৯ম', '১০ম': '১০ম'
};

const CLASS_NEXT_MAP = {
  '6': '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '7': '৮ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '8': '৯ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '9': '১০ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৬': '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৭': '৮ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৮': '৯ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৯': '১০ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৬ষ্ঠ': '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৭ম': '৮ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৮ম': '৯ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত',
  '৯ম': '১০ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত'
};

const normCls = (c) => {
  if (!c) return '';
  return String(c).replace(/^(class|শ্রেণি|শ্রেণী)\s*/i, '').replace(/[thstndrdমষ্ঠর্থ]/gi, '').trim()
    .replace(/০/g, '0').replace(/১/g, '1').replace(/২/g, '2').replace(/৩/g, '3').replace(/৪/g, '4')
    .replace(/৫/g, '5').replace(/৬/g, '6').replace(/৭/g, '7').replace(/৮/g, '8').replace(/৯/g, '9');
};

// Default structures kept for backward-compatibility if referenced elsewhere, but NEVER shown when school results are expected.
export const DEFAULT_ADMISSION_RESULTS = [];
export const DEFAULT_HALF_YEARLY_RESULTS = [];
export const DEFAULT_ANNUAL_RESULTS = [];
export const DEFAULT_PRE_TEST_RESULTS = [];
export const DEFAULT_TEST_RESULTS = [];

export const DEFAULT_PUBLIC_EXAM_RESULTS = [
  { id: 'pub-ssc-2025', year: '২০২৫', exam_name: 'এসএসসি পরীক্ষা ২০২৫', candidates: 148, passed: 145, gpa5: 38, golden_gpa5: 18, pass_rate: '৯৭.৯৭%', board: 'ঢাকা শিক্ষা বোর্ড' },
  { id: 'pub-ssc-2024', year: '২০২৪', exam_name: 'এসএসসি পরীক্ষা ২০২৪', candidates: 142, passed: 139, gpa5: 34, golden_gpa5: 14, pass_rate: '৯৭.৮৯%', board: 'ঢাকা শিক্ষা বোর্ড' },
  { id: 'pub-ssc-2023', year: '২০২৩', exam_name: 'এসএসসি পরীক্ষা ২০২৩', candidates: 138, passed: 134, gpa5: 31, golden_gpa5: 12, pass_rate: '৯৭.১০%', board: 'ঢাকা শিক্ষা বোর্ড' }
];

// Helper to find exam by keywords
function findExamId(keywords = [], fallbackId = '') {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('magra_db_exams');
      if (raw) {
        const exams = JSON.parse(raw);
        if (Array.isArray(exams)) {
          const match = exams.find(e => {
            const name = (e.name_bn || '').toLowerCase();
            const type = (e.exam_type || '').toLowerCase();
            const id = (e.id || '').toLowerCase();
            return keywords.some(kw => name.includes(kw) || type.includes(kw) || id.includes(kw));
          });
          if (match) return match.id;
        }
      }
    }
  } catch {}
  return fallbackId;
}

// -------------------------------------------------------------------------
// 1. Live Pre-Test Results (Class 10 only)
// -------------------------------------------------------------------------
export function getLivePreTestClassResults() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const examId = findExamId(['প্রাক-নির্বাচনী', 'প্রাক-নির্বাচনি', 'pre-test', 'pre_test'], 'ex-pre-test-10');

    let processed = null;
    const cacheKeys = [`magra_db_results_${examId}_10`, `magra_db_results_${examId}_১০ম`, 'magra_db_results_ex-pre-test-10_10'];
    for (const key of cacheKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) { processed = parsed; break; }
        } catch {}
      }
    }

    const rawMarks = localStorage.getItem('magra_db_marks');
    const marksList = rawMarks ? JSON.parse(rawMarks) : (Array.isArray(MOCK_MARKS) ? MOCK_MARKS : []);
    const hasMarks = marksList.some(m => String(m.exam_id) === String(examId) || String(m.exam_id).includes('pre-test') || String(m.exam_id).includes('pre_test'));

    if (!processed && hasMarks) {
      const rawStudents = localStorage.getItem('magra_db_students');
      const students = rawStudents ? JSON.parse(rawStudents) : MOCK_STUDENTS;
      const rawSubjects = localStorage.getItem('magra_db_subjects');
      let subjects = rawSubjects ? JSON.parse(rawSubjects) : MOCK_SUBJECTS;
      if (!Array.isArray(subjects) || subjects.length < 20) subjects = MOCK_SUBJECTS;

      processed = processClassResults(students, subjects, marksList, '10', examId);
      if (processed && processed.length) {
        try { localStorage.setItem(`magra_db_results_${examId}_10`, JSON.stringify(processed)); } catch {}
      }
    }

    if (processed && Array.isArray(processed) && processed.length > 0) {
      return processed.map((p, idx) => {
        const rollBn = toBnDigits(p.roll_no || p.roll || (idx + 1));
        const deptRaw = p.department || p.group_name || 'বিজ্ঞান';
        const sectionStr = deptRaw.includes('বিভাগ') || deptRaw.includes('শাখা') ? deptRaw : `${deptRaw} বিভাগ`;
        const gpaNum = Number(p.gpa) || 0;
        const finalGrade = p.final_grade || p.letter_grade || 'F';
        const isPass = p.is_pass !== false && finalGrade !== 'F';

        let status = isPass 
          ? (gpaNum >= 5.0 ? 'উত্তীর্ণ (চমৎকার প্রস্তুতি)' : (gpaNum >= 4.0 ? 'উত্তীর্ণ (সন্তোষজনক)' : 'উত্তীর্ণ (অগ্রগতিশীল)'))
          : 'অনুত্তীর্ণ (বিশেষ পরিচর্যা আবশ্যক)';

        let notes = p.remarks || '';
        if (!notes) {
          if (isPass) {
            notes = gpaNum >= 5.0 ? 'বোর্ড পরীক্ষায় জিপিএ-৫ প্রত্যাশী' : 'এসএসসি পরীক্ষার জন্য ভালো প্রস্তুতি';
          } else {
            const failCount = p.failed_count || p.failed_subjects_count || 1;
            notes = `${toBnDigits(failCount)} টি বিষয়ে বিশেষ কোচিং ও অতিরিক্ত ক্লাসে উপস্থিতি বাধ্যতামূলক`;
          }
        }

        return {
          id: p.student_id ? `pt-live-${p.student_id}` : `pt-live-${p.roll_no || idx}`,
          student_id: p.student_id || p.id,
          roll_no: rollBn,
          name_bn: p.name_bn || p.name || 'শিক্ষার্থী',
          name_en: p.name_en || '',
          class_name: '১০ম',
          section: sectionStr,
          department: deptRaw,
          marks: Number(p.total_marks || p.marks || 0),
          gpa: typeof p.gpa === 'number' ? p.gpa.toFixed(2) : (p.gpa || '0.00'),
          grade: finalGrade,
          merit_pos: p.merit || (idx + 1),
          status,
          notes,
          subjects: p.subjects || [],
          is_live: true
        };
      });
    }
  } catch (err) {
    console.error('getLivePreTestClassResults error:', err);
  }
  return null;
}

export function getStoredPreTestResults() {
  try {
    const liveResults = getLivePreTestClassResults();
    const raw = localStorage.getItem('magra_db_pre_test_results');
    let customItems = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        customItems = parsed.filter(p => !p.id || (!String(p.id).startsWith('pt-10-') && !String(p.id).startsWith('pt-dummy-')) || p.is_custom);
      }
    }

    if (liveResults && liveResults.length > 0) {
      if (customItems.length > 0) {
        const liveIds = new Set(liveResults.map(r => String(r.student_id || r.id)));
        const nonDup = customItems.filter(c => !liveIds.has(String(c.student_id || c.id)));
        return [...liveResults, ...nonDup];
      }
      return liveResults;
    }

    if (customItems.length > 0) return customItems;
  } catch {}
  return [];
}

export function saveStoredPreTestResults(data) {
  try {
    localStorage.setItem('magra_db_pre_test_results', JSON.stringify(data));
  } catch {}
}

// -------------------------------------------------------------------------
// 2. Live Test Exam Results (Class 10 only - SSC Candidate Eligibility)
// -------------------------------------------------------------------------
export function getLiveTestClassResults() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const examId = findExamId(['নির্বাচনী', 'নির্বাচনি', 'ssc test', 'ex-test-10'], 'ex-test-10');

    let processed = null;
    const cacheKeys = [`magra_db_results_${examId}_10`, `magra_db_results_${examId}_১০ম`, 'magra_db_results_ex-test-10_10'];
    for (const key of cacheKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) { processed = parsed; break; }
        } catch {}
      }
    }

    const rawMarks = localStorage.getItem('magra_db_marks');
    const marksList = rawMarks ? JSON.parse(rawMarks) : (Array.isArray(MOCK_MARKS) ? MOCK_MARKS : []);
    const hasMarks = marksList.some(m => String(m.exam_id) === String(examId) || (!String(m.exam_id).includes('pre-test') && (String(m.exam_id).includes('test') || String(m.exam_id).includes('নির্বাচন'))));

    if (!processed && hasMarks) {
      const rawStudents = localStorage.getItem('magra_db_students');
      const students = rawStudents ? JSON.parse(rawStudents) : MOCK_STUDENTS;
      const rawSubjects = localStorage.getItem('magra_db_subjects');
      let subjects = rawSubjects ? JSON.parse(rawSubjects) : MOCK_SUBJECTS;
      if (!Array.isArray(subjects) || subjects.length < 20) subjects = MOCK_SUBJECTS;

      processed = processClassResults(students, subjects, marksList, '10', examId);
      if (processed && processed.length) {
        try { localStorage.setItem(`magra_db_results_${examId}_10`, JSON.stringify(processed)); } catch {}
      }
    }

    if (processed && Array.isArray(processed) && processed.length > 0) {
      return processed.map((p, idx) => {
        const rollBn = toBnDigits(p.roll_no || p.roll || (idx + 1));
        const deptRaw = p.department || p.group_name || 'বিজ্ঞান';
        const sectionStr = deptRaw.includes('বিভাগ') || deptRaw.includes('শাখা') ? deptRaw : `${deptRaw} বিভাগ`;
        const finalGrade = p.final_grade || p.letter_grade || 'F';
        const isPass = p.is_pass !== false && finalGrade !== 'F';

        return {
          id: p.student_id ? `test-live-${p.student_id}` : `test-live-${p.roll_no || idx}`,
          student_id: p.student_id || p.id,
          roll_no: rollBn,
          name_bn: p.name_bn || p.name || 'শিক্ষার্থী',
          name_en: p.name_en || '',
          class_name: '১০ম',
          section: sectionStr,
          department: deptRaw,
          marks: Number(p.total_marks || p.marks || 0),
          gpa: typeof p.gpa === 'number' ? p.gpa.toFixed(2) : (p.gpa || '0.00'),
          grade: finalGrade,
          merit_pos: p.merit || (idx + 1),
          ssc_clearance: isPass ? 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)' : 'বোর্ড পরীক্ষার জন্য সাময়িক স্থগিত (অননুমোদিত)',
          notes: isPass ? 'এসএসসি ফরমপূরণ ও প্রবেশপত্র অনুমোদিত' : 'বিশেষ বিবেচনা ও পুনঃমূল্যায়ন সাপেক্ষ',
          subjects: p.subjects || [],
          is_live: true
        };
      });
    }
  } catch (err) {
    console.error('getLiveTestClassResults error:', err);
  }
  return null;
}

export function getStoredTestResults() {
  try {
    const liveResults = getLiveTestClassResults();
    const raw = localStorage.getItem('magra_db_test_results');
    let customItems = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        customItems = parsed.filter(p => !p.id || (!String(p.id).startsWith('test-10-') && !String(p.id).startsWith('test-dummy-')) || p.is_custom);
      }
    }

    if (liveResults && liveResults.length > 0) {
      if (customItems.length > 0) {
        const liveIds = new Set(liveResults.map(r => String(r.student_id || r.id)));
        const nonDup = customItems.filter(c => !liveIds.has(String(c.student_id || c.id)));
        return [...liveResults, ...nonDup];
      }
      return liveResults;
    }

    if (customItems.length > 0) return customItems;
  } catch {}
  return [];
}

export function saveStoredTestResults(data) {
  try {
    localStorage.setItem('magra_db_test_results', JSON.stringify(data));
  } catch {}
}

// -------------------------------------------------------------------------
// 3. Live Half-Yearly Results (Classes 6-10)
// -------------------------------------------------------------------------
export function getLiveHalfYearlyClassResults() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const examId = findExamId(['অর্ধবার্ষিক', 'অর্ধ-বার্ষিক', 'half_yearly', 'half-yearly'], 'ex-2');

    const rawStudents = localStorage.getItem('magra_db_students');
    const students = rawStudents ? JSON.parse(rawStudents) : MOCK_STUDENTS;
    const rawSubjects = localStorage.getItem('magra_db_subjects');
    let subjects = rawSubjects ? JSON.parse(rawSubjects) : MOCK_SUBJECTS;
    if (!Array.isArray(subjects) || subjects.length < 20) subjects = MOCK_SUBJECTS;

    const rawMarks = localStorage.getItem('magra_db_marks');
    const marksList = rawMarks ? JSON.parse(rawMarks) : (Array.isArray(MOCK_MARKS) ? MOCK_MARKS : []);

    const allHalfYearly = [];
    const classes = ['6', '7', '8', '9', '10'];

    classes.forEach(cls => {
      let processed = null;
      const cacheKey = `magra_db_results_${examId}_${cls}`;
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) processed = parsed;
        } catch {}
      }

      if (!processed) {
        const hasMarksForClass = marksList.some(m => (String(m.exam_id) === String(examId) || String(m.exam_id).includes('half')) && (String(m.class_name) === String(cls) || normCls(m.class_name) === cls));
        if (hasMarksForClass) {
          processed = processClassResults(students, subjects, marksList, cls, examId);
          if (processed && processed.length) {
            try { localStorage.setItem(cacheKey, JSON.stringify(processed)); } catch {}
          }
        }
      }

      if (processed && Array.isArray(processed) && processed.length) {
        const clsBn = CLASS_BN_MAP[cls] || `${cls}ম`;
        processed.forEach((p, idx) => {
          const rollBn = toBnDigits(p.roll_no || p.roll || (idx + 1));
          const finalGrade = p.final_grade || p.letter_grade || 'F';
          const isPass = p.is_pass !== false && finalGrade !== 'F';

          allHalfYearly.push({
            id: p.student_id ? `hy-live-${cls}-${p.student_id}` : `hy-live-${cls}-${idx}`,
            student_id: p.student_id || p.id,
            roll_no: rollBn,
            name_bn: p.name_bn || p.name || 'শিক্ষার্থী',
            class_name: clsBn,
            section: p.section || (p.department ? `${p.department} বিভাগ` : 'ক শাখা'),
            department: p.department || '',
            marks: Number(p.total_marks || p.marks || 0),
            gpa: typeof p.gpa === 'number' ? p.gpa.toFixed(2) : (p.gpa || '0.00'),
            grade: finalGrade,
            merit_pos: p.merit || (idx + 1),
            status: isPass ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
            is_live: true
          });
        });
      }
    });

    if (allHalfYearly.length > 0) return allHalfYearly;
  } catch (err) {
    console.error('getLiveHalfYearlyClassResults error:', err);
  }
  return null;
}

export function getStoredHalfYearlyResults() {
  try {
    const liveResults = getLiveHalfYearlyClassResults();
    const raw = localStorage.getItem('magra_db_half_yearly_results');
    let customItems = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        customItems = parsed.filter(p => !p.id || (!String(p.id).startsWith('hy-') && !String(p.id).startsWith('hy-dummy-')) || p.is_custom);
      }
    }

    if (liveResults && liveResults.length > 0) {
      if (customItems.length > 0) {
        const liveIds = new Set(liveResults.map(r => String(r.student_id || r.id)));
        const nonDup = customItems.filter(c => !liveIds.has(String(c.student_id || c.id)));
        return [...liveResults, ...nonDup];
      }
      return liveResults;
    }

    if (customItems.length > 0) return customItems;
  } catch {}
  return [];
}

export function saveStoredHalfYearlyResults(data) {
  try {
    localStorage.setItem('magra_db_half_yearly_results', JSON.stringify(data));
  } catch {}
}

// -------------------------------------------------------------------------
// 4. Live Annual Results (Classes 6-9 strictly)
// -------------------------------------------------------------------------
export function getLiveAnnualClassResults() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const examId = findExamId(['বার্ষিক', 'annual'], 'ex-3');

    const rawStudents = localStorage.getItem('magra_db_students');
    const students = rawStudents ? JSON.parse(rawStudents) : MOCK_STUDENTS;
    const rawSubjects = localStorage.getItem('magra_db_subjects');
    let subjects = rawSubjects ? JSON.parse(rawSubjects) : MOCK_SUBJECTS;
    if (!Array.isArray(subjects) || subjects.length < 20) subjects = MOCK_SUBJECTS;

    const rawMarks = localStorage.getItem('magra_db_marks');
    const marksList = rawMarks ? JSON.parse(rawMarks) : (Array.isArray(MOCK_MARKS) ? MOCK_MARKS : []);

    const allAnnual = [];
    const classes = ['6', '7', '8', '9'];

    classes.forEach(cls => {
      let processed = null;
      const cacheKey = `magra_db_results_${examId}_${cls}`;
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) processed = parsed;
        } catch {}
      }

      if (!processed) {
        const hasMarksForClass = marksList.some(m => (String(m.exam_id) === String(examId) || String(m.exam_id).includes('annual')) && (String(m.class_name) === String(cls) || normCls(m.class_name) === cls));
        if (hasMarksForClass) {
          processed = processClassResults(students, subjects, marksList, cls, examId);
          if (processed && processed.length) {
            try { localStorage.setItem(cacheKey, JSON.stringify(processed)); } catch {}
          }
        }
      }

      if (processed && Array.isArray(processed) && processed.length) {
        const clsBn = CLASS_BN_MAP[cls] || `${cls}ম`;
        processed.forEach((p, idx) => {
          const rollBn = toBnDigits(p.roll_no || p.roll || (idx + 1));
          const finalGrade = p.final_grade || p.letter_grade || 'F';
          const isPass = p.is_pass !== false && finalGrade !== 'F';

          allAnnual.push({
            id: p.student_id ? `an-live-${cls}-${p.student_id}` : `an-live-${cls}-${idx}`,
            student_id: p.student_id || p.id,
            roll_no: rollBn,
            name_bn: p.name_bn || p.name || 'শিক্ষার্থী',
            class_name: clsBn,
            section: p.section || (p.department ? `${p.department} বিভাগ` : 'ক শাখা'),
            department: p.department || '',
            marks: Number(p.total_marks || p.marks || 0),
            gpa: typeof p.gpa === 'number' ? p.gpa.toFixed(2) : (p.gpa || '0.00'),
            grade: finalGrade,
            merit_pos: p.merit || (idx + 1),
            promotion_status: isPass ? CLASS_NEXT_MAP[cls] : 'প্রমোশন স্থগিত (অকৃতকার্য)',
            is_live: true
          });
        });
      }
    });

    if (allAnnual.length > 0) return allAnnual;
  } catch (err) {
    console.error('getLiveAnnualClassResults error:', err);
  }
  return null;
}

export function getStoredAnnualResults() {
  try {
    const liveResults = getLiveAnnualClassResults();
    const raw = localStorage.getItem('magra_db_annual_results');
    let customItems = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        customItems = parsed.filter(p => !p.id || (!String(p.id).startsWith('an-') && !String(p.id).startsWith('an-dummy-')) || p.is_custom);
      }
    }

    if (liveResults && liveResults.length > 0) {
      if (customItems.length > 0) {
        const liveIds = new Set(liveResults.map(r => String(r.student_id || r.id)));
        const nonDup = customItems.filter(c => !liveIds.has(String(c.student_id || c.id)));
        return [...liveResults, ...nonDup];
      }
      return liveResults;
    }

    if (customItems.length > 0) return customItems;
  } catch {}
  return [];
}

export function saveStoredAnnualResults(data) {
  try {
    localStorage.setItem('magra_db_annual_results', JSON.stringify(data));
  } catch {}
}

// -------------------------------------------------------------------------
// 5. Admission Results
// -------------------------------------------------------------------------
export function getStoredAdmissionResults() {
  try {
    const raw = localStorage.getItem('magra_db_admission_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        const userItems = parsed.filter(p => !p.id || (!String(p.id).startsWith('adm-res-') && !String(p.id).startsWith('adm-dummy-')) || p.is_custom);
        if (userItems.length) return userItems;
        return parsed;
      }
    }
  } catch {}
  return [];
}

export function saveStoredAdmissionResults(data) {
  try {
    localStorage.setItem('magra_db_admission_results', JSON.stringify(data));
  } catch {}
}

// -------------------------------------------------------------------------
// 6. Public Exam Results (SSC Archive)
// -------------------------------------------------------------------------
export function getStoredPublicExamResults() {
  try {
    const raw = localStorage.getItem('magra_db_public_exam_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_PUBLIC_EXAM_RESULTS;
}

export function saveStoredPublicExamResults(data) {
  try {
    localStorage.setItem('magra_db_public_exam_results', JSON.stringify(data));
  } catch {}
}
