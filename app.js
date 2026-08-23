/**
 * Calcify - Financial Calculator & LMS Comment Generator
 * Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initUPIQR();
  initMDR();
  initLMS();
  initAdSales();
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
// 1. Navigation Handling (Main Tabs & Financial Sub Tabs)
// -------------------------------------------------------------
function initNavigation() {
  const mainTabs = document.querySelectorAll('.main-tab-btn');
  const mainSections = document.querySelectorAll('.main-section');

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainTabs.forEach(t => t.classList.remove('active'));
      mainSections.forEach(s => s.classList.add('hidden'));

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }
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

  generateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateQR();
  });

  resetBtn.addEventListener('click', () => {
    upiIdInput.value = 'Q';
    upiHandleSelect.value = '@ybl';
    qrResultBox.classList.add('hidden');
    showToast('Reset to default');
  });

  downloadQrBtn.addEventListener('click', () => {
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
// 5. Ad Sales Native Accordion & Individual Link Sharing
// -------------------------------------------------------------
function initAdSales() {
  const adCard = document.getElementById('ad-sales-card');
  const toggleText = document.getElementById('ad-sales-toggle-text');

  if (adCard && toggleText) {
    adCard.addEventListener('toggle', () => {
      toggleText.textContent = adCard.open ? 'Hide Links' : 'View Links';
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

