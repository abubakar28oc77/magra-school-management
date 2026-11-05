import React, { useState, useEffect } from 'react';
import { getStoredInstitutionData, saveStoredInstitutionData, DEFAULT_INSTITUTION_DATA } from './defaultInstitutionData';
import { SubmenuDetailModal } from './SubmenuDetailModal';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

export const toBn = (n) => {
  if (n === null || n === undefined || n === '') return '';
  return String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
};

export function InstitutionalInfoAdminPanel({ sub, setSub, onNavigate }) {
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

  const handleSaveAll = (customSectionPayload) => {
    let toSave = data;
    if (customSectionPayload && typeof customSectionPayload === 'object' && !customSectionPayload.nativeEvent && activeTab) {
      toSave = {
        ...data,
        [activeTab]: customSectionPayload
      };
      setData(toSave);
    }
    const success = saveStoredInstitutionData(toSave);
    if (success) {
      showToast('✓ সকল প্রাতিষ্ঠানিক তথ্য সফলভাবে সংরক্ষিত হয়েছে এবং ভিউ পেজে আপডেট সম্পন্ন হয়েছে!');
    } else {
      showToast('❌ তথ্য সংরক্ষণে ত্রুটি দেখা দিয়েছে। মেমোরি খালি করে পুনরায় চেষ্টা করুন।');
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
    showToast('✓ সকল ১৩টি প্রাতিষ্ঠানিক তথ্য ডিফল্ট ডেটায় রিসেট করা হয়েছে!');
  };

  const getTabTitle = (key) => {
    const map = {
      about: 'বিদ্যালয় পরিচিতি',
      history: 'বিদ্যালয়ের ইতিহাস',
      committee: 'পরিচালনা পর্ষদ',
      donors: 'বিদ্যালয়ের দাতা সদস্য',
      regulations: 'বিধি বিধান',
      code_of_conduct: 'আচরন বিধি',
      master_plan: 'মুখ্য পরিকল্পনা',
      library: 'গ্রন্থাগার/লাইব্রেরী',
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
    donors: 'public.nav.institution.donors',
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

  // 13 Tabs metadata
  const tabsList = [
    { key: 'about', label: 'বিদ্যালয় পরিচিতি', icon: '🏫' },
    { key: 'history', label: 'বিদ্যালয়ের ইতিহাস', icon: '📜' },
    { key: 'committee', label: 'পরিচালনা পর্ষদ', icon: '👥' },
    { key: 'donors', label: 'বিদ্যালয়ের দাতা সদস্য', icon: '🤝' },
    { key: 'regulations', label: 'বিধি বিধান', icon: '⚖️' },
    { key: 'code_of_conduct', label: 'আচরন বিধি', icon: '🛡️' },
    { key: 'master_plan', label: 'মুখ্য পরিকল্পনা', icon: '🎯' },
    { key: 'library', label: 'গ্রন্থাগার/লাইব্রেরী', icon: '📚' },
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

        {activeTab === 'donors' && (
          <SectionDonors
            data={data.donors}
            onChange={(val) => setData({ ...data, donors: val })}
            onSave={handleSaveAll}
            onReset={() => handleResetSection('donors')}
            onPreview={() => openLivePreview('donors')}
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
            onNavigate={onNavigate}
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
// Section 3: পরিচালনা পর্ষদ (এডহক কমিটি ও নিয়মিত ম্যানেজিং কমিটি)
// ----------------------------------------------------
function SectionCommittee({ data, onChange, onSave, onReset, onPreview }) {
  // Ensure both regular and adhoc divisions are present
  const regularComm = data?.regular || {
    title: 'নিয়মিত ম্যানেজিং কমিটি',
    tenure: data?.tenure || '২০২৪–২০২৬',
    approval_memo: 'মাউশি/বোর্ড স্মারক নং: ৩৭.০২.০০০০.১০৬... তারিখ: ১৫-০১-২০২৪',
    members: Array.isArray(data?.members) && data?.members.length
      ? data.members
      : JSON.parse(JSON.stringify(DEFAULT_INSTITUTION_DATA.committee.regular.members))
  };

  const adhocComm = data?.adhoc || JSON.parse(JSON.stringify(DEFAULT_INSTITUTION_DATA.committee.adhoc));
  const activeType = data?.active_type || 'regular';

  // Local state for which division the admin is currently editing
  const [selectedDivision, setSelectedDivision] = useState(activeType);

  const currentComm = selectedDivision === 'adhoc' ? adhocComm : regularComm;

  const updateCommitteeField = (field, value) => {
    const updatedDivision = { ...currentComm, [field]: value };
    const updatedData = {
      ...data,
      [selectedDivision]: updatedDivision,
      tenure: (selectedDivision === activeType && field === 'tenure') ? value : data?.tenure
    };
    onChange(updatedData);
  };

  const setActiveType = (type) => {
    const activeGroup = type === 'adhoc' ? adhocComm : regularComm;
    const updatedData = {
      ...data,
      active_type: type,
      tenure: activeGroup.tenure || data?.tenure,
      members: activeGroup.members || []
    };
    onChange(updatedData);
  };

  const updateMember = (index, field, value) => {
    const list = [...(currentComm.members || [])];
    list[index] = { ...list[index], [field]: value };
    const updatedDivision = { ...currentComm, members: list };
    const updatedData = {
      ...data,
      [selectedDivision]: updatedDivision,
      members: selectedDivision === activeType ? list : data?.members
    };
    onChange(updatedData);
  };

  const addMember = (defaultRole = '', defaultDesignation = '') => {
    const list = [...(currentComm.members || [])];
    const role = defaultRole || (selectedDivision === 'adhoc' ? 'অভিভাবক সদস্য' : 'অভিভাবক প্রতিনিধি');
    const desig = defaultDesignation || (role === 'সভাপতি' ? 'মনোনীত সভাপতি' : role === 'সদস্য সচিব' ? 'প্রধান শিক্ষক' : 'সম্মানিত সদস্য');
    list.push({ name_bn: '', role, designation: desig, mobile: '', photo: '' });
    const updatedDivision = { ...currentComm, members: list };
    const updatedData = {
      ...data,
      [selectedDivision]: updatedDivision,
      members: selectedDivision === activeType ? list : data?.members
    };
    onChange(updatedData);
  };

  const removeMember = (index) => {
    const list = [...(currentComm.members || [])];
    list.splice(index, 1);
    const updatedDivision = { ...currentComm, members: list };
    const updatedData = {
      ...data,
      [selectedDivision]: updatedDivision,
      members: selectedDivision === activeType ? list : data?.members
    };
    onChange(updatedData);
  };

  const loadStandardTemplate = () => {
    const defaultList = selectedDivision === 'adhoc'
      ? DEFAULT_INSTITUTION_DATA.committee.adhoc.members
      : DEFAULT_INSTITUTION_DATA.committee.regular.members;
    if (confirm(`আপনি কি ${selectedDivision === 'adhoc' ? 'এডহক কমিটি' : 'নিয়মিত ম্যানেজিং কমিটি'}-এর আদর্শ ক্যাটাগরি তালিকা লোড করতে চান? এতে বর্তমান তালিকার স্থানে আদর্শ নমুনা তালিকা প্রতিস্থাপিত হবে।`)) {
      const updatedDivision = { ...currentComm, members: JSON.parse(JSON.stringify(defaultList)) };
      const updatedData = {
        ...data,
        [selectedDivision]: updatedDivision,
        members: selectedDivision === activeType ? defaultList : data?.members
      };
      onChange(updatedData);
    }
  };

  // Role suggestions for quick chips
  const adhocRoleSuggestions = [
    'সভাপতি',
    'সদস্য সচিব',
    'শিক্ষক প্রতিনিধি',
    'অভিভাবক সদস্য',
    'বিদ্যোৎসাহী সদস্য'
  ];

  const regularRoleSuggestions = [
    'সভাপতি',
    'সদস্য সচিব',
    'দাতা সদস্য',
    'প্রতিষ্ঠাতা সদস্য',
    'বিদ্যোৎসাহী সদস্য',
    'অভিভাবক প্রতিনিধি',
    'সংরক্ষিত মহিলা অভিভাবক প্রতিনিধি',
    'শিক্ষক প্রতিনিধি',
    'সংরক্ষিত মহিলা শিক্ষক প্রতিনিধি',
    'হিতৈষী সদস্য',
    'কো-অপ্ট সদস্য'
  ];

  const currentRoleSuggestions = selectedDivision === 'adhoc' ? adhocRoleSuggestions : regularRoleSuggestions;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👥 ৩. পরিচালনা পর্ষদ (Managing Committee) সদস্য এন্ট্রি</span>
          </h3>
          <small style={{ color: '#64748b', fontSize: '12.5px' }}>
            এডহক কমিটি ও নিয়মিত ম্যানেজিং কমিটি—উভয় ক্যাটাগরির সদস্য আলাদাভাবে এন্ট্রি ও পরিচালনা করুন
          </small>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      {/* Two Divisions Switcher Bar (২টি ভাগ) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
        background: '#f1f5f9',
        padding: '6px',
        borderRadius: '10px'
      }}>
        {/* Tab 1: নিয়মিত ম্যানেজিং কমিটি */}
        <button
          type="button"
          onClick={() => setSelectedDivision('regular')}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: selectedDivision === 'regular' ? '2px solid #047857' : '1px solid #cbd5e1',
            background: selectedDivision === 'regular' ? '#ffffff' : 'transparent',
            color: selectedDivision === 'regular' ? '#065f46' : '#475569',
            fontWeight: selectedDivision === 'regular' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: selectedDivision === 'regular' ? '0 2px 8px rgba(4,120,87,0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🏛️</span>
            <div style={{ textAlign: 'left' }}>
              <div>ভাগ ১: নিয়মিত ম্যানেজিং কমিটি</div>
              <small style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500 }}>পূর্ণাঙ্গ কমিটি • ২-৩ বছর মেয়াদি</small>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: selectedDivision === 'regular' ? '#ecfdf5' : '#e2e8f0',
              color: selectedDivision === 'regular' ? '#047857' : '#64748b',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              {(regularComm.members || []).length} জন
            </span>
            {activeType === 'regular' && (
              <span style={{
                background: '#059669',
                color: '#fff',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                সক্রিয়
              </span>
            )}
          </div>
        </button>

        {/* Tab 2: এডহক কমিটি */}
        <button
          type="button"
          onClick={() => setSelectedDivision('adhoc')}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: selectedDivision === 'adhoc' ? '2px solid #0284c7' : '1px solid #cbd5e1',
            background: selectedDivision === 'adhoc' ? '#ffffff' : 'transparent',
            color: selectedDivision === 'adhoc' ? '#0369a1' : '#475569',
            fontWeight: selectedDivision === 'adhoc' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: selectedDivision === 'adhoc' ? '0 2px 8px rgba(2,132,199,0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            <div style={{ textAlign: 'left' }}>
              <div>ভাগ ২: এডহক কমিটি</div>
              <small style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500 }}>অস্থায়ী কমিটি • সাধারণত ৬ মাস মেয়াদি</small>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: selectedDivision === 'adhoc' ? '#f0f9ff' : '#e2e8f0',
              color: selectedDivision === 'adhoc' ? '#0369a1' : '#64748b',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              {(adhocComm.members || []).length} জন
            </span>
            {activeType === 'adhoc' && (
              <span style={{
                background: '#0284c7',
                color: '#fff',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                সক্রিয়
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Active Committee Status Selector Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <strong style={{ fontSize: '13.5px', color: '#1e293b', display: 'block' }}>
            🔘 বিদ্যালয়ে বর্তমানে কার্যকর পরিচালনা কমিটি কোনটি?
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            যে কমিটি কার্যকর হিসেবে নির্বাচন করবেন, পাবলিক সাইট ও পোর্টালে সেটিই অগ্রাধিকার ভিত্তিতে প্রদর্শিত হবে
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            background: activeType === 'regular' ? '#ecfdf5' : '#f8fafc',
            border: activeType === 'regular' ? '1.5px solid #047857' : '1px solid #cbd5e1',
            color: activeType === 'regular' ? '#065f46' : '#64748b'
          }}>
            <input
              type="radio"
              name="committee_active_type"
              checked={activeType === 'regular'}
              onChange={() => setActiveType('regular')}
            />
            🏛️ নিয়মিত ম্যানেজিং কমিটি
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            background: activeType === 'adhoc' ? '#f0f9ff' : '#f8fafc',
            border: activeType === 'adhoc' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
            color: activeType === 'adhoc' ? '#0369a1' : '#64748b'
          }}>
            <input
              type="radio"
              name="committee_active_type"
              checked={activeType === 'adhoc'}
              onChange={() => setActiveType('adhoc')}
            />
            📋 এডহক কমিটি
          </label>
        </div>
      </div>

      {/* Guidance Card */}
      <GuidanceGuideCard
        title={selectedDivision === 'adhoc' ? 'এডহক কমিটি এন্ট্রি নির্দেশিকা' : 'নিয়মিত ম্যানেজিং কমিটি এন্ট্রি নির্দেশিকা'}
        steps={selectedDivision === 'adhoc' ? [
          '১. এডহক কমিটির বর্তমান অনুমোদন সেশন / মেয়াদকাল লিখুন (যেমন: ২০২৬ (৬ মাস মেয়াদি) বা নির্দিষ্ট তারিখ)।',
          '২. শিক্ষা বোর্ড বা জেলা প্রশাসন কর্তৃক প্রদত্ত অনুমোদন স্মারক নং ও তারিখ উল্লেখ করুন।',
          '৩. সাধারণত ৪ সদস্য বিশিষ্ট কাঠামো: ১. সভাপতি (মনোনীত/প্রশাসনিক), ২. সদস্য সচিব (প্রধান শিক্ষক), ৩. শিক্ষক প্রতিনিধি, ৪. অভিভাবক সদস্য।',
          '৪. নতুন সদস্য যোগ করতে "+ নতুন সদস্য যোগ" বা নিচের দ্রুত ক্যাটাগরি বোতামগুলোতে ক্লিক করুন।'
        ] : [
          '১. নিয়মিত ম্যানেজিং কমিটির মেয়াদকাল লিখুন (যেমন: ২০২৪–২০২৬)।',
          '২. বোর্ড/মাউশি অনুমোদিত স্মারক নম্বর ও তারিখ নথিভুক্ত করুন।',
          '৩. বিভিন্ন ক্যাটাগরির সদস্য তালিকাভুক্ত করুন: সভাপতি, সদস্য সচিব (প্রধান শিক্ষক), শিক্ষক প্রতিনিধি, অভিভাবক প্রতিনিধি, দাতা সদস্য, প্রতিষ্ঠাতা সদস্য, বিদ্যোৎসাহী সদস্য, হিতৈষী সদস্য।',
          '৪. "+ নতুন সদস্য যোগ" বাটনে ক্লিক করে সদস্য সংখ্যা বাড়ানো যাবে।'
        ]}
        tips={selectedDivision === 'adhoc'
          ? 'এডহক কমিটি সাধারণত পূর্ণাঙ্গ কমিটি গঠনের পূর্ববর্তী অন্তর্বর্তীকালীন সময়ে বিদ্যালয়ের প্রশাসনিক ধারাবাহিকতা বজায় রাখতে গঠিত হয়।'
          : 'নিয়মিত ম্যানেজিং কমিটিতে সভাপতি সবার উপরে এবং সদস্য সচিব (প্রধান শিক্ষক) দ্বিতীয় স্থানে থাকা বাঞ্ছনীয়।'}
        example={selectedDivision === 'adhoc'
          ? 'মোঃ খোরশেদ আলম (সভাপতি), মুহাম্মদ শফিকুল ইসলাম (সদস্য সচিব), তাপসী সরকার (শিক্ষক প্রতিনিধি)...'
          : 'নেয়ামুল হক খান (সভাপতি), মুহাম্মদ শফিকুল ইসলাম (সদস্য সচিব), আলহাজ্ব মোঃ আব্দুল লতিফ (দাতা সদস্য)...'}
      />

      {/* Division Specific Meta Fields */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        background: '#f8fafc',
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        marginBottom: '16px'
      }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', color: '#1e293b' }}>
            কমিটির শিরোনাম:
          </label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            value={currentComm.title || (selectedDivision === 'adhoc' ? 'এডহক কমিটি' : 'নিয়মিত ম্যানেজিং কমিটি')}
            onChange={(e) => updateCommitteeField('title', e.target.value)}
            placeholder="যেমন: নিয়মিত ম্যানেজিং কমিটি / এডহক কমিটি"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', color: '#1e293b' }}>
            অনুমোদন মেয়াদকাল:
          </label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            value={currentComm.tenure || ''}
            onChange={(e) => updateCommitteeField('tenure', e.target.value)}
            placeholder={selectedDivision === 'adhoc' ? 'যেমন: ২০২৬ (৬ মাস মেয়াদি)' : 'যেমন: ২০২৪–২০২৬'}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', color: '#1e293b' }}>
            বোর্ড/প্রশাসন অনুমোদন স্মারক নং ও তারিখ (ঐচ্ছিক):
          </label>
          <input
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={currentComm.approval_memo || ''}
            onChange={(e) => updateCommitteeField('approval_memo', e.target.value)}
            placeholder="যেমন: মাউশি/ঢাকা শিক্ষা বোর্ড অনুমোদন স্মারক নং: ৩৭.০২.০০০০... তারিখ: ১৫-০১-২০২৪"
          />
        </div>
      </div>

      {/* Quick Role Addition Chips */}
      <div style={{ marginBottom: '14px', background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
          ⚡ এক ক্লিকে ক্যাটাগরি অনুযায়ী সদস্য এন্ট্রি যোগ করুন:
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {currentRoleSuggestions.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addMember(r)}
              style={{
                background: '#ffffff',
                border: '1px solid #94a3b8',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>+</span> {r}
            </button>
          ))}
        </div>
      </div>

      {/* Member List Header & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ color: selectedDivision === 'adhoc' ? '#0369a1' : '#047857', margin: 0, fontSize: '14.5px', fontWeight: 800 }}>
          {selectedDivision === 'adhoc' ? '📋 এডহক কমিটির সদস্য তালিকা' : '🏛️ নিয়মিত ম্যানেজিং কমিটির সদস্য তালিকা'}
          <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#64748b', marginLeft: '6px' }}>
            ({(currentComm.members || []).length} জন সদস্য নথিভুক্ত)
          </span>
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn mini"
            onClick={loadStandardTemplate}
            style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
          >
            📋 আদর্শ কাঠামো লোড
          </button>
          <button
            type="button"
            className="btn mini"
            onClick={() => addMember()}
            style={{ background: selectedDivision === 'adhoc' ? '#0284c7' : '#047857', color: '#fff', fontWeight: 700 }}
          >
            + নতুন সদস্য যোগ
          </button>
        </div>
      </div>

      {/* Datalist for autocomplete committee roles */}
      <datalist id="committee-roles-list">
        {currentRoleSuggestions.map((role, idx) => (
          <option key={idx} value={role} />
        ))}
      </datalist>

      {/* Members Grid / Rows */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {(currentComm.members || []).length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>এই বিভাগে এখনও কোনো সদস্য যোগ করা হয়নি।</p>
            <button
              type="button"
              className="btn mini"
              onClick={() => addMember()}
              style={{ marginTop: '8px', background: '#047857', color: '#fff' }}
            >
              + প্রথম সদস্য যোগ করুন
            </button>
          </div>
        ) : (
          (currentComm.members || []).map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 170px 180px 1fr 130px 60px',
                gap: '8px',
                alignItems: 'center',
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}
            >
              <div style={{ textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '12px' }}>
                {idx + 1}.
              </div>

              <div>
                <small style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 600 }}>কমিটি ক্যাটাগরি / রোল:</small>
                <input
                  list="committee-roles-list"
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#065f46' }}
                  placeholder="যেমন: সভাপতি"
                  value={m.role || ''}
                  onChange={(e) => updateMember(idx, 'role', e.target.value)}
                />
              </div>

              <div>
                <small style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 600 }}>সদস্যের পুরো নাম:</small>
                <input
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                  placeholder="নাম লিখুন"
                  value={m.name_bn || ''}
                  onChange={(e) => updateMember(idx, 'name_bn', e.target.value)}
                />
              </div>

              <div>
                <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>পদবি / সামাজিক পরিচিতি:</small>
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
                <button
                  type="button"
                  className="btn mini"
                  title="এই সদস্যকে তালিকা থেকে বাদ দিন"
                  onClick={() => removeMember(idx)}
                  style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700, padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Save & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className="btn mini"
          onClick={() => addMember()}
          style={{ background: selectedDivision === 'adhoc' ? '#0284c7' : '#047857', color: '#fff', fontWeight: 700 }}
        >
          + নতুন সদস্য যোগ
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ দেখুন</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সকল তথ্য সংরক্ষণ করুন</button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Section 3.5: বিদ্যালয়ের দাতা সদস্য (আজীবন ও এককালীন দাতা সদস্য)
// ----------------------------------------------------
function SectionDonors({ data, onChange, onSave, onReset, onPreview }) {
  const [lifeDonors, setLifeDonors] = useState(() => (
    (Array.isArray(data?.life_donors) && data.life_donors.length)
      ? data.life_donors
      : JSON.parse(JSON.stringify(DEFAULT_INSTITUTION_DATA.donors.life_donors))
  ));

  const [oneTimeDonors, setOneTimeDonors] = useState(() => (
    (Array.isArray(data?.one_time_donors) && data.one_time_donors.length)
      ? data.one_time_donors
      : JSON.parse(JSON.stringify(DEFAULT_INSTITUTION_DATA.donors.one_time_donors))
  ));

  const [selectedFeature, setSelectedFeature] = useState(data?.active_type || 'life');
  const [searchFilter, setSearchFilter] = useState('');

  // Keep local state in sync when parent data changes externally
  useEffect(() => {
    if (Array.isArray(data?.life_donors) && data.life_donors.length) {
      setLifeDonors(data.life_donors);
    }
    if (Array.isArray(data?.one_time_donors) && data.one_time_donors.length) {
      setOneTimeDonors(data.one_time_donors);
    }
    if (data?.active_type) {
      setSelectedFeature(data.active_type);
    }
  }, [data]);

  const currentList = selectedFeature === 'life' ? lifeDonors : oneTimeDonors;

  // Helper to commit changes safely to local state and parent
  const commitListChange = (nextList, feature = selectedFeature) => {
    const nextLife = feature === 'life' ? nextList : lifeDonors;
    const nextOneTime = feature === 'one_time' ? nextList : oneTimeDonors;
    if (feature === 'life') setLifeDonors(nextLife);
    else setOneTimeDonors(nextOneTime);

    const payload = {
      active_type: feature,
      life_donors: nextLife,
      one_time_donors: nextOneTime
    };
    if (typeof onChange === 'function') {
      onChange(payload);
    }
    return payload;
  };

  const handleFeatureSwitch = (feature) => {
    setSelectedFeature(feature);
    const payload = {
      active_type: feature,
      life_donors: lifeDonors,
      one_time_donors: oneTimeDonors
    };
    if (typeof onChange === 'function') {
      onChange(payload);
    }
  };

  const updateDonorField = (index, field, value) => {
    const list = [...currentList];
    list[index] = { ...list[index], [field]: value };
    commitListChange(list, selectedFeature);
  };

  const addDonor = () => {
    const list = [...currentList];
    const newId = (selectedFeature === 'life' ? 'ld-' : 'otd-') + Date.now();
    const newDonor = {
      id: newId,
      name_bn: '',
      name_en: '',
      designation: selectedFeature === 'life' ? 'বিশিষ্ট দানবীর ও শিক্ষানুরাগী' : 'বিশিষ্ট সমাজসেবক ও শুভানুধ্যায়ী',
      donation_amount: '',
      year: '২০২৬',
      address: 'মগড়া, টাঙ্গাইল সদর',
      mobile: '',
      status: selectedFeature === 'life' ? 'আজীবন দাতা সদস্য' : 'এককালীন দাতা সদস্য',
      remarks: '',
      photo: ''
    };
    list.push(newDonor);
    commitListChange(list, selectedFeature);
  };

  const removeDonor = (index) => {
    if (!confirm('আপনি কি এই দাতা সদস্যের তথ্য তালিকা থেকে মুছে ফেলতে চান?')) return;
    const list = [...currentList];
    list.splice(index, 1);
    commitListChange(list, selectedFeature);
  };

  const loadStandardTemplate = () => {
    const defaultList = selectedFeature === 'life'
      ? DEFAULT_INSTITUTION_DATA.donors.life_donors
      : DEFAULT_INSTITUTION_DATA.donors.one_time_donors;
    if (confirm(`আপনি কি ${selectedFeature === 'life' ? 'আজীবন দাতা সদস্য' : 'এককালীন দাতা সদস্য'}-এর আদর্শ নমুনা তালিকা লোড করতে চান? এতে বর্তমান তালিকার স্থানে আদর্শ তালিকা প্রতিস্থাপিত হবে।`)) {
      commitListChange(JSON.parse(JSON.stringify(defaultList)), selectedFeature);
    }
  };

  // Synchronously deliver the latest donor payload to save handler
  const handleSaveDonors = () => {
    const payload = {
      active_type: selectedFeature,
      life_donors: lifeDonors,
      one_time_donors: oneTimeDonors
    };
    if (typeof onChange === 'function') {
      onChange(payload);
    }
    if (typeof onSave === 'function') {
      onSave(payload);
    }
  };

  // Official school pad print handler
  const handlePrintDonorsPad = (typeToPrint = 'current') => {
    const w = window.open('', '_blank');
    if (!w) return;

    const actualType = typeToPrint === 'current' ? selectedFeature : typeToPrint;
    const targetList = actualType === 'life' ? lifeDonors : actualType === 'one_time' ? oneTimeDonors : [...lifeDonors, ...oneTimeDonors];
    const titleText = actualType === 'life'
      ? 'আজীবন দাতা সদস্যবৃন্দের অফিসিয়াল তালিকা'
      : actualType === 'one_time'
      ? 'এককালীন দাতা সদস্যবৃন্দের অফিসিয়াল তালিকা'
      : 'বিদ্যালয়ের সম্মানিত দাতা সদস্যবৃন্দের পূর্ণাঙ্গ রেজিস্ট্রি (আজীবন ও এককালীন)';

    // Get signatures: সভাপতি বাম পাশে, প্রধান শিক্ষক ডান পাশে
    const comm = data?.committee || {};
    const activeComm = comm.active_type === 'adhoc' ? comm.adhoc : (comm.regular || comm);
    const members = activeComm?.members || [];
    const presMember = members.find(m => m.role?.includes('সভাপতি')) || members[0] || {};
    const headMember = members.find(m => m.role?.includes('সদস্য সচিব') || m.designation?.includes('প্রধান শিক্ষক')) || {};

    const presName = presMember.name_bn || 'নেয়ামুল হক খান';
    const presRole = presMember.role || 'সভাপতি';
    const presSub = comm.active_type === 'adhoc' ? 'এডহক কমিটি' : 'বিদ্যালয় পরিচালনা পর্ষদ';

    const headName = headMember.name_bn || 'মুহাম্মদ শফিকুল ইসলাম';
    const headRole = 'প্রধান শিক্ষক ও সদস্য সচিব';
    const headSub = 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়';

    const rows = targetList.map((d, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td>
          <b>${d.name_bn || '—'}</b>
          ${d.name_en ? `<br><small style="color:#64748b;">${d.name_en}</small>` : ''}
          ${d.designation ? `<br><small style="color:#047857;">${d.designation}</small>` : ''}
        </td>
        <td>
          ${d.address || '—'}
          ${d.mobile ? `<br><small style="color:#475569;">📱 ${d.mobile}</small>` : ''}
        </td>
        <td style="text-align:center;">
          <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;${d.id?.startsWith('ld') || (d.status && d.status.includes('আজীবন')) ? 'background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;' : 'background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;'}">
            ${d.status || (d.id?.startsWith('ld') ? 'আজীবন দাতা সদস্য' : 'এককালীন দাতা সদস্য')}
          </span>
        </td>
        <td style="font-weight:800;color:#0f172a;text-align:center;">
          ${d.donation_amount || '—'}
          ${d.remarks ? `<br><small style="color:#64748b;font-style:italic;font-weight:normal;">${d.remarks}</small>` : ''}
        </td>
        <td style="text-align:center;font-weight:700;color:#047857;">
          ${toBn(d.year || '—')}
        </td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${titleText} — মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 20px; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 8px; }
          .doc-meta { font-size: 12.5px; color: #475569; margin-bottom: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #94a3b8; padding: 7px 8px; text-align: left; vertical-align: top; }
          th { background: #f0fdf4; color: #166534; font-weight: 800; }
          .sig-grid { margin-top: 55px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13.5px; }
          .sig-box-left { text-align: center; }
          .sig-box-right { text-align: center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 15px 0 10px 0;">
          <span class="doc-badge">🏛️ অফিসিয়াল দাতা সদস্য রেজিস্ট্রি</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:19px;">${titleText}</h2>
          <div class="doc-meta">
            প্রতিবেদন প্রস্তুতের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • মোট প্রদর্শিত দাতা সদস্য: ${toBn(targetList.length)} জন
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:38px; text-align:center;">ক্র.</th>
              <th style="min-width:140px;">দাতা সদস্যের নাম ও পরিচিতি</th>
              <th style="min-width:110px;">ঠিকানা ও যোগাযোগ</th>
              <th style="width:110px; text-align:center;">ক্যাটাগরি</th>
              <th style="width:140px; text-align:center;">অনুদানের বিবরণ/পরিমাণ</th>
              <th style="width:55px; text-align:center;">সাল</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <!-- স্বাক্ষর সেকশন: সভাপতি বাম পাশে, প্রধান শিক্ষক ডান পাশে -->
        <div class="sig-grid">
          <!-- বাম পাশ: সভাপতি -->
          <div class="sig-box-left">
            <div class="sig-line"></div>
            <b style="font-size: 14px; color: #0f172a;">${presName}</b><br>
            <span style="font-weight: 700; color: #334155;">${presRole}</span><br>
            <small style="color: #64748b;">${presSub}</small>
          </div>

          <!-- ডান পাশ: প্রধান শিক্ষক -->
          <div class="sig-box-right">
            <div class="sig-line"></div>
            <b style="font-size: 14px; color: #0f172a;">${headName}</b><br>
            <span style="font-weight: 700; color: #334155;">${headRole}</span><br>
            <small style="color: #64748b;">${headSub}</small>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function(){ window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  const filteredIndices = currentList.map((item, idx) => ({ item, idx })).filter(({ item }) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (item.name_bn || '').toLowerCase().includes(q) ||
      (item.name_en || '').toLowerCase().includes(q) ||
      (item.donation_amount || '').toLowerCase().includes(q) ||
      (item.address || '').toLowerCase().includes(q) ||
      (item.year || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤝 বিদ্যালয়ের দাতা সদস্য (Honorable Donor Members)</span>
          </h3>
          <small style={{ color: '#64748b', fontSize: '12.5px' }}>
            এককালীন দাতা সদস্য ও আজীবন দাতা সদস্য—উভয় ফিচারের সম্মানিত ব্যক্তিবর্গের তথ্য পৃথকভাবে এন্ট্রি, এডিট ও অফিসিয়াল প্যাডে প্রিন্ট করুন
          </small>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn mini"
            onClick={() => handlePrintDonorsPad(selectedFeature)}
            style={{ background: '#047857', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(4,120,87,0.2)' }}
            title="বর্তমান নির্বাচিত তালিকা অফিসিয়াল প্যাডে প্রিন্ট করুন"
          >
            🖨️ {selectedFeature === 'life' ? 'আজীবন' : 'এককালীন'} তালিকা প্রিন্ট (A4)
          </button>
          <button
            type="button"
            className="btn mini"
            onClick={() => handlePrintDonorsPad('all')}
            style={{ background: '#1e293b', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
            title="উভয় (আজীবন ও এককালীন) দাতা সদস্যদের পূর্ণাঙ্গ তালিকা প্রিন্ট করুন"
          >
            🖨️ পূর্ণাঙ্গ তালিকা প্রিন্ট
          </button>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={handleSaveDonors} style={{ background: '#059669', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>💾 সংরক্ষণ</button>
        </div>
      </div>

      {/* Two Features Switcher Bar (২টি ফিচার) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
        background: '#f1f5f9',
        padding: '6px',
        borderRadius: '10px'
      }}>
        {/* Feature 1: আজীবন দাতা সদস্য */}
        <button
          type="button"
          onClick={() => handleFeatureSwitch('life')}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: selectedFeature === 'life' ? '2px solid #047857' : '1px solid #cbd5e1',
            background: selectedFeature === 'life' ? '#ffffff' : 'transparent',
            color: selectedFeature === 'life' ? '#065f46' : '#475569',
            fontWeight: selectedFeature === 'life' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: selectedFeature === 'life' ? '0 2px 8px rgba(4,120,87,0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💎</span>
            <div style={{ textAlign: 'left' }}>
              <div>ফিচার ১: আজীবন দাতা সদস্যদের তথ্য</div>
              <small style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500 }}>স্থায়ী তহবিল ও ভূমি দাতা সদস্যবৃন্দ</small>
            </div>
          </div>
          <span style={{
            background: selectedFeature === 'life' ? '#ecfdf5' : '#e2e8f0',
            color: selectedFeature === 'life' ? '#047857' : '#64748b',
            padding: '2px 9px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800
          }}>
            {lifeDonors.length} জন
          </span>
        </button>

        {/* Feature 2: এককালীন দাতা সদস্য */}
        <button
          type="button"
          onClick={() => handleFeatureSwitch('one_time')}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: selectedFeature === 'one_time' ? '2px solid #0284c7' : '1px solid #cbd5e1',
            background: selectedFeature === 'one_time' ? '#ffffff' : 'transparent',
            color: selectedFeature === 'one_time' ? '#0369a1' : '#475569',
            fontWeight: selectedFeature === 'one_time' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: selectedFeature === 'one_time' ? '0 2px 8px rgba(2,132,199,0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🤝</span>
            <div style={{ textAlign: 'left' }}>
              <div>ফিচার ২: এককালীন দাতা সদস্যদের তথ্য</div>
              <small style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500 }}>বিশেষ প্রকল্প, ল্যাব, লাইব্রেরি ও নগদ অনুদান</small>
            </div>
          </div>
          <span style={{
            background: selectedFeature === 'one_time' ? '#e0f2fe' : '#e2e8f0',
            color: selectedFeature === 'one_time' ? '#0284c7' : '#64748b',
            padding: '2px 9px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800
          }}>
            {oneTimeDonors.length} জন
          </span>
        </button>
      </div>

      {/* Feature Guidance Card */}
      <div style={{
        background: selectedFeature === 'life' ? '#f0fdf4' : '#f0f9ff',
        border: `1px solid ${selectedFeature === 'life' ? '#86efac' : '#7dd3fc'}`,
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ fontSize: '13px', color: selectedFeature === 'life' ? '#166534' : '#075985', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{selectedFeature === 'life' ? '💎' : '🤝'}</span>
          <span>
            <strong>{selectedFeature === 'life' ? 'আজীবন দাতা সদস্য তালিকা পরিচালনা:' : 'এককালীন দাতা সদস্য তালিকা পরিচালনা:'}</strong>{' '}
            {selectedFeature === 'life'
              ? 'শিক্ষা বোর্ড ও মাউশি বিধিমতে স্থায়ী অনুদানকারী আজীবন দাতা সদস্যদের তথ্য এন্ট্রি ও পরিচালনা করুন।'
              : 'বিদ্যালয়ের উন্নয়ন কর্মকাণ্ড, ডিজিটাল ল্যাব, ভবন ও তহবিলে এককালীন অনুদানকারী সম্মানিত ব্যক্তিবর্গের তথ্য।'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn mini"
            onClick={loadStandardTemplate}
            style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
          >
            📋 আদর্শ নমুনা লোড করুন
          </button>
        </div>
      </div>

      {/* Search, Quick Add, and Print Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 নাম, গ্রাম, অনুদানের বিবরণ বা সাল দিয়ে খুঁজুন..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn mini"
            onClick={() => handlePrintDonorsPad(selectedFeature)}
            style={{ background: '#047857', color: '#fff', fontWeight: 700, padding: '7px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="বর্তমান তালিকা অফিসিয়াল প্যাডে প্রিন্ট করুন"
          >
            🖨️ প্যাডে প্রিন্ট (A4)
          </button>
          <button
            type="button"
            className="btn mini"
            onClick={addDonor}
            style={{ background: selectedFeature === 'life' ? '#065f46' : '#0284c7', color: '#fff', fontWeight: 700, padding: '7px 14px', borderRadius: '6px' }}
          >
            + নতুন {selectedFeature === 'life' ? 'আজীবন' : 'এককালীন'} দাতা যোগ
          </button>
        </div>
      </div>

      {/* Datalists */}
      <datalist id="donor-status-options">
        <option value="আজীবন দাতা সদস্য" />
        <option value="এককালীন দাতা সদস্য" />
        <option value="মরহুম আজীবন দাতা সদস্য" />
        <option value="প্রতিষ্ঠাতা দাতা সদস্য" />
        <option value="সম্মানিত দাতা সদস্য" />
      </datalist>

      {/* Donor Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredIndices.map(({ item, idx }) => (
          <div
            key={item.id || idx}
            style={{
              background: '#ffffff',
              border: `1.5px solid ${selectedFeature === 'life' ? '#a7f3d0' : '#bae6fd'}`,
              borderRadius: '10px',
              padding: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: selectedFeature === 'life' ? '#047857' : '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  #{idx + 1}
                </span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                  {item.name_bn || `নতুন ${selectedFeature === 'life' ? 'আজীবন' : 'এককালীন'} দাতা সদস্য`}
                </strong>
                {item.year && (
                  <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '1px 7px', borderRadius: '4px' }}>
                    সাল: {item.year}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeDonor(idx)}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ✕ মুছে ফেলুন
              </button>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  দাতা সদস্যের নাম (বাংলা)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: আলহাজ্ব মোঃ আব্দুল লতিফ"
                  value={item.name_bn || ''}
                  onChange={(e) => updateDonorField(idx, 'name_bn', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  দাতা সদস্যের নাম (ইংরেজি)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alhaj Md. Abdul Latif"
                  value={item.name_en || ''}
                  onChange={(e) => updateDonorField(idx, 'name_en', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  পদবি / সামাজিক পরিচিতি
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিশিষ্ট দানবীর ও শিক্ষানুরাগী"
                  value={item.designation || ''}
                  onChange={(e) => updateDonorField(idx, 'designation', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  অনুদানের পরিমাণ ও বিবরণ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১,০০,০০০/- টাকা ও ৫০ শতক জমি"
                  value={item.donation_amount || ''}
                  onChange={(e) => updateDonorField(idx, 'donation_amount', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  দানের সাল / তারিখ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১৯৮২ বা ২০২৩"
                  value={item.year || ''}
                  onChange={(e) => updateDonorField(idx, 'year', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  গ্রাম / স্থায়ী ঠিকানা
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মগড়া, টাঙ্গাইল সদর"
                  value={item.address || ''}
                  onChange={(e) => updateDonorField(idx, 'address', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={item.mobile || ''}
                  onChange={(e) => updateDonorField(idx, 'mobile', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  স্বীকৃতি / স্ট্যাটাস
                </label>
                <input
                  type="text"
                  list="donor-status-options"
                  placeholder={selectedFeature === 'life' ? 'আজীবন দাতা সদস্য' : 'এককালীন দাতা সদস্য'}
                  value={item.status || ''}
                  onChange={(e) => updateDonorField(idx, 'status', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                  ছবি / ফটো ইউআরএল
                </label>
                <input
                  type="text"
                  placeholder="https://... অথবা খালি রাখুন"
                  value={item.photo || ''}
                  onChange={(e) => updateDonorField(idx, 'photo', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                বিশেষ ভূমিকা ও অবদান (মন্তব্য / স্বীকৃতি বিবরণ)
              </label>
              <input
                type="text"
                placeholder="বিদ্যালয় প্রতিষ্ঠায় অথবা ক্যাম্পাস সম্প্রসারণে বিশেষ অবদানের কথা..."
                value={item.remarks || ''}
                onChange={(e) => updateDonorField(idx, 'remarks', e.target.value)}
                style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        ))}

        {!filteredIndices.length && (
          <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            কোনো দাতা সদস্যের তথ্য পাওয়া যায়নি। উপরে <b>+ নতুন দাতা যোগ</b> বাটনে ক্লিক করুন।
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          className="btn mini"
          onClick={addDonor}
          style={{ background: selectedFeature === 'life' ? '#047857' : '#0284c7', color: '#fff', fontWeight: 700 }}
        >
          + নতুন {selectedFeature === 'life' ? 'আজীবন' : 'এককালীন'} দাতা যোগ
        </button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn mini"
            onClick={() => handlePrintDonorsPad(selectedFeature)}
            style={{ background: '#047857', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🖨️ {selectedFeature === 'life' ? 'আজীবন' : 'এককালীন'} প্রিন্ট
          </button>
          <button
            type="button"
            className="btn mini"
            onClick={() => handlePrintDonorsPad('all')}
            style={{ background: '#1e293b', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🖨️ পূর্ণাঙ্গ প্রিন্ট
          </button>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ দেখুন</button>
          <button type="button" className="btn mini" onClick={handleSaveDonors} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সকল তথ্য সংরক্ষণ করুন</button>
        </div>
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
// Section 7: গ্রন্থাগার/লাইব্রেরী
// ----------------------------------------------------
function SectionLibrary({ data, onChange, onSave, onReset, onPreview, onNavigate }) {
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
        <h3 style={{ margin: 0, color: '#065f46', fontSize: '17px' }}>📚 ৭. কেন্দ্রীয় গ্রন্থাগার ও লাইব্রেরী তথ্য এন্ট্রি</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn mini" onClick={onPreview} style={{ background: '#0284c7', color: '#fff' }}>👁️ প্রিভিউ</button>
          <button type="button" className="btn mini" onClick={onReset} style={{ background: '#f1f5f9', color: '#475569' }}>🔄 রিসেট</button>
          <button type="button" className="btn mini" onClick={onSave} style={{ background: '#059669', color: '#fff', fontWeight: 700 }}>💾 সংরক্ষণ</button>
        </div>
      </div>

            {/* Direct Quick Link to Login Page Main Library System */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
        color: '#ffffff',
        padding: '14px 18px',
        borderRadius: '10px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(6,78,59,0.15)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>📚</span>
          <div>
            <b style={{ fontSize: '15px' }}>লগইন পেজের মূল গ্রন্থাগার ক্যাটালগ ও স্টক রেজিস্টার</b>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', opacity: 0.9 }}>
              বইয়ের নতুন স্টক এন্ট্রি, বই ইস্যু-জমা, রেজিস্টার ও বারকোড পরিচালনা করতে সরাসরি গ্রন্থাগার ডেস্কে যান।
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('library', 'catalog');
            } else {
              window.location.hash = '#/admin';
            }
          }}
          style={{
            background: '#fbbf24',
            color: '#78350f',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          📖 মূল গ্রন্থাগার প্যানেল খুলুন ➔
        </button>
      </div>
      <GuidanceGuideCard
        title="গ্রন্থাগার/লাইব্রেরী"
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
