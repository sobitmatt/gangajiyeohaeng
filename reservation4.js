// reservation4.js - Netlify + 솔라피 문자 연동
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ reservation4.js 로드됨");
  loadSummary();
  setupAgreement();
});

async function loadSummary() {
  const reservation = JSON.parse(localStorage.getItem('currentReservation')) || {};
  const dogInfo = JSON.parse(localStorage.getItem('currentDogInfo')) || {};
  const menuData = JSON.parse(localStorage.getItem('selectedMenuData')) || {};

  const html = `
    <h3>📅 예약 정보</h3>
    <p><strong>예약 날짜 :</strong> ${reservation.date || '미선택'}</p>
    <p><strong>예약 시간 :</strong> ${reservation.time || '미선택'}</p>
    
    <h3>🐶 강아지 정보</h3>
    <p><strong>이름 :</strong> ${dogInfo.name || '미입력'}</p>
    <p><strong>견주 :</strong> ${dogInfo.ownerName || '미입력'}</p>
    <p><strong>연락처 :</strong> ${dogInfo.ownerPhone || '미입력'}</p>
    <p><strong>품종 :</strong> ${dogInfo.breed || '미입력'}</p>

    <h3>✂️ 미용 정보</h3>
    <p><strong>미용 메뉴 :</strong> ${menuData.menu || '미선택'}</p>
    <p><strong>크기 :</strong> ${menuData.size || '미선택'}</p>
    <p><strong>무게 구간 :</strong> ${menuData.weight || '미선택'}</p>
    <p><strong>예상 비용 :</strong> ${menuData.totalPrice || '0원'}</p>
  `;

  const summaryBox = document.getElementById('summaryBox');
  if (summaryBox) summaryBox.innerHTML = html;
}

function setupAgreement() {
  const agreementHTML = `
    <p>본 매장은 미용사와 반려동물의 안전을 위해 미용 서비스와 관련된 주의사항과 미용 요청자의 의무 및 책임 사항을 안내하며 다음 내용들에 대해 동의받습니다.</p>
    <p>미용 요청자는 반려동물의 슬개골 탈구, 디스크 등 질병 정보를 미용사에게 정확하게 전달해야 합니다.</p>
    <p>본 매장은 질병이 있는 반려동물의 미용을 중단할 수 있으며, 질병으로 인한 미용 중단에 따른 미용비 환불은 불가능합니다.</p>
    <p>본 매장은 미용사에게 사전 고지되지 않은 질병으로 인해 발생하는 사고 및 상해에 대해 책임지지 않으며 치료비를 부담하지 않습니다.</p>
    <p>백내장, 치주염, 관절염, 당뇨병, 심장질환 등 노령화에 따라 발생하는 질병을 가진 반려동물에게 미용은 쇼크 및 스트레스의 원인이 될 수 있으며, 관절에 무리가 오거나 일시적으로 다리를 절 수 있습니다.</p>
    <p>노령화가 진행된 반려동물의 미용 요청자는 미용 시 발생할 수 있는 사고에 대해 충분히 인지해야 하며, 이와 관련된 사고에 대해 본 매장은 책임지지 않습니다.</p>
    <p>미용 중 응급 처치 및 치료가 필요한 상황이 되면 미용 요청자에게 연락 및 동의 없이 근처 동물병원에서 응급 처치 및 치료를 우선으로 실시할 수 있습니다. 이때, 미용사 귀책 사유가 아닌 치료비에 대해 본 매장은 치료비를 부담하지 않습니다.</p>
    <p>미용 요청자는 반려동물의 입질 여부, 만지면 싫어하는 부위 등 미용 거부 행동과 관련된 정보를 미용사에게 정확하게 전달해야 합니다.</p>
    <p>본 매장은 미용 거부 행동을 보이는 반려동물의 미용은 안전을 위해 진행하지 않으며, 미용 거부로 인한 미용 중단에 따른 미용비 환불은 불가능합니다.</p>
    <p>미용 요청자는 사전 고지되지 않은 반려동물의 미용 거부 행동으로 인해 발생하는 미용사의 상해에 대해 치료비를 지급해야 합니다.</p>
    <p>본 매장은 미용사의 귀책 사유, 미용 도구로 인한 외상을 제외한 증상 및 상해에 대해 책임지지 않습니다.</p>
    <p>본 매장은 미용 후 반려동물의 긁음, 핥음, 비비거나 깨무는 행동으로 인해 발생한 증상 및 상해에 대해 책임지지 않습니다.</p>
    <p>본 매장은 미용 중에 발생한 상처라고 확인할 수 없는 증상 및 상해에 대해 수의사의 진단서 없이 책임지지 않습니다.</p>
    <p>미용사가 상담 과정에서 예상 미용 가격을 미용 요청자에게 전달했어도, 반려동물의 피모 상태, 미용 거부, 미용 요청자의 단순 변심으로 인해 추가 비용이 발생할 수 있으며, 미용 요청자는 추가 비용에 대해 지불해야 할 책임이 있습니다.</p>
    <p>미용 후 연락 없이 7일 이상 반려동물을 데리러 오지 않을 경우 유기로 간주하여 관할 동물 보호소로 이송될 수 있습니다.</p>
    <p>본 매장은 고객 관리, 계약서 작성 등의 서비스 제공을 위해 개인정보를 수집합니다.</p>
    <p>미용 요청자는 위 내용과 미용 요청자의 의무 및 책임을 모두 확인했으며, 미용사 귀책 사유가 아닌 문제에 대해 본 매장이 책임지지 않는 것에 동의합니다.</p>
  `;

  document.getElementById('agreementText').innerHTML = agreementHTML;

  const checkbox = document.getElementById('agreeCheck');
  const btn = document.getElementById('finalBtn');

  checkbox.addEventListener('change', () => {
    btn.disabled = !checkbox.checked;
  });

  btn.addEventListener('click', () => {
    if (checkbox.checked) completeReservation();
  });
}

