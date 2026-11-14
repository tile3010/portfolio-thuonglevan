(() => {
    const carousel = document.querySelector('[data-wingolf-carousel]');
    if (!carousel) return;

    const slides = [...carousel.querySelectorAll('[data-slide]')];
    const selectors = [...carousel.querySelectorAll('[data-slide-to]')];
    const count = carousel.querySelector('[data-slide-count]');
    let active = 0;

    const showSlide = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            const selected = i === active;
            slide.hidden = !selected;
            slide.classList.toggle('is-active', selected);
        });
        selectors.forEach((button) => {
            const selected = Number(button.dataset.slideTo) === active;
            button.setAttribute('aria-selected', String(selected));
            if (button.closest('.wingolf-carousel-tabs')) button.tabIndex = selected ? 0 : -1;
        });
        if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    selectors.forEach((button) => button.addEventListener('click', () => showSlide(Number(button.dataset.slideTo))));
    carousel.querySelector('[data-slide-prev]')?.addEventListener('click', () => showSlide(active - 1));
    carousel.querySelector('[data-slide-next]')?.addEventListener('click', () => showSlide(active + 1));
    carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(active - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(active + 1); }
    });
    showSlide(active);
})();
