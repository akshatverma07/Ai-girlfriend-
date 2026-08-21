-- Apinya persistent memory database
-- Run this entire file in Supabase Dashboard > SQL Editor.

create extension if not exists vector;

create table if not exists users (
  id uuid primary key,
  created_at timestamptz not null default now()
);

insert into users (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  memory_type text not null,
  content text not null,
  importance real not null default 0.5,
  confidence real not null default 1.0,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  is_deleted boolean not null default false
);

create index if not exists memories_user_id_idx
  on memories(user_id);

create index if not exists memories_embedding_hnsw_idx
  on memories using hnsw (embedding vector_cosine_ops);

create or replace function match_memories(
  query_embedding vector(1536),
  match_user_id uuid,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  memory_type text,
  importance real,
  confidence real,
  similarity float
)
language sql
stable
as $$
  select
    m.id,
    m.content,
    m.memory_type,
    m.importance,
    m.confidence,
    1 - (m.embedding <=> query_embedding) as similarity
  from memories m
  where m.user_id = match_user_id
    and m.is_deleted = false
    and m.embedding is not null
    and 1 - (m.embedding <=> query_embedding) >= match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

-- For this single-user MVP the server uses the secret key.
-- Do not expose SUPABASE_SECRET_KEY in browser code.
alter table memories enable row level security;
