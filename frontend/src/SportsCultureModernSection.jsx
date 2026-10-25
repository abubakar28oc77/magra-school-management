import React, { useState, useEffect } from 'react';
import { requestApi } from './apiClient';

// Preloaded Institutional Data for Magra Pals Union High School
const MOCK_SPORTS_WINNERS = [
  { event: '১০০ মিটার দৌড় (বালক)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'তানভীর আহমেদ (১০ম, রোল ১ - পদ্মা)', second: 'আরিফুল ইসলাম (১০ম, রোল ৫ - মেঘনা)', third: 'সাকিব আল হাসান (৯ম, রোল ১২ - যমুনা)', record: '১১.৮ সেকেন্ড' },
  { event: '১০০ মিটার দৌড় (বালিকা)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'ফারহানা ইয়াসমিন (১০ম, রোল ৩ - মেঘনা)', second: 'সাদিয়া সুলতানা (১০ম, রোল ২ - পদ্মা)', third: 'রুবাইয়া আক্তার (৯ম, রোল ৮ - কর্ণফুলী)', record: '১৩.৫ সেকেন্ড' },
  { event: '২০০ মিটার দৌড় (বালক)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'রিফাত হাসান (১০ম, রোল ৪ - মেঘনা)', second: 'তানভীর আহমেদ (১০ম, রোল ১ - পদ্মা)', third: 'মাহমুদুল হাসান (৯ম, রোল ১৫ - যমুনা)', record: '২৪.৩ সেকেন্ড' },
  { event: 'উচ্চ লম্ফ (হাই জাম্প)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'নাঈমুল ইসলাম (১০ম, রোল ৬ - কর্ণফুলী)', second: 'সাকিব আহমেদ (১০ম, রোল ৯ - পদ্মা)', third: 'শামীম রেজা (৯ম, রোল ৭ - মেঘনা)', record: '৫ ফুট ৪ ইঞ্চি' },
  { event: 'দীর্ঘ লম্ফ (লং জাম্প)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'তানভীর আহমেদ (১০ম, রোল ১ - পদ্মা)', second: 'রাকিবুল ইসলাম (৯ম, রোল ৩ - যমুনা)', third: 'আরিফুল ইসলাম (১০ম, রোল ৫ - মেঘনা)', record: '১৮ ফুট ৬ ইঞ্চি' },
  { event: 'লৌহ গোলক নিক্ষেপ (শটপুট)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'মেহেদী হাসান (১০ম, রোল ১৪ - পদ্মা)', second: 'শাহরিয়ার আলম (১০ম, রোল ১০ - কর্ণফুলী)', third: 'ইমরান হোসেন (৯ম, রোল ২০ - মেঘনা)', record: '৩২ ফুট' },
  { event: 'বর্শা নিক্ষেপ (জ্যাভলিন)', group: 'গ-গ্রুপ (৯ম-১০ম)', first: 'জুবায়ের হোসেন (১০ম, রোল ১১ - যমুনা)', second: 'মেহেদী হাসান (১০ম, রোল ১৪ - পদ্মা)', third: 'আসিফ ইকবাল (১০ম, রোল ৮ - মেঘনা)', record: '১৩৫ ফুট' },
  { event: '১০০ মিটার দৌড় (বালক)', group: 'ক-গ্রুপ (৬ষ্ঠ-৭ম)', first: 'সোহাগ মিয়া (৭ম, রোল ২ - পদ্মা)', second: 'আল-আমিন (৭ম, রোল ৫ - মেঘনা)', third: 'মাহিন হাসান (৬ষ্ঠ, রোল ১ - যমুনা)', record: '১৩.২ সেকেন্ড' },
  { event: 'দড়ি লাফ (স্কিপিং)', group: 'খ-গ্রুপ (৮ম)', first: 'সুমাইয়া আক্তার (৮ম, রোল ৪ - পদ্মা)', second: 'জেরিন তাসনিম (৮ম, রোল ৯ - মেঘনা)', third: 'আফরোজা বানু (৮ম, রোল ১৫ - কর্ণফুলী)', record: '১৫০ বার/মিনিট' },
  { event: 'যেমন খুশি তেমন সাজো', group: 'উন্মুক্ত (সকল শ্রেণি)', first: 'বীরশ্রেষ্ঠ মতিউর রহমান (তাহমিদ, ৭ম - পদ্মা)', second: 'রোকেয়া সাখাওয়াত হোসেন (আয়েশা, ৮ম - মেঘনা)', third: 'পল্লি কবি জসিমউদ্দীন (তাহসিন, ৯ম - যমুনা)', record: 'শ্রেষ্ঠ চরিত্র চিত্রণ' },
  { event: 'রশি টানাটানি (হাউজ প্রতিযোগিতা)', group: 'হাউজ দল', first: 'পদ্মা হাউজ দল (চ্যাম্পিয়ন)', second: 'মেঘনা হাউজ দল (রানার্স-আপ)', third: 'যমুনা হাউজ দল', record: '২-১ সেটে জয়ী' },
  { event: 'শিক্ষক বনাম শিক্ষার্থী প্রীতি ক্রিকেট', group: 'বিশেষ ম্যাচ', first: 'শিক্ষার্থী একাদশ (বিজয়ী - ১৮ রানে)', second: 'শিক্ষক একাদশ (রানার্স-আপ)', third: 'ম্যাচ সেরা: তানভীর আহমেদ', record: '১২ ওভার ম্যাচ' }
];

const MOCK_HOUSES = [
  { name: 'পদ্মা হাউজ', color: '#10b981', bg: '#ecfdf5', badge: 'সবুজ', points: 125, gold: 9, silver: 6, bronze: 4, captain: 'তানভীর আহমেদ (১০ম)', master: 'মোঃ রফিকুল ইসলাম (সিনিয়র শিক্ষক)', rank: '১ম (চ্যাম্পিয়ন)' },
  { name: 'মেঘনা হাউজ', color: '#3b82f6', bg: '#eff6ff', badge: 'নীল', points: 108, gold: 7, silver: 8, bronze: 5, captain: 'রিফাত হাসান (১০ম)', master: 'মোঃ আমিনুল হক (সহকারী শিক্ষক)', rank: '২য় (রানার্স-আপ)' },
  { name: 'যমুনা হাউজ', color: '#eab308', bg: '#fefce8', badge: 'হলুদ', points: 95, gold: 5, silver: 5, bronze: 8, captain: 'সাদিয়া সুলতানা (১০ম)', master: 'মোসাঃ নাসরিন আক্তার (সহকারী শিক্ষিকা)', rank: '৩য় স্থান' },
  { name: 'কর্ণফুলী হাউজ', color: '#ef4444', bg: '#fef2f2', badge: 'লাল', points: 82, gold: 4, silver: 4, bronze: 6, captain: 'নাঈমুল ইসলাম (১০ম)', master: 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)', rank: '৪র্থ স্থান' }
];

const MOCK_CULTURAL_PROGRAMS = [
  {
    title: 'পহেলা বৈশাখ ও বাংলা নববর্ষ ১৪৩৩ উদযাপন',
    date: '১৪ এপ্রিল',
    venue: 'বিদ্যালয় মুক্তমঞ্চ ও বকুলতলা',
    chiefGuest: 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ',
    highlights: 'মঙ্গল শোভাযাত্রা, লোকসঙ্গীত আসর, বৈশাখী নৃত্য, পান্তা-ইলিশ উৎসব ও গ্রামীণ মেলা।'
  },
  {
    title: '২১শে ফেব্রুয়ারি মহান শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস',
    date: '২১ ফেব্রুয়ারি',
    venue: 'বিদ্যালয় শহীদ মিনার ও অডিটোরিয়াম',
    chiefGuest: 'বীর মুক্তিযোদ্ধা ও বিশিষ্ট শিক্ষাবিদ',
    highlights: 'রাত ১২:০১ মিনিটে শহীদ মিনারে পুষ্পস্তবক অর্পণ, প্রভাতফেরি, কবিতা আবৃত্তি ও স্বরচিত দেয়াল পত্রিকা প্রদর্শনী।'
  },
  {
    title: '২৬শে মার্চ মহান স্বাধীনতা ও জাতীয় দিবস',
    date: '২৬ মার্চ',
    venue: 'বিদ্যালয় মাঠ ও কেন্দ্রীয় মিলনায়তন',
    chiefGuest: 'উপজেলা মাধ্যমিক শিক্ষা অফিসার',
    highlights: 'জাতীয় পতাকা উত্তোলন, কুচকাওয়াজ ও ডিসপ্লে, মুক্তিযুদ্ধভিত্তিক চিত্রাঙ্কন ও দেশাত্মবোধক গান।'
  },
  {
    title: '১৬ই ডিসেম্বর মহান বিজয় দিবস ও বিশেষ সাংস্কৃতিক সন্ধ্যা',
    date: '১৬ ডিসেম্বর',
    venue: 'বিদ্যালয় মুক্তমঞ্চ',
    chiefGuest: 'উপজেলা নির্বাহী অফিসার',
    highlights: 'বীর মুক্তিযোদ্ধাদের সংবর্ধনা, মুক্তিযুদ্ধভিত্তিক নাটক "রক্তাক্ত একাত্তর", সমবেত সঙ্গীত ও পুরস্কার বিতরণ।'
  },
  {
    title: 'বার্ষিক মিলাদ ও সীরাতুন্নবী (সা.) মাহফিল',
    date: '১২ রবিউল আউয়াল',
    venue: 'বিদ্যালয় মিলনায়তন',
    chiefGuest: 'বিশিষ্ট ইসলামি চিন্তাবিদ ও খতিব',
    highlights: 'হামদ-নাত ও কিরাত প্রতিযোগিতা, সীরাত আলোচনা ও বিশেষ দোয়া মাহফিল।'
  },
  {
    title: 'রবীন্দ্র ও নজরুল জন্মজয়ন্তী উৎসব',
    date: '২৫ বৈশাখ ও ১১ জ্যৈষ্ঠ',
    venue: 'ভাষা ও সাহিত্য কর্নার',
    chiefGuest: 'স্থানীয় বিশিষ্ট সাহিত্যিক',
    highlights: 'রবীন্দ্র সঙ্গীত, নজরুল গীতি, দ্বৈত নৃত্য ও কবিদের জীবনভিত্তিক আলোচনা সভা।'
  }
];

const MOCK_CULTURAL_PERFORMERS = [
  { name: 'ফারজানা আক্তার তিশা', class_name: '১০ম', roll: '৩', category: 'দেশাত্মবোধক গান', item: 'একটি বাংলাদেশ তুমি জাগ্রত জনতার', award: '১ম স্থান (স্বর্ণ)' },
  { name: 'আনিকা তাবাসসুম', class_name: '৯ম', roll: '৭', category: 'রবীন্দ্র সঙ্গীত', item: 'আনন্দলোকে মঙ্গলালোকে', award: '১ম স্থান' },
  { name: 'সাদিয়া ইসলাম ও দল', class_name: '৮ম', roll: 'দলীয়', category: 'লোকনৃত্য', item: 'সোহাগ চাঁদ বদনী ধনী', award: 'সেরা নৃত্য দল' },
  { name: 'তাহমিদ ইসলাম', class_name: '১০ম', roll: '১', category: 'কবিতা আবৃত্তি', item: 'বিদ্রোহী (কাজী নজরুল ইসলাম)', award: '১ম স্থান' },
  { name: 'নাট্যদল "অপরাজেয়"', class_name: '৯ম-১০ম', roll: '১২ জন', category: 'একাঙ্ক নাটক', item: 'রক্তাক্ত একাত্তর (নির্দেশনা: মোঃ রফিকুল ইসলাম)', award: 'বিশেষ জুরি পুরস্কার' },
  { name: 'নুসরাত জাহান', class_name: '৭ম', roll: '৫', category: 'হামদ ও নাত', item: 'ত্রিভুবনের প্রিয় মুহাম্মদ', award: '১ম স্থান' }
];

const MOCK_ACHIEVEMENTS = [
  {
    category: 'ক্রীড়া',
    badge: 'স্বর্ণপদক 🏆',
    title: 'উপজেলা আন্তঃবিদ্যালয় ফুটবল টুর্নামেন্ট চ্যাম্পিয়ন',
    year: '২০২৫-২৬',
    level: 'উপজেলা পর্যায়',
    team: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় ফুটবল একাদশ',
    details: 'ফাইনালে ২-০ গোলে চ্যাম্পিয়ন হওয়ার গৌরব অর্জন। টুর্নামেন্টের সেরা গোলদাতা তানভীর আহমেদ (১০ম শ্রেণি)।'
  },
  {
    category: 'বিজ্ঞান ও অলিম্পিয়াড',
    badge: 'রানার্স-আপ 🥈',
    title: 'জাতীয় সৃজনশীল মেধা অন্বেষণ প্রতিযোগিতা (বিজ্ঞান)',
    year: '২০২৫',
    level: 'জেলা পর্যায়',
    team: 'রাকিবুল হাসান (১০ম শ্রেণি)',
    details: 'পরিবেশবান্ধব সৌরশক্তিচালিত কৃষি সেচ প্রকল্প উপস্থাপন করে জেলা পর্যায়ে ২য় স্থান অর্জন।'
  },
  {
    category: 'বিতর্ক ও সাহিত্য',
    badge: 'চ্যাম্পিয়ন ট্রফি 🏆',
    title: 'টাঙ্গাইল জেলা আন্তঃস্কুল বিতর্ক প্রতিযোগিতা',
    year: '২০২৬',
    level: 'জেলা পর্যায়',
    team: 'ডিবেটিং ক্লাব (ফারহানা, তানভীর ও সাদিয়া)',
    details: 'টানা ৪টি রাউন্ডে অপরাজিত থেকে চ্যাম্পিয়ন হওয়ার গৌরব ও শ্রেষ্ঠ বক্তা হিসেবে ফারহানা ভূষিত।'
  },
  {
    category: 'স্কাউট ও সেবা',
    badge: 'সেরা দল সম্মাননা 🎖️',
    title: 'বাংলাদেশ স্কাউটস জাতীয় ক্যাম্পুরি — শৃঙ্খলা ট্রফি',
    year: '২০২৫',
    level: 'বিভাগীয় ও জাতীয়',
    team: 'মগড়া পালস্ স্কাউট ট্রুপ ও গার্ল গাইড',
    details: 'তাঁবুবাস, পাইওনিয়ারিং ও জরুরি দুর্যোগ ব্যবস্থাপনায় অনন্য দক্ষতার স্বীকৃতিস্বরূপ সম্মাননা লাভ।'
  },
  {
    category: 'একাডেমিক ও বৃত্তি',
    badge: 'ট্যালেন্টপুল বৃত্তি 📜',
    title: 'এসএসসি ও জেএসসি সরকারি মেধা বৃত্তি সাফল্য',
    year: '২০২৫',
    level: 'শিক্ষা বোর্ড',
    team: '১০ জন কৃতি শিক্ষার্থী',
    details: 'বিজ্ঞান বিভাগে ৩ জন ট্যালেন্টপুল এবং বাণিজ্য ও মানবিক বিভাগ মিলিয়ে ৭ জন সাধারণ গ্রেড বৃত্তি লাভ।'
  },
  {
    category: 'বিজ্ঞান ও অলিম্পিয়াড',
    badge: 'ব্রোঞ্জ মেডেল 🥉',
    title: 'আঞ্চলিক গণিত অলিম্পিয়াড ও কুইজ ফেস্টিভ্যাল',
    year: '২০২৬',
    level: 'আঞ্চলিক পর্যায়',
    team: 'তাহসিন আহমেদ (৮ম শ্রেণি)',
    details: 'কঠিন গাণিতিক ধাঁধা ও জ্যামিতি সমাধানে বিশেষ পারদর্শিতার জন্য আঞ্চলিক মেডেল ও সনদ লাভ।'
  }
];

const MOCK_TOURS = [
  {
    title: 'শিক্ষা সফর ২০২৬ — জাতীয় স্মৃতিসৌধ, সাভার ও পানাম নগর, সোনারগাঁ',
    date: '১৫ ফেব্রুয়ারি ২০২৬',
    participants: '১৮০ জন শিক্ষার্থী ও ১২ জন শিক্ষক-কর্মকর্তা',
    buses: '৪টি আধুনিক শীতাতপ নিয়ন্ত্রিত বাস',
    destinations: 'জাতীয় স্মৃতিসৌধ, জাহাঙ্গীরনগর বিশ্ববিদ্যালয় প্রজাপতি পার্ক, সোনারগাঁ লোক ও কারুশিল্প জাদুঘর এবং ঐতিহাসিক পানাম নগর।',
    status: 'সফলভাবে সম্পন্ন'
  },
  {
    title: 'আসন্ন প্রস্তাবিত শিক্ষা সফর — বঙ্গবন্ধু শেখ মুজিব সাফারি পার্ক ও প্রত্নতাত্ত্বিক লালবাগ কেল্লা',
    date: 'নভেম্বর ২০২৬',
    participants: '৬ষ্ঠ থেকে ১০ম শ্রেণির নিবন্ধিত শিক্ষার্থী',
    buses: '৫টি রিজার্ভ বাস',
    destinations: 'বঙ্গবন্ধু শেখ মুজিব সাফারি পার্ক (গাজীপুর), জাতীয় উদ্ভিদ উদ্যান ও ঐতিহাসিক লালবাগ কেল্লা।',
    status: 'নিবন্ধন চলমান'
  }
];

const MOCK_TOUR_ITINERARY = [
  { time: 'ভোর ০৬:০০', event: 'বিদ্যালয় চত্বরে সমাবেশ, আইডি কার্ড যাচাই ও উপস্থিতি গ্রহণ' },
  { time: 'ভোর ০৬:৩০', event: 'বিশেষ দোয়া ও মোনাজাত শেষে সুসজ্জিত বাসে আনন্দযাত্রা শুরু' },
  { time: 'সকাল ০৮:৩০', event: 'চলন্ত বাসে স্বাস্থ্যকর ও পুষ্টিকর প্রাতঃরাশ (নাস্তা) বিতরণ' },
  { time: 'সকাল ১০:০০', event: '১ম গন্তব্যে পৌঁছানো, টিকিট সংগ্রহ ও ঐতিহাসিক স্মৃতিসৌধ/জাদুঘর পরিদর্শন' },
  { time: 'দুপুর ০১:১৫', event: 'নির্ধারিত রিসোর্টে পরিচ্ছন্ন পরিবেশে রাজকীয় মধ্যাহ্নভোজ ও নামাজ/বিশ্রাম' },
  { time: 'বিকাল ০৩:০০', event: 'শিক্ষামূলক কুইজ প্রতিযোগিতা, উপস্থিত বক্তৃতা ও আকর্ষণীয় পুরস্কার বিতরণ' },
  { time: 'বিকাল ০৫:০০', event: 'সন্ধ্যার নাস্তা গ্রহণ শেষে সুরভিত স্মৃতি নিয়ে আনন্দমুখর ফিরতি যাত্রা' },
  { time: 'রাত ০৮:৩০', event: 'নিরাপদে বিদ্যালয় ক্যাম্পাসে প্রত্যাবর্তন ও সম্মানিত অভিভাবকদের কাছে হস্তান্তর' }
];

export function SportsCultureModernSection({ category = '', menuKey = '', initialTitle = '', onClose }) {
  // Determine isolated category strictly based on category prop, menuKey or title
  const getInitialCategory = () => {
    if (category) return category;
    if (menuKey === 'public.nav.sport.sports' || initialTitle?.includes('বার্ষিক ক্রীড়া') || (initialTitle?.includes('ক্রীড়া') && !initialTitle?.includes('সংস্কৃতি'))) return 'sports';
    if (menuKey === 'public.nav.sport.culture' || initialTitle?.includes('সাংস্কৃতিক') || (initialTitle?.includes('সংস্কৃতি') && !initialTitle?.includes('ক্রীড়া'))) return 'culture';
    if (menuKey === 'public.nav.sport.achievements' || initialTitle?.includes('অর্জন') || initialTitle?.includes('পুরস্কার')) return 'achievements';
    if (menuKey === 'public.nav.sport.tour' || initialTitle?.includes('শিক্ষা সফর') || initialTitle?.includes('সফর') || initialTitle?.includes('ট্যুর')) return 'tour';
    return 'sports';
  };

  const activeCategory = getInitialCategory();

  // Internal tab state for the active standalone category
  const [subTab, setSubTab] = useState(() => {
    if (activeCategory === 'sports') return 'winners';
    if (activeCategory === 'culture') return 'programs';
    if (activeCategory === 'achievements') return 'cards';
    if (activeCategory === 'tour') return 'destinations';
    return 'winners';
  });

  const [sportsGroupFilter, setSportsGroupFilter] = useState('সকল গ্রুপ');
  const [achievementFilter, setAchievementFilter] = useState('সব');
  const [dynamicContent, setDynamicContent] = useState([]);
  const [adminStorage, setAdminStorage] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magra_sports_culture_admin_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) setAdminStorage(parsed);
      }
    } catch (_) {}
  }, []);

  // Fetch live published items from API or localStorage
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await requestApi('/public/content');
        if (Array.isArray(res) && res.length > 0) {
          setDynamicContent(res);
        } else {
          const local = JSON.parse(localStorage.getItem('magra_school_content') || '[]');
          if (Array.isArray(local) && local.length > 0) {
            setDynamicContent(local);
          }
        }
      } catch {
        const local = JSON.parse(localStorage.getItem('magra_school_content') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          setDynamicContent(local);
        }
      }
    };
    loadContent();
  }, []);

  // Filter dynamic content strictly for the current active category
  const currentDynamicItems = dynamicContent.filter(item => {
    if (activeCategory === 'sports') return item.content_type === 'sport' || item.title_bn?.includes('ক্রীড়া');
    if (activeCategory === 'culture') return item.content_type === 'event' || item.content_type === 'sport' || item.title_bn?.includes('সাংস্কৃতিক') || item.title_bn?.includes('দিবস');
    if (activeCategory === 'achievements') return item.content_type === 'achievement' || item.title_bn?.includes('অর্জন') || item.title_bn?.includes('পুরস্কার');
    if (activeCategory === 'tour') return item.content_type === 'tour' || item.content_type === 'event' || item.title_bn?.includes('সফর') || item.title_bn?.includes('ট্যুর');
    return false;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sports-culture-modern-root" style={{ width: '100%', color: '#1e293b' }}>
      {/* Print-only Formal Institutional Header */}
      <div className="print-only-official-header" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px double #075c3a', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', color: '#075c3a' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h2>
          <p style={{ margin: '0 0 4px', fontSize: '13px' }}>ডাকঘর: মগড়া, উপজেলা: টাঙ্গাইল সদর, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৩৯ খ্রি.</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
            {activeCategory === 'sports' ? 'বার্ষিক ক্রীড়া ও অ্যাথলেটিক্স প্রতিযোগিতা ২০২৬ — অফিশিয়াল ফলাফল বিবরণী' :
             activeCategory === 'culture' ? 'বার্ষিক সাংস্কৃতিক উৎসব ও অনুষ্ঠান বিবরণী ২০২৬' :
             activeCategory === 'achievements' ? 'বিদ্যালয়ের গৌরবোজ্জ্বল অর্জন ও সম্মাননা সনদ তালিকা' :
             'ঐতিহাসিক শিক্ষা সফর গাইডলাইন, রুটিন ও অনুমোদনপত্র'}
          </p>
        </div>
      </div>

      {/* Top Standalone Header Bar with Print Button (NO other category tabs) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: activeCategory === 'sports' ? '#ecfdf5' :
                    activeCategory === 'culture' ? '#f5f3ff' :
                    activeCategory === 'achievements' ? '#fffbeb' : '#f0f9ff',
        borderRadius: '12px',
        border: `1px solid ${activeCategory === 'sports' ? '#a7f3d0' :
                             activeCategory === 'culture' ? '#ddd6fe' :
                             activeCategory === 'achievements' ? '#fde68a' : '#bae6fd'}`,
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '8px'
      }} className="no-print">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: activeCategory === 'sports' ? '#065f46' :
                 activeCategory === 'culture' ? '#4338ca' :
                 activeCategory === 'achievements' ? '#92400e' : '#0369a1',
          fontWeight: 700,
          fontSize: '14.5px'
        }}>
          <span>
            {activeCategory === 'sports' ? '🏃‍♂️' :
             activeCategory === 'culture' ? '🎭' :
             activeCategory === 'achievements' ? '🏆' : '🚌'}
          </span>
          <span>
            {activeCategory === 'sports' ? 'বার্ষিক ক্রীড়া ও অ্যাথলেটিক্স প্রতিযোগিতা ২০২৬' :
             activeCategory === 'culture' ? 'বার্ষিক সাংস্কৃতিক উৎসব ও জাতীয় দিবস পালন ২০২৬' :
             activeCategory === 'achievements' ? 'বিদ্যালয়ের গৌরবময় অর্জন, ট্রফি ও সম্মাননা স্মারক গ্যালারি' :
             'ঐতিহাসিক শিক্ষা সফর ও শিক্ষামূলক পরিভ্রমণ ২০২৬'}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: `1px solid ${activeCategory === 'sports' ? '#059669' :
                                 activeCategory === 'culture' ? '#6366f1' :
                                 activeCategory === 'achievements' ? '#d97706' : '#0284c7'}`,
            background: '#ffffff',
            color: activeCategory === 'sports' ? '#065f46' :
                   activeCategory === 'culture' ? '#4338ca' :
                   activeCategory === 'achievements' ? '#92400e' : '#0369a1',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        >
          <span>🖨️</span> অফিশিয়াল বিবরণী প্রিন্ট করুন
        </button>
      </div>

      {/* Dynamic Live Notice Banner (If Admin added live content via login dashboard) */}
      {currentDynamicItems.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 700, fontSize: '13px' }}>
            <span>📢</span>
            <span>ড্যাশবোর্ড থেকে হালনাগাদকৃত সাম্প্রতিক লাইভ নোটিশ ও এন্ট্রি ({currentDynamicItems.length} টি)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {currentDynamicItems.map((item, idx) => (
              <div key={item.id || idx} style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '13.5px', color: '#0f172a', fontWeight: 700 }}>{item.title_bn}</h4>
                  {item.event_date && <span style={{ fontSize: '11px', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{item.event_date.slice(0, 10)}</span>}
                </div>
                {item.location && <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '4px' }}>📍 {item.location}</div>}
                {item.description && <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>{item.description}</p>}
                {item.image_url && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={item.image_url} alt={item.title_bn} style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: বার্ষিক ক্রীড়া (ANNUAL SPORTS) - ONLY WHEN SPORTS IS SELECTED */}
      {/* ========================================================================= */}
      {activeCategory === 'sports' && (
        <div>
          {/* Sports Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '18px',
            boxShadow: '0 8px 20px rgba(6,78,59,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>🏅</span> বার্ষিক ক্রীড়া ও অ্যাথলেটিক্স প্রতিযোগিতা ২০২৬
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '21px', fontWeight: 800 }}>সুস্থ দেহ, সুন্দর মন — ক্রীড়াই জীবনের স্পন্দন</h2>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, maxWidth: '750px' }}>
                  মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের ঐতিহ্যবাহী খেলার মাঠে অনুষ্ঠিত হয় বার্ষিক ক্রীড়া উৎসব। এতে ৪টি হাউজের শতাধিক প্রতিযোগী ২৫টিরও বেশি ইভেন্টে পদক অর্জনে লড়াই করে।
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>২৫+</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>ইভেন্ট সংখ্যা</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৪টি</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>প্রতিযোগী হাউজ</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৩৫০+</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>অ্যাথলেট</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sports Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }} className="no-print">
            <button
              type="button"
              onClick={() => setSubTab('winners')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'winners' ? '3px solid #059669' : '3px solid transparent',
                color: subTab === 'winners' ? '#065f46' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              🥇 ফলাফল ও পদক তালিকা
            </button>
            <button
              type="button"
              onClick={() => setSubTab('houses')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'houses' ? '3px solid #059669' : '3px solid transparent',
                color: subTab === 'houses' ? '#065f46' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              🚩 হাউজ পয়েন্ট টেবিল
            </button>
            <button
              type="button"
              onClick={() => setSubTab('schedule')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'schedule' ? '3px solid #059669' : '3px solid transparent',
                color: subTab === 'schedule' ? '#065f46' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              📅 ক্রীড়া সূচি ও রুটিন
            </button>
            <button
              type="button"
              onClick={() => setSubTab('gallery')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'gallery' ? '3px solid #059669' : '3px solid transparent',
                color: subTab === 'gallery' ? '#065f46' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              📸 ফটো গ্যালারি ও মেমোরি
            </button>
          </div>

          {/* Sub-tab 1: Winners & Results */}
          {subTab === 'winners' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                  🏅 ইভেন্ট ভিত্তিক চূড়ান্ত ফলাফল ও বিজয়ী তালিকা
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="no-print">
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>গ্রুপ নির্বাচন:</span>
                  <select
                    value={sportsGroupFilter}
                    onChange={(e) => setSportsGroupFilter(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="সকল গ্রুপ">সকল গ্রুপ</option>
                    <option value="গ-গ্রুপ (৯ম-১০ম)">গ-গ্রুপ (৯ম-১০ম)</option>
                    <option value="খ-গ্রুপ (৮ম)">খ-গ্রুপ (৮ম)</option>
                    <option value="ক-গ্রুপ (৬ষ্ঠ-৭ম)">ক-গ্রুপ (৬ষ্ঠ-৭ম)</option>
                    <option value="উন্মুক্ত">উন্মুক্ত / বিশেষ</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '9px 12px' }}>ইভেন্টের নাম</th>
                      <th style={{ padding: '9px 12px' }}>গ্রুপ</th>
                      <th style={{ padding: '9px 12px', color: '#b45309' }}>🥇 ১ম স্থান (স্বর্ণ)</th>
                      <th style={{ padding: '9px 12px', color: '#475569' }}>🥈 ২য় স্থান (রৌপ্য)</th>
                      <th style={{ padding: '9px 12px', color: '#92400e' }}>🥉 ৩য় স্থান (ব্রোঞ্জ)</th>
                      <th style={{ padding: '9px 12px' }}>রেকর্ড / বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((adminStorage?.sports?.length) ? 
                        adminStorage.sports.filter(e => e.result && e.result.first).map(e => ({
                          event: e.title,
                          group: e.group,
                          first: `${e.result.first.name} (${e.result.first.class_name}, রোল ${e.result.first.roll_no} - ${e.result.first.house?.replace(' হাউজ','')})`,
                          second: e.result.second?.name ? `${e.result.second.name} (${e.result.second.class_name}, রোল ${e.result.second.roll_no} - ${e.result.second.house?.replace(' হাউজ','')})` : '—',
                          third: e.result.third?.name ? `${e.result.third.name} (${e.result.third.class_name}, রোল ${e.result.third.roll_no} - ${e.result.third.house?.replace(' হাউজ','')})` : '—',
                          record: e.result.first.timing || 'চূড়ান্ত বিজয়ী'
                        })) : MOCK_SPORTS_WINNERS)
                      .filter(item => sportsGroupFilter === 'সকল গ্রুপ' || item.group.includes(sportsGroupFilter.replace(' (সকল শ্রেণি)', '')))
                      .map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{row.event}</td>
                          <td style={{ padding: '8px 12px' }}><span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{row.group}</span></td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#065f46' }}>{row.first}</td>
                          <td style={{ padding: '8px 12px', color: '#334155' }}>{row.second}</td>
                          <td style={{ padding: '8px 12px', color: '#78350f' }}>{row.third}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '11.5px' }}>{row.record}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Houses Leaderboard */}
          {subTab === 'houses' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                  🚩 ৪টি হাউজের পয়েন্ট তালিকা ও চূড়ান্ত চ্যাম্পিয়নশিপ ২০২৬
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  প্রতিযোগীদের অর্জিত পয়েন্ট: ১ম স্থান = ৫ পয়েন্ট, ২য় স্থান = ৩ পয়েন্ট, ৩য় স্থান = ১ পয়েন্ট।
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                {MOCK_HOUSES.map((house, idx) => (
                  <div key={idx} style={{
                    background: house.bg,
                    border: `1.5px solid ${house.color}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: house.color }}>{house.name}</span>
                      <span style={{ background: house.color, color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        {house.rank}
                      </span>
                    </div>

                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {house.points} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>পয়েন্ট</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', margin: '8px 0', fontSize: '12px' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>🥇 {house.gold}টি স্বর্ণ</span>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>🥈 {house.silver}টি রৌপ্য</span>
                      <span style={{ background: '#ffedd5', color: '#9a3412', padding: '2px 6px', borderRadius: '4px' }}>🥉 {house.bronze}টি ব্রোঞ্জ</span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#475569', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '8px', marginTop: '8px' }}>
                      <div><b>অধিনায়ক:</b> {house.captain}</div>
                      <div><b>হাউজ মাস্টার:</b> {house.master}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 3: Schedule & Guidelines */}
          {subTab === 'schedule' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#065f46', fontWeight: 700 }}>⏱️ ক্রীড়া দিবসের কার্যক্রম সূচি</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.8' }}>
                  <li><b>সকাল ০৮:৩০:</b> শিক্ষার্থীদের সমাবেশ ও হাউজভিত্তিক সুশৃঙ্খল অবস্থান।</li>
                  <li><b>সকাল ০৯:০০:</b> জাতীয় পতাকা ও ক্রীড়া পতাকা উত্তোলন, জাতীয় সঙ্গীত পরিবেশন।</li>
                  <li><b>সকাল ০৯:১৫:</b> অলিম্পিক মশাল প্রজ্জ্বলন ও অ্যাথলেটদের শপথ বাক্য পাঠ।</li>
                  <li><b>সকাল ০৯:৩০:</b> ট্র‍্যাক অ্যান্ড ফিল্ড ইভেন্ট শুরু (স্প্রিন্ট, হাই জাম্প, লং জাম্প)।</li>
                  <li><b>দুপুর ০১:০০:</b> মধ্যাহ্নভোজ ও নামাজ/বিশ্রাম।</li>
                  <li><b>বিকাল ০২:৩০:</b> যেমন খুশি তেমন সাজো ও ঐতিহ্যবাহী রশি টানাটানি।</li>
                  <li><b>বিকাল ০৩:৩০:</b> শিক্ষক বনাম শিক্ষার্থী প্রীতি ক্রিকেট ম্যাচ।</li>
                  <li><b>বিকাল ০৪:৩০:</b> প্রধান অতিথি ও সভাপতির হাত থেকে ট্রফি ও পুরস্কার বিতরণ।</li>
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0369a1', fontWeight: 700 }}>📜 শৃঙ্খলা ও সাধারণ নিয়মাবলি</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.8' }}>
                  <li>প্রত্যেক শিক্ষার্থীকে নির্ধারিত হাউজ পোশাকে/ব্যাজে অংশ নিতে হবে।</li>
                  <li>একজন প্রতিযোগী ব্যক্তিগত সর্বোচ্চ ৩টি ইভেন্টে অংশ নিতে পারবে (যেমন খুশি তেমন সাজো ও রশি টানাটানি ব্যতীত)।</li>
                  <li>রেফারি ও বিচারকমণ্ডলীর সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।</li>
                  <li>মাঠে শৃঙ্খলা ভঙ্গের দায়ে হাউজের পয়েন্ট কর্তন হতে পারে।</li>
                  <li>জরুরি চিকিৎসার জন্য ফার্স্ট এইড বুথ ও স্কাউট দল সার্বক্ষণিক নিয়োজিত থাকে।</li>
                </ul>
              </div>
            </div>
          )}

          {/* Sub-tab 4: Gallery */}
          {subTab === 'gallery' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { title: 'অলিম্পিক মশাল প্রজ্জ্বলন ও উদ্বোধন', tag: 'উদ্বোধনী মুহূর্ত' },
                  { title: '১০০ মিটার স্প্রিন্টে তীব্র প্রতিদ্বন্দ্বিতা', tag: 'ট্র্যাক ইভেন্ট' },
                  { title: 'উচ্চ লম্ফে অ্যাথলেটদের চমকপ্রদ নৈপুণ্য', tag: 'ফিল্ড ইভেন্ট' },
                  { title: 'যেমন খুশি তেমন সাজো — বীরশ্রেষ্ঠ মতিউর রহমান', tag: 'সাংস্কৃতিক ক্রীড়া' },
                  { title: 'চ্যাম্পিয়ন পদ্মা হাউজের ট্রফি উদযাপন', tag: 'ট্রফি প্রদান' },
                  { title: 'শিক্ষক একাদশ বনাম ছাত্র একাদশ প্রীতি ম্যাচ', tag: 'প্রীতি ম্যাচ' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{
                      height: '110px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '32px',
                      marginBottom: '8px'
                    }}>
                      🏃
                    </div>
                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{item.tag}</span>
                    <h5 style={{ margin: '6px 0 0', fontSize: '12px', color: '#0f172a' }}>{item.title}</h5>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: সাংস্কৃতিক অনুষ্ঠান (CULTURAL PROGRAMS) - ONLY WHEN CULTURE IS SELECTED */}
      {/* ========================================================================= */}
      {activeCategory === 'culture' && (
        <div>
          {/* Culture Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '18px',
            boxShadow: '0 8px 20px rgba(67,56,202,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>🎭</span> বার্ষিক সাংস্কৃতিক উৎসব ও জাতীয় দিবস পালন ২০২৬
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '21px', fontWeight: 800 }}>শিল্প, সাহিত্য ও ঐতিহ্যের আলোয় উদ্ভাসিত মনন</h2>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, maxWidth: '750px' }}>
                  জাতীয় দিবসসমূহ যথাযোগ্য মর্যাদায় উদযাপন এবং বাৎসরিক সাংস্কৃতিক উৎসবের মাধ্যমে শিক্ষার্থীদের মাঝে বাঙালি সংস্কৃতি, দেশপ্রেম ও সৃজনশীল মেধার বিকাশ ঘটানো হয়।
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৬টি</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>প্রধান উৎসব</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৫টি</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>শিল্প শাখা</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>২০০+</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>শিল্পী শিক্ষার্থী</div>
                </div>
              </div>
            </div>
          </div>

          {/* Culture Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }} className="no-print">
            <button
              type="button"
              onClick={() => setSubTab('programs')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'programs' ? '3px solid #6366f1' : '3px solid transparent',
                color: subTab === 'programs' ? '#4338ca' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              📅 উদযাপিত অনুষ্ঠান ও উৎসবসমূহ
            </button>
            <button
              type="button"
              onClick={() => setSubTab('performers')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'performers' ? '3px solid #6366f1' : '3px solid transparent',
                color: subTab === 'performers' ? '#4338ca' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              🎤 কৃতি শিল্পী ও পরিবেশনা তালিকা
            </button>
            <button
              type="button"
              onClick={() => setSubTab('gallery')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'gallery' ? '3px solid #6366f1' : '3px solid transparent',
                color: subTab === 'gallery' ? '#4338ca' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              📸 সাংস্কৃতিক স্মৃতি গ্যালারি
            </button>
          </div>

          {/* Sub-tab: Programs */}
          {subTab === 'programs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {((adminStorage?.culture?.length) ? adminStorage.culture : MOCK_CULTURAL_PROGRAMS).map((prog, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {prog.date}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>📍 {prog.venue}</span>
                    </div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#1e1b4b', fontWeight: 700 }}>
                      {prog.title}
                    </h4>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                      {prog.highlights}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', fontSize: '11.5px', color: '#6d28d9' }}>
                    <b>প্রধান অতিথি:</b> {prog.chiefGuest}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-tab: Performers */}
          {subTab === 'performers' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                  🎤 বাৎসরিক সাংস্কৃতিক পরিবেশনায় কৃতি শিক্ষার্থীদের তালিকা
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  সংগীত, নৃত্য, আবৃত্তি ও অভিনয়ে শ্রেষ্ঠত্ব অর্জনকারী শিক্ষার্থীরা বিভিন্ন জাতীয় দিবসে বিদ্যালয়কে প্রতিনিধিত্ব করে।
                </p>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f5f3ff', color: '#4c1d95', borderBottom: '1px solid #ddd6fe' }}>
                      <th style={{ padding: '9px 12px' }}>শিক্ষার্থীর নাম</th>
                      <th style={{ padding: '9px 12px' }}>শ্রেণি ও রোল</th>
                      <th style={{ padding: '9px 12px' }}>শাখা / ক্যাটাগরি</th>
                      <th style={{ padding: '9px 12px' }}>পরিবেশিত গান / রচনা</th>
                      <th style={{ padding: '9px 12px' }}>অর্জন / স্বীকৃতি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_CULTURAL_PERFORMERS.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#faf5ff' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e1b4b' }}>{row.name}</td>
                        <td style={{ padding: '8px 12px' }}>{row.class_name} ({row.roll})</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{row.category}</span></td>
                        <td style={{ padding: '8px 12px', color: '#334155' }}>{row.item}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#059669' }}>{row.award}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab: Gallery */}
          {subTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { title: 'পহেলা বৈশাখ মঙ্গল শোভাযাত্রা ও বর্ণিল সাজ', tag: 'বর্ষবরণ' },
                { title: 'শহীদ মিনারে প্রভাতফেরি ও ভাষা শহীদদের শ্রদ্ধা', tag: '২১শে ফেব্রুয়ারি' },
                { title: 'স্বাধীনতা দিবসের সমবেত দেশাত্মবোধক গান', tag: '২৬শে মার্চ' },
                { title: 'মুক্তিযুদ্ধভিত্তিক নাটক "রক্তাক্ত একাত্তর" মঞ্চায়ন', tag: 'নাট্যোৎসব' },
                { title: 'রবীন্দ্র জন্মজয়ন্তীতে একক ও দলীয় রবীন্দ্র নৃত্য', tag: 'রবীন্দ্র জয়ন্তী' },
                { title: 'হামদ-নাত ও কিরাত প্রতিযোগিতার সমাপনী ও দোয়া', tag: 'মিলাদ মাহফিল' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                }}>
                  <div style={{
                    height: '110px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '32px',
                    marginBottom: '8px'
                  }}>
                    🎭
                  </div>
                  <span style={{ fontSize: '10.5px', background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{item.tag}</span>
                  <h5 style={{ margin: '6px 0 0', fontSize: '12px', color: '#0f172a' }}>{item.title}</h5>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: অর্জন ও পুরস্কার (ACHIEVEMENTS & AWARDS) - ONLY WHEN ACHIEVEMENTS IS SELECTED */}
      {/* ========================================================================= */}
      {activeCategory === 'achievements' && (
        <div>
          {/* Achievements Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '18px',
            boxShadow: '0 8px 20px rgba(120,53,15,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>🏆</span> গৌরবময় অর্জন, ট্রফি ও সম্মাননা স্মারক গ্যালারি
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '21px', fontWeight: 800 }}>আমাদের ঐতিহ্য, আমাদের অনন্য জাতীয় ও আঞ্চলিক সাফল্য</h2>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, maxWidth: '750px' }}>
                  ক্রীড়াঙ্গন, বিতর্ক, বিজ্ঞান অলিম্পিয়াড, স্কাউটিং এবং মেধা অন্বেষণে মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের শিক্ষার্থীরা প্রতিনিয়ত বয়ে আনছে অনন্য সম্মান ও গৌরব।
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৫০+</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>ঐতিহাসিক ট্রফি</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>১২টি</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>জেলা চ্যাম্পিয়ন</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৫টি</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>জাতীয় স্বীকৃতি</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }} className="no-print">
            {['সব', 'ক্রীড়া', 'বিজ্ঞান ও অলিম্পিয়াড', 'বিতর্ক ও সাহিত্য', 'স্কাউট ও সেবা', 'একাডেমিক ও বৃত্তি'].map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAchievementFilter(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: achievementFilter === cat ? 'none' : '1px solid #cbd5e1',
                  background: achievementFilter === cat ? '#b45309' : '#ffffff',
                  color: achievementFilter === cat ? '#ffffff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {((adminStorage?.achievements?.length) ? adminStorage.achievements : MOCK_ACHIEVEMENTS)
              .filter(item => achievementFilter === 'সব' || item.category === achievementFilter)
              .map((ach, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(180,83,9,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11.5px', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {ach.badge}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{ach.level} • {ach.year}</span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#78350f', fontWeight: 800 }}>
                      {ach.title}
                    </h4>

                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                      👥 {ach.team}
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.45' }}>
                      {ach.details}
                    </p>
                  </div>

                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #fed7aa', fontSize: '11px', color: '#b45309', display: 'flex', justifyContent: 'space-between' }}>
                    <span>ক্যাটাগরি: {ach.category}</span>
                    <span style={{ fontWeight: 600 }}>স্বীকৃত ও সংরক্ষিত 🌟</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: শিক্ষা সফর (EDUCATIONAL TOUR) - ONLY WHEN TOUR IS SELECTED */}
      {/* ========================================================================= */}
      {activeCategory === 'tour' && (
        <div>
          {/* Tour Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '18px',
            boxShadow: '0 8px 20px rgba(3,105,161,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>🚌</span> ঐতিহাসিক শিক্ষা সফর ও শিক্ষামূলক পরিভ্রমণ ২০২৬
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '21px', fontWeight: 800 }}>শ্রেণিকক্ষের বাইরে মুক্ত জ্ঞানের ভুবনে পরিভ্রমণ</h2>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, maxWidth: '750px' }}>
                  ইতিহাস, প্রত্নতত্ত্ব, ঐতিহ্য ও প্রাকৃতিক বৈচিত্র্যকে শিক্ষার্থীদের কাছে প্রত্যক্ষ অভিজ্ঞতায় পরিচয় করিয়ে দিতে প্রতিবছর সুশৃঙ্খল শিক্ষা সফর আয়োজন করা হয়।
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>১৮০+</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>অংশগ্রহণকারী</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>৪টি</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>দর্শনীয় স্থান</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>১০০%</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>নিরাপত্তা ও যত্ন</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }} className="no-print">
            <button
              type="button"
              onClick={() => setSubTab('destinations')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'destinations' ? '3px solid #0284c7' : '3px solid transparent',
                color: subTab === 'destinations' ? '#0369a1' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              🗺️ গন্তব্য ও ঐতিহাসিক গুরুত্ব
            </button>
            <button
              type="button"
              onClick={() => setSubTab('itinerary')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'itinerary' ? '3px solid #0284c7' : '3px solid transparent',
                color: subTab === 'itinerary' ? '#0369a1' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              ⏱️ দিনপঞ্জি ও ভ্রমণ রুটিন
            </button>
            <button
              type="button"
              onClick={() => setSubTab('safety')}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: 'none',
                borderBottom: subTab === 'safety' ? '3px solid #0284c7' : '3px solid transparent',
                color: subTab === 'safety' ? '#0369a1' : '#64748b',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              🛡️ শৃঙ্খলা, নিরাপত্তা ও যোগাযোগ
            </button>
          </div>

          {/* Sub-tab: Destinations */}
          {subTab === 'destinations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {((adminStorage?.tours?.length) ? adminStorage.tours : MOCK_TOURS).map((tour, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 6px rgba(2,132,199,0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      তারিখ: {tour.date}
                    </span>
                    <span style={{ fontSize: '11px', background: tour.status.includes('সফল') ? '#dcfce7' : '#fef3c7', color: tour.status.includes('সফল') ? '#15803d' : '#b45309', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {tour.status}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#0c4a6e', fontWeight: 800 }}>
                    {tour.title}
                  </h3>

                  <div style={{ fontSize: '12.5px', color: '#334155', marginBottom: '8px' }}>
                    <b>📍 ভ্রমণ স্থানসমূহ:</b> {tour.destinations}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11.5px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <span>👥 {tour.participants}</span>
                    <span>🚌 {tour.buses}</span>
                  </div>
                </div>
              ))}

              {/* Destination Highlights Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginTop: '4px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: '#0284c7' }}>🏛️ জাতীয় স্মৃতিসৌধ (সাভার)</h4>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#475569' }}>১৯৭১-এর বীর শহীদদের প্রতি বিনম্র শ্রদ্ধা জ্ঞাপন এবং মুক্তিযুদ্ধের রক্তঝরা ইতিহাসের চাক্ষুষ পাঠ।</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: '#0284c7' }}>🏰 পানাম নগর ও লোকশিল্প জাদুঘর (সোনারগাঁ)</h4>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#475569' }}>প্রাচীন সুবর্ণগ্রামের রাজধানী, কারুশিল্পের ঐতিহ্যবাহী নিদর্শনাদি ও শিল্পাচার্য জয়নুল আবেদিনের সংগ্রহশালা।</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: '#0284c7' }}>🦁 বঙ্গবন্ধু শেখ মুজিব সাফারি পার্ক</h4>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#475569' }}>প্রাকৃতিক পরিবেশে মুক্ত বন্যপ্রাণী অবলোকন, জীববৈচিত্র্য সংরক্ষণ ও বোটানিক্যাল জ্ঞান অর্জন।</p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Itinerary */}
          {subTab === 'itinerary' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                  ⏱️ শিক্ষা সফরের দিনপঞ্জি ও সময়সূচি (আদর্শ ভ্রমণ রুটিন)
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  সফরকে আনন্দমুখর ও সুশৃঙ্খল রাখতে প্রতিটি দলের জন্য নির্ধারিত সময় কঠোরভাবে মেনে চলা হয়।
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MOCK_TOUR_ITINERARY.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    background: idx % 2 === 0 ? '#f0f9ff' : '#ffffff',
                    border: '1px solid #e0f2fe',
                    borderRadius: '8px'
                  }}>
                    <span style={{
                      minWidth: '90px',
                      background: '#0284c7',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}>
                      {step.time}
                    </span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                      {step.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab: Safety & Contacts */}
          {subTab === 'safety' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0369a1', fontWeight: 700 }}>🛡️ শৃঙ্খলা ও সুরক্ষা নির্দেশিকা</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.8' }}>
                  <li>বিদ্যালয়ের নির্ধারিত আইডি কার্ড সার্বক্ষণিক গলায় ধারণ করতে হবে।</li>
                  <li>প্রতি ১০ জন শিক্ষার্থীর জন্য ১ জন শিক্ষক গ্রুপ লিডার নির্ধারিত থাকেন, শিক্ষকের অনুমতি ছাড়া দলের বাইরে যাওয়া নিষেধ।</li>
                  <li>বাসের জানালায় হাত বা মাথা বাইরে বের করা সম্পূর্ণ নিষিদ্ধ।</li>
                  <li>জরুরি ফার্স্ট এইড বক্স ও সার্বক্ষণিক চিকিৎসক দল বহরে সঙ্গে থাকেন।</li>
                  <li>কোনো অসুস্থতা বোধ করলে সাথে সাথে দায়িত্বপ্রাপ্ত শিক্ষককে জানাতে হবে।</li>
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0369a1', fontWeight: 700 }}>📞 সফর পরিচালনা কমিটি ও যোগাযোগ</h4>
                <div style={{ fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><b>প্রধান উপদেষ্টা:</b> প্রধান শিক্ষক (মোবাইল: ০১৭XXXXXXXX)</div>
                  <div><b>সফর আহ্বায়ক:</b> সহকারী প্রধান শিক্ষক (মোবাইল: ০১৭XXXXXXXX)</div>
                  <div><b>শৃঙ্খলা ও রুটিন ইনচার্জ:</b> সিনিয়র শারীরিক শিক্ষা শিক্ষক</div>
                  <div><b>মেডিকেল ও ফার্স্ট এইড টিম:</b> জরুরি হটলাইন ও অ্যাম্বুলেন্স সেবা</div>
                  <div style={{ marginTop: '4px', background: '#e0f2fe', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', color: '#0369a1' }}>
                    💡 অভিভাবকগণ সফরের দিন বিদ্যালয় কন্ট্রোল রুম থেকে শিক্ষার্থীদের লাইভ লোকেশন ও সার্বিক আপডেট জানতে পারবেন।
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Formal Signatures Section */}
      <div className="print-only-signatures" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', borderBottom: '1px solid #64748b', marginBottom: '4px' }}></div>
          <span>আহ্বায়ক / দায়িত্বপ্রাপ্ত শিক্ষক</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', borderBottom: '1px solid #64748b', marginBottom: '4px' }}></div>
          <span>সহকারী প্রধান শিক্ষক</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', borderBottom: '1px solid #075c3a', marginBottom: '4px' }}></div>
          <b style={{ color: '#075c3a' }}>প্রধান শিক্ষক</b>
          <div style={{ fontSize: '10.5px' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>
      </div>
    </div>
  );
}
