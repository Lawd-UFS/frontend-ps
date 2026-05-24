import './index.css';

// DOM Elements
const stepAuth = document.getElementById('step-auth');
const stepPanel = document.getElementById('step-panel');
const stepSuccess = document.getElementById('step-success');

const accessCodeInput = document.getElementById('access-code');
const btnVerify = document.getElementById('btn-verify');
const verifySpinner = document.getElementById('verify-spinner');
const authError = document.getElementById('auth-error');

const candidateNameSpan = document.getElementById('candidate-name');
const btnLogout = document.getElementById('btn-logout');
const currentBookingCard = document.getElementById('current-booking-card');
const currentBookingDate = document.getElementById('current-booking-date');
const currentBookingMode = document.getElementById('current-booking-mode');

const slotsGrid = document.getElementById('slots-grid');
const noSlotsMessage = document.getElementById('no-slots-message');
const btnConfirmBooking = document.getElementById('btn-confirm-booking');
const bookingSpinner = document.getElementById('booking-spinner');

const receiptDate = document.getElementById('receipt-date');
const receiptMode = document.getElementById('receipt-mode');
const receiptLocationRow = document.getElementById('receipt-location-row');
const btnBackPanel = document.getElementById('btn-back-panel');

// State Variables
let currentChatbotId = '';
let availableSlots = [];
let selectedSlotId = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Try to read code from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code') || urlParams.get('chatbotId');
  const storedCode = localStorage.getItem('ps_lawd_access_code');

  if (codeParam) {
    accessCodeInput.value = codeParam;
    verifyAccessCode(codeParam);
  } else if (storedCode) {
    accessCodeInput.value = storedCode;
    verifyAccessCode(storedCode);
  }

  // Bind Events
  btnVerify.addEventListener('click', () => {
    const code = accessCodeInput.value.trim();
    if (!code) {
      showAuthError('Por favor, insira o seu código de acesso.');
      return;
    }
    verifyAccessCode(code);
  });

  accessCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnVerify.click();
    }
  });

  btnLogout.addEventListener('click', logout);

  btnConfirmBooking.addEventListener('click', confirmReservation);

  btnBackPanel.addEventListener('click', () => {
    showStep(stepPanel);
    loadSchedulingPanel();
  });
});

// Navigation helper
function showStep(stepToShow) {
  [stepAuth, stepPanel, stepSuccess].forEach(step => {
    step.style.display = 'none';
  });
  stepToShow.style.display = 'block';
}

// Authentication Errors
function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
  accessCodeInput.classList.add('input-error');
}

function clearAuthError() {
  authError.style.display = 'none';
  accessCodeInput.classList.remove('input-error');
}

// Format Date / Time Helpers
function formatPortugueseDate(dateString) {
  const date = new Date(dateString);
  // Add UTC offset correction if necessary
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formatted = date.toLocaleDateString('pt-BR', options);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getModeText(mode) {
  switch (mode) {
    case 'Remoto': return 'Remoto (Online)';
    case 'Presencial': return 'Presencial (Laboratório LAWD)';
    case 'Ambos': return 'Ambos (Presencial ou Remoto)';
    default: return mode || 'A combinar';
  }
}

// API: Verify Access Code
async function verifyAccessCode(chatbotId) {
  clearAuthError();
  btnVerify.disabled = true;
  verifySpinner.style.display = 'inline-block';

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/candidato/${chatbotId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Código inválido ou candidato inativo.');
    }

    const resBody = await response.json();
    const data = resBody.data; // data is { candidate, isEmailVerified, schedule }
    currentChatbotId = chatbotId;
    localStorage.setItem('ps_lawd_access_code', chatbotId);

    // Transition UI
    showStep(stepPanel);
    renderWelcome(data.candidate || data.candidato);
    renderCurrentBooking(data.schedule || data.agendamentoAtual);
    await loadAvailableSlots();

  } catch (error) {
    showAuthError(error.message);
    localStorage.removeItem('ps_lawd_access_code');
  } finally {
    btnVerify.disabled = false;
    verifySpinner.style.display = 'none';
  }
}

// Render welcome banner
function renderWelcome(candidate) {
  if (candidate && candidate.name) {
    candidateNameSpan.textContent = candidate.name;
  }
}

