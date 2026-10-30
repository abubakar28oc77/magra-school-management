// Data Store for Student Details: Scholarships, Stipends, Meritorious & Class Seats
// Synchronizes with localStorage so user inputs/edits persist across browser reloads

export const DEFAULT_GOVT_SCHOLARSHIPS = [
  {
    id: 'gov-sch-1',
    student_id: 'stu-10-sci-01',
    name_bn: 'তানভীর আহমেদ',
    roll_no: '০১',
    class_name: '১০ম',
    exam_type: '৮ম শ্রেণি মেধা বৃত্তি পরীক্ষা',
    scholarship_type: 'ট্যালেন্টপুল বৃত্তি',
    academic_year: '২০২৫',
    amount: '৪,৫০০',
    provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর, ঢাকা',
    status: 'চলমান',
    notes: 'গণিত ও সাধারণ বিজ্ঞানে সর্বোচ্চ নম্বরের জন্য মেধা বৃত্তি প্রাপ্ত'
  },
  {
    id: 'gov-sch-2',
    student_id: 'stu-08-01',
    name_bn: 'জান্নাতুল ফেরদৌস',
    roll_no: '০২',
    class_name: '৮ম',
    exam_type: '৫ম শ্রেণি প্রাথমিক সমাপনী মেধা বৃত্তি',
    scholarship_type: 'ট্যালেন্টপুল বৃত্তি',
    academic_year: '২০২৫',
    amount: '৩,৬০০',
    provider: 'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়',
    status: 'চলমান',
    notes: 'উপজেলা পর্যায়ে সর্বোচ্চ নম্বর অর্জনকারী'
  },
  {
    id: 'gov-sch-3',
    student_id: 'stu-08-02',
    name_bn: 'সায়িম হাসান',
    roll_no: '০৫',
    class_name: '৮ম',
    exam_type: '৫ম শ্রেণি প্রাথমিক মেধা বৃত্তি',
    scholarship_type: 'সাধারণ বৃত্তি',
    academic_year: '২০২৫',
    amount: '২,৪০০',
    provider: 'প্রাথমিক শিক্ষা অধিদপ্তর',
    status: 'চলমান',
    notes: 'কালিহাতি উপজেলার সাধারণ কোটা বৃত্তি'
  },
  {
    id: 'gov-sch-4',
    student_id: 'stu-09-sci-01',
    name_bn: 'ফারজানা মেহজাবীন',
    roll_no: '০১',
    class_name: '৯ম',
    exam_type: '৮ম শ্রেণি মেধা বৃত্তি পরীক্ষা',
    scholarship_type: 'ট্যালেন্টপুল বৃত্তি',
    academic_year: '২০২৪',
    amount: '৪,৫০০',
    provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর, ঢাকা',
    status: 'চলমান',
    notes: 'সাহিত্য ও বিজ্ঞান অলিম্পিয়াড কৃতি শিক্ষার্থী'
  },
  {
    id: 'gov-sch-5',
    student_id: 'stu-10-hum-01',
    name_bn: 'নাঈমুল ইসলাম',
    roll_no: '০৪',
    class_name: '১০ম',
    exam_type: '৮ম শ্রেণি সমাপনী বৃত্তি',
    scholarship_type: 'সাধারণ বৃত্তি',
    academic_year: '২০২৪',
    amount: '৩,০০০',
    provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর, ঢাকা',
    status: 'চলমান',
    notes: 'মেধাবী ও নিয়মিত উপস্থিত শিক্ষার্থী'
  }
];

