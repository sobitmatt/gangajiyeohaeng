// public/js/dogs.js - 데이터 로드/저장 안정화 버전

let dogs = [];

// 데이터 불러오기
function loadDogs() {
  try {
    const savedDogs = localStorage.getItem("dogs");
    if (savedDogs) {
      dogs = JSON.parse(savedDogs);
    } else {
      dogs = [];
    }
  } catch (e) {
    console.error("데이터 불러오기 실패:", e);
    dogs = [];
  }
  window.dogs = dogs;
  console.log(`✅ 강아지 데이터 로드 완료 ${dogs.length}마리`);
}

// 데이터 저장하기
function saveDogs() {
  try {
    localStorage.setItem("dogs", JSON.stringify(window.dogs));
    console.log(`💾 데이터 저장 완료 (${window.dogs.length}마리)`);
  } catch (e) {
    console.error("저장 실패:", e);
  }
}

// 초기 실행
loadDogs();

// 전역으로 사용 가능하게 설정
window.dogs = dogs;
window.loadDogs = loadDogs;
window.saveDogs = saveDogs;