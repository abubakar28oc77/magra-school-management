// frontend/src/pptxGenerator.js
// High Quality 18-Slide PowerPoint (.pptx) Generator for Magra Pals Union High School
// Uses pptxgenjs to build native widescreen (16:9) presentations directly in the browser

import pptxgen from 'pptxgenjs';

// Color Palette
const COLORS = {
  primary: '075C3A',      // Magra Deep Forest Green
  primaryDark: '043B25',  // Very dark green
  primaryLight: 'ECFDF5', // Mint soft bg
  secondary: '0284C7',    // Vibrant Academic Blue
  accent: 'D97706',       // Amber Gold
  textDark: '0F172A',     // Slate 900
  textMuted: '475569',    // Slate 600
  white: 'FFFFFF',
  cardBg: 'F8FAFC',       // Slate 50
  cardBorder: 'CBD5E1',   // Slate 300
  quizBg: 'FEF3C7',       // Amber 100
  groupBg: 'EFF6FF'       // Blue 50
};

export async function downloadLessonPresentationPPTX({
  className,
  subject,
  chapter,
  topic,
  duration,
  studentCount,
  teacherName,
  teacherDesignation,
  schoolName = 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়',
  slidesData
}) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = teacherName || 'সহকারী শিক্ষক';
  pres.company = schoolName;
  pres.title = `${subject} - ${topic} (শ্রেণি: ${className})`;

  // Master Slide Template Helper
  const applyHeaderFooter = (slide, slideNumber, totalSlides = 18, slideTitle = '') => {
    // Header Banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 10, h: 0.85,
      fill: { color: COLORS.primary },
      line: { color: COLORS.primaryDark, width: 1 }
    });

    slide.addText(schoolName, {
      x: 0.6, y: 0.12, w: 6.0, h: 0.35,
      fontSize: 13, bold: true, color: 'FFD34F', fontFace: 'Arial'
    });

    slide.addText(`মাল্টিমিডিয়া ক্লাসরুম • শ্রেণি: ${className}ম | বিষয়: ${subject}`, {
      x: 0.6, y: 0.45, w: 6.0, h: 0.3,
      fontSize: 10, color: 'FFFFFF', fontFace: 'Arial'
    });

    if (slideTitle) {
      slide.addText(slideTitle, {
        x: 6.6, y: 0.2, w: 2.8, h: 0.45,
        fontSize: 12, bold: true, color: 'FFFFFF', align: 'right', fontFace: 'Arial'
      });
    }

    // Footer
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 5.25, w: 10, h: 0.38,
      fill: { color: 'F1F5F9' },
      line: { color: 'E2E8F0', width: 0.5 }
    });

    slide.addText(`পাঠের বিষয়: ${topic} | সময়: ${duration}`, {
      x: 0.6, y: 5.3, w: 6.0, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: 'Arial'
    });

    slide.addText(`স্লাইড ${slideNumber} / ${totalSlides}`, {
      x: 7.5, y: 5.3, w: 1.9, h: 0.28,
      fontSize: 9, bold: true, color: COLORS.primary, align: 'right', fontFace: 'Arial'
    });
  };

  // =========================================================================
  // স্লাইড ১: পাঠ সংশ্লিষ্ট ছবির মাধ্যমে শিক্ষার্থীদের স্বাগত জানানোর স্লাইড
  // =========================================================================
  const s1 = pres.addSlide();
  s1.background = { color: COLORS.primaryDark };

  // Decorative Accent Shapes
  s1.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 0.5, w: 9.0, h: 4.6,
    fill: { color: '064E3B' },
    line: { color: '10B981', width: 2 }
  });

  s1.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 0.8, w: 8.0, h: 0.6,
    fill: { color: '0284C7' },
    line: { color: 'FFFFFF', width: 1.5 }
  });
  s1.addText('🌸 আজকের ডিজিটাল মাল্টিমিডিয়া ক্লাসে সবাইকে স্বাগতম! 🌸', {
    x: 1.0, y: 0.85, w: 8.0, h: 0.5,
    fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
  });

  // Topic Visual & Focus Box
  s1.addShape(pres.ShapeType.roundRect, {
    x: 1.2, y: 1.6, w: 7.6, h: 2.2,
    fill: { color: 'FFFFFF' },
    line: { color: 'CBD5E1', width: 1 }
  });

  s1.addText('📚 পাঠের মূল ক্ষেত্র', {
    x: 1.5, y: 1.8, w: 7.0, h: 0.35,
    fontSize: 12, bold: true, color: COLORS.secondary, align: 'center'
  });

  s1.addText(topic, {
    x: 1.5, y: 2.2, w: 7.0, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.primary, align: 'center', fontFace: 'Arial'
  });

  s1.addText(`অধ্যায়: ${chapter} • শ্রেণি: ${className}ম • বিষয়: ${subject}`, {
    x: 1.5, y: 3.0, w: 7.0, h: 0.4,
    fontSize: 13, bold: true, color: COLORS.textMuted, align: 'center', fontFace: 'Arial'
  });

  s1.addText(schoolName, {
    x: 1.0, y: 4.2, w: 8.0, h: 0.5,
    fontSize: 17, bold: true, color: 'FFD34F', align: 'center', fontFace: 'Arial'
  });

  // =========================================================================
  // স্লাইড ২: পরিচিতি স্লাইড (শ্রেণি, বিষয়, পাঠের বিষয়, বিদ্যালয়ের নাম ও শিক্ষক)
  // =========================================================================
  const s2 = pres.addSlide();
  s2.background = { color: 'FAFAFA' };
  applyHeaderFooter(s2, 2, 18, 'পরিচিতি পর্ব');

  // Teacher Card (Left)
  s2.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 1.1, w: 4.1, h: 3.8,
    fill: { color: 'F0FDF4' },
    line: { color: '86EFAC', width: 1.5 }
  });
  s2.addText('👨‍🏫 শিক্ষক পরিচিতি', {
    x: 0.9, y: 1.3, w: 3.7, h: 0.45,
    fontSize: 16, bold: true, color: COLORS.primary
  });
  s2.addText(`নাম: ${teacherName || 'মুহাম্মদ আবুবকর সিদ্দিক'}\nপদবি: ${teacherDesignation || 'সহকারী শিক্ষক (আইসিটি ও বিজ্ঞান)'}\nপ্রতিষ্ঠান: ${schoolName}\nমোবাইল / যোগাযোগ: অত্র বিদ্যালয় কার্যালয়`, {
    x: 0.9, y: 1.85, w: 3.7, h: 2.8,
    fontSize: 13, color: COLORS.textDark, fontFace: 'Arial', lineSpacing: 24
  });

  // Class Card (Right)
  s2.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 1.1, w: 4.1, h: 3.8,
    fill: { color: 'F0F9FF' },
    line: { color: '7DD3FC', width: 1.5 }
  });
  s2.addText('📖 পাঠ পরিচিতি', {
    x: 5.4, y: 1.3, w: 3.7, h: 0.45,
    fontSize: 16, bold: true, color: COLORS.secondary
  });
  s2.addText(`শ্রেণি: ${className}ম শ্রেণি\nবিষয়: ${subject}\nঅধ্যায়: ${chapter}\nআজকের পাঠ: ${topic}\nসময়কাল: ${duration}\nশ্রেণিতে শিক্ষার্থী সংখ্যা: ${studentCount} জন`, {
    x: 5.4, y: 1.85, w: 3.7, h: 2.8,
    fontSize: 13, color: COLORS.textDark, fontFace: 'Arial', lineSpacing: 24
  });

  // =========================================================================
  // স্লাইড ৩: ব্রেনস্টর্মিং / পূর্বজ্ঞান যাচাই
  // =========================================================================
  const s3 = pres.addSlide();
  s3.background = { color: 'FAFAFA' };
  applyHeaderFooter(s3, 3, 18, 'পূর্বজ্ঞান যাচাই');

  s3.addText('🤔 ব্রেনস্টর্মিং ও পূর্বজ্ঞান যাচাই (ছবি ও প্রশ্ন পর্যবেক্ষণ)', {
    x: 0.7, y: 1.05, w: 8.6, h: 0.45,
    fontSize: 16, bold: true, color: COLORS.primary
  });

  const bQuestions = slidesData?.slide3_brainstorming || [
    '১. আমরা দৈনন্দিন জীবনে এই বিষয়টি কোথায় লক্ষ্য করি বা অনুভব করি?',
    '২. পূর্ববর্তী শ্রেণিতে এ সম্পর্কে আমাদের কী অভিজ্ঞতা ছিল?',
    '৩. এটি আমাদের চারপাশে কীভাবে কাজ করে বলে আপনারা মনে করেন?'
  ];

  bQuestions.forEach((q, idx) => {
    s3.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 1.65 + (idx * 1.05), w: 8.6, h: 0.9,
      fill: { color: idx === 0 ? 'FEF3C7' : idx === 1 ? 'E0F2FE' : 'ECFDF5' },
      line: { color: 'CBD5E1', width: 1 }
    });
    s3.addText(q, {
      x: 0.9, y: 1.75 + (idx * 1.05), w: 8.2, h: 0.7,
      fontSize: 13.5, bold: true, color: COLORS.textDark
    });
  });

  // =========================================================================
  // স্লাইড ৪: পাঠের শিরোনাম ঘোষণা ও ৩টি নির্দিষ্ট শিখনফল
  // =========================================================================
  const s4 = pres.addSlide();
  s4.background = { color: 'FAFAFA' };
  applyHeaderFooter(s4, 4, 18, 'পাঠ ঘোষণা ও শিখনফল');

  s4.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 1.05, w: 8.6, h: 0.7,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primaryDark, width: 1 }
  });
  s4.addText(`আজকের পাঠের শিরোনাম: "${topic}"`, {
    x: 0.8, y: 1.15, w: 8.4, h: 0.5,
    fontSize: 16, bold: true, color: 'FFFFFF', align: 'center'
  });

  s4.addText('🎯 পাঠ শেষে শিক্ষার্থীরা যা যা অর্জন করবে (৩টি সুনির্দিষ্ট শিখনফল):', {
    x: 0.7, y: 1.85, w: 8.6, h: 0.35,
    fontSize: 13.5, bold: true, color: COLORS.secondary
  });

  const outcomes = slidesData?.slide4_outcomes || [
    { type: '১. জ্ঞানমূলক শিখনফল', text: `${topic} এর মৌলিক সংজ্ঞা, ধারণা ও মূল পরিভাষাগুলো স্পষ্ট ভাষায় বলতে পারবে।`, color: 'D97706', bg: 'FEF3C7' },
    { type: '২. দক্ষতামূলক শিখনফল', text: `এর মূল বৈশিষ্ট্য, চিত্র ও তাত্ত্বিক নিয়মের বিশ্লেষণ ও খাতায় উপস্থাপন করতে পারবে।`, color: '0284C7', bg: 'E0F2FE' },
    { type: '৩. প্রয়োগমূলক শিখনফল', text: `বাস্তব জীবনে এর উপযোগিতা ও সমস্যা সমাধানে সঠিক প্রয়োগ প্রদর্শন করতে পারবে।`, color: '059669', bg: 'ECFDF5' }
  ];

  outcomes.forEach((out, idx) => {
    s4.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 2.3 + (idx * 0.95), w: 8.6, h: 0.85,
      fill: { color: out.bg },
      line: { color: 'CBD5E1', width: 1 }
    });
    s4.addText(out.type, {
      x: 0.9, y: 2.38 + (idx * 0.95), w: 8.2, h: 0.28,
      fontSize: 12, bold: true, color: out.color
    });
    s4.addText(`• ${out.text}`, {
      x: 0.9, y: 2.68 + (idx * 0.95), w: 8.2, h: 0.42,
      fontSize: 13, color: COLORS.textDark
    });
  });

  // =========================================================================
  // স্লাইড ৫: মূল ধারণার সূচনা ও সংজ্ঞা (Core Concept & Definition)
  // =========================================================================
  const s5 = pres.addSlide();
  s5.background = { color: 'FAFAFA' };
  applyHeaderFooter(s5, 5, 18, 'মূল ধারণার সূচনা');
  s5.addText('💡 মূল ধারণার সূচনা ও প্রমিত সংজ্ঞা', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s5.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.55, w: 8.6, h: 1.5, fill: { color: 'F0FDF4' }, line: { color: '86EFAC', width: 1 } });
  s5.addText(slidesData?.slide5_definition || `${topic} বলতে এমন এক সার্বিক শিক্ষণীয় প্রক্রিয়া বা বৈজ্ঞানিক/তাত্ত্বিক ভিত্তিকে বোঝায়, যা সংশ্লিষ্ট বিষয়ের ভিত্তিপ্রস্তর স্থাপন করে। এটি বাস্তব জগতের নিয়মের সাথে সরাসরি সম্পর্কিত।`, {
    x: 0.9, y: 1.7, w: 8.2, h: 1.2, fontSize: 14, color: COLORS.textDark, lineSpacing: 24
  });
  s5.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 3.2, w: 8.6, h: 1.7, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
  s5.addText('📌 সংজ্ঞার মূল ৩টি বৈশিষ্ট্য:\n১. সুস্পষ্ট ও বৈজ্ঞানিক ভিত্তি সম্পন্ন\n২. সহজে পর্যবেক্ষণযোগ্য ও বাস্তব অভিজ্ঞতা নির্ভর\n৩. পরবর্তী উচ্চতর জ্ঞান অর্জনের মূল সোপান', {
    x: 0.9, y: 3.35, w: 8.2, h: 1.4, fontSize: 13, color: COLORS.textDark, lineSpacing: 22
  });

  // =========================================================================
  // স্লাইড ৬: বিশদ ও চিত্রভিত্তিক বিশ্লেষণ (Detailed Breakdown)
  // =========================================================================
  const s6 = pres.addSlide();
  s6.background = { color: 'FAFAFA' };
  applyHeaderFooter(s6, 6, 18, 'বিশদ বিশ্লেষণ');
  s6.addText('🔍 চিত্রভিত্তিক ও উপাদানভিত্তিক বিশদ বিশ্লেষণ', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  const pointsS6 = slidesData?.slide6_points || [
    { title: 'উপাদান ১: কাঠামোগত ভিত্তি', desc: 'বিষয়ের মৌলিক একক ও উপাদানের পারস্পরিক সম্পর্ক।' },
    { title: 'উপাদান ২: কার্যপ্রণালী ও মিথস্ক্রিয়া', desc: 'যেভাবে প্রতিটি অংশ সামগ্রিকভাবে কাজ করে।' },
    { title: 'উপাদান ৩: পর্যবেক্ষণ ও ফলাফল', desc: 'প্রক্রিয়া শেষে চূড়ান্ত প্রভাব বা সমাধান।' }
  ];
  pointsS6.forEach((pt, idx) => {
    s6.addShape(pres.ShapeType.roundRect, {
      x: 0.7 + (idx * 2.95), y: 1.6, w: 2.75, h: 3.3,
      fill: { color: idx === 1 ? 'EFF6FF' : 'FFFFFF' },
      line: { color: idx === 1 ? '3B82F6' : 'CBD5E1', width: idx === 1 ? 2 : 1 }
    });
    s6.addText(pt.title, { x: 0.85 + (idx * 2.95), y: 1.8, w: 2.45, h: 0.6, fontSize: 13, bold: true, color: COLORS.secondary });
    s6.addText(pt.desc, { x: 0.85 + (idx * 2.95), y: 2.5, w: 2.45, h: 2.2, fontSize: 12, color: COLORS.textDark });
  });

  // =========================================================================
  // স্লাইড ৭: তাত্ত্বিক নিয়ম / সূত্রাবলী / বৈজ্ঞানিক ব্যাখ্যা
  // =========================================================================
  const s7 = pres.addSlide();
  s7.background = { color: 'FAFAFA' };
  applyHeaderFooter(s7, 7, 18, 'নিয়ম ও সূত্রাবলী');
  s7.addText('📐 তাত্ত্বিক নিয়ম, সমীকরণ ও বৈজ্ঞানিক ভিত্তি', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s7.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 1.4, fill: { color: 'FEF3C7' }, line: { color: 'F59E0B', width: 1.5 } });
  s7.addText(slidesData?.slide7_formula || `মূল সূত্র / নীতি: ${topic} এর গাণিতিক সমীকরণ ও নিয়মাবলী জাতীয় শিক্ষাক্রম মানদণ্ড অনুযায়ী পরিচালিত হয়।`, {
    x: 0.9, y: 1.8, w: 8.2, h: 1.0, fontSize: 14, bold: true, color: '92400E'
  });
  s7.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 3.15, w: 8.6, h: 1.8, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
  s7.addText('🔬 সূত্রের তাৎপর্য ও ব্যাখ্যা:\n• প্রতিটি চলকের অর্থ ও আন্তর্জাতিক একক (SI Unit) সঠিকভাবে জানা আবশ্যক।\n• শর্ত ও সীমার বাইরে এই সূত্র সরাসরি প্রযোজ্য নাও হতে পারে।\n• সমস্যার সমাধানে এককের সমতা যাচাই অত্যন্ত গুরুত্বপূর্ণ।', {
    x: 0.9, y: 3.3, w: 8.2, h: 1.5, fontSize: 13, color: COLORS.textDark, lineSpacing: 22
  });

  // =========================================================================
  // স্লাইড ৮: ধারাবাহিক ধাপ ও কার্যপ্রক্রিয়া (Step-by-Step Flow)
  // =========================================================================
  const s8 = pres.addSlide();
  s8.background = { color: 'FAFAFA' };
  applyHeaderFooter(s8, 8, 18, 'কার্যপ্রক্রিয়া');
  s8.addText('🔄 ধারাবাহিক পদক্ষেপ ও কার্যপ্রক্রিয়া (Step-by-Step Flow)', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  const steps = [
    { num: 'ধাপ ১', text: 'প্রদত্ত তথ্য ও উপাত্ত পর্যবেক্ষণ ও চিহ্নিতকরণ' },
    { num: 'ধাপ ২', text: 'সঠিক নিয়ম বা সূত্র নির্বাচন' },
    { num: 'ধাপ ৩', text: 'ধাপে ধাপে বিশ্লেষণ ও রূপান্তর' },
    { num: 'ধাপ ৪', text: 'ফলাফল যাচাই ও চূড়ান্ত সিদ্ধান্ত গ্রহণ' }
  ];
  steps.forEach((st, idx) => {
    s8.addShape(pres.ShapeType.roundRect, {
      x: 0.7 + (idx * 2.2), y: 1.8, w: 2.0, h: 2.8,
      fill: { color: 'FFFFFF' }, line: { color: '0284C7', width: 1.5 }
    });
    s8.addShape(pres.ShapeType.oval, {
      x: 1.35 + (idx * 2.2), y: 2.0, w: 0.7, h: 0.7,
      fill: { color: COLORS.secondary }
    });
    s8.addText(String(idx + 1), {
      x: 1.35 + (idx * 2.2), y: 2.1, w: 0.7, h: 0.5,
      fontSize: 14, bold: true, color: 'FFFFFF', align: 'center'
    });
    s8.addText(st.num, { x: 0.8 + (idx * 2.2), y: 2.85, w: 1.8, h: 0.35, fontSize: 12, bold: true, color: COLORS.primary, align: 'center' });
    s8.addText(st.text, { x: 0.8 + (idx * 2.2), y: 3.25, w: 1.8, h: 1.2, fontSize: 11, color: COLORS.textDark, align: 'center' });
  });

  // =========================================================================
  // স্লাইড ৯: বাস্তব জীবনের সাথে সংযোগ ও প্রয়োগ (Real-world Applications)
  // =========================================================================
  const s9 = pres.addSlide();
  s9.background = { color: 'FAFAFA' };
  applyHeaderFooter(s9, 9, 18, 'বাস্তব প্রয়োগ');
  s9.addText('🌍 বাস্তব জীবনের সাথে সংযোগ ও উপযোগিতা', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  const realApps = slidesData?.slide9_applications || [
    '১. দৈনন্দিন কার্যকলাপে সময় ও শক্তির সঠিক ব্যবহারে এর ভূমিকা অপরিসীম।',
    '২. আধুনিক প্রযুক্তি, চিকিৎসা ও যন্ত্রপাতির পরিচালনায় এর প্রত্যক্ষ অবদান রয়েছে।',
    '৩. পরিবেশের ভারসাম্য রক্ষা ও বাস্তব জীবনের কঠিন সমস্যা সমাধানে এটি সহায়তা করে।'
  ];
  realApps.forEach((app, idx) => {
    s9.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 1.6 + (idx * 1.1), w: 8.6, h: 0.95,
      fill: { color: 'ECFDF5' }, line: { color: '6EE7B7', width: 1 }
    });
    s9.addText(`✨ বাস্তব দৃষ্টান্ত ${idx + 1}:\n${app}`, {
      x: 0.9, y: 1.7 + (idx * 1.1), w: 8.2, h: 0.75,
      fontSize: 13, bold: true, color: COLORS.primary
    });
  });

  // =========================================================================
  // স্লাইড ১০: কেস স্টাডি ও বাস্তব সমস্যা সমাধান
  // =========================================================================
  const s10 = pres.addSlide();
  s10.background = { color: 'FAFAFA' };
  applyHeaderFooter(s10, 10, 18, 'কেস স্টাডি');
  s10.addText('💼 কেস স্টাডি ও বাস্তব সমস্যা সমাধান', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s10.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 1.6, fill: { color: 'F0F9FF' }, line: { color: '7DD3FC', width: 1.5 } });
  s10.addText('📋 পরিস্থিতি / বাস্তব সমস্যা:', { x: 0.9, y: 1.75, w: 8.2, h: 0.35, fontSize: 13, bold: true, color: COLORS.secondary });
  s10.addText(slidesData?.slide10_scenario || `ধরুন, আপনি অত্র বিদ্যালয়ে একটি প্রকল্প পরিচালনায় যুক্ত আছেন এবং ${topic} সংক্রান্ত একটি জটিল চ্যালেঞ্জের মুখোমুখি হয়েছেন। আপনি কীভাবে ধাপে ধাপে এটি সমাধান করবেন?`, {
    x: 0.9, y: 2.15, w: 8.2, h: 0.95, fontSize: 13, color: COLORS.textDark
  });
  s10.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 3.35, w: 8.6, h: 1.6, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
  s10.addText('💡 আদর্শ সমাধানের যৌক্তিক উপায়:\n• সঠিক তথ্য সংগ্রহ ও পূর্বশর্ত যাচাই করা।\n• নিয়মতান্ত্রিক পদ্ধতির প্রয়োগ ও ত্রুটি এড়িয়ে চলা।\n• দলগত মতামত গ্রহণ ও সর্বোত্তম বিকল্প বাস্তবায়ন।', {
    x: 0.9, y: 3.5, w: 8.2, h: 1.35, fontSize: 12.5, color: COLORS.textDark, lineSpacing: 22
  });

  // =========================================================================
  // স্লাইড ১১: একক কাজ — ২ মিনিটের কুইজ (Individual Check)
  // =========================================================================
  const s11 = pres.addSlide();
  s11.background = { color: 'FAFAFA' };
  applyHeaderFooter(s11, 11, 18, 'একক কাজ');
  s11.addText('✍️ একক কাজ (সময়: ২ মিনিট) — প্রতিটি শিক্ষার্থী খাতায় লিখবে', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s11.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 3.3, fill: { color: 'FFFBEB' }, line: { color: 'FCD34D', width: 2 } });
  s11.addText('📝 প্রশ্ন ১: আজকের পাঠ অনুযায়ী এর প্রধান বৈশিষ্ট্যটি ১ বাক্যে লিখুন।\n\n📝 প্রশ্ন ২: এর বাস্তব জীবনে প্রযোজ্য ১টি উদাহরণ খাতায় নোট করুন।\n\n⏱️ নির্দেশিকা:\n• কোনো সহপাঠীর সাহায্য ছাড়া নিজে চিন্তা করে লিখুন।\n• সময় শেষ হলে শিক্ষক র‍্যান্ডমভাবে ৩ জনের খাতা পর্যবেক্ষণ করবেন।', {
    x: 1.0, y: 1.85, w: 8.0, h: 2.8, fontSize: 14, color: '78350F', lineSpacing: 24
  });

  // =========================================================================
  // স্লাইড ১২: দলগত কাজ (শিক্ষার্থীর সংখ্যার ভিত্তিতে দল বণ্টন)
  // =========================================================================
  const s12 = pres.addSlide();
  s12.background = { color: 'FAFAFA' };
  applyHeaderFooter(s12, 12, 18, 'দলগত কাজ');

  const count = parseInt(studentCount, 10) || 50;
  const groupSize = count > 55 ? 6 : count > 35 ? 5 : 4;
  const groupTotal = Math.ceil(count / groupSize);

  s12.addText(`👥 দলগত কাজ (শ্রেণিতে শিক্ষার্থী: ${count} জন • ${groupSize} জন করে মোট ${groupTotal}টি দল)`, {
    x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 15, bold: true, color: COLORS.primary
  });

  const groupTasks = [
    { team: 'দল-১ (পদ্মা)', task: `${topic} এর প্রধান সুবিধা ও গুরুত্বের একটি তালিকা তৈরি করুন।` },
    { team: 'দল-২ (মেঘনা)', task: `এর প্রয়োগে সম্ভাব্য চ্যালেঞ্জ ও সমাধানের উপায় লিপিবদ্ধ করুন।` },
    { team: 'দল-৩ (যমুনা)', task: `বাস্তব উদাহরণের সাহায্যে একটি ডায়াগ্রাম বা চার্ট অঙ্কন করুন।` },
    { team: 'দল-৪ (সুরমা)', task: `দৈনন্দিন জীবনে এর ভুল প্রয়োগ থেকে বাঁচার উপায় লিখুন।` }
  ];

  groupTasks.forEach((gt, idx) => {
    s12.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 1.6 + (idx * 0.85), w: 8.6, h: 0.75,
      fill: { color: idx % 2 === 0 ? 'EFF6FF' : 'F0FDF4' },
      line: { color: 'CBD5E1', width: 1 }
    });
    s12.addText(`🏷️ ${gt.team}: ${gt.task}`, {
      x: 0.9, y: 1.72 + (idx * 0.85), w: 8.2, h: 0.5,
      fontSize: 12.5, bold: true, color: COLORS.textDark
    });
  });

  // =========================================================================
  // স্লাইড ১৩: দলীয় কাজের উপস্থাপন ও সমাধান
  // =========================================================================
  const s13 = pres.addSlide();
  s13.background = { color: 'FAFAFA' };
  applyHeaderFooter(s13, 13, 18, 'দলীয় উপস্থাপন');
  s13.addText('🎤 দলীয় কাজের উপস্থাপন ও চূড়ান্ত ফিডব্যাক', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s13.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 3.3, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
  s13.addText('📢 উপস্থাপন পর্বের সারসংক্ষেপ:\n• প্রতিটি দল থেকে দলনেতা ১ মিনিটে তাদের সমাধান উপস্থাপন করেছেন।\n• অন্যান্য দলের সদস্যরা গঠনমূলক প্রশ্ন ও মতামত দিয়েছেন।\n\n👨‍🏫 শিক্ষকের সিদ্ধান্ত ও সংশোধন:\n• প্রতিটি দলের প্রচেষ্টাই প্রশংসনীয় ছিল।\n• উপস্থাপিত তথ্যের পরিমার্জিত রূপ বোর্ডে সংরক্ষণ করা হলো।', {
    x: 0.9, y: 1.85, w: 8.2, h: 2.8, fontSize: 13.5, color: COLORS.textDark, lineSpacing: 24
  });

  // =========================================================================
  // স্লাইড ১৪: শিখন যাচাই ও মূল্যায়ন প্রশ্ন (মৌখিক ও সংক্ষিপ্ত)
  // =========================================================================
  const s14 = pres.addSlide();
  s14.background = { color: 'FAFAFA' };
  applyHeaderFooter(s14, 14, 18, 'শিখন যাচাই');
  s14.addText('❓ শিখন যাচাই — মৌখিক ও সংক্ষিপ্ত মূল্যায়ন', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  const evalQuestions = slidesData?.slide14_questions || [
    '১. আজকের পাঠের সবচেয়ে গুরুত্বপূর্ণ মূলনীতিটি কী?',
    '২. এর ব্যবহারিক ক্ষেত্রে আমরা কী কী সতর্কতা অবলম্বন করব?',
    '৩. এই বিষয়টির সাথে আমাদের পূর্ববর্তী পাঠের সংযোগ কোথায়?'
  ];
  evalQuestions.forEach((q, idx) => {
    s14.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 1.65 + (idx * 1.05), w: 8.6, h: 0.9,
      fill: { color: 'F1F5F9' }, line: { color: '94A3B8', width: 1 }
    });
    s14.addText(`প্রশ্ন ${idx + 1}: ${q}`, {
      x: 0.9, y: 1.8 + (idx * 1.05), w: 8.2, h: 0.6,
      fontSize: 13.5, bold: true, color: COLORS.primary
    });
  });

  // =========================================================================
  // স্লাইড ১৫: বহু-নির্বাচনী কুইজ (MCQ Practice with Instant Answer)
  // =========================================================================
  const s15 = pres.addSlide();
  s15.background = { color: 'FAFAFA' };
  applyHeaderFooter(s15, 15, 18, 'MCQ কুইজ');
  s15.addText('📝 বহুনির্বাচনি কুইজ (MCQ) — দ্রুত হাত তুলে উত্তর দিন', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s15.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 3.3, fill: { color: 'FEF3C7' }, line: { color: 'F59E0B', width: 1.5 } });
  s15.addText(slidesData?.slide15_mcq?.question || `প্রশ্ন: "${topic}" সম্পর্কে নিচের কোন বক্তব্যটি পুরোপুরি সঠিক?\n\n(ক) এটি কোনো সুনির্দিষ্ট নিয়ম মানে না\n(খ) এটি বৈজ্ঞানিক নীতি ও বাস্তব পর্যবেক্ষণের ওপর প্রতিষ্ঠিত\n(গ) এর কোনো প্রায়োগিক উপযোগিতা নেই\n(ঘ) এটি কেবলমাত্র উচ্চতর ক্লাসেই প্রযোজ্য`, {
    x: 0.9, y: 1.8, w: 8.2, h: 2.0, fontSize: 14, bold: true, color: '92400E', lineSpacing: 22
  });
  s15.addShape(pres.ShapeType.roundRect, { x: 1.0, y: 3.9, w: 8.0, h: 0.7, fill: { color: '059669' } });
  s15.addText('✅ সঠিক উত্তর: (খ) এটি বৈজ্ঞানিক নীতি ও বাস্তব পর্যবেক্ষণের ওপর প্রতিষ্ঠিত', {
    x: 1.1, y: 4.0, w: 7.8, h: 0.5, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center'
  });

  // =========================================================================
  // স্লাইড ১৬: আজকের পাঠের সারসংক্ষেপ (Recap)
  // =========================================================================
  const s16 = pres.addSlide();
  s16.background = { color: 'FAFAFA' };
  applyHeaderFooter(s16, 16, 18, 'সারসংক্ষেপ');
  s16.addText('📌 আজকের পাঠের সারসংক্ষেপ (Key Takeaways)', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s16.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 3.3, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
  s16.addText(`১. মূল ধারণা: ${topic} এর সংজ্ঞা ও তাৎপর্য আমরা সঠিকভাবে বুঝতে পেরেছি।\n\n২. প্রক্রিয়ার ধাপ: বাস্তব জীবনের প্রেক্ষাপট ও ধারাবাহিক ধাপসমূহ অনুশীলন করেছি।\n\n৩. প্রয়োগ দক্ষতা: দলগত কাজের মাধ্যমে দলভুক্ত হয়ে সমস্যা সমাধানের আত্মবিশ্বাস অর্জন করেছি।`, {
    x: 1.0, y: 1.9, w: 8.0, h: 2.7, fontSize: 14, color: COLORS.textDark, lineSpacing: 26
  });

  // =========================================================================
  // স্লাইড ১৭: সৃজনশীল বাড়ির কাজ (Homework)
  // =========================================================================
  const s17 = pres.addSlide();
  s17.background = { color: 'FAFAFA' };
  applyHeaderFooter(s17, 17, 18, 'বাড়ির কাজ');
  s17.addText('🏡 সৃজনশীল বাড়ির কাজ (Homework & Assignment)', { x: 0.7, y: 1.05, w: 8.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary });
  s17.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 1.6, w: 8.6, h: 3.3, fill: { color: 'F0FDF4' }, line: { color: '86EFAC', width: 1.5 } });
  s17.addText(`অ্যাসাইনমেন্ট শিরোনাম: "${topic} এর বাস্তব প্রয়োগ ও একটি সৃজনশীল কেস স্টাডি"\n\nনির্দেশনাসমূহ:\n১. আপনার চারপাশের পরিবেশ থেকে এর ১টি বাস্তব উদাহরণ পর্যবেক্ষণ করে ১ পৃষ্ঠার প্রতিবেদন লিখুন।\n২. প্রয়োজনে পাঠ্যপুস্তকের সংশ্লিষ্ট অধ্যায়ের সহায়তা নিন।\n৩. আগামী ক্লাসের শুরুতে শ্রেণি শিক্ষকের নিকট জমা দিতে হবে।`, {
    x: 1.0, y: 1.9, w: 8.0, h: 2.7, fontSize: 14, color: COLORS.primaryDark, lineSpacing: 26
  });

  // =========================================================================
  // স্লাইড ১৮: ধন্যবাদ ও সমাপনী (Closing Slide)
  // =========================================================================
  const s18 = pres.addSlide();
  s18.background = { color: COLORS.primaryDark };

  s18.addShape(pres.ShapeType.rect, {
    x: 0.6, y: 0.6, w: 8.8, h: 4.4,
    fill: { color: '064E3B' }, line: { color: '10B981', width: 2 }
  });

  s18.addText('🌟 আন্তরিক ধন্যবাদ! 🌟', {
    x: 1.0, y: 1.2, w: 8.0, h: 0.8,
    fontSize: 32, bold: true, color: 'FFD34F', align: 'center', fontFace: 'Arial'
  });

  s18.addText('মনোযোগ দিয়ে ক্লাস করার জন্য সকল শিক্ষার্থীকে সাধুবাদ।\nআগামী ক্লাসে আরও নতুন বিষয় নিয়ে দেখা হবে।', {
    x: 1.0, y: 2.1, w: 8.0, h: 0.8,
    fontSize: 16, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
  });

  s18.addShape(pres.ShapeType.roundRect, {
    x: 2.0, y: 3.2, w: 6.0, h: 0.9,
    fill: { color: '0284C7' }, line: { color: 'FFFFFF', width: 1 }
  });

  s18.addText(`${schoolName}\nডাকঘর: মগড়া, উপজেলা: টাঙ্গাইল সদর, জেলা: টাঙ্গাইল`, {
    x: 2.0, y: 3.3, w: 6.0, h: 0.7,
    fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
  });

  // Trigger browser download
  const cleanTopic = (topic || 'Lesson').replace(/[/\\?%*:|"<>]/g, '_');
  const fileName = `${subject}_${cleanTopic}_Class${className}_18Slides_Presentation.pptx`;
  await pres.writeFile({ fileName });
  return fileName;
}
