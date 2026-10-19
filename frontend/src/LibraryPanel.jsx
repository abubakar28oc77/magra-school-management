// LibraryPanel.jsx - Comprehensive Library & Information Science Management
// for Magra Pals Union High School (EIIN: 114290)
// Designed for the responsible Librarian / Teacher of Library & Information Science

import React, { useState, useEffect, useMemo, useRef } from 'react';
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

export function LibraryPanel({ sub, setSub }) {
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

  // Load students for loan issuance with solid multi-tier fallbacks
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await requestApi('/students?status=active');
        if (Array.isArray(res) && res.length) {
          setStudents(res);
          return;
        }
      } catch (err) {
        console.warn('Student load fallback:', err);
      }
      try {
        const raw = localStorage.getItem('magra_db_students');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            setStudents(parsed);
            return;
          }
        }
      } catch {}
      setStudents(MOCK_STUDENTS || []);
    }
    fetchStudents();
  }, []);

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

  // Filter students for picker
  const filteredStudentsForIssue = useMemo(() => {
    return students.filter(s => {
      if (issueFilterClass !== 'all' && normClass(s.class_name) !== normClass(issueFilterClass)) return false;
      if (issueFilterStudentSearch.trim()) {
        const q = issueFilterStudentSearch.toLowerCase().trim();
        const matchName = (s.name_bn || '').toLowerCase().includes(q) || (s.name_en || '').toLowerCase().includes(q);
        const matchRoll = String(s.roll_no || '').includes(q);
        const matchId = (s.student_id || s.id || '').toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchId) return false;
      }
      return true;
    }).slice(0, 80);
  }, [students, issueFilterClass, issueFilterStudentSearch]);

  // Selected student object & their active overdue warning
  const selectedStudentObj = useMemo(() => {
    return students.find(s => s.id === issueForm.student_id || s.student_id === issueForm.student_id);
  }, [students, issueForm.student_id]);

  const studentOutstandingLoans = useMemo(() => {
    if (!issueForm.student_id) return [];
    return loans.filter(l => (l.student_id === issueForm.student_id || l.student_uid === issueForm.student_id) && !l.returned_at);
  }, [loans, issueForm.student_id]);

  const openIssueModal = (preselectedBook = null) => {
    setIssueForm({
      student_id: '',
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

    const newLoan = {
      id: 'loan-' + Date.now(),
      book_id: targetBook.id,
      book_title: targetBook.title,
      author: targetBook.author,
      accession_no: targetBook.accession_no,
      student_id: st.id,
      student_uid: st.student_id || st.id,
      name_bn: st.name_bn,
      class_name: st.class_name,
      roll_no: st.roll_no,
      guardian_phone: st.guardian_phone || st.father_mobile || '01712000000',
      issued_at: issueForm.issued_at,
      due_at: issueForm.due_at,
      returned_at: null,
      return_condition: null,
      fine: 0,
      status: 'active',
      remarks: issueForm.remarks || 'ইস্যুকৃত'
    };

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
  // Print Handler
  // -------------------------------------------------------------
  const triggerBrowserPrint = () => {
    window.print();
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
              <span>👤 <b>দায়িত্বপ্রাপ্ত শিক্ষক:</b> {LIBRARIAN_TEACHER.name_bn} ({LIBRARIAN_TEACHER.designation})</span>
              <span>• 🏢 {LIBRARIAN_TEACHER.room}</span>
              <span>• 📞 {LIBRARIAN_TEACHER.phone}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                onClick={() => setPrintCatalogMode(true)}
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
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>
                📋 ইস্যু ও ফেরত রেজিস্টার ({toBn(loans.length)} টি রেকর্ড)
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>🟢 চলমান: {toBn(loans.filter(l => !l.returned_at && getOverdueDays(l.due_at) <= 0).length)}</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 বকেয়া: {toBn(kpis.overdueCount)}</span>
                <span style={{ color: '#64748b' }}>✅ জমা সম্পন্ন: {toBn(loans.filter(l => l.returned_at).length)}</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
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

                    return (
                      <tr
                        key={l.id || idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isReturned ? '#fff' : overdue > 0 ? '#fef2f2' : idx % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.name_bn}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            শ্রেণি {toBn(l.class_name)} • রোল {toBn(l.roll_no)} • আইডি: {l.student_uid}
                          </div>
                          {l.guardian_phone && (
                            <div style={{ fontSize: '11px', color: '#0284c7' }}>
                              📞 {l.guardian_phone}
                            </div>
                          )}
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
                      <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
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
                    return (
                      <tr
                        key={l.id || idx}
                        style={{
                          borderBottom: '1px solid #fee2e2',
                          background: idx % 2 === 0 ? '#fff' : '#fff5f5'
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#881337' }}>
                          {l.name_bn}
                          <div style={{ fontSize: '11px', color: '#64748b' }}>রোল নং: {toBn(l.roll_no)}</div>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ background: '#fecdd3', color: '#9f1239', padding: '2px 7px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                            {toBn(l.class_name)}ম শ্রেণি
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{l.student_uid}</div>
                        </td>

                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0369a1' }}>
                          <a href={`tel:${l.guardian_phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            📞 {l.guardian_phone || '01712000000'}
                          </a>
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
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setPrintDefaulterNotice({ single: true, loan: l })}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '5px',
                                border: '1px solid #be123c',
                                background: '#fff',
                                color: '#be123c',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              📨 তাগাদা নোটিশ
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
                  <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                  {filteredStudentsForIssue.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name_bn} • শ্রেণি {toBn(s.class_name)} • রোল {toBn(s.roll_no)} (আইডি: {s.student_id || s.id})
                    </option>
                  ))}
                </select>

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
                onClick={triggerBrowserPrint}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '10px' }}>
              <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #000' }}>
                <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 700 }}>{LIBRARIAN_TEACHER.name_bn}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>গ্রন্থাগার ও তথ্য বিজ্ঞান শিক্ষক</p>
              </div>

              <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #000' }}>
                <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 700 }}>প্রধান শিক্ষক</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</p>
              </div>
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }} className="no-print">
              <button
                type="button"
                onClick={triggerBrowserPrint}
                style={{ background: '#be123c', color: '#fff', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ তাগাদা নোটিশ প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setPrintDefaulterNotice(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕ বন্ধ করুন
              </button>
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
                <p><b>স্মারক নং:</b> MAG/LIB/{new Date().getFullYear()}/{printDefaulterNotice.loan.accession_no} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>তারিখ:</b> {formatDateBn(new Date().toISOString().slice(0, 10))}</p>
                <p><b>প্রাপক:</b> {printDefaulterNotice.loan.name_bn} <br />
                  <b>শ্রেণি:</b> {toBn(printDefaulterNotice.loan.class_name)}ম শ্রেণি, <b>রোল নং:</b> {toBn(printDefaulterNotice.loan.roll_no)} (আইডি: {printDefaulterNotice.loan.student_uid}) <br />
                  <b>অভিভাবকের মোবাইল:</b> {printDefaulterNotice.loan.guardian_phone || '01712000000'}
                </p>

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
                    {(printDefaulterNotice.list || []).map((l, i) => (
                      <tr key={i}>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px', textAlign: 'center' }}>{toBn(i + 1)}</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px', fontWeight: 700 }}>{l.name_bn}</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{toBn(l.class_name)}ম ({toBn(l.roll_no)})</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{l.guardian_phone}</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{l.book_title}</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px' }}>{formatDateBn(l.due_at)}</td>
                        <td style={{ border: '1px solid #e2e8f0', padding: '5px', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>
                          {toBn(getOverdueDays(l.due_at))} দিন
                        </td>
                      </tr>
                    ))}
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
            maxWidth: '450px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }} className="no-print">
              <button
                type="button"
                onClick={triggerBrowserPrint}
                style={{ background: '#059669', color: '#fff', padding: '6px 14px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ স্লিপ প্রিন্ট
              </button>
              <button
                type="button"
                onClick={() => setPrintReceiptLoan(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
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
                <div><b>শিক্ষার্থী:</b> {printReceiptLoan.name_bn}</div>
                <div><b>শ্রেণি:</b> {toBn(printReceiptLoan.class_name)}ম শ্রেণি • <b>রোল নং:</b> {toBn(printReceiptLoan.roll_no)}</div>
                <div><b>আইডি:</b> {printReceiptLoan.student_uid}</div>
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
                onClick={triggerBrowserPrint}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '10px' }}>
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
    </div>
  );
}

export default LibraryPanel;
