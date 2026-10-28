// Data Store for Exam Results: Admission, Half-Yearly, Annual, Pre-Test, Test & Public Exams
// Strictly respects class restrictions:
// - অর্ধ-বার্ষিক পরীক্ষা: ৬ষ্ঠ-১০ম শ্রেণি
// - বার্ষিক পরীক্ষা: ৬ষ্ঠ-৯ম শ্রেণি (১০ম শ্রেণির বার্ষিক পরীক্ষা হয় না)
// - প্রাক-নির্বাচনী পরীক্ষা: ১০ম শ্রেণি (এসএসসি প্রস্তুতি)
// - নির্বাচনী পরীক্ষা: ১০ম শ্রেণি (এসএসসি টেস্ট পরীক্ষা)

export const DEFAULT_ADMISSION_RESULTS = [
  {
    id: 'adm-res-1',
    application_no: 'ADM-2026-002',
    roll_no: '১০১',
    applicant_name: 'ফারহানা ইসলাম',
    applied_class: '৬ষ্ঠ',
    marks: 94,
    merit_position: 1,
    status: 'মেধা তালিকায় নির্বাচিত (১ম স্থান)',
    guardian_name: 'মোঃ রফিকুল ইসলাম',
    guardian_phone: '০১৭২২-৮৮৭৭৬৬'
  },
  {
    id: 'adm-res-2',
    application_no: 'ADM-2026-001',
    roll_no: '১০২',
    applicant_name: 'রিফাত হোসেন',
    applied_class: '৬ষ্ঠ',
    marks: 90,
    merit_position: 2,
    status: 'মেধা তালিকায় নির্বাচিত',
    guardian_name: 'মোঃ দেলোয়ার হোসেন',
    guardian_phone: '০১৭১১-৯৯৮৮৭৭'
  },
  {
    id: 'adm-res-3',
    application_no: 'ADM-2026-005',
    roll_no: '১০৩',
    applicant_name: 'আরিফুর রহমান',
    applied_class: '৬ষ্ঠ',
    marks: 88,
    merit_position: 3,
    status: 'মেধা তালিকায় নির্বাচিত',
    guardian_name: 'মোঃ খলিলুর রহমান',
    guardian_phone: '০১৭১৫-১১২২৩৩'
  },
  {
    id: 'adm-res-4',
    application_no: 'ADM-2026-008',
    roll_no: '১০৪',
    applicant_name: 'সাদিয়া জাহান',
    applied_class: '৬ষ্ঠ',
    marks: 82,
    merit_position: 4,
    status: 'অপেক্ষমাণ তালিকা (১ম)',
    guardian_name: 'মোঃ শাহজাহান আলী',
    guardian_phone: '০১৭১৬-৪৪৫৫৬৬'
  },
  {
    id: 'adm-res-5',
    application_no: 'ADM-2026-003',
    roll_no: '২০১',
    applicant_name: 'নাঈম হাসান',
    applied_class: '৯ম',
    marks: 86,
    merit_position: 1,
    status: 'মেধা তালিকায় নির্বাচিত (বিজ্ঞান শাখা)',
    guardian_name: 'মোঃ আবুল কাশেম',
    guardian_phone: '০১৭৩৩-৭৭৬৬৫৫'
  },
  {
    id: 'adm-res-6',
    application_no: 'ADM-2026-009',
    roll_no: '২০২',
    applicant_name: 'তানজিলা আক্তার',
    applied_class: '৯ম',
    marks: 81,
    merit_position: 2,
    status: 'মেধা তালিকায় নির্বাচিত (মানবিক শাখা)',
    guardian_name: 'মোঃ মোখলেছুর রহমান',
    guardian_phone: '০১৭১৭-২২৩৩৪৪'
  }
];

