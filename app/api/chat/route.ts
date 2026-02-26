import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";

const KB_PATH = path.join(process.cwd(), "content", "chatbot_kb_optimized.json");
const UNKNOWN_ANSWER =
  "I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.";
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const OPENAI_MODEL = "gpt-4.1-mini";

type OptimizedKB = {
  meta: {
    version: string;
    updatedAt: string;
    couple: string;
    timezone: string;
    city: string;
    weddingDate: string;
  };
  facts: Array<{
    id: string;
    topic: string;
    text: string;
    tags: string[];
    suggestedPage: string;
  }>;
  qna: Array<{
    q: string;
    a: string;
    tags: string[];
    suggestedPage: string;
  }>;
  routingHints: Array<{
    match: string[];
    suggestedPage: string;
  }>;
  synonyms: Record<string, string[]>;
};

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

declare global {
  // eslint-disable-next-line no-var
  var weddingChatRateLimit: Map<string, RateLimitEntry> | undefined;
}

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000)
      })
    )
    .max(8)
    .optional()
});

let kbCache: OptimizedKB | null = null;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const map = globalThis.weddingChatRateLimit || new Map<string, RateLimitEntry>();
  globalThis.weddingChatRateLimit = map;

  const current = map.get(ip);
  if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
    map.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  map.set(ip, { count: current.count + 1, windowStart: current.windowStart });
  return false;
}

async function loadOptimizedKB(): Promise<OptimizedKB> {
  if (kbCache) {
    return kbCache;
  }

  const raw = await readFile(KB_PATH, "utf-8");
  kbCache = JSON.parse(raw) as OptimizedKB;
  return kbCache;
}

function resolveSuggestedPage(question: string, kb: OptimizedKB): string | null {
  const normalizedQuestion = normalizeText(question);

  for (const hint of kb.routingHints) {
    for (const match of hint.match) {
      if (normalizedQuestion.includes(normalizeText(match))) {
        return hint.suggestedPage;
      }
    }
  }

  return null;
}

function expandWithSynonyms(tokens: string[], kb: OptimizedKB): Set<string> {
  const expanded = new Set(tokens);
  const normalizedJoined = ` ${tokens.join(" ")} `;

  for (const [key, values] of Object.entries(kb.synonyms)) {
    const normalizedKey = normalizeText(key).replace(/_/g, " ");

    for (const value of values) {
      const normalizedValue = normalizeText(value);
      if (normalizedValue && normalizedJoined.includes(` ${normalizedValue} `)) {
        expanded.add(normalizedKey);
      }
    }

    if (normalizedJoined.includes(` ${normalizedKey} `)) {
      expanded.add(normalizedKey);
    }
  }

  return expanded;
}

function scoreQna(question: string, qna: OptimizedKB["qna"][number], expandedTokens: Set<string>): number {
  const normalizedQuestion = normalizeText(question);
  const normalizedQnaQuestion = normalizeText(qna.q);

  if (normalizedQuestion === normalizedQnaQuestion) {
    return 1;
  }

  if (normalizedQnaQuestion.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedQnaQuestion)) {
    return 0.9;
  }

  const qnaTokens = new Set(tokenize(qna.q));
  let overlap = 0;
  for (const token of expandedTokens) {
    if (qnaTokens.has(token)) {
      overlap += 1;
    }
  }

  const tokenScore = overlap / Math.max(1, qnaTokens.size);
  const tagScore = qna.tags.some((tag) => normalizedQuestion.includes(normalizeText(tag))) ? 0.2 : 0;
  return tokenScore + tagScore;
}

