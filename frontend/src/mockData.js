// Comprehensive Standalone Mock Data & Offline Observation Engine for Magra School Management ERP V118
export const MOCK_SCHOOL = {
  nameBn: 'মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়',
  nameEn: 'Magra Pals Union High School',
  eiin: '114290',
  mpo: '4206071302',
  established: '1946',
  address: 'মগড়া, কালিহাতি, টাংগাইল',
  email: 'magrapuhs.46@gmail.com',
  phone: '01712-345678',
  classes: ['6', '7', '8', '9', '10'],
  president: 'নেয়ামুল হক খান',
  headTeacher: 'মুহাম্মদ শফিকুল ইসলাম',
  assistantHeadTeacher: 'তাপসী সরকার',
  ictTeacher: 'মুহাম্মদ আবুবকর সিদ্দিক',
  officeAssistant: 'মোঃ আলমগীর হোসেন',
  buildingImage: '/school-building.jpg',
  logo: '/school-logo.png'
};

export const MOCK_USERS = [
  { id: 'u-1', login_id: 'admin', full_name: 'সুপার অ্যাডমিন (মুহাম্মদ শফিকুল ইসলাম)', role_name: 'super_admin', role_label: 'সুপার অ্যাডমিন', is_active: true, must_change_password: false },
  { id: 'u-2', login_id: 'head_teacher', full_name: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)', role_name: 'head_teacher', role_label: 'প্রধান শিক্ষক', is_active: true, must_change_password: false },
  { id: 'u-3', login_id: 'assistant_head_teacher', full_name: 'তাপসী সরকার (সহকারী প্রধান শিক্ষক)', role_name: 'assistant_head_teacher', role_label: 'সহকারী প্রধান শিক্ষক', is_active: true, must_change_password: false },
  { id: 'u-4', login_id: 'pilot-teacher-01', full_name: 'মুহাম্মদ আবুবকর সিদ্দিক (আইসিটি শিক্ষক)', role_name: 'teacher', role_label: 'সহকারী শিক্ষক (আইসিটি)', is_active: true, must_change_password: false },
  { id: 'u-5', login_id: 'pilot-student-06-01', full_name: 'মাহির আহমেদ (শ্রেণি ৬, রোল ১)', role_name: 'student', role_label: 'শিক্ষার্থী (৬ষ্ঠ শ্রেণি)', is_active: true, student_id: 'STU-2026-0601', class_name: '6', must_change_password: false },
  { id: 'u-6', login_id: 'pilot-student-10-01', full_name: 'সাকিব আল হাসান (শ্রেণি ১০, রোল ১)', role_name: 'student', role_label: 'শিক্ষার্থী (১০ম শ্রেণি)', is_active: true, student_id: 'STU-2026-1001', class_name: '10', must_change_password: false },
  { id: 'u-7', login_id: 'pilot-guardian-01', full_name: 'রফিকুল ইসলাম (অভিভাবক)', role_name: 'guardian', role_label: 'অভিভাবক', is_active: true, student_name: 'মাহির আহমেদ', student_id: 'STU-2026-0601', class_name: '6', must_change_password: false },
  { id: 'u-8', login_id: 'accountant', full_name: 'মোঃ জহিরুল হক (হিসাবরক্ষক)', role_name: 'accountant', role_label: 'হিসাবরক্ষক', is_active: true, must_change_password: false },
  { id: 'u-9', login_id: 'librarian', full_name: 'আয়েশা সিদ্দিকা (গ্রন্থাগারিক)', role_name: 'librarian', role_label: 'গ্রন্থাগারিক', is_active: true, must_change_password: false },
  { id: 'u-10', login_id: 'staff', full_name: 'মোঃ আলমগীর হোসেন (অফিস সহকারী)', role_name: 'staff', role_label: 'অফিস সহকারী', is_active: true, must_change_password: false }
];