export const DEFAULT_STIPEND_STUDENTS = [
  {
    id: 'stp-stu-10-sci-03',
    student_id: 'STU-10-SCI-03',
    name_bn: 'শাওন আহমেদ',
    roll_no: '০৩',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    guardian_name: 'মোঃ সাইদুর রহমান',
    guardian_phone: '০১৭২২-১১২২৩৩',
    mfs_provider: 'নগদ',
    mfs_account: '০১৭২২১১২২৩৩',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৪,৫০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: 'উপবৃত্তি সুবিধাভোগী আইডি: HSP-2026-1003',
    is_stipend: true
  },
  {
    id: 'stp-stu-10-sci-05',
    student_id: 'STU-10-SCI-05',
    name_bn: 'মানিক',
    roll_no: '০৫',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    guardian_name: 'মোঃ সোলেমান মিয়া',
    guardian_phone: '০১৭১১-২২৩৩৪৪',
    mfs_provider: 'বিকাশ',
    mfs_account: '০১৭১১২২৩৩৪৪',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৪,৫০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: 'উপবৃত্তি সুবিধাভোগী আইডি: HSP-2026-1005',
    is_stipend: true
  },
  {
    id: 'stp-stu-09-06',
    student_id: 'STU-09-06',
    name_bn: 'তামিম আল হাসান',
    roll_no: '০৬',
    class_name: '৯ম',
    section: 'ক শাখা',
    department: '',
    guardian_name: 'মোঃ রফিকুল ইসলাম',
    guardian_phone: '০১৭১২-৩৩৪৪৫৫',
    mfs_provider: 'নগদ',
    mfs_account: '০১৭১২৩৩৪৪৫৫',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৪,২০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: 'উপবৃত্তি সুবিধাভোগী আইডি: HSP-2026-0906',
    is_stipend: true
  },
  {
    id: 'stp-stu-09-09',
    student_id: 'STU-09-09',
    name_bn: 'স্নেহাশীষ পাল',
    roll_no: '০৯',
    class_name: '৯ম',
    section: 'ক শাখা',
    department: '',
    guardian_name: 'সমীর পাল',
    guardian_phone: '০১৭১৩-৪৪৫৫৬৬',
    mfs_provider: 'বিকাশ',
    mfs_account: '০১৭১৩৪৪৫৫৬৬',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৪,২০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: 'উপবৃত্তি সুবিধাভোগী আইডি: HSP-2026-0909',
    is_stipend: true
  },
  {
    id: 'stp-stu-08-06',
    student_id: 'STU-08-06',
    name_bn: 'সুস্ময় পাল',
    roll_no: '০৬',
    class_name: '৮ম',
    section: 'ক শাখা',
    department: '',
    guardian_name: 'অমল পাল',
    guardian_phone: '০১৭১৪-৫৫৬৬৭৭',
    mfs_provider: 'নগদ',
    mfs_account: '০১৭১৪৫৫৬৬৭৭',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৩,০০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: 'উপবৃত্তি সুবিধাভোগী আইডি: HSP-2026-0806',
    is_stipend: true
  },
  {
    id: 'stp-stu-08-08',
    student_id: 'STU-08-08',
    name_bn: 'সুবর্না রানী',
    roll_no: '০৮',
    class_name: '৮ম',
    section: 'ক শাখা',
    department: '',
    guardian_name: 'অনিল চন্দ্র রায়',
    guardian_phone: '০১৭১৫-৬৬৭৭৮৮',
    mfs_provider: 'বিকাশ',
    mfs_account: '০১৭১৫৬৬৭৭৮৮',
    scheme_name: 'সমন্বিত উপবৃত্তি কর্মসূচি (HSP)',
    academic_year: '২০২৬',
    amount: '৩,০০০',
    cycle: 'দ্বি-বার্ষিক',
    status: 'অনুমোদিত ও সক্রিয়',
    notes: 'উপবৃত্তি সুবিধাভোগী আইডি: HSP-2026-0808',
    is_stipend: true
  }
];

