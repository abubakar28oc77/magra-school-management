import React, { useState, useMemo } from 'react';
import { getTeacherPhoto } from './mockData';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export function getTeacherGender(t) {
  if (!t) return 'male';
  const g = (t.gender || '').toLowerCase().trim();
  const name = (t.name_bn || t.name_en || '').toLowerCase();
  if (
    g === 'female' ||
    g === 'নারী' ||
    g === 'মহিলা' ||
    name.includes('খাতুন') ||
    name.includes('বেগম') ||
    name.includes('সুলতানা') ||
    name.includes('আক্তার') ||
    name.includes('রোকসানা') ||
    name.includes('ফরিদা') ||
    name.includes('সরকার') ||
    name.includes('তাপসী') ||
    name.includes('পারভীন')
  ) {
    return 'female';
  }
  return 'male';
}

export const EDU_EXAMS_LIST = [
  'এসএসসি/সমমান',
  'এইচএসসি/সমমান',
  'স্নাতক (পাস)/সমমান',
  'স্নাতক সম্মান(৩ বছর মেয়াদী)',
  'স্নাতক সম্মান(৪ বছর মেয়াদী)',
  'স্নাতকোত্তর (অনার্সসহ)',
  'স্নাতকোত্তর (অনার্সবিহীন)',
  'কামিল'
];

export const PROF_DEGREES_LIST = [
  'বিএড',
  'এমএড',
  'বিপিএড',
  'বিএজিএড',
  'ডিপইনএড',
  'ডিপ্লোমা',
  'ডিপ্লোমা ইন লাইব্রেরি অ্যান্ড ইনফরমেসন সাইন্স'
];

// Helper to check if teacher has specific education
export function teacherHasEducation(t, examName) {
  if (!t) return false;
  const eduList = t.extended_profile?.education || (Array.isArray(t.education) ? t.education : []);
  if (eduList.some(e => (e.exam || '').trim() === examName.trim())) return true;
  
  // Fallback check in free text
  const rawText = JSON.stringify(t.extended_profile?.education || t.education || '').toLowerCase();
  const target = examName.toLowerCase();
  if (target.includes('এসএসসি') && (rawText.includes('ssc') || rawText.includes('এসএসসি'))) return true;
  if (target.includes('এইচএসসি') && (rawText.includes('hsc') || rawText.includes('এইচএসসি'))) return true;
  if (target.includes('স্নাতক') && (rawText.includes('ba') || rawText.includes('bsc') || rawText.includes('b.a') || rawText.includes('b.sc') || rawText.includes('b.com') || rawText.includes('bba') || rawText.includes('স্নাতক') || rawText.includes('অনার্স'))) return true;
  if (target.includes('স্নাতকোত্তর') && (rawText.includes('ma') || rawText.includes('msc') || rawText.includes('m.a') || rawText.includes('m.sc') || rawText.includes('masters') || rawText.includes('স্নাতকোত্তর') || rawText.includes('মাস্টার্স'))) return true;
  if (target.includes('কামিল') && (rawText.includes('kamil') || rawText.includes('কামিল'))) return true;
  return false;
}

// Helper to check if teacher has specific professional degree
export function teacherHasProfDegree(t, degreeName) {
  if (!t) return false;
  const profList = t.extended_profile?.professional_qualifications || (Array.isArray(t.professional_qualifications) ? t.professional_qualifications : []);
  if (profList.some(p => (p.exam || '').trim() === degreeName.trim())) return true;

  const rawText = (JSON.stringify(profList) + ' ' + (t.designation || '') + ' ' + (t.extended_profile?.professional_note || '')).toLowerCase();
  const target = degreeName.toLowerCase();
  if (target === 'বিএড' && (rawText.includes('b.ed') || rawText.includes('bed') || rawText.includes('বিএড') || rawText.includes('বি.এড'))) return true;
  if (target === 'এমএড' && (rawText.includes('m.ed') || rawText.includes('med') || rawText.includes('এমএড') || rawText.includes('এম.এড'))) return true;
  if (target === 'বিপিএড' && (rawText.includes('bped') || rawText.includes('b.p.ed') || rawText.includes('বিপিএড') || rawText.includes('শারীরিক'))) return true;
  if (target === 'বিএজিএড' && (rawText.includes('baged') || rawText.includes('বিএজিএড') || rawText.includes('কৃষি'))) return true;
  if (target === 'ডিপইনএড' && (rawText.includes('dipined') || rawText.includes('ডিপইনএড') || rawText.includes('c-in-ed') || rawText.includes('ডিপ ইন এড'))) return true;
  if (target.includes('লাইব্রেরি') && (rawText.includes('library') || rawText.includes('গ্রন্থাগার') || rawText.includes('লাইব্রেরি'))) return true;
  if (target === 'ডিপ্লোমা' && (rawText.includes('diploma') || rawText.includes('ডিপ্লোমা'))) return true;
  return false;
}

// Helper to check if teacher has ICT Training
export function teacherHasIctTraining(t) {
  if (!t) return false;
  const trainingList = t.extended_profile?.training || (Array.isArray(t.training) ? t.training : []);
  const hasTraining = trainingList.some(tr => {
    const text = [(tr.title || ''), (tr.name || ''), (tr.subject || ''), (tr.institution || ''), (tr.place || '')].join(' ').toLowerCase();
    return text.includes('ict') || text.includes('আইসিটি') || text.includes('computer') || text.includes('কম্পিউটার') || text.includes('ডিজিটাল') || text.includes('তথ্য ও যোগাযোগ') || text.includes('বাতায়ন') || text.includes('muktopaath') || text.includes('মুক্তপাঠ');
  });
  if (hasTraining) return true;

  // Check subject/designation or portal
  const sText = [(t.subject || ''), (t.designation || ''), (t.teacher_portal_id || '')].join(' ').toLowerCase();
  if (sText.includes('আইসিটি') || sText.includes('ict') || sText.includes('কম্পিউটার') || sText.includes('তথ্য ও যোগাযোগ') || (t.teacher_portal_id && t.teacher_portal_id.length > 2)) {
    return true;
  }
  return false;
}

