// Taklifnoma .md faylini telegra.ph sahifasiga aylantiradi.
// Telegram telegra.ph havolalarini har doim Instant View bilan ochadi.
//
//   node telegram/publish.mjs telegram/taklifnoma.md          — chop etish / yangilash
//   node telegram/publish.mjs telegram/taklifnoma.md --dry    — faqat tekshirish, hech narsa yubormaydi
//
// Birinchi marta telegra.ph akkaunt yaratiladi va kaliti telegram/.telegraph.json ga saqlanadi
// (u .gitignore da). Keyingi ishga tushirishlarda o'sha sahifa yangilanadi, havola o'zgarmaydi.

import fs from "node:fs";
import path from "node:path";

const API = "https://api.telegra.ph";
const AUTHOR = "Choriyevlar oilasi";
const AUTHOR_URL = "https://weddingday.newworld.uz/";
const STATE = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), ".telegraph.json");

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) {
  console.error("Foydalanish: node telegram/publish.mjs telegram/taklifnoma.md [--dry]");
  process.exit(1);
}

/* ---------- Markdown -> Telegraph Node ---------- */

// Qator ichidagi **qalin**, *kursiv* va [havola](url)
function inline(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((\S+?)\)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push({ tag: "strong", children: inline(m[1]) });
    else if (m[2] !== undefined) out.push({ tag: "em", children: inline(m[2]) });
    else out.push({ tag: "a", attrs: { href: m[4] }, children: inline(m[3]) });
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Bir nechta qatorni <br> bilan birlashtiradi
function lines(arr) {
  return arr.flatMap((l, i) => (i ? [{ tag: "br" }, ...inline(l)] : inline(l)));
}

function convert(md) {
  const src = md.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  const nodes = [];
  let para = [], quote = [];

  const flush = () => {
    if (para.length) { nodes.push({ tag: "p", children: lines(para) }); para = []; }
    if (quote.length) { nodes.push({ tag: "blockquote", children: lines(quote) }); quote = []; }
  };

  for (const raw of src) {
    const l = raw.trim();
    let m;
    if (!l) { flush(); continue; }
    if ((m = l.match(/^# (.+)/)) && !title) { flush(); title = m[1]; continue; }
    if ((m = l.match(/^#{2} (.+)/))) { flush(); nodes.push({ tag: "h3", children: inline(m[1]) }); continue; }
    if ((m = l.match(/^#{3,} (.+)/))) { flush(); nodes.push({ tag: "h4", children: inline(m[1]) }); continue; }
    if (/^-{3,}$/.test(l)) { flush(); nodes.push({ tag: "hr" }); continue; }
    if ((m = l.match(/^!\[(.*?)\]\((\S+?)\)$/))) {
      flush();
      const fig = [{ tag: "img", attrs: { src: m[2] } }];
      if (m[1]) fig.push({ tag: "figcaption", children: [m[1]] });
      nodes.push({ tag: "figure", children: fig });
      continue;
    }
    if ((m = l.match(/^> ?(.*)/))) { if (para.length) flush(); quote.push(m[1]); continue; }
    if (quote.length) flush();
    para.push(l);
  }
  flush();
  return { title, nodes };
}

/* ---------- Telegraph API ---------- */

async function call(method, params) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.error}`);
  return data.result;
}

const { title, nodes } = convert(fs.readFileSync(file, "utf8"));
if (!title) throw new Error("Faylning birinchi qatori '# Sarlavha' bo'lishi kerak");

const size = Buffer.byteLength(JSON.stringify(nodes));
console.log(`Sarlavha: ${title}`);
console.log(`Bloklar: ${nodes.length}, hajm: ${(size / 1024).toFixed(1)} KB (chegara 64 KB)`);

if (dry) {
  console.log(JSON.stringify(nodes, null, 1).slice(0, 1500) + "\n...");
  process.exit(0);
}

let state = {};
try { state = JSON.parse(fs.readFileSync(STATE, "utf8")); } catch {}

if (!state.token) {
  const acc = await call("createAccount", { short_name: "Choriyevlar", author_name: AUTHOR, author_url: AUTHOR_URL });
  state.token = acc.access_token;
  state.pages = {};
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
}

const key = path.basename(file);
const params = { access_token: state.token, title, author_name: AUTHOR, author_url: AUTHOR_URL, content: nodes };
const page = state.pages?.[key]
  ? await call(`editPage/${state.pages[key]}`, params)
  : await call("createPage", params);

state.pages = { ...state.pages, [key]: page.path };
fs.writeFileSync(STATE, JSON.stringify(state, null, 2));

console.log(`\nTayyor: ${page.url}`);
console.log("Shu havolani Telegram'da yuboring — u Instant View bilan ochiladi.");
