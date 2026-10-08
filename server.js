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

// Edge caching header for Vercel
app.use(function (req, res, next) {
    if (req.method === "GET") {
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    }
    next();
});

// Language detection middleware
function getCookie(req, name) {
    if (!req.headers.cookie) return null;
    const match = req.headers.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

app.use(function (req, res, next) {
    let lang = "id";
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

// JSON-LD generators for SEO & Google Sitelinks
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

// SiteNavigationElement schema specifically for Google Sitelinks
function getSiteNavigationJsonLd(lang) {
    const isEn = lang === "en";
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {
                "@type": "SiteNavigationElement",
                "position": 1,
                "name": isEn ? "Projects" : "Proyek",
                "description": isEn ? "Digital software and engineering projects by Danuxy Studio" : "Daftar proyek dan portofolio software Danuxy Studio",
                "url": "https://danuxy.com/projects"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 2,
                "name": isEn ? "Services" : "Layanan",
                "description": isEn ? "Development services for WhatsApp automation, Minecraft, and Web" : "Layanan pengembangan WhatsApp, Minecraft, dan Website",
                "url": "https://danuxy.com/services"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 3,
                "name": "Blog",
                "description": isEn ? "Engineering notes and technical guides by Danuxy Studio" : "Artikel dan catatan teknikal seputar rekayasa software",
                "url": "https://danuxy.com/blog"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 4,
                "name": isEn ? "About" : "Tentang",
                "description": isEn ? "Story, engineering philosophy, and stack of Danuxy Studio" : "Profil, filosofi kerja, dan teknologi Danuxy Studio",
                "url": "https://danuxy.com/about"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 5,
                "name": isEn ? "Contact" : "Kontak",
                "description": isEn ? "Direct channels to discuss projects with Danuxy Studio" : "Hubungi Danuxy Studio untuk diskusi proyek",
                "url": "https://danuxy.com/contact"
            },
            {
                "@type": "SiteNavigationElement",
                "position": 6,
                "name": "Minecraft",
                "description": isEn ? "DanuxyCore plugin and Minecraft server architecture" : "Ekosistem plugin DanuxyCore dan arsitektur server Minecraft",
                "url": "https://danuxy.com/minecraft"
            }
        ]
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
            "description": "Cross-platform Minecraft server plugin featuring Dual Native GUI: Custom Dialog GUI for Java 1.21.8+ and Native Form UI for Bedrock without client mods.",
            "url": "https://danuxy.com/minecraft",
            "featureList": [
                "Dual Native GUI System for warp and home navigation",
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
                        "text": "Danuxy Studio is an independent digital engineering studio developing modern SaaS platforms like NIXI, cross-platform Minecraft plugins like DanuxyCore, and bespoke web applications."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is DanuxyCore for Minecraft servers?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "DanuxyCore is a high-performance cross-platform Minecraft plugin engineered with Dual Native GUI. It renders modern custom dialog screens on Java Edition 1.21.8+ and native form interfaces on Bedrock Edition for warp and home navigation with zero client mods."
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
                    "text": "DanuxyCore adalah plugin server Minecraft cross-platform dengan sistem Dual Native GUI: menghadirkan Custom Dialog GUI modern untuk Java Edition 1.21.8+ dan Form UI native untuk Bedrock Edition untuk navigasi warp dan home tanpa mod di sisi pemain."
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
    const navSchema = getSiteNavigationJsonLd(lang);

    res.render("index", {
        currentPage: "home",
        pageTitle: t.site.name + " | " + (lang === "en" ? "Software Studio, WhatsApp Platform & Minecraft Ecosystem" : "Studio Software, Platform WhatsApp & Ekosistem Minecraft"),
        pageDescription: t.site.description,
        canonicalPath: "",
        ogImage: t.site.ogImage,
        jsonLd: [
            getOrganizationJsonLd(t.site),
            getWebSiteJsonLd(t.site),
            navSchema,
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
        pageTitle: t.projectsPage.title + " | " + t.site.name,
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
        pageTitle: t.servicesPage.title + " | " + t.site.name,
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
        pageTitle: t.nav.about + " | " + t.site.name,
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
        pageTitle: t.blog.title + " | " + t.site.name,
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
            pageTitle: "404 | " + t.error404.title,
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
        pageTitle: article.title + " | " + t.site.name,
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
        pageTitle: t.contactPage.title + " | " + t.site.name,
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
        pageTitle: t.minecraft.title + " | " + t.site.name,
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

// Links Directory / Linktree page
app.get("/links", function (req, res) {
    const t = res.locals.t;
    const lang = res.locals.lang;

    const linksGroups = [
        {
            id: "whatsapp",
            title: lang === "en" ? "WhatsApp Channels & Community" : "Saluran & Komunitas WhatsApp",
            icon: "fab fa-whatsapp",
            accentColor: "#25D366",
            items: [
                {
                    title: "Saluran Resmi Danuxy Studio",
                    titleEn: "Official Danuxy Studio Channel",
                    desc: "Pusat siaran update ekosistem Danuxy, rilis proyek, pengumuman studio, dan info penting",
                    descEn: "Main broadcast channel for Danuxy ecosystem news, project releases, and official announcements",
                    url: "https://whatsapp.com/channel/0029Vb6RsCAEAKWDFTrHdu0L",
                    icon: "fab fa-whatsapp",
                    badge: "Official Studio",
                    badgeEn: "Official Studio",
                    badgeColor: "success",
                    isFeatured: true,
                    isExternal: true
                },
                {
                    title: "Saluran Update NIXI Bot",
                    titleEn: "NIXI Bot Update Channel",
                    desc: "Informasi rilis versi baru NIXI Bot, changelog fitur, tutorial, dan status gateway WhatsApp",
                    descEn: "NIXI Bot version releases, feature changelogs, tutorials, and gateway operational updates",
                    url: "https://whatsapp.com/channel/0029Vb8mQRlF1YlTEn1fCT0n",
                    icon: "fas fa-bullhorn",
                    badge: "Update NIXI",
                    badgeEn: "NIXI Updates",
                    badgeColor: "primary",
                    isFeatured: true,
                    isExternal: true
                },
                {
                    title: "Grup Coba Fitur NIXI Bot Gratis",
                    titleEn: "Free NIXI Bot Feature Trial Group",
                    desc: "Grup interaktif untuk mencoba langsung seluruh fitur bot WhatsApp NIXI secara gratis bersama komunitas",
                    descEn: "Interactive trial group to test all NIXI WhatsApp Bot features live for free with the community",
                    url: "https://chat.whatsapp.com/J2WkVrPGBrIDYBy5gQAg6q",
                    icon: "fas fa-flask-vial",
                    badge: "Gratis Coba",
                    badgeEn: "Free Trial",
                    badgeColor: "cyan",
                    isFeatured: true,
                    isExternal: true
                },
                {
                    title: "WhatsApp Direct Chat & Konsultasi",
                    titleEn: "WhatsApp Direct Support & Inquiry",
                    desc: "Hubungi admin dan tim pengembang Danuxy Studio langsung via WhatsApp untuk pertanyaan atau bantuan",
                    descEn: "Direct contact with Danuxy Studio developers and support team for inquiries or assistance",
                    url: "https://wa.me/message/BGEICSH5MWY6N1",
                    icon: "fas fa-headset",
                    badge: "Fast Response",
                    badgeEn: "Fast Response",
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: true
                }
            ]
        },
        {
            id: "store",
            title: lang === "en" ? "Danuxy Store & Digital Services" : "Danuxy Store & Layanan Digital",
            icon: "fas fa-store",
            accentColor: "#f59e0b",
            items: [
                {
                    title: "Danuxy Store: App Premium & Top Up Game",
                    titleEn: "Danuxy Store: Premium Apps & Game Top-Up",
                    desc: "Grup penyedia layanan digital, akun aplikasi premium resmi bergaransi, dan top up game terpercaya",
                    descEn: "Verified provider group for premium app subscriptions, game top-up, and digital services",
                    url: "https://chat.whatsapp.com/JkSukMRhJx67QbL9oMFcXQ",
                    icon: "fas fa-gem",
                    badge: "Store Aktif",
                    badgeEn: "Active Store",
                    badgeColor: "amber",
                    isFeatured: true,
                    isExternal: true
                },
                {
                    title: "Katalog Layanan Digital Studio",
                    titleEn: "Studio Digital Services Catalog",
                    desc: "Solusi jasa pembuatan Bot WhatsApp kustom, optimasi server Minecraft, dan website modern",
                    descEn: "Custom WhatsApp bot development, Minecraft server optimization, and modern web apps",
                    url: "/services",
                    icon: "fas fa-cogs",
                    badge: "Layanan Jasa",
                    badgeEn: "Services",
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: false
                },
                {
                    title: "Formulir Kontak Kerja Sama",
                    titleEn: "Official Collaboration Contact Form",
                    desc: "Ajukan penawaran proyek digital atau kerja sama resmi dengan tim Danuxy Studio",
                    descEn: "Submit official digital project inquiries and collaboration proposals to Danuxy Studio",
                    url: "/contact",
                    icon: "fas fa-paper-plane",
                    badge: null,
                    badgeEn: null,
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: false
                }
            ]
        },
        {
            id: "platforms",
            title: lang === "en" ? "Platforms & Software Products" : "Platform & Produk Software",
            icon: "fas fa-cubes",
            accentColor: "#38bdf8",
            items: [
                {
                    title: "NIXI Platform Dashboard",
                    titleEn: "NIXI Platform Dashboard",
                    desc: "Dashboard web WhatsApp Gateway mandiri: pairing via QR Code / 8-digit Pairing Code dengan bot terisolasi",
                    descEn: "Autonomous WhatsApp Gateway dashboard: instant QR / 8-digit pairing code with isolated bot instance",
                    url: "https://nixi.danuxy.com/",
                    icon: "fas fa-robot",
                    badge: "Platform Web",
                    badgeEn: "Web Platform",
                    badgeColor: "primary",
                    isFeatured: true,
                    isExternal: true
                },
                {
                    title: "DanuxyCore: Dual Native GUI Minecraft",
                    titleEn: "DanuxyCore: Dual Native GUI Minecraft",
                    desc: "Plugin cross-platform revolusioner untuk server Minecraft: dialog modern Java 1.21.8+ dan Form UI Bedrock",
                    descEn: "Revolutionary Minecraft plugin: Java 1.21.8+ dialog GUI and native Bedrock form UI via Geyser/Floodgate",
                    url: "/minecraft",
                    icon: "fas fa-cube",
                    badge: "Plugin Server",
                    badgeEn: "Server Plugin",
                    badgeColor: "cyan",
                    isFeatured: false,
                    isExternal: false
                },
                {
                    title: "Portofolio & Showcase Proyek",
                    titleEn: "Projects & Portfolio Showcase",
                    desc: "Daftar lengkap karya software, sistem otomasi, dan eksperimen teknologi Danuxy Studio",
                    descEn: "Complete showcase of software systems, automation tools, and technology experiments",
                    url: "/projects",
                    icon: "fas fa-folder-open",
                    badge: null,
                    badgeEn: null,
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: false
                }
            ]
        },
        {
            id: "socials",
            title: lang === "en" ? "Open Source & Social Media" : "Open Source & Media Sosial",
            icon: "fas fa-share-nodes",
            accentColor: "#a855f7",
            items: [
                {
                    title: "GitHub Organisasi",
                    titleEn: "GitHub Organization",
                    desc: "Koleksi repositori open source, boilerplate bot, utilitas digital, dan dokumentasi teknikal",
                    descEn: "Open source repositories, bot boilerplates, digital utilities, and technical documentation",
                    url: "https://github.com/Danuxy-Studio",
                    icon: "fab fa-github",
                    badge: "Open Source",
                    badgeEn: "Open Source",
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: true
                },
                {
                    title: "YouTube Channel (@nuxymc)",
                    titleEn: "YouTube Channel (@nuxymc)",
                    desc: "Video dokumentasi server Minecraft, showcase plugin, dan tutorial pengembangan",
                    descEn: "Minecraft server documentation, plugin showcases, and development tutorials",
                    url: "https://youtube.com/@nuxymc",
                    icon: "fab fa-youtube",
                    badge: null,
                    badgeEn: null,
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: true
                },
                {
                    title: "TikTok (@danuxy.com)",
                    titleEn: "TikTok (@danuxy.com)",
                    desc: "Cuplikan singkat demo fitur sistem, preview bot, dan proses development teknologi sehari-hari",
                    descEn: "Short clips of system features, bot previews, and daily tech development highlights",
                    url: "https://tiktok.com/@danuxy.com",
                    icon: "fab fa-tiktok",
                    badge: null,
                    badgeEn: null,
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: true
                },
                {
                    title: "Instagram (@danuxy_digital)",
                    titleEn: "Instagram (@danuxy_digital)",
                    desc: "Galeri visual, kutipan rekayasa software, dan pengumuman visual Danuxy Studio",
                    descEn: "Visual gallery, software engineering highlights, and studio announcements",
                    url: "https://www.instagram.com/danuxy_digital",
                    icon: "fab fa-instagram",
                    badge: null,
                    badgeEn: null,
                    badgeColor: "default",
                    isFeatured: false,
                    isExternal: true
                }
            ]
        }
    ];

    // Extract all items flattened for ItemList schema
    const flatItems = [];
    linksGroups.forEach(function (group) {
        group.items.forEach(function (item) {
            flatItems.push({
                "@type": "ListItem",
                "position": flatItems.length + 1,
                "name": lang === "en" && item.titleEn ? item.titleEn : item.title,
                "description": lang === "en" && item.descEn ? item.descEn : item.desc,
                "url": item.url.startsWith("http") ? item.url : "https://danuxy.com" + item.url
            });
        });
    });

    const linksFaq = [
        {
            q: lang === "en" ? "Where can I try NIXI WhatsApp Bot features for free?" : "Di mana grup untuk mencoba fitur NIXI Bot secara gratis?",
            a: lang === "en" ? "You can join our interactive trial community group to test all NIXI WhatsApp Bot features, commands, and automation live for free: https://chat.whatsapp.com/J2WkVrPGBrIDYBy5gQAg6q" : "Anda dapat bergabung langsung ke grup uji coba interaktif kami untuk mencoba seluruh fitur, perintah, dan otomasi NIXI Bot secara gratis: https://chat.whatsapp.com/J2WkVrPGBrIDYBy5gQAg6q",
            link: "https://chat.whatsapp.com/J2WkVrPGBrIDYBy5gQAg6q",
            linkText: lang === "en" ? "Join Free Trial Group" : "Gabung Grup Coba Gratis"
        },
        {
            q: lang === "en" ? "What is the official NIXI Bot WhatsApp update channel?" : "Di mana saluran update resmi tentang NIXI Bot?",
            a: lang === "en" ? "Official updates, changelogs, and announcements for NIXI Bot are broadcasted through our WhatsApp Channel: https://whatsapp.com/channel/0029Vb8mQRlF1YlTEn1fCT0n" : "Informasi pembaruan versi, rilis fitur baru, dan status gateway NIXI Bot disiarkan melalui Saluran WhatsApp: https://whatsapp.com/channel/0029Vb8mQRlF1YlTEn1fCT0n",
            link: "https://whatsapp.com/channel/0029Vb8mQRlF1YlTEn1fCT0n",
            linkText: lang === "en" ? "Follow NIXI Channel" : "Ikuti Saluran NIXI"
        },
        {
            q: lang === "en" ? "Where can I follow official announcements from Danuxy Studio?" : "Di mana saluran resmi Danuxy Studio?",
            a: lang === "en" ? "Official studio announcements, software releases, and digital ecosystem news are broadcasted on our main WhatsApp Channel: https://whatsapp.com/channel/0029Vb6RsCAEAKWDFTrHdu0L" : "Pusat siaran berita resmi Danuxy Studio, rilis proyek software, dan pengumuman studio dapat diikuti di Saluran WhatsApp: https://whatsapp.com/channel/0029Vb6RsCAEAKWDFTrHdu0L",
            link: "https://whatsapp.com/channel/0029Vb6RsCAEAKWDFTrHdu0L",
            linkText: lang === "en" ? "Follow Danuxy Channel" : "Ikuti Saluran Danuxy"
        },
        {
            q: lang === "en" ? "What is Danuxy Store and how can I order?" : "Apa itu Danuxy Store dan bagaimana cara ordernya?",
            a: lang === "en" ? "Danuxy Store is a verified digital provider for premium app subscriptions with warranty and instant game top-ups. Join our verified store group: https://chat.whatsapp.com/JkSukMRhJx67QbL9oMFcXQ" : "Danuxy Store adalah penyedia layanan digital resmi untuk pembelian akun aplikasi premium bergaransi dan top up game terpercaya dengan proses cepat. Gabung ke grup resmi Danuxy Store: https://chat.whatsapp.com/JkSukMRhJx67QbL9oMFcXQ",
            link: "https://chat.whatsapp.com/JkSukMRhJx67QbL9oMFcXQ",
            linkText: lang === "en" ? "Join Danuxy Store" : "Gabung Danuxy Store"
        }
    ];

    // Rich JSON-LD Structured Data for Google Search Top Ranking
    const linksJsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": "https://danuxy.com/links#webpage",
                "url": "https://danuxy.com/links",
                "name": lang === "en" 
                    ? "Official Links Directory | Danuxy Studio | WhatsApp Channels, NIXI Bot & Store"
                    : "Direktori Tautan Resmi Danuxy Studio | Saluran WhatsApp, NIXI Bot & Danuxy Store",
                "description": lang === "en"
                    ? "Access official WhatsApp channels, free NIXI bot feature trial group, Danuxy Store (premium apps & game top-up), and software platforms."
                    : "Pusat tautan resmi Danuxy Studio: saluran WhatsApp resmi, grup coba fitur NIXI Bot gratis, Danuxy Store (aplikasi premium & top up game), serta platform software.",
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Danuxy Studio", "item": "https://danuxy.com" },
                        { "@type": "ListItem", "position": 2, "name": "Direktori Tautan", "item": "https://danuxy.com/links" }
                    ]
                }
            },
            {
                "@type": "Organization",
                "@id": "https://danuxy.com/#organization",
                "name": "Danuxy Studio",
                "url": "https://danuxy.com",
                "logo": "https://danuxy.com/public/images/logo-icon.png",
                "sameAs": [
                    "https://whatsapp.com/channel/0029Vb6RsCAEAKWDFTrHdu0L",
                    "https://whatsapp.com/channel/0029Vb8mQRlF1YlTEn1fCT0n",
                    "https://chat.whatsapp.com/J2WkVrPGBrIDYBy5gQAg6q",
                    "https://chat.whatsapp.com/JkSukMRhJx67QbL9oMFcXQ",
                    "https://github.com/Danuxy-Studio",
                    "https://youtube.com/@nuxymc",
                    "https://tiktok.com/@danuxy.com",
                    "https://www.instagram.com/danuxy_digital"
                ]
            },
            {
                "@type": "ItemList",
                "@id": "https://danuxy.com/links#itemlist",
                "name": lang === "en" ? "Danuxy Studio Official Links & Channels" : "Daftar Tautan dan Komunitas Resmi Danuxy Studio",
                "numberOfItems": flatItems.length,
                "itemListElement": flatItems
            },
            {
                "@type": "FAQPage",
                "@id": "https://danuxy.com/links#faq",
                "mainEntity": linksFaq.map(function (item) {
                    return {
                        "@type": "Question",
                        "name": item.q,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": item.a
                        }
                    };
                })
            }
        ]
    };

    const pageTitle = lang === "en"
        ? "Official Links Directory | Danuxy Studio | WhatsApp Channels, NIXI Bot & Store"
        : "Direktori Tautan Resmi Danuxy Studio | Saluran WhatsApp, NIXI Bot & Danuxy Store";

    const pageDescription = lang === "en"
        ? "Official directory of Danuxy Studio: join official WhatsApp channels, free NIXI bot trial group, Danuxy Store (premium apps & game top-up), and software platforms."
        : "Pusat tautan resmi Danuxy Studio: gabung Saluran WhatsApp resmi, coba fitur NIXI Bot gratis di grup, Danuxy Store (app premium & top up game), serta platform software.";

    res.render("links", {
        currentPage: "links",
        pageTitle: pageTitle,
        pageDescription: pageDescription,
        canonicalPath: "/links",
        ogImage: t.site.ogImage,
        linksGroups: linksGroups,
        linksFaq: linksFaq,
        jsonLd: linksJsonLd
    });
});

app.get("/linktree", function (req, res) { res.redirect(301, "/links"); });
app.get("/bio", function (req, res) { res.redirect(301, "/links"); });

// Legal pages
app.get("/privacy", function (req, res) {
    const t = res.locals.t;
    res.render("legal/privacy", {
        currentPage: "privacy",
        pageTitle: t.legal.privacyTitle + " | " + t.site.name,
        pageDescription: t.legal.privacyTitle + " " + t.site.name,
        canonicalPath: "/privacy",
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

app.get("/terms", function (req, res) {
    const t = res.locals.t;
    res.render("legal/terms", {
        currentPage: "terms",
        pageTitle: t.legal.termsTitle + " | " + t.site.name,
        pageDescription: t.legal.termsTitle + " " + t.site.name,
        canonicalPath: "/terms",
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

app.get("/cookies", function (req, res) {
    const t = res.locals.t;
    res.render("legal/cookies", {
        currentPage: "cookies",
        pageTitle: t.legal.cookiesTitle + " | " + t.site.name,
        pageDescription: t.legal.cookiesTitle + " " + t.site.name,
        canonicalPath: "/cookies",
        ogImage: t.site.ogImage,
        jsonLd: null
    });
});

// API switch route for language
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
        { loc: "/links", priority: "0.8", changefreq: "weekly" },
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
        pageTitle: "404 | " + t.error404.title,
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
