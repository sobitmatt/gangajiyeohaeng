// /js/adminreservation-detail.js
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get('date');
  const time = urlParams.get('time');

  if (!date || !time) {
    alert("잘못된 접근입니다.");
    window.location.href = "adminreservations.html";
    return;
  }

  console.log("📌 불러온 파라미터:", { date, time });

  loadReservationDetail(date, time);
  loadUsageHistory(date, time);
});

// 뒤로가기 (history.back() 사용)
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "adminreservations.html"; // 안전장치
  }
}

async function loadReservationDetail(date, time) {
  const container = document.getElementById('reservationDetail');
  
  try {
    const snapshot = await window.db.collection("reservations")
      .where("date", "==", date)
      .get();

    if (snapshot.empty) {
      container.innerHTML = `<h2>${date} ${time}<br>예약 정보가 없습니다.</h2>`;
      return;
    }

    let res = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      const savedTime = data.time || data.reservationTime || "";
      
      if (savedTime === time || 
          savedTime.includes(time) || 
          time.includes(savedTime) ||
          (time === "15시" && savedTime.includes("3시")) ||
          (time === "13시" && savedTime.includes("1시"))) {
        res = data;
      }
    });

    if (!res) {
      container.innerHTML = `<h2>${date} ${time}<br>예약 정보가 없습니다.</h2>`;
      return;
    }

    const biteMap = {
      "1": "한다", "2": "안한다", "3": "잘 모르겠다", "4": "가끔한다", "모름": "모름"
    };

    // 메모 불러오기
    const memoId = `${date.replace(/ /g, '')}_${time.replace(/ /g, '')}`;
    let memoText = "";
    try {
      const memoDoc = await window.db.collection("reservationMemos").doc(memoId).get();
      if (memoDoc.exists) {
        memoText = memoDoc.data().memo || "";
      }
    } catch(e) {}

    const html = `
      <h2>${date} ${time}</h2>
      <div class="info-grid">
        <div class="info-item"><strong>🐶 강아지 이름</strong> ${res.name || res.dogName || '미입력'}</div>
        <div class="info-item"><strong>견주 이름</strong> ${res.ownerName || '미입력'}</div>
        <div class="info-item"><strong>연락처</strong> ${res.ownerPhone || '미입력'}</div>
        <div class="info-item"><strong>품종</strong> ${res.breed || '미입력'}</div>
        <div class="info-item"><strong>몸무게</strong> ${res.weight || '미입력'}</div>
        <div class="info-item"><strong>나이</strong> ${res.age || '미입력'}</div>
        <div class="info-item"><strong>성별</strong> ${res.gender || '미입력'}</div>
        <div class="info-item"><strong>중성화</strong> ${res.neutered || '미입력'}</div>
        <div class="info-item"><strong>입질 성향</strong> ${biteMap[res.bite] || res.bite || '미입력'}</div>
        <div class="info-item"><strong>✂️ 미용 메뉴</strong> ${res.menu || '미입력'}</div>
        <div class="info-item"><strong>크기</strong> ${res.size || '미입력'}</div>
        <div class="info-item"><strong>예상 비용</strong> ${res.totalPrice || '0원'}</div>
        ${memoText ? `<div class="info-item memo-display"><strong>📝 메모 내용</strong><br>${memoText}</div>` : ''}
      </div>
    `;

    container.innerHTML = html;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<h2>데이터 불러오기 실패</h2>`;
  }
}

async function loadUsageHistory(currentDate, currentTime) {
  const container = document.getElementById('usageHistory');
  try {
    const snapshot = await window.db.collection("reservations").get();
    const history = [];

    snapshot.forEach(doc => {
      const r = doc.data();
      if (r.date === currentDate && r.time === currentTime) return;

      history.push({
        date: r.date,
        time: r.time,
        dogName: r.name,
        menu: r.menu,
        totalPrice: r.totalPrice,
        savedAt: r.completedAt || r.savedAt
      });
    });

    history.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    if (history.length === 0) {
      container.innerHTML = '<p>이전 이용 기록이 없습니다.</p>';
      return;
    }

    let html = '';
    history.forEach(record => {
      html += `
        <div class="history-item past-record" data-date="${record.date}" data-time="${record.time}">
          <strong>${record.date} ${record.time}</strong><br>
          ${record.dogName} • ${record.menu || '미용'} • ${record.totalPrice || '미정'}
        </div>
      `;
    });

    container.innerHTML = html;

    document.querySelectorAll('.past-record').forEach(item => {
      item.addEventListener('click', () => {
        const d = item.getAttribute('data-date');
        const t = item.getAttribute('data-time');
        window.location.href = `adminpast-record.html?date=${encodeURIComponent(d)}&time=${encodeURIComponent(t)}`;
      });
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p>기록 불러오기 실패</p>';
  }
}

// 메모 저장
document.getElementById('saveMemoBtn').addEventListener('click', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get('date');
  const time = urlParams.get('time');
  const memoText = document.getElementById('adminMemo').value.trim();

  if (!memoText) {
    alert("메모 내용을 입력해주세요.");
    return;
  }

  try {
    const memoId = `${date.replace(/ /g, '')}_${time.replace(/ /g, '')}`;
    await window.db.collection("reservationMemos").doc(memoId).set({
      date: date,
      time: time,
      memo: memoText,
      updatedAt: new Date().toISOString()
    });

    alert("✅ 메모가 저장되었습니다");
    document.getElementById('adminMemo').value = "";

    loadReservationDetail(date, time);

  } catch (e) {
    console.error(e);
    alert("메모 저장에 실패했습니다.");
  }
});