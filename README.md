# 🌸 FLOWRA — Agentic RAG Flowchart Generator

FLOWRA transforms unstructured text into interactive, logically structured flowcharts using a multi-agent AI pipeline backed by retrieval-augmented generation. Paste any process description — a runbook, a policy document, a technical spec — and get a navigable visual diagram in seconds.

---

## ✨ Features

- **Multi-agent LLM pipeline** — four specialized agents (extraction, schema, validation, critique) orchestrated by LangGraph
- **RAG-powered generation** — ChromaDB vector store retrieves relevant context before each generation, grounding output in your own documents
- **Self-healing output** — validation and critique agents detect errors and trigger targeted retries automatically
- **Interactive canvas** — drag, zoom, lock nodes, and auto-tidy layouts powered by React Flow and ELK.js
- **Session memory** — conversation history persists across requests so follow-up diagrams build on prior context
- **Knowledge base ingestion** — paste any document into the sidebar to index it for future retrievals
- **SVG export** — download any diagram as a high-quality vector graphic
- **Floral UI** — handwritten Caveat font, pastel palette, and subtle botanical textures

---

## 🏗️ Architecture

```
User Input
    │
    ▼
Next.js Frontend (React Flow canvas + ingestion panel)
    │
    ├── POST /v1/ingest ──► Ingestion Pipeline
    │                           └── Chunk → Embed (gemini-embedding-001) → ChromaDB
    │
    └── POST /v1/generate
            │
            ▼
        FastAPI Backend
            │
            ├── RAG Retrieval (ChromaDB semantic search)
            │
            └── LangGraph Agent Pipeline
                    │
                    ├── 1. Extraction Agent   — topics, steps, decisions, dependencies
                    ├── 2. Schema Agent       — converts extraction to DiagramSpec JSON
                    ├── 3. Validation Agent   — Pydantic checks, retries with repair prompt
                    └── 4. Critique Agent     — self-evaluates completeness, retries if needed
                            │
                            ▼
                    Layout Engine (ELK.js via Node.js subprocess)
                            │
                            ▼
                    React Flow Visualization
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, React Flow, Tailwind CSS, TanStack Query |
| Backend | FastAPI, Pydantic, Python 3.11+ |
| Agent Orchestration | LangGraph |
| LLM | Google Gemini 2.5 Flash |
| Embeddings | Google gemini-embedding-001 (3072-dim) |
| Vector Store | ChromaDB |
| Layout Engine | ELK.js running in Node.js |
| Session Memory | SQLite + SQLAlchemy |
| Observability | LangSmith |
| Package Management | pnpm (monorepo) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm
- A Google AI Studio API key ([get one here](https://aistudio.google.com))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/flowra.git
cd flowra
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Copy the environment file and add your keys:

```bash
cp .env.example .env
```

```env
GOOGLE_API_KEY=your_google_api_key_here

# Optional — LangSmith observability
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key_here
LANGCHAIN_PROJECT=flowra
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📖 Usage

### Generating a flowchart

1. Type or paste any process description into the **Flowchart Generator** textarea
2. Click **Generate** and watch the 4-agent pipeline work
3. Interact with the diagram — drag nodes, zoom, click **Auto Tidy** to re-layout

### Building a knowledge base

1. Expand the **Knowledge Base Ingestion** panel in the sidebar
2. Paste a document (runbook, SOP, policy) and give it a source label
3. Click **Add to Knowledge Base** — the document is chunked, embedded, and indexed
4. Future generation requests will automatically retrieve relevant chunks from it

### Session memory

Each browser session maintains conversation history. Follow-up prompts like *"what happens when step 3 fails?"* will reference the diagram you just generated.

---

## 🗂️ Project Structure

```
flowra/
├── frontend/                  # Next.js application
│   ├── app/                   # App Router pages and layouts
│   ├── components/            # React components (canvas, sidebar, nodes)
│   └── lib/                   # API client, types, utilities
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app and route registration
│   │   ├── routers/           # /v1/generate, /v1/ingest, /v1/layout, /v1/session
│   │   └── services/
│   │       ├── agents/        # extraction, schema, validation, critique agents
│   │       ├── embeddings.py  # Google embedding wrapper
│   │       ├── vector_store.py# ChromaDB client
│   │       ├── ingestion.py   # Chunking + indexing pipeline
│   │       ├── generator.py   # LangGraph orchestrator
│   │       └── layout.py      # ELK.js subprocess caller
│   └── tools/
│       └── layout_engine.js   # Node.js ELK.js layout tool
│
└── shared/                    # JSON schemas and TypeScript types
    ├── diagram_spec.json
    └── layout_spec.json
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/generate` | Generate a DiagramSpec from text |
| `POST` | `/v1/ingest` | Chunk, embed, and index a document |
| `POST` | `/v1/layout` | Apply ELK.js layout to a DiagramSpec |
| `GET` | `/v1/session/{id}/history` | Retrieve past diagrams for a session |

**POST /v1/generate**
```json
{
  "text": "User logs in. System validates credentials. If valid, show dashboard. If not, show error.",
  "session_id": "optional-session-uuid"
}
```

**POST /v1/ingest**
```json
{
  "text": "Your document content here...",
  "source_label": "Q3 Runbook"
}
```

---

## ⚠️ Known Limitations

- The free tier of the Gemini API allows 20 requests per day per model. The 4-agent pipeline uses 4 requests per generation. Enable billing at [aistudio.google.com](https://aistudio.google.com) for production use.
- Very large graphs (50+ nodes) may have slower layout due to the Node.js subprocess overhead.
- ChromaDB runs in-memory by default in development. Configure a persistent directory in `vector_store.py` for production.

---

## 🗺️ Roadmap

- [ ] PDF and URL ingestion support
- [ ] Multi-user sessions with authentication
- [ ] Export to Mermaid.js and draw.io formats
- [ ] Streaming agent progress to the frontend via WebSockets
- [ ] Switch to a persistent vector store (Pinecone / Weaviate) for production

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
