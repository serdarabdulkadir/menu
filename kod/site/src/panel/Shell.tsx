"use client";
import { useCallback, useState, useSyncExternalStore } from "react";
import { cx } from "./ui";
import { BOARDS_META, usePanel } from "./data";
import { Icon } from "./icons";
import { Sheet } from "./sheet";
import Setup from "./Setup";
import Menu from "./sections/Menu";
import Showcase from "./sections/Showcase";
import Business from "./sections/Business";
import Announcement from "./sections/Announcement";
import QrCodes from "./sections/QrCodes";
import History from "./sections/History";
import Settings from "./sections/Settings";

const SECTIONS = [
  { id: "menu", label: "Menü", icon: "menu" },
  { id: "vitrin", label: "Vitrin", icon: "star" },
  { id: "isletme", label: "İşletme bilgileri", icon: "info" },
  { id: "duyuru", label: "Duyuru", icon: "bell" },
  { id: "qr", label: "QR kodlar", icon: "qr" },
  { id: "gecmis", label: "Geçmiş", icon: "clock" },
  { id: "ayarlar", label: "Ayarlar", icon: "gear" },
] as const;
type Sec = (typeof SECTIONS)[number]["id"];
const TABS: { id: Sec | "more"; label: string; icon: string }[] = [
  { id: "menu", label: "Menü", icon: "menu" },
  { id: "vitrin", label: "Vitrin", icon: "star" },
  { id: "duyuru", label: "Duyuru", icon: "bell" },
  { id: "qr", label: "QR", icon: "qr" },
  { id: "more", label: "Daha fazla", icon: "more" },
];

const subHash = (cb: () => void) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
function useSection(): Sec {
  const h = useSyncExternalStore(subHash, () => window.location.hash.slice(1), () => "");
  return (SECTIONS.find((s) => s.id === h)?.id ?? "menu") as Sec;
}

