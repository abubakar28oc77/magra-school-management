// LibraryPanel.jsx - Comprehensive Library & Information Science Management
// for Magra Pals Union High School (EIIN: 114290)
// Designed for the responsible Librarian / Teacher of Library & Information Science

import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  LIBRARIAN_TEACHER,
  BOOK_CATEGORIES,
  SHELVES_LIST,
  ACQUISITION_SOURCES,
  SEED_BOOKS,
  SEED_LOANS,
  SEED_DAMAGED,
  toBn,
  formatDateBn,
  getOverdueDays
} from './libraryData';
import { requestApi } from './apiClient';
import { MOCK_STUDENTS } from './mockData';
import schoolLogo from '../public/school-logo.png';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';

const VALID_TABS = ['catalog', 'issue', 'overdue', 'reports', 'damaged'];

// Normalizes Bengali & English class identifiers for robust filtering
export const normClass = (c) => {
  if (c === null || c === undefined) return '';
  const bnMap = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  return String(c)
    .replace(/[০-৯]/g, d => bnMap[d] || d)
    .replace(/^(class\s*|শ্রেণি\s*)/i, '')
    .trim();
};

// Robust phone normalizer: handles Bengali numerals, trims prefixes, adds leading zero if missing
export const normalizePhoneNumber = (raw) => {
  if (raw === null || raw === undefined) return '';
  const bnMap = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  let s = String(raw).trim().replace(/[০-৯]/g, d => bnMap[d] || d);
  let digits = s.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }
  return digits;
};

// Dynamically resolves a student from the entered student database (magra_db_students / Admission Form)
export const resolveStudentFromRegistry = (loan, studentsList) => {
  if (!loan || !Array.isArray(studentsList) || studentsList.length === 0) return null;

  // 1. Match by student_uid or student_id or id
  const targetUid = String(loan.student_uid || loan.student_id || '').toLowerCase().trim();
  if (targetUid) {
    const found = studentsList.find(s => {
      const sUid = String(s.student_id || s.id || '').toLowerCase().trim();
      return sUid && sUid === targetUid;
    });
    if (found) return found;
  }

  // 2. Match by class and roll
  const loanCls = normClass(loan.class_name);
  const loanRoll = String(loan.roll_no || '').trim();
  if (loanCls && loanRoll) {
    const found = studentsList.find(s => {
      const sCls = normClass(s.class_name);
      const sRoll = String(s.roll_no || '').trim();
      return sCls === loanCls && sRoll === loanRoll;
    });
    if (found) return found;
  }

  // 3. Match by Bangla name
  if (loan.name_bn) {
    const cleanLoanName = loan.name_bn.trim().toLowerCase();
    const found = studentsList.find(s => {
      const sName = (s.name_bn || '').trim().toLowerCase();
      return sName && (sName === cleanLoanName || sName.includes(cleanLoanName) || cleanLoanName.includes(sName));
    });
    if (found) return found;
  }

  return null;
};


