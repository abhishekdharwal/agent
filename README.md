# RN Blog Agent

An agentic writing assistant that drafts **LinkedIn posts for a React Native developer**. Give it a topic (and optionally an angle), and it runs a research-and-write loop — searching the web for current facts, then writing a post in a deliberately un-corporate engineer's voice. Drafts are saved locally so you can review, edit, copy, and mark them published from a simple dashboard.

Built with Next.js (App Router) and TypeScript.

## How it works

The core is an agent loop in [`lib/agent.ts`](lib/agent.ts):

1. A request comes in with a `topic` and optional `angle`.
2. The agent calls a chat model with a `web_search` tool available.
3. While the model returns tool calls, the loop runs them (web searches via Tavily) and feeds the results back — up to 8 iterations.
4. When the model stops calling tools, its final message is the finished post.
5. The post, the sources it used, token usage, and metadata are saved as a draft.

The system prompt enforces a strict voice (first-person, concrete, no hype words, no emoji spam), a LinkedIn-friendly structure (strong hook, short paragraphs, one takeaway, a question, hashtags), and a target length of 1300–1900 characters.

### Pieces

| Path                             | Responsibility                                            |
| -------------------------------- | --------------------------------------------------------- |
| `lib/agent.ts`                   | The agent loop, system prompt, and model call             |
| `lib/tools.ts`                   | Tool definitions and the Tavily web-search implementation |
| `lib/storage.ts`                 | Reads/writes drafts as JSON files in `drafts/`            |
| `app/api/generate/route.ts`      | `POST` — generate a new draft from a topic                |
| `app/api/drafts/route.ts`        | `GET` — list all drafts                                   |
| `app/api/drafts/[id]/route.ts`   | `GET` / `PATCH` / `DELETE` a single draft                 |
| `app/page.tsx`                   | Dashboard: new-post form + draft list                     |
| `app/components/DraftEditor.tsx` | Edit, copy, mark published, delete a draft                |
| `app/components/DraftList.tsx`   | Sidebar list of drafts                                    |

Drafts live in the `drafts/` directory as `draft_<timestamp>.json`. Each holds the topic, angle, content, sources, status (`pending` / `published` / `archived`), timestamps, and token usage.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key   # model provider (OpenAI-compatible API)
TAVILY_API_KEY=your_tavily_api_key       # web search
YOUR_NAME=Your Name                      # used in the system prompt
YOUR_BIO=A short bio describing you       # used in the system prompt
```

The model client points at DeepSeek's OpenAI-compatible endpoint (`https://api.deepseek.com/v1`). `YOUR_NAME` and `YOUR_BIO` are injected into the system prompt so posts sound like you.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a topic (e.g. "FlatList performance pitfalls"), optionally add an angle, and click **Generate draft**. Generation can take a while since the agent makes several search-and-write round trips.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run ESLint
```

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **OpenAI SDK** pointed at the DeepSeek API for the model
- **Tavily** for web search

## Notes

- Drafts are stored as plain JSON files on disk, so this is built to run locally. There's no database or auth.
- API keys are read server-side only; never commit `.env.local`.
