"use client";

import { useState } from "react";

interface MestorPanelProps {
  context: "cockpit" | "creator" | "console" | "intake";
  strategyId?: string;
  className?: string;
}

export function MestorPanel({ context, strategyId, className }: MestorPanelProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // TODO: Wire to Mestor AI service with context-appropriate system prompt
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Mestor AI est en cours d'intégration. Cette fonctionnalité sera disponible prochainement." },
      ]);
      setIsLoading(false);
    }, 500);
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
              className={`inline-block rounded-lg px-3 py-2 ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm">
            <span className="inline-block rounded-lg bg-muted px-3 py-2 animate-pulse">...</span>
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
        <button type="submit" disabled={isLoading} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          Envoyer
        </button>
      </form>
    </div>
  );
}
