"use client";
// Kurulum kılavuzu: Supabase bağlanana kadar adım adım kontrol listesi. İlerleme bu tarayıcıda saklanır.
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, cx } from "./ui";
import { Icon } from "./icons";

const KEY = "permesso-setup-done";

function Code({ children }: { children: string }) {
  return (
    <div className="relative mt-2">
      <pre className="overflow-x-auto rounded-[10px] bg-ink/[0.06] p-3 pr-14 text-[12.5px] leading-relaxed text-ink"><code>{children}</code></pre>
      <button
        type="button" aria-label="Kopyala"
        onClick={async () => { try { await navigator.clipboard.writeText(children); toast("Kopyalandı"); } catch { toast.error("Kopyalanamadı, elle seçin."); } }}
        className="absolute right-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-[8px] text-mut hover:bg-ink/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60"
      ><Icon name="copy" size={18} /></button>
    </div>
  );
}

const STEPS: { title: string; body: React.ReactNode }[] = [
  { title: "Supabase projesi açın", body: <p>supabase.com adresinde ücretsiz hesapla yeni bir proje oluşturun (bölge: Frankfurt uygun). Proje hazır olunca Project Settings &gt; API sayfasını açık tutun.</p> },
  { title: "Şemayı ve başlangıç menüsünü yükleyin", body: <p>SQL Editor&apos;ı açın; önce <b>kod/supabase/schema.sql</b> dosyasının tamamını yapıştırıp çalıştırın, sonra aynısını <b>seed.sql</b> ile yapın. Menü, kategoriler ve fotoğraf deposu hazır olur.</p> },
  { title: "Yönetici kullanıcıyı oluşturun", body: <p>Authentication &gt; Users &gt; Add user ile e-posta ve şifre girin (Auto confirm işaretli olsun). Panele bu bilgilerle gireceksiniz.</p> },
  { title: "E-postanızı yönetici listesine ekleyin", body: (<><p>SQL Editor&apos;da çalıştırın (e-postayı kendinizinkiyle değiştirin):</p><Code>{"insert into admins(email) values ('sizin@epostaniz.com');"}</Code></>) },
  { title: "Kayıt olmayı kapatın", body: <p>Authentication &gt; Sign In / Providers &gt; Email bölümünde &quot;Allow new users to sign up&quot; seçeneğini kapatın. Böylece yalnız sizin oluşturduğunuz kullanıcı girebilir.</p> },
  { title: "Netlify'a anahtarları ekleyin", body: (<><p>Netlify &gt; Site configuration &gt; Environment variables bölümüne iki değişken ekleyin; değerler Supabase&apos;in API sayfasındaki Project URL ve publishable (anon) key:</p><Code>{"NEXT_PUBLIC_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"}</Code><p className="mt-2">Ardından siteyi yeniden yayınlayın (Deploys &gt; Trigger deploy). Panel giriş ekranıyla açılır.</p></>) },
];

export default function Setup() {
  const [done, setDone] = useState<boolean[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return STEPS.map((_, i) => !!v[i]); } catch { return STEPS.map(() => false); }
  });
  const toggle = (i: number) => setDone((d) => { const n = d.map((v, j) => (j === i ? !v : v)); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* yok say */ } return n; });
  const count = done.filter(Boolean).length;
  return (
    <div className="mx-auto w-full max-w-[640px] p-5">
      <h1 className="font-serif text-[32px] leading-none">Kurulum</h1>
      <p className="mt-2 text-[14.5px] text-mut">Panelin gerçek veriyle çalışması için 6 adım. {count}/{STEPS.length} tamamlandı.</p>
      <div className="mt-5 space-y-3">
        {STEPS.map((s, i) => (
          <Card key={i} className={cx("p-4", done[i] && "bg-ink/[0.03]")}>
            <div className="flex items-start gap-3">
              <button
                type="button" role="checkbox" aria-checked={done[i]} aria-label={`${i + 1}. adım tamamlandı`} onClick={() => toggle(i)}
                className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60", done[i] ? "border-[#4f6b3a] bg-[#4f6b3a] text-paper" : "border-ink/20 text-mut")}
              >{done[i] ? <Icon name="check" size={18} /> : <span className="text-[14px]">{i + 1}</span>}</button>
              <div className="min-w-0 flex-1 pt-2 text-[14px] text-mut">
                <h2 className={cx("font-serif text-[20px] leading-tight text-ink", done[i] && "line-through opacity-60")}>{s.title}</h2>
                <div className="mt-1.5">{s.body}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button className="mt-5" variant="ghost" onClick={() => { setDone(STEPS.map(() => false)); try { localStorage.removeItem(KEY); } catch { /* yok say */ } }}>Listeyi sıfırla</Button>
    </div>
  );
}
