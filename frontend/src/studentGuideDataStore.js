// studentGuideDataStore.js - Comprehensive Data Store for শিক্ষার্থীর গাইড (Student Guide)

// Helper for local storage persistence
function getStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem('magra_db_guide_' + key);
    if (!raw) {
      localStorage.setItem('magra_db_guide_' + key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStoredData(key, data) {
  try {
    localStorage.setItem('magra_db_guide_' + key, JSON.stringify(data));
  } catch (e) {}
}

// 1. CLASS ROUTINE INITIAL DATA
export const INITIAL_CLASS_ROUTINES = [
  { id: 'cr-1', class_name: '৬', section: 'ক', day_of_week: 'শনিবার', period: '১ম পিরিয়ড', start_time: '১০:০০', end_time: '১০:৪৫', subject_code: '101', subject_name: 'বাংলা ১ম পত্র', teacher_name: 'মোঃ আবুল কাশেম', room_no: '১০১' },
  { id: 'cr-2', class_name: '৬', section: 'ক', day_of_week: 'শনিবার', period: '২য় পিরিয়ড', start_time: '১০:৪৫', end_time: '১১:৩০', subject_code: '107', subject_name: 'ইংরেজি ১ম পত্র', teacher_name: 'রতন চন্দ্র রায়', room_no: '১০১' },
  { id: 'cr-3', class_name: '৬', section: 'ক', day_of_week: 'শনিবার', period: '৩য় পিরিয়ড', start_time: '১১:৩০', end_time: '১২:১৫', subject_code: '109', subject_name: 'গণিত', teacher_name: 'মোঃ আশরাফুল আলম', room_no: '১০১' },
  { id: 'cr-4', class_name: '৭', section: 'ক', day_of_week: 'রবিবার', period: '১ম পিরিয়ড', start_time: '১০:০০', end_time: '১০:৪৫', subject_code: '127', subject_name: 'বিজ্ঞান', teacher_name: 'মোঃ জহিরুল ইসলাম', room_no: '১০২' },
  { id: 'cr-5', class_name: '৮', section: 'ক', day_of_week: 'সোমবার', period: '২য় পিরিয়ড', start_time: '১০:৪৫', end_time: '১১:৩০', subject_code: '154', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', teacher_name: 'মোঃ শাহিন মিয়া', room_no: 'ল্যাব-০১' },
  { id: 'cr-6', class_name: '৯', section: 'বিজ্ঞান', day_of_week: 'মঙ্গলবার', period: '১ম পিরিয়ড', start_time: '১০:০০', end_time: '১০:৪৫', subject_code: '136', subject_name: 'পদার্থবিজ্ঞান', teacher_name: 'মোঃ হাফিজুর রহমান', room_no: '২০১' },
  { id: 'cr-7', class_name: '৯', section: 'মানবিক', day_of_week: 'মঙ্গলবার', period: '১ম পিরিয়ড', start_time: '১০:০০', end_time: '১০:৪৫', subject_code: '150', subject_name: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', teacher_name: 'মোছাঃ নাসরিন সুলতানা', room_no: '২০২' },
  { id: 'cr-8', class_name: '১০', section: 'বিজ্ঞান', day_of_week: 'বুধবার', period: '১ম পিরিয়ড', start_time: '১০:০০', end_time: '১০:৪৫', subject_code: '138', subject_name: 'জীববিজ্ঞান', teacher_name: 'মোঃ আনিসুর রহমান', room_no: '২০৩' },
  { id: 'cr-9', class_name: '১০', section: 'ব্যবসায় শিক্ষা', day_of_week: 'বুধবার', period: '১ম পিরিয়ড', start_time: '১০:০০', end_time: '১০:৪৫', subject_code: '146', subject_name: 'হিসাববিজ্ঞান', teacher_name: 'মোঃ সেলিম রেজা', room_no: '২০৪' },
  { id: 'cr-10', class_name: '১০', section: 'বিজ্ঞান', day_of_week: 'বৃহস্পতিবার', period: '৪র্থ পিরিয়ড', start_time: '১২:১৫', end_time: '০১:০০', subject_code: '126', subject_name: 'উচ্চতর গণিত', teacher_name: 'মোঃ আশরাফুল আলম', room_no: '২০১' }
];

// 2. EXAM ROUTINE INITIAL DATA
export const INITIAL_EXAM_ROUTINES = [
  { id: 'er-1', exam_name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬', class_name: '৬', exam_date: '২০২৬-০৬-১৫', day_name: 'সোমবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '101', subject_name: 'বাংলা ১ম পত্র', room_nos: '১০১, ১০২' },
  { id: 'er-2', exam_name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬', class_name: '৬', exam_date: '২০২৬-০৬-১৭', day_name: 'বুধবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '107', subject_name: 'ইংরেজি ১ম পত্র', room_nos: '১০১, ১০২' },
  { id: 'er-3', exam_name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬', class_name: '৭', exam_date: '২০২৬-০৬-১৫', day_name: 'সোমবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '101', subject_name: 'বাংলা ১ম পত্র', room_nos: '১০৩, ১০৪' },
  { id: 'er-4', exam_name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬', class_name: '৮', exam_date: '২০২৬-০৬-১৬', day_name: 'মঙ্গলবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '109', subject_name: 'গণিত', room_nos: '১০৫, ১০৬' },
  { id: 'er-5', exam_name: 'বার্ষিক পরীক্ষা ২০২৬', class_name: '৬', exam_date: '২০২৬-১১-২০', day_name: 'শুক্রবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '109', subject_name: 'গণিত', room_nos: '১০১, ১০২' },
  { id: 'er-6', exam_name: 'বার্ষিক পরীক্ষা ২০২৬', class_name: '৯', exam_date: '২০২৬-১১-২২', day_name: 'রবিবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '136', subject_name: 'পদার্থবিজ্ঞান / ইতিহাস', room_nos: '২০১, ২০২' },
  { id: 'er-7', exam_name: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', class_name: '১০', exam_date: '২০২৬-০৮-১০', day_name: 'সোমবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '101', subject_name: 'বাংলা ১ম পত্র', room_nos: '২০১, ২০২' },
  { id: 'er-8', exam_name: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', class_name: '১০', exam_date: '২০২৬-০৮-১২', day_name: 'বুধবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '107', subject_name: 'ইংরেজি ১ম পত্র', room_nos: '২০১, ২০২' },
  { id: 'er-9', exam_name: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', class_name: '১০', exam_date: '২০২৬-০৮-১৫', day_name: 'শনিবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '109', subject_name: 'সাধারণ গণিত', room_nos: '২০১, ২০২' },
  { id: 'er-10', exam_name: 'নির্বাচনী পরীক্ষা ২০২৬', class_name: '১০', exam_date: '২০২৬-১০-১৫', day_name: 'বৃহস্পতিবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '101', subject_name: 'বাংলা ১ম পত্র (SSC Model)', room_nos: 'কেন্দ্রীয় হল' },
  { id: 'er-11', exam_name: 'নির্বাচনী পরীক্ষা ২০২৬', class_name: '১০', exam_date: '২০২৬-১০-১৮', day_name: 'রবিবার', time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০', subject_code: '109', subject_name: 'সাধারণ গণিত (SSC Model)', room_nos: 'কেন্দ্রীয় হল' }
];

// 3. SYLLABUS INITIAL DATA
export const INITIAL_SYLLABUSES = [
  { id: 'syl-1', class_name: '৬', subject_name: 'বাংলা', exam_type: 'অর্ধ-বার্ষিক', total_chapters: '৭টি গল্প ও ৫টি কবিতা', chapters_detail: 'গল্প: সততার পুরস্কার, মিনু, নীলনদ আর পিরামিডের দেশ। কবিতা: জন্মভূমি, সুখ, মানুষ জাতি। ব্যাকরণ: ভাষা ও বাংলা ভাষা, বিরাম চিহ্ন।', pdf_url: '#' },
  { id: 'syl-2', class_name: '৬', subject_name: 'ইংরেজি', exam_type: 'অর্ধ-বার্ষিক', total_chapters: 'Units 1-6', chapters_detail: 'Going to a new school, Congratulations! Well done, Railway Station. Grammar: Articles, Prepositions, Tense.', pdf_url: '#' },
  { id: 'syl-3', class_name: '৭', subject_name: 'গণিত', exam_type: 'অর্ধ-বার্ষিক', total_chapters: 'অধ্যায় ১, ২, ৫ ও ৯', chapters_detail: 'পাটিগণিত: ১.১ মূলদ ও অমূলদ সংখ্যা, অনুপাত ও শতকরা। বীজগণিত: বীজগণিতীয় সূত্রাবলী ও প্রয়োগ। জ্যামিতি: ত্রিভুজ সংক্রান্ত উপপাদ্য।', pdf_url: '#' },
  { id: 'syl-4', class_name: '৮', subject_name: 'বিজ্ঞান', exam_type: 'অর্ধ-বার্ষিক', total_chapters: 'অধ্যায় ১-৬', chapters_detail: 'প্রাণিজগতের শ্রেণিবিন্যাস, জীবের বৃদ্ধি ও বংশগতি, ব্যাপন-অভিস্রবণ, পরমাণুর গঠন ও রাসায়নিক বিক্রিয়া।', pdf_url: '#' },
  { id: 'syl-5', class_name: '৯', subject_name: 'পদার্থবিজ্ঞান', exam_type: 'বার্ষিক', total_chapters: 'অধ্যায় ১ থেকে ৭', chapters_detail: 'ভৌত রাশি ও পরিমাপ, গতি, বল, কাজ ক্ষমতা ও শক্তি, পদার্থের অবস্থা ও চাপ, আলোর প্রতিফলন ও শব্দ।', pdf_url: '#' },
  { id: 'syl-6', class_name: '১০', subject_name: 'বাংলা ১ম পত্র', exam_type: 'নির্বাচনী (SSC)', total_chapters: 'পূর্ণাঙ্গ বোর্ড সিলেবাস', chapters_detail: 'গদ্য: শোভা, বইপড়া, অভাগীর স্বর্গ, মানুষ মুহাম্মদ (স), শিক্ষা ও মনুষ্যত্ব। পদ্য: কপোতাক্ষ নদ, জীবন-সঙ্গীত, মানুষ, সাহসী জননী বাংলা।', pdf_url: '#' },
  { id: 'syl-7', class_name: '১০', subject_name: 'গণিত', exam_type: 'নির্বাচনী (SSC)', total_chapters: 'পূর্ণাঙ্গ বোর্ড সিলেবাস', chapters_detail: 'সেট ও ফাংশন, বীজগণিতীয় রাশি, সূচক ও লগারিদম, ব্যবহারিক জ্যামিতি, বৃত্ত, ত্রিকোণমিতিক অনুপাত, পরিমিতি ও পরিসংখ্যান।', pdf_url: '#' }
];

// 4. DIGITAL LEARNING INITIAL DATA
export const INITIAL_DIGITAL_LEARNING = [
  { id: 'dl-1', class_name: '১০', subject_name: 'সাধারণ গণিত', chapter_no: 'অধ্যায় ৯', title_bn: 'ত্রিকোণমিতিক অনুপাত ও সূত্রের জাদুকরী কৌশল', content_type: 'ভিডিও ক্লাস', duration: '৩৫ মিনিট', instructor_name: 'মোঃ আশরাফুল আলম (সহকারী শিক্ষক)', video_url: 'https://www.youtube.com', description: 'ত্রিকোণমিতির মৌলিক সূত্র সহজে মনে রাখার শর্টকাট পদ্ধতি এবং বোর্ড পরীক্ষার সৃজনশীল সমাধান।' },
  { id: 'dl-2', class_name: '১০', subject_name: 'পদার্থবিজ্ঞান', chapter_no: 'অধ্যায় ২', title_bn: 'গতির সমীকরণ প্রতিপাদন ও বাস্তব গ্রাফিক্যাল বিশ্লেষণ', content_type: 'মাল্টিমিডিয়া ক্লাস', duration: '৪২ মিনিট', instructor_name: 'মোঃ হাফিজুর রহমান (সহকারী শিক্ষক)', video_url: 'https://www.youtube.com', description: 'ভিডিও অ্যানিমেশনের মাধ্যমে সরণ-সময় গ্রাফ ও বেগ-সময় গ্রাফের নিখুঁত ব্যাখ্যা।' },
  { id: 'dl-3', class_name: '৮', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', chapter_no: 'অধ্যায় ৩', title_bn: 'কম্পিউটার ভাইরাস ও সাইবার নিরাপত্তা সুরক্ষা', content_type: 'স্মার্ট প্রেজেন্টেশন', duration: '২৮ মিনিট', instructor_name: 'মোঃ শাহিন মিয়া (আইসিটি শিক্ষক)', video_url: 'https://www.youtube.com', description: 'ম্যালওয়্যার আক্রমণ প্রতিরোধ ও পাসওয়ার্ড নিরাপত্তার বাস্তব ডেমোনস্ট্রেশন।' },
  { id: 'dl-4', class_name: '৬', subject_name: 'বিজ্ঞান', chapter_no: 'অধ্যায় ৪', title_bn: 'উদ্ভিদের বিভিন্ন অংশ ও সালোকসংশ্লেষণ প্রক্রিয়া', content_type: 'অ্যানিমেশন ক্লাস', duration: '৩০ মিনিট', instructor_name: 'মোঃ জহিরুল ইসলাম (সহকারী শিক্ষক)', video_url: 'https://www.youtube.com', description: 'পাতার অভ্যন্তরীণ গঠন ও আলোর উপস্থিতিতে ক্লোরোফিলের খাদ্য তৈরি ভিডিও চিত্র।' }
];

// 5. NOTES & LECTURES INITIAL DATA
export const INITIAL_NOTES = [
  { id: 'nt-1', class_name: '১০', subject_name: 'পদার্থবিজ্ঞান', chapter: 'অধ্যায় ৪ (কাজ, ক্ষমতা ও শক্তি)', title_bn: 'কর্মদক্ষতা ও শক্তির রূপান্তরের বিশেষ হ্যান্ডনোট ও গাণিতিক সূত্রাবলী', author_teacher: 'মোঃ হাফিজুর রহমান', date_published: '২০২৬-০৩-১০', summary: 'সকল গাণিতিক সমীকরণ, মাত্রাসমীকরণ ও বোর্ড পরীক্ষার বিগত ৫ বছরের সমাধান সংবলিত লেকচার শিট।', download_count: 342, doc_type: 'PDF লেকচার শিট' },
  { id: 'nt-2', class_name: '১০', subject_name: 'বাংলা ২য় পত্র', chapter: 'সমাস ও কারক', title_bn: 'কারক ও সমাস চেনার শর্টকাট টেকনিক ও বোর্ড প্রশ্ন সমাধান', author_teacher: 'মোঃ আবুল কাশেম', date_published: '২০২৬-০৩-০৮', summary: 'দ্বন্দ্ব, দ্বিগু, কর্মধারয়, তৎপুরুষ, বহুব্রীহি ও অব্যয়ীভাব সমাস ৫ সেকেন্ডে চেনার অনন্য কৌশল।', download_count: 512, doc_type: 'হ্যান্ডনোট' },
  { id: 'nt-3', class_name: '৯', subject_name: 'রসায়ন', chapter: 'অধ্যায় ৩ (পদার্থের গঠন)', title_bn: 'বোর পরমাণু মডেল ও বোর-রাদারফোর্ড মডেলের তুলনামূলক সারসংক্ষেপ', author_teacher: 'মোঃ জহিরুল ইসলাম', date_published: '২০২৬-০৩-০৪', summary: 'ইলেকট্রন বিন্যাসের নীতি ও ব্যতিক্রম মৌলসমূহের সম্পূর্ণ চিত্রভিত্তিক বিবরণ।', download_count: 289, doc_type: 'লেকচার নোট' },
  { id: 'nt-4', class_name: '৮', subject_name: 'গণিত', chapter: 'অধ্যায় ২ (মুনাফা)', title_bn: 'সরল মুনাফা ও চক্রবৃদ্ধি মুনাফার চূড়ান্ত ফর্মুলা ব্যাংক', author_teacher: 'মোঃ আশরাফুল আলম', date_published: '২০২৬-০২-২৮', summary: 'পরীক্ষায় আসা সকল টাইপের অংকের ধাপে ধাপে সমাধান কৌশল।', download_count: 420, doc_type: 'গাণিতিক শিট' }
];

// 6. QUESTION BANK & MODEL PAPERS INITIAL DATA
export const INITIAL_QUESTIONS = [
  { id: 'qb-1', class_name: '১০', subject_name: 'সাধারণ গণিত', chapter: 'অধ্যায় ৩', question_type: 'সৃজনশীল (CQ)', stem: 'x + 1/x = 5 এবং p^2 - 2√6 p + 1 = 0 দুটি বীজগাণিতিক রাশি।', question_text: 'ক. x^2 + 1/x^2 এর মান নির্ণয় কর। খ. প্রমাণ কর যে, x^3 + 1/x^3 = 110। গ. p^5 + 1/p^5 এর মান বের কর।', difficulty: 'বোর্ড স্ট্যান্ডার্ড', year_tag: 'ঢাকা বোর্ড মডেল ২০২৬' },
  { id: 'qb-2', class_name: '১০', subject_name: 'আইসিটি', chapter: 'অধ্যায় ২', question_type: 'বহুনির্বাচনী (MCQ)', stem: '', question_text: 'নিচের কোনটি ওপেন সোর্স অপারেটিং সিস্টেম?', options: ['উইন্ডোজ', 'ম্যাক ওএস', 'লিনাক্স', 'ডস'], answer: 'লিনাক্স', difficulty: 'সহজ', year_tag: 'এসএসসি প্রস্তুতি ২০২৬' },
  { id: 'qb-3', class_name: '৯', subject_name: 'পদার্থবিজ্ঞান', chapter: 'অধ্যায় ২', question_type: 'সৃজনশীল (CQ)', stem: 'একটি গাড়ি স্থির অবস্থান থেকে 2 ms^-2 সুষম ত্বরণে চলা শুরু করে 10 সেকেন্ড পর সমবেগে চলতে থাকে।', question_text: 'ক. ত্বরণ কাকে বলে? খ. পড়ন্ত বস্তুর ২য় সূত্রটি ব্যাখ্যা কর। গ. গাড়িটির সর্বোচ্চ বেগ কত? ঘ. মোট অতিক্রান্ত দূরত্বের গ্রাফ অঙ্কন কর।', difficulty: 'মাঝারি', year_tag: 'বার্ষিক পরীক্ষা প্রস্তুতি' },
  { id: 'qb-4', class_name: '৮', subject_name: 'ইংরেজি', chapter: 'Grammar', question_type: 'মডেল প্রশ্ন', stem: 'Fill in the blanks with appropriate prepositions:', question_text: 'He is proficient ___ English. We should abide ___ the rules. Smoking is detrimental ___ health.', options: ['in, by, to', 'on, with, for', 'at, of, in', 'from, to, at'], answer: 'in, by, to', difficulty: 'মাঝারি', year_tag: 'মডেল টেস্ট ২০২৬' }
];

// 7. ASSIGNMENTS & MOCK TESTS INITIAL DATA
export const INITIAL_ASSIGNMENTS = [
  { id: 'as-1', class_name: '১০', subject_name: 'পদার্থবিজ্ঞান', title_bn: 'শক্তি সংরক্ষণশীলতা নীতির ব্যবহারিক প্রয়োগ প্রতিবেদন', week_no: '৪র্থ সপ্তাহ', assignment_no: 'অ্যাসাইনমেন্ট-০১', submission_deadline: '২০২৬-০৩-২৫', total_marks: 20, evaluation_criteria: 'তাত্ত্বিক ব্যাখ্যা (৫), পরীক্ষণ নকশা (৫), তথ্য বিশ্লেষণ (৫), উপস্থাপন ও পরিচ্ছন্নতা (৫)।', instructions: 'বাস্তব জীবনের যে কোনো একটি যন্ত্রের শক্তি রূপান্তর ও দক্ষতা নির্ণয় করে ২ পৃষ্ঠার অ্যাসাইনমেন্ট জমা দিতে হবে।' },
  { id: 'as-2', class_name: '৯', subject_name: 'বাংলা ১ম পত্র', title_bn: 'শিক্ষা ও মনুষ্যত্ব প্রবন্ধের আলোকে মুক্তচিন্তার গুরুত্ব নিরূপণ', week_no: '৩য় সপ্তাহ', assignment_no: 'অ্যাসাইনমেন্ট-০১', submission_deadline: '২০২৬-০৩-২০', total_marks: 15, evaluation_criteria: 'মূলভাব অনুধাবন (৫), নিজস্ব মতামত (৫), ভাষা ও বানান শুদ্ধতা (৫)।', instructions: 'মোতাহের হোসেন চৌধুরীর চিন্তাধারার প্রেক্ষিতে বর্তমান সামাজিক প্রেক্ষাপট বিশ্লেষণ করুন।' },
  { id: 'as-3', class_name: '৮', subject_name: 'বিজ্ঞান', title_bn: 'আমাদের দৈনন্দিন জীবনে ব্যাপন ও অভিস্রবণের গুরুত্ব মডেল তৈরি', week_no: '২য় সপ্তাহ', assignment_no: 'অ্যাসাইনমেন্ট-০২', submission_deadline: '২০২৬-০৩-১৫', total_marks: 20, evaluation_criteria: 'মডেল প্রস্তুত (১০), ব্যাখ্যা ও উপস্থাপন (১০)।', instructions: 'কিশমিশের পানির পরীক্ষা অথবা আলুর তৈরি অসমোমিটারের পর্যবেক্ষণ নোট জমা দিন।' }
];

// 8. ONLINE EXAMS INITIAL DATA
export const INITIAL_ONLINE_EXAMS = [
  { id: 'oe-1', title_bn: '১০ম শ্রেণি - পদার্থবিজ্ঞান গতির সমীকরণ স্পিড টেস্ট কুইজ', class_name: '১০', subject_name: 'পদার্থবিজ্ঞান', duration_minutes: 20, total_marks: 25, pass_marks: 12, status: 'সক্রিয়', questions_count: 25, attempts_count: 48 },
  { id: 'oe-2', title_bn: '১০ম শ্রেণি - তথ্য ও যোগাযোগ প্রযুক্তি ডিজিটাল লিটারেসি মক টেস্ট', class_name: '১০', subject_name: 'আইসিটি', duration_minutes: 15, total_marks: 20, pass_marks: 10, status: 'সক্রিয়', questions_count: 20, attempts_count: 65 },
  { id: 'oe-3', title_bn: '৯ম শ্রেণি - সাধারণ গণিত বীজগণিতীয় সূত্রাবলি লাইভ পরীক্ষা', class_name: '৯', subject_name: 'গণিত', duration_minutes: 30, total_marks: 30, pass_marks: 15, status: 'আসন্ন', questions_count: 30, attempts_count: 0 },
  { id: 'oe-4', title_bn: '৮ম শ্রেণি - বিজ্ঞান পরমাণুর গঠন মডেল কুইজ', class_name: '৮', subject_name: 'বিজ্ঞান', duration_minutes: 15, total_marks: 15, pass_marks: 7, status: 'সম্পন্ন', questions_count: 15, attempts_count: 72 }
];

// 9. AI ASSISTANT TEMPLATES & SMART PRESETS FOR TEACHERS
export const AI_PRESETS = {
  lesson_plans: [
    {
      title: '১০ম শ্রেণি - পদার্থবিজ্ঞান (গতির সমীকরণ)',
      class_name: '১০',
      subject: 'পদার্থবিজ্ঞান',
      chapter: 'অধ্যায় ২: গতি',
      period: '৪৫ মিনিট',
      plan: `১. পাঠ শিরোনাম: গতির সমীকরণ ও তাৎক্ষণিক বেগ নির্ণয়।
২. শিখনফল:
   - শিক্ষার্থীরা গতির চারটি মৌলিক সমীকরণ লিখতে ও ব্যাখ্যা করতে পারবে।
   - সুষম ত্বরণে চলমান বস্তুর নির্দিষ্ট সময়ে অতিক্রান্ত দূরত্ব গাণিতিকভাবে গণনা করতে পারবে।
৩. প্রয়োজনীয় উপকরণ: হোয়াইটবোর্ড, মার্কার, মাল্টিমিডিয়া প্রজেক্টর, একটি ছোট বল ও স্টপওয়াচ।
৪. পাঠ সূচনা (Warm-up - ৫ মিনিট):
   - রাস্তায় চলমান রিকশা ও গাড়ির বেগ বৃদ্ধি নিয়ে পূর্বজ্ঞান যাচাইমূলক প্রশ্ন।
৫. পাঠ উপস্থাপন (I Do - ১৫ মিনিট):
   - ত্বরণ a = (v-u)/t থেকে v = u + at সমীকরণের গাণিতিক প্রতিপাদন।
   - গড় বেগের ধারণা দিয়ে s = ((u+v)/2)t এবং s = ut + 1/2 at^2 সমীকরণের বাস্তব প্রমাণ।
৬. দলগত অনুশীলন (We Do - ১২ মিনিট):
   - শিক্ষার্থীদের ৩টি দলে ভাগ করে গাড়ি ও ট্রেনের গতি সংক্রান্ত বাস্তব ২টি গাণিতিক সমস্যার সমাধান করতে দেওয়া।
৭. মূল্যায়ন (You Do - ৮ মিনিট):
   - ৩টি কুইজ প্রশ্ন ও ১টি দ্রুত গাণিতিক হিসাব মুখে মুখে যাচাই।
৮. বাড়ির কাজ (Homework - ৩ মিনিট):
   - পাঠ্যবইয়ের পৃষ্ঠা নং ৪২-এর গাণিতিক সমস্যা নং ৩ ও ৫ সমাধান করে আনা।
৯. শিক্ষকের পর্যবেক্ষণ ও সেলফ রিফ্লেকশন নোট:
   - দুর্বল শিক্ষার্থীদের জন্য ত্বরণের সংজ্ঞায় অতিরিক্ত ভিজ্যুয়াল চার্ট প্রদর্শন করা যেতে পারে।`
    },
    {
      title: '৯ম শ্রেণি - গণিত (বীজগণিতীয় রাশি ও সূত্রাবলি)',
      class_name: '৯',
      subject: 'গণিত',
      chapter: 'অধ্যায় ৩: বীজগণিতীয় রাশি',
      period: '৪৫ মিনিট',
      plan: `১. পাঠ শিরোনাম: বর্গের সম্প্রসারণ ও মান নির্ণয় সূত্রাবলী।
২. শিখনফল:
   - (a+b)^2 ও (a-b)^2 এর জ্যামিতিক তাৎপর্য অনুধাবন করতে পারবে।
   - a^2 + b^2 এবং 4ab এর অনুসিদ্ধান্ত প্রয়োগ করে জটিল বীজগণিতীয় রাশির মান নির্ণয় করতে পারবে।
৩. পাঠ পরিচালনা ধাপসমূহ:
   - সূচনা (৫ মিনিট): ক্ষেত্রফল বের করার মাধ্যমে বর্গের ভিজ্যুয়াল ধারণা।
   - উপস্থাপন (১৫ মিনিট): সূত্রের প্রমাণ ও অনুসিদ্ধান্তের উৎপত্তি দেখানো।
   - দলগত কাজ (১৫ মিনিট): গ্রুপভিত্তিক চ্যালেঞ্জ সমস্যা সমাধান।
   - মূল্যায়ন ও বাড়ির কাজ (১০ মিনিট): বোর্ড পরীক্ষার ১টি সৃজনশীল অনুশীলন।`
    }
  ],
  digital_content_ideas: [
    {
      topic: 'সালোকসংশ্লেষণ ও উদ্ভিদের খাদ্য তৈরি',
      class_name: '৭/৮',
      subject: 'বিজ্ঞান',
      slides: [
        'স্লাইড ১: আকর্ষণীয় শিরোনাম ও ক্লোরোপ্লাস্টের রঙিন অ্যানিমেশন।',
        'স্লাইড ২: পাতা কেন উদ্ভিদের রান্নাঘর? ক্লোরোফিলের রহস্য।',
        'স্লাইড ৩: সালোকসংশ্লেষণের সমীকরণ: ৬CO2 + ১২H2O + সূর্যালোক → C6H12O6 + ৬H2O + ৬O2।',
        'স্লাইড ৪: আলোক পর্যায় ও অন্ধকার পর্যায়ের সরল তুলনামূলক ডায়াগ্রাম।',
        'স্লাইড ৫: ৩ মিনিটের বাস্তব ল্যাব পরীক্ষার ভিডিও ক্লিপ (হাইড্রিলার অক্সিজেন নির্গমন)।',
        'স্লাইড ৬: ইন্টারেক্টিভ কুইজ (শিক্ষার্থীরা বোর্ডে এসে উত্তর মেলাবে)।'
      ]
    },
    {
      topic: 'কম্পিউটার নেটওয়ার্ক ও টপোলজি',
      class_name: '৮/১০',
      subject: 'আইসিটি',
      slides: [
        'স্লাইড ১: বিশ্বজুড়ে ইন্টারনেটের সংযোগ চিত্র।',
        'স্লাইড ২: বাস, রিং ও স্টার টপোলজির অ্যানিমেটেড কার্যপদ্ধতি।',
        'স্লাইড ৩: বিদ্যালয়ের কম্পিউটার ল্যাবে আমরা কোন টপোলজি ব্যবহার করছি এবং কেন? (কেস স্টাডি)',
        'স্লাইড ৪: রিয়েল লাইফ সিমুলেশন: কোন একটি ক্যাবল ছিঁড়ে গেলে কোন নেটওয়ার্ক বন্ধ হবে?'
      ]
    }
  ],
  classroom_management: [
    {
      scenario: 'ক্লাসে কোলাহল ও অমনোযোগ নিয়ন্ত্রণ',
      strategy: '“৩-সেকেন্ড রুল” ও ক্ল্যাপ রেসপন্স কৌশল। শিক্ষক হাত তুলে বলবেন “Attention”, শিক্ষার্থীরা দুইবার তালি দিয়ে সরাসরি শিক্ষকের দিকে তাকাবে। ব্ল্যাকবোর্ডে মার্কার দিয়ে “Team Points” লিখে দলগত পয়েন্ট কাটার বা দেওয়ার খেলা শুরু করলে পুরো শ্রেণি ১ মিনিটে শান্ত হয়।'
    },
    {
      scenario: 'পেছিয়ে পড়া শিক্ষার্থীর আত্মবিশ্বাস বৃদ্ধি',
      strategy: '“Think-Pair-Share” পদ্ধতি। দুর্বল শিক্ষার্থীকে সরাসরি সবার সামনে না জিজ্ঞেস করে প্রথমে তার পাশের বন্ধুর সাথে আলোচনা করতে দিন। এরপর তাকে উত্তর বলতে উৎসাহিত করুন এবং সঠিক বললে পুরো ক্লাসের হাততালি দিন।'
    },
    {
      scenario: 'দ্রুত কাজ শেষ করা শিক্ষার্থীদের ব্যস্ত রাখা',
      strategy: '“Buddy Mentor Challenge” অথবা “Bonus Brain Teaser”। যে শিক্ষার্থী দ্রুত কাজ শেষ করবে তাকে পাশের বন্ধুকে বোঝানোর দায়িত্ব দিন অথবা বোর্ডের একপাশে রাখা চ্যালেঞ্জ প্রশ্ন সমাধান করতে দিন।'
    }
  ]
};

// GETTERS & SETTERS
export const getStoredClassRoutines = () => getStoredData('class_routines', INITIAL_CLASS_ROUTINES);
export const saveStoredClassRoutines = (data) => setStoredData('class_routines', data);

export const getStoredExamRoutines = () => getStoredData('exam_routines', INITIAL_EXAM_ROUTINES);
export const saveStoredExamRoutines = (data) => setStoredData('exam_routines', data);

export const getStoredSyllabuses = () => getStoredData('syllabuses', INITIAL_SYLLABUSES);
export const saveStoredSyllabuses = (data) => setStoredData('syllabuses', data);

export const getStoredDigitalLearning = () => getStoredData('digital_learning', INITIAL_DIGITAL_LEARNING);
export const saveStoredDigitalLearning = (data) => setStoredData('digital_learning', data);

export const getStoredNotes = () => getStoredData('notes', INITIAL_NOTES);
export const saveStoredNotes = (data) => setStoredData('notes', data);

export const getStoredQuestions = () => getStoredData('questions', INITIAL_QUESTIONS);
export const saveStoredQuestions = (data) => setStoredData('questions', data);

export const getStoredAssignments = () => getStoredData('assignments', INITIAL_ASSIGNMENTS);
export const saveStoredAssignments = (data) => setStoredData('assignments', data);

export const getStoredOnlineExams = () => getStoredData('online_exams', INITIAL_ONLINE_EXAMS);
export const saveStoredOnlineExams = (data) => setStoredData('online_exams', data);

export const AI_TEACHER_ASSISTANT_PRESETS = AI_PRESETS;
