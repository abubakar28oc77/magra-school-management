// LocalStorage Keys
export const LIT_PANEL_KEY = 'magra_lit_club_panel_v2';
export const LIT_EXEC_KEY = 'magra_lit_club_exec_v2';
export const LIT_MEMBERSHIPS_KEY = 'magra_lit_club_memberships_v1';
export const LIT_SUBMISSIONS_KEY = 'magra_lit_club_submissions_v1';

// Default Coordinators & Judges Data
export const DEFAULT_PANEL = {
  coordinators: [
    {
      id: 'coord-1',
      teacherId: 'T03',
      name: 'মোঃ আব্দুল খালেক',
      designation: 'সহকারী শিক্ষক (বাংলা)',
      role: 'প্রধান সমন্বয়ক (বাংলা সাহিত্য ও প্রমিত বাচন)',
      phone: '01716-223344'
    },
    {
      id: 'coord-2',
      teacherId: 'T04',
      name: 'মোঃ আশরাফুল আলম',
      designation: 'সহকারী শিক্ষক (ইংরেজি)',
      role: 'সহকারী সমন্বয়ক (ইংরেজি সাহিত্য ও Spoken English)',
      phone: '01715-112233'
    }
  ],
  chiefJudge: {
    teacherId: 'T03',
    name: 'মোঃ আব্দুল খালেক',
    designation: 'সহকারী শিক্ষক (বাংলা)',
    role: 'প্রধান বিচারক (সাহিত্য ও বাচন)'
  },
  judge1: {
    teacherId: 'T04',
    name: 'মোঃ আশরাফুল আলম',
    designation: 'সহকারী শিক্ষক (ইংরেজি)',
    role: 'বিচারক (১ম)'
  },
  judge2: {
    teacherId: 'T10',
    name: 'মোঃ শাহিনুর রহমান',
    designation: 'সহকারী শিক্ষক (গ্রন্থাগার)',
    role: 'বিচারক (২য়)'
  }
};

// Default Executive Committee
export const DEFAULT_EXEC = {
  president: { name: 'তানভীর আহমেদ', class: '১০ম', section: 'বিজ্ঞান', roll: '১', phone: '01711-001122' },
  vicePresident: { name: 'রাহাত হাসান', class: '১০ম', section: 'মানবিক', roll: '৫', phone: '01711-001123' },
  generalSecretary: { name: 'ফাতেমা আক্তার', class: '৯ম', section: 'বিজ্ঞান', roll: '২', phone: '01711-001124' },
  jointSecretary: { name: 'ফারজানা মেহজাবীন', class: '৯ম', section: 'বিজ্ঞান', roll: '৩', phone: '01711-001125' },
  organizingSecretary: { name: 'মাহির ফয়সাল', class: '৮ম', section: 'শাখা ক', roll: '১', phone: '01711-001126' },
  publicitySecretary: { name: 'নুসরাত জাহান', class: '৮ম', section: 'শাখা খ', roll: '৪', phone: '01711-001127' },
  financeSecretary: { name: 'সাদিয়া ইসলাম', class: '৯ম', section: 'ব্যবসায় শিক্ষা', roll: '৬', phone: '01711-001128' },
  members: [
    { id: 'm-1', name: 'মোনায়েম', class: '১০ম', section: 'বিজ্ঞান', roll: '৩', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-2', name: 'হাসান', class: '৯ম', section: 'মানবিক', roll: '—', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-3', name: 'মোসাঃ তানহা আক্তার', class: '৯ম', section: 'বিজ্ঞান', roll: '—', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-4', name: 'আদর্শ পাল', class: '৮ম', section: 'শাখা ক', roll: '২', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-5', name: 'অরূপ কর্মকার', class: '৮ম', section: 'শাখা খ', roll: '৬', note: 'কার্যনির্বাহী সদস্য' },
    { id: 'm-6', name: 'সুপ্ত ঘোষ', class: '৭ম', section: 'শাখা ক', roll: '১', note: 'কার্যনির্বাহী সদস্য' }
  ]
};

// Default Kishalaya Wall Magazine Items
export const DEFAULT_KISHALAYA_ITEMS = [
  {
    id: 'kish-1',
    issue: '২১শে ফেব্রুয়ারি বিশেষ সংকলন (২০২৬)',
    title: 'বর্ণমালার রক্তগোলাপ',
    author: 'ফারজানা মেহজাবীন',
    class_info: '৯ম শ্রেণি (বিজ্ঞান) • রোল ৩',
    type: 'কবিতা',
    date: '২১ ফেব্রুয়ারি, ২০২৬',
    excerpt: 'রক্তে কেনা বর্ণমালা, মায়ের মুখের বুলি / একুশ মানে মাথা নত না করা ফুলকলি...',
    full_text: `রক্তে কেনা বর্ণমালা, মায়ের মুখের বুলি
একুশ মানে মাথা নত না করা ফুলকলি।
সালাম, বরকত, রফিকের সেই আত্মত্যাগের গান,
ভাষার জন্য ঢেলে দিল অমূল্য প্রাণ।

বাংলার মাটি, বাংলার জল, বাংলার সবুজ বন,
মায়ের ভাষায় কথা কয়ে জুড়ায় মোদের মন।
শহীদ মিনারে পুষ্পার্ঘ্যে জানাই শত প্রণাম,
বুকের ভেতর অক্ষয় রবে অমর একুশ নাম।`
  },
  {
    id: 'kish-2',
    issue: 'বসন্ত ও সাহিত্য ক্রোড়পত্র',
    title: 'একটি শিউলি ঝরা সকালের গল্প',
    author: 'রাহাত হাসান',
    class_info: '১০ম শ্রেণি • রোল ৫',
    type: 'ছোটগল্প',
    date: '০১ মার্চ, ২০২৬',
    excerpt: 'পলাশ আর শিমুলের ডালে যখন আগুন লেগেছে, তখন মগড়া স্কুলের লাইব্রেরির কোণে বসে...',
    full_text: `পলাশ আর শিমুলের ডালে যখন আগুন লেগেছে, তখন মগড়া স্কুলের লাইব্রেরির কোণে বসে আমরা কয়েকজন বন্ধু আলোচনা করছিলাম নতুন দেয়াল পত্রিকার পরিকল্পনা নিয়ে। বইয়ের ঘ্রাণ আর জানালার ফাঁক গলে আসা দক্ষিণা বাতাস আমাদের মনকে এক অদ্ভুত সাহিত্যিক আবেশে ভরিয়ে দিচ্ছিল। 

খালেক স্যার মৃদু হেসে ক্লাসে ঢুকলেন, হাতে একটি নতুন কবিতার বই। বললেন, "শব্দকে ভালোবাসতে শেখো, শব্দই মানুষের আসল পরিচয়।" স্যারের সেই সহজ কথাটি আজও আমাদের লেখার প্রেরণা হয়ে আছে।`
  },
  {
    id: 'kish-3',
    issue: 'স্বাধীনতা দিবস সংখ্যা',
    title: 'Whispers of Freedom',
    author: 'তানভীর আহমেদ',
    class_info: '১০ম শ্রেণি • রোল ১',
    type: 'Creative English Writing',
    date: '২৬ মার্চ, ২০২৬',
    excerpt: 'The sunrise over the Jamuna river felt different today. It carried the rhythm of liberation...',
    full_text: `The sunrise over the Jamuna river felt different today. It carried the rhythm of liberation and the eternal sacrifice of three million martyrs. In the classrooms of Magra Palms Union High School, freedom is not just a chapter in our history textbook—it is the spirit that empowers us to speak truthfully, write courageously, and build a brighter tomorrow.`
  }
];
