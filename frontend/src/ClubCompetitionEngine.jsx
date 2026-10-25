import React, { useState, useEffect } from 'react';
import { MOCK_TEACHERS, getTeacherPhoto } from './mockData';

// Storage key
const STORAGE_KEY = 'magra_club_competitions_v2';

// Initial preloaded authentic sessions for all 4 clubs
const DEFAULT_SESSIONS = [
  // ================= 1. DEBATING CLUB =================
  {
    id: 'deb-2026-001',
    club: 'debate',
    title: 'কৃত্রিম বুদ্ধিমত্তা (AI) ভবিষ্যৎ শিক্ষার্থীদের মৌলিক মেধা বিকাশের জন্য হুমকি নয় বরং পরম সহায়ক শক্তি',
    format: 'আন্তঃশ্রেণি সংসদীয় বিতর্ক (Parliamentary Debate)',
    date: '২০২৬-১০-২৫',
    time: 'বেলা ১১:৩০ মিনিট',
    venue: 'বিদ্যালয় কেন্দ্রীয় অডিটোরিয়াম ও মুক্তমঞ্চ',
    status: 'completed', // 'scheduled' | 'completed'
    moderator: {
      name: 'মোঃ আশরাফুল আলম',
      role: 'সহকারী শিক্ষক (ইংরেজি) ও প্রধান বিতর্ক প্রশিক্ষক'
    },
    judges: [
      { name: 'মোঃ আব্দুল খালেক', role: 'প্রধান বিচারক • সহকারী শিক্ষক (বাংলা)' },
      { name: 'মোঃ হাবিবুর রহমান', role: 'বিচারক-২ • সিনিয়র শিক্ষক (বিজ্ঞান ও গণিত)' },
      { name: 'তাপসী সরকার', role: 'বিচারক-৩ • সহকারী প্রধান শিক্ষক' }
    ],
    propTeam: {
      teamName: 'অগ্রগামী সরকারি দল (৯ম শ্রেণি)',
      speakers: [
        { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', role: '১ম বক্তা (প্রধানমন্ত্রী)', logic: 24, delivery: 23, rebut: 23, discipline: 23, total: 93 },
        { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', role: '২য় বক্তা (মন্ত্রী)', logic: 24, delivery: 24, rebut: 23, discipline: 24, total: 95 },
        { name: 'সুমাইয়া আক্তার', class_name: '৯ম শ্রেণি', roll_no: '৪', role: '৩য় বক্তা (দলনেতা ও সরকার দলীয় হুইপ)', logic: 25, delivery: 25, rebut: 24, discipline: 24, total: 98 }
      ],
      totalScore: 286
    },
    oppTeam: {
      teamName: 'যুক্তিযোদ্ধা বিরোধী দল (১০ম শ্রেণি)',
      speakers: [
        { name: 'তানভীর আহমেদ', class_name: '১০ম শ্রেণি', roll_no: '১', role: '১ম বক্তা (বিরোধী দলনেতা)', logic: 24, delivery: 23, rebut: 22, discipline: 23, total: 92 },
        { name: 'রাহাত হাসান', class_name: '১০ম শ্রেণি', roll_no: '৫', role: '২য় বক্তা (উপনেতা)', logic: 23, delivery: 24, rebut: 23, discipline: 23, total: 93 },
        { name: 'নাফিজা ইসলাম', class_name: '১০ম শ্রেণি', roll_no: '৬', role: '৩য় বক্তা (বিরোধী দলীয় হুইপ)', logic: 23, delivery: 22, rebut: 22, discipline: 22, total: 89 }
      ],
      totalScore: 274
    },
    result: {
      winner: 'prop', // 'prop' | 'opp'
      winnerName: 'অগ্রগামী সরকারি দল (৯ম শ্রেণি)',
      runnerUpName: 'যুক্তিযোদ্ধা বিরোধী দল (১০ম শ্রেণি)',
      margin: 12,
      bestSpeaker: 'সুমাইয়া আক্তার (৯ম শ্রেণি, সরকারি দল — প্রাপ্ত নম্বর: ৯৮/১০০)',
      judgesRemarks: 'উভয় দলই সমসাময়িক বৈশ্বিক প্রেক্ষাপট ও এআই প্রযুক্তির ওপর প্রামাণ্য তথ্য ও যুক্তি উপস্থাপন করেছে। সরকারি দলের ৩য় বক্তা বিপক্ষের তথ্যের অসঙ্গতি যুক্তিপূর্ণভাবে খণ্ডন করে সভার নিয়ন্ত্রণ ধরে রাখেন।'
    }
  },
  {
    id: 'deb-2026-002',
    club: 'debate',
    title: 'পরিবেশ সুরক্ষায় আইনের কঠোর প্রয়োগের চেয়ে সামাজিক সচেতনতাই অধিক কার্যকর',
    format: 'সনাতনী বারোয়ারী বিতর্ক (Traditional Debate)',
    date: '২০২৬-১০-৩০',
    time: 'দুপুর ১২:০০ মিনিট',
    venue: 'বিদ্যালয় বিজ্ঞান চত্বর ও সবুজ আঙিনা',
    status: 'scheduled',
    moderator: {
      name: 'মোঃ মোস্তাফিজুর রহমান',
      role: 'প্রধান শিক্ষক ও সভাপতি (মগড়া ডিবেটিং ক্লাব)'
    },
    judges: [
      { name: 'মোঃ আশরাফুল আলম', role: 'প্রধান বিচারক • সহকারী শিক্ষক (ইংরেজি)' },
      { name: 'মোঃ আব্দুর রহিম লিটন', role: 'বিচারক-২ • সিনিয়র শিক্ষক (জীববিজ্ঞান)' },
      { name: 'মোঃ শাহিন মিয়া', role: 'বিচারক-৩ • সহকারী শিক্ষক (গ্রন্থাগার)' }
    ],
    propTeam: {
      teamName: 'সবুজ বিপ্লব পক্ষ দল (৮ম শ্রেণি)',
      speakers: [
        { name: 'সাজিদ হাসান', class_name: '৮ম শ্রেণি', roll_no: '১', role: 'দলনেতা ও ১ম বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'আরিফ মাহমুদ', class_name: '৮ম শ্রেণি', roll_no: '৪', role: '২য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'নুসরাত জাহান', class_name: '৮ম শ্রেণি', roll_no: '৭', role: '৩য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 }
      ],
      totalScore: 0
    },
    oppTeam: {
      teamName: 'প্রকৃতিবন্ধু বিপক্ষ দল (৭ম শ্রেণি)',
      speakers: [
        { name: 'মাহির ফয়সাল', class_name: '৭ম শ্রেণি', roll_no: '১', role: 'দলনেতা ও ১ম বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'তামিম ইকবাল', class_name: '৭ম শ্রেণি', roll_no: '৩', role: '২য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'জান্নাতুল ফেরদৌস', class_name: '৭ম শ্রেণি', roll_no: '৫', role: '৩য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 }
      ],
      totalScore: 0
    },
    result: null
  },

  // ================= 2. LANGUAGE & LITERATURE CLUB =================
  {
    id: 'lit-2026-001',
    club: 'literature',
    title: 'অমর একুশে ও জাতীয় সাহিত্য দিবস উপলক্ষে বার্ষিক উপস্থিত বক্তৃতা ও আবৃত্তি প্রতিযোগিতা ২০২৬',
    format: 'উপস্থিত বক্তৃতা ও প্রমিত কবিতা আবৃত্তি',
    date: '২০২৬-১০-২৪',
    time: 'সকাল ১০:০০ ঘটিকা',
    venue: 'কবি সুফিয়া কামাল সাহিত্য কর্নার (লাইব্রেরি হল)',
    status: 'completed',
    moderator: {
      name: 'মোঃ আব্দুল খালেক',
      role: 'প্রধান মডারেটর • সহকারী শিক্ষক (বাংলা সাহিত্য)'
    },
    judges: [
      { name: 'মোঃ আশরাফুল আলম', role: 'প্রধান বিচারক • সহকারী শিক্ষক (ইংরেজি)' },
      { name: 'মোঃ শাহিন মিয়া', role: 'সহযোগী বিচারক • সহকারী শিক্ষক (গ্রন্থাগার)' },
      { name: 'তাপসী সরকার', role: 'উপদেষ্টা বিচারক • সহকারী প্রধান শিক্ষক' }
    ],
    participants: [
      { name: 'সুমাইয়া আক্তার', class_name: '১০ম শ্রেণি', roll_no: '৪', topic: 'আমার স্বপ্নের সোনার বাংলা ও তরুণদের দায়বদ্ধতা', category: 'উপস্থিত বক্তৃতা', contentScore: 29, pronunciationScore: 29, presentationScore: 19, timeScore: 18, total: 95, position: '১ম স্থান (চ্যাম্পিয়ন)' },
      { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', topic: 'একুশের অবিনাশী চেতনা ও প্রমিত ভাষার মর্যাদা', category: 'উপস্থিত বক্তৃতা', contentScore: 28, pronunciationScore: 28, presentationScore: 18, timeScore: 18, total: 92, position: '২য় স্থান (রানার-আপ)' },
      { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', topic: 'পল্লীকবি জসীমউদ্দীন ও গ্রামীণ চিরায়ত সাহিত্য', category: 'কবিতা আবৃত্তি', contentScore: 27, pronunciationScore: 28, presentationScore: 18, timeScore: 16, total: 89, position: '৩য় স্থান' },
      { name: 'সাজিদ হাসান', class_name: '৮ম শ্রেণি', roll_no: '৫', topic: 'বই পড়ার আনন্দ ও লাইব্রেরি চর্চা', category: 'উপস্থিত বক্তৃতা', contentScore: 26, pronunciationScore: 26, presentationScore: 17, timeScore: 16, total: 85, position: 'বিশেষ সম্মাননা' }
    ],
    result: {
      firstPlace: 'সুমাইয়া আক্তার (১০ম শ্রেণি, রোল ৪)',
      secondPlace: 'মাহফুজ আহমেদ (৯ম শ্রেণি, রোল ২)',
      thirdPlace: 'ফারজানা মেহজাবীন (৯ম শ্রেণি, রোল ৩)',
      specialAward: 'সাজিদ হাসান (৮ম শ্রেণি, রোল ৫ — সেরা তরুণ বক্তা)',
      judgesRemarks: 'শিক্ষার্থীদের প্রমিত বাংলা উচ্চারণ, মঞ্চভীতিহীন সাবলীল উপস্থাপনা ও বক্তব্যের গভীরতা ছিল অভাবনীয়। শব্দচয়ন ও কণ্ঠশীলন আরও উন্নত করার পরামর্শ রইল।'
    }
  },

  // ================= 3. SCIENCE CLUB =================
  {
    id: 'sci-2026-001',
    club: 'science',
    title: 'বার্ষিক আন্তঃশ্রেণি বিজ্ঞান মেলা ও খুদে উদ্ভাবন প্রজেক্ট প্রদর্শনী ২০২৬',
    format: 'বিজ্ঞান প্রকল্প প্রদর্শনী ও লাইভ মডেল পরীক্ষণ',
    date: '২০২৬-১০-২৩',
    time: 'সকাল ১০:৩০ ঘটিকা',
    venue: 'বিদ্যালয় কেন্দ্রীয় বিজ্ঞান ল্যাবরেটরি ও চত্বর',
    status: 'completed',
    moderator: {
      name: 'মোঃ হাবিবুর রহমান',
      role: 'প্রধান মডারেটর • সিনিয়র শিক্ষক (গণিত ও সাধারণ বিজ্ঞান)'
    },
    judges: [
      { name: 'মোঃ রফিকুল ইসলাম', role: 'প্রধান বিচারক • সহকারী শিক্ষক (ভৌত বিজ্ঞান)' },
      { name: 'মোঃ আব্দুর রহিম লিটন', role: 'সহযোগী বিচারক • সিনিয়র শিক্ষক (জীববিজ্ঞান)' },
      { name: 'মোঃ মোস্তাফিজুর রহমান', role: 'উপদেষ্টা বিচারক • প্রধান শিক্ষক' }
    ],
    participants: [
      { name: 'তানভীর আহমেদ ও রাহাত হাসান', class_name: '১০ম শ্রেণি', roll_no: '১ ও ৫', topic: 'স্বয়ংক্রিয় সৌরচালিত স্মার্ট ড্রিপ ইরিগেশন ও মাটি আর্দ্রতা নির্ণায়ক যন্ত্র', category: 'কৃষি ও নবায়নযোগ্য শক্তি', innovationScore: 30, feasibilityScore: 29, functionScore: 19, presentationScore: 19, total: 97, position: '১ম স্থান (সেরা উদ্ভাবক / গোল্ড মেডেল)' },
      { name: 'মাহফুজ আহমেদ ও ফারদিন হাসান', class_name: '৯ম শ্রেণি', roll_no: '২ ও ৮', topic: 'প্লাস্টিক বর্জ্য পুনর্ব্যবহার করে বায়োগ্যাস ও জৈব সার উৎপাদন মডেল', category: 'পরিবেশ বিজ্ঞান', innovationScore: 28, feasibilityScore: 28, functionScore: 18, presentationScore: 18, total: 92, position: '২য় স্থান (সিলভার মেডেল)' },
      { name: 'ফারজানা মেহজাবীন ও সুমাইয়া আক্তার', class_name: '৯ম শ্রেণি', roll_no: '৩ ও ৪', topic: 'বিদ্যালয়ের বৃষ্টির পানি সংরক্ষণ ও স্বয়ংক্রিয় সৌর ফিল্টারিং প্ল্যান্ট', category: 'পানি ও জলবায়ু সুরক্ষা', innovationScore: 27, feasibilityScore: 27, functionScore: 18, presentationScore: 17, total: 89, position: '৩য় স্থান (ব্রোঞ্জ মেডেল)' },
      { name: 'সজীব হাসান ও দল', class_name: '৮ম শ্রেণি', roll_no: '২', topic: 'ভূমিকম্প ও বন্যা সংকেত দেওয়ার স্বয়ংক্রিয় সেন্সর অ্যালার্ম', category: 'দুর্যোগ ব্যবস্থাপনা', innovationScore: 26, feasibilityScore: 26, functionScore: 17, presentationScore: 17, total: 86, position: 'বিশেষ জুরি মেনশন' }
    ],
    result: {
      firstPlace: 'তানভীর আহমেদ ও রাহাত হাসান (১০ম শ্রেণি — স্মার্ট ড্রিপ ইরিগেশন)',
      secondPlace: 'মাহফুজ আহমেদ ও ফারদিন হাসান (৯ম শ্রেণি — বায়োগ্যাস প্রজেক্ট)',
      thirdPlace: 'ফারজানা মেহজাবীন ও সুমাইয়া আক্তার (৯ম শ্রেণি — ওয়াটার ফিল্টারিং)',
      specialAward: 'সজীব হাসান ও দল (৮ম শ্রেণি — সায়েন্স জুরি ইনোভেশন অ্যাওয়ার্ড)',
      judgesRemarks: 'মাটির আর্দ্রতা মেপে স্বয়ংক্রিয় পানি দেওয়া সৌরচালিত ড্রিপ ইরিগেশন প্রজেক্টটি অত্যন্ত কার্যকর ও মাঠপর্যায়ে কৃষকদের উপকারে আসার মতো বাস্তবমুখী উদ্ভাবন।'
    }
  },

  // ================= 4. ICT & CODING CLUB =================
  {
    id: 'ict-2026-001',
    club: 'ict',
    title: 'আন্তঃশ্রেণি পাইথন ও ওয়েব প্রোগ্রামিং হ্যাকাথন ২০২৬',
    format: 'কোডিং অলিম্পিয়াড ও লাইভ সফটওয়্যার ডেমো',
    date: '২০২৬-১০-২২',
    time: 'বেলা ১১:০০ ঘটিকা',
    venue: 'শেখ রাসেল ডিজিটাল আধুনিক কম্পিউটার ল্যাব',
    status: 'completed',
    moderator: {
      name: 'মোঃ আবুবকর সিদ্দিক',
      role: 'প্রধান মডারেটর • সহকারী শিক্ষক (আইসিটি) ও সিস্টেম অ্যাডমিন'
    },
    judges: [
      { name: 'মোঃ শাহিন মিয়া', role: 'বিচারক-১ • সহকারী শিক্ষক (গ্রন্থাগার ও তথ্যবিজ্ঞান)' },
      { name: 'মোঃ হাবিবুর রহমান', role: 'বিচারক-২ • সিনিয়র শিক্ষক (গণিত ও লজিক)' },
      { name: 'তাপসী সরকার', role: 'উপদেষ্টা বিচারক • সহকারী প্রধান শিক্ষক' }
    ],
    participants: [
      { name: 'ফারজানা মেহজাবীন ও নাফিজা ইসলাম', class_name: '৯ম শ্রেণি', roll_no: '৩ ও ৬', topic: 'মগড়া ডিজিটাল লাইব্রেরি ক্যাটালগ ও স্মার্ট বুক ট্র্যাকার ওয়েব অ্যাপ', category: 'ওয়েব ডেভেলপমেন্ট (HTML/JS)', logicScore: 30, bugFreeScore: 29, uiScore: 20, speedScore: 19, total: 98, position: '১ম স্থান (সেরা কোডার / গোল্ড ট্রফি)' },
      { name: 'তানভীর আহমেদ', class_name: '১০ম শ্রেণি', roll_no: '১', topic: 'ইন্টারঅ্যাক্টিভ গণিত কুইজ ও ব্রেইন ট্রেইনার পাইথন টার্মিনাল গেম', category: 'পাইথন প্রোগ্রামিং', logicScore: 29, bugFreeScore: 28, uiScore: 18, speedScore: 18, total: 93, position: '২য় স্থান (সিলভার)' },
      { name: 'সাজিদ হাসান ও মাহির ফয়সাল', class_name: '৭ম ও ৮ম শ্রেণি', roll_no: '১ ও ৫', topic: 'স্ক্র্যাচ কোডিং দিয়ে তৈরি সড়ক নিরাপত্তা সচেতনতা সিমুলেটর', category: 'স্ক্র্যাচ ও গেম কোডিং', logicScore: 27, bugFreeScore: 27, uiScore: 18, speedScore: 17, total: 89, position: '৩য় স্থান (ব্রোঞ্জ)' },
      { name: 'রাহাত হাসান', class_name: '১০ম শ্রেণি', roll_no: '৫', topic: 'স্কুল স্টুডেন্ট আইডি কিউআর কোড জেনারেটর টুল', category: 'ইউটিলিটি সফটওয়্যার', logicScore: 26, bugFreeScore: 26, uiScore: 17, speedScore: 17, total: 86, position: 'সেরা সৃজনশীল আইডিয়া' }
    ],
    result: {
      firstPlace: 'ফারজানা মেহজাবীন ও নাফিজা ইসলাম (৯ম শ্রেণি — লাইব্রেরি সফটওয়্যার)',
      secondPlace: 'তানভীর আহমেদ (১০ম শ্রেণি — পাইথন ম্যাথ কুইজ)',
      thirdPlace: 'সাজিদ হাসান ও মাহির ফয়সাল (৭ম ও ৮ম শ্রেণি — স্ক্র্যাচ গেম)',
      specialAward: 'রাহাত হাসান (১০ম শ্রেণি — কিউআর কোড অটোমেশন টুল)',
      judgesRemarks: 'শিক্ষার্থীদের প্রোগ্রামিং লজিক ও ইন্টারঅ্যাক্টিভ ইউজার ইন্টারফেস ডিজাইন অত্যন্ত উচ্চমানের ছিল। লাইব্রেরি অ্যাপটি বিদ্যালয়ের লাইব্রেরিতে সফলভাবে সংযোজনের সুপারিশ করা হলো।'
    }
  }
];

export function ClubCompetitionEngine({ activeClub, teachers = MOCK_TEACHERS }) {
  const [sessions, setSessions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'scheduled'
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [scoringSession, setScoringSession] = useState(null);
  const [printSession, setPrintSession] = useState(null);

  // Load from localStorage or initialize defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          return;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SESSIONS));
      setSessions(DEFAULT_SESSIONS);
    } catch {
      setSessions(DEFAULT_SESSIONS);
    }
  }, []);

  const saveSessions = (updated) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  };

  // Club specific styling and labels
  const clubMeta = {
    debate: {
      title: 'ডিবেটিং ক্লাব (বিতর্ক পরিষদ)',
      badge: '⚔️ বিতর্ক অধিবেশন ও প্রতিযোগিতা',
      actionBtn: '+ নতুন বিতর্ক অধিবেশন আয়োজন করুন',
      themeColor: '#312e81',
      lightBg: '#e0e7ff',
      borderColor: '#c7d2fe',
      formatPlaceholder: 'যেমন: সংসদীয় বিতর্ক / সনাতনী বিতর্ক / বারোয়ারি বিতর্ক'
    },
    literature: {
      title: 'ভাষা ও সাহিত্য ক্লাব',
      badge: '📜 সাহিত্য ও সাংস্কৃতিক প্রতিযোগিতা',
      actionBtn: '+ নতুন সাহিত্য প্রতিযোগিতা আয়োজন করুন',
      themeColor: '#047857',
      lightBg: '#dcfce7',
      borderColor: '#a7f3d0',
      formatPlaceholder: 'যেমন: উপস্থিত বক্তৃতা / কবিতা আবৃত্তি / রচনা প্রতিযোগিতা / বানান প্রতিযোগিতা'
    },
    science: {
      title: 'বিজ্ঞান ক্লাব (সায়েন্স একাডেমি)',
      badge: '🔬 বিজ্ঞান মেলা ও উদ্ভাবন প্রদর্শনী',
      actionBtn: '+ নতুন বিজ্ঞান প্রতিযোগিতা আয়োজন করুন',
      themeColor: '#0891b2',
      lightBg: '#cffafe',
      borderColor: '#a5f3fc',
      formatPlaceholder: 'যেমন: বিজ্ঞান প্রজেক্ট প্রদর্শনী / বিজ্ঞান অলিম্পিয়াড / মডেল পরীক্ষণ'
    },
    ict: {
      title: 'আইসিটি ও কোডিং ক্লাব',
      badge: '💻 কোডিং অলিম্পিয়াড ও হ্যাকাথন',
      actionBtn: '+ নতুন আইসিটি/কোডিং প্রতিযোগিতা আয়োজন করুন',
      themeColor: '#0284c7',
      lightBg: '#e0f2fe',
      borderColor: '#bae6fd',
      formatPlaceholder: 'যেমন: পাইথন হ্যাকাথন / ওয়েব ডিজাইন প্রতিযোগিতা / স্ক্র্যাচ গেম কনটেস্ট'
    }
  }[activeClub] || {
    title: 'সহশিক্ষা ক্লাব',
    badge: '🏆 ক্লাব প্রতিযোগিতা',
    actionBtn: '+ নতুন প্রতিযোগিতা আয়োজন করুন',
    themeColor: '#1e293b',
    lightBg: '#f1f5f9',
    borderColor: '#cbd5e1',
    formatPlaceholder: 'প্রতিযোগিতার ফরম্যাট'
  };

  // Filter current club sessions
  const currentClubSessions = sessions.filter(s => s.club === activeClub);
  const filteredSessions = currentClubSessions.filter(s => {
    if (filterStatus === 'completed') return s.status === 'completed';
    if (filterStatus === 'scheduled') return s.status === 'scheduled';
    return true;
  });

  // Handle Delete Session
  const handleDeleteSession = (id) => {
    if (window.confirm('আপনি কি এই সেশনটি তালিকা থেকে মুছে ফেলতে চান?')) {
      const updated = sessions.filter(s => s.id !== id);
      saveSessions(updated);
    }
  };

  // Reset to default sample sessions
  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি ক্লাবের সকল ডেমো সেশন ও প্রতিযোগিতা পূর্বাবস্থায় ফিরিয়ে আনতে চান?')) {
      saveSessions(DEFAULT_SESSIONS);
    }
  };

  // Print Dispatcher: Opens clean printable window with government/school official layout
  const handlePrintDocument = (session) => {
    const isDebate = session.club === 'debate';
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('পপআপ উইন্ডো ব্লক হয়েছে। অনুগ্রহ করে ব্রাউজারে পপআপ অনুমোদন করুন।');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>ফলাফল বিবরণী — ${session.title}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
          body {
            font-family: 'Hind Siliguri', 'Nikosh', 'SolaimanLipi', Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 10px;
            font-size: 13px;
            line-height: 1.5;
            background: #fff;
          }
          .header-box {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 14px;
          }
          .school-title {
            font-size: 24px;
            font-weight: 900;
            margin: 0;
            color: #0f172a;
          }
          .school-sub {
            font-size: 12.5px;
            color: #475569;
            margin: 2px 0;
          }
          .doc-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1.5px solid #0f172a;
            padding: 4px 14px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 14.5px;
            margin-top: 6px;
            color: #1e3a8a;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            background: #f8fafc;
          }
          .info-table td {
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
            font-size: 12.5px;
          }
          .info-label {
            font-weight: 700;
            color: #334155;
            width: 18%;
          }
          .score-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 16px 0;
          }
          .score-table th, .score-table td {
            border: 1px solid #0f172a;
            padding: 6px 8px;
            text-align: center;
            font-size: 12px;
          }
          .score-table th {
            background: #e2e8f0;
            color: #0f172a;
            font-weight: 800;
          }
          .team-header {
            background: #f1f5f9;
            font-weight: 800;
            text-align: left;
            padding-left: 10px;
            color: #1e293b;
          }
          .result-card {
            border: 2px solid #0f172a;
            background: #f8fafc;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 14px 0;
          }
          .result-title {
            margin: 0 0 6px 0;
            font-size: 15px;
            font-weight: 900;
            color: #065f46;
          }
          .signatures {
            margin-top: 45px;
            display: flex;
            justify-content: space-between;
            text-align: center;
          }
          .sig-line {
            border-top: 1px dashed #0f172a;
            width: 175px;
            padding-top: 4px;
            font-size: 11.5px;
            font-weight: 700;
          }
          .seal-box {
            display: inline-block;
            border: 1px solid #94a3b8;
            border-radius: 50%;
            width: 65px;
            height: 65px;
            line-height: 65px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
            margin-top: -10px;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#e0f2fe;border:1px solid #7dd3fc;padding:8px 12px;border-radius:6px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12.5px;color:#0369a1;font-weight:700;">🖨️ প্রিন্ট প্রিভিউ উইন্ডো প্রস্তুত। প্রিন্ট বা PDF ডাউনলোডের জন্য ডানপাশের বোতামে ক্লিক করুন।</span>
          <button onclick="window.print()" style="background:#0284c7;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;font-weight:800;font-size:13px;">🖨️ প্রিন্ট করুন / Save PDF</button>
        </div>

        <div class="header-box">
          <h1 class="school-title">মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</h1>
          <p class="school-sub">পোস্ট: মগড়া, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৩৯ • EIIN: 114290</p>
          <div class="doc-badge">${clubMeta.title} — অফিশিয়াল প্রতিযোগিতা ফলাফল ও মূল্যায়ন বিবরণী</div>
        </div>

        <table class="info-table">
          <tr>
            <td class="info-label">বিষয় / প্রস্তাবনা:</td>
            <td colspan="3" style="font-weight:800;color:#0f172a;font-size:13.5px;">${session.title}</td>
          </tr>
          <tr>
            <td class="info-label">প্রতিযোগিতার ধরন:</td>
            <td>${session.format || 'বার্ষিক ক্লাব প্রতিযোগিতা'}</td>
            <td class="info-label">তারিখ ও সময়:</td>
            <td>${session.date || '—'}, ${session.time || '—'}</td>
          </tr>
          <tr>
            <td class="info-label">স্থান / ভেন্যু:</td>
            <td>${session.venue || 'বিদ্যালয় ক্যাম্পাস'}</td>
            <td class="info-label">সেশন মডারেটর:</td>
            <td style="font-weight:700;">${session.moderator?.name || '—'} (${session.moderator?.role || 'মডারেটর'})</td>
          </tr>
          <tr>
            <td class="info-label">বিচারকমণ্ডলী:</td>
            <td colspan="3">
              ${(session.judges || []).map((j, i) => `<b>(${i + 1})</b> ${j.name} <small>(${j.role})</small>`).join('&nbsp;&nbsp;•&nbsp;&nbsp;')}
            </td>
          </tr>
        </table>

        ${isDebate ? `
          <h4 style="margin:8px 0 4px 0;font-size:13.5px;color:#0f172a;">📊 পক্ষ ও বিপক্ষ দলের বিতার্কিকদের পূর্ণাঙ্গ স্কোরকার্ড</h4>
          <table class="score-table">
            <thead>
              <tr>
                <th style="width:16%;">দল ও পরিচয়</th>
                <th style="width:24%;">বিতার্কিকের নাম ও শ্রেণি</th>
                <th>যুক্তি ও তথ্য (২৫)</th>
                <th>বাচনভঙ্গি (২৫)</th>
                <th>খণ্ডন শৈলী (২৫)</th>
                <th>শৃঙ্খলা ও সময় (২৫)</th>
                <th>মোট স্কোর (১০০)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7" class="team-header" style="color:#166534;background:#f0fdf4;">
                  🏛️ সরকারি / পক্ষ দল: <b>${session.propTeam?.teamName || 'পক্ষ দল'}</b> (মোট নম্বর: <b>${session.propTeam?.totalScore || 0}/৩০০</b>)
                </td>
              </tr>
              ${(session.propTeam?.speakers || []).map(sp => `
                <tr>
                  <td>${sp.role || 'বক্তা'}</td>
                  <td style="text-align:left;font-weight:700;">${sp.name} <small style="color:#64748b;">(${sp.class_name}, রোল ${sp.roll_no || '—'})</small></td>
                  <td>${sp.logic || 0}</td>
                  <td>${sp.delivery || 0}</td>
                  <td>${sp.rebut || 0}</td>
                  <td>${sp.discipline || 0}</td>
                  <td style="font-weight:800;background:#f8fafc;">${sp.total || 0}</td>
                </tr>
              `).join('')}

              <tr>
                <td colspan="7" class="team-header" style="color:#991b1b;background:#fef2f2;">
                  ⚖️ বিরোধী / বিপক্ষ দল: <b>${session.oppTeam?.teamName || 'বিপক্ষ দল'}</b> (মোট নম্বর: <b>${session.oppTeam?.totalScore || 0}/৩০০</b>)
                </td>
              </tr>
              ${(session.oppTeam?.speakers || []).map(sp => `
                <tr>
                  <td>${sp.role || 'বক্তা'}</td>
                  <td style="text-align:left;font-weight:700;">${sp.name} <small style="color:#64748b;">(${sp.class_name}, রোল ${sp.roll_no || '—'})</small></td>
                  <td>${sp.logic || 0}</td>
                  <td>${sp.delivery || 0}</td>
                  <td>${sp.rebut || 0}</td>
                  <td>${sp.discipline || 0}</td>
                  <td style="font-weight:800;background:#f8fafc;">${sp.total || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <h4 style="margin:8px 0 4px 0;font-size:13.5px;color:#0f172a;">📊 প্রতিযোগী / প্রজেক্ট মূল্যায়ন স্কোরকার্ড</h4>
          <table class="score-table">
            <thead>
              <tr>
                <th>ক্রম</th>
                <th style="width:24%;">প্রতিযোগী / উদ্ভাবক দলের নাম</th>
                <th style="width:30%;">উপস্থাপিত বিষয় / প্রজেক্ট শিরোনাম</th>
                <th>বিভাগ / ক্যাটাগরি</th>
                <th>প্রাপ্ত নম্বর</th>
                <th>ফলাফল / স্থান</th>
              </tr>
            </thead>
            <tbody>
              ${(session.participants || []).map((pt, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td style="text-align:left;font-weight:700;">${pt.name} <br><small style="color:#64748b;">${pt.class_name || ''} ${pt.roll_no ? `(রোল ${pt.roll_no})` : ''}</small></td>
                  <td style="text-align:left;">${pt.topic || pt.title || '—'}</td>
                  <td><span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;">${pt.category || 'সাধারণ'}</span></td>
                  <td style="font-weight:900;font-size:13px;">${pt.total || 0}/১০০</td>
                  <td style="font-weight:800;color:#0f172a;">${pt.position || 'অংশগ্রহণকারী'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}

        ${session.result ? `
          <div class="result-card">
            <h3 class="result-title">🏆 অফিশিয়াল ফলাফল ঘোষণা</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12.5px;margin-bottom:8px;">
              ${isDebate ? `
                <div>🥇 <b>বিজয়ী দল:</b> <span style="font-weight:900;color:#166534;">${session.result.winnerName || '—'}</span></div>
                <div>🥈 <b>রানার-আপ দল:</b> <span style="font-weight:700;color:#991b1b;">${session.result.runnerUpName || '—'}</span></div>
                <div style="grid-column:span 2;">🎖️ <b>শ্রেষ্ঠ বিতার্কিক (Best Speaker):</b> <span style="font-weight:900;color:#1e3a8a;">${session.result.bestSpeaker || '—'}</span></div>
                ${session.result.margin ? `<div>⚖️ <b>পয়েন্টের ব্যবধান:</b> ${session.result.margin} পয়েন্ট</div>` : ''}
              ` : `
                <div>🥇 <b>১ম স্থান:</b> <span style="font-weight:900;color:#166534;">${session.result.firstPlace || '—'}</span></div>
                <div>🥈 <b>২য় স্থান:</b> <span style="font-weight:700;color:#991b1b;">${session.result.secondPlace || '—'}</span></div>
                <div>🥉 <b>৩য় স্থান:</b> <span style="font-weight:700;color:#d97706;">${session.result.thirdPlace || '—'}</span></div>
                <div>⭐ <b>বিশেষ সম্মাননা:</b> <span style="font-weight:700;color:#4338ca;">${session.result.specialAward || '—'}</span></div>
              `}
            </div>
            ${session.result.judgesRemarks ? `
              <div style="background:#fff;padding:6px 10px;border-radius:4px;border:1px solid #e2e8f0;font-size:12px;color:#334155;">
                <b>বিচারকমণ্ডলীর সর্বসম্মত পর্যবেক্ষণ:</b> "${session.result.judgesRemarks}"
              </div>
            ` : ''}
          </div>
        ` : `
          <div style="background:#fffbeb;border:1px dashed #f59e0b;padding:8px 12px;border-radius:6px;font-size:12px;color:#b45309;margin:10px 0;">
            ⏳ এই সেশনের দল ও বিচারক নিযুক্ত রয়েছে। বিতর্ক/প্রতিযোগিতা শেষে নম্বর এন্ট্রি সম্পন্ন হলে চূড়ান্ত ফলাফল শিট স্বয়ংক্রিয়ভাবে জেনারেট হবে।
          </div>
        `}

        <div class="signatures">
          <div>
            <div class="sig-line">সেশন মডারেটর / স্পিকার</div>
            <small style="color:#64748b;">${session.moderator?.name || 'মডারেটর'}</small>
          </div>
          <div>
            <div class="sig-line">প্রধান বিচারক</div>
            <small style="color:#64748b;">${session.judges?.[0]?.name || 'প্রধান বিচারক'}</small>
          </div>
          <div>
            <div class="seal-box">বিদ্যালয় সিল</div>
          </div>
          <div>
            <div class="sig-line">প্রধান শিক্ষক ও ক্লাব সভাপতি</div>
            <small style="color:#64748b;">মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</small>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ marginTop: '12px' }}>
      {/* HEADER BAR */}
      <div style={{
        background: `linear-gradient(135deg, ${clubMeta.lightBg} 0%, #ffffff 100%)`,
        border: `1.5px solid ${clubMeta.borderColor}`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: clubMeta.themeColor,
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: '20px'
            }}>
              {clubMeta.badge}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>শিক্ষাবর্ষ ২০২৬</span>
          </div>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#0f172a', fontWeight: 900 }}>
            {activeClub === 'debate' ? '⚔️ বিতর্ক অধিবেশন ও ফলাফল প্রস্তুত ব্যবস্থাপনা' :
             activeClub === 'science' ? '🔬 বিজ্ঞান মেলা ও উদ্ভাবন ফলাফল ব্যবস্থাপনা' :
             activeClub === 'ict' ? '💻 কোডিং অলিম্পিয়াড ও আইসিটি ফলাফল ব্যবস্থাপনা' :
             '📜 সাহিত্য প্রতিযোগিতা ও ফলাফল ব্যবস্থাপনা'}
          </h3>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
            {activeClub === 'debate' ? 'প্রতিবার নতুন করে মডারেটর, বিচারকমণ্ডলী, পক্ষ ও বিপক্ষ দলের বিতার্কিক নিযুক্ত করুন, পয়েন্ট এন্ট্রি করুন এবং অফিশিয়াল রেজাল্ট শিট প্রিন্ট করুন।' :
             'নতুন প্রতিযোগিতা আয়োজন, বিচারকমণ্ডলী ও প্রতিযোগী নিযুক্তকরণ, ফলাফল নির্ধারণ ও অফিশিয়াল সার্টিফিকেট/রেজাল্ট প্রিন্ট।'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            style={{
              background: clubMeta.themeColor,
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>✨</span> {clubMeta.actionBtn}
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            title="ডেমো সেশন রিস্টোর করুন"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔄 ডেমো রিসেট
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            style={{
              background: filterStatus === 'all' ? '#0f172a' : '#f8fafc',
              color: filterStatus === 'all' ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            সব সেশন ({currentClubSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            style={{
              background: filterStatus === 'completed' ? '#059669' : '#f8fafc',
              color: filterStatus === 'completed' ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ✅ ফলাফল সম্পন্ন ({currentClubSessions.filter(s => s.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('scheduled')}
            style={{
              background: filterStatus === 'scheduled' ? '#d97706' : '#f8fafc',
              color: filterStatus === 'scheduled' ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⏳ আসন্ন / নিযুক্ত ({currentClubSessions.filter(s => s.status === 'scheduled').length})
          </button>
        </div>

        <small style={{ color: '#64748b' }}>মোট সংরক্ষিত সেশন: {filteredSessions.length} টি</small>
      </div>

      {/* SESSIONS CARDS LIST */}
      {filteredSessions.length === 0 ? (
        <div style={{
          background: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '36px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '6px' }}>📂</div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#334155' }}>কোনো প্রতিযোগিতা সেশন পাওয়া যায়নি</h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b' }}>
            উপরের "{clubMeta.actionBtn}" বোতামে ক্লিক করে নতুন সেশন তৈরি করুন অথবা ডেমো রিসেট করুন।
          </p>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            style={{
              background: clubMeta.themeColor,
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + নতুন সেশন যোগ করুন
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredSessions.map(session => {
            const isDebate = session.club === 'debate';
            const isCompleted = session.status === 'completed';

            return (
              <div
                key={session.id}
                style={{
                  background: '#ffffff',
                  border: isCompleted ? '1.5px solid #cbd5e1' : '1.5px solid #fde68a',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
                  position: 'relative'
                }}
              >
                {/* TOP META BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: isCompleted ? '#dcfce7' : '#fef3c7',
                      color: isCompleted ? '#166534' : '#92400e',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {isCompleted ? '✓ ফলাফল প্রস্তুত ও সংরক্ষিত' : '⏳ আসন্ন / বিচারক ও টিম নিযুক্ত'}
                    </span>
                    <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '11.5px', padding: '2px 8px', borderRadius: '4px' }}>
                      📋 {session.format || 'বিতর্ক অধিবেশন'}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      📅 {session.date || '—'} • ⏰ {session.time || '—'}
                    </span>
                  </div>

                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                    📍 {session.venue || 'বিদ্যালয় ক্যাম্পাস'}
                  </span>
                </div>

                {/* TITLE / MOTION */}
                <h3 style={{
                  margin: '0 0 10px 0',
                  fontSize: '16.5px',
                  color: '#0f172a',
                  fontWeight: 900,
                  lineHeight: '1.4'
                }}>
                  {isDebate ? `🗣️ প্রস্তাবনা: "${session.title}"` : session.title}
                </h3>

                {/* MODERATOR & JUDGES PANEL ROW */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#047857', fontWeight: 800, display: 'block' }}>
                      🎙️ সেশন মডারেটর / স্পিকার
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                      {session.moderator?.name || 'মডারেটর নিযুক্ত হয়নি'}
                    </div>
                    <small style={{ color: '#64748b', fontSize: '11.5px' }}>{session.moderator?.role || 'পরিচালক'}</small>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 800, display: 'block' }}>
                      👨‍⚖️ বিচারকমণ্ডলী (Judges Panel)
                    </span>
                    <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                      {(session.judges && session.judges.length > 0) ? (
                        session.judges.map((j, idx) => (
                          <span key={idx} style={{ display: 'inline-block', marginRight: '8px' }}>
                            <b>({idx + 1})</b> {j.name}
                          </span>
                        ))
                      ) : 'বিচারক প্যানেল এখনও চূড়ান্ত হয়নি'}
                    </div>
                  </div>
                </div>

                {/* PARTICIPANTS OR TEAMS SUMMARY */}
                {isDebate ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    {/* PROPOSITION TEAM */}
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                          🏛️ পক্ষ দল: {session.propTeam?.teamName || 'পক্ষ একাদশ'}
                        </span>
                        {isCompleted && (
                          <span style={{ background: '#166534', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                            স্কোর: {session.propTeam?.totalScore || 0}/৩০০
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {(session.propTeam?.speakers || []).map((sp, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {sp.role ? `${sp.role}: ` : ''}<b>{sp.name}</b> <small style={{ color: '#64748b' }}>({sp.class_name}, রোল {sp.roll_no || '—'})</small></span>
                            {isCompleted && <span style={{ fontWeight: 700, color: '#166534' }}>{sp.total || 0}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OPPOSITION TEAM */}
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>
                          ⚖️ বিপক্ষ দল: {session.oppTeam?.teamName || 'বিপক্ষ একাদশ'}
                        </span>
                        {isCompleted && (
                          <span style={{ background: '#991b1b', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                            স্কোর: {session.oppTeam?.totalScore || 0}/৩০০
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {(session.oppTeam?.speakers || []).map((sp, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {sp.role ? `${sp.role}: ` : ''}<b>{sp.name}</b> <small style={{ color: '#64748b' }}>({sp.class_name}, রোল {sp.roll_no || '—'})</small></span>
                            {isCompleted && <span style={{ fontWeight: 700, color: '#991b1b' }}>{sp.total || 0}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      👥 অংশগ্রহণকারী / প্রজেক্ট উদ্ভাবক তালিকা ({session.participants?.length || 0} জন/দল)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px', fontSize: '12px' }}>
                      {(session.participants || []).slice(0, 4).map((pt, pIdx) => (
                        <div key={pIdx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 8px', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{pt.name}</div>
                          <small style={{ color: '#64748b', display: 'block' }}>{pt.topic || pt.title || 'উপস্থাপিত বিষয়'}</small>
                          {isCompleted && <span style={{ fontSize: '11px', color: '#047857', fontWeight: 800 }}>স্কোর: {pt.total || 0}/১০০ • {pt.position || ''}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WINNER / RESULT SUMMARY BOX (IF COMPLETED) */}
                {isCompleted && session.result && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1.5px solid #fde68a',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        {isDebate ? (
                          <>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#92400e' }}>
                              🏆 বিজয়ী দল: {session.result.winnerName}
                            </span>
                            <span style={{ fontSize: '12px', color: '#b45309', marginLeft: '10px' }}>
                              (ব্যবধান: {session.result.margin || 0} পয়েন্ট)
                            </span>
                            <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 700, marginTop: '2px' }}>
                              🎖️ শ্রেষ্ঠ বিতার্কিক: {session.result.bestSpeaker}
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#166534' }}>
                              🥇 ১ম স্থান: {session.result.firstPlace}
                            </span>
                            <span style={{ fontSize: '12px', color: '#991b1b', marginLeft: '10px', fontWeight: 700 }}>
                              🥈 ২য় স্থান: {session.result.secondPlace}
                            </span>
                            {session.result.specialAward && (
                              <div style={{ fontSize: '11.5px', color: '#4338ca', fontWeight: 700, marginTop: '2px' }}>
                                ⭐ বিশেষ সম্মাননা: {session.result.specialAward}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {session.result.judgesRemarks && (
                        <div style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic', maxWidth: '400px' }}>
                          "{session.result.judgesRemarks}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handlePrintDocument(session)}
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span>🖨️</span> অফিশিয়াল ফলাফল শিট প্রিন্ট
                    </button>

                    <button
                      type="button"
                      onClick={() => setScoringSession(session)}
                      style={{
                        background: isCompleted ? '#f0fdf4' : '#eff6ff',
                        color: isCompleted ? '#166534' : '#1d4ed8',
                        border: isCompleted ? '1px solid #86efac' : '1px solid #93c5fd',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>📝</span> {isCompleted ? 'স্কোর ও মূল্যায়ন সম্পাদনা' : 'স্কোর ও ফলাফল এন্ট্রি করুন'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingSession(session)}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ তথ্য সম্পাদনা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      style={{
                        background: '#fff1f2',
                        color: '#be123c',
                        border: '1px solid #fecdd3',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ মুছুন
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: NEW / EDIT SESSION MODAL ================= */}
      {(showNewModal || editingSession) && (
        <SessionEditModal
          session={editingSession}
          activeClub={activeClub}
          teachers={teachers}
          clubMeta={clubMeta}
          onClose={() => {
            setShowNewModal(false);
            setEditingSession(null);
          }}
          onSave={(newSession) => {
            if (editingSession) {
              const updated = sessions.map(s => s.id === newSession.id ? newSession : s);
              saveSessions(updated);
            } else {
              saveSessions([newSession, ...sessions]);
            }
            setShowNewModal(false);
            setEditingSession(null);
          }}
        />
      )}

      {/* ================= MODAL 2: SCORING & EVALUATION MODAL ================= */}
      {scoringSession && (
        <ScoringModal
          session={scoringSession}
          activeClub={activeClub}
          onClose={() => setScoringSession(null)}
          onSave={(scoredSession) => {
            const updated = sessions.map(s => s.id === scoredSession.id ? scoredSession : s);
            saveSessions(updated);
            setScoringSession(null);
          }}
        />
      )}
    </div>
  );
}

// ================= MODAL COMPONENT 1: SESSION EDIT / CREATION =================
function SessionEditModal({ session, activeClub, teachers, clubMeta, onClose, onSave }) {
  const isDebate = activeClub === 'debate';
  const isEdit = !!session;

  const [form, setForm] = useState(session || {
    id: `${activeClub.slice(0, 3)}-${Date.now()}`,
    club: activeClub,
    title: '',
    format: isDebate ? 'আন্তঃশ্রেণি সংসদীয় বিতর্ক (Parliamentary)' : 'বার্ষিক ক্লাব প্রতিযোগিতা',
    date: '২০২৬-১০-২৫',
    time: 'বেলা ১১:০০ ঘটিকা',
    venue: isDebate ? 'বিদ্যালয় কেন্দ্রীয় অডিটোরিয়াম' : activeClub === 'science' ? 'বিজ্ঞান ল্যাবরেটরি' : activeClub === 'ict' ? 'শেখ রাসেল ডিজিটাল ল্যাব' : 'লাইব্রেরি মিলনায়তন',
    status: 'scheduled',
    moderator: {
      name: teachers[0]?.name_bn || 'মোঃ আশরাফুল আলম',
      role: 'সহকারী শিক্ষক (ইংরেজি) ও বিতর্ক প্রশিক্ষক'
    },
    judges: [
      { name: teachers[14]?.name_bn || 'মোঃ আব্দুল খালেক', role: 'প্রধান বিচারক • সহকারী শিক্ষক (বাংলা)' },
      { name: teachers[7]?.name_bn || 'মোঃ হাবিবুর রহমান', role: 'বিচারক-২ • সিনিয়র শিক্ষক (বিজ্ঞান)' },
      { name: teachers[1]?.name_bn || 'তাপসী সরকার', role: 'বিচারক-৩ • সহকারী প্রধান শিক্ষক' }
    ],
    // Debate specific
    propTeam: {
      teamName: 'পক্ষ দল (অগ্রগামী একাদশ)',
      speakers: [
        { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', role: '১ম বক্তা (প্রধানমন্ত্রী)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', role: '২য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'সুমাইয়া আক্তার', class_name: '৯ম শ্রেণি', roll_no: '৪', role: '৩য় বক্তা (দলনেতা)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 }
      ],
      totalScore: 0
    },
    oppTeam: {
      teamName: 'বিপক্ষ দল (যুক্তিযোদ্ধা একাদশ)',
      speakers: [
        { name: 'তানভীর আহমেদ', class_name: '১০ম শ্রেণি', roll_no: '১', role: '১ম বক্তা (বিরোধী দলনেতা)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'রাহাত হাসান', class_name: '১০ম শ্রেণি', roll_no: '৫', role: '২য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
        { name: 'নাফিজা ইসলাম', class_name: '১০ম শ্রেণি', roll_no: '৬', role: '৩য় বক্তা (হুইপ)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 }
      ],
      totalScore: 0
    },
    // Other clubs specific
    participants: [
      { name: 'তানভীর আহমেদ', class_name: '১০ম শ্রেণি', roll_no: '১', topic: 'প্রকল্প / উপস্থাপনা বিষয় ১', category: 'প্রধান বিভাগ', total: 0, position: '' },
      { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', topic: 'প্রকল্প / উপস্থাপনা বিষয় ২', category: 'সাধারণ বিভাগ', total: 0, position: '' },
      { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', topic: 'প্রকল্প / উপস্থাপনা বিষয় ৩', category: 'বিশেষ বিভাগ', total: 0, position: '' }
    ],
    result: null
  });

  // Demo Autofill Helper
  const handleAutoFillDemo = () => {
    if (isDebate) {
      setForm(prev => ({
        ...prev,
        title: 'সামাজিক যোগাযোগ মাধ্যমের অনিয়ন্ত্রিত ব্যবহার শিক্ষার্থীদের সৃজনশীল চিন্তা ধ্বংস করছে',
        format: 'আন্তঃশ্রেণি সংসদীয় বিতর্ক (Parliamentary Debate)',
        date: '২০২৬-১০-২৬',
        time: 'বেলা ১১:৪৫ মিনিট',
        venue: 'বিদ্যালয় কেন্দ্রীয় মিলনায়তন',
        moderator: {
          name: 'মোঃ আশরাফুল আলম',
          role: 'সহকারী শিক্ষক (ইংরেজি) ও প্রধান বিতর্ক প্রশিক্ষক'
        },
        judges: [
          { name: 'মোঃ আব্দুল খালেক', role: 'প্রধান বিচারক • সহকারী শিক্ষক (বাংলা)' },
          { name: 'মোঃ হাবিবুর রহমান', role: 'বিচারক-২ • সিনিয়র শিক্ষক (গণিত ও বিজ্ঞান)' },
          { name: 'মোঃ আব্দুর রহিম লিটন', role: 'বিচারক-৩ • সিনিয়র শিক্ষক (জীববিজ্ঞান)' }
        ],
        propTeam: {
          teamName: 'পক্ষ দল (যুক্তিবাদী একাদশ - ১০ম শ্রেণি)',
          speakers: [
            { name: 'তানভীর আহমেদ', class_name: '১০ম শ্রেণি', roll_no: '১', role: '১ম বক্তা (প্রধানমন্ত্রী)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
            { name: 'রাহাত হাসান', class_name: '১০ম শ্রেণি', roll_no: '৫', role: '২য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
            { name: 'সুমাইয়া আক্তার', class_name: '১০ম শ্রেণি', roll_no: '৪', role: '৩য় বক্তা (দলনেতা)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 }
          ],
          totalScore: 0
        },
        oppTeam: {
          teamName: 'বিপক্ষ দল (প্রগতিশীল একাদশ - ৯ম শ্রেণি)',
          speakers: [
            { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', role: '১ম বক্তা (বিরোধী দলনেতা)', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
            { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', role: '২য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 },
            { name: 'নাফিজা ইসলাম', class_name: '৯ম শ্রেণি', roll_no: '৬', role: '৩য় বক্তা', logic: 0, delivery: 0, rebut: 0, discipline: 0, total: 0 }
          ],
          totalScore: 0
        }
      }));
    } else if (activeClub === 'science') {
      setForm(prev => ({
        ...prev,
        title: 'বিজ্ঞান ও গণিত অলিম্পিয়াড এবং রোবটিক্স উদ্ভাবন কনটেস্ট ২০২৬',
        format: 'খুদে উদ্ভাবন প্রজেক্ট প্রদর্শনী',
        date: '২০২৬-১০-২৭',
        time: 'সকাল ১০:০০ ঘটিকা',
        venue: 'বিদ্যালয় বিজ্ঞান ল্যাব ও প্রদর্শনী কর্নার',
        moderator: {
          name: 'মোঃ হাবিবুর রহমান',
          role: 'সিনিয়র শিক্ষক (বিজ্ঞান ও গণিত)'
        },
        judges: [
          { name: 'মোঃ রফিকুল ইসলাম', role: 'প্রধান বিচারক • সহকারী শিক্ষক (ভৌত বিজ্ঞান)' },
          { name: 'মোঃ আব্দুর রহিম লিটন', role: 'সহযোগী বিচারক • সিনিয়র শিক্ষক (জীববিজ্ঞান)' },
          { name: 'মোঃ মোস্তাফিজুর রহমান', role: 'উপদেষ্টা বিচারক • প্রধান শিক্ষক' }
        ],
        participants: [
          { name: 'তানভীর আহমেদ ও রাহাত হাসান', class_name: '১০ম শ্রেণি', roll_no: '১ ও ৫', topic: 'আর্ডুইনো নিয়ন্ত্রিত স্বয়ংক্রিয় অগ্নিনির্বাপক রোবট', category: 'রোবটিক্স ও ইলেকট্রনিক্স', total: 0, position: '' },
          { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', topic: 'পৌর বর্জ্য থেকে বিদ্যুৎ উৎপাদন মডেল', category: 'পরিবেশ বিজ্ঞান', total: 0, position: '' },
          { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', topic: 'স্মার্ট ক্লাসরুম লাইট ও ফ্যান অটোমেশন সেন্সর', category: 'শক্তি সংরক্ষণ', total: 0, position: '' }
        ]
      }));
    } else if (activeClub === 'ict') {
      setForm(prev => ({
        ...prev,
        title: 'শেখ রাসেল আন্তঃশ্রেণি কোডিং স্প্রিন্ট ও ওয়েব ডেভেলপমেন্ট কনটেস্ট ২০২৬',
        format: 'লাইভ কোডিং ও প্রোগ্রামিং হ্যাকাথন',
        date: '২০২৬-১০-২৮',
        time: 'সকাল ১০:৩০ ঘটিকা',
        venue: 'শেখ রাসেল ডিজিটাল ল্যাব',
        moderator: {
          name: 'মোঃ আবুবকর সিদ্দিক',
          role: 'সহকারী শিক্ষক (আইসিটি) ও সিস্টেম অ্যাডমিন'
        },
        judges: [
          { name: 'মোঃ শাহিন মিয়া', role: 'বিচারক-১ • সহকারী শিক্ষক (গ্রন্থাগার)' },
          { name: 'মোঃ হাবিবুর রহমান', role: 'বিচারক-২ • গণিত শিক্ষক' },
          { name: 'তাপসী সরকার', role: 'সহকারী প্রধান শিক্ষক' }
        ],
        participants: [
          { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', topic: 'স্মার্ট স্কুল ডিজিটাল নোটিশবোর্ড ওয়েব পোর্টাল', category: 'জাভাস্ক্রিপ্ট / ওয়েব', total: 0, position: '' },
          { name: 'তানভীর আহমেদ', class_name: '১০ম শ্রেণি', roll_no: '১', topic: 'পাইথন দিয়ে তৈরি স্বয়ংক্রিয় গণিত অ্যালগরিদম সলভার', category: 'পাইথন প্রোগ্রামিং', total: 0, position: '' },
          { name: 'মাহির ফয়সাল', class_name: '৭ম শ্রেণি', roll_no: '১', topic: 'ট্র্যাফিক সিগন্যাল সিমুলেশন অ্যানিমেশন গেম', category: 'স্ক্র্যাচ কোডিং', total: 0, position: '' }
        ]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        title: 'শরতের সাহিত্য আড্ডা ও স্বরচিত কবিতা আবৃত্তি উৎসব ২০২৬',
        format: 'উপস্থিত বক্তৃতা ও কবিতা পাঠ',
        date: '২০২৬-১০-২৯',
        time: 'বেলা ১১:০০ ঘটিকা',
        venue: 'কবি সুফিয়া কামাল পাঠাগার হল',
        moderator: {
          name: 'মোঃ আব্দুল খালেক',
          role: 'সহকারী শিক্ষক (বাংলা)'
        },
        judges: [
          { name: 'মোঃ আশরাফুল আলম', role: 'সহকারী শিক্ষক (ইংরেজি)' },
          { name: 'মোঃ শাহিন মিয়া', role: 'সহকারী শিক্ষক (গ্রন্থাগার)' },
          { name: 'তাপসী সরকার', role: 'সহকারী প্রধান শিক্ষক' }
        ],
        participants: [
          { name: 'সুমাইয়া আক্তার', class_name: '১০ম শ্রেণি', roll_no: '৪', topic: 'শরতের কাশফুল ও পল্লীপ্রকৃতির সৌন্দর্য', category: 'স্বরচিত কবিতা আবৃত্তি', total: 0, position: '' },
          { name: 'মাহফুজ আহমেদ', class_name: '৯ম শ্রেণি', roll_no: '২', topic: 'রবীন্দ্রনাথ ঠাকুরের রূপসী বাংলা ও ছোটগল্প', category: 'উপস্থিত বক্তৃতা', total: 0, position: '' },
          { name: 'ফারজানা মেহজাবীন', class_name: '৯ম শ্রেণি', roll_no: '৩', topic: 'কাজী নজরুল ইসলামের বিদ্রোহী চেতনা', category: 'সাহিত্য পর্যালোচনা', total: 0, position: '' }
        ]
      }));
    }
  };

  // Add participant row (for non-debate clubs)
  const handleAddParticipant = () => {
    setForm(prev => ({
      ...prev,
      participants: [
        ...(prev.participants || []),
        { name: '', class_name: '৯ম শ্রেণি', roll_no: '', topic: '', category: 'সাধারণ', total: 0, position: '' }
      ]
    }));
  };

  // Remove participant row
  const handleRemoveParticipant = (index) => {
    setForm(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('অনুগ্রহ করে প্রস্তাবনা বা বিষয়ের শিরোনাম লিখুন।');
      return;
    }
    onSave(form);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 99999,
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff',
        border: '2px solid #0f172a',
        borderRadius: '14px',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '15px'
          }}
        >
          ✕
        </button>

        {/* MODAL TITLE */}
        <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
          <span style={{ background: clubMeta.lightBg, color: clubMeta.themeColor, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
            {clubMeta.title} • {isEdit ? 'সেশন তথ্য সম্পাদনা' : 'নতুন সেশন আয়োজন'}
          </span>
          <h2 style={{ margin: '6px 0 2px 0', fontSize: '20px', color: '#0f172a', fontWeight: 900 }}>
            {isEdit ? '✏️ প্রতিযোগিতা সেশন সম্পাদনা' : clubMeta.actionBtn}
          </h2>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
            নিচের ফর্মে প্রস্তাবনা, মডারেটর, ৩ জন বিচারক ও দলের সদস্য/প্রতিযোগীদের তালিকা নির্ভুলভাবে পূরণ করুন।
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TOP AUTOFILL DEMO BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={handleAutoFillDemo}
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px dashed #93c5fd',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🪄 ডেমো তথ্য ও প্রতিযোগী স্বয়ংক্রিয় পূরণ করুন
            </button>
          </div>

          {/* BASIC SESSION INFO */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px', color: '#0f172a' }}>
                {isDebate ? '🗣️ বিতর্কের প্রস্তাবনা / বিষয় (Debate Motion) *' : '🏆 প্রতিযোগিতার শিরোনাম / বিষয় *'}
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder={isDebate ? 'যেমন: এই সংসদ মনে করে যে, এআই প্রযুক্তি ভবিষ্যৎ শিক্ষার জন্য হুমকি নয়...' : 'যেমন: বার্ষিক বিজ্ঞান মেলা ও খুদে উদ্ভাবন প্রতিযোগিতা...'}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '3px' }}>প্রতিযোগিতার ধরন / ফরম্যাট</label>
                <input
                  type="text"
                  value={form.format}
                  onChange={e => setForm({ ...form, format: e.target.value })}
                  placeholder={clubMeta.formatPlaceholder}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '3px' }}>তারিখ</label>
                <input
                  type="text"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  placeholder="যেমন: ২০২৬-১০-২৫"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '3px' }}>সময়</label>
                <input
                  type="text"
                  value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  placeholder="যেমন: বেলা ১১:০০ ঘটিকা"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '3px' }}>স্থান / ভেন্যু</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={e => setForm({ ...form, venue: e.target.value })}
                  placeholder="যেমন: বিদ্যালয় কেন্দ্রীয় অডিটোরিয়াম"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* MODERATOR & JUDGES APPOINTMENT */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>
              🎙️ মডারেটর ও বিচারকমণ্ডলী নিযুক্তকরণ
            </h4>

            {/* Moderator */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '3px', color: '#047857' }}>
                  সেশন মডারেটর / স্পিকার নির্বাচন
                </label>
                <select
                  value={form.moderator?.name || ''}
                  onChange={e => {
                    const selName = e.target.value;
                    const foundT = teachers.find(t => t.name_bn === selName);
                    setForm({
                      ...form,
                      moderator: {
                        name: selName,
                        role: foundT ? `${foundT.designation || 'শিক্ষক'} (${foundT.subject || ''})` : (form.moderator?.role || 'সেশন পরিচালক')
                      }
                    });
                  }}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box', background: '#fff' }}
                >
                  {teachers.map((t, idx) => (
                    <option key={idx} value={t.name_bn}>{t.name_bn} — {t.designation || 'শিক্ষক'}</option>
                  ))}
                  <option value="কাস্টম মডারেটর">কাস্টম নাম লিখুন...</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '3px' }}>মডারেটরের পদবি / দায়িত্ব</label>
                <input
                  type="text"
                  value={form.moderator?.role || ''}
                  onChange={e => setForm({
                    ...form,
                    moderator: { ...form.moderator, role: e.target.value }
                  })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Judges 1, 2, 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {[0, 1, 2].map((jIdx) => (
                <div key={jIdx} style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#1e40af', marginBottom: '3px' }}>
                    {jIdx === 0 ? 'প্রধান বিচারক (Judge 1)' : `বিচারক ${jIdx + 1} (Judge ${jIdx + 1})`}
                  </label>
                  <select
                    value={form.judges?.[jIdx]?.name || ''}
                    onChange={e => {
                      const selName = e.target.value;
                      const foundT = teachers.find(t => t.name_bn === selName);
                      const updatedJudges = [...(form.judges || [])];
                      updatedJudges[jIdx] = {
                        name: selName,
                        role: jIdx === 0 ? `প্রধান বিচারক • ${foundT?.designation || 'শিক্ষক'}` : `বিচারক-${jIdx + 1} • ${foundT?.designation || 'শিক্ষক'}`
                      };
                      setForm({ ...form, judges: updatedJudges });
                    }}
                    style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '4px', boxSizing: 'border-box' }}
                  >
                    {teachers.map((t, idx) => (
                      <option key={idx} value={t.name_bn}>{t.name_bn}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={form.judges?.[jIdx]?.role || ''}
                    placeholder="পদবি ও দায়িত্ব"
                    onChange={e => {
                      const updatedJudges = [...(form.judges || [])];
                      updatedJudges[jIdx] = { ...updatedJudges[jIdx], role: e.target.value };
                      setForm({ ...form, judges: updatedJudges });
                    }}
                    style={{ width: '100%', padding: '5px', borderRadius: '5px', border: '1px solid #e2e8f0', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* DEBATERS / PARTICIPANTS APPOINTMENT */}
          {isDebate ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              {/* Proposition Team */}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#166534', marginBottom: '3px' }}>
                    🏛️ পক্ষ দল (Government / Proposition Team Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.propTeam?.teamName || ''}
                    onChange={e => setForm({
                      ...form,
                      propTeam: { ...form.propTeam, teamName: e.target.value }
                    })}
                    placeholder="যেমন: অগ্রগামী একাদশ (৯ম শ্রেণি)"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '5px', border: '1px solid #bbf7d0', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(form.propTeam?.speakers || []).map((sp, idx) => (
                    <div key={idx} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '2px' }}>
                        বক্তা {idx + 1} ({idx === 0 ? 'দলনেতা / ১ম বক্তা' : idx === 1 ? '২য় বক্তা' : '৩য় বক্তা'})
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px' }}>
                        <input
                          type="text"
                          required
                          value={sp.name}
                          placeholder="বক্তার নাম"
                          onChange={e => {
                            const updatedSp = [...(form.propTeam.speakers || [])];
                            updatedSp[idx] = { ...sp, name: e.target.value };
                            setForm({ ...form, propTeam: { ...form.propTeam, speakers: updatedSp } });
                          }}
                          style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={sp.class_name}
                          placeholder="শ্রেণি"
                          onChange={e => {
                            const updatedSp = [...(form.propTeam.speakers || [])];
                            updatedSp[idx] = { ...sp, class_name: e.target.value };
                            setForm({ ...form, propTeam: { ...form.propTeam, speakers: updatedSp } });
                          }}
                          style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={sp.roll_no}
                          placeholder="রোল"
                          onChange={e => {
                            const updatedSp = [...(form.propTeam.speakers || [])];
                            updatedSp[idx] = { ...sp, roll_no: e.target.value };
                            setForm({ ...form, propTeam: { ...form.propTeam, speakers: updatedSp } });
                          }}
                          style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opposition Team */}
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#991b1b', marginBottom: '3px' }}>
                    ⚖️ বিপক্ষ দল (Opposition Team Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.oppTeam?.teamName || ''}
                    onChange={e => setForm({
                      ...form,
                      oppTeam: { ...form.oppTeam, teamName: e.target.value }
                    })}
                    placeholder="যেমন: যুক্তিযোদ্ধা একাদশ (১০ম শ্রেণি)"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '5px', border: '1px solid #fecaca', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(form.oppTeam?.speakers || []).map((sp, idx) => (
                    <div key={idx} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: '2px' }}>
                        বক্তা {idx + 1} ({idx === 0 ? 'দলনেতা / ১ম বক্তা' : idx === 1 ? '২য় বক্তা' : '৩য় বক্তা'})
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px' }}>
                        <input
                          type="text"
                          required
                          value={sp.name}
                          placeholder="বক্তার নাম"
                          onChange={e => {
                            const updatedSp = [...(form.oppTeam.speakers || [])];
                            updatedSp[idx] = { ...sp, name: e.target.value };
                            setForm({ ...form, oppTeam: { ...form.oppTeam, speakers: updatedSp } });
                          }}
                          style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={sp.class_name}
                          placeholder="শ্রেণি"
                          onChange={e => {
                            const updatedSp = [...(form.oppTeam.speakers || [])];
                            updatedSp[idx] = { ...sp, class_name: e.target.value };
                            setForm({ ...form, oppTeam: { ...form.oppTeam, speakers: updatedSp } });
                          }}
                          style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={sp.roll_no}
                          placeholder="রোল"
                          onChange={e => {
                            const updatedSp = [...(form.oppTeam.speakers || [])];
                            updatedSp[idx] = { ...sp, roll_no: e.target.value };
                            setForm({ ...form, oppTeam: { ...form.oppTeam, speakers: updatedSp } });
                          }}
                          style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Other Clubs Participants Form */
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>
                  👥 প্রতিযোগী / উদ্ভাবক তালিকা
                </h4>
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '5px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + প্রতিযোগী যোগ করুন
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(form.participants || []).map((pt, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      required
                      value={pt.name}
                      placeholder="শিক্ষার্থীর / দলের নাম"
                      onChange={e => {
                        const updated = [...(form.participants || [])];
                        updated[idx] = { ...pt, name: e.target.value };
                        setForm({ ...form, participants: updated });
                      }}
                      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={pt.class_name}
                      placeholder="শ্রেণি"
                      onChange={e => {
                        const updated = [...(form.participants || [])];
                        updated[idx] = { ...pt, class_name: e.target.value };
                        setForm({ ...form, participants: updated });
                      }}
                      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={pt.roll_no}
                      placeholder="রোল"
                      onChange={e => {
                        const updated = [...(form.participants || [])];
                        updated[idx] = { ...pt, roll_no: e.target.value };
                        setForm({ ...form, participants: updated });
                      }}
                      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={pt.topic || ''}
                      placeholder="উপস্থাপিত বিষয় / প্রজেক্টের নাম"
                      onChange={e => {
                        const updated = [...(form.participants || [])];
                        updated[idx] = { ...pt, topic: e.target.value };
                        setForm({ ...form, participants: updated });
                      }}
                      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              বাতিল
            </button>
            <button
              type="submit"
              style={{
                background: clubMeta.themeColor,
                color: '#ffffff',
                border: 'none',
                padding: '9px 24px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              💾 সেশন সংরক্ষণ ও চূড়ান্ত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= MODAL COMPONENT 2: SCORING & RESULTS MODAL =================
function ScoringModal({ session, activeClub, onClose, onSave }) {
  const isDebate = activeClub === 'debate';
  const [form, setForm] = useState(JSON.parse(JSON.stringify(session)));

  // Auto calculate debate scores
  const handleDebateScoreChange = (teamKey, speakerIdx, field, val) => {
    const num = Math.min(25, Math.max(0, parseInt(val) || 0));
    const updated = JSON.parse(JSON.stringify(form));
    const speaker = updated[teamKey].speakers[speakerIdx];
    speaker[field] = num;
    speaker.total = (speaker.logic || 0) + (speaker.delivery || 0) + (speaker.rebut || 0) + (speaker.discipline || 0);

    // Sum team total
    updated[teamKey].totalScore = updated[teamKey].speakers.reduce((sum, sp) => sum + (sp.total || 0), 0);

    // Check winner
    const propTot = updated.propTeam.totalScore;
    const oppTot = updated.oppTeam.totalScore;
    const margin = Math.abs(propTot - oppTot);
    const winnerKey = propTot >= oppTot ? 'prop' : 'opp';

    // Find best speaker
    const allSpeakers = [
      ...updated.propTeam.speakers.map(s => ({ ...s, team: updated.propTeam.teamName })),
      ...updated.oppTeam.speakers.map(s => ({ ...s, team: updated.oppTeam.teamName }))
    ];
    allSpeakers.sort((a, b) => (b.total || 0) - (a.total || 0));
    const topSpeaker = allSpeakers[0];

    updated.result = {
      winner: winnerKey,
      winnerName: winnerKey === 'prop' ? updated.propTeam.teamName : updated.oppTeam.teamName,
      runnerUpName: winnerKey === 'prop' ? updated.oppTeam.teamName : updated.propTeam.teamName,
      margin: margin,
      bestSpeaker: `${topSpeaker.name} (${topSpeaker.class_name}, ${topSpeaker.team} — ${topSpeaker.total}/১০০)`,
      judgesRemarks: updated.result?.judgesRemarks || 'উভয় দলই চমৎকার যুক্তি ও তথ্য উপস্থাপন করেছে।'
    };

    setForm(updated);
  };

  // Other clubs score change
  const handleOtherScoreChange = (idx, val) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    const updated = JSON.parse(JSON.stringify(form));
    updated.participants[idx].total = num;

    // Auto sort/rank
    const sorted = [...updated.participants].sort((a, b) => (b.total || 0) - (a.total || 0));
    updated.result = {
      firstPlace: sorted[0] ? `${sorted[0].name} (${sorted[0].total} নম্বর)` : '—',
      secondPlace: sorted[1] ? `${sorted[1].name} (${sorted[1].total} নম্বর)` : '—',
      thirdPlace: sorted[2] ? `${sorted[2].name} (${sorted[2].total} নম্বর)` : '—',
      specialAward: sorted[3] ? `${sorted[3].name} (বিশেষ পুরস্কার)` : '—',
      judgesRemarks: updated.result?.judgesRemarks || 'প্রতিযোগীদের সৃজনশীলতা ও উপস্থাপনা প্রশংসনীয় ছিল।'
    };

    // assign positions
    updated.participants.forEach(p => {
      if (p.name === sorted[0]?.name) p.position = '১ম স্থান (চ্যাম্পিয়ন)';
      else if (p.name === sorted[1]?.name) p.position = '২য় স্থান (রানার-আপ)';
      else if (p.name === sorted[2]?.name) p.position = '৩য় স্থান';
      else p.position = 'বিশেষ সম্মাননা';
    });

    setForm(updated);
  };

  const handleFinalSave = (e) => {
    e.preventDefault();
    const finalObj = {
      ...form,
      status: 'completed'
    };
    onSave(finalObj);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 99999,
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff',
        border: '2px solid #0f172a',
        borderRadius: '14px',
        maxWidth: '880px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '15px'
          }}
        >
          ✕
        </button>

        <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
          <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
            স্কোরিং ও মূল্যায়ন বিবরণী
          </span>
          <h2 style={{ margin: '4px 0 2px 0', fontSize: '19px', color: '#0f172a', fontWeight: 900 }}>
            📝 {isDebate ? 'বিতার্কিকদের নম্বর এন্ট্রি ও ফলাফল প্রস্তুত' : 'প্রতিযোগীদের নম্বর এন্ট্রি ও ফলাফল প্রস্তুত'}
          </h2>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
            প্রস্তাবনা: <b>"{form.title}"</b>
          </p>
        </div>

        <form onSubmit={handleFinalSave}>
          {isDebate ? (
            <div>
              {/* PROPOSITION TEAM SCORING */}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '14px', fontWeight: 900 }}>
                    🏛️ সরকারি / পক্ষ দল: {form.propTeam?.teamName}
                  </h4>
                  <span style={{ background: '#166534', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '13px' }}>
                    মোট স্কোর: {form.propTeam?.totalScore || 0}/৩০০
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(form.propTeam?.speakers || []).map((sp, sIdx) => (
                    <div key={sIdx} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr) 1fr', gap: '8px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{sp.name}</div>
                        <small style={{ color: '#64748b' }}>{sp.role} • {sp.class_name}</small>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>যুক্তি (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.logic || 0}
                          onChange={e => handleDebateScoreChange('propTeam', sIdx, 'logic', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>বাচনভঙ্গি (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.delivery || 0}
                          onChange={e => handleDebateScoreChange('propTeam', sIdx, 'delivery', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>খণ্ডন (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.rebut || 0}
                          onChange={e => handleDebateScoreChange('propTeam', sIdx, 'rebut', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>শৃঙ্খলা (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.discipline || 0}
                          onChange={e => handleDebateScoreChange('propTeam', sIdx, 'discipline', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center', background: '#f8fafc', padding: '4px', borderRadius: '4px', fontWeight: 900, color: '#166534', fontSize: '13.5px' }}>
                        {sp.total || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OPPOSITION TEAM SCORING */}
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: '#991b1b', fontSize: '14px', fontWeight: 900 }}>
                    ⚖️ বিরোধী / বিপক্ষ দল: {form.oppTeam?.teamName}
                  </h4>
                  <span style={{ background: '#991b1b', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '13px' }}>
                    মোট স্কোর: {form.oppTeam?.totalScore || 0}/৩০০
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(form.oppTeam?.speakers || []).map((sp, sIdx) => (
                    <div key={sIdx} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fecaca', display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr) 1fr', gap: '8px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{sp.name}</div>
                        <small style={{ color: '#64748b' }}>{sp.role} • {sp.class_name}</small>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>যুক্তি (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.logic || 0}
                          onChange={e => handleDebateScoreChange('oppTeam', sIdx, 'logic', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>বাচনভঙ্গি (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.delivery || 0}
                          onChange={e => handleDebateScoreChange('oppTeam', sIdx, 'delivery', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>খণ্ডন (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.rebut || 0}
                          onChange={e => handleDebateScoreChange('oppTeam', sIdx, 'rebut', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', color: '#475569' }}>শৃঙ্খলা (২৫)</label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sp.discipline || 0}
                          onChange={e => handleDebateScoreChange('oppTeam', sIdx, 'discipline', e.target.value)}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center', background: '#f8fafc', padding: '4px', borderRadius: '4px', fontWeight: 900, color: '#991b1b', fontSize: '13.5px' }}>
                        {sp.total || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* OTHER CLUBS SCORING */
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', color: '#0f172a' }}>
                📊 প্রতিযোগী / প্রজেক্ট মূল্যায়ন নম্বর (০ - ১০০)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(form.participants || []).map((pt, pIdx) => (
                  <div key={pIdx} style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px' }}>{pt.name}</div>
                      <small style={{ color: '#64748b' }}>{pt.class_name} • রোল {pt.roll_no || '—'}</small>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {pt.topic || pt.title || 'উপস্থাপিত বিষয়'}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>মোট নম্বর (১০০)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pt.total || 0}
                        onChange={e => handleOtherScoreChange(pIdx, e.target.value)}
                        style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
                      />
                    </div>
                    <div style={{ fontWeight: 800, color: '#047857', fontSize: '12px' }}>
                      {pt.position || 'স্থান'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JUDGES REMARKS */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px', color: '#0f172a' }}>
              ⚖️ বিচারকমণ্ডলীর সর্বসম্মত পর্যবেক্ষণ ও মন্তব্য
            </label>
            <textarea
              rows="3"
              value={form.result?.judgesRemarks || ''}
              onChange={e => setForm({
                ...form,
                result: { ...form.result, judgesRemarks: e.target.value }
              })}
              placeholder="বিচারকদের মূল্যায়ন ও গঠনমূলক মন্তব্য লিখুন..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
            />
          </div>

          {/* SUBMIT BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              বাতিল
            </button>
            <button
              type="submit"
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '8px 22px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              ✓ ফলাফল চূড়ান্ত ও সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClubCompetitionEngine;
