import React, { useState, useMemo } from 'react';
import { MOCK_SCHOOL, getTeacherPhoto } from './mockData.js';
import schoolLogo from '../public/school-logo.png';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => BN_DIGITS[d]);
};

export function StaffCertificatesModal({
  isOpen,
  onClose,
  people = [],
  initialPersonId = '',
  initialTab = 'bonafide' // 'bonafide', 'experience', 'professional', 'continuous', 'release_order', 'biodata', 'id_card'
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'bonafide');
  const [selectedPersonId, setSelectedPersonId] = useState(initialPersonId || (people[0]?.id || ''));
  const [searchQuery, setSearchQuery] = useState('');

  // Customizable certificate fields
  const [customMemoNo, setCustomMemoNo] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [conductAppraisal, setConductAppraisal] = useState('উত্তম, দায়িত্বশীল ও প্রশংসনীয়');

  // Specific fields for Training Release Order (প্রশিক্ষণ ছাড়পত্র)
  const [trainingSubject, setTrainingSubject] = useState('নতুন জাতীয় শিক্ষাক্রম বিস্তরণ ও বিষয়ভিত্তিক শ্রেণি মূল্যায়ন প্রশিক্ষণ');
  const [trainingInstitute, setTrainingInstitute] = useState('সরকারি টিচার্স ট্রেনিং কলেজ (TTC), ময়মনসিংহ');
  const [trainingLocation, setTrainingLocation] = useState('ময়মনসিংহ');
  const [trainingStartDate, setTrainingStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [trainingEndDate, setTrainingEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [trainingDurationText, setTrainingDurationText] = useState('৬ দিনব্যাপী');

  // Continuous Service specific fields
  const [continuousServiceRemarks, setContinuousServiceRemarks] = useState('চাকুরীর ধারাবাহিকতায় কোনো প্রকার বিরতি (Break of Service) বা বিভাগীয় অসন্তোষজনক রেকর্ড নেই।');

  // Filter people list
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return people;
    const q = searchQuery.toLowerCase();
    return people.filter(p =>
      (p.name_bn && p.name_bn.toLowerCase().includes(q)) ||
      (p.name_en && p.name_en.toLowerCase().includes(q)) ||
      (p.employee_id && String(p.employee_id).toLowerCase().includes(q)) ||
      (p.designation && p.designation.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    );
  }, [people, searchQuery]);

  // Selected Person
  const person = useMemo(() => {
    return people.find(p => String(p.id) === String(selectedPersonId) || String(p.employee_id) === String(selectedPersonId)) || people[0] || null;
  }, [people, selectedPersonId]);

  if (!isOpen) return null;

  const school = MOCK_SCHOOL;

  // Format date helper
  const formatBnDate = (dStr) => {
    if (!dStr) return '—';
    const clean = String(dStr).slice(0, 10);
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return toBengaliDigits(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return toBengaliDigits(clean);
  };

  // Calculate experience in years and months
  const calcExperienceText = (joinDateStr) => {
    if (!joinDateStr) return 'দীর্ঘদিন';
    try {
      const start = new Date(joinDateStr);
      const now = new Date();
      if (isNaN(start.getTime())) return 'দীর্ঘদিন';
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years < 0) return 'কয়েক মাস';
      if (years === 0) return `${toBengaliDigits(months)} মাস`;
      if (months === 0) return `${toBengaliDigits(years)} বছর`;
      return `${toBengaliDigits(years)} বছর ${toBengaliDigits(months)} মাস`;
    } catch {
      return 'দীর্ঘদিন';
    }
  };

  const personNameBn = person?.name_bn || person?.name || '—';
  const personNameEn = person?.name_en || '';
  const designation = person?.designation || 'সহকারী শিক্ষক';
  const subject = person?.subject || '';
  const empId = person?.employee_id || person?.id || '—';
  const mpoIndex = person?.mpo_index_no || person?.mpo_code || person?.index_no || 'প্রযোজ্য নয়';
  const firstJoining = person?.first_joining_date || person?.current_post_joining_date || person?.joining_date || '২০১২-০১-০১';
  const currentJoining = person?.current_post_joining_date || person?.joining_date || person?.first_joining_date || '২০১২-০১-০১';
  const fatherName = person?.father_name_bn || person?.father_name || '—';
  const motherName = person?.mother_name_bn || person?.mother_name || '—';
  const gender = person?.gender === 'female' ? 'মহিলা' : 'পুরুষ';
  const honorific = person?.gender === 'female' ? 'জনাবা' : 'জনাব';
  const pronounHeShe = person?.gender === 'female' ? 'তিনি' : 'তিনি';
  const blood = person?.blood_group || 'O+';
  const phone = person?.phone || '—';
  const email = person?.email || '—';
  const address = person?.address || 'গ্রাম ও ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল';
  const permanentAddress = person?.permanent_address || address;
  const nid = person?.nid_no || person?.extended_profile?.nid || '—';
  const photo = getTeacherPhoto(person);
  const experienceDuration = calcExperienceText(currentJoining);

  // Memo Number (default empty so it displays only "স্মারক নংঃ")
  const memoNo = (customMemoNo || '').trim();

  // Generate Document HTML based on active tab
  const generateDocumentHtml = () => {
    const formattedIssueDate = formatBnDate(issueDate);
    const formattedFirstJoin = formatBnDate(firstJoining);
    const formattedCurrentJoin = formatBnDate(currentJoining);
    const formattedTrainStart = formatBnDate(trainingStartDate);
    const formattedTrainEnd = formatBnDate(trainingEndDate);

    // 1. প্রত্যয়নপত্র (Employment / Bonafide Certificate)
    if (activeTab === 'bonafide') {
      return `
        <div class="cert-card-sheet bonafide-doc">
          <div class="cert-inner-border">
            <div class="doc-header">
              <img src="${schoolLogo}" class="doc-logo" alt="Logo">
              <div class="doc-school-meta">
                <h1 class="school-name-title">${school.nameBn}</h1>
                <h3 class="school-name-en-title">${school.nameEn}</h3>
                <p class="school-sub-info">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬</p>
                <p class="school-contact-info">ইমেইল: ${school.email}</p>
              </div>
            </div>

            <div class="doc-meta-row">
              <div class="meta-item"><b>স্মারক নংঃ</b> ${memoNo}</div>
              <div class="meta-item"><b>তারিখ:</b> ${formattedIssueDate} খ্রি.</div>
            </div>

            <div class="doc-title-banner">
              <h2>প্রত্যয়নপত্র</h2>
              <span class="sub-title-en">TO WHOM IT MAY CONCERN • BONAFIDE CERTIFICATE</span>
            </div>

            <div class="doc-body-text">
              <p class="doc-para">
                এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <b>${honorific} ${personNameBn}</b>${personNameEn ? ` (${personNameEn})` : ''}, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>, বর্তমান ঠিকানা: ${address}; তিনি ঐতিহ্যবাহী <b>${school.nameBn}</b>-এ <b>${designation}</b> ${subject ? `(${subject})` : ''} পদে <b>${formattedCurrentJoin}</b> খ্রি. তারিখ হইতে অদ্যাবধি সুনামের সহিত নিষ্ঠা ও দক্ষতার সাথে কর্মরত আছেন।
              </p>
              <p class="doc-para">
                বিদ্যালয়ের দাপ্তরিক ও এমপিও রেকর্ড অনুযায়ী তাঁহার বেতন কোড/এমপিও ইনডেক্স নম্বর: <b>${mpoIndex}</b> এবং শিক্ষক/কর্মচারী আইডি: <b>${empId}</b>। তিনি অত্র প্রতিষ্ঠানের একজন নিয়মিত ও দায়িত্বশীল স্থায়ী শিক্ষক/কর্মচারী।
              </p>
              <p class="doc-para">
                কর্মকালে তিনি শিক্ষকতা, প্রাতিষ্ঠানিক শৃঙ্খলা রক্ষা ও শিক্ষার্থীদের সার্বিক জ্ঞান বিকাশে অত্যন্ত নিবেদিতপ্রাণ। তাঁহার নৈতিক চরিত্র, আচার-ব্যবহার ও পেশাগত দায়িত্ববোধ <b>${conductAppraisal}</b>। আমার জানামতে তিনি প্রতিষ্ঠান বা রাষ্ট্রবিরোধী কোনো কার্যকলাপে কখনো লিপ্ত ছিলেন না।
              </p>
              <p class="doc-para closing-para">
                তাঁহার ব্যক্তিগত, প্রাতিষ্ঠানিক ও দাপ্তরিক সর্বপ্রকার প্রয়োজনে এই প্রত্যয়নপত্র প্রদান করা হইল। আমি তাঁহার কর্মজীবনের উত্তরোত্তর সাফল্য ও সার্বিক কল্যাণ কামনা করি।
              </p>
            </div>

            <div class="doc-sign-area">
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${personNameBn}</b>
                <span>সংশ্লিষ্ট শিক্ষক / কর্মচারী</span>
              </div>
              <div class="sign-block seal-space">
                <div class="official-seal-box">বিদ্যালয়ের গোল সিলমোহর</div>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${school.headTeacher}</b>
                <span>প্রধান শিক্ষক</span>
                <span>${school.nameBn}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. অভিজ্ঞতার সনদ (Experience Certificate)
    if (activeTab === 'experience') {
      return `
        <div class="cert-card-sheet experience-doc">
          <div class="cert-inner-border">
            <div class="doc-header">
              <img src="${schoolLogo}" class="doc-logo" alt="Logo">
              <div class="doc-school-meta">
                <h1 class="school-name-title">${school.nameBn}</h1>
                <h3 class="school-name-en-title">${school.nameEn}</h3>
                <p class="school-sub-info">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬</p>
              </div>
            </div>

            <div class="doc-meta-row">
              <div class="meta-item"><b>স্মারক নংঃ</b> ${memoNo}</div>
              <div class="meta-item"><b>তারিখ:</b> ${formattedIssueDate} খ্রি.</div>
            </div>

            <div class="doc-title-banner exp-banner">
              <h2>অভিজ্ঞতার সনদপত্র</h2>
              <span class="sub-title-en">CERTIFICATE OF TEACHING & PROFESSIONAL EXPERIENCE</span>
            </div>

            <div class="doc-body-text">
              <p class="doc-para">
                অত্যন্ত আনন্দের সহিত এই অভিজ্ঞতার সনদ প্রদান করা যাইতেছে যে, <b>${honorific} ${personNameBn}</b>${personNameEn ? ` (${personNameEn})` : ''}, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>; অত্র <b>${school.nameBn}</b>-এ <b>${designation}</b> ${subject ? `(${subject})` : ''} পদে <b>${formattedCurrentJoin}</b> খ্রি. তারিখে যোগদান করিয়া অদ্যাবধি প্রায় <b>${experienceDuration}</b> যাবৎ অত্যন্ত দক্ষতা, সততা ও একাগ্রতার সহিত শিক্ষকতা ও দাপ্তরিক দায়িত্ব পালন করিয়া আসিতেছেন।
              </p>
              <p class="doc-para">
                অত্র প্রতিষ্ঠানে দীর্ঘ কর্মকালীন সময়ে তিনি পাঠ্যক্রম পরিচালনা, বিষয়ভিত্তিক শ্রেণি পাঠদান, শিক্ষার্থীদের সৃজনশীল মেধা বিকাশ, আধুনিক ডিজিটাল শিক্ষা উপকরণ ব্যবহার এবং সহশিক্ষা কার্যক্রমে অনন্য অবদান রাখিয়াছেন। তাঁহার প্রাতিষ্ঠানিক আইডি নম্বর: <b>${empId}</b> এবং এমপিও ইনডেক্স নম্বর: <b>${mpoIndex}</b>।
              </p>
              <p class="doc-para">
                বিদ্যালয়ের শিক্ষক ও কর্মচারীদের সহিত তাঁহার পারস্পরিক সম্পর্ক অত্যন্ত সৌহার্দ্যপূর্ণ এবং তাঁহার নৈতিক আচরণ ও কর্মস্পৃহা <b>${conductAppraisal}</b>।
              </p>
              <p class="doc-para closing-para">
                তাঁহার উজ্জ্বল ভবিষ্যৎ, পেশাগত জীবনের উত্তরোত্তর সমৃদ্ধি ও সুস্বাস্থ্য কামনা করিয়া এই অভিজ্ঞতার সনদপত্র প্রদান করা হইল।
              </p>
            </div>

            <div class="doc-sign-area">
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>সহকারী প্রধান শিক্ষক</b>
                <span>${school.nameBn}</span>
              </div>
              <div class="sign-block seal-space">
                <div class="official-seal-box">বিদ্যালয়ের অফিশিয়াল সিল</div>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${school.headTeacher}</b>
                <span>প্রধান শিক্ষক</span>
                <span>${school.nameBn}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 3. পেশাগত সনদ / চরিত্র ও আচরণ সনদ (Professional Certificate)
    if (activeTab === 'professional') {
      return `
        <div class="cert-card-sheet professional-doc">
          <div class="cert-inner-border">
            <div class="doc-header">
              <img src="${schoolLogo}" class="doc-logo" alt="Logo">
              <div class="doc-school-meta">
                <h1 class="school-name-title">${school.nameBn}</h1>
                <h3 class="school-name-en-title">${school.nameEn}</h3>
                <p class="school-sub-info">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • EIIN: ${school.eiin}</p>
              </div>
            </div>

            <div class="doc-meta-row">
              <div class="meta-item"><b>স্মারক নংঃ</b> ${memoNo}</div>
              <div class="meta-item"><b>তারিখ:</b> ${formattedIssueDate} খ্রি.</div>
            </div>

            <div class="doc-title-banner prof-banner">
              <h2>পেশাগত ও চারিত্রিক সনদপত্র</h2>
              <span class="sub-title-en">PROFESSIONAL EXCELLENCE & CONDUCT CERTIFICATE</span>
            </div>

            <div class="doc-body-text">
              <p class="doc-para">
                এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <b>${honorific} ${personNameBn}</b>, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>; অত্র <b>${school.nameBn}</b>-এর একজন নিয়মিত ও দায়িত্বশীল <b>${designation}</b> ${subject ? `(${subject})` : ''}। তিনি <b>${formattedCurrentJoin}</b> খ্রি. তারিখ হইতে অদ্যাবধি অত্র বিদ্যালয়ে সুনামের সহিত স্বীয় পেশাগত দায়িত্ব পালন করিতেছেন।
              </p>
              <p class="doc-para">
                কর্মকালে তিনি শিক্ষক সুলভ আদর্শ, নিয়মানুবর্তিতা, সততা ও উচ্চ নৈতিক মূল্যবোধের পরিচয় প্রদান করিয়াছেন। বিদ্যালয়ের যাবতীয় সহশিক্ষা কার্যক্রম, জাতীয় দিবস উদযাপন ও প্রাতিষ্ঠানিক শৃঙ্খলায় তাঁহার অবদান সর্বজনস্বীকৃত।
              </p>
              <p class="doc-para">
                তাঁহার ব্যক্তিগত চরিত্র নির্মল, উন্নত ও সমাজবান্ধব। তিনি কখনো কোনো শৃঙ্খলাবিরোধী বা নৈতিক অবক্ষয়মূলক কর্মকাণ্ডে জড়িত ছিলেন না। তাঁহার পেশাগত আচরণ অত্যন্ত প্রশংসনীয়।
              </p>
              <p class="doc-para closing-para">
                আমি তাঁহার সার্বিক পেশাগত উন্নতি ও দীর্ঘায়ু কামনা করি।
              </p>
            </div>

            <div class="doc-sign-area">
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${school.president}</b>
                <span>সভাপতি, ম্যানেজিং কমিটি</span>
              </div>
              <div class="sign-block seal-space">
                <div class="official-seal-box">প্রাতিষ্ঠানিক সিলমোহর</div>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${school.headTeacher}</b>
                <span>প্রধান শিক্ষক</span>
                <span>${school.nameBn}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 4. নিরবিচ্ছিন্ন চাকুরী সনদ (Continuous Service Certificate - MPO / Time-Scale / Promotion)
    if (activeTab === 'continuous') {
      return `
        <div class="cert-card-sheet continuous-doc">
          <div class="cert-inner-border">
            <div class="doc-header">
              <img src="${schoolLogo}" class="doc-logo" alt="Logo">
              <div class="doc-school-meta">
                <h1 class="school-name-title">${school.nameBn}</h1>
                <h3 class="school-name-en-title">${school.nameEn}</h3>
                <p class="school-sub-info">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • EIIN: ${school.eiin}</p>
                <p class="school-sub-info">উপজেলা কোড: কালিহাতি • এমপিও কোড: ৪২০৬০৭১৩০২</p>
              </div>
            </div>

            <div class="doc-meta-row">
              <div class="meta-item"><b>স্মারক নংঃ</b> ${memoNo}</div>
              <div class="meta-item"><b>তারিখ:</b> ${formattedIssueDate} খ্রি.</div>
            </div>

            <div class="doc-title-banner continuous-banner">
              <h2>নিরবিচ্ছিন্ন চাকুরী সনদপত্র</h2>
              <span class="sub-title-en">CONTINUOUS & UNBROKEN SERVICE CERTIFICATE</span>
            </div>

            <div class="doc-body-text">
              <p class="doc-para">
                এতদ্বারা এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <b>${honorific} ${personNameBn}</b>${personNameEn ? ` (${personNameEn})` : ''}, পিতা: <b>${fatherName}</b>, মাতা: <b>${motherName}</b>; অত্র <b>${school.nameBn}</b>-এ <b>${designation}</b> ${subject ? `(${subject})` : ''} পদে এমপিওভুক্ত শিক্ষক/কর্মচারী হিসেবে কর্মরত আছেন।
              </p>
              
              <div class="service-table-wrap">
                <table class="cert-info-grid">
                  <tr>
                    <td class="col-lbl">শিক্ষক/কর্মচারীর আইডি:</td>
                    <td class="col-val"><b>${empId}</b></td>
                    <td class="col-lbl">এমপিও ইনডেক্স নম্বর:</td>
                    <td class="col-val"><b>${mpoIndex}</b></td>
                  </tr>
                  <tr>
                    <td class="col-lbl">প্রথম নিয়োগ ও যোগদানের তারিখ:</td>
                    <td class="col-val"><b>${formattedFirstJoin}</b> খ্রি.</td>
                    <td class="col-lbl">বর্তমান পদে যোগদানের তারিখ:</td>
                    <td class="col-val"><b>${formattedCurrentJoin}</b> খ্রি.</td>
                  </tr>
                  <tr>
                    <td class="col-lbl">জাতীয় পরিচয়পত্র (NID):</td>
                    <td class="col-val">${nid}</td>
                    <td class="col-lbl">বর্তমান চাকুরীর অবস্থা:</td>
                    <td class="col-val"><span class="badge-active">সক্রিয় ও এমপিওভুক্ত</span></td>
                  </tr>
                </table>
              </div>

              <p class="doc-para" style="margin-top:14px">
                সার্ভিস বুক ও অত্র বিদ্যালয়ের দাপ্তরিক রেজিস্টার পুঙ্খানুপুঙ্খ যাচাই করিয়া দেখা গেল যে, তিনি তাঁহার প্রথম যোগদানের তারিখ <b>${formattedFirstJoin}</b> খ্রি. হইতে অদ্যাবধি <b>${formattedIssueDate}</b> খ্রি. পর্যন্ত অত্র বিদ্যালয়ে সম্পূর্ণ <b>ধারাবাহিক ও নিরবিচ্ছিন্নভাবে (Continuous & Unbroken Service)</b> চাকুরীতে বহাল রহিয়াছেন।
              </p>
              <p class="doc-para">
                <b>${continuousServiceRemarks}</b> তিনি কখনো বিনা অনুমতিতে অনুপস্থিত ছিলেন না এবং তাঁহার চাকুরীর মোট স্থিতিকাল সর্বতোভাবে সন্তোষজনক।
              </p>
              <p class="doc-para closing-para">
                উচ্চতর স্কেল / টাইম-স্কেল / পদোন্নতি / সরকারি সুযোগ-সুবিধা ও সার্ভিস বুক হালনাগাদের নিমিত্তে এই সনদপত্র প্রদান করা হইল।
              </p>
            </div>

            <div class="doc-sign-area">
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>যাচাইকারী / অফিস সহকারী</b>
                <span>${school.nameBn}</span>
              </div>
              <div class="sign-block seal-space">
                <div class="official-seal-box">অফিসিয়াল সিলমোহর</div>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${school.headTeacher}</b>
                <span>প্রধান শিক্ষক</span>
                <span>${school.nameBn}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 5. প্রশিক্ষণ ছাড়পত্র / অবমুক্তি আদেশ (Training Release Order / Clearance)
    if (activeTab === 'release_order') {
      return `
        <div class="cert-card-sheet release-doc">
          <div class="cert-inner-border">
            <div class="doc-header">
              <img src="${schoolLogo}" class="doc-logo" alt="Logo">
              <div class="doc-school-meta">
                <h1 class="school-name-title">${school.nameBn}</h1>
                <h3 class="school-name-en-title">${school.nameEn}</h3>
                <p class="school-sub-info">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • EIIN: ${school.eiin}</p>
                <p class="school-sub-info">স্মারক ও প্রশিক্ষণ সেল • অফিসিয়াল ছাড়পত্র আদেশ</p>
              </div>
            </div>

            <div class="doc-meta-row">
              <div class="meta-item"><b>স্মারক নংঃ</b> ${memoNo}</div>
              <div class="meta-item"><b>তারিখ:</b> ${formattedIssueDate} খ্রি.</div>
            </div>

            <div class="doc-title-banner release-banner">
              <h2>প্রশিক্ষণ ছাড়পত্র ও অবমুক্তি আদেশ (Release Order)</h2>
              <span class="sub-title-en">OFFICIAL RELEASE ORDER & CLEARANCE FOR PROFESSIONAL TRAINING</span>
            </div>

            <div class="doc-body-text">
              <p class="doc-para">
                যথাযথ কর্তৃপক্ষের নির্দেশনা ও প্রাতিষ্ঠানিক সিদ্ধান্তের প্রেক্ষিতে অত্র বিদ্যালয়ের <b>${designation}</b> ${subject ? `(${subject})` : ''} <b>${honorific} ${personNameBn}</b>${personNameEn ? ` (${personNameEn})` : ''}, আইডি নম্বর: <b>${empId}</b>, ইনডেক্স নং: <b>${mpoIndex}</b>-কে নিম্নলিখিত প্রশিক্ষণ কোর্সে অংশগ্রহণের নিমিত্তে অত্র বিদ্যালয়ের দায়িত্বভার হইতে সাময়িকভাবে অবমুক্তি (Release Order / ছাড়পত্র) প্রদান করা হইল:
              </p>

              <div class="training-highlight-box">
                <table class="training-details-table">
                  <tr>
                    <td class="t-lbl">১. প্রশিক্ষণের বিষয় ও শিরোনাম:</td>
                    <td class="t-val"><b class="t-title">${trainingSubject}</b></td>
                  </tr>
                  <tr>
                    <td class="t-lbl">২. প্রশিক্ষণ প্রদানকারী প্রতিষ্ঠান:</td>
                    <td class="t-val"><b>${trainingInstitute}</b></td>
                  </tr>
                  <tr>
                    <td class="t-lbl">৩. প্রশিক্ষণ ভেন্যু / অবস্থান:</td>
                    <td class="t-val">${trainingLocation}</td>
                  </tr>
                  <tr>
                    <td class="t-lbl">৪. প্রশিক্ষণের সময়সীমা:</td>
                    <td class="t-val">
                      <b>${formattedTrainStart}</b> খ্রি. হইতে <b>${formattedTrainEnd}</b> খ্রি. পর্যন্ত (${trainingDurationText})
                    </td>
                  </tr>
                  <tr>
                    <td class="t-lbl">৫. অবমুক্তির কার্যকাল:</td>
                    <td class="t-val"><b>${formattedTrainStart}</b> খ্রি. অপরাহ্ন / পূর্বাহ্ন হইতে কার্যকর হইবে।</td>
                  </tr>
                </table>
              </div>

              <div class="conditions-box">
                <b>শর্তাবলি:</b>
                <ol>
                  <li>প্রশিক্ষণকালীন সময়ে তিনি যথারীতি সরকারি বিধি মোতাবেক প্রশিক্ষণ ভাতা / টিএ-ডিএ সুবিধা প্রাপ্য হইবেন।</li>
                  <li>প্রশিক্ষণ সমাপ্তির পর অনতিবিলম্বে প্রশিক্ষণ সমাপ্তি সনদপত্রের কপিসহ অত্র বিদ্যালয়ে পূর্ববর্তী পদে যোগদানপত্র দাখিল করিবেন।</li>
                  <li>প্রশিক্ষণলব্ধ জ্ঞান বিদ্যালয়ের শ্রেণি কার্যক্রম ও সহকর্মীদের সাথে শেয়ার করিতে বাধ্য থাকিবেন।</li>
                </ol>
              </div>

              <p class="doc-para closing-para" style="margin-top:10px">
                তাঁহার প্রশিক্ষণ সাফল্যমণ্ডিত ও ফলপ্রসূ হউক—এই কামনা করি।
              </p>
            </div>

            <div class="doc-sign-area">
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${personNameBn}</b>
                <span>অবমুক্তিকৃত শিক্ষক / কর্মচারী</span>
              </div>
              <div class="sign-block seal-space">
                <div class="official-seal-box">অফিসিয়াল সিলমোহর</div>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <b>${school.headTeacher}</b>
                <span>প্রধান শিক্ষক</span>
                <span>${school.nameBn}</span>
              </div>
            </div>

            <div class="copy-forward-box">
              <small><b>অনুলিপি সদয় অবগতি ও প্রয়োজনীয় কার্যার্থে প্রেরিত হইল:</b></small><br>
              <small>১. পরিচালক / অধ্যক্ষ, ${trainingInstitute}।</small><br>
              <small>২. জেলা শিক্ষা অফিসার, টাঙ্গাইল।</small><br>
              <small>৩. উপজেলা মাধ্যমিক শিক্ষা অফিসার, কালিহাতি, টাঙ্গাইল।</small><br>
              <small>৪. সংশ্লিষ্ট শিক্ষক নথী ও অফিস কপি।</small>
            </div>
          </div>
        </div>
      `;
    }

    // 6. আকর্ষণীয় জীবনবৃত্তান্ত / বায়োডাটা (Executive Bio-Data / CV)
    if (activeTab === 'biodata') {
      const ext = person?.extended_profile || {};
      const eduList = ext.education || [];
      const trainingList = ext.training || [];
      const inServiceList = ext.in_service_training || [];
      const ntrca = ext.ntrca || {};

      return `
        <div class="cert-card-sheet biodata-sheet">
          <!-- Institutional Header -->
          <div class="bio-header">
            <div class="bio-header-left">
              <img src="${schoolLogo}" class="bio-logo" alt="Logo">
              <div>
                <h2>${school.nameBn}</h2>
                <h4>${school.nameEn} • EIIN: ${school.eiin}</h4>
                <p>মগড়া, কালিহাতি, টাঙ্গাইল • স্থাপিত: ১৯৪৬</p>
              </div>
            </div>
            <div class="bio-tag-box">
              <span>অফিশিয়াল শিক্ষক/কর্মচারী জীবনবৃত্তান্ত</span>
              <b>CURRICULUM VITAE</b>
            </div>
          </div>

          <!-- Top Profile Banner -->
          <div class="bio-profile-banner">
            <div class="bio-photo-frame">
              <img src="${photo}" alt="${personNameBn}" onerror="this.src='/school-building.jpg'">
            </div>
            <div class="bio-primary-meta">
              <h1 class="bio-name-bn">${personNameBn}</h1>
              ${personNameEn ? `<h3 class="bio-name-en">${personNameEn}</h3>` : ''}
              <div class="bio-designation-badge">${designation} ${subject ? `• ${subject}` : ''}</div>
              <div class="bio-quick-specs">
                <span><b>আইডি:</b> ${empId}</span>
                <span><b>ইনডেক্স:</b> ${mpoIndex}</span>
                <span><b>রক্তের গ্রুপ:</b> 🩸 ${blood}</span>
                <span><b>স্ট্যাটাস:</b> <span class="badge-active">সক্রিয়</span></span>
              </div>
            </div>
          </div>

          <!-- Section 1: ব্যক্তিগত ও পারিবারিক তথ্যাবলি -->
          <div class="bio-sec-title"><span>১. ব্যক্তিগত ও পারিবারিক তথ্যাবলি (Personal Details)</span></div>
          <table class="bio-details-table">
            <tr>
              <td class="b-lbl">পিতার নাম</td>
              <td class="b-sep">:</td>
              <td class="b-val">${fatherName}</td>
              <td class="b-lbl">মাতার নাম</td>
              <td class="b-sep">:</td>
              <td class="b-val">${motherName}</td>
            </tr>
            <tr>
              <td class="b-lbl">জন্ম তারিখ</td>
              <td class="b-sep">:</td>
              <td class="b-val">${formatBnDate(person?.date_of_birth || ext?.dob || '১৯৮৫-০১-০১')} খ্রি.</td>
              <td class="b-lbl">লিঙ্গ ও ধর্ম</td>
              <td class="b-sep">:</td>
              <td class="b-val">${gender} • ${person?.religion || 'ইসলাম'}</td>
            </tr>
            <tr>
              <td class="b-lbl">জাতীয় পরিচয়পত্র (NID)</td>
              <td class="b-sep">:</td>
              <td class="b-val"><b>${nid}</b></td>
              <td class="b-lbl">বৈবাহিক অবস্থা</td>
              <td class="b-sep">:</td>
              <td class="b-val">${person?.marital_status || 'বিবাহিত'}</td>
            </tr>
            <tr>
              <td class="b-lbl">মোবাইল নম্বর</td>
              <td class="b-sep">:</td>
              <td class="b-val"><b class="mono">${phone}</b></td>
              <td class="b-lbl">ই-মেইল এড্রেস</td>
              <td class="b-sep">:</td>
              <td class="b-val"><span class="mono">${email}</span></td>
            </tr>
            <tr>
              <td class="b-lbl">বর্তমান ঠিকানা</td>
              <td class="b-sep">:</td>
              <td class="b-val" colspan="4">${address}</td>
            </tr>
            <tr>
              <td class="b-lbl">স্থায়ী ঠিকানা</td>
              <td class="b-sep">:</td>
              <td class="b-val" colspan="4">${permanentAddress}</td>
            </tr>
          </table>

          <!-- Section 2: নিয়োগ ও চাকুরীর তথ্যাবলি -->
          <div class="bio-sec-title"><span>২. নিয়োগ ও চাকুরীর ধারাবাহিক বিবরণ (Employment & MPO History)</span></div>
          <table class="bio-details-table">
            <tr>
              <td class="b-lbl">বর্তমান পদবী ও বিষয়</td>
              <td class="b-sep">:</td>
              <td class="b-val"><b>${designation}</b> ${subject ? `(${subject})` : ''}</td>
              <td class="b-lbl">এমপিও ইনডেক্স নং</td>
              <td class="b-sep">:</td>
              <td class="b-val"><b class="highlight-code">${mpoIndex}</b></td>
            </tr>
            <tr>
              <td class="b-lbl">প্রথম চাকুরীতে যোগদান</td>
              <td class="b-sep">:</td>
              <td class="b-val">${formattedFirstJoin} খ্রি.</td>
              <td class="b-lbl">বর্তমান পদে যোগদান</td>
              <td class="b-sep">:</td>
              <td class="b-val">${formattedCurrentJoin} খ্রি.</td>
            </tr>
            <tr>
              <td class="b-lbl">শিক্ষক বাতায়ন আইডি</td>
              <td class="b-sep">:</td>
              <td class="b-val">${person?.teacher_portal_id || '—'}</td>
              <td class="b-lbl">মোট চাকুরীর অভিজ্ঞতা</td>
              <td class="b-sep">:</td>
              <td class="b-val"><b>${experienceDuration}</b></td>
            </tr>
          </table>

          <!-- Section 3: শিক্ষাগত যোগ্যতা -->
          <div class="bio-sec-title"><span>৩. শিক্ষাগত যোগ্যতার বিবরণ (Academic Qualifications)</span></div>
          <table class="bio-grid-table">
            <thead>
              <tr>
                <th style="width:35px">ক্র.</th>
                <th>পরীক্ষার নাম</th>
                <th>বিভাগ / বিষয়</th>
                <th>বোর্ড / বিশ্ববিদ্যালয়</th>
                <th>পাশের সন</th>
                <th>ফলাফল / গ্রেড</th>
              </tr>
            </thead>
            <tbody>
              ${eduList && eduList.length ? eduList.map((e, idx) => `
                <tr>
                  <td style="text-align:center">${idx + 1}</td>
                  <td><b>${e.exam || '—'}</b></td>
                  <td>${e.subject || '—'}</td>
                  <td>${e.board || '—'}</td>
                  <td style="text-align:center">${toBengaliDigits(e.year) || e.year || '—'}</td>
                  <td style="text-align:center"><b>${toBengaliDigits(e.result) || e.result || '—'}</b></td>
                </tr>
              `).join('') : `
                <tr>
                  <td style="text-align:center">১</td>
                  <td><b>স্নাতকোত্তর (মাস্টার্স)</b></td>
                  <td>${subject || 'কলা / বিজ্ঞান'}</td>
                  <td>জাতীয় বিশ্ববিদ্যালয়</td>
                  <td style="text-align:center">২০১১</td>
                  <td style="text-align:center"><b>১ম শ্রেণি / ৩.৫০</b></td>
                </tr>
                <tr>
                  <td style="text-align:center">২</td>
                  <td><b>স্নাতক (সম্মান)</b></td>
                  <td>${subject || 'কলা / বিজ্ঞান'}</td>
                  <td>জাতীয় বিশ্ববিদ্যালয়</td>
                  <td style="text-align:center">২০১০</td>
                  <td style="text-align:center"><b>২য় শ্রেণি / ৩.২৫</b></td>
                </tr>
                <tr>
                  <td style="text-align:center">৩</td>
                  <td><b>উচ্চ মাধ্যমিক (HSC)</b></td>
                  <td>বিজ্ঞান / মানবিক</td>
                  <td>ঢাকা বোর্ড</td>
                  <td style="text-align:center">২০০৬</td>
                  <td style="text-align:center"><b>৪.৫০ (A)</b></td>
                </tr>
                <tr>
                  <td style="text-align:center">৪</td>
                  <td><b>মাধ্যমিক (SSC)</b></td>
                  <td>সাধারণ</td>
                  <td>ঢাকা বোর্ড</td>
                  <td style="text-align:center">২০০৪</td>
                  <td style="text-align:center"><b>৪.৮০ (A)</b></td>
                </tr>
              `}
            </tbody>
          </table>

          <!-- Section 4: পেশাগত প্রশিক্ষণ ও কর্মশালা -->
          <div class="bio-sec-title"><span>৪. পেশাগত প্রশিক্ষণ ও কর্মশালা (Training & Workshops)</span></div>
          <table class="bio-grid-table">
            <thead>
              <tr>
                <th style="width:35px">ক্র.</th>
                <th>প্রশিক্ষণের নাম / কোর্স</th>
                <th>প্রতিষ্ঠান ও স্থান</th>
                <th>শুরুর তারিখ</th>
                <th>শেষের তারিখ</th>
                <th>স্থিতিকাল</th>
              </tr>
            </thead>
            <tbody>
              ${[...trainingList, ...inServiceList].length ? [...trainingList, ...inServiceList].map((t, idx) => `
                <tr>
                  <td style="text-align:center">${idx + 1}</td>
                  <td><b>${t.title || t.name || '—'}</b></td>
                  <td>${t.institution || t.place || '—'}</td>
                  <td style="text-align:center">${formatBnDate(t.start_date)}</td>
                  <td style="text-align:center">${formatBnDate(t.end_date)}</td>
                  <td style="text-align:center">${toBengaliDigits(t.duration) || t.duration || '—'}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td style="text-align:center">১</td>
                  <td><b>জাতীয় শিক্ষাক্রম রূপরেখা বিস্তরণ প্রশিক্ষণ</b></td>
                  <td>উপজেলা রিসোর্স সেন্টার, কালিহাতি</td>
                  <td style="text-align:center">০১-০২-২০২৪</td>
                  <td style="text-align:center">০৬-০২-২০২৪</td>
                  <td style="text-align:center">৬ দিন</td>
                </tr>
                <tr>
                  <td style="text-align:center">২</td>
                  <td><b>আইসিটি ও ডিজিটাল পেডাগোজি প্রশিক্ষণ</b></td>
                  <td>টিচার্স ট্রেনিং কলেজ (TTC), ময়মনসিংহ</td>
                  <td style="text-align:center">১০-০৫-২০২৩</td>
                  <td style="text-align:center">২৩-০৫-২০২৩</td>
                  <td style="text-align:center">১৪ দিন</td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="bio-footer-signatures">
            <div class="b-sig">
              <div class="b-sig-line"></div>
              <b>${personNameBn}</b>
              <span>সংশ্লিষ্ট শিক্ষক/কর্মচারীর স্বাক্ষর</span>
            </div>
            <div class="b-sig">
              <div class="b-sig-line"></div>
              <b>${school.headTeacher}</b>
              <span>প্রধান শিক্ষক</span>
              <span>${school.nameBn}</span>
            </div>
          </div>
        </div>
      `;
    }

    // 7. শিক্ষক ও কর্মচারী ডিজিটাল পরিচয়পত্র (Staff ID Card - Front & Back)
    if (activeTab === 'id_card') {
      return `
        <div class="staff-id-card-wrap">
          <!-- FRONT CARD -->
          <div class="staff-id-card front-card">
            <div class="staff-card-header">
              <img src="${schoolLogo}" class="staff-logo" alt="Logo">
              <div class="staff-school-meta">
                <h3 class="staff-school-bn">${school.nameBn}</h3>
                <h5 class="staff-school-en">${school.nameEn}</h5>
                <p class="staff-school-sub">EIIN: ${school.eiin} • স্থাপিত: ১৯৪৬ • কালিহাতি, টাঙ্গাইল</p>
              </div>
            </div>

            <div class="staff-card-ribbon">
              <span>TEACHER & STAFF IDENTITY CARD • শিক্ষক ও কর্মচারী পরিচয়পত্র</span>
            </div>

            <div class="staff-card-body">
              <div class="staff-photo-frame">
                <img src="${photo}" alt="${personNameBn}">
              </div>

              <div class="staff-title-wrap">
                <div class="staff-name-bn">${personNameBn}</div>
                ${personNameEn ? `<div class="staff-name-en">${personNameEn}</div>` : ''}
                <div class="staff-desig-tag">${designation} ${subject ? `(${subject})` : ''}</div>
              </div>

              <table class="staff-table">
                <tr>
                  <td class="lbl">এমপ্লয়ী আইডি</td>
                  <td class="sep">:</td>
                  <td class="val"><b>${empId}</b></td>
                </tr>
                <tr>
                  <td class="lbl">ইনডেক্স নম্বর</td>
                  <td class="sep">:</td>
                  <td class="val"><b class="index-num">${mpoIndex}</b></td>
                </tr>
                <tr>
                  <td class="lbl">মোবাইল নম্বর</td>
                  <td class="sep">:</td>
                  <td class="val"><b class="mono-phone">${phone}</b></td>
                </tr>
                <tr>
                  <td class="lbl">রক্তের গ্রুপ</td>
                  <td class="sep">:</td>
                  <td class="val"><span class="blood-pill">🩸 ${blood}</span></td>
                </tr>
              </table>
            </div>

            <div class="staff-card-footer">
              <div class="barcode-area">
                <div class="barcode-bars">|||| ||| |||| | ||| ||||</div>
                <span>${empId ? `EMP-${empId}` : 'MAGRA-STAFF'}</span>
              </div>
              <div class="sign-area">
                <div class="sign-line"></div>
                <span>প্রধান শিক্ষক</span>
              </div>
            </div>
          </div>

          <!-- BACK CARD -->
          <div class="staff-id-card back-card">
            <div class="staff-back-ribbon">
              <span>EMPLOYEE PARTICULARS • কর্মচারীর ব্যক্তিগত তথ্যাবলি</span>
            </div>

            <div class="staff-back-body">
              <table class="staff-back-table">
                <tr>
                  <td class="lbl">পিতার নাম</td>
                  <td class="sep">:</td>
                  <td class="val">${fatherName}</td>
                </tr>
                <tr>
                  <td class="lbl">মাতার নাম</td>
                  <td class="sep">:</td>
                  <td class="val">${motherName}</td>
                </tr>
                <tr>
                  <td class="lbl">জন্ম তারিখ</td>
                  <td class="sep">:</td>
                  <td class="val">${formatBnDate(person?.date_of_birth || '১৯৮৫-০১-০১')} খ্রি.</td>
                </tr>
                <tr>
                  <td class="lbl">জাতীয় পরিচয়পত্র</td>
                  <td class="sep">:</td>
                  <td class="val">${nid}</td>
                </tr>
                <tr>
                  <td class="lbl">যোগদানের তারিখ</td>
                  <td class="sep">:</td>
                  <td class="val">${formatBnDate(currentJoining)} খ্রি.</td>
                </tr>
                <tr>
                  <td class="lbl">স্থায়ী ঠিকানা</td>
                  <td class="sep">:</td>
                  <td class="val">${permanentAddress}</td>
                </tr>
              </table>

              <div class="card-instruction-note">
                <small>⚠️ এই কার্ডটি বিদ্যালয়ের সার্বক্ষণিক ব্যবহারের জন্য। কার্ডটি হারিয়ে গেলে তাৎক্ষণিক প্রধান শিক্ষক বরাবরে অবহিত করুন।</small>
              </div>
            </div>

            <div class="staff-back-footer">
              <div class="head-name">${school.headTeacher}</div>
              <div class="head-desig">প্রধান শিক্ষক${school.phone ? ` • মোবাইল: ${toBengaliDigits(school.phone)}` : ''}</div>
              <div class="inst-name">${school.nameBn}</div>
              <div class="inst-sub">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল।</div>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  };

  // Print triggered function
  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=1000,height=850');
    if (!w) {
      alert('পপআপ ব্লক রয়েছে। অনুগ্রহ করে ব্রাউজার থেকে অনুমতি দিন।');
      return;
    }

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${memoNo} - ${personNameBn}</title>
        <style>
          ${staffDocumentStyles}
          body {
            background: #ffffff;
            padding: 20px;
            margin: 0;
            display: flex;
            justify-content: center;
          }
          @media print {
            body { padding: 0; background: transparent; }
            .no-print { display: none !important; }
            .cert-card-sheet, .staff-id-card { box-shadow: none !important; border: 1px solid #475569 !important; }
            @page {
              size: ${activeTab === 'id_card' ? 'A4 portrait' : 'A4 portrait'};
              margin: 8mm 12mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${generateDocumentHtml()}
        </div>
        <script>
          window.onload = function() { window.print(); };
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
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1150px',
        maxHeight: '95vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 70%, #059669 100%)',
          color: '#ffffff', padding: '16px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9, fontWeight: 700 }}>
              OFFICIAL TEACHER & STAFF CERTIFICATE STUDIO • V120
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📜</span> শিক্ষক ও কর্মচারী প্রত্যয়ন, সনদ, ছাড়পত্র ও বায়োডাটা
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff',
              fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', transition: 'all 0.15s ease'
            }}
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0
        }}>
          {[
            ['bonafide', '📜 প্রত্যয়নপত্র'],
            ['experience', '🏆 অভিজ্ঞতার সনদ'],
            ['professional', '🎖️ পেশাগত সনদ'],
            ['continuous', '⏱️ নিরবিচ্ছিন্ন চাকুরী সনদ'],
            ['release_order', '✈️ প্রশিক্ষণ ছাড়পত্র'],
            ['biodata', '📄 আকর্ষণীয় বায়োডাটা (CV)'],
            ['id_card', '🪪 শিক্ষক পরিচয়পত্র']
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveTab(k)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700,
                border: activeTab === k ? '2px solid #047857' : '1px solid #cbd5e1',
                background: activeTab === k ? '#047857' : '#ffffff',
                color: activeTab === k ? '#ffffff' : '#334155',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Top Controls: Selector & Print */}
        <div style={{
          padding: '12px 20px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1',
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '320px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '180px', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 শিক্ষক খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              />
            </div>
            <div style={{ minWidth: '240px', flex: 1.5 }}>
              <select
                value={selectedPersonId}
                onChange={e => setSelectedPersonId(e.target.value)}
                style={{ width: '100%', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '12.5px' }}
              >
                {filteredPeople.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name_bn || p.name} ({p.designation || 'শিক্ষক'} {p.subject ? `• ${p.subject}` : ''}) - ID: {p.employee_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 4px rgba(4, 120, 87, 0.25)'
              }}
            >
              🖨️ প্রিন্ট / অফিসিয়াল PDF
            </button>
          </div>
        </div>

        {/* Modal Body: Custom Form Fields + Live Preview */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Left Panel: Contextual Customization Controls */}
          <div style={{ width: '310px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 700, color: '#047857' }}>⚙️ ডকুমেন্টের সাধারণ তথ্য</h4>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>স্মারক নংঃ</label>
                <input
                  type="text"
                  placeholder="স্মারক নং (ঐচ্ছিক)"
                  value={customMemoNo}
                  onChange={e => setCustomMemoNo(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>ইস্যুর তারিখ</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>মূল্যায়ন ও চরিত্র সনদ মন্তব্য</label>
                <input
                  type="text"
                  value={conductAppraisal}
                  onChange={e => setConductAppraisal(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* If Training Release Order, show full customizable training inputs as requested */}
            {activeTab === 'release_order' && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 700, color: '#166534' }}>✈️ প্রশিক্ষণ ছাড়পত্রের তথ্য (আবশ্যক)</h4>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '3px' }}>ট্রেনিং এর বিষয় *</label>
                  <textarea
                    rows={2}
                    value={trainingSubject}
                    onChange={e => setTrainingSubject(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #86efac', fontSize: '12px', resize: 'vertical' }}
                    placeholder="যেমন: নতুন জাতীয় শিক্ষাক্রম বিস্তরণ ও বিষয়ভিত্তিক শ্রেণি মূল্যায়ন প্রশিক্ষণ"
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '3px' }}>প্রশিক্ষণ প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    value={trainingInstitute}
                    onChange={e => setTrainingInstitute(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #86efac', fontSize: '12px' }}
                    placeholder="যেমন: সরকারি টিচার্স ট্রেনিং কলেজ (TTC), ময়মনসিংহ"
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '3px' }}>প্রতিষ্ঠানের ঠিকানা *</label>
                  <input
                    type="text"
                    value={trainingLocation}
                    onChange={e => setTrainingLocation(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #86efac', fontSize: '12px' }}
                    placeholder="যেমন: কালিহাতি, টাঙ্গাইল"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '2px' }}>শুরুর তারিখ *</label>
                    <input
                      type="date"
                      value={trainingStartDate}
                      onChange={e => setTrainingStartDate(e.target.value)}
                      style={{ width: '100%', padding: '5px 6px', borderRadius: '5px', border: '1px solid #86efac', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '2px' }}>শেষের তারিখ *</label>
                    <input
                      type="date"
                      value={trainingEndDate}
                      onChange={e => setTrainingEndDate(e.target.value)}
                      style={{ width: '100%', padding: '5px 6px', borderRadius: '5px', border: '1px solid #86efac', fontSize: '11px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '3px' }}>প্রশিক্ষণ স্থিতিকাল</label>
                  <input
                    type="text"
                    value={trainingDurationText}
                    onChange={e => setTrainingDurationText(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #86efac', fontSize: '12px' }}
                    placeholder="যেমন: ৬ দিনব্যাপী / ১৪ দিনব্যাপী"
                  />
                </div>
              </div>
            )}

            {/* If Continuous Service, show continuous service remark */}
            {activeTab === 'continuous' && (
              <div style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 700, color: '#86198f' }}>⏱️ নিরবিচ্ছিন্ন চাকুরীর মন্তব্য</h4>
                <textarea
                  rows={3}
                  value={continuousServiceRemarks}
                  onChange={e => setContinuousServiceRemarks(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #f0abfc', fontSize: '12px', resize: 'vertical' }}
                />
              </div>
            )}

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#1e40af' }}>
              💡 <b>অফিশিয়াল পরামর্শ:</b> "প্রিন্ট / অফিসিয়াল PDF" বাটনে ক্লিক করলে সিলমোহর ও স্বাক্ষরের জন্য সুনির্দিষ্ট জায়গা সহ A4 সাইজের প্রিন্ট রেডি কপি পাওয়া যাবে।
            </div>
          </div>

          {/* Right Panel: Live Document Preview */}
          <div style={{ flex: 1, minWidth: '340px', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <div
              className="live-document-preview-box"
              style={{ width: '100%', maxWidth: activeTab === 'id_card' ? '700px' : '760px' }}
              dangerouslySetInnerHTML={{
                __html: `
                  <style>${staffDocumentStyles}</style>
                  ${generateDocumentHtml()}
                `
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
            {school.nameBn} • শিক্ষক ও কর্মচারী অফিশিয়াল ডকুমেন্ট ম্যানেজমেন্ট পোর্টাল
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 18px', borderRadius: '6px', border: '1px solid #cbd5e1',
              background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer'
            }}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

export const staffDocumentStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Outfit:wght@400;600;700&display=swap');

  * { box-sizing: border-box; }

  /* CERTIFICATE SHEETS */
  .cert-card-sheet {
    background: #ffffff;
    border: 2px solid #064e3b;
    border-radius: 8px;
    padding: 12px;
    font-family: 'Noto Sans Bengali', Arial, sans-serif;
    color: #0f172a;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    position: relative;
    box-sizing: border-box;
  }

  .cert-inner-border {
    border: 1.5px solid #047857;
    padding: 24px 28px 20px;
    border-radius: 6px;
    position: relative;
  }

  .doc-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    border-bottom: 2px solid #064e3b;
    padding-bottom: 12px;
    text-align: center;
  }

  .doc-logo {
    width: 68px;
    height: 68px;
    object-fit: contain;
    border-radius: 50%;
  }

  .doc-school-meta h1.school-name-title {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: #064e3b;
    line-height: 1.2;
  }

  .doc-school-meta h3.school-name-en-title {
    margin: 2px 0 0;
    font-size: 13.5px;
    font-family: 'Outfit', sans-serif;
    color: #0284c7;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .school-sub-info {
    margin: 3px 0 0;
    font-size: 11.5px;
    color: #334155;
    font-weight: 600;
  }

  .school-contact-info {
    margin: 2px 0 0;
    font-size: 10.5px;
    color: #64748b;
  }

  .doc-meta-row {
    display: flex;
    justify-content: space-between;
    margin: 12px 0 16px;
    font-size: 12.5px;
    font-weight: 600;
    color: #1e293b;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 6px;
  }

  .doc-title-banner {
    text-align: center;
    margin: 16px auto 20px;
    max-width: 440px;
  }

  .doc-title-banner h2 {
    margin: 0;
    font-size: 21px;
    font-weight: 900;
    color: #ffffff;
    background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
    padding: 6px 20px;
    border-radius: 30px;
    display: inline-block;
    box-shadow: 0 3px 6px rgba(4, 120, 87, 0.25);
  }

  .doc-title-banner .sub-title-en {
    display: block;
    margin-top: 5px;
    font-size: 10px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    color: #047857;
    letter-spacing: 0.8px;
  }

  .doc-body-text {
    line-height: 1.85;
    font-size: 14px;
    text-align: justify;
    color: #1e293b;
  }

  .doc-para {
    margin: 0 0 12px;
    text-indent: 28px;
  }

  .closing-para {
    margin-top: 14px;
  }

  .service-table-wrap {
    margin: 14px 0;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    overflow: hidden;
  }

  .cert-info-grid {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
  }

  .cert-info-grid td {
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
  }

  .cert-info-grid td.col-lbl {
    background: #f8fafc;
    font-weight: 700;
    color: #475569;
    width: 25%;
  }

  .cert-info-grid td.col-val {
    color: #0f172a;
    width: 25%;
  }

  /* Training Release Order Box */
  .training-highlight-box {
    background: #f0fdf4;
    border: 1.5px solid #86efac;
    border-radius: 8px;
    padding: 12px 14px;
    margin: 14px 0;
  }

  .training-details-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .training-details-table td {
    padding: 5px 4px;
    vertical-align: top;
  }

  .training-details-table td.t-lbl {
    width: 210px;
    font-weight: 700;
    color: #166534;
  }

  .training-details-table td.t-val {
    color: #0f172a;
  }

  .t-title {
    color: #065f46;
    font-size: 13.5px;
  }

  .conditions-box {
    background: #fafaf9;
    border-left: 3px solid #047857;
    padding: 8px 14px;
    font-size: 11.5px;
    margin: 12px 0;
    color: #334155;
  }

  .conditions-box ol {
    margin: 4px 0 0 16px;
    padding: 0;
  }

  .conditions-box li {
    margin-bottom: 2px;
  }

  .copy-forward-box {
    margin-top: 25px;
    padding-top: 10px;
    border-top: 1px dashed #cbd5e1;
    font-size: 10.5px;
    color: #475569;
    line-height: 1.5;
  }

  .doc-sign-area {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 48px;
    page-break-inside: avoid;
  }

  .sign-block {
    text-align: center;
    width: 170px;
    font-size: 12px;
    color: #0f172a;
  }

  .sign-block.seal-space {
    width: 140px;
  }

  .official-seal-box {
    border: 1.5px dashed #94a3b8;
    border-radius: 50%;
    width: 85px;
    height: 85px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
  }

  .sign-line {
    border-top: 1.5px dashed #0f172a;
    margin-bottom: 4px;
  }

  .sign-block span {
    display: block;
    font-size: 11px;
    color: #475569;
  }

  /* BIODATA STYLES */
  .biodata-sheet {
    padding: 24px 28px;
  }

  .bio-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #064e3b;
    padding-bottom: 12px;
  }

  .bio-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bio-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    border-radius: 50%;
  }

  .bio-header-left h2 {
    margin: 0;
    font-size: 20px;
    color: #064e3b;
    font-weight: 800;
  }

  .bio-header-left h4 {
    margin: 2px 0 0;
    font-size: 12px;
    color: #0284c7;
    font-family: 'Outfit', sans-serif;
  }

  .bio-header-left p {
    margin: 2px 0 0;
    font-size: 10.5px;
    color: #64748b;
  }

  .bio-tag-box {
    text-align: right;
  }

  .bio-tag-box span {
    display: block;
    font-size: 11px;
    color: #047857;
    font-weight: 700;
  }

  .bio-tag-box b {
    font-size: 17px;
    color: #0f172a;
    letter-spacing: 1px;
    font-family: 'Outfit', sans-serif;
  }

  .bio-profile-banner {
    display: flex;
    gap: 20px;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 18px;
    margin: 16px 0;
  }

  .bio-photo-frame {
    width: 110px;
    height: 130px;
    border-radius: 8px;
    border: 2px solid #047857;
    overflow: hidden;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  .bio-photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .bio-primary-meta {
    flex: 1;
  }

  .bio-name-bn {
    margin: 0;
    font-size: 22px;
    color: #064e3b;
    font-weight: 900;
  }

  .bio-name-en {
    margin: 2px 0 0;
    font-size: 13px;
    color: #0284c7;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
  }

  .bio-designation-badge {
    margin: 5px 0 8px;
    display: inline-block;
    background: #dcfce7;
    color: #166534;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 700;
  }

  .bio-quick-specs {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: #475569;
    flex-wrap: wrap;
  }

  .bio-sec-title {
    margin: 18px 0 8px;
    background: #f1f5f9;
    padding: 5px 10px;
    border-left: 4px solid #047857;
    font-size: 13.5px;
    font-weight: 800;
    color: #0f172a;
  }

  .bio-details-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  .bio-details-table td {
    padding: 4px 6px;
    vertical-align: top;
  }

  .bio-details-table td.b-lbl {
    width: 130px;
    font-weight: 700;
    color: #475569;
  }

  .bio-details-table td.b-sep {
    width: 10px;
    text-align: center;
    font-weight: 700;
  }

  .bio-details-table td.b-val {
    color: #0f172a;
  }

  .bio-grid-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 4px;
  }

  .bio-grid-table th, .bio-grid-table td {
    border: 1px solid #cbd5e1;
    padding: 5px 8px;
  }

  .bio-grid-table th {
    background: #f8fafc;
    color: #334155;
    font-weight: 700;
    text-align: left;
  }

  .bio-footer-signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 45px;
    page-break-inside: avoid;
  }

  .b-sig {
    text-align: center;
    width: 180px;
    font-size: 12px;
  }

  .b-sig-line {
    border-top: 1.5px dashed #334155;
    margin-bottom: 4px;
  }

  .b-sig span {
    display: block;
    font-size: 11px;
    color: #64748b;
  }

  /* STAFF ID CARD (CR-80 Format) */
  .staff-id-card-wrap {
    display: flex;
    gap: 20px;
    justify-content: center;
    font-family: 'Noto Sans Bengali', Arial, sans-serif;
  }

  .staff-id-card {
    width: 335px;
    height: 525px;
    max-height: 525px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  }

  .staff-card-header {
    background: linear-gradient(135deg, #064e3b 0%, #047857 70%, #059669 100%);
    color: #ffffff;
    padding: 8px 10px 7px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #fbbf24;
  }

  .staff-logo {
    width: 58px;
    height: 58px;
    object-fit: contain;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .staff-school-meta {
    flex: 1;
    text-align: center;
  }

  .staff-school-bn {
    margin: 0;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.25;
  }

  .staff-school-en {
    margin: 1.5px 0 0;
    font-size: 9.5px;
    font-family: 'Outfit', sans-serif;
    color: #fef08a;
  }

  .staff-school-sub {
    margin: 2px 0 0;
    font-size: 8.5px;
    color: #d1fae5;
  }

  .staff-card-ribbon {
    background: #0f172a;
    color: #38bdf8;
    text-align: center;
    font-size: 11px;
    font-weight: 800;
    padding: 3.5px 4px;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #334155;
  }

  .staff-card-body {
    flex: 1;
    padding: 8px 14px 6px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }

  .staff-photo-frame {
    width: 140px;
    height: 168px;
    border-radius: 9px;
    border: 2.5px solid #047857;
    overflow: hidden;
    background: #f1f5f9;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }

  .staff-photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .staff-title-wrap {
    text-align: center;
    margin: 4px 0 2px;
  }

  .staff-name-bn {
    font-size: 21px;
    font-weight: 900;
    color: #064e3b;
    line-height: 1.2;
  }

  .staff-name-en {
    font-size: 11px;
    font-family: 'Outfit', sans-serif;
    color: #0284c7;
    font-weight: 700;
  }

  .staff-desig-tag {
    margin-top: 3px;
    background: #ecfdf5;
    color: #047857;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 800;
    border: 1px solid #a7f3d0;
    display: inline-block;
  }

  .staff-table {
    width: 100%;
    max-width: 295px;
    font-size: 12px;
    border-collapse: collapse;
    margin-top: 2px;
  }

  .staff-table td {
    padding: 4px 3px;
  }

  .staff-table td.lbl {
    width: 100px;
    color: #475569;
    font-weight: 700;
  }

  .staff-table td.sep {
    width: 10px;
    text-align: center;
    font-weight: 700;
    color: #64748b;
  }

  .staff-table td.val {
    font-weight: 600;
    color: #0f172a;
  }

  .index-num {
    color: #b91c1c;
    font-size: 12.5px;
  }

  .mono-phone {
    font-family: monospace;
    font-size: 12px;
    color: #0369a1;
  }

  .blood-pill {
    background: #fef2f2;
    border: 1px solid #f87171;
    color: #b91c1c;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 800;
  }

  .staff-card-footer {
    padding: 6px 14px 6px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .barcode-area {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .barcode-bars {
    font-family: monospace;
    letter-spacing: 2px;
    font-weight: 900;
    font-size: 13px;
    color: #1e293b;
    line-height: 1;
  }

  .barcode-area span {
    font-size: 8px;
    font-family: monospace;
    color: #64748b;
  }

  .sign-area {
    text-align: center;
    width: 80px;
  }

  .sign-area .sign-line {
    border-top: 1px dashed #334155;
    margin-bottom: 2px;
  }

  .sign-area span {
    font-size: 9px;
    font-weight: 700;
    color: #047857;
  }

  /* Back Card */
  .staff-id-card.back-card {
    background: #fafaf9;
  }

  .staff-back-ribbon {
    background: #0f172a;
    color: #fde047;
    font-size: 11px;
    font-weight: 800;
    padding: 4px;
    text-align: center;
    border-bottom: 1.5px solid #fbbf24;
  }

  .staff-back-body {
    flex: 1;
    padding: 12px 16px 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .staff-back-table {
    width: 100%;
    font-size: 11.5px;
    border-collapse: collapse;
  }

  .staff-back-table tr {
    border-bottom: 1px dashed #e2e8f0;
  }

  .staff-back-table tr:last-child {
    border-bottom: none;
  }

  .staff-back-table td {
    padding: 6px 3px;
  }

  .staff-back-table td.lbl {
    width: 95px;
    color: #475569;
    font-weight: 700;
  }

  .staff-back-table td.sep {
    width: 10px;
    text-align: center;
    font-weight: 700;
    color: #64748b;
  }

  .card-instruction-note {
    background: #f1f5f9;
    border-radius: 6px;
    padding: 8px;
    font-size: 10px;
    color: #475569;
    line-height: 1.4;
    text-align: center;
  }

  .staff-back-footer {
    background: linear-gradient(135deg, #064e3b 0%, #047857 70%, #059669 100%);
    color: #ffffff;
    padding: 8px 10px 7px;
    border-top: 2px solid #fbbf24;
    text-align: center;
  }

  .staff-back-footer .head-name {
    font-size: 12px;
    font-weight: 800;
  }

  .staff-back-footer .head-desig {
    font-size: 10.5px;
    color: #fef08a;
  }

  .staff-back-footer .inst-name {
    font-size: 11px;
    font-weight: 800;
    margin-top: 2px;
  }

  .staff-back-footer .inst-sub {
    font-size: 8.5px;
    color: #d1fae5;
  }

  .badge-active {
    background: #dcfce7;
    color: #166534;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }

  .highlight-code {
    color: #b91c1c;
    font-size: 13px;
  }

  .mono {
    font-family: monospace;
    font-size: 12px;
  }
`;
