// frontend/src/CurriculumLessonSlidePipeline.jsx
// মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় - পাঠ্যক্রম এআই প্রম্পট জেনারেটর, লেসন প্ল্যান ও ১৮-স্লাইড PPTX মেকার
// Seamless Multi-tier Pipeline: Cascading Selectors -> Master Prompts -> NCTB Lesson Plan -> 18-Slide Native PPTX

import React, { useState, useEffect } from 'react';
import { CURRICULUM_DATA } from './curriculumData';
import { downloadLessonPresentationPPTX } from './pptxGenerator';

export default function CurriculumLessonSlidePipeline({ userRole, initialClass = '10', onNavigate }) {
  // Cascading Form State
  const [selectedClass, setSelectedClass] = useState(initialClass || '10');
  const classObj = CURRICULUM_DATA[selectedClass] || CURRICULUM_DATA['10'];
  const subjectKeys = Object.keys(classObj.subjects || {});

  const [selectedSubject, setSelectedSubject] = useState(subjectKeys[0] || 'পদার্থবিজ্ঞান (বিজ্ঞান)');
  const currentSubjectObj = classObj.subjects[selectedSubject] || Object.values(classObj.subjects)[0];

  const [selectedChapter, setSelectedChapter] = useState(
    currentSubjectObj?.chapters?.[0]?.name || '১ম অধ্যায়'
  );
  const [topic, setTopic] = useState(
    currentSubjectObj?.chapters?.[0]?.default_topic || 'গতির ৪টি সমীকরণ প্রতিপাদন ও বাস্তব প্রয়োগ'
  );

  const [duration, setDuration] = useState('৪৫ মিনিট');
  const [studentCount, setStudentCount] = useState(50);
  const [teacherName, setTeacherName] = useState('মুহাম্মদ আবুবকর সিদ্দিক');
  const [teacherDesignation, setTeacherDesignation] = useState('সহকারী শিক্ষক (আইসিটি ও বিজ্ঞান)');
  const [schoolName, setSchoolName] = useState('মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়');

  // AI Generation Engine State
  const [aiEngine, setAiEngine] = useState('built_in'); // 'built_in' | 'gemini_api'
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('magra_gemini_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Active Output View Tab: 'slides' | 'lesson_plan' | 'prompts'
  const [activeViewTab, setActiveViewTab] = useState('slides');

  // Slide Carousel State (1 to 18)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Sync Subject when Class changes
  useEffect(() => {
    const newClassObj = CURRICULUM_DATA[selectedClass] || CURRICULUM_DATA['10'];
    const newSubjects = Object.keys(newClassObj.subjects || {});
    if (!newSubjects.includes(selectedSubject)) {
      const firstSub = newSubjects[0] || '';
      setSelectedSubject(firstSub);
      const subObj = newClassObj.subjects[firstSub];
      if (subObj?.chapters?.length) {
        setSelectedChapter(subObj.chapters[0].name);
        setTopic(subObj.chapters[0].default_topic || '');
      }
    }
  }, [selectedClass]);

  // Sync Chapter and Topic when Subject changes
  const handleSubjectChange = (newSub) => {
    setSelectedSubject(newSub);
    const subObj = classObj.subjects[newSub];
    if (subObj?.chapters?.length) {
      setSelectedChapter(subObj.chapters[0].name);
      setTopic(subObj.chapters[0].default_topic || '');
    }
  };

  const handleChapterChange = (newChap) => {
    setSelectedChapter(newChap);
    const found = currentSubjectObj?.chapters?.find(c => c.name === newChap);
    if (found?.default_topic) {
      setTopic(found.default_topic);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Helper: Build Group Distribution based on student count
  const calculateGroups = (total) => {
    const count = parseInt(total, 10) || 50;
    const size = count > 55 ? 6 : count > 35 ? 5 : 4;
    const numGroups = Math.ceil(count / size);
    const groupNames = ['পদ্মা', 'মেঘনা', 'যমুনা', 'সুরমা', 'কর্ণফুলী', 'তিস্তা', 'ব্রহ্মপুত্র', 'মধুমতি', 'রূপসা', 'শীতলক্ষ্যা'];
    return {
      count,
      size,
      numGroups,
      groups: groupNames.slice(0, numGroups)
    };
  };

  // Helper: Dynamic Master Lesson Plan Builder
  const buildLessonPlan = () => {
    const grp = calculateGroups(studentCount);
    return `দৈনিক পাঠ পরিকল্পনা (Daily Lesson Plan) — NCTB জাতীয় শিক্ষাক্রম
========================================================================
প্রতিষ্ঠান: ${schoolName}
শ্রেণি: ${selectedClass}ম শ্রেণি | বিষয়: ${selectedSubject}
অধ্যায়: ${selectedChapter}
আজকের পাঠের শিরোনাম: ${topic}
শ্রেণিতে শিক্ষার্থীর সংখ্যা: ${studentCount} জন | শ্রেণি ব্যবস্থা: ${grp.numGroups}টি দল (${grp.size} জন করে)
সময়কাল: ${duration} | তারিখ: ${new Date().toLocaleDateString('bn-BD')}
পাঠ পরিচালনায়: ${teacherName} (${teacherDesignation})
------------------------------------------------------------------------

১. শিখনফল (Learning Outcomes — ৩টি নির্দিষ্ট স্তর):
   ক. জ্ঞানমূলক: পাঠ শেষে শিক্ষার্থীরা "${topic}" এর প্রমিত সংজ্ঞা, মূল উপাদান ও পরিভাষা ব্যাখ্যা করতে পারবে।
   খ. দক্ষতামূলক: শিক্ষার্থীরা এর মূল চিত্র, প্রক্রিয়া ও তাত্ত্বিক নিয়মের বাস্তব ছক/সমীকরণ খাতায় অঙ্কন ও সমাধান করতে পারবে।
   গ. প্রয়োগমূলক: শিক্ষার্থীরা বাস্তব জীবনে এর উপযোগিতা বিশ্লেষণ করে দলীয় কাজের মাধ্যমে সমস্যা সমাধানে সফলভাবে প্রয়োগ করতে পারবে।

২. প্রয়োজনীয় শিখন-শেখানো উপকরণ:
   • মাল্টিমিডিয়া প্রজেক্টর, স্মার্টবোর্ড / হোয়াইটবোর্ড ও রঙিন মার্কার
   • পাঠ্যপুস্তক (NCTB কারিকুলাম), সংশ্লিষ্ট চিত্র চার্ট ও ডেমো ওয়ার্কশিট

৩. শ্রেণি কার্যক্রমে সময়বণ্টন ও ধারাবাহিক স্তরসমূহ (${duration}):

   ধাপ ১: প্রারম্ভিক প্রস্তুতি ও পূর্বজ্ঞান যাচাই / ব্রেনস্টর্মিং (৫ মিনিট):
   • কুশলাদি বিনিময় ও শ্রেণিকক্ষের শৃঙ্খলা নিশ্চিতকরণ (১ মিনিট)।
   • স্লাইড ১-এর মাধ্যমে শিক্ষার্থীদের আন্তরিক স্বাগত জানানো এবং স্লাইড ৩-এর ব্রেনস্টর্মিং প্রশ্ন করে মনোযোগ আকর্ষণ (৪ মিনিট)।
   • পাঠের শিরোনাম বোর্ডে লিখে স্লাইড ৪-এর ৩টি শিখনফল শিক্ষার্থীদের মুখে একবার পাঠ করানো।

   ধাপ ২: মূল পাঠ উপস্থাপন ও ধারাবাহিক ব্যাখ্যা (১৫ মিনিট):
   • স্লাইড ৫ ও ৬: প্রজেক্টরে দৃশ্যমান করে মূল ধারণার সংজ্ঞা ও বিশদ চিত্রভিত্তিক উপাদান বিশ্লেষণ।
   • স্লাইড ৭ ও ৮: সংশ্লিষ্ট নিয়মাবলী, গাণিতিক সূত্র ও ধারাবাহিক পদক্ষেপের সহজ অ্যানালজি সহ বোর্ডে উপস্থাপন।
   • স্লাইড ৯ ও ১০: বাস্তব জীবনের উদাহরণ ও কেস স্টাডির মাধ্যমে শিক্ষার্থীদের সাথে মিথস্ক্রিয়া।

   ধাপ ৩: শিক্ষার্থী সক্রিয়তা — একক ও দলগত কাজ (১৫ মিনিট):
   • একক কাজ (৩ মিনিট): স্লাইড ১১ প্রদর্শন। শিক্ষার্থীরা নিজে চিন্তা করে খাতায় মূল সংজ্ঞা ও ১টি উদাহরণ লিখবে।
   • দলগত কাজ (১২ মিনিট): স্লাইড ১২ প্রদর্শন।
     শ্রেণির ${studentCount} জন শিক্ষার্থীকে ${grp.numGroups}টি দলে ভাগ করা হলো (${grp.groups.join(', ')} দল)।
     - পদ্মা ও মেঘনা দল: এর প্রধান সুবিধা ও গুরুত্বের তালিকা তৈরি।
     - যমুনা ও সুরমা দল: বাস্তব প্রয়োগের ডায়াগ্রাম ও চিত্রাঙ্কন।
     - অন্যান্য দল: সম্ভাব্য চ্যালেঞ্জ ও সমাধানের উপায় চিহ্নিতকরণ।
     শিক্ষক প্রতিটি দলে ঘুরে নিবিড়ভাবে পর্যবেক্ষণ ও গাইড করবেন।

   ধাপ ৪: দলীয় কাজের উপস্থাপন ও মূল্যায়ন (৭ মিনিট):
   • স্লাইড ১৩: প্রতিটি দলের দলনেতা ১ মিনিটে তাদের সমাধান উপস্থাপন করবে এবং শিক্ষক ইতিবাচক ফিডব্যাক দেবেন।
   • স্লাইড ১৪ ও ১৫: মৌখিক প্রশ্ন ও স্ক্রিনের বহুনির্বাচনী (MCQ) কুইজের মাধ্যমে শিখন যাচাই।

   ধাপ ৫: সারসংক্ষেপ ও বাড়ির কাজ (৩ মিনিট):
   • স্লাইড ১৬: আজকের পাঠের ৩টি মূল টেক-অ্যাওয়ে পয়েন্ট পুনরাবৃত্তি।
   • স্লাইড ১৭: সৃজনশীল বাড়ির কাজ লিখে দেওয়া।
   • স্লাইড ১৮: ধন্যবাদ জানিয়ে ক্লাসের সমাপ্তি ঘোষণা।

------------------------------------------------------------------------
শিক্ষকের স্বাক্ষর: .......................          প্রধান শিক্ষক: .......................`;
  };

  // Helper: Master Pedagogical Prompts
  const buildPrompts = () => {
    const grp = calculateGroups(studentCount);
    const lessonPlanPrompt = `আপনি একজন অভিজ্ঞ জাতীয় শিক্ষাক্রম (NCTB) বিশেষজ্ঞ ও মাস্টার ট্রেইনার শিক্ষক। 
নিচের তথ্যের ভিত্তিতে একটি অত্যন্ত মানসম্মত, আধুনিক ও শিক্ষার্থীকেন্দ্রিক বিস্তারিত "দৈনিক পাঠ পরিকল্পনা" (Lesson Plan) তৈরি করে দিন:

- শিক্ষা প্রতিষ্ঠান: ${schoolName}
- শ্রেণি: ${selectedClass}ম শ্রেণি
- বিষয়: ${selectedSubject}
- অধ্যায়: ${selectedChapter}
- আজকের পাঠের শিরোনাম: ${topic}
- ক্লাসের মোট সময়: ${duration}
- শ্রেণিতে শিক্ষার্থীর সংখ্যা: ${studentCount} জন (শিক্ষার্থীদের ${grp.size} জন করে মোট ${grp.numGroups}টি দলে ভাগ করে ইন্টারঅ্যাক্টিভ অ্যাক্টিভিটি ডিজাইন করবেন)
- শিক্ষকের নাম ও পদবি: ${teacherName}, ${teacherDesignation}

লেসন প্ল্যানে অবশ্যই যা যা অন্তর্ভুক্ত থাকতে হবে:
১. ৩টি সুনির্দিষ্ট শিখনফল (ক. জ্ঞানমূলক, খ. দক্ষতামূলক, গ. প্রয়োগমূলক)
২. আকর্ষণীয় ব্রেনস্টর্মিং প্রশ্ন ও বাস্তব জীবনের অ্যানালজি
৩. ৫টি স্পষ্ট সময়বিভাজন ধাপ (প্রারম্ভিক ৫ মিনিট, উপস্থাপন ১৫ মিনিট, দলগত কাজ ১৫ মিনিট, মূল্যায়ন ৭ মিনিট, বাড়ির কাজ ৩ মিনিট)
৪. ${studentCount} জন শিক্ষার্থীর জন্য গ্রুপ ওয়ার্কের সুনির্দিষ্ট কর্মপরিকল্পনা
৫. শ্রেণিকক্ষ মূল্যায়নের জন্য ৩টি মৌখিক প্রশ্ন ও ১টি বাস্তবধর্মী সৃজনশীল বাড়ির কাজ।
সম্পূর্ণ লেসন প্ল্যানটি প্রাতিষ্ঠানিক ও আনুষ্ঠানিক বাংলা ভাষায় প্রস্তুত করুন।`;

    const pptxPrompt = `You are an elite educational multimedia presentation designer. 
Create a complete, comprehensive 18-SLIDE presentation script for a high-school multimedia classroom (NCTB Standards).

CLASS DETAILS:
- School: ${schoolName}
- Class: Grade ${selectedClass} (${selectedClass}ম শ্রেণি)
- Subject: ${selectedSubject}
- Chapter: ${selectedChapter}
- Today's Topic: ${topic}
- Duration: ${duration}
- Students Count: ${studentCount} students (${grp.numGroups} collaborative groups of ${grp.size})
- Teacher: ${teacherName} (${teacherDesignation})

SLIDE STRUCTURE REQUIREMENTS (STRICT 18 SLIDES):
- Slide 1: Welcome Slide with topic visual graphics, greeting animation & warm classroom welcome ("আজকের মাল্টিমিডিয়া ক্লাসে সবাইকে স্বাগতম! 🌸✨")
- Slide 2: Profile Slide — Class, Subject, Chapter, Topic, School Name & Teacher's Profile
- Slide 3: Brainstorming & Hook — 2 real-world trigger questions & visual prompt to spark curiosity
- Slide 4: Topic Announcement & 3 Specific Learning Outcomes (Cognitive, Skill, Application)
- Slide 5: Core Concept & Formal Definition
- Slide 6: Detailed Breakdown & Key Visual Components
- Slide 7: Scientific Laws, Formulas, Rules or In-Depth Principles
- Slide 8: Step-by-Step Procedure & Flowchart
- Slide 9: Real-world Applications & Daily Life Significance
- Slide 10: Case Study & Everyday Practical Problem Solving
- Slide 11: Individual Task (2-minute quiet reflection & notebook check)
- Slide 12: Group Activity (Tailored for ${studentCount} students in ${grp.numGroups} groups with specific assigned roles)
- Slide 13: Group Presentation, Findings & Teacher Feedback
- Slide 14: Formative Assessment — 3 Oral & Short Evaluation Questions
- Slide 15: Interactive Multiple Choice Question (MCQ) with Instant Answer Reveal
- Slide 16: Summary & Key Takeaways Recap
- Slide 17: Creative Homework & Exploration Assignment
- Slide 18: Thank You & Motivational Closing Quote for Next Class

Generate the exact slide titles, bullet points, teacher talking notes, and design layout guidelines in clean Bengali so it can be directly exported to PowerPoint or Gamma.app.`;

    return { lessonPlanPrompt, pptxPrompt };
  };

  // 18 Slides Visual Data for Interactive Previewer
  const build18SlidesData = () => {
    const grp = calculateGroups(studentCount);
    return [
      {
        number: 1,
        title: '🌸 ডিজিটাল মাল্টিমিডিয়া ক্লাসে সবাইকে স্বাগতম',
        type: 'স্বাগত স্লাইড',
        badge: 'মাল্টিমিডিয়া ক্লাস সূচনা',
        color: '#075c3a',
        content: (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>🌸✨🎓</div>
            <h2 style={{ fontSize: '26px', color: '#075c3a', margin: '0 0 10px', fontWeight: 800 }}>
              আজকের মাল্টিমিডিয়া ক্লাসে সবাইকে স্বাগতম!
            </h2>
            <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', marginBottom: '15px' }}>
              📚 বিষয়: {selectedSubject} • অধ্যায়: {selectedChapter}
            </div>
            <div style={{ background: '#f8fafc', border: '2px solid #86efac', borderRadius: '12px', padding: '16px', maxWidth: '580px', margin: '0 auto' }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>আজকের পাঠের মূল কেন্দ্রবিন্দু:</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{topic}</div>
            </div>
            <div style={{ marginTop: '16px', color: '#475569', fontSize: '13px', fontWeight: 600 }}>
              🏫 {schoolName}
            </div>
          </div>
        )
      },
      {
        number: 2,
        title: '🏛️ শ্রেণি ও বিষয় পরিচিতি',
        type: 'পরিচিতি পর্ব',
        badge: 'শিক্ষক ও পাঠ পরিচিতি',
        color: '#0284c7',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '10px 0' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#15803d', fontSize: '16px' }}>👨‍🏫 শিক্ষক পরিচিতি</h4>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>নাম:</b> {teacherName}</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>পদবি:</b> {teacherDesignation}</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>প্রতিষ্ঠান:</b> {schoolName}</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>যোগাযোগ:</b> অত্র বিদ্যালয় কার্যালয়</p>
            </div>
            <div style={{ background: '#f0f9ff', border: '1.5px solid #7dd3fc', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#0369a1', fontSize: '16px' }}>📖 পাঠ পরিচিতি</h4>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>শ্রেণি:</b> {selectedClass}ম শ্রেণি</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>বিষয়:</b> {selectedSubject}</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>অধ্যায়:</b> {selectedChapter}</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>আজকের পাঠ:</b> {topic}</p>
              <p style={{ margin: '6px 0', fontSize: '13.5px' }}><b>সময়:</b> {duration} | <b>শিক্ষার্থী:</b> {studentCount} জন</p>
            </div>
          </div>
        )
      },
      {
        number: 3,
        title: '🤔 ব্রেনস্টর্মিং ও পূর্বজ্ঞান যাচাই',
        type: 'মনোযোগ আকর্ষণ',
        badge: 'Hook / Warm-up',
        color: '#d97706',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <b style={{ color: '#b45309', fontSize: '15px' }}>১. দৈনন্দিন জীবনের সাথে মিল খোঁজা:</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#78350f' }}>
                আমরা প্রাত্যহিক জীবনে "{topic}" সংক্রান্ত কোনো ঘটনা বা উপকরণ কি কখনো লক্ষ্য করেছি?
              </p>
            </div>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <b style={{ color: '#0369a1', fontSize: '15px' }}>২. পূর্ববর্তী অভিজ্ঞতার স্মৃতিচারণ:</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#0c4a6e' }}>
                পূর্ববর্তী শ্রেণিতে এই বিষয়ের প্রাথমিক কোনো সূত্র বা ধারণা আপনাদের মনে আছে কি?
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
              <b style={{ color: '#15803d', fontSize: '15px' }}>৩. কৌতূহলোদ্দীপক চিন্তা:</b>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#14532d' }}>
                এটি যদি সঠিকভাবে কাজ না করত, তবে আমাদের চারপাশের পরিবেশে কী সমস্যা তৈরি হতো?
              </p>
            </div>
          </div>
        )
      },
      {
        number: 4,
        title: '🎯 পাঠের শিরোনাম ঘোষণা ও ৩টি শিখনফল',
        type: 'শিখনফল',
        badge: 'NCTB Learning Outcomes',
        color: '#4f46e5',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#4f46e5', color: '#fff', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', marginBottom: '14px', fontWeight: 800, fontSize: '16px' }}>
              পাঠের শিরোনাম: "{topic}"
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '12px', borderRadius: '8px' }}>
                <b style={{ color: '#92400e' }}>১. জ্ঞানমূলক শিখনফল:</b>
                <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: '#78350f' }}>
                  {topic} এর সঠিক সংজ্ঞা, মূল পরিভাষা ও মৌলিক নীতি স্পষ্ট ভাষায় বলতে পারবে।
                </p>
              </div>
              <div style={{ background: '#e0f2fe', border: '1px solid #7dd3fc', padding: '12px', borderRadius: '8px' }}>
                <b style={{ color: '#0369a1' }}>২. দক্ষতামূলক শিখনফল:</b>
                <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: '#0c4a6e' }}>
                  এর মূল উপাদান, চিত্র/গ্রাফ ও তাত্ত্বিক সূত্রের বিশ্লেষণ খাতায় নিখুঁতভাবে অঙ্কন ও সমাধান করতে পারবে।
                </p>
              </div>
              <div style={{ background: '#ecfdf5', border: '1px solid #86efac', padding: '12px', borderRadius: '8px' }}>
                <b style={{ color: '#15803d' }}>৩. প্রয়োগমূলক শিখনফল:</b>
                <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: '#14532d' }}>
                  বাস্তব জীবনে এর উপযোগিতা অনুধাবন করে দলগত কাজের মাধ্যমে বাস্তব সমস্যা সমাধানে সফল প্রয়োগ ঘটাতে পারবে।
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        number: 5,
        title: '💡 মূল ধারণার সূচনা ও প্রমিত সংজ্ঞা',
        type: 'মৌলিক ধারণা',
        badge: 'Core Concept',
        color: '#087248',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
              <b style={{ color: '#15803d', fontSize: '15px' }}>প্রমিত সংজ্ঞা:</b>
              <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: '1.7', color: '#1f2937' }}>
                "{topic}" হলো এমন একটি শিক্ষণীয় তাত্ত্বিক ও ব্যবহারিক বিষয় যা জাতীয় শিক্ষাক্রমের আলোকে শিক্ষার্থীর মানসিক ও প্রায়োগিক জ্ঞান সমৃদ্ধ করে। এটি প্রাকৃতিক নিয়ম এবং গাণিতিক/যৌক্তিক শৃঙ্খলার অবিচ্ছেদ্য অংশ।
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
              <b style={{ color: '#334155', fontSize: '14px' }}>📌 সংজ্ঞার মূল ৩টি বৈশিষ্ট্য:</b>
              <ul style={{ margin: '8px 0 0 20px', padding: 0, fontSize: '13px', lineHeight: '1.6', color: '#475569' }}>
                <li>সুস্পষ্ট ও বৈজ্ঞানিক প্রমাণের ওপর প্রতিষ্ঠিত।</li>
                <li>সহজে পর্যবেক্ষণযোগ্য এবং বাস্তব পরীক্ষার সাথে সামঞ্জস্যপূর্ণ।</li>
                <li>উচ্চতর শ্রেণি ও গবেষণার ভিত্তিপ্রস্তর তৈরিতে অপরিহার্য।</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        number: 6,
        title: '🔍 চিত্রভিত্তিক ও উপাদানভিত্তিক বিশদ বিশ্লেষণ',
        type: 'বিশদ পাঠ',
        badge: 'Detailed Analysis',
        color: '#0284c7',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '8px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🧱</div>
              <b style={{ color: '#0369a1', fontSize: '14px' }}>উপাদান ১: কাঠামো</b>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#475569' }}>
                মৌলিক ভিত্তি ও প্রয়োজনীয় এককসমূহের পারস্পরিক আন্তঃসংযোগ।
              </p>
            </div>
            <div style={{ background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚙️</div>
              <b style={{ color: '#1d4ed8', fontSize: '14px' }}>উপাদান ২: কার্যপদ্ধতি</b>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#1e3a8a' }}>
                ধাপে ধাপে কীভাবে প্রতিটি উপাদান সক্রিয় হয়ে চূড়ান্ত রূপ ধারণ করে।
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📊</div>
              <b style={{ color: '#0369a1', fontSize: '14px' }}>উপাদান ৩: ফলাফল</b>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#475569' }}>
                প্রক্রিয়া শেষে চূড়ান্ত প্রভাব, আউটপুট ও তার সঠিক পরিমাপ।
              </p>
            </div>
          </div>
        )
      },
      {
        number: 7,
        title: '📐 তাত্ত্বিক নিয়ম ও গাণিতিক সমীকরণ',
        type: 'সূত্র ও নিয়ম',
        badge: 'Laws & Formulas',
        color: '#92400e',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#fef3c7', border: '1.5px solid #f59e0b', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
              <b style={{ color: '#92400e', fontSize: '15px' }}>মূল সমীকরণ / তাত্ত্বিক নীতি:</b>
              <p style={{ margin: '6px 0 0', fontSize: '15px', fontWeight: 800, color: '#78350f' }}>
                {topic} সংক্রান্ত বৈজ্ঞানিক নীতি ও সমীকরণ আন্তর্জাতিক মানদণ্ড অনুযায়ী পরিচালিত হয়।
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
              <b style={{ color: '#334155' }}>🔬 সমীকরণ ও শর্তসমূহের প্রয়োগ:</b>
              <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: '1.6', color: '#475569' }}>
                • প্রতিটি রাশির আন্তর্জাতিক একক (SI Unit) সঠিকভাবে জানা প্রয়োজন।<br />
                • বিশেষ শর্ত ছাড়া সূত্রটি সাধারণ পরিস্থিতিতে প্রয়োগ করা যায় না।<br />
                • সমাধানের সময় রাশিগুলোর পারস্পরিক একক রূপান্তর সতর্কতার সাথে করতে হবে।
              </p>
            </div>
          </div>
        )
      },
      {
        number: 8,
        title: '🔄 ধারাবাহিক পদক্ষেপ ও কার্যপ্রক্রিয়া',
        type: 'কার্যপ্রবাহ',
        badge: 'Step-by-Step Flow',
        color: '#0369a1',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '10px 0' }}>
            {[
              { step: 'ধাপ ১', title: 'তথ্য সংগ্রহ', desc: 'প্রদত্ত উপাত্ত পর্যবেক্ষণ ও মান চিহ্নিতকরণ।' },
              { step: 'ধাপ ২', title: 'সূত্র নির্বাচন', desc: 'সঠিক নীতি বা গাণিতিক সূত্র নির্ধারণ।' },
              { step: 'ধাপ ৩', title: 'রূপান্তর', desc: 'ধাপে ধাপে মান বসিয়ে নির্ভুল রূপান্তর।' },
              { step: 'ধাপ ৪', title: 'সিদ্ধান্ত', desc: 'ফলাফল যাচাই ও চূড়ান্ত সিদ্ধান্ত গ্রহণ।' }
            ].map((s, idx) => (
              <div key={idx} style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', background: '#0284c7', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', lineHeight: '28px', fontWeight: 800, fontSize: '12px', marginBottom: '6px' }}>
                  {idx + 1}
                </span>
                <b style={{ display: 'block', color: '#0369a1', fontSize: '13px' }}>{s.title}</b>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#475569' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )
      },
      {
        number: 9,
        title: '🌍 বাস্তব জীবনের সাথে সংযোগ ও প্রয়োগ',
        type: 'বাস্তব প্রয়োগ',
        badge: 'Real-World Significance',
        color: '#059669',
        content: (
          <div style={{ padding: '8px 0', display: 'grid', gap: '10px' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px' }}>
              <b style={{ color: '#065f46' }}>✨ ১. দৈনন্দিন কার্যকলাপে উপযোগিতা:</b>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#064e3b' }}>
                আমাদের দৈনন্দিন জীবন ও পারিবারিক কাজে সময়, শক্তি ও সম্পদের সাশ্রয়ে এর বাস্তব ভূমিকা রয়েছে।
              </p>
            </div>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px' }}>
              <b style={{ color: '#065f46' }}>✨ ২. শিল্প ও আধুনিক প্রযুক্তিতে প্রয়োগ:</b>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#064e3b' }}>
                যন্ত্রপাতি, যোগাযোগ মাধ্যম ও চিকিৎসা বিজ্ঞানে এই ধারণার প্রত্যক্ষ অ্যাপ্লিকেশন বিদ্যমান।
              </p>
            </div>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px' }}>
              <b style={{ color: '#065f46' }}>✨ ৩. পরিবেশ ও জাতীয় উন্নয়নে প্রভাব:</b>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#064e3b' }}>
                টেকসই উন্নয়ন এবং সামাজিক সমস্যা সমাধানের জন্য এর বৈজ্ঞানিক চর্চা অত্যন্ত জরুরি।
              </p>
            </div>
          </div>
        )
      },
      {
        number: 10,
        title: '💼 কেস স্টাডি ও বাস্তব সমস্যা সমাধান',
        type: 'কেস স্টাডি',
        badge: 'Practical Case Scenario',
        color: '#7c3aed',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <b style={{ color: '#6d28d9', fontSize: '14px' }}>📋 বাস্তব পরিস্থিতি / সমস্যা:</b>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#4c1d95', lineHeight: '1.6' }}>
                ধরুন, আপনি অত্র বিদ্যালয়ে একটি প্রকল্প পরিচালনায় যুক্ত আছেন এবং {topic} সংক্রান্ত একটি জটিল চ্যালেঞ্জের মুখোমুখি হয়েছেন। আপনি কীভাবে দলগতভাবে এটি সমাধান করবেন?
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
              <b style={{ color: '#334155' }}>💡 আদর্শ সমাধানের যৌক্তিক উপায়:</b>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                • পূর্ববর্তী অভিজ্ঞতার ভিত্তিতে সঠিক তথ্য বিশ্লেষণ।<br />
                • সহপাঠীদের সাথে মুক্ত আলোচনা ও যুক্তিবাদী সিদ্ধান্ত গ্রহণ।<br />
                • শিক্ষকের পরামর্শ নিয়ে চূড়ান্ত ফলাফলের সঠিক মূল্যায়ন।
              </p>
            </div>
          </div>
        )
      },
      {
        number: 11,
        title: '✍️ একক কাজ — দ্রুত ২ মিনিটের কুইজ',
        type: 'একক মূল্যায়ন',
        badge: 'Individual Work (2 Mins)',
        color: '#b45309',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#fffbeb', border: '2px solid #fcd34d', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#92400e', fontSize: '16px' }}>📝 খাতায় নিজে চিন্তা করে লিখুন:</h4>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#78350f' }}>
                <b>প্রশ্ন ১:</b> আজকের পাঠ অনুযায়ী "{topic}" এর প্রধান বৈশিষ্ট্যটি ১ বাক্যে লিখুন।
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#78350f' }}>
                <b>প্রশ্ন ২:</b> আপনার বাস্তব জীবন থেকে এর ১টি বাস্তবিক উদাহরণ নোট খাতায় লিখুন।
              </p>
              <div style={{ marginTop: '12px', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                ⏱️ সময়: ২ মিনিট • কোনো সহপাঠীর সাহায্য ছাড়া নিজে চিন্তা করে সম্পন্ন করুন।
              </div>
            </div>
          </div>
        )
      },
      {
        number: 12,
        title: '👥 দলগত কাজ — গ্রুপ অ্যাক্টিভিটি',
        type: 'দলগত কাজ',
        badge: `শিক্ষার্থী: ${studentCount} জন • ${grp.numGroups}টি দল`,
        color: '#0369a1',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#e0f2fe', padding: '8px 12px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>
              👥 শ্রেণিতে মোট শিক্ষার্থী: {studentCount} জন ({grp.size} জন করে মোট {grp.numGroups}টি দল)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                <b style={{ color: '#0369a1' }}>দল ১ (পদ্মা) ও দল ২ (মেঘনা):</b>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569' }}>
                  {topic} এর প্রধান সুবিধা ও গুরুত্বের একটি তালিকা তৈরি করুন।
                </p>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                <b style={{ color: '#0369a1' }}>দল ৩ (যমুনা) ও দল ৪ (সুরমা):</b>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569' }}>
                  বাস্তব জীবনের প্রেক্ষাপট নিয়ে একটি চিত্র বা ডায়াগ্রাম অঙ্কন করুন।
                </p>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                <b style={{ color: '#0369a1' }}>দল ৫ (কর্ণফুলী) ও দল ৬ (তিস্তা):</b>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569' }}>
                  এর সম্ভাব্য অপব্যবহার বা চ্যালেঞ্জ ও উত্তরণের উপায় চিহ্নিত করুন।
                </p>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                <b style={{ color: '#0369a1' }}>অন্যান্য দলসমূহ:</b>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569' }}>
                  দৈনন্দিন জীবনের ১টি কেস স্টাডি বানিয়ে সমাধান প্রস্তাব করুন।
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        number: 13,
        title: '🎤 দলীয় কাজের উপস্থাপন ও মূল্যায়ন',
        type: 'উপস্থাপন',
        badge: 'Presentation & Feedback',
        color: '#075c3a',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <b style={{ color: '#15803d', fontSize: '15px' }}>📢 উপস্থাপন পর্বের সারসংক্ষেপ:</b>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#14532d', lineHeight: '1.6' }}>
                প্রতিটি দলের প্রতিনিধি ১ মিনিটে তাদের সমাধান উপস্থাপন করেছেন। অন্যান্য দলের সদস্যরা সক্রিয় প্রশ্ন ও গঠনমূলক মতামত প্রদান করেছেন।
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
              <b style={{ color: '#334155' }}>👨‍🏫 শিক্ষকের সিদ্ধান্ত ও সংশোধন:</b>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                • প্রতিটি দলের দলনেতা ও সদস্যদের অংশগ্রহণ প্রশংসনীয় হয়েছে।<br />
                • উপস্থাপিত ভুল বা অস্পষ্ট পয়েন্টগুলো বোর্ডে স্পষ্ট করে সংশোধন করা হলো।<br />
                • সার্বিক দলগত অর্জনের জন্য পুরো শ্রেণিকে আন্তরিক সাধুবাদ।
              </p>
            </div>
          </div>
        )
      },
      {
        number: 14,
        title: '❓ শিখন যাচাই — মৌখিক ও সংক্ষিপ্ত প্রশ্ন',
        type: 'মৌখিক মূল্যায়ন',
        badge: 'Formative Assessment',
        color: '#c2410c',
        content: (
          <div style={{ padding: '8px 0', display: 'grid', gap: '10px' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '12px' }}>
              <b style={{ color: '#c2410c' }}>প্রশ্ন ১:</b>
              <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: '#7c2d12' }}>
                আজকের পাঠের সবচেয়ে গুরুত্বপূর্ণ মূলনীতি বা সূত্রটি কী?
              </p>
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '12px' }}>
              <b style={{ color: '#c2410c' }}>প্রশ্ন ২:</b>
              <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: '#7c2d12' }}>
                বাস্তব ক্ষেত্রে এই জ্ঞান প্রয়োগ করার সময় কী কী সতর্কতা অবলম্বন করতে হবে?
              </p>
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '12px' }}>
              <b style={{ color: '#c2410c' }}>প্রশ্ন ৩:</b>
              <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: '#7c2d12' }}>
                আমাদের পূর্ববর্তী পাঠের সাথে আজকের পাঠের মূল পার্থক্য কোথায়?
              </p>
            </div>
          </div>
        )
      },
      {
        number: 15,
        title: '📝 বহুনির্বাচনি কুইজ (MCQ Practice)',
        type: 'MCQ কুইজ',
        badge: 'Interactive Quiz',
        color: '#b45309',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#fef3c7', border: '1.5px solid #f59e0b', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <b style={{ color: '#92400e', fontSize: '15px' }}>
                প্রশ্ন: "{topic}" সম্পর্কে নিচের কোন বক্তব্যটি পুরোপুরি সঠিক?
              </b>
              <div style={{ margin: '10px 0 0', display: 'grid', gap: '6px', fontSize: '13.5px', color: '#78350f' }}>
                <div>(ক) এটি কোনো সুনির্দিষ্ট নিয়ম মানে না</div>
                <div style={{ fontWeight: 800, color: '#15803d' }}>
                  (খ) এটি বৈজ্ঞানিক নীতি ও বাস্তব পর্যবেক্ষণের ওপর প্রতিষ্ঠিত ✅
                </div>
                <div>(গ) এর কোনো প্রায়োগিক উপযোগিতা নেই</div>
                <div>(ঘ) এটি কেবলমাত্র উচ্চতর ক্লাসেই প্রযোজ্য</div>
              </div>
            </div>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textAlign: 'center' }}>
              ✅ সঠিক উত্তর: (খ) এটি বৈজ্ঞানিক নীতি ও বাস্তব পর্যবেক্ষণের ওপর প্রতিষ্ঠিত
            </div>
          </div>
        )
      },
      {
        number: 16,
        title: '📌 আজকের পাঠের সারসংক্ষেপ (Recap)',
        type: 'সারসংক্ষেপ',
        badge: 'Key Takeaways',
        color: '#075c3a',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px' }}>
              <b style={{ color: '#075c3a', fontSize: '15px' }}>আজকের পাঠের মূল ৩টি প্রাপ্তি:</b>
              <div style={{ marginTop: '10px', display: 'grid', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #075c3a' }}>
                  <b>১. মূল তত্ত্ব:</b> {topic} এর সংজ্ঞা ও তাৎপর্য আমরা সঠিকভাবে বুঝতে পেরেছি।
                </div>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
                  <b>২. পদ্ধতিগত ধাপ:</b> ধারাবাহিক কার্যপদ্ধতি ও চিত্রভিত্তিক নিয়মাবলী সফলভাবে আয়ত্ত করেছি।
                </div>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #d97706' }}>
                  <b>৩. দলগত সক্রিয়তা:</b> {studentCount} জন শিক্ষার্থী সক্রিয় অংশগ্রহণে নিজেদের দলগত কাজ সমাধান করেছে।
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        number: 17,
        title: '🏡 সৃজনশীল বাড়ির কাজ (Homework)',
        type: 'বাড়ির কাজ',
        badge: 'Creative Assignment',
        color: '#15803d',
        content: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '10px', padding: '18px' }}>
              <b style={{ color: '#15803d', fontSize: '16px' }}>
                অ্যাসাইনমেন্ট: "{topic} এর বাস্তব প্রয়োগ ও একটি সৃজনশীল কেস স্টাডি"
              </b>
              <div style={{ marginTop: '12px', fontSize: '13.5px', color: '#14532d', lineHeight: '1.8' }}>
                <b>নির্দেশনাসমূহ:</b><br />
                ১. আপনার চারপাশের পরিবেশ থেকে এর ১টি বাস্তব উদাহরণ পর্যবেক্ষণ করে ১ পৃষ্ঠার প্রতিবেদন লিখুন।<br />
                ২. পাঠ্যপুস্তকের সংশ্লিষ্ট অধ্যায়ের তথ্য ও ছক সংযুক্ত করবেন।<br />
                ৩. আগামী ক্লাসের শুরুতে শ্রেণি শিক্ষকের নিকট খাতা জমা দিতে হবে।
              </div>
            </div>
          </div>
        )
      },
      {
        number: 18,
        title: '🌟 ধন্যবাদ ও ক্লাসের সমাপনী',
        type: 'সমাপনী স্লাইড',
        badge: 'Thank You & Closing',
        color: '#075c3a',
        content: (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🌟🎉👏</div>
            <h2 style={{ fontSize: '28px', color: '#075c3a', margin: '0 0 10px', fontWeight: 800 }}>
              সবাইকে আন্তরিক ধন্যবাদ!
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 16px' }}>
              মনোযোগ ও শৃঙ্খলার সাথে ক্লাস সম্পন্ন করার জন্য সকল শিক্ষার্থীকে আন্তরিক সাধুবাদ।
            </p>
            <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '8px 20px', borderRadius: '24px', fontWeight: 700, fontSize: '14px' }}>
              আগামী ক্লাসের পাঠ: {selectedChapter} এর পরবর্তী অংশ
            </div>
            <div style={{ marginTop: '20px', color: '#065f46', fontSize: '13px', fontWeight: 700 }}>
              {schoolName} • মাল্টিমিডিয়া ক্লাসরুম
            </div>
          </div>
        )
      }
    ];
  };

  const slides18 = build18SlidesData();
  const currentSlide = slides18[currentSlideIndex] || slides18[0];
  const { lessonPlanPrompt, pptxPrompt } = buildPrompts();
  const currentLessonPlan = buildLessonPlan();

  // PPTX Download Handler
  const handleDownloadPPTX = async () => {
    try {
      setIsGenerating(true);
      showToast('পাওয়ার পয়েন্ট প্রেজেন্টেশন (.pptx) ফাইল তৈরি হচ্ছে...');
      const fileName = await downloadLessonPresentationPPTX({
        className: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        topic,
        duration,
        studentCount,
        teacherName,
        teacherDesignation,
        schoolName
      });
      showToast(`সফলভাবে ডাউনলোড হয়েছে: ${fileName}`);
    } catch (err) {
      console.error('PPTX generation error:', err);
      showToast(`ত্রুটি: ${err.message || 'পাওয়ারপয়েন্ট ফাইল ডাউনলোডে সমস্যা হয়েছে'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Official Lesson Plan Print Handler
  const handlePrintLessonPlan = () => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('পপ-আপ ব্লক করা আছে। দয়া করে ব্রাউজার পপ-আপ অনুমোদন করুন।');
      return;
    }
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <title>NCTB লেসন প্ল্যান - ${topic} (${selectedClass}ম শ্রেণি)</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'SolaimanLipi', 'Kalpurush', system-ui, sans-serif; padding: 30px; color: #1e293b; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px double #075c3a; padding-bottom: 12px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #075c3a; }
          .header p { margin: 3px 0 0; font-size: 13px; color: #475569; }
          .title-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 13px; margin-top: 6px; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; }
          .content-box { border: 1px solid #cbd5e1; padding: 18px; border-radius: 8px; white-space: pre-wrap; font-size: 13.5px; background: #fff; line-height: 1.7; }
          .footer-signs { margin-top: 55px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; border-top: 1px dashed #cbd5e1; padding-top: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolName}</h1>
          <p>ডাকঘর: মগড়া, উপজেলা: টাঙ্গাইল সদর, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৩৯ খ্রি.</p>
          <div class="title-badge">জাতীয় শিক্ষাক্রম (NCTB) অনুমোদিত দৈনিক পাঠ পরিকল্পনা</div>
        </div>
        <div class="meta-grid">
          <div><b>শ্রেণি:</b> ${selectedClass}ম শ্রেণি</div>
          <div><b>বিষয়:</b> ${selectedSubject}</div>
          <div><b>অধ্যায়:</b> ${selectedChapter}</div>
          <div><b>পাঠের শিরোনাম:</b> ${topic}</div>
          <div><b>সময়:</b> ${duration}</div>
          <div><b>শিক্ষার্থী:</b> ${studentCount} জন</div>
        </div>
        <div class="content-box">${currentLessonPlan}</div>
        <div class="footer-signs">
          <div>বিষয় শিক্ষকের স্বাক্ষর<br /><small>${teacherName}</small></div>
          <div>সহকারী প্রধান শিক্ষক</div>
          <div>প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#064e3b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          fontWeight: 700,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✨</span> {toastMsg}
        </div>
      )}

      {/* Main Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #075c3a 0%, #064e3b 60%, #0369a1 100%)',
        color: '#ffffff',
        padding: '20px 24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(7,92,58,0.18)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>
            <span>🚀</span> NCTB কারিকুলাম ও মাল্টিমিডিয়া ক্লাসরুম ইঞ্জিন
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
            কারিকুলাম এআই প্রম্পট জেনারেটর, লেসন প্ল্যান ও ১৮-স্লাইড PPTX
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.9 }}>
            ভিউ পেজের পাঠ্যক্রম সিলেক্ট করুন ➔ এআই প্রম্পট নিন ➔ লেসন প্ল্যান দেখুন ➔ সরাসরি ১৮টি স্লাইডের পাওয়ার পয়েন্ট (.pptx) ডাউনলোড করুন!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            onClick={handleDownloadPPTX}
            disabled={isGenerating}
            style={{
              background: '#ffd34f',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '13.5px',
              padding: '11px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}
          >
            <span>📥</span> ১৮-স্লাইড PPTX ডাউনলোড
          </button>
        </div>
      </div>

      {/* 2-Column Main Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 390px) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Cascading Configuration Form */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #d1fae5',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#075c3a' }}>
                পাঠ ও কারিকুলাম কনফিগ
              </h3>
              <div style={{ fontSize: '11px', color: '#64748b' }}>ধাপে ধাপে ড্রপডাউন থেকে নির্বাচন করুন</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Step 1: Class Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>
                ১. শ্রেণি নির্বাচন করুন *
              </label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13.5px', background: '#f8fafc' }}
              >
                <option value="6">৬ষ্ঠ শ্রেণি (Class 6)</option>
                <option value="7">৭ম শ্রেণি (Class 7)</option>
                <option value="8">৮ম শ্রেণি (Class 8)</option>
                <option value="9">৯ম শ্রেণি (Class 9)</option>
                <option value="10">১০ম শ্রেণি / SSC (Class 10)</option>
              </select>
            </div>

            {/* Step 2: Subject Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>
                ২. বিষয় নির্বাচন করুন (কারিকুলাম অনুযায়ী) *
              </label>
              <select
                value={selectedSubject}
                onChange={e => handleSubjectChange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13.5px', background: '#f8fafc' }}
              >
                {subjectKeys.map(sub => (
                  <option key={sub} value={sub}>
                    {classObj.subjects[sub]?.icon || '📖'} {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Chapter Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>
                ৩. অধ্যায় নির্বাচন করুন *
              </label>
              <select
                value={selectedChapter}
                onChange={e => handleChapterChange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#f8fafc' }}
              >
                {(currentSubjectObj?.chapters || []).map((ch, idx) => (
                  <option key={idx} value={ch.name}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Today's Topic */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>
                ৪. আজকের পাঠের সুনির্দিষ্ট বিষয় / টপিক *
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="যেমন: গতির ৪টি সমীকরণ প্রতিপাদন ও বাস্তব প্রয়োগ"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
              />
            </div>

            {/* Step 5 & 6: Duration & Student Count */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>
                  ৫. পাঠের সময় *
                </label>
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#f8fafc' }}
                >
                  <option value="৩৫ মিনিট">৩৫ মিনিট</option>
                  <option value="৪০ মিনিট">৪০ মিনিট</option>
                  <option value="৪৫ মিনিট">৪৫ মিনিট</option>
                  <option value="৫০ মিনিট">৫০ মিনিট</option>
                  <option value="৬০ মিনিট">৬০ মিনিট</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>
                  ৬. শিক্ষার্থী সংখ্যা *
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={studentCount}
                  onChange={e => setStudentCount(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Teacher Details */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#075c3a', marginBottom: '6px' }}>
                👨‍🏫 শিক্ষক ও প্রতিষ্ঠান তথ্য:
              </div>
              <input
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="শিক্ষকের নাম"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '6px' }}
              />
              <input
                type="text"
                value={teacherDesignation}
                onChange={e => setTeacherDesignation(e.target.value)}
                placeholder="পদবি (যেমন: সহকারী শিক্ষক)"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>

            {/* AI Engine & API Key Setting */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  🤖 এআই ইঞ্জিন: <b>{aiEngine === 'built_in' ? 'স্মার্ট বিল্ট-ইন ইঞ্জিন' : 'গুগল জেমিনাই API'}</b>
                </span>
                <button
                  type="button"
                  className="mini"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  style={{ background: '#f1f5f9', color: '#0369a1', fontSize: '11px', padding: '3px 8px' }}
                >
                  {showApiKeyInput ? 'বন্ধ করুন' : 'API কী সেটআপ'}
                </button>
              </div>

              {showApiKeyInput && (
                <div style={{ marginTop: '8px', background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>
                    Google Gemini Free API Key (ঐচ্ছিক):
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={e => {
                      setGeminiApiKey(e.target.value);
                      localStorage.setItem('magra_gemini_api_key', e.target.value);
                    }}
                    placeholder="AIzaSy..."
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '11.5px' }}
                  />
                  <div style={{ fontSize: '10px', color: '#1e40af', marginTop: '4px' }}>
                    * API কী না দিলেও আমাদের স্মার্ট অফলাইন ইঞ্জিন তাৎক্ষণিকভাবে পূর্ণাঙ্গ ১৮টি স্লাইড তৈরি করবে।
                  </div>
                </div>
              )}
            </div>

            {/* Main Action Trigger */}
            <button
              type="button"
              onClick={() => {
                showToast('লেসন প্ল্যান ও ১৮টি স্লাইড সফলভাবে প্রস্তুত হয়েছে!');
                setActiveViewTab('slides');
              }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #075c3a 0%, #15803d 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(7,92,58,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>✨</span> ১-ক্লিকে লেসন প্ল্যান ও ১৮-স্লাইড PPT প্রস্তুত
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Tabs & Live Workspace */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          {/* Top Subnav for Outputs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'slides', label: '🖥️ ১৮-স্লাইড প্রেজেন্টেশন ও প্রিভিউ', badge: '18 Slides' },
                { id: 'lesson_plan', label: '📋 NCTB সম্পূর্ণ লেসন প্ল্যান', badge: 'প্রিন্টযোগ্য' },
                { id: 'prompts', label: '🤖 মাস্টার AI প্রম্পট সমূহ', badge: 'ChatGPT/Gamma' }
              ].map(tab => {
                const isActive = activeViewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveViewTab(tab.id)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '13px',
                      background: isActive ? '#075c3a' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#334155',
                      boxShadow: isActive ? '0 2px 8px rgba(7,92,58,0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="mini"
                onClick={handleDownloadPPTX}
                disabled={isGenerating}
                style={{ background: '#ffd34f', color: '#1e293b', fontWeight: 800, padding: '7px 12px' }}
              >
                📥 .pptx ডাউনলোড
              </button>
              <button
                type="button"
                className="mini"
                onClick={handlePrintLessonPlan}
                style={{ background: '#f1f5f9', color: '#075c3a', fontWeight: 700, padding: '7px 12px' }}
              >
                🖨️ লেসন প্ল্যান প্রিন্ট
              </button>
            </div>
          </div>

          {/* TAB 1: 18-SLIDE INTERACTIVE PRESENTATION PREVIEW */}
          {activeViewTab === 'slides' && (
            <div>
              {/* Carousel Control Bar */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#075c3a' }}>
                    স্লাইড {currentSlide.number} / 18
                  </span>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    {currentSlide.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentSlideIndex === 0}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: currentSlideIndex === 0 ? '#f1f5f9' : '#ffffff',
                      cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    ◀ পূর্ববর্তী
                  </button>

                  <select
                    value={currentSlideIndex}
                    onChange={e => setCurrentSlideIndex(parseInt(e.target.value, 10))}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700, background: '#fff' }}
                  >
                    {slides18.map((s, idx) => (
                      <option key={idx} value={idx}>
                        স্লাইড {s.number}: {s.type}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(prev => Math.min(17, prev + 1))}
                    disabled={currentSlideIndex === 17}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: currentSlideIndex === 17 ? '#f1f5f9' : '#ffffff',
                      cursor: currentSlideIndex === 17 ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    পরবর্তী ▶
                  </button>
                </div>
              </div>

              {/* 16:9 Slide Canvas Preview */}
              <div style={{
                position: 'relative',
                background: '#ffffff',
                border: '2px solid #cbd5e1',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                aspectRatio: '16 / 9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px 28px'
              }}>
                {/* Header in Slide */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #f1f5f9',
                  paddingBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentSlide.color }} />
                    <b style={{ color: '#075c3a', fontSize: '13px' }}>{schoolName}</b>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>মাল্টিমিডিয়া ক্লাসরুম</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: currentSlide.color }}>
                    {currentSlide.title}
                  </div>
                </div>

                {/* Body Content of Slide */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 0' }}>
                  {currentSlide.content}
                </div>

                {/* Footer in Slide */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '6px',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  <span>শ্রেণি: {selectedClass}ম • বিষয়: {selectedSubject} • সময়: {duration}</span>
                  <span style={{ fontWeight: 700, color: '#075c3a' }}>
                    স্লাইড {currentSlide.number} / 18
                  </span>
                </div>
              </div>

              {/* Slide Navigation Thumbnails */}
              <div style={{
                marginTop: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 1fr)',
                gap: '6px'
              }}>
                {slides18.map((s, idx) => {
                  const isCurrent = idx === currentSlideIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid #075c3a' : '1px solid #cbd5e1',
                        background: isCurrent ? '#ecfdf5' : '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? '#075c3a' : '#475569',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s.number}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: NCTB LESSON PLAN VIEW */}
          {activeViewTab === 'lesson_plan' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#075c3a', fontSize: '15px' }}>
                    📋 অনুমোদিত NCTB দৈনিক পাঠ পরিকল্পনা
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    শ্রেণি: {selectedClass}ম • বিষয়: {selectedSubject} • সময়: {duration}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="mini"
                    onClick={() => {
                      navigator.clipboard.writeText(currentLessonPlan);
                      showToast('লেসন প্ল্যান ক্লিপবোর্ডে কপি হয়েছে!');
                    }}
                    style={{ background: '#f1f5f9', color: '#1e293b' }}
                  >
                    📋 টেক্সট কপি
                  </button>
                  <button
                    type="button"
                    className="mini"
                    onClick={handlePrintLessonPlan}
                    style={{ background: '#075c3a', color: '#fff', fontWeight: 700 }}
                  >
                    🖨️ প্রিন্ট / PDF
                  </button>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '18px',
                maxHeight: '520px',
                overflowY: 'auto',
                fontFamily: 'inherit',
                fontSize: '13.5px',
                lineHeight: '1.7',
                color: '#1e293b',
                whiteSpace: 'pre-wrap'
              }}>
                {currentLessonPlan}
              </div>
            </div>
          )}

          {/* TAB 3: DUAL MASTER PROMPTS VIEW */}
          {activeViewTab === 'prompts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Prompt 1: Lesson Plan */}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#15803d', fontSize: '14.5px' }}>
                    🤖 প্রম্পট ১: ChatGPT / Gemini এর জন্য লেসন প্ল্যান প্রম্পট
                  </div>
                  <button
                    type="button"
                    className="mini"
                    onClick={() => {
                      navigator.clipboard.writeText(lessonPlanPrompt);
                      showToast('লেসন প্ল্যান প্রম্পট কপি হয়েছে!');
                    }}
                    style={{ background: '#15803d', color: '#ffffff', fontWeight: 700 }}
                  >
                    📋 প্রম্পট কপি
                  </button>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '12px', fontSize: '12.5px', color: '#1e293b', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}>
                  {lessonPlanPrompt}
                </div>
              </div>

              {/* Prompt 2: PowerPoint Presentation */}
              <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '14.5px' }}>
                    🖥️ প্রম্পট ২: Gamma.app / SlidesAI / PowerPoint CoPilot প্রম্পট
                  </div>
                  <button
                    type="button"
                    className="mini"
                    onClick={() => {
                      navigator.clipboard.writeText(pptxPrompt);
                      showToast('পাওয়ার পয়েন্ট প্রম্পট কপি হয়েছে!');
                    }}
                    style={{ background: '#1d4ed8', color: '#ffffff', fontWeight: 700 }}
                  >
                    📋 প্রম্পট কপি
                  </button>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#1e293b', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}>
                  {pptxPrompt}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
