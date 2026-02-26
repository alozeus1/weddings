import type { BotCta, BotResponse } from "@/lib/chatbot-response";

export type ChatIntent =
  | "registry"
  | "wedding_date"
  | "wedding_location"
  | "couple"
  | "menu"
  | "dietary"
  | "rsvp"
  | "dress_code"
  | "ceremony"
  | "reception"
  | "after_party"
  | "upload"
  | "schedule"
  | "travel"
  | "colors"
  | "faq";

export type ChatCore = {
  weddingDate: string;
  weddingDateDisplay: string;
  timezone: string;
  city: string;
  coupleName?: string | null;
  ceremony: {
    venueName: string | null;
    address: string | null;
    time: string | null;
    startTime: string | null;
    endTime: string | null;
    dressCode: string | null;
  };
  reception: {
    venueName: string | null;
    address: string | null;
    time: string | null;
    startTime: string | null;
    endTime: string | null;
    dressCode: string | null;
  };
  afterParty: {
    location: string | null;
    time: string | null;
    startTime: string | null;
    endTime: string | null;
    dressCode: string | null;
  };
  colors: string | null;
  registry: {
    amazon: string | null;
    walmart: string | null;
    target: string | null;
  };
  rsvp: {
    deadline: string | null;
    passphrase: string | null;
    plusOnes: string | null;
    instructions: string | null;
  };
  uploads: {
    page: string | null;
    instructions: string | null;
  };
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

function requireValue(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toTxShort(city: string): string {
  if (city.toLowerCase().includes("el paso") && city.toLowerCase().includes("texas")) {
    return "El Paso, TX";
  }

  return city;
}

export function classifyIntent(question: string): ChatIntent {
  const q = normalize(question);

  const registryPatterns = ["registry", "gift", "gifts", "amazon", "walmart", "target", "honeymoon fund", "buy you"];
  const menuPatterns = ["menu", "food", "meal", "meals", "dinner", "lunch", "catering"];
  const dietaryPatterns = ["diet", "dietary", "allergy", "allergies", "vegetarian", "vegan", "gluten", "halal", "kosher"];
  const ceremonyPatterns = ["ceremony", "mass", "church"];
  const receptionPatterns = ["reception", "traditional", "trad"];
  const afterPartyPatterns = ["after party", "afterparty", "late night"];
  const dressPatterns = ["dress code", "attire", "what to wear", "outfit", "dresscode"];
  const uploadPatterns = ["upload", "photo", "photos", "qr", "gallery"];
  const rsvpPatterns = ["rsvp", "respond", "attendance", "plus one", "plus-one", "passphrase", "confirm"];
  const schedulePatterns = ["schedule", "timeline", "weekend", "agenda", "itinerary"];
  const travelPatterns = ["travel", "airport", "hotel", "parking", "transportation"];
  const colorPatterns = ["color", "colors", "theme"];
  const couplePatterns = ["who is getting married", "who s getting married", "bride", "groom", "couple"];
  const locationPatterns = ["where", "location", "venue", "address"];
  const datePatterns = ["when", "date", "what day", "time is the wedding", "wedding date", "day of the wedding", "what time"];

  if (hasAny(q, registryPatterns)) return "registry";
  if (hasAny(q, menuPatterns)) return "menu";
  if (hasAny(q, dietaryPatterns)) return "dietary";
  if (hasAny(q, ceremonyPatterns)) return "ceremony";
  if (hasAny(q, receptionPatterns)) return "reception";
  if (hasAny(q, afterPartyPatterns)) return "after_party";
  if (hasAny(q, dressPatterns)) return "dress_code";
  if (hasAny(q, uploadPatterns)) return "upload";
  if (hasAny(q, rsvpPatterns)) return "rsvp";
  if (hasAny(q, schedulePatterns)) return "schedule";
  if (hasAny(q, travelPatterns)) return "travel";
  if (hasAny(q, colorPatterns)) return "colors";
  if (hasAny(q, couplePatterns)) return "couple";
  if (hasAny(q, locationPatterns)) return "wedding_location";
  if (hasAny(q, datePatterns)) return "wedding_date";

  return "faq";
}

export function intentSuggestedPage(intent: ChatIntent): string {
  if (intent === "registry") return "/registry";
  if (intent === "rsvp") return "/rsvp";
  if (intent === "menu" || intent === "dietary") return "/rsvp";
  if (intent === "upload") return "/upload";
  if (intent === "travel") return "/travel";
  if (intent === "ceremony") return "/church";
  if (intent === "faq") return "/faq";
  return "/weekend";
}

export function registryCtas(core: ChatCore): BotCta[] {
  const ctas: BotCta[] = [];

  if (requireValue(core.registry.amazon)) {
    ctas.push({
      kind: "registry",
      label: "Registry: Amazon",
      url: core.registry.amazon as string,
      suggestedPage: "/registry"
    });
  }

  if (requireValue(core.registry.walmart)) {
    ctas.push({
      kind: "registry",
      label: "Registry: Walmart",
      url: core.registry.walmart as string,
      suggestedPage: "/registry"
    });
  }

  if (requireValue(core.registry.target)) {
    ctas.push({
      kind: "registry",
      label: "Registry: Target",
      url: core.registry.target as string,
      suggestedPage: "/registry"
    });
  }

  return ctas;
}

export function answerFromIntent(intent: ChatIntent, core: ChatCore): BotResponse | null {
  if (intent === "wedding_date") {
    if (!requireValue(core.weddingDateDisplay)) return null;
    return {
      text: `The wedding is on ${core.weddingDateDisplay} (${core.timezone}). Ceremony is ${core.ceremony.time || "TBD"} and reception is ${core.reception.time || "TBD"}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "wedding_location") {
    if (!requireValue(core.city) || !requireValue(core.ceremony.address) || !requireValue(core.reception.address)) return null;
    return {
      text: `The wedding is in ${toTxShort(core.city)}. Ceremony: ${core.ceremony.venueName || "TBD"}, ${core.ceremony.address}. Reception: ${core.reception.venueName || "TBD"}, ${core.reception.address}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "couple") {
    if (!requireValue(core.coupleName)) return null;
    return {
      text: `${core.coupleName} are getting married on ${core.weddingDateDisplay}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "ceremony") {
    if (!requireValue(core.ceremony.time) || !requireValue(core.ceremony.venueName) || !requireValue(core.ceremony.address)) return null;
    return {
      text: `Ceremony (Mass) is ${core.ceremony.time} at ${core.ceremony.venueName}, ${core.ceremony.address}. Dress code: ${core.ceremony.dressCode || "TBD"}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "reception") {
    if (!requireValue(core.reception.time) || !requireValue(core.reception.venueName) || !requireValue(core.reception.address)) return null;
    return {
      text: `Reception/Traditional is ${core.reception.time} at ${core.reception.venueName}, ${core.reception.address}. Dress code: ${core.reception.dressCode || "TBD"}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "after_party") {
    if (!requireValue(core.afterParty.time)) return null;
    return {
      text: `After party is ${core.afterParty.time}. Location: ${core.afterParty.location || "TBD"}. Dress code: ${core.afterParty.dressCode || "TBD"}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "dress_code") {
    if (!requireValue(core.ceremony.dressCode) && !requireValue(core.reception.dressCode) && !requireValue(core.afterParty.dressCode)) return null;
    return {
      text: `Dress codes: Ceremony - ${core.ceremony.dressCode || "TBD"}; Reception - ${core.reception.dressCode || "TBD"}; After party - ${core.afterParty.dressCode || "TBD"}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "menu") {
    return {
      text: "We’re finalizing the menu details and will share them soon. If you have dietary restrictions, please add them in your RSVP.",
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.8
    };
  }

  if (intent === "dietary") {
    return {
      text: "Please share dietary restrictions/allergies in your RSVP so we can plan accordingly.",
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.85
    };
  }

  if (intent === "rsvp") {
    const parts = [
      core.rsvp.deadline ? `RSVP deadline: ${core.rsvp.deadline}.` : null,
      core.rsvp.instructions ? `How to RSVP: ${core.rsvp.instructions}` : null,
      core.rsvp.plusOnes ? `Plus-ones: ${core.rsvp.plusOnes}.` : null
    ].filter((part): part is string => Boolean(part));

    if (parts.length === 0) return null;
    return {
      text: parts.join(" "),
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "registry") {
    const ctas = registryCtas(core);
    if (ctas.length === 0) return null;

    return {
      text: "You can use our registry links below.",
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95,
      ctas
    };
  }

  if (intent === "upload") {
    if (!requireValue(core.uploads.instructions) && !requireValue(core.uploads.page)) return null;
    return {
      text: `${core.uploads.instructions || "You can upload guest photos."}${core.uploads.page ? ` Use ${core.uploads.page}.` : ""}`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "schedule") {
    return {
      text: `Schedule summary: Ceremony ${core.ceremony.time || "TBD"}, Reception ${core.reception.time || "TBD"}, After party ${core.afterParty.time || "TBD"}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "travel") {
    return {
      text: "Travel details and local recommendations are on the Travel page.",
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  if (intent === "colors") {
    if (!requireValue(core.colors)) return null;
    return {
      text: `Colors of the day are ${core.colors}.`,
      suggestedPage: intentSuggestedPage(intent),
      confidence: 0.95
    };
  }

  return null;
}
