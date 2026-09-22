// public/js/detail.js - 조회수 + 좋아요 포함 최종 버전

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const dog = window.dogs.find(d => d.id === id);

  if (!dog) {
    alert('강아지를 찾을 수 없습니다.');
    window.location.href = '/album.html';
    return;
  }

  // 강아지 이름 표시
  document.getElementById('dogFullName').innerHTML = `
    ${dog.name} 
    <span style="font-size:1.25rem; font-weight:400; color:#555;">(${dog.owner})</span>
  `;

  const container = document.getElementById('mediaGrid');
  container.innerHTML = '';

  // 사진들
  dog.photos.forEach(photo => {
    container.appendChild(createMediaItem(photo, false, dog));
  });

  // 영상들
  dog.videos.forEach(video => {
    container.appendChild(createMediaItem(video.url, true, dog));
  });
});

function createMediaItem(src, isVideo, dog) {
  const item = document.createElement('div');
  item.className = 'album-item';

  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.className = 'thumbnail-container';

  if (isVideo) {
    thumbnailContainer.innerHTML = `
      <iframe width="100%" height="100%" 
              src="${src}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
    `;
  } else {
    thumbnailContainer.innerHTML = `
      <img src="/images/${src}" alt="${dog.name}" class="album-thumbnail">
    `;
  }

  // 정보 바 (날짜 + 좋아요 + 조회수)
  const infoBar = document.createElement('div');
  infoBar.className = 'album-info-bar';
  infoBar.innerHTML = `
    <span>📅 ${dog.uploadDate || '날짜 미등록'}</span>
    <span style="margin-left:auto; display:flex; align-items:center; gap:15px;">
      <button class="like-btn" onclick="toggleLike(this, '${dog.id}')">❤️ <span class="like-count">${dog.likes || 0}</span></button>
      <span class="views-count">👁 ${dog.views || 0}</span>
    </span>
  `;

  const desc = document.createElement('div');
  desc.className = 'album-description';
  desc.textContent = dog.description || '설명이 없습니다.';

  item.appendChild(thumbnailContainer);
  item.appendChild(infoBar);
  item.appendChild(desc);

  return item;
}

// 좋아요 기능 (임시 저장 - 새로고침하면 초기화됨)
window.toggleLike = function(btn, dogId) {
  let countEl = btn.querySelector('.like-count');
  let count = parseInt(countEl.textContent);
  
  count++;
  countEl.textContent = count;
  btn.style.color = '#e74c3c';

  // 실제 데이터에도 반영 (새로고침해도 유지되게)
  const dog = window.dogs.find(d => d.id === dogId);
  if (dog) {
    dog.likes = (dog.likes || 0) + 1;
    if (typeof window.saveDogs === 'function') window.saveDogs();
  }
};