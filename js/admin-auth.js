// admin-auth.js - 세션 로그인 (파라미터 있는 페이지도 통과하도록 개선)
const ADMIN_PASSWORD = "7159561";
const ADMIN_KEY = "isAdminLoggedIn";

function checkAdminLogin() {
  // 이미 로그인 상태면 바로 통과
  if (sessionStorage.getItem(ADMIN_KEY) === "true") {
    console.log("✅ 세션 로그인 유지 중");
    return true;
  }

  // URL에 date와 time 파라미터가 있으면 (상세 페이지) 자동 통과
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('date') && urlParams.has('time')) {
    console.log("✅ 상세 페이지 - 세션 체크 우회");
    sessionStorage.setItem(ADMIN_KEY, "true");
    return true;
  }

  const input = prompt("🔐 관리자 비밀번호를 입력하세요:");
  
  if (input === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, "true");
    console.log("✅ 관리자 로그인 성공");
    return true;
  } else {
    alert("❌ 비밀번호가 틀렸습니다.");
    window.location.href = "reservation.html";
    return false;
  }
}

// 페이지 로드 시 체크
if (!checkAdminLogin()) {
  document.body.innerHTML = "<h2 style='text-align:center; margin-top:100px; color:red;'>접근 권한이 없습니다.</h2>";
}