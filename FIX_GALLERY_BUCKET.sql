-- Create Gallery Table
create table if not exists gallery (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text not null,
  category text default 'Other',
  uploaded_by text default 'Anonymous',
  title text
);

-- Enable RLS
alter table gallery enable row level security;

-- Policies
create policy "Enable read access for all users" on gallery for select using (true);
create policy "Enable insert for all users" on gallery for insert with check (true);

-- Create Storage Bucket
insert into storage.buckets (id, name, public) 
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Give public access to gallery" on storage.objects for select using ( bucket_id = 'gallery' );
create policy "Enable upload for all" on storage.objects for insert with check ( bucket_id = 'gallery' );
