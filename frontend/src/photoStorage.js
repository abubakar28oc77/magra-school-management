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

// Auto-initialize on import in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initPhotoStorage();
  }, 10);
}
