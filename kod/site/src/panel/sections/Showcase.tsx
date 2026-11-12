"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { usePanel, photoUrl } from "../data";
import { Button, Empty, Input, PageHead, SaveDot, Skeleton, cx } from "../ui";

const MAX = 10;
type Save = "idle" | "saving" | "saved" | "error";

export default function Showcase() {
  const { items, getSetting, saveSetting } = usePanel();
  const [list, setList] = useState<string[] | null>(null);
  const [q, setQ] = useState("");
  const [save, setSave] = useState<Save>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string[] | null>(null);
  const saveRef = useRef(saveSetting);
  useEffect(() => { saveRef.current = saveSetting; });

  useEffect(() => {
    let alive = true;
    getSetting<string[]>("showcase").then((v) => { if (alive) setList(Array.isArray(v) ? v : []); }).catch(() => { if (alive) setList([]); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function flush() {
    const v = pending.current;
    if (!v) return;
    pending.current = null;
    setSave("saving");
    const ok = await saveRef.current("showcase", v);
    setSave(ok ? "saved" : "error");
    if (!ok) toast.error("Vitrin kaydedilemedi");
  }
  // Sayfadan çıkarken bekleyen değişikliği yaz
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (pending.current) void saveRef.current("showcase", pending.current); }, []);

  function change(next: string[]) {
    setList(next);
    pending.current = next;
    setSave("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 800);
  }

  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);
  const selected = (list ?? []).filter((s) => bySlug.has(s));
  const withPhoto = useMemo(() => items.filter((i) => i.image && !i.hidden), [items]);
  const needle = q.trim().toLocaleLowerCase("tr");
  const candidates = needle ? withPhoto.filter((i) => i.name_tr.toLocaleLowerCase("tr").includes(needle)) : withPhoto;

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= selected.length) return;
    const n = [...selected];
    [n[i], n[j]] = [n[j], n[i]];
    change(n);
  }
  function toggle(slug: string) {
    if (selected.includes(slug)) return change(selected.filter((s) => s !== slug));
    if (selected.length >= MAX) return toast.error(`En çok ${MAX} ürün seçilebilir`);
    change([...selected, slug]);
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <PageHead title="Vitrin" sub="Menüde 'Vitrinden' şeridinde ve aramada görünür" actions={<SaveDot state={save} />} />

      <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Seçili ürünler ({selected.length}/{MAX})</h2>
      {list === null ? (
        <div className="flex gap-3 overflow-hidden"><Skeleton className="h-44 w-36 shrink-0" /><Skeleton className="h-44 w-36 shrink-0" /><Skeleton className="h-44 w-36 shrink-0" /></div>
      ) : selected.length === 0 ? (
        <Empty title="Vitrin boş">Aşağıdan fotoğraflı ürünleri seçerek ekleyin.</Empty>
      ) : (
        <ol className="flex gap-3 overflow-x-auto pb-2">
          {selected.map((slug, i) => {
            const it = bySlug.get(slug)!;
            const src = photoUrl(it.image);
            return (
              <li key={slug} className="w-36 shrink-0 overflow-hidden rounded-[12px] border border-ink/10 bg-paper">
                <div className="relative aspect-[4/3] bg-ink/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src && <img src={src} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-paper text-[12px] font-semibold text-ink">{i + 1}</span>
                  <button type="button" onClick={() => toggle(slug)} aria-label={`${it.name_tr} vitrinden çıkar`} className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-[18px] text-ink hover:bg-paper">×</button>
                </div>
                <div className="px-2.5 pt-2">
                  <p className="truncate text-[13.5px] font-medium text-ink">{it.name_tr}</p>
                  <p className="text-[12.5px] text-mut">{it.price != null ? `${it.price} ₺` : "-"}</p>
                </div>
                <div className="flex justify-between p-1.5">
                  <Button size="sm" variant="ghost" className="!h-11 !w-11 !px-0" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Öne al">←</Button>
                  <Button size="sm" variant="ghost" className="!h-11 !w-11 !px-0" disabled={i === selected.length - 1} onClick={() => move(i, 1)} aria-label="Sona al">→</Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <h2 className="mb-2 mt-8 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Ekle</h2>
      <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün ara" aria-label="Ürün ara" />
      {candidates.length === 0 ? (
        <div className="mt-3"><Empty title="Fotoğraflı ürün bulunamadı">Yalnız fotoğrafı olan ürünler eklenebilir.</Empty></div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {candidates.map((it) => {
            const on = selected.includes(it.slug);
            const src = photoUrl(it.image);
            return (
              <li key={it.uid}>
                <button type="button" onClick={() => toggle(it.slug)} aria-pressed={on}
                  className={cx("block w-full overflow-hidden rounded-[12px] border text-left transition-colors", on ? "border-oak ring-2 ring-oak/40" : "border-ink/10 hover:border-ink/30")}>
                  <div className="relative aspect-[4/3] bg-ink/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {src && <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    {on && <span className="absolute right-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[11px] text-paper">Seçili</span>}
                  </div>
                  <div className="min-h-11 px-2.5 py-1.5">
                    <p className="truncate text-[13px] font-medium text-ink">{it.name_tr}</p>
                    <p className="text-[12px] text-mut">{it.price != null ? `${it.price} ₺` : "-"}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
