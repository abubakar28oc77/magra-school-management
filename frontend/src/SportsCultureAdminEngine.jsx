import React, { useState, useEffect } from 'react';
import { MOCK_TEACHERS, MOCK_STUDENTS } from './mockData';
import { requestApi } from './apiClient';

const STORAGE_KEY = 'magra_sports_culture_admin_v2';

// Initial preloaded authentic data for all 4 domains
const INITIAL_DATA = {
  sports: [
    {
      id: 'sp-2026-001',
      title: '১০০ মিটার দৌড় (স্প্রিন্ট)',
      group: 'গ-গ্রুপ (৯ম-১০ম)',
      gender: 'বালক',
      date: '২০২৬-০১-২৮',
      venue: 'বিদ্যালয় খেলার মাঠ',
      status: 'completed',
      teacherInCharge: 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)',
      assistantTeachers: 'মোঃ রফিকুল ইসলাম ও মোঃ আমিনুল হক',
      participants: [
        { name: 'তানভীর আহমেদ', class_name: '১০ম', roll_no: '১', house: 'পদ্মা হাউজ', chestNo: '১০১' },
        { name: 'আরিফুল ইসলাম', class_name: '১০ম', roll_no: '৫', house: 'মেঘনা হাউজ', chestNo: '১০৫' },
        { name: 'সাকিব আল হাসান', class_name: '৯ম', roll_no: '১২', house: 'যমুনা হাউজ', chestNo: '১০৯' },
        { name: 'নাঈমুল ইসলাম', class_name: '১০ম', roll_no: '৬', house: 'কর্ণফুলী হাউজ', chestNo: '১১২' }
      ],
      result: {
        first: { name: 'তানভীর আহমেদ', class_name: '১০ম', roll_no: '১', house: 'পদ্মা হাউজ', timing: '১১.৮ সেকেন্ড', points: 5 },
        second: { name: 'আরিফুল ইসলাম', class_name: '১০ম', roll_no: '৫', house: 'মেঘনা হাউজ', timing: '১২.১ সেকেন্ড', points: 3 },
        third: { name: 'সাকিব আল হাসান', class_name: '৯ম', roll_no: '১২', house: 'যমুনা হাউজ', timing: '১২.৪ সেকেন্ড', points: 1 },
        remarks: 'তানভীর আহমেদ নতুন বিদ্যালয় রেকর্ড সৃষ্টি করেছে।'
      }
    },
    {
      id: 'sp-2026-002',
      title: 'উচ্চ লম্ফ (হাই জাম্প)',
      group: 'গ-গ্রুপ (৯ম-১০ম)',
      gender: 'বালক',
      date: '২০২৬-০১-২৮',
      venue: 'বিদ্যালয় খেলার মাঠ (উচ্চ লম্ফ পিট)',
      status: 'completed',
      teacherInCharge: 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)',
      assistantTeachers: 'মোঃ হাবিবুর রহমান',
      participants: [
        { name: 'নাঈমুল ইসলাম', class_name: '১০ম', roll_no: '৬', house: 'কর্ণফুলী হাউজ', chestNo: '১১২' },
        { name: 'সাকিব আহমেদ', class_name: '১০ম', roll_no: '৯', house: 'পদ্মা হাউজ', chestNo: '১০২' },
        { name: 'শামীম রেজা', class_name: '৯ম', roll_no: '৭', house: 'মেঘনা হাউজ', chestNo: '১০৭' }
      ],
      result: {
        first: { name: 'নাঈমুল ইসলাম', class_name: '১০ম', roll_no: '৬', house: 'কর্ণফুলী হাউজ', timing: '৫ ফুট ৪ ইঞ্চি', points: 5 },
        second: { name: 'সাকিব আহমেদ', class_name: '১০ম', roll_no: '৯', house: 'পদ্মা হাউজ', timing: '৫ ফুট ২ ইঞ্চি', points: 3 },
        third: { name: 'শামীম রেজা', class_name: '৯ম', roll_no: '৭', house: 'মেঘনা হাউজ', timing: '৫ ফুট ০ ইঞ্চি', points: 1 },
        remarks: 'অ্যাথলেটদের নৈপুণ্য ছিল অত্যন্ত প্রশংসনীয়।'
      }
    },
    {
      id: 'sp-2026-003',
      title: 'যেমন খুশি তেমন সাজো',
      group: 'উন্মুক্ত (সকল শ্রেণি)',
      gender: 'উভয়',
      date: '২০২৬-০১-২৯',
      venue: 'বিদ্যালয় মুক্তমঞ্চ ও চত্বর',
      status: 'completed',
      teacherInCharge: 'মোঃ রফিকুল ইসলাম (সিনিয়র শিক্ষক)',
      assistantTeachers: 'মোসাঃ নাসরিন আক্তার ও তাপসী সরকার',
      participants: [
        { name: 'তাহমিদ ইসলাম', class_name: '৭ম', roll_no: '২', house: 'পদ্মা হাউজ', chestNo: '২০১' },
        { name: 'আয়েশা আক্তার', class_name: '৮ম', roll_no: '৪', house: 'মেঘনা হাউজ', chestNo: '২০৫' },
        { name: 'তাহসিন আহমেদ', class_name: '৯ম', roll_no: '৮', house: 'যমুনা হাউজ', chestNo: '২০৯' }
      ],
      result: {
        first: { name: 'তাহমিদ ইসলাম (বীরশ্রেষ্ঠ মতিউর রহমান)', class_name: '৭ম', roll_no: '২', house: 'পদ্মা হাউজ', timing: '১ম স্থান', points: 5 },
        second: { name: 'আয়েশা আক্তার (রোকেয়া সাখাওয়াত হোসেন)', class_name: '৮ম', roll_no: '৪', house: 'মেঘনা হাউজ', timing: '২য় স্থান', points: 3 },
        third: { name: 'তাহসিন আহমেদ (পল্লি কবি জসিমউদ্দীন)', class_name: '৯ম', roll_no: '৮', house: 'যমুনা হাউজ', timing: '৩য় স্থান', points: 1 },
        remarks: 'ঐতিহাসিক চরিত্র রূপায়ণে শিক্ষার্থীরা অসাধারণ মেধার স্বাক্ষর রেখেছে।'
      }
    }
  ],
  culture: [
    {
      id: 'cul-2026-001',
      title: 'পহেলা বৈশাখ ও বাংলা নববর্ষ ১৪৩৩ উদযাপন',
      category: 'লোকসংস্কৃতি ও বৈশাখী উৎসব',
      date: '২০২৬-০৪-১৪',
      venue: 'বিদ্যালয় মুক্তমঞ্চ ও বকুলতলা',
      status: 'completed',
      convener: 'মোঃ আব্দুল খালেক (সহকারী শিক্ষক, বাংলা)',
      assistantTeachers: 'মোসাঃ নাসরিন আক্তার ও তাপসী সরকার',
      chiefGuest: 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ',
      participants: [
        { name: 'ফারজানা আক্তার তিশা', class_name: '১০ম', roll_no: '৩', segment: 'দেশাত্মবোধক গান', itemTitle: 'একটি বাংলাদেশ তুমি জাগ্রত জনতার', award: '১ম স্থান (স্বর্ণ)' },
        { name: 'আনিকা তাবাসসুম', class_name: '৯ম', roll_no: '৭', segment: 'রবীন্দ্র সঙ্গীত', itemTitle: 'আনন্দলোকে মঙ্গলালোকে', award: '১ম স্থান' },
        { name: 'সাদিয়া ইসলাম ও নৃত্যদল', class_name: '৮ম', roll_no: 'দলীয়', segment: 'লোকনৃত্য', itemTitle: 'সোহাগ চাঁদ বদনী ধনী', award: 'সেরা নৃত্য দল' }
      ],
      highlights: 'বর্ণাঢ্য মঙ্গল শোভাযাত্রা, লোকসঙ্গীত আসর, বৈশাখী নৃত্য ও গ্রামীণ মেলা।'
    },
    {
      id: 'cul-2026-002',
      title: '১৬ই ডিসেম্বর মহান বিজয় দিবস ও মুক্তিযুদ্ধ নাটক',
      category: 'জাতীয় দিবস ও নাট্যোৎসব',
      date: '২০২৬-১২-১৬',
      venue: 'বিদ্যালয় কেন্দ্রীয় অডিটোরিয়াম',
      status: 'completed',
      convener: 'মোঃ আশরাফুল আলম (সহকারী শিক্ষক, ইংরেজি)',
      assistantTeachers: 'মোঃ রফিকুল ইসলাম ও মোঃ শাহিন মিয়া',
      chiefGuest: 'উপজেলা নির্বাহী অফিসার',
      participants: [
        { name: 'নাট্যদল "অপরাজেয়"', class_name: '৯ম-১০ম', roll_no: '১২ জন', segment: 'একাঙ্ক নাটক', itemTitle: 'রক্তাক্ত একাত্তর', award: 'বিশেষ জুরি সম্মাননা' },
        { name: 'তাহমিদ ইসলাম', class_name: '১০ম', roll_no: '১', segment: 'কবিতা আবৃত্তি', itemTitle: 'বিদ্রোহী (কাজী নজরুল ইসলাম)', award: '১ম স্থান' }
      ],
      highlights: 'বীর মুক্তিযোদ্ধাদের সংবর্ধনা, মুক্তিযুদ্ধভিত্তিক নাটক এবং সমবেত জাতীয় সঙ্গীত।'
    }
  ],
  achievements: [
    {
      id: 'ach-2026-001',
      title: 'উপজেলা আন্তঃবিদ্যালয় ফুটবল টুর্নামেন্ট চ্যাম্পিয়ন',
      category: 'ক্রীড়া',
      badge: 'স্বর্ণপদক 🏆',
      year: '২০২৫-২৬',
      level: 'উপজেলা পর্যায়',
      guideTeacher: 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)',
      team: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় ফুটবল একাদশ',
      recipientNames: 'তানভীর আহমেদ (অধিনায়ক), আরিফুল ইসলাম, মেহেদী হাসান ও একাদশ',
      details: 'ফাইনালে ২-০ গোলে চ্যাম্পিয়ন হওয়ার গৌরব অর্জন। টুর্নামেন্টের সেরা খেলোয়াড় ও গোলদাতা তানভীর আহমেদ (১০ম শ্রেণি)।'
    },
    {
      id: 'ach-2026-002',
      title: 'জাতীয় সৃজনশীল মেধা অন্বেষণ প্রতিযোগিতা (বিজ্ঞান)',
      category: 'বিজ্ঞান ও অলিম্পিয়াড',
      badge: 'রানার্স-আপ 🥈',
      year: '২০২৫',
      level: 'জেলা পর্যায়',
      guideTeacher: 'মোঃ হাবিবুর রহমান (সিনিয়র বিজ্ঞান শিক্ষক)',
      team: 'রাকিবুল হাসান (১০ম শ্রেণি)',
      recipientNames: 'রাকিবুল হাসান',
      details: 'পরিবেশবান্ধব সৌরশক্তিচালিত কৃষি সেচ প্রকল্প উপস্থাপন করে টাঙ্গাইল জেলা পর্যায়ে ২য় স্থান অর্জন।'
    },
    {
      id: 'ach-2026-003',
      title: 'টাঙ্গাইল জেলা আন্তঃস্কুল বিতর্ক উৎসব চ্যাম্পিয়নশিপ',
      category: 'বিতর্ক ও সাহিত্য',
      badge: 'চ্যাম্পিয়ন ট্রফি 🏆',
      year: '২০২৬',
      level: 'জেলা পর্যায়',
      guideTeacher: 'মোঃ আশরাফুল আলম (প্রধান বিতর্ক প্রশিক্ষক)',
      team: 'মগড়া পালস্ ডিবেটিং ক্লাব',
      recipientNames: 'ফারহানা ইয়াসমিন (শ্রেষ্ঠ বক্তা), তানভীর আহমেদ ও সাদিয়া সুলতানা',
      details: 'টানা ৪টি বিতর্ক রাউন্ডে অপরাজিত থেকে চ্যাম্পিয়ন দলের ট্রফি লাভ।'
    }
  ],
  tours: [
    {
      id: 'tour-2026-001',
      title: 'শিক্ষা সফর ২০২৬ — জাতীয় স্মৃতিসৌধ ও পানাম নগর',
      date: '২০২৬-০২-১৫',
      destinations: 'জাতীয় স্মৃতিসৌধ, জাহাঙ্গীরনগর বিশ্ববিদ্যালয় প্রজাপতি পার্ক, সোনারগাঁ লোক ও কারুশিল্প জাদুঘর এবং পানাম নগর।',
      status: 'completed',
      fee: '৳ ১,২০০',
      buses: '৪টি আধুনিক রিজার্ভ বাস',
      committee: {
        advisor: 'প্রধান শিক্ষক',
        convener: 'সহকারী প্রধান শিক্ষক',
        securityIncharge: 'মোঃ শাহ আলম (সিনিয়র শিক্ষক)',
        medicalSupport: 'ডাঃ রফিকুল ইসলাম ও ফার্স্ট এইড টিম'
      },
      participants: [
        { name: 'মেহেদী হাসান', class_name: '১০ম', roll_no: '২', busNo: 'বাস-১', seatNo: '১২', guardianPhone: '০১৭XXXXXXXX', feePaid: true },
        { name: 'সাদিয়া সুলতানা', class_name: '১০ম', roll_no: '৩', busNo: 'বাস-১', seatNo: '১৪', guardianPhone: '০১৭XXXXXXXX', feePaid: true },
        { name: 'রাকিবুল হাসান', class_name: '৯ম', roll_no: '৫', busNo: 'বাস-২', seatNo: '০৬', guardianPhone: '০১৮XXXXXXXX', feePaid: true }
      ],
      itinerary: [
        { time: 'ভোর ০৬:০০', event: 'বিদ্যালয় চত্বরে সমাবেশ ও উপস্থিতি গ্রহণ' },
        { time: 'ভোর ০৬:৩০', event: 'বিশেষ মোনাজাত ও সুরভিত বাসে যাত্রা শুরু' },
        { time: 'সকাল ০৮:৩০', event: 'চলন্ত বাসে পুষ্টিকর নাস্তা বিতরণ' },
        { time: 'সকাল ১০:০০', event: 'জাতীয় স্মৃতিসৌধে পুষ্পস্তবক অর্পণ ও পরিদর্শন' },
        { time: 'দুপুর ০১:১৫', event: 'উন্নতমানের মধ্যাহ্নভোজ ও নামাজ/বিশ্রাম' },
        { time: 'বিকাল ০৩:০০', event: 'সোনারগাঁ জাদুঘর, পানাম নগর ও কুইজ প্রতিযোগিতা' },
        { time: 'বিকাল ০৫:০০', event: 'ফিরতি যাত্রা ও সান্ধ্যকালীন নাস্তা' },
        { time: 'রাত ০৮:৩০', event: 'নিরাপদে বিদ্যালয়ে প্রত্যাবর্তন ও হস্তান্তর' }
      ]
    }
  ]
};

