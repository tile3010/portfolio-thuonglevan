const homeNav = document.querySelector("body > header:not(.project-dashboard-header) nav");

if (homeNav) {
    const homeLinks = [...homeNav.querySelectorAll('a[href^="#"]')];
    const homeSections = homeLinks
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    function setActiveHomeLink(link) {
        homeLinks.forEach(item => {
            item.classList.toggle("active", item === link);
            if (item === link) {
                item.setAttribute("aria-current", "location");
            } else {
                item.removeAttribute("aria-current");
            }
        });

        if (!link) {
            homeNav.style.removeProperty("--dtc-indicator-left");
            homeNav.style.removeProperty("--dtc-indicator-width");
            homeNav.style.removeProperty("--dtc-indicator-opacity");
            return;
        }

        const navRect = homeNav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        homeNav.style.setProperty(
            "--dtc-indicator-left",
            `${linkRect.left - navRect.left + homeNav.scrollLeft}px`
        );
        homeNav.style.setProperty("--dtc-indicator-width", `${linkRect.width}px`);
        homeNav.style.setProperty("--dtc-indicator-opacity", "1");
    }

    homeLinks.forEach(link => {
        link.addEventListener("click", () => setActiveHomeLink(link));
    });

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            const visibleSections = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visibleSections.length) return;

            const activeLink = homeLinks.find(
                link => link.getAttribute("href") === `#${visibleSections[0].target.id}`
            );
            setActiveHomeLink(activeLink);
        }, {
            rootMargin: "-40% 0px -50% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        });

        homeSections.forEach(section => sectionObserver.observe(section));
    }

    setActiveHomeLink(
        homeLinks.find(link => link.getAttribute("href") === window.location.hash) || homeLinks[0]
    );

    window.addEventListener("resize", () => {
        const activeLink = homeNav.querySelector("a.active");
        if (activeLink) setActiveHomeLink(activeLink);
    });
}
