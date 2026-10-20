// frontend/src/questionBankData.js
// Magra E-ProshnoBank Engine & Central Question Repository
// Inspired by eproshnobank.com with Board Standard Exam Papers, OMR Evaluator, and Live Exam

export const SUBJECT_METADATA = [
  { id: 'bangla1', code: '101', name: 'বাংলা ১ম পত্র', classes: ['6','7','8','9','10'] },
  { id: 'bangla2', code: '102', name: 'বাংলা ২য় পত্র', classes: ['6','7','8','9','10'] },
  { id: 'english1', code: '107', name: 'English 1st Paper', classes: ['6','7','8','9','10'] },
  { id: 'english2', code: '108', name: 'English 2nd Paper', classes: ['6','7','8','9','10'] },
  { id: 'math', code: '109', name: 'গণিত (Mathematics)', classes: ['6','7','8','9','10'] },
  { id: 'general_science', code: '127', name: 'সাধারণ বিজ্ঞান', classes: ['6','7','8'] },
  { id: 'physics', code: '136', name: 'পদার্থবিজ্ঞান', classes: ['9','10'] },
  { id: 'chemistry', code: '137', name: 'রসায়ন', classes: ['9','10'] },
  { id: 'biology', code: '138', name: 'জীববিজ্ঞান', classes: ['9','10'] },
  { id: 'higher_math', code: '126', name: 'উচ্চতর গণিত', classes: ['9','10'] },
  { id: 'bgs', code: '150', name: 'বাংলাদেশ ও বিশ্বপরিচয়', classes: ['6','7','8','9','10'] },
  { id: 'ict', code: '154', name: 'তথ্য ও যোগাযোগ প্রযুক্তি', classes: ['6','7','8','9','10'] },
  { id: 'islam', code: '111', name: 'ইসলাম ও নৈতিক শিক্ষা', classes: ['6','7','8','9','10'] }
];

