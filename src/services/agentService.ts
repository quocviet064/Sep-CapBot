// src/services/agentService.ts
import aiAPI from "@/lib/AiApi";

// --- Types ---
export type AgentRole = "user" | "agent" | "system";
export type AgentMessage = {
  id?: string;
  role: AgentRole;
  text: string;
  time?: string; // ISO
  metadata?: Record<string, any>;
};

export type AgentSuggestPayload = {
  messages: AgentMessage[];
  options?: {
    maxTokens?: number;
    temperature?: number;
    [k: string]: any;
  };
};

export type AgentSuggestResult = {
  messages?: AgentMessage[];
  suggestion?: string;
  metadata?: Record<string, any>;
};

export type ApiWrapper<T> = {
  statusCode?: string | number;
  success: boolean;
  data?: T | null;
  errors?: any;
  message?: string | null;
};

// POST non-streaming suggest
export async function postSuggest(payload: AgentSuggestPayload): Promise<AgentSuggestResult> {
  try {
    const resp = await aiAPI.post<ApiWrapper<AgentSuggestResult>>("/api/agent/suggest", payload);
    if (!resp?.data) throw new Error("Empty response from agent service");
    if (!resp.data.success) {
      throw new Error(resp.data.message ?? "Agent returned success=false");
    }
    return resp.data.data ?? {};
  } catch (err: any) {
    if (err?.response?.data) {
      const serverMsg = err.response.data?.message ?? JSON.stringify(err.response.data);
      throw new Error(serverMsg);
    }
    throw new Error(err?.message ?? "Network error while calling agent suggest");
  }
}

// optional: create session for streaming (if your BE supports it)
export async function createStreamSession(payload: AgentSuggestPayload): Promise<{ sessionId: string }> {
  try {
    const resp = await aiAPI.post<ApiWrapper<{ sessionId: string }>>("/api/agent/session", payload);
    if (!resp?.data) throw new Error("Empty response from agent service");
    if (!resp.data.success) throw new Error(resp.data.message ?? "Failed to create session");
    if (!resp.data.data?.sessionId) throw new Error("No sessionId returned");
    return resp.data.data;
  } catch (err: any) {
    if (err?.response?.data) {
      const serverMsg = err.response.data?.message ?? JSON.stringify(err.response.data);
      throw new Error(serverMsg);
    }
    throw new Error(err?.message ?? "Network error while creating agent session");
  }
}

// SSE subscribe helper (if BE supports SSE)
export function subscribeToStream(
  sessionId: string,
  handlers: {
    onMessage: (chunk: string) => void;
    onJson?: (obj: any) => void;
    onDone?: () => void;
    onError?: (err: any) => void;
    streamPath?: string;
  }
) {
  const base = (aiAPI.defaults.baseURL || "").replace(/\/+$/, "");
  const path = handlers.streamPath ?? "/api/agent/stream";
  const url = `${base}${path}?sessionId=${encodeURIComponent(sessionId)}`;

  let es: EventSource | null = null;
  try {
    es = new EventSource(url, { withCredentials: false });
  } catch (e) {
    handlers.onError?.(e);
    return { close: () => {} };
  }

  es.onmessage = (ev) => {
    let data = ev.data;
    try {
      const obj = JSON.parse(data);
      if (obj.chunk) handlers.onMessage(String(obj.chunk));
      else handlers.onJson?.(obj);
    } catch {
      handlers.onMessage(data);
    }
  };

  es.onerror = (ev) => handlers.onError?.(ev);
  es.addEventListener("done", () => handlers.onDone?.());

  return {
    close: () => {
      try {
        es?.close();
      } catch {}
    },
  };
}
