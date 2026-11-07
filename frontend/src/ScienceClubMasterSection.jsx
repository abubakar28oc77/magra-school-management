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
  SCIENCE_PANEL_KEY,
  SCIENCE_EXEC_KEY,
  SCIENCE_DEPTS_KEY,
  SCIENCE_ACTIVITIES_KEY,
  SCIENCE_QUARTERLY_KEY,
  SCIENCE_MONTHLY_KEY,
  SCIENCE_SELECTION_RULES_KEY,
  SCIENCE_DISCIPLINE_RULES_KEY,
  SCIENCE_MEMBERSHIPS_KEY,
  SCIENCE_SUBMISSIONS_KEY,
  SCIENCE_FAIR_KEY,
  SCIENCE_ACHIEVEMENTS_KEY,
  DEFAULT_SCIENCE_PANEL,
  DEFAULT_SCIENCE_EXEC,
  DEFAULT_SCIENCE_DEPTS,
  DEFAULT_SCIENCE_ACTIVITIES,
  DEFAULT_SCIENCE_QUARTERLY,
  DEFAULT_SCIENCE_MONTHLY,
  DEFAULT_SCIENCE_SELECTION_RULES,
  DEFAULT_SCIENCE_DISCIPLINE_RULES,
  DEFAULT_SCIENCE_SUBMISSIONS,
  DEFAULT_SCIENCE_FAIR_PROJECTS,
  DEFAULT_SCIENCE_ACHIEVEMENTS,
  SCIENCE_TABS
} from './clubs/science/scienceData';


