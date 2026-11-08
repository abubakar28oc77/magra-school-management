import React, { useState, useEffect } from 'react';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';
import { ESERVICE_MASTER_DIRECTORY } from './EServiceCenterModalSection';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

const ESERVICE_GRS_KEY = 'magra_eservice_grs_v2';
const ESERVICE_APPLICATIONS_KEY = 'magra_eservice_applications_v2';
const ESERVICE_CIRCULARS_KEY = 'magra_eservice_circulars_v2';

const DEFAULT_GRS_DATA = [
  {
    token: 'GRS-MAGRA-104921',
    complainantName: 'মুহাম্মদ হাবিবুর রহমান (অভিভাবক)',
    phone: '01712-345678',
    email: 'habib.parent@gmail.com',
    category: 'একাডেমিক সেবা',
    subject: '১০ম শ্রেণির নির্বাচনী পরীক্ষার পর অতিরিক্ত বিশেষ ক্লাসের ব্যবস্থা প্রসঙ্গে',
    details: 'আসন্ন এসএসসি পরীক্ষার্থীদের গণিত ও ইংরেজি বিষয়ে দুর্বলতা দূরীকরণে বিকেল ৪টা হতে ৫টা পর্যন্ত বিদ্যালয় প্রাঙ্গণে বিশেষ রিভিশন ক্লাসের ব্যবস্থা করার বিনীত অনুরোধ জানাচ্ছি।',
    status: 'নিষ্পত্তি (Resolved)',
    date: '২০২৬-০২-০২',
    adminResolution: 'অভিভাবকের আবেদন বিবেচনায় নিয়ে গণিত ও ইংরেজি বিষয়ের শিক্ষকদের সমন্বয়ে ৩ সপ্তাহের বিশেষ রিভিশন ক্লাস সূচি প্রস্তুত ও কার্যকর করা হয়েছে।'
  },
  {
    token: 'GRS-MAGRA-103845',
    complainantName: 'আহমেদ সাদিকুর রহমান',
    phone: '01819-876543',
    email: 'sadek.m@yahoo.com',
    category: 'প্রশাসনিক সেবা',
    subject: 'সোনালী সেবা অনলাইন চালান স্লিপ ভেরিফিকেশনে বিলম্ব সংক্রান্ত',
    details: 'ব্যাংকে সোনালী সেবার ফি জমার পর বিদ্যালয় ডাটাবেজে তাৎক্ষণিক রসিদ নম্বর আপডেট না হওয়ায় প্রশংসাপত্র উত্তোলনে সময়ক্ষেপণ হচ্ছে।',
    status: 'তদন্তাধীন (Under Review)',
    date: '২০২৬-০২-০৪',
    adminResolution: 'অফিস সহকারীকে প্রতিদিন সকাল ১১টা ও দুপুর ৩টায় সোনালী সেবা পোর্টাল লগইন করে চালান তালিকা রিফ্রেশ ও ভেরিফাই করার নির্দেশনা প্রদান করা হয়েছে।'
  }
];

const DEFAULT_APPLICATIONS_DATA = [
  {
    id: 'app-01',
    memoNo: 'মপা/সংশোধন/২০২৬-১৮৪',
    dateToday: '২০২৬-০১-২৫',
    studentNameBn: 'মোছাঃ সুমাইয়া আক্তার',
    studentNameEn: 'MOSAMMAT SUMAIYA AKTER',
    rollNo: '১০২',
    regNo: '১৯১৩৮৪০৫৯২',
    examYear: '২০২৬',
    targetCorrection: 'মাতার নামের বানান সংশোধন',
    existingValue: 'সুফিয়া খাতুন (SUFIA KHATUN)',
    proposedValue: 'সুফিয়া বেগম (SUFIA BEGUM)',
    fatherNameBn: 'মোঃ রফিকুল ইসলাম',
    motherNameBn: 'সুফিয়া বেগম',
    reason: 'অনলাইন জন্মসনদ ও জাতীয় পরিচয়পত্রের সাথে জেএসসি রেজিস্ট্রেশন কার্ডের তথ্যের গরমিল দূরীকরণ।',
    status: 'বোর্ডে দাখিলকৃত (Submitted to Board)',
    hearingDate: '২০২৬-০২-২৮'
  },
  {
    id: 'app-02',
    memoNo: 'মপা/সংশোধন/২০২৬-১৯১',
    dateToday: '২০২৬-০২-০১',
    studentNameBn: 'তানভীর হাসান মাহিম',
    studentNameEn: 'TANVIR HASAN MAHIM',
    rollNo: '১০৫',
    regNo: '২০১৪৭৯২২০১',
    examYear: '২০২৬',
    targetCorrection: 'জন্মতারিখ সংশোধন',
    existingValue: '১৫/০৪/২০০৯',
    proposedValue: '১৫/০৮/২০০৯',
    fatherNameBn: 'মোঃ মনোয়ার হোসেন',
    motherNameBn: 'রোকেয়া সুলতানা',
    reason: 'প্রাথমিক বিদ্যালয় ডাটা এন্ট্রির সময় ভুলবশত এপ্রিল লেখা হয়েছিল, অনলাইন জন্মনিবন্ধন সনদ অনুযায়ী প্রকৃত মাস আগস্ট।',
    status: 'সুপারিশপত্র ইস্যুকৃত (Certificate Issued)',
    hearingDate: 'প্রক্রিয়াধীন'
  }
];

