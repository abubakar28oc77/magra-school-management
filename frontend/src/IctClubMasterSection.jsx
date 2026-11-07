import React, { useState, useEffect, useRef } from 'react';
import {
  MOCK_TEACHERS,
  PHOTO_HEAD_TEACHER,
  PHOTO_PRESIDENT,
  getTeacherPhoto,
  getLeadershipData
} from './mockData';
import { ClubCompetitionEngine } from './ClubCompetitionEngine';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// LocalStorage Keys
const ICT_PANEL_KEY = 'magra_ict_club_panel_v1';
const ICT_EXEC_KEY = 'magra_ict_club_exec_v1';
const ICT_ACTIVITIES_KEY = 'magra_ict_activities_v1';
const ICT_QUARTERLY_KEY = 'magra_ict_quarterly_plans_v1';
const ICT_MONTHLY_KEY = 'magra_ict_monthly_calendar_v1';
const ICT_SELECTION_RULES_KEY = 'magra_ict_selection_rules_v1';
const ICT_DISCIPLINE_RULES_KEY = 'magra_ict_discipline_rules_v1';
const ICT_MEMBERSHIPS_KEY = 'magra_ict_club_memberships_v1';
const ICT_SUBMISSIONS_KEY = 'magra_ict_club_submissions_v1';
const ICT_PROJECTS_KEY = 'magra_ict_club_projects_v1';
const ICT_ACHIEVEMENTS_KEY = 'magra_ict_club_achievements_v1';

// Default Coordinators & Judges Data
const DEFAULT_PANEL = {
  coordinators: [
    {
      id: 'coord-1',
      teacherId: 'T06',
      name: 'মোঃ আবুবকর সিদ্দিক',
      designation: 'সহকারী শিক্ষক (কম্পিউটার/আইসিটি)',
      role: 'প্রধান সমন্বয়ক (আইসিটি ও প্রোগ্রামিং)',
      phone: '01710-689846'
    },
    {
      id: 'coord-2',
      teacherId: 'T08',
      name: 'মোঃ হাবিবুর রহমান',
      designation: 'সিনিয়র শিক্ষক (গণিত ও বিজ্ঞান)',
      role: 'সহকারী সমন্বয়ক (রোবটিক্স ও উদ্ভাবন)',
      phone: '01728-046188'
    },
    {
      id: 'coord-3',
      teacherId: 'T14',
      name: 'মোঃ রফিকুল ইসলাম',
      designation: 'সহকারী শিক্ষক (ভৌত বিজ্ঞান)',
      role: 'সহকারী সমন্বয়ক (ডিজিটাল হার্ডওয়্যার ও আইওটি)',
      phone: '01719-274938'
    },
    {
      id: 'coord-4',
      teacherId: 'T12',
      name: 'মোঃ আশরাফুল আলম',
      designation: 'সহকারী শিক্ষক (ইংরেজি)',
      role: 'সহকারী সমন্বয়ক (আন্তর্জাতিক কোডিং ও কনটেন্ট)',
      phone: '01728-531458'
    }
  ],
  chiefJudge: {
    teacherId: 'T06',
    name: 'মোঃ আবুবকর সিদ্দিক',
    designation: 'সহকারী শিক্ষক (কম্পিউটার/আইসিটি)',
    role: 'প্রধান বিচারক (আইসিটি ও কোডিং অলিম্পিয়াড)'
  },
  judge1: {
    teacherId: 'T08',
    name: 'মোঃ হাবিবুর রহমান',
    designation: 'সিনিয়র শিক্ষক (গণিত ও বিজ্ঞান)',
    role: 'বিচারক (কোডিং লজিক ও অ্যালগরিদম)'
  },
  judge2: {
    teacherId: 'T14',
    name: 'মোঃ রফিকুল ইসলাম',
    designation: 'সহকারী শিক্ষক (ভৌত বিজ্ঞান)',
    role: 'বিচারক (প্রযুক্তি মডেল ও ডিজিটাল উদ্ভাবন)'
  }
};

// Default Executive Committee (7 Executive Posts + Multiple General Members)
const DEFAULT_EXEC = {
  president: { name: 'ফারদিন হাসান', class: '১০ম', section: 'বিজ্ঞান', roll: '১', phone: '01711-200101' },
  vicePresident: { name: 'তানভীর আহমেদ', class: '১০ম', section: 'বিজ্ঞান', roll: '৩', phone: '01711-200102' },
  generalSecretary: { name: 'মাহিন সরকার', class: '৯ম', section: 'বিজ্ঞান', roll: '১', phone: '01711-200103' },
  jointSecretary: { name: 'ফাতেমা আক্তার', class: '৯ম', section: 'বিজ্ঞান', roll: '২', phone: '01711-200104' },
  organizingSecretary: { name: 'সিয়াম মাহমুদ', class: '৮ম', section: 'শাখা ক', roll: '১', phone: '01711-200105' },
  publicitySecretary: { name: 'তাহসিন আহমেদ', class: '৮ম', section: 'শাখা ক', roll: '৫', phone: '01711-200106' },
  financeSecretary: { name: 'সানজিদা রহমান', class: '১০ম', section: 'ব্যবসায় শিক্ষা', roll: '৫', phone: '01711-200107' },
  members: [
    { id: 'm-1', name: 'রিফাত হাসান', class: '১০ম', section: 'বিজ্ঞান', roll: '৪', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-2', name: 'সামিউল ইসলাম', class: '৯ম', section: 'মানবিক', roll: '২', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-3', name: 'নাফিসা তাবাসসুম', class: '৯ম', section: 'বিজ্ঞান', roll: '৩', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-4', name: 'আবরার জামিল', class: '৮ম', section: 'শাখা ক', roll: '৩', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-5', name: 'রাহাত কবির', class: '৮ম', section: 'শাখা খ', roll: '২', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-6', name: 'তাসফিয়া জাহান', class: '৭ম', section: 'শাখা ক', roll: '১', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-7', name: 'জাহিদ হাসান', class: '৬ষ্ঠ', section: 'শাখা ক', roll: '১', note: 'কার্যনির্বাহী সদস্য' }
  ]
};

// 10 Regular Activities Defaults
const REGULAR_ACTIVITIES = [
  {
    id: 'act-1',
    num: '১',
    title: 'সাপ্তাহিক আইসিটি সভা',
    focus: 'প্রযুক্তি বিষয়ে আলোচনা',
    time: 'প্রতি মঙ্গলবার বিকাল ৩:৩০ মি.',
    venue: 'শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব',
    details: 'সমসাময়িক তথ্যপ্রযুক্তি, কৃত্রিম বুদ্ধিমত্তা (AI), সাইবার দুনিয়ার সাম্প্রতিক অগ্রগতি ও শিক্ষার্থীদের সাপ্তাহিক প্রজেক্ট আইডিয়া নিয়ে উন্মুক্ত আলোচনা ও মতবিনিময়।'
  },
  {
    id: 'act-2',
    num: '২',
    title: 'কম্পিউটার প্রশিক্ষণ',
    focus: 'ব্যবহারিক কম্পিউটার শিক্ষা',
    time: 'প্রতি বৃহস্পতি ও শনিবার বিকাল ৩:৩০ মি.',
    venue: 'ল্যাব কম্পিউটার স্টেশন (১-২৫)',
    details: 'টাইপিং স্পিড টেস্ট, অফিস অ্যাপ্লিকেশন (Word, Excel, PowerPoint), গুগল ওয়ার্কস্পেস ও ইন্টারনেট ব্রাউজিংয়ের ব্যবহারিক হাতে-কলমে প্রশিক্ষণ।'
  },
  {
    id: 'act-3',
    num: '৩',
    title: 'সাইবার সচেতনতা',
    focus: 'অনলাইন নিরাপত্তা প্রশিক্ষণ',
    time: 'মাসের দ্বিতীয় বুধবার বিকাল ৪:০০ টা',
    venue: 'মাল্টিমিডিয়া অডিটোরিয়াম',
    details: 'মজবুত পাসওয়ার্ড তৈরি, টু-ফ্যাক্টর অথেনটিকেশন, সোশ্যাল মিডিয়ায় প্রাইভেসি রক্ষা, ফিশিং লিংক চেনার উপায় এবং সাইবার বুলিং প্রতিরোধে বিশেষ সেশন।'
  },
  {
    id: 'act-4',
    num: '৪',
    title: 'কুইজ প্রতিযোগিতা',
    focus: 'আইসিটি বিষয়ক কুইজ',
    time: 'মাসের শেষ শনিবার দুপুর ২:৩০ মি.',
    venue: 'শেখ রাসেল ল্যাব প্রজেকশন স্ক্রিন',
    details: 'কম্পিউটার ইতিহাস, হার্ডওয়্যার, নেটওয়ার্কিং, শর্টকাট কি এবং প্রোগ্রামিং ফান্ডামেন্টালসের ওপর রোমাঞ্চকর ডিজিটাল লাইভ কুইজ ও তাৎক্ষণিক সনদ বিতরণ।'
  },
  {
    id: 'act-5',
    num: '৫',
    title: 'ডিজিটাল স্বেচ্ছাসেবা',
    focus: 'বিদ্যালয়ের ডিজিটাল কার্যক্রমে সহায়তা',
    time: 'বিদ্যালয়ের পরীক্ষা ও ভর্তি কার্যক্রম চলাকালীন',
    venue: 'বিদ্যালয় প্রধান কার্যালয় ও ল্যাব',
    details: 'বিদ্যালয়ের ডিজিটাল নোটিশ বোর্ড পরিচালনা, পরীক্ষার রেজাল্ট ডেটা এন্ট্রি সহায়তা, বিজ্ঞান মেলা ও সাংস্কৃতিক অনুষ্ঠানের সাউন্ড-প্রজেক্টর কারিগরি সহায়তা প্রদান।'
  },
  {
    id: 'act-6',
    num: '৬',
    title: 'প্রযুক্তি প্রদর্শনী',
    focus: 'তৈরি করা কাজ প্রদর্শন',
    time: 'প্রতি ত্রৈমাসিকের শেষ সপ্তাহ',
    venue: 'বিদ্যালয় মুক্তমঞ্চ ও করিডোর',
    details: 'শিক্ষার্থীদের তৈরিকৃত ডিজিটাল ব্যানার, পাওয়ারপয়েন্ট অ্যানিমেশন, ওয়েবসাইট মকআপ ও বিজ্ঞানসম্মত সফটওয়্যার ডেমো সকল শিক্ষক ও শিক্ষার্থীর সামনে প্রদর্শন।'
  },
  {
    id: 'act-7',
    num: '৭',
    title: 'ডিজিটাল ডিজাইন',
    focus: 'পোস্টার ও ব্যানার তৈরি',
    time: 'প্রতি বুধবার বিকাল ৩:৪৫ মি.',
    venue: 'ডিজাইন স্টেশন (ফটোশপ ও ক্যানভা)',
    details: 'জাতীয় দিবস, বিদ্যালয়ের সাংস্কৃতিক উৎসব ও ক্লাব ইভেন্টের ডিজিটাল পোস্টার, সোশ্যাল ব্যানার, সার্টিফিকেট ও স্মরণিকা প্রচ্ছদ তৈরির গ্রাফিক্স কর্মশালা।'
  },
  {
    id: 'act-8',
    num: '৮',
    title: 'কোডিং অনুশীলন',
    focus: 'সহজ প্রোগ্রাম তৈরি',
    time: 'প্রতি সোমবার ও শুক্রবার বিকাল ৪:০০ টা',
    venue: 'কোডিং কর্নার (ল্যাব স্টেশন)',
    details: 'স্ক্র্যাচ ব্লক প্রোগ্রামিং দিয়ে ভিজ্যুয়াল গেম ডেভেলপমেন্ট, পাইথনে ভ্যারিয়েবল ও লুপসের প্রাথমিক কোড লেখা এবং এইচটিএমএল-সিএসএস দিয়ে ওয়েব পেজ ডিজাইন।'
  },
  {
    id: 'act-9',
    num: '৯',
    title: 'ডিজিটাল উদ্ভাবন',
    focus: 'শিক্ষার্থীদের প্রযুক্তিগত প্রকল্প',
    time: 'শনিবার সকাল ১০:০০ টা (সাপ্তাহিক প্রজেক্ট আওয়ার)',
    venue: 'ইনোভেশন হাব ও সায়েন্স কর্নার',
    details: 'বাস্তব জীবনের সমস্যা সমাধানে শিক্ষার্থীদের আইডিয়া যাচাই—যেমন ডিজিটাল লাইব্রেরি ফাইন্ডার, স্মার্ট ক্লাসরুম মনিটরিং ও স্বয়ংক্রিয় নোটিশ বোর্ড তৈরি।'
  },
  {
    id: 'act-10',
    num: '১০',
    title: 'রোবটিক্স কর্মশালা',
    focus: 'সহজ রোবট ও ইলেকট্রনিক্স প্রকল্প',
    time: 'মাসের ১ম ও ৩য় রবিবার বিকাল ৩:৩০ মি.',
    venue: 'রোবটিক্স ও ইলেকট্রনিক্স ওয়ার্কবেঞ্চ',
    details: 'আরডুইনো (Arduino) বেসিকস, সেন্সর (Ultrasonic, IR, LDR), এলইডি সার্কিট এবং বাধা সনাক্তকারী স্বয়ংক্রিয় রোবট গাড়ি তৈরির বাস্তব কর্মশালা।'
  }
];

// Quarterly Plans Defaults
const QUARTERLY_PLANS = [
  {
    id: 'q-1',
    quarter: 'জানুয়ারি–মার্চ',
    title: 'সদস্য সংগ্রহ, ভিত্তি প্রশিক্ষণ ও কুইজ',
    color: '#0284c7',
    items: [
      '৬ষ্ঠ-১০ম শ্রেণির শিক্ষার্থীদের থেকে নতুন সদস্য নিবন্ধন গ্রহণ ও যাচাই-বাছাই',
      'আইসিটি ক্লাবের নতুন কার্যনির্বাহী পরিষদ ২০২৬ গঠন ও দায়িত্ব হস্তান্তর',
      'কম্পিউটার ফান্ডামেন্টালস ও শেখ রাসেল ডিজিটাল ল্যাব পরিচিতি কর্মশালা',
      'আন্তর্জাতিক মাতৃভাষা দিবস উপলক্ষে "ডিজিটাল ভাষায় একুশ" পোস্টার ও কুইজ প্রতিযোগিতা',
      'অফিস অ্যাপ্লিকেশন (MS Word & PowerPoint) বেসিক প্রশিক্ষণ কোর্স'
    ]
  },
  {
    id: 'q-2',
    quarter: 'এপ্রিল–জুন',
    title: 'দক্ষতা উন্নয়ন, ডিজিটাল ডিজাইন ও বিতর্ক',
    color: '#0369a1',
    items: [
      'বাংলা ও ইংরেজি দ্রুত টাইপিং কর্মশালা ও স্কুল স্পিড টাইপিং কনটেস্ট',
      'ডিজিটাল গ্রাফিক্স ও পোস্টার মেকিং (Canva & Photoshop) নিবিড় ক্যাম্প',
      'আইসিটি বিষয়ক আন্তঃশ্রেণি বিতর্ক প্রতিযোগিতা: "AI বনাম মানব মেধা"',
      'ওয়েব ডেভেলপমেন্ট পরিচিতি: এইচটিএমএল ও সিএসএস দিয়ে নিজের পরিচিতি পেজ তৈরি',
      'অর্ধবার্ষিক পরীক্ষার ডিজিটাল মার্কশিট প্রক্রিয়াকরণে ক্লাব সদস্যদের সহায়তা'
    ]
  },
  {
    id: 'q-3',
    quarter: 'জুলাই–সেপ্টেম্বর',
    title: 'সাইবার নিরাপত্তা, পাইথন কোডিং ও রোবটিক্স',
    color: '#0d9488',
    items: [
      'জাতীয় সাইবার নিরাপত্তা সচেতনতা মাস ও সেফ ইন্টারনেট কর্মশালা',
      'পাইথন প্রোগ্রামিং বুটক্যাম্প: লজিক বিল্ডিং ও কন্ডিশনাল স্টেটমেন্টস',
      'স্ক্র্যাচ গেম মেকিং অলিম্পিয়াড (৬ষ্ঠ-৮ম শ্রেণি)',
      'রোবটিক্স ও আরডুইনো হ্যান্ডস-অন সেশন: সেন্সর ও স্মার্ট লাইটিং প্রজেক্ট',
      'আন্তঃক্লাব প্রযুক্তি মেধা কুইজ ও সনদ বিতরণ'
    ]
  },
  {
    id: 'q-4',
    quarter: 'অক্টোবর–ডিসেম্বর',
    title: 'আইসিটি মেলা, প্রজেক্ট শোকেস ও বার্ষিক মূল্যায়ন',
    color: '#4f46e5',
    items: [
      'বার্ষিক মগড়া আইসিটি ফেয়ার ও প্রযুক্তি উদ্ভাবন মেলা ২০২৬ আয়োজন',
      'শিক্ষার্থীদের স্বয়ংক্রিয় সফটওয়্যার, অ্যাপস ও রোবট মডেলের লাইভ স্টল প্রদর্শন',
      'আইসিটি বিতর্ক ও কোডিং অলিম্পিয়াডের গ্র্যান্ড ফাইনাল ও ক্রেস্ট প্রদান',
      'শ্রেষ্ঠ খুদে কোডার ও সক্রিয় ডিজিটাল ভলান্টিয়ার অ্যাওয়ার্ড ২০২৬ প্রদান',
      'সদস্যপদ নবায়ন ও পরবর্তী শিক্ষাবর্ষের অ্যাকশন প্ল্যান অনুমোদন'
    ]
  }
];

