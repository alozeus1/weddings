export type BotCta = {
  kind: "registry" | "rsvp" | "travel" | "schedule";
  label: string;
  url: string;
  suggestedPage?: string;
};

export type BotResponse = {
  text: string;
  suggestedPage: string | null;
  confidence: number;
  ctas?: BotCta[];
  debug?: {
    intent?: string;
    confidence?: number;
    kbStatus?: "ok" | "load_failed";
  };
};
