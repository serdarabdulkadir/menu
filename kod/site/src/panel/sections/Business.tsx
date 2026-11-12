"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "../data";
import type { Info } from "@/lib/supabase";
import { BAD, Button, Card, Field, Input, OK, PageHead, Skeleton, cx } from "../ui";

const EMPTY: Info = { open: "09:30", close: "00:00", address: "", maps: "", phone: "", phoneLabel: "", whatsapp: "", instagram: "", handle: "", wifiName: "", wifiPass: "" };

const digits = (s: string) => s.replace(/\D/g, "");
function e164(label: string) {
  let d = digits(label);
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "90" + d.slice(1);
  else if (d.length === 10) d = "90" + d;
  return d;
}
const mapsFor = (a: string) => (a.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.trim())}` : "");
const cleanHandle = (h: string) => h.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "");
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

function isOpenNow(open: string, close: string, now: Date) {
  if (!open || !close) return null;
  const o = toMin(open), c = toMin(close);
  const n = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now).split(":").map(Number);
  const cur = n[0] * 60 + n[1];
  if (o === c) return true;
  return o < c ? cur >= o && cur < c : cur >= o || cur < c;
}

export default function Business() {
  const { getSetting, saveSetting } = usePanel();
  const [form, setForm] = useState<Info | null>(null);
  const [base, setBase] = useState<Info>(EMPTY);
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    getSetting<Info>("info").then((v) => { if (!alive) return; const f = { ...EMPTY, ...(v ?? {}) }; setForm(f); setBase(f); }).catch(() => { if (alive) { setForm(EMPTY); } });
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => { alive = false; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = form !== null && JSON.stringify(form) !== JSON.stringify(base);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (!form) return <div className="mx-auto max-w-[880px] space-y-3"><PageHead title="İşletme bilgileri" /><Skeleton className="h-32" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;

  const set = (k: keyof Info, v: string) => setForm({ ...form, [k]: v });
  const autoMaps = mapsFor(form.address);
  const wa = e164(form.phoneLabel);
  const waUrl = wa ? `https://wa.me/${wa}` : "";
  const open = isOpenNow(form.open, form.close, now);
  const overnight = !!form.open && !!form.close && toMin(form.close) < toMin(form.open);
  const handle = cleanHandle(form.handle);

  async function save() {
    if (!form) return;
    setBusy(true);
    const next: Info = {
      ...form,
      maps: form.maps.trim() || autoMaps,
      phone: wa ? `+${wa}` : "",
      whatsapp: form.whatsapp.trim() || waUrl,
      handle,
      instagram: handle ? `https://www.instagram.com/${handle}/` : "",
    };
    const ok = await saveSetting("info", next);
    setBusy(false);
    if (ok) { setForm(next); setBase(next); toast.success("İşletme bilgileri kaydedildi"); } else toast.error("Kaydedilemedi");
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <PageHead title="İşletme bilgileri" sub="Menünün alt bölümünde ve bilgi sayfasında görünür"
        actions={<Button variant="primary" onClick={save} disabled={!dirty || busy}>{busy ? "Kaydediliyor" : dirty ? "Kaydet" : "Kaydedildi"}</Button>} />
      <div className="grid gap-4 md:grid-cols-[1fr_280px] md:items-start">
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-3 font-serif text-[18px] text-ink">Çalışma saatleri</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Açılış"><Input type="time" value={form.open} onChange={(e) => set("open", e.target.value)} /></Field>
              <Field label="Kapanış"><Input type="time" value={form.close} onChange={(e) => set("close", e.target.value)} /></Field>
            </div>
            <p className="mt-2 text-[12.5px] text-mut">Gece yarısını geçen kapanış için 00:00 ya da 02:00 gibi yazın; ertesi güne sarkar{overnight ? " (şu an: ertesi gün kapanıyor)" : ""}.</p>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-serif text-[18px] text-ink">Adres</h2>
            <Field label="Adres"><Textarea2 value={form.address} onChange={(v) => set("address", v)} /></Field>
            <Field label="Harita bağlantısı" hint={form.maps.trim() ? undefined : "Boş bırakırsanız adresten otomatik oluşturulur."}>
              <Input inputMode="url" value={form.maps} placeholder={autoMaps || "https://maps.google.com/..."} onChange={(e) => set("maps", e.target.value)} />
            </Field>
            {(form.maps.trim() || autoMaps) && (
              <a href={form.maps.trim() || autoMaps} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[14px] text-ink underline underline-offset-4">Haritada dene ↗</a>
            )}
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-serif text-[18px] text-ink">İletişim</h2>
            <Field label="Telefon"><Input type="tel" inputMode="tel" value={form.phoneLabel} placeholder="0531 577 97 00" onChange={(e) => set("phoneLabel", e.target.value)} /></Field>
            <Field label="WhatsApp bağlantısı" hint={waUrl && form.whatsapp.trim() !== waUrl ? undefined : "Telefondan otomatik kurulur."}>
              <Input inputMode="url" value={form.whatsapp} placeholder={waUrl || "https://wa.me/90..."} onChange={(e) => set("whatsapp", e.target.value)} />
            </Field>
            {waUrl && form.whatsapp.trim() !== waUrl && <Button size="sm" onClick={() => set("whatsapp", waUrl)}>Telefondan öner: {waUrl}</Button>}
            <Field label="Instagram kullanıcı adı" hint={handle ? `Bağlantı: instagram.com/${handle}` : "Örnek: permessotr"}>
              <Input value={form.handle} autoCapitalize="none" placeholder="permessotr" onChange={(e) => set("handle", e.target.value)} />
            </Field>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-serif text-[18px] text-ink">Wi-Fi</h2>
            <Field label="Ağ adı"><Input value={form.wifiName} autoCapitalize="none" onChange={(e) => set("wifiName", e.target.value)} /></Field>
            <Field label="Şifre">
              <div className="flex gap-2">
                <Input type={showPass ? "text" : "password"} value={form.wifiPass} autoComplete="off" onChange={(e) => set("wifiPass", e.target.value)} />
                <Button onClick={() => setShowPass(!showPass)} aria-pressed={showPass}>{showPass ? "Gizle" : "Göster"}</Button>
              </div>
            </Field>
          </Card>
        </div>

        <aside className="md:sticky md:top-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">Menüde böyle görünür</p>
          <Card className="space-y-2.5 p-4 text-[14px]">
            <p className="flex items-center gap-2 font-serif text-[18px] text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: open == null ? "#6f6459" : open ? OK : BAD }} />
              {open == null ? "Saat girilmedi" : open ? "Şu an açık" : "Şu an kapalı"}
            </p>
            <p className="text-mut">{form.open || "--:--"} - {form.close || "--:--"}</p>
            {form.address && <p className="text-ink">{form.address}</p>}
            {form.phoneLabel && <p className="text-ink">{form.phoneLabel}</p>}
            {handle && <p className="text-ink">@{handle}</p>}
            {form.wifiName && <p className={cx("border-t border-ink/10 pt-2 text-ink")}>Wi-Fi: {form.wifiName}<br /><span className="text-mut">{showPass ? form.wifiPass : form.wifiPass ? "••••••••" : ""}</span></p>}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Textarea2({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="min-h-16 w-full rounded-[10px] border border-ink/15 bg-paper px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink/50 focus:ring-2 focus:ring-oak/25" />;
}
