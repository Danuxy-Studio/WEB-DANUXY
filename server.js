const express = require("express");
const path = require("path");
const compression = require("compression");
const { i18n, localizedProjects, localizedArticles } = require("./i18n");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable HTTP Compression (Gzip / Deflate)
app.use(compression());

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files with Cache-Control headers
app.use("/public", express.static(path.join(__dirname, "public"), {
    maxAge: "30d",
    etag: true
}));

// ===== EDGE CDN CACHING FOR VERCEL (ELIMINATES COLD START) =====
app.use(function (req, res, next) {
    if (req.method === "GET") {
        // Cache HTML at Vercel Edge for 24h, browser for 1h, with 7 days stale-while-revalidate
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    }
    next();
});

// ===== LANGUAGE DETECTION MIDDLEWARE =====
function getCookie(req, name) {
    if (!req.headers.cookie) return null;
    const match = req.headers.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

app.use(function (req, res, next) {
    let lang = "id"; // Default fallback
    const queryLang = req.query.lang ? String(req.query.lang).toLowerCase() : null;
    const cookieLang = getCookie(req, "danuxy_lang");

    if (queryLang === "en" || queryLang === "id") {
        lang = queryLang;
        res.setHeader("Set-Cookie", "danuxy_lang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax");
    } else if (cookieLang === "en" || cookieLang === "id") {
        lang = cookieLang;
    } else if (req.headers["accept-language"]) {
        const accept = req.headers["accept-language"].toLowerCase();
        const idIndex = accept.indexOf("id");
        const enIndex = accept.indexOf("en");
        if (enIndex !== -1 && (idIndex === -1 || enIndex < idIndex)) {
            lang = "en";
        }
    }

    const t = i18n[lang] || i18n.id;
    const projects = localizedProjects[lang] || localizedProjects.id;
    const articles = localizedArticles[lang] || localizedArticles.id;

    res.locals.lang = lang;
    res.locals.t = t;
    res.locals.site = t.site;
    res.locals.projects = projects;
    res.locals.articles = articles;
    res.locals.currentUrl = req.originalUrl;

    next();
});

// JSON-LD generators
function getOrganizationJsonLd(site) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": site.name,
        "url": site.url,
        "logo": "https://danuxy.com/public/images/logo-icon.png",
        "description": site.description,
        "email": "contact@danuxy.com",
        "sameAs": [
            "https://youtube.com/@nuxymc",
            "https://tiktok.com/@danuxy.com",
            "https://www.instagram.com/danuxy_digital",
            "https://github.com/Danuxy-Studio"
        ],
        "knowsAbout": [
            "Web Development",
            "WhatsApp Automation",
            "Minecraft Plugins",
            "Minecraft Server Optimization",
            "Java Development",
            "Paper Spigot Plugins",
            "SaaS Engineering"
        ]
    };
}

function getWebSiteJsonLd(site) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": site.name,
        "url": site.url,
        "description": site.description,
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://danuxy.com/blog?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
}

function getSoftwareAppsJsonLd() {
    return [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DanuxyCore",
            "operatingSystem": "Minecraft Paper 1.21.8+, Purpur, Spigot, Velocity, GeyserMC",
            "applicationCategory": "GameApplication",
            "description": "Cross-platform Minecraft server plugin featuring Dual Native GUI: Modern Custom Dialog GUI for Java 1.21.8+ and Native Form UI for Bedrock without client mods.",
            "url": "https://danuxy.com/minecraft",
            "featureList": [
                "Dual Native GUI System for /warp, /home, /tp",
                "Java 1.21.8+ Modern Dialog UI with dynamic tooltips",
                "Bedrock Edition Native Modal Form UI",
                "Zero Client Mod (100% Vanilla Server-Side)",
                "Real-time Cross-Play sync via Geyser and Floodgate"
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NIXI",
            "operatingSystem": "Web, Cloud",
            "applicationCategory": "CommunicationApplication",
            "description": "Autonomous WhatsApp Gateway platform enabling users to connect their numbers via QR Code or 8-digit Pairing Code with isolated bot runtimes.",
            "url": "https://nixi.danuxy.com",
            "featureList": [
                "Multi-device pairing via QR Code and 8-Digit Pairing Code",
                "Isolated private bot instance per user",
                "Centralized web dashboard and logs",
                "Metered usage credit system"
            ]
        }
    ];
}

