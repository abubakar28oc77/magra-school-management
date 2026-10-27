import React, { useState, useEffect } from 'react';
import { getStoredInstitutionData, saveStoredInstitutionData, DEFAULT_INSTITUTION_DATA } from './defaultInstitutionData';
import { SubmenuDetailModal } from './SubmenuDetailModal';

export function InstitutionalInfoAdminPanel({ sub, setSub }) {
  const [data, setData] = useState(getStoredInstitutionData);
  const [activeTab, setActiveTab] = useState(sub || 'about');
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

  const handleSaveAll = () => {
    const success = saveStoredInstitutionData(data);
    if (success) {
      showToast('✓ সকল প্রাতিষ্ঠানিক তথ্য সফলভাবে সংরক্ষিত হয়েছে এবং ভিউ পেজে আপডেট সম্পন্ন হয়েছে!');
    } else {
      showToast('❌ তথ্য সংরক্ষণে ত্রুটি দেখা দিয়েছে।');
    }
  };

  const handleResetSection = (sectionKey) => {
    if (!confirm('আপনি কি এই সেকশনের তথ্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) return;
    const updated = {
      ...data,
      [sectionKey]: JSON.parse(JSON.stringify(DEFAULT_INSTITUTION_DATA[sectionKey]))
    };
    setData(updated);
    saveStoredInstitutionData(updated);
    showToast(`✓ '${getTabTitle(sectionKey)}' সেকশন ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে।`);
  };

  const handleResetAll = () => {
    if (!confirm('সতর্কতা: আপনি কি সকল ১২টি সেকশনের তথ্য ডিফল্ট অবস্থায় রিসেট করতে চান?')) return;
    setData(DEFAULT_INSTITUTION_DATA);
    saveStoredInstitutionData(DEFAULT_INSTITUTION_DATA);
    showToast('✓ সকল ১২টি প্রাতিষ্ঠানিক তথ্য ডিফল্ট ডেটায় রিসেট করা হয়েছে!');
  };

  const getTabTitle = (key) => {
    const map = {
      about: 'বিদ্যালয় পরিচিতি',
      history: 'বিদ্যালয়ের ইতিহাস',
      committee: 'পরিচালনা পর্ষদ',
      regulations: 'বিধি বিধান',
      code_of_conduct: 'আচরন বিধি',
      master_plan: 'মুখ্য পরিকল্পনা',
      library: 'পাঠাগার/লাইব্রেরী',
      curriculum: 'পাঠ্যক্রম',
      syllabus: 'পাঠ্যতালিকা',
      publications: 'প্রকাশনা',
      hostel: 'ছাত্রাবাস',
      transport: 'পরিবহণ সুবিধা'
    };
    return map[key] || 'প্রাতিষ্ঠানিক তথ্য';
  };

  const navKeyMap = {
    about: 'public.nav.institution.about',
    history: 'public.nav.institution.history',
    committee: 'public.nav.institution.committee',
    regulations: 'public.nav.institution.regulations',
    code_of_conduct: 'public.nav.institution.code_of_conduct',
    master_plan: 'public.nav.institution.master_plan',
    library: 'public.nav.institution.library',
    curriculum: 'public.nav.institution.curriculum',
    syllabus: 'public.nav.institution.syllabus',
    publications: 'public.nav.institution.publications',
    hostel: 'public.nav.institution.hostel',
    transport: 'public.nav.institution.transport'
  };

  const openLivePreview = (tabKey) => {
    setPreviewModalKey({
      key: navKeyMap[tabKey] || `public.nav.institution.${tabKey}`,
      title: getTabTitle(tabKey)
    });
  };

  // 12 Tabs metadata
  const tabsList = [
    { key: 'about', label: 'বিদ্যালয় পরিচিতি', icon: '🏫' },
    { key: 'history', label: 'বিদ্যালয়ের ইতিহাস', icon: '📜' },
    { key: 'committee', label: 'পরিচালনা পর্ষদ', icon: '👥' },
    { key: 'regulations', label: 'বিধি বিধান', icon: '⚖️' },
    { key: 'code_of_conduct', label: 'আচরন বিধি', icon: '🛡️' },
    { key: 'master_plan', label: 'মুখ্য পরিকল্পনা', icon: '🎯' },
    { key: 'library', label: 'পাঠাগার/লাইব্রেরী', icon: '📚' },
    { key: 'curriculum', label: 'পাঠ্যক্রম', icon: '📖' },
    { key: 'syllabus', label: 'পাঠ্যতালিকা', icon: '📑' },
    { key: 'publications', label: 'প্রকাশনা', icon: '📰' },
    { key: 'hostel', label: 'ছাত্রাবাস', icon: '🏢' },
    { key: 'transport', label: 'পরিবহণ সুবিধা', icon: '🚌' }
  ];

  return (
    <div className="institution-admin-panel" style={{ padding: '4px' }}>
      {/* Toast Notification */}
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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
        color: '#ffffff',
        padding: '18px 22px',
        borderRadius: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 3px 10px rgba(6,78,59,0.2)',
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
            🏛️
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px' }}>
              প্রাতিষ্ঠানিক তথ্য ব্যবস্থাপনা ও ডাটা এন্ট্রি পোর্টাল
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • ভিউ পেজের ১২টি প্রাতিষ্ঠানিক মেনুর লাইভ তথ্য নিয়ন্ত্রণ ও সাবলীল নির্দেশনা গাইড
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => openLivePreview(activeTab)}
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
            👁️ ভিউ পেজে প্রিভিউ
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            style={{
              background: '#fbbf24',
              color: '#78350f',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 900,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💾 পরিবর্তন সংরক্ষণ করুন
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="সকল সেকশন ডিফল্ট ডেটায় রিসেট করুন"
          >
            🔄 সব রিসেট
          </button>
        </div>
      </div>

      {/* 12 Horizontal Feature Navigation Tabs */}
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
                gap: '6px',
                padding: '7px 12px',
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

      {/* Active Tab Panel Content */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        {activeTab === 'about' && (
          <SectionAbout
            data={data.about}
            onChange={(val) => setData({ ...data, about: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('about')}
            onPreview={() => openLivePreview('about')}
          />
        )}

        {activeTab === 'history' && (
          <SectionHistory
            data={data.history}
            onChange={(val) => setData({ ...data, history: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('history')}
            onPreview={() => openLivePreview('history')}
          />
        )}

        {activeTab === 'committee' && (
          <SectionCommittee
            data={data.committee}
            onChange={(val) => setData({ ...data, committee: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('committee')}
            onPreview={() => openLivePreview('committee')}
          />
        )}

        {activeTab === 'regulations' && (
          <SectionRegulations
            data={data.regulations}
            onChange={(val) => setData({ ...data, regulations: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('regulations')}
            onPreview={() => openLivePreview('regulations')}
          />
        )}

        {activeTab === 'code_of_conduct' && (
          <SectionCodeOfConduct
            data={data.code_of_conduct}
            onChange={(val) => setData({ ...data, code_of_conduct: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('code_of_conduct')}
            onPreview={() => openLivePreview('code_of_conduct')}
          />
        )}

        {activeTab === 'master_plan' && (
          <SectionMasterPlan
            data={data.master_plan}
            onChange={(val) => setData({ ...data, master_plan: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('master_plan')}
            onPreview={() => openLivePreview('master_plan')}
          />
        )}

        {activeTab === 'library' && (
          <SectionLibrary
            data={data.library}
            onChange={(val) => setData({ ...data, library: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('library')}
            onPreview={() => openLivePreview('library')}
          />
        )}

        {activeTab === 'curriculum' && (
          <SectionCurriculum
            data={data.curriculum}
            onChange={(val) => setData({ ...data, curriculum: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('curriculum')}
            onPreview={() => openLivePreview('curriculum')}
          />
        )}

        {activeTab === 'syllabus' && (
          <SectionSyllabus
            data={data.syllabus}
            onChange={(val) => setData({ ...data, syllabus: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('syllabus')}
            onPreview={() => openLivePreview('syllabus')}
          />
        )}

        {activeTab === 'publications' && (
          <SectionPublications
            data={data.publications}
            onChange={(val) => setData({ ...data, publications: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('publications')}
            onPreview={() => openLivePreview('publications')}
          />
        )}

        {activeTab === 'hostel' && (
          <SectionHostel
            data={data.hostel}
            onChange={(val) => setData({ ...data, hostel: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('hostel')}
            onPreview={() => openLivePreview('hostel')}
          />
        )}

        {activeTab === 'transport' && (
          <SectionTransport
            data={data.transport}
            onChange={(val) => setData({ ...data, transport: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('transport')}
            onPreview={() => openLivePreview('transport')}
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
// Reusable Guidance Guide Card Component
// ----------------------------------------------------
function GuidanceGuideCard({ title, steps, tips, example }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      background: '#f0fdf4',
      border: '1.5px solid #86efac',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '18px',
      boxShadow: '0 2px 6px rgba(4,120,87,0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>💡</span>
          <b style={{ color: '#065f46', fontSize: '15px' }}>
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
            fontSize: '14px'
          }}
        >
          {open ? 'সংকুচিত করুন ▲' : 'বিস্তারিত দেখুন ▼'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #bbf7d0', paddingTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Steps */}
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534', display: 'block', marginBottom: '4px' }}>
                📌 তথ্য ইনপুটের মূল ধাপসমূহ:
              </span>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            {/* Tips & Examples */}
            <div>
              {tips && (
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534' }}>
                    ✨ গুরুত্বপূর্ণ টিপস:
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    {tips}
                  </p>
                </div>
              )}
              {example && (
                <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px dashed #86efac' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>নমুনা/উদাহরণ:</span>
                  <div style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic' }}>{example}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Section 1: বিদ্যালয় পরিচিতি
// ----------------------------------------------------
function SectionAbout({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });
  const updateStat = (f, v) => onChange({ ...data, stats: { ...(data.stats || {}), [f]: v } });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🏫 ১. বিদ্যালয় পরিচিতি তথ্য এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="বিদ্যালয় পরিচিতি"
        steps={[
          '১. সরকারি নথিপত্র অনুসারে বিদ্যালয়ের নাম (বাংলা ও ইংরেজি) হুবহু টাইপ করুন।',
          '২. শিক্ষা মন্ত্রণালয় ও মাউশি প্রদত্ত EIIN (114290) ও MPO কোড সঠিকভাবে লিখুন।',
          '৩. মূল পরিচিতি অনুচ্ছেদে বিদ্যালয়ের প্রতিষ্ঠা সাল, ঐতিহ্য, পরিবেশ ও মূল লক্ষ্য সংক্ষেপে লিখুন।',
          '৪. পরিসংখ্যানের ঘরে শিক্ষার্থী সংখ্যা, শিক্ষক-কর্মচারী, জমির পরিমাণ ও শ্রেণির সংখ্যা আপডেট রাখুন।'
        ]}
        tips="এখানে যেসব তথ্য পূরণ করবেন তা প্রধান পৃষ্ঠার 'বিদ্যালয় পরিচিতি' মোডাল ও অফিশিয়াল নথিতে সরাসরি প্রদর্শিত হবে।"
        example="টাঙ্গাইল জেলার কালিহাতি উপজেলার ঐতিহ্যবাহী বিদ্যাপীঠ মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় ১৯৪৬ খ্রিষ্টাব্দে প্রতিষ্ঠিত..."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রতিষ্ঠানের নাম (বাংলা):</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.name_bn || ''}
            onChange={(e) => updateField('name_bn', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>School Name (English):</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.name_en || ''}
            onChange={(e) => updateField('name_en', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>EIIN নম্বর:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.eiin || ''}
            onChange={(e) => updateField('eiin', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>MPO কোড:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.mpo || ''}
            onChange={(e) => updateField('mpo', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রতিষ্ঠা সাল:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.established || ''}
            onChange={(e) => updateField('established', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বোর্ড কোড:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.board_code || ''}
            onChange={(e) => updateField('board_code', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>অফিসিয়াল মোবাইল / ফোন:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>অফিসিয়াল ইমেইল:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রতিষ্ঠানের অবস্থান ও পূর্ণাঙ্গ ঠিকানা:</label>
        <input
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বিদ্যালয়ের সংক্ষিপ্ত পরিচিতি ও পটভূমি (Profile Text):</label>
        <textarea
          rows="4"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: '1.6' }}
          value={data.profile_text || ''}
          onChange={(e) => updateField('profile_text', e.target.value)}
        />
      </div>

      <h4 style={{ color: '#047857', margin: '14px 0 8px', fontSize: '14px' }}>📊 মূল পরিসংখ্যান (Stats Cards):</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>মোট শিক্ষার্থী:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.students || ''} onChange={(e) => updateStat('students', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>শিক্ষক সংখ্যা:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.teachers || ''} onChange={(e) => updateStat('teachers', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>কর্মচারী সংখ্যা:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.staff || ''} onChange={(e) => updateStat('staff', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>জমির পরিমাণ:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.land_area || ''} onChange={(e) => updateStat('land_area', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>ভবন সংখ্যা:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.buildings || ''} onChange={(e) => updateStat('buildings', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>শ্রেণিকক্ষ সংখ্যা:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.classrooms || ''} onChange={(e) => updateStat('classrooms', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700 }}>গড় পাসের হার:</label>
          <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={data.stats?.pass_rate || ''} onChange={(e) => updateStat('pass_rate', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 2: বিদ্যালয়ের ইতিহাস
// ----------------------------------------------------
function SectionHistory({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  const updateMilestone = (index, field, value) => {
    const list = [...(data.milestones || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, milestones: list });
  };

  const addMilestone = () => {
    const list = [...(data.milestones || [])];
    list.push({ year: '২০২৬', title: 'নতুন মাইলফলক', desc: 'মাইলফলকের বিস্তারিত বিবরণ' });
    onChange({ ...data, milestones: list });
  };

  const removeMilestone = (index) => {
    const list = [...(data.milestones || [])];
    list.splice(index, 1);
    onChange({ ...data, milestones: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>📜 ২. বিদ্যালয়ের ইতিহাস ও ঐতিহ্য এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="বিদ্যালয়ের ইতিহাস"
        steps={[
          '১. প্রতিষ্ঠা ও পটভূমি: ১৯৪৬ সালে ব্রিটিশ শাসনামলে এলাকার শিক্ষানুরাগী ও দানশীলদের অবদানের কথা তুলে ধরুন।',
          '২. মুক্তিযুদ্ধে ভূমিকা: ১৯৭১ সালের মুক্তিযুদ্ধে শিক্ষক-শিক্ষার্থী ও স্থানীয় প্রতিরোধে বিদ্যালয়ের অবদান উল্লেখ করুন।',
          '৩. আধুনিকায়ন: কাঁচা টিনশেড থেকে ডিজিটাল মাল্টিমিডিয়া ক্যাম্পাসে রূপান্তরের ইতিহাস লিখুন।',
          '৪. ঐতিহাসিক মাইলফলক: পর্যায়ক্রমিক সালভিত্তিক ইভেন্ট বা স্মারকগুলো যোগ বা সংশোধন করুন।'
        ]}
        tips="সালভিত্তিক মাইলফলকগুলো পাবলিক ভিউ পেজে একটি আকর্ষণীয় টাইমলাইন কার্ড আকারে দেখায়।"
        example="১৯৪৬: বিদ্যালয় প্রতিষ্ঠা, ১৯৭১: মুক্তিযুদ্ধে অবদান, ১৯৮২: এমপিওভুক্তি..."
      />

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>🏛️ প্রতিষ্ঠা ও পটভূমি (Founding Story):</label>
        <textarea
          rows="3"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.founding_story || ''}
          onChange={(e) => updateField('founding_story', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>🎖️ মহান মুক্তিযুদ্ধে গৌরবোজ্জ্বল ভূমিকা (Liberation War Role):</label>
        <textarea
          rows="3"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.liberation_war || ''}
          onChange={(e) => updateField('liberation_war', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>🚀 আধুনিকায়ন ও ডিজিটাল যুগে পদার্পণ:</label>
        <textarea
          rows="3"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.modernization || ''}
          onChange={(e) => updateField('modernization', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>⏳ ঐতিহাসিক মাইলফলক ও কালক্রম (Milestones):</h4>
        <button type="button" className="btn mini" onClick={addMilestone} style={{ background: '#047857', color: '#fff' }}>+ নতুন মাইলফলক যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {(data.milestones || []).map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <input
              style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              placeholder="সাল (যেমন: ১৯৪৬)"
              value={m.year || ''}
              onChange={(e) => updateMilestone(idx, 'year', e.target.value)}
            />
            <input
              style={{ width: '220px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              placeholder="শিরোনাম"
              value={m.title || ''}
              onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
            />
            <input
              style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              placeholder="সংক্ষিপ্ত বিবরণ"
              value={m.desc || ''}
              onChange={(e) => updateMilestone(idx, 'desc', e.target.value)}
            />
            <button type="button" className="btn mini" onClick={() => removeMilestone(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>মুছুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 3: পরিচালনা পর্ষদ
// ----------------------------------------------------
function SectionCommittee({ data, onChange, onSave, onReset, onPreview }) {
  const updateTenure = (v) => onChange({ ...data, tenure: v });

  const updateMember = (index, field, value) => {
    const list = [...(data.members || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, members: list });
  };

  const addMember = () => {
    const list = [...(data.members || [])];
    list.push({ name_bn: '', role: 'অভিভাবক প্রতিনিধি', designation: 'সম্মানিত সদস্য', mobile: '', photo: '' });
    onChange({ ...data, members: list });
  };

  const removeMember = (index) => {
    const list = [...(data.members || [])];
    list.splice(index, 1);
    onChange({ ...data, members: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>👥 ৩. পরিচালনা পর্ষদ (Managing Committee) এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="পরিচালনা পর্ষদ"
        steps={[
          '১. কমিটির বর্তমান অনুমোদন সেশন / মেয়াদকাল লিখুন (যেমন: ২০২৪–২০২৬)।',
          '২. সভাপতি, সদস্য সচিব (প্রধান শিক্ষক), শিক্ষক প্রতিনিধি, অভিভাবক প্রতিনিধি ও দাতা সদস্যদের নাম ও পদবি লিখুন।',
          '৩. নতুন কোনো সদস্য সংযোজন করতে "+ নতুন সদস্য যোগ" বাটনে ক্লিক করুন।',
          '৪. সংরক্ষিত তথ্য ভিউ পেজে গর্ভনিং বডির কার্ড আকারে ছবিসহ প্রদর্শিত হবে।'
        ]}
        tips="পদবি অনুযায়ী তালিকাভুক্ত করুন। সভাপতিকে সবার উপরে এবং সদস্য সচিবকে দ্বিতীয় স্থানে রাখা বিধেয়।"
        example="নেয়ামুল হক খান (সভাপতি), মুহাম্মদ শফিকুল ইসলাম (সদস্য সচিব)..."
      />

      <div style={{ marginBottom: '14px', maxWidth: '300px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বর্তমান কমিটির মেয়াদকাল:</label>
        <input
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.tenure || ''}
          onChange={(e) => updateTenure(e.target.value)}
          placeholder="যেমন: ২০২৪–২০২৬"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>কমিটি সদস্যদের তালিকা:</h4>
        <button type="button" className="btn mini" onClick={addMember} style={{ background: '#047857', color: '#fff' }}>+ নতুন সদস্য যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {(data.members || []).map((m, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 180px 1fr 130px 60px', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>কমিটি রোল:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                placeholder="যেমন: সভাপতি"
                value={m.role || ''}
                onChange={(e) => updateMember(idx, 'role', e.target.value)}
              />
            </div>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>সদস্যের পুরো নাম:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                placeholder="নাম লিখুন"
                value={m.name_bn || ''}
                onChange={(e) => updateMember(idx, 'name_bn', e.target.value)}
              />
            </div>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>পদবি / পরিচিতি:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                placeholder="যেমন: বিশিষ্ট শিক্ষানুরাগী ও সমাজসেবক"
                value={m.designation || ''}
                onChange={(e) => updateMember(idx, 'designation', e.target.value)}
              />
            </div>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>মোবাইল (ঐচ্ছিক):</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                placeholder="017XX-XXXXXX"
                value={m.mobile || ''}
                onChange={(e) => updateMember(idx, 'mobile', e.target.value)}
              />
            </div>
            <div style={{ textAlign: 'center', paddingTop: '14px' }}>
              <button type="button" className="btn mini" onClick={() => removeMember(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 4: বিধি বিধান
// ----------------------------------------------------
function SectionRegulations({ data, onChange, onSave, onReset, onPreview }) {
  const updateOverview = (v) => onChange({ ...data, overview: v });

  const updateRule = (index, field, value) => {
    const list = [...(data.rules || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, rules: list });
  };

  const addRule = () => {
    const list = [...(data.rules || [])];
    list.push({ title: 'নতুন বিধি', detail: 'বিধিমালার বিস্তারিত বিবরণ লিখুন' });
    onChange({ ...data, rules: list });
  };

  const removeRule = (index) => {
    const list = [...(data.rules || [])];
    list.splice(index, 1);
    onChange({ ...data, rules: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>⚖️ ৪. প্রাতিষ্ঠানিক বিধি বিধান এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="বিধি বিধান"
        steps={[
          '১. শিক্ষা মন্ত্রণালয়, মাউশি এবং শিক্ষা বোর্ডের আলোকে বিদ্যালয়ের সাধারণ নীতি সারসংক্ষেপ লিখুন।',
          '২. ভর্তি, উপস্থিতি, পরীক্ষা, ফি প্রদান ও ছাড়পত্র (TC) উত্তোলনের নীতিমালা আলাদা পয়েন্টে লিখুন।',
          '৩. কোনো নতুন সরকারি প্রজ্ঞাপন জারি হলে সেই অনুসারে বিধিমালা আপডেট করুন।'
        ]}
        tips="প্রতিটি বিধির জন্য স্পষ্ট শিরোনাম (যেমন: 'ভর্তি নীতিমালা') এবং বিস্তারিত ব্যাখ্যা দিন।"
        example="ভর্তি নীতিমালা: সরকারি প্রজ্ঞাপন অনুযায়ী নির্ধারিত সময়সীমার মধ্যে অনলাইন ও ম্যানুয়াল পদ্ধতিতে..."
      />

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>সারসংক্ষেপ ও ভূমিকা:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.overview || ''}
          onChange={(e) => updateOverview(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>বিধি বিধান ও নীতিমালার তালিকাসমূহ:</h4>
        <button type="button" className="btn mini" onClick={addRule} style={{ background: '#047857', color: '#fff' }}>+ নতুন বিধি যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {(data.rules || []).map((r, idx) => (
          <div key={idx} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <input
                style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                placeholder="বিধির শিরোনাম (যেমন: উপস্থিতি ও হাজিরা বিধি)"
                value={r.title || ''}
                onChange={(e) => updateRule(idx, 'title', e.target.value)}
              />
              <button type="button" className="btn mini" onClick={() => removeRule(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>মুছুন</button>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.5' }}
              placeholder="বিধির বিস্তারিত বিবরণ..."
              value={r.detail || ''}
              onChange={(e) => updateRule(idx, 'detail', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 5: আচরন বিধি
// ----------------------------------------------------
function SectionCodeOfConduct({ data, onChange, onSave, onReset, onPreview }) {
  const updateList = (field, list) => onChange({ ...data, [field]: list });

  const handleItemChange = (field, index, value) => {
    const list = [...(data[field] || [])];
    list[index] = value;
    updateList(field, list);
  };

  const addItem = (field) => {
    const list = [...(data[field] || [])];
    list.push('নতুন আচরণবিধি পয়েন্ট লিখুন');
    updateList(field, list);
  };

  const removeItem = (field, index) => {
    const list = [...(data[field] || [])];
    list.splice(index, 1);
    updateList(field, list);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🛡️ ৫. আচরন বিধি (Code of Conduct) এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="আচরণ বিধি"
        steps={[
          '১. শিক্ষার্থীদের জন্য ড্রেসকোড, অ্যাসেম্বলিতে উপস্থিতি, মোবাইল ব্যবহারে নিষেধাজ্ঞা ইত্যাদি সুস্পষ্ট পয়েন্টে লিখুন।',
          '২. অভিভাবকবৃন্দের দায়িত্ব ও ত্রৈমাসিক অভিভাবক সমাবেশ উপস্থিতির নিয়মাবলী উল্লেখ করুন।',
          '৩. শিক্ষক-কর্মচারীদের পেশাগত আদর্শ ও সময়নিষ্ঠতার নিয়মাবলি লিপিবদ্ধ করুন।'
        ]}
        tips="বুলেট পয়েন্ট আকারে লিখলে শিক্ষার্থী ও অভিভাবকরা সহজেই বুঝতে ও মেনে চলতে পারবেন।"
        example="নির্ধারিত স্কুল ইউনিফর্ম ও পরিচয়পত্র পরিধান করে ক্যাম্পাসে প্রবেশ বাধ্যতামূলক..."
      />

      {/* Student Conduct */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>🎓 শিক্ষার্থীদের আচরণবিধি:</h4>
          <button type="button" className="btn mini" onClick={() => addItem('student_conduct')} style={{ background: '#047857', color: '#fff' }}>+ পয়েন্ট যোগ</button>
        </div>
        <div style={{ display: 'grid', gap: '6px' }}>
          {(data.student_conduct || []).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#047857', fontWeight: 700 }}>•</span>
              <input
                style={{ flex: 1, padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                value={item}
                onChange={(e) => handleItemChange('student_conduct', idx, e.target.value)}
              />
              <button type="button" className="btn mini" onClick={() => removeItem('student_conduct', idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Guardian Conduct */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h4 style={{ color: '#0369a1', margin: 0, fontSize: '14px' }}>👨‍👩‍👧 সম্মানিত অভিভাবকদের জন্য দিকনির্দেশনা:</h4>
          <button type="button" className="btn mini" onClick={() => addItem('guardian_conduct')} style={{ background: '#0369a1', color: '#fff' }}>+ পয়েন্ট যোগ</button>
        </div>
        <div style={{ display: 'grid', gap: '6px' }}>
          {(data.guardian_conduct || []).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>•</span>
              <input
                style={{ flex: 1, padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                value={item}
                onChange={(e) => handleItemChange('guardian_conduct', idx, e.target.value)}
              />
              <button type="button" className="btn mini" onClick={() => removeItem('guardian_conduct', idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 6: মুখ্য পরিকল্পনা
// ----------------------------------------------------
function SectionMasterPlan({ data, onChange, onSave, onReset, onPreview }) {
  const updateOverview = (v) => onChange({ ...data, overview: v });

  const updatePlan = (index, field, value) => {
    const list = [...(data.plans || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, plans: list });
  };

  const addPlan = () => {
    const list = [...(data.plans || [])];
    list.push({ icon: '🎯', title: 'নতুন পরিকল্পনা', desc: 'পরিকল্পনার বিস্তারিত রূপরেখা' });
    onChange({ ...data, plans: list });
  };

  const removePlan = (index) => {
    const list = [...(data.plans || [])];
    list.splice(index, 1);
    onChange({ ...data, plans: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🎯 ৬. প্রাতিষ্ঠানিক মুখ্য পরিকল্পনা ও রূপরেখা</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="মুখ্য পরিকল্পনা"
        steps={[
          '১. আগামী শিক্ষাবর্ষগুলোতে গুণগত শিক্ষা ও ক্যাম্পাস উন্নয়নে গৃহীত মহাপরিকল্পনার সারসংক্ষেপ লিখুন।',
          '২. ১০০% স্মার্ট ক্লাসরুম, ইনোভেশন ল্যাব, শতভাগ জিপিএ-৫ লক্ষ্যমাত্রা ও অডিটোরিয়াম নির্মাণের লক্ষ্যমাত্রা আলাদা কার্ডে লিখুন।',
          '৩. প্রতিটি পরিকল্পনার সাথে মানানসই আইকন (যেমন: 💻, 🔬, 🏆, 🏛️) ব্যবহার করুন।'
        ]}
        tips="পরিকল্পনাগুলো পাবলিক ভিউ পেজে সুন্দর গ্রিড বক্সে হাইলাইট হবে।"
        example="১০০% স্মার্ট ক্লাসরুম: সকল শ্রেণিকক্ষে প্রজেক্টর, ইন্টারেক্টিভ ডিসপ্লে ও দ্রুতগতির ইন্টারনেট নিশ্চিতকরণ..."
      />

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>পরিকল্পনা ভূমিকা ও ভিশন:</label>
        <input
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.overview || ''}
          onChange={(e) => updateOverview(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>মুখ্য পরিকল্পনা ও লক্ষ্যমাত্রার তালিকা:</h4>
        <button type="button" className="btn mini" onClick={addPlan} style={{ background: '#047857', color: '#fff' }}>+ নতুন পরিকল্পনা যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {(data.plans || []).map((p, idx) => (
          <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input
                style={{ width: '60px', textAlign: 'center', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '18px' }}
                value={p.icon || '🎯'}
                onChange={(e) => updatePlan(idx, 'icon', e.target.value)}
                title="আইকন"
              />
              <input
                style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                placeholder="পরিকল্পনার শিরোনাম (যেমন: ১০০% স্মার্ট ক্লাসরুম)"
                value={p.title || ''}
                onChange={(e) => updatePlan(idx, 'title', e.target.value)}
              />
              <button type="button" className="btn mini" onClick={() => removePlan(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>মুছুন</button>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              placeholder="পরিকল্পনার বিস্তারিত রূপরেখা..."
              value={p.desc || ''}
              onChange={(e) => updatePlan(idx, 'desc', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 7: পাঠাগার/লাইব্রেরী
// ----------------------------------------------------
function SectionLibrary({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  const updateSection = (index, field, value) => {
    const list = [...(data.sections || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, sections: list });
  };

  const addSection = () => {
    const list = [...(data.sections || [])];
    list.push({ name: 'নতুন বই বিভাগ', count: '১০০ টি' });
    onChange({ ...data, sections: list });
  };

  const removeSection = (index) => {
    const list = [...(data.sections || [])];
    list.splice(index, 1);
    onChange({ ...data, sections: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>📚 ৭. কেন্দ্রীয় পাঠাগার ও লাইব্রেরী তথ্য এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="পাঠাগার/লাইব্রেরী"
        steps={[
          '১. লাইব্রেরির সাধারণ পরিচিতি, মোট বইয়ের সংখ্যা ও রিডিং রুমের সময়সূচি লিখুন।',
          '২. বইয়ের বিভিন্ন কর্নার (যেমন: মুক্তিযুদ্ধ কর্নার, বিজ্ঞান, সাহিত্য, সাধারণ জ্ঞান) ও বইয়ের সংখ্যা আপডেট করুন।',
          '৩. বই ইস্যু ও লাইব্রেরি কার্ড সংক্রান্ত নিয়মাবলী লিখে দিন।'
        ]}
        tips="লাইব্রেরি ক্যাটালগের বইগুলোর সাথে এই পরিচিতি পেজটি সংযুক্ত থাকবে।"
        example="মোট বই: ৩,৫০০+ টি, সময়সূচি: সকাল ১০:০০ টা হতে বিকাল ৪:০০ টা..."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>মোট সংগৃহীত গ্রন্থ সংখ্যা:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.total_books || ''}
            onChange={(e) => updateField('total_books', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>রিডিং রুম খোলার সময়সূচি:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.reading_hours || ''}
            onChange={(e) => updateField('reading_hours', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>লাইব্রেরি পরিচিতি ও পরিবেশ:</label>
        <textarea
          rows="3"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.summary || ''}
          onChange={(e) => updateField('summary', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>বই ইস্যু ও ব্যবহারের নীতিমালা:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.rules || ''}
          onChange={(e) => updateField('rules', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>বিভাগভিত্তিক বই সংগ্রহ ও কর্নার:</h4>
        <button type="button" className="btn mini" onClick={addSection} style={{ background: '#047857', color: '#fff' }}>+ বিভাগ যোগ</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
        {(data.sections || []).map((sec, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <input
              style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              placeholder="বিভাগের নাম"
              value={sec.name || ''}
              onChange={(e) => updateSection(idx, 'name', e.target.value)}
            />
            <input
              style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              placeholder="সংখ্যা"
              value={sec.count || ''}
              onChange={(e) => updateSection(idx, 'count', e.target.value)}
            />
            <button type="button" className="btn mini" onClick={() => removeSection(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 8: পাঠ্যক্রম
// ----------------------------------------------------
function SectionCurriculum({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>📖 ৮. জাতীয় শিক্ষাক্রম (NCTB Curriculum) এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="পাঠ্যক্রম"
        steps={[
          '১. জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত শিক্ষাক্রম রূপরেখা লিখুন।',
          '২. ৬ষ্ঠ হতে ৮ম শ্রেণির সমন্বিত বিষয়সমূহের তালিকা লিখুন।',
          '৩. ৯ম ও ১০ম শ্রেণির শাখাভিত্তিক (বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা) বিষয়সমূহের তালিকা আলাদা করে উল্লেখ করুন।'
        ]}
        tips="অভিভাবক ও শিক্ষার্থীরা এখান থেকে তাদের শ্রেণির আবশ্যক ও নৈর্বাচনিক বিষয়গুলো সম্পর্কে পরিষ্কার ধারণা পাবে।"
        example="৬ষ্ঠ-৮ম: বাংলা, ইংরেজি, গণিত, বিজ্ঞান, ডিজিটাল প্রযুক্তি... ৯ম-১০ম: বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা।"
      />

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>শিক্ষাক্রমের সাধারণ রূপরেখা:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.overview || ''}
          onChange={(e) => updateField('overview', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>📘 ৬ষ্ঠ হতে ৮ম শ্রেণি (নিম্ন মাধ্যমিক পাঠ্যক্রম):</label>
        <textarea
          rows="3"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: '1.5' }}
          value={data.lower_secondary || ''}
          onChange={(e) => updateField('lower_secondary', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>🔬 ৯ম ও ১০ম শ্রেণি — বিজ্ঞান বিভাগ (Science):</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.secondary_science || ''}
          onChange={(e) => updateField('secondary_science', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>🌍 ৯ম ও ১০ম শ্রেণি — মানবিক বিভাগ (Humanities):</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.secondary_humanities || ''}
          onChange={(e) => updateField('secondary_humanities', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>💼 ৯ম ও ১০ম শ্রেণি — ব্যবসায় শিক্ষা শাখা (Business Studies):</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.secondary_business || ''}
          onChange={(e) => updateField('secondary_business', e.target.value)}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 9: পাঠ্যতালিকা
// ----------------------------------------------------
function SectionSyllabus({ data, onChange, onSave, onReset, onPreview }) {
  const updateYear = (v) => onChange({ ...data, year: v });

  const updateItem = (index, field, value) => {
    const list = [...(data.classes || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, classes: list });
  };

  const addItem = () => {
    const list = [...(data.classes || [])];
    list.push({ class_name: 'নতুন শ্রেণি', syllabus_title: 'সিলেবাস বিবরণ', pdf_link: '#', status: 'অনুমোদিত' });
    onChange({ ...data, classes: list });
  };

  const removeItem = (index) => {
    const list = [...(data.classes || [])];
    list.splice(index, 1);
    onChange({ ...data, classes: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>📑 ৯. শ্রেণিভিত্তিক পাঠ্যতালিকা ও সিলেবাস এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="পাঠ্যতালিকা"
        steps={[
          '১. চলতি শিক্ষাবর্ষ (যেমন: ২০২৬) নির্ধারণ করুন।',
          '২. প্রতিটি শ্রেণির (৬ষ্ঠ, ৭ম, ৮ম, ৯ম, ১০ম) সিলেবাসের বিবরণ ও অনুমোদনের স্থিতি উল্লেখ করুন।',
          '৩. কোনো সিলেবাসের পিডিএফ বা গুগল ড্রাইভ ডাউনলোড লিংক থাকলে তা প্রদান করুন।'
        ]}
        tips="শিক্ষার্থীরা ভিউ পেজে গিয়ে নিজ নিজ শ্রেণির অনুমোদিত পাঠ্যতালিকা দেখতে পারবে।"
        example="৬ষ্ঠ শ্রেণি: বাৎসরিক শিখন পরিকল্পনা ও সিলেবাস... ১০ম শ্রেণি: এসএসসি নির্বাচনী প্রস্তুতিমূলক টেস্ট সিলেবাস"
      />

      <div style={{ marginBottom: '14px', maxWidth: '240px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>শিক্ষাবর্ষ:</label>
        <input
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.year || ''}
          onChange={(e) => updateYear(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>শ্রেণিভিত্তিক পাঠ্যতালিকা ও সিলেবাসের স্থিতি:</h4>
        <button type="button" className="btn mini" onClick={addItem} style={{ background: '#047857', color: '#fff' }}>+ শ্রেণি সিলেবাস যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {(data.classes || []).map((c, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 140px 110px 60px', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b' }}>শ্রেণি:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                value={c.class_name || ''}
                onChange={(e) => updateItem(idx, 'class_name', e.target.value)}
              />
            </div>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b' }}>সিলেবাস শিরোনাম ও বিবরণ:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                value={c.syllabus_title || ''}
                onChange={(e) => updateItem(idx, 'syllabus_title', e.target.value)}
              />
            </div>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b' }}>ডাউনলোড/PDF লিংক:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                placeholder="https://..."
                value={c.pdf_link || ''}
                onChange={(e) => updateItem(idx, 'pdf_link', e.target.value)}
              />
            </div>
            <div>
              <small style={{ fontSize: '11px', color: '#64748b' }}>অনুমোদন স্ট্যাটাস:</small>
              <input
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#047857', fontWeight: 700 }}
                value={c.status || 'অনুমোদিত'}
                onChange={(e) => updateItem(idx, 'status', e.target.value)}
              />
            </div>
            <div style={{ textAlign: 'center', paddingTop: '14px' }}>
              <button type="button" className="btn mini" onClick={() => removeItem(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 10: প্রকাশনা
// ----------------------------------------------------
function SectionPublications({ data, onChange, onSave, onReset, onPreview }) {
  const updateSummary = (v) => onChange({ ...data, summary: v });

  const updateItem = (index, field, value) => {
    const list = [...(data.items || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, items: list });
  };

  const addItem = () => {
    const list = [...(data.items || [])];
    list.push({ title: 'নতুন প্রকাশনার নাম', type: 'সাময়িকী', desc: 'প্রকাশনার বিস্তারিত বিবরণ' });
    onChange({ ...data, items: list });
  };

  const removeItem = (index) => {
    const list = [...(data.items || [])];
    list.splice(index, 1);
    onChange({ ...data, items: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>📰 ১০. প্রকাশনা ও সাময়িকী এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="প্রকাশনা"
        steps={[
          '১. বিদ্যালয়ের নিয়মিত প্রকাশনা, বার্ষিক স্কুল ম্যাগাজিন (যেমন: মগড়া প্রভাত) ও দেয়াল পত্রিকার বিবরণ লিখুন।',
          '২. জাতীয় দিবস ও বিশেষ স্মৃতি স্মারক সংখ্যার তথ্য সংযোজন করুন।',
          '৩. শিক্ষার্থীদের সাহিত্যচর্চা ও সৃষ্টিশীল লেখার প্ল্যাটফর্ম হিসেবে বিবরণ উপস্থাপন করুন।'
        ]}
        tips="ম্যাগাজিনের নাম, ধরণ (বার্ষিকী/দেয়াল পত্রিকা/স্মরণিকা) ও বিষয়বস্তু পরিষ্কারভাবে তুলে ধরুন।"
        example="বার্ষিক স্কুল ম্যাগাজিন 'মগড়া প্রভাত', দেয়াল পত্রিকা 'কিশোর আলো'..."
      />

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>প্রকাশনা পরিচিতি ও লক্ষ্য:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.summary || ''}
          onChange={(e) => updateSummary(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>প্রকাশনাসমূহের তালিকা:</h4>
        <button type="button" className="btn mini" onClick={addItem} style={{ background: '#047857', color: '#fff' }}>+ প্রকাশনা যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {(data.items || []).map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input
                style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                placeholder="প্রকাশনার নাম"
                value={item.title || ''}
                onChange={(e) => updateItem(idx, 'title', e.target.value)}
              />
              <input
                style={{ width: '140px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                placeholder="ধরণ (যেমন: ম্যাগাজিন)"
                value={item.type || ''}
                onChange={(e) => updateItem(idx, 'type', e.target.value)}
              />
              <button type="button" className="btn mini" onClick={() => removeItem(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>মুছুন</button>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              placeholder="প্রকাশনার বিষয়বস্তু ও বিবরণ..."
              value={item.desc || ''}
              onChange={(e) => updateItem(idx, 'desc', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 11: ছাত্রাবাস
// ----------------------------------------------------
function SectionHostel({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  const updateFeature = (index, field, value) => {
    const list = [...(data.features || [])];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, features: list });
  };

  const addFeature = () => {
    const list = [...(data.features || [])];
    list.push({ title: 'নতুন হোস্টেল সুবিধা', desc: 'সুবিধার বিস্তারিত বিবরণ' });
    onChange({ ...data, features: list });
  };

  const removeFeature = (index) => {
    const list = [...(data.features || [])];
    list.splice(index, 1);
    onChange({ ...data, features: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🏢 ১১. ছাত্রাবাস ও আবাসিক সুবিধা এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="ছাত্রাবাস"
        steps={[
          '১. ছাত্রাবাসের নাম, ধারণক্ষমতা (মোট আসন) এবং হোস্টেল সুপারের নাম ও মোবাইল নম্বর লিখুন।',
          '২. পড়ার পরিবেশ, ডাইনিং ব্যবস্থা, নিরাপত্তা ও সান্ধ্যকালীন কোচিং সুবিধাগুলো আলাদা কার্ডে লিখুন।',
          '৩. দূরবর্তী ও চরাঞ্চলের শিক্ষার্থীদের জন্য হোস্টেল সুবিধা উল্লেখ করুন।'
        ]}
        tips="অভিভাবকদের জন্য হোস্টেল সুপারের সাথে যোগাযোগের মোবাইল নম্বর স্পষ্ট রাখুন।"
        example="ধারণক্ষমতা: ৬০ জন শিক্ষার্থী, সান্ধ্যকালীন বিশেষ কোচিং, স্বাস্থ্যসম্মত ডাইনিং..."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>ছাত্রাবাসের পুরো নাম:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>মোট আসন সংখ্যা (Capacity):</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.capacity || ''}
            onChange={(e) => updateField('capacity', e.target.value)}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>হোস্টেল সুপারিনটেনডেন্ট পরিচিতি ও মোবাইল:</label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={data.superintendent || ''}
            onChange={(e) => updateField('superintendent', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>ফি ও ভর্তির নিয়মাবলী:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.fees || ''}
          onChange={(e) => updateField('fees', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>আবাসিক সুবিধাসমূহের তালিকা:</h4>
        <button type="button" className="btn mini" onClick={addFeature} style={{ background: '#047857', color: '#fff' }}>+ সুবিধা যোগ</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {(data.features || []).map((feat, idx) => (
          <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
              <input
                style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                placeholder="সুবিধার শিরোনাম"
                value={feat.title || ''}
                onChange={(e) => updateFeature(idx, 'title', e.target.value)}
              />
              <button type="button" className="btn mini" onClick={() => removeFeature(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              placeholder="বিস্তারিত বিবরণ..."
              value={feat.desc || ''}
              onChange={(e) => updateFeature(idx, 'desc', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 12: পরিবহণ সুবিধা
// ----------------------------------------------------
function SectionTransport({ data, onChange, onSave, onReset, onPreview }) {
  const updateField = (f, v) => onChange({ ...data, [f]: v });

  const updateGuideline = (index, value) => {
    const list = [...(data.safety_guidelines || [])];
    list[index] = value;
    onChange({ ...data, safety_guidelines: list });
  };

  const addGuideline = () => {
    const list = [...(data.safety_guidelines || [])];
    list.push('নতুন সড়ক নিরাপত্তা ও যাতায়াত নির্দেশনা');
    onChange({ ...data, safety_guidelines: list });
  };

  const removeGuideline = (index) => {
    const list = [...(data.safety_guidelines || [])];
    list.splice(index, 1);
    onChange({ ...data, safety_guidelines: list });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>🚌 ১২. পরিবহণ ও যাতায়াত সুবিধা এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      <GuidanceGuideCard
        title="পরিবহণ সুবিধা"
        steps={[
          '১. বিদ্যালয় ক্যাম্পাসের সংলগ্ন পাকা সড়ক যোগাযোগ ও যাতায়াতের সহজগম্যতা লিখুন।',
          '২. দূরবর্তী গ্রামগুলো থেকে বাইসাইকেলযোগে আগত শিক্ষার্থীদের সাইকেল শেডের ব্যবস্থা উল্লেখ করুন।',
          '৩. সড়ক নিরাপত্তা ও ট্রাফিক শৃঙ্খলা মেনে চলার নিয়মাবলি পয়েন্ট আকারে দিন।',
          '৪. ভবিষ্যৎ মিনিবাস বা শিক্ষার্থীদের পরিবহণ সার্ভিস চালুর রূপরেখা লিখুন।'
        ]}
        tips="নিরাপত্তা পয়েন্টগুলো স্পষ্ট ও বুলেট আকারে লিখলে শিক্ষার্থীরা সচেতন থাকবে।"
        example="কালিহাতি উপজেলার মগড়া ইউনিয়ন ও পার্শ্ববর্তী গ্রামগুলো থেকে পাকা সড়কপথে সুলভ যোগাযোগ..."
      />

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>সড়ক যোগাযোগ ও ক্যাম্পাস সংযোগ:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.road_connectivity || ''}
          onChange={(e) => updateField('road_connectivity', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>সাইকেল ও ব্যক্তিগত যানবাহন শেড সুবিধা:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.bicycle_shed || ''}
          onChange={(e) => updateField('bicycle_shed', e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>ভবিষ্যৎ বাস ও মিনিবাস সার্ভিস পরিকল্পনা:</label>
        <textarea
          rows="2"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          value={data.future_bus || ''}
          onChange={(e) => updateField('future_bus', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <h4 style={{ color: '#047857', margin: 0, fontSize: '14px' }}>সড়ক নিরাপত্তা ও ট্রাফিক নির্দেশনা:</h4>
        <button type="button" className="btn mini" onClick={addGuideline} style={{ background: '#047857', color: '#fff' }}>+ নির্দেশনা যোগ</button>
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        {(data.safety_guidelines || []).map((g, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#047857', fontWeight: 700 }}>•</span>
            <input
              style={{ flex: 1, padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              value={g}
              onChange={(e) => updateGuideline(idx, e.target.value)}
            />
            <button type="button" className="btn mini" onClick={() => removeGuideline(idx)} style={{ background: '#fee2e2', color: '#b91c1c' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
