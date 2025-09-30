// src/components/AgentChat/MessageInput.tsx
import React, { useState } from "react";

export default function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border rounded px-3 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mô tả ngắn về yêu cầu gợi ý (ví dụ: muốn hướng theo AI, ML cho học sinh hệ thống ...)"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        aria-label="Gõ yêu cầu gợi ý"
      />
      <button onClick={submit} disabled={disabled} className="px-4 py-2 bg-indigo-600 text-white rounded">
        Gợi ý
      </button>
    </div>
  );
}
