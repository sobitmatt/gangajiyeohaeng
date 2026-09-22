// reservation2.js 맨 위에 추가
firebase.firestore().settings({ ignoreUndefinedProperties: true });
// reservation2.js - Firebase 안정화 버전 (global db 사용)
document.addEventListener('DOMContentLoaded', () => {
  // currentReservation 불러오기
  const currentReservation = JSON.parse(localStorage.getItem('currentReservation')) || {};
  
  if (!currentReservation.date || !currentReservation.time) {
    alert("예약 날짜/시간 정보가 없습니다. Step 1부터 다시 진행해주세요.");
    window.location.href = "reservation.html";
    return;
  }

  // 입력 필드 이벤트 연결
  const dogNameInput = document.getElementById('dogName');
  const saveBtn = document.getElementById('saveBtn');

  if (dogNameInput) dogNameInput.addEventListener('keyup', searchDog);
  if (saveBtn) saveBtn.addEventListener('click', saveDogInfoAndContinue);

  console.log("✅ reservation2.js 로드 완료");
});

async function searchDog() {
  const keyword = document.getElementById('dogName').value.trim().toLowerCase();
  const box = document.getElementById('dog-suggestions');
  if (!box) return;
  box.innerHTML = '';

  if (keyword.length < 1) return;

  try {
    // window.db가 준비되었는지 확인
    if (!window.db) {
      console.error("Firebase db가 로드되지 않았습니다.");
      return;
    }

    const querySnapshot = await window.db.collection("dogProfiles").get();
    
    querySnapshot.forEach((doc) => {
      const dog = doc.data();
      if (dog.name && dog.name.toLowerCase().includes(keyword)) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `<strong>${dog.name}</strong> <small>(${dog.breed || '모름'})</small>`;
        item.onclick = () => {
          fillDogForm(dog);
        };
        box.appendChild(item);
      }
    });
  } catch (e) {
    console.error("강아지 검색 중 오류:", e);
  }
}

function fillDogForm(dog) {
  document.getElementById('dogName').value = dog.name || '';
  document.getElementById('ownerName').value = dog.ownerName || '';
  document.getElementById('ownerPhone').value = dog.ownerPhone || '';
  document.getElementById('breed').value = dog.breed || '';
  document.getElementById('weight').value = dog.weight || '';
  document.getElementById('age').value = dog.age || '';
  document.getElementById('gender').value = dog.gender || '미입력';
  document.getElementById('neutered').value = dog.neutered || '미입력';
  document.getElementById('bite').value = dog.bite || '미입력';
  
  const suggestions = document.getElementById('dog-suggestions');
  if (suggestions) suggestions.innerHTML = '';
}

async function saveDogInfoAndContinue() {
  const dogInfo = {
    name: document.getElementById('dogName').value.trim(),
    ownerName: document.getElementById('ownerName').value.trim(),
    ownerPhone: document.getElementById('ownerPhone').value.trim(),
    breed: document.getElementById('breed').value.trim(),
    weight: document.getElementById('weight').value.trim(),
    age: document.getElementById('age').value.trim(),
    gender: document.getElementById('gender').value || '미입력',
    neutered: document.getElementById('neutered').value || '미입력',
    bite: document.getElementById('bite').value || '미입력',
    reservationDate: JSON.parse(localStorage.getItem('currentReservation')).date,
    reservationTime: JSON.parse(localStorage.getItem('currentReservation')).time,
    savedAt: new Date().toISOString(),
    status: "pending"
  };

  // 필수값 체크
  if (!dogInfo.name || !dogInfo.ownerName || !dogInfo.ownerPhone || !dogInfo.breed) {
    alert("강아지 이름, 견주 이름, 휴대폰 번호, 품종은 필수입니다.");
    return;
  }

  try {
    if (!window.db) {
      alert("Firebase 연결에 문제가 있습니다.");
      return;
    }

    await window.db.collection("dogProfiles").add(dogInfo);
    
    // 다음 단계에서 사용하기 위해 localStorage에 임시 저장
    localStorage.setItem('currentDogInfo', JSON.stringify(dogInfo));

    alert(`✅ ${dogInfo.name} 정보가 Firebase에 저장되었습니다!`);
    window.location.href = "reservation3.html";
  } catch (error) {
    console.error("저장 실패 상세:", error);
    alert("저장에 실패했습니다.\n\n콘솔(F12)을 확인해주세요.");
  }
}