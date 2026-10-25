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
  ],
  lab: {
    inCharge: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি ও ল্যাব ইনচার্জ)',
    assistant: 'মোঃ মামুন মিয়া (ল্যাব সহকারী ও টেকনিশিয়ান)',
    room: 'দ্বিতীয় তলা, পূর্ব ভবন (কক্ষ নং ২০৪)',
    devices: [
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
    ],
    schedule: [
      { id: 'ls-01', day: 'রবিবার', period: '৩য় পিরিয়ড (১১:০০-১১:৪৫)', class_name: '১০ম শ্রেণি', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি (ব্যবহারিক)', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', topic: 'HTML ওয়েব ডিজাইন ও বেসিক কোডিং' },
      { id: 'ls-02', day: 'সোমবার', period: '৪র্থ পিরিয়ড (১১:৪৫-১২:৩০)', class_name: '৯ম শ্রেণি', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি (ব্যবহারিক)', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', topic: 'স্প্রেডশিট বিশ্লেষণ ও হিসাব নিকাশ (Excel)' },
      { id: 'ls-03', day: 'মঙ্গলবার', period: '২য় পিরিয়ড (১০:১৫-১১:০০)', class_name: '৮ম শ্রেণি', subject: 'আইসিটি প্র্যাকটিক্যাল', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', topic: 'ডাটাবেজ ও সাইবার নিরাপত্তা পরিচিতি' },
      { id: 'ls-04', day: 'বুধবার', period: '৫ম পিরিয়ড (০১:১৫-০২:০০)', class_name: '৭ম শ্রেণি', subject: 'ডিজিটাল প্রযুক্তি', teacher: 'সহকারী শিক্ষক', topic: 'গ্রাফিক্স ডিজাইন ও পাওয়ারপয়েন্ট প্রেজেন্টেশন' },
      { id: 'ls-05', day: 'বৃহস্পতিবার', period: '৬ষ্ঠ পিরিয়ড (০২:০০-০২:৪৫)', class_name: '৬ষ্ঠ শ্রেণি', subject: 'ডিজিটাল প্রযুক্তি প্র্যাকটিস', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', topic: 'কম্পিউটার হার্ডওয়্যার ও টাইপিং মাস্টার' }
    ],
    rules: [
      'ল্যাবে প্রবেশের পূর্বে জুতা নির্দিষ্ট র্যাকে রেখে সুশৃঙ্খলভাবে প্রবেশ করুন।',
      'ল্যাবের ভেতরে কোনো প্রকার খাবার, পানীয় বা তরল পদার্থ বহন সম্পূর্ণ নিষিদ্ধ।',
      'নির্দিষ্ট ডেস্কের বাইরে অন্য কোনো কম্পিউটারে অনুমতি ব্যতীত কাজ করা নিষেধ।',
      'কোনো ডিভাইস বা তারে টান দেওয়া বা আনপ্লাগ করা যাবে না। কোনো ত্রুটি হলে তাৎক্ষণিক ল্যাব ইনচার্জকে অবহিত করুন।',
      'ইন্টারনেট ব্যবহারের সময় কেবল প্রাতিষ্ঠানিক ও শিক্ষামূলক ওয়েবসাইট ব্রাউজ করতে হবে।',
      'ক্লাস শেষে কম্পিউটার শাটডাউন করে নিজ চেয়ার গুছিয়ে রাখুন।'
    ]
  },
  multimedia: {
    rooms: [
      { id: 'mmr-01', name: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', projector: 'Epson EB-2250U 5000 Lumens Full HD', sound: 'Yamaha Dolby Audio 100W', backup: 'সোলার ও সেন্ট্রাল IPS ৩ ঘণ্টা ব্যাকআপ', capacity: '৬৫ জন শিক্ষার্থী', status: 'সক্রিয়', incharge: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)' },
      { id: 'mmr-02', name: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১ - নতুন একাডেমিক ভবন)', projector: 'BenQ Interactive 4K Smart Board 75"', sound: 'JBL Wireless Dual Mic & Surround System', backup: 'অনলাইন ইউপিএস ও জেনারেটর ব্যাকআপ', capacity: '৮৫ জন শিক্ষার্থী', status: 'সক্রিয়', incharge: 'মোঃ হাবিবুর রহমান (সিনিয়র সহকারী শিক্ষক)' },
      { id: 'mmr-03', name: 'সেন্ট্রাল অডিটোরিয়াম ও সেমিনার হল (কক্ষ নং ১০৫)', projector: 'Optoma Laser Cinema Projector 6000 Lumens', sound: 'Ahuja Digital Audio Console + 4 Speaker Units', backup: 'হেভি-ডিউটি সেন্ট্রাল জেনারেটর ব্যাকআপ', capacity: '১৫০ জন শিক্ষার্থী', status: 'সক্রিয়', incharge: 'মুহাম্মদ আবুবকর সিদ্দিক (ল্যাব ইনচার্জ)' }
    ],
    schedule: [
      { id: 'ms-01', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', day: 'রবিবার', period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)', class_name: '১০ম শ্রেণি', section: 'পদ্মা', subject: 'পদার্থবিজ্ঞান', teacher: 'মোঃ হাবিবুর রহমান', resource: 'শিক্ষক বাতায়ন ও ৩ডি পরমাণু মডেল ও সিমুলেশন' },
      { id: 'ms-02', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', day: 'রবিবার', period: '২য় পিরিয়ড (১০:১৫-১১:০০)', class_name: '৯ম শ্রেণি', section: 'মেঘনা', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', resource: 'HTML কোডিং ভিজ্যুয়াল ব্রাউজার ডেমো' },
      { id: 'ms-03', roomId: 'mmr-02', roomName: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১)', day: 'সোমবার', period: '২য় পিরিয়ড (১০:১৫-১১:০০)', class_name: '৯ম শ্রেণি', section: 'পদ্মা', subject: 'জীববিজ্ঞান', teacher: 'মোসাঃ নাসরিন আক্তার', resource: 'মুক্তপাঠ মানবদেহের রক্ত সংবহন অ্যানিমেশন' },
      { id: 'ms-04', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', day: 'মঙ্গলবার', period: '৩য় পিরিয়ড (১১:০০-১১:৪৫)', class_name: '৮ম শ্রেণি', section: 'যমুনা', subject: 'সাধারণ বিজ্ঞান', teacher: 'মোঃ আব্দুল খালেক', resource: 'সৌরজগৎ ও মহাবিশ্ব সিমুলেশন' },
      { id: 'ms-05', roomId: 'mmr-02', roomName: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১)', day: 'বুধবার', period: '৪র্থ পিরিয়ড (১১:৪৫-১২:৩০)', class_name: '১০ম শ্রেণি', section: 'কর্ণফুলী', subject: 'উচ্চতর গণিত', teacher: 'মোঃ আশরাফুল আলম', resource: 'GeoGebra ত্রিমাত্রিক জ্যামিতিক গ্রাফ' },
      { id: 'ms-06', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', day: 'বৃহস্পতিবার', period: '৫ম পিরিয়ড (০১:১৫-০২:০০)', class_name: '৭ম শ্রেণি', section: 'ক-শাখা', subject: 'ভূগোল ও পরিবেশ', teacher: 'তাপসী সরকার', resource: 'গুগল আর্থ ও ভার্চুয়াল জিওগ্রাফিক ট্যুর' },
      { id: 'ms-07', roomId: 'mmr-02', roomName: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১)', day: 'বৃহস্পতিবার', period: '৬ষ্ঠ পিরিয়ড (০২:০০-০২:৪৫)', class_name: '৬ষ্ঠ শ্রেণি', section: 'খ-শাখা', subject: 'ডিজিটাল প্রযুক্তি', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', resource: 'স্ক্র্যাচ অ্যানিমেশন ও কোডিং বেসিকস' }
    ],
    logs: [
      { id: 'ml-01', date: '২০২৬-১০-২৫', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)', class_name: '১০ম শ্রেণি', section: 'পদ্মা', subject: 'পদার্থবিজ্ঞান', teacher: 'মোঃ হাবিবুর রহমান', status: 'taken', topicCovered: 'আলোর প্রতিফলন ও গোলীয় দর্পণ সিমুলেশন', studentsPresent: '৫৮ জন', projectorUsed: 'Epson EB-2250U 5000 Lumens', remarks: 'শিক্ষার্থীরা সফলভাবে ৩ডি অ্যানিমেশন পর্যবেক্ষণ করেছে' },
      { id: 'ml-02', date: '২০২৬-১০-২৫', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', period: '২য় পিরিয়ড (১০:১৫-১১:০০)', class_name: '৯ম শ্রেণি', section: 'মেঘনা', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', status: 'taken', topicCovered: 'HTML লিস্ট ও টেবিল ট্যাগ ডিজাইন', studentsPresent: '৫২ জন', projectorUsed: 'Epson EB-2250U 5000 Lumens', remarks: 'প্রজেক্টরে লাইভ কোড রান ও পরীক্ষা সম্পন্ন' },
      { id: 'ml-03', date: '২০২৬-১০-২৫', roomId: 'mmr-02', roomName: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১)', period: '৩য় পিরিয়ড (১১:০০-১১:৪৫)', class_name: '৮ম শ্রেণি', section: 'যমুনা', subject: 'সাধারণ বিজ্ঞান', teacher: 'মোঃ আব্দুল খালেক', status: 'missed', reasonNotTaken: 'শিক্ষক দাপ্তরিক কাজে উপজেলা মাধ্যমিক শিক্ষা অফিসে অবস্থান করছিলেন', remarks: 'পরবর্তী কর্মদিবসে মেক-আপ ক্লাস নির্ধারণ করা হয়েছে' },
      { id: 'ml-04', date: '২০২৬-১০-২৪', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', period: '২য় পিরিয়ড (১০:১৫-১১:০০)', class_name: '৯ম শ্রেণি', section: 'পদ্মা', subject: 'জীববিজ্ঞান', teacher: 'মোসাঃ নাসরিন আক্তার', status: 'taken', topicCovered: 'মানব হৃৎপিণ্ড ও রক্ত সংবহন ৩ডি মডেল', studentsPresent: '৫৫ জন', projectorUsed: 'Epson EB-2250U', remarks: 'শিক্ষক বাতায়নের সেরা কন্টেন্ট প্রদর্শিত' },
      { id: 'ml-05', date: '২০২৬-১০-২৪', roomId: 'mmr-02', roomName: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১)', period: '৪র্থ পিরিয়ড (১১:৪৫-১২:৩০)', class_name: '১০ম শ্রেণি', section: 'কর্ণফুলী', subject: 'উচ্চতর গণিত', teacher: 'মোঃ আশরাফুল আলম', status: 'taken', topicCovered: 'স্থানাঙ্ক জ্যামিতি ও ত্রিভুজের ক্ষেত্রফল', studentsPresent: '৪৭ জন', projectorUsed: 'BenQ Interactive 4K Smart Board', remarks: 'স্মার্ট বোর্ডে শিক্ষার্থীদের দিয়ে অনুশীলন করানো হয়' },
      { id: 'ml-06', date: '২০২৬-১০-২৩', roomId: 'mmr-01', roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)', period: '৫ম পিরিয়ড (০১:১৫-০২:০০)', class_name: '৭ম শ্রেণি', section: 'ক-শাখা', subject: 'ভূগোল ও পরিবেশ', teacher: 'তাপসী সরকার', status: 'missed', reasonNotTaken: 'হঠাৎ বিদ্যুৎ বিভ্রাট ও ব্যাকআপ আইপিএস রক্ষণাবেক্ষণ চলাকালীন সময়ে', remarks: 'সাধারণ শ্রেণিকক্ষে পাঠদান পরিচালিত হয়েছে' },
      { id: 'ml-07', date: '২০২৬-১০-২৩', roomId: 'mmr-02', roomName: 'ডিজিটাল সায়েন্স ও আইসিটি ক্লাসরুম (কক্ষ নং ৩০১)', period: '৬ষ্ঠ পিরিয়ড (০২:০০-০২:৪৫)', class_name: '৬ষ্ঠ শ্রেণি', section: 'খ-শাখা', subject: 'ডিজিটাল প্রযুক্তি', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', status: 'taken', topicCovered: 'কম্পিউটার নেটওয়ার্ক ও ক্লাউড ড্রাইভ পরিচিতি', studentsPresent: '৬০ জন', projectorUsed: 'BenQ Interactive Smart Board', remarks: 'শতভাগ উপস্থিতি ও ব্যবহারিক ডেমো সফল' }
    ],
    projects: [
      { id: 'mp-01', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', teacherDesignation: 'সহকারী শিক্ষক, আইসিটি ও ল্যাব ইনচার্জ', projectTitle: 'স্মার্ট স্কুল নেটওয়ার্কিং ও সাইবার সচেতনতা ৩ডি ইন্টারেক্টিভ সিমুলেশন', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', class_name: '৯ম-১০ম শ্রেণি', platform: 'শিক্ষক বাতায়ন ও বিদ্যালয় ক্লাউড রিপোজিটরি', contentUrl: 'https://teachers.gov.bd/content/details/magra-ict-01', toolsUsed: 'PowerPoint, Canva Pro, Cisco Packet Tracer, Camtasia', dateCreated: '২০২৬-০৮-১৫', learningOutcomes: 'শিক্ষার্থীরা বিদ্যালয়ের লোকাল এরিয়া নেটওয়ার্ক আর্কিটেকচার এবং সাইবার নিরাপত্তা ঝুঁকি চিহ্নিত করতে সক্ষম হবে।', ratingOrBadge: '🏆 বাতায়ন পাক্ষিক সেরা কন্টেন্ট নির্মাতা' },
      { id: 'mp-02', teacher: 'মুহাম্মদ আবুবকর সিদ্দিক', teacherDesignation: 'সহকারী শিক্ষক, আইসিটি ও ল্যাব ইনচার্জ', projectTitle: 'HTML5 ওয়েবপেজ ডেভেলপমেন্ট ও লাইভ কোডিং স্টুডিও', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', class_name: '১০ম শ্রেণি', platform: 'শিক্ষক বাতায়ন', contentUrl: 'https://teachers.gov.bd/content/details/magra-html5-02', toolsUsed: 'VS Code Live Server, OBS Studio, Prezi', dateCreated: '২০২৬-০৯-১০', learningOutcomes: 'শিক্ষার্থীরা নিজস্ব বায়োডাটা ও প্রাতিষ্ঠানিক ওয়েবপেজের গঠন ও টেবিল কোডিং করতে পারবে।', ratingOrBadge: '⭐⭐⭐⭐⭐ (৫★ রেটিং)' },
      { id: 'mp-03', teacher: 'মোঃ হাবিবুর রহমান', teacherDesignation: 'সিনিয়র সহকারী শিক্ষক, পদার্থবিজ্ঞান', projectTitle: 'আলোর প্রতিসরণ ও লেন্সের বাস্তব ৩ডি রে ডায়াগ্রাম সিমুলেশন', subject: 'পদার্থবিজ্ঞান', class_name: '১০ম শ্রেণি', platform: 'শিক্ষক বাতায়ন ও মুক্তপাঠ', contentUrl: 'https://teachers.gov.bd/content/details/phy-lens-01', toolsUsed: 'PhET Interactive Simulation, MS PowerPoint 365', dateCreated: '২০২৬-০৭-২২', learningOutcomes: 'উত্তল ও অবতল লেন্সের প্রতিবিম্ব গঠনের প্রকৃতি ও রৈখিক বিবর্ধন সরাসরি অনুধাবন।', ratingOrBadge: '🌟 জেলা সেরা ডিজিটাল কন্টেন্ট স্বীকৃতি' },
      { id: 'mp-04', teacher: 'মোসাঃ নাসরিন আক্তার', teacherDesignation: 'সহকারী শিক্ষিকা, জীববিজ্ঞান', projectTitle: 'সালোকসংশ্লেষণ প্রক্রিয়ার ফটোসিন্থেটিক ৩ডি অ্যানিমেশন ও কুইজ', subject: 'জীববিজ্ঞান', class_name: '৯ম-১০ম শ্রেণি', platform: 'শিক্ষক বাতায়ন', contentUrl: 'https://teachers.gov.bd/content/details/bio-photo-01', toolsUsed: 'Canva Education, Animaker, Google Forms Quiz', dateCreated: '২০২৬-০৬-৩০', learningOutcomes: 'আলোক পর্যায় ও অন্ধকার পর্যায়ের এটিপি এবং এনএডিপিএইচ সংশ্লেষণ প্রক্রিয়া বিশ্লেষণ।', ratingOrBadge: '🏆 উপজেলা পর্যায়ে শ্রেষ্ঠ শিক্ষিকা সম্মাননা' },
      { id: 'mp-05', teacher: 'মোঃ আশরাফুল আলম', teacherDesignation: 'সহকারী শিক্ষক, উচ্চতর গণিত', projectTitle: 'GeoGebra সফটওয়্যারে ত্রিমাত্রিক ঘনবস্তুর পৃষ্ঠতল ও আয়তন বিশ্লেষণ', subject: 'উচ্চতর গণিত', class_name: '১০ম শ্রেণি', platform: 'মুক্তপাঠ ও শিক্ষক বাতায়ন', contentUrl: 'https://teachers.gov.bd/content/details/math-geogebra-01', toolsUsed: 'GeoGebra 3D Calculator, PowerPoint', dateCreated: '২০২৬-০৮-০৫', learningOutcomes: 'গোলক, কোণক ও বেলনের ত্রিমাত্রিক রূপ ও সূত্রাবলির জ্যামিতিক প্রমাণ।', ratingOrBadge: '⭐⭐⭐⭐⭐ (৫★ রেটিং)' },
      { id: 'mp-06', teacher: 'তাপসী সরকার', teacherDesignation: 'সহকারী শিক্ষিকা, সামাজিক বিজ্ঞান', projectTitle: 'গুগল আর্থ ও ভার্চুয়াল মানচিত্রে বাংলাদেশের নদীপ্রণালী ও ভূতাত্ত্বিক গঠন', subject: 'ভূগোল ও পরিবেশ', class_name: '৭ম-৮ম শ্রেণি', platform: 'বিদ্যালয় ডিজিটাল রিপোজিটরি', contentUrl: 'https://teachers.gov.bd/content/details/geo-river-01', toolsUsed: 'Google Earth Studio, PowerPoint, Canva', dateCreated: '২০২৬-০৯-১৮', learningOutcomes: 'পদ্মা, মেঘনা ও যমুনার গতিপথ ও বদ্বীপ অঞ্চলের বৈশিষ্ট্য সরাসরি স্যাটেলাইট চিত্রে পর্যবেক্ষণ।', ratingOrBadge: 'বিশেষ প্রশংসিত উদ্ভাবনী উপকরণ' }
    ],
    contents: [
      { id: 'mc-01', title: 'সালোকসংশ্লেষণ প্রক্রিয়ার ৩ডি অ্যানিমেশন', subject: 'জীববিজ্ঞান', class_name: '৯ম-১০ম', author: 'মোসাঃ নাসরিন আক্তার', portal: 'শিক্ষক বাতায়ন', views: '১২৫০+' },
      { id: 'mc-02', title: 'নিউটনের গতিসূত্র ও বাস্তবিক প্রয়োগ', subject: 'পদার্থবিজ্ঞান', class_name: '১০ম শ্রেণি', author: 'মোঃ হাবিবুর রহমান', portal: 'মুক্তপাঠ', views: '৯৮০+' },
      { id: 'mc-03', title: 'ত্রিকোণমিতির বাস্তব পরিমাপ ও সমীক্ষা', subject: 'উচ্চতর গণিত', class_name: '১০ম শ্রেণি', author: 'মোঃ আশরাফুল আলম', portal: 'বিদ্যালয় ডিজিটাল রিপোজিটরি', views: '৭৪০+' }
    ]
  },
  scouts: {
    troopInfo: {
      troopNo: 'মগড়া পালস্ ১০৮তম উন্মুক্ত স্কাউট ও গার্লস গাইড দল',
      leader: 'মোঃ শাহ আলম (উডব্যাজার ও ইউনিট লিডার)',
      girlsGuideLeader: 'মোসাঃ নাসরিন আক্তার (গাইড ক্যাপটেন)',
      cubLeader: 'তাপসী সরকার (কাব লিডার)',
      registeredCount: '৬৪ জন সক্রিয় শিক্ষার্থী',
      charterNo: 'BS-TGL-2018-108'
    },
    members: [
      { id: 'sc-01', name: 'মেহেদী হাসান', class_name: '১০ম', roll_no: '১', unit: 'স্কাউট দল', patrol: 'টাইগার প্যাট্রোল', rank: 'দলনেতা (Senior Patrol Leader)', badge: 'স্ট্যান্ডার্ড ও প্রসিডেন্ট রোভার স্কাউট পদপ্রার্থী', phone: '০১৭XXXXXXXX', bloodGroup: 'B+' },
      { id: 'sc-02', name: 'নাঈমুল ইসলাম', class_name: '১০ম', roll_no: '৬', unit: 'স্কাউট দল', patrol: 'ঈগল প্যাট্রোল', rank: 'সহ-দলনেতা', badge: 'ফার্স্ট এইড ও রেসকিউ ব্যাজ', phone: '০১৮XXXXXXXX', bloodGroup: 'A+' },
      { id: 'sc-03', name: 'ফাতেমা তুজ জোহরা', class_name: '৯ম', roll_no: '২', unit: 'গার্লস গাইড', patrol: 'শাপলা প্যাট্রোল', rank: 'কোম্পানি লিডার', badge: 'স্বর্ণচম্পা ব্যাজ ও স্বাস্থ্য সেবা', phone: '০১৯XXXXXXXX', bloodGroup: 'O+' },
      { id: 'sc-04', name: 'তানজিলা আক্তার', class_name: '৮ম', roll_no: '৪', unit: 'গার্লস গাইড', patrol: 'দোয়েল প্যাট্রোল', rank: 'সহ-কোম্পানি লিডার', badge: 'ক্যাম্প ক্রাফট ও নট ব্যাজ', phone: '০১৬XXXXXXXX', bloodGroup: 'AB+' },
      { id: 'sc-05', name: 'তাহমিদ ইসলাম', class_name: '৭ম', roll_no: '৩', unit: 'কাব স্কাউট', patrol: 'সিয়োনী প্যাক', rank: 'ষড়ক প্রধান (Sixer)', badge: 'চাঁদ তারা ব্যাজ', phone: '০১৭XXXXXXXX', bloodGroup: 'O+' }
    ],
    events: [
      { id: 'se-01', title: 'জেলা স্কাউট সমাবেশ ও ক্যাম্পোরি ২০২৬', date: '২০২৬-০১-১০ থেকে ১২', venue: 'টাঙ্গাইল জেলা স্টেডিয়াম চত্বর', leader: 'মোঃ শাহ আলম (উডব্যাজার)', participants: '২৪ জন', award: 'শ্রেষ্ঠ সুশৃঙ্খল দল ট্রফি 🏆' },
      { id: 'se-02', title: 'জাতীয় দুর্যোগ প্রস্তুতি দিবস ও ফার্স্ট এইড ড্রিল', date: '২০২৬-০৩-১০', venue: 'বিদ্যালয় প্রাঙ্গণ', leader: 'মোসাঃ নাসরিন আক্তার', participants: '৫০ জন', award: 'রেড ক্রিসেন্ট সনদপত্র 🎖️' },
      { id: 'se-03', title: 'মহান স্বাধীনতা দিবস কুচকাওয়াজ ও গার্ড অব অনার', date: '২০২৬-০৩-২৬', venue: 'উপজেলা পরিষদ মাঠ', leader: 'মোঃ শাহ আলম', participants: '৩২ জন', award: '১ম স্থান (কুচকাওয়াজ স্বর্ণপদক) 🥇' }
    ]
  },
  inter_sports: {
    teams: [
      {
        id: 'team-fb',
        name: 'মগড়া পালস্ ফুটবল একাদশ',
        sport: 'ফুটবল',
        coach: 'মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)',
        captain: 'তানভীর আহমেদ (১০ম শ্রেণি, স্ট্রাইকার)',
        squad: [
          { name: 'তানভীর আহমেদ', class_name: '১০ম', roll_no: '১', pos: 'স্ট্রাইকার (অধিনায়ক)' },
          { name: 'নাঈমুল ইসলাম', class_name: '১০ম', roll_no: '৬', pos: 'গোলকিপার' },
          { name: 'আরিফুল ইসলাম', class_name: '১০ম', roll_no: '৫', pos: 'সেন্টার ব্যাক' },
          { name: 'সাকিব আল হাসান', class_name: '৯ম', roll_no: '১২', pos: 'মিডফিল্ডার' },
          { name: 'শামীম রেজা', class_name: '৯ম', roll_no: '৭', pos: 'রাইট উইঙ্গার' }
        ]
      },
      {
        id: 'team-ck',
        name: 'মগড়া পালস্ ক্রিকেট দল',
        sport: 'ক্রিকেট',
        coach: 'মোঃ রফিকুল ইসলাম (সিনিয়র শিক্ষক)',
        captain: 'মেহেদী হাসান (১০ম শ্রেণি, অলরাউন্ডার)',
        squad: [
          { name: 'মেহেদী হাসান', class_name: '১০ম', roll_no: '২', pos: 'অলরাউন্ডার (অধিনায়ক)' },
          { name: 'রাকিবুল হাসান', class_name: '১০ম', roll_no: '৪', pos: 'উইকেটকিপার ব্যাটার' },
          { name: 'তাহসিন আহমেদ', class_name: '৯ম', roll_no: '৮', pos: 'ফাস্ট বোলার' },
          { name: 'ফারহান আহমেদ', class_name: '১০ম', roll_no: '৩', pos: 'স্পিন বোলার' }
        ]
      }
    ],
    matches: [
      { id: 'im-01', tournament: 'উপজেলা ৫০তম গ্রীষ্মকালীন ক্রীড়া প্রতিযোগিতা', sport: 'ফুটবল', opponent: 'কালিহাতী আর.এস. সরকারি উচ্চ বিদ্যালয়', date: '২০২৫-০৯-২০', venue: 'উপজেলা কেন্দ্রীয় খেলার মাঠ', result: 'জয় (২-১)', bestPlayer: 'তানভীর আহমেদ (২টি গোল)', trophy: 'উপজেলা চ্যাম্পিয়ন ট্রফি 🏆' },
      { id: 'im-02', tournament: 'টাঙ্গাইল জেলা আন্তঃস্কুল ক্রিকেট চ্যাম্পিয়নশিপ', sport: 'ক্রিকেট', opponent: 'বিন্দু বাসিনী সরকারি বালক উচ্চ বিদ্যালয়', date: '২০২৬-০২-০৫', venue: 'টাঙ্গাইল জেলা স্টেডিয়াম', result: 'জয় (৩৬ রানে)', bestPlayer: 'মেহেদী হাসান (৫২ রান ও ৩ উইকেট)', trophy: 'ম্যান অব দ্য ম্যাচ ও রানার্স-আপ 🥈' }
    ]
  }
};

export function SportsCultureAdminEngine({ initialSection = 'sports' }) {
  const [activeTab, setActiveTab] = useState(
    initialSection === 'culture' ? 'culture' :
    initialSection === 'achievements' ? 'achievements' :
    initialSection === 'tour' ? 'tour' :
    initialSection === 'lab' ? 'lab' :
    initialSection === 'multimedia' ? 'multimedia' :
    initialSection === 'scouts' ? 'scouts' :
    initialSection === 'inter_sports' ? 'inter_sports' : 'sports'
  );

  useEffect(() => {
    if (initialSection && ['sports', 'culture', 'achievements', 'tour', 'lab', 'multimedia', 'scouts', 'inter_sports'].includes(initialSection)) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  const [data, setData] = useState(INITIAL_DATA);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [msg, setMsg] = useState('');

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // New Domain Modals
  const [showLabDeviceModal, setShowLabDeviceModal] = useState(false);
  const [showLabScheduleModal, setShowLabScheduleModal] = useState(false);

  const [showScoutMemberModal, setShowScoutMemberModal] = useState(false);
  const [showScoutEventModal, setShowScoutEventModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({});
  const [rosterForm, setRosterForm] = useState({ student_id: '', name: '', class_name: '১০ম', roll_no: '', house: 'পদ্মা হাউজ', chestNo: '', segment: 'দেশাত্মবোধক গান', itemTitle: '', busNo: 'বাস-১', seatNo: '০১', guardianPhone: '', feePaid: true });
  const [resultForm, setResultForm] = useState({});

  // Sub-forms for new domains
  const [labDeviceForm, setLabDeviceForm] = useState({
    id: '',
    assetTag: '',
    name: '',
    category: 'ডেস্কটপ',
    model: '',
    cpu: '',
    ram: '',
    storage: '',
    source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)',
    procurementYear: '২০২১',
    condition: 'সক্রিয়',
    ip: '',
    desk: '',
    registerType: 'active'
  });
  const [labRegisterBook, setLabRegisterBook] = useState('active'); // 'active' | 'repairable' | 'scrap'
  const [labCategoryFilter, setLabCategoryFilter] = useState('all');
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [showMoveToRepairModal, setShowMoveToRepairModal] = useState(false);
  const [showMoveToScrapModal, setShowMoveToScrapModal] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [repairMoveForm, setRepairMoveForm] = useState({
    defectDetails: '',
    sentForRepairDate: '',
    serviceCenter: '',
    technicianPhone: '',
    estimatedCost: ''
  });
  const [scrapMoveForm, setScrapMoveForm] = useState({
    condemnReason: '',
    condemnDate: '',
    disposalStatus: 'নিলামের জন্য সংরক্ষিত'
  });

  const [labScheduleForm, setLabScheduleForm] = useState({ id: '', day: 'রবিবার', period: '৩য় পিরিয়ড (১১:০০-১১:৪৫)', class_name: '১০ম শ্রেণি', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি (ব্যবহারিক)', teacher: '', topic: '' });
  // Multimedia Module States
  const [mmSubTab, setMmSubTab] = useState('routine'); // 'routine' | 'logs' | 'projects' | 'rooms'
  const [mmRoomFilter, setMmRoomFilter] = useState('all');
  const [mmTeacherFilter, setMmTeacherFilter] = useState('all');
  const [mmLogStatusFilter, setMmLogStatusFilter] = useState('all'); // 'all' | 'taken' | 'missed'
  const [mmSearchQuery, setMmSearchQuery] = useState('');
  const [showMmScheduleModal, setShowMmScheduleModal] = useState(false);
  const [mmScheduleForm, setMmScheduleForm] = useState({
    id: '',
    roomId: 'mmr-01',
    roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)',
    day: 'রবিবার',
    period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)',
    class_name: '১০ম শ্রেণি',
    section: 'পদ্মা',
    subject: '',
    teacher: '',
    resource: ''
  });

  const [showMmLogModal, setShowMmLogModal] = useState(false);
  const [mmLogForm, setMmLogForm] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    roomId: 'mmr-01',
    roomName: 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)',
    period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)',
    class_name: '১০ম শ্রেণি',
    section: 'পদ্মা',
    subject: '',
    teacher: '',
    status: 'taken',
    topicCovered: '',
    studentsPresent: '৫৫ জন',
    projectorUsed: 'Epson EB-2250U 5000 Lumens Full HD',
    reasonNotTaken: '',
    remarks: ''
  });

  const [showMmProjectModal, setShowMmProjectModal] = useState(false);
  const [mmProjectForm, setMmProjectForm] = useState({
    id: '',
    teacher: '',
    teacherDesignation: 'সহকারী শিক্ষক',
    projectTitle: '',
    subject: '',
    class_name: '১০ম শ্রেণি',
    platform: 'শিক্ষক বাতায়ন',
    contentUrl: '',
    toolsUsed: 'MS PowerPoint, Canva, Camtasia',
    dateCreated: '',
    learningOutcomes: '',
    ratingOrBadge: '⭐⭐⭐⭐⭐ (৫★ রেটিং)'
  });

  const [showMmRoomModal, setShowMmRoomModal] = useState(false);
  const [mmRoomForm, setMmRoomForm] = useState({
    id: '',
    name: '',
    projector: 'Epson 4K Laser Ultra HD',
    sound: 'Yamaha Dolby Audio System',
    backup: 'সেন্ট্রাল IPS ও জেনারেটর ব্যাকআপ',
    capacity: '৬৫ জন শিক্ষার্থী',
    status: 'সক্রিয়',
    incharge: 'মুহাম্মদ আবুবকর সিদ্দিক (ল্যাব ইনচার্জ)'
  });

  const [mmContentForm, setMmContentForm] = useState({ id: '', title: '', subject: '', class_name: '৯ম-১০ম', author: '', portal: 'শিক্ষক বাতায়ন', views: '১০০+' });
  const [scoutMemberForm, setScoutMemberForm] = useState({ id: '', name: '', class_name: '১০ম', roll_no: '', unit: 'স্কাউট দল', patrol: 'টাইগার প্যাট্রোল', rank: 'সাধারণ সদস্য', badge: 'স্ট্যান্ডার্ড ব্যাজ', phone: '', bloodGroup: 'B+' });
  const [scoutEventForm, setScoutEventForm] = useState({ id: '', title: '', date: '', venue: '', leader: '', participants: '', award: '' });
  const [teamForm, setTeamForm] = useState({ id: '', name: '', sport: 'ফুটবল', coach: '', captain: '', squad: [] });
  const [matchForm, setMatchForm] = useState({ id: '', tournament: '', sport: 'ফুটবল', opponent: '', date: '', venue: '', result: 'জয়', bestPlayer: '', trophy: '' });

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

  // Load stored data or seed, ensuring all 8 categories exist
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const merged = {
            ...INITIAL_DATA,
            ...parsed,
            sports: parsed.sports || INITIAL_DATA.sports,
            culture: parsed.culture || INITIAL_DATA.culture,
            achievements: parsed.achievements || INITIAL_DATA.achievements,
            tours: parsed.tours || INITIAL_DATA.tours,
            lab: parsed.lab || INITIAL_DATA.lab,
            multimedia: parsed.multimedia || INITIAL_DATA.multimedia,
            scouts: parsed.scouts || INITIAL_DATA.scouts,
            inter_sports: parsed.inter_sports || INITIAL_DATA.inter_sports
          };

          // Seamlessly migrate lab devices into the 3 distinct register books
          if (merged.lab && Array.isArray(merged.lab.devices)) {
            let devs = merged.lab.devices.map(d => ({
              ...d,
              category: d.category || (
                (d.model && d.model.toLowerCase().includes('laptop')) || (d.name && d.name.includes('ল্যাপটপ')) ? 'ল্যাপটপ' :
                (d.name && d.name.includes('টিভি')) ? 'স্মার্ট টিভি' :
                (d.name && d.name.includes('প্রজেক্টর')) ? 'প্রজেক্টর' :
                (d.name && d.name.includes('প্রিন্টার')) ? 'প্রিন্টার' :
                (d.name && d.name.includes('স্ক্যানার')) ? 'স্ক্যানার' :
                (d.name && (d.name.includes('ইউপিএস') || d.name.includes('আইপিএস'))) ? 'আইপিএস / ইউপিএস' :
                (d.name && d.name.includes('মনিটর')) ? 'মনিটর' :
                (d.name && (d.name.includes('রাউটার') || d.name.includes('সুইচ'))) ? 'নেটওয়ার্ক ইকুইপমেন্ট' :
                'ডেস্কটপ'
              ),
              registerType: d.registerType || (
                d.condition === 'সার্ভিসিং' ? 'repairable' :
                d.condition === 'অকেজো' ? 'scrap' :
                'active'
              )
            }));

            // If existing data lacks repairable or scrap devices, inject seed devices
            const hasRepairable = devs.some(d => d.registerType === 'repairable');
            const hasScrap = devs.some(d => d.registerType === 'scrap');
            if (!hasRepairable || !hasScrap) {
              const seedExtras = INITIAL_DATA.lab.devices.filter(d =>
                (!hasRepairable && d.registerType === 'repairable') ||
                (!hasScrap && d.registerType === 'scrap')
              );
              devs = [...devs, ...seedExtras];
            }
            merged.lab.devices = devs;
          }

          // Seamlessly migrate multimedia module with room profiles, daily execution logs, and teacher projects
          if (merged.multimedia) {
            if (!Array.isArray(merged.multimedia.rooms) || merged.multimedia.rooms.length === 0) {
              merged.multimedia.rooms = INITIAL_DATA.multimedia.rooms;
            }
            if (!Array.isArray(merged.multimedia.schedule) || merged.multimedia.schedule.length === 0) {
              merged.multimedia.schedule = INITIAL_DATA.multimedia.schedule;
            } else {
              merged.multimedia.schedule = merged.multimedia.schedule.map(s => ({
                ...s,
                roomId: s.roomId || (merged.multimedia.rooms[0]?.id || 'mmr-01'),
                roomName: s.roomName || (merged.multimedia.rooms[0]?.name || 'স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)'),
                section: s.section || 'পদ্মা'
              }));
            }
            if (!Array.isArray(merged.multimedia.logs) || merged.multimedia.logs.length === 0) {
              merged.multimedia.logs = INITIAL_DATA.multimedia.logs;
            }
            if (!Array.isArray(merged.multimedia.projects) || merged.multimedia.projects.length === 0) {
              merged.multimedia.projects = INITIAL_DATA.multimedia.projects;
            }
          }

          setData(merged);
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

  // Helper for House points tally with robust normalization
  const calculateHousePoints = () => {
    const tally = {
      'পদ্মা হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#10b981', bg: '#ecfdf5' },
      'মেঘনা হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#3b82f6', bg: '#eff6ff' },
      'যমুনা হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#eab308', bg: '#fefce8' },
      'কর্ণফুলী হাউজ': { points: 0, gold: 0, silver: 0, bronze: 0, color: '#ef4444', bg: '#fef2f2' }
    };

    const normalizeHouse = (h) => {
      if (!h || typeof h !== 'string') return null;
      if (h.includes('পদ্মা')) return 'পদ্মা হাউজ';
      if (h.includes('মেঘনা')) return 'মেঘনা হাউজ';
      if (h.includes('যমুনা')) return 'যমুনা হাউজ';
      if (h.includes('কর্ণফুলী')) return 'কর্ণফুলী হাউজ';
      return null;
    };

    const award = (res, pts, medal) => {
      if (!res) return;
      const hKey = typeof res === 'object' ? normalizeHouse(res.house) : null;
      if (hKey && tally[hKey]) {
        tally[hKey].points = (tally[hKey].points || 0) + pts;
        tally[hKey][medal] = (tally[hKey][medal] || 0) + 1;
      }
    };

    try {
      (data?.sports || []).forEach(evt => {
        if (evt?.result && typeof evt.result === 'object') {
          award(evt.result.first, 5, 'gold');
          award(evt.result.second, 3, 'silver');
          award(evt.result.third, 1, 'bronze');
        }
      });
    } catch (e) {
      console.warn('House points calculation error:', e);
    }

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

  // ---------------- Computer Lab Handlers (3 Distinct Register Books) ----------------
  const handleSaveLabDevice = (e) => {
    e.preventDefault();
    const isEdit = !!labDeviceForm.id;
    const cat = labDeviceForm.category || 'ডেস্কটপ';
    const tagPrefix = cat === 'ল্যাপটপ' ? 'LP' :
                      cat === 'প্রিন্টার' ? 'PRN' :
                      cat === 'স্ক্যানার' ? 'SCN' :
                      cat === 'স্মার্ট টিভি' ? 'TV' :
                      cat === 'প্রজেক্টর' ? 'PRJ' :
                      cat === 'আইপিএস / ইউপিএস' ? 'UPS' :
                      cat === 'মনিটর' ? 'MON' :
                      cat === 'নেটওয়ার্ক ইকুইপমেন্ট' ? 'NET' : 'PC';
    const targetReg = labDeviceForm.registerType || labRegisterBook || 'active';
    const newDev = {
      ...labDeviceForm,
      id: labDeviceForm.id || `dev-${Date.now().toString().slice(-4)}`,
      assetTag: labDeviceForm.assetTag?.trim() || `MP-ICT-${tagPrefix}-${Date.now().toString().slice(-3)}`,
      category: cat,
      registerType: targetReg,
      condition: labDeviceForm.condition || (targetReg === 'repairable' ? 'মেরামত প্রক্রিয়াধীন' : targetReg === 'scrap' ? 'অচল ও বাতিল' : 'সক্রিয়')
    };
    const currentDevices = data.lab?.devices || [];
    const updated = isEdit ? currentDevices.map(d => d.id === newDev.id ? newDev : d) : [...currentDevices, newDev];
    persistData({ ...data, lab: { ...(data.lab || {}), devices: updated } });
    setShowLabDeviceModal(false);
    showNotification(isEdit ? '✓ যন্ত্রপাতির তথ্য সফলভাবে হালনাগাদ করা হয়েছে!' : '✓ নতুন যন্ত্রপাতি সংশ্লিষ্ট রেজিস্টার বুকে নথিভুক্ত হয়েছে!');
  };

  const handleDeleteLabDevice = (id) => {
    if (!window.confirm('যন্ত্রপাতিটি রেজিস্টার বই থেকে স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    const updated = (data.lab?.devices || []).filter(d => d.id !== id);
    persistData({ ...data, lab: { ...(data.lab || {}), devices: updated } });
    showNotification('যন্ত্রপাতিটি রেজিস্টার থেকে অপসারণ করা হয়েছে।');
  };

  // 1-Click Move: Active -> Repairable Register
  const handleInitiateMoveToRepair = (device) => {
    setItemToMove(device);
    setRepairMoveForm({
      defectDetails: device.defectDetails || '',
      sentForRepairDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      serviceCenter: device.serviceCenter || 'জেলা আইসিটি সেল ও টেকনিক্যাল সার্ভিস, টাঙ্গাইল',
      technicianPhone: device.technicianPhone || '',
      estimatedCost: device.estimatedCost || ''
    });
    setShowMoveToRepairModal(true);
  };

  const confirmMoveToRepair = (e) => {
    e.preventDefault();
    if (!itemToMove) return;
    const currentDevices = data.lab?.devices || [];
    const updated = currentDevices.map(d => {
      if (d.id === itemToMove.id) {
        return {
          ...d,
          registerType: 'repairable',
          condition: 'মেরামত প্রক্রিয়াধীন',
          defectDetails: repairMoveForm.defectDetails || 'কারিগরি ত্রুটি চিহ্নিত',
          sentForRepairDate: repairMoveForm.sentForRepairDate,
          serviceCenter: repairMoveForm.serviceCenter,
          technicianPhone: repairMoveForm.technicianPhone,
          estimatedCost: repairMoveForm.estimatedCost
        };
      }
      return d;
    });
    persistData({ ...data, lab: { ...(data.lab || {}), devices: updated } });
    setShowMoveToRepairModal(false);
    setItemToMove(null);
    showNotification(`✓ '${itemToMove.name}' সফলভাবে ২য় (মেরামতযোগ্য স্টক) রেজিস্টার বুকে স্থানান্তর করা হয়েছে!`);
  };

  // 1-Click Restore: Repairable -> Active Register
  const handleRestoreToActive = (device) => {
    if (!window.confirm(`'${device.name}' এর মেরামত কি সম্পন্ন হয়েছে? এটি এখন ১ম (সচল স্টক) রেজিস্টার বুকে ফেরত যাবে।`)) return;
    const currentDevices = data.lab?.devices || [];
    const updated = currentDevices.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          registerType: 'active',
          condition: 'সক্রিয় ও সচল',
          defectDetails: '',
          sentForRepairDate: ''
        };
      }
      return d;
    });
    persistData({ ...data, lab: { ...(data.lab || {}), devices: updated } });
    showNotification(`✓ চমৎকার! '${device.name}' ১ম (সচল স্টক) রেজিস্টার বুকে পুনর্বহাল করা হয়েছে।`);
  };

  // 1-Click Move: Active or Repairable -> Scrap Register
  const handleInitiateMoveToScrap = (device) => {
    setItemToMove(device);
    setScrapMoveForm({
      condemnReason: device.condemnReason || (device.defectDetails ? `${device.defectDetails} (স্থায়ীভাবে মেরামত-অযোগ্য)` : 'যন্ত্রপাতি স্থায়ীভাবে অচল ও মেরামত অযোগ্য'),
      condemnDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      disposalStatus: device.disposalStatus || 'নিলামের জন্য সংরক্ষিত'
    });
    setShowMoveToScrapModal(true);
  };

  const confirmMoveToScrap = (e) => {
    e.preventDefault();
    if (!itemToMove) return;
    const currentDevices = data.lab?.devices || [];
    const updated = currentDevices.map(d => {
      if (d.id === itemToMove.id) {
        return {
          ...d,
          registerType: 'scrap',
          condition: 'অচল ও বাতিল',
          condemnReason: scrapMoveForm.condemnReason || 'স্থায়ীভাবে অচল ও মেরামত অযোগ্য',
          condemnDate: scrapMoveForm.condemnDate,
          disposalStatus: scrapMoveForm.disposalStatus
        };
      }
      return d;
    });
    persistData({ ...data, lab: { ...(data.lab || {}), devices: updated } });
    setShowMoveToScrapModal(false);
    setItemToMove(null);
    showNotification(`✓ '${itemToMove.name}' সফলভাবে ৩য় (অচল ও অমেরামতযোগ্য স্টক) রেজিস্টার বুকে নথিভুক্ত হয়েছে।`);
  };

  // 1-Click Restore: Scrap -> Active Register
  const handleRestoreFromScrapToActive = (device) => {
    if (!window.confirm(`'${device.name}' কে পুনরায় ১ম (সচল স্টক) রেজিস্টার বুকে যুক্ত করতে চান?`)) return;
    const currentDevices = data.lab?.devices || [];
    const updated = currentDevices.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          registerType: 'active',
          condition: 'সক্রিয় ও সচল',
          condemnReason: '',
          condemnDate: ''
        };
      }
      return d;
    });
    persistData({ ...data, lab: { ...(data.lab || {}), devices: updated } });
    showNotification(`✓ '${device.name}' সচল স্টক রেজিস্টার বুকে পুনর্বহাল করা হয়েছে।`);
  };

  // Official Institutional Letterhead Print / PDF Report Generator for Headmaster
  const handlePrintLabOfficialReport = (targetRegister = labRegisterBook) => {
    const allDevs = data.lab?.devices || [];
    const targetDevs = allDevs.filter(d => (d.registerType || 'active') === targetRegister);
    const activeCount = allDevs.filter(d => (d.registerType || 'active') === 'active').length;
    const repairCount = allDevs.filter(d => d.registerType === 'repairable').length;
    const scrapCount = allDevs.filter(d => d.registerType === 'scrap').length;
    const totalCount = allDevs.length;

    const bookTitles = {
      active: {
        title: '১ম বুক: সচল ষ্টক রেজিষ্টার প্রতিবেদন (Active Equipment Register)',
        subject: 'কম্পিউটার ল্যাবের সকল সচল যন্ত্রপাতি ও ডিজিটাল সরঞ্জামাদির অফিশিয়াল স্টক রেজিস্টার বিবরণী পেশ প্রসঙ্গে।',
        badgeColor: '#059669',
        badgeBg: '#ecfdf5'
      },
      repairable: {
        title: '২য় বুক: মেরামতযোগ্য যন্ত্রপাতির ষ্টক রেজিষ্টার বিবরণী (Repairable Equipment Register)',
        subject: 'কম্পিউটার ল্যাবের ত্রুটিযুক্ত ও তাৎক্ষণিক মেরামতযোগ্য যন্ত্রপাতির বিবরণ, প্রাক্কলিত বাজেট ও সুপারিশ পেশ প্রসঙ্গে।',
        badgeColor: '#d97706',
        badgeBg: '#fffbeb'
      },
      scrap: {
        title: '৩য় বুক: অচল ও অমেরামতযোগ্য যন্ত্রপাতির স্থায়ী ষ্টক রেজিষ্টার (Condemned & Scrap Register)',
        subject: 'কম্পিউটার ল্যাবের স্থায়ীভাবে অচল, প্রযুক্তিগতভাবে বাতিল ও নিলামযোগ্য যন্ত্রপাতির চূড়ান্ত কন্ডেমনেশন রেজিস্টার প্রসঙ্গে।',
        badgeColor: '#dc2626',
        badgeBg: '#fef2f2'
      }
    };

    const currentMeta = bookTitles[targetRegister] || bookTitles.active;
    const memoNum = `মপাউবি/আইসিটি-ল্যাব/${targetRegister.toUpperCase()}/২০২৬/${Math.floor(100 + Math.random() * 900)}`;
    const todayBn = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    const w = window.open('', '_blank', 'width=1100,height=850');
    if (!w) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। ব্রাউজারের পপ-আপ অনুমোদন করে পুনরায় চেষ্টা করুন।');
      return;
    }

    const tableRows = targetDevs.map((d, idx) => `
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
            <div style="font-size: 9.5px; color: #0284c7;">সার্ভিস: ${d.serviceCenter || '—'}</div>
          ` : `
            <div style="color: #b91c1c; font-weight: 700; font-size: 10.5px;">🚫 ${d.condemnReason || 'অচল'}</div>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">তারিখ: ${d.condemnDate || '—'}</div>
            <div style="font-size: 9.5px; color: #475569; font-weight: 600;">অবস্থা: ${d.disposalStatus || 'সংরক্ষিত'}</div>
          `}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${currentMeta.title} — মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 15mm 10mm;
          }
          body {
            font-family: 'Segoe UI', 'SutonnyMJ', 'Nikosh', 'SolaimanLipi', sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 16px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .btn-print {
            background: #0f766e;
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header-box {
            text-align: center;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .school-gov {
            font-size: 12px;
            color: #475569;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .school-title {
            margin: 3px 0 2px;
            font-size: 22px;
            color: #0f766e;
            font-weight: 900;
            letter-spacing: 0.3px;
          }
          .school-sub {
            margin: 0 0 4px;
            font-size: 12px;
            color: #334155;
          }
          .lab-title-badge {
            display: inline-block;
            background: ${currentMeta.badgeBg};
            color: ${currentMeta.badgeColor};
            border: 1px solid ${currentMeta.badgeColor};
            padding: 3px 14px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 13px;
            margin-top: 4px;
          }
          .meta-bar {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #1e293b;
            margin-bottom: 10px;
            padding: 6px 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
          }
          .subject-box {
            background: #ffffff;
            border-left: 3px solid #0f766e;
            padding: 6px 10px;
            margin-bottom: 12px;
            font-size: 12px;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 14px;
          }
          th {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 8px;
            font-weight: 800;
            color: #0f172a;
            text-align: left;
          }
          td {
            border: 1px solid #cbd5e1;
          }
          .matrix-summary {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 11.5px;
          }
          .sig-row {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 0 20px;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            min-width: 200px;
            border-top: 1px dashed #64748b;
            padding-top: 6px;
            font-size: 12px;
            line-height: 1.4;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span style="font-weight: 700; color: #0f766e; font-size: 13px;">
            🖨️ কম্পিউটার ল্যাব অফিশিয়াল প্রাতিষ্ঠানিক প্রতিবেদন প্রস্তুত। প্রধান শিক্ষকের স্বাক্ষরের জন্য প্রিন্ট করুন।
          </span>
          <button class="btn-print" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন / Save as PDF</button>
        </div>

        <div class="header-box">
          <div class="school-gov">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত • শিক্ষা ও তথ্য মন্ত্রণালয়</div>
          <h1 class="school-title">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
          <div class="school-sub">পোস্ট: মগড়া, উপজেলা: কালিহাতী / টাঙ্গাইল সদর, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৫৮ • EIIN: 114290 • স্কুল কোড: 4501</div>
          <div style="font-weight: 800; font-size: 13.5px; color: #0f766e; margin-top: 3px;">💻 শেখ রাসেল ডিজিটাল ল্যাব ও কম্পিউটার সেন্টার</div>
          <div class="lab-title-badge">${currentMeta.title}</div>
        </div>

        <div class="meta-bar">
          <div><b>স্মারক নম্বর:</b> ${memoNum}</div>
          <div><b>প্রতিবেদনের তারিখ:</b> ${todayBn} খ্রি.</div>
        </div>

        <div class="subject-box">
          <div><b>বরাবর:</b> প্রধান শিক্ষক, মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, টাঙ্গাইল সদর, টাঙ্গাইল।</div>
          <div style="margin-top: 3px;"><b>বিষয়:</b> <span style="font-weight: 800;">${currentMeta.subject}</span></div>
          <div style="margin-top: 3px; font-size: 11.5px; color: #475569;">
            মহোদয়, আপনার সদয় অবগতি ও প্রয়োজনীয় প্রাতিষ্ঠানিক কার্যক্রমের নিমিত্তে আমাদের বিদ্যালয়ের কম্পিউটার ল্যাব ও আইসিটি সেন্টারের হালনাগাদ সংরক্ষিত তথ্যের ভিত্তিতে প্রস্তুতকৃত বিবরণী ছক নিম্নে পেশ করা হলো:
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">ক্র.</th>
              <th style="width: 95px;">Asset Tag ID</th>
              <th>যন্ত্রপাতির নাম ও মডেল</th>
              <th style="width: 85px;">ক্যাটাগরি</th>
              <th>স্পেসিফিকেশন ও বিবরণ</th>
              <th style="width: 120px;">উৎস ও প্রাপ্তির সাল</th>
              <th style="width: 85px;">অবস্থান</th>
              <th style="width: 140px;">বর্তমান অবস্থা / মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="8" style="text-align: center; padding: 12px; color: #64748b;">এই রেজিস্টার বুকে কোনো তথ্য সংরক্ষিত নেই।</td></tr>'}
          </tbody>
        </table>

        <!-- Summary Matrix Tally -->
        <div class="matrix-summary">
          <div><b>সারসংক্ষেপ ট্যালি:</b> মোট রেজিস্টারভুক্ত যন্ত্রপাতি: <b>${totalCount}</b> টি</div>
          <div style="color: #059669;">🟢 সচল স্টক: <b>${activeCount}</b> টি</div>
          <div style="color: #d97706;">🟡 মেরামতযোগ্য স্টক: <b>${repairCount}</b> টি</div>
          <div style="color: #dc2626;">🔴 অচল ও স্ক্র্যাপ স্টক: <b>${scrapCount}</b> টি</div>
          <div style="margin-left: auto; color: #64748b;">এই পৃষ্ঠায় প্রদর্শিত: <b>${targetDevs.length}</b> টি</div>
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

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    w.document.open();
    w.document.write(htmlContent);
    w.document.close();
  };

  const handleSaveLabSchedule = (e) => {
    e.preventDefault();
    const isEdit = !!labScheduleForm.id;
    const newSch = {
      ...labScheduleForm,
      id: labScheduleForm.id || `ls-${Date.now().toString().slice(-4)}`
    };
    const currentSch = data.lab?.schedule || [];
    const updated = isEdit ? currentSch.map(s => s.id === newSch.id ? newSch : s) : [...currentSch, newSch];
    persistData({ ...data, lab: { ...(data.lab || {}), schedule: updated } });
    setShowLabScheduleModal(false);
    showNotification(isEdit ? '✓ ব্যবহারিক রুটিন আপডেট হয়েছে!' : '✓ নতুন ব্যবহারিক রুটিন যুক্ত হয়েছে!');
  };

  const handleDeleteLabSchedule = (id) => {
    if (!window.confirm('রুটিন এন্ট্রিটি মুছে ফেলবেন?')) return;
    const updated = (data.lab?.schedule || []).filter(s => s.id !== id);
    persistData({ ...data, lab: { ...(data.lab || {}), schedule: updated } });
    showNotification('রুটিন এন্ট্রি মুছে ফেলা হয়েছে।');
  };

  // ---------------- Multimedia Classroom Handlers ----------------
  const handleSaveMmSchedule = (e) => {
    e.preventDefault();
    const isEdit = !!mmScheduleForm.id;
    const roomObj = (data.multimedia?.rooms || []).find(r => r.id === mmScheduleForm.roomId);
    const newSch = {
      ...mmScheduleForm,
      id: mmScheduleForm.id || `ms-${Date.now().toString().slice(-4)}`,
      roomName: roomObj ? roomObj.name : (mmScheduleForm.roomName || 'স্মার্ট ক্লাসরুম ১')
    };
    const currentSch = data.multimedia?.schedule || [];
    const updated = isEdit ? currentSch.map(s => s.id === newSch.id ? newSch : s) : [...currentSch, newSch];
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), schedule: updated } });
    setShowMmScheduleModal(false);
    showNotification(isEdit ? '✓ মাল্টিমিডিয়া ক্লাস রুটিন আপডেট হয়েছে!' : '✓ নতুন ক্লাস রুটিন যুক্ত হয়েছে!');
  };

  const handleDeleteMmSchedule = (id) => {
    if (!window.confirm('এই ক্লাস রুটিনটি মুছে ফেলতে চান?')) return;
    const updated = (data.multimedia?.schedule || []).filter(s => s.id !== id);
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), schedule: updated } });
    showNotification('রুটিন এন্ট্রি মুছে ফেলা হয়েছে।');
  };

  // Daily Class Delivery Log Handlers
  const handleSaveMmLog = (e) => {
    e.preventDefault();
    const isEdit = !!mmLogForm.id;
    const roomObj = (data.multimedia?.rooms || []).find(r => r.id === mmLogForm.roomId);
    const newLog = {
      ...mmLogForm,
      id: mmLogForm.id || `ml-${Date.now().toString().slice(-4)}`,
      roomName: roomObj ? roomObj.name : (mmLogForm.roomName || 'স্মার্ট ক্লাসরুম ১')
    };
    const currentLogs = data.multimedia?.logs || [];
    const updated = isEdit ? currentLogs.map(l => l.id === newLog.id ? newLog : l) : [newLog, ...currentLogs];
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), logs: updated } });
    setShowMmLogModal(false);
    showNotification(isEdit ? '✓ ক্লাস ডেলিভারি লগ আপডেট হয়েছে!' : '✓ নতুন ক্লাস ডেলিভারি লগ সংরক্ষিত হয়েছে!');
  };

  const handleDeleteMmLog = (id) => {
    if (!window.confirm('এই ক্লাস ডেলিভারি রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = (data.multimedia?.logs || []).filter(l => l.id !== id);
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), logs: updated } });
    showNotification('লগ এন্ট্রি মুছে ফেলা হয়েছে।');
  };

  const handleToggleMmLogStatus = (logId) => {
    const currentLogs = data.multimedia?.logs || [];
    const target = currentLogs.find(l => l.id === logId);
    if (!target) return;
    const newStatus = target.status === 'taken' ? 'missed' : 'taken';
    const reason = newStatus === 'missed' ? (prompt('ক্লাস না নেওয়ার কারণ উল্লেখ করুন:', 'শিক্ষক দাপ্তরিক কাজে ব্যস্ত ছিলেন') || 'অনিবার্য কারণে ক্লাস স্থগিত') : '';
    const updated = currentLogs.map(l => l.id === logId ? {
      ...l,
      status: newStatus,
      reasonNotTaken: newStatus === 'missed' ? reason : '',
      remarks: newStatus === 'taken' ? 'ক্লাস সফলভাবে সম্পন্ন' : l.remarks
    } : l);
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), logs: updated } });
    showNotification(newStatus === 'taken' ? '✓ ক্লাস সফল হিসেবে চিহ্নিত করা হয়েছে!' : '⚠️ ক্লাস না নেওয়া হিসেবে চিহ্নিত করা হয়েছে।');
  };

  const handleGenerateTodayLogsFromSchedule = () => {
    const todayBnStr = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    const todayEnDate = new Date().toISOString().split('T')[0];
    const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const currentDayName = daysBn[new Date().getDay()] || 'রবিবার';

    const routines = data.multimedia?.schedule || [];
    const todaysRoutines = routines.filter(r => r.day === currentDayName);

    if (todaysRoutines.length === 0) {
      alert(`আজ (${currentDayName}) এর জন্য মাল্টিমিডিয়া রুটিনে কোনো নির্ধারিত ক্লাস পাওয়া যায়নি। অন্য দিনের রুটিন থেকে তৈরি করতে চাইলে ম্যানুয়াল এন্ট্রি ব্যবহার করুন।`);
      return;
    }

    const existingLogs = data.multimedia?.logs || [];
    const newEntries = todaysRoutines.map((r, idx) => ({
      id: `ml-auto-${Date.now().toString().slice(-4)}-${idx}`,
      date: todayBnStr,
      roomId: r.roomId || 'mmr-01',
      roomName: r.roomName || 'স্মার্ট ক্লাসরুম ১',
      period: r.period,
      class_name: r.class_name,
      section: r.section || 'পদ্মা',
      subject: r.subject,
      teacher: r.teacher,
      status: 'taken',
      topicCovered: r.resource || 'ডিজিটাল পাঠ উপস্থাপন',
      studentsPresent: '৫৫ জন',
      projectorUsed: 'Epson EB-2250U 5000 Lumens Full HD',
      remarks: 'রুটিন অনুযায়ী নির্ধারিত ক্লাস সফলভাবে সম্পন্ন'
    }));

    const combined = [...newEntries, ...existingLogs];
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), logs: combined } });
    showNotification(`✓ আজকের (${currentDayName}) ${newEntries.length} টি ক্লাসের লগবুক শিট প্রস্তুত হয়েছে!`);
  };

  // Teacher Multimedia Projects Handlers
  const handleSaveMmProject = (e) => {
    e.preventDefault();
    const isEdit = !!mmProjectForm.id;
    const newP = {
      ...mmProjectForm,
      id: mmProjectForm.id || `mp-${Date.now().toString().slice(-4)}`
    };
    const currentP = data.multimedia?.projects || [];
    const updated = isEdit ? currentP.map(p => p.id === newP.id ? newP : p) : [newP, ...currentP];
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), projects: updated } });
    setShowMmProjectModal(false);
    showNotification(isEdit ? '✓ শিক্ষকের প্রজেক্ট তথ্য আপডেট হয়েছে!' : '✓ নতুন মাল্টিমিডিয়া প্রজেক্ট যুক্ত হয়েছে!');
  };

  const handleDeleteMmProject = (id) => {
    if (!window.confirm('এই প্রজেক্ট রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = (data.multimedia?.projects || []).filter(p => p.id !== id);
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), projects: updated } });
    showNotification('প্রজেক্ট রেকর্ড মুছে ফেলা হয়েছে।');
  };

  // Smart Room Profile Handlers
  const handleSaveMmRoom = (e) => {
    e.preventDefault();
    const isEdit = !!mmRoomForm.id;
    const newR = {
      ...mmRoomForm,
      id: mmRoomForm.id || `mmr-${Date.now().toString().slice(-4)}`
    };
    const currentR = data.multimedia?.rooms || [];
    const updated = isEdit ? currentR.map(r => r.id === newR.id ? newR : r) : [...currentR, newR];
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), rooms: updated } });
    setShowMmRoomModal(false);
    showNotification(isEdit ? '✓ স্মার্ট ক্লাসরুম তথ্য আপডেট হয়েছে!' : '✓ নতুন স্মার্ট ক্লাসরুম প্রোফাইল যুক্ত হয়েছে!');
  };

  const handleDeleteMmRoom = (id) => {
    if (!window.confirm('এই ক্লাসরুম প্রোফাইলটি মুছে ফেলতে চান?')) return;
    const updated = (data.multimedia?.rooms || []).filter(r => r.id !== id);
    persistData({ ...data, multimedia: { ...(data.multimedia || {}), rooms: updated } });
    showNotification('রুম প্রোফাইল মুছে ফেলা হয়েছে।');
  };

  // Official Institutional Letterhead Print / PDF: Individual Teacher Multimedia Performance Report
  const handlePrintIndividualTeacherReport = (teacherName) => {
    if (!teacherName) {
      alert('অনুগ্রহ করে একজন শিক্ষক নির্বাচন করুন।');
      return;
    }

    const allSchedules = data.multimedia?.schedule || [];
    const teacherSchedules = allSchedules.filter(s => s.teacher === teacherName);

    const allLogs = data.multimedia?.logs || [];
    const teacherLogs = allLogs.filter(l => l.teacher === teacherName);
    const takenLogs = teacherLogs.filter(l => l.status === 'taken');
    const missedLogs = teacherLogs.filter(l => l.status === 'missed');

    const totalLogsCount = teacherLogs.length;
    const takenPercent = totalLogsCount > 0 ? Math.round((takenLogs.length / totalLogsCount) * 100) : 100;

    const allProjects = data.multimedia?.projects || [];
    const teacherProjects = allProjects.filter(p => p.teacher === teacherName);

    const teacherMeta = teachers.find(t => (t.name_bn === teacherName || t.name_en === teacherName)) || {};
    const teacherDesignation = teacherProjects[0]?.teacherDesignation || teacherMeta.designation_bn || 'সহকারী শিক্ষক';

    const memoNum = `মপাউবি/মাল্টিমিডিয়া/শিক্ষক-মূল্যায়ন/২০২৬/${Math.floor(100 + Math.random() * 900)}`;
    const todayBn = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    const w = window.open('', '_blank', 'width=1100,height=850');
    if (!w) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। ব্রাউজারের পপ-আপ অনুমোদন করে পুনরায় চেষ্টা করুন।');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শিক্ষক মাল্টিমিডিয়া মূল্যায়ন প্রতিবেদন — ${teacherName}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }
          body {
            font-family: 'Segoe UI', 'SutonnyMJ', 'Nikosh', 'SolaimanLipi', sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 16px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .btn-print {
            background: #6d28d9;
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header-box {
            text-align: center;
            border-bottom: 2px solid #6d28d9;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .school-gov { font-size: 12px; color: #475569; font-weight: 700; letter-spacing: 0.5px; }
          .school-title { margin: 3px 0 2px; font-size: 22px; color: #5b21b6; font-weight: 900; letter-spacing: 0.3px; }
          .school-sub { font-size: 11.5px; color: #64748b; font-weight: 600; }
          .report-badge {
            display: inline-block;
            background: #ede9fe;
            color: #5b21b6;
            font-size: 13px;
            font-weight: 800;
            padding: 4px 14px;
            border-radius: 20px;
            margin-top: 6px;
            border: 1px solid #c4b5fd;
          }
          .meta-bar {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #475569;
            margin-bottom: 12px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 5px;
          }
          .teacher-profile-card {
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 14px;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 10px;
          }
          .kpi-num { font-size: 16px; font-weight: 900; }
          .section-heading {
            font-size: 13px;
            font-weight: 800;
            color: #4c1d95;
            margin: 14px 0 6px;
            border-left: 4px solid #7c3aed;
            padding-left: 8px;
          }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
          th { background: #f1f5f9; color: #334155; padding: 6px 8px; font-weight: 700; border: 1px solid #cbd5e1; text-align: left; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; }
          .sig-row {
            display: flex;
            justify-content: space-between;
            margin-top: 36px;
            padding-top: 10px;
            page-break-inside: avoid;
          }
          .sig-box { text-align: center; width: 230px; font-size: 11.5px; }
          .sig-line { border-top: 1.5px solid #0f172a; margin-bottom: 5px; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>
            <b>🖨️ শিক্ষক মাল্টিমিডিয়া মূল্যায়ন প্রিন্ট ভিউ</b>
            <span style="color: #64748b; font-size: 12px; margin-left: 10px;">(A4 Portrait ফরম্যাটে সরাসরি প্রিন্ট বা Save as PDF করুন)</span>
          </div>
          <div>
            <button class="btn-print" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন</button>
            <button onclick="window.close()" style="margin-left: 8px; padding: 8px 14px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">বন্ধ করুন</button>
          </div>
        </div>

        <div class="header-box">
          <div class="school-gov">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত • শিক্ষা মন্ত্রণালয়</div>
          <div class="school-title">মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          <div class="school-sub">পোঃ মাগড়া, উপজেলা ও জেলা: টাঙ্গাইল | EIIN: 114290 | বিদ্যালয় কোড: 4501 | স্থাপিত: ১৯১৯ খ্রি.</div>
          <div class="report-badge">🖥️ মাল্টিমিডিয়া ক্লাসরুম: শিক্ষক ব্যক্তিগত পারফরম্যান্স ও ডিজিটাল কন্টেন্ট মূল্যায়ন প্রতিবেদন</div>
        </div>

        <div class="meta-bar">
          <div><b>স্মারক নং:</b> ${memoNum}</div>
          <div><b>প্রতিবেদন তৈরির তারিখ:</b> ${todayBn}</div>
        </div>

        <div class="teacher-profile-card">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #5b21b6;">👨‍🏫 ${teacherName}</div>
            <div style="font-size: 11px; color: #6b21a8; margin-top: 2px;">পদবি: <b>${teacherDesignation}</b></div>
          </div>
          <div style="text-align: center; border-left: 1px solid #e9d5ff;">
            <div style="font-size: 10.5px; color: #64748b;">নির্ধারিত ক্লাস</div>
            <div class="kpi-num" style="color: #4338ca;">${totalLogsCount || teacherSchedules.length} টি</div>
          </div>
          <div style="text-align: center; border-left: 1px solid #e9d5ff;">
            <div style="font-size: 10.5px; color: #64748b;">গৃহীত ক্লাস / হার</div>
            <div class="kpi-num" style="color: #059669;">${takenLogs.length} টি (${takenPercent}%)</div>
          </div>
          <div style="text-align: center; border-left: 1px solid #e9d5ff;">
            <div style="font-size: 10.5px; color: #64748b;">ডিজিটাল প্রজেক্ট</div>
            <div class="kpi-num" style="color: #b45309;">${teacherProjects.length} টি</div>
          </div>
        </div>

        <!-- Routine Section -->
        <div class="section-heading">১. সাপ্তাহিক মাল্টিমিডিয়া ক্লাস রুটিন অনুযায়ী সূচি</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">ক্র.</th>
              <th>বার (Day)</th>
              <th>পিরিয়ড ও সময়</th>
              <th>কক্ষ ও স্মার্ট ডিসপ্লে</th>
              <th>শ্রেণি ও শাখা</th>
              <th>বিষয়</th>
              <th>ডিজিটাল রিসোর্স / টপিক</th>
            </tr>
          </thead>
          <tbody>
            ${teacherSchedules.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; color: #64748b; padding: 10px;">এই শিক্ষকের জন্য কোনো সাপ্তাহিক রুটিন এন্ট্রি পাওয়া যায়নি।</td></tr>
            ` : teacherSchedules.map((s, i) => `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#faf5ff'};">
                <td style="text-align: center; font-weight: 700;">${i + 1}</td>
                <td style="font-weight: 700; color: #6d28d9;">${s.day}</td>
                <td>${s.period}</td>
                <td>${s.roomName || 'স্মার্ট ক্লাসরুম ১'}</td>
                <td><b>${s.class_name}</b> ${s.section ? `(${s.section})` : ''}</td>
                <td style="font-weight: 700;">${s.subject}</td>
                <td style="color: #475569;">${s.resource}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Class Delivery History -->
        <div class="section-heading">২. ক্লাস ডেলিভারি ও এক্সিকিউশন ইতিহাস (কে কে ক্লাস নিয়েছে / নেয়নি)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">ক্র.</th>
              <th>তারিখ</th>
              <th>পিরিয়ড ও কক্ষ</th>
              <th>শ্রেণি ও বিষয়</th>
              <th>উপস্থাপিত বিষয়বস্তু / স্লাইড</th>
              <th>উপস্থিতি</th>
              <th style="text-align: center;">স্ট্যাটাস</th>
              <th>মন্তব্য / ক্লাস না নেওয়ার কারণ</th>
            </tr>
          </thead>
          <tbody>
            ${teacherLogs.length === 0 ? `
              <tr><td colspan="8" style="text-align: center; color: #64748b; padding: 10px;">লগবুকে এখনো এই শিক্ষকের কোনো ক্লাস ডেলিভারি রেকর্ড লিপিবদ্ধ হয়নি।</td></tr>
            ` : teacherLogs.map((l, i) => `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="text-align: center; font-weight: 700;">${i + 1}</td>
                <td style="font-weight: 700; white-space: nowrap;">${l.date}</td>
                <td style="font-size: 10.5px;">${l.period}<br><span style="color: #64748b;">${l.roomName}</span></td>
                <td><b>${l.class_name}</b><br><span style="color: #4338ca;">${l.subject}</span></td>
                <td>${l.topicCovered || '—'}</td>
                <td style="text-align: center;">${l.studentsPresent || '—'}</td>
                <td style="text-align: center;">
                  ${l.status === 'taken' ?
                    '<span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 10px;">✅ সম্পন্ন</span>' :
                    '<span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 10px;">❌ হয়নি</span>'
                  }
                </td>
                <td style="font-size: 10px; color: ${l.status === 'missed' ? '#b91c1c' : '#334155'};">
                  ${l.status === 'missed' ? `<b>কারণ:</b> ${l.reasonNotTaken || 'অনিবার্য কারণ'}` : (l.remarks || 'সফল')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Teacher Multimedia Projects -->
        <div class="section-heading">৩. শিক্ষক কর্তৃক উদ্ভাবিত ও তৈরিকৃত ডিজিটাল প্রজেক্ট ভাণ্ডার</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">ক্র.</th>
              <th>প্রজেক্টের নাম ও শ্রেণি</th>
              <th>বিষয় ও শিখনফল</th>
              <th>প্ল্যাটফর্ম ও সফটওয়্যার</th>
              <th>সম্মাননা / রেটিং</th>
            </tr>
          </thead>
          <tbody>
            ${teacherProjects.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: #64748b; padding: 10px;">এই শিক্ষকের কোনো ডিজিটাল প্রজেক্ট এখনো নথিভুক্ত হয়নি।</td></tr>
            ` : teacherProjects.map((p, i) => `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#faf5ff'};">
                <td style="text-align: center; font-weight: 700;">${i + 1}</td>
                <td>
                  <div style="font-weight: 800; color: #4c1d95;">${p.projectTitle}</div>
                  <div style="font-size: 10px; color: #64748b;">শ্রেণি: ${p.class_name} • তারিখ: ${p.dateCreated || '—'}</div>
                </td>
                <td>
                  <div style="font-weight: 700; color: #0284c7;">${p.subject}</div>
                  <div style="font-size: 10px; color: #334155;">${p.learningOutcomes || 'শিক্ষার্থীরা সক্রিয়ভাবে ধারণা অনুধাবন করবে'}</div>
                </td>
                <td>
                  <div><b>${p.platform}</b></div>
                  <div style="font-size: 10px; color: #64748b;">টুলস: ${p.toolsUsed}</div>
                </td>
                <td style="font-weight: 700; color: #b45309;">${p.ratingOrBadge || '⭐⭐⭐⭐⭐'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Dual Signature Section -->
        <div class="sig-row">
          <div class="sig-box">
            <div class="sig-line"></div>
            <b>মুহাম্মদ আবুবকর সিদ্দিক</b><br>
            সহকারী শিক্ষক (আইসিটি)<br>
            ল্যাব ও মাল্টিমিডিয়া ক্লাসরুম ইনচার্জ<br>
            মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
          </div>
          <div class="sig-box">
            <div style="height: 38px;"></div>
            <div class="sig-line"></div>
            <b>প্রধান শিক্ষক</b><br>
            মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়<br>
            টাঙ্গাইল সদর, টাঙ্গাইল
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    w.document.open();
    w.document.write(htmlContent);
    w.document.close();
  };

  // Master Institutional Report for Headmaster & USEO Inspection
  const handlePrintMasterMultimediaReport = () => {
    const allSchedules = data.multimedia?.schedule || [];
    const allLogs = data.multimedia?.logs || [];
    const allProjects = data.multimedia?.projects || [];
    const allRooms = data.multimedia?.rooms || [];

    const takenCount = allLogs.filter(l => l.status === 'taken').length;
    const missedCount = allLogs.filter(l => l.status === 'missed').length;
    const totalCount = allLogs.length;
    const completionPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

    // Unique teachers in schedules & logs
    const teacherNames = Array.from(new Set([
      ...allSchedules.map(s => s.teacher),
      ...allLogs.map(l => l.teacher),
      ...allProjects.map(p => p.teacher)
    ])).filter(Boolean);

    const teacherMatrix = teacherNames.map(name => {
      const schCount = allSchedules.filter(s => s.teacher === name).length;
      const tLogs = allLogs.filter(l => l.teacher === name);
      const tTaken = tLogs.filter(l => l.status === 'taken').length;
      const tMissed = tLogs.filter(l => l.status === 'missed').length;
      const tProjects = allProjects.filter(p => p.teacher === name).length;
      const rate = tLogs.length > 0 ? Math.round((tTaken / tLogs.length) * 100) : 100;
      return { name, schCount, tTaken, tMissed, tTotal: tLogs.length, rate, tProjects };
    });

    const memoNum = `মপাউবি/মাল্টিমিডিয়া/প্রাতিষ্ঠানিক-পরিদর্শন/২০২৬/${Math.floor(100 + Math.random() * 900)}`;
    const todayBn = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    const w = window.open('', '_blank', 'width=1100,height=850');
    if (!w) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। ব্রাউজারের পপ-আপ অনুমোদন করে পুনরায় চেষ্টা করুন।');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>মাল্টিমিডিয়া ক্লাসরুম মনিটরিং ও সামগ্রিক প্রাতিষ্ঠানিক প্রতিবেদন</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }
          body {
            font-family: 'Segoe UI', 'SutonnyMJ', 'Nikosh', 'SolaimanLipi', sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 16px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            background: #ede9fe;
            border: 1px solid #c4b5fd;
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .btn-print {
            background: #5b21b6;
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
          }
          .header-box {
            text-align: center;
            border-bottom: 2px solid #5b21b6;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .school-gov { font-size: 12px; color: #475569; font-weight: 700; }
          .school-title { margin: 3px 0 2px; font-size: 22px; color: #4c1d95; font-weight: 900; }
          .school-sub { font-size: 11.5px; color: #64748b; }
          .report-badge {
            display: inline-block;
            background: #f3e8ff;
            color: #581c87;
            font-size: 13px;
            font-weight: 800;
            padding: 4px 14px;
            border-radius: 20px;
            margin-top: 6px;
            border: 1px solid #d8b4fe;
          }
          .meta-bar {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #475569;
            margin-bottom: 12px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 5px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .sum-card {
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          }
          .sum-num { font-size: 17px; font-weight: 900; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px; }
          th { background: #f1f5f9; color: #334155; padding: 6px 8px; font-weight: 700; border: 1px solid #cbd5e1; text-align: left; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; }
          .section-heading {
            font-size: 13px;
            font-weight: 800;
            color: #4c1d95;
            margin: 14px 0 6px;
            border-left: 4px solid #7c3aed;
            padding-left: 8px;
          }
          .sig-row {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .sig-box { text-align: center; width: 230px; font-size: 11.5px; }
          .sig-line { border-top: 1.5px solid #0f172a; margin-bottom: 5px; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>
            <b>🖨️ সামগ্রিক প্রাতিষ্ঠানিক মাল্টিমিডিয়া রিপোর্ট</b>
            <span style="color: #64748b; font-size: 12px; margin-left: 10px;">(প্রধান শিক্ষক ও উপজেলা মাধ্যমিক শিক্ষা অফিসার পরিদর্শনের জন্য সংরক্ষিত)</span>
          </div>
          <div>
            <button class="btn-print" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন</button>
            <button onclick="window.close()" style="margin-left: 8px; padding: 8px 14px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">বন্ধ করুন</button>
          </div>
        </div>

        <div class="header-box">
          <div class="school-gov">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত • শিক্ষা মন্ত্রণালয়</div>
          <div class="school-title">মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
          <div class="school-sub">পোঃ মাগড়া, উপজেলা ও জেলা: টাঙ্গাইল | EIIN: 114290 | বিদ্যালয় কোড: 4501 | স্থাপিত: ১৯১৯ খ্রি.</div>
          <div class="report-badge">📊 মাল্টিমিডিয়া ক্লাসরুম মনিটরিং, এক্সিকিউশন ও শিক্ষক পারফরম্যান্স সামগ্রিক প্রতিবেদন</div>
        </div>

        <div class="meta-bar">
          <div><b>স্মারক নং:</b> ${memoNum}</div>
          <div><b>প্রতিবেদন তারিখ:</b> ${todayBn}</div>
        </div>

        <div class="summary-grid">
          <div class="sum-card">
            <div style="font-size: 10.5px; color: #64748b;">সক্রিয় স্মার্ট ক্লাসরুম</div>
            <div class="sum-num" style="color: #7c3aed;">${allRooms.length} টি</div>
          </div>
          <div class="sum-card">
            <div style="font-size: 10.5px; color: #64748b;">সাপ্তাহিক নির্ধারিত ক্লাস</div>
            <div class="sum-num" style="color: #0284c7;">${allSchedules.length} টি</div>
          </div>
          <div class="sum-card">
            <div style="font-size: 10.5px; color: #64748b;">গৃহীত ক্লাস / কমপ্লায়েন্স</div>
            <div class="sum-num" style="color: #059669;">${takenCount} টি (${completionPercent}%)</div>
          </div>
          <div class="sum-card">
            <div style="font-size: 10.5px; color: #64748b;">মোট ডিজিটাল প্রজেক্ট</div>
            <div class="sum-num" style="color: #b45309;">${allProjects.length} টি</div>
          </div>
        </div>

        <!-- Teacher Comparative Table -->
        <div class="section-heading">১. শিক্ষকভিত্তিক মাল্টিমিডিয়া ক্লাস ডেলিভারি ও পারফরম্যান্স বিশ্লেষণ</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">ক্র.</th>
              <th>শিক্ষকের নাম</th>
              <th style="text-align: center;">রুটিন ক্লাস</th>
              <th style="text-align: center;">মোট ডেলিভারি লগ</th>
              <th style="text-align: center; color: #059669;">গৃহীত ক্লাস (Taken)</th>
              <th style="text-align: center; color: #dc2626;">মিসড ক্লাস (Missed)</th>
              <th style="text-align: center;">কমপ্লায়েন্স হার</th>
              <th style="text-align: center;">ডিজিটাল প্রজেক্ট</th>
              <th style="text-align: center;">রেটিং স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${teacherMatrix.map((tm, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#faf5ff'};">
                <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                <td style="font-weight: 800; color: #3b0764;">${tm.name}</td>
                <td style="text-align: center; font-weight: 700;">${tm.schCount} টি</td>
                <td style="text-align: center;">${tm.tTotal} টি</td>
                <td style="text-align: center; font-weight: 800; color: #059669;">${tm.tTaken}</td>
                <td style="text-align: center; font-weight: 800; color: #dc2626;">${tm.tMissed}</td>
                <td style="text-align: center; font-weight: 800; color: ${tm.rate >= 80 ? '#059669' : tm.rate >= 60 ? '#d97706' : '#dc2626'};">
                  ${tm.rate}%
                </td>
                <td style="text-align: center; font-weight: 700; color: #7c3aed;">${tm.tProjects} টি</td>
                <td style="text-align: center; font-size: 10px;">
                  ${tm.rate >= 85 ? '<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 700;">🏆卓越 চমৎকার</span>' :
                    tm.rate >= 70 ? '<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 700;">👍 সন্তোষজনক</span>' :
                    '<span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 700;">⚠️ উন্নতি প্রয়োজন</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Rooms Specification -->
        <div class="section-heading">২. মাল্টিমিডিয়া রুম ও স্মার্ট সরঞ্জামের অবস্থা</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">ক্র.</th>
              <th>কক্ষের নাম ও অবস্থান</th>
              <th>প্রজেক্টর / স্মার্ট ডিসপ্লে</th>
              <th>সাউন্ড সিস্টেম</th>
              <th>বিদ্যুৎ ব্যাকআপ</th>
              <th>ধারণক্ষমতা</th>
              <th>রুম ইনচার্জ</th>
            </tr>
          </thead>
          <tbody>
            ${allRooms.map((rm, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                <td style="font-weight: 800; color: #4338ca;">${rm.name}</td>
                <td>${rm.projector}</td>
                <td>${rm.sound}</td>
                <td>${rm.backup}</td>
                <td>${rm.capacity}</td>
                <td style="color: #047857; font-weight: 700;">${rm.incharge || 'ল্যাব ইনচার্জ'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Dual Signature Section -->
        <div class="sig-row">
          <div class="sig-box">
            <div class="sig-line"></div>
            <b>মুহাম্মদ আবুবকর সিদ্দিক</b><br>
            সহকারী শিক্ষক (আইসিটি)<br>
            ল্যাব ও মাল্টিমিডিয়া ক্লাসরুম ইনচার্জ<br>
            মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
          </div>
          <div class="sig-box">
            <div style="height: 38px;"></div>
            <div class="sig-line"></div>
            <b>প্রধান শিক্ষক</b><br>
            মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়<br>
            টাঙ্গাইল সদর, টাঙ্গাইল
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    w.document.open();
    w.document.write(htmlContent);
    w.document.close();
  };

  // ---------------- Scouts Handlers ----------------
  const handleSaveScoutMember = (e) => {
    e.preventDefault();
    const isEdit = !!scoutMemberForm.id;
    const newM = {
      ...scoutMemberForm,
      id: scoutMemberForm.id || `sc-${Date.now().toString().slice(-4)}`
    };
    const currentM = data.scouts?.members || [];
    const updated = isEdit ? currentM.map(m => m.id === newM.id ? newM : m) : [...currentM, newM];
    persistData({ ...data, scouts: { ...(data.scouts || {}), members: updated } });
    setShowScoutMemberModal(false);
    showNotification(isEdit ? '✓ সদস্য তথ্য আপডেট হয়েছে!' : '✓ নতুন সদস্য সফলভাবে তালিকাভুক্ত হয়েছে!');
  };

  const handleDeleteScoutMember = (id) => {
    if (!window.confirm('এই সদস্যকে তালিকা থেকে বাদ দিতে চান?')) return;
    const updated = (data.scouts?.members || []).filter(m => m.id !== id);
    persistData({ ...data, scouts: { ...(data.scouts || {}), members: updated } });
    showNotification('সদস্য মুছে ফেলা হয়েছে।');
  };

  const handleSaveScoutEvent = (e) => {
    e.preventDefault();
    const isEdit = !!scoutEventForm.id;
    const newEv = {
      ...scoutEventForm,
      id: scoutEventForm.id || `se-${Date.now().toString().slice(-4)}`
    };
    const currentEv = data.scouts?.events || [];
    const updated = isEdit ? currentEv.map(e => e.id === newEv.id ? newEv : e) : [...currentEv, newEv];
    persistData({ ...data, scouts: { ...(data.scouts || {}), events: updated } });
    setShowScoutEventModal(false);
    showNotification(isEdit ? '✓ ক্যাম্পোরি/ইভেন্ট আপডেট হয়েছে!' : '✓ নতুন স্কাউট সমাবেশ রেকর্ড যুক্ত হয়েছে!');
  };

  const handleDeleteScoutEvent = (id) => {
    if (!window.confirm('এই ইভেন্ট রেকর্ড মুছে ফেলতে চান?')) return;
    const updated = (data.scouts?.events || []).filter(e => e.id !== id);
    persistData({ ...data, scouts: { ...(data.scouts || {}), events: updated } });
    showNotification('ইভেন্ট মুছে ফেলা হয়েছে।');
  };

  // ---------------- Inter-School Sports Handlers ----------------
  const handleSaveTeam = (e) => {
    e.preventDefault();
    const isEdit = !!teamForm.id;
    const newTeam = {
      ...teamForm,
      id: teamForm.id || `team-${Date.now().toString().slice(-4)}`,
      squad: teamForm.squad || []
    };
    const currentTeams = data.inter_sports?.teams || [];
    const updated = isEdit ? currentTeams.map(t => t.id === newTeam.id ? newTeam : t) : [...currentTeams, newTeam];
    persistData({ ...data, inter_sports: { ...(data.inter_sports || {}), teams: updated } });
    setShowTeamModal(false);
    showNotification(isEdit ? '✓ স্কোয়াড তথ্য আপডেট হয়েছে!' : '✓ নতুন ক্রীড়া দল তৈরি হয়েছে!');
  };

  const handleDeleteTeam = (id) => {
    if (!window.confirm('এই দলটি মুছে ফেলতে চান?')) return;
    const updated = (data.inter_sports?.teams || []).filter(t => t.id !== id);
    persistData({ ...data, inter_sports: { ...(data.inter_sports || {}), teams: updated } });
    showNotification('দল মুছে ফেলা হয়েছে।');
  };

  const handleSaveMatch = (e) => {
    e.preventDefault();
    const isEdit = !!matchForm.id;
    const newMatch = {
      ...matchForm,
      id: matchForm.id || `im-${Date.now().toString().slice(-4)}`
    };
    const currentMatches = data.inter_sports?.matches || [];
    const updated = isEdit ? currentMatches.map(m => m.id === newMatch.id ? newMatch : m) : [...currentMatches, newMatch];
    persistData({ ...data, inter_sports: { ...(data.inter_sports || {}), matches: updated } });
    setShowMatchModal(false);
    showNotification(isEdit ? '✓ ম্যাচের ফলাফল আপডেট হয়েছে!' : '✓ নতুন ম্যাচের ফলাফল সংরক্ষণ করা হয়েছে!');
  };

  const handleDeleteMatch = (id) => {
    if (!window.confirm('এই ম্যাচের রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = (data.inter_sports?.matches || []).filter(m => m.id !== id);
    persistData({ ...data, inter_sports: { ...(data.inter_sports || {}), matches: updated } });
    showNotification('ম্যাচ রেকর্ড মুছে ফেলা হয়েছে।');
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
          🏆 গৌরবময় অর্জন ও পুরস্কার ({data.achievements?.length || 0} টি)
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
          🚌 শিক্ষা সফর ও ভ্রমণ ({data.tours?.length || 0} টি)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lab')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'lab' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'lab' ? 'linear-gradient(135deg, #0f766e, #14b8a6)' : '#ffffff',
            color: activeTab === 'lab' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'lab' ? '0 4px 10px rgba(20,184,166,0.3)' : 'none'
          }}
        >
          💻 কম্পিউটার ল্যাব ({data.lab?.devices?.length || 0} টি ডিভাইস)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('multimedia')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'multimedia' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'multimedia' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#ffffff',
            color: activeTab === 'multimedia' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'multimedia' ? '0 4px 10px rgba(139,92,246,0.3)' : 'none'
          }}
        >
          🖥️ মাল্টিমিডিয়া ক্লাস ({data.multimedia?.schedule?.length || 0} টি রুটিন)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scouts')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'scouts' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'scouts' ? 'linear-gradient(135deg, #854d0e, #ca8a04)' : '#ffffff',
            color: activeTab === 'scouts' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'scouts' ? '0 4px 10px rgba(202,138,4,0.3)' : 'none'
          }}
        >
          ⚜️ স্কাউট ও গার্লস গাইড ({data.scouts?.members?.length || 0} জন)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inter_sports')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'inter_sports' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'inter_sports' ? 'linear-gradient(135deg, #be123c, #f43f5e)' : '#ffffff',
            color: activeTab === 'inter_sports' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: activeTab === 'inter_sports' ? '0 4px 10px rgba(244,63,94,0.3)' : 'none'
          }}
        >
          ⚽ আন্তঃবিদ্যালয় ক্রীড়া ({data.inter_sports?.teams?.length || 0} টি দল)
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
      {/* 5. COMPUTER LAB TAB (কম্পিউটার ল্যাব) */}
      {/* ========================================================================= */}
      {activeTab === 'lab' && (() => {
        const allDevs = data.lab?.devices || [];
        const activeDevs = allDevs.filter(d => (d.registerType || 'active') === 'active');
        const repairDevs = allDevs.filter(d => d.registerType === 'repairable');
        const scrapDevs = allDevs.filter(d => d.registerType === 'scrap');

        // Target devices for currently selected register book
        const currentBookDevs = labRegisterBook === 'repairable' ? repairDevs :
                                labRegisterBook === 'scrap' ? scrapDevs : activeDevs;

        // Apply Category and Search filters
        const filteredDevs = currentBookDevs.filter(d => {
          if (labCategoryFilter !== 'all' && d.category !== labCategoryFilter) return false;
          if (labSearchQuery.trim()) {
            const q = labSearchQuery.toLowerCase();
            return (d.name && d.name.toLowerCase().includes(q)) ||
                   (d.assetTag && d.assetTag.toLowerCase().includes(q)) ||
                   (d.model && d.model.toLowerCase().includes(q)) ||
                   (d.desk && d.desk.toLowerCase().includes(q)) ||
                   (d.category && d.category.toLowerCase().includes(q));
          }
          return true;
        });

        // Category Matrix calculation across all devices
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

        return (
          <div>
            {/* Lab Overview & Quick Action Header */}
            <div style={{
              background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 70%, #115e59 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '20px 22px',
              marginBottom: '18px',
              boxShadow: '0 8px 24px rgba(15, 118, 110, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                  <span>🏛️</span> শেখ রাসেল ডিজিটাল ল্যাব ও আইসিটি ইনোভেশন সেন্টার
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 900, letterSpacing: '0.2px' }}>
                  💻 কম্পিউটার ল্যাব ইকুইপমেন্ট ও ডিজিটাল স্টক রেজিস্টার
                </h3>
                <div style={{ fontSize: '13px', opacity: 0.95, display: 'flex', flexWrap: 'wrap', gap: '16px', lineHeight: '1.4' }}>
                  <span>👤 <b>আইসিটি শিক্ষক ও ইনচার্জ:</b> {data.lab?.inCharge || 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক)'}</span>
                  <span>🛠️ <b>ল্যাব সহকারী:</b> {data.lab?.assistant || 'মোঃ মামুন মিয়া'}</span>
                  <span>📍 <b>অবস্থান:</b> {data.lab?.room || 'পূর্ব ভবন (কক্ষ নং ২০৪)'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLabDeviceForm({
                      id: '',
                      assetTag: '',
                      name: '',
                      category: 'ডেস্কটপ',
                      model: '',
                      cpu: '',
                      ram: '',
                      storage: '',
                      source: 'শেখ রাসেল ডিজিটাল ল্যাব (সরকারি অনুদান)',
                      procurementYear: '২০২১',
                      condition: 'সক্রিয়',
                      ip: '',
                      desk: '',
                      registerType: 'active'
                    });
                    setShowLabDeviceModal(true);
                  }}
                  style={{
                    padding: '9px 16px',
                    background: '#ffffff',
                    color: '#0f766e',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>➕</span> নতুন সচল যন্ত্রপাতি যোগ
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintLabOfficialReport(labRegisterBook)}
                  style={{
                    padding: '9px 16px',
                    background: '#fef08a',
                    color: '#854d0e',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🖨️</span> প্রধান শিক্ষকের অফিশিয়াল রিপোর্ট প্রিন্ট (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLabScheduleForm({
                      id: '',
                      day: 'রবিবার',
                      period: '৩য় পিরিয়ড (১১:০০-১১:৪৫)',
                      class_name: '১০ম শ্রেণি',
                      subject: 'তথ্য ও যোগাযোগ প্রযুক্তি (ব্যবহারিক)',
                      teacher: 'মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)',
                      topic: ''
                    });
                    setShowLabScheduleModal(true);
                  }}
                  style={{
                    padding: '9px 14px',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>🗓️</span> ব্যবহারিক রুটিন যোগ
                </button>
              </div>
            </div>

            {/* Category Summary Matrix Tally Cards */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📊</span> ক্যাটাগরিভিত্তিক লাইভ স্টক সামারি ম্যাট্রিক্স (Category Equipment Tally)
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  যেকোনো ক্যাটাগরিতে ক্লিক করে দ্রুত ফিল্টার করুন
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                {catStats.map(c => {
                  const isSelected = labCategoryFilter === c.category;
                  return (
                    <div
                      key={c.category}
                      onClick={() => setLabCategoryFilter(isSelected ? 'all' : c.category)}
                      style={{
                        background: isSelected ? '#f0fdfa' : '#ffffff',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 10px rgba(13,148,136,0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#0f766e' : '#1e293b' }}>
                          {c.category}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f766e' }}>
                          {c.total}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '10px', fontWeight: 700 }}>
                        <span style={{ color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>
                          সচল: {c.active}
                        </span>
                        {c.repair > 0 && (
                          <span style={{ color: '#d97706', background: '#fffbeb', padding: '1px 5px', borderRadius: '4px' }}>
                            মেরামত: {c.repair}
                          </span>
                        )}
                        {c.scrap > 0 && (
                          <span style={{ color: '#dc2626', background: '#fef2f2', padding: '1px 5px', borderRadius: '4px' }}>
                            অচল: {c.scrap}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* The 3 Main Register Book Switcher Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {/* 1st Book: Active Stock Register */}
              <div
                onClick={() => { setLabRegisterBook('active'); }}
                style={{
                  background: labRegisterBook === 'active' ? '#ecfdf5' : '#ffffff',
                  border: labRegisterBook === 'active' ? '2.5px solid #059669' : '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: labRegisterBook === 'active' ? '0 4px 14px rgba(5, 150, 105, 0.15)' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🟢</span> ১ম বুক: সচল ষ্টক রেজিষ্টার
                  </div>
                  <span style={{ background: '#059669', color: '#ffffff', padding: '2px 9px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                    {activeDevs.length} টি
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#047857', lineHeight: '1.4' }}>
                  ল্যাপটপ, ডেস্কটপ, প্রিন্টার, স্মার্ট টিভি, প্রজেক্টর, আইপিএস সহ সকল সক্রিয় যন্ত্রপাতি।
                </div>
              </div>

              {/* 2nd Book: Repairable Stock Register */}
              <div
                onClick={() => { setLabRegisterBook('repairable'); }}
                style={{
                  background: labRegisterBook === 'repairable' ? '#fffbeb' : '#ffffff',
                  border: labRegisterBook === 'repairable' ? '2.5px solid #d97706' : '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: labRegisterBook === 'repairable' ? '0 4px 14px rgba(217, 119, 6, 0.15)' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🟡</span> ২য় বুক: মেরামতযোগ্য ষ্টক রেজিষ্টার
                  </div>
                  <span style={{ background: '#d97706', color: '#ffffff', padding: '2px 9px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                    {repairDevs.length} টি
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#b45309', lineHeight: '1.4' }}>
                  চিহ্নিত ত্রুটি, মেরামতে প্রেরণের তারিখ, সার্ভিস সেন্টার ও বাজেট হিসাবযুক্ত যন্ত্রপাতি।
                </div>
              </div>

              {/* 3rd Book: Condemned / Scrap Stock Register */}
              <div
                onClick={() => { setLabRegisterBook('scrap'); }}
                style={{
                  background: labRegisterBook === 'scrap' ? '#fef2f2' : '#ffffff',
                  border: labRegisterBook === 'scrap' ? '2.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: labRegisterBook === 'scrap' ? '0 4px 14px rgba(220, 38, 38, 0.15)' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔴</span> ৩য় বুক: অচল/অমেরামতযোগ্য ষ্টক
                  </div>
                  <span style={{ background: '#dc2626', color: '#ffffff', padding: '2px 9px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                    {scrapDevs.length} টি
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#b91c1c', lineHeight: '1.4' }}>
                  স্থায়ীভাবে অচল ও বাতিলকৃত যন্ত্রপাতি। কারণ, তারিখ ও নিলাম/স্ক্র্যাপ স্ট্যাটাস সহ হিসাব।
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>ফিল্টার করুন:</span>
                <select
                  value={labCategoryFilter}
                  onChange={e => setLabCategoryFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff', fontWeight: 600 }}
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
                  placeholder="Asset Tag, নাম, মডেল বা অবস্থান খুঁজুন..."
                  value={labSearchQuery}
                  onChange={e => setLabSearchQuery(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', minWidth: '220px', background: '#ffffff' }}
                />

                {(labCategoryFilter !== 'all' || labSearchQuery) && (
                  <button
                    type="button"
                    onClick={() => { setLabCategoryFilter('all'); setLabSearchQuery(''); }}
                    style={{ padding: '5px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer', color: '#475569' }}
                  >
                    ✕ ফিল্টার রিসেট
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  মোট ফলাফল: <b>{filteredDevs.length}</b> টি যন্ত্রপাতি
                </span>
                <button
                  type="button"
                  onClick={() => handlePrintLabOfficialReport(labRegisterBook)}
                  style={{
                    padding: '5px 12px',
                    background: '#ffffff',
                    border: '1px solid #0f766e',
                    color: '#0f766e',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🖨️</span> এই তালিকার রিপোর্ট
                </button>
              </div>
            </div>

            {/* Devices Cards Grid according to active Register Book */}
            <div style={{ marginBottom: '24px' }}>
              {filteredDevs.length === 0 ? (
                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                  <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#334155', marginBottom: '4px' }}>
                    এই রেজিস্টার বুকে কোনো যন্ত্রপাতি পাওয়া যায়নি
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    {labRegisterBook === 'active' ? 'উপরে "➕ নতুন সচল যন্ত্রপাতি যোগ" বোতামে ক্লিক করে নতুন যন্ত্রপাতি অন্তর্ভুক্ত করুন।' :
                     labRegisterBook === 'repairable' ? '১ম (সচল স্টক) বুক থেকে যেকোনো ডিভাইসে "🛠️ মেরামত প্রয়োজন" বোতামে ক্লিক করলে সেটি এখানে স্থানান্তরিত হবে।' :
                     '১ম বা ২য় বুক থেকে যেকোনো ডিভাইসে "❌ অচল ঘোষণা" বোতামে ক্লিক করলে সেটি এই স্থায়ী কন্ডেমনেশন রেজিস্টারে নথিভুক্ত হবে।'}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                  {filteredDevs.map(dev => (
                    <div
                      key={dev.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: labRegisterBook === 'repairable' ? '5px solid #d97706' :
                                    labRegisterBook === 'scrap' ? '5px solid #dc2626' : '5px solid #059669',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        transition: 'transform 0.15s, box-shadow 0.15s'
                      }}
                    >
                      <div>
                        {/* Top Badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', background: '#0f172a', color: '#38bdf8', padding: '2px 7px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.3px', fontFamily: 'monospace' }}>
                              🏷️ {dev.assetTag || 'MP-ICT'}
                            </span>
                            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                              {dev.category || 'অন্যান্য'}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            background: labRegisterBook === 'repairable' ? '#fffbeb' : labRegisterBook === 'scrap' ? '#fef2f2' : '#ecfdf5',
                            color: labRegisterBook === 'repairable' ? '#b45309' : labRegisterBook === 'scrap' ? '#b91c1c' : '#047857',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            border: `1px solid ${labRegisterBook === 'repairable' ? '#fde68a' : labRegisterBook === 'scrap' ? '#fecaca' : '#a7f3d0'}`
                          }}>
                            ● {dev.condition || (labRegisterBook === 'repairable' ? 'মেরামত প্রক্রিয়াধীন' : labRegisterBook === 'scrap' ? 'অচল' : 'সক্রিয়')}
                          </span>
                        </div>

                        {/* Title & Model */}
                        <div style={{ fontWeight: 900, fontSize: '14.5px', color: '#0f172a', marginBottom: '3px' }}>
                          {dev.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                          {dev.model || 'মডেল স্পেসিফিকেশন'}
                        </div>

                        {/* Hardware Specifications */}
                        <div style={{ fontSize: '11.5px', color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', lineHeight: '1.5', marginBottom: '10px' }}>
                          {dev.cpu && <div><b>প্রসেসর/ক্যাপাসিটি:</b> {dev.cpu}</div>}
                          {(dev.ram || dev.storage) && <div><b>মেমরি ও স্টোরেজ:</b> {dev.ram || '—'} • {dev.storage || '—'}</div>}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#475569' }}>
                            <span><b>অবস্থান:</b> {dev.desk || 'ল্যাব'}</span>
                            {dev.ip && dev.ip !== 'N/A' && <span>IP: <code style={{ color: '#0284c7' }}>{dev.ip}</code></span>}
                          </div>
                          {dev.source && (
                            <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                              <b>উৎস:</b> {dev.source} {dev.procurementYear ? `(${dev.procurementYear})` : ''}
                            </div>
                          )}
                        </div>

                        {/* Highlight Box for Repairable Register */}
                        {labRegisterBook === 'repairable' && (
                          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px', fontSize: '11.5px' }}>
                            <div style={{ color: '#92400e', fontWeight: 800, marginBottom: '3px' }}>
                              ⚠️ চিহ্নিত ত্রুটি: {dev.defectDetails || 'কারিগরি সমস্যা'}
                            </div>
                            <div style={{ color: '#78350f', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div>📅 <b>প্রেরণের তারিখ:</b> {dev.sentForRepairDate || '—'}</div>
                              <div>🏢 <b>সার্ভিস সেন্টার:</b> {dev.serviceCenter || 'জেলা আইসিটি সেল'} {dev.technicianPhone ? `(${dev.technicianPhone})` : ''}</div>
                              <div>💰 <b>আনুমানিক খরচ:</b> {dev.estimatedCost || 'বাজেট চূড়ান্ত হয়নি'}</div>
                            </div>
                          </div>
                        )}

                        {/* Highlight Box for Scrap Register */}
                        {labRegisterBook === 'scrap' && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px', fontSize: '11.5px' }}>
                            <div style={{ color: '#991b1b', fontWeight: 800, marginBottom: '3px' }}>
                              🚫 অচল ঘোষণার কারণ: {dev.condemnReason || 'স্থায়ীভাবে অচল ও মেরামত অযোগ্য'}
                            </div>
                            <div style={{ color: '#7f1d1d', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div>📅 <b>অচল ঘোষণার তারিখ:</b> {dev.condemnDate || '—'}</div>
                              <div>🏷️ <b>নিষ্পত্তি অবস্থা:</b> {dev.disposalStatus || 'নিলামের জন্য সংরক্ষিত'}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Toolbar with 1-Click Transitions */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px' }}>
                        {/* 1. If currently in Active Register */}
                        {labRegisterBook === 'active' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleInitiateMoveToRepair(dev)}
                                title="১-ক্লিকে ২য় (মেরামতযোগ্য স্টক) রেজিস্টারে পাঠান"
                                style={{
                                  padding: '5px 10px',
                                  background: '#fffbeb',
                                  border: '1px solid #f59e0b',
                                  color: '#b45309',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>🛠️</span> মেরামত প্রয়োজন
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitiateMoveToScrap(dev)}
                                title="১-ক্লিকে ৩য় (অচল ও স্ক্র্যাপ) রেজিস্টারে পাঠান"
                                style={{
                                  padding: '5px 8px',
                                  background: '#fef2f2',
                                  border: '1px solid #fca5a5',
                                  color: '#b91c1c',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <span>❌</span> অচল ঘোষণা
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => { setLabDeviceForm(dev); setShowLabDeviceModal(true); }}
                                style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                ✏️ এডিট
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLabDevice(dev.id)}
                                style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. If currently in Repairable Register */}
                        {labRegisterBook === 'repairable' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleRestoreToActive(dev)}
                                title="মেরামত সম্পন্ন! ১-ক্লিকে ১ম (সচল স্টক) বুকে ফেরত নিন"
                                style={{
                                  padding: '5px 12px',
                                  background: '#059669',
                                  border: 'none',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
                                }}
                              >
                                <span>✅</span> মেরামত সম্পন্ন (সচল বুকে ফেরত)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitiateMoveToScrap(dev)}
                                title="মেরামত সম্ভব নয়, ৩য় (অচল ও স্ক্র্যাপ) বুকে স্থানান্তর"
                                style={{
                                  padding: '5px 8px',
                                  background: '#fef2f2',
                                  border: '1px solid #fca5a5',
                                  color: '#b91c1c',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <span>❌</span> অচল ঘোষণা
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => { setLabDeviceForm(dev); setShowLabDeviceModal(true); }}
                                style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLabDevice(dev.id)}
                                style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. If currently in Scrap Register */}
                        {labRegisterBook === 'scrap' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleRestoreFromScrapToActive(dev)}
                                title="পুনরায় পরীক্ষা করে সচল তালিকায় পুনর্বহাল"
                                style={{
                                  padding: '5px 10px',
                                  background: '#f0fdf4',
                                  border: '1px solid #16a34a',
                                  color: '#15803d',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>♻️</span> সচল বিবেচনা
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => { setLabDeviceForm(dev); setShowLabDeviceModal(true); }}
                                style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                ✏️ এডিট
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLabDevice(dev.id)}
                                style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                🗑️ অপসারণ
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Practical Timetable */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 800 }}>
                🗓️ সাপ্তাহিক ল্যাব ব্যবহারিক ক্লাসের সময়সূচি
              </h4>
              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                      <th style={{ padding: '10px 12px' }}>বার (Day)</th>
                      <th style={{ padding: '10px 12px' }}>পিরিয়ড ও সময়</th>
                      <th style={{ padding: '10px 12px' }}>শ্রেণি ও বিষয়</th>
                      <th style={{ padding: '10px 12px' }}>ব্যবহারিক বিষয়বস্তু (Topic)</th>
                      <th style={{ padding: '10px 12px' }}>শিক্ষক</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.lab?.schedule || []).map((sch, idx) => (
                      <tr key={sch.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f766e' }}>{sch.day}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{sch.period}</td>
                        <td style={{ padding: '10px 12px' }}><b>{sch.class_name}</b> — {sch.subject}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{sch.topic}</td>
                        <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 600 }}>{sch.teacher}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button type="button" onClick={() => { setLabScheduleForm(sch); setShowLabScheduleModal(true); }} style={{ padding: '3px 6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                          <button type="button" onClick={() => handleDeleteLabSchedule(sch.id)} style={{ padding: '3px 6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 6. MULTIMEDIA CLASS TAB (মাল্টিমিডিয়া ক্লাস) */}
      {/* ========================================================================= */}
      {activeTab === 'multimedia' && (() => {
        const rooms = data.multimedia?.rooms || [];
        const schedules = data.multimedia?.schedule || [];
        const logs = data.multimedia?.logs || [];
        const projects = data.multimedia?.projects || [];

        // KPI Calculations
        const totalRooms = rooms.length;
        const totalRoutines = schedules.length;
        const totalLogs = logs.length;
        const takenLogs = logs.filter(l => l.status === 'taken').length;
        const missedLogs = logs.filter(l => l.status === 'missed').length;
        const complianceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;
        const totalProjects = projects.length;

        // Unique teacher names across module
        const allTeacherNames = Array.from(new Set([
          ...schedules.map(s => s.teacher),
          ...logs.map(l => l.teacher),
          ...projects.map(p => p.teacher),
          ...teachers.map(t => t.name_bn || t.name_en)
        ])).filter(Boolean);

        // Filtered Schedules
        const filteredSchedules = schedules.filter(s => {
          if (mmRoomFilter !== 'all' && s.roomId !== mmRoomFilter) return false;
          if (mmTeacherFilter !== 'all' && s.teacher !== mmTeacherFilter) return false;
          if (mmSearchQuery.trim()) {
            const q = mmSearchQuery.toLowerCase();
            return (s.subject && s.subject.toLowerCase().includes(q)) ||
                   (s.teacher && s.teacher.toLowerCase().includes(q)) ||
                   (s.class_name && s.class_name.toLowerCase().includes(q)) ||
                   (s.roomName && s.roomName.toLowerCase().includes(q)) ||
                   (s.resource && s.resource.toLowerCase().includes(q));
          }
          return true;
        });

        // Filtered Logs
        const filteredLogs = logs.filter(l => {
          if (mmLogStatusFilter !== 'all' && l.status !== mmLogStatusFilter) return false;
          if (mmRoomFilter !== 'all' && l.roomId !== mmRoomFilter) return false;
          if (mmTeacherFilter !== 'all' && l.teacher !== mmTeacherFilter) return false;
          if (mmSearchQuery.trim()) {
            const q = mmSearchQuery.toLowerCase();
            return (l.subject && l.subject.toLowerCase().includes(q)) ||
                   (l.teacher && l.teacher.toLowerCase().includes(q)) ||
                   (l.class_name && l.class_name.toLowerCase().includes(q)) ||
                   (l.date && l.date.includes(q)) ||
                   (l.topicCovered && l.topicCovered.toLowerCase().includes(q)) ||
                   (l.reasonNotTaken && l.reasonNotTaken.toLowerCase().includes(q));
          }
          return true;
        });

        // Grouped Teacher Profiles for Portfolio
        const teacherProfiles = allTeacherNames.map(name => {
          const tSchedules = schedules.filter(s => s.teacher === name);
          const tLogs = logs.filter(l => l.teacher === name);
          const tTaken = tLogs.filter(l => l.status === 'taken').length;
          const tMissed = tLogs.filter(l => l.status === 'missed').length;
          const tRate = tLogs.length > 0 ? Math.round((tTaken / tLogs.length) * 100) : (tSchedules.length > 0 ? 100 : 0);
          const tProjects = projects.filter(p => p.teacher === name);
          const tMeta = teachers.find(t => (t.name_bn === name || t.name_en === name)) || {};
          const designation = tProjects[0]?.teacherDesignation || tMeta.designation_bn || 'সহকারী শিক্ষক';
          return { name, designation, schedules: tSchedules, logs: tLogs, taken: tTaken, missed: tMissed, rate: tRate, projects: tProjects };
        }).filter(tp => {
          if (mmTeacherFilter !== 'all' && tp.name !== mmTeacherFilter) return false;
          if (mmSearchQuery.trim()) {
            const q = mmSearchQuery.toLowerCase();
            return tp.name.toLowerCase().includes(q) || tp.designation.toLowerCase().includes(q);
          }
          return true;
        });

        return (
          <div>
            {/* Header Gradient Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '22px 24px',
              marginBottom: '20px',
              boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '26px' }}>🖥️</span>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '0.3px', color: '#ffffff' }}>
                      মাল্টিমিডিয়া ক্লাসরুম ও ডিজিটাল স্মার্ট লার্নিং হাব
                    </h3>
                  </div>
                  <div style={{ fontSize: '13px', color: '#c7d2fe', lineHeight: '1.5' }}>
                    মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • স্মার্ট রুটিন, দৈনিক ক্লাস ট্র্যাকার (কে নিয়েছে/নেয়নি) ও শিক্ষক প্রজেক্ট পোর্টফোলিও
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginTop: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span>👨‍🏫</span>
                    <b>ল্যাব ও মাল্টিমিডিয়া ইনচার্জ:</b> মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক, আইসিটি)
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handlePrintMasterMultimediaReport}
                    style={{
                      padding: '9px 16px',
                      background: '#ffffff',
                      color: '#312e81',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span>🖨️</span> প্রধান শিক্ষকের সামগ্রিক পরিদর্শন রিপোর্ট (PDF)
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateTodayLogsFromSchedule}
                    style={{
                      padding: '9px 16px',
                      background: 'rgba(255,255,255,0.18)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.4)',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚡</span> আজকের লগ শিট প্রস্তুত করুন
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMmScheduleForm({
                        id: '',
                        roomId: rooms[0]?.id || 'mmr-01',
                        roomName: rooms[0]?.name || 'স্মার্ট ক্লাসরুম ১',
                        day: 'রবিবার',
                        period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)',
                        class_name: '১০ম শ্রেণি',
                        section: 'পদ্মা',
                        subject: '',
                        teacher: teachers[0]?.name_bn || '',
                        resource: ''
                      });
                      setShowMmScheduleModal(true);
                    }}
                    style={{
                      padding: '9px 16px',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>➕</span> নতুন ক্লাস রুটিন
                  </button>
                </div>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '5px solid #4338ca', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>🏛️ সক্রিয় স্মার্ট ক্লাসরুম</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#312e81', marginTop: '4px' }}>{totalRooms} টি রুম</div>
                <div style={{ fontSize: '11px', color: '#4338ca', marginTop: '2px' }}>প্রজেক্টর ও সাউন্ড ইকুইপড</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '5px solid #0284c7', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>📅 সাপ্তাহিক নির্ধারিত ক্লাস</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0369a1', marginTop: '4px' }}>{totalRoutines} টি ক্লাস</div>
                <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>সপ্তাহের ৫ কর্মদিবসে রুটিনভুক্ত</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '5px solid #059669', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>✅ ক্লাস ডেলিভারি কমপ্লায়েন্স</span>
                  <span style={{ background: complianceRate >= 80 ? '#dcfce7' : '#fee2e2', color: complianceRate >= 80 ? '#15803d' : '#b91c1c', fontSize: '11px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                    {complianceRate}%
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#065f46', marginTop: '4px' }}>{takenLogs} টি সম্পন্ন</div>
                <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                  {missedLogs > 0 ? `⚠️ ${missedLogs} টি ক্লাস নেওয়া হয়নি / স্থগিত` : 'সব নির্ধারিত ক্লাস সম্পন্ন'}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '5px solid #d97706', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>📁 শিক্ষকদের ডিজিটাল প্রজেক্ট</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>{totalProjects} টি প্রজেক্ট</div>
                <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px' }}>শিক্ষক বাতায়ন ও উদ্ভাবনী কন্টেন্ট</div>
              </div>
            </div>

            {/* 4 Pillars Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMmSubTab('routine')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: mmSubTab === 'routine' ? '2px solid #4338ca' : '1px solid #cbd5e1',
                  background: mmSubTab === 'routine' ? '#eef2ff' : '#ffffff',
                  color: mmSubTab === 'routine' ? '#312e81' : '#475569',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🗓️</span> ১ম বিভাগ: রুমভিত্তিক ক্লাস রুটিন ({totalRoutines})
              </button>

              <button
                type="button"
                onClick={() => setMmSubTab('logs')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: mmSubTab === 'logs' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: mmSubTab === 'logs' ? '#ecfdf5' : '#ffffff',
                  color: mmSubTab === 'logs' ? '#065f46' : '#475569',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📋</span> ২য় বিভাগ: দৈনিক ক্লাস লগ ও উপস্থিতি (কে নিয়েছে / নেয়নি) ({totalLogs})
              </button>

              <button
                type="button"
                onClick={() => setMmSubTab('projects')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: mmSubTab === 'projects' ? '2px solid #b45309' : '1px solid #cbd5e1',
                  background: mmSubTab === 'projects' ? '#fffbeb' : '#ffffff',
                  color: mmSubTab === 'projects' ? '#78350f' : '#475569',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🧑‍🏫</span> ৩য় বিভাগ: শিক্ষকভিত্তিক প্রজেক্ট ও পারফরম্যান্স পোর্টফোলিও ({teacherProfiles.length})
              </button>

              <button
                type="button"
                onClick={() => setMmSubTab('rooms')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: mmSubTab === 'rooms' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: mmSubTab === 'rooms' ? '#faf5ff' : '#ffffff',
                  color: mmSubTab === 'rooms' ? '#5b21b6' : '#475569',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏛️</span> ৪র্থ বিভাগ: স্মার্ট রুম প্রোফাইল ও সরঞ্জাম ({totalRooms})
              </button>
            </div>

            {/* Global Filter & Search Toolbar */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Room Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>কক্ষ:</span>
                  <select
                    value={mmRoomFilter}
                    onChange={e => setMmRoomFilter(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                  >
                    <option value="all">সব স্মার্ট রুম</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Teacher Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>শিক্ষক:</span>
                  <select
                    value={mmTeacherFilter}
                    onChange={e => setMmTeacherFilter(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                  >
                    <option value="all">সব শিক্ষক</option>
                    {allTeacherNames.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter for Logs Tab */}
                {mmSubTab === 'logs' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>স্ট্যাটাস:</span>
                    <select
                      value={mmLogStatusFilter}
                      onChange={e => setMmLogStatusFilter(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700 }}
                    >
                      <option value="all">সব রেকর্ড</option>
                      <option value="taken">✅ সম্পন্ন ক্লাস ({takenLogs})</option>
                      <option value="missed">❌ ক্লাস হয়নি / স্থগিত ({missedLogs})</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  value={mmSearchQuery}
                  onChange={e => setMmSearchQuery(e.target.value)}
                  placeholder="বিষয়, শিক্ষক, শ্রেণি বা টপিক দিয়ে খুঁজুন..."
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: '220px' }}
                />
                {mmSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMmSearchQuery('')}
                    style={{ padding: '5px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* ================================================================= */}
            {/* PILLAR 1: ROOM-BASED CLASS ROUTINE (রুমভিত্তিক ক্লাস রুটিন) */}
            {/* ================================================================= */}
            {mmSubTab === 'routine' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#1e1b4b', fontWeight: 800 }}>
                      🗓️ সাপ্তাহিক মাল্টিমিডিয়া ক্লাস রুটিন ({filteredSchedules.length} টি ক্লাস প্রদর্শিত)
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      রুম ও বিষয়ভিত্তিক প্রজেক্টর প্রেজেন্টেশন ও ডিজিটাল কনটেন্ট ক্লাস সূচি
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMmScheduleForm({
                        id: '',
                        roomId: mmRoomFilter !== 'all' ? mmRoomFilter : (rooms[0]?.id || 'mmr-01'),
                        roomName: rooms.find(r => r.id === mmRoomFilter)?.name || (rooms[0]?.name || 'স্মার্ট ক্লাসরুম ১'),
                        day: 'রবিবার',
                        period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)',
                        class_name: '১০ম শ্রেণি',
                        section: 'পদ্মা',
                        subject: '',
                        teacher: teachers[0]?.name_bn || '',
                        resource: ''
                      });
                      setShowMmScheduleModal(true);
                    }}
                    style={{ padding: '7px 14px', background: '#4338ca', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    ➕ এই রুমে নতুন ক্লাস যোগ করুন
                  </button>
                </div>

                {filteredSchedules.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '30px', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>কোনো ক্লাস রুটিন খুঁজে পাওয়া যায়নি</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>ফিল্টার পরিবর্তন করুন অথবা নতুন ক্লাস রুটিন এন্ট্রি করুন।</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                          <th style={{ padding: '10px 12px' }}>বার (Day)</th>
                          <th style={{ padding: '10px 12px' }}>পিরিয়ড ও সময়</th>
                          <th style={{ padding: '10px 12px' }}>স্মার্ট ক্লাসরুম</th>
                          <th style={{ padding: '10px 12px' }}>শ্রেণি ও শাখা</th>
                          <th style={{ padding: '10px 12px' }}>বিষয়</th>
                          <th style={{ padding: '10px 12px' }}>ডিজিটাল রিসোর্স / ৩ডি বিষয়বস্তু</th>
                          <th style={{ padding: '10px 12px' }}>নির্ধারিত শিক্ষক</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSchedules.map((sch, idx) => (
                          <tr key={sch.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#faf5ff' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 800, color: '#4338ca' }}>{sch.day}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>{sch.period}</td>
                            <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                              <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                🏛️ {sch.roomName}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <b>{sch.class_name}</b> {sch.section && <span style={{ color: '#0369a1' }}>({sch.section})</span>}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{sch.subject}</td>
                            <td style={{ padding: '10px 12px', color: '#334155' }}>
                              <span style={{ color: '#7c3aed' }}>✨</span> {sch.resource}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#047857', fontWeight: 700 }}>
                              👨‍🏫 {sch.teacher}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => { setMmScheduleForm(sch); setShowMmScheduleModal(true); }}
                                style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', marginRight: '4px', cursor: 'pointer' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMmSchedule(sch.id)}
                                style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* PILLAR 2: DAILY CLASS DELIVERY LOGBOOK (কে নিয়েছে / নেয়নি) */}
            {/* ================================================================= */}
            {mmSubTab === 'logs' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#065f46', fontWeight: 800 }}>
                      📋 দৈনিক ক্লাস ডেলিভারি ও এক্সিকিউশন লগ ({filteredLogs.length} টি রেকর্ড)
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      কে কে রুটিন অনুযায়ী ক্লাস নিয়েছে এবং কে কে ক্লাস নেয়নি তার লাইভ রেকর্ড ও ট্র্যাকিং
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleGenerateTodayLogsFromSchedule}
                      style={{ padding: '7px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      ⚡ আজকের রুটিন সিঙ্ক
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMmLogForm({
                          id: '',
                          date: new Date().toISOString().split('T')[0],
                          roomId: rooms[0]?.id || 'mmr-01',
                          roomName: rooms[0]?.name || 'স্মার্ট ক্লাসরুম ১',
                          period: '১ম পিরিয়ড (০৯:৩০-১০:১৫)',
                          class_name: '১০ম শ্রেণি',
                          section: 'পদ্মা',
                          subject: '',
                          teacher: teachers[0]?.name_bn || '',
                          status: 'taken',
                          topicCovered: '',
                          studentsPresent: '৫৫ জন',
                          projectorUsed: 'Epson EB-2250U 5000 Lumens Full HD',
                          reasonNotTaken: '',
                          remarks: ''
                        });
                        setShowMmLogModal(true);
                      }}
                      style={{ padding: '7px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      ➕ নতুন ক্লাস ডেলিভারি এন্ট্রি
                    </button>
                  </div>
                </div>

                {filteredLogs.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '30px', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>কোনো ডেলিভারি রেকর্ড পাওয়া যায়নি</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>উপরে "⚡ আজকের রুটিন সিঙ্ক" অথবা "➕ নতুন ক্লাস ডেলিভারি এন্ট্রি" বোতামে ক্লিক করুন।</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                          <th style={{ padding: '10px 12px' }}>তারিখ</th>
                          <th style={{ padding: '10px 12px' }}>পিরিয়ড ও কক্ষ</th>
                          <th style={{ padding: '10px 12px' }}>শ্রেণি ও বিষয়</th>
                          <th style={{ padding: '10px 12px' }}>বিষয় শিক্ষক</th>
                          <th style={{ padding: '10px 12px' }}>উপস্থাপিত ডিজিটাল কন্টেন্ট / বিষয়</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>ক্লাস স্ট্যাটাস (টগল)</th>
                          <th style={{ padding: '10px 12px' }}>মন্তব্য / না নেওয়ার কারণ</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log, idx) => (
                          <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: log.status === 'taken' ? '#ffffff' : '#fff5f5' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 800, whiteSpace: 'nowrap' }}>{log.date}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: 700, color: '#334155' }}>{log.period}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{log.roomName}</div>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <b>{log.class_name}</b> {log.section && <span style={{ color: '#0369a1' }}>({log.section})</span>}
                              <div style={{ fontWeight: 700, color: '#4338ca', fontSize: '12px' }}>{log.subject}</div>
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                              👨‍🏫 {log.teacher}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#334155', maxWidth: '220px' }}>
                              {log.status === 'taken' ? (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.topicCovered || 'ডিজিটাল পাঠ উপস্থাপন'}</div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>উপস্থিতি: {log.studentsPresent || '—'}</div>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>ক্লাস পরিচালিত হয়নি</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleMmLogStatus(log.id)}
                                title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  border: log.status === 'taken' ? '1px solid #16a34a' : '1px solid #dc2626',
                                  background: log.status === 'taken' ? '#dcfce7' : '#fee2e2',
                                  color: log.status === 'taken' ? '#15803d' : '#b91c1c',
                                  fontWeight: 800,
                                  fontSize: '11.5px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {log.status === 'taken' ? '✅ ক্লাস সম্পন্ন' : '❌ ক্লাস হয়নি'}
                              </button>
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11.5px' }}>
                              {log.status === 'missed' ? (
                                <div style={{ color: '#b91c1c', fontWeight: 700 }}>
                                  ⚠️ {log.reasonNotTaken || 'অনিবার্য কারণে ক্লাস স্থগিত'}
                                </div>
                              ) : (
                                <div style={{ color: '#047857' }}>{log.remarks || 'সফল পাঠদান'}</div>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => { setMmLogForm(log); setShowMmLogModal(true); }}
                                style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', marginRight: '4px', cursor: 'pointer' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMmLog(log.id)}
                                style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* PILLAR 3: TEACHER MULTIMEDIA PROJECTS & PERFORMANCE PORTFOLIO */}
            {/* ================================================================= */}
            {mmSubTab === 'projects' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15.5px', color: '#78350f', fontWeight: 800 }}>
                      🧑‍🏫 শিক্ষকভিত্তিক মাল্টিমিডিয়া প্রজেক্ট ও পারফরম্যান্স পোর্টফোলিও
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      প্রতিজন শিক্ষকের স্বতন্ত্র ক্লাস হিসাব, কমপ্লায়েন্স রেট, তৈরিকৃত ডিজিটাল প্রজেক্ট ও একক মূল্যায়ন রিপোর্ট
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMmProjectForm({
                        id: '',
                        teacher: teachers[0]?.name_bn || '',
                        teacherDesignation: 'সহকারী শিক্ষক',
                        projectTitle: '',
                        subject: '',
                        class_name: '১০ম শ্রেণি',
                        platform: 'শিক্ষক বাতায়ন',
                        contentUrl: '',
                        toolsUsed: 'MS PowerPoint, Canva, Camtasia',
                        dateCreated: new Date().toISOString().split('T')[0],
                        learningOutcomes: '',
                        ratingOrBadge: '⭐⭐⭐⭐⭐ (৫★ রেটিং)'
                      });
                      setShowMmProjectModal(true);
                    }}
                    style={{ padding: '8px 16px', background: '#b45309', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>➕</span> নতুন শিক্ষক প্রজেক্ট যোগ করুন
                  </button>
                </div>

                {teacherProfiles.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '30px', marginBottom: '8px' }}>👨‍🏫</div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>কোনো শিক্ষকের প্রোফাইল পাওয়া যায়নি</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                    {teacherProfiles.map((tp, idx) => (
                      <div
                        key={tp.name || idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          borderTop: tp.rate >= 80 ? '4px solid #059669' : tp.rate >= 60 ? '4px solid #d97706' : '4px solid #dc2626'
                        }}
                      >
                        <div>
                          {/* Teacher Header Card */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <div style={{ fontSize: '15.5px', fontWeight: 900, color: '#1e1b4b' }}>
                                👨‍🏫 {tp.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                {tp.designation}
                              </div>
                            </div>
                            <span style={{
                              background: tp.rate >= 80 ? '#dcfce7' : tp.rate >= 60 ? '#fef3c7' : '#fee2e2',
                              color: tp.rate >= 80 ? '#15803d' : tp.rate >= 60 ? '#b45309' : '#b91c1c',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {tp.rate}% কমপ্লায়েন্স
                            </span>
                          </div>

                          {/* Stats Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '12px', textAlign: 'center' }}>
                            <div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>রুটিন ক্লাস</div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#4338ca' }}>{tp.schedules.length} টি</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>গৃহীত / মিসড</div>
                              <div style={{ fontSize: '15px', fontWeight: 800 }}>
                                <span style={{ color: '#059669' }}>{tp.taken}</span> / <span style={{ color: '#dc2626' }}>{tp.missed}</span>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>ডিজিটাল প্রজেক্ট</div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#b45309' }}>{tp.projects.length} টি</div>
                            </div>
                          </div>

                          {/* Projects List */}
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                              📁 তৈরিকৃত ডিজিটাল প্রজেক্ট ও কন্টেন্ট ({tp.projects.length} টি):
                            </div>
                            {tp.projects.length === 0 ? (
                              <div style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                                এখনো কোনো প্রজেক্ট এন্ট্রি করা হয়নি।
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {tp.projects.map(proj => (
                                  <div key={proj.id} style={{ background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '6px', padding: '8px 10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: '10.5px', background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                        {proj.platform}
                                      </span>
                                      <span style={{ fontSize: '10.5px', color: '#b45309', fontWeight: 700 }}>{proj.ratingOrBadge}</span>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a', margin: '4px 0 2px' }}>
                                      {proj.projectTitle}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                      {proj.subject} ({proj.class_name}) • টুলস: {proj.toolsUsed}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                                      <button
                                        type="button"
                                        onClick={() => { setMmProjectForm(proj); setShowMmProjectModal(true); }}
                                        style={{ padding: '2px 6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMmProject(proj.id)}
                                        style={{ padding: '2px 6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Teacher Card Footer Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setMmProjectForm({
                                id: '',
                                teacher: tp.name,
                                teacherDesignation: tp.designation,
                                projectTitle: '',
                                subject: '',
                                class_name: '১০ম শ্রেণি',
                                platform: 'শিক্ষক বাতায়ন',
                                contentUrl: '',
                                toolsUsed: 'PowerPoint 365, Canva Pro',
                                dateCreated: new Date().toISOString().split('T')[0],
                                learningOutcomes: '',
                                ratingOrBadge: '⭐⭐⭐⭐⭐ (৫★ রেটিং)'
                              });
                              setShowMmProjectModal(true);
                            }}
                            style={{ flex: 1, padding: '7px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}
                          >
                            ➕ প্রজেক্ট যোগ
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintIndividualTeacherReport(tp.name)}
                            style={{ flex: 1, padding: '7px 10px', background: '#6d28d9', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <span>🖨️</span> একক রিপোর্ট (PDF)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* PILLAR 4: SMART ROOM PROFILES & EQUIPMENT SPECIFICATIONS */}
            {/* ================================================================= */}
            {mmSubTab === 'rooms' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15.5px', color: '#5b21b6', fontWeight: 800 }}>
                      🏛️ মাল্টিমিডিয়া স্মার্ট ক্লাসরুম প্রোফাইল ও আধুনিক সরঞ্জামাদির বিবরণ
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      কক্ষভিত্তিক ইন্টারেক্টিভ ডিসপ্লে, প্রজেক্টর, সাউন্ড সিস্টেম ও সেন্ট্রাল পাওয়ার ব্যাকআপ পরিকাঠামো
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMmRoomForm({
                        id: '',
                        name: '',
                        projector: 'Epson 4K Laser Ultra HD',
                        sound: 'Yamaha Dolby Audio System',
                        backup: 'সেন্ট্রাল IPS ও জেনারেটর ব্যাকআপ',
                        capacity: '৬৫ জন শিক্ষার্থী',
                        status: 'সক্রিয়',
                        incharge: 'মুহাম্মদ আবুবকর সিদ্দিক (ল্যাব ইনচার্জ)'
                      });
                      setShowMmRoomModal(true);
                    }}
                    style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>➕</span> নতুন স্মার্ট রুম প্রোফাইল যোগ
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                  {rooms.map(rm => (
                    <div key={rm.id} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', color: '#5b21b6', fontWeight: 800 }}>{rm.name}</h4>
                          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>● {rm.status}</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#4c1d95', lineHeight: '1.8' }}>
                          <div>📽️ <b>প্রজেক্টর / স্মার্ট ডিসপ্লে:</b> {rm.projector}</div>
                          <div>🔊 <b>সাউন্ড সিস্টেম:</b> {rm.sound}</div>
                          <div>⚡ <b>বিদ্যুৎ ব্যাকআপ:</b> {rm.backup}</div>
                          <div>👥 <b>শিক্ষার্থী ধারণক্ষমতা:</b> {rm.capacity}</div>
                          <div style={{ color: '#047857', fontWeight: 700, marginTop: '4px' }}>👨‍🏫 <b>রুম ইনচার্জ:</b> {rm.incharge || 'মুহাম্মদ আবুবকর সিদ্দিক'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', borderTop: '1px solid #ede9fe', paddingTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => { setMmRoomForm(rm); setShowMmRoomModal(true); }}
                          style={{ padding: '4px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          ✏️ এডিট
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMmRoom(rm.id)}
                          style={{ padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          🗑️ মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 7. SCOUTS & GIRLS GUIDE TAB (স্কাউট ও গার্লস গাইড) */}
      {/* ========================================================================= */}
      {activeTab === 'scouts' && (
        <div>
          {/* Troop Overview Card */}
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#854d0e', fontWeight: 800 }}>
                ⚜️ {data.scouts?.troopInfo?.troopNo}
              </h3>
              <div style={{ fontSize: '12px', color: '#713f12', display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <span><b>ইউনিট লিডার:</b> {data.scouts?.troopInfo?.leader}</span>
                <span><b>গাইড ক্যাপটেন:</b> {data.scouts?.troopInfo?.girlsGuideLeader}</span>
                <span><b>কাব লিডার:</b> {data.scouts?.troopInfo?.cubLeader}</span>
                <span><b>নিবন্ধন নং:</b> {data.scouts?.troopInfo?.charterNo}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setScoutMemberForm({ id: '', name: '', class_name: '১০ম', roll_no: '', unit: 'স্কাউট দল', patrol: 'টাইগার প্যাট্রোল', rank: 'সাধারণ সদস্য', badge: 'স্ট্যান্ডার্ড ব্যাজ', phone: '', bloodGroup: 'B+' });
                  setShowScoutMemberModal(true);
                }}
                style={{ padding: '8px 14px', background: '#854d0e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span>➕</span> নতুন স্কাউট/গাইড সদস্য যোগ
              </button>
              <button
                type="button"
                onClick={() => {
                  setScoutEventForm({ id: '', title: '', date: '', venue: '', leader: teachers[0]?.name_bn || '', participants: '২৪ জন', award: '' });
                  setShowScoutEventModal(true);
                }}
                style={{ padding: '8px 14px', background: '#b45309', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span>🏕️</span> ক্যাম্পোরি/সমাবেশ যোগ
              </button>
            </div>
          </div>

          {/* Members Roster Table */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 800 }}>
              📋 সক্রিয় স্কাউট, গার্লস গাইড ও কাব সদস্য রেজিস্টার ({data.scouts?.members?.length || 0} জন)
            </h4>
            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                    <th style={{ padding: '10px 12px' }}>নাম ও রোল</th>
                    <th style={{ padding: '10px 12px' }}>ইউনিট</th>
                    <th style={{ padding: '10px 12px' }}>টহলদল (Patrol)</th>
                    <th style={{ padding: '10px 12px' }}>পদবি (Rank)</th>
                    <th style={{ padding: '10px 12px' }}>অর্জিত ব্যাজ</th>
                    <th style={{ padding: '10px 12px' }}>রক্তের গ্রুপ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.scouts?.members || []).map((m, idx) => (
                    <tr key={m.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <b>{m.name}</b><br/>
                        <small style={{ color: '#64748b' }}>{m.class_name} শ্রেণি, রোল {m.roll_no}</small>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', background: m.unit === 'গার্লস গাইড' ? '#fdf2f8' : m.unit === 'কাব স্কাউট' ? '#fefce8' : '#eff6ff', color: m.unit === 'গার্লস গাইড' ? '#be185d' : m.unit === 'কাব স্কাউট' ? '#854d0e' : '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {m.unit}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{m.patrol}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{m.rank}</td>
                      <td style={{ padding: '10px 12px', color: '#854d0e' }}>🎖️ {m.badge}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#dc2626' }}>{m.bloodGroup}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button type="button" onClick={() => { setScoutMemberForm(m); setShowScoutMemberModal(true); }} style={{ padding: '3px 6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                        <button type="button" onClick={() => handleDeleteScoutMember(m.id)} style={{ padding: '3px 6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Camporees & Parades */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 800 }}>
              🏕️ ক্যাম্পোরি, সমাবেশ ও কুচকাওয়াজ রেকর্ড
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {(data.scouts?.events || []).map(ev => (
                <div key={ev.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', background: '#fefce8', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>📅 {ev.date}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>📍 {ev.venue}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>{ev.title}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>দলনেতা: {ev.leader} • অংশগ্রহণ: {ev.participants}</div>
                    {ev.award && (
                      <div style={{ marginTop: '6px', fontSize: '12px', background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {ev.award}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <button type="button" onClick={() => { setScoutEventForm(ev); setShowScoutEventModal(true); }} style={{ padding: '3px 6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>✏️</button>
                    <button type="button" onClick={() => handleDeleteScoutEvent(ev.id)} style={{ padding: '3px 6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. INTER-SCHOOL SPORTS TAB (আন্তঃবিদ্যালয় ক্রীড়া) */}
      {/* ========================================================================= */}
      {activeTab === 'inter_sports' && (
        <div>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#9f1239', fontWeight: 800 }}>
              ⚽ আন্তঃবিদ্যালয় টুর্নামেন্ট স্কোয়াড ও ফলাফল রেজিস্টার
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setTeamForm({ id: '', name: '', sport: 'ফুটবল', coach: teachers[0]?.name_bn || '', captain: '', squad: [] });
                  setShowTeamModal(true);
                }}
                style={{ padding: '8px 14px', background: '#be123c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span>➕</span> নতুন দল/স্কোয়াড তৈরি
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatchForm({ id: '', tournament: '', sport: 'ফুটবল', opponent: '', date: '', venue: '', result: 'জয়', bestPlayer: '', trophy: '' });
                  setShowMatchModal(true);
                }}
                style={{ padding: '8px 14px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span>🏆</span> নতুন ম্যাচের ফলাফল যোগ
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            {(data.inter_sports?.teams || []).map(team => (
              <div key={team.id} style={{ background: '#ffffff', border: '1px solid #fecdd3', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(190,18,60,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#ffe4e6', color: '#9f1239', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{team.sport}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => { setTeamForm(team); setShowTeamModal(true); }} style={{ padding: '2px 6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>✏️</button>
                    <button type="button" onClick={() => handleDeleteTeam(team.id)} style={{ padding: '2px 6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#881337', fontWeight: 800 }}>{team.name}</h4>
                <div style={{ fontSize: '12px', color: '#4c0519', lineHeight: '1.5', marginBottom: '10px' }}>
                  <div>👨‍🏫 <b>কোচ/গাইড:</b> {team.coach}</div>
                  <div>⭐ <b>অধিনায়ক:</b> {team.captain}</div>
                </div>

                <div style={{ background: '#fff1f2', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                  <b style={{ color: '#9f1239' }}>স্কোয়াড সদস্য ({team.squad?.length || 0} জন):</b>
                  <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(team.squad || []).map((p, i) => (
                      <span key={i} style={{ background: '#ffffff', border: '1px solid #fda4af', padding: '1px 6px', borderRadius: '4px', color: '#881337' }}>
                        {p.name} ({p.pos})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Match Results Table */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 800 }}>
              🏆 সাম্প্রতিক ম্যাচের ফলাফল ও ট্রফি রেজিস্টার
            </h4>
            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                    <th style={{ padding: '10px 12px' }}>টুর্নামেন্ট ও খেলা</th>
                    <th style={{ padding: '10px 12px' }}>প্রতিপক্ষ দল</th>
                    <th style={{ padding: '10px 12px' }}>তারিখ ও স্থান</th>
                    <th style={{ padding: '10px 12px' }}>ফলাফল</th>
                    <th style={{ padding: '10px 12px' }}>সেরা খেলোয়াড় ও ট্রফি</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.inter_sports?.matches || []).map((m, idx) => (
                    <tr key={m.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <b>{m.tournament}</b><br/>
                        <small style={{ color: '#be123c' }}>{m.sport}</small>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.opponent}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{m.date} ({m.venue})</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', background: m.result.includes('জয়') ? '#dcfce7' : '#fee2e2', color: m.result.includes('জয়') ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                          {m.result}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>⭐ {m.bestPlayer}</div>
                        {m.trophy && <div style={{ color: '#d97706', fontSize: '11.5px', fontWeight: 700 }}>{m.trophy}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button type="button" onClick={() => { setMatchForm(m); setShowMatchModal(true); }} style={{ padding: '3px 6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                        <button type="button" onClick={() => handleDeleteMatch(m.id)} style={{ padding: '3px 6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* ========================================================================= */}
      {/* LAB DEVICE MODAL (COMPREHENSIVE ASSET ENTRY) */}
      {/* ========================================================================= */}
      {showLabDeviceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowLabDeviceModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '560px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f766e', fontWeight: 800 }}>
                💻 {labDeviceForm.id ? 'যন্ত্রপাতির তথ্য সম্পাদনা' : 'নতুন যন্ত্রপাতি রেজিস্টারভুক্তি'}
              </h3>
              <button type="button" onClick={() => setShowLabDeviceModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveLabDevice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>যন্ত্রপাতির নাম *</label>
                  <input type="text" required value={labDeviceForm.name || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, name: e.target.value })} placeholder="যেমন: শিক্ষার্থী ওয়ার্কস্টেশন ০৭" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ক্যাটাগরি *</label>
                  <select value={labDeviceForm.category || 'ডেস্কটপ'} onChange={e => setLabDeviceForm({ ...labDeviceForm, category: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
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
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Asset Tag ID</label>
                  <input type="text" value={labDeviceForm.assetTag || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, assetTag: e.target.value })} placeholder="যেমন: MP-ICT-PC-07 (খালি রাখলে স্বয়ংক্রিয় তৈরি হবে)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রেজিস্টার বুক নির্বাচন</label>
                  <select value={labDeviceForm.registerType || labRegisterBook || 'active'} onChange={e => setLabDeviceForm({ ...labDeviceForm, registerType: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}>
                    <option value="active">🟢 ১ম বুক: সচল ষ্টক রেজিষ্টার</option>
                    <option value="repairable">🟡 ২য় বুক: মেরামতযোগ্য ষ্টক রেজিষ্টার</option>
                    <option value="scrap">🔴 ৩য় বুক: অচল/অমেরামতযোগ্য ষ্টক রেজিষ্টার</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>মডেল ও ব্র্যান্ড</label>
                  <input type="text" value={labDeviceForm.model || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, model: e.target.value })} placeholder="যেমন: Dell OptiPlex 3080 Micro" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ল্যাবে ডেস্ক / অবস্থান</label>
                  <input type="text" value={labDeviceForm.desk || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, desk: e.target.value })} placeholder="যেমন: সারি-১, ডেস্ক-০৭" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>প্রসেসর / ক্যাপাসিটি</label>
                  <input type="text" value={labDeviceForm.cpu || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, cpu: e.target.value })} placeholder="যেমন: Intel Core i5 10th Gen" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>RAM ও Storage</label>
                  <input type="text" value={labDeviceForm.ram || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, ram: e.target.value })} placeholder="যেমন: 8 GB DDR4 • 256 GB SSD" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অর্থায়ন / প্রাপ্তির উৎস</label>
                  <input type="text" value={labDeviceForm.source || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, source: e.target.value })} placeholder="যেমন: শেখ রাসেল ডিজিটাল ল্যাব (সরকারি)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>প্রাপ্তির সাল</label>
                  <input type="text" value={labDeviceForm.procurementYear || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, procurementYear: e.target.value })} placeholder="যেমন: ২০২১" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>IP অ্যাড্রেস (প্রযোজ্য হলে)</label>
                  <input type="text" value={labDeviceForm.ip || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, ip: e.target.value })} placeholder="যেমন: 192.168.1.18" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বর্তমান অবস্থা / স্ট্যাটাস</label>
                  <input type="text" value={labDeviceForm.condition || ''} onChange={e => setLabDeviceForm({ ...labDeviceForm, condition: e.target.value })} placeholder="যেমন: সক্রিয় ও নিখুঁত" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button type="button" onClick={() => setShowLabDeviceModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK MOVE TO REPAIRABLE REGISTER MODAL */}
      {/* ========================================================================= */}
      {showMoveToRepairModal && itemToMove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMoveToRepairModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #fde68a', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', color: '#b45309', fontWeight: 900 }}>
                  🛠️ মেরামতযোগ্য তালিকায় স্থানান্তর
                </h3>
                <div style={{ fontSize: '12px', color: '#78350f', marginTop: '2px' }}>
                  ডিভাইস: <b>{itemToMove.name}</b> ({itemToMove.assetTag})
                </div>
              </div>
              <button type="button" onClick={() => setShowMoveToRepairModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={confirmMoveToRepair} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#92400e' }}>
                  চিহ্নিত ত্রুটি বা সমস্যার সুনির্দিষ্ট বিবরণ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={repairMoveForm.defectDetails}
                  onChange={e => setRepairMoveForm({ ...repairMoveForm, defectDetails: e.target.value })}
                  placeholder="যেমন: পাওয়ার অন হচ্ছে না, ডিসপ্লেতে ব্ল্যাঙ্ক বা কীবোর্ড কি-স্ট্রোক ত্রুটি..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>মেরামতে প্রেরণের তারিখ</label>
                  <input
                    type="text"
                    value={repairMoveForm.sentForRepairDate}
                    onChange={e => setRepairMoveForm({ ...repairMoveForm, sentForRepairDate: e.target.value })}
                    placeholder="যেমন: ২৫ অক্টোবর ২০২৬"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>আনুমানিক মেরামত ব্যয়</label>
                  <input
                    type="text"
                    value={repairMoveForm.estimatedCost}
                    onChange={e => setRepairMoveForm({ ...repairMoveForm, estimatedCost: e.target.value })}
                    placeholder="যেমন: ৳ ১,৫০০"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>সার্ভিস সেন্টার / মেকানিকের নাম</label>
                <input
                  type="text"
                  value={repairMoveForm.serviceCenter}
                  onChange={e => setRepairMoveForm({ ...repairMoveForm, serviceCenter: e.target.value })}
                  placeholder="যেমন: জেলা আইসিটি সেল ও টেকনিক্যাল সার্ভিস, টাঙ্গাইল"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>মেকানিক / টেকনিশিয়ান ফোন</label>
                <input
                  type="text"
                  value={repairMoveForm.technicianPhone}
                  onChange={e => setRepairMoveForm({ ...repairMoveForm, technicianPhone: e.target.value })}
                  placeholder="যেমন: ০১৭১২-XXXXXX"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMoveToRepairModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  নিশ্চিত করুন ও ২য় রেজিস্টারে পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK MOVE TO CONDEMNED / SCRAP REGISTER MODAL */}
      {/* ========================================================================= */}
      {showMoveToScrapModal && itemToMove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMoveToScrapModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #fecaca', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', color: '#b91c1c', fontWeight: 900 }}>
                  ❌ যন্ত্রপাতি অচল ঘোষণা (৩য় রেজিস্টার ভুক্তি)
                </h3>
                <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '2px' }}>
                  ডিভাইস: <b>{itemToMove.name}</b> ({itemToMove.assetTag})
                </div>
              </div>
              <button type="button" onClick={() => setShowMoveToScrapModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={confirmMoveToScrap} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#991b1b' }}>
                  অচল ও বাতিল ঘোষণার কারণ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={scrapMoveForm.condemnReason}
                  onChange={e => setScrapMoveForm({ ...scrapMoveForm, condemnReason: e.target.value })}
                  placeholder="যেমন: মাদারবোর্ড পুড়ে নষ্ট ও মেরামত অযোগ্য অথবা প্রযুক্তিগতভাবে সম্পূর্ণ অপ্রচলিত..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অচল ঘোষণার তারিখ</label>
                  <input
                    type="text"
                    value={scrapMoveForm.condemnDate}
                    onChange={e => setScrapMoveForm({ ...scrapMoveForm, condemnDate: e.target.value })}
                    placeholder="যেমন: ২৫ অক্টোবর ২০২৬"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বর্তমান নিষ্পত্তি স্ট্যাটাস</label>
                  <select
                    value={scrapMoveForm.disposalStatus}
                    onChange={e => setScrapMoveForm({ ...scrapMoveForm, disposalStatus: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="নিলামের জন্য সংরক্ষিত">নিলামের জন্য সংরক্ষিত</option>
                    <option value="স্ক্র্যাপ হিসেবে সংরক্ষিত">স্ক্র্যাপ হিসেবে সংরক্ষিত</option>
                    <option value="সরকারি অডিট ও কন্ডেমনেশন তালিকায়">সরকারি অডিট ও কন্ডেমনেশন তালিকায়</option>
                    <option value="নিলাম সম্পন্ন ও অপসারিত">নিলাম সম্পন্ন ও অপসারিত</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMoveToScrapModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  নিশ্চিত করুন ও ৩য় রেজিস্টারে নথিভুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LAB SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {showLabScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowLabScheduleModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 800 }}>
                🗓️ ব্যবহারিক ক্লাসের রুটিন এন্ট্রি
              </h3>
              <button type="button" onClick={() => setShowLabScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveLabSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বার (Day) *</label>
                  <select value={labScheduleForm.day || 'রবিবার'} onChange={e => setLabScheduleForm({ ...labScheduleForm, day: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="রবিবার">রবিবার</option>
                    <option value="সোমবার">সোমবার</option>
                    <option value="মঙ্গলবার">মঙ্গলবার</option>
                    <option value="বুধবার">বুধবার</option>
                    <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>পিরিয়ড ও সময়</label>
                  <input type="text" value={labScheduleForm.period || ''} onChange={e => setLabScheduleForm({ ...labScheduleForm, period: e.target.value })} placeholder="৩য় পিরিয়ড (১১:০০-১১:৪৫)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শ্রেণি</label>
                  <select value={labScheduleForm.class_name || '১০ম শ্রেণি'} onChange={e => setLabScheduleForm({ ...labScheduleForm, class_name: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                    <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                    <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                    <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিষয়</label>
                  <input type="text" value={labScheduleForm.subject || ''} onChange={e => setLabScheduleForm({ ...labScheduleForm, subject: e.target.value })} placeholder="তথ্য ও যোগাযোগ প্রযুক্তি" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>দায়িত্বপ্রাপ্ত শিক্ষক</label>
                <select value={labScheduleForm.teacher || ''} onChange={e => setLabScheduleForm({ ...labScheduleForm, teacher: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                  <option value="">শিক্ষক নির্বাচন করুন...</option>
                  {teachers.map(t => (
                    <option key={t.id || t.teacher_id} value={t.name_bn || t.name_en}>{t.name_bn || t.name_en} ({t.designation_bn || t.designation || 'শিক্ষক'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ব্যবহারিক বিষয়বস্তু (Topic) *</label>
                <input type="text" required value={labScheduleForm.topic || ''} onChange={e => setLabScheduleForm({ ...labScheduleForm, topic: e.target.value })} placeholder="যেমন: HTML টেবিল তৈরি ও ইমেজ লিঙ্ক" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowLabScheduleModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>রুটিন সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MULTIMEDIA SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {showMmScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMmScheduleModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#4338ca', fontWeight: 800 }}>
                🗓️ মাল্টিমিডিয়া ক্লাস রুটিন এন্ট্রি
              </h3>
              <button type="button" onClick={() => setShowMmScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveMmSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>স্মার্ট ক্লাসরুম নির্বাচন *</label>
                <select
                  value={mmScheduleForm.roomId || 'mmr-01'}
                  onChange={e => {
                    const selRoom = (data.multimedia?.rooms || []).find(r => r.id === e.target.value);
                    setMmScheduleForm({ ...mmScheduleForm, roomId: e.target.value, roomName: selRoom ? selRoom.name : 'স্মার্ট ক্লাসরুম ১' });
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                >
                  {(data.multimedia?.rooms || []).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বার (Day) *</label>
                  <select value={mmScheduleForm.day || 'রবিবার'} onChange={e => setMmScheduleForm({ ...mmScheduleForm, day: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="রবিবার">রবিবার</option>
                    <option value="সোমবার">সোমবার</option>
                    <option value="মঙ্গলবার">মঙ্গলবার</option>
                    <option value="বুধবার">বুধবার</option>
                    <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>পিরিয়ড ও সময়</label>
                  <input type="text" value={mmScheduleForm.period || ''} onChange={e => setMmScheduleForm({ ...mmScheduleForm, period: e.target.value })} placeholder="১ম পিরিয়ড (০৯:৩০-১০:১৫)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শ্রেণি</label>
                  <select value={mmScheduleForm.class_name || '১০ম শ্রেণি'} onChange={e => setMmScheduleForm({ ...mmScheduleForm, class_name: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                    <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                    <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                    <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শাখা (Section)</label>
                  <input type="text" value={mmScheduleForm.section || ''} onChange={e => setMmScheduleForm({ ...mmScheduleForm, section: e.target.value })} placeholder="যেমন: পদ্মা / ক-শাখা" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিষয় *</label>
                  <input type="text" required value={mmScheduleForm.subject || ''} onChange={e => setMmScheduleForm({ ...mmScheduleForm, subject: e.target.value })} placeholder="যেমন: জীববিজ্ঞান" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিষয় শিক্ষক</label>
                  <select value={mmScheduleForm.teacher || ''} onChange={e => setMmScheduleForm({ ...mmScheduleForm, teacher: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="">শিক্ষক নির্বাচন করুন...</option>
                    {teachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.name_bn || t.name_en}>{t.name_bn || t.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ডিজিটাল রিসোর্স / ৩ডি কনটেন্ট বিবরণ</label>
                <input type="text" value={mmScheduleForm.resource || ''} onChange={e => setMmScheduleForm({ ...mmScheduleForm, resource: e.target.value })} placeholder="যেমন: শিক্ষক বাতায়ন ৩ডি পরমাণু মডেল ও সিমুলেশন" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowMmScheduleModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#4338ca', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>রুটিন সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MULTIMEDIA DAILY CLASS DELIVERY LOG MODAL */}
      {/* ========================================================================= */}
      {showMmLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMmLogModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#065f46', fontWeight: 800 }}>
                  📋 দৈনিক মাল্টিমিডিয়া ক্লাস ডেলিভারি লগ
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  কে কে ক্লাস নিয়েছে এবং কে কে ক্লাস নেয়নি তার সঠিক রেকর্ড
                </div>
              </div>
              <button type="button" onClick={() => setShowMmLogModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveMmLog} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>তারিখ *</label>
                  <input type="text" required value={mmLogForm.date || ''} onChange={e => setMmLogForm({ ...mmLogForm, date: e.target.value })} placeholder="যেমন: ২৫ অক্টোবর ২০২৬" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ক্লাসরুম</label>
                  <select
                    value={mmLogForm.roomId || 'mmr-01'}
                    onChange={e => {
                      const selRoom = (data.multimedia?.rooms || []).find(r => r.id === e.target.value);
                      setMmLogForm({ ...mmLogForm, roomId: e.target.value, roomName: selRoom ? selRoom.name : 'স্মার্ট ক্লাসরুম ১' });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    {(data.multimedia?.rooms || []).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>পিরিয়ড ও সময়</label>
                  <input type="text" value={mmLogForm.period || ''} onChange={e => setMmLogForm({ ...mmLogForm, period: e.target.value })} placeholder="১ম পিরিয়ড (০৯:৩০-১০:১৫)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শ্রেণি ও শাখা</label>
                  <input type="text" value={mmLogForm.class_name || ''} onChange={e => setMmLogForm({ ...mmLogForm, class_name: e.target.value })} placeholder="১০ম শ্রেণি (পদ্মা শাখা)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিষয় *</label>
                  <input type="text" required value={mmLogForm.subject || ''} onChange={e => setMmLogForm({ ...mmLogForm, subject: e.target.value })} placeholder="যেমন: পদার্থবিজ্ঞান" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিষয় শিক্ষক *</label>
                  <select value={mmLogForm.teacher || ''} onChange={e => setMmLogForm({ ...mmLogForm, teacher: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="">শিক্ষক নির্বাচন করুন...</option>
                    {teachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.name_bn || t.name_en}>{t.name_bn || t.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Switcher Radio */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px', color: '#1e293b' }}>ক্লাস এক্সিকিউশন স্ট্যাটাস *</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#15803d', cursor: 'pointer' }}>
                    <input type="radio" name="mmLogStatus" checked={mmLogForm.status === 'taken'} onChange={() => setMmLogForm({ ...mmLogForm, status: 'taken' })} />
                    ✅ ক্লাস সফলভাবে সম্পন্ন
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#b91c1c', cursor: 'pointer' }}>
                    <input type="radio" name="mmLogStatus" checked={mmLogForm.status === 'missed'} onChange={() => setMmLogForm({ ...mmLogForm, status: 'missed' })} />
                    ❌ ক্লাস নেওয়া হয়নি / স্থগিত
                  </label>
                </div>
              </div>

              {/* If Taken */}
              {mmLogForm.status === 'taken' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>উপস্থাপিত ডিজিটাল বিষয়বস্তু / কন্টেন্ট শিরোনাম</label>
                    <input type="text" value={mmLogForm.topicCovered || ''} onChange={e => setMmLogForm({ ...mmLogForm, topicCovered: e.target.value })} placeholder="যেমন: আলোর প্রতিফলন ও গোলীয় দর্পণ ৩ডি অ্যানিমেশন" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিক্ষার্থীর উপস্থিতি</label>
                      <input type="text" value={mmLogForm.studentsPresent || ''} onChange={e => setMmLogForm({ ...mmLogForm, studentsPresent: e.target.value })} placeholder="যেমন: ৫৮ জন" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ব্যবহৃত প্রজেক্টর / বোর্ড</label>
                      <input type="text" value={mmLogForm.projectorUsed || ''} onChange={e => setMmLogForm({ ...mmLogForm, projectorUsed: e.target.value })} placeholder="Epson EB-2250U 5000 Lumens" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                    </div>
                  </div>
                </>
              )}

              {/* If Missed */}
              {mmLogForm.status === 'missed' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#b91c1c' }}>ক্লাস না নেওয়ার সুনির্দিষ্ট কারণ *</label>
                  <textarea
                    required
                    rows={2}
                    value={mmLogForm.reasonNotTaken || ''}
                    onChange={e => setMmLogForm({ ...mmLogForm, reasonNotTaken: e.target.value })}
                    placeholder="যেমন: বিদ্যুৎ বিভ্রাট ও আইপিএস রক্ষণাবেক্ষণ অথবা শিক্ষক দাপ্তরিক প্রয়োজনে সরকারি প্রশিক্ষণে অবস্থান করছিলেন..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ইনচার্জের পর্যবেক্ষণ / মন্তব্য</label>
                <input type="text" value={mmLogForm.remarks || ''} onChange={e => setMmLogForm({ ...mmLogForm, remarks: e.target.value })} placeholder="ক্লাসের সার্বিক শৃঙ্খলা ও পাঠদান সন্তোষজনক" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMmLogModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>লগ সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEACHER MULTIMEDIA PROJECT MODAL */}
      {/* ========================================================================= */}
      {showMmProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMmProjectModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#b45309', fontWeight: 800 }}>
                  💡 শিক্ষকের মাল্টিমিডিয়া প্রজেক্ট / কন্টেন্ট এন্ট্রি
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  শিক্ষক বাতায়ন, মুক্তপাঠ ও নিজস্ব উদ্ভাবিত ডিজিটাল প্রজেক্টের তথ্য
                </div>
              </div>
              <button type="button" onClick={() => setShowMmProjectModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveMmProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিক্ষকের নাম *</label>
                  <select value={mmProjectForm.teacher || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, teacher: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="">শিক্ষক নির্বাচন করুন...</option>
                    {teachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.name_bn || t.name_en}>{t.name_bn || t.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিক্ষকের পদবি</label>
                  <input type="text" value={mmProjectForm.teacherDesignation || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, teacherDesignation: e.target.value })} placeholder="যেমন: সহকারী শিক্ষক (আইসিটি)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>প্রজেক্ট / কন্টেন্টের নাম *</label>
                <input type="text" required value={mmProjectForm.projectTitle || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, projectTitle: e.target.value })} placeholder="যেমন: সালোকসংশ্লেষণ প্রক্রিয়ার ৩ডি অ্যানিমেশন ও কুইজ" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিষয়</label>
                  <input type="text" value={mmProjectForm.subject || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, subject: e.target.value })} placeholder="জীববিজ্ঞান" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শ্রেণি</label>
                  <input type="text" value={mmProjectForm.class_name || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, class_name: e.target.value })} placeholder="৯ম-১০ম শ্রেণি" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>প্ল্যাটফর্ম</label>
                  <select value={mmProjectForm.platform || 'শিক্ষক বাতায়ন'} onChange={e => setMmProjectForm({ ...mmProjectForm, platform: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="শিক্ষক বাতায়ন">শিক্ষক বাতায়ন (teachers.gov.bd)</option>
                    <option value="মুক্তপাঠ">মুক্তপাঠ (muktopaath.gov.bd)</option>
                    <option value="বিদ্যালয় ক্লাউড রিপোজিটরি">বিদ্যালয় ক্লাউড রিপোজিটরি</option>
                    <option value="ইউটিউব এডুকেশন">ইউটিউব এডুকেশন</option>
                    <option value="গুগল ক্লাসরুম">গুগল ক্লাসরুম</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>সম্মাননা / রেটিং</label>
                  <input type="text" value={mmProjectForm.ratingOrBadge || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, ratingOrBadge: e.target.value })} placeholder="🏆 বাতায়ন পাক্ষিক সেরা / ৫★" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ব্যবহৃত সফটওয়্যার ও উদ্ভাবনী টুলস</label>
                <input type="text" value={mmProjectForm.toolsUsed || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, toolsUsed: e.target.value })} placeholder="PowerPoint 365, Canva Pro, PhET Simulation, Camtasia" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>কন্টেন্ট / বাতায়ন ড্রাইভ লিঙ্ক</label>
                <input type="text" value={mmProjectForm.contentUrl || ''} onChange={e => setMmProjectForm({ ...mmProjectForm, contentUrl: e.target.value })} placeholder="https://teachers.gov.bd/content/details/..." style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিখনফল (Learning Outcomes)</label>
                <textarea
                  rows={2}
                  value={mmProjectForm.learningOutcomes || ''}
                  onChange={e => setMmProjectForm({ ...mmProjectForm, learningOutcomes: e.target.value })}
                  placeholder="শিক্ষার্থীরা সক্রিয়ভাবে ধারণা অনুধাবন করবে এবং ৩ডি অ্যানিমেশনের মাধ্যমে প্রয়োগ বিশ্লেষণ করতে পারবে..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMmProjectModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>প্রজেক্ট সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SMART ROOM PROFILE MODAL */}
      {/* ========================================================================= */}
      {showMmRoomModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMmRoomModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#7c3aed', fontWeight: 800 }}>
                🏛️ স্মার্ট ক্লাসরুম প্রোফাইল সংরক্ষণ
              </h3>
              <button type="button" onClick={() => setShowMmRoomModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveMmRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>কক্ষের নাম ও অবস্থান *</label>
                <input type="text" required value={mmRoomForm.name || ''} onChange={e => setMmRoomForm({ ...mmRoomForm, name: e.target.value })} placeholder="যেমন: স্মার্ট ক্লাসরুম ১ (কক্ষ নং ২০২ - মূল ভবন)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>প্রজেক্টর / স্মার্ট ডিসপ্লে মডেল</label>
                <input type="text" value={mmRoomForm.projector || ''} onChange={e => setMmRoomForm({ ...mmRoomForm, projector: e.target.value })} placeholder="Epson EB-2250U 5000 Lumens Full HD" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>সাউন্ড সিস্টেম</label>
                  <input type="text" value={mmRoomForm.sound || ''} onChange={e => setMmRoomForm({ ...mmRoomForm, sound: e.target.value })} placeholder="Yamaha Dolby Audio 100W" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>বিদ্যুৎ ব্যাকআপ</label>
                  <input type="text" value={mmRoomForm.backup || ''} onChange={e => setMmRoomForm({ ...mmRoomForm, backup: e.target.value })} placeholder="সোলার ও সেন্ট্রাল IPS ৩ ঘণ্টা" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ধারণক্ষমতা</label>
                  <input type="text" value={mmRoomForm.capacity || ''} onChange={e => setMmRoomForm({ ...mmRoomForm, capacity: e.target.value })} placeholder="৬৫ জন শিক্ষার্থী" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রুম ইনচার্জ</label>
                  <input type="text" value={mmRoomForm.incharge || ''} onChange={e => setMmRoomForm({ ...mmRoomForm, incharge: e.target.value })} placeholder="মুহাম্মদ আবুবকর সিদ্দিক" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMmRoomModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>রুম সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCOUT MEMBER MODAL */}
      {/* ========================================================================= */}
      {showScoutMemberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowScoutMemberModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#854d0e', fontWeight: 800 }}>
                ⚜️ স্কাউট / গার্লস গাইড সদস্য এন্ট্রি
              </h3>
              <button type="button" onClick={() => setShowScoutMemberModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveScoutMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিক্ষার্থীর নাম *</label>
                <input type="text" required value={scoutMemberForm.name || ''} onChange={e => setScoutMemberForm({ ...scoutMemberForm, name: e.target.value })} placeholder="শিক্ষার্থীর নাম লিখুন" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শ্রেণি</label>
                  <input type="text" value={scoutMemberForm.class_name || ''} onChange={e => setScoutMemberForm({ ...scoutMemberForm, class_name: e.target.value })} placeholder="১০ম" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রোল নং</label>
                  <input type="text" value={scoutMemberForm.roll_no || ''} onChange={e => setScoutMemberForm({ ...scoutMemberForm, roll_no: e.target.value })} placeholder="০১" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ইউনিট</label>
                  <select value={scoutMemberForm.unit || 'স্কাউট দল'} onChange={e => setScoutMemberForm({ ...scoutMemberForm, unit: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="স্কাউট দল">স্কাউট দল (Scout Troop)</option>
                    <option value="গার্লস গাইড">গার্লস গাইড (Girls Guide)</option>
                    <option value="কাব স্কাউট">কাব স্কাউট (Cub Scout)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>টহলদল (Patrol)</label>
                  <input type="text" value={scoutMemberForm.patrol || ''} onChange={e => setScoutMemberForm({ ...scoutMemberForm, patrol: e.target.value })} placeholder="যেমন: টাইগার প্যাট্রোল" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>পদবি (Rank)</label>
                  <input type="text" value={scoutMemberForm.rank || ''} onChange={e => setScoutMemberForm({ ...scoutMemberForm, rank: e.target.value })} placeholder="যেমন: দলনেতা / সহ-দলনেতা" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রক্তের গ্রুপ</label>
                  <select value={scoutMemberForm.bloodGroup || 'B+'} onChange={e => setScoutMemberForm({ ...scoutMemberForm, bloodGroup: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অর্জিত ব্যাজ ও পারদর্শিতা</label>
                <input type="text" value={scoutMemberForm.badge || ''} onChange={e => setScoutMemberForm({ ...scoutMemberForm, badge: e.target.value })} placeholder="যেমন: স্ট্যান্ডার্ড ব্যাজ, ফার্স্ট এইড" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowScoutMemberModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#854d0e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>সদস্য সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCOUT EVENT MODAL */}
      {/* ========================================================================= */}
      {showScoutEventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowScoutEventModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#b45309', fontWeight: 800 }}>
                🏕️ ক্যাম্পোরি / স্কাউট সমাবেশ রেকর্ড
              </h3>
              <button type="button" onClick={() => setShowScoutEventModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveScoutEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>সমাবেশের নাম *</label>
                <input type="text" required value={scoutEventForm.title || ''} onChange={e => setScoutEventForm({ ...scoutEventForm, title: e.target.value })} placeholder="যেমন: জেলা স্কাউট সমাবেশ ও ক্যাম্পোরি ২০২৬" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>তারিখ</label>
                  <input type="text" value={scoutEventForm.date || ''} onChange={e => setScoutEventForm({ ...scoutEventForm, date: e.target.value })} placeholder="২০২৬-০১-১০ থেকে ১২" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>স্থান/ভেন্যু</label>
                  <input type="text" value={scoutEventForm.venue || ''} onChange={e => setScoutEventForm({ ...scoutEventForm, venue: e.target.value })} placeholder="টাঙ্গাইল জেলা স্টেডিয়াম চত্বর" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>দলনেতা শিক্ষক</label>
                  <input type="text" value={scoutEventForm.leader || ''} onChange={e => setScoutEventForm({ ...scoutEventForm, leader: e.target.value })} placeholder="মোঃ শাহ আলম" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অংশগ্রহণ সংখ্যা</label>
                  <input type="text" value={scoutEventForm.participants || ''} onChange={e => setScoutEventForm({ ...scoutEventForm, participants: e.target.value })} placeholder="২৪ জন" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অর্জিত স্বীকৃতি / পুরস্কার</label>
                <input type="text" value={scoutEventForm.award || ''} onChange={e => setScoutEventForm({ ...scoutEventForm, award: e.target.value })} placeholder="যেমন: শ্রেষ্ঠ সুশৃঙ্খল দল ট্রফি 🏆" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowScoutEventModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>ইভেন্ট সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEAM SQUAD MODAL */}
      {/* ========================================================================= */}
      {showTeamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowTeamModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#be123c', fontWeight: 800 }}>
                ⚽ নতুন ক্রীড়া দল ও স্কোয়াড সেটআপ
              </h3>
              <button type="button" onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>দলের নাম *</label>
                <input type="text" required value={teamForm.name || ''} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="যেমন: মগড়া পালস্ ফুটবল একাদশ" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>খেলা/ইভেন্ট</label>
                  <select value={teamForm.sport || 'ফুটবল'} onChange={e => setTeamForm({ ...teamForm, sport: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="ফুটবল">ফুটবল</option>
                    <option value="ক্রিকেট">ক্রিকেট</option>
                    <option value="হ্যান্ডবল">হ্যান্ডবল</option>
                    <option value="ভলিবল">ভলিবল</option>
                    <option value="ব্যাডমিন্টন">ব্যাডমিন্টন</option>
                    <option value="কাবাডি">কাবাডি</option>
                    <option value="দাবা">দাবা</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অধিনায়ক</label>
                  <input type="text" value={teamForm.captain || ''} onChange={e => setTeamForm({ ...teamForm, captain: e.target.value })} placeholder="যেমন: তানভীর আহমেদ (১০ম শ্রেণি)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>কোচ / গাইড শিক্ষক</label>
                <input type="text" value={teamForm.coach || ''} onChange={e => setTeamForm({ ...teamForm, coach: e.target.value })} placeholder="মোঃ শাহ আলম (শারীরিক শিক্ষা শিক্ষক)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowTeamModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#be123c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>দল সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MATCH RESULT MODAL */}
      {/* ========================================================================= */}
      {showMatchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowMatchModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#e11d48', fontWeight: 800 }}>
                🏆 আন্তঃবিদ্যালয় ম্যাচের ফলাফল রেকর্ড
              </h3>
              <button type="button" onClick={() => setShowMatchModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveMatch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>টুর্নামেন্টের নাম *</label>
                <input type="text" required value={matchForm.tournament || ''} onChange={e => setMatchForm({ ...matchForm, tournament: e.target.value })} placeholder="যেমন: উপজেলা আন্তঃস্কুল ফুটবল প্রতিযোগিতা" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>খেলা</label>
                  <select value={matchForm.sport || 'ফুটবল'} onChange={e => setMatchForm({ ...matchForm, sport: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                    <option value="ফুটবল">ফুটবল</option>
                    <option value="ক্রিকেট">ক্রিকেট</option>
                    <option value="হ্যান্ডবল">হ্যান্ডবল</option>
                    <option value="কাবাডি">কাবাডি</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>প্রতিপক্ষ দল</label>
                  <input type="text" value={matchForm.opponent || ''} onChange={e => setMatchForm({ ...matchForm, opponent: e.target.value })} placeholder="কালিহাতী সরকারি উচ্চ বিদ্যালয়" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>তারিখ ও স্থান</label>
                  <input type="text" value={matchForm.date || ''} onChange={e => setMatchForm({ ...matchForm, date: e.target.value })} placeholder="২০২৬-০২-১৫ (উপজেলা মাঠ)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ম্যাচের ফলাফল</label>
                  <input type="text" value={matchForm.result || ''} onChange={e => setMatchForm({ ...matchForm, result: e.target.value })} placeholder="যেমন: জয় (২-১)" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>সেরা খেলোয়াড়</label>
                  <input type="text" value={matchForm.bestPlayer || ''} onChange={e => setMatchForm({ ...matchForm, bestPlayer: e.target.value })} placeholder="তানভীর আহমেদ" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>অর্জিত ট্রফি / মেডেল</label>
                  <input type="text" value={matchForm.trophy || ''} onChange={e => setMatchForm({ ...matchForm, trophy: e.target.value })} placeholder="উপজেলা চ্যাম্পিয়ন ট্রফি 🏆" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowMatchModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>বাতিল</button>
                <button type="submit" style={{ padding: '8px 22px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>ফলাফল সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
