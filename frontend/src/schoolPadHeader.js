import schoolLogo from '../public/school-logo.png';

export const SCHOOL_PAD_HEADER_HTML = `
  <div class="school-pad-header">
    <div class="pad-logo-box">
      <img src="${schoolLogo}" class="pad-logo-img" alt="বিদ্যালয়ের লোগো" />
    </div>
    <div class="pad-center-meta">
      <h1 class="pad-title-bn">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
      <div class="pad-location-bn">ডাকঘর ঃ মগড়া , উপজেলা ঃ কালিহাতি , জেলা ঃ টাঙ্গাইল</div>
      <div class="pad-estd-bn">স্থাপিত ঃ ১৯৪৬ খ্রি.</div>
      <div class="pad-contacts-bn">ই-মেইল ঃ magrapuhs.46@gmail.com, ওয়েবসাইট ঃ magrapalshs.edu.bd</div>
    </div>
    <div class="pad-codes-box">
      <div class="pad-eiin-title">EIIN NO : 114290</div>
      <div class="pad-code-item">কেন্দ্র কোড ঃ ২৫৫ ( এলেঙ্গা )</div>
      <div class="pad-code-item">বিদ্যালয় কোড ঃ 4877</div>
      <div class="pad-code-item">থানা কোড ঃ 194</div>
      <div class="pad-code-item">জেলা কোড ঃ 24</div>
      <div class="pad-code-item">এমপিও কোড ঃ 4206071302</div>
    </div>
  </div>
  <div class="pad-bottom-double-line"></div>
`;

export const SCHOOL_PAD_STYLES = `
  .school-pad-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    margin-bottom: 2px;
    box-sizing: border-box;
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
  }

  .pad-logo-box {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 86px;
  }

  .pad-logo-img {
    width: 82px;
    height: 82px;
    object-fit: contain;
    display: block;
  }

  .pad-center-meta {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5px;
  }

  .pad-title-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
    font-size: 26px;
    font-weight: 900;
    color: #14532d !important;
    margin: 0;
    line-height: 1.15;
    letter-spacing: 0.5px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-location-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #1d4ed8 !important;
    margin: 0;
    line-height: 1.25;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-estd-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
    font-size: 13px;
    font-weight: 800;
    color: #dc2626 !important;
    margin: 0;
    line-height: 1.25;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-contacts-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    color: #0f2b5c !important;
    margin: 0;
    line-height: 1.25;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-codes-box {
    flex-shrink: 0;
    background: #e8f5e9 !important;
    border: 1px solid #c8e6c9 !important;
    border-radius: 4px;
    padding: 5px 9px;
    text-align: left;
    min-width: 172px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.5px;
    line-height: 1.3;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-eiin-title {
    font-family: 'Outfit', 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    font-weight: 900;
    color: #002060 !important;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
    border-bottom: 1px dashed #a7d7a9;
    padding-bottom: 2px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-code-item {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    color: #800000 !important;
    white-space: nowrap;
    line-height: 1.25;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-bottom-double-line {
    width: 100%;
    height: 3.5px;
    border-top: 1px solid #111 !important;
    border-bottom: 2px solid #111 !important;
    margin-top: 6px;
    margin-bottom: 14px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;