export const DEFAULT_MERITORIOUS_STUDENTS = [
  {
    id: 'merit-1',
    student_id: 'stu-10-sci-01',
    name_bn: 'তানভীর আহমেদ',
    roll_no: '০১',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    category: 'বার্ষিক মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'কালিহাতি উপজেলা বিজ্ঞান মেলা ২০২৫ — সেরা খুদে উদ্ভাবক পুরস্কার',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&h=240&fit=crop',
    notes: 'জাতীয় কিশোর প্রোগ্রামিং প্রতিযোগিতায় জেলা পর্যায়ে শ্রেষ্ঠত্ব অর্জন'
  },
  {
    id: 'merit-2',
    student_id: 'stu-09-sci-01',
    name_bn: 'ফারজানা মেহজাবীন',
    roll_no: '০১',
    class_name: '৯ম',
    section: 'বিজ্ঞান বিভাগ',
    category: 'বার্ষিক মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'টাঙ্গাইল জেলা সাহিত্য ও আবৃত্তি উৎসব ২০২৫ — স্বর্ণপদক ও ১ম স্থান',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop',
    notes: 'বিদ্যালয় দেয়াল পত্রিকা "কিশলয়"-এর প্রধান শিক্ষার্থী সম্পাদক'
  },
  {
    id: 'merit-3',
    student_id: 'stu-08-01',
    name_bn: 'তাহসিন হাসান',
    roll_no: '০১',
    class_name: '৮ম',
    section: 'ক শাখা',
    category: 'বার্ষিক মেধা তালিকায় ১ম স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'উপজেলা গণিত অলিম্পিয়াড ২০২৫ — রানার-আপ পদক',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop',
    notes: 'শুদ্ধাচার ও নিয়মিত উপস্থিতিতে আদর্শ শিক্ষার্থী'
  },
  {
    id: 'merit-4',
    student_id: 'stu-07-02',
    name_bn: 'নাদিয়া সুলতানা',
    roll_no: '০২',
    class_name: '৭ম',
    section: 'খ শাখা',
    category: 'মেধা তালিকায় শীর্ষ স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'জাতীয় শিশু-কিশোর প্রতিযোগিতা — দেশাত্মবোধক গানে জেলা সেরা',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop',
    notes: 'সাংস্কৃতিক ও সহশিক্ষা কার্যক্রমে অনন্য অবদান'
  },
  {
    id: 'merit-5',
    student_id: 'stu-06-01',
    name_bn: 'আরিফুর রহমান',
    roll_no: '০১',
    class_name: '৬ষ্ঠ',
    section: 'ক শাখা',
    category: 'প্রাথমিক মেধা বৃত্তি ও ভর্তি পরীক্ষায় ১ম স্থান',
    academic_year: '২০২৬',
    achievement_title: 'ভর্তি পরীক্ষা ২০২৬-এ ১০০ নম্বরের মধ্যে ৯৮ নম্বর পেয়ে শীর্ষ স্থান',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop',
    notes: 'মেধাবী ও ভবিষ্যৎ সম্ভাবনাময় তরুণ শিক্ষার্থী'
  }
];

export const DEFAULT_FORMER_MERITORIOUS = [
  {
    id: 'fmerit-1',
    name_bn: 'প্রকৌশলী মোঃ মাহফুজুর রহমান',
    passing_year: '২০১৮',
    exam_result: 'এসএসসি ২০১৮ — গোল্ডেন জিপিএ ৫.০০ (বিজ্ঞান)',
    current_status: 'সফটওয়্যার ইঞ্জিনিয়ার, স্যামসাং আরঅ্যান্ডডি ইনস্টিটিউট',
    higher_education: 'বিএসসি ইন সিএসই, বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop',
    phone: '০১৭০০-০০০০০১',
    notes: 'মগড়া স্কুলের গণিত ক্লাবের প্রতিষ্ঠাতা শিক্ষার্থী সমন্বয়ক'
  },
  {
    id: 'fmerit-2',
    name_bn: 'ডাঃ সানজিদা আক্তার',
    passing_year: '২০১৯',
    exam_result: 'এসএসসি ২০১৯ — গোল্ডেন জিপিএ ৫.০০ (বিজ্ঞান)',
    current_status: 'ইন্টার্ন চিকিৎসক, ঢাকা মেডিকেল কলেজ ও হাসপাতাল',
    higher_education: 'এমবিবিএস, ঢাকা মেডিকেল কলেজ (ডিএমসি)',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&h=240&fit=crop',
    phone: '০১৭০০-০০০০০২',
    notes: 'মেডিকেল ভর্তি পরীক্ষায় জাতীয় মেধা তালিকায় ১২৭তম স্থান'
  },
  {
    id: 'fmerit-3',
    name_bn: 'মোঃ আসিফ ইকবাল',
    passing_year: '২০২০',
    exam_result: 'এসএসসি ২০২০ — গোল্ডেন জিপিএ ৫.০০ (ব্যবসায় শিক্ষা)',
    current_status: 'এমবিএ গবেষক ও অ্যাসিস্ট্যান্ট ডিরেক্টর ট্রেইনি, বাংলাদেশ ব্যাংক',
    higher_education: 'বিবিএ ও এমবিএ (ফাইন্যান্স), ঢাকা বিশ্ববিদ্যালয়',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop',
    phone: '০১৭০০-০০০০০৩',
    notes: 'আন্তঃবিশ্ববিদ্যালয় বিজনেস কেইস কমপিটিশন চ্যাম্পিয়ন'
  },
  {
    id: 'fmerit-4',
    name_bn: 'লেফটেন্যান্ট তানভীর হাসান',
    passing_year: '২০১৭',
    exam_result: 'এসএসসি ২০১৭ — গোল্ডেন জিপিএ ৫.০০ (বিজ্ঞান)',
    current_status: 'কমিশন্ড অফিসার, বাংলাদেশ সেনাবাহিনী',
    higher_education: 'বাংলাদেশ মিলিটারি একাডেমি (বিএমএ, ৮০তম দীর্ঘমেয়াদী কোর্স)',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop',
    phone: '০১৭০০-০০০০০৪',
    notes: 'মগড়া স্কুলের প্রাক্তন স্কাউট লিডার'
  },
  {
    id: 'fmerit-5',
    name_bn: 'মারুফা ইয়াসমিন',
    passing_year: '২০২১',
    exam_result: 'এসএসসি ২০২১ — গোল্ডেন জিপিএ ৫.০০ (বিজ্ঞান)',
    current_status: 'অনার্স শিক্ষার্থী, ফার্মেসি বিভাগ',
    higher_education: 'ফার্মেসি বিভাগ, জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop',
    phone: '০১৭০০-০০০০০৫',
    notes: 'জাতীয় বিজ্ঞান কুইজ প্রতিযোগিতায় রানার-আপ'
  }
];

