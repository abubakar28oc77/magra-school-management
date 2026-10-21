import React, { useState, useEffect } from 'react';
import {
  MOCK_SCHOOL,
  MOCK_TEACHERS,
  PHOTO_HEAD_TEACHER,
  PHOTO_ASST_HEAD_TEACHER,
  getTeacherPhoto,
  getLeadershipData
} from './mockData';
import { requestApi } from './apiClient';

export function LanguageLiteratureClubSection({ initialTitle, onClose }) {
  const [activeClub, setActiveClub] = useState(
    initialTitle?.includes('বিজ্ঞান') ? 'science' :
    initialTitle?.includes('আইসিটি') ? 'ict' :
    initialTitle?.includes('ডিবেট') || initialTitle?.includes('বিতর্ক') ? 'debate' :
    'literature'
  );

  const [clubTab, setClubTab] = useState('overview');
  const [readingItem, setReadingItem] = useState(null);
  const [dynamicContent, setDynamicContent] = useState([]);
  const [submissionsList, setSubmissionsList] = useState([]);

  // Live teachers list
  const [teachers, setTeachers] = useState([]);
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
      if (Array.isArray(local) && local.length) {
        setTeachers(local);
      } else {
        setTeachers(MOCK_TEACHERS);
      }
    } catch {
      setTeachers(MOCK_TEACHERS);
    }
  }, []);

  // Fetch dynamic content and submissions
  useEffect(() => {
    requestApi('/public/content').then(res => {
      if (Array.isArray(res)) setDynamicContent(res);
    }).catch(() => {});

    requestApi('/club-submissions').then(res => {
      if (Array.isArray(res)) setSubmissionsList(res);
    }).catch(() => {});
  }, []);

  // Find authentic faculty
  const headMaster = teachers.find(t => t.public_contact_role === 'head_teacher' || (t.designation && t.designation.includes('প্রধান শিক্ষক') && !t.designation.includes('সহকারী'))) || teachers[0] || MOCK_TEACHERS[0];
  const asstHead = teachers.find(t => t.public_contact_role === 'assistant_head_teacher' || (t.designation && t.designation.includes('সহকারী প্রধান শিক্ষক'))) || teachers[1] || MOCK_TEACHERS[1];
  const khaleqTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আব্দুল খালেক')) || (t.subject && t.subject.includes('বাংলা'))) || teachers[14] || MOCK_TEACHERS[14] || teachers[3];
  const ashrafulTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আশরাফুল')) || (t.subject && (t.subject.includes('ইংরেজী') || t.subject.includes('English')))) || teachers[11] || MOCK_TEACHERS[11];
  const habiburTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('হাবিবুর')) || (t.subject && (t.subject.includes('গণিত') || t.subject.includes('বিজ্ঞান')))) || teachers[7] || MOCK_TEACHERS[7];
  const rafiqulTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('রফিকুল')) || (t.subject && t.subject.includes('ভৌত বিজ্ঞান'))) || teachers[13] || MOCK_TEACHERS[13];
  const abdurRahimTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আব্দুর রহিম')) || (t.subject && t.subject.includes('জীববিজ্ঞান'))) || teachers[6] || MOCK_TEACHERS[6];
  const ictTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আবুবকর')) || (t.subject && (t.subject.includes('আইসিটি') || t.subject.includes('ICT')))) || teachers[5] || MOCK_TEACHERS[5] || teachers[2];
  const shahinTeacher = teachers.find(t => (t.name_bn && (t.name_bn.includes('শাহিন') || t.name_bn.includes('শাহীন'))) || (t.subject && t.subject.includes('গ্রন্থাগার'))) || teachers[10] || MOCK_TEACHERS[10];

  // Submission Form State
  const emptySubmission = {
    student_name: '',
    class_name: '৯',
    roll_no: '',
    department: 'বিজ্ঞান',
    mobile: '',
    type: activeClub === 'debate' ? 'motion' : activeClub === 'science' ? 'project' : activeClub === 'ict' ? 'software' : 'poem',
    title: '',
    content: ''
  };
  const [subForm, setSubForm] = useState(emptySubmission);
  const [subReceipt, setSubReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [subMsg, setSubMsg] = useState('');

  // Auto-adapt form type when activeClub changes
  useEffect(() => {
    setSubForm(prev => ({
      ...prev,
      type: activeClub === 'debate' ? 'motion' : activeClub === 'science' ? 'project' : activeClub === 'ict' ? 'software' : 'poem'
    }));
  }, [activeClub]);

  const handleFillDemo = () => {
    if (activeClub === 'debate') {
      setSubForm({
        student_name: 'মাহফুজ আহমেদ',
        class_name: '১০',
        roll_no: '২',
        department: 'মানবিক',
        mobile: '01718-445566',
        type: 'motion',
        title: 'কৃত্রিম বুদ্ধিমত্তা (AI) মেধা বিকাশের জন্য হুমকি নয় বরং পরম সহায়ক শক্তি',
        content: `বিতর্ক প্রস্তাবনা (সংসদীয় কাঠামো):
প্রস্তাবনা: এই সংসদ মনে করে যে, এআই প্রযুক্তি ভবিষ্যৎ শিক্ষা ব্যবস্থার জন্য হুমকি নয় বরং জ্ঞানের গণতন্ত্রীকরণ নিশ্চিত করছে।

পক্ষ দলের ৩টি মূল যুক্তি:
১. ব্যক্তিগতকৃত শিখন (Personalized Learning): প্রতিটি শিক্ষার্থীর নিজস্ব মেধার গতি অনুযায়ী শেখার অনন্য সুযোগ তৈরি হয়।
২. গ্রামীণ ও প্রান্তিক শিক্ষার্থীদের বিশ্বমানের কনটেন্ট প্রাপ্তি এবং তাৎক্ষণিক ভাষা অনুবাদের বাধা দূরীকরণ।
৩. শিক্ষকদের রুটিন কাজের চাপ কমিয়ে সরাসরি শিক্ষার্থীদের মানবিক মূল্যবোধ ও মেন্টরিংয়ে সময় দেওয়ার সুযোগ বৃদ্ধি।

উপসংহার: মানুষই প্রযুক্তির নিয়ন্তা। সঠিক দিকনির্দেশনা থাকলে এআই শিক্ষার্থীদের সৃজনশীলতাকে নতুন উচ্চতায় নিয়ে যাবে।`
      });
      setSubMsg('✓ ডিবেটিং ক্লাবের ডেমো শিক্ষার্থীর তথ্য ও পূর্ণাঙ্গ বিতর্ক প্রস্তাবনা পূরণ করা হয়েছে।');
    } else if (activeClub === 'science') {
      setSubForm({
        student_name: 'তানভীর আহমেদ ও রাহাত হাসান',
        class_name: '১০',
        roll_no: '১',
        department: 'বিজ্ঞান',
        mobile: '01711-223344',
        type: 'project',
        title: 'স্বয়ংক্রিয় সৌরচালিত স্মার্ট ড্রিপ ইরিগেশন ও মাটি আর্দ্রতা নির্ণায়ক যন্ত্র',
        content: `প্রকল্পের শিরোনাম: সৌরচালিত স্বয়ংক্রিয় স্মার্ট ড্রিপ ইরিগেশন
উদ্ভাবক দল: তানভীর আহমেদ ও রাহাত হাসান (১০ম শ্রেণি, বিজ্ঞান)

প্রকল্পের উদ্দেশ্য ও সমস্যা সমাধান:
ঐতিহ্যবাহী সেচ ব্যবস্থায় অতিরিক্ত পানির অপচয় হয় এবং লোডশেডিংয়ে ফসল নষ্ট হয়। এই যন্ত্র মাটির আর্দ্রতা স্বয়ংক্রিয়ভাবে মেপে প্রয়োজন অনুযায়ী পরিমিত পানি দেয়।

যন্ত্রাংশ ও প্রযুক্তি:
১. আর্ডুইনো ইউনো আর৩ (Arduino Uno R3)
২. ক্যাপাসিটিভ সয়েল ময়েশ্চার সেন্সর
৩. ১২ ভোল্ট সোলার প্যানেল ও রিচার্জেবল লিথিয়াম ব্যাটারি
৪. রিলে সুইচ ও মিনি সাবমার্সিবল ওয়াটার পাম্প
৫. ড্রিপ ইরিগেশন পাইপলাইন

কার্যপদ্ধতি:
মাটির আর্দ্রতা ৩০%-এর নিচে নামলে পাম্প স্বয়ংক্রিয় চালু হয় এবং ৭০% আর্দ্রতা অর্জন করলে পাম্প বন্ধ হয়ে যায়। ফলে ৪০% পানি সাশ্রয় হয় এবং বিদ্যুৎ খরচ শূন্য।`
      });
      setSubMsg('✓ বিজ্ঞান ক্লাবের ডেমো শিক্ষার্থীর তথ্য ও উদ্ভাবনী প্রজেক্ট পূরণ করা হয়েছে।');
    } else if (activeClub === 'ict') {
      setSubForm({
        student_name: 'ফারজানা মেহজাবীন ও নাফিজা ইসলাম',
        class_name: '৯',
        roll_no: '৩',
        department: 'বিজ্ঞান',
        mobile: '01712-345678',
        type: 'software',
        title: 'মগড়া ডিজিটাল লাইব্রেরি ক্যাটালগ ও স্মার্ট বুক ট্র্যাকার ওয়েব অ্যাপ',
        content: `সফটওয়্যার/অ্যাপ প্রজেক্টের নাম: মগড়া ডিজিটাল লাইব্রেরি সার্চ ইঞ্জিন
নির্মাতা: ফারজানা মেহজাবীন ও নাফিজা ইসলাম (৯ম শ্রেণি)

প্রজেক্টের সারসংক্ষেপ ও লক্ষ্য:
বিদ্যালয় লাইব্রেরির ১,২০০+ বই সহজে সার্চ করা এবং শিক্ষার্থীদের বুক ইস্যু-রিটার্ন ডিজিটাল ট্র্যাকিংয়ের জন্য একটি দ্রুতগতির ওয়েব অ্যাপ।

ব্যবহৃত প্রযুক্তি:
- ফ্রন্টএন্ড: HTML5, CSS3, JavaScript (ES6+)
- স্টোরেজ: LocalStorage ও ব্রাউজার ক্যাশ
- রেসপনসিভনেস: মোবাইল ও কম্পিউটার উভয়েই নিখুঁত প্রদর্শনী

মূল বৈশিষ্ট্যসমূহ:
১. বইয়ের নাম, লেখক ও বিষয় অনুযায়ী রিয়েল-টাইম সার্চ ফিল্টারিং।
২. এক ক্লিকে বইয়ের সারাংশ ও প্রচ্ছদ দেখার সুবিধা।
৩. শিক্ষার্থীর রোল দিলে ইস্যুকৃত বই ও জমা দেওয়ার শেষ তারিখ দেখা।`
      });
      setSubMsg('✓ আইসিটি ক্লাবের ডেমো শিক্ষার্থীর তথ্য ও সফটওয়্যার প্রজেক্ট পূরণ করা হয়েছে।');
    } else {
      setSubForm({
        student_name: 'ফারজানা মেহজাবীন',
        class_name: '৯',
        roll_no: '৩',
        department: 'বিজ্ঞান',
        mobile: '01712-345678',
        type: 'poem',
        title: 'বর্ণমালার গান',
        content: 'বর্ণমালার হরফগুলো যেন মুক্তোর মালা,\nমায়ের ভাষার ছন্দে ঘুচুক মনের যত জ্বালা।\nএকুশ আমার অহংকার, একুশ আমার প্রাণ,\nবিশ্বজুড়ে গাইব মোরা বিজয়েরই গান।'
      });
      setSubMsg('✓ ভাষা ও সাহিত্য ক্লাবের ডেমো তথ্য ও স্বরচিত কবিতা পূরণ করা হয়েছে।');
    }
    setTimeout(() => setSubMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.student_name.trim() || !subForm.title.trim() || !subForm.content.trim()) {
      setSubMsg('অনুগ্রহ করে শিক্ষার্থীর নাম, শিরোনাম ও মূল বক্তব্য পূরণ করুন।');
      return;
    }
    setSubmitting(true);
    setSubMsg('');
    try {
      const typeLabels = {
        poem: 'স্বরচিত কবিতা',
        story: 'ছোটগল্প',
        rhyme: 'ছড়া',
        essay: 'প্রবন্ধ',
        book_review: 'বুক রিভিউ',
        english: 'Creative English Writing',
        motion: 'বিতর্ক প্রস্তাবনা ও যুক্তি কাঠামো',
        debate_opinion: 'বিতর্ক বিশ্লেষণ ও মতামত',
        project: 'উদ্ভাবনী বিজ্ঞান প্রজেক্ট',
        experiment: 'বিজ্ঞান পরীক্ষা ও মডেল',
        software: 'সফটওয়্যার ও ওয়েব প্রজেক্ট',
        code_idea: 'কোডিং আইডিয়া ও অ্যালগরিদম',
        membership: 'সদস্যপদ আবেদন'
      };
      const clubNames = {
        literature: 'ভাষা ও সাহিত্য ক্লাব',
        debate: 'ডিবেটিং ক্লাব',
        science: 'বিজ্ঞান ক্লাব',
        ict: 'আইসিটি ও প্রোগ্রামিং ক্লাব'
      };
      const res = await requestApi('/club-submissions', {
        method: 'POST',
        body: JSON.stringify({
          ...subForm,
          club_id: activeClub,
          club_name: clubNames[activeClub] || 'স্কুল ক্লাব',
          type_label: typeLabels[subForm.type] || 'ক্লাব প্রজেক্ট/লেখা'
        })
      });
      setSubReceipt(res);
      setSubMsg(`অভিনন্দন! তোমার জমাটি ${clubNames[activeClub]} এর মডারেটর শিক্ষকমণ্ডলীর পর্যালোচনায় সফলভাবে জমা হয়েছে।`);
      setSubForm(emptySubmission);
      // Refresh list
      requestApi('/club-submissions').then(r => Array.isArray(r) && setSubmissionsList(r)).catch(() => {});
    } catch (err) {
      setSubMsg('জমাদানে ত্রুটি: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Seeded Kisholoy Wall Magazine Articles
  const kisholoyArticles = [
    {
      id: 'art-1',
      club_id: 'literature',
      type: 'poem',
      type_label: 'স্বরচিত কবিতা',
      title: 'রক্তে রাঙা একুশ',
      author: 'ফারজানা মেহজাবীন',
      class_name: '৯ম শ্রেণি (বিজ্ঞান)',
      roll_no: '৩',
      date: '২১শে ফেব্রুয়ারি ২০২৬',
      excerpt: 'পলাশ ডালে রক্ত লেগেছে ফাগুনের এই ভোরে / মায়ের ভাষায় কথা বলা প্রাণ শহীদ মিনারে ঝরে...',
      content: `পলাশ ডালে রক্ত লেগেছে ফাগুনের এই ভোরে,
মায়ের ভাষায় কথা বলা প্রাণ শহীদ মিনারে ঝরে।
সালাম, বরকত, রফিক, জব্বার—তোমাদের ভুলব না,
বাংলা আমার মুখের বুলি, অন্য কিছু মানব না।

বর্ণমালার হরফগুলো যেন নক্ষত্রের মেলা,
রক্তের দামে কিনেছি ভাষা, নয়কো হেলাফেলা।
আমরা তরুণ, আমরা বাঁধব স্বপ্নের সোনার দেশ,
ভাষার আলোয় ঘুচবে আঁধার, ঘুচবে দুঃখের রেশ।`
    },
    {
      id: 'art-2',
      club_id: 'literature',
      type: 'story',
      type_label: 'ছোটগল্প',
      title: 'মগড়ার বটের ছায়ায়',
      author: 'তানভীর আহমেদ',
      class_name: '১০ম শ্রেণি (বিজ্ঞান)',
      roll_no: '১',
      date: 'বসন্ত সংখ্যা ২০২৬',
      excerpt: 'কালিহাতির বুক চিরে বয়ে যাওয়া নদীর ধারে মগড়া গ্রামের মেঠোপথ। স্কুল ছুটির পর বটগাছের ছায়ায় বসে স্বপ্ন দেখার গল্প...',
      content: `কালিহাতির বুক চিরে বয়ে যাওয়া শান্ত নদী আর দিগন্তজোড়া ফসলের মাঠ পেরিয়ে মগড়া ইউনিয়ন উচ্চ বিদ্যালয়। বিদ্যালয়ের প্রধান ফটক পেরিয়ে ভেতরে ঢুকলেই চোখ জুড়িয়ে যায় প্রাচীন শতবর্ষী বটবৃক্ষের শীতল ছায়ায়। 

স্কুল ছুটির ঘণ্টা বাজতেই একদল কিশোর এসে জমায়েত হয় সেই বটের তলায়। তাদের হাতে নতুন বই, মাথায় কত রঙের স্বপ্ন। সেদিন ছিল বৃহস্পতিবার—ভাষা ও সাহিত্য ক্লাবের সাপ্তাহিক পাঠচক্রের দিন। সবাই যার যার পঠিত প্রিয় বইটির গল্প বলছিল। 

তানভীর বলে উঠল, "জানো, বিভূতিভূষণের অপুর মতো আমারও মনে হয় ঐ দূরের রেললাইন পেরিয়ে আরও বহু দূর চলে যাই!" 
পাশে বসা রাহাত হাসিমুখে যোগ করল, "আমরা তো বইয়ের পাতায় বসেই সারা পৃথিবী ঘুরে বেড়াই।" 

বটগাছের সবুজ পাতার ফাঁক দিয়ে ঠিকরে পড়া বিকেলের রোদ যেন সাক্ষ্য দিচ্ছিল—এই কিশোরদের কলমেই রচিত হবে আগামী বাংলাদেশের নতুন ইতিহাস। সাহিত্যের আলো ওদের চোখে এনে দিয়েছে নতুন দৃষ্টি, মনের ভেতর জাগিয়েছে এক গভীর মানবিক ভালোবাসা।`
    },
    {
      id: 'art-3',
      club_id: 'literature',
      type: 'rhyme',
      type_label: 'ছড়া',
      title: 'বইয়ের দেশে অভিযান',
      author: 'মাহির ফয়সাল',
      class_name: '৭ম শ্রেণি',
      roll_no: '১',
      date: 'জানুয়ারি ২০২৬',
      excerpt: 'বইয়ের পাতা খুললেই পাই অচিন দেশের ঘ্রাণ / চাঁদের বুড়ি চরকা কাটে, শোনায় মধুর গান...',
      content: `বইয়ের পাতা খুললেই পাই অচিন দেশের ঘ্রাণ,
চাঁদের বুড়ি চরকা কাটে, শোনায় মধুর গান।
রাজপুত্র ঘোড়ায় চড়ে, তেপান্তরের মাঠে,
পঙ্খীরাজ ডানায় ওড়ে, রাত যে কেমন কাটে!

বই যে আমার পরম বন্ধু, বই যে আমার দিশা,
বইয়ের আলোয় দূর হয়ে যায় মনের যত নিশা।
এসো সবাই বইকে ভালোবাসি, বইয়ের পাতায় থাকি,
স্বপ্নের এক রঙিন ভুবন মনের মাঝে আঁকি।`
    },
    {
      id: 'art-4',
      club_id: 'literature',
      type: 'essay',
      type_label: 'প্রবন্ধ',
      title: 'মাতৃভাষার মর্যাদা ও আমাদের দায়বদ্ধতা',
      author: 'রাহাত হাসান',
      class_name: '১০ম শ্রেণি',
      roll_no: '৫',
      date: 'ফেব্রুয়ারি ২০২৬',
      excerpt: 'একুশে ফেব্রুয়ারি কেবল একটি তারিখ নয়, এটি একটি জাতির আত্মপরিচয় ও আত্মমর্যাদার প্রতীক...',
      content: `একুশে ফেব্রুয়ারি কেবল একটি ক্যালেন্ডারের তারিখ নয়, এটি বাঙালি জাতির আত্মপরিচয়, প্রতিবাদ ও আত্মমর্যাদার অবিনাশী প্রতীক। ১৯৫২ সালের এই দিনে বাংলার দামাল সন্তানেরা বুকের তাজা রক্ত ঢেলে মাতৃভাষার সম্মান রক্ষা করেছিলেন। পৃথিবীর ইতিহাসে নিজের ভাষার জন্য প্রাণ দেওয়ার এমন নজির আর দ্বিতীয়টি নেই।

আজ একুশ আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে বিশ্বজুড়ে স্বীকৃত। কিন্তু আমাদের নিজেদের কাছে প্রশ্ন—আমরা কি প্রাত্যহিক জীবনে মাতৃভাষার সঠিক মর্যাদা দিতে পারছি? সাইনবোর্ডে ভুল বানান, অহেতুক বিকৃত উচ্চারণ এবং ইংরেজি-বাংলার জগাখিচুড়ি ব্যবহার আমাদের ভাষিক সৌন্দর্যকে ম্লান করছে।

মগড়া ইউনিয়ন উচ্চ বিদ্যালয়ের ভাষা ও সাহিত্য ক্লাবের সদস্য হিসেবে আমাদের অঙ্গীকার—আমরা শুদ্ধ বাংলায় কথা বলব, প্রমিত বানান অনুসরণ করব এবং সৃজনশীল সাহিত্যচর্চার মাধ্যমে বাংলা ভাষাকে প্রযুক্তির যুগেও বিশ্বদরবারে গৌরবান্বিত রাখব।`
    }
  ];

  // Seeded Debating Motions
  const debateMotions = [
    {
      id: 'deb-1',
      club_id: 'debate',
      type: 'motion',
      type_label: 'সংসদীয় বিতর্ক প্রস্তাবনা',
      title: 'কৃত্রিম বুদ্ধিমত্তা মানুষের মেধা ও সৃজনশীলতাকে বিনষ্ট করছে না বরং বহুগুণ বিকশিত করছে',
      author: 'মাহফুজ আহমেদ ও তানভীর আহমেদ',
      class_name: '১০ম শ্রেণি',
      roll_no: '১, ২',
      date: 'ফেব্রুয়ারি ২০২৬',
      excerpt: 'সংসদীয় বিতর্ক: এআই কি মানুষের সহায়ক নাকি মেধা হরণের হাতিয়ার? পক্ষ ও বিপক্ষ দলের ধারালো যুক্তি সংকলন...',
      content: `বিষয়: "এই সংসদ মনে করে যে, কৃত্রিম বুদ্ধিমত্তা মানুষের সৃজনশীলতাকে বিনষ্ট করছে না বরং বিকশিত করছে।"

[সরকার দলীয় (পক্ষ) মূল যুক্তিমালা]:
১. রুটিন কাজের স্বয়ংক্রিয়করণ: জটিল গাণিতিক হিসাব বা পুনরাবৃত্তিমূলক তথ্য খোঁজার মতো সময়সাপেক্ষ কাজ এআই করায় মানুষ গভীর চিন্তা, দর্শন ও উদ্ভাবনী কাজে বেশি সময় দিতে পারছে।
২. শিক্ষার সমঅধিকার ও ব্যক্তিগতকরণ: প্রত্যন্ত অঞ্চলের একজন সাধারণ শিক্ষার্থীও আজ এআইয়ের সহায়তায় ব্যক্তিগত টিউটরের মতো যেকোনো জটিল বিষয় মাতৃভাষায় সহজে বুঝতে পারছে।
৩. সৃজনশীলতার নতুন মাত্রা: চিত্রশিল্পী, লেখক বা গবেষকেরা এআই-কে সহায়ক টুল হিসেবে ব্যবহার করে অভূতপূর্ব শিল্প ও সাহিত্য সৃষ্টি করছেন।

[বিরোধী দলীয় (বিপক্ষ) পাল্টা যুক্তিমালা]:
১. চিন্তাশক্তির অবক্ষয়: সবকিছু এআই থেকে তাৎক্ষণিক পেয়ে যাওয়ার ফলে নতুন প্রজন্মের বিশ্লেষণ ক্ষমতা ও অনুসন্ধিৎসু মন দুর্বল হয়ে পড়ছে।
২. বুদ্ধিবৃত্তিক অলসতা: গণিত বা রচনার মতো মৌলিক বিষয়ে নিজে ভাবার পরিবর্তে প্রস্তুত উত্তর নেওয়ার ফলে চিন্তার জড়তা তৈরি হচ্ছে।
৩. মৌলিকত্বের সংকট: এআই পূর্বের ডেটা রি-প্রডিউস করে, ফলে মানুষের একান্ত ব্যক্তিগত অনুভূতি ও আত্মিক অনুভূতির প্রতিফলন ঘটে না।

বিচারকমণ্ডলীর সিদ্ধান্ত: পক্ষ ও বিপক্ষ উভয় দলের তথ্যভিত্তিক যুক্তি ও বাগ্মিতা অত্যন্ত প্রশংসিত হয়।`
    },
    {
      id: 'deb-2',
      club_id: 'debate',
      type: 'motion',
      type_label: 'বারোয়ারি বিতর্ক প্রস্তাবনা',
      title: 'ডিজিটাল ডিভাইসের যুগেও মুদ্রিত বই-ই মননশীল মানুষ গড়ার শ্রেষ্ঠ সহায়ক',
      author: 'ফারজানা মেহজাবীন',
      class_name: '৯ম শ্রেণি (বিজ্ঞান)',
      roll_no: '৩',
      date: 'মার্চ ২০২৬',
      excerpt: 'পিডিএফ ও ই-বুকের চেয়ে কাগজের স্পর্শ ও সুবাস কেন পাঠককে গভীর চিন্তাশীল করে তোলে তার বাস্তব বিশ্লেষণ...',
      content: `শিরোনাম: "ছাপানো বইয়ের পাতায় বেঁচে থাকে হৃদয়ের স্পন্দন"

ডিজিটাল স্ক্রিনের নীল আলো চোখের ক্ষতি করে, মনোযোগ বিচ্ছিন্ন করে নোটিফিকেশনের বন্যায়। পক্ষান্তরে কাগজের বই পড়ার সময় পাঠক погруз হন গভীর নিস্তব্ধতায়। 

একটি বই যখন হাতে নেওয়া হয়, তখন আঙুলের স্পর্শে নতুন পাতার ঘ্রাণ পাঠকের স্মৃতি ও অনুভূতির অংশ হয়ে যায়। গবেষণায় দেখা গেছে, মুদ্রিত বই পড়লে বিষয়বস্তু মস্তিষ্কে দীর্ঘস্থায়ী স্মৃতি হিসেবে জমা থাকে এবং পাঠকের কল্পনাশক্তি বহু গুণ বৃদ্ধি পায়।

মগড়া পালস্ ডিবেটিং ক্লাব মনে করে, ডিজিটাল বিপ্লবের সময়েও পাঠাগার ও মুদ্রিত বইয়ের স্থান অন্য কিছু নিতে পারে না।`
    },
    {
      id: 'deb-3',
      club_id: 'debate',
      type: 'motion',
      type_label: 'জাতীয় পরিবেশ বিতর্ক',
      title: 'পরিবেশ সুরক্ষাই ভবিষ্যৎ টেকসই অর্থনৈতিক প্রবৃদ্ধির মূল ভিত্তি',
      author: 'রাহাত হাসান ও সুমাইয়া আক্তার',
      class_name: '১০ম ও ৮ম শ্রেণি',
      roll_no: '৫, ৪',
      date: 'জানুয়ারি ২০২৬',
      excerpt: 'জলবায়ু পরিবর্তনের চরম ঝুঁকিতে থাকা বাংলাদেশের জন্য পরিবেশ বাঁচিয়ে অর্থনৈতিক উন্নয়নই একমাত্র টেকসই পথ...',
      content: `প্রস্তাবনা: "পরিবেশ ধ্বংস করে অর্থনৈতিক উন্নয়ন মূলত সাময়িক আত্মঘাতী উন্নয়ন।"

যুক্তি ১: নদীদূষণ, নির্বিচারে বন উজাড় ও বায়ুদূষণের ফলে সৃষ্ট স্বাস্থ্যহানির ব্যয় ভবিষ্যৎ প্রজন্মের সমস্ত অর্থনৈতিক লাভকে গ্রাস করবে।
যুক্তি ২: নবায়নযোগ্য জ্বালানি, সৌরবিদ্যুৎ ও গ্রিন এগ্রিকালচারই আগামী বিশ্ব অর্থনীতিতে নতুন লাখ লাখ কর্মসংস্থান তৈরি করবে।
যুক্তি ৩: কালিহাতির বুক চিরে বয়ে যাওয়া নদীর বাস্তুতন্ত্র রক্ষা করা ছাড়া স্থানীয় কৃষকদের জীবিকা দীর্ঘমেয়াদে সুরক্ষিত থাকবে না।`
    }
  ];

  // Seeded Science Innovation Projects
  const scienceProjects = [
    {
      id: 'sci-1',
      club_id: 'science',
      type: 'project',
      type_label: 'কৃষি প্রযুক্তি ও স্মার্ট উদ্ভাবন',
      title: 'স্বয়ংক্রিয় সৌরচালিত স্মার্ট ড্রিপ ইরিগেশন ও আর্দ্রতা পরিমাপক যন্ত্র',
      author: 'তানভীর আহমেদ ও রাহাত হাসান',
      class_name: '১০ম শ্রেণি (বিজ্ঞান)',
      roll_no: '১, ৫',
      date: 'বিজ্ঞান মেলা ২০২৬',
      excerpt: 'মাটির আর্দ্রতা ৩০%-এর নিচে নামলেই স্বয়ংক্রিয় সেচ চালু এবং ৭০% হলেই বন্ধ! ৪০% পানি ও বিদ্যুৎ সাশ্রয়কারী যন্ত্র...',
      content: `প্রকল্পের নাম: সৌরচালিত স্বয়ংক্রিয় ড্রিপ ইরিগেশন ও ডিজিটাল সয়েল আর্দ্রতা পরিমাপক
উদ্ভাবক: তানভীর আহমেদ ও রাহাত হাসান (১০ম শ্রেণি)
তত্ত্বাবধায়ক: মোঃ হাবিবুর রহমান ও রফিকুল ইসলাম

[সমস্যা ও প্রাসঙ্গিকতা]:
আমাদের দেশের কৃষকেরা সাধারণত জমিতে অতিরিক্ত পানি সেচ দেন, যার ফলে পানির ব্যাপক অপচয় ঘটে এবং গাছের শিকড় পচে যায়। আবার বিদ্যুৎ বিভ্রাটের কারণে সময়মতো সেচ দেওয়া যায় না।

[মূল যন্ত্রাংশ]:
১. আর্ডুইনো ইউনো কন্ট্রোলার
২. ক্যাপাসিটিভ সয়েল ময়েশ্চার সেন্সর
৩. ১২ ভোল্ট সোলার প্যানেল ও ব্যাটারি ব্যাকআপ
৪. মিনি সাবমার্সিবল মোটর ও ড্রিপ পাইপ
৫. এলসিডি ডিসপ্লে (বর্তমান আর্দ্রতা প্রদর্শনের জন্য)

[কার্যপ্রণালী]:
সেন্সর মাটির ভেজা ভাব সার্বক্ষণিক রিড করে। আর্দ্রতা ৩০%-এর নিচে নামলেই আর্ডুইনো রিলে চালু করে পানি দিতে শুরু করে। আর্দ্রতা ৭০% অতিক্রম করলে স্বয়ংক্রিয়ভাবে পাম্প বন্ধ হয়ে যায়। সম্পূর্ণ সিস্টেমটি সৌরবিদ্যুতে চলে বলে কৃষকের কোনো বাড়তি বিদ্যুৎ বিল নেই।`
    },
    {
      id: 'sci-2',
      club_id: 'science',
      type: 'project',
      type_label: 'পরিবেশ ও রসায়ন প্রকল্প',
      title: 'পরিত্যক্ত প্লাস্টিক বর্জ্য থেকে পরিবেশবান্ধব তরল জ্বালানি তৈরি মডেল',
      author: 'ফারজানা মেহজাবীন ও সুমাইয়া খাতুন',
      class_name: '৯ম ও ৮ম শ্রেণি',
      roll_no: '৩, ২',
      date: 'ফেব্রুয়ারি ২০২৬',
      excerpt: 'পাইরোলাইসিস পদ্ধতিতে প্লাস্টিককে অক্সিজেনহীন পাত্রে উত্তপ্ত করে তরল জ্বালানি ও এলপিজি সদৃশ গ্যাসে রূপান্তর...',
      content: `প্রকল্পের বিষয়: থার্মাল পাইরোলাইসিস পদ্ধতিতে প্লাস্টিক বর্জ্য পুনর্ব্যবহার।

[উদ্দেশ্য]:
মগড়া ও কালিহাতি অঞ্চলের রাস্তাঘাট ও ড্রেনে পড়ে থাকা পলিথিন ও প্লাস্টিক বোতল পরিবেশের জন্য মারাত্মক হুমকি। এই বর্জ্যকে সম্পদে রূপান্তর করাই এই প্রজেক্টের লক্ষ্য।

[পদ্ধতি]:
একটি সিল করা লোহার প্রকোষ্ঠে প্লাস্টিক ভরে অক্সিজেন ছাড়া ৪০০-৪৫০ ডিগ্রি সেলসিয়াস তাপমাত্রায় উত্তপ্ত করা হয়। ফলে প্লাস্টিকের পলিমার শৃঙ্খল ভেঙে হাইড্রোকার্বন বাষ্পে পরিণত হয়। সেই বাষ্পকে কনডেনসারের মধ্য দিয়ে ঠান্ডা করলে তরল সিন্থেটিক জ্বালানি পাওয়া যায় যা ডিজেলচালিত পাম্প বা জেনারেটরে অনায়াসে ব্যবহার করা যায়।`
    },
    {
      id: 'sci-3',
      club_id: 'science',
      type: 'project',
      type_label: 'জিওফিজিক্স ও দুর্যোগ ব্যবস্থাপনা',
      title: 'ভূমিকম্প ও বন্যা পূর্বাভাস সংকেত ব্যবস্থা (Early Warning System)',
      author: 'মাহফুজ আহমেদ ও দল',
      class_name: '১০ম শ্রেণি',
      roll_no: '২',
      date: 'জানুয়ারি ২০২৬',
      excerpt: 'কম্পন সেন্সর ও ওয়াটার লেভেল সেন্সর ব্যবহার করে দুর্যোগের পূর্বে জোরালো সাইরেন বাজানোর স্বয়ংক্রিয় প্রজেক্ট...',
      content: `প্রকল্পের সারসংক্ষেপ:
ভূমিকম্পের প্রাথমিক পি-তরঙ্গ (Primary Wave) শনাক্ত করতে পারে এমন একটি সংবেদনশীল জাইরো-অ্যাক্সিলোমিটার সেন্সর ব্যবহার করে এই অ্যালার্মটি তৈরি করা হয়েছে। মূল ক্ষতিকর এস-তরঙ্গ আসার ৫ থেকে ১৫ সেকেন্ড পূর্বে এটি স্বয়ংক্রিয় সাইরেন বাজিয়ে শ্রেণিকক্ষের শিক্ষার্থীদের সতর্ক করে এবং জরুরি নির্গমন বাতি জ্বালিয়ে দেয়।`
    }
  ];

  // Seeded ICT & Coding Projects
  const ictProjects = [
    {
      id: 'ict-1',
      club_id: 'ict',
      type: 'software',
      type_label: 'ওয়েব অ্যাপ ও ডাটা সলিউশন',
      title: 'মগড়া স্কুল ডিজিটাল রেজাল্ট ও স্বয়ংক্রিয় জিপিএ ক্যালকুলেটর',
      author: 'ফারজানা মেহজাবীন ও তানভীর আহমেদ',
      class_name: '৯ম ও ১০ম শ্রেণি',
      roll_no: '৩, ১',
      date: 'জানুয়ারি ২০২৬',
      excerpt: 'জাভাস্ক্রিপ্ট দিয়ে তৈরি রেজাল্ট ক্যালকুলেটর: বিষয়ভিত্তিক প্রাপ্ত নম্বর দিলেই স্বয়ংক্রিয় গ্রেড ও মার্কশিট প্রিন্ট...',
      content: `প্রজেক্টের নাম: মগড়া রেজাল্ট ও গ্রেডিং ক্যালকুলেটর ওয়েব অ্যাপ
প্রযুক্তি: HTML5, CSS3, JavaScript (Vanilla ES6), LocalStorage
মেন্টর: মুহাম্মদ আবুবকর সিদ্দিক (আইসিটি শিক্ষক ও সুপার অ্যাডমিন)

[মূল উদ্দেশ্য]:
পরীক্ষার পর শিক্ষার্থীদের নিজ নিজ গ্রেড পয়েন্ট হিসাব করা নিয়ে জটিলতা দূর করতে এই হালকা ও অফলাইন-সক্ষম ওয়েব অ্যাপ তৈরি করা হয়েছে।

[বৈশিষ্ট্যসমূহ]:
১. ৬ষ্ঠ থেকে ১০ম শ্রেণির যে কোনো বিষয়ের নম্বর ইনপুট দেওয়ার সাথে সাথে জাতীয় শিক্ষাক্রম বোর্ড অনুযায়ী লেটার গ্রেড (A+, A, A-, B, C, D, F) ও গ্রেড পয়েন্ট (৫.০০ স্কেল) প্রদর্শন করে।
২. ৪র্থ বিষয়ের অতিরিক্ত পয়েন্ট স্বয়ংক্রিয় সমন্বয় করে মোট জিপিএ নির্ধারণ করে।
৩. এক ক্লিকে দৃষ্টিনন্দন মার্কশিট প্রিন্ট ও পিডিএফ আকারে সংরক্ষণ করা যায়।`
    },
    {
      id: 'ict-2',
      club_id: 'ict',
      type: 'software',
      type_label: 'ডিজিটাল লাইব্রেরি সার্চ ইঞ্জিন',
      title: 'মগড়া ডিজিটাল লাইব্রেরি বুক ক্যাটালগ ও সার্চ ইঞ্জিন',
      author: 'রাহাত হাসান ও কোডার টিম',
      class_name: '১০ম শ্রেণি',
      roll_no: '৫',
      date: 'ফেব্রুয়ারি ২০২৬',
      excerpt: 'বিদ্যালয়ের ১,২০০+ বই এক পলকে খুঁজে বের করার লাইভ ফিল্টারিং সার্চ ইঞ্জিন ও বুক ট্র্যাকার...',
      content: `প্রজেক্টের বিবরণ:
গ্রন্থাগারের শেলফে থাকা যেকোনো বই নাম, লেখক কিংবা শ্রেণি দিয়ে সার্চ করার জন্য দ্রুতগতির ইনডেক্সিং অ্যালগরিদম ব্যবহার করে তৈরি। 

অ্যাপটিতে শিক্ষার্থীদের জন্য বই বুকিং দেওয়ার সুবিধা রয়েছে। কোনো বই ইতিমধ্যে অন্য কেউ ধার নিয়ে থাকলে তা লাল রঙে প্রদর্শন করে এবং সম্ভাব্য ফেরতের তারিখ জানিয়ে দেয়।`
    },
    {
      id: 'ict-3',
      club_id: 'ict',
      type: 'software',
      type_label: 'সাইবার নিরাপত্তা গেম',
      title: 'সাইবার ক্রাইম প্রতিরোধ ও নিরাপদ ইন্টারনেট সচেতনতামূলক কুইজ গেম',
      author: 'নাফিজা ইসলাম ও মাহির ফয়সাল',
      class_name: '৯ম ও ৭ম শ্রেণি',
      roll_no: '৪, ১',
      date: 'মার্চ ২০২৬',
      excerpt: 'স্ক্র্যাচ ও এইচটিএমএল ক্যানভাসে তৈরি শিক্ষণীয় গেম: ফিশিং লিংক ও অপরিচিত মেসেজ চেনার বাস্তব গেমপ্লে...',
      content: `প্রজেক্টের উদ্দেশ্য:
সোশ্যাল মিডিয়া ও ইন্টারনেটে সাইবার বুলিং এবং ফিশিং ফাঁদ থেকে কিশোর-কিশোরীদের সচেতন করা। 

গেমটিতে বিভিন্ন বাস্তব দৃশ্যপট (যেমন: লটারি জেতার ভুয়া লিংক, পাসওয়ার্ড চুরি চেষ্টা) দেখানো হয়। শিক্ষার্থী সঠিক উত্তর দিয়ে বিপদ এড়িয়ে লেভেল পার করে সাইবার চ্যাম্পিয়ন মেডেল পায়।`
    }
  ];

  // Combined articles for active club
  const activeItems = activeClub === 'debate'
    ? [...debateMotions, ...submissionsList.filter(s => s.club_id === 'debate' && s.status === 'approved')]
    : activeClub === 'science'
    ? [...scienceProjects, ...submissionsList.filter(s => s.club_id === 'science' && s.status === 'approved')]
    : activeClub === 'ict'
    ? [...ictProjects, ...submissionsList.filter(s => s.club_id === 'ict' && s.status === 'approved')]
    : [...kisholoyArticles, ...submissionsList.filter(s => (s.club_id === 'literature' || !s.club_id) && s.status === 'approved')];

  return (
    <div className="lit-club-wrapper">
      <style>{`
        .lit-club-wrapper {
          font-family: 'Hind Siliguri', 'Inter', -apple-system, sans-serif;
          color: #1e293b;
        }
        .club-selector-bar {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }
        .club-switch-btn {
          flex: 1;
          min-width: 140px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: #475569;
          font-weight: 700;
          font-size: 13px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          text-align: center;
        }
        .club-switch-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 2px 5px rgba(0,0,0,0.08);
          font-weight: 800;
        }
        .lit-hero {
          background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%);
          color: #ffffff;
          padding: 24px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(4, 120, 87, 0.2);
          position: relative;
          overflow: hidden;
        }
        .debate-hero {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
          color: #ffffff;
          padding: 24px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(49, 46, 129, 0.25);
          position: relative;
          overflow: hidden;
        }
        .science-hero {
          background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%);
          color: #ffffff;
          padding: 24px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(4, 120, 87, 0.2);
          position: relative;
          overflow: hidden;
        }
        .ict-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%);
          color: #ffffff;
          padding: 24px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
          position: relative;
          overflow: hidden;
        }
        .lit-hero-tagline {
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: rgba(255,255,255,0.18);
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .lit-hero-title {
          font-size: 24px;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -0.3px;
        }
        .lit-hero-sub {
          font-size: 13.5px;
          line-height: 1.6;
          max-width: 850px;
          margin: 0 0 14px 0;
          opacity: 0.95;
        }
        .lit-hero-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .lit-pill {
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.25);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .lit-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 6px;
          margin-bottom: 20px;
          background: #f8fafc;
          padding: 6px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .lit-tab-btn {
          flex: 1;
          min-width: 120px;
          border: none;
          background: transparent;
          color: #475569;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          white-space: nowrap;
        }
        .lit-tab-btn.active {
          background: #0f172a;
          color: #ffffff;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.25);
        }
        .pillar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }
        .pillar-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          border-top: 3px solid #047857;
        }
        .pillar-card h4 {
          margin: 8px 0 5px 0;
          font-size: 15px;
          color: #0f172a;
          font-weight: 800;
        }
        .pillar-card p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .moderator-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          gap: 14px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .moderator-photo {
          width: 68px;
          height: 68px;
          min-width: 68px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #10b981;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .moderator-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .kisholoy-card {
          background: #fffdf9;
          border: 1px solid #f2e8dc;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 14px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.03);
          border-left: 4px solid #b45309;
          transition: transform 0.2s;
        }
        .kisholoy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.06);
        }
        .event-timeline {
          position: relative;
          padding-left: 24px;
          margin-top: 10px;
        }
        .event-timeline::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #cbd5e1;
        }
        .event-row {
          position: relative;
          margin-bottom: 18px;
        }
        .event-row::before {
          content: '•';
          position: absolute;
          left: -24px;
          top: 0;
          font-size: 26px;
          color: #047857;
          line-height: 16px;
        }
        .achievement-badge-card {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      {/* TOP CLUB SELECTOR BAR */}
      <div className="club-selector-bar">
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'literature' ? 'active' : ''}`}
          onClick={() => { setActiveClub('literature'); setClubTab('overview'); }}
        >
          📚 ভাষা ও সাহিত্য ক্লাব
        </button>
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'debate' ? 'active' : ''}`}
          onClick={() => { setActiveClub('debate'); setClubTab('overview'); }}
        >
          🎤 ডিবেটিং ক্লাব (বিতর্ক)
        </button>
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'science' ? 'active' : ''}`}
          onClick={() => { setActiveClub('science'); setClubTab('overview'); }}
        >
          🔬 বিজ্ঞান ক্লাব (মেলা ও উদ্ভাবন)
        </button>
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'ict' ? 'active' : ''}`}
          onClick={() => { setActiveClub('ict'); setClubTab('overview'); }}
        >
          💻 আইসিটি ও কোডিং ক্লাব
        </button>
      </div>

      {/* DYNAMIC CLUB HERO BANNER */}
      {activeClub === 'debate' ? (
        <div className="debate-hero">
          <div className="lit-hero-tagline">
            ✨ যুক্তি দিয়ে সত্যের অন্বেষণ • বাচনভঙ্গি ও নেতৃত্বের নব দিগন্ত
          </div>
          <h2 className="lit-hero-title">মগড়া পালস্ ডিবেটিং ক্লাব (Debating Society)</h2>
          <p className="lit-hero-sub">
            “যুক্তির আলোয় কাটুক অন্ধকারের মেঘ, শাণিত হোক সত্যের বিবেক” — প্রাতিষ্ঠানিক বিতর্কচর্চা, জাতীয় ও সংসদীয় বিতর্ক, উপস্থিত বক্তৃতা ও বাচনভঙ্গি উন্নয়নের মাধ্যমে শিক্ষার্থীদের যুক্তিবাদী, কুসংস্কারমুক্ত ও আত্মপ্রত্যয়ী নাগরিক হিসেবে গড়ে তোলার অন্যতম শ্রেষ্ঠ মঞ্চ।
          </p>
          <div className="lit-hero-pills">
            <span className="lit-pill">🏛️ স্থাপিত: ২০২০ খ্রি.</span>
            <span className="lit-pill">⚔️ নিয়মিত সেশন: প্রতি শনিবার বিকাল ৩:০০</span>
            <span className="lit-pill">🏆 কালিহাতি উপজেলা রানার্স-আপ ২০২৫</span>
            <span className="lit-pill">🎤 সংসদীয় ও বারোয়ারি বিতর্কচর্চা</span>
            <span className="lit-pill">👥 ১২০+ সক্রিয় বিতার্কিক সদস্য</span>
          </div>
        </div>
      ) : activeClub === 'science' ? (
        <div className="science-hero">
          <div className="lit-hero-tagline">
            ✨ বিজ্ঞানের আলোয় কুসংস্কারের অবসান • খুদে বিজ্ঞানীদের জয়যাত্রা
          </div>
          <h2 className="lit-hero-title">মগড়া পালস্ ইয়ুথ সায়েন্স ক্লাব (Science Society)</h2>
          <p className="lit-hero-sub">
            “উদ্ভাবনে তাক লাগাবে গ্রাম, বিজ্ঞানেই গড়ব দেশের নাম” — রোবটিক্স, পরিবেশবান্ধব প্রযুক্তি, স্বয়ংক্রিয় সেচ, নবায়নযোগ্য শক্তি ও খুদে উদ্ভাবন প্রকল্পের মাধ্যমে শিক্ষার্থীদের বিজ্ঞানের বাস্তব রূপ অনুধাবনে উদ্বুদ্ধ করার সর্বাধুনিক প্ল্যাটফর্ম।
          </p>
          <div className="lit-hero-pills">
            <span className="lit-pill">🏛️ স্থাপিত: ২০১৯ খ্রি.</span>
            <span className="lit-pill">🔬 আধুনিক বিজ্ঞান ল্যাব</span>
            <span className="lit-pill">🚀 বার্ষিক বিজ্ঞান মেলা ও সায়েন্স ফেস্ট</span>
            <span className="lit-pill">🏆 জেলা পর্যায়ে খুদে উদ্ভাবন পদক</span>
            <span className="lit-pill">👥 ১৪০+ খুদে বিজ্ঞানী সদস্য</span>
          </div>
        </div>
      ) : activeClub === 'ict' ? (
        <div className="ict-hero">
          <div className="lit-hero-tagline">
            ✨ স্মার্ট বাংলাদেশ ও প্রযুক্তি নেতৃত্বের প্রতীক • শেখ রাসেল ল্যাব
          </div>
          <h2 className="lit-hero-title">মগড়া পালস্ ডিজিটাল আইসিটি ও কোডিং ক্লাব</h2>
          <p className="lit-hero-sub">
            “কোডের ছন্দে গড়ব ভবিষ্যৎ, প্রযুক্তির আলোয় আলোকিত হোক জগৎ” — কম্পিউটার প্রোগ্রামিং, পাইথন, স্ক্র্যাচ গেম মেকিং, ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন ও সাইবার নিরাপত্তা সচেতনতায় শিক্ষার্থীদের বিশ্বমানের দক্ষতায় প্রস্তুত করার ডিজিটাল কেন্দ্র।
          </p>
          <div className="lit-hero-pills">
            <span className="lit-pill">🏛️ স্থাপিত: ২০২১ খ্রি.</span>
            <span className="lit-pill">💻 শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব</span>
            <span className="lit-pill">🐍 পাইথন, স্ক্র্যাচ ও এইচটিএমএল বুটক্যাম্প</span>
            <span className="lit-pill">🛡️ সাইবার সচেতনতা সার্টিফাইড ক্লাব</span>
            <span className="lit-pill">👥 ১১০+ খুদে কোডার সদস্য</span>
          </div>
        </div>
      ) : (
        <div className="lit-hero">
          <div className="lit-hero-tagline">
            ✨ ঐতিহ্যবাহী মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • ভাষা আন্দোলন ও সাহিত্যের আলোয় উদ্ভাসিত
          </div>
          <h2 className="lit-hero-title">মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব</h2>
          <p className="lit-hero-sub">
            “শব্দের শক্তিতে বিকশিত মেধা, সাহিত্যের আলোয় আলোকিত চেতনা” — মাতৃভাষার শুদ্ধ উচ্চারণ, সৃজনশীল লেখালেখি, কবিতা আবৃত্তি, দেয়াল পত্রিকা ‘কিশলয়’ এবং ইংরেজি কথ্যচর্চায় শিক্ষার্থীদের আত্মবিশ্বাসী করে তোলার নিবেদিত অঙ্গন।
          </p>
          <div className="lit-hero-pills">
            <span className="lit-pill">🏛️ স্থাপিত: ২০১৯ খ্রি.</span>
            <span className="lit-pill">📰 ত্রৈমাসিক দেয়াল পত্রিকা: 'কিশলয়'</span>
            <span className="lit-pill">📖 পাঠচক্র: প্রতি বৃহস্পতিবার বিকাল ৩:৩০</span>
            <span className="lit-pill">🏆 জেলা ও উপজেলা চ্যাম্পিয়নশিপ জয়ী</span>
            <span className="lit-pill">👥 ১৫০+ সক্রিয় শিক্ষার্থী সদস্য</span>
          </div>
        </div>
      )}

      {/* INTERNAL 6 SUB-TABS NAVIGATION */}
      <div className="lit-tabs">
        <button
          type="button"
          className={`lit-tab-btn ${clubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setClubTab('overview')}
        >
          🌟 পরিচিতি ও ৪টি স্তম্ভ
        </button>
        <button
          type="button"
          className={`lit-tab-btn ${clubTab === 'advisors' ? 'active' : ''}`}
          onClick={() => setClubTab('advisors')}
        >
          👨‍🏫 উপদেষ্টা ও মডারেটর পরিষদ
        </button>
        <button
          type="button"
          className={`lit-tab-btn ${clubTab === 'showcase' ? 'active' : ''}`}
          onClick={() => setClubTab('showcase')}
        >
          {activeClub === 'debate' ? '⚔️ বিতর্ক ও যুক্তিমঞ্চ' :
           activeClub === 'science' ? '🚀 বিজ্ঞান উদ্ভাবন গ্যালারি' :
           activeClub === 'ict' ? '💻 সফটওয়্যার ও কোডিং শোকেস' :
           '📰 দেয়াল পত্রিকা "কিশলয়"'}
        </button>
        <button
          type="button"
          className={`lit-tab-btn ${clubTab === 'programs' ? 'active' : ''}`}
          onClick={() => setClubTab('programs')}
        >
          🎯 বাৎসরিক কর্মসূচি ও ক্যালেন্ডার
        </button>
        <button
          type="button"
          className={`lit-tab-btn ${clubTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setClubTab('achievements')}
        >
          🏆 অর্জন ও ট্রফি গ্যালারি
        </button>
        <button
          type="button"
          className={`lit-tab-btn ${clubTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setClubTab('submissions')}
        >
          {activeClub === 'debate' ? '📝 বিতর্ক প্রস্তাবনা ও সদস্যপদ' :
           activeClub === 'science' ? '🔬 প্রজেক্ট জমা ও বিজ্ঞান মেলা' :
           activeClub === 'ict' ? '💻 কোডিং প্রজেক্ট ও সদস্যপদ' :
           '📝 লেখা জমা ও সদস্যপদ'}
        </button>
      </div>

      {/* ===================== TAB 1: OVERVIEW ===================== */}
      {clubTab === 'overview' && (
        <div>
          {activeClub === 'debate' ? (
            <div>
              <h3 style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 12px 0' }}>
                🌟 ডিবেটিং ক্লাবের ৪টি মূল স্তম্ভ
              </h3>
              <div className="pillar-grid">
                <div className="pillar-card" style={{ borderTopColor: '#312e81' }}>
                  <div style={{ fontSize: '26px' }}>⚖️</div>
                  <h4>সংসদীয় বিতর্ক ও যুক্তি কাঠামো</h4>
                  <p>জাতীয় ও ব্রিটিশ পার্লামেন্টারি (BP) ফরম্যাটে সরকারি ও বিরোধী দলের নিখুঁত যুক্তি বিনির্মাণ ও খণ্ডন প্রশিক্ষণ।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#312e81' }}>
                  <div style={{ fontSize: '26px' }}>🎤</div>
                  <h4>বারোয়ারি ও উপস্থিত বক্তৃতা</h4>
                  <p>সমসাময়িক দেশীয় ও আন্তর্জাতিক বিষয়ে তাৎক্ষণিক বক্তব্য উপস্থাপন, বাচনভঙ্গি ও মঞ্চভীতি দূরীকরণ।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#312e81' }}>
                  <div style={{ fontSize: '26px' }}>🇬🇧</div>
                  <h4>English Public Debate</h4>
                  <p>ইংরেজিতে সাবলীল যুক্তি উপস্থাপন, পাবলিক স্পিকিং এবং জাতীয় পর্যায়ের ইংরেজি বিতর্ক প্রতিযোগিতার প্রস্তুতি।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#312e81' }}>
                  <div style={{ fontSize: '26px' }}>🔍</div>
                  <h4>তথ্য যাচাই ও ফ্যাক্ট-চেকিং ল্যাব</h4>
                  <p>লজিক্যাল ফ্যালাসি (Logical Fallacies) চেনা, তথ্যের প্রামাণিকতা যাচাই ও বস্তুনিষ্ঠ তথ্যনির্ভর যুক্তিচর্চা।</p>
                </div>
              </div>

              {/* Debate Club Vow & Manifesto */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#312e81', fontSize: '15px' }}>📜 বিতার্কিকের নীতি ও শপথ</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
                  “আমরা বিতর্ক করি সত্য জানার জন্য, প্রতিপক্ষকে অপমান করার জন্য নয়। যুক্তিই আমাদের একমাত্র হাতিয়ার, শালীনতা আমাদের ভূষণ এবং সত্য প্রতিষ্ঠাই আমাদের চূড়ান্ত লক্ষ্য।”
                </p>
              </div>
            </div>
          ) : activeClub === 'science' ? (
            <div>
              <h3 style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 12px 0' }}>
                🌟 বিজ্ঞান ক্লাবের ৪টি মূল স্তম্ভ
              </h3>
              <div className="pillar-grid">
                <div className="pillar-card" style={{ borderTopColor: '#047857' }}>
                  <div style={{ fontSize: '26px' }}>🔬</div>
                  <h4>খুদে উদ্ভাবন ও প্রজেক্ট মেকিং</h4>
                  <p>দৈনন্দিন জীবনের সমস্যা সমাধানে সেন্সর, আর্ডুইনো ও পুনর্ব্যবহারযোগ্য সামগ্রী দিয়ে কার্যকরী প্রজেক্ট তৈরি।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#047857' }}>
                  <div style={{ fontSize: '26px' }}>🌿</div>
                  <h4>পরিবেশবান্ধব ও নবায়নযোগ্য জ্বালানি</h4>
                  <p>সৌরশক্তি, বায়োগ্যাস, বর্জ্য প্লাস্টিক রিসাইক্লিং ও মগড়া অঞ্চলের ভূগর্ভস্থ পানি সুরক্ষায় সায়েন্স মডেল।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#047857' }}>
                  <div style={{ fontSize: '26px' }}>📐</div>
                  <h4>গণিত ও বিজ্ঞান অলিম্পিয়াড</h4>
                  <p>জাতীয় গণিত অলিম্পিয়াড, পদার্থবিজ্ঞান ও জীববিজ্ঞান অলিম্পিয়াডের সমস্যা সমাধান ও বিশেষ প্রশিক্ষণ ক্যাম্প।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#047857' }}>
                  <div style={{ fontSize: '26px' }}>🧪</div>
                  <h4>হাতে-কলমে ল্যাব পরীক্ষণ</h4>
                  <p>পদার্থ, রসায়ন ও জীববিজ্ঞানের ক্লাসরুম তত্ত্বকে বিদ্যালয়ের বিজ্ঞান ল্যাবরেটরিতে হাতে-কলমে প্রমাণ করা।</p>
                </div>
              </div>

              {/* Science Club Mission */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#047857', fontSize: '15px' }}>🔬 খুদে বিজ্ঞানীদের অঙ্গীকার</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
                  “অন্ধবিশ্বাস নয়—প্রমাণ চাই; কুসংস্কার নয়—বিজ্ঞান চাই। গ্রামবাংলার মাটি ও মানুষকে ভালোবেসে প্রযুক্তির উদ্ভাবনে আমরা গড়ব সোনার বাংলাদেশ।”
                </p>
              </div>
            </div>
          ) : activeClub === 'ict' ? (
            <div>
              <h3 style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 12px 0' }}>
                🌟 আইসিটি ও কোডিং ক্লাবের ৪টি মূল স্তম্ভ
              </h3>
              <div className="pillar-grid">
                <div className="pillar-card" style={{ borderTopColor: '#0284c7' }}>
                  <div style={{ fontSize: '26px' }}>💻</div>
                  <h4>হাতে-কলমে কোডিং ও পাইথন</h4>
                  <p>স্ক্র্যাচ দিয়ে অ্যানিমেশন ও গেম তৈরি থেকে শুরু করে পাইথন ও জাভাস্ক্রিপ্টে অ্যালগরিদম ও সমস্যা সমাধান।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#0284c7' }}>
                  <div style={{ fontSize: '26px' }}>🌐</div>
                  <h4>ওয়েব ডিজাইন ও ডিজিটাল অ্যাপস</h4>
                  <p>HTML5, CSS3 ও রেসপনসিভ ওয়েব ডিজাইন শিখে বিদ্যালয়ের লাইব্রেরি, রেজাল্ট ও কুইজ সফটওয়্যার নির্মাণ।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#0284c7' }}>
                  <div style={{ fontSize: '26px' }}>🛡️</div>
                  <h4>সাইবার নিরাপত্তা ও ডিজিটাল সচেতনতা</h4>
                  <p>নিরাপদ ইন্টারনেট ব্যবহার, পাসওয়ার্ড নিরাপত্তা, ফিশিং প্রতিরোধ এবং সামাজিক যোগাযোগ মাধ্যমের সঠিক ব্যবহার।</p>
                </div>
                <div className="pillar-card" style={{ borderTopColor: '#0284c7' }}>
                  <div style={{ fontSize: '26px' }}>🤖</div>
                  <h4>শেখ রাসেল ডিজিটাল ল্যাব ওয়ার্কশপ</h4>
                  <p>আধুনিক কম্পিউটার ল্যাবে অফিস অ্যাপ্লিকেশন, গ্রাফিক্স ডিজাইন ও রোবোটিক্স লজিকের নিয়মিত সাপ্তাহিক প্রশিক্ষণ।</p>
                </div>
              </div>

              {/* ICT Club Mission */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0284c7', fontSize: '15px' }}>💻 ডিজিটাল প্রজন্মের ভবিষ্যৎ রূপরেখা</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
                  “প্রযুক্তির কেবল ভোক্তা হব না—আমরা হব প্রযুক্তির নির্মাতা। কোডের শক্তিতে মগড়া থেকে বিশ্বমঞ্চে ছড়িয়ে পড়বে আমাদের উদ্ভাবন।”
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 12px 0' }}>
                🌟 ভাষা ও সাহিত্য ক্লাবের ৪টি মূল স্তম্ভ
              </h3>
              <div className="pillar-grid">
                <div className="pillar-card">
                  <div style={{ fontSize: '26px' }}>🗣️</div>
                  <h4>শুদ্ধ উচ্চারণ ও প্রমিত বাচন</h4>
                  <p>প্রমিত বাংলা ভাষার নির্ভুল উচ্চারণ, স্বরভঙ্গি, জড়তা কাটানো এবং সুন্দর বাচনভঙ্গির নিয়মিত কর্মশালা পরিচালনা।</p>
                </div>
                <div className="pillar-card">
                  <div style={{ fontSize: '26px' }}>✍️</div>
                  <h4>সৃজনশীল সাহিত্যচর্চা</h4>
                  <p>কবিতা, ছোটগল্প, প্রবন্ধ, স্মৃতিচারণ ও ছড়া রচনার মাধ্যমে শিক্ষার্থীদের সুপ্ত কল্পনাশক্তি ও মননশীলতা শাণিত করা।</p>
                </div>
                <div className="pillar-card">
                  <div style={{ fontSize: '26px' }}>🇬🇧</div>
                  <h4>English & Vocabulary</h4>
                  <p>সহজ ইংরেজি যোগাযোগ (Spoken English), শব্দভাণ্ডার বৃদ্ধি, সৃজনশীল ইংরেজি প্রবন্ধ রচনা ও উপস্থিত বক্তৃতাচর্চা।</p>
                </div>
                <div className="pillar-card">
                  <div style={{ fontSize: '26px' }}>📖</div>
                  <h4>বৃহস্পতিবারের পাঠচক্র</h4>
                  <p>বিদ্যালয় লাইব্রেরিতে প্রতি বৃহস্পতিবার পছন্দের বই পাঠ, বুক রিভিউ লেখা ও সাহিত্যের বিভিন্ন ধারা নিয়ে গঠনমূলক উন্মুক্ত আলোচনা।</p>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Club Announcements Live Synced from Admin */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '15px' }}>📢 ক্লাবের সর্বশেষ ঘোষণা ও নোটিশ</h4>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>লাইভ সিঙ্ক</span>
            </div>
            {dynamicContent.filter(x => x.content_type === 'club' || (x.title_bn && (
              activeClub === 'debate' ? (x.title_bn.includes('বিতর্ক') || x.title_bn.includes('ডিবেট')) :
              activeClub === 'science' ? (x.title_bn.includes('বিজ্ঞান') || x.title_bn.includes('মেলা') || x.title_bn.includes('উদ্ভাবন')) :
              activeClub === 'ict' ? (x.title_bn.includes('আইসিটি') || x.title_bn.includes('কম্পিউটার') || x.title_bn.includes('কোডিং')) :
              (x.title_bn.includes('সাহিত্য') || x.title_bn.includes('কিশলয়') || x.title_bn.includes('আবৃত্তি'))
            ))).slice(0, 3).map(item => (
              <div key={item.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 0' }}>
                <b style={{ color: '#1e293b', fontSize: '13.5px' }}>{item.title_bn}</b>
                <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 4px' }}>
                  📍 {item.location || 'বিদ্যালয় ক্যাম্পাস'} {item.event_date ? `• 📅 ${item.event_date}` : ''}
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#334155' }}>{item.description}</p>
              </div>
            ))}
            {!dynamicContent.some(x => x.content_type === 'club') && (
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                চলতি সেশনের নিয়মিত কর্মশালা ও প্রশিক্ষণ কার্যক্রম যথারীতি পরিচালিত হচ্ছে।
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: ADVISORS & FACULTY ===================== */}
      {clubTab === 'advisors' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#1e293b' }}>
              👨‍🏫 শিক্ষক উপদেষ্টা ও দায়িত্বপ্রাপ্ত মডারেটর পরিষদ
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
              অভিজ্ঞ শিক্ষকমণ্ডলীর সরাসরি তত্ত্বাবধানে শিক্ষার্থীদের প্রতিভা বিকশিত হচ্ছে:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            {/* Principal (Patron) */}
            <div className="moderator-card" style={{ borderLeft: '4px solid #1e3a8a' }}>
              <div className="moderator-photo">
                <img src={getTeacherPhoto(headMaster)} alt={headMaster.name_bn} />
              </div>
              <div>
                <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>প্রধান পৃষ্ঠপোষক</span>
                <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{headMaster.name_bn}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>{headMaster.designation || 'প্রধান শিক্ষক'}</p>
                <small style={{ color: '#0369a1', fontSize: '11.5px', fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
                  “সহশিক্ষা কার্যক্রম শিক্ষার্থীদের মানবিক ও বুদ্ধিবৃত্তিক মেধার পরিপূর্ণ বিকাশ ঘটায়।”
                </small>
              </div>
            </div>

            {/* Club Specific Moderators */}
            {activeClub === 'debate' ? (
              <>
                {/* Advisor: Tapasi Sarker */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(asstHead)} alt={asstHead.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>সভাপতি ও প্রধান উপদেষ্টা</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{asstHead.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>{asstHead.designation || 'সহকারী প্রধান শিক্ষক'}</p>
                    <small style={{ color: '#6d28d9', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: বিতর্ক কাউন্সিলের সামগ্রিক পরিচালনা ও আন্তঃপ্রতিষ্ঠান বিতর্ক প্রতিযোগিতা সমন্বয়
                    </small>
                  </div>
                </div>

                {/* Main Moderator: Md. Abdul Khaleq */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #312e81' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(khaleqTeacher)} alt={khaleqTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>প্রধান মডারেটর (বাংলা বিতর্ক)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{khaleqTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (বাংলা) • বি.এ (অনার্স), এম.এ</p>
                    <small style={{ color: '#3730a3', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: সংসদীয় ও বারোয়ারি বিতর্কের যুক্তি প্রশিক্ষণ ও সাপ্তাহিক বিতর্ক সেশন সঞ্চালনা
                    </small>
                  </div>
                </div>

                {/* Co-Moderator: Ashraful */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #d97706' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(ashrafulTeacher)} alt={ashrafulTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>সহকারী মডারেটর (ইংরেজি বিতর্ক)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{ashrafulTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (ইংরেজি)</p>
                    <small style={{ color: '#b45309', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: English Parliamentary Debate ও পাবলিক স্পিকিং ওয়ার্কশপ পরিচালনা
                    </small>
                  </div>
                </div>
              </>
            ) : activeClub === 'science' ? (
              <>
                {/* Main Moderator: Md. Habibur Rahman */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #047857' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(habiburTeacher)} alt={habiburTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>প্রধান মডারেটর (বিজ্ঞান ও গণিত)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{habiburTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সিনিয়র শিক্ষক (গণিত ও সাধারণ বিজ্ঞান)</p>
                    <small style={{ color: '#047857', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: বার্ষিক বিজ্ঞান মেলা পরিচালনা, প্রজেক্ট মেন্টরিং ও গণিত অলিম্পিয়াড সমন্বয়
                    </small>
                  </div>
                </div>

                {/* Co-Moderator: Rafiqul Islam */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #0891b2' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(rafiqulTeacher)} alt={rafiqulTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#cffafe', color: '#155e75', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>সহ-মডারেটর (ভৌত বিজ্ঞান ও প্রজেক্ট)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{rafiqulTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (ভৌত বিজ্ঞান)</p>
                    <small style={{ color: '#0e7490', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: সায়েন্স ল্যাব পরীক্ষণ, ইলেকট্রনিক্স ও নবায়নযোগ্য জ্বালানি উদ্ভাবন তত্ত্বাবধান
                    </small>
                  </div>
                </div>

                {/* Biology Advisor: Abdur Rahim Liton */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #16a34a' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(abdurRahimTeacher)} alt={abdurRahimTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>উপদেষ্টা (জীববিজ্ঞান ও পরিবেশ)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{abdurRahimTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সিনিয়র শিক্ষক (জীববিজ্ঞান)</p>
                    <small style={{ color: '#15803d', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: বোটানিক্যাল গবেষণা, পরিবেশ ক্লাব ও পানি বিশুদ্ধকরণ প্রজেক্ট তত্ত্বাবধান
                    </small>
                  </div>
                </div>
              </>
            ) : activeClub === 'ict' ? (
              <>
                {/* Director & Lead Moderator: Md. Abubakor Siddiq */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #0284c7' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(ictTeacher)} alt={ictTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>প্রধান মডারেটর ও আইসিটি পরিচালক</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{ictTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (আইসিটি) ও সুপার অ্যাডমিন</p>
                    <small style={{ color: '#0284c7', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: শেখ রাসেল কম্পিউটার ল্যাব পরিচালনা, পাইথন/ওয়েব কোডিং প্রশিক্ষণ ও স্কুল অটোমেশন
                    </small>
                  </div>
                </div>

                {/* Co-Moderator: Md. Shahin Mia */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #6366f1' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(shahinTeacher)} alt={shahinTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>সহ-মডারেটর (ডিজিটাল ডেটা ও লাইব্রেরি)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{shahinTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (গ্রন্থাগার ও তথ্য বিজ্ঞান)</p>
                    <small style={{ color: '#4338ca', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: ডিজিটাল লাইব্রেরি সফটওয়্যার ও অনলাইন রিসোর্স আর্কাইভ ব্যবস্থাপনা
                    </small>
                  </div>
                </div>

                {/* Advisor: Tapasi Sarker */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(asstHead)} alt={asstHead.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>উপদেষ্টা (স্মার্ট শিক্ষা রূপান্তর)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{asstHead.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>{asstHead.designation || 'সহকারী প্রধান শিক্ষক'}</p>
                    <small style={{ color: '#6d28d9', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: আইসিটি অলিম্পিয়াড ও সরকারি স্মার্ট স্কুল পার্টনারশিপ সমন্বয়
                    </small>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Bangla Literature Moderator */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #047857' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(khaleqTeacher)} alt={khaleqTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>প্রধান মডারেটর (বাংলা সাহিত্য)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{khaleqTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (বাংলা) • বি.এ (অনার্স), এম.এ</p>
                    <small style={{ color: '#047857', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: বাংলা সাহিত্য পাঠদান, প্রমিত বানান কর্মশালা ও দেয়াল পত্রিকা ‘কিশলয়’ প্রধান সম্পাদক
                    </small>
                  </div>
                </div>

                {/* English Literature Moderator */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #d97706' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(ashrafulTeacher)} alt={ashrafulTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>সহকারী মডারেটর (ইংরেজি সাহিত্য)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{ashrafulTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (ইংরেজি)</p>
                    <small style={{ color: '#b45309', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: Spoken English Club, Creative Writing ও ইংরেজি শব্দভাণ্ডার সমৃদ্ধিকরণ
                    </small>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Student Executive Council 2026 */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '15px' }}>
              🎓 শিক্ষার্থী কার্যনির্বাহী পরিষদ (২০২৬)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#047857', fontWeight: 700 }}>সভাপতি (শিক্ষার্থী)</small>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>
                  {activeClub === 'debate' ? 'মাহফুজ আহমেদ' :
                   activeClub === 'science' ? 'তানভীর আহমেদ' :
                   activeClub === 'ict' ? 'ফারদিন হাসান' : 'তানভীর আহমেদ'}
                </div>
                <small style={{ color: '#64748b' }}>১০ম শ্রেণি • রোল {activeClub === 'debate' ? '২' : '১'}</small>
              </div>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#047857', fontWeight: 700 }}>সাধারণ সম্পাদক</small>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>
                  {activeClub === 'debate' ? 'সুমাইয়া আক্তার' :
                   activeClub === 'science' ? 'রাহাত হাসান' :
                   activeClub === 'ict' ? 'তানভীর আহমেদ' : 'ফাতেমা আক্তার'}
                </div>
                <small style={{ color: '#64748b' }}>১০ম / ৯ শিক্ষাবর্ষ</small>
              </div>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#047857', fontWeight: 700 }}>যুগ্ম-সাধারণ সম্পাদক</small>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>ফারজানা মেহজাবীন</div>
                <small style={{ color: '#64748b' }}>৯ম শ্রেণি (বিজ্ঞান) • রোল ৩</small>
              </div>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#047857', fontWeight: 700 }}>
                  {activeClub === 'debate' ? 'বিতর্ক গবেষণা সম্পাদক' :
                   activeClub === 'science' ? 'ল্যাব ও উদ্ভাবন সম্পাদক' :
                   activeClub === 'ict' ? 'লিড ডেভেলপার ও কোডার' :
                   'দেয়াল পত্রিকা ও অলঙ্করণ সম্পাদক'}
                </small>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>রাহাত হাসান</div>
                <small style={{ color: '#64748b' }}>১০ম শ্রেণি • রোল ৫</small>
              </div>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#047857', fontWeight: 700 }}>সদস্য সংগ্রহ ও প্রচার</small>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>মাহির ফয়সাল</div>
                <small style={{ color: '#64748b' }}>৭ম শ্রেণি • রোল ১</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: SHOWCASE / KISHOLOY / MOTIONS / PROJECTS ===================== */}
      {clubTab === 'showcase' && (
        <div>
          <div style={{
            background: activeClub === 'debate' ? 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)' :
                        activeClub === 'science' ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' :
                        activeClub === 'ict' ? 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)' :
                        'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
            border: '1px solid #cbd5e1',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', color: '#0f172a', fontWeight: 900 }}>
                {activeClub === 'debate' ? '⚔️ বিতর্ক প্রস্তাবনা (Debate Motions) ও যুক্তিমঞ্চ' :
                 activeClub === 'science' ? '🚀 বিজ্ঞান উদ্ভাবন প্রকল্প ও মডেল প্রদর্শনী' :
                 activeClub === 'ict' ? '💻 ডিজিটাল সফটওয়্যার, অ্যাপস ও কোডিং শোকেস' :
                 '📰 দেয়াল পত্রিকা ‘কিশলয়’ — নির্বাচিত সংখ্যা'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                {activeClub === 'debate' ? 'শিক্ষার্থীদের উপস্থাপিত সাম্প্রতিক জাতীয়, বারোয়ারি ও সংসদীয় বিতর্কের যুক্তি কাঠামো' :
                 activeClub === 'science' ? 'খুদে বিজ্ঞানীদের তৈরিকৃত স্বয়ংক্রিয় মডেল ও বাস্তব সমস্যার বিজ্ঞানভিত্তিক সমাধান' :
                 activeClub === 'ict' ? 'স্ক্র্যাচ, পাইথন ও জাভাস্ক্রিপ্ট দিয়ে তৈরি স্মার্ট সমাধান ও ইন্টারঅ্যাক্টিভ ওয়েব প্রজেক্ট' :
                 'মগড়া পালস্ সাহিত্য ক্লাবের শিক্ষার্থীদের স্বরচিত কবিতা, গল্প ও ছড়ার উন্মুক্ত সাহিত্য সংকলন'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setClubTab('submissions')}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + নতুন জমা দিন
            </button>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {activeItems.map(item => (
              <div key={item.id} className="kisholoy-card" style={{
                borderLeftColor: activeClub === 'debate' ? '#312e81' :
                                activeClub === 'science' ? '#047857' :
                                activeClub === 'ict' ? '#0284c7' : '#b45309'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: activeClub === 'debate' ? '#e0e7ff' : activeClub === 'science' ? '#dcfce7' : activeClub === 'ict' ? '#e0f2fe' : '#fef3c7',
                    color: activeClub === 'debate' ? '#3730a3' : activeClub === 'science' ? '#166534' : activeClub === 'ict' ? '#0369a1' : '#92400e'
                  }}>
                    {item.type_label || item.type}
                  </span>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>{item.date || item.submitted_at || '২০২৬'}</small>
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: 800, lineHeight: '1.4' }}>
                  {item.title}
                </h4>

                <p style={{
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: '1.6',
                  margin: '0 0 10px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.excerpt || item.content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>
                    ✍️ {item.author || item.student_name} <small style={{ color: '#64748b' }}>({item.class_name ? `শ্রেণি ${item.class_name}` : ''})</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReadingItem(item)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    বিস্তারিত দেখুন ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: ANNUAL CALENDAR & PROGRAMS ===================== */}
      {clubTab === 'programs' && (
        <div>
          <h3 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 12px 0' }}>
            🎯 বাৎসরিক কর্মসূচি ও উৎসব ক্যালেন্ডার (২০২৬)
          </h3>

          <div className="event-timeline">
            {activeClub === 'debate' ? (
              <>
                <div className="event-row">
                  <b style={{ color: '#312e81', fontSize: '14px' }}>জানুয়ারি ২০২৬ — বিতার্কিক নবীনবরণ ও অডিশন ক্যাম্প</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    ৬ষ্ঠ থেকে ৯ম শ্রেণির নতুন শিক্ষার্থীদের মধ্যে বিতর্ক অডিশন এবং বাচনভঙ্গি প্রাথমিক প্রশিক্ষণ।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#312e81', fontSize: '14px' }}>ফেব্রুয়ারি ২০২৬ — অমর একুশে আন্তঃশ্রেণি বিতর্ক উৎসব</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    “মাতৃভাষার মর্যাদা ও জ্ঞানচর্চা” শীর্ষক ৮ দলীয় নকআউট সংসদীয় বিতর্ক প্রতিযোগিতা।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#312e81', fontSize: '14px' }}>মার্চ ২০২৬ — স্বাধীনতা দিবস ইংরেজি পাবলিক স্পিকিং প্রতিযোগিতা</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    English Spoken & Parliamentary Debate সেশন এবং সেরা ইংরেজি বক্তা নির্বাচন।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#312e81', fontSize: '14px' }}>মে ২০২৬ — কালিহাতি উপজেলা আন্তঃস্কুল বিতর্ক টুর্নামেন্ট</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    কালিহাতি উপজেলার সেরা স্কুলগুলোর অংশগ্রহণে উপজেলা পর্যায়ের মহাবিতর্ক মেলা।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#312e81', fontSize: '14px' }}>অক্টোবর ২০২৬ — বার্ষিক বিতর্ক অলিম্পিয়াড ও গালা সমাপনী</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    বছরের সেরা বিতার্কিকদের ট্রফি বিতরণ ও অতিথি গুণীজনদের উপস্থিতিতে উৎসবমুখর সমাপনী।
                  </p>
                </div>
              </>
            ) : activeClub === 'science' ? (
              <>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>জানুয়ারি ২০২৬ — খুদে বিজ্ঞানী ওরিয়েন্টেশন ও ল্যাব পরিদর্শন</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    বিজ্ঞানের যন্ত্রপাতি পরিচিতি, নিরাপদ ল্যাব ব্যবহার ও প্রজেক্ট আইডিয়া ব্রেনস্টর্মিং।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>ফেব্রুয়ারি ২০২৬ — জাতীয় বিজ্ঞান ও প্রযুক্তি সপ্তাহ উদ্ভাবন প্রদর্শনী</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    সৌরচালিত সেচ, আর্সেনিক ফিল্টার ও রোবোটিক্স মডেলের উপজেলা পর্যায়ে উপস্থাপন।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>এপ্রিল ২০২৬ — আন্তঃশ্রেণি গণিত ও বিজ্ঞান অলিম্পিয়াড</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    গাণিতিক ধাঁধা, পদার্থবিজ্ঞান ও জীববিজ্ঞানের কুইজ এবং দ্রুত সমস্যা সমাধান প্রতিযোগিতা।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>আগস্ট ২০২৬ — পরিবেশ বিজ্ঞান ও ক্লিন ক্যাম্পাস সায়েন্স ড্রাইভ</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    প্লাস্টিক বর্জ্য সংগ্রহ ও রিসাইক্লিং মডেলের মাধ্যমে বিদ্যালয় আঙ্গিনায় গ্রিন ক্যাম্পাস প্রতিষ্ঠা।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>নভেম্বর ২০২৬ — মগড়া বার্ষিক বিজ্ঞান মেলা ২০২৬</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    ৫০+ উদ্ভাবনী প্রজেক্টের উন্মুক্ত প্রদর্শনী এবং সেরা ৩ খুদে বিজ্ঞানী দলকে বিশেষ বৃত্তি প্রদান।
                  </p>
                </div>
              </>
            ) : activeClub === 'ict' ? (
              <>
                <div className="event-row">
                  <b style={{ color: '#0284c7', fontSize: '14px' }}>জানুয়ারি ২০২৬ — কোডিং ক্লাব মেম্বারশিপ ও ল্যাব ওরিয়েন্টেশন</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    শেখ রাসেল কম্পিউটার ল্যাবে কম্পিউটার হার্ডওয়্যার, টাইপিং ও লজিক পরিচিতি।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#0284c7', fontSize: '14px' }}>মার্চ ২০২৬ — পাইথন ও স্ক্র্যাচ কোডিং বুটক্যাম্প</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    ২ সপ্তাহের হাতে-কলমে প্র্যাকটিক্যাল ক্যাম্প: গেম মেকিং ও বেসিক পাইথন প্রোগ্রামিং।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#0284c7', fontSize: '14px' }}>মে ২০২৬ — জাতীয় শিশু-কিশোর প্রোগ্রামিং প্রতিযোগিতা বাছাই</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    টাঙ্গাইল জেলা ও জাতীয় পর্যায়ের কোডিং প্রতিযোগিতায় অংশগ্রহণের জন্য প্রস্তুতি।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#0284c7', fontSize: '14px' }}>জুলাই ২০২৬ — সাইবার নিরাপত্তা ও ডিজিটাল লিটারেসি সপ্তাহ</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    সোশ্যাল মিডিয়া নিরাপত্তা, পাসওয়ার্ড হাইজিন ও ইন্টারনেট সচেতনতা ক্যাম্পেইন।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#0284c7', fontSize: '14px' }}>অক্টোবর ২০২৬ — শেখ রাসেল দিবস হ্যাকাথন ও আইসিটি ফেয়ার ২০২৬</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    ১২ ঘণ্টার লাইভ কোডিং হ্যাকাথন, স্মার্ট অ্যাপ প্রদর্শনী ও সেরা কোডার অ্যাওয়ার্ড প্রদান।
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>জানুয়ারি — নতুন সদস্য সংগ্রহ ও নবীনবরণ পাঠচক্র</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    ৬ষ্ঠ শ্রেণির নবাগত শিক্ষার্থীদের ভাষা ও সাহিত্য ক্লাবে বরণ এবং সদস্য ফরম বিতরণ।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>২১শে ফেব্রুয়ারি — আন্তর্জাতিক মাতৃভাষা দিবস ও 'কিশলয়' বিশেষ প্রকাশনা</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    শহীদ মিনার শ্রদ্ধাঞ্জলি, স্বরচিত কবিতা পাঠের আসর ও ত্রৈমাসিক দেয়াল পত্রিকা 'কিশলয়' উন্মোচন।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>২৬শে মার্চ — স্বাধীনতা দিবস ও মুক্তিযুদ্ধভিত্তিক রচনা প্রতিযোগিতা</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    মুক্তিযুদ্ধের সত্য ইতিহাস ও গল্প সংকলন নিয়ে আন্তঃশ্রেণি স্মৃতিচারণ অনুষ্ঠান।
                  </p>
                </div>
                <div className="event-row">
                  <b style={{ color: '#047857', fontSize: '14px' }}>মে — রবীন্দ্র-নজরুল জন্মজয়ন্তী ও আবৃত্তি উৎসব</b>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    বিশ্বকবি রবীন্দ্রনাথ ঠাকুর ও জাতীয় কবি কাজী নজরুল ইসলামের গান, কবিতা ও নাট্যাংশ পরিবেশন।
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: ACHIEVEMENTS & TROPHIES ===================== */}
      {clubTab === 'achievements' && (
        <div>
          <h3 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 12px 0' }}>
            🏆 অর্জন ও ট্রফি গ্যালারি
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {activeClub === 'debate' ? (
              <>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🥈</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>কালিহাতি উপজেলা বিতর্ক উৎসব ২০২৫</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      রানার্স-আপ ট্রফি জয়ী মগড়া ডিবেটিং ক্লাব দল।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🥇</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>জেলা পর্যায়ের শ্রেষ্ঠ বিতার্কিক অ্যাওয়ার্ড ২০২৪</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      টাঙ্গাইল জেলা বিতর্ক প্রতিযোগিতায় তানভীর আহমেদ শ্রেষ্ঠ বিতার্কিক পদক লাভ করেন।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🏅</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>স্বাধীনতা বিতর্ক টুর্নামেন্ট ২০২৫</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      সেরা দলগত প্রেজেন্টেশন ও লজিক্যাল ফ্যালাসি বিশ্লেষণ সম্মাননা।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🌟</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>ইংরেজি পাবলিক স্পিকিং পুরস্কার</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      টাঙ্গাইল শিক্ষা অঞ্চল ইংরেজি উপস্থিত বক্তৃতায় ৩য় স্থান অর্জন।
                    </p>
                  </div>
                </div>
              </>
            ) : activeClub === 'science' ? (
              <>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🏆</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>উপজেলা বিজ্ঞান মেলা ২০২৫ — ১ম স্থান</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      "স্বয়ংক্রিয় সৌরচালিত স্মার্ট ড্রিপ ইরিগেশন" প্রকল্পে সেরা উদ্ভাবনী পুরস্কার লাভ।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🥈</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>টাঙ্গাইল জেলা বিজ্ঞান সপ্তাহ ২০২৪ — রৌপ্য পদক</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      প্লাস্টিক বর্জ্য থেকে জ্বালানি তৈরির পরিবেশ মডেল জেলা পর্যায়ে ২য় স্থান অর্জন করে।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🎖️</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>জাতীয় গণিত অলিম্পিয়াড আঞ্চলিক মেধা</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      ৩ জন খুদে গণিতবিদ ঢাকা অঞ্চলের সেরা ৫০-এ স্থান অর্জন করে।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🌟</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>পরিবেশ সুরক্ষায় সেরা স্কুল সম্মাননা ২০২৫</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      আর্সেনিকমুক্তকরণ বায়োফিল্টার গবেষণায় উপজেলা কৃষি ও স্যানিটেশন অধিদপ্তরের প্রশংসা।
                    </p>
                  </div>
                </div>
              </>
            ) : activeClub === 'ict' ? (
              <>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🏆</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>কালিহাতি উপজেলা আইসিটি ফেয়ার ২০২৫ — ১ম স্থান</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      ডিজিটাল রেজাল্ট ও গ্রেডিং ক্যালকুলেটর সফটওয়্যার প্রদর্শনীতে সেরা উদ্ভাবন পদক।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🥇</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>জেলা শিশু প্রোগ্রামিং ক্যাম্প চ্যাম্পিয়ন</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      স্ক্র্যাচ গেম মেকিং ও অ্যালগরিদম প্রতিযোগিতায় টাঙ্গাইল জেলায় চ্যাম্পিয়ন ট্রফি।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>💻</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>শেখ রাসেল ডিজিটাল ল্যাব শ্রেষ্ঠত্ব সনদ</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      ১০০% কম্পিউটার সাক্ষরতা ও স্মার্ট ল্যাব ব্যবহারে টাঙ্গাইল জেলার মডেল স্কুল স্বীকৃতি।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🛡️</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>সাইবার সেফটি স্কুল স্বীকৃতি ২০২৪</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      নিরাপদ ইন্টারনেট ও সাইবার সচেতনতায় সকল শিক্ষার্থীর অংশগ্রহণে বিশেষ সনদ।
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🏆</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>উপজেলা আবৃত্তি প্রতিযোগিতা ২০২৪ — চ্যাম্পিয়ন</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      কালিহাতি উপজেলায় প্রমিত আবৃত্তিতে ১ম স্থান অর্জন করেন ফারজানা মেহজাবীন।
                    </p>
                  </div>
                </div>
                <div className="achievement-badge-card">
                  <div style={{ fontSize: '32px' }}>🥇</div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#92400e' }}>সেরা দেয়াল পত্রিকা 'কিশলয়' পুরস্কার ২০২৫</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                      জেলা পর্যায়ের শিক্ষা সপ্তাহে অনন্য অলঙ্করণ ও সৃজনশীল লেখার জন্য ১ম স্থান।
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 6: INTERACTIVE SUBMISSIONS PORTAL ===================== */}
      {clubTab === 'submissions' && (
        <div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>
                  {activeClub === 'debate' ? '📝 বিতর্ক প্রস্তাবনা জমা ও বিতার্কিক সদস্যপদ আবেদন' :
                   activeClub === 'science' ? '🔬 নতুন বিজ্ঞান প্রজেক্ট জমা ও বিজ্ঞান মেলা রেজিস্ট্রেশন' :
                   activeClub === 'ict' ? '💻 আইসিটি প্রজেক্ট জমা ও কোডিং ক্লাব মেম্বারশিপ' :
                   '📝 দেয়াল পত্রিকা ‘কিশলয়’-এ লেখা জমা ও সদস্যপদ আবেদন'}
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  অনলাইনে জমা দিন—মডারেটর শিক্ষকমণ্ডলী পর্যালোচনা শেষে অনুমোদন ও প্রকাশিত তালিকায় যুক্ত করবেন।
                </p>
              </div>

              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🪄 ডেমো তথ্য পূরণ করুন
              </button>
            </div>

            {subReceipt ? (
              <div style={{ background: '#ecfdf5', border: '2px solid #059669', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '6px' }}>🎉</div>
                <h4 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '18px' }}>
                  তোমার আবেদন সফলভাবে জমা হয়েছে!
                </h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#047857' }}>
                  অফিসিয়াল ট্র্যাকিং আইডি: <b style={{ background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86efac' }}>{subReceipt.tracking_id}</b>
                </p>
                <div style={{ maxWidth: '500px', margin: '0 auto 16px auto', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'left', fontSize: '12.5px' }}>
                  <div><b>ক্লাবের নাম:</b> {subReceipt.club_name || 'স্কুল ক্লাব'}</div>
                  <div><b>শিক্ষার্থীর নাম:</b> {subReceipt.student_name} (শ্রেণি {subReceipt.class_name}, রোল {subReceipt.roll_no || '—'})</div>
                  <div><b>শিরোনাম/বিষয়:</b> {subReceipt.title}</div>
                  <div><b>ধরন:</b> {subReceipt.type_label}</div>
                  <div><b>স্থিতি:</b> <span style={{ color: '#d97706', fontWeight: 700 }}>পর্যালোচনায় অপেক্ষমাণ (Pending Review)</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      background: '#065f46',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🖨️ রসিদ প্রিন্ট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubReceipt(null)}
                    style={{
                      background: '#e2e8f0',
                      color: '#0f172a',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    আরেকটি জমা দিন
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>শিক্ষার্থীর নাম *</label>
                    <input
                      type="text"
                      required
                      value={subForm.student_name}
                      onChange={e => setSubForm({ ...subForm, student_name: e.target.value })}
                      placeholder="যেমন: তানভীর আহমেদ"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>শ্রেণি *</label>
                    <select
                      value={subForm.class_name}
                      onChange={e => setSubForm({ ...subForm, class_name: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    >
                      <option value="৬">৬ষ্ঠ শ্রেণি</option>
                      <option value="৭">৭ম শ্রেণি</option>
                      <option value="৮">৮ম শ্রেণি</option>
                      <option value="৯">৯ম শ্রেণি</option>
                      <option value="১০">১০ম শ্রেণি</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>রোল নম্বর</label>
                    <input
                      type="text"
                      value={subForm.roll_no}
                      onChange={e => setSubForm({ ...subForm, roll_no: e.target.value })}
                      placeholder="যেমন: ১"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>আবেদনের ধরন *</label>
                    <select
                      value={subForm.type}
                      onChange={e => setSubForm({ ...subForm, type: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    >
                      {activeClub === 'debate' ? (
                        <>
                          <option value="motion">⚔️ সংসদীয় বিতর্ক প্রস্তাবনা ও যুক্তি</option>
                          <option value="debate_opinion">🎙️ উপস্থিত বক্তৃতা ও মতামত</option>
                          <option value="membership">🤝 বিতার্কিক সদস্যপদ ও অডিশন আবেদন</option>
                        </>
                      ) : activeClub === 'science' ? (
                        <>
                          <option value="project">🚀 উদ্ভাবনী বিজ্ঞান প্রজেক্ট মডেল</option>
                          <option value="experiment">🧪 ল্যাব পরীক্ষণ ও বৈজ্ঞানিক প্রবন্ধ</option>
                          <option value="membership">🤝 বিজ্ঞান ক্লাব সদস্যপদ ও বিজ্ঞান মেলা রেজিস্ট্রেশন</option>
                        </>
                      ) : activeClub === 'ict' ? (
                        <>
                          <option value="software">💻 সফটওয়্যার, অ্যাপস ও ওয়েব প্রজেক্ট</option>
                          <option value="code_idea">💡 কোডিং আইডিয়া ও স্ক্র্যাচ গেম</option>
                          <option value="membership">🤝 আইসিটি ও কোডিং ক্লাব মেম্বারশিপ</option>
                        </>
                      ) : (
                        <>
                          <option value="poem">📜 স্বরচিত কবিতা (দেয়াল পত্রিকা)</option>
                          <option value="story">📖 ছোটগল্প</option>
                          <option value="rhyme">🌸 ছড়া</option>
                          <option value="essay">💡 প্রবন্ধ / নিবন্ধ</option>
                          <option value="book_review">📝 বুক রিভিউ</option>
                          <option value="english">🇬🇧 Creative English Writing</option>
                          <option value="membership">🤝 ক্লাবের সদস্যপদ আবেদন</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>যোগাযোগের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={subForm.mobile}
                      onChange={e => setSubForm({ ...subForm, mobile: e.target.value })}
                      placeholder="যেমন: 01711-223344"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>
                      {activeClub === 'debate' ? 'বিতর্ক প্রস্তাবনা / বিষয়ের শিরোনাম *' :
                       activeClub === 'science' ? 'বিজ্ঞান প্রজেক্টের নাম / বিষয়ের শিরোনাম *' :
                       activeClub === 'ict' ? 'সফটওয়্যার / অ্যাপস / কোডিং প্রজেক্টের নাম *' :
                       'লেখার শিরোনাম / বিষয়ের নাম *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={subForm.title}
                      onChange={e => setSubForm({ ...subForm, title: e.target.value })}
                      placeholder="যেমন: স্বয়ংক্রিয় সৌরচালিত সেচ"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>
                    {activeClub === 'debate' ? 'বিতর্কের যুক্তি কাঠামো / সভার বক্তব্য / আগ্রহের বিবরণ *' :
                     activeClub === 'science' ? 'প্রকল্পের বিস্তারিত কার্যপ্রণালী, ব্যবহৃত যন্ত্রাংশ ও উপকারিতা *' :
                     activeClub === 'ict' ? 'সফটওয়্যার বিবরণ, ব্যবহৃত প্রযুক্তি ও লাইভ ডেমো / কোড লিংক *' :
                     'মূল লেখা / কবিতা / গল্প / সদস্যপদের আগ্রহপত্র *'}
                  </label>
                  <textarea
                    rows="6"
                    required
                    value={subForm.content}
                    onChange={e => setSubForm({ ...subForm, content: e.target.value })}
                    placeholder="এখানে তোমার বিস্তারিত বক্তব্য, যুক্তি বা প্রজেক্ট বিবরণ সুন্দরভাবে লেখো..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                {subMsg && <p style={{ color: '#047857', fontWeight: 700, fontSize: '12.5px', margin: '0 0 10px 0' }}>{subMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.3)'
                  }}
                >
                  {submitting ? 'জমা দেওয়া হচ্ছে...' : '🚀 ক্লাবে জমা দিন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================== READING FULL ITEM MODAL ===================== */}
      {readingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 99999,
          padding: '16px'
        }} onClick={() => setReadingItem(null)}>
          <div style={{
            background: '#fffdfa',
            border: '2px solid #0f172a',
            borderRadius: '14px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setReadingItem(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
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

            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <span style={{
                background: '#f1f5f9',
                color: '#0f172a',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '12px',
                fontWeight: 800
              }}>
                {readingItem.club_name || (activeClub === 'debate' ? 'মগড়া ডিবেটিং ক্লাব' : activeClub === 'science' ? 'মগড়া বিজ্ঞান ক্লাব' : activeClub === 'ict' ? 'ডিজিটাল আইসিটি ক্লাব' : 'ভাষা ও সাহিত্য ক্লাব')} • {readingItem.type_label || readingItem.type}
              </span>
              <h3 style={{ margin: '8px 0 4px 0', fontSize: '22px', color: '#1e293b', fontWeight: 900 }}>
                {readingItem.title}
              </h3>
              <div style={{ fontSize: '13px', color: '#047857', fontWeight: 700 }}>
                উপস্থাপক/রচয়িতা: {readingItem.author || readingItem.student_name} {readingItem.class_name ? `(${readingItem.class_name}, রোল ${readingItem.roll_no || '—'})` : ''}
              </div>
            </div>

            <div style={{
              fontSize: '14.5px',
              lineHeight: '1.8',
              color: '#1e293b',
              whiteSpace: 'pre-wrap',
              fontFamily: readingItem.type === 'poem' || readingItem.type === 'rhyme' ? 'Georgia, "Hind Siliguri", serif' : 'inherit',
              fontStyle: readingItem.type === 'poem' ? 'italic' : 'normal',
              textAlign: readingItem.type === 'poem' ? 'center' : 'justify',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              {readingItem.content}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#64748b' }}>মগড়া পালস্ সহশিক্ষা ও ক্লাব একাডেমি আর্কাইভ</small>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🖨️ প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageLiteratureClubSection;
