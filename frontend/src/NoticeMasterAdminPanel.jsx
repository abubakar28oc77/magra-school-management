import React, { useState, useEffect } from 'react';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';
import { PHOTO_HEAD_TEACHER } from './mockData';
import { requestApi } from './apiClient';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const NOTICE_STORAGE_KEY = 'magra_notices_master_v2';

const DEFAULT_NOTICES = [
  {
    id: 'not-01',
    title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ ২০২৬ এর চূড়ান্ত সময়সূচি ও দিকনির্দেশনা',
    category: 'announcements',
    categoryLabel: '🚨 গুরুত্বপূর্ণ ঘোষণা',
    memo: 'মপা/প্রশা/২০২৬-০৮',
    date: '২০২৬-০২-০১',
    urgent: true,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: `এতদ্বারা মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের সকল শিক্ষক-শিক্ষিকা, শিক্ষার্থী ও সম্মানিত অভিভাবকবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১৫ হতে ১৮ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখ পর্যন্ত বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা ও মনোজ্ঞ সাংস্কৃতিক সপ্তাহ অনুষ্ঠিত হবে।\n\n১. দৌড়, হাইজাম্প, লংজাম্প, ক্রিকেট বল নিক্ষেপ, যেমন খুশি তেমন সাজো সহ মোট ৩২টি ইভেন্টে প্রতিযোগিতা অনুষ্ঠিত হবে।\n২. প্রত্যেক শিক্ষার্থী সর্বোচ্চ ৩টি একক ইভেন্ট এবং ১টি দলীয় ইভেন্টে অংশগ্রহণ করতে পারবে।\n৩. আগামী ১০ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখের মধ্যে নিজ নিজ শ্রেণি শিক্ষকের নিকট নাম তালিকাভুক্ত করতে হবে।\n৪. সমাপনী দিনে প্রধান অতিথি হিসেবে টাঙ্গাইল জেলা শিক্ষা অফিসার মহোদয় উপস্থিত থেকে বিজয়ীদের মাঝে আকর্ষণীয় ট্রফি ও মেডেল বিতরণ করবেন।`,
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
    body: `মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের 'শেখ রাসেল ডিজিটাল ল্যাব' আধুনিকীকরণ এবং শিক্ষার্থীদের আইসিটি শিক্ষার মানোন্নয়নে ১০টি ব্র্যান্ড কম্পিউটার, ৫টি অনলাইন ইউপিএস এবং প্রয়োজনীয় নেটওয়ার্কিং সরঞ্জাম ক্রয়ের লক্ষ্যে প্রকৃত সরবরাহকারী/প্রতিষ্ঠানের নিকট থেকে সীলমোহরকৃত দরপত্র (Tender) আহ্বান করা যাচ্ছে।\n\nক. আগ্রহী দরদাতাগণকে বিদ্যালয়ের অফিস কক্ষ হতে ৫০০/- টাকা নগদ জমা দিয়ে দরপত্র শিডিউল সংগ্রহ করতে হবে।\nখ. শিডিউল বিক্রির শেষ তারিখ: ১৪ ফেব্রুয়ারি ২০২৬ খ্রি.।\nগ. দরপত্র দাখিলের শেষ তারিখ ও সময়: ১৫ ফেব্রুয়ারি ২০২৬ খ্রি. দুপুর ২:০০ ঘটিকা।`,
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
    body: `সরকারি সর্বশেষ বিধি মোতাবেক ও বেসরকারি শিক্ষা প্রতিষ্ঠানের জনবল কাঠামো অনুযায়ী মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ে সম্পূর্ণ অস্থায়ী ভিত্তিতে আকর্ষণীয় ভাতায় নিম্নবর্ণিত পদসমূহে যোগ্য প্রার্থী আবশ্যক:\n\n১. সহকারী শিক্ষক (ভৌত বিজ্ঞান/গণিত) — পদসংখ্যা ০১ জন। শিক্ষাগত যোগ্যতা: সংশ্লিষ্ট বিষয়ে নূন্যতম ২য় শ্রেণির স্নাতক (সম্মান)/সমমান ডিগ্রি।\n২. কম্পিউটার ল্যাব প্রদর্শক / অপারেটর — পদসংখ্যা ০১ জন।\n\nআগ্রহী প্রার্থীদের আগামী ২০ ফেব্রুয়ারি ২০২৬ খ্রি. তারিখের মধ্যে প্রধান শিক্ষক বরাবর আবেদন পৌঁছাতে হবে।`,
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
    body: `বিদ্যালয়ের ৬ষ্ঠ থেকে ১০ম শ্রেণির সকল শিক্ষার্থীর অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১০ মার্চ ২০২৬ খ্রি. হতে ১ম সাময়িক পরীক্ষা শুরু হবে। ২৮ ফেব্রুয়ারি ২০২৬ খ্রি. এর মধ্যে ফি পরিশোধ করে প্রবেশপত্র সংগ্রহ করতে হবে।`,
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
    body: `২০২৬ সালের এসএসসি পরীক্ষায় অংশগ্রহণকারী সকল পরীক্ষার্থীদের জানানো যাচ্ছে যে, বিশেষ মডেল টেস্টের পর আগামী ১০ ফেব্রুয়ারি ২০২৬ খ্রি. সকাল ১০:০০ ঘটিকায় ঢাকা শিক্ষা বোর্ডের মূল প্রবেশপত্র বিতরণ করা হবে।`,
    attachment: 'ssc_model_test_and_admit_notice.pdf'
  },
  {
    id: 'not-06',
    title: 'পবিত্র শব-ই-বরাত উপলক্ষে বিদ্যালয়ের পাঠদান ও দাপ্তরিক কার্যক্রম বন্ধের নোটিশ',
    category: 'holidays',
    categoryLabel: '🌴 ছুটির নোটিশ',
    memo: 'মপা/ছুটি/২০২৬-০৫',
    date: '২০২৬-০১-৩০',
    urgent: false,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: `এতদ্বারা বিদ্যালয়ের শিক্ষক, শিক্ষার্থী ও কর্মচারীদের অবগতির জন্য জানানো যাচ্ছে যে, পবিত্র শব-ই-বরাত উপলক্ষে আগামী ৪ ফেব্রুয়ারি ২০২৬ খ্রি. বুধবার বিদ্যালয়ের সমস্ত শ্রেণি কার্যক্রম বন্ধ থাকবে। পরদিন যথারীতি ক্লাস চলবে।`,
    attachment: 'shab_e_barat_holiday_notice.pdf'
  }
];

