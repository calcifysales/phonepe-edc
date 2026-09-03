/**
 * Calcify - Financial Suite, LMS Generator & OVD Documents
 * Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initUPIQR();
  initMDR();
  initLMS();
  initColdLMS();
  initOvdGenerator();
  initAdSales();
  initCalcifyDocs();
});

// Toast notification helper
function showToast(message, type = 'success') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toast.className = `toast-msg show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// -------------------------------------------------------------
// 1. Navigation Handling (Main Tabs, Side Drawer & Financial Sub Tabs)
// -------------------------------------------------------------
function initNavigation() {
  const mainTabs = document.querySelectorAll('.main-tab-btn');
  const mainSections = document.querySelectorAll('.main-section');
  const drawer = document.getElementById('side-menu-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const btnHamburger = document.getElementById('btn-hamburger-menu');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerItems = document.querySelectorAll('.drawer-nav-item');

  function openDrawer() {
    drawer?.classList.add('active');
    backdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('active');
    backdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  btnHamburger?.addEventListener('click', openDrawer);
  btnCloseDrawer?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  function switchSection(targetId) {
    mainSections.forEach(s => s.classList.add('hidden'));
    mainTabs.forEach(t => t.classList.remove('active'));
    drawerItems.forEach(d => d.classList.remove('active'));

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    const matchingMainTab = document.querySelector(`.main-tab-btn[data-target="${targetId}"]`);
    if (matchingMainTab) {
      matchingMainTab.classList.add('active');
    }

    const matchingDrawerItem = document.querySelector(`.drawer-nav-item[data-target="${targetId}"]`);
    if (matchingDrawerItem) {
      matchingDrawerItem.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      switchSection(targetId);
    });
  });

  drawerItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      switchSection(targetId);
      closeDrawer();
    });
  });

  const subTabs = document.querySelectorAll('.sub-tab-btn');
  const subSections = document.querySelectorAll('.sub-section');

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subTabs.forEach(t => t.classList.remove('active'));
      subSections.forEach(s => s.classList.add('hidden'));

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }
    });
  });
}

// -------------------------------------------------------------
// 2. UPI QR Code Generator (Literal '@' without %40 encoding)
// -------------------------------------------------------------
function initUPIQR() {
  const upiIdInput = document.getElementById('upi-id');
  const upiHandleSelect = document.getElementById('upi-handle');
  
  const generateBtn = document.getElementById('btn-generate-qr');
  const resetBtn = document.getElementById('btn-reset-qr');
  const downloadQrBtn = document.getElementById('btn-download-qr');

  const qrContainer = document.getElementById('qr-canvas-container');
  const qrResultBox = document.getElementById('qr-result-box');
  const vpaText = document.getElementById('vpa-display-text');

  function getFullVPA() {
    let rawId = (upiIdInput.value || '').trim();
    let handle = upiHandleSelect.value;
    return rawId + handle;
  }

  function generateQR() {
    const rawId = (upiIdInput.value || '').trim();
    if (!rawId || rawId === 'Q') {
      alert('Please enter a valid UPI ID after Q (e.g. Q784287125)');
      upiIdInput.focus();
      return;
    }

    const vpa = getFullVPA();
    // Use literal @ without percent-encoding %40
    const upiUri = `upi://pay?pa=${vpa}&pn=Merchant&cu=INR`;

    qrContainer.innerHTML = '';
    if (typeof createQRCodeCanvas === 'function') {
      const canvas = createQRCodeCanvas(upiUri, 240);
      qrContainer.appendChild(canvas);
    }

    vpaText.textContent = vpa;
    qrResultBox.classList.remove('hidden');
    showToast('QR Code Generated!');
  }

  generateBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    generateQR();
  });

  resetBtn?.addEventListener('click', () => {
    upiIdInput.value = 'Q';
    upiHandleSelect.value = '@ybl';
    qrResultBox.classList.add('hidden');
    showToast('Reset to default');
  });

  downloadQrBtn?.addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `UPI_QR_${vpaText.textContent}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Downloading QR Image...');
  });
}

// -------------------------------------------------------------
// 3. MDR Calculator (Dual Mode)
// -------------------------------------------------------------
function initMDR() {
  // Mode 1: Find MDR %
  const mdrAmt1 = document.getElementById('mdr-calc1-amount');
  const mdrDed1 = document.getElementById('mdr-calc1-deductions');
  const mdrBtn1 = document.getElementById('btn-calc-mdr1');
  const mdrResCard1 = document.getElementById('mdr-res1-card');
  const mdrResVal1 = document.getElementById('mdr-res1-pct');
  const mdrNetVal1 = document.getElementById('mdr-res1-net');

  function calculateMDRPercent() {
    const amt = parseFloat(mdrAmt1.value);
    const ded = parseFloat(mdrDed1.value);

    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid transaction amount');
      mdrAmt1.focus();
      return;
    }
    if (isNaN(ded) || ded < 0) {
      alert('Please enter valid deduction amount');
      mdrDed1.focus();
      return;
    }

    const pct = (ded / amt) * 100;
    const net = amt - ded;

    mdrResVal1.textContent = `${pct.toFixed(2)}%`;
    mdrNetVal1.textContent = `₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    mdrResCard1.classList.remove('hidden');
    showToast('Calculated MDR %');
  }

  mdrBtn1.addEventListener('click', (e) => {
    e.preventDefault();
    calculateMDRPercent();
  });

  // Mode 2: Find Deductions
  const mdrAmt2 = document.getElementById('mdr-calc2-amount');
  const mdrPct2 = document.getElementById('mdr-calc2-pct');
  const mdrBtn2 = document.getElementById('btn-calc-mdr2');
  const mdrResCard2 = document.getElementById('mdr-res2-card');
  const mdrResVal2 = document.getElementById('mdr-res2-ded');
  const mdrNetVal2 = document.getElementById('mdr-res2-net');

  function calculateDeductions() {
    const amt = parseFloat(mdrAmt2.value);
    const pct = parseFloat(mdrPct2.value);

    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid transaction amount');
      mdrAmt2.focus();
      return;
    }
    if (isNaN(pct) || pct < 0) {
      alert('Please enter valid MDR percentage');
      mdrPct2.focus();
      return;
    }

    const ded = (amt * pct) / 100;
    const net = amt - ded;

    mdrResVal2.textContent = `₹${ded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    mdrNetVal2.textContent = `₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    mdrResCard2.classList.remove('hidden');
    showToast('Calculated Deductions');
  }

  mdrBtn2.addEventListener('click', (e) => {
    e.preventDefault();
    calculateDeductions();
  });
}

// -------------------------------------------------------------
// 4. LMS Comment Generator
// -------------------------------------------------------------
function initLMS() {
  const merchantNameInput = document.getElementById('lms-merchant-name');
  const avgBasketInput = document.getElementById('lms-avg-basket');
  const monthlyTpvInput = document.getElementById('lms-monthly-tpv');
  const premiumnessSelect = document.getElementById('lms-premiumness');
  
  const gstGroup = document.getElementById('group-gst');
  const currentAccGroup = document.getElementById('group-current-acc');
  const gstSelect = document.getElementById('lms-gst');
  const currentAccSelect = document.getElementById('lms-current-acc');

  const leadStatusSelect = document.getElementById('lms-lead-status');
  const renewedGroup = document.getElementById('group-renewed-details');
  const renewedValInput = document.getElementById('lms-renewed-val');

  const usingPosSelect = document.getElementById('lms-using-pos');
  const posDetailsGroup = document.getElementById('group-pos-details');
  const currentPosInput = document.getElementById('lms-current-pos');
  const currentMdrInput = document.getElementById('lms-current-mdr');
  const currentRentInput = document.getElementById('lms-current-rent');

  const followupDateInput = document.getElementById('lms-followup-date');

  const generateCommentBtn = document.getElementById('btn-generate-comment');
  const clearFormBtn = document.getElementById('btn-clear-lms');
  const copyCommentBtn = document.getElementById('btn-copy-comment');
  const clearCommentBtn = document.getElementById('btn-clear-comment');
  const outputSection = document.getElementById('lms-output-section');
  const outputTextarea = document.getElementById('lms-output-text');
  const charCountBadge = document.getElementById('lms-char-count');

  // Toggle GST & Current Account on Premiumness == No
  premiumnessSelect.addEventListener('change', () => {
    if (premiumnessSelect.value === 'No') {
      gstGroup.classList.remove('hidden');
      currentAccGroup.classList.remove('hidden');
    } else {
      gstGroup.classList.add('hidden');
      currentAccGroup.classList.add('hidden');
    }
  });

  // Toggle POS details
  usingPosSelect.addEventListener('change', () => {
    if (usingPosSelect.value === 'Yes') {
      posDetailsGroup.classList.remove('hidden');
    } else {
      posDetailsGroup.classList.add('hidden');
    }
  });

  // Toggle Renewed MDR/Rental
  leadStatusSelect.addEventListener('change', () => {
    const status = leadStatusSelect.value;
    if (status.includes('better MDR') || status.includes('better Rental') || status.includes('better Set up Fee')) {
      renewedGroup.classList.remove('hidden');
    } else {
      renewedGroup.classList.add('hidden');
    }
  });

  function formatDateDDMMYYYY(dateObj) {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
  }

  function generateComment() {
    const name = (merchantNameInput.value || '').trim();
    const basketVal = (avgBasketInput.value || '').trim();
    const tpvVal = (monthlyTpvInput.value || '').trim();
    const premiumness = premiumnessSelect.value;
    const leadStatus = leadStatusSelect.value;
    const usingPos = usingPosSelect.value;
    const fDateRaw = followupDateInput.value;

    if (!name) {
      alert('Please enter Merchant / Owner Name');
      merchantNameInput.focus();
      return;
    }
    if (!basketVal) {
      alert('Please enter Average Basket Value');
      avgBasketInput.focus();
      return;
    }
    if (!tpvVal) {
      alert('Please enter Monthly TPV');
      monthlyTpvInput.focus();
      return;
    }
    if (!premiumness) {
      alert('Please select Premiumness (Yes/No)');
      premiumnessSelect.focus();
      return;
    }
    if (!fDateRaw) {
      alert('Please select Followup Date');
      followupDateInput.focus();
      return;
    }

    const parts = fDateRaw.split('-');
    const fDateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const formattedFollowupDate = formatDateDDMMYYYY(fDateObj);
    
    // Automated Expected Order closure Date: +4 days
    const cDateObj = new Date(fDateObj);
    cDateObj.setDate(cDateObj.getDate() + 4);
    const formattedClosureDate = formatDateDDMMYYYY(cDateObj);

    // 1. Header Metadata Section
    let output = `Premiumness:- ${premiumness}\n`;
    if (premiumness === 'No') {
      output += `GST:- ${gstSelect.value}\n`;
      output += `Current Account:- ${currentAccSelect.value}\n`;
      output += `Expected Order closure Date: ${formattedClosureDate}\n`;
      output += `Followup date:- ${formattedFollowupDate}\n`;
    } else {
      output += `Followup date:- ${formattedFollowupDate}\n`;
      output += `Expected Order closure Date: ${formattedClosureDate}\n`;
    }

    // 2. Narrative Section
    const currentPos = (currentPosInput.value || '').trim() || 'HDFC';
    const currentMdr = (currentMdrInput.value || '').trim();
    const currentRent = (currentRentInput.value || '').trim();
    const renewedVal = (renewedValInput?.value || '').trim();

    if (usingPos === 'Yes') {
      let rentStr = 'no rental';
      if (currentRent && parseFloat(currentRent) > 0) {
        rentStr = `${currentRent} rental`;
      }
      const mdrStr = currentMdr ? `${currentMdr}` : '1.45';
      output += `Meeting done with owner ${name} at store, where Merchant has Avg. basket value of ₹${basketVal}, and generates around ${tpvVal} lakhs TPV per month through ${currentPos}.  Mx. Currently using ${currentPos} pos device with ${mdrStr} mdr on cc and ${rentStr} on pos device, I have explained our pos features and rentals of both ₹3499 and 499 (399/month) rental under tagged base with mdr of 1.54% on cc. `;
    } else {
      output += `Meeting done with owner ${name} at store, where Merchant has average basket value of ₹${basketVal}, and generates around ${tpvVal} lakhs TPV/ Month.\nMx. Currently not using any pos device, I have explained our pos features and rentals of both ₹3499 and 499 (399/month) rental under taggedbase with mdr of 1.54 on cc. \n`;
    }

    // 3. Lead status narrative
    if (leadStatus === 'Key Decision maker discussion pending') {
      output += `Merchant need to make decision and will compare with other competitors and let us know the final decision and revist scheduled on ${formattedFollowupDate}.`;
    } else if (leadStatus === 'Merchant interested-needs better MDR') {
      if (usingPos === 'Yes') {
        let rentNote = (currentRent === '0' || !currentRent) ? 'zero rental' : `${currentRent} rental`;
        output += `As merchant is currently using ${currentPos} pos device with ${rentNote} and lower MDR, He asked us to reduce the MDR Phonepe Pos${renewedVal ? ' to ' + renewedVal : ''} to make quick decision.  Mx. requested us to give some time to finalize the decision and I will mark the final status of lead in my next Visit on ${formattedFollowupDate}`;
      } else {
        output += `Merchant is interested in PhonePe POS but requested for a lower MDR${renewedVal ? ' (' + renewedVal + ')' : ''} to make quick decision. Mx. requested us to review the pricing and give some time, revist scheduled on ${formattedFollowupDate}.`;
      }
    } else if (leadStatus === 'Merchant interested-needs better Rental') {
      output += `Merchant is interested in PhonePe POS but requested for a better rental plan${renewedVal ? ' (' + renewedVal + ')' : ''}. Mx. requested us to review the rental pricing and give some time to finalize the decision, revist scheduled on ${formattedFollowupDate}.`;
    } else if (leadStatus === 'Merchant wants to RVP competition device first') {
      output += `Merchant wants to RVP / return ${usingPos === 'Yes' ? currentPos : 'existing'} competition device first before taking PhonePe POS. Followup and next visit scheduled on ${formattedFollowupDate}.`;
    } else if (leadStatus === 'Onboarding / OQC requirement not getting fulfilled-needs follow up') {
      output += `Onboarding / OQC documentation requirement is currently pending. Explained required documents to owner and followup visit scheduled on ${formattedFollowupDate}.`;
    } else {
      output += `Followup and revisit scheduled on ${formattedFollowupDate}.`;
    }

    outputTextarea.value = output;
    charCountBadge.textContent = `${output.length} characters`;
    outputSection.classList.remove('hidden');
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('LMS Comment Generated!');
  }

  generateCommentBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateComment();
  });

  clearFormBtn.addEventListener('click', () => {
    merchantNameInput.value = '';
    avgBasketInput.value = '';
    monthlyTpvInput.value = '';
    premiumnessSelect.value = '';
    gstGroup.classList.add('hidden');
    currentAccGroup.classList.add('hidden');
    gstSelect.value = 'Yes';
    currentAccSelect.value = 'No';
    
    leadStatusSelect.value = 'Key Decision maker discussion pending';
    renewedGroup.classList.add('hidden');
    if (renewedValInput) renewedValInput.value = '';

    usingPosSelect.value = 'No';
    posDetailsGroup.classList.add('hidden');
    currentPosInput.value = '';
    currentMdrInput.value = '';
    currentRentInput.value = '';

    followupDateInput.value = '';

    outputSection.classList.add('hidden');
    outputTextarea.value = '';
    charCountBadge.textContent = `0 characters`;
    showToast('Form cleared');
  });

  copyCommentBtn.addEventListener('click', () => {
    const text = outputTextarea.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Comment copied to clipboard!');
    });
  });

  if (clearCommentBtn) {
    clearCommentBtn.addEventListener('click', () => {
      outputTextarea.value = '';
      charCountBadge.textContent = `0 characters`;
      outputSection.classList.add('hidden');
      showToast('Comment cleared');
    });
  }

  outputTextarea.addEventListener('input', () => {
    charCountBadge.textContent = `${outputTextarea.value.length} characters`;
  });
}

// -------------------------------------------------------------
// 5. Cold LMS Comment Generator (No Followup Date)
// -------------------------------------------------------------
function initColdLMS() {
  const merchantNameInput = document.getElementById('cold-lms-merchant-name');
  const avgBasketInput = document.getElementById('cold-lms-avg-basket');
  const monthlyTpvInput = document.getElementById('cold-lms-monthly-tpv');
  const premiumnessSelect = document.getElementById('cold-lms-premiumness');
  
  const gstGroup = document.getElementById('cold-group-gst');
  const currentAccGroup = document.getElementById('cold-group-current-acc');
  const gstSelect = document.getElementById('cold-lms-gst');
  const currentAccSelect = document.getElementById('cold-lms-current-acc');

  const leadStatusSelect = document.getElementById('cold-lms-lead-status');
  const usingPosSelect = document.getElementById('cold-lms-using-pos');
  const posDetailsGroup = document.getElementById('cold-group-pos-details');
  const currentPosInput = document.getElementById('cold-lms-current-pos');
  const currentMdrInput = document.getElementById('cold-lms-current-mdr');
  const currentRentInput = document.getElementById('cold-lms-current-rent');

  const generateCommentBtn = document.getElementById('btn-generate-cold-comment');
  const clearFormBtn = document.getElementById('btn-clear-cold-lms');
  const copyCommentBtn = document.getElementById('btn-copy-cold-comment');
  const clearCommentBtn = document.getElementById('btn-clear-cold-comment');
  const outputSection = document.getElementById('cold-lms-output-section');
  const outputTextarea = document.getElementById('cold-lms-output-text');
  const charCountBadge = document.getElementById('cold-lms-char-count');

  // Toggle GST & Current Account on Premiumness == No
  premiumnessSelect?.addEventListener('change', () => {
    if (premiumnessSelect.value === 'No') {
      gstGroup?.classList.remove('hidden');
      currentAccGroup?.classList.remove('hidden');
    } else {
      gstGroup?.classList.add('hidden');
      currentAccGroup?.classList.add('hidden');
    }
  });

  // Toggle POS details
  usingPosSelect?.addEventListener('change', () => {
    if (usingPosSelect.value === 'Yes') {
      posDetailsGroup?.classList.remove('hidden');
    } else {
      posDetailsGroup?.classList.add('hidden');
    }
  });

  function generateColdComment() {
    const name = (merchantNameInput?.value || '').trim();
    const basketVal = (avgBasketInput?.value || '').trim();
    const tpvVal = (monthlyTpvInput?.value || '').trim();
    const premiumness = premiumnessSelect?.value;
    const leadStatus = leadStatusSelect?.value;
    const usingPos = usingPosSelect?.value;

    if (!name) {
      alert('Please enter Merchant / Owner Name');
      merchantNameInput?.focus();
      return;
    }
    if (!basketVal) {
      alert('Please enter Average Basket Value');
      avgBasketInput?.focus();
      return;
    }
    if (!tpvVal) {
      alert('Please enter Monthly TPV');
      monthlyTpvInput?.focus();
      return;
    }
    if (!premiumness) {
      alert('Please select Premiumness (Yes/No)');
      premiumnessSelect?.focus();
      return;
    }

    // 1. Header Metadata Section (No followup date and No lead status line)
    let output = `Premiumness:- ${premiumness}\n`;
    if (premiumness === 'No') {
      output += `GST:- ${gstSelect?.value || 'Yes'}\n`;
      output += `Current Account:- ${currentAccSelect?.value || 'No'}\n`;
    }

    // 2. Body narrative
    const currentPos = (currentPosInput?.value || '').trim() || 'HDFC';
    const currentMdr = (currentMdrInput?.value || '').trim();
    const currentRent = (currentRentInput?.value || '').trim();

    if (usingPos === 'Yes') {
      let rentStr = 'no rental';
      if (currentRent && parseFloat(currentRent) > 0) {
        rentStr = `₹${currentRent} rental`;
      }
      const mdrStr = currentMdr ? `${currentMdr}%` : '1.45%';
      output += `Meeting done with owner ${name} at store, where Merchant has Avg. basket value of ₹${basketVal}, and generates around ${tpvVal} lakhs TPV per month through ${currentPos}. Mx. currently using ${currentPos} pos device with ${mdrStr} mdr on cc and ${rentStr} on pos device. I have pitched and explained our PhonePe POS features and rental plans of both ₹3499 and ₹499 (₹399/month) with MDR of 1.54% on CC. `;
    } else {
      output += `Meeting done with owner ${name} at store, where Merchant has average basket value of ₹${basketVal}, and generates around ${tpvVal} lakhs TPV/Month. Mx. currently not using any pos device. I have pitched and explained our PhonePe POS features and rental plans of both ₹3499 and ₹499 (₹399/month) with MDR of 1.54% on CC. `;
    }

    // 3. Status-specific concluding reason
    if (leadStatus === 'Competition device available with better MDR') {
      output += `However, merchant did not show interest in PhonePe POS as competition device is already available with better MDR pricing.`;
    } else if (leadStatus === 'Competition device available with better rental') {
      output += `However, merchant did not show interest in PhonePe POS as competition device is already available with better/lower rental plan.`;
    } else if (leadStatus === 'Merchant needs better features available with competition') {
      output += `However, merchant did not show interest in PhonePe POS as merchant requires specific advanced features currently offered by competition.`;
    } else if (leadStatus === 'Merchant had bad experience previously') {
      output += `However, merchant refused PhonePe POS citing previous bad experience with services/device.`;
    } else if (leadStatus === 'Merchants needs integrated solution with specific software') {
      output += `However, merchant declined PhonePe POS as they require an integrated billing/POS solution with specific store software.`;
    } else if (leadStatus === 'Not interested - Merchant has no card customer footfall') {
      output += `Merchant is not interested in taking POS device as there is no card customer footfall at the store.`;
    } else if (leadStatus === 'Not interested - Non Premium store No EDC Potential') {
      output += `Merchant is not interested as the store is non-premium with no EDC potential.`;
    } else {
      output += `Merchant did not show interest in PhonePe POS due to ${leadStatus}.`;
    }

    if (outputTextarea) {
      outputTextarea.value = output;
    }
    if (charCountBadge) {
      charCountBadge.textContent = `${output.length} characters`;
    }
    outputSection?.classList.remove('hidden');
    outputSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('Cold LMS Comment Generated!');
  }

  generateCommentBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    generateColdComment();
  });

  clearFormBtn?.addEventListener('click', () => {
    if (merchantNameInput) merchantNameInput.value = '';
    if (avgBasketInput) avgBasketInput.value = '';
    if (monthlyTpvInput) monthlyTpvInput.value = '';
    if (premiumnessSelect) premiumnessSelect.value = '';
    gstGroup?.classList.add('hidden');
    currentAccGroup?.classList.add('hidden');
    if (gstSelect) gstSelect.value = 'Yes';
    if (currentAccSelect) currentAccSelect.value = 'No';
    if (leadStatusSelect) leadStatusSelect.value = 'Competition device available with better MDR';
    if (usingPosSelect) usingPosSelect.value = 'No';
    posDetailsGroup?.classList.add('hidden');
    if (currentPosInput) currentPosInput.value = '';
    if (currentMdrInput) currentMdrInput.value = '';
    if (currentRentInput) currentRentInput.value = '';
    outputSection?.classList.add('hidden');
  });

  copyCommentBtn?.addEventListener('click', () => {
    const text = outputTextarea?.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Cold LMS comment copied to clipboard!');
    });
  });

  clearCommentBtn?.addEventListener('click', () => {
    if (outputTextarea) outputTextarea.value = '';
    if (charCountBadge) charCountBadge.textContent = '0 characters';
    outputSection?.classList.add('hidden');
    showToast('Comment cleared');
  });

  outputTextarea?.addEventListener('input', () => {
    if (charCountBadge && outputTextarea) {
      charCountBadge.textContent = `${outputTextarea.value.length} characters`;
    }
  });
}

// -------------------------------------------------------------
// 6. OVD Generator: Partner KYC & Letterhead Document Generator
// -------------------------------------------------------------
function initOvdGenerator() {
  const storeNameInput = document.getElementById('ovd-store-name');
  const storeAddressInput = document.getElementById('ovd-store-address');
  const storePhoneInput = document.getElementById('ovd-store-phone');

  const previewModal = document.getElementById('ovd-preview-modal');
  const btnCloseModal = document.getElementById('btn-close-ovd-modal');
  const modalStoreTitle = document.getElementById('ovd-modal-store-title');
  const previewStoreName = document.getElementById('preview-store-name');
  const previewStoreAddress = document.getElementById('preview-store-address');
  const previewStorePhone = document.getElementById('preview-store-phone');
  const paperGrid = document.getElementById('ovd-paper-kyc-grid');

  const partnerCountSelect = document.getElementById('ovd-partners-count-select');
  const customCountWrapper = document.getElementById('ovd-custom-count-wrapper');
  const customCountInput = document.getElementById('ovd-custom-count');
  const partnerCountBadge = document.getElementById('ovd-partner-count-badge');
  const partnersAttachmentList = document.getElementById('ovd-partners-attachment-list');

  const btnPreview = document.getElementById('btn-ovd-preview');
  const btnPreviewTop = document.getElementById('btn-ovd-preview-top');
  const btnDownloadPdfDirect = document.getElementById('btn-ovd-download-pdf-direct');
  const btnDownloadDocDirect = document.getElementById('btn-ovd-download-doc-direct');
  const btnModalDownloadPdf = document.getElementById('btn-modal-download-pdf');
  const btnModalDownloadDoc = document.getElementById('btn-modal-download-doc');
  const btnReset = document.getElementById('btn-ovd-reset');

  let partnerCount = 2;
  // Partner data: array of objects { aadhaar: base64, pan: base64, aadhaarName: '', panName: '' }
  let partnerDocs = [];

  function syncPartnerDocsArray() {
    while (partnerDocs.length < partnerCount) {
      partnerDocs.push({ aadhaar: null, pan: null, aadhaarName: '', panName: '' });
    }
    if (partnerDocs.length > partnerCount) {
      partnerDocs = partnerDocs.slice(0, partnerCount);
    }
  }

  function renderPartnerAttachmentSlots() {
    syncPartnerDocsArray();
    if (partnerCountBadge) {
      partnerCountBadge.textContent = `${partnerCount} ${partnerCount === 1 ? 'Partner' : 'Partners'} Configured`;
    }

    if (!partnersAttachmentList) return;
    partnersAttachmentList.innerHTML = '';

    for (let i = 0; i < partnerCount; i++) {
      const idx = i;
      const partnerNum = i + 1;
      const p = partnerDocs[idx];

      const block = document.createElement('div');
      block.className = 'ovd-partner-block';
      block.innerHTML = `
        <div class="ovd-partner-block-title">
          <div class="ovd-partner-icon-tag">
            <div class="ovd-partner-mini-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span>Partner ${partnerNum}</span>
          </div>
          <svg class="ovd-partner-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
        </div>

        <div class="ovd-partner-slots-grid">
          <!-- Aadhaar Slot (Document Name Only - No Image Preview on Screen) -->
          <div class="ovd-file-slot">
            <span class="ovd-slot-label">Aadhaar Card <span class="req">*</span></span>
            <input type="file" accept="image/*" class="hidden" id="file-aadhaar-${idx}" style="display:none;">
            
            ${p.aadhaar ? `
              <div class="ovd-attached-card" id="slot-aadhaar-${idx}">
                <div class="ovd-attached-left">
                  <div class="ovd-attached-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="ovd-attached-name-col">
                    <span class="ovd-attached-name-text" title="${p.aadhaarName || 'Aadhaar Attached'}">${p.aadhaarName || `Partner_${partnerNum}_Aadhaar.jpg`}</span>
                    <span class="ovd-attached-status-tag">&#10003; Attached</span>
                  </div>
                </div>
                <div class="ovd-attached-actions">
                  <button type="button" class="ovd-btn-pill-change" data-type="aadhaar" data-index="${idx}">Change</button>
                  <button type="button" class="ovd-btn-pill-remove" data-type="aadhaar" data-index="${idx}">Remove</button>
                </div>
              </div>
            ` : `
              <div class="ovd-dropzone-modern" id="slot-aadhaar-${idx}">
                <div class="ovd-dropzone-cloud-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="12 13 12 9 10 11"/><polyline points="12 9 14 11"/></svg>
                </div>
                <div class="ovd-dropzone-primary-text">Click here to upload</div>
              </div>
            `}
          </div>

          <!-- PAN Slot (Document Name Only - No Image Preview on Screen) -->
          <div class="ovd-file-slot">
            <span class="ovd-slot-label">PAN Card <span class="req">*</span></span>
            <input type="file" accept="image/*" class="hidden" id="file-pan-${idx}" style="display:none;">
            
            ${p.pan ? `
              <div class="ovd-attached-card" id="slot-pan-${idx}">
                <div class="ovd-attached-left">
                  <div class="ovd-attached-icon-box" style="background: linear-gradient(135deg, #7c3aed, #6d28d9);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="ovd-attached-name-col">
                    <span class="ovd-attached-name-text" title="${p.panName || 'PAN Attached'}">${p.panName || `Partner_${partnerNum}_PAN.jpg`}</span>
                    <span class="ovd-attached-status-tag">&#10003; Attached</span>
                  </div>
                </div>
                <div class="ovd-attached-actions">
                  <button type="button" class="ovd-btn-pill-change" data-type="pan" data-index="${idx}">Change</button>
                  <button type="button" class="ovd-btn-pill-remove" data-type="pan" data-index="${idx}">Remove</button>
                </div>
              </div>
            ` : `
              <div class="ovd-dropzone-modern" id="slot-pan-${idx}">
                <div class="ovd-dropzone-cloud-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="12 13 12 9 10 11"/><polyline points="12 9 14 11"/></svg>
                </div>
                <div class="ovd-dropzone-primary-text">Click here to upload</div>
              </div>
            `}
          </div>
        </div>
      `;

      partnersAttachmentList.appendChild(block);

      const titleBar = block.querySelector('.ovd-partner-block-title');
      const grid = block.querySelector('.ovd-partner-slots-grid');
      const chevron = block.querySelector('.ovd-partner-chevron');
      if (titleBar && grid && chevron) {
        titleBar.style.cursor = 'pointer';
        chevron.style.transition = 'transform 0.2s ease';
        titleBar.addEventListener('click', () => {
          const isHidden = grid.style.display === 'none';
          grid.style.display = isHidden ? 'grid' : 'none';
          chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });
      }
    }

    attachFileListeners();
  }

  function attachFileListeners() {
    for (let i = 0; i < partnerCount; i++) {
      const idx = i;
      const fileAadhaar = document.getElementById(`file-aadhaar-${idx}`);
      const slotAadhaar = document.getElementById(`slot-aadhaar-${idx}`);
      const filePan = document.getElementById(`file-pan-${idx}`);
      const slotPan = document.getElementById(`slot-pan-${idx}`);

      // Aadhaar slot click (when unattached)
      if (slotAadhaar && slotAadhaar.classList.contains('ovd-dropzone-modern')) {
        slotAadhaar.addEventListener('click', () => fileAadhaar?.click());
      }

      // PAN slot click (when unattached)
      if (slotPan && slotPan.classList.contains('ovd-dropzone-modern')) {
        slotPan.addEventListener('click', () => filePan?.click());
      }

      // File input change
      fileAadhaar?.addEventListener('change', (e) => {
        if (e.target.files?.length) {
          processImageFile(e.target.files[0], idx, 'aadhaar');
        }
      });

      filePan?.addEventListener('change', (e) => {
        if (e.target.files?.length) {
          processImageFile(e.target.files[0], idx, 'pan');
        }
      });

      // Drag and drop handlers
      [
        { el: slotAadhaar, type: 'aadhaar' },
        { el: slotPan, type: 'pan' }
      ].forEach(({ el, type }) => {
        if (!el) return;
        el.addEventListener('dragover', (e) => {
          e.preventDefault();
          el.classList.add('dragover');
        });
        el.addEventListener('dragleave', () => {
          el.classList.remove('dragover');
        });
        el.addEventListener('drop', (e) => {
          e.preventDefault();
          el.classList.remove('dragover');
          if (e.dataTransfer.files?.length) {
            processImageFile(e.dataTransfer.files[0], idx, type);
          }
        });
      });
    }

    // Change buttons
    document.querySelectorAll('.ovd-btn-pill-change').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const idx = parseInt(btn.dataset.index);
        const fileInput = document.getElementById(`file-${type}-${idx}`);
        fileInput?.click();
      });
    });

    // Remove buttons
    document.querySelectorAll('.ovd-btn-pill-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const idx = parseInt(btn.dataset.index);
        if (partnerDocs[idx]) {
          partnerDocs[idx][type] = null;
          partnerDocs[idx][`${type}Name`] = '';
          renderPartnerAttachmentSlots();
          showToast(`Removed Partner ${idx + 1} ${type.toUpperCase()}`);
        }
      });
    });
  }

  function processImageFile(file, partnerIndex, type) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      if (partnerDocs[partnerIndex]) {
        partnerDocs[partnerIndex][type] = base64;
        partnerDocs[partnerIndex][`${type}Name`] = file.name;
        renderPartnerAttachmentSlots();
        showToast(`Partner ${partnerIndex + 1} ${type === 'aadhaar' ? 'Aadhaar' : 'PAN'} attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  }

  function renderModalPreviewDocument() {
    const name = (storeNameInput?.value || '').trim() || 'STORE / COMPANY NAME';
    const addr = (storeAddressInput?.value || '').trim();
    const phone = (storePhoneInput?.value || '').trim();

    if (modalStoreTitle) modalStoreTitle.textContent = `OVD Document Preview — ${name.toUpperCase()}`;
    if (previewStoreName) previewStoreName.textContent = name.toUpperCase();
    if (previewStoreAddress) previewStoreAddress.innerHTML = addr ? `Regd Office: ${addr.replace(/\n/g, '<br>')}` : '';
    if (previewStorePhone) previewStorePhone.textContent = phone ? `Phone: ${phone}` : '';

    if (!paperGrid) return;
    paperGrid.innerHTML = '';

    for (let i = 0; i < partnerCount; i++) {
      const p = partnerDocs[i] || { aadhaar: null, pan: null };
      const partnerNum = i + 1;

      const row = document.createElement('div');
      row.className = 'ovd-paper-row';
      row.innerHTML = `
        <div class="ovd-paper-img-cell ${p.aadhaar ? '' : 'empty'}">
          ${p.aadhaar ? `<img src="${p.aadhaar}" alt="Partner ${partnerNum} Masked Aadhaar">` : `
            <div class="ovd-paper-placeholder-text">
              Partner ${partnerNum}: Masked Aadhaar<br>
              <span style="font-size:0.65rem; font-weight:400; color:#94a3b8;">(Image unattached)</span>
            </div>
          `}
        </div>
        <div class="ovd-paper-img-cell ${p.pan ? '' : 'empty'}">
          ${p.pan ? `<img src="${p.pan}" alt="Partner ${partnerNum} PAN Card">` : `
            <div class="ovd-paper-placeholder-text">
              Partner ${partnerNum}: PAN Card<br>
              <span style="font-size:0.65rem; font-weight:400; color:#94a3b8;">(Image unattached)</span>
            </div>
          `}
        </div>
      `;
      paperGrid.appendChild(row);
    }
  }

  function openPreviewModal() {
    renderModalPreviewDocument();
    previewModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closePreviewModal() {
    previewModal?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Preview Button Triggers
  btnPreview?.addEventListener('click', openPreviewModal);
  btnPreviewTop?.addEventListener('click', openPreviewModal);
  btnCloseModal?.addEventListener('click', closePreviewModal);

  // Close modal on backdrop click
  previewModal?.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      closePreviewModal();
    }
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal && !previewModal.classList.contains('hidden')) {
      closePreviewModal();
    }
  });

  // Partner Count Dropdown Change
  partnerCountSelect?.addEventListener('change', () => {
    const val = partnerCountSelect.value;
    if (val === 'other') {
      customCountWrapper?.classList.remove('hidden');
      if (customCountInput) {
        customCountInput.focus();
        const customVal = parseInt(customCountInput.value);
        if (!isNaN(customVal) && customVal >= 1 && customVal <= 99) {
          partnerCount = customVal;
        } else {
          partnerCount = 2;
        }
      }
    } else {
      customCountWrapper?.classList.add('hidden');
      partnerCount = parseInt(val) || 2;
    }
    renderPartnerAttachmentSlots();
  });

  customCountInput?.addEventListener('input', () => {
    let val = parseInt(customCountInput.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 99) val = 99;
    partnerCount = val;
    renderPartnerAttachmentSlots();
  });

  // Generate & Download PDF with Normal 2.5cm Margins
  async function downloadPdfDocument() {
    renderModalPreviewDocument();
    const paper = document.getElementById('ovd-live-paper');
    if (!paper) return;

    try {
      showToast('Generating high-resolution OVD PDF...');

      const clone = paper.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-99999px';
      clone.style.top = '0';
      clone.style.width = '794px';
      clone.style.minWidth = '794px';
      clone.style.maxWidth = '794px';
      clone.style.background = '#ffffff';
      clone.style.boxShadow = 'none';
      // 2.54cm normal margins (94.5px left and right at 96 DPI, 38px top and bottom)
      clone.style.padding = '38px 94px';
      clone.style.boxSizing = 'border-box';

      // Ensure explicit inline styles so media queries cannot alter the document
      const header = clone.querySelector('.ovd-paper-header');
      if (header) {
        header.style.display = 'flex';
        header.style.flexDirection = 'row';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'flex-start';
        header.style.width = '100%';
        header.style.marginBottom = '8px';
      }

      const storeNameEl = clone.querySelector('.ovd-paper-store-name');
      if (storeNameEl) {
        storeNameEl.style.width = '58%';
        storeNameEl.style.maxWidth = '58%';
        storeNameEl.style.fontSize = '22px';
        storeNameEl.style.fontWeight = '800';
        storeNameEl.style.color = '#5f259f';
        storeNameEl.style.lineHeight = '1.2';
      }

      const contactEl = clone.querySelector('.ovd-paper-contact-box');
      if (contactEl) {
        contactEl.style.width = '42%';
        contactEl.style.maxWidth = '42%';
        contactEl.style.textAlign = 'right';
        contactEl.style.fontSize = '11.5px';
        contactEl.style.color = '#1e293b';
        contactEl.style.lineHeight = '1.45';
      }

      const divider = clone.querySelector('.ovd-paper-divider');
      if (divider) {
        divider.style.height = '4px';
        divider.style.backgroundColor = '#5f259f';
        divider.style.width = '100%';
        divider.style.margin = '10px 0 20px 0';
      }

      clone.querySelectorAll('.ovd-paper-row').forEach(row => {
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr';
        row.style.gap = '16px';
        row.style.width = '100%';
        row.style.marginBottom = '16px';
      });

      clone.querySelectorAll('.ovd-paper-img-cell').forEach(cell => {
        cell.style.height = '195px';
        cell.style.border = '1px solid #cbd5e1';
        cell.style.borderRadius = '6px';
        cell.style.padding = '6px';
        cell.style.background = '#ffffff';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.overflow = 'hidden';
      });

      clone.querySelectorAll('.ovd-paper-img-cell img').forEach(img => {
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.maxHeight = '185px';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
      });

      document.body.appendChild(clone);
      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(clone, {
        scale: 2.5,
        width: 794,
        windowWidth: 1200,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      document.body.removeChild(clone);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      const scaledHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(scaledHeight, pageHeight));

      const rawStoreName = (storeNameInput?.value || 'OVD').trim();
      const safeStoreName = rawStoreName ? rawStoreName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'OVD';
      pdf.save(`${safeStoreName}_OVD_Document.pdf`);
      showToast('Downloaded OVD PDF successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF');
    }
  }

  // Generate & Download Word Document (.doc) with Normal 2.5cm Margins
  function downloadWordDocument() {
    try {
      showToast('Generating Word Document (.doc)...');
      const rawStore = (storeNameInput?.value || '').trim();
      const storeName = rawStore ? rawStore.toUpperCase() : 'STORE / COMPANY NAME';
      const storeAddress = (storeAddressInput?.value || '').trim();
      const storePhone = (storePhoneInput?.value || '').trim();

      let rowsHtml = '';
      for (let i = 0; i < partnerCount; i++) {
        const p = partnerDocs[i] || {};
        const partnerNum = i + 1;
        const aadhaarImg = p.aadhaar ? `<img src="${p.aadhaar}" style="width:100%; max-width:300px; max-height:185px; object-fit:contain; display:block; margin:auto;" />` : `<div style="padding:40px 10px; border:1px dashed #cbd5e1; text-align:center; color:#94a3b8; font-size:11pt;">Partner ${partnerNum}: Masked Aadhaar</div>`;
        const panImg = p.pan ? `<img src="${p.pan}" style="width:100%; max-width:300px; max-height:185px; object-fit:contain; display:block; margin:auto;" />` : `<div style="padding:40px 10px; border:1px dashed #cbd5e1; text-align:center; color:#94a3b8; font-size:11pt;">Partner ${partnerNum}: PAN Card</div>`;

        rowsHtml += `
          <tr>
            <td style="width:50%; padding:8px; vertical-align:middle; text-align:center; border:1px solid #cbd5e1;">
              ${aadhaarImg}
            </td>
            <td style="width:50%; padding:8px; vertical-align:middle; text-align:center; border:1px solid #cbd5e1;">
              ${panImg}
            </td>
          </tr>
        `;
      }

      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${storeName} - OVD Document</title>
          <style>
            @page { size: A4 portrait; margin-left: 2.5cm; margin-right: 2.5cm; margin-top: 2.0cm; margin-bottom: 2.0cm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; }
            .header-table { width: 100%; margin-bottom: 8px; border: none; }
            .store-name { font-size: 18pt; font-weight: bold; color: #5f259f; line-height: 1.2; text-transform: uppercase; }
            .contact-info { text-align: right; font-size: 9.5pt; color: #1e293b; line-height: 1.4; }
            .divider-bar { height: 4px; background-color: #5f259f; margin: 10px 0 20px 0; }
            .kyc-table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="vertical-align:top; width:58%;" class="store-name">${storeName}</td>
              <td style="vertical-align:top; width:42%;" class="contact-info">
                ${storeAddress ? `Regd Office: ${storeAddress.replace(/\n/g, '<br>')}<br>` : ''}
                ${storePhone ? `Phone: ${storePhone}` : ''}
              </td>
            </tr>
          </table>
          <div class="divider-bar"></div>
          <table class="kyc-table">
            ${rowsHtml}
          </table>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
      const link = document.createElement('a');
      const safeFileName = storeName.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.href = URL.createObjectURL(blob);
      link.download = `${safeFileName}_OVD_Document.doc`;
      link.click();
      showToast('Downloaded Word document successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate Word document');
    }
  }

  btnDownloadPdfDirect?.addEventListener('click', downloadPdfDocument);
  btnModalDownloadPdf?.addEventListener('click', downloadPdfDocument);
  btnDownloadDocDirect?.addEventListener('click', downloadWordDocument);
  btnModalDownloadDoc?.addEventListener('click', downloadWordDocument);

  // Reset Form
  btnReset?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all letterhead questions and partner attachments?')) {
      if (storeNameInput) storeNameInput.value = '';
      if (storeAddressInput) storeAddressInput.value = '';
      if (storePhoneInput) storePhoneInput.value = '';
      if (partnerCountSelect) partnerCountSelect.value = '2';
      partnerCount = 2;
      partnerDocs = [];
      customCountWrapper?.classList.add('hidden');
      renderPartnerAttachmentSlots();
      showToast('Form reset to default.');
    }
  });

  // Initial render of attachment list
  renderPartnerAttachmentSlots();
}

// -------------------------------------------------------------
// 7. Ad Sales Native Accordion & Individual Link Sharing
// -------------------------------------------------------------
function initAdSales() {
  const adCard = document.getElementById('ad-sales-card');
  const toggleText = document.getElementById('ad-sales-toggle-text');

  if (adCard && toggleText) {
    adCard.addEventListener('toggle', () => {
      toggleText.textContent = adCard.open ? 'Hide Links' : 'View Links';
    });
  }

  const pgCard = document.getElementById('pg-leads-card');
  const pgToggleText = document.getElementById('pg-leads-toggle-text');

  if (pgCard && pgToggleText) {
    pgCard.addEventListener('toggle', () => {
      pgToggleText.textContent = pgCard.open ? 'Hide Links' : 'View Links';
    });
  }

  // Handle Share buttons
  const shareButtons = document.querySelectorAll('.btn-share-link');
  shareButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url;
      const title = btn.dataset.title || 'Ad Sales Link';

      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            url: url
          });
          showToast('Shared successfully!');
          return;
        } catch (err) {
          // If user cancels or dismisses native share dialog, fallback to copy
        }
      }

      if (navigator.clipboard && url) {
        navigator.clipboard.writeText(url).then(() => {
          showToast('Link copied to clipboard!');
        }).catch(() => {
          prompt('Copy link:', url);
        });
      } else if (url) {
        prompt('Copy link:', url);
      }
    });
  });
}


// -------------------------------------------------------------
// 6. Calcify_docs: Dynamic Data Filter, Sorter & Exporter
// -------------------------------------------------------------
function initCalcifyDocs() {
  const docsState = {
    rawData: [],
    headers: [],
    fileName: '',
    filterColumn: '',
    filterValue: 'ALL',
    searchTerm: '',
    sortColumn: '',
    sortOrder: 'asc',
    visibleColumns: [],
    filteredData: []
  };

  const fileInput = document.getElementById('docs-file-input');
  const uploadBtn = document.getElementById('btn-docs-upload');
  const chooseBtn = document.getElementById('btn-docs-choose-file');
  const emptyState = document.getElementById('docs-empty-state');
  const dataWorkspace = document.getElementById('docs-data-workspace');
  const fileBadge = document.getElementById('docs-file-badge');
  const fileNameSpan = document.getElementById('docs-file-name');

  const filterColSelect = document.getElementById('docs-filter-col');
  const filterValSelect = document.getElementById('docs-filter-val');
  const sortColSelect = document.getElementById('docs-sort-col');
  const sortOrderBtn = document.getElementById('btn-docs-sort-order');
  const searchInput = document.getElementById('docs-search-input');
  const colTogglesContainer = document.getElementById('docs-col-toggles');
  const btnHideIds = document.getElementById('btn-docs-hide-ids');
  const btnShowAllCols = document.getElementById('btn-docs-show-all-cols');

  const btnPng = document.getElementById('btn-docs-download-png');
  const btnPdf = document.getElementById('btn-docs-download-pdf');
  const btnExcel = document.getElementById('btn-docs-download-excel');
  const btnCopy = document.getElementById('btn-docs-copy-clipboard');

  // Trigger file dialog
  uploadBtn?.addEventListener('click', () => fileInput?.click());
  chooseBtn?.addEventListener('click', () => fileInput?.click());
  
  emptyState?.addEventListener('click', (e) => {
    if (e.target !== chooseBtn && !chooseBtn?.contains(e.target)) {
      fileInput?.click();
    }
  });

  // Drag & drop handling
  emptyState?.addEventListener('dragover', (e) => {
    e.preventDefault();
    emptyState.style.borderColor = 'var(--primary-color)';
    emptyState.style.background = '#f5f3ff';
  });
  emptyState?.addEventListener('dragleave', () => {
    emptyState.style.borderColor = '#cbd5e1';
    emptyState.style.background = '#f8fafc';
  });
  emptyState?.addEventListener('drop', (e) => {
    e.preventDefault();
    emptyState.style.borderColor = '#cbd5e1';
    emptyState.style.background = '#f8fafc';
    if (e.dataTransfer.files.length) handleDocsFile(e.dataTransfer.files[0]);
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length) handleDocsFile(e.target.files[0]);
  });

  function handleDocsFile(file) {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    showToast(`Reading ${file.name}...`);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          if (!jsonData || jsonData.length === 0) {
            showToast('The uploaded sheet is empty.');
            return;
          }
          processUploadedData(jsonData, file.name);
        } catch (err) {
          console.error(err);
          showToast('Failed to parse Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          Papa.parse(e.target.result, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(res) {
              if (res.data && res.data.length > 0) {
                processUploadedData(res.data, file.name);
              } else {
                showToast('No data found in CSV file.');
              }
            }
          });
        } catch (err) {
          console.error(err);
          showToast('Failed to parse CSV file.');
        }
      };
      reader.readAsText(file);
    }
  }

  function processUploadedData(data, fileName) {
    docsState.rawData = data;
    docsState.fileName = fileName;
    docsState.headers = Object.keys(data[0]);
    docsState.visibleColumns = [...docsState.headers];

    // Find default column
    const candidates = ['agent name', 'sold agent name', 'name', 'employee', 'sector', 'cm name', 'category'];
    let defaultCol = docsState.headers[0];
    for (const c of candidates) {
      const match = docsState.headers.find(h => h.toLowerCase() === c.toLowerCase() || h.toLowerCase().includes(c.toLowerCase()));
      if (match) { defaultCol = match; break; }
    }

    docsState.filterColumn = defaultCol;
    docsState.filterValue = 'ALL';
    docsState.sortColumn = docsState.headers[0];
    docsState.sortOrder = 'asc';

    // Update UI Elements
    emptyState?.classList.add('hidden');
    dataWorkspace?.classList.remove('hidden');
    if (fileBadge && fileNameSpan) {
      fileBadge.classList.remove('hidden');
      fileNameSpan.textContent = `${fileName} (${data.length.toLocaleString()} rows)`;
    }

    renderColumnDropdown();
    renderValueDropdown();
    renderSortDropdown();
    renderColumnChips();
    applyFilterAndSort();
    showToast(`Loaded ${data.length.toLocaleString()} records from ${fileName}`);
  }

  function renderColumnDropdown() {
    if (!filterColSelect) return;
    filterColSelect.innerHTML = '';
    docsState.headers.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      if (h === docsState.filterColumn) opt.selected = true;
      filterColSelect.appendChild(opt);
    });
  }

  function renderValueDropdown() {
    if (!filterValSelect) return;
    filterValSelect.innerHTML = '';

    if (!docsState.filterColumn) {
      filterValSelect.innerHTML = '<option value="ALL">All (Show All)</option>';
      return;
    }

    const uniqueValues = Array.from(new Set(docsState.rawData.map(r => r[docsState.filterColumn]))).filter(v => v !== undefined && v !== null && v !== '');
    uniqueValues.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });

    const allOpt = document.createElement('option');
    allOpt.value = 'ALL';
    allOpt.textContent = `All (Show All - ${uniqueValues.length} Unique)`;
    filterValSelect.appendChild(allOpt);

    uniqueValues.forEach(val => {
      const opt = document.createElement('option');
      opt.value = String(val);
      opt.textContent = String(val);
      if (String(val) === docsState.filterValue) opt.selected = true;
      filterValSelect.appendChild(opt);
    });
  }

  function renderSortDropdown() {
    if (!sortColSelect) return;
    sortColSelect.innerHTML = '';
    docsState.headers.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = `Sort by ${h}`;
      if (h === docsState.sortColumn) opt.selected = true;
      sortColSelect.appendChild(opt);
    });
  }

  function renderColumnChips() {
    if (!colTogglesContainer) return;
    colTogglesContainer.innerHTML = '';

    docsState.headers.forEach(header => {
      const isChecked = docsState.visibleColumns.includes(header);
      const label = document.createElement('label');
      label.className = `docs-col-chip ${isChecked ? 'active' : ''}`;

      label.innerHTML = `
        <input type="checkbox" value="${header}" ${isChecked ? 'checked' : ''}>
        <span>${header}</span>
      `;

      const checkbox = label.querySelector('input');
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!docsState.visibleColumns.includes(header)) {
            docsState.visibleColumns = docsState.headers.filter(h => docsState.visibleColumns.includes(h) || h === header);
          }
        } else {
          docsState.visibleColumns = docsState.visibleColumns.filter(h => h !== header);
        }
        renderColumnChips();
        renderTable();
      });

      colTogglesContainer.appendChild(label);
    });
  }

  function applyFilterAndSort() {
    if (!docsState.rawData || docsState.rawData.length === 0) return;
    let result = [...docsState.rawData];

    // 1. Filter
    if (docsState.filterColumn && docsState.filterValue && docsState.filterValue !== 'ALL') {
      result = result.filter(row => {
        const rowVal = row[docsState.filterColumn];
        return rowVal !== undefined && rowVal !== null && String(rowVal) === docsState.filterValue;
      });
    }

    // 2. Search
    if (docsState.searchTerm) {
      const term = docsState.searchTerm.toLowerCase().trim();
      result = result.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(term)));
    }

    // 3. Sort Rows Only (never reorders columns)
    if (docsState.sortColumn) {
      result.sort((a, b) => {
        let valA = a[docsState.sortColumn];
        let valB = b[docsState.sortColumn];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        const numA = typeof valA === 'number' ? valA : parseFloat(String(valA).replace(/[^0-9.-]+/g, ''));
        const numB = typeof valB === 'number' ? valB : parseFloat(String(valB).replace(/[^0-9.-]+/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return docsState.sortOrder === 'asc' ? numA - numB : numB - numA;
        }

        return docsState.sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    docsState.filteredData = result;
    renderTable();
  }

  function renderTable() {
    const thead = document.getElementById('docs-table-head');
    const tbody = document.getElementById('docs-table-body');
    const tfoot = document.getElementById('docs-table-foot');
    if (!thead || !tbody || !tfoot) return;

    const displayColumns = docsState.headers.filter(h => docsState.visibleColumns.includes(h));

    // Render Headers
    thead.innerHTML = '';
    const trHead = document.createElement('tr');
    displayColumns.forEach(col => {
      const th = document.createElement('th');
      const isCurrentSort = docsState.sortColumn === col;
      const sortIcon = isCurrentSort ? (docsState.sortOrder === 'asc' ? ' [ASC]' : ' [DESC]') : '';
      th.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <span>${col}</span>
          <span style="color:var(--primary-color); font-size:0.70rem; font-weight:800;">${sortIcon}</span>
        </div>
      `;
      th.addEventListener('click', () => {
        if (docsState.sortColumn === col) {
          docsState.sortOrder = docsState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          docsState.sortColumn = col;
          docsState.sortOrder = 'asc';
        }
        if (sortColSelect) sortColSelect.value = docsState.sortColumn;
        if (sortOrderBtn) sortOrderBtn.textContent = docsState.sortOrder === 'asc' ? 'Asc' : 'Desc';
        applyFilterAndSort();
      });
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Render Rows
    tbody.innerHTML = '';
    if (docsState.filteredData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${displayColumns.length || 1}" style="text-align:center; padding:36px; color:var(--text-muted);">
            No records found matching the selected filter.
          </td>
        </tr>
      `;
    } else {
      docsState.filteredData.forEach(row => {
        const tr = document.createElement('tr');
        displayColumns.forEach(col => {
          const td = document.createElement('td');
          const val = row[col];
          td.textContent = (val !== undefined && val !== null && val !== '')
            ? (typeof val === 'number' ? val.toLocaleString() : String(val))
            : '-';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    // Render Foot Totals
    tfoot.innerHTML = '';
    if (docsState.filteredData.length > 0) {
      const trFoot = document.createElement('tr');
      displayColumns.forEach((col, idx) => {
        const td = document.createElement('td');
        if (idx === 0) {
          td.textContent = `Total (${docsState.filteredData.length} rows)`;
        } else {
          let sum = 0;
          let isNum = false;
          docsState.filteredData.forEach(r => {
            const v = r[col];
            if (v !== undefined && v !== null && v !== '') {
              const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]+/g, ''));
              if (!isNaN(num)) { sum += num; isNum = true; }
            }
          });

          const lower = col.toLowerCase();
          if (isNum && !lower.includes('id') && !lower.includes('date') && !lower.includes('phone') && !lower.includes('mid') && !lower.includes('sid')) {
            td.textContent = typeof sum === 'number' ? sum.toLocaleString(undefined, { maximumFractionDigits: 2 }) : sum;
          } else {
            td.textContent = '';
          }
        }
        trFoot.appendChild(td);
      });
      tfoot.appendChild(trFoot);
    }
  }

  // Filter Listeners
  filterColSelect?.addEventListener('change', (e) => {
    docsState.filterColumn = e.target.value;
    docsState.filterValue = 'ALL';
    renderValueDropdown();
    applyFilterAndSort();
  });

  filterValSelect?.addEventListener('change', (e) => {
    docsState.filterValue = e.target.value;
    applyFilterAndSort();
  });

  sortColSelect?.addEventListener('change', (e) => {
    docsState.sortColumn = e.target.value;
    applyFilterAndSort();
  });

  sortOrderBtn?.addEventListener('click', () => {
    docsState.sortOrder = docsState.sortOrder === 'asc' ? 'desc' : 'asc';
    sortOrderBtn.textContent = docsState.sortOrder === 'asc' ? 'Asc' : 'Desc';
    applyFilterAndSort();
  });

  searchInput?.addEventListener('input', (e) => {
    docsState.searchTerm = e.target.value;
    applyFilterAndSort();
  });

  btnHideIds?.addEventListener('click', () => {
    docsState.visibleColumns = docsState.headers.filter(h => {
      const l = h.toLowerCase();
      return !l.includes('id') && l !== 'mid' && l !== 'sid';
    });
    renderColumnChips();
    renderTable();
    showToast('Hidden ID columns.');
  });

  btnShowAllCols?.addEventListener('click', () => {
    docsState.visibleColumns = [...docsState.headers];
    renderColumnChips();
    renderTable();
    showToast('All columns visible.');
  });

  // Export 1: Image (.png) Full Table
  btnPng?.addEventListener('click', async () => {
    const table = document.getElementById('docs-report-table');
    if (!table || docsState.filteredData.length === 0) {
      showToast('No data available to export.');
      return;
    }

    try {
      showToast('Generating full table image...');

      const exportWrapper = document.createElement('div');
      exportWrapper.style.position = 'fixed';
      exportWrapper.style.left = '-99999px';
      exportWrapper.style.top = '0';
      exportWrapper.style.width = 'max-content';
      exportWrapper.style.minWidth = '100%';
      exportWrapper.style.backgroundColor = '#ffffff';
      exportWrapper.style.padding = '24px';
      exportWrapper.style.borderRadius = '12px';
      exportWrapper.style.fontFamily = 'Inter, sans-serif';

      const titleDiv = document.createElement('div');
      titleDiv.style.marginBottom = '16px';
      titleDiv.style.paddingBottom = '12px';
      titleDiv.style.borderBottom = '2px solid #e2e8f0';

      const filterDesc = (docsState.filterValue && docsState.filterValue !== 'ALL')
        ? `Filter: [ ${docsState.filterColumn} = "${docsState.filterValue}" ]`
        : 'All Records';

      titleDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:20px;">
          <div>
            <h2 style="font-size:18px; font-weight:800; color:#1e293b; margin:0 0 4px 0;">Calcify_docs ? ${docsState.fileName.replace(/\.[^/.]+$/, "")}</h2>
            <p style="font-size:12px; font-weight:600; color:#4f46e5; margin:0;">${filterDesc} | Total: ${docsState.filteredData.length} Records</p>
          </div>
          <div style="font-size:11px; color:#94a3b8;">Date: ${new Date().toLocaleDateString()}</div>
        </div>
      `;
      exportWrapper.appendChild(titleDiv);

      const tableClone = table.cloneNode(true);
      tableClone.style.width = '100%';
      tableClone.style.borderCollapse = 'collapse';
      tableClone.style.fontSize = '12px';

      exportWrapper.appendChild(tableClone);
      document.body.appendChild(exportWrapper);

      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(exportWrapper, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: exportWrapper.scrollWidth,
        height: exportWrapper.scrollHeight,
        windowWidth: exportWrapper.scrollWidth + 100,
        windowHeight: exportWrapper.scrollHeight + 100
      });

      document.body.removeChild(exportWrapper);

      const link = document.createElement('a');
      const filterLabel = (docsState.filterValue && docsState.filterValue !== 'ALL')
        ? docsState.filterValue.replace(/[^a-zA-Z0-9_-]/g, '_')
        : 'Filtered_Data';
      link.download = `${filterLabel}_Report.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Downloaded Full Table Image (.png)!');
    } catch (e) {
      console.error(e);
      showToast('Failed to export image.');
    }
  });

  // Export 2: PDF (.pdf)
  btnPdf?.addEventListener('click', () => {
    if (docsState.filteredData.length === 0) return;

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const displayColumns = docsState.headers.filter(h => docsState.visibleColumns.includes(h));

      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 297, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CALCIFY_DOCS - FILTERED REPORT', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const filterDesc = (docsState.filterValue && docsState.filterValue !== 'ALL') ? `Filter: ${docsState.filterColumn} = ${docsState.filterValue}` : 'All Records';
      doc.text(`File: ${docsState.fileName} | ${filterDesc} | Date: ${new Date().toLocaleDateString()}`, 150, 12);

      const tableBody = docsState.filteredData.map(r => {
        return displayColumns.map(col => {
          const v = r[col];
          return (v !== undefined && v !== null && v !== '') ? (typeof v === 'number' ? v.toLocaleString() : String(v)) : '-';
        });
      });

      doc.autoTable({
        head: [displayColumns],
        body: tableBody,
        startY: 24,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      const filterLabel = (docsState.filterValue && docsState.filterValue !== 'ALL') ? docsState.filterValue.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Filtered_Data';
      doc.save(`${filterLabel}_Report.pdf`);
      showToast(`Downloaded PDF Report: ${filterLabel}_Report.pdf`);
    } catch (e) {
      console.error(e);
      showToast('Failed to export PDF.');
    }
  });

  // Export 3: Excel (.xlsx)
  btnExcel?.addEventListener('click', () => {
    if (docsState.filteredData.length === 0) return;

    try {
      const wb = XLSX.utils.book_new();
      const displayColumns = docsState.headers.filter(h => docsState.visibleColumns.includes(h));

      const exportRows = docsState.filteredData.map(r => {
        const item = {};
        displayColumns.forEach(c => item[c] = r[c]);
        return item;
      });

      const ws = XLSX.utils.json_to_sheet(exportRows, { header: displayColumns });
      ws['!cols'] = displayColumns.map(c => ({ wch: Math.max(c.length + 4, 15) }));

      const sheetTitle = (docsState.filterValue && docsState.filterValue !== 'ALL') ? docsState.filterValue.slice(0, 30) : 'Filtered_Data';
      XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

      const filterLabel = (docsState.filterValue && docsState.filterValue !== 'ALL') ? docsState.filterValue.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Filtered_Data';
      XLSX.writeFile(wb, `${filterLabel}.xlsx`);
      showToast(`Downloaded Excel: ${filterLabel}.xlsx`);
    } catch (e) {
      console.error(e);
      showToast('Failed to export Excel.');
    }
  });

  // Export 4: Copy TSV
  btnCopy?.addEventListener('click', () => {
    if (docsState.filteredData.length === 0) return;
    const displayColumns = docsState.headers.filter(h => docsState.visibleColumns.includes(h));
    const exportRows = docsState.filteredData.map(r => {
      const item = {};
      displayColumns.forEach(c => item[c] = r[c]);
      return item;
    });

    const tsv = Papa.unparse(exportRows, { delimiter: '\t' });
    navigator.clipboard.writeText(tsv).then(() => {
      showToast('Copied filtered table to clipboard!');
    });
  });
}