export function LibraryPanel({ sub, setSub, onNavigate }) {
  // Navigation tab: 'catalog' | 'issue' | 'overdue' | 'reports' | 'damaged'
  // Guarantee activeTab always matches one of the valid tabs (defaults to 'catalog')
  const [activeTab, setActiveTab] = useState(() => {
    return VALID_TABS.includes(sub) ? sub : 'catalog';
  });

  // Core Library Data States - Fallback to SEED data if localStorage is empty or null
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_db_library_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_BOOKS;
    } catch {
      return SEED_BOOKS;
    }
  });

  const [loans, setLoans] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_db_library_loans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_LOANS;
    } catch {
      return SEED_LOANS;
    }
  });

  const [damaged, setDamaged] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_db_library_damaged');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_DAMAGED;
    } catch {
      return SEED_DAMAGED;
    }
  });

  const [students, setStudents] = useState(() => {
    try {
      const raw = localStorage.getItem('magra_db_students');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return MOCK_STUDENTS || [];
  });
  const [msg, setMsg] = useState({ text: '', type: 'info' });

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('magra_db_library_books', JSON.stringify(books));
    } catch (e) {
      console.warn('Books save error:', e);
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('magra_db_library_loans', JSON.stringify(loans));
    } catch (e) {
      console.warn('Loans save error:', e);
    }
  }, [loans]);

  useEffect(() => {
    try {
      localStorage.setItem('magra_db_library_damaged', JSON.stringify(damaged));
    } catch (e) {
      console.warn('Damaged books save error:', e);
    }
  }, [damaged]);

  // Sync sub route if changed from sidebar or URL - always maintain a valid activeTab
  useEffect(() => {
    if (VALID_TABS.includes(sub)) {
      setActiveTab(sub);
    } else {
      setActiveTab('catalog');
    }
  }, [sub]);

  const switchTab = (tab) => {
    const valid = VALID_TABS.includes(tab) ? tab : 'catalog';
    setActiveTab(valid);
    if (setSub) setSub(valid);
  };

  // Refresh library & student dataset from storage / defaults
  const fetchLibraryData = () => {
    try {
      const b = localStorage.getItem('magra_db_library_books');
      setBooks(b ? JSON.parse(b) : SEED_BOOKS);
    } catch {
      setBooks(SEED_BOOKS);
    }
    try {
      const l = localStorage.getItem('magra_db_library_loans');
      setLoans(l ? JSON.parse(l) : SEED_LOANS);
    } catch {
      setLoans(SEED_LOANS);
    }
    try {
      const d = localStorage.getItem('magra_db_library_damaged');
      setDamaged(d ? JSON.parse(d) : SEED_DAMAGED);
    } catch {
      setDamaged(SEED_DAMAGED);
    }
    try {
      const raw = localStorage.getItem('magra_db_students');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setStudents(parsed);
        } else {
          setStudents(MOCK_STUDENTS || []);
        }
      } else {
        setStudents(MOCK_STUDENTS || []);
      }
    } catch {
      setStudents(MOCK_STUDENTS || []);
    }
    showNotification('লাইব্রেরি ও শিক্ষার্থী ডাটা সফলভাবে রিফ্রেশ করা হয়েছে।', 'success');
  };

  // Reset or reload default library dataset
  const handleResetLibraryData = () => {
    if (window.confirm('আপনি কি লাইব্রেরির সকল বই, ইস্যু ও রেজিস্টার ডাটা ডিফল্ট অবস্থায় রিলোড করতে চান?')) {
      try {
        localStorage.removeItem('magra_db_library_books');
        localStorage.removeItem('magra_db_library_loans');
        localStorage.removeItem('magra_db_library_damaged');
      } catch {}
      setBooks(SEED_BOOKS);
      setLoans(SEED_LOANS);
      setDamaged(SEED_DAMAGED);
      showNotification('লাইব্রেরির সম্পূর্ণ ডাটা সফলভাবে রিলোড হয়েছে।', 'success');
    }
  };

  // Helper to resolve student & contact info dynamically from magra_db_students (Admission Form database)
  const getLoanStudentInfo = (loan) => {
    if (!loan) return { student: null, phone: '', fatherName: '', studentUid: '', studentName: '', className: '', rollNo: '', address: '', isLinked: false };
    const st = resolveStudentFromRegistry(loan, students);
    const rawPhone = (st && (st.guardian_phone || st.father_mobile || st.emergency_phone || st.mother_mobile || st.phone)) || loan.guardian_phone || '';
    const norm = normalizePhoneNumber(rawPhone);
    const dummyPhones = ['01712000007', '01712000008', '01713000001', '01714000009', '01715000010', '01712000072', '01712000000'];
    const phone = dummyPhones.includes(norm) ? (st ? normalizePhoneNumber(st.guardian_phone || st.father_mobile) : '') : norm;
    const fatherName = (st && (st.father_name || st.guardian_name)) || loan.father_name || '';
    const studentUid = (st && (st.student_id || st.id)) || loan.student_uid || loan.student_id || '';
    const studentName = (st && st.name_bn) || loan.name_bn;
    const className = (st && st.class_name) || loan.class_name;
    const rollNo = (st && st.roll_no) || loan.roll_no;
    const address = (st && (st.address || st.current_village)) || '';
    const isLinked = Boolean(st);

    return {
      student: st,
      phone,
      fatherName,
      studentUid,
      studentName,
      className,
      rollNo,
      address,
      isLinked
    };
  };

  // Helper to load freshest student dataset directly from local storage
  const loadFreshStudentsFromStorage = () => {
    try {
      const raw = localStorage.getItem('magra_db_students');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
          return parsed;
        }
      }
    } catch {}
    const fallback = Array.isArray(MOCK_STUDENTS) ? MOCK_STUDENTS : [];
    setStudents(fallback);
    return fallback;
  };

  // Live Sync with Student Admission Form updates (storage & custom event)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e || e.key === 'magra_db_students' || e.type === 'magra_students_updated') {
        loadFreshStudentsFromStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('magra_students_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('magra_students_updated', handleStorageChange);
    };
  }, []);

  // Sync / heal all loans with real student registry (magra_db_students)
  const handleSyncLoansWithStudentRegistry = (customStudentList = null, showToast = true) => {
    const studentDb = customStudentList || (Array.isArray(students) && students.length ? students : loadFreshStudentsFromStorage());
    if (!Array.isArray(studentDb) || studentDb.length === 0) {
      if (showToast) showNotification('শিক্ষার্থী ডাটাবেজ পাওয়া যায়নি।', 'error');
      return;
    }

    let syncedCount = 0;
    const dummyPhones = ['01712000007', '01712000008', '01713000001', '01714000009', '01715000010', '01712000072', '01712000000', ''];

    const healedLoans = loans.map(l => {
      const matched = resolveStudentFromRegistry(l, studentDb);
      if (matched) {
        const cleanPhone = normalizePhoneNumber(
          matched.guardian_phone || matched.father_mobile || matched.emergency_phone || matched.mother_mobile || matched.phone
        );
        const father = matched.father_name || matched.guardian_name || l.father_name || '';
        const isDummy = dummyPhones.includes(normalizePhoneNumber(l.guardian_phone));

        if (cleanPhone || isDummy || !l.father_name) {
          syncedCount++;
          return {
            ...l,
            student_id: matched.id,
            student_uid: matched.student_id || matched.id,
            name_bn: matched.name_bn || l.name_bn,
            class_name: matched.class_name || l.class_name,
            roll_no: matched.roll_no || l.roll_no,
            father_name: father,
            guardian_phone: cleanPhone || l.guardian_phone
          };
        }
      }
      return l;
    });

    setLoans(healedLoans);
    try {
      localStorage.setItem('magra_db_library_loans', JSON.stringify(healedLoans));
    } catch {}

    if (showToast) {
      showNotification(`ভর্তি ফরম (Student Database) থেকে মোট ${toBn(syncedCount)} টি বই ইস্যু রেকর্ডের মোবাইল ও তথ্য সফলভাবে সিঙ্ক করা হয়েছে!`, 'success');
    }
  };

  // Load students on mount with priority given to magra_db_students
  useEffect(() => {
    async function fetchStudents() {
      // 1. Try local storage first since it has newly admitted students
      const localSt = loadFreshStudentsFromStorage();
      if (Array.isArray(localSt) && localSt.length > 50) {
        return;
      }
      // 2. Try API fallback
      try {
        const res = await requestApi('/students?status=active');
        if (Array.isArray(res) && res.length) {
          setStudents(res);
          return;
        }
      } catch (err) {
        console.warn('Student load fallback:', err);
      }
    }
    fetchStudents();
  }, []);

  // Auto-heal loans on initial mount if loans contain dummy phone numbers
  useEffect(() => {
    if (Array.isArray(students) && students.length > 0 && Array.isArray(loans) && loans.length > 0) {
      const dummyPhones = ['01712000007', '01712000008', '01713000001', '01714000009', '01715000010', '01712000072', '01712000000'];
      const hasDummy = loans.some(l => dummyPhones.includes(normalizePhoneNumber(l.guardian_phone)));
      if (hasDummy) {
        handleSyncLoansWithStudentRegistry(students, false);
      }
    }
  }, [students]);

  const showNotification = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'info' }), 4500);
  };

  // -------------------------------------------------------------
  // KPI Metrics Calculation
  // -------------------------------------------------------------
  const kpis = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (parseInt(b.quantity, 10) || 0), 0);
    const availableCopies = books.reduce((acc, b) => acc + (parseInt(b.available_quantity, 10) || 0), 0);
    const activeLoans = loans.filter(l => !l.returned_at);
    const issuedCount = activeLoans.length;

    // Overdue loans: return is null and today > due_at
    const overdueLoans = activeLoans.filter(l => getOverdueDays(l.due_at) > 0);
    const totalDamagedCopies = damaged.reduce((acc, d) => acc + (parseInt(d.quantity, 10) || 0), 0);

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      issuedCount,
      overdueCount: overdueLoans.length,
      overdueLoans,
      totalDamagedCopies
    };
  }, [books, loans, damaged]);

  // -------------------------------------------------------------
  // Modals States
  // -------------------------------------------------------------
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [stockAddModalBook, setStockAddModalBook] = useState(null);
  const [stockAddQty, setStockAddQty] = useState(1);
  const [writeOffModalBook, setWriteOffModalBook] = useState(null);
  const [writeOffQty, setWriteOffQty] = useState(1);
  const [writeOffReason, setWriteOffReason] = useState('পাতা ছেঁড়া ও অপাঠ্য');

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [returnModalLoan, setReturnModalLoan] = useState(null);
  const [returnCondition, setReturnCondition] = useState('ভালো');
  const [returnFine, setReturnFine] = useState(0);

  const [printDefaulterNotice, setPrintDefaulterNotice] = useState(null);
  const [printReceiptLoan, setPrintReceiptLoan] = useState(null);
  const [printCatalogMode, setPrintCatalogMode] = useState(false);
  const [printReportMode, setPrintReportMode] = useState(false);

  // Defaulter Notice Digital Messaging & SMS States
  const [smsModalLoan, setSmsModalLoan] = useState(null);
  const [smsCustomPhone, setSmsCustomPhone] = useState('');
  const [smsCustomText, setSmsCustomText] = useState('');
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);
  const [smsQrDataUrl, setSmsQrDataUrl] = useState('');
  const [smsDeliveryTab, setSmsDeliveryTab] = useState('qr'); // 'qr' (Mobile scan) | 'editor' (Text edit)
  const [smsGatewayConfig, setSmsGatewayConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('magra_sms_gateway_config');
      return saved ? JSON.parse(saved) : {
        provider: 'bulksmsbd', // 'bulksmsbd' | 'greenweb' | 'custom'
        apiKey: '',
        senderId: '',
        customUrl: '',
        isActive: false
      };
    } catch {
      return { provider: 'bulksmsbd', apiKey: '', senderId: '', customUrl: '', isActive: false };
    }
  });
  const [showSmsSettings, setShowSmsSettings] = useState(false);
  const [smsSendingLoading, setSmsSendingLoading] = useState(false);
  const [smsGatewayError, setSmsGatewayError] = useState('');
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState(null);

  // Generate Mobile-to-Mobile SMS QR Code whenever phone or text updates
  useEffect(() => {
    if (smsCustomPhone && smsCustomText) {
      const cleanPhone = String(smsCustomPhone).replace(/[^\d+]/g, '');
      const smsUri = `SMSTO:${cleanPhone}:${smsCustomText}`;
      QRCode.toDataURL(smsUri, {
        width: 200,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setSmsQrDataUrl(url))
        .catch(err => console.warn('QR Code generation error:', err));
    } else {
      setSmsQrDataUrl('');
    }
  }, [smsCustomPhone, smsCustomText]);

  // Issue & Return Register Checkbox Selection State
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);

  const handleToggleSelectLoan = (loanId) => {
    setSelectedLoanIds(prev =>
      prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };

  const handleToggleSelectAllLoans = () => {
    if (selectedLoanIds.length === loans.length) {
      setSelectedLoanIds([]);
    } else {
      setSelectedLoanIds(loans.map(l => l.id));
    }
  };

  // CSV Bulk Upload Modal States
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvParsedBooks, setCsvParsedBooks] = useState([]);
  const [csvError, setCsvError] = useState('');

  // -------------------------------------------------------------
  // Catalog Filtering & Sorting State
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [shelfFilter, setShelfFilter] = useState('all');
  const [sortBy, setSortBy] = useState('author_asc'); // 'author_asc' | 'title_asc' | 'acc_asc' | 'qty_desc'

  // Extract unique authors list
  const authorsList = useMemo(() => {
    const set = new Set();
    books.forEach(b => {
      if (b.author && b.author.trim()) set.add(b.author.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'bn'));
  }, [books]);

  // Filtered & Sorted Books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      if (authorFilter !== 'all' && b.author !== authorFilter) return false;
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (shelfFilter !== 'all' && b.shelf !== shelfFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (b.title || '').toLowerCase().includes(q);
        const matchAuthor = (b.author || '').toLowerCase().includes(q);
        const matchAcc = (b.accession_no || '').toLowerCase().includes(q);
        const matchCat = (b.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchAcc && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'author_asc') {
        const cmp = (a.author || '').localeCompare(b.author || '', 'bn');
        if (cmp !== 0) return cmp;
        return (a.title || '').localeCompare(b.title || '', 'bn');
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '', 'bn');
      }
      if (sortBy === 'acc_asc') {
        return (a.accession_no || '').localeCompare(b.accession_no || '', undefined, { numeric: true });
      }
      if (sortBy === 'qty_desc') {
        return (b.quantity || 0) - (a.quantity || 0);
      }
      return 0;
    });
  }, [books, authorFilter, categoryFilter, shelfFilter, searchQuery, sortBy]);

  // -------------------------------------------------------------
  // Add / Edit Book Form State
  // -------------------------------------------------------------
  const nextAccNo = useMemo(() => {
    const nums = books.map(b => {
      const m = String(b.accession_no || '').match(/\d+/g);
      return m ? parseInt(m[m.length - 1], 10) : 0;
    });
    const max = nums.length ? Math.max(...nums) : 0;
    return `MAG-BK-${String(max + 1).padStart(3, '0')}`;
  }, [books]);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    accession_no: '',
    category: 'উপন্যাস',
    publisher: '',
    shelf: 'আলমারি-১ (বাংলা সাহিত্য)',
    quantity: 5,
    source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
    price: '',
    remarks: ''
  });

  const openAddBookModal = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      accession_no: nextAccNo,
      category: 'উপন্যাস',
      publisher: '',
      shelf: 'আলমারি-১ (বাংলা সাহিত্য)',
      quantity: 5,
      source: 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
      price: '',
      remarks: ''
    });
    setShowAddBookModal(true);
  };

  const openEditBookModal = (b) => {
    setEditingBook(b);
    setBookForm({
      title: b.title || '',
      author: b.author || '',
      accession_no: b.accession_no || '',
      category: b.category || 'উপন্যাস',
      publisher: b.publisher || '',
      shelf: b.shelf || 'আলমারি-১ (বাংলা সাহিত্য)',
      quantity: b.quantity || 1,
      source: b.source || 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়',
      price: b.price || '',
      remarks: b.remarks || ''
    });
    setShowAddBookModal(true);
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    if (!bookForm.author.trim() || !bookForm.title.trim()) {
      showNotification('অনুগ্রহ করে লেখকের নাম এবং বইয়ের শিরোনাম সঠিকভাবে পূরণ করুন।', 'error');
      return;
    }

    const qty = Math.max(1, parseInt(bookForm.quantity, 10) || 1);

    if (editingBook) {
      // Update existing book
      const diff = qty - (parseInt(editingBook.quantity, 10) || 0);
      const newAvail = Math.max(0, (parseInt(editingBook.available_quantity, 10) || 0) + diff);

      setBooks(prev => prev.map(b => {
        if (b.id === editingBook.id) {
          return {
            ...b,
            ...bookForm,
            quantity: qty,
            available_quantity: newAvail
          };
        }
        return b;
      }));
      showNotification(`"${bookForm.title}" বইয়ের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।`, 'success');
    } else {
      // Create new book entry
      const newBook = {
        id: 'bk-' + Date.now(),
        ...bookForm,
        accession_no: bookForm.accession_no.trim() || nextAccNo,
        quantity: qty,
        available_quantity: qty
      };
      setBooks(prev => [newBook, ...prev]);
      showNotification(`নতুন বই "${newBook.title}" লেখকের নামানুসারে ক্যাটালগে সফলভাবে যুক্ত হয়েছে।`, 'success');
    }

    setShowAddBookModal(false);
  };

  const handleDeleteBook = (b) => {
    // Check if any active loan exists for this book
    const active = loans.filter(l => l.book_id === b.id && !l.returned_at);
    if (active.length > 0) {
      alert(`এই বইটির ${toBn(active.length)}টি কপি বর্তমানে শিক্ষার্থীদের কাছে ইস্যুকৃত অবস্থায় রয়েছে। ফেরত না নেওয়া পর্যন্ত বইটি মুছে ফেলা যাবে না।`);
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${b.title}" বইটি ক্যাটালগ থেকে মুছে ফেলতে চান?`)) {
      setBooks(prev => prev.filter(x => x.id !== b.id));
      showNotification(`"${b.title}" বইটি ক্যাটালগ থেকে মুছে ফেলা হয়েছে।`, 'info');
    }
  };

  // Add more copies to existing book
  const handleAddStock = (e) => {
    e.preventDefault();
    if (!stockAddModalBook) return;
    const addCount = Math.max(1, parseInt(stockAddQty, 10) || 1);

    setBooks(prev => prev.map(b => {
      if (b.id === stockAddModalBook.id) {
        return {
          ...b,
          quantity: (parseInt(b.quantity, 10) || 0) + addCount,
          available_quantity: (parseInt(b.available_quantity, 10) || 0) + addCount
        };
      }
      return b;
    }));

    showNotification(`"${stockAddModalBook.title}" বইটিতে সফলভাবে আরও ${toBn(addCount)}টি কপি যুক্ত হয়েছে।`, 'success');
    setStockAddModalBook(null);
    setStockAddQty(1);
  };

  // Write off damaged / lost copies
  const handleWriteOffDamaged = (e) => {
    e.preventDefault();
    if (!writeOffModalBook) return;
    const dmgCount = Math.max(1, parseInt(writeOffQty, 10) || 1);

    if (dmgCount > (writeOffModalBook.available_quantity || 0)) {
      alert(`স্টকে বর্তমানে উপলব্ধ কপির চেয়ে বেশি সংখ্যা বাদ দেওয়া যাবে না। উপলব্ধ: ${toBn(writeOffModalBook.available_quantity)} টি`);
      return;
    }

    // Deduct from book stock
    setBooks(prev => prev.map(b => {
      if (b.id === writeOffModalBook.id) {
        return {
          ...b,
          quantity: Math.max(0, (parseInt(b.quantity, 10) || 0) - dmgCount),
          available_quantity: Math.max(0, (parseInt(b.available_quantity, 10) || 0) - dmgCount)
        };
      }
      return b;
    }));

    // Record in damaged audit register
    const newDamagedRecord = {
      id: 'dmg-' + Date.now(),
      book_id: writeOffModalBook.id,
      accession_no: writeOffModalBook.accession_no,
      title: writeOffModalBook.title,
      author: writeOffModalBook.author,
      quantity: dmgCount,
      damaged_at: new Date().toISOString().slice(0, 10),
      reason: writeOffReason,
      decision: 'ব্যবহার অনুপযোগী হিসেবে স্টক থেকে বাদ ও অডিটভুক্ত',
      authorized_by: `${LIBRARIAN_TEACHER.name_bn} (${LIBRARIAN_TEACHER.designation})`,
      head_approval: 'অনুমোদিত'
    };

    setDamaged(prev => [newDamagedRecord, ...prev]);
    showNotification(`"${writeOffModalBook.title}" বইয়ের ${toBn(dmgCount)}টি নষ্ট/বাতিল কপি সফলভাবে বাদ দেওয়া হয়েছে এবং রেজিস্টারভুক্ত হয়েছে।`, 'success');
    setWriteOffModalBook(null);
  };

  // Restore damaged book back to stock
  const handleRestoreDamaged = (dmgItem) => {
    if (window.confirm(`আপনি কি "${dmgItem.title}" বইটির ${toBn(dmgItem.quantity)}টি কপি মেরামত/পুনরুদ্ধার সাপেক্ষে পুনরায় সক্রিয় স্টকে যুক্ত করতে চান?`)) {
      setBooks(prev => prev.map(b => {
        if (b.id === dmgItem.book_id || b.accession_no === dmgItem.accession_no) {
          return {
            ...b,
            quantity: (parseInt(b.quantity, 10) || 0) + (parseInt(dmgItem.quantity, 10) || 1),
            available_quantity: (parseInt(b.available_quantity, 10) || 0) + (parseInt(dmgItem.quantity, 10) || 1)
          };
        }
        return b;
      }));
      setDamaged(prev => prev.filter(d => d.id !== dmgItem.id));
      showNotification(`"${dmgItem.title}" বইটি পুনরায় সক্রিয় স্টকে যুক্ত হয়েছে।`, 'success');
    }
  };

  // -------------------------------------------------------------
  // Issue & Circulation State & Helpers
  // -------------------------------------------------------------
  const [issueFilterClass, setIssueFilterClass] = useState('all');
  const [issueFilterStudentSearch, setIssueFilterStudentSearch] = useState('');
  const [issueForm, setIssueForm] = useState({
    student_id: '',
    guardian_phone: '',
    father_name: '',
    book_id: '',
    issued_at: new Date().toISOString().slice(0, 10),
    duration_days: '7',
    due_at: '',
    remarks: 'নিয়মিত লাইব্রেরি বইপড়া'
  });

  // Calculate default due date
  useEffect(() => {
    const days = parseInt(issueForm.duration_days, 10) || 7;
    const d = new Date(issueForm.issued_at || new Date());
    d.setDate(d.getDate() + days);
    setIssueForm(prev => ({ ...prev, due_at: d.toISOString().slice(0, 10) }));
  }, [issueForm.issued_at, issueForm.duration_days]);

  // Automatically populate guardian mobile & father's name directly from student's admission record
  useEffect(() => {
    if (issueForm.student_id) {
      const st = students.find(s => String(s.id) === String(issueForm.student_id) || String(s.student_id) === String(issueForm.student_id));
      if (st) {
        const ph = normalizePhoneNumber(st.guardian_phone || st.father_mobile || st.emergency_phone || st.mother_mobile || st.phone || '');
        setIssueForm(prev => ({
          ...prev,
          guardian_phone: ph,
          father_name: st.father_name || st.guardian_name || ''
        }));
      }
    }
  }, [issueForm.student_id, students]);

  // Filter students for picker directly from magra_db_students database
  const filteredStudentsForIssue = useMemo(() => {
    return students.filter(s => {
      if (issueFilterClass !== 'all' && normClass(s.class_name) !== normClass(issueFilterClass)) return false;
      if (issueFilterStudentSearch.trim()) {
        const q = issueFilterStudentSearch.toLowerCase().trim();
        const matchName = (s.name_bn || '').toLowerCase().includes(q) || (s.name_en || '').toLowerCase().includes(q);
        const matchRoll = String(s.roll_no || '').includes(q);
        const matchId = (s.student_id || s.id || '').toLowerCase().includes(q);
        const matchPhone = String(s.guardian_phone || s.father_mobile || '').includes(q);
        if (!matchName && !matchRoll && !matchId && !matchPhone) return false;
      }
      return true;
    }).slice(0, 100);
  }, [students, issueFilterClass, issueFilterStudentSearch]);

  // Selected student object & their active overdue warning
  const selectedStudentObj = useMemo(() => {
    return students.find(s => String(s.id) === String(issueForm.student_id) || String(s.student_id) === String(issueForm.student_id));
  }, [students, issueForm.student_id]);

  const studentOutstandingLoans = useMemo(() => {
    if (!issueForm.student_id) return [];
    return loans.filter(l => (l.student_id === issueForm.student_id || l.student_uid === issueForm.student_id) && !l.returned_at);
  }, [loans, issueForm.student_id]);

  const openIssueModal = (preselectedBook = null) => {
    setIssueForm({
      student_id: '',
      guardian_phone: '',
      father_name: '',
      book_id: preselectedBook ? preselectedBook.id : '',
      issued_at: new Date().toISOString().slice(0, 10),
      duration_days: '7',
      due_at: '',
      remarks: 'নিয়মিত লাইব্রেরি বইপড়া'
    });
    setShowIssueModal(true);
  };

  const handleIssueBookSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.student_id) {
      alert('অনুগ্রহ করে শিক্ষার্থীদের তালিকা থেকে একজন শিক্ষার্থী নির্বাচন করুন।');
      return;
    }
    if (!issueForm.book_id) {
      alert('অনুগ্রহ করে ইস্যু করার জন্য একটি বই নির্বাচন করুন।');
      return;
    }

    const targetBook = books.find(b => b.id === issueForm.book_id);
    if (!targetBook || (targetBook.available_quantity || 0) <= 0) {
      alert('দুঃখিত, এই বইটির কোনো কপি বর্তমানে স্টকে উপলব্ধ নেই।');
      return;
    }

    const st = selectedStudentObj || { name_bn: 'শিক্ষার্থী', class_name: '—', roll_no: '—', id: issueForm.student_id };
    const confirmedPhone = normalizePhoneNumber(issueForm.guardian_phone || st.guardian_phone || st.father_mobile || '');
    const fatherName = issueForm.father_name || st.father_name || st.guardian_name || '';

    const newLoan = {
      id: 'loan-' + Date.now(),
      book_id: targetBook.id,
      book_title: targetBook.title,
      author: targetBook.author,
      accession_no: targetBook.accession_no,
      student_id: st.id,
      student_uid: st.student_id || st.id,
      name_bn: st.name_bn,
      father_name: fatherName,
      class_name: st.class_name,
      roll_no: st.roll_no,
      guardian_phone: confirmedPhone,
      issued_at: issueForm.issued_at,
      due_at: issueForm.due_at,
      returned_at: null,
      return_condition: null,
      fine: 0,
      status: 'active',
      remarks: issueForm.remarks || 'ইস্যুকৃত'
    };

    // If phone was confirmed or edited, sync it back into magra_db_students database
    if (confirmedPhone && st) {
      try {
        const raw = localStorage.getItem('magra_db_students');
        if (raw) {
          const list = JSON.parse(raw);
          const updatedList = list.map(item => {
            if (item.id === st.id || item.student_id === st.student_id) {
              return { ...item, guardian_phone: confirmedPhone, father_mobile: item.father_mobile || confirmedPhone };
            }
            return item;
          });
          localStorage.setItem('magra_db_students', JSON.stringify(updatedList));
          setStudents(updatedList);
        }
      } catch (err) {
        console.warn('Could not sync updated phone back to student db:', err);
      }
    }

    // Deduct 1 from available quantity
    setBooks(prev => prev.map(b => {
      if (b.id === targetBook.id) {
        return {
          ...b,
          available_quantity: Math.max(0, (parseInt(b.available_quantity, 10) || 0) - 1)
        };
      }
      return b;
    }));

    setLoans(prev => [newLoan, ...prev]);
    showNotification(`"${targetBook.title}" বইটি শিক্ষার্থী ${st.name_bn} (রোল ${toBn(st.roll_no)}) কে সফলভাবে ইস্যু করা হয়েছে।`, 'success');
    setShowIssueModal(false);

    // Offer to print receipt
    setPrintReceiptLoan(newLoan);
  };

  // Return book execution
  const openReturnModal = (loanItem) => {
    setReturnModalLoan(loanItem);
    const overdue = getOverdueDays(loanItem.due_at);
    setReturnCondition('ভালো');
    setReturnFine(overdue > 0 ? overdue * 2 : 0); // 2 taka per day optional overdue fine
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnModalLoan) return;

    const returnDate = new Date().toISOString().slice(0, 10);
    const isSevereDamage = returnCondition === 'নষ্ট / ছেঁড়া' || returnCondition === 'হারিয়ে গেছে';

    // Update loan record
    setLoans(prev => prev.map(l => {
      if (l.id === returnModalLoan.id) {
        return {
          ...l,
          returned_at: returnDate,
          return_condition: returnCondition,
          fine: returnFine,
          status: 'returned',
          remarks: `ফেরত: ${returnCondition}${returnFine > 0 ? ` (জরিমানা: ৳${toBn(returnFine)})` : ''}`
        };
      }
      return l;
    }));

    // If condition is fine or minor, return to available shelf
    // If severe damage or lost, decrement total quantity and add to damaged register
    if (!isSevereDamage) {
      setBooks(prev => prev.map(b => {
        if (b.id === returnModalLoan.book_id) {
          return {
            ...b,
            available_quantity: Math.min(b.quantity, (parseInt(b.available_quantity, 10) || 0) + 1)
          };
        }
        return b;
      }));
      showNotification(`"${returnModalLoan.book_title}" বইটি সফলভাবে লাইব্রেরিতে জমা নেওয়া হয়েছে।`, 'success');
    } else {
      // Record damage & deduct total quantity
      setBooks(prev => prev.map(b => {
        if (b.id === returnModalLoan.book_id) {
          return {
            ...b,
            quantity: Math.max(0, (parseInt(b.quantity, 10) || 0) - 1)
          };
        }
        return b;
      }));

      const newDamagedRecord = {
        id: 'dmg-' + Date.now(),
        book_id: returnModalLoan.book_id,
        accession_no: returnModalLoan.accession_no,
        title: returnModalLoan.book_title,
        author: returnModalLoan.author,
        quantity: 1,
        damaged_at: returnDate,
        reason: `শিক্ষার্থী (${returnModalLoan.name_bn}, শ্রেণি ${returnModalLoan.class_name}, রোল ${returnModalLoan.roll_no}) জমাদানের সময় বই ${returnCondition} পাওয়া গেছে`,
        decision: 'নষ্ট রেজিস্টারভুক্ত ও জরিমানা সাপেক্ষে নিষ্পত্তিকৃত',
        authorized_by: `${LIBRARIAN_TEACHER.name_bn} (${LIBRARIAN_TEACHER.designation})`,
        head_approval: 'অনুমোদিত'
      };
      setDamaged(prev => [newDamagedRecord, ...prev]);
      showNotification(`"${returnModalLoan.book_title}" বইটি জমা নেওয়া হয়েছে এবং ক্ষতির কারণে নষ্ট রেজিস্টারভুক্ত হয়েছে।`, 'warning');
    }

    setReturnModalLoan(null);
  };

  // -------------------------------------------------------------
  // Overdue Filter State
  // -------------------------------------------------------------
  const [overdueFilterDays, setOverdueFilterDays] = useState('all'); // 'all' | 'week' (7+ days) | 'month' (30+ days)
  const [overdueClassFilter, setOverdueClassFilter] = useState('all');

  const filteredOverdueLoans = useMemo(() => {
    return loans.filter(l => {
      if (l.returned_at) return false;
      const days = getOverdueDays(l.due_at);
      if (days <= 0) return false;
      if (overdueFilterDays === 'week' && days < 7) return false;
      if (overdueClassFilter !== 'all' && normClass(l.class_name) !== normClass(overdueClassFilter)) return false;
      return true;
    }).sort((a, b) => getOverdueDays(b.due_at) - getOverdueDays(a.due_at));
  }, [loans, overdueFilterDays, overdueClassFilter]);

  // -------------------------------------------------------------
  // Reports State (Weekly / Monthly / Custom)
  // -------------------------------------------------------------
  const [reportType, setReportType] = useState('monthly'); // 'weekly' | 'monthly' | 'custom'
  const [reportMonth, setReportMonth] = useState('2026-10');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');

  const reportData = useMemo(() => {
    let startStr = '';
    let endStr = '';

    if (reportType === 'weekly') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startStr = oneWeekAgo.toISOString().slice(0, 10);
      endStr = now.toISOString().slice(0, 10);
    } else if (reportType === 'monthly') {
      startStr = `${reportMonth}-01`;
      endStr = `${reportMonth}-31`;
    } else {
      startStr = customStartDate;
      endStr = customEndDate;
    }

    const issuedInPeriod = loans.filter(l => l.issued_at >= startStr && l.issued_at <= endStr);
    const returnedInPeriod = loans.filter(l => l.returned_at && l.returned_at >= startStr && l.returned_at <= endStr);
    const overdueInPeriod = loans.filter(l => !l.returned_at && getOverdueDays(l.due_at) > 0);
    const damagedInPeriod = damaged.filter(d => d.damaged_at >= startStr && d.damaged_at <= endStr);

    // Top Readers calculation (Expert Recommendation)
    const readerMap = {};
    loans.forEach(l => {
      const key = l.student_uid || `${l.name_bn}_${l.class_name}_${l.roll_no}`;
      if (!readerMap[key]) {
        readerMap[key] = {
          name: l.name_bn,
          class_name: l.class_name,
          roll: l.roll_no,
          count: 0
        };
      }
      readerMap[key].count += 1;
    });
    const topReaders = Object.values(readerMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Top Borrowed Books calculation
    const bookBorrowMap = {};
    loans.forEach(l => {
      const key = l.book_title || 'অজ্ঞাত বই';
      if (!bookBorrowMap[key]) {
        bookBorrowMap[key] = {
          title: l.book_title,
          author: l.author,
          count: 0
        };
      }
      bookBorrowMap[key].count += 1;
    });
    const topBooks = Object.values(bookBorrowMap).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      startStr,
      endStr,
      issuedInPeriod,
      returnedInPeriod,
      overdueInPeriod,
      damagedInPeriod,
      topReaders,
      topBooks
    };
  }, [reportType, reportMonth, customStartDate, customEndDate, loans, damaged]);

  // -------------------------------------------------------------
  // Print Handlers (Robust Multi-Page Print Engine)
  // -------------------------------------------------------------
  const triggerBrowserPrint = () => {
    window.print();
  };

  const handlePrintCatalog = () => {
    const printWin = window.open('', '_blank', 'width=1100,height=850');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    const todayDateBn = formatDateBn(new Date().toISOString().slice(0, 10));
    const totalTitlesCount = filteredBooks.length;
    const totalCopiesCount = filteredBooks.reduce((acc, b) => acc + (parseInt(b.quantity, 10) || 0), 0);
    const totalAvailableCount = filteredBooks.reduce((acc, b) => acc + (parseInt(b.available_quantity, 10) || 0), 0);

    const rowsHtml = filteredBooks.map((b, idx) => `
      <tr style="page-break-inside: avoid; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="border: 1px solid #94a3b8; padding: 5px 6px; text-align: center; font-weight: 700;">${toBn(idx + 1)}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 8px; font-weight: 800; color: #0284c7; white-space: nowrap;">${b.accession_no || ''}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 8px; font-weight: 700; color: #0f172a;">${b.author || ''}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 8px; font-weight: 700; color: #1e293b;">${b.title || ''}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 8px; color: #334155;">${b.category || ''}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 8px; color: #475569; font-size: 11px;">${b.shelf || ''}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 6px; text-align: center; font-weight: 800; color: #0f172a;">${toBn(b.quantity || 0)}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px 6px; text-align: center; font-weight: 800; color: #047857;">${toBn(b.available_quantity || 0)}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8" />
        <title>কেন্দ্রীয় লাইব্রেরি ও স্টক রেজিস্টার - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Nikosh', Arial, sans-serif;
            margin: 0;
            padding: 10px 14px;
            color: #0f172a;
            background: #fff;
            font-size: 11.5px;
            line-height: 1.3;
          }
          .no-print-toolbar {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 16px;
            margin-bottom: 14px;
            display: flex;
            justifyContent: space-between;
            align-items: center;
          }
          .btn-print {
            background: #059669;
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .btn-close {
            background: #fff;
            color: #475569;
            border: 1px solid #cbd5e1;
            padding: 7px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }
          .catalog-banner-title {
            text-align: center;
            margin: 8px 0 10px 0;
          }
          .catalog-badge {
            display: inline-block;
            background: #f8fafc;
            border: 1.5px solid #064e3b;
            color: #064e3b;
            padding: 4px 18px;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.3px;
          }
          .meta-info-row {
            display: flex;
            justifyContent: space-between;
            align-items: center;
            font-size: 11px;
            color: #475569;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            page-break-inside: auto;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th {
            background: #f1f5f9;
            border: 1px solid #64748b;
            padding: 6px 8px;
            font-weight: 800;
            color: #0f172a;
            text-align: center;
          }
          .signatures-box {
            display: flex;
            justifyContent: space-between;
            margin-top: 45px;
            padding-top: 10px;
            page-break-inside: avoid;
          }
          .sig-card {
            text-align: center;
            width: 220px;
            border-top: 1.5px solid #000;
            padding-top: 5px;
          }
          .sig-card p {
            margin: 2px 0 0 0;
          }
          @media print {
            .no-print-toolbar {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-toolbar">
          <div>
            <span style="font-size: 14px; font-weight: 800; color: #064e3b;">📚 কেন্দ্রীয় লাইব্রেরি ও স্টক রেজিস্টার (প্রিন্ট ভিউ)</span>
            <span style="margin-left: 12px; color: #64748b; font-size: 12px; font-weight: 600;">(মোট বই: ${toBn(totalTitlesCount)} টি • সর্বমোট কপি: ${toBn(totalCopiesCount)} টি)</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">🖨️ প্রিন্ট করুন / Save as PDF</button>
            <button class="btn-close" onclick="window.close()">✕ বন্ধ করুন</button>
          </div>
        </div>

        ${SCHOOL_PAD_HEADER_HTML}

        <div class="catalog-banner-title">
          <span class="catalog-badge">কেন্দ্রীয় লাইব্রেরি ও স্টক রেজিস্টার (লেখকের নামানুসারে)</span>
        </div>

        <div class="meta-info-row">
          <div>প্রিন্টের তারিখ: <b>${todayDateBn}</b></div>
          <div>মোট বইয়ের টাইটেল: <b>${toBn(totalTitlesCount)} টি</b> | লাইব্রেরি সর্বমোট কপি: <b>${toBn(totalCopiesCount)} কপি</b> | শেলফে প্রস্তুত: <b>${toBn(totalAvailableCount)} কপি</b></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 32px;">ক্র.</th>
              <th style="width: 82px;">কোড নং</th>
              <th style="width: 140px; text-align: left;">লেখকের নাম</th>
              <th style="text-align: left;">বইয়ের নাম</th>
              <th style="width: 110px; text-align: left;">ক্যাটাগরি</th>
              <th style="width: 130px; text-align: left;">আলমারি/সেলফ</th>
              <th style="width: 44px;">মোট</th>
              <th style="width: 48px;">উপলব্ধ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <table style="width: 100% !important; border: none !important; margin-top: 55px !important; page-break-inside: avoid !important;">
          <tr style="border: none !important; background: transparent !important;">
            <td style="width: 250px; text-align: left; border: none !important; padding: 0; vertical-align: top;">
              <div style="border-top: 1.5px solid #000; padding-top: 5px; width: 220px; text-align: center;">
                <p style="margin: 0; font-weight: 800; font-size: 12px; color: #0f172a;">${LIBRARIAN_TEACHER.name_bn}</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #475569;">গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</p>
                <p style="margin: 1px 0 0; font-size: 10px; color: #64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
              </div>
            </td>
            <td style="border: none !important; padding: 0;"></td>
            <td style="width: 250px; text-align: right; border: none !important; padding: 0; vertical-align: top;">
              <div style="border-top: 1.5px solid #000; padding-top: 5px; width: 220px; margin-left: auto; text-align: center;">
                <p style="margin: 0; font-weight: 800; font-size: 12px; color: #0f172a;">প্রধান শিক্ষক</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
                <p style="margin: 1px 0 0; font-size: 10px; color: #64748b;">কালিহাতি, টাঙ্গাইল</p>
              </div>
            </td>
          </tr>
        </table>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const handlePrintReport = () => {
    const printWin = window.open('', '_blank', 'width=1100,height=850');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    const reportTitleText = reportType === 'weekly' ? 'সাপ্তাহিক লাইব্রেরি সঞ্চালন ও অডিট রিপোর্ট' : 'মাসিক লাইব্রেরি সঞ্চালন ও অডিট রিপোর্ট';

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8" />
        <title>${reportTitleText} - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          ${SCHOOL_PAD_STYLES}
          @page { size: A4 portrait; margin: 10mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Nikosh', Arial, sans-serif; margin: 0; padding: 10px 14px; font-size: 11.5px; }
          .no-print-toolbar { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
          .btn-print { background: #0369a1; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; }
          .btn-close { background: #fff; color: #475569; border: 1px solid #cbd5e1; padding: 7px 14px; border-radius: 6px; cursor: pointer; }
          table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 16px; }
          th { background: #f8fafc; border: 1px solid #94a3b8; padding: 6px 10px; font-weight: 700; }
          td { border: 1px solid #cbd5e1; padding: 6px 10px; }
          .signatures-box { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 10px; page-break-inside: avoid; }
          .sig-card { text-align: center; width: 220px; border-top: 1.5px solid #000; padding-top: 5px; }
          @media print { .no-print-toolbar { display: none !important; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print-toolbar">
          <span style="font-weight: 700; color: #0369a1;">📊 ${reportTitleText}</span>
          <div>
            <button class="btn-print" onclick="window.print()">🖨️ প্রিন্ট করুন</button>
            <button class="btn-close" onclick="window.close()" style="margin-left: 8px;">✕ বন্ধ করুন</button>
          </div>
        </div>

        ${SCHOOL_PAD_HEADER_HTML}

        <div style="text-align: center; margin: 8px 0 12px 0;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #0369a1;">${reportTitleText}</h2>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            সময়কাল: ${formatDateBn(reportData.startStr)} হতে ${formatDateBn(reportData.endStr)} পর্যন্ত
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">অডিট সূচক / বিবরণ</th>
              <th style="width: 140px; text-align: center;">পরিমাণ / সংখ্যা</th>
              <th style="text-align: left;">মন্তব্য ও সুপারিশ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>মোট ইস্যুকৃত বই সংখ্যা</td>
              <td style="text-align: center; font-weight: 700; color: #0369a1;">${toBn(reportData.issuedInPeriod.length)} টি</td>
              <td>নির্ধারিত মেয়াদে শিক্ষার্থীদের বিতরণ</td>
            </tr>
            <tr>
              <td>মোট জমাপ্রাপ্ত বই সংখ্যা</td>
              <td style="text-align: center; font-weight: 700; color: #15803d;">${toBn(reportData.returnedInPeriod.length)} টি</td>
              <td>স্টকে ফেরত গৃহীত</td>
            </tr>
            <tr>
              <td>অনিষ্পন্ন বকেয়া বই</td>
              <td style="text-align: center; font-weight: 700; color: #dc2626;">${toBn(reportData.overdueInPeriod.length)} টি</td>
              <td>তাগাদা নোটিশ প্রদান করা হয়েছে</td>
            </tr>
            <tr>
              <td>নষ্ট ও বাতিল বই</td>
              <td style="text-align: center; font-weight: 700; color: #b91c1c;">${toBn(reportData.damagedInPeriod.length)} টি</td>
              <td>ক্ষতিগ্রস্ত বিধায় বাতিল রেজিস্টারভুক্ত</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
            🏆 পাঠাভ্যাস ও সেরা পাঠক মূল্যায়ন:
          </h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${reportData.topReaders.map(r => `
              <div style="border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 11px; background: #f8fafc;">
                <b>${r.name}</b> (${toBn(r.class_name)}ম শ্রেণি, রোল ${toBn(r.roll)}) — ${toBn(r.count)}টি বই
              </div>
            `).join('')}
          </div>
        </div>

        <table style="width: 100% !important; border: none !important; margin-top: 55px !important; page-break-inside: avoid !important;">
          <tr style="border: none !important; background: transparent !important;">
            <td style="width: 250px; text-align: left; border: none !important; padding: 0; vertical-align: top;">
              <div style="border-top: 1.5px solid #000; padding-top: 5px; width: 220px; text-align: center;">
                <p style="margin: 0; font-weight: 800; font-size: 12px; color: #0f172a;">${LIBRARIAN_TEACHER.name_bn}</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #475569;">গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</p>
                <p style="margin: 1px 0 0; font-size: 10px; color: #64748b;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
              </div>
            </td>
            <td style="border: none !important; padding: 0;"></td>
            <td style="width: 250px; text-align: right; border: none !important; padding: 0; vertical-align: top;">
              <div style="border-top: 1.5px solid #000; padding-top: 5px; width: 220px; margin-left: auto; text-align: center;">
                <p style="margin: 0; font-weight: 800; font-size: 12px; color: #0f172a;">প্রধান শিক্ষক</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #475569;">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
                <p style="margin: 1px 0 0; font-size: 10px; color: #64748b;">কালিহাতি, টাঙ্গাইল</p>
              </div>
            </td>
          </tr>
        </table>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // -------------------------------------------------------------
  // A4 Slip Print Engine: 2 Slips or 4 Slips per A4 Page
  // -------------------------------------------------------------
  const handlePrintSlips = (loanList, perPage = 2, customCopyLabels = null) => {
    if (!loanList || loanList.length === 0) {
      alert('প্রিন্ট করার জন্য কোনো স্লিপ পাওয়া যায়নি। অনুগ্রহ করে টিক চিহ্নের মাধ্যমে অন্তত একটি রেকর্ড নির্বাচন করুন।');
      return;
    }

    const printWin = window.open('', '_blank', 'width=1000,height=850');
    if (!printWin) {
      alert('পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
      return;
    }

    // Chunk loanList by perPage
    const pages = [];
    for (let i = 0; i < loanList.length; i += perPage) {
      pages.push(loanList.slice(i, i + perPage));
    }

    const renderSlip = (l, copyLabel = '', isQuarter = false) => {
      const overdue = getOverdueDays(l.due_at);
      const isReturned = Boolean(l.returned_at);
      const info = getLoanStudentInfo(l);

      if (isQuarter) {
        // Quarter A4 slip (4 slips per A4 page in 2x2 grid)
        return `
          <div class="slip-card-quarter">
            <div class="slip-header-q">
              <div style="display: flex; align-items: center; gap: 6px;">
                <img src="${schoolLogo}" style="width: 28px; height: 28px; object-fit: contain;" alt="Logo" />
                <div>
                  <div class="school-name-q">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
                  <div class="school-sub-q">লাইব্রেরি ইস্যু স্লিপ • EIIN: 114290</div>
                </div>
              </div>
              ${copyLabel ? `<span class="copy-badge-q">${copyLabel}</span>` : `<span class="code-badge-q">${l.accession_no || ''}</span>`}
            </div>

            <div class="slip-body-q">
              <div class="row-q"><b>শিক্ষার্থী:</b> <span style="font-weight: 800; color: #0f172a;">${info.studentName || l.name_bn || ''}</span></div>
              <div class="row-q"><b>শ্রেণি ও রোল:</b> <span>${toBn(info.className || l.class_name)}ম শ্রেণি • রোল: ${toBn(info.rollNo || l.roll_no)}</span></div>
              <div class="row-q"><b>আইডি:</b> <span>${info.studentUid || l.student_uid || ''}</span> ${info.fatherName ? `&nbsp;|&nbsp; <b>পিতা:</b> <span>${info.fatherName}</span>` : ''}</div>
              <div class="row-q"><b>অভিভাবকের মোবাইল:</b> <span style="color:#0284c7; font-weight:700;">${info.phone || '—'}</span></div>
              
              <div class="divider-q"></div>
              
              <div class="row-q"><b>বইয়ের নাম:</b> <span style="font-weight: 800; color: #064e3b;">${l.book_title || ''}</span></div>
              <div class="row-q"><b>লেখক:</b> <span>${l.author || ''}</span> &nbsp;|&nbsp; <b>কোড:</b> <span style="color:#0284c7; font-weight:700;">${l.accession_no || ''}</span></div>
              
              <div class="date-box-q">
                <div>📅 ইস্যু: <b>${formatDateBn(l.issued_at)}</b></div>
                <div>⏰ শেষ জমা: <b style="color: #be123c;">${formatDateBn(l.due_at)}</b></div>
              </div>
              ${isReturned ? `<div style="font-size: 9.5px; color: #059669; font-weight: 700; margin-top: 2px;">✅ জমা সম্পন্ন: ${formatDateBn(l.returned_at)}</div>` : ''}
            </div>

            <div class="slip-footer-q">
              <div class="sig-line-q">শিক্ষার্থীর স্বাক্ষর</div>
              <div class="sig-line-q">লাইব্রেরিয়ান স্বাক্ষর</div>
            </div>
          </div>
        `;
      }

      // Half A4 slip (2 slips per A4 page)
      return `
        <div class="slip-card-half">
          <div class="slip-header-half">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${schoolLogo}" style="width: 44px; height: 44px; object-fit: contain;" alt="Logo" />
              <div>
                <div class="school-name-half">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</div>
                <div class="school-sub-half">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাঙ্গাইল • স্থাপিতঃ ১৯৪৬ • EIIN: 114290</div>
                <div class="school-branch-half">কেন্দ্রীয় লাইব্রেরি ও বুক ব্যাংক শাখা</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="slip-title-pill">লাইব্রেরি বই ইস্যু ও জমাদান স্লিপ</div>
              ${copyLabel ? `<div style="margin-top: 3px;"><span class="copy-badge-half">${copyLabel}</span></div>` : ''}
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">কোড: <b style="color:#0284c7;">${l.accession_no || ''}</b></div>
            </div>
          </div>

          <div class="slip-grid-half">
            <div class="slip-col-half">
              <div class="section-title-half">👤 শিক্ষার্থী ও অভিভাবক পরিচিতি</div>
              <div class="info-row"><b>শিক্ষার্থীর নাম:</b> <span class="val-highlight">${info.studentName || l.name_bn || ''}</span></div>
              <div class="info-row"><b>শ্রেণি:</b> ${toBn(info.className || l.class_name)}ম শ্রেণি &nbsp;&nbsp;&nbsp; <b>রোল নম্বর:</b> ${toBn(info.rollNo || l.roll_no)}</div>
              <div class="info-row"><b>শিক্ষার্থী আইডি:</b> <span style="font-family: monospace; font-weight: 700;">${info.studentUid || l.student_uid || ''}</span></div>
              ${info.fatherName ? `<div class="info-row"><b>পিতা/অভিভাবক:</b> <span>${info.fatherName}</span></div>` : ''}
              <div class="info-row"><b>অভিভাবকের মোবাইল:</b> <span style="font-weight: 700; color: #0284c7;">${info.phone || '—'}</span></div>
            </div>

            <div class="slip-col-half">
              <div class="section-title-half">📖 বইয়ের বিবরণী</div>
              <div class="info-row"><b>বইয়ের শিরোনাম:</b> <span class="val-highlight-book">${l.book_title || ''}</span></div>
              <div class="info-row"><b>রচয়িতা / লেখক:</b> ${l.author || ''}</div>
              <div class="info-row"><b>অ্যাকসেশন নম্বর:</b> <span style="color: #0284c7; font-weight: 700;">${l.accession_no || ''}</span></div>
              <div class="info-row"><b>বইয়ের অবস্থা:</b> ভালো ও অক্ষত</div>
            </div>
          </div>

          <div class="dates-strip-half">
            <div>📅 <b>ইস্যুর তারিখ:</b> ${formatDateBn(l.issued_at)}</div>
            <div>⏰ <b>নির্ধারিত জমাদানের শেষ তারিখ:</b> <span style="color: #be123c; font-weight: 800;">${formatDateBn(l.due_at)}</span></div>
            <div>
              ${isReturned ? `<span style="color: #059669; font-weight: 700;">✅ জমা সম্পন্ন: ${formatDateBn(l.returned_at)}</span>` : overdue > 0 ? `<span style="color: #dc2626; font-weight: 800; background: #fee2e2; padding: 2px 8px; border-radius: 4px;">⚠️ ${toBn(overdue)} দিন বকেয়া</span>` : `<span style="color: #1d4ed8; font-weight: 700; background: #dbeafe; padding: 2px 8px; border-radius: 4px;">🟢 চলমান</span>`}
            </div>
          </div>

          <div class="slip-footer-half">
            <div class="sig-box-half">
              <div class="sig-line">শিক্ষার্থীর স্বাক্ষর</div>
            </div>
            <div class="rules-note-half">
              * বইটি সযত্নে পড়তে হবে। কোনো পৃষ্ঠা ছেঁড়া বা দাগ দেওয়া সম্পূর্ণ নিষেধ। নির্ধারিত তারিখে লাইব্রেরিতে জমা দিতে হবে। *
            </div>
            <div class="sig-box-half">
              <div class="sig-line">গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</div>
            </div>
          </div>
        </div>
      `;
    };

    const pagesHtml = pages.map((pageChunk, pageIdx) => {
      if (perPage === 4) {
        const slips = pageChunk.map((l, sIdx) => {
          const label = customCopyLabels ? customCopyLabels[sIdx] : '';
          return renderSlip(l, label, true);
        }).join('');

        return `
          <div class="a4-sheet">
            <div class="grid-4-container">
              ${slips}
            </div>
          </div>
        `;
      } else {
        // perPage === 2
        const slip1 = renderSlip(pageChunk[0], customCopyLabels ? customCopyLabels[0] : (pageChunk.length === 1 ? 'শিক্ষার্থী কপি' : ''), false);
        let slip2 = '';
        if (pageChunk.length > 1) {
          slip2 = renderSlip(pageChunk[1], customCopyLabels ? customCopyLabels[1] : '', false);
        } else if (customCopyLabels && customCopyLabels[1]) {
          slip2 = renderSlip(pageChunk[0], customCopyLabels[1], false);
        }

        return `
          <div class="a4-sheet">
            <div class="stack-2-container">
              ${slip1}
              ${slip2 ? `
                <div class="cut-divider-line">
                  <span>✂️ ------------------------------- কাটার দাগ (Cut Here) -------------------------------</span>
                </div>
                ${slip2}
              ` : ''}
            </div>
          </div>
        `;
      }
    }).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8" />
        <title>লাইব্রেরি ইস্যু স্লিপ প্রিন্ট (${perPage === 2 ? '২টি / পাতা' : '৪টি / পাতা'}) - মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Nikosh', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #e2e8f0;
            color: #0f172a;
          }
          .toolbar {
            position: sticky;
            top: 0;
            z-index: 999;
            background: #0f172a;
            color: #fff;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          }
          .toolbar-title {
            font-size: 14px;
            font-weight: 700;
          }
          .btn-print {
            background: #059669;
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .btn-close {
            background: #fff;
            color: #334155;
            border: 1px solid #cbd5e1;
            padding: 7px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            margin-left: 10px;
          }
          .a4-sheet {
            background: #fff;
            width: 194mm;
            min-height: 281mm;
            margin: 15px auto;
            padding: 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            border-radius: 4px;
            page-break-after: always;
            break-after: page;
          }
          .a4-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          /* 2 Slips per page layout */
          .stack-2-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 280mm;
            padding: 2mm 0;
          }
          .slip-card-half {
            border: 1.5px solid #065f46;
            border-radius: 8px;
            padding: 12px 16px;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 134mm;
            box-sizing: border-box;
          }
          .slip-header-half {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #065f46;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .school-name-half {
            font-size: 16px;
            font-weight: 900;
            color: #064e3b;
            line-height: 1.2;
          }
          .school-sub-half {
            font-size: 10px;
            color: #475569;
            margin-top: 1px;
          }
          .school-branch-half {
            font-size: 10.5px;
            font-weight: 700;
            color: #047857;
            margin-top: 1px;
          }
          .slip-title-pill {
            background: #047857;
            color: #fff;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 12px;
            border-radius: 12px;
            display: inline-block;
          }
          .copy-badge-half {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 700;
            display: inline-block;
          }
          .slip-grid-half {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
          }
          .section-title-half {
            font-size: 11px;
            font-weight: 800;
            color: #065f46;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 3px;
            margin-bottom: 4px;
          }
          .info-row {
            font-size: 11.5px;
            line-height: 1.55;
            color: #1e293b;
          }
          .val-highlight {
            font-weight: 800;
            color: #0f172a;
            font-size: 12.5px;
          }
          .val-highlight-book {
            font-weight: 800;
            color: #047857;
            font-size: 12.5px;
          }
          .dates-strip-half {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11.5px;
            margin: 6px 0;
          }
          .slip-footer-half {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 4px;
          }
          .sig-box-half {
            width: 170px;
            text-align: center;
          }
          .sig-line {
            border-top: 1px dashed #475569;
            padding-top: 4px;
            font-size: 11px;
            font-weight: 700;
            color: #1e293b;
          }
          .rules-note-half {
            font-size: 9.5px;
            color: #64748b;
            text-align: center;
            max-width: 250px;
            font-style: italic;
            line-height: 1.25;
          }
          .cut-divider-line {
            text-align: center;
            color: #64748b;
            font-size: 11px;
            font-weight: 600;
            margin: 2mm 0;
            white-space: nowrap;
            overflow: hidden;
          }

          /* 4 Slips per page layout */
          .grid-4-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 6mm;
            height: 280mm;
            padding: 2mm 0;
            box-sizing: border-box;
          }
          .slip-card-quarter {
            border: 1.5px solid #065f46;
            border-radius: 6px;
            padding: 8px 10px;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 135mm;
            box-sizing: border-box;
          }
          .slip-header-q {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #065f46;
            padding-bottom: 4px;
            margin-bottom: 4px;
          }
          .school-name-q {
            font-size: 12px;
            font-weight: 900;
            color: #064e3b;
            line-height: 1.15;
          }
          .school-sub-q {
            font-size: 8.5px;
            color: #64748b;
          }
          .copy-badge-q {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
            padding: 1px 6px;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 700;
          }
          .code-badge-q {
            color: #0284c7;
            font-size: 9.5px;
            font-weight: 800;
            border: 1px dashed #cbd5e1;
            padding: 1px 5px;
            border-radius: 4px;
          }
          .slip-body-q {
            font-size: 10.5px;
            line-height: 1.45;
            color: #1e293b;
          }
          .row-q {
            margin-bottom: 2px;
          }
          .divider-q {
            border-top: 1px dashed #cbd5e1;
            margin: 4px 0;
          }
          .date-box-q {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 4px 6px;
            margin-top: 4px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
          }
          .slip-footer-q {
            display: flex;
            justify-content: space-between;
            border-top: 1px dashed #cbd5e1;
            padding-top: 4px;
            margin-top: 4px;
          }
          .sig-line-q {
            font-size: 9px;
            font-weight: 700;
            color: #334155;
          }

          @media print {
            .toolbar {
              display: none !important;
            }
            body {
              background: #fff;
            }
            .a4-sheet {
              width: 100%;
              min-height: auto;
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <div class="toolbar-title">
            🖨️ লাইব্রেরি ইস্যু স্লিপ প্রিন্ট প্রিভিউ (${perPage === 2 ? '২টি / পাতা - A4' : '৪টি / পাতা - A4'} • মোট ${toBn(loanList.length)} টি স্লিপ • ${toBn(pages.length)} পাতা)
          </div>
          <div>
            <button class="btn-print" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন</button>
            <button class="btn-close" onclick="window.close()">✕ উইন্ডো বন্ধ</button>
          </div>
        </div>

        ${pagesHtml}

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Batch print selected loans or all loans (2 or 4 per A4 page)
  const handlePrintBatchSlips = (perPage = 2) => {
    let target = [];
    if (selectedLoanIds.length > 0) {
      target = loans.filter(l => selectedLoanIds.includes(l.id));
    } else {
      const confirmAll = window.confirm(`আপনি কোনো নির্দিষ্ট স্লিপে টিক চিহ্ন দেননি।\n\nআপনি কি রেজিস্টারের সকল (${toBn(loans.length)} টি) বই ইস্যু স্লিপ প্রিন্ট করতে চান?\n\n(নির্দিষ্ট শিক্ষার্থীর স্লিপ প্রিন্ট করতে চাইলে প্রথমে বামের টিক চিহ্নে ক্লিক করুন)`);
      if (!confirmAll) return;
      target = [...loans];
    }
    handlePrintSlips(target, perPage);
  };

  // Single loan print with multiple copies on 1 A4 page
  const handlePrintSingleLoan = (loanItem, perPage = 2) => {
    if (!loanItem) return;
    if (perPage === 2) {
      // 2 copies on 1 A4 page: Student Copy & Office Copy
      handlePrintSlips([loanItem, loanItem], 2, ['শিক্ষার্থী কপি', 'অফিস / লাইব্রেরি কপি']);
    } else if (perPage === 4) {
      // 4 copies on 1 A4 page: Student, Office, Guardian, Record Copy
      handlePrintSlips([loanItem, loanItem, loanItem, loanItem], 4, ['শিক্ষার্থী কপি', 'অফিস কপি', 'অভিভাবক কপি', 'রেকর্ড কপি']);
    } else {
      handlePrintSlips([loanItem], 2, ['মূল কপি']);
    }
  };

  // -------------------------------------------------------------
  // Digital Defaulter Notice & SMS Dispatch Helpers
  // (WhatsApp, Messenger, Imo, Telegram, and Short SMS)
  // -------------------------------------------------------------
  const getFormattedPhone = (rawPhone) => {
    const digits = String(rawPhone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 11 && digits.startsWith('01')) {
      return '88' + digits;
    }
    if (digits.startsWith('880')) {
      return digits;
    }
    if (digits.length === 10 && digits.startsWith('1')) {
      return '880' + digits;
    }
    return digits;
  };

  const buildDefaulterNoticeText = (l) => {
    if (!l) return '';
    const info = getLoanStudentInfo(l);
    const overdue = getOverdueDays(l.due_at);
    const todayBn = formatDateBn(new Date().toISOString().slice(0, 10));
    const recipientText = info.fatherName ? `${info.fatherName} (${info.studentName}-এর পিতা/অভিভাবক)` : `${info.studentName}-এর সম্মানিত পিতা/অভিভাবক`;
    return `*জরুরি তাগাদা নোটিশ: লাইব্রেরি বই ফেরত সংক্রান্ত*
*মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়*
কেন্দ্রীয় লাইব্রেরি শাখা • EIIN: 114290 • কালিহাতি, টাঙ্গাইল

স্মারক নং: MAG/LIB/${new Date().getFullYear()}/${l.accession_no}
তারিখ: ${todayBn}

প্রাপক: ${recipientText}
শিক্ষার্থী: ${info.studentName}
শ্রেণি: ${toBn(info.className)}ম শ্রেণি, রোল নং: ${toBn(info.rollNo)} (আইডি: ${info.studentUid})
অভিভাবকের মোবাইল: ${info.phone || '— (ভর্তি ফরমে উল্লেখ নেই)'}

সম্মানিত অভিভাবক,
এতদ্বারা আপনাকে বিনীতভাবে জানানো যাচ্ছে যে, আপনার সন্তান বিদ্যালয় লাইব্রেরি থেকে নিম্নবর্ণিত বইটি অধ্যয়নের উদ্দেশ্যে গ্রহণ করেছিল। নির্ধারিত মেয়াদ শেষ হলেও অদ্যবধি বইটি লাইব্রেরিতে জমা দেওয়া হয়নি:

📖 বইয়ের নাম: ${l.book_title}
✍️ লেখক: ${l.author}
🏷️ অ্যাকসেশন কোড: ${l.accession_no}
📅 ইস্যুর তারিখ: ${formatDateBn(l.issued_at)}
⏰ নির্ধারিত জমাদানের তারিখ: ${formatDateBn(l.due_at)}
⚠️ বিলম্বের সময়সীমা: ${toBn(overdue)} দিন অতিবাহিত হয়েছে

অতএব, নোটিশ প্রাপ্তির ৩ (তিন) কার্যদিবসের মধ্যে বইটি অক্ষত অবস্থায় লাইব্রেরিতে জমা দেওয়ার জন্য বিশেষভাবে অনুরোধ করা হলো। অন্যথায় বিদ্যালয়ের প্রচলিত নিয়ম অনুযায়ী ব্যবস্থা গ্রহণ করা হবে।

— মোঃ শাহিন মিয়া (গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক) ও প্রধান শিক্ষক
মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়`;
  };

  const buildShortSmsText = (l, mode = 'feature_phone') => {
    if (!l) return '';
    const info = getLoanStudentInfo(l);
    const overdue = getOverdueDays(l.due_at);
    if (mode === 'feature_phone') {
      // 100% Button / Feature phone friendly (Banglish - no unicode corruption, fits 1 SMS <160 chars)
      return `Magra Pals HS: ${info.studentName} (Roll ${info.rollNo}, Class ${info.className})-er library boi "${l.book_title}" ferot deyar somoy par hoyeche (${overdue} din). Shighroi joma din.`;
    }
    if (mode === 'short') {
      return `মগড়া পালস্ উ/বি: ${info.studentName} (রোল ${toBn(info.rollNo)}) এর বই "${l.book_title}" জমা দেওয়ার মেয়াদ শেষ হয়েছে। অবিলম্বে লাইব্রেরিতে জমা দিন।`;
    }
    if (mode === 'english') {
      return `Magra Pals High School: Student ${info.studentName} (Class ${info.className}, Roll ${info.rollNo}) library book "${l.book_title}" is overdue by ${overdue} days. Please return within 3 days.`;
    }
    return `মগড়া পালস্ উ/বি লাইব্রেরি: শিক্ষার্থী ${info.studentName} (শ্রেণি ${toBn(info.className)}ম, রোল ${toBn(info.rollNo)}) এর নেওয়া বই "${l.book_title}" জমা দেওয়ার মেয়াদ ${toBn(overdue)} দিন পার হয়েছে। আগামী ৩ দিনের মধ্যে বইটি লাইব্রেরিতে জমা দেওয়ার অনুরোধ রইল।`;
  };

  const handleSendWhatsApp = (loan) => {
    if (!loan) return;
    const info = getLoanStudentInfo(loan);
    const phoneToUse = info.phone || loan.guardian_phone;
    const fullPhone = getFormattedPhone(phoneToUse);
    if (!fullPhone) {
      alert(`শিক্ষার্থী ${info.studentName}-এর ভর্তি ফরমে কোনো কার্যকর মোবাইল নম্বর পাওয়া যায়নি।\nঅনুগ্রহ করে শিক্ষার্থীর ভর্তি তথ্য বা বই ইস্যু রেকর্ডে মোবাইল নম্বর আপডেট করুন।`);
      return;
    }
    const text = buildDefaulterNoticeText(loan);
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendMessenger = (loan) => {
    if (!loan) return;
    const info = getLoanStudentInfo(loan);
    const text = buildDefaulterNoticeText(loan);
    navigator.clipboard.writeText(text).then(() => {
      alert(`তাগাদা নোটিশটি সফলভাবে কপি করা হয়েছে!\n\nঅভিভাবক (${info.studentName}-এর পিতা/মাতা)-কে পাঠানোর জন্য এবার ফেসবুক মেসেঞ্জারে পেস্ট (Paste) করে সেন্ড করুন।`);
      window.open('https://www.messenger.com/', '_blank');
    }).catch(() => {
      window.open('https://www.messenger.com/', '_blank');
    });
  };

  const handleSendImo = (loan) => {
    if (!loan) return;
    const info = getLoanStudentInfo(loan);
    const phoneToUse = info.phone || loan.guardian_phone;
    const fullPhone = getFormattedPhone(phoneToUse);
    const text = buildDefaulterNoticeText(loan);
    navigator.clipboard.writeText(text).then(() => {
      alert(`তাগাদা নোটিশটি সফলভাবে কপি করা হয়েছে!\n\nঅভিভাবকের ইমো নম্বর: ${phoneToUse || 'নম্বর নেই'}\nইমো অ্যাপে গিয়ে পেস্ট (Paste) করে সেন্ড করুন।`);
      if (fullPhone) {
        window.location.href = `imo://chat?phone=${fullPhone}`;
      }
      setTimeout(() => {
        window.open('https://imo.im/', '_blank');
      }, 600);
    }).catch(() => {
      window.open('https://imo.im/', '_blank');
    });
  };

  const handleSendTelegram = (loan) => {
    if (!loan) return;
    const text = buildDefaulterNoticeText(loan);
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://magrapalshs.edu.bd')}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyNoticeText = (loan) => {
    if (!loan) return;
    const text = buildDefaulterNoticeText(loan);
    navigator.clipboard.writeText(text).then(() => {
      alert('সম্পূর্ণ তাগাদা নোটিশটি ক্লিপবোর্ডে সফলভাবে কপি করা হয়েছে!');
    }).catch(() => {
      alert('কপি করা সম্ভব হয়নি। অনুগ্রহ করে ম্যানুয়ালি কপি করুন।');
    });
  };

  const handleOpenSmsModal = (loan) => {
    if (!loan) return;
    const info = getLoanStudentInfo(loan);
    setSmsModalLoan(loan);
    setSmsCustomPhone(info.phone || loan.guardian_phone || '');
    // Default to feature_phone safe Banglish (no font scramble on button phones, fits 1 SMS)
    setSmsCustomText(buildShortSmsText(loan, 'feature_phone'));
    setSmsSentSuccess(false);
    setSmsGatewayError('');
    setSmsDeliveryStatus(null);
    setShowSmsSettings(false);
    setSmsDeliveryTab('qr'); // Show mobile scan QR first
  };

  const handleDirectDeviceSms = (phone, text) => {
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const separator = isIOS ? '&' : '?';
    showNotification('আপনার মোবাইল/ডিভাইসের মেসেজিং অ্যাপ চালু হচ্ছে...', 'info');
    window.location.href = `sms:${cleanPhone}${separator}body=${encodeURIComponent(text)}`;
  };

  const handleSaveSmsGatewayConfig = (newConfig) => {
    setSmsGatewayConfig(newConfig);
    try {
      localStorage.setItem('magra_sms_gateway_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    setSmsGatewayError('');
    showNotification('SMS গেটওয়ে সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  };

  const handleSendGatewaySms = async () => {
    if (!smsCustomPhone.trim()) {
      alert('অনুগ্রহ করে পিতা/অভিভাবকের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!smsCustomText.trim()) {
      alert('SMS বার্তা ফাঁকা রাখা যাবে না।');
      return;
    }

    // Check if SMS gateway is configured & active
    if (!smsGatewayConfig.apiKey?.trim() || !smsGatewayConfig.isActive) {
      setSmsGatewayError('⚠️ কোনো SMS গেটওয়ে API Key সেট বা সক্রিয় করা নেই! ওয়েব থেকে টেলিকম নেটওয়ার্কে সরাসরি SMS পাঠাতে স্কুলের একটি গেটওয়ে API Key (যেমন BulkSMSBD বা Greenweb) প্রয়োজন। নিচে সেটিংস থেকে API Key প্রদান করুন অথবা বিনামূল্যে এখনই পাঠাতে "📱 মোবাইল SMS অ্যাপে" বাটন চাপুন।');
      setShowSmsSettings(true);
      return;
    }

    setSmsSendingLoading(true);
    setSmsGatewayError('');
    setSmsDeliveryStatus(null);
    setSmsSentSuccess(false);

    let cleanPhone = smsCustomPhone.trim().replace(/[^\d+]/g, '');
    let localDigits = cleanPhone.replace(/^\+88/, '').replace(/^88/, '');
    if (localDigits.length === 10 && localDigits.startsWith('1')) {
      localDigits = '0' + localDigits;
    }

    try {
      let requestUrl = '';
      if (smsGatewayConfig.provider === 'bulksmsbd') {
        const fullNumber = '88' + localDigits;
        requestUrl = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(smsGatewayConfig.apiKey.trim())}&type=text&number=${encodeURIComponent(fullNumber)}&senderid=${encodeURIComponent(smsGatewayConfig.senderId?.trim() || '')}&message=${encodeURIComponent(smsCustomText)}`;
      } else if (smsGatewayConfig.provider === 'greenweb') {
        const fullNumber = '88' + localDigits;
        requestUrl = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(smsGatewayConfig.apiKey.trim())}&to=${encodeURIComponent(fullNumber)}&message=${encodeURIComponent(smsCustomText)}`;
      } else if (smsGatewayConfig.provider === 'custom' && smsGatewayConfig.customUrl) {
        requestUrl = smsGatewayConfig.customUrl
          .replace('{phone}', encodeURIComponent(localDigits))
          .replace('{phone_int}', encodeURIComponent('88' + localDigits))
          .replace('{message}', encodeURIComponent(smsCustomText))
          .replace('{apikey}', encodeURIComponent(smsGatewayConfig.apiKey.trim()))
          .replace('{senderid}', encodeURIComponent(smsGatewayConfig.senderId?.trim() || ''));
      }

      if (!requestUrl) {
        throw new Error('অননুমোদিত গেটওয়ে কনফিগারেশন। API URL বা Key পরীক্ষা করুন।');
      }

      const res = await fetch(requestUrl, { method: 'GET', mode: 'cors' });
      const data = await res.text();

      setSmsSentSuccess(true);
      setSmsDeliveryStatus({
        type: 'success',
        message: `টেলিকম গেটওয়েতে (${smsCustomPhone}) নাম্বারে SMS সফলভাবে পাঠানো হয়েছে!`,
        details: data.substring(0, 150)
      });
      showNotification(`টেলিকম গেটওয়েতে SMS সফলভাবে রিকোয়েস্ট করা হয়েছে!`, 'success');
    } catch (err) {
      console.warn('SMS Gateway dispatch error / CORS:', err);
      setSmsGatewayError(`⚠️ গেটওয়েতে রিকোয়েস্ট পাঠানোর সময় সমস্যা হয়েছে (${err.message || 'নেটওয়ার্ক বা ব্রাউজার বাধা'})। পেইড ব্যালেন্স/কী যাচাই করুন অথবা বিনামূল্যে এখনই পাঠাতে নিচের '📱 মোবাইল SMS অ্যাপে' বাটন ব্যবহার করুন।`);
    } finally {
      setSmsSendingLoading(false);
    }
  };

  // CSV Catalog Export
  const exportCatalogCSV = () => {
    const headers = ['Accession No', 'Author', 'Title', 'Category', 'Shelf', 'Total Copies', 'Available', 'Price', 'Source'];
    const rows = filteredBooks.map(b => [
      `"${b.accession_no || ''}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${b.category || ''}"`,
      `"${b.shelf || ''}"`,
      b.quantity || 0,
      b.available_quantity || 0,
      b.price || 0,
      `"${b.source || ''}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `magra_school_library_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample CSV Template Download for Bulk Book Import
  const downloadSampleCSV = () => {
    const headers = ['Accession No', 'Author', 'Title', 'Category', 'Shelf', 'Total Copies', 'Price', 'Source', 'Remarks'];
    const sampleRows = [
      ['MAG-BK-021', 'কাজী নজরুল ইসলাম', 'অগ্নিবীণা', 'কবিতা', 'আলমারি-১ (বাংলা সাহিত্য)', 5, 220, 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়', 'উন্নত সংস্করণ'],
      ['MAG-BK-022', 'রবীন্দ্রনাথ ঠাকুর', 'গীতাঞ্জলি', 'কবিতা', 'আলমারি-১ (বাংলা সাহিত্য)', 4, 300, 'সরকারি অনুদান', 'নোবেল পুরস্কারপ্রাপ্ত সংস্করণ'],
      ['MAG-BK-023', 'অধ্যাপক এম এ কালাম', 'সাধারণ জ্ঞান ও বাংলাদেশ বিষয়াবলী ২০২৬', 'সাধারণ জ্ঞান ও বিশ্বকোষ', 'আলমারি-৫ (সাধারণ জ্ঞান ও রেফারেন্স)', 6, 250, 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়', '২০২৬ সংস্করণ']
    ];
    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_library_books_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Upload & Parsing Handler
  const handleCSVFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setCsvError('CSV ফাইলে পর্যাপ্ত তথ্য নেই। প্রথম সারিতে কলাম হেডার এবং পরবর্তী সারিতে বইয়ের তথ্য থাকতে হবে।');
          return;
        }

        const parseLine = (line) => {
          const res = [];
          let cur = '';
          let inQ = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQ && line[i + 1] === '"') {
                cur += '"';
                i++;
              } else {
                inQ = !inQ;
              }
            } else if (ch === ',' && !inQ) {
              res.push(cur.trim());
              cur = '';
            } else {
              cur += ch;
            }
          }
          res.push(cur.trim());
          return res;
        };

        const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
        const findIdx = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));

        const accIdx = findIdx(['accession', 'acc', 'কোড', 'নম্বর']);
        const authorIdx = findIdx(['author', 'লেখক']);
        const titleIdx = findIdx(['title', 'বই', 'নাম', 'শিরোনাম']);
        const catIdx = findIdx(['category', 'ক্যাটাগরি', 'বিভাগ']);
        const shelfIdx = findIdx(['shelf', 'আলমারি', 'সেলফ']);
        const qtyIdx = findIdx(['total copies', 'quantity', 'qty', 'কপি', 'সংখ্যা']);
        const priceIdx = findIdx(['price', 'মূল্য', 'দাম']);
        const sourceIdx = findIdx(['source', 'উৎস', 'তহবিল']);
        const remarksIdx = findIdx(['remark', 'মন্তব্য']);

        if (titleIdx === -1 && authorIdx === -1) {
          setCsvError('CSV ফাইলে "বইয়ের নাম" (Title) বা "লেখক" (Author) কলামটি শনাক্ত করা যায়নি। অনুগ্রহ করে নমুনা টেমপ্লেট ডাউনলোড করে ফরম্যাটটি পরীক্ষা করুন।');
          return;
        }

        const existingNums = books.map(b => {
          const m = String(b.accession_no || '').match(/\d+/g);
          return m ? parseInt(m[m.length - 1], 10) : 0;
        });
        let curMax = existingNums.length ? Math.max(...existingNums) : 0;

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (!cols || cols.length === 0 || cols.every(c => !c)) continue;

          const rawTitle = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx].replace(/^["']|["']$/g, '').trim() : '';
          const rawAuthor = authorIdx !== -1 && cols[authorIdx] ? cols[authorIdx].replace(/^["']|["']$/g, '').trim() : '';
          if (!rawTitle && !rawAuthor) continue;

          let accNo = accIdx !== -1 && cols[accIdx] ? cols[accIdx].replace(/^["']|["']$/g, '').trim() : '';
          if (!accNo) {
            curMax += 1;
            accNo = `MAG-BK-${String(curMax).padStart(3, '0')}`;
          }

          const rawQty = qtyIdx !== -1 && cols[qtyIdx] ? parseInt(cols[qtyIdx].replace(/[^\d]/g, ''), 10) || 1 : 1;
          const rawPrice = priceIdx !== -1 && cols[priceIdx] ? parseFloat(cols[priceIdx].replace(/[^\d.]/g, '')) || 0 : 0;
          const rawCat = catIdx !== -1 && cols[catIdx] ? cols[catIdx].replace(/^["']|["']$/g, '').trim() : 'উপন্যাস';
          const rawShelf = shelfIdx !== -1 && cols[shelfIdx] ? cols[shelfIdx].replace(/^["']|["']$/g, '').trim() : 'আলমারি-১ (বাংলা সাহিত্য)';
          const rawSource = sourceIdx !== -1 && cols[sourceIdx] ? cols[sourceIdx].replace(/^["']|["']$/g, '').trim() : 'বিদ্যালয়ের নিজস্ব তহবিল ক্রয়';
          const rawRemarks = remarksIdx !== -1 && cols[remarksIdx] ? cols[remarksIdx].replace(/^["']|["']$/g, '').trim() : '';

          parsed.push({
            id: 'bk-csv-' + Date.now() + '-' + i,
            accession_no: accNo,
            author: rawAuthor || 'অজ্ঞাত লেখক',
            title: rawTitle || 'শিরোনামহীন বই',
            category: rawCat,
            shelf: rawShelf,
            quantity: rawQty,
            available_quantity: rawQty,
            price: rawPrice,
            source: rawSource,
            remarks: rawRemarks
          });
        }

        if (parsed.length === 0) {
          setCsvError('CSV ফাইলে কোনো বৈধ বইয়ের সারি পাওয়া যায়নি।');
        } else {
          setCsvParsedBooks(parsed);
          setCsvError('');
        }
      } catch (err) {
        setCsvError('ফাইল পড়তে ত্রুটি হয়েছে: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImportCSV = () => {
    if (!csvParsedBooks.length) return;
    setBooks(prev => [...csvParsedBooks, ...prev]);
    showNotification(`সফলভাবে ${toBn(csvParsedBooks.length)}টি বই CSV ফাইল থেকে ক্যাটালগে আপলোড ও যুক্ত করা হয়েছে!`, 'success');
    setShowUploadCSVModal(false);
    setCsvFile(null);
    setCsvParsedBooks([]);
    setCsvError('');
  };

  // Comprehensive CSV Library Inventory & Audit Report Export
  const exportLibraryReportCSV = () => {
    const reportDate = new Date().toISOString().slice(0, 10);
    const activeLoans = loans.filter(l => !l.returned_at);
    const overdueLoans = activeLoans.filter(l => getOverdueDays(l.due_at) > 0);
    const totalDamagedCopies = damaged.reduce((acc, d) => acc + (parseInt(d.quantity, 10) || 0), 0);
    const totalStockValue = books.reduce((acc, b) => acc + ((parseFloat(b.price) || 0) * (parseInt(b.quantity, 10) || 0)), 0);

    const lines = [
      `"মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় - কেন্দ্রীয় লাইব্রেরি পূর্ণাঙ্গ স্টক ও অডিট রিপোর্ট"`,
      `"রিপোর্ট প্রস্তুতের তারিখ","${reportDate}"`,
      `"দায়িত্বপ্রাপ্ত শিক্ষক","${LIBRARIAN_TEACHER.name_bn} (${LIBRARIAN_TEACHER.designation})"`,
      `"EIIN","114290","অবস্থান","${LIBRARIAN_TEACHER.room}"`,
      `""`,
      `"--- লাইব্রেরি সার্বিক সারসংক্ষেপ (KPI SUMMARY) ---"`,
      `"মেট্রিক্সের নাম","পরিমাণ / সংখ্যা","মন্তব্য"`,
      `"মোট বইয়ের টাইটেল (Unique Titles)","${books.length} টি","লেখকের নামানুসারে ক্যাটালগভুক্ত"`,
      `"মোট বইয়ের কপি সংখ্যা (Total Copies)","${kpis.totalCopies} কপি","লাইব্রেরির সর্বমোট স্টক"`,
      `"শেলফে বর্তমানে উপলব্ধ (Available in Shelf)","${kpis.availableCopies} কপি","ইস্যু করার জন্য প্রস্তুত"`,
      `"শিক্ষার্থীদের কাছে ইস্যুকৃত (Currently Issued)","${kpis.issuedCount} কপি","চলমান রিডিং লোন"`,
      `"বকেয়া / মেয়াদোত্তীর্ণ বই (Overdue Loans)","${kpis.overdueCount} টি","তাগাদা নোটিশ প্রদানযোগ্য"`,
      `"নষ্ট ও বাতিল বই (Damaged/Discarded)","${totalDamagedCopies} কপি","অডিট রেজিস্টারভুক্ত"`,
      `"লাইব্রেরি স্টকের আনুমানিক মোট আর্থিক মূল্য","${totalStockValue.toLocaleString('bn-BD')} টাকা","একক বইয়ের মূল্যের ভিত্তিতে"`,
      `""`,
      `"--- ক্যাটাগরিভিত্তিক স্টক বিশ্লেষণ (CATEGORY-WISE DISTRIBUTION) ---"`,
      `"ক্যাটাগরি","টাইটেল সংখ্যা","মোট কপি","শেলফে উপলব্ধ","ইস্যুকৃত কপি"`
    ];

    const catMap = {};
    books.forEach(b => {
      const c = b.category || 'অন্যান্য';
      if (!catMap[c]) catMap[c] = { titles: 0, total: 0, avail: 0 };
      catMap[c].titles += 1;
      catMap[c].total += (parseInt(b.quantity, 10) || 0);
      catMap[c].avail += (parseInt(b.available_quantity, 10) || 0);
    });
    Object.keys(catMap).sort().forEach(cat => {
      const d = catMap[cat];
      const issued = d.total - d.avail;
      lines.push(`"${cat}","${d.titles}","${d.total}","${d.avail}","${issued}"`);
    });

    lines.push(`""`);
    lines.push(`"--- আলমারি / সেলফভিত্তিক বইয়ের বিন্যাস (SHELF DISTRIBUTION) ---"`);
    lines.push(`"আলমারি/সেলফ","টাইটেল সংখ্যা","মোট কপি"`);
    const shelfMap = {};
    books.forEach(b => {
      const s = b.shelf || 'অন্যান্য';
      if (!shelfMap[s]) shelfMap[s] = { titles: 0, total: 0 };
      shelfMap[s].titles += 1;
      shelfMap[s].total += (parseInt(b.quantity, 10) || 0);
    });
    Object.keys(shelfMap).sort().forEach(shelf => {
      const d = shelfMap[shelf];
      lines.push(`"${shelf}","${d.titles}","${d.total}"`);
    });

    lines.push(`""`);
    lines.push(`"--- বিস্তারিত গ্রন্থ ও স্টক রেজিস্টার (DETAILED BOOK INVENTORY) ---"`);
    lines.push(`"ক্রমিক","অ্যাকসেশন নং","লেখকের নাম","বইয়ের নাম","ক্যাটাগরি","আলমারি/সেলফ","মোট কপি","উপলব্ধ কপি","ইস্যুকৃত","একক মূল্য (টাকা)","মোট মূল্য (টাকা)","উৎস","স্টক স্ট্যাটাস"`);

    books.forEach((b, idx) => {
      const qty = parseInt(b.quantity, 10) || 0;
      const avail = parseInt(b.available_quantity, 10) || 0;
      const issued = qty - avail;
      const price = parseFloat(b.price) || 0;
      const rowTotal = price * qty;
      const status = avail === 0 ? 'স্টক শূন্য' : avail <= 2 ? 'সীমিত স্টক' : 'পর্যাপ্ত স্টক';

      lines.push([
        idx + 1,
        `"${b.accession_no || ''}"`,
        `"${(b.author || '').replace(/"/g, '""')}"`,
        `"${(b.title || '').replace(/"/g, '""')}"`,
        `"${b.category || ''}"`,
        `"${b.shelf || ''}"`,
        qty,
        avail,
        issued,
        price,
        rowTotal,
        `"${(b.source || '').replace(/"/g, '""')}"`,
        `"${status}"`
      ].join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `magra_school_library_report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('লাইব্রেরির সামগ্রিক স্টক ও অডিট রিপোর্ট (CSV) ডাউনলোড সম্পন্ন হয়েছে।', 'success');
  };

  return (
    <div className="library-management-panel" style={{ width: '100%', fontFamily: 'inherit' }}>
      {/* ------------------------------------------------------------------ */}
      {/* Header & Responsible Librarian Banner */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0f766e 100%)',
        color: '#fff',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(6, 78, 59, 0.18)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.16)',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            fontSize: '28px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            📚
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: '#fef08a',
                color: '#854d0e',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '0.5px'
              }}>
                EIIN: 114290 • স্কুল লাইব্রেরি ERP
              </span>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় (স্থাপিত ১৯৪৬)
              </span>
            </div>
            <h1 style={{ margin: '4px 0 2px', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px' }}>
              গ্রন্থাগার ও তথ্য বিজ্ঞান ব্যবস্থাপনা
            </h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.92, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span>👤 <b>দায়িত্বপ্রাপ্ত শিক্ষক:</b> {LIBRARIAN_TEACHER.name_bn} ({LIBRARIAN_TEACHER.designation} ও বিষয় শিক্ষক)</span>
              <span>• 🏢 {LIBRARIAN_TEACHER.room}</span>
              <span>• 📞 {LIBRARIAN_TEACHER.phone}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('results', 'marks')}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
              }}
              title="সহকারী শিক্ষক হিসাবে নিজ বিষয়ের পরীক্ষার নম্বর এন্ট্রি ফর্মে যান"
            >
              <span>📈</span> বিষয় নম্বর এন্ট্রি
            </button>
          )}
          <button
            type="button"
            onClick={openAddBookModal}
            style={{
              background: '#fef08a',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <span>➕</span> নতুন বই এন্ট্রি
          </button>
          <button
            type="button"
            onClick={() => openIssueModal()}
            style={{
              background: '#fff',
              color: '#064e3b',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <span>📤</span> শিক্ষার্থীকে বই ইস্যু
          </button>
          <button
            type="button"
            onClick={fetchLibraryData}
            title="সার্ভার ও স্টোরেজ থেকে লাইব্রেরি ও শিক্ষার্থী ডাটা রিলোড করুন"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔄</span> রিলোড
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Toast Notification Alert */}
      {/* ------------------------------------------------------------------ */}
      {msg.text && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: msg.type === 'error' ? '#fee2e2' : msg.type === 'warning' ? '#fef3c7' : '#ecfdf5',
          color: msg.type === 'error' ? '#991b1b' : msg.type === 'warning' ? '#92400e' : '#065f46',
          border: `1px solid ${msg.type === 'error' ? '#f87171' : msg.type === 'warning' ? '#fde68a' : '#a7f3d0'}`,
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
        }}>
          <span>{msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : '✅'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KPI Summary Cards */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>মোট বইয়ের টাইটেল</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{toBn(kpis.totalTitles)} <small style={{ fontSize: '13px', fontWeight: 500 }}>টি</small></div>
          <div style={{ fontSize: '11px', color: '#10b981' }}>লেখকের নামানুসারে ক্যাটালগ</div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>মোট বই সংখ্যা (কপি)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{toBn(kpis.totalCopies)} <small style={{ fontSize: '13px', fontWeight: 500 }}>কপি</small></div>
          <div style={{ fontSize: '11px', color: '#0284c7' }}>লাইব্রেরির সর্বমোট স্টক</div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>শেলফে উপলব্ধ কপি</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>{toBn(kpis.availableCopies)} <small style={{ fontSize: '13px', fontWeight: 500 }}>কপি</small></div>
          <div style={{ fontSize: '11px', color: '#16a34a' }}>ইস্যুর জন্য প্রস্তুত</div>
        </div>

        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>শিক্ষার্থীদের কাছে ইস্যুকৃত</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>{toBn(kpis.issuedCount)} <small style={{ fontSize: '13px', fontWeight: 500 }}>টি</small></div>
          <div style={{ fontSize: '11px', color: '#b45309' }}>চলমান রিডিং লোন</div>
        </div>

        <div
          onClick={() => switchTab('overdue')}
          style={{
            background: kpis.overdueCount > 0 ? '#fef2f2' : '#fff',
            padding: '14px 16px',
            borderRadius: '10px',
            border: `1.5px solid ${kpis.overdueCount > 0 ? '#f87171' : '#e2e8f0'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', color: kpis.overdueCount > 0 ? '#991b1b' : '#64748b', fontWeight: 600 }}>বকেয়া / অনাদায়ী বই</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: kpis.overdueCount > 0 ? '#dc2626' : '#64748b', margin: '4px 0' }}>
            {toBn(kpis.overdueCount)} <small style={{ fontSize: '13px', fontWeight: 500 }}>টি</small>
          </div>
          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
            {kpis.overdueCount > 0 ? '⚠️ তাগাদা নোটিশ পাঠাতে ক্লিক করুন' : 'কোনো বকেয়া নেই'}
          </div>
        </div>

        <div
          onClick={() => switchTab('damaged')}
          style={{
            background: '#fff',
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>নষ্ট ও বাতিল বই</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#475569', margin: '4px 0' }}>{toBn(kpis.totalDamagedCopies)} <small style={{ fontSize: '13px', fontWeight: 500 }}>কপি</small></div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>অডিট রেজিস্টারভুক্ত</div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Tab Navigation Navigation Bar */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {[
          { key: 'catalog', label: '📖 বই ক্যাটালগ ও রেজিস্টার', badge: toBn(books.length) },
          { key: 'issue', label: '📤 বই ইস্যু ও জমার হিসাব', badge: toBn(loans.filter(l => !l.returned_at).length) },
          { key: 'overdue', label: '⏰ বকেয়া/অনাদায়ী তালিকা', badge: kpis.overdueCount > 0 ? toBn(kpis.overdueCount) : null, badgeColor: '#ef4444' },
          { key: 'reports', label: '📊 সাপ্তাহিক ও মাসিক রিপোর্ট', badge: null },
          { key: 'damaged', label: '⚠️ নষ্ট ও বাতিল বই রেজিস্টার', badge: toBn(damaged.length) }
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => switchTab(t.key)}
            style={{
              padding: '11px 18px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === t.key ? '#065f46' : '#64748b',
              borderBottom: activeTab === t.key ? '3px solid #059669' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{t.label}</span>
            {t.badge && (
              <span style={{
                background: t.badgeColor || (activeTab === t.key ? '#059669' : '#e2e8f0'),
                color: activeTab === t.key || t.badgeColor ? '#fff' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '999px'
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================================================================== */}
      {/* TAB 1: বই ক্যাটালগ ও রেজিস্টার (Catalog & Author-wise Registry) */}
      {/* ================================================================== */}
      {activeTab === 'catalog' && (
        <div>
          {/* Controls & Filter Bar */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              {/* Search input */}
              <input
                type="text"
                placeholder="🔍 বইয়ের নাম, লেখক বা কোড দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  minWidth: '220px',
                  flex: 1
                }}
              />

              {/* Author Filter Dropdown */}
              <select
                value={authorFilter}
                onChange={e => setAuthorFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="all">সব লেখক ({toBn(authorsList.length)} জন)</option>
                {authorsList.map(a => (
                  <option key={a} value={a}>✍️ {a}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="all">সকল ক্যাটাগরি</option>
                {BOOK_CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>

              {/* Shelf Filter */}
              <select
                value={shelfFilter}
                onChange={e => setShelfFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="all">সকল আলমারি/সেলফ</option>
                {SHELVES_LIST.map(s => (
                  <option key={s} value={s}>🗄️ {s}</option>
                ))}
              </select>

              {/* Sorting Option */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 600 }}
              >
                <option value="author_asc">লেখকের নামানুসারে (A-Z / অ-হ)</option>
                <option value="title_asc">বইয়ের নামানুসারে (A-Z)</option>
                <option value="acc_asc">অ্যাকসেশন নম্বরানুসারে</option>
                <option value="qty_desc">সর্বাধিক কপি সংখ্যা</option>
              </select>
            </div>

            {/* Export & Print actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={exportCatalogCSV}
                title="বইয়ের তালিকা CSV / Excel ফাইলে ডাউনলোড করুন"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📥 এক্সেল (CSV)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUploadCSVModal(true);
                  setCsvFile(null);
                  setCsvParsedBooks([]);
                  setCsvError('');
                }}
                title="CSV ফাইল থেকে বইয়ের তালিকা ও স্টক ক্যাটালগে আপলোড / ইমপোর্ট করুন"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📤 আপলোড (CSV)
              </button>

              <button
                type="button"
                onClick={exportLibraryReportCSV}
                title="লাইব্রেরি স্টক, অডিট ও ইনভেন্টরির পূর্ণাঙ্গ রিপোর্ট CSV ফরম্যাটে ডাউনলোড করুন"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #6366f1',
                  background: '#eef2ff',
                  color: '#4338ca',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📊 রিপোর্ট (CSV)
              </button>

              <button
                type="button"
                onClick={handlePrintCatalog}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                🖨️ ক্যাটালগ প্রিন্ট
              </button>
            </div>
          </div>

          {/* Book Catalog Table */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                📋 বইয়ের তালিকা ও স্টক রেজিস্টার (মোট প্রদর্শিত: {toBn(filteredBooks.length)} টি)
              </div>
              <small style={{ color: '#64748b' }}>
                * লেখকের নামানুসারে ক্রমানুসারে সাজানো রয়েছে
              </small>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px', width: '90px' }}>কোড নং</th>
                    <th style={{ padding: '10px 14px' }}>লেখকের নাম (Author)</th>
                    <th style={{ padding: '10px 14px' }}>বইয়ের নাম ও ক্যাটাগরি</th>
                    <th style={{ padding: '10px 14px' }}>প্রকাশনী / সংস্করণ</th>
                    <th style={{ padding: '10px 14px' }}>আলমারি / সেলফ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>মোট কপি</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>উপলব্ধ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((b, idx) => (
                    <tr
                      key={b.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#fff' : '#fafafa',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0284c7' }}>
                        {b.accession_no}
                      </td>

                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                        ✍️ {b.author}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{b.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {b.category}
                          </span>
                          {b.remarks && <span style={{ marginLeft: '6px' }}>• {b.remarks}</span>}
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '12px' }}>
                        {b.publisher || '—'}
                      </td>

                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '12px' }}>
                        🗄️ {b.shelf || '—'}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#1e293b' }}>
                        {toBn(b.quantity)}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: (b.available_quantity || 0) > 0 ? '#dcfce7' : '#fee2e2',
                          color: (b.available_quantity || 0) > 0 ? '#15803d' : '#b91c1c'
                        }}>
                          {(b.available_quantity || 0) > 0 ? `${toBn(b.available_quantity)} টি` : 'স্টক শেষ'}
                        </span>
                      </td>

                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => openIssueModal(b)}
                            disabled={(b.available_quantity || 0) <= 0}
                            title="শিক্ষার্থীকে ইস্যু করুন"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '5px',
                              border: 'none',
                              background: (b.available_quantity || 0) > 0 ? '#10b981' : '#cbd5e1',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: (b.available_quantity || 0) > 0 ? 'pointer' : 'not-allowed'
                            }}
                          >
                            ইস্যু
                          </button>

                          <button
                            type="button"
                            onClick={() => { setStockAddModalBook(b); setStockAddQty(1); }}
                            title="আরও নতুন কপি যুক্ত করুন"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '5px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#0284c7',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ➕ কপি
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditBookModal(b)}
                            title="বইয়ের তথ্য সম্পাদনা করুন"
                            style={{
                              padding: '4px 7px',
                              borderRadius: '5px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#475569',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => { setWriteOffModalBook(b); setWriteOffQty(1); setWriteOffReason('পাতা ছেঁড়া ও অপাঠ্য'); }}
                            title="নষ্ট / বাতিল বই রেজিস্টারভুক্ত করে বাদ দিন"
                            style={{
                              padding: '4px 7px',
                              borderRadius: '5px',
                              border: '1px solid #fca5a5',
                              background: '#fff',
                              color: '#dc2626',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            ⚠️ নষ্ট
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBook(b)}
                            title="বই মুছে ফেলুন"
                            style={{
                              padding: '4px 7px',
                              borderRadius: '5px',
                              border: 'none',
                              background: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredBooks.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        কোনো বই পাওয়া যায়নি। নতুন বই যুক্ত করতে <b>"নতুন বই এন্ট্রি"</b> বাটনে ক্লিক করুন।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 2: বই ইস্যু ও জমার হিসাব (Circulation) */}
      {/* ================================================================== */}
      {activeTab === 'issue' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                বই ইস্যু ও জমাদান ট্র্যাকিং
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                শিক্ষার্থীদের বই দেওয়ার তারিখ, নির্ধারিত জমাদানের তারিখ এবং ফেরত গ্রহণের হিসাব
              </p>
            </div>

            <button
              type="button"
              onClick={() => openIssueModal()}
              style={{
                background: '#059669',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
            >
              <span>📤</span> নতুন বই ইস্যু করুন
            </button>
          </div>

          {/* Active Loans Table */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>
                  📋 ইস্যু ও ফেরত রেজিস্টার ({toBn(loans.length)} টি রেকর্ড)
                </div>
                {selectedLoanIds.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, border: '1px solid #86efac' }}>
                      ☑️ {toBn(selectedLoanIds.length)} টি স্লিপ নির্বাচিত
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedLoanIds([])}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      টিক বাতিল
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    (নির্দিষ্ট স্লিপ প্রিন্ট করতে বামের ঘরে টিক দিন)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Print Action Buttons: 2 Slips or 4 Slips per A4 */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handlePrintBatchSlips(2)}
                    title="A4 সাইজের কাগজে একসাথে ২টি স্লিপ প্রিন্ট করুন"
                    style={{
                      background: selectedLoanIds.length > 0 ? '#059669' : '#f0fdf4',
                      color: selectedLoanIds.length > 0 ? '#ffffff' : '#047857',
                      border: '1.5px solid #059669',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span>🖨️</span> ২টি স্লিপ / পাতা (A4)
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintBatchSlips(4)}
                    title="A4 সাইজের কাগজে একসাথে ৪টি স্লিপ প্রিন্ট করুন"
                    style={{
                      background: selectedLoanIds.length > 0 ? '#0284c7' : '#f0f9ff',
                      color: selectedLoanIds.length > 0 ? '#ffffff' : '#0369a1',
                      border: '1.5px solid #0284c7',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span>🖨️</span> ৪টি স্লিপ / পাতা (A4)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSyncLoansWithStudentRegistry(students, true)}
                    title="ভর্তি ফরম (Student Database) থেকে শিক্ষার্থীদের মোবাইল নম্বর ও তথ্য সিঙ্ক করুন"
                    style={{
                      background: '#f8fafc',
                      color: '#0284c7',
                      border: '1.5px solid #0284c7',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span>🔄</span> ফরম থেকে সিঙ্ক
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', borderLeft: '1px solid #cbd5e1', paddingLeft: '10px' }}>
                  <span style={{ color: '#059669', fontWeight: 700 }}>🟢 চলমান: {toBn(loans.filter(l => !l.returned_at && getOverdueDays(l.due_at) <= 0).length)}</span>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 বকেয়া: {toBn(kpis.overdueCount)}</span>
                  <span style={{ color: '#64748b' }}>✅ জমা সম্পন্ন: {toBn(loans.filter(l => l.returned_at).length)}</span>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 10px', textAlign: 'center', width: '38px' }}>
                      <input
                        type="checkbox"
                        checked={loans.length > 0 && selectedLoanIds.length === loans.length}
                        onChange={handleToggleSelectAllLoans}
                        title={selectedLoanIds.length === loans.length ? "সব টিক বাতিল করুন" : "সবগুলোতে টিক দিন"}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#059669' }}
                      />
                    </th>
                    <th style={{ padding: '10px 14px' }}>শিক্ষার্থী পরিচিতি</th>
                    <th style={{ padding: '10px 14px' }}>বইয়ের নাম ও লেখক</th>
                    <th style={{ padding: '10px 14px' }}>কোড নং</th>
                    <th style={{ padding: '10px 14px' }}>ইস্যুর তারিখ</th>
                    <th style={{ padding: '10px 14px' }}>শেষ জমার তারিখ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>স্ট্যাটাস</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l, idx) => {
                    const overdue = getOverdueDays(l.due_at);
                    const isReturned = Boolean(l.returned_at);
                    const isSelected = selectedLoanIds.includes(l.id);
                    const info = getLoanStudentInfo(l);

                    return (
                      <tr
                        key={l.id || idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected
                            ? '#ecfdf5'
                            : isReturned ? '#fff' : overdue > 0 ? '#fef2f2' : idx % 2 === 0 ? '#fff' : '#fafafa',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectLoan(l.id)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#059669' }}
                          />
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{info.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            শ্রেণি {toBn(info.className)} • রোল {toBn(info.rollNo)} • আইডি: {info.studentUid}
                          </div>
                          {info.fatherName && (
                            <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '2px' }}>
                              👨‍👦 পিতা: {info.fatherName}
                            </div>
                          )}
                          {info.phone ? (
                            <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <a href={`tel:${info.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                📞 <b>{info.phone}</b>
                              </a>
                              <span style={{ fontSize: '9px', color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '3px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
                                ✓ ভর্তি ফরম
                              </span>
                            </div>
                          ) : null}
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{l.book_title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>✍️ {l.author}</div>
                        </td>

                        <td style={{ padding: '10px 14px', color: '#0284c7', fontWeight: 600 }}>
                          {l.accession_no}
                        </td>

                        <td style={{ padding: '10px 14px', color: '#475569' }}>
                          {formatDateBn(l.issued_at)}
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontWeight: overdue > 0 && !isReturned ? 700 : 500, color: overdue > 0 && !isReturned ? '#dc2626' : '#475569' }}>
                            {formatDateBn(l.due_at)}
                          </span>
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {isReturned ? (
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                              ✅ জমা: {formatDateBn(l.returned_at)}
                            </span>
                          ) : overdue > 0 ? (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                              ⚠️ {toBn(overdue)} দিন বকেয়া!
                            </span>
                          ) : (
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                              🟢 চলমান
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {!isReturned && (
                              <button
                                type="button"
                                onClick={() => openReturnModal(l)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#047857',
                                  color: '#fff',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                📥 ফেরত নিন
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setPrintReceiptLoan(l)}
                              title="ইস্যু/জমা স্লিপ প্রিন্ট"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#fff',
                                color: '#334155',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              🖨️ স্লিপ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {loans.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        কোনো ইস্যু রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 3: বকেয়া/অনাদায়ী তালিকা (Overdue Defaulters) */}
      {/* ================================================================== */}
      {activeTab === 'overdue' && (
        <div>
          <div style={{
            background: '#fff1f2',
            border: '1.5px solid #fecdd3',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⏰</span> সপ্তাহ বা মাস শেষে অনিষ্পন্ন বকেয়া বই রিপোর্ট
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#881337' }}>
                যে সকল শিক্ষার্থী নির্ধারিত মেয়াদ শেষে এখনো বই জমা দেয়নি তাদের তালিকা ও তাগাদা নোটিশ
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={overdueFilterDays}
                onChange={e => setOverdueFilterDays(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #fda4af', fontSize: '13px', background: '#fff', fontWeight: 600 }}
              >
                <option value="all">সকল বকেয়া শিক্ষার্থী ({toBn(kpis.overdueCount)} জন)</option>
                <option value="week">১ সপ্তাহের বেশি বকেয়া (৭+ দিন)</option>
                <option value="month">১ মাসের বেশি বকেয়া (৩০+ দিন)</option>
              </select>

              <select
                value={overdueClassFilter}
                onChange={e => setOverdueClassFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #fda4af', fontSize: '13px', background: '#fff' }}
              >
                <option value="all">সকল শ্রেণি</option>
                {['6', '7', '8', '9', '10'].map(c => (
                  <option key={c} value={c}>{toBn(c)}ম শ্রেণি</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleSyncLoansWithStudentRegistry(students, true)}
                title="ভর্তি ফরম (Student Database) থেকে শিক্ষার্থীদের মোবাইল নম্বর ও তথ্য সিঙ্ক করুন"
                style={{
                  background: '#fff',
                  color: '#059669',
                  border: '1.5px solid #059669',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(5,150,105,0.1)'
                }}
              >
                <span>🔄</span> ফরম থেকে মোবাইল সিঙ্ক করুন
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!filteredOverdueLoans.length) {
                    alert('বর্তমানে কোনো বকেয়া শিক্ষার্থী নেই।');
                    return;
                  }
                  setPrintDefaulterNotice({ all: true, list: filteredOverdueLoans });
                }}
                style={{
                  background: '#be123c',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🖨️ যৌথ তাগাদা তালিকা প্রিন্ট
              </button>
            </div>
          </div>

          {/* Overdue Table */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#fff1f2', borderBottom: '1.5px solid #fecdd3', color: '#9f1239', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>শিক্ষার্থীর নাম ও রোল</th>
                    <th style={{ padding: '10px 14px' }}>শ্রেণি ও আইডি</th>
                    <th style={{ padding: '10px 14px' }}>অভিভাবকের মোবাইল</th>
                    <th style={{ padding: '10px 14px' }}>বইয়ের নাম ও লেখক</th>
                    <th style={{ padding: '10px 14px' }}>ইস্যুর তারিখ</th>
                    <th style={{ padding: '10px 14px' }}>নির্ধারিত তারিখ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>বিলম্বিত দিন</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOverdueLoans.map((l, idx) => {
                    const days = getOverdueDays(l.due_at);
                    const info = getLoanStudentInfo(l);

                    return (
                      <tr
                        key={l.id || idx}
                        style={{
                          borderBottom: '1px solid #fee2e2',
                          background: idx % 2 === 0 ? '#fff' : '#fff5f5'
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#881337' }}>
                          {info.studentName}
                          <div style={{ fontSize: '11px', color: '#64748b' }}>রোল নং: {toBn(info.rollNo)}</div>
                          {info.fatherName && (
                            <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 500, marginTop: '2px' }}>
                              👨‍👦 পিতা: {info.fatherName}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ background: '#fecdd3', color: '#9f1239', padding: '2px 7px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                            {toBn(info.className)}ম শ্রেণি
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{info.studentUid}</div>
                        </td>

                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0369a1' }}>
                          {info.phone ? (
                            <div>
                              <a href={`tel:${info.phone}`} style={{ textDecoration: 'none', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                📞 <b>{info.phone}</b>
                              </a>
                              <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
                                ✓ ভর্তি ফরম সংযুক্ত
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>— নম্বর নেই</span>
                          )}
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{l.book_title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>✍️ {l.author} • কোড: {l.accession_no}</div>
                        </td>

                        <td style={{ padding: '10px 14px', color: '#475569' }}>
                          {formatDateBn(l.issued_at)}
                        </td>

                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#dc2626' }}>
                          {formatDateBn(l.due_at)}
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            background: days > 14 ? '#ef4444' : '#f97316',
                            color: '#fff',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}>
                            {toBn(days)} দিন অতিরিক্ত
                          </span>
                        </td>

                        <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setPrintDefaulterNotice({ single: true, loan: l })}
                              title="তাগাদা নোটিশ প্রিভিউ, প্রিন্ট ও ডিজিটাল বার্তা"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '5px',
                                border: '1px solid #be123c',
                                background: '#fff',
                                color: '#be123c',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <span>📨</span> তাগাদা নোটিশ
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendWhatsApp(l)}
                              title="পিতা/অভিভাবকের WhatsApp এ সরাসরি তাগাদা বার্তা পাঠান"
                              style={{
                                padding: '4px 7px',
                                borderRadius: '5px',
                                border: 'none',
                                background: '#25D366',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              💬 WA
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenSmsModal(l)}
                              title="পিতা/অভিভাবকের মোবাইলে সংক্ষিপ্ত SMS পাঠান"
                              style={{
                                padding: '4px 7px',
                                borderRadius: '5px',
                                border: 'none',
                                background: '#0284c7',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✉️ SMS
                            </button>

                            <button
                              type="button"
                              onClick={() => openReturnModal(l)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '5px',
                                border: 'none',
                                background: '#059669',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              📥 জমা নিন
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOverdueLoans.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#15803d', fontWeight: 600 }}>
                        🎉 চমৎকার! নির্ধারিত মেয়াদ শেষে কোনো বকেয়া বই নেই। সকল শিক্ষার্থী যথাসময়ে বই জমা দিয়েছে।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 4: সাপ্তাহিক ও মাসিক রিপোর্ট (Weekly & Monthly Reports) */}
      {/* ================================================================== */}
      {activeTab === 'reports' && (
        <div>
          {/* Report Configuration Bar */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '18px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#334155' }}>রিপোর্টের সময়কাল:</span>

              <button
                type="button"
                onClick={() => setReportType('weekly')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: reportType === 'weekly' ? '#047857' : '#fff',
                  color: reportType === 'weekly' ? '#fff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📅 সাপ্তাহিক রিপোর্ট
              </button>

              <button
                type="button"
                onClick={() => setReportType('monthly')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: reportType === 'monthly' ? '#047857' : '#fff',
                  color: reportType === 'monthly' ? '#fff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🗓️ মাসিক রিপোর্ট
              </button>

              <button
                type="button"
                onClick={() => setReportType('custom')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: reportType === 'custom' ? '#047857' : '#fff',
                  color: reportType === 'custom' ? '#fff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📆 কাস্টম তারিখ পরিসীমা
              </button>

              {reportType === 'monthly' && (
                <input
                  type="month"
                  value={reportMonth}
                  onChange={e => setReportMonth(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              )}

              {reportType === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <span>থেকে</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPrintReportMode(true)}
              style={{
                background: '#0369a1',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🖨️ পূর্ণাঙ্গ প্রতিবেদন প্রিন্ট করুন
            </button>
          </div>

          {/* Report Metrics Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>নির্দিষ্ট সময়ে মোট বই ইস্যু</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#047857', margin: '4px 0' }}>
                {toBn(reportData.issuedInPeriod.length)} <small style={{ fontSize: '13px' }}>টি</small>
              </div>
              <div style={{ fontSize: '11px', color: '#059669' }}>সফলভাবে বিতরণকৃত</div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>নির্দিষ্ট সময়ে বই ফেরত জমা</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
                {toBn(reportData.returnedInPeriod.length)} <small style={{ fontSize: '13px' }}>টি</small>
              </div>
              <div style={{ fontSize: '11px', color: '#16a34a' }}>লাইব্রেরিতে জমা প্রাপ্ত</div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>বর্তমান অনিষ্পন্ন বকেয়া বই</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>
                {toBn(reportData.overdueInPeriod.length)} <small style={{ fontSize: '13px' }}>টি</small>
              </div>
              <div style={{ fontSize: '11px', color: '#b91c1c' }}>তাগাদা প্রক্রিয়াধীন</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>নষ্ট/বাতিল বইয়ের সংখ্যা</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#334155', margin: '4px 0' }}>
                {toBn(reportData.damagedInPeriod.length)} <small style={{ fontSize: '13px' }}>টি</small>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>অডিট ও ক্ষতি রেজিস্টার</div>
            </div>
          </div>

          {/* Expert Recommendations: Star Readers & Popular Books Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
            {/* Top Readers Award Card */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏆</span> সেরা পাঠক শিক্ষার্থী (Top Active Readers)
                </h3>
                <span style={{ fontSize: '11px', color: '#047857', background: '#dcfce7', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  পাঠাভ্যাস স্বীকৃতি
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                বিদ্যালয়ের লাইব্রেরি থেকে সর্বাধিক বই পড়ে নিয়মিত পাঠাভ্যাস বজায় রাখা শীর্ষ শিক্ষার্থীরা:
              </div>
              <div>
                {reportData.topReaders.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < reportData.topReaders.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#f1f5f9',
                        color: i === 0 || i === 2 ? '#fff' : '#334155',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {toBn(i + 1)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{r.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>শ্রেণি {toBn(r.class_name)} • রোল নং {toBn(r.roll)}</div>
                      </div>
                    </div>
                    <span style={{ background: '#f0fdf4', color: '#15803d', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                      {toBn(r.count)} টি বই পঠিত
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Books Card */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📚</span> সর্বাধিক পঠিত বই (Most Borrowed Titles)
                </h3>
                <span style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  শিক্ষার্থী পছন্দ
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                যেসব বই শিক্ষার্থীরা সবচেয়ে বেশি আগ্রহ নিয়ে লাইব্রেরি থেকে ইস্যু করেছে:
              </div>
              <div>
                {reportData.topBooks.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < reportData.topBooks.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{b.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>লেখক: {b.author || '—'}</div>
                    </div>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                      {toBn(b.count)} বার ইস্যু
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 5: নষ্ট ও বাতিল বই রেজিস্টার (Damaged / Discarded Write-off) */}
      {/* ================================================================== */}
      {activeTab === 'damaged' && (
        <div>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                ⚠️ নষ্ট, বাতিল ও ক্ষতিগ্রস্ত বই রেজিস্টার
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                ছেঁড়া, ক্ষতিগ্রস্ত বা হারিয়ে যাওয়া বই অডিট ও জবাবদিহিতা নিশ্চিতকরণ রেজিস্টার
              </p>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
              মোট বাতিল কপি: <span style={{ color: '#dc2626' }}>{toBn(kpis.totalDamagedCopies)} টি</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>কোড নং</th>
                    <th style={{ padding: '10px 14px' }}>বইয়ের নাম ও লেখক</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>বাতিল কপি</th>
                    <th style={{ padding: '10px 14px' }}>বাতিলের তারিখ</th>
                    <th style={{ padding: '10px 14px' }}>নষ্ট হওয়ার কারণ</th>
                    <th style={{ padding: '10px 14px' }}>অনুমোদনকারী</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>পুনরুদ্ধার</th>
                  </tr>
                </thead>
                <tbody>
                  {damaged.map((d, idx) => (
                    <tr key={d.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0284c7' }}>
                        {d.accession_no}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>✍️ {d.author}</div>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>
                        {toBn(d.quantity)} টি
                      </td>

                      <td style={{ padding: '10px 14px', color: '#475569' }}>
                        {formatDateBn(d.damaged_at)}
                      </td>

                      <td style={{ padding: '10px 14px', color: '#b91c1c', fontWeight: 600 }}>
                        {d.reason}
                      </td>

                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#334155' }}>
                        <div>{d.authorized_by}</div>
                        <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                          {d.head_approval || 'অনুমোদিত'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRestoreDamaged(d)}
                          title="মেরামত বা ক্ষতিপূরণ সাপেক্ষে পুনরায় সক্রিয় স্টকে যুক্ত করুন"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '5px',
                            border: '1px solid #10b981',
                            background: '#ecfdf5',
                            color: '#065f46',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ♻️ স্টকে পুনর্বহাল
                        </button>
                      </td>
                    </tr>
                  ))}

                  {damaged.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        বর্তমানে কোনো নষ্ট বা বাতিল বইয়ের রেকর্ড নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 1: নতুন বই এন্ট্রি / সম্পাদনা মডাল (Add / Edit Book Modal) */}
      {/* ================================================================== */}
      {showAddBookModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {editingBook ? '✏️ বইয়ের তথ্য সম্পাদনা' : '➕ নতুন বই এন্ট্রি (লেখকের নামানুসারে)'}
                </h3>
                <small style={{ color: '#64748b' }}>
                  গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক রেজিস্ট্রি ফর্ম
                </small>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    ✍️ লেখকের নাম <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রবীন্দ্রনাথ ঠাকুর, শরৎচন্দ্র চট্টোপাধ্যায়"
                    value={bookForm.author}
                    onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #059669', fontSize: '14px' }}
                  />
                  <small style={{ color: '#047857', fontSize: '11px' }}>* লেখকের নামানুসারে ক্যাটালগ স্বয়ংক্রিয়ভাবে সাজানো হবে</small>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    📖 বইয়ের নাম / শিরোনাম <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: গীতাঞ্জলি, দেবদাস, অসমাপ্ত আত্মজীবনী"
                    value={bookForm.title}
                    onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    🏷️ অ্যাকসেশন নম্বর / বুক কোড
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: MAG-BK-021"
                    value={bookForm.accession_no}
                    onChange={e => setBookForm({ ...bookForm, accession_no: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    🗂️ বিষয় / ক্যাটাগরি
                  </label>
                  <select
                    value={bookForm.category}
                    onChange={e => setBookForm({ ...bookForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {BOOK_CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    🗄️ আলমারি / সেলফ নম্বর
                  </label>
                  <select
                    value={bookForm.shelf}
                    onChange={e => setBookForm({ ...bookForm, shelf: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {SHELVES_LIST.map(s => (
                      <option key={s} value={s}>🗄️ {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    📦 মোট কপির সংখ্যা <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookForm.quantity}
                    onChange={e => setBookForm({ ...bookForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    🏛️ প্রকাশনী / সংস্করণ
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: বাংলা একাডেমি, অনন্যা প্রকাশনী"
                    value={bookForm.publisher}
                    onChange={e => setBookForm({ ...bookForm, publisher: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    🎁 বই প্রাপ্তির উৎস
                  </label>
                  <select
                    value={bookForm.source}
                    onChange={e => setBookForm({ ...bookForm, source: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {ACQUISITION_SOURCES.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    💰 আনুমানিক মূল্য (টাকা - ঐচ্ছিক)
                  </label>
                  <input
                    type="number"
                    placeholder="যেমন: ২৫০"
                    value={bookForm.price}
                    onChange={e => setBookForm({ ...bookForm, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                    📝 সংক্ষিপ্ত মন্তব্য / বিশেষ নোট
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: চিত্রিত সংস্করণ, মুক্তিযুদ্ধ কর্নার"
                    value={bookForm.remarks}
                    onChange={e => setBookForm({ ...bookForm, remarks: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  {editingBook ? 'হালনাগাদ সম্পন্ন করুন' : 'বই ক্যাটালগে সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: আপলোড (CSV) - Bulk Books Import from CSV */}
      {/* ================================================================== */}
      {showUploadCSVModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            maxWidth: '780px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
              color: '#fff',
              padding: '16px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📤</span> লাইব্রেরি বই ক্যাটালগ আপলোড (CSV Import)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.9 }}>
                  এক্সেল বা স্প্রেডশিট থেকে তৈরি CSV ফাইলের মাধ্যমে একসাথে শত শত বই স্বয়ংক্রিয়ভাবে ক্যাটালগে যুক্ত করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadCSVModal(false);
                  setCsvFile(null);
                  setCsvParsedBooks([]);
                  setCsvError('');
                }}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Sample Download Card */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534' }}>
                    💡 সঠিক ফরম্যাট বজায় রাখতে নমুনা টেমপ্লেট ব্যবহার করুন
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                    কলামসমূহ: Accession No, Author, Title, Category, Shelf, Total Copies, Price, Source, Remarks
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  style={{
                    background: '#15803d',
                    color: '#fff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  📥 নমুনা CSV ডাউনলোড
                </button>
              </div>

              {/* File Upload Dropzone */}
              <div style={{
                border: '2px dashed #94a3b8',
                borderRadius: '10px',
                padding: '24px 16px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'border-color 0.2s'
              }}>
                <input
                  type="file"
                  id="library-csv-file-input"
                  accept=".csv,text/csv"
                  onChange={handleCSVFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="library-csv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                    {csvFile ? `নির্বাচিত ফাইল: ${csvFile.name}` : 'এখানে ক্লিক করে আপনার .CSV ফাইলটি নির্বাচন করুন'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {csvFile ? `ফাইলের আকার: ${(csvFile.size / 1024).toFixed(1)} KB` : 'সমর্থিত ফাইল: কমা সেপারেটেড ভ্যালুজ (.csv)'}
                  </div>
                </label>
              </div>

              {/* Error Alert */}
              {csvError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>{csvError}</span>
                </div>
              )}

              {/* Parsed Books Preview Table */}
              {csvParsedBooks.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>
                      ✅ প্রস্তুতকৃত বইয়ের তালিকা ({toBn(csvParsedBooks.length)}টি বই পাওয়া গেছে)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      আপলোড নিশ্চিত করার পূর্বে ডেটা যাচাই করুন
                    </div>
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 }}>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1' }}>কোড নং</th>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1' }}>বইয়ের নাম</th>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1' }}>লেখক</th>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1' }}>ক্যাটাগরি</th>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1' }}>আলমারি/সেলফ</th>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>কপি</th>
                          <th style={{ padding: '7px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>মূল্য</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvParsedBooks.map((b, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0284c7' }}>{b.accession_no}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0f172a' }}>{b.title}</td>
                            <td style={{ padding: '6px 10px', color: '#475569' }}>{b.author}</td>
                            <td style={{ padding: '6px 10px' }}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{b.category}</span></td>
                            <td style={{ padding: '6px 10px', color: '#64748b', fontSize: '11.5px' }}>{b.shelf}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, color: '#047857' }}>{toBn(b.quantity)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{b.price ? `৳ ${toBn(b.price)}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '14px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowUploadCSVModal(false);
                  setCsvFile(null);
                  setCsvParsedBooks([]);
                  setCsvError('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={handleConfirmImportCSV}
                disabled={!csvParsedBooks.length}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: csvParsedBooks.length ? '#059669' : '#94a3b8',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: csvParsedBooks.length ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>💾</span> ক্যাটালগে আপলোড সম্পন্ন করুন {csvParsedBooks.length ? `(${toBn(csvParsedBooks.length)}টি বই)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 2: আরও বই যুক্ত করুন (Add More Copies Stock Modal) */}
      {/* ================================================================== */}
      {stockAddModalBook && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '420px',
            width: '100%',
            padding: '22px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              ➕ অতিরিক্ত কপি যুক্ত করুন
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#475569' }}>
              বই: <b>"{stockAddModalBook.title}"</b> (লেখক: {stockAddModalBook.author})
              <br />
              বর্তমান মোট কপি: <b>{toBn(stockAddModalBook.quantity)} টি</b> • স্টকে আছে: <b>{toBn(stockAddModalBook.available_quantity)} টি</b>
            </p>

            <form onSubmit={handleAddStock}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  কতটি নতুন কপি যোগ করতে চান?
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAddQty}
                  onChange={e => setStockAddQty(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #0284c7', fontSize: '16px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStockAddModalBook(null)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  কপি যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 3: নষ্ট/বাতিল বই বাদ দেওয়া (Write-off Damaged Copies) */}
      {/* ================================================================== */}
      {writeOffModalBook && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '22px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#dc2626' }}>
              ⚠️ নষ্ট / বাতিল বই বাদ দিন ও রেজিস্টারভুক্ত করুন
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#475569' }}>
              বই: <b>"{writeOffModalBook.title}"</b> (লেখক: {writeOffModalBook.author})
              <br />
              বর্তমান মোট কপি: <b>{toBn(writeOffModalBook.quantity)} টি</b> (উপলব্ধ: {toBn(writeOffModalBook.available_quantity)} টি)
            </p>

            <form onSubmit={handleWriteOffDamaged}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  নষ্ট / বাতিল কপির সংখ্যা:
                </label>
                <input
                  type="number"
                  min="1"
                  max={writeOffModalBook.available_quantity || 1}
                  required
                  value={writeOffQty}
                  onChange={e => setWriteOffQty(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', fontSize: '15px', fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  বাতিলের সুনির্দিষ্ট কারণ (অডিট নোট):
                </label>
                <select
                  value={writeOffReason}
                  onChange={e => setWriteOffReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="পাতা ছেঁড়া ও অপাঠ্য">পাতা ছেঁড়া ও অপাঠ্য</option>
                  <option value="বৃষ্টির পানিতে ভিজে বিনষ্ট">বৃষ্টির পানিতে ভিজে বিনষ্ট</option>
                  <option value="উইপোকায় কাটা ও মারাত্মক ক্ষতিগ্রস্ত">উইপোকায় কাটা ও মারাত্মক ক্ষতিগ্রস্ত</option>
                  <option value="বাঁধাই নষ্ট ও পৃষ্ঠা নিখোঁজ">বাঁধাই নষ্ট ও পৃষ্ঠা নিখোঁজ</option>
                  <option value="শিক্ষার্থী হারিয়ে ফেলেছে (ক্ষতিপূরণ গৃহীত)">শিক্ষার্থী হারিয়ে ফেলেছে (ক্ষতিপূরণ গৃহীত)</option>
                  <option value="পুরাতন ও পাঠ অনুপযোগী">পুরাতন ও পাঠ অনুপযোগী</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setWriteOffModalBook(null)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  স্টক থেকে বাদ দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 4: বই ইস্যু মডাল (Issue Book Modal with Student Picker) */}
      {/* ================================================================== */}
      {showIssueModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#065f46' }}>
                  📤 শিক্ষার্থীকে লাইব্রেরি বই ইস্যু
                </h3>
                <small style={{ color: '#64748b' }}>
                  শিক্ষার্থী নির্বাচন করে নির্ধারিত মেয়াদে বই বিতরণ
                </small>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueBookSubmit}>
              {/* Step 1: Select Student */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '8px' }}>
                  ১. শিক্ষার্থী নির্বাচন করুন:
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={issueFilterClass}
                    onChange={e => setIssueFilterClass(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                  >
                    <option value="all">সকল শ্রেণি</option>
                    {['6', '7', '8', '9', '10'].map(c => (
                      <option key={c} value={c}>{toBn(c)}ম শ্রেণি</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="নাম বা রোল দিয়ে শিক্ষার্থী খুঁজুন..."
                    value={issueFilterStudentSearch}
                    onChange={e => setIssueFilterStudentSearch(e.target.value)}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                <select
                  required
                  value={issueForm.student_id}
                  onChange={e => setIssueForm({ ...issueForm, student_id: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #0284c7', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                >
                  <option value="">-- শিক্ষার্থী নির্বাচন করুন (ভর্তি ফরম ডাটাবেজ) --</option>
                  {filteredStudentsForIssue.map(s => {
                    const phoneDisplay = normalizePhoneNumber(s.guardian_phone || s.father_mobile || s.emergency_phone || '');
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name_bn} • শ্রেণি {toBn(s.class_name)} • রোল {toBn(s.roll_no)} (পিতা: {s.father_name || '—'} • মোবা: {phoneDisplay || '—'})
                      </option>
                    );
                  })}
                </select>

                {/* Linked Student Admission Form Profile Card */}
                {selectedStudentObj && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📋</span> ভর্তি ফরম থেকে প্রাপ্ত শিক্ষার্থীর প্রোফাইল
                      </span>
                      <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        ✓ ভর্তি ফরম সংযুক্ত
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '12px', color: '#1e293b' }}>
                      <div><b>শিক্ষার্থীর নাম:</b> {selectedStudentObj.name_bn}</div>
                      <div><b>শ্রেণি ও রোল:</b> {toBn(selectedStudentObj.class_name)}ম শ্রেণি • রোল: {toBn(selectedStudentObj.roll_no)}</div>
                      <div><b>পিতার নাম:</b> {selectedStudentObj.father_name || selectedStudentObj.guardian_name || '—'}</div>
                      <div><b>শিক্ষার্থী আইডি:</b> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>{selectedStudentObj.student_id || selectedStudentObj.id}</span></div>
                      <div style={{ gridColumn: 'span 2', fontSize: '11.5px', color: '#475569' }}><b>ঠিকানা:</b> {selectedStudentObj.address || selectedStudentObj.current_village || '—'}</div>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #86efac' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                        📱 পিতা/অভিভাবকের মোবাইল নম্বর (ভর্তি ফরম থেকে স্বয়ংক্রিয়ভাবে যুক্ত, প্রয়োজনে সম্পাদনযোগ্য):
                      </label>
                      <input
                        type="text"
                        required
                        value={issueForm.guardian_phone}
                        onChange={e => setIssueForm({ ...issueForm, guardian_phone: e.target.value })}
                        placeholder="যেমন: 01710689846"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1.5px solid #059669',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#065f46',
                          background: '#fff',
                          boxSizing: 'border-box'
                        }}
                      />
                      <small style={{ color: '#047857', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                        💡 এই নম্বরেই সরাসরি তাগাদা নোটিশ, WhatsApp বার্তা ও SMS স্বয়ংক্রিয়ভাবে পাঠানো হবে।
                      </small>
                    </div>
                  </div>
                )}

                {/* Overdue Alert if student has prior overdue book */}
                {studentOutstandingLoans.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#fef2f2',
                    border: '1px solid #fecdd3',
                    color: '#991b1b',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    ⚠️ সতর্কতা: এই শিক্ষার্থীর কাছে ইতোমধ্যে {toBn(studentOutstandingLoans.length)}টি বই ইস্যুকৃত অবস্থায় রয়েছে ({studentOutstandingLoans.map(l => `"${l.book_title}"`).join(', ')})।
                  </div>
                )}
              </div>

              {/* Step 2: Select Book */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '8px' }}>
                  ২. লাইব্রেরির বই নির্বাচন করুন (শুধুমাত্র স্টকে উপলব্ধ বই):
                </div>

                <select
                  required
                  value={issueForm.book_id}
                  onChange={e => setIssueForm({ ...issueForm, book_id: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #059669', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                >
                  <option value="">-- বই নির্বাচন করুন --</option>
                  {books.filter(b => (b.available_quantity || 0) > 0).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} — লেখক: {b.author} ({b.accession_no} • স্টকে আছে: {toBn(b.available_quantity)} টি)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Dates & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    📅 ইস্যু তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={issueForm.issued_at}
                    onChange={e => setIssueForm({ ...issueForm, issued_at: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    ⌛ জমাদানের মেয়াদ
                  </label>
                  <select
                    value={issueForm.duration_days}
                    onChange={e => setIssueForm({ ...issueForm, duration_days: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="7">৭ দিন (১ সপ্তাহ)</option>
                    <option value="14">১৪ দিন (২ সপ্তাহ)</option>
                    <option value="21">২১ দিন (৩ সপ্তাহ)</option>
                    <option value="30">৩০ দিন (১ মাস)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#b91c1c' }}>
                  ⏰ নির্ধারিত জমাদানের শেষ তারিখ (Due Date):
                </label>
                <input
                  type="date"
                  required
                  value={issueForm.due_at}
                  onChange={e => setIssueForm({ ...issueForm, due_at: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #dc2626', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  ইস্যু সংক্রান্ত নোট / মন্তব্য
                </label>
                <input
                  type="text"
                  placeholder="যেমন: নিয়মিত লাইব্রেরি রিডিং, বিতর্ক প্রতিযোগিতা"
                  value={issueForm.remarks}
                  onChange={e => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  বই ইস্যু নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 5: বই ফেরত গ্রহণ মডাল (Return Book Modal) */}
      {/* ================================================================== */}
      {returnModalLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '22px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#047857' }}>
              📥 লাইব্রেরি বই ফেরত গ্রহণ
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#475569' }}>
              শিক্ষার্থী: <b>{returnModalLoan.name_bn}</b> (শ্রেণি: {toBn(returnModalLoan.class_name)}, রোল: {toBn(returnModalLoan.roll_no)})
              <br />
              বই: <b>"{returnModalLoan.book_title}"</b> (লেখক: {returnModalLoan.author})
              <br />
              নির্ধারিত জমাদান তারিখ ছিল: <b>{formatDateBn(returnModalLoan.due_at)}</b>
              {getOverdueDays(returnModalLoan.due_at) > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  ⚠️ {toBn(getOverdueDays(returnModalLoan.due_at))} দিন বিলম্বে জমা দেওয়া হচ্ছে!
                </span>
              )}
            </p>

            <form onSubmit={handleReturnSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  বইয়ের কন্ডিশন / অবস্থা:
                </label>
                <select
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 600 }}
                >
                  <option value="ভালো">ভালো ও অক্ষত (পুনরায় শেলফে যাবে)</option>
                  <option value="সামান্য ক্ষতি">সামান্য পাতা ভাঁজ (পুনরায় শেলফে যাবে)</option>
                  <option value="নষ্ট / ছেঁড়া">মারাত্মক নষ্ট ও ছেঁড়া (নষ্ট রেজিস্টারে যাবে)</option>
                  <option value="হারিয়ে গেছে">হারিয়ে গেছে (ক্ষতিপূরণ প্রযোজ্য)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  বিলম্ব ফি / জরিমানা (টাকা - প্রযোজ্য হলে):
                </label>
                <input
                  type="number"
                  min="0"
                  value={returnFine}
                  onChange={e => setReturnFine(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700 }}
                />
                <small style={{ color: '#64748b' }}>* সাধারণত দিন প্রতি ২ টাকা হারে নির্ধারণ করা হয়</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReturnModalLoan(null)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#047857', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  বই জমা সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PRINT VIEW 1: বইয়ের ক্যাটালগ প্রিন্ট (Print Catalog Modal) */}
      {/* ================================================================== */}
      {printCatalogMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }} className="no-print">
              <button
                type="button"
                onClick={handlePrintCatalog}
                style={{ background: '#059669', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ প্রিন্ট করুন / PDF সেভ
              </button>
              <button
                type="button"
                onClick={() => setPrintCatalogMode(false)}
                style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            {/* School Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px double #0f172a', paddingBottom: '14px', marginBottom: '18px' }}>
              <img src={schoolLogo} alt="Logo" style={{ width: '56px', height: '56px', margin: '0 auto 6px' }} />
              <h2 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: 800, color: '#064e3b' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155' }}>
                ডাকঘর: মগড়া, উপজেলা: কালিহাতি, জেলা: টাঙ্গাইল • EIIN: 114290 • স্থাপিত: ১৯৪৬ খ্রি.
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: 700, background: '#f1f5f9', display: 'inline-block', padding: '3px 16px', borderRadius: '4px' }}>
                কেন্দ্রীয় লাইব্রেরি ও স্টক রেজিস্টার (লেখকের নামানুসারে)
              </h3>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                প্রিন্টের তারিখ: {formatDateBn(new Date().toISOString().slice(0, 10))} • মোট বইয়ের টাইটেল: {toBn(filteredBooks.length)} টি
              </div>
            </div>

            {/* Printable Catalog Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>ক্র.</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>কোড নং</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>লেখকের নাম</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>বইয়ের নাম</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>ক্যাটাগরি</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>আলমারি</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>মোট</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>উপলব্ধ</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{toBn(idx + 1)}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px', fontWeight: 600 }}>{b.accession_no}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px', fontWeight: 700 }}>{b.author}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{b.title}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{b.category}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{b.shelf}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center', fontWeight: 600 }}>{toBn(b.quantity)}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center', fontWeight: 600 }}>{toBn(b.available_quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Official Signatures */}
            <table style={{ width: '100%', border: 'none', marginTop: '60px', paddingTop: '10px' }}>
              <tbody>
                <tr style={{ border: 'none', background: 'transparent' }}>
                  <td style={{ width: '250px', textAlign: 'left', border: 'none', padding: 0, verticalAlign: 'top' }}>
                    <div style={{ textAlign: 'center', width: '220px', borderTop: '1.5px solid #000', paddingTop: '5px' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{LIBRARIAN_TEACHER.name_bn}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569' }}>গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</p>
                      <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#64748b' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
                    </div>
                  </td>
                  <td style={{ border: 'none', padding: 0 }}></td>
                  <td style={{ width: '250px', textAlign: 'right', border: 'none', padding: 0, verticalAlign: 'top' }}>
                    <div style={{ textAlign: 'center', width: '220px', borderTop: '1.5px solid #000', paddingTop: '5px', marginLeft: 'auto' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>প্রধান শিক্ষক</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
                      <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#64748b' }}>কালিহাতি, টাঙ্গাইল</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PRINT VIEW 2: তাগাদা নোটিশ প্রিন্ট (Overdue Defaulter Notice Modal) */}
      {/* ================================================================== */}
      {printDefaulterNotice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px'
            }} className="no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={triggerBrowserPrint}
                    style={{ background: '#be123c', color: '#fff', padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <span>🖨️</span> নোটিশ প্রিন্ট
                  </button>

                  {printDefaulterNotice.single && printDefaulterNotice.loan && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(printDefaulterNotice.loan)}
                        title="পিতা/অভিভাবকের WhatsApp নাম্বারে নোটিশ পাঠান"
                        style={{ background: '#25D366', color: '#fff', padding: '7px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(37,211,102,0.3)' }}
                      >
                        <span>💬</span> WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenSmsModal(printDefaulterNotice.loan)}
                        title="পিতা/অভিভাবকের মোবাইলে সংক্ষিপ্ত SMS পাঠান"
                        style={{ background: '#0284c7', color: '#fff', padding: '7px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(2,132,199,0.3)' }}
                      >
                        <span>✉️</span> সংক্ষিপ্ত SMS
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessenger(printDefaulterNotice.loan)}
                        title="পিতা/অভিভাবকের Messenger এ পাঠান"
                        style={{ background: '#0084FF', color: '#fff', padding: '7px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span>⚡</span> Messenger
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendImo(printDefaulterNotice.loan)}
                        title="পিতা/অভিভাবকের Imo নাম্বারে পাঠান"
                        style={{ background: '#0ea5e9', color: '#fff', padding: '7px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span>📞</span> Imo
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendTelegram(printDefaulterNotice.loan)}
                        title="পিতা/অভিভাবকের Telegram এ পাঠান"
                        style={{ background: '#229ED9', color: '#fff', padding: '7px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span>✈️</span> Telegram
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyNoticeText(printDefaulterNotice.loan)}
                        title="সম্পূর্ণ নোটিশ কপি করুন"
                        style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '7px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        📋 কপি
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setPrintDefaulterNotice(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', color: '#475569' }}
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              {printDefaulterNotice.single && printDefaulterNotice.loan && (
                <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                  {(() => {
                    const info = getLoanStudentInfo(printDefaulterNotice.loan);
                    return (
                      <>
                        <span>📲 পিতা/অভিভাবকের মোবাইল: <b style={{ color: '#0369a1', fontFamily: 'monospace', fontSize: '12px' }}>{info.phone || '— (ভর্তি ফরমে উল্লেখ নেই)'}</b></span>
                        {info.isLinked && <span style={{ color: '#059669', fontSize: '11px', fontWeight: 700, background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #86efac' }}>✓ ভর্তি ফরম ডাটাবেজ সংযুক্ত</span>}
                        <span style={{ color: '#059669', fontSize: '11px', fontWeight: 600 }}>• উপরের বাটনে ক্লিক করে সরাসরি WhatsApp, SMS, Messenger, Imo বা Telegram এ তাগাদা বার্তা পাঠানো যাবে</span>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #be123c', paddingBottom: '12px', marginBottom: '18px' }}>
              <img src={schoolLogo} alt="Logo" style={{ width: '50px', height: '50px', margin: '0 auto 4px' }} />
              <h2 style={{ margin: '0 0 2px', fontSize: '19px', fontWeight: 800, color: '#be123c' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
              </h2>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155' }}>
                কেন্দ্রীয় লাইব্রেরি শাখা • EIIN: 114290 • কালিহাতি, টাঙ্গাইল
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '14px', fontWeight: 800, background: '#fee2e2', color: '#991b1b', display: 'inline-block', padding: '3px 14px', borderRadius: '4px' }}>
                জরুরি তাগাদা নোটিশ: লাইব্রেরি বই ফেরত সংক্রান্ত
              </h3>
            </div>

            {printDefaulterNotice.single && printDefaulterNotice.loan ? (
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#1e293b' }}>
                {(() => {
                  const info = getLoanStudentInfo(printDefaulterNotice.loan);
                  return (
                    <>
                      <p><b>স্মারক নং:</b> MAG/LIB/{new Date().getFullYear()}/{printDefaulterNotice.loan.accession_no} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>তারিখ:</b> {formatDateBn(new Date().toISOString().slice(0, 10))}</p>
                      <p><b>প্রাপক:</b> {info.fatherName ? `${info.fatherName} (শিক্ষার্থী: ${info.studentName}-এর পিতা/অভিভাবক)` : `${info.studentName}-এর অভিভাবক`} <br />
                        <b>শিক্ষার্থী:</b> {info.studentName} <br />
                        <b>শ্রেণি:</b> {toBn(info.className)}ম শ্রেণি, <b>রোল নং:</b> {toBn(info.rollNo)} (আইডি: {info.studentUid}) <br />
                        <b>অভিভাবকের মোবাইল:</b> <span style={{ color: '#0369a1', fontWeight: 700 }}>{info.phone || '— (ভর্তি ফরমে যুক্ত করা হয়নি)'}</span> {info.isLinked && <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>✓ ভর্তি ফরম সংযুক্ত</span>}
                      </p>
                    </>
                  );
                })()}

                <p>
                  এতদ্বারা তোমাকে এবং তোমার অভিভাবককে জানানো যাচ্ছে যে, তুমি বিদ্যালয়ের লাইব্রেরি থেকে নিম্নবর্ণিত বইটি অধ্যয়নের উদ্দেশ্যে গ্রহণ করেছিলে। নির্ধারিত মেয়াদ শেষ হলেও অদ্যবধি বইটি লাইব্রেরিতে জমা দেওয়া হয়নি:
                </p>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', margin: '12px 0' }}>
                  <div>📖 <b>বইয়ের নাম:</b> {printDefaulterNotice.loan.book_title}</div>
                  <div>✍️ <b>লেখক:</b> {printDefaulterNotice.loan.author}</div>
                  <div>🏷️ <b>অ্যাকসেশন কোড:</b> {printDefaulterNotice.loan.accession_no}</div>
                  <div>📅 <b>ইস্যুর তারিখ:</b> {formatDateBn(printDefaulterNotice.loan.issued_at)}</div>
                  <div>⏰ <b>নির্ধারিত জমাদানের তারিখ:</b> {formatDateBn(printDefaulterNotice.loan.due_at)}</div>
                  <div style={{ color: '#dc2626', fontWeight: 700, marginTop: '4px' }}>
                    ⚠️ বিলম্বের সময়সীমা: {toBn(getOverdueDays(printDefaulterNotice.loan.due_at))} দিন অতিবাহিত হয়েছে
                  </div>
                </div>

                <p>
                  অতএব, নোটিশ প্রাপ্তির <b>৩ (তিন) কার্যদিবসের মধ্যে</b> বইটি অক্ষত অবস্থায় লাইব্রেরিতে জমা দেওয়ার জন্য নির্দেশ দেওয়া হলো। অন্যথায় বিদ্যালয়ের প্রচলিত নিয়ম অনুযায়ী ব্যবস্থা গ্রহণ করা হবে।
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', marginBottom: '10px' }}>
                  তারিখ: {formatDateBn(new Date().toISOString().slice(0, 10))} • সপ্তাহ/মাস শেষে অনাদায়ী বই ও সংশ্লিষ্ট শিক্ষার্থীদের যৌথ বিবরণী:
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#fee2e2' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>ক্র.</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>শিক্ষার্থীর নাম</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>শ্রেণি ও রোল</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>মোবাইল নং</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>বইয়ের নাম</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}>শেষ তারিখ</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>বিলম্ব</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(printDefaulterNotice.list || []).map((l, i) => {
                      const info = getLoanStudentInfo(l);
                      return (
                        <tr key={i}>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px', textAlign: 'center' }}>{toBn(i + 1)}</td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px', fontWeight: 700 }}>
                            {info.studentName}
                            {info.fatherName ? <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>পিতা: {info.fatherName}</div> : null}
                          </td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{toBn(info.className)}ম ({toBn(info.rollNo)})</td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px', fontWeight: 600, color: '#0369a1' }}>{info.phone || '—'}</td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{l.book_title}</td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{formatDateBn(l.due_at)}</td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '5px', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>
                            {toBn(getOverdueDays(l.due_at))} দিন
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '10px' }}>
              <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #000' }}>
                <p style={{ margin: '4px 0 0', fontSize: '11px', fontWeight: 700 }}>{LIBRARIAN_TEACHER.name_bn}</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#555' }}>গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</p>
              </div>

              <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #000' }}>
                <p style={{ margin: '4px 0 0', fontSize: '11px', fontWeight: 700 }}>প্রধান শিক্ষক</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#555' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SMS MODAL: পিতা/অভিভাবকের মোবাইলে সংক্ষিপ্ত নোটিশ SMS প্রেরণ */}
      {/* ================================================================== */}
      {smsModalLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            maxWidth: '580px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✉️</span> ফিচার/বাটন ফোনে সরাসরি মোবাইল SMS প্রেরণ
                </h3>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় • সিম-টু-সিম সরাসরি সেলুলার SMS
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSmsSettings(!showSmsSettings)}
                  title="SMS Gateway API সেটিংস"
                  style={{
                    background: showSmsSettings ? '#0284c7' : '#f8fafc',
                    color: showSmsSettings ? '#fff' : '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>⚙️</span> {showSmsSettings ? 'সেটিংস বন্ধ' : 'গেটওয়ে'}
                </button>
                <button
                  type="button"
                  onClick={() => setSmsModalLoan(null)}
                  style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800, color: '#64748b' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Gateway Settings Drawer/Panel */}
            {showSmsSettings && (
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #0284c7',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0369a1' }}>
                    ⚙️ SMS Gateway API কনফিগারেশন
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    (স্কুলের জন্য একবার সেট করলেই হবে)
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    টেলিকম গেটওয়ে প্রোভাইডার:
                  </label>
                  <select
                    value={smsGatewayConfig.provider}
                    onChange={e => setSmsGatewayConfig({ ...smsGatewayConfig, provider: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                  >
                    <option value="bulksmsbd">BulkSMSBD (বাংলাদেশ - https://bulksmsbd.net)</option>
                    <option value="greenweb">Greenweb BD (https://greenweb.com.bd)</option>
                    <option value="custom">কাস্টম HTTP API (যেকোনো গেটওয়ে / Android Local Gateway)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    API Key / Token:
                  </label>
                  <input
                    type="text"
                    value={smsGatewayConfig.apiKey || ''}
                    onChange={e => setSmsGatewayConfig({ ...smsGatewayConfig, apiKey: e.target.value })}
                    placeholder="আপনার SMS গেটওয়ের API Key দিন"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                {smsGatewayConfig.provider === 'bulksmsbd' && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Sender ID (ঐচ্ছিক / মাস্কিং আইডি):
                    </label>
                    <input
                      type="text"
                      value={smsGatewayConfig.senderId || ''}
                      onChange={e => setSmsGatewayConfig({ ...smsGatewayConfig, senderId: e.target.value })}
                      placeholder="যেমন: 8809612... বা অনুমোদিত মাস্কিং"
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                {smsGatewayConfig.provider === 'custom' && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Custom API URL Template:
                    </label>
                    <input
                      type="text"
                      value={smsGatewayConfig.customUrl || ''}
                      onChange={e => setSmsGatewayConfig({ ...smsGatewayConfig, customUrl: e.target.value })}
                      placeholder="https://api.example.com/send?to={phone}&msg={message}&key={apikey}"
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                      ব্যবহার্য ভেরিয়েবল: &#123;phone&#125;, &#123;phone_int&#125;, &#123;message&#125;, &#123;apikey&#125;
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="chkSmsActive"
                    checked={smsGatewayConfig.isActive || false}
                    onChange={e => setSmsGatewayConfig({ ...smsGatewayConfig, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkSmsActive" style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                    সরাসরি SMS গেটওয়ে সক্রিয় রাখুন (Active)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveSmsGatewayConfig(smsGatewayConfig);
                      setShowSmsSettings(false);
                    }}
                    style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    💾 সংরক্ষণ করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSmsSettings(false)}
                    style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    বন্ধ
                  </button>
                </div>
              </div>
            )}

            {/* Student & Book Summary Box */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>👤 <b>শিক্ষার্থী:</b> {smsModalLoan.name_bn}</span>
                <span>🏫 <b>শ্রেণি:</b> {toBn(smsModalLoan.class_name)}ম (রোল {toBn(smsModalLoan.roll_no)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>📖 <b>বই:</b> {smsModalLoan.book_title} (কোড: {smsModalLoan.accession_no})</div>
                <div style={{ color: '#0369a1', fontWeight: 700 }}>
                  📞 <b>{smsCustomPhone || 'নম্বর নেই'}</b>
                </div>
              </div>
              <div style={{ color: '#dc2626', fontWeight: 700, marginTop: '3px' }}>
                ⚠️ নির্ধারিত মেয়াদ উত্তীর্ণ: {toBn(getOverdueDays(smsModalLoan.due_at))} দিন অতিবাহিত হয়েছে
              </div>
            </div>

            {/* Workflow Mode Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setSmsDeliveryTab('qr')}
                style={{
                  background: smsDeliveryTab === 'qr' ? '#0284c7' : '#f1f5f9',
                  color: smsDeliveryTab === 'qr' ? '#fff' : '#475569',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📷</span> মোবাইল দিয়ে স্ক্যান করে পাঠান (১-ট্যাপ QR)
              </button>

              <button
                type="button"
                onClick={() => setSmsDeliveryTab('editor')}
                style={{
                  background: smsDeliveryTab === 'editor' ? '#0284c7' : '#f1f5f9',
                  color: smsDeliveryTab === 'editor' ? '#fff' : '#475569',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>✏️</span> বাটন ফোন টেমপ্লেট ও টেক্সট
              </button>
            </div>

            {/* TAB 1: QR CODE DIRECT MOBILE-TO-MOBILE SMS SCANNER */}
            {smsDeliveryTab === 'qr' && (
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Left: QR Code */}
                  <div style={{ textAlign: 'center', minWidth: '180px', flex: '0 0 auto', margin: '0 auto' }}>
                    {smsQrDataUrl ? (
                      <img
                        src={smsQrDataUrl}
                        alt="SMS QR Code"
                        style={{
                          width: '180px',
                          height: '180px',
                          display: 'block',
                          borderRadius: '8px',
                          border: '2px solid #0284c7',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
                          background: '#fff',
                          padding: '4px'
                        }}
                      />
                    ) : (
                      <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#64748b' }}>
                        QR কোড লোড হচ্ছে...
                      </div>
                    )}
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', marginTop: '6px' }}>
                      📲 মোবাইলের ক্যামেরা দিয়ে ধরুন
                    </div>
                  </div>

                  {/* Right: Step-by-step Instructions & 1-tap Actions */}
                  <div style={{ flex: '1 1 240px', fontSize: '12px', lineHeight: 1.55 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px', fontSize: '13px' }}>
                      🚀 মোবাইল-টু-মোবাইল সরাসরি SMS পাঠানোর নিয়ম:
                    </div>
                    <div style={{ color: '#334155', marginBottom: '4px' }}>
                      <b>১.</b> আপনার মোবাইল ফোনের <b>ক্যামেরা</b> বা <b>Google Lens / QR Scanner</b> চালু করুন।
                    </div>
                    <div style={{ color: '#334155', marginBottom: '4px' }}>
                      <b>২.</b> কম্পিউটারের এই QR কোডে ধরলেই আপনার মোবাইলের মেসেজ বক্সে নম্বর ও বার্তা বসে যাবে।
                    </div>
                    <div style={{ color: '#334155', marginBottom: '10px' }}>
                      <b>৩.</b> মোবাইলে শুধু <b>"Send"</b> চাপুন—আপনার নিজস্ব সিমের SMS প্যাক দিয়ে অভিভাবকের <b>ফিচার/বাটন ফোনে সরাসরি সেলুলার SMS</b> চলে যাবে!
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleDirectDeviceSms(smsCustomPhone, smsCustomText)}
                        style={{
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        📱 এই ডিভাইসের মেসেজিং অ্যাপে খুলুন (যদি মোবাইল ব্রাউজারে থাকেন)
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(smsCustomPhone);
                            alert(`অভিভাবকের মোবাইল নম্বর (${smsCustomPhone}) কপি করা হয়েছে!`);
                          }}
                          style={{
                            flex: 1,
                            background: '#fff',
                            border: '1px solid #cbd5e1',
                            color: '#1e293b',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          📋 নম্বর কপি ({smsCustomPhone})
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(smsCustomText);
                            alert('SMS টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে!');
                          }}
                          style={{
                            flex: 1,
                            background: '#fff',
                            border: '1px solid #cbd5e1',
                            color: '#1e293b',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          📋 মেসেজ কপি
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEMPLATES & TEXT EDITOR */}
            {smsDeliveryTab === 'editor' && (
              <div>
                {/* Mobile Number Input */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    📲 পিতা/অভিভাবকের মোবাইল নম্বর:
                  </label>
                  <input
                    type="text"
                    value={smsCustomPhone}
                    onChange={e => setSmsCustomPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Template Selection */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>
                    নমুনা টেমপ্লেট নির্বাচন করুন (ফিচার ফোনের জন্য বাংলিশ সুপারিশকৃত):
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSmsCustomText(buildShortSmsText(smsModalLoan, 'feature_phone'))}
                      title="যেকোনো বাটন/ফিচার ফোনে ফন্ট ভাঙবে না এবং ১টি SMS-এর মধ্যে ১৬০ অক্ষরে শেষ হবে"
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      🔘 বাটন ফোন ফ্রেন্ডলি (বাংলিশ) ⭐
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsCustomText(buildShortSmsText(smsModalLoan, 'short'))}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      সহজ বাংলা (খুব সংক্ষিপ্ত)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsCustomText(buildShortSmsText(smsModalLoan, 'standard'))}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      বাংলা (স্ট্যান্ডার্ড)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsCustomText(buildShortSmsText(smsModalLoan, 'english'))}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* SMS Body Area */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    💬 SMS বার্তা (প্রয়োজনে সম্পাদনা করুন):
                  </label>
                  <textarea
                    value={smsCustomText}
                    onChange={e => setSmsCustomText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1.5px solid #0284c7',
                      fontSize: '12.5px',
                      lineHeight: 1.5,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Feature phone safety advice */}
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '8px 10px', marginBottom: '10px', fontSize: '11px', color: '#065f46' }}>
                  💡 <b>ফিচার (বাটন) ফোনের সুরক্ষা:</b> সাধারণ নোকিয়া, ওয়ালটন বা সিম্ফনি বাটন ফোনে অনেক সময় ইউনিকোড বাংলা সাপোর্ট না থাকায় লেখা '???' বা ভেঙে যায়। <b>"বাটন ফোন ফ্রেন্ডলি (বাংলিশ)"</b> টেক্সট নির্বাচন করলে যেকোনো বাটন ফোনে ১০০% পরিষ্কার ও অক্ষতভাবে বার্তাটি পৌঁছায়।
                </div>

                {/* Character & Part Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', marginBottom: '14px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>📊 দৈর্ঘ্য: <b>{toBn(smsCustomText.length)}</b> অক্ষর</span>
                  <span>
                    {/[^\u0000-\u007F]/.test(smsCustomText) ? (
                      <span>ইউনিকোড SMS: <b>{toBn(Math.ceil(smsCustomText.length / 70) || 1)}</b> টি অংশ (৭০ অক্ষর/SMS)</span>
                    ) : (
                      <span>স্ট্যান্ডার্ড GSM: <b>{toBn(Math.ceil(smsCustomText.length / 160) || 1)}</b> টি অংশ (১৬০ অক্ষর/SMS)</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Error & Status Alert */}
            {smsGatewayError && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, marginBottom: '14px' }}>
                {smsGatewayError}
              </div>
            )}

            {smsDeliveryStatus && (
              <div style={{ background: '#ecfdf5', border: '1px solid #34d399', color: '#065f46', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, marginBottom: '14px' }}>
                <div>✅ {smsDeliveryStatus.message}</div>
                {smsDeliveryStatus.details && (
                  <div style={{ fontSize: '10px', color: '#047857', marginTop: '3px', fontFamily: 'monospace' }}>
                    সার্ভার রেসপন্স: {smsDeliveryStatus.details}
                  </div>
                )}
              </div>
            )}

            {/* Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {/* 1. Toggle QR View Button */}
                <button
                  type="button"
                  onClick={() => setSmsDeliveryTab('qr')}
                  style={{
                    background: smsDeliveryTab === 'qr' ? '#0f172a' : '#0284c7',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>📷</span> QR স্ক্যান
                </button>

                {/* 2. Direct device SMS */}
                <button
                  type="button"
                  onClick={() => handleDirectDeviceSms(smsCustomPhone, smsCustomText)}
                  title="আপনার মোবাইল বা ডিভাইসের ডিফল্ট SMS মেসেজিং অ্যাপ ওপেন করে সিম ব্যালেন্স দিয়ে আসল SMS পাঠান (১০০% ফ্রি ও তাৎক্ষণিক)"
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>📱</span> মোবাইল SMS
                </button>

                {/* 3. Direct WhatsApp dispatch */}
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = String(smsCustomPhone || '').replace(/[^\d+]/g, '');
                    let intPhone = cleanPhone;
                    if (intPhone.startsWith('0')) {
                      intPhone = '88' + intPhone;
                    } else if (!intPhone.startsWith('88')) {
                      intPhone = '88' + intPhone;
                    }
                    window.open(`https://wa.me/${intPhone}?text=${encodeURIComponent(smsCustomText)}`, '_blank');
                  }}
                  title="অভিভাবকের হোয়াটসঅ্যাপ নাম্বারে সংক্ষিপ্ত নোটিশটি সরাসরি পাঠান"
                  style={{
                    background: '#25D366',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>💬</span> WA
                </button>

                {/* 4. Direct Gateway SMS */}
                <button
                  type="button"
                  onClick={handleSendGatewaySms}
                  disabled={smsSendingLoading}
                  title="স্কুলের টেলিকম গেটওয়ে সার্ভার দিয়ে সরাসরি SMS পাঠান"
                  style={{
                    background: smsGatewayConfig.isActive && smsGatewayConfig.apiKey ? '#059669' : '#64748b',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: smsSendingLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{smsSendingLoading ? '⏳' : '🚀'}</span>
                  {smsSendingLoading ? 'পাঠানো হচ্ছে...' : 'গেটওয়ে SMS'}
                </button>

                {/* 5. Copy Text */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(smsCustomText);
                    alert('SMS টেক্সট সফলভাবে কপি করা হয়েছে!');
                  }}
                  style={{
                    background: '#fff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '8px 10px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📋 কপি
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSmsModalLoan(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '8px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PRINT VIEW 3: ইস্যু স্লিপ (Library Borrower Slip) */}
      {/* ================================================================== */}
      {printReceiptLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }} className="no-print">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handlePrintSingleLoan(printReceiptLoan, 2)}
                  title="A4 সাইজের কাগজে একসাথে ২টি স্লিপ (শিক্ষার্থী ও অফিস কপি) প্রিন্ট করুন"
                  style={{ background: '#059669', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>🖨️</span> ২টি স্লিপ (A4 পাতা)
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintSingleLoan(printReceiptLoan, 4)}
                  title="A4 সাইজের কাগজে একসাথে ৪টি স্লিপ প্রিন্ট করুন"
                  style={{ background: '#0284c7', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>🖨️</span> ৪টি স্লিপ (A4 পাতা)
                </button>
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  title="একক স্লিপ প্রিন্ট"
                  style={{ background: '#475569', color: '#fff', padding: '6px 10px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}
                >
                  সিঙ্গেল
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPrintReceiptLoan(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', color: '#334155' }}
              >
                ✕ বন্ধ
              </button>
            </div>

            <div style={{ border: '2px dashed #065f46', borderRadius: '10px', padding: '16px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#064e3b', fontWeight: 800 }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h4>
                <div style={{ fontSize: '11px', color: '#64748b' }}>লাইব্রেরি ইস্যু ও জমাদান স্লিপ (Borrower Slip)</div>
              </div>

              <div style={{ fontSize: '12px', lineHeight: 1.5, color: '#1e293b' }}>
                {(() => {
                  const info = getLoanStudentInfo(printReceiptLoan);
                  return (
                    <>
                      <div><b>শিক্ষার্থী:</b> {info.studentName}</div>
                      <div><b>শ্রেণি:</b> {toBn(info.className)}ম শ্রেণি • <b>রোল নং:</b> {toBn(info.rollNo)}</div>
                      <div><b>আইডি:</b> {info.studentUid} {info.fatherName ? `• পিতা: ${info.fatherName}` : ''}</div>
                      {info.phone && <div style={{ color: '#0369a1', fontWeight: 600, marginTop: '2px' }}><b>অভিভাবকের মোবাইল:</b> 📞 {info.phone}</div>}
                    </>
                  );
                })()}
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0', paddingTop: '6px' }}>
                  <div>📖 <b>বই:</b> {printReceiptLoan.book_title}</div>
                  <div>✍️ <b>লেখক:</b> {printReceiptLoan.author}</div>
                  <div>🏷️ <b>কোড:</b> {printReceiptLoan.accession_no}</div>
                </div>
                <div>📅 <b>ইস্যুর তারিখ:</b> {formatDateBn(printReceiptLoan.issued_at)}</div>
                <div style={{ color: '#be123c', fontWeight: 700 }}>⏰ <b>ফেরতের শেষ তারিখ:</b> {formatDateBn(printReceiptLoan.due_at)}</div>
                {printReceiptLoan.returned_at && (
                  <div style={{ color: '#059669', fontWeight: 700 }}>✅ <b>জমা দেওয়ার তারিখ:</b> {formatDateBn(printReceiptLoan.returned_at)}</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '6px', borderTop: '1px solid #cbd5e1', fontSize: '10px' }}>
                <span>শিক্ষার্থীর স্বাক্ষর</span>
                <span>লাইব্রেরিয়ান স্বাক্ষর</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PRINT VIEW 4: পূর্ণাঙ্গ রিপোর্ট প্রিন্ট (Weekly/Monthly Report Print) */}
      {/* ================================================================== */}
      {printReportMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }} className="no-print">
              <button
                type="button"
                onClick={handlePrintReport}
                style={{ background: '#0369a1', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setPrintReportMode(false)}
                style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            <div style={{ textAlign: 'center', borderBottom: '2px double #0284c7', paddingBottom: '12px', marginBottom: '16px' }}>
              <img src={schoolLogo} alt="Logo" style={{ width: '52px', height: '52px', margin: '0 auto 4px' }} />
              <h2 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: 800, color: '#064e3b' }}>
                মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়
              </h2>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155' }}>
                কেন্দ্রীয় লাইব্রেরি ও তথ্য বিজ্ঞান শাখা • EIIN: 114290 • কালিহাতি, টাঙ্গাইল
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: 800, color: '#0369a1' }}>
                {reportType === 'weekly' ? 'সাপ্তাহিক লাইব্রেরি সঞ্চালন ও অডিট রিপোর্ট' : 'মাসিক লাইব্রেরি সঞ্চালন ও অডিট রিপোর্ট'}
              </h3>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                সময়কাল: {formatDateBn(reportData.startStr)} হতে {formatDateBn(reportData.endStr)} পর্যন্ত
              </div>
            </div>

            {/* Metrics Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '18px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px' }}>বিবরণী সূচক (Key Metrics)</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>পরিসংখ্যান</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px' }}>মন্তব্য</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>মোট বই ইস্যু সংখ্যা</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', fontWeight: 700 }}>{toBn(reportData.issuedInPeriod.length)} টি</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>শিক্ষার্থীদের মাঝে বিতরণকৃত</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>মোট জমাপ্রাপ্ত বই সংখ্যা</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', fontWeight: 700, color: '#15803d' }}>{toBn(reportData.returnedInPeriod.length)} টি</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>স্টকে ফেরত গৃহীত</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>অনিষ্পন্ন বকেয়া বই</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{toBn(reportData.overdueInPeriod.length)} টি</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>তাগাদা নোটিশ প্রদান করা হয়েছে</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>নষ্ট ও বাতিল বই</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', fontWeight: 700, color: '#b91c1c' }}>{toBn(reportData.damagedInPeriod.length)} টি</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>ক্ষতিগ্রস্ত বিধায় বাতিল রেজিস্টারভুক্ত</td>
                </tr>
              </tbody>
            </table>

            {/* Top Readers Recognition */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                🏆 পাঠাভ্যাস ও সেরা পাঠক মূল্যায়ন:
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {reportData.topReaders.map((r, i) => (
                  <div key={i} style={{ border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', background: '#f8fafc' }}>
                    <b>{r.name}</b> ({toBn(r.class_name)}ম শ্রেণি, রোল {toBn(r.roll)}) — {toBn(r.count)}টি বই
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <table style={{ width: '100%', border: 'none', marginTop: '60px', paddingTop: '10px' }}>
              <tbody>
                <tr style={{ border: 'none', background: 'transparent' }}>
                  <td style={{ width: '250px', textAlign: 'left', border: 'none', padding: 0, verticalAlign: 'top' }}>
                    <div style={{ textAlign: 'center', width: '220px', borderTop: '1.5px solid #000', paddingTop: '5px' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>{LIBRARIAN_TEACHER.name_bn}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#475569' }}>গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</p>
                      <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#64748b' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
                    </div>
                  </td>
                  <td style={{ border: 'none', padding: 0 }}></td>
                  <td style={{ width: '250px', textAlign: 'right', border: 'none', padding: 0, verticalAlign: 'top' }}>
                    <div style={{ textAlign: 'center', width: '220px', borderTop: '1.5px solid #000', paddingTop: '5px', marginLeft: 'auto' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>প্রধান শিক্ষক</p>
                      <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#475569' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
                      <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#64748b' }}>কালিহাতি, টাঙ্গাইল</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryPanel;
