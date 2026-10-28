/* ================================================================
   SOZLAMALAR — barcha ma'lumotlarni shu yerdan o'zgartiring
   ================================================================ */
const CONFIG = {
  names: {
    lat: { groom: "Adham", bride: "Sevinch" },
    cyr: { groom: "Адҳам", bride: "Севинч" }
  },
  // To'y vaqti (Toshkent, UTC+5)
  date: "2026-11-28T18:00:00+05:00",
  durationHours: 5,
  // To'yxona koordinatalari — «Asilbek» to'yxonasi, Yangi Nishon (MP24+P9R)
  venue: { lat: 38.651925, lng: 65.705708 },
  phone: "+998 97 952 98 76",
  defaultLang: "lat"
};

/* ================================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

/* ---------- Til ---------- */
let lang = store.get("wd-lang") || CONFIG.defaultLang;

function t(key) {
  const dict = I18N[lang] || I18N.lat;
  const n = CONFIG.names[lang];
  return (dict[key] ?? I18N.lat[key] ?? key)
    .replaceAll("{groom}", n.groom)
    .replaceAll("{bride}", n.bride);
}

function applyLang(next) {
  lang = next in I18N ? next : "lat";
  store.set("wd-lang", lang);
  document.documentElement.lang = lang === "cyr" ? "uz-Cyrl" : "uz";
  document.documentElement.dataset.lang = lang;
  const n = CONFIG.names[lang];

  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-name]").forEach(el => { el.textContent = n[el.dataset.name]; });
  $$("[data-names]").forEach(el => { el.innerHTML = `${n.groom} <em>&amp;</em> ${n.bride}`; });
  $$("[data-mono]").forEach(el => { el.innerHTML = `${n.groom[0]}<i>&amp;</i>${n.bride[0]}`; });
  $$("[data-lang]").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  document.title = `${n.groom} & ${n.bride} — ${lang === "cyr" ? "Тўй таклифномаси" : "To'y taklifnomasi"}`;
}
$$("[data-lang]").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
applyLang(lang);

/* ---------- Kirish eshiklari ---------- */
const intro = $("#intro");
const music = $("#music");
const musicBtn = $("#musicBtn");

$("#openInvite").addEventListener("click", () => {
  intro.classList.add("open");
  document.body.classList.remove("locked");
  setTimeout(() => intro.remove(), 1900);
  playMusic();
});

/* ---------- Musiqa (assets/audio/music.mp3 bo'lsa ishlaydi) ---------- */
function playMusic() {
  music.play().then(() => {
    musicBtn.hidden = false;
    musicBtn.classList.add("on");
  }).catch(() => {});
}
musicBtn.addEventListener("click", () => {
  if (music.paused) { music.play(); musicBtn.classList.add("on"); }
  else { music.pause(); musicBtn.classList.remove("on"); }
});