// Render current booking card
function renderCurrentBooking(booking) {
  if (booking) {
    const dateTimeVal = booking.dateTime || booking.startTime;
    const modeVal = booking.interviewMode || booking.mode;
    
    currentBookingDate.textContent = `${formatPortugueseDate(dateTimeVal)} às ${formatTime(dateTimeVal)}`;
    currentBookingMode.textContent = `Modalidade: ${getModeText(modeVal)}`;
    currentBookingCard.style.display = 'block';
  } else {
    currentBookingCard.style.display = 'none';
  }
}

// API: Load Available Slots
async function loadAvailableSlots() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/disponiveis`);
    if (!response.ok) throw new Error('Não foi possível carregar os horários.');

    const resBody = await response.json();
    availableSlots = resBody.data || [];
    renderSlotsGrid();
  } catch (error) {
    console.error(error);
  }
}

// Render slots grid
function renderSlotsGrid() {
  slotsGrid.innerHTML = '';
  selectedSlotId = null;
  btnConfirmBooking.disabled = true;
  
  const modeSelectorContainer = document.getElementById('mode-selector-container');
  if (modeSelectorContainer) {
    modeSelectorContainer.style.display = 'none';
  }

  if (!availableSlots || availableSlots.length === 0) {
    noSlotsMessage.style.display = 'block';
    slotsGrid.style.display = 'none';
    return;
  }

  noSlotsMessage.style.display = 'none';
  slotsGrid.style.display = 'grid';

  availableSlots.forEach(slot => {
    const card = document.createElement('div');
    card.className = 'slot-card';
    card.dataset.id = slot.id || slot._id;

    const dateTimeVal = slot.dateTime || slot.startTime;
    const modeVal = slot.interviewMode || slot.mode;

    const dateText = formatPortugueseDate(dateTimeVal);
    const timeText = formatTime(dateTimeVal);
    const modeText = getModeText(modeVal);

    card.innerHTML = `
      <div class="slot-date">${dateText}</div>
      <div class="slot-time">${timeText}</div>
      <div class="slot-mode">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${modeText}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedSlotId = card.dataset.id;
      btnConfirmBooking.disabled = false;

      // Handle "Ambos" interview mode selection
      if (modeSelectorContainer) {
        if (modeVal === 'Ambos') {
          modeSelectorContainer.style.display = 'block';
        } else {
          modeSelectorContainer.style.display = 'none';
        }
      }
    });

    slotsGrid.appendChild(card);
  });
}

// API: Confirm Booking
async function confirmReservation() {
  if (!selectedSlotId || !currentChatbotId) return;

  const selectedSlot = availableSlots.find(s => (s.id || s._id) === selectedSlotId);
  if (!selectedSlot) return;

  let chosenMode = selectedSlot.interviewMode || selectedSlot.mode;
  if (chosenMode === 'Ambos') {
    const radioSelected = document.querySelector('input[name="selected-mode"]:checked');
    chosenMode = radioSelected ? radioSelected.value : 'Remoto';
  }

  btnConfirmBooking.disabled = true;
  bookingSpinner.style.display = 'inline-block';

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/reservar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatbotId: currentChatbotId,
        scheduleId: selectedSlotId,
        interviewMode: chosenMode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao reservar o horário.');
    }

    const resBody = await response.json();
    const reservedSlot = resBody.data;

    const reservedDateTime = reservedSlot.dateTime || reservedSlot.startTime;
    const reservedMode = reservedSlot.interviewMode || reservedSlot.mode;

    // Show Success State
    receiptDate.textContent = `${formatPortugueseDate(reservedDateTime)} às ${formatTime(reservedDateTime)}`;
    receiptMode.textContent = getModeText(reservedMode);

    if (reservedMode === 'Presencial' || reservedMode === 'Ambos') {
      receiptLocationRow.style.display = 'flex';
    } else {
      receiptLocationRow.style.display = 'none';
    }

    showStep(stepSuccess);

  } catch (error) {
    alert(error.message);
    btnConfirmBooking.disabled = false;
  } finally {
    bookingSpinner.style.display = 'none';
  }
}

// Reload helper
async function loadSchedulingPanel() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/agendamento/candidato/${currentChatbotId}`);
    if (response.ok) {
      const resBody = await response.json();
      const data = resBody.data;
      renderCurrentBooking(data.schedule || data.agendamentoAtual);
      await loadAvailableSlots();
    }
  } catch (error) {
    console.error(error);
  }
}

// Logout helper
function logout() {
  currentChatbotId = '';
  localStorage.removeItem('ps_lawd_access_code');
  accessCodeInput.value = '';
  clearAuthError();
  showStep(stepAuth);
}
