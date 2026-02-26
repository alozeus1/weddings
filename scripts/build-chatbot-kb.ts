import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Fact = {
  id: string;
  topic: string;
  text: string;
  tags: string[];
  suggestedPage: string;
};

type QnA = {
  q: string;
  a: string;
  tags: string[];
  suggestedPage: string;
};

type RoutingHint = {
  match: string[];
  suggestedPage: string;
};

type SourceModel = {
  meta: {
    version: string;
    couple: string;
    timezone: string;
    weddingDate: string;
    city: string;
    hashtag?: string;
    updatedAt?: string;
  };
  factSections: Array<{ section: string; bullets: string[] }>;
  faqs: Array<{ q: string; a: string; suggestedPage?: string }>;
  stories: Array<{ title: string; text: string }>;
  routingHints: RoutingHint[];
};

type CoreScheduleItem = {
  venueName: string | null;
  address: string | null;
  time: string | null;
  startTime: string | null;
  endTime: string | null;
  dressCode: string | null;
};

type CoreAfterPartyItem = {
  location: string | null;
  time: string | null;
  startTime: string | null;
  endTime: string | null;
  dressCode: string | null;
};

type CoreModel = {
  weddingDate: string;
  weddingDateDisplay: string;
  timezone: string;
  city: string;
  ceremony: CoreScheduleItem;
  reception: CoreScheduleItem;
  afterParty: CoreAfterPartyItem;
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

const SOURCE_MD_PATH = path.join(process.cwd(), "content", "chatbot_kb_source.md");
const SOURCE_JSON_PATH = path.join(process.cwd(), "content", "chatbot_kb_source.json");
const OUTPUT_PATH = path.join(process.cwd(), "content", "chatbot_kb_optimized.json");

const defaultRoutingHints: RoutingHint[] = [
  { match: ["rsvp", "passphrase", "confirm attendance"], suggestedPage: "/rsvp" },
  { match: ["dress code", "attire", "what to wear"], suggestedPage: "/weekend" },
  { match: ["church", "mass", "ceremony"], suggestedPage: "/church" },
  { match: ["reception", "traditional", "after party", "schedule"], suggestedPage: "/weekend" },
  { match: ["travel", "airport", "hotel", "things to do", "parking"], suggestedPage: "/travel" },
  { match: ["registry", "gift", "walmart", "target", "amazon"], suggestedPage: "/registry" },
  { match: ["photos", "upload", "qr"], suggestedPage: "/upload" }
];

const synonyms = {
  ceremony: ["mass", "church wedding", "wedding mass"],
  reception: ["traditional", "trad", "party"],
  after_party: ["afterparty", "late night"],
  dress_code: ["attire", "what to wear", "outfit"]
};

function cleanValue(value: string): string {
  return value.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeId(value: string): string {
  return normalizeText(value).replace(/\s+/g, "_").replace(/^_+|_+$/g, "");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function formatDateDisplay(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function toIso(updatedAt: string | undefined, weddingDate: string): string {
  if (updatedAt) {
    return new Date(updatedAt).toISOString();
  }

  return new Date(`${weddingDate}T00:00:00.000Z`).toISOString();
}

function inferSuggestedPage(section: string): string {
  const normalized = normalizeText(section);

  if (normalized.includes("ceremony") || normalized.includes("church")) {
    return "/church";
  }

  if (normalized.includes("reception") || normalized.includes("traditional") || normalized.includes("after party")) {
    return "/weekend";
  }

  if (normalized.includes("rsvp")) {
    return "/rsvp";
  }

  if (normalized.includes("color") || normalized.includes("dress")) {
    return "/weekend";
  }

  if (normalized.includes("registry")) {
    return "/registry";
  }

  if (normalized.includes("photo") || normalized.includes("upload") || normalized.includes("gallery")) {
    return "/upload";
  }

  if (normalized.includes("travel") || normalized.includes("airport") || normalized.includes("hotel")) {
    return "/travel";
  }

  if (normalized.includes("story")) {
    return "/our-story";
  }

  return "/faq";
}

function parseTimeRange(value: string): { startTime: string | null; endTime: string | null } {
  const match = value.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*(?:-|–|—|to)\s*(\d{1,2}:\d{2}\s*[AP]M|midnight)/i);
  if (!match) {
    return { startTime: null, endTime: null };
  }

  return {
    startTime: match[1].toUpperCase(),
    endTime: match[2].toUpperCase()
  };
}

function sectionContains(sectionName: string, ...terms: string[]): boolean {
  const normalized = normalizeText(sectionName);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function keyContains(key: string, ...terms: string[]): boolean {
  const normalized = normalizeText(key);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function buildCore(model: SourceModel): CoreModel {
  const core: CoreModel = {
    weddingDate: model.meta.weddingDate,
    weddingDateDisplay: formatDateDisplay(model.meta.weddingDate),
    timezone: model.meta.timezone,
    city: model.meta.city,
    ceremony: {
      venueName: null,
      address: null,
      time: null,
      startTime: null,
      endTime: null,
      dressCode: null
    },
    reception: {
      venueName: null,
      address: null,
      time: null,
      startTime: null,
      endTime: null,
      dressCode: null
    },
    afterParty: {
      location: null,
      time: null,
      startTime: null,
      endTime: null,
      dressCode: null
    },
    colors: null,
    registry: {
      amazon: null,
      walmart: null,
      target: null
    },
    rsvp: {
      deadline: null,
      passphrase: null,
      plusOnes: null,
      instructions: null
    },
    uploads: {
      page: null,
      instructions: null
    }
  };

  for (const section of model.factSections) {
    for (const bullet of section.bullets) {
      const keyValue = bullet.match(/^([^:]+):\s*(.+)$/);
      const key = keyValue ? keyValue[1].trim() : "";
      const value = keyValue ? keyValue[2].trim() : bullet.trim();

      if (sectionContains(section.section, "ceremony", "church")) {
        if (keyContains(key, "venue")) {
          core.ceremony.venueName = value;
        } else if (keyContains(key, "address")) {
          core.ceremony.address = value;
        } else if (keyContains(key, "time")) {
          core.ceremony.time = value;
          const parsedRange = parseTimeRange(value);
          core.ceremony.startTime = parsedRange.startTime;
          core.ceremony.endTime = parsedRange.endTime;
        } else if (keyContains(key, "dress code", "dress")) {
          core.ceremony.dressCode = value;
        }
      }

      if (sectionContains(section.section, "reception", "traditional")) {
        if (keyContains(key, "venue")) {
          core.reception.venueName = value;
        } else if (keyContains(key, "address")) {
          core.reception.address = value;
        } else if (keyContains(key, "time")) {
          core.reception.time = value;
          const parsedRange = parseTimeRange(value);
          core.reception.startTime = parsedRange.startTime;
          core.reception.endTime = parsedRange.endTime;
        } else if (keyContains(key, "dress code", "dress")) {
          core.reception.dressCode = value;
        }
      }

      if (sectionContains(section.section, "after party", "afterparty")) {
        if (keyContains(key, "location")) {
          core.afterParty.location = value;
        } else if (keyContains(key, "time")) {
          core.afterParty.time = value;
          const parsedRange = parseTimeRange(value);
          core.afterParty.startTime = parsedRange.startTime;
          core.afterParty.endTime = parsedRange.endTime;
        } else if (keyContains(key, "dress code", "dress")) {
          core.afterParty.dressCode = value;
        }
      }

      if (sectionContains(section.section, "colors")) {
        core.colors = value;
      }

      if (sectionContains(section.section, "registry")) {
        if (keyContains(key, "amazon")) {
          core.registry.amazon = value;
        } else if (keyContains(key, "walmart")) {
          core.registry.walmart = value;
        } else if (keyContains(key, "target")) {
          core.registry.target = value;
        }
      }

      if (sectionContains(section.section, "rsvp")) {
        if (keyContains(key, "deadline")) {
          core.rsvp.deadline = value;
        } else if (keyContains(key, "passphrase")) {
          core.rsvp.passphrase = value;
        } else if (keyContains(key, "plus")) {
          core.rsvp.plusOnes = value;
        } else if (keyContains(key, "how to rsvp", "how")) {
          core.rsvp.instructions = value;
        }
      }

      if (sectionContains(section.section, "photo upload", "live gallery", "upload")) {
        if (keyContains(key, "upload page", "page")) {
          core.uploads.page = value;
        } else {
          core.uploads.instructions = core.uploads.instructions
            ? `${core.uploads.instructions} ${value}`
            : value;
        }
      }

      if (sectionContains(section.section, "travel") && keyContains(key, "airport") && !core.city) {
        core.city = value;
      }
    }
  }

  return core;
}

function extractTags(section: string, text: string): string[] {
  const tokens = `${section} ${text}`
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2)
    .slice(0, 8);

  return unique(tokens);
}

function parseFrontmatter(markdown: string): { frontmatter: Record<string, string>; body: string } {
  if (!markdown.startsWith("---\n")) {
    throw new Error("chatbot_kb_source.md is missing YAML frontmatter.");
  }

  const endIndex = markdown.indexOf("\n---\n", 4);
  if (endIndex < 0) {
    throw new Error("chatbot_kb_source.md has invalid YAML frontmatter boundaries.");
  }

  const frontmatterRaw = markdown.slice(4, endIndex);
  const body = markdown.slice(endIndex + 5);

  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterRaw.split("\n")) {
    const match = line.match(/^\s*([a-zA-Z0-9_]+):\s*(.*)\s*$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (key === "meta") {
      continue;
    }

    frontmatter[key] = cleanValue(rawValue);
  }

  return { frontmatter, body };
}

function parseFactsSection(lines: string[]): Array<{ section: string; bullets: string[] }> {
  const sections = new Map<string, string[]>();
  let currentSection = "General";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("### ")) {
      currentSection = line.slice(4).trim();
      if (!sections.has(currentSection)) {
        sections.set(currentSection, []);
      }
      continue;
    }

    if (line.startsWith("- ")) {
      if (!sections.has(currentSection)) {
        sections.set(currentSection, []);
      }
      sections.get(currentSection)?.push(line.slice(2).trim());
    }
  }

  return [...sections.entries()].map(([section, bullets]) => ({ section, bullets }));
}

function parseFaqSection(lines: string[]): Array<{ q: string; a: string }> {
  const faqs: Array<{ q: string; a: string }> = [];
  let pendingQuestion: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const qMatch = line.match(/^-\s*Q:\s*(.+)$/i);
    if (qMatch) {
      pendingQuestion = qMatch[1].trim();
      continue;
    }

    const aMatch = line.match(/^A:\s*(.+)$/i);
    if (aMatch && pendingQuestion) {
      faqs.push({ q: pendingQuestion, a: aMatch[1].trim() });
      pendingQuestion = null;
    }
  }

  return faqs;
}

function parseStoriesSection(lines: string[]): Array<{ title: string; text: string }> {
  const stories: Array<{ title: string; text: string }> = [];
  let currentTitle: string | null = null;
  let currentParagraphs: string[] = [];

  const flush = (): void => {
    if (!currentTitle) {
      return;
    }

    const text = currentParagraphs.join(" ").trim();
    if (text && !/^\(write/i.test(text)) {
      stories.push({ title: currentTitle, text });
    }

    currentParagraphs = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("### ")) {
      flush();
      currentTitle = line.slice(4).trim();
      continue;
    }

    if (!line || line.startsWith(">")) {
      continue;
    }

    currentParagraphs.push(line);
  }

  flush();
  return stories;
}

function parseRoutingHints(lines: string[]): RoutingHint[] {
  const hints: RoutingHint[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const match = line.match(/^-\s*If question mentions\s+(.+?)\s*(?:→|->)\s*(\/[a-z0-9\-/]+)\s*$/i);
    if (!match) {
      continue;
    }

    const mentionText = match[1];
    const suggestedPage = match[2];
    const tokens = mentionText
      .split(/,|\bor\b|\//i)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    hints.push({ match: unique(tokens), suggestedPage });
  }

  return hints;
}

function splitMarkdownSections(body: string): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentKey = "";

  for (const line of body.split("\n")) {
    const headerMatch = line.trim().match(/^##\s+(.+)$/);
    if (headerMatch) {
      currentKey = headerMatch[1].trim().toLowerCase();
      sections[currentKey] = [];
      continue;
    }

    if (!currentKey) {
      continue;
    }

    sections[currentKey].push(line);
  }

  return sections;
}

function parseMarkdownSource(markdown: string): SourceModel {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const sections = splitMarkdownSections(body);

  const facts = parseFactsSection(sections["facts"] || []);
  const faqs = parseFaqSection(
    sections["faqs (q → a)"] || sections["faqs (q -> a)"] || sections["faqs"] || []
  );
  const stories = parseStoriesSection(sections["stories (optional)"] || sections["stories"] || []);
  const routingHints = parseRoutingHints(sections["routing hints (optional)"] || sections["routing hints"] || []);

  return {
    meta: {
      version: frontmatter.version || "v1",
      couple: frontmatter.couple || "Jessica and Chibuike",
      timezone: frontmatter.timezone || "America/Denver",
      weddingDate: frontmatter.weddingDate || "2026-06-12",
      city: frontmatter.city || "El Paso, Texas",
      hashtag: frontmatter.hashtag,
      updatedAt: frontmatter.updatedAt
    },
    factSections: facts,
    faqs,
    stories,
    routingHints
  };
}

function parseJsonSource(rawJson: string): SourceModel {
  const parsed = JSON.parse(rawJson) as {
    meta?: Record<string, unknown>;
    ceremony?: Record<string, unknown>;
    reception?: Record<string, unknown>;
    policies?: Record<string, unknown>;
    registry?: Record<string, unknown>;
    uploads?: Record<string, unknown>;
    travel?: Record<string, unknown>;
    faq?: Array<{ question?: string; answer?: string; suggestedPage?: string }>;
    loveStory?: Record<string, unknown>;
  };

  const meta = parsed.meta || {};

  const factSections: Array<{ section: string; bullets: string[] }> = [];

  function addSection(section: string, source?: Record<string, unknown>): void {
    if (!source) {
      return;
    }

    const bullets = Object.entries(source)
      .filter(([, value]) => typeof value === "string" && (value as string).trim().length > 0)
      .map(([key, value]) => `${key}: ${String(value)}`);

    if (bullets.length > 0) {
      factSections.push({ section, bullets });
    }
  }

  addSection("Ceremony", parsed.ceremony);
  addSection("Reception / Traditional", parsed.reception);
  addSection("RSVP", parsed.policies);
  addSection("Registry", parsed.registry);
  addSection("Photo Uploads", parsed.uploads);
  addSection("Travel", parsed.travel);

  const faqs = (parsed.faq || [])
    .filter((item) => typeof item.question === "string" && typeof item.answer === "string")
    .map((item) => ({ q: item.question as string, a: item.answer as string, suggestedPage: item.suggestedPage }));

  const stories = Object.entries(parsed.loveStory || {})
    .filter(([, value]) => typeof value === "string" && String(value).trim().length > 0)
    .map(([key, value]) => ({ title: key, text: String(value) }));

  return {
    meta: {
      version: String(meta.version || "v1"),
      couple: String(meta.couple || meta.displayName || "Jessica and Chibuike"),
      timezone: String(meta.timezone || meta.timeZone || "America/Denver"),
      weddingDate: String(meta.weddingDate || "2026-06-12"),
      city: String(meta.city || "El Paso, Texas"),
      hashtag: typeof meta.hashtag === "string" ? meta.hashtag : undefined,
      updatedAt: typeof meta.updatedAt === "string" ? meta.updatedAt : undefined
    },
    factSections,
    faqs,
    stories,
    routingHints: defaultRoutingHints
  };
}

function buildFacts(model: SourceModel): Fact[] {
  const facts: Fact[] = [];

  facts.push({
    id: "fact_couple_overview",
    topic: "couple",
    text: `${model.meta.couple} are getting married on ${model.meta.weddingDate} in ${model.meta.city} (${model.meta.timezone}).`,
    tags: ["couple", "names", "date", "city", "timezone"],
    suggestedPage: "/"
  });

  if (model.meta.hashtag) {
    facts.push({
      id: "fact_wedding_hashtag",
      topic: "couple",
      text: `Wedding hashtag: ${model.meta.hashtag}.`,
      tags: ["hashtag", "social", "wedding"],
      suggestedPage: "/"
    });
  }

  for (const section of model.factSections) {
    const suggestedPage = inferSuggestedPage(section.section);
    section.bullets.forEach((bullet, index) => {
      facts.push({
        id: `fact_${sanitizeId(section.section)}_${index + 1}`,
        topic: sanitizeId(section.section) || "fact",
        text: `${section.section}: ${bullet}`,
        tags: extractTags(section.section, bullet),
        suggestedPage
      });
    });
  }

  model.stories.forEach((story, index) => {
    facts.push({
      id: `fact_story_${index + 1}_${sanitizeId(story.title)}`,
      topic: "story",
      text: `${story.title}: ${story.text}`,
      tags: extractTags("story", `${story.title} ${story.text}`),
      suggestedPage: "/our-story"
    });
  });

  return facts;
}

function buildQna(model: SourceModel, facts: Fact[]): QnA[] {
  const qna: QnA[] = [];

  for (const item of model.faqs) {
    qna.push({
      q: item.q,
      a: item.a,
      tags: extractTags(item.q, item.a),
      suggestedPage: item.suggestedPage || inferSuggestedPage(item.q)
    });
  }

  for (const section of model.factSections) {
    const suggestedPage = inferSuggestedPage(section.section);

    for (const bullet of section.bullets) {
      const keyValue = bullet.match(/^([^:]+):\s*(.+)$/);
      if (!keyValue) {
        continue;
      }

      const [, key, value] = keyValue;
      const question = section.section.toLowerCase().includes("color")
        ? `What are the colors of the day?`
        : `What is ${key.trim().toLowerCase()}?`;

      qna.push({
        q: question,
        a: value.trim(),
        tags: extractTags(`${section.section} ${key}`, value),
        suggestedPage
      });
    }
  }

  for (const fact of facts) {
    if (qna.length >= 30) {
      break;
    }

    if (!fact.text.includes(":")) {
      continue;
    }

    qna.push({
      q: `Can you share ${fact.topic.replace(/_/g, " ")} details?`,
      a: fact.text,
      tags: fact.tags,
      suggestedPage: fact.suggestedPage
    });
  }

  const deduped = new Map<string, QnA>();
  for (const item of qna) {
    const key = normalizeText(item.q);
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }

  return [...deduped.values()];
}

async function loadSourceModel(): Promise<{ model: SourceModel; sourceKind: "md" | "json" }> {
  try {
    const markdown = await readFile(SOURCE_MD_PATH, "utf-8");
    return { model: parseMarkdownSource(markdown), sourceKind: "md" };
  } catch {
    const rawJson = await readFile(SOURCE_JSON_PATH, "utf-8");
    return { model: parseJsonSource(rawJson), sourceKind: "json" };
  }
}

async function main(): Promise<void> {
  const { model, sourceKind } = await loadSourceModel();
  const facts = buildFacts(model);
  const qna = buildQna(model, facts);
  const routingHints = model.routingHints.length > 0 ? model.routingHints : defaultRoutingHints;
  const core = buildCore(model);

  const optimized = {
    meta: {
      version: model.meta.version || "v1",
      updatedAt: toIso(model.meta.updatedAt, model.meta.weddingDate),
      couple: model.meta.couple,
      timezone: model.meta.timezone,
      city: model.meta.city,
      weddingDate: model.meta.weddingDate
    },
    core,
    facts,
    qna,
    routingHints,
    synonyms
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(optimized, null, 2)}\n`, "utf-8");
  console.log(`Built chat KB from ${sourceKind}: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error("Failed to build chatbot KB:", error);
  process.exitCode = 1;
});
