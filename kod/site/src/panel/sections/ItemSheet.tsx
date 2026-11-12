"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { toast } from "sonner";
import { photoUrl, uploadPhoto, usePanel, type ItemPatch } from "../data";
import { Icon } from "../icons";
import { Sheet } from "../sheet";
import { Button, Field, Input, Switch, Textarea, cx } from "../ui";

const TAGS = [
  { id: "hot", label: "Sıcak" }, { id: "iced", label: "Soğuk" }, { id: "coffee", label: "Kahve" }, { id: "sweet", label: "Tatlı" }, { id: "savory", label: "Tuzlu" },
];
type Draft = Required<Pick<ItemPatch, "name_tr" | "name_en" | "desc_tr" | "desc_en" | "price" | "category_id" | "image" | "options" | "options_optional" | "tags" | "available" | "hidden">>;

function Form({ uid, categoryId, onClose }: { uid: string | null; categoryId: string; onClose: () => void }) {
  const { items, categories, updateItem, createItem } = usePanel();
  const item = uid ? items.find((i) => i.uid === uid) : undefined;
  const [init] = useState<Draft>(() => ({
    name_tr: item?.name_tr ?? "", name_en: item?.name_en ?? "", desc_tr: item?.desc_tr ?? "", desc_en: item?.desc_en ?? "",
    price: item?.price ?? null, category_id: item?.category_id ?? categoryId ?? categories[0]?.id ?? "", image: item?.image ?? null,
    options: item?.options ?? [], options_optional: item?.options_optional ?? false, tags: item?.tags ?? [], available: item?.available ?? true, hidden: item?.hidden ?? false,
  }));
  const [d, setD] = useState<Draft>(init);
  const [priceText, setPriceText] = useState(init.price == null ? "" : String(init.price));
  const [opt, setOpt] = useState("");
  const [up, setUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const dirty = JSON.stringify(d) !== JSON.stringify(init);
  const valid = d.name_tr.trim().length > 0 && !!d.category_id;
  const img = photoUrl(d.image);

  function addOpt() {
    const t = opt.trim();
    if (!t) return;
    if (!d.options.some((o) => o.toLocaleLowerCase("tr") === t.toLocaleLowerCase("tr"))) set("options", [...d.options, t]);
    setOpt("");
  }
  function moveOpt(i: number, dir: -1 | 1) {
    const j = i + dir; if (j < 0 || j >= d.options.length) return;
    const n = [...d.options]; [n[i], n[j]] = [n[j], n[i]]; set("options", n);
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Lütfen bir görsel dosyası seçin."); return; }
    setUp(true);
    try { set("image", await uploadPhoto(f, item?.slug ?? (d.name_tr || "urun"))); } catch { toast.error("Fotoğraf yüklenemedi. Tekrar deneyin."); }
    setUp(false);
  }
  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    const clean: Draft = { ...d, name_tr: d.name_tr.trim(), name_en: d.name_en.trim() || d.name_tr.trim(), desc_tr: d.desc_tr.trim(), desc_en: d.desc_en.trim() };
    let ok = false;
    if (item) {
      const patch: Record<string, unknown> = {};
      for (const k of Object.keys(clean) as (keyof Draft)[]) if (JSON.stringify(clean[k]) !== JSON.stringify(init[k])) patch[k] = clean[k];
      ok = Object.keys(patch).length === 0 || (await updateItem(item.uid, patch as ItemPatch));
    } else ok = !!(await createItem(clean));
    setSaving(false);
    if (ok) { toast(item ? "Ürün kaydedildi" : "Ürün eklendi"); onClose(); }
  }

  const chip = "inline-flex min-h-11 items-center gap-1 rounded-full border px-4 text-[13.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60";
  const sq = "grid h-11 w-9 place-items-center text-mut hover:text-ink disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60 rounded-[6px]";

  return (
    <>
      <div className="space-y-5 pt-1">
        <div className="flex items-center gap-4">
          <div className={cx("grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[12px]", img ? "bg-ink/5" : "border border-dashed border-ink/25 text-mut")}>
            {up ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" /> : img ? <img src={img} alt="Ürün fotoğrafı önizlemesi" className="h-full w-full object-cover" /> : <Icon name="camera" size={26} />}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="!h-11" onClick={() => fileRef.current?.click()} disabled={up}>{img ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}</Button>
            {d.image && <Button size="sm" variant="ghost" className="!h-11" onClick={() => set("image", null)}>Kaldır</Button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad (Türkçe)"><Input value={d.name_tr} onChange={(e) => set("name_tr", e.target.value)} autoComplete="off" /></Field>
          <Field label="Ad (English)"><Input value={d.name_en} onChange={(e) => set("name_en", e.target.value)} autoComplete="off" /></Field>
        </div>
        <Field label="Açıklama (Türkçe)"><Textarea value={d.desc_tr} onChange={(e) => set("desc_tr", e.target.value)} /></Field>
        <Field label="Açıklama (English)"><Textarea value={d.desc_en} onChange={(e) => set("desc_en", e.target.value)} /></Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Fiyat (₺)">
            <Input type="number" inputMode="numeric" min={0} value={priceText} placeholder="Fiyatsız"
              onChange={(e) => { setPriceText(e.target.value); const n = Math.round(Number(e.target.value.replace(",", "."))); set("price", e.target.value.trim() === "" || Number.isNaN(n) ? null : Math.max(0, n)); }} />
          </Field>
          <Field label="Kategori">
            <select value={d.category_id} onChange={(e) => set("category_id", e.target.value)} className="h-11 w-full rounded-[10px] border border-ink/15 bg-paper px-3 text-[15px] focus:border-ink/50 focus:outline-none focus:ring-2 focus:ring-oak/25">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
            </select>
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Seçenekler (aroma, boyut…)</span>
          {d.options.length > 0 && (
            <ul className="mb-2 rounded-[10px] border border-ink/10">
              {d.options.map((o, i) => (
                <li key={o} className="flex items-center border-t border-ink/10 pl-3 first:border-t-0">
                  <span className="min-w-0 flex-1 truncate text-[14.5px]">{o}</span>
                  <button type="button" className={sq} disabled={i === 0} onClick={() => moveOpt(i, -1)} aria-label={`${o} yukarı`}><Icon name="up" size={16} /></button>
                  <button type="button" className={sq} disabled={i === d.options.length - 1} onClick={() => moveOpt(i, 1)} aria-label={`${o} aşağı`}><Icon name="down" size={16} /></button>
                  <button type="button" className={sq} onClick={() => set("options", d.options.filter((x) => x !== o))} aria-label={`${o} seçeneğini sil`}><Icon name="close" size={16} /></button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input value={opt} onChange={(e) => setOpt(e.target.value)} placeholder="Yazıp Enter'a basın" aria-label="Yeni seçenek"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOpt(); } }} />
            <Button onClick={addOpt} disabled={!opt.trim()}>Ekle</Button>
          </div>
          {d.options.length > 0 && <Switch on={d.options_optional} onChange={(v) => set("options_optional", v)} label="Sade de seçilebilir" />}
        </div>

        <div>
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Etiketler</span>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = d.tags.includes(t.id);
              return <button key={t.id} type="button" aria-pressed={on} onClick={() => set("tags", on ? d.tags.filter((x) => x !== t.id) : [...d.tags, t.id])}
                className={cx(chip, on ? "border-ink bg-ink text-paper" : "border-ink/15 hover:bg-ink/[0.05]")}>{t.label}</button>;
            })}
          </div>
        </div>

        <div className="divide-y divide-ink/10 rounded-[10px] border border-ink/10 px-3">
          <div className="flex items-center justify-between"><div><p className="text-[14.5px]">Bugün yok</p><p className="text-[12.5px] text-mut">Menüde görünür ama satılmıyor olarak işaretlenir.</p></div><div className="[&_button>span:nth-child(2)]:sr-only"><Switch on={!d.available} tone="bad" label="Bugün yok" onChange={(v) => set("available", !v)} /></div></div>
          <div className="flex items-center justify-between"><div><p className="text-[14.5px]">Gizli</p><p className="text-[12.5px] text-mut">Menüde hiç gösterilmez.</p></div><div className="[&_button>span:nth-child(2)]:sr-only"><Switch on={d.hidden} label="Gizli" onChange={(v) => set("hidden", v)} /></div></div>
        </div>
      </div>
      <div className="sticky bottom-0 -mx-5 mt-5 flex justify-end gap-2 border-t border-ink/10 bg-paper px-5 py-3">
        <Button onClick={onClose}>Vazgeç</Button>
        <Button variant="primary" disabled={!dirty || !valid || saving || up} onClick={save}>{saving ? "Kaydediliyor…" : "Kaydet"}</Button>
      </div>
    </>
  );
}

export default function ItemSheet({ open, uid, categoryId, onClose }: { open: boolean; uid: string | null; categoryId: string; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={uid ? "Ürünü düzenle" : "Yeni ürün"} wide>
      <Form key={uid ?? `new-${categoryId}`} uid={uid} categoryId={categoryId} onClose={onClose} />
    </Sheet>
  );
}
