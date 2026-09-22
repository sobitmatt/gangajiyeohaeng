// admin.js - 비밀번호 입력 추가 버전
document.addEventListener('DOMContentLoaded', () => {
  loadDogList();
});

async function createNewDogAlbum() {
  const dogName = document.getElementById('dogName').value.trim();
  const ownerName = document.getElementById('ownerName').value.trim();
  const phoneLast4 = document.getElementById('phoneLast4').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  if (!dogName || !ownerName) {
    alert('강아지 이름과 견주 이름을 모두 입력해주세요!');
    return;
  }

  if (!password) {
    if (!confirm('비밀번호를 입력하지 않았습니다.\n\n그래도 공개 앨범으로 생성하시겠습니까?')) {
      return;
    }
  }

  try {
    const dogId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const newAlbum = {
      name: dogName,
      owner: ownerName,
      phoneLast4: phoneLast4 || '',
      password: password || '',           // ← 비밀번호 저장
      isPublic: !password,                // 비밀번호 입력하면 비공개
      photos: [],
      videos: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('dogAlbums').doc(dogId).set(newAlbum);

    alert(`✅ ${dogName} (${ownerName}) 앨범이 생성되었습니다!`);
    
    // 입력 필드 초기화
    document.getElementById('dogName').value = '';
    document.getElementById('ownerName').value = '';
    document.getElementById('phoneLast4').value = '';
    document.getElementById('passwordInput').value = '';

    loadDogList();   // 목록 새로고침
  } catch (error) {
    console.error(error);
    alert('앨범 생성 중 오류가 발생했습니다.');
  }
}

// 등록된 앨범 목록 불러오기
async function loadDogList() {
  const container = document.getElementById('dogsList');
  container.innerHTML = '<p style="text-align:center; padding:30px;">불러오는 중...</p>';

  try {
    const snapshot = await db.collection('dogAlbums').get();
    container.innerHTML = '';

    if (snapshot.empty) {
      container.innerHTML = '<p style="text-align:center; padding:60px; color:#777;">등록된 앨범이 없습니다.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const dog = doc.data();
      const div = document.createElement('div');
      div.className = 'dog-item';
      div.innerHTML = `
        <strong>${dog.name}</strong> (${dog.owner})
        ${dog.password ? '<span style="color:#e74c3c; margin-left:10px;">🔒</span>' : '<span style="color:#27ae60; margin-left:10px;">🌐</span>'}
        ${dog.password ? `<small style="margin-left:8px; color:#777;">(${dog.password})</small>` : ''}
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p style="color:red; text-align:center;">목록을 불러오지 못했습니다.</p>';
  }
}