const DEFAULT_CIRCULARS_DATA = [
  {
    id: 'circ-01',
    title: '২০২৬ শিক্ষাবর্ষে ৯ম শ্রেণির eSIF অনলাইন রেজিস্ট্রেশন সময়সীমা ও ফি নির্ধারণ সংক্রান্ত',
    authority: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    deadline: '২৮ ফেব্রুয়ারি ২০২৬',
    status: 'চলমান',
    actionUrl: 'https://dhakaeducationboard.gov.bd/'
  },
  {
    id: 'circ-02',
    title: 'এসএসসি পরীক্ষা ২০২৬ এর পরীক্ষার্থীদের চূড়ান্ত eFF ফরম ফিলাপ ও সোনালী সেবা চালান জমাদান',
    authority: 'পরীক্ষা নিয়ন্ত্রণ শাখা, ঢাকা শিক্ষা বোর্ড',
    deadline: '১৫ ফেব্রুয়ারি ২০২৬',
    status: 'জরুরি',
    actionUrl: 'https://dhakaeducationboard.gov.bd/'
  },
  {
    id: 'circ-03',
    title: 'মাউশি EMIS এ কর্মরত সকল শিক্ষক-কর্মচারীর eTIF ও পিডিএস (PDS) ত্রৈমাসিক হালনাগাদ',
    authority: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (DSHE)',
    deadline: '১০ মার্চ ২০২৬',
    status: 'বিজ্ঞপ্তি',
    actionUrl: 'https://emis.gov.bd/'
  }
];

