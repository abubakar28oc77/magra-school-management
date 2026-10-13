// Dhaka Education Board JSC & SSC Standard Examination and Grading Engine
// Covers: Classes 6-8 (JSC Pattern) & Classes 9-10 (SSC Pattern: Science, Humanities, Business Studies)

export const DHAKA_BOARD_GRADING_SCALE = [
  { min_pct: 80, max_pct: 100, letter_grade: 'A+', gpa: 5.0, label_bn: 'অসাধারণ (Outstanding)' },
  { min_pct: 70, max_pct: 79.99, letter_grade: 'A', gpa: 4.0, label_bn: 'চমৎকার (Excellent)' },
  { min_pct: 60, max_pct: 69.99, letter_grade: 'A-', gpa: 3.5, label_bn: 'খুব ভালো (Very Good)' },
  { min_pct: 50, max_pct: 59.99, letter_grade: 'B', gpa: 3.0, label_bn: 'ভালো (Good)' },
  { min_pct: 40, max_pct: 49.99, letter_grade: 'C', gpa: 2.0, label_bn: 'সন্তোষজনক (Satisfactory)' },
  { min_pct: 33, max_pct: 39.99, letter_grade: 'D', gpa: 1.0, label_bn: 'উত্তীর্ণ (Sufficient)' },
  { min_pct: 0, max_pct: 32.99, letter_grade: 'F', gpa: 0.0, label_bn: 'অকৃতকার্য (Fail)' }
];

export function getLetterAndPoint(pct) {
  if (pct >= 80) return { letter: 'A+', gp: 5.0 };
  if (pct >= 70) return { letter: 'A', gp: 4.0 };
  if (pct >= 60) return { letter: 'A-', gp: 3.5 };
  if (pct >= 50) return { letter: 'B', gp: 3.0 };
  if (pct >= 40) return { letter: 'C', gp: 2.0 };
  if (pct >= 33) return { letter: 'D', gp: 1.0 };
  return { letter: 'F', gp: 0.0 };
}

export function getFinalGradeFromGpa(gpaNum) {
  if (gpaNum >= 5.0) return 'A+';
  if (gpaNum >= 4.0) return 'A';
  if (gpaNum >= 3.5) return 'A-';
  if (gpaNum >= 3.0) return 'B';
  if (gpaNum >= 2.0) return 'C';
  if (gpaNum >= 1.0) return 'D';
  return 'F';
}

/**
 * Calculate grade for an individual subject according to Dhaka Board pass-fail rules.
 * Separate pass rules for Written (CQ), MCQ, and Practical.
 */
export function calculateSubjectGrade(subject, markRecord = {}) {
  const full = Number(subject.full_marks) || 100;
  
  if (!markRecord || markRecord.absent) {
    return {
      subject_id: subject.id,
      code: subject.code || '—',
      name_bn: subject.name_bn,
      name_en: subject.name_en || '',
      department: subject.department || 'সাধারণ',
      is_optional: !!subject.is_optional,
      full_marks: full,
      written: 0,
      mcq: 0,
      practical: 0,
      total: 0,
      letter_grade: 'F',
      gp: 0.0,
      is_pass: false,
      absent: true,
      fail_reason: 'অনুপস্থিত'
    };
  }

  const written = markRecord.written !== '' && markRecord.written !== null && markRecord.written !== undefined ? Number(markRecord.written) : null;
  const mcq = markRecord.mcq !== '' && markRecord.mcq !== null && markRecord.mcq !== undefined ? Number(markRecord.mcq) : null;
  const practical = markRecord.practical !== '' && markRecord.practical !== null && markRecord.practical !== undefined ? Number(markRecord.practical) : null;

  const wVal = written || 0;
  const mVal = mcq || 0;
  const pVal = practical || 0;
  const total = wVal + mVal + pVal;

  let passWritten = true;
  let passMcq = true;
  let passPrac = true;
  const failParts = [];

  // Written / CQ check
  if ((subject.written_max || 0) > 0) {
    const minW = subject.written_pass !== undefined ? subject.written_pass : Math.ceil(subject.written_max * 0.33);
    if (wVal < minW) {
      passWritten = false;
      failParts.push(`লিখিত/CQ (${wVal} < ${minW})`);
    }
  }

  // MCQ check
  if ((subject.mcq_max || 0) > 0) {
    const minM = subject.mcq_pass !== undefined ? subject.mcq_pass : Math.ceil(subject.mcq_max * 0.33);
    if (mVal < minM) {
      passMcq = false;
      failParts.push(`MCQ (${mVal} < ${minM})`);
    }
  }

  // Practical check
  if ((subject.practical_max || 0) > 0) {
    const minP = subject.practical_pass !== undefined ? subject.practical_pass : Math.ceil(subject.practical_max * 0.33);
    if (pVal < minP) {
      passPrac = false;
      failParts.push(`ব্যবহারিক (${pVal} < ${minP})`);
    }
  }

  const minTotal = subject.pass_marks !== undefined ? subject.pass_marks : Math.ceil(full * 0.33);
  const passTotal = total >= minTotal;
  if (!passTotal) {
    failParts.push(`মোট প্রাপ্ত (${total} < ${minTotal})`);
  }

  const is_pass = passWritten && passMcq && passPrac && passTotal;
  const pct = full > 0 ? (total / full) * 100 : 0;
  const { letter, gp } = is_pass ? getLetterAndPoint(pct) : { letter: 'F', gp: 0.0 };

  return {
    subject_id: subject.id,
    code: subject.code || '—',
    name_bn: subject.name_bn,
    name_en: subject.name_en || '',
    department: subject.department || 'সাধারণ',
    is_optional: !!subject.is_optional,
    full_marks: full,
    written_max: subject.written_max || 0,
    mcq_max: subject.mcq_max || 0,
    practical_max: subject.practical_max || 0,
    written: wVal,
    mcq: mVal,
    practical: pVal,
    total,
    percentage: Number(pct.toFixed(1)),
    letter_grade: letter,
    gp,
    is_pass,
    absent: false,
    fail_reason: failParts.length ? failParts.join(', ') : ''
  };
}

