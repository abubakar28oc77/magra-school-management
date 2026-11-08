import React, { useState, useEffect } from 'react';
import { SCHOOL_PAD_HEADER_HTML, SCHOOL_PAD_STYLES } from './schoolPadHeader';
import { PHOTO_HEAD_TEACHER, PHOTO_ASST_HEAD_TEACHER, PHOTO_PRESIDENT } from './mockData';
import { DEFAULT_GALLERY_PLACEHOLDER, SPORTS_PRESET_PHOTOS } from './GalleryMasterAdminPanel';
import { compressImageToDataUrl } from './photoStorage';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// Universal YouTube / Video URL Embedder and Direct Link Converter
export function getEmbedUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();

  // If user pasted an iframe embed code, extract the src URL
  if (str.includes('<iframe') && str.includes('src=')) {
    const srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) str = srcMatch[1];
  }

  // If already an embed url
  if (str.includes('/embed/')) {
    const sep = str.includes('?') ? '&' : '?';
    return str.includes('autoplay') ? str : `${str}${sep}autoplay=1`;
  }

  // youtu.be/<id>
  const youtuMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuMatch && youtuMatch[1]) {
    return `https://www.youtube.com/embed/${youtuMatch[1]}?autoplay=1`;
  }

  // youtube.com/watch?v=<id> or youtube.com/watch/?v=<id>
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;
  }

  // youtube.com/shorts/<id> or youtube.com/live/<id>
  const pathMatch = str.match(/youtube\.com\/(?:shorts|live)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch && pathMatch[1]) {
    return `https://www.youtube.com/embed/${pathMatch[1]}?autoplay=1`;
  }

  // Bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return `https://www.youtube.com/embed/${str}?autoplay=1`;
  }

  // If URL doesn't have protocol but starts with youtube.com or youtu.be
  if (/^(www\.)?(youtube\.com|youtu\.be)/i.test(str)) {
    return getEmbedUrl(`https://${str}`);
  }

  // Fallback: return as-is
  return str;
}

export function getDirectWatchUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();
  if (str.includes('<iframe') && str.includes('src=')) {
    const srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) str = srcMatch[1];
  }
  const youtuMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuMatch && youtuMatch[1]) return `https://www.youtube.com/watch?v=${youtuMatch[1]}`;
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) return `https://www.youtube.com/watch?v=${watchMatch[1]}`;
  const embedMatch = str.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
  const shortsMatch = str.match(/\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) return `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return `https://www.youtube.com/watch?v=${str}`;
  return str.startsWith('http') ? str : `https://${str}`;
}

// LocalStorage Keys
const PHOTO_ALBUMS_KEY = 'magra_gallery_photo_albums_v2';
const VIDEO_ALBUMS_KEY = 'magra_gallery_video_albums_v2';
const ONLINE_CLASSES_KEY = 'magra_gallery_online_classes_v2';

// -------------------------------------------------------------
// DEFAULT PHOTO ALBUMS
// -------------------------------------------------------------
// Lightweight User Photo Albums (Default mock albums removed to keep software fast and lightweight)
const DEFAULT_PHOTO_ALBUMS = [
  {
    id: 'alb-sports-2026',
    title: 'বার্ষিক ক্রীড়াপ্রতিযোগিতা-২০২৬',
    category: 'sports',
    categoryLabel: '🏆 ক্রীড়া ও উৎসব',
    eventDate: '২০২৬-০১-৩১',
    photoCount: 4,
    cover: SPORTS_PRESET_PHOTOS[0].url,
    description: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের সুবিশাল খেলার মাঠে ৪ দিনব্যাপী অনুষ্ঠিত বার্ষিক ক্রীড়া প্রতিযোগিতা, মনোজ্ঞ ডিসপ্লে ও সমাপনী ট্রফি বিতরণ অনুষ্ঠান।',
    photos: SPORTS_PRESET_PHOTOS,
    isCustom: true
  }
];

// -------------------------------------------------------------
// DEFAULT VIDEO ALBUMS
// -------------------------------------------------------------
const DEFAULT_VIDEO_ALBUMS = [
  {
    id: 'vid-01',
    title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬ এর মনোজ্ঞ উদ্বোধনী মার্চপাস্ট ও ডিসপ্লে',
    category: 'sports',
    categoryLabel: '🏆 ক্রীড়া ও উৎসব',
    eventDate: '২০২৬-০২-১৫',
    duration: '১৫:২০ মি.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    host: 'শারীরিক শিক্ষা শিক্ষক ও স্কাউট লিডার',
    description: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের চার সহস্রাধিক দর্শক ও অতিথিদের সামনে পরিবেশিত শিক্ষার্থীদের দৃষ্টিনন্দন শারীরিক কসরত ও দেশাত্মবোধক ডিসপ্লে।'
  },
  {
    id: 'vid-02',
    title: 'আন্তঃশ্রেণি বিতর্ক প্রতিযোগিতা ২০২৬ — চূড়ান্ত সংসদীয় বিতর্ক রাউন্ড',
    category: 'debate',
    categoryLabel: '⚔️ ডিবেট ও বক্তৃতা',
    eventDate: '২০২৬-০২-০৪',
    duration: '২৮:৪৫ মি.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    host: 'মোঃ আশরাফুল আলম (সহকারী শিক্ষক ও বিতর্ক মডারেটর)',
    description: 'বিষয়: "প্রযুক্তির অনিয়ন্ত্রিত ব্যবহার শিক্ষার মানকে ক্ষতিগ্রস্ত করছে।" ১০ম ও ৯ম শ্রেণির বিতার্কিকদের যুক্তিপূর্ণ চূড়ান্ত লড়াই।'
  },
  {
    id: 'vid-03',
    title: 'বিজ্ঞান মেলা ও খুদে রোবটিক্স উদ্ভাবন প্রদর্শনী ২০২৬',
    category: 'science',
    categoryLabel: '🔬 বিজ্ঞান উদ্ভাবন',
    eventDate: '২০২৬-০১-২৮',
    duration: '১২:১০ মি.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    host: 'মোঃ হাবিবুর রহমান (বিজ্ঞান ক্লাব সমন্বয়ক)',
    description: 'শিক্ষার্থীদের তৈরি আগুন শনাক্তকরণ রোবট, স্মার্ট সড়ক বাতি ও জৈব বর্জ্য রিফাইনিং প্রজেক্টের সরাসরি কার্যপদ্ধতি।'
  },
  {
    id: 'vid-04',
    title: 'মহান শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবসের সাংস্কৃতিক পরিবেশনা',
    category: 'national',
    categoryLabel: '🇧🇩 জাতীয় ও সংস্কৃতি',
    eventDate: '২০২৬-০২-২১',
    duration: '১৮:১৫ মি.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    host: 'ভাষা ও সাহিত্য ক্লাব',
    description: 'একুশের কালজয়ী গানের সঙ্গে নৃত্য, নজরুল-রবীন্দ্র আবৃত্তি ও দেশাত্মবোধক গান পরিবেশনা।'
  },
  {
    id: 'vid-05',
    title: 'শেখ রাসেল ডিজিটাল ল্যাবে স্ক্র্যাচ প্রোগ্রামিং ও অ্যানিমেশন মেকিং ক্লাস',
    category: 'ict',
    categoryLabel: '💻 আইসিটি ও কোডিং',
    eventDate: '২০২৬-০১-১০',
    duration: '২২:৩০ মি.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    host: 'মোঃ আবুবকর সিদ্দিক (আইসিটি শিক্ষক)',
    description: 'স্ক্র্যাচ ব্লক কোডিংয়ের মাধ্যমে কীভাবে ইন্টারেক্টিভ কার্টুন ও শিক্ষামূলক গেম তৈরি করতে হয় তার হাতে-কলমে প্রশিক্ষণ।'
  },
  {
    id: 'vid-06',
    title: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের ঐতিহ্য ও ইতিহাস বিষয়ক প্রামাণ্যচিত্র',
    category: 'documentary',
    categoryLabel: '🏛️ ডকুমেন্টারি ও ইতিহাস',
    eventDate: '২০২৫-১২-১৬',
    duration: '২৫:০০ মি.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    host: 'বিদ্যালয় ব্যবস্থাপনা কমিটি ও মিডিয়া সেল',
    description: '১৯৪৬ সালে প্রতিষ্ঠার পর থেকে অত্র অঞ্চলের নারী ও পুরুষ শিক্ষার আলো বিস্তারে বিদ্যালয়ের অবিস্মরণীয় অবদান।'
  }
];