export const DEFAULT_HALF_YEARLY_RESULTS = [
  // Class 6
  { id: 'hy-6-1', roll_no: '০১', student_id: 'stu-06-01', name_bn: 'আরিফুর রহমান', class_name: '৬ষ্ঠ', section: 'ক শাখা', marks: 665, gpa: 5.00, grade: 'A+', merit_pos: 1, status: 'উত্তীর্ণ' },
  { id: 'hy-6-2', roll_no: '০২', student_id: 'stu-06-02', name_bn: 'জান্নাতুন নাঈম', class_name: '৬ষ্ঠ', section: 'ক শাখা', marks: 642, gpa: 4.86, grade: 'A', merit_pos: 2, status: 'উত্তীর্ণ' },
  { id: 'hy-6-3', roll_no: '০৩', student_id: 'stu-06-03', name_bn: 'মাহমুদুল হাসান', class_name: '৬ষ্ঠ', section: 'খ শাখা', marks: 618, gpa: 4.57, grade: 'A', merit_pos: 3, status: 'উত্তীর্ণ' },
  // Class 7
  { id: 'hy-7-1', roll_no: '০১', student_id: 'stu-07-01', name_bn: 'তাহমিনা আক্তার', class_name: '৭ম', section: 'ক শাখা', marks: 658, gpa: 5.00, grade: 'A+', merit_pos: 1, status: 'উত্তীর্ণ' },
  { id: 'hy-7-2', roll_no: '০২', student_id: 'stu-07-02', name_bn: 'নাদিয়া সুলতানা', class_name: '৭ম', section: 'খ শাখা', marks: 640, gpa: 4.86, grade: 'A', merit_pos: 2, status: 'উত্তীর্ণ' },
  // Class 8
  { id: 'hy-8-1', roll_no: '০১', student_id: 'stu-08-01', name_bn: 'তাহসিন হাসান', class_name: '৮ম', section: 'ক শাখা', marks: 672, gpa: 5.00, grade: 'A+', merit_pos: 1, status: 'উত্তীর্ণ' },
  { id: 'hy-8-2', roll_no: '০২', student_id: 'stu-08-02', name_bn: 'সায়িম হাসান', class_name: '৮ম', section: 'খ শাখা', marks: 635, gpa: 4.71, grade: 'A', merit_pos: 2, status: 'উত্তীর্ণ' },
  // Class 9
  { id: 'hy-9-1', roll_no: '০১', student_id: 'stu-09-sci-01', name_bn: 'ফারজানা মেহজাবীন', class_name: '৯ম', section: 'বিজ্ঞান বিভাগ', marks: 878, gpa: 5.00, grade: 'A+', merit_pos: 1, status: 'উত্তীর্ণ' },
  { id: 'hy-9-2', roll_no: '০২', student_id: 'stu-09-sci-02', name_bn: 'রাহাত ইসলাম', class_name: '৯ম', section: 'বিজ্ঞান বিভাগ', marks: 845, gpa: 4.89, grade: 'A', merit_pos: 2, status: 'উত্তীর্ণ' },
  { id: 'hy-9-3', roll_no: '১৫', student_id: 'stu-09-hum-15', name_bn: 'ফাতেমা তুজ জোহরা', class_name: '৯ম', section: 'মানবিক বিভাগ', marks: 790, gpa: 4.67, grade: 'A', merit_pos: 1, status: 'উত্তীর্ণ' },
  // Class 10
  { id: 'hy-10-1', roll_no: '০১', student_id: 'stu-10-sci-01', name_bn: 'তানভীর আহমেদ', class_name: '১০ম', section: 'বিজ্ঞান বিভাগ', marks: 892, gpa: 5.00, grade: 'A+', merit_pos: 1, status: 'উত্তীর্ণ' },
  { id: 'hy-10-2', roll_no: '০২', student_id: 'stu-10-sci-02', name_bn: 'তাসমিয়া তাবাসসুম', class_name: '১০ম', section: 'বিজ্ঞান বিভাগ', marks: 860, gpa: 4.89, grade: 'A', merit_pos: 2, status: 'উত্তীর্ণ' },
  { id: 'hy-10-3', roll_no: '০৩', student_id: 'stu-10-hum-01', name_bn: 'শাকিল আহমেদ', class_name: '১০ম', section: 'মানবিক বিভাগ', marks: 812, gpa: 4.78, grade: 'A', merit_pos: 1, status: 'উত্তীর্ণ' }
];

