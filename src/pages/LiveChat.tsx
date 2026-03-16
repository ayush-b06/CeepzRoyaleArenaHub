import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Smile, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  username: string;
  text: string;
  created_at: string;
}

const CR_ASSETS = "https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/chr";

const EMOTES = [
  { code: ":hog-rider:", src: `${CR_ASSETS}/hog_rider.png`, label: "Hog Rider" },
  { code: ":goblin:", src: `${CR_ASSETS}/goblins.png`, label: "Goblin" },
  { code: ":giant-skeleton:", src: `${CR_ASSETS}/giant_skeleton.png`, label: "Giant Skeleton" },
  { code: ":princess:", src: `${CR_ASSETS}/princess.png`, label: "Princess" },
  { code: ":mega-knight:", src: `${CR_ASSETS}/mega_knight.png`, label: "Mega Knight" },
  { code: ":pekka:", src: `${CR_ASSETS}/pekka.png`, label: "P.E.K.K.A" },
  { code: ":baby-dragon:", src: `${CR_ASSETS}/baby_dragon.png`, label: "Baby Dragon" },
  { code: ":knight:", src: `${CR_ASSETS}/knight.png`, label: "Knight" },
];

function renderMessageText(text: string) {
  const parts = text.split(/(:[a-z-]+:)/g);
  return parts.map((part, i) => {
    const emote = EMOTES.find((e) => e.code === part);
    if (emote) {
      return (
        <img
          key={i}
          src={emote.src}
          alt={emote.label}
          className="inline-block h-10 w-10 object-contain align-middle mx-0.5 animate-bounce"
            style={{ animationDuration: "0.8s" }}
        />
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function LiveChat() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem("chat_username") ?? "");
  const [usernameInput, setUsernameInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmotes, setShowEmotes] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) return;

    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
        setLoading(false);
      });

    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emote picker when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emoteRef.current && !emoteRef.current.contains(e.target as Node)) {
        setShowEmotes(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function joinChat() {
    const name = usernameInput.trim();
    if (!name) return;
    localStorage.setItem("chat_username", name);
    setUsername(name);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !username) return;
    setInput("");
    await supabase.from("chat_messages").insert({ username, text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  async function insertEmote(code: string) {
    setShowEmotes(false);
    if (!username) return;
    await supabase.from("chat_messages").insert({ username, text: code });
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (!username) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-4 text-center">
            <MessageSquare className="h-10 w-10 text-primary mx-auto" />
            <h2 className="font-display text-2xl font-bold text-gradient">Join Live Chat</h2>
            <p className="text-sm text-muted-foreground">Enter a username to start chatting with your clanmates.</p>
            <Input
              placeholder="Your username..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinChat()}
              autoFocus
            />
            <Button className="w-full" onClick={joinChat} disabled={!usernameInput.trim()}>
              Enter Chat
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <button
            onClick={() => navigate("/")}
            className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-gradient">Live Chat</h1>
          <span className="ml-2 text-xs text-muted-foreground">
            as <span className="text-primary font-medium">{username}</span>
          </span>
          <button
            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => {
              localStorage.removeItem("chat_username");
              setUsername("");
              setMessages([]);
            }}
          >
            Change name
          </button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-4">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading && (
            <p className="text-center text-sm text-muted-foreground">Loading messages...</p>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No messages yet. Say something!</p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.username === username;
            return (
              <div
                key={msg.id}
                className={cn("flex flex-col max-w-[70%]", isOwn ? "ml-auto items-end" : "items-start")}
              >
                <span className="text-xs text-muted-foreground mb-1">
                  {isOwn ? "You" : msg.username} · {formatTime(msg.created_at)}
                </span>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {renderMessageText(msg.text)}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border flex gap-2 relative">
          {/* Emote picker */}
          <div ref={emoteRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmotes((v) => !v)}
              className="text-muted-foreground hover:text-primary"
            >
              <Smile className="h-5 w-5" />
            </Button>

            {showEmotes && (
              <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-xl p-3 flex gap-2 shadow-lg z-10">
                {EMOTES.map((emote) => (
                  <button
                    key={emote.code}
                    onClick={() => insertEmote(emote.code)}
                    className="h-10 w-10 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    <img src={emote.src} alt={emote.label} className="h-8 w-8 object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