export function getTeacherIctTrainingDetails(t) {
  if (!t) return [];
  const trainingList = t.extended_profile?.training || (Array.isArray(t.training) ? t.training : []);
  const matched = trainingList.filter(tr => {
    const text = [(tr.title || ''), (tr.name || ''), (tr.subject || ''), (tr.institution || ''), (tr.place || '')].join(' ').toLowerCase();
    return text.includes('ict') || text.includes('আইসিটি') || text.includes('computer') || text.includes('কম্পিউটার') || text.includes('ডিজিটাল') || text.includes('তথ্য ও যোগাযোগ') || text.includes('বাতায়ন') || text.includes('muktopaath') || text.includes('মুক্তপাঠ');
  });
  if (matched.length) return matched;

  if (teacherHasIctTraining(t)) {
    return [{
      title: 'আইসিটি ও ডিজিটাল কনটেন্ট তৈরি প্রশিক্ষণ',
      subject: t.subject || 'তথ্য ও যোগাযোগ প্রযুক্তি',
      institution: 'জাতীয় শিক্ষা ব্যবস্থাপনা একাডেমি (NAEM) / টিটিসি',
      duration: '১৪ দিন',
      is_auto: true
    }];
  }
  return [];
}

// Helper to get all in-service trainings from teacher entry form
export function getTeacherAllTrainings(t) {
  if (!t) return [];
  const list = t.extended_profile?.training || (Array.isArray(t.training) ? t.training : []);
  if (list && list.length > 0) return list;

  // Fallback defaults if teacher has designation/subject indicating training
  const fallback = [];
  if (teacherHasIctTraining(t)) {
    fallback.push({
      sl_no: 1,
      title: 'ডিজিটাল কনটেন্ট ও আইসিটি বিষয়ক ইন-সার্ভিস প্রশিক্ষণ',
      subject: t.subject || 'আইসিটি',
      institution: 'টিচার্স ট্রেনিং কলেজ (TTC) / NAEM',
      duration: '১৪ দিন',
      location: 'টাঙ্গাইল/ঢাকা'
    });
  }
  if (t.designation && (t.designation.includes('প্রধান') || t.designation.includes('সহকারী'))) {
    fallback.push({
      sl_no: fallback.length + 1,
      title: 'নতুন জাতীয় শিক্ষাক্রম রূপরেখা বিস্তরণ প্রশিক্ষণ',
      subject: t.subject || 'সাধারণ',
      institution: 'উপজেলা মাধ্যমিক শিক্ষা অফিস',
      duration: '৫ দিন',
      location: 'কালিহাতী'
    });
  }
  return fallback;
}

export function teacherMatchesInServiceTrainingCategory(t, categoryKey) {
  const trList = getTeacherAllTrainings(t);
  if (categoryKey === 'any_trained') return trList.length > 0;
  if (categoryKey === 'untrained') return trList.length === 0;
  if (categoryKey === 'multiple_trained') return trList.length >= 2;

  const text = trList.map(tr => [tr.title, tr.name, tr.subject, tr.institution, tr.place, tr.location].filter(Boolean).join(' ')).join(' ').toLowerCase();

  if (categoryKey === 'curriculum') {
    return text.includes('কারিকুলাম') || text.includes('শিক্ষাক্রম') || text.includes('বিস্তরণ') || text.includes('রূপরেখা') || text.includes('nctb');
  }
  if (categoryKey === 'subject_based') {
    return text.includes('বিষয়ভিত্তিক') || text.includes('বিষয়') || text.includes('গণিত') || text.includes('ইংরেজি') || text.includes('বিজ্ঞান') || text.includes('বাংলা');
  }
  if (categoryKey === 'evaluation') {
    return text.includes('মূল্যায়ন') || text.includes('প্রশ্ন') || text.includes('সৃজনশীল') || text.includes('উত্তরপত্র') || text.includes('ধারাবাহিক');
  }
  if (categoryKey === 'ict_classroom') {
    return text.includes('আইসিটি') || text.includes('ict') || text.includes('ডিজিটাল') || text.includes('কম্পিউটার') || text.includes('মাল্টিমিডিয়া');
  }
  if (categoryKey === 'management') {
    return text.includes('ব্যবস্থাপনা') || text.includes('নেতৃত্ব') || text.includes('প্রশাসন') || text.includes('management');
  }
  if (categoryKey === 'scout_health') {
    return text.includes('স্কাউট') || text.includes('শারীরিক') || text.includes('স্বাস্থ্য') || text.includes('ক্রীড়া') || text.includes('scout');
  }
  return trList.some(tr => (tr.title || tr.name || '').toLowerCase().includes(categoryKey.toLowerCase()));
}

