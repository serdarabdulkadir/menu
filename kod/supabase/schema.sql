-- Permesso QR Menü · Supabase şeması
-- Supabase panelinde SQL Editor'e yapıştırıp bir kez çalıştırın; ardından seed.sql.

-- Yönetici listesi: yalnız buradaki e-postalar yazabilir (kayıt açık kalsa bile)
create table if not exists admins (email text primary key);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = coalesce(auth.jwt() ->> 'email', ''));
$$;

create table if not exists categories (
  id text primary key,                 -- ör. "espresso"
  board text not null,                 -- coffee | hot | cold | mocktails | desserts | croissants | sandwiches | extras
  name_tr text not null,
  name_en text not null,
  sort int not null default 0
);

create table if not exists items (
  uid uuid primary key default gen_random_uuid(),
  slug text not null,                  -- menüdeki kimlik, ör. "coffee-latte"
  category_id text not null references categories(id) on update cascade on delete cascade,
  name_tr text not null,
  name_en text not null,
  desc_tr text not null default '',
  desc_en text not null default '',
  price int,                           -- ₺, null = fiyatsız
  image text,                          -- dosya adı (public/img/urun) ya da Storage tam URL'si
  options text[] not null default '{}',
  options_optional boolean not null default false,
  tags text[] not null default '{}',
  available boolean not null default true,   -- false = "Bugün yok"
  hidden boolean not null default false,     -- menüde hiç görünmez
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  unique (slug, category_id)
);

-- Ayarlar: 'info' (saat, adres, iletişim, wifi), 'announcement' (duyuru), 'showcase' (vitrin slug listesi)
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Geçmiş (kim, ne zaman, ne değiştirdi)
create table if not exists audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor text,
  action text not null,                -- INSERT | UPDATE | DELETE
  entity text not null,                -- items | categories | settings
  entity_id text,
  before jsonb,
  after jsonb
);

create or replace function log_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare rid text;
begin
  rid := coalesce(
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end ->> 'uid',
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end ->> 'id',
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end ->> 'key');
  insert into audit_log(actor, action, entity, entity_id, before, after)
  values (auth.jwt() ->> 'email', tg_op, tg_table_name, rid,
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create or replace function touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists items_touch on items;
create trigger items_touch before update on items for each row execute function touch();
drop trigger if exists settings_touch on settings;
create trigger settings_touch before update on settings for each row execute function touch();
drop trigger if exists items_log on items;
create trigger items_log after insert or update or delete on items for each row execute function log_change();
drop trigger if exists categories_log on categories;
create trigger categories_log after insert or update or delete on categories for each row execute function log_change();
drop trigger if exists settings_log on settings;
create trigger settings_log after insert or update or delete on settings for each row execute function log_change();

-- Güvenlik (RLS): herkes okur, yalnız yönetici yazar; geçmişi yalnız yönetici görür
alter table admins enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table settings enable row level security;
alter table audit_log enable row level security;

drop policy if exists "read categories" on categories;
create policy "read categories" on categories for select using (true);
drop policy if exists "write categories" on categories;
create policy "write categories" on categories for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "read items" on items;
create policy "read items" on items for select using (true);
drop policy if exists "write items" on items;
create policy "write items" on items for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "read settings" on settings;
create policy "read settings" on settings for select using (true);
drop policy if exists "write settings" on settings;
create policy "write settings" on settings for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "admin reads log" on audit_log;
create policy "admin reads log" on audit_log for select to authenticated using (is_admin());

drop policy if exists "admin sees self" on admins;
create policy "admin sees self" on admins for select to authenticated using (email = auth.jwt() ->> 'email');

-- Fotoğraf deposu: herkese açık okuma, yalnız yönetici yükler / siler
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
drop policy if exists "photos read" on storage.objects;
create policy "photos read" on storage.objects for select using (bucket_id = 'photos');
drop policy if exists "photos write" on storage.objects;
create policy "photos write" on storage.objects for all to authenticated using (bucket_id = 'photos' and is_admin()) with check (bucket_id = 'photos' and is_admin());

-- Anlık güncelleme: menü sayfası değişiklikleri hemen görür
do $$ begin
  begin alter publication supabase_realtime add table items; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table categories; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table settings; exception when duplicate_object then null; end;
end $$;

-- SON ADIM: kendi e-postanızı yönetici yapın (Authentication > Users'ta aynı e-postayla kullanıcı oluşturun)
-- insert into admins(email) values ('sizin@epostaniz.com');
