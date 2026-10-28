// V87: each top-level menu and submenu has a feature key so Admin can independently enable/disable it.
export const publicNavConfig = [
 {key:'public.nav.home',label:'হোম',href:'#home'},
 {key:'public.nav.institution',label:'প্রাতিষ্ঠানিক তথ্য',children:[
  ['public.nav.institution.about','বিদ্যালয় পরিচিতি','#school-info'],
  ['public.nav.institution.history','বিদ্যালয়ের ইতিহাস','#school-history'],
  ['public.nav.institution.committee','পরিচালনা পর্ষদ','#committee'],
  ['public.nav.institution.regulations','বিধি বিধান','#regulations'],
  ['public.nav.institution.code_of_conduct','আচরন বিধি','#code-of-conduct'],
  ['public.nav.institution.master_plan','মুখ্য পরিকল্পনা','#master-plan'],
  ['public.nav.institution.library','গ্রন্থাগার/লাইব্রেরী','#library'],
  ['public.nav.institution.curriculum','পাঠ্যক্রম','#curriculum'],
  ['public.nav.institution.syllabus','পাঠ্যতালিকা','#syllabus'],
  ['public.nav.institution.publications','প্রকাশনা','#publications'],
  ['public.nav.institution.hostel','ছাত্রাবাস','#hostel'],
  ['public.nav.institution.transport','পরিবহণ সুবিধা','#transport']
 ]},
 {key:'public.nav.sport',label:'ক্রীড়া ও সংস্কৃতি',children:[
  ['public.nav.sport.debate','ডিবেটিং ক্লাব (বিতর্ক)','#debate'],['public.nav.sport.science','বিজ্ঞান ক্লাব (মেলা ও উদ্ভাবন)','#science-club'],['public.nav.sport.ict','আইসিটি ও কোডিং ক্লাব','#ict-club'],['public.nav.sport.literature','ভাষা ও সাহিত্য ক্লাব','#literature-club'],['public.nav.sport.clubs','সকল ক্লাব ও সংগঠন (ডিরেক্টরি)','#clubs'],['public.nav.sport.sports','বার্ষিক ক্রীড়া','#sports'],['public.nav.sport.culture','সাংস্কৃতিক অনুষ্ঠান','#culture'],['public.nav.sport.achievements','অর্জন ও পুরস্কার','#achievements'],['public.nav.sport.tour','শিক্ষা সফর','#tour'],['public.nav.sport.lab','কম্পিউটার ল্যাব','#computer-lab'],['public.nav.sport.multimedia','মাল্টিমিডিয়া ক্লাস','#multimedia'],['public.nav.sport.scouts','স্কাউট/গার্লস গাইড','#scouts'],['public.nav.sport.inter','আন্তঃবিদ্যালয় ক্রীড়া','#inter-school-sports'],['public.nav.sport.milad','মিলাদ-মাহফিল','#milad'],['public.nav.sport.puja','পূজা','#puja']
 ]},
 {key:'public.nav.staff',label:'শিক্ষক ও কর্মচারীবৃন্দ',children:[
  ['public.nav.staff.head','প্রধান শিক্ষক','#headteacher'],
  ['public.nav.staff.assistant','সহকারী প্রধান শিক্ষক','#assistant-headteacher'],
  ['public.nav.staff.active_teachers','কর্মরত শিক্ষকবৃন্দ','#teachers'],
  ['public.nav.staff.active_staff','কর্মরত কর্মচারীবৃন্দ','#staff'],
  ['public.nav.staff.former_heads','প্রাক্তন প্রধান শিক্ষকবৃন্দ','#former-headteachers'],
  ['public.nav.staff.former_assistants','প্রাক্তন সহকারী প্রধান শিক্ষকবৃন্দ','#former-assistant-headteachers'],
  ['public.nav.staff.former_teachers','প্রাক্তন শিক্ষকবৃন্দ','#former-teachers'],
  ['public.nav.staff.former_staff','প্রাক্তন কর্মচারীবৃন্দ','#former-staff']
 ]},
 {key:'public.nav.students',label:'শিক্ষার্থীর তথ্য',children:[
  ['public.nav.students.enrolled','অধ্যয়নরত শিক্ষার্থী','#enrolled-students'],
  ['public.nav.students.govt_scholarship','সরকারি বৃত্তি প্রাপ্ত শিক্ষার্থী','#govt-scholarship'],
  ['public.nav.students.stipend','উপবৃত্তি প্রাপ্ত শিক্ষার্থী','#stipend-students'],
  ['public.nav.students.meritorious','অধ্যয়নরত কৃতি শিক্ষার্থী','#meritorious-students'],
  ['public.nav.students.former_meritorious','সাবেক কৃতি শিক্ষার্থী','#former-meritorious-students'],
  ['public.nav.students.class_seats','শিক্ষার্থীর শ্রেণি ও আসন','#class-seats'],
  ['public.nav.students.attendance','শিক্ষার্থীর স্মার্ট উপস্থিতি ও রেকর্ড','#smart-attendance']
 ]},
 {key:'public.nav.results',label:'পরীক্ষার ফলাফল',children:[
  ['public.nav.results.admission','ভর্তি পরীক্ষার ফলাফল','#admission-test-results'],
  ['public.nav.results.half_yearly','অর্ধ-বার্ষিক পরীক্ষার ফলাফল','#half-yearly-results'],
  ['public.nav.results.annual','বার্ষিক পরীক্ষার ফলাফল','#annual-results'],
  ['public.nav.results.pre_test','প্রাক-নির্বাচনী পরীক্ষার ফলাফল','#pre-test-results'],
  ['public.nav.results.test','নির্বাচনী পরীক্ষার ফলাফল','#test-results'],
  ['public.nav.results.public_exams','পাবলিক পরীক্ষার ফলাফল','#public-exam-results']
 ]},
 {key:'public.nav.guide',label:'শিক্ষার্থীর গাইড',children:[
  ['public.nav.guide.routine','ক্লাস ও পরীক্ষার রুটিন','#routine'],['public.nav.guide.syllabus','সিলেবাস','#syllabus'],['public.nav.guide.learning','ডিজিটাল লার্নিং','#learning'],['public.nav.guide.notes','নোট/লেকচার','#notes'],['public.nav.guide.question','প্রশ্নব্যাংক ও মডেল প্রশ্ন','#question-bank'],['public.nav.guide.assignment','অ্যাসাইনমেন্ট ও মক টেস্ট','#assignments'],['public.nav.guide.online','অনলাইন পরীক্ষা','#online-exam'],['public.nav.guide.ai','AI শিক্ষা সহকারী','#ai']
 ]},
 {key:'public.nav.notice',label:'নোটিশ',href:'#notice'},
 {key:'public.nav.gallery',label:'গ্যালারি',href:'#gallery'},
 {key:'public.nav.contact',label:'যোগাযোগ',children:[
  ['public.nav.contact.head','প্রধান শিক্ষক','#contact-head'],['public.nav.contact.assistant','সহকারী প্রধান শিক্ষক','#contact-assistant'],['public.nav.contact.ict','আইসিটি শিক্ষক','#contact-ict'],['public.nav.contact.office','অফিস সহকারী','#contact-office'],['public.nav.contact.all','যোগাযোগ ও ঠিকানা','#contact']
 ]}
];
