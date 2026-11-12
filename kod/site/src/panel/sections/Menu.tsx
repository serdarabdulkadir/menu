"use client";
/* eslint-disable @next/next/no-img-element */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { DbCategory, DbItem } from "@/lib/supabase";
import { BOARDS_META, bySort, fold, photoUrl, uploadPhoto, usePanel } from "../data";
import { Icon } from "../icons";
import { Sheet } from "../sheet";
import { Button, Card, Empty, Input, PageHead, Skeleton, Switch, cx } from "../ui";
import ItemSheet from "./ItemSheet";
import Categories from "./Categories";
import BulkPrice from "./BulkPrice";

const money = (p: number | null) => (p == null ? "—" : `₺${p}`);

type RowProps = {
  item: DbItem; busy: boolean;
  onEdit: (uid: string) => void; onPhoto: (item: DbItem) => void; onMore: (item: DbItem, el: HTMLElement) => void;
  onAvail: (item: DbItem, v: boolean) => void; onPrice: (item: DbItem, v: number | null) => Promise<boolean>;
};

const Row = memo(function Row({ item, busy, onEdit, onPhoto, onMore, onAvail, onPrice }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState(false);
  const cancelled = useRef(false);
  const img = photoUrl(item.image);
  const off = !item.available, hid = item.hidden;

  function commit() {
    setEditing(false);
    if (cancelled.current) { cancelled.current = false; return; }
    const t = draft.trim().replace(",", ".");
    const v = t === "" ? null : Math.max(0, Math.round(Number(t)));
    if (v !== null && Number.isNaN(v)) return;
    if (v === item.price) return;
    void onPrice(item, v).then((ok) => { if (ok) { setFlash(true); setTimeout(() => setFlash(false), 1100); } });
  }

  return (
    <li className={cx("flex min-h-14 items-center gap-2.5 border-t border-ink/10 px-3 py-1.5 first:border-t-0", flash && "bg-[#4f6b3a]/15", "transition-colors duration-500")}>
      <button
        type="button" onClick={() => onPhoto(item)} aria-label={img ? `${item.name_tr} fotoğrafını değiştir` : `${item.name_tr} için fotoğraf ekle`}
        className={cx("grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", img ? "bg-ink/5" : "border border-dashed border-ink/25 text-mut hover:bg-ink/[0.04]", (off || hid) && "opacity-50")}
      >
        {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" /> : img ? <img src={img} alt="" loading="lazy" className="h-full w-full object-cover object-[50%_78%]" /> : <Icon name="camera" size={18} />}
      </button>

      <button type="button" onClick={() => onEdit(item.uid)} className={cx("min-w-0 flex-1 rounded-[6px] py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", (off || hid) && "opacity-55")}>
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="line-clamp-2 text-[14.5px] font-medium leading-tight">{item.name_tr}</span>
          {off && <span className="rounded-full bg-[#9c3d26]/12 px-1.5 py-px text-[10.5px] font-semibold text-[#9c3d26]">Bugün yok</span>}
          {hid && <span className="rounded-full bg-ink/10 px-1.5 py-px text-[10.5px] font-semibold text-mut">Gizli</span>}
        </span>
        <span className="block truncate text-[12px] text-mut">
          {item.name_en && item.name_en !== item.name_tr ? item.name_en : ""}
          {item.options.length > 0 && <>{item.name_en && item.name_en !== item.name_tr ? " · " : ""}{item.options.length} seçenek</>}
        </span>
      </button>

      <div className="shrink-0">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus type="number" inputMode="numeric" min={0} aria-label={`${item.name_tr} fiyatı`} value={draft}
              onChange={(e) => setDraft(e.target.value)} onBlur={commit}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { cancelled.current = true; e.currentTarget.blur(); } }}
              onFocus={(e) => e.currentTarget.select()}
              className="h-10 w-[76px] px-2 text-right tabular"
            />
          </div>
        ) : (
          <button
            type="button" onClick={() => { setDraft(item.price == null ? "" : String(item.price)); setEditing(true); }} aria-label={`${item.name_tr} fiyatı ${money(item.price)}, düzenle`}
            className={cx("tabular h-11 min-w-[56px] rounded-[8px] px-2 text-right text-[14.5px] hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", (off || hid) && "opacity-55")}
          >{money(item.price)}</button>
        )}
      </div>

      <div className="shrink-0 max-md:[&_button>span:nth-child(2)]:sr-only">
        <Switch on={off} tone="bad" label="Bugün yok" onChange={(v) => onAvail(item, !v)} />
      </div>

      <button type="button" onClick={(e) => onMore(item, e.currentTarget)} aria-label={`${item.name_tr} işlemleri`} aria-haspopup="menu" className="-mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-[8px] text-mut hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">
        <Icon name="more" />
      </button>
    </li>
  );
});