export const MOCK_STUDENTS = [
  {
    id: 's-1', student_id: 'STU-2026-0601', roll_no: 1, name_bn: 'মাহির আহমেদ', name_en: 'Mahir Ahmed', class_name: '6', section: 'A', gender: 'পুরুষ', date_of_birth: '2014-03-15', blood_group: 'A+', religion: 'ইসলাম',
    father_name: 'রফিকুল ইসলাম', father_name_en: 'Rafiqul Islam', father_nid_no: '19802611429012345', father_profession: 'কৃষি ও ব্যবসা', father_mobile: '01711223344',
    mother_name: 'রাশেদা বেগম', mother_name_en: 'Rasheda Begum', mother_nid_no: '19842611429067890', mother_profession: 'গৃহিণী', mother_mobile: '01722334455',
    guardian_name: 'রফিকুল ইসলাম', guardian_relation: 'পিতা', guardian_phone: '01711223344', guardian_email: 'rafiqul.magra@gmail.com',
    current_village: 'মগড়া', current_post_office: 'মগড়া', current_upazila: 'কালিহাতি', current_district: 'টাঙ্গাইল',
    permanent_village: 'মগড়া', permanent_post_office: 'মগড়া', permanent_upazila: 'কালিহাতি', permanent_district: 'টাঙ্গাইল',
    admission_date: '2026-01-05', admission_class: '6', previous_school: 'মগড়া সরকারি প্রাথমিক বিদ্যালয়', primary_completion_year: '2025', primary_registration_no: 'PSC-2025-1142',
    birth_registration_no: '20142611429000101', student_nid_no: '', emergency_phone: '01711223344', status: 'active',
    voter_no: 'V-0601', voter_name: 'রফিকুল ইসলাম'
  },
  {
    id: 's-2', student_id: 'STU-2026-0602', roll_no: 2, name_bn: 'তানজিলা আক্তার', name_en: 'Tanzila Akter', class_name: '6', section: 'A', gender: 'নারী', date_of_birth: '2014-06-20', blood_group: 'B+', religion: 'ইসলাম',
    father_name: 'মৃত আনোয়ার হোসেন', father_name_en: 'Late Anwar Hossain', father_nid_no: '', father_profession: 'প্রয়াত', father_mobile: '',
    mother_name: 'সুলতানা পারভীন', mother_name_en: 'Sultana Parveen', mother_nid_no: '19862611429055443', mother_profession: 'শিক্ষিকা', mother_mobile: '01733445566',
    guardian_name: 'সুলতানা পারভীন', guardian_relation: 'মাতা', guardian_phone: '01733445566', guardian_email: 'sultana.tanzila@gmail.com',
    current_village: 'চারান', current_post_office: 'চারান', current_upazila: 'কালিহাতি', current_district: 'টাঙ্গাইল',
    permanent_village: 'চারান', permanent_post_office: 'চারান', permanent_upazila: 'কালিহাতি', permanent_district: 'টাঙ্গাইল',
    admission_date: '2026-01-05', admission_class: '6', previous_school: 'চারান সরকারি প্রাথমিক বিদ্যালয়', primary_completion_year: '2025', primary_registration_no: 'PSC-2025-1143',
    birth_registration_no: '20142611429000102', student_nid_no: '', emergency_phone: '01733445566', status: 'active',
    voter_no: 'V-0602', voter_name: 'সুলতানা পারভীন'
  },
  {
    id: 's-3', student_id: 'STU-2026-0701', roll_no: 1, name_bn: 'আরিফুল ইসলাম', name_en: 'Ariful Islam', class_name: '7', section: 'A', gender: 'পুরুষ', date_of_birth: '2013-04-10', blood_group: 'O+', religion: 'ইসলাম',
    father_name: 'মোঃ মোজাম্মেল হক', father_name_en: 'Md. Mozammel Hoque', father_nid_no: '19782611429011223', father_profession: 'ব্যবসায়ী', father_mobile: '01744556677',
    mother_name: 'নাজমা বেগম', mother_name_en: 'Nazma Begum', mother_nid_no: '19822611429033445', mother_profession: 'গৃহিণী', mother_mobile: '01755667788',
    guardian_name: 'মোঃ মোজাম্মেল হক', guardian_relation: 'পিতা', guardian_phone: '01744556677', guardian_email: '',
    current_village: 'সহদেবপুর', current_post_office: 'সহদেবপুর', current_upazila: 'কালিহাতি', current_district: 'টাঙ্গাইল',
    permanent_village: 'সহদেবপুর', permanent_post_office: 'সহদেবপুর', permanent_upazila: 'কালিহাতি', permanent_district: 'টাঙ্গাইল',
    admission_date: '2025-01-06', admission_class: '6', previous_school: 'সহদেবপুর প্রাথমিক বিদ্যালয়', primary_completion_year: '2024', primary_registration_no: 'PSC-2024-0988',
    birth_registration_no: '20132611429000201', student_nid_no: '', emergency_phone: '01744556677', status: 'active',
    voter_no: 'V-0701', voter_name: 'মোঃ মোজাম্মেল হক'
  },
  {
    id: 's-4', student_id: 'STU-2026-0801', roll_no: 1, name_bn: 'নুসরাত জাহান মিমি', name_en: 'Nusrat Jahan Mimi', class_name: '8', section: 'A', gender: 'নারী', date_of_birth: '2012-08-25', blood_group: 'AB+', religion: 'ইসলাম',
    father_name: 'মোঃ হাবিবুর রহমান', father_name_en: 'Md. Habibur Rahman', father_nid_no: '19762611429099887', father_profession: 'প্রবাসী (সৌদি আরব)', father_mobile: '01766778899', father_abroad_country: 'সৌদি আরব',
    mother_name: 'আমেনা খাতুন', mother_name_en: 'Amena Khatun', mother_nid_no: '19802611429077665', mother_profession: 'গৃহিণী', mother_mobile: '01766778899',
    guardian_name: 'আমেনা খাতুন', guardian_relation: 'মাতা', guardian_phone: '01766778899', guardian_email: '',
    current_village: 'মগড়া', current_post_office: 'মগড়া', current_upazila: 'কালিহাতি', current_district: 'টাঙ্গাইল',
    permanent_village: 'মগড়া', permanent_post_office: 'মগড়া', permanent_upazila: 'কালিহাতি', permanent_district: 'টাঙ্গাইল',
    admission_date: '2024-01-08', admission_class: '6', previous_school: 'মগড়া সরকারি প্রাথমিক বিদ্যালয়', primary_completion_year: '2023', primary_registration_no: 'PSC-2023-0544',
    birth_registration_no: '20122611429000301', student_nid_no: '', emergency_phone: '01766778899', status: 'active',
    voter_no: 'V-0801', voter_name: 'আমেনা খাতুন'
  },
  {
    id: 's-5', student_id: 'STU-2026-0901', roll_no: 1, name_bn: 'সাদিয়া তাসনিম', name_en: 'Sadia Tasnim', class_name: '9', section: 'বিজ্ঞান', gender: 'নারী', date_of_birth: '2011-02-14', blood_group: 'A+', religion: 'ইসলাম',
    father_name: 'মোঃ কামরুজ্জামান', father_name_en: 'Md. Kamruzzaman', father_nid_no: '19752611429033221', father_profession: 'সরকারি চাকরিজীবী', father_mobile: '01777889900',
    mother_name: 'ফারজানা আক্তার', mother_name_en: 'Farzana Akter', mother_nid_no: '19812611429055667', mother_profession: 'গৃহিণী', mother_mobile: '01788990011',
    guardian_name: 'মোঃ কামরুজ্জামান', guardian_relation: 'পিতা', guardian_phone: '01777889900', guardian_email: 'sadia.parent@gmail.com',
    current_village: 'পটল', current_post_office: 'পটল', current_upazila: 'কালিহাতি', current_district: 'টাঙ্গাইল',
    permanent_village: 'পটল', permanent_post_office: 'পটল', permanent_upazila: 'কালিহাতি', permanent_district: 'টাঙ্গাইল',
    admission_date: '2023-01-10', admission_class: '6', previous_school: 'পটল সরকারি প্রাথমিক বিদ্যালয়', primary_completion_year: '2022', primary_registration_no: 'PSC-2022-0412',
    birth_registration_no: '20112611429000401', student_nid_no: '', emergency_phone: '01777889900', status: 'active',
    voter_no: 'V-0901', voter_name: 'মোঃ কামরুজ্জামান'
  },
  {
    id: 's-6', student_id: 'STU-2026-1001', roll_no: 1, name_bn: 'সাকিব আল হাসান', name_en: 'Sakib Al Hasan', class_name: '10', section: 'বিজ্ঞান', gender: 'পুরুষ', date_of_birth: '2010-09-12', blood_group: 'O+', religion: 'ইসলাম',
    father_name: 'মোঃ শফিকুল ইসলাম তালুকদার', father_name_en: 'Md. Shafiqul Islam Talukder', father_nid_no: '19742611429088776', father_profession: 'ব্যবসায়ী', father_mobile: '01799001122',
    mother_name: 'নাছিমা বেগম', mother_name_en: 'Nasima Begum', mother_nid_no: '19792611429022334', mother_profession: 'গৃহিণী', mother_mobile: '01700112233',
    guardian_name: 'মোঃ শফিকুল ইসলাম তালুকদার', guardian_relation: 'পিতা', guardian_phone: '01799001122', guardian_email: 'shafiqul.sakib@gmail.com',
    current_village: 'মগড়া', current_post_office: 'মগড়া', current_upazila: 'কালিহাতি', current_district: 'টাঙ্গাইল',
    permanent_village: 'মগড়া', permanent_post_office: 'মগড়া', permanent_upazila: 'কালিহাতি', permanent_district: 'টাঙ্গাইল',
    admission_date: '2022-01-08', admission_class: '6', previous_school: 'মগড়া সরকারি প্রাথমিক বিদ্যালয়', primary_completion_year: '2021', primary_registration_no: 'PSC-2021-0219',
    birth_registration_no: '20102611429000501', student_nid_no: '', emergency_phone: '01799001122', status: 'active',
    voter_no: 'V-1001', voter_name: 'মোঃ শফিকুল ইসলাম তালুকদার'
  }
];

