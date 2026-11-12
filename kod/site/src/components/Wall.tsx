"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "motion/react";
import { BOARDS, MOODS, isOpenNow, minuteNow, price, subscribeMinute, type Board } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useAnnouncement } from "@/lib/live";
import { useApp } from "./store";
import { Frame, Icon, Logo } from "./ui";

export function BottomBar({ inset = false }: { inset?: boolean }) {
  const { lang, setSearchOpen, go, count, total } = useApp();
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
          {count > 0 && <span className="tabular text-[13px] text-mut">· {price(total)}</span>}
        </button>
      </div>
    </div>
  );
}

// Pano duvarında kalınan yer (panodan geri dönünce başa sarmasın)
let lastSel = 0;
// Kullanıcı herhangi bir panoyu açtı mı (ipucu bir kez görünsün)
let opened = false;
// Giriş animasyonu yalnız ilk gösterimde (geri dönüşte view-transition ile çakışmasın)
let entered = false;
// Düşük cihazda paralaks ve dikey kayma kapalı (bir kez hesaplanır)
const LOW_END = typeof navigator !== "undefined" && ((navigator.hardwareConcurrency ?? 8) <= 4 || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 2);
const moodOf = (i: number) => (MOODS.find((m) => BOARDS[i] && m.boards.includes(BOARDS[i].id)) ?? MOODS[0]).id;

