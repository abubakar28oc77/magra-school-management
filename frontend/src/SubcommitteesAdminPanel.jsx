import React, { useState, useEffect, useMemo } from 'react';
import { getSchoolTeachers } from './mockData';
import { getStoredInstitutionData } from './defaultInstitutionData';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

export const toBn = (n) => {
  if (n === null || n === undefined || n === '') return '';
  return String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
};

// --------------------------------------------------------------------------
// 12 Subcommittees Initial Data Template
// --------------------------------------------------------------------------
export const DEFAULT_SUBCOMMITTEES = [
  {
    id: 'finance',
    key: 'finance',
    title: 'অর্থ উপকমিটি',
    icon: '💰',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০১',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'reg_comm_0',
      name: 'নেয়ামুল হক খান',
      source: 'regular_committee',
      roleInSchool: 'ম্যানেজিং কমিটি (সভাপতি)',
      phone: '01711-XXXXXX'
    },
    members: [
      { id: 'teacher_head', name: 'মুহাম্মদ শফিকুল ইসলাম', roleInSchool: 'প্রধান শিক্ষক', committeeRole: 'সদস্য সচিব', phone: '01712-XXXXXX' },
      { id: 'reg_comm_2', name: 'আলহাজ্ব মোঃ আব্দুল লতিফ', roleInSchool: 'ম্যানেজিং কমিটি (দাতা সদস্য)', committeeRole: 'সদস্য', phone: '01713-XXXXXX' },
      { id: 'teacher_eng', name: 'মোঃ আশরাফুল আলম', roleInSchool: 'সহকারী শিক্ষক (ইংরেজি)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' },
      { id: 'teacher_math', name: 'মোঃ হাবিবুর রহমান', roleInSchool: 'সিনিয়র শিক্ষক (বিজ্ঞান ও গণিত)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' }
    ],
    tor: [
      'বিদ্যালয়ের যাবতীয় আয় ও ব্যয়ের হিসাব নিয়মিত তদারকি ও নিরীক্ষা করা।',
      'শিক্ষার্থীদের ফি আদায় এবং ব্যাংকিং লেনদেনের স্বচ্ছতা নিশ্চিত করা।',
      'আর্থিক তহবিল ও ক্যাশ বই প্রতি মাসে অন্তত একবার পর্যবেক্ষণ করে প্রধান শিক্ষককে অবহিত করা।'
    ]
  },
  {
    id: 'purchase',
    key: 'purchase',
    title: 'ক্রয় উপকমিটি',
    icon: '🛒',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০২',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_head',
      name: 'মুহাম্মদ শফিকুল ইসলাম',
      source: 'teacher',
      roleInSchool: 'প্রধান শিক্ষক',
      phone: '01712-XXXXXX'
    },
    members: [
      { id: 'reg_comm_3', name: 'মোঃ রফিকুল ইসলাম তালুকদার', roleInSchool: 'ম্যানেজিং কমিটি (অভিভাবক প্রতিনিধি)', committeeRole: 'সদস্য সচিব', phone: '01714-XXXXXX' },
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য', phone: '01716-XXXXXX' },
      { id: 'teacher_ict', name: 'মুহাম্মদ আবুবকর সিদ্দিক', roleInSchool: 'সহকারী শিক্ষক (আইসিটি)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' },
      { id: 'teacher_lib', name: 'মোঃ শাহিন মিয়া', roleInSchool: 'সহকারী শিক্ষক (গ্রন্থাগার)', committeeRole: 'সদস্য', phone: '01719-XXXXXX' }
    ],
    tor: [
      'বিদ্যালয়ের প্রয়োজনীয় শিক্ষা উপকরণ, আসবাবপত্র, ল্যাব ও অফিস সামগ্রী ক্রয়ের দরপত্র/কোটেশন যাচাই করা।',
      'সরকারি আর্থিক বিধিমালা অনুযায়ী সর্বনিম্ন দরদাতা ও গুণগত মানের ভিত্তিতে ক্রয়াদেশ অনুমোদন করা।',
      'ক্রয়কৃত সামগ্রী যথাসময়ে স্টক রেজিস্টারে লিপিবদ্ধ করা নিশ্চিত করা।'
    ]
  },
  {
    id: 'development',
    key: 'development',
    title: 'উন্নয়ন উপকমিটি',
    icon: '🏗️',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৩',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'reg_comm_2',
      name: 'আলহাজ্ব মোঃ আব্দুল লতিফ',
      source: 'regular_committee',
      roleInSchool: 'ম্যানেজিং কমিটি (দাতা সদস্য)',
      phone: '01713-XXXXXX'
    },
    members: [
      { id: 'teacher_head', name: 'মুহাম্মদ শফিকুল ইসলাম', roleInSchool: 'প্রধান শিক্ষক', committeeRole: 'সদস্য সচিব', phone: '01712-XXXXXX' },
      { id: 'reg_comm_0', name: 'নেয়ামুল হক খান', roleInSchool: 'ম্যানেজিং কমিটি (সভাপতি)', committeeRole: 'সদস্য', phone: '01711-XXXXXX' },
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য', phone: '01716-XXXXXX' },
      { id: 'reg_comm_7', name: 'ডাঃ আশরাফুল আলম', roleInSchool: 'ম্যানেজিং কমিটি (হিতৈষী সদস্য)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' }
    ],
    tor: [
      'বিদ্যালয়ের একাডেমিক ভবন, সীমানা প্রাচীর, ড্রেনেজ ও স্যানিটেশন ব্যবস্থার ভৌত অবকাঠামোগত উন্নয়ন তদারকি করা।',
      'প্রয়োজনীয় নতুন অবকাঠামো নির্মাণের খসড়া প্রাক্কলন প্রণয়ন ও অনুমোদনের সুপারিশ করা।',
      'বিদ্যালয়ের পরিবেশ সুরক্ষায় সবুজ চত্বর ও খেলার মাঠের উন্নয়ন কার্যক্রম তদারকি করা।'
    ]
  },
  {
    id: 'fee_collection',
    key: 'fee_collection',
    title: 'টিউশন ফি ও সেশন চার্জ আদায় উপকমিটি',
    icon: '💳',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৪',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_asst_head',
      name: 'তাপসী সরকার',
      source: 'teacher',
      roleInSchool: 'সহকারী প্রধান শিক্ষক',
      phone: '01716-XXXXXX'
    },
    members: [
      { id: 'teacher_ict', name: 'মুহাম্মদ আবুবকর সিদ্দিক', roleInSchool: 'সহকারী শিক্ষক (আইসিটি)', committeeRole: 'সদস্য সচিব', phone: '01717-XXXXXX' },
      { id: 'teacher_bio', name: 'মোঃ আব্দুর রহিম লিটন', roleInSchool: 'সিনিয়র শিক্ষক (জীববিজ্ঞান)', committeeRole: 'সদস্য', phone: '01715-XXXXXX' },
      { id: 'reg_comm_4', name: 'বেগম ফরিদা ইয়াসমিন', roleInSchool: 'ম্যানেজিং কমিটি (সংরক্ষিত মহিলা অভিভাবক)', committeeRole: 'সদস্য', phone: '01715-XXXXXX' },
      { id: 'teacher_staff', name: 'মোঃ আলমগীর হোসেন', roleInSchool: 'অফিস সহকারী', committeeRole: 'সদস্য', phone: '01714-XXXXXX' }
    ],
    tor: [
      'শিক্ষার্থীদের নির্ধারিত মাসিক টিউশন ফি ও সেশন চার্জ যথাসময়ে ডিজিটাল রসিদে আদায় তদারকি করা।',
      'দীর্ঘমেয়াদি বকেয়া ফি পরিশোধে অভিভাবকদের সঙ্গে সৌজন্যমূলক যোগাযোগ ও নোটিশ নিশ্চিত করা।',
      'অসচ্ছল, এতিম ও নদীভাঙন কবলিত পরিবারের শিক্ষার্থীদের ফি মওকুফের আবেদন পর্যালোচনা করা।'
    ]
  },
  {
    id: 'internal_exam',
    key: 'internal_exam',
    title: 'অভ্যন্তরীন পরীক্ষা কার্যক্রম পরিচালনা উপকমিটি',
    icon: '📝',
    targetSize: 7,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৫',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_head',
      name: 'মুহাম্মদ শফিকুল ইসলাম',
      source: 'teacher',
      roleInSchool: 'প্রধান শিক্ষক',
      phone: '01712-XXXXXX'
    },
    members: [
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য সচিব', phone: '01716-XXXXXX' },
      { id: 'teacher_bangla', name: 'মোঃ আব্দুল খালেক', roleInSchool: 'সহকারী শিক্ষক (বাংলা)', committeeRole: 'সদস্য', phone: '01713-XXXXXX' },
      { id: 'teacher_eng', name: 'মোঃ আশরাফুল আলম', roleInSchool: 'সহকারী শিক্ষক (ইংরেজি)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' },
      { id: 'teacher_math', name: 'মোঃ হাবিবুর রহমান', roleInSchool: 'সিনিয়র শিক্ষক (গণিত)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' },
      { id: 'teacher_sci', name: 'মোঃ রফিকুল ইসলাম', roleInSchool: 'সহকারী শিক্ষক (ভৌত বিজ্ঞান)', committeeRole: 'সদস্য', phone: '01715-XXXXXX' },
      { id: 'teacher_ict', name: 'মুহাম্মদ আবুবকর সিদ্দিক', roleInSchool: 'সহকারী শিক্ষক (আইসিটি)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' }
    ],
    tor: [
      'বিদ্যালয়ের অভ্যন্তরীণ অর্ধবার্ষিক, বার্ষিক ও নির্বাচনি পরীক্ষার সময়সূচি এবং রুটিন প্রণয়ন।',
      'প্রশ্নপত্র প্রণয়ন, সিলগালাকরণ, মডারেশন ও পরীক্ষা হলের আসন বিন্যাস সুশৃঙ্খল রাখা।',
      'পরীক্ষা শেষে দ্রুততম সময়ে খাতা মূল্যায়ন, ফলাফল প্রক্রিয়াকরণ ও প্রগ্রেস রিপোর্ট প্রকাশ।'
    ]
  },
  {
    id: 'audit',
    key: 'audit',
    title: 'অভ্যন্তরীন অডিট উপকমিটি',
    icon: '🔍',
    targetSize: 3,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৬',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'reg_comm_3',
      name: 'মোঃ রফিকুল ইসলাম তালুকদার',
      source: 'regular_committee',
      roleInSchool: 'ম্যানেজিং কমিটি (অভিভাবক প্রতিনিধি)',
      phone: '01714-XXXXXX'
    },
    members: [
      { id: 'teacher_bangla', name: 'মোঃ আব্দুল খালেক', roleInSchool: 'সহকারী শিক্ষক (বাংলা)', committeeRole: 'সদস্য সচিব', phone: '01713-XXXXXX' },
      { id: 'teacher_math', name: 'মোঃ হাবিবুর রহমান', roleInSchool: 'সিনিয়র শিক্ষক (গণিত)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' }
    ],
    tor: [
      'প্রতি তিন মাস অন্তর বিদ্যালয়ের ক্যাশ বুক, রসিদ বই ও খরচের ভাউচার অভ্যন্তরীণ নিরীক্ষা করা।',
      'ব্যাংক স্টেটমেন্টের সাথে ক্যাশ বইয়ের স্থিতি যাচাই করে কোনো অসঙ্গতি থাকলে তা প্রধান শিক্ষককে অবহিত করা।',
      'বিদ্যালয়ের আর্থিক স্বচ্ছতা বৃদ্ধির লক্ষ্যে অভ্যন্তরীণ অডিট রিপোর্ট ম্যানেজিং কমিটিতে পেশ করা।'
    ]
  },
  {
    id: 'budget',
    key: 'budget',
    title: 'বাৎসরিক বাজেট প্রণয়ন উপকমিটি',
    icon: '📊',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৭',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'reg_comm_0',
      name: 'নেয়ামুল হক খান',
      source: 'regular_committee',
      roleInSchool: 'ম্যানেজিং কমিটি (সভাপতি)',
      phone: '01711-XXXXXX'
    },
    members: [
      { id: 'teacher_head', name: 'মুহাম্মদ শফিকুল ইসলাম', roleInSchool: 'প্রধান শিক্ষক', committeeRole: 'সদস্য সচিব', phone: '01712-XXXXXX' },
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য', phone: '01716-XXXXXX' },
      { id: 'reg_comm_2', name: 'আলহাজ্ব মোঃ আব্দুল লতিফ', roleInSchool: 'ম্যানেজিং কমিটি (দাতা সদস্য)', committeeRole: 'সদস্য', phone: '01713-XXXXXX' },
      { id: 'teacher_eng', name: 'মোঃ আশরাফুল আলম', roleInSchool: 'সহকারী শিক্ষক (ইংরেজি)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' }
    ],
    tor: [
      'আসন্ন শিক্ষাবর্ষের শিক্ষক-কর্মচারী পারিতোষিক, বিদ্যুৎ, ইন্টারনেট ও প্রশাসনিক ব্যয়ের প্রাক্কলন করা।',
      'টিউশন ফি, সেশন চার্জ, অনুদান ও অন্যান্য সম্ভাব্য আয়ের বাস্তবসম্মত লক্ষ্যমাত্রা নির্ধারণ করা।',
      'উন্নয়ন ও একাডেমিক খাতের সমন্বয় ঘটিয়ে বার্ষিক উদ্বৃত্ত বা সুষম বাজেট প্রণয়ন করা।'
    ]
  },
  {
    id: 'sports',
    key: 'sports',
    title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা আয়োজন ও পরিচালনা উপকমিটি',
    icon: '🏆',
    targetSize: 7,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৮',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_asst_head',
      name: 'তাপসী সরকার',
      source: 'teacher',
      roleInSchool: 'সহকারী প্রধান শিক্ষক',
      phone: '01716-XXXXXX'
    },
    members: [
      { id: 'teacher_bio', name: 'মোঃ আব্দুর রহিম লিটন', roleInSchool: 'সিনিয়র শিক্ষক (শারীরিক শিক্ষা ও জীববিজ্ঞান)', committeeRole: 'সদস্য সচিব', phone: '01715-XXXXXX' },
      { id: 'teacher_eng', name: 'মোঃ আশরাফুল আলম', roleInSchool: 'সহকারী শিক্ষক (ইংরেজি)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' },
      { id: 'teacher_lib', name: 'মোঃ শাহিন মিয়া', roleInSchool: 'সহকারী শিক্ষক (গ্রন্থাগার)', committeeRole: 'সদস্য', phone: '01719-XXXXXX' },
      { id: 'teacher_ict', name: 'মুহাম্মদ আবুবকর সিদ্দিক', roleInSchool: 'সহকারী শিক্ষক (আইসিটি)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' },
      { id: 'reg_comm_3', name: 'মোঃ রফিকুল ইসলাম তালুকদার', roleInSchool: 'ম্যানেজিং কমিটি (অভিভাবক প্রতিনিধি)', committeeRole: 'সদস্য', phone: '01714-XXXXXX' },
      { id: 'reg_comm_4', name: 'বেগম ফরিদা ইয়াসমিন', roleInSchool: 'ম্যানেজিং কমিটি (সংরক্ষিত মহিলা অভিভাবক)', committeeRole: 'সদস্য', phone: '01715-XXXXXX' }
    ],
    tor: [
      'বার্ষিক ক্রীড়া সপ্তাহ ও প্রতিযোগিতার ইভেন্ট তালিকা এবং খেলার নিয়মাবলি নির্ধারণ করা।',
      'খেলার মাঠ উপযুক্ত করা, ট্র্যাক তৈরি ও প্রয়োজনীয় ক্রীড়া সরঞ্জাম সংগ্রহ করা।',
      'সুষ্ঠু প্রতিযোগিতা সম্পন্নে বিচারকমণ্ডলী পরিচালনা ও বিজয়ীদের মাঝে পুরস্কার বিতরণ।'
    ]
  },
  {
    id: 'cocurricular',
    key: 'cocurricular',
    title: 'সহঃশিক্ষা কার্যক্রম পরিচালনা উপকমিটি',
    icon: '🎨',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/০৯',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_bangla',
      name: 'মোঃ আব্দুল খালেক',
      source: 'teacher',
      roleInSchool: 'সহকারী শিক্ষক (বাংলা সাহিত্য)',
      phone: '01713-XXXXXX'
    },
    members: [
      { id: 'teacher_ict', name: 'মুহাম্মদ আবুবকর সিদ্দিক', roleInSchool: 'সহকারী শিক্ষক (আইসিটি)', committeeRole: 'সদস্য সচিব', phone: '01717-XXXXXX' },
      { id: 'teacher_eng', name: 'মোঃ আশরাফুল আলম', roleInSchool: 'সহকারী শিক্ষক (ইংরেজি)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' },
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য', phone: '01716-XXXXXX' },
      { id: 'teacher_lib', name: 'মোঃ শাহিন মিয়া', roleInSchool: 'সহকারী শিক্ষক (গ্রন্থাগার)', committeeRole: 'সদস্য', phone: '01719-XXXXXX' }
    ],
    tor: [
      '২১শে ফেব্রুয়ারি, ২৬শে মার্চ, ১৬ই ডিসেম্বর ও জাতীয় দিবসসমূহের ভাবগাম্ভীর্যপূর্ণ উদযাপন।',
      'স্কাউটিং, গার্ল গাইড, কুইজ প্রতিযোগিতা, চিত্রাঙ্কন ও সাংস্কৃতিক অনুষ্ঠানের পরিকল্পনা বাস্তবায়ন।',
      'বার্ষিক দেয়াল পত্রিকা এবং স্কুল ম্যাগাজিন প্রকাশনা কার্যক্রমের তত্ত্বাবধান।'
    ]
  },
  {
    id: 'clubs',
    key: 'clubs',
    title: 'ক্লাব ও সংগঠন পরিচালনা উপকমিটি',
    icon: '🤝',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/১০',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_ict',
      name: 'মুহাম্মদ আবুবকর সিদ্দিক',
      source: 'teacher',
      roleInSchool: 'সহকারী শিক্ষক (আইসিটি)',
      phone: '01717-XXXXXX'
    },
    members: [
      { id: 'teacher_eng', name: 'মোঃ আশরাফুল আলম', roleInSchool: 'সহকারী শিক্ষক (ইংরেজি)', committeeRole: 'সদস্য সচিব', phone: '01718-XXXXXX' },
      { id: 'teacher_math', name: 'মোঃ হাবিবুর রহমান', roleInSchool: 'সিনিয়র শিক্ষক (বিজ্ঞান ও গণিত)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' },
      { id: 'teacher_bangla', name: 'মোঃ আব্দুল খালেক', roleInSchool: 'সহকারী শিক্ষক (বাংলা)', committeeRole: 'সদস্য', phone: '01713-XXXXXX' },
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য', phone: '01716-XXXXXX' }
    ],
    tor: [
      'বিদ্যালয়ের ডিবেটিং, বিজ্ঞান, আইসিটি ও সাহিত্য ক্লাবের সার্বিক কার্যক্রম তদারকি।',
      'শিক্ষার্থীদের বিভিন্ন মেধাভিত্তিক জাতীয় অলিম্পিয়াড ও প্রতিযোগিতায় অংশগ্রহণে উৎসাহিত করা।',
      'প্রতিটি ক্লাবের জন্য দক্ষ মডারেটর পরিচালনা ও কর্মশালা বাস্তবায়নে সহায়তা প্রদান।'
    ]
  },
  {
    id: 'discipline',
    key: 'discipline',
    title: 'বিদ্যালয়ের শৃংখলা উপকমিটি',
    icon: '🛡️',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/১১',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'teacher_asst_head',
      name: 'তাপসী সরকার',
      source: 'teacher',
      roleInSchool: 'সহকারী প্রধান শিক্ষক',
      phone: '01716-XXXXXX'
    },
    members: [
      { id: 'teacher_bio', name: 'মোঃ আব্দুর রহিম লিটন', roleInSchool: 'সিনিয়র শিক্ষক (জীববিজ্ঞান)', committeeRole: 'সদস্য সচিব', phone: '01715-XXXXXX' },
      { id: 'teacher_bangla', name: 'মোঃ আব্দুল খালেক', roleInSchool: 'সহকারী শিক্ষক (বাংলা)', committeeRole: 'সদস্য', phone: '01713-XXXXXX' },
      { id: 'reg_comm_3', name: 'মোঃ রফিকুল ইসলাম তালুকদার', roleInSchool: 'ম্যানেজিং কমিটি (অভিভাবক প্রতিনিধি)', committeeRole: 'সদস্য', phone: '01714-XXXXXX' },
      { id: 'reg_comm_4', name: 'বেগম ফরিদা ইয়াসমিন', roleInSchool: 'ম্যানেজিং কমিটি (সংরক্ষিত মহিলা অভিভাবক)', committeeRole: 'সদস্য', phone: '01715-XXXXXX' }
    ],
    tor: [
      'প্রাত্যহিক সমাবেশ (অ্যাসেম্বলি), জাতীয় সঙ্গীত ও সুশৃঙ্খল সারিবদ্ধতা তদারকি করা।',
      'শিক্ষার্থীদের নির্ধারিত স্কুল পোশাক, পরিচয়পত্র (আইডি কার্ড) পরিধান নিশ্চিত করা।',
      'শ্রেণিকক্ষে এবং ক্যাম্পাস প্রাঙ্গণে মোবাইল ফোন আনা ও ব্যবহার কঠোরভাবে নিষিদ্ধ রাখা।'
    ]
  },
  {
    id: 'harassment_prevention',
    key: 'harassment_prevention',
    title: 'যৌন হয়রানি প্রতিরোধ উপকমিটি',
    icon: '⚖️',
    targetSize: 5,
    session: '২০২৬ শিক্ষাবর্ষ',
    memo_no: 'মপাউউবি/উপকমিটি/২০২৬/১২',
    formation_date: '২০২৬-০১-১০',
    convenor: {
      id: 'reg_comm_4',
      name: 'বেগম ফরিদা ইয়াসমিন',
      source: 'regular_committee',
      roleInSchool: 'ম্যানেজিং কমিটি (সংরক্ষিত মহিলা অভিভাবক সদস্য)',
      phone: '01715-XXXXXX'
    },
    members: [
      { id: 'teacher_asst_head', name: 'তাপসী সরকার', roleInSchool: 'সহকারী প্রধান শিক্ষক', committeeRole: 'সদস্য সচিব', phone: '01716-XXXXXX' },
      { id: 'reg_comm_7', name: 'ডাঃ আশরাফুল আলম', roleInSchool: 'ম্যানেজিং কমিটি (হিতৈষী সদস্য ও চিকিৎসক)', committeeRole: 'সদস্য', phone: '01718-XXXXXX' },
      { id: 'teacher_head', name: 'মুহাম্মদ শফিকুল ইসলাম', roleInSchool: 'প্রধান শিক্ষক', committeeRole: 'সদস্য', phone: '01712-XXXXXX' },
      { id: 'teacher_ict', name: 'মুহাম্মদ আবুবকর সিদ্দিক', roleInSchool: 'সহকারী শিক্ষক (আইসিটি)', committeeRole: 'সদস্য', phone: '01717-XXXXXX' }
    ],
    tor: [
      'মহামান্য হাইকোর্টের নির্দেশনা অনুসারে নারী শিক্ষক, ছাত্রী ও কর্মচারীদের নিরাপদ পরিবেশ নিশ্চিত করা।',
      'ক্যাম্পাসে যেকোনো ধরনের অশোভন আচরণ বা যৌন হয়রানি প্রতিরোধে সচেতনতা সৃষ্টি ও অভিযোগ বক্স স্থাপন।',
      'যেকোনো অপ্রীতিকর ঘটনার দ্রুত, নিরপেক্ষ ও গোপনীয় তদন্ত পরিচালনা করে কঠোর শাস্তিমূলক ব্যবস্থার সুপারিশ।'
    ]
  }
];

