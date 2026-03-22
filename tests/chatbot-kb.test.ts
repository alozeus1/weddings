import { describe, expect, it } from "vitest";
import optimizedKb from "../content/chatbot_kb_optimized.json";
import { buildChatbotReply } from "../lib/chatbot-kb";
import type { ChatbotOptimizedKB } from "../types/chatbot";

const kb = optimizedKb as ChatbotOptimizedKB;

describe("chatbot KB lookup", () => {
  it("answers ceremony time and location from KB content", () => {
    const { response } = buildChatbotReply("What time is the ceremony and where is it?", kb);

    expect(response.text).toMatch(/3:00 PM - 4:00 PM/i);
    expect(response.text).toMatch(/St\. Patrick/i);
    expect(response.suggestedPage).toBe("/church");
    expect(response.links?.some((link) => link.url === "/church")).toBe(true);
  });

  it("answers reception time and location from KB content", () => {
    const { response } = buildChatbotReply("Where is the reception and what time does it start?", kb);

    expect(response.text).toMatch(/6:00 PM - 10:00 PM/i);
    expect(response.text).toMatch(/Tuscany Event Center/i);
    expect(response.text).toMatch(/8600 Gateway Blvd/i);
    expect(response.suggestedPage).toBe("/weekend");
  });

  it("returns RSVP instructions with passphrase", () => {
    const { response } = buildChatbotReply("What is the RSVP passphrase?", kb);

    expect(response.text).toMatch(/JC2026/i);
    expect(response.suggestedPage).toBe("/rsvp");
    expect(response.links?.some((link) => link.url === "/rsvp")).toBe(true);
  });

  it("answers generic wedding date questions from core schedule content", () => {
    const { response } = buildChatbotReply("when is the wedding?", kb);

    expect(response.text).toMatch(/June 12, 2026/i);
    expect(response.text).toMatch(/3:00 PM - 4:00 PM/i);
    expect(response.text).toMatch(/6:00 PM - 10:00 PM/i);
    expect(response.suggestedPage).toBe("/weekend");
  });

  it("answers upload instructions from KB content", () => {
    const { response } = buildChatbotReply("How do I upload photos?", kb);

    expect(response.text).toMatch(/Upload page/i);
    expect(response.text).toMatch(/Live Gallery/i);
    expect(response.suggestedPage).toBe("/upload");
    expect(response.links?.some((link) => link.url === "/upload")).toBe(true);
  });

  it("answers airport and travel basics from KB content", () => {
    const { response } = buildChatbotReply("What airport should I fly into?", kb);

    expect(response.text).toMatch(/El Paso International Airport \(ELP\)/i);
    expect(response.suggestedPage).toBe("/travel");
  });

  it("answers adults-only policy from KB content", () => {
    const { response } = buildChatbotReply("Are kids allowed?", kb);

    expect(response.text).toMatch(/adults-only/i);
    expect(response.suggestedPage).toBe("/faq");
  });

  it("returns multiple internal links when routing hints overlap", () => {
    const { response } = buildChatbotReply("What is the dress code for the church ceremony?", kb);

    expect(response.links?.some((link) => link.url === "/church")).toBe(true);
    expect(response.links?.some((link) => link.url === "/weekend")).toBe(true);
  });

  it("keeps menu questions grounded in menu KB entries", () => {
    const { response } = buildChatbotReply("menu for the day", kb);

    expect(response.text).toMatch(/meal selection is required in RSVP/i);
    expect(response.text).toMatch(/more menu details will be shared with guests/i);
    expect(response.text).not.toMatch(/Search your name/i);
  });
});
