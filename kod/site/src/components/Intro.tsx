"use client";
import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useApp } from "./store";
import { t } from "@/lib/i18n";
import { Icon } from "./ui";

export function Intro() {
  const { lang, setLang, go } = useApp();
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [leaving, setLeaving] = useState(false);
  const labelOpacity = useTransform(x, [0, 140], [1, 0]);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    const max = (track.current?.offsetWidth ?? 340) - 64;
    animate(x, max, { type: "spring", stiffness: 300, damping: 30 });
    setTimeout(() => go({ name: "wall" }), 380);
  };

  return (
    <motion.main
      className="mx-auto flex min-h-[100svh] max-w-[440px] flex-col px-6 pb-8 pt-5"
    >
      <div className="flex justify-end">
        <div className="flex rounded-full border border-ink/15 p-[3px] text-[11px] font-semibold tracking-[0.08em]">
          {(["tr", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`min-h-9 rounded-full px-3.5 py-2 uppercase transition-colors ${lang === l ? "bg-ink text-paper" : "text-mut"}`}>{l}</button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative mx-auto mt-4 aspect-[342/440] w-full overflow-hidden rounded-t-full rounded-b-[10px] bg-line"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/mekan.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.75, 0.35, 0.92] }}
          transition={{ duration: 1.6, delay: 0.9, times: [0, 0.35, 0.5, 1] }}
          className="neon absolute left-1/2 top-[40%] -translate-x-1/2 -rotate-[4deg] font-neon text-[46px] leading-none"
        >
          permesso?
        </motion.span>
      </motion.div>

      <h1 className="mt-7 text-center font-wide text-[38px] font-extralight leading-none tracking-[0.3em] text-ink">PERMESSO</h1>
      <p className="mt-3 text-center font-serif text-[18px] italic text-mut">{t("tagline", lang)}</p>

      <div className="flex-1" />

      <div ref={track} className="relative mt-8 h-16 w-full rounded-full bg-ink/[0.07]">
        <motion.span style={{ opacity: labelOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-[15px] text-ink/70">
          {t("swipe", lang)} <span className="text-ink/30">·</span> <span className="font-serif text-[22px] italic text-ink">{t("avanti", lang)}</span>
        </motion.span>
        <motion.button
          aria-label={t("enter", lang)}
          drag="x"
          dragConstraints={track}
          dragElastic={0.04}
          dragMomentum={false}
          style={{ x }}
          onClick={enter}
          onDragEnd={() => {
            const max = (track.current?.offsetWidth ?? 340) - 64;
            if (x.get() > max * 0.55) enter();
            else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
          }}
          className="absolute left-1 top-1 flex h-14 w-14 cursor-grab items-center justify-center rounded-full bg-ink text-paper active:cursor-grabbing"
        >
          {Icon.arrow("h-6 w-6")}
        </motion.button>
      </div>
      <p className="mt-4 text-center text-[12px] text-mut">{t("openToday", lang)}</p>
    </motion.main>
  );
}
