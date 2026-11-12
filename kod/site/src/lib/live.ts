import { useSyncExternalStore } from "react";
import { supabase, type Announcement, type DbCategory, type DbItem, type Info } from "./supabase";
import { INFO, SHOWCASE_IDS, applyLive, type RawCat } from "./menu";

// Duyuru: küçük ayrı store
export type Notice = { active: boolean; tr: string; en: string; until: string | null };
let notice: Notice | null = null;
const noticeListeners = new Set<() => void>();
const subNotice = (cb: () => void) => { noticeListeners.add(cb); return () => { noticeListeners.delete(cb); }; };
const getNotice = () => {
  if (notice?.until) { const t = Date.parse(notice.until); if (!Number.isNaN(t) && t < Date.now()) return null; }
  return notice;
};
function setNotice(a: Announcement | null) {
  notice = a && a.active && (a.tr || a.en) ? { active: true, tr: a.tr ?? "", en: a.en ?? "", until: a.until ?? null } : null;
  noticeListeners.forEach((l) => l());
}
export function useAnnouncement(): Notice | null {
  return useSyncExternalStore(subNotice, getNotice, () => null);
}

async function fetchAll() {
  if (!supabase) return;
  const [c, i, s] = await Promise.all([
    supabase.from("categories").select("*").order("sort", { ascending: true }),
    supabase.from("items").select("*").order("sort", { ascending: true }),
    supabase.from("settings").select("*"),
  ]);
  if (c.error || i.error || s.error || !c.data || !i.data) return;
  const dbCats = c.data as DbCategory[];
  const dbItems = i.data as DbItem[];
  const cats: RawCat[] = dbCats.map((cat) => ({
    id: cat.id,
    board: cat.board,
    name: { tr: cat.name_tr, en: cat.name_en },
    items: dbItems.filter((x) => x.category_id === cat.id).map((x) => ({
      id: x.slug,
      name: { tr: x.name_tr, en: x.name_en },
      desc: { tr: x.desc_tr ?? "", en: x.desc_en ?? "" },
      price: x.price,
      image: x.image,
      tags: x.tags ?? [],
      options: x.options?.length ? x.options : undefined,
      optionsOptional: x.options_optional || undefined,
      available: x.available,
      hidden: x.hidden,
    })),
  }));
  const settings = new Map((s.data as { key: string; value: unknown }[]).map((r) => [r.key, r.value]));
  const show = settings.get("showcase");
  const showIds = Array.isArray(show) ? (show as unknown[]).map(String) : Array.isArray((show as { ids?: unknown })?.ids) ? ((show as { ids: unknown[] }).ids).map(String) : SHOWCASE_IDS;
  const info = { ...INFO, ...((settings.get("info") as Partial<Info>) ?? {}) };
  setNotice((settings.get("announcement") as Announcement) ?? null);
  applyLive(cats, showIds, info);
}

let started = false;
export function startLive() {
  if (!supabase || started) return;
  started = true;
  const run = () => { fetchAll().catch(() => {}); };
  run();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const later = () => { if (timer) clearTimeout(timer); timer = setTimeout(run, 400); };
  supabase.channel("menu-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "items" }, later)
    .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, later)
    .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, later)
    .subscribe();
}
