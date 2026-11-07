import React, { useState, useEffect, useRef } from 'react';
import {
  MOCK_TEACHERS,
  PHOTO_HEAD_TEACHER,
  PHOTO_PRESIDENT,
  getTeacherPhoto,
  getLeadershipData
} from './mockData';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// LocalStorage Keys (Debating Club)
const DEBATE_PANEL_KEY = 'magra_debate_club_panel_v1';
const DEBATE_EXEC_KEY = 'magra_debate_club_exec_v1';
const DEBATE_ACTIVITIES_KEY = 'magra_debate_club_activities_v1';
const DEBATE_QUARTERLY_KEY = 'magra_debate_club_quarterly_plans_v1';
const DEBATE_MONTHLY_KEY = 'magra_debate_club_monthly_calendar_v1';
const DEBATE_SELECTION_RULES_KEY = 'magra_debate_club_selection_rules_v1';
const DEBATE_DISCIPLINE_RULES_KEY = 'magra_debate_club_discipline_rules_v1';
const DEBATE_MEMBERSHIPS_KEY = 'magra_debate_club_memberships_v1';
const DEBATE_COMPETITIONS_KEY = 'magra_debate_club_competitions_v1';
const DEBATE_AWARDS_KEY = 'magra_debate_club_awards_v1';
const DEBATE_ACHIEVEMENTS_KEY = 'magra_debate_club_achievements_v1';
const DEBATE_GOALS_KEY = 'magra_debate_club_goals_v1';

// Default Coordinators & Judges
const DEFAULT_DEBATE_PANEL = {
  coordinators: [
    {
      id: 'coord-deb-1',
      teacherId: 't-15',
      name: 'মোঃ আব্দুল খালেক',
      designation: 'সহকারী শিক্ষক (বাংলা)',
      role: 'প্রধান সমন্বয়ক (বাংলা বিতর্ক ও সাহিত্যিক যুক্তি)',
      phone: '01719273701'
    },
    {
      id: 'coord-deb-2',
      teacherId: 't-12',
      name: 'মোঃ আশরাফুল আলম',
      designation: 'সহকারী শিক্ষক (ইংরেজী)',
      role: 'সমন্বয়ক (ইংরেজি বিতর্ক ও আন্তর্জাতিক বিষয়)',
      phone: '01718822931'
    },
    {
      id: 'coord-deb-3',
      teacherId: 't-8',
      name: 'মোঃ হাবিবুর রহমান',
      designation: 'সিনিয়র শিক্ষক (গনিত ও বিজ্ঞান)',
      role: 'সমন্বয়ক (যুক্তি, উপাত্ত ও তথ্য-বিশ্লেষণ)',
      phone: '01728046188'
    }
  ],
  judges: {
    chiefJudge: {
      name: 'মুহাম্মদ শফিকুল ইসলাম',
      designation: 'প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক',
      role: 'প্রধান বিচারক (ডিবেটিং সোসাইটি)'
    },
    judge1: {
      name: 'তাপসী সরকার',
      designation: 'সহকারী প্রধান শিক্ষক',
      role: 'বিচারক (একাডেমিক যুক্তি ও বাচনিক মূল্যায়ন)'
    },
    judge2: {
      name: 'মোঃ আব্দুল খালেক',
      designation: 'সহকারী শিক্ষক (বাংলা)',
      role: 'বিচারক (ভাষা, ব্যাকরণ ও শালীনতাবোধ)'
    }
  }
};

// Default Executive Committee (7 Core Posts + Multiple Executive Members)
const DEFAULT_DEBATE_EXEC = {
  posts: {
    president: {
      title: 'সভাপতি',
      name: 'আহনাফ সিদ্দিক',
      class: '১০ম',
      section: 'বিজ্ঞান',
      roll: '১',
      phone: '01711-224466'
    },
    vice_president: {
      title: 'সহ-সভাপতি',
      name: 'মেহজাবীন সুলতানা',
      class: '১০ম',
      section: 'মানবিক',
      roll: '১',
      phone: '01711-224467'
    },
    general_secretary: {
      title: 'সাধারণ সম্পাদক',
      name: 'ফাহিম ফয়সাল',
      class: '৯ম',
      section: 'বিজ্ঞান',
      roll: '২',
      phone: '01711-224468'
    },
    joint_secretary: {
      title: 'যুগ্ম সম্পাদক',
      name: 'সুমাইয়া আক্তার',
      class: '৯ম',
      section: 'ব্যবসায় শিক্ষা',
      roll: '১',
      phone: '01711-224469'
    },
    organizing_secretary: {
      title: 'সাংগঠনিক সম্পাদক',
      name: 'তানভীর আহমেদ',
      class: '৮ম',
      section: 'শাখা ক',
      roll: '১',
      phone: '01711-224470'
    },
    publication_secretary: {
      title: 'প্রচার ও প্রকাশনা সম্পাদক',
      name: 'অর্পিতা পাল',
      class: '৮ম',
      section: 'শাখা খ',
      roll: '২',
      phone: '01711-224471'
    },
    finance_secretary: {
      title: 'অর্থ সম্পাদক',
      name: 'সিফাত হাসান',
      class: '১০ম',
      section: 'বিজ্ঞান',
      roll: '৩',
      phone: '01711-224472'
    }
  },
  members: [
    { id: 'deb-mem-1', name: 'রাহাত মাহমুদ', class: '১০ম', section: 'মানবিক', roll: '৪', phone: '01711-002101' },
    { id: 'deb-mem-2', name: 'নুসরাত জাহান', class: '৯ম', section: 'বিজ্ঞান', roll: '৩', phone: '01711-002102' },
    { id: 'deb-mem-3', name: 'আদিল মোর্শেদ', class: '৮ম', section: 'শাখা ক', roll: '৫', phone: '01711-002103' },
    { id: 'deb-mem-4', name: 'নাফিসা তাবাসসুম', class: '৭ম', section: 'শাখা খ', roll: '২', phone: '01711-002104' },
    { id: 'deb-mem-5', name: 'সানজিদা সুলতানা', class: '৬ষ্ঠ', section: 'শাখা ক', roll: '১', phone: '01711-002105' },
    { id: 'deb-mem-6', name: 'আবরার হাবিব', class: '৭ম', section: 'শাখা ক', roll: '৪', phone: '01711-002106' }
  ]
};

// 10 Core Goals & Objectives (As specified by User)
const DEFAULT_DEBATE_GOALS = [
  { id: 'goal-1', num: '১', title: 'যুক্তিবাদী চিন্তাশক্তি', desc: 'শিক্ষার্থীদের যুক্তিবাদী ও বিশ্লেষণধর্মী চিন্তাশক্তি বৃদ্ধি করা।' },
  { id: 'goal-2', num: '২', title: 'নির্ভীক বক্তব্য প্রদান', desc: 'নির্ভয়ে ও সাবলীলভাবে বক্তব্য প্রদানের দক্ষতা তৈরি করা।' },
  { id: 'goal-3', num: '৩', title: 'তথ্য-উপাত্ত বিশ্লেষণ', desc: 'তথ্য-উপাত্ত বিশ্লেষণ ও প্রমাণভিত্তিক যুক্তি উপস্থাপনে দক্ষ করা।' },
  { id: 'goal-4', num: '৪', title: 'দ্বিভাষিক বিতর্ক দক্ষতা', desc: 'বাংলা ও ইংরেজি ভাষায় বিতর্কের দক্ষতা বৃদ্ধি করা।' },
  { id: 'goal-5', num: '৫', title: 'নেতৃত্ব ও দলগত কাজ', desc: 'নেতৃত্ব, দলগত কাজ ও তাৎক্ষণিক সিদ্ধান্ত গ্রহণের ক্ষমতা তৈরি করা।' },
  { id: 'goal-6', num: '৬', title: 'সহনশীলতা ও পরমতশ্রদ্ধা', desc: 'শিক্ষার্থীদের মধ্যে সহনশীলতা ও ভিন্নমত গ্রহণের মানসিকতা সৃষ্টি করা।' },
  { id: 'goal-7', num: '৭', title: 'জাতীয় ও বৈশ্বিক সচেতনতা', desc: 'জাতীয় ও আন্তর্জাতিক বিভিন্ন বিষয়ে সচেতনতা বৃদ্ধি করা।' },
  { id: 'goal-8', num: '৮', title: 'মঞ্চভীতি দূরীকরণ', desc: 'মঞ্চভীতি দূর করে আত্মবিশ্বাসী করে গড়ে তোলা।' },
  { id: 'goal-9', num: '৯', title: 'প্রতিযোগিতামূলক প্রস্তুতি', desc: 'প্রতিযোগিতামূলক বিতর্কে অংশগ্রহণের উপযোগী করে তৈরি করা।' },
  { id: 'goal-10', num: '১০', title: 'যোগাযোগ ও ভবিষ্যৎ নেতৃত্ব', desc: 'ভবিষ্যৎ নেতৃত্ব, উপস্থাপনা ও যোগাযোগ দক্ষতার ভিত্তি তৈরি করা।' }
];

// 11 Regular Activities (As specified by User)
const DEFAULT_DEBATE_ACTIVITIES = [
  {
    id: 'act-deb-1',
    num: '১',
    title: 'সাপ্তাহিক বিতর্ক সভা',
    focus: 'নির্ধারিত বিষয়ে বিতর্ক',
    desc: 'প্রতি সপ্তাহের নির্দিষ্ট সমসাময়িক বিষয়ে পক্ষ ও বিপক্ষ দলের মধ্যে যুক্তিযুদ্ধ ও বিতর্ক পরিচালনা।',
    time: 'প্রতি শনিবার বিকাল ৩:০০ মি.',
    venue: 'ডিবেট ক্লাব কর্নার ও সেমিনার রুম'
  },
  {
    id: 'act-deb-2',
    num: '২',
    title: 'তাৎক্ষণিক বিতর্ক',
    focus: 'অল্প সময়ে বক্তব্য প্রস্তুত',
    desc: 'লটারির মাধ্যমে তাৎক্ষণিক বিষয় প্রদান এবং মাত্র ৫ মিনিট প্রস্তুতির পর ৩ মিনিটের যুক্তি উপস্থাপনের অনুশীলন।',
    time: 'প্রতি মাসের ২য় ও ৪র্থ সোমবার বিকাল ৩:৩০ মি.',
    venue: 'মাল্টিমিডিয়া অডিটোরিয়াম'
  },
  {
    id: 'act-deb-3',
    num: '৩',
    title: 'উপস্থিত বক্তৃতা',
    focus: 'নির্দিষ্ট বিষয়ে তাৎক্ষণিক বক্তব্য',
    desc: 'মঞ্চে দাঁড়িয়ে তাৎক্ষণিক বিষয়ে সাবলীল শব্দচয়ন, অঙ্গভঙ্গি ও দৃঢ় কণ্ঠস্বরে বক্তব্য প্রদানের ড্রিল।',
    time: 'প্রতি বুধবার টিফিন বিরতির পর',
    venue: 'মুক্তমঞ্চ / মূল সেমিনার হল'
  },
  {
    id: 'act-deb-4',
    num: '৪',
    title: 'যুক্তি ও পাল্টা যুক্তি',
    focus: 'যুক্তি বিশ্লেষণের অনুশীলন',
    desc: 'প্রতিপক্ষের যুক্তির দুর্বলতা চিহ্নিতকরণ, খণ্ডন কৌশল ও ফ্যাক্ট-চেকিংয়ের নিবিড় কর্মশালা।',
    time: 'প্রতি মঙ্গলবার বিকাল ৩:৪৫ মি.',
    venue: 'বিতর্ক স্টাডি রুম ও লাইব্রেরি'
  },
  {
    id: 'act-deb-5',
    num: '৫',
    title: 'সংবাদ বিশ্লেষণ',
    focus: 'জাতীয় ও আন্তর্জাতিক ঘটনা নিয়ে আলোচনা',
    desc: 'দৈনিক জাতীয় ও আন্তর্জাতিক শীর্ষ সংবাদ, সম্পাদকীয় বিশ্লেষণ ও বৈশ্বিক অর্থনীতির হালনাগাদ পাঠচক্র।',
    time: 'প্রতি বৃহস্পতিবার সকাল ৯:১৫ মি.',
    venue: 'লাইব্রেরি রিডিং লাউঞ্জ'
  },
  {
    id: 'act-deb-6',
    num: '৬',
    title: 'সংসদীয় বিতর্ক',
    focus: 'সংসদীয় পদ্ধতিতে বিতর্ক',
    desc: 'মাননীয় স্পিকার, প্রধানমন্ত্রী ও বিরোধী দলীয় নেতার প্রাতিষ্ঠানিক আচরণবিধি বজায় রেখে সংসদীয় রীতির বিতর্ক।',
    time: 'প্রতি মাসের ১ম রবিবার বিকাল ৩:০০ মি.',
    venue: 'সংসদীয় ডিবেট চেম্বার'
  },
  {
    id: 'act-deb-7',
    num: '৭',
    title: 'ইংরেজি বিতর্ক',
    focus: 'ইংরেজি ভাষায় বিতর্ক উপস্থাপন',
    desc: 'আন্তর্জাতিক ফরম্যাটে ইংরেজি ভাষায় সাবলীল যুক্তি উপস্থাপন, মোশন ডিফেন্স ও পোডিয়াম ম্যানারিজম।',
    time: 'প্রতি মাসের ৩য় শনিবার বিকাল ৩:৩০ মি.',
    venue: 'ল্যাঙ্গুয়েজ ও ডিবেট ল্যাব'
  },
  {
    id: 'act-deb-8',
    num: '৮',
    title: 'ইংরেজিতে বিতর্ক অনুশীলন',
    focus: 'ইংরেজি শব্দভাণ্ডার ও তাৎক্ষণিক যুক্তি',
    desc: 'ইংরেজি ভোকাবুলারি, সঠিক প্রোনাউন্সিয়েশন, ফ্র্যাজাল কানেক্টিভস ও কুইক রিবুটালের নিয়মিত অনুশীলন।',
    time: 'প্রতি বৃহস্পতিবার বিকাল ৩:০০ মি.',
    venue: 'সেমিনার কক্ষ'
  },
  {
    id: 'act-deb-9',
    num: '৯',
    title: 'মক পার্লামেন্ট',
    focus: 'সংসদ অধিবেশনের অনুকরণ',
    desc: 'জাতীয় বাজেট, জলবায়ু নীতি বা শিক্ষানীতির ওপর জাতীয় সংসদের পূর্ণাঙ্গ অধিবেশনের অনুকরণে যুব সংসদ আয়োজন।',
    time: 'ত্রৈমাসিক বিশেষ অধিবেশন',
    venue: 'প্রধান মিলনায়তন'
  },
  {
    id: 'act-deb-10',
    num: '১০',
    title: 'আন্তঃশ্রেণি বিতর্ক',
    focus: 'বিভিন্ন শ্রেণির মধ্যে প্রতিযোগিতা',
    desc: 'ষষ্ঠ থেকে দশম শ্রেণির বিভিন্ন সেকশনের মধ্যে ট্রফি অর্জনের ধারাবাহিক টুর্নামেন্ট ও বিতর্ক লিগ।',
    time: 'প্রতি মাসের শেষ শুক্রবার বিকাল ৩:০০ মি.',
    venue: 'বিদ্যালয় কেন্দ্রীয় মঞ্চ'
  },
  {
    id: 'act-deb-11',
    num: '১১',
    title: 'আন্তঃবিদ্যালয় বিতর্ক',
    focus: 'অন্য বিদ্যালয়ের সঙ্গে প্রতিযোগিতা',
    desc: 'উপজেলা ও জেলা পর্যায়ের শীর্ষ স্কুলগুলোর সঙ্গে হোম ও অ্যাওয়ে ভিত্তিতে যৌথ আমন্ত্রণমূলক বিতর্ক ম্যাচ।',
    time: 'আঞ্চলিক বিতর্ক ক্যালেন্ডার অনুযায়ী',
    venue: 'বহিরাঙ্গন / জেলা পরিষদ হল'
  }
];

// Quarterly Roadmap (As specified by User)
const DEFAULT_DEBATE_QUARTERLY = [
  {
    id: 'q-deb-1',
    quarter: 'জানুয়ারি–মার্চ',
    title: 'সদস্য সংগ্রহ, বিতর্কের নিয়ম শেখা ও প্রাথমিক প্রশিক্ষণ',
    desc: '• ষষ্ঠ থেকে দশম শ্রেণির আগ্রহীদের থেকে সদস্য নিবন্ধন গ্রহণ ও ওরিয়েন্টেশন\n• কার্যনির্বাহী পরিষদ গঠন ও দায়িত্ব হস্তান্তর\n• সনাতনী ও সংসদীয় বিতর্কের নিয়মাবলী বিষয়ক বেসিক কর্মশালা\n• আন্তর্জাতিক মাতৃভাষা দিবস উপলক্ষে একুশে বাংলা বিতর্ক উৎসব',
    color: '#312e81'
  },
  {
    id: 'q-deb-2',
    quarter: 'এপ্রিল–জুন',
    title: 'বাংলা বিতর্ক, উপস্থিত বক্তৃতা ও যুক্তি অনুশীলন',
    desc: '• উপস্থিত বক্তৃতা বুটক্যাম্প ও মঞ্চভীতি দূরীকরণ সেশন\n• যুক্তি খণ্ডন ও তথ্য-প্রমাণ উপস্থাপনার গভীর কর্মশালা\n• আন্তঃশ্রেণি নকআউট বিতর্ক টুর্নামেন্ট ২০২৬\n• সমসাময়িক জাতীয় ইস্যুতে সাপ্তাহিক বিতর্ক সভা',
    color: '#4338ca'
  },
  {
    id: 'q-deb-3',
    quarter: 'জুলাই–সেপ্টেম্বর',
    title: 'ইংরেজি বিতর্ক, মক পার্লামেন্ট ও আন্তঃশ্রেণি প্রতিযোগিতা',
    desc: '• ইংরেজি বিতর্ক কর্মশালা ও এক্সটেমপোর স্পিচ কন্টেস্ট\n• জাতীয় যুব সংসদ অনুকরণে বিশেষ মক পার্লামেন্ট অধিবেশন\n• দলভিত্তিক যুক্তি ও পাল্টা যুক্তি বিশ্লেষণ সেশন\n• জেলা বিতর্ক প্রতিযোগিতার জন্য বাছাই ট্রায়াল',
    color: '#1e1b4b'
  },
  {
    id: 'q-deb-4',
    quarter: 'অক্টোবর–ডিসেম্বর',
    title: 'আন্তঃবিদ্যালয় বিতর্ক, বার্ষিক বিতর্ক উৎসব ও মূল্যায়ন',
    desc: '• বার্ষিক আন্তঃবিদ্যালয় বিতর্ক মেগা ফেস্টিভ্যাল ২০২৬\n• গ্র্যান্ড ফিনালে বিতর্ক ও সেরা বক্তা নির্ধারণ\n• বার্ষিক শ্রেষ্ঠ বিতার্কিক, শ্রেষ্ঠ গবেষক ও বর্ষসেরা দলকে ট্রফি ও সনদ প্রদান\n• আগামী শিক্ষাবর্ষের অ্যাকশন প্ল্যান অনুমোদন',
    color: '#065f46'
  }
];