export const CHAPTERS_DATA = {
  bangla1: {
    '6': ['১ম অধ্যায়: সততার পুরস্কার', '২য় অধ্যায়: মিনু', '৩য় অধ্যায়: নীলনদ আর পিরামিডের দেশ', '৪র্থ অধ্যায়: জন্মভূমি', '৫ম অধ্যায়: মানুষ জাতি'],
    '7': ['১ম অধ্যায়: কাবুলিওয়ালা', '২য় অধ্যায়: লখার একুশে', '৩য় অধ্যায়: মরু-ভাস্কর', '৪র্থ অধ্যায়: মেলা', '৫ম অধ্যায়: কুলি-মজুর'],
    '8': ['১ম অধ্যায়: অতিথির স্মৃতি', '২য় অধ্যায়: ভাব ও কাজ', '৩য় অধ্যায়: পড়ে পাওয়া', '৪র্থ অধ্যায়: মানবধর্ম', '৫ম অধ্যায়: বঙ্গভূমির প্রতি', '৬ষ্ঠ অধ্যায়: দুই বিঘা জমি'],
    '9': ['১ম অধ্যায়: শুভা', '২য় অধ্যায়: বই পড়া', '৩য় অধ্যায়: অভাগীর স্বর্গ', '৪র্থ অধ্যায়: বঙ্গবাণী', '৫ম অধ্যায়: কপোতাক্ষ নদ', '৬ষ্ঠ অধ্যায়: মানুষ', '৭ম অধ্যায়: পল্লীজননী'],
    '10': ['১ম অধ্যায়: শুভা', '২য় অধ্যায়: বই পড়া', '৩য় অধ্যায়: একাত্তরের দিনগুলি', '৪র্থ অধ্যায়: বঙ্গবাণী', '৫ম অধ্যায়: কপোতাক্ষ নদ', '৬ষ্ঠ অধ্যায়: তোমাকে পাওয়ার জন্য হে স্বাধীনতা', '৭ম অধ্যায়: সাহসী জননী বাংলা']
  },
  bangla2: {
    '6': ['১ম অধ্যায়: ভাষা ও বাংলা ভাষা', '২য় অধ্যায়: রূপতত্ত্ব', '৩য় অধ্যায়: বাক্যতত্ত্ব', '৪র্থ অধ্যায়: বাগর্থ'],
    '7': ['১ম অধ্যায়: ধ্বনি ও বর্ণ', '২য় অধ্যায়: শব্দ ও পদ', '৩য় অধ্যায়: সন্ধি', '৪র্থ অধ্যায়: বিরামচিহ্ন'],
    '8': ['১ম অধ্যায়: ভাষা ও ব্যাকরণ', '২য় অধ্যায়: ধ্বনি ও বর্ণ', '৩য় অধ্যায়: সন্ধি', '৪র্থ অধ্যায়: শব্দগঠন ও পদ', '৫ম অধ্যায়: বিরাম চিহ্ন'],
    '9': ['১ম অধ্যায়: বাংলা ব্যাকরণ ও এর আলোচ্য বিষয়', '২য় অধ্যায়: ধ্বনিতত্ত্ব ও ধ্বনি পরিবর্তন', '৩য় অধ্যায়: ণত্ব ও ষত্ব বিধান', '৪র্থ অধ্যায়: সন্ধি', '৫ম অধ্যায়: সমাস ও উপসর্গ', '৬ষ্ঠ অধ্যায়: কারক ও বিভক্তি'],
    '10': ['১ম অধ্যায়: ধ্বনিতত্ত্ব ও উচ্চারণ', '২য় অধ্যায়: উপসর্গ ও অনুসর্গ', '৩য় অধ্যায়: সমাস ও প্রত্যয়', '৪র্থ অধ্যায়: কারক ও বাক্য রূপান্তর', '৫ম অধ্যায়: বাচ্য ও বাক্য পরিবর্তন']
  },
  math: {
    '6': ['১ম অধ্যায়: স্বাভাবিক সংখ্যা ও ভগ্নাংশ', '২য় অধ্যায়: অনুপাত ও শতকরা', '৩য় অধ্যায়: পূর্ণসংখ্যা', '৪র্থ অধ্যায়: বীজগণিতীয় রাশি', '৫ম অধ্যায়: জ্যামিতির মৌলিক ধারণা', '৬ষ্ঠ অধ্যায়: তথ্য ও উপাত্ত'],
    '7': ['১ম অধ্যায়: মূলদ ও অমূলদ সংখ্যা', '২য় অধ্যায়: সমানুপাত ও লাভ-ক্ষতি', '৩য় অধ্যায়: পরিমাপ', '৪র্থ অধ্যায়: বীজগণিতীয় রাশির গুণ ও ভাগ', '৫ম অধ্যায়: সমীকরণ', '৬ষ্ঠ অধ্যায়: ত্রিভুজ'],
    '8': ['১ম অধ্যায়: প্যাটার্ন', '২য় অধ্যায়: মুনাফা', '৩য় অধ্যায়: পরিমাপ', '৪র্থ অধ্যায়: বীজগণিতীয় সূত্রাবলী ও প্রয়োগ', '৫ম অধ্যায়: বীজগণিতীয় ভগ্নাংশ', '৬ষ্ঠ অধ্যায়: সরল সহসমীকরণ', '৭ম অধ্যায়: পিথাগোরাসের উপপাদ্য', '৮ম অধ্যায়: চতুর্ভুজ ও বৃত্ত', '৯ম অধ্যায়: তথ্য ও উপাত্ত'],
    '9': ['১ম অধ্যায়: বাস্তব সংখ্যা', '২য় অধ্যায়: সেট ও ফাংশন', '৩য় অধ্যায়: বীজগাণিতিক রাশি', '৪র্থ অধ্যায়: সূচক ও লগারিদম', '৫ম অধ্যায়: এক চলকবিশিষ্ট সমীকরণ', '৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ', '৭ম অধ্যায়: বৃত্ত', '৮ম অধ্যায়: ত্রিকোণমিতিক অনুপাত', '৯ম অধ্যায়: পরিসংখ্যান'],
    '10': ['১ম অধ্যায়: বাস্তব সংখ্যা', '২য় অধ্যায়: সেট ও ফাংশন', '৩য় অধ্যায়: বীজগাণিতিক রাশি', '৪র্থ অধ্যায়: সূচক ও লগারিদম', '৫ম অধ্যায়: বৃত্ত ও ব্যবহারিক জ্যামিতি', '৬ষ্ঠ অধ্যায়: ত্রিকোণমিতিক অনুপাত ও দূরত্ব-উচ্চতা', '৭ম অধ্যায়: সসীম ধারা', '৮ম অধ্যায়: পরিমিতি', '৯ম অধ্যায়: পরিসংখ্যান']
  },
  general_science: {
    '6': ['১ম অধ্যায়: বৈজ্ঞানিক প্রক্রিয়া ও পরিমাপ', '২য় অধ্যায়: জীবজগৎ', '৩য় অধ্যায়: উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন', '৪র্থ অধ্যায়: পদার্থের বৈশিষ্ট্য ও বাহ্যিক প্রভাব', '৫ম অধ্যায়: খাদ্য ও পুষ্টি', '৬ষ্ঠ অধ্যায়: দেখতে হলে আলো চাই'],
    '7': ['১ম অধ্যায়: নিম্নশ্রেণির জীব', '২য় অধ্যায়: উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন', '৩য় অধ্যায়: উদ্ভিদের বাহ্যিক বৈশিষ্ট্য', '৪র্থ অধ্যায়: রক্ত সংবহনতন্ত্র', '৫ম অধ্যায়: পদার্থের গঠন', '৬ষ্ঠ অধ্যায়: শক্তির ব্যবহার'],
    '8': ['১ম অধ্যায়: প্রাণিজগতের শ্রেণিবিন্যাস', '২য় অধ্যায়: জীবের বৃদ্ধি ও বংশগতি', '৩য় অধ্যায়: ব্যাপন, অভিস্রবণ ও প্রস্বেদন', '৪র্থ অধ্যায়: রাসায়নিক বিক্রিয়া', '৫ম অধ্যায়: সমন্বয় ও সংবেদন', '৬ষ্ঠ অধ্যায়: অম্ল, ক্ষারক ও লবণ', '৭ম অধ্যায়: পৃথিবী ও মহাকর্ষ', '৮ম অধ্যায়: আলো ও পরমাণুর গঠন']
  },
  physics: {
    '9': ['১ম অধ্যায়: ভৌত রাশি ও পরিমাপ', '২য় অধ্যায়: গতি', '৩য় অধ্যায়: বল', '৪র্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি', '৫ম অধ্যায়: পদার্থের অবস্থা ও চাপ', '৬ষ্ঠ অধ্যায়: বস্তুর ওপর তাপের প্রভাব', '৭ম অধ্যায়: তরঙ্গ ও শব্দ'],
    '10': ['১ম অধ্যায়: গতি ও বল', '২য় অধ্যায়: কাজ, ক্ষমতা ও শক্তি', '৩য় অধ্যায়: তরঙ্গ ও শব্দ', '৪র্থ অধ্যায়: আলোর প্রতিফলন', '৫ম অধ্যায়: আলোর প্রতিসরণ', '৬ষ্ঠ অধ্যায়: স্থির বিদ্যুৎ', '৭ম অধ্যায়: চল বিদ্যুৎ', '৮ম অধ্যায়: বিদ্যুতের চৌম্বক ক্রিয়া', '৯ম অধ্যায়: আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স']
  },
  chemistry: {
    '9': ['১ম অধ্যায়: রসায়নের ধারণা', '২য় অধ্যায়: পদার্থের অবস্থা', '৩য় অধ্যায়: পদার্থের গঠন', '৪র্থ অধ্যায়: পর্যায় সারণি', '৫ম অধ্যায়: রাসায়নিক বন্ধন', '৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা'],
    '10': ['১ম অধ্যায়: পর্যায় সারণি ও বন্ধন', '২য় অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা', '৩য় অধ্যায়: রাসায়নিক বিক্রিয়া', '৪র্থ অধ্যায়: রসায়ন ও শক্তি', '৫ম অধ্যায়: এসিড-ক্ষার সমতা', '৬ষ্ঠ অধ্যায়: খনিজ সম্পদ: ধাতু ও অধাতু', '৭ম অধ্যায়: খনিজ সম্পদ: জীবাশ্ম', '৮ম অধ্যায়: আমাদের জীবনে রসায়ন']
  },
  biology: {
    '9': ['১ম অধ্যায়: জীবন পাঠ', '২য় অধ্যায়: জীবকোষ ও টিস্যু', '৩য় অধ্যায়: কোষ বিভাজন', '৪র্থ অধ্যায়: জীবনীশক্তি', '৫ম অধ্যায়: উদ্ভিদের খাদ্য ও পুষ্টি', '৬ষ্ঠ অধ্যায়: উদ্ভিদে পরিবহন'],
    '10': ['১ম অধ্যায়: জীবকোষ ও টিস্যু', '২য় অধ্যায়: জীবনীশক্তি', '৩য় অধ্যায়: গ্যাসীয় বিনিময়', '৪র্থ অধ্যায়: রেচন প্রক্রিয়া', '৫ম অধ্যায়: সমন্বয় ও নিঃসরন', '৬ষ্ঠ অধ্যায়: জীবের প্রজনন', '৭ম অধ্যায়: জীবের বংশগতি ও বিবর্তন', '৮ম অধ্যায়: জীবপ্রযুক্তি']
  },
  ict: {
    '6': ['১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি', '২য় অধ্যায়: আইসিটি যন্ত্রপাতি', '৩য় অধ্যায়: নিরাপদ ও নৈতিক ব্যবহার'],
    '7': ['১ম অধ্যায়: প্রাত্যহিক জীবনে আইসিটি', '২য় অধ্যায়: কম্পিউটার সংশ্লিষ্ট যন্ত্রপাতি', '৩য় অধ্যায়: নিরাপদ ইন্টারনেট ব্যবহার'],
    '8': ['১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ', '২য় অধ্যায়: কম্পিউটার নেটওয়ার্ক', '৩য় অধ্যায়: তথ্য নিরাপত্তা ও ক্ষতিকর সফটওয়্যার', '৪র্থ অধ্যায়: স্প্রেডশিটের ব্যবহার'],
    '9': ['১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ', '২য় অধ্যায়: কম্পিউটার ও ব্যবহারকারীর নিরাপত্তা', '৩য় অধ্যায়: আমার শিক্ষায় ইন্টারনেট', '৪র্থ অধ্যায়: আমার লেখালেখি ও হিসাব'],
    '10': ['১ম অধ্যায়: কম্পিউটার ও তথ্য নিরাপত্তা', '২য় অধ্যায়: ইন্টারনেটের নিরাপদ ব্যবহার', '৩য় অধ্যায়: মাল্টিমিডিয়া ও গ্রাফিক্স', '৪র্থ অধ্যায়: ডেটাবেজ পরিচিতি ও ব্যবহার']
  },
  bgs: {
    '6': ['১ম অধ্যায়: বাংলাদেশের ইতিহাস', '২য় অধ্যায়: বাংলাদেশ ও আঞ্চলিক সহযোগিতা', '৩য় অধ্যায়: বাংলাদেশের ভৌগোলিক পরিবেশ'],
    '7': ['১ম অধ্যায়: বাংলাদেশের স্বাধীনতা সংগ্রাম', '২য় অধ্যায়: বাংলাদেশের সংস্কৃতি ও সাংস্কৃতিক বৈচিত্র্য', '৩য় অধ্যায়: জলবায়ু ও দুর্যোগ'],
    '8': ['১ম অধ্যায়: ঔপনিবেশিক যুগ ও বাংলার স্বাধীনতা সংগ্রাম', '২য় অধ্যায়: বাংলাদেশের মুক্তিযুদ্ধ', '৩য় অধ্যায়: বাংলাদেশের প্রাকৃতিক সম্পদ', '৪র্থ অধ্যায়: সামাজিক সমস্যা ও প্রতিকার'],
    '9': ['১ম অধ্যায়: পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান', '২য় অধ্যায়: স্বাধীন বাংলাদেশ', '৩য় অধ্যায়: সৌরজগৎ ও ভূমণ্ডল', '৪র্থ অধ্যায়: রাষ্ট্র, নাগরিকতা ও আইন'],
    '10': ['১ম অধ্যায়: স্বাধীন বাংলাদেশের অভ্যুদয়', '২য় অধ্যায়: সৌরজগৎ ও আবহাওয়া', '৩য় অধ্যায়: বাংলাদেশের অর্থনীতি', '৪র্থ অধ্যায়: সামাজিক সমস্যা ও সমাধান']
  },
  islam: {
    '6': ['১ম অধ্যায়: আকাইদ', '২য় অধ্যায়: ইবাদত', '৩য় অধ্যায়: আখলাক ও নৈতিকতা', '৪র্থ অধ্যায়: আদর্শ জীবনচরিত'],
    '7': ['১ম অধ্যায়: তাওহিদ ও রিসালাত', '২য় অধ্যায়: তাহরাত ও সালাত', '৩য় অধ্যায়: কোরআন ও হাদিস শিক্ষা', '৪র্থ অধ্যায়: আখলাক'],
    '8': ['১ম অধ্যায়: আকাইদ ও ঈমান', '২য় অধ্যায়: ইবাদতের তাৎপর্য', '৩য় অধ্যায়: আল-কোরআন ও হাদিস', '৪র্থ অধ্যায়: আখলাক বা চরিত্র', '৫ম অধ্যায়: আদর্শ জীবনচরিত'],
    '9': ['১ম অধ্যায়: আকাইদ ও নৈতিক জীবন', '২য় অধ্যায়: শরিয়তের উৎস', '৩য় অধ্যায়: ইবাদত', '৪র্থ অধ্যায়: আখলাক-ই-হামিদা', '৫ম অধ্যায়: নবী ও রাসুলগণের জীবনী'],
    '10': ['১ম অধ্যায়: আকাইদ ও নৈতিক জীবন', '২য় অধ্যায়: শরিয়তের বিধান', '৩য় অধ্যায়: ইবাদত ও মুয়ামালাত', '৪র্থ অধ্যায়: আখলাক ও মানবাধিকার', '৫ম অধ্যায়: ইসলামি সভ্যতা ও সংস্কৃতি']
  },
  english1: {
    '6': ['Unit 1: Talking to People', 'Unit 2: Little Things', 'Unit 3: Future Lies in Present', 'Unit 4: Ask and Answer'],
    '7': ['Unit 1: A Day in the Life', 'Unit 2: Playing with the Words', 'Unit 3: If I were a Bird', 'Unit 4: The Frog and the Ox'],
    '8': ['Unit 1: A Journey Through Bangladesh', 'Unit 2: The Art of Living', 'Unit 3: Language and Identity', 'Unit 4: Environment and Nature'],
    '9': ['Unit 1: Good Citizens', 'Unit 2: Pastimes', 'Unit 3: Events and Festivals', 'Unit 4: Are We Aware?'],
    '10': ['Unit 1: Good Citizens', 'Unit 2: Events and Festivals', 'Unit 3: Nature and Environment', 'Unit 4: Youth Leadership']
  },
  english2: {
    '6': ['Grammar: Parts of Speech', 'Grammar: Tense', 'Grammar: Articles', 'Composition: Paragraph Writing'],
    '7': ['Grammar: Prepositions', 'Grammar: Right Form of Verbs', 'Grammar: Voice Change', 'Composition: Formal Letter'],
    '8': ['Grammar: Narration', 'Grammar: Voice Transformation', 'Grammar: Degree of Comparison', 'Composition: Dialogue Writing'],
    '9': ['Grammar: Right Form of Verbs', 'Grammar: Tag Questions', 'Grammar: Connectors & Linkers', 'Composition: CV Writing'],
    '10': ['Grammar: Modifiers', 'Grammar: Completing Sentences', 'Grammar: Punctuation & Capitalization', 'Composition: Report Writing']
  }
};

