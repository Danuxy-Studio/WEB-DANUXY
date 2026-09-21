const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware untuk file statis
app.use("/public", express.static(path.join(__dirname, "public")));

// Rute utama
app.get("/", (req, res) => {
    res.render("index");
});

// Rute halaman WA
app.get("/wa", (req, res) => {
    res.render("wa");
});

// ===== RUTE BARU: KOMI-SAN BOT =====
app.get("/komisan", (req, res) => {
    res.render("komisan");
});

// Rute halaman layanan
app.get("/botwa", (req, res) => {
    res.render("service/botwa");
});

app.get("/minecraft", (req, res) => {
    res.render("service/minecraft");
});

app.get("/website", (req, res) => {
    res.render("service/website");
});

// 404
app.use((req, res) => {
    res.status(404).render('404');
});

// Jalankan server hanya saat dijalankan langsung (mis. lokal / node server.js)
// Di Vercel, file ini diimpor sebagai serverless function, bukan dijalankan langsung.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;