export const DEFAULT_CLASS_SEATS = [
  {
    class_id: '6',
    class_name: '৬ষ্ঠ শ্রেণি',
    sections: 'ক ও খ শাখা',
    capacity: 120,
    boys: 57,
    girls: 53,
    enrolled: 110,
    vacant: 10,
    admission_status: 'চলমান (সীমিত আসন ফাঁকা)'
  },
  {
    class_id: '7',
    class_name: '৭ম শ্রেণি',
    sections: 'ক ও খ শাখা',
    capacity: 120,
    boys: 58,
    girls: 49,
    enrolled: 107,
    vacant: 13,
    admission_status: 'চলমান (আসন শূন্য রয়েছে)'
  },
  {
    class_id: '8',
    class_name: '৮ম শ্রেণি',
    sections: 'ক ও খ শাখা',
    capacity: 120,
    boys: 52,
    girls: 51,
    enrolled: 103,
    vacant: 17,
    admission_status: 'চলমান (আসন শূন্য রয়েছে)'
  },
  {
    class_id: '9',
    class_name: '৯ম শ্রেণি',
    sections: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা',
    capacity: 150,
    boys: 68,
    girls: 62,
    enrolled: 130,
    vacant: 20,
    admission_status: 'শাখাভিত্তিক ভর্তি উন্মুক্ত'
  },
  {
    class_id: '10',
    class_name: '১০ম শ্রেণি',
    sections: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা',
    capacity: 150,
    boys: 71,
    girls: 67,
    enrolled: 138,
    vacant: 12,
    admission_status: 'নিয়মিত পাঠদানরত'
  }
];

// Helper functions for LocalStorage Persistence
export function getStoredGovtScholarships() {
  try {
    const raw = localStorage.getItem('magra_db_govt_scholarships');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_GOVT_SCHOLARSHIPS;
}

export function saveStoredGovtScholarships(data) {
  try {
    localStorage.setItem('magra_db_govt_scholarships', JSON.stringify(data));
  } catch {}
}

export function getStoredStipendStudents() {
  try {
    const raw = localStorage.getItem('magra_db_stipend_students');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return DEFAULT_STIPEND_STUDENTS;
}

export function saveStoredStipendStudents(data) {
  try {
    localStorage.setItem('magra_db_stipend_students', JSON.stringify(data));
  } catch {}
}

export function getStoredMeritoriousStudents() {
  try {
    const raw = localStorage.getItem('magra_db_meritorious_students');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_MERITORIOUS_STUDENTS;
}

export function saveStoredMeritoriousStudents(data) {
  try {
    localStorage.setItem('magra_db_meritorious_students', JSON.stringify(data));
  } catch {}
}

export function getStoredFormerMeritorious() {
  try {
    const raw = localStorage.getItem('magra_db_former_meritorious');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_FORMER_MERITORIOUS;
}

export function saveStoredFormerMeritorious(data) {
  try {
    localStorage.setItem('magra_db_former_meritorious', JSON.stringify(data));
  } catch {}
}

export function getStoredClassSeats() {
  try {
    const raw = localStorage.getItem('magra_db_class_seats');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_CLASS_SEATS;
}

export function saveStoredClassSeats(data) {
  try {
    localStorage.setItem('magra_db_class_seats', JSON.stringify(data));
  } catch {}
}
