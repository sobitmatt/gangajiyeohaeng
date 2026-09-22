// /js/reservation.js
let currentYear;
let currentMonth;
const MAX_MONTHS_AHEAD = 6;

// 현재 날짜로 초기화 (오늘 기준)
function initCurrentDate() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1; // JavaScript month는 0부터 시작
  
  // 최소 2026년 6월부터 시작하도록 (기존 정책 유지)
  if (currentYear < 2026 || (currentYear === 2026 && currentMonth < 6)) {
    currentYear = 2026;
    currentMonth = 6;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCurrentDate();
  
  let attempts = 0;
  const maxAttempts = 20;

  function tryRender() {
    attempts++;
    if (window.db) {
      console.log("✅ Firebase db 로드 성공");
      renderCalendar();
    } else if (attempts < maxAttempts) {
      setTimeout(tryRender, 100);
    } else {
      console.error("❌ Firebase 로드 실패");
      renderCalendar(); // fallback
    }
  }
  tryRender();
});

async function loadAvailability() {
  if (!window.db) return {};
  try {
    const docRef = window.db.collection("availability").doc(`${currentYear}-${currentMonth}`);
    const doc = await docRef.get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    console.error("Availability 로드 실패:", e);
    return {};
  }
}

function isWithin6Months(year, month) {
  const now = new Date();
  const target = new Date(year, month - 1, 1);
  const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return diff >= 0 && diff <= MAX_MONTHS_AHEAD;
}

async function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const title = document.getElementById('month-title');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  title.textContent = `${currentYear}년 ${currentMonth}월`;
  
  // 2026년 6월이 최소 시작월
  prevBtn.disabled = (currentYear === 2026 && currentMonth === 6);
  nextBtn.disabled = !isWithin6Months(currentYear, currentMonth + 1);

  calendar.innerHTML = `
    <div class="cal-header">일</div><div class="cal-header">월</div><div class="cal-header">화</div>
    <div class="cal-header">수</div><div class="cal-header">목</div><div class="cal-header">금</div>
    <div class="cal-header">토</div>
  `;

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = 일요일
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  const availability = await loadAvailability();

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${currentYear}년 ${currentMonth}월 ${i}일`;
    const day = document.createElement('div');
    day.classList.add('cal-day');
    day.innerHTML = `<div class="date">${i}</div>`;
    
    day.addEventListener('click', () => {
      localStorage.setItem('selectedDate', dateKey);
      window.location.href = 'reservation-time.html';
    });
    
    calendar.appendChild(day);
  }
}

function nextMonth() {
  if (!isWithin6Months(currentYear, currentMonth + 1)) return;
  currentMonth++;
  if (currentMonth > 12) { 
    currentMonth = 1; 
    currentYear++; 
  }
  renderCalendar();
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 1) { 
    currentMonth = 12; 
    currentYear--; 
  }
  // 최소 2026년 6월 제한
  if (currentYear === 2026 && currentMonth < 6) {
    currentMonth = 6;
  }
  renderCalendar();
}

// ==================== 관리자 로그인 ====================
function goToAdmin() {
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    window.location.href = "adminbooking.html";
    return;
  }

  const password = prompt("관리자 비밀번호를 입력해주세요:");
  
  if (password === "7159561") {
    localStorage.setItem('adminLoggedIn', 'true');
    window.location.href = "adminbooking.html";
  } else if (password !== null) {
    alert("비밀번호가 틀렸습니다.");
  }
}