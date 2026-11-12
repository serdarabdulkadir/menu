"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BOARD_ILL, EXTRAS, ITEM_BY_ID, price } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useApp, type Line } from "./store";
import { Frame, Icon, Logo, Thumb } from "./ui";

const exName = (id: string, l: "tr" | "en") => EXTRAS.find((e) => e.id === id)?.name[l] ?? id;

function LineRow({ l }: { l: Line }) {
  const { lang, setQty, lineTotal } = useApp();
  const i = ITEM_BY_ID.get(l.itemKey)!;
  return (
    <motion.div layout exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3.5 border-b border-ink/[0.08] py-3">
      <Thumb file={i.image} ill={BOARD_ILL[i.board]} className="h-[64px] w-[50px]" />
      <div className="min-w-0 flex-1">
        <p lang="en" className="text-[12.5px] font-medium uppercase tracking-[0.06em] text-ink">{i.name.en}</p>
        {l.extras.length > 0 && <p className="font-serif text-[14px] italic text-mut">+ {l.extras.map((e) => exName(e, lang)).join(", ")}</p>}
        <div className="mt-1.5 inline-flex items-center rounded-full border border-ink/20">
          <button aria-label={t("dec", lang)} onClick={() => setQty(l.key, l.qty - 1)} className="grid h-11 w-11 place-items-center">{Icon.minus("h-4 w-4")}</button>
          <span className="tabular w-5 text-center text-[13px] font-semibold">{l.qty}</span>
          <button aria-label={t("inc", lang)} onClick={() => setQty(l.key, l.qty + 1)} className="grid h-11 w-11 place-items-center">{Icon.plus("h-4 w-4")}</button>
        </div>
      </div>
      <span className="tabular text-[14px] font-medium">{price(lineTotal(l))}</span>
    </motion.div>
  );
}

export function TablePage() {
  const { lang, go, lines, total, count, note, setNote, masa } = useApp();
  return (
    <div className="mx-auto max-w-[440px]">
      <Frame b={14} className="min-h-[100svh]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
        <div className="flex items-start justify-between px-6 pt-7">
          <button aria-label={t("back", lang)} onClick={() => go({ name: "wall" })} className="-ml-3 grid h-11 w-11 place-items-center">{Icon.back("h-6 w-6")}</button>
          <Logo className="mt-0.5 w-[34px]" />
          <span className="w-7" />
        </div>
        <div className="grid grid-cols-[88px_1fr] pb-10 pr-6">
          <div className="flex flex-col justify-end"><h1 className="vtitle sticky bottom-[40px] ml-[18px] text-[72px]">{t("table", lang)}</h1></div>
          <div className="pt-4">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{t("picks", lang)}{masa ? ` · ${t("table", lang)} ${masa}` : ""}</p>
            {lines.length === 0 ? (
              <p className="mt-6 font-serif text-[19px] italic leading-snug text-mut">{t("emptyTable", lang)}</p>
            ) : (
              <>
                <div className="mt-1"><AnimatePresence initial={false}>{lines.map((l) => <LineRow key={l.key} l={l} />)}</AnimatePresence></div>
                <p className="mt-7 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{t("total", lang)}</p>
                <p className="tabular font-serif text-[56px] leading-none">{price(total)}</p>
                <p className="mt-1 text-[13px] text-mut"><span className="tabular">{count}</span> {t("items", lang)}</p>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("note", lang)}
                  className="mt-6 w-full rounded-[6px] border border-ink/15 bg-ink/[0.03] px-3.5 py-3 font-serif text-[17px] italic outline-none placeholder:text-ink/55 focus:border-ink/40" />
                <button onClick={() => go({ name: "show" })} className="mt-6 h-[54px] w-full rounded-full bg-ink text-[15px] font-semibold text-paper">{t("showWaiter", lang)}</button>
                <p className="mt-3 font-serif text-[14px] italic text-mut">{t("notOrder", lang)}</p>
              </>
            )}
          </div>
        </div>
      </Frame>
    </div>
  );
}

// Garsona göster: büyük yazılı hesap fişi, ekran açık kalır
export function ShowPage() {
  const { lang, go, lines, total, note, lineTotal, masa } = useApp();
  // Ekran açık kalsın; sekmeden çıkıp dönünce kilidi yeniden iste, erken çıkışta sızdırma
  useEffect(() => {
    type Lock = { release: () => Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<Lock> } };
    let lock: Lock | null = null; let alive = true;
    const req = () => nav.wakeLock?.request("screen").then((l) => { if (alive) lock = l; else l.release().catch(() => {}); }).catch(() => {});
    const onVis = () => { if (document.visibilityState === "visible") req(); };
    req(); document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; document.removeEventListener("visibilitychange", onVis); lock?.release().catch(() => {}); };
  }, []);
  const now = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100svh] bg-ink/90 px-4 py-6">
      <motion.div initial={{ y: 40, rotate: -1.2 }} animate={{ y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative mx-auto max-w-[420px] bg-paper px-6 pb-10 pt-8 shadow-2xl"
        style={{ clipPath: "polygon(0 0,100% 0,100% calc(100% - 10px),95% 100%,90% calc(100% - 10px),85% 100%,80% calc(100% - 10px),75% 100%,70% calc(100% - 10px),65% 100%,60% calc(100% - 10px),55% 100%,50% calc(100% - 10px),45% 100%,40% calc(100% - 10px),35% 100%,30% calc(100% - 10px),25% 100%,20% calc(100% - 10px),15% 100%,10% calc(100% - 10px),5% 100%,0 calc(100% - 10px))" }}>
        <p className="text-center font-wide text-[16px] font-extralight tracking-[0.3em]">PERMESSO</p>
        <p className="text-center text-[11px] text-mut">{t("addressShort", lang)}</p>
        <p className="tabular mt-3 text-center text-[15px] font-medium">{masa ? `${t("table", lang)} ${masa} · ` : ""}{now}</p>
        <div className="my-5 border-t border-dashed border-ink/30" />
        {note && <p className="mb-4 font-serif text-[24px] italic">“{note}”</p>}
        {lines.map((l) => {
          const i = ITEM_BY_ID.get(l.itemKey)!;
          return (
            <div key={l.key} className="flex items-baseline gap-3 border-b border-ink/10 py-3">
              <span className="tabular w-8 shrink-0 text-[18px] font-semibold">{l.qty}×</span>
              <span className="flex-1">
                <span className="block font-serif text-[30px] leading-[1.05]">{lang === "tr" ? i.name.tr : i.name.en}</span>
                {l.extras.length > 0 && <span className="block text-[14px] text-mut">+ {l.extras.map((e) => exName(e, lang)).join(", ")}</span>}
              </span>
              <span className="tabular text-[17px]">{price(lineTotal(l))}</span>
            </div>
          );
        })}
        <div className="mt-5 flex items-baseline justify-between">
          <span className="text-[14px] text-mut">{t("total", lang)}</span>
          <span className="tabular font-serif text-[46px] leading-none">{price(total)}</span>
        </div>
        <p className="mt-6 text-[12px] text-mut">{t("notOrder", lang)}</p>
      </motion.div>
      <button onClick={() => go({ name: "table" })} className="mx-auto mt-6 block h-[52px] w-full max-w-[420px] rounded-full bg-paper text-[15px] font-semibold text-ink">{t("backToTable", lang)}</button>
    </motion.div>
  );
}
