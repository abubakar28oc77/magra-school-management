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
  const failedSubjects = [];

  subjectResults.forEach(sub => {
    totalObtained += (sub.total || 0);
    totalFull += (sub.full_marks || 100);
  });

  const percentage = totalFull > 0 ? ((totalObtained / totalFull) * 100).toFixed(1) : '0.0';

  if (!isSSC) {
    // Classes 6-8 (JSC Pattern)
    let hasFailInMain = false;
    const mainSubjects = [];

    subjectResults.forEach(sub => {
      mainSubjects.push(sub);
      if (!sub.is_pass) {
        hasFailInMain = true;
        failedSubjects.push(sub.name_bn);
      }
    });

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

    const rawGpa = mainSubjects.reduce((sum, s) => sum + s.gp, 0) / mainSubjects.length;
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
      bonus_point: 0,
      subject_count: subjectResults.length
    };
  }

  // ==================== SSC PATTERN (Classes 9 & 10) ====================
  // Combined Courses:
  // 1. Bangla (101 & 102 as 1 composite course)
  // 2. English (107 & 108 as 1 composite course)
  // 3. Other Core/Group Subjects
  // 4. Optional 4th Subject (bonus above GP 2.0)
  const mainCourses = [];
  const optionalCourses = [];
  let hasFailInMain = false;

  const sub101 = subjectResults.find(s => String(s.code) === '101');
  const sub102 = subjectResults.find(s => String(s.code) === '102');
  const sub107 = subjectResults.find(s => String(s.code) === '107');
  const sub108 = subjectResults.find(s => String(s.code) === '108');

  // Bangla Combined Course (101 + 102)
  if (sub101 || sub102) {
    const isPass = sub101 ? sub101.is_pass : (sub102 ? sub102.is_pass : false);
    const gp = sub101 ? sub101.gp : (sub102 ? sub102.gp : 0.0);
    mainCourses.push({
      name: 'বাংলা (১ম ও ২য় পত্র)',
      is_pass: isPass,
      gp
    });
    if (!isPass) {
      hasFailInMain = true;
      failedSubjects.push('বাংলা (১ম ও ২য় পত্র)');
    }
  }

  // English Combined Course (107 + 108)
  if (sub107 || sub108) {
    const isPass = sub107 ? sub107.is_pass : (sub108 ? sub108.is_pass : false);
    const gp = sub107 ? sub107.gp : (sub108 ? sub108.gp : 0.0);
    mainCourses.push({
      name: 'ইংরেজি (১ম ও ২য় পত্র)',
      is_pass: isPass,
      gp
    });
    if (!isPass) {
      hasFailInMain = true;
      failedSubjects.push('ইংরেজি (১ম ও ২য় পত্র)');
    }
  }

  // Remaining subjects (Math, Religion, Group subjects, ICT, etc.)
  subjectResults.forEach(sub => {
    if (['101', '102', '107', '108'].includes(String(sub.code))) return;

    if (sub.is_optional) {
      optionalCourses.push(sub);
      if (!sub.is_pass) {
        failedSubjects.push(`${sub.name_bn} (৪র্থ বিষয়)`);
      }
    } else {
      mainCourses.push({
        name: sub.name_bn,
        is_pass: sub.is_pass,
        gp: sub.gp
      });
      if (!sub.is_pass) {
        hasFailInMain = true;
        failedSubjects.push(sub.name_bn);
      }
    }
  });

  if (hasFailInMain || mainCourses.length === 0) {
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
      subject_count: subjectResults.length,
      main_course_count: mainCourses.length
    };
  }

  // All main courses passed!
  const mainGpSum = mainCourses.reduce((sum, s) => sum + s.gp, 0);
  let bonusPoint = 0;

  if (optionalCourses.length > 0) {
    const opt = optionalCourses[0];
    if (opt.is_pass && opt.gp > 2.0) {
      bonusPoint = opt.gp - 2.0;
    }
  }

  const rawGpa = (mainGpSum + bonusPoint) / mainCourses.length;
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
    subject_count: subjectResults.length,
    main_course_count: mainCourses.length
  };
}

