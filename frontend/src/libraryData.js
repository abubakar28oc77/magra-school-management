// libraryData.js - Library & Information Science Module Data & Helpers for Magra Pals Union High School
// EIIN: 114290 | প্রতিষ্ঠিত: ১৯৪৬ খ্রি.

export const LIBRARIAN_TEACHER = {
  name_bn: 'মোঃ শাহিন মিয়া',
  name_en: 'MD. SHAHIN MIAH',
  designation: 'সহকারী শিক্ষক (গ্রন্থাগার ও তথ্য বিজ্ঞান)',
  employee_id: '11',
  phone: '01707518488',
  email: 'shahin.magra@gmail.com',
  room: 'কেন্দ্রীয় লাইব্রেরি ও রিডিং রুম (ভবন-১, দ্বিতীয় তলা)'
};

export const BOOK_CATEGORIES = [
  { key: 'উপন্যাস', label: 'উপন্যাস', icon: '📖' },
  { key: 'গল্প ও ছোটগল্প', label: 'গল্প ও ছোটগল্প', icon: '📚' },
  { key: 'কবিতা ও সাহিত্য', label: 'কবিতা ও সাহিত্য', icon: '🖋️' },
  { key: 'ইতিহাস ও মুক্তিযুদ্ধ', label: 'ইতিহাস ও মুক্তিযুদ্ধ', icon: '🇧🇩' },
  { key: 'বিজ্ঞান ও প্রযুক্তি', label: 'বিজ্ঞান ও প্রযুক্তি', icon: '🔬' },
  { key: 'জীবনী ও স্মৃতিকথা', label: 'জীবনী ও স্মৃতিকথা', icon: '👤' },
  { key: 'ইসলামিক ও ধর্মীয়', label: 'ইসলামিক ও ধর্মীয়', icon: '🕌' },
  { key: 'সাধারণ জ্ঞান ও বিশ্বকোষ', label: 'সাধারণ জ্ঞান ও বিশ্বকোষ', icon: '🌍' },
  { key: 'কিশোর সাহিত্য ও রূপকথা', label: 'কিশোর সাহিত্য ও রূপকথা', icon: '🎒' },
  { key: 'নাটক ও প্রবন্ধ', label: 'নাটক ও প্রবন্ধ', icon: '🎭' },
  { key: 'পাঠ্যপুস্তক ও সহায়ক', label: 'পাঠ্যপুস্তক ও সহায়ক', icon: '📝' },
  { key: 'অন্যান্য', label: 'অন্যান্য', icon: '📦' }
];

export const SHELVES_LIST = [
  'আলমারি-১ (বাংলা সাহিত্য)',
  'আলমারি-২ (উপন্যাস ও গল্প)',
  'আলমারি-৩ (বিজ্ঞান ও প্রযুক্তি)',
  'আলমারি-৪ (ইতিহাস ও মুক্তিযুদ্ধ)',
  'আলমারি-৫ (সাধারণ জ্ঞান ও রেফারেন্স)',
  'আলমারি-৬ (ধর্মীয় ও নৈতিক শিক্ষা)',
  'রেফারেন্স ও শিক্ষক কর্নার',
  'নতুন বই তাক'
];

export const ACQUISITION_SOURCES = [
  'সরকারি অনুদান ও প্রকল্প',
  'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
  'ব্যক্তিগত অনুদান / শুভানুধ্যায়ী',
  'বঙ্গবন্ধু ও মুক্তিযুদ্ধ কর্নার তহবিল',
  'বিশ্বসাহিত্য কেন্দ্র বইপড়া কর্মসূচি'
];

