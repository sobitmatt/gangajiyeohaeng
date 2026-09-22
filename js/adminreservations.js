// /js/adminreservations.js
let currentYear;
let currentMonth;
const MAX_MONTHS_AHEAD = 6;

// 현재 날짜로 초기화
function initCurrentDate() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1;

  // 최소 2026년 6월부터 시작
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
  console.log("✅ adminreservations.js 로드됨");
  
  if (!window.db) {
    console.error("❌ Firebase가 로드되지 않았습니다.");
    alert("Firebase 연결 오류입니다.");
    return;
  }

  createReservationCalendar();
});

async function createReservationCalendar() {
  const calendar = document.getElementById('calendar');
  const title = document.getElementById('month-title');
  
  title.textContent = `${currentYear}년 ${currentMonth}월 예약 현황`;

  document.getElementById('prev-btn').disabled = (currentYear === 2026 && currentMonth === 6);
  document.getElementById('next-btn').disabled = !isWithin6Months(currentYear, currentMonth + 1);

  calendar.innerHTML = `
    <div class="cal-header">일</div><div class="cal-header">월</div><div class="cal-header">화</div>
    <div class="cal-header">수</div><div class="cal-header">목</div><div class="cal-header">금</div>
    <div class="cal-header">토</div>
  `;

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();

  const reservations = await getAllReservationsFromFirebase();

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

    const times = ["10시", "13시", "15시"];
    
    times.forEach(time => {
      const isReserved = reservations.some(r => 
        r.date === dateKey && 
        (r.time === time || r.time.includes(time) || time.includes(r.time))
      );

      const slot = document.createElement('div');
      slot.className = `time-slot ${isReserved ? 'reserved' : 'available'}`;
      slot.textContent = time;
      
      if (isReserved) {
        slot.style.cursor = 'pointer';
        slot.addEventListener('click', () => {
          window.location.href = `adminreservation-detail.html?date=${encodeURIComponent(dateKey)}&time=${encodeURIComponent(time)}`;
        });
      }
      
      day.appendChild(slot);
    });

    calendar.appendChild(day);
  }
}

async function getAllReservationsFromFirebase() {
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
    console.log(`✅ 총 ${list.length}건 예약 불러옴`);
    return list;
  } catch (e) {
    console.error("예약 목록 불러오기 실패:", e);
    return [];
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
    alert("최대 6개월까지만 볼 수 있습니다.");
    return;
  }
  currentMonth++;
  if (currentMonth > 12) { 
    currentMonth = 1; 
    currentYear++; 
  }
  createReservationCalendar();
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 1) { 
    currentMonth = 12; 
    currentYear--; 
  }
  if (currentYear === 2026 && currentMonth < 6) currentMonth = 6;
  createReservationCalendar();
}