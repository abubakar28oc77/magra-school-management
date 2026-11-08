import React, { useState, useMemo } from 'react';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// LocalStorage Keys for E-Services
const ESERVICE_APPLICATIONS_KEY = 'magra_eservice_applications_v2';
const ESERVICE_GRS_KEY = 'magra_eservice_grs_v2';

// --------------------------------------------------------------------------
// ALL E-SERVICES MASTER DIRECTORY DATA
// --------------------------------------------------------------------------
export const ESERVICE_MASTER_DIRECTORY = [
  {
    id: 'esif-six',
    subKey: 'public.nav.eservice.esif_six',
    category: 'esif',
    title: 'eSIF- Class Six (৬ষ্ঠ শ্রেণি অনলাইন রেজিস্ট্রেশন)',
    shortDesc: '৬ষ্ঠ শ্রেণিতে নতুন ভর্তিকৃত শিক্ষার্থীদের প্রাথমিক ও মাধ্যমিক স্তরে বোর্ড রেজিস্ট্রেশন ও ইউনিক স্টুডেন্ট আইডিভুক্তি।',
    portalUrl: 'https://dhakaeducationboard.gov.bd/',
    authority: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    badge: 'বোর্ড রেজিস্ট্রেশন',
    fee: 'বোর্ড নির্ধারিত ফি',
    icon: '📝',
    requirements: [
      '১৭ ডিজিটের অনলাইন জন্মনিবন্ধন সনদ (বাংলা ও ইংরেজি)',
      'পাসপোর্ট সাইজ রঙিন ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড)',
      'পিতা ও মাতার জাতীয় পরিচয়পত্র (NID) এর ফটোকপি',
      'পিএসসি/ইবতেদায়ী/৫ম শ্রেণির বার্ষিক পরীক্ষার উত্তীর্ণ প্রশংসাপত্র বা ছাড়পত্র (TC)'
    ],
    guidelines: 'প্রতিটি শিক্ষার্থীর পিতা-মাতার নাম ও জন্মতারিখ অনলাইন জন্মসনদের সাথে শতভাগ মিল থাকতে হবে। ইংরেজি স্পেলিংয়ে বড় হাতের অক্ষর (Capital Letters) ব্যবহার করতে হবে।'
  },
  {
    id: 'esif-eight',
    subKey: 'public.nav.eservice.esif_eight',
    category: 'esif',
    title: 'eSIF- Class Eight (৮ম শ্রেণি অনলাইন রেজিস্ট্রেশন)',
    shortDesc: '৮ম শ্রেণির শিক্ষার্থীদের বোর্ড রেজিস্ট্রেশন, বিষয় কোড ম্যাপিং ও সমমান পরীক্ষার ডেটাবেইজ তৈরি।',
    portalUrl: 'https://dhakaeducationboard.gov.bd/',
    authority: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    badge: 'জেএসসি সমমান',
    fee: 'বোর্ড নির্ধারিত রেজিস্ট্রেশন ফি',
    icon: '📋',
    requirements: [
      '৬ষ্ঠ ও ৭ম শ্রেণির উত্তীর্ণ মার্কশিট ও মূল রেজিস্ট্রেশন নম্বর',
      'অনলাইন জন্মসনদ (১৭ ডিজিট)',
      'পিতা-মাতার জাতীয় পরিচয়পত্র',
      'শিক্ষার্থীর ছবি (বোর্ড স্ট্যান্ডার্ড রেজোলিউশন)'
    ],
    guidelines: 'কোনো শিক্ষার্থী অন্য বিদ্যালয় থেকে ছাড়পত্র (TC) নিয়ে ভর্তি হয়ে থাকলে পূর্বের বিদ্যালয়ের eSIF ছাড়পত্র অনুমোদন নিশ্চিত করতে হবে।'
  },
  {
    id: 'esif-nine',
    subKey: 'public.nav.eservice.esif_nine',
    category: 'esif',
    title: 'eSIF- Class Nine (৯ম শ্রেণি বোর্ড রেজিস্ট্রেশন)',
    shortDesc: '৯ম শ্রেণির শিক্ষার্থীদের মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ডে আনুষ্ঠানিক এসএসসি রেজিস্ট্রেশন, বিভাগ ও ৪র্থ বিষয় নির্বাচন।',
    portalUrl: 'https://dhakaeducationboard.gov.bd/',
    authority: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    badge: 'এসএসসি রেজিস্ট্রেশন',
    fee: 'বোর্ড নির্ধারিত ফি + রেডক্রিসেন্ট + স্কাউট ফি',
    icon: '🎓',
    requirements: [
      '৮ম শ্রেণি সমাপনী/রেজিস্ট্রেশন কার্ডের ফটোকপি',
      'বিভাগ নির্বাচন (বিজ্ঞান / মানবিক / ব্যবসায় শিক্ষা) ও ৪র্থ ঐচ্ছিক বিষয় ফরম',
      'অনলাইন জন্মসনদ ও পিতা-মাতার এনআইডি',
      'সদ্য তোলা পাসপোর্ট সাইজ ছবি'
    ],
    guidelines: 'বিজ্ঞান বিভাগে উচ্চতর গণিত/জীববিজ্ঞান এবং মানবিক ও ব্যবসায় শিক্ষায় বিষয় কোড সতর্কতার সাথে পূরণ করতে হবে। একবার সাবমিট হলে বিভাগ পরিবর্তনে বোর্ড জরিমানা প্রযোজ্য।'
  },
  {
    id: 'eff',
    subKey: 'public.nav.eservice.eff',
    category: 'eff',
    title: 'Form Fillup (eFF) - এসএসসি ফরম ফিলাপ পোর্টাল',
    shortDesc: '১০ম শ্রেণির নির্বাচনী পরীক্ষায় উত্তীর্ণ নিয়মিত ও অনিয়মিত শিক্ষার্থীদের এসএসসি পরীক্ষার চূড়ান্ত অনলাইন ফরম ফিলাপ ও ফি প্রদান।',
    portalUrl: 'https://dhakaeducationboard.gov.bd/',
    authority: 'ঢাকা শিক্ষা বোর্ড ও পরীক্ষা নিয়ন্ত্রণ বিভাগ',
    badge: 'এসএসসি পরীক্ষা',
    fee: 'বিজ্ঞান: প্রায় ২,২০০/-, মানবিক ও ব্যবসায় শিক্ষা: প্রায় ২,০৮০/-',
    icon: '✍️',
    requirements: [
      '৯ম শ্রেণির মূল রেজিস্ট্রেশন কার্ড',
      'নির্বাচনী (Test) পরীক্ষায় সকল বিষয়ে উত্তীর্ণ হওয়ার প্রত্যয়নপত্র',
      'সোনালী সেবা অনলাইন পেমেন্ট স্লিপ / ট্রানজেকশন আইডি',
      'কোনো বকেয়া বেতন বা সেশন চার্জ না থাকার ছাড়পত্র'
    ],
    guidelines: 'বোর্ড কর্তৃক প্রকাশিত সম্ভাব্য তালিকা (Probable List) ডাউনলোড করে শিক্ষার্থীর নাম, বিষয় ও ছবি পুঙ্খানুপুঙ্খভাবে মিলিয়ে সোনালী সেবার মাধ্যমে ফি পরিশোধ করতে হবে।'
  },
  {
    id: 'etif',
    subKey: 'public.nav.eservice.etif',
    category: 'etif',
    title: 'eTIF (Teacher) - শিক্ষক তথ্য ফরম ও পিডিএস পোর্টাল',
    shortDesc: 'বিদ্যালয়ের কর্মরত সকল শিক্ষক-কর্মচারীর ব্যক্তিগত, শিক্ষাগত ও পেশাগত তথ্য হালনাগাদ, ইনডেক্স ও PDS ভেরিফিকেশন।',
    portalUrl: 'https://emis.gov.bd/',
    authority: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (DSHE) - EMIS',
    badge: 'শিক্ষক ডেটাবেজ',
    fee: 'বিনামূল্যে',
    icon: '👨‍🏫',
    requirements: [
      'শিক্ষকের জাতীয় পরিচয়পত্র (NID)',
      'এসএসসি হতে সর্বোচ্চ ডিগ্রির সকল মূল সনদ ও নম্বরপত্র',
      'এনটিআরসিএ সুপারিশপত্র / নিয়োগপত্র ও যোগদানপত্র',
      'প্রথম ও সর্বশেষ এমপিও শিটের কপি এবং পিডিএস (PDS) নম্বর'
    ],
    guidelines: 'প্রতিটি শিক্ষককে তাঁদের উচ্চতর ডিগ্রি, প্রশিক্ষণ (বিএড, আইসিটি, বিষয়ভিত্তিক কারিকুলাম) এবং বর্তমান পদবি নিয়মিত eTIF এ হালনাগাদ রাখতে হবে।'
  },
  {
    id: 'correction',
    subKey: 'public.nav.eservice.correction',
    category: 'correction',
    title: 'নাম ও বয়স সংশোধন (বোর্ড সার্টিফিকেট ও নথি সংশোধন)',
    shortDesc: 'বোর্ড সার্টিফিকেট, নম্বরপত্র ও রেজিস্ট্রেশন কার্ডে নিজের নাম, পিতা-মাতার নাম বা জন্মতারিখ সংশোধনের অনলাইন আবেদন।',
    portalUrl: 'https://dhakaeducationboard.gov.bd/',
    authority: 'ঢাকা শিক্ষা বোর্ড (নাম ও বয়স সংশোধন শাখা)',
    badge: 'সনদ সংশোধন',
    fee: 'প্রতি ডকুমেন্টে বোর্ড নির্ধারিত ফি (সোনালী সেবার মাধ্যমে)',
    icon: '🛠️',
    requirements: [
      '১ম শ্রেণির ম্যাজিস্ট্রেট কোর্ট কর্তৃক এফিডেভিট / হলফনামা মূলকপি',
      'বহুল প্রচারিত একটি জাতীয় বাংলা দৈনিক পত্রিকায় প্রকাশিত বিজ্ঞপ্তির মূল কাটিং',
      'শিক্ষার্থীর ১৭ ডিজিটের অনলাইন জন্মনিবন্ধন সনদ',
      'পিতা ও মাতার অনলাইন এনআইডি (জাতীয় পরিচয়পত্র)',
      'প্রধান শিক্ষক কর্তৃক সুপারিশকৃত অফিসিয়াল প্রত্যয়নপত্র'
    ],
    guidelines: 'আবেদনের পর ঢাকা শিক্ষা বোর্ডের নির্ধারিত তারিখে নাম ও বয়স সংশোধন কমিটির সভায় মূল কাগজপত্রসহ উপস্থিত হতে হয়।'
  },
  {
    id: 'grs',
    subKey: 'public.nav.eservice.grs',
    category: 'grs',
    title: 'অভিযোগ প্রতিকার ব্যবস্থা (GRS - Grievance Redress System)',
    shortDesc: 'শিক্ষা মন্ত্রণালয় ও বিদ্যালয়ের প্রশাসনিক বা একাডেমিক সেবা সংক্রান্ত যেকোনো অভিযোগ, মতামত ও অসঙ্গতি নিষ্পত্তির সরকারি ব্যবস্থা।',
    portalUrl: 'https://grs.gov.bd/',
    authority: 'মন্ত্রিপরিষদ বিভাগ ও শিক্ষা মন্ত্রণালয়',
    badge: 'সরকারি সেবা',
    fee: 'সম্পূর্ণ বিনামূল্যে',
    icon: '⚖️',
    requirements: [
      'অভিযোগকারীর নাম, মোবাইল নম্বর ও ই-মেইল',
      'অভিযোগের বিস্তারিত বিবরণ ও ঘটনার তারিখ',
      'সংশ্লিষ্ট প্রমাণক বা ডকুমেন্টের ছবি/পিডিএফ (যদি থাকে)'
    ],
    guidelines: 'সরকারি জিআরএস নীতি অনুযায়ী দাখিলকৃত প্রতিটি অভিযোগের বিষয়ে তদন্তপূর্বক নির্দিষ্ট কার্যদিবসের মধ্যে প্রতিকার বা সিদ্ধান্ত জানানো বাধ্যতামূলক।'
  },
  {
    id: 'efiling',
    subKey: 'public.nav.eservice.efiling',
    category: 'efiling',
    title: 'ই-ফাইলিং ও ডি-নথি পোর্টাল (D-Nothi / E-Nothi)',
    shortDesc: 'সরকারি ও প্রাতিষ্ঠানিক ডিজিটাল নথি ব্যবস্থাপনা, সরকারি আদেশ (GO), প্রজ্ঞাপন ও চিঠি চালাচালির কেন্দ্রীয় পোর্টাল।',
    portalUrl: 'https://www.nothi.gov.bd/',
    authority: 'এটুআই (a2i) ও তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
    badge: 'স্মার্ট প্রশাসন',
    fee: 'দাপ্তরিক সেবা',
    icon: '📂',
    requirements: [
      'বিদ্যালয়ের প্রাতিষ্ঠানিক ইউজার আইডি ও পাসওয়ার্ড',
      'ডিজিটাল স্বাক্ষর (Digital Signature / OTP Verification)',
      'অফিসিয়াল নথি নম্বর ও বিষয় কোড'
    ],
    guidelines: 'বিদ্যালয়ের প্রধান শিক্ষক ও অফিস সহকারীর মাধ্যমে মাউশি ও শিক্ষা বোর্ডের সাথে দ্রুত ডিজিটাল যোগাযোগ রক্ষা করা হয়।'
  },
  {
    id: 'sonali-seba',
    subKey: 'public.nav.eservice.sonali_seba',
    category: 'sonali',
    title: 'সোনালী সেবা (Sonali Seba Online Payment Gateway)',
    shortDesc: 'শিক্ষা বোর্ড, জাতীয় বিশ্ববিদ্যালয় ও সরকারি সকল ফি অনলাইনে তাৎক্ষণিক পরিশোধ ও চালান রসিদ সংগ্রহের ই-গেটওয়ে।',
    portalUrl: 'https://www.sonalibank.com.bd/sonaliseba/',
    authority: 'সোনালী ব্যাংক পিএলসি ও বাংলাদেশ সরকার',
    badge: 'ই-পেমেন্ট',
    fee: 'সেবামূল্য অনুযায়ী নির্ধারিত',
    icon: '💳',
    requirements: [
      'শিক্ষার্থীর ট্র্যাকিং নম্বর / রোল ও শিক্ষাবর্ষ',
      'মোবাইল ব্যাংকিং (বিকাশ, নগদ, রকেট) বা ভিসা/মাস্টারকার্ড অথবা সোনালী ই-ওয়ালেট',
      'ফি জমাদানের পর প্রাপ্ত সোনালী ই-চালান প্রিন্ট কপি'
    ],
    guidelines: 'পেমেন্ট সম্পন্ন হওয়ার পর স্ক্রিনে প্রদর্শিত ই-চালান ও ট্রানজেকশন স্লিপটি অবশ্যই ডাউনলোড ও প্রিন্ট করে সংরক্ষণ করতে হবে।'
  },
  {
    id: 'crvs-uid',
    subKey: 'public.nav.eservice.crvs_uid',
    category: 'govt_portals',
    title: 'জাতীয় শিক্ষার্থী নিবন্ধন ও ইউনিক আইডি (CRVS / UID)',
    shortDesc: 'বাংলাদেশ সরকারের সিআরভিএস প্রকল্পের আওতায় প্রতিটি শিক্ষার্থীর জন্য আজীবন ব্যবহারযোগ্য একক ইউনিক আইডি (UID) কার্ড ও ডেটাবেজ।',
    portalUrl: 'https://crvs.gov.bd/',
    authority: 'ব্যানবেইস (BANBEIS) ও শিক্ষা মন্ত্রণালয়',
    badge: 'ইউনিক আইডি',
    fee: 'বিনামূল্যে',
    icon: '🆔',
    requirements: [
      'শিক্ষার্থীর ১৭ ডিজিট অনলাইন জন্মনিবন্ধন সনদ',
      'পিতা ও মাতার এনআইডি ও অনলাইন জন্মসনদ',
      'রক্তের গ্রুপ পরীক্ষার রিপোর্ট',
      'শিক্ষার্থীর ডিজিটাল পাসপোর্ট ছবি'
    ],
    guidelines: 'প্রতিটি শিক্ষার্থীর প্রোফাইলে সঠিক রক্তের গ্রুপ, পিতা-মাতার পেশা ও মোবাইল নম্বর এন্ট্রি নিশ্চিত করা বাধ্যতামূলক।'
  },
  {
    id: 'stipend-hsp',
    subKey: 'public.nav.eservice.stipend_hsp',
    category: 'govt_portals',
    title: 'সমন্বিত উপবৃত্তি পোর্টাল (HSP - PMEAT)',
    shortDesc: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্টের মাধ্যমে মাধ্যমিক পর্যায়ের অসচ্ছল ও মেধাবী শিক্ষার্থীদের সমন্বিত উপবৃত্তি ও টিউশন ফি প্রদান।',
    portalUrl: 'http://hsp.pmeat.gov.bd/',
    authority: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট (PMEAT)',
    badge: 'উপবৃত্তি',
    fee: 'বিনামূল্যে',
    icon: '💰',
    requirements: [
      'অভিভাবকের জাতীয় পরিচয়পত্রের সাথে খোলা সক্রিয় মোবাইল ব্যাংক হিসাব (নগদ/বিকাশ/শিওরক্যাশ)',
      'শিক্ষার্থীর ছবি ও জন্মনিবন্ধন',
      'ভূমিহীন/অসচ্ছল/মুক্তিযোদ্ধা প্রত্যয়নপত্র (প্রযোজ্য ক্ষেত্রে)'
    ],
    guidelines: 'সিম কার্ডটি অবশ্যই অভিভাবকের নিজের এনআইডি দিয়ে নিবন্ধিত হতে হবে। ভুল একাউন্ট নম্বর দিলে উপবৃত্তির টাকা বাউন্স হতে পারে।'
  },
  {
    id: 'emis-mpo',
    subKey: 'public.nav.eservice.emis_mpo',
    category: 'govt_portals',
    title: 'মাউশি EMIS ও শিক্ষক এমপিও পোর্টাল',
    shortDesc: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তরের এমপিওভুক্ত শিক্ষক-কর্মচারীদের নতুন এমপিওভুক্তি, উচ্চতর স্কেল, বিএড স্কেল ও ট্রান্সফার আবেদন।',
    portalUrl: 'https://emis.gov.bd/',
    authority: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (DSHE)',
    badge: 'এমপিও প্রশাসন',
    fee: 'সরকারি নিয়মানুযায়ী',
    icon: '🏛️',
    requirements: [
      'শিক্ষক ইনডেক্স ও জাতীয় পরিচয়পত্র',
      'নিয়োগ কমিটি অনুমোদন ও ব্যানবেইস ডাটাবেজ ক্লিয়ারেন্স',
      'জেলা শিক্ষা অফিসার ও উপজেলা মাধ্যমিক শিক্ষা অফিসারের পরিদর্শন প্রতিবেদন'
    ],
    guidelines: 'অনলাইনে এমপিও আবেদনের সময় সকল অ্যাকাডেমিক সনদের সত্যায়িত স্ক্যান কপি সঠিকভাবে আপলোড করতে হবে।'
  },
  {
    id: 'testimonial-verify',
    subKey: 'public.nav.eservice.testimonial_verify',
    category: 'govt_portals',
    title: 'অনলাইন প্রশংসাপত্র ও প্রত্যয়ন যাচাই পোর্টাল',
    shortDesc: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের উত্তীর্ণ শিক্ষার্থীদের প্রশংসাপত্র, প্রত্যয়নপত্র ও ছাড়পত্রের অনলাইন ডিজিটাল যাচাই।',
    portalUrl: '#school-info',
    authority: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়',
    badge: 'ইন-হাউস সেবা',
    fee: 'অফিস নির্ধারিত ফি',
    icon: '📜',
    requirements: [
      'এসএসসি পাসের বছর ও রোল নম্বর',
      'বিদ্যালয়ের মূল রেজিস্ট্রেশন নম্বর',
      'অফিসিয়াল স্মারক নম্বর যাচাই'
    ],
    guidelines: 'যেকোনো বিশ্ববিদ্যালয় বা নিয়োগকারী কর্তৃপক্ষ এই পোর্টালে শিক্ষার্থীর রোল ও সেশন দিয়ে সনদের সত্যতা যাচাই করতে পারবে।'
  }
];

