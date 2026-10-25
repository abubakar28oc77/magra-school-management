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

// Computer Lab (শেখ রাসেল ডিজিটাল ল্যাব ও আইসিটি সেন্টার)
// Computer Lab (শেখ রাসেল ডিজিটাল ল্যাব ও আইসিটি সেন্টার — ৩টি স্টক রেজিস্টার বুক)
const MOCK_LAB_DEVICES = [
  // 1. সচল স্টক রেজিস্টার বুক (Active Stock Register)
  { id: 'pc-01', assetTag: 'MP-SRDL-PC-01', name: 'মাস্টার কন্ট্রোল ওয়ার্কস্টেশন (শিক্ষক ও ইনচার্জ)', category: 'ডেস্কটপ', model: 'HP ProDesk 400 G7 Microtower', cpu: 'Intel Core i5 10th Gen 3.10GHz', ram: '16 GB DDR4', storage: '512 GB NVMe SSD + 1TB HDD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)', procurementYear: '২০২১', condition: 'সক্রিয় ও চমৎকার', ip: '192.168.1.10', desk: 'মঞ্চ শিক্ষক ডেস্ক-০১', registerType: 'active' },
  { id: 'pc-02', assetTag: 'MP-SRDL-PC-02', name: 'শিক্ষার্থী ওয়ার্কস্টেশন ০২', category: 'ডেস্কটপ', model: 'Dell OptiPlex 3080 Micro', cpu: 'Intel Core i3 10th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.11', desk: 'সারি-১, ডেস্ক-০২', registerType: 'active' },
  { id: 'pc-03', assetTag: 'MP-SRDL-PC-03', name: 'শিক্ষার্থী ওয়ার্কস্টেশন ০৩', category: 'ডেস্কটপ', model: 'Dell OptiPlex 3080 Micro', cpu: 'Intel Core i3 10th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.12', desk: 'সারি-১, ডেস্ক-০৩', registerType: 'active' },
  { id: 'pc-04', assetTag: 'MP-SRDL-PC-04', name: 'শিক্ষার্থী ওয়ার্কস্টেশন ০৪', category: 'ডেস্কটপ', model: 'Dell OptiPlex 3080 Micro', cpu: 'Intel Core i3 10th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.13', desk: 'সারি-২, ডেস্ক-০৪', registerType: 'active' },
  { id: 'pc-05', assetTag: 'MP-SRDL-PC-05', name: 'শিক্ষার্থী ওয়ার্কস্টেশন ০৫', category: 'ডেস্কটপ', model: 'Dell OptiPlex 3080 Micro', cpu: 'Intel Core i3 10th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.14', desk: 'সারি-২, ডেস্ক-০৫', registerType: 'active' },
  { id: 'pc-06', assetTag: 'MP-SRDL-PC-06', name: 'শিক্ষার্থী ওয়ার্কস্টেশন ০৬', category: 'ডেস্কটপ', model: 'Dell OptiPlex 3080 Micro', cpu: 'Intel Core i3 10th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.15', desk: 'সারি-২, ডেস্ক-০৬', registerType: 'active' },
  { id: 'lp-01', assetTag: 'MP-ICT-LP-01', name: 'আইসিটি ইনচার্জ প্রফেশনাল ল্যাপটপ', category: 'ল্যাপটপ', model: 'Acer TravelMate P214 Core i5', cpu: 'Intel Core i5 11th Gen', ram: '16 GB DDR4', storage: '512 GB PCIe NVMe SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২২', condition: 'সক্রিয় ও নিখুঁত', ip: '192.168.1.30', desk: 'ল্যাব ইনচার্জ ডেস্ক', registerType: 'active' },
  { id: 'lp-02', assetTag: 'MP-ICT-LP-02', name: 'মাল্টিমিডিয়া প্রেজেন্টেশন ল্যাপটপ', category: 'ল্যাপটপ', model: 'HP ProBook 450 G8', cpu: 'Intel Core i5 11th Gen', ram: '8 GB DDR4', storage: '512 GB SSD', source: 'বিদ্যালয় নিজস্ব উন্নয়ন তহবিল', procurementYear: '২০২৩', condition: 'সক্রিয়', ip: '192.168.1.31', desk: 'প্রেজেন্টেশন কর্নার', registerType: 'active' },
  { id: 'lp-03', assetTag: 'MP-ICT-LP-03', name: 'ল্যাব প্র্যাকটিক্যাল কোডিং ল্যাপটপ', category: 'ল্যাপটপ', model: 'Dell Vostro 3510', cpu: 'Intel Core i3 11th Gen', ram: '8 GB DDR4', storage: '256 GB SSD + 1TB HDD', source: 'মাউশি আইসিটি অনুদান', procurementYear: '২০২৩', condition: 'সক্রিয়', ip: '192.168.1.32', desk: 'কোডিং কর্নার', registerType: 'active' },
  { id: 'mon-01', assetTag: 'MP-ICT-MON-01', name: 'ইনচার্জ ২১.৫" আইপিএস মনিটর', category: 'মনিটর', model: 'HP 22f 21.5" Full HD IPS Display', cpu: '1080p, 75Hz Ultra Slim', ram: 'HDMI & VGA', storage: 'Anti-Glare Panel', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: 'N/A', desk: 'শিক্ষক ডেস্ক', registerType: 'active' },
  { id: 'tv-01', assetTag: 'MP-ICT-TV-01', name: '৬৫" ইন্টারেক্টিভ স্মার্ট অ্যান্ড্রয়েড টিভি', category: 'স্মার্ট টিভি', model: 'Walton 65" 4K UHD Smart Google TV', cpu: 'Quad Core Processor, 4K HDR', ram: '2 GB RAM', storage: '16 GB ROM + Wi-Fi Display', source: 'বিদ্যালয় নিজস্ব উন্নয়ন তহবিল', procurementYear: '২০২৪', condition: 'সক্রিয় ও নিখুঁত', ip: '192.168.1.40', desk: 'ল্যাব ফ্রন্ট ডিসপ্লে ওয়াল', registerType: 'active' },
  { id: 'prj-01', assetTag: 'MP-ICT-PRJ-01', name: 'ইন্টারেক্টিভ আল্ট্রা শর্ট-থ্রো লেজার প্রজেক্টর', category: 'প্রজেক্টর', model: 'Epson EB-685Wi Ultra Short Throw', cpu: 'Laser 3500 Lumens WXGA', ram: 'Dual Pen & Touch Interactive', storage: 'Wall Mount Kit + HDMI Hub', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.20', desk: 'স্মার্ট হোয়াইট বোর্ড ওয়াল', registerType: 'active' },
  { id: 'prn-01', assetTag: 'MP-ICT-PRN-01', name: 'হাই-স্পিড নেটওয়ার্ক লেজার প্রিন্টার', category: 'প্রিন্টার', model: 'Canon imageCLASS LBP2900B', cpu: 'Laser Mono Printing 12ppm', ram: '64 MB USB', storage: 'Cartridge 303 Supported', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.25', desk: 'আইসিটি প্রিন্ট ও স্ক্যান কর্নার', registerType: 'active' },
  { id: 'prn-02', assetTag: 'MP-ICT-PRN-02', name: 'অল-ইন-ওয়ান মাল্টিফাংশন নেটওয়ার্ক প্রিন্টার', category: 'প্রিন্টার', model: 'HP LaserJet Pro MFP M126nw (Print/Scan/Copy)', cpu: 'Fast Ethernet & Wi-Fi Direct', ram: '128 MB', storage: 'Flatbed Scanner + Duplex Copy', source: 'বিদ্যালয় নিজস্ব তহবিল', procurementYear: '২০২৩', condition: 'সক্রিয়', ip: '192.168.1.26', desk: 'প্রিন্টিং কর্নার ডেস্ক', registerType: 'active' },
  { id: 'scn-01', assetTag: 'MP-ICT-SCN-01', name: 'হাই-রেজোলিউশন ফ্ল্যাটবেড স্ক্যানার', category: 'স্ক্যানার', model: 'Canon CanoScan LiDE 300 2400x2400 dpi', cpu: 'CIS Sensor, 4 EZ Buttons', ram: 'USB Bus-Powered', storage: 'Auto Scan & PDF Generation', source: 'বিদ্যালয় নিজস্ব উন্নয়ন তহবিল', procurementYear: '২০২৩', condition: 'সক্রিয়', ip: 'USB Direct', desk: 'ইনচার্জ কর্নার', registerType: 'active' },
  { id: 'ups-01', assetTag: 'MP-ICT-UPS-01', name: 'সেন্ট্রাল ট্রু অনলাইন ইউপিএস (৫ কেভিএ)', category: 'আইপিএস / ইউপিএস', model: 'Santak Castle Online 5KVA UPS', cpu: 'Pure Sine Wave 4000W Output', ram: '8x 12V 100Ah Battery Bank', storage: 'স্বয়ংক্রিয় ২.৫ ঘণ্টা ব্যাকআপ', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: 'N/A', desk: 'ল্যাব পাওয়ার ও ব্যাটারি হাব', registerType: 'active' },
  { id: 'net-01', assetTag: 'MP-ICT-NET-01', name: 'ক্লাউড কোর গিগাবিট রাউটার ও সুইচ', category: 'নেটওয়ার্ক ইকুইপমেন্ট', model: 'MikroTik Cloud Router Switch 24-Port 1Gbps', cpu: 'Dual-Band Wi-Fi 6 Router Attached', ram: '1 GB RouterOS v7', storage: '৫০ Mbps অপটিক্যাল ফাইবার লাইন', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২১', condition: 'সক্রিয়', ip: '192.168.1.1', desk: 'নেটওয়ার্ক সার্ভার রেক ক্যাবিনেট', registerType: 'active' },

  // 2. মেরামতযোগ্য যন্ত্রপাতির স্টক রেজিস্টার বুক (Repairable Stock Register)
  { id: 'rep-01', assetTag: 'MP-SRDL-PC-13', name: 'শিক্ষার্থী ওয়ার্কস্টেশন ১৩ (মেরামত প্রক্রিয়াধীন)', category: 'ডেস্কটপ', model: 'Dell OptiPlex 3080 Micro', cpu: 'Intel Core i3 10th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)', procurementYear: '২০২১', condition: 'মেরামত প্রক্রিয়াধীন', ip: '192.168.1.18', desk: 'সারি-৩, ডেস্ক-১৩', registerType: 'repairable', defectDetails: 'পাওয়ার সাপ্লাই ইউনিট (SMPS) ভোল্টেজ ড্রপ এবং হঠাৎ রিস্টার্ট সমস্যা', sentForRepairDate: '১২ অক্টোবর ২০২৬', serviceCenter: 'জেলা আইসিটি সেল ও টেকনিক্যাল সার্ভিস, টাঙ্গাইল', technicianPhone: '০১৭১২-XXXXXX (ইঞ্জিঃ সাকিল)', estimatedCost: '৳ ১,৮০০' },
  { id: 'rep-02', assetTag: 'MP-ICT-LP-04', name: 'আইসিটি ল্যাপটপ ০৪ (ব্যাটারি ও কীবোর্ড মেরামত)', category: 'ল্যাপটপ', model: 'Lenovo ThinkPad E14 Gen 2', cpu: 'Intel Core i3 11th Gen', ram: '8 GB DDR4', storage: '256 GB SSD', source: 'মাউশি আইসিটি উন্নয়ন বরাদ্দ', procurementYear: '২০২২', condition: 'মেরামত প্রক্রিয়াধীন', ip: '192.168.1.35', desk: 'ল্যাব সার্ভিস টেবিল', registerType: 'repairable', defectDetails: 'কীবোর্ডের স্পেসবার ও ব্যাকস্পেস কি কাজ করছে না এবং ব্যাটারি ব্যাকআপ কমে ২০ মিনিট হয়েছে', sentForRepairDate: '১৮ অক্টোবর ২০২৬', serviceCenter: 'তানভীর কম্পিউটার্স অ্যান্ড ল্যাপটপ রিপেয়ার, টাঙ্গাইল সদর', technicianPhone: '০১৭২৫-XXXXXX', estimatedCost: '৳ ৩,২০০' },
  { id: 'rep-03', assetTag: 'MP-ICT-PRN-03', name: 'অফিস সহায়ক লেজার প্রিন্টার', category: 'প্রিন্টার', model: 'Canon imageCLASS LBP6030', cpu: 'Monochrome Laser 18ppm', ram: '32 MB', storage: 'USB 2.0', source: 'বিদ্যালয় নিজস্ব তহবিল', procurementYear: '২০২২', condition: 'মেরামতযোগ্য', ip: 'N/A', desk: 'সার্ভিস শেলফ', registerType: 'repairable', defectDetails: 'পেপার ফিডার রোলার ক্ষয়প্রাপ্ত হয়ে একাধিক কাগজ একসঙ্গে টেনে জ্যাম তৈরি করছে', sentForRepairDate: '২০ অক্টোবর ২০২৬', serviceCenter: 'আইটি ভিশন প্রিন্টার কেয়ার, টাঙ্গাইল', technicianPhone: '০১৯১২-XXXXXX', estimatedCost: '৳ ১,২০০' },

  // 3. অচল / অমেরামতযোগ্য যন্ত্রপাতির স্টক রেজিস্টার (Condemned / Scrap Register)
  { id: 'scr-01', assetTag: 'MP-OLD-PC-01', name: 'এনালগ কোর ২ ডুও ডেস্কটপ (অচল)', category: 'ডেস্কটপ', model: 'HP Compaq dc5800 Small Form Factor', cpu: 'Intel Core 2 Duo E7400 2.80GHz', ram: '2 GB DDR2', storage: '160 GB SATA HDD', source: 'তৎকালীন সরকারি মাধ্যমিক আইসিটি অনুদান', procurementYear: '২০১০', condition: 'অচল ও বাতিলযোগ্য', ip: 'N/A', desk: 'ল্যাব স্টোররুম - স্ক্র্যাপ র‍্যাক', registerType: 'scrap', condemnReason: 'মাদারবোর্ড ও চিপসেট স্থায়ীভাবে নষ্ট (Burned) এবং প্রযুক্তিগতভাবে সম্পূর্ণ অপ্রচলিত ও মেরামত অযোগ্য।', condemnDate: '১৫ জানুয়ারি ২০২৫', disposalStatus: 'সরকারি অডিট ও নিলাম কমিটির অনুমোদনের অপেক্ষায় সংরক্ষিত' },
  { id: 'scr-02', assetTag: 'MP-OLD-CRT-01', name: '১৫ ইঞ্চি সিআরটি মনিটর (অচল)', category: 'মনিটর', model: 'Samsung SyncMaster 591s 15" CRT Color Monitor', cpu: 'CRT Display Unit', ram: 'VGA Cable Attached', storage: 'Heavy Shell Enclosure', source: 'বিদ্যালয় পুরাতন তহবিল', procurementYear: '২০০৯', condition: 'অচল ও অমেরামতযোগ্য', ip: 'N/A', desk: 'ল্যাব স্টোররুম স্ক্র্যাপ বক্স', registerType: 'scrap', condemnReason: 'ক্যাথোড রে টিউব (Picture Tube) নিভে গেছে এবং উচ্চ বিদ্যুৎ অপচয়কারী অপ্রচলিত প্রযুক্তি।', condemnDate: '১০ মার্চ ২০২৪', disposalStatus: 'নিলামের জন্য তালিকাভুক্ত' },
  { id: 'scr-03', assetTag: 'MP-OLD-UPS-01', name: 'পুরাতন ৬৫০ ভিএ অফলাইন ইউপিএস', category: 'আইপিএস / ইউপিএস', model: 'PowerGuard 650VA Offline UPS', cpu: 'Microprocessor Controlled', ram: '12V 7.2Ah Lead-acid', storage: 'Transformer Coil Dead', source: 'বিদ্যালয় নিজস্ব তহবিল', procurementYear: '২০১৮', condition: 'অচল', ip: 'N/A', desk: 'ল্যাব স্টোররুম', registerType: 'scrap', condemnReason: 'অভ্যন্তরীণ ট্রান্সফরমার কয়েল শর্ট-সার্কিটে সম্পূর্ণ পুড়ে গেছে এবং ব্যাটারি ফুটো হয়ে অ্যাসিড লিক করেছে। মেরামত ব্যয় নতুন ক্রয়ের চেয়ে বেশি।', condemnDate: '১২ নভেম্বর ২০২৪', disposalStatus: 'স্ক্র্যাপ হিসেবে সংরক্ষিত' }
];

const MOCK_LAB_SCHEDULE = [
  { day: 'শনিবার', time: 'সকাল ১০:০০ - ১১:০০', class_name: '৬ষ্ঠ শ্রেণি', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', topic: 'কম্পিউটারের প্রাথমিক পরিচিতি ও বাংলা টাইপিং অনুশীলন', instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)' },
  { day: 'রবিবার', time: 'সকাল ১১:১৫ - ১২:১৫', class_name: '৭ম শ্রেণি', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', topic: 'এমএস ওয়ার্ড ও প্রফেশনাল ডকুমেন্ট টাইপসেটিং', instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)' },
  { day: 'সোমবার', time: 'দুপুর ১২:৩০ - ০১:৩০', class_name: '৮ম শ্রেণি', subject: 'আইসিটি ও ডিজিটাল প্রযুক্তি', topic: 'এমএস এক্সেল স্প্রেডশিট হিসাব ও প্রাথমিক পাইথন কোডিং', instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)' },
  { day: 'মঙ্গলবার', time: 'দুপুর ০২:০০ - ০৩:০০', class_name: '৯ম শ্রেণি', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', topic: 'গ্রাফিক্স ডিজাইন (ফটোশপ) ও ইন্টারনেট রিসার্চ মেথডলজি', instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)' },
  { day: 'বুধবার', time: 'সকাল ১০:০০ - ১১:৩০', class_name: '১০ম শ্রেণি', subject: 'এসএসসি আইসিটি ব্যবহারিক', topic: 'ডাটাবেস তৈরি (এমএস অ্যাক্সেস) ও এইচটিএমএল ওয়েবপেজ ডিজাইন', instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)' },
  { day: 'বৃহস্পতিবার', time: 'দুপুর ০২:১৫ - ০৩:৪৫', class_name: 'আইসিটি ক্লাব (উন্মুক্ত)', subject: 'কোডিং ও রোবোটিক্স ওয়ার্কশপ', topic: 'আর্ডুইনো সেন্সর কন্ট্রোল, স্ক্র্যাচ প্রোগ্রামিং ও সাইবার সিকিউরিটি', instructor: 'মোঃ আব্দুল্লাহ আল মামুন ও মডারেটর টিম' }
];

const MOCK_LAB_RULES = [
  'ল্যাবে প্রবেশের পূর্বে জুতা নির্ধারিত র‍্যাকে রেখে পরিচ্ছন্নভাবে প্রবেশ করতে হবে।',
  'শিক্ষকের অনুমতি ব্যতিরেকে কোনো কম্পিউটার বা পেরিফেরাল ডিভাইসের ক্যাবল স্থানান্তর নিষেধ।',
  'ক্লাস চলাকালীন কোনো খাবার বা পানীয় ল্যাব টেবিল অথবা কম্পিউটারের পাশে রাখা সম্পূর্ণ নিষিদ্ধ।',
  'ইন্টারনেট ব্যবহারের সময় শুধুমাত্র শিক্ষামূলক ও অনুমোদিত ওয়েবসাইট ব্যতীত অন্য কোনো সাইটে ব্রাউজিং দণ্ডনীয় অপরাধ।',
  'কাজ শেষ করার পর সঠিক নিয়মে কম্পিউটার শাটডাউন করে মনিটরের পাওয়ার বন্ধ করতে হবে।'
];

// Multimedia Classroom (মাল্টিমিডিয়া ক্লাসরুম) Data
const MOCK_MULTIMEDIA_ROOMS = [
  { id: 'MM-202', name: 'স্মার্ট ক্লাসরুম ০১ (বিজ্ঞান ভবন)', roomNo: 'কক্ষ নং ২০২', floor: '২য় তলা', capacity: '৮৫ জন', projector: 'হাই-লুমেন শর্ট-থ্রো লেজার প্রজেক্টর ও ইন্টারেক্টিভ স্মার্টবোর্ড', audio: 'হাই-ফাই স্টুডিও সাউন্ড ও ডুয়াল ওয়্যারলেস মাইক', power: 'সোলার ও অনলাইন আইপিএস ব্যাকআপ (নিরবচ্ছিন্ন)' },
  { id: 'MM-301', name: 'মাল্টিমিডিয়া ক্লাসরুম ০২ (প্রধান ভবন)', roomNo: 'কক্ষ নং ৩০১', floor: '৩য় তলা', capacity: '৮০ জন', projector: '৪কে আল্ট্রা এইচডি ডিজিটাল প্রজেক্টর ও ১০০" মোটরচালিত স্ক্রিন', audio: 'অ্যামপ্লিফায়ারসহ সারাউণ্ড স্পিকার', power: 'অটোমেটিক ইউপিএস ব্যাকআপ' }
];

const MOCK_MULTIMEDIA_SCHEDULE = [
  { day: 'রবিবার', period: '২য় পিরিয়ড (১০:৪৫)', class_name: '১০ম শ্রেণি (বিজ্ঞান)', subject: 'পদার্থবিজ্ঞান', topic: 'আলোর প্রতিফলন, প্রতিসরণ ও লেন্সের গঠন (৩ডি অ্যানিমেশন)', teacher: 'মোঃ রফিকুল ইসলাম (সিনিয়র শিক্ষক)', room: 'কক্ষ ২০২' },
  { day: 'রবিবার', period: '৪র্থ পিরিয়ড (১২:১৫)', class_name: '৯ম শ্রেণি (বিজ্ঞান)', subject: 'জীববিজ্ঞান', topic: 'মানবদেহে রক্ত সংবহন ও হৃদপিণ্ডের রক্ত চলাচল ৩ডি মডেল', teacher: 'মোঃ হাবিবুর রহমান (সহকারী শিক্ষক)', room: 'কক্ষ ২০২' },
  { day: 'সোমবার', period: '৩য় পিরিয়ড (১১:৩০)', class_name: '৮ম শ্রেণি', subject: 'গণিত', topic: 'জ্যামিতিক উপপাদ্য (পিথাগোরাসের উপপাদ্যের ভিজ্যুয়াল অ্যানিমেশন)', teacher: 'তাপসী সরকার (সহকারী প্রধান শিক্ষক)', room: 'কক্ষ ৩০১' },
  { day: 'মঙ্গলবার', period: '২য় পিরিয়ড (১০:৪৫)', class_name: '৭ম শ্রেণি', subject: 'বিজ্ঞান', topic: 'সৌরজগৎ, গ্রহ-নক্ষত্র ও মহাকাশ বিজ্ঞান প্রামাণ্যচিত্র', teacher: 'মোঃ শাহ আলম (সহকারী শিক্ষক)', room: 'কক্ষ ২০২' },
  { day: 'বুধবার', period: '৩য় পিরিয়ড (১১:৩০)', class_name: '৬ষ্ঠ শ্রেণি', subject: 'ইংরেজি', topic: 'Interactive Spoken English, Pronunciation & British Council Videos', teacher: 'মোঃ আশরাফুল ইসলাম (সহকারী শিক্ষক)', room: 'কক্ষ ৩০১' },
  { day: 'বৃহস্পতিবার', period: '৫ম পিরিয়ড (০১:৪৫)', class_name: '৯ম-১০ম শ্রেণি', subject: 'ইতিহাস ও সামাজিক বিজ্ঞান', topic: '১৯৭১-এর মুক্তিযুদ্ধ, ৭ই মার্চের ঐতিহাসিক ভাষণ ও স্বাধীনতা সংগ্রাম', teacher: 'মোঃ আব্দুল খালেক (সহকারী শিক্ষক)', room: 'কক্ষ ৩০১' }
];

const MOCK_MULTIMEDIA_CONTENTS = [
  { title: 'পদার্থবিজ্ঞান: আলোর প্রতিসরণ ৩ডি সিমুলেশন', subject: 'পদার্থবিজ্ঞান', class_name: '১০ম', source: 'শিক্ষক বাতায়ন ও মুক্তপাঠ', type: 'ভিডিও ও অ্যানিমেশন', rating: '৫.০ ⭐' },
  { title: 'জীববিজ্ঞান: মানুষের সংবহন তন্ত্র ও হৃদযন্ত্র', subject: 'জীববিজ্ঞান', class_name: '৯ম', source: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)', type: 'ইন্টারেক্টিভ ৩ডি', rating: '৪.৯ ⭐' },
  { title: 'ইংরেজি উচ্চারণ ও ব্রিটিশ কাউন্সিল স্টোরিটেলিং', subject: 'ইংরেজি', class_name: '৬ষ্ঠ-৮ম', source: 'British Council & ICT4E', type: 'অডিও-ভিজুয়াল', rating: '৪.৮ ⭐' },
  { title: 'ভূগোল ও পরিবেশ: বায়ুমণ্ডল ও বৃষ্টিপাতের স্তরভেদ', subject: 'ভূগোল', class_name: '৯ম', source: 'ইন্টারনেট রিসার্চ ও মাল্টিমিডিয়া আর্কাইভ', type: 'প্রেজেন্টেশন', rating: '৪.৯ ⭐' }
];

// Scouts, Guides & Cub Scouts (স্কাউট, গার্লস গাইড ও কাব দল) Data
const MOCK_SCOUT_MEMBERS = [
  { id: 'SCT-01', name: 'তানভীর আহমেদ', unit: 'স্কাউট দল', patrol: 'বাঘ উপদল', rank: 'সিনিয়র প্যাট্রোল লিডার (SPL)', class_name: '১০ম', roll: '১', badges: 'স্ট্যান্ডার্ড ব্যাজ, রাষ্ট্রপতি স্কাউট পদক প্রার্থী', blood: 'B+', phone: '০১৭XXXXXXXX' },
  { id: 'SCT-02', name: 'আরিফুল ইসলাম', unit: 'স্কাউট দল', patrol: 'সিংহ উপদল', rank: 'প্যাট্রোল লিডার (দলনেতা)', class_name: '১০ম', roll: '৫', badges: 'স্ট্যান্ডার্ড ব্যাজ, ক্যাম্পোরি ব্যাজ', blood: 'O+', phone: '০১৮XXXXXXXX' },
  { id: 'SCT-03', name: 'রিফাত হাসান', unit: 'স্কাউট দল', patrol: 'চিল উপদল', rank: 'প্যাট্রোল লিডার (দলনেতা)', class_name: '৯ম', roll: '৪', badges: 'প্রোগ্রেস ব্যাজ', blood: 'A+', phone: '০১৯XXXXXXXX' },
  { id: 'SCT-04', name: 'ফারহানা ইয়াসমিন', unit: 'গার্লস গাইড', patrol: 'দোয়েল উপদল', rank: 'কোম্পানি লিডার (গাইড প্রধান)', class_name: '১০ম', roll: '৩', badges: 'হলদে পাখি স্টার, গাইড স্বর্ণপদক', blood: 'O+', phone: '০১৬XXXXXXXX' },
  { id: 'SCT-05', name: 'সাদিয়া সুলতানা', unit: 'গার্লস গাইড', patrol: 'কোয়েল উপদল', rank: 'প্যাট্রোল লিডার', class_name: '১০ম', roll: '২', badges: 'ফার্স্ট এইড ব্যাজ, সেবা ব্যাজ', blood: 'AB+', phone: '০১৭XXXXXXXX' },
  { id: 'SCT-06', name: 'তাহমিদ ইসলাম', unit: 'কাব স্কাউট', patrol: 'শাপলা উপদল', rank: 'সিক্সার (কাব দলনেতা)', class_name: '৬ষ্ঠ', roll: '১', badges: 'চাঁদ-তারা ব্যাজ', blood: 'B+', phone: '০১৮XXXXXXXX' },
  { id: 'SCT-07', name: 'রাকিবুল ইসলাম', unit: 'স্কাউট দল', patrol: 'বাঘ উপদল', rank: 'সহকারী দলনেতা', class_name: '৯ম', roll: '৩', badges: 'সদস্য ব্যাজ, হাইকিং ব্যাজ', blood: 'A+', phone: '০১৭XXXXXXXX' },
  { id: 'SCT-08', name: 'আনিকা তাবাসসুম', unit: 'গার্লস গাইড', patrol: 'দোয়েল উপদল', rank: 'সহকারী দলনেতা', class_name: '৯ম', roll: '৭', badges: 'সেবা ব্যাজ, পরিবেশ ব্যাজ', blood: 'B+', phone: '০১৯XXXXXXXX' }
];

const MOCK_SCOUT_EVENTS = [
  { title: 'বার্ষিক স্কাউট ও গার্লস গাইড তাঁবুবাস ও দীক্ষা অনুষ্ঠান ২০২৬', date: '১২-১৪ জানুয়ারি ২০২৬', venue: 'বিদ্যালয় ময়দান ও সুসজ্জিত ক্যাম্প', participants: '৬০ জন স্কাউট ও গাইড', highlights: 'দীক্ষা গ্রহণ, ক্যাম্পফায়ার, হাইকিং ও জরুরি প্রাথমিক চিকিৎসা প্রশিক্ষণ।' },
  { title: 'মহান বিজয় দিবস ও জাতীয় শিশু কিশোর কুচকাওয়াজ', date: '১৬ ডিসেম্বর ২০২৫', venue: 'উপজেলা কেন্দ্রীয় খেলার মাঠ', participants: 'বিদ্যালয় স্কাউট ও গাইড কন্টিনজেন্ট', highlights: 'উপজেলা পর্যায়ে চমৎকার ড্রিল ও ডিসপ্লে প্রদর্শন করে ১ম স্থান (চ্যাম্পিয়ন ট্রফি) অর্জন।' },
  { title: 'সামাজিক বৃক্ষরোপণ ও ক্যাম্পাস পরিচ্ছন্নতা অভিযান', date: '৫ জুন ২০২৫ (বিশ্ব পরিবেশ দিবস)', venue: 'বিদ্যালয় ক্যাম্পাস ও মগড়া বাজার সড়ক', participants: 'সকল স্কাউট, গাইড ও কাব সদস্য', highlights: '২০০টি ফলদ, বনজ ও ভেষজ চারা রোপণ এবং প্লাস্টিক মুক্ত ক্যাম্পাস ঘোষণা।' }
];

const MOCK_SCOUT_LAWS = [
  '১. স্কাউটের আত্মমর্যাদা বিশ্বস্ত ও নির্ভরযোগ্য।',
  '২. স্কাউট সকলের বন্ধু এবং প্রতিটি স্কাউটের ভাই/বোন।',
  '৩. স্কাউট সদা বিনয়ী, শ্রদ্ধাশীল ও সুশৃঙ্খল।',
  '৪. স্কাউট জীবের প্রতি সদয় ও বন্ধুভাবাপন্ন।',
  '৫. স্কাউট সদা হাসিমুখ এবং যেকোনো প্রতিকূলতায় প্রফুল্ল থাকে।',
  '৬. স্কাউট মিতব্যয়ী এবং অপচয় করে না।',
  '৭. স্কাউট চিন্তা, কথা ও কাজে সম্পূর্ণ নির্মল ও পবিত্র।'
];

// Inter-school Sports (আন্তঃবিদ্যালয় ক্রীড়া) Data
const MOCK_INTER_SPORTS_TEAMS = [
  { id: 'FB-01', sport: 'ফুটবল একাদশ', captain: 'তানভীর আহমেদ (১০ম, রোল ১)', coach: 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)', manager: 'মোঃ রফিকুল ইসলাম', squadSize: '১৮ জন', recentHonor: 'উপজেলা আন্তঃবিদ্যালয় ফুটবল চ্যাম্পিয়ন ২০২৫ 🏆' },
  { id: 'CR-01', sport: 'ক্রিকেট একাদশ', captain: 'রিফাত হাসান (১০ম, রোল ৪)', coach: 'মোঃ হাবিবুর রহমান', manager: 'মুহাম্মদ আবুবকর সিদ্দিক', squadSize: '১৬ জন', recentHonor: 'গ্রীষ্মকালীন আন্তঃবিদ্যালয় ক্রিকেট রানার্স-আপ ২০২৫ 🥈' },
  { id: 'HB-01', sport: 'হ্যান্ডবল দল (বালিকা)', captain: 'ফারহানা ইয়াসমিন (১০ম, রোল ৩)', coach: 'তাপসী সরকার (সহকারী প্রধান শিক্ষক)', manager: 'মোসাঃ নাসরিন আক্তার', squadSize: '১৪ জন', recentHonor: 'জেলা পর্যায়ের সেমিফাইনালিস্ট 🥉' },
  { id: 'KB-01', sport: 'কাবাডি দল', captain: 'নাঈমুল ইসলাম (১০ম, রোল ৬)', coach: 'মোঃ শাহ আলম', manager: 'মোঃ আব্দুল খালেক', squadSize: '১২ জন', recentHonor: 'উপজেলা কাবাডি চ্যাম্পিয়ন ২০২৪ 🏆' }
];

const MOCK_INTER_SPORTS_MATCHES = [
  { tournament: 'উপজেলা আন্তঃবিদ্যালয় গ্রীষ্মকালীন ফুটবল টুর্নামেন্ট ২০২৫', opponent: 'কালিহাতী আর.এস. পাইলট উচ্চ বিদ্যালয়', date: '১৫ অক্টোবর ২০২৫', venue: 'কালিহাতী উপজেলা স্টেডিয়াম', score: 'মগড়া পালস্ ৩ - ১ কালিহাতী পাইলট', result: 'বিজয় (চ্যাম্পিয়ন ট্রফি লাভ 🏆)', hero: 'তানভীর আহমেদ (জোড়া গোল)' },
  { tournament: 'আন্তঃউপজেলা ক্রিকেট টুর্নামেন্ট ২০২৫-২৬', opponent: 'ঘাটাইল মডেল হাই স্কুল', date: '১২ ডিসেম্বর ২০২৫', venue: 'টাঙ্গাইল জেলা স্টেডিয়াম', score: 'মগড়া পালস্ ১২৮/৫ (১৫ ওভার) বনাম ১০২/৯ ঘাটাইল', result: 'বিজয় (২৬ রানে বিজয়ী)', hero: 'রিফাত হাসান (৫২ রান ও ৩ উইকেট)' },
  { tournament: 'উপজেলা বালিকা হ্যান্ডবল চ্যাম্পিয়নশিপ', opponent: ' এলেঙ্গা উচ্চ বিদ্যালয়', date: '২৮ নভেম্বর ২০২৫', venue: 'উপজেলা পরিষদ চত্বর', score: 'মগড়া পালস্ ৮ - ৫ এলেঙ্গা বালিকা', result: 'বিজয় (রৌপ্য পদক নিশ্চিত)', hero: 'ফারহানা ইয়াসমিন (৪ গোল)' }
];

export function SportsCultureModernSection({ category = '', menuKey = '', initialTitle = '', onClose }) {
  // Determine isolated category strictly based on category prop, menuKey or title
  const getInitialCategory = () => {
    if (category) return category;
    if (menuKey === 'public.nav.sport.sports' || initialTitle?.includes('বার্ষিক ক্রীড়া') || (initialTitle?.includes('ক্রীড়া') && !initialTitle?.includes('সংস্কৃতি') && !initialTitle?.includes('আন্তঃ'))) return 'sports';
    if (menuKey === 'public.nav.sport.culture' || initialTitle?.includes('সাংস্কৃতিক') || (initialTitle?.includes('সংস্কৃতি') && !initialTitle?.includes('ক্রীড়া'))) return 'culture';
    if (menuKey === 'public.nav.sport.achievements' || initialTitle?.includes('অর্জন') || initialTitle?.includes('পুরস্কার')) return 'achievements';
    if (menuKey === 'public.nav.sport.tour' || initialTitle?.includes('শিক্ষা সফর') || initialTitle?.includes('সফর') || initialTitle?.includes('ট্যুর')) return 'tour';
    if (menuKey === 'public.nav.sport.lab' || initialTitle?.includes('কম্পিউটার ল্যাব') || initialTitle?.includes('ল্যাব')) return 'lab';
    if (menuKey === 'public.nav.sport.multimedia' || initialTitle?.includes('মাল্টিমিডিয়া') || initialTitle?.includes('স্মার্ট ক্লাস')) return 'multimedia';
    if (menuKey === 'public.nav.sport.scouts' || initialTitle?.includes('স্কাউট') || initialTitle?.includes('গার্লস গাইড') || initialTitle?.includes('কাব')) return 'scouts';
    if (menuKey === 'public.nav.sport.inter' || initialTitle?.includes('আন্তঃবিদ্যালয়')) return 'inter_sports';
    return 'sports';
  };

  const activeCategory = getInitialCategory();

  // Internal tab state for the active standalone category
  const [subTab, setSubTab] = useState(() => {
    if (activeCategory === 'sports') return 'winners';
    if (activeCategory === 'culture') return 'programs';
    if (activeCategory === 'achievements') return 'cards';
    if (activeCategory === 'tour') return 'destinations';
    if (activeCategory === 'lab') return 'devices';
    if (activeCategory === 'multimedia') return 'schedule';
    if (activeCategory === 'scouts') return 'members';
    if (activeCategory === 'inter_sports') return 'teams';
    return 'winners';
  });

  const [sportsGroupFilter, setSportsGroupFilter] = useState('সকল গ্রুপ');
  const [achievementFilter, setAchievementFilter] = useState('সব');
  const [scoutUnitFilter, setScoutUnitFilter] = useState('সব');
  const [labSearch, setLabSearch] = useState('');
  const [labRegisterView, setLabRegisterView] = useState('active'); // 'active' | 'repairable' | 'scrap'
  const [labCatFilter, setLabCatFilter] = useState('all');
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
    if (activeCategory === 'lab') return item.content_type === 'lab' || item.content_type === 'facility' || item.title_bn?.includes('ল্যাব') || item.title_bn?.includes('কম্পিউটার');
    if (activeCategory === 'multimedia') return item.content_type === 'facility' || item.title_bn?.includes('মাল্টিমিডিয়া') || item.title_bn?.includes('স্মার্ট ক্লাস');
    if (activeCategory === 'scouts') return item.title_bn?.includes('স্কাউট') || item.title_bn?.includes('গাইড') || item.title_bn?.includes('কাব');
    if (activeCategory === 'inter_sports') return item.title_bn?.includes('আন্তঃবিদ্যালয়') || item.title_bn?.includes('টুর্নামেন্ট');
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
             activeCategory === 'tour' ? 'ঐতিহাসিক শিক্ষা সফর গাইডলাইন, রুটিন ও অনুমোদনপত্র' :
             activeCategory === 'lab' ? 'শেখ রাসেল ডিজিটাল ল্যাব — কম্পিউটার ডিভাইস ইনভেন্টরি ও প্র্যাকটিক্যাল রুটিন' :
             activeCategory === 'multimedia' ? 'স্মার্ট ও মাল্টিমিডিয়া ক্লাসরুম — ডিজিটাল পাঠদান রুটিন ও কনটেন্ট রিপোজিটরি' :
             activeCategory === 'scouts' ? 'বাংলাদেশ স্কাউটস ও গার্লস গাইড দল — অফিশিয়াল সদস্য রেজিস্টার ও কার্যক্রম' :
             'উপজেলা ও জেলা আন্তঃবিদ্যালয় ক্রীড়া প্রতিযোগিতা — স্কোয়াড ও ফলাফল বিবরণী'}
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
                    activeCategory === 'achievements' ? '#fffbeb' :
                    activeCategory === 'tour' ? '#f0f9ff' :
                    activeCategory === 'lab' ? '#f0fdfa' :
                    activeCategory === 'multimedia' ? '#fdf4ff' :
                    activeCategory === 'scouts' ? '#f0fdf4' : '#fff7ed',
        borderRadius: '12px',
        border: `1px solid ${activeCategory === 'sports' ? '#a7f3d0' :
                             activeCategory === 'culture' ? '#ddd6fe' :
                             activeCategory === 'achievements' ? '#fde68a' :
                             activeCategory === 'tour' ? '#bae6fd' :
                             activeCategory === 'lab' ? '#99f6e4' :
                             activeCategory === 'multimedia' ? '#f5d0fe' :
                             activeCategory === 'scouts' ? '#bbf7d0' : '#fed7aa'}`,
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
                 activeCategory === 'achievements' ? '#92400e' :
                 activeCategory === 'tour' ? '#0369a1' :
                 activeCategory === 'lab' ? '#0f766e' :
                 activeCategory === 'multimedia' ? '#86198f' :
                 activeCategory === 'scouts' ? '#15803d' : '#c2410c',
          fontWeight: 700,
          fontSize: '14.5px'
        }}>
          <span>
            {activeCategory === 'sports' ? '🏃‍♂️' :
             activeCategory === 'culture' ? '🎭' :
             activeCategory === 'achievements' ? '🏆' :
             activeCategory === 'tour' ? '🚌' :
             activeCategory === 'lab' ? '💻' :
             activeCategory === 'multimedia' ? '📽️' :
             activeCategory === 'scouts' ? '⚜️' : '⚽'}
          </span>
          <span>
            {activeCategory === 'sports' ? 'বার্ষিক ক্রীড়া ও অ্যাথলেটিক্স প্রতিযোগিতা ২০২৬' :
             activeCategory === 'culture' ? 'বার্ষিক সাংস্কৃতিক উৎসব ও জাতীয় দিবস পালন ২০২৬' :
             activeCategory === 'achievements' ? 'বিদ্যালয়ের গৌরবময় অর্জন, ট্রফি ও সম্মাননা স্মারক গ্যালারি' :
             activeCategory === 'tour' ? 'ঐতিহাসিক শিক্ষা সফর ও শিক্ষামূলক পরিভ্রমণ ২০২৬' :
             activeCategory === 'lab' ? 'শেখ রাসেল ডিজিটাল ল্যাব ও আইসিটি উদ্ভাবন কেন্দ্র' :
             activeCategory === 'multimedia' ? 'স্মার্ট ও মাল্টিমিডিয়া ক্লাসরুম প্রকল্প' :
             activeCategory === 'scouts' ? 'বাংলাদেশ স্কাউটস, গার্লস গাইড ও কাব দল (গ্রুপ: টাঙ্গাইল-১০৮)' :
             'উপজেলা ও জেলা আন্তঃবিদ্যালয় ক্রীড়া প্রতিযোগিতা ও স্কোয়াড'}
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
                                 activeCategory === 'achievements' ? '#d97706' :
                                 activeCategory === 'tour' ? '#0284c7' :
                                 activeCategory === 'lab' ? '#0d9488' :
                                 activeCategory === 'multimedia' ? '#a21caf' :
                                 activeCategory === 'scouts' ? '#16a34a' : '#ea580c'}`,
            background: '#ffffff',
            color: activeCategory === 'sports' ? '#065f46' :
                   activeCategory === 'culture' ? '#4338ca' :
                   activeCategory === 'achievements' ? '#92400e' :
                   activeCategory === 'tour' ? '#0369a1' :
                   activeCategory === 'lab' ? '#0f766e' :
                   activeCategory === 'multimedia' ? '#86198f' :
                   activeCategory === 'scouts' ? '#15803d' : '#c2410c',
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

      {/* ======================= 5. COMPUTER LAB (শেখ রাসেল ডিজিটাল ল্যাব) ======================= */}
      {activeCategory === 'lab' && (() => {
        const allDevs = adminStorage?.lab?.devices?.length ? adminStorage.lab.devices : MOCK_LAB_DEVICES;
        const labSchedule = adminStorage?.lab?.schedule?.length ? adminStorage.lab.schedule : MOCK_LAB_SCHEDULE;

        const activeDevs = allDevs.filter(d => (d.registerType || 'active') === 'active');
        const repairDevs = allDevs.filter(d => d.registerType === 'repairable');
        const scrapDevs = allDevs.filter(d => d.registerType === 'scrap');

        // Current Register Book Selection
        const currentBookDevs = labRegisterView === 'repairable' ? repairDevs :
                                labRegisterView === 'scrap' ? scrapDevs : activeDevs;

        // Apply filters
        const filteredDevices = currentBookDevs.filter(d => {
          if (labCatFilter !== 'all' && d.category !== labCatFilter) return false;
          if (labSearch) {
            const q = labSearch.toLowerCase();
            return (d.name && d.name.toLowerCase().includes(q)) ||
                   (d.assetTag && d.assetTag.toLowerCase().includes(q)) ||
                   (d.model && d.model.toLowerCase().includes(q)) ||
                   (d.desk && d.desk.toLowerCase().includes(q)) ||
                   (d.category && d.category.toLowerCase().includes(q));
          }
          return true;
        });

        // Category Matrix calculation across all equipment
        const LAB_CATEGORY_LIST = ['ল্যাপটপ', 'ডেস্কটপ', 'প্রিন্টার', 'স্ক্যানার', 'স্মার্ট টিভি', 'প্রজেক্টর', 'আইপিএস / ইউপিএস', 'মনিটর', 'নেটওয়ার্ক ইকুইপমেন্ট'];
        const catStats = LAB_CATEGORY_LIST.map(cat => {
          const inCat = allDevs.filter(d => d.category === cat);
          return {
            category: cat,
            total: inCat.length,
            active: inCat.filter(d => (d.registerType || 'active') === 'active').length,
            repair: inCat.filter(d => d.registerType === 'repairable').length,
            scrap: inCat.filter(d => d.registerType === 'scrap').length
          };
        }).filter(c => c.total > 0);

        // Public official print report generator
        const handlePrintPublicLabReport = (targetRegister = labRegisterView) => {
          const targetDevs = allDevs.filter(d => (d.registerType || 'active') === targetRegister);
          const memoNum = `মপাউবি/আইসিটি-ল্যাব/${targetRegister.toUpperCase()}/২০২৬/${Math.floor(100 + Math.random() * 900)}`;
          const todayBn = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

          const titles = {
            active: { title: '১ম বুক: সচল ষ্টক রেজিষ্টার প্রতিবেদন', subject: 'কম্পিউটার ল্যাবের সকল সচল ও সক্রিয় যন্ত্রপাতির অফিশিয়াল স্টক বিবরণী প্রসঙ্গে।' },
            repairable: { title: '২য় বুক: মেরামতযোগ্য যন্ত্রপাতির ষ্টক রেজিষ্টার বিবরণী', subject: 'কম্পিউটার ল্যাবের ত্রুটিযুক্ত ও তাৎক্ষণিক মেরামতযোগ্য যন্ত্রপাতির বিবরণ ও সুপারিশ প্রসঙ্গে।' },
            scrap: { title: '৩য় বুক: অচল ও অমেরামতযোগ্য যন্ত্রপাতির স্থায়ী ষ্টক রেজিষ্টার', subject: 'কম্পিউটার ল্যাবের স্থায়ীভাবে অচল ও নিলামযোগ্য যন্ত্রপাতির কন্ডেমনেশন রেজিস্টার প্রসঙ্গে।' }
          };
          const curMeta = titles[targetRegister] || titles.active;

          const w = window.open('', '_blank', 'width=1100,height=850');
          if (!w) {
            alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। ব্রাউজারের পপ-আপ অনুমোদন করে পুনরায় চেষ্টা করুন।');
            return;
          }

          const rows = targetDevs.map((d, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; page-break-inside: avoid; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 7px 8px; text-align: center; font-weight: 700; font-size: 11px;">${idx + 1}</td>
              <td style="padding: 7px 8px; font-weight: 800; color: #0f766e; font-size: 11px; white-space: nowrap;">${d.assetTag || 'MP-ICT-' + (idx + 1)}</td>
              <td style="padding: 7px 8px;">
                <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${d.name || 'ডিভাইস'}</div>
                <div style="font-size: 10.5px; color: #64748b;">${d.model || '—'}</div>
              </td>
              <td style="padding: 7px 8px; font-weight: 700; color: #0369a1; font-size: 11px;">${d.category || 'অন্যান্য'}</td>
              <td style="padding: 7px 8px; font-size: 10.5px; color: #334155; line-height: 1.4;">
                ${d.cpu ? `<div><b>CPU:</b> ${d.cpu}</div>` : ''}
                ${d.ram || d.storage ? `<div><b>RAM/Drive:</b> ${d.ram || '—'} • ${d.storage || '—'}</div>` : ''}
                ${d.ip && d.ip !== 'N/A' ? `<div><b>IP:</b> ${d.ip}</div>` : ''}
              </td>
              <td style="padding: 7px 8px; font-size: 10.5px; color: #475569;">
                <div>${d.source || 'শেখ রাসেল ডিজিটাল ল্যাব'}</div>
                <div style="font-size: 9.5px; color: #94a3b8;">সাল: ${d.procurementYear || '২০২১'}</div>
              </td>
              <td style="padding: 7px 8px; font-size: 11px; font-weight: 600; color: #334155;">${d.desk || 'ল্যাব রুম'}</td>
              <td style="padding: 7px 8px; font-size: 10.5px;">
                ${targetRegister === 'active' ? `
                  <span style="display: inline-block; background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">● ${d.condition || 'সক্রিয়'}</span>
                ` : targetRegister === 'repairable' ? `
                  <div style="color: #b45309; font-weight: 700; font-size: 10.5px;">⚠️ ${d.defectDetails || 'ত্রুটি বিদ্যমান'}</div>
                  <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">প্রেরণ: ${d.sentForRepairDate || '—'} • খরচ: ${d.estimatedCost || '—'}</div>
                ` : `
                  <div style="color: #b91c1c; font-weight: 700; font-size: 10.5px;">🚫 ${d.condemnReason || 'অচল'}</div>
                  <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">তারিখ: ${d.condemnDate || '—'} • অবস্থা: ${d.disposalStatus || 'সংরক্ষিত'}</div>
                `}
              </td>
            </tr>
          `).join('');

          const doc = `
            <!DOCTYPE html>
            <html lang="bn">
            <head>
              <meta charset="utf-8">
              <title>${curMeta.title} — মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
              <style>
                @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }
                body { font-family: 'Segoe UI', sans-serif; color: #0f172a; margin: 0; padding: 16px; }
                .no-print { background: #f0fdfa; border: 1px solid #99f6e4; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
                .btn-p { background: #0f766e; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 800; font-size: 13px; cursor: pointer; }
                .header-box { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 12px; }
                .school-title { margin: 3px 0 2px; font-size: 22px; color: #0f766e; font-weight: 900; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px; }
                th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; font-weight: 800; text-align: left; }
                td { border: 1px solid #cbd5e1; }
                .sig-row { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 20px; page-break-inside: avoid; }
                .sig-box { text-align: center; min-width: 200px; border-top: 1px dashed #64748b; padding-top: 6px; font-size: 12px; }
                @media print { .no-print { display: none !important; } body { padding: 0; } }
              </style>
            </head>
            <body>
              <div class="no-print">
                <span style="font-weight: 700; color: #0f766e; font-size: 13px;">🖨️ কম্পিউটার ল্যাব অফিশিয়াল প্রাতিষ্ঠানিক প্রতিবেদন প্রস্তুত।</span>
                <button class="btn-p" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন / Save as PDF</button>
              </div>
              <div class="header-box">
                <div style="font-size: 12px; color: #475569; font-weight: 700;">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত</div>
                <h1 class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
                <div style="font-size: 12px; color: #334155;">পোস্ট: মগড়া, উপজেলা: কালিহাতী / টাঙ্গাইল সদর, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৫৮ • EIIN: 114290</div>
                <div style="font-weight: 800; font-size: 13.5px; color: #0f766e; margin-top: 3px;">💻 শেখ রাসেল ডিজিটাল ল্যাব ও কম্পিউটার সেন্টার</div>
                <div style="display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #059669; padding: 3px 14px; border-radius: 20px; font-weight: 800; font-size: 13px; margin-top: 4px;">${curMeta.title}</div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px; padding: 6px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <div><b>স্মারক নংঃ</b> ${memoNum}</div>
                <div><b>প্রতিবেদনের তারিখ:</b> ${todayBn} খ্রি.</div>
              </div>
              <div style="background: #ffffff; border-left: 3px solid #0f766e; padding: 6px 10px; margin-bottom: 12px; font-size: 12px;">
                <div><b>বরাবর:</b> প্রধান শিক্ষক, মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, টাঙ্গাইল সদর, টাঙ্গাইল।</div>
                <div style="margin-top: 3px;"><b>বিষয়:</b> <span style="font-weight: 800;">${curMeta.subject}</span></div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 30px; text-align: center;">ক্র.</th>
                    <th style="width: 95px;">Asset Tag ID</th>
                    <th>যন্ত্রপাতির নাম ও মডেল</th>
                    <th style="width: 85px;">ক্যাটাগরি</th>
                    <th>স্পেসিফিকেশন ও বিবরণ</th>
                    <th style="width: 120px;">উৎস ও সাল</th>
                    <th style="width: 85px;">অবস্থান</th>
                    <th style="width: 140px;">বর্তমান অবস্থা / মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows || '<tr><td colspan="8" style="text-align: center; padding: 12px;">কোনো তথ্য পাওয়া যায়নি।</td></tr>'}
                </tbody>
              </table>
              <div style="display: flex; gap: 12px; margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 11.5px;">
                <div><b>সারসংক্ষেপ:</b> মোট যন্ত্রপাতি: <b>${allDevs.length}</b> টি</div>
                <div style="color: #059669;">🟢 সচল স্টক: <b>${activeDevs.length}</b> টি</div>
                <div style="color: #d97706;">🟡 মেরামতযোগ্য স্টক: <b>${repairDevs.length}</b> টি</div>
                <div style="color: #dc2626;">🔴 অচল ও স্ক্র্যাপ স্টক: <b>${scrapDevs.length}</b> টি</div>
                <div style="margin-left: auto; color: #64748b;">প্রদর্শিত: <b>${targetDevs.length}</b> টি</div>
              </div>
              <div class="sig-row">
                <div class="sig-box">
                  <b>মুহাম্মদ আবুবকর সিদ্দিক</b><br>
                  সহকারী শিক্ষক (তথ্য ও যোগাযোগ প্রযুক্তি)<br>
                  ও ল্যাব ইনচার্জ<br>
                  মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
                </div>
                <div class="sig-box">
                  <b>প্রধান শিক্ষক</b><br>
                  মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়<br>
                  টাঙ্গাইল সদর, টাঙ্গাইল।
                </div>
              </div>
              <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
            </body>
            </html>
          `;
          w.document.open();
          w.document.write(doc);
          w.document.close();
        };

        return (
          <div className="section-standalone-lab">
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600 }}>মোট কম্পিউটার ও যন্ত্রপাতি</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#134e4a', margin: '4px 0' }}>{allDevs.length} টি</div>
                <div style={{ fontSize: '11.5px', color: '#115e59' }}>{activeDevs.length} টি সচল • {repairDevs.length} টি মেরামত • {scrapDevs.length} টি অচল</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>ইন্টারনেট ও ব্যান্ডউইথ</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>৫০ Mbps ফাইবার</div>
                <div style={{ fontSize: '11.5px', color: '#2563eb' }}>হাই-স্পিড অপটিক্যাল ব্রডব্যান্ড ও Wi-Fi 6</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#a16207', fontWeight: 600 }}>পাওয়ার ব্যাকআপ</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#713f12', margin: '4px 0' }}>৫ KVA অনলাইন UPS</div>
                <div style={{ fontSize: '11.5px', color: '#854d0e' }}>স্বয়ংক্রিয় সোলার ও ব্যাটারি ব্যাকআপ</div>
              </div>
              <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#be185d', fontWeight: 600 }}>ল্যাব ইনচার্জ ও প্রশিক্ষক</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#831843', margin: '4px 0' }}>মুহাম্মদ আবুবকর সিদ্দিক</div>
                <div style={{ fontSize: '11.5px', color: '#9d174d' }}>সহকারী শিক্ষক (আইসিটি ও ল্যাব ইনচার্জ)</div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap' }} className="no-print">
              <button
                type="button"
                onClick={() => setSubTab('devices')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'devices' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                  background: subTab === 'devices' ? '#f0fdfa' : '#ffffff',
                  color: subTab === 'devices' ? '#0f766e' : '#334155',
                  fontWeight: subTab === 'devices' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                💻 ৩টি স্টক রেজিস্টার বুক ({allDevs.length} টি)
              </button>
              <button
                type="button"
                onClick={() => setSubTab('schedule')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'schedule' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                  background: subTab === 'schedule' ? '#f0fdfa' : '#ffffff',
                  color: subTab === 'schedule' ? '#0f766e' : '#334155',
                  fontWeight: subTab === 'schedule' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🗓️ প্র্যাকটিক্যাল ল্যাব রুটিন
              </button>
              <button
                type="button"
                onClick={() => setSubTab('rules')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'rules' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                  background: subTab === 'rules' ? '#f0fdfa' : '#ffffff',
                  color: subTab === 'rules' ? '#0f766e' : '#334155',
                  fontWeight: subTab === 'rules' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🛡️ ল্যাব বিধি ও সাইবার সুরক্ষা
              </button>
            </div>

            {/* Sub-tab: Devices (The 3 Stock Register Books) */}
            {subTab === 'devices' && (
              <div>
                {/* Category Summary Matrix Tally Cards */}
                <div style={{ marginBottom: '16px' }} className="no-print">
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f766e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📊</span> ক্যাটাগরিভিত্তিক লাইভ সামারি ট্যালি (Category Live Matrix)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                    {catStats.map(c => {
                      const isSel = labCatFilter === c.category;
                      return (
                        <div
                          key={c.category}
                          onClick={() => setLabCatFilter(isSel ? 'all' : c.category)}
                          style={{
                            background: isSel ? '#f0fdfa' : '#ffffff',
                            border: isSel ? '2px solid #0d9488' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            boxShadow: isSel ? '0 4px 10px rgba(13,148,136,0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: isSel ? '#0f766e' : '#1e293b' }}>{c.category}</span>
                            <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#0f766e' }}>{c.total}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '5px', fontSize: '10px', fontWeight: 700 }}>
                            <span style={{ color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>সচল: {c.active}</span>
                            {c.repair > 0 && <span style={{ color: '#d97706', background: '#fffbeb', padding: '1px 5px', borderRadius: '4px' }}>মেরামত: {c.repair}</span>}
                            {c.scrap > 0 && <span style={{ color: '#dc2626', background: '#fef2f2', padding: '1px 5px', borderRadius: '4px' }}>অচল: {c.scrap}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* The 3 Register Book Switcher */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '14px' }} className="no-print">
                  <div
                    onClick={() => setLabRegisterView('active')}
                    style={{
                      background: labRegisterView === 'active' ? '#ecfdf5' : '#ffffff',
                      border: labRegisterView === 'active' ? '2.5px solid #059669' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#065f46' }}>🟢 ১ম বুক: সচল ষ্টক রেজিষ্টার</span>
                      <span style={{ background: '#059669', color: '#fff', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>{activeDevs.length} টি</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857' }}>ল্যাপটপ, ডেস্কটপ, প্রিন্টার, টিভি, প্রজেক্টর, আইপিএস সহ সকল সচল যন্ত্রপাতি</div>
                  </div>

                  <div
                    onClick={() => setLabRegisterView('repairable')}
                    style={{
                      background: labRegisterView === 'repairable' ? '#fffbeb' : '#ffffff',
                      border: labRegisterView === 'repairable' ? '2.5px solid #d97706' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#92400e' }}>🟡 ২য় বুক: মেরামতযোগ্য ষ্টক রেজিষ্টার</span>
                      <span style={{ background: '#d97706', color: '#fff', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>{repairDevs.length} টি</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#b45309' }}>চিহ্নিত ত্রুটি, মেরামতে প্রেরণের তারিখ, সার্ভিস সেন্টার ও বাজেট হিসাবযুক্ত যন্ত্রপাতি</div>
                  </div>

                  <div
                    onClick={() => setLabRegisterView('scrap')}
                    style={{
                      background: labRegisterView === 'scrap' ? '#fef2f2' : '#ffffff',
                      border: labRegisterView === 'scrap' ? '2.5px solid #dc2626' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#991b1b' }}>🔴 ৩য় বুক: অচল/অমেরামতযোগ্য ষ্টক</span>
                      <span style={{ background: '#dc2626', color: '#fff', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>{scrapDevs.length} টি</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#b91c1c' }}>স্থায়ীভাবে বাতিল ও মেরামত-অযোগ্য স্ক্র্যাপ/নিলাম তালিকা</div>
                  </div>
                </div>

                {/* Search, Filter & Headmaster Print Action Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }} className="no-print">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={labCatFilter}
                      onChange={e => setLabCatFilter(e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
                    >
                      <option value="all">সকল ক্যাটাগরি ({currentBookDevs.length} টি)</option>
                      <option value="ল্যাপটপ">ল্যাপটপ</option>
                      <option value="ডেস্কটপ">ডেস্কটপ</option>
                      <option value="মনিটর">মনিটর</option>
                      <option value="প্রিন্টার">প্রিন্টার</option>
                      <option value="স্ক্যানার">স্ক্যানার</option>
                      <option value="স্মার্ট টিভি">স্মার্ট টিভি</option>
                      <option value="প্রজেক্টর">প্রজেক্টর</option>
                      <option value="আইপিএস / ইউপিএস">আইপিএস / ইউপিএস</option>
                      <option value="নেটওয়ার্ক ইকুইপমেন্ট">নেটওয়ার্ক ইকুইপমেন্ট</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Asset Tag, নাম, স্পেসিফিকেশন দিয়ে খুঁজুন..."
                      value={labSearch}
                      onChange={(e) => setLabSearch(e.target.value)}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', minWidth: '220px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>প্রদর্শিত: <b>{filteredDevices.length}</b> টি</span>
                    <button
                      type="button"
                      onClick={() => handlePrintPublicLabReport(labRegisterView)}
                      style={{
                        padding: '7px 14px',
                        background: '#0f766e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>🖨️</span> প্রধান শিক্ষকের অফিশিয়াল রিপোর্ট প্রিন্ট (PDF)
                    </button>
                  </div>
                </div>

                {/* Device Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '12px' }}>
                  {filteredDevices.map((d, idx) => (
                    <div key={d.id || idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `5px solid ${
                        labRegisterView === 'repairable' ? '#d97706' :
                        labRegisterView === 'scrap' ? '#dc2626' : '#059669'
                      }`
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ background: '#0f172a', color: '#38bdf8', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontFamily: 'monospace' }}>
                            🏷️ {d.assetTag || d.id}
                          </span>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: labRegisterView === 'repairable' ? '#fffbeb' : labRegisterView === 'scrap' ? '#fef2f2' : '#ecfdf5',
                            color: labRegisterView === 'repairable' ? '#b45309' : labRegisterView === 'scrap' ? '#b91c1c' : '#047857'
                          }}>
                            ● {d.condition || (labRegisterView === 'repairable' ? 'মেরামত প্রক্রিয়াধীন' : labRegisterView === 'scrap' ? 'অচল' : 'সচল')}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 3px', fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>{d.name}</h4>
                        <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 600, marginBottom: '6px' }}>{d.category} • {d.model}</div>

                        <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', color: '#334155', lineHeight: '1.4', marginBottom: '8px' }}>
                          {d.cpu && <div><b>প্রসেসর:</b> {d.cpu}</div>}
                          {(d.ram || d.storage) && <div><b>মেমরি/স্টোরেজ:</b> {d.ram || '—'} • {d.storage || '—'}</div>}
                          {d.source && <div><b>উৎস:</b> {d.source} {d.procurementYear ? `(${d.procurementYear})` : ''}</div>}
                        </div>

                        {/* Defect Highlight for Repairable */}
                        {labRegisterView === 'repairable' && (
                          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', color: '#92400e', marginBottom: '6px' }}>
                            <div><b>⚠️ ত্রুটি:</b> {d.defectDetails || 'কারিগরি সমস্যা'}</div>
                            <div><b>📅 প্রেরণের তারিখ:</b> {d.sentForRepairDate || '—'} • <b>খরচ:</b> {d.estimatedCost || '—'}</div>
                          </div>
                        )}

                        {/* Condemn Highlight for Scrap */}
                        {labRegisterView === 'scrap' && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', color: '#991b1b', marginBottom: '6px' }}>
                            <div><b>🚫 কারণ:</b> {d.condemnReason || 'স্থায়ীভাবে অচল'}</div>
                            <div><b>🏷️ অবস্থা:</b> {d.disposalStatus || 'নিলামের জন্য সংরক্ষিত'}</div>
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📍 {d.desk || d.seat || 'ল্যাব রুম'}</span>
                        <span>IP: <code>{d.ip || '192.168.1.x'}</code></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab: Schedule */}
            {subTab === 'schedule' && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                    🗓️ ব্যবহারিক ক্লাসের অফিশিয়াল সময়সূচি (আইসিটি ও ডিজিটাল প্রযুক্তি)
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    প্রতিটি শ্রেণির শিক্ষার্থীরা সপ্তাহে নির্ধারিত সময়ে ল্যাবে সরাসরি হ্যান্ডস-অন প্র্যাকটিক্যাল সম্পন্ন করে।
                  </p>
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 12px' }}>বার / দিন</th>
                        <th style={{ padding: '10px 12px' }}>সময়সূচি</th>
                        <th style={{ padding: '10px 12px' }}>শ্রেণি ও বিষয়</th>
                        <th style={{ padding: '10px 12px' }}>ব্যবহারিক পাঠের বিষয়বস্তু</th>
                        <th style={{ padding: '10px 12px' }}>দায়িত্বপ্রাপ্ত প্রশিক্ষক</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labSchedule.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f766e' }}>{s.day}</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>{s.time}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.class_name} • <span style={{ color: '#0284c7' }}>{s.subject}</span></td>
                          <td style={{ padding: '10px 12px', color: '#1e293b' }}>{s.topic}</td>
                          <td style={{ padding: '10px 12px', color: '#334155', fontSize: '12px' }}>{s.instructor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab: Rules */}
            {subTab === 'rules' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0f766e', fontWeight: 700 }}>📜 ল্যাব ব্যবহারের সাধারণ আচরণবিধি</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.8' }}>
                    {MOCK_LAB_RULES.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0f766e', fontWeight: 700 }}>🛡️ সাইবার সুরক্ষা ও নেটওয়ার্ক নিরাপত্তা</h4>
                  <div style={{ fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6' }}>
                    <div><b>ফায়ারওয়াল ও ফিল্টারিং:</b> শিক্ষার্থীদের নিরাপদ ব্রাউজিং নিশ্চিত করতে কেন্দ্রীয় ফায়ারওয়াল সক্রিয় রাখা হয়েছে।</div>
                    <div><b>ইউজার অ্যাক্সেস:</b> ব্যক্তিগত পেনড্রাইভ বা এক্সটার্নাল ড্রাইভ ল্যাব শিক্ষকের অনুমতি ব্যতিরেকে সংযোগ করা নিষিদ্ধ।</div>
                    <div><b>সিসিটিভি নজরদারি:</b> সার্বক্ষণিক উচ্চ ক্ষমতাসম্পন্ন সিসিটিভি ক্যামেরা দ্বারা ল্যাব চত্বর ও শিক্ষার্থী কার্যক্রম পর্যবেক্ষণ করা হয়।</div>
                    <div style={{ marginTop: '4px', background: '#ccfbf1', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', color: '#0f766e', fontWeight: 600 }}>
                      💡 যেকোনো প্রযুক্তিগত সমস্যা বা ডিভাইসের অসঙ্গতি দেখা দিলে অবিলম্বে ল্যাব সহকারী বা ইনচার্জকে অবহিত করুন।
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================= 6. MULTIMEDIA CLASSROOM (মাল্টিমিডিয়া ক্লাস) ======================= */}
      {activeCategory === 'multimedia' && (() => {
        const multimediaSchedule = adminStorage?.multimedia?.schedule?.length ? adminStorage.multimedia.schedule : MOCK_MULTIMEDIA_SCHEDULE;
        const multimediaRooms = adminStorage?.multimedia?.rooms?.length ? adminStorage.multimedia.rooms : MOCK_MULTIMEDIA_ROOMS;
        const multimediaLogs = adminStorage?.multimedia?.logs?.length ? adminStorage.multimedia.logs : [];
        const multimediaProjects = adminStorage?.multimedia?.projects?.length ? adminStorage.multimedia.projects : [];

        const takenCount = multimediaLogs.filter(l => l.status === 'taken').length;
        const missedCount = multimediaLogs.filter(l => l.status === 'missed').length;
        const complianceRate = multimediaLogs.length > 0 ? Math.round((takenCount / multimediaLogs.length) * 100) : 100;

        const handlePrintPublicMmReport = () => {
          const w = window.open('', '_blank', 'width=1100,height=850');
          if (!w) {
            alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে অনুমোদন করুন।');
            return;
          }
          const todayBn = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
          const memoNum = `মপাউবি/মাল্টিমিডিয়া/পাবলিক-রিপোর্ট/২০২৬/${Math.floor(100 + Math.random() * 900)}`;

          w.document.open();
          w.document.write(`
            <!DOCTYPE html>
            <html lang="bn">
            <head>
              <meta charset="utf-8">
              <title>মাল্টিমিডিয়া ক্লাসরুম মনিটরিং ও এক্সিকিউশন রিপোর্ট</title>
              <style>
                @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }
                body { font-family: 'Segoe UI', sans-serif; padding: 16px; color: #0f172a; margin: 0; }
                .header { text-align: center; border-bottom: 2px solid #5b21b6; padding-bottom: 8px; margin-bottom: 12px; }
                .title { font-size: 22px; color: #4c1d95; font-weight: 900; margin: 2px 0; }
                .sub { font-size: 11.5px; color: #64748b; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
                th { background: #f3e8ff; color: #4c1d95; }
                .btn { background: #5b21b6; color: #fff; padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; }
                @media print { .no-print { display: none !important; } body { padding: 0 !important; } }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 14px; display: flex; justify-content: space-between;">
                <b>🖨️ প্রিন্ট ভিউ</b>
                <button class="btn" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন</button>
              </div>
              <div class="header">
                <div style="font-size: 12px; color: #475569; font-weight: 700;">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত • শিক্ষা মন্ত্রণালয়</div>
                <div class="title">মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
                <div class="sub">পোঃ মাগড়া, উপজেলা ও জেলা: টাঙ্গাইল | EIIN: 114290 | কোড: 4501 | স্থাপিত: ১৯১৯ খ্রি.</div>
                <div style="display: inline-block; background: #f3e8ff; color: #581c87; font-weight: 800; font-size: 13px; padding: 3px 14px; border-radius: 14px; margin-top: 6px;">
                  🖥️ মাল্টিমিডিয়া ক্লাসরুম মনিটরিং ও শিক্ষক পারফরম্যান্স প্রতিবেদন
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 10px;">
                <div><b>স্মারক নংঃ</b> ${memoNum}</div>
                <div><b>তারিখ:</b> ${todayBn}</div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; text-align: center;">
                <div style="background: #faf5ff; padding: 8px; border: 1px solid #e9d5ff; border-radius: 6px;">
                  <div style="font-size: 10px; color: #64748b;">স্মার্ট ক্লাসরুম</div>
                  <div style="font-size: 16px; font-weight: 900; color: #5b21b6;">${multimediaRooms.length} টি</div>
                </div>
                <div style="background: #faf5ff; padding: 8px; border: 1px solid #e9d5ff; border-radius: 6px;">
                  <div style="font-size: 10px; color: #64748b;">নির্ধারিত ক্লাস</div>
                  <div style="font-size: 16px; font-weight: 900; color: #0284c7;">${multimediaSchedule.length} টি</div>
                </div>
                <div style="background: #faf5ff; padding: 8px; border: 1px solid #e9d5ff; border-radius: 6px;">
                  <div style="font-size: 10px; color: #64748b;">গৃহীত ক্লাস / কমপ্লায়েন্স</div>
                  <div style="font-size: 16px; font-weight: 900; color: #059669;">${takenCount} টি (${complianceRate}%)</div>
                </div>
                <div style="background: #faf5ff; padding: 8px; border: 1px solid #e9d5ff; border-radius: 6px;">
                  <div style="font-size: 10px; color: #64748b;">ডিজিটাল প্রজেক্ট</div>
                  <div style="font-size: 16px; font-weight: 900; color: #b45309;">${multimediaProjects.length} টি</div>
                </div>
              </div>
              <div style="font-size: 12px; font-weight: 800; color: #4c1d95; margin-bottom: 4px;">সাপ্তাহিক রুটিন সূচি:</div>
              <table>
                <thead>
                  <tr>
                    <th>বার</th>
                    <th>পিরিয়ড</th>
                    <th>শ্রেণি ও বিষয়</th>
                    <th>ডিজিটাল রিসোর্স / টপিক</th>
                    <th>বিষয় শিক্ষক</th>
                    <th>কক্ষ</th>
                  </tr>
                </thead>
                <tbody>
                  ${multimediaSchedule.map(s => `
                    <tr>
                      <td style="font-weight: 700;">${s.day}</td>
                      <td>${s.period}</td>
                      <td><b>${s.class_name}</b> (${s.subject})</td>
                      <td>${s.resource || s.topic}</td>
                      <td style="font-weight: 600;">${s.teacher}</td>
                      <td>${s.roomName || s.room}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 11.5px; text-align: center;">
                <div style="width: 200px;">
                  <div style="border-top: 1px solid #0f172a; margin-bottom: 4px;"></div>
                  <b>মুহাম্মদ আবুবকর সিদ্দিক</b><br>
                  সহকারী শিক্ষক (আইসিটি) ও ল্যাব ইনচার্জ
                </div>
                <div style="width: 200px;">
                  <div style="border-top: 1px solid #0f172a; margin-bottom: 4px;"></div>
                  <b>প্রধান শিক্ষক</b><br>
                  মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
                </div>
              </div>
            </body>
            </html>
          `);
          w.document.close();
        };

        return (
          <div className="section-standalone-multimedia">
            {/* Action & Official Report Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }} className="no-print">
              <div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>ডিজিটাল মাল্টিমিডিয়া ক্লাসরুম মনিটরিং পরিকাঠামো</span>
              </div>
              <button
                type="button"
                onClick={handlePrintPublicMmReport}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(109, 40, 217, 0.25)'
                }}
              >
                <span>🖨️</span> প্রধান শিক্ষকের অফিশিয়াল রিপোর্ট প্রিন্ট (PDF)
              </button>
            </div>

            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#86198f', fontWeight: 600 }}>স্মার্ট মাল্টিমিডিয়া ক্লাসরুম</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#701a75', margin: '4px 0' }}>{multimediaRooms.length} টি পূর্ণাঙ্গ রুম</div>
                <div style={{ fontSize: '11.5px', color: '#a21caf' }}>বিজ্ঞান ভবন ও নতুন একাডেমিক ভবন</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>ডিসপ্লে ও প্রজেকশন</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>৪কে লেজার + ৭৫" স্মার্টবোর্ড</div>
                <div style={{ fontSize: '11.5px', color: '#2563eb' }}>ইন্টারেক্টিভ টাচ ও হাই-লুমেন প্রজেকশন</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>ক্লাস ডেলিভারি হার</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>{complianceRate}% কমপ্লায়েন্স</div>
                <div style={{ fontSize: '11.5px', color: '#16a34a' }}>গৃহীত: {takenLogs} টি • মিসড: {missedLogs} টি</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>তত্ত্বাবধান ও আইসিটি ইনচার্জ</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#78350f', margin: '4px 0' }}>মুহাম্মদ আবুবকর সিদ্দিক</div>
                <div style={{ fontSize: '11px', color: '#92400e' }}>সহকারী শিক্ষক, আইসিটি ও ল্যাব ইনচার্জ</div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap' }} className="no-print">
              <button
                type="button"
                onClick={() => setSubTab('schedule')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'schedule' ? '2px solid #a21caf' : '1px solid #cbd5e1',
                  background: subTab === 'schedule' ? '#fdf4ff' : '#ffffff',
                  color: subTab === 'schedule' ? '#86198f' : '#334155',
                  fontWeight: subTab === 'schedule' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🗓️ সাপ্তাহিক পাঠদান রুটিন ({multimediaSchedule.length})
              </button>
              <button
                type="button"
                onClick={() => setSubTab('logs')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'logs' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: subTab === 'logs' ? '#ecfdf5' : '#ffffff',
                  color: subTab === 'logs' ? '#065f46' : '#334155',
                  fontWeight: subTab === 'logs' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                📋 দৈনিক ক্লাস ডেলিভারি লগ ({multimediaLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setSubTab('projects')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'projects' ? '2px solid #d97706' : '1px solid #cbd5e1',
                  background: subTab === 'projects' ? '#fffbeb' : '#ffffff',
                  color: subTab === 'projects' ? '#92400e' : '#334155',
                  fontWeight: subTab === 'projects' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🧑‍🏫 শিক্ষকদের ডিজিটাল প্রজেক্ট ({multimediaProjects.length || MOCK_MULTIMEDIA_CONTENTS.length})
              </button>
              <button
                type="button"
                onClick={() => setSubTab('classrooms')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'classrooms' ? '2px solid #a21caf' : '1px solid #cbd5e1',
                  background: subTab === 'classrooms' ? '#fdf4ff' : '#ffffff',
                  color: subTab === 'classrooms' ? '#86198f' : '#334155',
                  fontWeight: subTab === 'classrooms' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🏫 ক্লাসরুম ও সুবিধাসমূহ ({multimediaRooms.length})
              </button>
            </div>

            {/* Sub-tab 1: Schedule */}
            {subTab === 'schedule' && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                    📽️ সাপ্তাহিক মাল্টিমিডিয়া ক্লাস রুটিন (৩ডি অ্যানিমেশন ও অডিও-ভিজ্যুয়াল পাঠ)
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    শিক্ষক বাতায়ন ও জাতীয় শিক্ষাক্রম অনুসরণে বিজ্ঞান, গণিত ও ভাষার জটিল বিষয়সমূহ মাল্টিমিডিয়ায় পাঠদান করা হয়।
                  </p>
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 12px' }}>বার / দিন</th>
                        <th style={{ padding: '10px 12px' }}>পিরিয়ড</th>
                        <th style={{ padding: '10px 12px' }}>শ্রেণি ও বিষয়</th>
                        <th style={{ padding: '10px 12px' }}>ডিজিটাল পাঠ ও ৩ডি কনটেন্ট</th>
                        <th style={{ padding: '10px 12px' }}>বিষয় শিক্ষক</th>
                        <th style={{ padding: '10px 12px' }}>কক্ষ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multimediaSchedule.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#86198f' }}>{m.day}</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>{m.period}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.class_name} • <span style={{ color: '#0284c7' }}>{m.subject}</span></td>
                          <td style={{ padding: '10px 12px', color: '#1e293b' }}>{m.resource || m.topic}</td>
                          <td style={{ padding: '10px 12px', color: '#334155', fontSize: '12px', fontWeight: 600 }}>{m.teacher}</td>
                          <td style={{ padding: '10px 12px' }}><span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>{m.roomName || m.room}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Logs */}
            {subTab === 'logs' && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#065f46', fontWeight: 700 }}>
                    📋 শ্রেণি পাঠদান ও এক্সিকিউশন ইতিহাস (কে কে ক্লাস নিয়েছেন / নেননি)
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    দৈনিক ভিত্তিতে মাল্টিমিডিয়া ক্লাসরুমের ব্যবহার ও শিক্ষকদের ক্লাসের উপস্থিতি লগবুক।
                  </p>
                </div>
                {multimediaLogs.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
                    কোনো ক্লাস ডেলিভারি লগ পাওয়া যায়নি।
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <th style={{ padding: '10px 12px' }}>তারিখ</th>
                          <th style={{ padding: '10px 12px' }}>পিরিয়ড ও কক্ষ</th>
                          <th style={{ padding: '10px 12px' }}>শ্রেণি ও বিষয়</th>
                          <th style={{ padding: '10px 12px' }}>শিক্ষক</th>
                          <th style={{ padding: '10px 12px' }}>উপস্থাপিত পাঠ</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>স্ট্যাটাস</th>
                          <th style={{ padding: '10px 12px' }}>মন্তব্য / কারণ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multimediaLogs.map((l, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: l.status === 'taken' ? '#ffffff' : '#fff5f5' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{l.date}</td>
                            <td style={{ padding: '10px 12px', color: '#475569' }}>{l.period}<br /><span style={{ fontSize: '11px', color: '#64748b' }}>{l.roomName}</span></td>
                            <td style={{ padding: '10px 12px' }}><b>{l.class_name}</b><br /><span style={{ color: '#4338ca' }}>{l.subject}</span></td>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{l.teacher}</td>
                            <td style={{ padding: '10px 12px' }}>{l.topicCovered || '—'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              {l.status === 'taken' ?
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '11px' }}>✅ সম্পন্ন</span> :
                                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '11px' }}>❌ হয়নি</span>
                              }
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11.5px', color: l.status === 'missed' ? '#b91c1c' : '#047857' }}>
                              {l.status === 'missed' ? `কারণ: ${l.reasonNotTaken || 'স্থগিত'}` : (l.remarks || 'সফল')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 3: Teacher Projects */}
            {subTab === 'projects' && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#92400e', fontWeight: 700 }}>
                    💡 শিক্ষকদের তৈরি মাল্টিমিডিয়া প্রজেক্ট ও ডিজিটাল কন্টেন্ট রিপোজিটরি
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    শিক্ষক বাতায়ন ও মুক্তপাঠে শিক্ষকবৃন্দের প্রকাশিত ৩ডি সিমুলেশন ও উদ্ভাবনী ডিজিটাল শিক্ষা উপকরণ।
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px' }}>
                  {(multimediaProjects.length ? multimediaProjects : MOCK_MULTIMEDIA_CONTENTS).map((p, idx) => (
                    <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{p.subject}</span>
                        <span style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 700 }}>{p.ratingOrBadge || p.rating || '⭐⭐⭐⭐⭐'}</span>
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>{p.projectTitle || p.title}</h4>
                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                        <div><b>শিক্ষক:</b> {p.teacher || p.author || 'বিষয় শিক্ষক'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>প্ল্যাটফর্ম: {p.platform || p.source}</div>
                      </div>
                      {p.learningOutcomes && (
                        <div style={{ fontSize: '11.5px', color: '#334155', background: '#faf5ff', padding: '6px 8px', borderRadius: '6px', marginTop: '6px' }}>
                          <b>শিখনফল:</b> {p.learningOutcomes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 4: Classrooms */}
            {subTab === 'classrooms' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                {multimediaRooms.map((room, idx) => (
                  <div key={room.id || idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#fae8ff', color: '#86198f', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px' }}>{room.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>ধারণক্ষমতা: <b>{room.capacity}</b></span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155', marginTop: '10px' }}>
                      <div><b>প্রজেকশন ও ডিসপ্লে:</b> {room.projector}</div>
                      <div><b>সাউন্ড সিস্টেম:</b> {room.sound || room.audio}</div>
                      <div><b>বিদ্যুৎ ব্যাকআপ:</b> {room.backup || room.power}</div>
                      <div style={{ color: '#047857', fontWeight: 700 }}><b>রুম ইনচার্জ:</b> {room.incharge || 'মুহাম্মদ আবুবকর সিদ্দিক (ল্যাব ইনচার্জ)'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================= 7. SCOUTS & GIRLS GUIDE (স্কাউট ও গার্লস গাইড) ======================= */}
      {activeCategory === 'scouts' && (() => {
        const scoutMembers = adminStorage?.scouts?.members?.length ? adminStorage.scouts.members : MOCK_SCOUT_MEMBERS;
        const filteredMembers = scoutMembers.filter(m => {
          if (scoutUnitFilter === 'সব') return true;
          return m.unit === scoutUnitFilter;
        });

        return (
          <div className="section-standalone-scouts">
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>মোট স্কাউট ও গাইড সদস্য</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>{scoutMembers.length} জন</div>
                <div style={{ fontSize: '11.5px', color: '#16a34a' }}>স্কাউট, গার্লস গাইড ও কাব দল সক্রিয়</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>গ্রুপ ও রেজিস্ট্রেশন</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>গ্রুপ: টাঙ্গাইল-১০৮</div>
                <div style={{ fontSize: '11.5px', color: '#2563eb' }}>বাংলাদেশ স্কাউটস ও গার্লস গাইড সমিতি</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#a16207', fontWeight: 600 }}>সাম্প্রতিক শ্রেষ্ঠ সম্মাননা</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#713f12', margin: '4px 0' }}>কুচকাওয়াজ ১ম স্থান 🏆</div>
                <div style={{ fontSize: '11.5px', color: '#854d0e' }}>উপজেলা পর্যায়ে চ্যাম্পিয়ন ট্রফি প্রাপ্ত</div>
              </div>
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 600 }}>স্কাউট মাস্টার ও গাইড ক্যাপ্টেন</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#581c87', margin: '4px 0' }}>মোঃ শাহ আলম ও তাপসী সরকার</div>
                <div style={{ fontSize: '11.5px', color: '#6b21a8' }}>অ্যাডভান্সড উডব্যাজার ও দক্ষ প্রশিক্ষক</div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap' }} className="no-print">
              <button
                type="button"
                onClick={() => setSubTab('members')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'members' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: subTab === 'members' ? '#f0fdf4' : '#ffffff',
                  color: subTab === 'members' ? '#15803d' : '#334155',
                  fontWeight: subTab === 'members' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                👥 সদস্য ও পদবি রেজিস্টার ({scoutMembers.length} জন)
              </button>
              <button
                type="button"
                onClick={() => setSubTab('events')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'events' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: subTab === 'events' ? '#f0fdf4' : '#ffffff',
                  color: subTab === 'events' ? '#15803d' : '#334155',
                  fontWeight: subTab === 'events' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🏕️ তাঁবুবাস, কুচকাওয়াজ ও সেবা কার্যক্রম
              </button>
              <button
                type="button"
                onClick={() => setSubTab('laws')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'laws' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: subTab === 'laws' ? '#f0fdf4' : '#ffffff',
                  color: subTab === 'laws' ? '#15803d' : '#334155',
                  fontWeight: subTab === 'laws' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                ⚜️ স্কাউট প্রতিজ্ঞা ও ৭টি নিয়মাবলী
              </button>
            </div>

            {/* Sub-tab: Members */}
            {subTab === 'members' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }} className="no-print">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>ইউনিট ফিল্টার:</span>
                  {['সব', 'স্কাউট দল', 'গার্লস গাইড', 'কাব স্কাউট'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setScoutUnitFilter(u)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: scoutUnitFilter === u ? 'none' : '1px solid #cbd5e1',
                        background: scoutUnitFilter === u ? '#16a34a' : '#f8fafc',
                        color: scoutUnitFilter === u ? '#ffffff' : '#334155',
                        fontWeight: scoutUnitFilter === u ? 700 : 500,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 12px' }}>আইডি নং</th>
                        <th style={{ padding: '10px 12px' }}>স্কাউট/গাইড সদস্যের নাম</th>
                        <th style={{ padding: '10px 12px' }}>ইউনিট ও উপদল</th>
                        <th style={{ padding: '10px 12px' }}>পদবি / পদমর্যাদা</th>
                        <th style={{ padding: '10px 12px' }}>শ্রেণি ও রোল</th>
                        <th style={{ padding: '10px 12px' }}>অর্জিত ব্যাজ ও সম্মাননা</th>
                        <th style={{ padding: '10px 12px' }}>রক্তের গ্রুপ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m, idx) => (
                        <tr key={m.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>{m.id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{m.name}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: m.unit === 'গার্লস গাইড' ? '#fce7f3' : '#dcfce7', color: m.unit === 'গার্লস গাইড' ? '#9d174d' : '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                              {m.unit}
                            </span>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{m.patrol}</div>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#334155' }}>{m.rank}</td>
                          <td style={{ padding: '10px 12px' }}>{m.class_name} (রোল {m.roll})</td>
                          <td style={{ padding: '10px 12px', color: '#b45309', fontWeight: 600 }}>{m.badges}</td>
                          <td style={{ padding: '10px 12px' }}><span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{m.blood}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab: Events */}
            {subTab === 'events' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                {MOCK_SCOUT_EVENTS.map((ev, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px' }}>{ev.date}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>অংশগ্রহণ: {ev.participants}</span>
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>{ev.title}</h3>
                    <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>📍 ভেন্যু: {ev.venue}</div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>{ev.highlights}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-tab: Laws */}
            {subTab === 'laws' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ffffff', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '17px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚜️</span> বাংলাদেশ স্কাউটস প্রতিজ্ঞা
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.8', fontStyle: 'italic', opacity: 0.95 }}>
                    "আমি আমার আত্মমর্যাদার উপর নির্ভর করে প্রতিজ্ঞা করছি যে,<br/>
                    ১. আল্লাহ্ ও আমার দেশের প্রতি কর্তব্য পালন করতে,<br/>
                    ২. সর্বদা অপরকে সাহায্য করতে এবং<br/>
                    ৩. স্কাউট আইন মেনে চলতে আমি যথাসাধ্য চেষ্টা করব।"
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: '#166534', fontWeight: 700 }}>
                    📜 স্কাউটের ৭টি মূল নিয়মাবলী (Scout Law)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    {MOCK_SCOUT_LAWS.map((law, idx) => (
                      <div key={idx} style={{ padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        {law}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================= 8. INTER-SCHOOL SPORTS (আন্তঃবিদ্যালয় ক্রীড়া) ======================= */}
      {activeCategory === 'inter_sports' && (() => {
        const interTeams = adminStorage?.inter_sports?.teams?.length ? adminStorage.inter_sports.teams : MOCK_INTER_SPORTS_TEAMS;
        const interMatches = adminStorage?.inter_sports?.matches?.length ? adminStorage.inter_sports.matches : MOCK_INTER_SPORTS_MATCHES;

        return (
          <div className="section-standalone-intersports">
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 600 }}>আন্তঃবিদ্যালয় ক্রীড়া স্কোয়াড</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c2d12', margin: '4px 0' }}>{interTeams.length} টি দল</div>
                <div style={{ fontSize: '11.5px', color: '#ea580c' }}>ফুটবল, ক্রিকেট, হ্যান্ডবল ও কাবাডি</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#a16207', fontWeight: 600 }}>চলতি শিক্ষাবর্ষের খেতাব</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#713f12', margin: '4px 0' }}>উপজেলা চ্যাম্পিয়ন 🏆</div>
                <div style={{ fontSize: '11.5px', color: '#854d0e' }}>গ্রীষ্মকালীন আন্তঃবিদ্যালয় ফুটবল ২০২৫</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>প্রধান কোচ ও প্রশিক্ষক</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>মোঃ শাহ আলম</div>
                <div style={{ fontSize: '11.5px', color: '#2563eb' }}>শারীরিক শিক্ষা শিক্ষক ও জাতীয় ক্রীড়া ব্যক্তিত্ব</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>দলীয় অধিনায়ক (ফুটবল)</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>তানভীর আহমেদ (১০ম)</div>
                <div style={{ fontSize: '11.5px', color: '#16a34a' }}>টুর্নামেন্টের সর্বোচ্চ গোলদাতা</div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap' }} className="no-print">
              <button
                type="button"
                onClick={() => setSubTab('teams')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'teams' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                  background: subTab === 'teams' ? '#fff7ed' : '#ffffff',
                  color: subTab === 'teams' ? '#c2410c' : '#334155',
                  fontWeight: subTab === 'teams' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🏆 টুর্নামেন্ট স্কোয়াড ও টিম ({interTeams.length} টি)
              </button>
              <button
                type="button"
                onClick={() => setSubTab('matches')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: subTab === 'matches' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                  background: subTab === 'matches' ? '#fff7ed' : '#ffffff',
                  color: subTab === 'matches' ? '#c2410c' : '#334155',
                  fontWeight: subTab === 'matches' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                ⚽ ম্যাচ ফলাফল ও সাম্প্রতিক স্কোরবোর্ড
              </button>
            </div>

            {/* Sub-tab: Teams */}
            {subTab === 'teams' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {interTeams.map((t, idx) => (
                  <div key={t.id || idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px' }}>{t.sport}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>স্কোয়াড: {t.squadSize}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 700, marginBottom: '8px' }}>🏅 {t.recentHonor}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#334155' }}>
                      <div><b>অধিনায়ক:</b> {t.captain}</div>
                      <div><b>টিম কোচ:</b> {t.coach}</div>
                      <div><b>ম্যানেজার:</b> {t.manager}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-tab: Matches */}
            {subTab === 'matches' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {interMatches.map((m, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {m.date} • 📍 {m.venue}</span>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{m.result}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>{m.tournament}</h4>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1', marginBottom: '4px' }}>
                      স্কোর: {m.score}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      ⭐ ম্যাচ সেরা নৈপুণ্য: <b>{m.hero}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
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
