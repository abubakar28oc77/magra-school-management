// routineData.js - Authoritative Modern Routine & Exam Schedule Datasets for Magra Pals Union High School
// EIIN: 114290 | Established: 1946

export const WEEK_DAYS = [
  { id: '1', name_bn: 'রবিবার', name_en: 'Sunday', short_bn: 'রবি' },
  { id: '2', name_bn: 'সোমবার', name_en: 'Monday', short_bn: 'সোম' },
  { id: '3', name_bn: 'মঙ্গলবার', name_en: 'Tuesday', short_bn: 'মঙ্গল' },
  { id: '4', name_bn: 'বুধবার', name_en: 'Wednesday', short_bn: 'বুধ' },
  { id: '5', name_bn: 'বৃহস্পতিবার', name_en: 'Thursday', short_bn: 'বৃহস্পতি' }
];

export const DEFAULT_PERIODS = [
  {
    period_no: 'assembly',
    name_bn: 'দৈনিক সমাবেশ',
    type: 'assembly',
    start_time: '10:00',
    end_time: '10:20',
    duration: '২০ মি.',
    activity: 'জাতীয় পতাকা উত্তোলন, জাতীয় সংগীত, শপথ ও পিটি',
    is_assembly: true
  },
  {
    period_no: '1',
    name_bn: '১ম পিরিয়ড',
    type: 'period',
    start_time: '10:20',
    end_time: '11:20',
    duration: '৬০ মি.',
    activity: '১ম ঘণ্টার একাডেমিক পাঠদান'
  },
  {
    period_no: '2',
    name_bn: '২য় পিরিয়ড',
    type: 'period',
    start_time: '11:20',
    end_time: '12:10',
    duration: '৫০ মি.',
    activity: '২য় ঘণ্টার একাডেমিক পাঠদান'
  },
  {
    period_no: '3',
    name_bn: '৩য় পিরিয়ড',
    type: 'period',
    start_time: '12:10',
    end_time: '13:00',
    duration: '৫০ মি.',
    activity: '৩য় ঘণ্টার একাডেমিক পাঠদান'
  },
  {
    period_no: 'tiffin',
    name_bn: 'টিফিন ও নামাজ বিরতি',
    type: 'break',
    start_time: '13:00',
    end_time: '13:50',
    duration: '৫০ মি.',
    activity: 'দুপুরের টিফিন ও জোহরের নামাজ',
    is_break: true
  },
  {
    period_no: '4',
    name_bn: '৪র্থ পিরিয়ড',
    type: 'period',
    start_time: '13:50',
    end_time: '14:35',
    duration: '৪৫ মি.',
    activity: '৪র্থ ঘণ্টার একাডেমিক পাঠদান'
  },
  {
    period_no: '5',
    name_bn: '৫ম পিরিয়ড',
    type: 'period',
    start_time: '14:35',
    end_time: '15:20',
    duration: '৪৫ মি.',
    activity: '৫ম ঘণ্টার একাডেমিক পাঠদান'
  },
  {
    period_no: '6',
    name_bn: '৬ষ্ঠ পিরিয়ড',
    type: 'period',
    start_time: '15:20',
    end_time: '16:00',
    duration: '৪০ মি.',
    activity: '৬ষ্ঠ ঘণ্টার সমাপনী পাঠদান'
  }
];

export const GOVT_STANDARD_PERIODS = [...DEFAULT_PERIODS];

