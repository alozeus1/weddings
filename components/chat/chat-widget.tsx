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

const NUDGE_STORAGE_KEY = "wedding-chat-nudge-v1";
const NUDGE_TEXT = "Hi! I’m here to answer any wedding questions — or I can point you to the right page fast.";

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

export function ChatWidget(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNudge, setShowNudge] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    let nudgeTimer: number | undefined;

    try {
      const nudgeSeen = window.sessionStorage.getItem(NUDGE_STORAGE_KEY) === "shown";
      if (!nudgeSeen) {
        setShouldPulse(true);
        nudgeTimer = window.setTimeout(() => {
          setShowNudge(true);
          try {
            window.sessionStorage.setItem(NUDGE_STORAGE_KEY, "shown");
          } catch (storageError) {
            console.error("[chat-widget] failed to persist nudge session state", storageError);
          }
        }, 1100);
      }
    } catch (storageError) {
      console.error("[chat-widget] failed to load nudge session state", storageError);
    }

    return () => {
      if (typeof nudgeTimer === "number") {
        window.clearTimeout(nudgeTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!showNudge) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setShowNudge(false);
    }, 8000);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [showNudge]);

  function dismissNudge(): void {
    setShowNudge(false);
    setShouldPulse(false);
  }

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

      {!isOpen && showNudge ? (
        <div
          className="relative max-w-[280px] rounded-2xl border border-gold-200 bg-white px-3 py-2 text-sm leading-5 text-ink shadow-card"
          data-testid="chatbot-nudge"
        >
          <p>{NUDGE_TEXT}</p>
          <button
            type="button"
            onClick={dismissNudge}
            className="absolute right-2 top-1 text-lg leading-none text-ink/70 hover:text-ink"
            aria-label="Dismiss chat nudge"
            data-testid="chatbot-nudge-dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            dismissNudge();
          }
        }}
        className="chat-bob group relative h-14 w-14 rounded-full border border-gold-300 bg-gold-500 text-ink shadow-card"
        data-testid="chatbot-toggle"
      >
        {!isOpen && shouldPulse ? (
          <span className="chat-pulse absolute inset-0 rounded-full" aria-hidden="true" />
        ) : null}
        <span className="sr-only">Chat</span>
        <span className="relative flex h-full w-full items-center justify-center" data-testid="chatbot-toggle-icon">
          <svg
            viewBox="0 0 64 64"
            width="34"
            height="34"
            aria-hidden="true"
            className="chat-toggle-icon"
          >
            <circle cx="32" cy="36" r="14" fill="#f8f3e8" />
            <path d="M18 34c0-8 6.3-14.5 14-14.5s14 6.5 14 14.5" fill="none" stroke="#14213d" strokeWidth="2.8" strokeLinecap="round" />
            <rect x="14" y="33" width="6" height="11" rx="3" fill="#14213d" />
            <rect x="44" y="33" width="6" height="11" rx="3" fill="#14213d" />
            <circle className="chat-eye" cx="27" cy="35" r="1.8" fill="#14213d" />
            <circle className="chat-eye" cx="37" cy="35" r="1.8" fill="#14213d" />
            <path d="M27 42c1.4 1.6 3 2.4 5 2.4s3.6-.8 5-2.4" fill="none" stroke="#14213d" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M47 45c0 3.3-2.7 6-6 6h-5" fill="none" stroke="#14213d" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}
