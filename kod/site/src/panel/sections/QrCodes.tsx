"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button, Card, Field, Input, PageHead, Skeleton, Switch } from "../ui";

const KEY = "permesso.qr.base";
type Qr = { label: string; url: string; svg: string; png: string };

function withTable(base: string, n: number | null) {
  if (n == null) return base;
  try { const u = new URL(base); u.searchParams.set("masa", String(n)); return u.toString(); } catch { return `${base}${base.includes("?") ? "&" : "?"}masa=${n}`; }
}

export default function QrCodes() {
  const [base, setBase] = useState<string | null>(null);
  const [count, setCount] = useState(20);
  const [generic, setGeneric] = useState(true);
  const [codes, setCodes] = useState<Qr[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let b = window.location.origin + "/";
    try { b = localStorage.getItem(KEY) || b; } catch {}
    setBase(b); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (!base) return;
    let alive = true;
    const n = Math.min(Math.max(count || 1, 1), 100);
    const targets: { label: string; url: string }[] = [];
    if (generic) targets.push({ label: "Genel", url: withTable(base, null) });
    for (let i = 1; i <= n; i++) targets.push({ label: `Masa ${i}`, url: withTable(base, i) });
    const o = { margin: 1, errorCorrectionLevel: "M" as const, color: { dark: "#1e1a17", light: "#f6f4ef" } };
    Promise.all(targets.map(async (t) => ({ ...t, svg: await QRCode.toString(t.url, { ...o, type: "svg" }), png: await QRCode.toDataURL(t.url, { ...o, width: 640 }) })))
      .then((r) => { if (alive) { setCodes(r); setBusy(false); } })
      .catch(() => { if (alive) { setBusy(false); toast.error("QR üretilemedi"); } });
    return () => { alive = false; };
  }, [base, count, generic]);

  function changeBase(v: string) {
    setBusy(true); setBase(v);
    try { localStorage.setItem(KEY, v); } catch {}
  }
  function changeCount(v: number) { setBusy(true); setCount(v); }

  async function copy() {
    if (!base) return;
    try { await navigator.clipboard.writeText(base); toast.success("Adres kopyalandı"); } catch { toast.error("Kopyalanamadı"); }
  }

  // Tek kart PNG: kâğıt zemin, çerçeve, başlık, QR, etiket
  async function download(c: Qr) {
    const W = 800, H = 1000;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#f6f4ef"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#c99a62"; g.lineWidth = 6; g.strokeRect(30, 30, W - 60, H - 60);
    const img = new Image(); img.src = c.png;
    await img.decode();
    g.textAlign = "center"; g.fillStyle = "#1e1a17";
    g.font = "italic 64px 'Bodoni Moda', Georgia, serif"; g.fillText("permesso?", W / 2, 150);
    g.drawImage(img, 120, 210, 560, 560);
    g.font = "56px Georgia, serif"; g.fillText(c.label, W / 2, 855);
    g.fillStyle = "#6f6459"; g.font = "30px system-ui, sans-serif"; g.fillText("Menü için okutun", W / 2, 915);
    cv.toBlob((b) => {
      if (!b) return toast.error("İndirilemedi");
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `permesso-${c.label.toLowerCase().replace(/\s+/g, "-")}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <style>{`
        .qr-print { display: none; }
        @media print {
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden !important; }
          .qr-print, .qr-print * { visibility: visible !important; }
          .qr-print { display: grid !important; position: absolute; left: 0; top: 0; width: 100%; grid-template-columns: 1fr 1fr; gap: 6mm; }
          .qr-print .qr-card { break-inside: avoid; height: 85mm; border: 0.5mm solid #c99a62; background: #f6f4ef; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2mm; color: #1e1a17; }
          .qr-print .qr-card svg { width: 46mm; height: 46mm; }
        }
      `}</style>

      <PageHead title="QR kodlar" sub="Her masa için ayrı kod; okutan misafir menüyü masa numarasıyla açar"
        actions={<Button variant="primary" onClick={() => window.print()} disabled={!codes.length || busy}>Hepsini yazdır</Button>} />

      <Card className="mb-4 space-y-3 p-4">
        <Field label="Taban adres" hint="Menünün yayında olduğu adres. Bu cihazda hatırlanır.">
          <div className="flex gap-2">
            <Input inputMode="url" value={base ?? ""} onChange={(e) => changeBase(e.target.value)} />
            <Button onClick={copy}>Kopyala</Button>
          </div>
        </Field>
        <div className="grid grid-cols-2 items-end gap-3">
          <Field label="Masa sayısı (1 - N)"><Input type="number" min={1} max={100} value={count} onChange={(e) => changeCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} /></Field>
          <Switch on={generic} onChange={(v) => { setBusy(true); setGeneric(v); }} label="Masasız genel QR" />
        </div>
      </Card>

      {base === null || (busy && !codes.length) ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {codes.map((c) => (
            <li key={c.label} className="flex flex-col items-center rounded-[12px] border border-oak/60 bg-paper p-3 text-center">
              <p className="font-serif text-[15px] italic text-ink">permesso?</p>
              <div className="my-2 w-full max-w-[150px] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: c.svg }} role="img" aria-label={`${c.label} QR kodu`} />
              <p className="font-serif text-[18px] text-ink">{c.label}</p>
              <Button size="sm" className="mt-2 !h-11 w-full" onClick={() => void download(c)}>PNG indir</Button>
            </li>
          ))}
        </ul>
      )}

      <div className="qr-print" aria-hidden>
        {codes.map((c) => (
          <div key={c.label} className="qr-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="" style={{ height: "12mm" }} />
            <div style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontSize: "18pt" }}>permesso?</div>
            <div dangerouslySetInnerHTML={{ __html: c.svg }} />
            <div style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontSize: "16pt" }}>{c.label}</div>
            <div style={{ fontSize: "9pt", color: "#6f6459" }}>Menü için okutun</div>
          </div>
        ))}
      </div>
    </div>
  );
}
