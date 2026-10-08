(function () {
    "use strict";

    // Language system
    function switchLanguage(targetLang) {
        if (!targetLang || (targetLang !== "id" && targetLang !== "en")) return;
        localStorage.setItem("danuxy_lang", targetLang);
        document.cookie = "danuxy_lang=" + targetLang + "; Path=/; Max-Age=31536000; SameSite=Lax";

        var url = new URL(window.location.href);
        url.searchParams.set("lang", targetLang);

        var bar = document.getElementById("pageProgressBar");
        if (bar) {
            bar.classList.remove("complete", "fade-out");
            bar.classList.add("active");
        }
        document.body.classList.add("page-is-exiting");

        setTimeout(function () {
            window.location.href = url.toString();
        }, 120);
    }

    function initLanguage() {
        var currentHtmlLang = document.documentElement.lang || "id";
        localStorage.setItem("danuxy_lang", currentHtmlLang);
        document.cookie = "danuxy_lang=" + currentHtmlLang + "; Path=/; Max-Age=31536000; SameSite=Lax";

        var langBtns = document.querySelectorAll(".lang-btn");
        langBtns.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                var target = this.getAttribute("data-lang");
                switchLanguage(target);
            });
        });
    }

    // Theme system
    var themeToggleBtn = document.getElementById("themeToggle");
    var themeIcon = document.getElementById("themeIcon");

    function getPreferredTheme() {
        var saved = localStorage.getItem("theme");
        if (saved) return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        if (themeIcon) {
            themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
        }
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
        }
    }

    setTheme(getPreferredTheme());

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "dark" : "light");
        }
    });

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", function () {
            var current = document.documentElement.getAttribute("data-theme") || "light";
            setTheme(current === "dark" ? "light" : "dark");
        });
    }

    // Mobile navigation
    var hamburger = document.getElementById("hamburger");
    var navMobile = document.getElementById("navMobile");
    var overlay = document.getElementById("navOverlay");

    function toggleMenu(open) {
        if (!navMobile || !overlay) return;
        var isOpen = open !== undefined ? open : !navMobile.classList.contains("open");
        if (isOpen) {
            navMobile.classList.add("open");
            overlay.classList.add("active");
            document.body.style.overflow = "hidden";
            if (hamburger) hamburger.setAttribute("aria-expanded", "true");
        } else {
            navMobile.classList.remove("open");
            overlay.classList.remove("active");
            document.body.style.overflow = "";
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

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            toggleMenu(false);
        }
    });

    // Scroll observer
    function initScrollAnimations() {
        var fadeEls = document.querySelectorAll(".fade-up");
        if (!fadeEls.length) return;

        if ("IntersectionObserver" in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

            fadeEls.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            fadeEls.forEach(function (el) {
                el.classList.add("visible");
            });
        }
    }

    // Cookie consent
    function initCookieConsent() {
        var banner = document.getElementById("cookieConsent");
        var acceptBtn = document.getElementById("cookieAccept");
        if (!banner) return;

        var consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setTimeout(function () {
                banner.classList.add("show");
            }, 1200);
        }

        if (acceptBtn) {
            acceptBtn.addEventListener("click", function () {
                localStorage.setItem("cookie_consent", "accepted");
                banner.classList.remove("show");
            });
        }
    }

    // Header shadow on scroll
    var header = document.getElementById("header");
    window.addEventListener("scroll", function () {
        if (!header) return;
        var currentScroll = window.pageYOffset;
        if (currentScroll > 40) {
            header.style.boxShadow = "0 2px 16px rgba(0,0,0,0.1)";
        } else {
            header.style.boxShadow = "none";
        }
    }, { passive: true });

    // Lightbox modal
    function initImageLightbox() {
        var lightbox = document.getElementById("imageLightbox");
        if (!lightbox) return;

        var lightboxImg = document.getElementById("lightboxImg");
        var lightboxCaption = document.getElementById("lightboxCaption");
        var overlayEl = document.getElementById("lightboxOverlay");
        var closeBtn = document.getElementById("lightboxClose");

        function openLightbox(src, caption) {
            if (!src) return;
            lightboxImg.src = src;
            lightboxImg.alt = caption || "Preview";
            if (lightboxCaption) {
                lightboxCaption.textContent = caption || "";
                lightboxCaption.style.display = caption ? "block" : "none";
            }
            lightbox.classList.add("active");
            lightbox.setAttribute("aria-hidden", "false");
            document.body.classList.add("lightbox-open");
        }

        function closeLightbox() {
            lightbox.classList.remove("active");
            lightbox.setAttribute("aria-hidden", "true");
            document.body.classList.remove("lightbox-open");
            setTimeout(function () {
                if (!lightbox.classList.contains("active")) {
                    lightboxImg.src = "";
                }
            }, 200);
        }

        document.addEventListener("click", function (e) {
            var trigger = e.target.closest(".lightbox-trigger");
            if (trigger) {
                e.preventDefault();
                var src = trigger.getAttribute("data-lightbox-src");
                var caption = trigger.getAttribute("data-lightbox-caption") || "";
                if (!src) {
                    var img = trigger.querySelector("img");
                    if (img) src = img.src;
                }
                openLightbox(src, caption);
            }
        });

        document.addEventListener("keydown", function (e) {
            if ((e.key === "Enter" || e.key === " ") && document.activeElement && document.activeElement.classList.contains("lightbox-trigger")) {
                e.preventDefault();
                var trigger = document.activeElement;
                var src = trigger.getAttribute("data-lightbox-src");
                var caption = trigger.getAttribute("data-lightbox-caption") || "";
                if (!src) {
                    var img = trigger.querySelector("img");
                    if (img) src = img.src;
                }
                openLightbox(src, caption);
            }
        });

        if (overlayEl) overlayEl.addEventListener("click", closeLightbox);
        if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && lightbox.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    // Page Transitions & Progress Bar System
    function initPageTransitions() {
        var bar = document.getElementById("pageProgressBar");
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "pageProgressBar";
            bar.className = "page-progress-bar";
            bar.setAttribute("aria-hidden", "true");
            document.body.prepend(bar);
        }

        // Complete loading animation on page enter
        bar.classList.add("complete");
        setTimeout(function () {
            bar.classList.add("fade-out");
            setTimeout(function () {
                bar.classList.remove("active", "complete", "fade-out");
            }, 200);
        }, 80);

        // Reset if restored via browser back/forward cache (bfcache)
        window.addEventListener("pageshow", function () {
            document.body.classList.remove("page-is-exiting");
            if (bar) {
                bar.classList.remove("active", "complete", "fade-out");
            }
        });

        // Intercept internal link navigation
        document.addEventListener("click", function (e) {
            var link = e.target.closest("a");
            if (!link) return;

            // Allow default for modified clicks or right clicks
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }

            // Skip if target is outside current window
            if (link.target && link.target !== "_self") {
                return;
            }

            // Skip downloads and protocol links
            var rawHref = link.getAttribute("href");
            if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || link.hasAttribute("download")) {
                return;
            }

            var targetUrl;
            try {
                targetUrl = new URL(link.href, window.location.href);
            } catch (err) {
                return;
            }

            // Skip external links
            if (targetUrl.origin !== window.location.origin) {
                return;
            }

            // Skip same-page anchor jumps
            if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
                return;
            }

            // If mobile menu is open, close it cleanly
            if (typeof toggleMenu === "function") {
                var navMobile = document.getElementById("navMobile");
                if (navMobile && navMobile.classList.contains("open")) {
                    toggleMenu(false);
                }
            }

            // Start progress bar animation
            bar.classList.remove("complete", "fade-out");
            bar.classList.add("active");

            // Respect accessibility reduced-motion
            if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            // Trigger smooth exit transition
            e.preventDefault();
            document.body.classList.add("page-is-exiting");

            setTimeout(function () {
                window.location.href = targetUrl.href;
            }, 120);
        });
    }

    // Init
    document.addEventListener("DOMContentLoaded", function () {
        initPageTransitions();
        initLanguage();
        initScrollAnimations();
        initCookieConsent();
        initImageLightbox();
    });
})();
