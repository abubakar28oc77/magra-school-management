// frontend/src/QuestionBankPanel.jsx
// Magra E-ProshnoBank Engine & Central Question Repository
// Inspired by eproshnobank.com with Board-Standard Exam Generator, OMR Evaluator, and Chapter Repository

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SUBJECT_METADATA,
  CHAPTERS_DATA,
  SEED_QUESTIONS,
  getStoredQuestions,
  saveQuestionItem,
  deleteQuestionItem,
  getSavedExamPapers,
  saveExamPaperToArchive,
  deleteExamPaper,
  getOmrResults,
  saveOmrEvaluation,
  deleteOmrEvaluation,
  generateQuestionPaper
} from './questionBankData';
import schoolLogo from '../public/school-logo.png';

// Utility for Bengali Digits
export const toBn = (n) => (n === null || n === undefined || n === '') ? '০' : String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

const VALID_TABS = ['generator', 'bank', 'omr', 'saved', 'model'];

export function QuestionBankPanel({ sub, setSub }) {
  // Sync tab with sub prop
  const [activeTab, setActiveTab] = useState(() => {
    return VALID_TABS.includes(sub) ? sub : 'generator';
  });

  useEffect(() => {
    if (VALID_TABS.includes(sub)) {
      setActiveTab(sub);
    }
  }, [sub]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (setSub) setSub(tab);
  };

  // -------------------------------------------------------------
  // Data States
  // -------------------------------------------------------------
  const [questions, setQuestions] = useState(() => getStoredQuestions());
  const [savedPapers, setSavedPapers] = useState(() => getSavedExamPapers());
  const [omrResults, setOmrResults] = useState(() => getOmrResults());
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // -------------------------------------------------------------
  // Generator State
  // -------------------------------------------------------------
  const [genSchoolName, setGenSchoolName] = useState('মাগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়');
  const [genExamName, setGenExamName] = useState('অর্ধবার্ষিক পরীক্ষা ২০২৬');
  const [genClass, setGenClass] = useState('10');
  const [genSubjectId, setGenSubjectId] = useState('physics');
  const [genSelectedChapters, setGenSelectedChapters] = useState([]);
  const [genTimeAllowed, setGenTimeAllowed] = useState('২ ঘণ্টা ৩০ মিনিট');
  const [genTotalMarks, setGenTotalMarks] = useState(100);
  const [genMcqCount, setGenMcqCount] = useState(25);
  const [genCqCount, setGenCqCount] = useState(8);
  const [genCqToAnswer, setGenCqToAnswer] = useState(5);
  const [genDifficulty, setGenDifficulty] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);

  // Current Generated / Active Paper
  const [activePaper, setActivePaper] = useState(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  // Available subjects for the selected class
  const availableSubjects = useMemo(() => {
    return SUBJECT_METADATA.filter(s => s.classes.includes(genClass));
  }, [genClass]);

  // Sync subject if not available in current class
  useEffect(() => {
    if (!availableSubjects.find(s => s.id === genSubjectId) && availableSubjects.length > 0) {
      setGenSubjectId(availableSubjects[0].id);
    }
  }, [genClass, availableSubjects, genSubjectId]);

  // Current subject metadata
  const currentSubject = useMemo(() => {
    return SUBJECT_METADATA.find(s => s.id === genSubjectId) || availableSubjects[0] || SUBJECT_METADATA[0];
  }, [genSubjectId, availableSubjects]);

  // Available chapters for selected subject & class
  const availableChapters = useMemo(() => {
    if (CHAPTERS_DATA[genSubjectId] && CHAPTERS_DATA[genSubjectId][genClass]) {
      return CHAPTERS_DATA[genSubjectId][genClass];
    }
    return [];
  }, [genSubjectId, genClass]);

  // Handle 1-Click Generation
  const handleGeneratePaper = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const paper = generateQuestionPaper({
          schoolName: genSchoolName,
          examName: genExamName,
          className: genClass,
          subjectId: currentSubject.id,
          subjectName: currentSubject.name,
          subjectCode: currentSubject.code,
          selectedChapters: genSelectedChapters,
          timeAllowed: genTimeAllowed,
          totalMarks: Number(genTotalMarks),
          mcqCount: Number(genMcqCount),
          cqCount: Number(genCqCount),
          cqToAnswer: Number(genCqToAnswer),
          difficulty: genDifficulty
        });
        setActivePaper(paper);
        showToast('বোর্ড স্ট্যান্ডার্ড প্রশ্নপত্র ১-ক্লিকে সফলভাবে তৈরি হয়েছে!');
      } catch (err) {
        showToast('ত্রুটি: ' + err.message);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  // Reshuffle questions in active paper
  const handleReshufflePaper = () => {
    if (!activePaper) return;
    handleGeneratePaper();
    showToast('বিকল্প প্রশ্ন সমন্বয়ে প্রশ্নপত্র রিসাফল করা হয়েছে!');
  };

  // Save active paper to archive
  const handleSaveActivePaper = () => {
    if (!activePaper) return;
    const updated = saveExamPaperToArchive(activePaper);
    setSavedPapers(updated);
    showToast('প্রশ্নপত্র আর্কাইভে স্থায়ীভাবে সংরক্ষণ করা হয়েছে!');
  };

  // -------------------------------------------------------------
  // Question Bank / Repository Tab State
  // -------------------------------------------------------------
  const [bankClass, setBankClass] = useState('all');
  const [bankSubject, setBankSubject] = useState('all');
  const [bankType, setBankType] = useState('all');
  const [bankSearch, setBankSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQForm, setNewQForm] = useState({
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '',
    question_type: 'mcq',
    question_bn: '',
    options: ['', '', '', ''],
    correct_index: 0,
    marks: 1,
    explanation: '',
    stimulus: '',
    sub_q_a: '',
    sub_q_b: '',
    sub_q_c: '',
    sub_q_d: ''
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (bankClass !== 'all' && String(q.class_name) !== String(bankClass)) return false;
      if (bankSubject !== 'all' && q.subject_id !== bankSubject) return false;
      if (bankType !== 'all' && q.question_type !== bankType) return false;
      if (bankSearch.trim()) {
        const txt = bankSearch.toLowerCase();
        const matchQ = (q.question_bn || '').toLowerCase().includes(txt);
        const matchStimulus = (q.stimulus || '').toLowerCase().includes(txt);
        const matchChapter = (q.chapter || '').toLowerCase().includes(txt);
        const matchSub = (q.subject_name || '').toLowerCase().includes(txt);
        if (!matchQ && !matchStimulus && !matchChapter && !matchSub) return false;
      }
      return true;
    });
  }, [questions, bankClass, bankSubject, bankType, bankSearch]);

  const handleAddNewQuestion = (e) => {
    e.preventDefault();
    if (!newQForm.question_bn.trim() && !newQForm.stimulus.trim()) {
      alert('প্রশ্নের বিবরণ বা উদ্দীপক দিন');
      return;
    }

    const subMeta = SUBJECT_METADATA.find(s => s.id === newQForm.subject_id);
    const subName = subMeta ? subMeta.name : newQForm.subject_id;

    let item;
    if (newQForm.question_type === 'mcq') {
      const opts = newQForm.options.map((o, idx) => o.trim() || `বিকল্প ${['ক','খ','গ','ঘ'][idx]}`);
      item = {
        id: 'user-mcq-' + Date.now().toString(36),
        class_name: newQForm.class_name,
        subject_id: newQForm.subject_id,
        subject_name: subName,
        chapter: newQForm.chapter || 'পাঠ্যবইভিত্তিক',
        question_type: 'mcq',
        question_bn: newQForm.question_bn,
        options: opts,
        correct_index: Number(newQForm.correct_index),
        correct_answer: opts[newQForm.correct_index] || opts[0],
        marks: Number(newQForm.marks) || 1,
        explanation: newQForm.explanation || 'সঠিক উত্তর নির্বাচন করা হয়েছে।'
      };
    } else {
      item = {
        id: 'user-cq-' + Date.now().toString(36),
        class_name: newQForm.class_name,
        subject_id: newQForm.subject_id,
        subject_name: subName,
        chapter: newQForm.chapter || 'সংশ্লিষ্ট অধ্যায়',
        question_type: 'cq',
        stimulus: newQForm.stimulus || newQForm.question_bn,
        sub_questions: [
          { label: 'ক', text: newQForm.sub_q_a || 'জ্ঞানমূলক প্রশ্ন লিখ।', marks: 1 },
          { label: 'খ', text: newQForm.sub_q_b || 'অনুধাবনমূলক ব্যাখ্যা কর।', marks: 2 },
          { label: 'গ', text: newQForm.sub_q_c || 'প্রয়োগমূলক প্রশ্নের গাণিতিক/তাত্ত্বিক সমাধান দাও।', marks: 3 },
          { label: 'ঘ', text: newQForm.sub_q_d || 'উচ্চতর দক্ষতার আলোকে মূল্যায়ন কর।', marks: 4 }
        ],
        explanation: newQForm.explanation || 'বোর্ড স্ট্যান্ডার্ড সৃজনশীল প্রশ্নের উত্তর নির্দেশিকা।',
        marks: 10
      };
    }

    const updated = saveQuestionItem(item);
    setQuestions(updated);
    setIsAddModalOpen(false);
    showToast('নতুন প্রশ্ন সফলভাবে প্রশ্নভাণ্ডারে সংরক্ষিত হয়েছে!');
    // Reset form
    setNewQForm({
      class_name: '10',
      subject_id: 'physics',
      subject_name: 'পদার্থবিজ্ঞান',
      chapter: '',
      question_type: 'mcq',
      question_bn: '',
      options: ['', '', '', ''],
      correct_index: 0,
      marks: 1,
      explanation: '',
      stimulus: '',
      sub_q_a: '',
      sub_q_b: '',
      sub_q_c: '',
      sub_q_d: ''
    });
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('আপনি কি এই প্রশ্নটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      const updated = deleteQuestionItem(id);
      setQuestions(updated);
      showToast('প্রশ্নটি তালিকা থেকে মুছে ফেলা হয়েছে।');
    }
  };

  // -------------------------------------------------------------
  // OMR Tab State
  // -------------------------------------------------------------
  const [omrMode, setOmrMode] = useState('evaluator'); // 'evaluator' | 'sheet' | 'records'
  const [omrQuestionCount, setOmrQuestionCount] = useState(25);
  const [omrExamTitle, setOmrExamTitle] = useState('অর্ধবার্ষিক মূল্যায়ন ২০২৬');
  const [omrSetCode, setOmrSetCode] = useState('ক');
  const [omrStudentRoll, setOmrStudentRoll] = useState('');
  const [omrStudentName, setOmrStudentName] = useState('');

  // Key answers for evaluator: Array of indices (0=ক, 1=খ, 2=গ, 3=ঘ)
  const [answerKey, setAnswerKey] = useState(() => Array(25).fill(0));
  // Student submitted answers: Array of indices or null if unattempted
  const [studentAnswers, setStudentAnswers] = useState(() => Array(25).fill(null));

  // Sync answerKey length when omrQuestionCount changes
  useEffect(() => {
    setAnswerKey(prev => {
      const arr = Array(omrQuestionCount).fill(0);
      for (let i = 0; i < Math.min(prev.length, omrQuestionCount); i++) {
        arr[i] = prev[i];
      }
      return arr;
    });
    setStudentAnswers(prev => {
      const arr = Array(omrQuestionCount).fill(null);
      for (let i = 0; i < Math.min(prev.length, omrQuestionCount); i++) {
        arr[i] = prev[i];
      }
      return arr;
    });
  }, [omrQuestionCount]);

  // Load Answer Key from active generated paper
  const handleLoadKeyFromPaper = (paper) => {
    if (!paper || !paper.mcqs || paper.mcqs.length === 0) {
      alert('কোনো সক্রিয় প্রশ্নপত্র পাওয়া যায়নি। প্রথমে প্রশ্নপত্র জেনারেট করুন।');
      return;
    }
    const count = paper.mcqs.length;
    setOmrQuestionCount(count);
    setOmrExamTitle(paper.title);
    const key = paper.mcqs.map(q => q.correct_index !== undefined ? q.correct_index : 0);
    setAnswerKey(key);
    setStudentAnswers(Array(count).fill(null));
    switchTab('omr');
    setOmrMode('evaluator');
    showToast(`প্রশ্নপত্র "${paper.subjectName}" থেকে ${toBn(count)}টি প্রশ্নের অ্যান্সার-কী লোড হয়েছে!`);
  };

  // Evaluation calculation
  const evaluationStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    studentAnswers.forEach((ans, idx) => {
      if (ans === null || ans === undefined) {
        unattempted++;
      } else if (ans === answerKey[idx]) {
        correct++;
      } else {
        wrong++;
      }
    });

    const marksPerQ = 1;
    const score = correct * marksPerQ;
    const percentage = omrQuestionCount > 0 ? ((score / (omrQuestionCount * marksPerQ)) * 100).toFixed(1) : 0;
    
    let grade = 'F';
    let gpa = '০.০০';
    if (percentage >= 80) { grade = 'A+'; gpa = '৫.০০'; }
    else if (percentage >= 70) { grade = 'A'; gpa = '৪.০০'; }
    else if (percentage >= 60) { grade = 'A-'; gpa = '৩.৫০'; }
    else if (percentage >= 50) { grade = 'B'; gpa = '৩.০০'; }
    else if (percentage >= 40) { grade = 'C'; gpa = '২.০০'; }
    else if (percentage >= 33) { grade = 'D'; gpa = '১.০০'; }

    return {
      total: omrQuestionCount,
      correct,
      wrong,
      unattempted,
      score,
      percentage,
      grade,
      gpa,
      isPass: score >= Math.ceil(omrQuestionCount * 0.33)
    };
  }, [studentAnswers, answerKey, omrQuestionCount]);

  // Save current student OMR evaluation
  const handleSaveEvaluation = () => {
    if (!omrStudentRoll.trim() && !omrStudentName.trim()) {
      alert('দয়া করে শিক্ষার্থীর রোল নম্বর বা নাম লিখুন।');
      return;
    }
    const rec = {
      exam_title: omrExamTitle,
      set_code: omrSetCode,
      student_roll: omrStudentRoll || '—',
      student_name: omrStudentName || 'নাম এন্ট্রি হয়নি',
      total_questions: evaluationStats.total,
      correct_count: evaluationStats.correct,
      wrong_count: evaluationStats.wrong,
      unattempted_count: evaluationStats.unattempted,
      score: evaluationStats.score,
      percentage: evaluationStats.percentage,
      grade: evaluationStats.grade,
      gpa: evaluationStats.gpa,
      student_answers: [...studentAnswers]
    };
    const updated = saveOmrEvaluation(rec);
    setOmrResults(updated);
    showToast(`রোল ${toBn(omrStudentRoll)} এর OMR মূল্যায়ন সংরক্ষণ সম্পন্ন হয়েছে!`);
    // Clear student answers for next student entry
    setOmrStudentRoll('');
    setOmrStudentName('');
    setStudentAnswers(Array(omrQuestionCount).fill(null));
  };

  // -------------------------------------------------------------
  // Print Helper (High-quality isolated print)
  // -------------------------------------------------------------
  const handlePrint = (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) {
      window.print();
      return;
    }
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Magra High School - Official Print Document</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: 'Hind Siliguri', 'Inter', -apple-system, sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 20px;
              line-height: 1.45;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
            @page {
              size: A4 portrait;
              margin: 12mm 10mm;
            }
            .no-print { display: none !important; }
            .print-cols-2 {
              column-count: 2;
              column-gap: 24px;
              column-rule: 1px dashed #cbd5e1;
            }
            .question-item {
              break-inside: avoid;
              margin-bottom: 12px;
              font-size: 13px;
            }
            .stimulus-box {
              background: #f8fafc;
              border: 1px solid #94a3b8;
              border-radius: 6px;
              padding: 10px 12px;
              margin-bottom: 8px;
              font-size: 13px;
            }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 4px 6px; font-size: 12px; }
            .bubble-circ {
              display: inline-flex;
              width: 17px;
              height: 17px;
              border: 1.5px solid #0f172a;
              border-radius: 50%;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              font-weight: bold;
              margin: 0 2px;
            }
            .bubble-circ.filled {
              background: #0f172a;
              color: #fff;
            }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(() => { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="proshnobank-container" style={{ padding: '4px 0 40px', color: '#1e293b' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#047857',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '14px',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Quick Metrics */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '22px',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.4px', marginBottom: '8px' }}>
              <span>🏛️ EIIN: 114290</span>
              <span>•</span>
              <span>ই-প্রশ্নব্যাংক ইঞ্জিন ও OMR মূল্যায়ন প্ল্যাটফর্ম</span>
            </div>
            <h1 style={{ margin: '4px 0 6px', fontSize: '24px', fontWeight: 800, color: '#f0fdf4' }}>
              মাগড়া কেন্দ্রীয় প্রশ্নব্যাংক ও স্মার্ট এক্সাম জেনারেটর
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#d1fae5', maxWidth: '640px', lineHeight: 1.5 }}>
              বোর্ড স্ট্যান্ডার্ড ১-ক্লিকে প্রশ্নপত্র প্রস্তুতকরণ, স্বয়ংক্রিয় OMR বাবল শিট জেনারেশন ও তাৎক্ষণিক মূল্যায়নকারী সফটওয়্যার মডিউল।
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#a7f3d0' }}>{toBn(questions.length)}</div>
              <div style={{ fontSize: '11px', color: '#ecfdf5', fontWeight: 600 }}>সংরক্ষিত প্রশ্ন</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fed7aa' }}>{toBn(savedPapers.length)}</div>
              <div style={{ fontSize: '11px', color: '#ecfdf5', fontWeight: 600 }}>তৈরিকৃত পেপার</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#93c5fd' }}>{toBn(omrResults.length)}</div>
              <div style={{ fontSize: '11px', color: '#ecfdf5', fontWeight: 600 }}>মূল্যায়িত OMR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '10px',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => switchTab('generator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 700,
            background: activeTab === 'generator' ? '#047857' : '#f1f5f9',
            color: activeTab === 'generator' ? '#fff' : '#475569',
            transition: 'all 0.15s ease'
          }}
        >
          <span>⚡</span>
          <span>১-ক্লিকে প্রশ্ন তৈরী</span>
        </button>

        <button
          onClick={() => switchTab('omr')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 700,
            background: activeTab === 'omr' ? '#047857' : '#f1f5f9',
            color: activeTab === 'omr' ? '#fff' : '#475569',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🎯</span>
          <span>OMR Evaluator ও শিট</span>
        </button>

        <button
          onClick={() => switchTab('bank')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 700,
            background: activeTab === 'bank' ? '#047857' : '#f1f5f9',
            color: activeTab === 'bank' ? '#fff' : '#475569',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📚</span>
          <span>অধ্যায়ভিত্তিক প্রশ্নভাণ্ডার</span>
        </button>

        <button
          onClick={() => switchTab('saved')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 700,
            background: activeTab === 'saved' ? '#047857' : '#f1f5f9',
            color: activeTab === 'saved' ? '#fff' : '#475569',
            transition: 'all 0.15s ease'
          }}
        >
          <span>💾</span>
          <span>সংরক্ষিত প্রশ্নপত্র ({toBn(savedPapers.length)})</span>
        </button>

        <button
          onClick={() => switchTab('model')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 700,
            background: activeTab === 'model' ? '#047857' : '#f1f5f9',
            color: activeTab === 'model' ? '#fff' : '#475569',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🏆</span>
          <span>বোর্ড মডেল প্রশ্নপত্র</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 1-CLICK GENERATOR                                  */}
      {/* ========================================================= */}
      {activeTab === 'generator' && (
        <div>
          {/* Generator Control Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  ⚡ ১-ক্লিকে স্বয়ংক্রিয় প্রশ্নপত্র জেনারেটর
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  শ্রেণি ও বিষয় নির্বাচন করুন; জাতীয় কারিকুলাম ও বোর্ড প্যাটার্ন অনুযায়ী পূর্ণাঙ্গ প্রশ্নপত্র নিমেষেই তৈরি হবে।
                </p>
              </div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '14px', fontSize: '11.5px', fontWeight: 700 }}>
                জাতীয় শিক্ষাক্রম ও বোর্ড প্রশ্ন মানসম্মত
              </span>
            </div>

            {/* Parameter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিদ্যালয়ের নাম:</label>
                <input
                  type="text"
                  value={genSchoolName}
                  onChange={e => setGenSchoolName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>পরীক্ষার নাম:</label>
                <input
                  type="text"
                  value={genExamName}
                  onChange={e => setGenExamName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>শ্রেণি:</label>
                <select
                  value={genClass}
                  onChange={e => {
                    setGenClass(e.target.value);
                    setGenSelectedChapters([]);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="6">৬ষ্ঠ শ্রেণি</option>
                  <option value="7">৭ম শ্রেণি</option>
                  <option value="8">৮ম শ্রেণি</option>
                  <option value="9">৯ম শ্রেণি</option>
                  <option value="10">১০ম শ্রেণি (SSC পরীক্ষার্থী)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিষয়:</label>
                <select
                  value={genSubjectId}
                  onChange={e => {
                    setGenSubjectId(e.target.value);
                    setGenSelectedChapters([]);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (কোড: {s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>সময় বরাদ্দ:</label>
                <input
                  type="text"
                  value={genTimeAllowed}
                  onChange={e => setGenTimeAllowed(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>মোট পূর্ণমান:</label>
                <select
                  value={genTotalMarks}
                  onChange={e => setGenTotalMarks(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="100">১০০ নম্বর (বোর্ড পূর্ণাঙ্গ)</option>
                  <option value="75">৭৫ নম্বর (ব্যবহারিক বিষয়)</option>
                  <option value="50">৫০ নম্বর (আইসিটি/অর্ধেক)</option>
                  <option value="25">২৫ নম্বর (শুধুমাত্র MCQ/মডেল)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>MCQ প্রশ্ন সংখ্যা:</label>
                <select
                  value={genMcqCount}
                  onChange={e => setGenMcqCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="30">৩০ টি (৩০ নম্বর)</option>
                  <option value="25">২৫ টি (২৫ নম্বর - স্ট্যান্ডার্ড)</option>
                  <option value="20">২০ টি (২০ নম্বর)</option>
                  <option value="15">১৫ টি (১৫ নম্বর)</option>
                  <option value="0">কোনো MCQ থাকবে না</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>সৃজনশীল (CQ) সংখ্যা:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={genCqCount}
                    onChange={e => setGenCqCount(Number(e.target.value))}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="11">১১ টি উদ্দীপক</option>
                    <option value="8">৮ টি উদ্দীপক (স্ট্যান্ডার্ড)</option>
                    <option value="6">৬ টি উদ্দীপক</option>
                    <option value="4">৪ টি উদ্দীপক</option>
                    <option value="0">কোনো CQ থাকবে না</option>
                  </select>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>থেকে {toBn(genCqToAnswer)}টির উত্তর</span>
                </div>
              </div>
            </div>

            {/* Chapters Selection Box */}
            {availableChapters.length > 0 && (
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                    📖 অধ্যায়ভিত্তিক ফিল্টার (সিলেক্ট না করলে স্বয়ংক্রিয়ভাবে পূর্ণাঙ্গ সিলেবাস থেকে প্রশ্ন নির্বাচন হবে):
                  </label>
                  <button
                    type="button"
                    onClick={() => setGenSelectedChapters(genSelectedChapters.length === availableChapters.length ? [] : [...availableChapters])}
                    style={{ background: 'none', border: 'none', color: '#047857', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {genSelectedChapters.length === availableChapters.length ? 'সব আনচেক করুন' : 'সব অধ্যায় নির্বাচন করুন'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                  {availableChapters.map((ch, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={genSelectedChapters.includes(ch)}
                        onChange={(e) => {
                          if (e.target.checked) setGenSelectedChapters([...genSelectedChapters, ch]);
                          else setGenSelectedChapters(genSelectedChapters.filter(c => c !== ch));
                        }}
                      />
                      <span>{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={handleGeneratePaper}
                disabled={isGenerating}
                style={{
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: isGenerating ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>⚡</span>
                <span>{isGenerating ? 'প্রশ্নপত্র প্রস্তুত হচ্ছে...' : '১ ক্লিকে প্রশ্ন তৈরী করুন'}</span>
              </button>
            </div>
          </div>

          {/* Paper Preview Section */}
          {activePaper ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>
              {/* Paper Top Toolbar */}
              <div style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📄</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    প্রস্তুতকৃত প্রশ্নপত্র: {activePaper.subjectName} ({activePaper.className === '10' ? '১০ম' : activePaper.className === '9' ? '৯ম' : activePaper.className === '8' ? '৮ম' : activePaper.className === '7' ? '৭ম' : '৬ষ্ঠ'} শ্রেণি)
                  </span>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                    পূর্ণমান: {toBn(activePaper.totalMarks)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowAnswerSheet(!showAnswerSheet)}
                    style={{
                      background: showAnswerSheet ? '#e0e7ff' : '#f1f5f9',
                      color: showAnswerSheet ? '#4338ca' : '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {showAnswerSheet ? '🙈 উত্তরমালা লুকান' : '👁️ উত্তরমালা ও সমাধান দেখুন'}
                  </button>

                  <button
                    onClick={handleReshufflePaper}
                    style={{
                      background: '#f8fafc',
                      color: '#0f766e',
                      border: '1px solid #0f766e',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🔄 প্রশ্ন রিসাফল
                  </button>

                  <button
                    onClick={handleSaveActivePaper}
                    style={{
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    💾 আর্কাইভে সংরক্ষণ
                  </button>

                  <button
                    onClick={() => handleLoadKeyFromPaper(activePaper)}
                    style={{
                      background: '#9333ea',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🎯 OMR মূল্যায়ন শুরু
                  </button>

                  <button
                    onClick={() => handlePrint('paper-printable-area')}
                    style={{
                      background: '#047857',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🖨️</span>
                    <span>প্রশ্নপত্র প্রিন্ট / PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Question Paper Canvas */}
              <div id="paper-printable-area" style={{ padding: '36px 44px', background: '#fff', color: '#000', fontFamily: "'Hind Siliguri', 'Inter', sans-serif" }}>
                
                {/* Official Board Standard School Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px double #000', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '4px' }}>
                    <img src={schoolLogo} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    <div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '0.2px' }}>
                        {activePaper.schoolName}
                      </h2>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#333' }}>
                        ডাকঘর: মাগড়া, উপজেলা: টাঙ্গাইল সদর, জেলা: টাঙ্গাইল | EIIN: ১১৪২৯০ | স্থাপিত: ১৯৪৬ খ্রি.
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '6px' }}>
                    {activePaper.examName}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                    শ্রেণি: {activePaper.className === '10' ? '১০ম' : activePaper.className === '9' ? '৯ম' : activePaper.className === '8' ? '৮ম' : activePaper.className === '7' ? '৭ম' : '৬ষ্ঠ'} • বিষয়: {activePaper.subjectName} (বিষয় কোড: {toBn(activePaper.subjectCode)})
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12.5px', fontWeight: 700, borderTop: '1px solid #ccc', paddingTop: '6px' }}>
                    <span>সময়: {activePaper.timeAllowed}</span>
                    <span>পূর্ণমান: {toBn(activePaper.totalMarks)}</span>
                  </div>
                </div>

                {/* Section A: MCQ */}
                {activePaper.mcqs && activePaper.mcqs.length > 0 && (
                  <div style={{ marginBottom: '26px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f1f5f9',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      marginBottom: '14px',
                      border: '1px solid #cbd5e1'
                    }}>
                      <b style={{ fontSize: '13.5px' }}>‘ক’ বিভাগ — বহুনির্বাচনী অভীক্ষা (মান: {toBn(activePaper.mcqs.length)})</b>
                      <span style={{ fontSize: '12px' }}>[বিশেষ দ্রষ্টব্য: সরবরাহকৃত OMR শিটে সঠিক উত্তরের বৃত্তটি কালো বলপয়েন্ট কলম দ্বারা ভরাট কর। সকল প্রশ্নের মান সমান।]</span>
                    </div>

                    {/* 2-Column Print Layout for MCQ */}
                    <div className="print-cols-2" style={{ columnCount: 2, columnGap: '30px' }}>
                      {activePaper.mcqs.map((q, idx) => (
                        <div key={q.id || idx} className="question-item" style={{ breakInside: 'avoid', marginBottom: '14px', fontSize: '13px' }}>
                          <div style={{ fontWeight: 700, marginBottom: '4px', lineHeight: 1.4 }}>
                            {toBn(idx + 1)}. {q.question_bn}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px', fontSize: '12px', paddingLeft: '8px' }}>
                            {q.options && q.options.map((opt, optIdx) => (
                              <div key={optIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                <span style={{ fontWeight: 700 }}>({['ক', 'খ', 'গ', 'ঘ'][optIdx]})</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section B: Creative Questions (CQ) */}
                {activePaper.cqs && activePaper.cqs.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f1f5f9',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      marginBottom: '14px',
                      border: '1px solid #cbd5e1'
                    }}>
                      <b style={{ fontSize: '13.5px' }}>‘খ’ বিভাগ — সৃজনশীল প্রশ্ন (পূর্ণমান: {toBn((activePaper.cqToAnswer || activePaper.cqs.length) * 10)})</b>
                      <span style={{ fontSize: '12px' }}>[যেকোনো {toBn(activePaper.cqToAnswer || activePaper.cqs.length)}টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১০]</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {activePaper.cqs.map((cq, idx) => (
                        <div key={cq.id || idx} className="question-item" style={{ breakInside: 'avoid', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '4px' }}>
                            {toBn(idx + 1)} নম্বর প্রশ্ন:
                          </div>
                          
                          {/* Stimulus Box */}
                          <div className="stimulus-box" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '4px', marginBottom: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                            {cq.stimulus}
                          </div>

                          {/* Sub Questions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                            {cq.sub_questions && cq.sub_questions.map((sub, sIdx) => (
                              <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px' }}>
                                <div>
                                  <b style={{ marginRight: '6px' }}>({sub.label})</b>
                                  <span>{sub.text}</span>
                                </div>
                                <b style={{ paddingLeft: '12px', whiteSpace: 'nowrap' }}>[{toBn(sub.marks)}]</b>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Key (Only visible when toggled) */}
                {showAnswerSheet && (
                  <div style={{ marginTop: '36px', borderTop: '2px solid #047857', paddingTop: '18px' }}>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#065f46' }}>
                        🔑 শিক্ষক মূল্যায়ন নির্দেশিকা ও MCQ উত্তর সংকেত (Answer Key)
                      </h3>
                    </div>

                    {/* Quick Answer Key Matrix */}
                    <div style={{ marginBottom: '16px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>প্রশ্ন</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>উত্তর</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>প্রশ্ন</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>উত্তর</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>প্রশ্ন</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>উত্তর</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>প্রশ্ন</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '5px' }}>উত্তর</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: Math.ceil(activePaper.mcqs.length / 4) }).map((_, rIdx) => (
                            <tr key={rIdx}>
                              {[0, 1, 2, 3].map(colIdx => {
                                const qIdx = rIdx * 4 + colIdx;
                                const q = activePaper.mcqs[qIdx];
                                if (!q) return <React.Fragment key={colIdx}><td style={{ border: '1px solid #cbd5e1' }}>—</td><td style={{ border: '1px solid #cbd5e1' }}>—</td></React.Fragment>;
                                return (
                                  <React.Fragment key={colIdx}>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 700 }}>{toBn(qIdx + 1)}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#047857', fontWeight: 800 }}>
                                      {['ক', 'খ', 'গ', 'ঘ'][q.correct_index !== undefined ? q.correct_index : 0]}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '14px',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>📝</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: '#334155' }}>
                কোনো প্রশ্নপত্র এখনো জেনারেট করা হয়নি
              </h3>
              <p style={{ margin: 0, fontSize: '13px', maxWidth: '480px', marginInline: 'auto' }}>
                উপরের ফর্ম থেকে শ্রেণি, বিষয় এবং পূর্ণমান নির্বাচন করে <b>“১ ক্লিকে প্রশ্ন তৈরী করুন”</b> বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে পূর্ণাঙ্গ প্রশ্নপত্র তৈরি হবে।
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: OMR EVALUATOR & BUBBLE SHEET                       */}
      {/* ========================================================= */}
      {activeTab === 'omr' && (
        <div>
          {/* OMR Sub Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              onClick={() => setOmrMode('evaluator')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                background: omrMode === 'evaluator' ? '#047857' : '#f1f5f9',
                color: omrMode === 'evaluator' ? '#fff' : '#475569'
              }}
            >
              ⚡ ডিজিটাল OMR কুইক মূল্যায়নকারী
            </button>

            <button
              onClick={() => setOmrMode('sheet')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                background: omrMode === 'sheet' ? '#047857' : '#f1f5f9',
                color: omrMode === 'sheet' ? '#fff' : '#475569'
              }}
            >
              🖨️ প্রিন্টযোগ্য OMR বাবল শিট জেনারেটর
            </button>

            <button
              onClick={() => setOmrMode('records')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                background: omrMode === 'records' ? '#047857' : '#f1f5f9',
                color: omrMode === 'records' ? '#fff' : '#475569'
              }}
            >
              📊 মূল্যায়িত ফলাফল ও মেধা তালিকা ({toBn(omrResults.length)})
            </button>
          </div>

          {/* OMR Evaluator Mode */}
          {omrMode === 'evaluator' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'flex-start' }}>
              
              {/* Left Column: Interactive Bubble Sheet Entry */}
              <div style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      🎯 শিক্ষার্থীর বাবল নির্বাচন ও স্বয়ংক্রিয় মার্কিং
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      শিক্ষার্থীর খাতার বৃত্তগুলো ক্লিক করুন; তাৎক্ষণিক সঠিক/ভুল চিহ্নিত হয়ে ফলাফল হিসাব হবে।
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setStudentAnswers(Array(omrQuestionCount).fill(null))}
                      style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      সব ক্লিয়ার
                    </button>
                  </div>
                </div>

                {/* Student Info Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>শিক্ষার্থীর রোল নম্বর:</label>
                    <input
                      type="text"
                      placeholder="যেমন: ১০১"
                      value={omrStudentRoll}
                      onChange={e => setOmrStudentRoll(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>শিক্ষার্থীর নাম:</label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={omrStudentName}
                      onChange={e => setOmrStudentName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>সেট কোড:</label>
                    <select
                      value={omrSetCode}
                      onChange={e => setOmrSetCode(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="ক">সেট - ক</option>
                      <option value="খ">সেট - খ</option>
                      <option value="গ">সেট - গ</option>
                      <option value="ঘ">সেট - ঘ</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Questions Bubble Rows */}
                <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {Array.from({ length: omrQuestionCount }).map((_, idx) => {
                      const studentAns = studentAnswers[idx];
                      const correctAns = answerKey[idx];
                      const isAnswered = studentAns !== null && studentAns !== undefined;
                      const isCorrect = isAnswered && studentAns === correctAns;

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: !isAnswered ? '#fff' : isCorrect ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${!isAnswered ? '#e2e8f0' : isCorrect ? '#86efac' : '#fca5a5'}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, width: '22px' }}>{toBn(idx + 1)}.</span>
                            {isAnswered && (
                              <span style={{ fontSize: '11px' }}>{isCorrect ? '✅' : '❌'}</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['ক', 'খ', 'গ', 'ঘ'].map((optLabel, optIdx) => {
                              const isSelected = studentAns === optIdx;
                              const isThisCorrect = correctAns === optIdx;

                              let bg = '#fff';
                              let color = '#334155';
                              let border = '1px solid #94a3b8';

                              if (isSelected) {
                                if (isCorrect) {
                                  bg = '#16a34a';
                                  color = '#fff';
                                  border = '1px solid #15803d';
                                } else {
                                  bg = '#dc2626';
                                  color = '#fff';
                                  border = '1px solid #b91c1c';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => {
                                    const next = [...studentAnswers];
                                    next[idx] = isSelected ? null : optIdx;
                                    setStudentAnswers(next);
                                  }}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border,
                                    background: bg,
                                    color,
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                  }}
                                  title={`প্রশ্ন ${toBn(idx+1)}: ${optLabel}`}
                                >
                                  {optLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Config & Live Result Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Live Result Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                  color: '#fff',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 8px 20px -4px rgba(4, 120, 87, 0.3)'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    OMR Live Evaluation Result
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>
                      {toBn(evaluationStats.score)} <span style={{ fontSize: '14px', fontWeight: 600, color: '#d1fae5' }}>/ {toBn(evaluationStats.total)}</span>
                    </h3>
                    <div style={{ background: evaluationStats.isPass ? '#10b981' : '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                      গ্রেড: {evaluationStats.grade} ({evaluationStats.gpa})
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#86efac' }}>{toBn(evaluationStats.correct)}</div>
                      <div style={{ fontSize: '10.5px', color: '#d1fae5' }}>সঠিক উত্তর</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#fca5a5' }}>{toBn(evaluationStats.wrong)}</div>
                      <div style={{ fontSize: '10.5px', color: '#d1fae5' }}>ভুল উত্তর</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#fed7aa' }}>{toBn(evaluationStats.unattempted)}</div>
                      <div style={{ fontSize: '10.5px', color: '#d1fae5' }}>অনুত্তরিত</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveEvaluation}
                    style={{
                      width: '100%',
                      background: '#fff',
                      color: '#047857',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    💾 মূল্যায়ন সংরক্ষণ করুন
                  </button>
                </div>

                {/* Answer Key (সঠিক উত্তরের সেট) Config */}
                <div style={{
                  background: '#fff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      🔑 মাস্টার অ্যান্সার-কী (সঠিক উত্তর সেট)
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>সেট: {omrSetCode}</span>
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                      {Array.from({ length: omrQuestionCount }).map((_, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{toBn(idx + 1)}.</span>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {['ক', 'খ', 'গ', 'ঘ'].map((optLabel, optIdx) => (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  const next = [...answerKey];
                                  next[idx] = optIdx;
                                  setAnswerKey(next);
                                }}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  border: answerKey[idx] === optIdx ? '1px solid #047857' : '1px solid #cbd5e1',
                                  background: answerKey[idx] === optIdx ? '#047857' : '#fff',
                                  color: answerKey[idx] === optIdx ? '#fff' : '#475569',
                                  fontSize: '9.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0
                                }}
                              >
                                {optLabel}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OMR Printable Sheet Generator Mode */}
          {omrMode === 'sheet' && (
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    🖨️ প্রিন্টযোগ্য OMR বাবল শিট (A4 সাইজ রেডি)
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                    বোর্ড স্ট্যান্ডার্ড ওএমআর শিট যা সরাসরি প্রিন্ট বা ফটোকপি করে শিক্ষার্থীদের পরীক্ষায় ব্যবহার করা যাবে।
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={omrQuestionCount}
                    onChange={e => setOmrQuestionCount(Number(e.target.value))}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', fontWeight: 600 }}
                  >
                    <option value="25">২৫ প্রশ্ন ওএমআর শিট</option>
                    <option value="30">৩০ প্রশ্ন ওএমআর শিট</option>
                    <option value="50">৫০ প্রশ্ন ওএমআর শিট</option>
                  </select>

                  <button
                    onClick={() => handlePrint('printable-omr-sheet')}
                    style={{
                      background: '#047857',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🖨️</span>
                    <span>OMR শিট প্রিন্ট করুন</span>
                  </button>
                </div>
              </div>

              {/* Printable Canvas */}
              <div id="printable-omr-sheet" style={{ maxWidth: '780px', margin: '0 auto', border: '2px solid #000', padding: '20px 24px', background: '#fff', color: '#000', fontFamily: "'Hind Siliguri', 'Inter', sans-serif" }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <img src={schoolLogo} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়</h2>
                      <p style={{ margin: 0, fontSize: '11px' }}>টাঙ্গাইল সদর, টাঙ্গাইল | EIIN: ১১৪২৯০ | ওএমআর উত্তরপত্র (OMR Answer Sheet)</p>
                    </div>
                  </div>
                </div>

                {/* Student Info & Top Bubbles Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr', gap: '12px', border: '1px solid #000', padding: '10px', marginBottom: '14px', borderRadius: '4px' }}>
                  
                  {/* Name & Class info */}
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ marginBottom: '6px' }}><b>শিক্ষার্থীর নাম:</b> ___________________________</div>
                    <div style={{ marginBottom: '6px' }}><b>শ্রেণি:</b> [৬ষ্ঠ] [৭ম] [৮ম] [৯ম] [১০ম]</div>
                    <div style={{ marginBottom: '6px' }}><b>শাখা:</b> _______ <b>বিষয়:</b> _________________</div>
                    <div><b>তারিখ:</b> _____/_____/২০২___ খ্রি.</div>
                  </div>

                  {/* Roll No Bubble Grid */}
                  <div style={{ borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', padding: '0 8px' }}>
                    <b style={{ fontSize: '11px', display: 'block', textAlign: 'center', marginBottom: '4px' }}>রোল নম্বর (Roll No)</b>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {[1, 2, 3, 4].map(col => (
                        <div key={col} style={{ textAlign: 'center' }}>
                          <div style={{ width: '18px', height: '18px', border: '1px solid #000', marginBottom: '3px', fontSize: '10px' }}></div>
                          {Array.from({ length: 10 }).map((_, d) => (
                            <div key={d} className="bubble-circ" style={{ display: 'flex', width: '14px', height: '14px', border: '1px solid #000', borderRadius: '50%', margin: '2px auto', fontSize: '8px', alignItems: 'center', justifyContent: 'center' }}>
                              {d}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Set Code Bubbles */}
                  <div style={{ textAlign: 'center' }}>
                    <b style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>প্রশ্ন সেট কোড</b>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                      {['ক', 'খ', 'গ', 'ঘ'].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{s}</span>
                          <div className="bubble-circ" style={{ display: 'inline-flex', width: '16px', height: '16px', border: '1.5px solid #000', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                            {s}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: '10.5px', marginBottom: '14px', borderRadius: '4px' }}>
                  <b>নির্দেশনাবলি:</b> ১. কালো বলপয়েন্ট কলম দ্বারা সঠিক উত্তরের বৃত্তটি সম্পূর্ণ ভরাট করতে হবে। ২. কোনো অবস্থাতেই বৃত্তের বাইরে দাগ দেওয়া বা কাটাকাটি করা যাবে না। ৩. প্রতি প্রশ্নের জন্য কেবল একটি বৃত্ত ভরাট করতে হবে।
                </div>

                {/* OMR Questions Answer Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: omrQuestionCount > 25 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '10px' }}>
                  {Array.from({ length: omrQuestionCount }).map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #94a3b8', padding: '3px 8px', borderRadius: '3px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 'bold', width: '22px' }}>{toBn(idx + 1)}.</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['ক', 'খ', 'গ', 'ঘ'].map((opt, oIdx) => (
                          <div key={oIdx} className="bubble-circ" style={{ display: 'inline-flex', width: '16px', height: '16px', border: '1.5px solid #000', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #ccc', fontSize: '11px' }}>
                  <div>পরীক্ষার্থীর স্বাক্ষর: _______________________</div>
                  <div>কক্ষ পরিদর্শকের স্বাক্ষর: _______________________</div>
                </div>
              </div>
            </div>
          )}

          {/* OMR Records & Merit List Mode */}
          {omrMode === 'records' && (
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    📊 ওএমআর মূল্যায়ন ফলাফল ও মেধা রেজিস্টার
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                    মূল্যায়িত সকল শিক্ষার্থীর রোল, নম্বর, সঠিক/ভুল অনুপাত ও মেরিট পজিশন।
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePrint('omr-records-table')}
                    style={{ background: '#047857', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🖨️ রেজাল্ট শিট প্রিন্ট
                  </button>
                </div>
              </div>

              {omrResults.length > 0 ? (
                <div id="omr-records-table" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>
                        <th style={{ padding: '10px 12px' }}>মেধা</th>
                        <th style={{ padding: '10px 12px' }}>রোল</th>
                        <th style={{ padding: '10px 12px' }}>শিক্ষার্থীর নাম</th>
                        <th style={{ padding: '10px 12px' }}>পরীক্ষা</th>
                        <th style={{ padding: '10px 12px' }}>সেট</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>সঠিক</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>ভুল</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>প্রাপ্ত নম্বর</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>গ্রেড</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...omrResults]
                        .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                        .map((r, idx) => (
                          <tr key={r.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 800, color: idx < 3 ? '#b45309' : '#475569' }}>
                              {idx === 0 ? '🥇 ১' : idx === 1 ? '🥈 ২' : idx === 2 ? '🥉 ৩' : toBn(idx + 1)}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{toBn(r.student_roll)}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.student_name}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>{r.exam_title || '—'}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                {r.set_code || 'ক'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{toBn(r.correct_count)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{toBn(r.wrong_count)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontSize: '14px', color: '#047857' }}>
                              {toBn(r.score)} / {toBn(r.total_questions)}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span style={{
                                background: r.grade === 'A+' ? '#dcfce7' : r.grade === 'F' ? '#fee2e2' : '#f1f5f9',
                                color: r.grade === 'A+' ? '#166534' : r.grade === 'F' ? '#991b1b' : '#334155',
                                padding: '3px 8px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800
                              }}>
                                {r.grade}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                              <button
                                onClick={() => {
                                  if (window.confirm('এই ফলাফলটি মুছে ফেলতে চান?')) {
                                    const updated = deleteOmrEvaluation(r.id);
                                    setOmrResults(updated);
                                    showToast('OMR রেকর্ড মুছে ফেলা হয়েছে।');
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px' }}
                                title="মুছে ফেলুন"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  কোনো OMR মূল্যায়ন রেকর্ড পাওয়া যায়নি। “ডিজিটাল OMR কুইক মূল্যায়নকারী” থেকে পরীক্ষা মূল্যায়ন করে সংরক্ষণ করুন।
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CHAPTER-WISE QUESTION REPOSITORY                   */}
      {/* ========================================================= */}
      {activeTab === 'bank' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px 24px' }}>
          
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                📚 অধ্যায়ভিত্তিক কেন্দ্রীয় প্রশ্নভাণ্ডার ({toBn(filteredQuestions.length)} টি প্রশ্ন)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                ৬ষ্ঠ থেকে ১০ম শ্রেণির সকল বিষয়ের বহুনির্বাচনী ও সৃজনশীল প্রশ্ন সংগ্রহ এবং নতুন প্রশ্ন সংযোজন।
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: '#047857',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span>
              <span>নতুন প্রশ্ন যোগ করুন</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>শ্রেণি ফিল্টার:</label>
              <select
                value={bankClass}
                onChange={e => setBankClass(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
              >
                <option value="all">সকল শ্রেণি (৬ষ্ঠ - ১০ম)</option>
                <option value="6">৬ষ্ঠ শ্রেণি</option>
                <option value="7">৭ম শ্রেণি</option>
                <option value="8">৮ম শ্রেণি</option>
                <option value="9">৯ম শ্রেণি</option>
                <option value="10">১০ম শ্রেণি</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>বিষয় ফিল্টার:</label>
              <select
                value={bankSubject}
                onChange={e => setBankSubject(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
              >
                <option value="all">সকল বিষয়</option>
                {SUBJECT_METADATA.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>প্রশ্নের ধরন:</label>
              <select
                value={bankType}
                onChange={e => setBankType(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
              >
                <option value="all">সব ধরন (MCQ + CQ)</option>
                <option value="mcq">বহুনির্বাচনী (MCQ)</option>
                <option value="cq">সৃজনশীল (CQ)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>অনুসন্ধান:</label>
              <input
                type="text"
                placeholder="প্রশ্ন বা অধ্যায় খুঁজুন..."
                value={bankSearch}
                onChange={e => setBankSearch(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              />
            </div>
          </div>

          {/* Questions Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{
                        background: q.question_type === 'mcq' ? '#e0f2fe' : '#fef3c7',
                        color: q.question_type === 'mcq' ? '#0369a1' : '#b45309',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {q.question_type === 'mcq' ? 'MCQ' : 'CQ (সৃজনশীল)'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                        {toBn(q.class_name)}ম শ্রেণি • {q.subject_name || q.subject_id}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
                      title="প্রশ্ন মুছে ফেলুন"
                    >
                      🗑️
                    </button>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700, marginBottom: '6px' }}>
                    🏷️ {q.chapter || 'পাঠ্যবইয়ের অধ্যায়'}
                  </div>

                  {q.question_type === 'mcq' ? (
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.45 }}>
                        {q.question_bn}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        {q.options && q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            style={{
                              color: q.correct_index === oIdx ? '#166534' : '#475569',
                              fontWeight: q.correct_index === oIdx ? 800 : 400
                            }}
                          >
                            ({['ক', 'খ', 'গ', 'ঘ'][oIdx]}) {opt} {q.correct_index === oIdx && '✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: '#334155', marginBottom: '8px', lineHeight: 1.45 }}>
                        <b>উদ্দীপক:</b> {q.stimulus}
                      </div>
                      <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {q.sub_questions && q.sub_questions.map((sub, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><b>({sub.label})</b> {sub.text}</span>
                            <b>[{toBn(sub.marks)}]</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {q.explanation && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                    💡 <b>ব্যাখ্যা:</b> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              নির্বাচিত ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি। অন্য শ্রেণি বা বিষয় নির্বাচন করুন অথবা নতুন প্রশ্ন যোগ করুন।
            </div>
          )}

          {/* Add Question Modal */}
          {isAddModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '620px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    ➕ প্রশ্নভাণ্ডারে নতুন প্রশ্ন যোগ করুন
                  </h3>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddNewQuestion}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>শ্রেণি:</label>
                      <select
                        value={newQForm.class_name}
                        onChange={e => setNewQForm({ ...newQForm, class_name: e.target.value })}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      >
                        <option value="6">৬ষ্ঠ শ্রেণি</option>
                        <option value="7">৭ম শ্রেণি</option>
                        <option value="8">৮ম শ্রেণি</option>
                        <option value="9">৯ম শ্রেণি</option>
                        <option value="10">১০ম শ্রেণি</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>বিষয়:</label>
                      <select
                        value={newQForm.subject_id}
                        onChange={e => setNewQForm({ ...newQForm, subject_id: e.target.value })}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      >
                        {SUBJECT_METADATA.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>প্রশ্নের ধরন:</label>
                      <select
                        value={newQForm.question_type}
                        onChange={e => setNewQForm({ ...newQForm, question_type: e.target.value })}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      >
                        <option value="mcq">বহুনির্বাচনী (MCQ)</option>
                        <option value="cq">সৃজনশীল (CQ)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>অধ্যায়ের নাম:</label>
                    <input
                      type="text"
                      placeholder="যেমন: ১ম অধ্যায়: গতি"
                      value={newQForm.chapter}
                      onChange={e => setNewQForm({ ...newQForm, chapter: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                  </div>

                  {newQForm.question_type === 'mcq' ? (
                    <>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>MCQ প্রশ্ন (বাংলায়):</label>
                        <textarea
                          rows={2}
                          placeholder="প্রশ্নের বর্ণনা লিখুন..."
                          value={newQForm.question_bn}
                          onChange={e => setNewQForm({ ...newQForm, question_bn: e.target.value })}
                          required
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        {['ক', 'খ', 'গ', 'ঘ'].map((optLabel, idx) => (
                          <div key={idx}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>বিকল্প ({optLabel}):</label>
                            <input
                              type="text"
                              value={newQForm.options[idx]}
                              onChange={e => {
                                const nextOpts = [...newQForm.options];
                                nextOpts[idx] = e.target.value;
                                setNewQForm({ ...newQForm, options: nextOpts });
                              }}
                              placeholder={`বিকল্প ${optLabel}`}
                              required
                              style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                            />
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>সঠিক উত্তর নির্বাচন করুন:</label>
                        <select
                          value={newQForm.correct_index}
                          onChange={e => setNewQForm({ ...newQForm, correct_index: Number(e.target.value) })}
                          style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                        >
                          <option value={0}>বিকল্প (ক) সঠিক</option>
                          <option value={1}>বিকল্প (খ) সঠিক</option>
                          <option value={2}>বিকল্প (গ) সঠিক</option>
                          <option value={3}>বিকল্প (ঘ) সঠিক</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>উদ্দীপক (Stimulus):</label>
                        <textarea
                          rows={3}
                          placeholder="সৃজনশীল উদ্দীপক বা দৃশ্যপট লিখুন..."
                          value={newQForm.stimulus}
                          onChange={e => setNewQForm({ ...newQForm, stimulus: e.target.value })}
                          required
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          placeholder="(ক) জ্ঞানমূলক প্রশ্ন (১ নম্বর)"
                          value={newQForm.sub_q_a}
                          onChange={e => setNewQForm({ ...newQForm, sub_q_a: e.target.value })}
                          style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          placeholder="(খ) অনুধাবনমূলক প্রশ্ন (২ নম্বর)"
                          value={newQForm.sub_q_b}
                          onChange={e => setNewQForm({ ...newQForm, sub_q_b: e.target.value })}
                          style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          placeholder="(গ) প্রয়োগমূলক প্রশ্ন (৩ নম্বর)"
                          value={newQForm.sub_q_c}
                          onChange={e => setNewQForm({ ...newQForm, sub_q_c: e.target.value })}
                          style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          placeholder="(ঘ) উচ্চতর দক্ষতামূলক প্রশ্ন (৪ নম্বর)"
                          value={newQForm.sub_q_d}
                          onChange={e => setNewQForm({ ...newQForm, sub_q_d: e.target.value })}
                          style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>উত্তর সংকেত / ব্যাখ্যা (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      placeholder="ব্যাখ্যা বা সূত্র..."
                      value={newQForm.explanation}
                      onChange={e => setNewQForm({ ...newQForm, explanation: e.target.value })}
                      style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', cursor: 'pointer' }}
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      প্রশ্ন সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SAVED EXAM PAPERS ARCHIVE                          */}
      {/* ========================================================= */}
      {activeTab === 'saved' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                💾 সংরক্ষিত প্রশ্নপত্র আর্কাইভ ({toBn(savedPapers.length)} টি পেপার)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                পূর্বে প্রস্তুতকৃত প্রশ্নপত্রসমূহ পুনঃনিরীক্ষণ, রি-প্রিন্ট বা সরাসরি ওএমআর মূল্যায়নে ব্যবহারের জন্য সংরক্ষিত।
              </p>
            </div>
          </div>

          {savedPapers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {savedPapers.map((paper, idx) => (
                <div
                  key={paper.id || idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        {paper.className === '10' ? '১০ম' : paper.className === '9' ? '৯ম' : paper.className === '8' ? '৮ম' : paper.className === '7' ? '৭ম' : '৬ষ্ঠ'} শ্রেণি
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(paper.saved_at || paper.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {paper.subjectName}
                    </h4>
                    <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                      {paper.title || paper.examName}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', color: '#64748b', marginBottom: '14px' }}>
                      <span>পূর্ণমান: <b>{toBn(paper.totalMarks)}</b></span>
                      <span>•</span>
                      <span>MCQ: <b>{toBn(paper.mcqs?.length || 0)}</b>টি</span>
                      <span>•</span>
                      <span>CQ: <b>{toBn(paper.cqs?.length || 0)}</b>টি</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <button
                      onClick={() => {
                        setActivePaper(paper);
                        switchTab('generator');
                        showToast(`প্রশ্নপত্র "${paper.subjectName}" ভিউয়ারে লোড করা হয়েছে!`);
                      }}
                      style={{ flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      👁️ ভিউ ও প্রিন্ট
                    </button>
                    <button
                      onClick={() => handleLoadKeyFromPaper(paper)}
                      style={{ background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      title="এই পেপারের OMR মূল্যায়ন করুন"
                    >
                      🎯 OMR
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('এই প্রশ্নপত্রটি আর্কাইভ থেকে মুছে ফেলতে চান?')) {
                          const updated = deleteExamPaper(paper.id);
                          setSavedPapers(updated);
                          showToast('প্রশ্নপত্র মুছে ফেলা হয়েছে।');
                        }
                      }}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      title="ডিলিট"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
              <p>আর্কাইভে কোনো সংরক্ষিত প্রশ্নপত্র নেই। “১-ক্লিকে প্রশ্ন তৈরী” থেকে প্রশ্নপত্র তৈরি করে <b>“আর্কাইভে সংরক্ষণ”</b> করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BOARD MODEL QUESTIONS                             */}
      {/* ========================================================= */}
      {activeTab === 'model' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px 24px' }}>
          <div style={{ marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🏆 জাতীয় বোর্ড স্ট্যান্ডার্ড রেডিমেড মডেল প্রশ্নপত্র
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              ঢাকা ও ময়মনসিংহের বিগত বোর্ড পরীক্ষার আলোকে প্রস্তুতকৃত নমুনা প্রশ্নপত্র; এক ক্লিকে লোড ও প্রিন্ট করুন।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {[
              {
                title: 'SSC নির্বাচনী মডেল টেস্ট ২০২৬',
                className: '10',
                subjectId: 'physics',
                subjectName: 'পদার্থবিজ্ঞান',
                code: '136',
                marks: 100,
                desc: 'গতি, বল, কাজ-শক্তি ও বিদ্যুৎ অধ্যায়ের সমন্বয়ে বোর্ড স্ট্যান্ডার্ড পূর্ণাঙ্গ মডেল পেপার।'
              },
              {
                title: '১০ম শ্রেণি রসায়ন মডেল টেস্ট',
                className: '10',
                subjectId: 'chemistry',
                subjectName: 'রসায়ন',
                code: '137',
                marks: 100,
                desc: 'পর্যায় সারণি, বন্ধন ও মোলের ধারণার ওপর ২৫টি MCQ এবং ৮টি সৃজনশীল প্রশ্ন।'
              },
              {
                title: '৮ম শ্রেণি সাধারণ বিজ্ঞান পূর্ণাঙ্গ মডেল টেস্ট',
                className: '8',
                subjectId: 'general_science',
                subjectName: 'সাধারণ বিজ্ঞান',
                code: '127',
                marks: 100,
                desc: 'প্রাণিজগতের শ্রেণিবিন্যাস ও রাসায়নিক বিক্রিয়ার সমন্বয়ে তৈরি চূড়ান্ত প্রস্তুতিমূলক পেপার।'
              },
              {
                title: '৯ম শ্রেণি তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
                className: '9',
                subjectId: 'ict',
                subjectName: 'তথ্য ও যোগাযোগ প্রযুক্তি',
                code: '154',
                marks: 50,
                desc: 'কম্পিউটার নেটওয়ার্ক, তথ্য নিরাপত্তা ও স্প্রেডশিট ব্যবহারের ওপর ২৫টি MCQ সংবলিত পেপার।'
              },
              {
                title: '১০ম শ্রেণি বাংলা ১ম পত্র বোর্ড মডেল টেস্ট',
                className: '10',
                subjectId: 'bangla1',
                subjectName: 'বাংলা ১ম পত্র',
                code: '101',
                marks: 100,
                desc: 'গদ্য ও পদ্যের সমন্বয়ে ৩০টি বহুনির্বাচনী ও ১১টি সৃজনশীল প্রশ্নপত্র।'
              }
            ].map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                      {toBn(m.className)}ম শ্রেণি
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>কোড: {toBn(m.code)}</span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {m.subjectName}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginBottom: '6px' }}>
                    {m.title}
                  </div>
                  <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>
                    {m.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const paper = generateQuestionPaper({
                      examName: m.title,
                      className: m.className,
                      subjectId: m.subjectId,
                      subjectName: m.subjectName,
                      subjectCode: m.code,
                      totalMarks: m.marks,
                      mcqCount: m.marks === 50 ? 25 : 25,
                      cqCount: m.marks === 50 ? 0 : 8,
                      cqToAnswer: m.marks === 50 ? 0 : 5
                    });
                    setActivePaper(paper);
                    switchTab('generator');
                    showToast(`মডেল পেপার "${m.subjectName}" প্রস্তুত হয়েছে!`);
                  }}
                  style={{
                    background: '#047857',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center'
                  }}
                >
                  ⚡ এই মডেল পেপার লোড ও প্রিন্ট করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default QuestionBankPanel;