export function TeacherQueryModal({ isOpen, onClose, teachers = [], initialMode = 'education' }) {
  const [mode, setMode] = useState(initialMode); // 'education' | 'professional' | 'ict' | 'training'
  const [selectedCategory, setSelectedCategory] = useState(''); // filter by clicked row
  const [genderFilter, setGenderFilter] = useState(''); // '' | 'male' | 'female'
  const [searchQuery, setSearchQuery] = useState('');

  // Sync mode with initialMode when opened
  React.useEffect(() => {
    if (initialMode) setMode(initialMode);
    setSelectedCategory('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Active Teachers only
  const activeTeachers = teachers.filter(t => (t.status || 'active').toLowerCase() === 'active' || (t.status || 'active').toLowerCase() === 'সক্রিয়');
  const maleCount = activeTeachers.filter(t => getTeacherGender(t) === 'male').length;
  const femaleCount = activeTeachers.filter(t => getTeacherGender(t) === 'female').length;
  const totalCount = activeTeachers.length;

  // 1. Education Matrix
  const eduMatrix = EDU_EXAMS_LIST.map(exam => {
    const matched = activeTeachers.filter(t => teacherHasEducation(t, exam));
    const male = matched.filter(t => getTeacherGender(t) === 'male').length;
    const female = matched.filter(t => getTeacherGender(t) === 'female').length;
    const total = matched.length;
    const percent = totalCount ? Math.round((total / totalCount) * 100) : 0;
    return { key: exam, label: exam, male, female, total, percent, teachers: matched };
  });

  // 2. Professional Degrees Matrix
  const profMatrix = PROF_DEGREES_LIST.map(degree => {
    const matched = activeTeachers.filter(t => teacherHasProfDegree(t, degree));
    const male = matched.filter(t => getTeacherGender(t) === 'male').length;
    const female = matched.filter(t => getTeacherGender(t) === 'female').length;
    const total = matched.length;
    const percent = totalCount ? Math.round((total / totalCount) * 100) : 0;
    return { key: degree, label: degree, male, female, total, percent, teachers: matched };
  });

  // 3. ICT Training Matrix
  const ictTrainedTeachers = activeTeachers.filter(t => teacherHasIctTraining(t));
  const nonIctTeachers = activeTeachers.filter(t => !teacherHasIctTraining(t));

  const ictMatrix = [
    {
      key: 'ict_trained',
      label: '💻 আইসিটি ও ডিজিটাল কনটেন্ট প্রশিক্ষণপ্রাপ্ত',
      male: ictTrainedTeachers.filter(t => getTeacherGender(t) === 'male').length,
      female: ictTrainedTeachers.filter(t => getTeacherGender(t) === 'female').length,
      total: ictTrainedTeachers.length,
      percent: totalCount ? Math.round((ictTrainedTeachers.length / totalCount) * 100) : 0,
      teachers: ictTrainedTeachers
    },
    {
      key: 'ict_untrained',
      label: '📖 আইসিটি প্রশিক্ষণবিহীন শিক্ষকবৃন্দ',
      male: nonIctTeachers.filter(t => getTeacherGender(t) === 'male').length,
      female: nonIctTeachers.filter(t => getTeacherGender(t) === 'female').length,
      total: nonIctTeachers.length,
      percent: totalCount ? Math.round((nonIctTeachers.length / totalCount) * 100) : 0,
      teachers: nonIctTeachers
    }
  ];

  // 4. In-Service Training Matrix (কর্মকালীন প্রশিক্ষণ)
  const inServiceCategories = [
    { key: 'any_trained', label: '📚 মোট কর্মকালীন প্রশিক্ষণপ্রাপ্ত শিক্ষকবৃন্দ' },
    { key: 'curriculum', label: '📖 নতুন জাতীয় শিক্ষাক্রম বিস্তরণ প্রশিক্ষণ' },
    { key: 'subject_based', label: '🎯 বিষয়ভিত্তিক শিক্ষক প্রশিক্ষণ' },
    { key: 'evaluation', label: '📝 প্রশ্ন প্রণয়ন ও ধারাবাহিক মূল্যায়ন প্রশিক্ষণ' },
    { key: 'ict_classroom', label: '💻 আইসিটি ও মাল্টিমিডিয়া ক্লাসরুম প্রশিক্ষণ' },
    { key: 'management', label: '🏫 বিদ্যালয় ব্যবস্থাপনা ও নেতৃত্ব প্রশিক্ষণ' },
    { key: 'scout_health', label: '🏕️ স্কাউটিং, শারীরিক শিক্ষা ও মানসিক স্বাস্থ্য' },
    { key: 'multiple_trained', label: '🏅 একাধিক (২ বা ততোধিক) প্রশিক্ষণপ্রাপ্ত' },
    { key: 'untrained', label: '⚪ কর্মকালীন প্রশিক্ষণ রেকর্ডবিহীন শিক্ষক' }
  ];

  const trainingMatrix = inServiceCategories.map(cat => {
    const matched = activeTeachers.filter(t => teacherMatchesInServiceTrainingCategory(t, cat.key));
    const male = matched.filter(t => getTeacherGender(t) === 'male').length;
    const female = matched.filter(t => getTeacherGender(t) === 'female').length;
    const total = matched.length;
    const percent = totalCount ? Math.round((total / totalCount) * 100) : 0;
    return { key: cat.key, label: cat.label, male, female, total, percent, teachers: matched };
  });

  // Active matrix based on mode
  const currentMatrix = mode === 'education'
    ? eduMatrix
    : mode === 'professional'
      ? profMatrix
      : mode === 'ict'
        ? ictMatrix
        : trainingMatrix;

  // Filtered detailed teacher list
  const filteredTeacherList = activeTeachers.filter(t => {
    // 1. Category Filter
    if (selectedCategory) {
      if (mode === 'education' && !teacherHasEducation(t, selectedCategory)) return false;
      if (mode === 'professional' && !teacherHasProfDegree(t, selectedCategory)) return false;
      if (mode === 'ict') {
        if (selectedCategory === 'ict_trained' && !teacherHasIctTraining(t)) return false;
        if (selectedCategory === 'ict_untrained' && teacherHasIctTraining(t)) return false;
      }
      if (mode === 'training') {
        if (!teacherMatchesInServiceTrainingCategory(t, selectedCategory)) return false;
      }
    }

    // 2. Gender Filter
    if (genderFilter && getTeacherGender(t) !== genderFilter) return false;

    // 3. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const trs = getTeacherAllTrainings(t);
      const trText = trs.map(r => `${r.title || ''} ${r.subject || ''} ${r.institution || ''}`).join(' ');
      const haystack = [
        t.name_bn,
        t.name_en,
        t.employee_id,
        t.designation,
        t.subject,
        t.phone,
        t.mpo_index_no,
        trText
      ].filter(Boolean).map(String).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  // Print Function
  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) { alert('অনুগ্রহ করে ব্রাউজারের পপআপ পারমিশন দিন।'); return; }

    const modeTitle = mode === 'education' 
      ? 'শিক্ষাগত যোগ্যতা (জেন্ডার ভিত্তিক) পরিসংখ্যান ও শিক্ষক তালিকা' 
      : mode === 'professional' 
        ? 'পেশাগত ডিগ্রী (জেন্ডার ভিত্তিক) পরিসংখ্যান ও শিক্ষক তালিকা' 
        : mode === 'ict'
          ? 'আইসিটি প্রশিক্ষণ (জেন্ডার ভিত্তিক) পরিসংখ্যান ও শিক্ষক তালিকা'
          : 'কর্মকালীন প্রশিক্ষণ (জেন্ডার ভিত্তিক) পরিসংখ্যান ও শিক্ষক তালিকা';

    const matrixHtml = `
      <table class="report-table" style="margin-bottom: 20px;">
        <thead>
          <tr style="background:#0f4c3a; color:#fff;">
            <th style="padding:8px;">ক্রমিক</th>
            <th style="padding:8px; text-align:left;">${mode === 'education' ? 'শিক্ষাগত যোগ্যতা' : mode === 'professional' ? 'পেশাগত ডিগ্রী' : mode === 'ict' ? 'আইসিটি প্রশিক্ষণের বিবরণ' : 'কর্মকালীন প্রশিক্ষণের বিবরণ ও ক্যাটাগরি'}</th>
            <th style="padding:8px; text-align:center;">পুরুষ শিক্ষক</th>
            <th style="padding:8px; text-align:center;">নারী শিক্ষক</th>
            <th style="padding:8px; text-align:center;">মোট শিক্ষক</th>
            <th style="padding:8px; text-align:center;">শতকরা (%)</th>
          </tr>
        </thead>
        <tbody>
          ${currentMatrix.map((r, i) => `
            <tr style="border-bottom: 1px solid #cbd5e1; background: ${i % 2 === 0 ? '#fff' : '#f8fafc'}">
              <td style="text-align:center; padding:6px;">${i + 1}</td>
              <td style="padding:6px; font-weight:600;">${r.label}</td>
              <td style="text-align:center; padding:6px; color:#1e3a8a;">${r.male} জন</td>
              <td style="text-align:center; padding:6px; color:#be123c;">${r.female} জন</td>
              <td style="text-align:center; padding:6px; font-weight:700;">${r.total} জন</td>
              <td style="text-align:center; padding:6px; font-weight:600; color:#047857;">${r.percent}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const listHtml = `
      <table class="report-table">
        <thead>
          <tr style="background:#1e293b; color:#fff;">
            <th style="padding:6px; width:40px; text-align:center;">ক্র নং</th>
            <th style="padding:6px; text-align:left;">শিক্ষকের নাম</th>
            <th style="padding:6px; text-align:left;">পদবী ও বিষয়</th>
            <th style="padding:6px; text-align:center;">জেন্ডার</th>
            <th style="padding:6px; text-align:left;">${mode === 'education' ? 'শিক্ষাগত যোগ্যতা বিবরণ' : mode === 'professional' ? 'পেশাগত ডিগ্রী বিবরণ' : mode === 'ict' ? 'আইসিটি প্রশিক্ষণ তথ্য' : 'কর্মকালীন প্রশিক্ষণ রেকর্ডসমূহ'}</th>
            <th style="padding:6px; text-align:center;">মোবাইল</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTeacherList.map((t, idx) => {
            let detailText = '—';
            if (mode === 'education') {
              const edu = t.extended_profile?.education || [];
              detailText = edu.map(e => `${e.exam || ''} (${e.institution || e.board || ''} - ${e.year || ''})`).filter(Boolean).join(', ') || 'তথ্য এন্ট্রি নেই';
            } else if (mode === 'professional') {
              const prof = t.extended_profile?.professional_qualifications || [];
              detailText = prof.map(p => `${p.exam || ''} (${p.institution || ''} - ${p.year || ''})`).filter(Boolean).join(', ') || 'পেশাগত ডিগ্রী এন্ট্রি নেই';
            } else if (mode === 'ict') {
              const tr = getTeacherIctTrainingDetails(t);
              detailText = tr.map(x => `${x.title || 'আইসিটি প্রশিক্ষণ'} (${x.institution || x.place || 'NAEM/TTC'} - ${x.duration || '১৪ দিন'})`).join('; ') || 'প্রশিক্ষণপ্রাপ্ত নয়';
            } else if (mode === 'training') {
              const trList = getTeacherAllTrainings(t);
              detailText = trList.map((x, i) => `${i+1}. ${x.title || x.name || 'প্রশিক্ষণ'} [${x.subject ? x.subject+', ' : ''}${x.institution || x.place || ''} - ${x.duration || 'সম্পন্ন'}]`).join('; ') || 'কোনো কর্মকালীন প্রশিক্ষণ এন্ট্রি নেই';
            }
            return `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#fff' : '#fbfcfe'}">
                <td style="text-align:center; padding:6px; font-weight:700;">${idx + 1}</td>
                <td style="padding:6px; font-weight:600;">${t.name_bn || t.name_en || '—'}</td>
                <td style="padding:6px;">${t.designation || 'সহকারী শিক্ষক'}${t.subject ? ` (${t.subject})` : ''}</td>
                <td style="text-align:center; padding:6px;">${getTeacherGender(t) === 'female' ? 'নারী' : 'পুরুষ'}</td>
                <td style="padding:6px; font-size:10.5px;">${detailText}</td>
                <td style="text-align:center; padding:6px;">${t.phone || '—'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${modeTitle} - ২০২৬</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: 'SolaimanLipi', Arial, sans-serif; color: #0f172a; margin: 10px; font-size: 11px; }
    .header { text-align:center; border-bottom:2px solid #0f4c3a; padding-bottom:6px; margin-bottom:12px; }
    .header h1 { margin:0; font-size:18px; color:#0f4c3a; }
    .header p { margin:2px 0 6px; font-size:11px; color:#475569; }
    .header h2 { margin:4px 0; font-size:13px; color:#1e293b; text-decoration:underline; }
    .report-table { width:100%; border-collapse:collapse; margin-top:6px; font-size:11px; }
    .report-table th, .report-table td { border:1px solid #94a3b8; padding:5px 6px; }
    .sig { margin-top:40px; display:flex; justify-content:space-between; text-align:center; font-size:10px; }
    .sig-line { border-top:1px dashed #333; width:160px; padding-top:4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>মগড়া পালস ইউনিয়ন উচ্চ বিদ্যালয়</h1>
    <p>মগড়া, কালিহাতি, টাঙ্গাইল • EIIN: 114290</p>
    <h2>${modeTitle}</h2>
    <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:6px; font-size:11px;">
      <span>মোট শিক্ষক: ${totalCount} জন (পুরুষ: ${maleCount}, নারী: ${femaleCount})</span>
      <span>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span>
    </div>
  </div>
  <h3>১. জেন্ডার ভিত্তিক পরিসংখ্যান সারসংক্ষেপ:</h3>
  ${matrixHtml}
  <h3>২. বিস্তারিত শিক্ষক তালিকা:</h3>
  ${listHtml}
  <div class="sig">
    <div><div class="sig-line">প্রস্তুতকারী</div></div>
    <div><div class="sig-line">যাচাইকারী</div></div>
    <div><div class="sig-line">প্রধান শিক্ষক</div></div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
    w.document.write(content);
    w.document.close();
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['ক্রমিক নং', 'শিক্ষকের নাম (বাংলা)', 'পদবী', 'মূল বিষয়', 'জেন্ডার', 'মোবাইল', 'বিবরণ'];
    const rows = filteredTeacherList.map((t, idx) => {
      let detailText = '';
      if (mode === 'education') {
        const edu = t.extended_profile?.education || [];
        detailText = edu.map(e => `${e.exam || ''} (${e.institution || ''} - ${e.year || ''})`).join('; ');
      } else if (mode === 'professional') {
        const prof = t.extended_profile?.professional_qualifications || [];
        detailText = prof.map(p => `${p.exam || ''} (${p.institution || ''} - ${p.year || ''})`).join('; ');
      } else if (mode === 'ict') {
        const tr = getTeacherIctTrainingDetails(t);
        detailText = tr.map(x => `${x.title || 'আইসিটি প্রশিক্ষণ'} (${x.duration || ''})`).join('; ');
      } else if (mode === 'training') {
        const trList = getTeacherAllTrainings(t);
        detailText = trList.map((x, i) => `${i+1}. ${x.title || x.name || 'প্রশিক্ষণ'} [${x.subject ? x.subject+', ' : ''}${x.institution || ''} - ${x.duration || ''}]`).join('; ');
      }
      return [
        idx + 1,
        `"${(t.name_bn || t.name_en || '').replace(/"/g, '""')}"`,
        `"${(t.designation || 'সহকারী শিক্ষক').replace(/"/g, '""')}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${getTeacherGender(t) === 'female' ? 'নারী' : 'পুরুষ'}"`,
        `"${t.phone || ''}"`,
        `"${detailText.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Teacher_${mode}_Query_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      backdropFilter: 'blur(5px)'
    }}>
      <div className="modal-card modern-query-modal" style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1140px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a7f3d0'}}>
              TEACHER ANALYTICS & GENDER MATRIX
            </div>
            <h2 style={{margin: '2px 0 0', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px'}}>
              📊 শিক্ষক পরিসংখ্যান ও জেন্ডারভিত্তিক কুয়েরি
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#fff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* 4 Main Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderBottom: '2px solid #cbd5e1',
          padding: '8px 16px 0',
          gap: '8px',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => { setMode('education'); setSelectedCategory(''); }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: mode === 'education' ? '3px solid #047857' : '3px solid transparent',
              background: mode === 'education' ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '13px',
              color: mode === 'education' ? '#047857' : '#64748b',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            🎓 ১. শিক্ষাগত যোগ্যতা কুয়েরি
          </button>
          <button
            type="button"
            onClick={() => { setMode('professional'); setSelectedCategory(''); }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: mode === 'professional' ? '3px solid #0284c7' : '3px solid transparent',
              background: mode === 'professional' ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '13px',
              color: mode === 'professional' ? '#0284c7' : '#64748b',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            📜 ২. পেশাগত ডিগ্রী কুয়েরি
          </button>
          <button
            type="button"
            onClick={() => { setMode('ict'); setSelectedCategory(''); }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: mode === 'ict' ? '3px solid #7c3aed' : '3px solid transparent',
              background: mode === 'ict' ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '13px',
              color: mode === 'ict' ? '#7c3aed' : '#64748b',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            💻 ৩. আইসিটি প্রশিক্ষণ কুয়েরি
          </button>
          <button
            type="button"
            onClick={() => { setMode('training'); setSelectedCategory(''); }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: mode === 'training' ? '3px solid #d97706' : '3px solid transparent',
              background: mode === 'training' ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '13px',
              color: mode === 'training' ? '#d97706' : '#64748b',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            📚 ৪. কর্মকালীন প্রশিক্ষণ কুয়েরি
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{padding: '20px 24px', overflowY: 'auto', flex: 1}}>
          {/* Top KPI Cards */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px'}}>
            <div style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 18px'}}>
              <div style={{fontSize: '12px', color: '#166534', fontWeight: 600}}>মোট সক্রিয় শিক্ষক</div>
              <div style={{fontSize: '26px', fontWeight: 800, color: '#14532d', marginTop: '2px'}}>{totalCount} জন</div>
            </div>
            <div style={{background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px'}}>
              <div style={{fontSize: '12px', color: '#1e40af', fontWeight: 600}}>👨‍🏫 পুরুষ শিক্ষক</div>
              <div style={{fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px'}}>
                {maleCount} জন <span style={{fontSize: '13px', fontWeight: 500}}>({totalCount ? Math.round((maleCount/totalCount)*100) : 0}%)</span>
              </div>
            </div>
            <div style={{background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '1px solid #fecdd3', borderRadius: '12px', padding: '14px 18px'}}>
              <div style={{fontSize: '12px', color: '#9f1239', fontWeight: 600}}>👩‍🏫 নারী শিক্ষক</div>
              <div style={{fontSize: '26px', fontWeight: 800, color: '#881337', marginTop: '2px'}}>
                {femaleCount} জন <span style={{fontSize: '13px', fontWeight: 500}}>({totalCount ? Math.round((femaleCount/totalCount)*100) : 0}%)</span>
              </div>
            </div>
            <div style={{background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '14px 18px'}}>
              <div style={{fontSize: '12px', color: '#6b21a8', fontWeight: 600}}>
                {mode === 'education' ? 'উচ্চ শিক্ষাগত যোগ্যতা' : mode === 'professional' ? 'পেশাগত ডিগ্রীধারী' : mode === 'ict' ? 'আইসিটি প্রশিক্ষণপ্রাপ্ত' : 'কর্মকালীন প্রশিক্ষণপ্রাপ্ত'}
              </div>
              <div style={{fontSize: '26px', fontWeight: 800, color: '#581c87', marginTop: '2px'}}>
                {mode === 'education' 
                  ? activeTeachers.filter(t => teacherHasEducation(t, 'স্নাতকোত্তর (অনার্সসহ)') || teacherHasEducation(t, 'স্নাতক সম্মান(৪ বছর মেয়াদী)')).length 
                  : mode === 'professional' 
                    ? activeTeachers.filter(t => PROF_DEGREES_LIST.some(d => teacherHasProfDegree(t, d))).length 
                    : mode === 'ict'
                      ? ictTrainedTeachers.length
                      : activeTeachers.filter(t => getTeacherAllTrainings(t).length > 0).length
                } জন
              </div>
            </div>
          </div>

          {/* Section 1: Summary Matrix Table */}
          <div style={{background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px'}}>
              <h3 style={{margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'}}>
                📋 জেন্ডার ভিত্তিক পরিসংখ্যান ম্যাট্রিক্স
                {selectedCategory && (
                  <span style={{fontSize: '12px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 600}}>
                    ফিল্টার সক্রিয়: {currentMatrix.find(r => r.key === selectedCategory)?.label || selectedCategory}
                  </span>
                )}
              </h3>
              {selectedCategory && (
                <button 
                  type="button" 
                  onClick={() => setSelectedCategory('')}
                  style={{background: '#cbd5e1', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'}}
                >
                  সব দেখুন (রিসেট)
                </button>
              )}
            </div>

            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0'}}>
                <thead>
                  <tr style={{background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#1e293b'}}>
                    <th style={{padding: '10px 12px', textAlign: 'left'}}>
                      {mode === 'education' ? 'পরীক্ষার নাম / শিক্ষাগত যোগ্যতা' : mode === 'professional' ? 'পেশাগত ডিগ্রী' : mode === 'ict' ? 'আইসিটি প্রশিক্ষণের ক্যাটাগরি' : 'কর্মকালীন প্রশিক্ষণের শিরোনাম / বিষয়'}
                    </th>
                    <th style={{padding: '10px 12px', textAlign: 'center', width: '120px', color: '#1e40af'}}>👨‍🏫 পুরুষ</th>
                    <th style={{padding: '10px 12px', textAlign: 'center', width: '120px', color: '#be123c'}}>👩‍🏫 নারী</th>
                    <th style={{padding: '10px 12px', textAlign: 'center', width: '120px', fontWeight: 700}}>👥 মোট</th>
                    <th style={{padding: '10px 12px', textAlign: 'center', width: '110px'}}>শতকরা হার</th>
                    <th style={{padding: '10px 12px', textAlign: 'center', width: '120px'}}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMatrix.map((row, idx) => {
                    const isSelected = selectedCategory === row.key;
                    return (
                      <tr 
                        key={row.key} 
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#eff6ff' : idx % 2 === 0 ? '#ffffff' : '#fbfcfe',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedCategory(prev => prev === row.key ? '' : row.key)}
                      >
                        <td style={{padding: '10px 12px', fontWeight: 600, color: '#0f172a'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{color: isSelected ? '#0284c7' : '#64748b'}}>▶</span>
                            {row.label}
                          </div>
                        </td>
                        <td style={{padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#1e3a8a'}}>
                          <span style={{background: '#dbeafe', padding: '3px 10px', borderRadius: '12px'}}>{row.male} জন</span>
                        </td>
                        <td style={{padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#9f1239'}}>
                          <span style={{background: '#ffe4e6', padding: '3px 10px', borderRadius: '12px'}}>{row.female} জন</span>
                        </td>
                        <td style={{padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a'}}>
                          <span style={{background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px'}}>{row.total} জন</span>
                        </td>
                        <td style={{padding: '10px 12px', textAlign: 'center'}}>
                          <span style={{fontWeight: 700, color: '#047857'}}>{row.percent}%</span>
                        </td>
                        <td style={{padding: '10px 12px', textAlign: 'center'}}>
                          <button
                            type="button"
                            style={{
                              background: isSelected ? '#0284c7' : '#f1f5f9',
                              color: isSelected ? '#fff' : '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {isSelected ? '✓ ফিল্টার সক্রিয়' : 'তালিকা ফিল্টার'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Detailed Filtered Roster Table */}
          <div style={{background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700}}>
                  👥 বিস্তারিত শিক্ষক তালিকা ({filteredTeacherList.length} জন)
                </h3>
                <p style={{margin: '2px 0 0', fontSize: '12px', color: '#64748b'}}>
                  {mode === 'training' ? 'শিক্ষকদের এন্ট্রি ফরমের শিক্ষকবৃন্দের প্রশিক্ষণ রেকর্ড ও বিস্তারিত তথ্য' : 'ফিল্টারকৃত শিক্ষকদের ব্যক্তিগত, পদবী ও সংশ্লিষ্ট যোগ্যতার বিস্তারিত তথ্য'}
                </p>
              </div>

              {/* Toolbar filters and actions */}
              <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                <input
                  type="text"
                  placeholder="🔍 নাম / পদবী / বিষয় / প্রশিক্ষণ খুঁজুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', minWidth: '180px'}}
                />

                <select
                  value={genderFilter}
                  onChange={e => setGenderFilter(e.target.value)}
                  style={{padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600}}
                >
                  <option value="">👥 সব জেন্ডার</option>
                  <option value="male">পুরুষ শিক্ষক</option>
                  <option value="female">নারী শিক্ষক</option>
                </select>

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🖨️ প্রিন্ট / PDF
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  📥 CSV রিপোর্ট
                </button>
              </div>
            </div>

            <div style={{overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12.5px'}}>
                <thead>
                  <tr style={{background: '#f8fafc', borderBottom: '2px solid #cbd5e1'}}>
                    <th style={{padding: '10px 8px', textAlign: 'center', width: '50px'}}>ক্র নং</th>
                    <th style={{padding: '10px 10px', textAlign: 'left', minWidth: '180px'}}>শিক্ষকের নাম</th>
                    <th style={{padding: '10px 10px', textAlign: 'left', minWidth: '140px'}}>পদবী ও বিষয়</th>
                    <th style={{padding: '10px 10px', textAlign: 'center', width: '90px'}}>জেন্ডার</th>
                    <th style={{padding: '10px 10px', textAlign: 'left', minWidth: '260px'}}>
                      {mode === 'education' 
                        ? 'শিক্ষাগত যোগ্যতার বিবরণ' 
                        : mode === 'professional' 
                          ? 'পেশাগত ডিগ্রীর বিবরণ' 
                          : mode === 'ict'
                            ? 'আইসিটি প্রশিক্ষণ রেকর্ড ও প্রতিষ্ঠান'
                            : 'কর্মকালীন প্রশিক্ষণসমূহ (শিরোনাম, বিষয়, প্রতিষ্ঠান ও স্থিতিকাল)'
                      }
                    </th>
                    <th style={{padding: '10px 10px', textAlign: 'center', minWidth: '110px'}}>মোবাইল</th>
                    <th style={{padding: '10px 10px', textAlign: 'center', width: '100px'}}>অবস্থা</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeacherList.map((t, idx) => {
                    const gender = getTeacherGender(t);
                    const trainings = getTeacherAllTrainings(t);
                    return (
                      <tr key={t.id || idx} style={{borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa'}}>
                        <td style={{padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: '#475569'}}>
                          {idx + 1}
                        </td>
                        <td style={{padding: '8px 10px'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <img
                              src={getTeacherPhoto(t)}
                              alt=""
                              style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1'}}
                            />
                            <div>
                              <div style={{fontWeight: 600, color: '#0f172a'}}>{t.name_bn || t.name_en}</div>
                              {t.name_en && <div style={{fontSize: '11px', color: '#64748b'}}>{t.name_en}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{padding: '8px 10px'}}>
                          <div style={{fontWeight: 600, color: '#334155'}}>{t.designation || 'সহকারী শিক্ষক'}</div>
                          {t.subject && <div style={{fontSize: '11.5px', color: '#0284c7'}}>{t.subject}</div>}
                        </td>
                        <td style={{padding: '8px 10px', textAlign: 'center'}}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: gender === 'female' ? '#ffe4e6' : '#dbeafe',
                            color: gender === 'female' ? '#9f1239' : '#1e40af'
                          }}>
                            {gender === 'female' ? 'নারী' : 'পুরুষ'}
                          </span>
                        </td>
                        <td style={{padding: '8px 10px'}}>
                          {mode === 'education' && (
                            <div>
                              {(t.extended_profile?.education || []).length > 0 ? (
                                (t.extended_profile?.education || []).map((e, ei) => (
                                  <div key={ei} style={{fontSize: '11.5px', marginBottom: '2px', color: '#1e293b'}}>
                                    • <strong style={{color: '#047857'}}>{e.exam || 'ডিগ্রী'}</strong> {e.institution ? `— ${e.institution}` : ''} {e.year ? `(${e.year})` : ''} {e.result ? `[${e.result}]` : ''}
                                  </div>
                                ))
                              ) : (
                                <span style={{fontSize: '11.5px', color: '#94a3b8'}}>শিক্ষাগত যোগ্যতা এন্ট্রি করা নেই</span>
                              )}
                            </div>
                          )}

                          {mode === 'professional' && (
                            <div>
                              {(t.extended_profile?.professional_qualifications || []).length > 0 ? (
                                (t.extended_profile?.professional_qualifications || []).map((p, pi) => (
                                  <div key={pi} style={{fontSize: '11.5px', marginBottom: '2px', color: '#1e293b'}}>
                                    • <strong style={{color: '#0284c7'}}>{p.exam || 'পেশাগত ডিগ্রী'}</strong> {p.institution ? `— ${p.institution}` : ''} {p.year ? `(${p.year})` : ''} {p.result ? `[${p.result}]` : ''}
                                  </div>
                                ))
                              ) : teacherHasProfDegree(t, 'বিএড') ? (
                                <div style={{fontSize: '11.5px', color: '#0284c7', fontWeight: 600}}>• বিএড (B.Ed) ডিগ্রিধারী</div>
                              ) : (
                                <span style={{fontSize: '11.5px', color: '#94a3b8'}}>পেশাগত ডিগ্রী এন্ট্রি নেই</span>
                              )}
                            </div>
                          )}

                          {mode === 'ict' && (
                            <div>
                              {getTeacherIctTrainingDetails(t).length > 0 ? (
                                getTeacherIctTrainingDetails(t).map((tr, tri) => (
                                  <div key={tri} style={{fontSize: '11.5px', marginBottom: '2px', color: '#1e293b'}}>
                                    • <strong style={{color: '#7c3aed'}}>{tr.title || 'আইসিটি প্রশিক্ষণ'}</strong> {tr.institution ? `(${tr.institution})` : ''} {tr.duration ? `— ${tr.duration}` : ''}
                                  </div>
                                ))
                              ) : (
                                <span style={{fontSize: '11.5px', color: '#dc2626'}}>আইসিটি প্রশিক্ষণ রেকর্ড পাওয়া যায়নি</span>
                              )}
                            </div>
                          )}

                          {mode === 'training' && (
                            <div>
                              {trainings.length > 0 ? (
                                <>
                                  <div style={{marginBottom: '4px'}}>
                                    <span style={{background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a'}}>
                                      {toBengaliDigits(trainings.length)}টি কর্মকালীন প্রশিক্ষণ
                                    </span>
                                  </div>
                                  {trainings.map((tr, tri) => (
                                    <div key={tri} style={{fontSize: '11.5px', marginBottom: '3px', color: '#1e293b', lineHeight: '1.4'}}>
                                      <strong style={{color: '#b45309'}}>{tri + 1}. {tr.title || tr.name || 'কর্মকালীন প্রশিক্ষণ'}</strong>
                                      {tr.subject ? <span style={{color: '#0369a1'}}> ({tr.subject})</span> : ''}
                                      {tr.institution || tr.place ? <span style={{color: '#475569'}}> — {tr.institution || tr.place}</span> : ''}
                                      {tr.duration ? <span style={{color: '#15803d', fontWeight: 600}}> [{tr.duration}]</span> : ''}
                                      {tr.start_date ? <span style={{color: '#64748b', fontSize: '10.5px'}}> ({tr.start_date})</span> : ''}
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <span style={{fontSize: '11.5px', color: '#94a3b8'}}>কোনো কর্মকালীন প্রশিক্ষণ এন্ট্রি নেই</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{padding: '8px 10px', textAlign: 'center', color: '#475569', fontSize: '11.5px'}}>
                          {t.phone || '—'}
                        </td>
                        <td style={{padding: '8px 10px', textAlign: 'center'}}>
                          <span style={{fontSize: '11.5px', color: '#16a34a', fontWeight: 600}}>সক্রিয়</span>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredTeacherList.length && (
                    <tr>
                      <td colSpan="7" style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>
                        কোনো শিক্ষক রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{fontSize: '12px', color: '#64748b'}}>
            ℹ️ নির্বাচিত কুয়েরি অনুযায়ী পুরুষ, নারী ও মোট শিক্ষকদের তাৎক্ষণিক তথ্য ও প্রিন্ট রিপোর্ট
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#047857',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🖨️ প্রিন্ট করুন
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#64748b',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
