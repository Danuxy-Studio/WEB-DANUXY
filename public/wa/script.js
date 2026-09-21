(function () {
    "use strict";

    const loadingScreen = document.getElementById("loadingScreen");
    const waPage = document.getElementById("waPage");

    // Simulasi loading (misal 1,5 detik)
    window.addEventListener("load", function () {
        setTimeout(function () {
            loadingScreen.classList.add("hidden");
            waPage.style.display = "block";
            // Animasi fade-in untuk konten
            waPage.style.animation = "fadeIn 0.6s ease forwards";
        }, 1500);
    });

    // Tambahkan keyframe fadeIn jika belum ada
    const style = document.createElement("style");
    style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
    document.head.appendChild(style);
})();
