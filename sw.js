/* オフラインでもスライドを開けるようにする仕組み（Service Worker）。tools/publish.js が書き出すときに中身を埋める。直接は編集しない。
   ・スライドと目次（.html）：ネットを優先して最新版を取る。3秒たっても返事がなければ、端末に保存してある版を出す。
   ・KaTeX と Google Fonts：端末に保存したものを使う（一度取れば変わらないため）。
   ・ページを開いたら、科目の全スライドを裏で1つずつ取って保存する（まだ開いていない回もオフラインで開けるように）。
     中身が変わったものだけ取り直す（ハッシュで判断）。 */
const NS = "suu1-slides";
const VERSION = "6a639c4914e8";
const FILES = {
 "index.html": "5f44db2edc38",
 "quadratic/3-17_furikaeri-niji.html": "eaad0eb72b68",
 "quadratic/3-18_setsumatsu-mondai.html": "73b60d2547db",
 "quadratic/katex/katex.min.css": "3f94e1b737ae",
 "quadratic/katex/katex.min.js": "4881bfc93aaf",
 "quadratic/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "quadratic/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "quadratic/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "quadratic/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "quadratic/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "quadratic/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "quadratic/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "quadratic/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "quadratic/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "quadratic/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "quadratic/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "quadratic/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "quadratic/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "quadratic/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "quadratic/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "quadratic/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "quadratic/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "quadratic/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "quadratic/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "quadratic/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "trig-ratio/4-1_eikaku-sankakuhi.html": "b23ee2359a5c",
 "trig-ratio/4-2_sankakuhi-riyou.html": "01a26c7b4b60",
 "trig-ratio/4-3_sougo-kankei.html": "b2023410d9b8",
 "trig-ratio/4-4_sankakuhi-kakuchou.html": "e3dcb617b954",
 "trig-ratio/4-5_kaku-motomeru.html": "22b9ffab67f6",
 "trig-ratio/4-6_furikaeri-sankakuhi.html": "ede728939c60",
 "trig-ratio/4-7_setsumatsu-sankakuhi.html": "c9308383a46d",
 "trig-ratio/4-8_seigen-teiri.html": "fcdf6d2db3f5",
 "trig-ratio/4-9_yogen-teiri.html": "793300c9df4d",
 "trig-ratio/4-10_menseki.html": "7d17a3013871",
 "trig-ratio/4-11_zukei-keiryou.html": "6737722cd673",
 "trig-ratio/4-12_furikaeri-seigen-yogen.html": "613971a7001b",
 "trig-ratio/4-13_setsumatsu-seigen-yogen.html": "d41a29acde83",
 "trig-ratio/katex/katex.min.css": "3f94e1b737ae",
 "trig-ratio/katex/katex.min.js": "4881bfc93aaf",
 "trig-ratio/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "trig-ratio/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "trig-ratio/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "trig-ratio/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "trig-ratio/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "trig-ratio/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "trig-ratio/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "trig-ratio/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "trig-ratio/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "trig-ratio/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "trig-ratio/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "trig-ratio/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "trig-ratio/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "trig-ratio/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "trig-ratio/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "trig-ratio/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "trig-ratio/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "trig-ratio/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "trig-ratio/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "trig-ratio/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "data-analysis/5-1_data-seiri.html": "de0b83e293af",
 "data-analysis/5-2_daihyouchi.html": "ddba07fcafe1",
 "data-analysis/5-3_data-chirabari.html": "873270153269",
 "data-analysis/5-4_data-soukan.html": "5d77a8636e1d",
 "data-analysis/5-5_soukan-keisuu.html": "4aa06577259b",
 "data-analysis/5-6_kasetsu-kentei.html": "0e816372ad2c",
 "data-analysis/5-7_furikaeri-chirabari.html": "d162b3efb4c2",
 "data-analysis/5-8_mondai-a.html": "fb7245945683",
 "data-analysis/5-9_shoumatsu-mondai.html": "39f1573403a2",
 "data-analysis/katex/katex.min.css": "3f94e1b737ae",
 "data-analysis/katex/katex.min.js": "4881bfc93aaf",
 "data-analysis/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "data-analysis/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "data-analysis/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "data-analysis/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "data-analysis/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "data-analysis/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "data-analysis/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "data-analysis/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "data-analysis/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "data-analysis/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "data-analysis/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "data-analysis/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "data-analysis/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "data-analysis/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "data-analysis/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "data-analysis/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "data-analysis/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "data-analysis/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "data-analysis/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "data-analysis/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6"
};                 // 公開フォルダからの相対パス → 元ファイルのハッシュ
const FONT_CSS = [
 "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap",
 "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Noto+Serif:ital@1&display=swap"
];           // スライドが読み込む Google Fonts の CSS
const PAGES = NS + ':pages', FONTS = NS + ':fonts', META = NS + ':meta';
const TIMEOUT = 3000;
const BASE = new URL('./', self.location).href;