export const SEED_BOOKS = [
  {
    id: 'bk-01',
    accession_no: 'MAG-BK-001',
    title: 'গীতাঞ্জলি',
    author: 'রবীন্দ্রনাথ ঠাকুর',
    category: 'কবিতা ও সাহিত্য',
    publisher: 'বিশ্বভারতী গ্রন্থনবিভাগ',
    shelf: 'আলমারি-১ (বাংলা সাহিত্য)',
    quantity: 5,
    available_quantity: 4,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 180,
    remarks: 'নোবেল বিজয়ী কাব্যগ্রন্থ'
  },
  {
    id: 'bk-02',
    accession_no: 'MAG-BK-002',
    title: 'সঞ্চিতা',
    author: 'কাজী নজরুল ইসলাম',
    category: 'কবিতা ও সাহিত্য',
    publisher: 'ডি আর এম লাইব্রেরী',
    shelf: 'আলমারি-১ (বাংলা সাহিত্য)',
    quantity: 6,
    available_quantity: 5,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 220,
    remarks: 'জাতীয় কবির শ্রেষ্ঠ কবিতা সংকলন'
  },
  {
    id: 'bk-03',
    accession_no: 'MAG-BK-003',
    title: 'দেবদাস',
    author: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    category: 'উপন্যাস',
    publisher: 'অনন্যা প্রকাশনী',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 4,
    available_quantity: 3,
    source: 'বিশ্বসাহিত্য কেন্দ্র বইপড়া কর্মসূচি',
    price: 160,
    remarks: 'বাংলা চিরায়ত উপন্যাস'
  },
  {
    id: 'bk-04',
    accession_no: 'MAG-BK-004',
    title: 'শ্রীকান্ত (১ম ও ২য় খণ্ড)',
    author: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    category: 'উপন্যাস',
    publisher: 'সাহিত্য প্রকাশ',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 4,
    available_quantity: 4,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 250,
    remarks: 'ভ্রমণকাহিনিভিত্তিক উপন্যাস'
  },
  {
    id: 'bk-05',
    accession_no: 'MAG-BK-005',
    title: 'অসমাপ্ত আত্মজীবনী',
    author: 'শেখ মুজিবুর রহমান',
    category: 'ইতিহাস ও মুক্তিযুদ্ধ',
    publisher: 'দি ইউনিভার্সিটি প্রেস লিমিটেড (UPL)',
    shelf: 'আলমারি-৪ (ইতিহাস ও মুক্তিযুদ্ধ)',
    quantity: 8,
    available_quantity: 6,
    source: 'বঙ্গবন্ধু ও মুক্তিযুদ্ধ কর্নার তহবিল',
    price: 450,
    remarks: 'জাতির পিতার স্মৃতিকথা'
  },
  {
    id: 'bk-06',
    accession_no: 'MAG-BK-006',
    title: 'কারাগারের রোজনামচা',
    author: 'শেখ মুজিবুর রহমান',
    category: 'ইতিহাস ও মুক্তিযুদ্ধ',
    publisher: 'বাংলা একাডেমি',
    shelf: 'আলমারি-৪ (ইতিহাস ও মুক্তিযুদ্ধ)',
    quantity: 6,
    available_quantity: 5,
    source: 'বঙ্গবন্ধু ও মুক্তিযুদ্ধ কর্নার তহবিল',
    price: 400,
    remarks: 'কারাজীবনের দিনলিপি'
  },
  {
    id: 'bk-07',
    accession_no: 'MAG-BK-007',
    title: 'একাত্তরের দিনগুলি',
    author: 'জাহানারা ইমাম',
    category: 'ইতিহাস ও মুক্তিযুদ্ধ',
    publisher: 'সন্ধানী প্রকাশনী',
    shelf: 'আলমারি-৪ (ইতিহাস ও মুক্তিযুদ্ধ)',
    quantity: 6,
    available_quantity: 4,
    source: 'সরকারি অনুদান ও প্রকল্প',
    price: 320,
    remarks: 'মুক্তিযুদ্ধের প্রামাণ্য দলিল'
  },
  {
    id: 'bk-08',
    accession_no: 'MAG-BK-008',
    title: 'দীপু নাম্বার টু',
    author: 'মুহম্মদ জাফর ইকবাল',
    category: 'কিশোর সাহিত্য ও রূপকথা',
    publisher: 'সময় প্রকাশন',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 7,
    available_quantity: 6,
    source: 'বিশ্বসাহিত্য কেন্দ্র বইপড়া কর্মসূচি',
    price: 200,
    remarks: 'জনপ্রিয় কিশোর উপন্যাস'
  },
  {
    id: 'bk-09',
    accession_no: 'MAG-BK-009',
    title: 'আমার বন্ধু রাশেদ',
    author: 'মুহম্মদ জাফর ইকবাল',
    category: 'ইতিহাস ও মুক্তিযুদ্ধ',
    publisher: 'কাকলী প্রকাশনী',
    shelf: 'আলমারি-৪ (ইতিহাস ও মুক্তিযুদ্ধ)',
    quantity: 6,
    available_quantity: 4,
    source: 'বিশ্বসাহিত্য কেন্দ্র বইপড়া কর্মসূচি',
    price: 180,
    remarks: 'কিশোর মুক্তিযুদ্ধের গল্প'
  },
  {
    id: 'bk-10',
    accession_no: 'MAG-BK-010',
    title: 'শঙ্খনীল কারাগার',
    author: 'হুমায়ূন আহমেদ',
    category: 'উপন্যাস',
    publisher: 'অন্যপ্রকাশ',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 5,
    available_quantity: 4,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 220,
    remarks: 'পারিবারিক জীবনের নিখুঁত আলেখ্য'
  },
  {
    id: 'bk-11',
    accession_no: 'MAG-BK-011',
    title: 'জোছনা ও জননীর গল্প',
    author: 'হুমায়ূন আহমেদ',
    category: 'উপন্যাস',
    publisher: 'অন্যপ্রকাশ',
    shelf: 'আলমারি-৪ (ইতিহাস ও মুক্তিযুদ্ধ)',
    quantity: 5,
    available_quantity: 3,
    source: 'সরকারি অনুদান ও প্রকল্প',
    price: 550,
    remarks: 'মুক্তিযুদ্ধভিত্তিক মহাকাব্যিক উপন্যাস'
  },
  {
    id: 'bk-12',
    accession_no: 'MAG-BK-012',
    title: 'পথের পাঁচালী',
    author: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
    category: 'উপন্যাস',
    publisher: 'মিত্র ও ঘোষ',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 5,
    available_quantity: 5,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 300,
    remarks: 'বাংলা সাহিত্যের ক্লাসিক'
  },
  {
    id: 'bk-13',
    accession_no: 'MAG-BK-013',
    title: 'নকশী কাঁথার মাঠ',
    author: 'জসীম উদ্‌দীন',
    category: 'কবিতা ও সাহিত্য',
    publisher: 'পলাশ প্রকাশনী',
    shelf: 'আলমারি-১ (বাংলা সাহিত্য)',
    quantity: 5,
    available_quantity: 5,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 150,
    remarks: 'পল্লীকবির অমর আখ্যানকাব্য'
  },
  {
    id: 'bk-14',
    accession_no: 'MAG-BK-014',
    title: 'ফেলুদা সমগ্র (১ম খণ্ড)',
    author: 'সত্যজিৎ রায়',
    category: 'কিশোর সাহিত্য ও রূপকথা',
    publisher: 'আনন্দ পাবলিশার্স',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 4,
    available_quantity: 3,
    source: 'ব্যক্তিগত অনুদান / শুভানুধ্যায়ী',
    price: 450,
    remarks: 'গোয়েন্দা কাহিনি'
  },
  {
    id: 'bk-15',
    accession_no: 'MAG-BK-015',
    title: 'সুলতানার স্বপ্ন (Sultana\'s Dream)',
    author: 'বেগম রোকেয়া',
    category: 'গল্প ও ছোটগল্প',
    publisher: 'অনন্যা প্রকাশনী',
    shelf: 'আলমারি-১ (বাংলা সাহিত্য)',
    quantity: 4,
    available_quantity: 3,
    source: 'সরকারি অনুদান ও প্রকল্প',
    price: 120,
    remarks: 'নারী জাগরণের অগ্রদূত রচিত কল্পবিজ্ঞান'
  },
  {
    id: 'bk-16',
    accession_no: 'MAG-BK-016',
    title: 'হাজার বছর ধরে',
    author: 'জহির রায়হান',
    category: 'উপন্যাস',
    publisher: 'সন্ধানী প্রকাশনী',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 5,
    available_quantity: 5,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 180,
    remarks: 'বাংলার গ্রামীণ জীবনের উপন্যাস'
  },
  {
    id: 'bk-17',
    accession_no: 'MAG-BK-017',
    title: 'বিজ্ঞানযাত্রী ও মহাবিশ্বের রহস্য',
    author: 'ড. আলী আসগর',
    category: 'বিজ্ঞান ও প্রযুক্তি',
    publisher: 'অনুপম প্রকাশনী',
    shelf: 'আলমারি-৩ (বিজ্ঞান ও প্রযুক্তি)',
    quantity: 4,
    available_quantity: 4,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 240,
    remarks: 'মহাকাশ ও জ্যোতির্বিজ্ঞানের সহজ পাঠ'
  },
  {
    id: 'bk-18',
    accession_no: 'MAG-BK-018',
    title: 'আবোল তাবোল ও পাগলা দাশু',
    author: 'সুকুমার রায়',
    category: 'কিশোর সাহিত্য ও রূপকথা',
    publisher: 'সাহিত্য সংসদ',
    shelf: 'আলমারি-২ (উপন্যাস ও গল্প)',
    quantity: 6,
    available_quantity: 6,
    source: 'বিশ্বসাহিত্য কেন্দ্র বইপড়া কর্মসূচি',
    price: 160,
    remarks: 'হাস্যরসাত্মক ছড়া ও কিশোর গল্প'
  },
  {
    id: 'bk-19',
    accession_no: 'MAG-BK-019',
    title: 'বিশ্বকোষ ও সাধারণ জ্ঞান ২০২৬',
    author: 'অধ্যাপক এম এ কালাম',
    category: 'সাধারণ জ্ঞান ও বিশ্বকোষ',
    publisher: 'প্রফেসর\'স পাবলিকেশন',
    shelf: 'আলমারি-৫ (সাধারণ জ্ঞান ও রেফারেন্স)',
    quantity: 5,
    available_quantity: 5,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: 350,
    remarks: 'বাংলাদেশ ও আন্তর্জাতিক তথ্যকোষ'
  },
  {
    id: 'bk-20',
    accession_no: 'MAG-BK-020',
    title: 'আদর্শ মানব মহানবী (সা.)',
    author: 'মাওলানা মুহাম্মদ আব্দুর রহিম',
    category: 'ইসলামিক ও ধর্মীয়',
    publisher: 'ইসলামিক ফাউন্ডেশন বাংলাদেশ',
    shelf: 'আলমারি-৬ (ধর্মীয় ও নৈতিক শিক্ষা)',
    quantity: 5,
    available_quantity: 4,
    source: 'ব্যক্তিগত অনুদান / শুভানুধ্যায়ী',
    price: 280,
    remarks: 'সিরাত ও নৈতিক চরিত্র গঠন'
  }
];

