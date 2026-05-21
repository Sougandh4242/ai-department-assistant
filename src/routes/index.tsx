import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowLeft, Bot } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AIML Department Assistant — DSCE" },
      { name: "description", content: "Ask anything about DSCE AI&ML department activities." },
    ],
  }),
});

const SUGGESTIONS = [
  "Who won hackathons?",
  "What MOUs were signed?",
  "List all internships",
  "Faculty members",
];

const TITLE_PHRASES = [
  "AIML Academic Assistant",
  "Ask About Events",
  "Explore Achievements",
  "Discover Collaborations",
];

const ENDPOINT = "https://nonenigmatically-colloidal-natalie.ngrok-free.dev/ask";

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

const IMAGE_BASE = "https://nonenigmatically-colloidal-natalie.ngrok-free.dev";

function Index() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inChat = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json().catch(() => ({}));
      const answer = data?.answer ?? "Sorry, I couldn't get a response.";
      const images = Array.isArray(data?.images) ? (data.images as string[]) : [];
      setMessages((m) => [...m, { role: "assistant", content: String(answer), images }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col text-foreground"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      {inChat && (
        <header className="sticky top-0 z-10 px-4 py-3 border-b border-white/5 backdrop-blur-md bg-[#0d0d0d]/80">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setMessages([])}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center text-sm text-white/60 truncate">
              AIML Academic Assistant
            </div>
            <div className="w-14" />
          </div>
        </header>
      )}

      {!inChat ? (
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 animate-in fade-in duration-500">
          <div className="w-full max-w-2xl text-center">
            <h1
              className="text-xl sm:text-4xl md:text-5xl tracking-tight text-white whitespace-nowrap overflow-visible"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, height: "1.2em", lineHeight: "1.2em" }}
            >
              <Typewriter phrases={TITLE_PHRASES} />
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/60">
              Ask anything about DSCE AI&amp;ML department activities
            </p>

            <div className="mt-10">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => send(input)}
                loading={loading}
                large
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-4 py-2 rounded-full text-sm border border-[#ff6b35]/30 text-[#ff6b35] hover:bg-[#ff6b35]/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 animate-in fade-in duration-300"
        >
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex items-end gap-2">
                <BotAvatar />
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#1a1a1a]">
                  <Dots />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {inChat && (
        <div className="sticky bottom-0 px-4 py-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => send(input)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function ChatInput({
  value,
  onChange,
  onSend,
  loading,
  large = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  large?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      className={`relative flex items-center w-full rounded-full bg-[#1a1a1a] border border-white/10 focus-within:border-white/25 transition-colors ${
        large ? "py-2 pl-6 pr-2" : "py-1.5 pl-5 pr-1.5"
      }`}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask anything…"
        className={`flex-1 bg-transparent outline-none text-white placeholder:text-white/40 ${
          large ? "text-base sm:text-lg py-3" : "text-base py-2.5"
        }`}
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        aria-label="Send"
        className={`flex items-center justify-center rounded-full bg-[#ff6b35] text-white transition-all hover:bg-[#ff7d4d] disabled:opacity-40 disabled:cursor-not-allowed ${
          large ? "h-11 w-11" : "h-10 w-10"
        }`}
      >
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>
    </form>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#262626] text-white whitespace-pre-wrap break-words">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BotAvatar />
      <div className="max-w-[85%] sm:max-w-[75%] flex flex-col gap-3">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#1a1a1a] text-white/95 break-words text-[15px] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
              h1: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1.5 marker:text-[#ff6b35]" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1.5 marker:text-[#ff6b35]" {...props} />,
              li: ({ node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
              a: ({ node, ...props }) => <a className="text-[#ff6b35] underline underline-offset-2 hover:text-[#ff7d4d]" target="_blank" rel="noreferrer" {...props} />,
              code: ({ node, ...props }) => <code className="px-1.5 py-0.5 rounded bg-white/10 text-[13px]" {...props} />,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
        {msg.images && msg.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {msg.images.map((src, i) => {
              const url = src.startsWith("http") ? src : `${IMAGE_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
              return (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]">
                  <img src={url} alt={`Result ${i + 1}`} loading="lazy" className="w-full h-32 sm:h-36 object-cover hover:scale-105 transition-transform" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-[#ff6b35]/15 border border-[#ff6b35]/30 flex items-center justify-center text-[#ff6b35]">
      <Bot size={16} />
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-white/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Typewriter({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    const current = phrases[index];
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 70);
      } else {
        timeout = setTimeout(() => setPhase("deleting"), 1500);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 35);
      } else {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, index, phrases]);

  return (
    <span>
      {text}
      <span className="inline-block w-[2px] h-[0.9em] align-middle bg-white ml-1 animate-pulse" />
    </span>
  );
}

