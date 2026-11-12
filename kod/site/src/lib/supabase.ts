import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Ortam değişkenleri yoksa (yerel/ilk kurulum) null döner: menü paketteki menu.json ile çalışır.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

// Veritabanı satır tipleri (kod/supabase/schema.sql ile birebir)
export type DbCategory = { id: string; board: string; name_tr: string; name_en: string; sort: number };
export type DbItem = {
  uid: string; slug: string; category_id: string;
  name_tr: string; name_en: string; desc_tr: string; desc_en: string;
  price: number | null; image: string | null;
  options: string[]; options_optional: boolean; tags: string[];
  available: boolean; hidden: boolean; sort: number; updated_at: string;
};
export type Info = { open: string; close: string; address: string; maps: string; phone: string; phoneLabel: string; whatsapp: string; instagram: string; handle: string; wifiName: string; wifiPass: string };
export type Announcement = { active: boolean; tr: string; en: string; until?: string | null };
export type AuditRow = { id: number; at: string; actor: string | null; action: string; entity: string; entity_id: string | null; before: Record<string, unknown> | null; after: Record<string, unknown> | null };

// Fotoğraf: düz dosya adıysa paketteki görsel, tam URL ise Storage
export const PHOTO_BUCKET = "photos";
