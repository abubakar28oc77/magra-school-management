// StudentGuideMasterAdminPanel.jsx - Comprehensive Admin & Teacher Control Panel for শিক্ষার্থীর গাইড
import React, { useState, useEffect } from 'react';
import {
  getStoredClassRoutines,
  saveStoredClassRoutines,
  getStoredExamRoutines,
  saveStoredExamRoutines,
  getStoredSyllabuses,
  saveStoredSyllabuses,
  getStoredDigitalLearning,
  saveStoredDigitalLearning,
  getStoredNotes,
  saveStoredNotes,
  getStoredQuestions,
  saveStoredQuestions,
  getStoredAssignments,
  saveStoredAssignments,
  getStoredOnlineExams,
  saveStoredOnlineExams,
  AI_PRESETS
} from './studentGuideDataStore';
import { SubmenuDetailModal } from './SubmenuDetailModal';

export function StudentGuideMasterAdminPanel({ sub, setSub, userRole, onNavigate }) {
  // Normalize initial tab
  const getInitialTab = (s) => {
    if (!s) return 'class_routine';
    if (['class_routine', 'routine', 'classes'].includes(s)) return 'class_routine';
    if (['exam_routine', 'exam'].includes(s)) return 'exam_routine';
    if (['syllabus'].includes(s)) return 'syllabus';
    if (['learning', 'content'].includes(s)) return 'learning';
    if (['notes', 'lecture'].includes(s)) return 'notes';
    if (['question', 'generator', 'omr', 'bank'].includes(s)) return 'question';
    if (['assignment', 'manage', 'review'].includes(s)) return 'assignment';
    if (['online_exam', 'setup'].includes(s)) return 'online_exam';
    if (['ai', 'tutor', 'analytics'].includes(s)) return 'ai';
    return 'class_routine';
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab(sub));
  const [toastMsg, setToastMsg] = useState('');
  const [previewModal, setPreviewModal] = useState(null);

  useEffect(() => {
    if (sub) {
      setActiveTab(getInitialTab(sub));
    }
  }, [sub]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (setSub) setSub(tabKey);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // 1. CLASS ROUTINE STATE
  const [classRoutines, setClassRoutines] = useState(getStoredClassRoutines);
  const [crFilterClass, setCrFilterClass] = useState('all');
  const [crFilterDay, setCrFilterDay] = useState('all');
  const [crSearch, setCrSearch] = useState('');
  const [editingCrId, setEditingCrId] = useState(null);
  const [crForm, setCrForm] = useState({
    class_name: '৬',
    section: 'ক',
    day_of_week: 'শনিবার',
    period: '১ম পিরিয়ড',
    start_time: '১০:০০',
    end_time: '১০:৪৫',
    subject_code: '101',
    subject_name: 'বাংলা ১ম পত্র',
    teacher_name: 'মোঃ আবুল কাশেম',
    room_no: '১০১'
  });

  // 2. EXAM ROUTINE STATE
  const [examRoutines, setExamRoutines] = useState(getStoredExamRoutines);
  const [erFilterExam, setErFilterExam] = useState('all');
  const [erFilterClass, setErFilterClass] = useState('all');
  const [editingErId, setEditingErId] = useState(null);
  const [erForm, setErForm] = useState({
    exam_name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬',
    class_name: '৬',
    exam_date: '২০২৬-০৬-১৫',
    day_name: 'সোমবার',
    time_slot: 'সকাল ১০:০০ - দুপুর ০১:০০',
    subject_code: '101',
    subject_name: 'বাংলা ১ম পত্র',
    room_nos: '১০১, ১০২'
  });

  // 3. SYLLABUS STATE
  const [syllabuses, setSyllabuses] = useState(getStoredSyllabuses);
  const [sylFilterClass, setSylFilterClass] = useState('all');
  const [editingSylId, setEditingSylId] = useState(null);
  const [sylForm, setSylForm] = useState({
    class_name: '৬',
    subject_name: 'বাংলা',
    exam_type: 'অর্ধ-বার্ষিক',
    total_chapters: '৭টি গল্প ও ৫টি কবিতা',
    chapters_detail: '',
    pdf_url: '#'
  });

  // 4. DIGITAL LEARNING STATE
  const [digitalLearning, setDigitalLearning] = useState(getStoredDigitalLearning);
  const [dlFilterClass, setDlFilterClass] = useState('all');
  const [editingDlId, setEditingDlId] = useState(null);
  const [dlForm, setDlForm] = useState({
    class_name: '১০',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter_no: 'অধ্যায় ২',
    title_bn: '',
    content_type: 'ভিডিও ক্লাস',
    duration: '৩০ মিনিট',
    instructor_name: '',
    video_url: '',
    description: ''
  });

  // 5. NOTES & LECTURES STATE
  const [notes, setNotes] = useState(getStoredNotes);
  const [noteFilterClass, setNoteFilterClass] = useState('all');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState({
    class_name: '১০',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '',
    title_bn: '',
    author_teacher: '',
    date_published: new Date().toISOString().slice(0, 10),
    summary: '',
    download_count: 0,
    doc_type: 'PDF লেকচার শিট'
  });

  // 6. QUESTION BANK STATE
  const [questions, setQuestions] = useState(getStoredQuestions);
  const [qbFilterClass, setQbFilterClass] = useState('all');
  const [qbFilterType, setQbFilterType] = useState('all');
  const [editingQbId, setEditingQbId] = useState(null);
  const [qbForm, setQbForm] = useState({
    class_name: '১০',
    subject_name: 'সাধারণ গণিত',
    chapter: '',
    question_type: 'সৃজনশীল (CQ)',
    stem: '',
    question_text: '',
    options: ['', '', '', ''],
    answer: '',
    difficulty: 'বোর্ড স্ট্যান্ডার্ড',
    year_tag: '২০২৬'
  });

  // 7. ASSIGNMENTS STATE
  const [assignments, setAssignments] = useState(getStoredAssignments);
  const [asFilterClass, setAsFilterClass] = useState('all');
  const [editingAsId, setEditingAsId] = useState(null);
  const [asForm, setAsForm] = useState({
    class_name: '১০',
    subject_name: 'পদার্থবিজ্ঞান',
    title_bn: '',
    week_no: '৪র্থ সপ্তাহ',
    assignment_no: 'অ্যাসাইনমেন্ট-০১',
    submission_deadline: '২০২৬-০৩-২৫',
    total_marks: 20,
    evaluation_criteria: '',
    instructions: ''
  });

  // 8. ONLINE EXAMS STATE
  const [onlineExams, setOnlineExams] = useState(getStoredOnlineExams);
  const [oeFilterClass, setOeFilterClass] = useState('all');
  const [editingOeId, setEditingOeId] = useState(null);
  const [oeForm, setOeForm] = useState({
    title_bn: '',
    class_name: '১০',
    subject_name: 'পদার্থবিজ্ঞান',
    duration_minutes: 20,
    total_marks: 25,
    pass_marks: 10,
    status: 'সক্রিয়',
    questions_count: 25,
    attempts_count: 0
  });

  // 9. AI TEACHER COPILOT STATE
  const [aiSubTab, setAiSubTab] = useState('lesson_plan');
  // Lesson plan generator form
  const [lpForm, setLpForm] = useState({
    class_name: '১০',
    subject: 'পদার্থবিজ্ঞান',
    topic: 'গতির সমীকরণ ও বাস্তব গতিবিদ্যা',
    period_duration: '৪৫ মিনিট',
    pedagogy_focus: 'ইন্টারেক্টিভ ও অ্যাক্টিভিটি ভিত্তিক'
  });
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState(AI_PRESETS.lesson_plans[0].plan);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Digital Content Generator Form
  const [dcForm, setDcForm] = useState({
    class_name: '৮',
    subject: 'বিজ্ঞান',
    topic: 'সালোকসংশ্লেষণ ও উদ্ভিদের পুষ্টি'
  });
  const [generatedSlides, setGeneratedSlides] = useState(AI_PRESETS.digital_content_ideas[0].slides);

  // Classroom Management Copilot
  const [cmScenario, setCmScenario] = useState('noise_control');

  // AI Chat Consultant
  const [aiChatMessages, setAiChatMessages] = useState([
    { role: 'assistant', text: 'স্বাগতম শিক্ষক মহোদয়! আমি আপনার AI শিক্ষা ও ক্লাসরুম সহকারী। লেসন প্ল্যান তৈরি, ডিজিটাল স্লাইড আইডিয়া, কঠিন কনসেপ্ট সহজে বোঝানোর অ্যানালজি, বা ক্লাসরুম ম্যানেজমেন্ট—যেকোনো বিষয়ে সহায়তা করতে আমি প্রস্তুত।' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');

  // ----------------------------------------------------
  // PRINT HELPER
  // ----------------------------------------------------
  const printDoc = (title, metaHtml, tableHtml) => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('পপ-আপ ব্লক করা আছে। দয়া করে ব্রাউজার পপ-আপ অনুমোদন করুন।');
      return;
    }
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <title>${title} - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'SolaimanLipi', 'Kalpurush', sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px double #0284c7; padding-bottom: 12px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #15803d; }
          .header p { margin: 3px 0 0; font-size: 13px; color: #475569; }
          .report-title { text-align: center; font-size: 18px; font-weight: 800; color: #0369a1; margin: 10px 0; }
          .meta-box { display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #f8fafc; font-weight: 700; color: #1e293b; }
          .footer-signs { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
          <p>ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল | EIIN: 114290</p>
        </div>
        <div class="report-title">${title}</div>
        <div class="meta-box">${metaHtml}</div>
        ${tableHtml}
        <div class="footer-signs">
          <div>শ্রেণি শিক্ষক / প্রস্তুতকারক</div>
          <div>একাডেমিক ইনচার্জ</div>
          <div>প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // ----------------------------------------------------
  // CRUD HANDLERS
  // ----------------------------------------------------
  // Class Routine CRUD
  const saveClassRoutine = (e) => {
    e.preventDefault();
    let updated;
    if (editingCrId) {
      updated = classRoutines.map(r => r.id === editingCrId ? { ...crForm, id: editingCrId } : r);
      showToast('ক্লাস রুটিন সফলভাবে আপডেট হয়েছে!');
    } else {
      updated = [{ ...crForm, id: 'cr-' + Date.now() }, ...classRoutines];
      showToast('নতুন ক্লাস রুটিন পিরিয়ড যুক্ত হয়েছে!');
    }
    setClassRoutines(updated);
    saveStoredClassRoutines(updated);
    setEditingCrId(null);
  };

  // Exam Routine CRUD
  const saveExamRoutine = (e) => {
    e.preventDefault();
    let updated;
    if (editingErId) {
      updated = examRoutines.map(r => r.id === editingErId ? { ...erForm, id: editingErId } : r);
      showToast('পরীক্ষার রুটিন আপডেট হয়েছে!');
    } else {
      updated = [{ ...erForm, id: 'er-' + Date.now() }, ...examRoutines];
      showToast('নতুন পরীক্ষার রুটিন স্লট যুক্ত হয়েছে!');
    }
    setExamRoutines(updated);
    saveStoredExamRoutines(updated);
    setEditingErId(null);
  };

  // Syllabus CRUD
  const saveSyllabus = (e) => {
    e.preventDefault();
    let updated;
    if (editingSylId) {
      updated = syllabuses.map(s => s.id === editingSylId ? { ...sylForm, id: editingSylId } : s);
      showToast('সিলেবাস সফলভাবে আপডেট হয়েছে!');
    } else {
      updated = [{ ...sylForm, id: 'syl-' + Date.now() }, ...syllabuses];
      showToast('নতুন পাঠ্যসূচি/সিলেবাস যুক্ত হয়েছে!');
    }
    setSyllabuses(updated);
    saveStoredSyllabuses(updated);
    setEditingSylId(null);
  };

  // Digital Learning CRUD
  const saveDigitalLearning = (e) => {
    e.preventDefault();
    let updated;
    if (editingDlId) {
      updated = digitalLearning.map(d => d.id === editingDlId ? { ...dlForm, id: editingDlId } : d);
      showToast('ডিজিটাল কনটেন্ট আপডেট হয়েছে!');
    } else {
      updated = [{ ...dlForm, id: 'dl-' + Date.now() }, ...digitalLearning];
      showToast('নতুন ডিজিটাল ক্লাস লেকচার যুক্ত হয়েছে!');
    }
    setDigitalLearning(updated);
    saveStoredDigitalLearning(updated);
    setEditingDlId(null);
  };

  // Notes CRUD
  const saveNote = (e) => {
    e.preventDefault();
    let updated;
    if (editingNoteId) {
      updated = notes.map(n => n.id === editingNoteId ? { ...noteForm, id: editingNoteId } : n);
      showToast('নোট/লেকচার আপডেট হয়েছে!');
    } else {
      updated = [{ ...noteForm, id: 'nt-' + Date.now() }, ...notes];
      showToast('নতুন নোট ও লেকচার শিট সংরক্ষিত হয়েছে!');
    }
    setNotes(updated);
    saveStoredNotes(updated);
    setEditingNoteId(null);
  };

  // Question Bank CRUD
  const saveQuestion = (e) => {
    e.preventDefault();
    let updated;
    if (editingQbId) {
      updated = questions.map(q => q.id === editingQbId ? { ...qbForm, id: editingQbId } : q);
      showToast('প্রশ্নব্যাংক আইটেম আপডেট হয়েছে!');
    } else {
      updated = [{ ...qbForm, id: 'qb-' + Date.now() }, ...questions];
      showToast('নতুন সৃজনশীল/MCQ প্রশ্ন প্রশ্নব্যাংকে যুক্ত হয়েছে!');
    }
    setQuestions(updated);
    saveStoredQuestions(updated);
    setEditingQbId(null);
  };

  // Assignment CRUD
  const saveAssignment = (e) => {
    e.preventDefault();
    let updated;
    if (editingAsId) {
      updated = assignments.map(a => a.id === editingAsId ? { ...asForm, id: editingAsId } : a);
      showToast('অ্যাসাইনমেন্ট আপডেট হয়েছে!');
    } else {
      updated = [{ ...asForm, id: 'as-' + Date.now() }, ...assignments];
      showToast('নতুন অ্যাসাইনমেন্ট ও মক টেস্ট প্রকাশিত হয়েছে!');
    }
    setAssignments(updated);
    saveStoredAssignments(updated);
    setEditingAsId(null);
  };

  // Online Exam CRUD
  const saveOnlineExam = (e) => {
    e.preventDefault();
    let updated;
    if (editingOeId) {
      updated = onlineExams.map(o => o.id === editingOeId ? { ...oeForm, id: editingOeId } : o);
      showToast('অনলাইন পরীক্ষা আপডেট হয়েছে!');
    } else {
      updated = [{ ...oeForm, id: 'oe-' + Date.now() }, ...onlineExams];
      showToast('নতুন অনলাইন পরীক্ষা ও কুইজ তৈরি হয়েছে!');
    }
    setOnlineExams(updated);
    saveStoredOnlineExams(updated);
    setEditingOeId(null);
  };

  // AI Generator Handlers
  const handleGenerateLessonPlan = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const generated = `মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — AI শিক্ষক লেসন প্ল্যান
শ্রেণি: ${lpForm.class_name}ম শ্রেণি | বিষয়: ${lpForm.subject} | পাঠের বিষয়বস্তু: ${lpForm.topic}
পিরিয়ড সময়: ${lpForm.period_duration} | শিক্ষণ পদ্ধতি: ${lpForm.pedagogy_focus}

১. জাতীয় শিক্ষাক্রম অনুযায়ী সাধারণ ও বিশেষ শিখনফল:
   • শিক্ষার্থীরা ${lpForm.topic}-এর মৌলিক ও বাস্তব প্রয়োগের স্বরূপ নির্ভুলভাবে বর্ণনা করতে পারবে।
   • অধ্যায় সংশ্লিষ্ট ৩টি বাস্তব জীবনের দৃষ্টান্তের মাধ্যমে গাণিতিক ও ধারণাগত সমস্যা সমাধান করতে পারবে।

২. প্রয়োজনীয় শিক্ষোপকরণ:
   • মাল্টিমিডিয়া প্রজেক্টর, বিষয়ভিত্তিক বাস্তব বস্তু, চার্ট পেপার, হোয়াইটবোর্ড ও মার্কার।

৩. পাঠ পরিকল্পনা ধাপ ও সময় বণ্টন:
   [ক] পাঠ সূচনা ও পূর্বজ্ঞান যাচাই (৫ মিনিট):
       - শিক্ষার্থীদের বাস্তব অভিজ্ঞতার সাথে মিলিয়ে ২টি আকর্ষণীয় প্রশ্ন উত্থাপন।
   [খ] মূল পাঠ উপস্থাপন - আই ডু (১৫ মিনিট):
       - শিক্ষকের সুস্পষ্ট ব্যাখ্যা, বোর্ডে মূল পয়েন্ট চিত্রায়ন ও মাল্টিমিডিয়া স্লাইড প্রদর্শন।
   [গ] দলগত অনুশীলন - উই ডু (১২ মিনিট):
       - ৪-৫ জনের দল তৈরি করে ওয়ার্কশিটের কেস স্টাডি সমাধান ও পারস্পরিক আলোচনা।
   [ঘ] একক অনুশীলন ও মূল্যায়ন - ইউ ডু (১০ মিনিট):
       - তাৎক্ষণিক ৩টি বহুনির্বাচনী ও ১টি সংক্ষিপ্ত প্রশ্ন দিয়ে শিখন অর্জনের মাত্রা যাচাই।
   [ঙ] বাড়ির কাজ ও সংযোগ (৩ মিনিট):
       - সৃজনশীল চিন্তন দক্ষতা বৃদ্ধির লক্ষ্যে বাস্তব জীবনের সাথে সম্পর্কিত ১টি অ্যাসাইনমেন্ট।

৪. বিশেষ চাহিদা ও পিছিয়ে পড়া শিক্ষার্থীদের জন্য ইনক্লুসিভ নির্দেশিকা:
   - অতিরিক্ত ভিজ্যুয়াল চার্ট ও পিয়ার লার্নিং (সহপাঠীর সাহায্য) নিশ্চিত করা।`;

      setGeneratedLessonPlan(generated);
      setIsAiGenerating(false);
      showToast('AI নিখুঁত লেসন প্ল্যান তৈরি করেছে!');
    }, 700);
  };

  const handleGenerateDigitalSlides = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const generated = [
        `স্লাইড ১: স্বাগতম ও শিরোনাম (${dcForm.subject}: ${dcForm.topic})`,
        `স্লাইড ২: বাস্তব জীবনের সংযোগ ও “কেন আমরা এটি পড়ছি?” (বাস্তব ভিডিও/অ্যানিমেশন আইডিয়া)`,
        `স্লাইড ৩: মূল ধারণার নিখুঁত অ্যানিমেটেড ইনফোগ্রাফিক ও সমীকরণ বিশ্লেষণ`,
        `স্লাইড ৪: দলগত কুইজ — বোর্ডে শিক্ষার্থীরা এসে সঠিক উত্তর ড্র্যাগ অ্যান্ড ড্রপ করবে`,
        `স্লাইড ৫: সারসংক্ষেপ ও পরবর্তী ক্লাসের প্রিভিউ`
      ];
      setGeneratedSlides(generated);
      setIsAiGenerating(false);
      showToast('ডিজিটাল স্লাইড ও কনটেন্ট আউটলাইন প্রস্তুত!');
    }, 600);
  };

  const handleSendAiChat = (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;
    const userText = aiChatInput.trim();
    setAiChatInput('');
    setAiChatMessages(prev => [...prev, { role: 'user', text: userText }]);

    // Simulated smart intelligent teacher response
    setTimeout(() => {
      let reply = `শিক্ষক মহোদয়, "${userText}" বিষয়ে আমার সুপারিশ:\n`;
      if (userText.includes('লেসন') || userText.includes('পাঠ') || userText.includes('পরিকল্পনা')) {
        reply += `১. পাঠ সূচনা আকর্ষণীয় করতে শিক্ষার্থীদের বাস্তব অভিজ্ঞতার গল্প দিয়ে শুরু করুন।\n২. ক্লাসের ৪০% সময় শিক্ষার্থীদের সক্রিয় কাজে (জোড়ায় কাজ/দলগত কাজ) ব্যস্ত রাখুন।\n৩. প্রজেক্টরে বড় ফন্টে মূল শিখনফল প্রদর্শন করুন।`;
      } else if (userText.includes('অমনোযোগী') || userText.includes('শব্দ') || userText.includes('শৃঙ্খলা')) {
        reply += `১. শিক্ষক কণ্ঠের স্বর হঠাৎ কমিয়ে নরম সুরে কথা বলুন; এতে পুরো শ্রেণি আপনা থেকেই শান্ত হয়।\n২. “সবার দৃষ্টি বোর্ডে” বলে হাততালি সংকেত দিন।\n৩. অমনোযোগী শিক্ষার্থীকে শাস্তির বদলে বোর্ডে এসে চক/মার্কার ধরার ছোট দায়িত্ব দিন।`;
      } else {
        reply += `১. বিষয়টি সহজে বোঝাতে বাস্তব জীবনের অ্যানালজি বা দৃষ্টান্ত দিন।\n২. শ্রেণির শেষে ৩ মিনিটের দ্রুত কুইজ নিন।\n৩. আপনি চাইলে উপরের 'লেসন প্ল্যান জেনারেটর' ট্যাব থেকে ১-ক্লিকে এর সম্পূর্ণ প্রিন্টযোগ্য শিট প্রস্তুত করে নিতে পারেন।`;
      }
      setAiChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 500);
  };

  return (
    <div className="student-guide-master-admin-panel" style={{ paddingBottom: '40px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '14px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(15,118,110,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '38px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🧭</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>শিক্ষার্থীর গাইড ও শিক্ষা প্রযুক্তি ব্যবস্থাপনা</h2>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Smart Academic Desk
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              ক্লাস রুটিন, পরীক্ষার রুটিন, সিলেবাস, ডিজিটাল কনটেন্ট, নোট, প্রশ্নব্যাংক, অ্যাসাইনমেন্ট, অনলাইন পরীক্ষা ও AI সহকারী
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="mini"
            onClick={() => setPreviewModal({ key: 'public.nav.guide.' + activeTab, title: 'ভিউপেজ প্রিভিউ' })}
            style={{
              background: '#ffffff',
              color: '#0f766e',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            🌐 ভিউপেজে কেমন দেখায় (Live Preview)
          </button>
        </div>
      </div>

      {/* 9 Ordered Submenus Tab Bar */}
      <div style={{
        background: '#ffffff',
        padding: '8px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        {[
          { key: 'class_routine', label: '১. ক্লাস রুটিন', icon: '🗓️', badge: '৬ষ্ঠ-১০ম শ্রেণি' },
          { key: 'exam_routine', label: '২. পরীক্ষার রুটিন', icon: '📑', badge: 'সকল পরীক্ষা' },
          { key: 'syllabus', label: '৩. সিলেবাস', icon: '📚', badge: 'বোর্ড কারিকুলাম' },
          { key: 'learning', label: '৪. ডিজিটাল লার্নিং', icon: '💻', badge: 'মাল্টিমিডিয়া ক্লাস' },
          { key: 'notes', label: '৫. নোট/লেকচার', icon: '📝', badge: 'শিক্ষকের হ্যান্ডনোট' },
          { key: 'question', label: '৬. প্রশ্নব্যাংক ও মডেল প্রশ্ন', icon: '❓', badge: 'CQ ও MCQ' },
          { key: 'assignment', label: '৭. অ্যাসাইনমেন্ট ও মক টেস্ট', icon: '📘', badge: 'মূল্যায়ন' },
          { key: 'online_exam', label: '৮. অনলাইন পরীক্ষা', icon: '🧪', badge: 'লাইভ কুইজ' },
          { key: 'ai', label: '৯. AI শিক্ষা সহকারী', icon: '✨', badge: 'লেসন প্ল্যান ও শিক্ষক কোপাইলট' }
        ].map(item => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabChange(item.key)}
              style={{
                flex: '1 1 auto',
                minWidth: '140px',
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: isActive ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 3px 8px rgba(15,118,110,0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 700
              }}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: ক্লাস রুটিন (Class Routine)
      ======================================================== */}
      {activeTab === 'class_routine' && (
        <div>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🗓️</span>
              <span style={{ fontSize: '13.5px', color: '#1e40af', fontWeight: 700 }}>
                ক্লাস রুটিন: শনিবার থেকে বৃহস্পতিবার শ্রেণিভিত্তিক সাপ্তাহিক ক্লাস সময়সূচি ও পিরিয়ড ব্যবস্থাপনা।
              </span>
            </div>
            <button
              type="button"
              className="mini"
              onClick={() => {
                const rows = classRoutines.map((r, i) => `
                  <tr>
                    <td style="text-align:center;">${i + 1}</td>
                    <td style="text-align:center;font-weight:700;">${r.class_name}ম শ্রেণি (${r.section})</td>
                    <td style="text-align:center;">${r.day_of_week}</td>
                    <td style="text-align:center;">${r.period} (${r.start_time} - ${r.end_time})</td>
                    <td><b>${r.subject_name}</b> <small>(${r.subject_code})</small></td>
                    <td>${r.teacher_name}</td>
                    <td style="text-align:center;font-weight:700;">কক্ষ ${r.room_no}</td>
                  </tr>
                `).join('');
                printDoc(
                  'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — প্রাতিষ্ঠানিক ক্লাস রুটিন ২০২৬',
                  `<span>মোট পিরিয়ড স্লট: <b>${classRoutines.length}</b></span><span>প্রিন্টের তারিখ: <b>${new Date().toLocaleDateString('bn-BD')}</b></span>`,
                  `<table><thead><tr><th>ক্রম</th><th>শ্রেণি ও শাখা</th><th>বার</th><th>পিরিয়ড ও সময়</th><th>বিষয় ও কোড</th><th>শিক্ষক</th><th>কক্ষ</th></tr></thead><tbody>${rows}</tbody></table>`
                );
              }}
              style={{ background: '#0284c7', color: '#fff', fontWeight: 700 }}
            >
              🖨️ পূর্ণাঙ্গ ক্লাস রুটিন PDF প্রিন্ট
            </button>
          </div>

          <div className="module-grid">
            {/* Form */}
            <div className="form-card">
              <div className="toolbar">
                <h2>{editingCrId ? 'ক্লাস রুটিন পিরিয়ড সম্পাদনা' : 'নতুন ক্লাস পিরিয়ড এন্ট্রি'}</h2>
                {editingCrId && <button type="button" className="mini" onClick={() => setEditingCrId(null)}>বাতিল</button>}
              </div>

              <form onSubmit={saveClassRoutine} className="form-grid">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                  <select value={crForm.class_name} onChange={e => setCrForm({ ...crForm, class_name: e.target.value })}>
                    <option value="৬">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭">৭ম শ্রেণি</option>
                    <option value="৮">৮ম শ্রেণি</option>
                    <option value="৯">৯ম শ্রেণি</option>
                    <option value="১০">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>শাখা / বিভাগ</label>
                  <input placeholder="শাখা (ক / খ / বিজ্ঞান / মানবিক)" value={crForm.section} onChange={e => setCrForm({ ...crForm, section: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>বার *</label>
                  <select value={crForm.day_of_week} onChange={e => setCrForm({ ...crForm, day_of_week: e.target.value })}>
                    <option value="শনিবার">শনিবার</option>
                    <option value="রবিবার">রবিবার</option>
                    <option value="সোমবার">সোমবার</option>
                    <option value="মঙ্গলবার">মঙ্গলবার</option>
                    <option value="বুধবার">বুধবার</option>
                    <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>পিরিয়ড নম্বর *</label>
                  <input placeholder="যেমন: ১ম পিরিয়ড / ২য় পিরিয়ড" value={crForm.period} onChange={e => setCrForm({ ...crForm, period: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>শুরুর সময় *</label>
                  <input type="time" value={crForm.start_time} onChange={e => setCrForm({ ...crForm, start_time: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>শেষের সময় *</label>
                  <input type="time" value={crForm.end_time} onChange={e => setCrForm({ ...crForm, end_time: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয়ের নাম *</label>
                  <input placeholder="যেমন: বাংলা ১ম পত্র / সাধারণ গণিত" value={crForm.subject_name} onChange={e => setCrForm({ ...crForm, subject_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় কোড</label>
                  <input placeholder="যেমন: 101 / 109" value={crForm.subject_code} onChange={e => setCrForm({ ...crForm, subject_code: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>শিক্ষকের নাম *</label>
                  <input placeholder="নির্ধারিত শিক্ষকের নাম" value={crForm.teacher_name} onChange={e => setCrForm({ ...crForm, teacher_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>কক্ষ নম্বর *</label>
                  <input placeholder="যেমন: ১০১ / ল্যাব-০১" value={crForm.room_no} onChange={e => setCrForm({ ...crForm, room_no: e.target.value })} required />
                </div>
                <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0f766e', color: '#fff', fontWeight: 800 }}>
                  {editingCrId ? 'রুটিন আপডেট সম্পন্ন করুন' : '➕ নতুন ক্লাস পিরিয়ড যোগ করুন'}
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="toolbar" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="eyebrow">CLASS TIMETABLE</span>
                  <h2>সাপ্তাহিক ক্লাস রুটিন তালিকা ({classRoutines.length} টি)</h2>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <select value={crFilterClass} onChange={e => setCrFilterClass(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    <option value="all">সকল শ্রেণি</option>
                    <option value="৬">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭">৭ম শ্রেণি</option>
                    <option value="৮">৮ম শ্রেণি</option>
                    <option value="৯">৯ম শ্রেণি</option>
                    <option value="১০">১০ম শ্রেণি</option>
                  </select>
                  <select value={crFilterDay} onChange={e => setCrFilterDay(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    <option value="all">সকল বার</option>
                    <option value="শনিবার">শনিবার</option>
                    <option value="রবিবার">রবিবার</option>
                    <option value="সোমবার">সোমবার</option>
                    <option value="মঙ্গলবার">মঙ্গলবার</option>
                    <option value="বুধবার">বুধবার</option>
                    <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                  </select>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>শ্রেণি/শাখা</th>
                      <th>বার ও সময়</th>
                      <th>বিষয় ও শিক্ষক</th>
                      <th>কক্ষ</th>
                      <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRoutines
                      .filter(r => crFilterClass === 'all' || r.class_name === crFilterClass)
                      .filter(r => crFilterDay === 'all' || r.day_of_week === crFilterDay)
                      .map(r => (
                        <tr key={r.id}>
                          <td><b>{r.class_name}ম শ্রেণি</b><br/><small style={{ color: '#047857', fontWeight: 700 }}>শাখা: {r.section || '—'}</small></td>
                          <td><b>{r.day_of_week}</b><br/><small>{r.period} • {r.start_time} - {r.end_time}</small></td>
                          <td><b>{r.subject_name}</b><br/><small>👨‍🏫 {r.teacher_name}</small></td>
                          <td><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{r.room_no}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="mini"
                              onClick={() => {
                                setEditingCrId(r.id);
                                setCrForm(r);
                                window.scrollTo({ top: 100, behavior: 'smooth' });
                              }}
                              style={{ marginRight: '4px' }}
                            >
                              এডিট
                            </button>
                            <button
                              type="button"
                              className="mini danger"
                              onClick={() => {
                                if (confirm('এই ক্লাস রুটিন পিরিয়ডটি মুছে ফেলবেন?')) {
                                  const up = classRoutines.filter(x => x.id !== r.id);
                                  setClassRoutines(up);
                                  saveStoredClassRoutines(up);
                                }
                              }}
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: পরীক্ষার রুটিন (Exam Routine)
      ======================================================== */}
      {activeTab === 'exam_routine' && (
        <div>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📑</span>
              <span style={{ fontSize: '13.5px', color: '#92400e', fontWeight: 700 }}>
                পরীক্ষার রুটিন: অর্ধ-বার্ষিক, বার্ষিক, প্রাক-নির্বাচনী ও নির্বাচনী পরীক্ষার অফিসিয়াল তারিখ ও সময়সূচি।
              </span>
            </div>
            <button
              type="button"
              className="mini"
              onClick={() => {
                const rows = examRoutines.map((r, i) => `
                  <tr>
                    <td style="text-align:center;">${i + 1}</td>
                    <td style="text-align:center;font-weight:700;">${r.exam_name}</td>
                    <td style="text-align:center;">${r.class_name}ম শ্রেণি</td>
                    <td style="text-align:center;font-weight:700;">${r.exam_date} (${r.day_name})</td>
                    <td style="text-align:center;">${r.time_slot}</td>
                    <td><b>${r.subject_name}</b> <small>(${r.subject_code})</small></td>
                    <td style="text-align:center;">${r.room_nos}</td>
                  </tr>
                `).join('');
                printDoc(
                  'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় — পরীক্ষার চূড়ান্ত সময়সূচি ২০২৬',
                  `<span>মোট পরীক্ষার পরীক্ষা কোড: <b>${examRoutines.length}</b></span><span>প্রিন্ট: <b>${new Date().toLocaleDateString('bn-BD')}</b></span>`,
                  `<table><thead><tr><th>ক্রম</th><th>পরীক্ষার নাম</th><th>শ্রেণি</th><th>তারিখ ও বার</th><th>পরীক্ষার সময়</th><th>বিষয় ও কোড</th><th>হল/কক্ষ</th></tr></thead><tbody>${rows}</tbody></table>`
                );
              }}
              style={{ background: '#d97706', color: '#fff', fontWeight: 700 }}
            >
              🖨️ অফিশিয়াল পরীক্ষার রুটিন প্রিন্ট
            </button>
          </div>

          <div className="module-grid">
            {/* Form */}
            <div className="form-card">
              <div className="toolbar">
                <h2>{editingErId ? 'পরীক্ষার রুটিন সম্পাদনা' : 'নতুন পরীক্ষার সময়সূচি এন্ট্রি'}</h2>
                {editingErId && <button type="button" className="mini" onClick={() => setEditingErId(null)}>বাতিল</button>}
              </div>

              <form onSubmit={saveExamRoutine} className="form-grid">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>পরীক্ষার নাম *</label>
                  <select value={erForm.exam_name} onChange={e => setErForm({ ...erForm, exam_name: e.target.value })}>
                    <option value="অর্ধ-বার্ষিক পরীক্ষা ২০২৬">অর্ধ-বার্ষিক পরীক্ষা ২০২৬</option>
                    <option value="বার্ষিক পরীক্ষা ২০২৬">বার্ষিক পরীক্ষা ২০২৬</option>
                    <option value="প্রাক-নির্বাচনী পরীক্ষা ২০২৬">প্রাক-নির্বাচনী পরীক্ষা ২০২৬</option>
                    <option value="নির্বাচনী পরীক্ষা ২০২৬">নির্বাচনী পরীক্ষা ২০২৬</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                  <select value={erForm.class_name} onChange={e => setErForm({ ...erForm, class_name: e.target.value })}>
                    <option value="৬">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭">৭ম শ্রেণি</option>
                    <option value="৮">৮ম শ্রেণি</option>
                    <option value="৯">৯ম শ্রেণি</option>
                    <option value="১০">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>পরীক্ষার তারিখ *</label>
                  <input type="date" value={erForm.exam_date} onChange={e => setErForm({ ...erForm, exam_date: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>বার *</label>
                  <input placeholder="যেমন: সোমবার / বুধবার" value={erForm.day_name} onChange={e => setErForm({ ...erForm, day_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>পরীক্ষার সময় *</label>
                  <input placeholder="যেমন: সকাল ১০:০০ - দুপুর ০১:০০" value={erForm.time_slot} onChange={e => setErForm({ ...erForm, time_slot: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয়ের নাম *</label>
                  <input placeholder="যেমন: বাংলা ১ম পত্র / গণিত" value={erForm.subject_name} onChange={e => setErForm({ ...erForm, subject_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় কোড</label>
                  <input placeholder="যেমন: 101 / 109" value={erForm.subject_code} onChange={e => setErForm({ ...erForm, subject_code: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>পরীক্ষার কক্ষ / হল</label>
                  <input placeholder="যেমন: ১০১, ১০২ / কেন্দ্রীয় হল" value={erForm.room_nos} onChange={e => setErForm({ ...erForm, room_nos: e.target.value })} />
                </div>
                <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#d97706', color: '#fff', fontWeight: 800 }}>
                  {editingErId ? 'রুটিন আপডেট সম্পন্ন করুন' : '➕ নতুন পরীক্ষার তারিখ যোগ করুন'}
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="toolbar" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="eyebrow">EXAM SCHEDULE</span>
                  <h2>পরীক্ষার রুটিন তালিকা ({examRoutines.length} টি)</h2>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select value={erFilterExam} onChange={e => setErFilterExam(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    <option value="all">সকল পরীক্ষা</option>
                    <option value="অর্ধ-বার্ষিক">অর্ধ-বার্ষিক</option>
                    <option value="বার্ষিক">বার্ষিক</option>
                    <option value="প্রাক-নির্বাচনী">প্রাক-নির্বাচনী</option>
                    <option value="নির্বাচনী">নির্বাচনী</option>
                  </select>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>পরীক্ষা ও শ্রেণি</th>
                      <th>তারিখ ও সময়</th>
                      <th>বিষয় ও কোড</th>
                      <th>কক্ষ</th>
                      <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examRoutines
                      .filter(r => erFilterExam === 'all' || r.exam_name.includes(erFilterExam))
                      .map(r => (
                        <tr key={r.id}>
                          <td><b>{r.exam_name}</b><br/><span style={{ color: '#0369a1', fontWeight: 700 }}>{r.class_name}ম শ্রেণি</span></td>
                          <td><b>{r.exam_date}</b> ({r.day_name})<br/><small style={{ color: '#64748b' }}>⏰ {r.time_slot}</small></td>
                          <td><b>{r.subject_name}</b> <small style={{ color: '#047857' }}>({r.subject_code || '—'})</small></td>
                          <td><span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{r.room_nos}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="mini"
                              onClick={() => {
                                setEditingErId(r.id);
                                setErForm(r);
                                window.scrollTo({ top: 100, behavior: 'smooth' });
                              }}
                              style={{ marginRight: '4px' }}
                            >
                              এডিট
                            </button>
                            <button
                              type="button"
                              className="mini danger"
                              onClick={() => {
                                if (confirm('এই পরীক্ষার রুটিনটি মুছে ফেলবেন?')) {
                                  const up = examRoutines.filter(x => x.id !== r.id);
                                  setExamRoutines(up);
                                  saveStoredExamRoutines(up);
                                }
                              }}
                            >
                              মুছুন
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: সিলেবাস (Syllabus)
      ======================================================== */}
      {activeTab === 'syllabus' && (
        <div className="module-grid">
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingSylId ? 'সিলেবাস সম্পাদনা' : 'নতুন পাঠ্যক্রম ও সিলেবাস এন্ট্রি'}</h2>
              {editingSylId && <button type="button" className="mini" onClick={() => setEditingSylId(null)}>বাতিল</button>}
            </div>
            <form onSubmit={saveSyllabus} className="form-grid">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                <select value={sylForm.class_name} onChange={e => setSylForm({ ...sylForm, class_name: e.target.value })}>
                  <option value="৬">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭">৭ম শ্রেণি</option>
                  <option value="৮">৮ম শ্রেণি</option>
                  <option value="৯">৯ম শ্রেণি</option>
                  <option value="১০">১০ম শ্রেণি</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয়ের নাম *</label>
                <input placeholder="যেমন: সাধারণ গণিত / ইংরেজি" value={sylForm.subject_name} onChange={e => setSylForm({ ...sylForm, subject_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>পরীক্ষার টার্ম *</label>
                <select value={sylForm.exam_type} onChange={e => setSylForm({ ...sylForm, exam_type: e.target.value })}>
                  <option value="অর্ধ-বার্ষিক">অর্ধ-বার্ষিক</option>
                  <option value="বার্ষিক">বার্ষিক</option>
                  <option value="প্রাক-নির্বাচনী">প্রাক-নির্বাচনী</option>
                  <option value="নির্বাচনী (SSC)">নির্বাচনী (SSC)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>অধ্যায় সংক্ষেপ</label>
                <input placeholder="যেমন: অধ্যায় ১ থেকে ৫" value={sylForm.total_chapters} onChange={e => setSylForm({ ...sylForm, total_chapters: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>সিলেবাসের বিস্তারিত পাঠ্যতালিকা ও নির্দেশনা *</label>
                <textarea rows="4" placeholder="অধ্যায়সমূহ, ব্যাকরণ, রচনামূলক ও ব্যবহারিক কাজের বিস্তারিত পাঠ্যতালিকা লিখুন..." value={sylForm.chapters_detail} onChange={e => setSylForm({ ...sylForm, chapters_detail: e.target.value })} required />
              </div>
              <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0284c7', color: '#fff', fontWeight: 800 }}>
                {editingSylId ? 'সিলেবাস আপডেট সম্পন্ন করুন' : '➕ নতুন সিলেবাস সংরক্ষণ করুন'}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <h2>অফিসিয়াল সিলেবাস তালিকা ({syllabuses.length} টি)</h2>
              <select value={sylFilterClass} onChange={e => setSylFilterClass(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                <option value="all">সকল শ্রেণি</option>
                <option value="৬">৬ষ্ঠ</option><option value="৭">৭ম</option><option value="৮">৮ম</option><option value="৯">৯ম</option><option value="১০">১০ম</option>
              </select>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি ও বিষয়</th>
                    <th>টার্ম</th>
                    <th>পাঠ্যতালিকা বিবরণ</th>
                    <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabuses.filter(s => sylFilterClass === 'all' || s.class_name === sylFilterClass).map(s => (
                    <tr key={s.id}>
                      <td><b>{s.class_name}ম শ্রেণি</b><br/><span style={{ color: '#0f766e', fontWeight: 700 }}>{s.subject_name}</span></td>
                      <td><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{s.exam_type}</span></td>
                      <td><b>{s.total_chapters}</b><br/><small style={{ color: '#475569' }}>{s.chapters_detail}</small></td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini" onClick={() => { setEditingSylId(s.id); setSylForm(s); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>এডিট</button>
                        <button type="button" className="mini danger" onClick={() => { if(confirm('মুছে ফেলবেন?')){ const up = syllabuses.filter(x => x.id !== s.id); setSyllabuses(up); saveStoredSyllabuses(up); } }}>মুছুন</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: ডিজিটাল লার্নিং (Digital Learning)
      ======================================================== */}
      {activeTab === 'learning' && (
        <div className="module-grid">
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingDlId ? 'ডিজিটাল ক্লাস সম্পাদনা' : 'নতুন ডিজিটাল ক্লাস ও ভিডিও লেকচার এন্ট্রি'}</h2>
              {editingDlId && <button type="button" className="mini" onClick={() => setEditingDlId(null)}>বাতিল</button>}
            </div>
            <form onSubmit={saveDigitalLearning} className="form-grid">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                <select value={dlForm.class_name} onChange={e => setDlForm({ ...dlForm, class_name: e.target.value })}>
                  <option value="৬">৬ষ্ঠ</option><option value="৭">৭ম</option><option value="৮">৮ম</option><option value="৯">৯ম</option><option value="১০">১০ম</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় *</label>
                <input placeholder="যেমন: সাধারণ বিজ্ঞান / গণিত" value={dlForm.subject_name} onChange={e => setDlForm({ ...dlForm, subject_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>অধ্যায়</label>
                <input placeholder="যেমন: অধ্যায় ২ / গতির সমীকরণ" value={dlForm.chapter_no} onChange={e => setDlForm({ ...dlForm, chapter_no: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>কনটেন্টের ধরন *</label>
                <select value={dlForm.content_type} onChange={e => setDlForm({ ...dlForm, content_type: e.target.value })}>
                  <option value="ভিডিও ক্লাস">ভিডিও ক্লাস (YouTube/Web)</option>
                  <option value="মাল্টিমিডিয়া ক্লাস">মাল্টিমিডিয়া ক্লাস</option>
                  <option value="স্মার্ট প্রেজেন্টেশন">স্মার্ট প্রেজেন্টেশন (PPT/Slide)</option>
                  <option value="অ্যানিমেশন ক্লাস">অ্যানিমেশন ক্লাস</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>ডিজিটাল ক্লাসের আকর্ষণীয় শিরোনাম *</label>
                <input placeholder="যেমন: সালোকসংশ্লেষণ প্রক্রিয়ার সরাসরি অ্যানিমেটেড ল্যাব ক্লাস" value={dlForm.title_bn} onChange={e => setDlForm({ ...dlForm, title_bn: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>ক্লাস সময়কাল</label>
                <input placeholder="যেমন: ৩৫ মিনিট" value={dlForm.duration} onChange={e => setDlForm({ ...dlForm, duration: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শিক্ষকের নাম</label>
                <input placeholder="উপস্থাপক শিক্ষকের নাম" value={dlForm.instructor_name} onChange={e => setDlForm({ ...dlForm, instructor_name: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>ভিডিও বা কনটেন্ট লিংক (URL)</label>
                <input placeholder="https://www.youtube.com/watch?v=..." value={dlForm.video_url} onChange={e => setDlForm({ ...dlForm, video_url: e.target.value })} />
              </div>
              <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0f766e', color: '#fff', fontWeight: 800 }}>
                {editingDlId ? 'কনটেন্ট আপডেট করুন' : '➕ নতুন ডিজিটাল ক্লাস যুক্ত করুন'}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <h2>ডিজিটাল ক্লাসরুম কনটেন্ট তালিকা ({digitalLearning.length} টি)</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি ও বিষয়</th>
                    <th>শিরোনাম ও ধরন</th>
                    <th>উপস্থাপক</th>
                    <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {digitalLearning.map(d => (
                    <tr key={d.id}>
                      <td><b>{d.class_name}ম শ্রেণি</b><br/><span style={{ color: '#0369a1', fontWeight: 700 }}>{d.subject_name}</span></td>
                      <td><b>{d.title_bn}</b><br/><small style={{ color: '#047857', fontWeight: 700 }}>🎥 {d.content_type} ({d.duration})</small></td>
                      <td>{d.instructor_name || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini" onClick={() => { setEditingDlId(d.id); setDlForm(d); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>এডিট</button>
                        <button type="button" className="mini danger" onClick={() => { if(confirm('মুছে ফেলবেন?')){ const up = digitalLearning.filter(x => x.id !== d.id); setDigitalLearning(up); saveStoredDigitalLearning(up); } }}>মুছুন</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: নোট ও লেকচার (Notes & Lectures)
      ======================================================== */}
      {activeTab === 'notes' && (
        <div className="module-grid">
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingNoteId ? 'নোট সম্পাদনা' : 'নতুন লেকচার শিট ও হ্যান্ডনোট এন্ট্রি'}</h2>
              {editingNoteId && <button type="button" className="mini" onClick={() => setEditingNoteId(null)}>বাতিল</button>}
            </div>
            <form onSubmit={saveNote} className="form-grid">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                <select value={noteForm.class_name} onChange={e => setNoteForm({ ...noteForm, class_name: e.target.value })}>
                  <option value="৬">৬ষ্ঠ</option><option value="৭">৭ম</option><option value="৮">৮ম</option><option value="৯">৯ম</option><option value="১০">১০ম</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় *</label>
                <input placeholder="যেমন: রসায়ন / বাংলা ২য় পত্র" value={noteForm.subject_name} onChange={e => setNoteForm({ ...noteForm, subject_name: e.target.value })} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>নোট বা শিটের পূর্ণাঙ্গ শিরোনাম *</label>
                <input placeholder="যেমন: কাজ, ক্ষমতা ও শক্তির গাণিতিক সূত্রের হ্যান্ডনোট" value={noteForm.title_bn} onChange={e => setNoteForm({ ...noteForm, title_bn: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>প্রস্তুতকারক শিক্ষক *</label>
                <input placeholder="শিক্ষকের নাম" value={noteForm.author_teacher} onChange={e => setNoteForm({ ...noteForm, author_teacher: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>ডকুমেন্ট টাইপ</label>
                <input placeholder="যেমন: PDF লেকচার শিট / হ্যান্ডনোট" value={noteForm.doc_type} onChange={e => setNoteForm({ ...noteForm, doc_type: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>নোটের সারসংক্ষেপ ও গুরুত্বপূর্ণ পয়েন্ট *</label>
                <textarea rows="3" placeholder="এই শিটে কী কী বিষয় ও প্রশ্ন সমাধান দেওয়া হয়েছে লিখুন..." value={noteForm.summary} onChange={e => setNoteForm({ ...noteForm, summary: e.target.value })} required />
              </div>
              <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0284c7', color: '#fff', fontWeight: 800 }}>
                {editingNoteId ? 'নোট আপডেট করুন' : '➕ নতুন লেকচার শিট আপলোড করুন'}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <h2>শিক্ষক হ্যান্ডনোট তালিকা ({notes.length} টি)</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি ও বিষয়</th>
                    <th>নোটের নাম ও সারসংক্ষেপ</th>
                    <th>শিক্ষক</th>
                    <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map(n => (
                    <tr key={n.id}>
                      <td><b>{n.class_name}ম শ্রেণি</b><br/><span style={{ color: '#0f766e', fontWeight: 700 }}>{n.subject_name}</span></td>
                      <td><b>{n.title_bn}</b><br/><small style={{ color: '#64748b' }}>{n.summary}</small></td>
                      <td>{n.author_teacher}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini" onClick={() => { setEditingNoteId(n.id); setNoteForm(n); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>এডিট</button>
                        <button type="button" className="mini danger" onClick={() => { if(confirm('মুছে ফেলবেন?')){ const up = notes.filter(x => x.id !== n.id); setNotes(up); saveStoredNotes(up); } }}>মুছুন</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: প্রশ্নব্যাংক ও মডেল প্রশ্ন (Question Bank)
      ======================================================== */}
      {activeTab === 'question' && (
        <div className="module-grid">
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingQbId ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন এন্ট্রি (CQ/MCQ/মডেল)'}</h2>
              {editingQbId && <button type="button" className="mini" onClick={() => setEditingQbId(null)}>বাতিল</button>}
            </div>
            <form onSubmit={saveQuestion} className="form-grid">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                <select value={qbForm.class_name} onChange={e => setQbForm({ ...qbForm, class_name: e.target.value })}>
                  <option value="৬">৬ষ্ঠ</option><option value="৭">৭ম</option><option value="৮">৮ম</option><option value="৯">৯ম</option><option value="১০">১০ম</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় *</label>
                <input placeholder="যেমন: সাধারণ গণিত" value={qbForm.subject_name} onChange={e => setQbForm({ ...qbForm, subject_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>প্রশ্নের ধরন *</label>
                <select value={qbForm.question_type} onChange={e => setQbForm({ ...qbForm, question_type: e.target.value })}>
                  <option value="সৃজনশীল (CQ)">সৃজনশীল (CQ)</option>
                  <option value="বহুনির্বাচনী (MCQ)">বহুনির্বাচনী (MCQ)</option>
                  <option value="সংক্ষিপ্ত প্রশ্ন">সংক্ষিপ্ত প্রশ্ন</option>
                  <option value="মডেল প্রশ্ন">মডেল প্রশ্ন</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>মান / স্ট্যান্ডার্ড</label>
                <input placeholder="যেমন: বোর্ড স্ট্যান্ডার্ড / সহজ / মাঝারি" value={qbForm.difficulty} onChange={e => setQbForm({ ...qbForm, difficulty: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>উদ্দীপক (Stem) - CQ এর ক্ষেত্রে</label>
                <textarea rows="2" placeholder="উদ্দীপক লিখুন (প্রযোজ্য ক্ষেত্রে)..." value={qbForm.stem} onChange={e => setQbForm({ ...qbForm, stem: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>প্রশ্নের বিবরণ (ক, খ, গ, ঘ অথবা প্রশ্ন) *</label>
                <textarea rows="3" placeholder="প্রশ্নের সম্পূর্ণ বিবরণ লিখুন..." value={qbForm.question_text} onChange={e => setQbForm({ ...qbForm, question_text: e.target.value })} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>সঠিক উত্তর বা সমাধান হিন্ট</label>
                <input placeholder="সঠিক উত্তর লিখুন..." value={qbForm.answer} onChange={e => setQbForm({ ...qbForm, answer: e.target.value })} />
              </div>
              <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0284c7', color: '#fff', fontWeight: 800 }}>
                {editingQbId ? 'প্রশ্ন আপডেট করুন' : '➕ প্রশ্নব্যাংকে যুক্ত করুন'}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <h2>প্রশ্নভাণ্ডার ({questions.length} টি)</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি ও বিষয়</th>
                    <th>ধরন</th>
                    <th>প্রশ্ন বিবরণ</th>
                    <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q.id}>
                      <td><b>{q.class_name}ম শ্রেণি</b><br/><span style={{ color: '#0369a1', fontWeight: 700 }}>{q.subject_name}</span></td>
                      <td><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{q.question_type}</span></td>
                      <td>{q.stem && <div style={{ fontSize: '12px', color: '#64748b' }}>উদ্দীপক: {q.stem}</div>}<b>{q.question_text}</b>{q.answer && <div style={{ fontSize: '12px', color: '#047857' }}>উত্তর: {q.answer}</div>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini" onClick={() => { setEditingQbId(q.id); setQbForm(q); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>এডিট</button>
                        <button type="button" className="mini danger" onClick={() => { if(confirm('মুছে ফেলবেন?')){ const up = questions.filter(x => x.id !== q.id); setQuestions(up); saveStoredQuestions(up); } }}>মুছুন</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: অ্যাসাইনমেন্ট ও মক টেস্ট (Assignments)
      ======================================================== */}
      {activeTab === 'assignment' && (
        <div className="module-grid">
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingAsId ? 'অ্যাসাইনমেন্ট সম্পাদনা' : 'নতুন অ্যাসাইনমেন্ট ও মক টেস্ট প্রকাশ'}</h2>
              {editingAsId && <button type="button" className="mini" onClick={() => setEditingAsId(null)}>বাতিল</button>}
            </div>
            <form onSubmit={saveAssignment} className="form-grid">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                <select value={asForm.class_name} onChange={e => setAsForm({ ...asForm, class_name: e.target.value })}>
                  <option value="৬">৬ষ্ঠ</option><option value="৭">৭ম</option><option value="৮">৮ম</option><option value="৯">৯ম</option><option value="১০">১০ম</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় *</label>
                <input placeholder="যেমন: পদার্থবিজ্ঞান" value={asForm.subject_name} onChange={e => setAsForm({ ...asForm, subject_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>সপ্তাহ / পর্ব</label>
                <input placeholder="যেমন: ৪র্থ সপ্তাহ" value={asForm.week_no} onChange={e => setAsForm({ ...asForm, week_no: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>জমার শেষ তারিখ *</label>
                <input type="date" value={asForm.submission_deadline} onChange={e => setAsForm({ ...asForm, submission_deadline: e.target.value })} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>অ্যাসাইনমেন্টের পূর্ণাঙ্গ শিরোনাম *</label>
                <input placeholder="যেমন: শক্তি সংরক্ষণশীলতা নীতির ব্যবহারিক প্রয়োগ প্রতিবেদন" value={asForm.title_bn} onChange={e => setAsForm({ ...asForm, title_bn: e.target.value })} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>নির্দেশনা ও মূল্যায়নের রুব্রিক্স *</label>
                <textarea rows="3" placeholder="শিক্ষার্থীরা কীভাবে অ্যাসাইনমেন্ট লিখবে ও কোন বিষয়ের ওপর নম্বর দেওয়া হবে..." value={asForm.instructions} onChange={e => setAsForm({ ...asForm, instructions: e.target.value })} required />
              </div>
              <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0284c7', color: '#fff', fontWeight: 800 }}>
                {editingAsId ? 'অ্যাসাইনমেন্ট আপডেট করুন' : '➕ নতুন অ্যাসাইনমেন্ট প্রকাশ করুন'}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <h2>অ্যাসাইনমেন্ট রেজিস্টার ({assignments.length} টি)</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>শ্রেণি ও বিষয়</th>
                    <th>অ্যাসাইনমেন্ট শিরোনাম</th>
                    <th>শেষ তারিখ</th>
                    <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td><b>{a.class_name}ম শ্রেণি</b><br/><span style={{ color: '#0369a1', fontWeight: 700 }}>{a.subject_name}</span></td>
                      <td><b>{a.title_bn}</b><br/><small style={{ color: '#64748b' }}>{a.instructions}</small></td>
                      <td><b style={{ color: '#dc2626' }}>{a.submission_deadline}</b><br/><small>{a.total_marks} নম্বর</small></td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini" onClick={() => { setEditingAsId(a.id); setAsForm(a); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>এডিট</button>
                        <button type="button" className="mini danger" onClick={() => { if(confirm('মুছে ফেলবেন?')){ const up = assignments.filter(x => x.id !== a.id); setAssignments(up); saveStoredAssignments(up); } }}>মুছুন</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 8: অনলাইন পরীক্ষা (Online Exams)
      ======================================================== */}
      {activeTab === 'online_exam' && (
        <div className="module-grid">
          <div className="form-card">
            <div className="toolbar">
              <h2>{editingOeId ? 'অনলাইন পরীক্ষা সম্পাদনা' : 'নতুন অনলাইন পরীক্ষা ও কুইজ তৈরি'}</h2>
              {editingOeId && <button type="button" className="mini" onClick={() => setEditingOeId(null)}>বাতিল</button>}
            </div>
            <form onSubmit={saveOnlineExam} className="form-grid">
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি *</label>
                <select value={oeForm.class_name} onChange={e => setOeForm({ ...oeForm, class_name: e.target.value })}>
                  <option value="৬">৬ষ্ঠ</option><option value="৭">৭ম</option><option value="৮">৮ম</option><option value="৯">৯ম</option><option value="১০">১০ম</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয় *</label>
                <input placeholder="যেমন: তথ্য ও যোগাযোগ প্রযুক্তি" value={oeForm.subject_name} onChange={e => setOeForm({ ...oeForm, subject_name: e.target.value })} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>পরীক্ষার নাম / কুইজ শিরোনাম *</label>
                <input placeholder="যেমন: ১০ম শ্রেণি - আইসিটি স্পিড টেস্ট কুইজ" value={oeForm.title_bn} onChange={e => setOeForm({ ...oeForm, title_bn: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>সময় (মিনিট) *</label>
                <input type="number" min="5" value={oeForm.duration_minutes} onChange={e => setOeForm({ ...oeForm, duration_minutes: Number(e.target.value) })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>মোট নম্বর *</label>
                <input type="number" min="5" value={oeForm.total_marks} onChange={e => setOeForm({ ...oeForm, total_marks: Number(e.target.value) })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>পাস নম্বর *</label>
                <input type="number" min="1" value={oeForm.pass_marks} onChange={e => setOeForm({ ...oeForm, pass_marks: Number(e.target.value) })} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>স্ট্যাটাস</label>
                <select value={oeForm.status} onChange={e => setOeForm({ ...oeForm, status: e.target.value })}>
                  <option value="সক্রিয়">সক্রিয় (চলমান)</option>
                  <option value="আসন্ন">আসন্ন</option>
                  <option value="সম্পন্ন">সম্পন্ন</option>
                </select>
              </div>
              <button type="submit" className="btn full" style={{ gridColumn: '1 / -1', background: '#0284c7', color: '#fff', fontWeight: 800 }}>
                {editingOeId ? 'পরীক্ষা আপডেট করুন' : '➕ নতুন অনলাইন কুইজ শুরু করুন'}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="toolbar">
              <h2>অনলাইন পরীক্ষা তালিকা ({onlineExams.length} টি)</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>পরীক্ষা ও শ্রেণি</th>
                    <th>সময় ও নম্বর</th>
                    <th>অংশগ্রহণ</th>
                    <th>অবস্থা</th>
                    <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineExams.map(o => (
                    <tr key={o.id}>
                      <td><b>{o.title_bn}</b><br/><span style={{ color: '#0369a1', fontWeight: 700 }}>{o.class_name}ম শ্রেণি • {o.subject_name}</span></td>
                      <td>⏰ {o.duration_minutes} মিনিট<br/><small style={{ color: '#047857', fontWeight: 700 }}>পূর্ণমান: {o.total_marks} | পাস: {o.pass_marks}</small></td>
                      <td><b>{o.attempts_count} জন</b></td>
                      <td><span style={{ background: o.status === 'সক্রিয়' ? '#ecfdf5' : '#f1f5f9', color: o.status === 'সক্রিয়' ? '#065f46' : '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{o.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini" onClick={() => { setEditingOeId(o.id); setOeForm(o); window.scrollTo({ top: 100, behavior: 'smooth' }); }}>এডিট</button>
                        <button type="button" className="mini danger" onClick={() => { if(confirm('মুছে ফেলবেন?')){ const up = onlineExams.filter(x => x.id !== o.id); setOnlineExams(up); saveStoredOnlineExams(up); } }}>মুছুন</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 9: AI শিক্ষা সহকারী ও শিক্ষক পাওয়ার টুলস (AI Copilot)
      ======================================================== */}
      {activeTab === 'ai' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* AI Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>🤖</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>শিক্ষকদের AI কোপাইলট ও স্মার্ট শিক্ষা সহকারী</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.95 }}>
                    জাতীয় শিক্ষাক্রমের আলোকে ১-ক্লিকে লেসন প্ল্যান, ডিজিটাল কনটেন্ট স্লাইড আইডিয়া, ক্লাসরুম ম্যানেজমেন্ট ও মূল্যায়ন প্রশ্ন তৈরি করুন
                  </p>
                </div>
              </div>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              AI Powered Teaching Assistant
            </span>
          </div>

          {/* AI Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'lesson_plan', label: '📝 ১-ক্লিকে লেসন প্ল্যান জেনারেটর', icon: '📝' },
              { id: 'digital_content', label: '💡 ডিজিটাল স্লাইড ও কনটেন্ট আইডিয়া', icon: '💡' },
              { id: 'classroom_mgmt', label: '🏫 ক্লাসরুম ম্যানেজমেন্ট স্ট্র্যাটেজি', icon: '🏫' },
              { id: 'ai_chat', label: '💬 লাইভ টিচার AI কনসালট্যান্ট', icon: '💬' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAiSubTab(tab.id)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '13px',
                  background: aiSubTab === tab.id ? '#4f46e5' : '#f8fafc',
                  color: aiSubTab === tab.id ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI SUBTAB 1: LESSON PLAN */}
          {aiSubTab === 'lesson_plan' && (
            <div className="module-grid" style={{ gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.5fr)' }}>
              {/* Input Form */}
              <div className="form-card" style={{ border: '1px solid #e0e7ff', background: '#faf5ff' }}>
                <div className="toolbar">
                  <div>
                    <span className="eyebrow" style={{ color: '#6d28d9' }}>LESSON PLAN CONFIG</span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>লেসন প্ল্যান তৈরির তথ্য</h3>
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি</label>
                    <select value={lpForm.class_name} onChange={e => setLpForm({ ...lpForm, class_name: e.target.value })}>
                      <option value="৬">৬ষ্ঠ শ্রেণি</option>
                      <option value="৭">৭ম শ্রেণি</option>
                      <option value="৮">৮ম শ্রেণি</option>
                      <option value="৯">৯ম শ্রেণি</option>
                      <option value="১০">১০ম শ্রেণি</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয়</label>
                    <input value={lpForm.subject} onChange={e => setLpForm({ ...lpForm, subject: e.target.value })} placeholder="যেমন: পদার্থবিজ্ঞান" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>আজকের পাঠের শিরোনাম / টপিক *</label>
                    <input value={lpForm.topic} onChange={e => setLpForm({ ...lpForm, topic: e.target.value })} placeholder="যেমন: গতির সমীকরণ ও ত্বরণ" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>পিরিয়ড সময়</label>
                    <select value={lpForm.period_duration} onChange={e => setLpForm({ ...lpForm, period_duration: e.target.value })}>
                      <option value="৪০ মিনিট">৪০ মিনিট</option>
                      <option value="৪৫ মিনিট">৪৫ মিনিট</option>
                      <option value="৫০ মিনিট">৫০ মিনিট</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>শিখন পদ্ধতি</label>
                    <select value={lpForm.pedagogy_focus} onChange={e => setLpForm({ ...lpForm, pedagogy_focus: e.target.value })}>
                      <option value="ইন্টারেক্টিভ ও অ্যাক্টিভিটি ভিত্তিক">ইন্টারেক্টিভ ও অ্যাক্টিভিটি ভিত্তিক</option>
                      <option value="দলগত ও অনুসন্ধানমূলক কাজ">দলগত ও অনুসন্ধানমূলক কাজ</option>
                      <option value="ব্যবহারিক ও পরীক্ষণমূলক">ব্যবহারিক ও পরীক্ষণমূলক</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn full"
                    onClick={handleGenerateLessonPlan}
                    disabled={isAiGenerating}
                    style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', fontWeight: 800, padding: '12px' }}
                  >
                    {isAiGenerating ? '⏳ AI লেসন প্ল্যান লিখছে...' : '✨ ১-ক্লিকে জাতীয় কারিকুলাম লেসন প্ল্যান তৈরি করুন'}
                  </button>
                </div>
              </div>

              {/* Generated Result Output */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '15px' }}>
                    📋 প্রস্তুতকৃত অফিশিয়াল লেসন প্ল্যান
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="mini"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLessonPlan);
                        showToast('লেসন প্ল্যান ক্লিপবোর্ডে কপি হয়েছে!');
                      }}
                      style={{ background: '#f1f5f9', color: '#1e293b' }}
                    >
                      📋 টেক্সট কপি
                    </button>
                    <button
                      type="button"
                      className="mini"
                      onClick={() => {
                        printDoc(
                          `দৈনিক পাঠ পরিকল্পনা (Lesson Plan) — শ্রেণি: ${lpForm.class_name}ম, বিষয়: ${lpForm.subject}`,
                          `<span>টপিক: <b>${lpForm.topic}</b></span><span>তারিখ: <b>${new Date().toLocaleDateString('bn-BD')}</b></span>`,
                          `<div style="white-space: pre-wrap; font-size: 13.5px; line-height: 1.6; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px;">${generatedLessonPlan}</div>`
                        );
                      }}
                      style={{ background: '#0284c7', color: '#fff' }}
                    >
                      🖨️ প্রিন্ট / PDF
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, maxHeight: '480px', overflowY: 'auto', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', fontSize: '13.5px', lineHeight: '1.7', color: '#1e293b' }}>
                    {generatedLessonPlan}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* AI SUBTAB 2: DIGITAL CONTENT IDEAS */}
          {aiSubTab === 'digital_content' && (
            <div className="module-grid" style={{ gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.5fr)' }}>
              <div className="form-card" style={{ border: '1px solid #e0f2fe', background: '#f0f9ff' }}>
                <div className="toolbar">
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0369a1' }}>ডিজিটাল স্লাইড ও প্রেজেন্টেশন আইডিয়া</h3>
                </div>
                <div className="form-grid">
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>শ্রেণি</label>
                    <select value={dcForm.class_name} onChange={e => setDcForm({ ...dcForm, class_name: e.target.value })}>
                      <option value="৬">৬ষ্ঠ শ্রেণি</option><option value="৭">৭ম শ্রেণি</option><option value="৮">৮ম শ্রেণি</option><option value="৯">৯ম শ্রেণি</option><option value="১০">১০ম শ্রেণি</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>বিষয়</label>
                    <input value={dcForm.subject} onChange={e => setDcForm({ ...dcForm, subject: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>টপিক / বিষয়বস্তু *</label>
                    <input value={dcForm.topic} onChange={e => setDcForm({ ...dcForm, topic: e.target.value })} />
                  </div>
                  <button
                    type="button"
                    className="btn full"
                    onClick={handleGenerateDigitalSlides}
                    disabled={isAiGenerating}
                    style={{ gridColumn: '1 / -1', background: '#0284c7', color: '#fff', fontWeight: 800 }}
                  >
                    {isAiGenerating ? '⏳ তৈরি হচ্ছে...' : '💡 স্লাইড আউটলাইন ও অ্যানিমেশন আইডিয়া তৈরি করুন'}
                  </button>
                </div>
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', color: '#0369a1' }}>📺 ক্লাসের জন্য স্মার্টবোর্ড স্লাইড কাঠামো</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {generatedSlides.map((slide, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '12px 14px', borderRadius: '4px', fontSize: '13.5px' }}>
                      <b>{slide}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI SUBTAB 3: CLASSROOM MANAGEMENT */}
          {aiSubTab === 'classroom_mgmt' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                  { id: 'noise_control', label: 'কোলাহল ও বিশৃঙ্খলা নিয়ন্ত্রণ' },
                  { id: 'slow_learners', label: 'পেছিয়ে পড়া শিক্ষার্থীর অংশগ্রহণ' },
                  { id: 'fast_finishers', label: 'দ্রুত কাজ শেষ করা শিক্ষার্থীদের ব্যস্ত রাখা' },
                  { id: 'exam_anxiety', label: 'শিক্ষার্থীদের পরীক্ষাভীতি দূরীকরণ' }
                ].map(sc => (
                  <button
                    key={sc.id}
                    type="button"
                    className="mini"
                    onClick={() => setCmScenario(sc.id)}
                    style={{
                      background: cmScenario === sc.id ? '#0f766e' : '#f1f5f9',
                      color: cmScenario === sc.id ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      padding: '8px 12px'
                    }}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 10px', color: '#065f46', fontSize: '17px' }}>
                  💡 শিক্ষকের জন্য প্রমাণিত আধুনিক ক্লাসরুম কৌশল
                </h3>
                {cmScenario === 'noise_control' && (
                  <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#1e293b' }}>
                    <p><b>কৌশল ১: “ক্ল্যাপ অ্যান্ড পজ (Clap and Pause)”</b><br/> শিক্ষক মুখে চিৎকার করে শান্ত হতে বলবেন না। শুধু দুটি তালি দিয়ে ২ সেকেন্ড থামবেন। শিক্ষার্থীরা সংকেতটি শিখলে পুরো শ্রেণি স্বয়ংক্রিয়ভাবে নিরব হয়ে শিক্ষকের দিকে তাকাবে।</p>
                    <p><b>কৌশল ২: “দলগত পয়েন্ট গেম (Class Points)”</b><br/> বোর্ডে ৫টি সারির জন্য ১, ২, ৩, ৪, ৫ লিখে রাখুন। যে সারি শান্ত হয়ে শুনবে তারা +১ পয়েন্ট পাবে। বিজয়ী সারির জন্য ক্লাসের শেষে প্রশংসাসূচক তালি দিন।</p>
                  </div>
                )}
                {cmScenario === 'slow_learners' && (
                  <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#1e293b' }}>
                    <p><b>কৌশল ১: “থিংক-পেয়ার-শেয়ার (Think-Pair-Share)”</b><br/> দুর্বল শিক্ষার্থীকে সরাসরি প্রশ্ন না করে প্রথমে পাশের সহপাঠীর সাথে ৩০ সেকেন্ড আলোচনা করতে দিন। এরপর তাকে বলার সুযোগ দিন। ভুল হলেও চেষ্টার জন্য ধন্যবাদ দিন।</p>
                    <p><b>কৌশল ২: “মাইক্রো স্টেপস (Micro Steps)”</b><br/> বড় জটিল সমীকরণকে ছোট ছোট ৩টি ধাপে ভাগ করে বোর্ডের একপাশে লিখে রাখুন যাতে তারা কোনো ধাপে আটকে না যায়।</p>
                  </div>
                )}
                {cmScenario === 'fast_finishers' && (
                  <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#1e293b' }}>
                    <p><b>কৌশল ১: “পিয়ার মেন্টর (Buddy Assistant)”</b><br/> যারা কাজ দ্রুত শেষ করে তাদের ক্লাসে বিশৃঙ্খলা করতে না দিয়ে অন্য সহপাঠীকে বুঝিয়ে সাহায্য করার সম্মানজনক দায়িত্ব দিন।</p>
                    <p><b>কৌশল ২: “বোনাস ব্রেনটিজার (Bonus Brainteaser)”</b><br/> বোর্ডের কোণায় একটি অতিরিক্ত চ্যালেঞ্জিং ধাঁধা বা জটিল প্রশ্ন লিখে রাখুন।</p>
                  </div>
                )}
                {cmScenario === 'exam_anxiety' && (
                  <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#1e293b' }}>
                    <p><b>কৌশল ১: “১ মিনিটের মাইন্ডফুলনেস ব্রিদিং”</b><br/> পরীক্ষার শুরুতে বা কঠিন ক্লাসের আগে শিক্ষার্থীদের চোখ বন্ধ করে ৩ বার গভীর শ্বাস নিতে বলুন।</p>
                    <p><b>কৌশল ২: “ভয় দূরীকরণ মক সেশন”</b><br/> পরীক্ষার প্রশ্নপত্রের ধাঁচে ১০ নম্বরের কুইজ নিয়ে ক্লাসেই সমাধান আলোচনা করুন।</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI SUBTAB 4: LIVE AI CHAT CONSULTANT */}
          {aiSubTab === 'ai_chat' && (
            <div>
              <div style={{
                maxHeight: '380px',
                overflowY: 'auto',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '16px',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {aiChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: msg.role === 'user' ? '#4f46e5' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '4px', opacity: 0.8 }}>
                      {msg.role === 'user' ? '👨‍🏫 আপনি (শিক্ষক)' : '🤖 AI সহকারী'}
                    </div>
                    {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAiChat} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="পড়াশোনা, ক্লাসরুম বা লেসন প্ল্যান নিয়ে আপনার প্রশ্ন লিখুন (যেমন: ১০ম শ্রেণির ত্রিকোণমিতি সহজে কীভাবে পড়াব?)..."
                  value={aiChatInput}
                  onChange={e => setAiChatInput(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="submit"
                  className="btn"
                  style={{ background: '#4f46e5', color: '#fff', fontWeight: 800, padding: '10px 20px', borderRadius: '8px' }}
                >
                  পাঠান ➔
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Live Preview Modal */}
      {previewModal && (
        <SubmenuDetailModal
          menuKey={previewModal.key}
          title={previewModal.title}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
}
