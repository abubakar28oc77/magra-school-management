import fs from 'fs';

// Extract the normalization and matching functions as in ResultPanel.jsx
const normBn = (str) => (str || '')
  .toLowerCase()
  .replace(/[\u09AF][\u09BC]/g, '\u09DF')
  .replace(/[\u09DF]/g, 'য়')
  .replace(/[\u09A1][\u09BC]/g, '\u09DC')
  .replace(/[\u09A2][\u09BC]/g, '\u09DD')
  .replace(/ী/g, 'ি')
  .replace(/ূ/g, 'ু')
  .replace(/ণ/g, 'ন')
  .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
  .replace(/[\s_\-\/\(\)\.]+/g, '');

const isEnglish1st = (s) => {
  if (!s) return false;
  const raw = String(s).toLowerCase();
  const n = normBn(raw);
  if (n.includes('107') || n.includes('sub10107') || n.includes('sub9107')) return true;
  const hasEng = n.includes('ইংরেজি') || n.includes('english') || n.includes('eng');
  if (!hasEng) return false;
  if (n.includes('2nd') || n.includes('২য়') || n.includes('2') || n.includes('ii')) return false;
  return n.includes('1st') || n.includes('১ম') || n.includes('1') || n.includes('i') || n.includes('পত্র') || true;
};

const isEnglish2nd = (s) => {
  if (!s) return false;
  const raw = String(s).toLowerCase();
  const n = normBn(raw);
  if (n.includes('108') || n.includes('sub10108') || n.includes('sub9108')) return true;
  const hasEng = n.includes('ইংরেজি') || n.includes('english') || n.includes('eng');
  if (!hasEng) return false;
  return n.includes('2nd') || n.includes('২য়') || n.includes('2') || n.includes('ii');
};

const sub107 = { id: 'sub-10-107', code: '107', name_bn: 'ইংরেজি ১ম পত্র', name_en: 'English 1st Paper', class_name: '10' };
const sub108 = { id: 'sub-10-108', code: '108', name_bn: 'ইংরেজি ২য় পত্র', name_en: 'English 2nd Paper', class_name: '10' };
const classSubjects = [sub107, sub108];

// Test 1: Mode 1 with English 1st and English 2nd
const headers1 = ['Roll', 'Name', 'English 1st', 'English 2nd'];
const cleanH1 = headers1.map(h => normBn(h));
let col107_h1 = cleanH1.findIndex((h, idx) => isEnglish1st(headers1[idx]) || isEnglish1st(h));
let col108_h1 = cleanH1.findIndex((h, idx) => isEnglish2nd(headers1[idx]) || isEnglish2nd(h));
console.log('Test 1 (English 1st/2nd):', col107_h1 === 2, col108_h1 === 3);

// Test 2: Mode 1 with English-I and English-II
const headers2 = ['Roll', 'Name', 'English-I', 'English-II'];
const cleanH2 = headers2.map(h => normBn(h));
let col107_h2 = cleanH2.findIndex((h, idx) => isEnglish1st(headers2[idx]) || isEnglish1st(h));
let col108_h2 = cleanH2.findIndex((h, idx) => isEnglish2nd(headers2[idx]) || isEnglish2nd(h));
console.log('Test 2 (English-I/II):', col107_h2 === 2, col108_h2 === 3);

// Test 3: Mode 1 with Bengali spelling variant 'ইংরেজী ১ম পত্র' / 'ইংরেজী ২য় পত্র'
const headers3 = ['রোল', 'নাম', 'ইংরেজী ১ম পত্র', 'ইংরেজী ২য় পত্র'];
const cleanH3 = headers3.map(h => normBn(h));
let col107_h3 = cleanH3.findIndex((h, idx) => isEnglish1st(headers3[idx]) || isEnglish1st(h));
let col108_h3 = cleanH3.findIndex((h, idx) => isEnglish2nd(headers3[idx]) || isEnglish2nd(h));
console.log('Test 3 (ইংরেজী ১ম/২য়):', col107_h3 === 2, col108_h3 === 3);

// Test 4: Mode 2 with row code '১০৭' or row name 'ইংরেজী'
const rowCode = '১০৭';
const rowName = 'ইংরেজী ১ম পত্র';
const normRowCode = rowCode.replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)).trim();
const matchedCode = classSubjects.find(s => s.code === normRowCode);
console.log('Test 4 (Code ১০৭):', matchedCode?.id === 'sub-10-107');

let matchedName = null;
if (isEnglish2nd(rowName)) matchedName = sub108;
else if (isEnglish1st(rowName)) matchedName = sub107;
console.log('Test 5 (Name ইংরেজী ১ম পত্র):', matchedName?.id === 'sub-10-107');

if (col107_h1 === 2 && col108_h1 === 3 && col107_h2 === 2 && col108_h2 === 3 && col107_h3 === 2 && col108_h3 === 3 && matchedCode?.id === 'sub-10-107' && matchedName?.id === 'sub-10-107') {
  console.log('ALL CSV PARSING TESTS PASSED!');
} else {
  console.error('SOME TESTS FAILED!');
  process.exit(1);
}
