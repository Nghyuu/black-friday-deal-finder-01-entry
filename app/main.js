// Router and live filtering for Bargain Beacon.
// Hash routes: #/ (all deals), #/best, #/categories, #/category/<slug>,
// #/stores, #/store/<slug>, #/deal/<id>, #/about. The home page keeps its
// search and filter state in memory while you browse; filters re-render
// the deal grid without a page reload.
import { deals, CATEGORIES } from "./data.js";
import {
  renderHome,
  renderCategories,
  renderCategoryPage,
  renderStores,
  renderStorePage,
  renderBest,
  renderDeal,
  renderAbout,
  renderNotFound,
  discountPct,
  savedAmount,
  slug,
} from "./views.js";

const app = document.getElementById("app");

// Home-page filter state. Search matches title, store and category.
const state = { q: "", category: "", store: "", minDisc: 0, sort: "pct", list: deals };

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let list = deals.filter((d) => {
    if (state.category && d.category !== state.category) return false;
    if (state.store && d.store !== state.store) return false;
    if (discountPct(d) < state.minDisc) return false;
    if (q && !(d.title + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  if (state.sort === "pct") list.sort((a, b) => discountPct(b) - discountPct(a));
  else if (state.sort === "saved") list.sort((a, b) => savedAmount(b) - savedAmount(a));
  else if (state.sort === "price") list.sort((a, b) => a.price - b.price);
  else if (state.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
  state.list = list;
}

function renderRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [page, arg] = hash.split("/");
  let html;
  if (!page) {
    applyFilters();
    html = renderHome(state);
  } else if (page === "best") html = renderBest();
  else if (page === "categories") html = renderCategories();
  else if (page === "category") {
    const cat = CATEGORIES.find((c) => slug(c) === arg);
    html = cat ? renderCategoryPage(cat) : renderNotFound("category");
  } else if (page === "stores") html = renderStores();
  else if (page === "store") {
    const store = [...new Set(deals.map((d) => d.store))].find((s) => slug(s) === arg);
    html = store ? renderStorePage(store) : renderNotFound("store");
  } else if (page === "deal") html = renderDeal(arg || "");
  else if (page === "about") html = renderAbout();
  else html = renderNotFound("page");
  app.innerHTML = html;
  for (const link of document.querySelectorAll("[data-nav]")) {
    link.classList.toggle("active", link.dataset.nav === (page || "home"));
  }
  window.scrollTo(0, 0);
}

// The toolbar is re-rendered with the page, so wire it up after each render.
// Every handler re-renders and then re-wires: without the re-wire the new
// toolbar's controls would be dead after the first keystroke.
function wireToolbar() {
  const q = document.getElementById("q");
  if (!q) return;
  q.addEventListener("input", () => {
    state.q = q.value;
    applyFilters();
    renderRoute();
    wireToolbar();
    const again = document.getElementById("q");
    again.focus();
    again.setSelectionRange(again.value.length, again.value.length);
  });
  for (const [id, key] of [["cat", "category"], ["store", "store"], ["sort", "sort"]]) {
    document.getElementById(id).addEventListener("change", (e) => {
      state[key] = e.target.value;
      applyFilters();
      renderRoute();
      wireToolbar();
    });
  }
  document.getElementById("mindisc").addEventListener("change", (e) => {
    state.minDisc = Number(e.target.value);
    applyFilters();
    renderRoute();
    wireToolbar();
  });
}

window.addEventListener("hashchange", () => {
  renderRoute();
  wireToolbar();
});

renderRoute();
wireToolbar();