// 12 Months Calendar Defaults
const MONTHLY_CALENDAR = [
  { id: 'm-1', month: 'জানুয়ারি', title: 'সদস্যপদ আহ্বান ও ওরিয়েন্টেশন', date: '১৫ জানুয়ারি', coordinator: 'মোঃ আবুবকর সিদ্দিক' },
  { id: 'm-2', month: 'ফেব্রুয়ারি', title: 'ডিজিটাল একুশ পোস্টার প্রতিযোগিতা', date: '২০ ফেব্রুয়ারি', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-3', month: 'মার্চ', title: 'কম্পিউটার ফান্ডামেন্টালস প্রশিক্ষণ', date: '১২ মার্চ', coordinator: 'মোঃ আবুবকর সিদ্দিক' },
  { id: 'm-4', month: 'এপ্রিল', title: 'বাংলা ও ইংরেজি টাইপিং অলিম্পিয়াড', date: '১৮ এপ্রিল', coordinator: 'মোঃ আবুবকর সিদ্দিক' },
  { id: 'm-5', month: 'মে', title: 'গ্রাফিক্স ডিজাইন ও ডিজিটাল ব্যানার কর্মশালা', date: '১৪ মে', coordinator: 'মোঃ রফিকুল ইসলাম' },
  { id: 'm-6', month: 'জুন', title: 'আইসিটি বিতর্ক প্রতিযোগিতা (AI বিতর্ক)', date: '১০ জুন', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-7', month: 'জুলাই', title: 'পাইথন কোডিং বুটক্যাম্প (পর্ব ১)', date: '১৬ জুলাই', coordinator: 'মোঃ আবুবকর সিদ্দিক' },
  { id: 'm-8', month: 'আগস্ট', title: 'সাইবার নিরাপত্তা ও নিরাপদ ইন্টারনেট ক্যাম্প', date: '২২ আগস্ট', coordinator: 'মোঃ হাবিবুর রহমান' },
  { id: 'm-9', month: 'সেপ্টেম্বর', title: 'আরডুইনো রোবটিক্স হ্যান্ডস-অন কর্মশালা', date: '১৯ সেপ্টেম্বর', coordinator: 'মোঃ রফিকুল ইসলাম' },
  { id: 'm-10', month: 'অক্টোবর', title: 'বার্ষিক প্রযুক্তি মেলা ও প্রজেক্ট প্রদর্শনী', date: '২৪ অক্টোবর', coordinator: 'মোঃ আবুবকর সিদ্দিক ও কমিটি' },
  { id: 'm-11', month: 'নভেম্বর', title: 'কোডিং অলিম্পিয়াড ও কুইজ ফাইনাল', date: '১৫ নভেম্বর', coordinator: 'মোঃ হাবিবুর রহমান' },
  { id: 'm-12', month: 'ডিসেম্বর', title: 'বার্ষিক মূল্যায়ন ও ট্রফি বিতরণী উৎসব', date: '০৫ ডিসেম্বর', coordinator: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)' }
];

// 6 Selection Rules (Default)
const SELECTION_RULES = [
  {
    id: 'sr-1',
    num: '১',
    title: 'শ্রেণিগত যোগ্যতা',
    text: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের ষষ্ঠ থেকে দশম শ্রেণির সকল নিয়মিত শিক্ষার্থী সদস্য পদের জন্য আবেদন করতে পারবে।'
  },
  {
    id: 'sr-2',
    num: '২',
    title: 'আগ্রহ ও প্রযুক্তির প্রতি টান',
    text: 'কম্পিউটার, ইন্টারনেট, কোডিং ও বিজ্ঞানের নিত্যনতুন প্রযুক্তিতে আগ্রহী ও উদ্ভাবনী মনোভাবসম্পন্ন শিক্ষার্থীদের অগ্রাধিকার দেওয়া হবে।'
  },
  {
    id: 'sr-3',
    num: '৩',
    title: 'পূর্ব অভিজ্ঞতার বাধ্যবাধকতা নেই',
    text: 'আবেদনের জন্য পূর্বে কম্পিউটার জানা বাধ্যতামূলক নয়; ক্লাবের লক্ষ্যই হলো শূন্য থেকে প্রতিটি শিক্ষার্থীকে ব্যবহারিক দক্ষতায় দক্ষ করে তোলা।'
  },
  {
    id: 'sr-4',
    num: '৪',
    title: 'লিঙ্গ সমতা ও সমান সুযোগ',
    text: 'ছেলে ও মেয়ে উভয় শিক্ষার্থীর ক্লাবের প্রতিটি প্রশিক্ষণ, পদ ও প্রতিযোগিতায় ৫০:৫০ সমান সুযোগ ও সক্রিয় অংশগ্রহণ নিশ্চিত করা হবে।'
  },
  {
    id: 'sr-5',
    num: '৫',
    title: 'দক্ষতা ও বিভাগভিত্তিক দায়িত্ব',
    text: 'শিক্ষার্থীর নিজস্ব মেধা ও আগ্রহ অনুসারে কোডিং উইং, গ্রাফিক্স উইং, রোবটিক্স উইং, সাইবার নিরাপত্তা উইং বা মিডিয়া উইংয়ে অর্পিত দায়িত্ব দেওয়া হবে।'
  },
  {
    id: 'sr-6',
    num: '৬',
    title: 'বার্ষিক সদস্যপদ নবায়ন',
    text: 'প্রতি শিক্ষাবর্ষের শুরুতে ক্লাবের শৃঙ্খলা রক্ষা, নিয়মিত প্রশিক্ষণ উপস্থিতি ও ক্লাবের সক্রিয়তায় অবদান সাপেক্ষে সদস্যপদ স্বয়ংক্রিয়ভাবে নবায়নযোগ্য।'
  }
];

// 7 Discipline & Lab Safety Rules (Default)
const DISCIPLINE_RULES = [
  {
    id: 'dr-1',
    num: '১',
    rule: 'অনুমতি ব্যতীত ব্যবহার নিষিদ্ধ',
    desc: 'আইসিটি শিক্ষক বা ক্লাব সমন্বয়কের প্রত্যক্ষ অনুমতি ও তত্ত্বাবধান ছাড়া কোনো কম্পিউটার, প্রজেক্টর, আরডুইনো বা ল্যাব যন্ত্রপাতি স্পর্শ করা বা চালু করা সম্পূর্ণ নিষেধ।'
  },
  {
    id: 'dr-2',
    num: '২',
    rule: 'অননুমোদিত সফটওয়্যার ও গেম ইনস্টলেশনে নিষেধাজ্ঞা',
    desc: 'বিদ্যালয়ের শেখ রাসেল ল্যাবের কম্পিউটারে কোনো প্রকার অননুমোদিত গেম, ক্ষতিকর ফাইল বা ক্র্যাক সফটওয়্যার ইনস্টল করা যাবে না।'
  },
  {
    id: 'dr-3',
    num: '৩',
    rule: 'ব্যক্তিগত তথ্য ও অ্যাকাউন্টের গোপনীয়তা',
    desc: 'অন্য কোনো সহপাঠী বা শিক্ষকের ব্যক্তিগত তথ্য, ফাইল, সোশ্যাল মিডিয়া আইডি, ইমেইল বা পাসওয়ার্ড জানার চেষ্টা করা অথবা অনুমতি ছাড়া প্রবেশ করা শাস্তিযোগ্য অপরাধ।'
  },
  {
    id: 'dr-4',
    num: '৪',
    rule: 'সাইবার বুলিং ও অপপ্রচার শূন্য সহনশীলতা',
    desc: 'অনলাইনে কোনো সহপাঠীকে হেয় করা, ট্রোলিং, সাইবার বুলিং, গুজব ছড়ানো কিংবা ভুয়া তথ্য প্রচারের প্রমাণ পেলে তাৎক্ষণিক সদস্যপদ বাতিল ও বিদ্যালয়ে শাস্তিমূলক ব্যবস্থা গ্রহণ করা হবে।'
  },
  {
    id: 'dr-5',
    num: '৫',
    rule: 'AI এর সততাপূর্ণ ও দায়িত্বশীল ব্যবহার',
    desc: 'কৃত্রিম বুদ্ধিমত্তা (AI) ব্যবহার করে তৈরি কোনো কোড, লেখা বা ডিজাইনকে নিজের মৌলিক উদ্ভাবন বা মেধা বলে দাবি করা যাবে না; AI সহায়তার উৎস স্পষ্টভাবে উল্লেখ করতে হবে।'
  },
  {
    id: 'dr-6',
    num: '৬',
    rule: 'নিরাপদ ইন্টারনেট ব্রাউজিং নির্দেশিকা',
    desc: 'ইন্টারনেট ব্যবহারের ক্ষেত্রে শুধুমাত্র নির্ধারিত শিক্ষা, গবেষণা ও প্রোগ্রামিং ওয়েবসাইট ভিজিট করতে হবে। অনুপযুক্ত কোনো কনটেন্টে প্রবেশ নিষিদ্ধ।'
  },
  {
    id: 'dr-7',
    num: '৭',
    rule: 'ল্যাব সম্পদ ও যন্ত্রপাতির সুরক্ষায় যত্নশীলতা',
    desc: 'কম্পিউটার মাউস, কীবোর্ড, হেডফোন, ইউপিএস ও রোবটিক্স কিট ব্যবহারের পর সুশৃঙ্খলভাবে নির্ধারিত স্থানে গুছিয়ে রাখতে হবে এবং ল্যাবের পরিচ্ছন্নতা রক্ষা করতে হবে।'
  }
];

// Default Submissions (Banners, Posters, Code)
const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub-1',
    student_name: 'ফারদিন হাসান',
    class_name: '১০ম',
    section: 'বিজ্ঞান',
    roll: '১',
    type: 'ডিজিটাল ব্যানার',
    title: 'স্মার্ট বাংলাদেশ ও আগামী প্রজন্মের ভবিষ্যৎ',
    summary: 'ফটোশপ ও ক্যানভা দিয়ে নির্মিত আধুনিক বাংলাদেশের রূপরেখা ও ডিজিটাল শিক্ষার আলোকচ্ছটা সমন্বিত প্রাতিষ্ঠানিক ডিজিটাল ব্যানার।',
    file_name: 'smart_bangladesh_banner_2026.png',
    file_size: '2.4 MB',
    file_type: 'image/png',
    status: 'অনুমোদিত',
    date: '২৪ অক্টোবর, ২০২৬'
  },
  {
    id: 'sub-2',
    student_name: 'নাফিসা তাবাসসুম',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll: '৩',
    type: 'সাইবার নিরাপত্তা পোস্টার',
    title: 'পাসওয়ার্ড হোক শক্তিশালী: নিরাপদ ইন্টারনেটের ৭ উপায়',
    summary: 'শিক্ষার্থীদের সচেতন করতে ফিশিং সচেতনতা ও নিরাপদ পাসওয়ার্ড তৈরির নির্দেশিকা সংবলিত তথ্যবহুল ইনফোগ্রাফিক পোস্টার।',
    file_name: 'cyber_safety_tips_poster.pdf',
    file_size: '1.8 MB',
    file_type: 'application/pdf',
    status: 'অনুমোদিত',
    date: '২২ আগস্ট, ২০২৬'
  },
  {
    id: 'sub-3',
    student_name: 'সিয়াম মাহমুদ',
    class_name: '৮ম',
    section: 'শাখা ক',
    roll: '১',
    type: 'পাইথন স্ক্রিপ্ট',
    title: 'মগড়া স্কুল ডিজিটাল রেজাল্ট ক্যালকুলেটর (CLI)',
    summary: 'পাইথনের মাধ্যমে শিক্ষার্থীর বিষয়ভিত্তিক নম্বর ইনপুট নিয়ে জিপিএ ও গ্রেড পয়েন্ট স্বয়ংক্রিয় গণনা করার সহজ পাইথন কোড।',
    file_name: 'gpa_calculator.py',
    file_size: '14.2 KB',
    file_type: 'text/plain',
    status: 'অনুমোদিত',
    date: '১৬ জুলাই, ২০২৬'
  }
];

// Default ICT Fair Projects
const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    team: 'স্মার্ট এগ্রো টিমস (৯ম শ্রেণি)',
    leader: 'মাহিন সরকার',
    members: 'ফাতেমা আক্তার, রিফাত হাসান',
    title: 'স্বয়ংক্রিয় কৃষি সেচ ব্যবস্থা (Arduino IoT)',
    category: 'রোবটিক্স ও আইওটি',
    stall: 'স্টল নং-১ (হলরুম)',
    desc: 'মাটিতে আর্দ্রতা কমে গেলে স্বয়ংক্রিয়ভাবে পানির পাম্প চালু হবে এবং মোবাইলে এসএমএস অ্যালার্ট পাঠাবে। এতে কৃষকের শ্রম ও পানির অপচয় বাঁচবে।'
  },
  {
    id: 'proj-2',
    team: 'গ্রিন এনার্জি স্কোয়াড (১০ম শ্রেণি)',
    leader: 'ফারদিন হাসান',
    members: 'তানভীর আহমেদ, সানজিদা রহমান',
    title: 'সৌরশক্তি চালিত স্বয়ংক্রিয় ক্লাসরুম লাইটিং',
    category: 'গ্রিন টেকনোলজি ও অটোমেশন',
    stall: 'স্টল নং-২ (হলরুম)',
    desc: 'শ্রেণিকক্ষে মানুষ প্রবেশ করলে সেন্সরের মাধ্যমে স্বয়ংক্রিয় বাতি জ্বলবে এবং বের হয়ে গেলে বিদ্যুৎ সাশ্রয়ে স্বয়ংক্রিয়ভাবে বন্ধ হবে।'
  },
  {
    id: 'proj-3',
    team: 'কোড মাস্টার্স (৮ম শ্রেণি)',
    leader: 'সিয়াম মাহমুদ',
    members: 'তাহসিন আহমেদ, আবরার জামিল',
    title: 'মগড়া হেরিটেজ ও হিস্ট্রি ভার্চুয়াল ট্যুর ওয়েব প্ল্যাটফর্ম',
    category: 'ওয়েব ডেভেলপমেন্ট ও সফটওয়্যার',
    stall: 'স্টল নং-৩ (ল্যাব কর্নার)',
    desc: 'বিদ্যালয়ের ইতিহাস, শিক্ষক পরিচিতি ও ঐতিহ্যবাহী দর্শনীয় স্থান ভার্চুয়ালি প্রদর্শনকারী রেসপনসিভ ওয়েব অ্যাপ্লিকেশন।'
  }
];

// Default Achievements
const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'ach-1',
    year: '২০২৫',
    event: 'উপজেলা ডিজিটাল উদ্ভাবনী মেলা ২০২৫',
    award: '১ম স্থান (চ্যাম্পিয়ন)',
    project: 'স্মার্ট স্কুল অটোমেশন মডেল',
    recipients: 'ফারদিন হাসান ও টিম আইসিটি',
    badge: '🏆 উপজেলা চ্যাম্পিয়ন'
  },
  {
    id: 'ach-2',
    year: '২০২৪',
    event: 'জাতীয় শিশু-কিশোর প্রোগ্রামিং প্রতিযোগিতা',
    award: '২য় স্থান (রানার্স আপ - বিভাগীয় পর্যায়)',
    project: 'স্ক্র্যাচ কোডিং গেম ডেভেলপমেন্ট',
    recipients: 'তানভীর আহমেদ ও সিয়াম মাহমুদ',
    badge: '🥈 বিভাগীয় রানার্স আপ'
  },
  {
    id: 'ach-3',
    year: '২০২৪',
    event: 'বাংলাদেশ জাতীয় রোবটিক্স অলিম্পিয়াড',
    award: 'বিশেষ জুরি সম্মাননা ও মেডেল',
    project: 'বাধা সনাক্তকারী স্মার্ট আল্ট্রাসনিক কার',
    recipients: 'মাহিন সরকার ও রিফাত হাসান',
    badge: '🏅 জুরি এক্সিলেন্স'
  },
  {
    id: 'ach-4',
    year: '২০২৬',
    event: 'জেলা সাইবার নিরাপত্তা সচেতনতা কুইজ',
    award: '১ম স্থান ও শ্রেষ্ঠ বক্তা পুরস্কার',
    project: 'অনলাইন সুরক্ষা ও সোশ্যাল মিডিয়া এওয়ারনেস',
    recipients: 'ফাতেমা আক্তার',
    badge: '🥇 জেলা চ্যাম্পিয়ন'
  }
];

// 13 Distinct Features Definition
const ICT_FEATURES = [
  { key: 'identity', num: '১', label: 'ক্লাব পরিচিতি', icon: '🏛️' },
  { key: 'objectives', num: '২', label: 'মূল লক্ষ্য ও উদ্দেশ্য', icon: '🎯' },
  { key: 'coordinators', num: '৩', label: 'সমন্বয়ক ও বিচারক প্যানেল', icon: '👨‍🏫' },
  { key: 'executive', num: '৪', label: 'কার্যনির্বাহী পরিষদ', icon: '👥' },
  { key: 'regular_activities', num: '৫', label: 'নিয়মিত কার্যক্রম', icon: '⚡' },
  { key: 'yearly_calendar', num: '৬', label: 'বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার', icon: '📅' },
  { key: 'selection_rules', num: '৭', label: 'সদস্য নির্বাচনের নিয়ম', icon: '📜' },
  { key: 'membership', num: '৮', label: 'আবেদন গ্রহণ ও সদস্য নির্বাচন', icon: '📝' },
  { key: 'discipline_safety', num: '৯', label: 'শৃঙ্খলা ও নিরাপত্তাবিধি', icon: '🛡️' },
  { key: 'competitions', num: '১০', label: 'কুইজ/বিতর্ক প্রতিযোগিতা ও ফলাফল', icon: '🏆' },
  { key: 'digital_showcase', num: '১১', label: 'ডিজিটাল ব্যানার ও পোষ্টার প্রকাশ', icon: '🎨' },
  { key: 'ict_fair', num: '১২', label: 'আইসিটি মেলার আয়োজন', icon: '🚀' },
  { key: 'achievements', num: '১৩', label: 'অর্জন ও ট্রফি গ্যালারি', icon: '🏅' }
];

