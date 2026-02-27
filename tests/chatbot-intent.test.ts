import { describe, expect, it } from "vitest";
import { answerFromIntent, classifyIntent, type ChatCore } from "../lib/chatbot-intent";

const core: ChatCore = {
  weddingDate: "2026-06-12",
  weddingDateDisplay: "June 12, 2026",
  timezone: "MT",
  city: "El Paso, Texas",
  ceremony: {
    venueName: "St. Patrick's Cathedral",
    address: "1118 N Mesa St, El Paso, TX 79902",
    time: "3:00 PM - 4:00 PM (MT)",
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    dressCode: "Dress elegantly."
  },
  reception: {
    venueName: "Tuscany Event Center",
    address: "8600 Gateway Blvd, El Paso, TX 79907",
    time: "6:00 PM - 10:00 PM (MT)",
    startTime: "6:00 PM",
    endTime: "10:00 PM",
    dressCode: "African Native / cultural Attire"
  },
  afterParty: {
    location: "TBD",
    time: "10:00 PM - Midnight (MT)",
    startTime: "10:00 PM",
    endTime: "MIDNIGHT",
    dressCode: "freestyle"
  },
  colors: "Sage green and dusty pink",
  registry: {
    amazon: "https://www.amazon.com/wedding/home?example=1",
    walmart: "https://www.walmart.com/cp/wedding-registry/1229486",
    target: "https://www.target.com/gift-registry/create-wedding-registry"
  },
  rsvp: {
    deadline: "2026-05-13",
    passphrase: "JC2026",
    plusOnes: "Check with the couple",
    instructions: "Search your name, then enter the passphrase and complete the form."
  },
  uploads: {
    page: "/upload",
    instructions: "Upload your photos on mobile and approved photos appear in live gallery."
  }
};

function resolve(question: string) {
  const intent = classifyIntent(question);
  const answer = answerFromIntent(intent, core);
  return { intent, answer };
}

describe("chatbot intent routing", () => {
  it("when is this wedding returns date intent answer", () => {
    const { intent, answer } = resolve("when is this wedding");
    expect(intent).toBe("wedding_date");
    expect(answer).toBeTruthy();
    expect(answer?.text).toMatch(/June 12, 2026/i);
    expect(answer?.suggestedPage).toBe("/weekend");
  });

  it("where is the wedding returns location answer", () => {
    const { intent, answer } = resolve("where is the wedding");
    expect(intent).toBe("wedding_location");
    expect(answer).toBeTruthy();
    expect(answer?.text).toMatch(/El Paso, TX/i);
    expect(answer?.text).toMatch(/1118 N Mesa St, El Paso, TX 79902/i);
    expect(answer?.text).toMatch(/8600 Gateway Blvd, El Paso, TX 79907/i);
    expect(answer?.suggestedPage).toBe("/weekend");
  });

  it("registry intent returns amazon link", () => {
    const { intent, answer } = resolve("registry");
    expect(intent).toBe("registry");
    expect(answer).toBeTruthy();
    expect(answer?.ctas?.[0]?.label).toBe("Registry: Amazon");
    expect(answer?.ctas?.[0]?.url || "").toMatch(/amazon\.com\/wedding/i);
    expect(answer?.suggestedPage).toBe("/registry");
  });

  it("colors intent returns sage green and dusty pink", () => {
    const { intent, answer } = resolve("colors of the day");
    expect(intent).toBe("colors");
    expect(answer).toBeTruthy();
    expect(answer?.text).toMatch(/sage green and dusty pink/i);
  });
});
