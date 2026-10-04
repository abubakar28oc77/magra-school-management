import React, { useState } from 'react';
import {
  MOCK_SCHOOL,
  MOCK_COMMITTEE,
  MOCK_TEACHERS,
  MOCK_STAFF,
  MOCK_STUDENTS,
  MOCK_SCHOLARSHIPS,
  MOCK_SSC_RESULTS,
  MOCK_NOTICES,
  MOCK_BOOKS,
  MOCK_SUBJECTS,
  MOCK_ROUTINES
} from './mockData';

export function SubmenuDetailModal({ menuKey, title, onClose, onNavigateRole }) {
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [examScore, setExamScore] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  if (!menuKey) return null;

  const renderContent = () => {
    // 1. Institution submenus
    if (menuKey === 'public.nav.institution.about') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">🏛️ বিদ্যালয় পরিচিতি</div>
          <h3>মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় (স্থাপিত: ১৯৪৬ খ্রি.)</h3>
          <p className="lead-text">
            টাঙ্গাইল জেলার কালিহাতি উপজেলার মগড়া ইউনিয়নে অবস্থিত একটি ঐতিহ্যবাহী ও সুপ্রাচীন বিদ্যাপীঠ।
            বিগত ৮ দশকেরও বেশি সময় ধরে প্রতিষ্ঠানটি স্থানীয় পর্যায়ে মানসম্মত শিক্ষা, শৃঙ্খলা, নৈতিকতা ও আধুনিক কারিগরি শিক্ষার আলো ছড়িয়ে আসছে।
          </p>
          <div className="info-stats-grid">
            <div className="info-stat-card"><b>১১৪২৯০</b><span>EIIN নম্বর</span></div>
            <div className="info-stat-card"><b>৪২০৬০৭১৩০২</b><span>MPO কোড</span></div>
            <div className="info-stat-card"><b>১৯৪৬</b><span>প্রতিষ্ঠার সন</span></div>
            <div className="info-stat-card"><b>৬ষ্ঠ–১০ম</b><span>শ্রেণি পাঠদান</span></div>
            <div className="info-stat-card"><b>৬৫৪ জন</b><span>বর্তমান শিক্ষার্থী</span></div>
            <div className="info-stat-card"><b>২৪ জন</b><span>দক্ষ শিক্ষক ও কর্মচারী</span></div>
          </div>
          <h4>বিদ্যালয়ের লক্ষ্য ও উদ্দেশ্য</h4>
          <ul className="bullet-list">
            <li>আধুনিক বিজ্ঞান ও তথ্যপ্রযুক্তিভিত্তিক যুগোপযোগী শিক্ষা নিশ্চিত করা।</li>
            <li>শিক্ষার্থীদের নৈতিক মূল্যবোধ, শৃঙ্খলা, দেশপ্রেম ও নেতৃত্বগুণে বিকশিত করা।</li>
            <li>সহশিক্ষা কার্যক্রমের মাধ্যমে প্রতিটি শিক্ষার্থীর মেধা ও সৃজনশীলতার বিকাশ ঘটানো।</li>
          </ul>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.committee') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👥 পরিচালনা কমিটি (Managing Committee)</div>
          <p className="lead-text">বিদ্যালয়ের সার্বিক শিক্ষা, প্রশাসনিক ও ভৌত অবকাঠামোগত উন্নয়নের দায়িত্বে নিয়োজিত গভর্নিং বডি:</p>
          <div className="committee-grid">
            {MOCK_COMMITTEE.map((m, idx) => (
              <div key={idx} className="committee-card">
                <div className="member-avatar">{m.name_bn.slice(0, 1)}</div>
                <div className="member-info">
                  <span className="member-role">{m.role}</span>
                  <h4>{m.name_bn}</h4>
                  <p>{m.designation}</p>
                  <small>মেয়াদকাল: {m.tenure}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.rules') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📜 বিদ্যালয়ের নিয়ম-কানুন ও আচরণবিধি</div>
          <div className="rules-section">
            <div className="rule-card">
              <h4>১. পোশাক ও সাজসজ্জা</h4>
              <p>প্রতিটি শিক্ষার্থীকে নির্ধারিত স্কুল ড্রেস, ব্যাজ, কালো জুতো ও সাদা মোজা পরে বিদ্যালয়ে উপস্থিত হতে হবে।</p>
            </div>
            <div className="rule-card">
              <h4>২. ক্লাসে উপস্থিতি ও সময়ানুবর্তিতা</h4>
              <p>সকাল ৯:৪৫ মিনিটের মধ্যে জাতীয় সঙ্গীতে অংশ নিতে হবে। ৯০% উপস্থিতি বাধ্যতামূলক। বিনা অনুমতিতে অনুপস্থিতি গ্রহণযোগ্য নয়।</p>
            </div>
            <div className="rule-card">
              <h4>৩. শৃঙ্খলা ও মোবাইল নিষিদ্ধকরণ</h4>
              <p>শ্রেণিকক্ষে কোনো ধরনের স্মার্টফোন বা ইলেকট্রনিক ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ। শিক্ষকদের নির্দেশ ও বিদ্যালয়ের সম্পত্তি রক্ষা করতে হবে।</p>
            </div>
            <div className="rule-card">
              <h4>৪. পরীক্ষা ও মূল্যায়ন নীতি</h4>
              <p>সকল অভ্যন্তরীণ সাময়িক ও মডেল পরীক্ষায় অংশগ্রহণ বাধ্যতামূলক। নকল বা অসদুপায় অবলম্বন করলে বহিষ্কারের বিধান রয়েছে।</p>
            </div>
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.library') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📚 কেন্দ্রীয় লাইব্রেরি ও বুক ব্যাংক</div>
          <p className="lead-text">বিদ্যালয়ের লাইব্রেরিতে দেশি-বিদেশি সাহিত্য, পাঠ্যবই, মুক্তিযুদ্ধ, বিজ্ঞান ও রেফারেন্সের ৩,০০০+ বই রয়েছে।</p>
          <div className="table-wrap">
            <table className="modal-table">
              <thead>
                <tr>
                  <th>বইয়ের নাম</th>
                  <th>লেখক</th>
                  <th>ক্যাটাগরি</th>
                  <th>উপলভ্য কপি</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BOOKS.map(b => (
                  <tr key={b.id}>
                    <td><b>{b.title}</b></td>
                    <td>{b.author}</td>
                    <td><span className="badge">{b.category}</span></td>
                    <td><span className="status-green">{b.available_quantity} টি বাকি</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (menuKey === 'public.nav.institution.curriculum') {
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📖 জাতীয় পাঠ্যক্রম ও পাঠ্যপুস্তক (NCTB)</div>
          <p className="lead-text">জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ষষ্ঠ থেকে দশম শ্রেণির পাঠ্যতালিকা:</p>
          <div className="curriculum-classes">
            {['6', '7', '8', '9', '10'].map(cls => (
              <div key={cls} className="class-curriculum-card">
                <h4>শ্রেণি {cls} পাঠ্যতালিকা</h4>
                <div className="subject-tags">
                  {MOCK_SUBJECTS.filter(s => !s.class_name || s.class_name === cls).map(s => (
                    <span key={s.id} className="subject-chip">✓ {s.name_bn}</span>
                  ))}
                  <span className="subject-chip">✓ শারীরিক শিক্ষা ও স্বাস্থ্য</span>
                  <span className="subject-chip">✓ কর্ম ও জীবনমুখী শিক্ষা</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Sports & Culture submenus
    if (menuKey.startsWith('public.nav.sport')) {
      const sportTitles = {
        'public.nav.sport.sports': 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
        'public.nav.sport.clubs': 'বিজ্ঞান, আইসিটি ও বিতর্ক ক্লাব',
        'public.nav.sport.culture': 'সাংস্কৃতিক অনুষ্ঠান ও আবৃত্তি',
        'public.nav.sport.achievements': 'বিদ্যালয়ের গৌরব ও অর্জন',
        'public.nav.sport.tour': 'বার্ষিক শিক্ষা সফর ও ভ্রমণ',
        'public.nav.sport.debate': 'বিতর্কচর্চা ও ডিবেটিং ক্লাব',
        'public.nav.sport.lab': 'শেখ রাসেল কম্পিউটার ও ডিজিটাল ল্যাব',
        'public.nav.sport.multimedia': 'স্মার্ট মাল্টিমিডিয়া ক্লাসরুম',
        'public.nav.sport.scouts': 'স্কাউট ও গার্লস গাইড দল',
        'public.nav.sport.inter': 'আন্তঃবিদ্যালয় ফুটবল ও ক্রিকেট প্রতিযোগিতা'
      };
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">⚽ {sportTitles[menuKey] || 'ক্রীড়া ও সহশিক্ষা'}</div>
          <h3>{sportTitles[menuKey]}</h3>
          <p className="lead-text">
            মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ে শিক্ষার্থীদের মেধা ও শারীরিক সক্ষমতা বিকাশে বছরব্যাপী সহশিক্ষা কার্যক্রম সচল থাকে।
          </p>
          <div className="activity-cards">
            <div className="activity-card">
              <span className="activity-icon">🏆</span>
              <div>
                <h4>নিয়মিত চর্চা ও প্রতিযোগিতা</h4>
                <p>আন্তঃশ্রেণি ফুটবল, ক্রিকেট, ক্যারম, দাবা এবং বার্ষিক সাংস্কৃতিক সপ্তাহ অনুষ্ঠিত হয়।</p>
              </div>
            </div>
            <div className="activity-card">
              <span className="activity-icon">💻</span>
              <div>
                <h4>শেখ রাসেল ডিজিটাল ল্যাব</h4>
                <p>আধুনিক কম্পিউটার, প্রজেক্টর এবং ইন্টারনেট সংযোগে সমৃদ্ধ ডিজিটাল ক্লাসরুম।</p>
              </div>
            </div>
            <div className="activity-card">
              <span className="activity-icon">🏕️</span>
              <div>
                <h4>স্কাউট ও গার্ল গাইড আন্দোলন</h4>
                <p>বিদ্যালয়ের স্কাউট দল উপজেলা ও জেলা পর্যায়ের স্কাউট সমাবেশে শ্রেষ্ঠত্বের প্রমাণ রেখেছে।</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Staff & Teachers
    if (menuKey.startsWith('public.nav.staff')) {
      const isFormer = menuKey.includes('former');
      const isStaffOnly = menuKey.includes('employees') || menuKey.includes('formerEmployees');
      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👨‍🏫 {isStaffOnly ? 'কর্মচারীবৃন্দ' : 'শিক্ষকবৃন্দ'}</div>
          <p className="lead-text">আমাদের অভিজ্ঞ, নিষ্ঠাবান ও প্রশিক্ষণপ্রাপ্ত শিক্ষক এবং কর্মচারীদের পরিচিতি:</p>
          <div className="people-grid-full">
            {(isStaffOnly ? MOCK_STAFF : MOCK_TEACHERS).map(person => (
              <div key={person.id} className="person-box-modal">
                <div className="avatar-circle">{person.name_bn.slice(0, 1)}</div>
                <h4>{person.name_bn}</h4>
                <p className="person-desig">{person.designation}</p>
                {person.subject && <span className="subject-badge">বিষয়: {person.subject}</span>}
                {person.phone && <p className="person-contact">📱 {person.phone}</p>}
                {person.email && <p className="person-contact">✉️ {person.email}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. Students info
    if (menuKey.startsWith('public.nav.students')) {
      if (menuKey === 'public.nav.students.seats') {
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">📊 শ্রেণি ও আসন তথ্য (২০২৬)</div>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>শ্রেণি</th>
                  <th>শাখা</th>
                  <th>মোট আসন</th>
                  <th>ভর্তি শিক্ষার্থী</th>
                  <th>খালি আসন</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cls: '৬ষ্ঠ', sec: 'ক ও খ', total: 150, filled: 140, open: 10 },
                  { cls: '৭ম', sec: 'ক ও খ', total: 150, filled: 135, open: 15 },
                  { cls: '৮ম', sec: 'ক ও খ', total: 140, filled: 130, open: 10 },
                  { cls: '৯ম', sec: 'বিজ্ঞান ও মানবিক', total: 140, filled: 125, open: 15 },
                  { cls: '১০ম', sec: 'বিজ্ঞান ও মানবিক', total: 140, filled: 124, open: 16 }
                ].map((row, i) => (
                  <tr key={i}>
                    <td><b>শ্রেণি {row.cls}</b></td>
                    <td>{row.sec}</td>
                    <td>{row.total}</td>
                    <td>{row.filled}</td>
                    <td><b>{row.open}</b></td>
                    <td><span className="status-green">ভর্তি সচল</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (menuKey === 'public.nav.students.scholarship') {
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">🎓 বৃত্তিপ্রাপ্ত ও মেধাবী শিক্ষার্থী</div>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>ID / শ্রেণি</th>
                  <th>বৃত্তির নাম</th>
                  <th>প্রদানকারী সংস্থা</th>
                  <th>পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCHOLARSHIPS.map(s => (
                  <tr key={s.id}>
                    <td><b>{s.name_bn}</b></td>
                    <td>{s.student_id} (শ্রেণি {s.class_name})</td>
                    <td>{s.scholarship_name}</td>
                    <td>{s.provider}</td>
                    <td><b>৳ {s.amount.toLocaleString('bn-BD')}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">👥 শিক্ষার্থী তালিকা ও পরিসংখ্যান</div>
          <div className="filter-bar-modal">
            <input
              placeholder="শিক্ষার্থীর নাম / Student ID / গ্রাম খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="all">সকল শ্রেণি</option>
              <option value="6">শ্রেণি ৬</option>
              <option value="7">শ্রেণি ৭</option>
              <option value="8">শ্রেণি ৮</option>
              <option value="9">শ্রেণি ৯</option>
              <option value="10">শ্রেণি ১০</option>
            </select>
          </div>
          <table className="modal-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>রোল</th>
                <th>নাম</th>
                <th>শ্রেণি</th>
                <th>পিতা / অভিভাবক</th>
                <th>গ্রাম</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STUDENTS
                .filter(s => filterClass === 'all' || s.class_name === filterClass)
                .filter(s => !searchQuery || (s.name_bn + ' ' + s.student_id + ' ' + s.current_village).toLowerCase().includes(searchQuery.toLowerCase()))
                .map(s => (
                  <tr key={s.id}>
                    <td><code>{s.student_id}</code></td>
                    <td><b>{s.roll_no}</b></td>
                    <td>{s.name_bn}</td>
                    <td>শ্রেণি {s.class_name} ({s.section})</td>
                    <td>{s.guardian_name || s.father_name}</td>
                    <td>{s.current_village}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 5. Results
    if (menuKey.startsWith('public.nav.results')) {
      if (menuKey === 'public.nav.results.ssc') {
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">📈 বিগত বছরের SSC পরীক্ষার ফলাফল ও পরিসংখ্যান</div>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>শিক্ষাবর্ষ</th>
                  <th>পরীক্ষার্থী</th>
                  <th>উত্তীর্ণ</th>
                  <th>GPA 5 (A+)</th>
                  <th>পাশের হার</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SSC_RESULTS.map((r, i) => (
                  <tr key={i}>
                    <td><b>{r.year}</b></td>
                    <td>{r.candidates} জন</td>
                    <td>{r.passed} জন</td>
                    <td><b style={{ color: '#075c3a' }}>{r.gpa5} জন</b></td>
                    <td><span className="status-green">{r.pass_rate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📊 পরীক্ষার ফলাফল ও মার্কশিট ভিউ</div>
          <p className="lead-text">শিক্ষার্থীর Student ID ও পরীক্ষার তথ্য দিয়ে অনলাইন মার্কশিট ও প্রগ্রেস রিপোর্ট দেখুন:</p>
          <div className="sample-marksheet-card">
            <h4>১ম সাময়িক পরীক্ষা ২০২৬ — নমুনা মার্কশিট</h4>
            <div className="student-quick-details">
              <span><b>নাম:</b> মাহির আহমেদ</span>
              <span><b>Student ID:</b> STU-2026-0601</span>
              <span><b>শ্রেণি:</b> ৬ষ্ঠ (রোল ১)</span>
              <span><b>GPA:</b> 5.00 (A+)</span>
            </div>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>বিষয়</th>
                  <th>পূর্ণমান</th>
                  <th>প্রাপ্ত নম্বর</th>
                  <th>লেটার গ্রেড</th>
                  <th>গ্রেড পয়েন্ট</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>বাংলা</td><td>১০০</td><td>৯০</td><td>A+</td><td>৫.০০</td></tr>
                <tr><td>ইংরেজি</td><td>১০০</td><td>৮৪</td><td>A+</td><td>৫.০০</td></tr>
                <tr><td>গণিত</td><td>১০০</td><td>৯৪</td><td>A+</td><td>৫.০০</td></tr>
                <tr><td>বিজ্ঞান</td><td>১০০</td><td>৮০</td><td>A+</td><td>৫.০০</td></tr>
                <tr><td>তথ্য ও যোগাযোগ প্রযুক্তি</td><td>৫০</td><td>৪৫</td><td>A+</td><td>৫.০০</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 6. Student Guide (Syllabus, Digital Learning, Online Exam, AI Tutor)
    if (menuKey.startsWith('public.nav.guide')) {
      if (menuKey === 'public.nav.guide.online') {
        const questions = [
          { id: 1, q: '১. কম্পিউটার মেমোরির ক্ষুদ্রতম একক কোনটি?', options: ['বিট (Bit)', 'বাইট (Byte)', 'কিলোবাইট (KB)', 'মেগাবাইট (MB)'], ans: 0 },
          { id: 2, q: '২. মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয় কত সালে প্রতিষ্ঠিত হয়?', options: ['১৯৪৭', '১৯৪৬', '১৯৭১', '১৯৫২'], ans: 1 },
          { id: 3, q: '৩. আলোর গতি প্রতি সেকেন্ডে প্রায় কত?', options: ['৩ লাখ কিমি', '১ লাখ কিমি', '৫ লাখ কিমি', '১০ লাখ কিমি'], ans: 0 }
        ];

        const handleQuizSubmit = (e) => {
          e.preventDefault();
          let score = 0;
          questions.forEach(q => {
            if (quizAnswers[q.id] === q.ans) score++;
          });
          setExamScore({ score, total: questions.length });
        };

        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">📝 অনলাইন মক পরীক্ষা ও কুইজ (Live Interactive Test)</div>
            <form onSubmit={handleQuizSubmit} className="quiz-container">
              {questions.map((q) => (
                <div key={q.id} className="quiz-question-card">
                  <h4>{q.q}</h4>
                  <div className="quiz-options">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className="quiz-option-label">
                        <input
                          type="radio"
                          name={'q_' + q.id}
                          checked={quizAnswers[q.id] === optIdx}
                          onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                          required
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="submit" className="btn btn-primary">✓ কুইজ সাবমিট ও ফলাফল দেখুন</button>
            </form>
            {examScore && (
              <div className="quiz-result-card">
                <h3>🎉 ফলাফল: {examScore.score} / {examScore.total}</h3>
                <p>{examScore.score === examScore.total ? 'অভিনন্দন! আপনি শতভাগ সঠিক উত্তর দিয়েছেন।' : 'খুব ভালো চেষ্টা! আবার অনুশীলন করুন।'}</p>
              </div>
            )}
          </div>
        );
      }

      if (menuKey === 'public.nav.guide.ai') {
        return (
          <div className="submenu-content">
            <div className="modal-hero-badge">🤖 AI শিক্ষা সহকারী (Smart AI Tutor)</div>
            <p className="lead-text">
              মগড়া স্কুলের শিক্ষার্থীদের পড়াশোনা, পড়ার রুটিন তৈরি, গণিত-বিজ্ঞান ও ভাষা শিক্ষায় সাহায্য করার জন্য সার্বক্ষণিক AI শিক্ষা সহকারী প্রস্তুত।
            </p>
            <div className="ai-features-grid">
              <div className="ai-feature-card">
                <b>📅 ব্যক্তিগত Study Plan</b>
                <p>আপনার দুর্বল বিষয় চিহ্নিত করে সাপ্তাহিক পড়ার পরিকল্পনা তৈরি করে দেবে।</p>
              </div>
              <div className="ai-feature-card">
                <b>💡 তাৎক্ষণিক সমাধান ও ব্যাখ্যা</b>
                <p>যেকোনো অধ্যায়ের সূত্র, ব্যাকরণ বা ধারণার সহজ বাংলা ব্যাখ্যা দেবে।</p>
              </div>
            </div>
            <div className="modal-action-box">
              <p>AI শিক্ষা সহকারীর পূর্ণ চ্যাট সুবিধা পেতে শিক্ষার্থী বা শিক্ষক পোর্টালে লগইন করুন:</p>
              <button className="btn btn-primary" onClick={() => { onClose(); onNavigateRole('student'); }}>
                🧑‍🎓 শিক্ষার্থী পোর্টালে AI Tutor খুলুন →
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="submenu-content">
          <div className="modal-hero-badge">📚 শিক্ষার্থীর গাইড ও ডিজিটাল লার্নিং রিসোর্স</div>
          <div className="guide-resources-grid">
            <div className="guide-resource-card">
              <h4>📄 সিলেবাস ও পাঠ পরিকল্পনা</h4>
              <p>৬ষ্ঠ থেকে ১০ম শ্রেণির ২০২৬ শিক্ষাবর্ষের সকল বিষয়ের বার্ষিক সিলেবাস।</p>
              <span className="badge">PDF ডাউনলোড প্রস্তুত</span>
            </div>
            <div className="guide-resource-card">
              <h4>🎬 ডিজিটাল ভিডিও লেকচার</h4>
              <p>গণিত, বিজ্ঞান ও ইংরেজি বিষয়ের বিষয়ভিত্তিক ভিডিও ক্লাস ও মাল্টিমিডিয়া প্রেজেন্টেশন।</p>
              <span className="badge">অনলাইন ভিডিও</span>
            </div>
            <div className="guide-resource-card">
              <h4>❓ প্রশ্নব্যাংক ও মডেল প্রশ্ন</h4>
              <p>বিগত ৫ বছরের বোর্ড প্রশ্ন এবং স্কুলের বিগত সাময়িক পরীক্ষার প্রশ্নপত্র।</p>
              <span className="badge">মডেল টেস্ট</span>
            </div>
          </div>
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="submenu-content">
        <div className="modal-hero-badge">ℹ️ {title}</div>
        <h3>{title}</h3>
        <p className="lead-text">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়ের {title} সম্পর্কিত তথ্য ও আপডেট।</p>
        <p>বিদ্যালয় প্রশাসন থেকে এই সংক্রান্ত সর্বশেষ তথ্য ও ফাইলসমূহ নিয়মিত হালনাগাদ করা হয়।</p>
      </div>
    );
  };

  return (
    <div className="submenu-modal-overlay" onClick={onClose}>
      <div className="submenu-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>বন্ধ করুন</button>
        </div>
      </div>
    </div>
  );
}