/**
 * Filter applicable subjects for a student based on Class, Religion, Department (Group),
 * and 4th Subject rules (Science: either 126 or 134; Humanities & Business Studies: always 134).
 */
export function getStudentApplicableSubjects(student, allSubjects, marksMap = null) {
  const cls = String(student.class_name || '6');
  const isSSC = ['9', '10', '৯', '১০'].includes(cls);

  const classSubs = allSubjects.filter(s => !s.class_name || String(s.class_name) === cls);

  if (!isSSC) {
    // Classes 6-8 (JSC Pattern)
    // Return standard core subjects (Compulsory + Islam/Hindu by religion if specified)
    const stRel = (student.religion || '').trim();
    return classSubs.filter(s => {
      const isRel = ['111', '112', '113', '114'].includes(String(s.code));
      if (!isRel) return true;
      if (stRel.includes('হিন্দু') || stRel.includes('hindu')) return String(s.code) === '112';
      if (stRel.includes('বৌদ্ধ') || stRel.includes('buddhist')) return String(s.code) === '113';
      if (stRel.includes('খ্রিষ্টান') || stRel.includes('christian')) return String(s.code) === '114';
      return String(s.code) === '111'; // Default Islam
    });
  }

  // Classes 9-10 (SSC Pattern)
  const stDept = (student.department || student.group_name || student.group || 'বিজ্ঞান').trim();
  const stRel = (student.religion || '').trim();

  const isHumanities = stDept.includes('মানবিক') || stDept.toLowerCase().includes('humanities') || stDept.includes('আর্টস');
  const isBusiness = stDept.includes('ব্যবসায়') || stDept.toLowerCase().includes('commerce') || stDept.includes('বাণিজ্য');
  const isScience = !isHumanities && !isBusiness; // Default is Science

  // Determine student's 4th subject:
  // 1. Humanities & Business Studies: 4th subject is ALWAYS Agriculture Studies (134)
  // 2. Science: 4th subject is EITHER Higher Mathematics (126) OR Agriculture Studies (134) - never both!
  let chosenScienceFourthCode = '126'; // Standard Science default

  if (isScience) {
    const explicit = (
      student.fourth_subject || 
      student.fourth_subject_code || 
      student.optional_subject || 
      student.optional_subject_name || 
      student.elective_subject || 
      ''
    ).toString().toLowerCase();

    if (explicit.includes('134') || explicit.includes('কৃষি') || explicit.includes('agri')) {
      chosenScienceFourthCode = '134';
    } else if (explicit.includes('126') || explicit.includes('উচ্চতর') || explicit.includes('গণিত') || explicit.includes('higher') || explicit.includes('math')) {
      chosenScienceFourthCode = '126';
    } else if (marksMap) {
      // Check if student has marks in 134 vs 126
      const sId = student.id;
      const stRollId = student.student_id;
      const rec134 = (sId && marksMap.get(`${sId}_134`)) || 
                     (stRollId && marksMap.get(`${stRollId}_134`)) ||
                     (sId && marksMap.get(`${sId}_sub-10-134-sci`)) ||
                     (stRollId && marksMap.get(`${stRollId}_sub-10-134-sci`)) ||
                     (sId && marksMap.get(`${sId}_sub-9-134-sci`)) ||
                     (stRollId && marksMap.get(`${stRollId}_sub-9-134-sci`));

      const rec126 = (sId && marksMap.get(`${sId}_126`)) || 
                     (stRollId && marksMap.get(`${stRollId}_126`)) ||
                     (sId && marksMap.get(`${sId}_sub-10-126`)) ||
                     (stRollId && marksMap.get(`${stRollId}_sub-10-126`)) ||
                     (sId && marksMap.get(`${sId}_sub-9-126`)) ||
                     (stRollId && marksMap.get(`${stRollId}_sub-9-126`));

      const has134 = rec134 && !rec134.absent && (Number(rec134.total) > 0 || Number(rec134.written) > 0 || Number(rec134.mcq) > 0 || Number(rec134.practical) > 0);
      const has126 = rec126 && !rec126.absent && (Number(rec126.total) > 0 || Number(rec126.written) > 0 || Number(rec126.mcq) > 0 || Number(rec126.practical) > 0);

      if (has134 && !has126) {
        chosenScienceFourthCode = '134';
      } else if (has126 && !has134) {
        chosenScienceFourthCode = '126';
      } else {
        chosenScienceFourthCode = '126';
      }
    }
  }

  return classSubs.filter(s => {
    // 1. Religion check
    const isRel = ['111', '112', '113', '114'].includes(String(s.code));
    if (isRel) {
      if (stRel.includes('হিন্দু') || stRel.includes('hindu')) return String(s.code) === '112';
      if (stRel.includes('বৌদ্ধ') || stRel.includes('buddhist')) return String(s.code) === '113';
      if (stRel.includes('খ্রিষ্টান') || stRel.includes('christian')) return String(s.code) === '114';
      return String(s.code) === '111';
    }

    // 2. Compulsory subjects
    if (s.department === 'আবশ্যিক') return true;

    // 3. Science Group: only chosen 4th subject (either 126 or 134)
    if (isScience) {
      if (s.department !== 'বিজ্ঞান') return false;
      if (String(s.code) === '126' || String(s.code) === '134') {
        return String(s.code) === chosenScienceFourthCode;
      }
      return true;
    }

    // 4. Humanities Group: 4th subject is ALWAYS 134 (Agriculture Studies). Exclude 151 (Home Science).
    if (isHumanities) {
      if (s.department !== 'মানবিক') return false;
      if (String(s.code) === '151') return false;
      return true;
    }

    // 5. Business Studies Group: 4th subject is ALWAYS 134 (Agriculture Studies).
    if (isBusiness) {
      if (s.department !== 'ব্যবসায় শিক্ষা') return false;
      return true;
    }

    return s.department === 'বিজ্ঞান';
  });
}

