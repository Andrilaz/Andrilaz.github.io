// ==========================================
// 1. ТЕМНАЯ ТЕМА (Работает на всех страницах)
// ==========================================
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

// Проверяем, есть ли вообще кнопка на странице (чтобы скрипт не ломался)
if (themeBtn) {
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-theme');
        themeBtn.textContent = '☀️';
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeBtn.textContent = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeBtn.textContent = '🌙';
        }
    });
}

// ==========================================
// 2. ЗУМ КАРТИНОК (Работает только в статьях)
// ==========================================
const modal = document.getElementById('imgModal');

// Если модальное окно есть на странице, запускаем логику зума
if (modal) {
    const modalImg = document.getElementById('zoomedImg');
    const images = document.querySelectorAll('.content img'); 
    const closeModal = document.querySelector('.close-modal');

    images.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.src; 
        });
    });

    const closeImage = () => modal.style.display = 'none';

    closeModal.addEventListener('click', closeImage);
    modal.addEventListener('click', e => { if (e.target !== modalImg) closeImage(); });
    document.addEventListener('keydown', e => { if (e.key === "Escape" && modal.style.display === 'block') closeImage(); });
}

// ==========================================
// 3. ПОДСВЕТКА МЕНЮ ПРИ СКРОЛЛЕ (Только в статьях)
// ==========================================
const tocLinks = document.querySelectorAll('.toc-list a');

// Если боковое меню есть на странице, запускаем наблюдатель
if (tocLinks.length > 0) {
    const observerOptions = {
        root: null,
        rootMargin: '-50px 0px -70% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(link => link.classList.remove('active'));
                
                const activeId = entry.target.id;
                const activeLink = document.querySelector(`.toc-list a[href="#${activeId}"]`);
                
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.content h2[id]').forEach(section => observer.observe(section));
}