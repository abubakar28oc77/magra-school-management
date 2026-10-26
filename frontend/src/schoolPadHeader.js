import schoolLogo from '../public/school-logo.png';

export const SCHOOL_PAD_HEADER_HTML = `
  <div class="school-pad-header">
    <div class="pad-logo-box">
      <img src="${schoolLogo}" class="pad-logo-img" alt="বিদ্যালয়ের লোগো" />
    </div>
    <div class="pad-center-meta">
      <h1 class="pad-title-bn">মগড়া পালস্ ইউনিয়ন উচ্চ বিদ্যালয়</h1>
      <div class="pad-location-bn">ডাকঘরঃ মগড়া, উপজেলাঃ কালিহাতি, জেলাঃ টাংগাইল</div>
      <div class="pad-estd-bn">স্থাপিতঃ ১৯৪৬খ্রি.</div>
      <div class="pad-contact-email">ই-মেইলঃ magrapuhs.46@gmail.com,</div>
      <div class="pad-contact-web">ওয়েবসাইটঃ magrapalshs.edu.bd</div>
    </div>
    <div class="pad-codes-box">
      <div class="pad-eiin-title">EIIN NO : 114290</div>
      <div class="pad-code-item">কেন্দ্র কোডঃ ২৫৫ (এলেঙ্গা)</div>
      <div class="pad-code-item">বিদ্যালয় কোডঃ 4877</div>
      <div class="pad-code-item">থানা কোডঃ 194</div>
      <div class="pad-code-item">জেলা কোডঃ 24</div>
      <div class="pad-code-item pad-mpo-item">এমপিও কোডঃ 4206071302</div>
    </div>
  </div>
  <div class="pad-bottom-double-line"></div>
`;

export const SCHOOL_PAD_STYLES = `
  .school-pad-header {
    display: grid !important;
    grid-template-columns: minmax(175px, 1fr) auto minmax(175px, 1fr) !important;
    align-items: center !important;
    width: 100% !important;
    margin-bottom: 2px !important;
    box-sizing: border-box !important;
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif !important;
  }

  .pad-logo-box {
    justify-self: start !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
  }

  .pad-logo-img {
    width: 84px !important;
    height: 84px !important;
    object-fit: contain !important;
    display: block !important;
  }

  .pad-center-meta {
    justify-self: center !important;
    text-align: center !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 1.5px !important;
    padding: 0 4px !important;
  }

  .pad-title-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif !important;
    font-size: 26px !important;
    font-weight: 900 !important;
    color: #14532d !important;
    margin: 0 !important;
    line-height: 1.15 !important;
    letter-spacing: 0.5px !important;
    text-align: center !important;
    white-space: nowrap !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-location-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #1d4ed8 !important;
    margin: 0 !important;
    line-height: 1.25 !important;
    text-align: center !important;
    white-space: nowrap !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-estd-bn {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    color: #dc2626 !important;
    margin: 0 !important;
    line-height: 1.25 !important;
    text-align: center !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-contact-email,
  .pad-contact-web {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif !important;
    font-size: 11.5px !important;
    font-weight: 600 !important;
    color: #0f2b5c !important;
    margin: 0 !important;
    line-height: 1.25 !important;
    text-align: center !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-codes-box {
    justify-self: end !important;
    margin-left: auto !important;
    background: #e2efda !important;
    border: 1px solid #c8e6c9 !important;
    border-radius: 4px !important;
    padding: 5px 9px !important;
    text-align: left !important;
    min-width: 165px !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1.5px !important;
    line-height: 1.3 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-eiin-title {
    font-family: 'Outfit', 'Segoe UI', Arial, sans-serif !important;
    font-size: 13.5px !important;
    font-weight: 900 !important;
    color: #002060 !important;
    margin-bottom: 2px !important;
    letter-spacing: 0.5px !important;
    padding-bottom: 1px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-code-item {
    font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #800000 !important;
    white-space: nowrap !important;
    line-height: 1.25 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-mpo-item {
    color: #002060 !important;
    font-weight: 800 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pad-bottom-double-line {
    width: 100% !important;
    height: 4px !important;
    border-top: 1px solid #111 !important;
    border-bottom: 2px solid #111 !important;
    margin-top: 6px !important;
    margin-bottom: 14px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;
