// src/components/AgentChat/AgentChat.tsx
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AgentMessage } from "@/services/agentService";
import { useAgentSuggest } from "@/hooks/useAgentSuggest";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

type Props = {
  initialSystemPrompt?: string;
  sessionId?: string; // optional to correlate on backend
  maxHistory?: number;
  onSelectSuggestion?: (text: string) => void; // user clicks suggested topic -> parent handles
};

export default function AgentChat({ initialSystemPrompt, sessionId, maxHistory = 20, onSelectSuggestion }: Props) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    const sys: AgentMessage[] = initialSystemPrompt
      ? [{ id: uuidv4(), role: "system", text: initialSystemPrompt, time: new Date().toISOString() }]
      : [];
    return sys;
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mut = useAgentSuggest();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // auto-scroll to bottom when messages change
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // helper: append message safely (limit history)
  const pushMessage = (m: AgentMessage) => {
    setMessages((s) => {
      const out = [...s, m];
      const sys = out.filter((x) => x.role === "system");
      const others = out.filter((x) => x.role !== "system");
      const trimmed = [...sys, ...others.slice(-maxHistory)];
      return trimmed;
    });
  };

  const handleSend = async (text: string) => {
    setError(null);
    const userMsg: AgentMessage = { id: uuidv4(), role: "user", text, time: new Date().toISOString() };
    pushMessage(userMsg);

    // optimistic placeholder
    const placeholder: AgentMessage = { id: `placeholder-${Date.now()}`, role: "agent", text: "Đang tạo đề xuất...", time: new Date().toISOString() };
    pushMessage(placeholder);
    setIsStreaming(true);

    try {
      const payload = messages.concat(userMsg);
      const res = await mut.mutateAsync({ messages: payload, options: { sessionId } });
      setIsStreaming(false);

      // remove placeholder and append actual returned messages
      setMessages((cur) => cur.filter((m) => !m.id?.toString().startsWith("placeholder-")));
      // parse returned messages: either array or single suggestion
      const newMsgs: AgentMessage[] = [];
      if (Array.isArray(res.messages) && res.messages.length > 0) {
        for (const m of res.messages) {
          newMsgs.push({
            id: m.id ?? uuidv4(),
            role: (m.role as any) ?? "agent",
            text: m.text ?? JSON.stringify(m),
            time: m.time ?? new Date().toISOString(),
            metadata: m.metadata,
          });
        }
      } else if (res.suggestion) {
        newMsgs.push({ id: uuidv4(), role: "agent", text: res.suggestion, time: new Date().toISOString() });
      } else {
        newMsgs.push({ id: uuidv4(), role: "agent", text: "Không có đề xuất (backend trả rỗng).", time: new Date().toISOString() });
      }
      setMessages((cur) => [...cur, ...newMsgs]);
    } catch (err: any) {
      setIsStreaming(false);
      // remove placeholder
      setMessages((cur) => cur.filter((m) => !m.id?.toString().startsWith("placeholder-")));
      const msg = err?.message ?? "Lỗi khi gọi dịch vụ gợi ý";
      setError(msg);
      pushMessage({ id: uuidv4(), role: "agent", text: `Lỗi: ${msg}`, time: new Date().toISOString() });
    }
  };

  const handleQuickSelect = (text: string) => {
    if (onSelectSuggestion) onSelectSuggestion(text);
    // also add to messages as user choice
    pushMessage({ id: uuidv4(), role: "user", text, time: new Date().toISOString() });
  };

  return (
    <div className="max-w-3xl mx-auto border rounded-md shadow-sm">
      <div className="px-4 py-2 border-b">
        <strong>Gợi ý đề tài — Supervisor Assistant</strong>
      </div>

      <div ref={scrollRef} className="h-96 overflow-auto p-4 bg-white">
        <MessageList messages={messages} onSelectSuggestion={handleQuickSelect} />
        {isStreaming && <div className="text-sm text-slate-500">Đang tạo đề xuất...</div>}
        {error && <div className="text-sm text-red-600 mt-2">Lỗi: {error}</div>}
      </div>

      <div className="p-3 border-t">
        <MessageInput onSend={handleSend} disabled={mut.isLoading || isStreaming} />
      </div>
    </div>
  );
}
