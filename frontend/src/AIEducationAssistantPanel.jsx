// AIEducationAssistantPanel.jsx - Comprehensive AI Education & Assistant Control Panel
// মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় - AI শিক্ষা ও সহকারী (AI Education & Assistant)

import React, { useState, useEffect } from 'react';
import { requestApi as api } from './apiClient';
import { AI_PRESETS } from './studentGuideDataStore';
import CurriculumLessonSlidePipeline from './CurriculumLessonSlidePipeline';

export default function AIEducationAssistantPanel({ sub, setSub, userRole, onNavigate }) {
  // Active primary tab: 'assistant' (AI সহকারী ও শিক্ষক কোপাইলট) | 'tutor' (AI Tutor) | 'analytics' (AI বিশ্লেষণ)
  const [activeTab, setActiveTab] = useState(
    sub === 'tutor' ? 'tutor' : sub === 'analytics' ? 'analytics' : 'assistant'
  );

  useEffect(() => {
    if (sub === 'tutor') setActiveTab('tutor');
    else if (sub === 'analytics') setActiveTab('analytics');
    else if (sub === 'assistant' || sub === 'copilot') setActiveTab('assistant');
  }, [sub]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (setSub) setSub(key);
  };

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // ====================================================
  // 1. AI সহকারী ও শিক্ষক কোপাইলট (Teacher Copilot) STATE
  // ====================================================
  const [aiSubTab, setAiSubTab] = useState('curriculum_pipeline'); // 'curriculum_pipeline' | 'lesson_plan' | 'digital_content' | 'classroom_mgmt' | 'ai_chat'

  // Lesson Plan Generator Form
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

  // Lesson plan generator handler
  const handleGenerateLessonPlan = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const match = AI_PRESETS.lesson_plans.find(
        p => p.class_name === lpForm.class_name && p.subject.includes(lpForm.subject)
      );
      if (match) {
        setGeneratedLessonPlan(match.plan);
      } else {
        const customPlan = `দৈনিক পাঠ পরিকল্পনা (Lesson Plan) — NCTB জাতীয় শিক্ষাক্রম
-----------------------------------------------------------
প্রতিষ্ঠান: মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
শ্রেণি: ${lpForm.class_name}ম | বিষয়: ${lpForm.subject}
পাঠের শিরোনাম: ${lpForm.topic}
সময়: ${lpForm.period_duration} | শিখন পদ্ধতি: ${lpForm.pedagogy_focus}
তারিখ: ${new Date().toLocaleDateString('bn-BD')}

১. শিখনফল (Learning Outcomes):
   • পাঠ শেষে শিক্ষার্থীরা ${lpForm.topic} এর মৌলিক ধারণা স্পষ্ট ভাষায় ব্যাখ্যা করতে পারবে।
   • বাস্তব জীবনে এর উপযোগিতা ও গাণিতিক/তাত্ত্বিক ভিত্তি বিশ্লেষণ করতে সক্ষম হবে।
   • দলগত কাজের মাধ্যমে সমস্যা সমাধানের আত্মবিশ্বাস অর্জন করবে।

২. প্রয়োজনীয় শিখন-শেখানো উপকরণ:
   • মাল্টিমিডিয়া প্রজেক্টর, স্মার্টবোর্ড/হোয়াইটবোর্ড, পাঠ্যপুস্তক, রঙিন মার্কার ও ডেমো চার্ট।

৩. ধাপভিত্তিক পাঠদান পরিকল্পনা (${lpForm.period_duration}):
   ক. প্রারম্ভিক প্রস্তুতি ও মনোযোগ আকর্ষণ (৫ মিনিট):
      - কুশলাদি বিনিময় ও শ্রেণি শৃঙ্খলা নিশ্চিতকরণ।
      - বাস্তব অভিজ্ঞতার ছোট প্রশ্ন করে পূর্বজ্ঞান যাচাই এবং আজকের পাঠের সাথে সংযোগ স্থাপন।

   খ. মূল পাঠ উপস্থাপন ও ধারণা স্পষ্টকরণ (১৫ মিনিট):
      - প্রজেক্টরে দৃশ্যমান স্লাইড বা চার্ট প্রদর্শন।
      - সহজ অ্যানালজি ব্যবহার করে জটিল বিষয়বস্তু বিশ্লেষণ।
      - বোর্ডে মূল সূত্র ও তাৎপর্য নোট ডাউন।

   গ. দলগত কাজ / ইন্টারেক্টিভ অ্যাক্টিভিটি (১৫ মিনিট):
      - শ্রেণিকে ৪টি দলে ভাগ করে সংক্ষিপ্ত ওয়ার্কশিট প্রদান।
      - শিক্ষক প্রতিটি দলে ঘুরে পর্যবেক্ষণ ও নির্দেশনা প্রদান করবেন।

   ঘ. মূল্যায়ন ও ফিডব্যাক (৭ মিনিট):
      - দ্রুত মৌখিক প্রশ্ন বা MCQ কুইজের মাধ্যমে শিখন যাচাই।
      - ভুল উত্তর পেলে ইতিবাচকভাবে সংশোধন।

   ঙ. সারসংক্ষেপ ও বাড়ির কাজ (৩ মিনিট):
      - আজকের পাঠের ৩টি প্রধান পয়েন্ট পুনরাবৃত্তি।
      - সৃজনশীল বাড়ির কাজ খাতায় লিখে দেওয়া।

শিক্ষকের স্বাক্ষর: .......................       প্রধান শিক্ষক: .......................`;
        setGeneratedLessonPlan(customPlan);
      }
      setIsAiGenerating(false);
      showToast('জাতীয় কারিকুলাম লেসন প্ল্যান সফলভাবে প্রস্তুত হয়েছে!');
    }, 800);
  };

  // Digital slides generator handler
  const handleGenerateDigitalSlides = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const match = AI_PRESETS.digital_content_ideas.find(
        p => p.class_name === dcForm.class_name && p.subject.includes(dcForm.subject)
      );
      const generated = match ? match.slides : [
        `স্লাইড ১: শিরোনাম — "${dcForm.topic}" (শ্রেণি: ${dcForm.class_name}ম, বিষয়: ${dcForm.subject})`,
        `স্লাইড ২: বাস্তব জীবনের সংযোগ ও “কেন আমরা এটি পড়ছি?” (বাস্তব ভিডিও/অ্যানিমেশন আইডিয়া)`,
        `স্লাইড ৩: মূল ধারণার নিখুঁত অ্যানিমেটেড ইনফোগ্রাফিক ও সমীকরণ বিশ্লেষণ`,
        `স্লাইড ৪: দলগত কুইজ — বোর্ডে শিক্ষার্থীরা এসে সঠিক উত্তর সমাধান করবে`,
        `স্লাইড ৫: সারসংক্ষেপ ও পরবর্তী ক্লাসের প্রিভিউ`
      ];
      setGeneratedSlides(generated);
      setIsAiGenerating(false);
      showToast('ডিজিটাল স্লাইড ও কনটেন্ট আউটলাইন প্রস্তুত!');
    }, 600);
  };

  // AI Chat Consultant handler
  const handleSendAiChat = (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;
    const userText = aiChatInput.trim();
    setAiChatInput('');
    setAiChatMessages(prev => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      let reply = `শিক্ষক মহোদয়, "${userText}" বিষয়ে আমার সুপারিশ:\n`;
      if (userText.includes('লেসন') || userText.includes('পাঠ') || userText.includes('পরিকল্পনা')) {
        reply += `১. পাঠ সূচনা আকর্ষণীয় করতে শিক্ষার্থীদের বাস্তব অভিজ্ঞতার গল্প দিয়ে শুরু করুন।\n২. ক্লাসের ৪০% সময় শিক্ষার্থীদের সক্রিয় কাজে (জোড়ায় কাজ/দলগত কাজ) ব্যস্ত রাখুন।\n৩. প্রজেক্টরে বড় ফন্টে মূল শিখনফল প্রদর্শন করুন।`;
      } else if (userText.includes('অমনোযোগী') || userText.includes('শব্দ') || userText.includes('শৃঙ্খলা')) {
        reply += `১. শিক্ষক কণ্ঠের স্বর হঠাৎ কমিয়ে নরম সুরে কথা বলুন; এতে পুরো শ্রেণি আপনা থেকেই শান্ত হয়।\n২. “সবার দৃষ্টি বোর্ডে” বলে হাততালি সংকেত দিন।\n৩. অমনোযোগী শিক্ষার্থীকে শাস্তির বদলে বোর্ডে এসে চক/মার্কার ধরার ছোট দায়িত্ব দিন।`;
      } else {
        reply += `১. বিষয়টি সহজে বোঝাতে বাস্তব জীবনের অ্যানালজি বা দৃষ্টান্ত দিন।\n২. শ্রেণির শেষে ৩ মিনিটের দ্রুত কুইজ নিন।\n৩. আপনি চাইলে বামের 'লেসন প্ল্যান জেনারেটর' ট্যাব থেকে ১-ক্লিকে এর সম্পূর্ণ প্রিন্টযোগ্য শিট প্রস্তুত করে নিতে পারেন।`;
      }
      setAiChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 500);
  };

  // Print Document Helper
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
          .header { text-align: center; border-bottom: 2px double #4f46e5; padding-bottom: 12px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #4338ca; }
          .header p { margin: 3px 0 0; font-size: 13px; color: #475569; }
          .report-title { text-align: center; font-size: 18px; font-weight: 800; color: #4f46e5; margin: 10px 0; }
          .meta-box { display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
          .footer-signs { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
          <p>ডাকঘর: মগড়া, উপজেলা: টাঙ্গাইল সদর, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৩৯ খ্রি.</p>
          <div class="report-title">${title}</div>
        </div>
        <div class="meta-box">${metaHtml}</div>
        ${tableHtml}
        <div class="footer-signs">
          <div>বিষয় শিক্ষকের স্বাক্ষর</div>
          <div>সহকারী প্রধান শিক্ষক</div>
          <div>প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // ====================================================
  // 2. AI TUTOR & LEARNING STATE
  // ====================================================
  const [tutorMsg, setTutorMsg] = useState('');
  const [conversation, setConversation] = useState(null);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorMessages, setTutorMessages] = useState([]);
  const [plan, setPlan] = useState(null);

  async function startTutorSession() {
    try {
      const c = await api('/ai/conversations', { method: 'POST', body: JSON.stringify({ title: 'AI Tutor আলোচনা' }) });
      setConversation(c);
      setTutorMessages([]);
      setTutorMsg('নতুন AI Tutor সেশন সফলভাবে শুরু হয়েছে');
    } catch (e) {
      setTutorMsg(e.message);
    }
  }

  async function sendTutorMessage(e) {
    e.preventDefault();
    if (!conversation || !tutorInput.trim()) return;
    const t = tutorInput;
    setTutorInput('');
    setTutorMessages(m => [...m, { role: 'user', message: t }]);
    try {
      const a = await api(`/ai/conversations/${conversation.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: t })
      });
      setTutorMessages(m => [...m, a]);
    } catch (e) {
      setTutorMsg(e.message);
    }
  }

  async function makeStudyPlan() {
    try {
      const d = await api('/ai/study-plans', {
        method: 'POST',
        body: JSON.stringify({ title_bn: 'ব্যক্তিগত Study Plan' })
      });
      setPlan(d);
      setTutorMsg('Study Plan তৈরি হয়েছে');
      showToast('ব্যক্তিগত স্টাডি প্ল্যান প্রস্তুত!');
    } catch (e) {
      setTutorMsg(e.message);
    }
  }

  // ====================================================
  // 3. AI ANALYTICS & INSIGHTS STATE
  // ====================================================
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  async function loadInsight() {
    setLoadingInsight(true);
    try {
      const d = await api('/ai/student-insights');
      setInsight(d);
      showToast('শিক্ষার্থী লার্নিং অ্যানালিটিক্স লোড হয়েছে');
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoadingInsight(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'analytics' && !insight) {
      loadInsight();
    }
  }, [activeTab]);

  return (
    <div className="ai-education-assistant-panel" style={{ paddingBottom: '40px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
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

      {/* Hero Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 80%, #6366f1 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(49,46,129,0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '38px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>✨</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>AI শিক্ষা ও সহকারী</h2>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                AI Education & Assistant
              </span>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: '13.5px', opacity: 0.92 }}>
              শিক্ষক কোপাইলট, ১-ক্লিকে লেসন প্ল্যান জেনারেটর, ডিজিটাল স্লাইড আইডিয়া, ক্লাসরুম ম্যানেজমেন্ট ও AI স্টাডি অ্যানালিটিক্স
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="mini"
            onClick={() => handleTabChange('assistant')}
            style={{
              background: activeTab === 'assistant' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'assistant' ? '#312e81' : '#ffffff',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🤖 AI সহকারী
          </button>
          <button
            type="button"
            className="mini"
            onClick={() => handleTabChange('tutor')}
            style={{
              background: activeTab === 'tutor' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'tutor' ? '#312e81' : '#ffffff',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            💬 AI Tutor
          </button>
          <button
            type="button"
            className="mini"
            onClick={() => handleTabChange('analytics')}
            style={{
              background: activeTab === 'analytics' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'analytics' ? '#312e81' : '#ffffff',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📈 AI বিশ্লেষণ
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
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
          { key: 'assistant', label: '১. AI সহকারী ও শিক্ষক কোপাইলট', icon: '🤖', badge: 'লেসন প্ল্যান ও শিক্ষক পাওয়ার টুলস' },
          { key: 'tutor', label: '২. AI Tutor ও স্টাডি আলোচনা', icon: '💬', badge: 'শিক্ষার্থী ডিসকাশন ও স্টাডি প্ল্যান' },
          { key: 'analytics', label: '৩. AI বিশ্লেষণ ও লার্নিং ইনসাইটস', icon: '📈', badge: 'উপস্থিতি ও দুর্বল বিষয় বিশ্লেষণ' }
        ].map(item => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabChange(item.key)}
              style={{
                flex: '1 1 auto',
                minWidth: '220px',
                padding: '11px 16px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: isActive ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '13.5px' }}>{item.label}</div>
                <div style={{ fontSize: '11px', opacity: isActive ? 0.9 : 0.65, marginTop: '2px' }}>
                  {item.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ====================================================
          TAB 1: AI সহকারী ও শিক্ষক কোপাইলট
      ==================================================== */}
      {activeTab === 'assistant' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'curriculum_pipeline', label: '🚀 কারিকুলাম প্রম্পট, লেসন প্ল্যান ও ১৮-স্লাইড PPTX', icon: '🚀', highlight: true },
              { id: 'lesson_plan', label: '📝 দ্রুত লেসন প্ল্যান শিট', icon: '📝' },
              { id: 'digital_content', label: '💡 ডিজিটাল স্লাইড আইডিয়া', icon: '💡' },
              { id: 'classroom_mgmt', label: '🏫 আধুনিক ক্লাসরুম কৌশল', icon: '🏫' },
              { id: 'ai_chat', label: '💬 লাইভ টিচার AI কনসালট্যান্ট', icon: '💬' }
            ].map(tab => {
              const isActive = aiSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAiSubTab(tab.id)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: tab.highlight && !isActive ? '1.5px solid #86efac' : 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '13px',
                    background: isActive ? (tab.highlight ? 'linear-gradient(135deg, #075c3a 0%, #15803d 100%)' : '#4f46e5') : '#f8fafc',
                    color: isActive ? '#ffffff' : (tab.highlight ? '#065f46' : '#475569'),
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* AI SUBTAB 0: CARICULUM PIPELINE (USER REQUESTED WORKFLOW) */}
          {aiSubTab === 'curriculum_pipeline' && (
            <CurriculumLessonSlidePipeline userRole={userRole} onNavigate={onNavigate} />
          )}

          {/* AI SUBTAB 1: LESSON PLAN */}
          {aiSubTab === 'lesson_plan' && (
            <div className="module-grid" style={{ gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.5fr)' }}>
              {/* Input Form */}
              <div className="form-card" style={{ border: '1px solid #e0e7ff', background: '#faf5ff' }}>
                <div className="toolbar">
                  <div>
                    <span className="eyebrow" style={{ color: '#6d28d9' }}>NCTB LESSON PLAN CONFIG</span>
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
                    <input value={lpForm.topic} onChange={e => setLpForm({ ...lpForm, topic: e.target.value })} placeholder="যেমন: গতির সমীকরণ ও বাস্তব গতিবিদ্যা" />
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
                      style={{ background: '#4f46e5', color: '#fff' }}
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

      {/* ====================================================
          TAB 2: AI TUTOR & LEARNING
      ==================================================== */}
      {activeTab === 'tutor' && (
        <div className="module-grid" style={{ gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(300px, 0.8fr)' }}>
          {/* Chat Box */}
          <div className="form-card" style={{ border: '1px solid #c7d2fe' }}>
            <div className="toolbar">
              <div>
                <span className="eyebrow" style={{ color: '#4338ca' }}>AI TUTOR FOR STUDENTS</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>AI Tutor ও স্টাডি কনভার্সেশন</h3>
              </div>
              <button type="button" className="btn mini" onClick={startTutorSession} style={{ background: '#4f46e5', color: '#fff' }}>
                + নতুন আলোচনা
              </button>
            </div>

            <div className="ai-disclaimer" style={{ background: '#eef2ff', color: '#3730a3', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', margin: '10px 0' }}>
              💡 AI সহায়তা শিক্ষকের বিকল্প নয়। গুরুত্বপূর্ণ তথ্য শিক্ষক/অভিভাবকের সঙ্গে যাচাই করুন।
            </div>

            <div className="chat-box" style={{ maxHeight: '380px', overflowY: 'auto', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '260px' }}>
              {tutorMessages.length ? tutorMessages.map((m, i) => (
                <div key={i} className={'chat ' + m.role} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#4f46e5' : '#ffffff',
                  color: m.role === 'user' ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '13.5px'
                }}>
                  <b style={{ display: 'block', fontSize: '11px', marginBottom: '4px', opacity: 0.85 }}>
                    {m.role === 'user' ? 'আপনি' : '✨ AI Tutor'}
                  </b>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{m.message}</p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 15px', color: '#64748b', fontSize: '13px' }}>
                  👋 নতুন আলোচনা শুরু করে আপনার পড়ার বিষয় বা প্রশ্ন লিখুন।<br/>
                  (যেমন: "নবম শ্রেণির পদার্থবিজ্ঞানের গতির সূত্রগুলো বুঝিয়ে দাও")
                </div>
              )}
            </div>

            <form className="chat-form" onSubmit={sendTutorMessage} style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <input
                disabled={!conversation}
                value={tutorInput}
                onChange={e => setTutorInput(e.target.value)}
                placeholder={conversation ? 'আপনার প্রশ্ন লিখুন...' : 'প্রথমে উপরের “+ নতুন আলোচনা” বাটনে চাপুন'}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button className="btn" disabled={!conversation} style={{ background: '#4f46e5', color: '#fff', fontWeight: 800 }}>
                পাঠান
              </button>
            </form>
            {tutorMsg && <p className="msg" style={{ marginTop: '8px', fontSize: '12px' }}>{tutorMsg}</p>}
          </div>

          {/* Study Plan Card */}
          <div className="form-card" style={{ border: '1px solid #e0e7ff', background: '#faf5ff' }}>
            <div className="toolbar">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#5b21b6' }}>ব্যক্তিগত Study Plan</h3>
              <button type="button" className="mini" onClick={makeStudyPlan} style={{ background: '#7c3aed', color: '#fff' }}>
                ✨ নতুন প্ল্যান তৈরি
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#6b7280', margin: '8px 0 14px' }}>
              আপনার একাডেমিক অগ্রগতি ও পরীক্ষার সময়সূচির সাথে সামঞ্জস্য রেখে দিনভিত্তিক সুষম পড়ার পরিকল্পনা।
            </p>

            {plan ? (
              <div className="plan-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {(plan.plan_json || []).map((x, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid #ddd6fe', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6d28d9', fontWeight: 800, marginBottom: '4px' }}>
                      <span>দিন {x.day} — {x.subject}</span>
                      <span>⏱️ {x.minutes} মিনিট</span>
                    </div>
                    <p style={{ margin: 0, color: '#334155', fontSize: '12px' }}>ফোকাস: {x.focus}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 15px', color: '#64748b', fontSize: '13px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                এখনও কোনো স্টাডি প্ল্যান তৈরি করা হয়নি। "নতুন প্ল্যান তৈরি" বাটনে চাপুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: AI ANALYTICS & INSIGHTS
      ==================================================== */}
      {activeTab === 'analytics' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div>
              <span className="eyebrow" style={{ color: '#047857' }}>AI LEARNING ANALYTICS</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                শিক্ষার্থী অগ্রগতি ও লার্নিং ইনসাইটস
              </h3>
            </div>
            <button
              type="button"
              className="mini"
              onClick={loadInsight}
              disabled={loadingInsight}
              style={{ background: '#047857', color: '#ffffff', fontWeight: 700, padding: '8px 14px' }}
            >
              {loadingInsight ? 'লোড হচ্ছে...' : '🔄 রিফ্রেশ অ্যানালিটিক্স'}
            </button>
          </div>

          {insight ? (
            <div>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>গড় উপস্থিতি হার</span>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
                    {insight.attendance?.rate ?? '—'}{insight.attendance?.rate !== null ? '%' : ''}
                  </div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>মোট অনুপস্থিত দিন</span>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
                    {insight.attendance?.absent ?? 0} দিন
                  </div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>চিহ্নিত দুর্বল বিষয়</span>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {insight.weakSubjects?.length || 0} টি
                  </div>
                </div>
              </div>

              {/* Weak Subjects & Tips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div style={{ border: '1px solid #fecaca', borderRadius: '10px', background: '#fffaf0', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#c2410c', fontSize: '15px', fontWeight: 800 }}>
                    ⚠️ যেসব বিষয়ে বিশেষ নজর প্রয়োজন
                  </h4>
                  {insight.weakSubjects?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {insight.weakSubjects.map(x => (
                        <div key={x.subject_name} style={{ background: '#ffffff', border: '1px solid #fed7aa', padding: '10px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#9a3412' }}>• {x.subject_name}</span>
                          <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 800 }}>
                            গড় নম্বর: {x.avg_marks}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#65a30d', fontSize: '13px' }}>
                      ✅ কোনো দুর্বল বিষয় চিহ্নিত হয়নি। সামগ্রিক ফলাফল সন্তোষজনক।
                    </p>
                  )}
                </div>

                <div style={{ border: '1px solid #c7d2fe', borderRadius: '10px', background: '#f5f3ff', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#4338ca', fontSize: '15px', fontWeight: 800 }}>
                    💡 AI সুপারিশ ও উন্নতির করণীয়
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(insight.tips || [
                      'প্রতিদিনের ক্লাসে ৯০% এর বেশি উপস্থিতি নিশ্চিত করুন।',
                      'গণিত ও বিজ্ঞান বিষয়ের অধ্যায়ভিত্তিক মক টেস্টে নিয়মিত অংশগ্রহণ করুন।',
                      'শিক্ষকের দেওয়া অ্যাসাইনমেন্ট সময়মতো জমা দিন।'
                    ]).map((tip, i) => (
                      <div key={i} style={{ background: '#ffffff', border: '1px solid #e0e7ff', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', color: '#334155' }}>
                        ✓ {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <span style={{ fontSize: '32px' }}>📊</span>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                {loadingInsight ? 'অ্যানালিটিক্স লোড হচ্ছে...' : 'Student account link থাকলে ব্যক্তিগত attendance ও result data থেকে স্বয়ংক্রিয় insights প্রদর্শিত হবে।'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
