// dog-detail.js - 비밀번호 보호 추가 + 영상 큰 팝업 버전
let currentDog = null;
let isAdmin = false;
let storage = null;

async function loadDogDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const dogId = urlParams.get('id');
  if (!dogId) {
    alert("앨범 ID가 없습니다.");
    return window.location.href = "/album.html";
  }

  try {
    if (typeof firebase !== 'undefined') {
      storage = firebase.storage();
    }

    const doc = await db.collection('dogAlbums').doc(dogId).get();
    if (!doc.exists) {
      alert("앨범을 찾을 수 없습니다.");
      return window.location.href = "/album.html";
    }

    currentDog = { id: doc.id, ...doc.data() };

    // ==================== 비밀번호 보호 로직 ====================
    if (!currentDog.isPublic && !isAdminLoggedIn()) {
      const inputPw = prompt(`🔒 ${currentDog.name}의 개인 앨범입니다.\n\n비밀번호를 입력하세요:`);
      
      if (inputPw === null) { // 취소 버튼
        return window.location.href = "/album.html";
      }
      
      if (String(inputPw).trim() !== String(currentDog.password || '').trim()) {
        alert("❌ 비밀번호가 틀렸습니다.");
        return window.location.href = "/album.html";
      }
    }
    // =========================================================

    // 페이지 제목 설정
    document.getElementById('dogNameTitle').textContent = `${currentDog.name}의 앨범`;
    document.getElementById('pageTitle').textContent = `${currentDog.name}의 앨범`;

    // 프로필 이미지
    const profileImg = document.getElementById('dogProfileImg');
    profileImg.src = currentDog.profileImg || "https://picsum.photos/id/237/300/300";

    // 관리자 모드 체크
    if (localStorage.getItem('adminLoggedIn') === 'true') {
      isAdmin = true;
      document.getElementById('adminUploadBar').style.display = 'flex';
      document.getElementById('profileOverlay').style.display = 'flex';
      document.getElementById('adminLogoutBtn').style.display = 'block';
    }

    renderMedia();
  } catch (e) {
    console.error(e);
    alert("데이터를 불러오는 중 오류가 발생했습니다.");
  }
}

// 관리자 로그인 여부 확인
function isAdminLoggedIn() {
  return localStorage.getItem('adminLoggedIn') === 'true';
}

function renderMedia() {
  const container = document.getElementById('mediaContainer');
  container.innerHTML = '';

  // 사진들
  (currentDog.photos || []).forEach((photo, index) => {
    const div = document.createElement('div');
    div.className = 'media-card';
    div.innerHTML = `
      <img src="${photo.url}" alt="">
      ${isAdmin ? `<button class="delete-btn" onclick="deletePhoto(${index}); event.stopImmediatePropagation();">🗑</button>` : ''}
    `;
    div.onclick = () => showPhotoModal(photo);
    container.appendChild(div);
  });

  // 영상들
  (currentDog.videos || []).forEach((video, index) => {
    const div = document.createElement('div');
    div.className = 'media-card video-card';
    div.innerHTML = `
      <iframe width="100%" height="200" 
              src="${video.url}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
      <div class="video-info">
        <div class="video-date">${video.date || ''}</div>
        <div class="video-desc">${video.description || ''}</div>
      </div>
      ${isAdmin ? `<button class="delete-btn" onclick="deleteVideo(${index}); event.stopImmediatePropagation();">🗑</button>` : ''}
    `;
    div.onclick = () => showVideoModal(video.url, video.description);
    container.appendChild(div);
  });

  if ((currentDog.photos || []).length === 0 && (currentDog.videos || []).length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:40px; color:#999;">등록된 미디어가 없습니다.</p>';
  }
}

// ==================== 영상 큰 팝업 ====================
function showVideoModal(url, description) {
  const modalHTML = `
    <div id="videoModal" class="modal" style="display:flex;">
      <div class="modal-content video-modal">
        <span class="close" onclick="closeVideoModal()">×</span>
        <iframe width="100%" height="500" 
                src="${url}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
        <div class="modal-desc" style="margin-top:15px; padding:10px;">
          ${description || '영상 설명'}
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('videoModal');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.closeVideoModal = function() {
  const modal = document.getElementById('videoModal');
  if (modal) modal.remove();
};

// ==================== 사진 모달 ====================
function showPhotoModal(photo) {
  document.getElementById('modalImage').src = photo.url;
  document.getElementById('modalDate').textContent = photo.date || '';
  document.getElementById('modalDesc').textContent = photo.description || '설명글이 없습니다.';
  document.getElementById('photoModal').style.display = 'flex';
}

window.closePhotoModal = function() {
  document.getElementById('photoModal').style.display = 'none';
};

// ==================== 삭제 함수 ====================
async function deletePhoto(index) {
  if (!confirm('사진을 삭제하시겠습니까?')) return;
  currentDog.photos.splice(index, 1);
  await db.collection('dogAlbums').doc(currentDog.id).update({ photos: currentDog.photos });
  renderMedia();
  alert('사진이 삭제되었습니다.');
}

async function deleteVideo(index) {
  if (!confirm('영상을 삭제하시겠습니까?')) return;
  currentDog.videos.splice(index, 1);
  await db.collection('dogAlbums').doc(currentDog.id).update({ videos: currentDog.videos });
  renderMedia();
  alert('영상이 삭제되었습니다.');
}

// ==================== 업로드 함수 ====================
async function uploadPhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;

  input.onchange = async () => {
    if (!input.files.length || !storage) return alert("Storage 오류");

    const description = prompt('사진 설명을 입력하세요:', '미용 기록') || '미용 기록';

    for (let file of input.files) {
      try {
        const storageRef = storage.ref(`dogAlbums/${currentDog.id}/photos/${Date.now()}_${file.name}`);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();

        currentDog.photos = currentDog.photos || [];
        currentDog.photos.unshift({
          url: url,
          description: description,
          date: new Date().toLocaleDateString('ko-KR')
        });
      } catch (err) {
        console.error(err);
      }
    }

    await db.collection('dogAlbums').doc(currentDog.id).update({ photos: currentDog.photos });
    renderMedia();
    alert('사진 업로드 완료!');
  };
  input.click();
};

async function uploadVideo() {
  const url = prompt(`YouTube Embed URL을 입력하세요:\n\n예시:\nhttps://www.youtube.com/embed/1uqPsRFjVmQ`, "https://www.youtube.com/embed/1uqPsRFjVmQ");
  if (!url) return;
  
  const desc = prompt('영상 설명을 입력하세요:') || '';

  currentDog.videos = currentDog.videos || [];
  currentDog.videos.unshift({
    url: url,
    description: desc,
    date: new Date().toLocaleDateString('ko-KR')
  });

  await db.collection('dogAlbums').doc(currentDog.id).update({ videos: currentDog.videos });
  renderMedia();
  alert('영상이 추가되었습니다.');
}

function adminLogout() {
  if (confirm('관리자 모드를 로그아웃하시겠습니까?')) {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
  }
}

// 프로필 사진 업로드 (관리자)
async function uploadProfilePhoto() {
  if (!isAdmin) return;
  // 필요 시 구현
  alert("프로필 사진 업로드는 추후 추가 예정입니다.");
}

// 초기화
window.onload = loadDogDetail;