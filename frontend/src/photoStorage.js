// photoStorage.js - High-capacity IndexedDB + In-Memory Photo Vault for School ERP
// Solves browser localStorage 5MB quota exhaustion permanently.

const DB_NAME = 'MagraSchoolPhotoVault';
const DB_VERSION = 1;
const STORE_NAME = 'student_photos';

// In-memory cache for 0ms synchronous access during React renders
export const PHOTO_CACHE = new Map();

// Helper to normalize class & roll
export function getStudentPhotoKey(student) {
  if (!student) return '';
  const sId = String(student.id || student.student_id || '').toLowerCase().trim();
  const cName = String(student.class_name || '').replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d).trim();
  const rNo = String(student.roll_no || '').replace(/[০-৯]/g, d => ({ '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' })[d] || d).trim();
  return { sId, cName, rNo };
}

// Open or get IndexedDB connection
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => {
      console.warn('IndexedDB open error:', e);
      resolve(null);
    };
  });
}

// Store photo in IndexedDB
export async function idbSetPhoto(key, dataUrl) {
  if (!key || !dataUrl) return;
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(dataUrl, String(key).toLowerCase());
  } catch (err) {
    console.warn('idbSetPhoto error:', err);
  }
}

// Get photo from IndexedDB
export async function idbGetPhoto(key) {
  if (!key) return null;
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(key).toLowerCase());
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Load all photos from IndexedDB and localStorage into PHOTO_CACHE on startup
export async function initPhotoStorage() {
  if (typeof window === 'undefined') return;

  // 1. Scan localStorage for any legacy photos and load into cache
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('magra_photo_') && !k.includes('thumb')) {
        const val = localStorage.getItem(k);
        if (val && val.startsWith('data:image')) {
          const subKey = k.replace('magra_photo_', '').toLowerCase();
          PHOTO_CACHE.set(subKey, val);
          // Also persist to IndexedDB so it's safe forever
          idbSetPhoto(subKey, val);
        }
      }
    }
  } catch (e) {
    console.warn('LocalStorage scan error:', e);
  }

  // 2. Also scan magra_db_students in localStorage for embedded custom photos
  try {
    const rawSt = localStorage.getItem('magra_db_students');
    if (rawSt) {
      const list = JSON.parse(rawSt);
      if (Array.isArray(list)) {
        list.forEach(s => {
          if (!s) return;
          const photo = s.photo_url || s.photo || s.image;
          if (photo && typeof photo === 'string' && photo.startsWith('data:image') && photo.length > 100) {
            savePhotoToCacheAndIdb(s, photo);
          }
        });
      }
    }
  } catch (e) {
    console.warn('magra_db_students photo scan error:', e);
  }

  // 2b. Also scan magra_db_teachers in localStorage for embedded custom photos
  try {
    const rawTch = localStorage.getItem('magra_db_teachers');
    if (rawTch) {
      const list = JSON.parse(rawTch);
      if (Array.isArray(list)) {
        list.forEach(t => {
          if (!t) return;
          const photo = t.photo_url || t.photo;
          if (photo && typeof photo === 'string' && photo.startsWith('data:image') && photo.length > 50 && !photo.includes('data:image/svg')) {
            saveTeacherCustomPhoto(t, photo);
          }
        });
      }
    }
  } catch (e) {
    console.warn('magra_db_teachers photo scan error:', e);
  }

  // 3. Load all photos from IndexedDB into PHOTO_CACHE
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          PHOTO_CACHE.set(String(cursor.key).toLowerCase(), cursor.value);
          cursor.continue();
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('magra_photos_synced'));
          }
        }
      };
    }
  } catch (err) {
    console.warn('IndexedDB preload error:', err);
  }
}

// Helper to save photo to memory cache and IndexedDB across multiple lookup keys
export function savePhotoToCacheAndIdb(student, dataUrl) {
  if (!student || !dataUrl) return;
  const { sId, cName, rNo } = getStudentPhotoKey(student);

  // Set in synchronous memory cache
  if (student.id) PHOTO_CACHE.set(String(student.id).toLowerCase(), dataUrl);
  if (student.student_id) PHOTO_CACHE.set(String(student.student_id).toLowerCase(), dataUrl);
  if (sId) PHOTO_CACHE.set(sId, dataUrl);
  if (cName && rNo) {
    PHOTO_CACHE.set(`cls_${cName}_roll_${rNo}`.toLowerCase(), dataUrl);
    PHOTO_CACHE.set(`${cName}_${rNo}`.toLowerCase(), dataUrl);
    PHOTO_CACHE.set(`cls_${cName}_${rNo}`.toLowerCase(), dataUrl);
    PHOTO_CACHE.set(`class_${cName}_roll_${rNo}`.toLowerCase(), dataUrl);
  }

  // Set in IndexedDB (asynchronous, high capacity)
  if (student.id) idbSetPhoto(String(student.id).toLowerCase(), dataUrl);
  if (student.student_id) idbSetPhoto(String(student.student_id).toLowerCase(), dataUrl);
  if (sId) idbSetPhoto(sId, dataUrl);
  if (cName && rNo) {
    idbSetPhoto(`cls_${cName}_roll_${rNo}`.toLowerCase(), dataUrl);
    idbSetPhoto(`${cName}_${rNo}`.toLowerCase(), dataUrl);
    idbSetPhoto(`cls_${cName}_${rNo}`.toLowerCase(), dataUrl);
    idbSetPhoto(`class_${cName}_roll_${rNo}`.toLowerCase(), dataUrl);
  }

  // Safe fallback to localStorage (tiny key only, ignore quota errors)
  try {
    if (cName && rNo) {
      localStorage.setItem(`magra_photo_cls_${cName}_roll_${rNo}`, dataUrl);
    }
  } catch {}

  // Dispatch update event for instant UI re-render
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('magra_photos_synced'));
  }
}