export function EServiceCenterModalSection({ initialSubmenuKey, initialTitle, onClose }) {
  // Determine active category or selected service from key
  const getInitialTab = () => {
    const k = String(initialSubmenuKey || '').toLowerCase();
    const t = String(initialTitle || '').toLowerCase();
    if (k.includes('esif_six') || k.includes('esif_eight') || k.includes('esif_nine') || t.includes('esif')) return 'esif';
    if (k.includes('eff') || t.includes('eff') || t.includes('ফিল আপ') || t.includes('ফিলাপ')) return 'eff';
    if (k.includes('etif') || t.includes('etif') || t.includes('শিক্ষক তথ্য')) return 'etif';
    if (k.includes('correction') || t.includes('সংশোধন')) return 'correction';
    if (k.includes('grs') || t.includes('অভিযোগ') || t.includes('প্রতিকার')) return 'grs';
    if (k.includes('efiling') || t.includes('ফাইলিং') || t.includes('নথি')) return 'efiling';
    if (k.includes('sonali') || t.includes('সোনালী')) return 'sonali';
    if (k.includes('crvs') || k.includes('stipend') || k.includes('emis') || k.includes('testimonial')) return 'govt_portals';
    return 'all';
  };

  const [activeCategory, setActiveCategory] = useState(getInitialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  // Correction Recommendation Form State
  const [correctionForm, setCorrectionForm] = useState({
    studentNameBn: '',
    studentNameEn: '',
    rollNo: '',
    regNo: '',
    examYear: '২০২৬',
    targetCorrection: 'নিজের নামের বানান সংশোধন',
    existingValue: '',
    proposedValue: '',
    fatherNameBn: '',
    motherNameBn: '',
    reason: ''
  });

  // GRS Complaint Form State
  const [grsForm, setGrsForm] = useState({
    complainantName: '',
    phone: '',
    email: '',
    subject: '',
    category: 'একাডেমিক সেবা',
    details: '',
    isAnonymous: false
  });
  const [grsToken, setGrsToken] = useState(null);

  // Filter Services based on activeCategory and searchTerm
  const filteredServices = useMemo(() => {
    return ESERVICE_MASTER_DIRECTORY.filter(item => {
      if (activeCategory !== 'all') {
        if (activeCategory === 'esif' && item.category !== 'esif') return false;
        if (activeCategory === 'eff' && item.category !== 'eff') return false;
        if (activeCategory === 'etif' && item.category !== 'etif') return false;
        if (activeCategory === 'correction' && item.category !== 'correction') return false;
        if (activeCategory === 'grs' && item.category !== 'grs') return false;
        if (activeCategory === 'efiling' && item.category !== 'efiling') return false;
        if (activeCategory === 'sonali' && item.category !== 'sonali') return false;
        if (activeCategory === 'govt_portals' && item.category !== 'govt_portals') return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.shortDesc.toLowerCase().includes(q);
        const matchAuth = item.authority.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchAuth;
      }
      return true;
    });
  }, [activeCategory, searchTerm]);

  // Direct Print Recommendation Letter for Name/Age Correction on School Pad
  const handlePrintCorrectionRecommendation = () => {
    if (!correctionForm.studentNameBn.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন!');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('পপআপ উইন্ডো ব্লক হয়েছে। অনুগ্রহ করে ব্রাউজারে পপআপ অনুমোদন করুন।');
      return;
    }

    const memoNo = `মপা/সংশোধন/${new Date().getFullYear()}-${toBn(Math.floor(100 + Math.random() * 900))}`;
    const dateToday = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সংশোধন সুপারিশ প্রত্যয়নপত্র — ${correctionForm.studentNameBn}</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Nikosh', sans-serif; color: #0f172a; margin: 0; padding: 15px; }
          .pad-container { border: 2px solid #047857; padding: 25px 35px; border-radius: 8px; position: relative; }
          .memo-date-bar { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding: 8px 0; margin-top: 15px; font-size: 13.5px; font-weight: bold; }
          .cert-title { text-align: center; margin: 25px 0 20px; }
          .cert-title span { background: #047857; color: #fff; padding: 6px 30px; font-size: 17px; font-weight: 900; border-radius: 4px; display: inline-block; }
          .cert-subject { font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 20px; line-height: 1.6; border-left: 4px solid #047857; padding-left: 10px; }
          .cert-body { font-size: 14.5px; line-height: 2.1; color: #1e293b; text-align: justify; margin-bottom: 30px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 15px 0 25px; font-size: 13.5px; }
          .info-table th, .info-table td { border: 1px solid #cbd5e1; padding: 8px 12px; }
          .info-table th { background: #f1f5f9; text-align: left; width: 35%; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
          .signature-box { text-align: center; min-width: 200px; }
          .signature-line { border-top: 1.5px dashed #0f172a; margin-bottom: 6px; }
          .seal-box { border: 1.5px dashed #047857; color: #047857; padding: 10px 18px; font-size: 11px; font-weight: bold; border-radius: 50%; transform: rotate(-8deg); display: inline-block; }
          .pad-footer { border-top: 1px solid #cbd5e1; margin-top: 25px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="pad-container">
          ${SCHOOL_PAD_HEADER_HTML}

          <div class="memo-date-bar">
            <div>স্মারক নং: <b>${memoNo}</b></div>
            <div>তারিখ: <b>${dateToday} খ্রি.</b></div>
          </div>

          <div class="cert-title">
            <span>বোর্ড সনদ/নথিপত্র সংশোধন সুপারিশ প্রত্যয়নপত্র</span>
          </div>

          <div class="cert-subject">
            বিষয়: ঢাকা শিক্ষা বোর্ডের নথিতে ${correctionForm.targetCorrection} প্রসঙ্গে প্রাতিষ্ঠানিক সুপারিশপত্র।
          </div>

          <div class="cert-body">
            বরাবর,<br>
            সচিব / চেয়ারম্যান মহোদয়,<br>
            মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা।<br><br>

            মহোদয়,<br>
            বিনীত নিবেদন এই যে, অত্র বিদ্যালয়ের নিয়মিত/প্রাক্তন শিক্ষার্থী <b>${correctionForm.studentNameBn}</b> (${correctionForm.studentNameEn ? `ইংরেজি: ${correctionForm.studentNameEn}` : ''}), পিতা: <b>${correctionForm.fatherNameBn || '—'}</b>, মাতা: <b>${correctionForm.motherNameBn || '—'}</b>, রেজিস্ট্রেশন নং: <b>${toBn(correctionForm.regNo || '—')}</b>, বোর্ড নথিপত্রে ${correctionForm.targetCorrection}-এর জন্য আবেদন দাখিল করেছে।
            <br><br>
            বিদ্যালয়ের মূল ভর্তি রেজিস্টার, টিসি ভলিউম এবং অনলাইন জন্মনিবন্ধন সনদ যাচাই করে নিম্নরূপ তথ্য পাওয়া গেছে:
          </div>

          <table class="info-table">
            <tr>
              <th>সংশোধনের বিষয়:</th>
              <td><b>${correctionForm.targetCorrection}</b></td>
            </tr>
            <tr>
              <th>বোর্ডে বর্তমানে বিদ্যমান (ভুল) তথ্য:</th>
              <td style="color: #dc2626;"><b>${correctionForm.existingValue || '—'}</b></td>
            </tr>
            <tr>
              <th>আবেদনকৃত প্রকৃত (সঠিক) তথ্য:</th>
              <td style="color: #047857;"><b>${correctionForm.proposedValue || '—'}</b></td>
            </tr>
            <tr>
              <th>ভুল হওয়ার কারণ ও মন্তব্য:</th>
              <td>${correctionForm.reason || 'প্রাথমিক ডাটা এন্ট্রিকালীন অনবধানতাবশত অনিচ্ছাকৃত মুদ্রণজনিত ভুল।'}</td>
            </tr>
          </table>

          <div class="cert-body">
            অতএব, শিক্ষার্থীর দাখিলকৃত অনলাইন জন্মসনদ, পিতা-মাতার এনআইডি ও এফিডেভিট পর্যালোচনাপূর্বক উল্লেখিত তথ্য সংশোধনের জন্য মহোদয়ের সদয় বিবেচনা ও প্রয়োজনীয় নির্দেশ প্রদানের জন্য বিশেষভাবে সুপারিশ করা হলো।
          </div>

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
              <div style="font-size: 14.5px; font-weight: 800;">(মুহাম্মদ শফিকুল ইসলাম)</div>
              <div style="font-size: 12.5px; color: #475569;">প্রধান শিক্ষক</div>
              <div style="font-size: 12px; color: #64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
              <div style="font-size: 11px; color: #047857;">কালিহাতী, টাঙ্গাইল • EIIN: 114290</div>
            </div>
          </div>

          <div class="pad-footer">
            <div>সংযুক্তি: ১. অনলাইন জন্মসনদ ২. পিতা-মাতার এনআইডি ৩. কোর্ট এফিডেভিট ৪. পত্রিকা কাটিং।</div>
            <div>স্মার্ট স্কুল ম্যানেজমেন্ট সিস্টেম ও ই-সেবা কেন্দ্র</div>
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

  // Submit GRS Complaint Form
  const handleSubmitGrs = (e) => {
    e.preventDefault();
    if (!grsForm.subject.trim() || !grsForm.details.trim()) {
      alert('অনুগ্রহ করে অভিযোগের বিষয় ও বিস্তারিত বিবরণ লিখুন!');
      return;
    }
    const token = `GRS-MAGRA-${Date.now().toString().slice(-6)}`;
    const newComplaint = {
      token,
      ...grsForm,
      date: new Date().toISOString().slice(0, 10),
      status: 'তদন্তাধীন (Under Review)'
    };

    try {
      const stored = JSON.parse(localStorage.getItem(ESERVICE_GRS_KEY) || '[]');
      localStorage.setItem(ESERVICE_GRS_KEY, JSON.stringify([newComplaint, ...stored]));
    } catch {}

    setGrsToken(token);
    alert(`✓ আপনার অভিযোগটি সফলভাবে জমা হয়েছে! আপনার ট্র্যাকিং টোকেন নম্বর: ${token}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', color: '#1e293b' }}>
      {/* ================= HEADER BAR ================= */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        color: '#ffffff',
        padding: '18px 24px',
        borderBottom: '2px solid #059669',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '32px',
            background: 'rgba(255,255,255,0.18)',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            🌐
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              <span>🏛️</span> সরকারি ও প্রাতিষ্ঠানিক ডিজিটাল সেবা প্ল্যাটফর্ম
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '0.3px' }}>
              ই-সেবা কেন্দ্র (E-Service Center)
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#a7f3d0' }}>
              eSIF, eFF, eTIF, নাম ও বয়স সংশোধন, অভিযোগ প্রতিকার (GRS), ই-ফাইলিং ও সোনালী সেবা সহ কেন্দ্রীয় লিংক ও তথ্য ভাণ্ডার
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '17px',
              display: 'grid',
              placeItems: 'center'
            }}
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ================= CATEGORY TABS & SEARCH BAR ================= */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'সকল ই-সেবা', icon: '🌐' },
            { id: 'esif', label: 'eSIF রেজিস্ট্রেশন', icon: '📝' },
            { id: 'eff', label: 'eFF ফরম ফিলাপ', icon: '✍️' },
            { id: 'etif', label: 'eTIF শিক্ষক তথ্য', icon: '👨‍🏫' },
            { id: 'correction', label: 'নাম ও বয়স সংশোধন', icon: '🛠️' },
            { id: 'grs', label: 'অভিযোগ প্রতিকার (GRS)', icon: '⚖️' },
            { id: 'efiling', label: 'ই-ফাইলিং / ডি-নথি', icon: '📂' },
            { id: 'sonali', label: 'সোনালী সেবা', icon: '💳' },
            { id: 'govt_portals', label: 'সরকারি অন্যান্য পোর্টাল', icon: '🏛️' }
          ].map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveCategory(tab.id); setSelectedService(null); }}
                style={{
                  padding: '7px 13px',
                  borderRadius: '7px',
                  border: isActive ? '1.5px solid #047857' : '1px solid #cbd5e1',
                  background: isActive ? '#047857' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search Box */}
        <div style={{ minWidth: '220px', flex: '1 1 auto', maxWidth: '320px', position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="🔍 ই-সেবা বা বোর্ড সেবার নাম দিয়ে খুঁজুন..."
            style={{
              width: '100%',
              padding: '7px 12px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              background: '#f8fafc'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ================= MAIN CONTENT BODY ================= */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
        {/* Banner with Hotline & Helpdesk */}
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1.5px solid #a7f3d0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>💡</span>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#065f46' }}>
                ডিজিটাল শিক্ষা সেবা ও বোর্ড অনলাইন হেল্পডেস্ক
              </div>
              <div style={{ fontSize: '11.5px', color: '#047857' }}>
                যেকোনো সেবার লিংকে সরাসরি প্রবেশ করে অফিসিয়াল কাজ সম্পন্ন করতে পারবেন। প্রয়োজনে বিদ্যালয়ের আইসিটি শিক্ষক বা অফিস সহকারীর সহায়তা নিন।
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://dhakaeducationboard.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#047857',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🏛️ ঢাকা শিক্ষা বোর্ড ➔</span>
            </a>
            <a
              href="https://emis.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0284c7',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>📊 মাউশি EMIS ➔</span>
            </a>
          </div>
        </div>

        {/* ================= CONDITIONAL SECTIONS ================= */}

        {/* 1. NAME & AGE CORRECTION INTERACTIVE ASSISTANT */}
        {activeCategory === 'correction' && (
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛠️</span> নাম ও বয়স সংশোধন — প্রাতিষ্ঠানিক সুপারিশ প্রত্যয়নপত্র জেনারেটর
              </h3>
              <span style={{ fontSize: '11.5px', background: '#dcfce7', color: '#15803d', padding: '3px 9px', borderRadius: '12px', fontWeight: 700 }}>
                বিদ্যালয়ের প্যাডে সরাসরি প্রিন্ট
              </span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
              ঢাকা শিক্ষা বোর্ডে নাম বা বয়স সংশোধনের অনলাইন আবেদনের জন্য প্রধান শিক্ষকের অফিসিয়াল সুপারিশপত্র ও প্রত্যয়ন বাধ্যতামূলক। নিচের তথ্যগুলো পূরণ করে সরাসরি প্রিন্ট করুন:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  শিক্ষার্থীর নাম (বাংলায়): *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ সাকিব আল হাসান"
                  value={correctionForm.studentNameBn}
                  onChange={e => setCorrectionForm({ ...correctionForm, studentNameBn: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  শিক্ষার্থীর নাম (ইংরেজিতে - বড় হাত):
                </label>
                <input
                  type="text"
                  placeholder="MD. SHAKIB AL HASAN"
                  value={correctionForm.studentNameEn}
                  onChange={e => setCorrectionForm({ ...correctionForm, studentNameEn: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  সংশোধনের বিষয়:
                </label>
                <select
                  value={correctionForm.targetCorrection}
                  onChange={e => setCorrectionForm({ ...correctionForm, targetCorrection: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                >
                  <option value="নিজের নামের বানান সংশোধন">নিজের নামের বানান সংশোধন</option>
                  <option value="পিতার নামের বানান সংশোধন">পিতার নামের বানান সংশোধন</option>
                  <option value="মাতার নামের বানান সংশোধন">মাতার নামের বানান সংশোধন</option>
                  <option value="জন্মতারিখ ও বয়স সংশোধন">জন্মতারিখ ও বয়স সংশোধন</option>
                  <option value="নাম ও বয়স উভয় সংশোধন">নাম ও বয়স উভয় সংশোধন</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  বোর্ড রেজিস্ট্রেশন নম্বর:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: 2110293845"
                  value={correctionForm.regNo}
                  onChange={e => setCorrectionForm({ ...correctionForm, regNo: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#b91c1c', marginBottom: '4px' }}>
                  বর্তমানে সনদে যা আছে (ভুল তথ্য):
                </label>
                <input
                  type="text"
                  placeholder="ভুল নাম বা তারিখ লিখুন..."
                  value={correctionForm.existingValue}
                  onChange={e => setCorrectionForm({ ...correctionForm, existingValue: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1.5px solid #f87171', borderRadius: '6px', background: '#fef2f2' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
                  আবেদনকৃত সঠিক তথ্য (যা হতে হবে):
                </label>
                <input
                  type="text"
                  placeholder="অনলাইন জন্মসনদ বা এনআইডি অনুযায়ী সঠিক রূপ..."
                  value={correctionForm.proposedValue}
                  onChange={e => setCorrectionForm({ ...correctionForm, proposedValue: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1.5px solid #34d399', borderRadius: '6px', background: '#f0fdf4' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={handlePrintCorrectionRecommendation}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(4,120,87,0.2)'
                }}
              >
                <span>🖨️ বিদ্যালয়ের প্যাডে সুপারিশপত্র প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. GRS ONLINE GRIEVANCE REDRESS ASSISTANT */}
        {activeCategory === 'grs' && (
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚖️</span> অভিযোগ প্রতিকার ব্যবস্থা (GRS) — অনলাইন অভিযোগ ও মতামত বক্স
              </h3>
              <a
                href="https://grs.gov.bd/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#047857', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
              >
                জাতীয় GRS পোর্টাল ➔
              </a>
            </div>

            <form onSubmit={handleSubmitGrs} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    অভিযোগকারীর নাম (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    placeholder="নাম প্রকাশে অনিচ্ছুক হলে ফাঁকা রাখুন"
                    value={grsForm.complainantName}
                    onChange={e => setGrsForm({ ...grsForm, complainantName: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    যোগাযোগের মোবাইল নম্বর:
                  </label>
                  <input
                    type="text"
                    placeholder="017xxxxxxxx"
                    value={grsForm.phone}
                    onChange={e => setGrsForm({ ...grsForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    সেবার ক্ষেত্র / ধরন:
                  </label>
                  <select
                    value={grsForm.category}
                    onChange={e => setGrsForm({ ...grsForm, category: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                  >
                    <option value="একাডেমিক সেবা">একাডেমিক ও পাঠদান সেবা</option>
                    <option value="প্রশাসনিক সেবা">অফিস ও প্রশাসনিক সেবা</option>
                    <option value="ভর্তি ও পরীক্ষা">ভর্তি ও পরীক্ষা সংক্রান্ত</option>
                    <option value="উপবৃত্তি ও ফি">উপবৃত্তি ও ফি সংক্রান্ত</option>
                    <option value="শৃঙ্খলা ও পরিবেশ">শৃঙ্খলা ও পরিবেশ সংক্রান্ত</option>
                    <option value="অন্যান্য পরামর্শ">গঠনমূলক পরামর্শ</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  অভিযোগের বিষয় / শিরোনাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="সংক্ষেপে অভিযোগের মূল বিষয় লিখুন..."
                  value={grsForm.subject}
                  onChange={e => setGrsForm({ ...grsForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  বিস্তারিত বিবরণ: *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="ঘটনার তারিখ, সংশ্লিষ্ট তথ্য ও আপনার প্রত্যাশিত সমাধানের বিবরণ দিন..."
                  value={grsForm.details}
                  onChange={e => setGrsForm({ ...grsForm, details: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  🔒 আপনার তথ্য ও গোপনীয়তা প্রশাসনিক নীতি অনুযায়ী সুরক্ষিত থাকবে।
                </span>
                <button
                  type="submit"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 22px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ✓ অভিযোগ দাখিল করুন
                </button>
              </div>

              {grsToken && (
                <div style={{ marginTop: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#065f46' }}>
                  🎉 আপনার অভিযোগটি গ্রহণ করা হয়েছে। ট্র্যাকিং টোকেন: <b>{grsToken}</b>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ================= E-SERVICES CARDS DIRECTORY GRID ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                {/* Card Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                  <div style={{
                    fontSize: '26px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    {srv.icon}
                  </div>
                  <span style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '12px'
                  }}>
                    {srv.badge}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4' }}>
                  {srv.title}
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                  {srv.shortDesc}
                </p>

                {/* Authority & Fee */}
                <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div>🏛️ <b>কর্তৃপক্ষ:</b> {srv.authority}</div>
                  <div>💰 <b>ফি বিবরণ:</b> <span style={{ color: '#047857', fontWeight: 700 }}>{srv.fee}</span></div>
                </div>

                {/* Requirements Checklist preview */}
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    📋 প্রয়োজনীয় নথিপত্র:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6' }}>
                    {srv.requirements.slice(0, 2).map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                    {srv.requirements.length > 2 && (
                      <li style={{ color: '#047857', fontWeight: 700 }}>+ আরও {toBn(srv.requirements.length - 2)}টি নথি...</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedService(srv)}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    color: '#065f46',
                    border: '1px solid #cbd5e1',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ℹ️ বিস্তারিত তথ্য
                </button>

                <a
                  href={srv.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1.2,
                    background: '#047857',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    textAlign: 'center'
                  }}
                >
                  <span>অনলাইন পোর্টাল</span>
                  <span>➔</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SERVICE DETAIL MODAL POPUP ================= */}
      {selectedService && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div style={{
              background: '#047857',
              color: '#fff',
              padding: '16px 20px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {selectedService.icon} {selectedService.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                {selectedService.shortDesc}
              </p>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ fontSize: '12.5px', marginBottom: '4px' }}>🏛️ <b>পরিচালক কর্তৃপক্ষ:</b> {selectedService.authority}</div>
                <div style={{ fontSize: '12.5px' }}>💰 <b>ফি সংক্রান্ত নিয়মাবলী:</b> <span style={{ color: '#047857', fontWeight: 700 }}>{selectedService.fee}</span></div>
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                📋 দাখিলযোগ্য প্রয়োজনীয় কাগজপত্র ও ডকুমেন্টস:
              </h4>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '12.5px', color: '#334155', lineHeight: '1.8' }}>
                {selectedService.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                💡 গুরুত্বপূর্ণ দিকনির্দেশনা ও নিয়মাবলী:
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.6', background: '#ecfdf5', padding: '10px 14px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                {selectedService.guidelines}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  বন্ধ করুন
                </button>
                <a
                  href={selectedService.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>অনলাইন পোর্টালে সরাসরি যান</span>
                  <span>➔</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EServiceCenterModalSection;

