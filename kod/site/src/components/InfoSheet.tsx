"use client";
import { useSyncExternalStore } from "react";
import { Drawer } from "vaul";
import { INFO, isOpenNow, minutesToClose, minuteNow, subscribeMinute } from "@/lib/menu";
import { t } from "@/lib/i18n";
import { useApp } from "./store";
import { Icon, Logo } from "./ui";

const noop = () => () => {};
const LABEL = "text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mut";
const PHOTOS = ["/img/mekan-salon.jpg", "/img/mekan-tezgah.jpg", "/img/urun/COFFEE-LATTE-1.webp"];

export function InfoSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { lang } = useApp();
  // Sunucuda null, istemcide o anki durum (hydration uyumlu)
  const tick = useSyncExternalStore(open ? subscribeMinute : noop, () => (open ? minuteNow() : null), () => null);
  const isOpen = tick === null ? null : isOpenNow();

  let status = "";
  if (isOpen !== null) {
    if (isOpen) {
      const left = minutesToClose();
      const h = Math.floor(left / 60), mm = left % 60;
      const tm = h > 0 ? `${h} ${t("hrShort", lang)} ${mm} ${t("minShort", lang)}` : `${mm} ${t("minShort", lang)}`;
      status = t("openLeft", lang).replace("{t}", tm);
    } else status = t("closedOpens", lang).replace("{t}", INFO.open);
  }
  const story = t("infoStory", lang).split(/<i>|<\/i>/);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94svh] max-w-[440px] flex-col rounded-t-[24px] bg-paper outline-none">
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/20" />
          <div className="overflow-y-auto px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
            <Drawer.Title className="font-serif text-[36px] leading-none text-ink">permesso? <i className="text-oak">avanti!</i></Drawer.Title>
            <p className="mt-3 flex h-5 items-center gap-2 text-[13.5px] text-ink">
              {isOpen !== null && <><span aria-hidden className={`h-2 w-2 rounded-full ${isOpen ? "bg-[#4f6b3a]" : "bg-oak"}`} />{status}</>}
            </p>
            <div className="mt-5 flex items-center gap-4">
              <Logo className="w-[48px] shrink-0" />
              <p className="text-[14.5px] leading-relaxed text-mut">{story.map((s, i) => (i % 2 ? <i key={i} className="font-serif">{s}</i> : s))}</p>
            </div>

            <div className="mt-5 border-y border-ink/12">
              <div className="py-3.5">
                <span className={`${LABEL} block`}>{t("hours", lang)}</span>
                <span className="tabular mt-1 block text-[17px] leading-snug text-ink">{t("daily", lang)} {INFO.open} – {INFO.close}</span>
              </div>
              <div className="border-t border-ink/12 py-3.5">
                <span className={`${LABEL} block`}>{t("address", lang)}</span>
                <span className="mt-1 block text-[17px] leading-snug text-ink">{INFO.address}</span>
              </div>
            </div>

            <a href={INFO.maps} target="_blank" rel="noopener" className="mt-5 flex h-[52px] items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-paper">
              {t("directions", lang)} {Icon.arrow("h-[18px] w-[18px]")}
            </a>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href={`tel:${INFO.phone}`} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink/20 text-[15px] text-ink">{Icon.phone("h-[18px] w-[18px]")}{t("call", lang)}</a>
              <a href={INFO.whatsapp} target="_blank" rel="noopener" className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink/20 text-[15px] text-ink">{Icon.chat("h-[18px] w-[18px]")}WhatsApp</a>
            </div>

            <a href={INFO.instagram} target="_blank" rel="noopener" className="mt-6 block border-t border-ink/12 pt-4">
              <span className="flex items-center justify-between">
                <span className="font-serif text-[22px] text-ink">@{INFO.handle}</span>
                <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-oak">{t("follow", lang)} {Icon.arrow("h-3.5 w-3.5")}</span>
              </span>
              <span className="mt-4 grid grid-cols-3 gap-2">
                {PHOTOS.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p} src={p} alt="" width={p.includes("/urun/") ? 600 : 640} height={p.includes("/urun/") ? 600 : 359} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-[10px] object-cover" />
                ))}
              </span>
            </a>

            <p className="mt-6 text-center font-serif text-[16px] italic text-mut">{t("farewell", lang)}</p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
