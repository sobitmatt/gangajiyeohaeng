// /js/index.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('강아지여행.com 메인 페이지 로드 완료 🐾');
  
  // 부드러운 스크롤 효과 (필요시)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});