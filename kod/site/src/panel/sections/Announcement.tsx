"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "../data";
import type { Announcement as Ann } from "@/lib/supabase";
import { Button, Card, Field, Input, PageHead, Skeleton, Switch, Textarea, cx } from "../ui";

const MAX = 140;
const TEMPLATES = ["Bugün tatlılarda %10 indirim", "Mutfak 23:00'te kapanır", "Canlı müzik 21:00", "Wi-Fi şifresi değişti"];
type Preset = "none" | "midnight" | "1h" | "3h" | "custom";

function pad(n: number) { return String(n).padStart(2, "0"); }
function toLocalInput(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function untilFor(p: Preset, custom: string): string | null {
  const d = new Date();
  if (p === "none") return null;
  if (p === "midnight") { d.setHours(24, 0, 0, 0); return d.toISOString(); }
  if (p === "1h") { d.setHours(d.getHours() + 1); return d.toISOString(); }
  if (p === "3h") { d.setHours(d.getHours() + 3); return d.toISOString(); }
  if (!custom) return null;
  const c = new Date(custom);
  return isNaN(c.getTime()) ? null : c.toISOString();
}

export default function Announcement() {
  const { getSetting, saveSetting } = usePanel();
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [tr, setTr] = useState("");
  const [en, setEn] = useState("");
  const [preset, setPreset] = useState<Preset>("none");
  const [custom, setCustom] = useState("");
  const [keepUntil, setKeepUntil] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getSetting<Ann>("announcement").then((v) => {
      if (!alive) return;
      if (v) {
        setActive(!!v.active); setTr(v.tr ?? ""); setEn(v.en ?? "");
        if (v.until) { setPreset("custom"); setCustom(toLocalInput(new Date(v.until))); setKeepUntil(v.until); }
      }
      setLoaded(true);
    }).catch(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trOk = tr.trim().length > 0;
  const shown = (en.trim() || tr.trim()) || "Duyuru metni burada görünür";

  async function save() {
    if (active && !trOk) return toast.error("Türkçe metin zorunlu");
    if (preset === "custom" && active && !custom) return toast.error("Bitiş tarihini seçin");
    setBusy(true);
    const until = preset === "custom" && custom === toLocalInput(new Date(keepUntil ?? 0)) ? keepUntil : untilFor(preset, custom);
    const ok = await saveSetting("announcement", { active, tr: tr.trim(), en: en.trim(), until });
    setBusy(false);
    if (ok) { setKeepUntil(until); toast.success(active ? "Duyuru yayında" : "Duyuru kaydedildi (kapalı)"); } else toast.error("Kaydedilemedi");
  }

  if (!loaded) return <div className="mx-auto max-w-[880px] space-y-3"><PageHead title="Duyuru" /><Skeleton className="h-24" /><Skeleton className="h-40" /></div>;

  const presets: [Preset, string][] = [["none", "Bitiş yok"], ["midnight", "Bugün gece yarısı"], ["1h", "1 saat"], ["3h", "3 saat"], ["custom", "Tarih seç"]];

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <PageHead title="Duyuru" sub="Menünün üstünde kısa bir şerit olarak görünür" actions={<Button variant="primary" onClick={save} disabled={busy}>{busy ? "Kaydediliyor" : "Kaydet"}</Button>} />
      <div className="space-y-4">
        <Card className="px-4 py-2"><Switch on={active} onChange={setActive} label={active ? "Duyuru açık" : "Duyuru kapalı"} /></Card>

        <Card className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Hazır şablonlar</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t} type="button" onClick={() => { setTr(t); setActive(true); }} className="min-h-11 rounded-full border border-ink/15 px-3.5 text-[13px] text-ink hover:bg-ink/[0.05]">{t}</button>
              ))}
            </div>
          </div>
          <Field label="Türkçe metin (zorunlu)">
            <Textarea value={tr} maxLength={MAX} onChange={(e) => setTr(e.target.value)} aria-invalid={active && !trOk} />
            <span className={cx("mt-1 block text-right text-[12px]", tr.length >= MAX - 10 ? "text-[#9c3d26]" : "text-mut")}>{tr.length}/{MAX}</span>
          </Field>
          <Field label="İngilizce metin" hint="Boş bırakırsanız Türkçe metin gösterilir.">
            <Textarea value={en} maxLength={MAX} onChange={(e) => setEn(e.target.value)} className="min-h-20" />
          </Field>
        </Card>

        <Card className="p-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Ne zamana kadar</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bitiş">
            {presets.map(([k, l]) => (
              <button key={k} type="button" role="radio" aria-checked={preset === k} onClick={() => setPreset(k)}
                className={cx("min-h-11 rounded-full border px-3.5 text-[13px]", preset === k ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink hover:bg-ink/[0.05]")}>{l}</button>
            ))}
          </div>
          {preset === "custom" && <div className="mt-3 max-w-xs"><Input type="datetime-local" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="Bitiş tarihi ve saati" /></div>}
        </Card>

        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Menüde böyle görünür</p>
          <div className={cx("flex items-center gap-3 rounded-[10px] border border-oak/50 bg-paper px-3.5 py-3", !active && "opacity-50")}>
            <span className="shrink-0 rounded-sm border border-oak/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-oak">DUYURU</span>
            <p className="font-serif text-[15px] italic leading-snug text-ink">{shown}</p>
          </div>
          {!active && <p className="mt-1.5 text-[12.5px] text-mut">Duyuru kapalı olduğu için menüde görünmez.</p>}
        </div>
      </div>
    </div>
  );
}
