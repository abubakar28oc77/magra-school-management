import React, { useState, useEffect } from 'react';

const toBn = n => String(n ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// LocalStorage Keys
const PHOTO_ALBUMS_KEY = 'magra_gallery_photo_albums_v2';
const VIDEO_ALBUMS_KEY = 'magra_gallery_video_albums_v2';
const ONLINE_CLASSES_KEY = 'magra_gallery_online_classes_v2';

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
      if (storedPhotos) setPhotoAlbums(JSON.parse(storedPhotos));

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

  // Submit Photo Album Form
  const handleSubmitPhotoAlbum = (e) => {
    e.preventDefault();
    if (!photoForm.title.trim()) {
      alert('অনুগ্রহ করে অ্যালবামের নাম দিন!');
      return;
    }

    const defaultCover = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';
    const finalCover = photoForm.cover.trim() || defaultCover;

    let parsedPhotos = [];
    if (photoForm.photosInput.trim()) {
      const urls = photoForm.photosInput.split('\n').map(u => u.trim()).filter(Boolean);
      parsedPhotos = urls.map((url, idx) => ({
        id: `p-${Date.now()}-${idx}`,
        title: `${photoForm.title} - ছবি ${toBn(idx + 1)}`,
        url
      }));
    } else {
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
                    কভার ছবির লিঙ্ক (Image URL):
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={photoForm.cover}
                    onChange={e => setPhotoForm({ ...photoForm, cover: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
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

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  অ্যালবামের ছবি লিঙ্কসমূহ (প্রতি লাইনে একটি করে ছবির URL):
                </label>
                <textarea
                  rows="3"
                  placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/...&#10;(ফাঁকা রাখলে স্বয়ংক্রিয় প্রিসেট ছবি সংরক্ষিত হবে)"
                  value={photoForm.photosInput}
                  onChange={e => setPhotoForm({ ...photoForm, photosInput: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #cbd5e1', fontSize: '12.5px' }}
                />
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
                    }}
                    style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    বাতিল
                  </button>
                )}
                <button
                  type="submit"
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
                      <img src={alb.cover} alt={alb.title} style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{alb.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{alb.description.slice(0, 70)}...</div>
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
                              cover: alb.cover,
                              description: alb.description,
                              photosInput: (alb.photos || []).map(p => p.url).join('\n')
                            });
                          }}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
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

