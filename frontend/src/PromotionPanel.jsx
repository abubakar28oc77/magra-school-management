import React, { useState, useEffect, useMemo } from 'react';
import { requestApi as api } from './apiClient';
import { toBnDigits } from './boardExamEngine';
import { MOCK_SCHOOL } from './mockData';

export function PromotionPanel({
  selectedYear: initialYear,
  academicYears = [],
  exams = [],
  selectedExam: initialExam,
  className: initialClass,
  showNotification
}) {
  // Navigation Modes
  // 'annual_promotion' (Classes 6-9) | 'ssc_form_fillup' (Class 10) | 'history'
  const [activeMode, setActiveMode] = useState(initialClass === '10' ? 'ssc_form_fillup' : 'annual_promotion');

  // Filters & Context
  const [selectedYear, setSelectedYear] = useState(initialYear || '2026');
  const [selectedExamId, setSelectedExamId] = useState(initialExam || '');
  const [currentClass, setCurrentClass] = useState(initialClass && initialClass !== '10' ? initialClass : '6');
  const [targetYear, setTargetYear] = useState(String(Number(initialYear || '2026') + 1));
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded Data
  const [allStudents, setAllStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [roster, setRoster] = useState([]); // Array of promotion candidate items
  const [sscRoster, setSscRoster] = useState([]); // Array of class 10 SSC candidate items
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Computed next target class
  const targetClass = useMemo(() => {
    const nextMap = { '6': '7', '7': '8', '8': '9', '9': '10', '10': '10' };
    return nextMap[currentClass] || '7';
  }, [currentClass]);

  // Update target year when selectedYear changes
  useEffect(() => {
    const yNum = parseInt(selectedYear, 10);
    if (!isNaN(yNum)) {
      setTargetYear(String(yNum + 1));
    }
  }, [selectedYear]);

  // Auto-switch mode based on class selection
  useEffect(() => {
    if (currentClass === '10') {
      setActiveMode('ssc_form_fillup');
    }
  }, [currentClass]);

  // Filter exams for selected year
  const examsForYear = useMemo(() => {
    return (exams || []).filter(e => String(e.academic_year) === String(selectedYear));
  }, [exams, selectedYear]);

  // Auto-pick exam: default to Annual for 6-9 and Test for 10
  useEffect(() => {
    if (!examsForYear.length) return;

    if (activeMode === 'annual_promotion') {
      const annualExam = examsForYear.find(e => e.id === 'ex-annual-2026' || e.name_bn.includes('বার্ষিক') || e.exam_type === 'বার্ষিক পরীক্ষা');
      if (annualExam) {
        setSelectedExamId(annualExam.id);
        return;
      }
    } else if (activeMode === 'ssc_form_fillup') {
      const testExam = examsForYear.find(e => e.id === 'ex-test-2026' || e.name_bn.includes('নির্বাচনি') || e.name_bn.includes('টেস্ট') || e.exam_type === 'নির্বাচনি পরীক্ষা');
      if (testExam) {
        setSelectedExamId(testExam.id);
        return;
      }
    }

    if (!selectedExamId || !examsForYear.some(e => e.id === selectedExamId)) {
      setSelectedExamId(examsForYear[0].id);
    }
  }, [examsForYear, activeMode]);

  // ==================== LOAD DATA ====================
  const loadPromotionData = async () => {
    setIsLoading(true);
    try {
      const clsToFetch = activeMode === 'ssc_form_fillup' ? '10' : currentClass;
      
      // 1. Fetch Students
      const stdList = await api(`/students?class_name=${clsToFetch}`);
      setAllStudents(Array.isArray(stdList) ? stdList : []);

      // 2. Fetch Subjects
      const subList = await api(`/subjects?class_name=${clsToFetch}`);
      setClassSubjects(Array.isArray(subList) ? subList : []);

      // 3. Fetch Exam Summary / Results
      let results = [];
      if (selectedExamId) {
        try {
          const res = await api(`/results/summary?exam_id=${selectedExamId}&class_name=${clsToFetch}`);
          if (Array.isArray(res) && res.length) {
            results = res;
          } else {
            // Process on the fly
            const p = await api('/results/process', {
              method: 'POST',
              body: JSON.stringify({ exam_id: selectedExamId, class_name: clsToFetch })
            });
            if (Array.isArray(p.summary)) results = p.summary;
          }
        } catch (err) {
          console.warn('Could not load summary:', err);
        }
      }

      // Map students to Results
      const resultMap = new Map();
      results.forEach(r => {
        if (r.student_id) resultMap.set(String(r.student_id), r);
        if (r.id) resultMap.set(String(r.id), r);
      });

      if (activeMode === 'annual_promotion') {
        // Build Annual Promotion Roster
        const candidateList = (stdList || []).map(student => {
          const res = resultMap.get(String(student.student_id)) || resultMap.get(String(student.id)) || {};
          const isPass = res.is_pass === true;
          const merit = res.merit || 999;
          const gpa = res.gpa || '0.00';
          const grade = res.final_grade || 'F';
          const totalMarks = res.total_marks || 0;
          const failedCount = res.failed_count || (isPass ? 0 : 1);
          const failedSubjects = Array.isArray(res.failed_subjects) ? res.failed_subjects : [];

          // Default state: passed get Merit Promoted; failed get Repeat
          return {
            id: student.id,
            student_id: student.student_id,
            name_bn: student.name_bn,
            current_roll: student.roll_no || 0,
            department: student.department || student.group_name || 'সাধারণ',
            target_department: student.department || 'বিজ্ঞান', // for class 8 -> 9
            merit_position: merit,
            gpa,
            final_grade: grade,
            total_marks: totalMarks,
            is_pass: isPass,
            failed_count: failedCount,
            failed_subjects: failedSubjects,
            promotion_action: isPass ? 'promote' : 'repeat',
            promotion_method: isPass ? 'merit' : 'repeat',
            head_teacher_approved: isPass, // automatically approved for merit
            approval_note: isPass ? 'মেধানুযায়ী উত্তীর্ণ' : '',
            new_roll: ''
          };
        });

        // Compute initial roll numbers
        const assignedRoster = assignRollNumbers(candidateList);
        setRoster(assignedRoster);
      } else if (activeMode === 'ssc_form_fillup') {
        // Build SSC Form Fill-up Candidate List for Class 10
        const sscList = (stdList || []).map(student => {
          const res = resultMap.get(String(student.student_id)) || resultMap.get(String(student.id)) || {};
          const isPass = res.is_pass === true;
          const gpa = res.gpa || '0.00';
          const grade = res.final_grade || 'F';
          const totalMarks = res.total_marks || 0;
          const failedCount = res.failed_count || (isPass ? 0 : 1);
          const failedSubjects = Array.isArray(res.failed_subjects) ? res.failed_subjects : [];

          // Existing saved state or default
          const existingStatus = student.ssc_candidate_status;
          const existingType = student.ssc_approval_type;
          const existingNote = student.ssc_approval_note;

          let status = 'detained';
          let approvalType = 'none';
          let note = '';
          let isApproved = false;

          if (existingStatus) {
            status = existingStatus;
            approvalType = existingType || (status === 'approved' ? 'regular' : 'head_teacher_special');
            note = existingNote || '';
            isApproved = status === 'approved' || status === 'special_approved';
          } else if (isPass) {
            status = 'approved';
            approvalType = 'regular';
            note = 'নিয়মিত উত্তীর্ণ (সকল বিষয়ে পাস)';
            isApproved = true;
          } else {
            status = 'detained';
            approvalType = 'none';
            note = failedSubjects.length ? `অকৃতকার্য বিষয়: ${failedSubjects.join(', ')}` : 'টেস্ট পরীক্ষায় অকৃতকার্য';
            isApproved = false;
          }

          return {
            id: student.id,
            student_id: student.student_id,
            roll_no: student.roll_no || 0,
            name_bn: student.name_bn,
            department: student.department || student.group_name || 'বিজ্ঞান',
            gpa,
            final_grade: grade,
            total_marks: totalMarks,
            is_pass: isPass,
            failed_count: failedCount,
            failed_subjects: failedSubjects,
            guardian_phone: student.father_mobile || student.guardian_phone || student.mother_mobile || '—',
            ssc_status: status,
            approval_type: approvalType,
            head_teacher_approved: isApproved,
            approval_note: note
          };
        });

        // Sort by department priority and roll
        sscList.sort((a, b) => (Number(a.roll_no) || 0) - (Number(b.roll_no) || 0));
        setSscRoster(sscList);
      }

      // 4. Fetch Promotion History
      const hist = await api('/promotion/history');
      if (Array.isArray(hist)) setHistoryList(hist);

    } catch (err) {
      console.error('Failed to load promotion data:', err);
      showNotification && showNotification('ডেটা লোড করতে ব্যর্থ: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotionData();
  }, [selectedYear, selectedExamId, currentClass, activeMode]);

  // ==================== ROLL NUMBER ASSIGNMENT LOGIC ====================
  // Sort and assign roll numbers:
  // 1. Merit promoted students: ranked by Merit Position (1..M)
  // 2. Head Teacher Special Approval promoted students: ranked after merit (M+1..N)
  // 3. Repeated students: no next class roll assigned (or retain old roll)
  const assignRollNumbers = (list) => {
    // Partition students
    const meritPromoted = list.filter(s => s.promotion_action === 'promote' && s.promotion_method === 'merit');
    const specialPromoted = list.filter(s => s.promotion_action === 'promote' && s.promotion_method === 'special_approval');
    const repeatStudents = list.filter(s => s.promotion_action === 'repeat');

    // Sort Merit Promoted by merit position asc -> total marks desc -> current roll asc
    meritPromoted.sort((a, b) => {
      const mDiff = (a.merit_position || 999) - (b.merit_position || 999);
      if (mDiff !== 0) return mDiff;
      const tDiff = (b.total_marks || 0) - (a.total_marks || 0);
      if (tDiff !== 0) return tDiff;
      return (Number(a.current_roll) || 0) - (Number(b.current_roll) || 0);
    });

    // Sort Special Promoted by total marks desc -> current roll asc
    specialPromoted.sort((a, b) => {
      const tDiff = (b.total_marks || 0) - (a.total_marks || 0);
      if (tDiff !== 0) return tDiff;
      return (Number(a.current_roll) || 0) - (Number(b.current_roll) || 0);
    });

    let currentRoll = 1;
    meritPromoted.forEach(s => {
      s.new_roll = currentRoll++;
    });

    specialPromoted.forEach(s => {
      s.new_roll = currentRoll++;
    });

    repeatStudents.forEach(s => {
      s.new_roll = s.current_roll; // keeps current roll for repeating
    });

    // Reconstruct list in original order or merit order
    return [...meritPromoted, ...specialPromoted, ...repeatStudents];
  };

  // ==================== HANDLERS: ANNUAL PROMOTION ====================
  // Toggle Head Teacher Special Approval for an individual student
  const handleToggleSpecialApproval = (id, checked) => {
    setRoster(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          if (checked) {
            return {
              ...s,
              head_teacher_approved: true,
              promotion_action: 'promote',
              promotion_method: s.is_pass ? 'merit' : 'special_approval',
              approval_note: s.is_pass ? 'মেধানুযায়ী উত্তীর্ণ' : (s.approval_note || 'প্রধান শিক্ষকের বিশেষ বিবেচনায় উত্তীর্ণ (অনুমোদিত)')
            };
          } else {
            return {
              ...s,
              head_teacher_approved: false,
              promotion_action: 'repeat',
              promotion_method: 'repeat',
              approval_note: 'একই শ্রেণিতে পুনরাবৃত্তি'
            };
          }
        }
        return s;
      });
      return assignRollNumbers(updated);
    });
  };

  // Change promotion action directly (dropdown)
  const handleChangePromotionAction = (id, action) => {
    setRoster(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          if (action === 'promote') {
            return {
              ...s,
              promotion_action: 'promote',
              head_teacher_approved: true,
              promotion_method: s.is_pass ? 'merit' : 'special_approval',
              approval_note: s.is_pass ? 'মেধানুযায়ী উত্তীর্ণ' : 'প্রধান শিক্ষকের বিশেষ বিবেচনা ও অনুমতি'
            };
          } else {
            return {
              ...s,
              promotion_action: 'repeat',
              head_teacher_approved: false,
              promotion_method: 'repeat',
              approval_note: 'একই শ্রেণিতে পুনরাবৃত্তি'
            };
          }
        }
        return s;
      });
      return assignRollNumbers(updated);
    });
  };

  // Update Custom Note
  const handleUpdateNote = (id, note) => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, approval_note: note } : s));
  };

  // Update Editable New Roll
  const handleUpdateNewRoll = (id, val) => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, new_roll: val } : s));
  };

  // Update target department for class 8 -> 9
  const handleUpdateTargetDept = (id, dept) => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, target_department: dept } : s));
  };

  // Bulk Special Approval for students failing 1 or 2 subjects
  const handleBulkApproveBorderline = () => {
    let approvedCount = 0;
    setRoster(prev => {
      const updated = prev.map(s => {
        if (!s.is_pass && s.failed_count > 0 && s.failed_count <= 2) {
          approvedCount++;
          return {
            ...s,
            head_teacher_approved: true,
            promotion_action: 'promote',
            promotion_method: 'special_approval',
            approval_note: `প্রধান শিক্ষকের বিশেষ বিবেচনায় উত্তীর্ণ (${toBnDigits(s.failed_count)} বিষয়ে ছাড়)`
          };
        }
        return s;
      });
      return assignRollNumbers(updated);
    });

    if (approvedCount > 0) {
      showNotification && showNotification(`১ বা ২ বিষয়ে অনুত্তীর্ণ ${toBnDigits(approvedCount)} জন শিক্ষার্থীকে প্রধান শিক্ষকের বিশেষ বিবেচনায় প্রমোশন দেওয়া হয়েছে!`, 'success');
    } else {
      showNotification && showNotification('১ বা ২ বিষয়ে অনুত্তীর্ণ কোনো নতুন শিক্ষার্থী পাওয়া যায়নি।', 'info');
    }
  };

  // Auto Reset to Pure Merit Roll
  const handleResetToMerit = () => {
    setRoster(prev => {
      const reset = prev.map(s => ({
        ...s,
        head_teacher_approved: s.is_pass,
        promotion_action: s.is_pass ? 'promote' : 'repeat',
        promotion_method: s.is_pass ? 'merit' : 'repeat',
        approval_note: s.is_pass ? 'মেধানুযায়ী উত্তীর্ণ' : ''
      }));
      return assignRollNumbers(reset);
    });
    showNotification && showNotification('মেধাতালিকা অনুযায়ী রোল নম্বর ও প্রমোশন তালিকা পুনরায় বিন্যস্ত করা হয়েছে।', 'info');
  };

  // One-click Demo Marks Generator if exam marks are empty
  const handleGenerateDemoMarks = async () => {
    if (!selectedExamId) {
      showNotification && showNotification('অনুগ্রহ করে আগে পরীক্ষা নির্বাচন করুন', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const subs = classSubjects.length ? classSubjects : await api(`/subjects?class_name=${currentClass}`);
      const stds = allStudents.length ? allStudents : await api(`/students?class_name=${currentClass}`);

      if (!subs.length || !stds.length) {
        showNotification && showNotification('শিক্ষার্থী বা বিষয়ের তালিকা পাওয়া যায়নি', 'error');
        return;
      }

      // Generate marks for each student and subject
      const records = [];
      stds.forEach((st, idx) => {
        subs.forEach(sb => {
          const wMax = sb.written_max || 0;
          const mMax = sb.mcq_max || 0;
          const pMax = sb.practical_max || 0;

          // Intentionally introduce realistic variation:
          // Top students get high marks, few lower roll students fail 1 subject
          let perfFactor = Math.max(0.35, Math.min(0.98, 1 - (idx * 0.015) + (Math.sin(idx + Number(sb.code || 1)) * 0.1)));
          
          // Introduce failure in 1 subject for students around idx 25-35 to test special consideration
          if (idx >= 24 && idx <= 28 && sb.code === '109') {
            perfFactor = 0.25; // fails math
          }

          const w = wMax > 0 ? Math.round(wMax * perfFactor) : 0;
          const m = mMax > 0 ? Math.round(mMax * perfFactor) : 0;
          const p = pMax > 0 ? Math.round(pMax * perfFactor) : 0;

          records.push({
            student_id: st.id,
            subject_id: sb.id,
            subject_code: sb.code,
            written: w,
            mcq: m,
            practical: p,
            absent: false
          });
        });
      });

      await api('/marks/bulk', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExamId, records })
      });

      // Run process
      await api('/results/process', {
        method: 'POST',
        body: JSON.stringify({ exam_id: selectedExamId, class_name: currentClass })
      });

      showNotification && showNotification('পরীক্ষামূলক ডেমো ফলাফল তৈরি ও প্রসেস সফল হয়েছে! মেধা ও বিশেষ বিবেচনা তালিকা লোড করা হলো।', 'success');
      loadPromotionData();
    } catch (e) {
      showNotification && showNotification('ডেমো নম্বর তৈরি ব্যর্থ: ' + e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== EXECUTE ANNUAL PROMOTION ====================
  const handleExecutePromotion = async () => {
    setIsExecuting(true);
    setShowConfirmModal(false);
    try {
      const payload = {
        source_year: selectedYear,
        target_year: targetYear,
        source_class: currentClass,
        target_class: targetClass,
        promotions: roster.map(r => ({
          id: r.id,
          student_id: r.student_id,
          action: r.promotion_action,
          method: r.promotion_method,
          new_roll: r.new_roll,
          department: currentClass === '8' ? r.target_department : r.department,
          approval_note: r.approval_note
        }))
      };

      const res = await api('/promotion/execute', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showNotification && showNotification(`🎉 অভিনন্দন! শ্রেণি ${toBnDigits(currentClass)} থেকে শ্রেণি ${toBnDigits(targetClass)} এ ${toBnDigits(res.count)} জন শিক্ষার্থীর প্রমোশন সফলভাবে সম্পন্ন ও ডাটাবেসে সংরক্ষিত হয়েছে!`, 'success');
      
      // Reload promotion history and data
      loadPromotionData();
    } catch (err) {
      showNotification && showNotification('প্রমোশন কার্যকর করতে ব্যর্থ: ' + err.message, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // ==================== HANDLERS: SSC FORM FILL-UP ====================
  // Toggle Principal's Special Approval for SSC
  const handleToggleSscApproval = (id, checked) => {
    setSscRoster(prev => prev.map(s => {
      if (s.id === id) {
        if (checked) {
          return {
            ...s,
            head_teacher_approved: true,
            ssc_status: s.is_pass ? 'approved' : 'special_approved',
            approval_type: s.is_pass ? 'regular' : 'head_teacher_special',
            approval_note: s.is_pass ? 'নিয়মিত উত্তীর্ণ (সকল বিষয়ে পাস)' : 'প্রধান শিক্ষকের বিশেষ অনুমতি ও অনুমোদন সাপেক্ষে'
          };
        } else {
          return {
            ...s,
            head_teacher_approved: false,
            ssc_status: 'detained',
            approval_type: 'none',
            approval_note: 'ফরমপূরণের অনুমতি স্থগিত / অযোগ্য'
          };
        }
      }
      return s;
    }));
  };

  // Change SSC Status directly
  const handleChangeSscStatus = (id, status) => {
    setSscRoster(prev => prev.map(s => {
      if (s.id === id) {
        if (status === 'approved') {
          return {
            ...s,
            ssc_status: 'approved',
            head_teacher_approved: true,
            approval_type: 'regular',
            approval_note: 'নিয়মিত উত্তীর্ণ'
          };
        } else if (status === 'special_approved') {
          return {
            ...s,
            ssc_status: 'special_approved',
            head_teacher_approved: true,
            approval_type: 'head_teacher_special',
            approval_note: 'প্রধান শিক্ষকের বিশেষ অনুমোদনপ্রাপ্ত'
          };
        } else {
          return {
            ...s,
            ssc_status: 'detained',
            head_teacher_approved: false,
            approval_type: 'none',
            approval_note: 'ফরমপূরণের অযোগ্য (Detained)'
          };
        }
      }
      return s;
    }));
  };

  // Update SSC Approval Note
  const handleUpdateSscNote = (id, note) => {
    setSscRoster(prev => prev.map(s => s.id === id ? { ...s, approval_note: note } : s));
  };

  // Bulk approve borderlines for SSC
  const handleBulkApproveSscBorderline = () => {
    let count = 0;
    setSscRoster(prev => prev.map(s => {
      if (!s.is_pass && s.failed_count > 0 && s.failed_count <= 2) {
        count++;
        return {
          ...s,
          head_teacher_approved: true,
          ssc_status: 'special_approved',
          approval_type: 'head_teacher_special',
          approval_note: `প্রধান শিক্ষকের বিশেষ অনুমতি (${toBnDigits(s.failed_count)} বিষয়ে শর্তসাপেক্ষ ছাড়)`
        };
      }
      return s;
    }));

    if (count > 0) {
      showNotification && showNotification(`১ বা ২ বিষয়ে অকৃতকার্য ${toBnDigits(count)} জন শিক্ষার্থীকে প্রধান শিক্ষকের বিশেষ অনুমোদনে এসএসসি ফরমপূরণের সুযোগ দেওয়া হয়েছে!`, 'success');
    } else {
      showNotification && showNotification('শর্তসাপেক্ষ অনুমোদনের যোগ্য নতুন শিক্ষার্থী পাওয়া যায়নি।', 'info');
    }
  };

  // Save SSC Candidate List
  const handleSaveSscList = async () => {
    try {
      setIsExecuting(true);
      const payload = {
        exam_id: selectedExamId,
        academic_year: selectedYear,
        candidates: sscRoster.map(s => ({
          id: s.id,
          student_id: s.student_id,
          status: s.ssc_status,
          approval_type: s.approval_type,
          approval_note: s.approval_note
        }))
      };

      const res = await api('/ssc-form-fillup/save', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showNotification && showNotification(`✓ ${res.message || '১০ম শ্রেণির এসএসসি ফরমপূরণ অনুমোদন তালিকা সফলভাবে সংরক্ষিত হয়েছে!'}`, 'success');
    } catch (e) {
      showNotification && showNotification('সংরক্ষণ ব্যর্থ: ' + e.message, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // ==================== CSV / PRINT EXPORTS ====================
  // Download Promotion CSV
  const handleDownloadPromotionCsv = () => {
    const headers = [
      'Merit_Rank',
      'Current_Roll',
      'Student_ID',
      'Student_Name',
      'Current_Class',
      'Target_Class',
      'Target_Group',
      'GPA',
      'Grade',
      'Total_Marks',
      'Pass_Status',
      'Failed_Subjects',
      'Promotion_Action',
      'Promotion_Method',
      'Head_Teacher_Approved',
      'New_Roll',
      'Approval_Remarks'
    ];

    const escapeCsv = (str) => {
      const v = str === null || str === undefined ? '' : String(str);
      return `"${v.replace(/"/g, '""')}"`;
    };

    const rows = roster.map(r => [
      escapeCsv(r.merit_position),
      escapeCsv(r.current_roll),
      escapeCsv(r.student_id),
      escapeCsv(r.name_bn),
      escapeCsv(currentClass),
      escapeCsv(targetClass),
      escapeCsv(currentClass === '8' ? r.target_department : r.department),
      escapeCsv(r.gpa),
      escapeCsv(r.final_grade),
      escapeCsv(r.total_marks),
      escapeCsv(r.is_pass ? 'উত্তীর্ণ' : 'অকৃতকার্য'),
      escapeCsv(r.failed_subjects.join(', ')),
      escapeCsv(r.promotion_action === 'promote' ? 'প্রমোশন' : 'পুনরাবৃত্তি'),
      escapeCsv(r.promotion_method === 'merit' ? 'মেধাক্রম' : r.promotion_method === 'special_approval' ? 'বিশেষ বিবেচনা' : '—'),
      escapeCsv(r.head_teacher_approved ? 'হ্যাঁ' : 'না'),
      escapeCsv(r.new_roll),
      escapeCsv(r.approval_note)
    ]);

    const lines = [headers.join(','), ...rows.map(r => r.join(','))];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Promotion_Class_${currentClass}_to_${targetClass}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification && showNotification('প্রমোশন শিট এক্সেল/CSV সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  // Download SSC Form Fill-up CSV
  const handleDownloadSscCsv = () => {
    const headers = [
      'SL',
      'Class_10_Roll',
      'Student_ID',
      'Student_Name',
      'Group_Department',
      'Test_GPA',
      'Test_Grade',
      'Total_Marks',
      'Test_Result',
      'Failed_Subjects',
      'Form_Fillup_Status',
      'Approval_Type',
      'Head_Teacher_Approved',
      'Guardian_Mobile',
      'Remarks'
    ];

    const escapeCsv = (str) => {
      const v = str === null || str === undefined ? '' : String(str);
      return `"${v.replace(/"/g, '""')}"`;
    };

    const rows = sscRoster.map((s, idx) => [
      escapeCsv(idx + 1),
      escapeCsv(s.roll_no),
      escapeCsv(s.student_id),
      escapeCsv(s.name_bn),
      escapeCsv(s.department),
      escapeCsv(s.gpa),
      escapeCsv(s.final_grade),
      escapeCsv(s.total_marks),
      escapeCsv(s.is_pass ? 'উত্তীর্ণ' : 'অকৃতকার্য'),
      escapeCsv(s.failed_subjects.join(', ')),
      escapeCsv(s.ssc_status === 'approved' ? 'নিয়মিত অনুমোদিত' : s.ssc_status === 'special_approved' ? 'বিশেষ অনুমোদন' : 'অযোগ্য'),
      escapeCsv(s.approval_type === 'regular' ? 'নিয়মিত' : s.approval_type === 'head_teacher_special' ? 'প্রধান শিক্ষকের বিশেষ অনুমতি' : '—'),
      escapeCsv(s.head_teacher_approved ? 'হ্যাঁ' : 'না'),
      escapeCsv(s.guardian_phone),
      escapeCsv(s.approval_note)
    ]);

    const lines = [headers.join(','), ...rows.map(r => r.join(','))];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSC_Candidate_Form_Fillup_List_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification && showNotification('এসএসসি ফরমপূরণ অনুমোদন তালিকা সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  // Print Official Sheet
  const handlePrintOfficialSheet = () => {
    window.print();
  };

  // Filtered Roster for View
  const filteredRoster = useMemo(() => {
    return roster.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (item.name_bn || '').toLowerCase().includes(q) ||
                      (item.student_id || '').toLowerCase().includes(q) ||
                      String(item.current_roll).includes(q) ||
                      String(item.new_roll).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [roster, searchQuery]);

  // Filtered SSC Roster for View
  const filteredSscRoster = useMemo(() => {
    return sscRoster.filter(item => {
      if (departmentFilter !== 'all' && !item.department.includes(departmentFilter)) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (item.name_bn || '').toLowerCase().includes(q) ||
                      (item.student_id || '').toLowerCase().includes(q) ||
                      String(item.roll_no).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [sscRoster, departmentFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    if (activeMode === 'annual_promotion') {
      const total = roster.length;
      const meritPromoted = roster.filter(s => s.promotion_action === 'promote' && s.promotion_method === 'merit').length;
      const specialPromoted = roster.filter(s => s.promotion_action === 'promote' && s.promotion_method === 'special_approval').length;
      const repeat = roster.filter(s => s.promotion_action === 'repeat').length;
      const targetTotal = meritPromoted + specialPromoted;
      return { total, meritPromoted, specialPromoted, repeat, targetTotal };
    } else {
      const total = sscRoster.length;
      const regularApproved = sscRoster.filter(s => s.ssc_status === 'approved').length;
      const specialApproved = sscRoster.filter(s => s.ssc_status === 'special_approved').length;
      const detained = sscRoster.filter(s => s.ssc_status === 'detained').length;
      const totalApproved = regularApproved + specialApproved;
      return { total, regularApproved, specialApproved, detained, totalApproved };
    }
  }, [roster, sscRoster, activeMode]);

  return (
    <div className="promotion-panel-container">
      {/* ================= HEADER & SUB-NAV ================= */}
      <div className="promo-top-nav no-print">
        <div className="promo-modes-switch">
          <button
            type="button"
            className={`promo-mode-btn ${activeMode === 'annual_promotion' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('annual_promotion');
              if (currentClass === '10') setCurrentClass('6');
            }}
          >
            🏆 ৬ষ্ঠ - ৯ম শ্রেণির বার্ষিক প্রমোশন
          </button>
          <button
            type="button"
            className={`promo-mode-btn ${activeMode === 'ssc_form_fillup' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('ssc_form_fillup');
              setCurrentClass('10');
            }}
          >
            🎓 ১০ম শ্রেণির এসএসসি পরীক্ষার ফরমপূরণ নির্বাচন
          </button>
          <button
            type="button"
            className={`promo-mode-btn ${activeMode === 'history' ? 'active' : ''}`}
            onClick={() => setActiveMode('history')}
          >
            📜 প্রমোশন হিস্ট্রি ও অডিট লগ
          </button>
        </div>
      </div>

      {/* ================= 1. MODE: ANNUAL PROMOTION ================= */}
      {activeMode === 'annual_promotion' && (
        <div className="promo-content-wrapper">
          {/* Context Toolbar */}
          <div className="promo-context-card no-print">
            <div className="promo-context-grid">
              <div className="context-item">
                <label>শিক্ষাবর্ষ (চলমান):</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {academicYears.map(ay => (
                    <option key={ay.id || ay.year} value={ay.year}>
                      {ay.title_bn || ay.year} {ay.is_current ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="context-item">
                <label>বার্ষিক পরীক্ষা:</label>
                <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                  {examsForYear.length === 0 ? (
                    <option value="">কোনো পরীক্ষা নেই</option>
                  ) : (
                    examsForYear.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name_bn} ({ex.exam_type})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="context-item">
                <label>বর্তমান শ্রেণি:</label>
                <select value={currentClass} onChange={(e) => setCurrentClass(e.target.value)}>
                  {['6', '7', '8', '9'].map(c => (
                    <option key={c} value={c}>শ্রেণি {toBnDigits(c)}</option>
                  ))}
                </select>
              </div>

              <div className="context-item highlight-box">
                <label>পরবর্তী শ্রেণি (প্রমোশন):</label>
                <div className="badge-target-class">
                  শ্রেণি <b>{toBnDigits(targetClass)}</b>
                </div>
              </div>

              <div className="context-item">
                <label>পরবর্তী শিক্ষাবর্ষ:</label>
                <input
                  type="text"
                  className="input-compact"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  placeholder="2027"
                />
              </div>
            </div>

            {/* Sub-toolbar with Actions */}
            <div className="promo-action-toolbar">
              <div className="toolbar-left">
                <input
                  type="text"
                  className="promo-search-input"
                  placeholder="🔍 শিক্ষার্থী খুঁজুন (রোল, আইডি, নাম)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="toolbar-right">
                <button
                  type="button"
                  className="btn-promo-action"
                  onClick={handleBulkApproveBorderline}
                  title="১ বা ২ বিষয়ে অকৃতকার্য শিক্ষার্থীদের প্রধান শিক্ষকের বিশেষ বিবেচনায় প্রমোশন"
                >
                  ⚖️ প্রধান শিক্ষকের বিশেষ বাল্ক অনুমোদন
                </button>
                <button
                  type="button"
                  className="btn-promo-action"
                  onClick={handleResetToMerit}
                  title="কেবলমাত্র মেধা তালিকায় উত্তীর্ণদের প্রমোশন ও রোল ১..N নির্ধারণ"
                >
                  ⚡ মেধানুযায়ী রোল বিন্যাস
                </button>
                <button
                  type="button"
                  className="btn-promo-action secondary"
                  onClick={handleGenerateDemoMarks}
                  title="ফলাফল খালি থাকলে ডেমো নম্বর দিয়ে পরীক্ষা করুন"
                >
                  🎲 ডেমো ফলাফল তৈরি
                </button>
                <button
                  type="button"
                  className="btn-promo-action"
                  onClick={handleDownloadPromotionCsv}
                >
                  📥 CSV/Excel ডাউনলোড
                </button>
                <button
                  type="button"
                  className="btn-promo-action secondary"
                  onClick={handlePrintOfficialSheet}
                >
                  🖨️ প্রমোশন শিট প্রিন্ট
                </button>
                <button
                  type="button"
                  className="btn-promo-primary"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isExecuting || !roster.length}
                >
                  🚀 প্রমোশন চূড়ান্ত কার্যকর করুন
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="promo-stats-cards no-print">
            <div className="promo-card">
              <span className="card-lbl">শ্রেণির মোট শিক্ষার্থী</span>
              <b className="card-val">{toBnDigits(metrics.total)}</b>
              <small>শ্রেণি {toBnDigits(currentClass)}</small>
            </div>
            <div className="promo-card card-green">
              <span className="card-lbl">মেধানুযায়ী প্রমোশন</span>
              <b className="card-val">{toBnDigits(metrics.meritPromoted)}</b>
              <small>পাসকৃত মেধা তালিকা</small>
            </div>
            <div className="promo-card card-amber">
              <span className="card-lbl">প্রধান শিক্ষকের বিশেষ বিবেচনা</span>
              <b className="card-val">{toBnDigits(metrics.specialPromoted)}</b>
              <small>অনুমোদিত বিশেষ প্রমোশন</small>
            </div>
            <div className="promo-card card-red">
              <span className="card-lbl">একই শ্রেণিতে পুনরাবৃত্তি</span>
              <b className="card-val">{toBnDigits(metrics.repeat)}</b>
              <small>প্রমোশন স্থগিত (Repeat)</small>
            </div>
            <div className="promo-card card-blue">
              <span className="card-lbl">পরবর্তী শ্রেণির মোট শিক্ষার্থী</span>
              <b className="card-val">{toBnDigits(metrics.targetTotal)}</b>
              <small>শ্রেণি {toBnDigits(targetClass)} এ উত্তীর্ণ</small>
            </div>
          </div>

          {/* Printable Official School Header (Only visible on print) */}
          <div className="print-official-header print-only">
            <h2>{MOCK_SCHOOL.name}</h2>
            <h4>EIIN: {MOCK_SCHOOL.eiin} • ডাকঘর: মগড়া, জেলা: টাঙ্গাইল</h4>
            <h3>বার্ষিক পরীক্ষা {toBnDigits(selectedYear)} শেষে শ্রেণি প্রমোশন ও মেধা তালিকা শিট</h3>
            <p>
              বর্তমান শ্রেণি: <b>{toBnDigits(currentClass)}</b> ➔ পরবর্তী উত্তীর্ণ শ্রেণি: <b>{toBnDigits(targetClass)} ({toBnDigits(targetYear)} শিক্ষাবর্ষ)</b>
            </p>
          </div>

          {/* Promotion Candidate Table */}
          <div className="promo-table-card">
            <div className="table-header-flex no-print">
              <h3>
                📋 শ্রেণি {toBnDigits(currentClass)} থেকে শ্রেণি {toBnDigits(targetClass)} এ প্রমোশন তালিকা ({toBnDigits(filteredRoster.length)} জন)
              </h3>
              <div className="table-legend">
                <span className="legend-item"><span className="dot dot-green"></span> মেধানুযায়ী প্রমোশন</span>
                <span className="legend-item"><span className="dot dot-amber"></span> প্রধান শিক্ষকের বিশেষ বিবেচনা</span>
                <span className="legend-item"><span className="dot dot-red"></span> পুনরাবৃত্তি (Repeat)</span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table promo-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>মেধা স্থান</th>
                    <th style={{ width: '60px' }}>বর্তমান রোল</th>
                    <th>শিক্ষার্থী আইডি</th>
                    <th>শিক্ষার্থীর নাম</th>
                    <th>বিভাগ</th>
                    <th style={{ width: '70px' }}>মোট নম্বর</th>
                    <th style={{ width: '80px' }}>GPA / গ্রেড</th>
                    <th>পরীক্ষার ফলাফল</th>
                    <th style={{ width: '150px' }}>প্রমোশন অবস্থা</th>
                    <th style={{ width: '180px' }}>প্রধান শিক্ষকের অনুমোদন</th>
                    {currentClass === '8' && <th style={{ width: '130px' }}>৯ম শ্রেণির বিভাগ</th>}
                    <th style={{ width: '90px' }}>পরবর্তী শ্রেণির নতুন রোল</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={currentClass === '8' ? 12 : 11} className="text-center py-4">
                        {isLoading ? '⏳ তথ্য লোড হচ্ছে...' : 'কোনো শিক্ষার্থী পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map(row => {
                      const isPromoted = row.promotion_action === 'promote';
                      const isSpecial = row.promotion_method === 'special_approval';

                      return (
                        <tr
                          key={row.id}
                          className={`promo-row ${isSpecial ? 'row-special' : isPromoted ? 'row-promoted' : 'row-repeat'}`}
                        >
                          {/* Merit Rank */}
                          <td className="text-center">
                            <span className={`rank-badge ${row.merit_position <= 3 ? 'top-three' : ''}`}>
                              {toBnDigits(row.merit_position)}
                            </span>
                          </td>

                          {/* Current Roll */}
                          <td className="text-center"><b>{toBnDigits(row.current_roll)}</b></td>

                          {/* ID */}
                          <td><span className="code-pill">{row.student_id}</span></td>

                          {/* Name */}
                          <td>
                            <b>{row.name_bn}</b>
                          </td>

                          {/* Department */}
                          <td><span className="sub-tag-compulsory">{row.department}</span></td>

                          {/* Total Marks */}
                          <td className="text-center"><b>{toBnDigits(row.total_marks)}</b></td>

                          {/* GPA & Grade */}
                          <td className="text-center">
                            <b className={row.final_grade === 'F' ? 'text-danger' : 'text-success'}>
                              {toBnDigits(row.gpa)}
                            </b>
                            <span className="grade-badge ml-1">{row.final_grade}</span>
                          </td>

                          {/* Pass/Fail details */}
                          <td>
                            {row.is_pass ? (
                              <span className="status-badge-pass">✓ উত্তীর্ণ</span>
                            ) : (
                              <span className="status-badge-fail">
                                ⚠ {toBnDigits(row.failed_count)} বিষয়ে অকৃতকার্য
                                <small className="d-block text-muted">
                                  {row.failed_subjects.slice(0, 2).join(', ')}
                                </small>
                              </span>
                            )}
                          </td>

                          {/* Promotion Action Dropdown */}
                          <td>
                            <select
                              className={`promo-select ${isSpecial ? 'select-amber' : isPromoted ? 'select-green' : 'select-red'}`}
                              value={row.promotion_action}
                              onChange={(e) => handleChangePromotionAction(row.id, e.target.value)}
                            >
                              <option value="promote">
                                {row.is_pass ? '🟢 উত্তীর্ণ (প্রমোশন)' : '🟡 বিশেষ বিবেচনা (প্রমোশন)'}
                              </option>
                              <option value="repeat">🔴 একই ক্লাসে (Repeat)</option>
                            </select>
                          </td>

                          {/* Principal's Approval Checkbox & Note */}
                          <td>
                            <div className="approval-control-group">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={row.head_teacher_approved}
                                  onChange={(e) => handleToggleSpecialApproval(row.id, e.target.checked)}
                                />
                                <span>{row.head_teacher_approved ? 'অনুমোদিত' : 'অনুমোদনহীন'}</span>
                              </label>
                              <input
                                type="text"
                                className="input-approval-note"
                                placeholder="অনুমোদনের নোট..."
                                value={row.approval_note}
                                onChange={(e) => handleUpdateNote(row.id, e.target.value)}
                              />
                            </div>
                          </td>

                          {/* Target Department for Class 8 -> 9 */}
                          {currentClass === '8' && (
                            <td>
                              <select
                                className="dept-select"
                                value={row.target_department}
                                onChange={(e) => handleUpdateTargetDept(row.id, e.target.value)}
                              >
                                <option value="বিজ্ঞান">বিজ্ঞান</option>
                                <option value="মানবিক">মানবিক</option>
                                <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</option>
                              </select>
                            </td>
                          )}

                          {/* New Roll Number (Editable) */}
                          <td className="text-center">
                            <input
                              type="number"
                              className={`input-new-roll ${isPromoted ? 'roll-active' : 'roll-disabled'}`}
                              value={row.new_roll}
                              onChange={(e) => handleUpdateNewRoll(row.id, e.target.value)}
                              disabled={!isPromoted}
                              title="পরবর্তী ক্লাসের নতুন রোল"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Official Footer with Signatures */}
            <div className="print-official-footer print-only">
              <div className="sig-row">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>শ্রেণি শিক্ষকের স্বাক্ষর</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>পরীক্ষা কমিটির আহ্বায়ক</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>প্রধান শিক্ষকের স্বাক্ষর ও সিল</span>
                  <b>{MOCK_SCHOOL.headTeacher}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. MODE: SSC FORM FILL-UP (CLASS 10) ================= */}
      {activeMode === 'ssc_form_fillup' && (
        <div className="promo-content-wrapper">
          {/* SSC Context Card */}
          <div className="promo-context-card no-print">
            <div className="promo-context-grid">
              <div className="context-item">
                <label>শিক্ষাবর্ষ:</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {academicYears.map(ay => (
                    <option key={ay.id || ay.year} value={ay.year}>
                      {ay.title_bn || ay.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="context-item">
                <label>নির্বাচনি পরীক্ষা (Test Exam):</label>
                <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                  {examsForYear.length === 0 ? (
                    <option value="">কোনো পরীক্ষা নেই</option>
                  ) : (
                    examsForYear.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name_bn}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="context-item highlight-box">
                <label>শ্রেণি:</label>
                <div className="badge-target-class">
                  শ্রেণি <b>১০ (দশম)</b>
                </div>
              </div>

              <div className="context-item">
                <label>বিভাগ/গ্রুপ ফিল্টার:</label>
                <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  <option value="all">সকল বিভাগ (All)</option>
                  <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                  <option value="মানবিক">মানবিক বিভাগ (Humanities)</option>
                  <option value="ব্যবসায়">ব্যবসায় শিক্ষা (Commerce)</option>
                </select>
              </div>
            </div>

            {/* SSC Action Toolbar */}
            <div className="promo-action-toolbar">
              <div className="toolbar-left">
                <input
                  type="text"
                  className="promo-search-input"
                  placeholder="🔍 ১০ম শ্রেণির পরীক্ষার্থী খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="toolbar-right">
                <button
                  type="button"
                  className="btn-promo-action"
                  onClick={handleBulkApproveSscBorderline}
                  title="১ বা ২ বিষয়ে ফেল করা পরীক্ষার্থীদের প্রধান শিক্ষকের বিশেষ অনুমতি দিন"
                >
                  ✍️ প্রধান শিক্ষকের শর্তসাপেক্ষ বিশেষ অনুমতি
                </button>
                <button
                  type="button"
                  className="btn-promo-action"
                  onClick={handleDownloadSscCsv}
                >
                  📥 ঢাকা বোর্ড eSIF CSV ডাউনলোড
                </button>
                <button
                  type="button"
                  className="btn-promo-action secondary"
                  onClick={handlePrintOfficialSheet}
                >
                  🖨️ অফিসিয়াল ফরমপূরণ শিট প্রিন্ট
                </button>
                <button
                  type="button"
                  className="btn-promo-primary"
                  onClick={handleSaveSscList}
                  disabled={isExecuting}
                >
                  💾 এসএসসি ফরমপূরণ তালিকা সংরক্ষণ
                </button>
              </div>
            </div>
          </div>

          {/* SSC Metrics Cards */}
          <div className="promo-stats-cards no-print">
            <div className="promo-card">
              <span className="card-lbl">১০ম শ্রেণির মোট পরীক্ষার্থী</span>
              <b className="card-val">{toBnDigits(metrics.total)}</b>
              <small>নির্বাচনি পরীক্ষায় অংশগ্রণকারী</small>
            </div>
            <div className="promo-card card-green">
              <span className="card-lbl">নিয়মিত ফরমপূরণ অনুমোদিত</span>
              <b className="card-val">{toBnDigits(metrics.regularApproved)}</b>
              <small>সকল বিষয়ে পাসকৃত</small>
            </div>
            <div className="promo-card card-amber">
              <span className="card-lbl">প্রধান শিক্ষকের বিশেষ অনুমতি</span>
              <b className="card-val">{toBnDigits(metrics.specialApproved)}</b>
              <small>শর্তসাপেক্ষে ফরমপূরণের সুযোগ</small>
            </div>
            <div className="promo-card card-red">
              <span className="card-lbl">অননুমোদিত / অযোগ্য</span>
              <b className="card-val">{toBnDigits(metrics.detained)}</b>
              <small>ফরমপূরণ স্থগিত (Detained)</small>
            </div>
            <div className="promo-card card-blue">
              <span className="card-lbl">সর্বমোট ফরমপূরণ পরীক্ষার্থী</span>
              <b className="card-val">{toBnDigits(metrics.totalApproved)}</b>
              <small>বোর্ড রেজিস্ট্রেশন চূড়ান্ত</small>
            </div>
          </div>

          {/* Print Official School Header for SSC */}
          <div className="print-official-header print-only">
            <h2>{MOCK_SCHOOL.name}</h2>
            <h4>EIIN: {MOCK_SCHOOL.eiin} • ডাকঘর: মগড়া, জেলা: টাঙ্গাইল</h4>
            <h3>এসএসসি পরীক্ষা {toBnDigits(selectedYear)} - নির্বাচনি পরীক্ষা শেষে ফরমপূরণ অনুমোদন তালিকা</h3>
            <p>
              ১০ম শ্রেণি • বোর্ড: ঢাকা শিক্ষা বোর্ড • শিক্ষাবর্ষ: {toBnDigits(selectedYear)}
            </p>
          </div>

          {/* SSC Candidate Selection Table */}
          <div className="promo-table-card">
            <div className="table-header-flex no-print">
              <h3>
                🎓 ১০ম শ্রেণির এসএসসি ফরমপূরণ অনুমোদন তালিকা ({toBnDigits(filteredSscRoster.length)} জন)
              </h3>
              <div className="table-legend">
                <span className="legend-item"><span className="dot dot-green"></span> নিয়মিত অনুমোদিত</span>
                <span className="legend-item"><span className="dot dot-amber"></span> বিশেষ অনুমোদনে ফরমপূরণ</span>
                <span className="legend-item"><span className="dot dot-red"></span> অযোগ্য (Detained)</span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table promo-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>ক্রমি</th>
                    <th style={{ width: '60px' }}>১০ম রোল</th>
                    <th>শিক্ষার্থী আইডি</th>
                    <th>পরীক্ষার্থীর নাম</th>
                    <th>বিভাগ/গ্রুপ</th>
                    <th style={{ width: '80px' }}>টেস্ট GPA</th>
                    <th style={{ width: '70px' }}>মোট নম্বর</th>
                    <th>টেস্ট ফলাফল</th>
                    <th style={{ width: '160px' }}>ফরমপূরণ অবস্থা</th>
                    <th style={{ width: '220px' }}>প্রধান শিক্ষকের অনুমোদন ও মন্তব্য</th>
                    <th>অভিভাবকের ফোন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSscRoster.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        {isLoading ? '⏳ তথ্য লোড হচ্ছে...' : 'কোনো পরীক্ষার্থী পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  ) : (
                    filteredSscRoster.map((row, idx) => {
                      const isApproved = row.ssc_status === 'approved';
                      const isSpecial = row.ssc_status === 'special_approved';

                      return (
                        <tr
                          key={row.id}
                          className={`promo-row ${isSpecial ? 'row-special' : isApproved ? 'row-promoted' : 'row-repeat'}`}
                        >
                          <td className="text-center">{toBnDigits(idx + 1)}</td>
                          <td className="text-center"><b>{toBnDigits(row.roll_no)}</b></td>
                          <td><span className="code-pill">{row.student_id}</span></td>
                          <td><b>{row.name_bn}</b></td>
                          <td><span className="sub-tag-compulsory">{row.department}</span></td>
                          <td className="text-center">
                            <b className={row.final_grade === 'F' ? 'text-danger' : 'text-success'}>
                              {toBnDigits(row.gpa)}
                            </b>
                            <span className="grade-badge ml-1">{row.final_grade}</span>
                          </td>
                          <td className="text-center"><b>{toBnDigits(row.total_marks)}</b></td>
                          <td>
                            {row.is_pass ? (
                              <span className="status-badge-pass">✓ পাস</span>
                            ) : (
                              <span className="status-badge-fail">
                                ⚠ {toBnDigits(row.failed_count)} ফেল
                                <small className="d-block text-muted">{row.failed_subjects.join(', ')}</small>
                              </span>
                            )}
                          </td>
                          <td>
                            <select
                              className={`promo-select ${isSpecial ? 'select-amber' : isApproved ? 'select-green' : 'select-red'}`}
                              value={row.ssc_status}
                              onChange={(e) => handleChangeSscStatus(row.id, e.target.value)}
                            >
                              <option value="approved">🟢 নিয়মিত ফরমপূরণ</option>
                              <option value="special_approved">🟡 বিশেষ অনুমোদনে ফরমপূরণ</option>
                              <option value="detained">🔴 ফরমপূরণে অযোগ্য (Detained)</option>
                            </select>
                          </td>
                          <td>
                            <div className="approval-control-group">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={row.head_teacher_approved}
                                  onChange={(e) => handleToggleSscApproval(row.id, e.target.checked)}
                                />
                                <span>{row.head_teacher_approved ? 'অনুমোদিত' : 'অনুমোদনহীন'}</span>
                              </label>
                              <input
                                type="text"
                                className="input-approval-note"
                                placeholder="অনুমোদনের কারণ/নোট..."
                                value={row.approval_note}
                                onChange={(e) => handleUpdateSscNote(row.id, e.target.value)}
                              />
                            </div>
                          </td>
                          <td>
                            <a href={`tel:${row.guardian_phone}`} className="phone-link">
                              📞 {row.guardian_phone}
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Official Footer with Signatures for SSC */}
            <div className="print-official-footer print-only">
              <div className="sig-row">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>১০ম শ্রেণির শ্রেণি শিক্ষক</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>পরীক্ষা নিয়ন্ত্রণ কমিটি আহ্বায়ক</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>প্রধান শিক্ষক (স্বাক্ষর ও সিল)</span>
                  <b>{MOCK_SCHOOL.headTeacher}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. MODE: PROMOTION HISTORY & AUDIT TRAIL ================= */}
      {activeMode === 'history' && (
        <div className="promo-content-wrapper">
          <div className="promo-table-card">
            <div className="table-header-flex no-print">
              <h3>📜 বিগত প্রমোশন হিস্ট্রি ও অডিট ট্রেইল ({toBnDigits(historyList.length)} রেকর্ড)</h3>
              <button type="button" className="btn-promo-action secondary" onClick={loadPromotionData}>
                🔄 রিফ্রেশ
              </button>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-exam-table">
                <thead>
                  <tr>
                    <th>তারিখ</th>
                    <th>শিক্ষার্থী আইডি</th>
                    <th>শিক্ষার্থীর নাম</th>
                    <th>সেশন পরিবর্তন</th>
                    <th>শ্রেণি পরিবর্তন</th>
                    <th>রোল পরিবর্তন</th>
                    <th>প্রমোশন পদ্ধতি</th>
                    <th>অনুমোদনের নোট</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        এখনও কোনো প্রমোশন হিস্ট্রি রেকর্ড নেই।
                      </td>
                    </tr>
                  ) : (
                    historyList.map((h, i) => (
                      <tr key={i}>
                        <td>{h.date || '—'}</td>
                        <td><span className="code-pill">{h.student_id}</span></td>
                        <td><b>{h.name_bn}</b></td>
                        <td>{toBnDigits(h.from_year)} ➔ {toBnDigits(h.to_year)}</td>
                        <td>
                          <b>শ্রেণি {toBnDigits(h.from_class)}</b> ➔ <b>শ্রেণি {toBnDigits(h.to_class)}</b>
                        </td>
                        <td>
                          রোল {toBnDigits(h.from_roll)} ➔ <b>রোল {toBnDigits(h.to_roll)}</b>
                        </td>
                        <td>
                          <span className={h.method === 'merit' ? 'status-badge-pass' : 'status-badge-special'}>
                            {h.method === 'merit' ? 'মেধাক্রম' : h.method === 'special_approval' ? 'প্রধান শিক্ষকের বিশেষ বিবেচনা' : 'পুনরাবৃত্তি'}
                          </span>
                        </td>
                        <td>{h.approval_note || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {showConfirmModal && (
        <div className="promo-modal-backdrop">
          <div className="promo-modal-content">
            <div className="promo-modal-header">
              <h3>⚠️ প্রমোশন চূড়ান্ত অনুমোদনের নিশ্চিতকরণ</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="promo-modal-body">
              <p className="lead-text">
                আপনি কি নিশ্চিত যে <b>শ্রেণি {toBnDigits(currentClass)}</b> এর শিক্ষার্থীদের ফলাফল অনুযায়ী <b>শ্রেণি {toBnDigits(targetClass)}</b> ({toBnDigits(targetYear)} শিক্ষাবর্ষ) এ প্রমোশন কার্যকর করতে চান?
              </p>

              <div className="promo-summary-breakdown">
                <div className="breakdown-item text-success">
                  <span>🏆 মেধানুযায়ী প্রমোশন:</span>
                  <b>{toBnDigits(metrics.meritPromoted)} জন</b>
                </div>
                <div className="breakdown-item text-amber">
                  <span>⚖️ প্রধান শিক্ষকের বিশেষ বিবেচনায় প্রমোশন:</span>
                  <b>{toBnDigits(metrics.specialPromoted)} জন</b>
                </div>
                <div className="breakdown-item text-danger">
                  <span>🔴 একই শ্রেণিতে অবস্থান (Repeat):</span>
                  <b>{toBnDigits(metrics.repeat)} জন</b>
                </div>
                <div className="breakdown-total">
                  <span>🎓 পরবর্তী শ্রেণিতে সর্বমোট নতুন শিক্ষার্থী:</span>
                  <b>{toBnDigits(metrics.targetTotal)} জন</b>
                </div>
              </div>

              <div className="safety-note">
                ℹ️ <b>নিরাপত্তা নোট:</b> এই শিক্ষার্থীদের বর্তমান শ্রেণি ও রোল নম্বর আপডেট হবে এবং পূর্বের তথ্য শিক্ষার্থীর প্রোফাইলের <code>promotion_history</code>-তে স্থায়ীভাবে সংরক্ষিত থাকবে।
              </div>
            </div>
            <div className="promo-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                className="btn-confirm-execute"
                onClick={handleExecutePromotion}
                disabled={isExecuting}
              >
                {isExecuting ? '⏳ প্রমোশন কার্যকর হচ্ছে...' : '✓ হ্যাঁ, প্রমোশন কার্যকর করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromotionPanel;