export default function Shell() {
  const { categories, items, signOut, email, isPreview } = usePanel();
  const sec = useSection();
  const [more, setMore] = useState(false);
  const [setup, setSetup] = useState(false);
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);

  const go = useCallback((id: Sec) => { if (window.location.hash.slice(1) !== id) window.location.hash = id; window.scrollTo(0, 0); setMore(false); }, []);
  const goCat = useCallback((id: string) => {
    if (window.location.hash.slice(1) !== "menu") window.location.hash = "menu";
    setFocus({ id, n: Date.now() });
  }, []);

  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.category_id, (counts.get(i.category_id) ?? 0) + 1);
  const label = SECTIONS.find((s) => s.id === sec)?.label ?? "Menü";
  const inMore = !["menu", "vitrin", "duyuru", "qr"].includes(sec);

  return (
    <div style={{ "--strip": isPreview ? "34px" : "0px" } as React.CSSProperties} className="[--ptop:calc(var(--strip)+52px)] lg:[--ptop:var(--strip)]">
      {isPreview && (
        <div className="sticky top-0 z-30 flex h-[34px] items-center justify-center gap-2 bg-oak/30 px-3 text-[12.5px] text-ink">
          <span className="truncate">Önizleme modu · değişiklikler yalnız bu tarayıcıda</span>
          <button type="button" onClick={() => setSetup(true)} className="shrink-0 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">Kurulum →</button>
        </div>
      )}

      <div className="lg:flex">
        {/* Masaüstü kenar çubuğu */}
        <aside className="sticky top-[var(--strip)] hidden h-[calc(100dvh-var(--strip))] w-[240px] shrink-0 flex-col border-r border-ink/10 bg-paper lg:flex">
          <div className="flex items-center gap-3 px-5 py-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-serif text-[24px] leading-none">Permesso</span>
          </div>
          <nav aria-label="Bölümler" className="px-3">
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" onClick={() => go(s.id)} aria-current={sec === s.id ? "page" : undefined}
                className={cx("flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[14.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", sec === s.id ? "bg-ink text-paper" : "text-ink hover:bg-ink/[0.06]")}>
                <Icon name={s.icon} size={18} />{s.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-2">
            <p className="px-3 pb-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-mut">Kategoriler</p>
            {BOARDS_META.map((b) => {
              const cs = categories.filter((c) => c.board === b.id);
              if (!cs.length) return null;
              return (
                <div key={b.id}>
                  {cs.map((c) => (
                    <button key={c.id} type="button" onClick={() => goCat(c.id)} className="flex h-9 w-full items-center justify-between rounded-[8px] px-3 text-[13.5px] text-ink/80 hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">
                      <span className="truncate">{c.name_tr}</span><span className="tabular text-mut">{counts.get(c.id) ?? 0}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="border-t border-ink/10 px-3 py-3">
            <a href="/" target="_blank" rel="noreferrer" className="flex h-11 items-center gap-3 rounded-[10px] px-3 text-[14px] hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">Menüyü aç <Icon name="ext" size={16} /></a>
            <button type="button" onClick={() => void signOut()} disabled={isPreview} className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[14px] text-mut hover:bg-ink/[0.06] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">
              <Icon name="out" size={16} />Çıkış <span className="ml-auto max-w-[90px] truncate text-[12px]">{email}</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobil üst çubuk */}
          <header className="sticky top-[var(--strip)] z-20 flex h-[52px] items-center gap-3 border-b border-ink/10 bg-paper px-4 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="" className="h-8 w-8 rounded-full object-cover" />
            <h1 className="font-serif text-[22px] leading-none">{label}</h1>
            <a href="/" target="_blank" rel="noreferrer" aria-label="Menüyü aç" className="-mr-2 ml-auto grid h-11 w-11 place-items-center text-mut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60"><Icon name="ext" size={18} /></a>
          </header>

          <main className="px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-5 lg:px-8 lg:pb-16 lg:pt-8">
            <div className="mx-auto w-full max-w-[880px]">
              {sec === "menu" && <Menu focusCat={focus} />}
              {sec === "vitrin" && <Showcase />}
              {sec === "isletme" && <Business />}
              {sec === "duyuru" && <Announcement />}
              {sec === "qr" && <QrCodes />}
              {sec === "gecmis" && <History />}
              {sec === "ayarlar" && <Settings />}
            </div>
          </main>
        </div>
      </div>

      {/* Mobil alt gezinme */}
      <nav aria-label="Ana gezinme" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden">
        {TABS.map((t) => {
          const active = t.id === "more" ? inMore || more : sec === t.id;
          return (
            <button key={t.id} type="button" onClick={() => (t.id === "more" ? setMore(true) : go(t.id))} aria-current={active ? "page" : undefined}
              className={cx("flex h-[60px] flex-col items-center justify-center gap-1 text-[11.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oak/60", active ? "font-semibold text-ink" : "text-mut")}>
              <Icon name={t.icon} size={22} />{t.label}
            </button>
          );
        })}
      </nav>

      <Sheet open={more} onClose={() => setMore(false)} title="Daha fazla">
        <div className="space-y-1">
          {SECTIONS.filter((s) => !["menu", "vitrin", "duyuru", "qr"].includes(s.id)).map((s) => (
            <button key={s.id} type="button" onClick={() => go(s.id)} className="flex h-12 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] hover:bg-ink/[0.06]"><Icon name={s.icon} size={20} />{s.label}</button>
          ))}
          <a href="/" target="_blank" rel="noreferrer" className="flex h-12 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] hover:bg-ink/[0.06]"><Icon name="ext" size={20} />Menüyü aç</a>
          <button type="button" onClick={() => void signOut()} disabled={isPreview} className="flex h-12 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] text-mut hover:bg-ink/[0.06] disabled:opacity-40"><Icon name="out" size={20} />Çıkış <span className="ml-auto truncate text-[12.5px]">{email}</span></button>
        </div>
      </Sheet>

      <Sheet open={setup} onClose={() => setSetup(false)} title="Kurulum" desc="Gerçek veriye geçmek için adımlar." wide>
        <Setup />
      </Sheet>
    </div>
  );
}
