import {
  answerFromIntent,
  classifyIntent,
  intentSuggestedPage,
  registryCtas,
  type ChatCore,
  type ChatIntent
} from "./chatbot-intent";
import type { BotLink, BotResponse } from "./chatbot-response";
import type { ChatbotFact, ChatbotOptimizedKB, ChatbotQna } from "../types/chatbot";

const UNKNOWN_ANSWER =
  "I don’t have that information yet. Please check the website pages (Weekend/Travel/FAQ) or contact the couple.";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "day",
  "do",
  "for",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "the",
  "to",
  "what",
  "when",
  "where",
  "who",
  "with",
  "your"
]);

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/church": "Church",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/gallery": "Gallery",
  "/live-gallery": "Live Gallery",
  "/our-story": "Our Story",
  "/registry": "Registry",
  "/rsvp": "RSVP",
  "/travel": "Travel",
  "/upload": "Upload",
  "/weekend": "Weekend"
};

type ScoredFact = {
  fact: ChatbotFact;
  score: number;
};

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
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function normalizeTopic(topic: string): string {
  return normalizeText(topic).replace(/\s+/g, " ");
}

function isInternalRoute(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith("/");
}

function buildRouteLink(url: string): BotLink {
  return {
    label: ROUTE_LABELS[url] ?? url,
    url
  };
}

function expandWithSynonyms(tokens: string[], kb: ChatbotOptimizedKB): Set<string> {
  const expanded = new Set(tokens);
  const joined = ` ${tokens.join(" ")} `;

  for (const [key, values] of Object.entries(kb.synonyms)) {
    const normalizedKey = normalizeText(key).replace(/_/g, " ");

    if (joined.includes(` ${normalizedKey} `)) {
      expanded.add(normalizedKey);
    }

    for (const value of values) {
      const normalizedValue = normalizeText(value);
      if (normalizedValue && joined.includes(` ${normalizedValue} `)) {
        expanded.add(normalizedKey);
      }
    }
  }

  return expanded;
}

function routeMatchesQuestion(question: string, kb: ChatbotOptimizedKB): string[] {
  const normalized = ` ${normalizeText(question)} `;

  return kb.routingHints
    .filter((hint) => hint.match.some((candidate) => normalized.includes(` ${normalizeText(candidate)} `)))
    .map((hint) => hint.suggestedPage);
}

function buildSuggestedLinks(question: string, kb: ChatbotOptimizedKB, primaryPage: string | null, intent: ChatIntent): BotLink[] | undefined {
  const pages = new Set<string>();

  if (isInternalRoute(primaryPage)) {
    pages.add(primaryPage);
  }

  const intentPage = intentSuggestedPage(intent);
  if (isInternalRoute(intentPage)) {
    pages.add(intentPage);
  }

  for (const page of routeMatchesQuestion(question, kb)) {
    if (isInternalRoute(page)) {
      pages.add(page);
    }
  }

  const links = [...pages].slice(0, 3).map(buildRouteLink);
  return links.length > 0 ? links : undefined;
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

function isRegistryQuestion(question: string): boolean {
  const normalized = normalizeText(question);
  return ["registry", "gift", "gifts", "amazon", "walmart", "target", "honeymoon"].some((term) => normalized.includes(term));
}

function allowsRegistryContent(question: string): boolean {
  return isRegistryQuestion(question);
}

function allowsColorContent(question: string): boolean {
  const normalized = normalizeText(question);
  return ["color", "colors", "theme"].some((term) => normalized.includes(term));
}

function isRegistryRecord(item: { topic?: string; suggestedPage?: string; text: string }): boolean {
  const combined = normalizeText(`${item.topic || ""} ${item.suggestedPage || ""} ${item.text}`);
  return ["registry", "amazon", "walmart", "target"].some((value) => combined.includes(value));
}

function isColorRecord(item: { topic?: string; suggestedPage?: string; text: string }): boolean {
  const combined = normalizeText(`${item.topic || ""} ${item.suggestedPage || ""} ${item.text}`);
  return combined.includes("colors") || combined.includes("sage green") || combined.includes("dusty pink");
}

function scoreQna(question: string, item: ChatbotQna, expandedTokens: Set<string>, intent: ChatIntent): number {
  const normalizedQuestion = normalizeText(question);
  const normalizedItemQuestion = normalizeText(item.q);
  const suggestedByIntent = intentSuggestedPage(intent);

  if (normalizedQuestion === normalizedItemQuestion) {
    return 1.5;
  }

  let score = 0;

  if (normalizedItemQuestion.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedItemQuestion)) {
    score += 0.7;
  }

  const overlaps = tokenize(item.q).filter((token) => expandedTokens.has(token)).length;
  score += overlaps / Math.max(1, tokenize(item.q).length);

  if (item.tags.some((tag) => expandedTokens.has(normalizeText(tag)))) {
    score += 0.25;
  }

  if (item.suggestedPage === suggestedByIntent) {
    score += 0.15;
  }

  return score;
}

