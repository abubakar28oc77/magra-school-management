// Data Store for Student Details: Scholarships, Stipends, Meritorious & Class Seats
// Synchronizes with localStorage so user inputs/edits persist across browser reloads
import { getStudentPhoto, isUserAttachedPhoto } from './mockData';

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
  // ১০ম শ্রেণি — বিজ্ঞান বিভাগ
  {
    id: 'merit-10-sci-01',
    student_id: 'STU-10-SCI-01',
    name_bn: 'আহনাফ সিদ্দিক',
    roll_no: '০১',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    category: 'মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় বিজ্ঞান বিভাগে ১ম স্থান ও জিপিএ ৫.০০',
    photo_url: '',
    notes: 'গণিত ও বিজ্ঞান মেলায় শ্রেষ্ঠত্ব অর্জনকারী'
  },
  {
    id: 'merit-10-sci-02',
    student_id: 'STU-10-SCI-02',
    name_bn: 'শিহাব উদ্দিন',
    roll_no: '০২',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    category: 'মেধা তালিকায় ২য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় বিজ্ঞান বিভাগে ২য় স্থান',
    photo_url: '',
    notes: 'নিয়মিত উপস্থিতি ও পড়াশোনায় বিশেষ পারদর্শী'
  },
  {
    id: 'merit-10-sci-03',
    student_id: 'STU-10-SCI-03',
    name_bn: 'শাওন আহমেদ',
    roll_no: '০৩',
    class_name: '১০ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    category: 'মেধা তালিকায় ৩য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় বিজ্ঞান বিভাগে ৩য় স্থান',
    photo_url: '',
    notes: 'সহশিক্ষা কার্যক্রম ও কুইজ প্রতিযোগিতায় পারদর্শী'
  },

  // ৯ম শ্রেণি — বিজ্ঞান বিভাগ
  {
    id: 'merit-09-sci-01',
    student_id: 'STU-09-SCI-01',
    name_bn: 'দেবজিৎ কর্মকার',
    roll_no: '০১',
    class_name: '৯ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    category: 'মেধা তালিকায় ১ম স্থান ও জিপিএ ৫.০০',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় বিজ্ঞান বিভাগে ১ম স্থান ও জিপিএ ৫.০০',
    photo_url: '',
    notes: 'বিজ্ঞান অলিম্পিয়াড ও সাহিত্য চর্চায় অগ্রগামী'
  },
  {
    id: 'merit-09-sci-02',
    student_id: 'STU-09-SCI-02',
    name_bn: 'মোঃ আবু রাসেল সিদ্দিকী',
    roll_no: '০২',
    class_name: '৯ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    category: 'মেধা তালিকায় ২য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় বিজ্ঞান বিভাগে ২য় স্থান',
    photo_url: '',
    notes: 'নিয়মিত উপস্থিতি ও আদর্শ আচরণে অগ্রণী'
  },
  {
    id: 'merit-09-sci-03',
    student_id: 'STU-09-SCI-03',
    name_bn: 'মোঃ সিফাত আহমেদ',
    roll_no: '০৩',
    class_name: '৯ম',
    section: 'বিজ্ঞান বিভাগ',
    department: 'বিজ্ঞান',
    category: 'মেধা তালিকায় ৩য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় বিজ্ঞান বিভাগে ৩য় স্থান',
    photo_url: '',
    notes: 'বিজ্ঞান প্রজেক্ট ও বিতর্ক ক্লাবের সক্রিয় সদস্য'
  },

  // ৮ম শ্রেণি
  {
    id: 'merit-08-01',
    student_id: 'STU-08-01',
    name_bn: 'দিপ্ত',
    roll_no: '০১',
    class_name: '৮ম',
    section: 'সাধারণ বিভাগ',
    department: '',
    category: 'মেধা তালিকায় ১ম স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ১ম স্থান',
    photo_url: '',
    notes: 'শুদ্ধাচার ও নিয়মিত উপস্থিতিতে আদর্শ শিক্ষার্থী'
  },
  {
    id: 'merit-08-02',
    student_id: 'STU-08-02',
    name_bn: 'আদর্শ পাল',
    roll_no: '০২',
    class_name: '৮ম',
    section: 'সাধারণ বিভাগ',
    department: '',
    category: 'মেধা তালিকায় ২য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ২য় স্থান',
    photo_url: '',
    notes: 'পড়াশোনায় গভীর মনোযোগী ও সৃজনশীল শিক্ষার্থী'
  },
  {
    id: 'merit-08-03',
    student_id: 'STU-08-03',
    name_bn: 'তাহসিন হাসান',
    roll_no: '০৩',
    class_name: '৮ম',
    section: 'সাধারণ বিভাগ',
    department: '',
    category: 'মেধা তালিকায় ৩য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ৩য় স্থান',
    photo_url: '',
    notes: 'উপজেলা গণিত অলিম্পিয়াডে রানার-আপ পদক'
  },

  // ৭ম শ্রেণি
  {
    id: 'merit-07-01',
    student_id: 'STU-07-01',
    name_bn: 'মাহির ফয়সাল',
    roll_no: '০১',
    class_name: '৭ম',
    section: 'সাধারণ বিভাগ',
    department: '',
    category: 'মেধা তালিকায় ১ম স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ১ম স্থান',
    photo_url: '',
    notes: 'ভর্তি পরীক্ষায় সর্বোচ্চ নম্বর ও উপস্থিতিতে সেরা'
  },
  {
    id: 'merit-07-02',
    student_id: 'STU-07-02',
    name_bn: 'নাদিয়া সুলতানা',
    roll_no: '০২',
    class_name: '৭ম',
    section: 'সাধারণ বিভাগ',
    department: '',
    category: 'মেধা তালিকায় ২য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ২য় স্থান',
    photo_url: '',
    notes: 'সাংস্কৃতিক ও দেশাত্মবোধক গানে জেলা সেরা'
  },
  {
    id: 'merit-07-03',
    student_id: 'STU-07-03',
    name_bn: 'তানজিম আহমেদ',
    roll_no: '০৩',
    class_name: '৭ম',
    section: 'সাধারণ বিভাগ',
    department: '',
    category: 'মেধা তালিকায় ৩য় স্থান',
    academic_year: '২০২৫-২০২৬',
    achievement_title: 'বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ৩য় স্থান',
    photo_url: '',
    notes: 'সৃজনশীল মেধা অন্বেষণে বিশেষ প্রশংসাপ্রাপ্ত'
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
    let enrolled = [];
    try {
      const rawEnrolled = localStorage.getItem('magra_db_students');
      if (rawEnrolled) {
        const parsed = JSON.parse(rawEnrolled);
        if (Array.isArray(parsed) && parsed.length) enrolled = parsed;
      }
    } catch {}

    let customList = [];
    try {
      const rawCustom = localStorage.getItem('magra_db_meritorious_students');
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed) && parsed.length) customList = parsed;
      }
    } catch {}

    // Check if stored list is obsolete mock list (<= 5 students or has old mock name 'তানভীর আহমেদ')
    const isObsoleteMock = !customList.length || customList.length <= 5 || customList.some(s => s.name_bn === 'তানভীর আহমেদ' || s.student_id === 'stu-06-01');

    const customMap = new Map();
    if (!isObsoleteMock) {
      customList.forEach(item => {
        if (item.student_id) customMap.set(String(item.student_id).toUpperCase().trim(), item);
        if (item.id) customMap.set(String(item.id).toUpperCase().trim(), item);
      });
    }

    const bnDigits = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
    const parseNum = (val) => {
      if (!val && val !== 0) return 99999;
      const str = String(val).trim();
      const converted = str.split('').map(ch => bnDigits[ch] !== undefined ? bnDigits[ch] : ch).join('');
      const m = converted.match(/\d+/);
      return m ? parseInt(m[0], 10) : 99999;
    };
    const isSci = (s) => {
      const str = [s.department, s.group_name, s.group, s.section, s.student_id, s.id].filter(Boolean).join(' ').toLowerCase();
      return str.includes('বিজ্ঞান') || str.includes('sci');
    };

    const targets = [
      { classNum: 10, classBn: '১০ম', isScience: true, roll: 1, posLabel: '১ম স্থান ও জিপিএ ৫.০০' },
      { classNum: 10, classBn: '১০ম', isScience: true, roll: 2, posLabel: '২য় স্থান' },
      { classNum: 10, classBn: '১০ম', isScience: true, roll: 3, posLabel: '৩য় স্থান' },
      { classNum: 9, classBn: '৯ম', isScience: true, roll: 1, posLabel: '১ম স্থান ও জিপিএ ৫.০০' },
      { classNum: 9, classBn: '৯ম', isScience: true, roll: 2, posLabel: '২য় স্থান' },
      { classNum: 9, classBn: '৯ম', isScience: true, roll: 3, posLabel: '৩য় স্থান' },
      { classNum: 8, classBn: '৮ম', isScience: false, roll: 1, posLabel: '১ম স্থান' },
      { classNum: 8, classBn: '৮ম', isScience: false, roll: 2, posLabel: '২য় স্থান' },
      { classNum: 8, classBn: '৮ম', isScience: false, roll: 3, posLabel: '৩য় স্থান' },
      { classNum: 7, classBn: '৭ম', isScience: false, roll: 1, posLabel: '১ম স্থান' },
      { classNum: 7, classBn: '৭ম', isScience: false, roll: 2, posLabel: '২য় স্থান' },
      { classNum: 7, classBn: '৭ম', isScience: false, roll: 3, posLabel: '৩য় স্থান' },
    ];

    const result = targets.map((t, idx) => {
      const defaultItem = DEFAULT_MERITORIOUS_STUDENTS[idx] || {};
      
      const found = enrolled.find(s => {
        const c = parseNum(s.class_name);
        if (c !== t.classNum) return false;
        const r = parseNum(s.roll_no);
        if (r !== t.roll) return false;
        if (t.isScience) return isSci(s);
        return true;
      });

      const name_bn = found?.name_bn || defaultItem.name_bn || '';
      const student_id = found?.student_id || defaultItem.student_id || `STU-${t.classNum}-${t.roll}`;
      const roll_no = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][t.roll] ? '০' + ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][t.roll] : String(t.roll);
      const section = t.isScience ? 'বিজ্ঞান বিভাগ' : (found?.section || defaultItem.section || 'সাধারণ বিভাগ');
      
      const custom = customMap.get(String(student_id).toUpperCase().trim()) || 
                     customMap.get(String(defaultItem.student_id || '').toUpperCase().trim()) ||
                     customMap.get(String(defaultItem.id || '').toUpperCase().trim());

      // Resolve student photo: strictly prioritize real attached photo from the student list / storage
      const studentObjForPhoto = found || {
        id: student_id,
        student_id: student_id,
        class_name: t.classBn,
        roll_no: t.roll,
        department: t.isScience ? 'বিজ্ঞান' : ''
      };
      const listAttachedPhoto = getStudentPhoto(studentObjForPhoto);
      const isListPhotoAttached = isUserAttachedPhoto(listAttachedPhoto);
      const isCustomPhotoAttached = isUserAttachedPhoto(custom?.photo_url);

      const photo_url = isListPhotoAttached 
        ? listAttachedPhoto 
        : (isCustomPhotoAttached 
            ? custom.photo_url 
            : (listAttachedPhoto || defaultItem.photo_url || ''));

      return {
        id: defaultItem.id || `merit-${t.classNum}-${t.roll}`,
        student_id: student_id,
        name_bn: custom?.name_bn || name_bn,
        roll_no: roll_no,
        class_name: t.classBn,
        section: section,
        department: t.isScience ? 'বিজ্ঞান' : (found?.department || ''),
        category: custom?.category || defaultItem.category || `মেধা তালিকায় ${t.posLabel}`,
        academic_year: custom?.academic_year || defaultItem.academic_year || '২০২৫-২০২৬',
        achievement_title: custom?.achievement_title || defaultItem.achievement_title || `বার্ষিক পরীক্ষায় শ্রেণি মেধা তালিকায় ${t.posLabel}`,
        photo_url: photo_url,
        notes: custom?.notes || defaultItem.notes || ''
      };
    });

    if (isObsoleteMock) {
      try {
        localStorage.setItem('magra_db_meritorious_students', JSON.stringify(result));
      } catch {}
    }

    return result;
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
