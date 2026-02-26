# Wedding Chatbot

## Knowledge Base Files
- Preferred source KB: `content/chatbot_kb_source.md`
- Optional legacy source KB: `content/chatbot_kb_source.json`
- Chat-optimized KB: `content/chatbot_kb_optimized.json`

Runtime chat uses only `content/chatbot_kb_optimized.json`.

## Update Workflow
1. Edit `content/chatbot_kb_source.md`.
2. Keep facts and FAQs short, explicit, and grounded in real wedding details.
2. Rebuild optimized KB:

```bash
npm run build:chatbot-kb
```

3. Run checks:

```bash
npm run typecheck
npm run test:e2e
```

If both `.md` and `.json` source files exist, the build script prefers `.md`.

## No-Hallucination Guardrails
- API retrieval uses only `facts` and `qna` from the optimized KB.
- Direct QnA match is returned as-is.
- Fact-based answers only use retrieved facts.
- Unknowns return the exact fallback:
  `I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.`
- Sensitive topics (secrets/private data/guest list requests) are denied with the same fallback.

## Environment Variables
- `OPENAI_API_KEY` (server-only)

If `OPENAI_API_KEY` is unavailable, the API still falls back to deterministic fact-based responses without using external model output.