export const MOCK_TEACHERS = [
  { id: 't-1', employee_id: 'EMP-001', name_bn: 'মুহাম্মদ শফিকুল ইসলাম', name_en: 'Muhammad Shafiqul Islam', designation: 'প্রধান শিক্ষক', designation_en: 'Head Teacher', subject: 'গণিত ও বিজ্ঞান', phone: '01712-345678', email: 'headteacher.magra@gmail.com', status: 'active', joining_date: '2010-03-01', first_mpo_date: '2010-06-01', gender: 'পুরুষ', blood_group: 'B+', public_contact_role: 'head_teacher', public_contact_enabled: true },
  { id: 't-2', employee_id: 'EMP-002', name_bn: 'তাপসী সরকার', name_en: 'Tapashi Sarker', designation: 'সহকারী প্রধান শিক্ষক', designation_en: 'Assistant Head Teacher', subject: 'ইংরেজি', phone: '01713-456789', email: 'assthead.magra@gmail.com', status: 'active', joining_date: '2012-07-15', first_mpo_date: '2012-10-01', gender: 'নারী', blood_group: 'A+', public_contact_role: 'assistant_head_teacher', public_contact_enabled: true },
  { id: 't-3', employee_id: 'EMP-003', name_bn: 'মুহাম্মদ আবুবকর সিদ্দিক', name_en: 'Muhammad Abubakar Siddique', designation: 'সহকারী শিক্ষক (আইসিটি)', designation_en: 'Assistant Teacher (ICT)', subject: 'আইসিটি ও কম্পিউটার', phone: '01714-567890', email: 'ict.magra@gmail.com', status: 'active', joining_date: '2016-01-10', first_mpo_date: '2016-04-01', gender: 'পুরুষ', blood_group: 'O+', public_contact_role: 'ict_teacher', public_contact_enabled: true },
  { id: 't-4', employee_id: 'EMP-004', name_bn: 'রফিকুল ইসলাম', name_en: 'Rafiqul Islam', designation: 'সহকারী শিক্ষক (বাংলা)', designation_en: 'Assistant Teacher (Bangla)', subject: 'বাংলা সাহিত্য ও ব্যাকরণ', phone: '01715-678901', email: 'bangla.magra@gmail.com', status: 'active', joining_date: '2014-02-01', first_mpo_date: '2014-05-01', gender: 'পুরুষ', blood_group: 'AB+' },
  { id: 't-5', employee_id: 'EMP-005', name_bn: 'নাসরিন সুলতানা', name_en: 'Nasrin Sultana', designation: 'সহকারী শিক্ষক (সামাজিক বিজ্ঞান)', designation_en: 'Assistant Teacher (Social Science)', subject: 'বাংলাদেশ ও বিশ্বপরিচয়', phone: '01716-789012', email: 'social.magra@gmail.com', status: 'active', joining_date: '2015-09-01', first_mpo_date: '2015-12-01', gender: 'নারী', blood_group: 'A+' },
  { id: 't-6', employee_id: 'EMP-006', name_bn: 'মোঃ কামরুল হাসান', name_en: 'Md. Kamrul Hasan', designation: 'সহকারী শিক্ষক (পদার্থ ও রসায়ন)', designation_en: 'Assistant Teacher (Science)', subject: 'পদার্থবিজ্ঞান ও রসায়ন', phone: '01717-890123', email: 'science.magra@gmail.com', status: 'active', joining_date: '2018-04-01', first_mpo_date: '2018-07-01', gender: 'পুরুষ', blood_group: 'B+' },
  { id: 't-7', employee_id: 'EMP-007', name_bn: 'মাহমুদা আক্তার', name_en: 'Mahmuda Akter', designation: 'সহকারী শিক্ষক (জীববিজ্ঞান ও কৃষি)', designation_en: 'Assistant Teacher (Biology & Agri)', subject: 'জীববিজ্ঞান ও কৃষিশিক্ষা', phone: '01718-901234', email: 'biology.magra@gmail.com', status: 'active', joining_date: '2019-01-15', first_mpo_date: '2019-04-01', gender: 'নারী', blood_group: 'O+' },
  { id: 't-8', employee_id: 'EMP-008', name_bn: 'মোঃ আতিকুর রহমান', name_en: 'Md. Atiqur Rahman', designation: 'সহকারী শিক্ষক (শারীরিক শিক্ষা)', designation_en: 'Assistant Teacher (Physical Ed.)', subject: 'শারীরিক শিক্ষা ও স্বাস্থ্য', phone: '01719-012345', email: 'sports.magra@gmail.com', status: 'active', joining_date: '2017-08-01', first_mpo_date: '2017-11-01', gender: 'পুরুষ', blood_group: 'A+' }
];

