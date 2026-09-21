(function () {
    "use strict";

    const loadingScreen = document.getElementById("loadingScreen");
    const mainContent = document.getElementById("mainContent");

    // ===== 1. LOGIKA MODE GELAP / TERANG (DARK MODE) =====
    const themeToggleBtn = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    function getPreferredTheme() {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        if (themeIcon) {
            if (theme === "dark") {
                themeIcon.className = "fas fa-sun";
                if (themeToggleBtn)
                    themeToggleBtn.setAttribute(
                        "aria-label",
                        "Ganti ke Mode Terang"
                    );
            } else {
                themeIcon.className = "fas fa-moon";
                if (themeToggleBtn)
                    themeToggleBtn.setAttribute(
                        "aria-label",
                        "Ganti ke Mode Gelap"
                    );
            }
        }
    }

    setTheme(getPreferredTheme());

    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", e => {
            if (!localStorage.getItem("theme")) {
                setTheme(e.matches ? "dark" : "light");
            }
        });

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme =
                document.documentElement.getAttribute("data-theme") || "light";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            setTheme(newTheme);
        });
    }

    // ===== 2. LOADING SCREEN =====
    window.addEventListener("load", function () {
        setTimeout(function () {
            if (loadingScreen) loadingScreen.classList.add("hidden");
            if (mainContent) {
                mainContent.style.display = "block";
                triggerScrollAnimations();
            }
        }, 500);
    });

    // ===== 3. HAMBURGER MENU =====
    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");
    const overlay = document.getElementById("navOverlay");

    function toggleMenu(open) {
        if (!nav || !overlay) return;
        const isOpen =
            open !== undefined ? open : !nav.classList.contains("open");
        if (isOpen) {
            nav.classList.add("open");
            overlay.classList.add("active");
            if (hamburger) hamburger.setAttribute("aria-expanded", "true");
        } else {
            nav.classList.remove("open");
            overlay.classList.remove("active");
            if (hamburger) hamburger.setAttribute("aria-expanded", "false");
        }
    }

    if (hamburger) {
        hamburger.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", function () {
            toggleMenu(false);
        });
    }

    // ===== 4. SCROLL ANIMATION (INTERSECTION OBSERVER) =====
    function triggerScrollAnimations() {
        const fadeEls = document.querySelectorAll(
            ".service-card, .stat, .hero__content > *"
        );

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                        }
                    });
                },
                { threshold: 0.15 }
            );

            fadeEls.forEach(function (el) {
                el.classList.add("fade-up");
                observer.observe(el);
            });
        } else {
            fadeEls.forEach(function (el) {
                el.classList.add("visible");
            });
        }
    }
})();
