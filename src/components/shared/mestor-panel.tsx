"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

interface MestorPanelProps {
  context: "cockpit" | "creator" | "console" | "intake";
  strategyId?: string;
  className?: string;
}

export function MestorPanel({ context, strategyId, className }: MestorPanelProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");

  const chatMutation = trpc.mestor.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, je rencontre un problème. Réessayez dans un instant." },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);

    chatMutation.mutate({
      context,
      messages: newMessages,
      strategyId,
    });
  };

  return (
    <div className={`flex flex-col rounded-lg border bg-card ${className ?? ""}`}>
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Mestor AI</h3>
        <p className="text-xs text-muted-foreground">
          {context === "cockpit" && "Assistant Brand OS"}
          {context === "creator" && "Assistant Mission & Guidelines"}
          {context === "console" && "Assistant Écosystème"}
          {context === "intake" && "Guide diagnostic ADVE"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200, maxHeight: 400 }}>
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Posez une question à Mestor...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.role === "user" ? "text-right" : ""}`}>
            <span
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left whitespace-pre-wrap ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="text-sm">
            <span className="inline-block rounded-lg bg-muted px-3 py-2 animate-pulse">Mestor réfléchit...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Demandez à Mestor..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={chatMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
