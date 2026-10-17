import React, { useState } from 'react';
import { MOCK_SCHOOL } from './mockData.js';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

const DEFAULT_STUDENT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 115'%3E%3Cdefs%3E%3ClinearGradient id='bgA' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23e0f2fe'/%3E%3Cstop offset='100%25' stop-color='%23bae6fd'/%3E%3C/linearGradient%3E%3ClinearGradient id='skinA' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fed7aa'/%3E%3Cstop offset='100%25' stop-color='%23fba96b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='115' fill='url(%23bgA)'/%3E%3Ccircle cx='50' cy='42' r='24' fill='url(%23skinA)'/%3E%3Cpath d='M26 36 C26 14 74 14 74 36 C74 18 64 8 50 8 C36 8 26 18 26 36 Z' fill='%231e293b'/%3E%3Ccircle cx='42' cy='40' r='2.5' fill='%230f172a'/%3E%3Ccircle cx='58' cy='40' r='2.5' fill='%230f172a'/%3E%3Cpath d='M44 52 Q50 57 56 52' stroke='%23b45309' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3Cpath d='M14 115 C14 82 28 72 50 72 C72 72 86 82 86 115 Z' fill='%230369a1'/%3E%3Cpath d='M40 72 L50 96 L60 72 Z' fill='%23ffffff'/%3E%3Cpolygon points='50,78 45,83 55,83' fill='%230284c7'/%3E%3C/svg%3E";

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  onEditStudent,
  onOpenIdCard,
  onOpenCertificate
}) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'family', 'address', 'academic'

  if (!isOpen || !student) return null;

  const school = MOCK_SCHOOL;
  const photo = student.photo_url || DEFAULT_STUDENT_AVATAR;

  const getDepartmentLabel = (s) => {
    const g = [s?.department, s?.group_name, s?.group, s?.section, s?.student_id]
      .filter(Boolean).map(x => String(x).toLowerCase()).join(' ');
    if (g.includes('বিজ্ঞান') || g.includes('science') || g.includes('sci')) return 'বিজ্ঞান বিভাগ (Science)';
    if (g.includes('মানবিক') || g.includes('humanities') || g.includes('hum') || g.includes('arts')) return 'মানবিক বিভাগ (Humanities)';
    if (g.includes('ব্যবসা') || g.includes('বাণিজ্য') || g.includes('business') || g.includes('commerce')) return 'ব্যবসায় শিক্ষা (Commerce)';
    return s?.department || s?.group_name || 'সাধারণ';
  };

  const calculateAge = (dob) => {
    if (!dob) return '—';
    try {
      const birth = new Date(dob);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) { years--; months += 12; }
      return `${toBengaliDigits(years)} বছর ${toBengaliDigits(months)} মাস`;
    } catch {
      return '—';
    }
  };

  const handlePrintDossier = () => {
    const w = window.open('', '_blank', 'width=950,height=850');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শিক্ষার্থী তথ্য বিবরণী (Bio-data) - ${student.name_bn || student.student_id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&family=Outfit:wght@400;600;700&display=swap');
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            color: #0f172a;
            padding: 30px;
            margin: 0;
            background: #fff;
          }
          .dossier-card {
            border: 2px solid #047857;
            padding: 24px;
            border-radius: 8px;
            max-width: 850px;
            margin: auto;
          }
          .dossier-header {
            text-align: center;
            border-bottom: 2px solid #047857;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .dossier-header h1 { margin: 0; font-size: 22px; color: #065f46; }
          .dossier-header h2 { margin: 4px 0 0; font-size: 14px; color: #b45309; }
          .dossier-header p { margin: 4px 0 0; font-size: 11px; color: #64748b; }
          .hero-grid {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 20px;
            align-items: center;
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin-bottom: 20px;
          }
          .hero-photo {
            width: 100px;
            height: 120px;
            border-radius: 6px;
            border: 2px solid #047857;
            overflow: hidden;
          }
          .hero-photo img { width: 100%; height: 100%; object-fit: cover; }
          .hero-info h3 { margin: 0 0 4px; font-size: 20px; color: #0f172a; }
          .hero-info h4 { margin: 0 0 10px; font-size: 13px; color: #0284c7; }
          .sec-title {
            background: #e2e8f0;
            padding: 6px 12px;
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            border-left: 4px solid #047857;
            margin: 16px 0 8px;
            border-radius: 2px;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12.5px; }
          table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
          table td.lbl { width: 180px; font-weight: 700; color: #475569; }
          table td.val { color: #0f172a; font-weight: 600; }
          .signs {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 0 30px;
          }
          .sign-col { text-align: center; width: 180px; border-top: 1px dashed #334155; padding-top: 6px; font-size: 11px; font-weight: 700; }
          @media print {
            body { padding: 0; }
            .dossier-card { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="dossier-card">
          <div class="dossier-header">
            <h1>${school.nameBn}</h1>
            <h2>${school.nameEn}</h2>
            <p>EIIN: ${school.eiin} • ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল • স্থাপিত: ১৯৪৬</p>
            <h3 style="margin: 8px 0 0; font-size: 16px; color: #047857;">শিক্ষার্থী পূর্ণাঙ্গ তথ্য বিবরণী ও ডিজিটাল ডসিয়ার</h3>
          </div>

          <div class="hero-grid">
            <div class="hero-photo">
              <img src="${photo}" alt="Student Photo">
            </div>
            <div class="hero-info">
              <h3>${student.name_bn || '—'}</h3>
              <h4>${student.name_en || ''}</h4>
              <div style="font-size: 13px; line-height: 1.6;">
                <b>স্টুডেন্ট আইডি:</b> ${student.student_id || '—'} &nbsp;•&nbsp; 
                <b>শ্রেণি:</b> শ্রেণি ${toBengaliDigits(student.class_name)} &nbsp;•&nbsp; 
                <b>রোল:</b> ${toBengaliDigits(student.roll_no)} &nbsp;•&nbsp; 
                <b>বিভাগ:</b> ${getDepartmentLabel(student)}
              </div>
            </div>
          </div>

          <div class="sec-title">১. ব্যক্তিগত ও পরিচিতি সংক্রান্ত তথ্য</div>
          <table>
            <tr><td class="lbl">জন্মতারিখ ও বয়স:</td><td class="val">${student.date_of_birth ? toBengaliDigits(student.date_of_birth.slice(0, 10)) : '—'} (${calculateAge(student.date_of_birth)})</td></tr>
            <tr><td class="lbl">জন্ম নিবন্ধন নং:</td><td class="val">${student.birth_registration_no || '—'}</td></tr>
            <tr><td class="lbl">লিঙ্গ ও ধর্ম:</td><td class="val">${student.gender === 'female' ? 'ছাত্রী (নারী)' : 'ছাত্র (পুরুষ)'} • ${student.religion || 'ইসলাম'}</td></tr>
            <tr><td class="lbl">রক্তের গ্রুপ:</td><td class="val">${student.blood_group || 'O+'}</td></tr>
            <tr><td class="lbl">বিশেষ চাহিদা / প্রতিবন্ধিতা:</td><td class="val">${student.is_special_needs === 'হ্যাঁ' ? (student.disability_type || student.special_needs || 'হ্যাঁ') : 'প্রযোজ্য নয় (সুস্থ ও স্বাভাবিক)'}</td></tr>
          </table>

          <div class="sec-title">২. পিতামাতা ও অভিভাবকের তথ্য</div>
          <table>
            <tr><td class="lbl">পিতার নাম ও পেশা:</td><td class="val">${student.father_name || '—'} (${student.father_profession || '—'}) • মোবাইল: ${student.father_mobile || '—'}</td></tr>
            <tr><td class="lbl">মাতার নাম ও পেশা:</td><td class="val">${student.mother_name || '—'} (${student.mother_profession || '—'}) • মোবাইল: ${student.mother_mobile || '—'}</td></tr>
            <tr><td class="lbl">স্থানীয় অভিভাবক:</td><td class="val">${student.guardian_name || student.father_name || '—'} (সম্পর্ক: ${student.guardian_relation || 'পিতা'}) • মোবাইল: ${student.guardian_phone || student.father_mobile || '—'}</td></tr>
          </table>

          <div class="sec-title">৩. ঠিকানার বিবরণ</div>
          <table>
            <tr><td class="lbl">বর্তমান ঠিকানা:</td><td class="val">গ্রাম: ${student.current_village || '—'}, ডাকঘর: ${student.current_post_office || '—'}, উপজেলা: ${student.current_upazila || 'কালিহাতি'}, জেলা: ${student.current_district || 'টাঙ্গাইল'}</td></tr>
            <tr><td class="lbl">স্থায়ী ঠিকানা:</td><td class="val">গ্রাম: ${student.permanent_village || '—'}, ডাকঘর: ${student.permanent_post_office || '—'}, উপজেলা: ${student.permanent_upazila || 'কালিহাতি'}, জেলা: ${student.permanent_district || 'টাঙ্গাইল'}</td></tr>
          </table>

          <div class="sec-title">৪. একাডেমিক ভর্তি ও প্রাতিষ্ঠানিক স্ট্যাটাস</div>
          <table>
            <tr><td class="lbl">ভর্তির শ্রেণি ও শিক্ষাবর্ষ:</td><td class="val">শ্রেণি ${toBengaliDigits(student.admission_class || student.class_name)} • ভর্তির তারিখ: ${student.admission_date ? toBengaliDigits(student.admission_date.slice(0, 10)) : '—'}</td></tr>
            <tr><td class="lbl">পূর্ববর্তী বিদ্যালয়:</td><td class="val">${student.previous_school || '—'}</td></tr>
            <tr><td class="lbl">প্রাতিষ্ঠানিক অবস্থা:</td><td class="val">${student.status === 'active' ? 'সক্রিয় ও নিয়মিত অধ্যয়নরত' : 'নিষ্ক্রিয় / স্থানান্তরিত'}</td></tr>
          </table>

          <div class="signs">
            <div class="sign-col">শ্রেণি শিক্ষকের স্বাক্ষর</div>
            <div class="sign-col">অভিভাবকের স্বাক্ষর</div>
            <div class="sign-col">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
          </div>
        </div>
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="modal-card" style={{
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '960px',
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
      }}>
        {/* Modal Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0f766e 100%)',
          color: '#ffffff', padding: '18px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
              COMPREHENSIVE STUDENT 360° PROFILE
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👤</span> শিক্ষার্থী পূর্ণাঙ্গ প্রোফাইল ও রেকর্ড
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff',
              fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        {/* Hero Section */}
        <div style={{
          padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'
        }}>
          <div style={{
            width: '90px', height: '110px', borderRadius: '8px', border: '2.5px solid #047857',
            overflow: 'hidden', background: '#e2e8f0', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            <img src={photo} alt={student.name_bn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                {student.name_bn || '—'}
              </h3>
              <span style={{
                background: student.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: student.status === 'active' ? '#166534' : '#991b1b',
                padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700
              }}>
                {student.status === 'active' ? '● সক্রিয় শিক্ষার্থী' : '○ নিষ্ক্রিয়'}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
              {student.name_en || ''}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', fontSize: '12.5px' }}>
              <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                🆔 ID: <b>{student.student_id}</b>
              </span>
              <span style={{ background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, color: '#0369a1' }}>
                🏫 শ্রেণি {toBengaliDigits(student.class_name)} {student.section ? `(${student.section})` : ''}
              </span>
              <span style={{ background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, color: '#b45309' }}>
                রোল: {toBengaliDigits(student.roll_no)}
              </span>
              <span style={{ background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, color: '#047857' }}>
                📚 {getDepartmentLabel(student)}
              </span>
              <span style={{ background: '#fef2f2', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, color: '#dc2626' }}>
                🩸 {student.blood_group || 'O+'}
              </span>
            </div>
          </div>

          {/* Quick Action Ribbon */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '6px',
            background: '#ffffff', padding: '8px 12px', borderRadius: '10px',
            border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              ⚡ ইনস্ট্যান্ট সার্ভিসেস
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => { onClose(); onOpenIdCard(student.id); }}
                style={{
                  padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700,
                  background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', cursor: 'pointer'
                }}
              >
                🪪 আইডি কার্ড
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onOpenCertificate(student.id, 'testimonial'); }}
                style={{
                  padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700,
                  background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', cursor: 'pointer'
                }}
              >
                📜 প্রশংসাপত্র
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onOpenCertificate(student.id, 'transfer'); }}
                style={{
                  padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700,
                  background: '#fef3c7', border: '1px solid #fde047', color: '#854d0e', cursor: 'pointer'
                }}
              >
                📑 ছাড়পত্র (TC)
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onOpenCertificate(student.id, 'bonafide'); }}
                style={{
                  padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700,
                  background: '#fdf4ff', border: '1px solid #f0abfc', color: '#86198f', cursor: 'pointer'
                }}
              >
                📄 প্রত্যয়নপত্র
              </button>
            </div>
            <button
              type="button"
              onClick={handlePrintDossier}
              style={{
                padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                background: '#047857', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              🖨️ পূর্ণ প্রোফাইল প্রিন্ট (Bio-data)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1',
          padding: '0 24px', gap: '4px'
        }}>
          {[
            { id: 'personal', label: '📋 ব্যক্তিগত ও স্বাস্থ্য', icon: '👤' },
            { id: 'family', label: '👨‍👩‍👧 পরিবার ও অভিভাবক', icon: '🏡' },
            { id: 'address', label: '📍 ঠিকানা ও যোগাযোগ', icon: '🗺️' },
            { id: 'academic', label: '🎓 একাডেমিক রেকর্ড ও অগ্রগতি', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px', border: 'none', borderBottom: activeTab === tab.id ? '3px solid #047857' : '3px solid transparent',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#047857' : '#64748b',
                fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, fontSize: '13.5px' }}>
          {activeTab === 'personal' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>🎂 জন্ম ও বয়স সংক্রান্ত তথ্য</div>
                <div style={rowStyle}><span>জন্মতারিখ:</span> <b>{student.date_of_birth ? toBengaliDigits(student.date_of_birth.slice(0, 10)) : '—'}</b></div>
                <div style={rowStyle}><span>বর্তমান বয়স:</span> <b>{calculateAge(student.date_of_birth)}</b></div>
                <div style={rowStyle}><span>জন্ম নিবন্ধন নম্বর:</span> <b style={{ fontFamily: 'monospace' }}>{student.birth_registration_no || '—'}</b></div>
                <div style={rowStyle}><span>স্টুডেন্ট NID:</span> <b style={{ fontFamily: 'monospace' }}>{student.student_nid_no || '—'}</b></div>
              </div>

              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>🧬 পরিচয় ও স্বাস্থ্য তথ্য</div>
                <div style={rowStyle}><span>লিঙ্গ:</span> <b>{student.gender === 'female' ? 'ছাত্রী (নারী)' : 'ছাত্র (পুরুষ)'}</b></div>
                <div style={rowStyle}><span>ধর্ম:</span> <b>{student.religion || 'ইসলাম'}</b></div>
                <div style={rowStyle}><span>রক্তের গ্রুপ:</span> <b style={{ color: '#dc2626' }}>{student.blood_group || 'O+'}</b></div>
                <div style={rowStyle}><span>জরুরি মোবাইল:</span> <b style={{ fontFamily: 'monospace' }}>{student.emergency_phone || student.guardian_phone || '—'}</b></div>
              </div>

              <div className="profile-info-card" style={{ ...infoCardStyle, gridColumn: '1 / -1' }}>
                <div style={cardHeaderStyle}>♿ বিশেষ চাহিদা ও প্রতিবন্ধিতা সংক্রান্ত তথ্য</div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '6px' }}>
                  <div>
                    <span>বিশেষ চাহিদাসম্পন্ন শিক্ষার্থী:</span>{' '}
                    <b style={{ color: student.is_special_needs === 'হ্যাঁ' ? '#d97706' : '#047857' }}>
                      {student.is_special_needs === 'হ্যাঁ' ? 'হ্যাঁ (বিশেষ সুবিধা প্রাপ্য)' : 'না (স্বাভাবিক)'}
                    </b>
                  </div>
                  {student.is_special_needs === 'হ্যাঁ' && (
                    <div>
                      <span>প্রতিবন্ধিতার ধরন:</span>{' '}
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {student.disability_type || student.special_needs || '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>👨 পিতার তথ্য</div>
                <div style={rowStyle}><span>পিতার নাম (বাংলা):</span> <b>{student.father_name || '—'}</b></div>
                <div style={rowStyle}><span>পিতার নাম (ইংরেজি):</span> <b>{student.father_name_en || '—'}</b></div>
                <div style={rowStyle}><span>পেশা:</span> <b>{student.father_profession || '—'}</b></div>
                <div style={rowStyle}><span>মোবাইল নম্বর:</span> <b style={{ fontFamily: 'monospace' }}>{student.father_mobile || '—'}</b></div>
                <div style={rowStyle}><span>জাতীয় পরিচয়পত্র (NID):</span> <b style={{ fontFamily: 'monospace' }}>{student.father_nid_no || '—'}</b></div>
                {student.father_abroad_country && (
                  <div style={rowStyle}><span>প্রবাসের দেশ:</span> <b style={{ color: '#0284c7' }}>{student.father_abroad_country}</b></div>
                )}
              </div>

              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>👩 মাতার তথ্য</div>
                <div style={rowStyle}><span>মাতার নাম (বাংলা):</span> <b>{student.mother_name || '—'}</b></div>
                <div style={rowStyle}><span>মাতার নাম (ইংরেজি):</span> <b>{student.mother_name_en || '—'}</b></div>
                <div style={rowStyle}><span>পেশা:</span> <b>{student.mother_profession || 'গৃহিনী'}</b></div>
                <div style={rowStyle}><span>মোবাইল নম্বর:</span> <b style={{ fontFamily: 'monospace' }}>{student.mother_mobile || '—'}</b></div>
                <div style={rowStyle}><span>জাতীয় পরিচয়পত্র (NID):</span> <b style={{ fontFamily: 'monospace' }}>{student.mother_nid_no || '—'}</b></div>
                {student.mother_death_year && (
                  <div style={rowStyle}><span>মৃত্যুর সন:</span> <b style={{ color: '#dc2626' }}>{student.mother_death_year}</b></div>
                )}
              </div>

              <div className="profile-info-card" style={{ ...infoCardStyle, gridColumn: '1 / -1' }}>
                <div style={cardHeaderStyle}>🛡️ আইনগত / স্থানীয় অভিভাবক (Guardian)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  <div style={rowStyle}><span>অভিভাবকের নাম:</span> <b>{student.guardian_name || student.father_name || '—'}</b></div>
                  <div style={rowStyle}><span>সম্পর্ক:</span> <b>{student.guardian_relation || (student.guardian_name ? 'অভিভাবক' : 'পিতা')}</b></div>
                  <div style={rowStyle}><span>মোবাইল নম্বর:</span> <b style={{ fontFamily: 'monospace' }}>{student.guardian_phone || student.father_mobile || '—'}</b></div>
                  <div style={rowStyle}><span>এনআইডি:</span> <b style={{ fontFamily: 'monospace' }}>{student.guardian_nid_no || '—'}</b></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>🏡 বর্তমান ঠিকানা (Current Address)</div>
                <div style={rowStyle}><span>গ্রাম / মহল্লা:</span> <b>{student.current_village || '—'}</b></div>
                <div style={rowStyle}><span>ডাকঘর:</span> <b>{student.current_post_office || '—'}</b></div>
                <div style={rowStyle}><span>উপজেলা:</span> <b>{student.current_upazila || 'কালিহাতি'}</b></div>
                <div style={rowStyle}><span>জেলা:</span> <b>{student.current_district || 'টাঙ্গাইল'}</b></div>
                {student.address && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <b>বিস্তারিত বিবরণ:</b> {student.address}
                  </div>
                )}
              </div>

              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>🏛️ স্থায়ী ঠিকানা (Permanent Address)</div>
                <div style={rowStyle}><span>গ্রাম / মহল্লা:</span> <b>{student.permanent_village || student.current_village || '—'}</b></div>
                <div style={rowStyle}><span>ডাকঘর:</span> <b>{student.permanent_post_office || student.current_post_office || '—'}</b></div>
                <div style={rowStyle}><span>উপজেলা:</span> <b>{student.permanent_upazila || student.current_upazila || 'কালিহাতি'}</b></div>
                <div style={rowStyle}><span>জেলা:</span> <b>{student.permanent_district || student.current_district || 'টাঙ্গাইল'}</b></div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="profile-info-card" style={infoCardStyle}>
                <div style={cardHeaderStyle}>🏫 ভর্তি ও বর্তমান একাডেমিক তথ্য</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  <div style={rowStyle}><span>বর্তমান শ্রেণি:</span> <b>শ্রেণি {toBengaliDigits(student.class_name)}</b></div>
                  <div style={rowStyle}><span>বিভাগ / গ্রুপ:</span> <b>{getDepartmentLabel(student)}</b></div>
                  <div style={rowStyle}><span>শ্রেণি রোল:</span> <b>{toBengaliDigits(student.roll_no)}</b></div>
                  <div style={rowStyle}><span>ভর্তির শ্রেণি:</span> <b>শ্রেণি {toBengaliDigits(student.admission_class || student.class_name)}</b></div>
                  <div style={rowStyle}><span>ভর্তির তারিখ:</span> <b>{student.admission_date ? toBengaliDigits(student.admission_date.slice(0, 10)) : '—'}</b></div>
                  <div style={rowStyle}><span>পূর্ববর্তী প্রতিষ্ঠান:</span> <b>{student.previous_school || '—'}</b></div>
                </div>
              </div>

              {/* Attendance and Performance Snapshot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="profile-info-card" style={infoCardStyle}>
                  <div style={cardHeaderStyle}>🕘 উপস্থিতির ওভারভিউ (Attendance Snapshot)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'conic-gradient(#047857 0% 94%, #e2e8f0 94% 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: '#047857' }}>
                        ৯৪%
                      </div>
                    </div>
                    <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
                      <div>উপস্থিতি হার: <b style={{ color: '#047857' }}>৯৪.২%</b></div>
                      <div>মোট কর্মদিবস: <b>১৮০ দিন</b></div>
                      <div>অনুপস্থিতি: <b style={{ color: '#dc2626' }}>৮ দিন</b></div>
                    </div>
                  </div>
                </div>

                <div className="profile-info-card" style={infoCardStyle}>
                  <div style={cardHeaderStyle}>📈 ফলাফল ও গ্রেড সামারি (Exam Status)</div>
                  <div style={{ fontSize: '12.5px', lineHeight: '1.8', padding: '6px 0' }}>
                    <div>সর্বশেষ পরীক্ষা: <b>প্রাক-নির্বাচনী পরীক্ষা ২০২৬</b></div>
                    <div>ফলাফল স্ট্যাটাস: <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>উত্তীর্ণ (Passed)</span></div>
                    <div>প্রাপ্ত জিপিএ (GPA): <b style={{ fontSize: '14px', color: '#1d4ed8' }}>৪.৭৫ (A)</b></div>
                    <div>শ্রেণি মেধা ক্রম: <b style={{ color: '#b45309' }}>০৫ তম</b></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => { onClose(); onEditStudent(student); }}
            style={{
              padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
              background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            ✏️ শিক্ষার্থীর তথ্য সম্পাদনা
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrintDossier}
              style={{
                padding: '7px 18px', borderRadius: '6px', border: 'none',
                background: '#047857', color: '#fff', fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              🖨️ প্রিন্ট Bio-data
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
                background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer'
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const infoCardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '14px 16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const cardHeaderStyle = {
  fontWeight: 800,
  fontSize: '13.5px',
  color: '#065f46',
  borderBottom: '1.5px solid #f1f5f9',
  paddingBottom: '6px',
  marginBottom: '10px'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 0',
  borderBottom: '1px dashed #f1f5f9'
};
