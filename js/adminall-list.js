// adminall-list.js - 강아지 중복 제거 버전
document.addEventListener('DOMContentLoaded', () => {
  loadAllDogs();
});

async function loadAllDogs() {
  const container = document.getElementById('allList');
  container.innerHTML = '<p style="text-align:center; padding:40px;">데이터 불러오는 중...</p>';

  try {
    const snapshot = await window.db.collection("reservations").get();
    const dogMap = new Map();   // 강아지별로 그룹화

    snapshot.forEach(doc => {
      const r = doc.data();
      if (!r.name) return;

      const key = `${r.name}_${r.ownerName || ''}`;   // 강아지이름 + 견주이름으로 키 생성

      if (!dogMap.has(key)) {
        dogMap.set(key, {
          dogName: r.name,
          ownerName: r.ownerName || '미등록',
          phone: r.ownerPhone,
          breed: r.breed,
          latestDate: r.date,
          latestTime: r.time,
          count: 1,                    // 이용 횟수
          records: [r]                 // 모든 기록 보관
        });
      } else {
        const existing = dogMap.get(key);
        existing.count++;
        existing.records.push(r);
        
        // 최신 예약 정보 업데이트
        if (new Date(r.completedAt || r.savedAt) > new Date(existing.latestDate)) {
          existing.latestDate = r.date;
          existing.latestTime = r.time;
        }
      }
    });

    const dogs = Array.from(dogMap.values());
    renderDogList(dogs);

  } catch (e) {
    console.error(e);
    container.innerHTML = '<p style="color:red; text-align:center;">데이터를 불러올 수 없습니다.</p>';
  }
}

function renderDogList(dogs) {
  const container = document.getElementById('allList');
  container.innerHTML = '';

  if (dogs.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:40px;">등록된 강아지가 없습니다.</p>';
    return;
  }

  dogs.forEach(dog => {
    const div = document.createElement('div');
    div.className = 'dog-item';
    div.innerHTML = `
      <div class="dog-name">${dog.dogName}</div>
      <div class="dog-owner">견주: ${dog.ownerName}</div>
      <div class="dog-info">
        이용횟수: <strong>${dog.count}회</strong><br>
        최근 이용: ${dog.latestDate} ${dog.latestTime}
      </div>
    `;
    div.onclick = () => {
      // 첫 번째 기록으로 이동 (또는 모든 기록 보는 페이지로 확장 가능)
      const firstRecord = dog.records[0];
      window.location.href = `adminpast-record.html?date=${encodeURIComponent(firstRecord.date)}&time=${encodeURIComponent(firstRecord.time)}`;
    };
    container.appendChild(div);
  });
}

// 검색 기능
document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase().trim();
  const items = document.querySelectorAll('.dog-item');
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(term) ? '' : 'none';
  });
});

function sortList(type) {
  alert("정렬 기능은 준비중입니다.");
}