export const MOCK_STAFF = [
  { id: 'st-1', employee_id: 'STF-001', name_bn: 'মোঃ জহিরুল হক', designation: 'হিসাবরক্ষক', phone: '01720-123456', email: 'accounts.magra@gmail.com', status: 'active', joining_date: '2013-05-01' },
  { id: 'st-2', employee_id: 'STF-002', name_bn: 'আয়েশা সিদ্দিকা', designation: 'সহকারী গ্রন্থাগারিক', phone: '01721-234567', email: 'library.magra@gmail.com', status: 'active', joining_date: '2017-02-15' },
  { id: 'st-3', employee_id: 'STF-003', name_bn: 'মোঃ আলমগীর হোসেন', designation: 'অফিস সহকারী কাম কম্পিউটার অপারেটর', phone: '01722-345678', email: 'office.magra@gmail.com', status: 'active', joining_date: '2018-09-01', public_contact_role: 'office_assistant', public_contact_enabled: true },
  { id: 'st-4', employee_id: 'STF-004', name_bn: 'মোঃ শাহজাহান মিয়া', designation: 'অফিস সহায়ক (MLSS)', phone: '01723-456789', email: '', status: 'active', joining_date: '2011-01-01' },
  { id: 'st-5', employee_id: 'STF-005', name_bn: 'মোঃ কাশেম আলী', designation: 'নিরাপত্তাকর্মী ও নৈশপ্রহরী', phone: '01724-567890', email: '', status: 'active', joining_date: '2015-06-01' }
];

