import raw from "@/data/menu.json";
import type { Info } from "./supabase";

export type Lang = "tr" | "en";
export type L10n = { tr: string; en: string };
export type Item = {
  id: string;
  name: L10n;
  desc: L10n;
  price: number | null;
  image: string | null;
  tags: string[];
  options?: string[]; // ör. Latte şurupları, bitki çayı çeşitleri
  optionsOptional?: boolean; // true: "Sade" de seçilebilir
  available: boolean;
  category: string;
  categoryName: L10n;
  board: string;
};
export type Section = { id: string; name: L10n; items: Item[] };
export type Board = {
  id: string;
  title: string; // panolardaki gibi İngilizce dikey başlık
  name: L10n;
  ill: string;
  sections: Section[];
  count: number;
};

type RawItem = Omit<Item, "category" | "categoryName" | "board" | "available"> & { available?: boolean; hidden?: boolean };
export type RawCat = { id: string; name: L10n; board?: string; items: RawItem[] };
const rawCats = (raw as { categories: RawCat[] }).categories;

// Tezgâhtaki gerçek panolar (sıra sabit); kategori hangi panoda: kategori satırındaki board alanı
const BOARD_DEFS: { id: string; title: string; name: L10n; ill: string; cats: string[] }[] = [
  { id: "coffee", title: "Coffee", name: { tr: "Kahve", en: "Coffee" }, ill: "kahve-dokme", cats: ["espresso", "brewed"] },
  { id: "hot", title: "Hot Drinks", name: { tr: "Sıcak İçecekler", en: "Hot Drinks" }, ill: "turk-kahvesi", cats: ["turkish-coffee", "teas", "hot-drinks", "matcha"] },
  { id: "cold", title: "Cold Drinks", name: { tr: "Soğuk İçecekler", en: "Cold Drinks" }, ill: "buzlu-kahve", cats: ["milkshake", "milk-based", "frozen", "garden-of-eden", "drinks"] },
  { id: "mocktails", title: "Mocktails", name: { tr: "Mocktailler", en: "Mocktails" }, ill: "nane-limon", cats: ["refresh", "redbull-mockail"] },
  { id: "desserts", title: "Desserts", name: { tr: "Tatlılar", en: "Desserts" }, ill: "cheesecake", cats: ["cheesecake", "desserts", "cup-of-dessert", "fruit-desserts", "cookies"] },
  { id: "croissants", title: "Croissants", name: { tr: "Kruvasanlar", en: "Croissants" }, ill: "kruvasan", cats: ["croissant", "salted-croissant"] },
  { id: "sandwiches", title: "Sandwiches", name: { tr: "Sandviç & Kahvaltı", en: "Sandwiches & Breakfast" }, ill: "sandvic", cats: ["sandwiches", "toasts", "plate", "bowl"] },
];

// Ekstralar yalnız kahve ve sıcak içecek panolarında sunulur
export const EXTRA_BOARDS = new Set(["coffee", "hot"]);

const DEFAULT_SHOWCASE_IDS = ["lotus-cheesecake", "coffee-latte", "lotus-croissant", "tiramisu", "mojito", "hot-chocolate", "strawberry-iced-tea", "brownie"];
export const SHOWCASE_IDS = DEFAULT_SHOWCASE_IDS;

export type InfoT = Info;
const DEFAULT_INFO: Info = {
  open: "09:30",
  close: "00:00",
  address: "2 Nolu Beşirli Mah. Devlet Sahil Yolu Cad. No:471B, Ortahisar / Trabzon",
  maps: "https://www.google.com/maps/search/?api=1&query=Permesso+Devlet+Sahil+Yolu+Cad.+471B+Ortahisar+Trabzon",
  phone: "+905315779700",
  phoneLabel: "0531 577 97 00",
  whatsapp: "https://wa.me/905315779700",
  instagram: "https://www.instagram.com/permessotr/",
  handle: "permessotr",
  wifiName: "",
  wifiPass: "",
};

// Canlı bağlamalar: applyLive ile yeniden kurulur (ES canlı bağlama; içe aktaranlar güncel değeri görür)
export let EXTRAS: Item[] = [];
export let BOARDS: Board[] = [];
export let BOARD_ILL: Record<string, string> = {};
export let ALL_ITEMS: Item[] = [];
export let ITEM_BY_ID = new Map<string, Item>();
export let SHOWCASE: Item[] = [];
export let INFO: Info = DEFAULT_INFO;

