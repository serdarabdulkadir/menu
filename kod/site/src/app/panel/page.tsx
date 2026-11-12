"use client";
import { Toaster } from "sonner";
import { PanelProvider, usePanel } from "@/panel/data";
import Shell from "@/panel/Shell";
import Login, { NewPassword } from "@/panel/Login";
import { Skeleton, Button } from "@/panel/ui";

function Gate() {
  const { session, isAdmin, loading, isPreview, recovery, signOut, email } = usePanel();
  if (loading) {
    return (
      <div className="mx-auto max-w-[880px] space-y-3 p-6" aria-busy="true" aria-label="Yükleniyor">
        <Skeleton className="h-9 w-48" /><Skeleton className="h-12 w-full" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }
  if (!isPreview && recovery) return <NewPassword />;
  if (!isPreview && !session) return <Login />;
  if (!isAdmin) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <div className="w-full max-w-[420px] rounded-[14px] border border-ink/10 bg-paper p-6">
          <h1 className="font-serif text-[28px] leading-none">Yetkiniz yok</h1>
          <p className="mt-3 text-[14.5px] text-mut"><b className="text-ink">{email}</b> adresi yönetici listesinde değil. Menü sahibinden bu e-postayı yönetici olarak eklemesini isteyin ya da doğru hesapla giriş yapın.</p>
          <Button className="mt-5 w-full" variant="primary" onClick={() => void signOut()}>Çıkış yap</Button>
        </div>
      </main>
    );
  }
  return <Shell />;
}

export default function PanelPage() {
  return (
    <PanelProvider>
      <div className="min-h-dvh bg-wall">
        <Gate />
      </div>
      <Toaster position="bottom-center" offset={24} mobileOffset={{ bottom: 88 }} />
    </PanelProvider>
  );
}