export const MOCK_COMMITTEE = [
  { name_bn: 'নেয়ামুল হক খান', role: 'সভাপতি', designation: 'বিশিষ্ট শিক্ষানুরাগী ও সমাজসেবক', tenure: '২০২৪–২০২৬' },
  { name_bn: 'মুহাম্মদ শফিকুল ইসলাম', role: 'সদস্য সচিব', designation: 'প্রধান শিক্ষক, মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়', tenure: 'পদাধিকার বলে' },
  { name_bn: 'আলহাজ্ব মোঃ আব্দুল লতিফ', role: 'দাতা সদস্য', designation: 'ভূমি ও তহবিল দাতা', tenure: '২০২৪–২০২৬' },
  { name_bn: 'মোঃ রফিকুল ইসলাম তালুকদার', role: 'অভিভাবক প্রতিনিধি', designation: 'সম্মানিত অভিভাবক', tenure: '২০২৪–২০২৬' },
  { name_bn: 'বেগম ফরিদা ইয়াসমিন', role: 'সংরক্ষিত মহিলা অভিভাবক প্রতিনিধি', designation: 'সম্মানিত অভিভাবক', tenure: '২০২৪–২০২৬' },
  { name_bn: 'তাপসী সরকার', role: 'শিক্ষক প্রতিনিধি', designation: 'সহকারী প্রধান শিক্ষক', tenure: '২০২৪–২০২৬' },
  { name_bn: 'মুহাম্মদ আবুবকর সিদ্দিক', role: 'শিক্ষক প্রতিনিধি', designation: 'সহকারী শিক্ষক (আইসিটি)', tenure: '২০২৪–২০২৬' },
  { name_bn: 'ডাঃ আশরাফুল আলম', role: 'হিতৈষী সদস্য', designation: 'বিশিষ্ট চিকিৎসক ও সমাজসেবক', tenure: '২০২৪–২০২৬' }
];

