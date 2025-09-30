// src/hooks/useAgentSuggest.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postSuggest, type AgentSuggestResult, type AgentMessage, type AgentSuggestPayload } from "@/services/agentService";

type Vars = { messages: AgentMessage[]; options?: any };

export function useAgentSuggest() {
  const qc = useQueryClient();

  return useMutation<AgentSuggestResult, unknown, Vars>({
    mutationFn: ({ messages, options }: Vars) => {
      // Defensive: build payload as service expects
      const payload: AgentSuggestPayload = { messages, options: options ?? {} };
      return postSuggest(payload);
    },
    onSuccess: (data) => {
      // Optional: invalidate or persist suggestions if needed
      qc.invalidateQueries(["agent", "suggestions"]);
    },
    onError: (err) => {
      console.warn("useAgentSuggest error:", err);
    },
  });
}
