const dinnerMenus = [
    "치킨", "피자", "삼겹살", "족발", "보쌈", "떡볶이", "순대", "김밥", "라면", "우동", "초밥", "돈까스", "파스타", "스테이크", "햄버거", "샌드위치", "샐러드", "타코", "쌀국수", "마라탕"
];

const menuRecommendation = document.getElementById('menu-recommendation');
const menuImage = document.getElementById('menu-image');

document.getElementById('recommend-btn').addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    const recommendedMenu = dinnerMenus[randomIndex];
    menuRecommendation.textContent = recommendedMenu;
    
    // TODO: Replace this with a real image service or your own images.
    // You can use a service like Unsplash, Pexels, or your own image hosting.
    menuImage.src = `https://via.placeholder.com/400x300.png?text=${recommendedMenu}`;
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});