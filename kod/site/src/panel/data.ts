"use client";
// Panel veri katmanı: tek kaynak. Bölümler yalnız usePanel() ile okur/yazar.
//
// usePanel(): {
//   session, email, isAdmin, loading, isPreview, recovery, endRecovery,
//   categories: DbCategory[] (board, sort sıralı), items: DbItem[] (sort sıralı; kategori içi sırada bySort kullanın),
//   updateItem(uid, patch, undoLabel?)   iyimser; undoLabel verilirse "Geri al" toast'ı gösterir; Promise<boolean>
//   createItem(input)                    slug otomatik (benzersiz), sona eklenir; Promise<DbItem|null>
//   deleteItem(uid)                      geri alınabilir
//   moveItem(uid, -1|1)                  kategori içinde yukarı/aşağı
//   updateCategory(id, patch) / createCategory({board,name_tr,name_en}) / deleteCategory(id) (ürün varsa engeller) / moveCategory(id, -1|1) (pano içinde)
//   getSetting<T>(key) / saveSetting(key, value)   'info' | 'announcement' | 'showcase'
//   signOut()
// }
// Önizleme modu: supabase yoksa veri menu.json'dan kurulur, değişiklikler bellekte + localStorage'ta tutulur.
// Yardımcılar: BOARDS_META, photoUrl, fold (TR duyarsız), slugify, bySort, uploadPhoto, useDesktop.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase, PHOTO_BUCKET, type DbCategory, type DbItem } from "@/lib/supabase";
import menuJson from "@/data/menu.json";

export const BOARDS_META: { id: string; name: string }[] = [
  { id: "coffee", name: "Kahve" },
  { id: "hot", name: "Sıcak İçecekler" },
  { id: "cold", name: "Soğuk İçecekler" },
  { id: "mocktails", name: "Mocktailler" },
  { id: "desserts", name: "Tatlılar" },
  { id: "croissants", name: "Kruvasanlar" },
  { id: "sandwiches", name: "Sandviç & Kahvaltı" },
  { id: "extras", name: "Ekstralar" },
];

export const photoUrl = (image: string | null): string | null => {
  if (!image) return null;
  if (/^(https?:|data:|blob:)/.test(image)) return image;
  return `/img/urun/${image.replace(/\.[^.]+$/, "")}.webp`;
};