function findDirectQnaMatch(question: string, kb: ChatbotOptimizedKB, expandedTokens: Set<string>, intent: ChatIntent): ChatbotQna | null {
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
    .map((item) => ({ item, score: scoreQna(question, item, expandedTokens, intent) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0] && ranked[0].score >= 0.8) {
    return ranked[0].item;
  }

  return null;
}

function boostByIntent(intent: ChatIntent, fact: ChatbotFact): number {
  const topic = normalizeTopic(fact.topic);
  const page = fact.suggestedPage;

  if (intent === "ceremony" && (topic.includes("ceremony") || page === "/church")) return 1.5;
  if (intent === "reception" && topic.includes("reception")) return 1.5;
  if (intent === "after_party" && topic.includes("after party")) return 1.5;
  if (intent === "rsvp" && topic.includes("rsvp")) return 1.5;
  if (intent === "upload" && page === "/upload") return 1.5;
  if (intent === "travel" && page === "/travel") return 1.5;
  if (intent === "dress_code" && fact.text.toLowerCase().includes("dress code")) return 1.5;
  if (intent === "colors" && topic.includes("colors")) return 1.5;

  return 0;
}

function retrieveFacts(question: string, kb: ChatbotOptimizedKB, expandedTokens: Set<string>, intent: ChatIntent): ScoredFact[] {
  const allowRegistry = allowsRegistryContent(question);
  const allowColors = allowsColorContent(question);

  return kb.facts
    .filter((fact) => {
      if (!allowRegistry && isRegistryRecord(fact)) return false;
      if (!allowColors && isColorRecord(fact)) return false;
      return true;
    })
    .map((fact) => {
      const tags = fact.tags.map((tag) => normalizeText(tag));
      const text = normalizeText(fact.text);
      const topic = normalizeTopic(fact.topic);

      let score = boostByIntent(intent, fact);

      for (const token of expandedTokens) {
        if (tags.some((tag) => tag.includes(token))) {
          score += 2;
        }

        if (text.includes(token)) {
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
    .slice(0, 3);
}

function shouldJoinFacts(first: ChatbotFact, second: ChatbotFact): boolean {
  if (first.suggestedPage && second.suggestedPage && first.suggestedPage === second.suggestedPage) {
    return true;
  }

  return normalizeTopic(first.topic) === normalizeTopic(second.topic);
}

function composeFactAnswer(facts: ScoredFact[]): { text: string; suggestedPage: string } {
  const best = facts[0]?.fact;
  const second = facts[1]?.fact;
  const third = facts[2]?.fact;

  if (!best) {
    return {
      text: UNKNOWN_ANSWER,
      suggestedPage: "/faq"
    };
  }

  const parts = [best.text];

  if (second && shouldJoinFacts(best, second)) {
    parts.push(second.text);
  }

  if (third && shouldJoinFacts(best, third) && !parts.includes(third.text)) {
    parts.push(third.text);
  }

  return {
    text: parts.join(" "),
    suggestedPage: best.suggestedPage || second?.suggestedPage || third?.suggestedPage || "/faq"
  };
}

function applyRegistryCtas(response: BotResponse, question: string, core: ChatCore): BotResponse {
  if (!isRegistryQuestion(question)) {
    return response;
  }

  const ctas = registryCtas(core);
  return ctas.length > 0 ? { ...response, ctas } : response;
}

function applyInternalLinks(response: BotResponse, question: string, kb: ChatbotOptimizedKB, intent: ChatIntent): BotResponse {
  return {
    ...response,
    links: buildSuggestedLinks(question, kb, response.suggestedPage, intent)
  };
}

function fallbackResponse(intent: ChatIntent, kb: ChatbotOptimizedKB, question: string): BotResponse {
  return applyInternalLinks(
    {
      text: UNKNOWN_ANSWER,
      suggestedPage: routeMatchesQuestion(question, kb)[0] || intentSuggestedPage(intent),
      confidence: 0.3
    },
    question,
    kb,
    intent
  );
}

function wantsStructuredIntentReply(question: string, intent: ChatIntent): boolean {
  const normalized = normalizeText(question);
  const asksForLocation = ["where", "location", "address", "venue"].some((term) => normalized.includes(term));

  return asksForLocation && ["ceremony", "reception", "after_party", "wedding_location"].includes(intent);
}

function shouldPreferIntentAnswer(intent: ChatIntent): boolean {
  return intent === "wedding_date" || intent === "wedding_location" || intent === "couple";
}

export function buildChatbotReply(question: string, kb: ChatbotOptimizedKB): { intent: ChatIntent; response: BotResponse } {
  const intent = classifyIntent(question);

  if (containsSensitiveRequest(question)) {
    return {
      intent,
      response: fallbackResponse(intent, kb, question)
    };
  }

  const core: ChatCore = {
    ...kb.core,
    coupleName: kb.meta.couple || kb.core.coupleName || null
  };

  const tokens = tokenize(question);
  const expandedTokens = expandWithSynonyms(tokens, kb);
  const directQna = findDirectQnaMatch(question, kb, expandedTokens, intent);
  const intentAnswer = answerFromIntent(intent, core);

  if (intentAnswer && shouldPreferIntentAnswer(intent)) {
    return {
      intent,
      response: applyRegistryCtas(applyInternalLinks(intentAnswer, question, kb, intent), question, core)
    };
  }

  if (intentAnswer && wantsStructuredIntentReply(question, intent)) {
    return {
      intent,
      response: applyRegistryCtas(applyInternalLinks(intentAnswer, question, kb, intent), question, core)
    };
  }

  if (directQna) {
    return {
      intent,
      response: applyRegistryCtas(
        applyInternalLinks(
          {
            text: directQna.a,
            suggestedPage: directQna.suggestedPage || intentSuggestedPage(intent),
            confidence: 0.9
          },
          question,
          kb,
          intent
        ),
        question,
        core
      )
    };
  }

  if (intentAnswer) {
    return {
      intent,
      response: applyRegistryCtas(applyInternalLinks(intentAnswer, question, kb, intent), question, core)
    };
  }

  const facts = retrieveFacts(question, kb, expandedTokens, intent);
  if (facts.length > 0) {
    const factAnswer = composeFactAnswer(facts);
    return {
      intent,
      response: applyRegistryCtas(
        applyInternalLinks(
          {
            text: factAnswer.text,
            suggestedPage: factAnswer.suggestedPage,
            confidence: 0.65
          },
          question,
          kb,
          intent
        ),
        question,
        core
      )
    };
  }

  return {
    intent,
    response: fallbackResponse(intent, kb, question)
  };
}
