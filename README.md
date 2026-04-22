# RAG

Demo NestJS API that chunks documents, embeds them with Groq through the official OpenAI client, retrieves the closest snippets, and answers from that context only.

Restarting the process clears the store. Seed data loads automatically on boot when `GROQ_API_KEY` is set.

## Stack

- NestJS 12 + pnpm
- OpenAI SDK pointed at `https://api.groq.com/openai/v1`
- Groq embeddings: `nomic-embed-text-v1.5`
- Groq chat: `openai/gpt-oss-20b`
- In-memory chunk store + seeded LumenCloud knowledge base

## Setup

```bash
pnpm install
cp .env.example .env
```

Add a Groq key from [console.groq.com/keys](https://console.groq.com/keys) to `.env`. You can reuse the same key as the embeddings project.

```bash
pnpm start:dev
```

The API is at `http://localhost:3001/api` so it can run next to the embeddings demo on port 3000. Boot chunks and embeds the 10 LumenCloud seed docs.

If embeddings fail, try this model id in `.env`:

```bash
GROQ_EMBEDDING_MODEL=nomic-embed-text-v1_5
```

## Try it

```bash
# health + seed counts
curl http://localhost:3001/api/health

# list seed documents (with chunk counts)
curl http://localhost:3001/api/documents

# retrieve snippets only (no LLM answer)
curl -X POST http://localhost:3001/api/retrieve \
  -H 'Content-Type: application/json' \
  -d '{"query":"can I run a postgres database on spot instances?","limit":4}'

# RAG answer using retrieved snippets
curl -X POST http://localhost:3001/api/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"How do EU customers keep data in Ireland?"}'

# reload seed data
curl -X POST http://localhost:3001/api/documents/seed
```

Useful demo questions:

- `can I run a postgres database on spot instances?` → compute / spot warning
- `How do EU customers keep data in Ireland?` → regions / GDPR
- `What happens if my card fails?` → billing pause
- `How do I deploy from GitHub Actions?` → CLI / service account

`requests.http` has the same calls for the REST client.

## Pipeline

```
document
  → split into overlapping chunks
  → Groq embedding model  →  one vector per chunk
  → save chunks in an in-memory Map

question
  → same embedding model  →  query vector
  → cosine similarity vs every chunk     =  retrieve
  → top chunks go into the chat prompt   =  augment
  → Groq chat answers from snippets only =  generate
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api` or `/api/health` | Status, models, document and chunk counts |
| GET | `/api/documents` | List stored documents |
| GET | `/api/documents/:id` | One document |
| GET | `/api/chunks` | List stored chunks |
| POST | `/api/documents` | Chunk, embed, and store a document |
| POST | `/api/documents/seed` | Reset and load LumenCloud seed data |
| DELETE | `/api/documents` | Clear the in-memory store |
| POST | `/api/retrieve` | Semantic retrieval of chunks |
| POST | `/api/ask` | Retrieve + Groq answer |

## Scripts

```bash
pnpm start:dev
pnpm test
pnpm test:e2e
pnpm build
```