// --------------------------------------------------------------------------
// Helper: Candidate Pool Builder (Teachers + Managing Committee + Adhoc Committee)
// --------------------------------------------------------------------------
export function getSubcommitteeCandidatePool() {
  const teachers = getSchoolTeachers() || [];
  const instData = getStoredInstitutionData();
  const comm = instData?.committee || {};

  const regularMembers = comm.regular?.members || comm.members || [];
  const adhocMembers = comm.adhoc?.members || [];

  const pool = [];

  // Teachers
  teachers.forEach((t, i) => {
    pool.push({
      id: `teacher_${t.id || t.employee_id || i}`,
      name: t.name_bn || t.name_en || 'শিক্ষক',
      type: 'teacher',
      groupLabel: '👨‍🏫 কর্মরত শিক্ষকবৃন্দ',
      roleInSchool: t.designation || 'সহকারী শিক্ষক',
      phone: t.phone || t.mobile || '',
      photo: t.photo || ''
    });
  });

  // Regular Managing Committee
  regularMembers.forEach((m, i) => {
    pool.push({
      id: `reg_comm_${i}`,
      name: m.name_bn || 'কমিটি সদস্য',
      type: 'regular_committee',
      groupLabel: '🏛️ নিয়মিত ম্যানেজিং কমিটি সদস্যবৃন্দ',
      roleInSchool: m.role ? `ম্যানেজিং কমিটি (${m.role})` : (m.designation || 'ম্যানেজিং কমিটি সদস্য'),
      phone: m.mobile || '',
      photo: m.photo || ''
    });
  });

  // Adhoc Committee
  adhocMembers.forEach((m, i) => {
    pool.push({
      id: `adhoc_comm_${i}`,
      name: m.name_bn || 'এডহক সদস্য',
      type: 'adhoc_committee',
      groupLabel: '📋 এডহক কমিটি সদস্যবৃন্দ',
      roleInSchool: m.role ? `এডহক কমিটি (${m.role})` : (m.designation || 'এডহক কমিটি সদস্য'),
      phone: m.mobile || '',
      photo: m.photo || ''
    });
  });

  return pool;
}