export function IctClubMasterSection({
  teachers = [],
  onBackToHub,
  initialTab = 'identity'
}) {
  const mapInitialTab = (tab) => {
    if (!tab) return 'identity';
    if (tab === 'overview') return 'identity';
    if (tab === 'advisors') return 'coordinators';
    if (tab === 'competitions') return 'competitions';
    if (tab === 'software' || tab === 'kisholoy') return 'digital_showcase';
    if (tab === 'calendar') return 'yearly_calendar';
    if (tab === 'gallery') return 'achievements';
    if (tab === 'apply') return 'membership';
    if (tab === 'write') return 'digital_showcase';
    if (tab === 'fair') return 'ict_fair';
    return tab;
  };

  const [ictTab, setIctTab] = useState(() => mapInitialTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setIctTab(mapInitialTab(initialTab));
    }
  }, [initialTab]);

  const activeTeachers = teachers && teachers.length ? teachers : MOCK_TEACHERS;

  // Teacher Photo Resolver (pulls direct raster photo from teacher entry form or IDB custom vault)
  const getResolvedTeacherPhoto = (teacherId, teacherName) => {
    if (!activeTeachers || !activeTeachers.length) return getTeacherPhoto(null);
    let found = null;
    if (teacherId) {
      found = activeTeachers.find(t =>
        t && (
          String(t.id) === String(teacherId) ||
          String(t.teacher_id) === String(teacherId) ||
          String(t.employee_id) === String(teacherId)
        )
      );
    }
    if (!found && teacherName) {
      const cleanName = String(teacherName).trim().toLowerCase();
      found = activeTeachers.find(t => {
        if (!t) return false;
        const bn = (t.name_bn || '').trim().toLowerCase();
        const en = (t.name_en || t.name || '').trim().toLowerCase();
        return bn === cleanName || en === cleanName || cleanName.includes(bn) || (bn && bn.includes(cleanName));
      });
    }
    if (!found && typeof teacherId === 'object' && teacherId !== null) {
      found = teacherId;
    }
    return getTeacherPhoto(found);
  };

  const leadershipInfo = getLeadershipData(undefined, activeTeachers);
  const resolvedPresidentPhoto = leadershipInfo.president?.photo || PHOTO_PRESIDENT;
  const resolvedHeadPhoto = leadershipInfo.head?.photo || PHOTO_HEAD_TEACHER;

  // Panel State (Coordinators & Judges)
  const [panelData, setPanelData] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_PANEL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_PANEL;
  });

  const persistPanel = (updated) => {
    try {
      localStorage.setItem(ICT_PANEL_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Executive Committee State
  const [execData, setExecData] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_EXEC_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_EXEC;
  });

  const persistExec = (updated) => {
    try {
      localStorage.setItem(ICT_EXEC_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Regular Activities State
  const [activities, setActivities] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_ACTIVITIES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return REGULAR_ACTIVITIES;
  });

  const persistActivities = (updated) => {
    try {
      localStorage.setItem(ICT_ACTIVITIES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Quarterly Plans State
  const [quarterlyPlans, setQuarterlyPlans] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_QUARTERLY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return QUARTERLY_PLANS;
  });

  const persistQuarterlyPlans = (updated) => {
    try {
      localStorage.setItem(ICT_QUARTERLY_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Monthly Calendar State
  const [monthlyCalendar, setMonthlyCalendar] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_MONTHLY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return MONTHLY_CALENDAR;
  });

  const persistMonthlyCalendar = (updated) => {
    try {
      localStorage.setItem(ICT_MONTHLY_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Selection Rules State
  const [selectionRules, setSelectionRules] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_SELECTION_RULES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return SELECTION_RULES;
  });

  const persistSelectionRules = (updated) => {
    try {
      localStorage.setItem(ICT_SELECTION_RULES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Discipline & Safety Rules State
  const [disciplineRules, setDisciplineRules] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_DISCIPLINE_RULES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DISCIPLINE_RULES;
  });

  const persistDisciplineRules = (updated) => {
    try {
      localStorage.setItem(ICT_DISCIPLINE_RULES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Memberships State
  const [memberships, setMemberships] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_MEMBERSHIPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        trackingId: 'ICT-2026-0101',
        student_name: 'ফারদিন হাসান',
        class_name: '১০ম',
        section: 'বিজ্ঞান',
        roll_no: '১',
        guardian_name: 'মোঃ রফিকুল ইসলাম',
        mobile: '01711-200101',
        interests: 'কোডিং ও প্রোগ্রামিং (Python & Web)',
        device_access: 'ল্যাপটপ ও স্মার্টফোন আছে',
        status: 'অনুমোদিত',
        date: '২০২৬-০১-১৮'
      },
      {
        trackingId: 'ICT-2026-0102',
        student_name: 'নাফিসা তাবাসসুম',
        class_name: '৯ম',
        section: 'বিজ্ঞান',
        roll_no: '৩',
        guardian_name: 'মোঃ মোস্তাফিজুর রহমান',
        mobile: '01711-200103',
        interests: 'সাইবার নিরাপত্তা ও ডিজিটাল পোস্টার',
        device_access: 'বিদ্যালয়ের শেখ রাসেল ল্যাবে অনুশীলন',
        status: 'অনুমোদিত',
        date: '২০২৬-০১-২০'
      },
      {
        trackingId: 'ICT-2026-0103',
        student_name: 'আবরার জামিল',
        class_name: '৮ম',
        section: 'শাখা ক',
        roll_no: '৩',
        guardian_name: 'মোঃ জামিল হোসেন',
        mobile: '01711-200105',
        interests: 'রোবটিক্স ও আরডুইনো হার্ডওয়্যার',
        device_access: 'স্মার্টফোন আছে',
        status: 'অপেক্ষমান',
        date: '২০২৬-০২-০৫'
      }
    ];
  });

  const persistMemberships = (updated) => {
    try {
      localStorage.setItem(ICT_MEMBERSHIPS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Submissions State (Digital Banners, Posters, Code)
  const [submissions, setSubmissions] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_SUBMISSIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SUBMISSIONS;
  });

  const persistSubmissions = (updated) => {
    try {
      localStorage.setItem(ICT_SUBMISSIONS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Fair Projects State
  const [projects, setProjects] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_PROJECTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_PROJECTS;
  });

  const persistProjects = (updated) => {
    try {
      localStorage.setItem(ICT_PROJECTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Achievements State
  const [achievements, setAchievements] = useState(() => {
    try {
      const raw = localStorage.getItem(ICT_ACHIEVEMENTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_ACHIEVEMENTS;
  });

  const persistAchievements = (updated) => {
    try {
      localStorage.setItem(ICT_ACHIEVEMENTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Toast State
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Section options based on Class
  const getSectionOptionsForClass = (cls) => {
    const isNineOrTen = cls === '৯' || cls === '১০' || cls === '৯ম' || cls === '১০ম';
    if (isNineOrTen) {
      return [
        { value: 'বিজ্ঞান', label: 'বিজ্ঞান (Science)' },
        { value: 'মানবিক', label: 'মানবিক (Humanities)' },
        { value: 'ব্যবসায় শিক্ষা', label: 'ব্যবসায় শিক্ষা (Business Studies)' },
        { value: 'শাখা ক', label: 'শাখা ক' },
        { value: 'শাখা খ', label: 'শাখা খ' }
      ];
    }
    return [
      { value: 'শাখা ক', label: 'শাখা ‘ক’' },
      { value: 'শাখা খ', label: 'শাখা ‘খ’' },
      { value: 'সাধারণ', label: 'সাধারণ / প্রযোজ্য নয়' }
    ];
  };

  // Add Coordinator State
  const [newCoordTeacherId, setNewCoordTeacherId] = useState(activeTeachers[0]?.id || 'T06');
  const [newCoordRole, setNewCoordRole] = useState('সহকারী সমন্বয়ক (আইসিটি ও ডিজিটাল ল্যাব)');
  const [newCoordPhone, setNewCoordPhone] = useState('01710-000000');

  // Edit Coordinator Modal
  const [editingCoordinator, setEditingCoordinator] = useState(null);
  const [coordEditForm, setCoordEditForm] = useState({ id: '', name: '', designation: '', role: '', phone: '' });

  // Add Executive Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberClass, setNewMemberClass] = useState('৮ম');
  const [newMemberSection, setNewMemberSection] = useState('শাখা ক');
  const [newMemberRoll, setNewMemberRoll] = useState('');

  const handleMemberClassChange = (cls) => {
    setNewMemberClass(cls);
    if (cls === '৯ম' || cls === '১০ম') {
      if (!['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'].includes(newMemberSection)) {
        setNewMemberSection('বিজ্ঞান');
      }
    } else {
      if (!['শাখা ক', 'শাখা খ', 'সাধারণ'].includes(newMemberSection)) {
        setNewMemberSection('শাখা ক');
      }
    }
  };

  // Edit Executive Member Modal
  const [editingExecMember, setEditingExecMember] = useState(null);
  const [memberEditForm, setMemberEditForm] = useState({ id: '', name: '', class: '৮ম', section: 'শাখা ক', roll: '' });

  // Edit Executive Post Modal
  const [editingExecPost, setEditingExecPost] = useState(null);
  const [execEditForm, setExecEditForm] = useState({ name: '', class: '১০ম', section: 'বিজ্ঞান', roll: '', phone: '' });

  // EDIT REGULAR ACTIVITY MODAL STATE
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityEditForm, setActivityEditForm] = useState({
    id: '',
    num: '',
    title: '',
    focus: '',
    time: '',
    venue: '',
    details: ''
  });

  // EDIT QUARTERLY ROADMAP MODAL STATE
  const [editingQuarter, setEditingQuarter] = useState(null);
  const [quarterEditForm, setQuarterEditForm] = useState({
    id: '',
    quarter: '',
    title: '',
    color: '#0284c7',
    itemsText: ''
  });

  // EDIT MONTHLY CALENDAR MODAL STATE
  const [editingMonth, setEditingMonth] = useState(null);
  const [monthEditForm, setMonthEditForm] = useState({
    id: '',
    month: '',
    title: '',
    date: '',
    coordinator: ''
  });

  // EDIT SELECTION RULE MODAL STATE
  const [editingSelectionRule, setEditingSelectionRule] = useState(null);
  const [selectionRuleEditForm, setSelectionRuleEditForm] = useState({
    id: '',
    num: '',
    title: '',
    text: ''
  });

  // EDIT DISCIPLINE RULE MODAL STATE
  const [editingDisciplineRule, setEditingDisciplineRule] = useState(null);
  const [disciplineRuleEditForm, setDisciplineRuleEditForm] = useState({
    id: '',
    num: '',
    rule: '',
    desc: ''
  });

  // Membership Application Form State
  const [memberForm, setMemberForm] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '',
    guardian_name: '',
    mobile: '',
    interests: 'কোডিং ও প্রোগ্রামিং (Python & Web)',
    device_access: 'বিদ্যালয়ের শেখ রাসেল ল্যাবে অনুশীলন',
    reason: ''
  });
  const [submittedReceipt, setSubmittedReceipt] = useState(null);
  const [memberFilterStatus, setMemberFilterStatus] = useState('all');

  // Digital Submission Form State
  const [writeForm, setWriteForm] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '',
    type: 'ডিজিটাল ব্যানার',
    title: '',
    summary: '',
    file_name: '',
    file_size: '',
    file_type: '',
    file_data: ''
  });
  const fileInputRef = useRef(null);
  const [readingItem, setReadingItem] = useState(null);

  // ICT Fair Project Form State
  const [projectForm, setProjectForm] = useState({
    team: '',
    leader: '',
    members: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    title: '',
    category: 'রোবটিক্স ও আইওটি',
    stall: 'স্টল নং-৪',
    desc: ''
  });

  // Achievements Form State
  const [achForm, setAchForm] = useState({
    year: '২০২৬',
    event: '',
    award: '১ম স্থান (চ্যাম্পিয়ন)',
    project: '',
    recipients: '',
    badge: '🏆 চ্যাম্পিয়ন'
  });

  // Cyber Safety Student Pledge State
  const [pledgeForm, setPledgeForm] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '',
    signed: false
  });

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }
    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';

    if (file.name.endsWith('.txt') || file.name.endsWith('.py') || file.name.endsWith('.html') || file.type === 'text/plain') {
      const textReader = new FileReader();
      textReader.onload = (ev) => {
        const textContent = ev.target?.result;
        if (typeof textContent === 'string' && !writeForm.summary.trim()) {
          setWriteForm(prev => ({
            ...prev,
            summary: textContent.slice(0, 500),
            file_name: file.name,
            file_size: formattedSize,
            file_type: file.type || 'text/plain',
            file_data: textContent
          }));
          showToast(`✓ "${file.name}" টেক্সট ফাইল আপলোড ও বিবরণে যুক্ত হয়েছে!`);
          return;
        }
      };
      textReader.readAsText(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      setWriteForm(prev => ({
        ...prev,
        file_name: file.name,
        file_size: formattedSize,
        file_type: file.type || 'document',
        file_data: typeof result === 'string' ? result : ''
      }));
      showToast(`✓ "${file.name}" ফাইলটি সফলভাবে সংযুক্ত হয়েছে!`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setWriteForm(prev => ({
      ...prev,
      file_name: '',
      file_size: '',
      file_type: '',
      file_data: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('সংযুক্ত ফাইলটি মুছে ফেলা হয়েছে।');
  };

  // =========================================================================
  // PRINT HANDLERS (UNIFIED OFFICIAL SCHOOL PAD WITH HALVED TOP MARGIN)
  // =========================================================================

  // 1. Print Coordinators & Judges Panel
  const handlePrintPanelPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const coords = (panelData.coordinators || []).map((c, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td><b>${c.name}</b><br><small style="color:#64748b;">${c.designation}</small></td>
        <td style="color:#0369a1;font-weight:700;">${c.role}</td>
        <td style="text-align:center;">${c.phone}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সমন্বয়ক ও বিচারক প্যানেল — আইসিটি ও কোডিং ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #94a3b8; padding: 7px 10px; text-align: left; vertical-align: middle; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">💻 আইসিটি ও কোডিং ক্লাব</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">সমন্বয়ক পরিষদ ও স্থায়ী বিচারক প্যানেল</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <h3 style="font-size:14px; color:#0369a1; margin:16px 0 6px 0;">👨‍🏫 সম্মানিত সমন্বয়কমণ্ডলী</h3>
        <table>
          <thead>
            <tr>
              <th style="width:36px; text-align:center;">ক্র.</th>
              <th>শিক্ষকের নাম ও মূল পদবী</th>
              <th>ক্লাবে অর্পিত সমন্বয়ক দায়িত্ব</th>
              <th style="width:110px; text-align:center;">যোগাযোগ</th>
            </tr>
          </thead>
          <tbody>
            ${coords}
          </tbody>
        </table>

        <h3 style="font-size:14px; color:#0c4a6e; margin:20px 0 6px 0;">⚖️ আইসিটি ও কোডিং প্রতিযোগিতা বিচারক প্যানেল (৩ সদস্য)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:36px; text-align:center;">ক্র.</th>
              <th>বিচারকের নাম ও পদবী</th>
              <th>বিচারক প্যানেলে ভূমিকা</th>
              <th style="width:130px; text-align:center;">মূল্যায়নের ক্ষেত্র</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align:center;font-weight:700;">১.</td>
              <td><b>${panelData.chiefJudge?.name || '—'}</b><br><small style="color:#64748b;">${panelData.chiefJudge?.designation || 'সহকারী শিক্ষক'}</small></td>
              <td style="color:#b91c1c;font-weight:800;">${panelData.chiefJudge?.role || 'প্রধান বিচারক'}</td>
              <td style="text-align:center;">কোডিং শুদ্ধতা ও অলিম্পিয়াড</td>
            </tr>
            <tr>
              <td style="text-align:center;font-weight:700;">২.</td>
              <td><b>${panelData.judge1?.name || '—'}</b><br><small style="color:#64748b;">${panelData.judge1?.designation || 'সিনিয়র শিক্ষক'}</small></td>
              <td style="color:#0369a1;font-weight:700;">${panelData.judge1?.role || 'বিচারক (১ম)'}</td>
              <td style="text-align:center;">লজিক, অ্যালগরিদম ও সময়ানুবর্তিতা</td>
            </tr>
            <tr>
              <td style="text-align:center;font-weight:700;">৩.</td>
              <td><b>${panelData.judge2?.name || '—'}</b><br><small style="color:#64748b;">${panelData.judge2?.designation || 'সহকারী শিক্ষক'}</small></td>
              <td style="color:#0369a1;font-weight:700;">${panelData.judge2?.role || 'বিচারক (২য়)'}</td>
              <td style="text-align:center;">উদ্ভাবন, UI ডিজাইন ও বাস্তব উপযোগিতা</td>
            </tr>
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span><br>
            <span style="font-size:11px;color:#64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span><br>
            <span style="font-size:11px;color:#64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 2. Print Executive Committee
  const handlePrintExecPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const posts = [
      { role: 'সভাপতি', data: execData.president },
      { role: 'সহ-সভাপতি', data: execData.vicePresident },
      { role: 'সাধারণ সম্পাদক', data: execData.generalSecretary },
      { role: 'যুগ্ম সম্পাদক', data: execData.jointSecretary },
      { role: 'সাংগঠনিক সম্পাদক', data: execData.organizingSecretary },
      { role: 'প্রচার ও প্রকাশনা সম্পাদক', data: execData.publicitySecretary },
      { role: 'অর্থ সম্পাদক', data: execData.financeSecretary }
    ];

    const postRows = posts.map((p, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:700; color:#0369a1;">${p.role}</td>
        <td><b>${p.data.name}</b></td>
        <td style="text-align:center;">${p.data.class}</td>
        <td style="text-align:center;">${p.data.section || '—'}</td>
        <td style="text-align:center;">${toBn(p.data.roll)}</td>
        <td style="text-align:center;">${p.data.phone || '—'}</td>
      </tr>
    `).join('');

    const memRows = (execData.members || []).map((m, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td><b>${m.name}</b></td>
        <td style="text-align:center;">${m.class}</td>
        <td style="text-align:center;">${m.section || '—'}</td>
        <td style="text-align:center;">${toBn(m.roll)}</td>
        <td style="color:#475569;">${m.note || 'কার্যনির্বাহী সদস্য'}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>কার্যনির্বাহী পরিষদ — আইসিটি ও কোডিং ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: middle; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 8px 0;">
          <span class="doc-badge">👥 শিক্ষার্থী নেতৃত্ব</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি ও কোডিং ক্লাব — কার্যনির্বাহী পরিষদ (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <h3 style="font-size:13.5px; color:#0369a1; margin:12px 0 4px 0;">⚙️ মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th>পদের নাম</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="text-align:center; width:65px;">শ্রেণি</th>
              <th style="text-align:center; width:90px;">শাখা/বিভাগ</th>
              <th style="text-align:center; width:50px;">রোল</th>
              <th style="text-align:center; width:100px;">মোবাইল</th>
            </tr>
          </thead>
          <tbody>
            ${postRows}
          </tbody>
        </table>

        <h3 style="font-size:13.5px; color:#0c4a6e; margin:16px 0 4px 0;">👥 সাধারণ কার্যনির্বাহী সদস্যবৃন্দ</h3>
        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="text-align:center; width:65px;">শ্রেণি</th>
              <th style="text-align:center; width:90px;">শাখা/বিভাগ</th>
              <th style="text-align:center; width:50px;">রোল</th>
              <th>দায়িত্ব</th>
            </tr>
          </thead>
          <tbody>
            ${memRows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 3. Print Regular Activities
  const handlePrintActivitiesPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = activities.map((act, i) => `
      <tr>
        <td style="text-align:center; font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:700; color:#0369a1;">${act.title}<br><small style="color:#047857;">(${act.focus})</small></td>
        <td style="font-size:12px;">${act.details}</td>
        <td style="text-align:center; font-size:11.5px;">${act.time}</td>
        <td style="font-size:11.5px;">${act.venue}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>নিয়মিত কার্যক্রম বিবরণী — আইসিটি ও কোডিং ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">⚡ আইসিটি ক্লাব নিয়মিত কার্যক্রম</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি ও কোডিং ক্লাব — নিয়মিত কার্যক্রম সূচি (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">ভেন্যু: শেখ রাসেল ডিজিটাল ল্যাব • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th style="width:140px;">কার্যক্রম ও বিষয়</th>
              <th>কার্যক্রমের বিস্তারিত বিবরণ</th>
              <th style="width:110px; text-align:center;">ধার্যকৃত সময়</th>
              <th style="width:120px;">ভেন্যু</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 4. Print Yearly Calendar & Plans (USES LIVE STATE quarterlyPlans & monthlyCalendar)
  const handlePrintProgramsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const quarterHtml = quarterlyPlans.map(q => `
      <div style="margin-bottom:12px; padding:10px; border:1px solid #bae6fd; border-radius:6px; background:#f0f9ff;">
        <b style="color:#0369a1; font-size:13px;">${q.quarter}: ${q.title}</b>
        <ul style="margin:6px 0 0 18px; padding:0; font-size:11.5px; color:#334155;">
          ${(q.items || []).map(it => `<li>${it}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    const monthRows = monthlyCalendar.map((m, i) => `
      <tr>
        <td style="text-align:center; font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:700; color:#0369a1;">${m.month}</td>
        <td><b>${m.title}</b></td>
        <td style="text-align:center;">${m.date}</td>
        <td>${m.coordinator}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার — আইসিটি ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11.5px; }
          th, td { border: 1px solid #94a3b8; padding: 5px 8px; text-align: left; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 35px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 10px 0 8px 0;">
          <span class="doc-badge">📅 আইসিটি ও কোডিং ক্লাব</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:17px;">বাৎসরিক কর্মপরিকল্পনা ও ক্যালেন্ডার (২০২৬)</h2>
          <div style="font-size:11.5px; color:#475569;">ভেন্যু: শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <h3 style="font-size:13px; color:#0369a1; margin:10px 0 4px 0;">🎯 ত্রৈমাসিক কর্মপরিকল্পনা (Quarterly Roadmap)</h3>
        ${quarterHtml}

        <h3 style="font-size:13px; color:#0c4a6e; margin:12px 0 4px 0;">🗓️ ১২ মাসের ধারাবাহিক ইভেন্ট ক্যালেন্ডার</h3>
        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th style="width:70px;">মাস</th>
              <th>কর্মসূচি ও ইভেন্টের বিবরণ</th>
              <th style="width:90px; text-align:center;">সম্ভাব্য তারিখ</th>
              <th style="width:130px;">দায়িত্বপ্রাপ্ত শিক্ষক</th>
            </tr>
          </thead>
          <tbody>
            ${monthRows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 5. Print Membership Rules
  const handlePrintRulesPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rulesHtml = (selectionRules || []).map(r => `
      <div style="margin-bottom:12px; padding:10px 14px; border-left:4px solid #0284c7; background:#f0f9ff; border-radius:4px;">
        <b style="color:#0369a1; font-size:13px;">${r.num}. ${r.title}</b>
        <p style="margin:4px 0 0 0; font-size:12px; color:#334155; line-height:1.5;">${r.text}</p>
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্য নির্বাচনের নিয়মাবলী — আইসিটি ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">📜 নির্দেশিকা ও নীতিমালা</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি ও কোডিং ক্লাব — সদস্য নির্বাচনের নিয়মাবলী</h2>
          <div style="font-size:12px; color:#475569;">শিক্ষাবর্ষ: ২০২৬ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <div style="margin-top:16px;">
          ${rulesHtml}
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 6. Print Discipline & Lab Safety Rules
  const handlePrintConductPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rulesHtml = (disciplineRules || []).map(r => `
      <div style="margin-bottom:10px; padding:8px 12px; border-left:4px solid #ef4444; background:#fef2f2; border-radius:4px;">
        <b style="color:#b91c1c; font-size:13px;">${r.num}. ${r.rule}</b>
        <p style="margin:3px 0 0 0; font-size:12px; color:#334155; line-height:1.5;">${r.desc}</p>
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শৃঙ্খলা ও নিরাপত্তাবিধি — আইসিটি ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">🛡️ ল্যাব আচরণবিধি ও সাইবার নিরাপত্তা</span>
          <h2 style="margin:4px 0; color:#b91c1c; font-size:18px;">শেখ রাসেল ডিজিটাল ল্যাব ও আইসিটি ক্লাবের নিরাপত্তাবিধি</h2>
          <div style="font-size:12px; color:#475569;">সকল শিক্ষার্থী ও ক্লাব সদস্যের জন্য অবশ্য পালনীয় বাধ্যতামূলক নির্দেশনা</div>
        </div>

        <div style="margin-top:14px;">
          ${rulesHtml}
        </div>

        <div style="margin-top:16px; padding:12px; border:1.5px dashed #0284c7; background:#f0f9ff; border-radius:6px; font-size:12px;">
          <b>🔒 ডিজিটাল অঙ্গীকার:</b> আমি ঘোষণা করছি যে, বিদ্যালয়ের শেখ রাসেল কম্পিউটার ল্যাব ও ইন্টারনেটের সকল সুযোগ সুবিধার যথাযথ মর্যাদা রক্ষা করব এবং কোনো প্রকার অননুমোদিত কাজ বা সাইবার অপরাধে লিপ্ত হব না।
          <div style="margin-top:8px; display:flex; justify-content:space-between;">
            <span>শিক্ষার্থীর নাম: .................................................</span>
            <span>শ্রেণি: ................. শাখা: ................ রোল: ..............</span>
            <span>স্বাক্ষর: .................................</span>
          </div>
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 7. Print Member Receipt
  const handlePrintMemberReceipt = (receipt) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্য নিবন্ধন রসিদ — ${receipt.trackingId}</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { border: 1px solid #94a3b8; padding: 8px 12px; text-align: left; }
          th { background: #f0f9ff; color: #0369a1; width: 170px; }
          .sig-grid { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">📝 সদস্য নিবন্ধন আবেদনপত্র / স্বীকৃতিপত্র</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি ও কোডিং ক্লাব — সদস্যপদ নিবন্ধন রসিদ</h2>
          <div style="font-size:12px; color:#475569;">ট্র্যাকিং নম্বর: <b style="color:#0369a1; font-size:14px;">${receipt.trackingId}</b> • আবেদনের তারিখ: ${receipt.date || toBn(new Date().toLocaleDateString('bn-BD'))}</div>
        </div>

        <table>
          <tbody>
            <tr>
              <th>শিক্ষার্থীর পূর্ণ নাম</th>
              <td><b>${receipt.student_name}</b></td>
            </tr>
            <tr>
              <th>শ্রেণি ও শাখা/বিভাগ</th>
              <td>${receipt.class_name} শ্রেণি • শাখা/বিভাগ: <b>${receipt.section || '—'}</b></td>
            </tr>
            <tr>
              <th>শ্রেণি রোল নং</th>
              <td><b>${toBn(receipt.roll_no)}</b></td>
            </tr>
            <tr>
              <th>অভিভাবকের নাম ও মোবাইল</th>
              <td>${receipt.guardian_name || '—'} (${receipt.mobile || '—'})</td>
            </tr>
            <tr>
              <th>পছন্দের আইসিটি শাখা</th>
              <td style="color:#0369a1; font-weight:700;">${receipt.interests}</td>
            </tr>
            <tr>
              <th>ডিভাইস বা কম্পিউটার লভ্যতা</th>
              <td>${receipt.device_access || 'ল্যাবে অনুশীলন'}</td>
            </tr>
            <tr>
              <th>আবেদনের বর্তমান স্থিতি</th>
              <td><b style="color:${receipt.status === 'অনুমোদিত' ? '#166534' : '#b45309'};">${receipt.status || 'অপেক্ষমান'}</b></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:20px; padding:10px 14px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; font-size:12px; color:#334155;">
          <b>নির্দেশনা:</b> এই রসিদটি যত্নসহকারে সংরক্ষণ করুন। সদস্যপদ চূড়ান্ত অনুমোদনের পর ক্লাবের পরিচয়পত্র (ID Card) ও শেখ রাসেল ডিজিটাল ল্যাব এক্সেস কার্ড প্রদান করা হবে।
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 8. Print Members Directory
  const handlePrintMembersDirectory = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = memberships.map((m, i) => `
      <tr>
        <td style="text-align:center; font-weight:700;">${toBn(i + 1)}.</td>
        <td style="text-align:center; font-family:monospace; color:#0369a1; font-weight:700;">${m.trackingId}</td>
        <td><b>${m.student_name}</b></td>
        <td style="text-align:center;">${m.class_name}</td>
        <td style="text-align:center;">${m.section || '—'}</td>
        <td style="text-align:center;">${toBn(m.roll_no)}</td>
        <td>${m.interests}</td>
        <td style="text-align:center;">${m.mobile || '—'}</td>
        <td style="text-align:center; font-weight:700; color:${m.status === 'অনুমোদিত' ? '#166534' : '#b45309'};">${m.status}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্য ডিরেক্টরি — আইসিটি ও কোডিং ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 landscape; margin: 6mm 10mm 10mm 10mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11.5px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 8px 0;">
          <span class="doc-badge">👥 সাধারণ সদস্য ডিরেক্টরি</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি ও কোডিং ক্লাব — নিবন্ধিত সদস্য তালিকা (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">মোট সদস্য: ${toBn(memberships.length)} জন • অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th style="width:90px; text-align:center;">আইডি</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="width:55px; text-align:center;">শ্রেণি</th>
              <th style="width:80px; text-align:center;">শাখা/বিভাগ</th>
              <th style="width:45px; text-align:center;">রোল</th>
              <th>পছন্দের ক্ষেত্র</th>
              <th style="width:95px; text-align:center;">যোগাযোগ</th>
              <th style="width:70px; text-align:center;">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 9. Print Submission / Showcase Item
  const handlePrintSubmission = (item) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${item.title} — ডিজিটাল আইসিটি শোকেস</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">🎨 ডিজিটাল ব্যানার ও পোস্টার প্রকাশনা</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:19px;">${item.title}</h2>
          <div style="font-size:12.5px; color:#475569;">
            স্রষ্টা: <b>${item.student_name}</b> • শ্রেণি: <b>${item.class_name}</b> • শাখা/বিভাগ: <b>${item.section || '—'}</b> • রোল: <b>${toBn(item.roll)}</b>
          </div>
          <div style="font-size:11.5px; color:#64748b; margin-top:2px;">
            ক্যাটাগরি: <b>${item.type}</b> • প্রকাশের তারিখ: ${item.date || toBn(new Date().toLocaleDateString('bn-BD'))}
          </div>
        </div>

        <div style="margin:20px 0; padding:16px; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-size:13px; line-height:1.7;">
          <h3 style="margin:0 0 8px 0; font-size:14px; color:#0369a1;">📄 সারসংক্ষেপ ও প্রকল্পের বিবরণ:</h3>
          <p style="margin:0; white-space:pre-wrap; color:#1e293b;">${item.summary}</p>

          ${item.file_name ? `
            <div style="margin-top:14px; padding:10px; background:#e0f2fe; border:1px solid #bae6fd; border-radius:6px; font-size:12px;">
              <b>📁 সংযুক্ত ডিজিটাল ফাইল:</b> ${item.file_name} (${item.file_size || 'ফাইল'})
            </div>
          ` : ''}
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 10. Print ICT Fair Projects
  const handlePrintProjectsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = projects.map((p, i) => `
      <tr>
        <td style="text-align:center; font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:700; color:#0369a1;">${p.stall}</td>
        <td><b>${p.title}</b><br><small style="color:#64748b;">${p.desc}</small></td>
        <td style="color:#0c4a6e; font-weight:700;">${p.category}</td>
        <td><b>${p.team}</b><br><small>দলনেতা: ${p.leader} | সদস্য: ${p.members}</small></td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>আইসিটি মেলা ও প্রজেক্ট প্রদর্শনী তালিকা — ২০২৬</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11.5px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">🚀 বার্ষিক বিজ্ঞান ও তথ্যপ্রযুক্তি মেলা</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি মেলা — প্রজেক্ট ও স্টল প্রদর্শনী ডিরেক্টরি (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">ভেন্যু: বিদ্যালয় কেন্দ্রীয় হলরুম ও মুক্তমঞ্চ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th style="width:75px; text-align:center;">স্টল নং</th>
              <th>প্রকল্পের নাম ও বিবরণ</th>
              <th style="width:110px;">ক্যাটাগরি</th>
              <th style="width:140px;">অংশগ্রহণকারী দল</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">আহ্বায়ক, আইসিটি মেলা প্রস্তুতি কমিটি</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও সভাপতি, মেলা পরিচালনা পরিষদ</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 11. Print Achievements
  const handlePrintAchievementsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = achievements.map((a, i) => `
      <tr>
        <td style="text-align:center; font-weight:700;">${toBn(i + 1)}.</td>
        <td style="text-align:center; font-weight:700;">${toBn(a.year)}</td>
        <td><b>${a.event}</b></td>
        <td style="color:#0369a1; font-weight:700;">${a.award}</td>
        <td>${a.project}</td>
        <td><b>${a.recipients}</b></td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>অর্জন ও সম্মাননা তালিকা — আইসিটি ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; }
          th { background: #f0f9ff; color: #0369a1; font-weight: 800; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">🏅 সম্মাননা ও গৌরবগাথা</span>
          <h2 style="margin:4px 0; color:#0369a1; font-size:18px;">আইসিটি ও কোডিং ক্লাব — জাতীয় ও আঞ্চলিক অর্জনের তালিকা</h2>
          <div style="font-size:12px; color:#475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • শিক্ষাবর্ষ: ২০২৪-২০২৬</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th style="width:50px; text-align:center;">সাল</th>
              <th>প্রতিযোগিতা / ইভেন্টের নাম</th>
              <th style="width:110px;">অর্জিত স্থান / পদক</th>
              <th>প্রজেক্ট বা উদ্ভাবনের বিষয়</th>
              <th>বিজয়ীদের নাম</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ আবুবকর সিদ্দিক</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, আইসিটি ও কোডিং ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // =========================================================================
  // CRUD HANDLERS (COORDINATORS, JUDGES, EXEC, ACTIVITIES, QUARTERS, MONTHS)
  // =========================================================================

  // Add Coordinator
  const handleAddCoordinator = (e) => {
    e.preventDefault();
    const t = activeTeachers.find(x => (x.id === newCoordTeacherId || x.employee_id === newCoordTeacherId)) || activeTeachers[0];
    const newCoord = {
      id: 'coord-' + Date.now(),
      teacherId: t.id || t.employee_id,
      name: t.name_bn || t.name_en,
      designation: t.designation || 'সহকারী শিক্ষক',
      role: newCoordRole.trim() || 'সহকারী সমন্বয়ক',
      phone: newCoordPhone.trim() || t.phone || '01710-000000'
    };
    const updated = {
      ...panelData,
      coordinators: [...(panelData.coordinators || []), newCoord]
    };
    setPanelData(updated);
    persistPanel(updated);
    showToast(`সমন্বয়ক "${newCoord.name}" সফলভাবে যুক্ত হয়েছেন!`);
  };

  // Remove Coordinator
  const handleRemoveCoordinator = (id) => {
    if (!window.confirm('আপনি কি এই সমন্বয়ককে তালিকা থেকে অপসারিত করতে চান?')) return;
    const updated = {
      ...panelData,
      coordinators: (panelData.coordinators || []).filter(c => c.id !== id)
    };
    setPanelData(updated);
    persistPanel(updated);
    showToast('সমন্বয়ক অপসারিত হয়েছেন!');
  };

  // Start Edit Coordinator
  const handleStartEditCoordinator = (c) => {
    setEditingCoordinator(c);
    setCoordEditForm({
      id: c.id,
      name: c.name,
      designation: c.designation,
      role: c.role,
      phone: c.phone
    });
  };

  // Save Edit Coordinator
  const handleSaveCoordinatorEdit = (e) => {
    e.preventDefault();
    if (!editingCoordinator) return;
    const updatedCoords = (panelData.coordinators || []).map(c => {
      if (c.id === editingCoordinator.id) {
        return {
          ...c,
          name: coordEditForm.name.trim(),
          designation: coordEditForm.designation.trim(),
          role: coordEditForm.role.trim(),
          phone: coordEditForm.phone.trim()
        };
      }
      return c;
    });
    const updated = {
      ...panelData,
      coordinators: updatedCoords
    };
    setPanelData(updated);
    persistPanel(updated);
    setEditingCoordinator(null);
    showToast(`সমন্বয়ক "${coordEditForm.name.trim()}"-এর তথ্য হালনাগাদ হয়েছে!`);
  };

  // Change Judge
  const handleChangeJudge = (slot, teacherId) => {
    const t = activeTeachers.find(x => (x.id === teacherId || x.employee_id === teacherId)) || activeTeachers[0];
    const updated = {
      ...panelData,
      [slot]: {
        teacherId: t.id || t.employee_id,
        name: t.name_bn || t.name_en,
        designation: t.designation || 'সহকারী শিক্ষক',
        role: slot === 'chiefJudge' ? 'প্রধান বিচারক (আইসিটি ও কোডিং অলিম্পিয়াড)' : slot === 'judge1' ? 'বিচারক (১ম)' : 'বিচারক (২য়)'
      }
    };
    setPanelData(updated);
    persistPanel(updated);
    showToast('বিচারক সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  // Add Executive Member
  const handleAddExecMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newM = {
      id: 'm-' + Date.now(),
      name: newMemberName.trim(),
      class: newMemberClass,
      section: newMemberSection,
      roll: newMemberRoll.trim() || '—',
      note: 'কার্যনির্বাহী সদস্য'
    };
    const updated = {
      ...execData,
      members: [...(execData.members || []), newM]
    };
    setExecData(updated);
    persistExec(updated);
    setNewMemberName('');
    setNewMemberRoll('');
    showToast(`সদস্য "${newM.name}" সফলভাবে কার্যনির্বাহী পরিষদে যুক্ত হয়েছে!`);
  };

  // Remove Exec Member
  const handleRemoveExecMember = (id) => {
    if (!window.confirm('আপনি কি এই কার্যনির্বাহী সদস্যকে অপসারণ করতে চান?')) return;
    const updated = {
      ...execData,
      members: (execData.members || []).filter(m => m.id !== id)
    };
    setExecData(updated);
    persistExec(updated);
    showToast('কার্যনির্বাহী সদস্য অপসারিত হয়েছে!');
  };

  // Start Edit Member
  const handleStartEditMember = (m) => {
    setEditingExecMember(m);
    const mClass = m.class || '৮ম';
    const defaultSec = (mClass === '৯ম' || mClass === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
    setMemberEditForm({
      id: m.id,
      name: m.name || '',
      class: mClass,
      section: m.section || defaultSec,
      roll: m.roll || ''
    });
  };

  // Save Edit Member
  const handleSaveMemberEdit = (e) => {
    e.preventDefault();
    if (!editingExecMember) return;
    const updatedMembers = (execData.members || []).map(m => {
      if (m.id === editingExecMember.id) {
        return {
          ...m,
          name: memberEditForm.name.trim(),
          class: memberEditForm.class,
          section: memberEditForm.section,
          roll: memberEditForm.roll.trim() || '—'
        };
      }
      return m;
    });
    const updated = {
      ...execData,
      members: updatedMembers
    };
    setExecData(updated);
    persistExec(updated);
    setEditingExecMember(null);
    showToast(`সদস্য "${memberEditForm.name.trim()}"-এর তথ্য আপডেট হয়েছে!`);
  };

  // Start Edit Post
  const handleStartEditPost = (postKey, current) => {
    setEditingExecPost(postKey);
    const postClass = current.class || '১০ম';
    const defaultSec = (postClass === '৯ম' || postClass === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
    setExecEditForm({
      name: current.name || '',
      class: postClass,
      section: current.section || defaultSec,
      roll: current.roll || '',
      phone: current.phone || ''
    });
  };

  // Save Edit Post
  const handleSavePostEdit = (e) => {
    e.preventDefault();
    if (!editingExecPost) return;
    const updated = {
      ...execData,
      [editingExecPost]: {
        name: execEditForm.name.trim(),
        class: execEditForm.class,
        section: execEditForm.section,
        roll: execEditForm.roll.trim() || '—',
        phone: execEditForm.phone.trim() || '—'
      }
    };
    setExecData(updated);
    persistExec(updated);
    setEditingExecPost(null);
    showToast('পদাধিকারীর তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // ==========================================
  // REGULAR ACTIVITIES: EDIT & DELETE HANDLERS
  // ==========================================

  const handleStartEditActivity = (act) => {
    setEditingActivity(act);
    setActivityEditForm({
      id: act.id,
      num: act.num || '',
      title: act.title || '',
      focus: act.focus || '',
      time: act.time || '',
      venue: act.venue || '',
      details: act.details || ''
    });
  };

  const handleSaveActivityEdit = (e) => {
    e.preventDefault();
    if (!editingActivity) return;
    const updated = activities.map(act => {
      if (act.id === editingActivity.id) {
        return {
          ...act,
          title: activityEditForm.title.trim(),
          focus: activityEditForm.focus.trim(),
          time: activityEditForm.time.trim(),
          venue: activityEditForm.venue.trim(),
          details: activityEditForm.details.trim()
        };
      }
      return act;
    });
    setActivities(updated);
    persistActivities(updated);
    setEditingActivity(null);
    showToast(`কার্যক্রম "${activityEditForm.title.trim()}" সফলভাবে হালনাগাদ হয়েছে!`);
  };

  const handleDeleteActivity = (id) => {
    if (!window.confirm('আপনি কি এই নিয়মিত কার্যক্রমটি মুছে ফেলতে চান?')) return;
    const updated = activities.filter(act => act.id !== id);
    setActivities(updated);
    persistActivities(updated);
    showToast('নিয়মিত কার্যক্রম মুছে ফেলা হয়েছে!');
  };

  const handleAddNewActivity = () => {
    const newAct = {
      id: 'act-' + Date.now(),
      num: toBn(activities.length + 1),
      title: 'নতুন আইসিটি কার্যক্রম ' + toBn(activities.length + 1),
      focus: 'প্রযুক্তি প্রশিক্ষণ',
      time: 'প্রতি বুধবার বিকাল ৩:৩০ মি.',
      venue: 'শেখ রাসেল ডিজিটাল ল্যাব',
      details: 'কার্যক্রমের বিস্তারিত বিবরণ এখানে লিখুন...'
    };
    const updated = [...activities, newAct];
    setActivities(updated);
    persistActivities(updated);
    handleStartEditActivity(newAct);
    showToast('নতুন কার্যক্রম যুক্ত হয়েছে, তথ্য সম্পাদনা করুন!');
  };

  // ==========================================
  // QUARTERLY ROADMAP: EDIT & DELETE HANDLERS
  // ==========================================

  const handleStartEditQuarter = (q, idx) => {
    setEditingQuarter({ ...q, _index: idx });
    setQuarterEditForm({
      id: q.id || 'q-' + idx,
      quarter: q.quarter || '',
      title: q.title || '',
      color: q.color || '#0284c7',
      itemsText: (q.items || []).join('\n')
    });
  };

  const handleSaveQuarterEdit = (e) => {
    e.preventDefault();
    if (!editingQuarter) return;
    const items = quarterEditForm.itemsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const updated = quarterlyPlans.map((q, idx) => {
      const match = q.id ? q.id === editingQuarter.id : idx === editingQuarter._index;
      if (match) {
        return {
          ...q,
          quarter: quarterEditForm.quarter.trim(),
          title: quarterEditForm.title.trim(),
          color: quarterEditForm.color,
          items
        };
      }
      return q;
    });
    setQuarterlyPlans(updated);
    persistQuarterlyPlans(updated);
    setEditingQuarter(null);
    showToast(`ত্রৈমাসিক রোডমাপ "${quarterEditForm.quarter.trim()}" সংরক্ষিত হয়েছে!`);
  };

  const handleDeleteQuarter = (idOrIdx) => {
    if (!window.confirm('আপনি কি এই ত্রৈমাসিক রোডম্যাপটি মুছে ফেলতে চান?')) return;
    const updated = quarterlyPlans.filter((q, idx) => (q.id ? q.id !== idOrIdx : idx !== idOrIdx));
    setQuarterlyPlans(updated);
    persistQuarterlyPlans(updated);
    showToast('ত্রৈমাসিক রোডম্যাপ অপসারিত হয়েছে!');
  };

  const handleAddNewQuarter = () => {
    const newQ = {
      id: 'q-' + Date.now(),
      quarter: 'নতুন ত্রৈমাসিক',
      title: 'নতুন কর্মপরিকল্পনা ও প্রজেক্ট',
      color: '#0284c7',
      items: ['প্রথম কর্মসূচি', 'দ্বিতীয় কর্মসূচি', 'তৃতীয় কর্মসূচি']
    };
    const updated = [...quarterlyPlans, newQ];
    setQuarterlyPlans(updated);
    persistQuarterlyPlans(updated);
    handleStartEditQuarter(newQ, quarterlyPlans.length);
    showToast('নতুন ত্রৈমাসিক রোডম্যাপ যুক্ত হয়েছে!');
  };

  // ==========================================
  // MONTHLY CALENDAR: EDIT & DELETE HANDLERS
  // ==========================================

  const handleStartEditMonth = (m, idx) => {
    setEditingMonth({ ...m, _index: idx });
    setMonthEditForm({
      id: m.id || 'm-' + idx,
      month: m.month || '',
      title: m.title || '',
      date: m.date || '',
      coordinator: m.coordinator || ''
    });
  };

  const handleSaveMonthEdit = (e) => {
    e.preventDefault();
    if (!editingMonth) return;
    const updated = monthlyCalendar.map((m, idx) => {
      const match = m.id ? m.id === editingMonth.id : idx === editingMonth._index;
      if (match) {
        return {
          ...m,
          month: monthEditForm.month.trim(),
          title: monthEditForm.title.trim(),
          date: monthEditForm.date.trim(),
          coordinator: monthEditForm.coordinator.trim()
        };
      }
      return m;
    });
    setMonthlyCalendar(updated);
    persistMonthlyCalendar(updated);
    setEditingMonth(null);
    showToast(`মাসের কর্মসূচি "${monthEditForm.month.trim()}" সংরক্ষিত হয়েছে!`);
  };

  const handleDeleteMonth = (idOrIdx) => {
    if (!window.confirm('আপনি কি এই মাসের কর্মসূচিটি মুছে ফেলতে চান?')) return;
    const updated = monthlyCalendar.filter((m, idx) => (m.id ? m.id !== idOrIdx : idx !== idOrIdx));
    setMonthlyCalendar(updated);
    persistMonthlyCalendar(updated);
    showToast('মাসের কর্মসূচি অপসারিত হয়েছে!');
  };

  const handleAddNewMonth = () => {
    const newM = {
      id: 'm-' + Date.now(),
      month: 'বিশেষ মাস',
      title: 'প্রযুক্তি কর্মশালা ও প্রতিযোগিতা',
      date: 'নির্ধারিত তারিখ',
      coordinator: 'মোঃ আবুবকর সিদ্দিক'
    };
    const updated = [...monthlyCalendar, newM];
    setMonthlyCalendar(updated);
    persistMonthlyCalendar(updated);
    handleStartEditMonth(newM, monthlyCalendar.length);
    showToast('নতুন মাসের কর্মসূচি যুক্ত হয়েছে!');
  };

  // =========================================================================
  // SELECTION RULES CRUD HANDLERS
  // =========================================================================
  const handleStartEditSelectionRule = (rule) => {
    setEditingSelectionRule(rule);
    setSelectionRuleEditForm({
      id: rule.id || '',
      num: rule.num || '',
      title: rule.title || '',
      text: rule.text || ''
    });
  };

  const handleSaveSelectionRuleEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingSelectionRule) return;
    if (!selectionRuleEditForm.title.trim() || !selectionRuleEditForm.text.trim()) {
      alert('মানদণ্ডের শিরোনাম ও বিবরণ পূরণ করা আবশ্যক।');
      return;
    }
    const updated = (selectionRules || []).map(r => {
      const isMatch = (r.id && r.id === editingSelectionRule.id) || (!r.id && r.num === editingSelectionRule.num);
      if (isMatch) {
        return {
          ...r,
          num: selectionRuleEditForm.num || r.num,
          title: selectionRuleEditForm.title.trim(),
          text: selectionRuleEditForm.text.trim()
        };
      }
      return r;
    });
    setSelectionRules(updated);
    persistSelectionRules(updated);
    setEditingSelectionRule(null);
    showToast('✓ সদস্য নির্বাচনের মানদণ্ড সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  const handleDeleteSelectionRule = (targetRule) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${targetRule.title}" মানদণ্ডটি মুছে ফেলতে চান?`)) return;
    const updated = (selectionRules || []).filter(r => (r.id ? r.id !== targetRule.id : r.num !== targetRule.num));
    setSelectionRules(updated);
    persistSelectionRules(updated);
    showToast('মানদণ্ডটি মুছে ফেলা হয়েছে।');
  };

  const handleAddNewSelectionRule = () => {
    const nextNum = toBn((selectionRules || []).length + 1);
    const newRule = {
      id: `sr-${Date.now()}`,
      num: nextNum,
      title: 'নতুন নির্বাচনী মানদণ্ড',
      text: 'এই মানদণ্ডের বিস্তারিত বিবরণ এখানে লিখুন।'
    };
    const updated = [...(selectionRules || []), newRule];
    setSelectionRules(updated);
    persistSelectionRules(updated);
    handleStartEditSelectionRule(newRule);
    showToast('নতুন মানদণ্ড যুক্ত হয়েছে। অনুগ্রহ করে সম্পাদনা করুন।');
  };

  // =========================================================================
  // DISCIPLINE & SAFETY RULES CRUD HANDLERS
  // =========================================================================
  const handleStartEditDisciplineRule = (rule) => {
    setEditingDisciplineRule(rule);
    setDisciplineRuleEditForm({
      id: rule.id || '',
      num: rule.num || '',
      rule: rule.rule || '',
      desc: rule.desc || ''
    });
  };

  const handleSaveDisciplineRuleEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingDisciplineRule) return;
    if (!disciplineRuleEditForm.rule.trim() || !disciplineRuleEditForm.desc.trim()) {
      alert('নিয়মের শিরোনাম ও বিবরণ পূরণ করা আবশ্যক।');
      return;
    }
    const updated = (disciplineRules || []).map(r => {
      const isMatch = (r.id && r.id === editingDisciplineRule.id) || (!r.id && r.num === editingDisciplineRule.num);
      if (isMatch) {
        return {
          ...r,
          num: disciplineRuleEditForm.num || r.num,
          rule: disciplineRuleEditForm.rule.trim(),
          desc: disciplineRuleEditForm.desc.trim()
        };
      }
      return r;
    });
    setDisciplineRules(updated);
    persistDisciplineRules(updated);
    setEditingDisciplineRule(null);
    showToast('✓ শৃঙ্খলা ও নিরাপত্তাবিধি সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  const handleDeleteDisciplineRule = (targetRule) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${targetRule.rule}" নিয়মটি মুছে ফেলতে চান?`)) return;
    const updated = (disciplineRules || []).filter(r => (r.id ? r.id !== targetRule.id : r.num !== targetRule.num));
    setDisciplineRules(updated);
    persistDisciplineRules(updated);
    showToast('নিয়মটি মুছে ফেলা হয়েছে।');
  };

  const handleAddNewDisciplineRule = () => {
    const nextNum = toBn((disciplineRules || []).length + 1);
    const newRule = {
      id: `dr-${Date.now()}`,
      num: nextNum,
      rule: 'নতুন নিরাপত্তাবিধি',
      desc: 'এই বিধির বিস্তারিত বিবরণ এখানে লিখুন।'
    };
    const updated = [...(disciplineRules || []), newRule];
    setDisciplineRules(updated);
    persistDisciplineRules(updated);
    handleStartEditDisciplineRule(newRule);
    showToast('নতুন নিরাপত্তাবিধি যুক্ত হয়েছে। অনুগ্রহ করে সম্পাদনা করুন।');
  };

  // Submit Membership Application
  const handleSubmitMembershipForm = (e) => {
    e.preventDefault();
    if (!memberForm.student_name.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    const trackingId = 'ICT-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newEntry = {
      trackingId,
      student_name: memberForm.student_name.trim(),
      class_name: memberForm.class_name,
      section: memberForm.section,
      roll_no: memberForm.roll_no.trim() || '—',
      guardian_name: memberForm.guardian_name.trim(),
      mobile: memberForm.mobile.trim(),
      interests: memberForm.interests,
      device_access: memberForm.device_access,
      reason: memberForm.reason.trim(),
      status: 'অপেক্ষমান',
      date: new Date().toLocaleDateString('bn-BD')
    };

    const updated = [newEntry, ...memberships];
    setMemberships(updated);
    persistMemberships(updated);
    setSubmittedReceipt(newEntry);
    setMemberForm({
      student_name: '',
      class_name: '৯ম',
      section: 'বিজ্ঞান',
      roll_no: '',
      guardian_name: '',
      mobile: '',
      interests: 'কোডিং ও প্রোগ্রামিং (Python & Web)',
      device_access: 'বিদ্যালয়ের শেখ রাসেল ল্যাবে অনুশীলন',
      reason: ''
    });
    showToast(`✓ আবেদন জমা হয়েছে! ট্র্যাকিং নম্বর: ${trackingId}`);
  };

  // Approve / Reject / Delete Membership
  const handleApproveMembership = (trackingId) => {
    const updated = memberships.map(m => m.trackingId === trackingId ? { ...m, status: 'অনুমোদিত' } : m);
    setMemberships(updated);
    persistMemberships(updated);
    showToast('সদস্যপদ অনুমোদিত হয়েছে!');
  };

  const handleRejectMembership = (trackingId) => {
    const updated = memberships.map(m => m.trackingId === trackingId ? { ...m, status: 'বাতিল' } : m);
    setMemberships(updated);
    persistMemberships(updated);
    showToast('সদস্যপদ বাতিল করা হয়েছে।');
  };

  const handleDeleteMembership = (trackingId) => {
    if (!window.confirm('আপনি কি এই আবেদনটি মুছে ফেলতে চান?')) return;
    const updated = memberships.filter(m => m.trackingId !== trackingId);
    setMemberships(updated);
    persistMemberships(updated);
    showToast('আবেদন অপসারিত হয়েছে।');
  };

  // Submit Digital Work / Submission
  const handleSubmitWriteForm = (e) => {
    e.preventDefault();
    if (!writeForm.student_name.trim() || !writeForm.title.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম এবং কাজের শিরোনাম লিখুন।');
      return;
    }
    const newSub = {
      id: 'sub-' + Date.now(),
      student_name: writeForm.student_name.trim(),
      class_name: writeForm.class_name,
      section: writeForm.section,
      roll: writeForm.roll_no.trim() || '—',
      type: writeForm.type,
      title: writeForm.title.trim(),
      summary: writeForm.summary.trim() || 'কোনো বিবরণ দেওয়া হয়নি।',
      file_name: writeForm.file_name,
      file_size: writeForm.file_size,
      file_type: writeForm.file_type,
      file_data: writeForm.file_data,
      status: 'অনুমোদিত',
      date: new Date().toLocaleDateString('bn-BD')
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    persistSubmissions(updated);
    setWriteForm({
      student_name: '',
      class_name: '৯ম',
      section: 'বিজ্ঞান',
      roll_no: '',
      type: 'ডিজিটাল ব্যানার',
      title: '',
      summary: '',
      file_name: '',
      file_size: '',
      file_type: '',
      file_data: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`✓ "${newSub.title}" প্রকাশনায় অন্তর্ভুক্ত হয়েছে!`);
  };

  // Delete Submission
  const handleDeleteSubmission = (id) => {
    if (!window.confirm('আপনি কি এই প্রকাশনাটি মুছে ফেলতে চান?')) return;
    const updated = submissions.filter(s => s.id !== id);
    setSubmissions(updated);
    persistSubmissions(updated);
    showToast('প্রকাশনাটি মুছে ফেলা হয়েছে।');
  };

  // Submit ICT Fair Project
  const handleSubmitProjectForm = (e) => {
    e.preventDefault();
    if (!projectForm.team.trim() || !projectForm.title.trim()) {
      alert('অনুগ্রহ করে দলের নাম ও প্রকল্পের নাম লিখুন।');
      return;
    }
    const newProj = {
      id: 'proj-' + Date.now(),
      team: projectForm.team.trim(),
      leader: projectForm.leader.trim() || 'দলনেতা',
      members: projectForm.members.trim() || '—',
      class_name: projectForm.class_name,
      section: projectForm.section,
      title: projectForm.title.trim(),
      category: projectForm.category,
      stall: projectForm.stall.trim() || 'স্টল নং-নির্ধারিত নয়',
      desc: projectForm.desc.trim() || 'প্রকল্পের বিবরণ শীঘ্রই যুক্ত হবে।'
    };
    const updated = [...projects, newProj];
    setProjects(updated);
    persistProjects(updated);
    setProjectForm({
      team: '',
      leader: '',
      members: '',
      class_name: '৯ম',
      section: 'বিজ্ঞান',
      title: '',
      category: 'রোবটিক্স ও আইওটি',
      stall: 'স্টল নং-' + (projects.length + 4),
      desc: ''
    });
    showToast(`✓ মেলায় নতুন প্রজেক্ট "${newProj.title}" নিবন্ধিত হয়েছে!`);
  };

  // Delete Project
  const handleDeleteProject = (id) => {
    if (!window.confirm('আপনি কি এই প্রকল্পটি তালিকা থেকে মুছতে চান?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    persistProjects(updated);
    showToast('প্রকল্পটি তালিকা থেকে অপসারিত হয়েছে।');
  };

  // Submit Achievement
  const handleSubmitAchForm = (e) => {
    e.preventDefault();
    if (!achForm.event.trim() || !achForm.project.trim()) {
      alert('অনুগ্রহ করে ইভেন্টের নাম ও প্রজেক্টের নাম পূরণ করুন।');
      return;
    }
    const newA = {
      id: 'ach-' + Date.now(),
      year: achForm.year.trim() || '২০২৬',
      event: achForm.event.trim(),
      award: achForm.award.trim(),
      project: achForm.project.trim(),
      recipients: achForm.recipients.trim() || 'আইসিটি ক্লাব শিক্ষার্থী',
      badge: achForm.badge.trim() || '🏆 সম্মাননা'
    };
    const updated = [newA, ...achievements];
    setAchievements(updated);
    persistAchievements(updated);
    setAchForm({
      year: '২০২৬',
      event: '',
      award: '১ম স্থান (চ্যাম্পিয়ন)',
      project: '',
      recipients: '',
      badge: '🏆 চ্যাম্পিয়ন'
    });
    showToast(`✓ নতুন সম্মাননা "${newA.event}" যুক্ত হয়েছে!`);
  };

  // Delete Achievement
  const handleDeleteAch = (id) => {
    if (!window.confirm('আপনি কি এই অর্জনটি মুছতে চান?')) return;
    const updated = achievements.filter(a => a.id !== id);
    setAchievements(updated);
    persistAchievements(updated);
    showToast('অর্জনটি অপসারিত হয়েছে।');
  };

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '16px 12px 60px 12px',
      fontFamily: "'Hind Siliguri', 'SolaimanLipi', sans-serif",
      color: '#0f172a'
    }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0c4a6e',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          zIndex: 99999,
          fontSize: '13.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '5px solid #38bdf8'
        }}>
          <span>💻</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Bar: Back to Hub */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {onBackToHub && (
          <button
            type="button"
            onClick={onBackToHub}
            style={{
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1.5px solid #bae6fd',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0f9ff'; }}
          >
            <span>←</span>
            <span>ক্লাব ও সংগঠন ডিরেক্টরি (হাব)</span>
          </button>
        )}

        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • শেখ রাসেল ডিজিটাল ল্যাব কেন্দ্র
        </div>
      </div>

      {/* Hero Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1e38 0%, #0369a1 55%, #0284c7 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px 26px',
        marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          fontSize: '120px',
          opacity: 0.08,
          pointerEvents: 'none'
        }}>
          💻
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.15)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 800,
          marginBottom: '10px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.25)'
        }}>
          <span>✨ স্মার্ট বাংলাদেশ ও প্রযুক্তি নেতৃত্বের প্রতীক</span>
          <span>•</span>
          <span>শেখ রাসেল ল্যাব</span>
        </div>

        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: 900,
          letterSpacing: '-0.3px',
          color: '#ffffff'
        }}>
          মগড়া পালস্ ডিজিটাল আইসিটি ও কোডিং ক্লাব
        </h1>

        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#e0f2fe',
          maxWidth: '980px'
        }}>
          “কোডের ছন্দে গড়ব ভবিষ্যৎ, প্রযুক্তির আলোয় আলোকিত হোক জগৎ” — কম্পিউটার প্রোগ্রামিং, পাইথন, স্ক্র্যাচ গেম মেকিং, ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন ও সাইবার নিরাপত্তা সচেতনতায় শিক্ষার্থীদের বিশ্বমানের দক্ষতায় প্রস্তুত করার ডিজিটাল কেন্দ্র।
        </p>

        {/* Badges Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span style={{ background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            🏛️ স্থাপিত: ২০২১ খ্রি.
          </span>
          <span style={{ background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            🖥️ শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব
          </span>
          <span style={{ background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            🐍 পাইথন, স্ক্র্যাচ ও এইচটিএমএল বুটক্যাম্প
          </span>
          <span style={{ background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            🛡️ সাইবার সচেতনতা সার্টিফাইড ক্লাব
          </span>
          <span style={{ background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            👥 ১১০+ খুদে কোডার সদস্য
          </span>

          <button
            type="button"
            onClick={() => setIctTab('competitions')}
            style={{
              marginLeft: 'auto',
              background: '#38bdf8',
              color: '#082f49',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <span>💻</span>
            <span>নতুন কোডিং অলিম্পিয়াড আয়োজন ও ফলাফল প্রস্তুত ➔</span>
          </button>
        </div>
      </div>

      {/* 13 Features Navigation Bar */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #bae6fd',
        borderRadius: '12px',
        padding: '10px 12px',
        marginBottom: '22px',
        boxShadow: '0 2px 10px rgba(2, 132, 199, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            আইসিটি ও কোডিং ক্লাবের ১৩টি মূল ফিচার ডিরেক্টরি:
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            যেকোনো ফিচারে ক্লিক করে সরাসরি পরিচালনা ও প্রিন্ট করুন
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {ICT_FEATURES.map((tab) => {
            const isActive = ictTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setIctTab(tab.key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  background: isActive ? '#e0f2fe' : '#ffffff',
                  color: isActive ? '#0369a1' : '#334155',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.15)' : 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#ffffff'; }}
              >
                <span>{tab.icon}</span>
                <span>{tab.num}. {tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1: ক্লাব পরিচিতি */}
      {/* ========================================================================= */}
      {ictTab === 'identity' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                🏛️ ক্লাব পরিচিতি (ICT & Coding Club Identity)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIctTab('objectives')}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: মূল লক্ষ্য ও উদ্দেশ্য ➔
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', width: '220px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>ক্লাবের নাম</td>
                <td style={{ padding: '10px 14px', fontWeight: 900, color: '#0f172a' }}>আইসিটি ও কোডিং ক্লাব</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>ইংরেজি নাম</td>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1' }}>ICT & Coding Club</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>প্রতিষ্ঠানের নাম</td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>পরিচালনা ও অভিভাবকত্ব</td>
                <td style={{ padding: '10px 14px' }}>পৃষ্ঠপোষক ও কেন্দ্রীয় উপদেষ্টা পরিষদের তত্ত্বাবধানে</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>ক্লাব সমন্বয়ক</td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>আইসিটি বিষয়ের শিক্ষক (মোঃ আবুবকর সিদ্দিক ও সমন্বয়ক প্যানেল)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>সদস্য যোগ্যতা</td>
                <td style={{ padding: '10px 14px' }}>ষষ্ঠ থেকে দশম শ্রেণির নিয়মিত শিক্ষার্থী</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>কার্যক্রমের ক্ষেত্র</td>
                <td style={{ padding: '10px 14px' }}>তথ্যপ্রযুক্তি, কৃত্রিম বুদ্ধিমত্তা (AI), রোবটিক্স, প্রোগ্রামিং, ডিজিটাল শিক্ষা ও উদ্ভাবন</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0369a1', background: '#f8fafc' }}>ক্লাবের মূলনীতি</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '4px 14px', borderRadius: '20px', fontWeight: 900, border: '1px solid #7dd3fc' }}>
                    💡 শিখব, তৈরি করব, প্রযুক্তিকে কাজে লাগাব
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Patron & Coordinator Cards */}
          <h3 style={{ fontSize: '15px', color: '#0369a1', margin: '20px 0 10px 0' }}>
            🏛️ পরিচালনা ও অভিভাবক নেতৃত্ব
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px', background: '#f0f9ff' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>প্রধান পৃষ্ঠপোষক</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={resolvedHeadPhoto}
                  alt="প্রধান শিক্ষক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{leadershipInfo.head?.name || 'মুহাম্মদ শফিকুল ইসলাম'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px', background: '#f0f9ff' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>সার্বিক পৃষ্ঠপোষকতা</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={resolvedPresidentPhoto}
                  alt="ম্যানেজিং কমিটি সভাপতি"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
                  onError={(e) => { e.target.src = PHOTO_PRESIDENT; }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{leadershipInfo.president?.name || 'নেয়ামুল হক খান'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px', background: '#f0f9ff' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>প্রধান সমন্বয়ক</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={getResolvedTeacherPhoto(panelData.coordinators?.[0]?.teacherId, panelData.coordinators?.[0]?.name || 'মোঃ আবুবকর সিদ্দিক')}
                  alt="প্রধান সমন্বয়ক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{panelData.coordinators?.[0]?.name || 'মোঃ আবুবকর সিদ্দিক'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{panelData.coordinators?.[0]?.designation || 'সহকারী শিক্ষক (কম্পিউটার/আইসিটি)'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: মূল লক্ষ্য ও উদ্দেশ্য */}
      {/* ========================================================================= */}
      {ictTab === 'objectives' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ২
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                🎯 ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য (১০টি লক্ষ্য)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIctTab('coordinators')}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: সমন্বয়ক ও বিচারক প্যানেল ➔
            </button>
          </div>

          <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
            মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের আইসিটি ও কোডিং ক্লাব শিক্ষার্থীদের আধুনিক বিশ্বের প্রযুক্তিতে দক্ষ, নৈতিক ও সৃষ্টিশীল নাগরিক হিসেবে গড়ে তোলার লক্ষ্যে নিম্নলিখিত ১০টি সুনির্দিষ্ট উদ্দেশ্য নিয়ে পরিচালিত হয়:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {[
              { num: '১', icon: '💻', title: 'তথ্য ও যোগাযোগ প্রযুক্তিতে দক্ষতা', text: 'শিক্ষার্থীদের তথ্য ও যোগাযোগ প্রযুক্তিতে দক্ষ করে গড়ে তোলা।' },
              { num: '২', icon: '🖥️', title: 'বাস্তব ব্যবহারিক জ্ঞানার্জন', text: 'কম্পিউটার ও ডিজিটাল প্রযুক্তি ব্যবহারে বাস্তব জ্ঞান অর্জনের সুযোগ সৃষ্টি করা।' },
              { num: '৩', icon: '🐍', title: 'প্রোগ্রামিং ও কোডিংয়ে আগ্রহ', text: 'প্রোগ্রামিং ও কোডিংয়ের প্রতি আগ্রহ তৈরি করা।' },
              { num: '৪', icon: '💡', title: 'ডিজিটাল সৃজনশীলতা ও উদ্ভাবন', text: 'শিক্ষার্থীদের ডিজিটাল সৃজনশীলতা ও উদ্ভাবনী শক্তি বৃদ্ধি করা।' },
              { num: '৫', icon: '🌐', title: 'নিরাপদ ও দায়িত্বশীল ইন্টারনেট', text: 'ইন্টারনেটের নিরাপদ ও দায়িত্বশীল ব্যবহার শেখানো।' },
              { num: '৬', icon: '🛡️', title: 'সাইবার নিরাপত্তা ও শিষ্টাচার', text: 'সাইবার নিরাপত্তা, ডিজিটাল গোপনীয়তা ও অনলাইন শিষ্টাচার সম্পর্কে সচেতন করা।' },
              { num: '৭', icon: '🤖', title: 'AI ও রোবটিক্সের সাথে পরিচিতকরণ', text: 'কৃত্রিম বুদ্ধিমত্তা (AI), রোবটিক্স ও আধুনিক প্রযুক্তির সঙ্গে পরিচিত করা।' },
              { num: '৮', icon: '🎨', title: 'ডিজিটাল কনটেন্ট ও ওয়েব নির্মাণ', text: 'ডিজিটাল কনটেন্ট, ওয়েবসাইট ও মাল্টিমিডিয়া তৈরির দক্ষতা গড়ে তোলা।' },
              { num: '৯', icon: '📚', title: 'শিক্ষার মান উন্নয়নে প্রযুক্তির প্রয়োগ', text: 'প্রযুক্তিকে শিক্ষার মান উন্নয়নে কাজে লাগানো।' },
              { num: '১০', icon: '🚀', title: 'ভবিষ্যৎ কর্মজীবনের প্রস্তুতি', text: 'শিক্ষার্থীদের ভবিষ্যৎ প্রযুক্তিনির্ভর কর্মজীবনের জন্য প্রস্তুত করা।' }
            ].map(obj => (
              <div key={obj.num} style={{
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '14px 16px',
                background: '#f8fafc',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                  fontWeight: 900
                }}>
                  {obj.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#0284c7', color: '#ffffff', borderRadius: '12px', padding: '1px 8px', fontSize: '11px', fontWeight: 800 }}>
                      লক্ষ্য {obj.num}
                    </span>
                    <b style={{ fontSize: '13.5px', color: '#0369a1' }}>{obj.title}</b>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    {obj.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3: সমন্বয়ক ও বিচারক প্যানেল */}
      {/* ========================================================================= */}
      {ictTab === 'coordinators' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৩
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                👨‍🏫 সমন্বয়ক ও স্থায়ী বিচারক প্যানেল
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintPanelPad}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('executive')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: কার্যনির্বাহী পরিষদ ➔
              </button>
            </div>
          </div>

          {/* Add Coordinator Form */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#0369a1', fontWeight: 800 }}>
              ➕ নতুন সমন্বয়ক অন্তর্ভুক্তি (শিক্ষকদের ড্রপ-ডাউন থেকে নির্বাচন):
            </h3>
            <form onSubmit={handleAddCoordinator} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>১. শিক্ষক নির্বাচন করুন:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={getResolvedTeacherPhoto(newCoordTeacherId)}
                    alt="নির্বাচিত শিক্ষক"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <select
                    value={newCoordTeacherId}
                    onChange={e => setNewCoordTeacherId(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>২. অর্পিত সমন্বয়ক দায়িত্ব:</label>
                <input
                  type="text"
                  value={newCoordRole}
                  onChange={e => setNewCoordRole(e.target.value)}
                  placeholder="যেমন: সহকারী সমন্বয়ক (রোবটিক্স)"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>৩. মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={newCoordPhone}
                  onChange={e => setNewCoordPhone(e.target.value)}
                  placeholder="01710-000000"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  + সমন্বয়ক যুক্ত করুন
                </button>
              </div>
            </form>
          </div>

          {/* Coordinators Grid */}
          <h3 style={{ fontSize: '14.5px', color: '#0369a1', margin: '0 0 10px 0' }}>
            👨‍🏫 বর্তমান নিয়োজিত সমন্বয়কমণ্ডলী (মোট: {toBn((panelData.coordinators || []).length)} জন):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {(panelData.coordinators || []).map(c => (
              <div key={c.id} style={{
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={getResolvedTeacherPhoto(c.teacherId, c.name)}
                    alt={c.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14px', color: '#0f172a' }}>{c.name}</b>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{c.designation}</div>
                    <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, marginTop: '2px' }}>
                      দায়িত্ব: {c.role}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569' }}>📱 {c.phone}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleStartEditCoordinator(c)}
                    style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    title="সম্পাদনা করুন"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoordinator(c.id)}
                    style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    title="অপসারণ করুন"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 3 Judges Panel */}
          <h3 style={{ fontSize: '14.5px', color: '#0c4a6e', margin: '0 0 10px 0' }}>
            ⚖️ আইসিটি ও কোডিং প্রতিযোগিতা বিচারক প্যানেল (প্রধান বিচারক ১ জন, বিচারক ২ জন):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {/* Chief Judge */}
            <div style={{ border: '2px solid #38bdf8', borderRadius: '8px', padding: '14px', background: '#f0f9ff' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                প্রধান বিচারক (১ জন)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <img
                  src={getResolvedTeacherPhoto(panelData.chiefJudge?.teacherId, panelData.chiefJudge?.name)}
                  alt={panelData.chiefJudge?.name || 'প্রধান বিচারক'}
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7', flexShrink: 0 }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <b style={{ fontSize: '14.5px', color: '#0c4a6e' }}>{panelData.chiefJudge?.name || 'মোঃ আবুবকর সিদ্দিক'}</b>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{panelData.chiefJudge?.designation || 'সহকারী শিক্ষক (কম্পিউটার)'}</div>
                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, margin: '2px 0' }}>{panelData.chiefJudge?.role}</div>
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '4px' }}>শিক্ষক পরিবর্তন করুন:</label>
                <select
                  value={panelData.chiefJudge?.teacherId || ''}
                  onChange={e => handleChangeJudge('chiefJudge', e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  {activeTeachers.map(t => (
                    <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                      {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Judge 1 */}
            <div style={{ border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px', background: '#ffffff' }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                বিচারক (১ম)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <img
                  src={getResolvedTeacherPhoto(panelData.judge1?.teacherId, panelData.judge1?.name)}
                  alt={panelData.judge1?.name || 'বিচারক (১)'}
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0369a1', flexShrink: 0 }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <b style={{ fontSize: '14px', color: '#0f172a' }}>{panelData.judge1?.name || 'মোঃ হাবিবুর রহমান'}</b>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{panelData.judge1?.designation || 'সিনিয়র শিক্ষক'}</div>
                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, margin: '2px 0' }}>{panelData.judge1?.role}</div>
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '4px' }}>শিক্ষক পরিবর্তন করুন:</label>
                <select
                  value={panelData.judge1?.teacherId || ''}
                  onChange={e => handleChangeJudge('judge1', e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  {activeTeachers.map(t => (
                    <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                      {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Judge 2 */}
            <div style={{ border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px', background: '#ffffff' }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                বিচারক (২য়)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <img
                  src={getResolvedTeacherPhoto(panelData.judge2?.teacherId, panelData.judge2?.name)}
                  alt={panelData.judge2?.name || 'বিচারক (২)'}
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0369a1', flexShrink: 0 }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <b style={{ fontSize: '14px', color: '#0f172a' }}>{panelData.judge2?.name || 'মোঃ রফিকুল ইসলাম'}</b>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{panelData.judge2?.designation || 'সহকারী শিক্ষক'}</div>
                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, margin: '2px 0' }}>{panelData.judge2?.role}</div>
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '4px' }}>শিক্ষক পরিবর্তন করুন:</label>
                <select
                  value={panelData.judge2?.teacherId || ''}
                  onChange={e => handleChangeJudge('judge2', e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  {activeTeachers.map(t => (
                    <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                      {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4: কার্যনির্বাহী পরিষদ */}
      {/* ========================================================================= */}
      {ictTab === 'executive' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৪
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                👥 কার্যনির্বাহী পরিষদ (Executive Committee)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintExecPad}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('regular_activities')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: নিয়মিত কার্যক্রম ➔
              </button>
            </div>
          </div>

          {/* 7 Core Executive Officers */}
          <h3 style={{ fontSize: '14.5px', color: '#0369a1', margin: '0 0 10px 0' }}>
            ⚙️ মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ — প্রতিটি পদের পাশে এডিট অপশন):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { key: 'president', role: 'সভাপতি (১ জন)', icon: '👑', data: execData.president },
              { key: 'vicePresident', role: 'সহ-সভাপতি (১ জন)', icon: '🎖️', data: execData.vicePresident },
              { key: 'generalSecretary', role: 'সাধারণ সম্পাদক (১ জন)', icon: '📋', data: execData.generalSecretary },
              { key: 'jointSecretary', role: 'যুগ্ম সম্পাদক (১ জন)', icon: '🤝', data: execData.jointSecretary },
              { key: 'organizingSecretary', role: 'সাংগঠনিক সম্পাদক (১ জন)', icon: '⚡', data: execData.organizingSecretary },
              { key: 'publicitySecretary', role: 'প্রচার ও প্রকাশনা সম্পাদক (১ জন)', icon: '📢', data: execData.publicitySecretary },
              { key: 'financeSecretary', role: 'অর্থ সম্পাদক (১ জন)', icon: '💰', data: execData.financeSecretary }
            ].map(p => (
              <div key={p.key} style={{
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{p.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1' }}>{p.role}</span>
                  </div>
                  <b style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{p.data.name}</b>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    শ্রেণি: {p.data.class} • শাখা/বিভাগ: <b>{p.data.section || '—'}</b> • রোল: {toBn(p.data.roll)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>📱 {p.data.phone || '—'}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartEditPost(p.key, p.data)}
                  style={{
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '1px solid #7dd3fc',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✏️ এডিট
                </button>
              </div>
            ))}
          </div>

          {/* Add Executive Member Form with Branch/Division */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#166534', fontWeight: 800 }}>
              👥 কার্যনির্বাহী সদস্যবৃন্দ (একাধিক সদস্য যুক্তকরণ — নাম, শ্রেণির পর শাখা/বিভাগ ফিল্ড):
            </h3>
            <form onSubmit={handleAddExecMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  placeholder="যেমন: আবরার জামিল"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি:</label>
                <select
                  value={newMemberClass}
                  onChange={e => handleMemberClassChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা / বিভাগ:</label>
                <select
                  value={newMemberSection}
                  onChange={e => setNewMemberSection(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {getSectionOptionsForClass(newMemberClass).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল নং:</label>
                <input
                  type="text"
                  value={newMemberRoll}
                  onChange={e => setNewMemberRoll(e.target.value)}
                  placeholder="যেমন: ৩"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  + সদস্য যুক্ত করুন
                </button>
              </div>
            </form>
          </div>

          {/* Current Executive Members Grid with Edit & Delete */}
          <h3 style={{ fontSize: '14.5px', color: '#0f172a', margin: '0 0 10px 0' }}>
            👥 বর্তমান সাধারণ কার্যনির্বাহী সদস্যবৃন্দ (মোট: {toBn((execData.members || []).length)} জন — এডিট ও ডিলিট অপশন):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {(execData.members || []).map(m => (
              <div key={m.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{m.name}</b>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    শ্রেণি: {m.class} • শাখা/বিভাগ: <b>{m.section || '—'}</b> • রোল: {toBn(m.roll)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleStartEditMember(m)}
                    style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    title="সদস্যের তথ্য সম্পাদনা করুন"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExecMember(m.id)}
                    style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    title="সদস্যকে অপসারণ করুন"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 5: আইসিটি ক্লাবের নিয়মিত কার্যক্রম */}
      {/* ========================================================================= */}
      {ictTab === 'regular_activities' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৫
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                ⚡ আইসিটি ক্লাবের নিয়মিত কার্যক্রম (মোট: {toBn(activities.length)}টি কার্যক্রম — এডিট ও ডিলিট সুবিধা)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewActivity}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>➕</span>
                <span>নতুন কার্যক্রম যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintActivitiesPad}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>প্যাডে প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('yearly_calendar')}
                style={{ background: '#0369a1', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার ➔
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {activities.map((act, idx) => (
              <div key={act.id || idx} style={{
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                background: '#f8fafc',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: '#0284c7', color: '#ffffff', borderRadius: '12px', padding: '2px 9px', fontSize: '11px', fontWeight: 800 }}>
                        কার্যক্রম {toBn(act.num || idx + 1)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                        {act.focus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditActivity(act)}
                        style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #86efac',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="সম্পাদনা করুন"
                      >
                        ✏️ এডিট
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(act.id)}
                        style={{
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="মুছে ফেলুন"
                      >
                        🗑️ ডিলিট
                      </button>
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0c4a6e', fontWeight: 800 }}>
                    {act.title}
                  </h3>

                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                    {act.details}
                  </p>
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <div>⏰ <b>সময়:</b> {act.time}</div>
                  <div>📍 <b>ভেন্যু:</b> {act.venue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 6: বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার */}
      {/* ========================================================================= */}
      {ictTab === 'yearly_calendar' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৬
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                📅 বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার (এডিট ও ডিলিট সুবিধা)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintProgramsPad}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('selection_rules')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: সদস্য নির্বাচনের নিয়ম ➔
              </button>
            </div>
          </div>

          {/* 4 Quarterly Roadmap Cards with Edit & Delete */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', color: '#0369a1', margin: 0, fontWeight: 800 }}>
              🎯 ত্রৈমাসিক কর্মপরিকল্পনা রোডম্যাপ (Quarterly Roadmap — প্রতিটি কার্ডে এডিট ও ডিলিট):
            </h3>
            <button
              type="button"
              onClick={handleAddNewQuarter}
              style={{
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ➕ নতুন ত্রৈমাসিক রোডম্যাপ যুক্ত করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '14px', marginBottom: '26px' }}>
            {quarterlyPlans.map((q, idx) => (
              <div key={q.id || idx} style={{
                border: '1.5px solid ' + (q.color || '#0284c7'),
                borderRadius: '10px',
                padding: '16px',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: q.color || '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800 }}>
                      {q.quarter}
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditQuarter(q, idx)}
                        style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #86efac',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="রোডম্যাপ সম্পাদনা করুন"
                      >
                        ✏️ এডিট
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuarter(q.id || idx)}
                        style={{
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="রোডম্যাপ মুছে ফেলুন"
                      >
                        🗑️ ডিলিট
                      </button>
                    </div>
                  </div>

                  <h4 style={{ margin: '8px 0 8px 0', fontSize: '14px', color: q.color || '#0284c7', fontWeight: 900 }}>
                    {q.title}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                    {(q.items || []).map((it, iIdx) => (
                      <li key={iIdx} style={{ marginBottom: '4px' }}>{it}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* 12 Months Timeline with Edit & Delete */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', color: '#0c4a6e', margin: 0, fontWeight: 800 }}>
              🗓️ ১২ মাসের ধারাবাহিক অ্যাক্টিভিটি ক্যালেন্ডার (প্রতিটি মাসে এডিট ও ডিলিট অপশন):
            </h3>
            <button
              type="button"
              onClick={handleAddNewMonth}
              style={{
                background: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #7dd3fc',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ➕ নতুন মাসের কর্মসূচি যুক্ত করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {monthlyCalendar.map((m, i) => (
              <div key={m.id || i} style={{
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b style={{ fontSize: '13.5px', color: '#0369a1' }}>{m.month}</b>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({m.date})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '3px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditMonth(m, i)}
                        style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #86efac',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="সম্পাদনা করুন"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMonth(m.id || i)}
                        style={{
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="মুছে ফেলুন"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{m.title}</div>
                </div>

                <div style={{ fontSize: '11px', color: '#047857', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                  👨‍🏫 সমন্বয়ক: {m.coordinator}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 7: সদস্য নির্বাচনের নিয়ম */}
      {/* ========================================================================= */}
      {ictTab === 'selection_rules' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৭
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                📜 সদস্য নির্বাচনের নিয়ম ({toBn(selectionRules.length)}টি সুনির্দিষ্ট মানদণ্ড)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewSelectionRule}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(2,132,199,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন মানদণ্ড যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintRulesPad}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('membership')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: আবেদন গ্রহণ ও নির্বাচন ➔
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
            আইসিটি ও কোডিং ক্লাবের স্বচ্ছতা, সমসুযোগ এবং মেধার যথোপযুক্ত মূল্যায়নের জন্য সদস্য নির্বাচনের ক্ষেত্রে নিম্নোক্ত নীতিমালা অনুসরণ করা হয়:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {selectionRules.map((r, idx) => (
              <div key={r.id || idx} style={{
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                background: '#f0f9ff',
                borderLeft: '5px solid #0284c7',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(2,132,199,0.04)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#0284c7', color: '#ffffff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>
                        {r.num}
                      </span>
                      <b style={{ fontSize: '14.5px', color: '#0369a1' }}>{r.title}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditSelectionRule(r)}
                        title="মানদণ্ড এডিট করুন"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #bae6fd',
                          borderRadius: '5px',
                          color: '#0284c7',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>✏️</span>
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSelectionRule(r)}
                        title="মানদণ্ড মুছে ফেলুন"
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '5px',
                          color: '#e11d48',
                          padding: '3px 7px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    {r.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 8: আবেদন গ্রহণ ও সদস্য নির্বাচন */}
      {/* ========================================================================= */}
      {ictTab === 'membership' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৮
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                📝 আবেদন গ্রহণ ও সদস্য নির্বাচন (Membership Application)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintMembersDirectory}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>সদস্য ডিরেক্টরি প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('discipline_safety')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: শৃঙ্খলা ও নিরাপত্তাবিধি ➔
              </button>
            </div>
          </div>

          {/* Member Registration Form with Branch/Division */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '18px',
            marginBottom: '22px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0369a1', fontWeight: 800 }}>
              📝 আইসিটি ক্লাবে নতুন সদস্যপদ প্রাপ্তির আবেদন ফরম:
            </h3>

            <form onSubmit={handleSubmitMembershipForm} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম *</label>
                <input
                  type="text"
                  required
                  value={memberForm.student_name}
                  onChange={e => setMemberForm({ ...memberForm, student_name: e.target.value })}
                  placeholder="যেমন: ফারদিন হাসান"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি *</label>
                <select
                  value={memberForm.class_name}
                  onChange={e => {
                    const cls = e.target.value;
                    const defaultSec = (cls === '৯ম' || cls === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                    setMemberForm({ ...memberForm, class_name: cls, section: defaultSec });
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা / বিভাগ *</label>
                <select
                  value={memberForm.section}
                  onChange={e => setMemberForm({ ...memberForm, section: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {getSectionOptionsForClass(memberForm.class_name).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল নং *</label>
                <input
                  type="text"
                  required
                  value={memberForm.roll_no}
                  onChange={e => setMemberForm({ ...memberForm, roll_no: e.target.value })}
                  placeholder="যেমন: ১"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>অভিভাবকের নাম</label>
                <input
                  type="text"
                  value={memberForm.guardian_name}
                  onChange={e => setMemberForm({ ...memberForm, guardian_name: e.target.value })}
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={memberForm.mobile}
                  onChange={e => setMemberForm({ ...memberForm, mobile: e.target.value })}
                  placeholder="017XXXXXXXX"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>পছন্দের প্রযুক্তি শাখা</label>
                <select
                  value={memberForm.interests}
                  onChange={e => setMemberForm({ ...memberForm, interests: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="কোডিং ও প্রোগ্রামিং (Python & Web)">কোডিং ও প্রোগ্রামিং (Python & Web)</option>
                  <option value="ডিজিটাল ডিজাইন ও ব্যানার মেকিং">ডিজিটাল ডিজাইন ও ব্যানার মেকিং</option>
                  <option value="রোবটিক্স ও আরডুইনো হার্ডওয়্যার">রোবটিক্স ও আরডুইনো হার্ডওয়্যার</option>
                  <option value="সাইবার নিরাপত্তা ও নিরাপদ ইন্টারনেট">সাইবার নিরাপত্তা ও নিরাপদ ইন্টারনেট</option>
                  <option value="কম্পিউটার টাইপিং ও অফিস অ্যাপ্লিকেশন">কম্পিউটার টাইপিং ও অফিস অ্যাপ্লিকেশন</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কম্পিউটার ব্যবহারের সুযোগ</label>
                <select
                  value={memberForm.device_access}
                  onChange={e => setMemberForm({ ...memberForm, device_access: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="বিদ্যালয়ের শেখ রাসেল ল্যাবে অনুশীলন">বিদ্যালয়ের শেখ রাসেল ল্যাবে অনুশীলন করব</option>
                  <option value="বাড়িতে কম্পিউটার ও ল্যাপটপ আছে">বাড়িতে কম্পিউটার ও ল্যাপটপ আছে</option>
                  <option value="স্মার্টফোনে কোডিং অনুশীলন করি">স্মার্টফোনে কোডিং অনুশীলন করি</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ক্লাবে যোগদানের কারণ ও আগ্রহের ক্ষেত্র:</label>
                <textarea
                  rows="2"
                  value={memberForm.reason}
                  onChange={e => setMemberForm({ ...memberForm, reason: e.target.value })}
                  placeholder="আপনি আইসিটি ক্লাবে যুক্ত হয়ে কী কী শিখতে বা তৈরি করতে চান সংক্ষেপে লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 24px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🚀 আবেদন জমা দিন ও রসিদ প্রস্তুত করুন
                </button>
              </div>
            </form>
          </div>

          {/* Members Applications List */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '14.5px', color: '#0f172a' }}>
              📋 জমা হওয়া আবেদন ও সদস্য ডিরেক্টরি (মোট: {toBn(memberships.length)} জন):
            </h3>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'অপেক্ষমান', 'অনুমোদিত', 'বাতিল'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setMemberFilterStatus(st)}
                  style={{
                    background: memberFilterStatus === st ? '#0284c7' : '#f1f5f9',
                    color: memberFilterStatus === st ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {st === 'all' ? 'সকল আবেদন' : st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #bae6fd' }}>
                  <th style={{ padding: '8px', textAlign: 'center', width: '35px' }}>ক্র.</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>ট্র্যাকিং নম্বর</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>শ্রেণি ও শাখা</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>রোল</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>পছন্দের উইং</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>অবস্থা</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {memberships
                  .filter(m => memberFilterStatus === 'all' || m.status === memberFilterStatus)
                  .map((m, idx) => (
                    <tr key={m.trackingId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{toBn(idx + 1)}.</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace', color: '#0369a1', fontWeight: 800 }}>{m.trackingId}</td>
                      <td style={{ padding: '8px' }}>
                        <b>{m.student_name}</b>
                        {m.mobile && <div style={{ fontSize: '11px', color: '#64748b' }}>📱 {m.mobile}</div>}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {m.class_name} • <b>{m.section || '—'}</b>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{toBn(m.roll_no)}</td>
                      <td style={{ padding: '8px', color: '#0369a1', fontWeight: 600 }}>{m.interests}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <span style={{
                          background: m.status === 'অনুমোদিত' ? '#dcfce7' : m.status === 'বাতিল' ? '#fee2e2' : '#fef3c7',
                          color: m.status === 'অনুমোদিত' ? '#166534' : m.status === 'বাতিল' ? '#991b1b' : '#92400e',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handlePrintMemberReceipt(m)}
                            style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #7dd3fc', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            title="রসিদ প্রিন্ট করুন"
                          >
                            🖨️
                          </button>
                          {m.status !== 'অনুমোদিত' && (
                            <button
                              type="button"
                              onClick={() => handleApproveMembership(m.trackingId)}
                              style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                              title="অনুমোদন করুন"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteMembership(m.trackingId)}
                            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            title="মুছে ফেলুন"
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
      {/* FEATURE 9: শৃঙ্খলা ও নিরাপত্তাবিধি */}
      {/* ========================================================================= */}
      {ictTab === 'discipline_safety' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৯
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#b91c1c' }}>
                🛡️ শৃঙ্খলা ও নিরাপত্তাবিধি ({toBn(disciplineRules.length)}টি বাধ্যতামূলক নিয়ম)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewDisciplineRule}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন নিরাপত্তাবিধি যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintConductPad}
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1.5px solid #fca5a5',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('competitions')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: কুইজ ও প্রতিযোগিতা ➔
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '22px' }}>
            {disciplineRules.map((r, idx) => (
              <div key={r.id || idx} style={{
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '14px 16px',
                background: '#fff5f5',
                borderLeft: '5px solid #ef4444',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(239,68,68,0.04)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#ef4444', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, flexShrink: 0 }}>
                        {r.num}
                      </span>
                      <b style={{ fontSize: '14px', color: '#991b1b' }}>{r.rule}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditDisciplineRule(r)}
                        title="নিয়ম এডিট করুন"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fecaca',
                          borderRadius: '5px',
                          color: '#dc2626',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>✏️</span>
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDisciplineRule(r)}
                        title="নিয়ম মুছে ফেলুন"
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          borderRadius: '5px',
                          color: '#991b1b',
                          padding: '3px 7px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Student Cyber Safety Pledge */}
          <div style={{
            background: '#f0f9ff',
            border: '1.5px solid #bae6fd',
            borderRadius: '10px',
            padding: '18px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0369a1', fontWeight: 800 }}>
              ✍️ শিক্ষার্থী ডিজিটাল ও ল্যাব নিরাপত্তা অঙ্গীকারনামা:
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
              শেখ রাসেল ল্যাব ব্যবহারের পূর্বে প্রতিটি শিক্ষার্থীকে এই অঙ্গীকারনামা পূরণ ও স্বাক্ষর করতে হবে।
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  value={pledgeForm.student_name}
                  onChange={e => setPledgeForm({ ...pledgeForm, student_name: e.target.value })}
                  placeholder="যেমন: ফারদিন হাসান"
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শ্রেণি:</label>
                <select
                  value={pledgeForm.class_name}
                  onChange={e => setPledgeForm({ ...pledgeForm, class_name: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ</option>
                  <option value="৭ম">৭ম</option>
                  <option value="৮ম">৮ম</option>
                  <option value="৯ম">৯ম</option>
                  <option value="১০ম">১০ম</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শাখা / বিভাগ:</label>
                <select
                  value={pledgeForm.section}
                  onChange={e => setPledgeForm({ ...pledgeForm, section: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  {getSectionOptionsForClass(pledgeForm.class_name).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>রোল নং:</label>
                <input
                  type="text"
                  value={pledgeForm.roll_no}
                  onChange={e => setPledgeForm({ ...pledgeForm, roll_no: e.target.value })}
                  placeholder="যেমন: ১"
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pledgeForm.signed}
                onChange={e => setPledgeForm({ ...pledgeForm, signed: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>আমি শপথ করছি যে, আমি সকল নিয়ম ও সাইবার নিরাপত্তা নীতিমালা অক্ষরে অক্ষরে পালন করব।</span>
            </label>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 10: কুইজ/বির্তক প্রতিযোগিতা ও ফলাফল */}
      {/* ========================================================================= */}
      {ictTab === 'competitions' && (
        <div>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #bae6fd',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              ফিচার ১০
            </span>
            <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#0369a1' }}>
              🏆 আইসিটি কুইজ, বিতর্ক ও কোডিং অলিম্পিয়াড পরিচালনা ও ফলাফল প্রস্তুত
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              প্রোগ্রামিং অলিম্পিয়াড, সাইবার নিরাপত্তা কুইজ, আইসিটি বিতর্ক স্কোরিং ও চূড়ান্ত ফলাফল বিদ্যালয় প্যাডে প্রিন্ট করুন
            </p>
          </div>

          <ClubCompetitionEngine activeClub="ict" teachers={teachers} />

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIctTab('discipline_safety')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: শৃঙ্খলা ও নিরাপত্তাবিধি
            </button>
            <button
              type="button"
              onClick={() => setIctTab('digital_showcase')}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: ডিজিটাল ব্যানার ও পোস্টার প্রকাশ ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 11: ডিজিটাল ব্যানার ও পোষ্টার প্রকাশ */}
      {/* ========================================================================= */}
      {ictTab === 'digital_showcase' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১১
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                🎨 ডিজিটাল ব্যানার ও পোস্টার প্রকাশনা (Digital Showcase)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIctTab('ict_fair')}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: আইসিটি মেলার আয়োজন ➔
            </button>
          </div>

          {/* Student Work Submission Form with File Upload & Branch/Division */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '18px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0369a1', fontWeight: 800 }}>
              📤 ডিজিটাল ব্যানার, পোস্টার বা কোডিং স্ক্রিপ্ট জমা দিন:
            </h3>

            <form onSubmit={handleSubmitWriteForm} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম *</label>
                <input
                  type="text"
                  required
                  value={writeForm.student_name}
                  onChange={e => setWriteForm({ ...writeForm, student_name: e.target.value })}
                  placeholder="যেমন: ফারদিন হাসান"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি *</label>
                <select
                  value={writeForm.class_name}
                  onChange={e => {
                    const cls = e.target.value;
                    const defaultSec = (cls === '৯ম' || cls === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                    setWriteForm({ ...writeForm, class_name: cls, section: defaultSec });
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা / বিভাগ *</label>
                <select
                  value={writeForm.section}
                  onChange={e => setWriteForm({ ...writeForm, section: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {getSectionOptionsForClass(writeForm.class_name).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল নং *</label>
                <input
                  type="text"
                  required
                  value={writeForm.roll_no}
                  onChange={e => setWriteForm({ ...writeForm, roll_no: e.target.value })}
                  placeholder="যেমন: ১"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কাজের ধরন *</label>
                <select
                  value={writeForm.type}
                  onChange={e => setWriteForm({ ...writeForm, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="ডিজিটাল ব্যানার">ডিজিটাল ব্যানার</option>
                  <option value="সাইবার নিরাপত্তা পোস্টার">সাইবার নিরাপত্তা পোস্টার</option>
                  <option value="পাইথন স্ক্রিপ্ট">পাইথন স্ক্রিপ্ট (Python Script)</option>
                  <option value="স্ক্র্যাচ গেম প্রজেক্ট">স্ক্র্যাচ গেম প্রজেক্ট (Scratch Project)</option>
                  <option value="ওয়েব ডিজাইন কনসেপ্ট">ওয়েব ডিজাইন কনসেপ্ট (HTML/CSS)</option>
                  <option value="ডিজিটাল চিত্রাঙ্কন">ডিজিটাল চিত্রাঙ্কন ও আর্টওয়ার্ক</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কাজের শিরোনাম বা প্রজেক্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={writeForm.title}
                  onChange={e => setWriteForm({ ...writeForm, title: e.target.value })}
                  placeholder="যেমন: স্মার্ট বাংলাদেশ ও নিরাপদ ইন্টারনেট পোস্টার"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কাজের বিস্তারিত বিবরণ বা কোড স্নিপেট:</label>
                <textarea
                  rows="3"
                  value={writeForm.summary}
                  onChange={e => setWriteForm({ ...writeForm, summary: e.target.value })}
                  placeholder="আপনার ব্যানার বা পোস্টারের মূল বার্তা অথবা কোডের বিবরণ এখানে লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {/* File Upload Section */}
              <div style={{ gridColumn: '1 / -1', background: '#ffffff', border: '1.5px dashed #38bdf8', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <b style={{ fontSize: '13px', color: '#0369a1' }}>📁 ডিজিটাল ফাইল আপলোড (ছবি, পিডিএফ, কোড বা টেক্সট ফাইল):</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>সমর্থিত ফাইল: PNG, JPG, PDF, TXT, PY, HTML (সর্বোচ্চ ১৫ মেগাবাইট)</div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,.txt,.py,.html"
                    onChange={handleFileUpload}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                {writeForm.file_name && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e0f2fe', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    <span>✓ <b>সংযুক্ত ফাইল:</b> {writeForm.file_name} ({writeForm.file_size})</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      মুছে ফেলুন ✕
                    </button>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 24px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🚀 প্রকাশনার জন্য জমা দিন
                </button>
              </div>
            </form>
          </div>

          {/* Published Showcase Gallery */}
          <h3 style={{ fontSize: '15px', color: '#0369a1', margin: '0 0 12px 0' }}>
            🖼️ প্রকাশিত ডিজিটাল ব্যানার, পোস্টার ও প্রজেক্ট গ্যালারি:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {submissions.map(item => (
              <div key={item.id} style={{
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.date}</span>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0c4a6e', fontWeight: 800 }}>
                    {item.title}
                  </h4>

                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.summary}
                  </p>

                  <div style={{ fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <div>স্রষ্টা: <b>{item.student_name}</b> ({item.class_name} • {item.section || '—'} • রোল {toBn(item.roll)})</div>
                    {item.file_name && <div style={{ color: '#0284c7', fontSize: '11px', marginTop: '2px' }}>📁 {item.file_name}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReadingItem(item)}
                    style={{ flex: 1, background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📖 বিস্তারিত দেখুন ও প্রিন্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubmission(item.id)}
                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    title="মুছে ফেলুন"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 12: আইসিটি মেলার আয়োজন */}
      {/* ========================================================================= */}
      {ictTab === 'ict_fair' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১২
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                🚀 আইসিটি মেলার আয়োজন ও প্রজেক্ট প্রদর্শনী (ICT Fair & Expo)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintProjectsPad}
                style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1.5px solid #7dd3fc',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>মেলা ডিরেক্টরি প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setIctTab('achievements')}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: অর্জন ও ট্রফি গ্যালারি ➔
              </button>
            </div>
          </div>

          {/* Project Registration Form with Branch/Division */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '18px',
            marginBottom: '22px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0369a1', fontWeight: 800 }}>
              ➕ প্রযুক্তি মেলায় নতুন স্টল / ইনোভেশন প্রজেক্ট নিবন্ধন:
            </h3>

            <form onSubmit={handleSubmitProjectForm} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>দলের নাম (Team Name) *</label>
                <input
                  type="text"
                  required
                  value={projectForm.team}
                  onChange={e => setProjectForm({ ...projectForm, team: e.target.value })}
                  placeholder="যেমন: স্মার্ট এগ্রো টিমস"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>দলনেতার নাম</label>
                <input
                  type="text"
                  value={projectForm.leader}
                  onChange={e => setProjectForm({ ...projectForm, leader: e.target.value })}
                  placeholder="যেমন: মাহিন সরকার"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি</label>
                <select
                  value={projectForm.class_name}
                  onChange={e => {
                    const cls = e.target.value;
                    const defaultSec = (cls === '৯ম' || cls === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                    setProjectForm({ ...projectForm, class_name: cls, section: defaultSec });
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা / বিভাগ</label>
                <select
                  value={projectForm.section}
                  onChange={e => setProjectForm({ ...projectForm, section: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {getSectionOptionsForClass(projectForm.class_name).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>অন্যান্য সদস্যবৃন্দ</label>
                <input
                  type="text"
                  value={projectForm.members}
                  onChange={e => setProjectForm({ ...projectForm, members: e.target.value })}
                  placeholder="যেমন: ফাতেমা আক্তার, রিফাত হাসান"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>প্রকল্পের বিষয় / ক্যাটাগরি</label>
                <select
                  value={projectForm.category}
                  onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="রোবটিক্স ও আইওটি">রোবটিক্স ও আইওটি (IoT)</option>
                  <option value="গ্রিন টেকনোলজি ও অটোমেশন">গ্রিন টেকনোলজি ও অটোমেশন</option>
                  <option value="সফটওয়্যার ও ওয়েব অ্যাপ্লিকেশন">সফটওয়্যার ও ওয়েব অ্যাপ্লিকেশন</option>
                  <option value="কৃত্রিম বুদ্ধিমত্তা ও ডেটা সায়েন্স">কৃত্রিম বুদ্ধিমত্তা ও ডেটা সায়েন্স</option>
                  <option value="সাইবার নিরাপত্তা সচেতনতা বুথ">সাইবার নিরাপত্তা সচেতনতা বুথ</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>প্রকল্পের পূর্ণ নাম / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="যেমন: স্বয়ংক্রিয় কৃষি সেচ ব্যবস্থা (Arduino IoT)"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>প্রকল্পের সংক্ষিপ্ত কার্যপ্রণালী ও উপকারিতা:</label>
                <textarea
                  rows="2"
                  value={projectForm.desc}
                  onChange={e => setProjectForm({ ...projectForm, desc: e.target.value })}
                  placeholder="প্রকল্পটি কীভাবে কাজ করে এবং সমাজের কী উপকার করবে লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 24px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🚀 মেলায় প্রজেক্ট অন্তর্ভুক্ত করুন
                </button>
              </div>
            </form>
          </div>

          {/* Stalls & Projects List */}
          <h3 style={{ fontSize: '15px', color: '#0369a1', margin: '0 0 12px 0' }}>
            🎪 নিবন্ধিত স্টল ও প্রযুক্তি প্রকল্পসমূহ (মোট: {toBn(projects.length)}টি প্রজেক্ট):
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {projects.map(p => (
              <div key={p.id} style={{
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
                boxShadow: '0 1px 5px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                    {p.stall}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '2px 8px', borderRadius: '12px' }}>
                    {p.category}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0c4a6e', fontWeight: 800 }}>
                  {p.title}
                </h4>

                <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                  {p.desc}
                </p>

                <div style={{ fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <div>দল: <b>{p.team}</b></div>
                  <div>দলনেতা: {p.leader} | সদস্য: {p.members}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(p.id)}
                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                  >
                    🗑️ প্রকল্প অপসারণ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 13: অর্জন ও ট্রফি গ্যালারি */}
      {/* ========================================================================= */}
      {ictTab === 'achievements' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(2,132,199,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১৩
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0369a1' }}>
                🏅 অর্জন ও ট্রফি গ্যালারি (Achievements & Trophy Gallery)
              </h2>
            </div>
            <button
              type="button"
              onClick={handlePrintAchievementsPad}
              style={{
                background: '#f0f9ff',
                color: '#0369a1',
                border: '1.5px solid #7dd3fc',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖨️</span>
              <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Add Achievement Form */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '22px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#0369a1', fontWeight: 800 }}>
              ➕ নতুন জাতীয় বা আঞ্চলিক সম্মাননা যুক্ত করুন:
            </h3>

            <form onSubmit={handleSubmitAchForm} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শিক্ষাবর্ষ / সাল:</label>
                <input
                  type="text"
                  value={achForm.year}
                  onChange={e => setAchForm({ ...achForm, year: e.target.value })}
                  placeholder="২০২৬"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>প্রতিযোগিতা বা ইভেন্টের নাম:</label>
                <input
                  type="text"
                  required
                  value={achForm.event}
                  onChange={e => setAchForm({ ...achForm, event: e.target.value })}
                  placeholder="যেমন: কালিহাতী বিজ্ঞান মেলা"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>অর্জিত স্থান বা সম্মাননা:</label>
                <input
                  type="text"
                  required
                  value={achForm.award}
                  onChange={e => setAchForm({ ...achForm, award: e.target.value })}
                  placeholder="যেমন: ১ম স্থান (চ্যাম্পিয়ন)"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>প্রকল্পের বিষয়:</label>
                <input
                  type="text"
                  required
                  value={achForm.project}
                  onChange={e => setAchForm({ ...achForm, project: e.target.value })}
                  placeholder="যেমন: স্মার্ট স্কুল মডেল"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিজয়ীদের নাম:</label>
                <input
                  type="text"
                  value={achForm.recipients}
                  onChange={e => setAchForm({ ...achForm, recipients: e.target.value })}
                  placeholder="যেমন: ফারদিন হাসান ও দল"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  + সম্মাননা যোগ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Trophy Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {achievements.map(a => (
              <div key={a.id} style={{
                border: '1.5px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                background: '#f8fafc',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                    {a.badge}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>সাল: {toBn(a.year)}</span>
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0369a1', fontWeight: 800 }}>
                  {a.event}
                </h4>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                  🏅 {a.award}
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#334155' }}>
                  <b>প্রজেক্ট:</b> {a.project}
                </p>

                <div style={{ fontSize: '12px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                  বিজয়ী শিক্ষার্থী: <b>{a.recipients}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteAch(a.id)}
                    style={{ background: 'transparent', color: '#991b1b', border: 'none', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT COORDINATOR */}
      {/* ========================================================================= */}
      {editingCoordinator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0369a1', fontWeight: 800 }}>
              ✏️ সমন্বয়কের তথ্য সম্পাদনা করুন
            </h3>
            <form onSubmit={handleSaveCoordinatorEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষকের নাম:</label>
                <input
                  type="text"
                  required
                  value={coordEditForm.name}
                  onChange={e => setCoordEditForm({ ...coordEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মূল পদবী:</label>
                <input
                  type="text"
                  required
                  value={coordEditForm.designation}
                  onChange={e => setCoordEditForm({ ...coordEditForm, designation: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ক্লাবে দায়িত্ব:</label>
                <input
                  type="text"
                  required
                  value={coordEditForm.role}
                  onChange={e => setCoordEditForm({ ...coordEditForm, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={coordEditForm.phone}
                  onChange={e => setCoordEditForm({ ...coordEditForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCoordinator(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT EXECUTIVE POST */}
      {/* ========================================================================= */}
      {editingExecPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0369a1', fontWeight: 800 }}>
              ✏️ পদাধিকারীর তথ্য সম্পাদনা ({editingExecPost})
            </h3>
            <form onSubmit={handleSavePostEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={execEditForm.name}
                  onChange={e => setExecEditForm({ ...execEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি:</label>
                  <select
                    value={execEditForm.class}
                    onChange={e => {
                      const cls = e.target.value;
                      const defaultSec = (cls === '৯ম' || cls === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                      setExecEditForm({ ...execEditForm, class: cls, section: defaultSec });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ</option>
                    <option value="৭ম">৭ম</option>
                    <option value="৮ম">৮ম</option>
                    <option value="৯ম">৯ম</option>
                    <option value="১০ম">১০ম</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা / বিভাগ:</label>
                  <select
                    value={execEditForm.section}
                    onChange={e => setExecEditForm({ ...execEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {getSectionOptionsForClass(execEditForm.class).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল নং:</label>
                  <input
                    type="text"
                    value={execEditForm.roll}
                    onChange={e => setExecEditForm({ ...execEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মোবাইল নম্বর:</label>
                  <input
                    type="text"
                    value={execEditForm.phone}
                    onChange={e => setExecEditForm({ ...execEditForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExecPost(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT EXECUTIVE MEMBER */}
      {/* ========================================================================= */}
      {editingExecMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0369a1', fontWeight: 800 }}>
              ✏️ সাধারণ কার্যনির্বাহী সদস্যের তথ্য সম্পাদনা
            </h3>
            <form onSubmit={handleSaveMemberEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={memberEditForm.name}
                  onChange={e => setMemberEditForm({ ...memberEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি:</label>
                  <select
                    value={memberEditForm.class}
                    onChange={e => {
                      const cls = e.target.value;
                      const defaultSec = (cls === '৯ম' || cls === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                      setMemberEditForm({ ...memberEditForm, class: cls, section: defaultSec });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ</option>
                    <option value="৭ম">৭ম</option>
                    <option value="৮ম">৮ম</option>
                    <option value="৯ম">৯ম</option>
                    <option value="১০ম">১০ম</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা / বিভাগ:</label>
                  <select
                    value={memberEditForm.section}
                    onChange={e => setMemberEditForm({ ...memberEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {getSectionOptionsForClass(memberEditForm.class).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল নং:</label>
                <input
                  type="text"
                  value={memberEditForm.roll}
                  onChange={e => setMemberEditForm({ ...memberEditForm, roll: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExecMember(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT REGULAR ACTIVITY */}
      {/* ========================================================================= */}
      {editingActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0369a1', fontWeight: 800 }}>
              ✏️ নিয়মিত কার্যক্রম সম্পাদনা করুন
            </h3>
            <form onSubmit={handleSaveActivityEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কার্যক্রমের নাম / শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={activityEditForm.title}
                    onChange={e => setActivityEditForm({ ...activityEditForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বিষয়ের ক্ষেত্র / ফোকাস ট্যাগ *</label>
                  <input
                    type="text"
                    required
                    value={activityEditForm.focus}
                    onChange={e => setActivityEditForm({ ...activityEditForm, focus: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ধার্যকৃত সময়:</label>
                  <input
                    type="text"
                    value={activityEditForm.time}
                    onChange={e => setActivityEditForm({ ...activityEditForm, time: e.target.value })}
                    placeholder="যেমন: প্রতি মঙ্গলবার বিকাল ৩:৩০ মি."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ভেন্যু / ল্যাব:</label>
                  <input
                    type="text"
                    value={activityEditForm.venue}
                    onChange={e => setActivityEditForm({ ...activityEditForm, venue: e.target.value })}
                    placeholder="যেমন: শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কার্যক্রমের বিস্তারিত বিবরণ:</label>
                <textarea
                  rows="3"
                  value={activityEditForm.details}
                  onChange={e => setActivityEditForm({ ...activityEditForm, details: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT QUARTERLY ROADMAP */}
      {/* ========================================================================= */}
      {editingQuarter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0369a1', fontWeight: 800 }}>
              ✏️ ত্রৈমাসিক কর্মপরিকল্পনা রোডম্যাপ সম্পাদনা
            </h3>
            <form onSubmit={handleSaveQuarterEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ত্রৈমাসিক সময়কাল (e.g. জানুয়ারি–মার্চ):</label>
                  <input
                    type="text"
                    required
                    value={quarterEditForm.quarter}
                    onChange={e => setQuarterEditForm({ ...quarterEditForm, quarter: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কার্ডের থিম রঙ (Hex code):</label>
                  <input
                    type="text"
                    value={quarterEditForm.color}
                    onChange={e => setQuarterEditForm({ ...quarterEditForm, color: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মূল প্রতিপাদ্য / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={quarterEditForm.title}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  কর্মসূচিসমূহ (প্রতি লাইনে একটি কর্মসূচি লিখুন):
                </label>
                <textarea
                  rows="5"
                  value={quarterEditForm.itemsText}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, itemsText: e.target.value })}
                  placeholder="প্রতি লাইনে একটি কর্মসূচি লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingQuarter(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT MONTHLY CALENDAR */}
      {/* ========================================================================= */}
      {editingMonth && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0369a1', fontWeight: 800 }}>
              ✏️ মাসের কর্মসূচি সম্পাদনা ({editingMonth.month})
            </h3>
            <form onSubmit={handleSaveMonthEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মাসের নাম:</label>
                  <input
                    type="text"
                    required
                    value={monthEditForm.month}
                    onChange={e => setMonthEditForm({ ...monthEditForm, month: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>সম্ভাব্য তারিখ:</label>
                  <input
                    type="text"
                    value={monthEditForm.date}
                    onChange={e => setMonthEditForm({ ...monthEditForm, date: e.target.value })}
                    placeholder="যেমন: ১৫ জানুয়ারি"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কর্মসূচি বা ইভেন্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={monthEditForm.title}
                  onChange={e => setMonthEditForm({ ...monthEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>দায়িত্বপ্রাপ্ত সমন্বয়ক শিক্ষক:</label>
                <input
                  type="text"
                  value={monthEditForm.coordinator}
                  onChange={e => setMonthEditForm({ ...monthEditForm, coordinator: e.target.value })}
                  placeholder="যেমন: মোঃ আবুবকর সিদ্দিক"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingMonth(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SELECTION RULE */}
      {/* ========================================================================= */}
      {editingSelectionRule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #0284c7'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0369a1', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span>
                <span>সদস্য নির্বাচনের মানদণ্ড সম্পাদনা</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSelectionRule(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSelectionRuleEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>ক্রমিক / নং</label>
                  <input
                    type="text"
                    value={selectionRuleEditForm.num}
                    onChange={e => setSelectionRuleEditForm(prev => ({ ...prev, num: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>মানদণ্ডের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={selectionRuleEditForm.title}
                    onChange={e => setSelectionRuleEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: শ্রেণিগত যোগ্যতা"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>বিস্তারিত বিবরণ ও নীতিমালা *</label>
                <textarea
                  required
                  rows={4}
                  value={selectionRuleEditForm.text}
                  onChange={e => setSelectionRuleEditForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="মানদণ্ডের বিস্তারিত বিবরণ লিখুন..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingSelectionRule(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DISCIPLINE & LAB SAFETY RULE */}
      {/* ========================================================================= */}
      {editingDisciplineRule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #dc2626'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#b91c1c', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span>
                <span>শৃঙ্খলা ও নিরাপত্তাবিধি সম্পাদনা</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingDisciplineRule(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisciplineRuleEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>ক্রমিক / নং</label>
                  <input
                    type="text"
                    value={disciplineRuleEditForm.num}
                    onChange={e => setDisciplineRuleEditForm(prev => ({ ...prev, num: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>নিয়মের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={disciplineRuleEditForm.rule}
                    onChange={e => setDisciplineRuleEditForm(prev => ({ ...prev, rule: e.target.value }))}
                    placeholder="যেমন: অনুমতি ব্যতীত ব্যবহার নিষিদ্ধ"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>বাধ্যতামূলক নির্দেশিকা ও বিবরণ *</label>
                <textarea
                  required
                  rows={4}
                  value={disciplineRuleEditForm.desc}
                  onChange={e => setDisciplineRuleEditForm(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="নিয়মের বিস্তারিত বিবরণ লিখুন..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingDisciplineRule(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: SUBMITTED RECEIPT MODAL */}
      {/* ========================================================================= */}
      {submittedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #0284c7'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '40px', marginBottom: '4px' }}>🎉</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0369a1', fontWeight: 900 }}>
                আইসিটি ক্লাব সদস্য আবেদন সফলভাবে গৃহীত হয়েছে!
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                আপনার ট্র্যাকিং আইডি নিচে দেওয়া হলো, এটি সংরক্ষণ করুন:
              </p>
              <div style={{
                margin: '10px 0',
                padding: '8px 16px',
                background: '#e0f2fe',
                border: '1.5px dashed #0284c7',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 900,
                color: '#0c4a6e',
                fontFamily: 'monospace'
              }}>
                {submittedReceipt.trackingId}
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div><b>শিক্ষার্থীর নাম:</b> {submittedReceipt.student_name}</div>
              <div><b>শ্রেণি ও শাখা:</b> {submittedReceipt.class_name} ({submittedReceipt.section || '—'}) • রোল: {toBn(submittedReceipt.roll_no)}</div>
              <div><b>পছন্দের উইং:</b> {submittedReceipt.interests}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePrintMemberReceipt(submittedReceipt)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে রসিদ প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmittedReceipt(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: SUBMISSION READER / VIEWER MODAL */}
      {/* ========================================================================= */}
      {readingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderTop: '5px solid #0284c7'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  {readingItem.type}
                </span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', color: '#0c4a6e', fontWeight: 900 }}>
                  {readingItem.title}
                </h3>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  স্রষ্টা: <b>{readingItem.student_name}</b> ({readingItem.class_name} শ্রেণি • {readingItem.section || '—'} • রোল {toBn(readingItem.roll)})
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReadingItem(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              {readingItem.summary}
            </div>

            {readingItem.file_name && (
              <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <b>📁 সংযুক্ত ফাইল:</b> {readingItem.file_name} ({readingItem.file_size})
                </div>
                {readingItem.file_data && (
                  <a
                    href={readingItem.file_data}
                    download={readingItem.file_name}
                    style={{ background: '#0284c7', color: '#ffffff', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    ডাউনলোড ⬇️
                  </a>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handlePrintSubmission(readingItem)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
