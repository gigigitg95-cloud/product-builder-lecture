const dinnerMenus = [
    { korean: "치킨", english: "fried chicken" },
    { korean: "피자", english: "pizza" },
    { korean: "삼겹살", english: "grilled pork belly" },
    { korean: "족발", english: "braised pig feet" },
    { korean: "보쌈", english: "boiled pork" },
    { korean: "떡볶이", english: "tteokbokki korean rice cake" },
    { korean: "순대", english: "korean blood sausage" },
    { korean: "김밥", english: "kimbap korean roll" },
    { korean: "라면", english: "ramen noodles" },
    { korean: "우동", english: "udon noodles" },
    { korean: "초밥", english: "sushi" },
    { korean: "돈까스", english: "tonkatsu pork cutlet" },
    { korean: "파스타", english: "pasta" },
    { korean: "스테이크", english: "steak" },
    { korean: "햄버거", english: "hamburger" },
    { korean: "샌드위치", english: "sandwich" },
    { korean: "샐러드", english: "salad" },
    { korean: "타코", english: "tacos" },
    { korean: "쌀국수", english: "pho vietnamese noodles" },
    { korean: "마라탕", english: "malatang chinese hot pot" }
];

const menuRecommendation = document.getElementById('menu-recommendation');
const menuImage = document.getElementById('menu-image');
const recommendBtn = document.getElementById('recommend-btn');

document.getElementById('recommend-btn').addEventListener('click', async () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    const recommendedMenu = dinnerMenus[randomIndex];

    // Update menu text
    menuRecommendation.textContent = recommendedMenu.korean;

    // Show loading state
    recommendBtn.disabled = true;
    recommendBtn.textContent = '이미지 로딩 중...';
    menuImage.style.opacity = '0.5';

    try {
        // Fetch image from Unsplash
        const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(recommendedMenu.english)},food,dish`;

        // Preload image to avoid flashing
        const img = new Image();
        img.onload = () => {
            menuImage.src = imageUrl;
            menuImage.style.opacity = '1';
            recommendBtn.disabled = false;
            recommendBtn.textContent = '다른 메뉴 추천받기';
        };
        img.onerror = () => {
            // Fallback to a generic food image
            menuImage.src = 'https://source.unsplash.com/800x600/?food,dinner,meal';
            menuImage.style.opacity = '1';
            recommendBtn.disabled = false;
            recommendBtn.textContent = '다른 메뉴 추천받기';
        };
        img.src = imageUrl;
    } catch (error) {
        console.error('Error loading image:', error);
        menuImage.src = 'https://source.unsplash.com/800x600/?food,dinner,meal';
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.textContent = '다른 메뉴 추천받기';
    }
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});