function getFaqJsonLd(lang) {
    if (lang === "en") {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What is Danuxy Studio?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Danuxy Studio is a digital engineering boutique studio developing modern SaaS platforms like NIXI, cross-platform Minecraft plugins like DanuxyCore, and bespoke web applications."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is DanuxyCore for Minecraft servers?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "DanuxyCore is a high-performance cross-platform Minecraft plugin engineered with Dual Native GUI. It renders modern custom dialog screens on Java Edition 1.21.8+ and native form interfaces on Bedrock Edition for /warp, /home, and server navigation with zero client mods."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How does WhatsApp pairing work on NIXI?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "NIXI provides flexible pairing options: scan the official WhatsApp Web QR code or enter an 8-digit pairing code directly without using a camera."
                    }
                }
            ]
        };
    }
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Apa itu Danuxy Studio?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Danuxy Studio adalah studio engineering digital yang membangun solusi software modern, platform WhatsApp SaaS NIXI, ekosistem plugin Minecraft DanuxyCore, dan jasa pembuatan website profesional."
                }
            },
            {
                "@type": "Question",
                "name": "Apa itu plugin Minecraft DanuxyCore?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "DanuxyCore adalah plugin server Minecraft cross-platform dengan sistem Dual Native GUI: menghadirkan Custom Dialog GUI modern untuk Java Edition 1.21.8+ dan Form UI native untuk Bedrock Edition untuk navigasi /warp, /home, dan /tp tanpa perlu mod di sisi klien."
                }
            },
            {
                "@type": "Question",
                "name": "Bagaimana cara koneksi WhatsApp di platform NIXI?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "NIXI mendukung dua metode koneksi resmi yang fleksibel: scan QR Code WhatsApp Web atau menggunakan 8-digit Pairing Code resmi tanpa perlu scan kamera."
                }
            }
        ]
    };
}

function getArticleJsonLd(article, site) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "author": { "@type": "Organization", "name": "Danuxy Studio" },
        "datePublished": article.date,
        "publisher": {
            "@type": "Organization",
            "name": "Danuxy Studio",
            "logo": { "@type": "ImageObject", "url": "https://danuxy.com/public/images/logo-icon.png" }
        },
        "description": article.excerpt,
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://danuxy.com/blog/" + article.slug }
    };
}

// ===== ROUTES =====

// Homepage
app.get("/", function (req, res) {
    const t = res.locals.t;
    const lang = res.locals.lang;
    const appsSchema = getSoftwareAppsJsonLd();
    const faqSchema = getFaqJsonLd(lang);

    res.render("index", {
        currentPage: "home",
        pageTitle: t.site.name + " — " + (lang === "en" ? "Web Development, WhatsApp SaaS & Minecraft Plugins" : "Jasa Pembuatan Website, Bot WhatsApp & Minecraft Ecosystem"),
        pageDescription: t.site.description,
        canonicalPath: "",
        ogImage: t.site.ogImage,
        jsonLd: [
            getOrganizationJsonLd(t.site),
            getWebSiteJsonLd(t.site),
            appsSchema[0],
            appsSchema[1],
            faqSchema
        ],
        projects: res.locals.projects,
        articles: res.locals.articles.slice(0, 3)
    });
});

// Projects
app.get("/projects", function (req, res) {
    const t = res.locals.t;
    res.render("projects", {
        currentPage: "projects",
        pageTitle: t.projectsPage.title + " — " + t.site.name,
        pageDescription: t.projectsPage.desc,
        canonicalPath: "/projects",
        ogImage: t.site.ogImage,
        jsonLd: getOrganizationJsonLd(t.site),
        projects: res.locals.projects
    });
});

// Services
app.get("/services", function (req, res) {
    const t = res.locals.t;
    res.render("services", {
        currentPage: "services",
        pageTitle: t.servicesPage.title + " — " + t.site.name,
        pageDescription: t.servicesPage.desc,
        canonicalPath: "/services",
        ogImage: t.site.ogImage,
        jsonLd: getOrganizationJsonLd(t.site)
    });
});

// About
app.get("/about", function (req, res) {
    const t = res.locals.t;
    res.render("about", {
        currentPage: "about",
        pageTitle: t.nav.about + " — " + t.site.name,
        pageDescription: t.aboutPage.desc,
        canonicalPath: "/about",
        ogImage: t.site.ogImage,
        jsonLd: getOrganizationJsonLd(t.site)
    });
});

// Blog index
app.get("/blog", function (req, res) {
    const t = res.locals.t;
    res.render("blog/index", {
        currentPage: "blog",
        pageTitle: t.blog.title + " — " + t.site.name,
        pageDescription: t.blog.desc,
        canonicalPath: "/blog",
        ogImage: t.site.ogImage,
        jsonLd: getOrganizationJsonLd(t.site),
        articles: res.locals.articles
    });
});

// Blog article
app.get("/blog/:slug", function (req, res) {
    const t = res.locals.t;
    const articles = res.locals.articles;
    const article = articles.find(function (a) { return a.slug === req.params.slug; });

    if (!article) {
        return res.status(404).render("404", {
            pageTitle: "404 — " + t.error404.title,
            pageDescription: t.error404.desc,
            canonicalPath: "/404",
            ogImage: t.site.ogImage,
            jsonLd: null
        });
    }

    const relatedArticles = articles.filter(function (a) {
        return article.related && article.related.indexOf(a.slug) !== -1;
    });

    res.render("blog/article", {
        currentPage: "blog",
        pageTitle: article.title + " — " + t.site.name,
        pageDescription: article.excerpt,
        canonicalPath: "/blog/" + article.slug,
        ogType: "article",
        ogImage: t.site.ogImage,
        jsonLd: getArticleJsonLd(article, t.site),
        article: article,
        relatedArticles: relatedArticles
    });
});

