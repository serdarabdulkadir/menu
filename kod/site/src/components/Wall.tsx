"use client";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import { BOARDS, MOODS, type Board } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useApp } from "./store";
import { Frame, Icon, Logo } from "./ui";

export function BottomBar({ inset = false }: { inset?: boolean }) {
  const { lang, setSearchOpen, go, count } = useApp();
  return (
    <div style={{ viewTransitionName: "bottombar" }} className={`fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px] ${inset ? "px-[14px] pb-[14px]" : ""}`}>
      <div className="flex items-center border-t border-ink/12 bg-paper px-6 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5">
        <button onClick={() => setSearchOpen(true)} className="flex min-h-11 items-center gap-2.5 text-[15px] text-ink">
          {Icon.search("h-[22px] w-[22px]")} {t("search", lang)}
        </button>
        <span className="mx-auto h-6 w-px bg-ink/15" />
        <button onClick={() => go({ name: "table" })} className="flex min-h-11 items-center gap-2.5 text-[15px] text-ink">
          {Icon.list("h-[22px] w-[22px]")} {t("picks", lang)}
          {count > 0 && <motion.span key={count} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="tabular grid h-7 min-w-7 place-items-center rounded-full bg-oak px-1.5 text-[13px] font-semibold text-ink">{count}</motion.span>}
        </button>
      </div>
    </div>
  );
}

// Pano duvarında kalınan yer (panodan geri dönünce başa sarmasın)
let lastSel = 0;

function WallBoard({ b, active }: { b: Board; active: boolean }) {
  const { lang, go } = useApp();
  // Gerçek panolardaki gibi gruplu önizleme: ilk iki bölüm, en çok 6 satır
  const groups: { name: string; items: Board["sections"][number]["items"] }[] = [];
  let left = 6;
  for (const s of b.sections.slice(0, 2)) { if (left <= 0) break; const it = s.items.slice(0, left); groups.push({ name: s.name.en, items: it }); left -= it.length; }
  const open = () => go({ name: "board", id: b.id });
  return (
    <Frame b={14} onClick={open} role="button" tabIndex={0} aria-label={`${b.name[lang]} — ${t("openBoard", lang)}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      style={{ height: "clamp(440px, calc(100svh - 240px), 540px)", viewTransitionName: `board-${b.id}` }}
      className={`board-card relative w-[300px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-oak cursor-pointer select-none shadow-[0_8px_18px_-6px_rgba(64,42,18,.35)] ${active ? "" : "is-dim"}`}>
      <Logo className="absolute left-1/2 top-[24px] w-[44px] -translate-x-1/2" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/img/ill/${b.ill}.webp`} alt="" className="absolute -bottom-[14px] -right-[22px] w-[176px]" loading="eager" decoding="async" draggable={false} />
      <div className="absolute left-[80px] right-[26px] top-[108px]">
        {groups.map((g) => (
          <div key={g.name} className="mb-3.5">
            <p lang="en" className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-mut">{g.name}</p>
            <ul className="space-y-[7px]">
              {g.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 text-[10.5px] font-medium tracking-[0.06em] text-ink">
                  <span lang="en" className="truncate uppercase">{i.name.en}</span><span className="tabular">{i.price ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-[11px] text-mut underline decoration-ink/25 underline-offset-4">{t("seeAll", lang)} · {b.count} {t("items", lang)}</p>
      </div>
      <h2 className="vtitle absolute bottom-[26px] left-[18px] text-[52px] font-normal text-ink">{b.title}</h2>
    </Frame>
  );
}

export function Wall() {
  const { lang } = useApp();
  const [mood, setMood] = useState(MOODS[0].id);
  const [ref, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: false, duration: 22, skipSnaps: false, startIndex: lastSel });
  const [sel, setSel] = useState(lastSel);
  const onSelect = useCallback(() => { if (!api) return; lastSel = api.selectedScrollSnap(); setSel(lastSel); }, [api]);
  useEffect(() => { if (!api) return; api.on("select", onSelect); return () => { api.off("select", onSelect); }; }, [api, onSelect]);

  const pickMood = (id: string) => {
    setMood(id);
    const first = MOODS.find((m) => m.id === id)!.boards[0];
    api?.scrollTo(BOARDS.findIndex((b) => b.id === first));
  };

  return (
    <motion.main className="mx-auto min-h-[100svh] max-w-[440px] pb-28 pt-8">
      <h1 className="rise px-5 font-serif text-[30px] leading-tight text-ink">{t("whatToday", lang)}</h1>
      <div className="rise no-scrollbar mt-3 flex gap-5 overflow-x-auto px-5" style={{ ["--i" as string]: 1 }}>
        {MOODS.map((m) => (
          <button key={m.id} aria-pressed={mood === m.id} onClick={() => pickMood(m.id)} className={`relative min-h-11 shrink-0 pb-1.5 font-serif text-[19px] italic transition-colors ${mood === m.id ? "text-ink" : "text-mut"}`}>
            {m.label[lang]}
            {mood === m.id && <motion.span layoutId="mood-line" className="absolute inset-x-0 bottom-0 h-px bg-oak" />}
          </button>
        ))}
      </div>

      <div className="mt-7 overflow-hidden" ref={ref}>
        <div className="wall-track flex gap-4 pl-6 pr-6">
          {BOARDS.map((b, i) => (<div key={b.id} className="rise shrink-0" style={{ ["--i" as string]: Math.min(i, 3) + 2 }}><WallBoard b={b} active={i === sel} /></div>))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1">
        {BOARDS.map((b, i) => (
          <button key={b.id} aria-label={b.name[lang]} aria-current={i === sel} onClick={() => api?.scrollTo(i)} className="relative grid h-11 w-5 place-items-center"><span className={`block h-1.5 rounded-full transition-all ${i === sel ? "w-5 bg-ink" : "w-1.5 bg-ink/25"}`} /></button>
        ))}
      </div>
      <p className="mt-0.5 text-center text-[13px] text-mut">{BOARDS[sel]?.name[lang]} · {BOARDS[sel]?.count} {t("items", lang)}</p>
      <BottomBar />
    </motion.main>
  );
}
