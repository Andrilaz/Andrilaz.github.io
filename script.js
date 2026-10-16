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
// 2. ПРОСМОТР И ЗУМ КАРТИНОК
// ==========================================
const modal = document.getElementById('imgModal');

if (modal) {
    const modalImg = document.getElementById('zoomedImg');
    const images = document.querySelectorAll('.content img, .container img'); 
    const closeModal = document.querySelector('.close-modal');

    // Создаём панель управления зумом, если её нет в DOM
    let toolbar = modal.querySelector('.modal-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'modal-toolbar';
        toolbar.innerHTML = `
            <button type="button" class="modal-btn" id="modalZoomOut" title="Уменьшить">−</button>
            <button type="button" class="modal-btn modal-zoom-val" id="modalZoomReset" title="Сбросить масштаб">100%</button>
            <button type="button" class="modal-btn" id="modalZoomIn" title="Увеличить">+</button>
        `;
        modal.appendChild(toolbar);
    }

    const btnZoomIn = document.getElementById('modalZoomIn');
    const btnZoomOut = document.getElementById('modalZoomOut');
    const btnZoomReset = document.getElementById('modalZoomReset');

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let hasMoved = false;

    // Сенсорные переменные (pinch zoom & double tap)
    let initialPinchDistance = 0;
    let initialPinchScale = 1;
    let lastTapTime = 0;

    const applyTransform = (smooth = true) => {
        if (smooth) {
            modalImg.classList.remove('dragging');
        } else {
            modalImg.classList.add('dragging');
        }
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        if (btnZoomReset) {
            btnZoomReset.textContent = `${Math.round(scale * 100)}%`;
        }
        if (scale > 1) {
            modalImg.style.cursor = isDragging ? 'grabbing' : 'grab';
        } else {
            modalImg.style.cursor = 'zoom-in';
        }
    };

    const resetZoom = () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        isDragging = false;
        applyTransform(true);
    };

    const setScale = (newScale) => {
        scale = Math.min(Math.max(1, newScale), 4);
        if (scale === 1) {
            translateX = 0;
            translateY = 0;
        }
        applyTransform(true);
    };

    // Открытие модального окна (центрированное)
    images.forEach(img => {
        img.addEventListener('click', function() {
            resetZoom();
            modal.style.display = 'flex';
            modalImg.src = this.src; 
        });
    });

    const closeImage = () => {
        modal.style.display = 'none';
        resetZoom();
    };

    closeModal.addEventListener('click', closeImage);
    document.addEventListener('keydown', e => { 
        if (e.key === "Escape" && modal.style.display === 'flex') {
            closeImage();
        }
    });

    // Клик по тёмному фону закрывает окно (если не клик по картинке или тулбару)
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            closeImage();
        }
    });

    // Кнопки тулбара
    btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        setScale(scale + 0.5);
    });

    btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        setScale(scale - 0.5);
    });

    btnZoomReset.addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoom();
    });

    // Зум колёсиком мыши (ПК)
    modal.addEventListener('wheel', (e) => {
        if (modal.style.display !== 'flex') return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setScale(scale + delta);
    }, { passive: false });

    // Клик по картинке (переключение зума 1x <-> 2.2x)
    modalImg.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hasMoved) return; // Если перетаскивали, не сбрасываем зум
        if (scale === 1) {
            setScale(2.2);
        } else {
            resetZoom();
        }
    });

    // Перетаскивание мышью (Pan)
    modalImg.addEventListener('mousedown', (e) => {
        if (scale <= 1) return;
        e.preventDefault();
        isDragging = true;
        hasMoved = false;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        applyTransform(false);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        hasMoved = true;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyTransform(false);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            applyTransform(true);
        }
    });

    // Тач-события для мобильных устройств (Pinch to zoom + Pan + Double tap)
    const getTouchDistance = (t1, t2) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    modalImg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Начало щипка двумя пальцами (Pinch)
            initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
            initialPinchScale = scale;
        } else if (e.touches.length === 1) {
            // Одиночное касание (Pan или Double tap)
            const now = Date.now();
            if (now - lastTapTime < 300) {
                // Двойной тап: переключение зума
                e.preventDefault();
                if (scale === 1) {
                    setScale(2.2);
                } else {
                    resetZoom();
                }
            }
            lastTapTime = now;

            if (scale > 1) {
                isDragging = true;
                hasMoved = false;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
            }
        }
    }, { passive: false });

    modalImg.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            // Масштабирование щипком пальцев
            e.preventDefault();
            const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
            if (initialPinchDistance > 0) {
                const ratio = currentDist / initialPinchDistance;
                setScale(initialPinchScale * ratio);
            }
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            // Перетаскивание одним пальцем
            e.preventDefault();
            hasMoved = true;
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            applyTransform(false);
        }
    }, { passive: false });

    modalImg.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialPinchDistance = 0;
        }
        if (e.touches.length === 0) {
            isDragging = false;
            applyTransform(true);
        }
    });
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