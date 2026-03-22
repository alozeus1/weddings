import type { ChatCore } from "../lib/chatbot-intent";

export type ChatbotFact = {
  id: string;
  topic: string;
  text: string;
  tags: string[];
  suggestedPage: string;
};

export type ChatbotQna = {
  q: string;
  a: string;
  tags: string[];
  suggestedPage: string;
};

export type ChatbotRoutingHint = {
  match: string[];
  suggestedPage: string;
};

export type ChatbotOptimizedKB = {
  meta: {
    version: string;
    updatedAt: string;
    couple: string;
    timezone: string;
    city: string;
    weddingDate: string;
  };
  core: ChatCore;
  facts: ChatbotFact[];
  qna: ChatbotQna[];
  routingHints: ChatbotRoutingHint[];
  synonyms: Record<string, string[]>;
};

export type ChatbotSourceContent = {
  meta: {
    updatedAt: string;
    displayName: string;
    timeZone: string;
    city: string;
    weddingDate: string;
    hashtag: string;
  };
  ceremony: {
    name: string;
    massLabel: string;
    time: string;
    arrivalRecommendation: string;
    venue: string;
    address: string;
    dressCode: string;
    unpluggedPolicy: string;
  };
  reception: {
    name: string;
    time: string;
    afterPartyTime: string;
    venue: string;
    address: string;
    dressCode: string;
    afterPartyDressCode: string;
    openBar: string;
    dinnerStyle: string;
    themeColors: string;
    culturalElements: string;
  };
  policies: {
    adultsOnly: string;
    plusOne: string;
    rsvpDeadline: string;
    lateRsvpAllowed: string;
    rsvpVerification: string;
    rsvpChangePolicy: string;
  };
  travel: {
    airport: string;
    transportation: string;
    parking: string;
    hotels: string;
  };
  registry: {
    primary: string;
    amazonUrl: string;
    walmartUrl: string;
    targetUrl: string;
  };
  uploads: {
    uploadPage: string;
    qrPage: string;
    instructions: string;
  };
  faq: Array<{
    question: string;
    answer: string;
    suggestedPage: string;
  }>;
  loveStory: {
    howTheyMet: string;
    proposal: string;
    mostExcitedAbout: string;
  };
};