/**
 * Process entire class result matrix, assign Merit Positions (মেধা স্থান)
 * Fully supports Dhaka Board Combined Bangla (101+102) & English (107+108) for Classes 9 & 10.
 */
export function processClassResults(students, subjects, marksList, className, examId) {
  const normCls = (c) => {
    if (!c) return '';
    return String(c).replace(/^(class|শ্রেণি|শ্রেণী)\s*/i, '').replace(/[thstndrdমষ্ঠর্থ]/gi, '').trim()
      .replace(/০/g, '0').replace(/১/g, '1').replace(/২/g, '2').replace(/৩/g, '3').replace(/৪/g, '4')
      .replace(/৫/g, '5').replace(/৬/g, '6').replace(/৭/g, '7').replace(/৮/g, '8').replace(/৯/g, '9');
  };
  const targetNorm = normCls(className);
  const isSSC = ['9', '10'].includes(targetNorm);
  const classStudents = (students || []).filter(s => s && (String(s.class_name) === String(className) || normCls(s.class_name) === targetNorm));
  
  // Build lookup map for marks: `${exam_id}_${student_id}_${subject_id}`
  const marksMap = new Map();
  (marksList || []).forEach(m => {
    if (String(m.exam_id) === String(examId)) {
      marksMap.set(`${m.student_id}_${m.subject_id}`, m);
      marksMap.set(`${m.student_id}_${m.subject_code}`, m);
    }
  });

  const studentResults = classStudents.map(student => {
    const applicableSubjects = getStudentApplicableSubjects(student, subjects, marksMap);

    const getRec = (sub) => {
      if (!sub) return null;
      return marksMap.get(`${student.id}_${sub.id}`) || 
             marksMap.get(`${student.student_id}_${sub.id}`) ||
             marksMap.get(`${student.id}_${sub.code}`) ||
             marksMap.get(`${student.student_id}_${sub.code}`) || null;
    };

    let subjectEvals = [];

    if (!isSSC) {
      // Classes 6-8: standard individual evaluation
      subjectEvals = applicableSubjects.map(sub => {
        const rec = getRec(sub);
        return calculateSubjectGrade(sub, rec);
      });
    } else {
      // Classes 9 & 10 (SSC Pattern):
      // Bangla 1st (101) + Bangla 2nd (102) Combined: CQ>=46, MCQ>=20, Total>=66
      // English 1st (107) + English 2nd (108) Combined: Total>=66
      const sub101 = applicableSubjects.find(s => String(s.code) === '101');
      const sub102 = applicableSubjects.find(s => String(s.code) === '102');
      const sub107 = applicableSubjects.find(s => String(s.code) === '107');
      const sub108 = applicableSubjects.find(s => String(s.code) === '108');

      // 1. Evaluate Combined Bangla
      const rec101 = getRec(sub101);
      const rec102 = getRec(sub102);

      const w1 = rec101?.written !== '' && rec101?.written !== null && rec101?.written !== undefined ? Number(rec101.written) : 0;
      const m1 = rec101?.mcq !== '' && rec101?.mcq !== null && rec101?.mcq !== undefined ? Number(rec101.mcq) : 0;
      const t1 = w1 + m1;

      const w2 = rec102?.written !== '' && rec102?.written !== null && rec102?.written !== undefined ? Number(rec102.written) : 0;
      const m2 = rec102?.mcq !== '' && rec102?.mcq !== null && rec102?.mcq !== undefined ? Number(rec102.mcq) : 0;
      const t2 = w2 + m2;

      const banglaCombinedCQ = w1 + w2;
      const banglaCombinedMCQ = m1 + m2;
      const banglaCombinedTotal = banglaCombinedCQ + banglaCombinedMCQ;

      // Board rules: Combined CQ pass 46, Combined MCQ pass 20, Total pass 66
      const passBanglaCQ = banglaCombinedCQ >= 46;
      const passBanglaMCQ = banglaCombinedMCQ >= 20;
      const passBanglaTotal = banglaCombinedTotal >= 66;

      const isBanglaAbsent = !!(rec101?.absent && rec102?.absent);
      const isBanglaPass = !isBanglaAbsent && passBanglaCQ && passBanglaMCQ && passBanglaTotal;

      const banglaPct = (banglaCombinedTotal / 200) * 100;
      const banglaGradeObj = isBanglaPass ? getLetterAndPoint(banglaPct) : { letter: 'F', gp: 0.0 };
      const banglaLetter = banglaGradeObj.letter;
      const banglaGp = banglaGradeObj.gp;

      const banglaFailReasons = [];
      if (!passBanglaCQ) banglaFailReasons.push(`বাংলা CQ (${banglaCombinedCQ} < ৪৬)`);
      if (!passBanglaMCQ) banglaFailReasons.push(`বাংলা MCQ (${banglaCombinedMCQ} < ২০)`);
      if (!passBanglaTotal) banglaFailReasons.push(`বাংলা মোট (${banglaCombinedTotal} < ৬৬)`);

      // 2. Evaluate Combined English
      const rec107 = getRec(sub107);
      const rec108 = getRec(sub108);

      const w107 = rec107?.written !== '' && rec107?.written !== null && rec107?.written !== undefined ? Number(rec107.written) : 0;
      const w108 = rec108?.written !== '' && rec108?.written !== null && rec108?.written !== undefined ? Number(rec108.written) : 0;
      const englishCombinedTotal = w107 + w108;

      // Board rules: English Combined Total pass 66
      const passEnglishTotal = englishCombinedTotal >= 66;
      const isEnglishAbsent = !!(rec107?.absent && rec108?.absent);
      const isEnglishPass = !isEnglishAbsent && passEnglishTotal;

      const englishPct = (englishCombinedTotal / 200) * 100;
      const englishGradeObj = isEnglishPass ? getLetterAndPoint(englishPct) : { letter: 'F', gp: 0.0 };
      const englishLetter = englishGradeObj.letter;
      const englishGp = englishGradeObj.gp;

      const englishFailReasons = [];
      if (!passEnglishTotal) englishFailReasons.push(`ইংরেজি মোট (${englishCombinedTotal} < ৬৬)`);

      subjectEvals = applicableSubjects.map(sub => {
        if (sub.code === '101') {
          return {
            subject_id: sub.id,
            code: sub.code,
            name_bn: sub.name_bn,
            name_en: sub.name_en || '',
            department: sub.department || 'আবশ্যিক',
            is_optional: false,
            full_marks: 100,
            written_max: 70,
            mcq_max: 30,
            practical_max: 0,
            written: w1,
            mcq: m1,
            practical: 0,
            total: t1,
            percentage: Number(((t1 / 100) * 100).toFixed(1)),
            letter_grade: banglaLetter,
            gp: banglaGp,
            is_pass: isBanglaPass,
            absent: !!rec101?.absent,
            fail_reason: banglaFailReasons.join(', '),
            is_combined: true,
            combined_title: 'বাংলা (১ম ও ২য় পত্র)',
            combined_total: banglaCombinedTotal,
            combined_cq: banglaCombinedCQ,
            combined_mcq: banglaCombinedMCQ
          };
        }
        if (sub.code === '102') {
          return {
            subject_id: sub.id,
            code: sub.code,
            name_bn: sub.name_bn,
            name_en: sub.name_en || '',
            department: sub.department || 'আবশ্যিক',
            is_optional: false,
            full_marks: 100,
            written_max: 70,
            mcq_max: 30,
            practical_max: 0,
            written: w2,
            mcq: m2,
            practical: 0,
            total: t2,
            percentage: Number(((t2 / 100) * 100).toFixed(1)),
            letter_grade: banglaLetter,
            gp: banglaGp,
            is_pass: isBanglaPass,
            absent: !!rec102?.absent,
            fail_reason: banglaFailReasons.join(', '),
            is_combined: true,
            combined_title: 'বাংলা (১ম ও ২য় পত্র)',
            combined_total: banglaCombinedTotal,
            combined_cq: banglaCombinedCQ,
            combined_mcq: banglaCombinedMCQ
          };
        }
        if (sub.code === '107') {
          return {
            subject_id: sub.id,
            code: sub.code,
            name_bn: sub.name_bn,
            name_en: sub.name_en || '',
            department: sub.department || 'আবশ্যিক',
            is_optional: false,
            full_marks: 100,
            written_max: 100,
            mcq_max: 0,
            practical_max: 0,
            written: w107,
            mcq: 0,
            practical: 0,
            total: w107,
            percentage: Number(((w107 / 100) * 100).toFixed(1)),
            letter_grade: englishLetter,
            gp: englishGp,
            is_pass: isEnglishPass,
            absent: !!rec107?.absent,
            fail_reason: englishFailReasons.join(', '),
            is_combined: true,
            combined_title: 'ইংরেজি (১ম ও ২য় পত্র)',
            combined_total: englishCombinedTotal
          };
        }
        if (sub.code === '108') {
          return {
            subject_id: sub.id,
            code: sub.code,
            name_bn: sub.name_bn,
            name_en: sub.name_en || '',
            department: sub.department || 'আবশ্যিক',
            is_optional: false,
            full_marks: 100,
            written_max: 100,
            mcq_max: 0,
            practical_max: 0,
            written: w108,
            mcq: 0,
            practical: 0,
            total: w108,
            percentage: Number(((w108 / 100) * 100).toFixed(1)),
            letter_grade: englishLetter,
            gp: englishGp,
            is_pass: isEnglishPass,
            absent: !!rec108?.absent,
            fail_reason: englishFailReasons.join(', '),
            is_combined: true,
            combined_title: 'ইংরেজি (১ম ও ২য় পত্র)',
            combined_total: englishCombinedTotal
          };
        }

        // Regular subjects
        const rec = getRec(sub);
        return calculateSubjectGrade(sub, rec);
      });
    }

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
