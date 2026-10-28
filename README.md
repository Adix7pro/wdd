# Adham & Sevinch — to'y taklifnomasi (28.11.2026)

Kuz uslubidagi bir sahifali taklifnoma. Build kerak emas — oddiy HTML/CSS/JS.

## Ma'lumotlarni o'zgartirish
- **Ismlar, sana, xarita koordinatalari, telefon, WhatsApp** — `assets/js/main.js` boshidagi `CONFIG`.
- **Barcha matnlar (lotin + kirill)** — `assets/js/i18n.js`.
- **Rasmlar** — `assets/img/` (`hero-couple.jpg`, `g1..g10.jpg`, `bg-forest.jpg` — fon, `bg-park.jpg` — kirish eshiklari, `footer.jpg`). Bir xil nom bilan almashtirsangiz bo'ldi.
- **Musiqa** — `assets/audio/music.mp3` qo'ysangiz, taklifnoma ochilganda chaladi va tepada tugma chiqadi.

## Cloudflare Pages'ga chiqarish
1. GitHub'da yangi repo oching va yuklang:
   ```
   git add .
   git commit -m "Wedding invitation"
   git branch -M main
   git remote add origin https://github.com/<user>/weddingday.git
   git push -u origin main
   ```
2. Cloudflare → Workers & Pages → Create → Pages → *Connect to Git* → repo'ni tanlang.
3. Framework preset: **None**, Build command: **bo'sh**, Build output directory: **/**.
4. Deploydan keyin: loyiha → *Custom domains* → `toy.sizningdomen.uz` kabi subdomen qo'shing (domen Cloudflare'da bo'lsa CNAME o'zi qo'shiladi).

Rasmlar: Unsplash (bepul litsenziya).