/* ---------- Barglar va oltin uchqunlar ---------- */
(function leaves() {
  const cv = $("#leaves");
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maple = new Path2D("M50 2 56 20 66 13 63 33 80 23 76 36 96 37 84 49 92 55 68 62 72 73 54 67 52 98 48 98 46 67 28 73 32 62 8 55 16 49 4 37 24 36 20 23 37 33 34 13 44 20Z");
  const oval = new Path2D("M50 2C82 24 86 64 50 98 14 64 18 24 50 2Z M50 6 L50 96");
  const birch = new Path2D("M50 4C74 22 80 52 66 76 60 86 54 92 50 98 46 92 40 86 34 76 20 52 26 22 50 4Z");
  const shapes = [maple, maple, maple, oval, birch];
  const palette = ["#8e2a12", "#a8361a", "#c4511f", "#d9762b", "#e39b3a", "#eebd55", "#b8451c", "#7a1f12"];

  let W, H, dpr, leaves = [], sparks = [], wind = 0, windT = 0;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px";
    cv.style.height = innerHeight + "px";
    const count = Math.round(Math.min(46, innerWidth / 30)) * (reduce ? 0.3 : 1);
    leaves = Array.from({ length: count }, () => makeLeaf(true));
    sparks = Array.from({ length: Math.round(count * 1.2) }, makeSpark);
  }

  function makeLeaf(anywhere) {
    const size = (14 + Math.random() * 26) * dpr;
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -size * 2,
      size,
      vy: (0.35 + Math.random() * 0.9) * dpr,
      vx: (Math.random() - 0.5) * 0.6 * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      flip: Math.random() * Math.PI * 2,
      vf: 0.01 + Math.random() * 0.03,
      sway: Math.random() * Math.PI * 2,
      shape: shapes[(Math.random() * shapes.length) | 0],
      color: palette[(Math.random() * palette.length) | 0],
      alpha: 0.65 + Math.random() * 0.35,
      blur: Math.random() < 0.18
    };
  }

  function makeSpark() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: (0.6 + Math.random() * 2.2) * dpr,
      vy: -(0.05 + Math.random() * 0.25) * dpr,
      ph: Math.random() * Math.PI * 2,
      sp: 0.01 + Math.random() * 0.03
    };
  }

  addEventListener("pointermove", e => { wind = (e.clientX / innerWidth - 0.5) * 1.6; });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    windT += 0.003;
    const gust = Math.sin(windT) * 0.6 + wind;

    // oltin uchqunlar
    for (const s of sparks) {
      s.y += s.vy; s.ph += s.sp;
      s.x += Math.sin(s.ph) * 0.2 * dpr;
      if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; }
      const a = 0.25 + Math.sin(s.ph * 2) * 0.25 + 0.2;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      g.addColorStop(0, `rgba(255,214,140,${a})`);
      g.addColorStop(1, "rgba(255,180,90,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, 7); ctx.fill();
    }

    // barglar
    for (const l of leaves) {
      l.sway += 0.02;
      l.x += l.vx + Math.sin(l.sway) * 0.7 * dpr + gust * dpr;
      l.y += l.vy;
      l.rot += l.vr;
      l.flip += l.vf;
      if (l.y > H + l.size * 2 || l.x < -l.size * 3 || l.x > W + l.size * 3) {
        Object.assign(l, makeLeaf(false), { x: Math.random() * W });
      }
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.scale(Math.cos(l.flip) * (l.size / 100), l.size / 100);
      ctx.translate(-50, -50);
      ctx.globalAlpha = l.alpha;
      ctx.filter = l.blur ? "blur(3px)" : "none";
      ctx.fillStyle = l.color;
      ctx.fill(l.shape);
      ctx.strokeStyle = "rgba(60,15,5,.35)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(50, 20); ctx.lineTo(50, 96); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();

/* ---------- Teskari sanoq ---------- */
(function countdown() {
  const target = new Date(CONFIG.date).getTime();
  const el = k => $(`[data-cd="${k}"]`);
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, target - Date.now());
    if (diff === 0) { $("#countdown").hidden = true; $("#cdDone").hidden = false; return; }
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    el("d").textContent = pad(d); el("h").textContent = pad(h);
    el("m").textContent = pad(m); el("s").textContent = pad(s);
    setTimeout(tick, 1000);
  }
  tick();
})();

/* ---------- Ko'rinishda paydo bo'lish ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach(el => io.observe(el));

/* ---------- Xarita ---------- */
(function map() {
  const { lat, lng } = CONFIG.venue;
  $("#mapFrame").src = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  $("#gmapsBtn").href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  $("#ymapsBtn").href = `https://yandex.uz/maps/?pt=${lng},${lat}&z=17&l=map`;
})();

/* ---------- Kalendar (.ics) ---------- */
$("#icsBtn").addEventListener("click", () => {
  const start = new Date(CONFIG.date);
  const end = new Date(start.getTime() + CONFIG.durationHours * 36e5);
  const f = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//weddingday//uz", "BEGIN:VEVENT",
    `UID:${f(start)}@weddingday`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:${t("ics.title")}`,
    `LOCATION:${t("venue.name")}\\, ${t("venue.addr").replace(/,/g, "\\,")}`,
    `GEO:${CONFIG.venue.lat};${CONFIG.venue.lng}`,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "wedding.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

/* ---------- Telefon ---------- */
const phoneLink = $("#phoneLink");
phoneLink.textContent = CONFIG.phone;
phoneLink.href = "tel:" + CONFIG.phone.replace(/\s/g, "");

/* ---------- Galereya lightbox ---------- */
(function lightbox() {
  const box = $("#lightbox");
  const img = $("img", box);
  const links = $$(".gallery a");
  let i = 0;
  const show = n => { i = (n + links.length) % links.length; img.src = links[i].href; };
  links.forEach((a, n) => a.addEventListener("click", e => {
    e.preventDefault(); show(n); box.hidden = false;
    requestAnimationFrame(() => box.classList.add("show"));
  }));
  const close = () => { box.classList.remove("show"); setTimeout(() => (box.hidden = true), 300); };
  $(".lightbox__close", box).onclick = close;
  $(".lightbox__prev", box).onclick = () => show(i - 1);
  $(".lightbox__next", box).onclick = () => show(i + 1);
  box.addEventListener("click", e => { if (e.target === box) close(); });
  addEventListener("keydown", e => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });
})();

/* ---------- Pastki menyuda faol bo'lim ---------- */
(function dock() {
  const links = $$(".dock a");
  const secs = links.map(a => $(a.getAttribute("href")));
  const so = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(s => s && so.observe(s));
})();
