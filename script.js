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

if (tocLinks.length > 0) {
    // МАГИЯ ЗДЕСЬ: Мы собираем только те заголовки, на которые реально есть ссылки в меню
    const headings = Array.from(tocLinks)
        .map(link => {
            const id = link.getAttribute('href'); // Получаем href (например, "#History")
            return document.querySelector(id); // Ищем элемент с таким ID на странице
        })
        .filter(el => el !== null); // Отбрасываем пустые (если вдруг опечатка в ссылке)

    if (headings.length > 0) {
        const highlightMenu = () => {
            let currentId = headings[0].id; // По умолчанию светится первый пункт

            headings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                // 150px - граница. Если нужный заголовок выше нее, он считается "текущим"
                if (rect.top <= 150) {
                    currentId = heading.id;
                }
            });

            // Перекрашиваем меню
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', highlightMenu);
        highlightMenu();
    }
}