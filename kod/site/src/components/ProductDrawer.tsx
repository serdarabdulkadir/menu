"use client";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { motion } from "motion/react";
import { EXTRA_BOARDS, EXTRAS, PLAIN, img, keyOf, optionList, price, type Item } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useApp } from "./store";
import { Icon } from "./ui";

export function ProductDrawer() {
  const { product: open, openProduct, lang, add, announce, lines, removeOne } = useApp();
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [option, setOption] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  // Kapanış animasyonu boyunca son ürünü göstermeye devam et (panel boş görünmesin)
  const [p, setShown] = useState<Item | null>(open);
  if (open && open !== p) { setShown(open); setQty(1); setExtras([]); setDone(false); setShake(0); setOption(open.options?.length && open.optionsOptional ? PLAIN : null); }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (open && timer.current) { clearTimeout(timer.current); timer.current = null; } }, [open]);

  const ex = p && EXTRA_BOARDS.has(p.board) ? EXTRAS : [];
  const unit = (p?.price ?? 0) + ex.filter((e) => extras.includes(e.id)).reduce((s, e) => s + (e.price ?? 0), 0);
  const src = p ? img(p.image) : null;
  const opts = p ? optionList(p, lang) : [];
  const needPick = opts.length > 0 && option === null;
  const gone = !!p && !p.available;
  const descTxt = p?.desc[lang] ?? "";
  const ingr = (descTxt.match(/,/g)?.length ?? 0) >= 2 ? descTxt.split(",").map((x) => x.trim()).filter(Boolean) : null;
  const inList = p ? lines.reduce((s, l) => (l.itemKey === keyOf(p) ? s + l.qty : s), 0) : 0;
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
                <img src={src} alt="" className="photo-bottom aspect-[16/11] w-full rounded-[14px]" />
              ) : null}
              <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{p.categoryName[lang]}</p>
              <div className="mt-1 flex items-baseline justify-between gap-4">
                <Drawer.Title className="text-[30px] leading-[1.05] text-ink">{lang === "tr" ? p.name.tr : p.name.en}</Drawer.Title>
                <span className="tabular shrink-0 text-[20px] font-medium text-ink">{price(p.price)}</span>
              </div>
              {sub && <p className="font-serif text-[16px] italic text-mut">{p.name.en}</p>}
              {descTxt && !ingr && <Drawer.Description className="mt-3 text-[14.5px] leading-relaxed text-mut">{descTxt}</Drawer.Description>}
              {ingr && (
                <div className="mt-3">
                  <Drawer.Description className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{t("ingredients", lang)}</Drawer.Description>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {ingr.map((x, n) => <li key={n} className="rounded-full bg-ink/[0.05] px-3 py-1 text-[13px] text-ink">{x}</li>)}
                  </ul>
                </div>
              )}

              {opts.length > 0 && (
                <div className="mt-6 border-t border-ink/12 pt-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{t("pickOption", lang)}</p>
                  <motion.div key={shake} animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : undefined} transition={{ duration: 0.35 }} role="radiogroup" className="mt-3 flex flex-wrap gap-2">
                    {opts.map((o) => {
                      const on = option === o.id;
                      return (
                        <button key={o.id} role="radio" aria-checked={on} onClick={() => setOption(o.id)} className={`min-h-11 rounded-full px-4 text-[14px] ${on ? "bg-ink text-paper" : "border border-ink/20 text-ink"}`}>{o.label}</button>
                      );
                    })}
                  </motion.div>
                </div>
              )}

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
                  aria-disabled={needPick || gone}
                  disabled={gone}
                  onClick={() => {
                    if (gone) return;
                    if (needPick) { setShake((n) => n + 1); return; }
                    add(p, extras, qty, option ?? undefined, true);
                    setDone(true);
                    // Bildirim çekmece kapanırken çıkar (Vaul açıkken dokunma engeli olmasın)
                    timer.current = setTimeout(() => { timer.current = null; openProduct(null); announce(); }, 520);
                  }}
                  className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-paper transition-opacity ${needPick || gone ? "opacity-45" : ""}`}
                >
                  {gone ? t("notToday", lang) : done ? <>{Icon.check("h-5 w-5")}</> : <>{t("add", lang)} · <span className="tabular">{price(unit * qty)}</span></>}
                </motion.button>
              </div>
              {inList > 0 && !done && (
                <p className="mt-3 flex items-center justify-center gap-3 text-[13px] text-mut">
                  <span>{t("inYourList", lang)} <span className="tabular font-semibold text-ink">{inList}</span></span>
                  <button onClick={() => removeOne(keyOf(p))} className="min-h-11 text-ink underline decoration-ink/30 underline-offset-[3px]">{t("removeOne", lang)}</button>
                </p>
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