// URL の ? と # を取り、フォルダで終わるときは index.html を付ける（保存の名前をそろえる）
function keyOf(u) {
  const x = new URL(u); x.search = ''; x.hash = '';
  if (x.pathname.endsWith('/')) x.pathname += 'index.html';
  return x.href;
}
const isPage = k => k.endsWith('.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// リダイレクトを経た応答はページの表示に使えないことがあるので、中身だけの応答に作り直す
async function clean(r) {
  if (!r.redirected) return r;
  return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: r.headers });
}
async function fetchFresh(key) {
  return clean(await fetch(key, { cache: 'no-cache', credentials: 'same-origin' }));
}

// 全ファイルを順に保存する。同時に何本も取りに行かないので、回線が弱くても授業の表示を邪魔しにくい
let filling = null;
function fill() {
  if (!filling) filling = (async () => {
    const pages = await caches.open(PAGES), meta = await caches.open(META);
    let saved = {};
    try { const m = await meta.match('hashes'); if (m) saved = await m.json(); } catch (e) {}
    const want = new Set();
    for (const [rel, h] of Object.entries(FILES)) {
      const key = new URL(rel, BASE).href; want.add(key);
      if (saved[rel] === h && await pages.match(key)) continue;
      try {
        const r = await fetchFresh(key);
        if (!r.ok) continue;
        await pages.put(key, r);
        saved[rel] = h;
        await meta.put('hashes', new Response(JSON.stringify(saved)));
      } catch (e) { break; }          // つながらなくなったらやめて、次に開いたときに続きから
    }
    // 公開をやめたファイルは消す
    for (const req of await pages.keys()) if (!want.has(req.url)) await pages.delete(req);
    // フォント：日本語のフォントは文字の範囲ごとに小さなファイルに分かれていて、ふだんは表示した文字の分だけ取る。
    // まだ開いていないスライドの文字もオフラインで出るように、全部の範囲を最後に1つずつ保存する
    const fonts = await caches.open(FONTS);
    for (const css of FONT_CSS) {
      try {
        let r = await fonts.match(css);
        if (!r) { r = await fetchFont(css); if (!r) continue; await fonts.put(css, r.clone()); }
        const urls = [...new Set((await r.text()).match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [])];
        for (const u of urls) {
          if (await fonts.match(u)) continue;
          const f = await fetchFont(u); if (f) await fonts.put(u, f);
        }
      } catch (e) { break; }
    }
  })().finally(() => { filling = null; });
  return filling;
}

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith(NS + ':') && ![PAGES, FONTS, META].includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data === 'fill') e.waitUntil(fill()); });

// ネット優先（3秒で保存してある版に切り替え）。取れた最新版は保存しておく
async function networkFirst(e, key) {
  const pages = await caches.open(PAGES);
  const net = fetchFresh(key).then(async r => { if (r.ok) await pages.put(key, r.clone()); return r; });
  e.waitUntil(net.catch(() => {}));
  const cached = await pages.match(key);
  if (!cached) return net.catch(() => offline());
  return Promise.race([
    net.then(r => (r.status >= 500 ? cached : r), () => cached),
    sleep(TIMEOUT).then(() => cached),
  ]);
}
// 保存してあればそれを使う。なければ取って保存する（取れなかった応答は保存しない）
async function cacheFirst(req, name, key) {
  const c = await caches.open(name);
  const hit = await c.match(key);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok) await c.put(key, r.clone());
  return r;
}
// Google Fonts は CORS で取る（中身の成否が分かるので、失敗した応答を保存せずにすむ）
async function fetchFont(u) {
  const r = await fetch(u, { mode: 'cors', credentials: 'omit' });
  return r.ok ? r : null;
}
async function fontFirst(req) {
  const c = await caches.open(FONTS);
  const hit = await c.match(req.url);
  if (hit) return hit;
  const r = await fetchFont(req.url).catch(() => null);
  if (r) { await c.put(req.url, r.clone()); return r; }
  return fetch(req);
}
function offline() {
  return new Response('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;padding:2em;line-height:1.8">'
    + '<h2>ネットにつながっていません</h2><p>このページはまだこの端末に保存されていません。<br>ネットにつながる場所で一度開くと、次からはつながっていなくても開けます。</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') {
    e.respondWith(fontFirst(req).catch(() => new Response('', { status: 504 })));
    return;
  }
  if (!req.url.startsWith(BASE)) return;
  const key = keyOf(req.url);
  if (req.mode === 'navigate' || isPage(key)) e.respondWith(networkFirst(e, key));
  else e.respondWith(caches.open(PAGES).then(c => c.match(key)).then(hit => hit || cacheFirst(req, PAGES, key)));
});
