# Wedding Chatbot

## Knowledge Base Files
- Preferred source KB: `content/chatbot_kb_source.md`
- Optional legacy source KB: `content/chatbot_kb_source.json`
- Chat-optimized KB: `content/chatbot_kb_optimized.json`

Runtime chat uses only `content/chatbot_kb_optimized.json`, loaded by `/app/api/chat/route.ts` through `lib/chatbot-kb.ts`.
Selected guest-facing intake details are also surfaced into the live site via `lib/content.ts`.

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
npm run test
npm run test:e2e
```

If both `.md` and `.json` source files exist, the build script prefers `.md`.

## No-Hallucination Guardrails
- API retrieval uses only `core`, `facts`, `qna`, and `routingHints` from the optimized KB.
- Direct QnA match is returned as-is.
- Structured intent answers are derived from the KB `core` object.
- Fact-based answers only use retrieved facts.
- Internal page suggestions are generated from `suggestedPage` plus `routingHints`.
- Unknowns return the exact fallback:
  `I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.`
- Sensitive topics (secrets/private data/guest list requests) are denied with the same fallback.

## Notes
- `content/chatbot_kb_source.md` is the editable source of truth for chatbot content.
- `content/chatbot_kb_optimized.json` is the runtime artifact consumed by the app.
- The chatbot is deterministic and KB-backed; it does not require model-generated answers to respond.
