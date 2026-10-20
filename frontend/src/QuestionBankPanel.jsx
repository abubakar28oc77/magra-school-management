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
  saveBulkQuestions,
  deleteQuestionItem,
  getSavedExamPapers,
  saveExamPaperToArchive,
  deleteExamPaper,
  getOmrResults,
  saveOmrEvaluation,
  deleteOmrEvaluation,
  generateQuestionPaper,
  getSubjectMarksScheme,
  NCTB_SSC_EVALUATION_SPECS,
  NCTB_JUNIOR_EVALUATION_SPECS,
  getStoredChapters,
  saveCustomChapters,
  resetCustomChapters,
  getChapterQuestionCounts,
  generateRichChapterStock,
  seedChapterStock,
  createCustomExamPaper
} from './questionBankData';
import schoolLogo from '../public/school-logo.png';

// Utility for Bengali Digits
export const toBn = (n) => (n === null || n === undefined || n === '') ? '০' : String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// Intelligent Bengali Question Parser for Chapter-Wise Upload
export function parseBengaliQuestions(rawText, questionType, className, subjectId, subjectName, chapter) {
  if (!rawText || !rawText.trim()) return [];
  const text = rawText.trim();
  
  // 1. Direct JSON Array Support
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          ...item,
          id: item.id || `q-json-${Date.now()}-${idx}`,
          class_name: item.class_name || className,
          subject_id: item.subject_id || subjectId,
          subject_name: item.subject_name || subjectName,
          chapter: item.chapter || chapter,
          question_type: item.question_type || questionType
        }));
      }
    } catch (e) {
      console.warn('JSON parse error, falling back to text parsing', e);
    }
  }

  const results = [];

  if (questionType === 'mcq') {
    const rawBlocks = text.split(/(?:\r?\n){2,}|(?=^(?:\d+[\.\)]|প্রশ্ন\s*[:：\-]))/m).filter(b => b.trim().length > 0);
    for (const block of rawBlocks) {
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let qText = '';
      const options = [];
      let correctIndex = 0;
      let explanation = '';

      for (const line of lines) {
        // Detect Answer
        const ansMatch = line.match(/^(?:উত্তর|সঠিক|Ans(?:wer)?)\s*[:：\-]?\s*([কখগঘabcdABCD১-৪1-4])/i);
        if (ansMatch) {
          const char = ansMatch[1].toLowerCase();
          if (['ক', 'a', '১', '1'].includes(char)) correctIndex = 0;
          else if (['খ', 'b', '২', '2'].includes(char)) correctIndex = 1;
          else if (['গ', 'c', '৩', '3'].includes(char)) correctIndex = 2;
          else if (['ঘ', 'd', '৪', '4'].includes(char)) correctIndex = 3;
          continue;
        }

        // Detect Explanation
        const expMatch = line.match(/^(?:ব্যাখ্যা|সূত্র|Explanation|Note)\s*[:：\-]?\s*(.+)/i);
        if (expMatch) {
          explanation = expMatch[1].trim();
          continue;
        }

        // Detect inline options: (ক) ... (খ) ...
        const inlineOpts = [...line.matchAll(/(?:\(([কখগঘabcd])\)|([কখগঘabcd])[\)\.])\s*([^(\n\r]+)/gi)];
        if (inlineOpts.length >= 2) {
          for (const m of inlineOpts) {
            options.push(m[3].trim());
          }
          continue;
        }

        // Detect single option line
        const optMatch = line.match(/^(?:\(([কখগঘabcd])\)|([কখগঘabcd])[\)\.])\s*(.+)/i);
        if (optMatch) {
          options.push(optMatch[3].trim());
          continue;
        }

        // Question text
        if (!qText) {
          qText = line.replace(/^\d+[\.\)]\s*/, '').replace(/^(?:প্রশ্ন|Q(?:uestion)?)\s*[:：\-]?\s*/i, '');
        } else {
          qText += ' ' + line;
        }
      }

      if (qText && options.length >= 2) {
        while (options.length < 4) {
          options.push(`বিকল্প ${options.length + 1}`);
        }
        results.push({
          id: `q-mcq-${Date.now()}-${results.length}-${Math.random().toString(36).substr(2, 4)}`,
          class_name: className,
          subject_id: subjectId,
          subject_name: subjectName,
          chapter: chapter,
          question_type: 'mcq',
          question_bn: qText,
          options: options.slice(0, 4),
          correct_answer: options[correctIndex] || options[0],
          correct_index: correctIndex,
          marks: 1,
          explanation: explanation || 'পাঠ্যবইয়ের সংশ্লিষ্ট অধ্যায় অনুযায়ী সঠিক তথ্য।'
        });
      }
    }
  } else if (questionType === 'cq') {
    const rawBlocks = text.split(/---+|(?=^(?:উদ্দীপক|সৃজনশীল প্রশ্ন|\d+[\.\)]\s*উদ্দীপক))/im).filter(b => b.trim().length > 0);
    for (const block of rawBlocks) {
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let stimulus = '';
      const subQuestions = [];

      for (const line of lines) {
        const subMatch = line.match(/^(?:\(([কখগঘ])\)|([কখগঘ])[\)\.])\s*(.+)/i);
        if (subMatch) {
          const label = subMatch[1] || subMatch[2];
          let subText = subMatch[3].trim();
          let marks = (label === 'ক' ? 1 : label === 'খ' ? 2 : label === 'গ' ? 3 : 4);
          const marksMatch = subText.match(/\[([১-৪1-4])\]$/);
          if (marksMatch) {
            marks = Number(marksMatch[1].replace('১', 1).replace('২', 2).replace('৩', 3).replace('৪', 4));
            subText = subText.replace(/\[[১-৪1-4]\]$/, '').trim();
          }
          subQuestions.push({ label, text: subText, marks });
        } else {
          const stimLine = line.replace(/^(?:উদ্দীপক|সৃজনশীল প্রশ্ন|দৃশ্যপট|\d+[\.\)])\s*[:：\-]?\s*/i, '');
          if (!stimulus) stimulus = stimLine;
          else stimulus += ' ' + stimLine;
        }
      }

      if (stimulus && subQuestions.length > 0) {
        results.push({
          id: `q-cq-${Date.now()}-${results.length}-${Math.random().toString(36).substr(2, 4)}`,
          class_name: className,
          subject_id: subjectId,
          subject_name: subjectName,
          chapter: chapter,
          question_type: 'cq',
          stimulus: stimulus,
          sub_questions: subQuestions,
          marks: 10,
          explanation: 'ক) জ্ঞানমূলক ১ নম্বর। খ) অনুধাবন ২ নম্বর। গ) প্রয়োগ ৩ নম্বর। ঘ) উচ্চতর দক্ষতা ৪ নম্বর।'
        });
      }
    }
  } else {
    // Short questions
    const rawBlocks = text.split(/(?:\r?\n){2,}|---+/).filter(b => b.trim().length > 0);
    for (const block of rawBlocks) {
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let qText = '';
      let ansText = '';
      for (const line of lines) {
        const aMatch = line.match(/^(?:উত্তর|সমাধান|Ans(?:wer)?)\s*[:：\-]?\s*(.+)/i);
        if (aMatch) {
          ansText = aMatch[1].trim();
        } else {
          if (!qText) qText = line.replace(/^\d+[\.\)]\s*/, '').replace(/^(?:প্রশ্ন|সংক্ষিপ্ত প্রশ্ন)\s*[:：\-]?\s*/i, '');
          else qText += ' ' + line;
        }
      }
      if (qText) {
        results.push({
          id: `q-short-${Date.now()}-${results.length}-${Math.random().toString(36).substr(2, 4)}`,
          class_name: className,
          subject_id: subjectId,
          subject_name: subjectName,
          chapter: chapter,
          question_type: 'short',
          question_bn: qText,
          marks: 2,
          explanation: ansText || 'সংক্ষিপ্ত ও নির্ভুল তথ্যমূলক উত্তর।'
        });
      }
    }
  }

  return results;
}