// Contact
app.get("/contact", function (req, res) {
    const t = res.locals.t;
    res.render("contact", {
        currentPage: "contact",
        pageTitle: t.contactPage.title + " — " + t.site.name,
        pageDescription: t.contactPage.desc,
        canonicalPath: "/contact",
        ogImage: t.site.ogImage,
        jsonLd: getOrganizationJsonLd(t.site)
    });
});

// NIXI
app.get("/nixi", function (req, res) {
    res.redirect(301, "https://nixi.danuxy.com/");
});

// Minecraft
app.get("/minecraft", function (req, res) {
    const t = res.locals.t;
    const lang = res.locals.lang;
    const appsSchema = getSoftwareAppsJsonLd();
    res.render("minecraft", {
        currentPage: "minecraft",
        pageTitle: t.minecraft.title + " — " + t.site.name,
        pageDescription: t.minecraft.desc,
        canonicalPath: "/minecraft",
        ogImage: t.site.ogImage,
        jsonLd: [
            getOrganizationJsonLd(t.site),
            appsSchema[0],
            getFaqJsonLd(lang)
        ]
    });
});

// Legal pages
app.get("/privacy", function (req, res) {
    const t = res.locals.t;
    res.render("legal/privacy", {
        currentPage: "privacy",
        pageTitle: t.legal.privacyTitle + " — " + t.site.name,
        pageDescription: t.legal.privacyTitle + " - " + t.site.name,
        canonicalPath: "/privacy",
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

app.get("/terms", function (req, res) {
    const t = res.locals.t;
    res.render("legal/terms", {
        currentPage: "terms",
        pageTitle: t.legal.termsTitle + " — " + t.site.name,
        pageDescription: t.legal.termsTitle + " - " + t.site.name,
        canonicalPath: "/terms",
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

app.get("/cookies", function (req, res) {
    const t = res.locals.t;
    res.render("legal/cookies", {
        currentPage: "cookies",
        pageTitle: t.legal.cookiesTitle + " — " + t.site.name,
        pageDescription: t.legal.cookiesTitle + " - " + t.site.name,
        canonicalPath: "/cookies",
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

// API / switch route for language
app.get("/api/lang/:lang", function (req, res) {
    const target = req.params.lang === "en" ? "en" : "id";
    res.setHeader("Set-Cookie", "danuxy_lang=" + target + "; Path=/; Max-Age=31536000; SameSite=Lax");
    const referer = req.get("Referrer") || "/";
    res.redirect(referer);
});

// 301 Redirects for legacy routes
app.get("/wa", function (req, res) { res.redirect(301, "/contact"); });
app.get("/komisan", function (req, res) { res.redirect(301, "https://nixi.danuxy.com/"); });
app.get("/botwa", function (req, res) { res.redirect(301, "/services"); });
app.get("/website", function (req, res) { res.redirect(301, "/services"); });

// robots.txt
app.get("/robots.txt", function (req, res) {
    res.type("text/plain");
    res.send([
        "User-agent: *",
        "Allow: /",
        "",
        "Sitemap: https://danuxy.com/sitemap.xml"
    ].join("\n"));
});

// sitemap.xml
app.get("/sitemap.xml", function (req, res) {
    const urls = [
        { loc: "", priority: "1.0", changefreq: "weekly" },
        { loc: "/projects", priority: "0.8", changefreq: "weekly" },
        { loc: "/services", priority: "0.8", changefreq: "monthly" },
        { loc: "/about", priority: "0.7", changefreq: "monthly" },
        { loc: "/blog", priority: "0.8", changefreq: "weekly" },
        { loc: "/contact", priority: "0.6", changefreq: "monthly" },
        { loc: "/minecraft", priority: "0.7", changefreq: "monthly" },
        { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
        { loc: "/terms", priority: "0.3", changefreq: "yearly" },
        { loc: "/cookies", priority: "0.3", changefreq: "yearly" }
    ];

    localizedArticles.id.forEach(function (a) {
        urls.push({ loc: "/blog/" + a.slug, priority: "0.7", changefreq: "monthly" });
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    urls.forEach(function (u) {
        xml += "  <url>\n";
        xml += "    <loc>https://danuxy.com" + u.loc + "</loc>\n";
        xml += "    <changefreq>" + u.changefreq + "</changefreq>\n";
        xml += "    <priority>" + u.priority + "</priority>\n";
        xml += "  </url>\n";
    });
    xml += "</urlset>";

    res.type("application/xml");
    res.send(xml);
});

// 404 handler
app.use(function (req, res) {
    const t = res.locals.t;
    res.status(404).render("404", {
        pageTitle: "404 — " + t.error404.title,
        pageDescription: t.error404.desc,
        canonicalPath: req.path,
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, function () {
        console.log("Server berjalan di http://localhost:" + PORT);
    });
}

module.exports = app;