export function NoticeMasterAdminPanel({ sub = 'all', setSub }) {
  const [activeTab, setActiveTab] = useState(sub || 'all');
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Editing or Printing states
  const [editingNotice, setEditingNotice] = useState(null);
  const [printingNotice, setPrintingNotice] = useState(null);

  // Form State for New / Edit Notice
  const [formData, setFormData] = useState({
    title: '',
    category: 'announcements',
    categoryLabel: '🚨 গুরুত্বপূর্ণ ঘোষণা',
    memo: `মপা/বিজ্ঞপ্তি/${new Date().getFullYear()}-${Math.floor(Math.random() * 90 + 10)}`,
    date: new Date().toISOString().slice(0, 10),
    deadline: '',
    urgent: false,
    author: 'মুহাম্মদ শফিকুল ইসলাম',
    designation: 'প্রধান শিক্ষক',
    body: '',
    attachment: ''
  });

  // Sync activeTab with incoming prop
  useEffect(() => {
    if (sub && sub !== activeTab) {
      setActiveTab(sub);
    }
  }, [sub]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (setSub) setSub(key);
    if (key === 'new') {
      resetForm();
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Load notices from localStorage
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
      console.warn('LocalStorage save failed:', e);
    }
  };

  const resetForm = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      category: 'announcements',
      categoryLabel: '🚨 গুরুত্বপূর্ণ ঘোষণা',
      memo: `মপা/বিজ্ঞপ্তি/${new Date().getFullYear()}-${Math.floor(Math.random() * 90 + 10)}`,
      date: new Date().toISOString().slice(0, 10),
      deadline: '',
      urgent: false,
      author: 'মুহাম্মদ শফিকুল ইসলাম',
      designation: 'প্রধান শিক্ষক',
      body: '',
      attachment: ''
    });
  };

  const handleEditClick = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || '',
      category: notice.category || 'announcements',
      categoryLabel: notice.categoryLabel || '🚨 গুরুত্বপূর্ণ ঘোষণা',
      memo: notice.memo || '',
      date: notice.date || new Date().toISOString().slice(0, 10),
      deadline: notice.deadline || '',
      urgent: Boolean(notice.urgent),
      author: notice.author || 'মুহাম্মদ শফিকুল ইসলাম',
      designation: notice.designation || 'প্রধান শিক্ষক',
      body: notice.body || '',
      attachment: notice.attachment || ''
    });
    handleTabChange('new');
  };

  const handleDeleteNotice = (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি চিরতরে মুছে ফেলতে চান? এটি মুছে দিলে ভিউ পেজেও নোটিশটি আর প্রদর্শিত হবে না।')) {
      return;
    }
    const updated = notices.filter(n => n.id !== id);
    saveNotices(updated);
    showToast('✓ নোটিশটি সফলভাবে মুছে ফেলা হয়েছে এবং ভিউ পেজে লাইভ আপডেট হয়েছে!');
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('অনুগ্রহ করে নোটিশের শিরোনাম প্রদান করুন!');
      return;
    }

    const catLabels = {
      all: '📢 সাধারণ নোটিশ',
      announcements: '🚨 গুরুত্বপূর্ণ ঘোষণা',
      tenders: '💼 টেন্ডার ও নিয়োগ',
      academic: '📚 একাডেমিক ও পরীক্ষা',
      holidays: '🌴 ছুটির নোটিশ'
    };

    const finalCategoryLabel = catLabels[formData.category] || '📢 সাধারণ নোটিশ';

    if (editingNotice) {
      const updated = notices.map(n => {
        if (n.id === editingNotice.id) {
          return {
            ...n,
            title: formData.title.trim(),
            category: formData.category,
            categoryLabel: finalCategoryLabel,
            memo: formData.memo.trim(),
            date: formData.date,
            deadline: formData.deadline.trim(),
            urgent: formData.urgent,
            author: formData.author.trim(),
            designation: formData.designation.trim(),
            body: formData.body.trim(),
            attachment: formData.attachment.trim()
          };
        }
        return n;
      });
      saveNotices(updated);
      showToast('✓ নোটিশটি সফলভাবে আপডেট হয়েছে এবং ভিউ পেজে লাইভ হালনাগাদ করা হয়েছে!');
    } else {
      const newNotice = {
        id: `not-${Date.now()}`,
        title: formData.title.trim(),
        category: formData.category,
        categoryLabel: finalCategoryLabel,
        memo: formData.memo.trim() || `মপা/বিজ্ঞপ্তি/${new Date().getFullYear()}-${Math.floor(Math.random() * 90 + 10)}`,
        date: formData.date || new Date().toISOString().slice(0, 10),
        deadline: formData.deadline.trim(),
        urgent: formData.urgent,
        author: formData.author.trim() || 'মুহাম্মদ শফিকুল ইসলাম',
        designation: formData.designation.trim() || 'প্রধান শিক্ষক',
        body: formData.body.trim(),
        attachment: formData.attachment.trim() || 'school_official_notice.pdf',
        isCustom: true
      };
      saveNotices([newNotice, ...notices]);
      showToast('✓ চমৎকার! নতুন নোটিশটি সফলভাবে প্রকাশিত হয়েছে এবং ভিউ পেজের সকল সাবমেনুতে সরাসরি যুক্ত হয়েছে!');
    }

    // Try posting to backend API if available
    try {
      requestApi('/notices', {
        method: 'POST',
        body: JSON.stringify({
          title_bn: formData.title.trim(),
          body: formData.body.trim(),
          published: true,
          urgent: formData.urgent
        })
      }).catch(() => {});
    } catch {}

    resetForm();
    handleTabChange('all');
  };

  // Filtered Notices
  const filteredNotices = notices.filter(n => {
    // Tab filter
    if (activeTab === 'announcements' && n.category !== 'announcements' && !n.urgent) return false;
    if (activeTab === 'tenders' && n.category !== 'tenders') return false;
    if (activeTab === 'academic' && n.category !== 'academic') return false;
    if (activeTab === 'holidays' && n.category !== 'holidays') return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        (n.body && n.body.toLowerCase().includes(q)) ||
        (n.memo && n.memo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Print Official School Pad
  const handlePrintPad = (notice) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('পপআপ ব্লকার সক্রিয় আছে, অনুগ্রহ করে ব্রাউজারের পপআপ অনুমতি দিন।');
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>নোটিশ - ${notice.title}</title>
  <style>
    ${SCHOOL_PAD_STYLES}
    body { font-family: 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 25px; color: #0f172a; }
    .pad-container { max-width: 820px; margin: 0 auto; background: #fff; padding: 30px; border: 1.5px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .meta-bar { display: flex; justify-content: space-between; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 24px; font-size: 13.5px; font-weight: 700; color: #1e293b; }
    .notice-headline { text-align: center; margin: 25px 0; }
    .notice-badge { display: inline-block; background: #047857; color: #ffffff; padding: 4px 18px; border-radius: 4px; font-size: 15px; font-weight: 900; letter-spacing: 2px; }
    .notice-title { font-size: 18px; font-weight: 900; margin-top: 14px; color: #0f172a; line-height: 1.4; }
    .notice-body { font-size: 14.5px; line-height: 1.8; color: #334155; text-align: justify; white-space: pre-line; margin-bottom: 50px; }
    .notice-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding-top: 20px; }
    .signature-box { text-align: center; width: 220px; }
    .seal-circle { width: 95px; height: 95px; border: 2.5px dashed #047857; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #047857; text-align: center; margin: 0 auto; font-weight: 700; transform: rotate(-8deg); }
    @media print {
      body { padding: 0; }
      .pad-container { border: none; box-shadow: none; width: 100%; max-width: 100%; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="pad-container">
    ${SCHOOL_PAD_HEADER_HTML}

    <div class="meta-bar">
      <div><b>স্মারক নং:</b> ${notice.memo || 'মপা/প্রশা/২০২৬-০৮'}</div>
      <div><b>তারিখ:</b> ${toBn(notice.date)} খ্রি.</div>
    </div>

    <div class="notice-headline">
      <span class="notice-badge">অফিশিয়াল নোটিশ</span>
      <h2 class="notice-title">${notice.title}</h2>
    </div>

    <div class="notice-body">
      ${notice.body}
      ${notice.deadline ? `\n\n<b>📌 দরখাস্ত/জমাদানের শেষ সময়:</b> ${notice.deadline}` : ''}
    </div>

    <div class="notice-footer">
      <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
        <b>অনুলিপি সদয় অবগতি ও প্রয়োজনীয় ব্যবস্থা গ্রহণে:</b><br/>
        ১. সভাপতি, পরিচালনা পর্ষদ, মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়<br/>
        ২. উপজেলা মাধ্যমিক শিক্ষা অফিসার, কালিহাতী, টাঙ্গাইল<br/>
        ৩. শিক্ষক মিলনায়তন ও শ্রেণি নোটিশবোর্ড<br/>
        ৪. অফিস নথি / ওয়েবসাইট ডিজিটাল সংরক্ষণাগার
      </div>

      <div class="signature-box">
        <div class="seal-circle">
          মগড়া পালস্ ইউনিয়ন<br/>উচ্চ বিদ্যালয়<br/>স্থাপিত: ১৯৪৬ খ্রি.
        </div>
        <div style="border-top: 1.5px solid #0f172a; margin-top: 12px; padding-top: 6px; font-weight: 800; font-size: 13.5px; color: #0f172a;">
          ${notice.author || 'মুহাম্মদ শফিকুল ইসলাম'}<br/>
          <span style="font-size: 12px; font-weight: 600; color: #475569;">${notice.designation || 'প্রধান শিক্ষক'}</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif", color: '#0f172a' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#047857',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          fontSize: '13.5px',
          fontWeight: 800,
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: '15px', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>
            <span>📢</span> নোটিশ ও প্রশাসনিক বিজ্ঞপ্তি প্রকাশ কেন্দ্র (Admin Portal)
          </div>
          <h2 style={{ margin: '2px 0 4px 0', fontSize: '21px', fontWeight: 900 }}>
            নোটিশ ব্যবস্থাপনা ও অফিশিয়াল প্রকাশনা কন্ট্রোল
          </h2>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8' }}>
            এখানে নোটিশ প্রকাশ, সংশোধন বা ডিলিট করলে তা তাৎক্ষণিকভাবে ওয়েবসাইটের নোটিশ মেনুর সংশ্লিষ্ট সাবমেনুতে লাইভ প্রদর্শিত হবে।
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleTabChange('new')}
          style={{
            background: '#059669',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 3px 10px rgba(5,150,105,0.3)'
          }}
        >
          <span>✨</span> + নতুন নোটিশ প্রকাশ করুন
        </button>
      </div>

      {/* Submenu Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        {[
          { key: 'all', label: 'সকল নোটিশ', count: notices.length },
          { key: 'announcements', label: 'গুরুত্বপূর্ণ ঘোষণা', count: notices.filter(n => n.category === 'announcements' || n.urgent).length },
          { key: 'tenders', label: 'টেন্ডার ও নিয়োগ', count: notices.filter(n => n.category === 'tenders').length },
          { key: 'academic', label: 'একাডেমিক ও পরীক্ষা', count: notices.filter(n => n.category === 'academic').length },
          { key: 'holidays', label: 'ছুটির তালিকা ও নোটিশ', count: notices.filter(n => n.category === 'holidays').length },
          { key: 'new', label: editingNotice ? '✏️ নোটিশ সম্পাদনা' : '➕ নতুন নোটিশ ফরম', isAction: true }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                background: isActive ? (tab.isAction ? '#2563eb' : '#047857') : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? 'none' : '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {toBn(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB: NEW / EDIT NOTICE FORM ================= */}
      {activeTab === 'new' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>
              {editingNotice ? '✏️ নোটিশ তথ্য হালনাগাদ ও সম্পাদনা' : '📝 নতুন নোটিশ রচনা ও প্রকাশনা ফরম'}
            </h3>
            {editingNotice && (
              <button
                type="button"
                onClick={resetForm}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                নতুন ফরম খুলুন
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                নোটিশের শিরোনাম / টাইটেল: *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ ২০২৬ এর চূড়ান্ত রুটিন"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  নোটিশ ক্যাটাগরি (যে সাবমেনুতে যাবে):
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                >
                  <option value="announcements">🚨 গুরুত্বপূর্ণ ঘোষণা</option>
                  <option value="tenders">💼 টেন্ডার ও নিয়োগ বিজ্ঞপ্তি</option>
                  <option value="academic">📚 একাডেমিক ও পরীক্ষা নোটিশ</option>
                  <option value="holidays">🌴 ছুটির তালিকা ও নোটিশ</option>
                  <option value="all">📢 সাধারণ নোটিশ</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  স্মারক নং (Memo No):
                </label>
                <input
                  type="text"
                  placeholder="মপা/বিজ্ঞপ্তি/২০২৬-০৮"
                  value={formData.memo}
                  onChange={e => setFormData({ ...formData, memo: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  প্রকাশের তারিখ:
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  আবেদনের শেষ সময় (যদি প্রযোজ্য হয়):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ২০ ফেব্রুয়ারি ২০২৬ (বিকাল ৪:০০)"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  আদেশক্রমে / স্বাক্ষরকারী:
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  পদবী:
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                নোটিশের পূর্ণাঙ্গ বিবরণ / মূল বডি: *
              </label>
              <textarea
                rows="6"
                required
                placeholder="নোটিশের বিস্তারিত বক্তব্য, শর্তাবলী ও নির্দেশনা লিখুন..."
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', lineHeight: '1.6' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', padding: '12px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={formData.urgent}
                  onChange={e => setFormData({ ...formData, urgent: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>🚨 জরুরি নোটিশ হিসেবে চিহ্নিত করুন (ভিউ পেজে লাল অ্যালার্ট দেখাবে)</span>
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '9px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 24px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {editingNotice ? '✓ নোটিশ আপডেট করুন' : '✨ প্রকাশ করুন ও লাইভ সিঙ্ক করুন'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= NOTICE TABLE & DIRECTORY ================= */}
      {activeTab !== 'new' && (
        <div>
          {/* Controls Search & Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="🔍 শিরোনাম, স্মারক বা বিষয় দিয়ে নোটিশ খুঁজুন..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  width: '320px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                প্রদর্শিত নোটিশ: <b>{toBn(filteredNotices.length)}</b> টি
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('আপনি কি নোটিশ তালিকা ডেমো ডেটায় রিস্টোর করতে চান?')) {
                    saveNotices(DEFAULT_NOTICES);
                    showToast('✓ নোটিশ ডেটা রিসেট হয়েছে।');
                  }
                }}
                style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                ⟲ ডেমো রিস্টোর
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '12px 16px', width: '60px' }}>নং</th>
                  <th style={{ padding: '12px 16px', width: '140px' }}>স্মারক ও তারিখ</th>
                  <th style={{ padding: '12px 16px', width: '130px' }}>ক্যাটাগরি</th>
                  <th style={{ padding: '12px 16px' }}>নোটিশ শিরোনাম</th>
                  <th style={{ padding: '12px 16px', width: '130px' }}>স্বাক্ষরকারী</th>
                  <th style={{ padding: '12px 16px', width: '220px', textAlign: 'right' }}>অ্যাকশন / প্রিন্ট</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      কোনো নোটিশ পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((n, idx) => (
                    <tr
                      key={n.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: n.urgent ? '#fffbeb' : '#ffffff',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#64748b' }}>
                        {toBn(idx + 1)}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '12.5px' }}>{n.memo || 'মপা/প্রশা'}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>📅 {toBn(n.date)}</div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: n.urgent ? '#fef2f2' : '#f0fdf4',
                          color: n.urgent ? '#dc2626' : '#166534',
                          border: `1px solid ${n.urgent ? '#fca5a5' : '#bbf7d0'}`,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {n.categoryLabel}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '3px', fontSize: '13.5px' }}>
                          {n.title}
                          {n.urgent && <span style={{ marginLeft: '6px', color: '#dc2626', fontSize: '11px', fontWeight: 900 }}>[জরুরি]</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                          {n.body.length > 90 ? n.body.slice(0, 90) + '...' : n.body}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#334155' }}>{n.author}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{n.designation}</div>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handlePrintPad(n)}
                            title="অফিশিয়াল স্কুল প্যাডে প্রিন্ট করুন"
                            style={{
                              background: '#047857',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '5px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>🖨️</span> প্যাড প্রিন্ট
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditClick(n)}
                            title="সম্পাদনা করুন"
                            style={{
                              background: '#f1f5f9',
                              color: '#1e293b',
                              border: '1px solid #cbd5e1',
                              padding: '6px 10px',
                              borderRadius: '5px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ এডিট
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(n.id)}
                            title="মুছে ফেলুন"
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '5px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default NoticeMasterAdminPanel;
