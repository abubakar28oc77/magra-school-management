import React, { useState, useEffect } from 'react';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';
import { PHOTO_HEAD_TEACHER } from './mockData';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// LocalStorage Key
const NOTICE_STORAGE_KEY = 'magra_notices_master_v2';

// Initial Authentic Notices Data for Magra Palms Union High School
const DEFAULT_NOTICES = [
  {
    id: 'not-01',
    title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ ২০২৬ এর চূড়ান্ত সময়সূচি ও দিকনির্দেশনা',
    category: 'announcements', // 'all', 'announcements', 'tenders', 'academic', 'holidays', 'board'
    categoryLabel: '🚨 গুরুত্বপূর্ণ ঘোষণা',
    memo: 'মপা/প্রশা/২০২৬-০৮',
    date: '২০২৬-০২-০১',
    urgent: true,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: `এতদ্বারা মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের সকল শিক্ষক-শিক্ষিকা, শিক্ষার্থী ও সম্মানিত অভিভাবকবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১৫ হতে ১৮ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখ পর্যন্ত বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা ও মনোজ্ঞ সাংস্কৃতিক সপ্তাহ অনুষ্ঠিত হবে।

১. দৌড়, হাইজাম্প, লংজাম্প, ক্রিকেট বল নিক্ষেপ, যেমন খুশি তেমন সাজো সহ মোট ৩২টি ইভেন্টে প্রতিযোগিতা অনুষ্ঠিত হবে।
২. প্রত্যেক শিক্ষার্থী সর্বোচ্চ ৩টি একক ইভেন্ট এবং ১টি দলীয় ইভেন্টে অংশগ্রহণ করতে পারবে।
৩. আগামী ১০ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখের মধ্যে নিজ নিজ শ্রেণি শিক্ষকের নিকট নাম তালিকাভুক্ত করতে হবে।
৪. সমাপনী দিনে প্রধান অতিথি হিসেবে টাঙ্গাইল জেলা শিক্ষা অফিসার মহোদয় উপস্থিত থেকে বিজয়ীদের মাঝে আকর্ষণীয় ট্রফি ও মেডেল বিতরণ করবেন।`,
    attachment: 'annual_sports_schedule_2026.pdf'
  },
  {
    id: 'not-02',
    title: 'শেখ রাসেল ডিজিটাল ল্যাব আধুনিকীকরণ ও কম্পিউটার সামগ্রী ক্রয়ে উন্মুক্ত দরপত্র (Tender) আহ্বান',
    category: 'tenders',
    categoryLabel: '💼 টেন্ডার ও নিয়োগ',
    memo: 'মপা/টেন্ডার/২০২৬-০৩',
    date: '২০২৬-০১-২৮',
    deadline: '১৫ ফেব্রুয়ারি ২০২৬ (বেলা ২:০০ ঘটিকা)',
    urgent: false,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক ও সভাপতি (ক্রয় কমিটি)',
    body: `মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের 'শেখ রাসেল ডিজিটাল ল্যাব' আধুনিকীকরণ এবং শিক্ষার্থীদের আইসিটি শিক্ষার মানোন্নয়নে ১০টি ব্র্যান্ড কম্পিউটার, ৫টি অনলাইন ইউপিএস এবং প্রয়োজনীয় নেটওয়ার্কিং সরঞ্জাম ক্রয়ের লক্ষ্যে প্রকৃত সরবরাহকারী/প্রতিষ্ঠানের নিকট থেকে সীলমোহরকৃত দরপত্র (Tender) আহ্বান করা যাচ্ছে।

ক. আগ্রহী দরদাতাগণকে বিদ্যালয়ের অফিস কক্ষ হতে ৫০০/- (পাঁচশত) টাকা নগদ জমা দিয়ে দরপত্র শিডিউল সংগ্রহ করতে হবে।
খ. শিডিউল বিক্রির শেষ তারিখ: ১৪ ফেব্রুয়ারি ২০২৬ খ্রি. অফিস চলাকালীন সময় পর্যন্ত।
গ. দরপত্র দাখিলের শেষ তারিখ ও সময়: ১৫ ফেব্রুয়ারি ২০২৬ খ্রি. দুপুর ২:০০ ঘটিকা পর্যন্ত।
ঘ. একই দিন বিকেল ৩:০০ ঘটিকায় দরপত্র মূল্যায়ন কমিটির উপস্থিতিতে দরদাতাদের সামনে খাম খোলা হবে।`,
    attachment: 'tender_schedule_specifications_2026.pdf'
  },
  {
    id: 'not-03',
    title: 'সহকারী শিক্ষক (গণিত ও বিজ্ঞান) এবং ল্যাব প্রদর্শক আবশ্যক — নিয়োগ বিজ্ঞপ্তি ২০২৬',
    category: 'tenders',
    categoryLabel: '💼 টেন্ডার ও নিয়োগ',
    memo: 'মপা/নিয়োগ/২০২৬-০১',
    date: '২০২৬-০১-১৮',
    deadline: '২০ ফেব্রুয়ারি ২০২৬ (বিকাল ৪:০০ ঘটিকা)',
    urgent: true,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক ও সদস্য সচিব (নিয়োগ কমিটি)',
    body: `সরকারি সর্বশেষ বিধি মোতাবেক ও বেসরকারি শিক্ষা প্রতিষ্ঠানের জনবল কাঠামো অনুযায়ী মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ে সম্পূর্ণ অস্থায়ী ভিত্তিতে আকর্ষণীয় ভাতায় নিম্নবর্ণিত পদসমূহে যোগ্য প্রার্থী আবশ্যক:

১. সহকারী শিক্ষক (ভৌত বিজ্ঞান/গণিত) — পদসংখ্যা ০১ জন। শিক্ষাগত যোগ্যতা: সংশ্লিষ্ট বিষয়ে নূন্যতম ২য় শ্রেণির স্নাতক (সম্মান)/সমমান ডিগ্রি।
২. কম্পিউটার ল্যাব প্রদর্শক / অপারেটর — পদসংখ্যা ০১ জন। শিক্ষাগত যোগ্যতা: সরকার অনুমোদিত ইনস্টিটিউট হতে কম্পিউটার বিজ্ঞানে ডিপ্লোমা অথবা এইচএসসি (বিজ্ঞান) সহ ৬ মাসের কম্পিউটার প্রশিক্ষণ।

আগ্রহী প্রার্থীদের শিক্ষাগত যোগ্যতার সত্যায়িত ফটোকপি, ২ কপি পাসপোর্ট সাইজের ছবি, জাতীয় পরিচয়পত্র ও জীবনবৃত্তান্ত সহ আগামী ২০ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখের মধ্যে প্রধান শিক্ষক বরাবর ডাকযোগে বা সরাসরি আবেদন পৌঁছাতে হবে।`,
    attachment: 'recruitment_circular_form_2026.pdf'
  },
  {
    id: 'not-04',
    title: '৬ষ্ঠ হতে ১০ম শ্রেণির ১ম সাময়িক পরীক্ষা ২০২৬ এর চূড়ান্ত রুটিন ও পরীক্ষার ফি পরিশোধ',
    category: 'academic',
    categoryLabel: '📚 একাডেমিক ও পরীক্ষা',
    memo: 'মপা/পরীক্ষা/২০২৬-০৪',
    date: '২০২৬-০১-২৫',
    urgent: false,
    author: 'তাপসী সরকার',
    designation: 'আহ্বায়ক (পরীক্ষা নিয়ন্ত্রণ কমিটি)',
    body: `বিদ্যালয়ের ৬ষ্ঠ থেকে ১০ম শ্রেণির সকল শিক্ষার্থীর অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১০ মার্চ ২০২৬ খ্রি. হতে ১ম সাময়িক পরীক্ষা শুরু হবে।

১. প্রতিদিন সকাল ১০:০০ ঘটিকা হতে দুপুর ০১:০০ ঘটিকা পর্যন্ত পরীক্ষা অনুষ্ঠিত হবে।
২. সকল শিক্ষার্থীকে আগামী ২৮ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখের মধ্যে চলতি মাসের বেতন ও নির্ধারিত পরীক্ষার ফি পরিশোধ করে অফিস কক্ষ থেকে প্রবেশপত্র (Admit Card) সংগ্রহ করতে হবে।
৩. প্রবেশপত্র ব্যতীত কোনো শিক্ষার্থীকে পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।
৪. বিস্তারিত পরীক্ষার বিষয়ভিত্তিক রুটিন বিদ্যালয়ের ওয়েবসাইট এবং প্রতিটি শ্রেণিকক্ষের নোটিশবোর্ডে টাঙিয়ে দেওয়া হয়েছে।`,
    attachment: 'first_terminal_exam_routine_2026.pdf'
  },
  {
    id: 'not-05',
    title: 'এসএসসি পরীক্ষা ২০২৬ এর পরীক্ষার্থীদের বিশেষ মডেল টেস্ট ও প্রবেশপত্র বিতরণ সংক্রান্ত',
    category: 'academic',
    categoryLabel: '📚 একাডেমিক ও পরীক্ষা',
    memo: 'মপা/এসএসসি/২০২৬-০২',
    date: '২০২৬-০১-১২',
    urgent: false,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: `২০২৬ সালের এসএসসি পরীক্ষায় অংশগ্রহণকারী সকল নিয়মিত ও অনিয়মিত পরীক্ষার্থীদের জানানো যাচ্ছে যে, তাদের চূড়ান্ত বোর্ড পরীক্ষার প্রস্তুতি জোরদার করতে আগামী ৫ ফেব্রুয়ারি হতে বিশেষ রিভিশন মডেল টেস্ট অনুষ্ঠিত হবে।

মডেল টেস্টের ফলাফল ঘোষণার পর আগামী ১০ ফেব্রুয়ারি ২০২৬ খ্রি. সকাল ১০:০০ ঘটিকায় বিদ্যালয়ের মিলনায়তনে ঢাকা শিক্ষা বোর্ডের মূল প্রবেশপত্র (Admit Card) ও রেজিস্ট্রেশন কার্ড আনুষ্ঠানিকভাবে বিতরণ করা হবে। সকল পরীক্ষার্থীকে যথাসময়ে উপস্থিত থাকার নির্দেশ দেওয়া হলো।`,
    attachment: 'ssc_model_test_and_admit_notice.pdf'
  },
  {
    id: 'not-06',
    title: 'পবিত্র শব-ই-মিরাজ ও আন্তর্জাতিক মাতৃভাষা দিবস উপলক্ষে বিদ্যালয় ছুটি সংক্রান্ত বিজ্ঞপ্তি',
    category: 'holidays',
    categoryLabel: '🏖️ ছুটির নোটিশ',
    memo: 'মপা/ছুটি/২০২৬-০৫',
    date: '২০২৬-০২-০৫',
    urgent: false,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: `শিক্ষা মন্ত্রণালয় ও মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর কর্তৃক অনুমোদিত শিক্ষাবর্ষ ২০২৬ এর বাৎসরিক ছুটির তালিকা অনুযায়ী:

ক. আগামী ৮ ফেব্রুয়ারি ২০২৬ খ্রি. (রবিবার) পবিত্র শব-ই-মিরাজ উপলক্ষে বিদ্যালয়ের সকল পাঠদান ও দাপ্তরিক কার্যক্রম বন্ধ থাকবে।
খ. আগামী ২১ ফেব্রুয়ারি ২০২৬ খ্রি. (শনিবার) মহান শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস উপলক্ষে শ্রেণি কার্যক্রম বন্ধ থাকবে।

তবে ২১শে ফেব্রুয়ারি সকাল ০৭:০০ ঘটিকায় বিদ্যালয় প্রাঙ্গণে জাতীয় পতাকা অর্ধনমিতকরণ, প্রভাতফেরি এবং শহীদ মিনারে পুষ্পার্ঘ্য অর্পণ ও দোয়া মাহফিল অনুষ্ঠিত হবে। সকল শিক্ষক-শিক্ষার্থী ও কর্মচারীদের যথাসময়ে নির্ধারিত পোশাকে উপস্থিত থাকার জন্য নির্দেশ প্রদান করা হলো।`,
    attachment: 'shaheed_day_holiday_circular.pdf'
  },
  {
    id: 'not-07',
    title: 'পবিত্র মাহে রমজান ও ঈদুল ফিতর উপলক্ষে বিদ্যালয় অবকাশকালীন সাধারণ বিজ্ঞপ্তি',
    category: 'holidays',
    categoryLabel: '🏖️ ছুটির নোটিশ',
    memo: 'মপা/ছুটি/২০২৬-০৬',
    date: '২০২৬-০২-১০',
    urgent: false,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: `পবিত্র মাহে রমজান, জুমাতুল বিদা, শব-ই-কদর ও ঈদুল ফিতর উপলক্ষে আগামী ১৮ মার্চ হতে ৫ এপ্রিল ২০২৬ খ্রি. তারিখ পর্যন্ত বিদ্যালয়ের সকল শ্রেণির পাঠদান কার্যক্রম বন্ধ থাকবে।

ছুটিকালীন সময়ে শিক্ষার্থীদের নিজ নিজ সিলেবাস অনুযায়ী বাড়িতে নিয়মিত অধ্যয়ন করার এবং ছুটির নির্ধারিত অ্যাসাইনমেন্ট সম্পন্ন করার পরামর্শ দেওয়া হলো। আগামী ৬ এপ্রিল ২০২৬ খ্রি. যথারীতি সকাল ৯:০০ ঘটিকা হতে বিদ্যালয়ের নিয়মিত পাঠদান আরম্ভ হবে। অফিস বিভাগ প্রয়োজনীয় প্রশাসনিক প্রয়োজনে ছুটির মধ্যে আংশিক খোলা থাকবে।`,
    attachment: 'ramadan_and_eid_holiday_notice.pdf'
  },
  {
    id: 'not-08',
    title: 'বিদ্যালয় পরিচালনা কমিটির সাধারণ নির্বাচনের চূড়ান্ত খসড়া ভোটার তালিকা প্রকাশ ও আপত্তি দাখিল',
    category: 'announcements',
    categoryLabel: '🚨 গুরুত্বপূর্ণ ঘোষণা',
    memo: 'মপা/নির্বাচন/২০২৬-০১',
    date: '২০২৬-০১-২০',
    urgent: true,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক ও প্রিজাইডিং অফিসার',
    body: `মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের পরবর্তী মেয়াদের পরিচালনা কমিটি (Managing Committee) গঠনের লক্ষ্যে ৬ষ্ঠ হতে ১০ম শ্রেণিতে অধ্যয়নরত শিক্ষার্থীদের বৈধ অভিভাবকদের চূড়ান্ত খসড়া ভোটার তালিকা প্রণয়ন করা হয়েছে।

উক্ত খসড়া তালিকা বিদ্যালয়ের প্রশাসনিক ভবনের নোটিশবোর্ড এবং ডিজিটাল ওয়েব পোর্টালে সর্বসাধারণের প্রদর্শনের জন্য উন্মুক্ত করা হলো। তালিকায় কোনো অভিভাবকের নাম, সন্তানের নাম, শ্রেণি বা ঠিকানা সংক্রান্ত ত্রুটি থাকলে বিজ্ঞপ্তি প্রকাশের ১৫ কর্মদিবসের মধ্যে প্রয়োজনীয় প্রমাণাদিসহ প্রধান শিক্ষক বরাবর লিখিত আবেদন দাখিল করতে হবে। নির্ধারিত সময়ের পর কোনো আপত্তি গ্রহণযোগ্য হবে না।`,
    attachment: 'voter_list_draft_2026.pdf'
  }
];

