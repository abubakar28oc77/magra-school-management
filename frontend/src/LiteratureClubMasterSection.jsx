import React, { useState, useEffect, useRef } from 'react';
import {
  MOCK_TEACHERS,
  PHOTO_HEAD_TEACHER,
  PHOTO_PRESIDENT,
  getTeacherPhoto,
  getLeadershipData
} from './mockData';
import { ClubCompetitionEngine } from './ClubCompetitionEngine';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

import {
  LIT_PANEL_KEY,
  LIT_EXEC_KEY,
  LIT_MEMBERSHIPS_KEY,
  LIT_SUBMISSIONS_KEY,
  DEFAULT_PANEL,
  DEFAULT_EXEC,
  DEFAULT_KISHALAYA_ITEMS
} from './clubs/literature/literatureData';

export function LiteratureClubMasterSection({
  teachers = [],
  dynamicContent = [],
  onBackToHub,
  initialTab = 'identity'
}) {
  const mapInitialTab = (tab) => {
    if (!tab) return 'identity';
    if (tab === 'overview') return 'identity';
    if (tab === 'advisors') return 'coordinators';
    if (tab === 'competitions') return 'competitions';
    if (tab === 'kisholoy') return 'showcase';
    if (tab === 'calendar') return 'programs';
    if (tab === 'gallery') return 'achievements';
    if (tab === 'apply') return 'membership';
    if (tab === 'write') return 'submission';
    return tab;
  };

  // Active feature tab: default 'identity' (ক্লাব পরিচিতি)
  const [litTab, setLitTab] = useState(() => mapInitialTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setLitTab(mapInitialTab(initialTab));
    }
  }, [initialTab]);

  // Teachers Fallback
  const activeTeachers = teachers && teachers.length ? teachers : MOCK_TEACHERS;

  // Teacher Photo Resolver (pulls direct raster photo from teacher entry form or IDB custom vault)
  const getResolvedTeacherPhoto = (teacherId, teacherName) => {
    if (!activeTeachers || !activeTeachers.length) return getTeacherPhoto(null);
    let found = null;
    if (teacherId) {
      found = activeTeachers.find(t =>
        t && (
          String(t.id) === String(teacherId) ||
          String(t.teacher_id) === String(teacherId) ||
          String(t.employee_id) === String(teacherId)
        )
      );
    }
    if (!found && teacherName) {
      const cleanName = String(teacherName).trim().toLowerCase();
      found = activeTeachers.find(t => {
        if (!t) return false;
        const bn = (t.name_bn || '').trim().toLowerCase();
        const en = (t.name_en || t.name || '').trim().toLowerCase();
        return bn === cleanName || en === cleanName || cleanName.includes(bn) || (bn && bn.includes(cleanName));
      });
    }
    if (!found && typeof teacherId === 'object' && teacherId !== null) {
      found = teacherId;
    }
    return getTeacherPhoto(found);
  };

  const leadershipInfo = getLeadershipData(undefined, activeTeachers);
  const resolvedPresidentPhoto = leadershipInfo.president?.photo || PHOTO_PRESIDENT;
  const resolvedHeadPhoto = leadershipInfo.head?.photo || PHOTO_HEAD_TEACHER;

  // Panel State (Coordinators & Judges)
  const [panelData, setPanelData] = useState(() => {
    try {
      const raw = localStorage.getItem(LIT_PANEL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_PANEL;
  });

  // Executive Committee State
  const [execData, setExecData] = useState(() => {
    try {
      const raw = localStorage.getItem(LIT_EXEC_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_EXEC;
  });

  // Coordinator Add Form
  const [newCoordTeacherId, setNewCoordTeacherId] = useState(activeTeachers[0]?.id || activeTeachers[0]?.employee_id || 'T01');
  const [newCoordRole, setNewCoordRole] = useState('সহকারী সমন্বয়ক (বাংলা সাহিত্য)');

  // Member Add Form (Executive)
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberClass, setNewMemberClass] = useState('৮ম');
  const [newMemberSection, setNewMemberSection] = useState('শাখা ক');
  const [newMemberRoll, setNewMemberRoll] = useState('');

  // Editing Executive Post Modal
  const [editingExecPost, setEditingExecPost] = useState(null); // 'president' | 'vicePresident' etc.
  const [execEditForm, setExecEditForm] = useState({ name: '', class: '', section: '', roll: '', phone: '' });

  // Editing General Executive Member Modal
  const [editingExecMember, setEditingExecMember] = useState(null);
  const [memberEditForm, setMemberEditForm] = useState({ id: '', name: '', class: '', section: '', roll: '' });

  const getSectionOptionsForClass = (cls) => {
    const isNineOrTen = cls === '৯' || cls === '১০' || cls === '৯ম' || cls === '১০ম';
    if (isNineOrTen) {
      return [
        { value: 'বিজ্ঞান', label: 'বিজ্ঞান (Science)' },
        { value: 'মানবিক', label: 'মানবিক (Humanities)' },
        { value: 'ব্যবসায় শিক্ষা', label: 'ব্যবসায় শিক্ষা (Business Studies)' },
        { value: 'শাখা ক', label: 'শাখা ক' },
        { value: 'শাখা খ', label: 'শাখা খ' }
      ];
    }
    return [
      { value: 'শাখা ক', label: 'শাখা ‘ক’' },
      { value: 'শাখা খ', label: 'শাখা ‘খ’' },
      { value: 'সাধারণ', label: 'সাধারণ / প্রযোজ্য নয়' }
    ];
  };

  const handleMemberClassChange = (cls) => {
    setNewMemberClass(cls);
    if (cls === '৯ম' || cls === '১০ম') {
      if (!['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'].includes(newMemberSection)) {
        setNewMemberSection('বিজ্ঞান');
      }
    } else {
      if (!['শাখা ক', 'শাখা খ', 'সাধারণ'].includes(newMemberSection)) {
        setNewMemberSection('শাখা ক');
      }
    }
  };

  // Membership Application Form State
  const [memberForm, setMemberForm] = useState({
    student_name: '',
    class_name: '৯',
    roll_no: '',
    department: 'বিজ্ঞান',
    mobile: '',
    interests: 'কবিতা ও দেয়াল পত্রিকা'
  });
  const [memberReceipt, setMemberReceipt] = useState(null);

  // Writing Submission Form State
  const [writeForm, setWriteForm] = useState({
    student_name: '',
    class_name: '৯',
    section: 'বিজ্ঞান',
    department: 'বিজ্ঞান',
    roll_no: '',
    mobile: '',
    type: 'poem',
    title: '',
    content: '',
    file_name: '',
    file_size: '',
    file_type: '',
    file_data: ''
  });
  const [writeReceipt, setWriteReceipt] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const writeFileInputRef = useRef(null);

  // Kishalaya Wall Magazine State
  const [readingItem, setReadingItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Save Panel Data
  const persistPanel = (data) => {
    try {
      localStorage.setItem(LIT_PANEL_KEY, JSON.stringify(data));
      setToastMsg('সমন্বয়ক ও বিচারক প্যানেলের তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch {}
  };

  // Save Exec Data
  const persistExec = (data) => {
    try {
      localStorage.setItem(LIT_EXEC_KEY, JSON.stringify(data));
      setToastMsg('কার্যনির্বাহী পরিষদের তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch {}
  };

  // Add Coordinator
  const handleAddCoordinator = (e) => {
    e.preventDefault();
    const t = activeTeachers.find(x => (x.id === newCoordTeacherId || x.employee_id === newCoordTeacherId)) || activeTeachers[0];
    const newCoord = {
      id: 'coord-' + Date.now(),
      teacherId: t.id || t.employee_id,
      name: t.name_bn || t.name_en,
      designation: t.designation || 'সহকারী শিক্ষক',
      role: newCoordRole.trim() || 'ক্লাব সমন্বয়ক',
      phone: t.phone || '—'
    };
    const updated = {
      ...panelData,
      coordinators: [...(panelData.coordinators || []), newCoord]
    };
    setPanelData(updated);
    persistPanel(updated);
  };

  // Remove Coordinator
  const handleRemoveCoordinator = (id) => {
    if (!window.confirm('আপনি কি এই সমন্বয়ককে তালিকা থেকে অপসারণ করতে চান?')) return;
    const updated = {
      ...panelData,
      coordinators: (panelData.coordinators || []).filter(c => c.id !== id)
    };
    setPanelData(updated);
    persistPanel(updated);
  };

  // Change Judge
  const handleChangeJudge = (slot, teacherId) => {
    const t = activeTeachers.find(x => (x.id === teacherId || x.employee_id === teacherId)) || activeTeachers[0];
    const updated = {
      ...panelData,
      [slot]: {
        teacherId: t.id || t.employee_id,
        name: t.name_bn || t.name_en,
        designation: t.designation || 'সহকারী শিক্ষক',
        role: slot === 'chiefJudge' ? 'প্রধান বিচারক (ভাষা ও সাহিত্য)' : slot === 'judge1' ? 'বিচারক (১ম)' : 'বিচারক (২য়)'
      }
    };
    setPanelData(updated);
    persistPanel(updated);
  };

  // Add Executive Member
  const handleAddExecMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newM = {
      id: 'm-' + Date.now(),
      name: newMemberName.trim(),
      class: newMemberClass,
      section: newMemberSection,
      roll: newMemberRoll.trim() || '—',
      note: 'কার্যনির্বাহী সদস্য'
    };
    const updated = {
      ...execData,
      members: [...(execData.members || []), newM]
    };
    setExecData(updated);
    persistExec(updated);
    setNewMemberName('');
    setNewMemberRoll('');
    setToastMsg(`সদস্য "${newM.name}" সফলভাবে যুক্ত হয়েছে!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Remove Exec Member
  const handleRemoveExecMember = (id) => {
    if (!window.confirm('আপনি কি এই কার্যনির্বাহী সদস্যকে অপসারণ করতে চান?')) return;
    const updated = {
      ...execData,
      members: (execData.members || []).filter(m => m.id !== id)
    };
    setExecData(updated);
    persistExec(updated);
    setToastMsg('কার্যনির্বাহী সদস্য অপসারিত হয়েছে!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Start Edit Member
  const handleStartEditMember = (m) => {
    setEditingExecMember(m);
    const mClass = m.class || '৮ম';
    const defaultSec = (mClass === '৯ম' || mClass === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
    setMemberEditForm({
      id: m.id,
      name: m.name || '',
      class: mClass,
      section: m.section || defaultSec,
      roll: m.roll || ''
    });
  };

  // Save Edit Member
  const handleSaveMemberEdit = (e) => {
    e.preventDefault();
    if (!editingExecMember) return;
    const updatedMembers = (execData.members || []).map(m => {
      if (m.id === editingExecMember.id) {
        return {
          ...m,
          name: memberEditForm.name.trim(),
          class: memberEditForm.class,
          section: memberEditForm.section,
          roll: memberEditForm.roll.trim() || '—'
        };
      }
      return m;
    });
    const updated = {
      ...execData,
      members: updatedMembers
    };
    setExecData(updated);
    persistExec(updated);
    setEditingExecMember(null);
    setToastMsg(`সদস্য "${memberEditForm.name.trim()}"-এর তথ্য সফলভাবে আপডেট হয়েছে!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Start Edit Post
  const handleStartEditPost = (postKey, current) => {
    setEditingExecPost(postKey);
    const postClass = current.class || '১০ম';
    const defaultSec = (postClass === '৯ম' || postClass === '১০ম') ? 'বিজ্ঞান' : 'শাখা ক';
    setExecEditForm({
      name: current.name || '',
      class: postClass,
      section: current.section || defaultSec,
      roll: current.roll || '',
      phone: current.phone || ''
    });
  };

  // Save Edit Post
  const handleSavePostEdit = (e) => {
    e.preventDefault();
    if (!editingExecPost) return;
    const updated = {
      ...execData,
      [editingExecPost]: {
        ...execData[editingExecPost],
        name: execEditForm.name.trim(),
        class: execEditForm.class.trim(),
        section: execEditForm.section.trim(),
        roll: execEditForm.roll.trim(),
        phone: execEditForm.phone.trim()
      }
    };
    setExecData(updated);
    persistExec(updated);
    setEditingExecPost(null);
    setToastMsg('পদাধিকারীর তথ্য সফলভাবে আপডেট করা হয়েছে!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Handle Membership Application Submit
  const handleMemberSubmit = (e) => {
    e.preventDefault();
    const receipt = {
      tracking_id: 'LIT-MEM-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('bn-BD'),
      ...memberForm
    };
    try {
      const existing = JSON.parse(localStorage.getItem(LIT_MEMBERSHIPS_KEY) || '[]');
      existing.unshift(receipt);
      localStorage.setItem(LIT_MEMBERSHIPS_KEY, JSON.stringify(existing));
    } catch {}
    setMemberReceipt(receipt);
    setToastMsg('সদস্যপদের আবেদন সফলভাবে গৃহীত হয়েছে!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleWriteClassChange = (cls) => {
    const isNineOrTen = cls === '৯' || cls === '১০' || cls === '৯ম' || cls === '১০ম';
    let newSec = writeForm.section;
    if (isNineOrTen) {
      if (!['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা', 'শাখা ক', 'শাখা খ'].includes(newSec)) {
        newSec = 'বিজ্ঞান';
      }
    } else {
      if (!['শাখা ক', 'শাখা খ', 'সাধারণ'].includes(newSec)) {
        newSec = 'শাখা ক';
      }
    }
    setWriteForm(prev => ({
      ...prev,
      class_name: cls,
      section: newSec,
      department: newSec
    }));
  };

  const handleFileProcess = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('ফাইলের সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }
    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';

    if (file.name.endsWith('.txt') || file.type === 'text/plain') {
      const textReader = new FileReader();
      textReader.onload = (ev) => {
        const textContent = ev.target?.result;
        if (typeof textContent === 'string' && !writeForm.content.trim()) {
          setWriteForm(prev => ({
            ...prev,
            content: textContent,
            file_name: file.name,
            file_size: formattedSize,
            file_type: file.type || 'text/plain',
            file_data: textContent
          }));
          setToastMsg(`✓ "${file.name}" টেক্সট ফাইল আপলোড ও মূল লেখায় যুক্ত হয়েছে!`);
          setTimeout(() => setToastMsg(''), 3500);
          return;
        }
      };
      textReader.readAsText(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      setWriteForm(prev => ({
        ...prev,
        file_name: file.name,
        file_size: formattedSize,
        file_type: file.type || 'document',
        file_data: typeof result === 'string' ? result : ''
      }));
      setToastMsg(`✓ "${file.name}" ফাইলটি সফলভাবে সংযুক্ত হয়েছে!`);
      setTimeout(() => setToastMsg(''), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setWriteForm(prev => ({
      ...prev,
      file_name: '',
      file_size: '',
      file_type: '',
      file_data: ''
    }));
    if (writeFileInputRef.current) {
      writeFileInputRef.current.value = '';
    }
  };

  // Handle Writing Submit
  const handleWriteSubmit = (e) => {
    e.preventDefault();
    if (!writeForm.content.trim() && !writeForm.file_name) {
      alert('অনুগ্রহ করে লেখার মূল বিষয়বস্তু টাইপ করুন অথবা ফাইল/ছবি আপলোড করুন।');
      return;
    }
    const receipt = {
      tracking_id: 'LIT-WRITE-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('bn-BD'),
      ...writeForm,
      section: writeForm.section || 'বিজ্ঞান',
      department: writeForm.section || 'বিজ্ঞান'
    };
    try {
      const existing = JSON.parse(localStorage.getItem(LIT_SUBMISSIONS_KEY) || '[]');
      existing.unshift(receipt);
      localStorage.setItem(LIT_SUBMISSIONS_KEY, JSON.stringify(existing));
    } catch {}
    setWriteReceipt(receipt);
    setToastMsg('লেখা সফলভাবে কিশলয় প্রকাশনা বিভাগে জমা হয়েছে!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Demo fillers
  const fillMemberDemo = () => {
    setMemberForm({
      student_name: 'ফাতেমা আক্তার',
      class_name: '৯',
      roll_no: '২',
      department: 'বিজ্ঞান',
      mobile: '01712-998877',
      interests: 'স্বরচিত কবিতা, প্রমিত বাচন ও দেয়াল পত্রিকা'
    });
  };

  const fillWriteDemo = () => {
    setWriteForm({
      student_name: 'ফারজানা মেহজাবীন',
      class_name: '৯',
      section: 'বিজ্ঞান',
      department: 'বিজ্ঞান',
      roll_no: '৩',
      mobile: '01715-443322',
      type: 'poem',
      title: 'শব্দের খেয়ায় পদ্মা পার',
      content: `কুয়াশা ভেজা নদীর চরে রোদ উঠেছে সোনালী,
মাঠের বুকে দুলছে যেন সবুজ পাতার অঞ্জলি।
বর্ণমালার হাতটি ধরে হাটছি মোরা বহুদূর,
বাংলা ভাষার দোলায় বাজে আনন্দেরই সুর।`,
      file_name: 'shobder_kheyay_podma_par.docx',
      file_size: '28.4 KB',
      file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_data: ''
    });
  };

  // Official Pad Print: Coordinators & Judges
  const handlePrintPanelPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const coords = (panelData.coordinators || []).map((c, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td><b>${c.name}</b><br><small style="color:#64748b;">${c.designation}</small></td>
        <td style="color:#047857;font-weight:700;">${c.role}</td>
        <td style="text-align:center;">${c.phone}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সমন্বয়ক ও বিচারক প্যানেল — ভাষা ও সাহিত্য ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #94a3b8; padding: 7px 10px; text-align: left; vertical-align: middle; }
          th { background: #f0fdf4; color: #166534; font-weight: 800; }
          .sig-grid { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">📚 ভাষা ও সাহিত্য ক্লাব</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">সমন্বয়ক পরিষদ ও স্থায়ী বিচারক প্যানেল</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <h3 style="font-size:14px; color:#166534; margin:16px 0 6px 0;">👨‍🏫 সম্মানিত সমন্বয়কমণ্ডলী</h3>
        <table>
          <thead>
            <tr>
              <th style="width:36px; text-align:center;">ক্র.</th>
              <th>শিক্ষকের নাম ও মূল পদবী</th>
              <th>ক্লাবে অর্পিত সমন্বয়ক দায়িত্ব</th>
              <th style="width:110px; text-align:center;">যোগাযোগ</th>
            </tr>
          </thead>
          <tbody>
            ${coords}
          </tbody>
        </table>

        <h3 style="font-size:14px; color:#1e1b4b; margin:20px 0 6px 0;">⚖️ সাহিত্য প্রতিযোগিতা বিচারক প্যানেল (৩ সদস্য)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:100px;">প্যানেল পদবী</th>
              <th>শিক্ষকের নাম</th>
              <th>মূল পদবী</th>
              <th>দায়িত্বের ক্ষেত্র</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight:800; color:#1e1b4b;">প্রধান বিচারক</td>
              <td><b>${panelData.chiefJudge?.name}</b></td>
              <td>${panelData.chiefJudge?.designation}</td>
              <td>চূড়ান্ত ফলাফল ও বিচারিক দিকনির্দেশনা</td>
            </tr>
            <tr>
              <td style="font-weight:800; color:#047857;">বিচারক (১ম)</td>
              <td><b>${panelData.judge1?.name}</b></td>
              <td>${panelData.judge1?.designation}</td>
              <td>কবিতা, আবৃত্তি ও ব্যাকরণ মূল্যায়ন</td>
            </tr>
            <tr>
              <td style="font-weight:800; color:#b45309;">বিচারক (২য়)</td>
              <td><b>${panelData.judge2?.name}</b></td>
              <td>${panelData.judge2?.designation}</td>
              <td>রচনাশৈলী, শব্দভাণ্ডার ও উপস্থাপন</td>
            </tr>
          </tbody>
        </table>

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>নেয়ামুল হক খান</b><br>
            <span>সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ</span>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // Official Pad Print: Executive Committee
  const handlePrintExecPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const posts = [
      { role: 'সভাপতি', ...execData.president },
      { role: 'সহ-সভাপতি', ...execData.vicePresident },
      { role: 'সাধারণ সম্পাদক', ...execData.generalSecretary },
      { role: 'যুগ্ম সম্পাদক', ...execData.jointSecretary },
      { role: 'সাংগঠনিক সম্পাদক', ...execData.organizingSecretary },
      { role: 'প্রচার ও প্রকাশনা সম্পাদক', ...execData.publicitySecretary },
      { role: 'অর্থ সম্পাদক', ...execData.financeSecretary }
    ];

    const postRows = posts.map((p, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:800;color:#065f46;">${p.role}</td>
        <td><b>${p.name || '—'}</b></td>
        <td style="text-align:center;">${p.class || '—'}</td>
        <td style="text-align:center;">${p.section || '—'}</td>
        <td style="text-align:center;">${toBn(p.roll || '—')}</td>
        <td style="text-align:center;">${p.phone || '—'}</td>
      </tr>
    `).join('');

    const memberRows = (execData.members || []).map((m, i) => `
      <tr>
        <td style="text-align:center;">${toBn(i + 1)}.</td>
        <td><b>${m.name}</b></td>
        <td style="text-align:center;">${m.class || '—'}</td>
        <td style="text-align:center;">${m.section || '—'}</td>
        <td style="text-align:center;">${toBn(m.roll || '—')}</td>
        <td>কার্যনির্বাহী সদস্য</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শিক্ষার্থী কার্যনির্বাহী পরিষদ — ভাষা ও সাহিত্য ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 9px; text-align: left; vertical-align: middle; }
          th { background: #f0fdf4; color: #166534; font-weight: 800; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">👥 শিক্ষার্থী নেতৃত্ব</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">ভাষা ও সাহিত্য ক্লাব — কার্যনির্বাহী পরিষদ (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <h3 style="font-size:13.5px; color:#166534; margin:14px 0 4px 0;">🌟 মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th>পদের নাম</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="text-align:center;">শ্রেণি</th>
              <th style="text-align:center;">শাখা/বিভাগ</th>
              <th style="text-align:center;">রোল</th>
              <th style="text-align:center;">মোবাইল</th>
            </tr>
          </thead>
          <tbody>
            ${postRows}
          </tbody>
        </table>

        ${memberRows ? `
          <h3 style="font-size:13.5px; color:#1e1b4b; margin:16px 0 4px 0;">👥 সাধারণ কার্যনির্বাহী সদস্যবৃন্দ</h3>
          <table>
            <thead>
              <tr>
                <th style="width:30px; text-align:center;">ক্র.</th>
                <th>শিক্ষার্থীর নাম</th>
                <th style="text-align:center;">শ্রেণি</th>
                <th style="text-align:center;">শাখা/বিভাগ</th>
                <th style="text-align:center;">রোল</th>
                <th>দায়িত্ব</th>
              </tr>
            </thead>
            <tbody>
              ${memberRows}
            </tbody>
          </table>
        ` : ''}

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <span>প্রধান সমন্বয়ক, ভাষা ও সাহিত্য ক্লাব</span>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // Official Pad Print: Member Registration Receipt
  const handlePrintMemberReceipt = (receipt) => {
    if (!receipt) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্যপদ আবেদন কপি — ভাষা ও সাহিত্য ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .receipt-box { border: 1.5px solid #059669; border-radius: 8px; padding: 16px; margin: 14px 0; background: #f8fafc; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
          td { border: 1px solid #cbd5e1; padding: 8px 12px; }
          .label-col { background: #f0fdf4; font-weight: 700; width: 32%; color: #166534; }
          .sig-grid { margin-top: 55px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">📋 শিক্ষার্থী সদস্যপদ নিবন্ধন স্বীকৃতিপত্র</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব — সদস্যপদ আবেদন ও স্বীকৃতি কপি</h2>
          <div style="font-size:12px; color:#475569;">নিবন্ধন ট্র্যাকিং আইডি: <b>${receipt.tracking_id || '—'}</b> • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <div class="receipt-box">
          <table>
            <tbody>
              <tr>
                <td class="label-col">শিক্ষার্থীর পূর্ণ নাম</td>
                <td><b style="font-size:14.5px; color:#0f172a;">${receipt.student_name || '—'}</b></td>
              </tr>
              <tr>
                <td class="label-col">শ্রেণি ও রোল নং</td>
                <td>শ্রেণি: <b>${receipt.class_name || '—'}</b> | রোল: <b>${toBn(receipt.roll_no || '—')}</b></td>
              </tr>
              <tr>
                <td class="label-col">শাখা / বিভাগ</td>
                <td><b>${receipt.department || 'সাধারণ'}</b></td>
              </tr>
              <tr>
                <td class="label-col">যোগাযোগের মোবাইল নম্বর</td>
                <td>${receipt.mobile || '—'}</td>
              </tr>
              <tr>
                <td class="label-col">সাহিত্য ও সাংস্কৃতিক আগ্রহের ক্ষেত্র</td>
                <td>${receipt.interests || 'কবিতা, গল্প, আবৃত্তি, দেয়ালিকা প্রকাশ'}</td>
              </tr>
              <tr>
                <td class="label-col">আবেদনের তারিখ ও স্থিতি</td>
                <td>${receipt.date || toBn(new Date().toLocaleDateString('bn-BD'))} • <span style="color:#059669; font-weight:700;">প্রাথমিক নিবন্ধন সক্রিয় ও নিশ্চিতকৃত</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:6px; padding:10px 14px; font-size:12px; color:#166534; line-height:1.6;">
          📌 <b>সদস্যদের জ্ঞাতব্য:</b> উক্ত শিক্ষার্থী মগড়া পালস্ ভাষা ও সাহিত্য ক্লাবের একজন নিয়মিত শিক্ষার্থী সদস্য হিসেবে তালিকাভুক্ত হলেন। তিনি প্রতি বৃহস্পতিবারের সাপ্তাহিক পাঠচক্র, সাহিত্য প্রতিযোগিতা ও ত্রৈমাসিক দেয়াল পত্রিকা ‘কিশলয়’-এ নিয়মিত অংশগ্রহণ ও লেখা জমা দেওয়ার সুযোগ পাবেন।
        </div>

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <small>প্রধান সমন্বয়ক, ভাষা ও সাহিত্য ক্লাব</small>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <small>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</small>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // Official Pad Print: Writing Submission Slip
  const handlePrintWriteReceipt = (receipt) => {
    if (!receipt) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const typeBn = receipt.type === 'poem' ? 'কবিতা' : receipt.type === 'story' ? 'ছোটগল্প' : receipt.type === 'essay' ? 'প্রবন্ধ' : receipt.type === 'rhyme' ? 'ছড়া' : receipt.type;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>লেখা জমা রসিদ — ভাষা ও সাহিত্য ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .receipt-box { border: 1.5px solid #059669; border-radius: 8px; padding: 16px; margin: 14px 0; background: #f8fafc; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
          td { border: 1px solid #cbd5e1; padding: 8px 12px; }
          .label-col { background: #f0fdf4; font-weight: 700; width: 32%; color: #166534; }
          .sig-grid { margin-top: 55px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">📜 দেয়াল পত্রিকা ও সাহিত্য সংকলন</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব — লেখা জমা প্রাপ্তিস্বীকার রসিদ</h2>
          <div style="font-size:12px; color:#475569;">ট্র্যাকিং নম্বর: <b>${receipt.tracking_id || '—'}</b> • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <div class="receipt-box">
          <table>
            <tbody>
              <tr>
                <td class="label-col">লেখার শিরোনাম</td>
                <td><b style="font-size:14.5px; color:#0f172a;">${receipt.title || '—'}</b></td>
              </tr>
              <tr>
                <td class="label-col">সাহিত্য শাখার ধরন</td>
                <td><b>${typeBn}</b></td>
              </tr>
              <tr>
                <td class="label-col">লেখক শিক্ষার্থীর নাম</td>
                <td><b>${receipt.student_name || '—'}</b></td>
              </tr>
              <tr>
                <td class="label-col">শ্রেণি, বিভাগ ও রোল নং</td>
                <td>শ্রেণি: <b>${receipt.class_name || '—'}</b> | শাখা/বিভাগ: <b>${receipt.section || receipt.department || 'সাধারণ'}</b> | রোল: <b>${toBn(receipt.roll_no || '—')}</b></td>
              </tr>
              ${receipt.file_name ? `
              <tr>
                <td class="label-col">সংযুক্ত ফাইল / পান্ডুলিপি</td>
                <td><b>📎 ${receipt.file_name}</b> <small style="color:#64748b;">(${receipt.file_size || 'সংযুক্ত'})</small></td>
              </tr>
              ` : ''}
              <tr>
                <td class="label-col">জমা দানের তারিখ</td>
                <td>${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি.</td>
              </tr>
              <tr>
                <td class="label-col">বর্তমান স্থিতি</td>
                <td><span style="color:#d97706; font-weight:700;">সম্পাদনা ও জুরি পরিষদে অপেক্ষমাণ (দেয়াল পত্রিকা ‘কিশলয়’)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:6px; padding:10px 14px; font-size:12px; color:#166534; line-height:1.6;">
          📌 <b>বিশেষ দ্রষ্টব্য:</b> জমাকৃত লেখাটি ক্লাব সমন্বয়ক ও শিক্ষার্থী সম্পাদনা পর্ষদ কর্তৃক যাচাই-বাছাই শেষে ত্রৈমাসিক দেয়াল পত্রিকা ‘কিশলয়’-এ প্রকাশ অথবা বাৎসরিক সাহিত্য প্রতিযোগিতায় বিবেচনার জন্য গৃহীত হবে।
        </div>

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <small>প্রধান সমন্বয়ক, ভাষা ও সাহিত্য ক্লাব</small>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <small>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</small>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // Official Pad Print: Yearly Programs & Calendar
  const handlePrintProgramsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const programsList = [
      { month: 'জানুয়ারি', title: 'নবীনবরণ ও সাহিত্য আসর', date: '১৫ জানুয়ারি', tag: 'সাহিত্য আসর' },
      { month: 'ফেব্রুয়ারি', title: 'একুশে ফেব্রুয়ারি সংকলন ও রচনা প্রতিযোগিতা', date: '২১ ফেব্রুয়ারি', tag: 'কিশলয় প্রকাশ' },
      { month: 'মার্চ', title: 'স্বাধীনতা দিবস কবিতা আবৃত্তি ও বক্তৃতা', date: '২৬ মার্চ', tag: 'জাতীয় উৎসব' },
      { month: 'এপ্রিল', title: 'বৈশাখী সাহিত্য আড্ডা ও লোকগীতি কর্মশালা', date: '১৪ এপ্রিল', tag: 'লোকসংস্কৃতি' },
      { month: 'মে', title: 'রবীন্দ্র-নজরুল জন্মজয়ন্তী ও স্মৃতিচারণ', date: '২৫ বৈশাখ / ১১ জ্যৈষ্ঠ', tag: 'জয়ন্তী পালন' },
      { month: 'জুন', title: 'ত্রৈমাসিক সাহিত্য বুলেটিন প্রকাশ', date: '২০ জুন', tag: 'বুলেটিন' },
      { month: 'জুলাই', title: 'প্রমিত বানানরীতি ও ব্যাকরণ অলিম্পিয়াড', date: '১০ জুলাই', tag: 'অলিম্পিয়াড' },
      { month: 'আগস্ট', title: 'জাতীয় শোক দিবসের কবিতা ও শোকগাথা পাঠ', date: '১৫ আগস্ট', tag: 'স্মৃতিচারণ' },
      { month: 'সেপ্টেম্বর', title: 'Spoken English & Vocabulary Week', date: '১৮-২৪ সেপ্টেম্বর', tag: 'ইংরেজি ভাষা' },
      { month: 'অক্টোবর', title: 'দেয়াল পত্রিকা ‘কিশলয়’ শারদীয় সংখ্যা', date: '১৫ অক্টোবর', tag: 'দেয়ালিকা' },
      { month: 'নভেম্বর', title: 'বার্ষিক সাহিত্য সপ্তাহ ও নাট্য প্রদর্শনী', date: '১০-১৫ নভেম্বর', tag: 'সাহিত্য সপ্তাহ' },
      { month: 'ডিসেম্বর', title: 'বিজয় দিবস ক্রোড়পত্র ও সেরা পাঠক সম্মাননা', date: '১৬ ডিসেম্বর', tag: 'পুরস্কার বিতরণ' }
    ];

    const rows = programsList.map((p, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:700;color:#065f46;">${p.month}</td>
        <td style="font-weight:700;color:#0f172a;">${p.title}</td>
        <td style="text-align:center;">${p.date}</td>
        <td style="text-align:center;color:#1e40af;font-weight:600;">${p.tag}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বাৎসরিক সাহিত্য কর্মসূচি ও ক্যালেন্ডার — ভাষা ও সাহিত্য ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: middle; }
          th { background: #f0fdf4; color: #166534; font-weight: 800; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">🗓️ বাৎসরিক সাহিত্য কর্মসূচি</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব — বাৎসরিক ইভেন্ট ক্যালেন্ডার (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; margin-bottom:10px; font-size:12px;">
          📖 <b>সাপ্তাহিক লাইব্রেরি পাঠচক্র:</b> প্রতি সপ্তাহের <b>বৃহস্পতিবার বিকাল ৩:৩০ মি.</b> বিদ্যালয় লাইব্রেরি কক্ষে নিয়মিত সাহিত্য আড্ডা ও পাঠচক্র অনুষ্ঠিত হয়।
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">ক্র.</th>
              <th style="width:75px;">মাস</th>
              <th>কর্মসূচি / ইভেন্টের শিরোনাম</th>
              <th style="width:110px; text-align:center;">নির্ধারিত তারিখ</th>
              <th style="width:100px; text-align:center;">ধরন</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <small>প্রধান সমন্বয়ক, ভাষা ও সাহিত্য ক্লাব</small>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <small>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</small>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // Official Pad Print: Code of Conduct & Student Pledge
  const handlePrintConductPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const rulesList = [
      { num: '১', rule: 'বাংলা ও ইংরেজি উভয় ভাষার প্রতি সম্মান প্রদর্শন করতে হবে।' },
      { num: '২', rule: 'ভাষা ব্যবহারে শালীনতা ও শুদ্ধতা বজায় রাখতে হবে।' },
      { num: '৩', rule: 'অন্যের লেখা অনুমতি ছাড়া নিজের নামে প্রকাশ করা যাবে না।' },
      { num: '৪', rule: 'সাহিত্যচর্চায় ধর্ম, বর্ণ, লিঙ্গ বা ব্যক্তিগত পরিচয় নিয়ে বিদ্বেষমূলক বক্তব্য দেওয়া যাবে না।' },
      { num: '৫', rule: 'অন্যের মতামত ও সৃজনশীলতাকে সম্মান করতে হবে।' },
      { num: '৬', rule: 'নিয়মিত ক্লাব কার্যক্রমে অংশগ্রহণ করতে হবে।' },
      { num: '৭', rule: 'ক্লাব ও বিদ্যালয়ের নিয়ম-শৃঙ্খলা কঠোরভাবে মেনে চলতে হবে।' }
    ];

    const ruleRows = rulesList.map(r => `
      <tr>
        <td style="text-align:center;font-weight:800;color:#065f46;width:40px;padding:7px 10px;">${r.num}</td>
        <td style="font-size:13px;font-weight:600;padding:7px 12px;color:#0f172a;">${r.rule}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শৃংখলা ও আচরণ বিধি — ভাষা ও সাহিত্য ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12.5px; }
          td { border: 1px solid #94a3b8; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr 1fr; font-size: 12.5px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 160px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">⚖️ আচরণ বিধি ও শৃঙ্খলা নীতিমালা</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব — শৃংখলা ও আচরণ বিধি (Code of Conduct)</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ${toBn(new Date().toLocaleDateString('bn-BD'))} খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <p style="font-size:12.5px; line-height:1.6; margin-bottom:8px;">
          মগড়া পালস্ ভাষা ও সাহিত্য ক্লাবের প্রত্যেক সাধারণ শিক্ষার্থী সদস্য ও কার্যনির্বাহী পরিষদ সদস্যের জন্য নিম্নোক্ত ৭টি শৃঙ্খলা ও আচরণ বিধি অবশ্য পালনীয়:
        </p>

        <table>
          <tbody>
            ${ruleRows}
          </tbody>
        </table>

        <div style="margin-top:14px; border:1.5px dashed #059669; border-radius:8px; padding:12px; background:#f0fdf4;">
          <b style="color:#065f46; font-size:13px;">📜 সদস্যের অঙ্গীকারনামা (Student Pledge):</b>
          <p style="margin:4px 0 0 0; font-size:12px; color:#166534; line-height:1.6;">
            “আমি মগড়া পালস্ ভাষা ও সাহিত্য ক্লাবের সদস্য হিসেবে ক্লাবের আদর্শ, লক্ষ্য ও শৃংখলা বিধি পূর্ণাঙ্গভাবে মেনে চলব। মাতৃভাষা বাংলার প্রমিত রূপ ও বৈশ্বিক ভাষা ইংরেজির যথাযথ চর্চায় নিবেদিত থাকব এবং বিদ্যালয়ের সুনাম অক্ষুণ্ণ রাখব।”
          </p>
        </div>

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>সদস্য / শিক্ষার্থীর স্বাক্ষর</b><br>
            <small>ভাষা ও সাহিত্য ক্লাব</small>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <small>প্রধান সমন্বয়ক</small>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <small>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</small>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // Official Pad Print: Wall Magazine Reading Item
  const handlePrintReadingItem = (item) => {
    if (!item) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${item.title} — দেয়াল পত্রিকা ‘কিশলয়’</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .item-box { border: 1.5px solid #059669; border-radius: 8px; padding: 18px; margin: 14px 0; background: #fff; }
          .sig-grid { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">📰 ত্রৈমাসিক দেয়াল পত্রিকা ‘কিশলয়’</span>
          <h2 style="margin:4px 0; color:#065f46; font-size:18px;">মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব — সাহিত্য শোকেস</h2>
          <div style="font-size:12px; color:#475569;">সংখ্যা: ${item.issue || '—'} • প্রকাশনার তারিখ: ${item.date || '—'}</div>
        </div>

        <div class="item-box">
          <div style="text-align:center; border-bottom:1px dashed #cbd5e1; padding-bottom:10px; margin-bottom:14px;">
            <span style="background:#dcfce7; color:#166534; font-size:11px; font-weight:800; padding:2px 8px; border-radius:4px;">${item.type}</span>
            <h1 style="font-size:22px; color:#0f172a; margin:8px 0 4px 0;">${item.title}</h1>
            <div style="font-size:13px; color:#047857; font-weight:700;">
              ✍️ লেখক: ${item.author} (${item.class_info})
            </div>
          </div>

          <div style="font-size:14.5px; line-height:2; color:#1e293b; white-space:pre-line; padding:8px 12px; font-family:${item.type?.includes('English') ? 'Arial, sans-serif' : "'SolaimanLipi', sans-serif"};">
            ${item.full_text || item.excerpt}
          </div>
        </div>

        <div class="sig-grid">
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মোঃ আব্দুল খালেক</b><br>
            <small>প্রধান সমন্বয়ক ও সম্পাদক, দেয়াল পত্রিকা ‘কিশলয়’</small>
          </div>
          <div style="text-align:center;">
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <small>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</small>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
  };

  // 11 Navigation Tabs
  const NAV_TABS = [
    { key: 'identity', label: '১. ক্লাব পরিচিতি', icon: '📖' },
    { key: 'objectives', label: '২. মূল লক্ষ্য ও উদ্দেশ্য', icon: '🎯' },
    { key: 'coordinators', label: '৩. সমন্বয়ক ও বিচারক প্যানেল', icon: '👨‍🏫' },
    { key: 'executive', label: '৪. কার্যনির্বাহী পরিষদ', icon: '👥' },
    { key: 'membership', label: '৫. সদস্যপদের আবেদন', icon: '📋' },
    { key: 'programs', label: '৬. বাৎসরিক কর্মসূচি ও ক্যালেন্ডার', icon: '🗓️' },
    { key: 'submission', label: '৭. লেখা জমা', icon: '✍️' },
    { key: 'competitions', label: '৮. সাহিত্য প্রতিযোগিতা ও ফলাফল', icon: '📜' },
    { key: 'showcase', label: '৯. দেয়াল পত্রিকা প্রকাশ', icon: '📰' },
    { key: 'achievements', label: '১০. অর্জন ও ট্রফি গ্যালারি', icon: '🏆' },
    { key: 'conduct', label: '১১. শৃংখলা ও আচরণ বিধি', icon: '⚖️' }
  ];

  return (
    <div style={{ fontFamily: "'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif" }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 99999,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>✅</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HERO BANNER FROM USER IMAGE */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff',
        padding: '22px 24px',
        borderRadius: '14px',
        marginBottom: '18px',
        boxShadow: '0 4px 14px rgba(6, 95, 70, 0.15)'
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800, marginBottom: '6px' }}>
          ✨ ঐতিহ্যবাহী মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • ভাষা আন্দোলন ও সাহিত্যের আলোয় উদ্ভাসিত
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 900 }}>
          মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#d1fae5', lineHeight: '1.6' }}>
          “শব্দের শক্তিতে বিকশিত মেধা, সাহিত্যের আলোয় আলোকিত চেতনা” — মাতৃভাষার শুদ্ধ উচ্চারণ, সৃজনশীল লেখালেখি, কবিতা আবৃত্তি, দেয়াল পত্রিকা ‘কিশলয়’ এবং ইংরেজি কথ্যচর্চায় শিক্ষার্থীদের আত্মবিশ্বাসী করে তোলার নিবেদিত অঙ্গন।
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>🏛️ স্থাপিত: ২০১৯ খ্রি.</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>📰 ত্রৈমাসিক দেয়াল পত্রিকা: 'কিশলয়'</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>📖 পাঠচক্র: প্রতি বৃহস্পতিবার বিকাল ৩:৩০</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>🏆 জেলা ও উপজেলা চ্যাম্পিয়নশিপ জয়ী</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>👥 ১৫০+ সক্রিয় শিক্ষার্থী সদস্য</span>
        </div>
        <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setLitTab('competitions')}
            style={{
              background: '#ffffff',
              color: '#065f46',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            📜 নতুন সাহিত্য প্রতিযোগিতা আয়োজন ও ফলাফল প্রস্তুত ➔
          </button>
          <button
            type="button"
            onClick={() => setLitTab('submission')}
            style={{
              background: '#064e3b',
              color: '#ffffff',
              border: '1px solid #34d399',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✍️ লেখা জমা দিন (কিশলয়) ➔
          </button>
        </div>
      </div>

      {/* 11-FEATURE WRAPPED DIRECTORY TAB BAR (MATCHING APPROVED UX) */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
            ভাষা ও সাহিত্য ক্লাবের ১১টি মূল ফিচার ডিরেক্টরি:
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            যেকোনো ফিচারে ক্লিক করে সরাসরি পরিচালনা ও প্রিন্ট করুন
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {NAV_TABS.map(tab => {
            const isActive = litTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setLitTab(tab.key)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: isActive ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: isActive ? '#ecfdf5' : '#ffffff',
                  color: isActive ? '#065f46' : '#334155',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 2px 6px rgba(5,150,105,0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#ffffff'; }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1: ক্লাব পরিচিতি */}
      {/* ========================================================================= */}
      {litTab === 'identity' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                📖 ক্লাব পরিচিতি (Profile & Identity)
              </h3>
            </div>
            <div style={{ background: '#f0fdf4', padding: '6px 14px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '12px', color: '#166534', fontWeight: 800 }}>
              মগড়া পালস্ সহশিক্ষা একাডেমি
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <td style={{ width: '220px', padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>ক্লাবের নাম</td>
                  <td style={{ padding: '10px 14px', fontWeight: 900, color: '#065f46', fontSize: '15px' }}>ভাষা ও সাহিত্য ক্লাব</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>ইংরেজি নাম</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#334155' }}>Language & Literature Club</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>প্রতিষ্ঠানের নাম</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0f172a' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>পরিচালনা</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>পৃষ্ঠপোষক ও কেন্দ্রীয় উপদেষ্টা পরিষদের তত্ত্বাবধানে</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>ক্লাব সমন্বয়ক</td>
                  <td style={{ padding: '10px 14px', color: '#047857', fontWeight: 700 }}>বাংলা ও ইংরেজি বিষয়ের শিক্ষক</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>সদস্য</td>
                  <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 700 }}>ষষ্ঠ থেকে দশম শ্রেণির শিক্ষার্থী</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>কার্যক্রম</td>
                  <td style={{ padding: '10px 14px', color: '#334155', lineHeight: '1.6' }}>
                    ভাষা শিক্ষা, সাহিত্যচর্চা, লেখালেখি ও সংস্কৃতি, সাপ্তাহিক আড্ডা, দেয়ালিকা প্রকাশ, ইভেন্ট ও প্রতিযীগিতার আয়োজন
                  </td>
                </tr>
                <tr style={{ background: '#ecfdf5' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 900, color: '#065f46', background: '#dcfce7' }}>মূলনীতি</td>
                  <td style={{ padding: '10px 14px', fontWeight: 900, color: '#065f46', fontSize: '14.5px' }}>
                    “শুদ্ধ ভাষা, সুন্দর প্রকাশ, সৃজনশীল মনন”
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4 Pillars Summary */}
          <div style={{ marginTop: '18px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a' }}>
              🌟 ক্লাবের ৪টি মূল স্তম্ভ
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                <span style={{ fontSize: '24px' }}>🗣️</span>
                <b style={{ display: 'block', margin: '4px 0 2px 0', color: '#166534', fontSize: '13.5px' }}>শুদ্ধ উচ্চারণ ও প্রমিত বাচন</b>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>প্রমিত বাংলা ভাষার নির্ভুল উচ্চারণ, স্বরভঙ্গি ও জড়তা দূরীকরণের নিয়মিত প্রশিক্ষণ।</p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                <span style={{ fontSize: '24px' }}>✍️</span>
                <b style={{ display: 'block', margin: '4px 0 2px 0', color: '#166534', fontSize: '13.5px' }}>সৃজনশীল সাহিত্যচর্চা</b>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>কবিতা, গল্প, ছড়া ও প্রবন্ধ রচনায় শিক্ষার্থীদের মৌলিক কল্পনাশক্তির বিকাশ।</p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                <span style={{ fontSize: '24px' }}>🇬🇧</span>
                <b style={{ display: 'block', margin: '4px 0 2px 0', color: '#166534', fontSize: '13.5px' }}>English & Vocabulary</b>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>Spoken English, শব্দভাণ্ডার বৃদ্ধি ও ইংরেজিতে সাবলীল উপস্থাপনার চর্চা।</p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                <span style={{ fontSize: '24px' }}>📖</span>
                <b style={{ display: 'block', margin: '4px 0 2px 0', color: '#166534', fontSize: '13.5px' }}>বৃহস্পতিবারের পাঠচক্র</b>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>লাইব্রেরিতে প্রতি বৃহস্পতিবার পছন্দের বই পাঠ, বুক রিভিউ ও সাহিত্য আড্ডা।</p>
              </div>
            </div>
          </div>

          {/* শীর্ষ পৃষ্ঠপোষক ও সমন্বয়ক পরিষদ */}
          <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ border: '1px solid #86efac', borderRadius: '10px', padding: '14px', background: '#f0fdf4' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>প্রধান পৃষ্ঠপোষক</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={resolvedHeadPhoto}
                  alt="প্রধান শিক্ষক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{leadershipInfo.head?.name || 'মুহাম্মদ শফিকুল ইসলাম'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #86efac', borderRadius: '10px', padding: '14px', background: '#f0fdf4' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>সার্বিক পৃষ্ঠপোষকতা</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={resolvedPresidentPhoto}
                  alt="ম্যানেজিং কমিটি সভাপতি"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #b45309' }}
                  onError={(e) => { e.target.src = PHOTO_PRESIDENT; }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{leadershipInfo.president?.name || 'নেয়ামুল হক খান'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #86efac', borderRadius: '10px', padding: '14px', background: '#f0fdf4' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>প্রধান সমন্বয়ক</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <img
                  src={getResolvedTeacherPhoto(panelData.coordinators[0]?.teacherId, panelData.coordinators[0]?.name)}
                  alt="প্রধান সমন্বয়ক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{panelData.coordinators[0]?.name || 'মোঃ আব্দুল খালেক'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{panelData.coordinators[0]?.designation || 'সহকারী শিক্ষক (বাংলা)'}</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setLitTab('objectives')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: মূল লক্ষ্য ও উদ্দেশ্য ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য */}
      {/* ========================================================================= */}
      {litTab === 'objectives' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              ফিচার ২
            </span>
            <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
              🎯 ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য (১০টি দিকনির্দেশনা)
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              শিক্ষার্থীদের ভাষা দক্ষতা বৃদ্ধি, সৃজনশীল মনন গঠন এবং সাহিত্যের আলোয় আলোকিত করার মূল অঙ্গীকার
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {[
              { num: '০১', title: 'বাংলা ও ইংরেজি ভাষার দক্ষতা বৃদ্ধি', desc: 'শিক্ষার্থীদের বাংলা ও ইংরেজি উভয় ভাষায় সাবলীল যোগাযোগ ও সার্বিক দক্ষতা বৃদ্ধি করা।' },
              { num: '০২', title: 'শুদ্ধ উচ্চারণ, বানান ও ব্যাকরণ চর্চা', desc: 'শুদ্ধ উচ্চারণ, প্রমিত বানানরীতি ও ব্যাকরণগত নিয়মাবলি নির্ভুলভাবে প্রয়োগের অভ্যাস গড়ে তোলা।' },
              { num: '০৩', title: 'ভাষা, সাহিত্য ও সংস্কৃতির প্রতি ভালোবাসা', desc: 'মাতৃভাষা বাংলা, সমৃদ্ধ সাহিত্য ও আবহমান বাঙালি সংস্কৃতির প্রতি গভীর অনুরাগ সৃষ্টি করা।' },
              { num: '০৪', title: 'ইংরেজি কথ্য ও লিখন দক্ষতা বৃদ্ধি', desc: 'ইংরেজি ভাষায় আত্মবিশ্বাসের সাথে কথা বলা, পড়া ও সৃজনশীল লেখার দক্ষতা বৃদ্ধি করা।' },
              { num: '০৫', title: 'সৃজনশীল সাহিত্য রচনায় উৎসাহ দান', desc: 'শিক্ষার্থীদের স্বরচিত কবিতা, গল্প, প্রবন্ধ, ছড়া ও নাটক রচনায় সার্বক্ষণিক অনুপ্রেরণা ও প্রশিক্ষণ প্রদান।' },
              { num: '০৬', title: 'বই পড়ার অভ্যাস ও সমৃদ্ধ পাঠাভ্যাস', desc: 'স্কুল লাইব্রেরিমুখী করে বই পড়ার চিরন্তন অভ্যাস ও নিয়মিত পাঠচক্রের সংস্কৃতি গড়ে তোলা।' },
              { num: '০৭', title: 'আবৃত্তি, বক্তৃতা ও উপস্থাপনা বিকাশ', desc: 'মঞ্চে কবিতা আবৃত্তি, তাৎক্ষণিক উপস্থিত বক্তৃতা ও প্রাঞ্জল উপস্থাপনার শিল্প আয়ত্ত করানো।' },
              { num: '০৮', title: 'মাতৃভাষার মর্যাদা ও বৈচিত্র্যের প্রতি শ্রদ্ধা', desc: 'মাতৃভাষার ঐতিহাসিক মর্যাদা রক্ষা এবং বিশ্বের ভাষাগত বৈচিত্র্য ও ক্ষুদ্র নৃগোষ্ঠীর ভাষার প্রতি সম্মান বোধ সৃষ্টি।' },
              { num: '০৯', title: 'দেশীয় সাহিত্য, লোকসংস্কৃতি ও ঐতিহ্যের পাঠ', desc: 'গ্রামবাংলার লোকগাথা, লোকসাহিত্য, বাউল গান, জারি-সারি ও জাতীয় সাহিত্যের ঐতিহ্যের গভীর পরিচয় দান।' },
              { num: '১০', title: 'সৃজনশীল চিন্তা ও মুক্ত প্রকাশভঙ্গির উন্নয়ন', desc: 'শিক্ষার্থীদের স্বাধীন ও মুক্ত চিন্তার বিকাশ, কল্পনাশক্তি শাণিত করা এবং শৈল্পিক প্রকাশভঙ্গির উন্মেষ ঘটানো।' }
            ].map((obj) => (
              <div
                key={obj.num}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '13px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {obj.num}
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: '13.5px', color: '#0f172a', marginBottom: '2px' }}>
                    {obj.title}
                  </b>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    {obj.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('identity')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: ক্লাব পরিচিতি
            </button>
            <button
              type="button"
              onClick={() => setLitTab('coordinators')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: সমন্বয়ক ও বিচারক প্যানেল ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3: সমন্বয়ক ও বিচারক প্যানেল */}
      {/* ========================================================================= */}
      {litTab === 'coordinators' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৩
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                👨‍🏫 সমন্বয়ক ও বিচারক প্যানেল ব্যবস্থাপনা
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                শিক্ষকদের ড্রপ-ডাউন থেকে এক বা একাধিক সমন্বয়ক এবং ৩ সদস্যের বিচারক প্যানেল (প্রধান বিচারক ১ জন, বিচারক ২ জন) নির্বাচন করুন
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrintPanelPad}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>🖨️</span>
                <span>অফিসিয়াল প্যাডে প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* SECTION A: COORDINATORS (এক বা একাধিক যুক্ত করার ব্যবস্থা) */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👥</span>
              <span>ক্লাব সমন্বয়ক পরিষদ (Coordinators)</span>
            </div>

            {/* Add Coordinator Form */}
            <form onSubmit={handleAddCoordinator} style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  শিক্ষক নির্বাচন (ড্রপ-ডাউন):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={getResolvedTeacherPhoto(newCoordTeacherId)}
                    alt="নির্বাচিত শিক্ষক"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #059669', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <select
                    value={newCoordTeacherId}
                    onChange={e => setNewCoordTeacherId(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '12.5px' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  সমন্বয়ক দায়িত্ব / পদবী:
                </label>
                <input
                  type="text"
                  value={newCoordRole}
                  onChange={e => setNewCoordRole(e.target.value)}
                  placeholder="যেমন: সহকারী সমন্বয়ক (ইংরেজি সাহিত্য)"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{ width: '100%', background: '#047857', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ➕ সমন্বয়ক যুক্ত করুন
                </button>
              </div>
            </form>

            {/* List of Coordinators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {(panelData.coordinators || []).map(coord => (
                <div
                  key={coord.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getResolvedTeacherPhoto(coord.teacherId, coord.name)}
                      alt={coord.name}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669', flexShrink: 0 }}
                      onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                    />
                    <div>
                      <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                        {coord.role}
                      </span>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                        {coord.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {coord.designation} {coord.phone && coord.phone !== '—' ? `• 📱 ${coord.phone}` : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCoordinator(coord.id)}
                    style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    title="অপসারণ করুন"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: JUDGES PANEL (প্রধান বিচারক ১ জন, বিচারক ২ জন) */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚖️</span>
              <span>স্থায়ী বিচারক প্যানেল (প্রধান বিচারক ১ জন ও বিচারক ২ জন)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Chief Judge */}
              <div style={{ background: '#ffffff', border: '2px solid #312e81', borderRadius: '10px', padding: '14px' }}>
                <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ⭐ প্রধান বিচারক (১ জন)
                </span>
                <div style={{ margin: '8px 0 10px 0' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>শিক্ষক ড্রপ-ডাউন থেকে নির্বাচন:</label>
                  <select
                    value={panelData.chiefJudge?.teacherId || ''}
                    onChange={e => handleChangeJudge('chiefJudge', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #312e81', fontSize: '12.5px', fontWeight: 700, color: '#312e81' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.chiefJudge?.teacherId, panelData.chiefJudge?.name)}
                    alt={panelData.chiefJudge?.name || 'প্রধান বিচারক'}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #312e81', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b>বর্তমান প্রধান বিচারক:</b> {panelData.chiefJudge?.name || '—'}
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{panelData.chiefJudge?.designation}</div>
                  </div>
                </div>
              </div>

              {/* Judge 1 */}
              <div style={{ background: '#ffffff', border: '2px solid #059669', borderRadius: '10px', padding: '14px' }}>
                <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ⚖️ বিচারক (১ম)
                </span>
                <div style={{ margin: '8px 0 10px 0' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>শিক্ষক ড্রপ-ডাউন থেকে নির্বাচন:</label>
                  <select
                    value={panelData.judge1?.teacherId || ''}
                    onChange={e => handleChangeJudge('judge1', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #059669', fontSize: '12.5px', fontWeight: 700, color: '#065f46' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judge1?.teacherId, panelData.judge1?.name)}
                    alt={panelData.judge1?.name || 'বিচারক (১)'}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b>বর্তমান বিচারক (১):</b> {panelData.judge1?.name || '—'}
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{panelData.judge1?.designation}</div>
                  </div>
                </div>
              </div>

              {/* Judge 2 */}
              <div style={{ background: '#ffffff', border: '2px solid #d97706', borderRadius: '10px', padding: '14px' }}>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ⚖️ বিচারক (২য়)
                </span>
                <div style={{ margin: '8px 0 10px 0' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>শিক্ষক ড্রপ-ডাউন থেকে নির্বাচন:</label>
                  <select
                    value={panelData.judge2?.teacherId || ''}
                    onChange={e => handleChangeJudge('judge2', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #d97706', fontSize: '12.5px', fontWeight: 700, color: '#92400e' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'} {t.subject ? `(${t.subject})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judge2?.teacherId, panelData.judge2?.name)}
                    alt={panelData.judge2?.name || 'বিচারক (২)'}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #d97706', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b>বর্তমান বিচারক (২):</b> {panelData.judge2?.name || '—'}
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{panelData.judge2?.designation}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('objectives')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: মূল লক্ষ্য ও উদ্দেশ্য
            </button>
            <button
              type="button"
              onClick={() => setLitTab('executive')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: কার্যনির্বাহী পরিষদ ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4: কার্যনির্বাহী পরিষদ */}
      {/* ========================================================================= */}
      {litTab === 'executive' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৪
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                👥 শিক্ষার্থী কার্যনির্বাহী পরিষদ (২০২৬)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                সভাপতি, সহ-সভাপতি, সাধারণ সম্পাদক, যুগ্ম সম্পাদক, সাংগঠনিক, প্রচার-প্রকাশনা ও অর্থ সম্পাদক এবং কার্যনির্বাহী সদস্যবৃন্দ
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrintExecPad}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>🖨️</span>
                <span>অফিসিয়াল প্যাডে প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* 7 OFFICIAL POSTS GRID */}
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
            🏛️ মূল কার্যনির্বাহী পদাধিকারী (৭টি পদ):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { key: 'president', label: 'সভাপতি', icon: '👑', data: execData.president, badgeColor: '#312e81', badgeBg: '#e0e7ff' },
              { key: 'vicePresident', label: 'সহ-সভাপতি', icon: '⭐', data: execData.vicePresident, badgeColor: '#1d4ed8', badgeBg: '#dbeafe' },
              { key: 'generalSecretary', label: 'সাধারণ সম্পাদক', icon: '📜', data: execData.generalSecretary, badgeColor: '#047857', badgeBg: '#dcfce7' },
              { key: 'jointSecretary', label: 'যুগ্ম সম্পাদক', icon: '🤝', data: execData.jointSecretary, badgeColor: '#0284c7', badgeBg: '#e0f2fe' },
              { key: 'organizingSecretary', label: 'সাংগঠনিক সম্পাদক', icon: '🎯', data: execData.organizingSecretary, badgeColor: '#b45309', badgeBg: '#fef3c7' },
              { key: 'publicitySecretary', label: 'প্রচার ও প্রকাশনা সম্পাদক', icon: '📢', data: execData.publicitySecretary, badgeColor: '#c2410c', badgeBg: '#ffedd5' },
              { key: 'financeSecretary', label: 'অর্থ সম্পাদক', icon: '💰', data: execData.financeSecretary, badgeColor: '#4f46e5', badgeBg: '#e0e7ff' }
            ].map(post => (
              <div
                key={post.key}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <span style={{ background: post.badgeBg, color: post.badgeColor, fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    {post.icon} {post.label}
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px 0' }}>
                    {post.data?.name || '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    শ্রেণি: {post.data?.class || '—'} {post.data?.section ? `• ${post.data.section}` : ''} • রোল: {toBn(post.data?.roll || '—')}
                  </div>
                  {post.data?.phone && (
                    <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                      📱 {post.data.phone}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleStartEditPost(post.key, post.data)}
                  style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '5px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                  title="তথ্য পরিবর্তন করুন"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>

          {/* SECTION B: MULTIPLE EXECUTIVE MEMBERS */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '10px' }}>
              👥 কার্যনির্বাহী সদস্যবৃন্দ (একাধিক সদস্য যুক্তকরণ):
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddExecMember} style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '3px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  placeholder="যেমন: আফরিন সুলতানা"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '3px' }}>শ্রেণি:</label>
                <select
                  value={newMemberClass}
                  onChange={e => handleMemberClassChange(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '12.5px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '3px' }}>শাখা / বিভাগ:</label>
                <select
                  value={newMemberSection}
                  onChange={e => setNewMemberSection(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '12.5px' }}
                >
                  {getSectionOptionsForClass(newMemberClass).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '3px' }}>রোল নং:</label>
                <input
                  type="text"
                  value={newMemberRoll}
                  onChange={e => setNewMemberRoll(e.target.value)}
                  placeholder="যেমন: ৩"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{ width: '100%', background: '#047857', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>➕</span>
                  <span>সদস্য যুক্ত করুন</span>
                </button>
              </div>
            </form>

            {/* Members Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
              {(execData.members || []).map(m => (
                <div
                  key={m.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div>
                    <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{m.name}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      শ্রেণি: {m.class} {m.section ? `• ${m.section}` : ''} • রোল: {toBn(m.roll)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button
                      type="button"
                      onClick={() => handleStartEditMember(m)}
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="সদস্য তথ্য এডিট করুন"
                    >
                      <span>✏️</span>
                      <span>এডিট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExecMember(m.id)}
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        padding: '4px 7px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        cursor: 'pointer'
                      }}
                      title="অপসারণ করুন"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('coordinators')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: সমন্বয়ক ও বিচারক প্যানেল
            </button>
            <button
              type="button"
              onClick={() => setLitTab('membership')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: সদস্যপদের আবেদন ➔
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXECUTIVE POST */}
      {editingExecPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
            border: '2px solid #065f46',
            overflow: 'hidden'
          }}>
            <div style={{ background: '#065f46', color: '#ffffff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: '15px' }}>✏️ পদাধিকারী তথ্য সম্পাদনা</b>
              <button
                type="button"
                onClick={() => setEditingExecPost(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSavePostEdit} style={{ padding: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={execEditForm.name}
                  onChange={e => setExecEditForm({ ...execEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>শ্রেণি:</label>
                  <input
                    type="text"
                    value={execEditForm.class}
                    onChange={e => setExecEditForm({ ...execEditForm, class: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>শাখা/বিভাগ:</label>
                  <input
                    type="text"
                    value={execEditForm.section}
                    placeholder="যেমন: বিজ্ঞান"
                    onChange={e => setExecEditForm({ ...execEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>রোল:</label>
                  <input
                    type="text"
                    value={execEditForm.roll}
                    onChange={e => setExecEditForm({ ...execEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>মোবাইল (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={execEditForm.phone}
                  onChange={e => setExecEditForm({ ...execEditForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExecPost(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#065f46', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                >
                  💾 সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GENERAL EXECUTIVE MEMBER */}
      {editingExecMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
            border: '2px solid #065f46',
            overflow: 'hidden'
          }}>
            <div style={{ background: '#065f46', color: '#ffffff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: '15px' }}>✏️ কার্যনির্বাহী সদস্য তথ্য এডিট</b>
              <button
                type="button"
                onClick={() => setEditingExecMember(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveMemberEdit} style={{ padding: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  required
                  value={memberEditForm.name}
                  onChange={e => setMemberEditForm({ ...memberEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>শ্রেণি:</label>
                  <select
                    value={memberEditForm.class}
                    onChange={e => {
                      const c = e.target.value;
                      let sec = memberEditForm.section;
                      if ((c === '৯ম' || c === '১০ম') && !['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'].includes(sec)) {
                        sec = 'বিজ্ঞান';
                      } else if (c !== '৯ম' && c !== '১০ম' && !['শাখা ক', 'শাখা খ', 'সাধারণ'].includes(sec)) {
                        sec = 'শাখা ক';
                      }
                      setMemberEditForm({ ...memberEditForm, class: c, section: sec });
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>শাখা / বিভাগ:</label>
                  <select
                    value={memberEditForm.section}
                    onChange={e => setMemberEditForm({ ...memberEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    {getSectionOptionsForClass(memberEditForm.class).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '3px' }}>রোল নং:</label>
                <input
                  type="text"
                  value={memberEditForm.roll}
                  onChange={e => setMemberEditForm({ ...memberEditForm, roll: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExecMember(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#065f46', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                >
                  💾 আপডেট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 5: সদস্যপদের আবেদন */}
      {/* ========================================================================= */}
      {litTab === 'membership' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৫
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                📋 ভাষা ও সাহিত্য ক্লাব সদস্যপদের আবেদন ফরম
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ৬ষ্ঠ থেকে ১০ম শ্রেণির যে কোনো শিক্ষার্থী ক্লাবের নিয়মিত সদস্য হিসেবে অনলাইনে আবেদন করতে পারবে
              </p>
            </div>
            <button
              type="button"
              onClick={fillMemberDemo}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              🪄 ডেমো তথ্য পূরণ
            </button>
          </div>

          {memberReceipt ? (
            <div style={{ background: '#ecfdf5', border: '2px solid #059669', borderRadius: '10px', padding: '18px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '38px', marginBottom: '4px' }}>🎉</div>
              <h4 style={{ margin: '0 0 4px 0', color: '#065f46', fontSize: '17px' }}>সদস্যপদের আবেদন সফলভাবে গৃহীত হয়েছে!</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#047857' }}>
                ট্র্যাকিং আইডি: <b style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86efac' }}>{memberReceipt.tracking_id}</b>
              </p>
              <div style={{ maxWidth: '460px', margin: '0 auto 14px auto', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'left', fontSize: '12.5px' }}>
                <div><b>নাম:</b> {memberReceipt.student_name} (শ্রেণি {memberReceipt.class_name}, রোল {toBn(memberReceipt.roll_no)})</div>
                <div><b>বিভাগ:</b> {memberReceipt.department} • <b>মোবাইল:</b> {memberReceipt.mobile}</div>
                <div><b>আগ্রহের ক্ষেত্র:</b> {memberReceipt.interests}</div>
                <div><b>তারিখ:</b> {memberReceipt.date}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handlePrintMemberReceipt(memberReceipt)}
                  style={{ background: '#065f46', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🖨️ আবেদন কপি প্রিন্ট
                </button>
                <button
                  type="button"
                  onClick={() => setMemberReceipt(null)}
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  নতুন আবেদন
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleMemberSubmit} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>শিক্ষার্থীর পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.student_name}
                    onChange={e => setMemberForm({ ...memberForm, student_name: e.target.value })}
                    placeholder="যেমন: ফাতেমা আক্তার"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>শ্রেণি *</label>
                  <select
                    value={memberForm.class_name}
                    onChange={e => setMemberForm({ ...memberForm, class_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="৬">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭">৭ম শ্রেণি</option>
                    <option value="৮">৮ম শ্রেণি</option>
                    <option value="৯">৯ম শ্রেণি</option>
                    <option value="১০">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>শ্রেণি রোল নং *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.roll_no}
                    onChange={e => setMemberForm({ ...memberForm, roll_no: e.target.value })}
                    placeholder="যেমন: ২"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>শাখা / বিভাগ</label>
                  <select
                    value={memberForm.department}
                    onChange={e => setMemberForm({ ...memberForm, department: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="সাধারণ">সাধারণ (৬ষ্ঠ-৮ম)</option>
                    <option value="বিজ্ঞান">বিজ্ঞান</option>
                    <option value="মানবিক">মানবিক</option>
                    <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>যোগাযোগের মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.mobile}
                    onChange={e => setMemberForm({ ...memberForm, mobile: e.target.value })}
                    placeholder="যেমন: 01712-998877"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>আগ্রহের ক্ষেত্র</label>
                  <input
                    type="text"
                    value={memberForm.interests}
                    onChange={e => setMemberForm({ ...memberForm, interests: e.target.value })}
                    placeholder="যেমন: কবিতা, গল্প, আবৃত্তি, বাচনভঙ্গি"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                📝 সদস্যপদ আবেদন জমা দিন
              </button>
            </form>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('executive')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: কার্যনির্বাহী পরিষদ
            </button>
            <button
              type="button"
              onClick={() => setLitTab('programs')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: বাৎসরিক কর্মসূচি ও ক্যালেন্ডার ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 6: বাৎসরিক কর্মসূচি ও ক্যালেন্ডার */}
      {/* ========================================================================= */}
      {litTab === 'programs' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৬
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                🗓️ বাৎসরিক সাহিত্য কর্মসূচি ও ইভেন্ট ক্যালেন্ডার (২০২৬)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ১২ মাসের সুবিন্যস্ত সাহিত্য উৎসব, প্রতিযোগিতা, পাঠচক্র ও দেয়াল পত্রিকা প্রকাশের সময়সূচি
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrintProgramsPad}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🖨️</span>
              <span>অফিসিয়াল প্যাডে ক্যালেন্ডার প্রিন্ট</span>
            </button>
          </div>

          <div style={{
            background: '#ecfdf5',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>📖</span>
            <div>
              <b style={{ color: '#065f46', fontSize: '14px' }}>সাপ্তাহিক লাইব্রেরি পাঠচক্র ও সাহিত্য আড্ডা</b>
              <div style={{ fontSize: '12.5px', color: '#166534' }}>
                প্রতি সপ্তাহের <b>বৃহস্পতিবার বিকাল ৩:৩০ মি.</b> বিদ্যালয় লাইব্রেরি কক্ষে অনুষ্ঠিত হয়।
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              { month: 'জানুয়ারি', title: 'নবীনবরণ ও সাহিত্য আসর', date: '১৫ জানুয়ারি', tag: 'সাহিত্য আসর' },
              { month: 'ফেব্রুয়ারি', title: 'একুশে ফেব্রুয়ারি সংকলন ও রচনা প্রতিযোগিতা', date: '২১ ফেব্রুয়ারি', tag: 'কিশলয় প্রকাশ' },
              { month: 'মার্চ', title: 'স্বাধীনতা দিবস কবিতা আবৃত্তি ও বক্তৃতা', date: '২৬ মার্চ', tag: 'জাতীয় উৎসব' },
              { month: 'এপ্রিল', title: 'বৈশাখী সাহিত্য আড্ডা ও লোকগীতি কর্মশালা', date: '১৪ এপ্রিল', tag: 'লোকসংস্কৃতি' },
              { month: 'মে', title: 'রবীন্দ্র-নজরুল জন্মজয়ন্তী ও স্মৃতিচারণ', date: '২৫ বৈশাখ / ১১ জ্যৈষ্ঠ', tag: 'জয়ন্তী পালন' },
              { month: 'জুন', title: 'ত্রৈমাসিক সাহিত্য বুলেটিন প্রকাশ', date: '২০ জুন', tag: 'বুলেটিন' },
              { month: 'জুলাই', title: 'প্রমিত বানানরীতি ও ব্যাকরণ অলিম্পিয়াড', date: '১০ জুলাই', tag: 'অলিম্পিয়াড' },
              { month: 'আগস্ট', title: 'জাতীয় শোক দিবসের কবিতা ও শোকগাথা পাঠ', date: '১৫ আগস্ট', tag: 'স্মৃতিচারণ' },
              { month: 'সেপ্টেম্বর', title: 'Spoken English & Vocabulary Week', date: '১৮-২৪ সেপ্টেম্বর', tag: 'ইংরেজি ভাষা' },
              { month: 'অক্টোবর', title: 'দেয়াল পত্রিকা ‘কিশলয়’ শারদীয় সংখ্যা', date: '১৫ অক্টোবর', tag: 'দেয়ালিকা' },
              { month: 'নভেম্বর', title: 'বার্ষিক সাহিত্য সপ্তাহ ও নাট্য প্রদর্শনী', date: '১০-১৫ নভেম্বর', tag: 'সাহিত্য সপ্তাহ' },
              { month: 'ডিসেম্বর', title: 'বিজয় দিবস ক্রোড়পত্র ও সেরা পাঠক সম্মাননা', date: '১৬ ডিসেম্বর', tag: 'পুরস্কার বিতরণ' }
            ].map(item => (
              <div
                key={item.month}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                    {item.month} • {item.tag}
                  </span>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    তারিখ: {item.date}
                  </div>
                </div>
                <div style={{ fontSize: '20px' }}>🗓️</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('membership')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: সদস্যপদের আবেদন
            </button>
            <button
              type="button"
              onClick={() => setLitTab('submission')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: লেখা জমা ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 7: লেখা জমা */}
      {/* ========================================================================= */}
      {litTab === 'submission' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৭
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                ✍️ স্বরচিত লেখা জমা দিন (দেয়াল পত্রিকা ‘কিশলয়’)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                কবিতা, ছোটগল্প, ছড়া, প্রবন্ধ, বুক রিভিউ ও ক্রিয়েটিভ ইংলিশ রাইটিং জমা দিলে সম্পাদনা পরিষদ কর্তৃক কিশলয়ে প্রকাশিত হবে
              </p>
            </div>
            <button
              type="button"
              onClick={fillWriteDemo}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              🪄 ডেমো লেখা পূরণ
            </button>
          </div>

          {writeReceipt ? (
            <div style={{ background: '#ecfdf5', border: '2px solid #059669', borderRadius: '10px', padding: '18px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '38px', marginBottom: '4px' }}>📜</div>
              <h4 style={{ margin: '0 0 4px 0', color: '#065f46', fontSize: '17px' }}>তোমার লেখা সফলভাবে জমা হয়েছে!</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#047857' }}>
                ট্র্যাকিং নম্বর: <b style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86efac' }}>{writeReceipt.tracking_id}</b>
              </p>
              <div style={{ maxWidth: '480px', margin: '0 auto 14px auto', background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'left', fontSize: '12.5px', lineHeight: '1.6' }}>
                <div><b>শিরোনাম:</b> {writeReceipt.title}</div>
                <div><b>লেখক:</b> {writeReceipt.student_name} (শ্রেণি {writeReceipt.class_name}, শাখা/বিভাগ: <b>{writeReceipt.section || writeReceipt.department || 'সাধারণ'}</b>, রোল {toBn(writeReceipt.roll_no)})</div>
                <div><b>ধরন:</b> {writeReceipt.type === 'poem' ? 'স্বরচিত কবিতা' : writeReceipt.type === 'story' ? 'ছোটগল্প' : writeReceipt.type === 'essay' ? 'প্রবন্ধ' : writeReceipt.type === 'rhyme' ? 'ছড়া' : writeReceipt.type}</div>
                {writeReceipt.file_name && (
                  <div style={{ marginTop: '4px', color: '#065f46', fontWeight: 700 }}>
                    <b>সংযুক্ত ফাইল:</b> 📎 {writeReceipt.file_name} <span style={{ color: '#64748b', fontWeight: 'normal' }}>({writeReceipt.file_size})</span>
                  </div>
                )}
                <div><b>স্থিতি:</b> <span style={{ color: '#d97706', fontWeight: 700 }}>সম্পাদনা পরিষদে অপেক্ষমাণ</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handlePrintWriteReceipt(writeReceipt)}
                  style={{ background: '#065f46', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🖨️ জমা রসিদ প্রিন্ট
                </button>
                <button
                  type="button"
                  onClick={() => setWriteReceipt(null)}
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  আরেকটি লেখা জমা দিন
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWriteSubmit} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>লেখকের নাম *</label>
                  <input
                    type="text"
                    required
                    value={writeForm.student_name}
                    onChange={e => setWriteForm({ ...writeForm, student_name: e.target.value })}
                    placeholder="যেমন: ফারজানা মেহজাবীন"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>শ্রেণি *</label>
                  <select
                    value={writeForm.class_name}
                    onChange={e => handleWriteClassChange(e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>শাখা / বিভাগ *</label>
                  <select
                    value={writeForm.section}
                    onChange={e => setWriteForm({ ...writeForm, section: e.target.value, department: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {getSectionOptionsForClass(writeForm.class_name).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>রোল নং</label>
                  <input
                    type="text"
                    value={writeForm.roll_no}
                    onChange={e => setWriteForm({ ...writeForm, roll_no: e.target.value })}
                    placeholder="যেমন: ৩"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>লেখার ধরন *</label>
                  <select
                    value={writeForm.type}
                    onChange={e => setWriteForm({ ...writeForm, type: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="poem">📜 স্বরচিত কবিতা</option>
                    <option value="story">📖 ছোটগল্প</option>
                    <option value="rhyme">🌸 ছড়া</option>
                    <option value="essay">💡 প্রবন্ধ / নিবন্ধ</option>
                    <option value="book_review">📝 বুক রিভিউ</option>
                    <option value="english">🇬🇧 Creative English Writing</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>লেখার শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={writeForm.title}
                  onChange={e => setWriteForm({ ...writeForm, title: e.target.value })}
                  placeholder="যেমন: শব্দের খেয়ায় পদ্মা পার"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                  <span>লেখার মূল বিষয়বস্তু (কবিতা/গল্প/প্রবন্ধ)</span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>সরাসরি টাইপ করুন অথবা নিচে ফাইল আপলোড করুন</span>
                </label>
                <textarea
                  rows="6"
                  value={writeForm.content}
                  onChange={e => setWriteForm({ ...writeForm, content: e.target.value })}
                  placeholder="তোমার লেখাটি এখানে নির্ভুল বানানে টাইপ করো (অথবা সরাসরি খাতার ছবি / ওয়ার্ড / পিডিএফ ফাইল নিচে আপলোড করুন)..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.6', boxSizing: 'border-box' }}
                />
              </div>

              {/* FILE UPLOAD ATTACHMENT AREA */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
                  <span style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📎 স্বরচিত লেখার ফাইল আপলোড (File Upload)</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>[হাতে লেখার ছবি / ওয়ার্ড / পিডিএফ]</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>
                    সমর্থিত: PDF, Word (docx/doc), Text (txt), ছবি (jpg/png) • সর্বোচ্চ ১০MB
                  </span>
                </label>

                {!writeForm.file_name ? (
                  <div
                    onClick={() => writeFileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) handleFileProcess(e.dataTransfer.files[0]);
                    }}
                    style={{
                      border: isDragging ? '2px dashed #059669' : '2px dashed #94a3b8',
                      background: isDragging ? '#ecfdf5' : '#ffffff',
                      borderRadius: '8px',
                      padding: '16px 14px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="file"
                      ref={writeFileInputRef}
                      onChange={e => { if (e.target.files?.[0]) handleFileProcess(e.target.files[0]); }}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '26px', marginBottom: '4px' }}>📄 📤</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b' }}>
                      ফাইল নির্বাচন করতে এখানে ক্লিক করুন অথবা ফাইলটি ড্র্যাগ করে ছেড়ে দিন
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                      খাতায় স্বহস্তে লেখা কবিতা/গল্পের ছবি (.jpg, .png), মাইক্রোসফট ওয়ার্ড (.docx), অথবা পিডিএফ (.pdf)
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #059669',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '26px' }}>
                        {writeForm.file_type?.includes('image') ? '🖼️' : writeForm.file_name.endsWith('.pdf') ? '📕' : '📝'}
                      </span>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#065f46' }}>
                          {writeForm.file_name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#047857' }}>
                          সাইজ: {writeForm.file_size} • ফাইল সফলভাবে সংযুক্ত হয়েছে
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {writeForm.file_data && writeForm.file_type?.includes('image') && (
                        <img
                          src={writeForm.file_data}
                          alt="সংযুক্ত প্রিভিউ"
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #86efac' }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✕ ফাইল বাতিল
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                🚀 লেখা জমা দিন
              </button>
            </form>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('programs')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: বাৎসরিক কর্মসূচি
            </button>
            <button
              type="button"
              onClick={() => setLitTab('competitions')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: সাহিত্য প্রতিযোগিতা ও ফলাফল ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 8: সাহিত্য প্রতিযোগিতা ও ফলাফল */}
      {/* ========================================================================= */}
      {litTab === 'competitions' && (
        <div>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              ফিচার ৮
            </span>
            <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
              📜 সাহিত্য প্রতিযোগিতা আয়োজন, বিচারকমণ্ডলীর স্কোরিং ও ফলাফল প্রস্তুত
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              আবৃত্তি, রচনা, উপস্থিত বক্তৃতা ও সুন্দর হাতের লেখা প্রতিযোগিতা নিয়ন্ত্রণ ও চূড়ান্ত মেধা তালিকা প্রকাশ
            </p>
          </div>

          <ClubCompetitionEngine activeClub="literature" teachers={teachers} />

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('submission')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: লেখা জমা
            </button>
            <button
              type="button"
              onClick={() => setLitTab('showcase')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: দেয়াল পত্রিকা প্রকাশ ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 9: দেয়াল পত্রিকা প্রকাশ (কিশলয়) */}
      {/* ========================================================================= */}
      {litTab === 'showcase' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৯
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                📰 দেয়াল পত্রিকা ‘কিশলয়’ — প্রকাশনা ও সাহিত্য শোকেস
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের শিক্ষার্থীদের স্বহস্তে রচিত কবিতা, গল্প ও চিত্রাঙ্কনের ত্রৈমাসিক সংকলন
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLitTab('submission')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
            >
              ➕ নতুন লেখা জমা দিন ➔
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {DEFAULT_KISHALAYA_ITEMS.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.date}</span>
                  </div>
                  <h4 style={{ margin: '4px 0', fontSize: '16.5px', color: '#0f172a', fontWeight: 900 }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                    ✍️ {item.author} ({item.class_info})
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.6', fontStyle: 'italic' }}>
                    “{item.excerpt}”
                  </p>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>{item.issue}</small>
                  <button
                    type="button"
                    onClick={() => setReadingItem(item)}
                    style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📖 সম্পূর্ণ পড়ুন
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('competitions')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: সাহিত্য প্রতিযোগিতা
            </button>
            <button
              type="button"
              onClick={() => setLitTab('achievements')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: অর্জন ও ট্রফি গ্যালারি ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 10: অর্জন ও ট্রফি গ্যালারি */}
      {/* ========================================================================= */}
      {litTab === 'achievements' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              ফিচার ১০
            </span>
            <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
              🏆 ক্লাবের গৌরবময় অর্জন ও ট্রফি গ্যালারি
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              উপজেলা, জেলা ও জাতীয় পর্যায়ে ভাষা ও সাহিত্য ক্লাবের অবিস্মরণীয় সাফল্যগাথা
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              {
                icon: '🏆',
                year: '২০২৫',
                title: 'কালিহাতি উপজেলা সাহিত্য সপ্তাহ — সামগ্রিক চ্যাম্পিয়ন',
                desc: 'আবৃত্তি ও স্বরচিত গল্প প্রতিযোগিতায় উপজেলার সকল বিদ্যালয়ের মধ্যে সর্বোচ্চ পয়েন্ট অর্জন।',
                status: 'চ্যাম্পিয়ন ট্রফি'
              },
              {
                icon: '🥇',
                year: '২০২৫',
                title: 'টাঙ্গাইল জেলা সৃজনশীল মেধা অন্বেষণ — ১ম স্থান',
                desc: '‘ভাষা ও সাহিত্য’ বিভাগে ১০ম শ্রেণির শিক্ষার্থী তানভীর আহমেদ জেলা পর্যায়ে প্রথম স্থান অধিকার করেন।',
                status: 'স্বর্ণপদক ও সনদ'
              },
              {
                icon: '🥈',
                year: '২০২৪',
                title: 'জাতীয় রবীন্দ্র-নজরুল জন্মজয়ন্তী কবিতা আবৃত্তি — ২য় স্থান',
                desc: 'উপজেলা পর্যায়ের চূড়ান্ত পর্বে ৯ম শ্রেণির ছাত্রী ফাতেমা আক্তার নজরুলের ‘বিদ্রোহী’ আবৃত্তি করে রানার্স-আপ হন।',
                status: 'রৌপ্যপদক'
              },
              {
                icon: '🎖️',
                year: '২০২৪',
                title: 'জেলা পর্যায়ে ‘সেরা দেয়াল পত্রিকা’ বিশেষ স্বীকৃতি',
                desc: 'মগড়া পালস্ স্কুলের ত্রৈমাসিক দেয়াল পত্রিকা ‘কিশলয়’ টাঙ্গাইল জেলার মধ্যে শ্রেষ্ঠ দেয়াল পত্রিকা হিসেবে পুরস্কৃত।',
                status: 'বিশেষ স্মারক'
              }
            ].map((ach, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '32px' }}>{ach.icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                      {ach.year}
                    </span>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                      {ach.status}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', color: '#0f172a', fontWeight: 800 }}>
                    {ach.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('showcase')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: দেয়াল পত্রিকা প্রকাশ
            </button>
            <button
              type="button"
              onClick={() => setLitTab('conduct')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: শৃংখলা ও আচরণ বিধি ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 11: শৃংখলা ও আচরণ বিধি */}
      {/* ========================================================================= */}
      {litTab === 'conduct' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 10px rgba(4,120,87,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১১
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '19px', fontWeight: 900, color: '#065f46' }}>
                ⚖️ ভাষা ও সাহিত্য ক্লাব শৃংখলা ও আচরণ বিধি (Code of Conduct)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                ক্লাবের প্রত্যেক সদস্য ও কার্যনির্বাহী পরিষদ সদস্যের জন্য অবশ্য পালনীয় ৭টি শৃঙ্খলা বিধি
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrintConductPad}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🖨️</span>
              <span>আচরণ বিধি প্রিন্ট</span>
            </button>
          </div>

          {/* 7 Rules Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { num: '১', rule: 'বাংলা ও ইংরেজি উভয় ভাষার প্রতি সম্মান প্রদর্শন করতে হবে।' },
              { num: '২', rule: 'ভাষা ব্যবহারে শালীনতা ও শুদ্ধতা বজায় রাখতে হবে।' },
              { num: '৩', rule: 'অন্যের লেখা অনুমতি ছাড়া নিজের নামে প্রকাশ করা যাবে না।' },
              { num: '৪', rule: 'সাহিত্যচর্চায় ধর্ম, বর্ণ, লিঙ্গ বা ব্যক্তিগত পরিচয় নিয়ে বিদ্বেষমূলক বক্তব্য দেওয়া যাবে না।' },
              { num: '৫', rule: 'অন্যের মতামত ও সৃজনশীলতাকে সম্মান করতে হবে।' },
              { num: '৬', rule: 'সাহিত্য ও প্রকাশনার ক্ষেত্রে তথ্যের সত্যতা যাচাই করতে হবে।' },
              { num: '৭', rule: 'ক্লাবের কার্যক্রমে নিয়মিত অংশগ্রহণ করতে হবে।' }
            ].map(r => (
              <div
                key={r.num}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '13px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {r.num}
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', lineHeight: '1.5' }}>
                  {r.rule}
                </div>
              </div>
            ))}
          </div>

          {/* Member Pledge Box */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '2px dashed #059669',
            borderRadius: '10px',
            padding: '16px 20px',
            textAlign: 'center'
          }}>
            <b style={{ color: '#065f46', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              📜 ক্লাবের সদস্যের নৈতিক অঙ্গীকার (Student Pledge)
            </b>
            <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: '1.7', fontStyle: 'italic' }}>
              “আমি শপথ করছি যে, আমি ভাষা ও সাহিত্য ক্লাবের প্রতিটি নিয়ম ও শৃংখলা নিষ্ঠার সাথে মেনে চলব। মাতৃভাষার শুদ্ধতা রক্ষা করব, সকল ভাষার প্রতি শ্রদ্ধাশীল হব এবং আমার সৃজনশীল মনন দিয়ে সমাজ ও দেশের কল্যাণে অবদান রাখব।”
            </p>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setLitTab('achievements')}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⬅️ পূর্ববর্তী: অর্জন ও ট্রফি গ্যালারি
            </button>
            <button
              type="button"
              onClick={() => setLitTab('identity')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              ১ম ফিচার: ক্লাব পরিচিতি ➔
            </button>
          </div>
        </div>
      )}

      {/* READING MODAL FOR KISHALAYA ARTICLES */}
      {readingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            border: '2px solid #059669'
          }}>
            <div style={{ background: '#065f46', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  {readingItem.type}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 900 }}>
                  {readingItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px', marginBottom: '14px', fontSize: '12.5px' }}>
                <div>
                  <b>লেখক:</b> {readingItem.author} ({readingItem.class_info})
                </div>
                <div style={{ color: '#64748b' }}>
                  📅 {readingItem.date}
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#1e293b',
                whiteSpace: 'pre-line',
                fontFamily: readingItem.type.includes('English') ? 'Arial, sans-serif' : "'SolaimanLipi', sans-serif"
              }}>
                {readingItem.full_text}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#64748b' }}>দেয়াল পত্রিকা ‘কিশলয়’ • মগড়া পালস্ ভাষা ও সাহিত্য ক্লাব</small>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handlePrintReadingItem(readingItem)}
                    style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    🖨️ অফিসিয়াল প্যাডে প্রিন্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingItem(null)}
                    style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