/**
 * Calculate overall student examination result according to JSC vs SSC rules.
 * SSC: 4th Subject Rule:
 *  - Bonus GP = Math.max(0, Optional GP - 2.0)
 *  - Total GP = Sum(Main GP) + Bonus GP
 *  - Overall GPA = Math.min(5.00, Total GP / Main Subjects Count)
 *  - Fail in 4th subject does NOT fail the student overall!
 *  - Fail in any main subject causes overall failure (F / 0.00).
 *
 * JSC:
 *  - All core subjects must be passed. Any F causes overall failure (F / 0.00).
 *  - Overall GPA = Sum(GP) / Subjects Count.
 */
export function calculateOverallResult(studentClass, subjectResults) {
  const isSSC = ['9', '10', '৯', '১০'].includes(String(studentClass));

  let totalObtained = 0;
  let totalFull = 0;
  let hasFailInMain = false;
  const mainSubjects = [];
  const optionalSubjects = [];
  const failedSubjects = [];

  subjectResults.forEach(sub => {
    totalObtained += (sub.total || 0);
    totalFull += (sub.full_marks || 100);

    if (isSSC && sub.is_optional) {
      optionalSubjects.push(sub);
      if (!sub.is_pass) {
        failedSubjects.push(`${sub.name_bn} (৪র্থ বিষয়)`);
      }
    } else {
      mainSubjects.push(sub);
      if (!sub.is_pass) {
        hasFailInMain = true;
        failedSubjects.push(sub.name_bn);
      }
    }
  });

  const percentage = totalFull > 0 ? ((totalObtained / totalFull) * 100).toFixed(1) : '0.0';

  if (hasFailInMain || mainSubjects.length === 0) {
    return {
      result_status: 'অকৃতকার্য',
      gpa: '0.00',
      final_grade: 'F',
      total_marks: totalObtained,
      total_full_marks: totalFull,
      percentage,
      is_pass: false,
      failed_count: failedSubjects.length,
      failed_subjects: failedSubjects,
      bonus_point: 0,
      subject_count: subjectResults.length
    };
  }

  // All main subjects passed!
  const mainGpSum = mainSubjects.reduce((sum, s) => sum + s.gp, 0);
  let bonusPoint = 0;

  if (isSSC && optionalSubjects.length > 0) {
    const opt = optionalSubjects[0];
    if (opt.is_pass && opt.gp > 2.0) {
      bonusPoint = opt.gp - 2.0;
    }
  }

  const rawGpa = (mainGpSum + bonusPoint) / mainSubjects.length;
  const finalGpaNum = Math.min(5.00, Number(rawGpa.toFixed(2)));
  const gpaStr = finalGpaNum.toFixed(2);
  const final_grade = getFinalGradeFromGpa(finalGpaNum);

  return {
    result_status: 'উত্তীর্ণ',
    gpa: gpaStr,
    final_grade,
    total_marks: totalObtained,
    total_full_marks: totalFull,
    percentage,
    is_pass: true,
    failed_count: failedSubjects.length,
    failed_subjects: failedSubjects,
    bonus_point: Number(bonusPoint.toFixed(2)),
    subject_count: subjectResults.length
  };
}

