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
  const khaleqTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আব্দুল খালেক')) || (t.subject && t.subject.includes('বাংলা'))) || teachers[3] || MOCK_TEACHERS[3];
  const ashrafulTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আশরাফুল')) || (t.subject && (t.subject.includes('ইংরেজী') || t.subject.includes('English')))) || teachers[11] || MOCK_TEACHERS[11];
  const shahinTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('শাহিন') || t.name_bn?.includes('শাহীন')) || t.role === 'librarian') || teachers[7] || MOCK_TEACHERS[7];
  const ictTeacher = teachers.find(t => (t.name_bn && t.name_bn.includes('আবুবকর')) || (t.subject && (t.subject.includes('আইসিটি') || t.subject.includes('ICT')))) || teachers[2] || MOCK_TEACHERS[2];

  // Submission Form State
  const emptySubmission = {
    student_name: '',
    class_name: '৯',
    roll_no: '',
    department: 'বিজ্ঞান',
    mobile: '',
    type: 'poem',
    title: '',
    content: ''
  };
  const [subForm, setSubForm] = useState(emptySubmission);
  const [subReceipt, setSubReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [subMsg, setSubMsg] = useState('');

  const handleFillDemo = () => {
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
    setSubMsg('✓ ডেমো শিক্ষার্থীর তথ্য ও স্বরচিত কবিতা পূরণ করা হয়েছে।');
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
        membership: 'সদস্যপদ আবেদন'
      };
      const res = await requestApi('/club-submissions', {
        method: 'POST',
        body: JSON.stringify({
          ...subForm,
          type_label: typeLabels[subForm.type] || 'দেয়াল পত্রিকার লেখা'
        })
      });
      setSubReceipt(res);
      setSubMsg('অভিনন্দন! তোমার লেখাটি ভাষা ও সাহিত্য ক্লাবের মডারেটর শিক্ষকমণ্ডলীর পর্যালোচনায় সফলভাবে জমা হয়েছে।');
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
পক্ষীরাজের ডানা ঝাপটে মেঘের দেশে ছোটে।

বিজ্ঞানীদের জগৎ ঘুরে চাঁদে পাঠাই রকেট,
জ্ঞানের আলোয় পূর্ণ করি আমার মনের পকেট।
বই পড়লে মন ভালো হয়, বাড়ে বুদ্ধি জ্ঞান,
মগড়া স্কুলের পাঠাগারে জুড়ায় মনের প্রাণ।`
    },
    {
      id: 'art-4',
      type: 'essay',
      type_label: 'প্রবন্ধ',
      title: 'ডিজিটাল যুগে মাতৃভাষার মর্যাদা ও শুদ্ধ চর্চা',
      author: 'রাহাত হাসান',
      class_name: '১০ম শ্রেণি (বিজ্ঞান)',
      roll_no: '৫',
      date: 'ফেব্রুয়ারি ২০২৬',
      excerpt: 'প্রযুক্তির এই স্বর্ণযুগে সামাজিক যোগাযোগ মাধ্যমে বাংলা লেখার ক্ষেত্রে শুদ্ধ বানান ও ব্যাকরণ মেনে চলা আমাদের জাতীয় দায়িত্ব...',
      content: `একবিংশ শতাব্দীর এই তথ্যপ্রযুক্তির যুগে আমরা বিশ্বায়নের অংশ। সামাজিক যোগাযোগ মাধ্যম, স্মার্টফোন এবং ইন্টারনেটের কল্যাণে তথ্য আদান-প্রদান এখন চোখের পলকে ঘটে। কিন্তু এই দ্রুততার স্রোতে ভেসে গিয়ে আমাদের প্রিয় মাতৃভাষা কি তার নিজস্ব শুদ্ধ রূপ ও মাধুর্য হারাচ্ছে? 

আজকাল ডিজিটাল মাধ্যমে তথাকথিত 'বাংলিশ' (ইংরেজি হরফে বাংলা লেখা) কিংবা বিকৃত বানানের ছড়াছড়ি লক্ষ্য করা যায়। এটি কেবল ভাষার সৌন্দর্যকেই নষ্ট করে না, বরং ভবিষ্যৎ প্রজন্মের কাছে ভাষার প্রমিত রূপটিকেই অপরিচিত করে তোলে। যে ভাষার জন্য সালাম, বরকত, রফিক, জব্বারের মতো তরুণরা বুকের তাজা রক্ত ঢেলে দিয়েছিলেন, সেই ভাষার মর্যাদা অক্ষুণ্ণ রাখা প্রতিটি নাগরিকের নৈতিক দায়িত্ব।

ডিজিটাল প্ল্যাটফর্মে ইউনিকোড বাংলা ফন্ট ও সহজ বাংলা কিবোর্ডের ব্যবহার এখন অত্যন্ত সহজলভ্য। তাই সোশ্যাল মিডিয়া, ওয়েবসাইট কিংবা মোবাইলে বার্তা প্রেরণের সময় শুদ্ধ বানানরীতি ও প্রমিত বাংলা ব্যাকরণ মেনে চলা অত্যন্ত জরুরি। মগড়া পালস্ ভাষা ও সাহিত্য ক্লাবের অন্যতম প্রধান লক্ষ্য শিক্ষার্থীদের মাঝে প্রযুক্তির সঠিক ব্যবহারের পাশাপাশি মাতৃভাষার শুদ্ধ প্রয়োগের অভ্যাস গড়ে তোলা। আমরা প্রযুক্তি ব্যবহার করব বাংলাকে সমৃদ্ধ করতে, বিকৃত করতে নয়।`
    },
    {
      id: 'art-5',
      type: 'english',
      type_label: 'Creative English Poem',
      title: 'Echoes of Dawn',
      author: 'Sumaiya Khatun',
      class_name: 'Class 8',
      roll_no: '2',
      date: 'Spring 2026',
      excerpt: 'Through misty mornings and fields of green, Magra whispers the tales unseen...',
      content: `Through misty mornings and fields of green,
Magra whispers the tales unseen.
The school bell rings across the lawn,
Welcoming the golden light of dawn.

With pen and book, our spirits rise,
Like eagles soaring towards the skies.
We learn of words that mend and heal,
And courage made of shining steel.

No matter where our footsteps roam,
This seat of learning feels like home.
In every heart, a dream shall stay,
To guide our homeland day by day.`
    }
  ];

  return (
    <div className="lit-club-wrapper">
      <style>{`
        .lit-club-wrapper {
          font-family: 'Hind Siliguri', 'SolaimanLipi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
        }
        .lit-hero {
          background: linear-gradient(135deg, #091a2b 0%, #172554 45%, #064e3b 100%);
          color: #ffffff;
          padding: 24px;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(9,26,43,0.18);
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .lit-hero::after {
          content: '🪶';
          position: absolute;
          right: 18px;
          bottom: -15px;
          font-size: 110px;
          opacity: 0.12;
          pointer-events: none;
        }
        .lit-hero-tagline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 215, 0, 0.16);
          color: #fde047;
          border: 1px solid rgba(253, 224, 71, 0.35);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4px;
          margin-bottom: 10px;
        }
        .lit-hero-title {
          font-size: 24px;
          font-weight: 900;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .lit-hero-sub {
          font-size: 13.5px;
          opacity: 0.9;
          margin: 0 0 16px 0;
          max-width: 680px;
          line-height: 1.5;
        }
        .lit-hero-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .lit-pill {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .club-selector-bar {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        .club-switch-btn {
          border: none;
          background: #f1f5f9;
          color: #475569;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .club-switch-btn.active {
          background: #1e3a8a;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(30, 58, 138, 0.25);
        }
        .lit-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          margin-bottom: 18px;
          background: #f8fafc;
          padding: 5px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .lit-tab-btn {
          flex: 1;
          min-width: 110px;
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
        }
        .lit-tab-btn.active {
          background: #047857;
          color: #ffffff;
          box-shadow: 0 2px 5px rgba(4, 120, 87, 0.25);
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
          color: #065f46;
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

      {/* TOP CLUB SELECTOR */}
      <div className="club-selector-bar">
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'literature' ? 'active' : ''}`}
          onClick={() => setActiveClub('literature')}
        >
          📚 ভাষা ও সাহিত্য ক্লাব (প্রধান)
        </button>
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'debate' ? 'active' : ''}`}
          onClick={() => setActiveClub('debate')}
        >
          🎤 ডিবেটিং ক্লাব (বিতর্ক)
        </button>
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'science' ? 'active' : ''}`}
          onClick={() => setActiveClub('science')}
        >
          🔬 বিজ্ঞান ক্লাব
        </button>
        <button
          type="button"
          className={`club-switch-btn ${activeClub === 'ict' ? 'active' : ''}`}
          onClick={() => setActiveClub('ict')}
        >
          💻 আইসিটি ও প্রোগ্রামিং ক্লাব
        </button>
      </div>

      {activeClub === 'literature' ? (
        <div>
          {/* HERO BANNER */}
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

          {/* INTERNAL TAB NAVIGATION */}
          <div className="lit-tabs">
            <button
              type="button"
              className={`lit-tab-btn ${clubTab === 'overview' ? 'active' : ''}`}
              onClick={() => setClubTab('overview')}
            >
              🌟 পরিচিতি ও লক্ষ্য
            </button>
            <button
              type="button"
              className={`lit-tab-btn ${clubTab === 'advisors' ? 'active' : ''}`}
              onClick={() => setClubTab('advisors')}
            >
              👨‍🏫 উপদেষ্টা পরিষদ
            </button>
            <button
              type="button"
              className={`lit-tab-btn ${clubTab === 'kisholoy' ? 'active' : ''}`}
              onClick={() => setClubTab('kisholoy')}
            >
              📰 দেয়াল পত্রিকা 'কিশলয়'
            </button>
            <button
              type="button"
              className={`lit-tab-btn ${clubTab === 'programs' ? 'active' : ''}`}
              onClick={() => setClubTab('programs')}
            >
              🎯 বাৎসরিক কর্মসূচি
            </button>
            <button
              type="button"
              className={`lit-tab-btn ${clubTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setClubTab('achievements')}
            >
              🏆 অর্জন ও সম্মাননা
            </button>
            <button
              type="button"
              className={`lit-tab-btn ${clubTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setClubTab('submissions')}
            >
              📝 লেখা জমা ও সদস্যপদ
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {clubTab === 'overview' && (
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

              {/* Dynamic Club Announcements from Admin */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#047857', fontSize: '15px' }}>📢 ক্লাবের সর্বশেষ ঘোষণা ও নোটিশ</h4>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>লাইভ সিঙ্ক</span>
                </div>
                {dynamicContent.filter(x => x.content_type === 'club' || (x.title_bn && (x.title_bn.includes('সাহিত্য') || x.title_bn.includes('কিশলয়') || x.title_bn.includes('আবৃত্তি')))).slice(0, 3).map(item => (
                  <div key={item.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 0' }}>
                    <b style={{ color: '#1e293b', fontSize: '13.5px' }}>{item.title_bn}</b>
                    <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 4px' }}>
                      📍 {item.location || 'বিদ্যালয় ক্যাম্পাস'} {item.event_date ? `• 📅 ${item.event_date}` : ''}
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#334155' }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADVISORS & EXECUTIVE COUNCIL */}
          {clubTab === 'advisors' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#1e293b' }}>
                  👨‍🏫 শিক্ষক উপদেষ্টা ও মডারেটর পরিষদ
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  অভিজ্ঞ শিক্ষকমণ্ডলীর সরাসরি তত্ত্বাবধানে শিক্ষার্থীদের সার্বিক সাহিত্যিক ও বাচিক প্রতিভার উন্মেষ ঘটছে:
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
                      “সাহিত্যচর্চা শিক্ষার্থীর আত্মিক উন্নয়ন ও সংবেদনশীল মানবিক বোধ জাগ্রত করে।”
                    </small>
                  </div>
                </div>

                {/* Main Moderator: Bangla Teacher Md. Abdul Khaleq */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #047857' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(khaleqTeacher)} alt={khaleqTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>প্রধান মডারেটর (বাংলা সাহিত্য)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{khaleqTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (বাংলা) • বি.এ (অনার্স), এম.এ, বি.এড</p>
                    <small style={{ color: '#047857', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: বাংলা সাহিত্য পাঠদান, প্রমিত বানান কর্মশালা ও দেয়াল পত্রিকা ‘কিশলয়’ প্রধান সম্পাদক
                    </small>
                  </div>
                </div>

                {/* Assistant Moderator: English Teacher Ashraful */}
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

                {/* Advisor: Asst Head Teacher Tapasi Sarker */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(asstHead)} alt={asstHead.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>উপদেষ্টা (সাংস্কৃতিক ও নাট্য)</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{asstHead.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>{asstHead.designation || 'সহকারী প্রধান শিক্ষক'}</p>
                    <small style={{ color: '#6d28d9', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: আবৃত্তি, বাচিক শিল্প ও বাৎসরিক সাংস্কৃতিক মেলবন্ধন তত্ত্বাবধান
                    </small>
                  </div>
                </div>

                {/* Library Coordinator: Md. Shahin Mia */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #0891b2' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(shahinTeacher)} alt={shahinTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#cffafe', color: '#155e75', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>গ্রন্থাগার ও পাঠচক্র সমন্বয়ক</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{shahinTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (গ্রন্থাগার ও কৃষি শিক্ষা)</p>
                    <small style={{ color: '#0e7490', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: পাঠচক্র পরিচালনা, বিশ্বসাহিত্য পাঠ ও রেফারেন্স গ্রন্থ সহায়তা
                    </small>
                  </div>
                </div>

                {/* Tech & Digital Magazine Coordinator: Md. Abubakor Siddiq */}
                <div className="moderator-card" style={{ borderLeft: '4px solid #2563eb' }}>
                  <div className="moderator-photo">
                    <img src={getTeacherPhoto(ictTeacher)} alt={ictTeacher.name_bn} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>ডিজিটাল পাবলিকেশন সমন্বয়ক</span>
                    <h4 style={{ margin: '2px 0', fontSize: '15px', color: '#0f172a' }}>{ictTeacher.name_bn}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>সহকারী শিক্ষক (আইসিটি) ও সুপার অ্যাডমিন</p>
                    <small style={{ color: '#1d4ed8', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                      দায়িত্ব: দেয়াল পত্রিকার অনলাইন ই-ভার্সন ও ক্লাউড ডেটাবেস সংরক্ষণ
                    </small>
                  </div>
                </div>
              </div>

              {/* Student Executive Council 2026 */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '15px' }}>
                  🎓 শিক্ষার্থী কার্যনির্বাহী পরিষদ (২০২৬)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <small style={{ color: '#047857', fontWeight: 700 }}>সভাপতি (শিক্ষার্থী)</small>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>তানভীর আহমেদ</div>
                    <small style={{ color: '#64748b' }}>১০ম শ্রেণি • রোল ১</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <small style={{ color: '#047857', fontWeight: 700 }}>সাধারণ সম্পাদক</small>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>ফাতেমা আক্তার</div>
                    <small style={{ color: '#64748b' }}>৯ম শ্রেণি (বিজ্ঞান) • রোল ২</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <small style={{ color: '#047857', fontWeight: 700 }}>সাহিত্য সম্পাদক</small>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>ফারজানা মেহজাবীন</div>
                    <small style={{ color: '#64748b' }}>৯ম শ্রেণি (বিজ্ঞান) • রোল ৩</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <small style={{ color: '#047857', fontWeight: 700 }}>দেয়াল পত্রিকা ও অলঙ্করণ সম্পাদক</small>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>রাহাত হাসান</div>
                    <small style={{ color: '#64748b' }}>১০ম শ্রেণি • রোল ৫</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <small style={{ color: '#047857', fontWeight: 700 }}>পাঠচক্র সমন্বয়কারী</small>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>মাহির ফয়সাল</div>
                    <small style={{ color: '#64748b' }}>৭ম শ্রেণি • রোল ১</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <small style={{ color: '#047857', fontWeight: 700 }}>সদস্য সংগ্রহ ও প্রচার সম্পাদক</small>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>সুমাইয়া খাতুন</div>
                    <small style={{ color: '#64748b' }}>৮ম শ্রেণি • রোল ২</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KISHOLOY WALL MAGAZINE */}
          {clubTab === 'kisholoy' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                border: '1px solid #fde68a',
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
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', color: '#92400e', fontWeight: 900 }}>
                    📰 দেয়াল পত্রিকা ‘কিশলয়’ — অমর একুশে ও বসন্ত সংখ্যা ২০২৬
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>
                    প্রধান উপদেষ্টা: মোঃ আব্দুল খালেক (বাংলা) • সম্পাদনা: ফারজানা মেহজাবীন ও তানভীর আহমেদ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setClubTab('submissions')}
                  style={{
                    background: '#92400e',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✍️ তোমার স্বরচিত লেখা জমা দাও →
                </button>
              </div>

              {/* Grid of Student Wall Magazine Submissions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
                {kisholoyArticles.map(art => (
                  <div key={art.id} className="kisholoy-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: art.type === 'poem' ? '#fce7f3' : art.type === 'story' ? '#e0f2fe' : art.type === 'rhyme' ? '#fef3c7' : '#dcfce7',
                        color: art.type === 'poem' ? '#9d174d' : art.type === 'story' ? '#0369a1' : art.type === 'rhyme' ? '#92400e' : '#15803d',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 800
                      }}>
                        {art.type_label}
                      </span>
                      <small style={{ color: '#64748b', fontSize: '11px' }}>{art.date}</small>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b', fontWeight: 800 }}>
                      {art.title}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                      লেখক/কবি: {art.author} ({art.class_name})
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.5, fontStyle: art.type === 'poem' ? 'italic' : 'normal' }}>
                      {art.excerpt}
                    </p>
                    <button
                      type="button"
                      onClick={() => setReadingItem(art)}
                      style={{
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      📖 সম্পূর্ণ রচনা পড়ুন →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANNUAL PROGRAMS */}
          {clubTab === 'programs' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#1e293b' }}>
                  🎯 বাৎসরিক সাহিত্য ও সাংস্কৃতিক কর্মসূচি ক্যালেন্ডার (২০২৬)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  বছরজুড়ে শিক্ষার্থীদের মেধা, সৃজনশীল মনন ও প্রমিত ভাষা বিকাশে ধারাবাহিক আয়োজন:
                </p>
              </div>

              <div className="event-timeline">
                <div className="event-row">
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>২১শে ফেব্রুয়ারি</span>
                  <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#0f172a' }}>অমর একুশে সাহিত্য আসর, শুদ্ধ বানান ও আবৃত্তি প্রতিযোগিতা</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                    শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস উপলক্ষে প্রভাতফেরী শেষে দেয়াল পত্রিকা 'কিশলয়' বিশেষ সংখ্যা উন্মোচন ও ভাষা শহীদ স্মরণে স্বরচিত কবিতা পাঠ।
                  </p>
                </div>

                <div className="event-row">
                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>২৬শে মার্চ</span>
                  <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#0f172a' }}>স্বাধীনতা ও জাতীয় দিবসের বিশেষ সাহিত্য প্রকাশনা</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                    মুক্তিযুদ্ধের স্মৃতিচারণ, বীরত্বগাথা বিষয়ক রচনা প্রতিযোগিতা ও স্বাধীনতা সংখ্যার মোড়ক উন্মোচন।
                  </p>
                </div>

                <div className="event-row">
                  <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>৮ই ও ২৫শে মে</span>
                  <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#0f172a' }}>রবীন্দ্র-নজরুল জন্মজয়ন্তী ও গীতি-আলেখ্য</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                    বিশ্বকবি রবীন্দ্রনাথ ঠাকুর ও জাতীয় কবি কাজী নজরুল ইসলামের সাহিত্যকর্ম নিয়ে বিশেষ পাঠচক্র, সাহিত্য কুইজ ও গান-কবিতার মেলবন্ধন।
                  </p>
                </div>

                <div className="event-row">
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>প্রতি বৃহস্পতিবার (সারা বছর)</span>
                  <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#0f172a' }}>বৃহস্পতিবারের সাহিত্য পাঠচক্র ও বুক রিভিউ আসর</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                    বিকাল ৩:৩০ মিনিটে লাইব্রেরিতে শিক্ষার্থীদের পছন্দের বইয়ের সারাংশ পাঠ, বিতর্কচর্চা ও তাৎক্ষণিক গল্প বলা।
                  </p>
                </div>

                <div className="event-row">
                  <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>১৫ই অক্টোবর</span>
                  <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#0f172a' }}>শরৎ সাহিত্য মেলা ও আন্তঃশ্রেণি তাৎক্ষণিক বক্তৃতা উৎসব</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                    ৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের মাঝে উপস্থিত বক্তৃতা ও সুন্দর হাতের লেখা প্রতিযোগিতা।
                  </p>
                </div>

                <div className="event-row">
                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>১৬ই ডিসেম্বর</span>
                  <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#0f172a' }}>মহান বিজয় দিবস সাহিত্য সাময়িকী ‘প্রবাহ’ ও শ্রেষ্ঠ লেখক পুরস্কার</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                    বছরের সেরা গল্প, কবিতা ও প্রবন্ধ লেখক শিক্ষার্থীকে বিশেষ সম্মাননা ক্রেস্ট ও বই পুরস্কার প্রদান।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS & AWARDS */}
          {clubTab === 'achievements' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#1e293b' }}>
                  🏆 ভাষা ও সাহিত্য ক্লাবের অনন্য অর্জন ও সম্মাননা
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  উপজেলা ও জেলা পর্যায়ে আমাদের শিক্ষার্থীদের সাহিত্যিক ও বাচিক প্রতিভার ধারাবাহিক স্বীকৃতি:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div className="achievement-badge-card">
                  <span style={{ fontSize: '36px' }}>🥇</span>
                  <div>
                    <span style={{ fontSize: '11px', background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>জেলা পর্যায়ে ১ম স্থান (স্বর্ণপদক)</span>
                    <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#78350f' }}>টাঙ্গাইল জেলা আবৃত্তি উৎসব ২০২৫</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                      বিজয়িনী: <b>ফারজানা মেহজাবীন</b> (৯ম শ্রেণি) • কবিতা: 'বিদ্রোহী' আবৃত্তি
                    </p>
                  </div>
                </div>

                <div className="achievement-badge-card">
                  <span style={{ fontSize: '36px' }}>🥈</span>
                  <div>
                    <span style={{ fontSize: '11px', background: '#64748b', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>উপজেলা রানার্স-আপ ট্রফি</span>
                    <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#334155' }}>কালিহাতি আন্তঃবিদ্যালয় বিতর্ক উৎসব ২০২৫</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                      দলনেতা: <b>রাহাত হাসান</b> (১০ম) • বক্তা: ফাতেমা আক্তার ও তানভীর আহমেদ
                    </p>
                  </div>
                </div>

                <div className="achievement-badge-card">
                  <span style={{ fontSize: '36px' }}>🎖️</span>
                  <div>
                    <span style={{ fontSize: '11px', background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>জাতীয় শিক্ষা সপ্তাহ ২০২৪</span>
                    <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#065f46' }}>উপজেলা শ্রেষ্ঠ শিক্ষার্থী (সাহিত্য ও সংস্কৃতি)</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>
                      নির্বাচিত: <b>মাহির ফয়সাল</b> (৭ম শ্রেণি)
                    </p>
                  </div>
                </div>

                <div className="achievement-badge-card">
                  <span style={{ fontSize: '36px' }}>✍️</span>
                  <div>
                    <span style={{ fontSize: '11px', background: '#7c3aed', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>বিশেষ মেধা সম্মাননা</span>
                    <h4 style={{ margin: '3px 0', fontSize: '15px', color: '#4c1d95' }}>জেলা শিশু একাডেমি সুন্দর হস্তলিপি ২০২৪</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6d28d9' }}>
                      সম্মাননা লাভ: <b>তানভীর আহমেদ</b> (১০ম শ্রেণি)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUBMISSION & MEMBERSHIP APPLICATION */}
          {clubTab === 'submissions' && (
            <div>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '16px', color: '#0f172a' }}>
                      📝 দেয়াল পত্রিকা ‘কিশলয়’-এর লেখা জমা ও সদস্যপদ আবেদন
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      ৬ষ্ঠ থেকে ১০ম শ্রেণির যে কোনো শিক্ষার্থী তার স্বরচিত লেখা জমা দিতে বা ক্লাবের সদস্য হতে পারবে:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    style={{
                      background: '#e0e7ff',
                      color: '#3730a3',
                      border: '1px solid #c7d2fe',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
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
                      তোমার লেখা সফলভাবে জমা হয়েছে!
                    </h4>
                    <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#047857' }}>
                      ট্র্যাকিং আইডি: <b style={{ background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86efac' }}>{subReceipt.tracking_id}</b>
                    </p>
                    <div style={{ maxWidth: '500px', margin: '0 auto 16px auto', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'left', fontSize: '12.5px' }}>
                      <div><b>শিক্ষার্থীর নাম:</b> {subReceipt.student_name} (শ্রেণি {subReceipt.class_name}, রোল {subReceipt.roll_no})</div>
                      <div><b>রচনার শিরোনাম:</b> {subReceipt.title}</div>
                      <div><b>ধরন:</b> {subReceipt.type_label}</div>
                      <div><b>স্থিতি:</b> <span style={{ color: '#d97706', fontWeight: 700 }}>পর্যালোচনায় অপেক্ষমাণ (Pending Review)</span></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubReceipt(null)}
                      style={{
                        background: '#047857',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 18px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      আরেকটি লেখা বা আবেদন জমা দিন
                    </button>
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
                          placeholder="যেমন: ফারজানা মেহজাবীন"
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
                          placeholder="যেমন: ৩"
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
                          <option value="poem">📜 স্বরচিত কবিতা (দেয়াল পত্রিকা)</option>
                          <option value="story">📖 ছোটগল্প</option>
                          <option value="rhyme">🌸 ছড়া</option>
                          <option value="essay">💡 প্রবন্ধ / নিবন্ধ</option>
                          <option value="book_review">📝 বুক রিভিউ</option>
                          <option value="english">🇬🇧 Creative English Writing</option>
                          <option value="membership">🤝 ক্লাবের সদস্যপদ আবেদন</option>
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
                          placeholder="যেমন: 01712-345678"
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>লেখার শিরোনাম / বিষয়ের নাম *</label>
                        <input
                          type="text"
                          required
                          value={subForm.title}
                          onChange={e => setSubForm({ ...subForm, title: e.target.value })}
                          placeholder="যেমন: রক্তে রাঙা একুশ"
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>
                        মূল লেখা / কবিতা / গল্প / সদস্যপদের আগ্রহপত্র *
                      </label>
                      <textarea
                        rows="5"
                        required
                        value={subForm.content}
                        onChange={e => setSubForm({ ...subForm, content: e.target.value })}
                        placeholder="এখানে তোমার কবিতা, গল্প বা রচনাটি সুন্দরভাবে লেখো..."
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>

                    {subMsg && <p style={{ color: '#047857', fontWeight: 700, fontSize: '12.5px', margin: '0 0 10px 0' }}>{subMsg}</p>}

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: '#047857',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)'
                      }}
                    >
                      {submitting ? 'জমা দেওয়া হচ্ছে...' : '🚀 ক্লাবে লেখা জমা দিন'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* READING FULL ITEM MODAL */}
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
                border: '2px solid #b45309',
                borderRadius: '14px',
                maxWidth: '650px',
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

                <div style={{ textAlign: 'center', borderBottom: '2px solid #fef3c7', paddingBottom: '14px', marginBottom: '16px' }}>
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                    দেয়াল পত্রিকা ‘কিশলয়’ • {readingItem.type_label}
                  </span>
                  <h3 style={{ margin: '8px 0 4px 0', fontSize: '22px', color: '#1e293b', fontWeight: 900 }}>
                    {readingItem.title}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#047857', fontWeight: 700 }}>
                    রচয়িতা: {readingItem.author} ({readingItem.class_name}, রোল {readingItem.roll_no})
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
                  padding: '10px 14px',
                  background: '#fdfbf7',
                  borderRadius: '8px',
                  border: '1px solid #f2e8dc'
                }}>
                  {readingItem.content}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ color: '#64748b' }}>মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব আর্কাইভ</small>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      background: '#047857',
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
      ) : activeClub === 'debate' ? (
        /* DEBATE CLUB OVERVIEW */
        <div style={{ padding: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>যুক্তি, মনন ও বাচনভঙ্গির লড়াই</span>
            <h3 style={{ margin: '6px 0 4px', fontSize: '20px' }}>🎤 মগড়া পালস্ ডিবেটিং ক্লাব (Debating Society)</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              যুক্তি দিয়ে সত্যের অন্বেষণ ও প্রাতিষ্ঠানিক বিতর্কচর্চার মাধ্যমে শিক্ষার্থীদের নেতৃত্ব ও বাগ্মিতা বিকাশ।
            </p>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card">
              <h4>বারোয়ারি ও সংসদীয় বিতর্ক</h4>
              <p>জাতীয় দিবসসমূহে নিয়মিত আন্তঃশ্রেণি বিতর্ক উৎসব আয়োজন।</p>
            </div>
            <div className="pillar-card">
              <h4>উপজেলা পর্যায়ে রানার্স-আপ</h4>
              <p>কালিহাতি উপজেলা বিতর্ক উৎসব ২০২৫-এ অনন্য সাফল্য অর্জন।</p>
            </div>
            <div className="pillar-card">
              <h4>মডারেটর</h4>
              <p>মোঃ আব্দুল খালেক (বাংলা) ও আশরাফুল (ইংরেজি)</p>
            </div>
          </div>
        </div>
      ) : activeClub === 'science' ? (
        /* SCIENCE CLUB OVERVIEW */
        <div style={{ padding: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>বিজ্ঞান মেলা ও উদ্ভাবন</span>
            <h3 style={{ margin: '6px 0 4px', fontSize: '20px' }}>🔬 মগড়া ইয়ুথ সাইন্স ক্লাব</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              খুদে বিজ্ঞানীদের রোবটিক্স, পরিবেশ সংরক্ষণ ও খুদে প্রজেক্ট প্রদর্শনী।
            </p>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card">
              <h4>বার্ষিক বিজ্ঞান মেলা</h4>
              <p>প্রতি বছর শতাধিক খুদে বিজ্ঞানীর উদ্ভাবনী প্রজেক্ট উপস্থাপন।</p>
            </div>
            <div className="pillar-card">
              <h4>মডারেটর</h4>
              <p>মোঃ হাবিবুর রহমান (গণিত ও বিজ্ঞান) ও রফিকুল ইসলাম (ভৌত বিজ্ঞান)</p>
            </div>
          </div>
        </div>
      ) : (
        /* ICT CLUB OVERVIEW */
        <div style={{ padding: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ডিজিটাল বাংলাদেশ ও স্মার্ট শিক্ষা</span>
            <h3 style={{ margin: '6px 0 4px', fontSize: '20px' }}>💻 ডিজিটাল আইসিটি ও কোডিং ক্লাব</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              প্রোগ্রামিং, কোডিং, গ্রাফিক্স ডিজাইন ও সাইবার সচেতনতা বৃদ্ধি।
            </p>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card">
              <h4>শেখ রাসেল কম্পিউটার ল্যাব</h4>
              <p>আধুনিক কম্পিউটার ল্যাবে হাতে-কলমে কোডিং ও ডিজিটাল কনটেন্ট তৈরি প্রশিক্ষণ।</p>
            </div>
            <div className="pillar-card">
              <h4>মডারেটর</h4>
              <p>মুহাম্মদ আবুবকর সিদ্দিক (সহকারী শিক্ষক - আইসিটি ও সুপার অ্যাডমিন)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
