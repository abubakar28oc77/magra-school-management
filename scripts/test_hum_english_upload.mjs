import fs from 'fs';
import { processClassResults } from '../frontend/src/boardExamEngine.js';

// Read mock data
const mockCode = fs.readFileSync('frontend/src/mockData.js', 'utf8');
const students = eval(mockCode.match(/export const MOCK_STUDENTS = (\[[\s\S]*?\]);\s*export/)[1]);
const subjects = eval(mockCode.match(/export const MOCK_SUBJECTS = (\[[\s\S]*?\]);\s*export/)[1]);
const exams = eval(mockCode.match(/export const MOCK_EXAMS = (\[[\s\S]*?\]);\s*export/)[1]);

const examId = 'ex-test-2026';
const humStudents = students.filter(s => s.class_name === '10' && (s.department === 'মানবিক' || (s.group_name && s.group_name.includes('মানবিক'))));

console.log(`Found ${humStudents.length} Class 10 Humanities students.`);

// Simulate uploaded marks for Humanities students:
// Roll 1: Tanjina Akter (stu-10-hum-01): English 1st = 75, English 2nd = 68
// Roll 2: Nusrat Jahan (stu-10-hum-02): English 1st = 80, English 2nd = 85
const marksList = [
  {
    exam_id: examId,
    class_name: '10',
    student_id: 'stu-10-hum-01',
    student_code: 'STU-10-HUM-01',
    roll_no: 1,
    department: 'মানবিক',
    subject_id: 'sub-10-107',
    subject_code: '107',
    written: 75,
    mcq: 0,
    practical: 0,
    total: 75
  },
  {
    exam_id: examId,
    class_name: '10',
    student_id: 'stu-10-hum-01',
    student_code: 'STU-10-HUM-01',
    roll_no: 1,
    department: 'মানবিক',
    subject_id: 'sub-10-108',
    subject_code: '108',
    written: 68,
    mcq: 0,
    practical: 0,
    total: 68
  },
  {
    exam_id: examId,
    class_name: '10',
    student_id: 'stu-10-hum-02',
    student_code: 'STU-10-HUM-02',
    roll_no: 2,
    department: 'মানবিক',
    subject_id: 'sub-10-107',
    subject_code: '107',
    written: 80,
    mcq: 0,
    practical: 0,
    total: 80
  },
  {
    exam_id: examId,
    class_name: '10',
    student_id: 'stu-10-hum-02',
    student_code: 'STU-10-HUM-02',
    roll_no: 2,
    department: 'মানবিক',
    subject_id: 'sub-10-108',
    subject_code: '108',
    written: 85,
    mcq: 0,
    practical: 0,
    total: 85
  }
];

const results = processClassResults(students, subjects, marksList, '10', examId, exams);
console.log(`Results processed for ${results.length} students.`);

const st1 = results.find(r => r.student_id === 'stu-10-hum-01' || r.id === 'stu-10-hum-01');
if (!st1) {
  console.error('FAIL: stu-10-hum-01 not found in results!');
  process.exit(1);
}

const eng1 = st1.subjects.find(s => String(s.code) === '107');
const eng2 = st1.subjects.find(s => String(s.code) === '108');

console.log('Tanjina Akter English 1st:', eng1?.written, 'total:', eng1?.total, 'letter:', eng1?.letter_grade);
console.log('Tanjina Akter English 2nd:', eng2?.written, 'total:', eng2?.total, 'letter:', eng2?.letter_grade);
console.log('Combined total:', eng1?.combined_total, 'Grade Point:', eng1?.gp);

if (eng1?.written !== 75 || eng2?.written !== 68) {
  console.error('FAIL: Tanjina Akter English marks mismatch!');
  process.exit(1);
}

if (eng1?.combined_total !== 143) {
  console.error('FAIL: Combined total should be 143, got:', eng1?.combined_total);
  process.exit(1);
}

console.log('SUCCESS: Humanities English marks processing fully verified!');