// 12 Months Activity Calendar
const DEFAULT_DEBATE_MONTHLY = [
  { id: 'm-deb-1', month: 'জানুয়ারি', title: 'সদস্যপদ আহ্বান, ওরিয়েন্টেশন ও নিয়ম পরিচিতি', date: '১৫ জানুয়ারি', coordinator: 'মোঃ আব্দুল খালেক' },
  { id: 'm-deb-2', month: 'ফেব্রুয়ারি', title: 'একুশে স্মারক মাতৃভাষা বাংলা বিতর্ক প্রতিযোগিতা', date: '২০ ফেব্রুয়ারি', coordinator: 'মোঃ আব্দুল খালেক' },
  { id: 'm-deb-3', month: 'মার্চ', title: 'স্বাধীনতা দিবস উপস্থিত বক্তৃতা ও যুক্তিযুদ্ধ', date: '২২ মার্চ', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-deb-4', month: 'এপ্রিল', title: 'সংসদীয় পদ্ধতির বিতর্ক ও স্পিকার ড্রিল', date: '১৮ এপ্রিল', coordinator: 'মোঃ আব্দুল খালেক' },
  { id: 'm-deb-5', month: 'মে', title: 'সংবাদ বিশ্লেষণ ও তথ্য যাচাই (Fact-Check) কর্মশালা', date: '১৪ মে', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-deb-6', month: 'জুন', title: 'আন্তঃশ্রেণি বিতর্ক টুর্নামেন্ট ২০২৬ (গ্রুপ পর্ব)', date: '১০ জুন', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-deb-7', month: 'জুলাই', title: 'ইংরেজি বিতর্ক বুটক্যাম্প ও এক্সটেমপোর রাউন্ড', date: '১৬ জুলাই', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-deb-8', month: 'আগস্ট', title: 'জাতীয় শোক স্মারক বিতর্ক ও যৌক্তিক আলোচনা', date: '২০ আগস্ট', coordinator: 'মোঃ আব্দুল খালেক' },
  { id: 'm-deb-9', month: 'সেপ্টেম্বর', title: 'মক পার্লামেন্ট: যুব সংসদ বিশেষ অধিবেশন', date: '১৮ সেপ্টেম্বর', coordinator: 'প্রধান শিক্ষক ও সমন্বয়কবৃন্দ' },
  { id: 'm-deb-10', month: 'অক্টোবর', title: 'আমন্ত্রণমূলক আন্তঃবিদ্যালয় বিতর্ক প্রতিযোগিতা', date: '২৪ অক্টোবর', coordinator: 'মোঃ আব্দুল খালেক' },
  { id: 'm-deb-11', month: 'নভেম্বর', title: 'কালিহাতি উপজেলা বিতর্ক অলিম্পিয়াড ও ফাইনাল', date: '১৫ নভেম্বর', coordinator: 'মোঃ আশরাফুল আলম' },
  { id: 'm-deb-12', month: 'ডিসেম্বর', title: 'বার্ষিক বিতর্ক মূল্যায়ন ও ট্রফি বিতরণী সমাপনী', date: '০৫ ডিসেম্বর', coordinator: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)' }
];

// 7 Selection Rules (As specified by User)
const DEFAULT_DEBATE_SELECTION_RULES = [
  { id: 'sr-1', num: '১', title: 'শ্রেণি যোগ্যতা', text: 'ষষ্ঠ থেকে দশম শ্রেণির শিক্ষার্থীরা সদস্য হতে পারবে।' },
  { id: 'sr-2', num: '২', title: 'বক্তব্যের আগ্রহ', text: 'বাংলা বা ইংরেজিতে বক্তব্য প্রদানে আগ্রহী শিক্ষার্থীরা সদস্য হতে পারবে।' },
  { id: 'sr-3', num: '৩', title: 'মনোযোগী শ্রোতা', text: 'ভালো বক্তা হওয়ার পাশাপাশি ভালো শ্রোতা হওয়ার মানসিকতাকে গুরুত্ব দিতে হবে।' },
  { id: 'sr-4', num: '৪', title: 'পূর্ব অভিজ্ঞতার বাধ্যবাধকতা নেই', text: 'শিক্ষার্থীদের পূর্ব অভিজ্ঞতা থাকা বাধ্যতামূলক নয়; শেখার ইচ্ছাই প্রধান।' },
  { id: 'sr-5', num: '৫', title: 'লিঙ্গ সমতা', text: 'ছেলে ও মেয়ে উভয় শিক্ষার্থীর সমান অংশগ্রহণ নিশ্চিত করতে হবে।' },
  { id: 'sr-6', num: '৬', title: 'শ্রেণি ও দক্ষতা অনুযায়ী দল গঠন', text: 'শিক্ষার্থীদের শ্রেণি ও দক্ষতা অনুযায়ী বিতর্ক দল গঠন করতে হবে।' },
  { id: 'sr-7', num: '৭', title: 'নিয়মিত উপস্থিতি ও নিষ্ঠা', text: 'নিয়মিত অনুশীলন ও সাপ্তাহিক সভার উপস্থিতিকে গুরুত্ব দিতে হবে।' }
];

// 9 Discipline & Conduct Rules (As specified by User)
const DEFAULT_DEBATE_DISCIPLINE_RULES = [
  { id: 'dr-1', num: '১', rule: 'ব্যক্তিগত আক্রমণ নিষিদ্ধ', desc: 'বিতর্কে ব্যক্তিগত আক্রমণ করা যাবে না; শুধুমাত্র যুক্তির ওপর বক্তব্য দিতে হবে।' },
  { id: 'dr-2', num: '২', rule: 'মনোযোগ দিয়ে শোনা', desc: 'প্রতিপক্ষের বক্তব্য মনোযোগ ও ধৈর্য দিয়ে শুনতে হবে এবং কোনো কটূক্তি করা যাবে না।' },
  { id: 'dr-3', num: '৩', rule: 'তথ্য-উপাত্ত ভিত্তিক বক্তব্য', desc: 'তথ্য-উপাত্ত ও প্রমাণের ভিত্তিতে বক্তব্য উপস্থাপন করতে হবে।' },
  { id: 'dr-4', num: '৪', rule: 'বিভ্রান্তিকর তথ্য বর্জন', desc: 'মিথ্যা তথ্য, মনগড়া পরিসংখ্যান বা বিভ্রান্তিকর বক্তব্য দেওয়া যাবে না।' },
  { id: 'dr-5', num: '৫', rule: 'ভিন্নমতকে সম্মান', desc: 'অন্যের মতামত ও ভিন্নমতকে সর্বোচ্চ সম্মান ও পরমতসহিষ্ণুতা প্রদর্শন করতে হবে।' },
  { id: 'dr-6', num: '৬', rule: 'শালীন ভাষা প্রয়োগ', desc: 'বক্তব্যে সর্বদা ভদ্র, মার্জিত ও শালীন ভাষা ব্যবহার করতে হবে।' },
  { id: 'dr-7', num: '৭', rule: 'সময় ব্যবস্থাপনা মেনে চলা', desc: 'নির্ধারিত সময়ের মধ্যে বক্তব্য শেষ করতে হবে; সতর্ক সংকেত মানতে হবে।' },
  { id: 'dr-8', num: '৮', rule: 'সৌহার্দ্যপূর্ণ আচরণ', desc: 'বিতর্ক শেষে ফলাফল নির্বিশেষে প্রতিপক্ষের সঙ্গে করমর্দন ও সৌহার্দ্যপূর্ণ আচরণ করতে হবে।' },
  { id: 'dr-9', num: '৯', rule: 'বয়সোপযোগিতা রক্ষা', desc: 'বিতর্কের বিষয় নির্বাচন ও আলোচনায় বয়সোপযোগিতা এবং নীতিবোধ বজায় রাখতে হবে।' }
];

// 9 Evaluation & Awards Categories (As specified by User)
const DEFAULT_DEBATE_AWARDS = [
  {
    id: 'aw-1',
    category: 'সেরা বিতার্কিক',
    categoryEn: 'Best Debater of the Year',
    winner: 'আহনাফ সিদ্দিক',
    class: '১০ম',
    section: 'বিজ্ঞান',
    roll: '১',
    event: 'বার্ষিক আন্তঃস্কুল বিতর্ক প্রতিযোগিতা ২০২৬',
    badge: '🏆 স্বর্ণ ক্রেস্ট ও সনদ',
    remarks: 'সামগ্রিক বিতর্ক কৌশল, তীক্ষ্ণ যুক্তি ও দল পরিচালনায় অসাধারণ পারদর্শিতা।'
  },
  {
    id: 'aw-2',
    category: 'সেরা বক্তা',
    categoryEn: 'Best Speaker',
    winner: 'মেহজাবীন সুলতানা',
    class: '১০ম',
    section: 'মানবিক',
    roll: '১',
    event: 'একুশে স্মারক বাংলা বিতর্ক উৎসব ২০২৬',
    badge: '🎙️ রৌপ্য ট্রফি ও পদক',
    remarks: 'সাবলীল উচ্চারণ, বলিষ্ঠ বাচনভঙ্গি ও তথ্যবহুল উপস্থাপনার স্বীকৃতি।'
  },
  {
    id: 'aw-3',
    category: 'সেরা যুক্তি উপস্থাপক',
    categoryEn: 'Best Argumentator & Rebuttal Specialist',
    winner: 'ফাহিম ফয়সাল',
    class: '৯ম',
    section: 'বিজ্ঞান',
    roll: '২',
    event: 'আন্তঃশ্রেণি বিতর্ক টুর্নামেন্ট ২০২৬',
    badge: '⚡ বিশেষ মেডেল ও সম্মাননা',
    remarks: 'প্রতিপক্ষের যুক্তি খণ্ডন ও তাৎক্ষণিক কাউন্টার-লজিকে দৃষ্টান্তমূলক নৈপুণ্য।'
  },
  {
    id: 'aw-4',
    category: 'সেরা গবেষক',
    categoryEn: 'Best Researcher & Fact Checker',
    winner: 'তানভীর আহমেদ',
    class: '৮ম',
    section: 'শাখা ক',
    roll: '১',
    event: 'জাতীয় বাজেট ও জলবায়ু বিতর্ক সেশন',
    badge: '📚 মেধা ট্রফি ও সনদপত্র',
    remarks: 'প্রমাণভিত্তিক রেফারেন্স, সাম্প্রতিক পরিসংখ্যান ও নিরপেক্ষ তথ্য সন্ধানে সেরা।'
  },
  {
    id: 'aw-5',
    category: 'সেরা বাংলা বিতার্কিক',
    categoryEn: 'Best Bengali Debater',
    winner: 'সুমাইয়া আক্তার',
    class: '৯ম',
    section: 'ব্যবসায় শিক্ষা',
    roll: '১',
    event: 'মাতৃভাষা দিবস বিশেষ বিতর্ক চ্যাম্পিয়নশিপ',
    badge: '🌺 বাংলা একাডেমি স্মারক পদক',
    remarks: 'শুদ্ধ প্রমিত উচ্চারণ, প্রবাদ-উপমার শৈল্পিক প্রয়োগ ও ভাষা ব্যবহারে অনন্য।'
  },
  {
    id: 'aw-6',
    category: 'সেরা ইংরেজি বিতার্কিক',
    categoryEn: 'Best English Debater',
    winner: 'রাহাত মাহমুদ',
    class: '১০ম',
    section: 'মানবিক',
    roll: '৪',
    event: 'উপজেলা ইন্টার-স্কুল ইংলিশ ডিবেট সামিট',
    badge: '🌐 গ্লোবাল ডিবেটার ট্রফি',
    remarks: 'সাবলীল ইংরেজি প্রবাহ, আন্তর্জাতিক মোশন ডিফেন্স ও শব্দচয়নে অনন্য দক্ষতা।'
  },
  {
    id: 'aw-7',
    category: 'সেরা বিতর্ক দল',
    categoryEn: 'Best Debate Team',
    winner: 'মগড়া পালস্ সিনিয়র ডিবেট টিম (দলনেতা: আহনাফ সিদ্দিক)',
    class: '১০ম ও ৯ম শ্রেণি',
    section: 'যৌথ স্কোয়াড',
    roll: '১, ২, ৩',
    event: 'কালিহাতি উপজেলা বিতর্ক চ্যাম্পিয়নশিপ ২০২৬',
    badge: '🏆 দলগত চ্যাম্পিয়ন রানিং ট্রফি',
    remarks: 'টানটান টিম কো-অর্ডিনেশন ও ফাইনালে অপরাজিত চ্যাম্পিয়ন হওয়ার গৌরব।'
  },
  {
    id: 'aw-8',
    category: 'সেরা তাৎক্ষণিক বক্তা',
    categoryEn: 'Best Extempore Speaker',
    winner: 'আদিল মোর্শেদ',
    class: '৮ম',
    section: 'শাখা ক',
    roll: '৫',
    event: 'স্বাধীনতা দিবস উপস্থিত বক্তৃতা প্রতিযোগিতা',
    badge: '🎯 ক্ষিপ্র বক্তা বিশেষ ট্রফি',
    remarks: 'লটারিতে পাওয়া বিষয়ে মাত্র ২ মিনিটে সাজিয়ে তাৎক্ষণিক মন্ত্রমুগ্ধকর বক্তব্য।'
  },
  {
    id: 'aw-9',
    category: 'সেরা সংসদ সদস্য (মক পার্লামেন্ট)',
    categoryEn: 'Best Parliamentarian (Mock Parliament)',
    winner: 'অর্পিতা পাল',
    class: '৮ম',
    section: 'শাখা খ',
    roll: '২',
    event: 'যুব সংসদ জাতীয় শিক্ষা সপ্তাহ বিশেষ অধিবেশন',
    badge: '🏛️ স্পিকার গোল্ড মেডেল',
    remarks: 'বিল উত্থাপন, পয়েন্ট অব অর্ডার এবং সংসদীয় মার্জিত কার্যপ্রণালীতে সেরা অবদান।'
  }
];

// Achievements & Trophy Gallery (Historic honors)
const DEFAULT_DEBATE_ACHIEVEMENTS = [
  {
    id: 'ach-deb-1',
    year: '২০২৬',
    event: 'কালিহাতি উপজেলা স্কুল বিতর্ক চ্যাম্পিয়নশিপ ২০২৬',
    level: 'উপজেলা পর্যায়',
    category: 'উপজেলা',
    award: 'চ্যাম্পিয়ন ট্রফি ও দলগত শ্রেষ্ঠত্ব',
    team: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় ডিবেট টিম',
    note: 'ফাইনালে কালিহাতি আর.এস পাইলট স্কুলকে হারিয়ে জেলা পর্বে খেলার যোগ্যতা অর্জন।'
  },
  {
    id: 'ach-deb-2',
    year: '২০২৫',
    event: 'জাতীয় শিক্ষা সপ্তাহ বিতর্ক প্রতিযোগিতা (টাঙ্গাইল জেলা)',
    level: 'জেলা পর্যায়',
    category: 'জেলা',
    award: 'রানার্স-আপ ট্রফি ও শ্রেষ্ঠ বিতার্কিক পদক',
    team: 'আহনাফ সিদ্দিক ও মেহজাবীন সুলতানা',
    note: 'জেলা প্রশাসক কর্তৃক বিশেষ সম্মাননা ও ক্রেস্ট প্রদান।'
  },
  {
    id: 'ach-deb-3',
    year: '২০২৫',
    event: 'আন্তর্জাতিক মাতৃভাষা দিবস আন্তঃউপজেলা সংসদীয় বিতর্ক',
    level: 'আঞ্চলিক পর্যায়',
    category: 'আন্তঃস্কুল',
    award: 'প্রথম স্থান ও চ্যাম্পিয়ন ট্রফি',
    team: 'মগড়া পালস্ সংসদীয় বিতর্ক একাদশ',
    note: '৮টি উপজেলার ১৬টি শীর্ষ বিদ্যালয়ের মধ্যে অপরাজিত চ্যাম্পিয়ন।'
  },
  {
    id: 'ach-deb-4',
    year: '২০২৪',
    event: 'জেলা প্রশাসক কাপ বিতর্ক উৎসব ২০২৪',
    level: 'জেলা পর্যায়',
    category: 'জেলা',
    award: 'শ্রেষ্ঠ যুক্তি উপস্থাপক ক্রেস্ট',
    team: 'ফাহিম ফয়সাল',
    note: 'যুক্তি খণ্ডন ও ডাটা উপস্থাপনায় জেলার সকল বিচারকের সম্মিলিত সর্বোচ্চ স্কোর।'
  },
  {
    id: 'ach-deb-5',
    year: '২০২৪',
    event: 'স্বাধীনতা দিবস স্মারক উন্মুক্ত আন্তঃস্কুল উপস্থিত বক্তৃতা',
    level: 'উপজেলা পর্যায়',
    category: 'উপজেলা',
    award: 'প্রথম ও দ্বিতীয় স্থান',
    team: 'মেহজাবীন সুলতানা ও অর্পিতা পাল',
    note: 'কালিহাতি উপজেলা নির্বাহী কর্মকর্তা (ইউএনও) কর্তৃক স্মারক ক্রেস্ট প্রদান।'
  },
  {
    id: 'ach-deb-6',
    year: '২০২৩',
    event: 'জাতীয় শিশু-কিশোর বিতর্ক প্রতিযোগিতা (বিভাগীয় ট্রায়াল)',
    level: 'বিভাগীয় পর্যায়',
    category: 'জাতীয়',
    award: 'বিশেষ সম্মাননা ও মেধা সনদ',
    team: 'মগড়া পালস্ ডিবেটিং সোসাইটি',
    note: 'ঢাকা বিভাগে অন্যতম সেরা গ্রামীণ বিদ্যালয়ের বিতার্কিক হিসেবে ভূয়সী প্রশংসা।'
  }
];

// Sample Initial Competitions with User's Exact Rubric (100 Marks)
const DEFAULT_DEBATE_COMPETITIONS = [
  {
    id: 'comp-deb-1',
    title: 'আন্তঃশ্রেণি বিতর্ক চ্যাম্পিয়নশিপ ২০২৬ (ফাইনাল ম্যাচ)',
    motion: 'এই সংসদ বিশ্বাস করে যে, কৃত্রিম বুদ্ধিমত্তা শিক্ষার্থীদের মানবিক মূল্যবোধের পরিপূরক, বিকল্প নয়।',
    format: 'সংসদীয় বিতর্ক',
    date: '০৫ মে ২০২৬',
    venue: 'বিদ্যালয় কেন্দ্রীয় মিলনায়তন',
    propTeamName: 'সরকারি দল (১০ম শ্রেণি বিজ্ঞান)',
    oppTeamName: 'বিরোধী দল (৯ম শ্রেণি মানবিক)',
    winner: 'সরকারি দল',
    bestSpeaker: 'আহনাফ সিদ্দিক (১০ম শ্রেণি, সরকারি দল)',
    propScore: 268,
    oppScore: 254,
    status: 'সম্পন্ন',
    judgesNote: 'উভয় দলের বক্তব্য ছিল তথ্যবহুল। সরকারি দলের প্রধানমন্ত্রী আহনাফ সিদ্দিকের পাল্টা যুক্তি ও সময় ব্যবস্থাপনা বিশেষ প্রশংসনীয়।',
    moderator: { name: 'মো: হাবিবুর রহমান', designation: 'সিনিয়র শিক্ষক (বাংলা)', teacherId: '' },
    chiefJudge: { name: 'মুহাম্মদ শফিকুল ইসলাম', designation: 'প্রধান শিক্ষক ও সভাপতি', teacherId: '' },
    judge1: { name: 'মো: আবদুল খালেক', designation: 'সহকারী প্রধান শিক্ষক', teacherId: '' },
    judge2: { name: 'মো: আবু বকর সিদ্দিক', designation: 'সহকারী শিক্ষক (আইসিটি)', teacherId: '' }
  },
  {
    id: 'comp-deb-2',
    title: 'একুশে স্মারক বাংলা বিতর্ক উৎসব ২০২৬',
    motion: 'যুক্তির শক্তিতেই গড়ে উঠবে কুসংস্কারমুক্ত আধুনিক বাংলাদেশ।',
    format: 'সনাতনী বিতর্ক',
    date: '২১ ফেব্রুয়ারি ২০২৬',
    venue: 'বিদ্যালয় মুক্তমঞ্চ',
    propTeamName: 'পক্ষ দল (৮ম শ্রেণি)',
    oppTeamName: 'বিপক্ষ দল (৭ম শ্রেণি)',
    winner: 'পক্ষ দল',
    bestSpeaker: 'মেহজাবীন সুলতানা (পক্ষ দলনেতা)',
    propScore: 261,
    oppScore: 247,
    status: 'সম্পন্ন',
    judgesNote: 'বাংলা ভাষার চমৎকার প্রয়োগ ও দেশপ্রেমমূলক যুক্তি উপস্থাপনায় পক্ষ দল বিজয়ী।',
    moderator: { name: 'মোছা: নাছরিন আক্তার', designation: 'সহকারী শিক্ষক (ইংরেজি)', teacherId: '' },
    chiefJudge: { name: 'মুহাম্মদ শফিকুল ইসলাম', designation: 'প্রধান শিক্ষক ও সভাপতি', teacherId: '' },
    judge1: { name: 'মো: হাবিবুর রহমান', designation: 'সিনিয়র শিক্ষক (বাংলা)', teacherId: '' },
    judge2: { name: 'মো: আশরাফুল আলম', designation: 'সহকারী শিক্ষক (ইংরেজি)', teacherId: '' }
  }
];

// Initial Registered Members
const DEFAULT_DEBATE_MEMBERS = [
  {
    id: 'mem-deb-1',
    tracking_id: 'DEB-2026-0812',
    student_name: 'আহনাফ সিদ্দিক',
    class_name: '১০ম',
    section: 'বিজ্ঞান',
    roll_no: '১',
    mobile: '01711-224466',
    interest: 'সংসদীয় বিতর্ক ও নেতৃত্ব',
    experience: 'বিগত ৩ বছর ধরে বিভিন্ন বিতর্ক প্রতিযোগিতায় অংশগ্রহণ',
    reason: 'যুক্তিনির্ভর চিন্তাভাবনা ও প্রাতিষ্ঠানিক নেতৃত্ব বিকাশের উদ্দেশ্যে।',
    status: 'approved',
    date: '১০ জানুয়ারি ২০২৬'
  },
  {
    id: 'mem-deb-2',
    tracking_id: 'DEB-2026-0813',
    student_name: 'মেহজাবীন সুলতানা',
    class_name: '১০ম',
    section: 'মানবিক',
    roll_no: '১',
    mobile: '01711-224467',
    interest: 'বাংলা সনাতনী বিতর্ক ও উপস্থিত বক্তৃতা',
    experience: 'উপজেলা পর্যায়ে প্রথম স্থান অধিকারী',
    reason: 'বাচনভঙ্গি ও মঞ্চে নির্ভীক বক্তব্য দেওয়ার আত্মবিশ্বাস বৃদ্ধি।',
    status: 'approved',
    date: '১২ জানুয়ারি ২০২৬'
  },
  {
    id: 'mem-deb-3',
    tracking_id: 'DEB-2026-0814',
    student_name: 'ফাহিম ফয়সাল',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '২',
    mobile: '01711-224468',
    interest: 'যুক্তি ও পাল্টা যুক্তি খণ্ডন',
    experience: 'ক্লাস ডিবেটে সক্রিয় বিতার্কিক',
    reason: 'গবেষণাধর্মী তথ্য উপাত্ত দিয়ে সত্য প্রতিষ্ঠার অনুপ্রেরণা।',
    status: 'approved',
    date: '১৪ জানুয়ারি ২০২৬'
  },
  {
    id: 'mem-deb-4',
    tracking_id: 'DEB-2026-0815',
    student_name: 'সুমাইয়া আক্তার',
    class_name: '৯ম',
    section: 'ব্যবসায় শিক্ষা',
    roll_no: '১',
    mobile: '01711-224469',
    interest: 'ইংরেজি বিতর্ক ও বিশ্ব রাজনীতি',
    experience: 'স্কুল ডিবেট কর্মশালায় নিয়মিত অংশগ্রহণ',
    reason: 'ইংরেজি ভাষায় আত্মবিশ্বাসের সাথে আন্তর্জাতিক বিষয়ে বক্তব্য প্রদান।',
    status: 'approved',
    date: '১৫ জানুয়ারি ২০২৬'
  },
  {
    id: 'mem-deb-5',
    tracking_id: 'DEB-2026-0816',
    student_name: 'তানভীর আহমেদ',
    class_name: '৮ম',
    section: 'শাখা ক',
    roll_no: '১',
    mobile: '01711-224470',
    interest: 'মক পার্লামেন্ট ও উপস্থিত বক্তৃতা',
    experience: 'নতুন শিক্ষার্থী, উৎসাহী শ্রোতা',
    reason: 'সংসদীয় রীতিনীতি ও দেশ গঠনের আইন প্রণয়ন প্রক্রিয়া জানা।',
    status: 'approved',
    date: '১৮ জানুয়ারি ২০২৬'
  },
  {
    id: 'mem-deb-6',
    tracking_id: 'DEB-2026-0817',
    student_name: 'তাহমিদ হাসান',
    class_name: '৭ম',
    section: 'শাখা ক',
    roll_no: '৩',
    mobile: '01711-556677',
    interest: 'সনাতনী বিতর্ক',
    experience: 'কোনো পূর্ব অভিজ্ঞতা নেই',
    reason: 'মঞ্চভীতি দূর করে ক্লাসের সবার সামনে নির্ভয়ে কথা বলা শিখতে চাই।',
    status: 'pending',
    date: '২৫ জানুয়ারি ২০২৬'
  }
];

// 12 Tab definitions matching exact structure
const DEBATE_TABS = [
  { key: 'overview', num: '১', label: 'ক্লাব পরিচিতি', icon: '🏛️' },
  { key: 'objectives', num: '২', label: 'মূল লক্ষ্য ও উদ্দেশ্য', icon: '🎯' },
  { key: 'panel', num: '৩', label: 'সমন্বয়ক ও বিচারক প্যানেল', icon: '👨‍🏫' },
  { key: 'executive', num: '৪', label: 'কার্যনির্বাহী পরিষদ', icon: '👥' },
  { key: 'activities', num: '৫', label: 'নিয়মিত কার্যক্রম', icon: '⚡' },
  { key: 'calendar', num: '৬', label: 'বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার', icon: '📅' },
  { key: 'selection_rules', num: '৭', label: 'সদস্য নির্বাচনের নিয়ম', icon: '📜' },
  { key: 'membership', num: '৮', label: 'আবেদন গ্রহণ ও সদস্য নির্বাচন', icon: '📝' },
  { key: 'discipline_safety', num: '৯', label: 'শৃঙ্খলা ও নিরাপত্তাবিধি', icon: '🛡️' },
  { key: 'competitions', num: '১০', label: 'বিতর্ক প্রতিযোগিতা ও ফলাফল', icon: '🏆' },
  { key: 'awards', num: '১১', label: 'মূল্যায়ন ও পুরস্কার ব্যবস্থা', icon: '🎖️' },
  { key: 'achievements', num: '১২', label: 'অর্জন ও ট্রফি গ্যালারি', icon: '🥇' }
];

export function DebateClubMasterSection({ teachers = [], initialTab = 'overview', onBackToHub }) {
  const mapInitialTab = (tab) => {
    if (!tab) return 'overview';
    if (tab === 'competitions' || tab === 'debate' || tab === 'results') return 'competitions';
    if (tab === 'panel' || tab === 'moderators') return 'panel';
    if (tab === 'calendar' || tab === 'schedule') return 'calendar';
    if (tab === 'achievements' || tab === 'trophies') return 'achievements';
    if (tab === 'membership' || tab === 'apply') return 'membership';
    if (tab === 'executive' || tab === 'council') return 'executive';
    if (tab === 'activities') return 'activities';
    if (tab === 'selection_rules') return 'selection_rules';
    if (tab === 'discipline_safety') return 'discipline_safety';
    if (tab === 'objectives') return 'objectives';
    if (tab === 'awards') return 'awards';
    return 'overview';
  };

  const [debTab, setDebTab] = useState(() => mapInitialTab(initialTab));
  useEffect(() => {
    if (initialTab) setDebTab(mapInitialTab(initialTab));
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

  // PANEL STATE (COORDINATORS & JUDGES)
  const [panelData, setPanelData] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_PANEL_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_PANEL;
    } catch {
      return DEFAULT_DEBATE_PANEL;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_PANEL_KEY, JSON.stringify(panelData));
    } catch {}
  }, [panelData]);

  // EXECUTIVE COMMITTEE STATE
  const [execData, setExecData] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_EXEC_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_EXEC;
    } catch {
      return DEFAULT_DEBATE_EXEC;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_EXEC_KEY, JSON.stringify(execData));
    } catch {}
  }, [execData]);

  // GOALS STATE
  const [goalsList, setGoalsList] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_GOALS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_GOALS;
    } catch {
      return DEFAULT_DEBATE_GOALS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_GOALS_KEY, JSON.stringify(goalsList));
    } catch {}
  }, [goalsList]);

  // REGULAR ACTIVITIES STATE
  const [activitiesList, setActivitiesList] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_ACTIVITIES_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_ACTIVITIES;
    } catch {
      return DEFAULT_DEBATE_ACTIVITIES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_ACTIVITIES_KEY, JSON.stringify(activitiesList));
    } catch {}
  }, [activitiesList]);

  // QUARTERLY ROADMAP STATE
  const [quarterlyPlans, setQuarterlyPlans] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_QUARTERLY_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_QUARTERLY;
    } catch {
      return DEFAULT_DEBATE_QUARTERLY;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_QUARTERLY_KEY, JSON.stringify(quarterlyPlans));
    } catch {}
  }, [quarterlyPlans]);

  // MONTHLY CALENDAR STATE
  const [monthlyCalendar, setMonthlyCalendar] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_MONTHLY_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_MONTHLY;
    } catch {
      return DEFAULT_DEBATE_MONTHLY;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_MONTHLY_KEY, JSON.stringify(monthlyCalendar));
    } catch {}
  }, [monthlyCalendar]);

  // SELECTION RULES STATE
  const [selectionRules, setSelectionRules] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_SELECTION_RULES_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_SELECTION_RULES;
    } catch {
      return DEFAULT_DEBATE_SELECTION_RULES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_SELECTION_RULES_KEY, JSON.stringify(selectionRules));
    } catch {}
  }, [selectionRules]);

  // DISCIPLINE RULES STATE
  const [disciplineRules, setDisciplineRules] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_DISCIPLINE_RULES_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_DISCIPLINE_RULES;
    } catch {
      return DEFAULT_DEBATE_DISCIPLINE_RULES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_DISCIPLINE_RULES_KEY, JSON.stringify(disciplineRules));
    } catch {}
  }, [disciplineRules]);

  // MEMBERSHIP STATE
  const [membersList, setMembersList] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_MEMBERSHIPS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_MEMBERS;
    } catch {
      return DEFAULT_DEBATE_MEMBERS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_MEMBERSHIPS_KEY, JSON.stringify(membersList));
    } catch {}
  }, [membersList]);

  // COMPETITIONS STATE
  const [competitionsList, setCompetitionsList] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_COMPETITIONS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_COMPETITIONS;
    } catch {
      return DEFAULT_DEBATE_COMPETITIONS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_COMPETITIONS_KEY, JSON.stringify(competitionsList));
    } catch {}
  }, [competitionsList]);

  // AWARDS STATE
  const [awardsList, setAwardsList] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_AWARDS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_AWARDS;
    } catch {
      return DEFAULT_DEBATE_AWARDS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_AWARDS_KEY, JSON.stringify(awardsList));
    } catch {}
  }, [awardsList]);

  // ACHIEVEMENTS STATE
  const [achievementsList, setAchievementsList] = useState(() => {
    try {
      const raw = localStorage.getItem(DEBATE_ACHIEVEMENTS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DEBATE_ACHIEVEMENTS;
    } catch {
      return DEFAULT_DEBATE_ACHIEVEMENTS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DEBATE_ACHIEVEMENTS_KEY, JSON.stringify(achievementsList));
    } catch {}
  }, [achievementsList]);

  // FILTER STATES
  const [achFilter, setAchFilter] = useState('সব');
  const [memFilterClass, setMemFilterClass] = useState('সব');
  const [memFilterStatus, setMemFilterStatus] = useState('সব');
  const [memSearch, setMemSearch] = useState('');

  // MEMBERSHIP APPLICATION FORM STATE
  const [newApp, setNewApp] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '',
    mobile: '',
    interest: 'সংসদীয় বিতর্ক ও নেতৃত্ব',
    experience: '',
    reason: ''
  });
  const [appReceipt, setAppReceipt] = useState(null);

  // DEMO FILL FOR APPLICATION
  const handleFillDemoApp = () => {
    setNewApp({
      student_name: 'আবরার হাবিব',
      class_name: '১০ম',
      section: 'বিজ্ঞান',
      roll_no: '২',
      mobile: '01711-335577',
      interest: 'সংসদীয় বিতর্ক ও উপস্থিত বক্তৃতা',
      experience: 'বিগত শিক্ষাবর্ষে আন্তঃশ্রেণি বিতর্ক ফাইনালে অংশগ্রহণ করেছি।',
      reason: 'যুক্তি দিয়ে সত্য প্রতিষ্ঠা করতে এবং প্রমিত বাংলা উচ্চারণে কথা বলতে আগ্রহী।'
    });
  };

  const handleApplyMembership = (e) => {
    e.preventDefault();
    if (!newApp.student_name.trim() || !newApp.roll_no.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম ও রোল নম্বর লিখুন।');
      return;
    }
    const trackingId = 'DEB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const item = {
      id: 'mem-' + Date.now(),
      tracking_id: trackingId,
      ...newApp,
      status: 'pending',
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setMembersList(prev => [item, ...prev]);
    setAppReceipt(item);
    setNewApp({
      student_name: '',
      class_name: '৯ম',
      section: 'বিজ্ঞান',
      roll_no: '',
      mobile: '',
      interest: 'সংসদীয় বিতর্ক ও নেতৃত্ব',
      experience: '',
      reason: ''
    });
  };

  // LIVE DEBATE SCORING ENGINE STATE (User's Exact Rubric)
  // যুক্তি ও বিশ্লেষণ (৩০), তথ্য ও প্রমাণ (২০), বক্তব্য উপস্থাপন (২০), পাল্টা যুক্তি (১৫), ভাষা ও শালীনতা (১০), সময় ব্যবস্থাপনা (৫) -> Total: 100
  const [newScorecard, setNewScorecard] = useState({
    title: 'সাপ্তাহিক বিতর্ক ম্যাচ — শিক্ষাবর্ষ ২০২৬',
    motion: 'প্রস্তাবনা: তথ্যপ্রযুক্তির অতি-ব্যবহার তরুণ প্রজন্মের শারীরিক ও মানসিক বিকাশে বাধা সৃষ্টি করছে।',
    format: 'সংসদীয় বিতর্ক',
    date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
    venue: 'বিদ্যালয় কেন্দ্রীয় ডিবেট কর্নার',
    propTeamName: 'সরকারি দল',
    oppTeamName: 'বিরোধী দল',
    moderator: { name: 'মো: হাবিবুর রহমান', designation: 'সিনিয়র শিক্ষক (বাংলা)', teacherId: '' },
    chiefJudge: { name: 'মুহাম্মদ শফিকুল ইসলাম', designation: 'প্রধান শিক্ষক ও সভাপতি', teacherId: '' },
    judge1: { name: 'মো: আবদুল খালেক', designation: 'সহকারী প্রধান শিক্ষক', teacherId: '' },
    judge2: { name: 'মো: আবু বকর সিদ্দিক', designation: 'সহকারী শিক্ষক (আইসিটি)', teacherId: '' },
    propSpeakers: [
      { role: '১ম বক্তা (প্রধানমন্ত্রী)', name: 'আহনাফ সিদ্দিক', logic: 27, facts: 18, delivery: 18, rebuttal: 13, ethics: 9, time: 5 },
      { role: '২য় বক্তা (মন্ত্রী)', name: 'ফাহিম ফয়সাল', logic: 25, facts: 17, delivery: 17, rebuttal: 13, ethics: 9, time: 4 },
      { role: 'দলনেতা (উপসংহার)', name: 'মেহজাবীন সুলতানা', logic: 28, facts: 19, delivery: 19, rebuttal: 14, ethics: 10, time: 5 }
    ],
    oppSpeakers: [
      { role: '১ম বক্তা (বিরোধী দলীয় নেতা)', name: 'সুমাইয়া আক্তার', logic: 26, facts: 17, delivery: 18, rebuttal: 13, ethics: 9, time: 4 },
      { role: '২য় বক্তা (উপনেতা)', name: 'তানভীর আহমেদ', logic: 24, facts: 16, delivery: 16, rebuttal: 12, ethics: 8, time: 4 },
      { role: 'দলনেতা (উপসংহার)', name: 'সিফাত হাসান', logic: 26, facts: 18, delivery: 17, rebuttal: 13, ethics: 9, time: 5 }
    ],
    judgesNote: 'টানটান উত্তেজনাকর বিতর্ক। উভয় দল চমৎকার যুক্তি উপস্থাপন করেছে।'
  });

  const calcSpeakerTotal = (spk) => {
    return Number(spk.logic || 0) + Number(spk.facts || 0) + Number(spk.delivery || 0) + Number(spk.rebuttal || 0) + Number(spk.ethics || 0) + Number(spk.time || 0);
  };

  const calcTeamTotal = (speakers) => {
    return speakers.reduce((sum, spk) => sum + calcSpeakerTotal(spk), 0);
  };

  const handleSaveDebateResult = (e) => {
    e.preventDefault();
    const propTotal = calcTeamTotal(newScorecard.propSpeakers);
    const oppTotal = calcTeamTotal(newScorecard.oppSpeakers);
    const isPropWin = propTotal >= oppTotal;
    const winner = isPropWin ? newScorecard.propTeamName : newScorecard.oppTeamName;

    // Find best speaker
    let highestScore = -1;
    let bestSpkName = '';
    [...newScorecard.propSpeakers, ...newScorecard.oppSpeakers].forEach(spk => {
      const tot = calcSpeakerTotal(spk);
      if (tot > highestScore) {
        highestScore = tot;
        bestSpkName = spk.name + ' (' + spk.role + ' - ' + toBn(tot) + ' নম্বর)';
      }
    });

    const compItem = {
      id: 'comp-' + Date.now(),
      title: newScorecard.title,
      motion: newScorecard.motion,
      format: newScorecard.format,
      date: newScorecard.date,
      venue: newScorecard.venue,
      propTeamName: newScorecard.propTeamName,
      oppTeamName: newScorecard.oppTeamName,
      winner: winner,
      bestSpeaker: bestSpkName,
      propScore: propTotal,
      oppScore: oppTotal,
      status: 'সম্পন্ন',
      judgesNote: newScorecard.judgesNote,
      propSpeakers: newScorecard.propSpeakers,
      oppSpeakers: newScorecard.oppSpeakers,
      moderator: newScorecard.moderator,
      chiefJudge: newScorecard.chiefJudge,
      judge1: newScorecard.judge1,
      judge2: newScorecard.judge2
    };

    setCompetitionsList(prev => [compItem, ...prev]);
    alert('✓ বির্তক প্রতিযোগিতা স্কোরশিট ও ফলাফল সফলভাবে সংরক্ষণ করা হয়েছে!\nবিজয়ী: ' + winner + '\nশ্রেষ্ঠ বক্তা: ' + bestSpkName);
  };

  // ORGANIZE NEW DEBATE STATE (User Requirement: নতুন বিতর্ক আয়োজন করুন)
  const [showOrganizeModal, setShowOrganizeModal] = useState(false);
  const [organizeForm, setOrganizeForm] = useState({
    title: 'আন্তঃশ্রেণি বিতর্ক প্রতিযোগিতা ২০২৬ (ম্যাচ-১)',
    motion: 'এই সংসদ বিশ্বাস করে যে, কৃত্রিম বুদ্ধিমত্তা ও তথ্যপ্রযুক্তির নৈতিক প্রয়োগই আগামীর সমৃদ্ধ বাংলাদেশের চাবিকাঠি।',
    format: 'সংসদীয় বিতর্ক',
    date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
    venue: 'বিদ্যালয় কেন্দ্রীয় মিলনায়তন',
    propTeamName: 'সরকারি দল',
    oppTeamName: 'বিরোধী দল',
    moderator: { name: 'মো: হাবিবুর রহমান', designation: 'সিনিয়র শিক্ষক (বাংলা)', teacherId: '' },
    chiefJudge: { name: 'মুহাম্মদ শফিকুল ইসলাম', designation: 'প্রধান শিক্ষক ও সভাপতি', teacherId: '' },
    judge1: { name: 'মো: আবদুল খালেক', designation: 'সহকারী প্রধান শিক্ষক', teacherId: '' },
    judge2: { name: 'মো: আবু বকর সিদ্দিক', designation: 'সহকারী শিক্ষক (আইসিটি)', teacherId: '' }
  });

  // CHANGE MODERATOR & JUDGES STATE (User Requirement: মডারেটর এবং বিচারক মন্ডলী চেঞ্জ করার ব্যবস্থা)
  const [editingDebateJudges, setEditingDebateJudges] = useState(null);

  const handleOpenOrganizeModal = () => {
    setOrganizeForm(prev => ({
      ...prev,
      title: 'আন্তঃশ্রেণি বিতর্ক প্রতিযোগিতা ২০২৬',
      motion: 'এই সংসদ বিশ্বাস করে যে, যুক্তিনির্ভর বিজ্ঞানমনস্ক শিক্ষাই তরুণ প্রজন্মকে বিভ্রান্তি থেকে মুক্ত রাখতে পারে।',
      format: 'সংসদীয় বিতর্ক',
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      venue: 'বিদ্যালয় কেন্দ্রীয় মিলনায়তন',
      propTeamName: 'সরকারি দল',
      oppTeamName: 'বিরোধী দল',
      moderator: {
        name: panelData?.coordinators?.[0]?.name || 'মো: হাবিবুর রহমান',
        designation: panelData?.coordinators?.[0]?.designation || 'সিনিয়র শিক্ষক (বাংলা)',
        teacherId: panelData?.coordinators?.[0]?.teacherId || ''
      },
      chiefJudge: {
        name: panelData?.judges?.chiefJudge?.name || 'মুহাম্মদ শফিকুল ইসলাম',
        designation: panelData?.judges?.chiefJudge?.designation || 'প্রধান শিক্ষক ও সভাপতি',
        teacherId: ''
      },
      judge1: {
        name: panelData?.judges?.judge1?.name || 'মো: আবদুল খালেক',
        designation: panelData?.judges?.judge1?.designation || 'সহকারী প্রধান শিক্ষক',
        teacherId: ''
      },
      judge2: {
        name: panelData?.judges?.judge2?.name || 'মো: আবু বকর সিদ্দিক',
        designation: panelData?.judges?.judge2?.designation || 'সহকারী শিক্ষক (আইসিটি)',
        teacherId: ''
      }
    }));
    setShowOrganizeModal(true);
  };

  const handleConfirmOrganize = (e) => {
    e.preventDefault();
    if (!organizeForm.title.trim() || !organizeForm.motion.trim()) {
      alert('অনুগ্রহ করে বিতর্কের শিরোনাম ও প্রস্তাবনা (Motion) লিখুন।');
      return;
    }
    setNewScorecard(prev => ({
      ...prev,
      title: organizeForm.title,
      motion: organizeForm.motion,
      format: organizeForm.format,
      date: organizeForm.date,
      venue: organizeForm.venue,
      propTeamName: organizeForm.propTeamName || 'সরকারি দল',
      oppTeamName: organizeForm.oppTeamName || 'বিরোধী দল',
      moderator: { ...organizeForm.moderator },
      chiefJudge: { ...organizeForm.chiefJudge },
      judge1: { ...organizeForm.judge1 },
      judge2: { ...organizeForm.judge2 }
    }));
    setShowOrganizeModal(false);
    setDebTab('competitions');
    setTimeout(() => {
      const el = document.getElementById('live-debate-engine-card');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    alert('✓ নতুন বিতর্ক প্রতিযোগিতা সফলভাবে আয়োজন করা হয়েছে!\n\n🎙️ মডারেটর: ' + (organizeForm.moderator.name || 'নির্ধারিত') + '\n⚖️ প্রধান বিচারক: ' + (organizeForm.chiefJudge.name || 'নির্ধারিত') + '\n⚖️ বিচারক-১: ' + (organizeForm.judge1.name || 'নির্ধারিত') + '\n⚖️ বিচারক-২: ' + (organizeForm.judge2.name || 'নির্ধারিত') + '\n\nএখন সরাসরি স্কোরশিটে নম্বর এন্ট্রি করে ফলাফল ঘোষণা করুন।');
  };

  const handleSaveJudgesChange = (e) => {
    e.preventDefault();
    if (!editingDebateJudges) return;
    if (editingDebateJudges.target === 'current') {
      setNewScorecard(prev => ({
        ...prev,
        moderator: { ...editingDebateJudges.moderator },
        chiefJudge: { ...editingDebateJudges.chiefJudge },
        judge1: { ...editingDebateJudges.judge1 },
        judge2: { ...editingDebateJudges.judge2 }
      }));
    } else if (editingDebateJudges.target === 'competition' && editingDebateJudges.compId) {
      setCompetitionsList(prev => prev.map(c => {
        if (c.id === editingDebateJudges.compId) {
          return {
            ...c,
            moderator: { ...editingDebateJudges.moderator },
            chiefJudge: { ...editingDebateJudges.chiefJudge },
            judge1: { ...editingDebateJudges.judge1 },
            judge2: { ...editingDebateJudges.judge2 }
          };
        }
        return c;
      }));
    }
    setEditingDebateJudges(null);
    alert('✓ মডারেটর ও বিচারকমণ্ডলী সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  // EDIT MODAL STATES
  const [editingCoordinator, setEditingCoordinator] = useState(null);
  const [coordEditForm, setCoordEditForm] = useState({ id: '', name: '', designation: '', role: '', phone: '' });

  const [editingExecPost, setEditingExecPost] = useState(null);
  const [execPostEditForm, setExecPostEditForm] = useState({ postKey: '', title: '', name: '', class: '১০ম', section: 'বিজ্ঞান', roll: '', phone: '' });

  const [editingExecMember, setEditingExecMember] = useState(null);
  const [execMemEditForm, setExecMemEditForm] = useState({ id: '', name: '', class: '৮ম', section: 'শাখা ক', roll: '', phone: '' });

  const [newMemberForm, setNewMemberForm] = useState({ name: '', class: '৮ম', section: 'শাখা ক', roll: '', phone: '' });

  const [editingGoal, setEditingGoal] = useState(null);
  const [goalEditForm, setGoalEditForm] = useState({ id: '', num: '', title: '', desc: '' });

  const [editingActivity, setEditingActivity] = useState(null);
  const [actEditForm, setActEditForm] = useState({ id: '', num: '', title: '', focus: '', desc: '', time: '', venue: '' });

  const [editingQuarter, setEditingQuarter] = useState(null);
  const [quarterEditForm, setQuarterEditForm] = useState({ id: '', quarter: '', title: '', desc: '' });

  const [editingMonth, setEditingMonth] = useState(null);
  const [monthEditForm, setMonthEditForm] = useState({ id: '', month: '', title: '', date: '', coordinator: '' });

  const [editingSelectionRule, setEditingSelectionRule] = useState(null);
  const [selRuleEditForm, setSelRuleEditForm] = useState({ id: '', num: '', title: '', text: '' });

  const [editingDisciplineRule, setEditingDisciplineRule] = useState(null);
  const [discRuleEditForm, setDiscRuleEditForm] = useState({ id: '', num: '', rule: '', desc: '' });

  const [editingMember, setEditingMember] = useState(null);
  const [memberEditForm, setMemberEditForm] = useState({ id: '', student_name: '', class_name: '', section: '', roll_no: '', mobile: '', interest: '', status: '' });

  const [editingAward, setEditingAward] = useState(null);
  const [awardEditForm, setAwardEditForm] = useState({ id: '', category: '', categoryEn: '', winner: '', class: '', section: '', roll: '', event: '', badge: '', remarks: '' });

  const [editingAchievement, setEditingAchievement] = useState(null);
  const [achEditForm, setAchEditForm] = useState({ id: '', year: '', event: '', level: '', category: 'উপজেলা', award: '', team: '', note: '' });

  // PRINT HELPER WITH SCHOOL PAD
  const printWithPad = (docTitle, docBadge, mainHtml) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${docTitle} — মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 10mm 12mm 10mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #e0e7ff; color: #312e81; border: 1px solid #c7d2fe; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #e0e7ff; color: #312e81; border: 1px solid #c7d2fe; padding: 7px 8px; text-align: left; font-size: 12.5px; }
          td { border: 1px solid #cbd5e1; padding: 7px 8px; vertical-align: top; }
          .card-box { border: 1.5px solid #c7d2fe; border-radius: 8px; padding: 12px 16px; margin: 10px 0; background: #faf5ff; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 10px 0 12px 0;">
          <span class="doc-badge">${docBadge}</span>
          <h2 style="margin:4px 0; color:#312e81; font-size:18px;">${docTitle}</h2>
          <div style="font-size:12px; color:#475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • ডিবেটিং সোসাইটি (Debating Club) • শিক্ষাবর্ষ: ২০২৬</div>
        </div>
        ${mainHtml}
        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <span style="font-size:11.5px; color:#475569;">প্রধান সমন্বয়ক, ডিবেটিং ক্লাব</span>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:11.5px; color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 4px', fontFamily: "'SolaimanLipi', Arial, sans-serif" }}>
      {/* TOP HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: '#ffffff',
        padding: '24px',
        borderRadius: '14px',
        marginBottom: '20px',
        boxShadow: '0 4px 14px rgba(49, 46, 129, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '3px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, marginBottom: '8px' }}>
          ✨ যুক্তি দিয়ে সত্যের অন্বেষণ • বাচনভঙ্গি ও নেতৃত্বের নব দিগন্ত
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 900 }}>
          মগড়া পালস্ ডিবেটিং ক্লাব (Debating Society)
        </h2>
        <p style={{ margin: '0 0 14px 0', fontSize: '13px', lineHeight: 1.6, opacity: 0.95, maxWidth: '900px' }}>
          “যুক্তি দিয়ে বলব, তথ্য দিয়ে প্রমাণ করব, অন্যের মতকে সম্মান করব” — প্রাতিষ্ঠানিক বিতর্কচর্চা, জাতীয় ও সংসদীয় বিতর্ক, উপস্থিত বক্তৃতা ও বাচনভঙ্গি উন্নয়নের মাধ্যমে শিক্ষার্থীদের যুক্তিবাদী, কুসংস্কারমুক্ত ও আত্মপ্রত্যয়ী নাগরিক হিসেবে গড়ে তোলার অন্যতম শ্রেষ্ঠ মঞ্চ।
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11.5px' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>🏛️ স্থাপিত: ২০২০ খ্রি.</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>⚔️ সাপ্তাহিক অধিবেশন: প্রতি শনিবার বিকাল ৩:০০</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>🏆 উপজেলা স্কুল বিতর্ক চ্যাম্পিয়ন ২০২৬</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>🎤 সংসদীয় ও বারোয়ারি বিতর্ক</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>👥 ১২০+ সক্রিয় বিতার্কিক</span>
        </div>
        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleOpenOrganizeModal}
            style={{
              background: '#f59e0b',
              color: '#1e1b4b',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🎙️ নতুন বিতর্ক আয়োজন করুন ➔
          </button>
          <button
            type="button"
            onClick={() => setDebTab('competitions')}
            style={{
              background: '#ffffff',
              color: '#312e81',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
            }}
          >
            🏆 লাইভ স্কোরশিট ও ফলাফল
          </button>
          <button
            type="button"
            onClick={() => setDebTab('membership')}
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📝 সদস্যপদের আবেদন করুন
          </button>
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              style={{
                background: 'transparent',
                color: '#e0e7ff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ⬅️ কেন্দ্রীয় ক্লাব ডিরেক্টরি
            </button>
          )}
        </div>
      </div>

      {/* 12-FEATURE DIRECTORY TAB BAR (MATCHING IMAGE 2 EXACT WRAPPED CARD FORMAT) */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #c7d2fe',
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: '22px',
        boxShadow: '0 2px 10px rgba(49, 46, 129, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#312e81', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            ডিবেটিং ক্লাবের ১২টি মূল ফিচার ডিরেক্টরি:
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
          {DEBATE_TABS.map((tab) => {
            const isActive = debTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setDebTab(tab.key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #4338ca' : '1px solid #cbd5e1',
                  background: isActive ? '#e0e7ff' : '#ffffff',
                  color: isActive ? '#312e81' : '#334155',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(49, 46, 129, 0.15)' : 'none'
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
      {debTab === 'overview' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                🏛️ ডিবেটিং ক্লাব পরিচিতি (Club Overview & Identity)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের বিতার্কিকদের প্রাতিষ্ঠানিক পরিচিতি ও মূলভিত্তি
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const html = `
                  <div class="card-box">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাব — প্রাতিষ্ঠানিক পরিচিতি সনদ</h3>
                    <table>
                      <tbody>
                        <tr><td style="width:25%; font-weight:700; background:#f5f3ff;">ক্লাবের নাম</td><td><b>ডিবেটিং ক্লাব</b></td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">ইংরেজি নাম</td><td><b>Debating Club</b></td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">প্রতিষ্ঠানের নাম</td><td><b>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</b></td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">পরিচালনা</td><td>পৃষ্ঠপোষক ও কেন্দ্রীয় উপদেষ্টা পরিষদের তত্ত্বাবধানে</td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">ক্লাব সমন্বয়ক</td><td>বাংলা বা ইংরেজি বিষয়ের শিক্ষক</td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">সদস্য</td><td>ষষ্ঠ থেকে দশম শ্রেণির শিক্ষার্থী</td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">কার্যক্রম</td><td>বিতর্ক, যুক্তিতর্ক, বক্তৃতা ও উপস্থাপনা</td></tr>
                        <tr><td style="font-weight:700; background:#f5f3ff;">মূলনীতি</td><td><b style="color:#312e81;">যুক্তি দিয়ে বলব, তথ্য দিয়ে প্রমাণ করব, অন্যের মতকে সম্মান করব।</b></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <h4 style="margin:16px 0 8px 0; color:#312e81;">ডিবেটিং ক্লাবের ৪টি মূল স্তম্ভ:</h4>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12.5px;">
                    <div style="border:1px solid #c7d2fe; padding:8px 12px; border-radius:6px; background:#fdf4ff;"><b>১. যুক্তি ও বিশ্লেষণ:</b> যৌক্তিক ভিত্তি ও সূক্ষ্ম চিন্তন।</div>
                    <div style="border:1px solid #c7d2fe; padding:8px 12px; border-radius:6px; background:#fdf4ff;"><b>২. তথ্য ও প্রমাণ:</b> নিরপেক্ষ উপাত্ত ও প্রামাণ্য বিশ্লেষণ।</div>
                    <div style="border:1px solid #c7d2fe; padding:8px 12px; border-radius:6px; background:#fdf4ff;"><b>৩. বাচনভঙ্গি ও উপস্থাপনা:</b> প্রমিত উচ্চারণ ও স্পষ্ট বক্তৃতা।</div>
                    <div style="border:1px solid #c7d2fe; padding:8px 12px; border-radius:6px; background:#fdf4ff;"><b>৪. পরমতসহিষ্ণুতা:</b> ভিন্নমতের প্রতি পরম শ্রদ্ধা ও সৌজন্যবোধ।</div>
                  </div>
                `;
                printWithPad('ডিবেটিং ক্লাব পরিচিতি সনদ', '🏛️ প্রাতিষ্ঠানিক ক্লাব পরিচিতি', html);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #312e81',
                color: '#312e81',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🖨️ বিদ্যালয়ের প্যাডে প্রিন্ট করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '14px' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e9d5ff' }}>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700, width: '42%' }}>ক্লাবের নাম:</td>
                    <td style={{ padding: '6px 0', color: '#1e1b4b', fontWeight: 900 }}>ডিবেটিং ক্লাব</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e9d5ff' }}>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700 }}>ইংরেজি নাম:</td>
                    <td style={{ padding: '6px 0', color: '#312e81', fontWeight: 800 }}>Debating Club</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e9d5ff' }}>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700 }}>প্রতিষ্ঠানের নাম:</td>
                    <td style={{ padding: '6px 0', color: '#1e1b4b', fontWeight: 800 }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700 }}>পরিচালনা:</td>
                    <td style={{ padding: '6px 0', color: '#334155', fontWeight: 700 }}>পৃষ্ঠপোষক ও কেন্দ্রীয় উপদেষ্টা পরিষদ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd6fe' }}>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700, width: '42%' }}>ক্লাব সমন্বয়ক:</td>
                    <td style={{ padding: '6px 0', color: '#1e1b4b', fontWeight: 800 }}>বাংলা বা ইংরেজি বিষয়ের শিক্ষক</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd6fe' }}>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700 }}>সদস্য:</td>
                    <td style={{ padding: '6px 0', color: '#1e1b4b', fontWeight: 800 }}>ষষ্ঠ থেকে দশম শ্রেণির শিক্ষার্থী</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd6fe' }}>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700 }}>কার্যক্রম:</td>
                    <td style={{ padding: '6px 0', color: '#334155', fontWeight: 700 }}>বিতর্ক, যুক্তিতর্ক, বক্তৃতা ও উপস্থাপনা</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 700 }}>মূলনীতি:</td>
                    <td style={{ padding: '6px 0', color: '#312e81', fontWeight: 900 }}>যুক্তি দিয়ে বলব, তথ্য দিয়ে প্রমাণ করব, অন্যের মতকে সম্মান করব।</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#312e81', fontWeight: 800 }}>
            ডিবেটিং ক্লাবের ৪টি মূল স্তম্ভ (Pillars of Debating):
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#ffffff', border: '1.5px solid #c7d2fe', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🧠</div>
              <b style={{ color: '#1e1b4b', fontSize: '13.5px' }}>১. যুক্তি ও বিশ্লেষণ (Logic)</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                আবেগ বা অতিকথনের পরিবর্তে কারণ ও প্রভাব বিশ্লেষণ করে অকাট্য যুক্তি প্রতিষ্ঠা করা।
              </p>
            </div>
            <div style={{ background: '#ffffff', border: '1.5px solid #c7d2fe', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
              <b style={{ color: '#1e1b4b', fontSize: '13.5px' }}>২. তথ্য ও প্রমাণ (Evidence)</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                বিশ্বাসযোগ্য উৎস, পরিসংখ্যান, গবেষণা রিপোর্ট ও বাস্তব উদাহরণ দিয়ে বক্তব্য জোরালো করা।
              </p>
            </div>
            <div style={{ background: '#ffffff', border: '1.5px solid #c7d2fe', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎙️</div>
              <b style={{ color: '#1e1b4b', fontSize: '13.5px' }}>৩. বাচনভঙ্গি ও বাগ্মীতা (Oratory)</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                শুদ্ধ উচ্চারণ, আত্মবিশ্বাসী কণ্ঠস্বর, শারীরিক ভাষা ও শ্রোতাকে মুগ্ধ করার শিল্প।
              </p>
            </div>
            <div style={{ background: '#ffffff', border: '1.5px solid #c7d2fe', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🤝</div>
              <b style={{ color: '#1e1b4b', fontSize: '13.5px' }}>৪. পরমতসহিষ্ণুতা (Tolerance)</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                ভিন্নমতের প্রতি পরম শ্রদ্ধা, ধৈর্যশীল শ্রবণ ও সৌহার্দ্যপূর্ণ বিতর্ক সংস্কৃতি গড়ে তোলা।
              </p>
            </div>
          </div>

          {/* শীর্ষ পৃষ্ঠপোষক ও সমন্বয়ক পরিষদ */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '14px', background: '#f5f3ff' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#312e81', textTransform: 'uppercase' }}>প্রধান পৃষ্ঠপোষক</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={resolvedHeadPhoto}
                  alt="প্রধান শিক্ষক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #312e81' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{leadershipInfo.head?.name || 'মুহাম্মদ শফিকুল ইসলাম'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '14px', background: '#f5f3ff' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>সার্বিক পৃষ্ঠপোষকতা</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={resolvedPresidentPhoto}
                  alt="ম্যানেজিং কমিটি সভাপতি"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #b45309' }}
                  onError={(e) => { e.target.src = PHOTO_PRESIDENT; }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{leadershipInfo.president?.name || 'নেয়ামুল হক খান'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '14px', background: '#f5f3ff' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase' }}>প্রধান সমন্বয়ক</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={getResolvedTeacherPhoto(panelData.coordinators?.[0]?.teacherId, panelData.coordinators?.[0]?.name || 'মোঃ আব্দুল খালেক')}
                  alt="প্রধান সমন্বয়ক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4338ca' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{panelData.coordinators?.[0]?.name || 'মোঃ আব্দুল খালেক'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{panelData.coordinators?.[0]?.designation || 'সহকারী শিক্ষক (বাংলা)'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: মূল লক্ষ্য ও উদ্দেশ্য */}
      {/* ========================================================================= */}
      {debTab === 'objectives' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ২
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                🎯 ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য (১০টি সুনির্দিষ্ট লক্ষ্য)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                শিক্ষার্থীদের যুক্তিবোধ, বাচনিক দক্ষতা ও নেতৃত্ব বিকাশে গৃহীত সুনির্দিষ্ট লক্ষ্যসমূহ
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box">
                      <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের ১০টি মূল লক্ষ্য ও উদ্দেশ্য</h3>
                      <table>
                        <thead>
                          <tr><th style="width:45px; text-align:center;">ক্র.</th><th>লক্ষ্যের শিরোনাম</th><th>বিস্তারিত বিবরণ</th></tr>
                        </thead>
                        <tbody>
                          ${goalsList.map(g => `
                            <tr>
                              <td style="text-align:center; font-weight:700;">${g.num}</td>
                              <td><b>${g.title}</b></td>
                              <td>${g.desc}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য', '🎯 লক্ষ্য ও কর্মউদ্দেশ্য', html);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #312e81',
                  color: '#312e81',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি লক্ষ্য ও উদ্দেশ্যসমূহ ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?')) {
                    setGoalsList(DEFAULT_DEBATE_GOALS);
                  }
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                🔄 ডিফল্ট রিসেট
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {goalsList.map((goal, idx) => (
              <div
                key={goal.id || idx}
                style={{
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    background: '#312e81',
                    color: '#ffffff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {goal.num || toBn(idx + 1)}
                  </span>
                  <div>
                    <b style={{ color: '#1e1b4b', fontSize: '13.5px', display: 'block' }}>
                      {goal.title || 'লক্ষ্য ' + toBn(idx + 1)}
                    </b>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                      {goal.desc}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoal(goal);
                      setGoalEditForm({ id: goal.id, num: goal.num, title: goal.title, desc: goal.desc });
                    }}
                    style={{
                      background: '#f3e8ff',
                      border: '1px solid #d8b4fe',
                      color: '#6b21a8',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    ✏️ এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি এই লক্ষ্যটি মুছে ফেলতে চান?')) {
                        setGoalsList(prev => prev.filter(g => g.id !== goal.id));
                      }
                    }}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD NEW GOAL FORM */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px' }}>
            <b style={{ fontSize: '13px', color: '#312e81' }}>➕ নতুন লক্ষ্য বা উদ্দেশ্য যুক্ত করুন:</b>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const title = form.goalTitle.value.trim();
                const desc = form.goalDesc.value.trim();
                if (!desc) return;
                const newG = {
                  id: 'goal-' + Date.now(),
                  num: toBn(goalsList.length + 1),
                  title: title || 'নতুন লক্ষ্য ' + toBn(goalsList.length + 1),
                  desc: desc
                };
                setGoalsList(prev => [...prev, newG]);
                form.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: '10px', marginTop: '8px' }}
            >
              <input name="goalTitle" placeholder="লক্ষ্যের নাম (ঐচ্ছিক)" style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              <input name="goalDesc" required placeholder="লক্ষ্যের বিস্তারিত বিবরণ লিখুন..." style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              <button type="submit" style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                + যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3: সমন্বয়ক ও বিচারক প্যানেল */}
      {/* ========================================================================= */}
      {debTab === 'panel' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৩
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                👨‍🏫 সমন্বয়ক ও বিচারক প্যানেল
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                শিক্ষকদের ড্রপ-ডাউন তালিকা থেকে এক বা একাধিক সমন্বয়ক এবং ৩ সদস্যের বিচারক প্যানেল নির্বাচন
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const html = `
                  <div class="card-box">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">১. ডিবেটিং ক্লাবের সম্মানিত সমন্বয়কমণ্ডলী</h3>
                    <table>
                      <thead><tr><th>ক্র.</th><th>শিক্ষকের নাম ও পদবি</th><th>ক্লাবে দায়িত্ব</th><th>মোবাইল নম্বর</th></tr></thead>
                      <tbody>
                        ${panelData.coordinators.map((c, i) => `
                          <tr>
                            <td style="text-align:center;">${toBn(i + 1)}</td>
                            <td><b>${c.name}</b><br><span style="font-size:11.5px; color:#64748b;">${c.designation}</span></td>
                            <td><b style="color:#312e81;">${c.role}</b></td>
                            <td>${c.phone || '—'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>

                  <div class="card-box" style="margin-top:16px;">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">২. বিতর্ক বিচারক প্যানেল (Judges Panel)</h3>
                    <table>
                      <thead><tr><th>বিচারকের পদ</th><th>নাম ও প্রাতিষ্ঠানিক পদবি</th><th>বিশেষ দায়িত্ব</th></tr></thead>
                      <tbody>
                        <tr><td><b>প্রধান বিচারক</b></td><td><b>${panelData.judges.chiefJudge.name}</b> (${panelData.judges.chiefJudge.designation})</td><td>${panelData.judges.chiefJudge.role}</td></tr>
                        <tr><td><b>বিচারক ১</b></td><td><b>${panelData.judges.judge1.name}</b> (${panelData.judges.judge1.designation})</td><td>${panelData.judges.judge1.role}</td></tr>
                        <tr><td><b>বিচারক ২</b></td><td><b>${panelData.judges.judge2.name}</b> (${panelData.judges.judge2.designation})</td><td>${panelData.judges.judge2.role}</td></tr>
                      </tbody>
                    </table>
                  </div>
                `;
                printWithPad('ডিবেটিং ক্লাব সমন্বয়ক ও বিচারক প্যানেল', '👨‍🏫 প্যানেল রেজুলেশন', html);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #312e81',
                color: '#312e81',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
            </button>
          </div>

          {/* COORDINATORS SECTION */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <b style={{ color: '#312e81', fontSize: '14.5px' }}>
                ১. ক্লাব সমন্বয়কমণ্ডলী (এক বা একাধিক শিক্ষক যুক্তকরণ):
              </b>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              {panelData.coordinators.map((coord) => (
                <div
                  key={coord.id}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #c7d2fe',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <img
                    src={getResolvedTeacherPhoto(coord.teacherId, coord.name)}
                    alt={coord.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #818cf8',
                      flexShrink: 0
                    }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ color: '#1e1b4b', fontSize: '13.5px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {coord.name}
                    </b>
                    <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>
                      {coord.designation}
                    </span>
                    <span style={{ fontSize: '11px', color: '#4338ca', fontWeight: 800, background: '#ede9fe', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                      {coord.role}
                    </span>
                    {coord.phone && (
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                        📞 {coord.phone}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCoordinator(coord);
                        setCoordEditForm(coord);
                      }}
                      style={{
                        background: '#f3e8ff',
                        border: '1px solid #d8b4fe',
                        color: '#6b21a8',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ✏️
                    </button>
                    {panelData.coordinators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('আপনি কি এই সমন্বয়ক পদটি মুছে ফেলতে চান?')) {
                            setPanelData(prev => ({
                              ...prev,
                              coordinators: prev.coordinators.filter(c => c.id !== coord.id)
                            }));
                          }
                        }}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#991b1b',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ADD COORDINATOR VIA TEACHER DROPDOWN */}
            <div style={{ background: '#faf5ff', border: '1px dashed #c084fc', borderRadius: '8px', padding: '12px' }}>
              <b style={{ fontSize: '12.5px', color: '#6b21a8' }}>
                ➕ শিক্ষকদের তালিকা থেকে নতুন সমন্বয়ক যুক্ত করুন:
              </b>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const teacherId = form.selectedTeacher.value;
                  const role = form.assignedRole.value.trim() || 'সহকারী সমন্বয়ক';
                  const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === teacherId);
                  if (!tObj) return;
                  const newC = {
                    id: 'coord-deb-' + Date.now(),
                    teacherId: teacherId,
                    name: tObj.name_bn || tObj.name,
                    designation: tObj.designation || 'সহকারী শিক্ষক',
                    role: role,
                    phone: tObj.phone || tObj.mobile || ''
                  };
                  setPanelData(prev => ({
                    ...prev,
                    coordinators: [...prev.coordinators, newC]
                  }));
                  form.reset();
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto', gap: '8px', marginTop: '8px' }}
              >
                <select name="selectedTeacher" required style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                  <option value="">— শিক্ষক নির্বাচন করুন —</option>
                  {activeTeachers.map(t => (
                    <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                      {t.name_bn || t.name} ({t.designation || 'শিক্ষক'} - {t.subject || ''})
                    </option>
                  ))}
                </select>
                <input name="assignedRole" placeholder="দায়িত্ব (যেমন: সমন্বয়ক - ইংরেজি বিতর্ক)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                <button type="submit" style={{ background: '#6b21a8', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  + সমন্বয়ক যুক্ত করুন
                </button>
              </form>
            </div>
          </div>

          {/* JUDGES PANEL SECTION */}
          <div>
            <b style={{ color: '#312e81', fontSize: '14.5px', display: 'block', marginBottom: '8px' }}>
              ২. বিচারক প্যানেল (প্রধান বিচারক ১ জন, বিচারক ২ জন):
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {/* CHIEF JUDGE */}
              <div style={{ background: '#f5f3ff', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#a855f7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                    প্রধান বিচারক (১ জন)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const t = prompt('প্রধান বিচারকের নাম ও পদবি লিখুন:', panelData.judges.chiefJudge.name);
                      if (t !== null && t.trim()) {
                        setPanelData(prev => ({
                          ...prev,
                          judges: {
                            ...prev.judges,
                            chiefJudge: { ...prev.judges.chiefJudge, name: t.trim() }
                          }
                        }));
                      }
                    }}
                    style={{ background: '#ffffff', border: '1px solid #a855f7', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✏️ এডিট
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', marginBottom: '8px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judges.chiefJudge?.teacherId, panelData.judges.chiefJudge?.name)}
                    alt={panelData.judges.chiefJudge?.name || 'প্রধান বিচারক'}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #a855f7', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14.5px', color: '#1e1b4b', display: 'block' }}>
                      {panelData.judges.chiefJudge.name}
                    </b>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                      {panelData.judges.chiefJudge.designation}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#6b21a8', fontWeight: 700, display: 'block' }}>
                      দায়িত্ব: {panelData.judges.chiefJudge.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>শিক্ষক ড্রপ-ডাউন থেকে নির্বাচন:</label>
                  <select
                    value={panelData.judges.chiefJudge?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setPanelData(prev => ({
                          ...prev,
                          judges: {
                            ...prev.judges,
                            chiefJudge: {
                              ...prev.judges.chiefJudge,
                              teacherId: tId,
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'প্রধান শিক্ষক ও সভাপতি'
                            }
                          }
                        }));
                      }
                    }}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="">— শিক্ষক ড্রপ-ডাউন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* JUDGE 1 */}
              <div style={{ background: '#faf5ff', border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#4338ca', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                    বিচারক ১ (একাডেমিক)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const t = prompt('বিচারক ১ এর নাম লিখুন:', panelData.judges.judge1.name);
                      if (t !== null && t.trim()) {
                        setPanelData(prev => ({
                          ...prev,
                          judges: {
                            ...prev.judges,
                            judge1: { ...prev.judges.judge1, name: t.trim() }
                          }
                        }));
                      }
                    }}
                    style={{ background: '#ffffff', border: '1px solid #4338ca', color: '#312e81', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✏️ এডিট
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', marginBottom: '8px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judges.judge1?.teacherId, panelData.judges.judge1?.name)}
                    alt={panelData.judges.judge1?.name || 'বিচারক ১'}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4338ca', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14.5px', color: '#1e1b4b', display: 'block' }}>
                      {panelData.judges.judge1.name}
                    </b>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                      {panelData.judges.judge1.designation}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#4338ca', fontWeight: 700, display: 'block' }}>
                      দায়িত্ব: {panelData.judges.judge1.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>শিক্ষক ড্রপ-ডাউন থেকে নির্বাচন:</label>
                  <select
                    value={panelData.judges.judge1?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setPanelData(prev => ({
                          ...prev,
                          judges: {
                            ...prev.judges,
                            judge1: {
                              ...prev.judges.judge1,
                              teacherId: tId,
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'সহকারী প্রধান শিক্ষক'
                            }
                          }
                        }));
                      }
                    }}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="">— শিক্ষক ড্রপ-ডাউন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* JUDGE 2 */}
              <div style={{ background: '#faf5ff', border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#312e81', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                    বিচারক ২ (যুক্তি ও ভাষা)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const t = prompt('বিচারক ২ এর নাম লিখুন:', panelData.judges.judge2.name);
                      if (t !== null && t.trim()) {
                        setPanelData(prev => ({
                          ...prev,
                          judges: {
                            ...prev.judges,
                            judge2: { ...prev.judges.judge2, name: t.trim() }
                          }
                        }));
                      }
                    }}
                    style={{ background: '#ffffff', border: '1px solid #312e81', color: '#312e81', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✏️ এডিট
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', marginBottom: '8px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judges.judge2?.teacherId, panelData.judges.judge2?.name)}
                    alt={panelData.judges.judge2?.name || 'বিচারক ২'}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #312e81', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14.5px', color: '#1e1b4b', display: 'block' }}>
                      {panelData.judges.judge2.name}
                    </b>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                      {panelData.judges.judge2.designation}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#312e81', fontWeight: 700, display: 'block' }}>
                      দায়িত্ব: {panelData.judges.judge2.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>শিক্ষক ড্রপ-ডাউন থেকে নির্বাচন:</label>
                  <select
                    value={panelData.judges.judge2?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setPanelData(prev => ({
                          ...prev,
                          judges: {
                            ...prev.judges,
                            judge2: {
                              ...prev.judges.judge2,
                              teacherId: tId,
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'সিনিয়র শিক্ষক'
                            }
                          }
                        }));
                      }
                    }}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="">— শিক্ষক ড্রপ-ডাউন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4: কার্যনির্বাহী পরিষদ */}
      {/* ========================================================================= */}
      {debTab === 'executive' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৪
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                👥 কার্যনির্বাহী পরিষদ (Executive Council)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ৭টি মূল পদাধিকারী এবং শাখা/বিভাগসহ সাধারণ কার্যনির্বাহী সদস্যবৃন্দ
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const postsArr = Object.entries(execData.posts).map(([k, p]) => ({ ...p, postKey: k }));
                const html = `
                  <div class="card-box">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">১. মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ)</h3>
                    <table>
                      <thead><tr><th>ক্র.</th><th>পদের নাম</th><th>শিক্ষার্থীর নাম</th><th>শ্রেণি</th><th> শাখা/বিভাগ</th><th>রোল</th><th>মোবাইল</th></tr></thead>
                      <tbody>
                        ${postsArr.map((p, i) => `
                          <tr>
                            <td style="text-align:center;">${toBn(i + 1)}</td>
                            <td><b style="color:#312e81;">${p.title}</b></td>
                            <td><b>${p.name}</b></td>
                            <td style="text-align:center;">${p.class}</td>
                            <td style="text-align:center;">${p.section || '—'}</td>
                            <td style="text-align:center;">${toBn(p.roll)}</td>
                            <td>${p.phone || '—'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>

                  <div class="card-box" style="margin-top:16px;">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">২. সাধারণ কার্যনির্বাহী সদস্যবৃন্দ</h3>
                    <table>
                      <thead><tr><th>ক্র.</th><th>শিক্ষার্থীর নাম</th><th>শ্রেণি</th><th>শাখা/বিভাগ</th><th>রোল নং</th><th>মোবাইল নম্বর</th><th>দায়িত্ব</th></tr></thead>
                      <tbody>
                        ${execData.members.map((m, i) => `
                          <tr>
                            <td style="text-align:center;">${toBn(i + 1)}</td>
                            <td><b>${m.name}</b></td>
                            <td style="text-align:center;">${m.class}</td>
                            <td style="text-align:center;">${m.section || '—'}</td>
                            <td style="text-align:center;">${toBn(m.roll)}</td>
                            <td>${m.phone || '—'}</td>
                            <td>কার্যনির্বাহী সদস্য</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `;
                printWithPad('ডিবেটিং ক্লাব কার্যনির্বাহী পরিষদ', '👥 কার্যনির্বাহী কমিটি', html);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #312e81',
                color: '#312e81',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
            </button>
          </div>

          {/* 7 CORE POSTS TABLE */}
          <div style={{ marginBottom: '22px' }}>
            <b style={{ color: '#312e81', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              📌 মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ):
            </b>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f5f3ff', color: '#1e1b4b', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>ক্র.</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>পদের নাম</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>শ্রেণি</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>শাখা/বিভাগ</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>রোল</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>মোবাইল</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '70px' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(execData.posts).map(([k, p], idx) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{toBn(idx + 1)}</td>
                      <td style={{ padding: '8px', fontWeight: 800, color: '#312e81' }}>{p.title}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{p.class}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#4338ca', fontWeight: 600 }}>{p.section || '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{toBn(p.roll)}</td>
                      <td style={{ padding: '8px', color: '#64748b', fontSize: '12px' }}>{p.phone || '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExecPost(k);
                            setExecPostEditForm({
                              postKey: k,
                              title: p.title,
                              name: p.name,
                              class: p.class,
                              section: p.section || 'বিজ্ঞান',
                              roll: p.roll,
                              phone: p.phone
                            });
                          }}
                          style={{
                            background: '#f3e8ff',
                            border: '1px solid #d8b4fe',
                            color: '#6b21a8',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          ✏️ এডিট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MULTIPLE EXECUTIVE MEMBERS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <b style={{ color: '#312e81', fontSize: '14px' }}>
                👥 কার্যনির্বাহী সদস্যবৃন্দ ({toBn(execData.members.length)} জন):
              </b>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {execData.members.map((mem) => (
                <div
                  key={mem.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <b style={{ color: '#1e1b4b', fontSize: '13px', display: 'block' }}>{mem.name}</b>
                    <span style={{ fontSize: '11.5px', color: '#475569' }}>
                      শ্রেণি: {mem.class} • শাখা: <b style={{ color: '#4338ca' }}>{mem.section || '—'}</b> • রোল: {toBn(mem.roll)}
                    </span>
                    {mem.phone && (
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>📞 {mem.phone}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExecMember(mem);
                        setExecMemEditForm(mem);
                      }}
                      style={{
                        background: '#f3e8ff',
                        border: '1px solid #d8b4fe',
                        color: '#6b21a8',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('আপনি কি এই কার্যনির্বাহী সদস্যকে মুছে ফেলতে চান?')) {
                          setExecData(prev => ({
                            ...prev,
                            members: prev.members.filter(m => m.id !== mem.id)
                          }));
                        }
                      }}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#991b1b',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD EXECUTIVE MEMBER FORM WITH CLASS & SECTION / BRANCH */}
            <div style={{ background: '#faf5ff', border: '1px dashed #a855f7', borderRadius: '8px', padding: '12px' }}>
              <b style={{ fontSize: '12.5px', color: '#6b21a8' }}>➕ নতুন কার্যনির্বাহী সদস্য যুক্ত করুন:</b>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newMemberForm.name.trim() || !newMemberForm.roll.trim()) return;
                  const newM = {
                    id: 'deb-mem-' + Date.now(),
                    ...newMemberForm
                  };
                  setExecData(prev => ({
                    ...prev,
                    members: [...prev.members, newM]
                  }));
                  setNewMemberForm({ name: '', class: '৮ম', section: 'শাখা ক', roll: '', phone: '' });
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr)) auto', gap: '8px', marginTop: '8px' }}
              >
                <input
                  placeholder="শিক্ষার্থীর নাম *"
                  required
                  value={newMemberForm.name}
                  onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
                <select
                  value={newMemberForm.class}
                  onChange={e => {
                    const c = e.target.value;
                    const defaultSec = (c === '৯ম' || c === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                    setNewMemberForm({ ...newMemberForm, class: c, section: defaultSec });
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
                <select
                  value={newMemberForm.section}
                  onChange={e => setNewMemberForm({ ...newMemberForm, section: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  {newMemberForm.class === '৯ম' || newMemberForm.class === '১০ম' ? (
                    <>
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                      <option value="মানবিক">মানবিক বিভাগ</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                    </>
                  ) : (
                    <>
                      <option value="শাখা ক">শাখা ক</option>
                      <option value="শাখা খ">শাখা খ</option>
                      <option value="শাখা গ">শাখা গ</option>
                    </>
                  )}
                </select>
                <input
                  placeholder="রোল নং *"
                  required
                  value={newMemberForm.roll}
                  onChange={e => setNewMemberForm({ ...newMemberForm, roll: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
                <input
                  placeholder="মোবাইল নং"
                  value={newMemberForm.phone}
                  onChange={e => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
                <button type="submit" style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  + সদস্য যুক্ত
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 5: নিয়মিত কার্যক্রম (১১টি কার্যক্রম) */}
      {/* ========================================================================= */}
      {debTab === 'activities' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৫
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                ⚡ ডিবেটিং ক্লাবের নিয়মিত কার্যক্রম (১১টি নিয়মিত কার্যক্রম)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                সাপ্তাহিক বিতর্ক, সংসদীয় ড্রিল, তাৎক্ষণিক বক্তৃতা ও ভাষা দক্ষতার নিয়মিত রুটিন
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box">
                      <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের ১১টি নিয়মিত কার্যক্রম তালিকা</h3>
                      <table>
                        <thead><tr><th>ক্র.</th><th>কার্যক্রমের নাম</th><th>মূল ফোকাস / লক্ষ্য</th><th>সময় ও ভেন্যু</th><th>বিবরণ</th></tr></thead>
                        <tbody>
                          ${activitiesList.map(a => `
                            <tr>
                              <td style="text-align:center; font-weight:700;">${a.num}</td>
                              <td><b>${a.title}</b></td>
                              <td><b style="color:#312e81;">${a.focus}</b></td>
                              <td>${a.time}<br><span style="font-size:11.5px; color:#64748b;">📍 ${a.venue}</span></td>
                              <td>${a.desc}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাবের নিয়মিত কার্যক্রম', '⚡ অ্যাক্টিভিটি শিডিউল', html);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #312e81',
                  color: '#312e81',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি কার্যক্রমগুলো ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
                    setActivitiesList(DEFAULT_DEBATE_ACTIVITIES);
                  }
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                🔄 ডিফল্ট
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {activitiesList.map((act) => (
              <div
                key={act.id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e0e7ff',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: '0 2px 6px rgba(49, 46, 129, 0.04)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ background: '#312e81', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                      কার্যক্রম {act.num}
                    </span>
                    <span style={{ background: '#e0e7ff', color: '#312e81', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                      {act.focus}
                    </span>
                  </div>
                  <h4 style={{ margin: '4px 0', fontSize: '15px', color: '#1e1b4b', fontWeight: 900 }}>
                    {act.title}
                  </h4>
                  <p style={{ margin: '4px 0 10px 0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    {act.desc}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginBottom: '10px' }}>
                    <div>⏰ <b>সময়:</b> {act.time}</div>
                    <div>📍 <b>ভেন্যু:</b> {act.venue}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingActivity(act);
                        setActEditForm(act);
                      }}
                      style={{
                        background: '#f3e8ff',
                        border: '1px solid #d8b4fe',
                        color: '#6b21a8',
                        padding: '3px 10px',
                        borderRadius: '5px',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ✏️ এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('আপনি কি এই কার্যক্রমটি মুছে ফেলতে চান?')) {
                          setActivitiesList(prev => prev.filter(a => a.id !== act.id));
                        }
                      }}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD ACTIVITY FORM */}
          <div style={{ background: '#f8fafc', border: '1px dashed #c7d2fe', borderRadius: '8px', padding: '14px' }}>
            <b style={{ fontSize: '13px', color: '#312e81' }}>➕ নতুন নিয়মিত কার্যক্রম যুক্ত করুন:</b>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const title = form.actTitle.value.trim();
                const focus = form.actFocus.value.trim();
                const desc = form.actDesc.value.trim();
                const time = form.actTime.value.trim();
                const venue = form.actVenue.value.trim();
                if (!title || !desc) return;
                const newA = {
                  id: 'act-deb-' + Date.now(),
                  num: toBn(activitiesList.length + 1),
                  title,
                  focus: focus || 'বিতর্ক অনুশীলন',
                  desc,
                  time: time || 'প্রতি সপ্তাহে নির্ধারিত সময়ে',
                  venue: venue || 'ডিবেট ক্লাব কর্নার'
                };
                setActivitiesList(prev => [...prev, newA]);
                form.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '10px' }}
            >
              <input name="actTitle" required placeholder="কার্যক্রমের নাম *" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="actFocus" placeholder="ফোকাস (যেমন: উপস্থিত বক্তৃতা)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="actTime" placeholder="সময় (যেমন: প্রতি শনিবার বিকাল ৩টা)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="actVenue" placeholder="ভেন্যু (যেমন: সেমিনার হল)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="actDesc" required placeholder="সংক্ষিপ্ত বিবরণ *" style={{ gridColumn: '1 / -1', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <button type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', background: '#312e81', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                + কার্যক্রম যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 6: বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার */}
      {/* ========================================================================= */}
      {debTab === 'calendar' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৬
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                📅 বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ত্রৈমাসিক রোডম্যাপ (Quarterly Roadmap) ও ১২ মাসের ধারাবাহিক বিতর্ক ক্যালেন্ডার
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const html = `
                  <div class="card-box">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">১. ত্রৈমাসিক কর্মপরিকল্পনা রোডম্যাপ (Quarterly Roadmap)</h3>
                    <table>
                      <thead><tr><th style="width:130px;">ত্রৈমাসিক পর্ব</th><th>কর্মপরিকল্পনার মূল বিষয়বস্তু</th><th>বিস্তারিত কার্যক্রম</th></tr></thead>
                      <tbody>
                        ${quarterlyPlans.map(q => `
                          <tr>
                            <td><b>${q.quarter}</b></td>
                            <td><b style="color:#312e81;">${q.title}</b></td>
                            <td style="white-space:pre-wrap; font-size:12px;">${q.desc}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>

                  <div class="card-box" style="margin-top:16px;">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">২. ১২ মাসের ধারাবাহিক বিতর্ক ক্যালেন্ডার (২০২৬)</h3>
                    <table>
                      <thead><tr><th>মাস</th><th>কার্যক্রমের শিরোনাম</th><th>নির্ধারিত তারিখ</th><th>সমন্বয়ক শিক্ষক</th></tr></thead>
                      <tbody>
                        ${monthlyCalendar.map(m => `
                          <tr>
                            <td><b>${m.month}</b></td>
                            <td>${m.title}</td>
                            <td>${m.date}</td>
                            <td>${m.coordinator}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `;
                printWithPad('ডিবেটিং ক্লাবের বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার', '📅 বার্ষিক পরিকল্পনা', html);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #312e81',
                color: '#312e81',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
            </button>
          </div>

          {/* 4 QUARTERS ROADMAP */}
          <div style={{ marginBottom: '24px' }}>
            <b style={{ color: '#312e81', fontSize: '14.5px', display: 'block', marginBottom: '10px' }}>
              🎯 ত্রৈমাসিক কর্মপরিকল্পনা রোডম্যাপ (Quarterly Roadmap):
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {quarterlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    background: '#fdf4ff',
                    border: '1.5px solid #e9d5ff',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ background: plan.color || '#312e81', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {plan.quarter}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuarter(plan);
                          setQuarterEditForm(plan);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #d8b4fe',
                          color: '#6b21a8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        ✏️ এডিট
                      </button>
                    </div>
                    <b style={{ fontSize: '13px', color: '#1e1b4b', display: 'block', marginBottom: '8px' }}>
                      {plan.title}
                    </b>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {plan.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 12 MONTHS CALENDAR */}
          <div>
            <b style={{ color: '#312e81', fontSize: '14.5px', display: 'block', marginBottom: '10px' }}>
              🗓️ ১২ মাসের ধারাবাহিক বিতর্ক ক্যালেন্ডার (২০২৬):
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
              {monthlyCalendar.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: '#e0e7ff', color: '#312e81', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {m.month}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>📅 {m.date}</span>
                    </div>
                    <b style={{ fontSize: '12.5px', color: '#1e1b4b', display: 'block', marginTop: '3px' }}>
                      {m.title}
                    </b>
                    <span style={{ fontSize: '11px', color: '#4338ca', display: 'block' }}>
                      👤 সমন্বয়ক: {m.coordinator}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMonth(m);
                        setMonthEditForm(m);
                      }}
                      style={{
                        background: '#f3e8ff',
                        border: '1px solid #d8b4fe',
                        color: '#6b21a8',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('আপনি কি এই মাসের ইভেন্টটি মুছে ফেলতে চান?')) {
                          setMonthlyCalendar(prev => prev.filter(item => item.id !== m.id));
                        }
                      }}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#991b1b',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 7: সদস্য নির্বাচনের নিয়ম (৭টি সুনির্দিষ্ট মানদণ্ড) */}
      {/* ========================================================================= */}
      {debTab === 'selection_rules' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৭
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                📜 সদস্য নির্বাচনের নিয়ম (৭টি সুনির্দিষ্ট মানদণ্ড)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ডিবেটিং ক্লাবের সদস্যপদ প্রাপ্তি ও দল গঠনের বাধ্যতামূলক নীতিমালা
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box">
                      <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের সদস্য নির্বাচনের ৭টি সুনির্দিষ্ট নিয়ম</h3>
                      <table>
                        <thead><tr><th style="width:45px;">ক্র.</th><th>মানদণ্ডের নাম</th><th>সুনির্দিষ্ট নিয়মাবলী</th></tr></thead>
                        <tbody>
                          ${selectionRules.map(r => `
                            <tr>
                              <td style="text-align:center; font-weight:700;">${r.num}</td>
                              <td><b>${r.title}</b></td>
                              <td>${r.text}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাবের সদস্য নির্বাচনের নিয়মাবলী', '📜 সদস্য নির্বাচনের নিয়ম', html);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #312e81',
                  color: '#312e81',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি সদস্য নির্বাচনের নিয়মাবলী ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?')) {
                    setSelectionRules(DEFAULT_DEBATE_SELECTION_RULES);
                  }
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                🔄 ডিফল্ট
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {selectionRules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                style={{
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    background: '#312e81',
                    color: '#ffffff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {rule.num || toBn(idx + 1)}
                  </span>
                  <div>
                    <b style={{ color: '#1e1b4b', fontSize: '13.5px', display: 'block' }}>
                      {rule.title || 'মানদণ্ড ' + toBn(idx + 1)}
                    </b>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                      {rule.text}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSelectionRule(rule);
                      setSelRuleEditForm(rule);
                    }}
                    style={{
                      background: '#f3e8ff',
                      border: '1px solid #d8b4fe',
                      color: '#6b21a8',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    ✏️ এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি এই নিয়মটি মুছে ফেলতে চান?')) {
                        setSelectionRules(prev => prev.filter(r => r.id !== rule.id));
                      }
                    }}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD RULE FORM */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px' }}>
            <b style={{ fontSize: '13px', color: '#312e81' }}>➕ নতুন সদস্য নির্বাচনের নিয়ম যুক্ত করুন:</b>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const title = form.rTitle.value.trim();
                const text = form.rText.value.trim();
                if (!text) return;
                const newR = {
                  id: 'sr-' + Date.now(),
                  num: toBn(selectionRules.length + 1),
                  title: title || 'নতুন নিয়ম ' + toBn(selectionRules.length + 1),
                  text: text
                };
                setSelectionRules(prev => [...prev, newR]);
                form.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: '10px', marginTop: '8px' }}
            >
              <input name="rTitle" placeholder="নিয়মের শিরোনাম (ঐচ্ছিক)" style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              <input name="rText" required placeholder="নিয়মের বিস্তারিত বিবরণ লিখুন..." style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              <button type="submit" style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                + নিয়ম যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 8: আবেদন গ্রহণ ও সদস্য নির্বাচন */}
      {/* ========================================================================= */}
      {debTab === 'membership' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৮
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                📝 আবেদন গ্রহণ ও সদস্য নির্বাচন (Membership Application & Directory)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                অনলাইন আবেদন ফর্ম, অটো ট্র্যাকিং আইডি ও রেজিস্টার্ড সদস্যদের পূর্ণাঙ্গ তালিকা
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const html = `
                  <div class="card-box">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের রেজিস্টার্ড সদস্যদের প্রাতিষ্ঠানিক তালিকা</h3>
                    <table>
                      <thead>
                        <tr><th>ক্র.</th><th>ট্র্যাকিং আইডি</th><th>শিক্ষার্থীর নাম</th><th>শ্রেণি</th><th>শাখা/বিভাগ</th><th>রোল</th><th>মোবাইল</th><th>আগ্রহের ক্ষেত্র</th><th>স্ট্যাটাস</th></tr>
                      </thead>
                      <tbody>
                        ${membersList.map((m, i) => `
                          <tr>
                            <td style="text-align:center;">${toBn(i + 1)}</td>
                            <td><b style="font-family:monospace; color:#312e81;">${m.tracking_id}</b></td>
                            <td><b>${m.student_name}</b></td>
                            <td style="text-align:center;">${m.class_name}</td>
                            <td style="text-align:center;">${m.section || '—'}</td>
                            <td style="text-align:center;">${toBn(m.roll_no)}</td>
                            <td>${m.mobile || '—'}</td>
                            <td>${m.interest || '—'}</td>
                            <td style="text-align:center; font-weight:700; color:${m.status === 'approved' ? '#047857' : '#d97706'};">${m.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমাণ'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `;
                printWithPad('ডিবেটিং ক্লাব নিবন্ধিত সদস্য তালিকা', '📝 সদস্য তালিকা', html);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #312e81',
                color: '#312e81',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
            </button>
          </div>

          {/* APPLICATION FORM CARD */}
          <div style={{ background: '#faf5ff', border: '1.5px solid #d8b4fe', borderRadius: '10px', padding: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <b style={{ color: '#6b21a8', fontSize: '15px' }}>📋 নতুন সদস্যপদের অনলাইন আবেদন ফর্ম</b>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>৬ষ্ঠ থেকে ১০ম শ্রেণির সকল শাখা ও বিভাগের শিক্ষার্থীরা আবেদন করতে পারবে</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemoApp}
                style={{ background: '#ffffff', border: '1px solid #c084fc', color: '#6b21a8', padding: '4px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                🪄 ডেমো তথ্য পূরণ
              </button>
            </div>

            <form onSubmit={handleApplyMembership} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শিক্ষার্থীর নাম *</label>
                <input
                  required
                  placeholder="যেমন: আবরার হাবিব"
                  value={newApp.student_name}
                  onChange={e => setNewApp({ ...newApp, student_name: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শ্রেণি *</label>
                <select
                  value={newApp.class_name}
                  onChange={e => {
                    const c = e.target.value;
                    const defaultSec = (c === '৯ম' || c === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                    setNewApp({ ...newApp, class_name: c, section: defaultSec });
                  }}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শাখা / বিভাগ *</label>
                <select
                  value={newApp.section}
                  onChange={e => setNewApp({ ...newApp, section: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                >
                  {newApp.class_name === '৯ম' || newApp.class_name === '১০ম' ? (
                    <>
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                      <option value="মানবিক">মানবিক বিভাগ</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                    </>
                  ) : (
                    <>
                      <option value="শাখা ক">শাখা ক</option>
                      <option value="শাখা খ">শাখা খ</option>
                      <option value="শাখা গ">শাখা গ</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>রোল নম্বর *</label>
                <input
                  required
                  placeholder="যেমন: ২"
                  value={newApp.roll_no}
                  onChange={e => setNewApp({ ...newApp, roll_no: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>মোবাইল নম্বর *</label>
                <input
                  required
                  placeholder="যেমন: 01711-335577"
                  value={newApp.mobile}
                  onChange={e => setNewApp({ ...newApp, mobile: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিতর্কে আগ্রহের ক্ষেত্র *</label>
                <select
                  value={newApp.interest}
                  onChange={e => setNewApp({ ...newApp, interest: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                >
                  <option value="সংসদীয় বিতর্ক ও নেতৃত্ব">সংসদীয় বিতর্ক ও নেতৃত্ব</option>
                  <option value="বাংলা সনাতনী বিতর্ক">বাংলা সনাতনী বিতর্ক</option>
                  <option value="ইংরেজি বিতর্ক ও উচ্চারণ">ইংরেজি বিতর্ক ও উচ্চারণ</option>
                  <option value="উপস্থিত বক্তৃতা ও সঞ্চালনা">উপস্থিত বক্তৃতা ও সঞ্চালনা</option>
                  <option value="যুক্তি ও পাল্টা যুক্তি খণ্ডন">যুক্তি ও পাল্টা যুক্তি খণ্ডন</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিগত বিতর্ক অভিজ্ঞতা (যদি থাকে)</label>
                <input
                  placeholder="যেমন: পূর্ববর্তী ক্লাসে বা বিদ্যালয়ে বিতর্কে অংশগ্রহণের তথ্য..."
                  value={newApp.experience}
                  onChange={e => setNewApp({ ...newApp, experience: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>কেন ডিবেটিং ক্লাবে যুক্ত হতে চাও? (সংক্ষিপ্ত বক্তব্য)</label>
                <textarea
                  rows="2"
                  placeholder="তোমার মতামত ও প্রত্যাশা লিখুন..."
                  value={newApp.reason}
                  onChange={e => setNewApp({ ...newApp, reason: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="submit" style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '9px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  🚀 আবেদনপত্র জমা দিন ➔
                </button>
              </div>
            </form>
          </div>

          {/* APPLICATION SUCCESS RECEIPT POPUP */}
          {appReceipt && (
            <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <b style={{ color: '#047857', fontSize: '14.5px' }}>
                  ✓ সদস্যপদের আবেদন সফলভাবে গৃহীত হয়েছে!
                </b>
                <button
                  type="button"
                  onClick={() => setAppReceipt(null)}
                  style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#047857' }}
                >
                  ✕
                </button>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#065f46' }}>
                অফিসিয়াল ট্র্যাকিং আইডি: <b style={{ fontFamily: 'monospace', fontSize: '15px', color: '#047857' }}>{appReceipt.tracking_id}</b> • শিক্ষার্থী: <b>{appReceipt.student_name}</b> ({appReceipt.class_name} শ্রেণি, শাখা: {appReceipt.section || '—'}, রোল: {toBn(appReceipt.roll_no)})
              </p>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box" style="border:2px solid #059669; background:#f0fdf4;">
                      <h3 style="margin:0 0 6px 0; color:#065f46;">ডিবেটিং ক্লাব সদস্যপদ প্রাপ্তিস্বীকার রসিদ</h3>
                      <div style="font-size:12px; color:#475569; margin-bottom:12px;">ট্র্যাকিং আইডি: <b>${appReceipt.tracking_id}</b> • আবেদনের তারিখ: ${appReceipt.date}</div>
                      <table>
                        <tbody>
                          <tr><td style="font-weight:700; width:30%;">শিক্ষার্থীর নাম</td><td><b>${appReceipt.student_name}</b></td></tr>
                          <tr><td style="font-weight:700;">শ্রেণি ও শাখা/বিভাগ</td><td>${appReceipt.class_name} শ্রেণি (${appReceipt.section || '—'})</td></tr>
                          <tr><td style="font-weight:700;">রোল নং</td><td>${toBn(appReceipt.roll_no)}</td></tr>
                          <tr><td style="font-weight:700;">মোবাইল নম্বর</td><td>${appReceipt.mobile}</td></tr>
                          <tr><td style="font-weight:700;">আগ্রহের ক্ষেত্র</td><td><b>${appReceipt.interest}</b></td></tr>
                          <tr><td style="font-weight:700;">আবেদনের স্ট্যাটাস</td><td><b style="color:#d97706;">প্রাথমিক যাচাইয়ে অপেক্ষমাণ</b></td></tr>
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাব সদস্যপদ রসিদ', '📜 প্রাপ্তিস্বীকার পত্র', html);
                }}
                style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '5px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                🖨️ আবেদন প্রাপ্তিস্বীকার রসিদ প্রিন্ট করুন
              </button>
            </div>
          )}

          {/* REGISTERED MEMBERS DIRECTORY TABLE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <b style={{ color: '#312e81', fontSize: '15px' }}>
                📋 রেজিস্টার্ড সদস্য তালিকা ডিরেক্টরি ({toBn(membersList.length)} জন):
              </b>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  placeholder="নাম/রোল দিয়ে খুঁজুন..."
                  value={memSearch}
                  onChange={e => setMemSearch(e.target.value)}
                  style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: '150px' }}
                />
                <select
                  value={memFilterClass}
                  onChange={e => setMemFilterClass(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="সব">সকল শ্রেণি</option>
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
                <select
                  value={memFilterStatus}
                  onChange={e => setMemFilterStatus(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="সব">সকল স্ট্যাটাস</option>
                  <option value="approved">অনুমোদিত</option>
                  <option value="pending">অপেক্ষমাণ</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f5f3ff', color: '#1e1b4b', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'center', width: '35px' }}>ক্র.</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ট্র্যাকিং আইডি</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>শ্রেণি</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>শাখা/বিভাগ</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>রোল</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>মোবাইল</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>বিতর্কের আগ্রহ</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>স্ট্যাটাস</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '110px' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {membersList
                    .filter(m => {
                      if (memFilterClass !== 'সব' && m.class_name !== memFilterClass) return false;
                      if (memFilterStatus !== 'সব' && m.status !== memFilterStatus) return false;
                      if (memSearch) {
                        const q = memSearch.toLowerCase();
                        return (m.student_name && m.student_name.toLowerCase().includes(q)) ||
                               (m.roll_no && String(m.roll_no).includes(q)) ||
                               (m.tracking_id && m.tracking_id.toLowerCase().includes(q));
                      }
                      return true;
                    })
                    .map((mem, idx) => (
                      <tr key={mem.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '7px', textAlign: 'center', fontWeight: 700 }}>{toBn(idx + 1)}</td>
                        <td style={{ padding: '7px', fontFamily: 'monospace', fontWeight: 700, color: '#312e81' }}>{mem.tracking_id}</td>
                        <td style={{ padding: '7px', fontWeight: 800, color: '#0f172a' }}>{mem.student_name}</td>
                        <td style={{ padding: '7px', textAlign: 'center' }}>{mem.class_name}</td>
                        <td style={{ padding: '7px', textAlign: 'center', color: '#4338ca', fontWeight: 600 }}>{mem.section || '—'}</td>
                        <td style={{ padding: '7px', textAlign: 'center', fontWeight: 700 }}>{toBn(mem.roll_no)}</td>
                        <td style={{ padding: '7px', color: '#64748b' }}>{mem.mobile || '—'}</td>
                        <td style={{ padding: '7px', fontSize: '11.5px', color: '#334155' }}>{mem.interest || '—'}</td>
                        <td style={{ padding: '7px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = mem.status === 'approved' ? 'pending' : 'approved';
                              setMembersList(prev => prev.map(m => m.id === mem.id ? { ...m, status: nextStatus } : m));
                            }}
                            style={{
                              background: mem.status === 'approved' ? '#dcfce7' : '#fef3c7',
                              color: mem.status === 'approved' ? '#166534' : '#92400e',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {mem.status === 'approved' ? '✓ অনুমোদিত' : '⏳ অপেক্ষমাণ'}
                          </button>
                        </td>
                        <td style={{ padding: '7px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember(mem);
                              setMemberEditForm(mem);
                            }}
                            style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', color: '#6b21a8', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', marginRight: '4px' }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('আপনি কি এই সদস্যকে তালিকা থেকে মুছে ফেলতে চান?')) {
                                setMembersList(prev => prev.filter(m => m.id !== mem.id));
                              }
                            }}
                            style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
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
      {/* FEATURE 9: শৃঙ্খলা ও নিরাপত্তাবিধি (৯টি বাধ্যতামূলক নিয়ম) */}
      {/* ========================================================================= */}
      {debTab === 'discipline_safety' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৯
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                🛡️ শৃঙ্খলা ও আচরণবিধি (৯টি বাধ্যতামূলক নিয়ম)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ডিবেটিং ক্লাবের বিতার্কিকদের আদর্শ বাচনিক নৈতিকতা ও সম্মানজনক বিতর্ক নীতিমালা
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box">
                      <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের ৯টি বাধ্যতামূলক শৃঙ্খলা ও আচরণবিধি</h3>
                      <table>
                        <thead><tr><th style="width:45px;">ক্র.</th><th>বিধিমালার নাম</th><th>বাধ্যতামূলক আচরণবিধি</th></tr></thead>
                        <tbody>
                          ${disciplineRules.map(r => `
                            <tr>
                              <td style="text-align:center; font-weight:700;">${r.num}</td>
                              <td><b>${r.rule}</b></td>
                              <td>${r.desc}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাবের শৃঙ্খলা ও আচরণবিধি', '🛡️ আচরণবিধি ও শৃঙ্খলা', html);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #312e81',
                  color: '#312e81',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি শৃঙ্খলা ও আচরণবিধি ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
                    setDisciplineRules(DEFAULT_DEBATE_DISCIPLINE_RULES);
                  }
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                🔄 ডিফল্ট
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {disciplineRules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                style={{
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    background: '#4338ca',
                    color: '#ffffff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {rule.num || toBn(idx + 1)}
                  </span>
                  <div>
                    <b style={{ color: '#1e1b4b', fontSize: '13.5px', display: 'block' }}>
                      {rule.rule}
                    </b>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                      {rule.desc}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDisciplineRule(rule);
                      setDiscRuleEditForm(rule);
                    }}
                    style={{
                      background: '#f3e8ff',
                      border: '1px solid #d8b4fe',
                      color: '#6b21a8',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    ✏️ এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('আপনি কি এই নিয়মটি মুছে ফেলতে চান?')) {
                        setDisciplineRules(prev => prev.filter(r => r.id !== rule.id));
                      }
                    }}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DEBATER'S ETHICAL PLEDGE */}
          <div style={{ background: '#f5f3ff', border: '1.5px solid #818cf8', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#312e81', fontSize: '14.5px', fontWeight: 900 }}>
              📜 বিতার্কিকের নৈতিক অঙ্গীকার ও শপথ (Debater's Pledge):
            </h4>
            <blockquote style={{ margin: 0, fontStyle: 'italic', fontSize: '13px', color: '#3730a3', lineHeight: 1.6 }}>
              “আমি শপথ করছি যে, ডিবেটিং ক্লাবের একজন দায়িত্বশীল সদস্য হিসেবে আমি সর্বদা সত্য ও ন্যায়ের পক্ষে যুক্তি উপস্থাপন করব। ব্যক্তিগত আক্রমণ বা বিভ্রান্তিকর তথ্য পরিহার করব। প্রতিপক্ষের যুক্তি মনোযোগ দিয়ে শুনব এবং ভিন্নমতের প্রতি পরম শ্রদ্ধা বজায় রেখে সৌহার্দ্যপূর্ণ বিতর্ক পরিবেশ রক্ষা করব।”
            </blockquote>
          </div>

          {/* ADD DISCIPLINE RULE FORM */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px' }}>
            <b style={{ fontSize: '13px', color: '#312e81' }}>➕ নতুন শৃঙ্খলা ও নিরাপত্তাবিধি যুক্ত করুন:</b>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const rName = form.rName.value.trim();
                const rDesc = form.rDesc.value.trim();
                if (!rDesc) return;
                const newR = {
                  id: 'dr-' + Date.now(),
                  num: toBn(disciplineRules.length + 1),
                  rule: rName || 'নতুন আচরণবিধি ' + toBn(disciplineRules.length + 1),
                  desc: rDesc
                };
                setDisciplineRules(prev => [...prev, newR]);
                form.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: '10px', marginTop: '8px' }}
            >
              <input name="rName" placeholder="বিধির নাম (ঐচ্ছিক)" style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              <input name="rDesc" required placeholder="বাধ্যতামূলক বিধির বিস্তারিত বিবরণ..." style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
              <button type="submit" style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                + বিধি যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 10: বিতর্ক প্রতিযোগিতা ও ফলাফল */}
      {/* ========================================================================= */}
      {debTab === 'competitions' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১০
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                🏆 বিতর্ক প্রতিযোগিতা ও ফলাফল (লাইভ স্কোরশিট ইঞ্জিন)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ৬টি মানদণ্ডে ১০০ নম্বরের অফিশিয়াল স্কোরিং, মডারেটর ও বিচারকমণ্ডলী প্যানেল এবং স্বয়ংক্রিয় ফলাফল প্রস্তুতকরণ
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleOpenOrganizeModal}
                style={{
                  background: '#312e81',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(49, 46, 129, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ➕ নতুন বিতর্ক আয়োজন করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box">
                      <h3 style="margin:0 0 10px 0; color:#312e81;">বিতর্ক প্রতিযোগিতা ও ফলাফল বিবরণী (২০২৬)</h3>
                      <table>
                        <thead>
                          <tr><th>তারিখ</th><th>বিতর্কের বিষয় / প্রস্তাবনা</th><th>ফরম্যাট</th><th>বিজয়ী দল</th><th>শ্রেষ্ঠ বক্তা</th><th>ফলাফল স্কোর</th></tr>
                        </thead>
                        <tbody>
                          ${competitionsList.map(c => `
                            <tr>
                              <td>${c.date}</td>
                              <td><b>${c.title}</b><br><span style="font-size:12px; color:#475569;">"${c.motion}"</span></td>
                              <td>${c.format}</td>
                              <td><b style="color:#047857;">${c.winner}</b></td>
                              <td><b style="color:#312e81;">${c.bestSpeaker}</b></td>
                              <td><b>${toBn(c.propScore)}</b> বনাম <b>${toBn(c.oppScore)}</b></td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাব বিতর্ক ফলাফল বিবরণী', '🏆 ফলাফল ও স্কোরশিট', html);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #312e81',
                  color: '#312e81',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
              </button>
            </div>
          </div>

          {/* OFFICIAL MARKING RUBRIC HIGHLIGHT BANNER */}
          <div style={{ background: '#faf5ff', border: '1.5px solid #c084fc', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            <b style={{ color: '#6b21a8', fontSize: '13.5px', display: 'block', marginBottom: '6px' }}>
              ⚖️ অফিশিয়াল বিতর্ক মূল্যায়ন ও মানবন্টন (মোট ১০০ নম্বর প্রতি বক্তা):
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '6px 10px' }}>
                🧠 <b>যুক্তি ও বিশ্লেষণ:</b> <span style={{ color: '#6b21a8', fontWeight: 900 }}>৩০ নম্বর</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '6px 10px' }}>
                📊 <b>তথ্য ও প্রমাণ:</b> <span style={{ color: '#6b21a8', fontWeight: 900 }}>২০ নম্বর</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '6px 10px' }}>
                🎙️ <b>বক্তব্য উপস্থাপন:</b> <span style={{ color: '#6b21a8', fontWeight: 900 }}>২০ নম্বর</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '6px 10px' }}>
                ⚡ <b>পাল্টা যুক্তি:</b> <span style={{ color: '#6b21a8', fontWeight: 900 }}>১৫ নম্বর</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '6px 10px' }}>
                🌺 <b>ভাষা ও শালীনতা:</b> <span style={{ color: '#6b21a8', fontWeight: 900 }}>১০ নম্বর</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '6px 10px' }}>
                ⏱️ <b>সময় ব্যবস্থাপনা:</b> <span style={{ color: '#6b21a8', fontWeight: 900 }}>৫ নম্বর</span>
              </div>
            </div>
          </div>

          {/* LIVE COMPETITION SCORING ENGINE CARD */}
          <div id="live-debate-engine-card" style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1e1b4b', fontWeight: 900 }}>
                  🎙️ চলমান বিতর্ক প্রতিযোগিতা ও স্কোরশিট:
                </h4>
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  বিতর্ক পরিচালনা, মডারেটর ও ৩ বিচারকের প্যানেল এবং ৬টি সুনির্দিষ্ট মানদণ্ডে ১০০ নম্বরের মূল্যায়ন
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenOrganizeModal}
                style={{
                  background: '#f59e0b',
                  color: '#1e1b4b',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                }}
              >
                ➕ নতুন বিতর্ক আয়োজন করুন
              </button>
            </div>

            <form onSubmit={handleSaveDebateResult}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিতর্কের শিরোনাম / ইভেন্ট *</label>
                  <input
                    required
                    value={newScorecard.title}
                    onChange={e => setNewScorecard({ ...newScorecard, title: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিতর্কের ধরন *</label>
                  <select
                    value={newScorecard.format}
                    onChange={e => setNewScorecard({ ...newScorecard, format: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    <option value="সংসদীয় বিতর্ক">সংসদীয় বিতর্ক (Parliamentary)</option>
                    <option value="সনাতনী বিতর্ক">সনাতনী বিতর্ক (Traditional)</option>
                    <option value="বারোয়ারি বিতর্ক">বারোয়ারি বিতর্ক (Open Theme)</option>
                    <option value="উপস্থিত বক্তৃতা">উপস্থিত বক্তৃতা (Extempore)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>তারিখ</label>
                  <input
                    value={newScorecard.date}
                    onChange={e => setNewScorecard({ ...newScorecard, date: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>ভেন্যু</label>
                  <input
                    value={newScorecard.venue}
                    onChange={e => setNewScorecard({ ...newScorecard, venue: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিতর্কের প্রস্তাবনা (Motion) *</label>
                  <input
                    required
                    value={newScorecard.motion}
                    onChange={e => setNewScorecard({ ...newScorecard, motion: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* MODERATOR & JUDGES PANEL DISPLAY & IN-PLACE SWITCH */}
              <div style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
                border: '1.5px solid #c7d2fe',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>⚖️</span>
                    <b style={{ color: '#312e81', fontSize: '13px' }}>
                      বিতর্ক ম্যাচ দায়িত্বপ্রাপ্ত মডারেটর ও বিচারকমণ্ডলী:
                    </b>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingDebateJudges({
                      target: 'current',
                      title: newScorecard.title,
                      moderator: newScorecard.moderator ? { ...newScorecard.moderator } : { name: '', designation: '', teacherId: '' },
                      chiefJudge: newScorecard.chiefJudge ? { ...newScorecard.chiefJudge } : { name: '', designation: '', teacherId: '' },
                      judge1: newScorecard.judge1 ? { ...newScorecard.judge1 } : { name: '', designation: '', teacherId: '' },
                      judge2: newScorecard.judge2 ? { ...newScorecard.judge2 } : { name: '', designation: '', teacherId: '' }
                    })}
                    style={{
                      background: '#4338ca',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '5px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 5px rgba(67, 56, 202, 0.25)'
                    }}
                  >
                    🔄 মডারেটর ও বিচারকমণ্ডলী চেঞ্জ করুন
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getResolvedTeacherPhoto(newScorecard.moderator?.teacherId, newScorecard.moderator?.name)}
                      alt={newScorecard.moderator?.name || 'মডারেটর'}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4338ca', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#4338ca', display: 'block' }}>🎙️ মডারেটর / স্পিকার</span>
                      <b style={{ fontSize: '12.5px', color: '#1e1b4b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newScorecard.moderator?.name || 'অনির্ধারিত'}</b>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{newScorecard.moderator?.designation || 'সঞ্চালক'}</small>
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getResolvedTeacherPhoto(newScorecard.chiefJudge?.teacherId, newScorecard.chiefJudge?.name)}
                      alt={newScorecard.chiefJudge?.name || 'প্রধান বিচারক'}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #7c3aed', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#7c3aed', display: 'block' }}>⚖️ প্রধান বিচারক</span>
                      <b style={{ fontSize: '12.5px', color: '#1e1b4b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newScorecard.chiefJudge?.name || 'অনির্ধারিত'}</b>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{newScorecard.chiefJudge?.designation || 'প্রধান বিচারক'}</small>
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getResolvedTeacherPhoto(newScorecard.judge1?.teacherId, newScorecard.judge1?.name)}
                      alt={newScorecard.judge1?.name || 'বিচারক - ১'}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#2563eb', display: 'block' }}>⚖️ বিচারক - ১</span>
                      <b style={{ fontSize: '12.5px', color: '#1e1b4b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newScorecard.judge1?.name || 'অনির্ধারিত'}</b>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{newScorecard.judge1?.designation || 'বিচারক'}</small>
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getResolvedTeacherPhoto(newScorecard.judge2?.teacherId, newScorecard.judge2?.name)}
                      alt={newScorecard.judge2?.name || 'বিচারক - ২'}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0891b2', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0891b2', display: 'block' }}>⚖️ বিচারক - ২</span>
                      <b style={{ fontSize: '12.5px', color: '#1e1b4b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newScorecard.judge2?.name || 'অনির্ধারিত'}</b>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{newScorecard.judge2?.designation || 'বিচারক'}</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* TWO TEAMS SCORE SHEETS: PROPOSITION VS OPPOSITION */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* PROPOSITION TEAM */}
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <b style={{ color: '#166534', fontSize: '13.5px' }}>🟢 সরকারি / পক্ষ দল</b>
                    <input
                      value={newScorecard.propTeamName}
                      onChange={e => setNewScorecard({ ...newScorecard, propTeamName: e.target.value })}
                      placeholder="দলের নাম"
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #86efac', fontSize: '12px', fontWeight: 700 }}
                    />
                  </div>

                  {newScorecard.propSpeakers.map((spk, sIdx) => (
                    <div key={sIdx} style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534' }}>{spk.role}</span>
                        <input
                          value={spk.name}
                          onChange={e => {
                            const updated = [...newScorecard.propSpeakers];
                            updated[sIdx].name = e.target.value;
                            setNewScorecard({ ...newScorecard, propSpeakers: updated });
                          }}
                          placeholder="বক্তার নাম"
                          style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px', width: '130px' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#047857' }}>
                          মোট: {toBn(calcSpeakerTotal(spk))}/১০০
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', fontSize: '10.5px', textAlign: 'center' }}>
                        <div>
                          <span>যুক্তি (৩০)</span>
                          <input
                            type="number" min="0" max="30"
                            value={spk.logic}
                            onChange={e => {
                              const updated = [...newScorecard.propSpeakers];
                              updated[sIdx].logic = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, propSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>তথ্য (২০)</span>
                          <input
                            type="number" min="0" max="20"
                            value={spk.facts}
                            onChange={e => {
                              const updated = [...newScorecard.propSpeakers];
                              updated[sIdx].facts = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, propSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>বক্তব্য (২০)</span>
                          <input
                            type="number" min="0" max="20"
                            value={spk.delivery}
                            onChange={e => {
                              const updated = [...newScorecard.propSpeakers];
                              updated[sIdx].delivery = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, propSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>পাল্টা (১৫)</span>
                          <input
                            type="number" min="0" max="15"
                            value={spk.rebuttal}
                            onChange={e => {
                              const updated = [...newScorecard.propSpeakers];
                              updated[sIdx].rebuttal = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, propSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>ভাষা (১০)</span>
                          <input
                            type="number" min="0" max="10"
                            value={spk.ethics}
                            onChange={e => {
                              const updated = [...newScorecard.propSpeakers];
                              updated[sIdx].ethics = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, propSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>সময় (৫)</span>
                          <input
                            type="number" min="0" max="5"
                            value={spk.time}
                            onChange={e => {
                              const updated = [...newScorecard.propSpeakers];
                              updated[sIdx].time = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, propSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ textAlign: 'right', fontWeight: 900, color: '#166534', fontSize: '13px', paddingTop: '4px' }}>
                    দলগত মোট স্কোর: {toBn(calcTeamTotal(newScorecard.propSpeakers))} / ৩০০
                  </div>
                </div>

                {/* OPPOSITION TEAM */}
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <b style={{ color: '#991b1b', fontSize: '13.5px' }}>🔴 বিরোধী / বিপক্ষ দল</b>
                    <input
                      value={newScorecard.oppTeamName}
                      onChange={e => setNewScorecard({ ...newScorecard, oppTeamName: e.target.value })}
                      placeholder="দলের নাম"
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #fca5a5', fontSize: '12px', fontWeight: 700 }}
                    />
                  </div>

                  {newScorecard.oppSpeakers.map((spk, sIdx) => (
                    <div key={sIdx} style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b' }}>{spk.role}</span>
                        <input
                          value={spk.name}
                          onChange={e => {
                            const updated = [...newScorecard.oppSpeakers];
                            updated[sIdx].name = e.target.value;
                            setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                          }}
                          placeholder="বক্তার নাম"
                          style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px', width: '130px' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#b91c1c' }}>
                          মোট: {toBn(calcSpeakerTotal(spk))}/১০০
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', fontSize: '10.5px', textAlign: 'center' }}>
                        <div>
                          <span>যুক্তি (৩০)</span>
                          <input
                            type="number" min="0" max="30"
                            value={spk.logic}
                            onChange={e => {
                              const updated = [...newScorecard.oppSpeakers];
                              updated[sIdx].logic = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>তথ্য (২০)</span>
                          <input
                            type="number" min="0" max="20"
                            value={spk.facts}
                            onChange={e => {
                              const updated = [...newScorecard.oppSpeakers];
                              updated[sIdx].facts = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>বক্তব্য (২০)</span>
                          <input
                            type="number" min="0" max="20"
                            value={spk.delivery}
                            onChange={e => {
                              const updated = [...newScorecard.oppSpeakers];
                              updated[sIdx].delivery = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>পাল্টা (১৫)</span>
                          <input
                            type="number" min="0" max="15"
                            value={spk.rebuttal}
                            onChange={e => {
                              const updated = [...newScorecard.oppSpeakers];
                              updated[sIdx].rebuttal = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>ভাষা (১০)</span>
                          <input
                            type="number" min="0" max="10"
                            value={spk.ethics}
                            onChange={e => {
                              const updated = [...newScorecard.oppSpeakers];
                              updated[sIdx].ethics = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <span>সময় (৫)</span>
                          <input
                            type="number" min="0" max="5"
                            value={spk.time}
                            onChange={e => {
                              const updated = [...newScorecard.oppSpeakers];
                              updated[sIdx].time = Number(e.target.value);
                              setNewScorecard({ ...newScorecard, oppSpeakers: updated });
                            }}
                            style={{ width: '100%', padding: '2px', textAlign: 'center', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ textAlign: 'right', fontWeight: 900, color: '#991b1b', fontSize: '13px', paddingTop: '4px' }}>
                    দলগত মোট স্কোর: {toBn(calcTeamTotal(newScorecard.oppSpeakers))} / ৩০০
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিচারকমণ্ডলীর মূল্যায়ন ও মন্তব্য</label>
                <input
                  value={newScorecard.judgesNote}
                  onChange={e => setNewScorecard({ ...newScorecard, judgesNote: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="submit"
                  style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '9px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  💾 ফলাফল ও স্কোরশিট সেভ করুন ➔
                </button>
              </div>
            </form>
          </div>

          {/* PAST COMPETITIONS LIST */}
          <div>
            <b style={{ color: '#312e81', fontSize: '15px', display: 'block', marginBottom: '10px' }}>
              📜 পূর্ববর্তী বিতর্ক প্রতিযোগিতাসমূহ ও ফলাফল গ্যালারি ({toBn(competitionsList.length)} টি):
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {competitionsList.map(comp => (
                <div
                  key={comp.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ background: '#e0e7ff', color: '#312e81', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {comp.format}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>📅 {comp.date}</span>
                    </div>
                    <h4 style={{ margin: '6px 0 2px 0', fontSize: '15px', color: '#1e1b4b', fontWeight: 900 }}>
                      {comp.title}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#4338ca', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{comp.motion}"
                    </p>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', fontSize: '12px', marginBottom: '8px' }}>
                      <div>🏆 <b>বিজয়ী দল:</b> <span style={{ color: '#047857', fontWeight: 800 }}>{comp.winner}</span> ({toBn(comp.propScore)} বনাম {toBn(comp.oppScore)})</div>
                      <div>🎙️ <b>শ্রেষ্ঠ বক্তা:</b> <span style={{ color: '#312e81', fontWeight: 800 }}>{comp.bestSpeaker}</span></div>
                      {comp.judgesNote && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>📝 {comp.judgesNote}</div>
                      )}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '11px', color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img
                            src={getResolvedTeacherPhoto(comp.moderator?.teacherId, comp.moderator?.name || 'মো: হাবিবুর রহমান')}
                            alt={comp.moderator?.name || 'মডারেটর'}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #4338ca', flexShrink: 0 }}
                            onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <b>🎙️ মডারেটর:</b> {comp.moderator?.name || 'মো: হাবিবুর রহমান'} {comp.moderator?.designation ? `(${comp.moderator.designation})` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img
                            src={getResolvedTeacherPhoto(comp.chiefJudge?.teacherId, comp.chiefJudge?.name || 'মুহাম্মদ শফিকুল ইসলাম')}
                            alt={comp.chiefJudge?.name || 'প্রধান বিচারক'}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #7c3aed', flexShrink: 0 }}
                            onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <b>⚖️ প্রধান বিচারক:</b> {comp.chiefJudge?.name || 'মুহাম্মদ শফিকুল ইসলাম'} {comp.chiefJudge?.designation ? `(${comp.chiefJudge.designation})` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img
                            src={getResolvedTeacherPhoto(comp.judge1?.teacherId, comp.judge1?.name || 'মো: আবদুল খালেক')}
                            alt={comp.judge1?.name || 'বিচারক ১'}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2563eb', flexShrink: 0 }}
                            onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <b>⚖️ বিচারক ১:</b> {comp.judge1?.name || 'মো: আবদুল খালেক'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img
                            src={getResolvedTeacherPhoto(comp.judge2?.teacherId, comp.judge2?.name || 'মো: আবু বকর সিদ্দিক')}
                            alt={comp.judge2?.name || 'বিচারক ২'}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0891b2', flexShrink: 0 }}
                            onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <b>⚖️ বিচারক ২:</b> {comp.judge2?.name || 'মো: আবু বকর সিদ্দিক'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const html = `
                            <div class="card-box" style="border:2px solid #312e81;">
                              <h3 style="margin:0 0 6px 0; color:#312e81;">${comp.title} — ফলাফল ও অফিসিয়াল স্কোরশিট</h3>
                              <div style="font-size:12.5px; color:#475569; margin-bottom:10px;">
                                ফরম্যাট: <b>${comp.format}</b> • তারিখ: ${comp.date} • ভেন্যু: ${comp.venue || 'বিদ্যালয়'}
                              </div>
                              <blockquote style="margin:0 0 12px 0; background:#f5f3ff; border-left:4px solid #312e81; padding:8px 12px; font-style:italic;">
                                "${comp.motion}"
                              </blockquote>
                              <table>
                                <tbody>
                                  <tr><td style="font-weight:700; width:30%;">বিজয়ী দল</td><td><b style="color:#047857; font-size:15px;">${comp.winner}</b></td></tr>
                                  <tr><td style="font-weight:700;">দলগত স্কোর</td><td>${comp.propTeamName} (<b>${toBn(comp.propScore)}</b>) বনাম ${comp.oppTeamName} (<b>${toBn(comp.oppScore)}</b>)</td></tr>
                                  <tr><td style="font-weight:700;">শ্রেষ্ঠ বক্তা</td><td><b style="color:#312e81; font-size:14.5px;">${comp.bestSpeaker}</b></td></tr>
                                  <tr><td style="font-weight:700;">বিচারকের মন্তব্য</td><td>${comp.judgesNote || '—'}</td></tr>
                                </tbody>
                              </table>

                              <div style="margin-top:16px; border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;">
                                <b style="color:#312e81; font-size:12px; display:block; margin-bottom:6px;">⚖️ ম্যাচ পরিচালনা ও বিচারকমণ্ডলী প্যানেল:</b>
                                <table style="font-size:11.5px; margin:0;">
                                  <tbody>
                                    <tr>
                                      <td style="width:25%;"><b>🎙️ সেশন মডারেটর:</b><br>${comp.moderator?.name || 'মো: হাবিবুর রহমান'}<br><span style="font-size:10px; color:#64748b;">${comp.moderator?.designation || ''}</span></td>
                                      <td style="width:25%;"><b>⚖️ প্রধান বিচারক:</b><br>${comp.chiefJudge?.name || 'মুহাম্মদ শফিকুল ইসলাম'}<br><span style="font-size:10px; color:#64748b;">${comp.chiefJudge?.designation || ''}</span></td>
                                      <td style="width:25%;"><b>⚖️ বিচারক - ১:</b><br>${comp.judge1?.name || 'মো: আবদুল খালেক'}<br><span style="font-size:10px; color:#64748b;">${comp.judge1?.designation || ''}</span></td>
                                      <td style="width:25%;"><b>⚖️ বিচারক - ২:</b><br>${comp.judge2?.name || 'মো: আবু বকর সিদ্দিক'}<br><span style="font-size:10px; color:#64748b;">${comp.judge2?.designation || ''}</span></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div style="display:flex; justify-content:space-between; margin-top:45px; text-align:center; font-size:11px;">
                                <div style="width:18%;">
                                  <br>--------------------------<br>
                                  <b>${comp.moderator?.name || 'মডারেটর'}</b><br>
                                  <span style="font-size:10px; color:#475569;">মডারেটর / স্পিকার</span>
                                </div>
                                <div style="width:18%;">
                                  <br>--------------------------<br>
                                  <b>${comp.judge1?.name || 'বিচারক-১'}</b><br>
                                  <span style="font-size:10px; color:#475569;">বিচারক - ১</span>
                                </div>
                                <div style="width:18%;">
                                  <br>--------------------------<br>
                                  <b>${comp.judge2?.name || 'বিচারক-২'}</b><br>
                                  <span style="font-size:10px; color:#475569;">বিচারক - ২</span>
                                </div>
                                <div style="width:18%;">
                                  <br>--------------------------<br>
                                  <b>${comp.chiefJudge?.name || 'প্রধান বিচারক'}</b><br>
                                  <span style="font-size:10px; color:#475569;">প্রধান বিচারক</span>
                                </div>
                                <div style="width:22%;">
                                  <br>--------------------------<br>
                                  <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
                                  <span style="font-size:10px; color:#475569;">প্রধান শিক্ষক ও সভাপতি</span>
                                </div>
                              </div>
                            </div>
                          `;
                          printWithPad(comp.title + ' — স্কোরশিট', '🏆 বিতর্ক ফলাফল', html);
                        }}
                        style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        🖨️ প্রিন্ট
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDebateJudges({
                          target: 'competition',
                          compId: comp.id,
                          title: comp.title,
                          moderator: comp.moderator ? { ...comp.moderator } : { name: '', designation: '', teacherId: '' },
                          chiefJudge: comp.chiefJudge ? { ...comp.chiefJudge } : { name: '', designation: '', teacherId: '' },
                          judge1: comp.judge1 ? { ...comp.judge1 } : { name: '', designation: '', teacherId: '' },
                          judge2: comp.judge2 ? { ...comp.judge2 } : { name: '', designation: '', teacherId: '' }
                        })}
                        style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', color: '#312e81', padding: '5px 10px', borderRadius: '5px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        🔄 বিচারকমণ্ডলী চেঞ্জ
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('আপনি কি এই বিতর্ক ফলাফলটি মুছে ফেলতে চান?')) {
                          setCompetitionsList(prev => prev.filter(c => c.id !== comp.id));
                        }
                      }}
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '5px 8px', borderRadius: '5px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      🗑️ মুছুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 11: মূল্যায়ন ও পুরস্কার ব্যবস্থা (৯টি সুনির্দিষ্ট ক্যাটাগরি) */}
      {/* ========================================================================= */}
      {debTab === 'awards' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১১
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                🎖️ মূল্যায়ন ও পুরস্কার ব্যবস্থা (৯টি সুনির্দিষ্ট ক্যাটাগরি)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                বিতার্কিকদের প্রতিভা, যুক্তি ও বাগ্মীতার স্বীকৃতিস্বরূপ বাৎসরিক পুরস্কার ও সম্মাননা
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const html = `
                  <div class="card-box">
                    <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের বার্ষিক মূল্যায়ন ও পুরস্কার তালিকা (২০২৬)</h3>
                    <table>
                      <thead>
                        <tr><th>ক্যাটাগরি</th><th>পুরস্কারপ্রাপ্ত শিক্ষার্থী / দল</th><th>শ্রেণি ও বিভাগ</th><th>রোল</th><th>ইভেন্ট ও সম্মাননা</th><th>মূল্যায়নের বিবরণ</th></tr>
                      </thead>
                      <tbody>
                        ${awardsList.map(a => `
                          <tr>
                            <td><b style="color:#312e81;">${a.category}</b><br><span style="font-size:11px; color:#64748b;">${a.categoryEn || ''}</span></td>
                            <td><b>${a.winner}</b></td>
                            <td style="text-align:center;">${a.class} (${a.section || '—'})</td>
                            <td style="text-align:center;">${toBn(a.roll)}</td>
                            <td>${a.badge}<br><span style="font-size:11.5px; color:#475569;">${a.event}</span></td>
                            <td>${a.remarks}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `;
                printWithPad('ডিবেটিং ক্লাব মূল্যায়ন ও পুরস্কার তালিকা', '🎖️ পুরস্কার ও সম্মাননা', html);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #312e81',
                color: '#312e81',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {awardsList.map((aw) => (
              <div
                key={aw.id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #c7d2fe',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: '0 2px 8px rgba(49, 46, 129, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ background: '#312e81', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {aw.category}
                      </span>
                      {aw.categoryEn && (
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          {aw.categoryEn}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAward(aw);
                          setAwardEditForm(aw);
                        }}
                        style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', color: '#6b21a8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✏️ এডিট
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('আপনি কি এই পুরস্কার ক্যাটাগরিটি মুছে ফেলতে চান?')) {
                            setAwardsList(prev => prev.filter(a => a.id !== aw.id));
                          }
                        }}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ margin: '8px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>পুরস্কার প্রাপক:</div>
                    <b style={{ fontSize: '15px', color: '#1e1b4b', display: 'block' }}>{aw.winner}</b>
                    <span style={{ fontSize: '11.5px', color: '#4338ca', fontWeight: 700 }}>
                      শ্রেণি: {aw.class} • শাখা/বিভাগ: {aw.section || '—'} • রোল: {toBn(aw.roll)}
                    </span>
                  </div>

                  <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '6px', padding: '8px', fontSize: '12px', marginBottom: '8px' }}>
                    <div><b>স্মারক:</b> {aw.badge}</div>
                    <div style={{ color: '#64748b', fontSize: '11.5px' }}>ইভেন্ট: {aw.event}</div>
                  </div>

                  <p style={{ margin: '0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    📝 <i>"{aw.remarks}"</i>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ADD AWARD FORM */}
          <div style={{ background: '#faf5ff', border: '1px dashed #a855f7', borderRadius: '8px', padding: '14px' }}>
            <b style={{ fontSize: '13px', color: '#6b21a8' }}>➕ নতুন পুরস্কার বা মূল্যায়ন ক্যাটাগরি যুক্ত করুন:</b>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const cat = form.awCat.value.trim();
                const win = form.awWin.value.trim();
                const cls = form.awCls.value.trim();
                const sec = form.awSec.value.trim();
                const roll = form.awRoll.value.trim();
                const ev = form.awEv.value.trim();
                const bdg = form.awBdg.value.trim();
                const rem = form.awRem.value.trim();
                if (!cat || !win) return;
                const newAw = {
                  id: 'aw-' + Date.now(),
                  category: cat,
                  categoryEn: '',
                  winner: win,
                  class: cls || '১০ম',
                  section: sec || 'বিজ্ঞান',
                  roll: roll || '১',
                  event: ev || 'বার্ষিক বিতর্ক প্রতিযোগিতা ২০২৬',
                  badge: bdg || '🏆 বিশেষ ক্রেস্ট ও সনদ',
                  remarks: rem || 'বিতর্কে অনন্য অবদানের স্বীকৃতি।'
                };
                setAwardsList(prev => [...prev, newAw]);
                form.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '10px' }}
            >
              <input name="awCat" required placeholder="পুরস্কার ক্যাটাগরি *" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awWin" required placeholder="বিজয়ীর নাম *" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awCls" placeholder="শ্রেণি (যেমন: ১০ম)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awSec" placeholder="শাখা/বিভাগ (যেমন: বিজ্ঞান)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awRoll" placeholder="রোল নং" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awBdg" placeholder="স্মারক (যেমন: 🏆 ট্রফি)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awEv" placeholder="ইভেন্টের নাম" style={{ gridColumn: '1 / -1', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="awRem" placeholder="মূল্যায়ন মন্তব্য" style={{ gridColumn: '1 / -1', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <button type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', background: '#312e81', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                + পুরস্কার যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 12: অর্জন ও ট্রফি গ্যালারি */}
      {/* ========================================================================= */}
      {debTab === 'achievements' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(49, 46, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#e0e7ff', color: '#312e81', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১২
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                🥇 অর্জন ও ট্রফি গ্যালারি (Achievements & Hall of Fame)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                জাতীয়, জেলা, উপজেলা ও আন্তঃস্কুল পর্যায়ে ডিবেটিং ক্লাবের ঐতিহাসিক ট্রফি ও সম্মাননা
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const html = `
                    <div class="card-box">
                      <h3 style="margin:0 0 10px 0; color:#312e81;">ডিবেটিং ক্লাবের ঐতিহাসিক ট্রফি ও অর্জন তালিকা</h3>
                      <table>
                        <thead>
                          <tr><th>সাল</th><th>প্রতিযোগিতা / ইভেন্ট</th><th>পর্যায়</th><th>অর্জিত সম্মাননা / ট্রফি</th><th>অংশগ্রহণকারী দল / শিক্ষার্থী</th><th>বিবরণ</th></tr>
                        </thead>
                        <tbody>
                          ${achievementsList.map(a => `
                            <tr>
                              <td style="text-align:center; font-weight:700;">${a.year}</td>
                              <td><b>${a.event}</b></td>
                              <td>${a.level}</td>
                              <td><b style="color:#047857;">${a.award}</b></td>
                              <td>${a.team}</td>
                              <td>${a.note}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  `;
                  printWithPad('ডিবেটিং ক্লাবের অর্জন ও ট্রফি গ্যালারি', '🥇 ট্রফি ও সম্মাননা', html);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #312e81',
                  color: '#312e81',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ বিদ্যালয়ে প্যাডে প্রিন্ট করুন
              </button>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['সব', 'জাতীয়', 'জেলা', 'উপজেলা', 'আন্তঃস্কুল'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setAchFilter(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: achFilter === cat ? 800 : 600,
                  cursor: 'pointer',
                  border: achFilter === cat ? '1.5px solid #312e81' : '1px solid #cbd5e1',
                  background: achFilter === cat ? '#312e81' : '#ffffff',
                  color: achFilter === cat ? '#ffffff' : '#334155'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {achievementsList
              .filter(a => achFilter === 'সব' || a.category === achFilter || (a.level && a.level.includes(achFilter)))
              .map((ach) => (
                <div
                  key={ach.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #fed7aa',
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ background: '#ea580c', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {ach.year}
                      </span>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {ach.level}
                      </span>
                    </div>

                    <h4 style={{ margin: '4px 0', fontSize: '15px', color: '#1e1b4b', fontWeight: 900 }}>
                      {ach.event}
                    </h4>

                    <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '6px', padding: '8px', margin: '8px 0', fontSize: '12.5px' }}>
                      <div>🏆 <b>সম্মাননা:</b> <span style={{ color: '#c2410c', fontWeight: 800 }}>{ach.award}</span></div>
                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>👥 প্রাপক: {ach.team}</div>
                    </div>

                    <p style={{ margin: '0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                      {ach.note}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px', borderTop: '1px dashed #fed7aa', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAchievement(ach);
                        setAchEditForm(ach);
                      }}
                      style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', color: '#6b21a8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ✏️ এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('আপনি কি এই অর্জনটি মুছে ফেলতে চান?')) {
                          setAchievementsList(prev => prev.filter(a => a.id !== ach.id));
                        }
                      }}
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* ADD ACHIEVEMENT FORM */}
          <div style={{ background: '#fff7ed', border: '1px dashed #ea580c', borderRadius: '8px', padding: '14px' }}>
            <b style={{ fontSize: '13px', color: '#c2410c' }}>➕ নতুন অর্জন বা ট্রফি যুক্ত করুন:</b>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const year = form.achYear.value.trim();
                const event = form.achEvent.value.trim();
                const level = form.achLevel.value.trim();
                const award = form.achAward.value.trim();
                const team = form.achTeam.value.trim();
                const note = form.achNote.value.trim();
                if (!event || !award) return;
                const newAch = {
                  id: 'ach-deb-' + Date.now(),
                  year: year || '২০২৬',
                  event,
                  level: level || 'উপজেলা পর্যায়',
                  category: level.includes('জাতীয়') ? 'জাতীয়' : level.includes('জেলা') ? 'জেলা' : level.includes('আন্তঃস্কুল') ? 'আন্তঃস্কুল' : 'উপজেলা',
                  award,
                  team: team || 'মগড়া পালস্ ডিবেটিং সোসাইটি',
                  note: note || 'সাফল্যের সাথে সম্মাননা অর্জন।'
                };
                setAchievementsList(prev => [newAch, ...prev]);
                form.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '10px' }}
            >
              <input name="achYear" placeholder="সাল (যেমন: ২০২৬)" defaultValue="২০২৬" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="achEvent" required placeholder="ইভেন্টের নাম *" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="achLevel" placeholder="পর্যায় (যেমন: উপজেলা পর্যায়)" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="achAward" required placeholder="অর্জিত ট্রফি বা পুরস্কার *" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="achTeam" placeholder="প্রাপক দল বা শিক্ষার্থীর নাম" style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <input name="achNote" placeholder="সংক্ষিপ্ত বিবরণ" style={{ gridColumn: '1 / -1', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <button type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', background: '#c2410c', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                + অর্জন যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALL EDIT MODALS */}
      {/* ========================================================================= */}

      {/* EDIT COORDINATOR MODAL */}
      {editingCoordinator && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ সমন্বয়ক তথ্য এডিট করুন</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>নাম:</label>
                <input
                  value={coordEditForm.name}
                  onChange={e => setCoordEditForm({ ...coordEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>পদবি:</label>
                <input
                  value={coordEditForm.designation}
                  onChange={e => setCoordEditForm({ ...coordEditForm, designation: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>দায়িত্ব:</label>
                <input
                  value={coordEditForm.role}
                  onChange={e => setCoordEditForm({ ...coordEditForm, role: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>মোবাইল:</label>
                <input
                  value={coordEditForm.phone}
                  onChange={e => setCoordEditForm({ ...coordEditForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingCoordinator(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelData(prev => ({
                    ...prev,
                    coordinators: prev.coordinators.map(c => c.id === coordEditForm.id ? coordEditForm : c)
                  }));
                  setEditingCoordinator(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EXECUTIVE POST MODAL */}
      {editingExecPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>
              ✏️ পদাধিকারী তথ্য এডিট ({execPostEditForm.title})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শিক্ষার্থীর নাম:</label>
                <input
                  value={execPostEditForm.name}
                  onChange={e => setExecPostEditForm({ ...execPostEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শ্রেণি:</label>
                  <select
                    value={execPostEditForm.class}
                    onChange={e => {
                      const c = e.target.value;
                      const defaultSec = (c === '৯ম' || c === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                      setExecPostEditForm({ ...execPostEditForm, class: c, section: defaultSec });
                    }}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শাখা / বিভাগ:</label>
                  <select
                    value={execPostEditForm.section}
                    onChange={e => setExecPostEditForm({ ...execPostEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    {execPostEditForm.class === '৯ম' || execPostEditForm.class === '১০ম' ? (
                      <>
                        <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                        <option value="মানবিক">মানবিক বিভাগ</option>
                        <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                      </>
                    ) : (
                      <>
                        <option value="শাখা ক">শাখা ক</option>
                        <option value="শাখা খ">শাখা খ</option>
                        <option value="শাখা গ">শাখা গ</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>রোল নং:</label>
                  <input
                    value={execPostEditForm.roll}
                    onChange={e => setExecPostEditForm({ ...execPostEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>মোবাইল:</label>
                  <input
                    value={execPostEditForm.phone}
                    onChange={e => setExecPostEditForm({ ...execPostEditForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingExecPost(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setExecData(prev => ({
                    ...prev,
                    posts: {
                      ...prev.posts,
                      [execPostEditForm.postKey]: {
                        ...prev.posts[execPostEditForm.postKey],
                        name: execPostEditForm.name,
                        class: execPostEditForm.class,
                        section: execPostEditForm.section,
                        roll: execPostEditForm.roll,
                        phone: execPostEditForm.phone
                      }
                    }
                  }));
                  setEditingExecPost(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EXECUTIVE MEMBER MODAL */}
      {editingExecMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ কার্যনির্বাহী সদস্য তথ্য এডিট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>নাম:</label>
                <input
                  value={execMemEditForm.name}
                  onChange={e => setExecMemEditForm({ ...execMemEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শ্রেণি:</label>
                  <select
                    value={execMemEditForm.class}
                    onChange={e => {
                      const c = e.target.value;
                      const defaultSec = (c === '৯ম' || c === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                      setExecMemEditForm({ ...execMemEditForm, class: c, section: defaultSec });
                    }}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শাখা / বিভাগ:</label>
                  <select
                    value={execMemEditForm.section}
                    onChange={e => setExecMemEditForm({ ...execMemEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    {execMemEditForm.class === '৯ম' || execMemEditForm.class === '১০ম' ? (
                      <>
                        <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                        <option value="মানবিক">মানবিক বিভাগ</option>
                        <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                      </>
                    ) : (
                      <>
                        <option value="শাখা ক">শাখা ক</option>
                        <option value="শাখা খ">শাখা খ</option>
                        <option value="শাখা গ">শাখা গ</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>রোল নং:</label>
                  <input
                    value={execMemEditForm.roll}
                    onChange={e => setExecMemEditForm({ ...execMemEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>মোবাইল:</label>
                  <input
                    value={execMemEditForm.phone}
                    onChange={e => setExecMemEditForm({ ...execMemEditForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingExecMember(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setExecData(prev => ({
                    ...prev,
                    members: prev.members.map(m => m.id === execMemEditForm.id ? execMemEditForm : m)
                  }));
                  setEditingExecMember(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GOAL MODAL */}
      {editingGoal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ লক্ষ্য ও উদ্দেশ্য এডিট করুন</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>লক্ষ্যের নাম:</label>
                <input
                  value={goalEditForm.title}
                  onChange={e => setGoalEditForm({ ...goalEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>বিস্তারিত বিবরণ:</label>
                <textarea
                  rows="3"
                  value={goalEditForm.desc}
                  onChange={e => setGoalEditForm({ ...goalEditForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setGoalsList(prev => prev.map(g => g.id === goalEditForm.id ? goalEditForm : g));
                  setEditingGoal(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACTIVITY MODAL */}
      {editingActivity && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '440px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ নিয়মিত কার্যক্রম এডিট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>কার্যক্রমের নাম:</label>
                <input
                  value={actEditForm.title}
                  onChange={e => setActEditForm({ ...actEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>ফোকাস:</label>
                <input
                  value={actEditForm.focus}
                  onChange={e => setActEditForm({ ...actEditForm, focus: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>সময়:</label>
                  <input
                    value={actEditForm.time}
                    onChange={e => setActEditForm({ ...actEditForm, time: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>ভেন্যু:</label>
                  <input
                    value={actEditForm.venue}
                    onChange={e => setActEditForm({ ...actEditForm, venue: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>বিবরণ:</label>
                <textarea
                  rows="2"
                  value={actEditForm.desc}
                  onChange={e => setActEditForm({ ...actEditForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivitiesList(prev => prev.map(a => a.id === actEditForm.id ? actEditForm : a));
                  setEditingActivity(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT QUARTERLY ROADMAP MODAL */}
      {editingQuarter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>
              ✏️ ত্রৈমাসিক রোডম্যাপ এডিট ({quarterEditForm.quarter})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শিরোনাম:</label>
                <input
                  value={quarterEditForm.title}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>বিস্তারিত পয়েন্টসমূহ:</label>
                <textarea
                  rows="4"
                  value={quarterEditForm.desc}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingQuarter(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuarterlyPlans(prev => prev.map(q => q.id === quarterEditForm.id ? quarterEditForm : q));
                  setEditingQuarter(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MONTHLY EVENT MODAL */}
      {editingMonth && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>
              ✏️ মাসিক বিতর্ক ক্যালেন্ডার এডিট ({monthEditForm.month})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>ইভেন্টের নাম:</label>
                <input
                  value={monthEditForm.title}
                  onChange={e => setMonthEditForm({ ...monthEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>তারিখ:</label>
                  <input
                    value={monthEditForm.date}
                    onChange={e => setMonthEditForm({ ...monthEditForm, date: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>সমন্বয়ক:</label>
                  <input
                    value={monthEditForm.coordinator}
                    onChange={e => setMonthEditForm({ ...monthEditForm, coordinator: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingMonth(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonthlyCalendar(prev => prev.map(m => m.id === monthEditForm.id ? monthEditForm : m));
                  setEditingMonth(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SELECTION RULE MODAL */}
      {editingSelectionRule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ সদস্য নির্বাচনের নিয়ম এডিট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শিরোনাম:</label>
                <input
                  value={selRuleEditForm.title}
                  onChange={e => setSelRuleEditForm({ ...selRuleEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>নিয়মের বিবরণ:</label>
                <textarea
                  rows="3"
                  value={selRuleEditForm.text}
                  onChange={e => setSelRuleEditForm({ ...selRuleEditForm, text: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingSelectionRule(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionRules(prev => prev.map(r => r.id === selRuleEditForm.id ? selRuleEditForm : r));
                  setEditingSelectionRule(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DISCIPLINE RULE MODAL */}
      {editingDisciplineRule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ শৃঙ্খলা ও আচরণবিধি এডিট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>বিধিমালার নাম:</label>
                <input
                  value={discRuleEditForm.rule}
                  onChange={e => setDiscRuleEditForm({ ...discRuleEditForm, rule: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>আচরণবিধির বিবরণ:</label>
                <textarea
                  rows="3"
                  value={discRuleEditForm.desc}
                  onChange={e => setDiscRuleEditForm({ ...discRuleEditForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingDisciplineRule(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setDisciplineRules(prev => prev.map(r => r.id === discRuleEditForm.id ? discRuleEditForm : r));
                  setEditingDisciplineRule(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER DIRECTORY MODAL */}
      {editingMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ সদস্য তথ্য এডিট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>নাম:</label>
                <input
                  value={memberEditForm.student_name}
                  onChange={e => setMemberEditForm({ ...memberEditForm, student_name: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শ্রেণি:</label>
                  <select
                    value={memberEditForm.class_name}
                    onChange={e => {
                      const c = e.target.value;
                      const defaultSec = (c === '৯ম' || c === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
                      setMemberEditForm({ ...memberEditForm, class_name: c, section: defaultSec });
                    }}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শাখা / বিভাগ:</label>
                  <select
                    value={memberEditForm.section}
                    onChange={e => setMemberEditForm({ ...memberEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  >
                    {memberEditForm.class_name === '৯ম' || memberEditForm.class_name === '১০ম' ? (
                      <>
                        <option value="বিজ্ঞান">বিজ্ঞান বিভাগ</option>
                        <option value="মানবিক">মানবিক বিভাগ</option>
                        <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা বিভাগ</option>
                      </>
                    ) : (
                      <>
                        <option value="শাখা ক">শাখা ক</option>
                        <option value="শাখা খ">শাখা খ</option>
                        <option value="শাখা গ">শাখা গ</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>রোল:</label>
                  <input
                    value={memberEditForm.roll_no}
                    onChange={e => setMemberEditForm({ ...memberEditForm, roll_no: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>মোবাইল:</label>
                  <input
                    value={memberEditForm.mobile}
                    onChange={e => setMemberEditForm({ ...memberEditForm, mobile: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>আগ্রহের ক্ষেত্র:</label>
                <input
                  value={memberEditForm.interest}
                  onChange={e => setMemberEditForm({ ...memberEditForm, interest: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>স্ট্যাটাস:</label>
                <select
                  value={memberEditForm.status}
                  onChange={e => setMemberEditForm({ ...memberEditForm, status: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                >
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="pending">অপেক্ষমাণ (Pending)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setMembersList(prev => prev.map(m => m.id === memberEditForm.id ? memberEditForm : m));
                  setEditingMember(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT AWARD MODAL */}
      {editingAward && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>
              ✏️ পুরস্কার প্রাপ্তি তথ্য এডিট ({awardEditForm.category})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>বিজয়ীর নাম:</label>
                <input
                  value={awardEditForm.winner}
                  onChange={e => setAwardEditForm({ ...awardEditForm, winner: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শ্রেণি:</label>
                  <input
                    value={awardEditForm.class}
                    onChange={e => setAwardEditForm({ ...awardEditForm, class: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>শাখা/বিভাগ:</label>
                  <input
                    value={awardEditForm.section}
                    onChange={e => setAwardEditForm({ ...awardEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>রোল:</label>
                  <input
                    value={awardEditForm.roll}
                    onChange={e => setAwardEditForm({ ...awardEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>ইভেন্ট:</label>
                <input
                  value={awardEditForm.event}
                  onChange={e => setAwardEditForm({ ...awardEditForm, event: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>স্মারক:</label>
                <input
                  value={awardEditForm.badge}
                  onChange={e => setAwardEditForm({ ...awardEditForm, badge: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>মূল্যায়ন মন্তব্য:</label>
                <textarea
                  rows="2"
                  value={awardEditForm.remarks}
                  onChange={e => setAwardEditForm({ ...awardEditForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingAward(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setAwardsList(prev => prev.map(a => a.id === awardEditForm.id ? awardEditForm : a));
                  setEditingAward(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACHIEVEMENT MODAL */}
      {editingAchievement && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e1b4b' }}>✏️ অর্জন ও ট্রফি তথ্য এডিট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>সাল:</label>
                  <input
                    value={achEditForm.year}
                    onChange={e => setAchEditForm({ ...achEditForm, year: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>পর্যায়:</label>
                  <input
                    value={achEditForm.level}
                    onChange={e => setAchEditForm({ ...achEditForm, level: e.target.value })}
                    style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>ইভেন্টের নাম:</label>
                <input
                  value={achEditForm.event}
                  onChange={e => setAchEditForm({ ...achEditForm, event: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>অর্জিত সম্মাননা / ট্রফি:</label>
                <input
                  value={achEditForm.award}
                  onChange={e => setAchEditForm({ ...achEditForm, award: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>প্রাপক দল বা শিক্ষার্থী:</label>
                <input
                  value={achEditForm.team}
                  onChange={e => setAchEditForm({ ...achEditForm, team: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>বিবরণ:</label>
                <textarea
                  rows="2"
                  value={achEditForm.note}
                  onChange={e => setAchEditForm({ ...achEditForm, note: e.target.value })}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingAchievement(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setAchievementsList(prev => prev.map(a => a.id === achEditForm.id ? achEditForm : a));
                  setEditingAchievement(null);
                }}
                style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: নতুন বিতর্ক প্রতিযোগিতা আয়োজন ও বিচারকমণ্ডলী প্যানেল গঠন */}
      {/* ========================================================================= */}
      {showOrganizeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            border: '2px solid #818cf8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <span style={{ background: '#e0e7ff', color: '#312e81', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  বিতর্ক ইভেন্ট শিডিউলার ও প্যানেল
                </span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                  🎙️ নতুন বিতর্ক প্রতিযোগিতা আয়োজন ও বিচারকমণ্ডলী নির্ধারণ
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  বিতর্কের বিষয়/প্রস্তাবনা, তারিখ, ফরম্যাট ও ম্যাচ পরিচালনায় মডারেটর, প্রধান বিচারক, বিচারক-১ ও বিচারক-২ নির্বাচন করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOrganizeModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, color: '#475569' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmOrganize}>
              {/* SECTION A: GENERAL DEBATE MATCH DETAILS */}
              <div style={{ marginBottom: '16px' }}>
                <b style={{ color: '#312e81', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                  ১. বিতর্কের প্রাথমিক তথ্যাদি:
                </b>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      বিতর্কের শিরোনাম / ইভেন্টের নাম *
                    </label>
                    <input
                      required
                      value={organizeForm.title}
                      onChange={e => setOrganizeForm({ ...organizeForm, title: e.target.value })}
                      placeholder="যেমন: আন্তঃশ্রেণি বিতর্ক চ্যাম্পিয়নশিপ ২০২৬"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      বিতর্কের ধরন / ফরম্যাট *
                    </label>
                    <select
                      value={organizeForm.format}
                      onChange={e => setOrganizeForm({ ...organizeForm, format: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    >
                      <option value="সংসদীয় বিতর্ক">সংসদীয় বিতর্ক (Parliamentary Debate)</option>
                      <option value="সনাতনী বিতর্ক">সনাতনী বিতর্ক (Traditional Debate)</option>
                      <option value="বারোয়ারি বিতর্ক">বারোয়ারি বিতর্ক (Open Theme Debate)</option>
                      <option value="উপস্থিত বক্তৃতা">উপস্থিত বক্তৃতা (Extempore Speech)</option>
                      <option value="ইংরেজি বিতর্ক">ইংরেজি বিতর্ক (English Debate)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      তারিখ
                    </label>
                    <input
                      value={organizeForm.date}
                      onChange={e => setOrganizeForm({ ...organizeForm, date: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      ভেন্যু / স্থান
                    </label>
                    <input
                      value={organizeForm.venue}
                      onChange={e => setOrganizeForm({ ...organizeForm, venue: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#166534', marginBottom: '3px' }}>
                      🟢 পক্ষ / সরকারি দলের নাম
                    </label>
                    <input
                      value={organizeForm.propTeamName}
                      onChange={e => setOrganizeForm({ ...organizeForm, propTeamName: e.target.value })}
                      placeholder="যেমন: সরকারি দল (১০ম শ্রেণি)"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#991b1b', marginBottom: '3px' }}>
                      🔴 বিপক্ষ / বিরোধী দলের নাম
                    </label>
                    <input
                      value={organizeForm.oppTeamName}
                      onChange={e => setOrganizeForm({ ...organizeForm, oppTeamName: e.target.value })}
                      placeholder="যেমন: বিরোধী দল (৯ম শ্রেণি)"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      বিতর্কের প্রস্তাবনা (Motion) *
                    </label>
                    <textarea
                      required
                      rows="2"
                      value={organizeForm.motion}
                      onChange={e => setOrganizeForm({ ...organizeForm, motion: e.target.value })}
                      placeholder="যেমন: এই সংসদ বিশ্বাস করে যে, কৃত্রিম বুদ্ধিমত্তা শিক্ষার্থীদের মানবিক মূল্যবোধের পরিপূরক, বিকল্প নয়।"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box', lineHeight: 1.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: MODERATOR & 3 JUDGES SELECTION */}
              <div style={{
                background: '#faf5ff',
                border: '1.5px solid #d8b4fe',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <b style={{ color: '#6b21a8', fontSize: '13.5px' }}>
                      ২. মডারেটর ও বিচারকমণ্ডলী নির্বাচন (৪টি পদ):
                    </b>
                    <small style={{ display: 'block', color: '#64748b', fontSize: '11.5px' }}>
                      বিদ্যালয়ের শিক্ষকদের ড্রপডাউন থেকে নির্বাচন করুন অথবা সরাসরি নাম ও প্রাতিষ্ঠানিক পদবি লিখুন
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrganizeForm(prev => ({
                        ...prev,
                        moderator: {
                          name: panelData?.coordinators?.[0]?.name || 'মো: হাবিবুর রহমান',
                          designation: panelData?.coordinators?.[0]?.designation || 'সিনিয়র শিক্ষক (বাংলা)',
                          teacherId: panelData?.coordinators?.[0]?.teacherId || ''
                        },
                        chiefJudge: {
                          name: panelData?.judges?.chiefJudge?.name || 'মুহাম্মদ শফিকুল ইসলাম',
                          designation: panelData?.judges?.chiefJudge?.designation || 'প্রধান শিক্ষক ও সভাপতি',
                          teacherId: ''
                        },
                        judge1: {
                          name: panelData?.judges?.judge1?.name || 'মো: আবদুল খালেক',
                          designation: panelData?.judges?.judge1?.designation || 'সহকারী প্রধান শিক্ষক',
                          teacherId: ''
                        },
                        judge2: {
                          name: panelData?.judges?.judge2?.name || 'মো: আবু বকর সিদ্দিক',
                          designation: panelData?.judges?.judge2?.designation || 'সহকারী শিক্ষক (আইসিটি)',
                          teacherId: ''
                        }
                      }));
                    }}
                    style={{
                      background: '#ede9fe',
                      color: '#6b21a8',
                      border: '1px solid #c084fc',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ ক্লাবের স্থায়ী প্যানেল থেকে লোড করুন
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
                  {/* MODERATOR */}
                  <div style={{ background: '#ffffff', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>🎙️</span>
                        <b style={{ color: '#4338ca', fontSize: '12px' }}>মডারেটর / স্পিকার / সঞ্চালক:</b>
                      </div>
                      <img
                        src={getResolvedTeacherPhoto(organizeForm.moderator.teacherId, organizeForm.moderator.name)}
                        alt={organizeForm.moderator.name || 'মডারেটর'}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #4338ca', flexShrink: 0 }}
                        onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                      />
                    </div>
                    <select
                      value={organizeForm.moderator.teacherId || ''}
                      onChange={e => {
                        const tId = e.target.value;
                        const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                        if (tObj) {
                          setOrganizeForm({
                            ...organizeForm,
                            moderator: {
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'শিক্ষক',
                              teacherId: tId
                            }
                          });
                        }
                      }}
                      style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                    >
                      <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                      {activeTeachers.map(t => (
                        <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                          {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        placeholder="মডারেটরের নাম"
                        value={organizeForm.moderator.name}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          moderator: { ...organizeForm.moderator, name: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                      <input
                        placeholder="পদবি / পরিচয়"
                        value={organizeForm.moderator.designation}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          moderator: { ...organizeForm.moderator, designation: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                    </div>
                  </div>

                  {/* CHIEF JUDGE */}
                  <div style={{ background: '#ffffff', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>⚖️</span>
                        <b style={{ color: '#7c3aed', fontSize: '12px' }}>প্রধান বিচারক (Chief Judge):</b>
                      </div>
                      <img
                        src={getResolvedTeacherPhoto(organizeForm.chiefJudge.teacherId, organizeForm.chiefJudge.name)}
                        alt={organizeForm.chiefJudge.name || 'প্রধান বিচারক'}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #7c3aed', flexShrink: 0 }}
                        onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                      />
                    </div>
                    <select
                      value={organizeForm.chiefJudge.teacherId || ''}
                      onChange={e => {
                        const tId = e.target.value;
                        const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                        if (tObj) {
                          setOrganizeForm({
                            ...organizeForm,
                            chiefJudge: {
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'প্রধান বিচারক',
                              teacherId: tId
                            }
                          });
                        }
                      }}
                      style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                    >
                      <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                      {activeTeachers.map(t => (
                        <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                          {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        placeholder="প্রধান বিচারকের নাম"
                        value={organizeForm.chiefJudge.name}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          chiefJudge: { ...organizeForm.chiefJudge, name: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                      <input
                        placeholder="পদবি / পরিচয়"
                        value={organizeForm.chiefJudge.designation}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          chiefJudge: { ...organizeForm.chiefJudge, designation: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                    </div>
                  </div>

                  {/* JUDGE 1 */}
                  <div style={{ background: '#ffffff', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>⚖️</span>
                        <b style={{ color: '#2563eb', fontSize: '12px' }}>বিচারক - ১ (সহকারী বিচারক):</b>
                      </div>
                      <img
                        src={getResolvedTeacherPhoto(organizeForm.judge1.teacherId, organizeForm.judge1.name)}
                        alt={organizeForm.judge1.name || 'বিচারক ১'}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #2563eb', flexShrink: 0 }}
                        onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                      />
                    </div>
                    <select
                      value={organizeForm.judge1.teacherId || ''}
                      onChange={e => {
                        const tId = e.target.value;
                        const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                        if (tObj) {
                          setOrganizeForm({
                            ...organizeForm,
                            judge1: {
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'বিচারক',
                              teacherId: tId
                            }
                          });
                        }
                      }}
                      style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                    >
                      <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                      {activeTeachers.map(t => (
                        <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                          {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        placeholder="বিচারক-১ এর নাম"
                        value={organizeForm.judge1.name}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          judge1: { ...organizeForm.judge1, name: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                      <input
                        placeholder="পদবি / পরিচয়"
                        value={organizeForm.judge1.designation}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          judge1: { ...organizeForm.judge1, designation: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                    </div>
                  </div>

                  {/* JUDGE 2 */}
                  <div style={{ background: '#ffffff', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>⚖️</span>
                        <b style={{ color: '#0891b2', fontSize: '12px' }}>বিচারক - ২ (সহকারী বিচারক):</b>
                      </div>
                      <img
                        src={getResolvedTeacherPhoto(organizeForm.judge2.teacherId, organizeForm.judge2.name)}
                        alt={organizeForm.judge2.name || 'বিচারক ২'}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0891b2', flexShrink: 0 }}
                        onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                      />
                    </div>
                    <select
                      value={organizeForm.judge2.teacherId || ''}
                      onChange={e => {
                        const tId = e.target.value;
                        const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                        if (tObj) {
                          setOrganizeForm({
                            ...organizeForm,
                            judge2: {
                              name: tObj.name_bn || tObj.name,
                              designation: tObj.designation || 'বিচারক',
                              teacherId: tId
                            }
                          });
                        }
                      }}
                      style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                    >
                      <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                      {activeTeachers.map(t => (
                        <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                          {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        placeholder="বিচারক-২ এর নাম"
                        value={organizeForm.judge2.name}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          judge2: { ...organizeForm.judge2, name: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                      <input
                        placeholder="পদবি / পরিচয়"
                        value={organizeForm.judge2.designation}
                        onChange={e => setOrganizeForm({
                          ...organizeForm,
                          judge2: { ...organizeForm.judge2, designation: e.target.value }
                        })}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOrganizeModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#312e81',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 24px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(49, 46, 129, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🚀 বিতর্ক আয়োজন নিশ্চিত করুন ও সরাসরি স্কোরশিট প্রস্তুত করুন ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: মডারেটর এবং বিচারকমণ্ডলী চেঞ্জ / পরিবর্তন করার মোডাল */}
      {/* ========================================================================= */}
      {editingDebateJudges && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '740px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            border: '2px solid #818cf8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <span style={{ background: '#ede9fe', color: '#6b21a8', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  প্যানেল পরিবর্তন ও আপডেট
                </span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#1e1b4b', fontWeight: 900 }}>
                  🔄 মডারেটর ও বিচারকমণ্ডলী চেঞ্জ করুন
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {editingDebateJudges.title ? `বিতর্ক: "${editingDebateJudges.title}"` : 'চলমান বিতর্ক ম্যাচ'} — নতুন মডারেটর, প্রধান বিচারক, বিচারক-১ এবং বিচারক-২ নির্বাচন করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDebateJudges(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, color: '#475569' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJudgesChange}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                {/* 1. MODERATOR */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #c7d2fe', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px' }}>🎙️</span>
                      <b style={{ color: '#4338ca', fontSize: '12.5px' }}>মডারেটর / স্পিকার নির্বাচন:</b>
                    </div>
                    <img
                      src={getResolvedTeacherPhoto(editingDebateJudges.moderator?.teacherId, editingDebateJudges.moderator?.name)}
                      alt={editingDebateJudges.moderator?.name || 'মডারেটর'}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #4338ca', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                  </div>
                  <select
                    value={editingDebateJudges.moderator?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setEditingDebateJudges({
                          ...editingDebateJudges,
                          moderator: {
                            name: tObj.name_bn || tObj.name,
                            designation: tObj.designation || 'শিক্ষক',
                            teacherId: tId
                          }
                        });
                      }
                    }}
                    style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                  >
                    <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      placeholder="মডারেটরের নাম"
                      value={editingDebateJudges.moderator?.name || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        moderator: { ...editingDebateJudges.moderator, name: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                    <input
                      placeholder="পদবি / পরিচয়"
                      value={editingDebateJudges.moderator?.designation || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        moderator: { ...editingDebateJudges.moderator, designation: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                  </div>
                </div>

                {/* 2. CHIEF JUDGE */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #d8b4fe', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px' }}>⚖️</span>
                      <b style={{ color: '#7c3aed', fontSize: '12.5px' }}>প্রধান বিচারক নির্বাচন:</b>
                    </div>
                    <img
                      src={getResolvedTeacherPhoto(editingDebateJudges.chiefJudge?.teacherId, editingDebateJudges.chiefJudge?.name)}
                      alt={editingDebateJudges.chiefJudge?.name || 'প্রধান বিচারক'}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #7c3aed', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                  </div>
                  <select
                    value={editingDebateJudges.chiefJudge?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setEditingDebateJudges({
                          ...editingDebateJudges,
                          chiefJudge: {
                            name: tObj.name_bn || tObj.name,
                            designation: tObj.designation || 'প্রধান বিচারক',
                            teacherId: tId
                          }
                        });
                      }
                    }}
                    style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                  >
                    <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      placeholder="প্রধান বিচারকের নাম"
                      value={editingDebateJudges.chiefJudge?.name || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        chiefJudge: { ...editingDebateJudges.chiefJudge, name: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                    <input
                      placeholder="পদবি / পরিচয়"
                      value={editingDebateJudges.chiefJudge?.designation || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        chiefJudge: { ...editingDebateJudges.chiefJudge, designation: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                  </div>
                </div>

                {/* 3. JUDGE 1 */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px' }}>⚖️</span>
                      <b style={{ color: '#2563eb', fontSize: '12.5px' }}>বিচারক - ১ নির্বাচন:</b>
                    </div>
                    <img
                      src={getResolvedTeacherPhoto(editingDebateJudges.judge1?.teacherId, editingDebateJudges.judge1?.name)}
                      alt={editingDebateJudges.judge1?.name || 'বিচারক ১'}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #2563eb', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                  </div>
                  <select
                    value={editingDebateJudges.judge1?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setEditingDebateJudges({
                          ...editingDebateJudges,
                          judge1: {
                            name: tObj.name_bn || tObj.name,
                            designation: tObj.designation || 'বিচারক',
                            teacherId: tId
                          }
                        });
                      }
                    }}
                    style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                  >
                    <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      placeholder="বিচারক-১ এর নাম"
                      value={editingDebateJudges.judge1?.name || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        judge1: { ...editingDebateJudges.judge1, name: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                    <input
                      placeholder="পদবি / পরিচয়"
                      value={editingDebateJudges.judge1?.designation || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        judge1: { ...editingDebateJudges.judge1, designation: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                  </div>
                </div>

                {/* 4. JUDGE 2 */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #a5f3fc', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px' }}>⚖️</span>
                      <b style={{ color: '#0891b2', fontSize: '12.5px' }}>বিচারক - ২ নির্বাচন:</b>
                    </div>
                    <img
                      src={getResolvedTeacherPhoto(editingDebateJudges.judge2?.teacherId, editingDebateJudges.judge2?.name)}
                      alt={editingDebateJudges.judge2?.name || 'বিচারক ২'}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0891b2', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                  </div>
                  <select
                    value={editingDebateJudges.judge2?.teacherId || ''}
                    onChange={e => {
                      const tId = e.target.value;
                      const tObj = activeTeachers.find(t => (t.id || t.teacher_id) === tId);
                      if (tObj) {
                        setEditingDebateJudges({
                          ...editingDebateJudges,
                          judge2: {
                            name: tObj.name_bn || tObj.name,
                            designation: tObj.designation || 'বিচারক',
                            teacherId: tId
                          }
                        });
                      }
                    }}
                    style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginBottom: '6px' }}
                  >
                    <option value="">— শিক্ষক ড্রপডাউন থেকে নির্বাচন করুন —</option>
                    {activeTeachers.map(t => (
                      <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                        {t.name_bn || t.name} ({t.designation || 'শিক্ষক'})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      placeholder="বিচারক-২ এর নাম"
                      value={editingDebateJudges.judge2?.name || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        judge2: { ...editingDebateJudges.judge2, name: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                    <input
                      placeholder="পদবি / পরিচয়"
                      value={editingDebateJudges.judge2?.designation || ''}
                      onChange={e => setEditingDebateJudges({
                        ...editingDebateJudges,
                        judge2: { ...editingDebateJudges.judge2, designation: e.target.value }
                      })}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingDebateJudges(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '7px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#312e81', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                >
                  💾 পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
