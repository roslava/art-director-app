# Art Director

Art Director is an AI-assisted visual-production workspace. It guides a project from research through art direction, shot planning, generation, critique, revision, and export—while keeping factual subject knowledge separate from creative decisions.

The initial experience is a mock Samotsvety mineral-catalog project featuring Chrysoberyl. It is a local, server-rendered foundation with no database, authentication, or live AI calls.

## Stack

- Next.js App Router, TypeScript, React, and Tailwind CSS
- Zod for domain contracts and future AI-output validation
- OpenAI SDK installed for a future server-only provider adapter

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For future server-side AI work, copy `.env.example` to a local env file and set `OPENAI_API_KEY`. Never expose this value through a `NEXT_PUBLIC_` variable or browser code.

## Commands

```bash
npm run lint
npm run build
```

See [architecture](docs/ARCHITECTURE.md) and the [MVP scope](docs/MVP.md) for the intended evolution of the app.
