import './index.css';

// ═══════════════════════════════════════════════════════════════
// DOM References
// ═══════════════════════════════════════════════════════════════

const stepAuth = document.getElementById('step-auth');
const stepPanel = document.getElementById('step-panel');
const stepConfirm = document.getElementById('step-confirm');
const stepSuccess = document.getElementById('step-success');

const btnLogout = document.getElementById('btn-logout');
const authError = document.getElementById('auth-error');

// Panel
const candidateEmailDisplay = document.getElementById('candidate-email-display');
const slotsGrid = document.getElementById('slots-grid');
const noSlotsMessage = document.getElementById('no-slots-message');
const openCountEl = document.getElementById('open-count');
const occupiedCountEl = document.getElementById('occupied-count');
const filterTabs = document.getElementById('filter-tabs');

// Confirm
const confirmDate = document.getElementById('confirm-date');
const confirmTime = document.getElementById('confirm-time');
const confirmModeMeta = document.getElementById('confirm-mode-meta');
const confirmCandidate = document.getElementById('confirm-candidate');
const btnBackToPanel = document.getElementById('btn-back-to-panel');
const btnConfirmBooking = document.getElementById('btn-confirm-booking');
const bookingSpinner = document.getElementById('booking-spinner');
const modeSelectorContainer = document.getElementById('mode-selector-container');

// Success
const successDate = document.getElementById('success-date');
const successTime = document.getElementById('success-time');
const successMode = document.getElementById('success-mode');
const btnChangeSlot = document.getElementById('btn-change-slot');
const btnCancelBooking = document.getElementById('btn-cancel-booking');

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════

let currentChatbotId = '';
let candidateData = null;
let availableSlots = [];
let allSlots = []; // includes occupied for display
let selectedSlotId = null;
let selectedSlotData = null;
let currentFilter = 'all';

// ═══════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code') || urlParams.get('chatbotId');
  const storedCode = localStorage.getItem('ps_lawd_access_code');

  if (codeParam) {
    verifyAccessCode(codeParam);
  } else if (storedCode) {
    verifyAccessCode(storedCode);
  }

  // Event bindings
  btnLogout.addEventListener('click', logout);
  btnBackToPanel.addEventListener('click', () => showStep('panel'));
  btnConfirmBooking.addEventListener('click', confirmReservation);
  btnChangeSlot.addEventListener('click', () => showStep('panel'));
  btnCancelBooking.addEventListener('click', cancelBooking);

  // Filter tabs
  filterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderSlotsGrid();
  });

  // Mode selector change → update confirm card meta
  document.querySelectorAll('input[name="selected-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (selectedSlotData) {
        updateConfirmCard(selectedSlotData, radio.value);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Navigation
// ═══════════════════════════════════════════════════════════════

function showStep(step) {
  [stepAuth, stepPanel, stepConfirm, stepSuccess].forEach(s => {
    s.style.display = 'none';
  });

  switch (step) {
    case 'auth':
      stepAuth.style.display = 'block';
      btnLogout.style.display = 'none';
      break;
    case 'panel':
      stepPanel.style.display = 'block';
      btnLogout.style.display = 'inline-block';
      loadAvailableSlots();
      break;
    case 'confirm':
      stepConfirm.style.display = 'block';
      btnLogout.style.display = 'inline-block';
      break;
    case 'success':
      stepSuccess.style.display = 'block';
      btnLogout.style.display = 'inline-block';
      break;
  }
}

// ═══════════════════════════════════════════════════════════════
// Auth
// ═══════════════════════════════════════════════════════════════

async function verifyAccessCode(chatbotId) {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/candidato/${chatbotId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Código inválido.');
    }

    const resBody = await response.json();
    const data = resBody.data;

    currentChatbotId = chatbotId;
    candidateData = data.candidate;
    localStorage.setItem('ps_lawd_access_code', chatbotId);

    // Update UI
    if (candidateData?.email) {
      candidateEmailDisplay.textContent = candidateData.email;
    }

    // If candidate already has a booking, go to success
    if (data.schedule) {
      showSuccessFromSchedule(data.schedule);
    } else {
      showStep('panel');
    }
  } catch (error) {
    showAuthError(error.message);
    localStorage.removeItem('ps_lawd_access_code');
  }
}

