// UI Translations for multiple languages
const translations = {
    'English': {
        title: 'Dinner Menu Recommendation',
        subtitle: 'Discover your next delicious meal',
        todayRecommendation: "Today's Recommendation",
        clickButton: 'Click the button below!',
        getRecommendation: 'Get Recommendation',
        getAnother: 'Get Another',
        loadingImage: 'Loading image...', 
        partnershipTitle: 'Partnership Inquiry',
        partnershipDesc: 'Have a partnership or advertising inquiry? Contact us below.',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        message: 'Message',
        messagePlaceholder: 'Your message here...',
        sendMessage: 'Send Message',
        footer: '© 2026 Dinner Menu Recommendation. All rights reserved.',
        searchLanguages: 'Search languages...', 
        lightMode: 'Light mode activated',
        darkMode: 'Dark mode activated',
        selected: 'Selected'
    },
    'Korean': {
        title: '저녁 메뉴 추천',
        subtitle: '오늘 저녁 뭐 먹지? 맛있는 메뉴를 추천해드립니다',
        todayRecommendation: '오늘의 추천 메뉴',
        clickButton: '아래 버튼을 클릭하세요!',
        getRecommendation: '메뉴 추천받기',
        getAnother: '다른 메뉴 추천',
        loadingImage: '이미지 로딩 중...', 
        partnershipTitle: '제휴 문의',
        partnershipDesc: '제휴 또는 광고 문의가 있으신가요? 아래에서 연락해 주세요.',
        email: '이메일',
        emailPlaceholder: 'your@email.com',
        message: '메시지',
        messagePlaceholder: '메시지를 입력하세요...',
        sendMessage: '메시지 보내기',
        footer: '© 2026 저녁 메뉴 추천. All rights reserved.',
        searchLanguages: '언어 검색...', 
        lightMode: '라이트 모드 활성화',
        darkMode: '다크 모드 활성화',
        selected: '선택됨'
    },
    'Japanese': {
        title: '夕食メニューのおすすめ',
        subtitle: '次のおいしい食事を見つけましょう',
        todayRecommendation: '今日のおすすめ',
        clickButton: '下のボタンをクリック！',
        getRecommendation: 'おすすめを見る',
        getAnother: '別のおすすめ',
        loadingImage: '画像読み込み中...', 
        partnershipTitle: 'お問い合わせ',
        partnershipDesc: '提携や広告のお問い合わせはこちらから。',
        email: 'メール',
        emailPlaceholder: 'your@email.com',
        message: 'メッセージ',
        messagePlaceholder: 'メッセージを入力...',
        sendMessage: '送信',
        footer: '© 2026 夕食メニューのおすすめ. All rights reserved.',
        searchLanguages: '言語を検索...', 
        lightMode: 'ライトモード',
        darkMode: 'ダークモード',
        selected: '選択済み'
    },
    'Mandarin Chinese': {
        title: '晚餐菜单推荐',
        subtitle: '发现您的下一顿美食',
        todayRecommendation: '今日推荐',
        clickButton: '点击下方按钮！',
        getRecommendation: '获取推荐',
        getAnother: '换一个',
        loadingImage: '图片加载中...', 
        partnershipTitle: '合作咨询',
        partnershipDesc: '有合作或广告咨询？请在下方联系我们。',
        email: '邮箱',
        emailPlaceholder: 'your@email.com',
        message: '留言',
        messagePlaceholder: '请输入您的留言...',
        sendMessage: '发送消息',
        footer: '© 2026 晚餐菜单推荐. All rights reserved.',
        searchLanguages: '搜索语言...', 
        lightMode: '浅色模式已激活',
        darkMode: '深色模式已激活',
        selected: '已选择'
    },
    'Spanish': {
        title: 'Recomendación de Menú para la Cena',
        subtitle: 'Descubre tu próxima comida deliciosa',
        todayRecommendation: 'Recomendación de Hoy',
        clickButton: '¡Haz clic en el botón de abajo!',
        getRecommendation: 'Obtener Recomendación',
        getAnother: 'Obtener Otra',
        loadingImage: 'Cargando imagen...', 
        partnershipTitle: 'Consulta de Asociación',
        partnershipDesc: '¿Tienes una consulta de asociación o publicidad? Contáctanos a continuación.',
        email: 'Correo electrónico',
        emailPlaceholder: 'tu@email.com',
        message: 'Mensaje',
        messagePlaceholder: 'Tu mensaje aquí...',
        sendMessage: 'Enviar Mensaje',
        footer: '© 2026 Recomendación de Menú para la Cena. Todos los derechos reservados.',
        searchLanguages: 'Buscar idiomas...', 
        lightMode: 'Modo claro activado',
        darkMode: 'Modo oscuro activado',
        selected: 'Seleccionado'
    },
    'French': {
        title: 'Recommandation de Menu pour le Dîner',
        subtitle: 'Découvrez votre prochain repas délicieux',
        todayRecommendation: "Recommandation d'Aujourd'hui",
        clickButton: 'Cliquez sur le bouton ci-dessous !',
        getRecommendation: 'Obtenir une Recommandation',
        getAnother: 'Obtenir une Autre',
        loadingImage: 'Chargement de l\'image...', 
        partnershipTitle: 'Demande de Partenariat',
        partnershipDesc: 'Vous avez une demande de partenariat ou de publicité ? Contactez-nous ci-dessous.',
        email: 'E-mail',
        emailPlaceholder: 'votre@email.com',
        message: 'Message',
        messagePlaceholder: 'Votre message ici...',
        sendMessage: 'Envoyer le Message',
        footer: '© 2026 Recommandation de Menu pour le Dîner. Tous droits réservés.',
        searchLanguages: 'Rechercher des langues...', 
        lightMode: 'Mode clair activé',
        darkMode: 'Mode sombre activé',
        selected: 'Sélectionné'
    },
    'German': {
        title: 'Abendessen-Menü-Empfehlung',
        subtitle: 'Entdecken Sie Ihre nächste köstliche Mahlzeit',
        todayRecommendation: 'Heutige Empfehlung',
        clickButton: 'Klicken Sie auf die Schaltfläche unten!',
        getRecommendation: 'Empfehlung erhalten',
        getAnother: 'Weitere Empfehlung',
        loadingImage: 'Bild wird geladen...', 
        partnershipTitle: 'Partnerschaftsanfrage',
        partnershipDesc: 'Haben Sie eine Partnerschafts- oder Werbeanfrage? Kontaktieren Sie uns unten.',
        email: 'E-Mail',
        emailPlaceholder: 'ihre@email.com',
        message: 'Nachricht',
        messagePlaceholder: 'Ihre Nachricht hier...',
        sendMessage: 'Nachricht senden',
        footer: '© 2026 Abendessen-Menü-Empfehlung. Alle Rechte vorbehalten.',
        searchLanguages: 'Sprachen suchen...', 
        lightMode: 'Heller Modus aktiviert',
        darkMode: 'Dunkler Modus aktiviert',
        selected: 'Ausgewählt'
    },
    'Portuguese': {
        title: 'Recomendação de Menu para o Jantar',
        subtitle: 'Descubra sua próxima refeição deliciosa',
        todayRecommendation: 'Recomendação de Hoje',
        clickButton: 'Clique no botão abaixo!',
        getRecommendation: 'Obter Recomendação',
        getAnother: 'Obter Outra',
        loadingImage: 'Carregando imagem...', 
        partnershipTitle: 'Consulta de Parceria',
        partnershipDesc: 'Tem uma consulta de parceria ou publicidade? Entre em contato abaixo.',
        email: 'E-mail',
        emailPlaceholder: 'seu@email.com',
        message: 'Mensagem',
        messagePlaceholder: 'Sua mensagem aqui...',
        sendMessage: 'Enviar Mensagem',
        footer: '© 2026 Recomendação de Menu para o Jantar. Todos os direitos reservados.',
        searchLanguages: 'Pesquisar idiomas...', 
        lightMode: 'Modo claro ativado',
        darkMode: 'Modo escuro ativado',
        selected: 'Selecionado'
    },
    'Russian': {
        title: 'Рекомендация меню на ужин',
        subtitle: 'Откройте для себя следующее вкусное блюдо',
        todayRecommendation: 'Рекомендация дня',
        clickButton: 'Нажмите кнопку ниже!',
        getRecommendation: 'Получить рекомендацию',
        getAnother: 'Получить другую',
        loadingImage: 'Загрузка изображения...', 
        partnershipTitle: 'Запрос на партнерство',
        partnershipDesc: 'Есть вопросы о партнерстве или рекламе? Свяжитесь с нами ниже.',
        email: 'Электронная почта',
        emailPlaceholder: 'ваш@email.com',
        message: 'Сообщение',
        messagePlaceholder: 'Ваше сообщение здесь...',
        sendMessage: 'Отправить сообщение',
        footer: '© 2026 Рекомендация меню на ужин. Все права защищены.',
        searchLanguages: 'Поиск языков...', 
        lightMode: 'Светлый режим активирован',
        darkMode: 'Темный режим активирован',
        selected: 'Выбрано'
    },
    'Arabic': {
        title: 'توصية قائمة العشاء',
        subtitle: 'اكتشف وجبتك اللذيذة التالية',
        todayRecommendation: 'توصية اليوم',
        clickButton: 'انقر على الزر أدناه!',
        getRecommendation: 'الحصول على توصية',
        getAnother: 'الحصول على أخرى',
        loadingImage: 'جاري تحميل الصورة...', 
        partnershipTitle: 'استفسار الشراكة',
        partnershipDesc: 'هل لديك استفسار عن الشراكة أو الإعلان؟ تواصل معنا أدناه.',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'your@email.com',
        message: 'الرسالة',
        messagePlaceholder: 'رسالتك هنا...',
        sendMessage: 'إرسال الرسالة',
        footer: '© 2026 توصية قائمة العشاء. جميع الحقوق محفوظة.',
        searchLanguages: 'البحث عن اللغات...', 
        lightMode: 'تم تفعيل الوضع الفاتح',
        darkMode: 'تم تفعيل الوضع الداكن',
        selected: 'تم الاختيار'
    },
    'Thai': {
        title: 'แนะนำเมนูอาหารเย็น',
        subtitle: 'ค้นพบมื้ออาหารอร่อยมื้อต่อไปของคุณ',
        todayRecommendation: 'แนะนำวันนี้',
        clickButton: 'คลิกปุ่มด้านล่าง!',
        getRecommendation: 'รับคำแนะนำ',
        getAnother: 'รับอีกเมนู',
        loadingImage: 'กำลังโหลดรูปภาพ...', 
        partnershipTitle: 'สอบถามการเป็นพันธมิตร',
        partnershipDesc: 'มีคำถามเกี่ยวกับการเป็นพันธมิตรหรือโฆษณา? ติดต่อเราด้านล่าง',
        email: 'อีเมล',
        emailPlaceholder: 'your@email.com',
        message: 'ข้อความ',
        messagePlaceholder: 'ข้อความของคุณที่นี่...',
        sendMessage: 'ส่งข้อความ',
        footer: '© 2026 แนะนำเมนูอาหารเย็น สงวนลิขสิทธิ์',
        searchLanguages: 'ค้นหาภาษา...', 
        lightMode: 'เปิดใช้งานโหมดสว่าง',
        darkMode: 'เปิดใช้งานโหมดมืด',
        selected: 'เลือกแล้ว'
    },
    'Vietnamese': {
        title: 'Gợi ý Thực đơn Bữa tối',
        subtitle: 'Khám phá bữa ăn ngon tiếp theo của bạn',
        todayRecommendation: 'Gợi ý Hôm nay',
        clickButton: 'Nhấp vào nút bên dưới!',
        getRecommendation: 'Nhận Gợi ý',
        getAnother: 'Nhận Gợi ý Khác',
        loadingImage: 'Đang tải hình ảnh...', 
        partnershipTitle: 'Liên hệ Hợp tác',
        partnershipDesc: 'Bạn có câu hỏi về hợp tác hoặc quảng cáo? Liên hệ chúng tôi bên dưới.',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        message: 'Tin nhắn',
        messagePlaceholder: 'Tin nhắn của bạn ở đây...',
        sendMessage: 'Gửi Tin nhắn',
        footer: '© 2026 Gợi ý Thực đơn Bữa tối. Đã đăng ký bản quyền.',
        searchLanguages: 'Tìm kiếm ngôn ngữ...', 
        lightMode: 'Đã bật chế độ sáng',
        darkMode: 'Đã bật chế độ tối',
        selected: 'Đã chọn'
    },
    'Indonesian': {
        title: 'Rekomendasi Menu Makan Malam',
        subtitle: 'Temukan hidangan lezat berikutnya',
        todayRecommendation: 'Rekomendasi Hari Ini',
        clickButton: 'Klik tombol di bawah!',
        getRecommendation: 'Dapatkan Rekomendasi',
        getAnother: 'Dapatkan Lainnya',
        loadingImage: 'Memuat gambar...', 
        partnershipTitle: 'Pertanyaan Kemitraan',
        partnershipDesc: 'Punya pertanyaan tentang kemitraan atau iklan? Hubungi kami di bawah.',
        email: 'Email',
        emailPlaceholder: 'email@anda.com',
        message: 'Pesan',
        messagePlaceholder: 'Pesan Anda di sini...',
        sendMessage: 'Kirim Pesan',
        footer: '© 2026 Rekomendasi Menu Makan Malam. Hak cipta dilindungi.',
        searchLanguages: 'Cari bahasa...', 
        lightMode: 'Mode terang diaktifkan',
        darkMode: 'Mode gelap diaktifkan',
        selected: 'Dipilih'
    },
    'Hindi': {
        title: 'रात के खाने के मेनू की सिफारिश',
        subtitle: 'अपना अगला स्वादिष्ट भोजन खोजें',
        todayRecommendation: 'आज की सिफारिश',
        clickButton: 'नीचे दिए गए बटन पर क्लिक करें!',
        getRecommendation: 'सिफारिश प्राप्त करें',
        getAnother: 'एक और प्राप्त करें',
        loadingImage: 'छवि लोड हो रही है...', 
        partnershipTitle: 'साझेदारी पूछताछ',
        partnershipDesc: 'साझेदारी या विज्ञापन के बारे में पूछताछ है? नीचे संपर्क करें.',
        email: 'ईमेल',
        emailPlaceholder: 'your@email.com',
        message: 'संदेश',
        messagePlaceholder: 'आपका संदेश यहाँ...',
        sendMessage: 'संदेश भेजें',
        footer: '© 2026 रात के खाने के मेनू की सिफारिश। सर्वाधिकार सुरक्षित।',
        searchLanguages: 'भाषाएँ खोजें...', 
        lightMode: 'लाइट मोड सक्रिय',
        darkMode: 'डार्क मोड सक्रिय',
        selected: 'चयनित'
    },
    'Italian': {
        title: 'Raccomandazione Menu per la Cena',
        subtitle: 'Scopri il tuo prossimo pasto delizioso',
        todayRecommendation: 'Raccomandazione di Oggi',
        clickButton: 'Clicca il pulsante qui sotto!',
        getRecommendation: 'Ottieni Raccomandazione',
        getAnother: 'Ottieni un\'altra',
        loadingImage: 'Caricamento immagine...', 
        partnershipTitle: 'Richiesta di Partnership',
        partnershipDesc: 'Hai una richiesta di partnership o pubblicità? Contattaci qui sotto.',
        email: 'E-mail',
        emailPlaceholder: 'tua@email.com',
        message: 'Messaggio',
        messagePlaceholder: 'Il tuo messaggio qui...',
        sendMessage: 'Invia Messaggio',
        footer: '© 2026 Raccomandazione Menu per la Cena. Tutti i diritti riservati.',
        searchLanguages: 'Cerca lingue...', 
        lightMode: 'Modalità chiara attivata',
        darkMode: 'Modalità scura attivata',
        selected: 'Selezionato'
    },
    'Dutch': {
        title: 'Aanbeveling voor het Avondmenu',
        subtitle: 'Ontdek je volgende heerlijke maaltijd',
        todayRecommendation: 'Aanbeveling van Vandaag',
        clickButton: 'Klik op de knop hieronder!',
        getRecommendation: 'Aanbeveling Krijgen',
        getAnother: 'Nog een Krijgen',
        loadingImage: 'Afbeelding laden...', 
        partnershipTitle: 'Samenwerkingsverzoek',
        partnershipDesc: 'Heb je een vraag over samenwerking of adverteren? Neem hieronder contact met ons op.',
        email: 'E-mail',
        emailPlaceholder: 'jouw@email.com',
        message: 'Bericht',
        messagePlaceholder: 'Je bericht hier...',
        sendMessage: 'Bericht Versturen',
        footer: '© 2026 Aanbeveling voor het Avondmenu. Alle rechten voorbehouden.',
        searchLanguages: 'Talen zoeken...', 
        lightMode: 'Lichte modus geactiveerd',
        darkMode: 'Donkere modus geactiveerd',
        selected: 'Geselecteerd'
    },
    'Polish': {
        title: 'Rekomendacja Menu na Kolację',
        subtitle: 'Odkryj swój następny pyszny posiłek',
        todayRecommendation: 'Dzisiejsza Rekomendacja',
        clickButton: 'Kliknij przycisk poniżej!',
        getRecommendation: 'Uzyskaj Rekomendację',
        getAnother: 'Uzyskaj Inną',
        loadingImage: 'Ładowanie obrazu...', 
        partnershipTitle: 'Zapytanie o Partnerstwo',
        partnershipDesc: 'Masz pytanie dotyczące partnerstwa lub reklamy? Skontaktuj się z nami poniżej.',
        email: 'E-mail',
        emailPlaceholder: 'twoj@email.com',
        message: 'Wiadomość',
        messagePlaceholder: 'Twoja wiadomość tutaj...',
        sendMessage: 'Wyślij Wiadomość',
        footer: '© 2026 Rekomendacja Menu na Kolację. Wszelkie prawa zastrzeżone.',
        searchLanguages: 'Szukaj języków...', 
        lightMode: 'Tryb jasny aktywowany',
        darkMode: 'Tryb ciemny aktywowany',
        selected: 'Wybrano'
    },
    'Turkish': {
        title: 'Akşam Yemeği Menü Önerisi',
        subtitle: 'Bir sonraki lezzetli yemeğinizi keşfedin',
        todayRecommendation: 'Bugünün Önerisi',
        clickButton: 'Aşağıdaki düğmeye tıklayın!',
        getRecommendation: 'Öneri Al',
        getAnother: 'Başka Bir Tane Al',
        loadingImage: 'Görsel yükleniyor...', 
        partnershipTitle: 'Ortaklık Sorgusu',
        partnershipDesc: 'Ortaklık veya reklam sorunuz mu var? Aşağıdan bize ulaşın.',
        email: 'E-posta',
        emailPlaceholder: 'sizin@email.com',
        message: 'Mesaj',
        messagePlaceholder: 'Mesajınız burada...',
        sendMessage: 'Mesaj Gönder',
        footer: '© 2026 Akşam Yemeği Menü Önerisi. Tüm hakları saklıdır.',
        searchLanguages: 'Dil ara...', 
        lightMode: 'Açık mod etkinleştirildi',
        darkMode: 'Karanlık mod etkinleştirildi',
        selected: 'Seçildi'
    }
};