function CatHeader({ cat, count, first, last, onMove, onRename }: { cat: DbCategory; count: number; first: boolean; last: boolean; onMove: (d: -1 | 1) => void; onRename: (v: string) => void }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState("");
  const skip = useRef(false);
  const done = () => { setEdit(false); if (skip.current) { skip.current = false; return; } const t = v.trim(); if (t && t !== cat.name_tr) onRename(t); };
  const sq = "grid h-11 w-11 place-items-center rounded-[8px] text-mut hover:bg-ink/[0.06] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60";
  return (
    <div className="flex items-center gap-1 border-b border-ink/10 px-3 py-1">
      {edit ? (
        <Input autoFocus value={v} aria-label="Kategori adı" onChange={(e) => setV(e.target.value)} onBlur={done} onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { skip.current = true; e.currentTarget.blur(); } }} className="h-10 max-w-[260px]" />
      ) : (
        <h2 className="min-w-0 flex-1 truncate font-serif text-[22px] leading-none">{cat.name_tr} <span className="ml-1 font-sans text-[13px] text-mut">{count}</span></h2>
      )}
      <span className="flex-1" />
      <button type="button" className={sq} disabled={first} onClick={() => onMove(-1)} aria-label={`${cat.name_tr} kategorisini yukarı taşı`}><Icon name="up" size={18} /></button>
      <button type="button" className={sq} disabled={last} onClick={() => onMove(1)} aria-label={`${cat.name_tr} kategorisini aşağı taşı`}><Icon name="down" size={18} /></button>
      <button type="button" className={sq} onClick={() => { setV(cat.name_tr); setEdit(true); }} aria-label={`${cat.name_tr} kategorisini yeniden adlandır`}><Icon name="pencil" size={17} /></button>
    </div>
  );
}

type Target = { uid: string; rect: DOMRect; pop: boolean };

