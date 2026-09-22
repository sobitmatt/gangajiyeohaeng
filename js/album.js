// album.js - 관리자 버튼 비밀번호 체크 강화
document.addEventListener('DOMContentLoaded', () => {
  const dogGrid = document.getElementById('dogGrid');
  const searchInput = document.getElementById('searchInput');
  const adminBtn = document.getElementById('adminBtn');

  let allDogs = [];

  async function loadDogs() {
    try {
      const snapshot = await db.collection('dogAlbums').get();
      allDogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      renderDogs(allDogs);
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
      dogGrid.innerHTML = `
        <p style="grid-column:1/-1; text-align:center; padding:120px; font-size:1.3rem; color:#e74c3c;">
          Firebase 연결 오류<br>
          페이지를 새로고침(F5) 해보세요.
        </p>`;
    }
  }

  function renderDogs(dogsToShow) {
    dogGrid.innerHTML = '';

    if (!dogsToShow || dogsToShow.length === 0) {
      dogGrid.innerHTML = `
        <p style="grid-column:1/-1; text-align:center; padding:120px 20px; font-size:1.3rem; color:#8c6f4e;">
          등록된 강아지가 없습니다.<br>
          관리자 버튼으로 앨범을 먼저 생성해주세요.
        </p>`;
      return;
    }

    const sortedDogs = [...dogsToShow].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '', 'ko')
    );

    sortedDogs.forEach(dog => {
      const card = document.createElement('div');
      card.className = 'dog-card';
      
      card.innerHTML = `
        <h3>${dog.name}<br><span class="owner">(${dog.owner})</span></h3>
        ${!dog.isPublic ? '<span class="private-badge">🔒</span>' : ''}
      `;

      card.addEventListener('click', () => {
        window.location.href = `/dog-detail.html?id=${dog.id}`;
      });

      dogGrid.appendChild(card);
    });
  }

  // ==================== 관리자 버튼 (비밀번호 체크) ====================
  adminBtn.addEventListener('click', () => {
    const pw = prompt('🔧 관리자 비밀번호를 입력하세요:');
    
    if (pw === '7159561') {
      localStorage.setItem('adminLoggedIn', 'true');
      alert('✅ 관리자 모드로 로그인되었습니다.');
      window.location.href = '/admin.html';
    } else if (pw === null) {
      // 취소 버튼
      return;
    } else {
      alert('❌ 비밀번호가 틀렸습니다.');
    }
  });

  // ==================== 검색 ====================
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = allDogs.filter(dog => 
      (dog.name || '').toLowerCase().includes(term) || 
      (dog.owner || '').toLowerCase().includes(term)
    );
    renderDogs(filtered);
  });

  // ==================== 초기 실행 ====================
  loadDogs();
});