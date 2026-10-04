export const UI_EN={
'ড্যাশবোর্ড':'Dashboard','শিক্ষার্থী':'Student','শিক্ষার্থীর তথ্য':'Student Information','শিক্ষক ও কর্মচারী':'Teachers & Staff','শিক্ষক':'Teacher','কর্মচারী':'Staff','ভর্তি':'Admission','উপস্থিতি':'Attendance','পরীক্ষা ও ফলাফল':'Examination & Results','রুটিন':'Routine','ফি ও হিসাব':'Fees & Accounts','লাইব্রেরি':'Library','নোটিশ':'Notice','নোটিফিকেশন':'Notifications','ডিজিটাল লার্নিং':'Digital Learning','প্রশ্নব্যাংক':'Question Bank','অ্যাসাইনমেন্ট':'Assignment','অনলাইন পরীক্ষা':'Online Exam','AI শিক্ষা':'AI Education','রিপোর্ট':'Reports','ডকুমেন্ট ও প্রিন্ট':'Documents & Print','ইউজার ও রোল':'Users & Roles','সহশিক্ষা ও অর্জন':'Co-curricular & Achievements','পরিবহন':'Transport','হোস্টেল':'Hostel','সেটিংস':'Settings','ফিচার কন্ট্রোল':'Feature Control','Form Builder':'Form Builder','শিক্ষার্থী তালিকা':'Student List','নতুন শিক্ষার্থী':'New Student','শিক্ষার্থী অনুসন্ধান':'Student Search','ভোটার তালিকা':'Voter List','গ্রামভিত্তিক তালিকা':'Village-wise Student List','নতুন শিক্ষক':'New Teacher','নতুন কর্মচারী':'New Staff','মার্ক এন্ট্রি':'Marks Entry','ফলাফল প্রসেসিং':'Result Processing','মার্কশিট':'Marksheet','ট্যাবুলেশন শিট':'Tabulation Sheet','মেধা তালিকা':'Merit List','প্রশংসাপত্র':'Commendation Certificate','সনদপত্র':'Certificate','অ্যাডমিট কার্ড':'Admit Card','ব্যক্তিগত তথ্য':'Personal Information','পেশাগত তথ্য':'Professional Information','শিক্ষাগত তথ্য':'Educational Information','প্রশিক্ষণ তথ্য':'Training Information','যোগাযোগ ও ঠিকানা':'Contact & Address','অভিভাবক তথ্য':'Guardian Information','অতিরিক্ত তথ্য':'Additional Information','প্রাথমিক বিদ্যালয়ের তথ্য':'Primary School Information','পিতার তথ্য':'Father Information','মাতার তথ্য':'Mother Information','ঠিকানা':'Address','বর্তমান ঠিকানা':'Present Address','স্থায়ী ঠিকানা':'Permanent Address','নাম':'Name','নাম (বাংলা)':'Name (Bangla)','নাম (ইংরেজি)':'Name (English)','পিতার নাম':'Father’s Name','মাতার নাম':'Mother’s Name','অভিভাবকের নাম':'Guardian’s Name','জাতীয় পরিচয়পত্র নম্বর':'National ID Number','জন্ম নিবন্ধন নম্বর':'Birth Registration Number','জন্ম তারিখ':'Date of Birth','লিঙ্গ':'Gender','ধর্ম':'Religion','রক্তের গ্রুপ':'Blood Group','পেশা':'Profession','পদবী':'Designation','বিষয়':'Subject','মোবাইল নম্বর':'Mobile Number','WhatsApp নম্বর':'WhatsApp Number','ই-মেইল':'Email','গ্রাম':'Village','ডাকঘর':'Post Office','উপজেলা':'Upazila','জেলা':'District','শ্রেণি':'Class','শাখা':'Section','রোল':'Roll','রোল নম্বর':'Roll Number','ছবি':'Photo','ছবি আপলোড':'Upload Photo','ফাইল আপলোড':'Upload File','পরবর্তী ধাপ':'Next Step','পূর্ববর্তী ধাপ':'Previous Step','ফর্ম রিসেট':'Reset Form','সংরক্ষণ করুন':'Save','আপডেট করুন':'Update','সম্পাদনা':'Edit','মুছুন':'Delete','অনুসন্ধান':'Search','প্রয়োগ করুন':'Apply','সব':'All','চালু':'Enabled','বন্ধ':'Disabled','হ্যাঁ':'Yes','না':'No','অবস্থা':'Status','কাজ':'Actions','মোট':'Total','সক্রিয়':'Active','নিষ্ক্রিয়':'Inactive','শিক্ষাবর্ষ':'Academic Year','ভর্তি তারিখ':'Admission Date','পূর্বের বিদ্যালয়ের নাম':'Previous School Name','প্রাথমিক বিদ্যালয়ের নাম':'Primary School Name','প্রাথমিক রেজিস্ট্রেশন নম্বর':'Primary Registration Number','প্রাথমিক শিক্ষা সমাপনী সন':'Primary Completion Year','বিশেষ চাহিদা':'Special Needs','অতিরিক্ত নোট':'Additional Notes','পিতার পেশা':'Father’s Profession','মাতার পেশা':'Mother’s Profession','পিতার মোবাইল':'Father’s Mobile','মাতার মোবাইল':'Mother’s Mobile','পিতার বিদেশে অবস্থানের দেশ':'Father’s Country Abroad','মাতার মৃত্যুর সাল':'Mother’s Death Year','অভিভাবকের সঙ্গে সম্পর্ক':'Relationship with Guardian','জরুরি মোবাইল':'Emergency Mobile','ভোটার নং':'Voter No.','ভোটারের নাম':'Voter Name','গ্রামের নাম':'Village Name','প্রশংসাপত্র তৈরি':'Generate Commendation Certificate','প্রিন্ট':'Print','PDF':'PDF','ডাউনলোড':'Download','ভাষা':'Language','বাংলা':'Bangla','বাংলা + English':'Bangla + English','English':'English','লগইন':'Login','লগআউট':'Logout'
};
const walk=(root,lang)=>{const map=UI_EN;const translateText=n=>{const t=n.nodeValue?.trim();if(!t||lang!=='en')return;if(map[t])n.nodeValue=n.nodeValue.replace(t,map[t]);};const translateAttr=e=>{for(const a of ['placeholder','title','aria-label']){const v=e.getAttribute?.(a);if(v&&map[v])e.setAttribute(a,map[v]);}};const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(translateText);root.querySelectorAll?.('input,textarea,button,select,[title],[aria-label]').forEach(translateAttr)};
export function installUiTranslation(lang){
  if(window.__magraUiObserver){
    window.__magraUiObserver.disconnect();
    window.__magraUiObserver=null;
  }
  if(lang!=='en')return;
  let timer=null;
  const run=()=>{
    if(window.__magraUiObserver)window.__magraUiObserver.disconnect();
    try{
      walk(document.body,lang);
    }finally{
      if(window.__magraUiObserver){
        window.__magraUiObserver.observe(document.body,{subtree:true,childList:true});
      }
    }
  };
  run();
  window.__magraUiObserver=new MutationObserver(()=>{
    if(timer)clearTimeout(timer);
    timer=setTimeout(run,150);
  });
  window.__magraUiObserver.observe(document.body,{subtree:true,childList:true});
}
