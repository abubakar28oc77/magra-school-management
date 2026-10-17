import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_SCHOOL, MOCK_STUDENTS, getStudentPhoto } from './mockData';
import schoolLogo from '../public/school-logo.png';

// Bengali Digits & Helpers
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBnDigits = (num) => {
  if (num === null || num === undefined || num === '') return '০';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export const formatMoney = (amount) => {
  const val = Number(amount) || 0;
  return `৳ ${toBnDigits(val.toLocaleString('en-US'))}`;
};


export const parseRollNumber = (val) => {
  if (val === null || val === undefined) return null;
  const bnDigits = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
  const str = String(val).trim();
  const converted = str.split('').map(ch => bnDigits[ch] !== undefined ? bnDigits[ch] : ch).join('');
  const m = converted.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
};

export const normalizeClass = (val) => {
  if (val === null || val === undefined) return '';
  const bnDigits = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
  const str = String(val).trim();
  const converted = str.split('').map(ch => bnDigits[ch] !== undefined ? bnDigits[ch] : ch).join('');
  const m = converted.match(/\d+/);
  return m ? String(parseInt(m[0], 10)) : str;
};

export const getStudentDepartment = (s) => {
  if (!s) return 'সাধারণ';
  const txt = [
    s.department,
    s.group_name,
    s.group,
    s.section,
    s.student_id
  ].filter(Boolean).map(x => String(x).toLowerCase()).join(' ');

  if (txt.includes('বিজ্ঞান') || txt.includes('science') || txt.includes('sci')) return 'বিজ্ঞান';
  if (txt.includes('মানবিক') || txt.includes('humanities') || txt.includes('hum') || txt.includes('arts')) return 'মানবিক';
  if (txt.includes('ব্যবসা') || txt.includes('ব্যবসায়') || txt.includes('ব্যবসায়') || txt.includes('বাণিজ্য') || txt.includes('business') || txt.includes('commerce') || txt.includes('bs')) return 'ব্যবসায় শিক্ষা';
  return 'সাধারণ';
};

export const formatDateBn = (dateStr) => {
  if (!dateStr) return '—';
  const clean = String(dateStr).slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return toBnDigits(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return toBnDigits(clean);
};

// Bengali In-Words Converter
export function numberToWordsBn(num) {
  if (!num || isNaN(num) || num <= 0) return 'শূন্য টাকা মাত্র';
  const ones = [
    '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
    'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
    'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
    'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
    'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
    'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
    'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
    'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আট his', 'ঊননব্বই', 'নব্বই',
    'একানব্বই', 'বানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
  ];

  const n = Math.floor(Number(num) || 0);
  function convert(val) {
    let str = '';
    if (val >= 10000000) {
      str += convert(Math.floor(val / 10000000)) + ' কোটি ';
      val %= 10000000;
    }
    if (val >= 100000) {
      str += (ones[Math.floor(val / 100000)] || '') + ' লক্ষ ';
      val %= 100000;
    }
    if (val >= 1000) {
      str += (ones[Math.floor(val / 1000)] || '') + ' হাজার ';
      val %= 1000;
    }
    if (val >= 100) {
      str += (ones[Math.floor(val / 100)] || '') + ' শত ';
      val %= 100;
    }
    if (val > 0) {
      str += (ones[val] || '') + ' ';
    }
    return str.trim();
  }
  return convert(n) + ' টাকা মাত্র';
}

// 12 Months Definition
export const MONTHS_LIST = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Non-Government Secondary School Standard Income Categories
export const INSTITUTIONAL_INCOME_HEADS = [
  'সরকারি অনুদান ও উন্নয়ন থোক বরাদ্দ',
  'ম্যানেজিং কমিটি ও দাতা সদস্যের অনুদান',
  'মার্কেট ও দোকান ভাড়া বাবদ আয়',
  'জমি ও পুকুর ইজারা বাবদ আয়',
  'ভর্তি ফরম ও প্রসপেক্টাস বিক্রয়',
  'ব্যাংক আমানতের মুনাফা / সুদ',
  'পুরাতন পরীক্ষার খাতা, আসবাবপত্র ও গাছ বিক্রয়',
  'সহশিক্ষা, সাংস্কৃতিক ও ক্রীড়া চাঁদা',
  'বিজ্ঞান ল্যাব ও কম্পিউটার ব্যবহার ফি',
  'অন্যান্য বিবিধ প্রাতিষ্ঠানিক আয়'
];

// Non-Government Secondary School Standard Expense Categories
export const INSTITUTIONAL_EXPENSE_HEADS = [
  'শিক্ষক-কর্মচারী বেতন-ভাতা (নন-এমপিও অংশ)',
  'উৎসব বোনাস ও বৈশাখী ভাতা (প্রাতিষ্ঠানিক অংশ)',
  'দৈনিক মজুরি ও পরিচ্ছন্নতাকর্মীর মজুরি',
  'পরীক্ষা পরিচালনা, খাতা-কলম ও প্রশ্নপত্র মুদ্রণ খরচ',
  'বিদ্যুৎ বিল, গ্যাস ও পানির ইউটিলিটি বিল',
  'ইন্টারনেট, সফটওয়্যার ও ডিজিটাল ক্লাসরুম মেইনটেন্যান্স',
  'দাপ্তরিক স্টেশনারি ও রেজিস্টার খাতা ক্রয়',
  'ভবন মেরামত, সংস্কার ও চুনকাম',
  'জাতীয় দিবস উদযাপন ও বার্ষিক মিলাদ মাহফিল ব্যয়',
  'খেলাধুলা, স্কাউট ও বিজ্ঞান মেলা ব্যয়',
  'আপ্যায়ন ও ম্যানেজিং কমিটির সভা ব্যয়',
  'বোর্ড ও সরকারি পরিদর্শন/নবায়ন ফি',
  'ব্যাংক চার্জ ও সরকারি ভ্যাট/ট্যাক্স',
  'দরিদ্র শিক্ষার্থী কল্যাণ ও চিকিৎসা সহায়তা',
  'বিবিধ জরুরি আকস্মিক ব্যয়'
];

// Default Fee Rates setup per class
const DEFAULT_CLASS_RATES = {
  '6': { tuition: 150, admission: 500, session: 800, exam: 350 },
  '7': { tuition: 150, admission: 500, session: 800, exam: 350 },
  '8': { tuition: 200, admission: 500, session: 800, exam: 400, registration: 350 },
  '9': { tuition: 250, admission: 600, session: 1000, exam: 450, registration: 450 },
  '10': { tuition: 250, admission: 600, session: 1000, exam: 500, ssc_fee: 1950 }
};

// Initial Sample Fee Transactions
const SEED_FEE_TRANSACTIONS = [
  {
    id: 'FEE-2026-001',
    receipt_no: 'মপাউবি/রশিদ/২০২৬/০০১',
    date: '2026-10-15',
    student_id: 's-601',
    student_name: 'আহনাফ সিদ্দিক',
    class_name: '6',
    roll_no: '1',
    section: 'ক',
    is_stipend: false,
    is_scholarship: false,
    tuition_months: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর'],
    tuition_amount: 1500,
    items: [
      { name: 'মাসিক বেতন (১০ মাস)', amount: 1500, note: 'জানু - অক্টো' },
      { name: 'বার্ষিক চাঁদা ও সেশন ফি', amount: 800 },
      { name: 'অর্ধ-বার্ষিক পরীক্ষার ফি', amount: 350 },
      { name: 'স্কাউট ফি', amount: 100 }
    ],
    gross_total: 2750,
    discount: 250,
    discount_reason: 'প্রধান শিক্ষকের সুপারিশে বিশেষ ছাড়',
    net_payable: 2500,
    paid_amount: 2500,
    due_amount: 0,
    payment_method: 'cash',
    received_by: 'মোঃ আলমগীর হোসেন',
    remarks: 'সম্পূর্ণ পরিশোধিত'
  },
  {
    id: 'FEE-2026-002',
    receipt_no: 'মপাউবি/রশিদ/২০২৬/০০২',
    date: '2026-10-16',
    student_id: 's-801',
    student_name: 'জান্নাতুল ফেরদৌস',
    class_name: '8',
    roll_no: '2',
    section: 'ক',
    is_stipend: true,
    is_scholarship: false,
    tuition_months: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন'],
    tuition_amount: 0, // Stipend recipient = 0 tuition fee!
    items: [
      { name: 'মাসিক বেতন (৬ মাস) [উপবৃত্তি প্রাপ্ত - ১০০% মওকুফ]', amount: 0, note: 'উপবৃত্তি ভাতাভুক্ত' },
      { name: 'রেজিষ্ট্রেশন ফি (৮ম শ্রেণি)', amount: 350 },
      { name: 'বার্ষিক মিলাদ মাহফিল', amount: 100 },
      { name: 'স্কাউট ও গার্ল গাইড ফি', amount: 100 }
    ],
    gross_total: 550,
    discount: 50,
    discount_reason: 'দরিদ্র কল্যাণ তহবিল ছাড়',
    net_payable: 500,
    paid_amount: 500,
    due_amount: 0,
    payment_method: 'bkash',
    received_by: 'মোঃ আলমগীর হোসেন',
    remarks: 'উপবৃত্তি সুবিধাভোগী'
  }
];

// Initial Sample Institutional Incomes
const SEED_INCOMES = [
  {
    id: 'INC-2026-001',
    voucher_no: 'আয়-ভাউচার-২০২৬-১',
    date: '2026-10-05',
    category: 'মার্কেট ও দোকান ভাড়া বাবদ আয়',
    title: 'বিদ্যালয় মার্কেট দোকান নং ১ ও ২ এর মাসিক ভাড়া',
    payer_name: 'মেসার্স ভাই ভাই এন্টারপ্রাইজ',
    amount: 12000,
    method: 'cash',
    note: 'অক্টোবর মাসের ভাড়া আদায়'
  },
  {
    id: 'INC-2026-002',
    voucher_no: 'আয়-ভাউচার-২০২৬-২',
    date: '2026-10-10',
    category: 'ম্যানেজিং কমিটি ও দাতা সদস্যের অনুদান',
    title: 'সভাপতি মহোদয় কর্তৃক আইসিটি ল্যাব উন্নয়ন অনুদান',
    payer_name: 'নেয়ামুল হক খান (সভাপতি)',
    amount: 25000,
    method: 'bank',
    note: 'মাল্টিমিডিয়া প্রজেক্টর স্থাপন ফান্ড'
  },
  {
    id: 'INC-2026-003',
    voucher_no: 'আয়-ভাউচার-২০২৬-৩',
    date: '2026-10-14',
    category: 'ভর্তি ফরম ও প্রসপেক্টাস বিক্রয়',
    title: '২০২৬ শিক্ষাবর্ষের ভর্তি ফরম বিক্রয়লব্ধ অর্থ',
    payer_name: 'ভর্তি কমিটি',
    amount: 8500,
    method: 'cash',
    note: '৮৫টি ফরম বিক্রয় @ ১০০ টাকা'
  }
];

// Initial Sample Institutional Expenses
const SEED_EXPENSES = [
  {
    id: 'EXP-2026-001',
    voucher_no: 'ব্যয়-ভাউচার-২০২৬-১',
    date: '2026-10-06',
    category: 'বিদ্যুৎ বিল, গ্যাস ও পানির ইউটিলিটি বিল',
    title: 'পল্লী বিদ্যুৎ সমিতি - সেপ্টেম্বর মাসের বিদ্যুৎ বিল',
    payee_name: 'টাঙ্গাইল পল্লী বিদ্যুৎ সমিতি',
    amount: 5420,
    method: 'bkash',
    approved_by: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    note: 'মিটার নং: PU-4920'
  },
  {
    id: 'EXP-2026-002',
    voucher_no: 'ব্যয়-ভাউচার-২০২৬-২',
    date: '2026-10-08',
    category: 'পরীক্ষা পরিচালনা, খাতা-কলম ও প্রশ্নপত্র মুদ্রণ খরচ',
    title: 'নির্বাচনী ও প্রাক-নির্বাচনী পরীক্ষার প্রশ্নপত্র কম্পোজ ও মুদ্রণ',
    payee_name: 'কালিহাতি মডার্ন প্রেস',
    amount: 14500,
    method: 'cash',
    approved_by: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    note: 'সকল বিষয়ের প্রশ্নপত্র সরবরাহ'
  },
  {
    id: 'EXP-2026-003',
    voucher_no: 'ব্যয়-ভাউচার-২০২৬-৩',
    date: '2026-10-12',
    category: 'শিক্ষক-কর্মচারী বেতন-ভাতা (নন-এমপিও অংশ)',
    title: 'নন-এমপিও খণ্ডকালীন শিক্ষকবৃন্দের সেপ্টেম্বর মাসের সম্মানী',
    payee_name: 'সংশ্লিষ্ট শিক্ষকবৃন্দ',
    amount: 22000,
    method: 'bank',
    approved_by: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    note: 'ম্যানেজিং কমিটির অনুমোদনক্রমে'
  },
  {
    id: 'EXP-2026-004',
    voucher_no: 'ব্যয়-ভাউচার-২০২৬-৪',
    date: '2026-10-15',
    category: 'দাপ্তরিক স্টেশনারি ও রেজিস্টার খাতা ক্রয়',
    title: 'অফিস রেজিস্টার খাতা, এ৪ কাগজ ও প্রিন্টার কালি ক্রয়',
    payee_name: 'টাঙ্গাইল বুক ডিপো ও স্টেশনারি',
    amount: 4200,
    method: 'cash',
    approved_by: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    note: 'ক্যাশ মেমো নং: ৮৪১৯'
  }
];

export function FinancePanel({ sub }) {
  // Map sub navigation
  const getInitialTab = (s) => {
    if (s === 'collect' || s === 'fees') return 'collect';
    if (s === 'receipts' || s === 'history') return 'receipts';
    if (s === 'income') return 'income';
    if (s === 'expense' || s === 'expenses') return 'expense';
    if (s === 'cashbook' || s === 'statement') return 'cashbook';
    if (s === 'rates' || s === 'setup') return 'rates';
    return 'collect';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab(sub));
  useEffect(() => {
    if (sub) setActiveTab(getInitialTab(sub));
  }, [sub]);

  // Persistent Stores
  const [feeRecords, setFeeRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_finance_fees');
      return saved ? JSON.parse(saved) : SEED_FEE_TRANSACTIONS;
    } catch {
      return SEED_FEE_TRANSACTIONS;
    }
  });

  const [incomes, setIncomes] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_finance_incomes');
      return saved ? JSON.parse(saved) : SEED_INCOMES;
    } catch {
      return SEED_INCOMES;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_finance_expenses');
      return saved ? JSON.parse(saved) : SEED_EXPENSES;
    } catch {
      return SEED_EXPENSES;
    }
  });

  const [classRates, setClassRates] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_finance_rates');
      return saved ? JSON.parse(saved) : DEFAULT_CLASS_RATES;
    } catch {
      return DEFAULT_CLASS_RATES;
    }
  });

  // Students list from DB or mock
  const students = useMemo(() => {
    try {
      const raw = localStorage.getItem('magra_db_students');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return MOCK_STUDENTS;
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('magra_finance_fees', JSON.stringify(feeRecords)); } catch {}
  }, [feeRecords]);

  useEffect(() => {
    try { localStorage.setItem('magra_finance_incomes', JSON.stringify(incomes)); } catch {}
  }, [incomes]);

  useEffect(() => {
    try { localStorage.setItem('magra_finance_expenses', JSON.stringify(expenses)); } catch {}
  }, [expenses]);

  useEffect(() => {
    try { localStorage.setItem('magra_finance_rates', JSON.stringify(classRates)); } catch {}
  }, [classRates]);

  // ==========================================
  // FEE COLLECTION STATE & LOGIC
  // ==========================================
  // Default to Class 8 as requested
  const [selectedClass, setSelectedClass] = useState('8');
  // Group selection for Class 9 and 10
  const [selectedGroup, setSelectedGroup] = useState('all');
  // Roll number input for search
  const [searchRoll, setSearchRoll] = useState('1');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchFeedback, setSearchFeedback] = useState(null);

  // Filtered and roll-sorted students for selected class and group
  const classStudents = useMemo(() => {
    let list = (students || []).filter(s => normalizeClass(s.class_name) === normalizeClass(selectedClass));
    if (selectedClass === '9' || selectedClass === '10') {
      if (selectedGroup !== 'all') {
        list = list.filter(s => {
          const dept = getStudentDepartment(s);
          if (selectedGroup === 'science' || selectedGroup === 'বিজ্ঞান') return dept === 'বিজ্ঞান';
          if (selectedGroup === 'humanities' || selectedGroup === 'মানবিক') return dept === 'মানবিক';
          if (selectedGroup === 'business' || selectedGroup === 'ব্যবসা' || selectedGroup === 'ব্যবসায় শিক্ষা') return dept === 'ব্যবসায় শিক্ষা';
          return true;
        });
      }
    }
    return [...list].sort((a, b) => {
      const ra = parseRollNumber(a.roll_no) ?? 9999;
      const rb = parseRollNumber(b.roll_no) ?? 9999;
      return ra - rb;
    });
  }, [students, selectedClass, selectedGroup]);

  // Synchronize selected student with class/group changes
  useEffect(() => {
    if (classStudents.length > 0) {
      const existsInList = classStudents.find(s => String(s.id) === String(selectedStudentId) || String(s.student_id) === String(selectedStudentId));
      if (!existsInList) {
        const first = classStudents[0];
        setSelectedStudentId(first.id || first.student_id);
        setSearchRoll(String(first.roll_no || ''));
        setSearchFeedback(null);
      }
    } else {
      setSelectedStudentId('');
      setSearchRoll('');
    }
  }, [classStudents, selectedStudentId]);

  // Selected Student Object
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) {
      return classStudents[0] || null;
    }
    return students.find(s => String(s.id) === String(selectedStudentId) || String(s.student_id) === String(selectedStudentId)) || classStudents[0] || null;
  }, [students, selectedStudentId, classStudents]);

  // Handle Search Student by Roll Number (Exact & Multi-stream)
  const handleSearchStudent = (customRoll = null) => {
    const query = customRoll !== null ? customRoll : searchRoll;
    const targetRoll = parseRollNumber(query);
    
    if (targetRoll === null) {
      setSearchFeedback({
        type: 'error',
        text: 'দয়া করে শিক্ষার্থীর রোল নম্বর লিখুন (যেমন: ১ বা 1)'
      });
      return;
    }

    // 1. Search in current classStudents
    const found = classStudents.find(s => parseRollNumber(s.roll_no) === targetRoll);
    if (found) {
      setSelectedStudentId(found.id || found.student_id);
      setSearchRoll(String(found.roll_no));
      setSearchFeedback({
        type: 'success',
        text: `✅ পাওয়া গেছে: ${found.name_bn} (রোল: ${toBnDigits(found.roll_no)}, শ্রেণি: ${toBnDigits(found.class_name)}${found.group ? ` • ${found.group}` : ''})`
      });
      return;
    }

    // 2. If not found in current group, search across entire selected class
    const inEntireClass = students.filter(s => normalizeClass(s.class_name) === normalizeClass(selectedClass))
      .find(s => parseRollNumber(s.roll_no) === targetRoll);
    if (inEntireClass) {
      setSelectedGroup('all');
      setSelectedStudentId(inEntireClass.id || inEntireClass.student_id);
      setSearchRoll(String(inEntireClass.roll_no));
      setSearchFeedback({
        type: 'success',
        text: `✅ পাওয়া গেছে: ${inEntireClass.name_bn} (রোল: ${toBnDigits(inEntireClass.roll_no)}, শ্রেণি: ${toBnDigits(inEntireClass.class_name)}${inEntireClass.group ? ` • ${inEntireClass.group}` : ''})`
      });
      return;
    }

    // 3. Fallback: search by student_id or name
    const fuzzy = students.filter(s => normalizeClass(s.class_name) === normalizeClass(selectedClass))
      .find(s => 
        String(s.student_id || '').toLowerCase() === String(query).trim().toLowerCase() ||
        String(s.name_bn || '').includes(String(query).trim())
      );
    if (fuzzy) {
      setSelectedStudentId(fuzzy.id || fuzzy.student_id);
      setSearchRoll(String(fuzzy.roll_no));
      setSearchFeedback({
        type: 'success',
        text: `✅ পাওয়া গেছে: ${fuzzy.name_bn} (রোল: ${toBnDigits(fuzzy.roll_no)}, শ্রেণি: ${toBnDigits(fuzzy.class_name)})`
      });
      return;
    }

    setSearchFeedback({
      type: 'error',
      text: `⚠️ শ্রেণি ${toBnDigits(selectedClass)}${selectedGroup !== 'all' ? ` (${selectedGroup} বিভাগ)` : ''}-এ রোল ${toBnDigits(query)} এর কোনো শিক্ষার্থী পাওয়া যায়নি। তালিকা থেকে নির্বাচন করুন।`
    });
  };

  // Dropdown Selection Handler
  const handleSelectStudentFromDropdown = (stuId) => {
    setSelectedStudentId(stuId);
    const found = classStudents.find(s => String(s.id) === String(stuId) || String(s.student_id) === String(stuId));
    if (found) {
      setSearchRoll(String(found.roll_no || ''));
      setSearchFeedback({
        type: 'success',
        text: `✅ নির্বাচিত: ${found.name_bn} (রোল: ${toBnDigits(found.roll_no)})`
      });
    }
  };

  // Stipend / Scholarship status
  const [isStipend, setIsStipend] = useState(false);
  const [isScholarship, setIsScholarship] = useState(false);

  // When student changes, auto-detect stipend or scholarship if existing in record
  useEffect(() => {
    if (selectedStudent) {
      const hasStipend = Boolean(
        selectedStudent.stipend_status === 'active' ||
        selectedStudent.is_stipend ||
        selectedStudent.stipend ||
        String(selectedStudent.remarks || '').includes('উপবৃত্তি')
      );
      const hasScholarship = Boolean(
        selectedStudent.scholarship ||
        selectedStudent.is_scholarship ||
        String(selectedStudent.remarks || '').includes('বৃত্তি')
      );
      setIsStipend(hasStipend);
      setIsScholarship(hasScholarship);
    }
  }, [selectedStudent]);

  // Current month default
  const currentMonthIndex = new Date().getMonth(); // 0 = Jan

  // Selected Months for Monthly Tuition Fee
  const [selectedMonths, setSelectedMonths] = useState(() => [MONTHS_LIST[currentMonthIndex]]);

  // Monthly Tuition Rate (Class based or custom)
  const [monthlyRate, setMonthlyRate] = useState(200);

  // Update monthly rate based on selected student's class
  useEffect(() => {
    const cls = selectedStudent?.class_name || selectedClass || '6';
    const rate = classRates[cls]?.tuition || 200;
    setMonthlyRate(rate);
  }, [selectedStudent, selectedClass, classRates]);

  // Fee categories toggles & amounts - COMPLETELY EDITABLE BY USER
  const [feeHeads, setFeeHeads] = useState({
    admission: { active: false, amount: '', label: 'ভর্তি ফি', placeholder: 'যেমন: ৫০০' },
    late_fine: { active: false, amount: '', label: 'বিলম্ব ফি / জরিমানা', placeholder: 'যেমন: ২০ বা ৫০' },
    session_dev: { active: false, amount: '', label: 'বার্ষিক চাঁদা / সেশন ফি', placeholder: 'যেমন: ৮০০' },
    exam_fee: { active: false, amount: '', label: 'পরীক্ষার ফি', exam_name: 'অর্ধ-বার্ষিক পরীক্ষা', placeholder: 'যেমন: ৪০০' },
    registration: { active: false, amount: '', label: 'রেজিষ্ট্রেশন ফি (৮ম/৯ম শ্রেণি)', placeholder: 'যেমন: ৩৫০' },
    ssc_board_center: { active: false, amount: '', label: 'এসএসসি পরীক্ষার বোর্ড ও কেন্দ্র ফি', placeholder: 'যেমন: ১৯৫০' },
    milad: { active: false, amount: '', label: 'বার্ষিক মিলাদ মাহফিল ও ধর্মীয় অনুষ্ঠান', placeholder: 'যেমন: ১০০' },
    scout: { active: false, amount: '', label: 'স্কাউট ও গার্ল গাইড ফি', placeholder: 'যেমন: ১০০' },
    testimonial: { active: false, amount: '', label: 'প্রশংসাপত্র ফি', placeholder: 'যেমন: ২০০' },
    tc: { active: false, amount: '', label: 'ছাড়পত্র / টি.সি ফি', placeholder: 'যেমন: ৩০০' },
    other: { active: false, amount: '', label: 'অন্যান্য ফি', note: '', placeholder: 'টাকা লিখুন' }
  });

  // Toggle fee head active
  const toggleFeeHead = (key) => {
    setFeeHeads(prev => {
      const nextActive = !prev[key].active;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          active: nextActive
        }
      };
    });
  };

  // Change fee head amount directly (typing automatically activates the head)
  const setFeeHeadAmount = (key, val) => {
    setFeeHeads(prev => {
      const hasAmount = val !== '' && !isNaN(val) && Number(val) > 0;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          amount: val,
          active: hasAmount ? true : prev[key].active
        }
      };
    });
  };

  // Preset suggested default rates
  const applySuggestedRates = () => {
    setFeeHeads(prev => ({
      admission: { ...prev.admission, amount: 500 },
      late_fine: { ...prev.late_fine, amount: 50 },
      session_dev: { ...prev.session_dev, amount: 800 },
      exam_fee: { ...prev.exam_fee, amount: 400 },
      registration: { ...prev.registration, amount: 350 },
      ssc_board_center: { ...prev.ssc_board_center, amount: 1950 },
      milad: { ...prev.milad, amount: 100 },
      scout: { ...prev.scout, amount: 100 },
      testimonial: { ...prev.testimonial, amount: 200 },
      tc: { ...prev.tc, amount: 300 },
      other: { ...prev.other, amount: '' }
    }));
  };

  // Toggle month selection
  const toggleMonth = (mName) => {
    setSelectedMonths(prev => {
      if (prev.includes(mName)) {
        return prev.filter(m => m !== mName);
      } else {
        return [...prev, mName];
      }
    });
  };

  // Month select helpers
  const selectAllMonths = () => setSelectedMonths([...MONTHS_LIST]);
  const selectUpToCurrentMonth = () => setSelectedMonths(MONTHS_LIST.slice(0, currentMonthIndex + 1));
  const clearMonths = () => setSelectedMonths([]);

  // =========================================================================
  // CORE FORMULA:
  // If Stipend or Scholarship is selected, TUITION FEE IS ZERO (0 টাকা)!
  // =========================================================================
  const isTuitionFree = isStipend || isScholarship;
  const tuitionGrossAmount = selectedMonths.length * monthlyRate;
  const tuitionEffectiveAmount = isTuitionFree ? 0 : tuitionGrossAmount;

  // Other heads gross total (Dynamic calculation from user inputs)
  const otherHeadsGrossTotal = useMemo(() => {
    let sum = 0;
    Object.keys(feeHeads).forEach(key => {
      const h = feeHeads[key];
      if (h.active) {
        sum += (Number(h.amount) || 0);
      }
    });
    return sum;
  }, [feeHeads]);

  // Overall Gross Total Due
  const grossTotal = tuitionEffectiveAmount + otherHeadsGrossTotal;

  // Discount / Waiver (By Head Teacher)
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');

  // Net Payable Calculation: grossTotal - discountAmount
  const netPayable = Math.max(0, grossTotal - (Number(discountAmount) || 0));

  // Amount Received (Paid)
  const [paidAmount, setPaidAmount] = useState(netPayable);

  // Keep paidAmount in sync when grossTotal or discountAmount changes
  useEffect(() => {
    setPaidAmount(netPayable);
  }, [netPayable]);

  // Remaining Due Amount
  const dueAmount = Math.max(0, netPayable - (Number(paidAmount) || 0));

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [receivedBy, setReceivedBy] = useState('মোঃ আলমগীর হোসেন (হিসাব সহকারী)');
  const [submitMsg, setSubmitMsg] = useState('');
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Active items for money receipt preview
  const activeFeeItems = useMemo(() => {
    const items = [];
    if (selectedMonths.length > 0) {
      items.push({
        label: `মাসিক বেতন (${selectedMonths.join(', ')})`,
        amount: tuitionEffectiveAmount,
        original_amount: tuitionGrossAmount,
        is_free: isTuitionFree,
        note: isTuitionFree ? 'উপবৃত্তি/বৃত্তি প্রাপ্ত - মওকুফ' : ''
      });
    }
    Object.keys(feeHeads).forEach(k => {
      const h = feeHeads[k];
      const amt = Number(h.amount) || 0;
      if (h.active && amt > 0) {
        items.push({
          label: k === 'other' ? (h.note ? `অন্যান্য: ${h.note}` : 'অন্যান্য ফি') : (k === 'exam_fee' && h.exam_name ? `পরীক্ষার ফি (${h.exam_name})` : h.label),
          amount: amt,
          is_free: false,
          note: ''
        });
      }
    });
    return items;
  }, [selectedMonths, tuitionEffectiveAmount, tuitionGrossAmount, isTuitionFree, feeHeads]);

  // Submit Payment Handler
  const handleTakePayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!selectedStudent) {
      alert('অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    if (activeFeeItems.length === 0) {
      alert('কমপক্ষে একটি ফি বা বেতনের মাস নির্বাচন করুন।');
      return;
    }

    if (Number(paidAmount) <= 0 && dueAmount <= 0 && grossTotal > 0 && discountAmount < grossTotal) {
      alert('গৃহীত টাকার পরিমাণ সঠিক নয়।');
      return;
    }

    const receiptNo = `মপাউবি/রশিদ/${new Date().getFullYear()}/${String(feeRecords.length + 1).padStart(3, '0')}`;

    const newTransaction = {
      id: `FEE-${Date.now()}`,
      receipt_no: receiptNo,
      date: receiptDate || new Date().toISOString().slice(0, 10),
      student_id: selectedStudent.student_id || selectedStudent.id,
      student_name: selectedStudent.name_bn || selectedStudent.name,
      class_name: selectedStudent.class_name,
      roll_no: selectedStudent.roll_no,
      section: selectedStudent.section || 'ক',
      group: selectedStudent.group || selectedStudent.department || '',
      is_stipend: isStipend,
      is_scholarship: isScholarship,
      tuition_months: selectedMonths,
      tuition_amount: tuitionEffectiveAmount,
      items: activeFeeItems.map(i => ({ name: i.label, amount: i.amount, is_free: i.is_free, note: i.note })),
      gross_total: grossTotal,
      discount: Number(discountAmount) || 0,
      discount_reason: discountReason || '',
      net_payable: netPayable,
      paid_amount: Number(paidAmount) || 0,
      due_amount: dueAmount,
      payment_method: paymentMethod,
      received_by: receivedBy,
      remarks: paymentRemarks || (dueAmount === 0 ? 'সম্পূর্ণ পরিশোধিত' : `বকেয়া: ${formatMoney(dueAmount)}`)
    };

    setFeeRecords(prev => [newTransaction, ...prev]);
    setSubmitMsg(`সফল! রসিদ নং: ${receiptNo} অনুযায়ী ${formatMoney(paidAmount)} আদায় সম্পন্ন হয়েছে।`);
    setActiveReceipt(newTransaction);

    // Reset some fields
    setDiscountAmount(0);
    setPaymentRemarks('');
    setSelectedMonths([]);
    setFeeHeads(prev => {
      const reset = {};
      Object.keys(prev).forEach(k => {
        reset[k] = { ...prev[k], active: false, amount: '' };
      });
      return reset;
    });

    setTimeout(() => setSubmitMsg(''), 4000);
  };


  // ==========================================
  // INSTITUTIONAL INCOME FORM & LOGIC
  // ==========================================
  const [newIncome, setNewIncome] = useState({
    voucher_no: '',
    date: new Date().toISOString().slice(0, 10),
    category: INSTITUTIONAL_INCOME_HEADS[0],
    title: '',
    payer_name: '',
    amount: '',
    method: 'cash',
    note: ''
  });
  const [incomeMsg, setIncomeMsg] = useState('');

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newIncome.title || !newIncome.amount) {
      alert('আয়ের বিবরণ ও টাকার পরিমাণ প্রদান করুন।');
      return;
    }
    const item = {
      id: `INC-${Date.now()}`,
      voucher_no: newIncome.voucher_no || `আয়-ভাউচার-২০২৬-${incomes.length + 1}`,
      date: newIncome.date,
      category: newIncome.category,
      title: newIncome.title,
      payer_name: newIncome.payer_name || 'সাধারণ আদায়',
      amount: Number(newIncome.amount) || 0,
      method: newIncome.method,
      note: newIncome.note
    };
    setIncomes(prev => [item, ...prev]);
    setIncomeMsg('প্রাতিষ্ঠানিক আয় সফলভাবে ক্যাশ বুকে যুক্ত হয়েছে।');
    setNewIncome({
      voucher_no: '',
      date: new Date().toISOString().slice(0, 10),
      category: INSTITUTIONAL_INCOME_HEADS[0],
      title: '',
      payer_name: '',
      amount: '',
      method: 'cash',
      note: ''
    });
    setTimeout(() => setIncomeMsg(''), 3000);
  };

  // ==========================================
  // INSTITUTIONAL EXPENSE FORM & LOGIC
  // ==========================================
  const [newExpense, setNewExpense] = useState({
    voucher_no: '',
    date: new Date().toISOString().slice(0, 10),
    category: INSTITUTIONAL_EXPENSE_HEADS[0],
    title: '',
    payee_name: '',
    amount: '',
    method: 'cash',
    approved_by: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    note: ''
  });
  const [expenseMsg, setExpenseMsg] = useState('');

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) {
      alert('খরচের বিবরণ ও টাকার পরিমাণ প্রদান করুন।');
      return;
    }
    const item = {
      id: `EXP-${Date.now()}`,
      voucher_no: newExpense.voucher_no || `ব্যয়-ভাউচার-২০২৬-${expenses.length + 1}`,
      date: newExpense.date,
      category: newExpense.category,
      title: newExpense.title,
      payee_name: newExpense.payee_name || 'বিবিধ সরবরাহকারী',
      amount: Number(newExpense.amount) || 0,
      method: newExpense.method,
      approved_by: newExpense.approved_by,
      note: newExpense.note
    };
    setExpenses(prev => [item, ...prev]);
    setExpenseMsg('প্রাতিষ্ঠানিক ব্যয় সফলভাবে ক্যাশ বুকে সংরক্ষিত হয়েছে।');
    setNewExpense({
      voucher_no: '',
      date: new Date().toISOString().slice(0, 10),
      category: INSTITUTIONAL_EXPENSE_HEADS[0],
      title: '',
      payee_name: '',
      amount: '',
      method: 'cash',
      approved_by: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
      note: ''
    });
    setTimeout(() => setExpenseMsg(''), 3000);
  };

  // ==========================================
  // CASH BOOK & FINANCIAL SUMMARY
  // ==========================================
  const totalFeesCollected = useMemo(() => {
    return feeRecords.reduce((acc, r) => acc + (Number(r.paid_amount) || 0), 0);
  }, [feeRecords]);

  const totalOtherIncome = useMemo(() => {
    return incomes.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  }, [incomes]);

  const totalGrossIncome = totalFeesCollected + totalOtherIncome;

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  }, [expenses]);

  const netBalance = totalGrossIncome - totalExpense;

  const totalStudentDue = useMemo(() => {
    return feeRecords.reduce((acc, r) => acc + (Number(r.due_amount) || 0), 0);
  }, [feeRecords]);

  // Print Cash Receipt Function
  const handlePrintReceipt = (r) => {
    const w = window.open('', '_blank', 'width=1050,height=850');
    if (!w) {
      alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে অনুমতি দিন।');
      return;
    }

    const school = MOCK_SCHOOL;
    const inWords = numberToWordsBn(r.paid_amount);

    const slipTemplate = (copyType) => `
      <div class="receipt-slip">
        <div class="slip-header">
          <div class="slip-brand">
            <img src="${schoolLogo}" class="slip-logo" alt="Logo">
            <div class="slip-school-meta">
              <h2>${school.nameBn}</h2>
              <h4>${school.nameEn} • EIIN: ${school.eiin}</h4>
              <p>ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • স্থাপিত: ১৯৪৬</p>
            </div>
          </div>
          <div class="slip-copy-badge">${copyType}</div>
        </div>

        <div class="slip-banner">
          <h3>ফি আদায়ের মানি রিসিট (MONEY RECEIPT)</h3>
        </div>

        <div class="slip-meta-grid">
          <div><b>রশিদ নম্বর:</b> <span class="mono">${r.receipt_no}</span></div>
          <div style="text-align:right"><b>তারিখ:</b> ${formatDateBn(r.date)} খ্রি.</div>
          <div><b>শিক্ষার্থীর নাম:</b> <strong>${r.student_name}</strong></div>
          <div style="text-align:right"><b>Student ID:</b> <span class="mono">${r.student_id}</span></div>
          <div><b>শ্রেণি:</b> ${toBnDigits(r.class_name)} • <b>শাখা/গ্রুপ:</b> ${r.section} ${r.group_name ? `(${r.group_name})` : ''}</div>
          <div style="text-align:right"><b>রোল নম্বর:</b> ${toBnDigits(r.roll_no)}</div>
          <div><b>অভিভাবক:</b> ${r.guardian_name}</div>
          <div style="text-align:right"><b>মোবাইল:</b> ${toBnDigits(r.phone)}</div>
        </div>

        ${r.is_stipend || r.is_scholarship ? `
          <div class="stipend-notice-badge">
            🎉 <b>বিশেষ সুবিধা:</b> অত্র শিক্ষার্থী ${r.is_stipend ? 'উপবৃত্তি' : 'মেধাবৃত্তি'} সুবিধাভোগী বিধায় সরকারি বিধি অনুযায়ী মাসিক বেতন ১০০% মওকুফ।
          </div>
        ` : ''}

        <table class="slip-table">
          <thead>
            <tr>
              <th style="width:30px;text-align:center">ক্র.</th>
              <th>ফি-এর বিবরণ / খাত</th>
              <th style="width:110px;text-align:right">পরিমাণ (টাকা)</th>
            </tr>
          </thead>
          <tbody>
            ${(r.items || []).map((it, idx) => `
              <tr>
                <td style="text-align:center">${toBnDigits(idx + 1)}</td>
                <td>
                  <b>${it.name}</b>
                  ${it.note ? `<small style="display:block;color:#475569;font-size:10px">${it.note}</small>` : ''}
                </td>
                <td style="text-align:right;font-weight:700">${formatMoney(it.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align:right"><b>মোট নির্ধারিত পাওনা:</b></td>
              <td style="text-align:right"><b>${formatMoney(r.gross_total)}</b></td>
            </tr>
            ${r.discount > 0 ? `
              <tr style="color:#b45309">
                <td colspan="2" style="text-align:right">মওকুফ / ছাড় (প্রধান শিক্ষক কর্তৃক):</td>
                <td style="text-align:right">- ${formatMoney(r.discount)}</td>
              </tr>
            ` : ''}
            <tr style="background:#f1f5f9;font-size:12.5px">
              <td colspan="2" style="text-align:right"><b>সর্বমোট প্রদেয় / গৃহীত টাকা:</b></td>
              <td style="text-align:right;color:#047857"><b>${formatMoney(r.paid_amount)}</b></td>
            </tr>
            ${r.due_amount > 0 ? `
              <tr style="color:#dc2626">
                <td colspan="2" style="text-align:right">অবশিষ্ট বকেয়া:</td>
                <td style="text-align:right"><b>${formatMoney(r.due_amount)}</b></td>
              </tr>
            ` : ''}
          </tfoot>
        </table>

        <div class="slip-in-words">
          <b>কথায় (In Words):</b> ${inWords}
        </div>

        <div class="slip-signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <span>${r.received_by || 'হিসাব সহকারী'}</span>
            <small>আদায়কারীর স্বাক্ষর</small>
          </div>
          <div class="sig-box">
            <div class="sig-seal-box">সিলমোহর</div>
            <div class="sig-line"></div>
            <span>${school.headTeacher}</span>
            <small>প্রধান শিক্ষক</small>
          </div>
        </div>
      </div>
    `;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${r.receipt_no} - ${r.student_name}</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body {
            font-family: 'SolaimanLipi', Arial, 'Segoe UI', sans-serif;
            margin: 0; padding: 10px; background: #fff; color: #0f172a; font-size: 11px;
          }
          .dual-receipt-container {
            display: flex; gap: 16px; justify-content: space-between;
          }
          .receipt-slip {
            flex: 1; border: 1.5px solid #047857; border-radius: 8px; padding: 12px 14px;
            background: #ffffff; display: flex; flexDirection: column; justify-content: space-between;
            position: relative; box-sizing: border-box; min-height: 185mm;
          }
          .slip-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 2px solid #047857; padding-bottom: 6px; margin-bottom: 6px;
          }
          .slip-brand { display: flex; align-items: center; gap: 10px; }
          .slip-logo { width: 44px; height: 44px; object-fit: contain; }
          .slip-school-meta h2 { font-size: 16px; margin: 0; color: #047857; font-weight: 800; }
          .slip-school-meta h4 { font-size: 10px; margin: 1px 0; color: #334155; }
          .slip-school-meta p { font-size: 9px; margin: 0; color: #64748b; }
          .slip-copy-badge {
            background: #047857; color: #fff; padding: 3px 8px; border-radius: 4px;
            font-size: 10px; font-weight: 700; text-transform: uppercase;
          }
          .slip-banner {
            text-align: center; margin: 4px 0 8px; background: #ecfdf5; border: 1px dashed #059669;
            padding: 4px; border-radius: 4px;
          }
          .slip-banner h3 { margin: 0; font-size: 12px; color: #065f46; letter-spacing: 0.5px; }
          .slip-meta-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px; font-size: 10.5px;
            background: #f8fafc; padding: 6px 8px; border-radius: 5px; margin-bottom: 8px; border: 1px solid #e2e8f0;
          }
          .mono { font-family: monospace; font-weight: 700; color: #0369a1; }
          .stipend-notice-badge {
            background: #fef3c7; color: #92400e; border: 1px solid #fde68a;
            padding: 4px 8px; border-radius: 4px; font-size: 10px; margin-bottom: 6px; text-align: center;
          }
          .slip-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10.5px; }
          .slip-table th, .slip-table td { border: 1px solid #cbd5e1; padding: 4px 6px; }
          .slip-table th { background: #f1f5f9; color: #1e293b; font-weight: 700; }
          .slip-table tfoot tr td { border-top: 1.5px solid #047857; }
          .slip-in-words {
            font-size: 10.5px; background: #f0fdf4; border: 1px solid #bbf7d0;
            padding: 5px 8px; border-radius: 4px; margin-bottom: 12px;
          }
          .slip-signatures {
            display: flex; justify-content: space-between; margin-top: 25px; padding: 0 10px;
          }
          .sig-box { text-align: center; width: 130px; font-size: 10px; }
          .sig-line { border-top: 1px dashed #334155; margin-bottom: 4px; }
          .sig-seal-box {
            display: inline-block; border: 1px dashed #94a3b8; color: #94a3b8; font-size: 8px;
            padding: 1px 6px; border-radius: 3px; margin-bottom: 15px;
          }
          .cut-divider {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border-left: 2px dashed #94a3b8; margin: 0 4px; position: relative;
          }
          .cut-icon {
            background: #fff; padding: 4px 0; font-size: 14px; position: absolute;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="dual-receipt-container">
          ${slipTemplate('অফিস কপি (Office Copy)')}
          <div class="cut-divider">
            <span class="cut-icon">✂️</span>
          </div>
          ${slipTemplate('শিক্ষার্থী / অভিভাবক কপি')}
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // Print Cash Book Statement Function
  const handlePrintCashBook = () => {
    const w = window.open('', '_blank', 'width=1000,height=850');
    if (!w) return;
    const school = MOCK_SCHOOL;
    
    // Sort all records chronologically
    const combined = [
      ...feeRecords.map(f => ({ ...f, type: 'fee', title: `শিক্ষার্থী ফি: ${f.student_name} (${f.class_name}ম, রোল: ${f.roll_no})`, in: f.paid_amount, out: 0 })),
      ...incomes.map(i => ({ ...i, type: 'income', in: i.amount, out: 0 })),
      ...expenses.map(e => ({ ...e, type: 'expense', in: 0, out: e.amount }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>ক্যাশ বুক ও আর্থিক বিবরণী - ${school.nameBn}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 15px; font-size: 11px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 20px; color: #047857; font-weight: 800; }
          .header p { margin: 2px 0; font-size: 11px; color: #475569; }
          .summary-boxes { display: flex; gap: 12px; margin-bottom: 15px; justify-content: space-between; }
          .box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; text-align: center; background: #f8fafc; }
          .box b { display: block; font-size: 16px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #475569; padding: 5px 8px; }
          th { background: #e2e8f0; text-align: left; }
          .in { color: #047857; font-weight: bold; text-align: right; }
          .out { color: #b91c1c; font-weight: bold; text-align: right; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .sig-item { width: 140px; border-top: 1px dashed #333; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${school.nameBn}</h1>
          <p>${school.address} • EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬</p>
          <h3 style="margin:6px 0 0;text-decoration:underline">দৈনিক ও মাসিক ক্যাশ বুক বিবরণী (Cash Register)</h3>
          <p>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
        </div>

        <div class="summary-boxes">
          <div class="box">
            <span>মোট শিক্ষার্থী ফি আদায়</span>
            <b style="color:#047857">${formatMoney(totalFeesCollected)}</b>
          </div>
          <div class="box">
            <span>অন্যান্য প্রাতিষ্ঠানিক আয়</span>
            <b style="color:#0284c7">${formatMoney(totalOtherIncome)}</b>
          </div>
          <div class="box">
            <span>সর্বমোট প্রাতিষ্ঠানিক ব্যয়</span>
            <b style="color:#b91c1c">${formatMoney(totalExpense)}</b>
          </div>
          <div class="box" style="background:#ecfdf5;border-color:#059669">
            <span>নীট উদ্বৃত্ত (ক্যাশ ব্যালেন্স)</span>
            <b style="color:#065f46">${formatMoney(netBalance)}</b>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:70px">তারিখ</th>
              <th style="width:90px">ভাউচার/রশিদ</th>
              <th>বিবরণ ও খাত</th>
              <th style="width:70px">মাধ্যম</th>
              <th style="width:95px;text-align:right">জমা (আয়)</th>
              <th style="width:95px;text-align:right">খরচ (ব্যয়)</th>
            </tr>
          </thead>
          <tbody>
            ${combined.map(r => `
              <tr>
                <td>${formatDateBn(r.date)}</td>
                <td style="font-family:monospace">${r.receipt_no || r.voucher_no || '—'}</td>
                <td>
                  <b>${r.title || r.student_name}</b>
                  ${r.category ? `<small style="display:block;color:#64748b">${r.category}</small>` : ''}
                </td>
                <td style="text-align:center">${r.payment_method || r.method || 'cash'}</td>
                <td class="in">${r.in > 0 ? formatMoney(r.in) : '—'}</td>
                <td class="out">${r.out > 0 ? formatMoney(r.out) : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background:#f1f5f9;font-weight:bold">
              <td colspan="4" style="text-align:right">মোট জমা ও খরচ:</td>
              <td class="in">${formatMoney(totalGrossIncome)}</td>
              <td class="out">${formatMoney(totalExpense)}</td>
            </tr>
            <tr style="background:#dcfce7;font-weight:bold;font-size:12px">
              <td colspan="4" style="text-align:right">সমাপনী ক্যাশ স্থিতি (Net Balance):</td>
              <td colspan="2" style="text-align:right;color:#065f46">${formatMoney(netBalance)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="signatures">
          <div class="sig-item">হিসাব সহকারী</div>
          <div class="sig-item">আহ্বায়ক, অর্থ কমিটি</div>
          <div class="sig-item">প্রধান শিক্ষক</div>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="finance-panel-container" style={{ padding: '4px 0 30px' }}>
      {/* Top Banner & KPI Stat Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0f766e 100%)',
        borderRadius: '14px', padding: '20px 24px', color: '#fff', marginBottom: '20px',
        boxShadow: '0 4px 15px rgba(4,120,87,0.25)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: 700 }}>
              ACCOUNTS & TREASURY • NON-GOVT SECONDARY SCHOOL ERP
            </span>
            <h1 style={{ margin: '4px 0 4px', fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💳</span> ফি ও প্রাতিষ্ঠানিক হিসাব ব্যবস্থাপনা
            </h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.95 }}>
              শিক্ষার্থীদের সকল ক্যাটাগরির ফি আদায়, উপবৃত্তি/বৃত্তি সমন্বয়, মওকুফ ও প্রাতিষ্ঠানিক পূর্ণাঙ্গ আয়-ব্যয় খাতা।
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrintCashBook}
              style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 700, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px',
                backdropFilter: 'blur(5px)'
              }}
            >
              🖨️ ক্যাশ বুক প্রিন্ট
            </button>
            <div style={{
              background: 'rgba(0,0,0,0.2)', padding: '6px 14px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)'
            }}>
              EIIN: 114290 • স্থাপিত: ১৯৪৬
            </div>
          </div>
        </div>

        {/* 4 Primary KPI metric tiles */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px', marginTop: '18px'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '11.5px', opacity: 0.9 }}>💵 শিক্ষার্থী ফি আদায়</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{formatMoney(totalFeesCollected)}</div>
            <small style={{ fontSize: '10px', opacity: 0.85 }}>মোট {toBnDigits(feeRecords.length)} টি রসিদ</small>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '11.5px', opacity: 0.9 }}>📥 অন্যান্য প্রাতিষ্ঠানিক আয়</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{formatMoney(totalOtherIncome)}</div>
            <small style={{ fontSize: '10px', opacity: 0.85 }}>অনুদান, ভাড়া ও বিবিধ খাত</small>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '11.5px', opacity: 0.9 }}>📤 প্রাতিষ্ঠানিক ব্যয় (খরচ)</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px', color: '#fecaca' }}>{formatMoney(totalExpense)}</div>
            <small style={{ fontSize: '10px', opacity: 0.85 }}>বেতন, ইউটিলিটি ও মেরামত</small>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #86efac' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#dcfce7' }}>🏦 বর্তমান ক্যাশ স্থিতি (Net)</span>
            <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px', color: '#ffffff' }}>{formatMoney(netBalance)}</div>
            <small style={{ fontSize: '10px', color: '#bbf7d0', fontWeight: 600 }}>মোট বকেয়া: {formatMoney(totalStudentDue)}</small>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px',
        marginBottom: '16px', borderBottom: '2px solid #e2e8f0'
      }}>
        {[
          ['collect', '💵 শিক্ষার্থী ফি আদায় (Billing)'],
          ['receipts', '🧾 ফি আদায়ের ইতিহাস ও রশিদ'],
          ['income', '📥 বিদ্যালয়ের আয় খাতা'],
          ['expense', '📤 বিদ্যালয়ের ব্যয় খাতা'],
          ['cashbook', '📊 ক্যাশ বুক ও আর্থিক বিবরণী'],
          ['rates', '⚙️ ফি রেট ও ক্লাস সেটিংস']
        ].map(([tKey, label]) => (
          <button
            key={tKey}
            type="button"
            onClick={() => setActiveTab(tKey)}
            style={{
              padding: '9px 18px', borderRadius: '8px 8px 0 0', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              border: activeTab === tKey ? '2px solid #047857' : '1px solid #cbd5e1',
              borderBottom: activeTab === tKey ? '2px solid #ffffff' : '1px solid #cbd5e1',
              background: activeTab === tKey ? '#ffffff' : '#f8fafc',
              color: activeTab === tKey ? '#047857' : '#475569',
              marginBottom: '-2px', transition: 'all 0.15s ease'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {submitMsg && (
        <div style={{
          background: '#dcfce7', color: '#166534', border: '1px solid #86efac',
          padding: '12px 18px', borderRadius: '8px', marginBottom: '16px',
          fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>✅</span> {submitMsg}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: STUDENT FEE COLLECTION & BILLING                   */}
      {/* ========================================================= */}
      {activeTab === 'collect' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Student Picker & Student Profile Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter & Selector Box */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span> ১. শিক্ষার্থী নির্বাচন করুন
              </h3>
              
              {/* Class Selection Buttons */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  শ্রেণি নির্বাচন করুন:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {['6', '7', '8', '9', '10'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedClass(c);
                        if (c !== '9' && c !== '10') setSelectedGroup('all');
                        setSearchRoll('');
                        setSearchFeedback(null);
                      }}
                      style={{
                        padding: '7px 2px',
                        borderRadius: '6px',
                        border: selectedClass === c ? '2px solid #047857' : '1px solid #cbd5e1',
                        background: selectedClass === c ? '#047857' : '#f8fafc',
                        color: selectedClass === c ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      {toBnDigits(c)}ম শ্রেণি
                    </button>
                  ))}
                </div>
              </div>

              {/* Group / Stream Selector (Only for Class 9 and 10) */}
              {(selectedClass === '9' || selectedClass === '10') && (
                <div style={{ marginBottom: '12px', background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #86efac' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#065f46', display: 'block', marginBottom: '4px' }}>
                    বিভাগ / গ্রুপ নির্বাচন (৯ম ও ১০ম শ্রেণির জন্য):
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={e => {
                      setSelectedGroup(e.target.value);
                      setSearchFeedback(null);
                    }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #059669', fontSize: '12.5px', fontWeight: 700, background: '#ffffff', color: '#065f46' }}
                  >
                    <option value="all">সকল বিভাগ / গ্রুপ (All Groups)</option>
                    <option value="science">বিজ্ঞান বিভাগ (Science)</option>
                    <option value="humanities">মানবিক বিভাগ (Humanities)</option>
                    <option value="business">ব্যবসায় শিক্ষা শাখা (Business Studies)</option>
                  </select>
                </div>
              )}

              {/* Roll Number Search Box + Search Button */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  রোল নম্বর দিয়ে অনুসন্ধান (Search by Roll):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder={selectedClass === '9' || selectedClass === '10' ? "রোল লিখুন (যেমন: ৭ বা 7)" : "রোল লিখুন (যেমন: ১ বা 1)"}
                    value={searchRoll}
                    onChange={e => setSearchRoll(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchStudent(); } }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #94a3b8',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchStudent()}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(4,120,87,0.2)'
                    }}
                  >
                    🔍 খুঁজুন
                  </button>
                </div>
              </div>

              {/* Search Feedback Message */}
              {searchFeedback && (
                <div style={{
                  marginBottom: '12px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: searchFeedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: searchFeedback.type === 'success' ? '#166534' : '#991b1b',
                  border: searchFeedback.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5'
                }}>
                  {searchFeedback.text}
                </div>
              )}

              {/* Dropdown Selector (Sync with search) */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  অথবা তালিকা থেকে নির্বাচন করুন ({classStudents.length} জন):
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => handleSelectStudentFromDropdown(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1.5px solid #047857',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    background: '#f0fdf4',
                    color: '#065f46'
                  }}
                >
                  {classStudents.map(s => (
                    <option key={s.id || s.student_id} value={s.id || s.student_id}>
                      রোল {toBnDigits(s.roll_no)} - {s.name_bn} {s.group ? `(${s.group})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Student Profile Summary Card */}
            {selectedStudent && (
              <div style={{
                background: '#ffffff', borderRadius: '12px', border: '1.5px solid #047857',
                padding: '16px', boxShadow: '0 4px 10px rgba(4,120,87,0.08)'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <img
                    src={getStudentPhoto(selectedStudent)}
                    alt=""
                    style={{ width: '56px', height: '62px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{selectedStudent.name_bn}</h3>
                    {selectedStudent.name_en && <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedStudent.name_en}</div>}
                    <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                      শ্রেণি: {toBnDigits(selectedStudent.class_name)} • রোল: {toBnDigits(selectedStudent.roll_no)}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #e2e8f0' }}>
                  <div><b>Student ID:</b> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>{selectedStudent.student_id || selectedStudent.id}</span></div>
                  <div><b>শাখা / গ্রুপ:</b> {selectedStudent.section || 'ক'} {selectedStudent.group ? `(${selectedStudent.group})` : (selectedStudent.department ? `(${selectedStudent.department})` : '')}</div>
                  <div><b>পিতা / অভিভাবক:</b> {selectedStudent.guardian_name_bn || selectedStudent.father_name || selectedStudent.father_name_bn || '—'}</div>
                  <div><b>মোবাইল:</b> {toBnDigits(selectedStudent.phone || selectedStudent.guardian_phone || selectedStudent.father_mobile || '—')}</div>
                </div>

                {/* Stipend / Scholarship Selector Box (CRITICAL REQUIREMENT) */}
                <div style={{
                  marginTop: '12px', padding: '12px', borderRadius: '8px',
                  background: isTuitionFree ? '#ecfdf5' : '#f8fafc',
                  border: isTuitionFree ? '2px solid #059669' : '1px dashed #cbd5e1'
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: isTuitionFree ? '#047857' : '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎁</span> উপবৃত্তি ও বৃত্তি সংক্রান্ত সুবিধা
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: isStipend ? 700 : 500, color: isStipend ? '#047857' : '#334155' }}>
                      <input
                        type="checkbox"
                        checked={isStipend}
                        onChange={e => setIsStipend(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#047857' }}
                      />
                      <span>উপবৃত্তি প্রাপ্ত শিক্ষার্থী (Stipend Recipient)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: isScholarship ? 700 : 500, color: isScholarship ? '#047857' : '#334155' }}>
                      <input
                        type="checkbox"
                        checked={isScholarship}
                        onChange={e => setIsScholarship(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#047857' }}
                      />
                      <span>মেধাবৃত্তি / সাধারণ বৃত্তি প্রাপ্ত</span>
                    </label>
                  </div>

                  {isTuitionFree ? (
                    <div style={{
                      marginTop: '8px', background: '#dcfce7', color: '#166534',
                      padding: '6px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700,
                      border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <span>✨</span> সরকারি নিয়মানুযায়ী বেতন সম্পূর্ণ ফ্রি (৳ ০ ধার্য হবে)
                    </div>
                  ) : (
                    <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#64748b' }}>
                      * উপবৃত্তি বা বৃত্তি প্রাপ্ত সিলেক্ট থাকলে মাসিক বেতন মোট পাওনায় যোগ হবে না।
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Fee Categories, Months, Calculations, and Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Monthly Tuition Fee & Months Grid */}
            <div style={{
              background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1',
              padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span> ১. মাসিক বেতন (টিউশন ফি) নির্ধারণ
                  </h3>
                  <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                    যে যে মাসের বেতন গ্রহণ করা হচ্ছে তা সিলেক্ট করুন (একাধিক মাস নির্বাচনযোগ্য)
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>মাসিক রেট:</label>
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '2px 6px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '12px', marginRight: '4px' }}>৳</span>
                    <input
                      type="number"
                      value={monthlyRate}
                      onChange={e => setMonthlyRate(Math.max(0, Number(e.target.value) || 0))}
                      style={{ width: '65px', padding: '3px 4px', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Month Quick Select Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <button type="button" onClick={selectUpToCurrentMonth} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  বর্তমান মাস ({MONTHS_LIST[currentMonthIndex]}) পর্যন্ত
                </button>
                <button type="button" onClick={selectAllMonths} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  ১২ মাস (সবগুলো)
                </button>
                <button type="button" onClick={clearMonths} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  সব বাতিল (রিসেট)
                </button>
              </div>

              {/* 12 Months Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '8px', marginBottom: '12px'
              }}>
                {MONTHS_LIST.map((m, idx) => {
                  const isSelected = selectedMonths.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      style={{
                        padding: '8px 4px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
                        border: isSelected ? '2px solid #047857' : '1px solid #cbd5e1',
                        background: isSelected ? '#ecfdf5' : '#ffffff',
                        color: isSelected ? '#047857' : '#475569',
                        boxShadow: isSelected ? '0 2px 4px rgba(4,120,87,0.15)' : 'none'
                      }}
                    >
                      <div>{m}</div>
                      <small style={{ fontSize: '10px', opacity: 0.8 }}>
                        {isSelected ? '✓ নির্বাচিত' : `${toBnDigits(idx + 1)}ম মাস`}
                      </small>
                    </button>
                  );
                })}
              </div>

              {/* Tuition Tally Notice */}
              <div style={{
                background: isTuitionFree ? '#fef3c7' : '#f0fdf4',
                border: isTuitionFree ? '1px solid #fde68a' : '1px solid #bbf7d0',
                borderRadius: '8px', padding: '10px 14px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
              }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: isTuitionFree ? '#92400e' : '#166534' }}>
                    নির্বাচিত মাস: {toBnDigits(selectedMonths.length)} টি ({selectedMonths.join(', ') || 'কোনো মাস নির্বাচিত নেই'})
                  </span>
                  {isTuitionFree && (
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                      (উপবৃত্তি/বৃত্তি প্রাপ্ত বিধায় মূল হিসাব {formatMoney(tuitionGrossAmount)}-এর বদলে মোট পাওনা <b>৳ ০</b> হিসেবে ধার্য)
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isTuitionFree ? '#166534' : '#047857' }}>
                  বেতন বাবদ পাওনা: {formatMoney(tuitionEffectiveAmount)}
                </div>
              </div>
            </div>

            {/* 2. Other Specified Institutional Fee Heads (User Fully Editable Amounts) */}
            <div style={{
              background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1',
              padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋</span> ২. অন্যান্য প্রাতিষ্ঠানিক ফি ক্যাটাগরি (প্রযোজ্য ক্ষেত্রে টিক দিন ও ইচ্ছামতো টাকার অংক লিখুন)
                </h3>
                <button
                  type="button"
                  onClick={applySuggestedRates}
                  style={{
                    background: '#f0fdf4', border: '1px solid #86efac', color: '#047857',
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="প্রমিত ফি রেট স্বয়ংক্রিয়ভাবে ইনপুটে বসান"
                >
                  🔄 প্রমিত ফি বসান (Suggested Rates)
                </button>
              </div>

              <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '12px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                💡 <b>নির্দেশনা:</b> প্রতিটি ফির ক্ষেত্রে টাকার অংক আপনার ইচ্ছামতো সরাসরি লিখুন (যেমন: বিলম্ব ফি বা জরিমানার ঘরে ২০, ৫০, ১০০ টাকা লিখলে তা স্বয়ংক্রিয়ভাবে মোট পাওনায় যোগ হবে)।
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '10px' }}>
                
                {/* 1. ভর্তি ফি */}
                <div style={{ border: feeHeads.admission.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.admission.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.admission.active} onChange={() => toggleFeeHead('admission')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>ভর্তি ফি</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.admission.amount}
                      onChange={e => setFeeHeadAmount('admission', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.admission.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 2. বিলম্ব ফি / জরিমানা */}
                <div style={{ border: feeHeads.late_fine.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.late_fine.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.late_fine.active} onChange={() => toggleFeeHead('late_fine')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>বিলম্ব ফি / জরিমানা</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="যেমন: ২০ বা ৫০"
                      value={feeHeads.late_fine.amount}
                      onChange={e => setFeeHeadAmount('late_fine', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.late_fine.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 3. বার্ষিক চাঁদা / উন্নয়ন ও সেশন ফি */}
                <div style={{ border: feeHeads.session_dev.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.session_dev.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.session_dev.active} onChange={() => toggleFeeHead('session_dev')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>বার্ষিক চাঁদা / সেশন ফি</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.session_dev.amount}
                      onChange={e => setFeeHeadAmount('session_dev', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.session_dev.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 4. পরীক্ষার ফি */}
                <div style={{ border: feeHeads.exam_fee.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.exam_fee.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                      <input type="checkbox" checked={feeHeads.exam_fee.active} onChange={() => toggleFeeHead('exam_fee')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                      <span>পরীক্ষার ফি</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                      <input
                        type="number"
                        placeholder="টাকা লিখুন"
                        value={feeHeads.exam_fee.amount}
                        onChange={e => setFeeHeadAmount('exam_fee', e.target.value)}
                        style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.exam_fee.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                      />
                    </div>
                  </div>
                  {feeHeads.exam_fee.active && (
                    <select
                      value={feeHeads.exam_fee.exam_name}
                      onChange={e => setFeeHeads(prev => ({ ...prev, exam_fee: { ...prev.exam_fee, exam_name: e.target.value } }))}
                      style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', background: '#fff' }}
                    >
                      <option value="১ম সাময়িক পরীক্ষা">১ম সাময়িক পরীক্ষা</option>
                      <option value="অর্ধ-বার্ষিক পরীক্ষা">অর্ধ-বার্ষিক পরীক্ষা</option>
                      <option value="প্রাক-নির্বাচনী পরীক্ষা">প্রাক-নির্বাচনী পরীক্ষা</option>
                      <option value="নির্বাচনী / টেস্ট পরীক্ষা">নির্বাচনী / টেস্ট পরীক্ষা</option>
                      <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
                    </select>
                  )}
                </div>

                {/* 5. রেজিষ্ট্রেশন ফি */}
                <div style={{ border: feeHeads.registration.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.registration.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.registration.active} onChange={() => toggleFeeHead('registration')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>রেজিষ্ট্রেশন ফি (৮ম/৯ম)</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.registration.amount}
                      onChange={e => setFeeHeadAmount('registration', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.registration.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 6. এসএসসি পরীক্ষার বোর্ড ও কেন্দ্র ফি */}
                <div style={{ border: feeHeads.ssc_board_center.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.ssc_board_center.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.ssc_board_center.active} onChange={() => toggleFeeHead('ssc_board_center')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>এসএসসি বোর্ড ও কেন্দ্র ফি</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.ssc_board_center.amount}
                      onChange={e => setFeeHeadAmount('ssc_board_center', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.ssc_board_center.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 7. বার্ষিক মিলাদ মাহফিল */}
                <div style={{ border: feeHeads.milad.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.milad.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.milad.active} onChange={() => toggleFeeHead('milad')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>বার্ষিক মিলাদ মাহফিল</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.milad.amount}
                      onChange={e => setFeeHeadAmount('milad', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.milad.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 8. স্কাউট ও গার্ল গাইড ফি */}
                <div style={{ border: feeHeads.scout.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.scout.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.scout.active} onChange={() => toggleFeeHead('scout')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>স্কাউট ও গার্ল গাইড ফি</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.scout.amount}
                      onChange={e => setFeeHeadAmount('scout', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.scout.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 9. প্রশংসাপত্র ফি */}
                <div style={{ border: feeHeads.testimonial.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.testimonial.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.testimonial.active} onChange={() => toggleFeeHead('testimonial')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>প্রশংসাপত্র ফি</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.testimonial.amount}
                      onChange={e => setFeeHeadAmount('testimonial', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.testimonial.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 10. ছাড়পত্র / টি.সি ফি */}
                <div style={{ border: feeHeads.tc.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.tc.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1 }}>
                    <input type="checkbox" checked={feeHeads.tc.active} onChange={() => toggleFeeHead('tc')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>ছাড়পত্র / টি.সি ফি</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা লিখুন"
                      value={feeHeads.tc.amount}
                      onChange={e => setFeeHeadAmount('tc', e.target.value)}
                      style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.tc.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 11. অন্যান্য ফি */}
                <div style={{ border: feeHeads.other.active ? '2px solid #047857' : '1px solid #cbd5e1', background: feeHeads.other.active ? '#f0fdf4' : '#fff', padding: '9px 12px', borderRadius: '8px', gridColumn: 'span 2', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={feeHeads.other.active} onChange={() => toggleFeeHead('other')} style={{ width: '17px', height: '17px', accentColor: '#047857' }} />
                    <span>অন্যান্য ফি:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="খাতের বিবরণ (যেমন: বিজ্ঞানাগার/আইসিটি/লাইব্রেরি চার্জ)"
                    value={feeHeads.other.note}
                    onChange={e => setFeeHeads(prev => ({ ...prev, other: { ...prev.other, note: e.target.value, active: e.target.value ? true : prev.other.active } }))}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>৳</span>
                    <input
                      type="number"
                      placeholder="টাকা"
                      value={feeHeads.other.amount}
                      onChange={e => setFeeHeadAmount('other', e.target.value)}
                      style={{ width: '95px', padding: '6px 8px', borderRadius: '6px', border: feeHeads.other.active ? '1.5px solid #047857' : '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 3. Billing Summary & Payment Submission (User Request Specification) */}
            <div style={{
              background: '#f8fafc', borderRadius: '12px', border: '2px solid #047857',
              padding: '20px', boxShadow: '0 4px 12px rgba(4,120,87,0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💰</span> ৩. মোট পাওনা, মওকুফ ও পেমেন্ট গ্রহণ
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                
                {/* মোট পাওনা */}
                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    মোট পাওনা (Gross Due)
                  </label>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                    {formatMoney(grossTotal)}
                  </div>
                  <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                    বেতন ({formatMoney(tuitionEffectiveAmount)}) + অন্যান্য ({formatMoney(otherHeadsGrossTotal)})
                  </small>
                </div>

                {/* ডিসকাউন্ট / মওকুফ */}
                <div style={{ background: '#fef3c7', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '4px' }}>
                    ডিসকাউন্ট (প্রধান শিক্ষক কর্তৃক মওকুফ)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>৳</span>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f59e0b', fontSize: '15px', fontWeight: 800, color: '#b45309' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={e => setDiscountReason(e.target.value)}
                    placeholder="মওকুফের কারণ"
                    style={{ width: '100%', marginTop: '6px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #fcd34d', fontSize: '11px' }}
                  />
                </div>

                {/* গৃহীত টাকার পরিমাণ */}
                <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: '8px', border: '2px solid #059669' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#065f46', display: 'block', marginBottom: '4px' }}>
                    গৃহীত টাকার পরিমাণ (Net Paid)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#047857' }}>৳</span>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={e => setPaidAmount(Math.max(0, Number(e.target.value) || 0))}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1.5px solid #047857', fontSize: '16px', fontWeight: 900, color: '#047857', background: '#fff' }}
                    />
                  </div>
                  <small style={{ fontSize: '10.5px', color: '#047857', fontWeight: 700 }}>
                    (মোট পাওনা - ডিসকাউন্ট)
                  </small>
                </div>

                {/* বকেয়া (যদি থাকে) */}
                <div style={{ background: dueAmount > 0 ? '#fee2e2' : '#ffffff', padding: '12px 14px', borderRadius: '8px', border: dueAmount > 0 ? '1.5px solid #ef4444' : '1px solid #cbd5e1' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: dueAmount > 0 ? '#991b1b' : '#64748b', display: 'block', marginBottom: '4px' }}>
                    অবশিষ্ট বকেয়া (Due Balance)
                  </label>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: dueAmount > 0 ? '#b91c1c' : '#16a34a' }}>
                    {formatMoney(dueAmount)}
                  </div>
                  <small style={{ fontSize: '10.5px', color: dueAmount > 0 ? '#b91c1c' : '#16a34a', fontWeight: 600 }}>
                    {dueAmount > 0 ? '⚠️ পরবর্তী তারিখে প্রদেয়' : '✓ কোনো বকেয়া নেই'}
                  </small>
                </div>
              </div>

              {/* Payment Method, Date, and Collector Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>পেমেন্ট মাধ্যম</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600 }}
                  >
                    <option value="cash">💵 নগদ ক্যাশ (Cash)</option>
                    <option value="bkash">📱 বিকাশ (bKash)</option>
                    <option value="nagad">📱 নগদ (Nagad)</option>
                    <option value="rocket">📱 রকেট (Rocket)</option>
                    <option value="bank">🏦 ব্যাংক জমা / পে-অর্ডার</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>আদায়ের তারিখ</label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={e => setReceiptDate(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>আদায়কারীর নাম ও পদবি</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={e => setReceivedBy(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>মন্তব্য (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={paymentRemarks}
                    onChange={e => setPaymentRemarks(e.target.value)}
                    placeholder="যেমন: পূর্ণ পরিশোধিত"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Submit Payment Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCollectPayment}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '8px',
                    fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(4,120,87,0.3)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                  }}
                >
                  <span>💳</span> পেমেন্ট নিন ও মানি রিসিট প্রিন্ট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FEE COLLECTION HISTORY & RECEIPTS                  */}
      {/* ========================================================= */}
      {activeTab === 'receipts' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#047857' }}>
                🧾 শিক্ষার্থী ফি আদায়ের ইতিহাস ও মানি রিসিট
              </h3>
              <small style={{ color: '#64748b' }}>সংরক্ষিত সকল রসিদ পুনঃমুদ্রণ ও নিরীক্ষণ করুন</small>
            </div>
            <span style={{ background: '#ecfdf5', color: '#047857', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 700 }}>
              মোট আদায়কৃত রসিদ: {toBnDigits(feeRecords.length)} টি
            </span>
          </div>

          <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '50px' }}>ক্র.</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left', width: '130px' }}>রশিদ নং</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '90px' }}>তারিখ</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '70px' }}>শ্রেণি</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '60px' }}>রোল</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', width: '90px' }}>মোট পাওনা</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', width: '80px' }}>মওকুফ</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', width: '95px' }}>আদায়কৃত টাকা</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', width: '80px' }}>বকেয়া</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '110px' }}>কাজ / রসিদ</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdfe' }}>
                    <td style={{ textAlign: 'center', padding: '8px 4px', fontWeight: 600, color: '#64748b' }}>{toBnDigits(idx + 1)}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>{r.receipt_no}</td>
                    <td style={{ textAlign: 'center', padding: '8px 8px' }}>{formatDateBn(r.date)}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <strong style={{ color: '#0f172a' }}>{r.student_name}</strong>
                      {r.is_stipend && <span style={{ marginLeft: '6px', background: '#dcfce7', color: '#166534', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>উপবৃত্তি</span>}
                      {r.is_scholarship && <span style={{ marginLeft: '6px', background: '#fef3c7', color: '#b45309', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>মেধাবৃত্তি</span>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 8px' }}>{toBnDigits(r.class_name)}ম</td>
                    <td style={{ textAlign: 'center', padding: '8px 8px', fontWeight: 700 }}>{toBnDigits(r.roll_no)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 8px' }}>{formatMoney(r.gross_total)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 8px', color: '#b45309' }}>{r.discount > 0 ? formatMoney(r.discount) : '—'}</td>
                    <td style={{ textAlign: 'right', padding: '8px 8px', fontWeight: 700, color: '#047857' }}>{formatMoney(r.paid_amount)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 8px', color: r.due_amount > 0 ? '#dc2626' : '#64748b', fontWeight: r.due_amount > 0 ? 700 : 400 }}>
                      {r.due_amount > 0 ? formatMoney(r.due_amount) : '০'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 8px' }}>
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(r)}
                        style={{
                          background: '#047857', color: '#fff', border: 'none', padding: '4px 9px',
                          borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '3px'
                        }}
                        title="দ্বিমুখী মানি রিসিট প্রিন্ট করুন"
                      >
                        🖨️ প্রিন্ট
                      </button>
                    </td>
                  </tr>
                ))}
                {!feeRecords.length && (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      এখনো কোনো ফি আদায়ের রেকর্ড নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: INSTITUTIONAL INCOME LEDGER                        */}
      {/* ========================================================= */}
      {activeTab === 'income' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Form: Add Institutional Income */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #0284c7', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📥</span> নতুন প্রাতিষ্ঠানিক আয় ভাউচার
            </h3>

            {incomeMsg && (
              <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                {incomeMsg}
              </div>
            )}

            <form onSubmit={handleAddIncome} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>আয়ের খাত *</label>
                <select
                  value={newIncome.category}
                  onChange={e => setNewIncome({ ...newIncome, category: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600 }}
                  required
                >
                  {INSTITUTIONAL_INCOME_HEADS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>আয়ের শিরোনাম / বিবরণ *</label>
                <input
                  type="text"
                  placeholder="যেমন: মার্কেট দোকান নং ১ এর সেপ্টেম্বর ভাড়া"
                  value={newIncome.title}
                  onChange={e => setNewIncome({ ...newIncome, title: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>টাকার পরিমাণ *</label>
                  <input
                    type="number"
                    placeholder="যেমন: ১২০০০"
                    value={newIncome.amount}
                    onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#0369a1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>তারিখ *</label>
                  <input
                    type="date"
                    value={newIncome.date}
                    onChange={e => setNewIncome({ ...newIncome, date: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>প্রদানকারীর নাম / উৎস</label>
                  <input
                    type="text"
                    placeholder="ব্যক্তি / প্রতিষ্ঠানের নাম"
                    value={newIncome.payer_name}
                    onChange={e => setNewIncome({ ...newIncome, payer_name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>গ্রহণের মাধ্যম</label>
                  <select
                    value={newIncome.method}
                    onChange={e => setNewIncome({ ...newIncome, method: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="cash">নগদ ক্যাশ</option>
                    <option value="bank">ব্যাংক একাউন্ট</option>
                    <option value="bkash">বিকাশ</option>
                    <option value="check">ব্যাংক চেক / ড্রাফট</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>ভাউচার / মানি রিসিট নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: আয়-২০২৬-০০৪"
                  value={newIncome.voucher_no}
                  onChange={e => setNewIncome({ ...newIncome, voucher_no: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>মন্তব্য</label>
                <input
                  type="text"
                  placeholder="সংক্ষিপ্ত নোট"
                  value={newIncome.note}
                  onChange={e => setNewIncome({ ...newIncome, note: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '7px',
                  fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', marginTop: '6px',
                  boxShadow: '0 2px 6px rgba(2,132,199,0.25)'
                }}
              >
                ➕ আয় ভাউচার সংরক্ষণ করুন
              </button>
            </form>
          </div>

          {/* Right Table: Institutional Income Records */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0369a1' }}>
                  প্রাতিষ্ঠানিক আয়ের খাতা (Income Register)
                </h3>
                <small style={{ color: '#64748b' }}>শিক্ষার্থীদের নিয়মিত ফি বহির্ভূত অন্যান্য আয়সমূহ</small>
              </div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '15px', fontWeight: 700, fontSize: '12px' }}>
                মোট অন্যান্য আয়: {formatMoney(totalOtherIncome)}
              </span>
            </div>

            <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'center', width: '45px' }}>ক্র.</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px' }}>ভাউচার নং</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '85px' }}>তারিখ</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>খাত ও বিবরণ</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '120px' }}>উৎস / প্রদাতা</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '70px' }}>মাধ্যম</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((inc, idx) => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{toBnDigits(idx + 1)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{inc.voucher_no}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{formatDateBn(inc.date)}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <strong style={{ color: '#0f172a' }}>{inc.title}</strong>
                        <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>{inc.category}</small>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155' }}>{inc.payer_name}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{inc.method}</td>
                      <td style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 800, color: '#0369a1' }}>{formatMoney(inc.amount)}</td>
                    </tr>
                  ))}
                  {!incomes.length && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        কোনো আয়ের এন্ট্রি নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: INSTITUTIONAL EXPENSE LEDGER                       */}
      {/* ========================================================= */}
      {activeTab === 'expense' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Form: Add Institutional Expense */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #dc2626', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📤</span> নতুন প্রাতিষ্ঠানিক ব্যয় (খরচ) ভাউচার
            </h3>

            {expenseMsg && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                {expenseMsg}
              </div>
            )}

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>ব্যয়ের খাত *</label>
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600 }}
                  required
                >
                  {INSTITUTIONAL_EXPENSE_HEADS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>ব্যয়ের শিরোনাম / বিবরণ *</label>
                <input
                  type="text"
                  placeholder="যেমন: সেপ্টেম্বর মাসের বিদ্যুৎ বিল পরিশোধ"
                  value={newExpense.title}
                  onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>টাকার পরিমাণ *</label>
                  <input
                    type="number"
                    placeholder="যেমন: ৫৪২০"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#dc2626' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>তারিখ *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>গ্রহীতার নাম / ভেন্ডর</label>
                  <input
                    type="text"
                    placeholder="যেমন: টাঙ্গাইল পল্লী বিদ্যুৎ"
                    value={newExpense.payee_name}
                    onChange={e => setNewExpense({ ...newExpense, payee_name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>পরিশোধ মাধ্যম</label>
                  <select
                    value={newExpense.method}
                    onChange={e => setNewExpense({ ...newExpense, method: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="cash">নগদ ক্যাশ</option>
                    <option value="bank">ব্যাংক একাউন্ট</option>
                    <option value="check">ব্যাংক চেক</option>
                    <option value="bkash">বিকাশ</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>অনুমোদনকারী কর্মকর্তা</label>
                <input
                  type="text"
                  value={newExpense.approved_by}
                  onChange={e => setNewExpense({ ...newExpense, approved_by: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>ভাউচার / বিল নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: ব্যয়-২০২৬-০০৫"
                  value={newExpense.voucher_no}
                  onChange={e => setNewExpense({ ...newExpense, voucher_no: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '7px',
                  fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', marginTop: '6px',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.25)'
                }}
              >
                ➕ ব্যয় ভাউচার সংরক্ষণ করুন
              </button>
            </form>
          </div>

          {/* Right Table: Institutional Expenses Records */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#b91c1c' }}>
                  প্রাতিষ্ঠানিক ব্যয়ের খাতা (Expense Register)
                </h3>
                <small style={{ color: '#64748b' }}>শিক্ষক-কর্মচারী ভাতা, ইউটিলিটি, পরীক্ষা ও যাবতীয় প্রাতিষ্ঠানিক ব্যয়</small>
              </div>
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '5px 12px', borderRadius: '15px', fontWeight: 700, fontSize: '12px' }}>
                মোট ব্যয়: {formatMoney(totalExpense)}
              </span>
            </div>

            <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'center', width: '45px' }}>ক্র.</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px' }}>ভাউচার নং</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '85px' }}>তারিখ</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>খাত ও ব্যয়ের বিবরণ</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '120px' }}>প্রাপক / ভেন্ডর</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '70px' }}>মাধ্যম</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp, idx) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{toBnDigits(idx + 1)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>{exp.voucher_no}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{formatDateBn(exp.date)}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <strong style={{ color: '#0f172a' }}>{exp.title}</strong>
                        <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>{exp.category}</small>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155' }}>{exp.payee_name}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{exp.method}</td>
                      <td style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 800, color: '#dc2626' }}>{formatMoney(exp.amount)}</td>
                    </tr>
                  ))}
                  {!expenses.length && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        কোনো ব্যয়ের এন্ট্রি নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DAILY CASH BOOK & FINANCIAL STATEMENT              */}
      {/* ========================================================= */}
      {activeTab === 'cashbook' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#047857' }}>
                📊 ক্যাশ বুক ও সার্বিক আর্থিক বিবরণী (Daily Cash Register)
              </h3>
              <small style={{ color: '#64748b' }}>বিদ্যালয়ের সকল প্রাপ্তি (জমা) ও প্রদান (খরচ)-এর পূর্ণাঙ্গ হিসাব খাতা</small>
            </div>
            <button
              type="button"
              onClick={handlePrintCashBook}
              style={{
                background: '#047857', color: '#fff', border: 'none', padding: '8px 18px',
                borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              🖨️ পূর্ণাঙ্গ ক্যাশ বুক প্রিন্ট করুন
            </button>
          </div>

          {/* 3 Overview summary banners */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>📥 মোট আয় (ফি + অন্যান্য)</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#047857', margin: '4px 0' }}>{formatMoney(totalGrossIncome)}</div>
              <small style={{ color: '#15803d', fontSize: '11px' }}>শিক্ষার্থী ফি: {formatMoney(totalFeesCollected)} • অনুদান/অন্যান্য: {formatMoney(totalOtherIncome)}</small>
            </div>

            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>📤 মোট প্রাতিষ্ঠানিক ব্যয়</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', margin: '4px 0' }}>{formatMoney(totalExpense)}</div>
              <small style={{ color: '#b91c1c', fontSize: '11px' }}>বেতন, ইউটিলিটি, মেরামত ও পরীক্ষা ব্যয়</small>
            </div>

            <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>🏦 সমাপনী ক্যাশ ব্যালেন্স (Net Surplus)</span>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#1d4ed8', margin: '4px 0' }}>{formatMoney(netBalance)}</div>
              <small style={{ color: '#1e40af', fontSize: '11px' }}>হাতে নগদ ও ব্যাংক আমানতের নীট স্থিতি</small>
            </div>
          </div>

          {/* Cash book Combined Transaction Table */}
          <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '85px' }}>তারিখ</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left', width: '130px' }}>ভাউচার / রসিদ নং</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left' }}>খাত ও বিস্তারিত বিবরণ</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '80px' }}>ধরন</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '75px' }}>মাধ্যম</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', width: '110px' }}>প্রাপ্তি / জমা (টাকা)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', width: '110px' }}>প্রদান / খরচ (টাকা)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...feeRecords.map(f => ({ ...f, txType: 'fee', title: `ফি আদায়: ${f.student_name} (${toBnDigits(f.class_name)}ম শ্রেণি, রোল: ${toBnDigits(f.roll_no)})`, inAmt: f.paid_amount, outAmt: 0 })),
                  ...incomes.map(i => ({ ...i, txType: 'income', inAmt: i.amount, outAmt: 0 })),
                  ...expenses.map(e => ({ ...e, txType: 'expense', inAmt: 0, outAmt: e.amount }))
                ]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((t, idx) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdfe' }}>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{formatDateBn(t.date)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: t.txType === 'expense' ? '#dc2626' : '#047857' }}>
                        {t.receipt_no || t.voucher_no}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <strong style={{ color: '#0f172a' }}>{t.title || t.student_name}</strong>
                        {t.category && <small style={{ display: 'block', color: '#64748b' }}>{t.category}</small>}
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>
                        <span style={{
                          padding: '2px 7px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700,
                          background: t.txType === 'expense' ? '#fee2e2' : '#dcfce7',
                          color: t.txType === 'expense' ? '#991b1b' : '#166534'
                        }}>
                          {t.txType === 'expense' ? 'খরচ' : 'আদায়'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px', color: '#475569' }}>
                        {t.payment_method || t.method}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 800, color: '#047857' }}>
                        {t.inAmt > 0 ? formatMoney(t.inAmt) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 800, color: '#dc2626' }}>
                        {t.outAmt > 0 ? formatMoney(t.outAmt) : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #047857' }}>
                  <td colSpan="5" style={{ textAlign: 'right', padding: '10px' }}>সর্বমোট আয় ও ব্যয়:</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: '#047857', fontSize: '13px' }}>{formatMoney(totalGrossIncome)}</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: '#dc2626', fontSize: '13px' }}>{formatMoney(totalExpense)}</td>
                </tr>
                <tr style={{ background: '#ecfdf5', fontWeight: 900, fontSize: '14px' }}>
                  <td colSpan="5" style={{ textAlign: 'right', padding: '10px', color: '#065f46' }}>সমাপনী নীট ক্যাশ উদ্বৃত্ত (Net Balance):</td>
                  <td colSpan="2" style={{ textAlign: 'right', padding: '10px', color: '#047857' }}>{formatMoney(netBalance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CLASS-WISE FEE SETUP                               */}
      {/* ========================================================= */}
      {activeTab === 'rates' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#047857' }}>
              ⚙️ শ্রেণিভিত্তিক ফি কাঠামো নির্ধারণ (Fee Structure Setup)
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              এখানে নির্ধারিত ফি সমূহ "শিক্ষার্থী ফি আদায়" স্ক্রিনে শ্রেণি নির্বাচনের সাথে সাথে স্বয়ংক্রিয়ভাবে ডিফল্ট রেট হিসেবে লোড হবে।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {['6', '7', '8', '9', '10'].map(cls => {
              const r = classRates[cls] || { tuition: 200, admission: 500, session: 800, exam: 400 };
              return (
                <div key={cls} style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 800, color: '#047857', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    শ্রেণি {toBnDigits(cls)} (Class {cls})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>মাসিক বেতন (টিউশন ফি):</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>৳</span>
                        <input
                          type="number"
                          value={r.tuition || ''}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setClassRates(prev => ({ ...prev, [cls]: { ...prev[cls], tuition: val } }));
                          }}
                          style={{ width: '75px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>ভর্তি ফি:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>৳</span>
                        <input
                          type="number"
                          value={r.admission || ''}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setClassRates(prev => ({ ...prev, [cls]: { ...prev[cls], admission: val } }));
                          }}
                          style={{ width: '75px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>বার্ষিক সেশন / উন্নয়ন ফি:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>৳</span>
                        <input
                          type="number"
                          value={r.session || ''}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setClassRates(prev => ({ ...prev, [cls]: { ...prev[cls], session: val } }));
                          }}
                          style={{ width: '75px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>পরীক্ষার ফি:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>৳</span>
                        <input
                          type="number"
                          value={r.exam || ''}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setClassRates(prev => ({ ...prev, [cls]: { ...prev[cls], exam: val } }));
                          }}
                          style={{ width: '75px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', color: '#166534', fontSize: '12px', fontWeight: 700 }}>
            ✓ সকল পরিবর্তন তাৎক্ষণিকভাবে স্বয়ংক্রিয়ভাবে ব্রাউজারে সংরক্ষিত হচ্ছে।
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CASH RECEIPT VOUCHER PREVIEW & PRINT               */}
      {/* ========================================================= */}
      {activeReceipt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '750px',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
              color: '#ffffff', padding: '14px 20px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🧾</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>ফি আদায়ের মানি রিসিট (Cash Receipt)</h3>
                  <small style={{ opacity: 0.9 }}>রশিদ নং: {activeReceipt.receipt_no}</small>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handlePrintReceipt(activeReceipt)}
                  style={{
                    background: '#ffffff', color: '#047857', border: 'none',
                    padding: '6px 14px', borderRadius: '6px', fontWeight: 800,
                    fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  🖨️ প্রিন্ট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none',
                    width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                    fontSize: '16px', fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Receipt Preview */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ border: '2px solid #047857', borderRadius: '10px', padding: '16px', background: '#fff' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #047857', paddingBottom: '8px', marginBottom: '10px' }}>
                  <img src={schoolLogo} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                  <h2 style={{ margin: '4px 0 2px', fontSize: '18px', color: '#047857', fontWeight: 800 }}>{MOCK_SCHOOL.nameBn}</h2>
                  <h4 style={{ margin: '0 0 2px', fontSize: '12px', color: '#334155' }}>{MOCK_SCHOOL.nameEn} • EIIN: {MOCK_SCHOOL.eiin}</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • স্থাপিত: ১৯৪৬</p>
                </div>

                <div style={{ textAlign: 'center', background: '#ecfdf5', padding: '4px', borderRadius: '4px', border: '1px dashed #059669', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#065f46' }}>ফি আদায়ের মানি রিসিট (MONEY RECEIPT)</h4>
                </div>

                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                  <div><b>রশিদ নম্বর:</b> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>{activeReceipt.receipt_no}</span></div>
                  <div style={{ textAlign: 'right' }}><b>তারিখ:</b> {formatDateBn(activeReceipt.date)} খ্রি.</div>
                  <div><b>শিক্ষার্থীর নাম:</b> <strong>{activeReceipt.student_name}</strong></div>
                  <div style={{ textAlign: 'right' }}><b>Student ID:</b> <span style={{ fontFamily: 'monospace' }}>{activeReceipt.student_id}</span></div>
                  <div><b>শ্রেণি:</b> {toBnDigits(activeReceipt.class_name)}ম • <b>শাখা/গ্রুপ:</b> {activeReceipt.section}</div>
                  <div style={{ textAlign: 'right' }}><b>রোল নম্বর:</b> {toBnDigits(activeReceipt.roll_no)}</div>
                </div>

                {/* Stipend Banner if applicable */}
                {(activeReceipt.is_stipend || activeReceipt.is_scholarship) && (
                  <div style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>
                    🎉 অত্র শিক্ষার্থী {activeReceipt.is_stipend ? 'উপবৃত্তি' : 'মেধাবৃত্তি'} সুবিধাভোগী বিধায় মাসিক বেতন ১০০% মওকুফ।
                  </div>
                )}

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', width: '35px', textAlign: 'center' }}>ক্র.</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>ফি-এর বিবরণ / খাত</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right', width: '120px' }}>পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeReceipt.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', padding: '6px' }}>{toBnDigits(idx + 1)}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>
                          <b>{it.name}</b>
                          {it.note && <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>{it.note}</small>}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px', fontWeight: 700 }}>{formatMoney(it.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px' }}><b>মোট নির্ধারিত পাওনা:</b></td>
                      <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px', fontWeight: 800 }}>{formatMoney(activeReceipt.gross_total)}</td>
                    </tr>
                    {activeReceipt.discount > 0 && (
                      <tr style={{ color: '#b45309' }}>
                        <td colSpan="2" style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px' }}>মওকুফ / ছাড় (প্রধান শিক্ষক কর্তৃক):</td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px', fontWeight: 700 }}>- {formatMoney(activeReceipt.discount)}</td>
                      </tr>
                    )}
                    <tr style={{ background: '#f0fdf4', fontSize: '13px' }}>
                      <td colSpan="2" style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px', color: '#047857' }}><b>সর্বমোট গৃহীত টাকা:</b></td>
                      <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px', color: '#047857', fontWeight: 900 }}>{formatMoney(activeReceipt.paid_amount)}</td>
                    </tr>
                    {activeReceipt.due_amount > 0 && (
                      <tr style={{ color: '#dc2626' }}>
                        <td colSpan="2" style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px' }}>অবশিষ্ট বকেয়া:</td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px', fontWeight: 800 }}>{formatMoney(activeReceipt.due_amount)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', marginBottom: '20px' }}>
                  <b>কথায় (In Words):</b> {numberToWordsBn(activeReceipt.paid_amount)}
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', padding: '0 15px' }}>
                  <div style={{ textAlign: 'center', width: '130px', fontSize: '11px' }}>
                    <div style={{ borderTop: '1px dashed #334155', marginBottom: '4px' }}></div>
                    <span>{activeReceipt.received_by || 'হিসাব সহকারী'}</span>
                    <small style={{ display: 'block', color: '#64748b' }}>আদায়কারীর স্বাক্ষর</small>
                  </div>
                  <div style={{ textAlign: 'center', width: '130px', fontSize: '11px' }}>
                    <div style={{ borderTop: '1px dashed #334155', marginBottom: '4px' }}></div>
                    <span>{MOCK_SCHOOL.headTeacher}</span>
                    <small style={{ display: 'block', color: '#64748b' }}>প্রধান শিক্ষক</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