function WallBoard({ b, active }: { b: Board; active: boolean }) {
  const { lang, go } = useApp();
  // Gerçek panolardaki gibi gruplu önizleme: ilk iki bölüm, en çok 6 satır
  const groups: { name: string; items: Board["sections"][number]["items"] }[] = [];
  let left = 6;
  for (const s of b.sections.slice(0, 2)) { if (left <= 0) break; const it = s.items.slice(0, left); groups.push({ name: s.name.en, items: it }); left -= it.length; }
  const shown = groups.reduce((n, g) => n + g.items.length, 0);
  const open = () => { opened = true; go({ name: "board", id: b.id }); };
  return (
    <Frame b={14} onClick={open} role="button" tabIndex={0} aria-label={`${b.name[lang]} — ${t("openBoard", lang)}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      style={{ height: "clamp(400px, calc(100svh - 330px), 500px)", viewTransitionName: `board-${b.id}` }}
      className={`board-card relative w-[300px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-oak cursor-pointer select-none`}>
      <Logo className="absolute left-1/2 top-[24px] w-[44px] -translate-x-1/2" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/img/ill/${b.ill}.webp`} alt="" data-par className="absolute -bottom-[14px] -right-[22px] w-[176px]" loading="eager" decoding="async" draggable={false} />
      <div className="absolute left-[80px] right-[26px] top-[108px]">
        <div style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)", maskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)" }}>
        {groups.map((g) => (
          <div key={g.name} className="mb-3.5">
            <p lang="en" className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-mut">{g.name}</p>
            <ul className="space-y-[7px]">
              {g.items.map((i) => (
                <li key={i.id} className={`flex justify-between gap-3 text-[10.5px] font-medium tracking-[0.06em] text-ink ${i.available ? "" : "opacity-45"}`}>
                  <span lang="en" className="truncate uppercase">{i.name.en}</span><span className="tabular">{i.price ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
        {b.count > shown && <p className="tabular -mt-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-mut">+{b.count - shown} {t("more", lang)}</p>}
        <p className="mt-2.5 flex items-center gap-2 text-ink">
          <span className="border-b border-oak pb-[3px] font-serif text-[19px] italic leading-none">{t("seeAllN", lang)}</span>
          <motion.span className="inline-flex text-oak" animate={active ? { x: [0, 5, 0, 5, 0, 5, 0] } : { x: 0 }} transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}>{Icon.arrow("h-[18px] w-[18px]")}</motion.span>
        </p>
      </div>
      <h2 className="vtitle absolute bottom-[26px] left-[18px] text-[52px] font-normal text-ink">{b.title}</h2>
    </Frame>
  );
}

export function Wall() {
  const { lang, setInfoOpen } = useApp();
  const notice = useAnnouncement();
  const [noticeOff, setNoticeOff] = useState(false);
  const reduce = useReducedMotion();
  const tick = useSyncExternalStore(subscribeMinute, minuteNow, () => null);
  const openState = tick === null ? null : isOpenNow();
  const [rise] = useState(() => (entered ? "" : "rise"));
  useEffect(() => { entered = true; }, []);
  const [mood, setMood] = useState(() => moodOf(lastSel));
  const [ref, api] = useEmblaCarousel({ align: "center", containScroll: false, dragFree: false, duration: 38, dragThreshold: 6, skipSnaps: false, startIndex: lastSel });
  const [sel, setSel] = useState(lastSel);
  const onSelect = useCallback(() => { if (!api) return; lastSel = api.selectedScrollSnap(); setSel(lastSel); setMood(moodOf(lastSel)); }, [api]);
  useEffect(() => { if (!api) return; api.on("select", onSelect); return () => { api.off("select", onSelect); }; }, [api, onSelect]);

  // Kaydırma parmağı izler: yalnız transform/opacity, kare başına tek yazım (rAF).
  // Panolar çivide asılı gibi: kaydırma hızına göre hafifçe sallanır, yay gibi yerine oturur.
  useEffect(() => {
    if (!api) return;
    const lite = LOW_END || reduce;
    let raf = 0;
    let prev = api.scrollProgress();
    let rot = 0;
    let cache: { card: HTMLElement; img: HTMLElement | null }[] = [];
    const build = () => { cache = api.slideNodes().map((n) => { const card = n.firstElementChild as HTMLElement; return { card, img: card?.querySelector<HTMLElement>("[data-par]") ?? null }; }); };
    const write = () => {
      raf = 0;
      const progress = api.scrollProgress();
      const snaps = api.scrollSnapList();
      const span = Math.max(1, snaps.length - 1);
      // Hız (pano/kare) → hedef eğim; yumuşak yaklaşım
      const vel = (progress - prev) * span; prev = progress;
      const target = lite ? 0 : Math.max(-2.6, Math.min(2.6, -vel * 50));
      rot += (target - rot) * 0.16;
      if (Math.abs(rot) < 0.01 && Math.abs(target) < 0.01) rot = 0;
      cache.forEach(({ card, img }, i) => {
        if (!card) return;
        const raw = (snaps[i] - progress) * span;
        const d = Math.min(1, Math.abs(raw));
        card.style.opacity = String(1 - 0.22 * d);
        if (reduce) return;
        card.style.transform = `rotate(${rot.toFixed(3)}deg) scale(${(1 - 0.06 * d).toFixed(4)})`;
        if (img && !lite) img.style.transform = `translate3d(${(Math.max(-1, Math.min(1, raw)) * 16).toFixed(2)}px, 0, 0)`;
      });
      // Sallanma sönene kadar kareleri sürdür
      if (rot !== 0) raf = requestAnimationFrame(write);
    };
    const tween = () => { if (!raf) raf = requestAnimationFrame(write); };
    const rebuild = () => { build(); tween(); };
    build(); write();
    api.on("scroll", tween).on("reInit", rebuild).on("settle", tween);
    return () => { if (raf) cancelAnimationFrame(raf); api.off("scroll", tween).off("reInit", rebuild).off("settle", tween); };
  }, [api, reduce]);

  const pickMood = (id: string) => {
    setMood(id);
    const first = MOODS.find((m) => m.id === id)!.boards[0];
    api?.scrollTo(BOARDS.findIndex((b) => b.id === first));
  };

  return (
    <motion.main className="mx-auto min-h-[100svh] max-w-[440px] pb-28 pt-8">
      <div className={`${rise} flex items-start justify-between gap-3 px-5`}>
        <h1 className="font-serif text-[30px] leading-tight text-ink">{t("whatToday", lang)}</h1>
        <motion.button
          aria-label={t("info", lang)}
          title={t("info", lang)}
          onClick={() => setInfoOpen(true)}
          initial={{ rotate: -4 }}
          animate={{ rotate: [-4, 3, -6, -4] }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
          whileTap={{ rotate: 2 }}
          style={{ transformOrigin: "50% 0" }}
          className="relative -mr-1 mt-1 flex min-h-11 shrink-0 flex-col items-center px-3 pb-3 pt-1"
        >
          <svg aria-hidden viewBox="0 0 40 12" className="-mb-px h-[10px] w-10 text-oak" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M20 1L9 12M20 1l11 11" />
            <circle cx="20" cy="1.2" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          <span className="flex h-[30px] items-center gap-1.5 border border-oak bg-paper px-2.5 shadow-[0_2px_6px_-2px_rgba(64,42,18,.3)]">
            {openState !== null && <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${openState ? "bg-[#4f6b3a]" : "bg-oak"}`} />}
            <span className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${openState ? "text-[#4f6b3a]" : "text-oak"}`}>
              {openState === null ? t("signKnock", lang) : openState ? t("signOpen", lang) : t("signClosed", lang)}
            </span>
          </span>
        </motion.button>
      </div>
      {notice && !noticeOff && (
        <div className={`${rise} mx-5 mt-3 flex items-start gap-2.5 border border-ink/12 bg-paper px-3 py-2`}>
          <span className="mt-[5px] shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-oak">{t("announcement", lang)}</span>
          <p className="min-w-0 flex-1 font-serif text-[15px] italic leading-snug text-ink">{notice[lang] || notice.tr || notice.en}</p>
          <button aria-label={t("clear", lang)} onClick={() => setNoticeOff(true)} className="-mr-2 -my-1.5 grid h-11 w-9 shrink-0 place-items-center text-mut">×</button>
        </div>
      )}
      <div className={`${rise} no-scrollbar mt-3 flex gap-5 overflow-x-auto px-5`} style={{ ["--i" as string]: 1 }}>
        {MOODS.map((m) => (
          <button key={m.id} aria-pressed={mood === m.id} onClick={() => pickMood(m.id)} className={`relative min-h-11 shrink-0 pb-1.5 font-serif text-[19px] italic transition-colors ${mood === m.id ? "text-ink" : "text-mut"}`}>
            {m.label[lang]}
            {mood === m.id && <motion.span layoutId="mood-line" className="absolute inset-x-0 bottom-0 h-px bg-oak" />}
          </button>
        ))}
      </div>

      <div className="mt-7 overflow-hidden" ref={ref}>
        <div className="wall-track flex gap-3">
          {BOARDS.map((b, i) => (<div key={b.id} className={`${rise} shrink-0`} style={{ ["--i" as string]: Math.min(i, 3) + 2 }}><WallBoard b={b} active={i === sel} /></div>))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1">
        {BOARDS.map((b, i) => (
          <button key={b.id} aria-label={b.name[lang]} aria-current={i === sel} onClick={() => api?.scrollTo(i)} className="relative grid h-11 w-5 place-items-center"><span className={`block h-1.5 rounded-full transition-all ${i === sel ? "w-5 bg-ink" : "w-1.5 bg-ink/25"}`} /></button>
        ))}
      </div>
      <p className="mt-0.5 text-center text-[13px] text-mut">{opened ? <>{BOARDS[sel]?.name[lang]} · {BOARDS[sel]?.count} {t("items", lang)}</> : <span className="font-serif text-[15px] italic text-ink">{t("tapHint", lang)}</span>}</p>
      <BottomBar />
    </motion.main>
  );
}
