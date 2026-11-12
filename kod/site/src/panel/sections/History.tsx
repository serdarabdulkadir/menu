"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, type AuditRow } from "@/lib/supabase";
import { usePanel } from "../data";
import { Button, Card, Empty, PageHead, Skeleton, cx } from "../ui";

type Kind = "price" | "avail" | "item" | "settings";
type Filter = "all" | Kind;
const FILTERS: [Filter, string][] = [["all", "Tümü"], ["price", "Fiyat"], ["avail", "Bugün yok"], ["item", "Ürün"], ["settings", "Ayarlar"]];
const SETTING_NAMES: Record<string, string> = { info: "İşletme bilgileri", announcement: "Duyuru", showcase: "Vitrin" };

const tl = (v: unknown) => (v == null ? "-" : `${v} ₺`);
const rec = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

function describe(r: AuditRow): { kind: Kind; text: string } {
  const b = rec(r.before), a = rec(r.after);
  const name = String(a.name_tr ?? b.name_tr ?? r.entity_id ?? "");
  if (r.entity === "settings") {
    const n = SETTING_NAMES[String(r.entity_id)] ?? String(r.entity_id);
    return { kind: "settings", text: `${n} güncellendi` };
  }
  if (r.entity === "categories") {
    const t = r.action === "INSERT" ? "eklendi" : r.action === "DELETE" ? "silindi" : "güncellendi";
    return { kind: "item", text: `Kategori ${t}: ${name}` };
  }
  if (r.action === "INSERT") return { kind: "item", text: `Yeni ürün: ${name}` };
  if (r.action === "DELETE") return { kind: "item", text: `Ürün silindi: ${name}` };
  if (b.price !== a.price) return { kind: "price", text: `${name} fiyatı ${tl(b.price)} → ${tl(a.price)}` };
  if (b.available !== a.available) return { kind: "avail", text: a.available === false ? `${name} 'Bugün yok' yapıldı` : `${name} yeniden satışta` };
  if (b.hidden !== a.hidden) return { kind: "item", text: a.hidden ? `${name} menüden gizlendi` : `${name} menüde yeniden görünür` };
  const changed = Object.keys(a).filter((k) => k !== "updated_at" && JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  return { kind: "item", text: `${name} düzenlendi${changed.length ? ` (${changed.join(", ")})` : ""}` };
}

const shortMail = (m: string | null) => (m ? m.split("@")[0] : "bilinmiyor");
const dayKey = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
const hhmm = (d: Date) => d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

export default function History() {
  const { isPreview, updateItem, saveSetting } = usePanel();
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [undone, setUndone] = useState<Set<number>>(new Set());
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (isPreview || !supabase) return;
    let alive = true;
    supabase.from("audit_log").select("*").order("at", { ascending: false }).limit(200).then(({ data, error }) => {
      if (!alive) return;
      if (error) setErr(true); else setRows((data ?? []) as AuditRow[]);
    });
    return () => { alive = false; };
  }, [isPreview]);

  async function revert(r: AuditRow) {
    const b = rec(r.before);
    if (!r.entity_id || !r.before) return;
    setBusyId(r.id);
    let ok = false;
    try {
      if (r.entity === "items") {
        const { uid: _u, updated_at: _t, ...patch } = b; void _u; void _t;
        await updateItem(r.entity_id, patch);
        ok = true;
      } else if (r.entity === "settings") {
        ok = await saveSetting(r.entity_id, b.value);
      }
    } catch { ok = false; }
    setBusyId(null);
    if (ok) { setUndone((s) => new Set(s).add(r.id)); toast.success("Değişiklik geri alındı"); } else toast.error("Geri alınamadı");
  }

  const head = <PageHead title="Geçmiş" sub="Son 200 değişiklik, kimin ne zaman yaptığıyla" />;

  if (isPreview || !supabase) return <div className="mx-auto max-w-[880px]">{head}<Empty title="Geçmiş yok">Önizleme modunda geçmiş tutulmaz — Supabase bağlanınca her değişiklik burada görünür.</Empty></div>;
  if (err) return <div className="mx-auto max-w-[880px]">{head}<Empty title="Geçmiş yüklenemedi">Yalnız yönetici hesabı geçmişi görebilir. Sayfayı yenileyip tekrar deneyin.</Empty></div>;
  if (!rows) return <div className="mx-auto max-w-[880px] space-y-2">{head}<Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>;

  const list = rows.map((r) => ({ r, d: describe(r) })).filter((x) => filter === "all" || x.d.kind === filter);
  const groups: { day: string; rows: typeof list }[] = [];
  for (const x of list) {
    const day = dayKey(new Date(x.r.at));
    const g = groups[groups.length - 1];
    if (g && g.day === day) g.rows.push(x); else groups.push({ day, rows: [x] });
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      {head}
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Filtre">
        {FILTERS.map(([k, l]) => (
          <button key={k} type="button" role="radio" aria-checked={filter === k} onClick={() => setFilter(k)}
            className={cx("min-h-11 rounded-full border px-4 text-[13px]", filter === k ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink hover:bg-ink/[0.05]")}>{l}</button>
        ))}
      </div>
      {groups.length === 0 ? <Empty title="Kayıt yok">Bu filtreyle eşleşen değişiklik bulunmuyor.</Empty> : groups.map((g) => (
        <section key={g.day} className="mb-6">
          <h2 className="mb-2 font-serif text-[18px] text-ink">{g.day}</h2>
          <Card>
            <ul className="divide-y divide-ink/10">
              {g.rows.map(({ r, d }) => {
                const can = r.action === "UPDATE" && !!r.before && (r.entity === "items" || r.entity === "settings") && !undone.has(r.id);
                return (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-11 shrink-0 text-[12.5px] tabular-nums text-mut">{hhmm(new Date(r.at))}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] text-ink">{d.text}</p>
                      <p className="text-[12px] text-mut">{shortMail(r.actor)}{undone.has(r.id) ? " · geri alındı" : ""}</p>
                    </div>
                    {can && <Button size="sm" className="!h-11" disabled={busyId === r.id} onClick={() => void revert(r)}>Geri al</Button>}
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ))}
    </div>
  );
}
