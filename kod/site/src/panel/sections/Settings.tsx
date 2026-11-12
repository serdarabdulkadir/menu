"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { usePanel } from "../data";
import { BAD, Button, Card, Field, Input, OK, PageHead, WARN } from "../ui";

const HELP = [
  "Ürün fiyatını ya da 'Bugün yok' durumunu Menü bölümünden değiştirin; menüde anında güncellenir.",
  "Vitrin, menünün üstündeki öne çıkan ürünlerdir; en çok 10 ürün seçilir.",
  "Duyuru kısa bir şerit olarak görünür; bitiş zamanı seçerseniz kendiliğinden kalkar.",
  "Masa QR kodlarını QR kodlar bölümünden yazdırın; kodlar masa numarasını taşır.",
  "Yanlış bir değişiklik olursa Geçmiş bölümünden 'Geri al' ile eski haline dönün.",
];

type Ping = "checking" | "ok" | "fail";

export default function Settings() {
  const { isPreview, email, signOut } = usePanel();
  const [ping, setPing] = useState<Ping>("checking");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPreview || !supabase) return;
    let alive = true;
    supabase.from("settings").select("key").limit(1).then(({ error }) => { if (alive) setPing(error ? "fail" : "ok"); });
    return () => { alive = false; };
  }, [isPreview]);

  const connected = !isPreview && !!supabase;
  const status = !connected ? { t: "Bağlı değil (önizleme)", c: WARN } : ping === "checking" ? { t: "Kontrol ediliyor", c: WARN } : ping === "ok" ? { t: "Supabase bağlı, gerçek zamanlı açık", c: OK } : { t: "Bağlantı kurulamadı", c: BAD };

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (pw.length < 8) return toast.error("Şifre en az 8 karakter olmalı");
    if (pw !== pw2) return toast.error("Şifreler aynı değil");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error("Şifre değiştirilemedi"); else { toast.success("Şifre güncellendi"); setPw(""); setPw2(""); }
  }

  return (
    <div className="mx-auto w-full max-w-[880px] space-y-4">
      <PageHead title="Ayarlar" />

      <Card className="space-y-3 p-4">
        <h2 className="font-serif text-[18px] text-ink">Hesap</h2>
        {!connected ? (
          <p className="text-[14px] text-mut">Önizleme modu · Kurulum için Menü üstündeki şeritten &apos;Kurulum&apos;a dokun</p>
        ) : (
          <>
            <p className="text-[14px] text-ink">{email ?? "-"}</p>
            <form onSubmit={changePw} className="space-y-3">
              <Field label="Yeni şifre" hint="En az 8 karakter"><Input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
              <Field label="Yeni şifre (tekrar)"><Input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
              <Button type="submit" variant="primary" disabled={busy || !pw}>{busy ? "Kaydediliyor" : "Şifreyi değiştir"}</Button>
            </form>
            <div className="border-t border-ink/10 pt-3"><Button onClick={() => void signOut()}>Çıkış yap</Button></div>
          </>
        )}
      </Card>

      <Card className="space-y-2 p-4">
        <h2 className="font-serif text-[18px] text-ink">Bağlantı</h2>
        <p className="flex items-center gap-2 text-[14px] text-ink"><span className="h-2 w-2 rounded-full" style={{ background: status.c }} />{status.t}</p>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[14px] text-ink underline underline-offset-4">Menüyü aç ↗</a>
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 font-serif text-[18px] text-ink">Nasıl kullanılır</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[14px] text-mut">{HELP.map((h) => <li key={h}>{h}</li>)}</ul>
      </Card>
    </div>
  );
}