// --------------------------------------------------------------------------
// Subcommittees Admin Panel Component
// --------------------------------------------------------------------------
export function SubcommitteesAdminPanel({ sub, setSub }) {
  // Load stored subcommittees from localStorage or fallback to defaults
  const [subcommittees, setSubcommittees] = useState(() => {
    try {
      const raw = localStorage.getItem('magra_subcommittees_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SUBCOMMITTEES;
  });

  const [activeId, setActiveId] = useState(sub || 'finance');
  const [toastMsg, setToastMsg] = useState('');
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [candidateTypeFilter, setCandidateTypeFilter] = useState('all');

  // Sync active subcommittee with sub prop if changed from sidebar
  useEffect(() => {
    if (sub && sub !== activeId) {
      setActiveId(sub);
    }
  }, [sub]);

  const handleSelectSub = (id) => {
    setActiveId(id);
    if (setSub) setSub(id);
    setMemberDropdownOpen(false);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Save current subcommittees state to localStorage
  const saveToStorage = (updatedList) => {
    setSubcommittees(updatedList);
    try {
      localStorage.setItem('magra_subcommittees_data', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('magra_subcommittees_change', { detail: updatedList }));
    } catch (e) {
      console.error('Failed to save subcommittees data', e);
    }
  };

  // Candidates Pool
  const candidatePool = useMemo(() => getSubcommitteeCandidatePool(), []);

  // Currently active subcommittee
  const currentComm = useMemo(() => {
    return subcommittees.find(c => c.id === activeId) || subcommittees[0];
  }, [subcommittees, activeId]);

  // Update a field in the current subcommittee
  const updateCurrentField = (field, value) => {
    const updated = subcommittees.map(c => {
      if (c.id === currentComm.id) {
        return { ...c, [field]: value };
      }
      return c;
    });
    saveToStorage(updated);
  };

  // Set convenor from single select
  const handleSetConvenor = (candidateId) => {
    if (!candidateId) {
      updateCurrentField('convenor', null);
      return;
    }
    const found = candidatePool.find(p => p.id === candidateId || p.name === candidateId);
    if (found) {
      // If convenor was already in members, remove them from members
      const filteredMembers = (currentComm.members || []).filter(m => m.name !== found.name);
      const updated = subcommittees.map(c => {
        if (c.id === currentComm.id) {
          return {
            ...c,
            convenor: {
              id: found.id,
              name: found.name,
              source: found.type,
              roleInSchool: found.roleInSchool,
              phone: found.phone
            },
            members: filteredMembers
          };
        }
        return c;
      });
      saveToStorage(updated);
      showToast(`✓ "${found.name}"-কে আহবায়ক হিসেবে নির্ধারণ করা হয়েছে।`);
    }
  };

  // Toggle member selection in multi-select checklist
  const handleToggleMember = (candidate) => {
    const currentMembers = [...(currentComm.members || [])];
    const existingIndex = currentMembers.findIndex(m => m.name === candidate.name);

    if (existingIndex >= 0) {
      // Remove
      currentMembers.splice(existingIndex, 1);
    } else {
      // Add
      currentMembers.push({
        id: candidate.id,
        name: candidate.name,
        roleInSchool: candidate.roleInSchool,
        committeeRole: 'সদস্য',
        phone: candidate.phone
      });
    }

    updateCurrentField('members', currentMembers);
  };

  // Update a specific member's committee role (সদস্য সচিব / সদস্য)
  const handleUpdateMemberRole = (index, role) => {
    const list = [...(currentComm.members || [])];
    list[index] = { ...list[index], committeeRole: role };
    updateCurrentField('members', list);
  };

  // Remove a member
  const handleRemoveMember = (index) => {
    const list = [...(currentComm.members || [])];
    list.splice(index, 1);
    updateCurrentField('members', list);
  };

  // Update ToR point
  const handleUpdateTor = (index, value) => {
    const list = [...(currentComm.tor || [])];
    list[index] = value;
    updateCurrentField('tor', list);
  };

  // Add ToR point
  const handleAddTor = () => {
    const list = [...(currentComm.tor || [])];
    list.push('নতুন কার্যপরিধি পয়েন্ট লিখুন...');
    updateCurrentField('tor', list);
  };

  // Remove ToR point
  const handleRemoveTor = (index) => {
    const list = [...(currentComm.tor || [])];
    list.splice(index, 1);
    updateCurrentField('tor', list);
  };

  // Reset current subcommittee
  const handleResetCurrent = () => {
    if (!confirm(`আপনি কি "${currentComm.title}"-এর তথ্য প্রাথমিক অবস্থায় রিসেট করতে চান?`)) return;
    const defaultOne = DEFAULT_SUBCOMMITTEES.find(c => c.id === currentComm.id) || DEFAULT_SUBCOMMITTEES[0];
    const updated = subcommittees.map(c => c.id === currentComm.id ? JSON.parse(JSON.stringify(defaultOne)) : c);
    saveToStorage(updated);
    showToast(`✓ "${currentComm.title}" রিসেট সম্পন্ন হয়েছে।`);
  };

  // Reset ALL 12 subcommittees
  const handleResetAll = () => {
    if (!confirm('সতর্কতা: আপনি কি সকল ১২টি উপকমিটি প্রাথমিক ডিফল্ট তথ্যে ফিরিয়ে নিতে চান?')) return;
    saveToStorage(JSON.parse(JSON.stringify(DEFAULT_SUBCOMMITTEES)));
    showToast('✓ সকল ১২টি উপকমিটি সফলভাবে ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে!');
  };

  // Print Official Resolution on School Pad
  const handlePrintOfficialPad = (comm) => {
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('পপআপ উইন্ডো ব্লক হয়েছে। অনুগ্রহ করে ব্রাউজারে পপআপ অনুমোদন করুন।');
      return;
    }

    const allMembers = [];
    if (comm.convenor) {
      allMembers.push({
        name: comm.convenor.name,
        roleInSchool: comm.convenor.roleInSchool,
        committeeRole: 'আহবায়ক',
        phone: comm.convenor.phone || ''
      });
    }
    (comm.members || []).forEach(m => {
      allMembers.push({
        name: m.name,
        roleInSchool: m.roleInSchool,
        committeeRole: m.committeeRole || 'সদস্য',
        phone: m.phone || ''
      });
    });

    const toBn = (n) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

    const printHtml = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${comm.title} — অফিস প্রজ্ঞাপন</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          body {
            font-family: 'SolaimanLipi', 'Kalpurush', 'Nikosh', Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 10px;
            font-size: 13.5px;
            line-height: 1.6;
            background: #fff;
          }
          ${SCHOOL_PAD_STYLES}
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12.5px;
            font-weight: 700;
            margin: 12px 0 16px 0;
            border-bottom: 1px dotted #cbd5e1;
            padding-bottom: 6px;
          }
          .order-badge-box {
            text-align: center;
            margin: 12px 0 16px 0;
          }
          .order-pill {
            display: inline-block;
            background: #ecfdf5;
            color: #065f46;
            border: 1.5px solid #059669;
            padding: 4px 18px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 13.5px;
            letter-spacing: 0.5px;
          }
          .order-title {
            margin: 8px 0 4px 0;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }
          .order-lead {
            font-size: 13.5px;
            line-height: 1.7;
            text-align: justify;
            margin-bottom: 14px;
          }
          .member-table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0 16px 0;
          }
          .member-table th, .member-table td {
            border: 1px solid #0f172a;
            padding: 7px 10px;
            font-size: 12.5px;
            text-align: left;
          }
          .member-table th {
            background: #f1f5f9;
            font-weight: 800;
            text-align: center;
            color: #0f172a;
          }
          .tor-box {
            background: #f8fafc;
            border: 1px dashed #64748b;
            border-radius: 6px;
            padding: 10px 14px;
            margin: 14px 0;
            font-size: 12.5px;
          }
          .tor-box h4 {
            margin: 0 0 6px 0;
            color: #065f46;
            font-size: 13.5px;
            font-weight: 800;
          }
          .tor-box ol {
            margin: 0;
            padding-left: 20px;
            line-height: 1.7;
          }
          .distribution-box {
            font-size: 11.5px;
            color: #475569;
            margin-top: 18px;
            line-height: 1.5;
          }
          .signatures {
            margin-top: 55px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            text-align: center;
          }
          .sig-col {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .sig-line {
            border-top: 1px dashed #0f172a;
            width: 100%;
            max-width: 155px;
            padding-top: 5px;
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
          }
          .sig-name {
            color: #475569;
            font-size: 11px;
            margin-top: 3px;
            display: block;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#e0f2fe;border:1px solid #7dd3fc;padding:8px 14px;border-radius:6px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:13px;color:#0369a1;font-weight:700;">🖨️ অফিসিয়াল প্যাডে প্রিন্ট প্রিভিউ প্রস্তুত। A4 পোট্রেইট আকারে প্রিন্ট বা PDF সংরক্ষণ করুন।</span>
          <button onclick="window.print()" style="background:#0284c7;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;font-weight:800;font-size:13.5px;">🖨️ প্রিন্ট করুন / Save as PDF</button>
        </div>

        <!-- Official School Pad Header -->
        ${SCHOOL_PAD_HEADER_HTML}

        <div class="meta-row">
          <div>স্মারক নং: <b>${comm.memo_no || 'মপাউউবি/উপকমিটি/২০২৬/—'}</b></div>
          <div>তারিখ: <b>${comm.formation_date || '১০-০১-২০২৬'}খ্রি.</b></div>
        </div>

        <div class="order-badge-box">
          <div class="order-pill">অফিস আদেশ / প্রজ্ঞাপন</div>
          <h2 class="order-title">বিষয়: মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের "${comm.title}" গঠন প্রসঙ্গে।</h2>
        </div>

        <p class="order-lead">
          মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের সার্বিক শিক্ষা ও প্রাতিষ্ঠানিক প্রশাসনিক শৃঙ্খলা সুষ্ঠু ও গতিশীল করার স্বার্থে এবং বিদ্যালয়ের পরিচালনা কমিটির অনুমোদনক্রমে নিম্নবর্ণিত শিক্ষক ও পরিচালনা পর্ষদ সদস্যদের সমন্বয়ে <b>${toBn(comm.targetSize)} সদস্য বিশিষ্ট "${comm.title}"</b> অনুমোদন ও গঠন করা হলো:
        </p>

        <table class="member-table">
          <thead>
            <tr>
              <th style="width: 7%;">ক্রম</th>
              <th style="width: 28%;">সদস্যের পুরো নাম</th>
              <th style="width: 33%;">মূল পদবি / প্রাতিষ্ঠানিক পরিচিতি</th>
              <th style="width: 18%;">উপকমিটিতে পদবি</th>
              <th style="width: 14%;">স্বাক্ষর</th>
            </tr>
          </thead>
          <tbody>
            ${allMembers.map((m, idx) => `
              <tr>
                <td style="text-align: center; font-weight: 700;">${toBn(idx + 1)}.</td>
                <td style="font-weight: 800; color: #0f172a;">${m.name}</td>
                <td>${m.roleInSchool}</td>
                <td style="font-weight: 800; color: ${m.committeeRole === 'আহবায়ক' ? '#047857' : m.committeeRole === 'সদস্য সচিব' ? '#0369a1' : '#334155'};">
                  ${m.committeeRole}
                </td>
                <td style="text-align: center; height: 32px;"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${comm.tor && comm.tor.length > 0 ? `
          <div class="tor-box">
            <h4>📌 উপকমিটির দায়িত্ব ও কার্যপরিধি (Terms of Reference):</h4>
            <ol>
              ${comm.tor.map(t => `<li>${t}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        <div class="distribution-box">
          <b>অনুলিপি সদয় অবগতি ও প্রয়োজনীয় কার্যার্থে প্রেরিত হলো:</b><br>
          ১. সভাপতি, পরিচালনা কমিটি / এডহক কমিটি, মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়।<br>
          ২. আহবায়ক ও সংশ্লিষ্ট সকল সদস্যবৃন্দ, ${comm.title}।<br>
          ৩. প্রধান শিক্ষক ও সংশ্লিষ্ট সকল বিভাগীয় দপ্তর নথি।
        </div>

        <div class="signatures">
          <div class="sig-col">
            <div class="sig-line">আহবায়ক</div>
            <small class="sig-name">${comm.convenor?.name || 'উপকমিটি আহবায়ক'}</small>
          </div>
          <div class="sig-col">
            <div class="sig-line">সদস্য সচিব</div>
            <small class="sig-name">${comm.members?.find(m => m.committeeRole === 'সদস্য সচিব')?.name || 'সদস্য সচিব'}</small>
          </div>
          <div class="sig-col">
            <div class="sig-line">প্রধান শিক্ষক</div>
            <small class="sig-name">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</small>
          </div>
          <div class="sig-col">
            <div class="sig-line">সভাপতি</div>
            <small class="sig-name">পরিচালনা পর্ষদ / এডহক কমিটি</small>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  // Filtered candidate list for multi-select
  const filteredCandidates = useMemo(() => {
    return candidatePool.filter(p => {
      const matchType = candidateTypeFilter === 'all' || p.type === candidateTypeFilter;
      const matchSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.roleInSchool.toLowerCase().includes(searchFilter.toLowerCase());
      return matchType && matchSearch;
    });
  }, [candidatePool, candidateTypeFilter, searchFilter]);

  // Calculate current total members (Convenor + Members)
  const totalAssigned = (currentComm.convenor ? 1 : 0) + (currentComm.members || []).length;
  const isComplete = totalAssigned === Number(currentComm.targetSize);

  return (
    <div className="subcommittees-admin-panel" style={{ padding: '4px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          fontWeight: 700,
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Main Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #047857 50%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 3px 12px rgba(15,118,110,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.18)', padding: '10px 14px', borderRadius: '10px', fontSize: '26px' }}>
            📋
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
              উপকমিটি পরিষদ (Subcommittees Management)
            </h2>
            <div style={{ fontSize: '12.5px', opacity: 0.9, marginTop: '2px' }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের ১২টি প্রশাসনিক ও একাডেমিক উপকমিটি গঠন, ৩/৫/৭ সদস্য নির্ধারণ ও সনদের প্যাডে প্রিন্ট
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn mini"
            onClick={handleResetAll}
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            🔄 সকল উপকমিটি রিসেট
          </button>
          <button
            type="button"
            className="btn mini"
            onClick={() => handlePrintOfficialPad(currentComm)}
            style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            🖨️ সনদের প্যাডে প্রিন্ট
          </button>
        </div>
      </div>

      {/* 12 Subcommittees Tabs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '8px',
        marginBottom: '18px'
      }}>
        {subcommittees.map((comm) => {
          const isAct = comm.id === activeId;
          const assignedCount = (comm.convenor ? 1 : 0) + (comm.members || []).length;
          const matchTarget = assignedCount === Number(comm.targetSize);

          return (
            <button
              key={comm.id}
              type="button"
              onClick={() => handleSelectSub(comm.id)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: isAct ? '2px solid #047857' : '1px solid #cbd5e1',
                background: isAct ? '#ecfdf5' : '#ffffff',
                color: isAct ? '#065f46' : '#334155',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '6px',
                boxShadow: isAct ? '0 2px 8px rgba(4,120,87,0.15)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{comm.icon || '📑'}</span>
                <span style={{ fontWeight: 800, fontSize: '13px', lineHeight: 1.3 }}>{comm.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{
                  background: matchTarget ? '#dcfce7' : '#fef3c7',
                  color: matchTarget ? '#166534' : '#92400e',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {comm.targetSize} সদস্যের ({assignedCount}/{comm.targetSize})
                </span>
                <span style={{ color: '#64748b', fontSize: '11px' }}>
                  {comm.convenor ? `আহবায়ক: ${comm.convenor.name.split(' ')[0]}` : 'আহবায়কহীন'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Subcommittee Configuration Area */}
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        
        {/* Top Header of Selected Subcommittee */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>{currentComm.icon || '📑'}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#065f46' }}>
                {currentComm.title}
              </h3>
              <small style={{ color: '#64748b', fontSize: '12px' }}>
                {currentComm.memo_no} • {currentComm.session}
              </small>
            </div>
          </div>

          {/* Member Size Selector: 3, 5, 7 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>উপকমিটির সদস্য সংখ্যা:</span>
            {[3, 5, 7].map(size => (
              <label
                key={size}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: Number(currentComm.targetSize) === size ? '#047857' : '#ffffff',
                  color: Number(currentComm.targetSize) === size ? '#ffffff' : '#334155',
                  border: Number(currentComm.targetSize) === size ? '1px solid #047857' : '1px solid #cbd5e1'
                }}
              >
                <input
                  type="radio"
                  name="comm_target_size"
                  checked={Number(currentComm.targetSize) === size}
                  onChange={() => updateCurrentField('targetSize', size)}
                  style={{ display: 'none' }}
                />
                {size} সদস্য বিশিষ্ট
              </label>
            ))}
          </div>
        </div>

        {/* Status Pill & Meta Inputs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          background: '#f8fafc',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
              শিক্ষাবর্ষ / সেশন:
            </label>
            <input
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              value={currentComm.session || ''}
              onChange={e => updateCurrentField('session', e.target.value)}
              placeholder="যেমন: ২০২৬ শিক্ষাবর্ষ"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
              স্মারক নম্বর:
            </label>
            <input
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              value={currentComm.memo_no || ''}
              onChange={e => updateCurrentField('memo_no', e.target.value)}
              placeholder="যেমন: মপাউউবি/উপকমিটি/২০২৬/০১"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
              গঠন / অনুমোদনের তারিখ:
            </label>
            <input
              type="date"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              value={currentComm.formation_date || ''}
              onChange={e => updateCurrentField('formation_date', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              কমিটি গঠন স্থিতি:
            </span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: isComplete ? '#ecfdf5' : '#fffbeb',
              border: isComplete ? '1px solid #a7f3d0' : '1px solid #fde68a',
              color: isComplete ? '#065f46' : '#92400e',
              fontWeight: 800,
              fontSize: '12.5px'
            }}>
              <span>{isComplete ? '✅ পূর্ণাঙ্গ কমিটি' : '⏳ খসড়া / অসম্পূর্ণ'}</span>
              <span style={{ fontSize: '11.5px', opacity: 0.85 }}>({totalAssigned}/{currentComm.targetSize} জন নির্ধারিত)</span>
            </div>
          </div>
        </div>

        {/* TWO DROPDOWNS SECTION: Convenor (Single) & Members (Multi-select with checkboxes) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #047857',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14.5px', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👥 আহবায়ক ও সদস্য নির্বাচনের দুটি ড্রপ-ডাউন</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
              (এন্ট্রিকৃত শিক্ষক ও এডহক/ম্যানেজিং কমিটির সদস্যদের থেকে নির্বাচন করুন)
            </span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            
            {/* 1. আহবায়কের জন্য ড্রপ-ডাউন (Single select) */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '5px' }}>
                ১. আহবায়ক নির্বাচন (ড্রপ-ডাউন):
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #047857',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: '#ffffff',
                  color: '#0f172a'
                }}
                value={currentComm.convenor?.id || currentComm.convenor?.name || ''}
                onChange={e => handleSetConvenor(e.target.value)}
              >
                <option value="">-- আহবায়ক নির্বাচন করুন --</option>
                <optgroup label="👨‍🏫 কর্মরত শিক্ষকবৃন্দ">
                  {candidatePool.filter(p => p.type === 'teacher').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.roleInSchool}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏛️ নিয়মিত ম্যানেজিং কমিটি সদস্যবৃন্দ">
                  {candidatePool.filter(p => p.type === 'regular_committee').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.roleInSchool}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📋 এডহক কমিটি সদস্যবৃন্দ">
                  {candidatePool.filter(p => p.type === 'adhoc_committee').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.roleInSchool}
                    </option>
                  ))}
                </optgroup>
              </select>

              {currentComm.convenor ? (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#065f46' }}>
                      🌟 আহবায়ক: {currentComm.convenor.name}
                    </span>
                    <small style={{ display: 'block', fontSize: '11px', color: '#047857' }}>
                      {currentComm.convenor.roleInSchool} {currentComm.convenor.phone ? `• 📞 ${currentComm.convenor.phone}` : ''}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateCurrentField('convenor', null)}
                    style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    বাদ দিন
                  </button>
                </div>
              ) : (
                <small style={{ color: '#b45309', display: 'block', marginTop: '6px', fontSize: '11.5px' }}>
                  ⚠️ এই উপকমিটিতে এখনও কোনো আহবায়ক নির্ধারিত হয়নি। ড্রপ-ডাউন থেকে একজনকে নির্বাচন করুন।
                </small>
              )}
            </div>

            {/* 2. একাধিক সদস্যের জন্য ড্রপ-ডাউন থেকে টিক চিহ্নের ব্যবস্থা (Multi-select dropdown with checkboxes) */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '5px' }}>
                ২. একাধিক সদস্য নির্বাচন (ড্রপ-ডাউন থেকে টিক চিহ্ন):
              </label>

              <button
                type="button"
                onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: memberDropdownOpen ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1e293b',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <span>
                  ☑️ সদস্য নির্বাচন করুন ({toBn((currentComm.members || []).length)} জন নির্বাচিত)
                </span>
                <span>{memberDropdownOpen ? '▲ বন্ধ করুন' : '▼ খুলুন'}</span>
              </button>

              {/* Multi-select Popover Dropdown */}
              {memberDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  background: '#ffffff',
                  border: '2px solid #0284c7',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  marginTop: '4px',
                  padding: '10px',
                  maxHeight: '340px',
                  overflowY: 'auto'
                }}>
                  {/* Search and Category Filters */}
                  <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="🔍 নাম দিয়ে খুঁজুন..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <select
                      value={candidateTypeFilter}
                      onChange={e => setCandidateTypeFilter(e.target.value)}
                      style={{ padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    >
                      <option value="all">সকল উৎস</option>
                      <option value="teacher">শিক্ষকবৃন্দ</option>
                      <option value="regular_committee">ম্যানেজিং কমিটি</option>
                      <option value="adhoc_committee">এডহক কমিটি</option>
                    </select>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', padding: '2px 4px' }}>
                    টিক চিহ্ন দিন বা তুলুন (আহবায়ক বাদে বাকি সদস্য নির্বাচন করুন):
                  </div>

                  {/* Candidate List with Checkboxes */}
                  <div style={{ display: 'grid', gap: '4px' }}>
                    {filteredCandidates.map(candidate => {
                      const isConvenor = currentComm.convenor?.name === candidate.name;
                      const isChecked = (currentComm.members || []).some(m => m.name === candidate.name);

                      return (
                        <label
                          key={candidate.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '5px',
                            background: isConvenor ? '#fef3c7' : isChecked ? '#ecfdf5' : '#f8fafc',
                            border: isChecked ? '1px solid #10b981' : '1px solid #e2e8f0',
                            cursor: isConvenor ? 'not-allowed' : 'pointer',
                            opacity: isConvenor ? 0.7 : 1
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isConvenor}
                            onChange={() => handleToggleMember(candidate)}
                            style={{ width: '15px', height: '15px', cursor: isConvenor ? 'not-allowed' : 'pointer' }}
                          />
                          <div style={{ flex: 1, fontSize: '12px' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{candidate.name}</span>
                            <small style={{ color: '#64748b', marginLeft: '6px' }}>({candidate.roleInSchool})</small>
                            {isConvenor && (
                              <span style={{ marginLeft: '6px', fontSize: '10.5px', background: '#d97706', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                                আহবায়ক
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{candidate.groupLabel.split(' ')[1]}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn mini"
                      onClick={() => setMemberDropdownOpen(false)}
                      style={{ background: '#0284c7', color: '#fff', fontSize: '11px', padding: '4px 10px' }}
                    >
                      ✓ নির্বাচন সম্পন্ন
                    </button>
                  </div>
                </div>
              )}

              {/* Status Note under Member Select */}
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#475569' }}>
                প্রয়োজন: <b>{toBn(Math.max(0, currentComm.targetSize - (currentComm.convenor ? 1 : 0)))} জন সদস্য</b> (আহবায়ক ছাড়া)
              </div>
            </div>
          </div>
        </div>

        {/* Selected Members Table */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#1e293b' }}>
              📋 উপকমিটির পূর্ণাঙ্গ সদস্য তালিকা ও অর্পিত দায়িত্ব:
            </h4>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              মোট সদস্য: {toBn(totalAssigned)} / {toBn(currentComm.targetSize)} জন
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', width: '5%', textAlign: 'center' }}>ক্রম</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', width: '28%', textAlign: 'left' }}>নাম</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', width: '32%', textAlign: 'left' }}>মূল পদবি / প্রাতিষ্ঠানিক পরিচয়</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', width: '20%', textAlign: 'left' }}>উপকমিটিতে পদবি</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', width: '15%', textAlign: 'center' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: আহবায়ক (if assigned) */}
                {currentComm.convenor ? (
                  <tr style={{ background: '#ecfdf5' }}>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800 }}>১.</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#065f46' }}>
                      🌟 {currentComm.convenor.name}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                      {currentComm.convenor.roleInSchool}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                      <span style={{ background: '#059669', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}>
                        আহবায়ক
                      </span>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => updateCurrentField('convenor', null)}
                        style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕ বাদ দিন
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr style={{ background: '#fffbeb' }}>
                    <td colSpan="5" style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#b45309', fontWeight: 700 }}>
                      ⚠️ কোনো আহবায়ক নির্ধারিত হয়নি। উপরের ড্রপ-ডাউন থেকে আহবায়ক নির্বাচন করুন।
                    </td>
                  </tr>
                )}

                {/* Rows for General Members */}
                {(currentComm.members || []).map((m, idx) => {
                  const sl = (currentComm.convenor ? 2 : 1) + idx;
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>{toBn(sl)}.</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{m.name}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: '#475569' }}>{m.roleInSchool}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                        <select
                          value={m.committeeRole || 'সদস্য'}
                          onChange={e => handleUpdateMemberRole(idx, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700, color: m.committeeRole === 'সদস্য সচিব' ? '#0369a1' : '#334155' }}
                        >
                          <option value="সদস্য">সদস্য</option>
                          <option value="সদস্য সচিব">সদস্য সচিব</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {(currentComm.members || []).length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '14px', textAlign: 'center', color: '#64748b' }}>
                      এখনও কোনো সাধারণ সদস্য নির্বাচন করা হয়নি। ড্রপ-ডাউন থেকে সদস্যবৃন্দ নির্বাচন করে টিক চিহ্ন দিন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms of Reference (ToR / কার্যপরিধি) */}
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#065f46' }}>
              📌 উপকমিটির দায়িত্ব ও কার্যপরিধি (ToR):
            </h4>
            <button
              type="button"
              className="btn mini"
              onClick={handleAddTor}
              style={{ background: '#047857', color: '#fff', fontSize: '11.5px' }}
            >
              + কার্যপরিধি যোগ
            </button>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {(currentComm.tor || []).map((t, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '12.5px', color: '#047857' }}>{toBn(idx + 1)}.</span>
                <input
                  type="text"
                  value={t}
                  onChange={e => handleUpdateTor(idx, e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTor(idx)}
                  style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Save, Print, Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <button
            type="button"
            className="btn mini"
            onClick={handleResetCurrent}
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
          >
            🔄 এই উপকমিটি রিসেট
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn mini"
              onClick={() => handlePrintOfficialPad(currentComm)}
              style={{ background: '#0284c7', color: '#ffffff', fontWeight: 800, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🖨️ সনদের প্যাডে প্রিন্ট করুন (A4)
            </button>
            <button
              type="button"
              className="btn mini"
              onClick={() => {
                saveToStorage(subcommittees);
                showToast(`✓ "${currentComm.title}"-এর সকল তথ্য সফলভাবে সংরক্ষিত হয়েছে!`);
              }}
              style={{ background: '#059669', color: '#ffffff', fontWeight: 800, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              💾 উপকমিটি সংরক্ষণ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SubcommitteesAdminPanel;

