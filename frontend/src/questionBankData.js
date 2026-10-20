// frontend/src/questionBankData.js
// Magra E-ProshnoBank Engine & Central Question Repository
// Aligned with NCTB Curriculum, Dhaka Education Board Standards & Magra Result Marks Distribution

// =========================================================================
// OFFICIAL NCTB SSC (CLASS 9 & 10) EVALUATION GUIDELINES & MARKS BREAKDOWN
// (২০২৭ সালের এসএসসি/সমমান পরীক্ষা থেকে কার্যকর, ২০২৫ পাঠ্যসূচি অনুযায়ী ৯ম ও ১০ম শ্রেণি)
// =========================================================================
export const NCTB_SSC_EVALUATION_SPECS = {
  // ১. বাংলা ১ম পত্র (Code: 101)
  bangla1: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: 'গদ্য থেকে ৪টি ও কবিতা থেকে ৪টি করে মোট ৮টি সৃজনশীল প্রশ্ন। গদ্য ও কবিতা উভয় অংশ থেকে কমপক্ষে ২টি করে মোট ৫টি প্রশ্নের উত্তর দিতে হবে।',
    descriptive_max: 20,
    descriptive_count: 4,
    descriptive_to_answer: 2,
    descriptive_rule: 'সহপাঠ: উপন্যাস থেকে ২টি এবং নাটক থেকে ২টি করে মোট ৪টি প্রশ্ন থাকবে। উপন্যাস থেকে ১টি এবং নাটক থেকে ১টি করে মোট ২টি প্রশ্নের উত্তর দিতে হবে। [প্রতিটি প্রশ্নের ক অংশের জন্য ৩ এবং খ অংশের জন্য ৭ নম্বর]।',
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 30,
    mcq_rule: 'গদ্য থেকে ১৫টি এবং কবিতা থেকে ১৫টি করে মোট ৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_bangla1',
    written_pass: 23,
    mcq_pass: 10
  },

  // ২. বাংলা ২য় পত্র (Code: 102)
  bangla2: {
    full_marks: 100,
    cq_max: 0,
    cq_count: 0,
    cq_to_answer: 0,
    composition_max: 70,
    composition_rule: 'নির্মিতি অংশ: অনুচ্ছেদ রচনা (২টি থেকে ১টি: ১০), চিঠিপত্র/সংবাদ প্রতিবেদন (২টি থেকে ১টি: ১০), সারাংশ বা সারমর্ম (২টি থেকে ১টি: ১০), ভাব-সম্প্রসারণ (২টি থেকে ১টি: ১০), বাংলায় অনুবাদ (২টি থেকে ১টি: ১০), প্রবন্ধ রচনা (৩টি থেকে ১টি: ২০)।',
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 30,
    mcq_rule: 'ব্যাকরণ অংশ থেকে ৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। প্রতিটি প্রশ্নের মান ১। সকল প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_bangla2',
    written_pass: 23,
    mcq_pass: 10
  },

  // ৩. গণিত (Code: 109)
  math: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: "‘ক’ বিভাগ (বীজগণিত) থেকে ২টি, ‘খ’ বিভাগ (জ্যামিতি) থেকে ২টি, ‘গ’ বিভাগ (ত্রিকোণমিতি ও পরিমিতি) থেকে ২টি এবং ‘ঘ’ বিভাগ (পরিসংখ্যান) থেকে ২টি করে মোট ৮টি সৃজনশীল প্রশ্ন থাকবে। প্রত্যেক বিভাগ থেকে ন্যূনতম ১টি করে মোট ৫টি প্রশ্নের উত্তর দিতে হবে।",
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে (বীজগণিত ১২-১৫টি, জ্যামিতি ১০-১৩টি, ত্রিকোণমিতি ও পরিমিতি এবং পরিসংখ্যান অংশ থেকে ৫টি)। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_math',
    written_pass: 23,
    mcq_pass: 10
  },

  // ৪. English 1st Paper (Code: 107)
  english1: {
    full_marks: 100,
    reading_max: 70,
    reading_rule: 'Part-A Reading (70 Marks): Seen Comprehension: MCQ (1x7=7), Answering questions (2x5=10), Gap filling (1x5=5), Information Transfer (1x5=5); Unseen Passage: Summary (10), Matching (1x5=5), Re-arranging (1x8=8), Poem Q&A (any 5 of 8, 2x5=10), Story Q&A (any 5 of 8, 2x5=10).',
    writing_max: 30,
    writing_rule: 'Part-B Writing (30 Marks): Completing stories (15 Marks), Writing dialogues (15 Marks).',
    cq_max: 0,
    short_max: 0,
    mcq_max: 7,
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_english1',
    written_pass: 33
  },

  // ৫. English 2nd Paper (Code: 108)
  english2: {
    full_marks: 100,
    grammar_max: 60,
    grammar_rule: 'Part-A Grammar (60 Marks): Gap filling with clues (10), Substitution table (5), Right form of verbs (10), Changing sentences (10), Tag questions (5), Suffixes & Prefixes (5), Preposition (5), Connectors (5), Punctuation & Capitalization (5).',
    writing_max: 40,
    writing_rule: 'Part-B Writing (40 Marks): Writing paragraph (10), E-mail/letter/application (10), Short composition (20).',
    cq_max: 0,
    short_max: 0,
    mcq_max: 0,
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_english2',
    written_pass: 33
  },

  // ৬. সাধারণ বিষয়াবলী (বিজ্ঞান, বিজিএস, ইতিহাস, ভূগোল, পৌরনীতি, অর্থনীতি, ব্যবসায় উদ্যোগ, ইসলাম ও হিন্দুধর্ম)
  general_science: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  bgs: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  history: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  geography: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  civics: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  economics: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  business_ent: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  islam: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },
  hindu: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: '৮টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৫টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১০।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, যেকোনো ১০টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ২।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_general',
    written_pass: 23,
    mcq_pass: 10
  },

  // ৭. হিসাববিজ্ঞান (Code: 146)
  accounting: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: '৭টি সৃজনশীল প্রশ্ন থাকবে এবং ৪টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    financial_statement_max: 20,
    financial_statement_rule: 'আর্থিক বিবরণী প্রস্তুতকরণ: ১টি বাধ্যতামূলক প্রশ্ন থাকবে এবং ১টিরই উত্তর দিতে হবে (মান ২০)।',
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_accounting',
    written_pass: 23,
    mcq_pass: 10
  },

  // ৮. ফিন্যান্স ও ব্যাংকিং (Code: 152)
  finance: {
    full_marks: 100,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: 'ফিন্যান্স অংশ হতে ৫টি এবং ব্যাংকিং অংশ হতে ৩টিসহ মোট ৮টি প্রশ্ন থাকবে। প্রতিটি অংশ থেকে ন্যূনতম ২টি করে মোট ৫টি প্রশ্নের উত্তর দিতে হবে।',
    short_max: 20,
    short_count: 15,
    short_to_answer: 10,
    short_rule: '১৫টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ১০টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 30,
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_ssc_finance',
    written_pass: 23,
    mcq_pass: 10
  },

  // ৯. পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, কৃষিশিক্ষা, গার্হস্থ্যবিজ্ঞান
  physics: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: '৭টি সৃজনশীল প্রশ্ন থাকবে এবং ৪টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 25,
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন থাকবে এবং সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক অংশ: পরীক্ষণ (১৫ নম্বর), ব্যাখ্যাসহ ফলাফল উপস্থাপন (৫ নম্বর), মৌখিক অভীক্ষা (৫ নম্বর)।',
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'nctb_ssc_science_practical',
    written_pass: 17,
    mcq_pass: 8,
    practical_pass: 8
  },
  chemistry: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: '৭টি সৃজনশীল প্রশ্ন থাকবে এবং ৪টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 25,
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন থাকবে এবং সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক অংশ: পরীক্ষণ (১৫ নম্বর), ব্যাখ্যাসহ ফলাফল উপস্থাপন (৫ নম্বর), মৌখিক অভীক্ষা (৫ নম্বর)।',
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'nctb_ssc_science_practical',
    written_pass: 17,
    mcq_pass: 8,
    practical_pass: 8
  },
  biology: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: '৭টি সৃজনশীল প্রশ্ন থাকবে এবং ৪টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 25,
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন থাকবে এবং সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক অংশ: পরীক্ষণ (১৫ নম্বর), ব্যাখ্যাসহ ফলাফল উপস্থাপন (৫ নম্বর), মৌখিক অভীক্ষা (৫ নম্বর)।',
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'nctb_ssc_science_practical',
    written_pass: 17,
    mcq_pass: 8,
    practical_pass: 8
  },
  agriculture: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: '৭টি সৃজনশীল প্রশ্ন থাকবে এবং ৪টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 25,
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন থাকবে এবং সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক অংশ: পরীক্ষণ (১৫ নম্বর), ফলাফল উপস্থাপন (৫ নম্বর), মৌখিক অভীক্ষা (৫ নম্বর)।',
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'nctb_ssc_science_practical',
    written_pass: 17,
    mcq_pass: 8,
    practical_pass: 8
  },
  home_science: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: '৭টি সৃজনশীল প্রশ্ন থাকবে এবং ৪টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 25,
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন থাকবে এবং সবকয়টি প্রশ্নের উত্তর দিতে হবে।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক অংশ: পরীক্ষণ (১৫ নম্বর), ফলাফল উপস্থাপন (৫ নম্বর), মৌখিক অভীক্ষা (৫ নম্বর)।',
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'nctb_ssc_science_practical',
    written_pass: 17,
    mcq_pass: 8,
    practical_pass: 8
  },

  // ১০. উচ্চতর গণিত (Code: 126)
  higher_math: {
    full_marks: 100,
    cq_max: 40,
    cq_count: 7,
    cq_to_answer: 4,
    cq_rule: "‘ক’ বিভাগ (বীজগণিত) থেকে ৩টি, ‘খ’ বিভাগ (জ্যামিতি ও ভেক্টর) থেকে ২টি, ‘গ’ বিভাগ (ত্রিকোণমিতি ও সম্ভাবনা) থেকে ২টি করে মোট ৭টি সৃজনশীল প্রশ্ন। প্রত্যেক বিভাগ থেকে ন্যূনতম ১টি করে মোট ৪টি প্রশ্নের উত্তর দিতে হবে।",
    short_max: 10,
    short_count: 7,
    short_to_answer: 5,
    short_rule: '৭টি সংক্ষিপ্ত-উত্তর প্রশ্ন থাকবে, ৫টির উত্তর দিতে হবে (প্রতিটির মান ২)।',
    mcq_max: 25,
    mcq_rule: 'বীজগণিত ৮-১২টি, জ্যামিতি ও ভেক্টর ৮-১২টি, ত্রিকোণমিতি ও সম্ভাবনা ৫টি সহ মোট ২৫টি বহুনির্বাচনি প্রশ্ন।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক অংশ: পরীক্ষণের ২টি কার্যক্রম (১০ × ২ = ২০ নম্বর) ও মৌখিক অভীক্ষা (৫ নম্বর)।',
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'nctb_ssc_higher_math',
    written_pass: 17,
    mcq_pass: 8,
    practical_pass: 8
  },

  // ১১. তথ্য ও যোগাযোগ প্রযুক্তি (Code: 154)
  ict: {
    full_marks: 50,
    cq_max: 0,
    cq_count: 0,
    cq_to_answer: 0,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 25,
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন থাকবে, সবকয়টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১)।',
    practical_max: 25,
    practical_rule: 'ব্যবহারিক ল্যাব পরীক্ষা (২৫ নম্বর)।',
    time_allowed: '২৫ মিনিট',
    pattern: 'nctb_ssc_ict',
    mcq_pass: 8,
    practical_pass: 8
  }
};

// =========================================================================
// OFFICIAL NCTB JUNIOR (CLASS 6, 7 & 8) EVALUATION GUIDELINES & MARKS BREAKDOWN
// ৬ষ্ঠ শ্রেণি থেকে ৮ম শ্রেণি পর্যন্ত বিষয় কাঠামো ও নম্বর বণ্টন
// =========================================================================
export const NCTB_JUNIOR_EVALUATION_SPECS = {
  // ১. বাংলা ১ম পত্র (পূর্ণমান: ১০০)
  bangla1: {
    full_marks: 100,
    written_max: 50,
    written_pass: 23,
    cq_max: 50,
    cq_count: 8,
    cq_to_answer: 5,
    cq_rule: 'গদ্য থেকে ৪টি এবং কবিতা থেকে ৪টি করে মোট ৮টি সৃজনশীল প্রশ্ন থাকবে। গদ্য ও কবিতা থেকে কমপক্ষে ২টি করে মোট ৫টি প্রশ্নের উত্তর দিতে হবে। (৫ × ১০ = ৫০)',
    descriptive_max: 20,
    descriptive_count: 4,
    descriptive_to_answer: 2,
    descriptive_rule: 'আনন্দ পাঠ থেকে ৪টি বর্ণনামূলক প্রশ্ন থাকবে। এর মধ্যে ২টি প্রশ্নের উত্তর দিতে হবে। প্রত্যেকটি প্রশ্নের ২টি অংশ থাকবে। ক অংশের জন্য ৩ এবং খ অংশের জন্য ৭ নম্বর মোট ২০ নম্বর বরাদ্দ থাকবে। (২ × ১০ = ২০)',
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 30,
    mcq_rule: 'গদ্য থেকে ১৫টি এবং কবিতা থেকে ১৫টি করে মোট ৩০টি বহুনির্বাচনি প্রশ্ন থাকবে। সব কয়টি প্রশ্নের উত্তর দিতে হবে। (১ × ৩০ = ৩০)',
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_junior_bangla1',
    mcq_pass: 10
  },

  // ২. বাংলা ২য় পত্র (পূর্ণমান: ৫০)
  bangla2: {
    full_marks: 50,
    written_max: 35,
    written_pass: 12,
    composition_max: 35,
    composition_rule: 'নির্মিতি অংশ (৩৫ নম্বর): ১. অনুধাবন দক্ষতা/অনুচ্ছেদ রচনা (২টি থেকে ১টি: ৫), ২. পত্র/দরখাস্ত (২টি থেকে ১টি: ৫), ৩. সারাংশ/সারমর্ম (২টি থেকে ১টি: ৫), ৪. ভাবসম্প্রসারণ (২টি থেকে ১টি: ৫), ৫. প্রবন্ধ রচনা সংকেতসহ (৩টি থেকে ১টি: ১৫)।',
    cq_max: 0,
    cq_count: 0,
    cq_to_answer: 0,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 15,
    mcq_rule: 'বহুনির্বাচনি প্রশ্ন (ব্যাকরণ) (১৫ নম্বর): ১৫টি বহুনির্বাচনি প্রশ্ন (শুধু ব্যাকরণ অংশ হতে) থাকবে। সবকয়টি প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১। (১ × ১৫ = ১৫)',
    practical_max: 0,
    time_allowed: '২ ঘণ্টা',
    pattern: 'nctb_junior_bangla2',
    mcq_pass: 5
  },

  // ৩. ইংরেজী ১ম পত্র (পূর্ণমান: ১০০)
  english1: {
    full_marks: 100,
    reading_max: 70,
    writing_max: 30,
    written_max: 100,
    written_pass: 33,
    reading_rule: 'Part-A: Reading (70 Marks) — Seen Passage-1: 1. MCQ (1x7=7), 2. Answering questions (2x5=10); Seen Passage-2: 3. Gap filling (1x5=5), 4. Vocabulary (Synonyms & Antonyms) (1x5=5); Unseen Passage: 5. Information Transfer (1x5=5), 6. True/False (1x5=5), 7. Writing Summary (10), 8. Matching (1x5=5), 9. Re-arranging sentences (1x8=8), 10. Answering questions from Poems in English for Today (any 5 out of 8) (2x5=10).',
    writing_rule: 'Part-B: Writing (30 Marks) — 11. Completing Stories (10), 12. Writing Paragraph in 120 words (10), 13. Writing Dialogues (10).',
    cq_max: 0,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 7,
    practical_max: 0,
    time_allowed: '৩ ঘণ্টা',
    pattern: 'nctb_junior_english1'
  },

  // ৪. ইংরেজী ২য় পত্র (পূর্ণমান: ৫০)
  english2: {
    full_marks: 50,
    grammar_max: 30,
    writing_max: 20,
    written_max: 50,
    written_pass: 17,
    grammar_rule: 'Part-A: Grammar (30 Marks) — 1. Identification of Part of Speech (0.5x10=05), 2. Gap filling with clues (0.5x10=05), 3. Substitution table (1x5=5), 4. Right form of Verbs (1x5=5), 5. Changing sentences (Tense, Affirmative, Negative, Assertive, Interrogative, Optative, Imperative & Exclamatory) (1x5=5), 6. Punctuation and Capitalization (05).',
    writing_rule: 'Part-B: Writing (20 Marks) — 7. Letters/E-mail (Formal & Informal) (08), 8. Writing Short Composition in 200 words (12).',
    cq_max: 0,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    mcq_max: 0,
    practical_max: 0,
    time_allowed: '২ ঘণ্টা',
    pattern: 'nctb_junior_english2'
  },

  // ৫. গণিত (পূর্ণমান: ১০০)
  math: {
    full_marks: 100,
    written_max: 70,
    written_pass: 23,
    mcq_max: 30,
    mcq_pass: 10,
    cq_count: 11,
    cq_to_answer: 7,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    practical_max: 0,
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'cq_mcq',
    cq_rule: '১১টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৭টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে, সবকয়টি প্রশ্নের উত্তর দিতে হবে।'
  },

  // ৬. বাংলাদেশ ও বিশ্বপরিচয় (পূর্ণমান: ১০০)
  bgs: {
    full_marks: 100,
    written_max: 70,
    written_pass: 23,
    mcq_max: 30,
    mcq_pass: 10,
    cq_count: 11,
    cq_to_answer: 7,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    practical_max: 0,
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'cq_mcq',
    cq_rule: '১১টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৭টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে, সবকয়টি প্রশ্নের উত্তর দিতে হবে।'
  },

  // ৭. বিজ্ঞান (পূর্ণমান: ১০০)
  general_science: {
    full_marks: 100,
    written_max: 70,
    written_pass: 23,
    mcq_max: 30,
    mcq_pass: 10,
    cq_count: 11,
    cq_to_answer: 7,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    practical_max: 0,
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'cq_mcq',
    cq_rule: '১১টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৭টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে, সবকয়টি প্রশ্নের উত্তর দিতে হবে।'
  },

  // ৮. তথ্য ও যোগাযোগ প্রযুক্তি (পূর্ণমান: ৫০)
  ict: {
    full_marks: 50,
    written_max: 0,
    written_pass: 0,
    mcq_max: 25,
    mcq_pass: 8,
    practical_max: 25,
    practical_pass: 8,
    cq_count: 0,
    cq_to_answer: 0,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    time_allowed: '২ ঘণ্টা',
    pattern: 'mcq_practical',
    mcq_rule: '২৫টি বহুনির্বাচনি প্রশ্ন (২৫ নম্বর) এবং ব্যবহারিক অভীক্ষা (২৫ নম্বর)।'
  },

  // ৯. ইসলাম ধর্ম / ইসলাম ও নৈতিক শিক্ষা (পূর্ণমান: ১০০)
  islam: {
    full_marks: 100,
    written_max: 70,
    written_pass: 23,
    mcq_max: 30,
    mcq_pass: 10,
    cq_count: 11,
    cq_to_answer: 7,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    practical_max: 0,
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'cq_mcq',
    cq_rule: '১১টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৭টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে, সবকয়টি প্রশ্নের উত্তর দিতে হবে।'
  },

  // ১০. হিন্দু ধর্ম / হিন্দুধর্ম ও নৈতিক শিক্ষা (পূর্ণমান: ১০০)
  hindu: {
    full_marks: 100,
    written_max: 70,
    written_pass: 23,
    mcq_max: 30,
    mcq_pass: 10,
    cq_count: 11,
    cq_to_answer: 7,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    practical_max: 0,
    time_allowed: '২ ঘণ্টা ৩০ মিনিট',
    pattern: 'cq_mcq',
    cq_rule: '১১টি সৃজনশীল প্রশ্ন থাকবে, যেকোনো ৭টি প্রশ্নের উত্তর দিতে হবে (প্রতিটির মান ১০)।',
    mcq_rule: '৩০টি বহুনির্বাচনি প্রশ্ন থাকবে, সবকয়টি প্রশ্নের উত্তর দিতে হবে।'
  },

  // ১১. কৃষি শিক্ষা (পূর্ণমান: ৫০)
  agriculture: {
    full_marks: 50,
    written_max: 30,
    written_pass: 10,
    mcq_max: 0,
    practical_max: 20,
    practical_pass: 7,
    cq_count: 5,
    cq_to_answer: 3,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    time_allowed: '২ ঘণ্টা',
    pattern: 'science_practical',
    cq_rule: 'সৃজনশীল/তত্ত্বীয় অংশ ৩০ নম্বর ও ব্যবহারিক অংশ ২০ নম্বর।'
  },

  // ১২. শারীরিক শিক্ষা ও স্বাস্থ্য (পূর্ণমান: ৫০)
  physical_edu: {
    full_marks: 50,
    written_max: 20,
    written_pass: 7,
    mcq_max: 10,
    mcq_pass: 3,
    practical_max: 20,
    practical_pass: 7,
    cq_count: 3,
    cq_to_answer: 2,
    short_max: 0,
    short_count: 0,
    short_to_answer: 0,
    time_allowed: '১ ঘণ্টা ৩০ মিনিট',
    pattern: 'practical_continuous',
    practical_rule: 'তত্ত্বীয় ও ব্যবহারিক/ধারাবাহিক মূল্যায়ন (৫০ নম্বর)।'
  }
};

// Helper to get Marks Scheme depending on Class
export function getSubjectMarksScheme(subject, className) {
  if (!subject) return null;
  const isSsc = String(className) === '9' || String(className) === '10';
  if (isSsc && NCTB_SSC_EVALUATION_SPECS[subject.id]) {
    return NCTB_SSC_EVALUATION_SPECS[subject.id];
  }
  const isJunior = ['6', '7', '8'].includes(String(className));
  if (isJunior && NCTB_JUNIOR_EVALUATION_SPECS[subject.id]) {
    return NCTB_JUNIOR_EVALUATION_SPECS[subject.id];
  }
  return subject.marks_scheme;
}

// =========================================================================
// 1. NCTB SUBJECTS MASTER CATALOG (ALIGNED WITH RESULT & MARKS DISTRIBUTION)
// =========================================================================
export const SUBJECT_METADATA = [
  // --- আবশ্যিক বিষয়াবলী (Compulsory Subjects) ---
  {
    id: 'bangla1',
    code: '101',
    name: 'বাংলা ১ম পত্র',
    name_en: 'Bangla 1st Paper',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'bangla2',
    code: '102',
    name: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)',
    name_en: 'Bangla 2nd Paper',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'english1',
    code: '107',
    name: 'English 1st Paper',
    name_en: 'English 1st Paper',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 100,
      written_pass: 33,
      mcq_max: 0,
      mcq_pass: 0,
      practical_max: 0,
      cq_count: 8,
      cq_to_answer: 8,
      time_allowed: '৩ ঘণ্টা',
      pattern: 'reading_writing'
    }
  },
  {
    id: 'english2',
    code: '108',
    name: 'English 2nd Paper',
    name_en: 'English 2nd Paper',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 100,
      written_pass: 33,
      mcq_max: 0,
      mcq_pass: 0,
      practical_max: 0,
      cq_count: 10,
      cq_to_answer: 10,
      time_allowed: '৩ ঘণ্টা',
      pattern: 'grammar_composition'
    }
  },
  {
    id: 'math',
    code: '109',
    name: 'গণিত (Mathematics)',
    name_en: 'Mathematics',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'general_science',
    code: '127',
    name: 'সাধারণ বিজ্ঞান',
    name_en: 'General Science',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'bgs',
    code: '150',
    name: 'বাংলাদেশ ও বিশ্বপরিচয়',
    name_en: 'Bangladesh & Global Studies',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'বিজ্ঞান'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'islam',
    code: '111',
    name: 'ইসলাম ও নৈতিক শিক্ষা',
    name_en: 'Islam & Moral Education',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'hindu',
    code: '112',
    name: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
    name_en: 'Hindu Religion & Moral Education',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'ict',
    code: '154',
    name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    name_en: 'Information & Communication Technology',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'আবশ্যিক', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 50,
      written_max: 0,
      written_pass: 0,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 0,
      cq_to_answer: 0,
      time_allowed: '২৫ মিনিট',
      pattern: 'mcq_practical'
    }
  },
  {
    id: 'agriculture',
    code: '134',
    name: 'কৃষি শিক্ষা (ঐচ্ছিক/সাধারণ)',
    name_en: 'Agriculture Studies',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 50,
      written_pass: 17,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 8,
      cq_to_answer: 5,
      time_allowed: '২ ঘণ্টা ৩৫ মিনিট',
      pattern: 'science_practical'
    }
  },
  {
    id: 'home_science',
    code: '151',
    name: 'গার্হস্থ্য বিজ্ঞান (ঐচ্ছিক/সাধারণ)',
    name_en: 'Home Science',
    classes: ['6', '7', '8', '9', '10'],
    departments: ['সাধারণ', 'মানবিক'],
    marks_scheme: {
      full_marks: 100,
      written_max: 50,
      written_pass: 17,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 8,
      cq_to_answer: 5,
      time_allowed: '২ ঘণ্টা ৩৫ মিনিট',
      pattern: 'science_practical'
    }
  },
  {
    id: 'physical_edu',
    code: '147',
    name: 'শারীরিক শিক্ষা ও স্বাস্থ্য',
    name_en: 'Physical Education & Health',
    classes: ['6', '7', '8'],
    departments: ['সাধারণ', 'আবশ্যিক'],
    marks_scheme: {
      full_marks: 50,
      written_max: 20,
      written_pass: 7,
      mcq_max: 10,
      mcq_pass: 3,
      practical_max: 20,
      cq_count: 3,
      cq_to_answer: 2,
      time_allowed: '১ ঘণ্টা ৩০ মিনিট',
      pattern: 'practical_continuous'
    }
  },

  // --- বিজ্ঞান বিভাগ (Science Group) ---
  {
    id: 'physics',
    code: '136',
    name: 'পদার্থবিজ্ঞান',
    name_en: 'Physics',
    classes: ['9', '10'],
    departments: ['বিজ্ঞান'],
    marks_scheme: {
      full_marks: 100,
      written_max: 50,
      written_pass: 17,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 8,
      cq_to_answer: 5,
      time_allowed: '২ ঘণ্টা ৩৫ মিনিট',
      pattern: 'science_practical'
    }
  },
  {
    id: 'chemistry',
    code: '137',
    name: 'রসায়ন',
    name_en: 'Chemistry',
    classes: ['9', '10'],
    departments: ['বিজ্ঞান'],
    marks_scheme: {
      full_marks: 100,
      written_max: 50,
      written_pass: 17,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 8,
      cq_to_answer: 5,
      time_allowed: '২ ঘণ্টা ৩৫ মিনিট',
      pattern: 'science_practical'
    }
  },
  {
    id: 'biology',
    code: '138',
    name: 'জীববিজ্ঞান',
    name_en: 'Biology',
    classes: ['9', '10'],
    departments: ['বিজ্ঞান'],
    marks_scheme: {
      full_marks: 100,
      written_max: 50,
      written_pass: 17,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 8,
      cq_to_answer: 5,
      time_allowed: '২ ঘণ্টা ৩৫ মিনিট',
      pattern: 'science_practical'
    }
  },
  {
    id: 'higher_math',
    code: '126',
    name: 'উচ্চতর গণিত',
    name_en: 'Higher Mathematics',
    classes: ['9', '10'],
    departments: ['বিজ্ঞান'],
    marks_scheme: {
      full_marks: 100,
      written_max: 50,
      written_pass: 17,
      mcq_max: 25,
      mcq_pass: 8,
      practical_max: 25,
      cq_count: 8,
      cq_to_answer: 5,
      time_allowed: '২ ঘণ্টা ৩৫ মিনিট',
      pattern: 'science_practical'
    }
  },

  // --- মানবিক বিভাগ (Humanities Group) ---
  {
    id: 'history',
    code: '153',
    name: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
    name_en: 'History of Bangladesh & World Civilization',
    classes: ['9', '10'],
    departments: ['মানবিক'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'geography',
    code: '110',
    name: 'ভূগোল ও পরিবেশ',
    name_en: 'Geography & Environment',
    classes: ['9', '10'],
    departments: ['মানবিক'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'civics',
    code: '140',
    name: 'পৌরনীতি ও নাগরিকতা',
    name_en: 'Civics & Citizenship',
    classes: ['9', '10'],
    departments: ['মানবিক'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'economics',
    code: '141',
    name: 'অর্থনীতি',
    name_en: 'Economics',
    classes: ['9', '10'],
    departments: ['মানবিক'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },

  // --- ব্যবসায় শিক্ষা শাখা (Business Studies Group) ---
  {
    id: 'accounting',
    code: '146',
    name: 'হিসাববিজ্ঞান',
    name_en: 'Accounting',
    classes: ['9', '10'],
    departments: ['ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'business_ent',
    code: '143',
    name: 'ব্যবসায় উদ্যোগ',
    name_en: 'Business Entrepreneurship',
    classes: ['9', '10'],
    departments: ['ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  },
  {
    id: 'finance',
    code: '152',
    name: 'ফিন্যান্স ও ব্যাংকিং',
    name_en: 'Finance & Banking',
    classes: ['9', '10'],
    departments: ['ব্যবসায় শিক্ষা'],
    marks_scheme: {
      full_marks: 100,
      written_max: 70,
      written_pass: 23,
      mcq_max: 30,
      mcq_pass: 10,
      practical_max: 0,
      cq_count: 11,
      cq_to_answer: 7,
      time_allowed: '২ ঘণ্টা ৩০ মিনিট',
      pattern: 'cq_mcq'
    }
  }
];

// =========================================================================
// 2. COMPLETE NCTB CHAPTER CATALOG FOR ALL SUBJECTS & CLASSES (6, 7, 8, 9, 10)
// =========================================================================
export const CHAPTERS_DATA = {
  bangla1: {
    '6': [
      '১ম অধ্যায়: সততার পুরস্কার (মুহম্মদ শহীদুল্লাহ্)',
      '২য় অধ্যায়: মিনু (বনফুল)',
      '৩য় অধ্যায়: নীলনদ আর পিরামিডের দেশ (সৈয়দ মুজতবা আলী)',
      '৪র্থ অধ্যায়: আকাশ (আব্দুল্লাহ আল-মুতী)',
      '৫ম অধ্যায়: অমর একুশে (রফিকুল ইসলাম)',
      '৬ষ্ঠ অধ্যায় (কবিতা): জন্মভূমি (রবীন্দ্রনাথ ঠাকুর)',
      '৭ম অধ্যায় (কবিতা): মানুষ জাতি (সত্যেন্দ্রনাথ দত্ত)',
      '৮ম অধ্যায় (কবিতা): সুখ (কামিনী রায়)'
    ],
    '7': [
      '১ম অধ্যায়: কাবুলিওয়ালা (রবীন্দ্রনাথ ঠাকুর)',
      '২য় অধ্যায়: লখার একুশে (আবু কায়সার)',
      '৩য় অধ্যায়: মরু-ভাস্কর (হবীবুল্লাহ বাহার)',
      '৪র্থ অধ্যায়: শব্দ থেকে কবিতা (হুমায়ুন আজাদ)',
      '৫ম অধ্যায় (কবিতা): মেলা (আহসান হাবীব)',
      '৬ষ্ঠ অধ্যায় (কবিতা): কুলি-মজুর (কাজী নজরুল ইসলাম)',
      '৭ম অধ্যায় (কবিতা): আমার বাড়ি (জসীমউদ্দীন)'
    ],
    '8': [
      '১ম অধ্যায়: অতিথির স্মৃতি (শরৎচন্দ্র চট্টোপাধ্যায়)',
      '২য় অধ্যায়: ভাব ও কাজ (কাজী নজরুল ইসলাম)',
      '৩য় অধ্যায়: পড়ে পাওয়া (বিভূতিভূষণ বন্দ্যোপাধ্যায়)',
      '৪র্থ অধ্যায়: তৈলচিত্রের ভূত (মানিক বন্দ্যোপাধ্যায়)',
      '৫ম অধ্যায় (কবিতা): মানবধর্ম (লালন শাহ্)',
      '৬ষ্ঠ অধ্যায় (কবিতা): বঙ্গভূমির প্রতি (মাইকেল মধুসূদন দত্ত)',
      '৭ম অধ্যায় (কবিতা): দুই বিঘা জমি (রবীন্দ্রনাথ ঠাকুর)',
      '৮ম অধ্যায় (কবিতা): নারী (কাজী নজরুল ইসলাম)'
    ],
    '9': [
      '১ম অধ্যায়: শুভা (রবীন্দ্রনাথ ঠাকুর)',
      '২য় অধ্যায়: বই পড়া (প্রমথ চৌধুরী)',
      '৩য় অধ্যায়: অভাগীর স্বর্গ (শরৎচন্দ্র চট্টোপাধ্যায়)',
      '৪র্থ অধ্যায়: পল্লীসাহিত্য (মুহম্মদ শহীদুল্লাহ্)',
      '৫ম অধ্যায়: আম-আঁটির ভেঁপু (বিভূতিভূষণ বন্দ্যোপাধ্যায়)',
      '৬ষ্ঠ অধ্যায় (কবিতা): বঙ্গবাণী (আব্দুল হাকিম)',
      '৭ম অধ্যায় (কবিতা): কপোতাক্ষ নদ (মাইকেল মধুসূদন দত্ত)',
      '৮ম অধ্যায় (কবিতা): মানুষ (কাজী নজরুল ইসলাম)',
      '৯ম অধ্যায় (কবিতা): পল্লীজননী (জসীমউদ্দীন)'
    ],
    '10': [
      '১ম অধ্যায়: মানুষ মুহম্মদ (স:) (মোহাম্মদ ওয়াজেদ আলী)',
      '২য় অধ্যায়: নিমগাছ (বনফুল)',
      '৩য় অধ্যায়: শিক্ষা ও মনুষ্যত্ব (মোতাহের হোসেন চৌধুরী)',
      '৪র্থ অধ্যায়: প্রবাস বন্ধু (সৈয়দ মুজতবা আলী)',
      '৫ম অধ্যায়: একাত্তরের দিনগুলি (জাহানারা ইমাম)',
      '৬ষ্ঠ অধ্যায় (কবিতা): জীবন-সঙ্গীত (হেমচন্দ্র বন্দ্যোপাধ্যায়)',
      '৭ম অধ্যায় (কবিতা): সেইদিন এই মাঠ (জীবনানন্দ দাশ)',
      '৮ম অধ্যায় (কবিতা): রানার (সুকান্ত ভট্টাচার্য)',
      '৯ম অধ্যায় (কবিতা): তোমাকে পাওয়ার জন্য হে স্বাধীনতা (শামসুর রাহমান)',
      '১০ম অধ্যায় (কবিতা): সাহসী জননী বাংলা (কামাল চৌধুরী)'
    ]
  },

  bangla2: {
    '6': ['১ম অধ্যায়: ভাষা ও বাংলা ভাষা', '২য় অধ্যায়: রূপতত্ত্ব', '৩য় অধ্যায়: বাক্যতত্ত্ব', '৪র্থ অধ্যায়: বাগর্থ', '৫ম অধ্যায় (নির্মিতি): অনুচ্ছেদ, সারাংশ ও আবেদনপত্র'],
    '7': ['১ম অধ্যায়: ভাষা ও বাংলা ব্যাকরণ', '২য় অধ্যায়: ধ্বনি ও বর্ণ', '৩য় অধ্যায়: শব্দ ও পদ', '৪র্থ অধ্যায়: সন্ধি', '৫ম অধ্যায়: বিরামচিহ্ন', '৬ষ্ঠ অধ্যায় (নির্মিতি): সারমর্ম ও ভাবসম্প্রসারণ'],
    '8': ['১ম অধ্যায়: ভাষা ও ব্যাকরণ', '২য় অধ্যায়: ধ্বনি ও বর্ণ', '৩য় অধ্যায়: সন্ধি', '৪র্থ অধ্যায়: শব্দগঠন ও পদ', '৫ম অধ্যায়: বাক্য ও বিরাম চিহ্ন', '৬ষ্ঠ অধ্যায় (নির্মিতি): ভাবসম্প্রসারণ ও আবেদনপত্র'],
    '9': ['১ম পরিচ্ছেদ: ভাষা ও বাংলা ব্যাকরণ', '২য় পরিচ্ছেদ: ধ্বনিতত্ত্ব ও ধ্বনি পরিবর্তন', '৩য় পরিচ্ছেদ: ণত্ব ও ষত্ব বিধান', '৪র্থ পরিচ্ছেদ: সন্ধি', '৫ম পরিচ্ছেদ: শব্দ গঠন ও উপসর্গ', '৬ষ্ঠ পরিচ্ছেদ: সমাস ও প্রত্যয়', 'নির্মিতি: অনুচ্ছেদ ও ভাবসম্প্রসারণ'],
    '10': ['৭ম পরিচ্ছেদ: কারক ও বিভক্তি', '৮ম পরিচ্ছেদ: বাচ্য ও বাক্য রূপান্তর', '৯ম পরিচ্ছেদ: বিরামচিহ্ন ও পদ প্রকরণ', '১০ম পরিচ্ছেদ: বাগ্ধারা ও প্রবাদ-প্রবচন', 'নির্মিতি: প্রতিবেদন, পত্র রচনা ও প্রবন্ধ রচনা']
  },

  english1: {
    '6': ['Unit 1: Talking to People', 'Unit 2: Little Things', 'Unit 3: Future Lies in Present', 'Unit 4: Ask and Answer', 'Unit 5: Together We Are One', 'Unit 6: The Missing Tenth Man'],
    '7': ['Unit 1: A Day in the Life', 'Unit 2: Playing with the Words', 'Unit 3: If I were a Bird', 'Unit 4: The Frog and the Ox', 'Unit 5: Have You Filled a Bucket Today?', 'Unit 6: A Good Reader'],
    '8': ['Unit 1: A Journey Through Bangladesh', 'Unit 2: The Art of Living', 'Unit 3: Language and Identity', 'Unit 4: Life and Nature', 'Unit 5: Writing Stories', 'Unit 6: Introducing Someone'],
    '9': ['Unit 1: Father of the Nation', 'Unit 2: Pastimes', 'Unit 3: Events and Festivals', 'Unit 4: Are We Aware?', 'Unit 5: Nature and Environment', 'Unit 6: Our Neighbours', 'Writing: Paragraph & Story'],
    '10': ['Unit 7: People Who Stand Out', 'Unit 8: World Heritage', 'Unit 10: Dreams', 'Unit 11: Renewable Energy', 'Unit 12: Roots', 'Writing: Describing Graph/Chart, Informal Letter & Dialogue']
  },

  english2: {
    '6': ['Grammar: Parts of Speech (Noun, Pronoun, Adjective, Verb)', 'Grammar: Tense (Present, Past, Future)', 'Grammar: Articles (A, An, The)', 'Composition: Paragraph & Informal Letter'],
    '7': ['Grammar: Prepositions', 'Grammar: Right Form of Verbs', 'Grammar: Voice Change', 'Grammar: Subject-Verb Agreement', 'Composition: Formal Application & Story Writing'],
    '8': ['Grammar: Narration (Direct & Indirect)', 'Grammar: Voice Transformation', 'Grammar: Degree of Comparison', 'Grammar: Punctuation', 'Composition: Dialogue Writing & Email'],
    '9': ['Grammar: Gap Filling with & without Clues', 'Grammar: Substitution Table', 'Grammar: Right Form of Verbs', 'Grammar: Transformation of Sentences', 'Composition: Paragraph & Informal Letter'],
    '10': ['Grammar: Tag Questions', 'Grammar: Sentence Connectors', 'Grammar: Punctuation & Capitalization', 'Composition: Curriculum Vitae (CV) with Cover Letter', 'Composition: Formal Complaint Letter & Composition']
  },

  math: {
    '6': ['১ম অধ্যায়: স্বাভাবিক সংখ্যা ও ভগ্নাংশ', '২য় অধ্যায়: অনুপাত ও শতকরা', '৩য় অধ্যায়: পূর্ণসংখ্যা', '৪র্থ অধ্যায়: বীজগণিতীয় রাশি', '৫ম অধ্যায়: সরল সমীকরণ', '৬ষ্ঠ অধ্যায়: জ্যামিতির মৌলিক ধারণা', '৭ম অধ্যায়: ব্যবহারিক জ্যামিতি', '৮ম অধ্যায়: তথ্য ও উপাত্ত'],
    '7': ['১ম অধ্যায়: মূলদ ও অমূলদ সংখ্যা', '২য় অধ্যায়: সমানুপাত ও লাভ-ক্ষতি', '৩য় অধ্যায়: পরিমাপ', '৪র্থ অধ্যায়: বীজগণিতীয় রাশির গুণ ও ভাগ', '৫ম অধ্যায়: বীজগণিতীয় সূত্রাবলী ও প্রয়োগ', '৬ষ্ঠ অধ্যায়: সরল সমীকরণ', '৭ম অধ্যায়: ত্রিভুজ ও চতুর্ভুজ', '৮ম অধ্যায়: তথ্য ও উপাত্ত'],
    '8': ['১ম অধ্যায়: প্যাটার্ন', '২য় অধ্যায়: মুনাফা ও চক্রবৃদ্ধি', '৩য় অধ্যায়: পরিমাপ', '৪র্থ অধ্যায়: বীজগণিতীয় সূত্রাবলী ও প্রয়োগ', '৫ম অধ্যায়: বীজগণিতীয় ভগ্নাংশ', '৬ষ্ঠ অধ্যায়: সরল সহসমীকরণ', '৭ম অধ্যায়: পিথাগোরাসের উপপাদ্য', '৮ম অধ্যায়: চতুর্ভুজ ও বৃত্ত', '৯ম অধ্যায়: তথ্য ও উপাত্ত'],
    '9': ['১ম অধ্যায়: বাস্তব সংখ্যা', '২য় অধ্যায়: সেট ও ফাংশন', '৩য় অধ্যায়: বীজগাণিতিক রাশি', '৪র্থ অধ্যায়: সূচক ও লগারিদম', '৫ম অধ্যায়: এক চলকবিশিষ্ট সমীকরণ', '৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ', '৭ম অধ্যায়: ব্যবহারিক জ্যামিতি', '৮ম অধ্যায়: বৃত্ত', '৯ম অধ্যায়: ত্রিকোণমিতিক অনুপাত', '১০ম অধ্যায়: দূরত্ব ও উচ্চতা', '১১শ অধ্যায়: বীজগণিতীয় অনুপাত ও সমানুপাত', '১২শ অধ্যায়: পরিসংখ্যান'],
    '10': ['১ম অধ্যায়: বাস্তব সংখ্যা ও সেট-ফাংশন', '২য় অধ্যায়: বীজগাণিতিক রাশি ও সূচক-লগারিদম', '৩য় অধ্যায়: দুই চলকবিশিষ্ট সরল সহসমীকরণ', '৪র্থ অধ্যায়: সসীম ধারা', '৫ম অধ্যায়: বৃত্ত ও ব্যবহারিক জ্যামিতি', '৬ষ্ঠ অধ্যায়: ত্রিকোণমিতিক অনুপাত ও দূরত্ব-উচ্চতা', '৭ম অধ্যায়: পরিমিতি (ক্ষেত্রফল ও আয়তন)', '৮ম অধ্যায়: পরিসংখ্যান (গড়, মধ্যক, প্রচুরক, ওজাইভ রেখা)']
  },

  general_science: {
    '6': ['১ম অধ্যায়: বৈজ্ঞানিক প্রক্রিয়া ও পরিমাপ', '২য় অধ্যায়: জীবজগৎ', '৩য় অধ্যায়: উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন', '৪র্থ অধ্যায়: পদার্থের বৈশিষ্ট্য ও বাহ্যিক প্রভাব', '৫ম অধ্যায়: খাদ্য ও পুষ্টি', '৬ষ্ঠ অধ্যায়: সংবেদী অঙ্গ', '৭ম অধ্যায়: দেখতে হলে আলো চাই'],
    '7': ['১ম অধ্যায়: নিম্নশ্রেণির জীব', '২য় অধ্যায়: উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন', '৩য় অধ্যায়: উদ্ভিদের বাহ্যিক বৈশিষ্ট্য', '৪র্থ অধ্যায়: রক্ত সংবহনতন্ত্র', '৫ম অধ্যায়: পদার্থের গঠন', '৬ষ্ঠ অধ্যায়: শক্তির ব্যবহার', '৭ম অধ্যায়: আলোর ঘটনা'],
    '8': ['১ম অধ্যায়: প্রাণিজগতের শ্রেণিবিন্যাস', '২য় অধ্যায়: জীবের বৃদ্ধি ও বংশগতি', '৩য় অধ্যায়: ব্যাপন, অভিস্রবণ ও প্রস্বেদন', '৪র্থ অধ্যায়: রাসায়নিক বিক্রিয়া', '৫ম অধ্যায়: সমন্বয় ও সংবেদন', '৬ষ্ঠ অধ্যায়: অম্ল, ক্ষারক ও লবণ', '৭ম অধ্যায়: পৃথিবী ও মহাকর্ষ', '৮ম অধ্যায়: আলো ও পরমাণুর গঠন'],
    '9': ['১ম অধ্যায়: উন্নততর জীবনধারা', '২য় অধ্যায়: জীবনের জন্য পানি', '৩য় অধ্যায়: হৃদযন্ত্রের যত কথা', '৪র্থ অধ্যায়: নবজীবনের সূচনা', '৫ম অধ্যায়: দেখতে হলে আলো চাই', '৬ষ্ঠ অধ্যায়: পলিমার'],
    '10': ['৭ম অধ্যায়: অম্ল, ক্ষারক ও লবণের ব্যবহার', '৮ম অধ্যায়: আমাদের সম্পদ', '৯ম অধ্যায়: দুর্যোগের সাথে বসবাস', '১০ম অধ্যায়: এসো বলকে জানি', '১১শ অধ্যায়: জীবপ্রযুক্তি', '১২শ অধ্যায়: প্রাত্যহিক জীবনে বিদ্যুৎ']
  },

  bgs: {
    '6': ['১ম অধ্যায়: বাংলাদেশের ইতিহাস', '২য় অধ্যায়: বাংলাদেশ ও আঞ্চলিক সহযোগিতা', '৩য় অধ্যায়: বাংলাদেশের ভৌগোলিক পরিবেশ', '৪র্থ অধ্যায়: অর্থনীতি ও জনসংখ্যা'],
    '7': ['১ম অধ্যায়: বাংলাদেশের স্বাধীনতা সংগ্রাম', '২য় অধ্যায়: বাংলাদেশের সংস্কৃতি ও সাংস্কৃতিক বৈচিত্র্য', '৩য় অধ্যায়: জলবায়ু ও দুর্যোগ', '৪র্থ অধ্যায়: বাংলাদেশের অর্থনীতি ও সমাজ'],
    '8': ['১ম অধ্যায়: ঔপনিবেশিক যুগ ও বাংলার স্বাধীনতা সংগ্রাম', '২য় অধ্যায়: বাংলাদেশের মুক্তিযুদ্ধ', '৩য় অধ্যায়: বাংলাদেশের প্রাকৃতিক সম্পদ', '৪র্থ অধ্যায়: সামাজিক সমস্যা ও প্রতিকার'],
    '9': ['১ম অধ্যায়: পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান', '২য় অধ্যায়: স্বাধীন বাংলাদেশ', '৩য় অধ্যায়: সৌরজগৎ ও ভূমণ্ডল', '৪র্থ অধ্যায়: ভূপ্রকৃতি ও ভূমিকম্প', '৫ম অধ্যায়: নদ-নদী ও পানি সম্পদ', '৬ষ্ঠ অধ্যায়: রাষ্ট্র, নাগরিকতা ও আইন'],
    '10': ['৭ম অধ্যায়: বাংলাদেশ সরকারের অঙ্গসমূহ ও শাসনব্যবস্থা', '৮ম অধ্যায়: বাংলাদেশের গণতন্ত্র ও নির্বাচন', '৯ম অধ্যায়: জাতিসংঘ ও বাংলাদেশ', '১০ম অধ্যায়: টেকসই উন্নয়ন অভীষ্ট (SDG)', '১১শ অধ্যায়: জাতীয় সম্পদ ও অর্থনৈতিক ব্যবস্থা', '১২শ অধ্যায়: বাংলাদেশের অর্থনৈতিক নির্দেশক', '১৩শ অধ্যায়: সামাজিক পরিবর্তন ও সমস্যা']
  },

  islam: {
    '6': ['১ম অধ্যায়: আকাইদ', '২য় অধ্যায়: ইবাদত (তাহরাত ও সালাত)', '৩য় অধ্যায়: আখলাক ও নৈতিকতা', '৪র্থ অধ্যায়: কোরআন ও হাদিস পরিচিতি', '৫ম অধ্যায়: আদর্শ জীবনচরিত'],
    '7': ['১ম অধ্যায়: তাওহিদ ও রিসালাত', '২য় অধ্যায়: তাহরাত, সালাত ও সাওম', '৩য় অধ্যায়: কোরআন তিলাওয়াত ও তাজবিদ', '৪র্থ অধ্যায়: আখলাক-ই-হামিদা', '৫ম অধ্যায়: নবী ও সাহাবিদের জীবনী'],
    '8': ['১ম অধ্যায়: আকাইদ ও ঈমান', '২য় অধ্যায়: ইবাদতের তাৎপর্য ও যাকাত-হজ', '৩য় অধ্যায়: আল-কোরআন ও নির্বাচিত হাদিস', '৪র্থ অধ্যায়: আখলাক বা সচ্চরিত্র গঠন', '৫ম অধ্যায়: আদর্শ জীবনচরিত ও খিলাফত'],
    '9': ['১ম অধ্যায়: আকাইদ ও নৈতিক জীবন', '২য় অধ্যায়: শরিয়তের উৎস (কোরআন ও সুন্নাহ)', '৩য় অধ্যায়: ইবাদত ও এর সামাজিক তাৎপর্য', '৪র্থ অধ্যায়: আখলাক ও মানবকল্যাণ'],
    '10': ['১ম অধ্যায়: ঈমানের মৌলিক বিষয় ও পরকাল', '২য় অধ্যায়: শরিয়তের বিধান ও হালাল-হারাম', '৩য় অধ্যায়: মুয়ামালাত ও সামাজিক দায়িত্ব', '৪র্থ অধ্যায়: আখলাক-ই-হামিদা ও জামিমা পরিহার', '৫ম অধ্যায়: ইসলামি সভ্যতা ও মুসলিম মনীষী']
  },

  hindu: {
    '6': ['১ম অধ্যায়: সৃষ্টিকর্তা ও সৃষ্টি', '২য় অধ্যায়: দেব-দেবী ও পূজা', '৩য় অধ্যায়: হিন্দুধর্মের উৎপত্তি ও বিকাশ', '৪র্থ অধ্যায়: ধর্মগ্রন্থে নৈতিক শিক্ষা'],
    '7': ['১ম অধ্যায়: ঈশ্বর ও উপাসনা', '২য় অধ্যায়: দেব-দেবী ও পূজাপার্বণ', '৩য় অধ্যায়: ধর্মগ্রন্থ ও নীতিশিক্ষা', '৪র্থ অধ্যায়: মহাপুরুষ ও মহীয়সী নারী'],
    '8': ['১ম অধ্যায়: ঈশ্বর ও মুক্তি', '২য় অধ্যায়: বেদ ও পুরাণ', '৩য় অধ্যায়: ধর্মীয় উৎসব ও পূজা', '৪র্থ অধ্যায়: নৈতিক মূল্যবোধ ও সমাজ'],
    '9': ['১ম অধ্যায়: স্রষ্টা ও সৃষ্টি', '২য় অধ্যায়: দেব-দেবী ও পূজাতত্ত্ব', '৩য় অধ্যায়: সংস্কার ও ধর্মীয় আচার', '৪র্থ অধ্যায়: শ্রীমদ্ভগবদ্গীতা ও বেদ'],
    '10': ['১ম অধ্যায়: ধর্মতত্ত্ব ও জীবনদর্শন', '২য় অধ্যায়: হিন্দুধর্মের নীতি ও সামাজিক মূল্যবোধ', '৩য় অধ্যায়: রামায়ণ ও মহাভারত শিক্ষা', '৪র্থ অধ্যায়: শ্রীচৈতন্য ও রামকৃষ্ণ পরমহংসের জীবনাদর্শ']
  },

  ict: {
    '6': ['১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি', '২য় অধ্যায়: আইসিটি সংশ্লিষ্ট যন্ত্রপাতি', '৩য় অধ্যায়: নিরাপদ ও নৈতিক ব্যবহার'],
    '7': ['১ম অধ্যায়: প্রাত্যহিক জীবনে আইসিটি', '২য় অধ্যায়: কম্পিউটার সংশ্লিষ্ট হার্ডওয়্যার ও সফটওয়্যার', '৩য় অধ্যায়: নিরাপদ ইন্টারনেট ব্যবহার'],
    '8': ['১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ', '২য় অধ্যায়: কম্পিউটার নেটওয়ার্ক ও টপোলজি', '৩য় অধ্যায়: তথ্য নিরাপত্তা ও মেলওয়্যার', '৪র্থ অধ্যায়: স্প্রেডশিটের মৌলিক ব্যবহার'],
    '9': ['১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ', '২য় অধ্যায়: কম্পিউটার ও ব্যবহারকারীর নিরাপত্তা ও পাসওয়ার্ড', '৩য় অধ্যায়: আমার শিক্ষায় ইন্টারনেট ও ই-লার্নিং', '৪র্থ অধ্যায়: আমার লেখালেখি ও হিসাব (Word & Excel)'],
    '10': ['১ম অধ্যায়: কম্পিউটার ও তথ্য নিরাপত্তা', '২য় অধ্যায়: ইন্টারনেটের নিরাপদ ও আইনি ব্যবহার', '৩য় অধ্যায়: মাল্টিমিডিয়া ও গ্রাফিক্স (Photoshop & Illustrator)', '৪র্থ অধ্যায়: ডেটাবেজ পরিচিতি ও ব্যবহার (MS Access)']
  },

  agriculture: {
    '6': ['১ম অধ্যায়: কৃষির পরিধি ও সুযোগ', '২য় অধ্যায়: কৃষি প্রযুক্তি ও যন্ত্রপাতি', '৩য় অধ্যায়: কৃষি উপকরণ ও বীজ', '৪র্থ অধ্যায়: কৃষি ও জলবায়ু'],
    '7': ['১ম অধ্যায়: কৃষি প্রযুক্তি ও উদ্ভাবন', '২য় অধ্যায়: কৃষি উপকরণ, সার ও সেচ', '৩য় অধ্যায়: মাঠ ফসল ও উদ্যান ফসল', '৪র্থ অধ্যায়: পশুপালন ও মৎস্যচাষ'],
    '8': ['১ম অধ্যায়: কৃষিজ প্রযুক্তি ও যান্ত্রিকীকরণ', '২য় অধ্যায়: মাটির উর্বরতা ও সার ব্যবস্থাপনা', '৩য় অধ্যায়: উদ্যান ফসল ও শাকসবজি চাষ', '৪র্থ অধ্যায়: বনায়ন ও সামাজিক বন'],
    '9': ['১ম অধ্যায়: কৃষি প্রযুক্তি (ফসল নির্বাচন, বীজ ও সার প্রস্তুতকরণ)', '২য় অধ্যায়: কৃষি উপকরণ ও বীজ সংরক্ষণ', '৩য় অধ্যায়: কৃষি ও জলবায়ু পরিবর্তন', '৪র্থ অধ্যায়: কৃষি উৎপাদন (মাঠ ফসল ও শাকসবজি)'],
    '10': ['৪র্থ অধ্যায়: ফল চাষ, পশুপালন ও মাছ চাষ', '৫ম অধ্যায়: বনায়ন ও ম্যানগ্রোভ বন', '৬ষ্ঠ অধ্যায়: কৃষি সমবায় ও বিপণন', '৭ম অধ্যায়: পারিবারিক খামার ও উদ্যোক্তা']
  },

  home_science: {
    '6': ['১ম অধ্যায়: গৃহ ও গৃহ পরিবেশ', '২য় অধ্যায়: গৃহের অভ্যন্তরীণ সাজসজ্জা', '৩য় অধ্যায়: বস্ত্র ও পোশাক পরিচ্ছন্নতা', '৪র্থ অধ্যায়: খাদ্য ও পুষ্টি উপাদান'],
    '7': ['১ম অধ্যায়: গৃহ ব্যবস্থাপনা ও পারিবারিক সম্পদ', '২য় অধ্যায়: পারিবারিক জীবনের বিকাশ', '৩য় অধ্যায়: শিশুর বিকাশ ও পরিচর্যা', '৪র্থ অধ্যায়: খাদ্য উপাদান ও পুষ্টিমান'],
    '8': ['১ম অধ্যায়: গৃহের অভ্যন্তরীণ পরিবেশ ও আলো-বাতাস', '২য় অধ্যায়: পারিবারিক বাজেট ও সঞ্চয়', '৩য় অধ্যায়: বয়ঃসন্ধিকালীন স্বাস্থ্য', '৪র্থ অধ্যায়: পুষ্টি ও রান্নাবান্নার কৌশল'],
    '9': ['১ম অধ্যায়: গৃহ ব্যবস্থাপনা ও গৃহের সম্পদ', '২য় অধ্যায়: পারিবারিক অর্থ ব্যবস্থাপনা ও সময়-শক্তি', '৩য় অধ্যায়: শিশুর বিকাশ ও বিশেষ চাহিদাসম্পন্ন শিশু', '৪র্থ অধ্যায়: বয়ঃসন্ধিকাল ও মানসিক স্বাস্থ্য'],
    '10': ['৫ম অধ্যায়: খাদ্যের উপাদান, পরিপাক ও পুষ্টিহীনতা', '৬ষ্ঠ অধ্যায়: খাদ্য সংরক্ষণ ও খাদ্য নিরাপত্তা', '৭ম অধ্যায়: পোশাকের নির্বাচন ও বস্ত্র বিজ্ঞান', '৮ম অধ্যায়: পারিবারিক সংকট ব্যবস্থাপনা']
  },

  physical_edu: {
    '6': ['১ম অধ্যায়: শরীরচর্চা ও সুস্থ জীবন', '২য় অধ্যায়: স্কাউটিং ও গার্ল গাইড', '৩য় অধ্যায়: স্বাস্থ্যবিজ্ঞান ও স্বাস্থ্যবিধি', '৪র্থ অধ্যায়: জীবনের জন্য খেলাধুলা (ফুটবল, অ্যাথলেটিক্স)'],
    '7': ['১ম অধ্যায়: শরীরচর্চা ও শারীরিক সক্ষমতা', '২য় অধ্যায়: স্বাস্থ্যবিধি ও রোগ প্রতিরোধ', '৩য় অধ্যায়: খেলাধুলায় নেতৃত্ব ও দলগত সহযোগিতা', '৪র্থ অধ্যায়: প্রাথমিক চিকিৎসা ও নিরাপত্তা'],
    '8': ['১ম অধ্যায়: শরীরচর্চা, যোগব্যায়াম ও বিশ্রাম', '২য় অধ্যায়: স্বাস্থ্যবিধি ও বয়ঃসন্ধিকালীন স্বাস্থ্য', '৩য় অধ্যায়: খেলাধুলার নিয়মাবলী ও কৌশল (ভলিবল, ক্রিকেট)', '৪র্থ অধ্যায়: ফার্স্ট এইড ও দুর্ঘটনা ব্যবস্থাপনা']
  },

  // --- বিজ্ঞান বিভাগ (Science Group) ---
  physics: {
    '9': [
      '১ম অধ্যায়: ভৌত রাশি ও পরিমাপ',
      '২য় অধ্যায়: গতি (রৈখিক গতি, বেগ ও ত্বরণ)',
      '৩য় অধ্যায়: বল (নিউটনের গতিসূত্র, ঘর্ষণ ও ভরবেগ)',
      '৪র্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি',
      '৫ম অধ্যায়: পদার্থের অবস্থা ও চাপ (প্যাসকেলের সূত্র ও আর্কিমিডিস)',
      '৬ষ্ঠ অধ্যায়: বস্তুর ওপর তাপের প্রভাব',
      '৭ম অধ্যায়: তরঙ্গ ও শব্দ'
    ],
    '10': [
      '১ম অধ্যায়: গতি, বল ও শক্তি পর্যালোচনা',
      '২য় অধ্যায়: আলোর প্রতিফলন (দর্পণ ও প্রতিবিম্ব)',
      '৩য় অধ্যায়: আলোর প্রতিসরণ (লেন্স ও প্রতিসরাঙ্ক)',
      '৪র্থ অধ্যায়: স্থির বিদ্যুৎ (কুলম্বের সূত্র ও তড়িৎ ক্ষেত্র)',
      '৫ম অধ্যায়: চল বিদ্যুৎ (ওহমের সূত্র, রোধ ও বর্তনী)',
      '৬ষ্ঠ অধ্যায়: বিদ্যুতের চৌম্বক ক্রিয়া ও মোটর-জেনারেটর',
      '৭ম অধ্যায়: আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স',
      '৮ম অধ্যায়: জীবন বাঁচাতে পদার্থবিজ্ঞান (এক্স-রে, ইসিজি, এমআরআই)'
    ]
  },

  chemistry: {
    '9': [
      '১ম অধ্যায়: রসায়নের ধারণা ও গবেষণার প্রক্রিয়া',
      '২য় অধ্যায়: পদার্থের অবস্থা ও কণার গতিতত্ত্ব',
      '৩য় অধ্যায়: পদার্থের গঠন (পরমাণুর মডেল ও ইলেকট্রন বিন্যাস)',
      '৪র্থ অধ্যায়: পর্যায় সারণি ও মৌলের পর্যায়বৃত্ত ধর্ম',
      '৫ম অধ্যায়: রাসায়নিক বন্ধন (আয়নিক ও সমযোজী বন্ধন)',
      '৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা'
    ],
    '10': [
      '১ম অধ্যায়: পর্যায় সারণি ও মোলের ধারণা পর্যালোচনা',
      '২য় অধ্যায়: রাসায়নিক বিক্রিয়া ও বিভিন্ন প্রকার বিক্রিয়া',
      '৩য় অধ্যায়: রসায়ন ও শক্তি (তড়িৎ রাসায়নিক কোষ ও ব্যাটারি)',
      '৪র্থ অধ্যায়: এসিড-ক্ষার সমতা ও pH মান',
      '৫ম অধ্যায়: খনিজ সম্পদ: ধাতু ও অধাতু নিষ্কাশন',
      '৬ষ্ঠ অধ্যায়: খনিজ সম্পদ: জীবাশ্ম ও হাইড্রোকার্বন',
      '৭ম অধ্যায়: আমাদের জীবনে রসায়ন (সাবান, ডিটারজেন্ট, ব্লিচিং পাউডার)'
    ]
  },

  biology: {
    '9': [
      '১ম অধ্যায়: জীবন পাঠ ও জীববিজ্ঞানের শাখাসমূহ',
      '২য় অধ্যায়: জীবকোষ ও টিস্যু (উদ্ভিদ ও প্রাণিটিস্যু)',
      '৩য় অধ্যায়: কোষ বিভাজন (মাইটোসিস ও মিয়োসিস)',
      '৪র্থ অধ্যায়: জীবনীশক্তি (সালোকসংশ্লেষণ ও শ্বসন)',
      '৫ম অধ্যায়: খাদ্য, পুষ্টি এবং পরিপাক',
      '৬ষ্ঠ অধ্যায়: জীবে পরিবহন (উদ্ভিদে পানি পরিবহন ও রক্ত সংবহন)'
    ],
    '10': [
      '১ম অধ্যায়: গ্যাসীয় বিনিময় (ফুসফুস ও শ্বাসক্রিয়া)',
      '২য় অধ্যায়: রেচন প্রক্রিয়া (বৃক্ক ও নেফ্রন)',
      '৩য় অধ্যায়: দৃঢ়তা প্রদান ও চলন (কঙ্কাল ও অস্থিসন্ধি)',
      '৪র্থ অধ্যায়: সমন্বয় ও হরমোন',
      '৫ম অধ্যায়: জীবের প্রজনন (পরাগায়ন ও প্রজননতন্ত্র)',
      '৬ষ্ঠ অধ্যায়: জীবের বংশগতি ও জৈব বিবর্তন (DNA, RNA ও মেন্ডেল সূত্র)',
      '৭ম অধ্যায়: জীবের পরিবেশ ও বাস্তুতন্ত্র',
      '৮ম অধ্যায়: জীবপ্রযুক্তি (টিস্যু কালচার ও জেনেটিক ইঞ্জিনিয়ারিং)'
    ]
  },

  higher_math: {
    '9': [
      '১ম অধ্যায়: সেট ও ফাংশন',
      '২য় অধ্যায়: বীজগাণিতিক রাশি ও আংশিক ভগ্নাংশ',
      '৩য় অধ্যায়: জ্যামিতি (অ্যাপোলোনিয়াসের উপপাদ্য)',
      '৪র্থ অধ্যায়: জ্যামিতিক অঙ্কন ও সম্পাদ্য',
      '৫ম অধ্যায়: দ্বিঘাত সমীকরণ',
      '৬ষ্ঠ অধ্যায়: অসমতা',
      '৭ম অধ্যায়: অসীম ধারা ও গুণোত্তর ধারা',
      '৮ম অধ্যায়: ত্রিকোণমিতি (রেডিয়ান পরিমাপ)'
    ],
    '10': [
      '১ম অধ্যায়: সূচকীয় ও লগারিদমীয় ফাংশন',
      '২য় অধ্যায়: দ্বিপদী বিস্তৃতি (প্যাসকেলের ত্রিভুজ)',
      '৩য় অধ্যায়: স্থানাঙ্ক জ্যামিতি (বিন্দু, সরলরেখা ও ক্ষেত্রফল)',
      '৪র্থ অধ্যায়: সমতলীয় ভেক্টর',
      '৫ম অধ্যায়: ঘন জ্যামিতি (প্রিজম, পিরামিড ও গোলক)',
      '৬ষ্ঠ অধ্যায়: সম্ভাবনা (Probability)'
    ]
  },

  // --- মানবিক বিভাগ (Humanities Group) ---
  history: {
    '9': [
      '১ম অধ্যায়: ইতিহাস পরিচিতি ও উপাদান',
      '২য় অধ্যায়: বিশ্বসভ্যতা (মিশর, সিন্ধু, গ্রিক ও রোমান সভ্যতা)',
      '৩য় অধ্যায়: প্রাচীন বাংলার জনপদ',
      '৪র্থ অধ্যায়: প্রাচীন বাংলার রাজনৈতিক ইতিহাস (মৌর্য ও গুপ্ত যুগ)',
      '৫ম অধ্যায়: প্রাচীন বাংলার সামাজিক, অর্থনৈতিক ও সাংস্কৃতিক ইতিহাস',
      '৬ষ্ঠ অধ্যায়: মধ্যযুগের বাংলা (সুলতানি আমল)'
    ],
    '10': [
      '১ম অধ্যায়: মধ্যযুগের বাংলা (মুঘল আমল ও বারো ভূঁইয়া)',
      '২য় অধ্যায়: বাংলায় ইউরোপীয়দের আগমন ও ব্রিটিশ শাসনের সূচনা',
      '৩য় অধ্যায়: ব্রিটিশ শাসনবিরোধী প্রতিরোধ আন্দোলন ও নবজাগরণ',
      '৪র্থ অধ্যায়: স্বাধিকার আন্দোলন ও ভাষা আন্দোলন',
      '৫ম অধ্যায়: ঊনসত্তরের গণঅভ্যুত্থান ও ১৯৭০-এর নির্বাচন',
      '৬ষ্ঠ অধ্যায়: ১৯৭১ এর মহান মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশের জন্ম'
    ]
  },

  geography: {
    '9': [
      '১ম অধ্যায়: ভূগোল ও পরিবেশ পরিচিতি',
      '২য় অধ্যায়: মহাবিশ্ব ও আমাদের পৃথিবী (অক্ষরেখা ও দ্রাঘিমারেখা)',
      '৩য় অধ্যায়: মানচিত্র পঠন ও এর ব্যবহার',
      '৪র্থ অধ্যায়: পৃথিবীর অভ্যন্তরীণ ও বাহ্যিক গঠন',
      '৫ম অধ্যায়: বায়ুমণ্ডল ও আবহাওয়া-জলবায়ু'
    ],
    '10': [
      '১ম অধ্যায়: বারিমণ্ডল (মহাসাগর ও জোয়ার-ভাটা)',
      '২য় অধ্যায়: জনসংখ্যা ও জনমিতিক কাঠামো',
      '৩য় অধ্যায়: মানব বসতি ও নগরায়ন',
      '৪র্থ অধ্যায়: সম্পদ ও অর্থনৈতিক কার্যাবলি',
      '৫ম অধ্যায়: বাংলাদেশের ভৌগোলিক বিবরণ ও নদ-নদী',
      '৬ষ্ঠ অধ্যায়: বাংলাদেশের প্রাকৃতিক দুর্যোগ ও দুর্যোগ ব্যবস্থাপনা'
    ]
  },

  civics: {
    '9': [
      '১ম অধ্যায়: পৌরনীতি ও নাগরিকতা',
      '২য় অধ্যায়: নাগরিক ও নাগরিকতা (অধিকার ও কর্তব্য)',
      '৩য় অধ্যায়: আইন, স্বাধীনতা ও সাম্য',
      '৪র্থ অধ্যায়: পরিবার ও রাষ্ট্র',
      '৫ম অধ্যায়: সংবিধান ও বাংলাদেশের সংবিধান'
    ],
    '10': [
      '১ম অধ্যায়: সরকার ও সরকারের অঙ্গসমূহ',
      '২য় অধ্যায়: রাজনৈতিক দল ও নির্বাচন ব্যবস্থা',
      '৩য় অধ্যায়: বাংলাদেশের স্থানীয় সরকার ও এর কার্যপ্রণালী',
      '৪র্থ অধ্যায়: নাগরিক সমস্যা ও আমাদের করণীয় (দুর্নীতি, নিরক্ষরতা)',
      '৫ম অধ্যায়: জাতীয় ঐক্য, স্বাধীনতা ও আন্তর্জাতিক সংস্থা'
    ]
  },

  economics: {
    '9': [
      '১ম অধ্যায়: অর্থনীতির মৌলিক ধারণা ও সমস্যা',
      '২য় অধ্যায়: অর্থনীতির গুরুত্বপূর্ণ ধারণাসমূহ (সম্পদ, দ্রব্য ও আয়)',
      '৩য় অধ্যায়: উপযোগ, চাহিদা, জোগান ও ভারসাম্য দাম',
      '৪র্থ অধ্যায়: উৎপাদন ও সংগঠন'
    ],
    '10': [
      '১ম অধ্যায়: বাজার ও বাজারের প্রকারভেদ',
      '২য় অধ্যায়: জাতীয় আয় ও এর পরিমাপ',
      '৩য় অধ্যায়: অর্থ ও ব্যাংক ব্যবস্থা (কেন্দ্রীয় ও বাণিজ্যিক ব্যাংক)',
      '৪র্থ অধ্যায়: সরকারি অর্থব্যবস্থা ও বাজেট',
      '৫ম অধ্যায়: বাংলাদেশের প্রধান প্রধান অর্থনৈতিক খাতসমূহ'
    ]
  },

  // --- ব্যবসায় শিক্ষা শাখা (Business Studies Group) ---
  accounting: {
    '9': [
      '১ম অধ্যায়: হিসাববিজ্ঞান পরিচিতি ও প্রয়োজনীয়তা',
      '২য় অধ্যায়: লেনদেন ও হিসাব সমীকরণ (A = L + E)',
      '৩য় অধ্যায়: দুতরফা দাখিলা পদ্ধতি ও ডেবিট-ক্রেডিট নির্ণয়',
      '৪র্থ অধ্যায়: মূলধন ও মুনাফাজাতীয় লেনদেন',
      '৫ম অধ্যায়: হিসাব ও হিসাবের শ্রেণিবিভাগ',
      '৬ষ্ঠ অধ্যায়: জাবেদা (সাধারণ ও বিশেষ জাবেদা)'
    ],
    '10': [
      '১ম অধ্যায়: খতিয়ান (T-ছক ও চলমান জের ছক)',
      '২য় অধ্যায়: নগদান বই (একঘরা, দুঘরা ও তিনঘরা নগদান বই)',
      '৩য় অধ্যায়: রেওয়ামিল ও অশুদ্ধি সংশোধন',
      '৪র্থ অধ্যায়: আর্থিক বিবরণী (বিশদ আয় বিবরণী ও আর্থিক অবস্থার বিবরণী)',
      '৫ম অধ্যায়: ব্যয় ও ব্যয়ের শ্রেণিবিভাগ',
      '৬ষ্ঠ অধ্যায়: পারিবারিক ও আত্মকর্মসংস্থানমূলক হিসাব'
    ]
  },

  business_ent: {
    '9': [
      '১ম অধ্যায়: ব্যবসায় পরিচিতি ও বৈশিষ্ট্য',
      '২য় অধ্যায়: ব্যবসায় উদ্যোগ ও উদ্যোক্তার গুণাবলি',
      '৩য় অধ্যায়: আত্মকর্মসংস্থান ও সরকারি-বেসরকারি সহায়তা',
      '৪র্থ অধ্যায়: মালিকানার ভিত্তিতে ব্যবসায় (একমালিকানা, অংশীদারি ও যৌথ মূলধনী)',
      '৫ম অধ্যায়: ব্যবসায়ের আইনগত দিক (ট্রেড লাইসেন্স, পেটেন্ট ও কপিরাইট)'
    ],
    '10': [
      '১ম অধ্যায়: ব্যবসায় পরিকল্পনা ও প্রকল্প তৈরি',
      '২য় অধ্যায়: বাংলাদেশের শিল্প বিকাশ ও ক্ষুদ্র কুটির শিল্প',
      '৩য় অধ্যায়: ব্যবসায় প্রতিষ্ঠানের ব্যবস্থাপনা ও নেতৃত্ব',
      '৪র্থ অধ্যায়: বিপণন ও বিক্রয় প্রসার',
      '৫ম অধ্যায়: ব্যবসায় নৈতিকতা ও সামাজিক দায়বদ্ধতা (CSR)'
    ]
  },

  finance: {
    '9': [
      '১ম অধ্যায়: অর্থায়ন ও ব্যবসায় অর্থায়ন',
      '২য় অধ্যায়: অর্থায়নের উৎস (স্বল্প, মধ্য ও দীর্ঘমেয়াদি)',
      '৩য় অধ্যায়: অর্থের সময়মূল্য (সরল ও চক্রবৃদ্ধি সুদ)',
      '৪র্থ অধ্যায়: ঝুঁকি ও অনিশ্চয়তা'
    ],
    '10': [
      '১ম অধ্যায়: মূলধনী আয়-ব্যয় প্রাক্কলন (পে-ব্যাক সময়)',
      '২য় অধ্যায়: মূলধন ব্যয় নির্ণয়',
      '৩য় অধ্যায়: শেয়ার, বন্ড ও ডিবেঞ্চার',
      '৪র্থ অধ্যায়: ব্যাংক পরিচিতি ও ব্যাংকের শ্রেণিবিভাগ',
      '৫ম অধ্যায়: বাণিজ্যিক ব্যাংক ও তার কার্যাবলি',
      '৬ষ্ঠ অধ্যায়: ব্যাংক হিসাব, চেক ও অনলাইন ব্যাংকিং'
    ]
  }
};

// =========================================================================
// 3. SEED QUESTIONS DATA (STANDARDIZED WITH AUTHENTIC NCTB CURRICULUM POOL)
// =========================================================================
export const SEED_QUESTIONS = [
  // Class 10 Physics
  {
    id: 'q-phy-10-01',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '২য় অধ্যায়: গতি',
    question_type: 'mcq',
    question_bn: 'স্থির অবস্থান থেকে সুষম ত্বরণে চলমান কোনো বস্তুর অতিক্রান্ত দূরত্ব (s) সময়ের (t) সাথে কীভাবে সম্পর্কিত?',
    options: ['s ∝ t', 's ∝ t²', 's ∝ √t', 's ∝ 1/t'],
    correct_answer: 's ∝ t²',
    correct_index: 1,
    explanation: 'স্থির অবস্থান থেকে যাত্রা শুরু করলে u = 0, সুতরাং s = 0 + ½at² বা s ∝ t² (যেহেতু ত্বরণ a ধ্রুবক)।',
    marks: 1
  },
  {
    id: 'q-phy-10-02',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '৩য় অধ্যায়: বল',
    question_type: 'mcq',
    question_bn: '১ নিউটন বল বলতে কী বোঝায়?',
    options: [
      '১ গ্রাম ভরের বস্তুতে ১ মি/সে² ত্বরণ সৃষ্টি',
      '১ কেজি ভরের বস্তুতে ১ মি/সে² ত্বরণ সৃষ্টি',
      '১ কেজি ভরের বস্তুতে ৯.৮ মি/সে² ত্বরণ সৃষ্টি',
      '১০ কেজি ভরের বস্তুতে ১ মি/সে² ত্বরণ সৃষ্টি'
    ],
    correct_answer: '১ কেজি ভরের বস্তুতে ১ মি/সে² ত্বরণ সৃষ্টি',
    correct_index: 1,
    explanation: 'F = ma সূত্রানুযায়ী, ১ কেজি ভরের ওপর যে বল প্রয়োগে ১ মি/সে² ত্বরণ সৃষ্টি হয়, তাকে ১ নিউটন (1 N) বলে।',
    marks: 1
  },
  {
    id: 'q-phy-10-03',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '৪র্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি',
    question_type: 'mcq',
    question_bn: 'কোনো স্প্রিংকে সংকুচিত করলে এতে কোন শক্তি জমা থাকে?',
    options: ['গতিশক্তি', 'বিভব শক্তি', 'তাপ শক্তি', 'চৌম্বক শক্তি'],
    correct_answer: 'বিভব শক্তি',
    correct_index: 1,
    explanation: 'স্প্রিং সংকোচন বা প্রসারণে স্থিতিস্থাপক বিভব শক্তি সঞ্চিত হয় (E = ½kx²)।',
    marks: 1
  },
  {
    id: 'q-phy-10-04',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '৫ম অধ্যায়: চল বিদ্যুৎ',
    question_type: 'mcq',
    question_bn: 'নির্দিষ্ট তাপমাত্রায় কোনো পরিবাহীর রোধ (R) তার প্রস্থচ্ছেদের ক্ষেত্রফলের (A) সাথে কীভাবে পরিবর্তিত হয়?',
    options: ['সমানুপাতিক', 'ব্যস্তানুপাতিক', 'বর্গানুপাতিক', 'অপরিবর্তিত থাকে'],
    correct_answer: 'ব্যস্তানুপাতিক',
    correct_index: 1,
    explanation: 'R = ρ(L/A) সূত্রানুযায়ী পরিবাহীর রোধ তার প্রস্থচ্ছেদের ক্ষেত্রফলের ব্যস্তানুপাতিক।',
    marks: 1
  },
  {
    id: 'q-phy-10-cq-01',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '২য় অধ্যায়: গতি',
    question_type: 'cq',
    stimulus: 'একটি ট্রাক স্থির অবস্থান থেকে 2 m/s² সুষম ত্বরণে সোজা রাস্তায় চলতে শুরু করল। একই সময়ে ট্রাকের 80 মিটার পেছন থেকে একটি প্রাইভেট কার 20 m/s সুষম বেগে ট্রাকের দিকে রওনা হলো।',
    sub_questions: [
      { label: 'ক', text: 'পর্যায়বৃত্ত গতি কাকে বলে?', marks: 1 },
      { label: 'খ', text: 'চলন্ত বাস থেকে হঠাৎ ব্রেক কষলে যাত্রীরা সামনের দিকে ঝুঁকে পড়ে কেন?', marks: 2 },
      { label: 'গ', text: 'যাত্রা শুরুর 10 সেকেন্ড পর ট্রাকটির বেগ এবং অতিক্রান্ত দূরত্ব নির্ণয় কর।', marks: 3 },
      { label: 'ঘ', text: 'গাণিতিক বিশ্লেষণের মাধ্যমে প্রমাণ কর প্রাইভেট কারটি চলার পথে ট্রাকটিকে অতিক্রম করতে পারবে কি না।', marks: 4 }
    ],
    explanation: 'ক) সংজ্ঞা নির্ভুল হতে হবে। খ) গতি জড়তার বৈজ্ঞানিক ব্যাখ্যা। গ) v=u+at এবং s=ut+½at² প্রয়োগ। ঘ) দ্বিঘাত সমীকরণ গঠন করে t-এর বাস্তব মান যাচাই।',
    marks: 10
  },

  // Class 10 Chemistry
  {
    id: 'q-chem-10-01',
    class_name: '10',
    subject_id: 'chemistry',
    subject_name: 'রসায়ন',
    chapter: '৪র্থ অধ্যায়: পর্যায় সারণি',
    question_type: 'mcq',
    question_bn: 'পর্যায় সারণির গ্রুপ-১৭ এর মৌলগুলোকে একত্রে কী বলা হয়?',
    options: ['ক্ষার ধাতু', 'মৃৎক্ষার ধাতু', 'হ্যালোজেন', 'নিষ্ক্রিয় গ্যাস'],
    correct_answer: 'হ্যালোজেন',
    correct_index: 2,
    explanation: 'গ্রুপ-১৭ এর মৌলসমূহ (F, Cl, Br, I, At) লবণ উৎপাদক বা হ্যালোজেন নামে পরিচিত।',
    marks: 1
  },
  {
    id: 'q-chem-10-cq-01',
    class_name: '10',
    subject_id: 'chemistry',
    subject_name: 'রসায়ন',
    chapter: '৪র্থ অধ্যায়: পর্যায় সারণি',
    question_type: 'cq',
    stimulus: 'মৌল X, Y এবং Z-এর পারমাণবিক সংখ্যা যথাক্রমে ১১, ১২ এবং ১৭। মৌল তিনটি পর্যায় সারণির ৩য় পর্যায়ের অন্তর্ভুক্ত।',
    sub_questions: [
      { label: 'ক', text: 'তড়িৎ ঋণাত্মকতা কাকে বলে?', marks: 1 },
      { label: 'খ', text: 'নোবেল গ্যাসসমূহ কেন রাসায়নিকভাবে নিষ্ক্রিয় ব্যাখ্যা কর।', marks: 2 },
      { label: 'গ', text: 'মৌল X ও Y এর মধ্যে কোনটির পারমাণবিক ব্যাসার্ধ বেশি এবং কেন চিত্রসহ ব্যাখ্যা কর।', marks: 3 },
      { label: 'ঘ', text: 'X এবং Z পরস্পর যুক্ত হয়ে গঠিত যৌগের জলীয় দ্রবণ বিদ্যুৎ পরিবহন করে কি না যুক্তিসহ মূল্যায়ন কর।', marks: 4 }
    ],
    explanation: 'ক) সঠিক সংজ্ঞা। খ) অষ্টক পূর্ণতার স্থিতিশীলতা। গ) একই পর্যায়ে বাম থেকে ডানে পারমাণবিক ব্যাসার্ধ হ্রাস। ঘ) NaCl একটি আয়নিক যৌগ বিধায় জলীয় দ্রবণে বিয়োজিত হয়ে বিদ্যুৎ পরিবহন করে।',
    marks: 10
  },

  // Class 10 Math
  {
    id: 'q-math-10-01',
    class_name: '10',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৩য় অধ্যায়: বীজগাণিতিক রাশি',
    question_type: 'mcq',
    question_bn: 'যদি x + 1/x = 3 হয়, তবে x² + 1/x² এর মান কত?',
    options: ['৭', '৯', '১১', '৬'],
    correct_answer: '৭',
    correct_index: 0,
    explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 3² - 2 = 9 - 2 = 7।',
    marks: 1
  },
  {
    id: 'q-math-10-cq-01',
    class_name: '10',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৩য় অধ্যায়: বীজগাণিতিক রাশি',
    question_type: 'cq',
    stimulus: 'উদ্দীপক: a² - 2√6a + 1 = 0 যেখানে a > 0।',
    sub_questions: [
      { label: 'ক', text: 'a + 1/a এর মান নির্ণয় কর।', marks: 2 },
      { label: 'খ', text: 'প্রমাণ কর যে, a³ - 1/a³ = 22√2।', marks: 4 },
      { label: 'গ', text: 'a⁵ + 1/a⁵ এর মান বের কর।', marks: 4 }
    ],
    explanation: 'ক) a + 1/a = 2√6। খ) a - 1/a = √[(a+1/a)² - 4] = √(24 - 4) = √20 = 2√5। অতঃপর a³ - 1/a³ সূত্র প্রয়োগ। গ) (a² + 1/a²)(a³ + 1/a³) - (a + 1/a) সূত্রে মান বসিয়ে নিখুঁত সমাধান।',
    marks: 10
  },

  // Class 10 Bangla 1
  {
    id: 'q-bangla-10-01',
    class_name: '10',
    subject_id: 'bangla1',
    subject_name: 'বাংলা ১ম পত্র',
    chapter: '১ম অধ্যায়: শুভা',
    question_type: 'mcq',
    question_bn: 'রবীন্দ্রনাথ ঠাকুরের ‘শুভা’ গল্পে শুভার অন্তরঙ্গ বন্ধু কারা ছিল?',
    options: ['গ্রামের শিশুরা', 'দুইটি গাভী (সর্বশী ও পাঙ্গুলি)', 'প্রতাপ', 'তার বড় বোনেরা'],
    correct_answer: 'দুইটি গাভী (সর্বশী ও পাঙ্গুলি)',
    correct_index: 1,
    explanation: 'বোবা শুভার সাথে মানুষের চেয়ে প্রকৃতির ও বোবা প্রাণীর ভাব ছিল গভীর, বিশেষ করে গোয়ালের দুই গাভী সর্বশী ও পাঙ্গুলির সাথে।',
    marks: 1
  },
  {
    id: 'q-bangla-10-cq-01',
    class_name: '10',
    subject_id: 'bangla1',
    subject_name: 'বাংলা ১ম পত্র',
    chapter: '১ম অধ্যায়: শুভা',
    question_type: 'cq',
    stimulus: 'দৃষ্টিপ্রতিবন্ধী নয়ন ছোটবেলা থেকেই গান ভালোবাসে। গ্রামের মানুষের উপহাস উপেক্ষা করে তার মা তাকে সুরের জগতে বড় করেছেন। আজ নয়ন একটি আন্তর্জাতিক সঙ্গীত প্রতিযোগিতায় দেশের মুখ উজ্জ্বল করেছে।',
    sub_questions: [
      { label: 'ক', text: 'শুভার বাবার নাম কী?', marks: 1 },
      { label: 'খ', text: '‘প্রকৃতি যেন তাহার ভাষার অভাব পূরণ করিয়া দেয়’—কথাটি দ্বারা কী বোঝানো হয়েছে?', marks: 2 },
      { label: 'গ', text: 'উদ্দীপকের নয়নের মায়ের দৃষ্টিভঙ্গি শুভার মায়ের মানসিকতার সাথে কীভাবে বৈসাদৃশ্যপূর্ণ ব্যাখ্যা কর।', marks: 3 },
      { label: 'ঘ', text: '‘নয়নের মতো শুভা যদি পারিবারিক সমমর্মিতা ও সুযোগ পেত তবে হয়তো তার পরিণতি বিষাদময় হতো না’—মূল্যায়ন কর।', marks: 4 }
    ],
    explanation: 'ক) শুভার বাবার নাম বাণীকণ্ঠ। খ) বাকপ্রতিবন্ধী শুভার নীরব ভাব প্রকাশের সঙ্গীনী ছিল নিস্তব্ধ প্রকৃতি। গ) শুভার মা তাকে গর্ভের কলঙ্ক মনে করতেন, বিপরীতে নয়নের মা তাকে পরম স্নেহে গড়ে তুলেছেন। ঘ) সহানুভূতি ও সামাজিক সমর্থনের তাৎপর্য মূল্যায়ন।',
    marks: 10
  },

  // Class 10 Accounting
  {
    id: 'q-acc-10-01',
    class_name: '10',
    subject_id: 'accounting',
    subject_name: 'হিসাববিজ্ঞান',
    chapter: '২য় অধ্যায়: লেনদেন',
    question_type: 'mcq',
    question_bn: 'মালিক কর্তৃক ব্যবসায়ে অতিরিক্ত মূলধন আনয়ন করলে হিসাব সমীকরণে কী প্রভাব পড়ে?',
    options: ['A বৃদ্ধি ও L বৃদ্ধি', 'A বৃদ্ধি ও E বৃদ্ধি', 'A হ্রাস ও E বৃদ্ধি', 'L বৃদ্ধি ও E হ্রাস'],
    correct_answer: 'A বৃদ্ধি ও E বৃদ্ধি',
    correct_index: 1,
    explanation: 'নগদ অর্থ (সম্পদ A) বাড়ে এবং মূলধন বাবদ মালিকানাস্বত্ব (E) বৃদ্ধি পায়।',
    marks: 1
  },

  // Class 10 History
  {
    id: 'q-hist-10-01',
    class_name: '10',
    subject_id: 'history',
    subject_name: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
    chapter: '২য় অধ্যায়: বিশ্বসভ্যতা',
    question_type: 'mcq',
    question_bn: 'নীলনদকে ‘মিশরের দান’ বলে অভিহিত করেছেন কোন ঐতিহাসিক?',
    options: ['হেরোডোটাস', 'থুসিডাইডিস', 'সক্রেটিস', 'প্লুটো'],
    correct_answer: 'হেরোডোটাস',
    correct_index: 0,
    explanation: 'ইতিহাসের জনক হেরোডোটাস মিশরকে ‘নীলনদের দান’ (Gift of the Nile) আখ্যা দেন।',
    marks: 1
  },

  // Class 8 Science
  {
    id: 'q-sci-8-01',
    class_name: '8',
    subject_id: 'general_science',
    subject_name: 'সাধারণ বিজ্ঞান',
    chapter: '১ম অধ্যায়: প্রাণিজগতের শ্রেণিবিন্যাস',
    question_type: 'mcq',
    question_bn: 'পৃথিবীর সবচেয়ে বড় পর্ব (Phylum) কোনটি?',
    options: ['মলাস্কা', 'অ্যানিলিডা', 'আর্থ্রোপোডা', 'কর্ডাটা'],
    correct_answer: 'আর্থ্রোপোডা',
    correct_index: 2,
    explanation: 'সন্ধিপদী প্রাণী বা আর্থ্রোপোডা (Arthropoda) প্রাণিজগতের বৃহত্তম পর্ব।',
    marks: 1
  },

  // Class 8 Math
  {
    id: 'q-math-8-01',
    class_name: '8',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '১ম অধ্যায়: প্যাটার্ন',
    question_type: 'mcq',
    question_bn: '৩, ৮, ১৩, ১৮, ২৩... প্যাটার্নটির পরবর্তী সংখ্যাটি কত?',
    options: ['২৭', '২৮', '২৯', '৩০'],
    correct_answer: '২৮',
    correct_index: 1,
    explanation: 'প্রতিবার পার্থক্য ৫ করে বৃদ্ধি পাচ্ছে; ২৩ + ৫ = ২৮।',
    marks: 1
  },

  // Class 8 Physical Education
  {
    id: 'q-pe-8-01',
    class_name: '8',
    subject_id: 'physical_edu',
    subject_name: 'শারীরিক শিক্ষা ও স্বাস্থ্য',
    chapter: '১ম অধ্যায়: শরীরচর্চা, যোগব্যায়াম ও বিশ্রাম',
    question_type: 'mcq',
    question_bn: 'শরীরচর্চার মূল উদ্দেশ্য কী?',
    options: ['শারীরিক সক্ষমতা বৃদ্ধি ও সুস্বাস্থ্য বজায় রাখা', 'শুধুমাত্র শক্তি অর্জন', 'মেধা যাচাই', 'মানসিক চাপ বৃদ্ধি'],
    correct_answer: 'শারীরিক সক্ষমতা বৃদ্ধি ও সুস্বাস্থ্য বজায় রাখা',
    correct_index: 0,
    explanation: 'নিয়মিত শরীরচর্চা ও যোগব্যায়াম শরীরের রক্ত সঞ্চালন বৃদ্ধি করে এবং শারীরিক ও মানসিক সুস্থতা নিশ্চিত করে।',
    marks: 1
  },
  {
    id: 'q-pe-8-02',
    class_name: '8',
    subject_id: 'physical_edu',
    subject_name: 'শারীরিক শিক্ষা ও স্বাস্থ্য',
    chapter: '৪র্থ অধ্যায়: ফার্স্ট এইড ও দুর্ঘটনা ব্যবস্থাপনা',
    question_type: 'mcq',
    question_bn: 'খেলাধুলায় মাংসপেশিতে হঠাৎ টান পড়লে প্রাথমিক চিকিৎসা হিসেবে কোনটি প্রযোজ্য?',
    options: ['বরফ বা ঠান্ডা সেক দেওয়া (RICE পদ্ধতি)', 'গরম তেল মালিশ', 'তীব্র ব্যায়াম করানো', 'ভারী কাজ করা'],
    correct_answer: 'বরফ বা ঠান্ডা সেক দেওয়া (RICE পদ্ধতি)',
    correct_index: 0,
    explanation: 'মাংসপেশিতে টান বা আঘাত লাগলে Rest, Ice, Compression, Elevation (RICE) পদ্ধতি অনুসরণ করতে হয়।',
    marks: 1
  },

  // Class 8 Agriculture
  {
    id: 'q-agri-8-01',
    class_name: '8',
    subject_id: 'agriculture',
    subject_name: 'কৃষি শিক্ষা',
    chapter: '২য় অধ্যায়: মাটির উর্বরতা ও সার ব্যবস্থাপনা',
    question_type: 'mcq',
    question_bn: 'ইউরিয়া সার থেকে উদ্ভিদ কোন অত্যাবশ্যকীয় পুষ্টি উপাদান গ্রহণ করে?',
    options: ['নাইট্রোজেন', 'ফসফরাস', 'পটাশিয়াম', 'ক্যালসিয়াম'],
    correct_answer: 'নাইট্রোজেন',
    correct_index: 0,
    explanation: 'ইউরিয়া সারে প্রায় ৪৬% নাইট্রোজেন থাকে যা উদ্ভিদের দৈহিক বৃদ্ধি ত্বরান্বিত করে।',
    marks: 1
  }
];

// Local Storage Keys
const QUESTIONS_KEY = 'magra_db_question_bank';
const SAVED_PAPERS_KEY = 'magra_db_saved_exam_papers';
const OMR_RESULTS_KEY = 'magra_db_omr_results';

export function getStoredQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return SEED_QUESTIONS;
  } catch (err) {
    return SEED_QUESTIONS;
  }
}

export function saveQuestionItem(item) {
  const list = getStoredQuestions();
  const newItem = {
    ...item,
    id: item.id || 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
    created_at: new Date().toISOString()
  };
  const updated = [newItem, ...list.filter(q => q.id !== newItem.id)];
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving question:', err);
  }
  return updated;
}

export function deleteQuestionItem(id) {
  const list = getStoredQuestions();
  const updated = list.filter(item => item.id !== id);
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed deleting question:', err);
  }
  return updated;
}

export function getSavedExamPapers() {
  try {
    const raw = localStorage.getItem(SAVED_PAPERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveExamPaperToArchive(paper) {
  const list = getSavedExamPapers();
  const newPaper = {
    ...paper,
    id: paper.id || 'paper-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
    saved_at: new Date().toISOString()
  };
  const updated = [newPaper, ...list.filter(p => p.id !== newPaper.id)];
  try {
    localStorage.setItem(SAVED_PAPERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving paper:', e);
  }
  return updated;
}

export function deleteExamPaper(id) {
  const list = getSavedExamPapers();
  const updated = list.filter(p => p.id !== id);
  try {
    localStorage.setItem(SAVED_PAPERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed deleting paper:', e);
  }
  return updated;
}

export function getOmrResults() {
  try {
    const raw = localStorage.getItem(OMR_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOmrEvaluation(record) {
  const list = getOmrResults();
  const newRec = {
    ...record,
    id: record.id || 'omr-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
    evaluated_at: new Date().toISOString()
  };
  const updated = [newRec, ...list.filter(r => r.id !== newRec.id)];
  try {
    localStorage.setItem(OMR_RESULTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving OMR result:', e);
  }
  return updated;
}

export function deleteOmrEvaluation(id) {
  const list = getOmrResults();
  const updated = list.filter(r => r.id !== id);
  try {
    localStorage.setItem(OMR_RESULTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed deleting OMR result:', e);
  }
  return updated;
}

// =========================================================================
// 4. INTELLIGENT 1-CLICK GENERATOR WITH PRECISE NCTB MARKS SPECIFICATIONS
// =========================================================================

// Subject-specific authentic Short-Answer Questions Pool (প্রতিটি প্রশ্নের মান ২)
export const SUBJECT_SHORT_QUESTIONS_POOL = {
  math: [
    'মূলদ সংখ্যা ও অমূলদ সংখ্যা কাকে বলে? উদাহরণ দাও।',
    'f(x) = x² - 4x + 3 হলে f(-1) এবং f(2) এর মান নির্ণয় কর।',
    '২৫ এর ৫ ভিত্তিক লগারিদম (log₅ 25) এর মান নির্ণয় কর।',
    'একটি সমবাহু ত্রিভুজের বাহুর দৈর্ঘ্য ৪ সেমি হলে এর ক্ষেত্রফল কত?',
    'বৃত্তের পরিধি ও ব্যাসের অনুপাতকে কী বলে? এর আদর্শ মান কত?',
    '2x + 3y = 12 সমীকরণে x = 3 হলে y এর মান কত হবে?',
    'পরিসংখ্যানের মধ্যক নির্ণয়ের সূত্রটি লিখে প্রতিটি প্রতীকের পরিচয় দাও।',
    'প্রমাণ কর যে, sin² 45° + cos² 45° = 1।',
    '৪, ৭, ১০, ১৩... সমান্তর ধারাটির দশম (১০ম) পদ কত?',
    'একটি রম্বসের দুটি কর্ণের দৈর্ঘ্য ৮ সেমি ও ৬ সেমি হলে এর ক্ষেত্রফল কত?',
    'প্রচুরক নির্ণয়ের সূত্রটি লিখে প্রতিটি চলকের ব্যাখ্যা দাও।',
    'সার্বিক সেট U = {1, 2, 3, 4, 5} এবং A = {2, 4} হলে A-এর পূরক সেট A\' নির্ণয় কর।',
    '4^(x+1) = 32 হলে সূচকের নিয়ম প্রয়োগ করে x এর মান বের কর।',
    'একটি ঘনকের এক ধারের দৈর্ঘ্য ৫ সেমি হলে এর সমগ্র তলের ক্ষেত্রফল কত?',
    'বৃত্তের স্পর্শক ও স্পর্শবিন্দুগামী ব্যাসার্ধের মধ্যবর্তী কোণ কত ডিগ্রি? চিত্রসহ লিখ।'
  ],
  physics: [
    'মাত্রা সমীকরণ কাকে বলে? বলের মাত্রা সমীকরণটি লিখ।',
    'অভিকর্ষজ ত্বরণ \'g\' এর মান পৃথিবীর বিভিন্ন স্থানে বিভিন্ন হয় কেন?',
    'ঘর্ষণ বল কমানোর দুটি বাস্তবসম্মত উপায় উল্লেখ কর।',
    'কাজের একক জুল (Joule) বলতে কী বোঝায়?',
    'বায়ুর সাপেক্ষে পানির প্রতিসরাঙ্ক ৪/৩ বলতে কী বোঝায়?',
    'ওহমের সূত্রটি বিবৃত কর এবং এর গাণিতিক রূপ লিখ।',
    'নিউক্লিয়ার ফিশন ও নিউক্লিয়ার ফিউশন বিক্রিয়ার মধ্যে দুটি মৌলিক পার্থক্য লিখ।'
  ],
  chemistry: [
    'আইসোটোপ কাকে বলে? হাইড্রোজেনের তিনটি আইসোটোপের নাম লিখ।',
    'পর্যায় সারণির ১৮ নম্বর গ্রুপের গ্যাসসমূহ রাসায়নিকভাবে কেন নিষ্ক্রিয়?',
    'জারণ সংখ্যা ও যোজনীর মধ্যে দুটি প্রধান পার্থক্য লিখ।',
    'পানিতে কেন পোলার সমযোজী যৌগ দ্রবীভূত হয়? সংক্ষেপে ব্যাখ্যা কর।',
    'মোলারিটি বলতে কী বোঝায়? ১ মোলার দ্রবণ কাকে বলে?',
    'ব্রনস্টেড-লাউরি মতবাদ অনুযায়ী অ্যাসিড ও ক্ষারকের সংজ্ঞা দাও।',
    'লোহায় মরিচা পড়ার প্রধান শর্ত দুটি কী কী এবং মরিচার রাসায়নিক সংকেত লিখ।'
  ],
  biology: [
    'মাইটোকন্ড্রিয়াকে কেন কোষের পাওয়ার হাউস (Power House) বলা হয়?',
    'ব্যাপন ও অভিস্রবণের মধ্যে দুটি সুস্পষ্ট পার্থক্য উল্লেখ কর।',
    'মানবদেহে রক্তের দুটি প্রধান কাজ লিখ।',
    'সালোকসংশ্লেষণ প্রক্রিয়ায় উৎপন্ন উপজাত অক্সিজেনের উৎস কী?',
    'নেফ্রনের প্রধান প্রধান অংশগুলোর নাম লিখ।',
    'ডিএনএ (DNA) ও আরএনএ (RNA) এর মধ্যে দুটি পার্থক্য লিখ।',
    'বাস্তুতন্ত্রে খাদ্যশৃঙ্খল ও খাদ্যজালের সম্পর্ক ব্যাখ্যা কর।'
  ],
  higher_math: [
    'অন্বয় ও ফাংশনের মধ্যে মূল পার্থক্য কী? উদাহরণসহ লিখ।',
    '(1 + 2x)⁵ এর দ্বিপদী বিস্তৃতির মধ্যপদটি নির্ণয় কর।',
    'ভেক্টর যোগের সামান্তরিক সূত্রটি বিবৃত কর।',
    'tan(150°) এবং cos(-300°) এর মান নির্ণয় কর।',
    'একটি ছক্কা একবার নিক্ষেপ করলে জোড় সংখ্যা অথবা মৌলিক সংখ্যা আসার সম্ভাবনা কত?',
    'রেডিয়ান কোণ কাকে বলে? এটি কেন একটি ধ্রুব কোণ?',
    'লগারিদমের ভিত্তি পরিবর্তন সূত্রটি বিবৃত ও প্রমাণ কর।'
  ],
  general_science: [
    'সুষম খাদ্য কাকে বলে? সুষম খাদ্যের প্রধান উপাদানগুলো কী কী?',
    'পানিকে কেন সর্বজনীন দ্রাবক বলা হয়?',
    'মানবদেহে রক্তচাপ স্বাভাবিকের চেয়ে বেশি হলে কী ধরনের শারীরিক সমস্যা হতে পারে?',
    'পলিমার কাকে বলে? প্রাকৃতিক ও কৃত্রিম পলিমারের একটি করে উদাহরণ দাও।',
    'অম্ল বৃষ্টি (Acid Rain) সৃষ্টির দুটি প্রধান কারণ লিখ।',
    'বায়ুমণ্ডলের ওজোন স্তর ক্ষয়ের কারণ ও প্রতিকার লিখ।',
    'জীবাশ্ম জ্বালানি ব্যবহারের দুটি ক্ষতিকর প্রভাব সংক্ষেপে লিখ।',
    'সৌরশক্তিকে কেন পরিবেশবান্ধব নবায়নযোগ্য শক্তি বলা হয়?',
    'অ্যান্টিবায়োটিক কী এবং এর অপব্যবহারের ক্ষতিকর দিক কী?',
    'ডায়াবেটিস রোগের প্রধান দুটি লক্ষণ উল্লেখ কর।',
    'শব্দ দূষণের ক্ষতিকর প্রভাব এবং তা প্রতিরোধের দুটি উপায় লিখ।',
    'কাচের প্রতিসরণাঙ্ক বেশি হলে আলোর গতির ওপর এর প্রভাব কী?',
    'হৃদপিণ্ডের করোনারি ধমনি ব্লকেজ হওয়ার কারণ কী?',
    'প্লাস্টিক বর্জ্যের অপচনশীল বৈশিষ্ট্য পরিবেশের জন্য কেন হুমকি?',
    'সংক্রামক রোগ প্রতিরোধে ব্যক্তিগত স্বাস্থ্যবিধির ভূমিকা লিখ।'
  ],
  bgs: [
    'ঐতিহাসিক ৬ দফা দাবিকে কেন বাঙালির বাঁচার দাবি বা ম্যাগনাকার্টা বলা হয়?',
    '১৯৭১ সালের ৭ই মার্চের ভাষণের দুটি ঐতিহাসিক গুরুত্ব লিখ।',
    'বাংলাদেশ সংবিধানের মূল চারটি রাষ্ট্রনীতি কী কী?',
    'জলবায়ু পরিবর্তনজনিত দুর্যোগ মোকাবেলায় বাংলাদেশের দুটি করণীয় উল্লেখ কর।',
    'গণতান্ত্রিক রাষ্ট্রব্যবস্থায় নিরপেক্ষ নির্বাচন কমিশনের প্রয়োজনীয়তা কী?',
    'মোট দেশজ উৎপাদন (GDP) ও মোট জাতীয় উৎপাদন (GNP) এর মধ্যে পার্থক্য কী?',
    'টেকসই উন্নয়ন অভীষ্ট (SDG) অর্জনে শিক্ষার গুরুত্ব ব্যাখ্যা কর।',
    'আইনের শাসনের মূল দুটি অর্থ বা তাৎপর্য কী?',
    'বাংলাদেশের নদ-নদীর নাব্যতা হ্রাসের দুটি প্রধান কারণ উল্লেখ কর।',
    'শিশু অধিকার সুরক্ষায় জাতিসংঘ সনদের দুটি ধারা উল্লেখ কর।',
    'সামাজিক মূল্যবোধের অবক্ষয় রোধে পরিবারের ভূমিকা কী?',
    'কিশোর অপরাধ বৃদ্ধির দুটি সামাজিক কারণ চিহ্নিত কর।',
    'বাংলাদেশের অর্থনীতিতে বৈদেশিক রেমিট্যান্সের অবদান কী?',
    'সৌরজগতের গ্রহগুলোর মধ্যে পৃথিবীতেই কেন প্রাণের বিকাশ ঘটেছে?',
    'রাষ্ট্র গঠনের চারটি মৌলিক উপাদানের নাম লিখ।'
  ],
  accounting: [
    'দু’তরফা দাখিলা পদ্ধতির মূলনীতি বা বৈশিষ্ট্য কী?',
    'রেওয়ামিলে অন্তর্ভুক্ত হয় না এমন দুটি ভুলের নাম লিখ।',
    'ডেবিট নোট ও ক্রেডিট নোটের মধ্যে দুটি প্রধান পার্থক্য লিখ।',
    'স্থায়ী সম্পদে অবচয় ধার্যের দুটি প্রধান উদ্দেশ্য লিখ।',
    'মালিকানাস্বত্ব পরিবর্তনের প্রধান কারণগুলো কী কী?',
    'অনুপার্জিত আয় এবং বকেয়া খরচের মধ্যে হিসাববিজ্ঞানগত পার্থক্য কী?',
    'নগদ প্রবাহ বিবরণীর দুটি প্রধান উপযোগিতা উল্লেখ কর।'
  ],
  finance: [
    'অর্থের সময়মূল্য বলতে কী বোঝায়? এর গুরুত্ব কী?',
    'চক্রবৃদ্ধি সুদ ও সরল সুদের মধ্যে মূল পার্থক্য কী?',
    'পে-ব্যাক সময় (Payback Period) পদ্ধতির একটি সুবিধা ও একটি অসুবিধা লিখ।',
    'বাণিজ্যিক ব্যাংককে কেন ‘ঋণের সওদাগর’ বলা হয়?',
    'চলতি হিসাব ও সঞ্চয়ী হিসাবের মধ্যে দুটি পার্থক্য উল্লেখ কর।',
    'ব্যবসায় প্রতিষ্ঠানের আর্থিক ঝুঁকি ও পরিচালনা ঝুঁকির পার্থক্য কী?',
    'মূলধন বাজেটিং বলতে কী বোঝায়? এর একটি পদ্ধতির নাম লিখ।'
  ]
};

// সহপাঠ উপন্যাস ও নাটক বর্ণনামূলক প্রশ্ন (বাংলা ১ম পত্র - SSC ৯ম ও ১০ম শ্রেণি)
export const BANGLA1_DESCRIPTIVE_POOL = [
  {
    type: 'উপন্যাস',
    book_type: 'novel',
    title: 'উপন্যাস: কাকতাড়ুয়া (সেলিনা হোসেন)',
    context: 'উদ্দীপক: পাকিস্তানি হানাদার বাহিনীর নির্বিচার নির্যাতন ও গ্রাম পোড়ানোর বিভীষিকার মধ্যে অনাথ কিশোর বুধা তার সাহস ও বুদ্ধিমত্তা দিয়ে প্রতিরোধ গড়ে তোলে।',
    sub_questions: [
      { label: 'ক', text: 'বুধা কেন পাকিস্তানি বাহিনীর বাংকারে কেরোসিন ঢেলে আগুন ধরিয়ে দিয়েছিল? ব্যাখ্যা কর।', marks: 3 },
      { label: 'খ', text: '“মুক্তিযুদ্ধ কেবল সম্মুখ সমরের নয়, দেশপ্রেম ও আত্মত্যাগেরও”—উপন্যাসটির আলোকে বুধার চরিত্র বিশ্লেষণ কর।', marks: 7 }
    ]
  },
  {
    type: 'উপন্যাস',
    book_type: 'novel',
    title: 'উপন্যাস: লালসালু (সৈয়দ ওয়ালীউল্লাহ্)',
    context: 'উদ্দীপক: গ্রামবাসীর সরল বিশ্বাস ও ধর্মীয় অনুভূতিকে পুঁজি করে অস্তিত্বহীন মাজারের ভিত্তি গড়ে তোলে ধূর্ত মজিদ।',
    sub_questions: [
      { label: 'ক', text: 'মজিদ কীভাবে মহব্বতনগর গ্রামে নিজের কর্তৃত্ব প্রতিষ্ঠা করেছিল? সংক্ষেপে লিখ।', marks: 3 },
      { label: 'খ', text: 'ধর্মের অপব্যবহার ও কুসংস্কারের বিরুদ্ধে জমিলা চরিত্রের নীরব বিদ্রোহ মূল্যায়ন কর।', marks: 7 }
    ]
  },
  {
    type: 'নাটক',
    book_type: 'drama',
    title: 'নাটক: বহিপীর (সৈয়দ ওয়ালীউল্লাহ্)',
    context: 'উদ্দীপক: জমিদার হাতেম আলী নিজের জমিদারি বাঁচাতে বহিপীরের অনুদানের দ্বারস্থ হন, যেখানে তাহেরা নামের এক অসহায় মেয়ে প্রতিবাদের প্রতীক হয়ে দাঁড়ায়।',
    sub_questions: [
      { label: 'ক', text: 'হাতেম আলী জমিদারি রক্ষায় বহিপীরের শরণাপন্ন হয়েছিলেন কেন?', marks: 3 },
      { label: 'খ', text: 'তাহেরা চরিত্রের প্রতিবাদের স্বরূপ ও আত্মমর্যাদাবোধ নাটকের আলোকে বিচার কর।', marks: 7 }
    ]
  },
  {
    type: 'নাটক',
    book_type: 'drama',
    title: 'নাটক: সিরাজউদ্দৌলা (সিকান্দার আবু জাফর)',
    context: 'উদ্দীপক: পলাশীর আম্রকাননে বিশ্বাসঘাতক সেনাপতিদের চক্রান্তে বাংলার স্বাধীনতা অস্তমিত হয়, কিন্তু নবাব শেষ মুহূর্ত পর্যন্ত দেশপ্রেমে অবিচল ছিলেন।',
    sub_questions: [
      { label: 'ক', text: 'পলাশীর যুদ্ধে নবাবের সেনাপতি মীর জাফরের দ্বিচারিতা তুলে ধর।', marks: 3 },
      { label: 'খ', text: 'নবাব সিরাজউদ্দৌলার স্বদেশপ্রেম ও ট্র্যাজিক পরিণতির ঐতিহাসিক কারণ নাটকের আলোকে মূল্যায়ন কর।', marks: 7 }
    ]
  }
];

// আনন্দ পাঠ বর্ণনামূলক প্রশ্ন (বাংলা ১ম পত্র - ৬ষ্ঠ, ৭ম ও ৮ম শ্রেণি: ৪টি থেকে ২টি, ক-৩ ও খ-৭ = ২০ নম্বর)
export const BANGLA1_JUNIOR_ANANDA_PATH_POOL = [
  {
    id: 'ap-1',
    book_type: 'ananda_path',
    title: 'আনন্দ পাঠ: সাত ভাই চম্পা',
    context: 'উদ্দীপক: বড় রানীদের ঈর্ষা ও চক্রান্তে ছোট রানীর সাতটি ফুটফুটে রাজপুত্র ও একটি কন্যা সন্তানকে মাটির নিচে ফেলে দেওয়া হয়। পরবর্তীতে পারুল বন ও চম্পা ফুলের গাছে রূপ নিয়ে তারা সত্য প্রকাশ করে।',
    sub_questions: [
      { label: 'ক', text: 'বড় রানীদের হিংসুটে মনোভাব ও চক্রান্তের স্বরূপ সংক্ষেপে তুলে ধর।', marks: 3 },
      { label: 'খ', text: '“সত্য ও স্নেহের জয় চিরন্তন, অসত্যের পরাজয় অনিবার্য”—গল্পটির মূল সুরের আলোকে ব্যাখ্যা কর।', marks: 7 }
    ]
  },
  {
    id: 'ap-2',
    book_type: 'ananda_path',
    title: 'আনন্দ পাঠ: রবিনসন ক্রুসো (ড্যানিয়েল ডিফো)',
    context: 'উদ্দীপক: জাহাজডুবির পর জনমানবহীন নির্জন দ্বীপে আটকা পড়ে রবিনসন ক্রুসো। হতাশ না হয়ে সে নিজের বুদ্ধি, ধৈর্য ও শ্রম দিয়ে দ্বীপে নতুন করে বেঁচে থাকার পরিবেশ গড়ে তোলে।',
    sub_questions: [
      { label: 'ক', text: 'জনমানবহীন দ্বীপে ক্রুসোর প্রাথমিক সংকট ও টিকে থাকার উপায় কী ছিল?', marks: 3 },
      { label: 'খ', text: 'প্রতিকূল পরিবেশকে জয় করে মানুষের টিকে থাকার যে অদম্য স্পৃহা গল্পটিতে প্রতিফলিত হয়েছে তা বিশ্লেষণ কর।', marks: 7 }
    ]
  },
  {
    id: 'ap-3',
    book_type: 'ananda_path',
    title: 'আনন্দ পাঠ: সিন্ধবাদের জলযাত্রা',
    context: 'উদ্দীপক: বাণিজ্যের উদ্দেশ্যে বারবার উত্তাল সমুদ্রে দুঃসাহসিক অভিযানে বের হন নাবিক সিন্ধবাদ। একের পর এক বিপদ, তিমি মাছের দ্বীপ ও দানব পাখির আক্রমণ সত্ত্বেও তিনি সাহস হারাননি।',
    sub_questions: [
      { label: 'ক', text: 'সিন্ধবাদের প্রথম সমুদ্রযাত্রায় তিমি মাছের দ্বীপের ঘটনাটি সংক্ষেপে বর্ণনা কর।', marks: 3 },
      { label: 'খ', text: 'সিন্ধবাদের চরিত্রটিতে সাহস, উপস্থিত বুদ্ধি ও অনুসন্ধানমূলক মনোভাব কীভাবে প্রকাশিত হয়েছে তা আলোচনা কর।', marks: 7 }
    ]
  },
  {
    id: 'ap-4',
    book_type: 'ananda_path',
    title: 'আনন্দ পাঠ: তোতা কাহিনী (রবীন্দ্রনাথ ঠাকুর)',
    context: 'উদ্দীপক: খাঁচার পাখিকে পণ্ডিতরা পুঁথির পাতার পর পাতা গিলিয়ে শিক্ষিত করতে চাইলেন। বাহ্যিক আড়ম্বর ও শিক্ষার মোড়কে পাখির আসল জীবন ও স্বাধীনতা স্তব্ধ হয়ে গেল।',
    sub_questions: [
      { label: 'ক', text: 'তোতা পাখিকে শিক্ষিত করার জন্য রাজার পণ্ডিত ও পারিষদবর্গ কী কী ব্যবস্থা গ্রহণ করেছিল?', marks: 3 },
      { label: 'খ', text: '“পুঁথিগত অন্ধ শিক্ষাব্যবস্থা কীভাবে স্বাভাবিক সৃজনশীলতা ও জীবনবোধকে ধ্বংস করে”—গল্পের আলোকে মূল্যায়ন কর।', marks: 7 }
    ]
  }
];

// আর্থিক বিবরণী প্রস্তুতকরণ (হিসাববিজ্ঞান - বাধ্যতামূলক প্রশ্ন)
export const ACCOUNTING_FINANCIAL_STIMULUS = {
  title: 'আর্থিক বিবরণী প্রস্তুতকরণ (বাধ্যতামূলক প্রশ্ন)',
  stimulus: 'মেসার্স চৌধুরী ব্রাদার্সের ২০২৫ সালের ৩১ ডিসেম্বর তারিখের রেওয়ামিল ও অন্যান্য তথ্যাবলি নিম্নরূপ:',
  trial_balance: [
    { account: 'প্রারম্ভিক মজুদ পণ্য (০১-০১-২০২৫)', debit: 50000, credit: null },
    { account: 'ক্রয় ও বিক্রয়', debit: 350000, credit: 520000 },
    { account: 'বেতন ও ভাড়া খরচ', debit: 30000, credit: null },
    { account: 'দেনাদার ও পাওনাদার', debit: 80000, credit: 50000 },
    { account: 'যন্ত্রপাতি', debit: 100000, credit: null },
    { account: 'মূলধন হিসাব', debit: null, credit: 140000 },
    { account: 'হাতে নগদ ও ব্যাংক জমা', debit: 150000, credit: null }
  ],
  adjustments: [
    'সমাপনী মজুদ পণ্য ৬০,০০০ টাকায় মূল্যায়ন করা হয়েছে।',
    'দেনাদারের ওপর ৫% হারে অনাদায়ি পাওনা সঞ্চিতি ধার্য করতে হবে।',
    'যন্ত্রপাতির ওপর ১০% অবচয় ধার্য কর।'
  ],
  sub_questions: [
    { label: 'ক', text: 'বিক্রিত পণ্যের ব্যয় ও মোট মুনাফা নির্ণয় কর।', marks: 8 },
    { label: 'খ', text: 'উক্ত তারিখে সমাপ্ত বছরের জন্য বিশদ আয় বিবরণী প্রস্তুত কর।', marks: 6 },
    { label: 'গ', text: 'উক্ত তারিখে প্রতিষ্ঠানের আর্থিক অবস্থার বিবরণী প্রস্তুত কর।', marks: 6 }
  ],
  totalMarks: 20
};

// বাংলা ২য় পত্র নির্মিতি অংশ (SSC ৯ম ও ১০ম শ্রেণি - পূর্ণমান: ৭০)
export const BANGLA2_SSC_COMPOSITION = {
  paragraph: [
    'ডিজিটাল বাংলাদেশ ও স্মার্ট সিটিজেন',
    'জাতীয় জীবনে বই পড়ার গুরুত্ব'
  ],
  letter: [
    'বৃক্ষরোপণের প্রয়োজনীয়তা উল্লেখ করে তোমার ছোট ভাইকে একটি উপদেশমূলক পত্র লেখ।',
    'তোমার এলাকায় ডেঙ্গু রোগের প্রাদুর্ভাব রোধে সংশ্লিষ্ট কর্তৃপক্ষের দৃষ্টি আকর্ষণ করে সংবাদপত্রে প্রকাশের জন্য একটি প্রতিবেদন তৈরি কর।'
  ],
  summary: [
    'মানুষের মূল্য কোথায়? চরিত্র, মনুষ্যত্ব, জ্ঞান ও কর্মে। কেবল সম্পদে মানুষ বড় হয় না, নৈতিক গুণাবলি ও আত্মত্যাগের মহিমায় একজন মানুষ সত্যিকারের মানুষ হয়ে ওঠে...',
    'দৈন্য যদি আসে আসুক, লজ্জা কিবা তাহে? / দুই হাত বাড়ায়ে দাও বুক ফুলিয়ে চাহে / ক্ষুদ্র ক্ষুদ্র সুখ যত যাক ভেসে যাক দূরে / অনন্ত মহত্ত্ব জাগুক অন্তরের অন্তঃপুরে...'
  ],
  amplification: [
    'দুর্জন বিদ্বান হইলেও পরিত্যাজ্য।',
    'অন্যায় যে করে আর অন্যায় যে সহে / তব ঘৃণা তারে যেন তৃণসম দহে।'
  ],
  translation: [
    'Books are the greatest treasure of human civilization. They preserve the knowledge, culture, and wisdom of past generations. A person who reads regularly never feels lonely because good books are ever-faithful friends.',
    'Time is precious and waits for no one. A lost moment is lost forever. Success in life depends on the proper division and disciplined utilization of time.'
  ],
  essay: [
    'অধ্যবসায় ও মানবকল্যাণ',
    'কৃষিকাজে আধুনিক বিজ্ঞান ও প্রযুক্তি',
    'বাংলাদেশের স্বাধীনতা সংগ্রাম ও মুক্তিযুদ্ধ'
  ]
};

// বাংলা ২য় পত্র নির্মিতি অংশ (৬ষ্ঠ, ৭ম ও ৮ম শ্রেণি - পূর্ণমান: ৩৫)
// সার্কুলার অনুযায়ী: অনুধাবন/অনুচ্ছেদ ৫, পত্র/দরখাস্ত ৫, সারাংশ/সারমর্ম ৫, ভাবসম্প্রসারণ ৫, প্রবন্ধ সংকেতসহ ১৫
export const BANGLA2_JUNIOR_COMPOSITION = {
  paragraph: [
    'অধ্যবসায় ও সময়নিষ্ঠা',
    'বৃক্ষরোপণ ও আমাদের পরিবেশ'
  ],
  letter: [
    'বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা দেখার আমন্ত্রণ জানিয়ে বন্ধুর কাছে একটি পত্র লেখ।',
    'অসুস্থতার কারণে ছুটির জন্য প্রধান শিক্ষকের নিকট একটি দরখাস্ত লেখ।'
  ],
  summary: [
    'সারাংশ: মানুষের মূল্য কোথায়? চরিত্র, মনুষ্যত্ব, জ্ঞান ও কর্মে। বস্তুত চরিত্র বলেই মানুষের জীবনের শ্রেষ্ঠ সম্পদ। চরিত্রহীন ব্যক্তির কোনো সম্মান নেই...',
    'সারমর্ম: শৈবাল দীঘিরে বলে উচ্চ করি শির, / লিখে রেখো একবিন্দু দিলেম শিশির...'
  ],
  amplification: [
    'পরিশ্রম সৌভাগ্যের প্রসূতি।',
    'কীর্তিমানের মৃত্যু নেই।'
  ],
  essay: [
    'কম্পিউটার ও আধুনিক জীবন (সংকেত: ভূমিকা, আবিষ্কার ও ক্রমবিকাশ, প্রয়োজনীয়তা, অপব্যবহার ও উপসংহার)',
    'আমাদের প্রিয় মাতৃভূমি বাংলাদেশ (সংকেত: ভূমিকা, প্রাকৃতিক সৌন্দর্য, জাতীয় ঐতিহ্য, অর্থনৈতিক সম্ভাবনা ও উপসংহার)',
    'ছাত্রজীবনের দায়িত্ব ও কর্তব্য (সংকেত: ভূমিকা, প্রধান কাজ, চরিত্র গঠন, সমাজসেবা ও উপসংহার)'
  ]
};

export const BANGLA2_COMPOSITION_ITEMS = [
  { item: '১. অনুচ্ছেদ রচনা', prompt: 'যেকোনো একটি বিষয়ে অনুচ্ছেদ লিখ: (ক) জাতীয় পতাকা অথবা (খ) ডিজিটাল বাংলাদেশ ও স্মার্ট সিটিজেন।', marks: 10 },
  { item: '২. চিঠিপত্র / সংবাদ প্রতিবেদন', prompt: 'যেকোনো একটির উত্তর দাও: (ক) বৃক্ষরোপণের প্রয়োজনীয়তা উল্লেখ করে বন্ধুকে একটি পত্র লিখ, অথবা (খ) এলাকায় ডেঙ্গু প্রতিরোধে সচেতনতা বৃদ্ধির লক্ষ্যে সংবাদপত্রে প্রকাশের জন্য একটি প্রতিবেদন তৈরি কর।', marks: 10 },
  { item: '৩. সারাংশ / সারমর্ম', prompt: 'যেকোনো একটির ভাব সংক্ষেপ কর: (ক) মানুষের মূল্য কোথায়? চরিত্র, মনুষ্যত্ব, জ্ঞান ও কর্মে... (সারাংশ) অথবা (খ) দৈন্য যদি আসে আসুক, লজ্জা কিবা তাহে... (সারমর্ম)।', marks: 10 },
  { item: '৪. ভাব-সম্প্রসারণ', prompt: 'যেকোনো একটির ভাব-সম্প্রসারণ কর: (ক) দুর্জন বিদ্বান হইলেও পরিত্যাজ্য, অথবা (খ) অন্যায় যে করে আর অন্যায় যে সহে, তব ঘৃণা তারে যেন তৃণসম দহে।', marks: 10 },
  { item: '৫. বাংলায় অনুবাদ', prompt: 'যেকোনো একটি ইংরেজি অনুচ্ছেদের বঙ্গানুবাদ কর: "Books are our best friends. They give us knowledge, pleasure, and inspiration in life..."', marks: 10 },
  { item: '৬. প্রবন্ধ রচনা', prompt: 'যেকোনো একটি বিষয়ে প্রবন্ধ রচনা কর: (ক) অধ্যবসায়, (খ) কৃষিকাজে বিজ্ঞান ও প্রযুক্তি, অথবা (গ) বাংলাদেশের মুক্তিযুদ্ধ ও স্বাধীনতা।', marks: 20 }
];

// ENGLISH 1ST PAPER COMPLETE SPEC & CONTENT (Classes 6-8: 100 Marks)
export const ENGLISH1_JUNIOR_SAMPLE_PAPER = {
  seenPassage1: {
    source: 'English for Today (Unit 1: Talking to People / A Day in the Life)',
    text: `Communication is a two-way process of sharing information, ideas, and feelings between people. When we talk to elders or persons in authority, we use formal language. On the other hand, while speaking with our friends and peers, we use informal expressions. Greetings and polite words like 'please', 'thank you', 'excuse me', and 'sorry' make our daily conversations respectful and pleasant. Good listeners always pay attention, maintain eye contact, and respond politely without interrupting the speaker.`,
    mcqs: [
      { q: 'Communication is fundamentally a — process.', options: ['one-way', 'two-way', 'silent', 'negative'], ans: 1 },
      { q: 'With friends and classmates, we usually use — language.', options: ['formal', 'archaic', 'informal', 'official'], ans: 2 },
      { q: 'The word "polite" is closest in meaning to —.', options: ['rude', 'courteous', 'angry', 'harsh'], ans: 1 },
      { q: 'When someone speaks, a good listener should —.', options: ['interrupt quickly', 'look away', 'pay attention and maintain eye contact', 'leave the room'], ans: 2 },
      { q: 'Which of the following is an expression of politeness?', options: ['Get lost', 'Thank you', 'Shut up', 'Hurry away'], ans: 1 },
      { q: 'We use formal expressions when talking to —.', options: ['pets', 'strangers and elders', 'younger siblings only', 'nobody'], ans: 1 },
      { q: 'The antonym of "respectful" is —.', options: ['obedient', 'humble', 'disrespectful', 'kind'], ans: 2 }
    ],
    questions: [
      { label: 'a', text: 'What is communication according to the text?' },
      { label: 'b', text: 'Where and when should we use formal language?' },
      { label: 'c', text: 'Name three polite words mentioned in the passage.' },
      { label: 'd', text: 'What are the qualities of a good listener?' },
      { label: 'e', text: 'How do polite expressions make our conversations pleasant?' }
    ]
  },
  seenPassage2: {
    source: 'English for Today (Unit 2: Little Things / Nature)',
    text: `Little drops of water, little grains of sand, make the mighty ocean and the pleasant land. Thus the little moments, humble though they be, make the mighty ages of eternity. Our little errors lead the soul away from the path of virtue into sin to stray. Little deeds of kindness, little words of love, make our earth an Eden, like the heaven above.`,
    gapFilling: {
      instruction: 'Fill in the blanks with suitable words from the text (1x5=5):',
      items: [
        'Little drops of water make the (a) _____ ocean.',
        'Little moments make the mighty ages of (b) _____.',
        'Small mistakes lead our soul away from the path of (c) _____.',
        'Little deeds of (d) _____ bring happiness to everyone.',
        'Loving words can transform this earth into an (e) _____ like heaven.'
      ],
      answers: ['mighty', 'eternity', 'virtue', 'kindness', 'Eden']
    },
    vocabulary: {
      instruction: 'Give synonyms or antonyms as directed (1x5=5):',
      items: [
        { word: 'Mighty', directive: 'Synonym', ans: 'Powerful / Huge' },
        { word: 'Pleasant', directive: 'Antonym', ans: 'Unpleasant / Harsh' },
        { word: 'Kindness', directive: 'Synonym', ans: 'Compassion / Generosity' },
        { word: 'Error', directive: 'Synonym', ans: 'Mistake' },
        { word: 'Virtue', directive: 'Antonym', ans: 'Vice / Sin' }
      ]
    }
  },
  unseenPassage: {
    title: 'Dr. Muhammad Shahidullah: Great Scholar & Linguist',
    text: `Dr. Muhammad Shahidullah was one of the greatest polyglots, scholars, and linguists of Bangladesh. He was born on 10 July 1885 in the village of Peyara, 24 Parganas, West Bengal. He passed his Entrance examination in 1904 and completed his BA Honours in Sanskrit from City College, Kolkata in 1910. Later, he earned his PhD from the Sorbonne University in Paris in 1928 for his research on the origins of the Bengali language. He knew more than twenty languages and compiled the monumental Bengali Regional Dialect Dictionary. He breathed his last on 13 July 1969 in Dhaka.`,
    infoTransfer: {
      instruction: 'Complete the information transfer grid below (1x5=5):',
      headers: ['Who / Event', 'Activity / Achievement', 'Place / Year'],
      rows: [
        ['Dr. Muhammad Shahidullah', 'Born', 'Peyara village, 10 July 1885'],
        ['Entrance Examination', 'Passed successfully', '1904'],
        ['BA Honours in Sanskrit', 'Graduated from City College', 'Kolkata, 1910'],
        ['PhD Degree', 'Earned from Sorbonne University', 'Paris, 1928'],
        ['Regional Dialect Dictionary', 'Compiled with great research', 'Bangla Academy']
      ]
    },
    trueFalse: [
      { text: 'Dr. Muhammad Shahidullah was born in Dhaka in 1885.', isTrue: false, correct: 'He was born in Peyara, West Bengal in 1885.' },
      { text: 'He completed his BA Honours in Sanskrit from Kolkata.', isTrue: true, correct: 'True' },
      { text: 'He obtained his PhD from Oxford University.', isTrue: false, correct: 'He obtained his PhD from Sorbonne University in Paris.' },
      { text: 'He had proficiency in more than twenty languages.', isTrue: true, correct: 'True' },
      { text: 'He passed away on 13 July 1969 in Dhaka.', isTrue: true, correct: 'True' }
    ],
    summaryPrompt: 'Write a summary of the passage above in your own words (not exceeding 80 words). [10 Marks]',
    matching: {
      instruction: 'Match the phrase in Column A with Column B and Column C to make 5 meaningful sentences (1x5=5):',
      colA: ['(i) Dr. Shahidullah', '(ii) His research in Paris', '(iii) Polyglots are those', '(iv) His compilation of dictionary', '(v) We remember him'],
      colB: ['was awarded PhD', 'who have mastery', 'is respected as', 'is a treasure of', 'with profound gratitude'],
      colC: ['for his lifelong literary service.', 'over numerous languages.', 'for his thesis on Bangla origins.', 'a pioneer linguist in Bengal.', 'the Bengali national language.']
    },
    rearranging: [
      '(a) He earned his PhD degree from the prestigious Sorbonne University in Paris.',
      '(b) Dr. Muhammad Shahidullah was born in 1885 in West Bengal.',
      '(c) After completing his education, he joined Dhaka University as a teacher.',
      '(d) From childhood, he was exceptionally devoted to reading and learning languages.',
      '(e) His immense contribution to Bengali linguistics remains unforgettable.',
      '(f) He passed his Entrance exam in 1904 and completed his BA Honours in 1910.',
      '(g) He compiled the historic Regional Dictionary of Bengali Language.',
      '(h) This noble scholar passed away in Dhaka on 13 July 1969.'
    ],
    poemQuestions: {
      instruction: 'Answer any 5 out of the following 8 questions from the poems in English for Today (2x5=10):',
      questions: [
        { label: 'a', text: 'What makes the earth like an Eden according to the poem "Little Things"?' },
        { label: 'b', text: 'How do small drops of water contribute to the ocean?' },
        { label: 'c', text: 'What does the poet mean by "mighty ages of eternity"?' },
        { label: 'd', text: 'Why is kindness compared to heaven in the poem?' },
        { label: 'e', text: 'What message does the poem "Together We Are One" convey?' },
        { label: 'f', text: 'How do little errors lead human souls away from virtue?' },
        { label: 'g', text: 'What role does unity play in achieving great goals?' },
        { label: 'h', text: 'How can small good deeds inspire society?' }
      ]
    }
  },
  writing: {
    story: {
      title: 'Completing Stories (10 Marks)',
      prompt: 'Read the beginning of the story below and complete it in your own words. Give a suitable title.\n"Once a thirsty crow was flying all over the fields looking for water. For a long time, he could not find any. Suddenly, he saw a water pitcher below a tree..."'
    },
    paragraph: {
      title: 'Writing Paragraph in 120 words (10 Marks)',
      prompt: 'Write a paragraph on "Your School Library" or "A Rainy Day" in about 120 words answering the following questions:\n(a) What is it? (b) Where is it situated? (c) How do you spend time there? (d) What benefits do you get from it? (e) Why is it important in student life?'
    },
    dialogue: {
      title: 'Writing Dialogues (10 Marks)',
      prompt: 'Write a dialogue between two friends, Tanvir and Fahim, about the importance of reading newspapers daily.'
    }
  }
};

// ENGLISH 2ND PAPER COMPLETE SPEC & CONTENT (Classes 6-8: 50 Marks)
export const ENGLISH2_JUNIOR_SAMPLE_PAPER = {
  grammar: {
    partOfSpeech: {
      instruction: '1. Identification of Part of Speech (0.5x10=05):\nRead the following passage and identify the parts of speech of the 10 numbered words:',
      text: 'Honesty (1) is a great (2) virtue. It helps (3) a man to succeed in (4) life. An honest (5) person is respected by all (6). He never (7) tells a lie because (8) falsehood leads to destruction. Oh (9)! How peacefully (10) he sleeps at night!',
      words: [
        { num: 1, word: 'Honesty', pos: 'Noun' },
        { num: 2, word: 'great', pos: 'Adjective' },
        { num: 3, word: 'helps', pos: 'Verb' },
        { num: 4, word: 'in', pos: 'Preposition' },
        { num: 5, word: 'honest', pos: 'Adjective' },
        { num: 6, word: 'all', pos: 'Pronoun' },
        { num: 7, word: 'never', pos: 'Adverb' },
        { num: 8, word: 'because', pos: 'Conjunction' },
        { num: 9, word: 'Oh', pos: 'Interjection' },
        { num: 10, word: 'peacefully', pos: 'Adverb' }
      ]
    },
    gapFilling: {
      instruction: '2. Fill in the blanks with suitable words from the box. (You may change the form of words if necessary. Use articles, prepositions and parts of speech) (0.5x10=05):',
      clues: ['the', 'in', 'of', 'a', 'educate', 'nation', 'for', 'light', 'remove', 'to'],
      text: 'Education is the (a) _____ of life. It (b) _____ the darkness of ignorance from our mind. Without education, no (c) _____ can prosper. It prepares (d) _____ child for facing the challenges of life. It enables us (e) _____ distinguish between right and wrong. An (f) _____ person can contribute significantly (g) _____ the welfare of (h) _____ society. So, everyone must strive (i) _____ acquiring proper education (j) _____ childhood.',
      answers: ['(a) light', '(b) removes', '(c) nation', '(d) a', '(e) to', '(f) educated', '(g) to', '(h) the', '(i) for', '(j) in']
    },
    substitutionTable: {
      instruction: '3. Make five meaningful sentences from the substitution table below (1x5=5):',
      headers: ['Subject', 'Verb', 'Extension'],
      rows: [
        ['Discipline', 'means', 'the backbone of all human success.'],
        ['It', 'is', 'obedience to rules and regulations.'],
        ['A disciplined person', 'leads', 'a happy and peaceful life.'],
        ['Without discipline, society', 'cannot function', 'in an orderly manner.'],
        ['Students', 'should practice', 'discipline from their school days.']
      ]
    },
    rightFormOfVerbs: {
      instruction: '4. Complete the text with the right form of verbs given in brackets (1x5=5):',
      text: 'Physical exercise (a) _____ (be) essential for our body and mind. It (b) _____ (keep) us fit and active. Those who do not take regular exercise (c) _____ (suffer) from various diseases. If we (d) _____ (exercise) regularly, our blood circulation improves. Therefore, we should (e) _____ (build) the habit of exercising daily.',
      answers: ['(a) is', '(b) keeps', '(c) suffer', '(d) exercise', '(e) build']
    },
    changingSentences: {
      instruction: '5. Change the following sentences as directed in brackets (1x5=5):',
      items: [
        { text: '(a) Patriotism is a noble virtue.', target: 'Negative', ans: 'Patriotism is not a mean virtue.' },
        { text: '(b) An unpatriotic person is hated by everybody.', target: 'Affirmative / Active', ans: 'Everybody hates an unpatriotic person.' },
        { text: '(c) A patriot loves his country deeply.', target: 'Interrogative', ans: 'Doesn’t a patriot love his country deeply?' },
        { text: '(d) He sacrifice his comfort for his motherland.', target: 'Past Tense', ans: 'He sacrificed his comfort for his motherland.' },
        { text: '(e) How glorious the life of a patriot is!', target: 'Assertive', ans: 'The life of a patriot is very glorious.' }
      ]
    },
    punctuation: {
      instruction: '6. Use punctuation marks and capital letters where necessary in the following text (05):',
      text: 'the teacher said to rafi why are you talking in the class you should listen to my lecture attentively sir i am sorry i was asking fahim for a pen replied rafi',
      solution: 'The teacher said to Rafi, "Why are you talking in the class? You should listen to my lecture attentively." "Sir, I am sorry. I was asking Fahim for a pen," replied Rafi.'
    }
  },
  writing: {
    letter: {
      title: '7. Letters / E-mail (Formal & Informal) (08 Marks)',
      prompt: 'Write an application to the Headmaster of your school requesting a Transfer Certificate (TC) as your father has been transferred to another district.\nOR,\nWrite an e-mail to your friend congratulating him on his brilliant success in the Junior Scholarship Examination.'
    },
    composition: {
      title: '8. Writing Short Composition in 200 words (12 Marks)',
      prompt: 'Write a short composition in about 200 words on any one of the following topics:\n(a) Your Aim in Life\n(b) Duties of a Student\n(c) Wonders of Modern Science'
    }
  }
};

export function generateQuestionPaper({
  schoolName = 'মাগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়',
  examName = 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
  className = '10',
  department = 'সাধারণ',
  subjectId = 'physics',
  subjectName = 'পদার্থবিজ্ঞান',
  subjectCode = '136',
  selectedChapters = [],
  timeAllowed = '২ ঘণ্টা ৩০ মিনিট',
  totalMarks = 100,
  mcqCount = 25,
  cqCount = 8,
  cqToAnswer = 5,
  cqRule = '',
  shortCount = 0,
  shortToAnswer = 0,
  shortMarks = 0,
  shortRule = '',
  practicalMarks = 0,
  practicalRule = '',
  descriptiveMarks = 0,
  descriptiveRule = '',
  pattern = 'cq_mcq',
  difficulty = 'standard'
}) {
  const allQuestions = getStoredQuestions();
  const isSsc = String(className) === '9' || String(className) === '10';
  const isJunior = ['6', '7', '8'].includes(String(className));
  
  // Filter questions matching class and subject
  let pool = allQuestions.filter(q => 
    String(q.class_name) === String(className) && 
    (q.subject_id === subjectId || (q.subject_name && q.subject_name.includes(subjectName)))
  );

  // If chapter filter applied
  if (selectedChapters && selectedChapters.length > 0) {
    const chapterFiltered = pool.filter(q => selectedChapters.includes(q.chapter));
    if (chapterFiltered.length > 0) {
      pool = chapterFiltered;
    }
  }

  // Separate MCQs and CQs
  const mcqPool = pool.filter(q => q.question_type === 'mcq');
  const cqPool = pool.filter(q => q.question_type === 'cq');

  // Shuffle helper
  const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());

  // Effective MCQ Count
  let effectiveMcqCount = mcqCount;
  if (isJunior) {
    if (subjectId === 'bangla1') effectiveMcqCount = 30;
    else if (subjectId === 'bangla2') effectiveMcqCount = 15;
    else if (subjectId === 'english1') effectiveMcqCount = 7;
    else if (subjectId === 'english2') effectiveMcqCount = 0;
  }

  // 1. Pick or synthesize MCQs
  let pickedMcq = [];
  if (effectiveMcqCount > 0) {
    pickedMcq = shuffle(mcqPool).slice(0, effectiveMcqCount);
    if (pickedMcq.length < effectiveMcqCount) {
      const needed = effectiveMcqCount - pickedMcq.length;
      for (let i = 1; i <= needed; i++) {
        const idx = pickedMcq.length + 1;
        pickedMcq.push({
          id: `gen-mcq-${idx}-${Date.now()}`,
          class_name: className,
          subject_id: subjectId,
          subject_name: subjectName,
          chapter: selectedChapters[0] || 'পাঠ্যবইভিত্তিক',
          question_type: 'mcq',
          question_bn: `[প্রশ্ন ${idx}] ${subjectName} পাঠ্যবইয়ের নির্ধারিত অধ্যায়ের ওপর বহুনির্বাচনী প্রশ্ন। নিম্নের কোন তথ্যটি সঠিক নির্দেশ করে?`,
          options: ['তথ্য ১ ও ২ সঠিক', 'তথ্য ২ ও ৩ সঠিক', 'তথ্য ১ ও ৩ সঠিক', 'তথ্য ১, ২ ও ৩ সঠিক'],
          correct_answer: 'তথ্য ১, ২ ও ৩ সঠিক',
          correct_index: 3,
          marks: 1,
          explanation: 'পাঠ্যবইয়ের সংশ্লিষ্ট অনুচ্ছেদ ও সূত্র অনুযায়ী প্রদত্ত তথ্যাবলি সঠিক।'
        });
      }
    }
  }

  // Section Grouping Helper for CQs based on NCTB guidelines
  const getSectionLabel = (idx, total) => {
    if (subjectId === 'bangla1') {
      if (idx < 4) return '‘ক’ বিভাগ — গদ্য';
      return '‘খ’ বিভাগ — কবিতা';
    }
    if (!isSsc) return '';
    if (subjectId === 'math') {
      if (idx < 2) return 'ক বিভাগ — বীজগণিত';
      if (idx < 4) return 'খ বিভাগ — জ্যামিতি';
      if (idx < 6) return 'গ বিভাগ — ত্রিকোণমিতি ও পরিমিতি';
      return 'ঘ বিভাগ — পরিসংখ্যান';
    }
    if (subjectId === 'higher_math') {
      if (idx < 3) return 'ক বিভাগ — বীজগণিত';
      if (idx < 5) return 'খ বিভাগ — জ্যামিতি ও ভেক্টর';
      return 'গ বিভাগ — ত্রিকোণমিতি ও সম্ভাবনা';
    }
    if (subjectId === 'finance') {
      if (idx < 5) return 'ক বিভাগ — ফিন্যান্স';
      return 'খ বিভাগ — ব্যাংকিং';
    }
    return '';
  };

  // Effective CQ Count
  let effectiveCqCount = cqCount;
  let effectiveCqToAnswer = cqToAnswer;
  if (isJunior) {
    if (subjectId === 'bangla1') {
      effectiveCqCount = 8;
      effectiveCqToAnswer = 5;
    } else if (subjectId === 'bangla2' || subjectId === 'english1' || subjectId === 'english2') {
      effectiveCqCount = 0;
      effectiveCqToAnswer = 0;
    }
  }

  // 2. Pick or synthesize CQs
  let pickedCq = [];
  if (effectiveCqCount > 0) {
    pickedCq = shuffle(cqPool).slice(0, effectiveCqCount);
    if (pickedCq.length < effectiveCqCount) {
      const needed = effectiveCqCount - pickedCq.length;
      for (let i = 1; i <= needed; i++) {
        const idx = pickedCq.length + 1;
        const secLabel = getSectionLabel(idx - 1, effectiveCqCount);
        pickedCq.push({
          id: `gen-cq-${idx}-${Date.now()}`,
          class_name: className,
          subject_id: subjectId,
          subject_name: subjectName,
          chapter: selectedChapters[0] || 'সংশ্লিষ্ট অধ্যায়',
          question_type: 'cq',
          section_label: secLabel,
          sectionName: secLabel,
          stimulus: `উদ্দীপক ${idx}: শিক্ষক ক্লাসে ${subjectName}-এর গুরুত্ব ও বাস্তব প্রয়োগ আলোচনা করছিলেন। তিনি শিক্ষার্থীদের একটি বিষয় পর্যবেক্ষণ করালেন যেখানে বাস্তব জীবনের সাথে পাঠ্যপুস্তকের চমৎকার প্রতিফলন রয়েছে।`,
          sub_questions: [
            { label: 'ক', text: `${subjectName} সংশ্লিষ্ট মূল ধারণা বা জ্ঞানমূলক প্রশ্নের উত্তর লিখ।`, marks: 1 },
            { label: 'খ', text: 'প্রদত্ত বিষয়ের অন্তর্নিহিত অনুধাবনমূলক তাৎপর্য ব্যাখ্যা কর।', marks: 2 },
            { label: 'গ', text: 'উদ্দীপকের সাথে পাঠ্যপুস্তকের সাদৃশ্যপূর্ণ দিকটি ব্যাখ্যা কর।', marks: 3 },
            { label: 'ঘ', text: 'উক্ত বিষয়ের আলোকে উদ্দীপকের বক্তব্যটি মূল্যায়ন কর।', marks: 4 }
          ],
          explanation: 'ক) জ্ঞানমূলক ১ নম্বর। খ) অনুধাবন ২ নম্বর। গ) প্রয়োগ ৩ নম্বর। ঘ) উচ্চতর দক্ষতা ৪ নম্বর।',
          marks: 10
        });
      }
    }
    // Tag section labels on all picked CQs
    pickedCq = pickedCq.map((q, idx) => {
      const label = q.section_label || q.sectionName || getSectionLabel(idx, effectiveCqCount);
      return {
        ...q,
        section_label: label,
        sectionName: label
      };
    });
  }

  // 3. Pick or synthesize Short-Answer Questions (সংক্ষিপ্ত-উত্তর প্রশ্ন)
  let pickedShort = [];
  if (shortCount > 0 && !isJunior) {
    const defaultPool = SUBJECT_SHORT_QUESTIONS_POOL[subjectId] || SUBJECT_SHORT_QUESTIONS_POOL.general_science;
    const shuffledPool = shuffle(defaultPool);
    for (let i = 0; i < shortCount; i++) {
      const qText = shuffledPool[i % shuffledPool.length] || `[সংক্ষিপ্ত প্রশ্ন ${i + 1}] ${subjectName} বিষয়ের মৌলিক ধারণা ও তাৎপর্য ব্যাখ্যা কর।`;
      pickedShort.push({
        id: `gen-short-${i + 1}-${Date.now()}`,
        number: i + 1,
        question_bn: qText,
        marks: 2,
        explanation: 'সংক্ষিপ্ত, নির্ভুল ও তথ্যভিত্তিক উত্তর লিখলে পূর্ণ ২ নম্বর পাওয়া যাবে।'
      });
    }
  }

  // 4. Special descriptive questions for Bangla 1st Paper (সহপাঠ: উপন্যাস ও নাটক / আনন্দ পাঠ)
  let pickedDescriptive = [];
  if (subjectId === 'bangla1') {
    if (isJunior) {
      pickedDescriptive = BANGLA1_JUNIOR_ANANDA_PATH_POOL;
    } else {
      pickedDescriptive = BANGLA1_DESCRIPTIVE_POOL;
    }
  }

  // 5. Special financial statement for Accounting
  let financialStatement = null;
  if (subjectId === 'accounting' && isSsc) {
    financialStatement = ACCOUNTING_FINANCIAL_STIMULUS;
  }

  // 6. Special composition items for Bangla 2nd Paper
  let bangla2Composition = null;
  let compositionItems = [];
  if (subjectId === 'bangla2') {
    if (isJunior) {
      bangla2Composition = BANGLA2_JUNIOR_COMPOSITION;
    } else {
      bangla2Composition = BANGLA2_SSC_COMPOSITION;
      compositionItems = BANGLA2_COMPOSITION_ITEMS;
    }
  }

  // 7. Special English Papers
  let english1Paper = null;
  let english2Paper = null;
  if (subjectId === 'english1') {
    english1Paper = ENGLISH1_JUNIOR_SAMPLE_PAPER;
  } else if (subjectId === 'english2') {
    english2Paper = ENGLISH2_JUNIOR_SAMPLE_PAPER;
  }

  // Calculated effective total marks
  let effectiveTotalMarks = totalMarks;
  if (isJunior) {
    if (subjectId === 'bangla1') effectiveTotalMarks = 100;
    else if (subjectId === 'bangla2') effectiveTotalMarks = 50;
    else if (subjectId === 'english1') effectiveTotalMarks = 100;
    else if (subjectId === 'english2') effectiveTotalMarks = 50;
  }

  return {
    id: 'paper-' + Date.now().toString(36),
    title: `${examName} - ${subjectName} (${className === '10' ? '১০ম' : className === '9' ? '৯ম' : className === '8' ? '৮ম' : className === '7' ? '৭ম' : '৬ষ্ঠ'} শ্রেণি)`,
    schoolName,
    examName,
    className,
    department,
    subjectId,
    subjectName,
    subjectCode,
    timeAllowed: (isJunior && (subjectId === 'bangla2' || subjectId === 'english2')) ? '২ ঘণ্টা' : timeAllowed,
    totalMarks: effectiveTotalMarks,
    mcqCount: pickedMcq.length,
    cqCount: pickedCq.length,
    cqToAnswer: effectiveCqToAnswer,
    cqRule: isJunior && subjectId === 'bangla1'
      ? 'গদ্য থেকে ৪টি এবং কবিতা থেকে ৪টি করে মোট ৮টি সৃজনশীল প্রশ্ন থাকবে। গদ্য ও কবিতা থেকে কমপক্ষে ২টি করে মোট ৫টি প্রশ্নের উত্তর দিতে হবে। (৫ × ১০ = ৫০)'
      : cqRule,
    shortCount: pickedShort.length,
    shortToAnswer,
    shortMarks,
    shortRule,
    practicalMarks,
    practicalRule,
    descriptiveMarks: (subjectId === 'bangla1') ? 20 : descriptiveMarks,
    descriptiveRule: isJunior && subjectId === 'bangla1'
      ? 'আনন্দ পাঠ থেকে ৪টি বর্ণনামূলক প্রশ্ন থাকবে। এর মধ্যে ২টি প্রশ্নের উত্তর দিতে হবে। প্রত্যেকটি প্রশ্নের ২টি অংশ থাকবে (ক অংশের জন্য ৩ এবং খ অংশের জন্য ৭ নম্বর মোট ২০ নম্বর বরাদ্দ থাকবে)। (২ × ১০ = ২০)'
      : descriptiveRule,
    pattern,
    mcqs: pickedMcq,
    cqs: pickedCq,
    shortQuestions: pickedShort,
    descriptiveQuestions: pickedDescriptive,
    financialStatement,
    compositionItems,
    bangla2Composition,
    english1Paper,
    english2Paper,
    createdAt: new Date().toISOString()
  };
}