export const MOCK_NOTICES = [
  { id: 1, title_bn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ ২০২৬ এর চূড়ান্ত সময়সূচি', body: 'সকল শিক্ষক, শিক্ষার্থী ও অভিভাবকদের জানানো যাচ্ছে যে, আগামী ১৫-১৮ ফেব্রুয়ারি ২০২৬ বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ অনুষ্ঠিত হবে। সকল ইভেন্টে অংশগ্রহণে ইচ্ছুক শিক্ষার্থীদের নিজ নিজ শ্রেণি শিক্ষকের কাছে নাম তালিকাভুক্ত করার নির্দেশ দেওয়া হলো।', notice_date: '2026-02-01', urgent: true },
  { id: 2, title_bn: '১ম সাময়িক পরীক্ষা ২০২৬ এর সময়সূচি ও পরীক্ষার ফি সংক্রান্ত বিজ্ঞপ্তি', body: '৬ষ্ঠ থেকে ১০ম শ্রেণির ১ম সাময়িক পরীক্ষা আগামী ১০ মার্চ ২০২৬ থেকে শুরু হবে। আগামী ২৮ ফেব্রুয়ারির মধ্যে যাবতীয় বকেয়া বেতন ও পরীক্ষার ফি পরিশোধ করে অফিস কক্ষ থেকে প্রবেশপত্র (Admit Card) সংগ্রহ করার জন্য বলা হলো।', notice_date: '2026-01-25', urgent: false },
  { id: 3, title_bn: 'বিদ্যালয়ের খসড়া ভোটার তালিকা- ২০২৬ প্রকাশ ও আপত্তি দাখিল', body: 'বিদ্যালয়ের পরিচালনা কমিটির নির্বাচনের লক্ষ্যে প্রণীত ৬ষ্ঠ-১০ম শ্রেণির অভিভাবকদের খসড়া ভোটার তালিকা নোটিশবোর্ড ও অনলাইন পোর্টালে প্রকাশ করা হয়েছে। আগামী ১৫ কর্মদিবসের মধ্যে যে কোনো সংশোধন বা সংযোজনের আবেদন জমা দেওয়া যাবে।', notice_date: '2026-01-20', urgent: false },
  { id: 4, title_bn: 'ডিজিটাল শেখ রাসেল কম্পিউটার ল্যাব ও রোবটিক্স ক্লাসের রুটিন', body: 'আইসিটি শিক্ষা সমৃদ্ধকরণে নবম ও দশম শ্রেণির শিক্ষার্থীদের জন্য সপ্তাহে ৩ দিন অতিরিক্ত ল্যাব ক্লাস ও রোবটিক্স ওয়ার্কশপ চালু করা হয়েছে। বিস্তারিত সময়সূচি আইসিটি শিক্ষকের কাছে পাওয়া যাবে।', notice_date: '2026-01-15', urgent: false },
  { id: 5, title_bn: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের মাঝে স্কুল ড্রেস ও শিক্ষা উপকরণ বিতরণ', body: 'গভর্নিং বডির সিদ্ধান্ত অনুযায়ী ২০২৬ শিক্ষাবর্ষে অসচ্ছল ও মেধাবী শিক্ষার্থীদের মাঝে বিনামূল্যে স্কুল ড্রেস, ব্যাগ ও শিক্ষা সহায়ক খাতা-কলম বিতরণ করা হয়েছে।', notice_date: '2026-01-10', urgent: false }
];

export const MOCK_EXAMS = [
  { id: 'ex-1', name_bn: '১ম সাময়িক পরীক্ষা ২০২৬', exam_type: 'অভ্যন্তরীণ', start_date: '2026-03-10', end_date: '2026-03-24', status: 'published' },
  { id: 'ex-2', name_bn: 'অর্ধবার্ষিক পরীক্ষা ২০২৬', exam_type: 'অভ্যন্তরীণ', start_date: '2026-06-15', end_date: '2026-06-30', status: 'draft' },
  { id: 'ex-3', name_bn: 'বার্ষিক পরীক্ষা ২০২৫ (সম্পন্ন)', exam_type: 'বার্ষিক', start_date: '2025-11-20', end_date: '2025-12-05', status: 'published' }
];

export const MOCK_SUBJECTS = [
  { id: 'sub-1', class_name: '6', name_bn: 'বাংলা', code: '101', full_marks: 100, pass_marks: 33 },
  { id: 'sub-2', class_name: '6', name_bn: 'ইংরেজি', code: '107', full_marks: 100, pass_marks: 33 },
  { id: 'sub-3', class_name: '6', name_bn: 'গণিত', code: '109', full_marks: 100, pass_marks: 33 },
  { id: 'sub-4', class_name: '6', name_bn: 'বিজ্ঞান', code: '127', full_marks: 100, pass_marks: 33 },
  { id: 'sub-5', class_name: '6', name_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', code: '154', full_marks: 50, pass_marks: 17 },
  { id: 'sub-6', class_name: '6', name_bn: 'বাংলাদেশ ও বিশ্বপরিচয়', code: '150', full_marks: 100, pass_marks: 33 },
  { id: 'sub-7', class_name: '6', name_bn: 'ধর্ম ও নৈতিক শিক্ষা', code: '111', full_marks: 100, pass_marks: 33 },
  { id: 'sub-8', class_name: '10', name_bn: 'বাংলা ১ম ও ২য় পত্র', code: '101', full_marks: 100, pass_marks: 33 },
  { id: 'sub-9', class_name: '10', name_bn: 'ইংরেজি ১ম ও ২য় পত্র', code: '107', full_marks: 100, pass_marks: 33 },
  { id: 'sub-10', class_name: '10', name_bn: 'উচ্চতর গণিত', code: '126', full_marks: 100, pass_marks: 33 },
  { id: 'sub-11', class_name: '10', name_bn: 'পদার্থবিজ্ঞান', code: '136', full_marks: 100, pass_marks: 33 },
  { id: 'sub-12', class_name: '10', name_bn: 'রসায়ন', code: '137', full_marks: 100, pass_marks: 33 },
  { id: 'sub-13', class_name: '10', name_bn: 'জীববিজ্ঞান', code: '138', full_marks: 100, pass_marks: 33 }
];

export const MOCK_ROUTINES = [
  { id: 'r-1', class_name: '6', section: 'A', day_of_week: '1', start_time: '10:00', end_time: '10:45', subject_name: 'বাংলা', teacher_name: 'রফিকুল ইসলাম', room: '১০১' },
  { id: 'r-2', class_name: '6', section: 'A', day_of_week: '1', start_time: '10:45', end_time: '11:30', subject_name: 'ইংরেজি', teacher_name: 'তাপসী সরকার', room: '১০১' },
  { id: 'r-3', class_name: '6', section: 'A', day_of_week: '1', start_time: '11:30', end_time: '12:15', subject_name: 'গণিত', teacher_name: 'মুহাম্মদ শফিকুল ইসলাম', room: '১০১' },
  { id: 'r-4', class_name: '6', section: 'A', day_of_week: '1', start_time: '12:45', end_time: '01:30', subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি', teacher_name: 'মুহাম্মদ আবুবকর সিদ্দিক', room: 'ল্যাব-১' },
  { id: 'r-5', class_name: '6', section: 'A', day_of_week: '1', start_time: '01:30', end_time: '02:15', subject_name: 'বিজ্ঞান', teacher_name: 'মোঃ কামরুল হাসান', room: '১০১' },
  { id: 'r-6', class_name: '10', section: 'বিজ্ঞান', day_of_week: '1', start_time: '10:00', end_time: '10:45', subject_name: 'পদার্থবিজ্ঞান', teacher_name: 'মোঃ কামরুল হাসান', room: '২০১' },
  { id: 'r-7', class_name: '10', section: 'বিজ্ঞান', day_of_week: '1', start_time: '10:45', end_time: '11:30', subject_name: 'উচ্চতর গণিত', teacher_name: 'মুহাম্মদ শফিকুল ইসলাম', room: '২০১' },
  { id: 'r-8', class_name: '10', section: 'বিজ্ঞান', day_of_week: '1', start_time: '11:30', end_time: '12:15', subject_name: 'রসায়ন', teacher_name: 'মোঃ কামরুল হাসান', room: '২০১' }
];

export const MOCK_FEES = [
  { id: 'f-1', student_id: 's-1', name_bn: 'মাহির আহমেদ', fee_type: 'জানুয়ারি মাসিক বেতন', amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-01-15' },
  { id: 'f-2', student_id: 's-1', name_bn: 'মাহির আহমেদ', fee_type: 'ফেব্রুয়ারি মাসিক বেতন', amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-02-15' },
  { id: 'f-3', student_id: 's-1', name_bn: 'মাহির আহমেদ', fee_type: '১ম সাময়িক পরীক্ষা ফি', amount: 350, paid_amount: 0, status: 'unpaid', due_date: '2026-02-28' },
  { id: 'f-4', student_id: 's-6', name_bn: 'সাকিব আল হাসান', fee_type: 'এসএসসি প্রস্তুতি টেস্ট ফি', amount: 800, paid_amount: 800, status: 'paid', due_date: '2026-01-30' }
];

export const MOCK_EXPENSES = [
  { id: 'exp-1', title: 'বিজ্ঞান ল্যাব রাসায়নিক ও কাঁচামাল ক্রয়', category: 'একাডেমিক সরঞ্জাম', amount: 15400, expense_date: '2026-01-20' },
  { id: 'exp-2', title: 'বার্ষিক ক্রীড়া ও পুরস্কার ক্রয়', category: 'ক্রীড়া ও সহশিক্ষা', amount: 28500, expense_date: '2026-01-28' },
  { id: 'exp-3', title: 'লাইব্রেরির নতুন বই সংযোজন (৮০টি)', category: 'লাইব্রেরি', amount: 12800, expense_date: '2026-01-15' },
  { id: 'exp-4', title: 'ইন্টারনেট ও বিদ্যুৎ বিল (জানুয়ারি)', category: 'ইউটিলিটি', amount: 8200, expense_date: '2026-02-02' }
];

export const MOCK_BOOKS = [
  { id: 'b-1', title: 'আমার বন্ধু রাশেদ', author: 'মুহম্মদ জাফর ইকবাল', isbn: '978-984-401-123-1', category: 'কিশোর উপন্যাস', quantity: 8, available_quantity: 6 },
  { id: 'b-2', title: 'একাত্তরের দিনগুলি', author: 'জাহানারা ইমাম', isbn: '978-984-401-456-2', category: 'মুক্তিযুদ্ধ', quantity: 10, available_quantity: 8 },
  { id: 'b-3', title: 'পদার্থবিজ্ঞানের মজার গল্প', author: 'ইয়াখভ পেরেলম্যান', isbn: '978-984-401-789-3', category: 'বিজ্ঞান চর্চা', quantity: 6, available_quantity: 4 },
  { id: 'b-4', title: 'হাতে কলমে পাইথন প্রোগ্রামিং', author: 'তামিম শাহরিয়ার সুবিন', isbn: '978-984-401-012-4', category: 'কম্পিউটার ও আইসিটি', quantity: 12, available_quantity: 10 },
  { id: 'b-5', title: 'সঞ্চয়িতা', author: 'রবীন্দ্রনাথ ঠাকুর', isbn: '978-984-401-345-5', category: 'কবিতা ও সাহিত্য', quantity: 15, available_quantity: 14 }
];

export const MOCK_ADMISSIONS = [
  { id: 'adm-1', application_no: 'ADM-2026-001', academic_year: 2026, applied_class: '৬', applicant_name_bn: 'রিফাত হোসেন', applicant_name_en: 'Rifat Hossain', guardian_name: 'মোঃ দেলোয়ার হোসেন', guardian_phone: '01711998877', application_date: '2025-12-15', status: 'admitted', admission_test_mark: 88, payment_amount: 1200, payment_status: 'paid' },
  { id: 'adm-2', application_no: 'ADM-2026-002', academic_year: 2026, applied_class: '৬', applicant_name_bn: 'ফারহানা ইসলাম', applicant_name_en: 'Farhana Islam', guardian_name: 'মোঃ রফিকুল ইসলাম', guardian_phone: '01722887766', application_date: '2025-12-16', status: 'selected', admission_test_mark: 92, payment_amount: 1200, payment_status: 'paid' },
  { id: 'adm-3', application_no: 'ADM-2026-003', academic_year: 2026, applied_class: '৯', applicant_name_bn: 'নাঈম হাসান', applicant_name_en: 'Nayeem Hasan', guardian_name: 'মোঃ আবুল কাশেম', guardian_phone: '01733776655', application_date: '2025-12-18', status: 'under_review', admission_test_mark: 74, payment_amount: 500, payment_status: 'paid' }
];

export const MOCK_SCHOLARSHIPS = [
  { id: 'sch-1', name_bn: 'মাহির আহমেদ', student_id: 'STU-2026-0601', class_name: '6', scholarship_name: 'ট্যালেন্টপুল সাধারণ মেধা বৃত্তি', academic_year: 2026, provider: 'মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (DSHE)', amount: 4500, award_date: '2026-01-10', status: 'awarded' },
  { id: 'sch-2', name_bn: 'তানজিলা আক্তার', student_id: 'STU-2026-0602', class_name: '6', scholarship_name: 'উপজেলা পরিষদ মেধাবী ছাত্রী সহায়তা বৃত্তি', academic_year: 2026, provider: 'উপজেলা পরিষদ, কালিহাতি', amount: 3000, award_date: '2026-01-15', status: 'awarded' },
  { id: 'sch-3', name_bn: 'সাদিয়া তাসনিম', student_id: 'STU-2026-0901', class_name: '9', scholarship_name: 'মগড়া ইউনিয়ন পরিষদ বিশেষ শিক্ষা সহায়তা', academic_year: 2025, provider: 'মগড়া ইউনিয়ন পরিষদ', amount: 5000, award_date: '2025-06-20', status: 'awarded' }
];

export const MOCK_PUBLIC_CONTENT = [
  { id: 'c-1', content_type: 'institution', title_bn: 'ঐতিহ্যবাহী মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের গৌরবোজ্জ্বল ইতিহাস', description: '১৯৪৬ সালে প্রতিষ্ঠিত মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় কালিহাতি উপজেলার অন্যতম প্রাচীন ও ঐতিহ্যবাহী বিদ্যাপীঠ। শুরু থেকেই জ্ঞানের আলো বিস্তার ও সৎ, যোগ্য নাগরিক তৈরিতে বিদ্যালয়টি অগ্রণী ভূমিকা পালন করে আসছে।', event_date: '১৯৪৬ খ্রি.' },
  { id: 'c-2', content_type: 'sport', title_bn: '৮০তম বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬', description: 'দৌড়, দীর্ঘ লম্ফ, ক্রিকেট ও ফুটবল টুর্নামেন্টসহ ২০টি ইভেন্টে প্রায় ৪০০ শিক্ষার্থী অংশ নেয়। সমাপনী দিনে প্রধান অতিথি বিজয়ীদের মাঝে ট্রফি ও মেডেল বিতরণ করেন।', event_date: '২০২৬-০২-১৮', image_url: '/school-building.jpg' },
  { id: 'c-3', content_type: 'club', title_bn: 'মগড়া ইয়ুথ সাইন্স ক্লাব', description: 'বিজ্ঞান মেলা, রোবটিক্স প্রজেক্ট, কুইজ ও খুদে বিজ্ঞানীদের প্রজেক্ট প্রদর্শনী নিয়মিত আয়োজন করা হয়।', location: 'বিজ্ঞান ল্যাব' },
  { id: 'c-4', content_type: 'club', title_bn: 'ডিজিটাল আইসিটি ও প্রোগ্রামিং ক্লাব', description: 'কম্পিউটার প্রোগ্রামিং, কোডিং, গ্রাফিক্স ডিজাইন ও সাইবার সচেতনতা বিষয়ক প্রশিক্ষণ প্রদান করা হয়।', location: 'শেখ রাসেল কম্পিউটার ল্যাব' },
  { id: 'c-5', content_type: 'achievement', title_bn: 'উপজেলা বিতর্ক প্রতিযোগিতায় ১ম স্থান অর্জন', description: 'কালিহাতি উপজেলা পর্যায়ে আয়োজিত আন্তঃবিদ্যালয় বিতর্ক প্রতিযোগিতায় আমাদের বিদ্যালয় দল চ্যাম্পিয়ন ট্রফি অর্জন করে।', event_date: '২০২৫-১০-১২' },
  { id: 'c-6', content_type: 'facility', title_bn: 'মাল্টিমিডিয়া ক্লাসরুম ও ওয়াই-ফাই নেটওয়ার্ক', description: 'আধুনিক প্রজেক্টর, সাউন্ড সিস্টেম ও ব্রডব্যান্ড ইন্টারনেট সমৃদ্ধ ডিজিটাল ক্লাসরুম প্রতিটি শ্রেণিকক্ষে স্থাপিত হয়েছে।', location: 'একাডেমিক ভবন' }
];

export const MOCK_SSC_RESULTS = [
  { year: '২০২৫', candidates: 142, passed: 139, gpa5: 38, pass_rate: '97.88%' },
  { year: '২০২৪', candidates: 138, passed: 135, gpa5: 34, pass_rate: '97.82%' },
  { year: '২০২৩', candidates: 130, passed: 126, gpa5: 29, pass_rate: '96.92%' },
  { year: '২০২২', candidates: 125, passed: 122, gpa5: 27, pass_rate: '97.60%' }
];