const TR_MAP: Record<string, string> = { ı: "i", ğ: "g", ü: "u", ş: "s", ö: "o", ç: "c", İ: "i" };
export const fold = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/[ığüşöçİ]/g, (c) => TR_MAP[c] ?? c).normalize("NFD").replace(/[̀-ͯ]/g, "");
export const slugify = (s: string) => fold(s).replace(/&/g, " ve ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "urun";
export const bySort = (a: { sort: number; slug?: string; id?: string }, b: { sort: number; slug?: string; id?: string }) =>
  a.sort - b.sort || (a.slug ?? a.id ?? "").localeCompare(b.slug ?? b.id ?? "");

export type ItemPatch = Partial<Omit<DbItem, "uid" | "updated_at">>;
export type NewItem = Partial<Omit<DbItem, "uid" | "updated_at">> & { category_id: string; name_tr: string };
export type NewCategory = { board: string; name_tr: string; name_en: string };

type Ctx = {
  session: Session | null; email: string | null; isAdmin: boolean; loading: boolean; isPreview: boolean;
  recovery: boolean; endRecovery: () => void;
  categories: DbCategory[]; items: DbItem[];
  updateItem: (uid: string, patch: ItemPatch, undoLabel?: string) => Promise<boolean>;
  createItem: (input: NewItem) => Promise<DbItem | null>;
  deleteItem: (uid: string) => Promise<boolean>;
  moveItem: (uid: string, dir: -1 | 1) => Promise<boolean>;
  updateCategory: (id: string, patch: Partial<Omit<DbCategory, "id">>) => Promise<boolean>;
  createCategory: (input: NewCategory) => Promise<DbCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  moveCategory: (id: string, dir: -1 | 1) => Promise<boolean>;
  getSetting: <T>(key: string) => Promise<T | null>;
  saveSetting: (key: string, value: unknown) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const PanelCtx = createContext<Ctx | null>(null);
export function usePanel(): Ctx {
  const c = useContext(PanelCtx);
  if (!c) throw new Error("usePanel yalnız PanelProvider içinde kullanılır");
  return c;
}

// ---- Önizleme verisi ----
const PREVIEW_KEY = "permesso-panel-preview";
const BOARD_OF: Record<string, string[]> = {
  coffee: ["espresso", "brewed"],
  hot: ["turkish-coffee", "teas", "hot-drinks", "matcha"],
  cold: ["milkshake", "milk-based", "frozen", "garden-of-eden", "drinks"],
  mocktails: ["refresh", "redbull-mockail"],
  desserts: ["cheesecake", "desserts", "cup-of-dessert", "fruit-desserts", "cookies"],
  croissants: ["croissant", "salted-croissant"],
  sandwiches: ["sandwiches", "toasts", "plate", "bowl"],
  extras: ["extras"],
};
const PREVIEW_SETTINGS: Record<string, unknown> = {
  info: {
    open: "09:30", close: "00:00", address: "2 Nolu Beşirli Mah. Devlet Sahil Yolu Cad. No:471B, Ortahisar / Trabzon", maps: "",
    phone: "+905315779700", phoneLabel: "+90 531 577 97 00", whatsapp: "905315779700", instagram: "https://instagram.com/permessotr", handle: "permessotr", wifiName: "", wifiPass: "",
  },
  announcement: { active: false, tr: "", en: "", until: null },
  showcase: ["lotus-cheesecake", "coffee-latte", "lotus-croissant", "tiramisu", "mojito", "hot-chocolate", "strawberry-iced-tea", "brownie"],
};

type RawItem = { id: string; name: { tr: string; en: string }; desc: { tr: string; en: string }; price: number | null; image: string | null; tags?: string[]; options?: string[]; optionsOptional?: boolean };
function buildPreview(): { categories: DbCategory[]; items: DbItem[] } {
  const boardFor = (id: string) => Object.entries(BOARD_OF).find(([, ids]) => ids.includes(id))?.[0] ?? "extras";
  const categories: DbCategory[] = [];
  const items: DbItem[] = [];
  const now = new Date().toISOString();
  (menuJson as unknown as { categories: { id: string; name: { tr: string; en: string }; items: RawItem[] }[] }).categories.forEach((c, ci) => {
    categories.push({ id: c.id, board: boardFor(c.id), name_tr: c.name.tr, name_en: c.name.en, sort: ci });
    c.items.forEach((it, ii) =>
      items.push({
        uid: `${it.id}@${c.id}`, slug: it.id, category_id: c.id, name_tr: it.name.tr, name_en: it.name.en, desc_tr: it.desc?.tr ?? "", desc_en: it.desc?.en ?? "",
        price: it.price ?? null, image: it.image ?? null, options: it.options ?? [], options_optional: !!it.optionsOptional, tags: it.tags ?? [],
        available: true, hidden: false, sort: ii, updated_at: now,
      }),
    );
  });
  const order = (id: string) => BOARDS_META.findIndex((b) => b.id === id);
  categories.sort((a, b) => order(a.board) - order(b.board) || a.sort - b.sort);
  return { categories, items };
}

const sortCats = (l: DbCategory[]) => [...l].sort((a, b) => BOARDS_META.findIndex((x) => x.id === a.board) - BOARDS_META.findIndex((x) => x.id === b.board) || a.sort - b.sort);

// ---- Fotoğraf: canvas ile küçült + webp ----
async function toWebp(file: File, maxEdge: number, quality: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  cv.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  return await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("Görsel dönüştürülemedi"))), "image/webp", quality));
}
const blobToDataUrl = (b: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(b); });