function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
}

// ═══════════════════════════════════════════════════════════════
// Load Available Slots
// ═══════════════════════════════════════════════════════════════

async function loadAvailableSlots() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/disponiveis`);

    if (!response.ok) throw new Error('Erro ao carregar horários.');

    const resBody = await response.json();
    availableSlots = resBody.data || [];
    allSlots = availableSlots.map(s => ({ ...s, occupied: false }));

    renderSlotsGrid();
  } catch (error) {
    console.error(error);
  }
}

// ═══════════════════════════════════════════════════════════════
// Render Slots Grid
// ═══════════════════════════════════════════════════════════════

function renderSlotsGrid() {
  slotsGrid.innerHTML = '';
  selectedSlotId = null;
  selectedSlotData = null;

  let filteredSlots = allSlots;
  if (currentFilter !== 'all') {
    filteredSlots = allSlots.filter(s => {
      if (s.interviewMode === 'Ambos') return true; // Ambos matches both filters
      return s.interviewMode === currentFilter;
    });
  }

  const openSlots = filteredSlots.filter(s => !s.occupied);
  const occupiedSlots = filteredSlots.filter(s => s.occupied);

  openCountEl.textContent = openSlots.length;
  occupiedCountEl.textContent = occupiedSlots.length;

  if (filteredSlots.length === 0) {
    noSlotsMessage.style.display = 'block';
    slotsGrid.style.display = 'none';
    return;
  }

  noSlotsMessage.style.display = 'none';
  slotsGrid.style.display = 'grid';

  filteredSlots.forEach(slot => {
    const card = document.createElement('div');
    card.className = 'slot-card' + (slot.occupied ? ' occupied' : '');
    card.dataset.id = slot.id;

    const date = new Date(slot.dateTime);
    const dateText = formatDateShort(date);
    const dayText = formatDayOfWeek(date);
    const timeText = formatTimeShort(date);
    const modeVal = slot.interviewMode;

    // Mode badge
    let badgeClass = 'online';
    let badgeLabel = 'ONLINE';
    let badgeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;

    if (modeVal === 'Presencial') {
      badgeClass = 'presencial';
      badgeLabel = 'PRESENCIAL';
      badgeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    } else if (modeVal === 'Ambos') {
      // Show both badges
      badgeClass = 'online';
      badgeLabel = 'ONLINE';
    }

    card.innerHTML = `
      <div class="slot-card-top">
        <span class="slot-calendar-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>
        </span>
        <span class="slot-mode-badge ${badgeClass}">${badgeIcon} ${badgeLabel}</span>
      </div>
      <span class="slot-date">${dateText}</span>
      <span class="slot-day">${dayText} · ${timeText}</span>
      ${slot.occupied ? '<span class="slot-occupied-label">OCUPADO</span>' : ''}
    `;

    if (!slot.occupied) {
      card.addEventListener('click', () => {
        document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSlotId = slot.id;
        selectedSlotData = slot;
        goToConfirm(slot);
      });
    }

    slotsGrid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
// Go to Confirm Step
// ═══════════════════════════════════════════════════════════════

function goToConfirm(slot) {
  const date = new Date(slot.dateTime);
  const modeVal = slot.interviewMode;

  updateConfirmCard(slot, modeVal);

  // Show mode selector if "Ambos"
  if (modeVal === 'Ambos') {
    modeSelectorContainer.style.display = 'block';
  } else {
    modeSelectorContainer.style.display = 'none';
  }

  // Candidate info
  confirmCandidate.textContent = candidateData?.email || 'candidato@lawd.com';

  showStep('confirm');
}

function updateConfirmCard(slot, mode) {
  const date = new Date(slot.dateTime);

  confirmDate.textContent = `${formatDateLong(date)} · ${formatDayOfWeek(date)}`;

  // Update time
  const timeHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ${formatTimeShort(date)}
  `;
  confirmTime.innerHTML = timeHtml;

  // Update mode
  const displayMode = mode === 'Ambos' ? getSelectedMode() : mode;
  const modeIcon = displayMode === 'Presencial'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
  confirmModeMeta.innerHTML = `${modeIcon} ${displayMode === 'Remoto' ? 'Online' : displayMode}`;
}

