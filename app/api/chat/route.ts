import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ChatIntent } from "@/lib/chatbot-intent";
import { buildChatbotReply } from "@/lib/chatbot-kb";
import type { BotResponse } from "@/lib/chatbot-response";
import type { ChatbotOptimizedKB } from "@/types/chatbot";

const KB_PATH = path.join(process.cwd(), "content", "chatbot_kb_optimized.json");
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

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

let kbCache: ChatbotOptimizedKB | null = null;
class KnowledgeBaseLoadError extends Error {}

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

async function loadOptimizedKB(): Promise<ChatbotOptimizedKB> {
  if (kbCache) {
    return kbCache;
  }

  try {
    const raw = await readFile(KB_PATH, "utf-8");
    kbCache = JSON.parse(raw) as ChatbotOptimizedKB;
    return kbCache;
  } catch (error) {
    console.error("[api/chat] Failed to load optimized chatbot KB.", {
      message: error instanceof Error ? error.message : "Unknown KB load error"
    });
    throw new KnowledgeBaseLoadError("Unable to load chatbot knowledge base.");
  }
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

function enrichKbFailureResponse(response: BotResponse, intent: ChatIntent): BotResponse & { answer: string } {
  return {
    ...enrichResponse(response, intent),
    debug: {
      ...response.debug,
      intent,
      confidence: response.confidence,
      kbStatus: "load_failed"
    }
  };
}

export async function POST(request: Request): Promise<Response> {
  let intent: ChatIntent = "faq";

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
    const kb = await loadOptimizedKB();
    const reply = buildChatbotReply(parsed.message, kb);
    intent = reply.intent;

    return NextResponse.json(enrichResponse(reply.response, intent));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (error instanceof KnowledgeBaseLoadError) {
      return NextResponse.json(
        enrichKbFailureResponse(
          {
            text: "I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.",
            suggestedPage: "/faq",
            confidence: 0.3
          },
          intent
        ),
        { status: 500 }
      );
    }

    console.error("[api/chat] Failed to process chat request.", error);
    return NextResponse.json(
      enrichResponse(
        {
          text: "I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.",
          suggestedPage: "/faq",
          confidence: 0.3
        },
        "faq"
      ),
      { status: 500 }
    );
  }
}
