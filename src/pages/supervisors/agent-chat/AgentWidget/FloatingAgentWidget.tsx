import React, { useState } from "react";
import AgentChat from "../AgentChat/AgentChat"; // component bạn đã có

export default function FloatingAgentWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Open topic suggestion chat"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:scale-105 transition-transform"
      >
        {/* simple icon: chat bubble */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 3.866-4.03 7-9 7a12.5 12.5 0 01-3-.36L3 20l1.36-3A8.5 8.5 0 013 12c0-3.866 4.03-7 9-7s9 3.134 9 7z" />
        </svg>
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div className="fixed inset-0 z-40">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* panel */}
          <div className="absolute right-6 bottom-20 w-[380px] max-w-[92vw] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">C</div>
                <div>
                  <div className="text-sm font-medium">Gợi ý đề tài (Supervisor)</div>
                  <div className="text-xs text-slate-500">Chat với trợ lý đề tài</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-slate-100"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* content */}
            <div className="p-3">
              <AgentChat
                initialSystemPrompt={`Bạn là trợ lý gợi ý đề tài cho supervisor. Hãy đưa ra 3 đề tài ngắn, mỗi đề tài gồm tiêu đề, 1 câu mô tả và các công nghệ chính.`}
                sessionId={String(Date.now())}
                onSelectSuggestion={(text) => {
                  // default behavior: copy suggestion into clipboard + toast (optional)
                  try {
                    navigator.clipboard.writeText(text);
                    // optionally show a toast if you have one
                    // toast.success("Copied suggestion to clipboard");
                  } catch {}
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
