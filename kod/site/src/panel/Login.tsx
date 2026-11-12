"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Field, Input } from "./ui";
import { usePanel } from "./data";

function trError(m: string): string {
  const s = m.toLowerCase();
  if (s.includes("invalid login")) return "E-posta ya da şifre hatalı.";
  if (s.includes("not confirmed")) return "E-posta adresi henüz doğrulanmamış.";
  if (s.includes("rate") || s.includes("too many")) return "Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin.";
  if (s.includes("network") || s.includes("fetch")) return "Bağlantı kurulamadı. İnternetinizi kontrol edin.";
  if (s.includes("password") && s.includes("6")) return "Şifre en az 6 karakter olmalı.";
  if (s.includes("same")) return "Yeni şifre eskisinden farklı olmalı.";
  return "Bir sorun oluştu. Lütfen tekrar deneyin.";
}

function Frame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center p-5">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.png" alt="" className="h-11 w-11 rounded-full object-cover" />
          <span className="font-serif text-[26px]">Permesso</span>
        </div>
        <h1 className="font-serif text-[34px] leading-none">{title}</h1>
        <p className="mt-2 text-[14.5px] text-mut">{sub}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setErr(""); setInfo("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) setErr(trError(error.message));
    setBusy(false);
  }
  async function forgot() {
    if (!supabase) return;
    if (!email.trim()) { setErr("Önce e-posta adresinizi yazın."); return; }
    setBusy(true); setErr(""); setInfo("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/panel/` });
    if (error) setErr(trError(error.message)); else setInfo("Şifre yenileme bağlantısı e-postanıza gönderildi. Gelen kutunuzu (ve istenmeyenleri) kontrol edin.");
    setBusy(false);
  }

  return (
    <Frame title="Yönetim paneli" sub="Menüyü yönetmek için giriş yapın.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="E-posta"><Input type="email" autoComplete="username" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-[16px]" /></Field>
        <Field label="Şifre"><Input type="password" autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} className="h-12 text-[16px]" /></Field>
        {err && <p role="alert" className="rounded-[10px] bg-[#9c3d26]/10 px-3 py-2.5 text-[14px] text-[#9c3d26]">{err}</p>}
        {info && <p role="status" className="rounded-[10px] bg-[#4f6b3a]/10 px-3 py-2.5 text-[14px] text-[#4f6b3a]">{info}</p>}
        <Button type="submit" variant="primary" disabled={busy} className="h-12 w-full text-[15px]">{busy ? "Bekleyin…" : "Giriş yap"}</Button>
        <button type="button" onClick={forgot} disabled={busy} className="min-h-11 w-full text-[14px] text-mut underline underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">Şifremi unuttum</button>
      </form>
    </Frame>
  );
}

// Şifre yenileme bağlantısından gelince yeni şifre belirleme
export function NewPassword() {
  const { endRecovery } = usePanel();
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (pass.length < 6) { setErr("Şifre en az 6 karakter olmalı."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) setErr(trError(error.message)); else endRecovery();
  }
  return (
    <Frame title="Yeni şifre" sub="Hesabınız için yeni bir şifre belirleyin.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Yeni şifre" hint="En az 6 karakter"><Input type="password" autoComplete="new-password" required value={pass} onChange={(e) => setPass(e.target.value)} className="h-12 text-[16px]" /></Field>
        {err && <p role="alert" className="rounded-[10px] bg-[#9c3d26]/10 px-3 py-2.5 text-[14px] text-[#9c3d26]">{err}</p>}
        <Button type="submit" variant="primary" disabled={busy} className="h-12 w-full text-[15px]">{busy ? "Bekleyin…" : "Şifreyi kaydet"}</Button>
      </form>
    </Frame>
  );
}
