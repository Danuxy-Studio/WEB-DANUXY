module.exports = [
    {
        id: "nixi",
        name: "NIXI",
        tagline: "Platform WhatsApp Bot & Gateway",
        category: "WhatsApp & Automation",
        status: "In Development",
        featured: true,
        summary: "Platform gateway WhatsApp yang memungkinkan pengguna menghubungkan nomor WhatsApp pribadi atau bisnis lalu menjalankan bot mandiri dengan kontrol penuh.",
        description: "NIXI dirancang untuk menjembatani komunikasi WhatsApp dengan sistem backend otomatis. Pengguna dapat menghubungkan sesi WhatsApp melalui QR code, memantau status koneksi, mengelola trigger pesan, dan mengintegrasikannya dengan webhook maupun API kustom.",
        techStack: ["Node.js", "Next.js", "Express", "MySQL", "Baileys", "Docker"],
        whatWasBuilt: [
            "Arsitektur worker terdistribusi untuk isolasi sesi WhatsApp per pengguna.",
            "Dashboard manajemen sesi, log pesan, dan monitoring heartbeat.",
            "Sistem webhook masuk dan keluar untuk integrasi bot eksternal.",
            "REST API gateway untuk pengiriman pesan teks, media, dan interaktif."
        ],
        links: {
            website: "/nixi",
            github: "https://github.com/Danuxy-Studio"
        }
    },
    {
        id: "danuxy-core",
        name: "DanuxyCore",
        tagline: "Plugin Ecosystem Minecraft",
        category: "Minecraft",
        status: "Active",
        featured: true,
        summary: "Kumpulan modul dan plugin kustom untuk mendukung kebutuhan gameplay, proteksi data, dan utilitas admin di server Minecraft.",
        description: "DanuxyCore adalah pondasi plugin yang dibuat untuk memangkas ketergantungan pada plugin pihak ketiga yang berat. Dibuat ringan, modular, dan terhubung langsung ke database server.",
        techStack: ["Java", "Paper API", "SQLite", "Gradle"],
        whatWasBuilt: [
            "Sistem manajemen data pemain berbasis async database.",
            "Modul proteksi inventory dan sinkronisasi saldo.",
            "Tools teleporasi dan utility efisien tanpa membebani main server tick.",
            "Handler pesan terpusat dengan dukungan formatting mini-message."
        ],
        links: {
            website: "/minecraft",
            github: "https://github.com/Danuxy-Studio"
        }
    },
    {
        id: "base-bot-wa",
        name: "BASE-BOT-WA",
        tagline: "Boilerplate WhatsApp Bot Modular",
        category: "WhatsApp & Automation",
        status: "Active",
        featured: false,
        summary: "Fondasi bot WhatsApp berbasis Baileys dengan arsitektur plugin modular, auto reload handler, dan manajemen sesi yang andal.",
        description: "Framework dasar yang dipakai oleh Danuxy Studio dalam mengembangkan berbagai solusi bot WhatsApp, mulai dari bot asisten Komi-San hingga gateway otomatisasi notifikasi.",
        techStack: ["JavaScript", "Node.js", "Baileys", "Cheerio", "Axios"],
        whatWasBuilt: [
            "Plugin loader dinamis untuk menambahkan command baru tanpa restart.",
            "Penanganan reconnection otomatis saat koneksi terputus.",
            "Helper media manipulation untuk stiker, audio, dan gambar.",
            "Rate limiter dan antrean pengiriman pesan aman."
        ],
        links: {
            github: "https://github.com/Danuxy-Studio"
        }
    },
    {
        id: "danuxy-api",
        name: "DANUXY REST API",
        tagline: "Backend Service & Utilitas Digital",
        category: "Web Development",
        status: "Active",
        featured: false,
        summary: "REST API terpusat untuk melayani kebutuhan media downloader, scraper utilitas, AI proxy, dan integrasi antar proyek Danuxy Studio.",
        description: "Layanan microservice backend yang menyederhanakan komunikasi data antara bot WhatsApp, dashboard, dan aplikasi web Danuxy Studio.",
        techStack: ["Node.js", "Express", "RESTful API", "Vercel"],
        whatWasBuilt: [
            "Endpoint terpusat untuk konversi data dan scraping utilitas.",
            "Validasi request dan autentikasi token sederhana.",
            "Cache layer untuk meminimalkan beban request berulang.",
            "Monitoring uptime dan error handling transparan."
        ],
        links: {
            github: "https://github.com/Danuxy-Studio"
        }
    }
];