/**
 * Filter applicable subjects for a student based on Class and Department (Group)
 */
export function getStudentApplicableSubjects(student, allSubjects) {
  const cls = String(student.class_name || '6');
  const isSSC = ['9', '10', '৯', '১০'].includes(cls);

  const classSubs = allSubjects.filter(s => !s.class_name || String(s.class_name) === cls);

  if (!isSSC) {
    // Classes 6-8 (JSC Pattern)
    // Return standard core subjects (Compulsory + Islam/Hindu by religion if specified)
    const stRel = (student.religion || '').trim();
    return classSubs.filter(s => {
      const isRel = ['111', '112', '113', '114'].includes(s.code);
      if (!isRel) return true;
      if (stRel.includes('হিন্দু') || stRel.includes('hindu')) return s.code === '112';
      if (stRel.includes('বৌদ্ধ') || stRel.includes('buddhist')) return s.code === '113';
      if (stRel.includes('খ্রিষ্টান') || stRel.includes('christian')) return s.code === '114';
      return s.code === '111'; // Default Islam
    });
  }

  // Classes 9-10 (SSC Pattern)
  const stDept = (student.department || student.group_name || student.group || 'বিজ্ঞান').trim();
  const stRel = (student.religion || '').trim();

  return classSubs.filter(s => {
    // Religion check
    const isRel = ['111', '112', '113', '114'].includes(s.code);
    if (isRel) {
      if (stRel.includes('হিন্দু') || stRel.includes('hindu')) return s.code === '112';
      if (stRel.includes('বৌদ্ধ') || stRel.includes('buddhist')) return s.code === '113';
      if (stRel.includes('খ্রিষ্টান') || stRel.includes('christian')) return s.code === '114';
      return s.code === '111';
    }

    if (s.department === 'আবশ্যিক') return true;

    if (stDept.includes('বিজ্ঞান') || stDept.toLowerCase().includes('science')) {
      return s.department === 'বিজ্ঞান';
    }
    if (stDept.includes('মানবিক') || stDept.toLowerCase().includes('humanities') || stDept.includes('আর্টস')) {
      return s.department === 'মানবিক';
    }
    if (stDept.includes('ব্যবসায়') || stDept.toLowerCase().includes('commerce') || stDept.includes('বাণিজ্য')) {
      return s.department === 'ব্যবসায় শিক্ষা';
    }

    // Default to Science if unspecified
    return s.department === 'বিজ্ঞান';
  });
}

/**
 * Process entire class result matrix, assign Merit Positions (মেধা স্থান)
 */
export function processClassResults(students, subjects, marksList, className, examId) {
  const classStudents = students.filter(s => s && String(s.class_name) === String(className));
  
  // Build lookup map for marks: `${exam_id}_${student_id}_${subject_id}`
  const marksMap = new Map();
  (marksList || []).forEach(m => {
    if (String(m.exam_id) === String(examId)) {
      marksMap.set(`${m.student_id}_${m.subject_id}`, m);
      marksMap.set(`${m.student_id}_${m.subject_code}`, m);
    }
  });

  const studentResults = classStudents.map(student => {
    const applicableSubjects = getStudentApplicableSubjects(student, subjects);
    
    const subjectEvals = applicableSubjects.map(sub => {
      const rec = marksMap.get(`${student.id}_${sub.id}`) || 
                  marksMap.get(`${student.student_id}_${sub.id}`) ||
                  marksMap.get(`${student.id}_${sub.code}`) ||
                  marksMap.get(`${student.student_id}_${sub.code}`);
      return calculateSubjectGrade(sub, rec);
    });

    const overall = calculateOverallResult(className, subjectEvals);

    return {
      student,
      id: student.id,
      student_id: student.student_id || ('STU-' + student.roll_no),
      roll_no: student.roll_no || 0,
      name_bn: student.name_bn || 'শিক্ষার্থী',
      name_en: student.name_en || '',
      class_name: className,
      section: student.section || 'A',
      department: student.department || student.group_name || 'সাধারণ',
      subjects: subjectEvals,
      ...overall
    };
  });

  // Assign Merit Ranks:
  // Group 1: Passed students, sorted by GPA desc -> Total Marks desc -> Roll asc
  // Group 2: Failed students, sorted by Total Marks desc -> Roll asc
  const passedStudents = studentResults.filter(s => s.is_pass);
  const failedStudents = studentResults.filter(s => !s.is_pass);

  passedStudents.sort((a, b) => {
    const gpaDiff = Number(b.gpa) - Number(a.gpa);
    if (Math.abs(gpaDiff) > 0.001) return gpaDiff;
    const markDiff = b.total_marks - a.total_marks;
    if (markDiff !== 0) return markDiff;
    return (Number(a.roll_no) || 0) - (Number(b.roll_no) || 0);
  });

  failedStudents.sort((a, b) => {
    const markDiff = b.total_marks - a.total_marks;
    if (markDiff !== 0) return markDiff;
    return (Number(a.roll_no) || 0) - (Number(b.roll_no) || 0);
  });

  let currentRank = 1;
  passedStudents.forEach((s) => {
    s.merit = currentRank++;
    s.merit_bn = toBnDigits(s.merit);
  });

  failedStudents.forEach((s) => {
    s.merit = currentRank++;
    s.merit_bn = toBnDigits(s.merit);
  });

  return [...passedStudents, ...failedStudents];
}