export const SEED_LOANS = [
  {
    id: 'loan-1',
    book_id: 'bk-01',
    book_title: 'গীতাঞ্জলি',
    author: 'রবীন্দ্রনাথ ঠাকুর',
    accession_no: 'MAG-BK-001',
    student_id: 'stu-07-01',
    student_uid: 'STU-07-01',
    name_bn: 'মাহির ফয়সাল',
    class_name: '7',
    roll_no: 1,
    guardian_phone: '01712000007',
    issued_at: '2026-10-05',
    due_at: '2026-10-12',
    returned_at: null, // Overdue by ~7 days!
    return_condition: null,
    fine: 0,
    status: 'overdue',
    remarks: 'সাপ্তাহিক বইপড়া কর্মসূচি'
  },
  {
    id: 'loan-2',
    book_id: 'bk-05',
    book_title: 'অসমাপ্ত আত্মজীবনী',
    author: 'শেখ মুজিবুর রহমান',
    accession_no: 'MAG-BK-005',
    student_id: 'stu-10-01',
    student_uid: 'STU-10-01',
    name_bn: 'আহনাফ সিদ্দিকী',
    class_name: '10',
    roll_no: 1,
    guardian_phone: '01713000001',
    issued_at: '2026-10-14',
    due_at: '2026-10-21',
    returned_at: null, // Active within due date
    return_condition: null,
    fine: 0,
    status: 'active',
    remarks: 'ইতিহাস প্রজেক্ট'
  },
  {
    id: 'loan-3',
    book_id: 'bk-09',
    book_title: 'আমার বন্ধু রাশেদ',
    author: 'মুহম্মদ জাফর ইকবাল',
    accession_no: 'MAG-BK-009',
    student_id: 'stu-08-01',
    student_uid: 'STU-08-01',
    name_bn: 'সাদিয়া আক্তার',
    class_name: '8',
    roll_no: 1,
    guardian_phone: '01712000008',
    issued_at: '2026-09-20',
    due_at: '2026-09-27',
    returned_at: null, // Overdue by ~22 days! (1 month overdue)
    return_condition: null,
    fine: 0,
    status: 'overdue',
    remarks: 'মুক্তিযুদ্ধ রচনা প্রতিযোগিতা'
  },
  {
    id: 'loan-4',
    book_id: 'bk-07',
    book_title: 'একাত্তরের দিনগুলি',
    author: 'জাহানারা ইমাম',
    accession_no: 'MAG-BK-007',
    student_id: 'stu-09-01',
    student_uid: 'STU-09-01',
    name_bn: 'তানভীর হাসান',
    class_name: '9',
    roll_no: 1,
    guardian_phone: '01714000009',
    issued_at: '2026-10-16',
    due_at: '2026-10-23',
    returned_at: null, // Active
    return_condition: null,
    fine: 0,
    status: 'active',
    remarks: 'নিয়মিত ইস্যু'
  },
  {
    id: 'loan-5',
    book_id: 'bk-08',
    book_title: 'দীপু নাম্বার টু',
    author: 'মুহম্মদ জাফর ইকবাল',
    accession_no: 'MAG-BK-008',
    student_id: 'stu-07-02',
    student_uid: 'STU-07-02',
    name_bn: 'নুসরাত জাহান',
    class_name: '7',
    roll_no: 2,
    guardian_phone: '01712000072',
    issued_at: '2026-09-25',
    due_at: '2026-10-02',
    returned_at: '2026-10-01', // Successfully returned
    return_condition: 'ভালো',
    fine: 0,
    status: 'returned',
    remarks: 'সময়ের পূর্বে জমা দিয়েছে'
  },
  {
    id: 'loan-6',
    book_id: 'bk-11',
    book_title: 'জোছনা ও জননীর গল্প',
    author: 'হুমায়ূন আহমেদ',
    accession_no: 'MAG-BK-011',
    student_id: 'stu-10-02',
    student_uid: 'STU-10-02',
    name_bn: 'সাকিব আল হাসান',
    class_name: '10',
    roll_no: 2,
    guardian_phone: '01715000010',
    issued_at: '2026-10-01',
    due_at: '2026-10-08',
    returned_at: null, // Overdue by ~11 days!
    return_condition: null,
    fine: 0,
    status: 'overdue',
    remarks: 'লাইব্রেরি কার্ডে ইস্যু'
  }
];

