(function () {
    "use strict";

    // ===== LANGUAGE SYSTEM =====
    function switchLanguage(targetLang) {
        if (!targetLang || (targetLang !== "id" && targetLang !== "en")) return;
        localStorage.setItem("danuxy_lang", targetLang);
        document.cookie = "danuxy_lang=" + targetLang + "; Path=/; Max-Age=31536000; SameSite=Lax";

        var url = new URL(window.location.href);
        url.searchParams.set("lang", targetLang);
        window.location.href = url.toString();
    }

    function initLanguage() {
        var currentHtmlLang = document.documentElement.lang || "id";
        var savedLang = localStorage.getItem("danuxy_lang");

        if (savedLang && (savedLang === "id" || savedLang === "en")) {
            if (savedLang !== currentHtmlLang) {
                document.cookie = "danuxy_lang=" + savedLang + "; Path=/; Max-Age=31536000; SameSite=Lax";
                var url = new URL(window.location.href);
                if (url.searchParams.get("lang") !== savedLang) {
                    url.searchParams.set("lang", savedLang);
                    window.location.replace(url.toString());
                    return;
                }
            }
        } else {
            // First time visitor: Auto-detect from browser/system language
            var browserLang = (navigator.language || navigator.userLanguage || "id").toLowerCase();
            var detected = browserLang.startsWith("en") ? "en" : "id";
            localStorage.setItem("danuxy_lang", detected);

            if (detected !== currentHtmlLang) {
                document.cookie = "danuxy_lang=" + detected + "; Path=/; Max-Age=31536000; SameSite=Lax";
                var autoUrl = new URL(window.location.href);
                autoUrl.searchParams.set("lang", detected);
                window.location.replace(autoUrl.toString());
                return;
            }
        }

        // Attach click listeners to language switch buttons
        var langBtns = document.querySelectorAll(".lang-btn");
        langBtns.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                var target = this.getAttribute("data-lang");
                switchLanguage(target);
            });
        });
    }

    // ===== THEME SYSTEM =====
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

    // ===== MOBILE NAV =====
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

    // Close menu on Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            toggleMenu(false);
        }
    });

    // ===== SCROLL ANIMATIONS =====
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

    // ===== COOKIE CONSENT =====
    function initCookieConsent() {
        var banner = document.getElementById("cookieConsent");
        var acceptBtn = document.getElementById("cookieAccept");
        if (!banner) return;

        var consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setTimeout(function () {
                banner.classList.add("show");
            }, 1500);
        }

        if (acceptBtn) {
            acceptBtn.addEventListener("click", function () {
                localStorage.setItem("cookie_consent", "accepted");
                banner.classList.remove("show");
            });
        }
    }

    // ===== HEADER SCROLL SHADOW =====
    var header = document.getElementById("header");
    window.addEventListener("scroll", function () {
        if (!header) return;
        var currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.08)";
        } else {
            header.style.boxShadow = "none";
        }
    }, { passive: true });

    // ===== CYBER-LUMINOUS HERO ANIMATION (INSPIRED BY DANUXY VIDEO CONCEPT) =====
    function initCyberHeroCanvas() {
        var canvas = document.getElementById("heroCyberCanvas");
        if (!canvas) return;

        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Check reduced motion preference
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        var width, height, dpr;
        var animationFrameId = null;
        var isVisible = true;
        var mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

        function resize() {
            var rect = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }

        resize();
        window.addEventListener("resize", resize, { passive: true });

        // Mouse tracking for parallax
        window.addEventListener("mousemove", function (e) {
            var rect = canvas.getBoundingClientRect();
            if (e.clientY <= rect.bottom && e.clientY >= rect.top) {
                mouse.targetX = e.clientX - rect.left;
                mouse.targetY = e.clientY - rect.top;
            }
        }, { passive: true });

        // Cyber light beams (curved energy streaks)
        var beams = [];
        var numBeams = 5;
        for (var i = 0; i < numBeams; i++) {
            beams.push({
                yOffset: (height * 0.3) + (i * 70),
                speed: 0.0008 + (i * 0.0003),
                amplitude: 45 + (i * 15),
                frequency: 0.0018 + (i * 0.0005),
                phase: i * 1.3,
                sparkPos: (i * 0.2) % 1,
                sparkSpeed: 0.003 + (i * 0.001),
                color: i % 2 === 0 ? "rgba(0, 240, 255, " : "rgba(56, 189, 248, "
            });
        }

        // Ambient cyber sparks
        var sparks = [];
        var numSparks = 28;
        for (var s = 0; s < numSparks; s++) {
            sparks.push({
                x: Math.random() * (width || 800),
                y: Math.random() * (height || 500),
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.4 - 0.1,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                color: Math.random() > 0.4 ? "rgba(0, 240, 255," : "rgba(99, 102, 241,"
            });
        }

        var time = 0;

        function draw() {
            if (!isVisible) return;

            time += 1;
            ctx.clearRect(0, 0, width, height);

            // Smooth mouse interpolation
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            // 1. Draw glowing silky cyber waves at the bottom
            var waveGlow = ctx.createLinearGradient(0, height * 0.5, 0, height);
            waveGlow.addColorStop(0, "rgba(2, 6, 23, 0)");
            waveGlow.addColorStop(0.7, "rgba(14, 165, 233, 0.04)");
            waveGlow.addColorStop(1, "rgba(59, 130, 246, 0.08)");

            ctx.fillStyle = waveGlow;
            ctx.beginPath();
            ctx.moveTo(0, height);
            for (var x = 0; x <= width; x += 30) {
                var waveY = height - 55 + Math.sin(x * 0.004 + time * 0.015) * 18 + Math.cos(x * 0.002 - time * 0.01) * 12;
                ctx.lineTo(x, waveY);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            // 2. Draw curved cyber light beams with energy pulses
            beams.forEach(function (b, idx) {
                ctx.beginPath();
                var startY = b.yOffset + Math.sin(time * b.speed * 20 + b.phase) * b.amplitude;

                var points = [];
                for (var px = 0; px <= width; px += 40) {
                    var py = b.yOffset +
                        Math.sin(px * b.frequency + time * b.speed * 15 + b.phase) * b.amplitude +
                        Math.cos((px * 0.001) + time * 0.005) * 15;

                    // Mouse gentle repulsion
                    if (mouse.x > 0) {
                        var dx = px - mouse.x;
                        var dy = py - mouse.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 180) {
                            var force = (1 - dist / 180) * 22;
                            py += dy > 0 ? force : -force;
                        }
                    }
                    points.push({ x: px, y: py });
                }

                if (points.length > 0) {
                    ctx.moveTo(points[0].x, points[0].y);
                    for (var p = 1; p < points.length; p++) {
                        ctx.lineTo(points[p].x, points[p].y);
                    }

                    // Stroke glow
                    var beamGrad = ctx.createLinearGradient(0, 0, width, 0);
                    beamGrad.addColorStop(0, "rgba(14, 165, 233, 0)");
                    beamGrad.addColorStop(0.2, b.color + "0.15)");
                    beamGrad.addColorStop(0.5, b.color + "0.35)");
                    beamGrad.addColorStop(0.8, b.color + "0.15)");
                    beamGrad.addColorStop(1, "rgba(59, 130, 246, 0)");

                    ctx.strokeStyle = beamGrad;
                    ctx.lineWidth = 1.6;
                    ctx.shadowColor = "rgba(0, 240, 255, 0.4)";
                    ctx.shadowBlur = 8;
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // Fast laser spark travelling along this curve
                    b.sparkPos = (b.sparkPos + b.sparkSpeed) % 1;
                    var sparkIndex = Math.floor(b.sparkPos * (points.length - 1));
                    if (points[sparkIndex]) {
                        var sp = points[sparkIndex];
                        var sparkGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 14);
                        sparkGrad.addColorStop(0, "#ffffff");
                        sparkGrad.addColorStop(0.3, "rgba(0, 240, 255, 0.9)");
                        sparkGrad.addColorStop(1, "rgba(0, 240, 255, 0)");

                        ctx.fillStyle = sparkGrad;
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 10, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            // 3. Draw ambient cyber particles (sparks)
            sparks.forEach(function (s) {
                s.x += s.vx;
                s.y += s.vy;
                if (s.y < 0) { s.y = height; s.x = Math.random() * width; }
                if (s.x < 0) s.x = width;
                if (s.x > width) s.x = 0;

                ctx.fillStyle = s.color + (s.alpha * 0.7) + ")";
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        }

        // Pause animation when hero leaves viewport for max efficiency
        if ("IntersectionObserver" in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    isVisible = entry.isIntersecting;
                    if (isVisible && !animationFrameId) {
                        animationFrameId = requestAnimationFrame(draw);
                    }
                });
            }, { threshold: 0.05 });
            observer.observe(canvas.parentElement || canvas);
        }

        animationFrameId = requestAnimationFrame(draw);
    }

    // ===== IMAGE LIGHTBOX MODAL (NO REDIRECT / PREVIEW FULLSCREEN) =====
    function initImageLightbox() {
        var lightbox = document.getElementById("imageLightbox");
        if (!lightbox) return;

        var lightboxImg = document.getElementById("lightboxImg");
        var lightboxCaption = document.getElementById("lightboxCaption");
        var overlay = document.getElementById("lightboxOverlay");
        var closeBtn = document.getElementById("lightboxClose");

        function openLightbox(src, caption) {
            if (!src) return;
            lightboxImg.src = src;
            lightboxImg.alt = caption || "Screenshot preview";
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
            }, 250);
        }

        // Delegate click for any .lightbox-trigger element
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

        // Trigger on Enter or Space for accessibility
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

        if (overlay) overlay.addEventListener("click", closeLightbox);
        if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

        // Escape key closes modal
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && lightbox.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    // ===== INIT =====
    document.addEventListener("DOMContentLoaded", function () {
        initLanguage();
        initScrollAnimations();
        initCookieConsent();
        initCyberHeroCanvas();
        initImageLightbox();
    });
})();
