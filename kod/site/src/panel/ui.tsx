"use client";
// Panel ortak parçaları. Menünün kimliğini taşır (kâğıt, mürekkep, meşe) ama bir iş aracıdır:
// sade, hızlı, büyük dokunma alanları. Bölümler yalnız bunları kullanır, kendi stil dilini kurmaz.
import { forwardRef } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// Renkler (globals.css değişkenleriyle aynı aile): paper, ink, mut, oak; durum renkleri:
export const OK = "#4f6b3a";
export const WARN = "#a2742c";
export const BAD = "#9c3d26";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "danger"; size?: "sm" | "md" };
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = "outline", size = "md", className, ...p }, ref) {
  return (
    <button
      ref={ref}
      {...p}
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 rounded-[10px] font-medium transition-[background,color,transform,opacity] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60",
        size === "sm" ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-[14px]",
        variant === "primary" && "bg-ink text-paper hover:bg-ink/90",
        variant === "outline" && "border border-ink/15 bg-paper text-ink hover:bg-ink/[0.04]",
        variant === "ghost" && "text-ink hover:bg-ink/[0.06]",
        variant === "danger" && "bg-[#9c3d26] text-paper hover:bg-[#9c3d26]/90",
        className,
      )}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} {...p} className={cx("h-11 w-full rounded-[10px] border border-ink/15 bg-paper px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/45 focus:border-ink/50 focus:ring-2 focus:ring-oak/25", className)} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} {...p} className={cx("min-h-24 w-full rounded-[10px] border border-ink/15 bg-paper px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink/45 focus:border-ink/50 focus:ring-2 focus:ring-oak/25", className)} />;
});

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-mut">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12.5px] text-mut">{hint}</span>}
    </label>
  );
}

// Anahtar: on = "Bugün yok" gibi durumları açar. Dokunma alanı 44px.
export function Switch({ on, onChange, label, tone = "ink", disabled }: { on: boolean; onChange: (v: boolean) => void; label?: string; tone?: "ink" | "bad"; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled}
      onClick={() => onChange(!on)}
      className="group inline-flex min-h-11 items-center gap-2 disabled:opacity-45"
    >
      <span className={cx("relative h-[22px] w-[38px] rounded-full transition-colors", on ? (tone === "bad" ? "bg-[#9c3d26]" : "bg-ink") : "bg-ink/15")}>
        <span className={cx("absolute top-[3px] h-4 w-4 rounded-full bg-paper shadow transition-transform", on ? "translate-x-[19px]" : "translate-x-[3px]")} />
      </span>
      {label && <span className={cx("text-[13px]", on ? "text-ink" : "text-mut")}>{label}</span>}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cx("rounded-[14px] border border-ink/10 bg-paper", className)}>{children}</section>;
}

// Bölüm başlığı: Bodoni başlık + kısa açıklama + sağda eylemler
export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 pb-5">
      <div>
        <h1 className="font-serif text-[30px] leading-none text-ink">{title}</h1>
        {sub && <p className="mt-2 text-[14px] text-mut">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-[14px] border border-dashed border-ink/15 px-6 py-12 text-center">
      <p className="font-serif text-[20px] italic text-ink">{title}</p>
      {children && <div className="mt-2 text-[14px] text-mut">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-[8px] bg-ink/[0.06]", className)} />;
}

// Kaydedildi / kaydediliyor göstergesi
export function SaveDot({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const c = state === "saving" ? WARN : state === "saved" ? OK : BAD;
  const t = state === "saving" ? "Kaydediliyor" : state === "saved" ? "Kaydedildi" : "Kaydedilemedi";
  return <span className="inline-flex items-center gap-1.5 text-[12px] text-mut"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{t}</span>;
}
