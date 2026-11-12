"use client";
import { BOARD_ILL, BOARDS, keyOf, norm, price, type Item } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useApp } from "./store";
import { Frame, Icon, Logo, Thumb } from "./ui";
import { BottomBar } from "./Wall";

export function Mark({ text, q }: { text: string; q?: string }) {
  const k = norm((q ?? "").trim());
  const at = k ? norm(text).indexOf(k) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<span className="underline decoration-oak decoration-2 underline-offset-[3px]">{text.slice(at, at + k.length)}</span>{text.slice(at + k.length)}</>;
}

export function Row({ i, onOpen, q, index = 0, quickAdd = true }: { i: Item; onOpen: (i: Item) => void; q?: string; index?: number; quickAdd?: boolean }) {
  const { lang, lines, add } = useApp();
  const sub = lang === "tr" && i.name.tr !== i.name.en ? i.name.tr : null;
  const nOpt = i.options?.length ?? 0;
  const inList = lines.reduce((s, l) => (l.itemKey === keyOf(i) ? s + l.qty : s), 0);
  const onPlus = () => (nOpt ? onOpen(i) : add(i, [], 1));
  return (
    <div style={index ? { ["--i" as string]: Math.min(index, 9) } : undefined} className={`${index ? "rise" : ""} flex w-full items-center`}>
      <button onClick={() => onOpen(i)} className={`group flex min-w-0 flex-1 items-center gap-3.5 py-2.5 text-left transition-transform duration-150 active:scale-[0.985] ${i.available ? "" : "opacity-[0.55]"}`}>
        <Thumb file={i.image} ill={BOARD_ILL[i.board]} className="h-[68px] w-[54px]" />
        <span className="min-w-0 flex-1">
          <span lang="en" className="block text-[12.5px] font-medium uppercase tracking-[0.06em] text-ink"><Mark text={i.name.en} q={q} /></span>
          {sub && <span className="mt-0.5 block font-serif text-[15px] italic leading-tight text-mut"><Mark text={sub} q={q} /></span>}
          {nOpt > 0 && <span className="mt-0.5 block text-[11px] text-oak">{nOpt} {t("optionsN", lang)}</span>}
        </span>
        {i.available
          ? <span className="tabular shrink-0 text-[14px] font-medium text-ink">{price(i.price)}</span>
          : <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-mut">{t("notToday", lang)}</span>}
      </button>
      {quickAdd && i.available && (
        <button aria-label={t("quickAdd", lang)} onClick={onPlus} className="ml-0.5 grid h-11 w-11 shrink-0 place-items-center text-ink">
          {inList > 0 ? (
            <span className="tabular grid h-8 w-8 place-items-center rounded-full bg-oak text-[13px] font-semibold text-ink">{inList}</span>
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-full border border-ink/20">{Icon.plus("h-4 w-4")}</span>
          )}
        </button>
      )}
    </div>
  );
}

export function BoardPage({ id }: { id: string }) {
  const { lang, go, openProduct, setInfoOpen } = useApp();
  const b = BOARDS.find((x) => x.id === id)!;
  return (
    <div className="page-in mx-auto max-w-[440px]">
      <Frame b={14} className="min-h-[100svh] pb-32" style={{ viewTransitionName: `board-${b.id}` }}>
        <div>
          <div className="flex items-start justify-between px-6 pt-7">
            <button aria-label={t("back", lang)} onClick={() => go({ name: "wall" })} className="-ml-3 grid h-11 w-11 place-items-center text-ink">{Icon.back("h-6 w-6")}</button>
            <Logo className="mt-0.5 w-[34px]" />
            <span className="w-7" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/img/ill/${b.ill}.webp`} alt="" style={{ ["--i" as string]: 1 }} className="rise ml-auto mr-5 -mt-2 w-[min(58%,230px)]" decoding="async" />

          <div className="grid grid-cols-[88px_1fr] pr-6">
            <div className="flex flex-col justify-end">
              <h1 className="vtitle sticky bottom-[110px] ml-[18px] text-[64px] text-ink">{b.title}</h1>
            </div>
            <div>
              {b.sections.map((s, si) => (
                <section key={s.id} className={`mt-6 first:mt-2 ${si > 0 ? "cv-auto" : ""}`}>
                  <h2 className="border-b border-ink/12 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut">{s.name[lang]}</h2>
                  <div className="divide-y divide-ink/[0.07]">
                    {s.items.map((i, ii) => <Row key={i.id} i={i} onOpen={openProduct} index={si === 0 ? ii + 2 : 0} />)}
                  </div>
                </section>
              ))}
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center px-6">
            <p className="font-serif text-[26px] text-ink">permesso? <i className="text-oak">avanti!</i></p>
            <button onClick={() => setInfoOpen(true)} className="mt-4 flex h-11 items-center rounded-full border border-ink/20 px-5 text-[14px] text-ink">{t("info", lang)}</button>
          </div>
        </div>
      </Frame>
      <BottomBar />
    </div>
  );
}
