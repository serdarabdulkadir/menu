import raw from "@/data/menu.json";

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

type RawCat = {
  id: string;
  name: L10n;
  items: Omit<Item, "category" | "categoryName" | "board">[];
};
const cats = (raw as { categories: RawCat[] }).categories;

// Tezgâhtaki gerçek panolara göre gruplama
const BOARD_DEFS: { id: string; title: string; name: L10n; ill: string; cats: string[] }[] = [
  { id: "coffee", title: "Coffee", name: { tr: "Kahve", en: "Coffee" }, ill: "kahve-dokme", cats: ["espresso", "brewed"] },
  { id: "hot", title: "Hot Drinks", name: { tr: "Sıcak İçecekler", en: "Hot Drinks" }, ill: "turk-kahvesi", cats: ["turkish-coffee", "teas", "hot-drinks", "matcha"] },
  { id: "cold", title: "Cold Drinks", name: { tr: "Soğuk İçecekler", en: "Cold Drinks" }, ill: "buzlu-kahve", cats: ["milkshake", "milk-based", "frozen", "garden-of-eden", "drinks"] },
  { id: "mocktails", title: "Mocktails", name: { tr: "Mocktailler", en: "Mocktails" }, ill: "nane-limon", cats: ["refresh", "redbull-mockail"] },
  { id: "desserts", title: "Desserts", name: { tr: "Tatlılar", en: "Desserts" }, ill: "cheesecake", cats: ["cheesecake", "desserts", "cup-of-dessert", "fruit-desserts", "cookies"] },
  { id: "croissants", title: "Croissants", name: { tr: "Kruvasanlar", en: "Croissants" }, ill: "kruvasan", cats: ["croissant", "salted-croissant"] },
  { id: "sandwiches", title: "Sandwiches", name: { tr: "Sandviç & Kahvaltı", en: "Sandwiches & Breakfast" }, ill: "sandvic", cats: ["sandwiches", "toasts", "plate", "bowl"] },
];

export const EXTRAS: Item[] = (cats.find((c) => c.id === "extras")?.items ?? []).map((i) => ({
  ...i,
  category: "extras",
  categoryName: { tr: "Ekstralar", en: "Extras" },
  board: "coffee",
}));
// Ekstralar yalnız kahve ve sıcak içecek panolarında sunulur
export const EXTRA_BOARDS = new Set(["coffee", "hot"]);

export const BOARDS: Board[] = BOARD_DEFS.map((b) => {
  const sections: Section[] = b.cats
    .map((cid) => cats.find((c) => c.id === cid))
    .filter((c): c is RawCat => !!c)
    .map((c) => ({
      id: c.id,
      name: c.name,
      items: c.items.map((i) => ({ ...i, category: c.id, categoryName: c.name, board: b.id })),
    }));
  return { id: b.id, title: b.title, name: b.name, ill: b.ill, sections, count: sections.reduce((n, s) => n + s.items.length, 0) };
});

export const BOARD_ILL: Record<string, string> = Object.fromEntries(BOARD_DEFS.map((b) => [b.id, b.ill]));
export const ALL_ITEMS: Item[] = BOARDS.flatMap((b) => b.sections.flatMap((s) => s.items));
export const ITEM_BY_ID = new Map(ALL_ITEMS.map((i) => [i.id + "@" + i.category, i]));
export const keyOf = (i: Item) => i.id + "@" + i.category;
// Seçenek listesi (gerekirse başta "Sade")
export const optionList = (i: Item, lang: Lang) => (i.options?.length ? [...(i.optionsOptional ? [lang === "tr" ? "Sade" : "Plain"] : []), ...i.options] : []);

// Vitrin: fotoğraflı öne çıkanlar
export const SHOWCASE_IDS = ["lotus-cheesecake", "egg-bowl", "pistachio-brownie", "hot-chocolate", "smoothie-bowl", "magnolia"];

// İşletme bilgisi
export const INFO = {
  open: "09:30",
  close: "00:00",
  address: "2 Nolu Beşirli Mah. Devlet Sahil Yolu Cad. No:471B, Ortahisar / Trabzon",
  maps: "https://www.google.com/maps/search/?api=1&query=Permesso+Devlet+Sahil+Yolu+Cad.+471B+Ortahisar+Trabzon",
  phone: "+905315779700",
  phoneLabel: "0531 577 97 00",
  whatsapp: "https://wa.me/905315779700",
  instagram: "https://www.instagram.com/permessotr/",
  handle: "permessotr",
};
// Şu an açık mı? (kapanış gece yarısını geçebilir)
export function isOpenNow(d = new Date()) {
  const m = d.getHours() * 60 + d.getMinutes();
  const [oh, om] = INFO.open.split(":").map(Number); const [ch, cm] = INFO.close.split(":").map(Number);
  const o = oh * 60 + om; let c = ch * 60 + cm; if (c <= o) c += 24 * 60;
  return (m >= o && m < c) || (m + 24 * 60 >= o && m + 24 * 60 < c);
}

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
export const img = (file: string | null) => (file ? `/img/urun/${file.replace(/\.[^.]+$/, "")}.webp` : null);