export function EServiceCenterAdminPanel({ sub, setSub }) {
  const [activeTab, setActiveTab] = useState(sub || 'all');
  const [toastMsg, setToastMsg] = useState('');

  // GRS Data
  const [grsList, setGrsList] = useState(() => {
    try {
      const stored = localStorage.getItem(ESERVICE_GRS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_GRS_DATA;
  });

  // Correction Applications Data
  const [applicationsList, setApplicationsList] = useState(() => {
    try {
      const stored = localStorage.getItem(ESERVICE_APPLICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_APPLICATIONS_DATA;
  });

  // Circulars Data
  const [circularsList, setCircularsList] = useState(() => {
    try {
      const stored = localStorage.getItem(ESERVICE_CIRCULARS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CIRCULARS_DATA;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [grsStatusFilter, setGrsStatusFilter] = useState('all');

  // Modal State for New/Edit GRS or Resolution
  const [selectedGrsModal, setSelectedGrsModal] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [statusInput, setStatusInput] = useState('');

  // Modal State for New Correction Application
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    studentNameBn: '',
    studentNameEn: '',
    rollNo: '',
    regNo: '',
    examYear: '২০২৬',
    targetCorrection: 'নিজের নামের বানান সংশোধন',
    existingValue: '',
    proposedValue: '',
    fatherNameBn: '',
    motherNameBn: '',
    reason: '',
    status: 'সুপারিশপত্র ইস্যুকৃত (Certificate Issued)',
    hearingDate: 'প্রক্রিয়াধীন'
  });

  useEffect(() => {
    if (sub && sub !== activeTab) {
      setActiveTab(sub);
    }
  }, [sub]);

  const handleTabChange = key => {
    setActiveTab(key);
    if (setSub) setSub(key);
  };

  const showToast = msg => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Save GRS Data
  const saveGrs = updated => {
    setGrsList(updated);
    try {
      localStorage.setItem(ESERVICE_GRS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Save Applications Data
  const saveApplications = updated => {
    setApplicationsList(updated);
    try {
      localStorage.setItem(ESERVICE_APPLICATIONS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Save Circulars Data
  const saveCirculars = updated => {
    setCircularsList(updated);
    try {
      localStorage.setItem(ESERVICE_CIRCULARS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Update GRS Complaint Resolution
  const handleSaveResolution = () => {
    if (!selectedGrsModal) return;
    const updated = grsList.map(item => {
      if (item.token === selectedGrsModal.token) {
        return {
          ...item,
          status: statusInput || item.status,
          adminResolution: resolutionInput
        };
      }
      return item;
    });
    saveGrs(updated);
    setSelectedGrsModal(null);
    showToast('✓ অভিযোগের নিষ্পত্তিমূলক সিদ্ধান্ত ও স্ট্যাটাস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // Delete GRS Record
  const handleDeleteGrs = token => {
    if (!confirm('আপনি কি এই অভিযোগের রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = grsList.filter(x => x.token !== token);
    saveGrs(updated);
    showToast('✓ অভিযোগটি তালিকা হতে অপসারিত হয়েছে।');
  };

  // Add New Correction Application
  const handleAddNewApplication = e => {
    e.preventDefault();
    if (!newAppForm.studentNameBn.trim() || !newAppForm.proposedValue.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম ও সঠিক তথ্য পূরণ করুন!');
      return;
    }
    const memoNo = `মপা/সংশোধন/${new Date().getFullYear()}-${toBn(Math.floor(200 + Math.random() * 800))}`;
    const newEntry = {
      id: `app-${Date.now()}`,
      memoNo,
      dateToday: new Date().toISOString().slice(0, 10),
      ...newAppForm
    };
    const updated = [newEntry, ...applicationsList];
    saveApplications(updated);
    setIsNewAppModalOpen(false);
    showToast(`✓ সংশোধন আবেদন সফলভাবে অন্তর্ভুক্ত হয়েছে! স্মারক নং: ${memoNo}`);
  };

  // Delete Correction Application
  const handleDeleteApp = id => {
    if (!confirm('আপনি কি এই সংশোধন আবেদন রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = applicationsList.filter(x => x.id !== id);
    saveApplications(updated);
    showToast('✓ আবেদন রেকর্ড অপসারিত হয়েছে।');
  };

  // Print Official Recommendation Letter
  const handlePrintPad = item => {
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('প্রিন্ট পপ-আপ ব্লক করা আছে, ব্রাউজারে পপ-আপ অনুমতি দিন!');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সংশোধন সুপারিশ প্রত্যয়নপত্র — ${item.studentNameBn}</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Nikosh', sans-serif; color: #0f172a; margin: 0; padding: 15px; }
          .pad-container { border: 2px solid #047857; padding: 25px 35px; border-radius: 8px; position: relative; }
          .memo-date-bar { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding: 8px 0; margin-top: 15px; font-size: 13.5px; font-weight: bold; }
          .cert-title { text-align: center; margin: 25px 0 20px; }
          .cert-title span { background: #047857; color: #fff; padding: 6px 30px; font-size: 17px; font-weight: 900; border-radius: 4px; display: inline-block; }
          .cert-subject { font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 20px; line-height: 1.6; border-left: 4px solid #047857; padding-left: 10px; }
          .cert-body { font-size: 14.5px; line-height: 2.1; color: #1e293b; text-align: justify; margin-bottom: 30px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 15px 0 25px; font-size: 13.5px; }
          .info-table th, .info-table td { border: 1px solid #cbd5e1; padding: 8px 12px; }
          .info-table th { background: #f1f5f9; text-align: left; width: 35%; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
          .signature-box { text-align: center; min-width: 200px; }
          .signature-line { border-top: 1.5px dashed #0f172a; margin-bottom: 6px; }
          .seal-box { border: 1.5px dashed #047857; color: #047857; padding: 10px 18px; font-size: 11px; font-weight: bold; border-radius: 50%; transform: rotate(-8deg); display: inline-block; }
          .pad-footer { border-top: 1px solid #cbd5e1; margin-top: 25px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="pad-container">
          ${SCHOOL_PAD_HEADER_HTML}

          <div class="memo-date-bar">
            <div>স্মারক নং: <b>${item.memoNo}</b></div>
            <div>তারিখ: <b>${item.dateToday} খ্রি.</b></div>
          </div>

          <div class="cert-title">
            <span>বোর্ড সনদ/নথিপত্র সংশোধন সুপারিশ প্রত্যয়নপত্র</span>
          </div>

          <div class="cert-subject">
            বিষয়: ঢাকা শিক্ষা বোর্ডের নথিতে ${item.targetCorrection} প্রসঙ্গে প্রাতিষ্ঠানিক সুপারিশপত্র।
          </div>

          <div class="cert-body">
            বরাবর,<br>
            সচিব / চেয়ারম্যান মহোদয়,<br>
            মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা।<br><br>

            মহোদয়,<br>
            বিনীত নিবেদন এই যে, অত্র বিদ্যালয়ের নিয়মিত/প্রাক্তন শিক্ষার্থী <b>${item.studentNameBn}</b> (${item.studentNameEn ? `ইংরেজি: ${item.studentNameEn}` : ''}), পিতা: <b>${item.fatherNameBn || '—'}</b>, মাতা: <b>${item.motherNameBn || '—'}</b>, রেজিস্ট্রেশন নং: <b>${toBn(item.regNo || '—')}</b>, বোর্ড নথিপত্রে ${item.targetCorrection}-এর জন্য আবেদন দাখিল করেছে।
            <br><br>
            বিদ্যালয়ের মূল ভর্তি রেজিস্টার, টিসি ভলিউম এবং অনলাইন জন্মনিবন্ধন সনদ যাচাই করে নিম্নরূপ তথ্য পাওয়া গেছে:
          </div>

          <table class="info-table">
            <tr>
              <th>সংশোধনের বিষয়:</th>
              <td><b>${item.targetCorrection}</b></td>
            </tr>
            <tr>
              <th>বোর্ডে বর্তমানে বিদ্যমান (ভুল) তথ্য:</th>
              <td style="color: #dc2626;"><b>${item.existingValue || '—'}</b></td>
            </tr>
            <tr>
              <th>আবেদনকৃত প্রকৃত (সঠিক) তথ্য:</th>
              <td style="color: #047857;"><b>${item.proposedValue || '—'}</b></td>
            </tr>
            <tr>
              <th>ভুল হওয়ার কারণ ও মন্তব্য:</th>
              <td>${item.reason || 'প্রাথমিক ডাটা এন্ট্রিকালীন অনবধানতাবশত অনিচ্ছাকৃত মুদ্রণজনিত ভুল।'}</td>
            </tr>
          </table>

          <div class="cert-body">
            অতএব, শিক্ষার্থীর দাখিলকৃত অনলাইন জন্মসনদ, পিতা-মাতার এনআইডি ও এফিডেভিট পর্যালোচনাপূর্বক উল্লেখিত তথ্য সংশোধনের জন্য মহোদয়ের সদয় বিবেচনা ও প্রয়োজনীয় নির্দেশ প্রদানের জন্য বিশেষভাবে সুপারিশ করা হলো।
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="seal-box">
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়<br>
                স্থাপিত: ১৯৪৬ খ্রি.<br>
                কালিহাতী, টাঙ্গাইল
              </div>
            </div>

            <div class="signature-box">
              <div class="signature-line"></div>
              <div style="font-size: 14.5px; font-weight: 800;">(মুহাম্মদ শফিকুল ইসলাম)</div>
              <div style="font-size: 12.5px; color: #475569;">প্রধান শিক্ষক</div>
              <div style="font-size: 12px; color: #64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
              <div style="font-size: 11px; color: #047857;">কালিহাতী, টাঙ্গাইল • EIIN: 114290</div>
            </div>
          </div>

          <div class="pad-footer">
            <div>সংযুক্তি: ১. অনলাইন জন্মসনদ ২. পিতা-মাতার এনআইডি ৩. কোর্ট এফিডেভিট ৪. পত্রিকা কাটিং।</div>
            <div>স্মার্ট স্কুল ম্যানেজমেন্ট সিস্টেম ও ই-সেবা কেন্দ্র</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Filter GRS Complaints
  const filteredGrs = grsList.filter(item => {
    if (grsStatusFilter !== 'all') {
      if (grsStatusFilter === 'pending' && !item.status.includes('Review') && !item.status.includes('তদন্তাধীন')) return false;
      if (grsStatusFilter === 'resolved' && !item.status.includes('Resolved') && !item.status.includes('নিষ্পত্তি')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = item.subject?.toLowerCase().includes(q);
      const matchName = item.complainantName?.toLowerCase().includes(q);
      const matchToken = item.token?.toLowerCase().includes(q);
      return matchSub || matchName || matchToken;
    }
    return true;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', color: '#1e293b' }}>
      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            background: '#047857',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= PANEL HEADER ================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          color: '#ffffff',
          padding: '24px',
          borderRadius: '14px',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(6,78,59,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '32px' }}>🌐</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>
                ই-সেবা কেন্দ্র ও সরকারি পোর্টাল প্রশাসন
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', opacity: 0.9 }}>
                eSIF, eFF, eTIF, নাম ও বয়স সংশোধন, অভিযোগ প্রতিকার (GRS), ই-ফাইলিং ও সোনালী সেবা কেন্দ্রীয় কন্ট্রোল
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="https://dhakaeducationboard.gov.bd/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏛️ ঢাকা শিক্ষা বোর্ড</span>
            <span>➔</span>
          </a>
          <a
            href="https://emis.gov.bd/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>👨‍🏫 মাউশি EMIS</span>
            <span>➔</span>
          </a>
          <a
            href="https://grs.gov.bd/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚖️ সরকারি GRS</span>
            <span>➔</span>
          </a>
        </div>
      </div>

      {/* ================= SUB-NAVIGATION TABS ================= */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '12px',
          marginBottom: '20px',
          overflowX: 'auto'
        }}
      >
        {[
          { key: 'all', label: '🌐 সকল ই-সেবা পোর্টাল ও অ্যাকশন', count: ESERVICE_MASTER_DIRECTORY.length },
          { key: 'grs', label: '⚖️ অভিযোগ প্রতিকার (GRS) ইনবক্স', count: grsList.length },
          { key: 'correction', label: '📝 নাম ও বয়স সংশোধন রেজিস্টার', count: applicationsList.length },
          { key: 'esif_eff', label: '🎓 eSIF ও eFF বোর্ড হাব', count: 4 },
          { key: 'circulars', label: '📢 সরকারি সার্কুলার ও ডেডলাইন', count: circularsList.length }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 800 : 600,
              fontSize: '13.5px',
              background: activeTab === tab.key ? '#047857' : '#f1f5f9',
              color: activeTab === tab.key ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '12px',
                background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#cbd5e1',
                color: activeTab === tab.key ? '#ffffff' : '#334155'
              }}
            >
              {toBn(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: ALL E-SERVICES DIRECTORY ================= */}
      {activeTab === 'all' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {ESERVICE_MASTER_DIRECTORY.map(srv => (
              <div
                key={srv.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ fontSize: '28px' }}>{srv.icon}</div>
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      {srv.badge}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {srv.title}
                  </h3>

                  <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                    {srv.shortDesc}
                  </p>

                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    <div>🏛️ <b>কর্তৃপক্ষ:</b> {srv.authority}</div>
                    <div style={{ marginTop: '2px' }}>💰 <b>ফি:</b> <span style={{ color: '#047857', fontWeight: 700 }}>{srv.fee}</span></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                  <a
                    href={srv.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      background: '#047857',
                      color: '#ffffff',
                      textDecoration: 'none',
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>সরকারি পোর্টালে যান</span>
                    <span>➔</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GRS COMPLAINT INBOX ================= */}
      {activeTab === 'grs' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 টোকেন, নাম বা বিষয় দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  minWidth: '240px'
                }}
              />
              <select
                value={grsStatusFilter}
                onChange={e => setGrsStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px'
                }}
              >
                <option value="all">সকল অবস্থা (All Status)</option>
                <option value="pending">তদন্তাধীন / পেন্ডিং</option>
                <option value="resolved">নিষ্পত্তিকৃত (Resolved)</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b' }}>
              মোট অভিযোগ সংখ্যা: <b>{toBn(filteredGrs.length)}</b> টি
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>টোকেন নং ও তারিখ</th>
                  <th style={{ padding: '10px 12px' }}>অভিযোগকারী ও যোগাযোগ</th>
                  <th style={{ padding: '10px 12px' }}>ক্যাটাগরি ও বিষয়</th>
                  <th style={{ padding: '10px 12px' }}>বর্তমান অবস্থা</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      কোনো অভিযোগের রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredGrs.map(c => {
                    const isResolved = c.status?.includes('Resolved') || c.status?.includes('নিষ্পত্তি');
                    return (
                      <tr key={c.token} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 800, color: '#047857' }}>{c.token}</span>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>📅 {toBn(c.date)}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700 }}>{c.isAnonymous ? '🕶️ বেনামী আবেদনকারী' : c.complainantName}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>📞 {c.phone || '—'}</div>
                        </td>
                        <td style={{ padding: '12px', maxWidth: '320px' }}>
                          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {c.category}
                          </span>
                          <div style={{ fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>{c.subject}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {c.details}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              background: isResolved ? '#dcfce7' : '#fef3c7',
                              color: isResolved ? '#15803d' : '#b45309'
                            }}
                          >
                            {isResolved ? '✓ নিষ্পত্তি' : '⏳ তদন্তাধীন'}
                          </span>
                          {c.adminResolution && (
                            <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px' }}>
                              📝 সিদ্ধান্ত অন্তর্ভুক্ত আছে
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGrsModal(c);
                                setResolutionInput(c.adminResolution || '');
                                setStatusInput(c.status || 'নিষ্পত্তি (Resolved)');
                              }}
                              style={{
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🔍 তদন্ত ও নিষ্পত্তি
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGrs(c.token)}
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="মুছে ফেলুন"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: NAME & AGE CORRECTION REGISTER ================= */}
      {activeTab === 'correction' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                বোর্ড নাম ও বয়স সংশোধন সুপারিশ রেজিস্টার
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                ঢাকা শিক্ষা বোর্ডে দাখিলকৃত ও প্রধান শিক্ষক স্বাক্ষরিত প্রত্যয়নপত্রের তালিকা
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewAppModalOpen(true)}
              style={{
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>+ নতুন সংশোধন আবেদন নথিভুক্ত করুন</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>স্মারক ও তারিখ</th>
                  <th style={{ padding: '10px 12px' }}>শিক্ষার্থীর নাম ও রোল</th>
                  <th style={{ padding: '10px 12px' }}>সংশোধনের বিষয়</th>
                  <th style={{ padding: '10px 12px' }}>বিদ্যমান (ভুল) ➔ প্রস্তাবিত (সঠিক)</th>
                  <th style={{ padding: '10px 12px' }}>বর্তমান অবস্থা ও শুনানী</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {applicationsList.map(app => (
                  <tr key={app.id || app.memoNo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#047857' }}>{app.memoNo}</span>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>📅 {toBn(app.dateToday)}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.studentNameBn}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        রোল: {toBn(app.rollNo)} • রেজি: {toBn(app.regNo)}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>
                        {app.targetCorrection}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#dc2626', textDecoration: 'line-through' }}>
                        {app.existingValue}
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                        ➔ {app.proposedValue}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{app.status}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        শুনানী: {toBn(app.hearingDate)}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handlePrintPad(app)}
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>🖨️ প্যাডে প্রিন্ট</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApp(app.id)}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          title="মুছে ফেলুন"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: eSIF ও eFF হাব ================= */}
      {activeTab === 'esif_eff' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Card 1: eSIF Class Six */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '26px' }}>📝</span>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>eSIF - Class Six (৬ষ্ঠ শ্রেণি)</h4>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
              ৬ষ্ঠ শ্রেণির শিক্ষার্থীদের অনলাইন জন্মসনদ (১৭ ডিজিট) দিয়ে ঢাকা বোর্ডে প্রাথমিক এন্ট্রি।
            </p>
            <ul style={{ margin: '0 0 14px 0', paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: '1.7' }}>
              <li>EIIN: <b>114290</b></li>
              <li>পিতা ও মাতার এনআইডি বাধ্যতামূলক</li>
              <li>ছাড়পত্র (TC) এন্ট্রি চেক নিশ্চিতকরণ</li>
            </ul>
            <a
              href="https://dhakaeducationboard.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#047857',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>ঢাকা বোর্ড eSIF পোর্টালে যান</span>
              <span>➔</span>
            </a>
          </div>

          {/* Card 2: eSIF Class Eight */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '26px' }}>📋</span>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>eSIF - Class Eight (৮ম শ্রেণি)</h4>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
              ৮ম শ্রেণির শিক্ষার্থীদের বিষয় কোড ও রেজিস্ট্রেশন তথ্য হালনাগাদ।
            </p>
            <ul style={{ margin: '0 0 14px 0', paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: '1.7' }}>
              <li>৬ষ্ঠ ও ৭ম শ্রেণির ধারাবাহিক রেজিস্ট্রেশন ম্যাপিং</li>
              <li>ছবি ও স্বাক্ষর বোর্ড রেজোলিউশন টেস্ট</li>
            </ul>
            <a
              href="https://dhakaeducationboard.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#047857',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>ঢাকা বোর্ড eSIF পোর্টালে যান</span>
              <span>➔</span>
            </a>
          </div>

          {/* Card 3: eSIF Class Nine */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '26px' }}>🎓</span>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>eSIF - Class Nine (৯ম শ্রেণি এসএসসি)</h4>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
              মাধ্যমিক সার্টিফিকেট পরীক্ষার মূল রেজিস্ট্রেশন, গ্রুপ (বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা) ও ৪র্থ বিষয় নির্বাচন।
            </p>
            <ul style={{ margin: '0 0 14px 0', paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: '1.7' }}>
              <li>সোনালী সেবা অনলাইন পেমেন্ট স্লিপ সংগ্রহ</li>
              <li>রেজিস্ট্রেশন কার্ড খসড়া তালিকা (Draft List) প্রুফরিডিং</li>
            </ul>
            <a
              href="https://dhakaeducationboard.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#047857',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>ঢাকা বোর্ড eSIF পোর্টালে যান</span>
              <span>➔</span>
            </a>
          </div>

          {/* Card 4: Form Fillup (eFF) */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '26px' }}>✍️</span>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Form Fillup (eFF) - এসএসসি ফরম ফিলাপ</h4>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
              ১০ম শ্রেণির নির্বাচনী পরীক্ষায় উত্তীর্ণ শিক্ষার্থীদের এসএসসি পরীক্ষার চূড়ান্ত ফরম ফিলাপ ও ফি অনুমোদন।
            </p>
            <ul style={{ margin: '0 0 14px 0', paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: '1.7' }}>
              <li>সম্ভাব্য তালিকা (Probable List) ডাউনলোড ও ভেরিফিকেশন</li>
              <li>সোনালী সেবায় ফি জমাদানের চালান সংরক্ষণ</li>
            </ul>
            <a
              href="https://dhakaeducationboard.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#047857',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>ঢাকা বোর্ড eFF পোর্টালে যান</span>
              <span>➔</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CIRCULARS & DEADLINES ================= */}
      {activeTab === 'circulars' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                সরকারি সার্কুলার ও ই-সেবা সময়সূচি
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                শিক্ষা বোর্ড ও মাউশি হতে জারিকৃত সর্বশেষ আদেশ ও আবেদনের শেষ তারিখ
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {circularsList.map(circ => (
              <div
                key={circ.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: circ.status === 'জরুরি' ? '#fee2e2' : '#e0f2fe',
                        color: circ.status === 'জরুরি' ? '#dc2626' : '#0369a1',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {circ.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>🏛️ {circ.authority}</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                    {circ.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px', fontWeight: 700 }}>
                    ⏰ আবেদনের শেষ তারিখ: {toBn(circ.deadline)}
                  </div>
                </div>

                <a
                  href={circ.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>অনলাইন নির্দেশিকা ও পোর্টাল</span>
                  <span>➔</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: GRS RESOLUTION MODAL ================= */}
      {selectedGrsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                ⚖️ অভিযোগ তদন্ত ও নিষ্পত্তি নোট
              </h3>
              <button
                type="button"
                onClick={() => setSelectedGrsModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12.5px', lineHeight: '1.6' }}>
              <div><b>টোকেন নং:</b> <span style={{ color: '#047857', fontWeight: 800 }}>{selectedGrsModal.token}</span></div>
              <div><b>আবেদনকারী:</b> {selectedGrsModal.complainantName} (📞 {selectedGrsModal.phone})</div>
              <div><b>বিষয়:</b> {selectedGrsModal.subject}</div>
              <div style={{ marginTop: '4px', color: '#475569' }}><b>অভিযোগের বিবরণ:</b> {selectedGrsModal.details}</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                বর্তমান অবস্থা নির্বাচন করুন:
              </label>
              <select
                value={statusInput}
                onChange={e => setStatusInput(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="তদন্তাধীন (Under Review)">⏳ তদন্তাধীন (Under Review)</option>
                <option value="নিষ্পত্তি (Resolved)">✓ নিষ্পত্তি (Resolved)</option>
                <option value="বাতিল (Rejected)">✕ বাতিল / ভিত্তিহীন (Rejected)</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                প্রশাসনিক তদন্ত প্রতিবেদন / নিষ্পত্তিমূলক সিদ্ধান্ত:
              </label>
              <textarea
                rows={4}
                value={resolutionInput}
                onChange={e => setResolutionInput(e.target.value)}
                placeholder="অভিযোগের বিষয়ে বিদ্যালয় কর্তৃপক্ষের গৃহীত পদক্ষেপ ও সিদ্ধান্ত এখানে লিপিবদ্ধ করুন..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedGrsModal(null)}
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveResolution}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW CORRECTION APPLICATION ================= */}
      {isNewAppModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                📝 নতুন নাম ও বয়স সংশোধন আবেদন নথিভুক্তকরণ
              </h3>
              <button
                type="button"
                onClick={() => setIsNewAppModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewApplication} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিক্ষার্থীর নাম (বাংলা): *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ সাকিব আল হাসান"
                  value={newAppForm.studentNameBn}
                  onChange={e => setNewAppForm({ ...newAppForm, studentNameBn: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>শিক্ষার্থীর নাম (ইংরেজি Capital Letters):</label>
                <input
                  type="text"
                  placeholder="যেমন: MD. SAKIB AL HASAN"
                  value={newAppForm.studentNameEn}
                  onChange={e => setNewAppForm({ ...newAppForm, studentNameEn: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রোল নম্বর:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ১০১"
                    value={newAppForm.rollNo}
                    onChange={e => setNewAppForm({ ...newAppForm, rollNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>রেজিস্ট্রেশন নম্বর:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ১৯১৩৮৪০৫৯২"
                    value={newAppForm.regNo}
                    onChange={e => setNewAppForm({ ...newAppForm, regNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>পিতার নাম:</label>
                  <input
                    type="text"
                    placeholder="পিতার নাম"
                    value={newAppForm.fatherNameBn}
                    onChange={e => setNewAppForm({ ...newAppForm, fatherNameBn: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>মাতার নাম:</label>
                  <input
                    type="text"
                    placeholder="মাতার নাম"
                    value={newAppForm.motherNameBn}
                    onChange={e => setNewAppForm({ ...newAppForm, motherNameBn: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>সংশোধনের বিষয়: *</label>
                <select
                  value={newAppForm.targetCorrection}
                  onChange={e => setNewAppForm({ ...newAppForm, targetCorrection: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="নিজের নামের বানান সংশোধন">নিজের নামের বানান সংশোধন</option>
                  <option value="পিতার নামের বানান সংশোধন">পিতার নামের বানান সংশোধন</option>
                  <option value="মাতার নামের বানান সংশোধন">মাতার নামের বানান সংশোধন</option>
                  <option value="জন্মতারিখ সংশোধন">জন্মতারিখ সংশোধন</option>
                  <option value="ধর্ম বা অভিভাবকের নাম সংশোধন">ধর্ম বা অভিভাবকের নাম সংশোধন</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#dc2626' }}>বর্তমানে বিদ্যমান (ভুল) তথ্য:</label>
                  <input
                    type="text"
                    placeholder="ভুল তথ্য"
                    value={newAppForm.existingValue}
                    onChange={e => setNewAppForm({ ...newAppForm, existingValue: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#047857' }}>প্রকৃত প্রস্তাবিত (সঠিক) তথ্য: *</label>
                  <input
                    type="text"
                    required
                    placeholder="সঠিক তথ্য"
                    value={newAppForm.proposedValue}
                    onChange={e => setNewAppForm({ ...newAppForm, proposedValue: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ভুল হওয়ার কারণ ও মন্তব্য:</label>
                <input
                  type="text"
                  placeholder="যেমন: অনলাইন জন্মসনদের সাথে অমিল"
                  value={newAppForm.reason}
                  onChange={e => setNewAppForm({ ...newAppForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewAppModalOpen(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EServiceCenterAdminPanel;