# mattIA — il tuo tutor AI per Ingegneria Informatica

mattIA è una web app EdTech che aiuta gli studenti a preparare gli esami di
Ingegneria Informatica. Crei una **Sessione di Studio** per ogni materia, carichi
dispense e tracce d'esame, e studi con un tutor AI che risponde **basandosi sui
tuoi materiali** (RAG). In più: simulazioni d'esame, flashcard a ripetizione
dilazionata, appunti, lavagna, glossario e dashboard dei progressi.

## ✨ Funzionalità

- **Tutor AI (RAG)** — chat in streaming con persona da professore; risponde sui
  tuoi PDF/dispense, con Markdown, blocchi di codice e formule **LaTeX**.
- **Multi-AI · BYOK** — porti le tue chiavi (Anthropic, OpenAI, Google) cifrate
  con AES-256-GCM, oppure usi **Ollama in locale** (gratis e privato, nessuna
  chiave). Scegli il modello di default e cambialo **al volo** in chat.
- **Sessioni di studio** — materiali, chat, appunti e progressi separati per
  materia. Cronologia chat persistente.
- **Split-screen** — accanto alla chat: editor Markdown con **toolbar LaTeX** ed
  export PDF, **taccuini** multipli, **lavagna** (tldraw, ottimizzata Apple
  Pencil), **glossario** e **code sandbox** (Monaco: Python/JS/SQL eseguibili).
- **Simulatore d'esame** — genera simulazioni dalle tracce, correzione AI e voto
  per argomento, con timer Pomodoro/cronometro in background.
- **Flashcard** — generate dagli appunti, ripasso in stile Anki (algoritmo SM-2).
- **Dashboard** — radar della padronanza per argomento dalle simulazioni.

## 🧱 Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (base-nova) · Framer Motion · lucide-react
- **Clerk** (autenticazione) · **Supabase** (Postgres 17 + pgvector + Storage)
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/anthropic|openai|google`)
- `unpdf` (estrazione PDF) · `tldraw` · `@monaco-editor/react` · `recharts`

## 🚀 Avvio in locale

> Richiede **Node ≥ 24** (vedi `.nvmrc`). Con Node 22.x il `next dev` non parte
> (errore `work-async-storage.external.js`).

```bash
nvm use            # usa la versione in .nvmrc (24.16.0)
npm install
npm run dev        # http://localhost:3000
```

### Variabili d'ambiente (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # publishable key
SUPABASE_SERVICE_ROLE_KEY=...            # server-only
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
APP_ENCRYPTION_KEY=...                    # base64, 32 byte (openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Le chiavi dei provider AI **non** vanno qui: le inserisce ogni utente dalle
Impostazioni (BYOK). Per il RAG serve una chiave **OpenAI o Google** (per gli
embedding); la chat funziona con qualunque provider.

## 🏗️ Architettura

- Clerk autentica; il server parla con Supabase via **service-role key**. RLS è
  attivo su tutte le tabelle (deny-all), l'autorizzazione è applicata nel codice
  server scopando ogni query con `clerk_user_id`.
- Embedding `vector(1536)`; ricerca per similarità coseno via la funzione SQL
  `match_document_chunks` (indice HNSW).
- Codice modulare: helper in `lib/`, UI in `components/`, route in `app/`.

## 📦 Deploy su Vercel

Importa il repo su Vercel, imposta le variabili d'ambiente sopra e fai il deploy
(root directory = root del repo).

---

Costruito per studenti di Ingegneria Informatica. UI in italiano.