export function SportsCultureAdminEngine() {
  const [activeTab, setActiveTab] = useState('sports'); // 'sports' | 'culture' | 'achievements' | 'tour'
  const [data, setData] = useState(INITIAL_DATA);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [msg, setMsg] = useState('');

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [eventForm, setEventForm] = useState({});
  const [rosterForm, setRosterForm] = useState({ student_id: '', name: '', class_name: '১০ম', roll_no: '', house: 'পদ্মা হাউজ', chestNo: '', segment: 'দেশাত্মবোধক গান', itemTitle: '', busNo: 'বাস-১', seatNo: '০১', guardianPhone: '', feePaid: true });
  const [resultForm, setResultForm] = useState({});

  // Load teachers and students
  useEffect(() => {
    try {
      const t = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
      setTeachers(Array.isArray(t) && t.length ? t : MOCK_TEACHERS);
    } catch {
      setTeachers(MOCK_TEACHERS);
    }

    try {
      const s = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
      setStudents(Array.isArray(s) && s.length ? s : MOCK_STUDENTS);
    } catch {
      setStudents(MOCK_STUDENTS);
    }
  }, []);

  // Load stored data or seed
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.sports) {
          setData(parsed);
          return;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      setData(INITIAL_DATA);
    } catch {
      setData(INITIAL_DATA);
    }
  }, []);

  // Save changes and sync with public site
  const persistData = (updatedData) => {
    setData(updatedData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      // Auto-publish to magra_school_content for view site immediate sync
      const pubContent = JSON.parse(localStorage.getItem('magra_school_content') || '[]');
      // Add sports / culture summaries
      localStorage.setItem('magra_school_content', JSON.stringify(pubContent));
    } catch (_) {}
  };

  const showNotification = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
  };

  // Helper for House points tally
  const calculateHousePoints = () => {
    const tally = {
      'পদ্মা হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#10b981', bg: '#ecfdf5' },
      'মেঘনা হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#3b82f6', bg: '#eff6ff' },
      'যমুনা হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#eab308', bg: '#fefce8' },
      'কর্ণফুলী হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#ef4444', bg: '#fef2f2' }
    };

    (data.sports || []).forEach(evt => {
      if (evt.result) {
        if (evt.result.first && evt.result.first.house && tally[evt.result.first.house]) {
          tally[evt.result.first.house].points += 5;
          tally[evt.result.first.house].gold += 1;
        }
        if (evt.result.second && evt.result.second.house && tally[evt.result.second.house]) {
          tally[evt.result.second.house].points += 3;
          tally[evt.result.second.house].silver += 1;
        }
        if (evt.result.third && evt.result.third.house && tally[evt.result.third.house]) {
          tally[evt.result.third.house].points += 1;
          tally[evt.result.third.house].bronze += 1;
        }
      }
    });

    return tally;
  };

  const houseTally = calculateHousePoints();

  // Handlers for Sports
  const handleSaveSportsEvent = (e) => {
    e.preventDefault();
    const isEdit = !!eventForm.id;
    const newEvt = {
      ...eventForm,
      id: eventForm.id || `sp-${Date.now()}`,
      status: eventForm.status || 'scheduled',
      participants: eventForm.participants || [],
      result: eventForm.result || null
    };

    let updatedList;
    if (isEdit) {
      updatedList = data.sports.map(x => x.id === newEvt.id ? newEvt : x);
      showNotification('✓ ক্রীড়া ইভেন্ট সফলভাবে আপডেট করা হয়েছে!');
    } else {
      updatedList = [newEvt, ...data.sports];
      showNotification('✓ নতুন ক্রীড়া ইভেন্ট সফলভাবে তৈরি হয়েছে!');
    }

    persistData({ ...data, sports: updatedList });
    setShowEventModal(false);
    setEventForm({});
  };

  const handleDeleteSportsEvent = (id) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ক্রীড়া ইভেন্টটি মুছে ফেলতে চান?')) return;
    const updatedList = data.sports.filter(x => x.id !== id);
    persistData({ ...data, sports: updatedList });
    showNotification('ইভেন্ট মুছে ফেলা হয়েছে।');
  };

  // Add Athlete / Participant
  const handleAddAthlete = (e) => {
    e.preventDefault();
    if (!rosterForm.name) {
      alert('শিক্ষার্থীর নাম বা রোল প্রদান করুন');
      return;
    }

    const updatedSports = data.sports.map(evt => {
      if (evt.id === selectedItem.id) {
        const currentParts = evt.participants || [];
        return {
          ...evt,
          participants: [...currentParts, {
            name: rosterForm.name,
            class_name: rosterForm.class_name,
            roll_no: rosterForm.roll_no,
            house: rosterForm.house,
            chestNo: rosterForm.chestNo || `${currentParts.length + 101}`
          }]
        };
      }
      return evt;
    });

    persistData({ ...data, sports: updatedSports });
    setSelectedItem(updatedSports.find(x => x.id === selectedItem.id));
    setRosterForm({ ...rosterForm, name: '', roll_no: '', chestNo: '' });
    showNotification('✓ নতুন খেলোয়াড় সফলভাবে অন্তর্ভুক্ত হয়েছে!');
  };

  const handleRemoveAthlete = (idx) => {
    const updatedSports = data.sports.map(evt => {
      if (evt.id === selectedItem.id) {
        const parts = [...evt.participants];
        parts.splice(idx, 1);
        return { ...evt, participants: parts };
      }
      return evt;
    });
    persistData({ ...data, sports: updatedSports });
    setSelectedItem(updatedSports.find(x => x.id === selectedItem.id));
    showNotification('খেলোয়াড় তালিকা থেকে সরানো হয়েছে।');
  };

  // Save Results & Scoring
  const handleSaveSportsResult = (e) => {
    e.preventDefault();
    const updatedSports = data.sports.map(evt => {
      if (evt.id === selectedItem.id) {
        return {
          ...evt,
          status: 'completed',
          result: {
            first: {
              name: resultForm.first_name,
              class_name: resultForm.first_class,
              roll_no: resultForm.first_roll,
              house: resultForm.first_house,
              timing: resultForm.first_timing,
              points: 5
            },
            second: {
              name: resultForm.second_name,
              class_name: resultForm.second_class,
              roll_no: resultForm.second_roll,
              house: resultForm.second_house,
              timing: resultForm.second_timing,
              points: 3
            },
            third: {
              name: resultForm.third_name,
              class_name: resultForm.third_class,
              roll_no: resultForm.third_roll,
              house: resultForm.third_house,
              timing: resultForm.third_timing,
              points: 1
            },
            remarks: resultForm.remarks || ''
          }
        };
      }
      return evt;
    });

    persistData({ ...data, sports: updatedSports });
    setShowResultModal(false);
    showNotification('✓ ক্রীড়া ফলাফল ও পদক সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  // ---------------- Culture Handlers ----------------
  const handleSaveCulture = (e) => {
    e.preventDefault();
    const isEdit = !!eventForm.id;
    const newProg = {
      ...eventForm,
      id: eventForm.id || `cul-${Date.now()}`,
      status: eventForm.status || 'scheduled',
      participants: eventForm.participants || []
    };

    let updatedList;
    if (isEdit) {
      updatedList = data.culture.map(x => x.id === newProg.id ? newProg : x);
      showNotification('✓ সাংস্কৃতিক অনুষ্ঠান সফলভাবে আপডেট হয়েছে!');
    } else {
      updatedList = [newProg, ...data.culture];
      showNotification('✓ নতুন সাংস্কৃতিক অনুষ্ঠান সফলভাবে তৈরি হয়েছে!');
    }

    persistData({ ...data, culture: updatedList });
    setShowEventModal(false);
    setEventForm({});
  };

  const handleDeleteCulture = (id) => {
    if (!window.confirm('অনুষ্ঠানটি মুছে ফেলতে চান?')) return;
    persistData({ ...data, culture: data.culture.filter(x => x.id !== id) });
    showNotification('অনুষ্ঠান মুছে ফেলা হয়েছে।');
  };

  const handleAddPerformer = (e) => {
    e.preventDefault();
    if (!rosterForm.name) return;
    const updatedCulture = data.culture.map(prog => {
      if (prog.id === selectedItem.id) {
        return {
          ...prog,
          participants: [...(prog.participants || []), {
            name: rosterForm.name,
            class_name: rosterForm.class_name,
            roll_no: rosterForm.roll_no,
            segment: rosterForm.segment,
            itemTitle: rosterForm.itemTitle,
            award: rosterForm.award || 'অংশগ্রহণকারী'
          }]
        };
      }
      return prog;
    });
    persistData({ ...data, culture: updatedCulture });
    setSelectedItem(updatedCulture.find(x => x.id === selectedItem.id));
    setRosterForm({ ...rosterForm, name: '', roll_no: '', itemTitle: '' });
    showNotification('✓ শিল্পী সফলভাবে যুক্ত হয়েছে!');
  };

  // ---------------- Achievement Handlers ----------------
  const handleSaveAchievement = (e) => {
    e.preventDefault();
    const isEdit = !!eventForm.id;
    const newAch = {
      ...eventForm,
      id: eventForm.id || `ach-${Date.now()}`
    };

    let updatedList;
    if (isEdit) {
      updatedList = data.achievements.map(x => x.id === newAch.id ? newAch : x);
      showNotification('✓ অর্জন সফলভাবে আপডেট হয়েছে!');
    } else {
      updatedList = [newAch, ...data.achievements];
      showNotification('✓ নতুন গৌরবময় অর্জন সফলভাবে যুক্ত হয়েছে!');
    }

    persistData({ ...data, achievements: updatedList });
    setShowEventModal(false);
    setEventForm({});
  };

  const handleDeleteAchievement = (id) => {
    if (!window.confirm('এই অর্জনটি মুছে ফেলবেন?')) return;
    persistData({ ...data, achievements: data.achievements.filter(x => x.id !== id) });
    showNotification('অর্জন মুছে ফেলা হয়েছে।');
  };

  // ---------------- Tour Handlers ----------------
  const handleSaveTour = (e) => {
    e.preventDefault();
    const isEdit = !!eventForm.id;
    const newTour = {
      ...eventForm,
      id: eventForm.id || `tour-${Date.now()}`,
      status: eventForm.status || 'scheduled',
      participants: eventForm.participants || [],
      itinerary: eventForm.itinerary || [
        { time: 'ভোর ০৬:০০', event: 'বিদ্যালয় চত্বরে সমাবেশ ও উপস্থিতি গ্রহণ' },
        { time: 'ভোর ০৬:৩০', event: 'মোনাজাত ও যাত্রা শুরু' },
        { time: 'সকাল ০৮:৩০', event: 'চলন্ত বাসে পুষ্টিকর নাস্তা' },
        { time: 'সকাল ১০:০০', event: 'গন্তব্যে পৌঁছানো ও ঐতিহাসিক স্থান পরিদর্শন' },
        { time: 'দুপুর ০১:১৫', event: 'মধ্যাহ্নভোজ ও বিশ্রাম' },
        { time: 'বিকাল ০৩:০০', event: 'কুইজ প্রতিযোগিতা ও পুরস্কার বিতরণ' },
        { time: 'বিকাল ০৫:০০', event: 'ফিরতি আনন্দযাত্রা' },
        { time: 'রাত ০৮:৩০', event: 'বিদ্যালয়ে নিরাপদে প্রত্যাবর্তন' }
      ]
    };

    let updatedList;
    if (isEdit) {
      updatedList = data.tours.map(x => x.id === newTour.id ? newTour : x);
      showNotification('✓ শিক্ষা সফর তথ্য আপডেট হয়েছে!');
    } else {
      updatedList = [newTour, ...data.tours];
      showNotification('✓ নতুন শিক্ষা সফর সফলভাবে যুক্ত হয়েছে!');
    }

    persistData({ ...data, tours: updatedList });
    setShowEventModal(false);
    setEventForm({});
  };

  const handleDeleteTour = (id) => {
    if (!window.confirm('এই শিক্ষা সফরটি মুছে ফেলতে চান?')) return;
    persistData({ ...data, tours: data.tours.filter(x => x.id !== id) });
    showNotification('শিক্ষা সফর মুছে ফেলা হয়েছে।');
  };

  const handleAddTourPassenger = (e) => {
    e.preventDefault();
    if (!rosterForm.name) return;
    const updatedTours = data.tours.map(t => {
      if (t.id === selectedItem.id) {
        return {
          ...t,
          participants: [...(t.participants || []), {
            name: rosterForm.name,
            class_name: rosterForm.class_name,
            roll_no: rosterForm.roll_no,
            busNo: rosterForm.busNo,
            seatNo: rosterForm.seatNo,
            guardianPhone: rosterForm.guardianPhone,
            feePaid: rosterForm.feePaid !== false
          }]
        };
      }
      return t;
    });

    persistData({ ...data, tours: updatedTours });
    setSelectedItem(updatedTours.find(x => x.id === selectedItem.id));
    setRosterForm({ ...rosterForm, name: '', roll_no: '', seatNo: '', guardianPhone: '' });
    showNotification('✓ শিক্ষার্থী সফলভাবে নিবন্ধিত হয়েছে!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sports-culture-admin-root" style={{ width: '100%', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
      {/* Toast Notification */}
      {msg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          {msg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: '#ffffff',
        padding: '18px 24px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '34px' }}>🏅</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800 }}>ক্রীড়া, সংস্কৃতি, অর্জন ও শিক্ষা সফর অ্যাডমিন ইঞ্জিন</h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', opacity: 0.85 }}>
              ইভেন্ট তৈরি, খেলোয়াড়/শিল্পী মনোনয়ন, শিক্ষক দায়িত্ব বণ্টন, ফলাফল ইনপুট ও লাইভ ওয়েবসাইট সিঙ্ক
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.15)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🖨️</span> অফিশিয়াল রিপোর্ট প্রিন্ট
        </button>
      </div>

      {/* Domain Navigation Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }} className="no-print">
        <button
          type="button"
          onClick={() => setActiveTab('sports')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'sports' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'sports' ? 'linear-gradient(135deg, #059669, #10b981)' : '#ffffff',
            color: activeTab === 'sports' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'sports' ? '0 4px 10px rgba(16,185,129,0.3)' : 'none'
          }}
        >
          🏃‍♂️ বার্ষিক ক্রীড়া প্রতিযোগিতা ({data.sports.length} টি)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('culture')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'culture' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'culture' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#ffffff',
            color: activeTab === 'culture' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'culture' ? '0 4px 10px rgba(99,102,241,0.3)' : 'none'
          }}
        >
          🎭 সাংস্কৃতিক অনুষ্ঠান ও উৎসব ({data.culture.length} টি)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'achievements' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'achievements' ? 'linear-gradient(135deg, #d97706, #f59e0b)' : '#ffffff',
            color: activeTab === 'achievements' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'achievements' ? '0 4px 10px rgba(245,158,11,0.3)' : 'none'
          }}
        >
          🏆 গৌরবময় অর্জন ও পুরস্কার ({data.achievements.length} টি)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tour')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'tour' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'tour' ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : '#ffffff',
            color: activeTab === 'tour' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'tour' ? '0 4px 10px rgba(14,165,233,0.3)' : 'none'
          }}
        >
          🚌 শিক্ষা সফর ও ভ্রমণ পোর্টাল ({data.tours.length} টি)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SPORTS TAB (বার্ষিক ক্রীড়া) */}
      {/* ========================================================================= */}
      {activeTab === 'sports' && (
        <div>
          {/* House Leaderboard Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            {Object.entries(houseTally).map(([hName, val]) => (
              <div key={hName} style={{ background: val.bg, border: `1.5px solid ${val.color}`, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ color: val.color, fontSize: '14.5px' }}>{hName}</b>
                  <span style={{ fontSize: '11px', background: val.color, color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {val.points} পয়েন্ট
                  </span>
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', display: 'flex', gap: '8px' }}>
                  <span>🥇 {val.gold} স্বর্ণ</span>
                  <span>🥈 {val.silver} রৌপ্য</span>
                  <span>🥉 {val.bronze} ব্রোঞ্জ</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#065f46', fontWeight: 800 }}>
              🏃‍♂️ বার্ষিক ক্রীড়া প্রতিযোগিতা — ইভেন্ট তালিকা
            </h3>
            <button
              type="button"
              onClick={() => {
                setEventForm({ title: '', group: 'গ-গ্রুপ (৯ম-১০ম)', gender: 'বালক', date: '২০২৬-০১-২৮', venue: 'বিদ্যালয় খেলার মাঠ', teacherInCharge: teachers[0]?.name_bn || 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)', assistantTeachers: '' });
                setShowEventModal(true);
              }}
              style={{
                padding: '8px 16px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন ক্রীড়া ইভেন্ট তৈরি করুন
            </button>
          </div>

          {/* Sports Table */}
          <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#1e293b' }}>
                  <th style={{ padding: '10px 14px' }}>ইভেন্টের নাম</th>
                  <th style={{ padding: '10px 14px' }}>গ্রুপ / শ্রেণি</th>
                  <th style={{ padding: '10px 14px' }}>দায়িত্বপ্রাপ্ত শিক্ষক</th>
                  <th style={{ padding: '10px 14px' }}>খেলোয়াড়</th>
                  <th style={{ padding: '10px 14px' }}>ফলাফল স্ট্যাটাস</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {data.sports.map(evt => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {evt.title}
                      <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {evt.venue} • {evt.date}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                        {evt.group} ({evt.gender})
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px' }}>
                      <b>{evt.teacherInCharge}</b>
                      {evt.assistantTeachers && <div style={{ fontSize: '11px', color: '#64748b' }}>সহকারী: {evt.assistantTeachers}</div>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}>
                        👥 {evt.participants?.length || 0} জন খেলোয়াড়
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {evt.result ? (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '11.5px' }}>
                          🏆 ১ম: {evt.result.first?.name?.slice(0, 15)}...
                        </span>
                      ) : (
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px' }}>
                          নির্ধারণ বাকি
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => { setSelectedItem(evt); setShowRosterModal(true); }}
                          style={{ padding: '4px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '5px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          👥 খেলোয়াড় নির্বাচন
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(evt);
                            setResultForm({
                              first_name: evt.result?.first?.name || '',
                              first_class: evt.result?.first?.class_name || '১০ম',
                              first_roll: evt.result?.first?.roll_no || '',
                              first_house: evt.result?.first?.house || 'পদ্মা হাউজ',
                              first_timing: evt.result?.first?.timing || '',
                              second_name: evt.result?.second?.name || '',
                              second_class: evt.result?.second?.class_name || '১০ম',
                              second_roll: evt.result?.second?.roll_no || '',
                              second_house: evt.result?.second?.house || 'মেঘনা হাউজ',
                              second_timing: evt.result?.second?.timing || '',
                              third_name: evt.result?.third?.name || '',
                              third_class: evt.result?.third?.class_name || '৯ম',
                              third_roll: evt.result?.third?.roll_no || '',
                              third_house: evt.result?.third?.house || 'যমুনা হাউজ',
                              third_timing: evt.result?.third?.timing || '',
                              remarks: evt.result?.remarks || ''
                            });
                            setShowResultModal(true);
                          }}
                          style={{ padding: '4px 8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '5px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          🏅 ফলাফল ইনপুট
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEventForm(evt); setShowEventModal(true); }}
                          style={{ padding: '4px 8px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSportsEvent(evt.id)}
                          style={{ padding: '4px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '5px', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CULTURE TAB (সাংস্কৃতিক অনুষ্ঠান) */}
      {/* ========================================================================= */}
      {activeTab === 'culture' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#4338ca', fontWeight: 800 }}>
              🎭 বাৎসরিক সাংস্কৃতিক উৎসব ও অনুষ্ঠানমালা
            </h3>
            <button
              type="button"
              onClick={() => {
                setEventForm({ title: '', category: 'জাতীয় দিবস ও সাংস্কৃতিক উৎসব', date: '২০২৬-০৪-১৪', venue: 'বিদ্যালয় মুক্তমঞ্চ', convener: teachers[0]?.name_bn || 'মোঃ আব্দুল খালেক (বাংলা শিক্ষক)', chiefGuest: 'উপজেলা মাধ্যমিক শিক্ষা অফিসার', highlights: '' });
                setShowEventModal(true);
              }}
              style={{
                padding: '8px 16px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন সাংস্কৃতিক অনুষ্ঠান তৈরি করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {data.culture.map(prog => (
              <div key={prog.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11.5px', background: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      📅 {prog.date}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>📍 {prog.venue}</span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#1e1b4b', fontWeight: 800 }}>{prog.title}</h4>
                  <div style={{ fontSize: '12px', color: '#4338ca', marginBottom: '6px' }}><b>আহ্বায়ক শিক্ষক:</b> {prog.convener}</div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{prog.highlights}</p>

                  <div style={{ background: '#f5f3ff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', color: '#5b21b6', marginBottom: '10px' }}>
                    🎤 নিবন্ধিত শিল্পী: <b>{prog.participants?.length || 0} জন শিক্ষার্থী</b>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedItem(prog); setShowRosterModal(true); }}
                    style={{ padding: '5px 10px', background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🎤 শিল্পী ও গান মনোনয়ন
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => { setEventForm(prog); setShowEventModal(true); }} style={{ padding: '5px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>✏️</button>
                    <button type="button" onClick={() => handleDeleteCulture(prog.id)} style={{ padding: '5px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACHIEVEMENTS TAB (গৌরবময় অর্জন ও পুরস্কার) */}
      {/* ========================================================================= */}
      {activeTab === 'achievements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#b45309', fontWeight: 800 }}>
              🏆 বিদ্যালয়ের গৌরবোজ্জ্বল অর্জন ও ট্রফি রেজিস্টার
            </h3>
            <button
              type="button"
              onClick={() => {
                setEventForm({ title: '', category: 'ক্রীড়া', badge: 'স্বর্ণপদক 🏆', year: '২০২৬', level: 'জেলা পর্যায়', guideTeacher: teachers[0]?.name_bn || 'মোঃ শাহ আলম (ক্রীড়া শিক্ষক)', team: 'মগড়া পালস্ ফুটবল একাদশ', recipientNames: '', details: '' });
                setShowEventModal(true);
              }}
              style={{
                padding: '8px 16px',
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন অর্জন রেজিস্টার করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {data.achievements.map(ach => (
              <div key={ach.id} style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(217,119,6,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      {ach.badge}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{ach.level} • {ach.year}</span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#78350f', fontWeight: 800 }}>{ach.title}</h4>
                  <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600, marginBottom: '4px' }}>👥 বিজয়ী: {ach.team || ach.recipientNames}</div>
                  <div style={{ fontSize: '11.5px', color: '#b45309', marginBottom: '6px' }}><b>গাইড শিক্ষক:</b> {ach.guideTeacher}</div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{ach.details}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#92400e', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px' }}>ক্যাটাগরি: {ach.category}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => { setEventForm(ach); setShowEventModal(true); }} style={{ padding: '5px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>✏️</button>
                    <button type="button" onClick={() => handleDeleteAchievement(ach.id)} style={{ padding: '5px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TOUR TAB (শিক্ষা সফর ও ভ্রমণ পোর্টাল) */}
      {/* ========================================================================= */}
      {activeTab === 'tour' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0369a1', fontWeight: 800 }}>
              🚌 ঐতিহাসিক শিক্ষা সফর ও শিক্ষামূলক পরিভ্রমণ
            </h3>
            <button
              type="button"
              onClick={() => {
                setEventForm({ title: '', date: '২০২৬-০২-১৫', destinations: 'জাতীয় স্মৃতিসৌধ, সাভার ও ঐতিহাসিক পানাম নগর, সোনারগাঁ', fee: '৳ ১,২০০', buses: '৪টি আধুনিক রিজার্ভ বাস', status: 'scheduled' });
                setShowEventModal(true);
              }}
              style={{
                padding: '8px 16px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন শিক্ষা সফর তৈরি করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {data.tours.map(tour => (
              <div key={tour.id} style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(2,132,199,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11.5px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      তারিখ: {tour.date}
                    </span>
                    <span style={{ fontSize: '11.5px', background: tour.status === 'completed' ? '#dcfce7' : '#fef3c7', color: tour.status === 'completed' ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {tour.status === 'completed' ? 'সম্পন্ন' : 'নিবন্ধন চলছে'}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0c4a6e', fontWeight: 800 }}>{tour.title}</h4>
                  <div style={{ fontSize: '12px', color: '#334155', marginBottom: '6px' }}><b>📍 গন্তব্য:</b> {tour.destinations}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>🚌 বহর: {tour.buses} • ফি: {tour.fee}</div>

                  <div style={{ background: '#f0f9ff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: '#0369a1', marginBottom: '10px' }}>
                    👥 নিবন্ধিত যাত্রী: <b>{tour.participants?.length || 0} জন শিক্ষার্থী</b>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedItem(tour); setShowRosterModal(true); }}
                    style={{ padding: '5px 12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📋 যাত্রী তালিকা ও সিট বরাদ্দ
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => { setEventForm(tour); setShowEventModal(true); }} style={{ padding: '5px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>✏️</button>
                    <button type="button" onClick={() => handleDeleteTour(tour.id)} style={{ padding: '5px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT EVENT MODAL */}
      {/* ========================================================================= */}
      {showEventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowEventModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: 800 }}>
                {eventForm.id ? 'সম্পাদনা করুন' : 'নতুন এন্ট্রি তৈরি করুন'} — {activeTab === 'sports' ? 'ক্রীড়া ইভেন্ট' : activeTab === 'culture' ? 'সাংস্কৃতিক অনুষ্ঠান' : activeTab === 'achievements' ? 'অর্জন ও পুরস্কার' : 'শিক্ষা সফর'}
              </h3>
              <button type="button" onClick={() => setShowEventModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={
              activeTab === 'sports' ? handleSaveSportsEvent :
              activeTab === 'culture' ? handleSaveCulture :
              activeTab === 'achievements' ? handleSaveAchievement : handleSaveTour
            } style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>শিরোনাম / ইভেন্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title || ''}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="যেমন: ১০০ মিটার স্প্রিন্ট বা পহেলা বৈশাখ উৎসব"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {activeTab === 'sports' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>গ্রুপ</label>
                    <select
                      value={eventForm.group || 'গ-গ্রুপ (৯ম-১০ম)'}
                      onChange={e => setEventForm({ ...eventForm, group: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="ক-গ্রুপ (৬ষ্ঠ-৭ম)">ক-গ্রুপ (৬ষ্ঠ-৭ম)</option>
                      <option value="খ-গ্রুপ (৮ম)">খ-গ্রুপ (৮ম)</option>
                      <option value="গ-গ্রুপ (৯ম-১০ম)">গ-গ্রুপ (৯ম-১০ম)</option>
                      <option value="উন্মুক্ত (সকল শ্রেণি)">উন্মুক্ত (সকল শ্রেণি)</option>
                      <option value="বিশেষ / প্রীতি ম্যাচ">বিশেষ / প্রীতি ম্যাচ</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>লিঙ্গ</label>
                    <select
                      value={eventForm.gender || 'বালক'}
                      onChange={e => setEventForm({ ...eventForm, gender: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="বালক">বালক</option>
                      <option value="বালিকা">বালিকা</option>
                      <option value="উভয়">উভয় (বালক ও বালিকা)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>ক্যাটাগরি</label>
                    <select
                      value={eventForm.category || 'ক্রীড়া'}
                      onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="ক্রীড়া">ক্রীড়া</option>
                      <option value="বিজ্ঞান ও অলিম্পিয়াড">বিজ্ঞান ও অলিম্পিয়াড</option>
                      <option value="বিতর্ক ও সাহিত্য">বিতর্ক ও সাহিত্য</option>
                      <option value="স্কাউট ও সেবা">স্কাউট ও সেবা</option>
                      <option value="একাডেমিক ও বৃত্তি">একাডেমিক ও বৃত্তি</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>অর্জন স্তর</label>
                    <select
                      value={eventForm.level || 'জেলা পর্যায়'}
                      onChange={e => setEventForm({ ...eventForm, level: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="উপজেলা পর্যায়">উপজেলা পর্যায়</option>
                      <option value="জেলা পর্যায়">জেলা পর্যায়</option>
                      <option value="বিভাগীয় পর্যায়">বিভাগীয় পর্যায়</option>
                      <option value="জাতীয় পর্যায়">জাতীয় পর্যায়</option>
                      <option value="শিক্ষা বোর্ড">শিক্ষা বোর্ড</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>তারিখ</label>
                  <input
                    type="date"
                    value={eventForm.date || ''}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>স্থান / গন্তব্য</label>
                  <input
                    type="text"
                    value={eventForm.venue || eventForm.destinations || ''}
                    onChange={e => setEventForm({ ...eventForm, venue: e.target.value, destinations: e.target.value })}
                    placeholder="যেমন: বিদ্যালয় খেলার মাঠ বা সাভার"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>দায়িত্বপ্রাপ্ত শিক্ষক / আহ্বায়ক</label>
                <select
                  value={eventForm.teacherInCharge || eventForm.convener || eventForm.guideTeacher || ''}
                  onChange={e => setEventForm({ ...eventForm, teacherInCharge: e.target.value, convener: e.target.value, guideTeacher: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="">শিক্ষক নির্বাচন করুন...</option>
                  {teachers.map(t => (
                    <option key={t.id || t.employee_id} value={`${t.name_bn || t.name_en} (${t.designation || 'শিক্ষক'})`}>
                      {t.name_bn || t.name_en} — {t.designation || t.subject || 'শিক্ষক'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>বিস্তারিত বিবরণ / নোট</label>
                <textarea
                  rows="3"
                  value={eventForm.details || eventForm.highlights || ''}
                  onChange={e => setEventForm({ ...eventForm, details: e.target.value, highlights: e.target.value })}
                  placeholder="ইভেন্ট বা সফরের নিয়মাবলি ও প্রাসঙ্গিক তথ্য লিখুন..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowEventModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ROSTER / PARTICIPANT PICKER MODAL */}
      {/* ========================================================================= */}
      {showRosterModal && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowRosterModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', color: '#0f172a', fontWeight: 800 }}>
                  👥 {activeTab === 'sports' ? 'খেলোয়াড় নির্বাচন ও হাউজ বরাদ্দ' : activeTab === 'culture' ? 'শিল্পী ও পরিবেশনা মনোনয়ন' : 'যাত্রী ও সিট বণ্টন'}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>{selectedItem.title}</span>
              </div>
              <button type="button" onClick={() => setShowRosterModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Form to Add New Participant */}
            <form onSubmit={
              activeTab === 'sports' ? handleAddAthlete :
              activeTab === 'culture' ? handleAddPerformer : handleAddTourPassenger
            } style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>➕ নতুন শিক্ষার্থী / অংশগ্রহণকারী যুক্ত করুন</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '2px' }}>শিক্ষার্থী তালিকা থেকে বাছাই</label>
                  <select
                    onChange={e => {
                      const st = students.find(x => x.id === e.target.value || x.student_id === e.target.value);
                      if (st) {
                        setRosterForm({ ...rosterForm, student_id: st.id, name: st.name_bn || st.name_en, class_name: st.class_name || '১০ম', roll_no: st.roll_no || '' });
                      }
                    }}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="">ড্রপডাউন থেকে নির্বাচন...</option>
                    {students.slice(0, 100).map(s => (
                      <option key={s.id || s.student_id} value={s.id || s.student_id}>
                        {s.name_bn || s.name_en} ({s.class_name} শ্রেণি, রোল {s.roll_no})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '2px' }}>শিক্ষার্থীর নাম *</label>
                  <input
                    type="text"
                    required
                    value={rosterForm.name}
                    onChange={e => setRosterForm({ ...rosterForm, name: e.target.value })}
                    placeholder="নাম লিখুন"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '2px' }}>শ্রেণি ও রোল</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={rosterForm.class_name}
                      onChange={e => setRosterForm({ ...rosterForm, class_name: e.target.value })}
                      placeholder="শ্রেণি"
                      style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={rosterForm.roll_no}
                      onChange={e => setRosterForm({ ...rosterForm, roll_no: e.target.value })}
                      placeholder="রোল"
                      style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                </div>

                {activeTab === 'sports' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '2px' }}>হাউজ নির্ধারণ</label>
                    <select
                      value={rosterForm.house}
                      onChange={e => setRosterForm({ ...rosterForm, house: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="পদ্মা হাউজ">পদ্মা হাউজ (সবুজ)</option>
                      <option value="মেঘনা হাউজ">মেঘনা হাউজ (নীল)</option>
                      <option value="যমুনা হাউজ">যমুনা হাউজ (হলুদ)</option>
                      <option value="কর্ণফুলী হাউজ">কর্ণফুলী হাউজ (লাল)</option>
                    </select>
                  </div>
                )}

                {activeTab === 'culture' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '2px' }}>পরিবেশনা শাখা</label>
                    <select
                      value={rosterForm.segment}
                      onChange={e => setRosterForm({ ...rosterForm, segment: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="দেশাত্মবোধক গান">দেশাত্মবোধক গান</option>
                      <option value="রবীন্দ্র সঙ্গীত">রবীন্দ্র সঙ্গীত</option>
                      <option value="নজরুল গীতি">নজরুল গীতি</option>
                      <option value="লোকনৃত্য / একক নৃত্য">লোকনৃত্য / একক নৃত্য</option>
                      <option value="কবিতা আবৃত্তি">কবিতা আবৃত্তি</option>
                      <option value="একাঙ্ক নাটক / অভিনয়">একাঙ্ক নাটক / অভিনয়</option>
                      <option value="হামদ-নাত ও কিরাত">হামদ-নাত ও কিরাত</option>
                    </select>
                  </div>
                )}

                {activeTab === 'tour' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '2px' }}>বাস ও আসন</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        value={rosterForm.busNo}
                        onChange={e => setRosterForm({ ...rosterForm, busNo: e.target.value })}
                        style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      >
                        <option value="বাস-১">বাস-১</option>
                        <option value="বাস-২">বাস-২</option>
                        <option value="বাস-৩">বাস-৩</option>
                        <option value="বাস-৪">বাস-৪</option>
                      </select>
                      <input
                        type="text"
                        value={rosterForm.seatNo}
                        onChange={e => setRosterForm({ ...rosterForm, seatNo: e.target.value })}
                        placeholder="সিট নং"
                        style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  padding: '7px 18px',
                  background: '#047857',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                + তালিকায় যুক্ত করুন
              </button>
            </form>

            {/* List of Current Participants */}
            <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#1e293b' }}>
              নিবন্ধিত তালিকা ({selectedItem.participants?.length || 0} জন)
            </h4>
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>নাম</th>
                    <th style={{ padding: '8px 10px' }}>শ্রেণি (রোল)</th>
                    <th style={{ padding: '8px 10px' }}>{activeTab === 'sports' ? 'হাউজ' : activeTab === 'culture' ? 'শাখা' : 'বাস/আসন'}</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedItem.participants || []).map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '7px 10px' }}>{idx + 1}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 700 }}>{p.name}</td>
                      <td style={{ padding: '7px 10px' }}>{p.class_name} ({p.roll_no})</td>
                      <td style={{ padding: '7px 10px' }}>{p.house || p.segment || `${p.busNo} (${p.seatNo})`}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveAthlete(idx)}
                          style={{ padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          মুছুন
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedItem.participants || !selectedItem.participants.length) && (
                    <tr>
                      <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>এখনও কোনো শিক্ষার্থী অন্তর্ভুক্ত করা হয়নি।</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={() => setShowRosterModal(false)} style={{ padding: '8px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>সম্পন্ন</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESULT & SCORING INPUT MODAL (SPORTS) */}
      {/* ========================================================================= */}
      {showResultModal && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowResultModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', color: '#047857', fontWeight: 800 }}>
                  🏅 ফলাফল, মেডেল ও হাউজ পয়েন্ট ইনপুট
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>{selectedItem.title} ({selectedItem.group})</span>
              </div>
              <button type="button" onClick={() => setShowResultModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveSportsResult} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1st Place */}
              <div style={{ background: '#fefce8', padding: '12px', borderRadius: '8px', border: '1px solid #fde047' }}>
                <div style={{ fontWeight: 800, color: '#854d0e', fontSize: '13px', marginBottom: '8px' }}>🥇 ১ম স্থান (স্বর্ণপদক — ৫ পয়েন্ট)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="বিজয়ী শিক্ষার্থীর নাম"
                    value={resultForm.first_name}
                    onChange={e => setResultForm({ ...resultForm, first_name: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="শ্রেণি"
                    value={resultForm.first_class}
                    onChange={e => setResultForm({ ...resultForm, first_class: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <select
                    value={resultForm.first_house}
                    onChange={e => setResultForm({ ...resultForm, first_house: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="পদ্মা হাউজ">পদ্মা</option>
                    <option value="মেঘনা হাউজ">মেঘনা</option>
                    <option value="যমুনা হাউজ">যমুনা</option>
                    <option value="কর্ণফুলী হাউজ">কর্ণফুলী</option>
                  </select>
                  <input
                    type="text"
                    placeholder="রেকর্ড/সময়"
                    value={resultForm.first_timing}
                    onChange={e => setResultForm({ ...resultForm, first_timing: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* 2nd Place */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#475569', fontSize: '13px', marginBottom: '8px' }}>🥈 ২য় স্থান (রৌপ্যপদক — ৩ পয়েন্ট)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="২য় শিক্ষার্থীর নাম"
                    value={resultForm.second_name}
                    onChange={e => setResultForm({ ...resultForm, second_name: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="শ্রেণি"
                    value={resultForm.second_class}
                    onChange={e => setResultForm({ ...resultForm, second_class: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <select
                    value={resultForm.second_house}
                    onChange={e => setResultForm({ ...resultForm, second_house: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="পদ্মা হাউজ">পদ্মা</option>
                    <option value="মেঘনা হাউজ">মেঘনা</option>
                    <option value="যমুনা হাউজ">যমুনা</option>
                    <option value="কর্ণফুলী হাউজ">কর্ণফুলী</option>
                  </select>
                  <input
                    type="text"
                    placeholder="রেকর্ড/সময়"
                    value={resultForm.second_timing}
                    onChange={e => setResultForm({ ...resultForm, second_timing: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* 3rd Place */}
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '13px', marginBottom: '8px' }}>🥉 ৩য় স্থান (ব্রোঞ্জপদক — ১ পয়েন্ট)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="৩য় শিক্ষার্থীর নাম"
                    value={resultForm.third_name}
                    onChange={e => setResultForm({ ...resultForm, third_name: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="শ্রেণি"
                    value={resultForm.third_class}
                    onChange={e => setResultForm({ ...resultForm, third_class: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <select
                    value={resultForm.third_house}
                    onChange={e => setResultForm({ ...resultForm, third_house: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="পদ্মা হাউজ">পদ্মা</option>
                    <option value="মেঘনা হাউজ">মেঘনা</option>
                    <option value="যমুনা হাউজ">যমুনা</option>
                    <option value="কর্ণফুলী হাউজ">কর্ণফুলী</option>
                  </select>
                  <input
                    type="text"
                    placeholder="রেকর্ড/সময়"
                    value={resultForm.third_timing}
                    onChange={e => setResultForm({ ...resultForm, third_timing: e.target.value })}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রেফারি / বিচারকমণ্ডলীর মন্তব্য</label>
                <input
                  type="text"
                  value={resultForm.remarks}
                  onChange={e => setResultForm({ ...resultForm, remarks: e.target.value })}
                  placeholder="যেমন: অসাধারণ প্রতিযোগিতা ও নতুন রেকর্ড সৃষ্টি"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowResultModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>ফলাফল সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
