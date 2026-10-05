// V87: each top-level menu and submenu has a feature key so Admin can independently enable/disable it.
export const publicNavConfig = [
 {key:'public.nav.home',label:'হোম',href:'#home'},
 {key:'public.nav.institution',label:'প্রাতিষ্ঠানিক তথ্য',children:[
  ['public.nav.institution.about','বিদ্যালয় পরিচিতি','#school-info'],['public.nav.institution.message','সভাপতি, প্রধান শিক্ষক ও সহকারী প্রধান শিক্ষকের বাণী','#leadership'],['public.nav.institution.committee','পরিচালনা কমিটি','#committee'],['public.nav.institution.rules','নিয়ম-কানুন','#rules'],['public.nav.institution.library','লাইব্রেরি','#library'],['public.nav.institution.curriculum','পাঠ্যক্রম ও পাঠ্যপুস্তক','#curriculum']
 ]},
 {key:'public.nav.sport',label:'ক্রীড়া ও সংস্কৃতি',children:[
  ['public.nav.sport.sports','বার্ষিক ক্রীড়া','#sports'],['public.nav.sport.clubs','ক্লাব ও সংগঠন','#clubs'],['public.nav.sport.culture','সাংস্কৃতিক অনুষ্ঠান','#culture'],['public.nav.sport.achievements','অর্জন ও পুরস্কার','#achievements'],['public.nav.sport.tour','শিক্ষা সফর','#tour'],['public.nav.sport.debate','বিতর্ক','#debate'],['public.nav.sport.lab','কম্পিউটার ল্যাব','#computer-lab'],['public.nav.sport.multimedia','মাল্টিমিডিয়া ক্লাস','#multimedia'],['public.nav.sport.scouts','স্কাউট/গার্লস গাইড','#scouts'],['public.nav.sport.inter','আন্তঃবিদ্যালয় ক্রীড়া','#inter-school-sports']
 ]},
 {key:'public.nav.staff',label:'শিক্ষক ও কর্মচারী',children:[
  ['public.nav.staff.head','প্রধান শিক্ষক','#headteacher'],['public.nav.staff.assistant','সহকারী প্রধান শিক্ষক','#assistant-headteacher'],['public.nav.staff.active','সক্রিয় শিক্ষকবৃন্দ','#teachers'],['public.nav.staff.former','সাবেক শিক্ষকবৃন্দ','#former-teachers'],['public.nav.staff.employees','কর্মচারীবৃন্দ','#staff'],['public.nav.staff.formerEmployees','সাবেক কর্মচারীবৃন্দ','#former-staff']
 ]},
 {key:'public.nav.students',label:'শিক্ষার্থীর তথ্য',children:[
  ['public.nav.students.all','সকল শিক্ষার্থী','#students'],['public.nav.students.scholarship','বৃত্তিপ্রাপ্ত শিক্ষার্থী','#scholarship'],['public.nav.students.seats','শ্রেণি ও আসন তথ্য','#class-seats'],['public.nav.students.distinguished','কৃতি শিক্ষার্থী','#distinguished'],['public.nav.students.formerDistinguished','সাবেক কৃতি শিক্ষার্থী','#former-distinguished']
 ]},
 {key:'public.nav.results',label:'পরীক্ষার ফলাফল',children:[
  ['public.nav.results.admission','ভর্তি পরীক্ষা','#admission-test'],['public.nav.results.internal','অভ্যন্তরীণ পরীক্ষা','#internal-results'],['public.nav.results.ssc','SSC ফলাফল','#ssc-results'],['public.nav.results.analysis','ফলাফল বিশ্লেষণ','#result-analysis'],['public.nav.results.marksheet','মার্কশিট','#marksheet'],['public.nav.results.progress','প্রগ্রেস রিপোর্ট','#progress-report']
 ]},
 {key:'public.nav.guide',label:'শিক্ষার্থীর গাইড',children:[
  ['public.nav.guide.syllabus','সিলেবাস','#syllabus'],['public.nav.guide.learning','ডিজিটাল লার্নিং','#learning'],['public.nav.guide.notes','নোট/লেকচার','#notes'],['public.nav.guide.question','প্রশ্নব্যাংক ও মডেল প্রশ্ন','#question-bank'],['public.nav.guide.assignment','অ্যাসাইনমেন্ট ও মক টেস্ট','#assignments'],['public.nav.guide.online','অনলাইন পরীক্ষা','#online-exam'],['public.nav.guide.ai','AI শিক্ষা সহকারী','#ai']
 ]},
 {key:'public.nav.notice',label:'নোটিশ',href:'#notice'},
 {key:'public.nav.gallery',label:'গ্যালারি',href:'#gallery'},
 {key:'public.nav.contact',label:'যোগাযোগ',children:[
  ['public.nav.contact.head','প্রধান শিক্ষক','#contact-head'],['public.nav.contact.assistant','সহকারী প্রধান শিক্ষক','#contact-assistant'],['public.nav.contact.ict','আইসিটি শিক্ষক','#contact-ict'],['public.nav.contact.office','অফিস সহকারী','#contact-office'],['public.nav.contact.all','যোগাযোগ ও ঠিকানা','#contact']
 ]}
];
