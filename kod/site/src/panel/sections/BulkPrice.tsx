"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BOARDS_META, usePanel } from "../data";
import { Sheet } from "../sheet";
import { Button, Input, cx } from "../ui";

type Op = "pct+" | "pct-" | "add+" | "add-";
const OPS: { id: Op; label: string }[] = [
  { id: "pct+", label: "% artır" }, { id: "pct-", label: "% azalt" }, { id: "add+", label: "₺ ekle" }, { id: "add-", label: "₺ çıkar" },
];

export default function BulkPrice({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories, items, updateItem } = usePanel();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [op, setOp] = useState<Op>("pct+");
  const [amount, setAmount] = useState("10");
  const [round, setRound] = useState<0 | 5 | 10>(5);
  const [prog, setProg] = useState<{ done: number; total: number } | null>(null);

  const allIds = categories.map((c) => c.id);
  const toggleCat = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleBoard = (b: string) => setSel((s) => {
    const ids = categories.filter((c) => c.board === b).map((c) => c.id);
    const all = ids.every((i) => s.has(i)); const n = new Set(s);
    ids.forEach((i) => (all ? n.delete(i) : n.add(i))); return n;
  });

  const amt = Number(amount.replace(",", "."));
  const changes = useMemo(() => {
    if (!(amt > 0)) return [];
    const out: { uid: string; name: string; from: number; to: number }[] = [];
    for (const i of items) {
      if (i.price == null || !sel.has(i.category_id)) continue;
      const sign = op.endsWith("+") ? 1 : -1;
      let v = op.startsWith("pct") ? i.price * (1 + (sign * amt) / 100) : i.price + sign * amt;
      if (round) v = Math.round(v / round) * round;
      v = Math.max(0, Math.round(v));
      if (v !== i.price) out.push({ uid: i.uid, name: i.name_tr, from: i.price, to: v });
    }
    return out;
  }, [items, sel, op, amt, round]);

  async function apply() {
    const list = changes;
    if (!list.length) return;
    setProg({ done: 0, total: list.length });
    const ok: typeof list = [];
    let idx = 0, done = 0;
    const worker = async () => {
      while (idx < list.length) {
        const c = list[idx++];
        if (await updateItem(c.uid, { price: c.to })) ok.push(c);
        setProg({ done: ++done, total: list.length });
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    setProg(null);
    if (!ok.length) return;
    onClose();
    toast(`${ok.length} ürünün fiyatı güncellendi`, {
      duration: 12000,
      action: { label: "Geri al", onClick: async () => { await Promise.all(ok.map((c) => updateItem(c.uid, { price: c.from }))); toast("Eski fiyatlara dönüldü"); } },
    });
  }

  const chip = "min-h-11 rounded-full border px-4 text-[13.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60";
  const on = "border-ink bg-ink text-paper", offc = "border-ink/15 hover:bg-ink/[0.05]";
  const lbl = "mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-mut";

  return (
    <Sheet open={open} onClose={onClose} title="Toplu fiyat" desc="Seçtiğiniz kategorilerdeki fiyatları tek seferde değiştirin." wide
      footer={<>
        {prog && <span className="mr-auto text-[13px] text-mut tabular" role="status">{prog.done} / {prog.total}</span>}
        <Button onClick={onClose} disabled={!!prog}>Vazgeç</Button>
        <Button variant="primary" disabled={!changes.length || !!prog} onClick={() => void apply()}>{prog ? "Uygulanıyor…" : `Uygula${changes.length ? ` (${changes.length})` : ""}`}</Button>
      </>}>
      <div className="space-y-5">
        <div>
          <span className={lbl}>Kapsam</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={sel.size === allIds.length && allIds.length > 0} onClick={() => setSel(sel.size === allIds.length ? new Set() : new Set(allIds))} className={cx(chip, sel.size === allIds.length && allIds.length > 0 ? on : offc)}>Tüm menü</button>
            {BOARDS_META.map((b) => {
              const ids = categories.filter((c) => c.board === b.id).map((c) => c.id);
              if (!ids.length) return null;
              const all = ids.every((i) => sel.has(i));
              return <button key={b.id} type="button" aria-pressed={all} onClick={() => toggleBoard(b.id)} className={cx(chip, all ? on : offc)}>{b.name}</button>;
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categories.map((c) => <button key={c.id} type="button" aria-pressed={sel.has(c.id)} onClick={() => toggleCat(c.id)} className={cx("min-h-11 rounded-full border px-3 text-[12.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", sel.has(c.id) ? on : offc)}>{c.name_tr}</button>)}
          </div>
        </div>

        <div>
          <span className={lbl}>İşlem</span>
          <div className="flex flex-wrap items-center gap-2">
            {OPS.map((o) => <button key={o.id} type="button" aria-pressed={op === o.id} onClick={() => setOp(o.id)} className={cx(chip, op === o.id ? on : offc)}>{o.label}</button>)}
            <Input type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Miktar" className="w-24 tabular" />
          </div>
        </div>

        <div>
          <span className={lbl}>Yuvarlama</span>
          <div className="flex gap-2">
            {([[0, "Yok"], [5, "5'e"], [10, "10'a"]] as const).map(([v, t]) => <button key={v} type="button" aria-pressed={round === v} onClick={() => setRound(v)} className={cx(chip, round === v ? on : offc)}>{t}</button>)}
          </div>
        </div>

        <div aria-live="polite">
          <span className={lbl}>Önizleme · {changes.length} ürün değişecek</span>
          {sel.size === 0 ? <p className="text-[13.5px] text-mut">Önce kapsam seçin.</p> : !(amt > 0) ? <p className="text-[13.5px] text-mut">Geçerli bir miktar girin.</p> : changes.length === 0 ? <p className="text-[13.5px] text-mut">Seçime uyan değişecek fiyat yok.</p> : (
            <ul className="max-h-[300px] overflow-y-auto rounded-[10px] border border-ink/10">
              {changes.map((c) => (
                <li key={c.uid} className="flex items-center justify-between gap-3 border-t border-ink/10 px-3 py-2 text-[13.5px] first:border-t-0">
                  <span className="truncate">{c.name}</span>
                  <span className="tabular shrink-0"><span className="text-mut">₺{c.from}</span> → <b className={c.to > c.from ? "text-[#a2742c]" : "text-[#4f6b3a]"}>₺{c.to}</b></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  );
}