export const DEFAULT_ANNUAL_RESULTS = [
  // Class 6
  { id: 'an-6-1', roll_no: '০১', student_id: 'stu-06-01', name_bn: 'আরিফুর রহমান', class_name: '৬ষ্ঠ', section: 'ক শাখা', marks: 678, gpa: 5.00, grade: 'A+', merit_pos: 1, promotion_status: '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  { id: 'an-6-2', roll_no: '০২', student_id: 'stu-06-02', name_bn: 'জান্নাতুন নাঈম', class_name: '৬ষ্ঠ', section: 'ক শাখা', marks: 650, gpa: 4.86, grade: 'A', merit_pos: 2, promotion_status: '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  { id: 'an-6-3', roll_no: '০৩', student_id: 'stu-06-03', name_bn: 'মাহমুদুল হাসান', class_name: '৬ষ্ঠ', section: 'খ শাখা', marks: 630, gpa: 4.71, grade: 'A', merit_pos: 3, promotion_status: '৭ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  // Class 7
  { id: 'an-7-1', roll_no: '০১', student_id: 'stu-07-01', name_bn: 'তাহমিনা আক্তার', class_name: '৭ম', section: 'ক শাখা', marks: 668, gpa: 5.00, grade: 'A+', merit_pos: 1, promotion_status: '৮ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  { id: 'an-7-2', roll_no: '০২', student_id: 'stu-07-02', name_bn: 'নাদিয়া সুলতানা', class_name: '৭ম', section: 'খ শাখা', marks: 648, gpa: 4.86, grade: 'A', merit_pos: 2, promotion_status: '৮ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  // Class 8
  { id: 'an-8-1', roll_no: '০১', student_id: 'stu-08-01', name_bn: 'তাহসিন হাসান', class_name: '৮ম', section: 'ক শাখা', marks: 685, gpa: 5.00, grade: 'A+', merit_pos: 1, promotion_status: '৯ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  { id: 'an-8-2', roll_no: '০২', student_id: 'stu-08-02', name_bn: 'সায়িম হাসান', class_name: '৮ম', section: 'খ শাখা', marks: 645, gpa: 4.86, grade: 'A', merit_pos: 2, promotion_status: '৯ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  // Class 9
  { id: 'an-9-1', roll_no: '০১', student_id: 'stu-09-sci-01', name_bn: 'ফারজানা মেহজাবীন', class_name: '৯ম', section: 'বিজ্ঞান বিভাগ', marks: 890, gpa: 5.00, grade: 'A+', merit_pos: 1, promotion_status: '১০ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  { id: 'an-9-2', roll_no: '০২', student_id: 'stu-09-sci-02', name_bn: 'রাহাত ইসলাম', class_name: '৯ম', section: 'বিজ্ঞান বিভাগ', marks: 860, gpa: 4.89, grade: 'A', merit_pos: 2, promotion_status: '১০ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' },
  { id: 'an-9-3', roll_no: '১৫', student_id: 'stu-09-hum-15', name_bn: 'ফাতেমা তুজ জোহরা', class_name: '৯ম', section: 'মানবিক বিভাগ', marks: 810, gpa: 4.78, grade: 'A', merit_pos: 1, promotion_status: '১০ম শ্রেণিতে উত্তীর্ণ ও প্রমোশনপ্রাপ্ত' }
];

export const DEFAULT_PRE_TEST_RESULTS = [
  // Class 10 Pre-Test only
  {
    id: 'pt-10-1',
    roll_no: '০১',
    student_id: 'stu-10-sci-01',
    name_bn: 'তানভীর আহমেদ',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    marks: 885,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 1,
    status: 'উত্তীর্ণ (চমৎকার প্রস্তুতি)',
    notes: 'গণিত ও পদার্থবিজ্ঞানে পূর্ণ নম্বর'
  },
  {
    id: 'pt-10-2',
    roll_no: '০২',
    student_id: 'stu-10-sci-02',
    name_bn: 'তাসমিয়া তাবাসসুম',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    marks: 855,
    gpa: 4.89,
    grade: 'A',
    merit_pos: 2,
    status: 'উত্তীর্ণ (সন্তোষজনক)',
    notes: 'উচ্চতর গণিতে আরও মনোযোগ প্রয়োজন'
  },
  {
    id: 'pt-10-3',
    roll_no: '০৩',
    student_id: 'stu-10-hum-01',
    name_bn: 'শাকিল আহমেদ',
    class_name: '১০ম',
    section: 'মানবিক বিভাগ',
    marks: 810,
    gpa: 4.67,
    grade: 'A',
    merit_pos: 1,
    status: 'উত্তীর্ণ (সন্তোষজনক)',
    notes: 'পৌরনীতি ও ইতিহাসে ভালো ফলাফল'
  },
  {
    id: 'pt-10-4',
    roll_no: '০৪',
    student_id: 'stu-10-hum-02',
    name_bn: 'নাঈমুল ইসলাম',
    class_name: '১০ম',
    section: 'মানবিক বিভাগ',
    marks: 792,
    gpa: 4.44,
    grade: 'A',
    merit_pos: 2,
    status: 'উত্তীর্ণ (অগ্রগতিশীল)',
    notes: 'ইংরেজি বিষয়ের স্পেশাল কোচিং ক্লাসে উপস্থিতি আবশ্যক'
  },
  {
    id: 'pt-10-5',
    roll_no: '০৫',
    student_id: 'stu-10-bs-01',
    name_bn: 'মোস্তাফিজুর রহমান',
    class_name: '১০ম',
    section: 'ব্যবসায় শিক্ষা শাখা',
    marks: 825,
    gpa: 4.78,
    grade: 'A',
    merit_pos: 1,
    status: 'উত্তীর্ণ (সন্তোষজনক)',
    notes: 'হিসাববিজ্ঞান ও ফিন্যান্সে সেরা স্কোর'
  }
];

export const DEFAULT_TEST_RESULTS = [
  // Class 10 Test (SSC Candidate Eligibility) only
  {
    id: 'test-10-1',
    roll_no: '০১',
    student_id: 'stu-10-sci-01',
    name_bn: 'তানভীর আহমেদ',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    marks: 910,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 1,
    ssc_clearance: 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)',
    notes: 'এসএসসি পরীক্ষার রেজিস্ট্রেশন ও ফরমপূরণ অনুমোদিত'
  },
  {
    id: 'test-10-2',
    roll_no: '০২',
    student_id: 'stu-10-sci-02',
    name_bn: 'তাসমিয়া তাবাসসুম',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    marks: 875,
    gpa: 5.00,
    grade: 'A+',
    merit_pos: 2,
    ssc_clearance: 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)',
    notes: 'ফরমপূরণ সম্পন্ন'
  },
  {
    id: 'test-10-3',
    roll_no: '০৩',
    student_id: 'stu-10-hum-01',
    name_bn: 'শাকিল আহমেদ',
    class_name: '১০ম',
    section: 'মানবিক বিভাগ',
    marks: 835,
    gpa: 4.89,
    grade: 'A',
    merit_pos: 1,
    ssc_clearance: 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)',
    notes: 'ফরমপূরণ সম্পন্ন'
  },
  {
    id: 'test-10-4',
    roll_no: '০৪',
    student_id: 'stu-10-hum-02',
    name_bn: 'নাঈমুল ইসলাম',
    class_name: '১০ম',
    section: 'মানবিক বিভাগ',
    marks: 815,
    gpa: 4.67,
    grade: 'A',
    merit_pos: 2,
    ssc_clearance: 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)',
    notes: 'ফরমপূরণ সম্পন্ন'
  },
  {
    id: 'test-10-5',
    roll_no: '০৫',
    student_id: 'stu-10-bs-01',
    name_bn: 'মোস্তাফিজুর রহমান',
    class_name: '১০ম',
    section: 'ব্যবসায় শিক্ষা শাখা',
    marks: 840,
    gpa: 4.89,
    grade: 'A',
    merit_pos: 1,
    ssc_clearance: 'বোর্ড পরীক্ষার জন্য মনোনীত ও সম্পূর্ণ যোগ্য (Clear)',
    notes: 'ফরমপূরণ সম্পন্ন'
  }
];

export const DEFAULT_PUBLIC_EXAM_RESULTS = [
  {
    id: 'pub-2025',
    year: '২০২৫',
    exam_name: 'এসএসসি পরীক্ষা ২০২৫',
    candidates: 142,
    passed: 139,
    gpa5: 38,
    golden_gpa5: 19,
    failed: 3,
    pass_rate: '97.88%',
    board: 'ঢাকা শিক্ষা বোর্ড',
    highlights: 'কালিহাতি উপজেলায় সেরা ৩ বিদ্যালয়ের একটি'
  },
  {
    id: 'pub-2024',
    year: '২০২৪',
    exam_name: 'এসএসসি পরীক্ষা ২০২৪',
    candidates: 138,
    passed: 135,
    gpa5: 34,
    golden_gpa5: 16,
    failed: 3,
    pass_rate: '97.82%',
    board: 'ঢাকা শিক্ষা বোর্ড',
    highlights: 'বিজ্ঞানে শতভাগ পাশ'
  },
  {
    id: 'pub-2023',
    year: '২০২৩',
    exam_name: 'এসএসসি পরীক্ষা ২০২৩',
    candidates: 130,
    passed: 126,
    gpa5: 29,
    golden_gpa5: 12,
    failed: 4,
    pass_rate: '96.92%',
    board: 'ঢাকা শিক্ষা বোর্ড',
    highlights: 'ব্যবসায় শিক্ষায় শতভাগ পাশ'
  },
  {
    id: 'pub-2022',
    year: '২০২২',
    exam_name: 'এসএসসি পরীক্ষা ২০২২',
    candidates: 125,
    passed: 122,
    gpa5: 27,
    golden_gpa5: 11,
    failed: 3,
    pass_rate: '97.60%',
    board: 'ঢাকা শিক্ষা বোর্ড',
    highlights: 'সকল বিভাগে গৌরবোজ্জ্বল সাফল্য'
  },
  {
    id: 'pub-2021',
    year: '২০২১',
    exam_name: 'এসএসসি পরীক্ষা ২০২১',
    candidates: 118,
    passed: 116,
    gpa5: 24,
    golden_gpa5: 9,
    failed: 2,
    pass_rate: '98.30%',
    board: 'ঢাকা শিক্ষা বোর্ড',
    highlights: 'করোনাকালীন পরীক্ষায় অনন্য সাফল্য'
  }
];

// Helper functions for LocalStorage Persistence
export function getStoredAdmissionResults() {
  try {
    const raw = localStorage.getItem('magra_db_admission_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_ADMISSION_RESULTS;
}

export function saveStoredAdmissionResults(data) {
  try {
    localStorage.setItem('magra_db_admission_results', JSON.stringify(data));
  } catch {}
}

export function getStoredHalfYearlyResults() {
  try {
    const raw = localStorage.getItem('magra_db_half_yearly_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_HALF_YEARLY_RESULTS;
}

export function saveStoredHalfYearlyResults(data) {
  try {
    localStorage.setItem('magra_db_half_yearly_results', JSON.stringify(data));
  } catch {}
}

export function getStoredAnnualResults() {
  try {
    const raw = localStorage.getItem('magra_db_annual_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_ANNUAL_RESULTS;
}

export function saveStoredAnnualResults(data) {
  try {
    localStorage.setItem('magra_db_annual_results', JSON.stringify(data));
  } catch {}
}

export function getStoredPreTestResults() {
  try {
    const raw = localStorage.getItem('magra_db_pre_test_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_PRE_TEST_RESULTS;
}

export function saveStoredPreTestResults(data) {
  try {
    localStorage.setItem('magra_db_pre_test_results', JSON.stringify(data));
  } catch {}
}

export function getStoredTestResults() {
  try {
    const raw = localStorage.getItem('magra_db_test_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_TEST_RESULTS;
}

export function saveStoredTestResults(data) {
  try {
    localStorage.setItem('magra_db_test_results', JSON.stringify(data));
  } catch {}
}

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
