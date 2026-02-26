import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { answerFromIntent, classifyIntent, intentSuggestedPage, type ChatCore, type ChatIntent } from "@/lib/chatbot-intent";
import type { BotCta, BotResponse } from "@/lib/chatbot-response";

const KB_PATH = path.join(process.cwd(), "content", "chatbot_kb_optimized.json");
const UNKNOWN_ANSWER =
  "I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.";
const FINALIZING_ANSWER = "We’re finalizing that detail—check back soon or see /weekend or /travel.";
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

type OptimizedKB = {
  meta: {
    version: string;
    updatedAt: string;
    couple: string;
    timezone: string;
    city: string;
    weddingDate: string;
  };
  core: ChatCore;
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

function containsSensitiveRequest(question: string): boolean {
  const normalized = normalizeText(question);
  const sensitiveTerms = [
    "admin password",
    "database url",
    "cloudinary",
    "guest list",
    "invite request",
    "secrets",
    "api key"
  ];

  return sensitiveTerms.some((term) => normalized.includes(term));
}

function expandWithSynonyms(tokens: string[], kb: OptimizedKB): Set<string> {
  const expanded = new Set(tokens);
  const joined = ` ${tokens.join(" ")} `;

  for (const [key, values] of Object.entries(kb.synonyms)) {
    const normalizedKey = normalizeText(key).replace(/_/g, " ");

    for (const value of values) {
      const normalizedValue = normalizeText(value);
      if (normalizedValue && joined.includes(` ${normalizedValue} `)) {
        expanded.add(normalizedKey);
      }
    }

    if (joined.includes(` ${normalizedKey} `)) {
      expanded.add(normalizedKey);
    }
  }

  return expanded;
}

function mentionsRegistry(question: string): boolean {
  const normalized = normalizeText(question);
  return ["registry", "gift", "gifts", "amazon", "walmart", "target", "honeymoon fund", "buy you"].some((value) =>
    normalized.includes(value)
  );
}

function mentionsColors(question: string): boolean {
  const normalized = normalizeText(question);
  return ["color", "colors", "theme"].some((value) => normalized.includes(value));
}

function allowsRegistryContent(question: string): boolean {
  return mentionsRegistry(question);
}

function allowsColorContent(question: string): boolean {
  return mentionsColors(question);
}

function isRegistryRecord(item: { topic?: string; suggestedPage?: string; text: string }): boolean {
  const combined = normalizeText(`${item.topic || ""} ${item.suggestedPage || ""} ${item.text}`);
  return ["registry", "amazon", "walmart", "target"].some((value) => combined.includes(value));
}

function isColorRecord(item: { topic?: string; suggestedPage?: string; text: string }): boolean {
  const combined = normalizeText(`${item.topic || ""} ${item.suggestedPage || ""} ${item.text}`);
  return combined.includes("colors") || combined.includes("sage green") || combined.includes("dusty pink");
}

function scoreQna(question: string, item: OptimizedKB["qna"][number], expandedTokens: Set<string>): number {
  const normalizedQuestion = normalizeText(question);
  const normalizedItemQ = normalizeText(item.q);

  if (normalizedQuestion === normalizedItemQ) {
    return 1;
  }

  let score = 0;
  if (normalizedItemQ.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedItemQ)) {
    score += 0.6;
  }

  const qTokens = tokenize(item.q);
  const overlaps = qTokens.filter((token) => expandedTokens.has(token)).length;
  score += overlaps / Math.max(1, qTokens.length);

  if (item.tags.some((tag) => expandedTokens.has(normalizeText(tag)))) {
    score += 0.2;
  }

  return score;
}

