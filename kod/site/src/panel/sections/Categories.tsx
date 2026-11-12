"use client";
import { useState } from "react";
import { BOARDS_META, usePanel } from "../data";
import { Icon } from "../icons";
import { Sheet } from "../sheet";
import { Button, Input, Empty } from "../ui";
import type { DbCategory } from "@/lib/supabase";

const sel = "h-11 w-full rounded-[10px] border border-ink/15 bg-paper px-3 text-[14.5px] focus:border-ink/50 focus:outline-none focus:ring-2 focus:ring-oak/25";
const sq = "grid h-11 w-11 place-items-center rounded-[8px] text-mut hover:bg-ink/[0.06] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60";

function CatRow({ c, first, last, count }: { c: DbCategory; first: boolean; last: boolean; count: number }) {
  const { updateCategory, moveCategory, deleteCategory } = usePanel();
  const [tr, setTr] = useState(c.name_tr);
  const [en, setEn] = useState(c.name_en);
  const [sure, setSure] = useState(false);
  const save = (k: "name_tr" | "name_en", v: string) => { const t = v.trim(); if (!t) { (k === "name_tr" ? setTr : setEn)(c[k]); return; } if (t !== c[k]) void updateCategory(c.id, { [k]: t }); };
  return (
    <li className="rounded-[12px] border border-ink/10 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={tr} aria-label="Türkçe ad" onChange={(e) => setTr(e.target.value)} onBlur={() => save("name_tr", tr)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
        <Input value={en} aria-label="English name" onChange={(e) => setEn(e.target.value)} onBlur={() => save("name_en", en)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
      </div>
      <div className="mt-2 flex items-center gap-1">
        <select aria-label="Pano" value={c.board} onChange={(e) => void updateCategory(c.id, { board: e.target.value })} className={sel + " min-w-0 flex-1"}>
          {BOARDS_META.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="button" className={sq} disabled={first} onClick={() => void moveCategory(c.id, -1)} aria-label={`${c.name_tr} yukarı`}><Icon name="up" size={18} /></button>
        <button type="button" className={sq} disabled={last} onClick={() => void moveCategory(c.id, 1)} aria-label={`${c.name_tr} aşağı`}><Icon name="down" size={18} /></button>
        {sure ? (
          <Button variant="danger" size="sm" className="!h-11" onClick={() => { setSure(false); void deleteCategory(c.id); }} onBlur={() => setSure(false)} autoFocus>Emin misin?</Button>
        ) : (
          <button type="button" className={sq + " text-[#9c3d26]"} onClick={() => (count > 0 ? void deleteCategory(c.id) : setSure(true))} aria-label={`${c.name_tr} kategorisini sil`} title={count > 0 ? `İçinde ${count} ürün var` : "Sil"}><Icon name="trash" size={18} /></button>
        )}
      </div>
      <p className="mt-1 text-[12px] text-mut">{count} ürün</p>
    </li>
  );
}

export default function Categories({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories, items, createCategory } = usePanel();
  const [board, setBoard] = useState(BOARDS_META[0].id);
  const [tr, setTr] = useState("");
  const [en, setEn] = useState("");
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.category_id, (counts.get(i.category_id) ?? 0) + 1);

  async function add() {
    if (!tr.trim()) return;
    const r = await createCategory({ board, name_tr: tr.trim(), name_en: en.trim() });
    if (r) { setTr(""); setEn(""); }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Kategoriler" desc="Ad, pano ve sıra. Ürünü olan kategori silinemez." wide>
      <div className="space-y-5">
        {BOARDS_META.map((b) => {
          const cs = categories.filter((c) => c.board === b.id);
          if (!cs.length) return null;
          return (
            <section key={b.id}>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">{b.name}</h3>
              <ul className="space-y-2">{cs.map((c, i) => <CatRow key={c.id} c={c} first={i === 0} last={i === cs.length - 1} count={counts.get(c.id) ?? 0} />)}</ul>
            </section>
          );
        })}
        {!categories.length && <Empty title="Kategori yok">Aşağıdan ilk kategoriyi ekleyin.</Empty>}
        <section className="rounded-[12px] border border-dashed border-ink/20 p-3">
          <h3 className="mb-2 font-serif text-[20px]">Yeni kategori</h3>
          <div className="space-y-2">
            <select aria-label="Pano" value={board} onChange={(e) => setBoard(e.target.value)} className={sel}>{BOARDS_META.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={tr} onChange={(e) => setTr(e.target.value)} placeholder="Ad (Türkçe)" aria-label="Ad (Türkçe)" onKeyDown={(e) => e.key === "Enter" && void add()} />
              <Input value={en} onChange={(e) => setEn(e.target.value)} placeholder="Name (English)" aria-label="Name (English)" onKeyDown={(e) => e.key === "Enter" && void add()} />
            </div>
            <Button variant="primary" disabled={!tr.trim()} onClick={() => void add()}><Icon name="plus" size={16} />Kategori ekle</Button>
          </div>
        </section>
      </div>
    </Sheet>
  );
}
