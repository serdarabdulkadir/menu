"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { EXTRAS, ITEM_BY_ID, keyOf, menuVersion, subscribeMenu, type Item, type Lang } from "@/lib/menu";

export type Line = { key: string; itemKey: string; extras: string[]; option?: string; qty: number };
export type View = { name: "intro" } | { name: "wall" } | { name: "board"; id: string } | { name: "table" } | { name: "show" };

type Ctx = {
  lang: Lang; setLang: (l: Lang) => void;
  view: View; go: (v: View, opts?: { instant?: boolean }) => void;
  product: Item | null; openProduct: (i: Item | null) => void;
  searchOpen: boolean; setSearchOpen: (b: boolean) => void;
  infoOpen: boolean; setInfoOpen: (b: boolean) => void;
  lines: Line[]; add: (i: Item, extras: string[], qty: number, option?: string, silent?: boolean) => void; announce: () => void; removeOne: (itemKey: string) => void; setQty: (key: string, q: number) => void; clearList: () => void;
  note: string; setNote: (s: string) => void;
  count: number; total: number;
  lineTotal: (l: Line) => number;
  masa: string | null;
  menuV: number;
};
const C = createContext<Ctx | null>(null);
export const useApp = () => useContext(C)!;

const PICKS_KEY = "permesso-picks";
const PICKS_TTL = 30 * 60 * 1000;

export function Provider({ children }: { children: React.ReactNode }) {
  const menuV = useSyncExternalStore(subscribeMenu, menuVersion, () => 0);
  const [lang, setLangS] = useState<Lang>("tr");
  const [view, setView] = useState<View>({ name: "intro" });
  const [product, openProduct] = useState<Item | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState("");
  // Masa numarası QR adresinden gelir: …/?masa=7
  const [masa] = useState<string | null>(() => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("masa")?.replace(/[^0-9A-Za-z-]/g, "").slice(0, 6) || null));

  // Seçtiklerim + not: 30 dk hareketsizlikte sıfırlanan süreli hafıza (masa ve dil kalıcı değil)
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PICKS_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { v?: number; at?: number; lines?: Line[]; note?: string };
        if (d.v === 1 && typeof d.at === "number" && Date.now() - d.at <= PICKS_TTL && Array.isArray(d.lines)) {
          const ok = d.lines.filter((l) => l && typeof l.key === "string" && typeof l.qty === "number" && l.qty > 0 && Array.isArray(l.extras) && ITEM_BY_ID.has(l.itemKey));
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLines(ok);
          setNote(typeof d.note === "string" ? d.note.slice(0, 500) : "");
        } else localStorage.removeItem(PICKS_KEY);
      }
    } catch { /* bozuk kayıt ya da depolama kapalı */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      if (lines.length === 0 && !note) localStorage.removeItem(PICKS_KEY);
      else localStorage.setItem(PICKS_KEY, JSON.stringify({ v: 1, at: Date.now(), lines, note }));
    } catch { /* kota / özel mod */ }
  }, [lines, note]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // Ekran geçişleri: tarayıcının View Transitions'ı (GPU'da anlık görüntüyle oynar, React'i her karede çizmez)
  const go = useCallback((v: View, opts?: { instant?: boolean }) => {
    if (opts?.instant) { window.scrollTo({ top: 0 }); flushSync(() => setView(v)); return; }
    const run = () => { flushSync(() => setView(v)); window.scrollTo({ top: 0 }); };
    type VT = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };
    const d = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Geçiş yarıda kesilirse (ör. ekran döndü) ekran yine değişir; hatayı sessizce yut
      const vt = d.startViewTransition(run);
      vt.ready.catch(() => {}); vt.finished.catch(() => {}); vt.updateCallbackDone.catch(() => {});
    } else run();
  }, []);

  // Ekleme bildirimi: tek yerde, "Gör" eylemiyle Masa'ya götürür
  const announce = useCallback(() => {
    toast(t("addedToast", lang), { action: { label: t("view", lang), onClick: () => go({ name: "table" }) } });
  }, [lang, go]);

  const add = useCallback((i: Item, extras: string[], qty: number, option?: string, silent?: boolean) => {
    const itemKey = keyOf(i);
    const key = itemKey + "|" + [...extras].sort().join(",") + (option ? "|" + option : "");
    setLines((ls) => {
      const f = ls.find((l) => l.key === key);
      return f ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)) : [...ls, { key, itemKey, extras, option, qty }];
    });
    navigator.vibrate?.(12);
    if (!silent) announce();
  }, [announce]);
  // Bu üründen en son eklenen satırdan bir tane düş
  const removeOne = useCallback((itemKey: string) => {
    setLines((ls) => {
      const idx = ls.map((l) => l.itemKey).lastIndexOf(itemKey);
      if (idx < 0) return ls;
      const l = ls[idx];
      return l.qty > 1 ? ls.map((x, n) => (n === idx ? { ...x, qty: x.qty - 1 } : x)) : ls.filter((_, n) => n !== idx);
    });
  }, []);
  // Listeyi temizle: geri alınabilir
  const clearList = useCallback(() => {
    const prevLines = lines; const prevNote = note;
    setLines([]); setNote("");
    toast(t("listCleared", lang), { action: { label: t("undo", lang), onClick: () => { setLines(prevLines); setNote(prevNote); } } });
  }, [lines, note, lang]);
  const setQty = useCallback((key: string, q: number) => {
    setLines((ls) => (q <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty: q } : l))));
  }, []);
  const lineTotal = useCallback((l: Line) => {
    const EXTRA_PRICE = new Map(EXTRAS.map((e) => [e.id, e.price ?? 0]));
    const base = ITEM_BY_ID.get(l.itemKey)?.price ?? 0;
    return (base + l.extras.reduce((s, e) => s + (EXTRA_PRICE.get(e) ?? 0), 0)) * l.qty;
  }, []);

  const value = useMemo<Ctx>(() => ({
    lang, setLang: setLangS, view, go, product, openProduct, searchOpen, setSearchOpen, infoOpen, setInfoOpen,
    lines, add, announce, removeOne, setQty, clearList, note, setNote, lineTotal, masa, menuV,
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + lineTotal(l), 0),
  }), [lang, view, go, product, searchOpen, infoOpen, lines, add, announce, removeOne, setQty, clearList, note, lineTotal, masa, menuV]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
