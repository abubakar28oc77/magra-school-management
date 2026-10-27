// religiousEventsData.js - Data & Helpers for মিলাদ-মাহফিল and পূজা

export const DEFAULT_RELIGIOUS_EVENTS = {
  milad: {
    title: 'বার্ষিক দোয়া ও মিলাদ মাহফিল ২০২৬',
    occasion: 'পবিত্র শবে বরাত ও এসএসসি পরীক্ষার্থীদের শুভকামনায় বিশেষ দোয়া ও মিলাদ মাহফিল',
    date: '২০২৬-০২-১২',
    time: 'সকাল ১০:০০ টা হতে দুপুর ১:৩০ টা',
    venue: 'বিদ্যালয় অডিটোরিয়াম ও মূল প্রাঙ্গণ',
    chief_guest: 'নেয়ামুল হক খান (সভাপতি, পরিচালনা পর্ষদ)',
    president: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    speaker: 'মাওলানা মোঃ আনোয়ার হোসেন (পেশ ইমাম ও সিনিয়র শিক্ষক, ইসলাম ধর্ম)',
    schedule: [
      { time: '১০:০০ - ১০:৩০', item: 'পবিত্র কুরআন থেকে তেলাওয়াত ও হামদ-নাত পরিবেশন' },
      { time: '১০:৩০ - ১১:৩০', item: 'শিক্ষার্থীদের চরিত্র গঠন ও ইসলামের শিক্ষা শীর্ষক বিশেষ আলোচনা' },
      { time: '১১:৩০ - ১২:১৫', item: 'এসএসসি পরীক্ষার্থী ও সমগ্র দেশবাসীর কল্যাণে বিশেষ নসিহত' },
      { time: '১২:১৫ - ০১:০০', item: 'দোয়া, দরুদ ও আখেরি মোনাজাত' },
      { time: '০১:০০ - ০১:৩০', item: 'তাবাররুক ও মিষ্টি বিতরণ' }
    ],
    committee: 'মো: আনোয়ার হোসেন (আহ্বায়ক), মোঃ হাবিবুর রহমান (সদস্য), মুহাম্মদ আব্দুর রহিম লিটন (সদস্য)',
    tabarruk_details: 'সকল শিক্ষার্থী, শিক্ষক ও উপস্থিত অভিভাবকদের মাঝে তাবাররুক ও প্যাকেট মিষ্টি বিতরণ করা হবে।',
    special_dua: 'এসএসসি পরীক্ষার্থীদের মেধা বিকাশ, পরীক্ষায় অভূতপূর্ব সাফল্য, প্রতিষ্ঠানের উত্তরোত্তর সমৃদ্ধি এবং সকল মরহুম প্রতিষ্ঠাতা ও শুভাকাঙ্ক্ষীদের মাগফিরাত কামনা।'
  },
  puja: {
    title: 'শ্রী শ্রী সরস্বতী পূজা ও বাণী অর্চনা ২০২৬',
    occasion: 'বিদ্যার দেবী শ্রী শ্রী সরস্বতীর শুভ আবির্ভাব উপলক্ষে বাৎসরিক বাণী অর্চনা ও অঞ্জলি প্রদান',
    date: '২০২৬-০১-২৩',
    time: 'সকাল ৮:০০ টা হতে বিকাল ৪:০০ টা',
    venue: 'বিদ্যালয় প্রাঙ্গণ ও বিশেষ পূজা মণ্ডপ',
    purohit: 'পণ্ডিত শ্রী রামকৃষ্ণ চক্রবর্তী (প্রধান পুরোহিত)',
    coordinator: 'শ্রীমতী আরতী রানী ভদ্র (সিনিয়র শিক্ষিকা, হিন্দু ধর্ম ও নৈতিক শিক্ষা)',
    president: 'মুহাম্মদ শফিকুল ইসলাম (প্রধান শিক্ষক)',
    chief_guest: 'নেয়ামুল হক খান (সভাপতি, পরিচালনা পর্ষদ)',
    schedule: [
      { time: '০৮:০০ - ০৯:০০', item: 'প্রতিমা স্থাপন, চক্ষুদান ও পূজা আরম্ভ' },
      { time: '০৯:৩০ - ১১:০০', item: 'পুষ্পাঞ্জলি প্রদান ও দেবীর বন্দনা' },
      { time: '১১:৩০ - ১২:৩০', item: 'মহাপ্রসাদ বিতরণ (খিচুড়ি ও মিষ্টান্ন)' },
      { time: '০২:০০ - ০৩:৩০', item: 'বাণী অর্চনা, বৈদিক গান ও শিক্ষার্থীদের সাংস্কৃতিক পরিবেশনা' },
      { time: '০৩:৩০ - ০৪:৩০', item: 'সন্ধ্যা আরতি ও সমাপনী আশীর্বাদ' }
    ],
    committee: 'আরতী রানী ভদ্র (আহ্বায়ক), তাপসী সরকার (সহকারী প্রধান শিক্ষক ও উপদেষ্টা)',
    prasad_details: 'পূজা শেষে উপস্থিত সকল ভক্ত, শিক্ষার্থী, অভিভাবক ও অতিথিদের মাঝে ফলমূল ও মহাপ্রসাদ বিতরণ।',
    message: 'জ্ঞান, প্রজ্ঞা ও শুভ বুদ্ধির আলো ছড়িয়ে দিতে প্রতি বছরের ন্যায় সৌহার্দ্যপূর্ণ পরিবেশে বাণী অর্চনা অনুষ্ঠিত হবে।'
  }
};

export function getStoredReligiousEventsData() {
  try {
    const raw = localStorage.getItem('magra_religious_events_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_RELIGIOUS_EVENTS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load religious events data from localStorage', e);
  }
  return DEFAULT_RELIGIOUS_EVENTS;
}

export function saveStoredReligiousEventsData(data) {
  try {
    localStorage.setItem('magra_religious_events_data', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('magra_religious_events_change', { detail: data }));
    return true;
  } catch (e) {
    console.error('Failed to save religious events data', e);
    return false;
  }
}