export const SUBJECT_THEMES = {
  'বাংলা': { bg: '#e0f2fe', border: '#38bdf8', text: '#0369a1', icon: '📖' },
  'ইংরেজি': { bg: '#ede9fe', border: '#a78bfa', text: '#6d28d9', icon: '🇬🇧' },
  'গণিত': { bg: '#fef3c7', border: '#fcd34d', text: '#b45309', icon: '📐' },
  'বিজ্ঞান': { bg: '#dcfce7', border: '#86efac', text: '#15803d', icon: '🔬' },
  'পদার্থবিজ্ঞান': { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: '⚛️' },
  'রসায়ন': { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca', icon: '🧪' },
  'জীববিজ্ঞান': { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', icon: '🌱' },
  'উচ্চতর গণিত': { bg: '#fae8ff', border: '#f0abfc', text: '#a21caf', icon: '📊' },
  'তথ্য ও যোগাযোগ প্রযুক্তি': { bg: '#cffafe', border: '#67e8f9', text: '#0e7490', icon: '💻' },
  'বাংলাদেশ ও বিশ্বপরিচয়': { bg: '#ffedd5', border: '#fdba74', text: '#c2410c', icon: '🌍' },
  'ইসলাম ও নৈতিক শিক্ষা': { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '🕌' },
  'হিন্দুধর্ম ও নৈতিক শিক্ষা': { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', icon: '🕉️' },
  'কৃষি শিক্ষা': { bg: '#fefce8', border: '#fde047', text: '#854d0e', icon: '🌾' },
  'ব্যবসায় উদ্যোগ': { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce', icon: '💼' },
  'হিসাববিজ্ঞান': { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155', icon: '📑' },
  'ইতিহাস': { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', icon: '🏛️' },
  'ভূগোল ও পরিবেশ': { bg: '#ecfeff', border: '#a5f3fc', text: '#0891b2', icon: '🗺️' },
  'শারীরিক শিক্ষা ও স্বাস্থ্য': { bg: '#fdf4ff', border: '#f5d0fe', text: '#86198f', icon: '⚽' }
};

export const getSubjectTheme = (subjectName) => {
  if (!subjectName) return { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', icon: '📚' };
  for (const [key, theme] of Object.entries(SUBJECT_THEMES)) {
    if (subjectName.includes(key)) return theme;
  }
  return { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', icon: '📚' };
};

// Default Class Timetable Slots (সাপ্তাহিক ক্লাস রুটিন - দৈনিক ৬টি পিরিয়ড ও সরকারি সময় অনুযায়ী)
export const DEFAULT_CLASS_ROUTINES = [
  // --- Class 6 (৬ষ্ঠ শ্রেণি) ---
  // Sunday (রবিবার)
  { id: 'cr-6-1-1', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'মোঃ সাইদুর রহমান', room: '১০১' },
  { id: 'cr-6-1-2', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'তাপসী সরকার', room: '১০১' },
  { id: 'cr-6-1-3', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মোঃ আনোয়ার হোসেন', room: '১০১' },
  { id: 'cr-6-1-4', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ কামরুল হাসান', room: '১০১' },
  { id: 'cr-6-1-5', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', subject_code: '১৫৪', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ডিজিটাল ল্যাব' },
  { id: 'cr-6-1-6', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'বাংলাদেশ ও বিশ্বপরিচয়', subject_code: '১৫০', teacher_name: 'মোহাম্মদ খালিদুর রহমান তাং', room: '১০১' },

  // Monday (সোমবার)
  { id: 'cr-6-2-1', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '2', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'ইংরেজি ২য় পত্র', subject_code: '১০৮', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: '১০১' },
  { id: 'cr-6-2-2', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '2', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মোঃ আনোয়ার হোসেন', room: '১০১' },
  { id: 'cr-6-2-3', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '2', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'বাংলা ২য় পত্র', subject_code: '১০২', teacher_name: 'রফিকুল ইসলাম', room: '১০১' },
  { id: 'cr-6-2-4', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '2', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ আব্দুল বাছেদ', room: '১০১' },
  { id: 'cr-6-2-5', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '2', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'কৃষি শিক্ষা', subject_code: '১৩৪', teacher_name: 'মোঃ রফিকুল ইসলাম', room: '১০১' },
  { id: 'cr-6-2-6', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '2', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'শারীরিক শিক্ষা', subject_code: '১৪৭', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: 'মাঠ' },

  // Tuesday (মঙ্গলবার)
  { id: 'cr-6-3-1', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '3', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মোঃ আনোয়ার হোসেন', room: '১০১' },
  { id: 'cr-6-3-2', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '3', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'মোঃ সাইদুর রহমান', room: '১০১' },
  { id: 'cr-6-3-3', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '3', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', subject_code: '১৫৪', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ডিজিটাল ল্যাব' },
  { id: 'cr-6-3-4', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '3', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'তাপসী সরকার', room: '১০১' },
  { id: 'cr-6-3-5', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '3', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ কামরুল হাসান', room: 'বিজ্ঞান ল্যাব' },
  { id: 'cr-6-3-6', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '3', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'ইসলাম ও নৈতিক শিক্ষা', subject_code: '১১১', teacher_name: 'মোহাম্মদ এনামুল হক', room: '১০১' },

  // Wednesday (বুধবার)
  { id: 'cr-6-4-1', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '4', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'ইংরেজি ২য় পত্র', subject_code: '১০৮', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: '১০১' },
  { id: 'cr-6-4-2', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '4', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'বাংলা ২য় পত্র', subject_code: '১০২', teacher_name: 'রফিকুল ইসলাম', room: '১০১' },
  { id: 'cr-6-4-3', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '4', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ আব্দুল বাছেদ', room: '১০১' },
  { id: 'cr-6-4-4', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '4', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মুহাম্মদ শফিকুল ইসলাম', room: '১০১' },
  { id: 'cr-6-4-5', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '4', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'বাংলাদেশ ও বিশ্বপরিচয়', subject_code: '১৫০', teacher_name: 'মোহাম্মদ খালিদুর রহমান তাং', room: '১০১' },
  { id: 'cr-6-4-6', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '4', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', subject_code: '১১২', teacher_name: 'তাপসী সরকার', room: '১০১' },

  // Thursday (বৃহস্পতিবার)
  { id: 'cr-6-5-1', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '5', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ কামরুল হাসান', room: '১০১' },
  { id: 'cr-6-5-2', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '5', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মোঃ আনোয়ার হোসেন', room: '১০১' },
  { id: 'cr-6-5-3', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '5', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'তাপসী সরকার', room: '১০১' },
  { id: 'cr-6-5-4', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '5', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'মোঃ সাইদুর রহমান', room: '১০১' },
  { id: 'cr-6-5-5', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '5', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'ইসলাম ও নৈতিক শিক্ষা', subject_code: '১১১', teacher_name: 'মোহাম্মদ এনামুল হক', room: '১০১' },
  { id: 'cr-6-5-6', class_name: '6', section: 'পদ্মা শাখা', day_of_week: '5', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'শারীরিক শিক্ষা ও স্বাস্থ্য', subject_code: '১৪৭', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: 'মাঠ' },

  // --- Class 7 (৭ম শ্রেণি) ---
  { id: 'cr-7-1-1', class_name: '7', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: '১০২' },
  { id: 'cr-7-1-2', class_name: '7', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'মোঃ সাইদুর রহমান', room: '১০২' },
  { id: 'cr-7-1-3', class_name: '7', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ আব্দুল বাছেদ', room: '১০২' },
  { id: 'cr-7-1-4', class_name: '7', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মোঃ আনোয়ার হোসেন', room: '১০২' },
  { id: 'cr-7-1-5', class_name: '7', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'বাংলাদেশ ও বিশ্বপরিচয়', subject_code: '১৫০', teacher_name: 'মোহাম্মদ খালিদুর রহমান তাং', room: '১০২' },
  { id: 'cr-7-1-6', class_name: '7', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', subject_code: '১৫৪', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ডিজিটাল ল্যাব' },

  // --- Class 8 (৮ম শ্রেণি) ---
  { id: 'cr-8-1-1', class_name: '8', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'গণিত', subject_code: '১০৯', teacher_name: 'মুহাম্মদ শফিকুল ইসলাম', room: '১০৩' },
  { id: 'cr-8-1-2', class_name: '8', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'সাধারণ বিজ্ঞান', subject_code: '১২৭', teacher_name: 'মোঃ কামরুল হাসান', room: '১০৩' },
  { id: 'cr-8-1-3', class_name: '8', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'তাপসী সরকার', room: '১০৩' },
  { id: 'cr-8-1-4', class_name: '8', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'রফিকুল ইসলাম', room: '১০৩' },
  { id: 'cr-8-1-5', class_name: '8', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'বাংলাদেশ ও বিশ্বপরিচয়', subject_code: '১৫০', teacher_name: 'মোহাম্মদ খালিদুর রহমান তাং', room: '১০৩' },
  { id: 'cr-8-1-6', class_name: '8', section: 'পদ্মা শাখা', day_of_week: '1', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', subject_code: '১৫৪', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ডিজিটাল ল্যাব' },

  // --- Class 9 (৯ম শ্রেণি বিজ্ঞান ও মানবিক) ---
  { id: 'cr-9-1-1', class_name: '9', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'পদার্থবিজ্ঞান', subject_code: '১৩৬', teacher_name: 'মোঃ কামরুল হাসান', room: '২০১' },
  { id: 'cr-9-1-2', class_name: '9', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'উচ্চতর গণিত', subject_code: '১২৬', teacher_name: 'মুহাম্মদ শফিকুল ইসলাম', room: '২০১' },
  { id: 'cr-9-1-3', class_name: '9', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'রসায়ন', subject_code: '১৩৭', teacher_name: 'মোঃ আব্দুল বাছেদ', room: '২০১' },
  { id: 'cr-9-1-4', class_name: '9', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: '২০১' },
  { id: 'cr-9-1-5', class_name: '9', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', subject_code: '১৫৪', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ডিজিটাল ল্যাব' },
  { id: 'cr-9-1-6', class_name: '9', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'মোঃ সাইদুর রহমান', room: '২০১' },

  { id: 'cr-9h-1-1', class_name: '9', section: 'মানবিক বিভাগ', day_of_week: '1', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', subject_code: '১৫৩', teacher_name: 'মোহাম্মদ খালিদুর রহমান তাং', room: '২০২' },
  { id: 'cr-9h-1-2', class_name: '9', section: 'মানবিক বিভাগ', day_of_week: '1', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'পৌরনীতি ও নাগরিকতা', subject_code: '১৪০', teacher_name: 'রফিকুল ইসলাম', room: '২০২' },
  { id: 'cr-9h-1-3', class_name: '9', section: 'মানবিক বিভাগ', day_of_week: '1', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'সাধারণ গণিত', subject_code: '১০৯', teacher_name: 'মোঃ আনোয়ার হোসেন', room: '২০২' },
  { id: 'cr-9h-1-4', class_name: '9', section: 'মানবিক বিভাগ', day_of_week: '1', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'ইংরেজি ১ম পত্র', subject_code: '১০৭', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: '২০২' },
  { id: 'cr-9h-1-5', class_name: '9', section: 'মানবিক বিভাগ', day_of_week: '1', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'ভূগোল ও পরিবেশ', subject_code: '১১০', teacher_name: 'তাপসী সরকার', room: '২০২' },
  { id: 'cr-9h-1-6', class_name: '9', section: 'মানবিক বিভাগ', day_of_week: '1', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'বাংলা ১ম পত্র', subject_code: '১০১', teacher_name: 'মোঃ সাইদুর রহমান', room: '২০২' },

  // --- Class 10 (১০ম শ্রেণি বিজ্ঞান ও মানবিক) ---
  { id: 'cr-10-1-1', class_name: '10', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '1', start_time: '10:20', end_time: '11:20', subject_name: 'উচ্চতর গণিত', subject_code: '১২৬', teacher_name: 'মুহাম্মদ শফিকুল ইসলাম', room: '২০৩' },
  { id: 'cr-10-1-2', class_name: '10', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '2', start_time: '11:20', end_time: '12:10', subject_name: 'রসায়ন', subject_code: '১৩৭', teacher_name: 'মোঃ আব্দুল বাছেদ', room: '২০৩' },
  { id: 'cr-10-1-3', class_name: '10', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '3', start_time: '12:10', end_time: '13:00', subject_name: 'পদার্থবিজ্ঞান', subject_code: '১৩৬', teacher_name: 'মোঃ কামরুল হাসান', room: '২০৩' },
  { id: 'cr-10-1-4', class_name: '10', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '4', start_time: '13:50', end_time: '14:35', subject_name: 'বাংলা ২য় পত্র', subject_code: '১০২', teacher_name: 'মোঃ সাইদুর রহমান', room: '২০৩' },
  { id: 'cr-10-1-5', class_name: '10', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '5', start_time: '14:35', end_time: '15:20', subject_name: 'ইংরেজি ২য় পত্র', subject_code: '১০৮', teacher_name: 'মোঃ ছানোয়ার হোসেন', room: '২০৩' },
  { id: 'cr-10-1-6', class_name: '10', section: 'বিজ্ঞান বিভাগ', day_of_week: '1', period_no: '6', start_time: '15:20', end_time: '16:00', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', subject_code: '১৫৪', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ডিজিটাল ল্যাব' }
];

// Default Examination Schedules (পরীক্ষার পূর্ণাঙ্গ সময়সূচি)
export const DEFAULT_EXAM_ROUTINES = [
  // --- Exam: অর্ধবার্ষিক পরীক্ষা ২০২৬ (Half-Yearly Exam 2026) ---
  {
    id: 'er-1',
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
    invigilator: 'মোঃ আনোয়ার হোসেন, তাপসী সরকার, মোঃ সাইদুর রহমান',
    instructions: 'পরীক্ষা শুরুর ৩০ মিনিট পূর্বে হলে উপস্থিত হতে হবে।'
  },
  {
    id: 'er-2',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'বাংলা ২য় পত্র',
    subject_code: '১০২',
    exam_date: '2026-06-17',
    day_name: 'মঙ্গলবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'রফিকুল ইসলাম, মোহাম্মদ এনামুল হক',
    instructions: 'প্রবেশপত্র সাথে রাখা বাধ্যতামূলক।'
  },
  {
    id: 'er-3',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'ইংরেজি ১ম পত্র',
    subject_code: '১০৭',
    exam_date: '2026-06-21',
    day_name: 'রবিবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোঃ ছানোয়ার হোসেন, তাপসী সরকার',
    instructions: 'কোনো ধরণের ডিজিটাল ডিভাইস অনুমোদিত নয়।'
  },
  {
    id: 'er-4',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'ইংরেজি ২য় পত্র',
    subject_code: '১০৮',
    exam_date: '2026-06-23',
    day_name: 'মঙ্গলবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোঃ কামরুল হাসান, মোঃ সাইদুর রহমান',
    instructions: 'সাদা কাগজে স্বচ্ছ উত্তরপত্র দেওয়া হবে।'
  },
  {
    id: 'er-5',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'গণিত / সাধারণ গণিত',
    subject_code: '১০৯',
    exam_date: '2026-06-25',
    day_name: 'বৃহস্পতিবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোঃ আনোয়ার হোসেন, মুহাম্মদ শফিকুল ইসলাম',
    instructions: 'জ্যামিতি বক্স ও সাধারণ সাইন্টিফিক ক্যালকুলেটর অনুমোদিত।'
  },
  {
    id: 'er-6',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'সাধারণ বিজ্ঞান / পদার্থবিজ্ঞান / ইতিহাস',
    subject_code: '১২৭/১৩৬/১৫৩',
    exam_date: '2026-06-28',
    day_name: 'রবিবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোঃ কামরুল হাসান, মোঃ আব্দুল বাছেদ',
    instructions: 'বিজ্ঞান বিভাগের জন্য চিত্র অঙ্কন বাধ্যতামূলক।'
  },
  {
    id: 'er-7',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'বাংলাদেশ ও বিশ্বপরিচয় / রসায়ন / পৌরনীতি',
    subject_code: '১৫০/১৩৭/১৪০',
    exam_date: '2026-06-30',
    day_name: 'মঙ্গলবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোহাম্মদ খালিদুর রহমান তাং, রফিকুল ইসলাম',
    instructions: 'OMR শিটে রোল ও রেজিস্ট্রেশন নম্বর সঠিক বৃত্ত ভরাট করতে হবে।'
  },
  {
    id: 'er-8',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    subject_code: '১৫৪',
    exam_date: '2026-07-02',
    day_name: 'বৃহস্পতিবার',
    start_time: '10:00',
    end_time: '12:00',
    duration: '২ ঘণ্টা',
    full_marks: 50,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মুহাম্মদ আবুবকর সিদ্দিক, মোঃ আনোয়ার হোসেন',
    instructions: 'তত্ত্বীয় ২৫ ও ব্যবহারিক ২৫ নম্বরের ভিত্তিতে মূল্যায়ন হবে।'
  },
  {
    id: 'er-9',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'সকল শাখা/বিভাগ',
    subject_name: 'ধর্ম ও নৈতিক শিক্ষা (ইসলাম / হিন্দু)',
    subject_code: '১১১/১১২',
    exam_date: '2026-07-05',
    day_name: 'রবিবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মোহাম্মদ এনামুল হক, তাপসী সরকার',
    instructions: 'স্ব স্ব ধর্মীয় বিষয় অনুযায়ী প্রশ্নপত্র গ্রহণ করতে হবে।'
  },
  {
    id: 'er-10',
    exam_id: 'ex-2',
    exam_name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
    academic_year: '2026',
    class_name: 'all',
    section: 'বিজ্ঞান/মানবিক/ব্যবসায় শিক্ষা',
    subject_name: 'উচ্চতর গণিত / জীববিজ্ঞান / অর্থনীতি / কৃষি',
    subject_code: '১২৬/১৩৮/১৪১/১৩৪',
    exam_date: '2026-07-08',
    day_name: 'বুধবার',
    start_time: '10:00',
    end_time: '13:00',
    duration: '৩ ঘণ্টা',
    full_marks: 100,
    room_no: '১০১, ১০২, ১০৩, ২০১, ২০৩',
    invigilator: 'মুহাম্মদ শফিকুল ইসলাম, মোঃ আব্দুল বাছেদ, মোঃ কামরুল হাসান',
    instructions: 'ঐচ্ছিক ও ৪র্থ বিষয়ের শিক্ষার্থীদের জন্য প্রযোজ্য।'
  }
];

export const EXAM_INSTRUCTIONS = [
  'পরীক্ষা শুরুর অন্তত ৩০ (ত্রিশ) মিনিট পূর্বে পরীক্ষার্থীদের অবশ্যই পরীক্ষা কেন্দ্রে উপস্থিত হয়ে নির্ধারিত আসন গ্রহণ করতে হবে।',
  'মূল প্রবেশপত্র (Admit Card) ব্যতীত কোনো পরীক্ষার্থীকে পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।',
  'পরীক্ষা কক্ষে মোবাইল ফোন, স্মার্ট ওয়াচ, ব্লুটুথ ডিভাইস বা যেকোনো ধরণের অননুমোদিত ইলেকট্রনিক সামগ্রী আনা সম্পূর্ণ নিষিদ্ধ।',
  'উত্তরপত্রের কভার পৃষ্ঠায় ওএমআর (OMR) ফরমে রোল নম্বর, রেজিস্ট্রেশন নম্বর ও বিষয় কোড সতর্কতার সাথে কালো কালির বলপেন দিয়ে বৃত্ত ভরাট করতে হবে।',
  'শুধুমাত্র বিজ্ঞান ও গণিত বিষয়ের পরীক্ষার্থীবৃন্দ সাধারণ সাইন্টিফিক ক্যালকুলেটর (Non-programmable) ব্যবহার করতে পারবে।',
  'পরীক্ষার নির্ধারিত সময় সমাপ্তির পূর্বে কোনো পরীক্ষার্থীকে কক্ষ ত্যাগ করার অনুমতি দেওয়া হবে না।',
  'পরীক্ষা চলাকালীন যেকোনো ধরণের অসদুপায় বা বিশৃঙ্খলা সৃষ্টি করলে সংশ্লিষ্ট পরীক্ষার্থীর পরীক্ষা তাৎক্ষণিক বাতিল বলে গণ্য হবে।'
];