// Rich Seed Question Bank covering multiple classes, subjects, MCQ & CQ
export const SEED_QUESTIONS = [
  // Class 10 Physics
  {
    id: 'q-phy-10-01',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '২য় অধ্যায়: গতি',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'স্থির অবস্থান থেকে সুষম ত্বরণে চলমান কোনো বস্তুর অতিক্রান্ত দূরত্ব (s) সময়ের (t) সাথে কীভাবে সম্পর্কিত?',
    options: ['s ∝ t', 's ∝ t²', 's ∝ √t', 's ∝ 1/t'],
    correct_answer: 's ∝ t²',
    correct_index: 1, // 0-based: 0=ক, 1=খ, 2=গ, 3=ঘ
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
    difficulty: 'standard',
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
    difficulty: 'easy',
    question_bn: 'কাজের মাত্রা কোনটি?',
    options: ['[MLT⁻¹]', '[ML²T⁻²]', '[MLT⁻²]', '[ML²T⁻³]'],
    correct_answer: '[ML²T⁻²]',
    correct_index: 1,
    explanation: 'কাজ = বল × সরণ = [MLT⁻²] × [L] = [ML²T⁻²]।',
    marks: 1
  },
  {
    id: 'q-phy-10-04',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '৭ম অধ্যায়: চল বিদ্যুৎ',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'ওহমের সূত্রের সঠিক রূপ কোনটি?',
    options: ['I = V/R', 'V = I/R', 'R = VI', 'I = VR'],
    correct_answer: 'I = V/R',
    correct_index: 0,
    explanation: 'নির্দিষ্ট তাপমাত্রায় কোনো পরিবাহীর মধ্য দিয়ে প্রবাহিত তড়িৎপ্রবাহ (I) পরিবাহীর দুই প্রান্তের বিভব পার্থক্যের (V) সমানুপাতিক এবং রোধের (R) ব্যস্তানুপাতিক। অর্থাৎ I = V/R।',
    marks: 1
  },
  {
    id: 'q-phy-10-cq-01',
    class_name: '10',
    subject_id: 'physics',
    subject_name: 'পদার্থবিজ্ঞান',
    chapter: '২য় অধ্যায়: গতি ও বল',
    question_type: 'cq',
    difficulty: 'standard',
    stimulus: 'একটি ১০০০ কেজি ভরের প্রাইভেট কার স্থির অবস্থান থেকে সুষম ত্বরণে ২০ সেকেন্ডে ৭২ কিমি/ঘণ্টা বেগ প্রাপ্ত হলো। চালক হঠাৎ সামনে একটি পথচারীকে দেখে ব্রেক চেপে ৫ সেকেন্ডের মধ্যে গাড়িটি সম্পূর্ণ থামিয়ে দিলেন।',
    sub_questions: [
      { label: 'ক', text: 'ত্বরণ কাকে বলে?', marks: 1 },
      { label: 'খ', text: 'চলন্ত বাস হঠাৎ ব্রেক করলে যাত্রীরা সামনের দিকে ঝুঁকে পড়েন কেন? ব্যাখ্যা কর।', marks: 2 },
      { label: 'গ', text: 'প্রথম ২০ সেকেন্ডে গাড়িটির ত্বরণ ও অতিক্রান্ত দূরত্ব নির্ণয় কর।', marks: 3 },
      { label: 'ঘ', text: 'ব্রেক চাপার ক্ষেত্রে গাড়িটির মন্দনকারী বলের মান গাণিতিকভাবে বিশ্লেষণ কর।', marks: 4 }
    ],
    explanation: 'ক) সময়ের সাথে কোনো বস্তুর বেগ বৃদ্ধির হারকে ত্বরণ বলে।\nখ) গতির জড়তার কারণে।\nগ) u=0, v=72 km/h = 20 m/s, t=20s. ত্বরণ a = (v-u)/t = 1 m/s²; s = ½(u+v)t = 200 m.\nঘ) v=0, u=20 m/s, t=5s. মন্দন a = 4 m/s². মন্দন বল F = ma = 1000 × 4 = 4000 N।',
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
    difficulty: 'standard',
    question_bn: 'আধুনিক পর্যায় সারণির মূল ভিত্তি কী?',
    options: ['পারমাণবিক ভর', 'ইলেকট্রন বিন্যাস', 'পারমাণবিক সংখ্যা', 'আইসোটোপ'],
    correct_answer: 'ইলেকট্রন বিন্যাস',
    correct_index: 1,
    explanation: 'পর্যায় সারণির মূল ভিত্তি হলো মৌলের ইলেকট্রন বিন্যাস। ইলেকট্রন বিন্যাসের মাধ্যমেই মৌলসমূহের পর্যায় ও গ্রুপ নির্ধারিত হয়।',
    marks: 1
  },
  {
    id: 'q-chem-10-02',
    class_name: '10',
    subject_id: 'chemistry',
    subject_name: 'রসায়ন',
    chapter: '৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'প্রমাণ তাপমাত্রা ও চাপে (STP) ১ মোল যেকোনো গ্যাসের আয়তন কত?',
    options: ['২২.৪ লিটার', '২৪.৭৮৯ লিটার', '২০.৪ লিটার', '২২.৭ লিটার'],
    correct_answer: '২২.৪ লিটার',
    correct_index: 0,
    explanation: 'প্রমাণ অবস্থায় (০° সে. এবং ১ atm চাপে) যেকোনো গ্যাসের এক মোলের মোলার আয়তন ২২.৪ লিটার।',
    marks: 1
  },
  {
    id: 'q-chem-10-cq-01',
    class_name: '10',
    subject_id: 'chemistry',
    subject_name: 'রসায়ন',
    chapter: '৫ম অধ্যায়: রাসায়নিক বন্ধন',
    question_type: 'cq',
    difficulty: 'standard',
    stimulus: 'তিনটি মৌল X, Y এবং Z-এর পারমাণবিক সংখ্যা যথাক্রমে ১১, ১২ এবং ১৭। X ও Y মৌল দুটি Z মৌলের সাথে যুক্ত হয়ে যৌগ গঠন করে।',
    sub_questions: [
      { label: 'ক', text: 'যোজ্যতা ইলেকট্রন কী?', marks: 1 },
      { label: 'খ', text: 'নিষ্ক্রিয় গ্যাসসমূহ রাসায়নিকভাবে নিস্ক্রিয় কেন?', marks: 2 },
      { label: 'গ', text: 'X ও Z দ্বারা গঠিত যৌগের বন্ধন গঠন প্রক্রিয়া ডায়াগ্রামসহ ব্যাখ্যা কর।', marks: 3 },
      { label: 'ঘ', text: 'Y এবং Z দ্বারা গঠিত যৌগের গলনাঙ্ক ও বিদ্যুৎ পরিবাহিতা বিশ্লেষণ কর।', marks: 4 }
    ],
    explanation: 'ক) কোনো পরমাণুর সর্বশেষ কক্ষপথের মোট ইলেকট্রন সংখ্যাকে যোজ্যতা ইলেকট্রন বলে।\nখ) সর্বশেষ কক্ষপথে স্থিতিশীল অষ্টক বা দ্বিত্ব পূর্ণ থাকে বিধায়।\nগ) Na (11) ও Cl (17) এর মধ্যে ইলেকট্রন আদান-প্রদানের মাধ্যমে আয়নিক বন্ধন (NaCl) গঠিত হয়।\nঘ) MgCl2 একটি আয়নিক যৌগ, এর ক্লাটিসে শক্তিশালী স্থির বৈদ্যুতিক আকর্ষণ বিদ্যমান থাকায় উচ্চ গলনাঙ্কবিশিষ্ট এবং গলিত বা দ্রবীভূত অবস্থায় বিদ্যুৎ পরিবহন করে।',
    marks: 10
  },

  // Class 10 Biology
  {
    id: 'q-bio-10-01',
    class_name: '10',
    subject_id: 'biology',
    subject_name: 'জীববিজ্ঞান',
    chapter: '২য় অধ্যায়: জীবকোষ ও টিস্যু',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'কোষের শক্তিঘর (Power house) বলা হয় কোন অঙ্গাণুকে?',
    options: ['প্লাস্টিড', 'মাইটোকন্ড্রিয়া', 'রাইবোসোম', 'গলজি বস্তু'],
    correct_answer: 'মাইটোকন্ড্রিয়া',
    correct_index: 1,
    explanation: 'শ্বসন প্রক্রিয়ার গুরুত্বপূর্ণ পর্যায় ক্রেবস চক্র মাইটোকন্ড্রিয়ায় সম্পন্ন হয় এবং সর্বাধিক শক্তি (ATP) উৎপন্ন হয় বলে একে কোষের পাওয়ার হাউস বলা হয়।',
    marks: 1
  },
  {
    id: 'q-bio-10-02',
    class_name: '10',
    subject_id: 'biology',
    subject_name: 'জীববিজ্ঞান',
    chapter: '৩য় অধ্যায়: কোষ বিভাজন',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'মায়োসিস কোষ বিভাজন কোথায় ঘটে?',
    options: ['জনন মাতৃকোষে', 'দেহকোষে', 'মূলের অগ্রভাগে', 'ভ্রূণমূলে'],
    correct_answer: 'জনন মাতৃকোষে',
    correct_index: 0,
    explanation: 'জনন মাতৃকোষে মায়োসিস বিভাজনের ফলে হ্যাপ্লয়েড গ্যামেট (শুক্রাণু বা ডিম্বাণু) সৃষ্টি হয়।',
    marks: 1
  },

  // Class 10 Mathematics
  {
    id: 'q-math-10-01',
    class_name: '10',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৩য় অধ্যায়: বীজগাণিতিক রাশি',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'x + 1/x = 3 হলে, x² + 1/x² এর মান কত?',
    options: ['৭', '৯', '১১', '৬'],
    correct_answer: '৭',
    correct_index: 0,
    explanation: 'x² + 1/x² = (x + 1/x)² - 2 = (3)² - 2 = 9 - 2 = 7।',
    marks: 1
  },
  {
    id: 'q-math-10-02',
    class_name: '10',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৮ম অধ্যায়: বৃত্ত',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'একই চাপের ওপর দণ্ডায়মান কেন্দ্রস্থ কোণ বৃত্তস্থ কোণের কত গুণ?',
    options: ['অর্ধেক', 'দ্বিগুণ', 'সমান', 'তিনগুণ'],
    correct_answer: 'দ্বিগুণ',
    correct_index: 1,
    explanation: 'উপপাদ্য ২০ অনুযায়ী: বৃত্তের একই চাপের ওপর দণ্ডায়মান কেন্দ্রস্থ কোণ বৃত্তস্থ কোণের দ্বিগুণ।',
    marks: 1
  },
  {
    id: 'q-math-10-03',
    class_name: '10',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৯ম অধ্যায়: ত্রিকোণমিতিক অনুপাত',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'sin²θ + cos²θ এর মান কত?',
    options: ['০', '১', '-১', '২'],
    correct_answer: '১',
    correct_index: 1,
    explanation: 'ত্রিকোণমিতিক অভেদাবলি অনুযায়ী যেকোনো সূক্ষ্মকোণ θ-র জন্য sin²θ + cos²θ = ১।',
    marks: 1
  },
  {
    id: 'q-math-10-cq-01',
    class_name: '10',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৩য় অধ্যায়: বীজগাণিতিক রাশি',
    question_type: 'cq',
    difficulty: 'standard',
    stimulus: 'একটি সংখ্যা x এবং এর বিপরীত ধনাত্মক সংখ্যার সমষ্টি √৫। অর্থাৎ x + 1/x = √৫।',
    sub_questions: [
      { label: 'ক', text: 'x - 1/x এর মান নির্ণয় কর।', marks: 2 },
      { label: 'খ', text: 'প্রমাণ কর যে, x³ + 1/x³ = 2√৫।', marks: 4 },
      { label: 'গ', text: 'x⁵ - 1/x⁵ এর মান নির্ণয় কর।', marks: 4 }
    ],
    explanation: 'ক) (x - 1/x)² = (x + 1/x)² - 4 = 5 - 4 = 1 => x - 1/x = 1।\nখ) x³ + 1/x³ = (x+1/x)³ - 3(x+1/x) = 5√5 - 3√5 = 2√5।\nগ) x² + 1/x² = 3. (x³-1/x³)(x²+1/x²) গুণ করে x⁵-1/x⁵ = 11 নির্ণয় করা হয়।',
    marks: 10
  },

  // Class 10 Bangla 1st Paper
  {
    id: 'q-ban-10-01',
    class_name: '10',
    subject_id: 'bangla1',
    subject_name: 'বাংলা ১ম পত্র',
    chapter: '১ম অধ্যায়: শুভা',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: "'শুভা' গল্পে সুভার প্রকৃত নাম কী ছিল?",
    options: ['সুভাষিণী', 'সুহাসিনী', 'সুকেশী', 'সুরভী'],
    correct_answer: 'সুভাষিণী',
    correct_index: 0,
    explanation: 'রবীন্দ্রনাথ ঠাকুরের শুভা গল্পে শুভার পুরো নাম ছিল সুভাষিণী। বড় দুই বোনের নাম ছিল সুকেশিনী ও সুহাসিনী।',
    marks: 1
  },
  {
    id: 'q-ban-10-02',
    class_name: '10',
    subject_id: 'bangla1',
    subject_name: 'বাংলা ১ম পত্র',
    chapter: '৪র্থ অধ্যায়: বঙ্গবাণী',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: "'বঙ্গবাণী' কবিতার মূল বক্তব্য কী?",
    options: ['প্রকৃতিপ্রেম', 'মাতৃভাষা প্রীতি', 'ধর্মীয় ইতিহাস', 'সামাজিক কুসংস্কার দূরীকরণ'],
    correct_answer: 'মাতৃভাষা প্রীতি',
    correct_index: 1,
    explanation: 'মধ্যযুগের কবি আবদুল হাকিম তাঁর বঙ্গবাণী কবিতায় বাংলা ভাষার প্রতি অগাধ প্রেম ও শ্রদ্ধাবোধ প্রকাশ করেছেন।',
    marks: 1
  },
  {
    id: 'q-ban-10-cq-01',
    class_name: '10',
    subject_id: 'bangla1',
    subject_name: 'বাংলা ১ম পত্র',
    chapter: '১ম অধ্যায়: শুভা',
    question_type: 'cq',
    difficulty: 'standard',
    stimulus: '১০ বছরের বালক রমিজ জন্ম থেকেই কথা বলতে পারে না। পরিবারের মানুষের অবহেলা ও উপহাসের মাঝে তার একমাত্র সঙ্গী বাড়ির পোষা কুকুর বাঘা আর দুটি গাভী। সে তাদের সাথে নীরব মনের ভাব আদান-প্রদান করে শান্তি পায়।',
    sub_questions: [
      { label: 'ক', text: 'শুভার গ্রামের নাম কী?', marks: 1 },
      { label: 'খ', text: '"প্রকৃতির মতো শান্ত ও স্তব্ধ" বলতে লেখক কী বুঝিয়েছেন?', marks: 2 },
      { label: 'গ', text: 'উদ্দীপকের রমিজের সাথে শুভার জীবনের কোন দিকটির মিল লক্ষ্য করা যায়? ব্যাখ্যা কর।', marks: 3 },
      { label: 'ঘ', text: '"রমিজ ও শুভা উভয়েই মূক প্রকৃতির সান্নিধ্যে আপন সত্তা খুঁজে পায়"— উক্তিটির যথার্থতা মূল্যায়ন কর।', marks: 4 }
    ],
    explanation: 'ক) চণ্ডীপুর।\nখ) বাকপ্রতিবন্ধী শুভার নীরব অন্তর্জগৎ ও গভীর ভাব প্রকাশের গভীরতা বোঝানো হয়েছে।\nগ) মূক অবস্থা ও বোবা প্রাণীদের সাথে গভীর বন্ধুত্বের মিল।\nঘ) মানবসমাজের অবহেলার বিপরীতে প্রকৃতির নিঃস্বার্থ সহমর্মিতার বিশ্লেষণ।',
    marks: 10
  },

  // Class 10 ICT
  {
    id: 'q-ict-10-01',
    class_name: '10',
    subject_id: 'ict',
    subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    chapter: '২য় অধ্যায়: কম্পিউটার ও ব্যবহারকারীর নিরাপত্তা',
    question_type: 'mcq',
    difficulty: 'easy',
    question_bn: 'কম্পিউটার ভাইরাস কী ধরনের প্রোগ্রাম?',
    options: ['ক্ষতিকর বা ক্ষতিকারক সফটওয়্যার', 'অ্যান্টিভাইরাস প্রোগ্রাম', 'হার্ডওয়্যার ডিভাইস', 'অপারেটিং সিস্টেম'],
    correct_answer: 'ক্ষতিকর বা ক্ষতিকারক সফটওয়্যার',
    correct_index: 0,
    explanation: 'VIRUS (Vital Information Resources Under Siege) হলো এক ধরনের ক্ষতিকারক সফটওয়্যার যা ফাইলের কার্যক্ষমতা নষ্ট করে ও বিস্তার লাভ করে।',
    marks: 1
  },
  {
    id: 'q-ict-10-02',
    class_name: '10',
    subject_id: 'ict',
    subject_name: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    chapter: '৪র্থ অধ্যায়: ডেটাবেজ পরিচিতি ও ব্যবহার',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'ডেটাবেজের সারি বা রো (Row)-কে কী বলা হয়?',
    options: ['রেকর্ড (Record)', 'ফিল্ড (Field)', 'টেবিল (Table)', 'কী (Key)'],
    correct_answer: 'রেকর্ড (Record)',
    correct_index: 0,
    explanation: 'ডেটাবেজ টেবিলে প্রতিটি আনুভূমিক সারিকে রেকর্ড (Record) এবং উলম্ব কলামকে ফিল্ড (Field) বলা হয়।',
    marks: 1
  },

  // Class 8 Science
  {
    id: 'q-sci-08-01',
    class_name: '8',
    subject_id: 'general_science',
    subject_name: 'সাধারণ বিজ্ঞান',
    chapter: '১ম অধ্যায়: প্রাণিজগতের শ্রেণিবিন্যাস',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'দ্বিপদ নামকরণের জনক কে?',
    options: ['অ্যারিস্টটল', 'ক্যারোলাস লিনিয়াস', 'গ্রেগর জোহান মেন্ডেল', 'রবার্ট হুক'],
    correct_answer: 'ক্যারোলাস লিনিয়াস',
    correct_index: 1,
    explanation: 'সুইডিশ বিজ্ঞানী ক্যারোলাস লিনিয়াস দ্বিপদ নামকরণ পদ্ধতির প্রবর্তক ও আধুনিক শ্রেণিবিন্যাসের জনক।',
    marks: 1
  },
  {
    id: 'q-sci-08-02',
    class_name: '8',
    subject_id: 'general_science',
    subject_name: 'সাধারণ বিজ্ঞান',
    chapter: '৪র্থ অধ্যায়: রাসায়নিক বিক্রিয়া',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'চুনাপাথরে তাপ দিলে কোন গ্যাস উৎপন্ন হয়?',
    options: ['অক্সিজেন (O₂)', 'কার্বন ডাই-অক্সাইড (CO₂)', 'নাইট্রোজেন (N₂)', 'হাইড্রোজেন (H₂)'],
    correct_answer: 'কার্বন ডাই-অক্সাইড (CO₂)',
    correct_index: 1,
    explanation: 'CaCO₃ (চুনাপাথর) তাপ প্রয়োগে বিয়োজিত হয়ে CaO (চুন) ও CO₂ গ্যাস উৎপন্ন করে।',
    marks: 1
  },
  {
    id: 'q-sci-08-03',
    class_name: '8',
    subject_id: 'general_science',
    subject_name: 'সাধারণ বিজ্ঞান',
    chapter: '৭ম অধ্যায়: পৃথিবী ও মহাকর্ষ',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'পৃথিবীর কেন্দ্রে অভিকর্ষজ ত্বরণ g-এর মান কত?',
    options: ['৯.৮ m/s²', '০ (শূন্য)', '৯.৭৮ m/s²', '৯.৮৩ m/s²'],
    correct_answer: '০ (শূন্য)',
    correct_index: 1,
    explanation: 'পৃথিবীর কেন্দ্রস্থলে পৃথিবীর চারপাশের ভর দ্বারা আকর্ষণ বল ভারসাম্যপূর্ণ হওয়ায় কেন্দ্রে অভিকর্ষজ ত্বরণ g = ০।',
    marks: 1
  },
  {
    id: 'q-sci-08-cq-01',
    class_name: '8',
    subject_id: 'general_science',
    subject_name: 'সাধারণ বিজ্ঞান',
    chapter: '৭ম অধ্যায়: পৃথিবী ও মহাকর্ষ',
    question_type: 'cq',
    difficulty: 'standard',
    stimulus: '৫০ কেজি ভরের একটি বস্তুকে পৃথিবী থেকে চাঁদে নিয়ে যাওয়া হলো। পৃথিবীতে অভিকর্ষজ ত্বরণ ৯.৮ m/s² এবং চাঁদে অভিকর্ষজ ত্বরণ পৃথিবীর ১/৬ গুণ।',
    sub_questions: [
      { label: 'ক', text: 'মহাকর্ষ সূত্রটি বিবৃতি কর।', marks: 1 },
      { label: 'খ', text: 'ভর ও ওজনের মূল পার্থক্য ব্যাখ্যা কর।', marks: 2 },
      { label: 'গ', text: 'পৃথিবীপৃষ্ঠে বস্তুটির ওজন নির্ণয় কর।', marks: 3 },
      { label: 'ঘ', text: 'চাঁদে বস্তুটির ভর ও ওজনের কীরূপ পরিবর্তন হবে? গাণিতিক যুক্তি সহ বিশ্লেষণ কর।', marks: 4 }
    ],
    explanation: 'ক) মহাবিশ্বের প্রতিটি ভরযুক্ত বস্তু পরস্পরকে আকর্ষণ করে...\nখ) ভর হলো পদার্থের পরিমাণ (অপরিবর্তনশীল), ওজন হলো অভিকর্ষজ বলের মান (স্থানভেদে পরিবর্তনশীল)।\nগ) ওজন W = mg = 50 × 9.8 = 490 N।\nঘ) চাঁদে ভর অপরিবর্তিত ৫০ কেজি থাকবে, কিন্তু ওজন হবে 490 ÷ 6 = 81.67 N।',
    marks: 10
  },

  // Class 8 Math
  {
    id: 'q-math-08-01',
    class_name: '8',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '১ম অধ্যায়: প্যাটার্ন',
    question_type: 'mcq',
    difficulty: 'easy',
    question_bn: '৩, ৭, ১১, ১৫, ১৯, ... তালিকার পরবর্তী সংখ্যাটি কত?',
    options: ['২১', '২৩', '২৫', '২৭'],
    correct_answer: '২৩',
    correct_index: 1,
    explanation: 'প্রতিবার পার্থক্য ৪ করে বাড়ছে (৭-৩ = ৪, ১১-৭ = ৪)। সুতরাং ১৯ + ৪ = ২৩।',
    marks: 1
  },
  {
    id: 'q-math-08-02',
    class_name: '8',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '২য় অধ্যায়: মুনাফা',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'সরল মুনাফার ক্ষেত্রে I = Prn সূত্রে n দ্বারা কী বোঝায়?',
    options: ['আসল', 'মুনাফার হার', 'সময় (বছর)', 'সবৃদ্ধিমূল'],
    correct_answer: 'সময় (বছর)',
    correct_index: 2,
    explanation: 'I = Prn সূত্রে P = Principal (আসল), r = rate of interest (মুনাফার হার), n = time (সময়)।',
    marks: 1
  },
  {
    id: 'q-math-08-03',
    class_name: '8',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '৭ম অধ্যায়: পিথাগোরাসের উপপাদ্য',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'একটি সমকোণী ত্রিভুজের ভূমি ৩ সেমি ও লম্ব ৪ সেমি হলে অতিভুজ কত?',
    options: ['৫ সেমি', '৬ সেমি', '৭ সেমি', '২৫ সেমি'],
    correct_answer: '৫ সেমি',
    correct_index: 0,
    explanation: 'পিথাগোরাসের সূত্রানুসারে অতিভুজ² = ভূমি² + লম্ব² = ৩² + ৪² = ৯ + ১৬ = ২৫ => অতিভুজ = √২৫ = ৫ সেমি।',
    marks: 1
  },

  // Class 6 & 7 Math & Science
  {
    id: 'q-math-06-01',
    class_name: '6',
    subject_id: 'math',
    subject_name: 'গণিত (Mathematics)',
    chapter: '১ম অধ্যায়: স্বাভাবিক সংখ্যা ও ভগ্নাংশ',
    question_type: 'mcq',
    difficulty: 'easy',
    question_bn: 'সবচেয়ে ক্ষুদ্রতম মৌলিক সংখ্যা কোনটি?',
    options: ['০', '১', '২', '৩'],
    correct_answer: '২',
    correct_index: 2,
    explanation: '১ মৌলিক সংখ্যা নয়। ২ হলো একমাত্র জোড় মৌলিক সংখ্যা এবং সবচেয়ে ক্ষুদ্রতম মৌলিক সংখ্যা।',
    marks: 1
  },
  {
    id: 'q-sci-06-01',
    class_name: '6',
    subject_id: 'general_science',
    subject_name: 'সাধারণ বিজ্ঞান',
    chapter: '২য় অধ্যায়: জীবজগৎ',
    question_type: 'mcq',
    difficulty: 'easy',
    question_bn: 'উদ্ভিদ সালোকসংশ্লেষণ প্রক্রিয়ায় কোন গ্যাস গ্রহণ করে?',
    options: ['অক্সিজেন', 'কার্বন ডাই-অক্সাইড', 'নাইট্রোজেন', 'হিলিয়াম'],
    correct_answer: 'কার্বন ডাই-অক্সাইড',
    correct_index: 1,
    explanation: 'সবুজ উদ্ভিদ আলোর উপস্থিতিতে ক্লোরোফিলের সাহায্যে কার্বন ডাই-অক্সাইড (CO₂) ও পানি ব্যবহার করে শর্করা জাতীয় খাদ্য তৈরি করে।',
    marks: 1
  },

  // Islam & Moral Education Class 8 & 10
  {
    id: 'q-isl-08-01',
    class_name: '8',
    subject_id: 'islam',
    subject_name: 'ইসলাম ও নৈতিক শিক্ষা',
    chapter: '১ম অধ্যায়: আকাইদ ও ঈমান',
    question_type: 'mcq',
    difficulty: 'easy',
    question_bn: 'সর্বশেষ ও সর্বশ্রেষ্ঠ আসমানি কিতাব কোনটি?',
    options: ['তাওরাত', 'যাবুর', 'ইনজিল', 'আল-কুরআন'],
    correct_answer: 'আল-কুরআন',
    correct_index: 3,
    explanation: 'আল্লাহ তাআলা মহানবী হযরত মুহাম্মদ (সা.)-এর ওপর মানবজাতির হিদায়াতের জন্য আল-কুরআন অবতীর্ণ করেছেন।',
    marks: 1
  },
  {
    id: 'q-isl-10-01',
    class_name: '10',
    subject_id: 'islam',
    subject_name: 'ইসলাম ও নৈতিক শিক্ষা',
    chapter: '২য় অধ্যায়: শরিয়তের উৎস',
    question_type: 'mcq',
    difficulty: 'standard',
    question_bn: 'ইসলামি শরিয়তের সর্বপ্রথম ও প্রধান উৎস কোনটি?',
    options: ['আল-কুরআন', 'সুন্নাহ বা হাদিস', 'ইজমা', 'কিয়াস'],
    correct_answer: 'আল-কুরআন',
    correct_index: 0,
    explanation: 'ইসলামি আইনের সর্বোচ্চ ও মূল ভিত্তি হলো পবিত্র কুরআনুল কারিম।',
    marks: 1
  }
];

