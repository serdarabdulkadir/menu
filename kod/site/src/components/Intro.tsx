"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useApp } from "./store";
import { Icon } from "./ui";
import { t } from "@/lib/i18n";
import { INFO, isOpenNow, minuteNow, subscribeMinute } from "@/lib/menu";

// Her açılışta ve yenilemede karşılama gösterilir (kullanıcı isteği)
const seen = () => false;
const noopSub = () => () => {};
const HANDLE = 56, PAD = 4;
const NOTCHES = [0.33, 0.66];
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const buzz = (ms: number) => { try { navigator.vibrate?.(ms); } catch { /* iOS */ } };

// Eşik çentiği: tutamaç geçince oak'a döner
function Notch({ at, p }: { at: number; p: MotionValue<number> }) {
  const bg = useTransform(p, (v) => (v >= at ? "#c99a62" : "rgba(30,26,23,0.22)"));
  return <motion.span aria-hidden className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `calc(${HANDLE / 2 + PAD}px + (100% - ${HANDLE + PAD * 2}px) * ${at})`, backgroundColor: bg }} />;
}

export function Intro({ wallRef }: { wallRef: React.RefObject<HTMLDivElement | null> }) {
  const { lang, setLang, go } = useApp();
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const [max, setMax] = useState(0);
  const done = useRef(false);
  const zone = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const maxMV = useMotionValue(0);
  // İlerleme 0→1: kapı, neon ve etiket hep bundan türer (React state'i her karede çizilmez)
  const p = useTransform([x, maxMV], ([a, m]: number[]) => (m > 0 ? clamp01(a / m) : 0));
  const archRef = useRef<HTMLDivElement>(null);
  const kMV = useMotionValue(6);
  const rotL = useTransform(p, (v) => (reduce ? 0 : -80 * Math.min(1, v / 0.55)));
  const rotR = useTransform(p, (v) => (reduce ? 0 : 80 * Math.min(1, v / 0.55)));
  const wingOp = useTransform(p, [0.45, 0.7], [1, 0]);
  // Kemer açıklığı: yalnız transform; box-shadow kâğıdı onunla birlikte ölçeklenir
  const archScale = useTransform([p, kMV], ([v, k]: number[]) => (reduce ? 1 : 1 + v * v * k));
  const dimOp = useTransform(p, [0, 1], [0.35, 0]);
  const rootOp = useTransform(p, (v) => (reduce ? 1 - v : 1));
  const contentOp = useTransform(p, [0, 0.35], [1, 0]);
  const contentY = useTransform(p, [0, 0.35], [0, 16]);
  const trackOp = useTransform(p, [0.6, 0.85], [1, 0]);
  const neonOp = useTransform(p, [0, 0.5], [1, 0]);
  const vignetteOp = useTransform(p, [0, 0.6], [1, 0]);
  const avantiOp = useTransform(p, [0.25, 0.9], [0, 1]);
  const avantiScale = useTransform(p, [0.25, 1], [0.92, 1]);
  const labelOp = useTransform(p, [0, 0.5], [1, 0]);
  const skip = useSyncExternalStore(noopSub, seen, () => false);
  const tick = useSyncExternalStore(subscribeMinute, minuteNow, () => null);
  const open = tick === null ? null : isOpenNow();

  useEffect(() => { if (skip) go({ name: "wall" }, { instant: true }); }, [skip, go]);
  useEffect(() => { if (!navigator.language.toLowerCase().startsWith("tr")) setLang("en"); }, [setLang]);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => { const m = Math.max(0, el.clientWidth - HANDLE - PAD * 2); maxMV.set(m); setMax(m); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [skip, maxMV]);
  // Kemerin ekranı kaplaması için gereken ölçek
  useEffect(() => {
    const el = archRef.current;
    if (!el) return;
    const measure = () => { if (el.offsetWidth) kMV.set((Math.hypot(window.innerWidth, window.innerHeight) / el.offsetWidth) * 1.15); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [skip, kMV]);
  // Alttaki Wall'a "içeri yaklaşma": React render'sız, doğrudan stil
  useEffect(() => {
    if (reduce) return;
    const apply = (v: number) => { const el = wallRef.current; if (el) el.style.transform = v >= 1 ? "" : `scale(${1.06 - 0.06 * v})`; };
    apply(p.get());
    return p.on("change", apply);
  }, [p, reduce, wallRef]);
  // Eşik titreşimi (%33, %66)
  useEffect(() => p.on("change", (v) => {
    const z = v >= NOTCHES[1] ? 2 : v >= NOTCHES[0] ? 1 : 0;
    if (z !== zone.current) { if (z > zone.current) buzz(8); zone.current = z; }
  }), [p]);

  const spring = { type: "spring" as const, stiffness: 380, damping: 22 };
  const enter = async (fromDrag = false) => {
    if (done.current) return;
    done.current = true;
    setOpening(true);
    buzz(fromDrag ? 18 : 8);
    await animate(x, maxMV.get(), reduce ? { duration: 0.25 } : { type: "spring", stiffness: 120, damping: 22 });
    go({ name: "wall" }, { instant: true });
  };
  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enter(); } };
  const release = () => {
    if (p.get() > 0.5) enter(true);
    else animate(x, 0, spring);
  };

  if (skip) return null;

  const status = open === null ? "" : open
    ? t("introOpen", lang).replace("{t}", INFO.close)
    : t("introClosed", lang).replace("{t}", INFO.open);

  return (
    <motion.div style={{ opacity: rootOp }} className="fixed inset-0 z-[60] overflow-hidden bg-transparent">
    <main className="mx-auto flex h-full max-w-[440px] flex-col px-6 pb-8 pt-5">
      <motion.div style={{ opacity: contentOp, y: contentY }} className="relative z-10 flex justify-end">
        <div className="flex rounded-full border border-ink/15 p-[3px] text-[11px] font-semibold tracking-[0.08em]">
          {(["tr", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`min-h-11 rounded-full px-4 py-2 uppercase transition-colors ${lang === l ? "bg-ink text-paper" : "text-mut"}`}>{l}</button>
          ))}
        </div>
      </motion.div>

      <motion.div
        ref={archRef}
        role="button"
        tabIndex={0}
        aria-label={t("enter", lang)}
        onClick={() => enter()}
        onKeyDown={onKey}
        style={{ scale: archScale, boxShadow: "0 0 0 200vmax var(--color-paper)", willChange: "transform" }}
        className="relative mx-auto mt-2 aspect-[342/440] w-[min(100%,41svh)] shrink-0 cursor-pointer overflow-hidden rounded-t-full rounded-b-[10px] outline-none focus-visible:ring-2 focus-visible:ring-oak"
      >
        {/* Kapının ardı: delik (Wall görünür) + loş içeri katmanı */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: dimOp, backgroundColor: "rgba(74,48,22,1)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            style={{ opacity: avantiOp, scale: avantiScale }}
            className="font-serif text-[40px] italic text-oak"
          >
            avanti!
          </motion.span>
        </div>

        {/* İki kanat */}
        <div className="absolute inset-0" style={{ perspective: "1200px" }}>
          {(["l", "r"] as const).map((side) => {
            const left = side === "l";
            return (
              <motion.div
                key={side}
                aria-hidden
                style={{ rotateY: left ? rotL : rotR, opacity: wingOp, transformOrigin: left ? "0% 50%" : "100% 50%", willChange: "transform" }}
                className={`absolute inset-y-0 w-1/2 overflow-hidden bg-[#e7ddd0] ${left ? "left-0" : "right-0"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/mekan.webp" alt="" decoding="async" fetchPriority="high" className={`door-photo absolute inset-y-0 h-full w-[200%] max-w-none object-cover ${left ? "left-0" : "-left-full"}`} />
                <span className={`absolute inset-y-0 w-px bg-ink/25 ${left ? "right-0" : "left-0"}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Neon okunurluğu için yumuşak vinyet */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: vignetteOp, backgroundImage: "radial-gradient(ellipse 60% 22% at 50% 42%, rgba(20,14,10,.45), rgba(20,14,10,0))" }}
        />
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: neonOp }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0.35, 0.92] }}
            transition={{ duration: 1.6, delay: 0.9, times: [0, 0.35, 0.5, 1] }}
            className="neon absolute left-1/2 top-[40%] -translate-x-1/2 -rotate-[4deg] whitespace-nowrap font-neon text-[52px] leading-none"
          >
            permesso?
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity: contentOp, y: contentY }} className="relative z-10">
        <h1 className="mt-7 text-center font-wide text-[38px] font-extralight leading-none tracking-[0.3em] text-ink">PERMESSO</h1>
        <p className="mt-3 text-center font-serif text-[18px] italic text-mut">{t("tagline", lang)}</p>
      </motion.div>

      <div className="flex-1" />

      <motion.div ref={track} className="relative z-10 mt-6 h-16 shrink-0 select-none rounded-full bg-ink/[0.07]" style={{ padding: PAD, opacity: trackOp }}>
        {NOTCHES.map((n) => <Notch key={n} at={n} p={p} />)}
        <motion.span aria-hidden style={{ opacity: labelOp }} className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-[20px] text-mut">
          {t("swipe", lang)} · <i className="ml-1.5 text-ink">{t("avanti", lang)}</i>
        </motion.span>
        <motion.div
          aria-hidden
          drag={opening ? false : "x"}
          dragConstraints={{ left: 0, right: max }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={release}
          style={{ x, width: HANDLE, height: HANDLE, touchAction: "pan-y" }}
          className="relative z-10 grid cursor-grab place-items-center rounded-full bg-ink text-paper active:cursor-grabbing"
        >
          {Icon.arrow("h-5 w-5")}
        </motion.div>
      </motion.div>
      <motion.p style={{ opacity: contentOp }} className="relative z-10 mt-3 flex h-5 items-center justify-center gap-2 text-center text-[12px] text-mut">
        {open !== null && <><span aria-hidden className={`h-1.5 w-1.5 rounded-full ${open ? "bg-[#4f6b3a]" : "bg-oak"}`} />{status}</>}
      </motion.p>
    </main>
    </motion.div>
  );
}
