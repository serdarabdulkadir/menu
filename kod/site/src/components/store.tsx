"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { EXTRAS, ITEM_BY_ID, keyOf, type Item, type Lang } from "@/lib/menu";

export type Line = { key: string; itemKey: string; extras: string[]; qty: number };
export type View = { name: "intro" } | { name: "wall" } | { name: "board"; id: string } | { name: "table" } | { name: "show" };

type Ctx = {
  lang: Lang; setLang: (l: Lang) => void;
  view: View; go: (v: View) => void;
  product: Item | null; openProduct: (i: Item | null) => void;
  searchOpen: boolean; setSearchOpen: (b: boolean) => void;
  lines: Line[]; add: (i: Item, extras: string[], qty: number) => void; setQty: (key: string, q: number) => void;
  note: string; setNote: (s: string) => void;
  count: number; total: number;
  lineTotal: (l: Line) => number;
  masa: string | null;
};
const C = createContext<Ctx | null>(null);
export const useApp = () => useContext(C)!;

const EXTRA_PRICE = new Map(EXTRAS.map((e) => [e.id, e.price ?? 0]));

export function Provider({ children }: { children: React.ReactNode }) {
  const [lang, setLangS] = useState<Lang>("tr");
  const [view, setView] = useState<View>({ name: "intro" });
  const [product, openProduct] = useState<Item | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState("");
  // Masa numarası QR adresinden gelir: …/?masa=7
  const [masa] = useState<string | null>(() => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("masa")?.replace(/[^0-9A-Za-z-]/g, "").slice(0, 6) || null));

  // Kalıcılık yok: sayfa kapanınca Seçtiklerim, not ve dil sıfırlanır (kullanıcı isteği)
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // Ekran geçişleri: tarayıcının View Transitions'ı (GPU'da anlık görüntüyle oynar, React'i her karede çizmez)
  const go = useCallback((v: View) => {
    const run = () => { flushSync(() => setView(v)); window.scrollTo({ top: 0 }); };
    type VT = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };
    const d = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Geçiş yarıda kesilirse (ör. ekran döndü) ekran yine değişir; hatayı sessizce yut
      const vt = d.startViewTransition(run);
      vt.ready.catch(() => {}); vt.finished.catch(() => {}); vt.updateCallbackDone.catch(() => {});
    } else run();
  }, []);

  const add = useCallback((i: Item, extras: string[], qty: number) => {
    const itemKey = keyOf(i);
    const key = itemKey + "|" + [...extras].sort().join(",");
    setLines((ls) => {
      const f = ls.find((l) => l.key === key);
      return f ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)) : [...ls, { key, itemKey, extras, qty }];
    });
    navigator.vibrate?.(12);
  }, []);
  const setQty = useCallback((key: string, q: number) => {
    setLines((ls) => (q <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty: q } : l))));
  }, []);
  const lineTotal = useCallback((l: Line) => {
    const base = ITEM_BY_ID.get(l.itemKey)?.price ?? 0;
    return (base + l.extras.reduce((s, e) => s + (EXTRA_PRICE.get(e) ?? 0), 0)) * l.qty;
  }, []);

  const value = useMemo<Ctx>(() => ({
    lang, setLang: setLangS, view, go, product, openProduct, searchOpen, setSearchOpen,
    lines, add, setQty, note, setNote, lineTotal, masa,
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + lineTotal(l), 0),
  }), [lang, view, go, product, searchOpen, lines, add, setQty, note, lineTotal, masa]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
