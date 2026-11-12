"use client";
// Panel ikonları: tek çizgi kalınlığı, currentColor.
const P: Record<string, string> = {
  menu: "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3",
  star: "M12 4l2.4 5 5.6.7-4.1 3.8 1.1 5.5L12 16.3 7 19l1.1-5.5L4 9.7 9.6 9z",
  info: "M12 11v6M12 7.5v.01M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20h4",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18v2",
  clock: "M12 7v5l3 2M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4",
  more: "M6 12h.01M12 12h.01M18 12h.01",
  camera: "M4 8h3l1.5-2h7L17 8h3v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  up: "M12 19V6M6 11l6-6 6 6",
  down: "M12 5v13M6 13l6 6 6-6",
  pencil: "M5 19l1-4L16.5 4.5a1.8 1.8 0 0 1 2.5 2.5L8.5 17.5zM14.5 6.5l3 3",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM16 16l4 4",
  out: "M10 5H5v14h5M14 8l4 4-4 4M18 12H9",
  ext: "M9 6H6v12h12v-3M13 5h6v6M19 5l-8 8",
  copy: "M8 8h10v12H8zM6 16V4h10",
  eye: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  eyeoff: "M4 4l16 16M9.5 6.3A9 9 0 0 1 12 6c5.5 0 9 6 9 6a15 15 0 0 1-3 3.6M6.4 8.2A15 15 0 0 0 3 12s3.5 6 9 6c1.2 0 2.3-.3 3.3-.7",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  tag: "M4 4h8l8 8-8 8-8-8zM8.5 8.5h.01",
};
export function Icon({ name, size = 20, className }: { name: keyof typeof P | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={P[name] ?? ""} />
    </svg>
  );
}