async function completeReservation() {
  console.log("🔄 예약 완료 시도 시작...");

  const reservation = JSON.parse(localStorage.getItem('currentReservation')) || {};
  const dogInfo = JSON.parse(localStorage.getItem('currentDogInfo')) || {};
  const menuData = JSON.parse(localStorage.getItem('selectedMenuData')) || {};

  if (!window.db) {
    console.error("❌ window.db가 없습니다.");
    alert("Firebase 연결 오류입니다. 새로고침 후 다시 시도해주세요.");
    return;
  }

  if (!reservation.date || !dogInfo.name) {
    console.error("❌ 예약 정보 누락");
    alert("예약 정보가 올바르지 않습니다.");
    return;
  }

  try {
    const finalData = {
      ...dogInfo,
      ...menuData,
      date: reservation.date,
      time: reservation.time,
      status: "confirmed",
      completedAt: new Date().toISOString()
    };

    console.log("📝 Firestore에 저장 시도:", finalData);
    await window.db.collection("reservations").add(finalData);
    console.log("✅ Firestore 저장 성공");

    await blockTimeSlot(reservation.date, reservation.time);
    await sendKakaoNotification(reservation, dogInfo, menuData);

    localStorage.removeItem('currentReservation');
    localStorage.removeItem('currentDogInfo');
    localStorage.removeItem('selectedMenuData');

    window.location.href = "reservation.html";

  } catch (error) {
    console.error("❌ 예약 완료 실패 상세:", error);
    alert("예약 처리 중 오류가 발생했습니다.\n\nF12 콘솔을 확인해주세요.");
  }
}

async function blockTimeSlot(dateKey, time) {
  try {
    const docRef = window.db.collection("availability").doc("2026-6");
    const doc = await docRef.get();
    let data = doc.exists ? doc.data() : {};

    if (!data[dateKey]) data[dateKey] = {};
    data[dateKey][time] = false;

    await docRef.set(data, { merge: true });
    console.log(`✅ ${dateKey} ${time} 예약 불가 처리 완료`);
  } catch (e) {
    console.error("availability 차단 실패:", e);
  }
}

async function sendKakaoNotification(reservation, dog, menuData) {
  const phone = dog.ownerPhone;
  if (!phone) {
    alert("전화번호가 없습니다.");
    return;
  }

  const serverUrl = "/.netlify/functions/send-kakao";

  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.replace(/-/g, ""),
        customerName: dog.ownerName || "고객님",
        dogName: dog.name || "강아지",
        date: reservation.date,
        time: reservation.time,
        menu: menuData.menu || "미용",
        price: menuData.totalPrice || "0원"
      })
    });

    const resultText = await response.text();
    alert(resultText);
    console.log("📬 문자 응답 상태:", response.status);
    console.log("📬 문자 응답 내용:", resultText);
  } catch (e) {
    alert("문자 요청 실패: " + e.message);
    console.error("❌ 문자 요청 실패:", e);
  }
}