// Yüklenen fotoğrafın adresini döner (Supabase: public URL; önizleme: yerel veri adresi). Hata fırlatır.
export async function uploadPhoto(file: File, slug: string): Promise<string> {
  if (!supabase) return await blobToDataUrl(await toWebp(file, 640, 0.7));
  const blob = await toWebp(file, 1200, 0.82);
  const path = `${slugify(slug)}-${Date.now()}.webp`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function useDesktop(): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia("(min-width: 1024px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

type Res = { error: { message: string } | null };
async function run(f: (sb: NonNullable<typeof supabase>) => PromiseLike<Res>): Promise<Res> {
  if (!supabase) return { error: null };
  try { return await f(supabase); } catch (e) { return { error: { message: String(e) } }; }
}

export function PanelProvider({ children }: { children: ReactNode }) {
  const isPreview = !supabase;
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(isPreview);
  const [isAdmin, setIsAdmin] = useState(isPreview);
  const [adminChecked, setAdminChecked] = useState(isPreview);
  const [recovery, setRecovery] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [categories, _setCats] = useState<DbCategory[]>([]);
  const [items, _setItems] = useState<DbItem[]>([]);
  const catsRef = useRef(categories);
  const itemsRef = useRef(items);
  const settingsRef = useRef<Record<string, unknown>>({ ...PREVIEW_SETTINGS });
  const setCats = useCallback((f: (p: DbCategory[]) => DbCategory[]) => { catsRef.current = f(catsRef.current); _setCats(catsRef.current); }, []);
  const setItems = useCallback((f: (p: DbItem[]) => DbItem[]) => { itemsRef.current = f(itemsRef.current); _setItems(itemsRef.current); }, []);

  const persist = useCallback(() => {
    if (supabase) return;
    try { localStorage.setItem(PREVIEW_KEY, JSON.stringify({ categories: catsRef.current, items: itemsRef.current, settings: settingsRef.current })); } catch { /* kota dolu: yalnız bellek */ }
  }, []);

  // Oturum
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session); setAuthReady(true); } });
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => {
      setSession(s);
      if (ev === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const email = isPreview ? "önizleme" : (session?.user.email ?? null);

  // Yönetici mi: admins tablosunda kendi satırı görünüyorsa
  useEffect(() => {
    if (!supabase || !authReady) return;
    let alive = true;
    const mail = session?.user.email;
    (async () => {
      if (!mail) { if (alive) { setIsAdmin(false); setAdminChecked(true); } return; }
      const { data } = await supabase!.from("admins").select("email").eq("email", mail).maybeSingle();
      if (alive) { setIsAdmin(!!data); setAdminChecked(true); }
    })();
    return () => { alive = false; };
  }, [authReady, session]);

  // Veri yükleme + canlı abonelik
  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    (async () => {
      if (!supabase) {
        let p: { categories: DbCategory[]; items: DbItem[]; settings?: Record<string, unknown> } | null = null;
        try { const raw = localStorage.getItem(PREVIEW_KEY); if (raw) p = JSON.parse(raw); } catch { p = null; }
        const base = p ?? buildPreview();
        settingsRef.current = { ...PREVIEW_SETTINGS, ...(p?.settings ?? {}) };
        if (!alive) return;
        setCats(() => sortCats(base.categories)); setItems(() => [...base.items].sort(bySort)); setLoaded(true);
        return;
      }
      const [c, i] = await Promise.all([
        supabase.from("categories").select("*").order("sort"),
        supabase.from("items").select("*").order("sort"),
      ]);
      if (!alive) return;
      if (c.error || i.error) toast.error("Menü yüklenemedi. Bağlantıyı kontrol edip sayfayı yenileyin.");
      setCats(() => sortCats((c.data ?? []) as DbCategory[]));
      setItems(() => ((i.data ?? []) as DbItem[]).sort(bySort));
      setLoaded(true);
    })();
    if (!supabase) return () => { alive = false; };
    const ch = supabase
      .channel("panel-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, (p) => {
        if (p.eventType === "DELETE") { const uid = (p.old as { uid?: string }).uid; if (uid) setItems((l) => l.filter((x) => x.uid !== uid)); return; }
        const row = p.new as DbItem;
        setItems((l) => (l.some((x) => x.uid === row.uid) ? l.map((x) => (x.uid === row.uid ? row : x)) : [...l, row]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, (p) => {
        if (p.eventType === "DELETE") { const id = (p.old as { id?: string }).id; if (id) setCats((l) => l.filter((x) => x.id !== id)); return; }
        const row = p.new as DbCategory;
        setCats((l) => sortCats(l.some((x) => x.id === row.id) ? l.map((x) => (x.id === row.id ? row : x)) : [...l, row]));
      })
      .subscribe();
    return () => { alive = false; supabase!.removeChannel(ch); };
  }, [isAdmin, setCats, setItems]);

  const fail = useCallback((what: string) => toast.error(`${what} kaydedilemedi. Değişiklik geri alındı.`), []);

  // ---- Ürünler ----
  const patchItem = useCallback(async (uid: string, patch: ItemPatch): Promise<Record<string, unknown> | null> => {
    const prev = itemsRef.current.find((x) => x.uid === uid);
    if (!prev) return null;
    const before: Record<string, unknown> = {};
    for (const k of Object.keys(patch)) before[k] = (prev as unknown as Record<string, unknown>)[k];
    setItems((l) => l.map((x) => (x.uid === uid ? { ...x, ...patch } : x)));
    const { error } = await run((sb) => sb.from("items").update(patch).eq("uid", uid));
    if (error) { setItems((l) => l.map((x) => (x.uid === uid ? { ...x, ...before } : x))); fail("Ürün"); return null; }
    persist();
    return before;
  }, [fail, persist, setItems]);

  const updateItem = useCallback(async (uid: string, patch: ItemPatch, undoLabel?: string): Promise<boolean> => {
    const before = await patchItem(uid, patch);
    if (!before) return false;
    if (undoLabel) toast(undoLabel, { action: { label: "Geri al", onClick: () => { void patchItem(uid, before as ItemPatch); } } });
    return true;
  }, [patchItem]);

  const createItem = useCallback(async (input: NewItem): Promise<DbItem | null> => {
    const taken = new Set(itemsRef.current.filter((x) => x.category_id === input.category_id).map((x) => x.slug));
    const base = input.slug ? slugify(input.slug) : slugify(input.name_tr);
    let slug = base, n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
    const sorts = itemsRef.current.filter((x) => x.category_id === input.category_id).map((x) => x.sort);
    const row: DbItem = {
      desc_tr: "", desc_en: "", price: null, image: null, options: [], options_optional: false, tags: [], available: true, hidden: false,
      ...input, name_en: input.name_en || input.name_tr, slug, uid: crypto.randomUUID(), sort: sorts.length ? Math.max(...sorts) + 1 : 0, updated_at: new Date().toISOString(),
    };
    setItems((l) => [...l, row]);
    const { updated_at: _u, ...insert } = row; void _u;
    const { error } = await run((sb) => sb.from("items").insert(insert));
    if (error) { setItems((l) => l.filter((x) => x.uid !== row.uid)); fail("Yeni ürün"); return null; }
    persist();
    return row;
  }, [fail, persist, setItems]);

  const deleteItem = useCallback(async (uid: string): Promise<boolean> => {
    const row = itemsRef.current.find((x) => x.uid === uid);
    if (!row) return false;
    setItems((l) => l.filter((x) => x.uid !== uid));
    const { error } = await run((sb) => sb.from("items").delete().eq("uid", uid));
    if (error) { setItems((l) => [...l, row]); fail("Silme"); return false; }
    persist();
    toast(`"${row.name_tr}" silindi`, {
      action: {
        label: "Geri al",
        onClick: async () => {
          setItems((l) => [...l, row]);
          const { updated_at: _u, ...insert } = row; void _u;
          const r = await run((sb) => sb.from("items").insert(insert));
          if (r.error) { setItems((l) => l.filter((x) => x.uid !== uid)); toast.error("Ürün geri getirilemedi."); } else persist();
        },
      },
    });
    return true;
  }, [fail, persist, setItems]);

  const moveItem = useCallback(async (uid: string, dir: -1 | 1): Promise<boolean> => {
    const cur = itemsRef.current.find((x) => x.uid === uid);
    if (!cur) return false;
    const list = itemsRef.current.filter((x) => x.category_id === cur.category_id).sort(bySort);
    const i = list.findIndex((x) => x.uid === uid), j = i + dir;
    if (j < 0 || j >= list.length) return false;
    [list[i], list[j]] = [list[j], list[i]];
    const changes = list.map((x, idx) => ({ uid: x.uid, from: x.sort, to: idx })).filter((c) => c.from !== c.to);
    const apply = (key: "to" | "from") => { const m = new Map(changes.map((c) => [c.uid, c[key]])); setItems((l) => l.map((x) => (m.has(x.uid) ? { ...x, sort: m.get(x.uid)! } : x))); };
    apply("to");
    const rs = await Promise.all(changes.map((c) => run((sb) => sb.from("items").update({ sort: c.to }).eq("uid", c.uid))));
    if (rs.some((r) => r.error)) { apply("from"); fail("Sıralama"); return false; }
    persist();
    return true;
  }, [fail, persist, setItems]);

  // ---- Kategoriler ----
  const updateCategory = useCallback(async (id: string, patch: Partial<Omit<DbCategory, "id">>): Promise<boolean> => {
    const prev = catsRef.current.find((x) => x.id === id);
    if (!prev) return false;
    setCats((l) => sortCats(l.map((x) => (x.id === id ? { ...x, ...patch } : x))));
    const { error } = await run((sb) => sb.from("categories").update(patch).eq("id", id));
    if (error) { setCats((l) => sortCats(l.map((x) => (x.id === id ? prev : x)))); fail("Kategori"); return false; }
    persist();
    return true;
  }, [fail, persist, setCats]);

  const createCategory = useCallback(async (input: NewCategory): Promise<DbCategory | null> => {
    const base = slugify(input.name_en || input.name_tr);
    let id = base, n = 2;
    while (catsRef.current.some((x) => x.id === id)) id = `${base}-${n++}`;
    const sorts = catsRef.current.filter((x) => x.board === input.board).map((x) => x.sort);
    const row: DbCategory = { id, board: input.board, name_tr: input.name_tr, name_en: input.name_en || input.name_tr, sort: sorts.length ? Math.max(...sorts) + 1 : catsRef.current.length };
    setCats((l) => sortCats([...l, row]));
    const { error } = await run((sb) => sb.from("categories").insert(row));
    if (error) { setCats((l) => l.filter((x) => x.id !== id)); fail("Kategori"); return null; }
    persist();
    return row;
  }, [fail, persist, setCats]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const row = catsRef.current.find((x) => x.id === id);
    if (!row) return false;
    if (itemsRef.current.some((x) => x.category_id === id)) { toast.error("Bu kategoride ürün var. Önce ürünleri silin ya da başka kategoriye taşıyın."); return false; }
    setCats((l) => l.filter((x) => x.id !== id));
    const { error } = await run((sb) => sb.from("categories").delete().eq("id", id));
    if (error) { setCats((l) => sortCats([...l, row])); fail("Silme"); return false; }
    persist();
    toast(`"${row.name_tr}" silindi`, {
      action: { label: "Geri al", onClick: async () => { setCats((l) => sortCats([...l, row])); const r = await run((sb) => sb.from("categories").insert(row)); if (r.error) { setCats((l) => l.filter((x) => x.id !== id)); toast.error("Kategori geri getirilemedi."); } else persist(); } },
    });
    return true;
  }, [fail, persist, setCats]);

  const moveCategory = useCallback(async (id: string, dir: -1 | 1): Promise<boolean> => {
    const cur = catsRef.current.find((x) => x.id === id);
    if (!cur) return false;
    const list = catsRef.current.filter((x) => x.board === cur.board).sort(bySort);
    const i = list.findIndex((x) => x.id === id), j = i + dir;
    if (j < 0 || j >= list.length) return false;
    [list[i], list[j]] = [list[j], list[i]];
    const base = Math.min(...list.map((x) => x.sort));
    const changes = list.map((x, idx) => ({ id: x.id, from: x.sort, to: base + idx })).filter((c) => c.from !== c.to);
    const apply = (key: "to" | "from") => { const m = new Map(changes.map((c) => [c.id, c[key]])); setCats((l) => sortCats(l.map((x) => (m.has(x.id) ? { ...x, sort: m.get(x.id)! } : x)))); };
    apply("to");
    const rs = await Promise.all(changes.map((c) => run((sb) => sb.from("categories").update({ sort: c.to }).eq("id", c.id))));
    if (rs.some((r) => r.error)) { apply("from"); fail("Sıralama"); return false; }
    persist();
    return true;
  }, [fail, persist, setCats]);

  // ---- Ayarlar ----
  const getSetting = useCallback(async <T,>(key: string): Promise<T | null> => {
    if (!supabase) return (settingsRef.current[key] as T | undefined) ?? null;
    const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
    if (error) return null;
    return (data?.value as T | undefined) ?? null;
  }, []);
  const saveSetting = useCallback(async (key: string, value: unknown): Promise<boolean> => {
    if (!supabase) { settingsRef.current[key] = value; persist(); return true; }
    const { error } = await supabase.from("settings").upsert({ key, value });
    if (error) { toast.error("Ayar kaydedilemedi."); return false; }
    return true;
  }, [persist]);

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut(); }, []);
  const endRecovery = useCallback(() => setRecovery(false), []);

  const loading = !authReady || !adminChecked || (isAdmin && !loaded);

  const value = useMemo<Ctx>(() => ({
    session, email, isAdmin, loading, isPreview, recovery, endRecovery, categories, items,
    updateItem, createItem, deleteItem, moveItem, updateCategory, createCategory, deleteCategory, moveCategory, getSetting, saveSetting, signOut,
  }), [session, email, isAdmin, loading, isPreview, recovery, endRecovery, categories, items, updateItem, createItem, deleteItem, moveItem, updateCategory, createCategory, deleteCategory, moveCategory, getSetting, saveSetting, signOut]);

  // eslint-disable-next-line react-hooks/refs -- ref'ler yalnız olay işleyicilerinde okunur
  return createElement(PanelCtx.Provider, { value }, children);
}