export function ScienceClubMasterSection({ teachers = [], initialTab = 'overview', onBackToHub }) {
  const [sciTab, setSciTab] = useState(initialTab || 'overview');

  useEffect(() => {
    if (initialTab) setSciTab(initialTab);
  }, [initialTab]);

  const activeTeachers = (teachers && teachers.length > 0 ? teachers : MOCK_TEACHERS).filter(
    t => t.status !== 'inactive'
  );

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
      const raw = localStorage.getItem(SCIENCE_PANEL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_PANEL;
  });

  const persistPanel = (updated) => {
    try {
      localStorage.setItem(SCIENCE_PANEL_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleChangeJudge = (slot, teacherId) => {
    const t = activeTeachers.find(x => (x.id === teacherId || x.employee_id === teacherId)) || activeTeachers[0];
    const updated = {
      ...panelData,
      judges: {
        ...panelData.judges,
        [slot]: {
          ...panelData.judges?.[slot],
          teacherId: t.id || t.employee_id,
          name: t.name_bn || t.name_en,
          designation: t.designation || 'শিক্ষক'
        }
      }
    };
    setPanelData(updated);
    persistPanel(updated);
  };

  // Executive Committee State
  const [execData, setExecData] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_EXEC_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_EXEC;
  });

  const persistExec = (updated) => {
    try {
      localStorage.setItem(SCIENCE_EXEC_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Departments (Wings) State
  const [departments, setDepartments] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_DEPTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_DEPTS;
  });

  const persistDepartments = (updated) => {
    try {
      localStorage.setItem(SCIENCE_DEPTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Regular Activities State
  const [activities, setActivities] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_ACTIVITIES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_ACTIVITIES;
  });

  const persistActivities = (updated) => {
    try {
      localStorage.setItem(SCIENCE_ACTIVITIES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Quarterly Plans State
  const [quarterlyPlans, setQuarterlyPlans] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_QUARTERLY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_QUARTERLY;
  });

  const persistQuarterlyPlans = (updated) => {
    try {
      localStorage.setItem(SCIENCE_QUARTERLY_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Monthly Calendar State
  const [monthlyCalendar, setMonthlyCalendar] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_MONTHLY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_MONTHLY;
  });

  const persistMonthlyCalendar = (updated) => {
    try {
      localStorage.setItem(SCIENCE_MONTHLY_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Selection Rules State
  const [selectionRules, setSelectionRules] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_SELECTION_RULES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_SELECTION_RULES;
  });

  const persistSelectionRules = (updated) => {
    try {
      localStorage.setItem(SCIENCE_SELECTION_RULES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Discipline & Safety Rules State
  const [disciplineRules, setDisciplineRules] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_DISCIPLINE_RULES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_DISCIPLINE_RULES;
  });

  const persistDisciplineRules = (updated) => {
    try {
      localStorage.setItem(SCIENCE_DISCIPLINE_RULES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Memberships State
  const [memberships, setMemberships] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_MEMBERSHIPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        trackingId: 'SCI-2026-0101',
        student_name: 'তানভীর আহমেদ',
        class_name: '১০ম',
        section: 'বিজ্ঞান',
        roll_no: '১',
        guardian_name: 'মোঃ জহিরুল ইসলাম',
        mobile: '01711-987651',
        wing_preference: 'পদার্থবিজ্ঞান বিভাগ',
        device_access: 'ল্যাব ও সায়েন্স কিট আছে',
        reason: 'ভবিষ্যতে পদার্থবিজ্ঞানী হয়ে নতুন শক্তি আবিষ্কারের স্বপ্ন দেখি।',
        status: 'অনুমোদিত',
        date: '২০২৬-০১-১৮'
      },
      {
        trackingId: 'SCI-2026-0102',
        student_name: 'মেহজাবীন আক্তার',
        class_name: '১০ম',
        section: 'বিজ্ঞান',
        roll_no: '২',
        guardian_name: 'মোঃ খোরশেদ আলম',
        mobile: '01711-987652',
        wing_preference: 'রসায়ন বিভাগ',
        device_access: 'ল্যাবে নিয়মিত অনুশীলনের সুযোগ চাই',
        reason: 'পরিবেশ দূষণ রোধ ও নিরাপদ পানি তৈরির রাসায়নিক প্রকল্পে আগ্রহী।',
        status: 'অনুমোদিত',
        date: '২০২৬-০১-২০'
      },
      {
        trackingId: 'SCI-2026-0103',
        student_name: 'রাহাত হাসান',
        class_name: '৯ম',
        section: 'বিজ্ঞান',
        roll_no: '১',
        guardian_name: 'মোঃ হাসানুল হক',
        mobile: '01711-987653',
        wing_preference: 'জীববিজ্ঞান বিভাগ',
        device_access: 'মাইক্রোস্কোপ পর্যবেক্ষণ ও স্লাইড তৈরি',
        reason: 'কোষের গঠন ও মানবদেহের জটিল রোগ নিরাময় নিয়ে গবেষণা করার আগ্রহ।',
        status: 'অনুমোদিত',
        date: '২০২৬-০১-২২'
      }
    ];
  });

  const persistMemberships = (updated) => {
    try {
      localStorage.setItem(SCIENCE_MEMBERSHIPS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Submissions State (Projects, Posters, Articles)
  const [submissions, setSubmissions] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_SUBMISSIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_SUBMISSIONS;
  });

  const persistSubmissions = (updated) => {
    try {
      localStorage.setItem(SCIENCE_SUBMISSIONS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Fair Projects State
  const [fairProjects, setFairProjects] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_FAIR_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_FAIR_PROJECTS;
  });

  const persistFairProjects = (updated) => {
    try {
      localStorage.setItem(SCIENCE_FAIR_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Achievements State
  const [achievements, setAchievements] = useState(() => {
    try {
      const raw = localStorage.getItem(SCIENCE_ACHIEVEMENTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SCIENCE_ACHIEVEMENTS;
  });

  const persistAchievements = (updated) => {
    try {
      localStorage.setItem(SCIENCE_ACHIEVEMENTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Section options helper for Class
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

  // Add Coordinator State
  const [newCoordTeacherId, setNewCoordTeacherId] = useState(activeTeachers[0]?.id || 't-8');
  const [newCoordRole, setNewCoordRole] = useState('সহকারী সমন্বয়ক (পদার্থ ও রোবটিক্স)');
  const [newCoordPhone, setNewCoordPhone] = useState('01719-274938');

  // Edit Coordinator Modal State
  const [editingCoordinator, setEditingCoordinator] = useState(null);
  const [coordEditForm, setCoordEditForm] = useState({ id: '', name: '', designation: '', role: '', phone: '' });

  // Add Executive Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberClass, setNewMemberClass] = useState('৮ম');
  const [newMemberSection, setNewMemberSection] = useState('শাখা ক');
  const [newMemberRoll, setNewMemberRoll] = useState('');

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

  // Edit Executive Member Modal
  const [editingExecMember, setEditingExecMember] = useState(null);
  const [memberEditForm, setMemberEditForm] = useState({ id: '', name: '', class: '৮ম', section: 'শাখা ক', roll: '' });

  // Edit Executive Post Modal
  const [editingExecPost, setEditingExecPost] = useState(null);
  const [execEditForm, setExecEditForm] = useState({ name: '', class: '১০ম', section: 'বিজ্ঞান', roll: '', phone: '' });

  // EDIT DEPARTMENT MODAL STATE
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deptEditForm, setDeptEditForm] = useState({
    id: '',
    num: '',
    title: '',
    titleEn: '',
    inCharge: '',
    icon: '🔬',
    summary: '',
    experimentsText: ''
  });

  // EDIT REGULAR ACTIVITY MODAL STATE
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityEditForm, setActivityEditForm] = useState({
    id: '',
    num: '',
    title: '',
    focus: '',
    time: '',
    venue: '',
    details: ''
  });

  // EDIT QUARTERLY ROADMAP MODAL STATE
  const [editingQuarter, setEditingQuarter] = useState(null);
  const [quarterEditForm, setQuarterEditForm] = useState({
    id: '',
    quarter: '',
    title: '',
    color: '#059669',
    itemsText: ''
  });

  // EDIT MONTHLY CALENDAR MODAL STATE
  const [editingMonth, setEditingMonth] = useState(null);
  const [monthEditForm, setMonthEditForm] = useState({
    id: '',
    month: '',
    title: '',
    date: '',
    coordinator: ''
  });

  // EDIT SELECTION RULE MODAL STATE
  const [editingSelectionRule, setEditingSelectionRule] = useState(null);
  const [selectionRuleEditForm, setSelectionRuleEditForm] = useState({
    id: '',
    num: '',
    title: '',
    text: ''
  });

  // EDIT DISCIPLINE RULE MODAL STATE
  const [editingDisciplineRule, setEditingDisciplineRule] = useState(null);
  const [disciplineRuleEditForm, setDisciplineRuleEditForm] = useState({
    id: '',
    num: '',
    rule: '',
    desc: ''
  });

  // EDIT FAIR PROJECT MODAL STATE
  const [editingFairProject, setEditingFairProject] = useState(null);
  const [fairEditForm, setFairEditForm] = useState({
    id: '',
    title: '',
    category: '',
    wing: '',
    teamLeader: '',
    class_name: '১০ম',
    section: 'বিজ্ঞান',
    roll: '',
    stallNo: '',
    desc: '',
    award: '',
    status: 'অনুমোদিত'
  });

  // EDIT ACHIEVEMENT MODAL STATE
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [achEditForm, setAchEditForm] = useState({
    id: '',
    year: '২০২৬',
    event: '',
    level: 'উপজেলা পর্যায়',
    position: '',
    project: '',
    team: '',
    creators: '',
    note: ''
  });

  // Membership Application Form State
  const [memberForm, setMemberForm] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '',
    guardian_name: '',
    mobile: '',
    wing_preference: 'পদার্থবিজ্ঞান বিভাগ',
    device_access: 'ল্যাব ও বিজ্ঞানাগার সুবিধা চাই',
    reason: ''
  });

  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // Filter States for Memberships
  const [memberFilterClass, setMemberFilterClass] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');

  // Submissions (Projects/Banners/Posters) State
  const [writeForm, setWriteForm] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll: '',
    type: 'বিজ্ঞান প্রকল্প',
    title: '',
    summary: '',
    file_name: '',
    file_size: '',
    file_type: '',
    file_data: ''
  });

  const fileInputRef = useRef(null);
  const [readingItem, setReadingItem] = useState(null);
  const [submissionFilterType, setSubmissionFilterType] = useState('all');
  const [submissionSearch, setSubmissionSearch] = useState('');

  // Science Fair State
  const [fairForm, setFairForm] = useState({
    title: '',
    category: 'কৃষি ও নবায়নযোগ্য জ্বালানি',
    wing: 'পদার্থবিজ্ঞান বিভাগ',
    teamLeader: '',
    class_name: '১০ম',
    section: 'বিজ্ঞান',
    roll: '',
    stallNo: 'স্টল-' + toBn(Math.floor(10 + Math.random() * 90)),
    desc: ''
  });
  const [fairFilterWing, setFairFilterWing] = useState('all');
  const [fairSearch, setFairSearch] = useState('');

  // Achievements Filter State
  const [achievementFilterLevel, setAchievementFilterLevel] = useState('all');
  const [achievementSearch, setAchievementSearch] = useState('');

  // Lab Safety Student Pledge State
  const [pledgeForm, setPledgeForm] = useState({
    student_name: '',
    class_name: '৯ম',
    section: 'বিজ্ঞান',
    roll_no: '',
    signed: false
  });

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }
    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';

    if (file.name.endsWith('.txt') || file.type === 'text/plain') {
      const textReader = new FileReader();
      textReader.onload = (ev) => {
        const textContent = ev.target?.result;
        if (typeof textContent === 'string' && !writeForm.summary.trim()) {
          setWriteForm(prev => ({
            ...prev,
            summary: textContent.slice(0, 500),
            file_name: file.name,
            file_size: formattedSize,
            file_type: file.type || 'text/plain',
            file_data: textContent
          }));
          showToast(`✓ "${file.name}" টেক্সট ফাইল আপলোড ও বিবরণে যুক্ত হয়েছে!`);
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
      showToast(`✓ "${file.name}" ফাইলটি সফলভাবে সংযুক্ত হয়েছে!`);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('সংযুক্ত ফাইলটি মুছে ফেলা হয়েছে।');
  };

  // =========================================================================
  // COORDINATORS & JUDGES CRUD
  // =========================================================================
  const handleAddCoordinator = (e) => {
    e.preventDefault();
    const teacher = activeTeachers.find(t => t.id === newCoordTeacherId);
    if (!teacher) {
      alert('অনুগ্রহ করে একজন শিক্ষক নির্বাচন করুন।');
      return;
    }
    const newCoord = {
      id: 'coord-' + Date.now(),
      teacherId: teacher.id,
      name: teacher.name_bn || teacher.name,
      designation: teacher.designation,
      role: newCoordRole.trim() || 'সহকারী সমন্বয়ক',
      phone: newCoordPhone.trim() || teacher.phone || '01719-274938'
    };
    const updated = {
      ...panelData,
      coordinators: [...(panelData.coordinators || []), newCoord]
    };
    setPanelData(updated);
    persistPanel(updated);
    showToast(`✓ "${newCoord.name}" কে সমন্বয়ক হিসেবে যুক্ত করা হয়েছে!`);
  };

  const handleStartEditCoordinator = (coord) => {
    setEditingCoordinator(coord);
    setCoordEditForm({
      id: coord.id,
      name: coord.name,
      designation: coord.designation,
      role: coord.role,
      phone: coord.phone
    });
  };

  const handleSaveCoordinatorEdit = (e) => {
    e.preventDefault();
    if (!editingCoordinator) return;
    const updatedCoords = (panelData.coordinators || []).map(c => {
      if (c.id === editingCoordinator.id) {
        return {
          ...c,
          name: coordEditForm.name.trim(),
          designation: coordEditForm.designation.trim(),
          role: coordEditForm.role.trim(),
          phone: coordEditForm.phone.trim()
        };
      }
      return c;
    });
    const updated = { ...panelData, coordinators: updatedCoords };
    setPanelData(updated);
    persistPanel(updated);
    setEditingCoordinator(null);
    showToast('সমন্বয়কের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  const handleDeleteCoordinator = (coordId) => {
    if (!window.confirm('আপনি কি এই সমন্বয়ককে তালিকা থেকে বাদ দিতে চান?')) return;
    const updated = {
      ...panelData,
      coordinators: (panelData.coordinators || []).filter(c => c.id !== coordId)
    };
    setPanelData(updated);
    persistPanel(updated);
    showToast('সমন্বয়ক অপসারিত হয়েছেন।');
  };

  // =========================================================================
  // EXECUTIVE COMMITTEE CRUD
  // =========================================================================
  const handleAddExecutiveMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      alert('সদস্যের নাম লিখুন।');
      return;
    }
    const newM = {
      id: 'sm-' + Date.now(),
      name: newMemberName.trim(),
      class: newMemberClass,
      section: newMemberSection,
      roll: newMemberRoll.trim() || '—'
    };
    const updated = {
      ...execData,
      members: [...(execData.members || []), newM]
    };
    setExecData(updated);
    persistExec(updated);
    setNewMemberName('');
    setNewMemberRoll('');
    showToast(`✓ "${newM.name}" কে কার্যনির্বাহী সদস্য হিসেবে অন্তর্ভুক্ত করা হয়েছে!`);
  };

  const handleStartEditMember = (member) => {
    setEditingExecMember(member);
    setMemberEditForm({
      id: member.id,
      name: member.name,
      class: member.class || '৮ম',
      section: member.section || 'শাখা ক',
      roll: member.roll || ''
    });
  };

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
          roll: memberEditForm.roll.trim()
        };
      }
      return m;
    });
    const updated = { ...execData, members: updatedMembers };
    setExecData(updated);
    persistExec(updated);
    setEditingExecMember(null);
    showToast('সদস্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  const handleDeleteMember = (memberId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সদস্যকে পরিষদ থেকে মুছে ফেলতে চান?')) return;
    const updated = {
      ...execData,
      members: (execData.members || []).filter(m => m.id !== memberId)
    };
    setExecData(updated);
    persistExec(updated);
    showToast('সদস্যকে পরিষদ থেকে অপসারিত করা হয়েছে।');
  };

  const handleStartEditExecPost = (postKey) => {
    const post = execData.posts?.[postKey];
    if (!post) return;
    setEditingExecPost(postKey);
    setExecEditForm({
      name: post.name || '',
      class: post.class || '১০ম',
      section: post.section || 'বিজ্ঞান',
      roll: post.roll || '',
      phone: post.phone || ''
    });
  };

  const handleSaveExecPost = (e) => {
    e.preventDefault();
    if (!editingExecPost) return;
    const currentPost = execData.posts?.[editingExecPost];
    const updatedPosts = {
      ...execData.posts,
      [editingExecPost]: {
        ...currentPost,
        name: execEditForm.name.trim(),
        class: execEditForm.class,
        section: execEditForm.section,
        roll: execEditForm.roll.trim(),
        phone: execEditForm.phone.trim()
      }
    };
    const updated = { ...execData, posts: updatedPosts };
    setExecData(updated);
    persistExec(updated);
    setEditingExecPost(null);
    showToast(`✓ "${currentPost.title}" পদের তথ্য সংরক্ষিত হয়েছে!`);
  };

  // =========================================================================
  // DEPARTMENTS (WINGS) CRUD
  // =========================================================================
  const handleStartEditDepartment = (dept) => {
    setEditingDepartment(dept);
    setDeptEditForm({
      id: dept.id,
      num: dept.num,
      title: dept.title,
      titleEn: dept.titleEn || '',
      inCharge: dept.inCharge || '',
      icon: dept.icon || '🔬',
      summary: dept.summary || '',
      experimentsText: (dept.experiments || []).join('\n')
    });
  };

  const handleSaveDepartmentEdit = (e) => {
    e.preventDefault();
    if (!editingDepartment) return;
    const expList = deptEditForm.experimentsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const updated = departments.map(d => {
      if (d.id === editingDepartment.id) {
        return {
          ...d,
          num: deptEditForm.num || d.num,
          title: deptEditForm.title.trim(),
          titleEn: deptEditForm.titleEn.trim(),
          inCharge: deptEditForm.inCharge.trim(),
          icon: deptEditForm.icon.trim() || '🔬',
          summary: deptEditForm.summary.trim(),
          experiments: expList
        };
      }
      return d;
    });
    setDepartments(updated);
    persistDepartments(updated);
    setEditingDepartment(null);
    showToast(`✓ "${deptEditForm.title.trim()}" বিভাগ সফলভাবে সংরক্ষিত হয়েছে!`);
  };

  const handleDeleteDepartment = (deptId) => {
    if (!window.confirm('আপনি কি এই বিজ্ঞান বিভাগটি মুছে ফেলতে চান?')) return;
    const updated = departments.filter(d => d.id !== deptId);
    setDepartments(updated);
    persistDepartments(updated);
    showToast('বিভাগ অপসারিত হয়েছে।');
  };

  const handleAddNewDepartment = () => {
    const nextNum = toBn(departments.length + 1);
    const newDept = {
      id: 'dept-' + Date.now(),
      num: nextNum,
      title: 'নতুন বিজ্ঞান শাখা',
      titleEn: 'Department of Science Wing',
      inCharge: 'সিনিয়র শিক্ষক (বিজ্ঞান)',
      icon: '🚀',
      color: '#0891b2',
      summary: 'এই বিভাগের মূল ক্ষেত্র ও নিয়মিত কার্যক্রমের বিবরণ লিখুন।',
      experiments: ['হাতে-কলমে পরীক্ষা ১', 'প্র্যাকটিক্যাল সেশন ২']
    };
    const updated = [...departments, newDept];
    setDepartments(updated);
    persistDepartments(updated);
    handleStartEditDepartment(newDept);
    showToast('নতুন বিভাগ যুক্ত হয়েছে। অনুগ্রহ করে সম্পাদনা করুন।');
  };

  // =========================================================================
  // REGULAR ACTIVITIES CRUD
  // =========================================================================
  const handleStartEditActivity = (act) => {
    setEditingActivity(act);
    setActivityEditForm({
      id: act.id,
      num: act.num,
      title: act.title,
      focus: act.focus,
      time: act.time,
      venue: act.venue,
      details: act.details
    });
  };

  const handleSaveActivityEdit = (e) => {
    e.preventDefault();
    if (!editingActivity) return;
    const updated = activities.map(act => {
      if (act.id === editingActivity.id) {
        return {
          ...act,
          num: activityEditForm.num || act.num,
          title: activityEditForm.title.trim(),
          focus: activityEditForm.focus.trim(),
          time: activityEditForm.time.trim(),
          venue: activityEditForm.venue.trim(),
          details: activityEditForm.details.trim()
        };
      }
      return act;
    });
    setActivities(updated);
    persistActivities(updated);
    setEditingActivity(null);
    showToast(`✓ "${activityEditForm.title.trim()}" সফলভাবে হালনাগাদ করা হয়েছে!`);
  };

  const handleDeleteActivity = (actId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই কার্যক্রমটি মুছে ফেলতে চান?')) return;
    const updated = activities.filter(a => a.id !== actId);
    setActivities(updated);
    persistActivities(updated);
    showToast('কার্যক্রমটি অপসারিত হয়েছে!');
  };

  const handleAddNewActivity = () => {
    const nextNum = toBn(activities.length + 1);
    const newAct = {
      id: 'act-' + Date.now(),
      num: nextNum,
      title: 'নতুন নিয়মিত কার্যক্রম',
      focus: 'বিজ্ঞানভিত্তিক নিয়মিত সেশন',
      time: 'প্রতি সপ্তাহের নির্দিষ্ট দিন',
      venue: 'বিজ্ঞানাগার ও রিসার্চ ল্যাব',
      details: 'এই কার্যক্রমের সুনির্দিষ্ট লক্ষ্য ও বাস্তবায়ন পরিকল্পনা লিখুন।'
    };
    const updated = [...activities, newAct];
    setActivities(updated);
    persistActivities(updated);
    handleStartEditActivity(newAct);
    showToast('নতুন কার্যক্রম যুক্ত হয়েছে!');
  };

  // =========================================================================
  // QUARTERLY ROADMAP CRUD
  // =========================================================================
  const handleStartEditQuarter = (q, idx) => {
    setEditingQuarter({ ...q, _index: idx });
    setQuarterEditForm({
      id: q.id || '',
      quarter: q.quarter || '',
      title: q.title || '',
      color: q.color || '#059669',
      itemsText: (q.items || []).join('\n')
    });
  };

  const handleSaveQuarterEdit = (e) => {
    e.preventDefault();
    if (!editingQuarter) return;
    const itemsList = quarterEditForm.itemsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const updated = quarterlyPlans.map((q, idx) => {
      const match = q.id ? q.id === editingQuarter.id : idx === editingQuarter._index;
      if (match) {
        return {
          ...q,
          quarter: quarterEditForm.quarter.trim(),
          title: quarterEditForm.title.trim(),
          color: quarterEditForm.color,
          items: itemsList
        };
      }
      return q;
    });
    setQuarterlyPlans(updated);
    persistQuarterlyPlans(updated);
    setEditingQuarter(null);
    showToast(`রোডম্যাপ "${quarterEditForm.quarter.trim()}" হালনাগাদ করা হয়েছে!`);
  };

  const handleDeleteQuarter = (idOrIdx) => {
    if (!window.confirm('আপনি কি এই ত্রৈমাসিক রোডম্যাপটি মুছে ফেলতে চান?')) return;
    const updated = quarterlyPlans.filter((q, idx) => (q.id ? q.id !== idOrIdx : idx !== idOrIdx));
    setQuarterlyPlans(updated);
    persistQuarterlyPlans(updated);
    showToast('ত্রৈমাসিক রোডম্যাপ অপসারিত হয়েছে!');
  };

  const handleAddNewQuarter = () => {
    const newQ = {
      id: 'q-' + Date.now(),
      quarter: 'বিশেষ কোয়ার্টার',
      title: 'বিজ্ঞান উদ্ভাবন ও প্রজেক্ট প্রদর্শনী',
      color: '#0d9488',
      items: ['বিশেষ কর্মশালা ও প্রশিক্ষণ', 'আন্তঃশ্রেণি বিজ্ঞান কুইজ', 'অলিম্পিয়াড বুটক্যাম্প']
    };
    const updated = [...quarterlyPlans, newQ];
    setQuarterlyPlans(updated);
    persistQuarterlyPlans(updated);
    handleStartEditQuarter(newQ, quarterlyPlans.length);
    showToast('নতুন ত্রৈমাসিক রোডম্যাপ যুক্ত হয়েছে!');
  };

  // =========================================================================
  // MONTHLY CALENDAR CRUD
  // =========================================================================
  const handleStartEditMonth = (m, idx) => {
    setEditingMonth({ ...m, _index: idx });
    setMonthEditForm({
      id: m.id || '',
      month: m.month || '',
      title: m.title || '',
      date: m.date || '',
      coordinator: m.coordinator || ''
    });
  };

  const handleSaveMonthEdit = (e) => {
    e.preventDefault();
    if (!editingMonth) return;
    const updated = monthlyCalendar.map((m, idx) => {
      const match = m.id ? m.id === editingMonth.id : idx === editingMonth._index;
      if (match) {
        return {
          ...m,
          month: monthEditForm.month.trim(),
          title: monthEditForm.title.trim(),
          date: monthEditForm.date.trim(),
          coordinator: monthEditForm.coordinator.trim()
        };
      }
      return m;
    });
    setMonthlyCalendar(updated);
    persistMonthlyCalendar(updated);
    setEditingMonth(null);
    showToast(`মাসের কর্মসূচি "${monthEditForm.month.trim()}" সংরক্ষিত হয়েছে!`);
  };

  const handleDeleteMonth = (idOrIdx) => {
    if (!window.confirm('আপনি কি এই মাসের কর্মসূচিটি মুছে ফেলতে চান?')) return;
    const updated = monthlyCalendar.filter((m, idx) => (m.id ? m.id !== idOrIdx : idx !== idOrIdx));
    setMonthlyCalendar(updated);
    persistMonthlyCalendar(updated);
    showToast('মাসের কর্মসূচি অপসারিত হয়েছে!');
  };

  const handleAddNewMonth = () => {
    const newM = {
      id: 'm-' + Date.now(),
      month: 'বিশেষ মাস',
      title: 'বিজ্ঞান উৎসব ও উদ্ভাবন কর্মশালা',
      date: 'নির্ধারিত তারিখ',
      coordinator: 'মোঃ হাবিবুর রহমান'
    };
    const updated = [...monthlyCalendar, newM];
    setMonthlyCalendar(updated);
    persistMonthlyCalendar(updated);
    handleStartEditMonth(newM, monthlyCalendar.length);
    showToast('নতুন মাসের কর্মসূচি যুক্ত হয়েছে!');
  };

  // =========================================================================
  // SELECTION RULES CRUD
  // =========================================================================
  const handleStartEditSelectionRule = (rule) => {
    setEditingSelectionRule(rule);
    setSelectionRuleEditForm({
      id: rule.id || '',
      num: rule.num || '',
      title: rule.title || '',
      text: rule.text || ''
    });
  };

  const handleSaveSelectionRuleEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingSelectionRule) return;
    if (!selectionRuleEditForm.title.trim() || !selectionRuleEditForm.text.trim()) {
      alert('মানদণ্ডের শিরোনাম ও বিবরণ পূরণ করা আবশ্যক।');
      return;
    }
    const updated = (selectionRules || []).map(r => {
      const isMatch = (r.id && r.id === editingSelectionRule.id) || (!r.id && r.num === editingSelectionRule.num);
      if (isMatch) {
        return {
          ...r,
          num: selectionRuleEditForm.num || r.num,
          title: selectionRuleEditForm.title.trim(),
          text: selectionRuleEditForm.text.trim()
        };
      }
      return r;
    });
    setSelectionRules(updated);
    persistSelectionRules(updated);
    setEditingSelectionRule(null);
    showToast('✓ সদস্য নির্বাচনের মানদণ্ড সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  const handleDeleteSelectionRule = (targetRule) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${targetRule.title}" মানদণ্ডটি মুছে ফেলতে চান?`)) return;
    const updated = (selectionRules || []).filter(r => (r.id ? r.id !== targetRule.id : r.num !== targetRule.num));
    setSelectionRules(updated);
    persistSelectionRules(updated);
    showToast('মানদণ্ডটি মুছে ফেলা হয়েছে।');
  };

  const handleAddNewSelectionRule = () => {
    const nextNum = toBn((selectionRules || []).length + 1);
    const newRule = {
      id: `sr-${Date.now()}`,
      num: nextNum,
      title: 'নতুন নির্বাচনী মানদণ্ড',
      text: 'এই মানদণ্ডের বিস্তারিত বিবরণ এখানে লিখুন।'
    };
    const updated = [...(selectionRules || []), newRule];
    setSelectionRules(updated);
    persistSelectionRules(updated);
    handleStartEditSelectionRule(newRule);
    showToast('নতুন মানদণ্ড যুক্ত হয়েছে। অনুগ্রহ করে সম্পাদনা করুন।');
  };

  // =========================================================================
  // DISCIPLINE & SAFETY RULES CRUD
  // =========================================================================
  const handleStartEditDisciplineRule = (rule) => {
    setEditingDisciplineRule(rule);
    setDisciplineRuleEditForm({
      id: rule.id || '',
      num: rule.num || '',
      rule: rule.rule || '',
      desc: rule.desc || ''
    });
  };

  const handleSaveDisciplineRuleEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingDisciplineRule) return;
    if (!disciplineRuleEditForm.rule.trim() || !disciplineRuleEditForm.desc.trim()) {
      alert('নিয়মের শিরোনাম ও বিবরণ পূরণ করা আবশ্যক।');
      return;
    }
    const updated = (disciplineRules || []).map(r => {
      const isMatch = (r.id && r.id === editingDisciplineRule.id) || (!r.id && r.num === editingDisciplineRule.num);
      if (isMatch) {
        return {
          ...r,
          num: disciplineRuleEditForm.num || r.num,
          rule: disciplineRuleEditForm.rule.trim(),
          desc: disciplineRuleEditForm.desc.trim()
        };
      }
      return r;
    });
    setDisciplineRules(updated);
    persistDisciplineRules(updated);
    setEditingDisciplineRule(null);
    showToast('✓ শৃঙ্খলা ও নিরাপত্তাবিধি সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  const handleDeleteDisciplineRule = (targetRule) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${targetRule.rule}" নিয়মটি মুছে ফেলতে চান?`)) return;
    const updated = (disciplineRules || []).filter(r => (r.id ? r.id !== targetRule.id : r.num !== targetRule.num));
    setDisciplineRules(updated);
    persistDisciplineRules(updated);
    showToast('নিয়মটি মুছে ফেলা হয়েছে।');
  };

  const handleAddNewDisciplineRule = () => {
    const nextNum = toBn((disciplineRules || []).length + 1);
    const newRule = {
      id: `dr-${Date.now()}`,
      num: nextNum,
      rule: 'নতুন নিরাপত্তাবিধি',
      desc: 'এই বিধির বিস্তারিত বিবরণ এখানে লিখুন।'
    };
    const updated = [...(disciplineRules || []), newRule];
    setDisciplineRules(updated);
    persistDisciplineRules(updated);
    handleStartEditDisciplineRule(newRule);
    showToast('নতুন নিরাপত্তাবিধি যুক্ত হয়েছে। অনুগ্রহ করে সম্পাদনা করুন।');
  };

  // =========================================================================
  // MEMBERSHIP APPLICATION & DIRECTORY
  // =========================================================================
  const handleSubmitMembershipForm = (e) => {
    e.preventDefault();
    if (!memberForm.student_name.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    const trackingId = 'SCI-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newEntry = {
      trackingId,
      student_name: memberForm.student_name.trim(),
      class_name: memberForm.class_name,
      section: memberForm.section,
      roll_no: memberForm.roll_no.trim() || '—',
      guardian_name: memberForm.guardian_name.trim(),
      mobile: memberForm.mobile.trim(),
      wing_preference: memberForm.wing_preference,
      device_access: memberForm.device_access,
      reason: memberForm.reason.trim(),
      status: 'অপেক্ষমান',
      date: new Date().toLocaleDateString('bn-BD')
    };

    const updated = [newEntry, ...memberships];
    setMemberships(updated);
    persistMemberships(updated);
    setSubmittedReceipt(newEntry);
    setMemberForm({
      student_name: '',
      class_name: '৯ম',
      section: 'বিজ্ঞান',
      roll_no: '',
      guardian_name: '',
      mobile: '',
      wing_preference: 'পদার্থবিজ্ঞান বিভাগ',
      device_access: 'ল্যাব ও বিজ্ঞানাগার সুবিধা চাই',
      reason: ''
    });
    showToast('✓ বিজ্ঞান ক্লাবের সদস্যপদের আবেদন সফলভাবে জমা হয়েছে!');
  };

  const handleToggleMemberStatus = (trackingId) => {
    const updated = memberships.map(m => {
      if (m.trackingId === trackingId) {
        const nextStatus = m.status === 'অনুমোদিত' ? 'অপেক্ষমান' : 'অনুমোদিত';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setMemberships(updated);
    persistMemberships(updated);
    showToast('সদস্যপদের স্থিতি পরিবর্তিত হয়েছে!');
  };

  const handleDeleteMembership = (trackingId) => {
    if (!window.confirm('আপনি কি এই আবেদনটি মুছে ফেলতে চান?')) return;
    const updated = memberships.filter(m => m.trackingId !== trackingId);
    setMemberships(updated);
    persistMemberships(updated);
    showToast('আবেদনটি মুছে ফেলা হয়েছে।');
  };

  // =========================================================================
  // SUBMISSIONS (PROJECTS, POSTERS, BANNERS)
  // =========================================================================
  const handleSubmitWriting = (e) => {
    e.preventDefault();
    if (!writeForm.student_name.trim() || !writeForm.title.trim() || !writeForm.summary.trim()) {
      alert('শিক্ষার্থীর নাম, শিরোনাম ও সারসংক্ষেপ পূরণ করা আবশ্যক।');
      return;
    }
    const newSub = {
      id: 'sci-sub-' + Date.now(),
      student_name: writeForm.student_name.trim(),
      class_name: writeForm.class_name,
      section: writeForm.section,
      roll: writeForm.roll.trim() || '—',
      type: writeForm.type,
      title: writeForm.title.trim(),
      summary: writeForm.summary.trim(),
      file_name: writeForm.file_name,
      file_size: writeForm.file_size,
      file_type: writeForm.file_type,
      file_data: writeForm.file_data,
      status: 'অনুমোদিত',
      date: new Date().toLocaleDateString('bn-BD')
    };
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    persistSubmissions(updated);
    setWriteForm({
      student_name: '',
      class_name: '৯ম',
      section: 'বিজ্ঞান',
      roll: '',
      type: 'বিজ্ঞান প্রকল্প',
      title: '',
      summary: '',
      file_name: '',
      file_size: '',
      file_type: '',
      file_data: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('✓ বিজ্ঞান প্রজেক্ট/পোস্টার সফলভাবে জমা হয়েছে!');
  };

  const handleToggleSubmissionStatus = (id) => {
    const updated = submissions.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'অনুমোদিত' ? 'অপেক্ষমান' : 'অনুমোদিত' };
      }
      return s;
    });
    setSubmissions(updated);
    persistSubmissions(updated);
    showToast('প্রকল্পের স্থিতি পরিবর্তিত হয়েছে!');
  };

  const handleDeleteSubmission = (id) => {
    if (!window.confirm('আপনি কি এই প্রজেক্ট/পোস্টারটি মুছে ফেলতে চান?')) return;
    const updated = submissions.filter(s => s.id !== id);
    setSubmissions(updated);
    persistSubmissions(updated);
    showToast('প্রজেক্টটি মুছে ফেলা হয়েছে।');
  };

  // =========================================================================
  // SCIENCE FAIR PROJECTS CRUD
  // =========================================================================
  const handleSubmitFairProject = (e) => {
    e.preventDefault();
    if (!fairForm.title.trim() || !fairForm.teamLeader.trim()) {
      alert('প্রকল্পের শিরোনাম ও দলনেতার নাম আবশ্যক।');
      return;
    }
    const newProj = {
      id: 'fair-' + Date.now(),
      title: fairForm.title.trim(),
      category: fairForm.category,
      wing: fairForm.wing,
      teamLeader: fairForm.teamLeader.trim(),
      class: fairForm.class_name,
      section: fairForm.section,
      roll: fairForm.roll.trim() || '—',
      stallNo: fairForm.stallNo.trim() || 'স্টল-নির্ধারিত',
      desc: fairForm.desc.trim() || 'বিজ্ঞান মেলার উদ্ভাবনী প্রজেক্ট মডেল।',
      award: 'অপেক্ষমান',
      status: 'অনুমোদিত'
    };
    const updated = [newProj, ...fairProjects];
    setFairProjects(updated);
    persistFairProjects(updated);
    setFairForm({
      title: '',
      category: 'কৃষি ও নবায়নযোগ্য জ্বালানি',
      wing: 'পদার্থবিজ্ঞান বিভাগ',
      teamLeader: '',
      class_name: '১০ম',
      section: 'বিজ্ঞান',
      roll: '',
      stallNo: 'স্টল-' + toBn(Math.floor(10 + Math.random() * 90)),
      desc: ''
    });
    showToast('✓ বিজ্ঞান মেলার নতুন প্রকল্প সফলভাবে নিবন্ধিত হয়েছে!');
  };

  const handleStartEditFairProject = (proj) => {
    setEditingFairProject(proj);
    setFairEditForm({
      id: proj.id,
      title: proj.title,
      category: proj.category || 'কৃষি ও নবায়নযোগ্য জ্বালানি',
      wing: proj.wing || 'পদার্থবিজ্ঞান বিভাগ',
      teamLeader: proj.teamLeader || '',
      class_name: proj.class || '১০ম',
      section: proj.section || 'বিজ্ঞান',
      roll: proj.roll || '',
      stallNo: proj.stallNo || '',
      desc: proj.desc || '',
      award: proj.award || 'অপেক্ষমান',
      status: proj.status || 'অনুমোদিত'
    });
  };

  const handleSaveFairProjectEdit = (e) => {
    e.preventDefault();
    if (!editingFairProject) return;
    const updated = fairProjects.map(p => {
      if (p.id === editingFairProject.id) {
        return {
          ...p,
          title: fairEditForm.title.trim(),
          category: fairEditForm.category,
          wing: fairEditForm.wing,
          teamLeader: fairEditForm.teamLeader.trim(),
          class: fairEditForm.class_name,
          section: fairEditForm.section,
          roll: fairEditForm.roll.trim(),
          stallNo: fairEditForm.stallNo.trim(),
          desc: fairEditForm.desc.trim(),
          award: fairEditForm.award.trim(),
          status: fairEditForm.status
        };
      }
      return p;
    });
    setFairProjects(updated);
    persistFairProjects(updated);
    setEditingFairProject(null);
    showToast('বিজ্ঞান মেলার প্রকল্পের তথ্য সংরক্ষিত হয়েছে!');
  };

  const handleDeleteFairProject = (projId) => {
    if (!window.confirm('আপনি কি এই বিজ্ঞান মেলা প্রজেক্টটি মুছে ফেলতে চান?')) return;
    const updated = fairProjects.filter(p => p.id !== projId);
    setFairProjects(updated);
    persistFairProjects(updated);
    showToast('প্রজেক্টটি মুছে ফেলা হয়েছে।');
  };

  // =========================================================================
  // ACHIEVEMENTS CRUD
  // =========================================================================
  const handleStartEditAchievement = (ach) => {
    setEditingAchievement(ach);
    setAchEditForm({
      id: ach.id,
      year: ach.year,
      event: ach.event,
      level: ach.level || 'উপজেলা পর্যায়',
      position: ach.position,
      project: ach.project || '',
      team: ach.team || '',
      creators: ach.creators || '',
      note: ach.note || ''
    });
  };

  const handleSaveAchievementEdit = (e) => {
    e.preventDefault();
    if (!editingAchievement) return;
    const updated = achievements.map(a => {
      if (a.id === editingAchievement.id) {
        return {
          ...a,
          year: achEditForm.year.trim(),
          event: achEditForm.event.trim(),
          level: achEditForm.level,
          position: achEditForm.position.trim(),
          project: achEditForm.project.trim(),
          team: achEditForm.team.trim(),
          creators: achEditForm.creators.trim(),
          note: achEditForm.note.trim()
        };
      }
      return a;
    });
    setAchievements(updated);
    persistAchievements(updated);
    setEditingAchievement(null);
    showToast('অর্জন তথ্য সংরক্ষিত হয়েছে!');
  };

  const handleDeleteAchievement = (achId) => {
    if (!window.confirm('আপনি কি এই অর্জনের রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updated = achievements.filter(a => a.id !== achId);
    setAchievements(updated);
    persistAchievements(updated);
    showToast('অর্জন মুছে ফেলা হয়েছে।');
  };

  const handleAddNewAchievement = () => {
    const newAch = {
      id: 'ach-' + Date.now(),
      year: '২০২৬',
      event: 'জাতীয় বিজ্ঞান ও উদ্ভাবন প্রতিযোগিতা ২০২৬',
      level: 'উপজেলা পর্যায়',
      position: '১ম স্থান / চ্যাম্পিয়ন ট্রফি',
      project: 'স্মার্ট বিজ্ঞানাগার মডেল',
      team: 'বিজ্ঞান ক্লাব রিসার্চ টিম',
      creators: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়',
      note: 'বিশেষ জুরি সম্মাননা ও শ্রেষ্ঠ উদ্ভাবনী পুরস্কার।'
    };
    const updated = [newAch, ...achievements];
    setAchievements(updated);
    persistAchievements(updated);
    handleStartEditAchievement(newAch);
    showToast('নতুন অর্জন যুক্ত হয়েছে!');
  };

  // Student Safety Pledge
  const handleSubmitPledge = (e) => {
    e.preventDefault();
    if (!pledgeForm.student_name.trim() || !pledgeForm.roll_no.trim()) {
      alert('শিক্ষার্থীর নাম ও রোল পূরণ করুন।');
      return;
    }
    setPledgeForm(prev => ({ ...prev, signed: true }));
    showToast(`✓ "${pledgeForm.student_name}" বিজ্ঞানাগার নিরাপত্তা অঙ্গীকার সম্পন্ন করেছে!`);
  };

  // =========================================================================
  // PRINT HANDLERS (UNIFIED OFFICIAL SCHOOL PAD WITH HALVED TOP MARGIN)
  // =========================================================================

  // 1. Print Coordinators & Judges Panel
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

    const judges = panelData.judges || {};

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সমন্বয়ক ও বিচারক প্যানেল — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #f0fdf4; color: #047857; font-weight: 800; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">👨‍🏫 বিজ্ঞান একাডেমি প্যানেল</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — কেন্দ্রীয় সমন্বয়ক ও বিচারক প্যানেল</h2>
          <div style="font-size:12px; color:#475569;">শিক্ষাবর্ষ: ২০২৬ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <h3 style="margin:16px 0 6px 0; font-size:14px; color:#047857; border-bottom:1.5px solid #86efac; padding-bottom:4px;">
          ১. ক্লাব সমন্বয়কমণ্ডলী (Coordinators)
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width:40px;text-align:center;">ক্র.</th>
              <th>শিক্ষকের নাম ও পদবি</th>
              <th>ক্লাবে অর্পিত দায়িত্ব</th>
              <th style="width:120px;text-align:center;">যোগাযোগ</th>
            </tr>
          </thead>
          <tbody>
            ${coords}
          </tbody>
        </table>

        <h3 style="margin:20px 0 6px 0; font-size:14px; color:#047857; border-bottom:1.5px solid #86efac; padding-bottom:4px;">
          ২. বিজ্ঞান মেলা ও অলিম্পিয়াড বিচারক প্যানেল (Judges Panel)
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width:140px;">বিচারকের পদমর্যাদা</th>
              <th>নাম ও প্রাতিষ্ঠানিক পদবি</th>
              <th>মূল্যায়নের ক্ষেত্র</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight:800;color:#047857;">${judges.chiefJudge?.role || 'প্রধান বিচারক'}</td>
              <td><b>${judges.chiefJudge?.name}</b><br><small style="color:#64748b;">${judges.chiefJudge?.designation}</small></td>
              <td>সার্বিক বৈজ্ঞানিক মান ও চূড়ান্ত সিদ্ধান্ত</td>
            </tr>
            <tr>
              <td style="font-weight:800;color:#047857;">${judges.judge1?.role || 'বিচারক ১'}</td>
              <td><b>${judges.judge1?.name}</b><br><small style="color:#64748b;">${judges.judge1?.designation}</small></td>
              <td>একাডেমিক উপস্থাপনা ও তাত্ত্বিক স্পষ্টতা</td>
            </tr>
            <tr>
              <td style="font-weight:800;color:#047857;">${judges.judge2?.role || 'বিচারক ২'}</td>
              <td><b>${judges.judge2?.name}</b><br><small style="color:#64748b;">${judges.judge2?.designation}</small></td>
              <td>বাস্তব উপযোগিতা ও উদ্ভাবনী কার্যপ্রণালী</td>
            </tr>
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 2. Print Executive Committee
  const handlePrintExecPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const posts = execData.posts || {};
    const postRows = [
      { key: 'president', role: 'সভাপতি', data: posts.president },
      { key: 'vice_president', role: 'সহ-সভাপতি', data: posts.vice_president },
      { key: 'general_secretary', role: 'সাধারণ সম্পাদক', data: posts.general_secretary },
      { key: 'joint_secretary', role: 'যুগ্ম সম্পাদক', data: posts.joint_secretary },
      { key: 'organizing_secretary', role: 'সাংগঠনিক সম্পাদক', data: posts.organizing_secretary },
      { key: 'publicity_secretary', role: 'প্রচার ও প্রকাশনা সম্পাদক', data: posts.publicity_secretary },
      { key: 'treasurer', role: 'অর্থ সম্পাদক', data: posts.treasurer }
    ].map((p, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td style="font-weight:800;color:#047857;">${p.role}</td>
        <td><b>${p.data?.name || '—'}</b></td>
        <td style="text-align:center;">${p.data?.class || '—'}</td>
        <td style="text-align:center;">${p.data?.section || '—'}</td>
        <td style="text-align:center;">${toBn(p.data?.roll || '—')}</td>
        <td style="text-align:center;">${p.data?.phone || '—'}</td>
      </tr>
    `).join('');

    const memberRows = (execData.members || []).map((m, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td><b>${m.name}</b></td>
        <td style="text-align:center;">${m.class}</td>
        <td style="text-align:center;">${m.section || '—'}</td>
        <td style="text-align:center;">${toBn(m.roll)}</td>
        <td style="text-align:center;color:#047857;font-weight:700;">কার্যনির্বাহী সদস্য</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>কার্যনির্বাহী পরিষদ — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          th { background: #f0fdf4; color: #047857; font-weight: 800; text-align: left; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">👥 শিক্ষার্থী পরিষদ</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — কার্যনির্বাহী পরিষদ (২০২৬)</h2>
          <div style="font-size:12px; color:#475569;">অনুমোদনের তারিখ: ০৬/১১/২০২৬ খ্রি. • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <h3 style="margin:14px 0 4px 0; font-size:13px; color:#047857;">১. মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:35px;text-align:center;">ক্র.</th>
              <th>পদের নাম</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="text-align:center;">শ্রেণি</th>
              <th style="text-align:center;">শাখা/বিভাগ</th>
              <th style="text-align:center;">রোল</th>
              <th style="text-align:center;">মোবাইল নম্বর</th>
            </tr>
          </thead>
          <tbody>
            ${postRows}
          </tbody>
        </table>

        <h3 style="margin:16px 0 4px 0; font-size:13px; color:#047857;">২. সাধারণ কার্যনির্বাহী সদস্যবৃন্দ</h3>
        <table>
          <thead>
            <tr>
              <th style="width:35px;text-align:center;">ক্র.</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="text-align:center;">শ্রেণি</th>
              <th style="text-align:center;">শাখা/বিভাগ</th>
              <th style="text-align:center;">রোল</th>
              <th style="text-align:center;">দায়িত্ব</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 3. Print Departments (Wings)
  const handlePrintDeptsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const deptsHtml = (departments || []).map(d => `
      <div style="margin-bottom:14px; padding:12px 16px; border-left:5px solid ${d.color || '#059669'}; background:#f0fdf4; border-radius:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#047857; font-size:14px;">${d.num}. ${d.title} (${d.titleEn})</b>
          <span style="font-size:11.5px; background:#dcfce7; color:#166534; padding:2px 8px; border-radius:4px; font-weight:700;">ইনচার্জ: ${d.inCharge}</span>
        </div>
        <p style="margin:6px 0; font-size:12px; color:#334155; line-height:1.5;">${d.summary}</p>
        <div style="font-size:11.5px; color:#047857; font-weight:700; margin-top:4px;">নিয়মিত ল্যাব পরীক্ষা ও অ্যাক্টিভিটি:</div>
        <ul style="margin:4px 0 0 0; padding-left:18px; font-size:11.5px; color:#475569; line-height:1.5;">
          ${(d.experiments || []).map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বিজ্ঞান ক্লাবের বিভাগসমূহ — অফিশিয়াল বিবরণী</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">🧪 একাডেমিক উইং ও ল্যাব বিভাগ</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — বিভাগভিত্তিক কাঠামো ও ল্যাব কার্যক্রম</h2>
          <div style="font-size:12px; color:#475569;">পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞান বিভাগ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <div style="margin-top:16px;">
          ${deptsHtml}
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 4. Print Regular Activities
  const handlePrintActivitiesPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = (activities || []).map(a => `
      <tr>
        <td style="text-align:center;font-weight:700;">${a.num}</td>
        <td><b>${a.title}</b><br><small style="color:#047857;font-weight:700;">${a.focus}</small></td>
        <td style="font-size:12px;">${a.time}<br><small style="color:#64748b;">${a.venue}</small></td>
        <td style="font-size:11.5px;color:#334155;">${a.details}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>নিয়মিত কার্যক্রম — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #f0fdf4; color: #047857; font-weight: 800; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">⚡ নিয়মিত ল্যাব ও সেশন</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — ১০টি নিয়মিত কার্যক্রম ও রুটিন</h2>
          <div style="font-size:12px; color:#475569;">শিক্ষাবর্ষ: ২০২৬ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:35px;text-align:center;">নং</th>
              <th>কার্যক্রম ও ফোকাস</th>
              <th style="width:160px;">সময় ও স্থান</th>
              <th>বিস্তারিত বিবরণ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 5. Print Annual Roadmap & Monthly Calendar
  const handlePrintProgramsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const quarters = (quarterlyPlans || []).map(q => `
      <div style="border:1px solid #cbd5e1; border-radius:6px; padding:10px 14px; margin-bottom:10px; background:#f0fdf4; border-left:5px solid ${q.color || '#059669'};">
        <b style="color:${q.color || '#047857'}; font-size:13.5px;">${q.quarter} : ${q.title}</b>
        <ul style="margin:6px 0 0 0; padding-left:18px; font-size:12px; color:#334155; line-height:1.5;">
          ${(q.items || []).map(it => `<li>${it}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    const months = (monthlyCalendar || []).map(m => `
      <div style="border:1px solid #cbd5e1; padding:8px 10px; border-radius:4px; font-size:12px; background:#ffffff;">
        <b style="color:#047857;">${m.month} : ${m.title}</b><br>
        <span style="font-size:11px;color:#64748b;">তারিখ: ${m.date} • সমন্বয়ক: ${m.coordinator}</span>
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">📅 বার্ষিক কর্মপরিকল্পনা</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — বার্ষিক রোডম্যাপ ও অ্যাক্টিভিটি ক্যালেন্ডার</h2>
          <div style="font-size:12px; color:#475569;">শিক্ষাবর্ষ: ২০২৬ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <h3 style="margin:14px 0 6px 0; font-size:13px; color:#047857;">১. ত্রৈমাসিক কর্মপরিকল্পনা রোডম্যাপ (Quarterly Roadmap)</h3>
        ${quarters}

        <h3 style="margin:16px 0 6px 0; font-size:13px; color:#047857;">২. ১২ মাসের ধারাবাহিক অ্যাক্টিভিটি ক্যালেন্ডার (Activity Calendar)</h3>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          ${months}
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 6. Print Selection Rules
  const handlePrintRulesPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rulesHtml = (selectionRules || []).map(r => `
      <div style="margin-bottom:12px; padding:10px 14px; border-left:4px solid #059669; background:#f0fdf4; border-radius:4px;">
        <b style="color:#047857; font-size:13px;">${r.num}. ${r.title}</b>
        <p style="margin:4px 0 0 0; font-size:12px; color:#334155; line-height:1.5;">${r.text}</p>
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্য নির্বাচনের নিয়মাবলী — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">📜 নির্দেশিকা ও নীতিমালা</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — সদস্য নির্বাচনের নিয়মাবলী</h2>
          <div style="font-size:12px; color:#475569;">শিক্ষাবর্ষ: ২০২৬ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <div style="margin-top:16px;">
          ${rulesHtml}
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 7. Print Discipline & Lab Safety Rules
  const handlePrintConductPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rulesHtml = (disciplineRules || []).map(r => `
      <div style="margin-bottom:10px; padding:8px 12px; border-left:4px solid #dc2626; background:#fef2f2; border-radius:4px;">
        <b style="color:#b91c1c; font-size:13px;">${r.num}. ${r.rule}</b>
        <p style="margin:3px 0 0 0; font-size:12px; color:#334155; line-height:1.5;">${r.desc}</p>
      </div>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>শৃঙ্খলা ও নিরাপত্তাবিধি — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 12px 0 10px 0;">
          <span class="doc-badge">🛡️ বিজ্ঞানাগার ও ল্যাব আচরণবিধি</span>
          <h2 style="margin:4px 0; color:#b91c1c; font-size:18px;">মগড়া উচ্চ বিদ্যালয় বিজ্ঞানাগার ও ল্যাব নিরাপত্তাবিধি</h2>
          <div style="font-size:12px; color:#475569;">সকল শিক্ষার্থী ও ক্লাব সদস্যের জন্য অবশ্য পালনীয় বাধ্যতামূলক নির্দেশনা</div>
        </div>

        <div style="margin-top:14px;">
          ${rulesHtml}
        </div>

        <div style="margin-top:16px; padding:12px; border:1.5px dashed #059669; background:#f0fdf4; border-radius:6px; font-size:12px;">
          <b>🔬 বিজ্ঞানাগার নিরাপত্তা অঙ্গীকার:</b> আমি ঘোষণা করছি যে, বিদ্যালয়ের বিজ্ঞানাগার ও ল্যাবের সকল যন্ত্রপাতি ও রাসায়নিক দ্রব্যের যথাযথ নিরাপত্তা রক্ষা করব এবং শিক্ষকের অনুমতি ছাড়া ঝুঁকিপূর্ণ কোনো কাজে লিপ্ত হব না।
          <div style="margin-top:8px; display:flex; justify-content:space-between;">
            <span>শিক্ষার্থীর নাম: .................................................</span>
            <span>শ্রেণি: ................. শাখা: ................ রোল: ..............</span>
            <span>স্বাক্ষর: .................................</span>
          </div>
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 8. Print Members Directory
  const handlePrintMembersDirectory = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = (memberships || []).map((m, i) => `
      <tr>
        <td style="text-align:center;">${toBn(i + 1)}</td>
        <td style="font-family:monospace;font-weight:700;color:#047857;">${m.trackingId}</td>
        <td><b>${m.student_name}</b></td>
        <td style="text-align:center;">${m.class_name} (${m.section || '—'})</td>
        <td style="text-align:center;">${toBn(m.roll_no)}</td>
        <td style="font-size:12px;">${m.wing_preference || 'সাধারণ'}</td>
        <td style="text-align:center;">${m.mobile || '—'}</td>
        <td style="text-align:center;font-weight:700;${m.status === 'অনুমোদিত' ? 'color:#15803d;' : 'color:#b45309;'}">${m.status}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্য ডিরেক্টরি — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          th { background: #f0fdf4; color: #047857; font-weight: 800; text-align: left; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">📋 প্রাতিষ্ঠানিক সদস্য তালিকা</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — নিবন্ধিত শিক্ষার্থী সদস্য ডিরেক্টরি</h2>
          <div style="font-size:12px; color:#475569;">মোট আবেদনকারী: ${toBn(memberships.length)} জন • শিক্ষাবর্ষ: ২০২৬</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center;">ক্র.</th>
              <th>ট্র্যাকিং আইডি</th>
              <th>শিক্ষার্থীর নাম</th>
              <th style="text-align:center;">শ্রেণি (শাখা/বিভাগ)</th>
              <th style="text-align:center;">রোল</th>
              <th>পছন্দের বিভাগ</th>
              <th style="text-align:center;">মোবাইল নম্বর</th>
              <th style="text-align:center;">স্থিতি</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 9. Print Member Receipt
  const handlePrintMemberReceipt = (entry) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>সদস্য আবেদন রসিদ — ${entry.trackingId}</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 14px 0;">
          <span class="doc-badge">🎫 সদস্যপদ প্রাপ্তি রসিদ ও ট্র্যাকিং কার্ড</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — সদস্য আবেদন রসিদ</h2>
          <div style="font-size:12px; color:#475569;">শিক্ষাবর্ষ: ২০২৬ • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <div style="border: 2px solid #86efac; border-radius: 8px; padding: 18px; background: #f0fdf4; margin: 16px 0;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #bbf7d0; padding-bottom: 10px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 12px; color: #475569;">আবেদন ট্র্যাকিং নম্বর:</span><br>
              <strong style="font-size: 18px; color: #047857; font-family: monospace;">${entry.trackingId}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: #475569;">আবেদনের তারিখ:</span><br>
              <strong style="font-size: 13px;">${entry.date}</strong>
            </div>
          </div>

          <table style="width: 100%; font-size: 13px; line-height: 1.8;">
            <tr>
              <td style="width: 140px; font-weight: 700; color: #334155;">শিক্ষার্থীর নাম:</td>
              <td style="font-size: 15px; font-weight: 800; color: #0f172a;">${entry.student_name}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">শ্রেণি ও শাখা/বিভাগ:</td>
              <td>${entry.class_name} শ্রেণি (${entry.section || '—'}) • রোল: ${toBn(entry.roll_no)}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">অভিভাবকের নাম:</td>
              <td>${entry.guardian_name || '—'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">জরুরি যোগাযোগ মোবাইল:</td>
              <td>${entry.mobile || '—'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">পছন্দের বিভাগ/উইং:</td>
              <td style="color:#047857; font-weight:700;">${entry.wing_preference || 'পদার্থবিজ্ঞান বিভাগ'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">সুযোগ-সুবিধা:</td>
              <td>${entry.device_access || '—'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">আবেদনের উদ্দেশ্য:</td>
              <td>${entry.reason || 'বিজ্ঞানের নিত্যনতুন গবেষণা ও ল্যাব পরীক্ষণ সম্পর্কে হাতে-কলমে শেখা।'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #334155;">আবেদনের স্থিতি:</td>
              <td style="font-weight: 800; color: #047857;">${entry.status}</td>
            </tr>
          </table>
        </div>

        <div style="font-size: 11.5px; color: #475569; background: #ffffff; border: 1px dashed #cbd5e1; padding: 10px; border-radius: 6px; margin-top: 14px;">
          📌 <b>নির্দেশনা:</b> এই রসিদটি শিক্ষার্থী তার কাছে সংরক্ষণ করবে। বিজ্ঞানের সাপ্তাহিক সেশন, অলিম্পিয়াড ট্রেনিং ও বার্ষিক বিজ্ঞান মেলায় অংশ নেওয়ার সময় এই ট্র্যাকিং আইডি ব্যবহার করতে হবে।
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 10. Print Science Fair Brochure / Project List
  const handlePrintFairPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const projRows = (fairProjects || []).map((p, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td><b>${p.title}</b><br><small style="color:#047857;font-weight:700;">${p.category} • ${p.wing}</small></td>
        <td style="text-align:center;"><b>${p.stallNo}</b></td>
        <td><b>${p.teamLeader}</b> (${p.class} • ${p.section || '—'} • ${toBn(p.roll)})</td>
        <td style="font-size:11.5px;color:#334155;">${p.desc}</td>
        <td style="text-align:center;font-weight:800;color:#047857;">${p.award}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বিজ্ঞান মেলা ব্রোশার ও প্রজেক্ট ডিরেক্টরি — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          th { background: #f0fdf4; color: #047857; font-weight: 800; text-align: left; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">🚀 বিজ্ঞান মেলা ২০২৬ ব্রোশার</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">৮ম বার্ষিক মগড়া বিজ্ঞান ও প্রযুক্তি উদ্ভাবন মেলা ২০২৬</h2>
          <div style="font-size:12px; color:#475569;">খুদে বিজ্ঞানীদের প্রদর্শিত প্রজেক্ট ও স্টল নির্দেশিকা • মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center;">ক্র.</th>
              <th>প্রকল্পের নাম ও ক্ষেত্র</th>
              <th style="width:70px;text-align:center;">স্টল নং</th>
              <th>উদ্ভাবক দলনেতা ও শ্রেণি</th>
              <th>প্রকল্পের মূল কার্যপ্রণালী</th>
              <th style="width:100px;text-align:center;">পুরস্কার/স্থান</th>
            </tr>
          </thead>
          <tbody>
            ${projRows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 11. Print Achievements Gallery
  const handlePrintAchievementsPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const achRows = (achievements || []).map((a, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${toBn(i + 1)}.</td>
        <td style="text-align:center;font-weight:700;color:#047857;">${a.year}</td>
        <td><b>${a.event}</b><br><small style="color:#64748b;">${a.level}</small></td>
        <td style="color:#047857;font-weight:800;">${a.position}</td>
        <td><b>${a.project || '—'}</b><br><small style="color:#475569;">${a.team || ''}</small></td>
        <td style="font-size:11.5px;color:#334155;">${a.note || '—'}</td>
      </tr>
    `).join('');

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>অর্জন ও ট্রফি গ্যালারি — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          th { background: #f0fdf4; color: #047857; font-weight: 800; text-align: left; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">🏆 গৌরবোজ্জ্বল অর্জন ও ট্রফি</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — জাতীয় ও আঞ্চলিক অর্জনের দলিল</h2>
          <div style="font-size:12px; color:#475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • গৌরবময় উদ্ভাবন ও চ্যাম্পিয়নশিপ</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center;">ক্র.</th>
              <th style="width:50px;text-align:center;">সাল</th>
              <th>প্রতিযোগিতার নাম ও পর্যায়</th>
              <th>অর্জিত স্থান</th>
              <th>প্রকল্প ও বিজয়ী দল</th>
              <th>মন্তব্য / বিবরণ</th>
            </tr>
          </thead>
          <tbody>
            ${achRows}
          </tbody>
        </table>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 12. Print Overview Pad
  const handlePrintOverviewPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>ক্লাব পরিচিতি — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .info-table { width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
          .info-table td { padding:8px 12px; border:1px solid #cbd5e1; }
          .info-table td.lbl { width:170px; font-weight:700; background:#f0fdf4; color:#047857; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">🔬 ক্লাব প্রোফাইল ও পরিচিতি</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব (Science Club)</h2>
          <div style="font-size:12px; color:#475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • কালিহাতি, টাঙ্গাইল</div>
        </div>

        <table class="info-table">
          <tr><td class="lbl">ক্লাবের নাম</td><td><b>বিজ্ঞান ক্লাব (মগড়া ইয়ুথ সায়েন্স ক্লাব)</b></td></tr>
          <tr><td class="lbl">ইংরেজি নাম</td><td><b>Science Club</b></td></tr>
          <tr><td class="lbl">প্রতিষ্ঠানের নাম</td><td>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</td></tr>
          <tr><td class="lbl">পরিচালনা</td><td>পৃষ্ঠপোষক ও কেন্দ্রীয় উপদেষ্টা পরিষদের তত্ত্বাবধানে</td></tr>
          <tr><td class="lbl">ক্লাব সমন্বয়ক</td><td>রসায়ন, পদার্থ ও জীববিজ্ঞান বিষয়ের শিক্ষকবৃন্দ</td></tr>
          <tr><td class="lbl">সদস্য যোগ্যতা</td><td>ষষ্ঠ থেকে দশম শ্রেণির সকল নিয়মিত শিক্ষার্থী</td></tr>
          <tr><td class="lbl">প্রধান কার্যক্রম</td><td>বিজ্ঞান, প্রযুক্তি, গবেষণা, উদ্ভাবন ও বিজ্ঞান মেলা</td></tr>
          <tr><td class="lbl">মূলনীতি</td><td><b>জানব, বুঝব, পরীক্ষা করব, উদ্ভাবন করব</b></td></tr>
        </table>

        <div style="margin-top:20px; padding:14px; background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; font-size:12.5px; line-height:1.6; color:#1e293b;">
          <b>🔭 ক্লাবের মূল অঙ্গীকার:</b> মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের বিজ্ঞান ক্লাব শিক্ষার্থীদের পাঠ্যপুস্তকের তাত্ত্বিক বিজ্ঞানকে বিজ্ঞানাগারে প্রত্যক্ষ পরীক্ষার মাধ্যমে উন্মোচন করে। মুখস্থবিদ্যার বদলে হাতে-কলমে শিক্ষা ও বিজ্ঞান মেলার উদ্ভাবনী প্রজেক্টের মধ্য দিয়ে আগামী দিনের বিজ্ঞানী, গবেষক ও প্রযুক্তিবিদ তৈরি করাই এই ক্লাবের লক্ষ্য।
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 13. Print Objectives Pad
  const handlePrintObjectivesPad = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>মূল লক্ষ্য ও উদ্দেশ্য — বিজ্ঞান ক্লাব</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .goal-card { margin-bottom: 10px; padding: 10px 14px; background: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px; font-size: 13px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 12px 0;">
          <span class="doc-badge">🎯 প্রাতিষ্ঠানিক লক্ষ্য ও দর্শন</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">মগড়া ইয়ুথ সায়েন্স ক্লাব — মূল লক্ষ্য ও উদ্দেশ্য</h2>
          <div style="font-size:12px; color:#475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • কালিহাতি, টাঙ্গাইল</div>
        </div>

        <div style="margin-top:14px;">
          <div class="goal-card"><b>১. বিজ্ঞানমনস্কতা সৃষ্টি:</b> শিক্ষার্থীদের মধ্যে বিজ্ঞানভিত্তিক জ্ঞান ও সচেতনতা সৃষ্টি করা।</div>
          <div class="goal-card"><b>২. কৌতূহল ও অনুসন্ধিৎসা:</b> বিজ্ঞান বিষয়ে আগ্রহ, কৌতূহল ও অনুসন্ধিৎসা বৃদ্ধি করা।</div>
          <div class="goal-card"><b>৩. হাতে-কলমে শিক্ষা:</b> মুখস্থনির্ভর শিক্ষার পরিবর্তে ল্যাবরেটরিতে হাতে-কলমে শেখার বাস্তব সুযোগ তৈরি করা।</div>
          <div class="goal-card"><b>৪. সৃজনশীলতা ও উদ্ভাবন:</b> শিক্ষার্থীদের সৃজনশীলতা, উদ্ভাবনী চিন্তা ও সমস্যা সমাধানের দক্ষতা বৃদ্ধি করা।</div>
          <div class="goal-card"><b>৫. প্রযুক্তির ইতিবাচক ব্যবহার:</b> বিজ্ঞান ও প্রযুক্তির ইতিবাচক, নিরাপদ ও কল্যাণকর ব্যবহার সম্পর্কে ধারণা দেওয়া।</div>
          <div class="goal-card"><b>৬. পরিবেশ ও জীববৈচিত্র্য রক্ষা:</b> পরিবেশ, জলবায়ু পরিবর্তন, জীববৈচিত্র্য ও প্রাকৃতিক সম্পদ সংরক্ষণে সচেতন করা।</div>
          <div class="goal-card"><b>৭. বিজ্ঞান মেলা ও অলিম্পিয়াড প্রস্তুতি:</b> বিজ্ঞান মেলা, অলিম্পিয়াড, কুইজ ও বিভিন্ন জাতীয় প্রতিযোগিতায় অংশগ্রহণের উপযোগী করে গড়ে তোলা।</div>
          <div class="goal-card"><b>৮. ভবিষ্যৎ গবেষক তৈরি:</b> শিক্ষার্থীদের মাঝে ভবিষ্যৎ বিজ্ঞানী, গবেষক, প্রকৌশলী ও প্রযুক্তিবিদ হওয়ার আগ্রহ সৃষ্টি করা।</div>
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // 14. Print Submission Item
  const handlePrintSubmission = (item) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>বিজ্ঞান প্রকল্প সারসংক্ষেপ — ${item.title}</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 6mm 12mm 12mm 12mm; }
          body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 6px 12px 15px 12px; margin: 0; color: #0f172a; }
          .doc-badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-bottom: 6px; }
          .sig-grid { margin-top: 45px; display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; text-align:center; }
          .sig-line { border-top: 1.5px dashed #334155; width: 190px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        ${SCHOOL_PAD_HEADER_HTML}
        <div style="text-align:center; margin: 14px 0 10px 0;">
          <span class="doc-badge">📄 ${item.type}</span>
          <h2 style="margin:4px 0; color:#047857; font-size:18px;">${item.title}</h2>
          <div style="font-size:12px; color:#475569;">উদ্ভাবক: <b>${item.student_name}</b> (${item.class_name} শ্রেণি • ${item.section || '—'} • রোল ${toBn(item.roll)}) • তারিখ: ${item.date}</div>
        </div>

        <div style="margin-top:16px; border:1px solid #86efac; border-radius:8px; padding:16px; background:#f0fdf4; font-size:13.5px; line-height:1.7; color:#1e293b; white-space:pre-wrap;">
          ${item.summary}
        </div>

        ${item.file_name ? `
          <div style="margin-top:12px; font-size:12px; color:#475569;">
            📁 <b>সংযুক্ত ফাইল:</b> ${item.file_name} (${item.file_size})
          </div>
        ` : ''}

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <b>মোঃ হাবিবুর রহমান</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান সমন্বয়ক, বিজ্ঞান ক্লাব</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <b>মুহাম্মদ শফিকুল ইসলাম</b><br>
            <span style="font-size:12px;color:#475569;">প্রধান শিক্ষক ও প্রধান পৃষ্ঠপোষক</span>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div className="science-master-section" style={{ fontFamily: "'SolaimanLipi', Arial, sans-serif", color: '#0f172a' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#047857',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(4,120,87,0.3)',
          zIndex: 999999,
          fontSize: '13.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC CLUB HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '24px 26px',
        marginBottom: '16px',
        boxShadow: '0 6px 18px rgba(4,120,87,0.18)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.18)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '10px'
            }}>
              ✨ জানব, বুঝব, পরীক্ষা করব, উদ্ভাবন করব • বিজ্ঞান ও প্রযুক্তির নব দিগন্ত
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.3px' }}>
              মগড়া পালস্ বিজ্ঞান ক্লাব (Science Club)
            </h1>
            <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', opacity: 0.95, lineHeight: '1.6', maxWidth: '820px' }}>
              “উদ্ভাবনে তাক লাগাবে গ্রাম, বিজ্ঞানেই গড়ব দেশের নাম” — পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞানের জটিল সূত্রকে সহজ পরীক্ষার মাধ্যমে উন্মোচন এবং খুদে গবেষক ও আগামী দিনের বিজ্ঞানী তৈরির অগ্রযাত্রায় নিবেদিত বিজ্ঞান একাডেমি।
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
              <span style={{ background: 'rgba(255,255,255,0.16)', padding: '4px 10px', borderRadius: '6px' }}>🏛️ স্থাপিত: ২০১৯ খ্রি.</span>
              <span style={{ background: 'rgba(255,255,255,0.16)', padding: '4px 10px', borderRadius: '6px' }}>🔬 কেন্দ্রীয় বিজ্ঞানাগার ও রিসার্চ ল্যাব</span>
              <span style={{ background: 'rgba(255,255,255,0.16)', padding: '4px 10px', borderRadius: '6px' }}>🚀 বার্ষিক বিজ্ঞান মেলা ও উদ্ভাবন প্রদর্শনী</span>
              <span style={{ background: 'rgba(255,255,255,0.16)', padding: '4px 10px', borderRadius: '6px' }}>🏆 জেলা ও উপজেলা চ্যাম্পিয়নশিপ জয়ী</span>
              <span style={{ background: 'rgba(255,255,255,0.16)', padding: '4px 10px', borderRadius: '6px' }}>👥 ১৪০+ সক্রিয় খুদে বিজ্ঞানী সদস্য</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ⬅️ সকল ক্লাবের তালিকায় ফিরুন
              </button>
            )}
            <button
              type="button"
              onClick={() => setSciTab('science_fair')}
              style={{
                background: '#ffffff',
                color: '#047857',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              🚀 বার্ষিক বিজ্ঞান মেলা ২০২৬ ➔
            </button>
          </div>
        </div>
      </div>

      {/* 14-FEATURE DIRECTORY TAB BAR (MATCHING ICT CLUB DIRECTORY LAYOUT) */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #a7f3d0',
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: '22px',
        boxShadow: '0 2px 10px rgba(4, 120, 87, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            বিজ্ঞান ক্লাবের ১৪টি মূল ফিচার ডিরেক্টরি:
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            যেকোনো ফিচারে ক্লিক করে সরাসরি পরিচালনা ও প্রিন্ট করুন
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {SCIENCE_TABS.map((tab) => {
            const isActive = sciTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSciTab(tab.key)}
                style={{
                  flex: '1 1 auto',
                  minWidth: '170px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: isActive ? '#dcfce7' : '#ffffff',
                  color: isActive ? '#065f46' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(4, 120, 87, 0.15)' : 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#ffffff'; }}
              >
                <span>{tab.icon}</span>
                <span>{tab.num}. {tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1: ক্লাব পরিচিতি */}
      {/* ========================================================================= */}
      {sciTab === 'overview' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                🔬 বিজ্ঞান ক্লাব পরিচিতি ও মূল কাঠামো
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintOverviewPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('objectives')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: মূল লক্ষ্য ও উদ্দেশ্য ➔
              </button>
            </div>
          </div>

          {/* Profile Details Table */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ width: '220px', padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>ক্লাবের নাম</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>বিজ্ঞান ক্লাব (মগড়া ইয়ুথ সায়েন্স ক্লাব)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>ইংরেজি নাম</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>Science Club</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>প্রতিষ্ঠানের নাম</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>পরিচালনা</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>পৃষ্ঠপোষক ও কেন্দ্রীয় উপদেষ্টা পরিষদের তত্ত্বাবধানে</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>ক্লাব সমন্বয়ক</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>রসায়ন, পদার্থ ও জীববিজ্ঞান বিষয়ের শিক্ষকবৃন্দ</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>সদস্য যোগ্যতা</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>ষষ্ঠ থেকে দশম শ্রেণির সকল নিয়মিত শিক্ষার্থী</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dcfce7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>কার্যক্রম</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>বিজ্ঞান, প্রযুক্তি, গবেষণা, উদ্ভাবন ও বিজ্ঞান মেলা</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857', background: 'rgba(220,252,231,0.5)' }}>মূলনীতি</td>
                  <td style={{ padding: '10px 14px', fontWeight: 900, color: '#047857', fontSize: '14.5px' }}>
                    “জানব, বুঝব, পরীক্ষা করব, উদ্ভাবন করব”
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4 Pillars of Science Club */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#047857', fontWeight: 800 }}>
            🏛️ বিজ্ঞান ক্লাবের ৪টি মৌলিক ভিত্তি ও স্তম্ভ:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ border: '1px solid #86efac', borderRadius: '8px', padding: '14px', background: '#f0fdf4' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔬</div>
              <b style={{ color: '#047857', fontSize: '14px' }}>হাতে-কলমে পরীক্ষা</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                পাঠ্যবইয়ের বৈজ্ঞানিক তথ্যগুলোকে বিজ্ঞানাগারে সরাসরি পরীক্ষার মাধ্যমে যাচাই করা।
              </p>
            </div>
            <div style={{ border: '1px solid #86efac', borderRadius: '8px', padding: '14px', background: '#f0fdf4' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🚀</div>
              <b style={{ color: '#047857', fontSize: '14px' }}>উদ্ভাবনী গবেষণা ও প্রজেক্ট</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                গ্রাম ও সমাজের বাস্তব সমস্যা সমাধানে সোলার, রোবটিক্স ও সাশ্রয়ী বৈজ্ঞানিক মডেল নির্মাণ।
              </p>
            </div>
            <div style={{ border: '1px solid #86efac', borderRadius: '8px', padding: '14px', background: '#f0fdf4' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏆</div>
              <b style={{ color: '#047857', fontSize: '14px' }}>অলিম্পিয়াড ও প্রতিযোগিতা</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                উপজেলা, জেলা ও জাতীয় পর্যায়ের বিজ্ঞান অলিম্পিয়াড ও কুইজে অংশ নেওয়ার প্রস্তুতি।
              </p>
            </div>
            <div style={{ border: '1px solid #86efac', borderRadius: '8px', padding: '14px', background: '#f0fdf4' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🌱</div>
              <b style={{ color: '#047857', fontSize: '14px' }}>পরিবেশ ও জীববৈচিত্র্য রক্ষা</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                জলবায়ু সচেতনতা, বৃক্ষরোপণ, পানি ও জ্বালানি সাশ্রয় এবং পরিবেশবান্ধব সবুজ জীবনযাপন।
              </p>
            </div>
          </div>

          {/* শীর্ষ পৃষ্ঠপোষক ও সমন্বয়ক পরিষদ */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
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
                  src={getResolvedTeacherPhoto(panelData.coordinators?.[0]?.teacherId, panelData.coordinators?.[0]?.name || 'মোঃ হাবিবুর রহমান')}
                  alt="প্রধান সমন্বয়ক"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }}
                  onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>{panelData.coordinators?.[0]?.name || 'মোঃ হাবিবুর রহমান'}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{panelData.coordinators?.[0]?.designation || 'সিনিয়র শিক্ষক (বিজ্ঞান)'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য */}
      {/* ========================================================================= */}
      {sciTab === 'objectives' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ২
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                🎯 ক্লাবের মূল লক্ষ্য ও উদ্দেশ্য
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintObjectivesPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('panel')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: সমন্বয়ক ও বিচারক প্যানেল ➔
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
            মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় বিজ্ঞান ক্লাবের কার্যক্রম নিম্নোক্ত ৮টি সুনির্দিষ্ট লক্ষ্য ও উদ্দেশ্যের আলোকে বাস্তবায়িত হয়:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {[
              { num: '১', title: 'বিজ্ঞানমনস্কতা ও সচেতনতা', text: 'শিক্ষার্থীদের মধ্যে বিজ্ঞানভিত্তিক জ্ঞান, যুক্তি ও কুসংস্কারমুক্ত সচেতনতা সৃষ্টি করা।' },
              { num: '২', title: 'কৌতূহল ও অনুসন্ধিৎসা বৃদ্ধি', text: 'বিজ্ঞান বিষয়ে আগ্রহ, জানার কৌতূহল ও গভীর অনুসন্ধিৎসা বৃদ্ধি করা।' },
              { num: '৩', title: 'হাতে-কলমে শেখার সুযোগ', text: 'মুখস্থনির্ভর শিক্ষার পরিবর্তে বিজ্ঞানাগারে সরাসরি হাতে-কলমে শেখার সুযোগ তৈরি করা।' },
              { num: '৪', title: 'সৃজনশীলতা ও সমস্যা সমাধান', text: 'শিক্ষার্থীদের সৃজনশীলতা, উদ্ভাবনী চিন্তা ও বাস্তব সমস্যা সমাধানের দক্ষতা বৃদ্ধি করা।' },
              { num: '৫', title: 'প্রযুক্তির ইতিবাচক ব্যবহার', text: 'বিজ্ঞান ও আধুনিক প্রযুক্তির ইতিবাচক ও কল্যাণমুখী ব্যবহার সম্পর্কে সঠিক ধারণা দেওয়া।' },
              { num: '৬', title: 'পরিবেশ ও জীববৈচিত্র্য সংরক্ষণ', text: 'পরিবেশ, জলবায়ু পরিবর্তন, জীববৈচিত্র্য ও প্রাকৃতিক সম্পদ সংরক্ষণে সচেতনতা গড়ে তোলা।' },
              { num: '৭', title: 'বিজ্ঞান মেলা ও অলিম্পিয়াড উপযোগী করা', text: 'বিজ্ঞান মেলা, অলিম্পিয়াড, কুইজ ও বিভিন্ন প্রতিযোগিতায় অংশগ্রহণের উপযোগী করে গড়ে তোলা।' },
              { num: '৮', title: 'ভবিষ্যৎ বিজ্ঞানী ও গবেষক তৈরি', text: 'শিক্ষার্থীদের মাঝে ভবিষ্যৎ বিজ্ঞানী, গবেষক, প্রকৌশলী ও প্রযুক্তিবিদ হওয়ার আগ্রহ সৃষ্টি করা।' }
            ].map(item => (
              <div key={item.num} style={{
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '14px',
                background: '#f0fdf4',
                borderLeft: '5px solid #059669',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{
                  background: '#047857',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {item.num}
                </span>
                <div>
                  <b style={{ fontSize: '14px', color: '#047857' }}>{item.title}</b>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3: সমন্বয়ক ও বিচারক প্যানেল */}
      {/* ========================================================================= */}
      {sciTab === 'panel' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৩
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                👨‍🏫 সমন্বয়ক ও বিচারক প্যানেল
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintPanelPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('executive')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: কার্যনির্বাহী পরিষদ ➔
              </button>
            </div>
          </div>

          {/* Coordinators Section */}
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#047857', fontWeight: 800 }}>
              ১. ক্লাব সমন্বয়কমণ্ডলী (Coordinators) — মোট {toBn((panelData.coordinators || []).length)} জন:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {(panelData.coordinators || []).map((c) => (
                <div key={c.id} style={{
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative'
                }}>
                  <img
                    src={getResolvedTeacherPhoto(c.teacherId, c.name)}
                    alt={c.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '14.5px', color: '#0f172a', display: 'block' }}>{c.name}</b>
                    <span style={{ fontSize: '12px', color: '#475569', display: 'block' }}>{c.designation}</span>
                    <span style={{ fontSize: '12px', color: '#047857', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                      {c.role}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>📞 {c.phone}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleStartEditCoordinator(c)}
                      title="সমন্বয়ক সম্পাদনা"
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoordinator(c.id)}
                      title="সমন্বয়ক মুছুন"
                      style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', color: '#b91c1c', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Coordinator Form */}
            <form onSubmit={handleAddCoordinator} style={{
              background: '#f8fafc',
              border: '1.5px dashed #86efac',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
                    onChange={(e) => {
                      setNewCoordTeacherId(e.target.value);
                      const t = activeTeachers.find(x => x.id === e.target.value);
                      if (t?.phone) setNewCoordPhone(t.phone);
                    }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name_bn || t.name} — {t.designation} ({t.subject || 'সাধারণ'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  ক্লাবে অর্পিত দায়িত্ব / পদবী:
                </label>
                <input
                  type="text"
                  value={newCoordRole}
                  onChange={(e) => setNewCoordRole(e.target.value)}
                  placeholder="যেমন: সমন্বয়ক (পদার্থ ও রসায়ন বিভাগ)"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  value={newCoordPhone}
                  onChange={(e) => setNewCoordPhone(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>➕</span>
                <span>সমন্বয়ক যুক্ত করুন</span>
              </button>
            </form>
          </div>

          {/* Judges Panel Section */}
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#047857', fontWeight: 800 }}>
              ২. বিচারক প্যানেল (Judges Panel — ৩ সদস্য বিশিষ্ট):
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {/* Chief Judge */}
              <div style={{
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '14px',
                background: '#f0fdf4',
                position: 'relative'
              }}>
                <span style={{ background: '#047857', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  প্রধান বিচারক (১ জন)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judges?.chiefJudge?.teacherId, panelData.judges?.chiefJudge?.name)}
                    alt="Chief Judge"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #047857', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14px', color: '#0f172a' }}>{panelData.judges?.chiefJudge?.name}</b>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{panelData.judges?.chiefJudge?.designation}</div>
                    <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700 }}>সার্বিক মান ও ফাইনাল বিচার</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '4px' }}>শিক্ষক ড্রপ-ডাউন থেকে পরিবর্তন:</label>
                  <select
                    value={panelData.judges?.chiefJudge?.teacherId || ''}
                    onChange={e => handleChangeJudge('chiefJudge', e.target.value)}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judge 1 */}
              <div style={{
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '14px',
                background: '#f0fdf4'
              }}>
                <span style={{ background: '#059669', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  বিচারক ১ (একাডেমিক মূল্যায়ন)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judges?.judge1?.teacherId, panelData.judges?.judge1?.name)}
                    alt={panelData.judges?.judge1?.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14px', color: '#0f172a' }}>{panelData.judges?.judge1?.name}</b>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{panelData.judges?.judge1?.designation}</div>
                    <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>তাত্ত্বিক ও সৃজনশীলতা মূল্যায়ন</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '4px' }}>শিক্ষক ড্রপ-ডাউন থেকে পরিবর্তন:</label>
                  <select
                    value={panelData.judges?.judge1?.teacherId || ''}
                    onChange={e => handleChangeJudge('judge1', e.target.value)}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judge 2 */}
              <div style={{
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '14px',
                background: '#f0fdf4'
              }}>
                <span style={{ background: '#059669', color: '#ffffff', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  বিচারক ২ (ব্যবহারিক উদ্ভাবন)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <img
                    src={getResolvedTeacherPhoto(panelData.judges?.judge2?.teacherId, panelData.judges?.judge2?.name)}
                    alt={panelData.judges?.judge2?.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669', flexShrink: 0 }}
                    onError={(e) => { e.target.src = getTeacherPhoto(null); }}
                  />
                  <div>
                    <b style={{ fontSize: '14px', color: '#0f172a' }}>{panelData.judges?.judge2?.name}</b>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{panelData.judges?.judge2?.designation}</div>
                    <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>ল্যাব কার্যকারিতা ও উপযোগিতা</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '4px' }}>শিক্ষক ড্রপ-ডাউন থেকে পরিবর্তন:</label>
                  <select
                    value={panelData.judges?.judge2?.teacherId || ''}
                    onChange={e => handleChangeJudge('judge2', e.target.value)}
                    style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    {activeTeachers.map(t => (
                      <option key={t.id || t.employee_id} value={t.id || t.employee_id}>
                        {t.name_bn || t.name_en} — {t.designation || 'শিক্ষক'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4: কার্যনির্বাহী পরিষদ */}
      {/* ========================================================================= */}
      {sciTab === 'executive' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৪
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                👥 কার্যনির্বাহী পরিষদ (Executive Committee)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintExecPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('departments')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: বিভাগসমূহ ➔
              </button>
            </div>
          </div>

          {/* 7 Key Executive Posts */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#047857', fontWeight: 800 }}>
            🎖️ মূল কার্যনির্বাহী পদাধিকারীবৃন্দ (৭ পদ):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { key: 'president', role: 'সভাপতি', data: execData.posts?.president },
              { key: 'vice_president', role: 'সহ-সভাপতি', data: execData.posts?.vice_president },
              { key: 'general_secretary', role: 'সাধারণ সম্পাদক', data: execData.posts?.general_secretary },
              { key: 'joint_secretary', role: 'যুগ্ম সম্পাদক', data: execData.posts?.joint_secretary },
              { key: 'organizing_secretary', role: 'সাংগঠনিক সম্পাদক', data: execData.posts?.organizing_secretary },
              { key: 'publicity_secretary', role: 'প্রচার ও প্রকাশনা সম্পাদক', data: execData.posts?.publicity_secretary },
              { key: 'treasurer', role: 'অর্থ সম্পাদক', data: execData.posts?.treasurer }
            ].map((p) => (
              <div key={p.key} style={{
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#f0fdf4',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ background: '#047857', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    {p.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartEditExecPost(p.key)}
                    title="পদাধিকারী এডিট করুন"
                    style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', color: '#047857' }}
                  >
                    ✏️ এডিট
                  </button>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <b style={{ fontSize: '14.5px', color: '#0f172a' }}>{p.data?.name || '—'}</b>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    শ্রেণি: <b>{p.data?.class || '—'}</b> • শাখা/বিভাগ: <b>{p.data?.section || '—'}</b> • রোল: <b>{toBn(p.data?.roll || '—')}</b>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    📞 {p.data?.phone || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* General Executive Members */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#047857', fontWeight: 800 }}>
              👥 কার্যনির্বাহী সদস্যবৃন্দ (একাধিক সদস্য যুক্তকরণ ও তালিকা):
            </h3>

            {/* Add Member Form with Class, Section/Department */}
            <form onSubmit={handleAddExecutiveMember} style={{
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  শিক্ষার্থীর নাম: *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="যেমন: আফিয়া জাহান"
                  style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ flex: '0 1 110px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  শ্রেণি: *
                </label>
                <select
                  value={newMemberClass}
                  onChange={(e) => handleMemberClassChange(e.target.value)}
                  style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                </select>
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  শাখা / বিভাগ: *
                </label>
                <select
                  value={newMemberSection}
                  onChange={(e) => setNewMemberSection(e.target.value)}
                  style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  {getSectionOptionsForClass(newMemberClass).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '0 1 90px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  রোল নং:
                </label>
                <input
                  type="text"
                  value={newMemberRoll}
                  onChange={(e) => setNewMemberRoll(e.target.value)}
                  placeholder="যেমন: ৩"
                  style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', textAlign: 'center' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>➕</span>
                <span>সদস্য যুক্ত করুন</span>
              </button>
            </form>

            {/* Members Grid with Edit & Delete */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {(execData.members || []).map((m) => (
                <div key={m.id} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{m.name}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      শ্রেণি: {m.class} • {m.section || '—'} • রোল: {toBn(m.roll)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleStartEditMember(m)}
                      title="সদস্য এডিট করুন"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 5px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(m.id)}
                      title="সদস্য মুছুন"
                      style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2px 5px', fontSize: '11px', color: '#b91c1c', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 5: বিজ্ঞান ক্লাবের বিভাগসমূহ (পদার্থ, রসায়ন, জীববিজ্ঞান) */}
      {/* ========================================================================= */}
      {sciTab === 'departments' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৫
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                🧪 বিজ্ঞান ক্লাবের বিভাগসমূহ (৩টি মূল একাডেমিক উইং)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewDepartment}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন বিভাগ যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintDeptsPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('activities')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: নিয়মিত কার্যক্রম ➔
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
            শিক্ষার্থীদের বিষয়ভিত্তিক দক্ষতা ও গভীর অনুসন্ধিৎসা গড়ে তুলতে বিজ্ঞান ক্লাবের যাবতীয় কার্যক্রম পদার্থবিজ্ঞান, রসায়ন এবং জীববিজ্ঞান এই ৩টি প্রধান শাখায় বিভক্ত:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {departments.map((dept) => (
              <div key={dept.id} style={{
                border: '1.5px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px',
                background: '#f0fdf4',
                borderLeft: `6px solid ${dept.color || '#059669'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(4,120,87,0.05)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '26px' }}>{dept.icon}</span>
                      <div>
                        <b style={{ fontSize: '16px', color: '#047857', display: 'block' }}>{dept.title}</b>
                        <small style={{ color: '#64748b', fontSize: '11px' }}>{dept.titleEn}</small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditDepartment(dept)}
                        title="বিভাগ এডিট করুন"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #bbf7d0',
                          borderRadius: '5px',
                          color: '#047857',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>✏️</span>
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDepartment(dept.id)}
                        title="বিভাগ মুছে ফেলুন"
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '5px',
                          color: '#e11d48',
                          padding: '3px 7px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #dcfce7',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: '#166534',
                    fontWeight: 700,
                    marginBottom: '10px'
                  }}>
                    👨‍🏫 দায়িত্বপ্রাপ্ত শিক্ষক: {dept.inCharge}
                  </div>

                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    {dept.summary}
                  </p>

                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#047857', marginBottom: '6px' }}>
                    🔬 নিয়মিত ল্যাব পরীক্ষা ও অ্যাক্টিভিটি:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', lineHeight: '1.55' }}>
                    {(dept.experiments || []).map((exp, idx) => (
                      <li key={idx}>{exp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 6: নিয়মিত কার্যক্রম (১০টি নিয়মিত কার্যক্রম) */}
      {/* ========================================================================= */}
      {sciTab === 'activities' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৬
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                ⚡ বিজ্ঞান ক্লাবের নিয়মিত কার্যক্রম (১০টি নিয়মিত কার্যক্রম)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewActivity}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন কার্যক্রম যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintActivitiesPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('calendar')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: বার্ষিক কর্মপরিকল্পনা ➔
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {activities.map((act) => (
              <div key={act.id} style={{
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px',
                background: '#f0fdf4',
                borderLeft: '5px solid #047857',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(4,120,87,0.04)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: '#047857',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 900
                      }}>
                        কার্যক্রম {act.num}
                      </span>
                      <b style={{ fontSize: '15px', color: '#047857' }}>{act.title}</b>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditActivity(act)}
                        title="কার্যক্রম এডিট করুন"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #bbf7d0',
                          borderRadius: '5px',
                          color: '#047857',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>✏️</span>
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(act.id)}
                        title="কার্যক্রম মুছে ফেলুন"
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '5px',
                          color: '#e11d48',
                          padding: '3px 7px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <span style={{
                    display: 'inline-block',
                    background: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #86efac',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '8px'
                  }}>
                    {act.focus}
                  </span>

                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                    {act.details}
                  </p>
                </div>

                <div style={{
                  borderTop: '1px dashed #bbf7d0',
                  paddingTop: '8px',
                  fontSize: '11.5px',
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  <span>⏰ <b>সময়:</b> {act.time}</span>
                  <span>📍 <b>ভেন্যু:</b> {act.venue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 7: বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার */}
      {/* ========================================================================= */}
      {sciTab === 'calendar' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৭
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                📅 বার্ষিক কর্মপরিকল্পনা ও ক্যালেন্ডার
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintProgramsPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('selection_rules')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: সদস্য নির্বাচনের নিয়ম ➔
              </button>
            </div>
          </div>

          {/* Quarterly Roadmap */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#047857', fontWeight: 800 }}>
                🎯 ত্রৈমাসিক কর্মপরিকল্পনা রোডম্যাপ (Quarterly Roadmap):
              </h3>
              <button
                type="button"
                onClick={handleAddNewQuarter}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1px solid #86efac',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ➕ নতুন ত্রৈমাসিক রোডম্যাপ যুক্ত করুন
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {quarterlyPlans.map((q, idx) => (
                <div key={q.id || idx} style={{
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#f0fdf4',
                  borderTop: `4px solid ${q.color || '#059669'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{
                        background: q.color || '#059669',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {q.quarter}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEditQuarter(q, idx)}
                          title="রোডম্যাপ এডিট করুন"
                          style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', color: '#047857' }}
                        >
                          ✏️ এডিট
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuarter(q.id || idx)}
                          title="রোডম্যাপ মুছুন"
                          style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#e11d48', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                      {q.title}
                    </b>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                      {(q.items || []).map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 12 Months Activity Calendar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#047857', fontWeight: 800 }}>
                🗓️ ১২ মাসের ধারাবাহিক অ্যাক্টিভিটি ক্যালেন্ডার:
              </h3>
              <button
                type="button"
                onClick={handleAddNewMonth}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1px solid #86efac',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ➕ নতুন মাসের কর্মসূচি যুক্ত করুন
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {monthlyCalendar.map((m, idx) => (
                <div key={m.id || idx} style={{
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(4,120,87,0.04)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#047857', fontSize: '13.5px' }}>
                        {m.month}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{m.date}</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditMonth(m, idx)}
                          title="মাসের কর্মসূচি এডিট করুন"
                          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '1px 5px', fontSize: '10.5px', cursor: 'pointer', color: '#047857' }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMonth(m.id || idx)}
                          title="কর্মসূচি মুছুন"
                          style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '4px', padding: '1px 5px', fontSize: '10.5px', color: '#e11d48', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: '4px 0 6px 0', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', lineHeight: '1.4' }}>
                      {m.title}
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                    👨‍🏫 সমন্বয়ক: {m.coordinator}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 8: সদস্য নির্বাচনের নিয়ম */}
      {/* ========================================================================= */}
      {sciTab === 'selection_rules' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৮
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                📜 সদস্য নির্বাচনের নিয়ম ({toBn(selectionRules.length)}টি সুনির্দিষ্ট মানদণ্ড)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewSelectionRule}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন মানদণ্ড যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintRulesPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('membership')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: আবেদন গ্রহণ ও নির্বাচন ➔
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
            বিজ্ঞান ক্লাবের স্বচ্ছতা, মেধার সমসুযোগ এবং ল্যাব নিরাপত্তা বজায় রাখার স্বার্থে সদস্য নির্বাচনের ক্ষেত্রে নিম্নোক্ত নীতিমালা অনুসরণ করা হয়:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {selectionRules.map((r, idx) => (
              <div key={r.id || idx} style={{
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px',
                background: '#f0fdf4',
                borderLeft: '5px solid #047857',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(4,120,87,0.04)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#047857', color: '#ffffff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>
                        {r.num}
                      </span>
                      <b style={{ fontSize: '14.5px', color: '#047857' }}>{r.title}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditSelectionRule(r)}
                        title="মানদণ্ড এডিট করুন"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #bbf7d0',
                          borderRadius: '5px',
                          color: '#047857',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>✏️</span>
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSelectionRule(r)}
                        title="মানদণ্ড মুছে ফেলুন"
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '5px',
                          color: '#e11d48',
                          padding: '3px 7px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    {r.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 9: আবেদন গ্রহণ ও সদস্য নির্বাচন */}
      {/* ========================================================================= */}
      {sciTab === 'membership' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ৯
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                📝 আবেদন গ্রহণ ও সদস্য নির্বাচন (Membership Application)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintMembersDirectory}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>সদস্য ডিরেক্টরি প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('discipline_safety')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: শৃঙ্খলা ও নিরাপত্তাবিধি ➔
              </button>
            </div>
          </div>

          {/* Member Registration Form */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '10px',
            padding: '18px',
            marginBottom: '22px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#047857', fontWeight: 800 }}>
              ✍️ নতুন বিজ্ঞান ক্লাব সদস্য আবেদন ফরম (Membership Form):
            </h3>

            <form onSubmit={handleSubmitMembershipForm}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    শিক্ষার্থীর নাম: *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.student_name}
                    onChange={(e) => setMemberForm({ ...memberForm, student_name: e.target.value })}
                    placeholder="যেমন: তানভীর আহমেদ"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    শ্রেণি: *
                  </label>
                  <select
                    value={memberForm.class_name}
                    onChange={(e) => {
                      const cls = e.target.value;
                      const isNineOrTen = cls === '৯ম' || cls === '১০ম';
                      setMemberForm({
                        ...memberForm,
                        class_name: cls,
                        section: isNineOrTen ? 'বিজ্ঞান' : 'শাখা ক'
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    শাখা / বিভাগ: *
                  </label>
                  <select
                    value={memberForm.section}
                    onChange={(e) => setMemberForm({ ...memberForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {getSectionOptionsForClass(memberForm.class_name).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    রোল নং:
                  </label>
                  <input
                    type="text"
                    value={memberForm.roll_no}
                    onChange={(e) => setMemberForm({ ...memberForm, roll_no: e.target.value })}
                    placeholder="যেমন: ১"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    অভিভাবকের নাম:
                  </label>
                  <input
                    type="text"
                    value={memberForm.guardian_name}
                    onChange={(e) => setMemberForm({ ...memberForm, guardian_name: e.target.value })}
                    placeholder="যেমন: মোঃ জহিরুল ইসলাম"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    জরুরি যোগাযোগ মোবাইল:
                  </label>
                  <input
                    type="text"
                    value={memberForm.mobile}
                    onChange={(e) => setMemberForm({ ...memberForm, mobile: e.target.value })}
                    placeholder="যেমন: 01711-000000"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    পছন্দের বিভাগ / উইং:
                  </label>
                  <select
                    value={memberForm.wing_preference}
                    onChange={(e) => setMemberForm({ ...memberForm, wing_preference: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="পদার্থবিজ্ঞান বিভাগ">⚡ পদার্থবিজ্ঞান বিভাগ</option>
                    <option value="রসায়ন বিভাগ">🧪 রসায়ন বিভাগ</option>
                    <option value="জীববিজ্ঞান বিভাগ">🔬 জীববিজ্ঞান ও পরিবেশ বিভাগ</option>
                    <option value="সাধারণ বিজ্ঞান ও অলিম্পিয়াড">🏆 সাধারণ বিজ্ঞান ও অলিম্পিয়াড</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  বিজ্ঞানে আগ্রহের কারণ ও বিশেষ লক্ষ্য:
                </label>
                <textarea
                  rows={2}
                  value={memberForm.reason}
                  onChange={(e) => setMemberForm({ ...memberForm, reason: e.target.value })}
                  placeholder="যেমন: বিজ্ঞান মেলায় নতুন সোলার মডেল প্রদর্শন করতে চাই..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                }}
              >
                <span>🚀</span>
                <span>আবেদন জমা দিন ও রসিদ প্রস্তুত করুন</span>
              </button>
            </form>
          </div>

          {/* Members Directory Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#047857', fontWeight: 800 }}>
                📋 বিজ্ঞান ক্লাব সদস্য ডিরেক্টরি (মোট {toBn(memberships.length)} জন):
              </h3>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 নাম বা আইডি দিয়ে খুঁজুন..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', minWidth: '180px' }}
                />
                <select
                  value={memberFilterClass}
                  onChange={(e) => setMemberFilterClass(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                >
                  <option value="all">সকল শ্রেণি</option>
                  <option value="১০ম">১০ম শ্রেণি</option>
                  <option value="৯ম">৯ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', width: '40px', textAlign: 'center' }}>ক্র.</th>
                    <th style={{ padding: '10px 12px' }}>ট্র্যাকিং আইডি</th>
                    <th style={{ padding: '10px 12px' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>শ্রেণি ও শাখা</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>রোল</th>
                    <th style={{ padding: '10px 12px' }}>পছন্দের বিভাগ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>মোবাইল</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>অনুমোদন</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships
                    .filter(m => memberFilterClass === 'all' || m.class_name === memberFilterClass)
                    .filter(m => !memberSearch.trim() || m.student_name.toLowerCase().includes(memberSearch.toLowerCase()) || m.trackingId.toLowerCase().includes(memberSearch.toLowerCase()))
                    .map((m, idx) => (
                      <tr key={m.trackingId} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{toBn(idx + 1)}</td>
                        <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>{m.trackingId}</td>
                        <td style={{ padding: '9px 12px', fontWeight: 800, color: '#0f172a' }}>{m.student_name}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>{m.class_name} ({m.section || '—'})</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>{toBn(m.roll_no)}</td>
                        <td style={{ padding: '9px 12px', fontSize: '12px', color: '#047857', fontWeight: 700 }}>{m.wing_preference || '—'}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', fontSize: '12px' }}>{m.mobile || '—'}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleMemberStatus(m.trackingId)}
                            style={{
                              border: 'none',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: m.status === 'অনুমোদিত' ? '#dcfce7' : '#fef3c7',
                              color: m.status === 'অনুমোদিত' ? '#166534' : '#92400e'
                            }}
                          >
                            {m.status === 'অনুমোদিত' ? '✓ অনুমোদিত' : '⏳ অপেক্ষমান'}
                          </button>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handlePrintMemberReceipt(m)}
                              title="রসিদ প্রিন্ট করুন"
                              style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer', color: '#047857' }}
                            >
                              🖨️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMembership(m.trackingId)}
                              title="আবেদন মুছুন"
                              style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', color: '#b91c1c', cursor: 'pointer' }}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 10: শৃঙ্খলা ও নিরাপত্তাবিধি */}
      {/* ========================================================================= */}
      {sciTab === 'discipline_safety' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১০
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#b91c1c' }}>
                🛡️ শৃঙ্খলা ও নিরাপত্তাবিধি ({toBn(disciplineRules.length)}টি বাধ্যতামূলক নিয়ম)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewDisciplineRule}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন নিরাপত্তাবিধি যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintConductPad}
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1.5px solid #fca5a5',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('competitions')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: কুইজ ও প্রতিযোগিতা ➔
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '22px' }}>
            {disciplineRules.map((r, idx) => (
              <div key={r.id || idx} style={{
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '14px 16px',
                background: '#fff5f5',
                borderLeft: '5px solid #ef4444',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(239,68,68,0.04)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#ef4444', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, flexShrink: 0 }}>
                        {r.num}
                      </span>
                      <b style={{ fontSize: '14px', color: '#991b1b' }}>{r.rule}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditDisciplineRule(r)}
                        title="নিয়ম এডিট করুন"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fecaca',
                          borderRadius: '5px',
                          color: '#dc2626',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>✏️</span>
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDisciplineRule(r)}
                        title="নিয়ম মুছে ফেলুন"
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          borderRadius: '5px',
                          color: '#991b1b',
                          padding: '3px 7px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Student Lab Safety Pledge */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '10px',
            padding: '18px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#047857', fontWeight: 800 }}>
              ✍️ শিক্ষার্থী বিজ্ঞানাগার ও ল্যাব নিরাপত্তা অঙ্গীকারনামা:
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
              বিজ্ঞানাগারে প্রবেশের পূর্বে প্রতিটি শিক্ষার্থীকে এই অঙ্গীকারনামা পূরণ ও ডিজিটাল স্বাক্ষর সম্পন্ন করতে হবে।
            </p>

            <form onSubmit={handleSubmitPledge}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শিক্ষার্থীর নাম:</label>
                  <input
                    type="text"
                    required
                    value={pledgeForm.student_name}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, student_name: e.target.value })}
                    placeholder="যেমন: তানভীর আহমেদ"
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শ্রেণি:</label>
                  <select
                    value={pledgeForm.class_name}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, class_name: e.target.value })}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শাখা / বিভাগ:</label>
                  <select
                    value={pledgeForm.section}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, section: e.target.value })}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    {getSectionOptionsForClass(pledgeForm.class_name).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>রোল নং:</label>
                  <input
                    type="text"
                    required
                    value={pledgeForm.roll_no}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, roll_no: e.target.value })}
                    placeholder="যেমন: ১"
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px dashed #86efac',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#334155',
                marginBottom: '12px',
                lineHeight: '1.6'
              }}>
                🔒 <b>ডিজিটাল অঙ্গীকার:</b> “আমি সজ্ঞানে ঘোষণা করছি যে, বিদ্যালয়ের বিজ্ঞানাগার ও রাসায়নিক ল্যাবের সকল বিধিনিষেধ পূর্ণরূপে মেনে চলব। শিক্ষকের অনুমতি ছাড়া কোনো বিকারক স্পর্শ করব না এবং ল্যাবের সম্পদের সুরক্ষায় সচেষ্ট থাকব।”
              </div>

              <button
                type="submit"
                style={{
                  background: pledgeForm.signed ? '#15803d' : '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {pledgeForm.signed ? '✓ অঙ্গীকার গৃহীত হয়েছে' : '✍️ অঙ্গীকার স্বাক্ষর করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 11: কুইজ/বিতর্ক প্রতিযোগিতা ও ফলাফল (ClubCompetitionEngine) */}
      {/* ========================================================================= */}
      {sciTab === 'competitions' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১১
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                🏆 বিজ্ঞান কুইজ, অলিম্পিয়াড ও প্রতিযোগিতা ইঞ্জিন
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSciTab('submissions')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: প্রজেক্ট প্রকাশ ➔
            </button>
          </div>

          <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '18px', lineHeight: '1.6' }}>
            বিজ্ঞান অলিম্পিয়াড, বিজ্ঞান কুইজ, প্রজেক্ট প্রেজেন্টেশন ও বিজ্ঞান বিতর্কের লাইভ স্কোরিং, মূল্যায়ন শিট এবং স্বয়ংক্রিয় ডিজিটাল সার্টিফিকেট প্রস্তুতকরণ ব্যবস্থা:
          </p>

          <ClubCompetitionEngine
            activeClub="science"
            clubId="science"
            clubName="মগড়া ইয়ুথ সায়েন্স ক্লাব (বিজ্ঞান ক্লাব)"
            teachers={teachers}
            defaultEventType="বিজ্ঞান অলিম্পিয়াড"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 12: প্রজেক্ট প্রকাশ (বিজ্ঞান প্রজেক্ট, ব্যানার ও মডেল প্রকাশ) */}
      {/* ========================================================================= */}
      {sciTab === 'submissions' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১২
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                📁 প্রজেক্ট প্রকাশ
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSciTab('science_fair')}
              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
            >
              পরবর্তী ফিচার: বিজ্ঞান মেলার আয়োজন ➔
            </button>
          </div>

          {/* Submission Form */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '10px',
            padding: '18px',
            marginBottom: '22px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#047857', fontWeight: 800 }}>
              📤 নতুন বিজ্ঞান প্রজেক্ট প্রকাশ ও জমা দিন:
            </h3>

            <form onSubmit={handleSubmitWriting}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    শিক্ষার্থীর নাম: *
                  </label>
                  <input
                    type="text"
                    required
                    value={writeForm.student_name}
                    onChange={(e) => setWriteForm({ ...writeForm, student_name: e.target.value })}
                    placeholder="যেমন: তানভীর আহমেদ"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    শ্রেণি: *
                  </label>
                  <select
                    value={writeForm.class_name}
                    onChange={(e) => {
                      const cls = e.target.value;
                      const isNineOrTen = cls === '৯ম' || cls === '১০ম';
                      setWriteForm({
                        ...writeForm,
                        class_name: cls,
                        section: isNineOrTen ? 'বিজ্ঞান' : 'শাখা ক'
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="১০ম">১০ম শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    শাখা / বিভাগ: *
                  </label>
                  <select
                    value={writeForm.section}
                    onChange={(e) => setWriteForm({ ...writeForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {getSectionOptionsForClass(writeForm.class_name).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    রোল নং:
                  </label>
                  <input
                    type="text"
                    value={writeForm.roll}
                    onChange={(e) => setWriteForm({ ...writeForm, roll: e.target.value })}
                    placeholder="যেমন: ১"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    প্রকাশনার ধরণ: *
                  </label>
                  <select
                    value={writeForm.type}
                    onChange={(e) => setWriteForm({ ...writeForm, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="বিজ্ঞান প্রকল্প">🔬 বিজ্ঞান প্রকল্প (Science Project)</option>
                    <option value="ডিজিটাল পোস্টার">🎨 ডিজিটাল পোস্টার (Science Poster)</option>
                    <option value="ডিজিটাল ব্যানার">🖼️ ডিজিটাল ব্যানার (Digital Banner)</option>
                    <option value="বিজ্ঞান দেয়ালিকা">📰 বিজ্ঞান দেয়ালিকা লেখা (Wall Magazine)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    প্রজেক্ট / পোস্টারের শিরোনাম: *
                  </label>
                  <input
                    type="text"
                    required
                    value={writeForm.title}
                    onChange={(e) => setWriteForm({ ...writeForm, title: e.target.value })}
                    placeholder="যেমন: স্বয়ংক্রিয় সোলার ইরিগেশন সিস্টেম"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  প্রকল্পের সারসংক্ষেপ / কার্যপ্রণালী ও উপকারিতা: *
                </label>
                <textarea
                  required
                  rows={3}
                  value={writeForm.summary}
                  onChange={(e) => setWriteForm({ ...writeForm, summary: e.target.value })}
                  placeholder="প্রকল্পের মূল কার্যপ্রণালী, ব্যবহৃত যন্ত্রাংশ ও সমাজের জন্য উপকারিতা লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {/* File Upload Control */}
              <div style={{
                background: '#ffffff',
                border: '1.5px dashed #86efac',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '14px'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#047857', marginBottom: '6px' }}>
                  📁 প্রজেক্ট ডকুমেন্ট / পোস্টার ইমেজ ফাইল আপলোড (PNG, JPG, PDF, TXT — সর্বোচ্চ ১৫ MB):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    style={{ fontSize: '12.5px' }}
                  />
                  {writeForm.file_name && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#166534' }}>
                      <span>✓ {writeForm.file_name} ({writeForm.file_size})</span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 800 }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🚀</span>
                <span>প্রজেক্ট প্রকাশ ও জমা দিন</span>
              </button>
            </form>
          </div>

          {/* Submissions Showcase Gallery */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#047857', fontWeight: 800 }}>
                🖼️ প্রকাশিত বিজ্ঞান প্রজেক্ট গ্যালারি ({toBn(submissions.length)}টি):
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 শিরোনাম বা শিক্ষার্থী..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minWidth: '160px' }}
                />
                <select
                  value={submissionFilterType}
                  onChange={(e) => setSubmissionFilterType(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="all">সকল ধরণ</option>
                  <option value="বিজ্ঞান প্রকল্প">বিজ্ঞান প্রকল্প</option>
                  <option value="ডিজিটাল পোস্টার">ডিজিটাল পোস্টার</option>
                  <option value="ডিজিটাল ব্যানার">ডিজিটাল ব্যানার</option>
                  <option value="বিজ্ঞান দেয়ালিকা">বিজ্ঞান দেয়ালিকা</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
              {submissions
                .filter(s => submissionFilterType === 'all' || s.type === submissionFilterType)
                .filter(s => !submissionSearch.trim() || s.title.toLowerCase().includes(submissionSearch.toLowerCase()) || s.student_name.toLowerCase().includes(submissionSearch.toLowerCase()))
                .map((item) => (
                  <div key={item.id} style={{
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '14px',
                    background: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(4,120,87,0.04)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                          background: item.type.includes('ব্যানার') ? '#e0e7ff' : item.type.includes('পোস্টার') ? '#fef3c7' : '#dcfce7',
                          color: item.type.includes('ব্যানার') ? '#3730a3' : item.type.includes('পোস্টার') ? '#92400e' : '#166534',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10.5px',
                          fontWeight: 800
                        }}>
                          {item.type}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSubmissionStatus(item.id)}
                            style={{
                              background: item.status === 'অনুমোদিত' ? '#dcfce7' : '#fef3c7',
                              color: item.status === 'অনুমোদিত' ? '#166534' : '#92400e',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '2px 7px',
                              fontSize: '10px',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {item.status}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(item.id)}
                            title="মুছে ফেলুন"
                            style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2px 5px', fontSize: '11px', color: '#b91c1c', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <b style={{ fontSize: '14.5px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                        {item.title}
                      </b>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                        উদ্ভাবক: <b>{item.student_name}</b> ({item.class_name} • {item.section || '—'} • রোল: {toBn(item.roll)})
                      </div>
                      <p style={{
                        margin: '0 0 10px 0',
                        fontSize: '12.5px',
                        color: '#334155',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.summary}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px dashed #bbf7d0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setReadingItem(item)}
                        style={{
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        🔍 বিস্তারিত দেখুন
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintSubmission(item)}
                        style={{
                          background: '#ffffff',
                          color: '#047857',
                          border: '1px solid #86efac',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>🖨️</span>
                        <span>প্যাডে প্রিন্ট</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 13: বিজ্ঞান মেলার আয়োজন */}
      {/* ========================================================================= */}
      {sciTab === 'science_fair' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১৩
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                🚀 বিজ্ঞান মেলার আয়োজন ও উদ্ভাবনী স্টল নির্দেশিকা
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrintFairPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিজ্ঞান মেলা ব্রোশার প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setSciTab('achievements')}
                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                পরবর্তী ফিচার: অর্জন ও ট্রফি গ্যালারি ➔
              </button>
            </div>
          </div>

          {/* Science Fair Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 900 }}>
              ৮ম বার্ষিক মগড়া বিজ্ঞান ও প্রযুক্তি উদ্ভাবন মেলা ২০২৬
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', opacity: 0.95 }}>
              “উদ্ভাবনে তাক লাগাবে গ্রাম, বিজ্ঞানেই গড়ব দেশের নাম” — শিক্ষার্থীদের শত উদ্ভাবনী মডেল, বিজ্ঞান অলিম্পিয়াড ও বিশেষজ্ঞ জুরি মূল্যায়নের মহাসম্মেলন।
            </p>
            <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', flexWrap: 'wrap' }}>
              <span>📍 স্থান: বিদ্যালয় মুক্তমঞ্চ ও বিজ্ঞানাগার প্রাঙ্গণ</span>
              <span>📅 সম্ভাব্য তারিখ: ২৪–২৬ অক্টোবর, ২০২৬</span>
              <span>🏆 মোট পুরস্কার: ১ম, ২য়, ৩য় ও শ্রেষ্ঠ উদ্ভাবক ক্রেস্ট</span>
            </div>
          </div>

          {/* New Project Registration for Fair */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '22px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#047857', fontWeight: 800 }}>
              ➕ বিজ্ঞান মেলায় নতুন স্টল / প্রকল্প রেজিস্ট্রেশন ফরম:
            </h3>

            <form onSubmit={handleSubmitFairProject}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>প্রকল্পের নাম: *</label>
                  <input
                    type="text"
                    required
                    value={fairForm.title}
                    onChange={(e) => setFairForm({ ...fairForm, title: e.target.value })}
                    placeholder="যেমন: স্মার্ট ড্রেন ক্লিনার"
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>বিভাগ / উইং:</label>
                  <select
                    value={fairForm.wing}
                    onChange={(e) => setFairForm({ ...fairForm, wing: e.target.value })}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="পদার্থবিজ্ঞান বিভাগ">⚡ পদার্থবিজ্ঞান বিভাগ</option>
                    <option value="রসায়ন বিভাগ">🧪 রসায়ন বিভাগ</option>
                    <option value="জীববিজ্ঞান বিভাগ">🔬 জীববিজ্ঞান ও পরিবেশ বিভাগ</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>উদ্ভাবক দলনেতা: *</label>
                  <input
                    type="text"
                    required
                    value={fairForm.teamLeader}
                    onChange={(e) => setFairForm({ ...fairForm, teamLeader: e.target.value })}
                    placeholder="যেমন: সানজিদা হক"
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শ্রেণি:</label>
                  <select
                    value={fairForm.class_name}
                    onChange={(e) => setFairForm({ ...fairForm, class_name: e.target.value })}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="১০ম">১০ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>শাখা / বিভাগ:</label>
                  <select
                    value={fairForm.section}
                    onChange={(e) => setFairForm({ ...fairForm, section: e.target.value })}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    {getSectionOptionsForClass(fairForm.class_name).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>রোল নং:</label>
                  <input
                    type="text"
                    value={fairForm.roll}
                    onChange={(e) => setFairForm({ ...fairForm, roll: e.target.value })}
                    placeholder="যেমন: ৩"
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>প্রস্তাবিত স্টল নং:</label>
                  <input
                    type="text"
                    value={fairForm.stallNo}
                    onChange={(e) => setFairForm({ ...fairForm, stallNo: e.target.value })}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>প্রকল্পের সংক্ষিপ্ত বিবরণ:</label>
                <textarea
                  rows={2}
                  value={fairForm.desc}
                  onChange={(e) => setFairForm({ ...fairForm, desc: e.target.value })}
                  placeholder="প্রকল্পের মূল কার্যপ্রণালী ও উপযোগিতা লিখুন..."
                  style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ➕ বিজ্ঞান মেলায় প্রকল্প নিবন্ধন করুন
              </button>
            </form>
          </div>

          {/* Science Fair Projects Directory */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#047857', fontWeight: 800 }}>
                🎪 বিজ্ঞান মেলা ২০২৬-এর নিবন্ধিত প্রকল্প তালিকা ({toBn(fairProjects.length)}টি স্টল):
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 প্রকল্প বা দলনেতা..."
                  value={fairSearch}
                  onChange={(e) => setFairSearch(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minWidth: '160px' }}
                />
                <select
                  value={fairFilterWing}
                  onChange={(e) => setFairFilterWing(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="all">সকল বিভাগ</option>
                  <option value="পদার্থবিজ্ঞান বিভাগ">পদার্থবিজ্ঞান</option>
                  <option value="রসায়ন বিভাগ">রসায়ন</option>
                  <option value="জীববিজ্ঞান বিভাগ">জীববিজ্ঞান</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {fairProjects
                .filter(p => fairFilterWing === 'all' || p.wing === fairFilterWing)
                .filter(p => !fairSearch.trim() || p.title.toLowerCase().includes(fairSearch.toLowerCase()) || p.teamLeader.toLowerCase().includes(fairSearch.toLowerCase()))
                .map((proj) => (
                  <div key={proj.id} style={{
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '14px',
                    background: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(4,120,87,0.04)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ background: '#047857', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                          {proj.stallNo}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditFairProject(proj)}
                            title="প্রকল্প এডিট করুন"
                            style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', color: '#047857' }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFairProject(proj.id)}
                            title="প্রকল্প মুছুন"
                            style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#b91c1c', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <b style={{ fontSize: '14.5px', color: '#0f172a', display: 'block', marginBottom: '3px' }}>
                        {proj.title}
                      </b>
                      <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700, marginBottom: '6px' }}>
                        {proj.category} • {proj.wing}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                        দলনেতা: <b>{proj.teamLeader}</b> ({proj.class} • {proj.section || '—'} • রোল: {toBn(proj.roll)})
                      </div>

                      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                        {proj.desc}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px dashed #bbf7d0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                        🏅 {proj.award}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 14: অর্জন ও ট্রফি গ্যালারি */}
      {/* ========================================================================= */}
      {sciTab === 'achievements' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 3px 12px rgba(4,120,87,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ফিচার ১৪
              </span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#047857' }}>
                🥇 অর্জন ও ট্রফি গ্যালারি (Achievements & Awards)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddNewAchievement}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 15px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                }}
              >
                <span>➕</span>
                <span>নতুন অর্জন যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={handlePrintAchievementsPad}
                style={{
                  background: '#f0fdf4',
                  color: '#047857',
                  border: '1.5px solid #86efac',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>
              জাতীয়, বিভাগীয়, জেলা ও উপজেলা বিজ্ঞান প্রতিযোগিতায় মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের গৌরবোজ্জ্বল সাফল্য:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 অর্জন বা ইভেন্ট..."
                value={achievementSearch}
                onChange={(e) => setAchievementSearch(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minWidth: '160px' }}
              />
              <select
                value={achievementFilterLevel}
                onChange={(e) => setAchievementFilterLevel(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="all">সকল পর্যায়</option>
                <option value="জাতীয় পর্যায়">জাতীয় পর্যায়</option>
                <option value="বিভাগীয় পর্যায়">বিভাগীয় পর্যায়</option>
                <option value="জেলা পর্যায়">জেলা পর্যায়</option>
                <option value="উপজেলা পর্যায়">উপজেলা পর্যায়</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
            {achievements
              .filter(a => achievementFilterLevel === 'all' || a.level === achievementFilterLevel)
              .filter(a => !achievementSearch.trim() || a.event.toLowerCase().includes(achievementSearch.toLowerCase()) || a.position.toLowerCase().includes(achievementSearch.toLowerCase()))
              .map((ach) => (
                <div key={ach.id} style={{
                  border: '1.5px solid #86efac',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#f0fdf4',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 10px rgba(4,120,87,0.06)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ background: '#047857', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                        {ach.year} • {ach.level}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEditAchievement(ach)}
                          title="অর্জন এডিট করুন"
                          style={{ background: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', color: '#047857' }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAchievement(ach.id)}
                          title="অর্জন মুছুন"
                          style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#b91c1c', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <b style={{ fontSize: '15px', color: '#047857', display: 'block', marginBottom: '4px' }}>
                      🏆 {ach.position}
                    </b>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#0f172a' }}>
                      {ach.event}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                      🔬 প্রকল্প: <b>{ach.project}</b>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '8px' }}>
                      দল: {ach.team}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                      {ach.note}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT COORDINATOR */}
      {/* ========================================================================= */}
      {editingCoordinator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ সমন্বয়কের তথ্য সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingCoordinator(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoordinatorEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষকের নাম:</label>
                <input
                  type="text"
                  required
                  value={coordEditForm.name}
                  onChange={e => setCoordEditForm({ ...coordEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>পদবি:</label>
                <input
                  type="text"
                  required
                  value={coordEditForm.designation}
                  onChange={e => setCoordEditForm({ ...coordEditForm, designation: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ক্লাবে অর্পিত দায়িত্ব:</label>
                <input
                  type="text"
                  required
                  value={coordEditForm.role}
                  onChange={e => setCoordEditForm({ ...coordEditForm, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={coordEditForm.phone}
                  onChange={e => setCoordEditForm({ ...coordEditForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCoordinator(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT EXECUTIVE POST */}
      {/* ========================================================================= */}
      {editingExecPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ পদাধিকারীর তথ্য সম্পাদনা ({execData.posts?.[editingExecPost]?.title})
              </h3>
              <button
                type="button"
                onClick={() => setEditingExecPost(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExecPost}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম: *</label>
                <input
                  type="text"
                  required
                  value={execEditForm.name}
                  onChange={e => setExecEditForm({ ...execEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি:</label>
                  <select
                    value={execEditForm.class}
                    onChange={e => {
                      const cls = e.target.value;
                      const isNineOrTen = cls === '৯ম' || cls === '১০ম';
                      setExecEditForm({
                        ...execEditForm,
                        class: cls,
                        section: isNineOrTen ? 'বিজ্ঞান' : 'শাখা ক'
                      });
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="১০ম">১০ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা/বিভাগ:</label>
                  <select
                    value={execEditForm.section}
                    onChange={e => setExecEditForm({ ...execEditForm, section: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    {getSectionOptionsForClass(execEditForm.class).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল:</label>
                  <input
                    type="text"
                    value={execEditForm.roll}
                    onChange={e => setExecEditForm({ ...execEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={execEditForm.phone}
                  onChange={e => setExecEditForm({ ...execEditForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExecPost(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT EXECUTIVE MEMBER */}
      {/* ========================================================================= */}
      {editingExecMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ কার্যনির্বাহী সদস্য তথ্য সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingExecMember(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শিক্ষার্থীর নাম: *</label>
                <input
                  type="text"
                  required
                  value={memberEditForm.name}
                  onChange={e => setMemberEditForm({ ...memberEditForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শ্রেণি:</label>
                  <select
                    value={memberEditForm.class}
                    onChange={e => {
                      const cls = e.target.value;
                      const isNineOrTen = cls === '৯ম' || cls === '১০ম';
                      setMemberEditForm({
                        ...memberEditForm,
                        class: cls,
                        section: isNineOrTen ? 'বিজ্ঞান' : ' শাখা ক'
                      });
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="১০ম">১০ম শ্রেণি</option>
                    <option value="৯ম">৯ম শ্রেণি</option>
                    <option value="৮ম">৮ম শ্রেণি</option>
                    <option value="৭ম">৭ম শ্রেণি</option>
                    <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>শাখা/বিভাগ:</label>
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>রোল:</label>
                  <input
                    type="text"
                    value={memberEditForm.roll}
                    onChange={e => setMemberEditForm({ ...memberEditForm, roll: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExecMember(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {editingDepartment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ বিজ্ঞান বিভাগ সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingDepartment(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDepartmentEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বিভাগের নাম: *</label>
                  <input
                    type="text"
                    required
                    value={deptEditForm.title}
                    onChange={e => setDeptEditForm({ ...deptEditForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ইংরেজি নাম:</label>
                  <input
                    type="text"
                    value={deptEditForm.titleEn}
                    onChange={e => setDeptEditForm({ ...deptEditForm, titleEn: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>দায়িত্বপ্রাপ্ত শিক্ষক: *</label>
                  <input
                    type="text"
                    required
                    value={deptEditForm.inCharge}
                    onChange={e => setDeptEditForm({ ...deptEditForm, inCharge: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>আইকন:</label>
                  <input
                    type="text"
                    value={deptEditForm.icon}
                    onChange={e => setDeptEditForm({ ...deptEditForm, icon: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বিভাগের বিবরণ ও মূল ক্ষেত্র:</label>
                <textarea
                  rows={2}
                  value={deptEditForm.summary}
                  onChange={e => setDeptEditForm({ ...deptEditForm, summary: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ল্যাব পরীক্ষা ও অ্যাক্টিভিটি (প্রতি লাইনে একটি):</label>
                <textarea
                  rows={3}
                  value={deptEditForm.experimentsText}
                  onChange={e => setDeptEditForm({ ...deptEditForm, experimentsText: e.target.value })}
                  placeholder="প্রতি লাইনে একটি করে পরীক্ষার নাম লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingDepartment(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT REGULAR ACTIVITY */}
      {/* ========================================================================= */}
      {editingActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ নিয়মিত কার্যক্রম সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivityEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>নং:</label>
                  <input
                    type="text"
                    value={activityEditForm.num}
                    onChange={e => setActivityEditForm({ ...activityEditForm, num: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কার্যক্রমের নাম: *</label>
                  <input
                    type="text"
                    required
                    value={activityEditForm.title}
                    onChange={e => setActivityEditForm({ ...activityEditForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ফোকাস ট্যাগ:</label>
                <input
                  type="text"
                  value={activityEditForm.focus}
                  onChange={e => setActivityEditForm({ ...activityEditForm, focus: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>সময়সূচি:</label>
                  <input
                    type="text"
                    value={activityEditForm.time}
                    onChange={e => setActivityEditForm({ ...activityEditForm, time: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ভেন্যু / স্থান:</label>
                  <input
                    type="text"
                    value={activityEditForm.venue}
                    onChange={e => setActivityEditForm({ ...activityEditForm, venue: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বিস্তারিত বিবরণ:</label>
                <textarea
                  rows={3}
                  value={activityEditForm.details}
                  onChange={e => setActivityEditForm({ ...activityEditForm, details: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT QUARTERLY ROADMAP */}
      {/* ========================================================================= */}
      {editingQuarter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ ত্রৈমাসিক রোডম্যাপ সম্পাদনা ({editingQuarter.quarter})
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuarter(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuarterEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কোয়ার্টারের নাম: *</label>
                <input
                  type="text"
                  required
                  value={quarterEditForm.quarter}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, quarter: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মূল থিম / শিরোনাম: *</label>
                <input
                  type="text"
                  required
                  value={quarterEditForm.title}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কর্মসূচিসমূহ (প্রতি লাইনে একটি):</label>
                <textarea
                  rows={4}
                  value={quarterEditForm.itemsText}
                  onChange={e => setQuarterEditForm({ ...quarterEditForm, itemsText: e.target.value })}
                  placeholder="প্রতি লাইনে একটি করে কর্মসূচি লিখুন..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingQuarter(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EDIT MONTHLY CALENDAR */}
      {/* ========================================================================= */}
      {editingMonth && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ মাসের কর্মসূচি সম্পাদনা ({editingMonth.month})
              </h3>
              <button
                type="button"
                onClick={() => setEditingMonth(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMonthEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মাস:</label>
                  <input
                    type="text"
                    required
                    value={monthEditForm.month}
                    onChange={e => setMonthEditForm({ ...monthEditForm, month: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>তারিখ:</label>
                  <input
                    type="text"
                    value={monthEditForm.date}
                    onChange={e => setMonthEditForm({ ...monthEditForm, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>কর্মসূচির শিরোনাম: *</label>
                <input
                  type="text"
                  required
                  value={monthEditForm.title}
                  onChange={e => setMonthEditForm({ ...monthEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>দায়িত্বপ্রাপ্ত সমন্বয়ক শিক্ষক:</label>
                <input
                  type="text"
                  value={monthEditForm.coordinator}
                  onChange={e => setMonthEditForm({ ...monthEditForm, coordinator: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingMonth(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: EDIT SELECTION RULE */}
      {/* ========================================================================= */}
      {editingSelectionRule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                📜 সদস্য নির্বাচনের মানদণ্ড সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingSelectionRule(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSelectionRuleEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>নং:</label>
                  <input
                    type="text"
                    value={selectionRuleEditForm.num}
                    onChange={e => setSelectionRuleEditForm({ ...selectionRuleEditForm, num: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মানদণ্ডের শিরোনাম: *</label>
                  <input
                    type="text"
                    required
                    value={selectionRuleEditForm.title}
                    onChange={e => setSelectionRuleEditForm({ ...selectionRuleEditForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বিস্তারিত বিবরণ ও নীতিমালা: *</label>
                <textarea
                  required
                  rows={4}
                  value={selectionRuleEditForm.text}
                  onChange={e => setSelectionRuleEditForm({ ...selectionRuleEditForm, text: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingSelectionRule(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: EDIT DISCIPLINE RULE */}
      {/* ========================================================================= */}
      {editingDisciplineRule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #dc2626'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#b91c1c', fontWeight: 900 }}>
                🛡️ শৃঙ্খলা ও নিরাপত্তাবিধি সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingDisciplineRule(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisciplineRuleEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>নং:</label>
                  <input
                    type="text"
                    value={disciplineRuleEditForm.num}
                    onChange={e => setDisciplineRuleEditForm({ ...disciplineRuleEditForm, num: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>নিয়মের শিরোনাম: *</label>
                  <input
                    type="text"
                    required
                    value={disciplineRuleEditForm.rule}
                    onChange={e => setDisciplineRuleEditForm({ ...disciplineRuleEditForm, rule: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বাধ্যতামূলক নির্দেশনা ও বিবরণ: *</label>
                <textarea
                  required
                  rows={4}
                  value={disciplineRuleEditForm.desc}
                  onChange={e => setDisciplineRuleEditForm({ ...disciplineRuleEditForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingDisciplineRule(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: EDIT SCIENCE FAIR PROJECT */}
      {/* ========================================================================= */}
      {editingFairProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ বিজ্ঞান মেলা প্রকল্প সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingFairProject(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFairProjectEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>প্রকল্পের নাম: *</label>
                <input
                  type="text"
                  required
                  value={fairEditForm.title}
                  onChange={e => setFairEditForm({ ...fairEditForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>উইং/বিভাগ:</label>
                  <select
                    value={fairEditForm.wing}
                    onChange={e => setFairEditForm({ ...fairEditForm, wing: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="পদার্থবিজ্ঞান বিভাগ">পদার্থবিজ্ঞান</option>
                    <option value="রসায়ন বিভাগ">রসায়ন</option>
                    <option value="জীববিজ্ঞান বিভাগ">জীববিজ্ঞান</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>স্টল নং:</label>
                  <input
                    type="text"
                    value={fairEditForm.stallNo}
                    onChange={e => setFairEditForm({ ...fairEditForm, stallNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>দলনেতা: *</label>
                  <input
                    type="text"
                    required
                    value={fairEditForm.teamLeader}
                    onChange={e => setFairEditForm({ ...fairEditForm, teamLeader: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>পুরস্কার / অর্জন:</label>
                  <input
                    type="text"
                    value={fairEditForm.award}
                    onChange={e => setFairEditForm({ ...fairEditForm, award: e.target.value })}
                    placeholder="যেমন: ১ম স্থান (চ্যাম্পিয়ন)"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>বিবরণ:</label>
                <textarea
                  rows={3}
                  value={fairEditForm.desc}
                  onChange={e => setFairEditForm({ ...fairEditForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingFairProject(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11: EDIT ACHIEVEMENT */}
      {/* ========================================================================= */}
      {editingAchievement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#047857', fontWeight: 900 }}>
                ✏️ অর্জন ও ট্রফি তথ্য সম্পাদনা
              </h3>
              <button
                type="button"
                onClick={() => setEditingAchievement(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAchievementEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>সাল:</label>
                  <input
                    type="text"
                    required
                    value={achEditForm.year}
                    onChange={e => setAchEditForm({ ...achEditForm, year: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>পর্যায়:</label>
                  <select
                    value={achEditForm.level}
                    onChange={e => setAchEditForm({ ...achEditForm, level: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="উপজেলা পর্যায়">উপজেলা পর্যায়</option>
                    <option value="জেলা পর্যায়">জেলা পর্যায়</option>
                    <option value="বিভাগীয় পর্যায়">বিভাগীয় পর্যায়</option>
                    <option value="জাতীয় পর্যায়">জাতীয় পর্যায়</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ইভেন্ট / প্রতিযোগিতার নাম: *</label>
                <input
                  type="text"
                  required
                  value={achEditForm.event}
                  onChange={e => setAchEditForm({ ...achEditForm, event: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>অর্জিত স্থান / পদক: *</label>
                  <input
                    type="text"
                    required
                    value={achEditForm.position}
                    onChange={e => setAchEditForm({ ...achEditForm, position: e.target.value })}
                    placeholder="যেমন: ১ম স্থান (সেরা উদ্ভাবক)"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>প্রকল্পের নাম:</label>
                  <input
                    type="text"
                    value={achEditForm.project}
                    onChange={e => setAchEditForm({ ...achEditForm, project: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>মন্তব্য / নোট:</label>
                <textarea
                  rows={2}
                  value={achEditForm.note}
                  onChange={e => setAchEditForm({ ...achEditForm, note: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAchievement(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 12: SUBMITTED RECEIPT MODAL */}
      {/* ========================================================================= */}
      {submittedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '40px', marginBottom: '4px' }}>🎉</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#047857', fontWeight: 900 }}>
                বিজ্ঞান ক্লাব সদস্য আবেদন সফলভাবে গৃহীত হয়েছে!
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                আপনার ট্র্যাকিং আইডি নিচে দেওয়া হলো, এটি সংরক্ষণ করুন:
              </p>
              <div style={{
                margin: '10px 0',
                padding: '8px 16px',
                background: '#dcfce7',
                border: '1.5px dashed #047857',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 900,
                color: '#166534',
                fontFamily: 'monospace'
              }}>
                {submittedReceipt.trackingId}
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div><b>শিক্ষার্থীর নাম:</b> {submittedReceipt.student_name}</div>
              <div><b>শ্রেণি ও শাখা:</b> {submittedReceipt.class_name} ({submittedReceipt.section || '—'}) • রোল: {toBn(submittedReceipt.roll_no)}</div>
              <div><b>পছন্দের উইং:</b> {submittedReceipt.wing_preference}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePrintMemberReceipt(submittedReceipt)}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে রসিদ প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmittedReceipt(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 13: SUBMISSION READER / VIEWER MODAL */}
      {/* ========================================================================= */}
      {readingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderTop: '5px solid #047857'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  {readingItem.type}
                </span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', color: '#047857', fontWeight: 900 }}>
                  {readingItem.title}
                </h3>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  উদ্ভাবক: <b>{readingItem.student_name}</b> ({readingItem.class_name} শ্রেণি • {readingItem.section || '—'} • রোল {toBn(readingItem.roll)})
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReadingItem(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              {readingItem.summary}
            </div>

            {readingItem.file_name && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <b>📁 সংযুক্ত ফাইল:</b> {readingItem.file_name} ({readingItem.file_size})
                </div>
                {readingItem.file_data && (
                  <a
                    href={readingItem.file_data}
                    download={readingItem.file_name}
                    style={{ background: '#047857', color: '#ffffff', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    ডাউনলোড ⬇️
                  </a>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handlePrintSubmission(readingItem)}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span>
                <span>বিদ্যালয়ের প্যাডে প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ScienceClubMasterSection;