function build(cats: RawCat[], showcaseIds: string[], info: Info) {
  const conv = (c: RawCat, board: string, categoryName: L10n): Item[] =>
    c.items.filter((i) => !i.hidden).map((i) => ({ ...i, available: i.available !== false, category: c.id, categoryName, board }));
  const isEx = (c: RawCat) => c.id === "extras" || c.board === "extras";
  EXTRAS = cats.filter(isEx).flatMap((c) => conv(c, "coffee", { tr: "Ekstralar", en: "Extras" }).map((i) => ({ ...i, category: "extras" })));
  BOARDS = BOARD_DEFS.map((b) => {
    // Varsayılan paket verisinde board alanı yoksa sabit listeyi kullan
    const mine = cats.filter((c) => !isEx(c) && (c.board ? c.board === b.id : b.cats.includes(c.id)));
    if (!mine.some((c) => c.board)) mine.sort((x, y) => b.cats.indexOf(x.id) - b.cats.indexOf(y.id));
    const sections: Section[] = mine.map((c) => ({ id: c.id, name: c.name, items: conv(c, b.id, c.name) }));
    return { id: b.id, title: b.title, name: b.name, ill: b.ill, sections, count: sections.reduce((n, s) => n + s.items.length, 0) };
  });
  BOARD_ILL = Object.fromEntries(BOARD_DEFS.map((b) => [b.id, b.ill]));
  ALL_ITEMS = BOARDS.flatMap((b) => b.sections.flatMap((s) => s.items));
  ITEM_BY_ID = new Map(ALL_ITEMS.map((i) => [i.id + "@" + i.category, i]));
  SHOWCASE = showcaseIds.map((id) => ALL_ITEMS.find((i) => i.id === id)).filter((i): i is Item => !!i && !!i.image);
  INFO = info;
}
build(rawCats, DEFAULT_SHOWCASE_IDS, DEFAULT_INFO);

// Sürüm sayacı: useSyncExternalStore(subscribeMenu, menuVersion, () => 0)
let version = 0;
const menuListeners = new Set<() => void>();
export function applyLive(cats: RawCat[], showcase: string[], info: Info) {
  build(cats, showcase, info);
  version++;
  menuListeners.forEach((l) => l());
}
export function subscribeMenu(cb: () => void) { menuListeners.add(cb); return () => { menuListeners.delete(cb); }; }
export const menuVersion = () => version;

export const keyOf = (i: Item) => i.id + "@" + i.category;
// Seçenek listesi (gerekirse başta "Sade")
export const PLAIN = "plain"; // dil bağımsız kimlik
export const optionLabel = (id: string, lang: Lang) => (id === PLAIN ? (lang === "tr" ? "Sade" : "Plain") : id);
export const optionList = (i: Item, lang: Lang) =>
  (i.options?.length ? [...(i.optionsOptional ? [PLAIN] : []), ...i.options] : []).map((id) => ({ id, label: optionLabel(id, lang) }));

// Saat Türkiye saatiyle (telefon başka saat diliminde olsa da)
function trMinutes(d: Date) {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d).split(":").map(Number);
  return h * 60 + m;
}
function span() {
  const [oh, om] = INFO.open.split(":").map(Number); const [ch, cm] = INFO.close.split(":").map(Number);
  const o = oh * 60 + om; let c = ch * 60 + cm; if (c <= o) c += 24 * 60;
  return { o, c };
}
// Kapanışa kalan dakika; kapalıysa 0 (gece yarısını geçen kapanış dahil)
export function minutesToClose(d = new Date()) {
  const m = trMinutes(d); const { o, c } = span();
  for (const x of [m, m + 24 * 60]) if (x >= o && x < c) return c - x;
  return 0;
}
export const isOpenNow = (d = new Date()) => minutesToClose(d) > 0;

// Dakika saati: useSyncExternalStore(subscribeMinute, minuteNow, () => null)
// Dakika sınırına hizalı tek zamanlayıcı; 09:30 / 00:00 geçişinde arayüz kendiliğinden güncellenir
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
const schedule = () => { timer = setTimeout(() => { listeners.forEach((l) => l()); schedule(); }, 60000 - (Date.now() % 60000) + 50); };
export function subscribeMinute(cb: () => void) {
  listeners.add(cb);
  if (!timer) schedule();
  const onVis = () => { if (document.visibilityState === "visible") cb(); };
  document.addEventListener("visibilitychange", onVis);
  return () => { listeners.delete(cb); document.removeEventListener("visibilitychange", onVis); if (!listeners.size && timer) { clearTimeout(timer); timer = null; } };
}
export const minuteNow = () => Math.floor(Date.now() / 60000);


export const MOODS: { id: string; label: L10n; boards: string[] }[] = [
  { id: "uyan", label: { tr: "Uyan", en: "Wake up" }, boards: ["coffee", "hot"] },
  { id: "serinle", label: { tr: "Serinle", en: "Cool down" }, boards: ["cold", "mocktails"] },
  { id: "tatli", label: { tr: "Tatlı bir kaçamak", en: "Something sweet" }, boards: ["desserts", "croissants"] },
  { id: "doyur", label: { tr: "Doyur", en: "Fill up" }, boards: ["sandwiches"] },
];

// Türkçe karakter duyarsız arama: "cay" → "çay"
export function norm(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/i̇/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u");
}

export const price = (n: number | null) => (n == null ? "—" : n.toLocaleString("tr-TR") + " ₺");
export const img = (file: string | null) => (file ? (file.startsWith("http") ? file : `/img/urun/${file.replace(/\.[^.]+$/, "")}.webp`) : null);