function findDirectQnaMatch(question: string, kb: OptimizedKB, expandedTokens: Set<string>): OptimizedKB["qna"][number] | null {
  const ranked = kb.qna
    .map((item) => ({ item, score: scoreQna(question, item, expandedTokens) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0] && ranked[0].score >= 0.75) {
    return ranked[0].item;
  }

  return null;
}

function retrieveFacts(question: string, kb: OptimizedKB, expandedTokens: Set<string>): OptimizedKB["facts"] {
  const normalizedQuestion = normalizeText(question);

  const ranked = kb.facts
    .map((fact) => {
      const normalizedFactText = normalizeText(fact.text);
      const normalizedTopic = normalizeText(fact.topic);
      const normalizedTags = fact.tags.map((tag) => normalizeText(tag));

      let score = 0;

      for (const token of expandedTokens) {
        if (normalizedTags.some((tag) => tag.includes(token))) {
          score += 2;
        }

        if (normalizedTopic.includes(token)) {
          score += 1.5;
        }

        if (normalizedFactText.includes(token)) {
          score += 1;
        }
      }

      if (normalizedQuestion.includes(normalizedTopic)) {
        score += 1;
      }

      return { fact, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.fact);

  return ranked;
}

function containsSensitiveRequest(question: string): boolean {
  const normalized = normalizeText(question);
  const sensitiveTerms = [
    "admin password",
    "rsvp passphrase",
    "database url",
    "cloudinary",
    "guest list",
    "invite request",
    "secrets",
    "api key"
  ];

  return sensitiveTerms.some((term) => normalized.includes(term));
}

async function getGroundedAnswerWithOpenAI(params: {
  apiKey: string;
  question: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  facts: OptimizedKB["facts"];
  qna: OptimizedKB["qna"];
}): Promise<string | null> {
  const factsText = params.facts.map((fact) => `- [${fact.id}] ${fact.text}`).join("\n");
  const qnaText = params.qna
    .slice(0, 5)
    .map((item) => `- Q: ${item.q}\n  A: ${item.a}`)
    .join("\n");

  const systemPrompt = [
    "You are a wedding FAQ assistant.",
    "You MUST only use the provided KB snippets.",
    "If the snippets do not contain the answer, return exactly:",
    `\"${UNKNOWN_ANSWER}\"`,
    "Never reveal secrets or private data.",
    "Keep the final answer concise (max 2 short sentences).",
    "KB facts:",
    factsText,
    "KB QnA:",
    qnaText
  ].join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      max_output_tokens: 180,
      input: [
        {
          role: "system",
          content: [{ type: "text", text: systemPrompt }]
        },
        ...params.history.map((message) => ({
          role: message.role,
          content: [{ type: "text", text: message.content }]
        })),
        {
          role: "user",
          content: [{ type: "text", text: params.question }]
        }
      ]
    })
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      typeof payload?.error === "object" &&
      payload.error &&
      typeof (payload.error as { message?: unknown }).message === "string"
        ? ((payload.error as { message: string }).message as string)
        : "Unknown OpenAI error";

    console.error("[api/chat] OpenAI request failed", {
      status: response.status,
      message
    });

    return null;
  }

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  const parts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as { content?: unknown }).content) ? ((item as { content: unknown[] }).content as unknown[]) : [];

    for (const segment of content) {
      if (!segment || typeof segment !== "object") {
        continue;
      }

      const text = (segment as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        parts.push(text.trim());
      }
    }
  }

  const combined = parts.join("\n").trim();
  return combined || null;
}

function isGroundedAnswer(answer: string, facts: OptimizedKB["facts"], qna: OptimizedKB["qna"]): boolean {
  const answerTokens = tokenize(answer);
  if (answerTokens.length === 0) {
    return false;
  }

  const context = normalizeText(
    `${facts.map((fact) => fact.text).join(" ")} ${qna.map((item) => `${item.q} ${item.a}`).join(" ")}`
  );

  let overlap = 0;
  for (const token of answerTokens) {
    if (token.length < 3) {
      continue;
    }

    if (context.includes(token)) {
      overlap += 1;
    }
  }

  return overlap >= 2 || answer === UNKNOWN_ANSWER;
}

export async function POST(request: Request): Promise<Response> {
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        answer: "Too many chat requests right now. Please wait a minute and try again.",
        suggestedPage: "/faq",
        confidence: 0.3
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const kb = await loadOptimizedKB();
    const suggestedFromHint = resolveSuggestedPage(parsed.message, kb);

    if (containsSensitiveRequest(parsed.message)) {
      return NextResponse.json({
        answer: UNKNOWN_ANSWER,
        suggestedPage: suggestedFromHint,
        confidence: 0.3
      });
    }

    const tokens = tokenize(parsed.message);
    const expandedTokens = expandWithSynonyms(tokens, kb);

    const directQna = findDirectQnaMatch(parsed.message, kb, expandedTokens);
    if (directQna) {
      return NextResponse.json({
        answer: directQna.a,
        suggestedPage: directQna.suggestedPage || suggestedFromHint,
        confidence: 0.9
      });
    }

    const facts = retrieveFacts(parsed.message, kb, expandedTokens);
    if (facts.length === 0) {
      return NextResponse.json({
        answer: UNKNOWN_ANSWER,
        suggestedPage: suggestedFromHint,
        confidence: 0.3
      });
    }

    const relatedQna = kb.qna.filter((item) => item.tags.some((tag) => expandedTokens.has(normalizeText(tag).replace(/\s+/g, " "))));
    const apiKey = process.env.OPENAI_API_KEY;

    let answer: string | null = null;

    if (apiKey) {
      answer = await getGroundedAnswerWithOpenAI({
        apiKey,
        question: parsed.message,
        history: parsed.history || [],
        facts,
        qna: relatedQna
      });
    }

    if (!answer) {
      answer = facts[0]?.text || UNKNOWN_ANSWER;
    }

    if (answer !== UNKNOWN_ANSWER && answer.trim().length === 0) {
      answer = UNKNOWN_ANSWER;
    }

    if (answer !== UNKNOWN_ANSWER && !isGroundedAnswer(answer, facts, relatedQna)) {
      answer = facts[0]?.text || UNKNOWN_ANSWER;
    }

    return NextResponse.json({
      answer,
      suggestedPage: facts[0]?.suggestedPage || suggestedFromHint,
      confidence: answer === UNKNOWN_ANSWER ? 0.3 : 0.7
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.error("[api/chat] Failed to process chat request.", error);
    return NextResponse.json(
      {
        answer: UNKNOWN_ANSWER,
        suggestedPage: "/faq",
        confidence: 0.3
      },
      { status: 500 }
    );
  }
}