const VALID_TABS = ['generator', 'custom_builder', 'bank', 'omr', 'saved', 'model'];

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
  const [genDepartment, setGenDepartment] = useState('সকল বিভাগ');
  const [genSubjectId, setGenSubjectId] = useState('bangla1');
  const [genSelectedChapters, setGenSelectedChapters] = useState([]);
  const [genTimeAllowed, setGenTimeAllowed] = useState('২ ঘণ্টা ৩০ মিনিট');
  const [genTotalMarks, setGenTotalMarks] = useState(100);
  const [genMcqCount, setGenMcqCount] = useState(30);
  const [genCqCount, setGenCqCount] = useState(8);
  const [genCqToAnswer, setGenCqToAnswer] = useState(5);
  const [genShortCount, setGenShortCount] = useState(0);
  const [genShortToAnswer, setGenShortToAnswer] = useState(0);
  const [genShortMarks, setGenShortMarks] = useState(0);
  const [genPracticalMarks, setGenPracticalMarks] = useState(0);
  const [genDifficulty, setGenDifficulty] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);

  // Current Generated / Active Paper
  const [activePaper, setActivePaper] = useState(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  // Chapter Customization & Editing State
  const [chaptersVersion, setChaptersVersion] = useState(0);
  const [isChapterEditorOpen, setIsChapterEditorOpen] = useState(false);
  const [editingChapters, setEditingChapters] = useState([]);

  // Bulk Question Uploader & Guide State
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkUploadTab, setBulkUploadTab] = useState('upload'); // 'upload' | 'guide'
  const [bulkClass, setBulkClass] = useState('8');
  const [bulkSubject, setBulkSubject] = useState('ict');
  const [bulkChapter, setBulkChapter] = useState('');
  const [bulkCustomChapter, setBulkCustomChapter] = useState('');
  const [bulkType, setBulkType] = useState('mcq'); // 'mcq' | 'cq' | 'short'
  const [bulkRawText, setBulkRawText] = useState('');
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState([]);

  // Check if Class 9/10 has department/grouping
  const isHighSchoolGrouped = ['9', '10'].includes(genClass);

  // Available subjects for the selected class and department
  const availableSubjects = useMemo(() => {
    return SUBJECT_METADATA.filter(s => {
      if (!s.classes.includes(genClass)) return false;
      if (!isHighSchoolGrouped) return true; // Class 6, 7, 8 are general
      if (!genDepartment || genDepartment === 'সকল বিভাগ') return true;
      return s.departments.includes(genDepartment);
    });
  }, [genClass, genDepartment, isHighSchoolGrouped]);

  // Sync subject if not available in current class/department filter
  useEffect(() => {
    if (!availableSubjects.find(s => s.id === genSubjectId) && availableSubjects.length > 0) {
      setGenSubjectId(availableSubjects[0].id);
    }
  }, [availableSubjects, genSubjectId]);

  // Current subject metadata
  const currentSubject = useMemo(() => {
    return SUBJECT_METADATA.find(s => s.id === genSubjectId) || availableSubjects[0] || SUBJECT_METADATA[0];
  }, [genSubjectId, availableSubjects]);

  // Auto-sync NCTB Marks Distribution when Subject or Class changes (using official SSC circular)
  useEffect(() => {
    if (currentSubject) {
      const scheme = getSubjectMarksScheme(currentSubject, genClass);
      if (scheme) {
        setGenTotalMarks(scheme.full_marks || 100);
        setGenMcqCount(scheme.mcq_max !== undefined ? scheme.mcq_max : 25);
        setGenCqCount(scheme.cq_count !== undefined ? scheme.cq_count : (scheme.written_max ? 8 : 0));
        setGenCqToAnswer(scheme.cq_to_answer !== undefined ? scheme.cq_to_answer : 5);
        setGenShortCount(scheme.short_count || 0);
        setGenShortToAnswer(scheme.short_to_answer || 0);
        setGenShortMarks(scheme.short_max || 0);
        setGenPracticalMarks(scheme.practical_max || 0);
        setGenTimeAllowed(scheme.time_allowed || '৩ ঘণ্টা');
      }
    }
  }, [currentSubject, genClass]);

  // -------------------------------------------------------------
  // Custom Exam Builder (Checkbox-based Question Selection) State
  // -------------------------------------------------------------
  const [customSchoolName, setCustomSchoolName] = useState('মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়');
  const [customExamType, setCustomExamType] = useState('half_yearly');
  const [customExamName, setCustomExamName] = useState('অর্ধবার্ষিক পরীক্ষা ২০২৬');
  const [customClass, setCustomClass] = useState('8');
  const [customDepartment, setCustomDepartment] = useState('সাধারণ');
  const [customSubjectId, setCustomSubjectId] = useState('ict');
  const [customSelectedChapters, setCustomSelectedChapters] = useState([]);
  const [customTimeAllowed, setCustomTimeAllowed] = useState('১ ঘণ্টা ৩০ মিনিট');
  const [customTotalMarks, setCustomTotalMarks] = useState(25);
  const [customMcqCount, setCustomMcqCount] = useState(15);
  const [customCqCount, setCustomCqCount] = useState(0);
  const [customCqToAnswer, setCustomCqToAnswer] = useState(0);
  const [customShortCount, setCustomShortCount] = useState(8);
  const [customShortToAnswer, setCustomShortToAnswer] = useState(5);
  const [customPracticalMarks, setCustomPracticalMarks] = useState(0);
  const [customInstructions, setCustomInstructions] = useState('বোর্ড মডেল অনুযায়ী পূর্ণাঙ্গ উত্তর প্রদান কর।');
  const [customSelectedQuestionIds, setCustomSelectedQuestionIds] = useState(new Set());
  const [customFilterType, setCustomFilterType] = useState('all'); // all, cq, mcq, short
  const [customSearch, setCustomSearch] = useState('');

  // Check if Class 9/10 has department/grouping for custom builder
  const isCustomHighSchoolGrouped = ['9', '10'].includes(customClass);

  // Available subjects for custom builder
  const customAvailableSubjects = useMemo(() => {
    return SUBJECT_METADATA.filter(s => {
      if (!s.classes.includes(customClass)) return false;
      if (!isCustomHighSchoolGrouped) return true; // Class 6, 7, 8 are general
      if (!customDepartment || customDepartment === 'সকল বিভাগ') return true;
      return s.departments.includes(customDepartment);
    });
  }, [customClass, customDepartment, isCustomHighSchoolGrouped]);

  // Sync subject if not available in current custom class/department filter
  useEffect(() => {
    if (!customAvailableSubjects.find(s => s.id === customSubjectId) && customAvailableSubjects.length > 0) {
      setCustomSubjectId(customAvailableSubjects[0].id);
    }
  }, [customAvailableSubjects, customSubjectId]);

  // Current custom subject metadata and NCTB evaluation scheme
  const customCurrentSubject = useMemo(() => {
    return SUBJECT_METADATA.find(s => s.id === customSubjectId) || customAvailableSubjects[0] || SUBJECT_METADATA[0];
  }, [customSubjectId, customAvailableSubjects]);

  const customScheme = useMemo(() => {
    return getSubjectMarksScheme(customCurrentSubject, customClass) || customCurrentSubject?.marks_scheme;
  }, [customCurrentSubject, customClass]);

  // Auto-sync NCTB Marks Distribution when Custom Subject or Class changes
  useEffect(() => {
    if (customCurrentSubject) {
      const scheme = getSubjectMarksScheme(customCurrentSubject, customClass);
      if (scheme) {
        const isJuniorIct = scheme.pattern === 'nctb_junior_ict';
        const isSscIct = scheme.pattern === 'nctb_ssc_ict';
        const paperTotal = isJuniorIct ? 25 : (isSscIct ? 25 : (scheme.full_marks || 100));

        setCustomTotalMarks(paperTotal);
        setCustomTimeAllowed(scheme.time_allowed || '৩ ঘণ্টা');
        setCustomMcqCount(scheme.mcq_max !== undefined ? scheme.mcq_max : 25);
        setCustomCqCount(scheme.cq_count !== undefined ? scheme.cq_count : (scheme.written_max ? 8 : 0));
        setCustomCqToAnswer(scheme.cq_to_answer !== undefined ? scheme.cq_to_answer : (scheme.written_max ? 5 : 0));
        setCustomShortCount(scheme.short_count || 0);
        setCustomShortToAnswer(scheme.short_to_answer || 0);
        setCustomPracticalMarks(0);
      }
    }
  }, [customCurrentSubject, customClass]);

  const handleCustomExamTypeChange = (type) => {
    setCustomExamType(type);
    const isJuniorIct = customScheme?.pattern === 'nctb_junior_ict';
    const isSscIct = customScheme?.pattern === 'nctb_ssc_ict';
    const defaultPaperMarks = (isJuniorIct || isSscIct) ? 25 : (customScheme?.full_marks || 100);

    if (type === 'weekly') {
      setCustomExamName('সাপ্তাহিক মূল্যায়ন পরীক্ষা ২০২৬');
      setCustomTimeAllowed('৪০ মিনিট');
      setCustomTotalMarks(isJuniorIct ? 15 : 25);
      setCustomInstructions('সময় ও পূর্ণমান অনুসারে সকল প্রশ্নের উত্তর দাও।');
    } else if (type === 'monthly') {
      setCustomExamName('মাসিক মূল্যায়ন পরীক্ষা ২০২৬');
      setCustomTimeAllowed('১ ঘণ্টা');
      setCustomTotalMarks(isJuniorIct ? 20 : 40);
      setCustomInstructions('সৃজনশীল ও বহুনির্বাচনি অংশ হতে নির্ধারিত প্রশ্নের উত্তর দাও।');
    } else if (type === 'chapter') {
      setCustomExamName('অধ্যায় ভিত্তিক ক্লাস টেস্ট ২০২৬');
      setCustomTimeAllowed('৪৫ মিনিট');
      setCustomTotalMarks(isJuniorIct ? 15 : 25);
      setCustomInstructions('নির্ধারিত অধ্যায়ের ওপর প্রস্তুতকৃত প্রশ্নের সঠিক উত্তর দাও।');
    } else if (type === 'half_yearly') {
      setCustomExamName('অর্ধ-বার্ষিক পরীক্ষা ২০২৬');
      setCustomTimeAllowed(customScheme?.time_allowed || '১ ঘণ্টা ৩০ মিনিট');
      setCustomTotalMarks(defaultPaperMarks);
      setCustomInstructions('বোর্ড মডেল অনুযায়ী পূর্ণাঙ্গ উত্তর প্রদান কর।');
    } else if (type === 'pre_test') {
      setCustomExamName('প্রাক-নির্বাচনি পরীক্ষা ২০২৬');
      setCustomTimeAllowed(customScheme?.time_allowed || '৩ ঘণ্টা');
      setCustomTotalMarks(defaultPaperMarks);
      setCustomInstructions('বোর্ড নীতিমালা অনুসারে প্রতিটি বিভাগের প্রশ্নের উত্তর দাও।');
    } else if (type === 'test') {
      setCustomExamName('নির্বাচনি পরীক্ষা ২০২৬');
      setCustomTimeAllowed(customScheme?.time_allowed || '৩ ঘণ্টা');
      setCustomTotalMarks(defaultPaperMarks);
      setCustomInstructions('বোর্ড মডেল অনুযায়ী পূর্ণাঙ্গ উত্তর প্রদান কর।');
    } else if (type === 'annual') {
      setCustomExamName('বার্ষিক পরীক্ষা ২০২৬');
      setCustomTimeAllowed(customScheme?.time_allowed || '৩ ঘণ্টা');
      setCustomTotalMarks(defaultPaperMarks);
      setCustomInstructions('সিলেবাস অনুযায়ী সকল বিভাগের প্রশ্নের যথাযথ উত্তর দাও।');
    } else {
      setCustomExamName('বিশেষ মূল্যায়ন পরীক্ষা ২০২৬');
      setCustomTimeAllowed('১ ঘণ্টা ৩০ মিনিট');
      setCustomTotalMarks(defaultPaperMarks);
      setCustomInstructions('');
    }
  };

  const customAvailableChapters = useMemo(() => {
    return getStoredChapters(customSubjectId, customClass);
  }, [customSubjectId, customClass, chaptersVersion]);

  // Questions matching custom builder class, subject, chapter, type, and search
  const customVisibleQuestions = useMemo(() => {
    return questions.filter(q => {
      if (String(q.class_name) !== String(customClass)) return false;
      if (q.subject_id !== customSubjectId) return false;
      if (customSelectedChapters.length > 0 && !customSelectedChapters.includes(q.chapter)) return false;
      if (customFilterType !== 'all' && q.question_type !== customFilterType) return false;
      if (customSearch.trim()) {
        const txt = customSearch.toLowerCase();
        const matchQ = (q.question_bn || '').toLowerCase().includes(txt);
        const matchStimulus = (q.stimulus || '').toLowerCase().includes(txt);
        const matchChapter = (q.chapter || '').toLowerCase().includes(txt);
        if (!matchQ && !matchStimulus && !matchChapter) return false;
      }
      return true;
    });
  }, [questions, customClass, customSubjectId, customSelectedChapters, customFilterType, customSearch]);

  const toggleCustomQuestion = (id) => {
    setCustomSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisibleCustom = (list) => {
    setCustomSelectedQuestionIds(prev => {
      const next = new Set(prev);
      list.forEach(q => next.add(q.id));
      return next;
    });
  };

  const deselectAllCustom = () => {
    setCustomSelectedQuestionIds(new Set());
  };

  // Selected questions objects
  const selectedQuestionsList = useMemo(() => {
    return questions.filter(q => customSelectedQuestionIds.has(q.id));
  }, [questions, customSelectedQuestionIds]);

  // Selection statistics (accounting for optional questions: answer X out of Y)
  const customStats = useMemo(() => {
    const cqs = selectedQuestionsList.filter(q => q.question_type === 'cq');
    const mcqs = selectedQuestionsList.filter(q => q.question_type === 'mcq');
    const shorts = selectedQuestionsList.filter(q => q.question_type === 'short');
    const descriptives = selectedQuestionsList.filter(q => q.question_type === 'descriptive');

    const effectiveCqToAnswer = customCqToAnswer > 0 
      ? Math.min(customCqToAnswer, cqs.length) 
      : cqs.length;

    const effectiveShortToAnswer = customShortToAnswer > 0 
      ? Math.min(customShortToAnswer, shorts.length) 
      : shorts.length;

    const mcqMarks = mcqs.length * 1;
    const shortMarks = effectiveShortToAnswer * 2;
    const cqMarks = effectiveCqToAnswer * 10;
    const descMarks = descriptives.reduce((acc, q) => acc + (q.marks || 10), 0);

    const totalSelectedMarks = cqMarks + mcqMarks + shortMarks + descMarks;

    return {
      cqCount: cqs.length,
      cqToAnswer: effectiveCqToAnswer,
      cqMarks,
      mcqCount: mcqs.length,
      mcqMarks,
      shortCount: shorts.length,
      shortToAnswer: effectiveShortToAnswer,
      shortMarks,
      descriptiveCount: descriptives.length,
      descriptiveMarks: descMarks,
      totalCount: selectedQuestionsList.length,
      totalSelectedMarks,
      difference: totalSelectedMarks - Number(customTotalMarks)
    };
  }, [selectedQuestionsList, customTotalMarks, customCqToAnswer, customShortToAnswer]);

  const handleGenerateCustomPaper = () => {
    if (selectedQuestionsList.length === 0) {
      alert('দয়া করে পরীক্ষার জন্য অন্তত একটি প্রশ্ন নির্বাচন করুন।');
      return;
    }
    const subMeta = SUBJECT_METADATA.find(s => s.id === customSubjectId);
    const paper = createCustomExamPaper({
      schoolName: customSchoolName || genSchoolName || 'মাগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়',
      examType: customExamType,
      examName: customExamName,
      className: customClass,
      department: customDepartment,
      subjectId: customSubjectId,
      subjectName: subMeta ? subMeta.name : customSubjectId,
      subjectCode: subMeta ? subMeta.code : 101,
      timeAllowed: customTimeAllowed,
      totalMarks: Number(customTotalMarks) || customStats.totalSelectedMarks,
      instructions: customInstructions,
      cqCount: customCqCount,
      cqToAnswer: customCqToAnswer,
      shortCount: customShortCount,
      shortToAnswer: customShortToAnswer,
      practicalMarks: customPracticalMarks,
      selectedQuestions: selectedQuestionsList
    });

    setActivePaper(paper);
    switchTab('generator');
    showToast(`অভিনন্দন! ${customExamName} প্রশ্নপত্র সফলভাবে প্রস্তুত হয়েছে।`);
    setTimeout(() => {
      const el = document.getElementById('generated-paper-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Available chapters for selected subject & class (customized from localStorage or NCTB defaults)
  const availableChapters = useMemo(() => {
    return getStoredChapters(genSubjectId, genClass);
  }, [genSubjectId, genClass, chaptersVersion]);

  // Chapter Editor Handlers
  const handleOpenChapterEditor = () => {
    const currentList = getStoredChapters(genSubjectId, genClass);
    setEditingChapters([...currentList]);
    setIsChapterEditorOpen(true);
  };

  // Bulk Upload Handlers
  const handleOpenBulkUpload = (subjectId = genSubjectId || 'ict', className = genClass || '8', chapterName = '') => {
    setBulkSubject(subjectId);
    setBulkClass(className);
    const chList = getStoredChapters(subjectId, className);
    setBulkChapter(chapterName || (chList[0] || ''));
    setBulkCustomChapter('');
    setBulkType('mcq');
    setParsedBulkQuestions([]);
    setBulkRawText(`১. তথ্য ও যোগাযোগ প্রযুক্তির মূল চালিকাশক্তি কোনটি?
(ক) রেডিও
(খ) টেলিভিশন
(গ) কম্পিউটার ও ইন্টারনেট
(ঘ) ক্যামেরা
উত্তর: গ
ব্যাখ্যা: কম্পিউটার ও ইন্টারনেট নেটওয়ার্কিং আধুনিক তথ্যপ্রযুক্তির কেন্দ্রীয় উপকরণ।

২. নিচের কোনটি আধুনিক ইনপুট ডিভাইস?
ক) ওএমআর ও কিবোর্ড
খ) মনিটর ও স্পিকার
গ) প্রিন্টার ও প্রজেক্টর
ঘ) হেডফোন
উত্তর: ক
ব্যাখ্যা: ওএমআর ও কিবোর্ড ডেটা ইনপুট করার কাজে ব্যবহৃত হয়।`);
    setBulkUploadTab('upload');
    setIsBulkUploadOpen(true);
  };

  const handleLoadSampleText = (type = bulkType) => {
    if (type === 'mcq') {
      setBulkRawText(`১. তথ্য ও যোগাযোগ প্রযুক্তির মূল চালিকাশক্তি কোনটি?
(ক) রেডিও
(খ) টেলিভিশন
(গ) কম্পিউটার ও ইন্টারনেট
(ঘ) ক্যামেরা
উত্তর: গ
ব্যাখ্যা: কম্পিউটার ও ইন্টারনেট নেটওয়ার্কিং আধুনিক তথ্যপ্রযুক্তির কেন্দ্রীয় উপকরণ।

২. নিচের কোনটি আধুনিক ইনপুট ডিভাইস?
ক) ওএমআর ও কিবোর্ড
খ) মনিটর ও স্পিকার
গ) প্রিন্টার ও প্রজেক্টর
ঘ) হেডফোন
উত্তর: ক
ব্যাখ্যা: ওএমআর ও কিবোর্ড ডেটা ইনপুট করার কাজে ব্যবহৃত হয়।`);
    } else if (type === 'cq') {
      setBulkRawText(`উদ্দীপক: কৃষক জয়নাল মিয়া মাটির স্বাস্থ্য সুরক্ষায় উপজেলা কৃষি কর্মকর্তার পরামর্শে দোআঁশ মাটিতে ইউরিয়া ও সবুজ সার প্রয়োগ করলেন। ফলে অল্প খরচে তার ফলন দ্বিগুণ হলো।
ক) মাটির pH কী? [১]
খ) জৈব সারকে মাটির প্রাণ বলা হয় কেন? [২]
গ) জয়নাল মিয়ার সবুজ সার তৈরির বৈজ্ঞানিক উপায় ব্যাখ্যা কর। [৩]
ঘ) টেকসই ফসল উৎপাদনে জয়নাল মিয়ার গৃহীত পদক্ষেপের কার্যকারিতা মূল্যায়ন কর। [৪]`);
    } else {
      setBulkRawText(`১. তথ্য ও যোগাযোগ প্রযুক্তি (ICT) বলতে কী বোঝায়?
উত্তর: তথ্য সংগ্রহ, সংরক্ষণ, প্রক্রিয়াকরণ এবং আদান-প্রদানের জন্য ব্যবহৃত ডিজিটাল প্রযুক্তিই হলো তথ্য ও যোগাযোগ প্রযুক্তি।

২. হার্ডওয়্যার ও সফটওয়্যার-এর প্রধান পার্থক্য কী?
উত্তর: কম্পিউটারের বাহ্যিক দৃশ্যমান যন্ত্রাংশ হলো হার্ডওয়্যার এবং কম্পিউটার পরিচালনার প্রোগ্রাম বা নির্দেশাবলি হলো সফটওয়্যার।`);
    }
  };

  const handleParseQuestions = () => {
    const effectiveSubject = SUBJECT_METADATA.find(s => s.id === bulkSubject) || { name: bulkSubject };
    const effectiveChapter = (bulkChapter === '__custom__' || !bulkChapter) ? (bulkCustomChapter.trim() || 'নির্ধারিত অধ্যায়') : bulkChapter;
    const list = parseBengaliQuestions(bulkRawText, bulkType, bulkClass, bulkSubject, effectiveSubject.name, effectiveChapter);
    setParsedBulkQuestions(list);
    if (list.length > 0) {
      showToast(`${toBn(list.length)}টি প্রশ্ন সফলভাবে পার্স ও সনাক্ত হয়েছে!`);
    } else {
      showToast('কোনো প্রশ্ন সনাক্ত করা যায়নি। অনুগ্রহ করে লেখার ফরম্যাট পরীক্ষা করুন।');
    }
  };

  const handleSaveBulkUploadedQuestions = () => {
    if (parsedBulkQuestions.length === 0) {
      showToast('সংরক্ষণ করার মতো কোনো পার্সকৃত প্রশ্ন পাওয়া যায়নি।');
      return;
    }
    const updated = saveBulkQuestions(parsedBulkQuestions);
    setQuestions(updated);
    showToast(`${toBn(parsedBulkQuestions.length)}টি প্রশ্ন অধ্যায়ভাণ্ডারে সফলভাবে সংরক্ষিত হয়েছে!`);
    setIsBulkUploadOpen(false);
    setParsedBulkQuestions([]);
  };

  const handleDownloadSampleJson = () => {
    const sample = [
      {
        question_type: bulkType,
        class_name: bulkClass,
        subject_id: bulkSubject,
        subject_name: (SUBJECT_METADATA.find(s => s.id === bulkSubject)?.name) || "বিষয়",
        chapter: bulkChapter || "১ম অধ্যায়",
        question_bn: "নমুনা বহুনির্বাচনি প্রশ্ন?",
        options: ["বিকল্প ক", "বিকল্প খ", "বিকল্প গ", "বিকল্প ঘ"],
        correct_answer: "বিকল্প ক",
        correct_index: 0,
        marks: 1,
        explanation: "সঠিক উত্তরের ব্যাখ্যা..."
      }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magra_question_template_${bulkSubject}_class${bulkClass}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('নমুনা JSON ফাইল ডাউনলোড হয়েছে!');
  };

  // Handle 1-Click Generation with NCTB Blueprint
  const handleGeneratePaper = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const effectiveDept = !isHighSchoolGrouped 
          ? 'সাধারণ' 
          : (genDepartment !== 'সকল বিভাগ' ? genDepartment : (currentSubject.departments[0] || 'আবশ্যিক'));

        const scheme = getSubjectMarksScheme(currentSubject, genClass);

        const paper = generateQuestionPaper({
          schoolName: genSchoolName,
          examName: genExamName,
          className: genClass,
          department: effectiveDept,
          subjectId: currentSubject.id,
          subjectName: currentSubject.name,
          subjectCode: currentSubject.code,
          selectedChapters: genSelectedChapters,
          timeAllowed: genTimeAllowed,
          totalMarks: Number(genTotalMarks),
          mcqCount: Number(genMcqCount),
          cqCount: Number(genCqCount),
          cqToAnswer: Number(genCqToAnswer),
          shortCount: Number(genShortCount),
          shortToAnswer: Number(genShortToAnswer),
          shortMarks: Number(genShortMarks),
          practicalMarks: Number(genPracticalMarks),
          pattern: scheme?.pattern || currentSubject.marks_scheme?.pattern || 'cq_mcq',
          cqRule: scheme?.cq_rule,
          shortRule: scheme?.short_rule,
          mcqRule: scheme?.mcq_rule,
          practicalRule: scheme?.practical_rule,
          descriptiveRule: scheme?.descriptive_rule,
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
    } else if (newQForm.question_type === 'short') {
      item = {
        id: 'user-short-' + Date.now().toString(36),
        class_name: newQForm.class_name,
        subject_id: newQForm.subject_id,
        subject_name: subName,
        chapter: newQForm.chapter || 'সংশ্লিষ্ট অধ্যায়',
        question_type: 'short',
        question_bn: newQForm.question_bn,
        correct_answer: newQForm.sub_q_a || newQForm.explanation || 'সংক্ষিপ্ত উত্তর।',
        explanation: newQForm.explanation || newQForm.sub_q_a || '',
        marks: Number(newQForm.marks) || 2
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
          onClick={() => switchTab('custom_builder')}
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
            background: activeTab === 'custom_builder' ? '#047857' : '#f1f5f9',
            color: activeTab === 'custom_builder' ? '#fff' : '#475569',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📝</span>
          <span>টিক দিয়ে প্রশ্ন নির্বাচন (কাস্টম পরীক্ষা)</span>
          {customStats.totalCount > 0 && (
            <span style={{
              background: activeTab === 'custom_builder' ? '#ecfdf5' : '#047857',
              color: activeTab === 'custom_builder' ? '#047857' : '#fff',
              fontSize: '11px',
              padding: '1px 7px',
              borderRadius: '10px',
              fontWeight: 800
            }}>
              {toBn(customStats.totalCount)}
            </span>
          )}
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
                    const c = e.target.value;
                    setGenClass(c);
                    setGenSelectedChapters([]);
                    if (['6', '7', '8'].includes(c)) {
                      setGenDepartment('সাধারণ');
                    } else if (genDepartment === 'সাধারণ') {
                      setGenDepartment('সকল বিভাগ');
                    }
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিভাগ (Department / Group):</label>
                <select
                  value={genDepartment}
                  disabled={!isHighSchoolGrouped}
                  onChange={e => {
                    setGenDepartment(e.target.value);
                    setGenSelectedChapters([]);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: isHighSchoolGrouped ? '#fff' : '#f1f5f9',
                    color: isHighSchoolGrouped ? '#0f172a' : '#64748b',
                    cursor: isHighSchoolGrouped ? 'pointer' : 'not-allowed'
                  }}
                >
                  {!isHighSchoolGrouped ? (
                    <option value="সাধারণ">সাধারণ (৬ষ্ঠ–৮ম শ্রেণিতে বিভাগ বিভাজন প্রযোজ্য নয়)</option>
                  ) : (
                    <>
                      <option value="সকল বিভাগ">সকল বিভাগ (আবশ্যিক + সকল গ্রুপ)</option>
                      <option value="আবশ্যিক">আবশ্যিক বিষয়সমূহ (বাংলা, ইংরেজি, গণিত, আইসিটি, ধর্ম)</option>
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (পদার্থ, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত)</option>
                      <option value="মানবিক">মানবিক বিভাগ (ইতিহাস, ভূগোল, পৌরনীতি, অর্থনীতি, বিজ্ঞান)</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা (হিসাববিজ্ঞান, উদ্যোগ, ফিন্যান্স, বিজ্ঞান)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিষয় নির্বাচন (এনসিটিবি কারিকুলাম):</label>
                <select
                  value={genSubjectId}
                  onChange={e => {
                    setGenSubjectId(e.target.value);
                    setGenSelectedChapters([]);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (কোড: {s.code}) {isHighSchoolGrouped && s.departments.length > 0 ? `[${s.departments[0]}]` : ''}
                    </option>
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
                <input
                  type="number"
                  value={genTotalMarks}
                  onChange={e => setGenTotalMarks(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>MCQ প্রশ্ন সংখ্যা:</label>
                <input
                  type="number"
                  value={genMcqCount}
                  onChange={e => setGenMcqCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>সৃজনশীল (CQ) উদ্দীপক সংখ্যা:</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={genCqCount}
                    onChange={e => setGenCqCount(Number(e.target.value))}
                    style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>থেকে উত্তর:</span>
                  <input
                    type="number"
                    value={genCqToAnswer}
                    onChange={e => setGenCqToAnswer(Number(e.target.value))}
                    style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Short Questions Input (NCTB SSC Standard: 2 marks each) */}
              {(genShortCount > 0 || ['9', '10'].includes(genClass)) && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    সংক্ষিপ্ত-উত্তর প্রশ্ন (প্রতিটি ২ নম্বর):
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={genShortCount}
                      onChange={e => setGenShortCount(Number(e.target.value))}
                      style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>থেকে উত্তর:</span>
                    <input
                      type="number"
                      value={genShortToAnswer}
                      onChange={e => setGenShortToAnswer(Number(e.target.value))}
                      style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>
                      ({toBn(genShortToAnswer * 2)} নম্বর)
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>ব্যবহারিক / বিশেষ অংশ মান:</label>
                <input
                  type="number"
                  value={genPracticalMarks}
                  onChange={e => setGenPracticalMarks(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* NCTB Official Marks Blueprint Card */}
            {currentSubject && (() => {
              const currentScheme = getSubjectMarksScheme(currentSubject, genClass) || currentSubject.marks_scheme;
              if (!currentScheme) return null;
              return (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🏛️</span>
                      <b style={{ fontSize: '14px', color: '#065f46' }}>
                        জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) বিষয়ভিত্তিক মূল্যায়ন নির্দেশনা ও নম্বর বিভাজন
                      </b>
                    </div>
                    <span style={{ background: '#047857', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                      বিষয় কোড: {toBn(currentSubject.code)} | {['9', '10'].includes(genClass) ? `${toBn(genClass)}ম শ্রেণি (এসএসসি পরিপত্র অনুযায়ী)` : `${toBn(genClass)}ম শ্রেণি (৬ষ্ঠ–৮ম কাঠামো অনুযায়ী)`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>পূর্ণমান</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#047857' }}>{toBn(currentScheme.full_marks)} নম্বর</div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>সৃজনশীল / লিখিত</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
                        {currentScheme.written_max > 0 ? (
                          `${toBn(currentScheme.written_max)} নম্বর (${toBn(currentScheme.cq_count)}টি হতে ${toBn(currentScheme.cq_to_answer)}টি)`
                        ) : 'লিখিত নেই'}
                      </div>
                    </div>

                    {currentScheme.short_max > 0 && (
                      <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>সংক্ষিপ্ত-উত্তর প্রশ্ন</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f766e' }}>
                          {toBn(currentScheme.short_max)} নম্বর ({toBn(currentScheme.short_count)}টি হতে {toBn(currentScheme.short_to_answer)}টি)
                        </div>
                      </div>
                    )}

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>বহুনির্বাচনী (MCQ)</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#d97706' }}>
                        {currentScheme.mcq_max > 0 ? `${toBn(currentScheme.mcq_max)} নম্বর (${toBn(currentScheme.mcq_max)}টি প্রশ্ন)` : 'MCQ নেই'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ব্যবহারিক / বিশেষ অংশ</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#7c3aed' }}>
                        {currentScheme.practical_max > 0 ? `${toBn(currentScheme.practical_max)} নম্বর (ল্যাব)` : currentScheme.descriptive_max > 0 ? `${toBn(currentScheme.descriptive_max)} নম্বর (বর্ণনামূলক)` : currentScheme.financial_max > 0 ? `${toBn(currentScheme.financial_max)} নম্বর (আর্থিক বিবরণী)` : 'নেই'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>বরাদ্দকৃত সময়</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>{currentScheme.time_allowed}</div>
                    </div>
                  </div>

                  {/* Section & Exam Directives */}
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#065f46', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed #a7f3d0', paddingTop: '8px' }}>
                    {currentScheme.cq_rule && (
                      <div>📌 <b>সৃজনশীল নির্দেশিকা:</b> {currentScheme.cq_rule}</div>
                    )}
                    {currentScheme.short_rule && (
                      <div>✏️ <b>সংক্ষিপ্ত-উত্তর নির্দেশিকা:</b> {currentScheme.short_rule}</div>
                    )}
                    {currentScheme.descriptive_rule && (
                      <div>📖 <b>বর্ণনামূলক অংশ নির্দেশিকা:</b> {currentScheme.descriptive_rule}</div>
                    )}
                    {currentScheme.practical_rule && (
                      <div>🔬 <b>ব্যবহারিক নির্দেশিকা:</b> {currentScheme.practical_rule}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#047857' }}>
                      <span>🎯 পাস নম্বর বণ্টন: লিখিত {toBn(currentScheme.written_pass || 0)} | MCQ {toBn(currentScheme.mcq_pass || 0)} | ব্যবহারিক {toBn(currentScheme.practical_pass || (currentScheme.practical_max ? 8 : 0))} (পরীক্ষা ও ফলাফল অংশের সাথে হুবহু সামঞ্জস্যপূর্ণ)</span>
                      <span style={{ fontWeight: 700 }}>প্যাটার্ন: {currentScheme.pattern || 'বোর্ড স্ট্যান্ডার্ড'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Chapters Selection Box (Customizable Chapter Number & Name) */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📖</span>
                  <span>অধ্যায়ভিত্তিক ফিল্টার (সিলেক্ট না করলে স্বয়ংক্রিয়ভাবে পূর্ণাঙ্গ সিলেবাস থেকে প্রশ্ন নির্বাচন হবে):</span>
                </label>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Edit Chapters Button */}
                  <button
                    type="button"
                    onClick={handleOpenChapterEditor}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#047857',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    title="এই শ্রেণির এই বিষয়ের অধ্যায় নং ও নাম পরিবর্তন/যোগ/মুছে ফেলুন"
                  >
                    <span>✏️</span>
                    <span>অধ্যায় নং ও নাম এডিট করুন</span>
                  </button>

                  {/* Upload Questions for Chapter Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenBulkUpload(genSubjectId, genClass, genSelectedChapters[0] || (availableChapters[0] || ''))}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    title="এই বিষয়ের অধ্যায়ে নতুন প্রশ্ন আপলোড করুন"
                  >
                    <span>📥</span>
                    <span>অধ্যায়ে প্রশ্ন আপলোড</span>
                  </button>

                  {/* Select All Toggle */}
                  {availableChapters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setGenSelectedChapters(genSelectedChapters.length === availableChapters.length ? [] : [...availableChapters])}
                      style={{ background: 'none', border: 'none', color: '#047857', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {genSelectedChapters.length === availableChapters.length ? 'সব আনচেক করুন' : 'সব অধ্যায় নির্বাচন করুন'}
                    </button>
                  )}
                </div>
              </div>

              {availableChapters.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                  {availableChapters.map((ch, idx) => {
                    const isSelected = genSelectedChapters.includes(ch);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          color: '#334155',
                          cursor: 'pointer',
                          background: isSelected ? '#ecfdf5' : '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #10b981' : '1px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setGenSelectedChapters([...genSelectedChapters, ch]);
                            else setGenSelectedChapters(genSelectedChapters.filter(c => c !== ch));
                          }}
                        />
                        <span style={{ fontWeight: isSelected ? 700 : 500 }}>{ch}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12.5px', background: '#fff', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                  এই বিষয়ের জন্য এখনো কোনো অধ্যায় সেট করা নেই। 
                  <button
                    type="button"
                    onClick={handleOpenChapterEditor}
                    style={{ background: 'none', border: 'none', color: '#047857', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', marginLeft: '6px' }}
                  >
                    এখানে ক্লিক করে অধ্যায় যোগ ও এডিট করুন
                  </button>
                </div>
              )}
            </div>

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
            <div id="generated-paper-preview" style={{
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
                    শ্রেণি: {activePaper.className === '10' ? '১০ম' : activePaper.className === '9' ? '৯ম' : activePaper.className === '8' ? '৮ম' : activePaper.className === '7' ? '৭ম' : '৬ষ্ঠ'}
                    {activePaper.department && activePaper.department !== 'সাধারণ' ? ` • বিভাগ: ${activePaper.department}` : ''}
                    • বিষয়: {activePaper.subjectName} (বিষয় কোড: {toBn(activePaper.subjectCode)})
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12.5px', fontWeight: 700, borderTop: '1px solid #ccc', paddingTop: '6px' }}>
                    <span>সময়: {activePaper.timeAllowed}</span>
                    <span>পূর্ণমান: {toBn(activePaper.totalMarks)}</span>
                  </div>
                  {activePaper.subjectId === 'ict' && ['6', '7', '8'].includes(String(activePaper.className)) && (
                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12.5px', fontWeight: 800, color: '#047857' }}>
                      [তত্ত্বীয় অংশের জন্য ২৫ নম্বর এবং ব্যবহারিক অংশের জন্য ২৫ নম্বর বরাদ্দ আছে]
                    </div>
                  )}
                  {(activePaper.subjectId === 'agriculture' || activePaper.subjectId === 'home_science') && ['6', '7', '8'].includes(String(activePaper.className)) && (
                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12.5px', fontWeight: 800, color: '#047857' }}>
                      [সৃজনশীল প্রশ্নের জন্য ৩০ নম্বর এবং বহুনির্বাচনি প্রশ্নের জন্য ২০ নম্বর বরাদ্দ আছে। প্রতিটি সৃজনশীল প্রশ্নের নম্বর ১০ এবং প্রতিটি বহুনির্বাচনি প্রশ্নের নম্বর ১]
                    </div>
                  )}
                  {activePaper.subjectId === 'physical_edu' && (
                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12.5px', fontWeight: 800, color: '#047857' }}>
                      [বিদ্যালয়ভিত্তিক ধারাবাহিক মূল্যায়ন — পূর্ণমান: ৫০ নম্বর]
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* 1. ENGLISH FIRST PAPER SPECIAL LAYOUT                     */}
                {/* ========================================================= */}
                {activePaper.subjectId === 'english1' && activePaper.english1Paper ? (
                  <div>
                    {/* Part A: Reading (70 Marks) */}
                    <div style={{ textAlign: 'center', background: '#0f172a', color: '#fff', padding: '6px', fontWeight: 800, fontSize: '14px', borderRadius: '4px', marginBottom: '16px' }}>
                      Part-A : Reading (70 Marks)
                    </div>

                    {/* Seen Passage-1 */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '18px', background: '#f8fafc' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '6px', color: '#047857' }}>
                        Read the passage carefully and answer questions 1 and 2 [{activePaper.english1Paper.seenPassage1.source}]:
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '14px', borderLeft: '3px solid #047857', paddingLeft: '10px' }}>
                        "{activePaper.english1Paper.seenPassage1.text}"
                      </div>

                      {/* 1. MCQ (1x7=7) */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>1. Choose the correct answer from the following alternatives:</span>
                          <span>1 × 7 = 7</span>
                        </div>
                        <div className="print-cols-2" style={{ columnCount: 2, columnGap: '20px' }}>
                          {activePaper.english1Paper.seenPassage1.mcqs.map((m, mIdx) => (
                            <div key={mIdx} style={{ breakInside: 'avoid', marginBottom: '8px', fontSize: '12.5px' }}>
                              <div style={{ fontWeight: 700 }}>({String.fromCharCode(97 + mIdx)}) {m.q}</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 6px', paddingLeft: '8px', fontSize: '12px' }}>
                                {m.options.map((opt, oIdx) => (
                                  <span key={oIdx}>({['i', 'ii', 'iii', 'iv'][oIdx]}) {opt}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. Answering Questions (2x5=10) */}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>2. Answer the following questions:</span>
                          <span>2 × 5 = 10</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '6px' }}>
                          {activePaper.english1Paper.seenPassage1.questions.map((q, qIdx) => (
                            <div key={qIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                              <span><b>({q.label})</b> {q.text}</span>
                              <b>[2]</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Seen Passage-2 */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '18px', background: '#f8fafc' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '6px', color: '#047857' }}>
                        Read the following text and answer questions 3 and 4 [{activePaper.english1Paper.seenPassage2.source}]:
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '14px', borderLeft: '3px solid #047857', paddingLeft: '10px' }}>
                        "{activePaper.english1Paper.seenPassage2.text}"
                      </div>

                      {/* 3. Gap Filling (1x5=5) */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>3. {activePaper.english1Paper.seenPassage2.gapFilling.instruction}</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {activePaper.english1Paper.seenPassage2.gapFilling.items.map((it, itIdx) => (
                            <div key={itIdx}>{it}</div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Vocabulary (Synonyms & Antonyms) (1x5=5) */}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>4. {activePaper.english1Paper.seenPassage2.vocabulary.instruction}</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', paddingLeft: '8px', fontSize: '12.5px' }}>
                          {activePaper.english1Paper.seenPassage2.vocabulary.items.map((it, itIdx) => (
                            <div key={itIdx} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px' }}>
                              <b>({String.fromCharCode(97 + itIdx)}) {it.word}</b> &rarr; <i>{it.directive}</i>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Unseen Passage */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '18px', background: '#f8fafc' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '6px', color: '#047857' }}>
                        Read the following text carefully and answer questions 5, 6, 7, 8, 9 and 10:
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '14px', borderLeft: '3px solid #047857', paddingLeft: '10px' }}>
                        {activePaper.english1Paper.unseenPassage.text}
                      </div>

                      {/* 5. Information Transfer (1x5=5) */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>5. {activePaper.english1Paper.unseenPassage.infoTransfer.instruction}</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff' }}>
                          <thead>
                            <tr style={{ background: '#e2e8f0' }}>
                              {activePaper.english1Paper.unseenPassage.infoTransfer.headers.map((h, hIdx) => (
                                <th key={hIdx} style={{ border: '1px solid #94a3b8', padding: '5px 8px', textAlign: 'left' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {activePaper.english1Paper.unseenPassage.infoTransfer.rows.map((r, rIdx) => (
                              <tr key={rIdx}>
                                {r.map((c, cIdx) => (
                                  <td key={cIdx} style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>
                                    {cIdx === 1 ? (rIdx % 2 === 0 ? `(i) _________` : c) : (cIdx === 2 && rIdx % 2 !== 0 ? `(ii) _________` : c)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 6. True / False (1x5=5) */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>6. Write whether the following statements are True or False. If false, give the correct information:</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {activePaper.english1Paper.unseenPassage.trueFalse.map((tf, tfIdx) => (
                            <div key={tfIdx}>({String.fromCharCode(97 + tfIdx)}) {tf.text}</div>
                          ))}
                        </div>
                      </div>

                      {/* 7. Writing Summary (10) */}
                      <div style={{ marginBottom: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>7. {activePaper.english1Paper.unseenPassage.summaryPrompt}</span>
                        </div>
                      </div>

                      {/* 8. Matching (1x5=5) */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>8. {activePaper.english1Paper.unseenPassage.matching.instruction}</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff' }}>
                          <thead>
                            <tr style={{ background: '#e2e8f0' }}>
                              <th style={{ border: '1px solid #94a3b8', padding: '4px 8px', width: '30%' }}>Column A</th>
                              <th style={{ border: '1px solid #94a3b8', padding: '4px 8px', width: '35%' }}>Column B</th>
                              <th style={{ border: '1px solid #94a3b8', padding: '4px 8px', width: '35%' }}>Column C</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activePaper.english1Paper.unseenPassage.matching.colA.map((a, idx) => (
                              <tr key={idx}>
                                <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{a}</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{activePaper.english1Paper.unseenPassage.matching.colB[idx]}</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{activePaper.english1Paper.unseenPassage.matching.colC[idx]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 9. Re-arranging Sentences (1x8=8) */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>9. Put the following sentences in correct order to make a continuous story:</span>
                          <span>1 × 8 = 8</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {activePaper.english1Paper.unseenPassage.rearranging.map((s, sIdx) => (
                            <div key={sIdx}>{s}</div>
                          ))}
                        </div>
                      </div>

                      {/* 10. Poem Q&A from English for Today (any 5 out of 8) (2x5=10) */}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>10. {activePaper.english1Paper.unseenPassage.poemQuestions.instruction}</span>
                          <span>2 × 5 = 10</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', paddingLeft: '8px', fontSize: '12.5px' }}>
                          {activePaper.english1Paper.unseenPassage.poemQuestions.questions.map((pq, pqIdx) => (
                            <div key={pqIdx}><b>({pq.label})</b> {pq.text}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Part B: Writing (30 Marks) */}
                    <div style={{ textAlign: 'center', background: '#0f172a', color: '#fff', padding: '6px', fontWeight: 800, fontSize: '14px', borderRadius: '4px', margin: '24px 0 16px' }}>
                      Part-B : Writing (30 Marks)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* 11. Completing Stories (10) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>11. {activePaper.english1Paper.writing.story.title}</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {activePaper.english1Paper.writing.story.prompt}
                        </div>
                      </div>

                      {/* 12. Writing Paragraph in 120 words (10) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>12. {activePaper.english1Paper.writing.paragraph.title}</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {activePaper.english1Paper.writing.paragraph.prompt}
                        </div>
                      </div>

                      {/* 13. Writing Dialogues (10) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>13. {activePaper.english1Paper.writing.dialogue.title}</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', lineHeight: 1.5 }}>
                          {activePaper.english1Paper.writing.dialogue.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePaper.subjectId === 'english2' && activePaper.english2Paper ? (
                  /* ========================================================= */
                  /* 2. ENGLISH SECOND PAPER SPECIAL LAYOUT                    */
                  /* ========================================================= */
                  <div>
                    {/* Part A: Grammar (30 Marks) */}
                    <div style={{ textAlign: 'center', background: '#0f172a', color: '#fff', padding: '6px', fontWeight: 800, fontSize: '14px', borderRadius: '4px', marginBottom: '16px' }}>
                      Part-A : Grammar (30 Marks)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* 1. Identification of Part of Speech (0.5x10=05) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>1. Identification of Part of Speech:</span>
                          <span>0.5 × 10 = 05</span>
                        </div>
                        <div style={{ fontSize: '12.5px', marginBottom: '6px' }}>
                          Read the following passage and identify the parts of speech of the 10 numbered words:
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          {activePaper.english2Paper.grammar.partOfSpeech.text}
                        </div>
                      </div>

                      {/* 2. Gap filling with clues (0.5x10=05) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>2. Gap filling with clues (Parts of speech, articles, prepositions):</span>
                          <span>0.5 × 10 = 05</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '6px 10px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', fontSize: '12.5px' }}>
                          {activePaper.english2Paper.grammar.gapFilling.clues.map((c, cIdx) => (
                            <span key={cIdx} style={{ background: '#fff', padding: '2px 8px', borderRadius: '3px', fontWeight: 700 }}>{c}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                          {activePaper.english2Paper.grammar.gapFilling.text}
                        </div>
                      </div>

                      {/* 3. Substitution Table (1x5=5) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>3. Make five meaningful sentences from the substitution table below:</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', background: '#fff' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                              {activePaper.english2Paper.grammar.substitutionTable.headers.map((h, hIdx) => (
                                <th key={hIdx} style={{ border: '1px solid #94a3b8', padding: '5px 8px', textAlign: 'left' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {activePaper.english2Paper.grammar.substitutionTable.rows.map((r, rIdx) => (
                              <tr key={rIdx}>
                                {r.map((c, cIdx) => (
                                  <td key={cIdx} style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{c}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 4. Right form of Verbs (1x5=5) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>4. Complete the text with the right form of verbs given in brackets:</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                          {activePaper.english2Paper.grammar.rightFormOfVerbs.text}
                        </div>
                      </div>

                      {/* 5. Changing sentences (1x5=5) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>5. Change the following sentences as directed in brackets:</span>
                          <span>1 × 5 = 5</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', fontSize: '13px' }}>
                          {activePaper.english2Paper.grammar.changingSentences.items.map((it, itIdx) => (
                            <div key={itIdx}>
                              {it.text} &nbsp;<b>({it.target})</b>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 6. Punctuation and Capitalization (05) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>6. Use punctuation marks and capital letters where necessary in the following text:</span>
                          <span>05</span>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          {activePaper.english2Paper.grammar.punctuation.text}
                        </div>
                      </div>
                    </div>

                    {/* Part B: Writing (20 Marks) */}
                    <div style={{ textAlign: 'center', background: '#0f172a', color: '#fff', padding: '6px', fontWeight: 800, fontSize: '14px', borderRadius: '4px', margin: '24px 0 16px' }}>
                      Part-B : Writing (20 Marks)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* 7. Letters / E-mail (Formal & Informal) (08) */}
                      <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>7. Letters / E-mail (Formal & Informal):</span>
                          <span>08</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {activePaper.english2Paper.writing.letter.prompt}
                        </div>
                      </div>

                      {/* 8. Writing Short Composition in 200 words (12) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                          <span>8. Writing Short Composition in 200 words:</span>
                          <span>12</span>
                        </div>
                        <div style={{ paddingLeft: '8px', fontSize: '12.5px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {activePaper.english2Paper.writing.composition.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePaper.subjectId === 'bangla2' ? (
                  /* ========================================================= */
                  /* 3. BANGLA SECOND PAPER SPECIAL LAYOUT                     */
                  /* ========================================================= */
                  <div>
                    {/* Section 1: ‘ক’ বিভাগ — নির্মিতি অংশ */}
                    {activePaper.bangla2Composition && (
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
                          <b style={{ fontSize: '13.5px' }}>
                            {['6', '7', '8'].includes(String(activePaper.className))
                              ? '‘ক’ বিভাগ — নির্মিতি অংশ (পূর্ণমান: ৩৫)'
                              : '‘ক’ বিভাগ — নির্মিতি অংশ (পূর্ণমান: ৭০)'}
                          </b>
                          <span style={{ fontSize: '12px' }}>
                            {['6', '7', '8'].includes(String(activePaper.className))
                              ? '[নির্মিতি অংশ হতে ৫টি আইটেমের প্রতিটিতে নির্ধারিত সংখ্যক প্রশ্নের উত্তর দাও]'
                              : '[নির্ধারিত বিকল্প থেকে যথারীতি উত্তর দাও]'}
                          </span>
                        </div>

                        {['6', '7', '8'].includes(String(activePaper.className)) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* ১. অনুধাবন দক্ষতা/অনুচ্ছেদ রচনা: ২টি থাকবে যেকোনো ১টি (০৫ x ১ = ০৫) */}
                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>১. অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা (২টি থেকে যেকোনো ১টির উত্তর দাও):</span>
                                <span>[০৫]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) {activePaper.bangla2Composition.paragraph[0]} &nbsp;&nbsp;&nbsp;&nbsp;অথবা,&nbsp;&nbsp;&nbsp;&nbsp; (খ) {activePaper.bangla2Composition.paragraph[1]}
                              </div>
                            </div>

                            {/* ২. পত্র / দরখাস্ত: ২টি থাকবে যেকোনো ১টি (০৫ x ১ = ০৫) */}
                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>২. পত্র / দরখাস্ত (২টি থেকে যেকোনো ১টির উত্তর দাও):</span>
                                <span>[০৫]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) {activePaper.bangla2Composition.letter[0]}<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) {activePaper.bangla2Composition.letter[1]}
                              </div>
                            </div>

                            {/* ৩. সারাংশ / সারমর্ম: ২টি থাকবে যেকোনো ১টি (০৫ x ১ = ০৫) */}
                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৩. সারাংশ / সারমর্ম (২টি থেকে যেকোনো ১টির উত্তর দাও):</span>
                                <span>[০৫]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) {activePaper.bangla2Composition.summary[0]}<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) {activePaper.bangla2Composition.summary[1]}
                              </div>
                            </div>

                            {/* ৪. ভাবসম্প্রসারণ: ২টি থাকবে যেকোনো ১টি (০৫ x ১ = ০৫) */}
                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৪. ভাবসম্প্রসারণ (২টি থেকে যেকোনো ১টির উত্তর দাও):</span>
                                <span>[০৫]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) “{activePaper.bangla2Composition.amplification[0]}”<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) “{activePaper.bangla2Composition.amplification[1]}”
                              </div>
                            </div>

                            {/* ৫. প্রবন্ধ রচনা (সংকেতসহ): ৩টি থাকবে যেকোনো ১টি (১৫ x ১ = ১৫) */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৫. প্রবন্ধ রচনা (সংকেতসহ যেকোনো ১টির উত্তর দাও):</span>
                                <span>[১৫]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div>(ক) {activePaper.bangla2Composition.essay[0]}</div>
                                <div>(খ) {activePaper.bangla2Composition.essay[1]}</div>
                                <div>(গ) {activePaper.bangla2Composition.essay[2]}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* SSC 70 Marks Format */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>১. যেকোনো একটি বিষয়ে অনুচ্ছেদ রচনা কর (২টি থেকে ১টি):</span>
                                <span>[১০]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) {activePaper.bangla2Composition.paragraph[0]} &nbsp;&nbsp;&nbsp;&nbsp;অথবা,&nbsp;&nbsp;&nbsp;&nbsp; (খ) {activePaper.bangla2Composition.paragraph[1]}
                              </div>
                            </div>

                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>২. চিঠিপত্র / সংবাদ প্রতিবেদন (যেকোনো ১টির উত্তর দাও):</span>
                                <span>[১০]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) {activePaper.bangla2Composition.letter[0]}<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) {activePaper.bangla2Composition.letter[1]}
                              </div>
                            </div>

                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৩. সারাংশ বা সারমর্ম লেখ (যেকোনো ১টি):</span>
                                <span>[১০]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) সারাংশ: {activePaper.bangla2Composition.summary[0]}<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) সারমর্ম: {activePaper.bangla2Composition.summary[1]}
                              </div>
                            </div>

                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৪. ভাব-সম্প্রসারণ কর (যেকোনো ১টি):</span>
                                <span>[১০]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) “{activePaper.bangla2Composition.amplification[0]}”<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) “{activePaper.bangla2Composition.amplification[1]}”
                              </div>
                            </div>

                            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৫. বাংলায় অনুবাদ কর (যেকোনো ১টি):</span>
                                <span>[১০]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px' }}>
                                (ক) {activePaper.bangla2Composition.translation[0]}<br />
                                <div style={{ margin: '2px 0 2px 20px', fontWeight: 700, color: '#475569' }}>অথবা,</div>
                                (খ) {activePaper.bangla2Composition.translation[1]}
                              </div>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                                <span>৬. যেকোনো একটি বিষয়ে প্রবন্ধ রচনা কর (৩টি থেকে ১টি):</span>
                                <span>[২০]</span>
                              </div>
                              <div style={{ paddingLeft: '14px', fontSize: '13px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <span>(ক) {activePaper.bangla2Composition.essay[0]}</span>
                                <span>(খ) {activePaper.bangla2Composition.essay[1]}</span>
                                <span>(গ) {activePaper.bangla2Composition.essay[2]}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 2: ‘খ’ বিভাগ — বহুনির্বাচনি প্রশ্ন (ব্যাকরণ অংশ) */}
                    {activePaper.mcqs && activePaper.mcqs.length > 0 && (
                      <div style={{ marginTop: '24px', marginBottom: '26px' }}>
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
                          <b style={{ fontSize: '13.5px' }}>
                            ‘খ’ বিভাগ — বহুনির্বাচনি প্রশ্ন (ব্যাকরণ অংশ) (পূর্ণমান: {toBn(activePaper.mcqs.length)})
                          </b>
                          <span style={{ fontSize: '12px' }}>
                            {activePaper.mcqRule ? `[${activePaper.mcqRule}]` : `[${toBn(activePaper.mcqs.length)}টি বহুনির্বাচনি প্রশ্ন (শুধু ব্যাকরণ অংশ হতে)। সবকয়টি প্রশ্নের উত্তর দিতে হবে।]`}
                          </span>
                        </div>

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
                  </div>
                ) : activePaper.subjectId === 'physical_edu' ? (
                  /* ========================================================= */
                  /* 4. PHYSICAL EDUCATION & HEALTH (CONTINUOUS EVALUATION)    */
                  /* ========================================================= */
                  <div>
                    {/* Instructions Banner */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px' }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📋</span> প্রশ্নের ধারা ও মানবণ্টন নির্দেশিকা (বিদ্যালয়ভিত্তিক ধারাবাহিক মূল্যায়ন)
                      </h3>
                      <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#15803d', lineHeight: 1.6 }}>
                        জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) সার্কুলার অনুযায়ী ৬ষ্ঠ থেকে ৮ম শ্রেণির ‘শারীরিক শিক্ষা ও স্বাস্থ্য’ বিষয়ের ৫০ নম্বরের মূল্যায়ন বছরব্যাপী বিদ্যালয়ভিত্তিক ধারাবাহিক কার্যক্রমের মাধ্যমে সম্পন্ন হবে।
                      </p>
                      
                      {/* Human-readable 3 component breakdown exactly matching NCTB circular */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
                        <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#14532d', marginBottom: '2px' }}>১. শ্রেণির কাজ</div>
                          <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>নিয়মিত শরীরচর্চা, পিটি, সমাবেশ, খেলাধুলায় সক্রিয় অংশগ্রহণ ও স্বাস্থ্যবিধি পালন।</div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#047857', marginTop: '6px' }}>মান : ২০</div>
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#14532d', marginBottom: '2px' }}>২. অনুসন্ধানী কাজ/ব্যবহারিক কাজ/প্রজেক্ট/অ্যাসাইনমেন্ট</div>
                          <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>স্বাস্থ্যসুরক্ষা প্রতিবেদন, ফার্স্ট এইড ও প্রাথমিক চিকিৎসা অনুশীলন বা নির্ধারিত প্রজেক্ট।</div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#047857', marginTop: '6px' }}>মান : ১০</div>
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#14532d', marginBottom: '2px' }}>৩. শ্রেণি অভীক্ষা</div>
                          <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>শারীরিক সক্ষমতা ও মৌলিক ক্রীড়া কৌশল দক্ষতা যাচাই অভীক্ষা বা ক্লাস টেস্ট।</div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#047857', marginTop: '6px' }}>মান : ২০</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginTop: '12px', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                        সর্বমোট মান = ২০ + ১০ + ২০ = ৫০
                      </div>
                    </div>

                    {/* Printable Continuous Assessment Register */}
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <b style={{ fontSize: '14px', color: '#0f172a' }}>
                          ধারাবাহিক মূল্যায়ন মার্কস রেজিস্টার ছক (Continuous Evaluation Marks Register)
                        </b>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          [বিষয় শিক্ষক কর্তৃক বছরব্যাপী মূল্যায়ন লিপিবদ্ধকরণ ও প্রিন্টযোগ্য রেকর্ড শিট]
                        </span>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', textAlign: 'center' }}>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '50px' }}>রোল</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', textAlign: 'left', minWidth: '150px' }}>শিক্ষার্থীর নাম</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '110px' }}>১. শ্রেণির কাজ<br />(মান: ২০)</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '150px' }}>২. অনুসন্ধানী কাজ/ব্যবহারিক/প্রজেক্ট/অ্যাসাইনমেন্ট<br />(মান: ১০)</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '110px' }}>৩. শ্রেণি অভীক্ষা<br />(মান: ২০)</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '100px' }}>সর্বমোট নম্বর<br />(মান: ৫০)</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '80px' }}>প্রাপ্ত গ্রেড</th>
                            <th style={{ border: '1px solid #94a3b8', padding: '6px', width: '100px' }}>মন্তব্য</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { roll: '০১', name: 'আব্দুল্লাহ আল নোমান', w1: '১৮', w2: '০৯', w3: '১৯', total: '৪৬', grade: 'A+' },
                            { roll: '০২', name: 'তানজিনা আক্তার', w1: '১৭', w2: '০৮', w3: '১৮', total: '৪৩', grade: 'A' },
                            { roll: '০৩', name: 'মোঃ রাফিউল ইসলাম', w1: '১৯', w2: '০৯', w3: '১৮', total: '৪৬', grade: 'A+' },
                            { roll: '০৪', name: 'মায়িশা ফারজানা', w1: '১৬', w2: '০৮', w3: '১৭', total: '৪১', grade: 'A' },
                            { roll: '০৫', name: 'সাদিয়া তাসনিম', w1: '১৮', w2: '০৯', w3: '১৯', total: '৪৬', grade: 'A+' },
                            { roll: '০৬', name: 'রিয়াদ হাসান', w1: '১৫', w2: '০৭', w3: '১৬', total: '৩৮', grade: 'A-' },
                            { roll: '০৭', name: '', w1: '', w2: '', w3: '', total: '', grade: '' },
                            { roll: '০৮', name: '', w1: '', w2: '', w3: '', total: '', grade: '' },
                            { roll: '০৯', name: '', w1: '', w2: '', w3: '', total: '', grade: '' },
                            { roll: '১০', name: '', w1: '', w2: '', w3: '', total: '', grade: '' }
                          ].map((row, rIdx) => (
                            <tr key={rIdx} style={{ height: '32px' }}>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 700 }}>{row.roll}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{row.name}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{row.w1}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{row.w2}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{row.w3}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 800 }}>{row.total}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 700, color: '#047857' }}>{row.grade}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Signature Section */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '10px' }}>
                        <div style={{ textAlign: 'center', borderTop: '1px dotted #64748b', minWidth: '180px', paddingTop: '4px', fontSize: '12px' }}>
                          <b>বিষয় শিক্ষকের স্বাক্ষর</b>
                        </div>
                        <div style={{ textAlign: 'center', borderTop: '1px dotted #64748b', minWidth: '180px', paddingTop: '4px', fontSize: '12px' }}>
                          <b>প্রধান শিক্ষকের স্বাক্ষর ও সিলমোহর</b>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* 5. GENERAL SUBJECTS (BANGLA 1, MATH, SCIENCE, BGS, ETC.)  */
                  /* ========================================================= */
                  <div>
                    {/* Section A: MCQ (বহুনির্বাচনি অভীক্ষা) */}
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
                          <b style={{ fontSize: '13.5px' }}>
                            {['6', '7', '8'].includes(String(activePaper.className)) ? 'বহুনির্বাচনি প্রশ্ন' : '‘ক’ বিভাগ — বহুনির্বাচনি অভীক্ষা'} (পূর্ণমান: {toBn(activePaper.mcqs.length)})
                          </b>
                          <span style={{ fontSize: '12px' }}>
                            {activePaper.mcqRule ? `[${activePaper.mcqRule}]` : '[বিশেষ দ্রষ্টব্য: সরবরাহকৃত OMR শিটে সঠিক উত্তরের বৃত্তটি কালো বলপয়েন্ট কলম দ্বারা ভরাট কর। সকল প্রশ্নের উত্তর দিতে হবে।]'}
                          </span>
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

                    {/* Section: হিসাববিজ্ঞান আর্থিক বিবরণী প্রস্তুতকরণ (বাধ্যতামূলক, মান ২০) */}
                    {activePaper.financialStatement && (
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
                          <b style={{ fontSize: '13.5px' }}>‘ক’ বিভাগ — আর্থিক বিবরণী প্রস্তুতকরণ (পূর্ণমান: ২০)</b>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#b91c1c' }}>
                            [১ নম্বর প্রশ্নের উত্তর দেওয়া আবশ্যিক]
                          </span>
                        </div>

                        <div style={{ border: '1px solid #cbd5e1', padding: '14px', borderRadius: '6px', background: '#f8fafc', marginBottom: '16px' }}>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '6px' }}>
                            ১ নম্বর প্রশ্ন (আবশ্যিক):
                          </div>
                          <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '10px' }}>
                            {activePaper.financialStatement.stimulus}
                          </div>

                          {/* Trial Balance Table */}
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginBottom: '10px', background: '#fff' }}>
                            <thead>
                              <tr style={{ background: '#e2e8f0' }}>
                                <th style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'left' }}>হিসাবের শিরোনাম</th>
                                <th style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'right', width: '110px' }}>ডেবিট (টাকা)</th>
                                <th style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'right', width: '110px' }}>ক্রেডিট (টাকা)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activePaper.financialStatement.trial_balance && activePaper.financialStatement.trial_balance.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px' }}>{row.account}</td>
                                  <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px', textAlign: 'right' }}>{row.debit ? toBn(row.debit) : '—'}</td>
                                  <td style={{ border: '1px solid #cbd5e1', padding: '4px 8px', textAlign: 'right' }}>{row.credit ? toBn(row.credit) : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Adjustments */}
                          <div style={{ fontSize: '12.5px', marginBottom: '10px' }}>
                            <b>অন্যান্য সমন্বয়সমূহ:</b>
                            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
                              {activePaper.financialStatement.adjustments && activePaper.financialStatement.adjustments.map((adj, aIdx) => (
                                <li key={aIdx} style={{ margin: '2px 0' }}>{adj}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Sub Questions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                            {activePaper.financialStatement.sub_questions && activePaper.financialStatement.sub_questions.map((sub, sIdx) => (
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
                      </div>
                    )}

                    {/* Section B: Creative Questions (CQ) */}
                    {activePaper.cqs && activePaper.cqs.length > 0 && (
                      <div style={{ marginTop: '20px', marginBottom: '26px' }}>
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
                          <b style={{ fontSize: '13.5px' }}>
                            {['6', '7', '8'].includes(String(activePaper.className)) ? 'সৃজনশীল প্রশ্ন' : '‘খ’ বিভাগ — সৃজনশীল প্রশ্ন'} (পূর্ণমান: {toBn((activePaper.cqToAnswer || activePaper.cqs.length) * 10)})
                          </b>
                          <span style={{ fontSize: '12px' }}>
                            {activePaper.cqRule ? `[${activePaper.cqRule}]` : `[যেকোনো ${toBn(activePaper.cqToAnswer || activePaper.cqs.length)}টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১০]`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {activePaper.cqs.map((cq, idx) => {
                            const sectionTitle = cq.sectionName || cq.section_label;
                            const prevSectionTitle = idx > 0 ? (activePaper.cqs[idx - 1]?.sectionName || activePaper.cqs[idx - 1]?.section_label) : null;
                            const showSectionHeader = sectionTitle && (idx === 0 || prevSectionTitle !== sectionTitle);
                            return (
                              <React.Fragment key={cq.id || idx}>
                                {showSectionHeader && (
                                  <div style={{
                                    background: '#e2e8f0',
                                    color: '#0f172a',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    marginTop: idx > 0 ? '10px' : '0',
                                    borderLeft: '4px solid #047857'
                                  }}>
                                    {sectionTitle}
                                  </div>
                                )}
                                <div className="question-item" style={{ breakInside: 'avoid', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
                                  <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '4px' }}>
                                    {toBn(idx + (activePaper.financialStatement ? 2 : 1))} নম্বর প্রশ্ন:
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
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section C: Short-Answer Questions (সংক্ষিপ্ত-উত্তর প্রশ্ন - প্রতিটি ২ নম্বর) */}
                    {activePaper.shortQuestions && activePaper.shortQuestions.length > 0 && (
                      <div style={{ marginTop: '24px', marginBottom: '26px' }}>
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
                          <b style={{ fontSize: '13.5px' }}>
                            {['6', '7', '8'].includes(String(activePaper.className)) ? 'সংক্ষিপ্ত উত্তর-প্রশ্ন' : '‘গ’ বিভাগ — সংক্ষিপ্ত-উত্তর প্রশ্ন'} (পূর্ণমান: {toBn(activePaper.shortMarks || (activePaper.shortToAnswer ? activePaper.shortToAnswer * 2 : activePaper.shortQuestions.length * 2))})
                          </b>
                          <span style={{ fontSize: '12px' }}>
                            {activePaper.shortRule ? `[${activePaper.shortRule}]` : `[যেকোনো ${toBn(activePaper.shortToAnswer || activePaper.shortQuestions.length)}টি প্রশ্নের সংক্ষিপ্ত উত্তর দাও। প্রতিটি প্রশ্নের মান ২]`}
                          </span>
                        </div>

                        {/* 2-Column Print Layout for Short Questions */}
                        <div className="print-cols-2" style={{ columnCount: 2, columnGap: '28px' }}>
                          {activePaper.shortQuestions.map((sq, sqIdx) => (
                            <div key={sq.id || sqIdx} className="question-item" style={{ breakInside: 'avoid', marginBottom: '12px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dotted #e2e8f0', paddingBottom: '6px' }}>
                              <div style={{ paddingRight: '8px', lineHeight: 1.45 }}>
                                <b style={{ marginRight: '4px' }}>{toBn(sqIdx + 1)}.</b>
                                <span>{sq.question_bn}</span>
                              </div>
                              <b style={{ paddingLeft: '8px', whiteSpace: 'nowrap', color: '#0f172a' }}>
                                [{toBn(sq.marks || 2)}]
                              </b>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section D: আনন্দ পাঠ / সহপাঠ বর্ণনামূলক প্রশ্ন (বাংলা ১ম পত্র) */}
                    {activePaper.descriptiveQuestions && activePaper.descriptiveQuestions.length > 0 && (
                      <div style={{ marginTop: '24px', marginBottom: '26px' }}>
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
                          <b style={{ fontSize: '13.5px' }}>
                            {['6', '7', '8'].includes(String(activePaper.className))
                              ? '‘গ’ বিভাগ — বর্ণনামূলক প্রশ্ন: আনন্দ পাঠ (পূর্ণমান: ২০)'
                              : '‘ঘ’ বিভাগ — বর্ণনামূলক প্রশ্ন: সহপাঠ (উপন্যাস ও নাটক) (পূর্ণমান: ২০)'}
                          </b>
                          <span style={{ fontSize: '12px' }}>
                            {activePaper.descriptiveRule ? `[${activePaper.descriptiveRule}]` : (['6', '7', '8'].includes(String(activePaper.className))
                              ? '[আনন্দ পাঠ থেকে ৪টি বর্ণনামূলক প্রশ্ন থাকবে। এর মধ্যে ২টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের ২টি অংশ থাকবে (ক অংশের জন্য ৩ এবং খ অংশের জন্য ৭ নম্বর, মোট ২০ নম্বর)]'
                              : '[উপন্যাস থেকে ১টি এবং নাটক থেকে ১টি করে মোট ২টি প্রশ্নের উত্তর দিতে হবে। প্রতিটির মান ১০ (ক-৩, খ-৭)]')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {activePaper.descriptiveQuestions.map((dq, dIdx) => (
                            <div key={dq.id || dIdx} className="question-item" style={{ breakInside: 'avoid', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                              <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '4px' }}>
                                {toBn(dIdx + 1)} নম্বর বর্ণনামূলক প্রশ্ন ({dq.book_type === 'ananda_path' ? dq.title : (dq.book_type === 'novel' ? 'উপন্যাস অংশ' : 'নাটক অংশ')}):
                              </div>
                              <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '6px' }}>
                                {dq.context}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                                {dq.sub_questions && dq.sub_questions.map((sub, sIdx) => (
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

                    {/* Section F: Practical Exam (ব্যবহারিক অভীক্ষা - যদি প্রযোজ্য হয়) */}
                    {activePaper.practicalMarks && activePaper.practicalMarks > 0 && (
                      <div style={{ marginTop: '24px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px 16px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px' }}>
                          <b style={{ fontSize: '13.5px' }}>
                            {activePaper.subjectId === 'higher_math' ? '‘ঘ’ বিভাগ — ব্যবহারিক অভীক্ষা' : '‘গ’ বিভাগ — ব্যবহারিক অভীক্ষা'} (পূর্ণমান: {toBn(activePaper.practicalMarks)})
                          </b>
                          <span style={{ fontSize: '12px', color: '#475569' }}>
                            [বিদ্যালয়ের বিজ্ঞান ল্যাবরেটরি / আইসিটি ল্যাবে নির্দিষ্ট তদারকিতে অনুষ্ঠিত হবে]
                          </span>
                        </div>

                        {activePaper.subjectId === 'higher_math' ? (
                          <div style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: 1.7 }}>
                            ১. পরীক্ষণের ২টি কার্যক্রম সম্পন্ন করতে হবে (১০ × ২ = <b>{toBn(20)} নম্বর</b>):<br />
                            &nbsp;&nbsp;&nbsp;• প্রত্যেক কার্যক্রমে পরিকল্পনা প্রণয়ন: ২ নম্বর; সঠিক প্রক্রিয়া অনুসরণ: ৩ নম্বর; লেখচিত্র অঙ্কন ও উপাত্ত বিশ্লেষণ: ৩ নম্বর; ফলাফল ও ব্যাখ্যা: ২ নম্বর<br />
                            ২. মৌখিক অভীক্ষা (Viva-Voce): <b>{toBn(5)} নম্বর</b>
                          </div>
                        ) : activePaper.subjectId === 'ict' ? (
                          <div style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: 1.8 }}>
                            {['6', '7', '8'].includes(String(activePaper.className)) ? (
                              <>
                                ১. যন্ত্র/উপকরণ সংযোজন ও ব্যবহার / প্রক্রিয়া অনুসরণ / উপাত্ত সংগ্রহ ও প্রক্রিয়াকরণ / অঙ্কন / পর্যবেক্ষণ / শনাক্তকরণ / অনুশীলন : <b>{toBn(15)} নম্বর</b><br />
                                ২. প্রতিবেদন প্রণয়ন : <b>{toBn(5)} নম্বর</b><br />
                                ৩. মৌখিক অভীক্ষা : <b>{toBn(5)} নম্বর</b>
                              </>
                            ) : (
                              <>
                                ১. ব্যবহারিক পরীক্ষণ সম্পাদন (স্প্রেডশিট বিশ্লেষণ / ডেটাবেস ডিজাইন / প্রেজেন্টেশন স্লাইড): <b>{toBn(15)} নম্বর</b><br />
                                ২. কার্যবিবরণী ও প্র্যাকটিক্যাল নোটবুক: <b>{toBn(5)} নম্বর</b><br />
                                ৩. মৌখিক অভীক্ষা (Viva-Voce): <b>{toBn(5)} নম্বর</b>
                              </>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: 1.7 }}>
                            ১. নির্ধারিত পরীক্ষণ (যন্ত্র/উপকরণ সংযোজন, সঠিক প্রক্রিয়া অনুসরণ, উপাত্ত সংগ্রহ, পর্যবেক্ষণ ও শনাক্তকরণ): <b>{toBn(15)} নম্বর</b><br />
                            ২. ব্যাখ্যাসহ ফলাফল উপস্থাপন ও বিশ্লেষণ: <b>{toBn(5)} নম্বর</b><br />
                            ৩. মৌখিক অভীক্ষা (Viva-Voce): <b>{toBn(5)} নম্বর</b>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Key (Only visible when toggled) */}
                {showAnswerSheet && (
                  <div style={{ marginTop: '36px', borderTop: '2px solid #047857', paddingTop: '18px' }}>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#065f46' }}>
                        🔑 শিক্ষক মূল্যায়ন নির্দেশিকা ও উত্তর সংকেত (Answer Key & Solutions)
                      </h3>
                    </div>

                    {/* English 1st Paper Solutions */}
                    {activePaper.subjectId === 'english1' && activePaper.english1Paper && (
                      <div style={{ fontSize: '12.5px', lineHeight: 1.6, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#047857', marginBottom: '6px' }}>Part-A: Reading Answer Guide:</div>
                        <p style={{ margin: '0 0 6px' }}><b>1. MCQ:</b> (a) ii. two-way, (b) iii. informal, (c) ii. courteous, (d) iii. pay attention, (e) ii. Thank you, (f) ii. strangers and elders, (g) iii. disrespectful</p>
                        <p style={{ margin: '0 0 6px' }}><b>3. Gap Filling:</b> (a) mighty, (b) eternity, (c) virtue, (d) kindness, (e) Eden</p>
                        <p style={{ margin: '0 0 6px' }}><b>4. Vocabulary:</b> (a) Mighty = Powerful, (b) Pleasant = Unpleasant, (c) Kindness = Compassion, (d) Error = Mistake, (e) Virtue = Vice</p>
                        <p style={{ margin: '0 0 6px' }}><b>5. Info Transfer:</b> (i) Born in 1885, (ii) Sorbonne University, Paris (1928), (iii) Compiled Regional Dialect Dictionary</p>
                        <p style={{ margin: '0 0 6px' }}><b>6. True/False:</b> (a) False (Born in Peyara, West Bengal), (b) True, (c) False (Sorbonne University), (d) True, (e) True</p>
                        <p style={{ margin: '0 0 6px' }}><b>9. Re-arranging Sequence:</b> (b) &rarr; (d) &rarr; (f) &rarr; (a) &rarr; (c) &rarr; (g) &rarr; (e) &rarr; (h)</p>
                      </div>
                    )}

                    {/* English 2nd Paper Solutions */}
                    {activePaper.subjectId === 'english2' && activePaper.english2Paper && (
                      <div style={{ fontSize: '12.5px', lineHeight: 1.6, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#047857', marginBottom: '6px' }}>Part-A: Grammar Answer Guide:</div>
                        <p style={{ margin: '0 0 6px' }}><b>1. Parts of Speech:</b> (1) Noun, (2) Adjective, (3) Verb, (4) Preposition, (5) Adjective, (6) Pronoun, (7) Adverb, (8) Conjunction, (9) Interjection, (10) Adverb</p>
                        <p style={{ margin: '0 0 6px' }}><b>2. Gap Filling:</b> (a) light, (b) removes, (c) nation, (d) a, (e) to, (f) educated, (g) to, (h) the, (i) for, (j) in</p>
                        <p style={{ margin: '0 0 6px' }}><b>4. Right Form of Verbs:</b> (a) is, (b) keeps, (c) suffer, (d) exercise, (e) build</p>
                        <p style={{ margin: '0 0 6px' }}><b>5. Changing Sentences:</b> (a) Patriotism is not an ignoble virtue. (b) Everybody hates an unpatriotic person. (c) Doesn't a patriot love his country deeply? (d) He sacrificed his comfort for his motherland. (e) The life of a patriot is very glorious.</p>
                        <p style={{ margin: 0 }}><b>6. Punctuation:</b> The teacher said to Rafi, "Why are you talking in the class? You should listen to my lecture attentively." "Sir, I am sorry. I was asking Fahim for a pen," replied Rafi.</p>
                      </div>
                    )}

                    {/* Quick Answer Key Matrix for MCQs */}
                    {activePaper.mcqs && activePaper.mcqs.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>বহুনির্বাচনি প্রশ্নের উত্তরমালা:</div>
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
                    )}
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
      {/* TAB: CUSTOM EXAM BUILDER VIA CHECKBOXES                  */}
      {/* ========================================================= */}
      {activeTab === 'custom_builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Exam Setup Card */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📝</span>
                  <span>টিক চিহ্নের মাধ্যমে কাস্টম প্রশ্নপত্র প্রস্তুতকরণ</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  সাপ্তাহিক, মাসিক, অধ্যায় ভিত্তিক, অর্ধ-বার্ষিক, প্রাক-নির্বাচনি, নির্বাচনি ও বার্ষিক পরীক্ষার জন্য নির্দিষ্ট প্রশ্ন সিলেক্ট করুন।
                </p>
              </div>
            </div>

            {/* Exam Type Preset Pills */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                🎯 পরীক্ষার ধরন নির্বাচন করুন (স্বয়ংক্রিয় প্রিসেট):
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'weekly', label: '📅 সাপ্তাহিক পরীক্ষা', defaultMarks: 25 },
                  { id: 'monthly', label: '🗓️ মাসিক পরীক্ষা', defaultMarks: 40 },
                  { id: 'chapter', label: '📖 অধ্যায় ভিত্তিক টেস্ট', defaultMarks: 25 },
                  { id: 'half_yearly', label: '🎓 অর্ধ-বার্ষিক পরীক্ষা', defaultMarks: 100 },
                  { id: 'pre_test', label: '📝 প্রাক-নির্বাচনি পরীক্ষা', defaultMarks: 100 },
                  { id: 'test', label: '🎯 নির্বাচনি পরীক্ষা', defaultMarks: 100 },
                  { id: 'annual', label: '🏆 বার্ষিক পরীক্ষা', defaultMarks: 100 },
                  { id: 'custom', label: '✏️ অন্যান্য কাস্টম পরীক্ষা', defaultMarks: 50 }
                ].map(preset => {
                  const isSelected = customExamType === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleCustomExamTypeChange(preset.id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '2px solid #047857' : '1px solid #cbd5e1',
                        background: isSelected ? '#ecfdf5' : '#fff',
                        color: isSelected ? '#047857' : '#475569',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parameter Grid aligned with NCTB specs (Identical to 1-Click Generator Layout) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিদ্যালয়ের নাম:</label>
                <input
                  type="text"
                  value={customSchoolName}
                  onChange={e => setCustomSchoolName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>পরীক্ষার নাম:</label>
                <input
                  type="text"
                  value={customExamName}
                  onChange={e => setCustomExamName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>শ্রেণি:</label>
                <select
                  value={customClass}
                  onChange={e => {
                    const c = e.target.value;
                    setCustomClass(c);
                    setCustomSelectedChapters([]);
                    if (['6', '7', '8'].includes(c)) {
                      setCustomDepartment('সাধারণ');
                    } else if (customDepartment === 'সাধারণ') {
                      setCustomDepartment('সকল বিভাগ');
                    }
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিভাগ (Department / Group):</label>
                <select
                  value={customDepartment}
                  disabled={!isCustomHighSchoolGrouped}
                  onChange={e => {
                    setCustomDepartment(e.target.value);
                    setCustomSelectedChapters([]);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: isCustomHighSchoolGrouped ? '#fff' : '#f1f5f9',
                    color: isCustomHighSchoolGrouped ? '#0f172a' : '#64748b',
                    cursor: isCustomHighSchoolGrouped ? 'pointer' : 'not-allowed'
                  }}
                >
                  {!isCustomHighSchoolGrouped ? (
                    <option value="সাধারণ">সাধারণ (৬ষ্ঠ–৮ম শ্রেণিতে বিভাগ বিভাজন প্রযোজ্য নয়)</option>
                  ) : (
                    <>
                      <option value="সকল বিভাগ">সকল বিভাগ (আবশ্যিক + সকল গ্রুপ)</option>
                      <option value="আবশ্যিক">আবশ্যিক বিষয়সমূহ (বাংলা, ইংরেজি, গণিত, আইসিটি, ধর্ম)</option>
                      <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (পদার্থ, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত)</option>
                      <option value="মানবিক">মানবিক বিভাগ (ইতিহাস, ভূগোল, পৌরনীতি, অর্থনীতি, বিজ্ঞান)</option>
                      <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা (হিসাববিজ্ঞান, উদ্যোগ, ফিন্যান্স, বিজ্ঞান)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>বিষয় নির্বাচন (এনসিটিবি কারিকুলাম):</label>
                <select
                  value={customSubjectId}
                  onChange={e => {
                    setCustomSubjectId(e.target.value);
                    setCustomSelectedChapters([]);
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {customAvailableSubjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (কোড: {s.code}) {isCustomHighSchoolGrouped && s.departments.length > 0 ? `[${s.departments[0]}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>সময় বরাদ্দ:</label>
                <input
                  type="text"
                  value={customTimeAllowed}
                  onChange={e => setCustomTimeAllowed(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>মোট পূর্ণমান:</label>
                <input
                  type="number"
                  value={customTotalMarks}
                  onChange={e => setCustomTotalMarks(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>MCQ প্রশ্ন সংখ্যা:</label>
                <input
                  type="number"
                  value={customMcqCount}
                  onChange={e => setCustomMcqCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>সৃজনশীল (CQ) উদ্দীপক সংখ্যা:</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={customCqCount}
                    onChange={e => setCustomCqCount(Number(e.target.value))}
                    style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>থেকে উত্তর:</span>
                  <input
                    type="number"
                    value={customCqToAnswer}
                    onChange={e => setCustomCqToAnswer(Number(e.target.value))}
                    style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Short Questions Input (NCTB Standard: 2 marks each) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  সংক্ষিপ্ত-উত্তর প্রশ্ন (প্রতিটি ২ নম্বর):
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={customShortCount}
                    onChange={e => setCustomShortCount(Number(e.target.value))}
                    style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>থেকে উত্তর:</span>
                  <input
                    type="number"
                    value={customShortToAnswer}
                    onChange={e => setCustomShortToAnswer(Number(e.target.value))}
                    style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>
                    ({toBn(customShortToAnswer * 2)} নম্বর)
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>ব্যবহারিক / বিশেষ অংশ মান:</label>
                <input
                  type="number"
                  value={customPracticalMarks}
                  onChange={e => setCustomPracticalMarks(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>শিক্ষার্থীদের জন্য বিশেষ নির্দেশনা:</label>
                <input
                  type="text"
                  placeholder="যেমন: বোর্ড মডেল অনুযায়ী পূর্ণাঙ্গ উত্তর প্রদান কর।"
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* NCTB Official Marks Blueprint Card for Custom Builder */}
            {customCurrentSubject && (() => {
              const currentScheme = customScheme;
              if (!currentScheme) return null;
              return (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🏛️</span>
                      <b style={{ fontSize: '14px', color: '#065f46' }}>
                        জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) বিষয়ভিত্তিক মূল্যায়ন নির্দেশনা ও নম্বর বিভাজন
                      </b>
                    </div>
                    <span style={{ background: '#047857', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                      বিষয় কোড: {toBn(customCurrentSubject.code)} | {['9', '10'].includes(customClass) ? `${toBn(customClass)}ম শ্রেণি (এসএসসি পরিপত্র অনুযায়ী)` : `${toBn(customClass)}ম শ্রেণি (৬ষ্ঠ–৮ম কাঠামো অনুযায়ী)`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>পূর্ণমান</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#047857' }}>{toBn(currentScheme.full_marks)} নম্বর</div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>সৃজনশীল / লিখিত</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
                        {currentScheme.written_max > 0 ? (
                          `${toBn(currentScheme.written_max)} নম্বর (${toBn(currentScheme.cq_count)}টি হতে ${toBn(currentScheme.cq_to_answer)}টি)`
                        ) : 'লিখিত নেই'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>সংক্ষিপ্ত-উত্তর প্রশ্ন</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                        {currentScheme.short_max > 0 ? (
                          `${toBn(currentScheme.short_max)} নম্বর (${toBn(currentScheme.short_count)}টি হতে ${toBn(currentScheme.short_to_answer)}টি)`
                        ) : 'সংক্ষিপ্ত নেই'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>বহুনির্বাচনী (MCQ)</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#d97706' }}>
                        {currentScheme.mcq_max > 0 ? `${toBn(currentScheme.mcq_max)} নম্বর (${toBn(currentScheme.mcq_max)}টি প্রশ্ন)` : 'MCQ নেই'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ব্যবহারিক / বিশেষ অংশ</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#7c3aed' }}>
                        {currentScheme.practical_max > 0 ? `${toBn(currentScheme.practical_max)} নম্বর (ল্যাব)` : 'প্রযোজ্য নয়'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>বরাদ্দকৃত সময়</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{currentScheme.time_allowed || '৩ ঘণ্টা'}</div>
                    </div>
                  </div>

                  {/* Directives & Pass marks note */}
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#065f46', lineHeight: 1.6, borderTop: '1px dashed #a7f3d0', paddingTop: '10px' }}>
                    {currentScheme.cq_rule && (
                      <div style={{ marginBottom: '4px' }}><b>📌 সৃজনশীল নির্দেশিকা:</b> {currentScheme.cq_rule}</div>
                    )}
                    {currentScheme.short_rule && (
                      <div style={{ marginBottom: '4px' }}><b>📌 সংক্ষিপ্ত-উত্তর নির্দেশিকা:</b> {currentScheme.short_rule}</div>
                    )}
                    {currentScheme.mcq_rule && (
                      <div style={{ marginBottom: '4px' }}><b>📌 বহুনির্বাচনী নির্দেশিকা:</b> {currentScheme.mcq_rule}</div>
                    )}
                    {currentScheme.practical_rule && (
                      <div style={{ marginBottom: '4px' }}><b>🔬 ব্যবহারিক নির্দেশিকা:</b> {currentScheme.practical_rule}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '6px', fontSize: '11.5px', color: '#047857' }}>
                      <span>🎯 <b>পাস নম্বর বণ্টন:</b> লিখিত {toBn(currentScheme.written_pass || 0)} | MCQ {toBn(currentScheme.mcq_pass || 0)} {currentScheme.practical_pass ? `| ব্যবহারিক ${toBn(currentScheme.practical_pass)}` : ''} (পরীক্ষা ও ফলাফল অংশের সাথে হুবহু সামঞ্জস্যপূর্ণ)</span>
                      <span style={{ fontStyle: 'italic', color: '#64748b' }}>প্যাটার্ন: {currentScheme.pattern || 'nctb_standard'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Chapter Selection Filter for Question Pool */}
            <div style={{ marginTop: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📖</span>
                  <span>সিলেবাস ও অধ্যায় ফিল্টার (যে যে অধ্যায় থেকে প্রশ্ন নির্বাচন করবেন):</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomSelectedChapters(customAvailableChapters)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    সব অধ্যায় নির্বাচন
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSelectedChapters([])}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    সব বাতিল (পূর্ণাঙ্গ সিলেবাস)
                  </button>
                </div>
              </div>

              {customAvailableChapters.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                  {customAvailableChapters.map((ch, idx) => {
                    const isChecked = customSelectedChapters.includes(ch);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: isChecked ? '1px solid #10b981' : '1px solid #e2e8f0',
                          background: isChecked ? '#ecfdf5' : '#f8fafc',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setCustomSelectedChapters(customSelectedChapters.filter(c => c !== ch));
                            } else {
                              setCustomSelectedChapters([...customSelectedChapters, ch]);
                            }
                          }}
                          style={{ accentColor: '#047857', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065f46' : '#334155' }}>
                          {ch}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b' }}>এই বিষয়ের জন্য কোনো নির্দিষ্ট অধ্যায় তালিকা পাওয়া যায়নি।</div>
              )}
            </div>
          </div>

          {/* 2. Sticky Marks & Selection Progress Bar */}
          <div style={{
            position: 'sticky',
            top: '10px',
            zIndex: 100,
            background: '#064e3b',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(6, 78, 59, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase' }}>মোট নির্বাচিত প্রশ্ন</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>
                  {toBn(customStats.totalCount)} টি
                </div>
              </div>

              <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

              <div style={{ display: 'flex', gap: '12px', fontSize: '12.5px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px' }}>
                  <span>বহুনির্বাচনী (MCQ): </span>
                  <b>{toBn(customStats.mcqCount)}/{toBn(customMcqCount)} টি</b> ({toBn(customStats.mcqMarks)} নম্বর)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px' }}>
                  <span>সংক্ষিপ্ত: </span>
                  <b>{toBn(customStats.shortCount)}/{toBn(customShortCount)} টি</b> {customShortToAnswer > 0 ? `[উত্তর: ${toBn(customStats.shortToAnswer)}টি]` : ''} ({toBn(customStats.shortMarks)} নম্বর)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px' }}>
                  <span>সৃজনশীল (CQ): </span>
                  <b>{toBn(customStats.cqCount)}/{toBn(customCqCount)} টি</b> {customCqToAnswer > 0 ? `[উত্তর: ${toBn(customStats.cqToAnswer)}টি]` : ''} ({toBn(customStats.cqMarks)} নম্বর)
                </div>
              </div>

              <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

              <div>
                <div style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 600 }}>বর্তমান মান / লক্ষ্যমাত্রা</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: customStats.totalSelectedMarks === Number(customTotalMarks) ? '#86efac' : (customStats.totalSelectedMarks > Number(customTotalMarks) ? '#fca5a5' : '#fde047') }}>
                  {toBn(customStats.totalSelectedMarks)} / {toBn(customTotalMarks)} নম্বর
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={deselectAllCustom}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                সব আনচেক
              </button>

              <button
                type="button"
                onClick={handleGenerateCustomPaper}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🖨️</span>
                <span>পূর্ণাঙ্গ প্রশ্নপত্র তৈরি করুন</span>
              </button>
            </div>
          </div>

          {/* 3. Question Filter Tabs & Search */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '18px 22px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'সকল প্রশ্ন' },
                  { id: 'cq', label: 'সৃজনশীল প্রশ্ন (CQ)' },
                  { id: 'mcq', label: 'বহুনির্বাচনী (MCQ)' },
                  { id: 'short', label: 'সংক্ষিপ্ত উত্তর-প্রশ্ন' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCustomFilterType(t.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      background: customFilterType === t.id ? '#047857' : '#f1f5f9',
                      color: customFilterType === t.id ? '#fff' : '#475569'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="প্রশ্নের বিষয়বস্তু খুঁজুন..."
                  value={customSearch}
                  onChange={e => setCustomSearch(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', minWidth: '220px' }}
                />

                <button
                  type="button"
                  onClick={() => selectAllVisibleCustom(customVisibleQuestions)}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✓ দৃশ্যমান সব নির্বাচন ({toBn(customVisibleQuestions.length)})
                </button>
              </div>
            </div>

            {/* Question List Cards with Checkboxes */}
            {customVisibleQuestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customVisibleQuestions.map((q, idx) => {
                  const isSelected = customSelectedQuestionIds.has(q.id);
                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => toggleCustomQuestion(q.id)}
                      style={{
                        border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0fdf4' : '#fff',
                        borderRadius: '10px',
                        padding: '14px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.12)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by card click
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: '#047857',
                              marginTop: '3px',
                              cursor: 'pointer'
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{
                                background: q.question_type === 'mcq' ? '#e0f2fe' : q.question_type === 'short' ? '#f3e8ff' : '#fef3c7',
                                color: q.question_type === 'mcq' ? '#0369a1' : q.question_type === 'short' ? '#7e22ce' : '#b45309',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 800
                              }}>
                                {q.question_type === 'mcq' ? 'MCQ (১ নম্বর)' : q.question_type === 'short' ? `সংক্ষিপ্ত (${toBn(q.marks || 2)} নম্বর)` : 'CQ সৃজনশীল (১০ নম্বর)'}
                              </span>
                              <span style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700 }}>
                                🏷️ {q.chapter}
                              </span>
                            </div>

                            {/* Question Content */}
                            {q.question_type === 'mcq' ? (
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.45 }}>
                                  {q.question_bn}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '12px', background: isSelected ? '#ffffff' : '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
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
                            ) : q.question_type === 'short' ? (
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', lineHeight: 1.45 }}>
                                  {q.question_bn}
                                </div>
                                <div style={{ fontSize: '12px', color: '#166534', background: isSelected ? '#ffffff' : '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <b>উত্তর:</b> {q.correct_answer || q.explanation}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ background: isSelected ? '#ffffff' : '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', color: '#334155', marginBottom: '8px', lineHeight: 1.45 }}>
                                  <b>উদ্দীপক:</b> {q.stimulus}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
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
                        </div>

                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: isSelected ? '#047857' : '#94a3b8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isSelected ? '✓ নির্বাচিত' : '+ যোগ করুন'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>
                  নির্বাচিত অধ্যায়ে এই মুহূর্তে কোনো প্রশ্ন পাওয়া যায়নি
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                  আপনি নিচের বাটনে ক্লিক করে এক ক্লিকে ১০০+ MCQ, ২০+ CQ ও ৫০+ সংক্ষিপ্ত প্রশ্ন মজুত করে নিতে পারেন অথবা নতুন প্রশ্ন আপলোড করতে পারেন।
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const ch = customSelectedChapters[0] || (customAvailableChapters[0] || '১ম অধ্যায়');
                      const subMeta = SUBJECT_METADATA.find(s => s.id === customSubjectId);
                      const res = seedChapterStock(customClass, customSubjectId, subMeta ? subMeta.name : customSubjectId, ch);
                      setQuestions(res.updatedList);
                      showToast(`'${ch}' অধ্যায়ে নতুন ${toBn(res.added)}টি প্রশ্ন মজুত করা হয়েছে!`);
                    }}
                    style={{
                      background: '#047857',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ এই অধ্যায়ে ১০০+ MCQ, ২০+ CQ ও ৫০+ সংক্ষিপ্ত প্রশ্ন মজুত করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBulkUpload(customSubjectId, customClass)}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📥 প্রশ্ন আপলোড করুন
                  </button>
                </div>
              </div>
            )}
          </div>
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

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenBulkUpload(bankSubject !== 'all' ? bankSubject : 'bangla1', bankClass !== 'all' ? bankClass : '8')}
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📥</span>
                <span>অধ্যায়ভিত্তিক প্রশ্ন আপলোড ও নির্দেশিকা</span>
              </button>

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
                <option value="all">সব ধরন (MCQ + CQ + সংক্ষিপ্ত)</option>
                <option value="mcq">বহুনির্বাচনী (MCQ)</option>
                <option value="cq">সৃজনশীল (CQ)</option>
                <option value="short">সংক্ষিপ্ত উত্তর-প্রশ্ন</option>
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

          {/* Chapter Stock & Inventory Tracker Card */}
          {(() => {
            const currentBankClass = bankClass !== 'all' ? bankClass : '10';
            const currentBankSubId = bankSubject !== 'all' ? bankSubject : 'bangla1';
            const subMeta = SUBJECT_METADATA.find(s => s.id === currentBankSubId);
            const chList = getStoredChapters(currentBankSubId, currentBankClass);
            const stockCounts = getChapterQuestionCounts(questions, currentBankClass, currentBankSubId);

            return (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📊</span>
                      <span>অধ্যায়ভিত্তিক প্রশ্ন মজুত মনিটর: {subMeta ? subMeta.name : currentBankSubId} ({toBn(currentBankClass)}ম শ্রেণি)</span>
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                      প্রতিটি অধ্যায়ে ১০০+ MCQ, ২০+ CQ ও ৫০+ সংক্ষিপ্ত প্রশ্ন মজুতের বর্তমান অবস্থা ও এক ক্লিকে মজুত পূরণ।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      let totalAdded = 0;
                      let currentList = getStoredQuestions();
                      chList.forEach(ch => {
                        const res = seedChapterStock(currentBankClass, currentBankSubId, subMeta ? subMeta.name : currentBankSubId, ch, { mcq: 100, cq: 20, short: 50 });
                        totalAdded += res.added;
                        currentList = res.updatedList;
                      });
                      setQuestions(currentList);
                      showToast(`সকল অধ্যায়ে মোট ${toBn(totalAdded)}টি নতুন প্রশ্ন স্বয়ংক্রিয়ভাবে মজুত করা হয়েছে!`);
                    }}
                    style={{
                      background: '#047857',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚡</span>
                    <span>সকল অধ্যায়ে ১০০+ MCQ, ২০+ CQ ও ৫০+ সংক্ষিপ্ত মজুত দিয়ে পূরণ করুন</span>
                  </button>
                </div>

                {chList.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {chList.map((ch, idx) => {
                      const counts = stockCounts[ch] || { mcq: 0, cq: 0, short: 0, total: 0 };
                      const mcqOk = counts.mcq >= 100;
                      const cqOk = counts.cq >= 20;
                      const shortOk = counts.short >= 50;

                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                              📖 {ch}
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
                              <span style={{
                                background: mcqOk ? '#dcfce7' : '#fee2e2',
                                color: mcqOk ? '#15803d' : '#b91c1c',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}>
                                MCQ: {toBn(counts.mcq)} / ১০০+ {mcqOk ? '✓' : ''}
                              </span>

                              <span style={{
                                background: cqOk ? '#dcfce7' : '#fee2e2',
                                color: cqOk ? '#15803d' : '#b91c1c',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}>
                                CQ: {toBn(counts.cq)} / ২০+ {cqOk ? '✓' : ''}
                              </span>

                              <span style={{
                                background: shortOk ? '#dcfce7' : '#fee2e2',
                                color: shortOk ? '#15803d' : '#b91c1c',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}>
                                সংক্ষিপ্ত: {toBn(counts.short)} / ৫০+ {shortOk ? '✓' : ''}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setBankSearch(ch.replace(/^\d+[মর্থষ্ঠতম\.\:\-\s]+/, '').trim())}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              📋 প্রশ্ন দেখুন
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenBulkUpload(currentBankSubId, currentBankClass, ch)}
                              style={{
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              📥 আপলোড
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const res = seedChapterStock(currentBankClass, currentBankSubId, subMeta ? subMeta.name : currentBankSubId, ch);
                                setQuestions(res.updatedList);
                                showToast(`'${ch}' অধ্যায়ে নতুন ${toBn(res.added)}টি প্রশ্ন মজুত করা হয়েছে!`);
                              }}
                              style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ⚡ মজুত পূরণ
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>এই বিষয়ের জন্য কোনো নির্দিষ্ট অধ্যায় পাওয়া যায়নি।</div>
                )}
              </div>
            );
          })()}

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
                        background: q.question_type === 'mcq' ? '#e0f2fe' : q.question_type === 'short' ? '#f3e8ff' : '#fef3c7',
                        color: q.question_type === 'mcq' ? '#0369a1' : q.question_type === 'short' ? '#7e22ce' : '#b45309',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {q.question_type === 'mcq' ? 'MCQ' : q.question_type === 'short' ? 'সংক্ষিপ্ত' : 'CQ (সৃজনশীল)'}
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
                  ) : q.question_type === 'short' ? (
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.45 }}>
                        {q.question_bn}
                      </p>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: '#166534', lineHeight: 1.45 }}>
                        <b>উত্তর:</b> {q.correct_answer || q.explanation || 'সংক্ষিপ্ত উত্তর নির্দেশিত।'}
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
                        <option value="short">সংক্ষিপ্ত উত্তর-প্রশ্ন</option>
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
                  ) : newQForm.question_type === 'short' ? (
                    <>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>সংক্ষিপ্ত প্রশ্ন (বাংলায়):</label>
                        <textarea
                          rows={2}
                          placeholder="সংক্ষিপ্ত প্রশ্ন লিখুন..."
                          value={newQForm.question_bn}
                          onChange={e => setNewQForm({ ...newQForm, question_bn: e.target.value })}
                          required
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>আদর্শ উত্তর / তথ্য:</label>
                        <textarea
                          rows={2}
                          placeholder="সংক্ষিপ্ত ও নির্ভুল উত্তর লিখুন..."
                          value={newQForm.sub_q_a}
                          onChange={e => setNewQForm({ ...newQForm, sub_q_a: e.target.value })}
                          required
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>নম্বর (Marks):</label>
                        <input
                          type="number"
                          value={newQForm.marks || 2}
                          onChange={e => setNewQForm({ ...newQForm, marks: Number(e.target.value) })}
                          style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
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
                        {paper.className === '10' ? '১০ম' : paper.className === '9' ? '৯ম' : paper.className === '8' ? '৮ম' : paper.className === '7' ? '৭ম' : '৬ষ্ঠ'} শ্রেণি {paper.department && paper.department !== 'সাধারণ' ? `(${paper.department})` : ''}
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
                title: '৮ম শ্রেণি গণিত পূর্ণাঙ্গ বোর্ড মডেল টেস্ট',
                className: '8',
                subjectId: 'math',
                subjectName: 'গণিত',
                code: '109',
                marks: 100,
                desc: '৪টি বিভাগ (পাটিগণিত, বীজগণিত, জ্যামিতি, তথ্য ও উপাত্ত)-এর সমন্বয়ে ৮টি CQ, ১৫টি সংক্ষিপ্ত প্রশ্ন ও ৩০টি বহুনির্বাচনি।'
              },
              {
                title: '৮ম শ্রেণি সাধারণ বিজ্ঞান পূর্ণাঙ্গ মডেল টেস্ট',
                className: '8',
                subjectId: 'general_science',
                subjectName: 'সাধারণ বিজ্ঞান',
                code: '127',
                marks: 100,
                desc: '৮টি সৃজনশীল (উত্তর ৫টি), ১৫টি সংক্ষিপ্ত প্রশ্ন (উত্তর ১০টি) ও ৩০টি বহুনির্বাচনির বোর্ড স্ট্যান্ডার্ড সমন্বিত পেপার।'
              },
              {
                title: '৮ম শ্রেণি বাংলাদেশ ও বিশ্বপরিচয় মডেল টেস্ট',
                className: '8',
                subjectId: 'bgs',
                subjectName: 'বাংলাদেশ ও বিশ্বপরিচয়',
                code: '150',
                marks: 100,
                desc: 'সৃজনশীল ৫০ নম্বর (৮টি থেকে ৫টি), সংক্ষিপ্ত উত্তর ২০ নম্বর (১৫টি থেকে ১০টি) ও বহুনির্বাচনি ৩০ নম্বর।'
              },
              {
                title: '৮ম শ্রেণি তথ্য ও যোগাযোগ প্রযুক্তি (ICT) মডেল টেস্ট',
                className: '8',
                subjectId: 'ict',
                subjectName: 'তথ্য ও যোগাযোগ প্রযুক্তি',
                code: '154',
                marks: 50,
                desc: 'তত্ত্বীয় ২৫ নম্বর (১৫টি বহুনির্বাচনি ও ৮টি সংক্ষিপ্ত প্রশ্ন থেকে ৫টির উত্তর) এবং ব্যবহারিক ২৫ নম্বর।'
              },
              {
                title: '৮ম শ্রেণি কৃষি শিক্ষা পূর্ণাঙ্গ মডেল টেস্ট',
                className: '8',
                subjectId: 'agriculture',
                subjectName: 'কৃষি শিক্ষা',
                code: '134',
                marks: 50,
                desc: '৫টি সৃজনশীল প্রশ্ন (যেকোনো ৩টি: ৩০ নম্বর) ও ২০টি বহুনির্বাচনি প্রশ্ন (২০ নম্বর) সংবলিত সমন্বিত পেপার।'
              },
              {
                title: '৮ম শ্রেণি শারীরিক শিক্ষা ও স্বাস্থ্য ধারাবাহিক মূল্যায়ন ছক',
                className: '8',
                subjectId: 'physical_edu',
                subjectName: 'শারীরিক শিক্ষা ও স্বাস্থ্য',
                code: '147',
                marks: 50,
                desc: 'শ্রেণির কাজ ২০ নম্বর, অনুসন্ধানী কাজ ১০ নম্বর ও শ্রেণি অভীক্ষা ২০ নম্বরের ধারাবাহিক মূল্যায়ন রেজিস্টার।'
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
                    const fakeSub = { id: m.subjectId, name: m.subjectName, code: m.code };
                    const scheme = getSubjectMarksScheme(fakeSub, m.className);
                    const paper = generateQuestionPaper({
                      examName: m.title,
                      className: m.className,
                      subjectId: m.subjectId,
                      subjectName: m.subjectName,
                      subjectCode: m.code,
                      totalMarks: scheme?.full_marks || m.marks,
                      mcqCount: scheme?.mcq_max !== undefined ? scheme.mcq_max : (m.marks === 50 ? 25 : 25),
                      cqCount: scheme?.cq_count !== undefined ? scheme.cq_count : (m.marks === 50 ? 0 : 8),
                      cqToAnswer: scheme?.cq_to_answer !== undefined ? scheme.cq_to_answer : (m.marks === 50 ? 0 : 5),
                      shortCount: scheme?.short_count || 0,
                      shortToAnswer: scheme?.short_to_answer || 0,
                      shortMarks: scheme?.short_max || 0,
                      practicalMarks: scheme?.practical_max || 0,
                      pattern: scheme?.pattern,
                      cqRule: scheme?.cq_rule,
                      shortRule: scheme?.short_rule,
                      mcqRule: scheme?.mcq_rule,
                      practicalRule: scheme?.practical_rule,
                      descriptiveRule: scheme?.descriptive_rule
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

      {/* ========================================================= */}
      {/* MODAL 1: CHAPTER NUMBER & NAME EDITOR                     */}
      {/* ========================================================= */}
      {isChapterEditorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
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
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  ✏️ অধ্যায় নং ও নাম কাস্টমাইজেশন ও এডিট
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  শ্রেণি: <b>{toBn(genClass)}ম শ্রেণি</b> • বিষয়: <b>{currentSubject?.name}</b> (কোড: {toBn(currentSubject?.code)})
                </p>
              </div>
              <button
                onClick={() => setIsChapterEditorOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
              💡 <b>পরামর্শ:</b> আপনার বিদ্যালয় বা পরীক্ষার সিলেবাস অনুযায়ী যেকোনো অধ্যায়ের নম্বর বা নাম পরিবর্তন করুন। নতুন অধ্যায় যোগ করতে নিচের <b>“+ নতুন অধ্যায় যোগ করুন”</b> বাটনে ক্লিক করুন। সংরক্ষিত অধ্যায়গুলো প্রশ্ন নির্বাচনের ফিল্টারে সরাসরি প্রদর্শিত হবে।
            </div>

            {/* Chapters Input List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {editingChapters.map((ch, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '28px', color: '#475569', textAlign: 'center' }}>
                    {toBn(idx + 1)}.
                  </span>
                  <input
                    type="text"
                    value={ch}
                    onChange={(e) => {
                      const updated = [...editingChapters];
                      updated[idx] = e.target.value;
                      setEditingChapters(updated);
                    }}
                    placeholder={`যেমন: ${toBn(idx + 1)}ম অধ্যায়: অধ্যায়ের নাম`}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#fff'
                    }}
                  />
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      if (idx === 0) return;
                      const updated = [...editingChapters];
                      const temp = updated[idx];
                      updated[idx] = updated[idx - 1];
                      updated[idx - 1] = temp;
                      setEditingChapters(updated);
                    }}
                    title="উপরে নিন"
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: idx === 0 ? '#f1f5f9' : '#fff',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      color: idx === 0 ? '#94a3b8' : '#334155'
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === editingChapters.length - 1}
                    onClick={() => {
                      if (idx === editingChapters.length - 1) return;
                      const updated = [...editingChapters];
                      const temp = updated[idx];
                      updated[idx] = updated[idx + 1];
                      updated[idx + 1] = temp;
                      setEditingChapters(updated);
                    }}
                    title="নিচে নিন"
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: idx === editingChapters.length - 1 ? '#f1f5f9' : '#fff',
                      cursor: idx === editingChapters.length - 1 ? 'not-allowed' : 'pointer',
                      color: idx === editingChapters.length - 1 ? '#94a3b8' : '#334155'
                    }}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = editingChapters.filter((_, i) => i !== idx);
                      setEditingChapters(updated);
                    }}
                    title="মুছে ফেলুন"
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Chapter Button */}
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  const nextNum = editingChapters.length + 1;
                  setEditingChapters([...editingChapters, `${toBn(nextNum)}ম অধ্যায়: নতুন পাঠ/বিষয়`]);
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px dashed #047857',
                  color: '#047857',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <span>➕</span>
                <span>নতুন অধ্যায় যোগ করুন</span>
              </button>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('আপনি কি এই বিষয়ের অধ্যায়গুলো NCTB প্রমিত ডিফল্ট সিলেবাসে রিসেট করতে চান?')) {
                    const res = resetCustomChapters(genSubjectId, genClass);
                    setEditingChapters([...res]);
                    setChaptersVersion(v => v + 1);
                    showToast('NCTB প্রমিত অধ্যায় তালিকা পুনরুদ্ধার হয়েছে!');
                  }
                }}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ↺ NCTB ডিফল্ট পুনরুদ্ধার
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsChapterEditorOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const valid = editingChapters.filter(ch => ch && ch.trim());
                    saveCustomChapters(genSubjectId, genClass, valid);
                    setChaptersVersion(v => v + 1);
                    setGenSelectedChapters(prev => prev.filter(c => valid.includes(c)));
                    setIsChapterEditorOpen(false);
                    showToast('অধ্যায় তালিকা সফলভাবে সংরক্ষণ করা হয়েছে!');
                  }}
                  style={{
                    background: '#047857',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  💾 পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CHAPTER-WISE BULK QUESTION UPLOADER & GUIDE      */}
      {/* ========================================================= */}
      {isBulkUploadOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
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
            maxWidth: '840px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📥</span> অধ্যায়ভিত্তিক প্রশ্ন আপলোড ও নির্দেশিকা
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  প্রতিটি শ্রেণির প্রতিটি বিষয়ের অধ্যায়ভিত্তিক বহুনির্বাচনি ও সৃজনশীল প্রশ্ন সহজে আপলোড করুন।
                </p>
              </div>
              <button
                onClick={() => setIsBulkUploadOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs: Upload vs Instructions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => setBulkUploadTab('upload')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: bulkUploadTab === 'upload' ? '3px solid #047857' : '3px solid transparent',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  color: bulkUploadTab === 'upload' ? '#047857' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                📤 প্রশ্ন আপলোড করুন
              </button>
              <button
                type="button"
                onClick={() => setBulkUploadTab('guide')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: bulkUploadTab === 'guide' ? '3px solid #047857' : '3px solid transparent',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  color: bulkUploadTab === 'guide' ? '#047857' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                📖 কীভাবে আপলোড করবেন? (পূর্ণাঙ্গ নির্দেশিকা)
              </button>
            </div>

            {/* TAB CONTENT: UPLOAD */}
            {bulkUploadTab === 'upload' ? (
              <div>
                {/* Selectors Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  {/* Class */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      ১. শ্রেণি নির্বাচন:
                    </label>
                    <select
                      value={bulkClass}
                      onChange={e => {
                        setBulkClass(e.target.value);
                        const chs = getStoredChapters(bulkSubject, e.target.value);
                        setBulkChapter(chs[0] || '');
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
                    >
                      <option value="6">৬ষ্ঠ শ্রেণি</option>
                      <option value="7">৭ম শ্রেণি</option>
                      <option value="8">৮ম শ্রেণি</option>
                      <option value="9">৯ম শ্রেণি</option>
                      <option value="10">১০ম শ্রেণি</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      ২. বিষয় নির্বাচন:
                    </label>
                    <select
                      value={bulkSubject}
                      onChange={e => {
                        setBulkSubject(e.target.value);
                        const chs = getStoredChapters(e.target.value, bulkClass);
                        setBulkChapter(chs[0] || '');
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
                    >
                      {SUBJECT_METADATA.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({toBn(s.code)})</option>
                      ))}
                    </select>
                  </div>

                  {/* Question Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      ৩. প্রশ্নের ধরন:
                    </label>
                    <select
                      value={bulkType}
                      onChange={e => {
                        setBulkType(e.target.value);
                        handleLoadSampleText(e.target.value);
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
                    >
                      <option value="mcq">বহুনির্বাচনি (MCQ)</option>
                      <option value="cq">সৃজনশীল (CQ)</option>
                      <option value="short">সংক্ষিপ্ত-উত্তর প্রশ্ন (Short)</option>
                    </select>
                  </div>

                  {/* Chapter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      ৪. অধ্যায় নির্বাচন:
                    </label>
                    <select
                      value={bulkChapter}
                      onChange={e => setBulkChapter(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
                    >
                      {getStoredChapters(bulkSubject, bulkClass).map((ch, idx) => (
                        <option key={idx} value={ch}>{ch}</option>
                      ))}
                      <option value="__custom__">➕ নতুন অধ্যায়ের নাম লিখুন...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Chapter Name Input if selected */}
                {bulkChapter === '__custom__' && (
                  <div style={{ marginBottom: '14px', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                      নতুন অধ্যায় নং ও নাম টাইপ করুন:
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ১ম অধ্যায়: নতুন পাঠের শিরোনাম"
                      value={bulkCustomChapter}
                      onChange={e => setBulkCustomChapter(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    />
                  </div>
                )}

                {/* Input Text Area Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    প্রশ্ন ইনপুট বা পেস্ট করুন (বাংলা টেক্সট অথবা JSON):
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleText(bulkType)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontSize: '11.5px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      📋 নমুনা লোড করুন
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSampleJson}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontSize: '11.5px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      📥 নমুনা JSON ডাউনলোড
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={bulkRawText}
                  onChange={e => setBulkRawText(e.target.value)}
                  placeholder="এখানে আপনার প্রশ্ন পেস্ট করুন..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    fontFamily: 'monospace, sans-serif',
                    lineHeight: 1.5,
                    marginBottom: '12px',
                    background: '#fff'
                  }}
                />

                {/* File Upload Option */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '12px' }}>
                  <span>অথবা ফাইল থেকে সরাসরি লোড করতে চান?</span>
                  <label style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}>
                    📁 ফাইল সিলেক্ট করুন (.json / .txt)
                    <input
                      type="file"
                      accept=".json,.txt"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setBulkRawText(ev.target?.result || '');
                            showToast(`ফাইল "${file.name}" সফলভাবে লোড হয়েছে! এবার “পার্স ও প্রিভিউ দেখুন” এ ক্লিক করুন।`);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Parse Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleParseQuestions}
                    style={{
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔍</span>
                    <span>পার্স ও প্রিভিউ দেখুন (Parse & Preview)</span>
                  </button>
                </div>

                {/* Parsed Preview Cards */}
                {parsedBulkQuestions.length > 0 && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <b style={{ fontSize: '13.5px', color: '#065f46' }}>
                        ✅ {toBn(parsedBulkQuestions.length)}টি প্রশ্ন সফলভাবে সনাক্ত হয়েছে:
                      </b>
                      <span style={{ fontSize: '11.5px', color: '#047857' }}>
                        অধ্যায়: {parsedBulkQuestions[0]?.chapter}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                      {parsedBulkQuestions.map((pq, pIdx) => (
                        <div key={pIdx} style={{ background: '#fff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                            {toBn(pIdx + 1)}. {pq.question_bn || pq.stimulus}
                          </div>
                          {pq.options && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                              {pq.options.map((opt, oIdx) => (
                                <span key={oIdx} style={{ fontWeight: pq.correct_index === oIdx ? 800 : 400, color: pq.correct_index === oIdx ? '#047857' : '#475569' }}>
                                  ({['ক', 'খ', 'গ', 'ঘ'][oIdx]}) {opt} {pq.correct_index === oIdx && '✓'}
                                </span>
                              ))}
                            </div>
                          )}
                          {pq.sub_questions && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', marginTop: '4px' }}>
                              {pq.sub_questions.map((sub, sIdx) => (
                                <span key={sIdx}><b>({sub.label})</b> {sub.text} [{toBn(sub.marks)}]</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setIsBulkUploadOpen(false)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBulkUploadedQuestions}
                    disabled={parsedBulkQuestions.length === 0}
                    style={{
                      background: parsedBulkQuestions.length > 0 ? '#047857' : '#94a3b8',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 22px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: parsedBulkQuestions.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    💾 সকল প্রশ্ন প্রশ্নভাণ্ডারে সংরক্ষণ করুন ({toBn(parsedBulkQuestions.length)})
                  </button>
                </div>
              </div>
            ) : (
              /* TAB CONTENT: STEP-BY-STEP GUIDE */
              <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.7 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#166534' }}>
                    📌 অধ্যায়ভিত্তিক প্রশ্ন আপলোড করার সহজ ৫টি ধাপ:
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><b>ধাপ ১ (শ্রেণি ও বিষয়):</b> ওপরের ড্রপডাউন থেকে আপনার কাঙ্ক্ষিত শ্রেণি (৬ষ্ঠ থেকে ১০ম) ও বিষয় নির্বাচন করুন।</li>
                    <li><b>ধাপ ২ (অধ্যায় নির্বাচন):</b> যে অধ্যায়ের জন্য প্রশ্ন আপলোড করছেন তা নির্বাচন করুন। প্রয়োজনে “+ নতুন অধ্যায় লিখুন” বেছে নিয়ে নতুন অধ্যায় তৈরি করতে পারেন।</li>
                    <li><b>ধাপ ৩ (প্রশ্নের ধরন):</b> MCQ, সৃজনশীল (CQ) বা সংক্ষিপ্ত প্রশ্ন নির্বাচন করুন।</li>
                    <li><b>ধাপ ৪ (টেক্সট পেস্ট বা ফাইল):</b> নিচের নিয়ম অনুযায়ী টেক্সট পেস্ট করে “পার্স ও প্রিভিউ দেখুন” বাটনে ক্লিক করুন।</li>
                    <li><b>ধাপ ৫ (সংরক্ষণ):</b> প্রিভিউ সঠিক থাকলে “সকল প্রশ্ন সংরক্ষণ করুন” এ ক্লিক করলেই প্রশ্নভাণ্ডারে যুক্ত হয়ে যাবে।</li>
                  </ol>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  📝 বিভিন্ন ধরনের প্রশ্নের লেখার নিয়ম (Format Specifications):
                </h4>

                {/* MCQ Format Guide */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                  <b style={{ color: '#047857', fontSize: '13.5px' }}>১. বহুনির্বাচনি প্রশ্ন (MCQ) লেখার নিয়ম:</b>
                  <p style={{ margin: '4px 0 8px', fontSize: '12px', color: '#64748b' }}>
                    প্রশ্ন লিখে পরবর্তী লাইনে ৪টি বিকল্প (ক, খ, গ, ঘ) এবং নিচে উত্তর লিখুন। একাধিক প্রশ্নের মাঝে ১টি ফাঁকা লাইন বা ‘---’ দিন।
                  </p>
                  <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: 0 }}>
{`১. তথ্য ও যোগাযোগ প্রযুক্তির প্রধান উপকরণ কোনটি?
(ক) রেডিও
(খ) টেলিভিশন
(গ) কম্পিউটার
(ঘ) ক্যামেরা
উত্তর: গ
ব্যাখ্যা: কম্পিউটার আধুনিক তথ্যপ্রযুক্তির মূল কেন্দ্র।`}
                  </pre>
                </div>

                {/* CQ Format Guide */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                  <b style={{ color: '#047857', fontSize: '13.5px' }}>২. সৃজনশীল প্রশ্ন (CQ) লেখার নিয়ম:</b>
                  <p style={{ margin: '4px 0 8px', fontSize: '12px', color: '#64748b' }}>
                    ‘উদ্দীপক:’ দিয়ে ঘটনা লিখুন এবং পরবর্তী লাইনে ক, খ, গ, ঘ উপ-প্রশ্ন ও বন্ধনীতে [১, ২, ৩, ৪] নম্বর লিখুন।
                  </p>
                  <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: 0 }}>
{`উদ্দীপক: কৃষক জয়নাল মিয়া মাটির স্বাস্থ্য সুরক্ষায় উপজেলা কৃষি কর্মকর্তার পরামর্শে দোআঁশ মাটিতে ইউরিয়া ও সবুজ সার প্রয়োগ করলেন।
ক) মাটির pH কী? [১]
খ) জৈব সারকে মাটির প্রাণ বলা হয় কেন? [২]
গ) জয়নাল মিয়ার সবুজ সার তৈরির বৈজ্ঞানিক উপায় ব্যাখ্যা কর। [৩]
ঘ) টেকসই ফসল উৎপাদনে জয়নাল মিয়ার গৃহীত পদক্ষেপের কার্যকারিতা মূল্যায়ন কর। [৪]`}
                  </pre>
                </div>

                {/* Short Question Guide */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                  <b style={{ color: '#047857', fontSize: '13.5px' }}>৩. সংক্ষিপ্ত-উত্তর প্রশ্ন লেখার নিয়ম:</b>
                  <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: '6px 0 0' }}>
{`প্রশ্ন: ইনপুট ও আউটপুট ডিভাইসের প্রধান পার্থক্য কী?
উত্তর: ইনপুট ডিভাইস তথ্য গ্রহণ করে এবং আউটপুট ডিভাইস ফলাফল প্রদর্শন করে।`}
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setBulkUploadTab('upload')}
                    style={{ background: '#047857', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    এবার প্রশ্ন আপলোড করতে যান &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default QuestionBankPanel;
