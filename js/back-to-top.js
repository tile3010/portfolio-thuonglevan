const firstPageSection = document.querySelector("main section");

if (firstPageSection) {
    const backToTopButton = document.createElement("button");
    backToTopButton.className = "back-to-top";
    backToTopButton.type = "button";
    backToTopButton.setAttribute("aria-label", "Back to top");
    backToTopButton.setAttribute("aria-hidden", "true");
    backToTopButton.tabIndex = -1;
    backToTopButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m6 14 6-6 6 6" />
        </svg>
    `;
    document.body.append(backToTopButton);

    function updateBackToTopVisibility() {
        const stickyHeader = document.querySelector("body > header");
        const headerHeight = stickyHeader?.getBoundingClientRect().height ?? 0;
        const shouldShow = firstPageSection.getBoundingClientRect().bottom <= headerHeight + 20;

        backToTopButton.classList.toggle("is-visible", shouldShow);
        backToTopButton.setAttribute("aria-hidden", String(!shouldShow));
        backToTopButton.tabIndex = shouldShow ? 0 : -1;
    }

    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    window.addEventListener("resize", updateBackToTopVisibility);
    updateBackToTopVisibility();

    backToTopButton.addEventListener("click", () => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
}
