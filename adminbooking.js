// /js/adminbooking.js
let currentYear;
let currentMonth;
const MAX_MONTHS_AHEAD = 6;

// 현재 날짜로 초기화
function initCurrentDate() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1;

  // 최소 2026년 6월부터 시작하도록 유지
  if (currentYear < 2026 || (currentYear === 2026 && currentMonth < 6)) {
    currentYear = 2026;
    currentMonth = 6;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    const password = prompt("관리자 비밀번호를 입력해주세요:");
    if (password === "7159561") {
      localStorage.setItem('adminLoggedIn', 'true');
    } else {
      alert("비밀번호가 틀렸습니다.");
      window.location.href = "reservation.html";
      return;
    }
  }

  initCurrentDate();
  console.log("✅ adminbooking.js 로드됨");
  
  if (!window.db) {
    console.error("❌ Firebase가 로드되지 않았습니다.");
    alert("Firebase 연결 오류입니다.");
    return;
  }

  createCalendar();
  
  document.getElementById('saveBtn').addEventListener('click', saveAllChanges);
  
  const viewBtn = document.getElementById('viewReservationsBtn');
  if (viewBtn) viewBtn.addEventListener('click', () => window.location.href = "adminreservations.html");
});

let tempAvailability = {};

async function createCalendar() {
  const calendar = document.getElementById('calendar');
  const title = document.getElementById('month-title');
  
  title.textContent = `${currentYear}년 ${currentMonth}월 예약 설정`;

  document.getElementById('prev-btn').disabled = (currentYear === 2026 && currentMonth === 6);
  document.getElementById('next-btn').disabled = !isWithin6Months(currentYear, currentMonth + 1);

  calendar.innerHTML = `
    <div class="cal-header">일</div><div class="cal-header">월</div><div class="cal-header">화</div>
    <div class="cal-header">수</div><div class="cal-header">목</div><div class="cal-header">금</div>
    <div class="cal-header">토</div>
  `;

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();

  const availability = await loadAvailability();
  const reservations = await getAllReservations();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentHour = now.getHours();

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${currentYear}년 ${currentMonth}월 ${i}일`;
    const day = document.createElement('div');
    day.classList.add('cal-day');
    day.innerHTML = `<div class="date">${i}</div>`;

    const slotDate = new Date(currentYear, currentMonth - 1, i);
    const isPastDate = slotDate < today;
    const isToday = slotDate.getTime() === today.getTime();

    const times = ["10시", "13시", "15시"];
    
    times.forEach(time => {
      let isAvailable = true;

      if (availability && availability[dateKey]) {
        const dayData = availability[dateKey];
        if (dayData[time] === false) isAvailable = false;
      }

      const isReserved = reservations.some(r => 
        r.date === dateKey && 
        (r.time === time || r.time.includes(time) || time.includes(r.time))
      );
      if (isReserved) isAvailable = false;

      if (isPastDate || (isToday && currentHour >= parseInt(time))) {
        isAvailable = false;
      }

      const slot = document.createElement('div');
      slot.className = `time-slot ${isAvailable ? 'available' : 'unavailable'}`;
      slot.textContent = time;
      
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTimeSlot(dateKey, time, slot);
      });
      
      day.appendChild(slot);
    });

    calendar.appendChild(day);
  }
}

async function loadAvailability() {
  try {
    const docRef = window.db.collection("availability").doc(`${currentYear}-${currentMonth}`);
    const doc = await docRef.get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    console.error("Availability 로드 실패:", e);
    return {};
  }
}

async function getAllReservations() {
  try {
    const snapshot = await window.db.collection("reservations").get();
    const list = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      list.push({
        date: d.date || d.reservationDate,
        time: d.time || d.reservationTime
      });
    });
    return list;
  } catch (e) {
    console.error("예약 불러오기 실패:", e);
    return [];
  }
}

function toggleTimeSlot(dateKey, time, element) {
  if (!tempAvailability[dateKey]) tempAvailability[dateKey] = {};
  const current = tempAvailability[dateKey][time] !== false;
  tempAvailability[dateKey][time] = !current;
  element.className = `time-slot ${tempAvailability[dateKey][time] ? 'available' : 'unavailable'}`;
}

async function saveAllChanges() {
  if (!confirm("저장하시겠습니까?")) return;
  try {
    const docRef = window.db.collection("availability").doc(`${currentYear}-${currentMonth}`);
    await docRef.set(tempAvailability, { merge: true });
    alert("✅ 저장되었습니다!");
    createCalendar();
  } catch (e) {
    console.error("저장 실패:", e);
    alert("저장 실패");
  }
}

function isWithin6Months(year, month) {
  const now = new Date();
  const target = new Date(year, month - 1, 1);
  const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return diff >= 0 && diff <= MAX_MONTHS_AHEAD;
}

function nextMonth() {
  if (!isWithin6Months(currentYear, currentMonth + 1)) {
    alert("최대 6개월까지만 설정할 수 있습니다.");
    return;
  }
  currentMonth++;
  if (currentMonth > 12) { 
    currentMonth = 1; 
    currentYear++; 
  }
  createCalendar();
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 1) { 
    currentMonth = 12; 
    currentYear--; 
  }
  if (currentYear === 2026 && currentMonth < 6) currentMonth = 6;
  createCalendar();
}