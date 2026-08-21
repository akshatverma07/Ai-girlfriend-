# Apinya — AI Companion with Persistent Memory

Version 2 adds a Supabase/PostgreSQL memory layer with pgvector.

## What it does

- Stores durable memories about the user.
- Creates embeddings for memories.
- Retrieves semantically relevant memories before each reply.
- Extracts candidate memories after conversations.
- Avoids obvious duplicate memories.
- Provides `/memories` as a Memory Center where memories can be viewed and forgotten.

Supabase's pgvector extension supports storing embeddings in Postgres and similarity search.

## Setup

### 1. Create Supabase project

Create a Supabase project and open its SQL Editor.

### 2. Create the database

Run:

`supabase/memory.sql`

The SQL enables `vector`, creates the `memories` table, an HNSW cosine index, and the `match_memories` function.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- OPENAI_API_KEY
- OPENAI_MODEL
- OPENAI_EMBEDDING_MODEL
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SECRET_KEY
- APINYA_USER_ID

Keep `SUPABASE_SECRET_KEY` and `OPENAI_API_KEY` server-side. Never commit `.env.local`.

### 4. Install and run

`npm install`

`npm run dev`

Open `/` for chat and `/memories` for the Memory Center.

## Important architecture note

This is a single-user MVP. Before making it public or adding multiple accounts, add authentication and Row Level Security policies tied to the authenticated user's ID. Do not use one shared user ID for a public deployment.

## Memory policy

The extractor is intentionally conservative. It should remember durable preferences, interests, goals, habits, and useful personal context, but it should not intentionally store passwords, secrets, exact addresses, financial account details, or other highly sensitive information.
