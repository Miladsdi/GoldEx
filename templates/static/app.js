// ============================
//  GoldEx – Frontend Engine
// ============================

const API_URL = "/api/prices";

let prices = {};
let fxMode = "fiat-to-forex";

// هنگام لود صفحه
document.addEventListener("DOMContentLoaded", () => {
    loadPrices();
    setupTabs();
    setupCalculators();
});


// ============================
// 📌 دریافت قیمت‌ها
// ============================
async function loadPrices() {
    const last = document.getElementById("last-update");
    const cards = document.getElementById("summary-cards");
    const tableBody = document.getElementById("prices-table-body");

    last.textContent = "در حال دریافت اطلاعات...";

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("API failed");

        const json = await res.json();
        prices = json.data;

        const dt = new Date();
        last.textContent = "آخرین بروزرسانی: " + dt.toLocaleTimeString("fa-IR");

        renderSummaryCards(cards);
        renderTable(tableBody);
        animateCards();

    } catch (err) {
        console.error("Error loading API:", err);
        last.textContent = "خطا در دریافت قیمت‌ها ❌";
    }
}


// ============================
// 🎴 ساخت کارت‌های خلاصه
// ============================
function renderSummaryCards(container) {
    container.innerHTML = "";

    const items = [
        { key: "usd", label: "دلار آمریکا", icon: "fa-dollar-sign" },
        { key: "eur", label: "یورو", icon: "fa-euro-sign" },
        { key: "gbp", label: "پوند انگلیس", icon: "fa-sterling-sign" },
        { key: "aed", label: "درهم امارات", icon: "fa-landmark" },
        { key: "gold18", label: "طلای ۱۸ عیار", icon: "fa-ring" },
        { key: "gold24", label: "طلای ۲۴ عیار", icon: "fa-gem" },
        { key: "mozane", label: "مظنه تهران", icon: "fa-scale-balanced" },
    ];

    items.forEach(item => {
        if (!(item.key in prices)) return;

        const card = document.createElement("div");
        card.className = "summary-card fade-in";

        card.innerHTML = `
            <div class="label">${item.label}</div>
            <div class="value">${formatNumber(prices[item.key])} <span class="unit">تومان</span></div>
            <i class="fa-solid ${item.icon} icon"></i>
        `;

        container.appendChild(card);
    });
}


// ============================
// 📘 جدول قیمت‌ها
// ============================
function renderTable(tbody) {
    tbody.innerHTML = "";

    const rows = [
        ["usd", "دلار آمریکا (USD)", "ارز"],
        ["eur", "یورو (EUR)", "ارز"],
        ["gbp", "پوند انگلیس (GBP)", "ارز"],
        ["aed", "درهم امارات (AED)", "ارز"],
        ["try", "لیر ترکیه (TRY)", "ارز"],

        ["gold18", "طلای ۱۸ عیار", "طلا"],
        ["gold24", "طلای ۲۴ عیار", "طلا"],
        ["mozane", "مظنه تهران", "طلا"],
    ];

    rows.forEach(([key, name, cat]) => {
        if (!(key in prices)) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${name}</td>
            <td>${formatNumber(prices[key])}</td>
            <td>${cat}</td>
        `;
        tbody.appendChild(tr);
    });
}


// ============================
// 🔄 فرمت اعداد (123,456)
// ============================
function formatNumber(n) {
    if (!n) return "-";
    return Number(n).toLocaleString("fa-IR");
}


// ============================
// 🟦 سوئیچ تب‌های تبدیل ارز
// ============================
function setupTabs() {
    const btns = document.querySelectorAll(".tab-btn");

    btns.forEach(btn => {
        btn.onclick = () => {
            btns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            fxMode = btn.dataset.mode;
        };
    });
}


// ============================
// ✨ محاسبه‌گر طلا
// ============================
function handleGoldCalc() {
    const amount = Number(document.getElementById("gold-amount").value);
    const type = document.getElementById("gold-type").value;
    const result = document.getElementById("gold-result");

    if (!amount || amount <= 0) {
        result.textContent = "مبلغ معتبر نیست!";
        return;
    }

    if (!(type in prices)) {
        result.textContent = "قیمت طلا دریافت نشده!";
        return;
    }

    const grams = amount / prices[type];
    result.textContent = `می‌توانید حدود ${grams.toFixed(2)} گرم طلا بخرید.`;
}


// ============================
// 💸 محاسبه‌گر ارز
// ============================
function handleFxCalc() {
    const amount = Number(document.getElementById("fx-amount").value);
    const type = document.getElementById("fx-type").value;
    const result = document.getElementById("fx-result");

    if (!amount || amount <= 0) {
        result.textContent = "عدد معتبر نیست.";
        return;
    }

    if (!(type in prices)) {
        result.textContent = "قیمت ارز موجود نیست.";
        return;
    }

    const rate = prices[type];

    if (fxMode === "fiat-to-forex") {
        const units = amount / rate;
        result.textContent = `تقریباً ${units.toFixed(3)} واحد ${type.toUpperCase()} می‌خرید.`;
    } else {
        const toman = amount * rate;
        result.textContent = `${formatNumber(toman)} تومان`;
    }
}


// ============================
// 🎛 اتصال دکمه‌ها
// ============================
function setupCalculators() {
    document.getElementById("gold-calc-btn").onclick = handleGoldCalc;
    document.getElementById("fx-calc-btn").onclick = handleFxCalc;
}


// ============================
// 🔥 انیمیشن کارت‌ها
// ============================
function animateCards() {
    document.querySelectorAll(".summary-card").forEach((c, i) => {
        c.style.animationDelay = `${i * 0.07}s`;
    });
}
