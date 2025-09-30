// src/components/AgentChat/MessageList.tsx
import React from "react";
import type { AgentMessage } from "@/services/agentService";

function MessageBubble({ m, onSelectSuggestion }: { m: AgentMessage; onSelectSuggestion?: (t: string) => void }) {
  const isAgent = m.role === "agent";
  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"} mb-3`}>
      <div className={`${isAgent ? "bg-slate-100 text-slate-900" : "bg-indigo-600 text-white"} p-3 rounded-lg max-w-[80%]`}>
        <div className="whitespace-pre-wrap">{m.text}</div>
        {/* simple heuristic: if metadata.suggestions is provided, render buttons */}
        {m.metadata?.suggestions && Array.isArray(m.metadata.suggestions) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.metadata.suggestions.map((s: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion?.(s)}
                className="px-2 py-1 text-sm bg-white text-slate-800 border rounded hover:bg-slate-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageList({ messages, onSelectSuggestion }: { messages: AgentMessage[]; onSelectSuggestion?: (t: string) => void }) {
  return (
    <div>
      {messages.map((m) => (
        <MessageBubble key={m.id} m={m} onSelectSuggestion={onSelectSuggestion} />
      ))}
    </div>
  );
}