function getSelectedMode() {
  const radio = document.querySelector('input[name="selected-mode"]:checked');
  return radio ? radio.value : 'Remoto';
}

// ═══════════════════════════════════════════════════════════════
// Confirm Reservation
// ═══════════════════════════════════════════════════════════════

async function confirmReservation() {
  if (!selectedSlotId || !currentChatbotId) return;

  let chosenMode = selectedSlotData.interviewMode;
  if (chosenMode === 'Ambos') {
    chosenMode = getSelectedMode();
  }

  btnConfirmBooking.disabled = true;
  bookingSpinner.style.display = 'inline-block';

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/reservar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatbotId: currentChatbotId,
        scheduleId: selectedSlotId,
        interviewMode: chosenMode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao reservar.');
    }

    const resBody = await response.json();
    const reserved = resBody.data;

    showSuccessFromSchedule({
      dateTime: reserved.dateTime,
      interviewMode: reserved.interviewMode || chosenMode,
    });
  } catch (error) {
    alert(error.message);
  } finally {
    btnConfirmBooking.disabled = false;
    bookingSpinner.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════
// Cancel Booking
// ═══════════════════════════════════════════════════════════════

async function cancelBooking() {
  if (!currentChatbotId) return;

  const confirmed = confirm('Tem certeza que deseja desmarcar sua entrevista?');
  if (!confirmed) return;

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/desmarcar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatbotId: currentChatbotId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao desmarcar.');
    }

    showStep('panel');
  } catch (error) {
    alert(error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// Show Success from Schedule Data
// ═══════════════════════════════════════════════════════════════

function showSuccessFromSchedule(schedule) {
  const date = new Date(schedule.dateTime);
  const mode = schedule.interviewMode;

  successDate.textContent = `${formatDateLong(date)} · ${formatDayOfWeek(date)}`;

  const timeHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ${formatTimeShort(date)}
  `;
  successTime.innerHTML = timeHtml;

  const modeLabel = mode === 'Remoto' ? 'Online' : mode;
  const modeIcon = mode === 'Presencial'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
  successMode.innerHTML = `${modeIcon} ${modeLabel}`;

  showStep('success');
}

// ═══════════════════════════════════════════════════════════════
// Logout
// ═══════════════════════════════════════════════════════════════

function logout() {
  currentChatbotId = '';
  candidateData = null;
  localStorage.removeItem('ps_lawd_access_code');
  showStep('auth');
}

// ═══════════════════════════════════════════════════════════════
// Date Formatters
// ═══════════════════════════════════════════════════════════════

function formatDateShort(date) {
  const day = date.getDate();
  const months = [
    'de Janeiro', 'de Fevereiro', 'de Março', 'de Abril',
    'de Maio', 'de Junho', 'de Julho', 'de Agosto',
    'de Setembro', 'de Outubro', 'de Novembro', 'de Dezembro'
  ];
  return `${day} ${months[date.getMonth()]}`;
}

function formatDateLong(date) {
  return formatDateShort(date);
}

function formatDayOfWeek(date) {
  const days = [
    'Domingo', 'Segunda', 'Terça', 'Quarta',
    'Quinta', 'Sexta', 'Sábado'
  ];
  return days[date.getDay()];
}

function formatTimeShort(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}h${minutes}`;
}
