"use client";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { motion } from "motion/react";
import { EXTRA_BOARDS, EXTRAS, img, price, type Item } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useApp } from "./store";
import { Icon } from "./ui";

export function ProductDrawer() {
  const { product: open, openProduct, lang, add } = useApp();
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  // Kapanış animasyonu boyunca son ürünü göstermeye devam et (panel boş görünmesin)
  const [p, setShown] = useState<Item | null>(open);
  if (open && open !== p) { setShown(open); setQty(1); setExtras([]); setDone(false); }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (open && timer.current) { clearTimeout(timer.current); timer.current = null; } }, [open]);

  const ex = p && EXTRA_BOARDS.has(p.board) ? EXTRAS : [];
  const unit = (p?.price ?? 0) + ex.filter((e) => extras.includes(e.id)).reduce((s, e) => s + (e.price ?? 0), 0);
  const src = p ? img(p.image) : null;
  const sub = p && lang === "tr" && p.name.tr !== p.name.en ? p.name.tr : null;

  return (
    <Drawer.Root open={!!open} onOpenChange={(o) => !o && openProduct(null)}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94svh] max-w-[440px] flex-col rounded-t-[24px] bg-paper outline-none">
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/20" />
          {p && (
            <div className="overflow-y-auto px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="photo-bottom aspect-[4/3.4] w-full rounded-[14px]" />
              ) : null}
              <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{p.categoryName[lang]}</p>
              <div className="mt-1 flex items-baseline justify-between gap-4">
                <Drawer.Title className="text-[30px] leading-[1.05] text-ink">{lang === "tr" ? p.name.tr : p.name.en}</Drawer.Title>
                <span className="tabular shrink-0 text-[20px] font-medium text-ink">{price(p.price)}</span>
              </div>
              {sub && <p className="font-serif text-[16px] italic text-mut">{p.name.en}</p>}
              {p.desc[lang] && <Drawer.Description className="mt-3 text-[14.5px] leading-relaxed text-mut">{p.desc[lang]}</Drawer.Description>}

              {ex.length > 0 && (
                <div className="mt-6 border-t border-ink/12 pt-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{t("extras", lang)}</p>
                  {ex.map((e) => {
                    const on = extras.includes(e.id);
                    return (
                      <button key={e.id} role="checkbox" aria-checked={on} onClick={() => setExtras((s) => (on ? s.filter((x) => x !== e.id) : [...s, e.id]))} className="flex w-full items-center gap-3 py-2.5 text-left text-[15px] text-ink">
                        <span className={`grid h-[20px] w-[20px] place-items-center rounded-[4px] border ${on ? "border-ink bg-ink text-paper" : "border-ink/35"}`}>{on && Icon.check("h-3.5 w-3.5")}</span>
                        <span className="flex-1">{e.name[lang]}</span>
                        <span className="tabular text-[14px] text-mut">+{price(e.price)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-[52px] items-center rounded-full border border-ink/20 px-2">
                  <button aria-label={t("dec", lang)} onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-ink">{Icon.minus("h-5 w-5")}</button>
                  <span className="tabular w-6 text-center text-[16px] font-semibold">{qty}</span>
                  <button aria-label={t("inc", lang)} onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center text-ink">{Icon.plus("h-5 w-5")}</button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { add(p, extras, qty); setDone(true); timer.current = setTimeout(() => { timer.current = null; openProduct(null); }, 520); }}
                  className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-paper"
                >
                  {done ? <>{Icon.check("h-5 w-5")}</> : <>{t("add", lang)} · <span className="tabular">{price(unit * qty)}</span></>}
                </motion.button>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
