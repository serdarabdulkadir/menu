"use client";
import { useMemo, useState } from "react";
import { Drawer } from "vaul";
import Fuse from "fuse.js";
import { ALL_ITEMS, norm, type Item, type Lang } from "@/lib/menu";
import { t, type Key } from "@/lib/i18n";
import { useApp } from "./store";
import { Icon } from "./ui";
import { Row } from "./BoardPage";

const FILTERS: { id: Key; test: (i: Item) => boolean }[] = [
  { id: "hot", test: (i) => i.tags.includes("hot") },
  { id: "cold", test: (i) => i.tags.includes("iced") || ["cold", "mocktails"].includes(i.board) },
  { id: "sweet", test: (i) => i.tags.includes("sweet") || i.board === "desserts" },
  { id: "savory", test: (i) => i.tags.includes("savory") || i.board === "sandwiches" },
  { id: "coffee", test: (i) => i.tags.includes("coffee") },
  { id: "photo", test: (i) => !!i.image },
];

const fuse = new Fuse(ALL_ITEMS, {
  keys: [{ name: "name.tr", weight: 3 }, { name: "name.en", weight: 3 }, { name: "categoryName.tr", weight: 1 }, { name: "categoryName.en", weight: 1 }, { name: "desc.tr", weight: 0.5 }],
  threshold: 0.32,
  ignoreLocation: true,
  getFn: (obj, path) => {
    const v = Fuse.config.getFn(obj, path);
    return Array.isArray(v) ? v.map((x) => norm(String(x))) : v ? norm(String(v)) : "";
  },
});

export function SearchDrawer() {
  const { searchOpen, setSearchOpen, lang, openProduct } = useApp();
  const [q, setQ] = useState("");
  const [on, setOn] = useState<Key[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const results = useMemo(() => {
    const base = q.trim() ? fuse.search(norm(q.trim())).map((r) => r.item) : on.length ? ALL_ITEMS : [];
    return base.filter((i) => on.every((f) => FILTERS.find((x) => x.id === f)!.test(i)));
  }, [q, on]);

  const remember = () => {
    const v = q.trim(); if (!v) return;
    const next = [v, ...recent.filter((r) => r !== v)].slice(0, 5);
    setRecent(next);
  };
  const open = (i: Item) => { remember(); setSearchOpen(false); setTimeout(() => openProduct(i), 260); };
  const L = lang as Lang;

  return (
    <Drawer.Root open={searchOpen} onOpenChange={setSearchOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[94svh] max-w-[440px] flex-col rounded-t-[24px] bg-paper outline-none">
          <Drawer.Title className="sr-only">{t("search", L)}</Drawer.Title>
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/20" />
          <div className="px-6 pt-5">
            <label className="flex items-center gap-3 border-b-[1.5px] border-ink pb-2">
              {Icon.search("h-6 w-6 shrink-0 text-ink")}
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && remember()}
                placeholder={t("searchPh", L)} inputMode="search" enterKeyHint="search"
                className="w-full bg-transparent text-[26px] text-ink caret-oak outline-none placeholder:text-ink/55" />
              {q && <button aria-label={t("clear", L)} onClick={() => setQ("")} className="-mr-2 grid h-11 w-11 place-items-center text-mut">{Icon.close("h-5 w-5")}</button>}
            </label>
            <div className="no-scrollbar -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
              {FILTERS.map((f) => {
                const a = on.includes(f.id);
                return (
                  <button key={f.id} onClick={() => setOn((s) => (a ? s.filter((x) => x !== f.id) : [...s, f.id]))}
                    aria-pressed={a} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-[6px] border px-3 py-2 text-[13.5px] transition-colors ${a ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink"}`}>
                    <span className={`grid h-3.5 w-3.5 place-items-center rounded-[3px] border ${a ? "border-paper" : "border-ink/40"}`}>{a && Icon.check("h-2.5 w-2.5")}</span>
                    {t(f.id, L)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-10 pt-3">
            {!q.trim() && !on.length ? (
              recent.length > 0 && (
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{t("recent", L)}</p>
                  {recent.map((r) => (<button key={r} onClick={() => setQ(r)} className="block w-full border-b border-ink/[0.07] py-3 text-left font-serif text-[19px] italic text-ink">{r}</button>))}
                </div>
              )
            ) : results.length ? (
              <>
                <p className="mb-1 text-[12px] text-mut"><span className="tabular">{results.length}</span> {t("results", L)}</p>
                <div className="divide-y divide-ink/[0.07]">
                  {results.map((i) => (
                    <Row key={i.id + i.category} i={i} onOpen={open} q={q} />
                  ))}
                </div>
              </>
            ) : (
              <p className="pt-10 text-center font-serif text-[19px] italic text-mut">{t("noResult", L)}</p>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
