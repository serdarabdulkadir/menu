"use client";
import { motion, type HTMLMotionProps } from "motion/react";
import { img } from "@/lib/menu";

export function Frame({ b = 14, className = "", children, ...rest }: { b?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div {...rest} className={`frame ${className}`} style={{ ...(rest.style ?? {}), ["--b" as string]: `${b}px` }}>
      {children as React.ReactNode}
      <div className="fr-lip" />
      <div className="fr fr-t" />
      <div className="fr fr-l" />
      <div className="fr fr-b" />
      <div className="fr fr-r" />
    </motion.div>
  );
}

// Fotoğraf yoksa panonun gravür çizimi küçük kâğıt karede (uydurma ürün fotoğrafı yok)
export function Thumb({ file, ill, className = "" }: { file: string | null; ill?: string; className?: string }) {
  const src = img(file);
  return (
    <div
      aria-hidden
      className={`thumb shrink-0 rounded-[4px] ${className}`}
      style={src
        ? { backgroundImage: `url(${src})` }
        : ill
          ? { backgroundImage: `url(/img/ill/${ill}.webp)`, backgroundSize: "88% auto", backgroundPosition: "50% 55%", backgroundColor: "#ece6dc", opacity: 0.92 }
          : { backgroundColor: "transparent" }}
    />
  );
}

export function Logo({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/img/logo.png" alt="Permesso" className={className} />;
}

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const Icon = {
  search: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>),
  list: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M9 7h11M9 12h11M9 17h11" /><circle cx="4.5" cy="7" r=".8" fill="currentColor" /><circle cx="4.5" cy="12" r=".8" fill="currentColor" /><circle cx="4.5" cy="17" r=".8" fill="currentColor" /></svg>),
  back: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M15 5l-7 7 7 7" /></svg>),
  close: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M7 7l10 10M17 7L7 17" /></svg>),
  plus: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M12 5v14M5 12h14" /></svg>),
  minus: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M5 12h14" /></svg>),
  arrow: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M5 12h14M13 6l6 6-6 6" /></svg>),
  info: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><circle cx="12" cy="7.8" r=".6" fill="currentColor" /></svg>),
  phone: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M6.6 3.5h3l1.4 4-2 1.3a11 11 0 005.2 5.2l1.3-2 4 1.4v3a2 2 0 01-2.2 2A15.5 15.5 0 014.6 5.7a2 2 0 012-2.2z" /></svg>),
  chat: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P}><path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5h-2.5z" /></svg>),
  check: (c = "") => (<svg viewBox="0 0 24 24" className={c} {...P} strokeWidth={2}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>),
};
