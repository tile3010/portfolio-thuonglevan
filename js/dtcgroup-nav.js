document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".dashboard-nav");
    if (!nav) return;

    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const moveIndicator = link => {
        if (!link) return;
        const navRect = nav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        nav.style.setProperty("--dtc-indicator-left", `${linkRect.left - navRect.left + nav.scrollLeft}px`);
        nav.style.setProperty("--dtc-indicator-top", `${linkRect.bottom - navRect.top + 2}px`);
        nav.style.setProperty("--dtc-indicator-width", `${linkRect.width}px`);
        nav.style.setProperty("--dtc-indicator-opacity", "1");
        link.classList.add("active");
        links.filter(item => item !== link).forEach(item => item.classList.remove("active"));
    };

    const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) moveIndicator(links.find(link => link.hash === `#${visible.target.id}`));
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .15, .35, .6] });

    sections.forEach(section => observer.observe(section));
    links.forEach(link => link.addEventListener("click", () => moveIndicator(link)));
    window.addEventListener("resize", () => moveIndicator(links.find(link => link.classList.contains("active"))), { passive: true });
    moveIndicator(links.find(link => link.hash === location.hash) || links.find(link => link.hash === "#overview"));
});