// Menu translations for different languages
const menuTranslations = {
    'English': { chicken: 'Fried Chicken', pizza: 'Pizza', porkBelly: 'Grilled Pork Belly', pigFeet: 'Braised Pig Feet', boiledPork: 'Boiled Pork', tteokbokki: 'Tteokbokki', sundae: 'Korean Blood Sausage', kimbap: 'Kimbap', ramen: 'Ramen', udon: 'Udon', sushi: 'Sushi', tonkatsu: 'Tonkatsu', pasta: 'Pasta', steak: 'Steak', hamburger: 'Hamburger', sandwich: 'Sandwich', salad: 'Salad', tacos: 'Tacos', pho: 'Pho', malatang: 'Malatang', bibimbap: 'Bibimbap', japchae: 'Japchae', kimchijjigae: 'Kimchi Stew', sushiRoll: 'Sushi Roll', tempura: 'Tempura', curry: 'Curry', burrito: 'Burrito', fishAndChips: 'Fish and Chips', paella: 'Paella', dumplings: 'Dumplings' },
    'Korean': { chicken: '치킨', pizza: '피자', porkBelly: '삼겹살', pigFeet: '족발', boiledPork: '보쌈', tteokbokki: '떡볶이', sundae: '순대', kimbap: '김밥', ramen: '라면', udon: '우동', sushi: '초밥', tonkatsu: '돈까스', pasta: '파스타', steak: '스테이크', hamburger: '햄버거', sandwich: '샌드위치', salad: '샐러드', tacos: '타코', pho: '쌀국수', malatang: '마라탕', bibimbap: '비빔밥', japchae: '잡채', kimchijjigae: '김치찌개', sushiRoll: '스시 롤', tempura: '튀김', curry: '카레', burrito: '부리또', fishAndChips: '피쉬 앤 칩스', paella: '빠에야', dumplings: '만두' },
    'Japanese': { chicken: 'フライドチキン', pizza: 'ピザ', porkBelly: 'サムギョプサル', pigFeet: '豚足', boiledPork: 'ポッサム', tteokbokki: 'トッポッキ', sundae: 'スンデ', kimbap: 'キンパ', ramen: 'ラーメン', udon: 'うどん', sushi: '寿司', tonkatsu: 'とんかつ', pasta: 'パスタ', steak: 'ステーキ', hamburger: 'ハンバーガー', sandwich: 'サンドイッチ', salad: 'サラダ', tacos: 'タコス', pho: 'フォー', malatang: '麻辣湯', bibimbap: 'ビビンバ', japchae: 'チャプチェ', kimchijjigae: 'キムチチゲ', sushiRoll: '寿司ロール', tempura: '天ぷら', curry: 'カレー', burrito: 'ブリトー', fishAndChips: 'フィッシュアンドチップス', paella: 'パエリア', dumplings: '餃子' },
    'Mandarin Chinese': { chicken: '炸鸡', pizza: '披萨', porkBelly: '烤五花肉', pigFeet: '红烧猪蹄', boiledPork: '白切肉', tteokbokki: '炒年糕', sundae: '韩式血肠', kimbap: '紫菜包饭', ramen: '拉面', udon: '乌冬面', sushi: '寿司', tonkatsu: '炸猪排', pasta: '意大利面', steak: '牛排', hamburger: '汉堡', sandwich: '三明治', salad: '沙拉', tacos: '玉米卷', pho: '越南河粉', malatang: '麻辣烫', bibimbap: '拌饭', japchae: '杂菜', kimchijjigae: '泡菜汤', sushiRoll: '寿司卷', tempura: '天妇罗', curry: '咖喱', burrito: '墨西哥卷饼', fishAndChips: '炸鱼薯条', paella: '海鲜饭', dumplings: '饺子' },
    'Spanish': { chicken: 'Pollo Frito', pizza: 'Pizza', porkBelly: 'Panceta a la Parrilla', pigFeet: 'Patas de Cerdo', boiledPork: 'Cerdo Hervido', tteokbokki: 'Tteokbokki', sundae: 'Morcilla Coreana', kimbap: 'Kimbap', ramen: 'Ramen', udon: 'Udon', sushi: 'Sushi', tonkatsu: 'Tonkatsu', pasta: 'Pasta', steak: 'Bistec', hamburger: 'Hamburguesa', sandwich: 'Sándwich', salad: 'Ensalada', tacos: 'Tacos', pho: 'Pho', malatang: 'Malatang', bibimbap: 'Bibimbap', japchae: 'Japchae', kimchijjigae: 'Estofado de Kimchi', sushiRoll: 'Rollos de Sushi', tempura: 'Tempura', curry: 'Curry', burrito: 'Burrito', fishAndChips: 'Pescado con Papas Fritas', paella: 'Paella', dumplings: 'Empanadillas' },
    'French': { chicken: 'Poulet Frit', pizza: 'Pizza', porkBelly: 'Poitrine de Porc Grillée', pigFeet: 'Pieds de Porc Braisés', boiledPork: 'Porc Bouilli', tteokbokki: 'Tteokbokki', sundae: 'Boudin Coréen', kimbap: 'Kimbap', ramen: 'Ramen', udon: 'Udon', sushi: 'Sushi', tonkatsu: 'Tonkatsu', pasta: 'Pâtes', steak: 'Steak', hamburger: 'Hamburger', sandwich: 'Sandwich', salad: 'Salade', tacos: 'Tacos', pho: 'Pho', malatang: 'Malatang', bibimbap: 'Bibimbap', japchae: 'Japchae', kimchijjigae: 'Ragoût de Kimchi', sushiRoll: 'Rouleaux de Sushi', tempura: 'Tempura', curry: 'Curry', burrito: 'Burrito', fishAndChips: 'Fish and Chips', paella: 'Paella', dumplings: 'Raviolis' },
    'German': { chicken: 'Brathähnchen', pizza: 'Pizza', porkBelly: 'Gegrillter Schweinebauch', pigFeet: 'Geschmorte Schweinefüße', boiledPork: 'Gekochtes Schweinefleisch', tteokbokki: 'Tteokbokki', sundae: 'Koreanische Blutwurst', kimbap: 'Kimbap', ramen: 'Ramen', udon: 'Udon', sushi: 'Sushi', tonkatsu: 'Tonkatsu', pasta: 'Pasta', steak: 'Steak', hamburger: 'Hambúrguer', sandwich: 'Sandwich', salad: 'Salat', tacos: 'Tacos', pho: 'Pho', malatang: 'Malatang', bibimbap: 'Bibimbap', japchae: 'Japchae', kimchijjigae: 'Kimchi-Eintopf', sushiRoll: 'Sushi-Rolle', tempura: 'Tempura', curry: 'Curry', burrito: 'Burrito', fishAndChips: 'Fish and Chips', paella: 'Paella', dumplings: 'Knödel' },
    'Portuguese': { chicken: 'Frango Frito', pizza: 'Pizza', porkBelly: 'Barriga de Porco Grelhada', pigFeet: 'Pés de Porco Estufados', boiledPork: 'Carne de Porco Cozida', tteokbokki: 'Tteokbokki', sundae: 'Salsicha Coreana de Sangue', kimbap: 'Kimbap', ramen: 'Ramen', udon: 'Udon', sushi: 'Sushi', tonkatsu: 'Tonkatsu', pasta: 'Massa', steak: 'Bife', hamburger: 'Hambúrguer', sandwich: 'Sanduíche', salad: 'Salada', tacos: 'Tacos', pho: 'Pho', malatang: 'Malatang', bibimbap: 'Bibimbap', japchae: 'Japchae', kimchijjigae: 'Ensopado de Kimchi', sushiRoll: 'Rolo de Sushi', tempura: 'Tempura', curry: 'Curry', burrito: 'Burrito', fishAndChips: 'Fish and Chips', paella: 'Paella', dumplings: 'Dumplings' },
};

