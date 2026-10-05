import React, { useState, useEffect } from 'react';
import {
  MOCK_SCHOOL,
  MOCK_COMMITTEE,
  MOCK_TEACHERS,
  MOCK_STAFF,
  MOCK_STUDENTS,
  MOCK_SCHOLARSHIPS,
  MOCK_SSC_RESULTS,
  MOCK_NOTICES,
  MOCK_BOOKS,
  MOCK_SUBJECTS,
  MOCK_ROUTINES,
  PHOTO_PRESIDENT,
  PHOTO_HEAD_TEACHER,
  PHOTO_ASST_HEAD_TEACHER,
  PHOTO_ICT_TEACHER,
  PHOTO_OFFICE_ASSISTANT,
  getTeacherPhoto
} from './mockData';
import { requestApi } from './apiClient';

export function SubmenuDetailModal({ menuKey, title, onClose, onNavigateRole }) {
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [examScore, setExamScore] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Admission tab state
  const initialTab = menuKey?.includes('docs') ? 'docs' : menuKey?.includes('rules') ? 'rules' : menuKey?.includes('tracking') ? 'tracking' : 'apply';
  const [admTab, setAdmTab] = useState(initialTab);
  const emptyAdm = {
    academic_year: '2026',
    applied_class: '৬',
    applicant_name_bn: '',
    applicant_name_en: '',
    date_of_birth: '',
    gender: 'পুরুষ',
    religion: 'ইসলাম',
    blood_group: 'A+',
    birth_registration_no: '',
    father_name: '',
    father_phone: '',
    mother_name: '',
    mother_phone: '',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    previous_school: '',
    quota: 'সাধারণ',
    notes: ''
  };
  const [admForm, setAdmForm] = useState(emptyAdm);
  const [admReceipt, setAdmReceipt] = useState(null);
  const [admSubmitting, setAdmSubmitting] = useState(false);
  const [admMsg, setAdmMsg] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingMsg, setTrackingMsg] = useState('');

  useEffect(() => {
    if (menuKey?.includes('docs')) setAdmTab('docs');
    else if (menuKey?.includes('rules')) setAdmTab('rules');
    else if (menuKey?.includes('tracking')) setAdmTab('tracking');
    else if (menuKey?.includes('apply') || menuKey?.startsWith('public.nav.admission')) setAdmTab('apply');
  }, [menuKey]);

  if (!menuKey) return null;

  const handleAdmSubmit = async (e) => {
    e.preventDefault();
    if (!admForm.applicant_name_bn.trim()) {
      setAdmMsg('অনুগ্রহ করে শিক্ষার্থীর পুরো নাম লিখুন।');
      return;
    }
    if (!admForm.guardian_phone.trim()) {
      setAdmMsg('অনুগ্রহ করে অভিভাবকের সচল মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    setAdmSubmitting(true);
    setAdmMsg('');
    try {
      const res = await requestApi('/admissions', {
        method: 'POST',
        body: JSON.stringify({
          ...admForm,
          father_name: admForm.father_name || admForm.guardian_name,
          application_date: new Date().toISOString().slice(0, 10),
          status: 'submitted'
        })
      });
      setAdmReceipt(res);
      setAdmMsg('অভিনন্দন! আপনার অনলাইন ভর্তি আবেদন সফলভাবে গ্রহণ করা হয়েছে।');
    } catch (err) {
      setAdmMsg('আবেদন জমাদানে ত্রুটি: ' + err.message);
    } finally {
      setAdmSubmitting(false);
    }
  };

  const handleTrackingSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setTrackingMsg('');
    setTrackingResult(null);
    try {
      const list = await requestApi('/admissions?q=' + encodeURIComponent(trackingId.trim()));
      if (Array.isArray(list) && list.length > 0) {
        setTrackingResult(list[0]);
      } else {
        setTrackingMsg('প্রদত্ত নম্বর বা আবেদন আইডিতে কোনো আবেদন পাওয়া যায়নি।');
      }
    } catch {
      setTrackingMsg('তথ্য অনুসন্ধানে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const renderContent = () => {
    // 0. Online Admission Module & Submenus
    if (menuKey.startsWith('public.nav.admission') || menuKey === 'public.nav.results.admission' || title.includes('ভর্তি')) {
      return (
        <div className="submenu-content admission-modal-flow">
          <div className="modal-hero-badge">🎓 অনলাইন শিক্ষার্থী ভর্তি পোর্টাল — শিক্ষাবর্ষ ২০২৬</div>
          
          {/* Submenu Navigation Tabs */}
          <div className="adm-modal-tabs">
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'apply' ? 'active' : ''}`}
              onClick={() => setAdmTab('apply')}
            >
              📝 ভর্তির আবেদন ফরম
            </button>
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'docs' ? 'active' : ''}`}
              onClick={() => setAdmTab('docs')}
            >
              📑 প্রয়োজনীয় কাগজপত্র ও সনদ
            </button>
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'rules' ? 'active' : ''}`}
              onClick={() => setAdmTab('rules')}
            >
              📜 ভর্তি নিয়মাবলী ও যোগ্যতা
            </button>
            <button
              type="button"
              className={`adm-tab-btn ${admTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setAdmTab('tracking')}
            >
              🔍 আবেদন ট্র্যাকিং ও রসিদ
            </button>
          </div>

          {/* TAB 1: Online Application Form */}
          {admTab === 'apply' && (
            <div className="adm-tab-content">
              {admReceipt ? (
                <div className="admission-slip">
                  <span className="admission-slip-badge">✓ আবেদন সফলভাবে গৃহীত হয়েছে</span>
                  <h3 className="admission-slip-title">{admReceipt.applicant_name_bn}</h3>
                  <div className="admission-app-no">আবেদন নং: {admReceipt.application_no}</div>
                  <p style={{ margin: '4px 0 10px', fontSize: '13px', color: '#475569' }}>
                    শ্রেণি: <b>{admReceipt.applied_class}</b> • শিক্ষাবর্ষ: <b>{admReceipt.academic_year}</b>
                  </p>
                  <div className="admission-slip-details">
                    <div><b>পিতা/অভিভাবক:</b> {admReceipt.guardian_name || admReceipt.father_name}</div>
                    <div><b>মোবাইল:</b> {admReceipt.guardian_phone}</div>
                    <div><b>জন্ম তারিখ:</b> {admReceipt.date_of_birth || '—'}</div>
                    <div><b>আবেদনের তারিখ:</b> {admReceipt.application_date}</div>
                    <div style={{ gridColumn: '1/-1' }}><b>ঠিকানা:</b> {admReceipt.address || '—'}</div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '6px' }}>
                    📌 অনুগ্রহ করে এই আবেদনপত্রটি প্রিন্ট করে সংরক্ষণ করুন এবং ভর্তির দিন উল্লেখিত সকল মূল সনদসহ বিদ্যালয়ে উপস্থিত হোন।
                  </p>
                  <div className="admission-slip-actions">
                    <button type="button" className="adm-submit-btn" onClick={() => window.print()}>
                      🖨️ আবেদনপত্র ও রসিদ প্রিন্ট করুন
                    </button>
                    <button
                      type="button"
                      className="mini"
                      style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => { setAdmReceipt(null); setAdmForm(emptyAdm); setAdmMsg(''); }}
                    >
                      + নতুন আবেদন
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdmSubmit} className="adm-form-grid">
                  <div className="adm-form-field">
                    <label>ভর্তির শ্রেণি *</label>
                    <select value={admForm.applied_class} onChange={e => setAdmForm({ ...admForm, applied_class: e.target.value })} required>
                      {['৬', '৭', '৮', '৯', '১০'].map(c => (
                        <option key={c} value={c}>শ্রেণি {c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-form-field">
                    <label>শিক্ষাবর্ষ *</label>
                    <select value={admForm.academic_year} onChange={e => setAdmForm({ ...admForm, academic_year: e.target.value })} required>
                      <option value="2026">২০২৬</option>
                      <option value="2027">২০২৭</option>
                    </select>
                  </div>
                  <div className="adm-form-field full">
                    <label>শিক্ষার্থীর পুরো নাম (বাংলায়) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: মোঃ মাহির আহমেদ"
                      value={admForm.applicant_name_bn}
                      onChange={e => setAdmForm({ ...admForm, applicant_name_bn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field full">
                    <label>Applicant Full Name (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Md. Mahir Ahmed"
                      value={admForm.applicant_name_en}
                      onChange={e => setAdmForm({ ...admForm, applicant_name_en: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>জন্ম তারিখ *</label>
                    <input
                      type="date"
                      value={admForm.date_of_birth}
                      onChange={e => setAdmForm({ ...admForm, date_of_birth: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>লিঙ্গ *</label>
                    <select value={admForm.gender} onChange={e => setAdmForm({ ...admForm, gender: e.target.value })} required>
                      <option value="পুরুষ">পুরুষ</option>
                      <option value="নারী">নারী</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>
                  <div className="adm-form-field">
                    <label>ধর্ম</label>
                    <select value={admForm.religion} onChange={e => setAdmForm({ ...admForm, religion: e.target.value })}>
                      <option value="ইসলাম">ইসলাম</option>
                      <option value="হিন্দু">হিন্দু</option>
                      <option value="বৌদ্ধ">বৌদ্ধ</option>
                      <option value="খ্রিষ্টান">খ্রিষ্টান</option>
                    </select>
                  </div>
                  <div className="adm-form-field">
                    <label>রক্তের গ্রুপ</label>
                    <select value={admForm.blood_group} onChange={e => setAdmForm({ ...admForm, blood_group: e.target.value })}>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-form-field full">
                    <label>অনলাইন ডিজিটাল জন্ম নিবন্ধন নম্বর (১৭ ডিজিট) *</label>
                    <input
                      type="text"
                      placeholder="অনলাইন ভেরিফায়েড ১৭ ডিজিট নম্বর"
                      value={admForm.birth_registration_no}
                      onChange={e => setAdmForm({ ...admForm, birth_registration_no: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>পিতার নাম *</label>
                    <input
                      type="text"
                      placeholder="পিতার নাম"
                      value={admForm.father_name}
                      onChange={e => setAdmForm({ ...admForm, father_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>মাতার নাম *</label>
                    <input
                      type="text"
                      placeholder="মাতার নাম"
                      value={admForm.mother_name}
                      onChange={e => setAdmForm({ ...admForm, mother_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>অভিভাবকের নাম *</label>
                    <input
                      type="text"
                      placeholder="পিতা / মাতা / বৈধ অভিভাবক"
                      value={admForm.guardian_name}
                      onChange={e => setAdmForm({ ...admForm, guardian_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>অভিভাবকের সচল মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={admForm.guardian_phone}
                      onChange={e => setAdmForm({ ...admForm, guardian_phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-field full">
                    <label>বর্তমান ঠিকানা (গ্রাম, ডাকঘর, উপজেলা, জেলা) *</label>
                    <textarea
                      rows="2"
                      placeholder="যেমন: গ্রাম: মগড়া, ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল"
                      value={admForm.address}
                      onChange={e => setAdmForm({ ...admForm, address: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="adm-form-field">
                    <label>পূর্ববর্তী বিদ্যালয়ের নাম</label>
                    <input
                      type="text"
                      placeholder="পূর্বে যে বিদ্যালয়ে পড়ত"
                      value={admForm.previous_school}
                      onChange={e => setAdmForm({ ...admForm, previous_school: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-field">
                    <label>কোটা (যদি থাকে)</label>
                    <select value={admForm.quota} onChange={e => setAdmForm({ ...admForm, quota: e.target.value })}>
                      <option value="সাধারণ">সাধারণ</option>
                      <option value="মুক্তিযোদ্ধা">মুক্তিযোদ্ধা কোটা</option>
                      <option value="ক্ষুদ্র নৃগোষ্ঠী">ক্ষুদ্র নৃগোষ্ঠী</option>
                      <option value="বিশেষ চাহিদা সম্পন্ন">বিশেষ চাহিদা সম্পন্ন</option>
                    </select>
                  </div>
                  <div className="adm-form-field full" style={{ marginTop: '8px' }}>
                    <button type="submit" className="adm-submit-btn" disabled={admSubmitting}>
                      {admSubmitting ? 'আবেদন জমা হচ্ছে...' : '✓ অনলাইনে ভর্তি আবেদন জমা দিন'}
                    </button>
                  </div>
                </form>
              )}
              {admMsg && <p className="msg" style={{ marginTop: '10px', fontSize: '13px' }}>{admMsg}</p>}
            </div>
          )}

          {/* TAB 2: Required Documents Checklist */}
          {admTab === 'docs' && (
            <div className="adm-tab-content">
              <h4 style={{ margin: '0 0 12px 0', color: '#065f46', fontSize: '16px' }}>
                📑 ভর্তির সময় সাথে আনার প্রয়োজনীয় ৭টি আবশ্যক সনদ ও ডকুমেন্টস:
              </h4>
              <div className="doc-checklist">
                <div className="doc-item">
                  <div className="doc-num">১</div>
                  <div className="doc-info">
                    <h4>অনলাইন পূরণকৃত আবেদনপত্রের প্রিন্ট কপি</h4>
                    <p>অনলাইনে ফরম পূরণের পর প্রিন্টকৃত অথবা ডাউনলোডকৃত আবেদন কপি (১ সেট)।</p>
                    <span className="doc-tag">প্রিন্ট কপি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">২</div>
                  <div className="doc-info">
                    <h4>সদ্য তোলা পাসপোর্ট সাইজের রঙিন ছবি</h4>
                    <p>শিক্ষার্থীর ৪ কপি এবং পিতা ও মাতার ১ কপি করে স্পষ্ট রঙিন ছবি।</p>
                    <span className="doc-tag">ছবি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৩</div>
                  <div className="doc-info">
                    <h4>ডিজিটাল জন্ম নিবন্ধন সনদের সত্যায়িত ফটোকপি</h4>
                    <p>অনলাইন ভেরিফায়েড ১৭ ডিজিটের ডিজিটাল জন্ম নিবন্ধন সনদের মূল ও সত্যায়িত ফটোকপি।</p>
                    <span className="doc-tag">অনলাইন ভেরিফায়েড</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৪</div>
                  <div className="doc-info">
                    <h4>পূর্ববর্তী শ্রেণি পাশের মূল মার্কশিট ও প্রশংসাপত্র/TC</h4>
                    <p>পূর্ববর্তী বিদ্যালয়ের ছাড়পত্র (Transfer Certificate) ও একাডেমিক ট্রান্সক্রিপ্ট।</p>
                    <span className="doc-tag">মূল কপি ও ফটোকপি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৫</div>
                  <div className="doc-info">
                    <h4>পিতা ও মাতার জাতীয় পরিচয়পত্র (NID)-এর ফটোকপি</h4>
                    <p>পিতা ও মাতার জাতীয় পরিচয়পত্রের স্পষ্ট ফটোকপি (১ কপি করে)।</p>
                    <span className="doc-tag">NID ফটোকপি</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৬</div>
                  <div className="doc-info">
                    <h4>কোটা বা বিশেষ সুবিধা সংক্রান্ত সনদ (প্রযোজ্য ক্ষেত্রে)</h4>
                    <p>মুক্তিযোদ্ধা, ক্ষুদ্র নৃগোষ্ঠী, প্রতিবন্ধী বা অন্যান্য কোটার সমর্থনে প্রমাণপত্র।</p>
                    <span className="doc-tag">প্রযোজ্য ক্ষেত্রে</span>
                  </div>
                </div>
                <div className="doc-item">
                  <div className="doc-num">৭</div>
                  <div className="doc-info">
                    <h4>রক্তের গ্রুপ পরীক্ষার রিপোর্ট</h4>
                    <p>শিক্ষার্থীর রক্তের গ্রুপ নিশ্চিতকরণে অনুমোদিত ল্যাবের পরীক্ষার রিপোর্ট।</p>
                    <span className="doc-tag">মেডিকেল রিপোর্ট</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button type="button" className="adm-submit-btn" onClick={() => setAdmTab('apply')} style={{ maxWidth: '280px', margin: '0 auto' }}>
                  📝 এখনই আবেদন ফরম পূরণ করুন →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Rules & Eligibility */}
          {admTab === 'rules' && (
            <div className="adm-tab-content">
              <h4 style={{ margin: '0 0 12px 0', color: '#1e3a8a', fontSize: '16px' }}>
                📜 ২০২৬ শিক্ষাবর্ষের ভর্তি সংক্রান্ত নীতিমালা ও নির্দেশনা:
              </h4>
              <div className="rules-section" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <ul className="bullet-list">
                  <li><b>বয়সসীমা:</b> ৬ষ্ঠ শ্রেণিতে ভর্তির ক্ষেত্রে সরকারি নীতিমালা অনুযায়ী সর্বনিম্ন ১১+ বছর বয়স হতে হবে।</li>
                  <li><b>আবেদন মাধ্যম:</b> অনলাইনে ঘরে বসে অথবা বিদ্যালয়ের ডিজিটাল সেবা কেন্দ্র থেকে ফরম পূরণ করা যাবে।</li>
                  <li><b>ভর্তি নির্বাচন:</b> সরকারি নীতিমালা অনুযায়ী লটারি / একাডেমিক মূল্যায়নের মাধ্যমে চূড়ান্ত তালিকা প্রকাশ করা হবে।</li>
                  <li><b>মোবাইল নোটিফিকেশন:</b> ফলাফল ও ভর্তির তারিখ অভিভাবকের প্রদত্ত সচল মোবাইল নম্বরে SMS-এ জানানো হবে।</li>
                  <li><b>ভর্তি ফি:</b> সরকারি ও গভর্নিং বডি কর্তৃক নির্ধারিত সেশন চার্জ ও ফি পরিশোধ করে ভর্তি নিশ্চিত করতে হবে।</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Application Tracking & Receipt Reprint */}
          {admTab === 'tracking' && (
            <div className="adm-tab-content">
              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '16px' }}>
                🔍 আবেদন ট্র্যাকিং ও রসিদ পুনর্মুদ্রণ:
              </h4>
              <form onSubmit={handleTrackingSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="আবেদন নম্বর (ADM-2026-XXX) বা অভিভাবকের মোবাইল নম্বর দিন..."
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                />
                <button type="submit" className="adm-submit-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                  অনুসন্ধান করুন
                </button>
              </form>
              {trackingMsg && <p className="msg" style={{ color: '#dc2626' }}>{trackingMsg}</p>}
              {trackingResult && (
                <div className="admission-slip">
                  <span className="admission-slip-badge">✓ আবেদন বিদ্যমান</span>
                  <h3 className="admission-slip-title">{trackingResult.applicant_name_bn}</h3>
                  <div className="admission-app-no">আবেদন নং: {trackingResult.application_no}</div>
                  <p style={{ margin: '4px 0 10px', fontSize: '13px', color: '#475569' }}>
                    শ্রেণি: <b>{trackingResult.applied_class}</b> • শিক্ষাবর্ষ: <b>{trackingResult.academic_year}</b>
                  </p>
                  <div className="admission-slip-details">
                    <div><b>পিতা/অভিভাবক:</b> {trackingResult.guardian_name || trackingResult.father_name}</div>
                    <div><b>মোবাইল:</b> {trackingResult.guardian_phone}</div>
                    <div><b>জন্ম তারিখ:</b> {trackingResult.date_of_birth || '—'}</div>
                    <div><b>আবেদনের তারিখ:</b> {trackingResult.application_date}</div>
                    <div style={{ gridColumn: '1/-1' }}><b>ঠিকানা:</b> {trackingResult.address || '—'}</div>
                  </div>
                  <div className="admission-slip-actions">
                    <button type="button" className="adm-submit-btn" onClick={() => window.print()}>
                      🖨️ আবেদনপত্র ও রসিদ প্রিন্ট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 1. Leadership Speeches (President, Head Teacher, Assistant Head Teacher)
    if (menuKey.startsWith('public.nav.leadership') || title.includes('বাণী') || menuKey === 'public.nav.institution.message') {
      const leaderInfo = {
        'public.nav.leadership.president': {
          badge: '👑 সভাপতির বাণী',
          title: 'সভাপতির বাণী',
          name: 'নেয়ামুল হক খান',
          role: 'সভাপতি, ম্যানেজিং কমিটি',
          photo: PHOTO_PRESIDENT,
          speech: [
            'বিসমিল্লাহির রাহমানির রাহিম। ঐতিহ্যবাহী মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের সকল শিক্ষার্থী, অভিভাবক ও শুভানুধ্যায়ীদের প্রতি রইল আমার আন্তরিক শুভেচ্ছা ও অভিনন্দন।',
            '১৯৪৬ সালে প্রতিষ্ঠিত এই বিদ্যাপীঠ দীর্ঘ সময় ধরে অত্র এলাকার শিক্ষার আলো ছড়িয়ে আসছে। শিক্ষার গুণগত মান নিশ্চিতকরণ, ডিজিটাল অবকাঠামো উন্নয়ন এবং শিক্ষার্থীদের দেশপ্রেম ও নৈতিক শিক্ষায় উদ্বুদ্ধ করাই আমাদের পরিচালনা কমিটির মূল লক্ষ্য।',
            'বিদ্যালয়ের ধারাবাহিক সাফল্য ও সার্বিক অগ্রগতিতে শিক্ষক, অভিভাবক ও এলাকাবাসীর আন্তরিক সহযোগিতা কামনা করছি।'
          ]
        },
        'public.nav.leadership.head': {
          badge: '🎓 প্রধান শিক্ষকের বাণী',
          title: 'প্রধান শিক্ষকের বাণী',
          name: 'মুহাম্মদ শফিকুল ইসলাম',
          role: 'প্রধান শিক্ষক',
          photo: PHOTO_HEAD_TEACHER,
          speech: [
            'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের ডিজিটাল প্ল্যাটফর্মে সবাইকে স্বাগত জানাচ্ছি।',
            'একবিংশ শতাব্দীর চ্যালেঞ্জ মোকাবেলায় শিক্ষার্থীদের শুধুমাত্র পাঠ্যপুস্তকের জ্ঞানে সীমাবদ্ধ না রেখে প্রযুক্তিগত দক্ষতা, সততা, শৃঙ্খলা ও নেতৃত্বের গুণাবলি অর্জনে আমরা নিরলসভাবে কাজ করে যাচ্ছি।',
            'আমাদের অভিজ্ঞ শিক্ষকবৃন্দ প্রতিটি শিক্ষার্থীর সুপ্ত প্রতিভা বিকাশে সচেষ্ট। বিদ্যালয়টিকে একটি আদর্শ স্মার্ট শিক্ষা প্রতিষ্ঠানে রূপান্তরে আমরা প্রতিজ্ঞাবদ্ধ।'
          ]
        },
        'public.nav.leadership.asst_head': {
          badge: '👩‍🏫 সহকারী প্রধান শিক্ষকের বাণী',
          title: 'সহকারী প্রধান শিক্ষকের বাণী',
          name: 'তাপসী সরকার',
          role: 'সহকারী প্রধান শিক্ষক',
          photo: PHOTO_ASST_HEAD_TEACHER,
          speech: [
            'প্রিয় শিক্ষার্থীবৃন্দ ও সম্মানিত অভিভাবকবৃন্দ,',
            'একটি শিক্ষা প্রতিষ্ঠানের প্রাণ হলো এর সুশৃঙ্খল পরিবেশ ও শিক্ষার্থীদের নিয়মিত পড়াশোনার অভ্যাস। আমরা বিদ্যালয়ের একাডেমিক ক্যালেন্ডার, দৈনন্দিন শ্রেণি কার্যক্রম, উপস্থিতি এবং সহশিক্ষা কার্যক্রমের মান কঠোরভাবে বজায় রাখতে সচেষ্ট।',
            'শিক্ষার্থীদের নিয়মিত উপস্থিতি, শৃঙ্খলা ও মানসম্মত সহশিক্ষা কার্যক্রমের মাধ্যমে আদর্শ নাগরিক হিসেবে গড়ে তোলাই আমাদের অঙ্গীকার। সবার উজ্জ্বল ভবিষ্যৎ ও সার্বিক সাফল্য কামনা করি।'
          ]
        }
      };

      const selectedKey = menuKey in leaderInfo ? menuKey : (title.includes('সহকারী') ? 'public.nav.leadership.asst_head' : (title.includes('প্রধান শিক্ষক') ? 'public.nav.leadership.head' : (title.includes('সভাপতি') ? 'public.nav.leadership.president' : null)));

      if (selectedKey && leaderInfo[selectedKey]) {
        const leader = leaderInfo[selectedKey];
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">{leader.badge}</div>
            <div className="leader-modal-profile" style={{ display: 'flex', gap: '18px', alignItems: 'center', margin: '16px 0', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: '3px solid #2874c6' }}>
                <img src={leader.photo} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#1a202c', fontSize: '18px' }}>{leader.name}</h3>
                <p style={{ margin: '0 0 2px 0', color: '#1d4ed8', fontWeight: 700, fontSize: '14px' }}>{leader.role}</p>
                <small style={{ color: '#64748b', fontSize: '12px' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়, কালিহাতি, টাঙ্গাইল</small>
              </div>
            </div>
            <div className="leader-speech" style={{ lineHeight: '1.8', color: '#2d3748', fontSize: '15px' }}>
              {leader.speech.map((para, i) => (
                <p key={i} style={{ marginBottom: '12px' }}>{para}</p>
              ))}
            </div>
          </div>
        );
      }

      // Show all 3 messages together if general 'বাণী' menu clicked
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📜 সভাপতি, প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষকের বাণী</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {Object.values(leaderInfo).map((leader, idx) => (
              <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '2px solid #2874c6' }}>
                    <img src={leader.photo} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#1a202c', fontSize: '16px' }}>{leader.title}</h4>
                    <p style={{ margin: 0, color: '#1d4ed8', fontSize: '13px', fontWeight: 700 }}>{leader.name} — {leader.role}</p>
                  </div>
                </div>
                <div style={{ lineHeight: '1.7', color: '#2d3748', fontSize: '14px' }}>
                  {leader.speech.map((para, i) => (
                    <p key={i} style={{ marginBottom: '8px' }}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.about') {
      let liveSt = 0, liveTch = 0;
      try {
        const s = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
        const t = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
        const stf = JSON.parse(localStorage.getItem('magra_db_staff') || '[]');
        liveSt = s.length;
        liveTch = t.length + stf.length;
      } catch {}
      const toBn = n => String(n ?? 0).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🏛️ বিদ্যালয় পরিচিতি</div>
          <h3>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় (স্থাপিত: ১৯৪৬ খ্রি.)</h3>
          <p className="lead-text">
            টাঙ্গাইল জেলার কালিহাতি উপজেলার মগড়া ইউনিয়নে অবস্থিত একটি ঐতিহ্যবাহী ও সুপ্রাচীন বিদ্যাপীঠ।
            বিগত ৮ দশকেরও বেশি সময় ধরে প্রতিষ্ঠানটি স্থানীয় পর্যায়ে মানসম্মত শিক্ষা, শৃঙ্খলা, নৈতিকতা ও আধুনিক কারিগরি শিক্ষার আলো ছড়িয়ে আসছে।
          </p>
          <div className="info-stats-grid">
            <div className="info-stat-card"><b>১১৪২৯০</b><span>EIIN নম্বর</span></div>
            <div className="info-stat-card"><b>৪২০৬০৭১৩০২</b><span>MPO কোড</span></div>
            <div className="info-stat-card"><b>১৯৪৬</b><span>প্রতিষ্ঠার সন</span></div>
            <div className="info-stat-card"><b>৬ষ্ঠ–১০ম</b><span>শ্রেণি পাঠদান</span></div>
            <div className="info-stat-card"><b>{toBn(liveSt)} জন</b><span>বর্তমান শিক্ষার্থী</span></div>
            <div className="info-stat-card"><b>{toBn(liveTch)} জন</b><span>শিক্ষক ও কর্মচারী</span></div>
          </div>
          <h4>বিদ্যালয়ের লক্ষ্য ও উদ্দেশ্য</h4>
          <ul className="bullet-list">
            <li>আধুনিক বিজ্ঞান ও তথ্যপ্রযুক্তিভিত্তিক যুগোপযোগী শিক্ষা নিশ্চিত করা।</li>
            <li>শিক্ষার্থীদের নৈতিক মূল্যবোধ, শৃঙ্খলা, দেশপ্রেম ও নেতৃত্বগুণে বিকশিত করা।</li>
            <li>সহশিক্ষা কার্যক্রমের মাধ্যমে প্রতিটি শিক্ষার্থীর মেধা ও সৃজনশীলতার বিকাশ ঘটানো।</li>
          </ul>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.committee') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👥 পরিচালনা কমিটি (Managing Committee)</div>
          <p className="lead-text">বিদ্যালয়ের সার্বিক শিক্ষা, প্রশাসনিক ও ভৌত অবকাঠামোগত উন্নয়নের দায়িত্বে নিয়োজিত গভর্নিং বডি:</p>
          <div className="committee-grid">
            {MOCK_COMMITTEE.map((m, idx) => (
              <div key={idx} className="committee-card">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={m.role === 'সভাপতি' ? PHOTO_PRESIDENT : m.role === 'সদস্য সচিব' ? PHOTO_HEAD_TEACHER : PHOTO_MALE_TEACHER} alt={m.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="member-info">
                  <span className="member-role">{m.role}</span>
                  <h4>{m.name_bn}</h4>
                  <p>{m.designation}</p>
                  <small>মেয়াদকাল: {m.tenure}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.rules') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📜 বিদ্যালয়ের নিয়ম-কানুন ও আচরণবিধি</div>
          <div className="rules-section">
            <h4>বিদ্যালয়ের সাধারণ আচরণবিধি:</h4>
            <ul className="bullet-list">
              <li>সকল শিক্ষার্থীকে প্রতিদিন সকাল ৯:৪০ এর মধ্যে নির্ধারিত স্কুল ড্রেস পরিধান করে বিদ্যালয়ে উপস্থিত হতে হবে।</li>
              <li>বিদ্যালয় প্রাঙ্গণে কোনো ধরনের মোবাইল ফোন বা অপ্রয়োজনীয় ইলেকট্রনিক ডিভাইস ব্যবহার সম্পূর্ণ নিষিদ্ধ।</li>
              <li>শ্রেণিকক্ষে শিক্ষকের পাঠদানের সময় পূর্ণ মনোযোগ দিতে হবে এবং বিদ্যালয়ের শৃঙ্খলা বজায় রাখতে হবে।</li>
              <li>বিদ্যালয়ের আসবাবপত্র, কম্পিউটার ল্যাব, লাইব্রেরি ও বিজ্ঞানের যন্ত্রপাতি রক্ষণাবেক্ষণে সচেতন থাকতে হবে।</li>
              <li>অভিভাবকের অনুমতি ছাড়া কোনো শিক্ষার্থী ক্লাস চলাকালীন ক্যাম্পাস ত্যাগ করতে পারবে না।</li>
            </ul>
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.library') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📚 বিদ্যালয় লাইব্রেরি ও গ্রন্থসম্ভার</div>
          <p className="lead-text">বিদ্যালয়ের সমৃদ্ধ লাইব্রেরিতে পাঠ্যবই, রেফারেন্স বই, সাহিত্য, বিজ্ঞান ও মুক্তিযুদ্ধ বিষয়ক সহস্রাধিক গ্রন্থ রয়েছে:</p>
          <table className="modal-table">
            <thead>
              <tr>
                <th>বইয়ের নাম</th>
                <th>লেখক</th>
                <th>ক্যাটাগরি</th>
                <th>সংগ্রহ সংখ্যা</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BOOKS.map(b => (
                <tr key={b.id}>
                  <td><b>{b.title}</b></td>
                  <td>{b.author}</td>
                  <td><span className="badge">{b.category}</span></td>
                  <td>{b.copies} টি</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 2. Staff / Teachers submenus
    if (menuKey.startsWith('public.nav.staff')) {
      let liveTeachers = [];
      try {
        liveTeachers = JSON.parse(localStorage.getItem('magra_db_teachers') || '[]');
      } catch {}
      const rawList = liveTeachers.length ? liveTeachers : MOCK_TEACHERS;
      const listToDisplay = rawList.filter(t => {
        if (!t) return false;
        const isAct = t.status === 'active' || t.status === 'সক্রিয়' || !t.status;
        const desig = (t.designation || '').toLowerCase();
        const role = (t.role || t.public_contact_role || '').toLowerCase();
        const empId = (t.employee_id || '').toUpperCase();
        const isPresident = desig.includes('সভাপতি') || role.includes('president') || role === 'সভাপতি';
        const isStaff = empId.startsWith('STF') || desig.includes('অফিস সহকারী') || desig.includes('হিসাব সহকারী') || desig.includes('অফিস সহায়ক') || desig.includes('এমএলএসএস') || desig.includes('mlss') || role.includes('staff');
        return isAct && !isPresident && !isStaff;
      });

      listToDisplay.sort((a, b) => {
        const numA = parseInt(String(a.employee_id || a.id || '').replace(/\D/g, '')) || 0;
        const numB = parseInt(String(b.employee_id || b.id || '').replace(/\D/g, '')) || 0;
        if (numA && numB && numA !== numB) return numA - numB;
        return 0;
      });

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👨‍🏫 সম্মানিত শিক্ষকবৃন্দ ({listToDisplay.length} জন)</div>
          <p className="lead-text">বিদ্যালয়ের অভিজ্ঞ, দক্ষ ও দায়িত্বশীল শিক্ষকমণ্ডলী:</p>
          <div className="teachers-modal-grid">
            {listToDisplay.map((t, idx) => (
              <div key={t.id || idx} className="teacher-modal-card" style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '64px', height: '64px', minWidth: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #2874c6', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                  <img src={getTeacherPhoto(t)} alt={t.name_bn || t.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1e293b' }}>{t.name_bn || t.name_en}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#1d4ed8', fontWeight: 600 }}>{t.designation || 'সহকারী শিক্ষক'}{t.subject ? ` (${t.subject})` : ''}</p>
                  {t.phone && <small style={{ display: 'block', color: '#475569' }}>📱 {t.phone}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Students
    if (menuKey.startsWith('public.nav.students')) {
      let liveStudents = [];
      try {
        liveStudents = JSON.parse(localStorage.getItem('magra_db_students') || '[]');
      } catch {}

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👥 শিক্ষার্থী তালিকা ও পরিসংখ্যান</div>
          <div className="filter-bar-modal">
            <input
              placeholder="শিক্ষার্থীর নাম / Student ID / গ্রাম খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="all">সকল শ্রেণি</option>
              <option value="6">শ্রেণি ৬</option>
              <option value="7">শ্রেণি ৭</option>
              <option value="8">শ্রেণি ৮</option>
              <option value="9">শ্রেণি ৯</option>
              <option value="10">শ্রেণি ১০</option>
            </select>
          </div>
          <table className="modal-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>রোল</th>
                <th>নাম</th>
                <th>শ্রেণি</th>
                <th>পিতা / অভিভাবক</th>
                <th>গ্রাম</th>
              </tr>
            </thead>
            <tbody>
              {liveStudents
                .filter(s => filterClass === 'all' || String(s.class_name) === String(filterClass))
                .filter(s => {
                  if (!searchQuery) return true;
                  const haystack = [s.student_id, s.name_bn, s.name_en, s.roll_no, s.guardian_name, s.father_name, s.current_village, s.permanent_village].filter(Boolean).map(String).join(' ').toLowerCase();
                  return haystack.includes(searchQuery.toLowerCase());
                })
                .map(s => (
                  <tr key={s.id}>
                    <td><code>{s.student_id}</code></td>
                    <td><b>{s.roll_no || '—'}</b></td>
                    <td>{s.name_bn || s.name_en || '—'}</td>
                    <td>শ্রেণি {s.class_name || '—'} ({s.section || '—'})</td>
                    <td>{s.guardian_name || s.father_name || '—'}</td>
                    <td>{s.current_village || s.permanent_village || '—'}</td>
                  </tr>
                ))}
              {!liveStudents.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '18px', color: '#718096' }}>এখনো কোনো শিক্ষার্থী এন্ট্রি করা হয়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    // 4. Results
    if (menuKey.startsWith('public.nav.results')) {
      if (menuKey === 'public.nav.results.ssc') {
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">📈 বিগত বছরের SSC পরীক্ষার ফলাফল ও পরিসংখ্যান</div>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>শিক্ষাবর্ষ</th>
                  <th>পরীক্ষার্থী</th>
                  <th>উত্তীর্ণ</th>
                  <th>GPA 5 (A+)</th>
                  <th>পাশের হার</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SSC_RESULTS.map((r, i) => (
                  <tr key={i}>
                    <td><b>{r.year}</b></td>
                    <td>{r.candidates} জন</td>
                    <td>{r.passed} জন</td>
                    <td><b style={{ color: '#075c3a' }}>{r.gpa5} জন</b></td>
                    <td><span className="status-green">{r.pass_rate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📊 পরীক্ষার ফলাফল ও মূল্যায়ন</div>
          <p className="lead-text">বিদ্যালয়ের অভ্যন্তরীণ ও পাবলিক পরীক্ষার ফলাফল সংক্রান্ত তথ্যাদি নিয়মিত হালনাগাদ করা হয়।</p>
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="submenu-content">
        <div className="modal-hero-badge">ℹ️ {title}</div>
        <h3>{title}</h3>
        <p className="lead-text">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের {title} সম্পর্কিত তথ্য ও আপডেট।</p>
      </div>
    );
  };

  return (
    <div className="submenu-modal-overlay" onClick={onClose}>
      <div className="submenu-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>বন্ধ করুন</button>
        </div>
      </div>
    </div>
  );
}
