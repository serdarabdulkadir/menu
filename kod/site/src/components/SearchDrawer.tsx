"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Drawer } from "vaul";
import Fuse from "fuse.js";
import { ALL_ITEMS, BOARDS, SHOWCASE, img, menuVersion, subscribeMenu, price, norm, type Item, type Lang } from "@/lib/menu";
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

const FADE = { maskImage: "linear-gradient(to right, #000 calc(100% - 28px), transparent)", WebkitMaskImage: "linear-gradient(to right, #000 calc(100% - 28px), transparent)" };
const LABEL = "text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut";

const makeFuse = () => new Fuse(ALL_ITEMS, {
  keys: [{ name: "name.tr", weight: 3 }, { name: "name.en", weight: 3 }, { name: "categoryName.tr", weight: 1 }, { name: "categoryName.en", weight: 1 }, { name: "desc.tr", weight: 0.5 }, { name: "desc.en", weight: 0.5 }, { name: "options", weight: 1 }],
  threshold: 0.32,
  ignoreLocation: true,
  getFn: (obj, path) => {
    const v = Fuse.config.getFn(obj, path);
    return Array.isArray(v) ? v.map((x) => norm(String(x))) : v ? norm(String(v)) : "";
  },
});

export function SearchDrawer() {
  const { searchOpen, setSearchOpen, lang, openProduct, go } = useApp();
  const menuV = useSyncExternalStore(subscribeMenu, menuVersion, () => 0);
  const fuse = useMemo(() => (menuV >= 0 ? makeFuse() : null!), [menuV]);
  const [q, setQ] = useState("");
  const [on, setOn] = useState<Key[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const results = useMemo(() => {
    const base = q.trim() ? fuse.search(norm(q.trim())).map((r) => r.item) : on.length ? ALL_ITEMS : [];
    return base.filter((i) => on.every((f) => FILTERS.find((x) => x.id === f)!.test(i)));
  }, [q, on, fuse]);

  const remember = () => {
    const v = q.trim(); if (!v) return;
    const next = [v, ...recent.filter((r) => r !== v)].slice(0, 5);
    setRecent(next);
  };
  const open = (i: Item) => { remember(); setSearchOpen(false); setTimeout(() => openProduct(i), 260); };
  const L = lang as Lang;

  const boards = (
    <div className="mt-7">
      <p className={LABEL}>{t("boards", L)}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-4">
        {BOARDS.map((b) => (
          <button key={b.id} onClick={() => { setSearchOpen(false); go({ name: "board", id: b.id }); }}
            className="flex min-h-14 items-center gap-3 border-b border-ink/[0.07] py-2 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/img/ill/${b.ill}.webp`} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
            <span className="min-w-0">
              <span className="block truncate font-serif text-[16px] italic leading-tight text-ink">{b.name[L]}</span>
              <span className="tabular block text-[11.5px] text-mut">{b.count} {t("items", L)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );

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
            <div style={FADE} className="no-scrollbar -mx-6 mt-4 flex gap-2 overflow-x-auto pl-6 pr-10 pb-1">
              {FILTERS.map((f) => {
                const a = on.includes(f.id);
                return (
                  <button key={f.id} onClick={() => setOn((s) => (a ? s.filter((x) => x !== f.id) : [...s, f.id]))}
                    aria-pressed={a} className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-[13.5px] transition-colors ${a ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink"}`}>
                    {t(f.id, L)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-10 pt-3">
            {!q.trim() && !on.length ? (
              <div>
                {recent.length > 0 && (
                  <div className="mb-7">
                    <p className={LABEL}>{t("recent", L)}</p>
                    {recent.map((r) => (<button key={r} onClick={() => setQ(r)} className="block w-full border-b border-ink/[0.07] py-3 text-left font-serif text-[19px] italic text-ink">{r}</button>))}
                  </div>
                )}
                <p className={LABEL}>{t("showcase", L)}</p>
                <div style={FADE} className="no-scrollbar -mx-6 mt-3 flex gap-3 overflow-x-auto pl-6 pr-10 pb-3">
                  {SHOWCASE.map((i) => (
                    <button key={i.id} onClick={() => open(i)} className="w-[128px] shrink-0 text-left">
                      <span className="block rounded-[6px] border border-ink/10 bg-paper p-1.5 shadow-[0_6px_14px_-8px_rgba(64,42,18,.45)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img(i.image) ?? ""} alt="" loading="lazy" className="h-[140px] w-full rounded-[3px] object-cover" />
                      </span>
                      <span className="mt-2 block truncate font-serif text-[15px] italic leading-tight text-ink">{i.name[L]}</span>
                      <span className="tabular block text-[12px] text-mut">{price(i.price)}</span>
                    </button>
                  ))}
                </div>
                {boards}
              </div>
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
              <>
                <p className="pt-10 text-center font-serif text-[19px] italic text-mut">{t("noResult", L)}</p>
                {boards}
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