function findDirectQnaMatch(question: string, kb: OptimizedKB, expandedTokens: Set<string>): OptimizedKB["qna"][number] | null {
  const allowRegistry = allowsRegistryContent(question);
  const allowColors = allowsColorContent(question);

  const ranked = kb.qna
    .filter((item) => {
      if (!allowRegistry && isRegistryRecord({ topic: "", suggestedPage: item.suggestedPage, text: `${item.q} ${item.a}` })) {
        return false;
      }

      if (!allowColors && isColorRecord({ topic: "", suggestedPage: item.suggestedPage, text: `${item.q} ${item.a}` })) {
        return false;
      }

      return true;
    })
    .map((item) => ({ item, score: scoreQna(question, item, expandedTokens) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0] && ranked[0].score >= 0.8) {
    return ranked[0].item;
  }

  return null;
}

function retrieveFacts(question: string, kb: OptimizedKB, expandedTokens: Set<string>): OptimizedKB["facts"] {
  const allowRegistry = allowsRegistryContent(question);
  const allowColors = allowsColorContent(question);

  const ranked = kb.facts
    .filter((fact) => {
      if (!allowRegistry && isRegistryRecord(fact)) return false;
      if (!allowColors && isColorRecord(fact)) return false;
      return true;
    })
    .map((fact) => {
      const tags = fact.tags.map((tag) => normalizeText(tag));
      const factText = normalizeText(fact.text);
      const topic = normalizeText(fact.topic);

      let score = 0;
      for (const token of expandedTokens) {
        if (tags.some((tag) => tag.includes(token))) {
          score += 2;
        }

        if (factText.includes(token)) {
          score += 1;
        }

        if (topic.includes(token)) {
          score += 1;
        }
      }

      return { fact, score };
    })
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.fact);

  return ranked;
}

function enrichResponse(response: BotResponse, intent: ChatIntent): BotResponse & { answer: string } {
  return {
    ...response,
    answer: response.text,
    debug: {
      ...response.debug,
      intent,
      confidence: response.confidence
    }
  };
}

function generalHelpCtas(): BotCta[] {
  return [
    { kind: "schedule", label: "View Schedule", url: "/weekend", suggestedPage: "/weekend" },
    { kind: "travel", label: "Travel Info", url: "/travel", suggestedPage: "/travel" },
    { kind: "rsvp", label: "RSVP", url: "/rsvp", suggestedPage: "/rsvp" }
  ];
}

function fallbackResponse(intent: ChatIntent): BotResponse {
  if (intent === "wedding_date" || intent === "wedding_location" || intent === "couple") {
    return {
      text: FINALIZING_ANSWER,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.3
    };
  }

  return {
    text: UNKNOWN_ANSWER,
    suggestedPage: intentSuggestedPage(intent),
    confidence: 0.3,
    ctas: intent === "faq" ? generalHelpCtas() : undefined
  };
}

export async function POST(request: Request): Promise<Response> {
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      enrichResponse(
        {
          text: "Too many chat requests right now. Please wait a minute and try again.",
          suggestedPage: "/faq",
          confidence: 0.3
        },
        "faq"
      ),
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const intent = classifyIntent(parsed.message);

    if (containsSensitiveRequest(parsed.message)) {
      return NextResponse.json(enrichResponse(fallbackResponse(intent), intent));
    }

    const kb = await loadOptimizedKB();
    const core: ChatCore = {
      ...kb.core,
      coupleName: kb.meta.couple || kb.core.coupleName || null
    };

    const intentAnswer = answerFromIntent(intent, core);
    if (intentAnswer) {
      return NextResponse.json(enrichResponse(intentAnswer, intent));
    }

    if (intent !== "faq") {
      return NextResponse.json(enrichResponse(fallbackResponse(intent), intent));
    }

    const tokens = tokenize(parsed.message);
    const expandedTokens = expandWithSynonyms(tokens, kb);

    const directQna = findDirectQnaMatch(parsed.message, kb, expandedTokens);
    if (directQna) {
      return NextResponse.json(
        enrichResponse(
          {
            text: directQna.a,
            suggestedPage: directQna.suggestedPage || intentSuggestedPage(intent),
            confidence: 0.8
          },
          intent
        )
      );
    }

    const facts = retrieveFacts(parsed.message, kb, expandedTokens);
    if (facts.length === 0) {
      return NextResponse.json(enrichResponse(fallbackResponse(intent), intent));
    }

    const answer = facts
      .slice(0, 2)
      .map((fact) => fact.text)
      .join(" ");

    return NextResponse.json(
      enrichResponse(
        {
          text: answer,
          suggestedPage: facts[0]?.suggestedPage || intentSuggestedPage(intent),
          confidence: 0.6
        },
        intent
      )
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.error("[api/chat] Failed to process chat request.", error);
    return NextResponse.json(enrichResponse(fallbackResponse("faq"), "faq"), { status: 500 });
  }
}