// -------------------------------------------------------------
// TUTORIALS DATA
// -------------------------------------------------------------
const TUTORIALS_DATA = [
  {
    id: 'tut-01',
    category: 'ict',
    badge: '💻 আইসিটি বেসিক',
    title: 'কম্পিউটার হার্ডওয়্যার পরিচিতি ও নিরাপদ সংযোগ স্থাপন',
    duration: '২৫ মিনিট',
    level: 'প্রাথমিক ও মাধ্যমিক',
    desc: 'মাদারবোর্ড, র‍্যাম, হার্ডডিস্ক, পাওয়ার সাপ্লাই ও ক্যাবল সংযোগের সহজ পরিচিতি। কম্পিউটার চালুকরণ ও প্রাথমিক ট্রাবলশুটিং কৌশল।',
    steps: [
      'সিপিইউ (CPU), ক্যাসিং ও মনিটর সংযোগ ও পাওয়ার ক্যাবল চেক',
      'কীবোর্ড ও মাউস ইউএসবি পোর্টে কানেক্ট এবং ড্রাইভার সক্রিয়করণ',
      'উইন্ডোজ অপারেটিং সিস্টেম বুটিং ও ডেস্কটপ ইন্টারফেস পরিচিতি',
      'কম্পিউটার সঠিকভাবে শাটডাউন ও ইউপিএস (UPS) পাওয়ার বন্ধকরণ'
    ],
    pdf: 'computer_hardware_basics_guide.pdf'
  },
  {
    id: 'tut-02',
    category: 'ict',
    badge: '📝 বাংলা টাইপিং',
    title: 'বিজয় বায়ান্ন ও অভ্র দিয়ে দ্রুত ও নির্ভুল বাংলা টাইপিং কৌশল',
    duration: '৩৫ মিনিট',
    level: 'সকল শ্রেণি',
    desc: 'কীবোর্ড ফিঙ্গার পজিশন, য-ফলা, র-ফলা, যুক্তাক্ষর গঠন এবং ইউনিকোড বাংলা ফন্টে মসৃণ টাইপিংয়ের সহজ গাইডলাইন।',
    steps: [
      'হোম রো (ASDF - JKL;) তে আঙুল বসানোর আন্তর্জাতিক নিয়ম',
      'অভ্র ফোনেটিক কীবোর্ড লেআউট (Ami = আমি, Bangla = বাংলা)',
      'বিজয় বায়ান্ন কীবোর্ড লেআউট ও জি (G) চেপে যুক্তাক্ষর গঠন',
      'এমএস ওয়ার্ডে বাংলা ফন্ট সিলেকশন ও মার্জিন সেটআপ'
    ],
    pdf: 'bangla_typing_mastery_sheet.pdf'
  },
  {
    id: 'tut-03',
    category: 'science',
    badge: '🔬 বিজ্ঞান ল্যাব',
    title: 'যৌগিক অণুবীক্ষণ যন্ত্রের সাহায্যে পেঁয়াজের কোষ পর্যবেক্ষণ',
    duration: '২০ মিনিট',
    level: '৮ম–১০ম শ্রেণি',
    desc: 'ল্যাবরেটরিতে স্লাইড তৈরি, মিথিলিন ব্লু রঞ্জক ব্যবহার, কভার স্লিপ স্থাপন এবং লেন্স অ্যাডজাস্ট করে উদ্ভিদ কোষের সাইটোপ্লাজম ও নিউক্লিয়াস দর্শন।',
    steps: [
      'পেঁয়াজের শল্কপত্রের ভেতরের পাতলা ত্বক সাবধানে আলাদা করা',
      'পরিষ্কার গ্লাস স্লাইডে এক ফোঁটা পানি দিয়ে ত্বকটি সমানভাবে রাখা',
      'এক ফোঁটা মিথিলিন ব্লু যোগ করে কভার স্লিপ বুদবুদহীনভাবে বসানো',
      'নিম্ন ক্ষমতাসম্পন্ন লেন্সে ফোকাস করে ধীরে ধীরে উচ্চ ক্ষমতায় পর্যবেক্ষণ'
    ],
    pdf: 'microscope_plant_cell_lab_manual.pdf'
  },
  {
    id: 'tut-04',
    category: 'coding',
    badge: '🐍 কোডিং পাঠ',
    title: 'পাইথন দিয়ে শুরু হোক তোমার প্রথম প্রোগ্রামিং যাত্রা',
    duration: '৪৫ মিনিট',
    level: '৭ম–১০ম শ্রেণি',
    desc: 'ভেরিয়েবল, ইনপুট, প্রিন্ট স্টেটমেন্ট এবং ইফ-এলস কন্ডিশন ব্যবহার করে সহজ ক্যালকুলেটর প্রোগ্রাম তৈরি।',
    steps: [
      'Python IDLE অথবা VS Code ইনস্টলেশন ও রান',
      'print("হ্যালো মগড়া স্কুল!") কমান্ড রান করা',
      'ব্যবহারকারীর বয়স ও রোল নম্বর ইনপুট নিয়ে মেসেজ প্রিন্ট',
      'যোগ, বিয়োগ, গুণ ও ভাগের ক্যালকুলেটর লজিক লেখা'
    ],
    pdf: 'python_starter_pack_for_beginners.pdf'
  },
  {
    id: 'tut-05',
    category: 'art',
    badge: '🎨 শিল্প ও ক্যালিগ্রাফি',
    title: 'সুন্দর হাতের লেখা ও আরবি/বাংলা ক্যালিগ্রাফির সহজ পাঠ',
    duration: '৩০ মিনিট',
    level: '৬ষ্ঠ–১০ম শ্রেণি',
    desc: 'কলম ধরার সঠিক কোণ, অক্ষরের অনুপাত ও ভারসাম্য বজায় রেখে আকর্ষণীয় হ্যান্ডরাইটিং ও আর্ট পোস্টার তৈরির নিয়ম।',
    steps: [
      'কাট নিব (Chisel Tip) মার্কার পেন ধরার ৪৫ ডিগ্রি কোণ',
      'মাত্রা ঠিক রেখে বাংলা বর্ণমালার ধারাবাহিক রেখাচিত্র',
      'খাতার মার্জিন ও লাইনের মধ্যে সুষম দূরত্ব বজায় রাখার কৌশল',
      'দেয়ালিকা ও প্রজেক্টের জন্য শৈল্পিক হেডলাইন অঙ্কন'
    ],
    pdf: 'calligraphy_and_handwriting_guide.pdf'
  }
];