export default function Menu({ focusCat }: { focusCat?: { id: string; n: number } | null }) {
  const { loading, categories, items, updateItem, createItem, deleteItem, moveItem, updateCategory, moveCategory } = usePanel();
  const [q, setQ] = useState("");
  const [board, setBoard] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; uid: string | null; cat: string }>({ open: false, uid: null, cat: "" });
  const [catsOpen, setCatsOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [del, setDel] = useState<{ open: boolean; uid: string | null }>({ open: false, uid: null });
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const fileFor = useRef<DbItem | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" ile aramaya odaklan
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Kenar çubuğundan kategoriye kay
  useEffect(() => {
    if (!focusCat) return;
    const t = setTimeout(() => document.getElementById(`cat-${focusCat.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => clearTimeout(t);
  }, [focusCat]);

  const byCat = useMemo(() => {
    const m = new Map<string, DbItem[]>();
    for (const i of items) { const l = m.get(i.category_id); if (l) l.push(i); else m.set(i.category_id, [i]); }
    for (const l of m.values()) l.sort(bySort);
    return m;
  }, [items]);
  const byBoard = useMemo(() => {
    const m = new Map<string, DbCategory[]>();
    for (const c of categories) { const l = m.get(c.board); if (l) l.push(c); else m.set(c.board, [c]); }
    return m;
  }, [categories]);
  const boardCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of categories) m.set(c.board, (m.get(c.board) ?? 0) + (byCat.get(c.id)?.length ?? 0));
    return m;
  }, [categories, byCat]);

  const fq = fold(q.trim());
  const groups = useMemo(() => {
    const out: { cat: DbCategory; list: DbItem[] }[] = [];
    for (const b of BOARDS_META) {
      if (board && b.id !== board) continue;
      for (const c of byBoard.get(b.id) ?? []) {
        const all = byCat.get(c.id) ?? [];
        const list = fq ? all.filter((i) => fold(`${i.name_tr} ${i.name_en} ${i.slug}`).includes(fq)) : all;
        if (fq && !list.length) continue;
        out.push({ cat: c, list });
      }
    }
    return out;
  }, [byBoard, byCat, board, fq]);

  const openNew = (cat?: string) => setSheet({ open: true, uid: null, cat: cat ?? (board ? byBoard.get(board)?.[0]?.id : undefined) ?? categories[0]?.id ?? "" });
  const openEdit = useCallback((uid: string) => setSheet({ open: true, uid, cat: "" }), []);

  const onAvail = useCallback((it: DbItem, v: boolean) => {
    void updateItem(it.uid, { available: v }, v ? `"${it.name_tr}" yeniden satışta` : `"${it.name_tr}" bugün yok olarak işaretlendi`);
  }, [updateItem]);
  const onPrice = useCallback((it: DbItem, v: number | null) => updateItem(it.uid, { price: v }, `${it.name_tr}: ${money(it.price)} → ${money(v)}`), [updateItem]);
  const onPhoto = useCallback((it: DbItem) => { fileFor.current = it; fileRef.current?.click(); }, []);
  const onMore = useCallback((it: DbItem, el: HTMLElement) => setTarget({ uid: it.uid, rect: el.getBoundingClientRect(), pop: window.innerWidth >= 640 }), []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0], it = fileFor.current;
    e.target.value = "";
    if (!f || !it) return;
    if (!f.type.startsWith("image/")) { toast.error("Lütfen bir görsel dosyası seçin."); return; }
    setBusy((s) => new Set(s).add(it.uid));
    try {
      const url = await uploadPhoto(f, it.slug);
      await updateItem(it.uid, { image: url });
    } catch { toast.error("Fotoğraf yüklenemedi. Tekrar deneyin."); }
    setBusy((s) => { const n = new Set(s); n.delete(it.uid); return n; });
  }

  const tItem = target ? items.find((i) => i.uid === target.uid) : undefined;
  const tList = tItem ? byCat.get(tItem.category_id) ?? [] : [];
  const tIdx = tItem ? tList.findIndex((i) => i.uid === tItem.uid) : -1;
  const actions = tItem ? [
    { label: "Düzenle", icon: "pencil", run: () => openEdit(tItem.uid) },
    {
      label: "Kopyala", icon: "copy", run: async () => {
        const { uid: _u, updated_at: _t, slug: _s, sort: _o, ...rest } = tItem; void _u; void _t; void _s; void _o;
        const row = await createItem({ ...rest, name_tr: `${tItem.name_tr} (kopya)`, name_en: `${tItem.name_en} (copy)`, slug: `${tItem.slug}-kopya` });
        if (row) { toast("Ürün kopyalandı"); openEdit(row.uid); }
      },
    },
    { label: tItem.hidden ? "Menüde göster" : "Menüden gizle", icon: tItem.hidden ? "eye" : "eyeoff", run: () => void updateItem(tItem.uid, { hidden: !tItem.hidden }, tItem.hidden ? `"${tItem.name_tr}" yeniden görünür` : `"${tItem.name_tr}" menüden gizlendi`) },
    { label: "Yukarı taşı", icon: "up", disabled: tIdx <= 0, run: () => void moveItem(tItem.uid, -1) },
    { label: "Aşağı taşı", icon: "down", disabled: tIdx >= tList.length - 1, run: () => void moveItem(tItem.uid, 1) },
    { label: "Sil", icon: "trash", danger: true, run: () => setDel({ open: true, uid: tItem.uid }) },
  ] : [];
  const delItem = items.find((i) => i.uid === del.uid);

  return (
    <div>
      <PageHead
        title={`Menü · ${items.length} ürün`}
        actions={<>
          <Button onClick={() => setCatsOpen(true)}>Kategoriler</Button>
          <Button onClick={() => setBulkOpen(true)}>Toplu fiyat</Button>
          <Button variant="primary" onClick={() => openNew()}><Icon name="plus" size={16} />Ürün</Button>
        </>}
      />

      <div className="sticky top-[var(--ptop)] z-10 -mx-1 bg-wall px-1 pb-2 pt-1">
        <div className="relative">
          <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
          <Input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün ara  ( / )" aria-label="Ürün ara" className="pl-10" />
        </div>
        <div className="no-scrollbar -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1" role="group" aria-label="Pano filtresi">
          {[{ id: null as string | null, name: "Tümü", n: items.length }, ...BOARDS_META.map((b) => ({ id: b.id as string | null, name: b.name, n: boardCount.get(b.id) ?? 0 }))].map((b) => (
            <button key={b.id ?? "all"} type="button" aria-pressed={board === b.id} onClick={() => setBoard(b.id)}
              className={cx("h-11 shrink-0 rounded-full border px-4 text-[13.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", board === b.id ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper text-ink hover:bg-ink/[0.05]")}>
              {b.name} <span className={board === b.id ? "text-paper/70" : "text-mut"}>{b.n}</span>
            </button>
          ))}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <div className="mt-3 space-y-4">
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        {!loading && !groups.length && (fq
          ? <Empty title="Sonuç yok">&quot;{q}&quot; ile eşleşen ürün bulunamadı.</Empty>
          : <Empty title="Henüz kategori yok"><Button className="mt-2" onClick={() => setCatsOpen(true)}>Kategori ekle</Button></Empty>)}
        {!loading && groups.map(({ cat, list }) => {
          const peers = byBoard.get(cat.board) ?? [];
          const pi = peers.findIndex((c) => c.id === cat.id);
          return (
            <Card key={cat.id} className="scroll-mt-[calc(var(--ptop)+120px)]">
              <div id={`cat-${cat.id}`} className="scroll-mt-[calc(var(--ptop)+120px)]" />
              <CatHeader cat={cat} count={byCat.get(cat.id)?.length ?? 0} first={pi <= 0} last={pi >= peers.length - 1} onMove={(d) => void moveCategory(cat.id, d)} onRename={(v) => void updateCategory(cat.id, { name_tr: v })} />
              {list.length === 0 ? <p className="px-4 py-5 text-[13.5px] text-mut">Bu kategoride henüz ürün yok.</p> : (
                <ul>{list.map((it) => <Row key={it.uid} item={it} busy={busy.has(it.uid)} onEdit={openEdit} onPhoto={onPhoto} onMore={onMore} onAvail={onAvail} onPrice={onPrice} />)}</ul>
              )}
              <button type="button" onClick={() => openNew(cat.id)} className="flex h-12 w-full items-center justify-center gap-2 border-t border-ink/10 text-[14px] text-mut hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oak/60 rounded-b-[14px]">
                <Icon name="plus" size={16} />Ürün ekle
              </button>
            </Card>
          );
        })}
      </div>

      {/* Satır menüsü: masaüstünde açılır kutu, mobilde alt sayfa */}
      {target && tItem && target.pop && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setTarget(null)} onKeyDown={(e) => { if (e.key === "Escape") setTarget(null); }} />
          <div
            role="menu" aria-label={`${tItem.name_tr} işlemleri`}
            style={{ top: Math.max(8, Math.min(target.rect.bottom + 4, window.innerHeight - 6 * 44 - 20)), left: Math.max(8, target.rect.right - 208) }}
            className="fixed z-50 w-[208px] rounded-[12px] border border-ink/12 bg-paper p-1 shadow-[0_8px_28px_-8px_rgba(30,26,23,.35)]"
          >
            {actions.map((a) => (
              <button key={a.label} role="menuitem" type="button" disabled={a.disabled} autoFocus={a.label === "Düzenle"}
                onKeyDown={(e) => { if (e.key === "Escape") setTarget(null); }}
                onClick={() => { setTarget(null); a.run(); }}
                className={cx("flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-[14px] hover:bg-ink/[0.06] disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", a.danger && "text-[#9c3d26]")}>
                <Icon name={a.icon} size={17} />{a.label}
              </button>
            ))}
          </div>
        </>
      )}
      <Sheet open={!!target && !target.pop} onClose={() => setTarget(null)} title={tItem?.name_tr ?? ""}>
        <div className="space-y-0.5">
          {actions.map((a) => (
            <button key={a.label} type="button" disabled={a.disabled} onClick={() => { setTarget(null); a.run(); }}
              className={cx("flex h-12 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] hover:bg-ink/[0.06] disabled:opacity-35", a.danger && "text-[#9c3d26]")}>
              <Icon name={a.icon} size={19} />{a.label}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={del.open} onClose={() => setDel((d) => ({ ...d, open: false }))} title="Ürünü sil" desc={delItem ? `"${delItem.name_tr}" menüden kalıcı olarak kaldırılır. Silince "Geri al" ile döndürebilirsiniz.` : undefined}
        footer={<><Button onClick={() => setDel((d) => ({ ...d, open: false }))}>Vazgeç</Button><Button variant="danger" onClick={() => { if (del.uid) void deleteItem(del.uid); setDel((d) => ({ ...d, open: false })); }}>Sil</Button></>}>
        <p className="text-[14px] text-mut">Yalnızca bugün satılmıyorsa silmek yerine &quot;Bugün yok&quot; anahtarını kullanın.</p>
      </Sheet>

      <ItemSheet open={sheet.open} uid={sheet.uid} categoryId={sheet.cat} onClose={() => setSheet((s) => ({ ...s, open: false }))} />
      <Categories open={catsOpen} onClose={() => setCatsOpen(false)} />
      <BulkPrice open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}
