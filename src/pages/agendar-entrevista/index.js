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
const candidateEmailDisplay = document.getElementById(
  'candidate-email-display',
);
const slotsGrid = document.getElementById('slots-grid');
const noSlotsMessage = document.getElementById('no-slots-message');
const openCountEl = document.getElementById('open-count');
const filterTabs = document.getElementById('filter-tabs');

// Confirm
const confirmDate = document.getElementById('confirm-date');
const confirmTime = document.getElementById('confirm-time');
const confirmModeMeta = document.getElementById('confirm-mode-meta');
const confirmCandidate = document.getElementById('confirm-candidate');
const btnBackToPanel = document.getElementById('btn-back-to-panel');
const btnConfirmBooking = document.getElementById('btn-confirm-booking');
const bookingSpinner = document.getElementById('booking-spinner');
const modeSelectorContainer = document.getElementById(
  'mode-selector-container',
);

// Success
const successDate = document.getElementById('success-date');
const successTime = document.getElementById('success-time');
const successMode = document.getElementById('success-mode');
const btnChangeSlot = document.getElementById('btn-change-slot');
const btnCancelBooking = document.getElementById('btn-cancel-booking');
const btnGoogleCalendar = document.getElementById('btn-google-calendar');

// Modal Cancelamento
const cancelModalOverlay = document.getElementById('cancel-modal-overlay');
const btnModalClose = document.getElementById('btn-modal-close');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

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
  btnCancelBooking.addEventListener('click', () => {
    if (!currentChatbotId) return;
    cancelModalOverlay.style.display = 'flex';
  });

  btnModalClose.addEventListener('click', () => {
    cancelModalOverlay.style.display = 'none';
  });
  btnModalConfirm.addEventListener('click', cancelBooking);

  // Filter tabs
  filterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filterTabs
      .querySelectorAll('.filter-tab')
      .forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderSlotsGrid();
  });

  // Mode selector change → update confirm card meta
  document.querySelectorAll('input[name="selected-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (selectedSlotData) {
        updateConfirmCard(selectedSlotData, radio.value);
      }
    });
  });

  // Phone input mask
  const inputPhone = document.getElementById('input-phone');
  if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// Navigation
// ═══════════════════════════════════════════════════════════════

function showStep(step) {
  [stepAuth, stepPanel, stepConfirm, stepSuccess].forEach((s) => {
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
    const response = await fetch(
      `${apiUrl}/agendamento/candidato/${chatbotId}`,
    );

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
    allSlots = availableSlots.map((s) => ({ ...s, occupied: false }));
    allSlots.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

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
    filteredSlots = allSlots.filter((s) => {
      if (s.interviewMode === 'Ambos') return true; // Ambos matches both filters
      return s.interviewMode === currentFilter;
    });
  }

  const openSlots = filteredSlots.filter((s) => !s.occupied);

  openCountEl.textContent = openSlots.length;

  if (filteredSlots.length === 0) {
    noSlotsMessage.style.display = 'block';
    slotsGrid.style.display = 'none';
    return;
  }

  noSlotsMessage.style.display = 'none';
  slotsGrid.style.display = 'grid';

  filteredSlots.forEach((slot) => {
    const card = document.createElement('div');
    card.className = 'slot-card' + (slot.occupied ? ' occupied' : '');
    card.dataset.id = slot.id || slot._id;

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
      badgeClass = 'online';
      badgeLabel = 'FLEXÍVEL';
      badgeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>`;
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
        document
          .querySelectorAll('.slot-card')
          .forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSlotId = slot.id || slot._id;
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

  let displayMode = mode;
  let modeIcon = '';

  if (mode === 'Presencial') {
    displayMode = 'Presencial';
    modeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  } else if (mode === 'Ambos') {
    displayMode = 'Flexível';
    modeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>`;
  } else {
    displayMode = 'Online';
    modeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
  }

  confirmModeMeta.innerHTML = `${modeIcon} ${displayMode}`;
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

  const preferredNameInput = document.getElementById('input-preferred-name');
  const pronounsInput = document.getElementById('input-pronouns');
  const discordInput = document.getElementById('input-discord');
  const phoneInput = document.getElementById('input-phone');

  if (
    !preferredNameInput.reportValidity() ||
    !pronounsInput.reportValidity() ||
    !discordInput.reportValidity() ||
    !phoneInput.reportValidity()
  ) {
    return;
  }

  const rawPhone = phoneInput.value.replace(/\D/g, '');
  if (rawPhone.length !== 11) {
    alert("Por favor, informe um telefone válido com DDD (11 dígitos).");
    return;
  }

  const preferredName = preferredNameInput.value.trim();
  const pronouns = pronounsInput.value;
  const discord = discordInput.value.trim();

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
        preferredName,
        interviewPronouns: pronouns,
        discord,
        phone: rawPhone,
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

  btnModalConfirm.disabled = true;
  btnModalConfirm.innerText = 'Desmarcando...';

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

    cancelModalOverlay.style.display = 'none';
    showStep('panel');
  } catch (error) {
    alert(error.message);
  } finally {
    btnModalConfirm.disabled = false;
    btnModalConfirm.innerText = 'Sim, desmarcar';
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
  const modeIcon =
    mode === 'Presencial'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
  successMode.innerHTML = `${modeIcon} ${modeLabel}`;

  // Google Calendar link
  const calendarUrl = buildGoogleCalendarUrl(date, mode);
  btnGoogleCalendar.href = calendarUrl;
  btnGoogleCalendar.style.display = 'flex';

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
// Google Calendar URL Builder
// ═══════════════════════════════════════════════════════════════

function buildGoogleCalendarUrl(date, mode) {
  // Format date to Google Calendar format: YYYYMMDDTHHmmss
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  const startStr = `${year}${month}${day}T${hours}${minutes}00`;

  // End time: 30 minutes after start
  const endDate = new Date(date.getTime() + 30 * 60 * 1000);
  const endYear = endDate.getFullYear();
  const endMonth = pad(endDate.getMonth() + 1);
  const endDay = pad(endDate.getDate());
  const endHours = pad(endDate.getHours());
  const endMinutes = pad(endDate.getMinutes());

  const endStr = `${endYear}${endMonth}${endDay}T${endHours}${endMinutes}00`;

  const title = 'Entrevista - Processo Seletivo LAWD 2026';

  const modeLabel =
    mode === 'Remoto'
      ? 'Online (Discord)'
      : mode === 'Presencial'
        ? 'Presencial (Lab LAWD)'
        : mode;
  const description = `Entrevista do Processo Seletivo LAWD 2026.\nModalidade: ${modeLabel}\nDuração estimada: 30 minutos.\n\nAcesse o Discord do LAWD para mais informações: https://discord.com/invite/8yRDGWXgZ`;

  const location =
    mode === 'Presencial' ? 'Lab LAWD - Didática 7 /UFS' : 'Discord - LAWD';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: location,
    ctz: 'America/Sao_Paulo',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════
// Date Formatters
// ═══════════════════════════════════════════════════════════════

function formatDateShort(date) {
  const day = date.getDate();
  const months = [
    'de Janeiro',
    'de Fevereiro',
    'de Março',
    'de Abril',
    'de Maio',
    'de Junho',
    'de Julho',
    'de Agosto',
    'de Setembro',
    'de Outubro',
    'de Novembro',
    'de Dezembro',
  ];
  return `${day} ${months[date.getMonth()]}`;
}

function formatDateLong(date) {
  return formatDateShort(date);
}

function formatDayOfWeek(date) {
  const days = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];
  return days[date.getDay()];
}

function formatTimeShort(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}h${minutes}`;
}