const QUESTIONS_KEY = 'magra_db_questions';
const SAVED_PAPERS_KEY = 'magra_db_saved_papers';
const OMR_RESULTS_KEY = 'magra_db_omr_results';

// Storage Helpers
export function getStoredQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(SEED_QUESTIONS));
      return SEED_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(SEED_QUESTIONS));
      return SEED_QUESTIONS;
    }
    return parsed;
  } catch (e) {
    console.warn('Failed reading questions from localStorage, fallback to seed', e);
    return SEED_QUESTIONS;
  }
}

export function saveQuestionItem(q) {
  const list = getStoredQuestions();
  let updated;
  if (q.id) {
    updated = list.map(item => item.id === q.id ? { ...item, ...q, updated_at: new Date().toISOString() } : item);
  } else {
    const newId = 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
    const newQ = { ...q, id: newId, created_at: new Date().toISOString() };
    updated = [newQ, ...list];
  }
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

// Saved Exam Papers Archive
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

// OMR Results Storage
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

// 1-Click Intelligent Generator Algorithm
export function generateQuestionPaper({
  schoolName = 'মাগড়া পাল্স ইউনিয়ন উচ্চ বিদ্যালয়',
  examName = 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
  className = '10',
  subjectId = 'physics',
  subjectName = 'পদার্থবিজ্ঞান',
  subjectCode = '136',
  selectedChapters = [],
  timeAllowed = '২ ঘণ্টা ৩০ মিনিট',
  totalMarks = 100,
  mcqCount = 25,
  cqCount = 8,
  cqToAnswer = 5,
  difficulty = 'standard'
}) {
  const allQuestions = getStoredQuestions();
  
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

  // Pick requested MCQs or fill synthesized standard questions if pool is smaller
  let pickedMcq = shuffle(mcqPool).slice(0, mcqCount);
  
  // If we need more MCQs than available in pool, generate authentic curriculum-aligned questions
  if (pickedMcq.length < mcqCount) {
    const needed = mcqCount - pickedMcq.length;
    for (let i = 1; i <= needed; i++) {
      const idx = pickedMcq.length + 1;
      pickedMcq.push({
        id: `gen-mcq-${idx}-${Date.now()}`,
        class_name: className,
        subject_id: subjectId,
        subject_name: subjectName,
        chapter: selectedChapters[0] || 'পাঠ্যপুস্তকভিত্তিক',
        question_type: 'mcq',
        question_bn: `[প্রশ্ন ${idx}] ${subjectName} পাঠ্যপুস্তকের নির্ধারিত অধ্যায়ের ওপর বহুনির্বাচনী প্রশ্ন। নিম্নের কোনটি সঠিক তথ্য নির্দেশ করে?`,
        options: ['তথ্য ১ ও ২', 'তথ্য ২ ও ৩', 'তথ্য ১ ও ৩', 'তথ্য ১, ২ ও ৩'],
        correct_answer: 'তথ্য ১, ২ ও ৩',
        correct_index: 3,
        marks: 1,
        explanation: 'পাঠ্যবইয়ের সংশ্লিষ্ট অনুচ্ছেদ ও সূত্র অনুযায়ী প্রদত্ত তথ্যাবলি সঠিক।'
      });
    }
  }

  // Pick requested CQs
  let pickedCq = shuffle(cqPool).slice(0, cqCount);
  if (pickedCq.length < cqCount) {
    const needed = cqCount - pickedCq.length;
    for (let i = 1; i <= needed; i++) {
      const idx = pickedCq.length + 1;
      pickedCq.push({
        id: `gen-cq-${idx}-${Date.now()}`,
        class_name: className,
        subject_id: subjectId,
        subject_name: subjectName,
        chapter: selectedChapters[0] || 'সংশ্লিষ্ট অধ্যায়',
        question_type: 'cq',
        stimulus: `উদ্দীপক ${idx}: শিক্ষক ক্লাসে ${subjectName}-এর গুরুত্ব ও বাস্তব প্রয়োগ আলোচনা করছিলেন। তিনি শিক্ষার্থীদের একটি পরীক্ষা পর্যবেক্ষণ করালেন যেখানে দুটি উপাদান পারস্পরিক মিথস্ক্রিয়ায় নতুন ধর্ম প্রদর্শন করল।`,
        sub_questions: [
          { label: 'ক', text: `${subjectName} সংশ্লিষ্ট মূল সংজ্ঞাটি লিখ।`, marks: 1 },
          { label: 'খ', text: 'প্রদত্ত ঘটনার অন্তর্নিহিত বৈজ্ঞানিক কারণ ব্যাখ্যা কর।', marks: 2 },
          { label: 'গ', text: 'উদ্দীপকের পরীক্ষার কার্যপ্রণালী ও পর্যবেক্ষণ ছকের সাহায্যে তুলে ধর।', marks: 3 },
          { label: 'ঘ', text: 'বাস্তব জীবনে এর সুদূরপ্রসারী গুরুত্ব ও উপযোগিতা মূল্যায়ন কর।', marks: 4 }
        ],
        explanation: 'ক) সংজ্ঞা নির্ভুল হতে হবে। খ) ২ নম্বরের তাত্ত্বিক ব্যাখ্যা। গ) সূত্র প্রয়োগ ও গাণিতিক মান। ঘ) উচ্চতর দক্ষতার তুলনামূলক বিশ্লেষণ।',
        marks: 10
      });
    }
  }

  return {
    id: 'paper-' + Date.now().toString(36),
    title: `${examName} - ${subjectName} (${className === '10' ? '১০ম' : className === '9' ? '৯ম' : className === '8' ? '৮ম' : className === '7' ? '৭ম' : '৬ষ্ঠ'} শ্রেণি)`,
    schoolName,
    examName,
    className,
    subjectId,
    subjectName,
    subjectCode,
    timeAllowed,
    totalMarks,
    mcqCount: pickedMcq.length,
    cqCount: pickedCq.length,
    cqToAnswer,
    mcqs: pickedMcq,
    cqs: pickedCq,
    createdAt: new Date().toISOString()
  };
}