const dinnerMenus = [
    { key: "chicken", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80" },
    { key: "pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
    { key: "porkBelly", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" },
    { key: "pigFeet", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80" },
    { key: "boiledPork", image: "https://images.unsplash.com/photo-1623855244776-8b14e97cdadb?w=800&q=80" },
    { key: "tteokbokki", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80" },
    { key: "sundae", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" },
    { key: "kimbap", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80" },
    { key: "ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80" },
    { key: "udon", image: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&q=80" },
    { key: "sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80" },
    { key: "tonkatsu", image: "https://images.unsplash.com/photo-1604908815879-59402bb7e71f?w=800&q=80" },
    { key: "pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80" },
    { key: "steak", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" },
    { key: "hamburger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
    { key: "sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
    { key: "salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
    { key: "tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80" },
    { key: "pho", image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800&q=80" },
    { key: "malatang", image: "https://images.unsplash.com/photo-1569943228011-e779f0b447e6?w=800&q=80" },
    { key: "bibimbap", image: "https://images.unsplash.com/photo-1582236940026-6d63d8b4e7a7?w=800&q=80" },
    { key: "japchae", image: "https://images.unsplash.com/photo-1603509017684-297f6c6f6e5c?w=800&q=80" },
    { key: "kimchijjigae", image: "https://images.unsplash.com/photo-1610486255106-9c4c7b8c2c1a?w=800&q=80" },
    { key: "sushiRoll", image: "https://images.unsplash.com/photo-1579871630132-72a3921356f1?w=800&q=80" },
    { key: "tempura", image: "https://images.unsplash.com/photo-1628108422633-8f0a0d0a7a0b?w=800&q=80" },
    { key: "curry", image: "https://images.unsplash.com/photo-1588166524941-cbf777e38466?w=800&q=80" },
    { key: "burrito", image: "https://images.unsplash.com/photo-1565299624942-f82ad9d123e4?w=800&q=80" },
    { key: "fishAndChips", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80" },
    { key: "paella", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" },
    { key: "dumplings", image: "https://images.unsplash.com/photo-1582236940026-6d63d8b4e7a7?w=800&q=80" }
];

const menuRecommendation = document.getElementById('menu-recommendation');
const menuImage = document.getElementById('menu-image');
const recommendBtn = document.getElementById('recommend-btn');

// Language Selector
const languageBtn = document.getElementById('language-btn');
const languageSelector = document.querySelector('.language-selector');
const languageDropdown = document.getElementById('language-dropdown');
const languageSearch = document.getElementById('language-search');
const languageList = document.getElementById('language-list');
const selectedLanguageEl = document.getElementById('selected-language');

let currentLanguage = 'Korean';
let allCountries = [];

// Country code to flag emoji mapping
const countryFlags = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹',
    'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'TH': '🇹🇭',
    'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'MY': '🇲🇾', 'SG': '🇸🇬',
    'RU': '🇷🇺', 'PL': '🇵🇱', 'UA': '🇺🇦', 'TR': '🇹🇷', 'GR': '🇬🇷',
    'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪',
    'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IS': '🇮🇸', 'IE': '🇮🇪',
    'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'ZA': '🇿🇦',
    'NG': '🇳🇬', 'KE': '🇰🇪', 'ET': '🇪🇹', 'MA': '🇲🇦', 'DZ': '🇩🇿',
    'AF': '🇦🇫', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'NP': '🇳🇵',
    'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦', 'TW': '🇹🇼', 'HK': '🇭🇰',
    'IR': '🇮🇷', 'IQ': '🇮🇶', 'SY': '🇸🇾', 'JO': '🇯🇴', 'LB': '🇱🇧',
    'KW': '🇰🇼', 'QA': '🇶🇦', 'AL': '🇦🇱', 'BG': '🇧🇬', 'HR': '🇭🇷',
    'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴', 'RS': '🇷🇸', 'SK': '🇸🇰',
    'SI': '🇸🇮', 'EE': '🇪🇪', 'LV': '🇱🇻', 'LT': '🇱🇹', 'CU': '🇨🇺',
    'PE': '🇵🇪', 'VE': '🇻🇪', 'UY': '🇺🇾', 'UZ': '🇺🇿', 'KZ': '🇰🇿',
    'MN': '🇲🇳', 'YE': '🇾🇪', 'ZW': '🇿🇼', 'LU': '🇱🇺'
};

// Initialize language selector
function initLanguageSelector() {
    if (typeof CountryLanguageService !== 'undefined') {
        allCountries = CountryLanguageService.getAllCountries();
        renderLanguageList(allCountries);
    }
}

// Render language list
function renderLanguageList(countries) {
    languageList.innerHTML = '';

    countries.forEach(country => {
        const item = document.createElement('div');
        item.className = 'language-item';

        const flag = countryFlags[country.code] || '🌐';
        const mainLanguage = country.languages[0];

        item.innerHTML = `
            <span class="flag">${flag}</span>
            <span class="country-name">${country.country}</span>
            <span class="lang-code">${country.code}</span>
        `;

        item.addEventListener('click', () => {
            selectLanguage(country.country, mainLanguage, flag);
        });

        languageList.appendChild(item);
    });
}

// Get translation for current language (fallback to English)
function getTranslation(key) {
    const lang = translations[currentLanguage] || translations['English'];
    return lang[key] || translations['English'][key];
}

// Get menu name translation
function getMenuTranslation(menuKey) {
    const lang = menuTranslations[currentLanguage] || menuTranslations['English'];
    return lang[menuKey] || menuTranslations['English'][menuKey];
}

// Apply translations to all UI elements
function applyTranslations() {
    const t = translations[currentLanguage] || translations['English'];

    // Update page title
    document.title = t.title;

    // Update header
    const headerH1 = document.querySelector('header h1');
    if (headerH1) {
        headerH1.innerHTML = `<span class="icon-header">🍽️</span> ${t.title}`;
    }

    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t.subtitle;

    // Update recommendation section
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles[0]) sectionTitles[0].textContent = t.todayRecommendation;
    if (sectionTitles[1]) sectionTitles[1].textContent = t.partnershipTitle;

    // Update menu recommendation placeholder
    const menuRec = document.getElementById('menu-recommendation');
    if (menuRec && menuRec.textContent === 'Click the button below!' ||
        menuRec && !menuRec.dataset.hasRecommendation) {
        menuRec.textContent = t.clickButton;
    }

    // Update recommend button
    const btnText = recommendBtn.querySelector('.btn-text');
    if (btnText) {
        if (btnText.textContent.includes('Loading') || btnText.textContent.includes('로딩') ||
            btnText.textContent.includes('読み込み') || btnText.textContent.includes('加载')) {
            btnText.textContent = t.loadingImage;
        } else if (btnText.textContent.includes('Another') || btnText.textContent.includes('다른') ||
                   btnText.textContent.includes('別') || btnText.textContent.includes('換')) {
            btnText.textContent = t.getAnother;
        } else {
            btnText.textContent = t.getRecommendation;
        }
    }

    // Update contact section
    const contactDesc = document.querySelector('.contact-desc');
    if (contactDesc) contactDesc.textContent = t.partnershipDesc;

    // Update form labels and placeholders
    const labelTexts = document.querySelectorAll('.label-text');
    if (labelTexts[0]) labelTexts[0].textContent = t.email;
    if (labelTexts[1]) labelTexts[1].textContent = t.message;

    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) emailInput.placeholder = t.emailPlaceholder;

    const messageTextarea = document.querySelector('textarea[name="message"]');
    if (messageTextarea) messageTextarea.placeholder = t.messagePlaceholder;

    // Update submit button
    const submitBtn = document.querySelector('.submit-btn span');
    if (submitBtn) submitBtn.textContent = t.sendMessage;

    // Update footer
    const footer = document.querySelector('footer p');
    if (footer) footer.textContent = t.footer;

    // Update search placeholder
    const searchInput = document.getElementById('language-search');
    if (searchInput) searchInput.placeholder = t.searchLanguages;
}

// Select language
function selectLanguage(country, language, flag) {
    currentLanguage = language;

    // Update the language bar to show flag and language name immediately
    const iconSpan = languageBtn.querySelector('.icon');
    iconSpan.textContent = flag;
    selectedLanguageEl.textContent = language;

    languageSelector.classList.remove('active');

    // Apply translations to the entire page
    applyTranslations();

    // Show notification
    const t = translations[currentLanguage] || translations['English'];
    showNotification(`${t.selected}: ${country} - ${language}`, flag);
}

// Show notification
function showNotification(message, flag) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--control-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 16px 24px;
        box-shadow: 0 8px 30px var(--shadow-color);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-color);
        font-size: 0.95rem;
    `;
    notification.innerHTML = `<span style="font-size: 1.3rem;">${flag}</span><span>${message}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Toggle language dropdown
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageSelector.classList.toggle('active');
    if (languageSelector.classList.contains('active')) {
        languageSearch.focus();
    }
});

// Search languages
languageSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allCountries.filter(country =>
        country.country.toLowerCase().includes(searchTerm) ||
        country.languages.some(lang => lang.toLowerCase().includes(searchTerm)) ||
        country.code.toLowerCase().includes(searchTerm)
    );
    renderLanguageList(filtered);
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!languageSelector.contains(e.target)) {
        languageSelector.classList.remove('active');
    }
});

// Prevent dropdown from closing when clicking inside
languageDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Menu Recommendation
document.getElementById('recommend-btn').addEventListener('click', async () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    const recommendedMenu = dinnerMenus[randomIndex];
    const t = translations[currentLanguage] || translations['English'];

    // Display menu name based on selected language
    const menuText = getMenuTranslation(recommendedMenu.key);

    // Update menu text with animation
    menuRecommendation.style.opacity = '0';
    setTimeout(() => {
        menuRecommendation.textContent = menuText;
        menuRecommendation.dataset.hasRecommendation = 'true';
        menuRecommendation.style.opacity = '1';
    }, 200);

    // Show loading state
    recommendBtn.disabled = true;
    recommendBtn.innerHTML = `<span class="btn-icon">⏳</span><span class="btn-text">${t.loadingImage}</span>`;
    menuImage.style.opacity = '0.5';

    // Preload image to avoid flashing
    const img = new Image();
    img.onload = () => {
        menuImage.src = recommendedMenu.image;
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = `<span class="btn-icon">🎲</span><span class="btn-text">${t.getAnother}</span>`;
    };
    img.onerror = () => {
        console.error('Error loading image for:', recommendedMenu.key);
        menuImage.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = `<span class="btn-icon">🎲</span><span class="btn-text">${t.getAnother}</span>`;
    };
    img.src = recommendedMenu.image;
});

// Theme Toggle
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const t = translations[currentLanguage] || translations['English'];
    const isLight = document.body.classList.contains('light-mode');
    showNotification(isLight ? t.lightMode : t.darkMode, isLight ? '☀️' : '🌙');
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize
initLanguageSelector();