export const SEED_DAMAGED = [
  {
    id: 'dmg-1',
    book_id: 'bk-05',
    accession_no: 'MAG-BK-005',
    title: 'অসমাপ্ত আত্মজীবনী',
    author: 'শেখ মুজিবুর রহমান',
    quantity: 1,
    damaged_at: '2026-08-15',
    reason: 'বৃষ্টির পানিতে পৃষ্ঠা ভিজে অপাঠ্য হয়েছে',
    decision: 'স্টক রেজিস্টার থেকে বাতিল ও অডিটভুক্ত',
    authorized_by: 'মোঃ শাহিন মিয়া (গ্রন্থাগারিক)',
    head_approval: 'অনুমোদিত'
  },
  {
    id: 'dmg-2',
    book_id: 'bk-11',
    accession_no: 'MAG-BK-011',
    title: 'জোছনা ও জননীর গল্প',
    author: 'হুমায়ূন আহমেদ',
    quantity: 1,
    damaged_at: '2026-09-10',
    reason: 'বাঁধাই ছিঁড়ে মাঝখানের ২০টি পাতা নিখোঁজ',
    decision: 'ব্যবহার অনুপযোগী হিসেবে বাদ দেওয়া হয়েছে',
    authorized_by: 'মোঃ শাহিন মিয়া (গ্রন্থাগারিক)',
    head_approval: 'অনুমোদিত'
  }
];

// Helper: Bengali Digits conversion
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBn = (num) => {
  if (num === null || num === undefined || num === '') return '০';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d] || d);
};

// Helper: Format Date in Bengali
export const formatDateBn = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const clean = String(dateStr).slice(0, 10);
    const [y, m, d] = clean.split('-');
    if (!y || !m || !d) return dateStr;
    const months = ['', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return `${toBn(parseInt(d, 10))} ${months[parseInt(m, 10)] || ''} ${toBn(y)}`;
  } catch {
    return dateStr;
  }
};

// Helper: Overdue calculation
export const getOverdueDays = (dueAtStr) => {
  if (!dueAtStr) return 0;
  const due = new Date(dueAtStr.slice(0, 10) + 'T23:59:59');
  const today = new Date();
  if (today <= due) return 0;
  const diffMs = today.getTime() - due.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