// -------------------------------------------------------------
// ONLINE CLASSES DATA (DEFAULT EMPTY FOR LEAN PERFORMANCE)
// -------------------------------------------------------------
const DEFAULT_ONLINE_CLASSES = [];

// -------------------------------------------------------------
// HISTORIC CAMPUS MILESTONES
// -------------------------------------------------------------
const CAMPUS_MILESTONES = [
  {
    year: '১৯৪৬',
    title: 'বিদ্যালয় প্রতিষ্ঠা ও শুভ সূচনা',
    desc: 'টাঙ্গাইল জেলার কালিহাতী উপজেলার মগড়া অঞ্চলে শিক্ষার আলো ছড়াতে স্থানীয় সমাজসেবক ও বিদ্যানুরাগীদের উদ্যোগে প্রতিষ্ঠিত হয় মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়।'
  },
  {
    year: '১৯৭১',
    title: 'মহান মুক্তিযুদ্ধে গৌরবোজ্জ্বল ভূমিকা',
    desc: 'মুক্তিযুদ্ধের সময় বিদ্যালয়ের শিক্ষক ও শিক্ষার্থীরা বীরত্বের সাথে মুক্তিযুদ্ধে অংশগ্রহণ করেন। বিদ্যালয় প্রাঙ্গণ ব্যবহৃত হয়েছিল মুক্তিযোদ্ধাদের গোপন আশ্রয় ও যোগাযোগ কেন্দ্র হিসেবে।'
  },
  {
    year: '১৯৯৮',
    title: 'আধুনিক একাডেমিক ভবন ও খেলার মাঠ সম্প্রসারণ',
    desc: 'বিদ্যালয়ের ৩ তলা বিশিষ্ট পাকা একাডেমিক ভবন নির্মাণ এবং ক্রীড়া ও শরীরচর্চাকে উৎসাহিত করতে সুবিশাল মাঠ সংস্কার।'
  },
  {
    year: '২০১৬',
    title: 'শেখ রাসেল ডিজিটাল ল্যাব স্থাপন',
    desc: 'শিক্ষার্থীদের আধুনিক তথ্যপ্রযুক্তির যুগে গড়ে তুলতে স্থাপিত হয় অত্যাধুনিক কম্পিউটার ল্যাব ও উচ্চগতির ইন্টারনেট সংযোগ।'
  },
  {
    year: '২০২৬',
    title: 'ডিজিটাল স্মার্ট ক্যাম্পাস ও ৮০ বছর পূর্তি',
    desc: '৮০ বছরের সমৃদ্ধ ঐতিহ্য নিয়ে সম্পূর্ণ কম্পিউটারাইজড স্কুল ম্যানেজমেন্ট সফটওয়্যার ও স্মার্ট শ্রেণিকক্ষের পদার্পণ।'
  }
];

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function GalleryMasterModalSection({ initialSubmenuKey = 'photos', initialTitle = '', onClose }) {
  // Determine starting tab from submenuKey or title
  const getInitialTab = () => {
    if (initialSubmenuKey?.includes('video') || initialTitle?.includes('ভিডিও')) return 'videos';
    if (initialSubmenuKey?.includes('tutorial') || initialTitle?.includes('টিউটোরিয়াল')) return 'tutorials';
    if (initialSubmenuKey?.includes('class') || initialTitle?.includes('অনলাইন ক্লাস')) return 'classes';
    if (initialSubmenuKey?.includes('campus') || initialTitle?.includes('ক্যাম্পাস') || initialTitle?.includes('স্মৃতি')) return 'campus';
    if (initialSubmenuKey?.includes('audio') || initialTitle?.includes('অডিও') || initialTitle?.includes('সাংস্কৃতিক')) return 'audio';
    return 'photos';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Storage states
  const [photoAlbums, setPhotoAlbums] = useState([]);
  const [videoAlbums, setVideoAlbums] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);

  // Modals & Active Viewers
  const [selectedPhotoAlbum, setSelectedPhotoAlbum] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState(null);
  const [activeLectureModal, setActiveLectureModal] = useState(null);

  // Creation Modals
  const [showNewPhotoAlbumModal, setShowNewPhotoAlbumModal] = useState(false);
  const [showNewVideoModal, setShowNewVideoModal] = useState(false);
  const [showNewClassModal, setShowNewClassModal] = useState(false);

  // Filters & Search
  const [photoSearch, setPhotoSearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');
  const [classFilterGrade, setClassFilterGrade] = useState('all');
  const [classFilterSubject, setClassFilterSubject] = useState('all');

  // Audio Player State
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Load / Save from localStorage
  useEffect(() => {
    try {
      const storedPhotos = localStorage.getItem(PHOTO_ALBUMS_KEY);
      if (storedPhotos) {
        const parsed = JSON.parse(storedPhotos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove default mock albums (alb-photo-1 to alb-photo-6) to make software lightweight
          const userOnly = parsed.filter(a => a && !String(a.id || '').startsWith('alb-photo-'));
          const listToUse = (userOnly.length > 0 ? userOnly : DEFAULT_PHOTO_ALBUMS).map(a => {
            const hasBrokenPhotos = !a.photos || !a.photos.length || a.photos.some(p => !p.url || p.url.length < 15 || (!p.url.startsWith('http') && !p.url.startsWith('data:')));
            if (hasBrokenPhotos && (a.category === 'sports' || (a.title && a.title.includes('ক্রীড়া')))) {
              return {
                ...a,
                cover: (a.cover && (a.cover.startsWith('http') || a.cover.startsWith('data:'))) ? a.cover : SPORTS_PRESET_PHOTOS[0].url,
                photos: SPORTS_PRESET_PHOTOS,
                photoCount: SPORTS_PRESET_PHOTOS.length
              };
            }
            return a;
          });
          setPhotoAlbums(listToUse);
          localStorage.setItem(PHOTO_ALBUMS_KEY, JSON.stringify(listToUse));
        } else {
          setPhotoAlbums(DEFAULT_PHOTO_ALBUMS);
          localStorage.setItem(PHOTO_ALBUMS_KEY, JSON.stringify(DEFAULT_PHOTO_ALBUMS));
        }
      } else {
        localStorage.setItem(PHOTO_ALBUMS_KEY, JSON.stringify(DEFAULT_PHOTO_ALBUMS));
        setPhotoAlbums(DEFAULT_PHOTO_ALBUMS);
      }

      const storedVideos = localStorage.getItem(VIDEO_ALBUMS_KEY);
      if (storedVideos) {
        setVideoAlbums(JSON.parse(storedVideos));
      } else {
        localStorage.setItem(VIDEO_ALBUMS_KEY, JSON.stringify(DEFAULT_VIDEO_ALBUMS));
        setVideoAlbums(DEFAULT_VIDEO_ALBUMS);
      }

      const storedClasses = localStorage.getItem(ONLINE_CLASSES_KEY);
      if (storedClasses) {
        try {
          const parsed = JSON.parse(storedClasses);
          if (Array.isArray(parsed)) {
            // Filter out default mock classes (cls-01 to cls-06)
            const userOnly = parsed.filter(c => c && !['cls-01', 'cls-02', 'cls-03', 'cls-04', 'cls-05', 'cls-06'].includes(c.id));
            setOnlineClasses(userOnly);
            localStorage.setItem(ONLINE_CLASSES_KEY, JSON.stringify(userOnly));
          } else {
            setOnlineClasses([]);
            localStorage.setItem(ONLINE_CLASSES_KEY, JSON.stringify([]));
          }
        } catch {
          setOnlineClasses([]);
        }
      } else {
        localStorage.setItem(ONLINE_CLASSES_KEY, JSON.stringify([]));
        setOnlineClasses([]);
      }
    } catch {
      setPhotoAlbums(DEFAULT_PHOTO_ALBUMS);
      setVideoAlbums(DEFAULT_VIDEO_ALBUMS);
      setOnlineClasses([]);
    }
  }, []);

  const savePhotoAlbums = (data) => {
    setPhotoAlbums(data);
    try { localStorage.setItem(PHOTO_ALBUMS_KEY, JSON.stringify(data)); } catch {}
  };

  const saveVideoAlbums = (data) => {
    setVideoAlbums(data);
    try { localStorage.setItem(VIDEO_ALBUMS_KEY, JSON.stringify(data)); } catch {}
  };

  const saveOnlineClasses = (data) => {
    setOnlineClasses(data);
    try { localStorage.setItem(ONLINE_CLASSES_KEY, JSON.stringify(data)); } catch {}
  };

  // New Photo Album Form State
  const [newPhotoForm, setNewPhotoForm] = useState({
    title: '',
    category: 'sports',
    categoryLabel: '🏆 ক্রীড়া ও উৎসব',
    eventDate: new Date().toISOString().slice(0, 10),
    cover: '',
    description: '',
    photosInput: ''
  });

  const [newPhotoUploadedList, setNewPhotoUploadedList] = useState([]);
  const [isProcessingNewPhotos, setIsProcessingNewPhotos] = useState(false);

  // Handle Cover File Upload for Public Modal
  const handleNewCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingNewPhotos(true);
      const dataUrl = await compressImageToDataUrl(file, 900, 0.8);
      if (dataUrl) {
        setNewPhotoForm(prev => ({ ...prev, cover: dataUrl }));
      }
    } catch {
      alert('কভার ছবি প্রসেস করা যায়নি।');
    } finally {
      setIsProcessingNewPhotos(false);
      e.target.value = '';
    }
  };

  // Handle Multiple Photos Upload for Public Modal
  const handleNewMultiplePhotosChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setIsProcessingNewPhotos(true);
      const newItems = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageToDataUrl(file, 900, 0.78);
        if (dataUrl) {
          const serial = newPhotoUploadedList.length + newItems.length + 1;
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          newItems.push({
            id: `p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            title: newPhotoForm.title ? `${newPhotoForm.title} - ছবি ${toBn(serial)}` : cleanName,
            url: dataUrl
          });
        }
      }
      if (newItems.length > 0) {
        setNewPhotoUploadedList(prev => [...prev, ...newItems]);
        setNewPhotoForm(prev => prev.cover ? prev : { ...prev, cover: newItems[0].url });
      }
    } catch (err) {
      alert('ছবি আপলোডে সমস্যা হয়েছে: ' + (err.message || ''));
    } finally {
      setIsProcessingNewPhotos(false);
      e.target.value = '';
    }
  };

  // Remove photo from public modal upload list
  const handleRemoveNewPhoto = (indexToRemove) => {
    setNewPhotoUploadedList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 1-Click demo sports photos for public modal
  const handleLoadNewSportsDemo = () => {
    setNewPhotoUploadedList(SPORTS_PRESET_PHOTOS);
    setNewPhotoForm(prev => ({
      ...prev,
      cover: SPORTS_PRESET_PHOTOS[0].url
    }));
  };

  // New Video Form State
  const [newVideoForm, setNewVideoForm] = useState({
    title: '',
    category: 'events',
    categoryLabel: '🎥 স্কুল অনুষ্ঠান',
    eventDate: new Date().toISOString().slice(0, 10),
    duration: '১৫:০০ মি.',
    videoUrl: '',
    thumbnail: '',
    host: 'বিদ্যালয় কর্তৃপক্ষ',
    description: ''
  });

  // Handle Create Photo Album
  const handleCreatePhotoAlbum = (e) => {
    e.preventDefault();
    if (!newPhotoForm.title.trim()) {
      alert('অনুগ্রহ করে অ্যালবামের শিরোনাম লিখুন!');
      return;
    }

    const defaultCovers = [
      SPORTS_PRESET_PHOTOS[0].url,
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
    ];
    let finalCover = newPhotoForm.cover.trim();

    let parsedPhotos = [...newPhotoUploadedList];
    if (newPhotoForm.photosInput && newPhotoForm.photosInput.trim()) {
      const urls = newPhotoForm.photosInput.split('\n').map(u => u.trim()).filter(Boolean);
      urls.forEach((url, idx) => {
        parsedPhotos.push({
          id: `p-${Date.now()}-${idx}`,
          title: `${newPhotoForm.title} - ছবি ${toBn(parsedPhotos.length + 1)}`,
          url
        });
      });
    }

    if (!finalCover) {
      if (parsedPhotos.length > 0 && parsedPhotos[0].url) {
        finalCover = parsedPhotos[0].url;
      } else {
        finalCover = defaultCovers[0];
      }
    }

    if (!parsedPhotos.length) {
      parsedPhotos = [
        { id: `p-${Date.now()}-1`, title: `${newPhotoForm.title} - মূল আলোকচিত্র ১`, url: finalCover }
      ];
    }

    const newAlbum = {
      id: `alb-${Date.now()}`,
      title: newPhotoForm.title.trim(),
      category: newPhotoForm.category,
      categoryLabel: newPhotoForm.categoryLabel,
      eventDate: newPhotoForm.eventDate,
      photoCount: parsedPhotos.length,
      cover: finalCover,
      description: newPhotoForm.description.trim() || 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের বিশেষ মুহূর্ত ও আলোকচিত্র সংগ্রহ।',
      photos: parsedPhotos,
      isCustom: true
    };

    const updated = [newAlbum, ...photoAlbums];
    savePhotoAlbums(updated);
    setShowNewPhotoAlbumModal(false);
    setNewPhotoUploadedList([]);
    setNewPhotoForm({
      title: '',
      category: 'sports',
      categoryLabel: '🏆 ক্রীড়া ও উৎসব',
      eventDate: new Date().toISOString().slice(0, 10),
      cover: '',
      description: '',
      photosInput: ''
    });
    alert('✓ চমৎকার! নতুন ফটো অ্যালবামটি সফলভাবে তৈরি ও যুক্ত হয়েছে।');
  };

  // Handle Create Video Album
  const handleCreateVideo = (e) => {
    e.preventDefault();
    if (!newVideoForm.title.trim()) {
      alert('অনুগ্রহ করে ভিডিও শিরোনাম লিখুন!');
      return;
    }

    const defaultThumb = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
    const finalThumb = newVideoForm.thumbnail.trim() || defaultThumb;

    const newVid = {
      id: `vid-${Date.now()}`,
      title: newVideoForm.title.trim(),
      category: newVideoForm.category,
      categoryLabel: newVideoForm.categoryLabel,
      eventDate: newVideoForm.eventDate,
      duration: newVideoForm.duration || '১০:০০ মি.',
      videoType: 'youtube',
      videoUrl: newVideoForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: finalThumb,
      host: newVideoForm.host.trim() || 'বিদ্যালয় উপস্থাপক',
      description: newVideoForm.description.trim() || 'বিদ্যালয়ের ভিডিও ডকুমেন্টারি ও অনুষ্ঠান রেকর্ড।',
      isCustom: true
    };

    const updated = [newVid, ...videoAlbums];
    saveVideoAlbums(updated);
    setShowNewVideoModal(false);
    setNewVideoForm({
      title: '',
      category: 'events',
      categoryLabel: '🎥 স্কুল অনুষ্ঠান',
      eventDate: new Date().toISOString().slice(0, 10),
      duration: '১৫:০০ মি.',
      videoUrl: '',
      thumbnail: '',
      host: 'বিদ্যালয় কর্তৃপক্ষ',
      description: ''
    });
    alert('✓ চমৎকার! নতুন ভিডিওটি সফলভাবে গ্যালারিতে সংরক্ষিত হয়েছে।');
  };

  // Filtered Photo Albums
  const filteredPhotos = photoAlbums.filter(alb => {
    if (!photoSearch.trim()) return true;
    const q = photoSearch.toLowerCase();
    return alb.title.toLowerCase().includes(q) || alb.description.toLowerCase().includes(q);
  });

  // Filtered Video Albums
  const filteredVideos = videoAlbums.filter(vid => {
    if (!videoSearch.trim()) return true;
    const q = videoSearch.toLowerCase();
    return vid.title.toLowerCase().includes(q) || vid.description.toLowerCase().includes(q);
  });

  // Filtered Online Classes
  const filteredClasses = onlineClasses.filter(c => {
    if (classFilterGrade !== 'all' && c.className !== classFilterGrade) return false;
    if (classFilterSubject !== 'all' && c.subject !== classFilterSubject) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif", color: '#0f172a' }}>
      
      {/* ================= HEADER HERO BANNER ================= */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #0d9488 100%)',
        color: '#ffffff',
        borderRadius: '14px',
        padding: '24px 28px',
        marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(4, 120, 87, 0.22)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <span>📸</span> মিডিয়া, ভিজ্যুয়াল আর্ট ও লার্নিং সেন্টার
            </div>
            <h1 style={{ margin: '4px 0 6px 0', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.3px' }}>
              স্মার্ট মিডিয়া গ্যালারি ও ডিজিটাল লার্নিং আর্কাইভ
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#ccfbf1', maxWidth: '680px', lineHeight: '1.5' }}>
              বিদ্যালয়ের বর্ণাঢ্য ক্রীড়া, সাংস্কৃতিক ও বিজ্ঞান মেলা, ঐতিহাসিক স্মৃতি, ভিডিও অধিবেশন, বিষয়ভিত্তিক অনলাইন ক্লাস এবং তথ্যপ্রযুক্তি টিউটোরিয়াল হাব।
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowNewPhotoAlbumModal(true)}
              style={{
                background: '#ffffff',
                color: '#065f46',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }}
            >
              <span>✨</span> + নতুন অ্যালবাম তৈরি করুন
            </button>

            <button
              type="button"
              onClick={() => setShowNewVideoModal(true)}
              style={{
                background: '#042f2e',
                color: '#5eead4',
                border: '1px solid #14b8a6',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🎥</span> + নতুন ভিডিও যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* ================= 6 SMART TAB SWITCHERS ================= */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        {[
          { key: 'photos', label: '📸 ফটো গ্যালারি', badge: toBn(photoAlbums.length) + ' অ্যালবাম' },
          { key: 'videos', label: '🎥 ভিডিও গ্যালারি', badge: toBn(videoAlbums.length) + ' ভিডিও' },
          { key: 'tutorials', label: '💡 টিউটোরিয়াল', badge: '৫টি পাঠ্যধারা' },
          { key: 'classes', label: '🎓 অনলাইন ক্লাস', badge: toBn(onlineClasses.length) + ' ক্লাস' },
          { key: 'campus', label: '🏛️ ক্যাম্পাস ও স্মৃতি', badge: '১৯৪৬–২০২৬' },
          { key: 'audio', label: '🎵 অডিও ও সাংস্কৃতিক', badge: 'জাতীয় সংগীত' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: isActive ? '#047857' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? '1px solid #047857' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '13.5px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.22)' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#475569',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: PHOTOS GALLERY ================= */}
      {activeTab === 'photos' && (
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="🔍 অ্যালবামের নাম বা বিষয় দিয়ে খুঁজুন..."
                value={photoSearch}
                onChange={e => setPhotoSearch(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  width: '280px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                মোট সংরক্ষিত অ্যালবাম: <b>{toBn(filteredPhotos.length)}</b> টি
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowNewPhotoAlbumModal(true)}
              style={{
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> নতুন অ্যালবাম তৈরি করুন
            </button>
          </div>

          {/* Photo Albums Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredPhotos.map(alb => (
              <div
                key={alb.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Cover Image Container */}
                <div style={{ position: 'relative', height: '190px', background: '#0f172a', overflow: 'hidden' }}>
                  <img
                    src={alb.cover || DEFAULT_GALLERY_PLACEHOLDER}
                    alt={alb.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onError={(e) => {
                      if (e.target.getAttribute('data-err')) return;
                      e.target.setAttribute('data-err', '1');
                      e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {alb.categoryLabel}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(4, 120, 87, 0.9)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>🖼️</span> {toBn(alb.photoCount || alb.photos?.length || 0)} টি ছবি
                  </div>
                </div>

                {/* Info Container */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
                    📅 {toBn(alb.eventDate)}
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4' }}>
                    {alb.title}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5', flex: 1 }}>
                    {alb.description.length > 110 ? alb.description.slice(0, 110) + '...' : alb.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoAlbum(alb)}
                      style={{
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        padding: '7px 16px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🔍</span> সম্পূর্ণ অ্যালবাম দেখুন
                    </button>

                    {alb.isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('আপনি কি এই কাস্টম অ্যালবামটি মুছে ফেলতে চান?')) {
                            savePhotoAlbums(photoAlbums.filter(a => a.id !== alb.id));
                          }
                        }}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: VIDEO GALLERY ================= */}
      {activeTab === 'videos' && (
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="🔍 ভিডিও বা অনুষ্ঠানের শিরোনাম দিয়ে খুঁজুন..."
                value={videoSearch}
                onChange={e => setVideoSearch(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  width: '280px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                মোট সংরক্ষিত ভিডিও: <b>{toBn(filteredVideos.length)}</b> টি
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowNewVideoModal(true)}
              style={{
                background: '#0891b2',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🎥</span> + নতুন ভিডিও যুক্ত করুন
            </button>
          </div>

          {/* Videos Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredVideos.map(vid => (
              <div
                key={vid.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Video Thumbnail with Play Button */}
                <div
                  style={{ position: 'relative', height: '180px', background: '#020617', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => setActiveVideoPlayer(vid)}
                >
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '54px',
                    height: '54px',
                    background: 'rgba(239, 68, 68, 0.95)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '22px',
                    boxShadow: '0 4px 15px rgba(239,68,68,0.5)'
                  }}>
                    ▶
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    ⏱️ {toBn(vid.duration)}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(15,23,42,0.8)',
                    color: '#38bdf8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {vid.categoryLabel}
                  </div>
                </div>

                {/* Info Container */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
                    📅 {toBn(vid.eventDate)} • 🎙️ {vid.host}
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4' }}>
                    {vid.title}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#475569', lineHeight: '1.5', flex: 1 }}>
                    {vid.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveVideoPlayer(vid)}
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '7px 16px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>▶</span> ভিডিও প্লে করুন
                    </button>

                    {vid.isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('আপনি কি এই ভিডিওটি তালিকা থেকে মুছে ফেলতে চান?')) {
                            saveVideoAlbums(videoAlbums.filter(v => v.id !== vid.id));
                          }
                        }}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: TUTORIALS ================= */}
      {activeTab === 'tutorials' && (
        <div>
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <span style={{ fontSize: '28px' }}>💡</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#166534', fontWeight: 800 }}>
                আইসিটি, বিজ্ঞান ল্যাব ও স্কিল ডেভেলপমেন্ট টিউটোরিয়াল একাডেমি
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#15803d' }}>
                শিক্ষার্থীদের ব্যবহারিক দক্ষতা অর্জনের জন্য ধাপে ধাপে তৈরি ব্যবহারিক গাইড ও ল্যাব ম্যানুয়াল।
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {TUTORIALS_DATA.map((tut, idx) => (
              <div
                key={tut.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '15px', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>
                      {tut.badge} • ⏱️ {toBn(tut.duration)} • স্তর: {tut.level}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      {toBn(idx + 1)}. {tut.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`✓ "${tut.title}" এর অফিশিয়াল টিউটোরিয়াল গাইড শিট ডাউনলোড সম্পন্ন হয়েছে।`);
                    }}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 15px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📥</span> গাইড ডাউনলোড (PDF)
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  {tut.desc}
                </p>

                {/* Steps List */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                    📌 অনুশীলনের মূল ধাপসমূহ:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                    {tut.steps.map((step, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', gap: '8px', fontSize: '12.5px', color: '#1e293b' }}>
                        <span style={{ color: '#059669', fontWeight: 800 }}>✓ {toBn(sIdx + 1)}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ONLINE CLASSES ================= */}
      {activeTab === 'classes' && (
        <div>
          {/* Class Filters & Controls */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>শ্রেণি ফিল্টার:</label>
                <select
                  value={classFilterGrade}
                  onChange={e => setClassFilterGrade(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="all">সব শ্রেণি (৬ষ্ঠ–১০ম)</option>
                  <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                  <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                  <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                  <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>বিষয় ফিল্টার:</label>
                <select
                  value={classFilterSubject}
                  onChange={e => setClassFilterSubject(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="all">সকল বিষয়</option>
                  <option value="সাধারণ গণিত">সাধারণ গণিত</option>
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                  <option value="ইংরেজি (English Grammar)">ইংরেজি (English Grammar)</option>
                  <option value="বিজ্ঞান">বিজ্ঞান</option>
                  <option value="তথ্য ও যোগাযোগ প্রযুক্তি">তথ্য ও যোগাযোগ প্রযুক্তি</option>
                  <option value="বাংলা ১ম পত্র">বাংলা ১ম পত্র</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569' }}>
              মোট অনলাইন ক্লাস: <b>{toBn(filteredClasses.length)}</b> টি
            </div>
          </div>

          {/* Classes Cards Grid */}
          {filteredClasses.length === 0 ? (
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '38px', marginBottom: '10px' }}>🎓</div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#334155' }}>
                কোনো অনলাইন ক্লাস পাওয়া যায়নি
              </h4>
              <p style={{ margin: 0, fontSize: '13px' }}>
                নির্বাচিত ফিল্টারে কোনো ক্লাস নেই অথবা নতুন ক্লাস যুক্ত করতে লগইন পেজ বা অ্যাডমিন প্যানেল ব্যবহার করুন।
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {filteredClasses.map(cls => (
                <div
                  key={cls.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Thumbnail with Class Overlay */}
                  <div 
                    style={{ position: 'relative', height: '160px', background: '#0f172a', cursor: 'pointer' }}
                    onClick={() => setActiveVideoPlayer({
                      title: `${cls.className} • ${cls.subject}: ${cls.topic}`,
                      videoUrl: cls.videoUrl || cls.url || cls.video_url || '',
                      host: cls.teacher,
                      description: `শিক্ষক: ${cls.teacher} (${cls.designation})। শ্রেণি: ${cls.className} • বিষয়: ${cls.subject} • পাঠ: ${cls.topic}। তারিখ: ${toBn(cls.date)} খ্রি.`
                    })}
                    title="ক্লাস ভিডিও দেখতে ক্লিক করুন"
                  >
                    <img
                      src={cls.thumbnail}
                      alt={cls.topic}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: '#047857',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {cls.className} • {cls.subject}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      ⏱️ {toBn(cls.duration)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4' }}>
                      {cls.topic}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                      👨‍🏫 {cls.teacher} ({cls.designation})
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveVideoPlayer({
                          title: `${cls.className} • ${cls.subject}: ${cls.topic}`,
                          videoUrl: cls.videoUrl || cls.url || cls.video_url || '',
                          host: cls.teacher,
                          description: `শিক্ষক: ${cls.teacher} (${cls.designation})। শ্রেণি: ${cls.className} • বিষয়: ${cls.subject} • পাঠ: ${cls.topic}। তারিখ: ${toBn(cls.date)} খ্রি.`
                        })}
                        style={{
                          flex: 1,
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>▶</span> ক্লাস দেখুন
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          alert(`✓ "${cls.topic}" এর লেকচার শিট ও অনুশীলন হ্যান্ডআউট সফলভাবে ডাউনলোড হয়েছে।`);
                        }}
                        title="লেকচার নোট ডাউনলোড করুন"
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📥 শিট
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: CAMPUS & HISTORIC MEMORIES ================= */}
      {activeTab === 'campus' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '22px 26px',
            marginBottom: '24px'
          }}>
            <span style={{ background: '#047857', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              ঐতিহাসিক মাইলফলক
            </span>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '20px', fontWeight: 900 }}>
              মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের গৌরবোজ্জ্বল ৮০ বছরের পরিক্রমা
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              ১৯৪৬ সালে প্রতিষ্ঠার পর থেকে টাঙ্গাইলের কালিহাতী উপজেলার প্রত্যন্ত অঞ্চলে জ্ঞানের আলো বিস্তার এবং অসংখ্য গুণী সন্তান তৈরির ইতিহাস।
            </p>
          </div>

          {/* Timeline of Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {CAMPUS_MILESTONES.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '14px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                }}>
                  {m.year}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {m.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Campus Virtual Photos */}
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
            🏛️ ক্যাম্পাসের ঐতিহাসিক ও আধুনিক অবকাঠামো আলোকচিত্র
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { title: 'সুবিশাল ৩-তলা একাডেমিক ভবন', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80' },
              { title: 'কেন্দ্রীয় সবুজ খেলার মাঠ ও বৃক্ষরাজি', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80' },
              { title: 'শহীদ মিনার ও মুক্তমঞ্চ প্রাঙ্গণ', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' },
              { title: 'শেখ রাসেল ডিজিটাল ল্যাব ও লাইব্রেরি', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' }
            ].map((cPhoto, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={cPhoto.url} alt={cPhoto.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                  {cPhoto.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: AUDIO & CULTURAL ================= */}
      {activeTab === 'audio' && (
        <div>
          <div style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#065f46', fontWeight: 800 }}>
              🎵 অডিও আর্কাইভ ও সাংস্কৃতিক পরিবেশনা কর্নার
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
              বিদ্যালয়ের জাতীয় সংগীত, থিম সং, স্বরচিত আবৃত্তি ও ঐতিহাসিক ভাষণের ডিজিটাল অডিও প্লেয়ার।
            </p>
          </div>

          {/* Audio Tracks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'aud-1', title: 'গণপ্রজাতন্ত্রী বাংলাদেশের জাতীয় সংগীত (আমার সোনার বাংলা)', artist: 'বিদ্যালয়ের শিক্ষার্থীদের সম্মিলিত কণ্ঠ ও অর্কেস্ট্রা', duration: '০২:৪০ মিনিট' },
              { id: 'aud-2', title: 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের থিম সং', artist: 'বিদ্যালয় সাংস্কৃতিক পরিষদ ও শিক্ষকবৃন্দ', duration: '০৩:১৫ মিনিট' },
              { id: 'aud-3', title: 'বিদ্রোহী কবিতা আবৃত্তি (কাজী নজরুল ইসলাম)', artist: 'তানভীর আহমেদ (১০ম শ্রেণি - ১ম স্থান অধিকারী)', duration: '০৪:১০ মিনিট' },
              { id: 'aud-4', title: 'ঐতিহাসিক ৭ই মার্চের কালজয়ী ভাষণ (পুনঃপাঠ)', artist: 'মাহফুজ আহমেদ (৯ম শ্রেণি)', duration: '০৫:০৫ মিনিট' }
            ].map(track => {
              const isThisPlaying = currentPlayingAudio === track.id && isPlayingAudio;
              return (
                <div
                  key={track.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isThisPlaying) {
                          setIsPlayingAudio(false);
                        } else {
                          setCurrentPlayingAudio(track.id);
                          setIsPlayingAudio(true);
                        }
                      }}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: isThisPlaying ? '#dc2626' : '#047857',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      {isThisPlaying ? '⏸' : '▶'}
                    </button>

                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        🎙️ {track.artist}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                      ⏱️ {track.duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`✓ "${track.title}" এর এমপিথ্রি অডিও ডাউনলোড হয়েছে।`)}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      📥 অডিও
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL: ALBUM DETAIL LIGHTBOX ================= */}
      {selectedPhotoAlbum && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#047857',
              color: '#ffffff',
              padding: '16px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                  {selectedPhotoAlbum.categoryLabel} • {toBn(selectedPhotoAlbum.eventDate)}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '17px', fontWeight: 800 }}>
                  {selectedPhotoAlbum.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoAlbum(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 900
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                {selectedPhotoAlbum.description}
              </p>

              {/* Auto Repair Notice if photos are broken / local filenames */}
              {selectedPhotoAlbum.photos?.some(p => !p.url || p.url.length < 15 || (!p.url.startsWith('http') && !p.url.startsWith('data:'))) && (
                <div style={{
                  background: '#fef3c7',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(245,158,11,0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
                        ছবিগুলোর ফাইল পাথ ব্রাউজারে দৃশ্যমান নয়
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#b45309' }}>
                        ডিভাইস থেকে ফাইল আপলোড বা নিচের বাটনে ক্লিক করে আসল ছবি দিয়ে মেরামত করতে পারেন।
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = photoAlbums.map(a => {
                        if (a.id === selectedPhotoAlbum.id) {
                          return {
                            ...a,
                            cover: SPORTS_PRESET_PHOTOS[0].url,
                            photos: SPORTS_PRESET_PHOTOS,
                            photoCount: SPORTS_PRESET_PHOTOS.length
                          };
                        }
                        return a;
                      });
                      savePhotoAlbums(updated);
                      setSelectedPhotoAlbum(prev => ({
                        ...prev,
                        cover: SPORTS_PRESET_PHOTOS[0].url,
                        photos: SPORTS_PRESET_PHOTOS,
                        photoCount: SPORTS_PRESET_PHOTOS.length
                      }));
                      alert('✓ চমৎকার! অ্যালবামটির ছবিগুলো আসল স্পোর্টস ছবি দিয়ে মেরামত করা হয়েছে!');
                    }}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(4,120,87,0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>⚡ আসল স্পোর্টস ছবি দিয়ে মেরামত করুন</span>
                  </button>
                </div>
              )}

              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                আলোকচিত্র সংগ্রহ ({toBn(selectedPhotoAlbum.photos?.length || 0)} টি):
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '14px'
              }}>
                {(selectedPhotoAlbum.photos || []).map((ph, pIdx) => (
                  <div
                    key={ph.id || pIdx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => setLightboxPhoto(ph)}
                  >
                    <img
                      src={ph.url || DEFAULT_GALLERY_PLACEHOLDER}
                      alt={ph.title}
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      onError={(e) => {
                        if (e.target.getAttribute('data-err')) return;
                        e.target.setAttribute('data-err', '1');
                        e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                      }}
                    />
                    <div style={{ padding: '8px 10px', fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ph.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedPhotoAlbum(null)}
                style={{
                  background: '#64748b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SINGLE PHOTO LIGHTBOX ================= */}
      {lightboxPhoto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>

          <img
            src={lightboxPhoto.url}
            alt={lightboxPhoto.title}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          />

          <div style={{ marginTop: '14px', color: '#ffffff', fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>
            {lightboxPhoto.title}
          </div>
        </div>
      )}

      {/* ================= MODAL: VIDEO PLAYER ================= */}
      {activeVideoPlayer && (() => {
        const targetUrl = (activeVideoPlayer.videoUrl || activeVideoPlayer.url || activeVideoPlayer.video_url || '').trim();
        const embedUrl = getEmbedUrl(targetUrl);
        const watchUrl = getDirectWatchUrl(targetUrl);
        const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(targetUrl);

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '880px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ background: '#0f172a', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎥 {activeVideoPlayer.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveVideoPlayer(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                  title="বন্ধ করুন"
                >
                  ✕
                </button>
              </div>

              {/* Video Player Frame */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000000' }}>
                {isDirectVideo ? (
                  <video
                    controls
                    autoPlay
                    src={targetUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <iframe
                    title={activeVideoPlayer.title}
                    src={embedUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>

              <div style={{ padding: '16px 20px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  {activeVideoPlayer.host && (
                    <div style={{ fontSize: '12.5px', color: '#047857', marginBottom: '4px', fontWeight: 800 }}>
                      👨‍🏫 {activeVideoPlayer.host}
                    </div>
                  )}
                  {activeVideoPlayer.description && (
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                      {activeVideoPlayer.description}
                    </p>
                  )}
                </div>
                {watchUrl && (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(220,38,38,0.2)'
                    }}
                    title="ইউটিউব সাইটে আলাদা উইন্ডোতে দেখতে ক্লিক করুন"
                  >
                    ▶ ইউটিউবে সরাসরি দেখুন ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: CREATE NEW PHOTO ALBUM (User Requested) ================= */}
      {showNewPhotoAlbumModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ background: '#047857', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                📸 নতুন ফটো অ্যালবাম তৈরি করুন
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPhotoAlbumModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePhotoAlbum} style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  অ্যালবামের নাম / শিরোনাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আন্তঃস্কুল ফুটবল টুর্নামেন্ট ও পুরষ্কার বিতরণী ২০২৬"
                  value={newPhotoForm.title}
                  onChange={e => setNewPhotoForm({ ...newPhotoForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ক্যাটাগরি:
                  </label>
                  <select
                    value={newPhotoForm.category}
                    onChange={e => {
                      const labels = {
                        sports: '🏆 ক্রীড়া ও উৎসব',
                        science: '🔬 বিজ্ঞান মেলা',
                        national: '🇧🇩 জাতীয় দিবস',
                        academic: '🎓 একাডেমিক ও পরীক্ষা',
                        campus: '🌿 ক্যাম্পাস ও স্কাউট',
                        cultural: '🎭 সাংস্কৃতিক অনুষ্ঠান'
                      };
                      setNewPhotoForm({
                        ...newPhotoForm,
                        category: e.target.value,
                        categoryLabel: labels[e.target.value] || '📸 সাধারণ অ্যালবাম'
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="sports">🏆 ক্রীড়া ও উৎসব</option>
                    <option value="science">🔬 বিজ্ঞান মেলা</option>
                    <option value="national">🇧🇩 জাতীয় দিবস</option>
                    <option value="academic">🎓 একাডেমিক ও পরীক্ষা</option>
                    <option value="campus">🌿 ক্যাম্পাস ও স্কাউট</option>
                    <option value="cultural">🎭 সাংস্কৃতিক অনুষ্ঠান</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    অনুষ্ঠানের তারিখ:
                  </label>
                  <input
                    type="date"
                    value={newPhotoForm.eventDate}
                    onChange={e => setNewPhotoForm({ ...newPhotoForm, eventDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  কভার ছবি (Cover Photo):
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{
                    background: '#047857',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>📷 ডিভাইস থেকে কভার ছবি বাছুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleNewCoverFileChange}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="অথবা অনলাইন লিঙ্ক দিন..."
                    value={newPhotoForm.cover.startsWith('data:') ? '✓ ডিভাইস থেকে কভার ছবি নির্বাচিত' : newPhotoForm.cover}
                    onChange={e => setNewPhotoForm({ ...newPhotoForm, cover: e.target.value })}
                    style={{ flex: 1, minWidth: '150px', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                {newPhotoForm.cover && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={newPhotoForm.cover}
                      alt="কভার প্রিভিউ"
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10b981' }}
                      onError={(e) => {
                        if (e.target.getAttribute('data-err')) return;
                        e.target.setAttribute('data-err', '1');
                        e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>✓ কভার প্রিভিউ সফল</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  বিস্তারিত বিবরণ:
                </label>
                <textarea
                  rows="2"
                  placeholder="অনুষ্ঠানের সংক্ষিপ্ত বর্ণনা, বিশেষ অতিথি এবং স্মরণীয় ঘটনার বিবরণ..."
                  value={newPhotoForm.description}
                  onChange={e => setNewPhotoForm({ ...newPhotoForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Multiple Photos Upload Section */}
              <div style={{
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                    🖼️ অ্যালবামের ছবিসমূহ ({toBn(newPhotoUploadedList.length)}টি ছবি নির্বাচিত):
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadNewSportsDemo}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #10b981',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ ৪টি ডেমো স্পোর্টস ছবি যোগ করুন
                  </button>
                </div>

                <div style={{
                  border: '2px dashed #059669',
                  borderRadius: '8px',
                  padding: '14px',
                  background: '#f0fdf4',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📂</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46', marginBottom: '2px' }}>
                    কম্পিউটার বা ফোন থেকে ছবি নির্বাচন করুন
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                    একসাথে একাধিক ছবি নির্বাচন করতে পারবেন
                  </div>
                  <label style={{
                    background: '#047857',
                    color: '#ffffff',
                    padding: '7px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>📁 ছবি ফাইল বাছুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleNewMultiplePhotosChange}
                    />
                  </label>
                  {isProcessingNewPhotos && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#047857', fontWeight: 700 }}>
                      ⏳ ছবি প্রসেসিং ও কম্প্রেস হচ্ছে...
                    </div>
                  )}
                </div>

                {newPhotoUploadedList.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '8px',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}>
                    {newPhotoUploadedList.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        style={{
                          position: 'relative',
                          background: '#ffffff',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: newPhotoForm.cover === p.url ? '2px solid #059669' : '1px solid #cbd5e1'
                        }}
                      >
                        <img
                          src={p.url}
                          alt={p.title}
                          style={{ width: '100%', height: '70px', objectFit: 'cover' }}
                          onError={(e) => {
                            if (e.target.getAttribute('data-err')) return;
                            e.target.setAttribute('data-err', '1');
                            e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewPhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '9px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPhotoForm({ ...newPhotoForm, cover: p.url })}
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '2px',
                            background: newPhotoForm.cover === p.url ? '#059669' : 'rgba(0,0,0,0.65)',
                            color: '#ffd34f',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '1px 3px',
                            fontSize: '8.5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ⭐
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <details style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                    🔗 অনলাইন ওয়েব ইমেজ লিঙ্ক (URL) দিয়ে যুক্ত করতে চান?
                  </summary>
                  <textarea
                    rows="2"
                    placeholder="https://... (প্রতি লাইনে একটি করে URL)"
                    value={newPhotoForm.photosInput}
                    onChange={e => setNewPhotoForm({ ...newPhotoForm, photosInput: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', padding: '6px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                  />
                </details>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewPhotoAlbumModal(false)}
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ✨ অ্যালবাম তৈরি ও সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW VIDEO (User Requested) ================= */}
      {showNewVideoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ background: '#0891b2', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                🎥 নতুন ভিডিও অ্যালবাম / ভিডিও যোগ করুন
              </h3>
              <button
                type="button"
                onClick={() => setShowNewVideoModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVideo} style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  ভিডিও শিরোনাম / অনুষ্ঠানের নাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: স্বাধীনতা দিবসের কুচকাওয়াজ ও বিশেষ ডিসপ্লে ২০২৬"
                  value={newVideoForm.title}
                  onChange={e => setNewVideoForm({ ...newVideoForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ভিডিওর সময়সীমা:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ১৫:২০ মি."
                    value={newVideoForm.duration}
                    onChange={e => setNewVideoForm({ ...newVideoForm, duration: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    অনুষ্ঠানের তারিখ:
                  </label>
                  <input
                    type="date"
                    value={newVideoForm.eventDate}
                    onChange={e => setNewVideoForm({ ...newVideoForm, eventDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  ইউটিউব ভিডিও লিঙ্ক (YouTube URL):
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideoForm.videoUrl}
                  onChange={e => setNewVideoForm({ ...newVideoForm, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  উপস্থাপক / নির্দেশক:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সহকারী শিক্ষক ও সাংস্কৃতিক আহ্বায়ক"
                  value={newVideoForm.host}
                  onChange={e => setNewVideoForm({ ...newVideoForm, host: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  ভিডিও বিবরণ:
                </label>
                <textarea
                  rows="3"
                  placeholder="ভিডিওর মূল বিষয়বস্তু ও বিশেষ অংশের সংক্ষিপ্ত বিবরণ..."
                  value={newVideoForm.description}
                  onChange={e => setNewVideoForm({ ...newVideoForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewVideoModal(false)}
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#0891b2',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🎥 ভিডিও সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