export function NoticeMasterModalSection({ initialTab = 'all', initialTitle, onClose }) {
  // Map incoming key to tab
  const getTabFromKey = (key, title) => {
    if (!key && !title) return 'all';
    const k = String(key || '').toLowerCase();
    const t = String(title || '').toLowerCase();
    if (k.includes('announcement') || t.includes('ঘোষণা')) return 'announcements';
    if (k.includes('tender') || t.includes('টেন্ডার') || t.includes('নিয়োগ')) return 'tenders';
    if (k.includes('academic') || t.includes('একাডেমিক') || t.includes('পরীক্ষা')) return 'academic';
    if (k.includes('holiday') || t.includes('ছুটি')) return 'holidays';
    if (k.includes('board') || t.includes('আর্কাইভ') || t.includes('বোর্ড')) return 'board';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromKey(initialTab, initialTitle));
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // New Notice Form State
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    category: 'announcements',
    memo: `মপা/বিজ্ঞপ্তি/${new Date().getFullYear()}-${toBn(Math.floor(10 + Math.random() * 90))}`,
    date: new Date().toISOString().slice(0, 10),
    deadline: '',
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: '',
    urgent: false,
    attachment: ''
  });

  // Load Notices from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTICE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotices(parsed);
          return;
        }
      }
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(DEFAULT_NOTICES));
      setNotices(DEFAULT_NOTICES);
    } catch {
      setNotices(DEFAULT_NOTICES);
    }
  }, []);

  const saveNotices = (updated) => {
    setNotices(updated);
    try {
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Notice save failed:', e);
    }
  };

  // Filter Notices based on activeTab and searchTerm
  const filteredNotices = notices.filter(n => {
    if (activeTab === 'announcements' && n.category !== 'announcements' && !n.urgent) return false;
    if (activeTab === 'tenders' && n.category !== 'tenders') return false;
    if (activeTab === 'academic' && n.category !== 'academic') return false;
    if (activeTab === 'holidays' && n.category !== 'holidays') return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchBody = (n.body || '').toLowerCase().includes(q);
      const matchMemo = (n.memo || '').toLowerCase().includes(q);
      return matchTitle || matchBody || matchMemo;
    }
    return true;
  });

  // Print Official Notice on School Pad
  const handlePrintOfficialNotice = (notice) => {
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('পপআপ উইন্ডো ব্লক হয়েছে। অনুগ্রহ করে ব্রাউজারে পপআপ অনুমোদন করুন।');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>অফিসিয়াল বিজ্ঞপ্তি — ${notice.title}</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 10mm 15mm 15mm 15mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Nikosh', sans-serif; color: #0f172a; margin: 0; padding: 15px; }
          .pad-container { border: 2px solid #047857; padding: 25px 35px; border-radius: 8px; position: relative; }
          .memo-date-bar { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding: 8px 0; margin-top: 15px; font-size: 13.5px; font-weight: bold; }
          .notice-badge { text-align: center; margin: 25px 0 15px; }
          .notice-badge span { background: #047857; color: #fff; padding: 6px 30px; font-size: 18px; font-weight: 900; border-radius: 4px; letter-spacing: 1px; display: inline-block; }
          .notice-subject { font-size: 17px; font-weight: 900; color: #0f172a; margin-bottom: 20px; line-height: 1.6; border-left: 4px solid #047857; padding-left: 12px; }
          .notice-body { font-size: 14.5px; line-height: 2.0; color: #1e293b; text-align: justify; white-space: pre-wrap; margin-bottom: 40px; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }
          .signature-box { text-align: center; min-width: 200px; }
          .signature-line { border-top: 1.5px dashed #0f172a; margin-bottom: 6px; }
          .seal-box { border: 1.5px dashed #047857; color: #047857; padding: 10px 18px; font-size: 11px; font-weight: bold; border-radius: 50%; transform: rotate(-8deg); display: inline-block; }
          .pad-footer { border-top: 1px solid #cbd5e1; margin-top: 30px; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="pad-container">
          ${SCHOOL_PAD_HEADER_HTML}

          <div class="memo-date-bar">
            <div>স্মারক নং: <b>${notice.memo || 'মপা/বিজ্ঞপ্তি/২০২৬-০৮'}</b></div>
            <div>তারিখ: <b>${notice.date} খ্রি.</b></div>
          </div>

          <div class="notice-badge">
            <span>অফিসিয়াল বিজ্ঞপ্তি</span>
          </div>

          <div class="notice-subject">
            বিষয়: ${notice.title}
          </div>

          <div class="notice-body">${notice.body}</div>

          ${notice.deadline ? `
            <div style="background: #fef2f2; border: 1.5px solid #f87171; padding: 10px 16px; border-radius: 6px; font-size: 13.5px; color: #991b1b; margin-bottom: 25px;">
              ⏰ <b>আবেদন/দরপত্র জমাদানের চূড়ান্ত সময়সীমা:</b> ${notice.deadline}
            </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div class="seal-box">
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়<br>
                স্থাপিত: ১৯৪৬ খ্রি.<br>
                কালিহাতী, টাঙ্গাইল
              </div>
            </div>

            <div class="signature-box">
              <div class="signature-line"></div>
              <div style="font-size: 14.5px; font-weight: 800;">(${notice.author || 'মুহাম্মদ শফিকুল ইসলাম'})</div>
              <div style="font-size: 12.5px; color: #475569;">${notice.designation || 'প্রধান শিক্ষক'}</div>
              <div style="font-size: 12px; color: #64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
            </div>
          </div>

          <div class="pad-footer">
            <div>অনুলিপি অবগতির জন্য প্রেরিত হলো: ১. সভাপতি, গভর্নিং বডি ২. নোটিশবোর্ড ৩. সংশ্লিষ্ট সকল নথি।</div>
            <div>স্মার্ট স্কুল ম্যানেজমেন্ট সিস্টেম ও ডিজিটাল আর্কাইভ</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Handle Publish New Notice
  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!newNoticeForm.title.trim() || !newNoticeForm.body.trim()) {
      alert('অনুগ্রহ করে নোটিশের শিরোনাম ও বিস্তারিত বিবরণ পূরণ করুন।');
      return;
    }

    const catLabels = {
      announcements: '🚨 গুরুত্বপূর্ণ ঘোষণা',
      tenders: '💼 টেন্ডার ও নিয়োগ',
      academic: '📚 একাডেমিক ও পরীক্ষা',
      holidays: '🏖️ ছুটির নোটিশ',
      board: '📋 সাধারণ নোটিশ'
    };

    const newObj = {
      id: `not-${Date.now()}`,
      title: newNoticeForm.title.trim(),
      category: newNoticeForm.category,
      categoryLabel: catLabels[newNoticeForm.category] || '📋 সাধারণ নোটিশ',
      memo: newNoticeForm.memo.trim() || `মপা/বিজ্ঞপ্তি/${new Date().getFullYear()}-${toBn(Math.floor(100 + Math.random() * 900))}`,
      date: newNoticeForm.date || new Date().toISOString().slice(0, 10),
      deadline: newNoticeForm.deadline.trim(),
      urgent: newNoticeForm.urgent,
      author: newNoticeForm.author.trim() || 'মুহাম্মদ শফিকুল ইসলাম',
      designation: newNoticeForm.designation.trim() || 'প্রধান শিক্ষক',
      body: newNoticeForm.body.trim(),
      attachment: newNoticeForm.attachment.trim() || 'official_notice_document.pdf'
    };

    const updated = [newObj, ...notices];
    saveNotices(updated);
    setShowPublishModal(false);
    setSelectedNotice(newObj);
    alert('অভিনন্দন! নতুন বিজ্ঞপ্তিটি সফলভাবে প্রকাশিত হয়েছে।');
  };

  // Notice Tabs Config
  const NOTICE_TABS = [
    { key: 'all', label: 'সকল নোটিশ', icon: '📋', count: notices.length },
    { key: 'announcements', label: 'গুরুত্বপূর্ণ ঘোষণা', icon: '🚨', count: notices.filter(n => n.category === 'announcements' || n.urgent).length },
    { key: 'tenders', label: 'টেন্ডার ও নিয়োগ বিজ্ঞপ্তি', icon: '💼', count: notices.filter(n => n.category === 'tenders').length },
    { key: 'academic', label: 'একাডেমিক ও পরীক্ষা নোটিশ', icon: '📚', count: notices.filter(n => n.category === 'academic').length },
    { key: 'holidays', label: 'ছুটির তালিকা ও নোটিশ', icon: '🏖️', count: notices.filter(n => n.category === 'holidays').length },
    { key: 'board', label: 'ডিজিটাল নোটিশবোর্ড ও ই-আর্কাইভ', icon: '🖥️', count: notices.length }
  ];

  return (
    <div style={{ padding: '4px' }}>
      {/* TOP HEADER BAR */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '12px',
        marginBottom: '16px',
        boxShadow: '0 4px 15px rgba(4,120,87,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            📢
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#dcfce7', color: '#14532d', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                অফিসিয়াল নোটিশ ম্যানেজমেন্ট ও ডিজিটাল আর্কাইভ
              </span>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>শিক্ষাবর্ষ ২০২৬</span>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900 }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — নোটিশবোর্ড
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            style={{
              background: '#fbbf24',
              color: '#78350f',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <span>✨</span> + নতুন নোটিশ প্রকাশ করুন
          </button>
        </div>
      </div>

      {/* MARQUEE URGENT TICKER */}
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '8px 14px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{
          background: '#dc2626',
          color: '#ffffff',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          জরুরি নোটিশ
        </span>
        <marquee style={{ fontSize: '13px', color: '#991b1b', fontWeight: 700 }}>
          {notices.find(n => n.urgent)?.title || notices[0]?.title || 'বিদ্যালয়ের সকল নোটিশ ও হালনাগাদ তথ্য এখানে প্রদর্শিত হচ্ছে।'}
        </marquee>
      </div>

      {/* SUBMENU DIRECTORY TABS */}
      <div style={{
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NOTICE_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setSelectedNotice(null); }}
                style={{
                  flex: '1 1 auto',
                  minWidth: '160px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: isActive ? '#dcfce7' : '#ffffff',
                  color: isActive ? '#065f46' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(4, 120, 87, 0.15)' : 'none'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? '#059669' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#475569',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {toBn(tab.count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="বিজ্ঞপ্তির শিরোনাম, বিষয় বা স্মারক নং দিয়ে খুঁজুন..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '15px', color: '#94a3b8' }}>🔍</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 700 }}>
            মোট প্রদর্শিত বিজ্ঞপ্তি: <b>{toBn(filteredNotices.length)}</b> টি
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* NOTICES LIST OR BOARD VIEW */}
      {filteredNotices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#475569' }}>কোনো নোটিশ পাওয়া যায়নি</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            উপরের 'নতুন নোটিশ প্রকাশ করুন' বোতামে ক্লিক করে নতুন বিজ্ঞপ্তি যোগ করতে পারেন।
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              style={{
                background: '#ffffff',
                border: notice.urgent ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderLeft: notice.urgent ? '6px solid #dc2626' : '6px solid #059669',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: notice.urgent ? '#fee2e2' : '#f1f5f9',
                    color: notice.urgent ? '#b91c1c' : '#475569',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 800
                  }}>
                    {notice.categoryLabel || 'নোটিশ'}
                  </span>

                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    স্মারক: <b>{notice.memo || 'মপা/বিজ্ঞপ্তি'}</b>
                  </span>

                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    📅 {notice.date}
                  </span>
                </div>

                {notice.urgent && (
                  <span style={{ background: '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                    জরুরি
                  </span>
                )}
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a', lineHeight: '1.5' }}>
                {notice.title}
              </h3>

              <p style={{
                margin: '0 0 12px 0',
                fontSize: '13.5px',
                color: '#334155',
                lineHeight: '1.7',
                display: '-webkit-box',
                WebkitLineClamp: selectedNotice?.id === notice.id ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {notice.body}
              </p>

              {notice.deadline && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', color: '#92400e', marginBottom: '10px', display: 'inline-block' }}>
                  ⏰ <b>আবেদনের শেষ সময়:</b> {notice.deadline}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '10px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  স্বাক্ষরিত: <b>{notice.author || 'মুহাম্মদ শফিকুল ইসলাম'}</b> ({notice.designation || 'প্রধান শিক্ষক'})
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(selectedNotice?.id === notice.id ? null : notice)}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {selectedNotice?.id === notice.id ? 'সংক্ষিপ্ত করুন' : 'বিস্তারিত পড়ুন ⬇️'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintOfficialNotice(notice)}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>🖨️</span> অফিসিয়াল প্যাডে প্রিন্ট
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: PUBLISH NEW NOTICE ================= */}
      {showPublishModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 99999,
          padding: '16px'
        }} onClick={() => setShowPublishModal(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            borderTop: '5px solid #059669',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPublishModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                নোটিশ এন্ট্রি ও প্রকাশনা ফরম
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>
                ✨ নতুন অফিশিয়াল বিজ্ঞপ্তি প্রকাশ করুন
              </h3>
            </div>

            <form onSubmit={handlePublishSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  বিজ্ঞপ্তির শিরোনাম / বিষয় *
                </label>
                <input
                  type="text"
                  required
                  value={newNoticeForm.title}
                  onChange={e => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                  placeholder="যেমন: পবিত্র ঈদুল ফিতর উপলক্ষে বিদ্যালয় ছুটি সংক্রান্ত"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    ক্যাটাগরি
                  </label>
                  <select
                    value={newNoticeForm.category}
                    onChange={e => setNewNoticeForm({ ...newNoticeForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
                  >
                    <option value="announcements">🚨 গুরুত্বপূর্ণ ঘোষণা</option>
                    <option value="tenders">💼 টেন্ডার ও নিয়োগ বিজ্ঞপ্তি</option>
                    <option value="academic">📚 একাডেমিক ও পরীক্ষার নোটিশ</option>
                    <option value="holidays">🏖️ ছুটির তালিকা ও নোটিশ</option>
                    <option value="board">📋 সাধারণ নোটিশবোর্ড</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    স্মারক নং
                  </label>
                  <input
                    type="text"
                    value={newNoticeForm.memo}
                    onChange={e => setNewNoticeForm({ ...newNoticeForm, memo: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={newNoticeForm.date}
                    onChange={e => setNewNoticeForm({ ...newNoticeForm, date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    আবেদনের শেষ সময় (যদি থাকে)
                  </label>
                  <input
                    type="text"
                    value={newNoticeForm.deadline}
                    onChange={e => setNewNoticeForm({ ...newNoticeForm, deadline: e.target.value })}
                    placeholder="যেমন: ১৫ মার্চ ২০২৬"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  বিজ্ঞপ্তির পূর্ণাঙ্গ বিবরণ *
                </label>
                <textarea
                  rows="6"
                  required
                  value={newNoticeForm.body}
                  onChange={e => setNewNoticeForm({ ...newNoticeForm, body: e.target.value })}
                  placeholder="বিজ্ঞপ্তির সম্পূর্ণ বর্ণনা, নিয়মাবলী ও নির্দেশনা এখানে লিখুন..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.6', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="urgentNoticeToggle"
                  checked={newNoticeForm.urgent}
                  onChange={e => setNewNoticeForm({ ...newNoticeForm, urgent: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="urgentNoticeToggle" style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>
                  🚨 এটি একটি 'জরুরি নোটিশ' হিসেবে টপ ব্যানারে প্রদর্শন করুন
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '9px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}
                >
                  ✓ প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeMasterModalSection;

