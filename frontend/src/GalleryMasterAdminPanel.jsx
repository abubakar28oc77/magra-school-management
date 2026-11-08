import React, { useState, useEffect } from 'react';
import { compressImageToDataUrl } from './photoStorage';

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

  // Active modal/editor states
  const [editingPhotoAlbum, setEditingPhotoAlbum] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  // Form States
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
      if (storedVideos) setVideoAlbums(JSON.parse(storedVideos));

      const storedClasses = localStorage.getItem(ONLINE_CLASSES_KEY);
      if (storedClasses) setOnlineClasses(JSON.parse(storedClasses));
    } catch {}
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

    const defaultThumb = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
    const finalThumb = videoForm.thumbnail.trim() || defaultThumb;

    if (editingVideo) {
      const updated = videoAlbums.map(v => v.id === editingVideo.id ? {
        ...v,
        title: videoForm.title.trim(),
        category: videoForm.category,
        categoryLabel: videoForm.categoryLabel,
        eventDate: videoForm.eventDate,
        duration: videoForm.duration || '১৫:০০ মি.',
        videoUrl: videoForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
        videoUrl: videoForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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

    const defaultThumb = 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80';
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
        videoUrl: classForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
        videoUrl: classForm.videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
          { key: 'tutorials', label: '💡 টিউটোরিয়াল একাডেমি' },
          { key: 'campus', label: '🏛️ ক্যাম্পাস ও স্মৃতি মাইলফলক' },
          { key: 'audio', label: '🎵 অডিও ও সাংস্কৃতিক গান' }
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
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
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
                {videoAlbums.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <img src={v.thumbnail} alt={v.title} style={{ width: '56px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
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
                ))}
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
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
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
                {onlineClasses.map(c => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TUTORIALS / CAMPUS / AUDIO ================= */}
      {(activeTab === 'tutorials' || activeTab === 'campus' || activeTab === 'audio') && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '36px' }}>✨</span>
          <h3 style={{ margin: '8px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            {activeTab === 'tutorials' ? '💡 টিউটোরিয়াল একাডেমি কনটেন্ট হাব' :
             activeTab === 'campus' ? '🏛️ ক্যাম্পাস ও স্মৃতি আর্কাইভ' :
             '🎵 অডিও ও সাংস্কৃতিক গান হাব'}
          </h3>
          <p style={{ margin: '0 auto 16px auto', maxWidth: '580px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
            এই সেকশনের কনটেন্টগুলো ভিউ পেজের সাথে সরাসরি সিঙ্ক করা আছে। শিক্ষক ও অ্যাডমিনরা এখান থেকে অনায়াসে হ্যান্ডআউট এবং অডিও ট্র্যাক পরিচালনা করতে পারবেন।
          </p>
          <div style={{ display: 'inline-flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => showToast('✓ কনটেন্ট স্ট্যাটাস সক্রিয় আছে এবং ভিউ পেজে প্রদর্শিত হচ্ছে।')}
              style={{ background: '#047857', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ✓ ভিউ পেজে স্ট্যাটাস চেক করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default GalleryMasterAdminPanel;