export function getTeacherPhotoKeys(teacher) {
  if (!teacher) return [];
  const keys = [];
  const id = String(teacher.id || '').toLowerCase().trim();
  const empId = String(teacher.employee_id || '').toLowerCase().trim();
  const nameBn = String(teacher.name_bn || teacher.name || '').trim();

  if (id) {
    keys.push(`teacher_${id}`);
    keys.push(`tch_${id}`);
    keys.push(id);
  }
  if (empId) {
    keys.push(`teacher_${empId}`);
    keys.push(`teacher_emp_${empId}`);
    keys.push(`tch_emp_${empId}`);
    keys.push(`emp_${empId}`);
  }
  if (nameBn) {
    keys.push(`teacher_name_${nameBn}`);
  }
  return keys;
}

export function saveTeacherCustomPhoto(teacher, dataUrl) {
  if (!teacher || !dataUrl) return;
  const keys = getTeacherPhotoKeys(teacher);
  keys.forEach(k => {
    PHOTO_CACHE.set(k, dataUrl);
    idbSetPhoto(k, dataUrl);
  });
  const empId = String(teacher.employee_id || teacher.id || '').trim();
  if (empId) {
    try {
      localStorage.setItem(`magra_photo_teacher_${empId}`, dataUrl);
    } catch {}
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('magra_photos_synced'));
    window.dispatchEvent(new CustomEvent('magra_teachers_updated'));
  }
}

export function getTeacherCustomPhoto(teacher) {
  if (!teacher) return null;
  const keys = getTeacherPhotoKeys(teacher);
  for (const k of keys) {
    const val = PHOTO_CACHE.get(k);
    if (val && val.length > 50) return val;
  }
  const empId = String(teacher.employee_id || teacher.id || '').trim();
  if (empId) {
    try {
      const lsVal = localStorage.getItem(`magra_photo_teacher_${empId}`);
      if (lsVal && lsVal.length > 50) {
        PHOTO_CACHE.set(`teacher_${empId}`, lsVal);
        return lsVal;
      }
    } catch {}
  }
  return null;
}

export async function saveLeadershipPhoto(roleKey, dataUrl) {
  if (!roleKey || !dataUrl) return;
  const key = `leadership_${roleKey}`.toLowerCase();
  PHOTO_CACHE.set(key, dataUrl);
  await idbSetPhoto(key, dataUrl);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('magra_photos_synced'));
    window.dispatchEvent(new CustomEvent('magra_leadership_updated'));
  }
}

export function getLeadershipPhoto(roleKey) {
  if (!roleKey) return null;
  const key = `leadership_${roleKey}`.toLowerCase();
  return PHOTO_CACHE.get(key) || null;
}

// Client-side lightweight canvas image compressor to prevent LocalStorage 5MB quota errors
export function compressImageToDataUrl(source, maxDimension = 360, quality = 0.82) {
  return new Promise((resolve) => {
    if (!source) return resolve('');
    // If it's a File or Blob
    if (typeof window !== 'undefined' && (source instanceof Blob || source instanceof File)) {
      const reader = new FileReader();
      reader.onload = () => {
        compressImageToDataUrl(reader.result, maxDimension, quality).then(resolve);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(source);
      return;
    }
    // If it's a string URL
    if (typeof source === 'string') {
      if (!source.startsWith('data:image/')) {
        // Plain HTTP or static image URL
        return resolve(source);
      }
      // If already compact (< 35KB), keep as is
      if (source.length < 35000) {
        return resolve(source);
      }
      if (typeof document === 'undefined') return resolve(source);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxDimension || h > maxDimension) {
            const ratio = Math.min(maxDimension / w, maxDimension / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(source);
        }
      };
      img.onerror = () => resolve(source);
      img.src = source;
      return;
    }
    resolve(source);
  });
}

// Auto-initialize on import in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initPhotoStorage();
  }, 10);
}
