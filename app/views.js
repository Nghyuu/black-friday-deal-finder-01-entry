// Views: pure HTML strings for each hash-routed page of Bargain Beacon.
// The router in main.js drops the returned string into #app.
import { deals, CATEGORIES, CHECKED_AT } from "./data.js";

export function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

export function discountPct(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function savedAmount(d) {
  return d.was - d.price;
}

export function signalLabel(signal) {
  if (signal === "new-low") return "NEW LOW";
  if (signal === "strong") return "STRONG PRICE";
  return "ROUTINE SALE";
}

export function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function storeSlug(store) {
  return slug(store);
}

export function categoryDeals(category) {
  return deals.filter((d) => d.category === category);
}

export function storeDeals(store) {
  return deals.filter((d) => d.store === store);
}

export function stores() {
  return [...new Set(deals.map((d) => d.store))].sort();
}

export function dealById(id) {
  return deals.find((d) => d.id === id);
}

export function checkedLabel(iso) {
  const d = new Date(iso);
  return d.toUTCString().replace(" GMT", " UTC");
}

function dealCard(d) {
  const unit = d.unit ? "<small>/mo</small>" : "";
  return `<article class="card">
    <div class="meta-row"><span class="store-badge">${esc(d.store)}</span><a class="cat-link" href="#/category/${slug(d.category)}">${esc(d.category)}</a></div>
    <h3><a href="#/deal/${d.id}">${esc(d.title)}</a></h3>
    <div class="price-row"><span class="price">${money(d.price)}${unit}</span><span class="was">was ${money(d.was)}${unit}</span><span class="pct">-${discountPct(d)}%</span></div>
    <div class="save">You save ${money(savedAmount(d))}${d.unit ? " a month" : ""}</div>
    <span class="signal ${d.signal}">${signalLabel(d.signal)}</span>
    <p class="evidence">${esc(d.evidence)}</p>
    <p class="checked">Checked ${checkedLabel(d.checked)} &middot; Source: ${esc(d.source)}</p>
    <div class="spacer"></div>
    <a class="shop-btn" href="${esc(d.url)}" target="_blank" rel="noopener">Shop at ${esc(d.store)} &nearr;</a>
    <a class="detail-link" href="#/deal/${d.id}">Deal details &rarr;</a>
  </article>`;
}

export function dealGrid(list) {
  if (!list.length) {
    return `<div class="empty"><p><strong>No deals match that search.</strong></p><p>Try a different word, or clear a filter.</p></div>`;
  }
  return `<div class="grid">${list.map(dealCard).join("")}</div>`;
}

export function renderHome(state) {
  const biggest = Math.max(...deals.map(discountPct));
  const newLows = deals.filter((d) => d.signal === "new-low").length;
  const totalSaved = deals.reduce((s, d) => s + savedAmount(d), 0);
  return `<section class="hero">
    <h1>Real Black Friday deals, <span>checked today.</span></h1>
    <p>${deals.length} deals from ${stores().length} stores, each with its sale price, usual price, discount, check time and source — plus an honest call on whether it is really a deal. No inflated “was” prices, no guesses.</p>
    <div class="stats">
      <div class="stat"><b>${deals.length}</b><span>deals checked</span></div>
      <div class="stat"><b>${stores().length}</b><span>stores</span></div>
      <div class="stat"><b>${newLows}</b><span>new lows</span></div>
      <div class="stat"><b>-${biggest}%</b><span>biggest discount</span></div>
      <div class="stat"><b>${money(totalSaved)}</b><span>total savings if you bought one of each</span></div>
    </div>
  </section>
  <section class="toolbar" aria-label="Search and filters">
    <div class="field grow"><label for="q">Search deals</label><input id="q" type="search" placeholder="Try “AirPods”, “Dyson” or “TV”…" value="${esc(state.q)}" autocomplete="off"></div>
    <div class="field"><label for="cat">Category</label><select id="cat"><option value="">All categories</option>${CATEGORIES.map((c) => `<option value="${esc(c)}" ${state.category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div>
    <div class="field"><label for="store">Store</label><select id="store"><option value="">All stores</option>${stores().map((s) => `<option value="${esc(s)}" ${state.store === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
    <div class="field"><label for="mindisc">Min. discount</label><select id="mindisc"><option value="0" ${state.minDisc === 0 ? "selected" : ""}>Any discount</option><option value="20" ${state.minDisc === 20 ? "selected" : ""}>20% off or more</option><option value="40" ${state.minDisc === 40 ? "selected" : ""}>40% off or more</option><option value="50" ${state.minDisc === 50 ? "selected" : ""}>50% off or more</option></select></div>
    <div class="field"><label for="sort">Sort by</label><select id="sort"><option value="pct" ${state.sort === "pct" ? "selected" : ""}>Biggest discount</option><option value="saved" ${state.sort === "saved" ? "selected" : ""}>Biggest saving ($)</option><option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option><option value="name" ${state.sort === "name" ? "selected" : ""}>Name A–Z</option></select></div>
  </section>
  <p class="result-count"><b>${state.list.length}</b> of ${deals.length} deals &middot; prices checked ${checkedLabel(CHECKED_AT)}</p>
  ${dealGrid(state.list)}`;
}

export function renderCategories() {
  const tiles = CATEGORIES.map((c) => {
    const list = categoryDeals(c);
    if (!list.length) return "";
    const best = Math.max(...list.map(discountPct));
    return `<a class="tile" href="#/category/${slug(c)}"><b>${esc(c)}</b><span>${list.length} deal${list.length === 1 ? "" : "s"}</span><span class="big">up to -${best}%</span></a>`;
  }).join("");
  return `<section class="page-head"><h1>Shop by category</h1><p>Fourteen categories, from headphones to pellet smokers. Every deal was checked on 27 Nov 2026.</p></section><div class="tile-grid">${tiles}</div>`;
}

export function renderCategoryPage(category) {
  const list = [...categoryDeals(category)].sort((a, b) => discountPct(b) - discountPct(a));
  if (!list.length) return renderNotFound("category");
  const best = Math.max(...list.map(discountPct));
  return `<section class="page-head"><h1>${esc(category)}</h1><p>${list.length} deal${list.length === 1 ? "" : "s"} &middot; biggest discount -${best}% &middot; <a href="#/categories">&larr; All categories</a></p></section>${dealGrid(list)}`;
}

export function renderStores() {
  const tiles = stores().map((s) => {
    const list = storeDeals(s);
    const best = Math.max(...list.map(discountPct));
    return `<a class="tile" href="#/store/${storeSlug(s)}"><b>${esc(s)}</b><span>${list.length} deal${list.length === 1 ? "" : "s"}</span><span class="big">up to -${best}%</span></a>`;
  }).join("");
  return `<section class="page-head"><h1>Shop by store</h1><p>Amazon runs Black Friday Week through 30 Nov; Best Buy through 28 Nov; Walmart and Target through 29 Nov. Prices are the ones we saw on 27 Nov 2026.</p></section><div class="tile-grid">${tiles}</div>`;
}

export function renderStorePage(store) {
  const list = [...storeDeals(store)].sort((a, b) => discountPct(b) - discountPct(a));
  if (!list.length) return renderNotFound("store");
  const best = Math.max(...list.map(discountPct));
  return `<section class="page-head"><h1>${esc(store)}</h1><p>${list.length} deal${list.length === 1 ? "" : "s"} &middot; biggest discount -${best}% &middot; <a href="#/stores">&larr; All stores</a></p></section>${dealGrid(list)}`;
}

export function renderBest() {
  const list = deals.filter((d) => d.signal === "new-low" || d.signal === "strong")
    .sort((a, b) => discountPct(b) - discountPct(a));
  const lows = deals.filter((d) => d.signal === "new-low");
  return `<section class="page-head"><h1>Best of the best</h1><p>${lows.length} new lows and ${list.length - lows.length} more strong prices — the deals where the evidence says the cut is genuine. Routine sales are left out of this page on purpose.</p></section>${dealGrid(list)}`;
}

export function renderDeal(id) {
  const d = dealById(id);
  if (!d) return renderNotFound("deal");
  const unit = d.unit ? "/month" : "";
  const related = deals.filter((x) => x.id !== d.id && (x.category === d.category || x.store === d.store)).slice(0, 4);
  return `<a class="back-link" href="#/">&larr; All deals</a>
  <article class="detail">
    <div class="meta-row"><span class="store-badge">${esc(d.store)}</span><a class="cat-link" href="#/category/${slug(d.category)}">${esc(d.category)}</a></div>
    <h1>${esc(d.title)}</h1>
    <div class="price-row"><span class="price">${money(d.price)}<small>${unit}</small></span><span class="was">was ${money(d.was)}${unit}</span><span class="pct">-${discountPct(d)}%</span></div>
    <p><strong class="save">You save ${money(savedAmount(d))}${d.unit ? " every month" : ""}.</strong> Sale ends ${esc(d.ends)}.</p>
    <div class="verdict ${d.signal}"><strong>Our call: ${signalLabel(d.signal)}.</strong> ${esc(d.evidence)}</div>
    <table class="fact-table">
      <tr><th>Store</th><td><a href="#/store/${storeSlug(d.store)}">${esc(d.store)}</a></td></tr>
      <tr><th>Category</th><td><a href="#/category/${slug(d.category)}">${esc(d.category)}</a></td></tr>
      <tr><th>Sale price</th><td>${money(d.price)}${unit}</td></tr>
      <tr><th>Usual price</th><td>${money(d.was)}${unit}</td></tr>
      <tr><th>Discount</th><td>-${discountPct(d)}% — save ${money(savedAmount(d))}${d.unit ? " a month" : ""}</td></tr>
      <tr><th>Checked</th><td>${checkedLabel(d.checked)}</td></tr>
      <tr><th>Source</th><td>${esc(d.source)}</td></tr>
      <tr><th>Sale ends</th><td>${esc(d.ends)}</td></tr>
    </table>
    <div class="detail-actions">
      <a class="shop-btn" href="${esc(d.url)}" target="_blank" rel="noopener">Shop this deal at ${esc(d.store)} &nearr;</a>
    </div>
    <p class="checked">The link opens the product search at ${esc(d.store)}. Prices move fast on Black Friday — confirm the price at checkout before you buy.</p>
  </article>
  <section class="related"><h2>More like this</h2>${dealGrid(related)}</section>`;
}

export function renderAbout() {
  return `<section class="page-head method"><h1>How we check a deal</h1>
  <p>Bargain Beacon lists only deals we read ourselves on Black Friday morning, 27 Nov 2026. Nothing here is invented, and nothing is copied from another deal site.</p>
  <ol>
    <li><strong>Find it at the store.</strong> Every deal was read from a store page or a deals roundup that names the store — Amazon, Best Buy, Walmart, Target, Disney+ or Apple TV.</li>
    <li><strong>Record the numbers.</strong> Sale price, usual price, discount and the exact time the price was checked sit on every deal card and every deal page.</li>
    <li><strong>Name the source.</strong> Each deal says where its price was read, so anyone can go and check it.</li>
    <li><strong>Call it honestly.</strong> A deal is a <strong>new low</strong> only when the sources say it is the lowest price seen; <strong>strong</strong> when the cut is deep and genuine; <strong>routine</strong> when the cut is small — a fine price, not a steal. Two deals on this site carry the routine label on purpose.</li>
    <li><strong>Link out.</strong> Every deal links to the product search at its store, so you can verify the price in one click.</li>
  </ol>
  <h2>What “usual price” means</h2>
  <p>The usual price is the price the store or the roundup lists as the regular price — the list price, not a price we made up. Where a roundup only gave a sale price with no usual price, the deal is not listed.</p>
  <h2>When prices were checked</h2>
  <p>All ${deals.length} deals were checked on 27 Nov 2026 at 06:45 UTC (13:45 WIB). Black Friday prices change through the day; the check time is on every deal so you know how fresh it is.</p>
  <p><a href="#/">&larr; Back to all deals</a></p></section>`;
}

export function renderNotFound(what) {
  return `<section class="page-head"><h1>That ${esc(what)} is not here</h1><p>The link may be old, or the deal may have sold out and been removed.</p><p><a href="#/">&larr; Back to all ${deals.length} deals</a></p></section>`;
}
