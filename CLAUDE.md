@AGENTS.md

# mattIA — project guide

EdTech web app: an AI tutor for Italian "Ingegneria Informatica" exam prep.
Students create **Study Sessions** (e.g. Analisi 1, Reti Logiche), upload
materials + old exam tracks, then chat with a professor-style AI grounded on
those sources (RAG), take exam simulations, and review with flashcards.

UI language is **Italian**.

## Stack
- **Next.js 16** (App Router, Turbopack default) — NOT 15. Read
  `node_modules/next/dist/docs/` before using unfamiliar APIs. Key v16 changes:
  `cookies()/headers()/params/searchParams` are **async** (await them);
  `middleware` is deprecated in favor of `proxy.ts` (we still use `middleware.ts`
  for Clerk, which works). React 19.2.
- **Tailwind v4** (CSS-first, `@theme` in `app/globals.css`, no tailwind.config).
- **shadcn/ui** (style: base-nova, `components.json`), Framer Motion, lucide-react.
- **Clerk** v7 for auth (`@clerk/nextjs`, Italian localization).
- **Supabase** (project ref `ojaocusmvvcbufgoqerm`): Postgres 17 + pgvector,
  Storage bucket `materials` (private). Managed via the Supabase MCP.
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/anthropic|openai|google`, `@ai-sdk/react`).

## Architecture decisions
- **Auth + DB**: Clerk authenticates; the server talks to Supabase with the
  **service-role key** (`lib/supabase/admin.ts`). RLS is ON for every table with
  **no policies** (deny-all to the anon key); authorization is enforced in our
  server code by always scoping queries with `clerk_user_id`. Never use the
  admin client from a Client Component.
- **BYOK (multi-AI)**: users store their own provider API keys, encrypted at rest
  with AES-256-GCM (`lib/crypto.ts`, key = `APP_ENCRYPTION_KEY`). Catalog of
  providers/models in `lib/ai/models.ts`; `lib/ai/providers.ts` builds a model
  from (provider, modelId, apiKey); `lib/ai/keys.ts` fetches+decrypts user keys.
- **Providers**: Anthropic, OpenAI, Google, **Ollama** (local). Ollama uses a
  host URL (default `http://localhost:11434`) instead of a secret key, via the
  OpenAI-compatible endpoint (`createOpenAI({ baseURL })`, see
  `ollamaBaseUrl()`). Ollama only works when the app runs locally (server →
  localhost); not on Vercel.
- **Embeddings/RAG**: `document_chunks.embedding` is `vector(768)` (was 1536) so
  local Ollama `nomic-embed-text` works; OpenAI/Google are forced to 768 dims via
  provider options. `EMBEDDING_PROVIDERS` prefers `ollama` → openai → google.
  `match_document_chunks()` RPC does cosine search scoped to session + user.
- **Persistence**: chat threads/messages, notebooks (taccuini), whiteboards,
  flashcards, exam sims, glossary — all in Supabase, keyed by session + user.

## Conventions
- Path alias `@/*` → repo root. Lib helpers under `lib/`, UI under `components/`.
- Server-only modules import `"server-only"`.
- DB types in `lib/database.types.ts` (regen via Supabase MCP after schema changes).

## Local dev gotcha
- The Bash sandbox network is very slow/blocked for npm. Run installs with
  `dangerouslyDisableSandbox: true` (network works full-speed there).
- **Node version matters**: on this machine `next dev` only works on **Node ≥24**
  (22.12 AND 22.16 both crash with "Cannot find module …work-async-storage.external.js",
  despite Next claiming 22.13+ support). `.nvmrc` is pinned to 24.16.0 and the nvm
  default is 24.16.0 — run `nvm use` (or open a fresh terminal) before `npm run dev`.
  If you still hit the error, `rm -rf .next` (stale cache from a bad-Node run).
- Preview headless Chrome often can't reach localhost here; verify with
  `next build` + `tsc --noEmit` + `curl`, not screenshots.
