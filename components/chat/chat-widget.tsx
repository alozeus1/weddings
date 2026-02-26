"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatCta = {
  kind: "registry" | "rsvp" | "travel" | "schedule";
  label: string;
  url: string;
  suggestedPage?: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  suggestedPage?: string | null;
  confidence?: number;
  ctas?: ChatCta[];
};

type ChatApiResponse = {
  text?: string;
  answer?: string;
  suggestedPage?: string | null;
  confidence?: number;
  ctas?: ChatCta[];
  error?: string;
};

const STORAGE_KEY = "wedding-chat-history-v1";

const initialMessages: ChatMessage[] = [
  {
    id: "intro",
    role: "assistant",
    content: "Hi, I am your Wedding Assistant. Ask anything about the wedding."
  }
];

function messageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeCtas(value: unknown): ChatCta[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const ctas = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Partial<ChatCta>;
      if (
        (candidate.kind !== "registry" && candidate.kind !== "rsvp" && candidate.kind !== "travel" && candidate.kind !== "schedule") ||
        typeof candidate.label !== "string" ||
        typeof candidate.url !== "string"
      ) {
        return null;
      }

      return {
        kind: candidate.kind,
        label: candidate.label,
        url: candidate.url,
        suggestedPage: typeof candidate.suggestedPage === "string" ? candidate.suggestedPage : undefined
      } as ChatCta;
    })
    .filter((entry): entry is ChatCta => Boolean(entry));

  return ctas.length > 0 ? ctas : undefined;
}

function sanitizeStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return initialMessages;
  }

  const sanitized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Partial<ChatMessage>;
      if ((candidate.role !== "user" && candidate.role !== "assistant") || typeof candidate.content !== "string") {
        return null;
      }

      return {
        id: typeof candidate.id === "string" ? candidate.id : messageId(),
        role: candidate.role,
        content: candidate.content,
        suggestedPage: typeof candidate.suggestedPage === "string" ? candidate.suggestedPage : null,
        confidence: typeof candidate.confidence === "number" ? candidate.confidence : undefined,
        ctas: sanitizeCtas((candidate as { ctas?: unknown }).ctas)
      } as ChatMessage;
    })
    .filter((entry): entry is ChatMessage => Boolean(entry));

  return sanitized.length > 0 ? sanitized.slice(-30) : initialMessages;
}

export function ChatWidget(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setMessages(sanitizeStoredMessages(JSON.parse(raw)));
      }
    } catch (storageError) {
      console.error("[chat-widget] failed to load chat history", storageError);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch (storageError) {
      console.error("[chat-widget] failed to persist chat history", storageError);
    }
  }, [messages, hydrated]);

  async function sendMessage(): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: messageId(),
      role: "user",
      content: trimmed
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages
            .slice(-8)
            .filter((message) => message.role === "assistant" || message.role === "user")
            .map((message) => ({ role: message.role, content: message.content }))
        })
      });

      const payload = (await response.json()) as ChatApiResponse;
      const answer =
        (typeof payload.text === "string" && payload.text.trim().length > 0
          ? payload.text
          : typeof payload.answer === "string" && payload.answer.trim().length > 0
            ? payload.answer
            : null);

      if (!response.ok || !answer) {
        console.error("[chat-widget] chat request failed", {
          status: response.status,
          payload
        });

        const fallback = typeof payload.error === "string" ? payload.error : "I couldn't answer right now. Please try again.";
        setError(fallback);
        setMessages((current) => [
          ...current,
          {
            id: messageId(),
            role: "assistant",
            content: fallback
          }
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: answer,
          suggestedPage: typeof payload.suggestedPage === "string" ? payload.suggestedPage : null,
          confidence: typeof payload.confidence === "number" ? payload.confidence : undefined,
          ctas: sanitizeCtas(payload.ctas)
        }
      ]);
    } catch (requestError) {
      console.error("[chat-widget] chat request failed", requestError);
      const fallback = "I couldn't answer right now. Please try again.";
      setError(fallback);
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: fallback
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3" data-testid="chatbot-widget">
      {isOpen ? (
        <section
          className="w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-gold-300/50 bg-white/95 shadow-card"
          data-testid="chatbot-panel"
        >
          <header className="border-b border-gold-200/60 px-4 py-3">
            <p className="section-kicker">Assistant</p>
            <h2 className="font-display text-xl text-ink">Wedding Assistant</h2>
            <p className="mt-1 text-xs text-ink/70">Ask anything about the wedding.</p>
          </header>

          <div className="h-72 space-y-3 overflow-y-auto px-4 py-3" data-testid="chatbot-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-6 ${
                  message.role === "user" ? "ml-auto bg-gold-100/60 text-ink" : "bg-ivory text-ink/85"
                }`}
                data-testid="chatbot-message"
                data-role={message.role}
              >
                <p>{message.content}</p>
                {message.role === "assistant" && message.suggestedPage ? (
                  <p className="mt-1 text-xs text-ink/70" data-testid="chatbot-suggested-page">
                    Suggested page: <Link href={message.suggestedPage} className="underline">{message.suggestedPage}</Link>
                  </p>
                ) : null}
                {message.role === "assistant" && message.ctas?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2" data-testid="chatbot-ctas">
                    {message.ctas.map((cta) => (
                      <Link
                        key={`${message.id}-${cta.kind}-${cta.url}`}
                        href={cta.url}
                        className="rounded-full border border-gold-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="chatbot-cta"
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
            {isLoading ? (
              <article className="max-w-[90%] rounded-xl bg-ivory px-3 py-2 text-sm text-ink/75" data-testid="chatbot-loading">
                Thinking...
              </article>
            ) : null}
          </div>

          <form
            className="border-t border-gold-200/60 px-4 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <label className="sr-only" htmlFor="chat-input">
              Ask a question
            </label>
            <div className="flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a wedding question"
                className="w-full rounded-md border border-gold-300/60 px-3 py-2 text-sm"
                data-testid="chatbot-input"
              />
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                className="rounded-md bg-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ink disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="chatbot-send"
              >
                Send
              </button>
            </div>
            {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-full bg-gold-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink shadow-card"
        data-testid="chatbot-toggle"
      >
        Chat
      </button>
    </div>
  );
}
