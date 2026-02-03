const dinnerMenus = [
    { korean: "치킨", english: "fried chicken", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80" },
    { korean: "피자", english: "pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
    { korean: "삼겹살", english: "grilled pork belly", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" },
    { korean: "족발", english: "braised pig feet", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80" },
    { korean: "보쌈", english: "boiled pork", image: "https://images.unsplash.com/photo-1623855244776-8b14e97cdadb?w=800&q=80" },
    { korean: "떡볶이", english: "tteokbokki", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80" },
    { korean: "순대", english: "korean blood sausage", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" },
    { korean: "김밥", english: "kimbap", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80" },
    { korean: "라면", english: "ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80" },
    { korean: "우동", english: "udon", image: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&q=80" },
    { korean: "초밥", english: "sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80" },
    { korean: "돈까스", english: "tonkatsu", image: "https://images.unsplash.com/photo-1604908815879-59402bb7e71f?w=800&q=80" },
    { korean: "파스타", english: "pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80" },
    { korean: "스테이크", english: "steak", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" },
    { korean: "햄버거", english: "hamburger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
    { korean: "샌드위치", english: "sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
    { korean: "샐러드", english: "salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
    { korean: "타코", english: "tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80" },
    { korean: "쌀국수", english: "pho", image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800&q=80" },
    { korean: "마라탕", english: "malatang", image: "https://images.unsplash.com/photo-1569943228011-e779f4b447e6?w=800&q=80" }
];

const menuRecommendation = document.getElementById('menu-recommendation');
const menuImage = document.getElementById('menu-image');
const recommendBtn = document.getElementById('recommend-btn');

document.getElementById('recommend-btn').addEventListener('click', async () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    const recommendedMenu = dinnerMenus[randomIndex];

    // Update menu text with animation
    menuRecommendation.style.opacity = '0';
    setTimeout(() => {
        menuRecommendation.textContent = recommendedMenu.korean;
        menuRecommendation.style.opacity = '1';
    }, 200);

    // Show loading state
    recommendBtn.disabled = true;
    recommendBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">이미지 로딩 중...</span>';
    menuImage.style.opacity = '0.5';

    // Preload image to avoid flashing
    const img = new Image();
    img.onload = () => {
        menuImage.src = recommendedMenu.image;
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = '<span class="btn-icon">🎲</span><span class="btn-text">다른 메뉴 추천받기</span>';
    };
    img.onerror = () => {
        // Fallback to a generic food image
        console.error('Error loading image for:', recommendedMenu.korean);
        menuImage.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = '<span class="btn-icon">🎲</span><span class="btn-text">다른 메뉴 추천받기</span>';
    };
    img.src = recommendedMenu.image;
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});