/**
 * Generate Comprehensive Analytics & Charts data
 */
export function generateResultAnalytics(processedResults, subjects) {
  if (!processedResults || !processedResults.length) {
    return {
      overall: {
        students: 0,
        passed: 0,
        failed: 0,
        pass_rate: '0.0',
        avg_percentage: '0.0',
        avg_gpa: '0.00',
        highest_marks: 0,
        lowest_marks: 0,
        gpa5_count: 0
      },
      subjects: [],
      grade_distribution: { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
    };
  }

  const total = processedResults.length;
  const passed = processedResults.filter(s => s.is_pass).length;
  const failed = total - passed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  
  const gpaSum = processedResults.reduce((acc, s) => acc + (Number(s.gpa) || 0), 0);
  const avgGpa = total > 0 ? (gpaSum / total).toFixed(2) : '0.00';

  const markSum = processedResults.reduce((acc, s) => acc + (s.total_marks || 0), 0);
  const avgMarks = total > 0 ? (markSum / total).toFixed(1) : '0.0';

  const highestMarks = Math.max(...processedResults.map(s => s.total_marks || 0));
  const lowestMarks = Math.min(...processedResults.map(s => s.total_marks || 0));

  const gpa5Count = processedResults.filter(s => Number(s.gpa) >= 5.0).length;

  const gradeDist = { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  processedResults.forEach(s => {
    const gr = s.final_grade || 'F';
    gradeDist[gr] = (gradeDist[gr] || 0) + 1;
  });

  // Subject-wise performance
  const subMap = new Map();
  processedResults.forEach(s => {
    (s.subjects || []).forEach(sub => {
      if (!subMap.has(sub.code)) {
        subMap.set(sub.code, {
          code: sub.code,
          subject_name: sub.name_bn,
          department: sub.department,
          full_marks: sub.full_marks,
          totalStudents: 0,
          passedStudents: 0,
          failedStudents: 0,
          totalObtained: 0
        });
      }
      const st = subMap.get(sub.code);
      st.totalStudents++;
      st.totalObtained += (sub.total || 0);
      if (sub.is_pass) st.passedStudents++;
      else st.failedStudents++;
    });
  });

  const subjectStats = Array.from(subMap.values()).map(st => {
    const avg = st.totalStudents ? (st.totalObtained / st.totalStudents).toFixed(1) : '0.0';
    const pct = st.full_marks ? ((Number(avg) / st.full_marks) * 100).toFixed(1) : '0.0';
    const rate = st.totalStudents ? ((st.passedStudents / st.totalStudents) * 100).toFixed(1) : '0.0';
    return {
      code: st.code,
      subject_name: st.subject_name,
      department: st.department,
      avg_marks: avg,
      avg_percentage: pct,
      passed: st.passedStudents,
      failed: st.failedStudents,
      pass_rate: rate
    };
  });

  return {
    overall: {
      students: total,
      passed,
      failed,
      pass_rate: passRate,
      avg_percentage: total ? ((Number(avgMarks) / (processedResults[0]?.total_full_marks || 1000)) * 100).toFixed(1) : '0.0',
      avg_gpa: avgGpa,
      highest_marks: highestMarks,
      lowest_marks: lowestMarks,
      gpa5_count: gpa5Count
    },
    subjects: subjectStats,
    grade_distribution: gradeDist
  };
}

export const toBnDigits = (n) => {
  if (n === null || n === undefined || n === '') return '';
  return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
};
