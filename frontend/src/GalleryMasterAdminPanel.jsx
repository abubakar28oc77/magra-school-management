import React, { useState, useEffect, useRef } from 'react';
import { compressImageToDataUrl } from './photoStorage';
import {
  extractYouTubeId,
  generateTutorialPDF,
  downloadTutorialFile,
  playMockAudioTone,
  TUTORIALS_KEY,
  DEFAULT_TUTORIALS,
  CAMPUS_MILESTONES_KEY,
  CAMPUS_PHOTOS_KEY,
  AUDIO_TRACKS_KEY,
  DEFAULT_CAMPUS_MILESTONES,
  DEFAULT_CAMPUS_PHOTOS,
  DEFAULT_AUDIO_TRACKS
} from './GalleryMasterModalSection';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// LocalStorage Keys
const PHOTO_ALBUMS_KEY = 'magra_gallery_photo_albums_v2';
const VIDEO_ALBUMS_KEY = 'magra_gallery_video_albums_v2';
const ONLINE_CLASSES_KEY = 'magra_gallery_online_classes_v2';

export const DEFAULT_GALLERY_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23064e3b'/%3E%3Crect x='20' y='20' width='560' height='360' rx='12' fill='%23065f46' stroke='%2334d399' stroke-width='2' stroke-dasharray='6,6'/%3E%3Ccircle cx='300' cy='160' r='50' fill='%2310b981' opacity='0.35'/%3E%3Ctext x='300' y='175' font-family='sans-serif' font-size='44' text-anchor='middle' fill='%23ffffff'%3E%F0%9F%93%B8%3C/text%3E%3Ctext x='300' y='240' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3E%E0%A6%AE%E0%A6%97%E0%A7%9Call%E0%A6%BE %E0%A6%AA%E0%A6%BE%E0%A6%B2%E0%A6%B8%E0%A7%8D %E0%A6%89%E0%A6%9A%E0%A7%8D%E0%A6%9A %E0%A6%AC%E0%A6%BF%E0%A6%A6%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A6%AF%E0%A6%BC%3C/text%3E%3Ctext x='300' y='270' font-family='sans-serif' font-size='14' text-anchor='middle' fill='%23a7f3d0'%3E%E0%A6%A1%E0%A6%BF%E0%A6%9C%E0%A6%BF%E0%A6%9F%E0%A6%BE%E0%A6%B2 %E0%A6%AB%E0%A6%9F%E0%A7%8B %E0%A6%97%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%B0%E0%A6%BF%3C/text%3E%3C/svg%3E`;

