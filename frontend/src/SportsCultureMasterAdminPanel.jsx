import React, { useState, useEffect } from 'react';
import { getStoredReligiousEventsData, saveStoredReligiousEventsData, DEFAULT_RELIGIOUS_EVENTS } from './religiousEventsData';
import { SportsCultureAdminEngine } from './SportsCultureAdminEngine';
import { LanguageLiteratureClubSection } from './LanguageLiteratureClubSection';
import { SubmenuDetailModal } from './SubmenuDetailModal';

export function SportsCultureMasterAdminPanel({ sub, setSub }) {
  const [activeTab, setActiveTab] = useState(sub || 'sports');
  const [religiousData, setReligiousData] = useState(getStoredReligiousEventsData);
  const [toastMsg, setToastMsg] = useState('');
  const [previewModalKey, setPreviewModalKey] = useState(null);

  useEffect(() => {
    if (sub && sub !== activeTab) {
      setActiveTab(sub);
    }
  }, [sub]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (setSub) setSub(key);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSaveReligious = (type) => {
    const success = saveStoredReligiousEventsData(religiousData);
    if (success) {
      showToast(`✓ '${type === 'milad' ? 'মিলাদ-মাহফিল' : 'পূজা'}' এর তথ্য সফলভাবে সংরক্ষিত হয়েছে এবং ভিউ পেজে লাইভ আপডেট হয়েছে!`);
    } else {
      showToast('❌ তথ্য সংরক্ষণে ত্রুটি দেখা দিয়েছে।');
    }
  };

  const handleResetReligious = (type) => {
    if (!confirm(`আপনি কি '${type === 'milad' ? 'মিলাদ-মাহফিল' : 'পূজা'}' এর তথ্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?`)) return;
    const updated = {
      ...religiousData,
      [type]: JSON.parse(JSON.stringify(DEFAULT_RELIGIOUS_EVENTS[type]))
    };
    setReligiousData(updated);
    saveStoredReligiousEventsData(updated);
    showToast(`✓ '${type === 'milad' ? 'মিলাদ-মাহফিল' : 'পূজা'}' ডিফল্ট ডেটায় রিসেট হয়েছে।`);
  };

  const tabsList = [
    { key: 'debate', label: 'ডিবেটিং ক্লাব', icon: '🎙️' },
    { key: 'science', label: 'বিজ্ঞান ক্লাব', icon: '🔬' },
    { key: 'ict', label: 'আইসিটি ক্লাব', icon: '💻' },
    { key: 'literature', label: 'ভাষা ও সাহিত্য', icon: '📖' },
    { key: 'clubs', label: 'সকল ক্লাব ডিরেক্টরি', icon: '🏛️' },
    { key: 'sports', label: 'বার্ষিক ক্রীড়া', icon: '🏃‍♂️' },
    { key: 'culture', label: 'সাংস্কৃতিক অনুষ্ঠান', icon: '🎭' },
    { key: 'achievements', label: 'অর্জন ও পুরস্কার', icon: '🏆' },
    { key: 'tour', label: 'শিক্ষা সফর', icon: '🚌' },
    { key: 'lab', label: 'কম্পিউটার ল্যাব', icon: '🖥️' },
    { key: 'multimedia', label: 'মাল্টিমিডিয়া ক্লাস', icon: '📽️' },
    { key: 'scouts', label: 'স্কাউট ও গাইড', icon: '⚜️' },
    { key: 'inter', label: 'আন্তঃবিদ্যালয় ক্রীড়া', icon: '⚽' },
    { key: 'milad', label: 'মিলাদ-মাহফিল', icon: '🕌' },
    { key: 'puja', label: 'পূজা', icon: '🪔' }
  ];

  const navKeyMap = {
    debate: 'public.nav.sport.debate',
    science: 'public.nav.sport.science',
    ict: 'public.nav.sport.ict',
    literature: 'public.nav.sport.literature',
    clubs: 'public.nav.sport.clubs',
    sports: 'public.nav.sport.sports',
    culture: 'public.nav.sport.culture',
    achievements: 'public.nav.sport.achievements',
    tour: 'public.nav.sport.tour',
    lab: 'public.nav.sport.lab',
    multimedia: 'public.nav.sport.multimedia',
    scouts: 'public.nav.sport.scouts',
    inter: 'public.nav.sport.inter',
    milad: 'public.nav.sport.milad',
    puja: 'public.nav.sport.puja'
  };

  const getTabLabel = (k) => tabsList.find(t => t.key === k)?.label || 'ক্রীড়া ও সংস্কৃতি';

  const openPreview = (tabKey) => {
    setPreviewModalKey({
      key: navKeyMap[tabKey] || `public.nav.sport.${tabKey}`,
      title: getTabLabel(tabKey)
    });
  };

  return (
    <div className="sports-culture-master-panel" style={{ padding: '4px' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          fontWeight: 700,
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Main Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 3px 10px rgba(4,120,87,0.2)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '28px'
          }}>
            🏅
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px' }}>
              ক্রীড়া ও সংস্কৃতি সমন্বিত ডাটা ইনপুট ও ব্যবস্থাপনা প্যানেল
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • ভিউ পেজের ১৫টি সহশিক্ষা, ক্লাব, ক্রীড়া ও ধর্মীয় উৎসবের লাইভ তথ্য নিয়ন্ত্রণ
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => openPreview(activeTab)}
            style={{
              background: '#ffffff',
              color: '#065f46',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            👁️ ভিউ পেজে প্রিভিউ দেখুন
          </button>
        </div>
      </div>

      {/* 15 Horizontal Navigation Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        background: '#ffffff',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {tabsList.map((t, idx) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabChange(t.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 11px',
                borderRadius: '6px',
                border: isActive ? '1.5px solid #047857' : '1px solid #e2e8f0',
                background: isActive ? '#ecfdf5' : '#f8fafc',
                color: isActive ? '#065f46' : '#334155',
                fontWeight: isActive ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{t.icon}</span>
              <span>{idx + 1}. {t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content Area */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>

        {/* 1. DEBATE CLUB */}
        {activeTab === 'debate' && (
          <div>
            <GuidanceCard
              title="ডিবেটিং ক্লাব (বিতর্ক)"
              steps={[
                '১. বিতর্কের ধরন (সনাতনী/সংসদীয়) ও প্রস্তাবনা (Motion) নির্ধারণ করুন।',
                '২. সরকারি দল ও বিরোধী দলের বক্তা শিক্ষার্থীদের নাম ও রোল অন্তর্ভুক্ত করুন।',
                '৩. বিতর্কের তারিখ, বিচারকমণ্ডলীর ফলাফল ও শ্রেষ্ঠ বক্তা নির্বাচন নথিভুক্ত করুন।'
              ]}
              tips="সেশন সম্পন্ন হলে ফলাফল প্রকাশ করুন বাটনে ক্লিক করলে তা সরাসরি ভিউ পেজে যুক্ত হবে।"
            />
            <LanguageLiteratureClubSection initialTitle="ডিবেটিং ক্লাব" />
          </div>
        )}

        {/* 2. SCIENCE CLUB */}
        {activeTab === 'science' && (
          <div>
            <GuidanceCard
              title="বিজ্ঞান ক্লাব (মেলা ও উদ্ভাবন)"
              steps={[
                '১. বাৎসরিক বিজ্ঞান মেলা ও ইনোভেশন প্রদর্শনীর সময়সূচি নির্ধারণ করুন।',
                '২. ক্ষুদে বিজ্ঞানীদের প্রজেক্টের নাম (রোবোটিক্স, পরিবেশ, নবায়নযোগ্য জ্বালানি) ও গ্রুপ সদস্যদের নাম এন্ট্রি করুন।',
                '৩. সেরা উদ্ভাবনী প্রজেক্টের ফলাফল ও পুরস্কার নথিভুক্ত করুন।'
              ]}
              tips="শিক্ষার্থীদের দলভিত্তিক প্রজেক্টের ছবি ও বিবরণ যুক্ত করলে আকর্ষণীয় দেখাবে।"
            />
            <LanguageLiteratureClubSection initialTitle="বিজ্ঞান ক্লাব" />
          </div>
        )}

        {/* 3. ICT CLUB */}
        {activeTab === 'ict' && (
          <div>
            <GuidanceCard
              title="আইসিটি ও কোডিং ক্লাব"
              steps={[
                '১. কম্পিউটার ল্যাবে কোডিং ও প্রোগ্রামিং ওয়ার্কশপের সেশন যুক্ত করুন।',
                '২. গ্রাফিক্স ডিজাইন, ওয়েব ডেভেলপমেন্ট বা পাইথন ক্লাসে অংশগ্রহণকারী শিক্ষার্থীদের তালিকা করুন।',
                '৩. সেশনের অর্জন ও প্রজেক্ট প্রদর্শনী নথিভুক্ত করুন।'
              ]}
              tips="আইসিটি শিক্ষক মুহাম্মদ আবুবকর সিদ্দিকের তত্ত্বাবধানে কার্যক্রমগুলো পরিচালিত হয়।"
            />
            <LanguageLiteratureClubSection initialTitle="আইসিটি ও কোডিং ক্লাব" />
          </div>
        )}

        {/* 4. LITERATURE CLUB */}
        {activeTab === 'literature' && (
          <div>
            <GuidanceCard
              title="ভাষা ও সাহিত্য ক্লাব"
              steps={[
                '১. আবৃত্তি, উপস্থিত বক্তৃতা, বিতর্ক ও রচনা প্রতিযোগিতার তারিখ নির্ধারণ করুন।',
                '২. দেয়াল পত্রিকা ও ত্রৈমাসিক সাহিত্য বুলেটিনে প্রকাশিত শিক্ষার্থীদের লেখা ও ছড়া এন্ট্রি করুন।',
                '৩. ভাষা দিবসের বিশেষ ক্রোড়পত্র ও বিজয়ীদের তালিকা তৈরি করুন।'
              ]}
              tips="শিক্ষার্থীদের স্বহস্তে লেখা সৃজনশীল সাহিত্যকর্ম এখানে সংরক্ষণ করা হয়।"
            />
            <LanguageLiteratureClubSection initialTitle="ভাষা ও সাহিত্য ক্লাব" />
          </div>
        )}

        {/* 5. ALL CLUBS DIRECTORY */}
        {activeTab === 'clubs' && (
          <div>
            <GuidanceCard
              title="সকল ক্লাব ও সংগঠন (ডিরেক্টরি)"
              steps={[
                '১. বিদ্যালয়ের সকল ক্লাবের কেন্দ্রীয় সমন্বয় ও সেশনের স্থিতি মনিটর করুন।',
                '২. ক্লাব সভাপতি, সাধারণ সম্পাদক ও মডারেটর শিক্ষকদের তথ্য আপডেট রাখুন।',
                '৩. নতুন ক্লাব সদস্য নিবন্ধন ও বাৎসরিক কার্যক্রম ক্যালেন্ডার হালনাগাদ করুন।'
              ]}
              tips="ক্লাব হাব থেকে সরাসরি যেকোনো ক্লাবের বিস্তারিত পাতা ও কার্যক্রমে প্রবেশ করা যায়।"
            />
            <LanguageLiteratureClubSection initialTitle="সকল ক্লাব ও সংগঠন (ডিরেক্টরি)" />
          </div>
        )}

        {/* 6. ANNUAL SPORTS */}
        {activeTab === 'sports' && (
          <div>
            <GuidanceCard
              title="বার্ষিক ক্রীড়া প্রতিযোগিতা"
              steps={[
                '১. ১০০মি./২০০মি. স্প্রিন্ট, হাই জাম্প, লং জাম্প ও রিলে রেসের ইভেন্ট নির্বাচন করুন।',
                '২. ক-গ্রুপ (৬ষ্ঠ-৭ম), খ-গ্রুপ (৮ম) ও গ-গ্রুপ (৯ম-১০ম) অনুযায়ী প্রতিযোগী ছাত্র-ছাত্রীদের তালিকাভুক্ত করুন।',
                '৩. প্রথম, দ্বিতীয় ও তৃতীয় স্থান অধিকারীদের নাম ও টাইমিং রেকর্ড করে চূড়ান্ত ফলাফল প্রকাশ করুন।'
              ]}
              tips="পদ্মা, মেঘনা, যমুনা ও কর্ণফুলী হাউজভিত্তিক পয়েন্ট স্বয়ংক্রিয়ভাবে হিসাব করা হয়।"
            />
            <SportsCultureAdminEngine initialSection="sports" />
          </div>
        )}

        {/* 7. ANNUAL CULTURAL PROGRAM */}
        {activeTab === 'culture' && (
          <div>
            <GuidanceCard
              title="সাংস্কৃতিক অনুষ্ঠান ও প্রতিযোগিতা"
              steps={[
                '১. রবীন্দ্র সঙ্গীত, নজরুল গীতি, দেশাত্মবোধক গান, একক অভিনয় ও লোকনৃত্য ইভেন্ট নির্ধারণ করুন।',
                '২. অংশগ্রহণকারী শিক্ষার্থী ও নির্দেশক শিক্ষকের নাম এন্ট্রি করুন।',
                '৩. বিচারকমণ্ডলীর নম্বর শিট অনুসারে চূড়ান্ত মেধা তালিকা ও ফলাফল সংরক্ষণ করুন।'
              ]}
              tips="বার্ষিক পুরস্কার বিতরণী অনুষ্ঠানের পূর্বে ফলাফল প্রকাশ সম্পন্ন করুন।"
            />
            <SportsCultureAdminEngine initialSection="culture" />
          </div>
        )}

        {/* 8. ACHIEVEMENTS & AWARDS */}
        {activeTab === 'achievements' && (
          <div>
            <GuidanceCard
              title="অর্জন ও পুরস্কার"
              steps={[
                '১. জাতীয়, বিভাগীয়, জেলা ও উপজেলা পর্যায়ের ক্রীড়া ও সহশিক্ষা অর্জনের তালিকা তৈরি করুন।',
                '২. বিজয়ী শিক্ষার্থী, শিক্ষাবর্ষ, অর্জিত পদক (স্বর্ণ/রৌপ্য/ব্রোঞ্জ/ট্রফি) ও ক্যাটাগরি লিখুন।',
                '৩. বিদ্যালয়ের সার্বিক গৌরবের তথ্য সংরক্ষণে ছবি ও স্মারক নম্বর যুক্ত করুন।'
              ]}
              tips="এখানে এন্ট্রি করা অর্জনগুলো সরাসরি ভিউ পেজের অর্জন ও ট্রফি গ্যালারিতে দৃশ্যমান হয়।"
            />
            <SportsCultureAdminEngine initialSection="achievements" />
          </div>
        )}

        {/* 9. STUDY TOUR */}
        {activeTab === 'tour' && (
          <div>
            <GuidanceCard
              title="শিক্ষা সফর (Study Tour)"
              steps={[
                '১. শিক্ষা সফরের গন্তব্য (যেমন: সুন্দরবন, রাঙামাটি, ময়নামতি বা জাতীয় স্মৃতিসৌধ) নির্ধারণ করুন।',
                '২. সফরের তারিখ, মোট বাসের সংখ্যা, শিক্ষার্থী সংখ্যা ও তত্ত্বাবধায়ক শিক্ষকদের তালিকা এন্ট্রি করুন।',
                '৩. ঐতিহাসিক ও বৈজ্ঞানিক দর্শনীয় স্থানের বিবরণ ও সফরের স্মৃতিচারণ সংরক্ষণ করুন।'
              ]}
              tips="শিক্ষা সফরের সার্বিক নিরাপত্তা ও রুট প্ল্যান এখানে লিপিবদ্ধ রাখা হয়।"
            />
            <SportsCultureAdminEngine initialSection="tour" />
          </div>
        )}

        {/* 10. COMPUTER LAB */}
        {activeTab === 'lab' && (
          <div>
            <GuidanceCard
              title="শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব"
              steps={[
                '১. ল্যাবের মোট সক্রিয় কম্পিউটার, প্রজেক্টর, প্রিন্টার ও রাউটারের সংখ্যা আপডেট করুন।',
                '২. শ্রেণিভিত্তিক ল্যাব প্র্যাকটিক্যাল ক্লাসের সময়সূচি ও ব্যাচ তালিকা তৈরি করুন।',
                '৩. ল্যাব ইনচার্জ ও টেকনিক্যাল সাপোর্ট সহায়তার রেকর্ড সংরক্ষণ করুন।'
              ]}
              tips="কম্পিউটার ল্যাব ব্যবহারে শিক্ষার্থীদের উপস্থিতি ও হ্যান্ডস-অন প্র্যাকটিস ট্র্যাক করা যায়।"
            />
            <SportsCultureAdminEngine initialSection="lab" />
          </div>
        )}

        {/* 11. MULTIMEDIA CLASSROOM */}
        {activeTab === 'multimedia' && (
          <div>
            <GuidanceCard
              title="মাল্টিমিডিয়া ক্লাসরুম ও ডিজিটাল পাঠদান"
              steps={[
                '১. প্রজেক্টরযুক্ত স্মার্ট শ্রেণিকক্ষসমূহের তালিকা ও ব্যবহারকারী শিক্ষকদের নাম নির্বাচন করুন।',
                '২. ডিজিটাল কনটেন্ট ব্যবহারের তারিখ, পিরিয়ড ও পাঠের বিষয় (গণিত, বিজ্ঞান, ইংরেজি) এন্ট্রি করুন।',
                '৩. সরকারি মাউশি মাল্টিমিডিয়া মনিটরিং ড্যাশবোর্ডের জন্য সেশন রিপোর্ট সংরক্ষণ করুন।'
              ]}
              tips="১৬ জন সম্মানিত শিক্ষকের ক্যানোনিক্যাল রোস্টার অনুযায়ী ক্লাস এন্ট্রি সম্পন্ন করুন।"
            />
            <SportsCultureAdminEngine initialSection="multimedia" />
          </div>
        )}

        {/* 12. SCOUTS & GIRLS GUIDE */}
        {activeTab === 'scouts' && (
          <div>
            <GuidanceCard
              title="স্কাউট ও গার্লস গাইড ইউনিট"
              steps={[
                '১. বাংলাদেশ স্কাউটস তালিকাভুক্ত বিদ্যালয়ের স্কাউট ট্রুপ ও গার্লস গাইড ইউনিটের সদস্যদের তালিকা করুন।',
                '২. বাৎসরিক দীক্ষা ক্যাম্প, হাইকিং, কৃতি ক্যাম্পুরী ও সামাজিক সেবামূলক কার্যক্রম এন্ট্রি করুন।',
                '৩. শাপলা কাব বা প্রেসিডেন্ট স্কাউট অ্যাওয়ার্ড অর্জনকারীদের তথ্য সংরক্ষণ করুন।'
              ]}
              tips="জাতীয় দিবসসমূহের কুচকাওয়াজ ও ট্রাফিক শৃঙ্খলার দায়িত্ব স্কাউট ইউনিটের উপর ন্যস্ত থাকে।"
            />
            <SportsCultureAdminEngine initialSection="scouts" />
          </div>
        )}

        {/* 13. INTER-SCHOOL SPORTS */}
        {activeTab === 'inter' && (
          <div>
            <GuidanceCard
              title="আন্তঃবিদ্যালয় ক্রীড়া প্রতিযোগিতা"
              steps={[
                '১. জাতীয় স্কুল ও মাদ্রাসা গ্রীষ্মকালীন/শীতকালীন ক্রীড়া টুর্নামেন্টের ম্যাচের বিবরণ লিখুন।',
                '২. ফুটবল, ক্রিকেট, কাবাডি ও ভলিবল খেলায় প্রতিদ্বন্দ্বী বিদ্যালয়ের নাম ও ভেন্যু এন্ট্রি করুন।',
                '৩. ম্যাচের স্কোরবোর্ড, জয়-পরাজয় ও উপজেলা/জেলা চ্যাম্পিয়নশিপের গৌরবগাঁথা রেকর্ড করুন।'
              ]}
              tips="কালিহাতি উপজেলার বিভিন্ন উচ্চ বিদ্যালয়ের সাথে অনুষ্ঠিত দ্বিপাক্ষিক ম্যাচের ইতিহাস ফুটে ওঠে।"
            />
            <SportsCultureAdminEngine initialSection="inter_sports" />
          </div>
        )}

        {/* 14. MILAD MAHFIL (NEW MODULE) */}
        {activeTab === 'milad' && (
          <SectionMiladAdmin
            data={religiousData.milad}
            onChange={(val) => setReligiousData({ ...religiousData, milad: val })}
            onSave={() => handleSaveReligious('milad')}
            onReset={() => handleResetReligious('milad')}
            onPreview={() => openPreview('milad')}
          />
        )}

        {/* 15. PUJA & RELIGIOUS FESTIVAL (NEW MODULE) */}
        {activeTab === 'puja' && (
          <SectionPujaAdmin
            data={religiousData.puja}
            onChange={(val) => setReligiousData({ ...religiousData, puja: val })}
            onSave={() => handleSaveReligious('puja')}
            onReset={() => handleResetReligious('puja')}
            onPreview={() => openPreview('puja')}
          />
        )}

      </div>

      {/* Live Preview Modal */}
      {previewModalKey && (
        <SubmenuDetailModal
          menuKey={previewModalKey.key}
          title={previewModalKey.title}
          onClose={() => setPreviewModalKey(null)}
          onNavigateRole={() => {}}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Reusable Guidance Card Component
// ----------------------------------------------------
function GuidanceCard({ title, steps, tips }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      background: '#f0fdf4',
      border: '1.5px solid #86efac',
      borderRadius: '10px',
      padding: '12px 16px',
      marginBottom: '16px',
      boxShadow: '0 2px 5px rgba(4,120,87,0.05)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>💡</span>
          <b style={{ color: '#065f46', fontSize: '14.5px' }}>
            সহজ ও সাবলীল নির্দেশনা গাইড: {title}
          </b>
          <span style={{
            fontSize: '11px',
            background: '#bbf7d0',
            color: '#166534',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 700
          }}>
            নির্দেশিকা
          </span>
        </div>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#047857',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {open ? 'সংকুচিত করুন ▲' : 'বিস্তারিত দেখুন ▼'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '10px', borderTop: '1px solid #bbf7d0', paddingTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', display: 'block', marginBottom: '3px' }}>
                📌 ডাটা ইনপুটের সহজ ধাপসমূহ:
              </span>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {tips && (
              <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px dashed #86efac' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>✨ গুরুত্বপূর্ণ টিপস:</span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                  {tips}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Section 14: মিলাদ-মাহফিল Data Input Form
// ----------------------------------------------------
function SectionMiladAdmin({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  const updateScheduleItem = (index, field, value) => {
    const list = [...(data.schedule || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, schedule: list });
  };

  const addScheduleItem = () => {
    const list = [...(data.schedule || [])];
    list.push({ time: '১১:০০ - ১২:০০', item: 'নতুন কর্মসূচি বিষয়' });
    onChange({ ...data, schedule: list });
  };

  const removeScheduleItem = (index) => {
    const list = [...(data.schedule || [])];
    list.splice(index, 1);
    onChange({ ...data, schedule: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🕌 ১৪. মিলাদ-মাহফিল ও বার্ষিক দোয়া মাহফিল এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceCard
        title="মিলাদ-মাহফিল ও দোয়া মাহফিল"
        steps={[
          '১. মাহফিলের মূল শিরোনাম (যেমন: বার্ষিক দোয়া ও মিলাদ মাহফিল ২০২৬) ও বিশেষ উপলক্ষ লিখুন।',
          '২. মাহফিলের তারিখ, সময়সূচি এবং ভেন্যু (বিদ্যালয় অডিটোরিয়াম/মাঠ) নির্ধারণ করুন।',
          '৩. প্রধান অতিথি, সভাপতি ও প্রধান আলোচক/পেশ ইমামের নাম ও পদবি লিখুন।',
          '৪. অনুষ্ঠানের পর্যায়ক্রমিক কর্মসূচি (তেলাওয়াত, আলোচনা, মোনাজাত, তাবাররুক) এন্ট্রি করুন।'
        ]}
        tips="এসএসসি পরীক্ষার্থীদের কল্যাণ ও বিদায় উপলক্ষে বিশেষ দোয়া মাহফিলের বিবরণ এখানে সুন্দরভাবে উপস্থাপন করুন।"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>মাহফিলের পূর্ণ নাম / শিরোনাম:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বিশেষ উপলক্ষ / বিষয়বস্তু:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.occasion || ''}
            onChange={(e) => updateField('occasion', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>অনুষ্ঠানের তারিখ:</label>
          <input
            type="date"
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>অনুষ্ঠানের সময়সূচি:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.time || ''}
            onChange={(e) => updateField('time', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>স্থান / ভেন্যু:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.venue || ''}
            onChange={(e) => updateField('venue', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রধান অতিথি:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.chief_guest || ''}
            onChange={(e) => updateField('chief_guest', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>সভাপতিত্ব করবেন:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.president || ''}
            onChange={(e) => updateField('president', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রধান আলোচক / পেশ ইমাম:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.speaker || ''}
            onChange={(e) => updateField('speaker', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বিশেষ মোনাজাত ও দোয়ার উদ্দেশ্য:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: '1.5' }}
          value={data.special_dua || ''}
          onChange={(e) => updateField('special_dua', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>তাবাররুক ও মিষ্টি বিতরণ বিবরণ:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.tabarruk_details || ''}
            onChange={(e) => updateField('tabarruk_details', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>আহ্বায়ক ও শৃঙ্খলা কমিটি:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.committee || ''}
            onChange={(e) => updateField('committee', e.target.value)}
          />
        </div>
      </div>

      {/* Program Schedule Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>অনুষ্ঠানের পর্যায়ক্রমিক কর্মসূচি ও সময়সূচি:</h4>
        <button type="button" className="btn mini" onClick={addScheduleItem} style={{ background: '#047857', color: '#fff' }}>+ কর্মসূচি যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {(data.schedule || []).map((s, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <input
              style={{ width: '160px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              placeholder="সময় (যেমন: ১০:০০ - ১০:৩০)"
              value={s.time || ''}
              onChange={(e) => updateScheduleItem(idx, 'time', e.target.value)}
            />
            <input
              style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              placeholder="কর্মসূচি বিবরণ (যেমন: কুরআন তেলাওয়াত ও হামদ-নাত)"
              value={s.item || ''}
              onChange={(e) => updateScheduleItem(idx, 'item', e.target.value)}
            />
            <button type="button" className="btn mini" onClick={() => removeScheduleItem(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>মুছুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 15: পূজা (বাণী অর্চনা ও ধর্মীয় উৎসব) Data Input Form
// ----------------------------------------------------
function SectionPujaAdmin({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  const updateScheduleItem = (index, field, value) => {
    const list = [...(data.schedule || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, schedule: list });
  };

  const addScheduleItem = () => {
    const list = [...(data.schedule || [])];
    list.push({ time: '১১:০০ - ১২:০০', item: 'নতুন পূজা কর্মসূচি' });
    onChange({ ...data, schedule: list });
  };

  const removeScheduleItem = (index) => {
    const list = [...(data.schedule || [])];
    list.splice(index, 1);
    onChange({ ...data, schedule: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🪔 ১৫. পূজা ও ধর্মীয় উৎসব (বাণী অর্চনা) এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceCard
        title="পূজা ও ধর্মীয় উৎসব"
        steps={[
          '১. পূজার নাম (যেমন: শ্রী শ্রী সরস্বতী পূজা ও বাণী অর্চনা ২০২৬) ও শুভ তিথির বিবরণ লিখুন।',
          '২. পূজার তারিখ, সময়সূচি এবং ক্যাম্পাসের মণ্ডপ/নাটমন্দির প্রাঙ্গণ উল্লেখ করুন।',
          '৩. প্রধান পুরোহিত ও সমন্বয়ক শিক্ষক (যেমন: আরতী রানী ভদ্র) মহোদয়ের নাম লিখুন।',
          '৪. প্রতিমা স্থাপন, পুষ্পাঞ্জলি, মহাপ্রসাদ বিতরণ ও আরতির পর্যায়ক্রমিক সময়সূচি এন্ট্রি করুন।'
        ]}
        tips="সকল ধর্মাবলম্বী শিক্ষার্থীদের মাঝে সৌহার্দ্য ও সম্প্রীতিমূলক পরিবেশ বজায় রাখতে বাণীর সারসংক্ষেপ সুন্দরভাবে লিখুন।"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>পূজা ও উৎসবের নাম:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>তিথি ও তাৎপর্য:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.occasion || ''}
            onChange={(e) => updateField('occasion', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>পূজার তারিখ:</label>
          <input
            type="date"
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>সময়কাল:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.time || ''}
            onChange={(e) => updateField('time', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>মণ্ডপ ও পূজার স্থান:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.venue || ''}
            onChange={(e) => updateField('venue', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রধান পুরোহিত:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.purohit || ''}
            onChange={(e) => updateField('purohit', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>সমন্বয়ক শিক্ষক:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.coordinator || ''}
            onChange={(e) => updateField('coordinator', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রধান অতিথি / সভাপতি:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.chief_guest || ''}
            onChange={(e) => updateField('chief_guest', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বাণীর সারসংক্ষেপ ও শুভেচ্ছা বার্তা:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: '1.5' }}
          value={data.message || ''}
          onChange={(e) => updateField('message', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রসাদ বিতরণ ও আপ্যায়ন:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.prasad_details || ''}
            onChange={(e) => updateField('prasad_details', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>পূজা উদযাপন কমিটি:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.committee || ''}
            onChange={(e) => updateField('committee', e.target.value)}
          />
        </div>
      </div>

      {/* Program Schedule Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>পূজার বাৎসরিক নির্ঘণ্ট ও অঞ্জলি সময়সূচি:</h4>
        <button type="button" className="btn mini" onClick={addScheduleItem} style={{ background: '#047857', color: '#fff' }}>+ কর্মসূচি যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {(data.schedule || []).map((s, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <input
              style={{ width: '160px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              placeholder="সময় (যেমন: ০৯:৩০ - ১১:০০)"
              value={s.time || ''}
              onChange={(e) => updateScheduleItem(idx, 'time', e.target.value)}
            />
            <input
              style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              placeholder="কর্মসূচি (যেমন: পুষ্পাঞ্জলি প্রদান ও দেবীর বন্দনা)"
              value={s.item || ''}
              onChange={(e) => updateScheduleItem(idx, 'item', e.target.value)}
            />
            <button type="button" className="btn mini" onClick={() => removeScheduleItem(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>মুছুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}
