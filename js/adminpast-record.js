// adminpast-record.js - 매우 단순하고 안전한 버전
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get('date');
  const time = urlParams.get('time');

  if (!date || !time) {
    alert("잘못된 접근입니다.");
    window.location.href = "adminreservations.html";
    return;
  }

  loadDogAllRecords(date, time);
});

async function loadDogAllRecords(currentDate, currentTime) {
  const container = document.getElementById('pastRecordDetail');
  container.innerHTML = '<p>데이터 불러오는 중...</p>';

  try {
    const snapshot = await window.db.collection("reservations").get();
    let allRecords = [];

    snapshot.forEach(doc => {
      const r = doc.data();
      if (r.name) allRecords.push(r);
    });

    const currentRecord = allRecords.find(r => 
      r.date === currentDate && r.time === currentTime
    );

    if (!currentRecord) {
      container.innerHTML = `<h2>기록을 찾을 수 없습니다.</h2>`;
      return;
    }

    const dogRecords = allRecords
      .filter(r => r.name === currentRecord.name && r.ownerName === currentRecord.ownerName)
      .sort((a, b) => new Date(b.completedAt || b.savedAt) - new Date(a.completedAt || a.savedAt));

    let html = `<h2>${currentRecord.name} (${currentRecord.ownerName || '미등록'}) 이용 기록</h2>`;

    dogRecords.forEach(record => {
      const isCurrent = record.date === currentDate && record.time === currentTime;
      
      html += `
        <div class="record-card" 
             data-date="${record.date}" 
             data-time="${record.time}">
          <h3>${record.date} ${record.time} ${isCurrent ? '(이번 예약)' : ''}</h3>
          <div class="info-grid">
            <div class="info-item"><strong>미용 메뉴</strong> ${record.menu || '미입력'}</div>
            <div class="info-item"><strong>예상 비용</strong> ${record.totalPrice || '0원'}</div>
            <div class="info-item"><strong>품종</strong> ${record.breed || '미입력'}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // 카드 전체 클릭
    document.querySelectorAll('.record-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const d = card.getAttribute('data-date');
        const t = card.getAttribute('data-time');
        
        if (d && t) {
          window.location.href = `adminreservation-detail.html?date=${encodeURIComponent(d)}&time=${encodeURIComponent(t)}`;
        }
      });
    });

  } catch (e) {
    console.error(e);
    container.innerHTML = `<h2>데이터를 불러오는 중 오류가 발생했습니다.</h2>`;
  }
}