export const SPORTS_PRESET_PHOTOS = [
  { id: 'sp-1', title: 'উদ্বোধনী মার্চপাস্ট ও জাতীয় পতাকা উত্তোলন', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80' },
  { id: 'sp-2', title: '১০০ মিটার স্প্রিন্ট দৌড় প্রতিযোগিতা', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80' },
  { id: 'sp-3', title: 'হাইজাম্প ও লংজাম্প প্রতিযোগিতা', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80' },
  { id: 'sp-4', title: 'বিজয়ীদের মাঝে চ্যাম্পিয়ন ট্রফি বিতরণ', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80' }
];

export function GalleryMasterAdminPanel({ sub = 'photos', setSub }) {
  const [activeTab, setActiveTab] = useState(sub || 'photos');
  const [toastMsg, setToastMsg] = useState('');

  // Storage states
  const [photoAlbums, setPhotoAlbums] = useState([]);
  const [videoAlbums, setVideoAlbums] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [tutorials, setTutorials] = useState(DEFAULT_TUTORIALS);

  // Active modal/editor states
  const [editingPhotoAlbum, setEditingPhotoAlbum] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [activePdfPreview, setActivePdfPreview] = useState(null);

  // Campus & Audio states
  const [campusMilestones, setCampusMilestones] = useState(DEFAULT_CAMPUS_MILESTONES);
  const [campusPhotos, setCampusPhotos] = useState(DEFAULT_CAMPUS_PHOTOS);
  const [audioTracks, setAudioTracks] = useState(DEFAULT_AUDIO_TRACKS);
  const [campusSubTab, setCampusSubTab] = useState('milestones'); // 'milestones' | 'photos'

  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editingCampusPhoto, setEditingCampusPhoto] = useState(null);
  const [editingAudioTrack, setEditingAudioTrack] = useState(null);
  const [activeLyricsModal, setActiveLyricsModal] = useState(null);
  const [adminPlayingAudioId, setAdminPlayingAudioId] = useState(null);
  const adminAudioRef = useRef(null);

  const [milestoneForm, setMilestoneForm] = useState({
    year: '',
    title: '',
    desc: '',
    category: 'প্রতিষ্ঠা ও সূচনা',
    badge: '🏛️ সূচনা',
    image: '',
    date: ''
  });

  const [campusPhotoForm, setCampusPhotoForm] = useState({
    title: '',
    category: 'একাডেমিক ভবন',
    desc: '',
    url: ''
  });

  const [audioForm, setAudioForm] = useState({
    title: '',
    artist: '',
    category: 'বিদ্যালয় সংগীত',
    duration: '০৩:১৫ মিনিট',
    lyrics: '',
    audio_data: '',
    file_name: '',
    file_size: '',
    date: new Date().toISOString().slice(0, 10)
  });

  // Form States
  const [tutorialForm, setTutorialForm] = useState({
    title: '',
    category: 'ict',
    categoryLabel: '💻 আইসিটি ও কম্পিউটার',
    badge: '💻 আইসিটি পাঠ',
    duration: '৩০ মিনিট',
    level: 'সকল শ্রেণি',
    instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সিনিয়র শিক্ষক, আইসিটি)',
    desc: '',
    stepsText: '',
    videoUrl: '',
    pdf_file_data: '',
    file_name: '',
    file_size: ''
  });
  const [photoForm, setPhotoForm] = useState({
    title: '',
    category: 'sports',
    categoryLabel: '🏆 ক্রীড়া ও উৎসব',
    eventDate: new Date().toISOString().slice(0, 10),
    cover: '',
    description: '',
    photosInput: ''
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);

  const [videoForm, setVideoForm] = useState({
    title: '',
    category: 'sports',
    categoryLabel: '🏆 ক্রীড়া ও উৎসব',
    eventDate: new Date().toISOString().slice(0, 10),
    duration: '১৫:০০ মি.',
    videoUrl: '',
    thumbnail: '',
    host: 'বিদ্যালয় কর্তৃপক্ষ',
    description: ''
  });

  const [classForm, setClassForm] = useState({
    className: '১০ম শ্রেণি',
    subject: 'সাধারণ গণিত',
    topic: '',
    teacher: 'মোঃ হাবিবুর রহমান',
    designation: 'সিনিয়র শিক্ষক (বিজ্ঞান ও গণিত)',
    duration: '৪০ মিনিট',
    date: new Date().toISOString().slice(0, 10),
    videoUrl: '',
    thumbnail: '',
    lectureNotes: ''
  });

  // Sync activeTab with incoming prop
  useEffect(() => {
    if (sub && sub !== activeTab) {
      setActiveTab(sub);
    }
  }, [sub]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (setSub) setSub(key);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Load from localStorage
  useEffect(() => {
    try {
      const storedPhotos = localStorage.getItem(PHOTO_ALBUMS_KEY);
      if (storedPhotos) {
        const parsed = JSON.parse(storedPhotos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove default mock albums (alb-photo-1 to alb-photo-6)
          const userOnly = parsed.filter(a => a && !String(a.id || '').startsWith('alb-photo-'));
          const listToUse = (userOnly.length > 0 ? userOnly : [
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
          ]).map(a => {
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
        }
      }

      const storedVideos = localStorage.getItem(VIDEO_ALBUMS_KEY);
      if (storedVideos) {
        try {
          const parsed = JSON.parse(storedVideos);
          if (Array.isArray(parsed)) {
            // Filter out default mock videos (vid-01 to vid-06) and normalize
            const userOnly = parsed
              .filter(v => v && !['vid-01', 'vid-02', 'vid-03', 'vid-04', 'vid-05', 'vid-06'].includes(v.id))
              .map(v => {
                const ytId = extractYouTubeId(v.videoUrl);
                let updated = { ...v };
                if (ytId) {
                  if (v.videoUrl && v.videoUrl.includes('studio.youtube.com')) {
                    updated.videoUrl = `https://www.youtube.com/watch?v=${ytId}`;
                  }
                  if (!updated.thumbnail || updated.thumbnail.includes('photo-1461896836934-ffe607ba8211')) {
                    updated.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                  }
                }
                return updated;
              });
            setVideoAlbums(userOnly);
            localStorage.setItem(VIDEO_ALBUMS_KEY, JSON.stringify(userOnly));
          } else {
            setVideoAlbums([]);
          }
        } catch {
          setVideoAlbums([]);
        }
      }

      const storedClasses = localStorage.getItem(ONLINE_CLASSES_KEY);
      if (storedClasses) {
        try {
          const parsed = JSON.parse(storedClasses);
          if (Array.isArray(parsed)) {
            // Filter out default mock classes (cls-01 to cls-06) and normalize
            const userOnly = parsed
              .filter(c => c && !['cls-01', 'cls-02', 'cls-03', 'cls-04', 'cls-05', 'cls-06'].includes(c.id))
              .map(c => {
                const ytId = extractYouTubeId(c.videoUrl);
                let updated = { ...c };
                if (ytId) {
                  if (c.videoUrl && c.videoUrl.includes('studio.youtube.com')) {
                    updated.videoUrl = `https://www.youtube.com/watch?v=${ytId}`;
                  }
                  if (!updated.thumbnail || updated.thumbnail.includes('photo-1497633762265-9d179a990aa6')) {
                    updated.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                  }
                }
                return updated;
              });
            setOnlineClasses(userOnly);
            localStorage.setItem(ONLINE_CLASSES_KEY, JSON.stringify(userOnly));
          } else {
            setOnlineClasses([]);
          }
        } catch {
          setOnlineClasses([]);
        }
      }

      const storedTutorials = localStorage.getItem(TUTORIALS_KEY);
      if (storedTutorials !== null) {
        try {
          const parsed = JSON.parse(storedTutorials);
          if (Array.isArray(parsed)) {
            setTutorials(parsed);
          } else {
            setTutorials(DEFAULT_TUTORIALS);
          }
        } catch {
          setTutorials(DEFAULT_TUTORIALS);
        }
      } else {
        setTutorials(DEFAULT_TUTORIALS);
        try { localStorage.setItem(TUTORIALS_KEY, JSON.stringify(DEFAULT_TUTORIALS)); } catch {}
      }

      // Campus Milestones
      const storedMilestones = localStorage.getItem(CAMPUS_MILESTONES_KEY);
      if (storedMilestones !== null) {
        try {
          const parsed = JSON.parse(storedMilestones);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCampusMilestones(parsed);
          } else {
            setCampusMilestones(DEFAULT_CAMPUS_MILESTONES);
          }
        } catch {
          setCampusMilestones(DEFAULT_CAMPUS_MILESTONES);
        }
      } else {
        setCampusMilestones(DEFAULT_CAMPUS_MILESTONES);
        try { localStorage.setItem(CAMPUS_MILESTONES_KEY, JSON.stringify(DEFAULT_CAMPUS_MILESTONES)); } catch {}
      }

      // Campus Photos
      const storedCampusPhotos = localStorage.getItem(CAMPUS_PHOTOS_KEY);
      if (storedCampusPhotos !== null) {
        try {
          const parsed = JSON.parse(storedCampusPhotos);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCampusPhotos(parsed);
          } else {
            setCampusPhotos(DEFAULT_CAMPUS_PHOTOS);
          }
        } catch {
          setCampusPhotos(DEFAULT_CAMPUS_PHOTOS);
        }
      } else {
        setCampusPhotos(DEFAULT_CAMPUS_PHOTOS);
        try { localStorage.setItem(CAMPUS_PHOTOS_KEY, JSON.stringify(DEFAULT_CAMPUS_PHOTOS)); } catch {}
      }

      // Audio Tracks
      const storedAudio = localStorage.getItem(AUDIO_TRACKS_KEY);
      if (storedAudio !== null) {
        try {
          const parsed = JSON.parse(storedAudio);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAudioTracks(parsed);
          } else {
            setAudioTracks(DEFAULT_AUDIO_TRACKS);
          }
        } catch {
          setAudioTracks(DEFAULT_AUDIO_TRACKS);
        }
      } else {
        setAudioTracks(DEFAULT_AUDIO_TRACKS);
        try { localStorage.setItem(AUDIO_TRACKS_KEY, JSON.stringify(DEFAULT_AUDIO_TRACKS)); } catch {}
      }
    } catch {
      setTutorials(DEFAULT_TUTORIALS);
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

  const saveTutorials = (data) => {
    setTutorials(data);
    try { localStorage.setItem(TUTORIALS_KEY, JSON.stringify(data)); } catch {}
  };

  const saveCampusMilestones = (data) => {
    setCampusMilestones(data);
    try { localStorage.setItem(CAMPUS_MILESTONES_KEY, JSON.stringify(data)); } catch {}
  };

  const saveCampusPhotos = (data) => {
    setCampusPhotos(data);
    try { localStorage.setItem(CAMPUS_PHOTOS_KEY, JSON.stringify(data)); } catch {}
  };

  const saveAudioTracks = (data) => {
    setAudioTracks(data);
    try { localStorage.setItem(AUDIO_TRACKS_KEY, JSON.stringify(data)); } catch {}
  };

  const handleMilestoneImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.8);
      setMilestoneForm(prev => ({ ...prev, image: dataUrl }));
      showToast('✓ মাইলফলকের ছবি প্রস্তুত হয়েছে!');
    } catch {
      alert('ছবি আপলোডে সমস্যা হয়েছে।');
    }
  };

  const handleCampusPhotoImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.8);
      setCampusPhotoForm(prev => ({ ...prev, url: dataUrl }));
      showToast('✓ অবকাঠামো ছবি প্রস্তুত হয়েছে!');
    } catch {
      alert('ছবি আপলোডে সমস্যা হয়েছে।');
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/x-m4a'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(ext)) {
      alert('অনুগ্রহ করে শুধুমাত্র অডিও ফাইল (MP3, WAV, M4A, OGG) নির্বাচন করুন!');
      return;
    }
    const szMB = file.size / (1024 * 1024);
    if (szMB > 15) {
      alert('অডিও ফাইল সর্বোচ্চ ১৫ মেগাবাইট পর্যন্ত হতে পারে।');
      return;
    }
    const formatted = szMB >= 1 ? `${szMB.toFixed(1)} মেগাবাইট` : `${Math.round(file.size / 1024)} কিলোবাইট`;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAudioForm(prev => ({
        ...prev,
        audio_data: ev.target.result,
        file_name: file.name,
        file_size: formatted
      }));
      showToast(`✓ অডিও ফাইল "${file.name}" যুক্ত হয়েছে!`);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleAdminPlayAudio = (track) => {
    if (adminPlayingAudioId === track.id) {
      if (adminAudioRef.current) {
        adminAudioRef.current.pause();
      }
      setAdminPlayingAudioId(null);
      return;
    }

    if (adminAudioRef.current) {
      adminAudioRef.current.pause();
      adminAudioRef.current = null;
    }

    if (track.audio_data && track.audio_data.startsWith('data:audio')) {
      try {
        const aud = new Audio(track.audio_data);
        adminAudioRef.current = aud;
        aud.onended = () => setAdminPlayingAudioId(null);
        aud.onerror = () => {
          playMockAudioTone();
          setAdminPlayingAudioId(null);
        };
        aud.play().catch(() => {
          playMockAudioTone();
        });
        setAdminPlayingAudioId(track.id);
      } catch {
        playMockAudioTone();
        setAdminPlayingAudioId(track.id);
        setTimeout(() => setAdminPlayingAudioId(null), 1200);
      }
    } else {
      playMockAudioTone();
      setAdminPlayingAudioId(track.id);
      setTimeout(() => setAdminPlayingAudioId(null), 1200);
      showToast(`▶ "${track.title}" সিমুলেটেড টোন অডিও প্লে হচ্ছে...`);
    }
  };

  const handleDownloadAudioTrack = (track) => {
    if (track.audio_data && track.audio_data.startsWith('data:audio')) {
      const a = document.createElement('a');
      a.href = track.audio_data;
      a.download = track.file_name || `${track.title.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`✓ "${track.title}" ডাউনলোড শুরু হয়েছে।`);
    } else {
      alert(`"${track.title}" ট্র্যাকে এখনও আসল এমপি৩ অডিও ফাইল আপলোড করা হয়নি। আপনি 'সম্পাদনা' বোতামে ক্লিক করে আসল অডিও ফাইল আপলোড করে নিতে পারেন।`);
    }
  };

  const handleSubmitMilestone = (e) => {
    e.preventDefault();
    if (!milestoneForm.year.trim()) {
      alert('অনুগ্রহ করে মাইলফলকের সাল বা সন উল্লেখ করুন!');
      return;
    }
    if (!milestoneForm.title.trim()) {
      alert('অনুগ্রহ করে মাইলফলকের শিরোনাম লিখুন!');
      return;
    }
    if (!milestoneForm.desc.trim()) {
      alert('অনুগ্রহ করে মাইলফলকের বিবরণ লিখুন!');
      return;
    }

    if (editingMilestone) {
      const updated = campusMilestones.map(m => {
        if (m.id === editingMilestone.id) {
          return {
            ...m,
            year: milestoneForm.year.trim(),
            title: milestoneForm.title.trim(),
            desc: milestoneForm.desc.trim(),
            category: milestoneForm.category || 'প্রতিষ্ঠা ও সূচনা',
            badge: milestoneForm.badge || `🏛️ ${milestoneForm.year.trim()}`,
            image: milestoneForm.image || '',
            date: milestoneForm.date || milestoneForm.year.trim()
          };
        }
        return m;
      });
      saveCampusMilestones(updated);
      setEditingMilestone(null);
      showToast('✓ ঐতিহাসিক মাইলফলক সফলভাবে হালনাগাদ করা হয়েছে!');
    } else {
      const newM = {
        id: `mls-${Date.now()}`,
        year: milestoneForm.year.trim(),
        title: milestoneForm.title.trim(),
        desc: milestoneForm.desc.trim(),
        category: milestoneForm.category || 'প্রতিষ্ঠা ও সূচনা',
        badge: milestoneForm.badge || `🏛️ ${milestoneForm.year.trim()}`,
        image: milestoneForm.image || '',
        date: milestoneForm.date || milestoneForm.year.trim()
      };
      saveCampusMilestones([newM, ...campusMilestones]);
      showToast('✓ নতুন মাইলফলক সফলভাবে সংরক্ষিত হয়েছে!');
    }

    setMilestoneForm({
      year: '',
      title: '',
      desc: '',
      category: 'প্রতিষ্ঠা ও সূচনা',
      badge: '🏛️ সূচনা',
      image: '',
      date: ''
    });
  };

  const handleSubmitCampusPhoto = (e) => {
    e.preventDefault();
    if (!campusPhotoForm.title.trim()) {
      alert('অনুগ্রহ করে আলোকচিত্রের শিরোনাম লিখুন!');
      return;
    }
    if (!campusPhotoForm.url.trim()) {
      alert('অনুগ্রহ করে ছবি নির্বাচন বা ছবির URL প্রদান করুন!');
      return;
    }

    if (editingCampusPhoto) {
      const updated = campusPhotos.map(p => {
        if (p.id === editingCampusPhoto.id) {
          return {
            ...p,
            title: campusPhotoForm.title.trim(),
            category: campusPhotoForm.category || 'একাডেমিক ভবন',
            desc: campusPhotoForm.desc.trim(),
            url: campusPhotoForm.url.trim()
          };
        }
        return p;
      });
      saveCampusPhotos(updated);
      setEditingCampusPhoto(null);
      showToast('✓ ক্যাম্পাস অবকাঠামো আলোকচিত্র হালনাগাদ করা হয়েছে!');
    } else {
      const newP = {
        id: `cp-${Date.now()}`,
        title: campusPhotoForm.title.trim(),
        category: campusPhotoForm.category || 'একাডেমিক ভবন',
        desc: campusPhotoForm.desc.trim(),
        url: campusPhotoForm.url.trim()
      };
      saveCampusPhotos([newP, ...campusPhotos]);
      showToast('✓ নতুন ক্যাম্পাস আলোকচিত্র যোগ করা হয়েছে!');
    }

    setCampusPhotoForm({
      title: '',
      category: 'একাডেমিক ভবন',
      desc: '',
      url: ''
    });
  };

  const handleSubmitAudioTrack = (e) => {
    e.preventDefault();
    if (!audioForm.title.trim()) {
      alert('অনুগ্রহ করে অডিও / গানের শিরোনাম লিখুন!');
      return;
    }
    if (!audioForm.artist.trim()) {
      alert('অনুগ্রহ করে শিল্পী / পরিবেশকের নাম লিখুন!');
      return;
    }

    if (editingAudioTrack) {
      const updated = audioTracks.map(a => {
        if (a.id === editingAudioTrack.id) {
          return {
            ...a,
            title: audioForm.title.trim(),
            artist: audioForm.artist.trim(),
            category: audioForm.category || 'বিদ্যালয় সংগীত',
            duration: audioForm.duration.trim() || '০৩:১৫ মিনিট',
            lyrics: audioForm.lyrics.trim(),
            audio_data: audioForm.audio_data || a.audio_data,
            file_name: audioForm.file_name || a.file_name,
            file_size: audioForm.file_size || a.file_size,
            date: audioForm.date || a.date
          };
        }
        return a;
      });
      saveAudioTracks(updated);
      setEditingAudioTrack(null);
      showToast('✓ অডিও ট্র্যাক সফলভাবে হালনাগাদ করা হয়েছে!');
    } else {
      const newA = {
        id: `aud-${Date.now()}`,
        title: audioForm.title.trim(),
        artist: audioForm.artist.trim(),
        category: audioForm.category || 'বিদ্যালয় সংগীত',
        duration: audioForm.duration.trim() || '০৩:১৫ মিনিট',
        lyrics: audioForm.lyrics.trim(),
        audio_data: audioForm.audio_data || '',
        file_name: audioForm.file_name || `${audioForm.title.trim().replace(/\s+/g, '_')}.mp3`,
        file_size: audioForm.file_size || (audioForm.audio_data ? '৩.৫ মেগাবাইট' : '৩.০ মেগাবাইট'),
        date: audioForm.date || new Date().toISOString().slice(0, 10)
      };
      saveAudioTracks([newA, ...audioTracks]);
      showToast('✓ নতুন অডিও ট্র্যাক সফলভাবে সংরক্ষিত হয়েছে!');
    }

    setAudioForm({
      title: '',
      artist: '',
      category: 'বিদ্যালয় সংগীত',
      duration: '০৩:১৫ মিনিট',
      lyrics: '',
      audio_data: '',
      file_name: '',
      file_size: '',
      date: new Date().toISOString().slice(0, 10)
    });
  };

  const handleRestoreDefaultMilestones = () => {
    if (window.confirm('আপনি কি ডিফল্ট ৫টি ঐতিহাসিক মাইলফলক তালিকায় পুনরুদ্ধার করতে চান?')) {
      saveCampusMilestones(DEFAULT_CAMPUS_MILESTONES);
      showToast('✓ ডিফল্ট ঐতিহাসিক মাইলফলক পুনরুদ্ধার করা হয়েছে।');
    }
  };

  const handleRestoreDefaultCampusPhotos = () => {
    if (window.confirm('আপনি কি ডিফল্ট ৪টি ক্যাম্পাস অবকাঠামো ছবি পুনরুদ্ধার করতে চান?')) {
      saveCampusPhotos(DEFAULT_CAMPUS_PHOTOS);
      showToast('✓ ডিফল্ট ক্যাম্পাস আলোকচিত্র পুনরুদ্ধার করা হয়েছে।');
    }
  };

  const handleRestoreDefaultAudioTracks = () => {
    if (window.confirm('আপনি কি ডিফল্ট সাংস্কৃতিক অডিও গানের তালিকা পুনরুদ্ধার করতে চান?')) {
      saveAudioTracks(DEFAULT_AUDIO_TRACKS);
      showToast('✓ ডিফল্ট সাংস্কৃতিক গান ও অডিও তালিকা পুনরুদ্ধার করা হয়েছে।');
    }
  };

  const handleTutorialPdfSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('অনুগ্রহ করে শুধুমাত্র PDF (.pdf) ফাইল নির্বাচন করুন!');
      return;
    }
    const szMB = file.size / (1024 * 1024);
    if (szMB > 10) {
      alert('ফাইল সাইজ সর্বোচ্চ ১০ মেগাবাইট পর্যন্ত হতে পারে।');
      return;
    }
    const formatted = szMB >= 1 ? `${szMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTutorialForm(prev => ({
        ...prev,
        pdf_file_data: ev.target.result,
        file_name: file.name,
        file_size: formatted
      }));
      showToast(`✓ PDF ফাইল "${file.name}" যুক্ত হয়েছে (${formatted})`);
    };
    reader.onerror = () => {
      alert('ফাইলটি পড়তে সমস্যা হয়েছে। অন্য কোনো ফাইল নির্বাচন করুন।');
    };
    reader.readAsDataURL(file);
  };

  const handleClearTutorialPdf = () => {
    setTutorialForm(prev => ({
      ...prev,
      pdf_file_data: '',
      file_name: '',
      file_size: ''
    }));
  };

  const handleSubmitTutorial = (e) => {
    e.preventDefault();
    if (!tutorialForm.title.trim()) {
      alert('অনুগ্রহ করে টিউটোরিয়ালের শিরোনাম লিখুন!');
      return;
    }
    const steps = tutorialForm.stepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (steps.length === 0 && !tutorialForm.pdf_file_data) {
      alert('অনুগ্রহ করে অন্তত ১টি অনুশীলনের ধাপ লিখুন অথবা একটি PDF গাইড ফাইল আপলোড করুন!');
      return;
    }
    const finalSteps = steps.length > 0 
      ? steps 
      : ['সংযুক্ত অফিশিয়াল PDF হ্যান্ডআউট ও ল্যাব শিট অনুসরণ করে ধাপগুলো অনুশীলন করুন।'];

    if (editingTutorial) {
      const updated = tutorials.map(t => t.id === editingTutorial.id ? {
        ...t,
        title: tutorialForm.title.trim(),
        category: tutorialForm.category,
        categoryLabel: tutorialForm.categoryLabel,
        badge: tutorialForm.badge.trim() || '💡 ব্যবহারিক পাঠ',
        duration: tutorialForm.duration.trim() || '৩০ মিনিট',
        level: tutorialForm.level.trim() || 'সকল শ্রেণি',
        instructor: tutorialForm.instructor.trim() || 'আইসিটি ও বিজ্ঞান বিভাগ',
        desc: tutorialForm.desc.trim() || 'ব্যবহারিক ল্যাব শিট ও অনুশীলনী গাইড।',
        steps: finalSteps,
        videoUrl: tutorialForm.videoUrl.trim(),
        pdf_file_data: tutorialForm.pdf_file_data || '',
        file_name: tutorialForm.file_name || '',
        file_size: tutorialForm.file_size || ''
      } : t);
      saveTutorials(updated);
      showToast('✓ টিউটোরিয়াল তথ্য সফলভাবে আপডেট হয়েছে!');
      setEditingTutorial(null);
    } else {
      const newTut = {
        id: `tut-${Date.now()}`,
        title: tutorialForm.title.trim(),
        category: tutorialForm.category,
        categoryLabel: tutorialForm.categoryLabel,
        badge: tutorialForm.badge.trim() || '💡 ব্যবহারিক পাঠ',
        duration: tutorialForm.duration.trim() || '৩০ মিনিট',
        level: tutorialForm.level.trim() || 'সকল শ্রেণি',
        instructor: tutorialForm.instructor.trim() || 'আইসিটি ও বিজ্ঞান বিভাগ',
        date: new Date().toISOString().slice(0, 10),
        desc: tutorialForm.desc.trim() || 'ব্যবহারিক ল্যাব শিট ও অনুশীলনী গাইড।',
        steps: finalSteps,
        videoUrl: tutorialForm.videoUrl.trim(),
        pdf_file_data: tutorialForm.pdf_file_data || '',
        file_name: tutorialForm.file_name || '',
        file_size: tutorialForm.file_size || '',
        isCustom: true
      };
      saveTutorials([newTut, ...tutorials]);
      showToast('✓ চমৎকার! নতুন টিউটোরিয়াল ও PDF গাইড সফলভাবে প্রকাশিত হয়েছে!');
    }

    setTutorialForm({
      title: '',
      category: 'ict',
      categoryLabel: '💻 আইসিটি ও কম্পিউটার',
      badge: '💻 আইসিটি পাঠ',
      duration: '৩০ মিনিট',
      level: 'সকল শ্রেণি',
      instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সিনিয়র শিক্ষক, আইসিটি)',
      desc: '',
      stepsText: '',
      videoUrl: '',
      pdf_file_data: '',
      file_name: '',
      file_size: ''
    });
  };

  // Handle Cover File Upload
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingPhotos(true);
      const dataUrl = await compressImageToDataUrl(file, 900, 0.8);
      if (dataUrl) {
        setPhotoForm(prev => ({ ...prev, cover: dataUrl }));
        showToast('✓ কভার ছবি সফলভাবে নির্বাচন ও প্রসেস হয়েছে!');
      }
    } catch {
      alert('কভার ছবি প্রসেসিংয়ে সমস্যা হয়েছে।');
    } finally {
      setIsProcessingPhotos(false);
      e.target.value = '';
    }
  };

  // Handle Multiple Photos Upload from Device
  const handleMultiplePhotosChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setIsProcessingPhotos(true);
      const newItems = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageToDataUrl(file, 900, 0.78);
        if (dataUrl) {
          const serial = uploadedPhotos.length + newItems.length + 1;
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          newItems.push({
            id: `p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            title: photoForm.title ? `${photoForm.title} - ছবি ${toBn(serial)}` : cleanName,
            url: dataUrl
          });
        }
      }
      if (newItems.length > 0) {
        setUploadedPhotos(prev => [...prev, ...newItems]);
        setPhotoForm(prev => prev.cover ? prev : { ...prev, cover: newItems[0].url });
        showToast(`✓ ${toBn(newItems.length)}টি ছবি সফলভাবে যুক্ত হয়েছে!`);
      }
    } catch (err) {
      alert('ছবি আপলোডে সমস্যা হয়েছে: ' + (err.message || 'অজানা ত্রুটি'));
    } finally {
      setIsProcessingPhotos(false);
      e.target.value = '';
    }
  };

  // Remove photo from uploaded list
  const handleRemovePhoto = (indexToRemove) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Load 4 authentic Sports Demo photos for 1-click fix
  const handleLoadSportsDemoPhotos = () => {
    setUploadedPhotos(SPORTS_PRESET_PHOTOS);
    setPhotoForm(prev => ({
      ...prev,
      cover: SPORTS_PRESET_PHOTOS[0].url
    }));
    showToast('✓ ৪টি স্পোর্টস আলোকচিত্র সফলভাবে যুক্ত হয়েছে!');
  };

  // Submit Photo Album Form
  const handleSubmitPhotoAlbum = (e) => {
    e.preventDefault();
    if (!photoForm.title.trim()) {
      alert('অনুগ্রহ করে অ্যালবামের নাম দিন!');
      return;
    }

    const defaultCover = SPORTS_PRESET_PHOTOS[0].url;
    let finalCover = photoForm.cover.trim();

    let parsedPhotos = [...uploadedPhotos];
    if (photoForm.photosInput && photoForm.photosInput.trim()) {
      const urls = photoForm.photosInput.split('\n').map(u => u.trim()).filter(Boolean);
      urls.forEach((url, idx) => {
        parsedPhotos.push({
          id: `p-${Date.now()}-${idx}`,
          title: `${photoForm.title} - ছবি ${toBn(parsedPhotos.length + 1)}`,
          url
        });
      });
    }

    if (!finalCover) {
      if (parsedPhotos.length > 0 && parsedPhotos[0].url) {
        finalCover = parsedPhotos[0].url;
      } else {
        finalCover = defaultCover;
      }
    }

    if (!parsedPhotos.length) {
      parsedPhotos = [
        { id: `p-${Date.now()}-1`, title: `${photoForm.title} - কভার আলোকচিত্র`, url: finalCover }
      ];
    }

    if (editingPhotoAlbum) {
      const updated = photoAlbums.map(a => a.id === editingPhotoAlbum.id ? {
        ...a,
        title: photoForm.title.trim(),
        category: photoForm.category,
        categoryLabel: photoForm.categoryLabel,
        eventDate: photoForm.eventDate,
        photoCount: parsedPhotos.length,
        cover: finalCover,
        description: photoForm.description.trim(),
        photos: parsedPhotos
      } : a);
      savePhotoAlbums(updated);
      showToast('✓ ফটো অ্যালবামটি সফলভাবে আপডেট হয়েছে এবং ভিউ পেজে প্রদর্শিত হচ্ছে!');
      setEditingPhotoAlbum(null);
    } else {
      const newAlbum = {
        id: `alb-${Date.now()}`,
        title: photoForm.title.trim(),
        category: photoForm.category,
        categoryLabel: photoForm.categoryLabel,
        eventDate: photoForm.eventDate,
        photoCount: parsedPhotos.length,
        cover: finalCover,
        description: photoForm.description.trim() || 'মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় অ্যালবাম।',
        photos: parsedPhotos,
        isCustom: true
      };
      savePhotoAlbums([newAlbum, ...photoAlbums]);
      showToast('✓ চমৎকার! নতুন ফটো অ্যালবামটি তৈরি হয়েছে এবং ভিউ পেজের ফটো গ্যালারিতে সরাসরি যুক্ত হয়েছে!');
    }

    setPhotoForm({
      title: '',
      category: 'sports',
      categoryLabel: '🏆 ক্রীড়া ও উৎসব',
      eventDate: new Date().toISOString().slice(0, 10),
      cover: '',
      description: '',
      photosInput: ''
    });
    setUploadedPhotos([]);
  };

  // Submit Video Form
  const handleSubmitVideo = (e) => {
    e.preventDefault();
    if (!videoForm.title.trim()) {
      alert('অনুগ্রহ করে ভিডিও শিরোনাম দিন!');
      return;
    }

    const ytId = extractYouTubeId(videoForm.videoUrl);
    const cleanUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : (videoForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const defaultThumb = ytId 
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
    const finalThumb = videoForm.thumbnail.trim() || defaultThumb;

    if (editingVideo) {
      const updated = videoAlbums.map(v => v.id === editingVideo.id ? {
        ...v,
        title: videoForm.title.trim(),
        category: videoForm.category,
        categoryLabel: videoForm.categoryLabel,
        eventDate: videoForm.eventDate,
        duration: videoForm.duration || '১৫:০০ মি.',
        videoUrl: cleanUrl,
        thumbnail: finalThumb,
        host: videoForm.host.trim() || 'বিদ্যালয় উপস্থাপক',
        description: videoForm.description.trim()
      } : v);
      saveVideoAlbums(updated);
      showToast('✓ ভিডিও তথ্য সফলভাবে আপডেট হয়েছে!');
      setEditingVideo(null);
    } else {
      const newVid = {
        id: `vid-${Date.now()}`,
        title: videoForm.title.trim(),
        category: videoForm.category,
        categoryLabel: videoForm.categoryLabel,
        eventDate: videoForm.eventDate,
        duration: videoForm.duration || '১৫:০০ মি.',
        videoType: 'youtube',
        videoUrl: cleanUrl,
        thumbnail: finalThumb,
        host: videoForm.host.trim() || 'বিদ্যালয় কর্তৃপক্ষ',
        description: videoForm.description.trim() || 'বিদ্যালয় ভিডিও রেকর্ড।',
        isCustom: true
      };
      saveVideoAlbums([newVid, ...videoAlbums]);
      showToast('✓ নতুন ভিডিওটি সফলভাবে গ্যালারিতে যুক্ত হয়েছে!');
    }

    setVideoForm({
      title: '',
      category: 'sports',
      categoryLabel: '🏆 ক্রীড়া ও উৎসব',
      eventDate: new Date().toISOString().slice(0, 10),
      duration: '১৫:০০ মি.',
      videoUrl: '',
      thumbnail: '',
      host: 'বিদ্যালয় কর্তৃপক্ষ',
      description: ''
    });
  };

  // Submit Online Class Form
  const handleSubmitClass = (e) => {
    e.preventDefault();
    if (!classForm.topic.trim()) {
      alert('অনুগ্রহ করে ক্লাসের বিষয় বা অধ্যায়ের শিরোনাম লিখুন!');
      return;
    }

    const ytId = extractYouTubeId(classForm.videoUrl);
    const cleanUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : (classForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const defaultThumb = ytId 
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80';
    const finalThumb = classForm.thumbnail.trim() || defaultThumb;

    if (editingClass) {
      const updated = onlineClasses.map(c => c.id === editingClass.id ? {
        ...c,
        className: classForm.className,
        subject: classForm.subject,
        topic: classForm.topic.trim(),
        teacher: classForm.teacher.trim(),
        designation: classForm.designation.trim(),
        duration: classForm.duration,
        date: classForm.date,
        videoUrl: cleanUrl,
        thumbnail: finalThumb,
        lectureNotes: classForm.lectureNotes.trim() || 'lecture_handout.pdf'
      } : c);
      saveOnlineClasses(updated);
      showToast('✓ অনলাইন ক্লাস তথ্য সফলভাবে আপডেট হয়েছে!');
      setEditingClass(null);
    } else {
      const newClass = {
        id: `cls-${Date.now()}`,
        className: classForm.className,
        subject: classForm.subject,
        topic: classForm.topic.trim(),
        teacher: classForm.teacher.trim() || 'নির্ধারিত শিক্ষক',
        designation: classForm.designation.trim() || 'সহকারী শিক্ষক',
        duration: classForm.duration || '৪০ মিনিট',
        date: classForm.date || new Date().toISOString().slice(0, 10),
        videoUrl: cleanUrl,
        thumbnail: finalThumb,
        lectureNotes: classForm.lectureNotes.trim() || 'lecture_handout.pdf',
        isCustom: true
      };
      saveOnlineClasses([newClass, ...onlineClasses]);
      showToast('✓ চমৎকার! নতুন অনলাইন ক্লাসটি সফলভাবে আপলোড ও ভিউ পেজে যুক্ত হয়েছে!');
    }

    setClassForm({
      className: '১০ম শ্রেণি',
      subject: 'সাধারণ গণিত',
      topic: '',
      teacher: 'মোঃ হাবিবুর রহমান',
      designation: 'সিনিয়র শিক্ষক (বিজ্ঞান ও গণিত)',
      duration: '৪০ মিনিট',
      date: new Date().toISOString().slice(0, 10),
      videoUrl: '',
      thumbnail: '',
      lectureNotes: ''
    });
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif", color: '#0f172a' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#047857',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          fontSize: '13.5px',
          fontWeight: 800,
          zIndex: 10000
        }}>
          {toastMsg}
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #065f46 50%, #0d9488 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '3px 12px', borderRadius: '15px', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>
            <span>🖼️</span> মিডিয়া, ফটো, ভিডিও ও অনলাইন ক্লাস ম্যানেজমেন্ট
          </div>
          <h2 style={{ margin: '2px 0 4px 0', fontSize: '21px', fontWeight: 900 }}>
            গ্যালারি ও ডিজিটাল কনটেন্ট এন্ট্রি ড্যাশবোর্ড
          </h2>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#ccfbf1' }}>
            এখানে ফটো অ্যালবাম তৈরি, ভিডিও লিংক যোগ, অনলাইন ক্লাস শিডিউল বা টিউটোরিয়াল আপলোড করলে তা সাথে সাথে ওয়েবসাইটের গ্যালারি মেনুতে লাইভ দৃশ্যমান হবে।
          </p>
        </div>
      </div>

      {/* Submenu Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        {[
          { key: 'photos', label: '📸 ফটো গ্যালারি ও অ্যালবাম এন্ট্রি', count: photoAlbums.length },
          { key: 'videos', label: '🎥 ভিডিও গ্যালারি ও ভিডিও যোগ', count: videoAlbums.length },
          { key: 'classes', label: '🎓 অনলাইন ক্লাস আপলোড', count: onlineClasses.length },
          { key: 'tutorials', label: '💡 টিউটোরিয়াল একাডেমি', count: tutorials.length },
          { key: 'campus', label: '🏛️ ক্যাম্পাস ও স্মৃতি মাইলফলক', count: campusMilestones.length + campusPhotos.length },
          { key: 'audio', label: '🎵 অডিও ও সাংস্কৃতিক গান', count: audioTracks.length }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                background: isActive ? '#047857' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? 'none' : '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {toBn(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: PHOTO ALBUMS ENTRY ================= */}
      {activeTab === 'photos' && (
        <div>
          {/* New Album Creation Form Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
              {editingPhotoAlbum ? '✏️ ফটো অ্যালবাম সম্পাদনা' : '📸 + নতুন ফটো অ্যালবাম তৈরি ও ছবি আপলোড করুন'}
            </h3>

            <form onSubmit={handleSubmitPhotoAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  অ্যালবামের নাম / শিরোনাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ ২০২৬"
                  value={photoForm.title}
                  onChange={e => setPhotoForm({ ...photoForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ক্যাটাগরি:
                  </label>
                  <select
                    value={photoForm.category}
                    onChange={e => {
                      const labels = {
                        sports: '🏆 ক্রীড়া ও উৎসব',
                        science: '🔬 বিজ্ঞান মেলা',
                        national: '🇧🇩 জাতীয় দিবস',
                        academic: '🎓 একাডেমিক ও পরীক্ষা',
                        campus: '🌿 ক্যাম্পাস ও স্কাউট',
                        cultural: '🎭 সাংস্কৃতিক অনুষ্ঠান'
                      };
                      setPhotoForm({
                        ...photoForm,
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
                    value={photoForm.eventDate}
                    onChange={e => setPhotoForm({ ...photoForm, eventDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
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
                      <span>📷 ফাইল বাছুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleCoverFileChange}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="অথবা ইমেজ URL দিন..."
                      value={photoForm.cover.startsWith('data:') ? '✓ ডিভাইস থেকে কভার ছবি নির্বাচিত' : photoForm.cover}
                      onChange={e => setPhotoForm({ ...photoForm, cover: e.target.value })}
                      style={{ flex: 1, minWidth: '150px', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  {photoForm.cover && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={photoForm.cover}
                        alt="কভার প্রিভিউ"
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10b981' }}
                        onError={(e) => {
                          if (e.target.getAttribute('data-err')) return;
                          e.target.setAttribute('data-err', '1');
                          e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>✓ কভার প্রিভিউ</span>
                      <button
                        type="button"
                        onClick={() => setPhotoForm({ ...photoForm, cover: '' })}
                        style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        রিমুভ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  অ্যালবামের বিবরণ:
                </label>
                <textarea
                  rows="2"
                  placeholder="অনুষ্ঠানের বর্ণনা ও বিশেষ আকর্ষণ..."
                  value={photoForm.description}
                  onChange={e => setPhotoForm({ ...photoForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {/* Multiple Photos Upload Section */}
              <div style={{
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '16px',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🖼️</span> অ্যালবামের ছবিসমূহ ({toBn(uploadedPhotos.length)}টি ছবি যুক্ত আছে):
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSportsDemoPhotos}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1.5px solid #10b981',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="স্পোর্টস প্রতিযোগিতার ৪টি আসল ডেমো ছবি দিয়ে স্বয়ংক্রিয় ঠিক করুন"
                  >
                    ⚡ ৪টি ডেমো স্পোর্টস ছবি দিয়ে স্বয়ংক্রিয় ঠিক করুন
                  </button>
                </div>

                {/* Device File Picker Dropzone */}
                <div style={{
                  border: '2px dashed #059669',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#f0fdf4',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>📂</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#065f46', marginBottom: '3px' }}>
                    আপনার কম্পিউটার বা ফোন থেকে ছবি নির্বাচন করুন
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '10px' }}>
                    JPG, PNG বা WEBP ছবি নির্বাচন করুন (একাধিক ছবি একসাথে নির্বাচন করা যাবে)
                  </div>
                  <label style={{
                    background: '#047857',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(4,120,87,0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>📁 ডিভাইস থেকে ছবি ফাইল বাছুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleMultiplePhotosChange}
                    />
                  </label>
                  {isProcessingPhotos && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                      ⏳ ছবি প্রসেসিং ও কম্প্রেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                    </div>
                  )}
                </div>

                {/* Selected Photos Thumbnails Strip */}
                {uploadedPhotos.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      নির্বাচিত ছবিসমূহ (কভার করতে ⭐ বাটনে ক্লিক করুন অথবা বাদ দিতে ✕ এ ক্লিক করুন):
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '8px',
                      maxHeight: '250px',
                      overflowY: 'auto',
                      padding: '4px'
                    }}>
                      {uploadedPhotos.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          style={{
                            position: 'relative',
                            background: '#ffffff',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: photoForm.cover === p.url ? '2px solid #059669' : '1px solid #cbd5e1',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                          }}
                        >
                          <img
                            src={p.url}
                            alt={p.title}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                            onError={(e) => {
                              if (e.target.getAttribute('data-err')) return;
                              e.target.setAttribute('data-err', '1');
                              e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                            }}
                          />
                          <div style={{ padding: '3px 5px', fontSize: '10.5px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {toBn(idx + 1)}. {p.title || `ছবি ${toBn(idx + 1)}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                            title="ছবিটি বাদ দিন"
                          >
                            ✕
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoForm({ ...photoForm, cover: p.url })}
                            style={{
                              position: 'absolute',
                              bottom: '22px',
                              left: '3px',
                              background: photoForm.cover === p.url ? '#059669' : 'rgba(0,0,0,0.65)',
                              color: photoForm.cover === p.url ? '#ffffff' : '#ffd34f',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '1px 4px',
                              fontSize: '9px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                            title="এই ছবিটিকে অ্যালবামের কভার বানান"
                          >
                            {photoForm.cover === p.url ? '✓ কভার' : '⭐ কভার'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Online URL input */}
                <details style={{ marginTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                    🔗 অনলাইন ওয়েব ইমেজ লিঙ্ক (URL) দিয়ে যুক্ত করতে চাইলে এখানে ক্লিক করুন
                  </summary>
                  <textarea
                    rows="2"
                    placeholder="https://images.unsplash.com/...&#10;https://... (প্রতি লাইনে একটি করে ছবির URL)"
                    value={photoForm.photosInput}
                    onChange={e => setPhotoForm({ ...photoForm, photosInput: e.target.value })}
                    style={{ width: '100%', marginTop: '6px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </details>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editingPhotoAlbum && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPhotoAlbum(null);
                      setPhotoForm({
                        title: '',
                        category: 'sports',
                        categoryLabel: '🏆 ক্রীড়া ও উৎসব',
                        eventDate: new Date().toISOString().slice(0, 10),
                        cover: '',
                        description: '',
                        photosInput: ''
                      });
                      setUploadedPhotos([]);
                    }}
                    style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    বাতিল
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isProcessingPhotos}
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '9px 22px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingPhotoAlbum ? '✓ অ্যালবাম আপডেট করুন' : '✨ অ্যালবাম তৈরি ও সেভ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Albums Table */}
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            সংরক্ষিত অ্যালবাম তালিকা ({toBn(photoAlbums.length)} টি):
          </h4>

          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '10px 14px', width: '80px' }}>কভার</th>
                  <th style={{ padding: '10px 14px' }}>অ্যালবামের নাম ও বিবরণ</th>
                  <th style={{ padding: '10px 14px', width: '140px' }}>ক্যাটাগরি</th>
                  <th style={{ padding: '10px 14px', width: '110px' }}>তারিখ</th>
                  <th style={{ padding: '10px 14px', width: '90px' }}>ছবি সংখ্যা</th>
                  <th style={{ padding: '10px 14px', width: '130px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {photoAlbums.map((alb) => (
                  <tr key={alb.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <img
                        src={alb.cover || DEFAULT_GALLERY_PLACEHOLDER}
                        alt={alb.title}
                        style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          if (e.target.getAttribute('data-err')) return;
                          e.target.setAttribute('data-err', '1');
                          e.target.src = DEFAULT_GALLERY_PLACEHOLDER;
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{alb.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{alb.description ? alb.description.slice(0, 70) : '—'}...</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                        {alb.categoryLabel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>
                      📅 {toBn(alb.eventDate)}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857' }}>
                      🖼️ {toBn(alb.photoCount || alb.photos?.length || 0)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPhotoAlbum(alb);
                            setPhotoForm({
                              title: alb.title,
                              category: alb.category,
                              categoryLabel: alb.categoryLabel,
                              eventDate: alb.eventDate,
                              cover: alb.cover || '',
                              description: alb.description || '',
                              photosInput: ''
                            });
                            setUploadedPhotos(Array.isArray(alb.photos) ? alb.photos : []);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                          title="অ্যালবাম সম্পাদনা ও ছবি পরিবর্তন করুন"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('আপনি কি এই অ্যালবামটি মুছে ফেলতে চান?')) {
                              savePhotoAlbums(photoAlbums.filter(a => a.id !== alb.id));
                              showToast('✓ অ্যালবাম মুছে ফেলা হয়েছে।');
                            }
                          }}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                          title="অ্যালবাম মুছে ফেলুন"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: VIDEOS ENTRY ================= */}
      {activeTab === 'videos' && (
        <div>
          {/* New Video Form Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
              {editingVideo ? '✏️ ভিডিও তথ্য সম্পাদনা' : '🎥 + নতুন ভিডিও যুক্ত করুন (ইউটিউব/ভিডিও লিঙ্ক সহ)'}
            </h3>

            <form onSubmit={handleSubmitVideo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  ভিডিও শিরোনাম / অনুষ্ঠানের নাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আন্তঃস্কুল বিজ্ঞান ও উদ্ভাবন মেলা ২০২৬"
                  value={videoForm.title}
                  onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ক্যাটাগরি:
                  </label>
                  <select
                    value={videoForm.category}
                    onChange={e => {
                      const labels = {
                        sports: '🏆 ক্রীড়া ও উৎসব',
                        debate: '⚔️ ডিবেট ও বিতর্ক',
                        science: '🔬 বিজ্ঞান উদ্ভাবন',
                        national: '🇧🇩 জাতীয় দিবস',
                        ict: '💻 আইসিটি ও কোডিং',
                        documentary: '🏛️ ডকুমেন্টারি ও ইতিহাস'
                      };
                      setVideoForm({
                        ...videoForm,
                        category: e.target.value,
                        categoryLabel: labels[e.target.value] || '🎥 অনুষ্ঠান ভিডিও'
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="sports">🏆 ক্রীড়া ও উৎসব</option>
                    <option value="debate">⚔️ ডিবেট ও বিতর্ক</option>
                    <option value="science">🔬 বিজ্ঞান উদ্ভাবন</option>
                    <option value="national">🇧🇩 জাতীয় দিবস</option>
                    <option value="ict">💻 আইসিটি ও কোডিং</option>
                    <option value="documentary">🏛️ ডকুমেন্টারি ও ইতিহাস</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    সময়সীমা:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ১৫:২০ মি."
                    value={videoForm.duration}
                    onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    অনুষ্ঠানের তারিখ:
                  </label>
                  <input
                    type="date"
                    value={videoForm.eventDate}
                    onChange={e => setVideoForm({ ...videoForm, eventDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ইউটিউব ভিডিও লিঙ্ক (YouTube URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=... বা ভিডিও লিংক"
                    value={videoForm.videoUrl}
                    onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    উপস্থাপক / নির্দেশক:
                  </label>
                  <input
                    type="text"
                    value={videoForm.host}
                    onChange={e => setVideoForm({ ...videoForm, host: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  ভিডিও বিবরণ:
                </label>
                <textarea
                  rows="2"
                  placeholder="ভিডিওর মূল আকর্ষণ..."
                  value={videoForm.description}
                  onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  style={{ background: '#0891b2', color: '#ffffff', border: 'none', padding: '9px 22px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingVideo ? '✓ ভিডিও আপডেট করুন' : '🎥 ভিডিও সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Videos Table */}
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '10px 14px', width: '80px' }}>থাম্বনেইল</th>
                  <th style={{ padding: '10px 14px' }}>ভিডিও শিরোনাম</th>
                  <th style={{ padding: '10px 14px', width: '130px' }}>ক্যাটাগরি</th>
                  <th style={{ padding: '10px 14px', width: '110px' }}>সময়সীমা</th>
                  <th style={{ padding: '10px 14px', width: '110px' }}>তারিখ</th>
                  <th style={{ padding: '10px 14px', width: '110px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {videoAlbums.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎬</div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#334155' }}>বর্তমানে কোনো ভিডিও সংরক্ষিত নেই</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>উপরের ফর্মটি পূরণ করে নতুন ভিডিও যোগ করুন।</div>
                    </td>
                  </tr>
                ) : (
                  videoAlbums.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <img 
                          src={v.thumbnail && !v.thumbnail.includes('photo-1461896836934-ffe607ba8211')
                            ? v.thumbnail
                            : (extractYouTubeId(v.videoUrl) ? `https://img.youtube.com/vi/${extractYouTubeId(v.videoUrl)}/hqdefault.jpg` : v.thumbnail)} 
                          alt={v.title} 
                          style={{ width: '56px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{v.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>🎙️ {v.host}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                          {v.categoryLabel}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>
                        ⏱️ {toBn(v.duration)}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>
                        📅 {toBn(v.eventDate)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('আপনি কি এই ভিডিওটি মুছে ফেলতে চান?')) {
                              saveVideoAlbums(videoAlbums.filter(x => x.id !== v.id));
                              showToast('✓ ভিডিও মুছে ফেলা হয়েছে।');
                            }
                          }}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ONLINE CLASSES ================= */}
      {activeTab === 'classes' && (
        <div>
          {/* New Class Form Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
              {editingClass ? '✏️ অনলাইন ক্লাস সম্পাদনা' : '🎓 + নতুন অনলাইন ক্লাস আপলোড ও শিডিউল করুন'}
            </h3>

            <form onSubmit={handleSubmitClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    শ্রেণি নির্ধারণ:
                  </label>
                  <select
                    value={classForm.className}
                    onChange={e => setClassForm({ ...classForm, className: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                    <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                    <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                    <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    বিষয়:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সাধারণ গণিত / পদার্থবিজ্ঞান"
                    value={classForm.subject}
                    onChange={e => setClassForm({ ...classForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  পাঠ / অধ্যায় / লেকচারের নাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ত্রিকোণমিতিক অনুপাত ও বাস্তব সমস্যা সমাধান (অধ্যায় ৯)"
                  value={classForm.topic}
                  onChange={e => setClassForm({ ...classForm, topic: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    শিক্ষকের নাম:
                  </label>
                  <input
                    type="text"
                    value={classForm.teacher}
                    onChange={e => setClassForm({ ...classForm, teacher: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    শিক্ষকের পদবী:
                  </label>
                  <input
                    type="text"
                    value={classForm.designation}
                    onChange={e => setClassForm({ ...classForm, designation: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ক্লাস ভিডিও লিঙ্ক (YouTube URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=... বা ভিডিও লিংক"
                    value={classForm.videoUrl}
                    onChange={e => setClassForm({ ...classForm, videoUrl: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '9px 22px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingClass ? '✓ ক্লাস আপডেট করুন' : '🎓 ক্লাস সংরক্ষণ ও পাবলিশ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Classes Table */}
          <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '10px 14px', width: '100px' }}>শ্রেণি</th>
                  <th style={{ padding: '10px 14px', width: '130px' }}>বিষয়</th>
                  <th style={{ padding: '10px 14px' }}>অধ্যায় ও পাঠ</th>
                  <th style={{ padding: '10px 14px', width: '160px' }}>শিক্ষক</th>
                  <th style={{ padding: '10px 14px', width: '100px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {onlineClasses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎓</div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#334155' }}>বর্তমানে কোনো অনলাইন ক্লাস সংরক্ষিত নেই</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>উপরের ফর্মটি পূরণ করে নতুন ক্লাস যোগ করুন।</div>
                    </td>
                  </tr>
                ) : (
                  onlineClasses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#047857' }}>
                        {c.className}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>
                        {c.subject}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.topic}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>
                        {c.teacher}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('আপনি কি এই ক্লাসটি মুছে ফেলতে চান?')) {
                              saveOnlineClasses(onlineClasses.filter(x => x.id !== c.id));
                              showToast('✓ ক্লাস মুছে ফেলা হয়েছে।');
                            }
                          }}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TUTORIALS ACADEMY ================= */}
      {activeTab === 'tutorials' && (
        <div>
          {/* New / Edit Tutorial Form Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                  {editingTutorial ? '✏️ টিউটোরিয়াল ও ব্যবহারিক পাঠ সম্পাদনা' : '💡 + নতুন টিউটোরিয়াল ও ব্যবহারিক গাইড যোগ করুন'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  এখানে আপলোড করা সকল টিউটোরিয়াল ল্যাব শিট ভিউপেজে এবং এখান থেকে স্বয়ংক্রিয়ভাবে অফিশিয়াল PDF আকারে ডাউনলোড করা যাবে।
                </p>
              </div>
              {editingTutorial && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTutorial(null);
                    setTutorialForm({
                      title: '',
                      category: 'ict',
                      categoryLabel: '💻 আইসিটি ও কম্পিউটার ল্যাব',
                      badge: '💻 আইসিটি পাঠ',
                      duration: '৩০ মিনিট',
                      level: 'সকল শ্রেণি',
                      instructor: 'মুহাম্মদ আবুবকর সিদ্দিক (সিনিয়র শিক্ষক, আইসিটি)',
                      desc: '',
                      stepsText: '',
                      videoUrl: '',
                      pdf_file_data: '',
                      file_name: '',
                      file_size: ''
                    });
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✕ সম্পাদন বাতিল করুন
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitTutorial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ক্যাটাগরি / বিভাগ:
                  </label>
                  <select
                    value={tutorialForm.category}
                    onChange={e => {
                      const val = e.target.value;
                      let label = '💡 সহশিক্ষা ও ল্যাব গাইড';
                      let badge = '💡 ব্যবহারিক পাঠ';
                      if (val === 'ict') { label = '💻 আইসিটি ও কম্পিউটার ল্যাব'; badge = '💻 আইসিটি পাঠ'; }
                      else if (val === 'science') { label = '🔬 বিজ্ঞান ও বিজ্ঞানাগার প্র্যাকটিক্যাল'; badge = '🔬 বিজ্ঞান ল্যাব'; }
                      else if (val === 'math') { label = '📐 ব্যবহারিক গণিত ও জ্যামিতি'; badge = '📐 গণিত ল্যাব'; }
                      else if (val === 'language') { label = '📝 ভাষা ও ডিজিটাল টাইপিং'; badge = '📝 ভাষা দক্ষতা'; }
                      else if (val === 'coding') { label = '🐍 কোডিং ও সফটওয়্যার স্কিল'; badge = '🐍 কোডিং ল্যাব'; }
                      setTutorialForm(prev => ({
                        ...prev,
                        category: val,
                        categoryLabel: label,
                        badge: badge
                      }));
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="ict">💻 আইসিটি ও কম্পিউটার ল্যাব</option>
                    <option value="science">🔬 বিজ্ঞান ও বিজ্ঞানাগার প্র্যাকটিক্যাল</option>
                    <option value="math">📐 ব্যবহারিক গণিত ও জ্যামিতি</option>
                    <option value="language">📝 ভাষা ও ডিজিটাল টাইপিং</option>
                    <option value="coding">🐍 কোডিং ও সফটওয়্যার স্কিল</option>
                    <option value="other">💡 অন্যান্য সহশিক্ষা ও ল্যাব গাইড</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    শ্রেণি / স্তর:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সকল শ্রেণি / ৬ষ্ঠ-৮ম শ্রেণি / ৯ম-১০ম শ্রেণি"
                    value={tutorialForm.level}
                    onChange={e => setTutorialForm({ ...tutorialForm, level: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    অনুশীলন সময়কাল:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ২৫ মিনিট / ৪৫ মিনিট"
                    value={tutorialForm.duration}
                    onChange={e => setTutorialForm({ ...tutorialForm, duration: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    শিক্ষক / প্রশিক্ষক / সমন্বয়ক:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মুহাম্মদ আবুবকর সিদ্দিক (সিনিয়র শিক্ষক, আইসিটি)"
                    value={tutorialForm.instructor}
                    onChange={e => setTutorialForm({ ...tutorialForm, instructor: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  টিউটোরিয়াল বা ব্যবহারিক পাঠের শিরোনাম: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বিজয় বায়ান্ন ও অভ্র দিয়ে বাংলা টাইপিং কৌশল"
                  value={tutorialForm.title}
                  onChange={e => setTutorialForm({ ...tutorialForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  সহায়ক ভিডিও লিঙ্ক (ঐচ্ছিক YouTube URL):
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={tutorialForm.videoUrl}
                  onChange={e => setTutorialForm({ ...tutorialForm, videoUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {/* PDF Upload Box */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px dashed #059669',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📄</span> টিউটোরিয়াল ও ব্যবহারিক ল্যাব শিট PDF ফাইল আপলোড (ঐচ্ছিক):
                  </label>
                  {tutorialForm.pdf_file_data && (
                    <button
                      type="button"
                      onClick={handleClearTutorialPdf}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ PDF বাতিল করুন
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleTutorialPdfSelect}
                  style={{ fontSize: '13px', cursor: 'pointer', width: '100%' }}
                />

                {tutorialForm.pdf_file_data ? (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#047857', fontWeight: 700, flexWrap: 'wrap' }}>
                    <span>✓ সংযুক্ত PDF:</span>
                    <span style={{ textDecoration: 'underline' }}>{tutorialForm.file_name}</span>
                    <span style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#166534' }}>
                      {tutorialForm.file_size}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePdfPreview({
                        pdf_file_data: tutorialForm.pdf_file_data,
                        file_name: tutorialForm.file_name,
                        title: tutorialForm.title || 'টিউটোরিয়াল গাইড',
                        instructor: tutorialForm.instructor
                      })}
                      style={{
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      👁️ প্রিভিউ দেখুন
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                    * কম্পিউটারে থাকা যেকোনো প্র্যাকটিক্যাল বা লেকচার শিটের .pdf ফাইল এখানে আপলোড করতে পারেন (সর্বোচ্চ ১০ মেগাবাইট)।
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  সংক্ষিপ্ত সারসংক্ষেপ ও শিখনফল: *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="এই টিউটোরিয়াল বা ব্যবহারিক পাঠটি অনুশীলন করলে শিক্ষার্থীরা কী কী শিখতে পারবে তার বিবরণ..."
                  value={tutorialForm.desc}
                  onChange={e => setTutorialForm({ ...tutorialForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  অনুশীলনের মূল ধাপসমূহ (প্রতি লাইনে একটি করে ধাপ লিখুন): *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="ধাপ ১: কম্পিউটার চালু করে প্রয়োজনীয় সফটওয়্যার ওপেন করুন।&#10;ধাপ ২: প্র্যাকটিক্যাল ডাটা ইনপুট দিয়ে অনুশীলন করুন।&#10;ধাপ ৩: কাজ সম্পন্ন করে শিক্ষকের কাছে ফাইল সেভ ও জমা দিন।"
                  value={tutorialForm.stepsText}
                  onChange={e => setTutorialForm({ ...tutorialForm, stepsText: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px', lineHeight: '1.6', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '7px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {editingTutorial ? '💾 আপডেট সংরক্ষণ করুন' : '💡 নতুন টিউটোরিয়াল প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Tutorials Table Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                💡 সংরক্ষিত টিউটোরিয়াল ও ব্যবহারিক গাইড তালিকা ({toBn(tutorials.length)} টি)
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('আপনি কি ডিফল্ট টিউটোরিয়াল তালিকা পুনরুদ্ধার করতে চান?')) {
                      saveTutorials(DEFAULT_TUTORIALS);
                      showToast('✓ ডিফল্ট টিউটোরিয়াল তালিকা পুনরুদ্ধার করা হয়েছে।');
                    }
                  }}
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔄 ডিফল্ট তালিকা রিস্টোর
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: '#334155', width: '50px' }}>#</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: '#334155' }}>ক্যাটাগরি</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: '#334155' }}>টিউটোরিয়াল শিরোনাম ও শিক্ষক</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: '#334155' }}>শ্রেণি / সময়কাল</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>ধাপ সংখ্যা</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {tutorials.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                        কোনো টিউটোরিয়াল সংরক্ষিত নেই। উপরের ফর্ম পূরণ করে নতুন টিউটোরিয়াল যোগ করুন।
                      </td>
                    </tr>
                  ) : (
                    tutorials.map((tut, idx) => (
                      <tr key={tut.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#64748b' }}>
                          {toBn(idx + 1)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#ecfdf5',
                            color: '#047857',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            border: '1px solid #a7f3d0'
                          }}>
                            {tut.badge || tut.categoryLabel || '💡 টিউটোরিয়াল'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                            {tut.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            👨‍🏫 {tut.instructor || 'আইসিটি ও বিজ্ঞান বিভাগ'}
                          </div>
                          {tut.pdf_file_data && (
                            <div style={{ marginTop: '3px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                <span>📄</span> আসল PDF সংযুক্ত {tut.file_size ? `(${tut.file_size})` : ''}
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>
                          <div>{tut.level || 'সকল শ্রেণি'}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>⏱️ {tut.duration || '৩০ মিনিট'}</div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                            {toBn(tut.steps?.length || 0)} টি ধাপ
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {tut.pdf_file_data && (
                              <button
                                type="button"
                                onClick={() => setActivePdfPreview(tut)}
                                style={{
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="সংযুক্ত আসল PDF গাইডটি প্রিভিউ দেখুন"
                              >
                                👁️ প্রিভিউ
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => downloadTutorialFile(tut)}
                              style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                padding: '4px 10px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              title={tut.pdf_file_data ? "সংযুক্ত আসল PDF ফাইলটি ডাউনলোড করুন" : "অফিশিয়াল ল্যাব শিট ও PDF গাইড ডাউনলোড করুন"}
                            >
                              📥 {tut.pdf_file_data ? 'PDF' : 'PDF গাইড'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTutorial(tut);
                                setTutorialForm({
                                  title: tut.title || '',
                                  category: tut.category || 'ict',
                                  categoryLabel: tut.categoryLabel || '💻 আইসিটি ও কম্পিউটার ল্যাব',
                                  badge: tut.badge || '💡 ব্যবহারিক পাঠ',
                                  duration: tut.duration || '৩০ মিনিট',
                                  level: tut.level || 'সকল শ্রেণি',
                                  instructor: tut.instructor || 'মুহাম্মদ আবুবকর সিদ্দিক (সিনিয়র শিক্ষক, আইসিটি)',
                                  desc: tut.desc || '',
                                  stepsText: Array.isArray(tut.steps) ? tut.steps.join('\n') : '',
                                  videoUrl: tut.videoUrl || '',
                                  pdf_file_data: tut.pdf_file_data || '',
                                  file_name: tut.file_name || '',
                                  file_size: tut.file_size || ''
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                background: '#eff6ff',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="টিউটোরিয়াল সম্পাদনা করুন"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`আপনি কি "${tut.title}" টিউটোরিয়ালটি মুছে ফেলতে চান?`)) {
                                  const updated = tutorials.filter(x => x.id !== tut.id);
                                  saveTutorials(updated);
                                  if (editingTutorial?.id === tut.id) {
                                    setEditingTutorial(null);
                                  }
                                  showToast('✓ টিউটোরিয়াল সফলভাবে মুছে ফেলা হয়েছে।');
                                }
                              }}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="টিউটোরিয়াল মুছে ফেলুন"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CAMPUS & MILESTONES ================= */}
      {activeTab === 'campus' && (
        <div>
          {/* Header & Sub-tab Switcher */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            borderRadius: '12px',
            padding: '18px 22px',
            color: '#ffffff',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(6,78,59,0.15)'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏛️</span> ক্যাম্পাস ঐতিহ্য ও স্মৃতি মাইলফলক ব্যবস্থাপনা
              </div>
              <div style={{ fontSize: '12.5px', color: '#a7f3d0', marginTop: '3px' }}>
                বিদ্যালয়ের গৌরবময় ঐতিহাসিক কালপঞ্জি ও ক্যাম্পাসের চোখজুড়ানো অবকাঠামো আলোকচিত্র পরিচালনা করুন
              </div>
            </div>

            {/* Sub-tab pills */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setCampusSubTab('milestones')}
                style={{
                  background: campusSubTab === 'milestones' ? '#ffffff' : 'transparent',
                  color: campusSubTab === 'milestones' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🏛️</span> ঐতিহাসিক মাইলফলক ({toBn(campusMilestones.length)})
              </button>
              <button
                type="button"
                onClick={() => setCampusSubTab('photos')}
                style={{
                  background: campusSubTab === 'photos' ? '#ffffff' : 'transparent',
                  color: campusSubTab === 'photos' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📸</span> ক্যাম্পাস অবকাঠামো ({toBn(campusPhotos.length)})
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: HISTORIC MILESTONES */}
          {campusSubTab === 'milestones' && (
            <div>
              {/* Form Card */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                      {editingMilestone ? '✏️ ঐতিহাসিক মাইলফলক সম্পাদনা' : '🏛️ + নতুন ঐতিহাসিক মাইলফলক যোগ করুন'}
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      বিদ্যালয়ের প্রতিষ্ঠা, মুক্তিযুদ্ধ, অবকাঠামোগত বা ডিজিটাল অর্জনের তথ্য লিপিবদ্ধ করুন
                    </p>
                  </div>
                  {editingMilestone && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMilestone(null);
                        setMilestoneForm({
                          year: '',
                          title: '',
                          desc: '',
                          category: 'প্রতিষ্ঠা ও সূচনা',
                          badge: '🏛️ সূচনা',
                          image: '',
                          date: ''
                        });
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ সম্পাদন বাতিল করুন
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        সাল / সন (যেমন: ১৯৪৬, ১৯৭১, ২০২৬)*:
                      </label>
                      <input
                        type="text"
                        required
                        value={milestoneForm.year}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, year: e.target.value })}
                        placeholder="উদা: ১৯৭১"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        মাইলফলকের শিরোনাম*:
                      </label>
                      <input
                        type="text"
                        required
                        value={milestoneForm.title}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                        placeholder="উদা: মহান মুক্তিযুদ্ধে গৌরবোজ্জ্বল ভূমিকা"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        ক্যাটাগরি / বিভাগ:
                      </label>
                      <select
                        value={milestoneForm.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          let defaultBadge = '🏛️ মাইলফলক';
                          if (cat === 'প্রতিষ্ঠা ও সূচনা') defaultBadge = '🏛️ সূচনা';
                          else if (cat === 'মুক্তিযুদ্ধ ও গৌরব') defaultBadge = '🇧🇩 মুক্তিযুদ্ধ';
                          else if (cat === 'অবকাঠামো উন্নয়ন') defaultBadge = '🏢 অবকাঠামো';
                          else if (cat === 'ডিজিটাল রূপান্তর') defaultBadge = '💻 ডিজিটাল ল্যাব';
                          else if (cat === 'স্মার্ট ক্যাম্পাস') defaultBadge = '✨ স্মার্ট ক্যাম্পাস';
                          else if (cat === 'সাংস্কৃতিক অর্জন') defaultBadge = '🏆 সাংস্কৃতিক জয়';
                          setMilestoneForm({ ...milestoneForm, category: cat, badge: defaultBadge });
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', background: '#fff' }}
                      >
                        <option value="প্রতিষ্ঠা ও সূচনা">🏛️ প্রতিষ্ঠা ও সূচনা</option>
                        <option value="মুক্তিযুদ্ধ ও গৌরব">🇧🇩 মুক্তিযুদ্ধ ও গৌরব</option>
                        <option value="অবকাঠামো উন্নয়ন">🏢 অবকাঠামো উন্নয়ন</option>
                        <option value="ডিজিটাল রূপান্তর">💻 ডিজিটাল রূপান্তর</option>
                        <option value="স্মার্ট ক্যাম্পাস">✨ স্মার্ট ক্যাম্পাস</option>
                        <option value="সাংস্কৃতিক অর্জন">🏆 সাংস্কৃতিক অর্জন</option>
                        <option value="অন্যান্য">📌 অন্যান্য অর্জন</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        ব্যাজ লেবেল:
                      </label>
                      <input
                        type="text"
                        value={milestoneForm.badge}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, badge: e.target.value })}
                        placeholder="উদা: 🇧🇩 মুক্তিযুদ্ধ"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      ঐতিহাসিক পটভূমি ও বিস্তারিত বিবরণ*:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={milestoneForm.desc}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, desc: e.target.value })}
                      placeholder="এই মাইলফলক বা ঐতিহাসিক মুহূর্তের স্মরণীয় বিবরণ এখানে লিখুন..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  {/* Optional Image */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        📷 স্মারক আলোকচিত্র (ঐচ্ছিক):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMilestoneImageChange}
                        style={{ fontSize: '12px', color: '#475569' }}
                      />
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        মাইলফলকের প্রাসঙ্গিক বা ঐতিহাসিক ছবি আপলোড করতে পারেন (স্বয়ংক্রিয়ভাবে কম্প্রেস হবে)
                      </div>
                    </div>

                    {milestoneForm.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={milestoneForm.image}
                          alt="মাইলফলক প্রিভিউ"
                          style={{ width: '64px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          onClick={() => setMilestoneForm({ ...milestoneForm, image: '' })}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          ✕ ছবি সরান
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '7px',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                      }}
                    >
                      {editingMilestone ? '✓ পরিবর্তন সংরক্ষণ করুন' : '✓ নতুন মাইলফলক সংরক্ষণ করুন'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    📋 সংরক্ষিত ঐতিহাসিক মাইলফলক তালিকা ({toBn(campusMilestones.length)} টি)
                  </h4>
                  <button
                    type="button"
                    onClick={handleRestoreDefaultMilestones}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="বিদ্যালয়ের সূচনা থেকে ৫টি মূল মাইলফলক তালিকায় পুনরুদ্ধার করুন"
                  >
                    🔄 ডিফল্ট মাইলফলক পুনরুদ্ধার
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '10px', width: '50px', textAlign: 'center' }}>ক্রম</th>
                        <th style={{ padding: '10px', width: '80px', textAlign: 'center' }}>সাল/সন</th>
                        <th style={{ padding: '10px', width: '220px' }}>শিরোনাম ও ক্যাটাগরি</th>
                        <th style={{ padding: '10px', width: '70px', textAlign: 'center' }}>ছবি</th>
                        <th style={{ padding: '10px' }}>ঐতিহাসিক বিবরণ</th>
                        <th style={{ padding: '10px', width: '90px', textAlign: 'center' }}>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campusMilestones.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            কোনো ঐতিহাসিক মাইলফলক সংরক্ষিত নেই। উপরের ফর্ম ব্যবহার করে নতুন মাইলফলক যুক্ত করুন।
                          </td>
                        </tr>
                      ) : (
                        campusMilestones.map((m, idx) => (
                          <tr key={m.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                              {toBn(idx + 1)}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{
                                background: '#047857',
                                color: '#ffffff',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11.5px',
                                fontWeight: 800
                              }}>
                                {m.year}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{m.title}</div>
                              <span style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                {m.badge || m.category}
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              {m.image ? (
                                <img
                                  src={m.image}
                                  alt={m.title}
                                  style={{ width: '42px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                />
                              ) : (
                                <span style={{ color: '#cbd5e1', fontSize: '11px' }}>নেই</span>
                              )}
                            </td>
                            <td style={{ padding: '10px', color: '#475569', lineHeight: '1.5' }}>
                              {m.desc}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMilestone(m);
                                    setMilestoneForm({
                                      year: m.year || '',
                                      title: m.title || '',
                                      desc: m.desc || '',
                                      category: m.category || 'প্রতিষ্ঠা ও সূচনা',
                                      badge: m.badge || '🏛️ সূচনা',
                                      image: m.image || '',
                                      date: m.date || m.year || ''
                                    });
                                    window.scrollTo({ top: 100, behavior: 'smooth' });
                                  }}
                                  style={{
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    padding: '4px 8px',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                  title="মাইলফলক সম্পাদনা করুন"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`আপনি কি "${m.title}" মাইলফলকটি মুছে ফেলতে চান?`)) {
                                      const updated = campusMilestones.filter(x => x.id !== m.id);
                                      saveCampusMilestones(updated);
                                      if (editingMilestone?.id === m.id) setEditingMilestone(null);
                                      showToast('✓ মাইলফলক সফলভাবে মুছে ফেলা হয়েছে।');
                                    }
                                  }}
                                  style={{
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    padding: '4px 8px',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                  title="মাইলফলক মুছে ফেলুন"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: CAMPUS INFRASTRUCTURE PHOTOS */}
          {campusSubTab === 'photos' && (
            <div>
              {/* Form Card */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                      {editingCampusPhoto ? '✏️ ক্যাম্পাস অবকাঠামো আলোকচিত্র সম্পাদনা' : '📸 + নতুন ক্যাম্পাস অবকাঠামো আলোকচিত্র যোগ করুন'}
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      একাডেমিক ভবন, খেলার মাঠ, শহীদ মিনার, কম্পিউটার ল্যাব ও ক্যাম্পাসের ছবি আপলোড করুন
                    </p>
                  </div>
                  {editingCampusPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCampusPhoto(null);
                        setCampusPhotoForm({
                          title: '',
                          category: 'একাডেমিক ভবন',
                          desc: '',
                          url: ''
                        });
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ সম্পাদন বাতিল করুন
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitCampusPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        আলোকচিত্রের শিরোনাম*:
                      </label>
                      <input
                        type="text"
                        required
                        value={campusPhotoForm.title}
                        onChange={(e) => setCampusPhotoForm({ ...campusPhotoForm, title: e.target.value })}
                        placeholder="উদা: সুবিশাল ৩-তলা একাডেমিক ভবন"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        ক্যাটাগরি / বিভাগ:
                      </label>
                      <select
                        value={campusPhotoForm.category}
                        onChange={(e) => setCampusPhotoForm({ ...campusPhotoForm, category: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', background: '#fff' }}
                      >
                        <option value="একাডেমিক ভবন">🏢 একাডেমিক ভবন</option>
                        <option value="খেলার মাঠ ও প্রকৃতি">🌳 খেলার মাঠ ও প্রকৃতি</option>
                        <option value="শহীদ মিনার ও মুক্তমঞ্চ">🏛️ শহীদ মিনার ও মুক্তমঞ্চ</option>
                        <option value="ল্যাব ও লাইব্রেরি">💻 ল্যাব ও লাইব্রেরি</option>
                        <option value="প্রশাসনিক ভবন">🏛️ প্রশাসনিক ভবন</option>
                        <option value="সাধারণ ক্যাম্পাস">🌿 সাধারণ ক্যাম্পাস</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        সংক্ষিপ্ত ক্যাপশন / বিবরণ:
                      </label>
                      <input
                        type="text"
                        value={campusPhotoForm.desc}
                        onChange={(e) => setCampusPhotoForm({ ...campusPhotoForm, desc: e.target.value })}
                        placeholder="উদা: আধুনিক শ্রেণিকক্ষ ও ল্যাব সংবলিত মূল একাডেমিক ভবন"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Photo File / URL */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        📁 অবকাঠামো ছবি নির্বাচন করুন*:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCampusPhotoImageChange}
                        style={{ fontSize: '12px', color: '#475569' }}
                      />
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        অথবা সরাসরি ছবির ওয়েব লিঙ্ক (URL) পেস্ট করুন:
                      </div>
                      <input
                        type="url"
                        value={campusPhotoForm.url.startsWith('data:') ? '' : campusPhotoForm.url}
                        onChange={(e) => setCampusPhotoForm({ ...campusPhotoForm, url: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    {campusPhotoForm.url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={campusPhotoForm.url}
                          alt="ক্যাম্পাস ফটো প্রিভিউ"
                          style={{ width: '84px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          onClick={() => setCampusPhotoForm({ ...campusPhotoForm, url: '' })}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          ✕ ছবি সরান
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '7px',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
                      }}
                    >
                      {editingCampusPhoto ? '✓ ছবি পরিবর্তন সংরক্ষণ করুন' : '✓ নতুন অবকাঠামো ছবি সংরক্ষণ করুন'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Photos Grid Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    📸 ক্যাম্পাসের সংরক্ষিত অবকাঠামো আলোকচিত্র ({toBn(campusPhotos.length)} টি)
                  </h4>
                  <button
                    type="button"
                    onClick={handleRestoreDefaultCampusPhotos}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="ক্যাম্পাস অবকাঠামোর মূল ৪টি ছবি পুনরুদ্ধার করুন"
                  >
                    🔄 ডিফল্ট অবকাঠামো ছবি পুনরুদ্ধার
                  </button>
                </div>

                {campusPhotos.length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    কোনো অবকাঠামো ছবি সংরক্ষিত নেই। উপরের ফর্ম ব্যবহার করে ছবি যোগ করুন।
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {campusPhotos.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ position: 'relative', height: '150px', background: '#0f172a' }}>
                          <img
                            src={p.url}
                            alt={p.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(15,23,42,0.85)',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {p.category}
                          </span>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {p.title}
                          </h5>
                          {p.desc && (
                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4', flex: 1 }}>
                              {p.desc}
                            </p>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: 'auto' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCampusPhoto(p);
                                setCampusPhotoForm({
                                  title: p.title || '',
                                  category: p.category || 'একাডেমিক ভবন',
                                  desc: p.desc || '',
                                  url: p.url || ''
                                });
                                window.scrollTo({ top: 100, behavior: 'smooth' });
                              }}
                              style={{
                                background: '#eff6ff',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                padding: '4px 10px',
                                borderRadius: '5px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ সম্পাদন
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`আপনি কি "${p.title}" আলোকচিত্রটি মুছে ফেলতে চান?`)) {
                                  const updated = campusPhotos.filter(x => x.id !== p.id);
                                  saveCampusPhotos(updated);
                                  if (editingCampusPhoto?.id === p.id) setEditingCampusPhoto(null);
                                  showToast('✓ আলোকচিত্র সফলভাবে মুছে ফেলা হয়েছে।');
                                }
                              }}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '4px 10px',
                                borderRadius: '5px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ মুছুন
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: AUDIO & CULTURAL SONGS ================= */}
      {activeTab === 'audio' && (
        <div>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: '12px',
            padding: '18px 22px',
            color: '#ffffff',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(30,27,75,0.18)'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎵</span> অডিও, সঙ্গীত ও আবৃত্তি হাব ব্যবস্থাপনা
              </div>
              <div style={{ fontSize: '12.5px', color: '#c7d2fe', marginTop: '3px' }}>
                জাতীয় সংগীত, বিদ্যালয়ের থিম সং, দেশাত্মবোধক গান, কবিতা আবৃত্তি ও ঐতিহাসিক ভাষণের অডিও ট্র্যাক আপলোড ও নিয়ন্ত্রণ করুন
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestoreDefaultAudioTracks}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="ডিফল্ট ৪টি মূল অডিও ট্র্যাক তালিকায় পুনরুদ্ধার করুন"
            >
              🔄 ডিফল্ট অডিও ট্র্যাক পুনরুদ্ধার
            </button>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                  {editingAudioTrack ? '✏️ অডিও ট্র্যাক ও সঙ্গীত সম্পাদনা' : '🎵 + নতুন অডিও ট্র্যাক / সঙ্গীত যোগ করুন'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  সরাসরি .mp3 বা অডিও ফাইল আপলোড করুন, লিরিক্স এবং সময়কাল যুক্ত করুন
                </p>
              </div>
              {editingAudioTrack && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAudioTrack(null);
                    setAudioForm({
                      title: '',
                      artist: '',
                      category: 'বিদ্যালয় সংগীত',
                      duration: '০৩:১৫ মিনিট',
                      lyrics: '',
                      audio_data: '',
                      file_name: '',
                      file_size: '',
                      date: new Date().toISOString().slice(0, 10)
                    });
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✕ সম্পাদন বাতিল করুন
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitAudioTrack} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    অডিও বা গানের শিরোনাম*:
                  </label>
                  <input
                    type="text"
                    required
                    value={audioForm.title}
                    onChange={(e) => setAudioForm({ ...audioForm, title: e.target.value })}
                    placeholder="উদা: গণপ্রজাতন্ত্রী বাংলাদেশের জাতীয় সংগীত"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    শিল্পী / পরিবেশক / আবৃত্তিশিল্পী*:
                  </label>
                  <input
                    type="text"
                    required
                    value={audioForm.artist}
                    onChange={(e) => setAudioForm({ ...audioForm, artist: e.target.value })}
                    placeholder="উদা: বিদ্যালয়ের শিক্ষার্থীদের সম্মিলিত কণ্ঠ"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    ধরন / ক্যাটাগরি:
                  </label>
                  <select
                    value={audioForm.category}
                    onChange={(e) => setAudioForm({ ...audioForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="জাতীয় সংগীত">🇧🇩 জাতীয় সংগীত</option>
                    <option value="বিদ্যালয় সংগীত">🏫 বিদ্যালয় সংগীত / থিম সং</option>
                    <option value="দেশাত্মবোধক গান">🎶 দেশাত্মবোধক গান</option>
                    <option value="কবিতা আবৃত্তি">📜 কবিতা আবৃত্তি</option>
                    <option value="ঐতিহাসিক ভাষণ">🎙️ ঐতিহাসিক ভাষণ</option>
                    <option value="সাংস্কৃতিক উৎসব">🎭 সাংস্কৃতিক উৎসব</option>
                    <option value="অন্যান্য">✨ অন্যান্য অডিও</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    সময়কাল (যেমন: ০৩:১৫ মিনিট):
                  </label>
                  <input
                    type="text"
                    value={audioForm.duration}
                    onChange={(e) => setAudioForm({ ...audioForm, duration: e.target.value })}
                    placeholder="উদা: ০৩:১৫ মিনিট"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Audio File Upload Box */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                      🎙️ অডিও ফাইল আপলোড করুন (.mp3, .wav, .m4a):
                    </label>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      (সর্বোচ্চ ১৫ মেগাবাইট। অডিও ফাইল ছাড়াও শুধু লিরিক্স দিয়ে সেভ করা যাবে)
                    </div>
                  </div>
                  {audioForm.file_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>
                        🎵 {audioForm.file_name} ({audioForm.file_size})
                      </span>
                      <button
                        type="button"
                        onClick={() => setAudioForm({ ...audioForm, audio_data: '', file_name: '', file_size: '' })}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        ✕ সরান
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg"
                    onChange={handleAudioFileChange}
                    style={{ fontSize: '12.5px', color: '#475569' }}
                  />

                  {audioForm.audio_data && (
                    <audio
                      controls
                      src={audioForm.audio_data}
                      style={{ height: '36px', maxWidth: '300px' }}
                    />
                  )}
                </div>
              </div>

              {/* Lyrics Field */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  📜 গানের কথা / কবিতার পঙ্‌ক্তিমালা / কথিকা (লিরিক্স):
                </label>
                <textarea
                  rows={4}
                  value={audioForm.lyrics}
                  onChange={(e) => setAudioForm({ ...audioForm, lyrics: e.target.value })}
                  placeholder="এখানে সম্পূর্ণ গানের কথা বা কবিতার লাইনগুলো টাইপ করুন..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#312e81',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '7px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(49,46,129,0.25)'
                  }}
                >
                  {editingAudioTrack ? '✓ অডিও ট্র্যাক পরিবর্তন সংরক্ষণ করুন' : '✓ নতুন অডিও ট্র্যাক সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Audio Tracks Table Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              🎶 সংরক্ষিত অডিও ও সাংস্কৃতিক গান তালিকা ({toBn(audioTracks.length)} টি)
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px', width: '45px', textAlign: 'center' }}>ক্রম</th>
                    <th style={{ padding: '10px', width: '60px', textAlign: 'center' }}>প্লে</th>
                    <th style={{ padding: '10px' }}>গানের শিরোনাম ও বিভাগ</th>
                    <th style={{ padding: '10px', width: '200px' }}>শিল্পী / পরিবেশক</th>
                    <th style={{ padding: '10px', width: '90px', textAlign: 'center' }}>সময়কাল</th>
                    <th style={{ padding: '10px', width: '85px', textAlign: 'center' }}>লিরিক্স</th>
                    <th style={{ padding: '10px', width: '95px', textAlign: 'center' }}>ডাউনলোড</th>
                    <th style={{ padding: '10px', width: '90px', textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {audioTracks.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        কোনো অডিও ট্র্যাক সংরক্ষিত নেই। উপরের ফর্ম ব্যবহার করে নতুন গান যুক্ত করুন।
                      </td>
                    </tr>
                  ) : (
                    audioTracks.map((tr, idx) => {
                      const isPlayingThis = adminPlayingAudioId === tr.id;
                      return (
                        <tr key={tr.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                            {toBn(idx + 1)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleAdminPlayAudio(tr)}
                              style={{
                                background: isPlayingThis ? '#dc2626' : '#047857',
                                color: '#ffffff',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={isPlayingThis ? 'থামান' : 'প্লে করুন'}
                            >
                              {isPlayingThis ? '⏸' : '▶'}
                            </button>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{tr.title}</div>
                            <span style={{
                              display: 'inline-block',
                              marginTop: '3px',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              {tr.category}
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: '#475569' }}>
                            {tr.artist}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                            {tr.duration}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {tr.lyrics ? (
                              <button
                                type="button"
                                onClick={() => setActiveLyricsModal(tr)}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  padding: '3px 8px',
                                  borderRadius: '5px',
                                  fontSize: '11.5px',
                                  cursor: 'pointer',
                                  fontWeight: 700
                                }}
                              >
                                📜 দেখুন
                              </button>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>নেই</span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDownloadAudioTrack(tr)}
                              style={{
                                background: tr.audio_data ? '#ecfdf5' : '#f8fafc',
                                color: tr.audio_data ? '#047857' : '#94a3b8',
                                border: '1px solid #cbd5e1',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                              title={tr.audio_data ? 'এমপি৩ অডিও ফাইল ডাউনলোড করুন' : 'অডিও ফাইল সংযুক্ত নেই'}
                            >
                              📥 MP3
                            </button>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAudioTrack(tr);
                                  setAudioForm({
                                    title: tr.title || '',
                                    artist: tr.artist || '',
                                    category: tr.category || 'বিদ্যালয় সংগীত',
                                    duration: tr.duration || '০৩:১৫ মিনিট',
                                    lyrics: tr.lyrics || '',
                                    audio_data: tr.audio_data || '',
                                    file_name: tr.file_name || '',
                                    file_size: tr.file_size || '',
                                    date: tr.date || new Date().toISOString().slice(0, 10)
                                  });
                                  window.scrollTo({ top: 100, behavior: 'smooth' });
                                }}
                                style={{
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                                title="অডিও সম্পাদনা করুন"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`আপনি কি "${tr.title}" অডিও ট্র্যাকটি মুছে ফেলতে চান?`)) {
                                    const updated = audioTracks.filter(x => x.id !== tr.id);
                                    saveAudioTracks(updated);
                                    if (editingAudioTrack?.id === tr.id) setEditingAudioTrack(null);
                                    if (adminPlayingAudioId === tr.id) {
                                      if (adminAudioRef.current) adminAudioRef.current.pause();
                                      setAdminPlayingAudioId(null);
                                    }
                                    showToast('✓ অডিও ট্র্যাক সফলভাবে মুছে ফেলা হয়েছে।');
                                  }
                                }}
                                style={{
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                                title="অডিও মুছে ফেলুন"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {activePdfPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '920px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{
              background: '#064e3b',
              color: '#ffffff',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14.5px' }}>
                    {activePdfPreview.file_name || activePdfPreview.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#a7f3d0' }}>
                    {activePdfPreview.instructor || 'টিউটোরিয়াল গাইড'} • {activePdfPreview.file_size || ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => downloadTutorialFile(activePdfPreview)}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📥 ডাউনলোড করুন
                </button>
                <button
                  type="button"
                  onClick={() => setActivePdfPreview(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ flex: 1, background: '#334155', position: 'relative' }}>
              {activePdfPreview.pdf_file_data ? (
                <iframe
                  src={activePdfPreview.pdf_file_data}
                  title="PDF Document Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#ffffff' }}>
                  পিডিএফ ডকুমেন্ট প্রিভিউ উপলব্ধ নেই।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LYRICS PREVIEW MODAL */}
      {activeLyricsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '26px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#312e81' }}>
                  📜 {activeLyricsModal.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  🎙️ শিল্পী / পরিবেশক: {activeLyricsModal.artist}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLyricsModal(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px 20px',
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#1e293b',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit'
            }}>
              {activeLyricsModal.lyrics}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleToggleAdminPlayAudio(activeLyricsModal)}
                style={{
                  background: (adminPlayingAudioId === activeLyricsModal.id) ? '#dc2626' : '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {(adminPlayingAudioId === activeLyricsModal.id) ? '⏸ অডিও থামান' : '▶ অডিও শুনুন'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLyricsModal(null)}
                style={{
                  background: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
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

    </div>
  );
}

export default GalleryMasterAdminPanel;

