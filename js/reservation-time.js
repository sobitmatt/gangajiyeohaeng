// /js/reservation-time.js
document.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  const maxAttempts = 25;

  function tryLoad() {
    attempts++;
    if (window.db) {
      console.log("✅ reservation-time.html Firebase 연결 성공");
      initTimeSelection();
    } else if (attempts < maxAttempts) {
      setTimeout(tryLoad, 100);
    } else {
      console.error("❌ Firebase 연결 실패");
      alert("Firebase 연결에 문제가 있습니다. 새로고침 후 다시 시도해주세요.");
      initTimeSelection(true);
    }
  }
  tryLoad();
});

async function initTimeSelection(isFallback = false) {
  const dateKey = localStorage.getItem('selectedDate');
  if (!dateKey) {
    alert("날짜를 먼저 선택해주세요.");
    window.location.href = "reservation.html";
    return;
  }

  document.getElementById('selected-date-title').textContent = dateKey;
  const container = document.getElementById('time-cards');
  container.innerHTML = '';

  const times = [
    { time: "10시", label: "오전 10시" },
    { time: "13시", label: "오후 1시" },
    { time: "15시", label: "오후 3시" }
  ];

  const availability = isFallback ? {} : await loadAvailabilityForDate(dateKey);
  
  const now = new Date();
  const [year, month, day] = dateKey.match(/\d+/g).map(Number);
  
  // 해당 날짜의 끝 시간 기준으로 비교
  const slotDate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isPastDate = slotDate < today;
  const isToday = slotDate.getTime() === today.getTime();

  times.forEach(slot => {
    const hour = parseInt(slot.time);
    let isPast = false;

    if (isPastDate) {
      isPast = true;
    } else if (isToday) {
      isPast = now.getHours() >= hour;
    }

    const isBooked = availability[slot.time] === false || availability[slot.label] === false;
    const isAvailable = !isPast && !isBooked;

    const card = document.createElement('div');
    card.className = `time-card ${isAvailable ? 'available' : 'unavailable'}`;
    card.innerHTML = `
      ${slot.label}<br>
      <small style="font-size:0.9rem; font-weight:500; display:block; margin-top:6px;">
        ${isPast ? '예약 불가 (지난 시간)' : isBooked ? '예약 불가 (이미 예약됨)' : '✅ 예약 가능'}
      </small>
    `;

    if (isAvailable) {
      card.addEventListener('click', () => {
        if (confirm(`✅ 선택되었습니다!\n\n${dateKey} ${slot.label}\n\n강아지 정보 입력 페이지로 이동합니다.`)) {
          localStorage.setItem('currentReservation', JSON.stringify({ 
            date: dateKey, 
            time: slot.time
          }));
          window.location.href = "reservation2.html";
        }
      });
    }
    container.appendChild(card);
  });
}

async function loadAvailabilityForDate(dateKey) {
  if (!window.db) return {};
  try {
    const [year, monthStr] = dateKey.split('년 ');
    const month = monthStr.split('월')[0].trim();
    const docRef = window.db.collection("availability").doc(`${year}-${month}`);
    const doc = await docRef.get();
    if (doc.exists) {
      return doc.data()[dateKey] || {};
    }
    return {};
  } catch (e) {
    console.error("Availability 로드 실패:", e);
    return {};
  }
}

// ==================== 관리자 로그인 (reservation.html과 동일) ====================
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