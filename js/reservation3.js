// reservation3.js - Firebase 연동 버전
let selectedMenu = null;
let selectedSize = null;
let selectedWeight = null;

const priceTable = {
  "목욕(위생포함)": { 
    "소형견": { base: 25000, "0~2.9kg": 25000, "3~4.9kg": 30000, "5~6.9kg": 35000 },
    "중형견": { base: 30000, "0~2.9kg": 30000, "3~4.9kg": 35000, "5~6.9kg": 40000, "7~8.9kg": 45000, "9~10.9kg": 55000, "11~12.9kg": 60000, "13~14.9kg": 65000 },
    "특수견": { base: 40000, "0~2.9kg": 40000, "3~4.9kg": 45000, "5~6.9kg": 50000, "7~8.9kg": 55000, "9~10.9kg": 60000, "11~12.9kg": 65000 }
  },
  "얼굴+부분": { 
    "소형견": { base: 35000, "0~2.9kg": 35000, "3~4.9kg": 40000, "5~6.9kg": 45000 },
    "중형견": { base: 40000, "0~2.9kg": 40000, "3~4.9kg": 45000, "5~6.9kg": 50000, "7~8.9kg": 55000, "9~10.9kg": 65000, "11~12.9kg": 70000, "13~14.9kg": 75000 },
    "특수견": { base: 50000, "0~2.9kg": 50000, "3~4.9kg": 55000, "5~6.9kg": 60000, "7~8.9kg": 65000, "9~10.9kg": 70000, "11~12.9kg": 75000 }
  },
  "전체클리핑": { 
    "소형견": { base: 45000, "0~2.9kg": 45000, "3~4.9kg": 50000, "5~6.9kg": 55000 },
    "중형견": { base: 50000, "0~2.9kg": 50000, "3~4.9kg": 55000, "5~6.9kg": 60000, "7~8.9kg": 65000, "9~10.9kg": 70000, "11~12.9kg": 80000, "13~14.9kg": 90000 },
    "특수견": { base: 60000, "0~2.9kg": 60000, "3~4.9kg": 65000, "5~6.9kg": 70000, "7~8.9kg": 75000, "9~10.9kg": 80000, "11~12.9kg": 85000 }
  },
  "스포팅": { 
    "소형견": { base: 65000, "0~2.9kg": 65000, "3~4.9kg": 75000, "5~6.9kg": 85000 },
    "중형견": { base: 75000, "0~2.9kg": 75000, "3~4.9kg": 85000, "5~6.9kg": 95000, "7~8.9kg": 105000, "9~10.9kg": 115000, "11~12.9kg": 125000, "13~14.9kg": 135000 },
    "특수견": { base: 85000, "0~2.9kg": 85000, "3~4.9kg": 95000, "5~6.9kg": 105000, "7~8.9kg": 115000, "9~10.9kg": 130000, "11~12.9kg": 140000 }
  },
  "가위컷": { 
    "소형견": { base: 80000, "0~2.9kg": 80000, "3~4.9kg": 90000, "5~6.9kg": 100000 },
    "중형견": { base: 90000, "0~2.9kg": 90000, "3~4.9kg": 100000, "5~6.9kg": 110000, "7~8.9kg": 120000, "9~10.9kg": 130000, "11~12.9kg": 140000, "13~14.9kg": 150000 },
    "특수견": { base: 100000, "0~2.9kg": 100000, "3~4.9kg": 110000, "5~6.9kg": 120000, "7~8.9kg": 130000, "9~10.9kg": 145000, "11~12.9kg": 160000 }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderMenuOptions();
});

function renderMenuOptions() {
  const container = document.getElementById('menuGrid');
  container.innerHTML = '';

  const menus = ["목욕(위생포함)", "얼굴+부분", "전체클리핑", "스포팅", "가위컷"];

  menus.forEach(name => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.textContent = name;
    div.onclick = () => selectMenu(name, div);
    container.appendChild(div);
  });
}

function selectMenu(name, element) {
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedMenu = name;
  document.getElementById('detailSection').classList.remove('hidden');
  renderSizeOptions();
}

function renderSizeOptions() {
  const container = document.getElementById('sizeOptions');
  container.innerHTML = '';

  ["소형견", "중형견", "특수견"].forEach(size => {
    const btn = document.createElement('div');
    btn.className = 'size-btn';
    btn.textContent = size;
    btn.onclick = () => selectSize(size, btn);
    container.appendChild(btn);
  });
}

function selectSize(size, element) {
  document.querySelectorAll('.size-btn').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedSize = size;
  renderWeightOptions();
}

function renderWeightOptions() {
  const container = document.getElementById('weightTable');
  container.innerHTML = '';

  let weights = [];
  if (selectedSize === "소형견") weights = ["0~2.9kg", "3~4.9kg", "5~6.9kg"];
  else if (selectedSize === "중형견") weights = ["0~2.9kg", "3~4.9kg", "5~6.9kg", "7~8.9kg", "9~10.9kg", "11~12.9kg", "13~14.9kg"];
  else if (selectedSize === "특수견") weights = ["0~2.9kg", "3~4.9kg", "5~6.9kg", "7~8.9kg", "9~10.9kg", "11~12.9kg"];

  weights.forEach(weight => {
    const priceInfo = priceTable[selectedMenu]?.[selectedSize] || {};
    const price = priceInfo[weight] || priceInfo.base || 0;

    const div = document.createElement('div');
    div.className = 'weight-item';
    div.innerHTML = `<span>${weight}</span><span class="price">${price.toLocaleString()}원</span>`;
    div.onclick = () => selectWeight(weight, price, div);
    container.appendChild(div);
  });
}

function selectWeight(weight, price, element) {
  document.querySelectorAll('.weight-item').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedWeight = weight;
  document.getElementById('totalPrice').textContent = price.toLocaleString() + '원';
}

function goToNextStep() {
  if (!selectedMenu || !selectedSize || !selectedWeight) {
    alert("미용 메뉴, 크기, 무게를 모두 선택해주세요.");
    return;
  }

  const totalPriceText = document.getElementById('totalPrice').textContent;

  const menuData = {
    menu: selectedMenu,
    size: selectedSize,
    weight: selectedWeight,
    totalPrice: totalPriceText
  };

  localStorage.setItem('selectedMenuData', JSON.stringify(menuData));

  alert("✅ 미용 메뉴가 저장되었습니다!");
  window.location.href = "reservation4.html";
}