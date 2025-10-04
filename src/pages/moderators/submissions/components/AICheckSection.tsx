import { useMemo, useState } from "react";

type Props = { submissionDetail?: unknown };

type AiCheckCriterion = {
  id?: string | number;
  question?: string;
  score?: number;
  assessment?: string;
  evidence?: string;
  recommendations?: Array<unknown>;
  [k: string]: unknown;
};

type AiCheckDetails = {
  overall_score?: number;
  overall_rating?: string;
  summary?: string;
  criteria?: AiCheckCriterion[];
  missing_fields?: string[];
  risks?: string[];
  next_steps?: string[];
  [k: string]: unknown;
};

function clamp(n?: number, min = 0, max = 100) {
  if (typeof n !== "number" || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

export default function AICheckSection({ submissionDetail }: Readonly<Props>) {
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const aiCheck = useMemo(() => {
    const pickRaw = (sd: unknown): unknown => {
      if (!sd || typeof sd !== "object") return null;
      if ("aiCheckDetails" in sd) return (sd as any).aiCheckDetails;
      if ("aiCheck" in sd) return (sd as any).aiCheck;
      return null;
    };

    const raw: unknown = (() => {
      if (typeof submissionDetail === "string") return submissionDetail;
      return pickRaw(submissionDetail);
    })();

    if (!raw) return { raw: null as string | null, parsed: null as AiCheckDetails | null, error: null as string | null };

    const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);
    try {
      const parsed = JSON.parse(rawStr) as AiCheckDetails;
      return { raw: rawStr, parsed, error: null as string | null };
    } catch (err: unknown) {
      return { raw: rawStr, parsed: null as AiCheckDetails | null, error: String(err) };
    }
  }, [submissionDetail]);

  const overallScorePercent = useMemo<number | null>(() => {
    if (aiCheck.parsed?.overall_score != null) return clamp(aiCheck.parsed.overall_score);
    if (submissionDetail && typeof submissionDetail === "object" && "aiCheckScore" in submissionDetail) {
      const v = (submissionDetail as any).aiCheckScore;
      if (typeof v === "number") return clamp(v * 10);
    }
    return null;
  }, [aiCheck.parsed, submissionDetail]);

  const overallRating = aiCheck.parsed?.overall_rating ?? (submissionDetail && typeof submissionDetail === "object" ? (submissionDetail as any).aiCheckStatus ?? null : null);
  const overallSummaryShort = aiCheck.parsed?.summary ?? undefined;

  const toggleCriterion = (id: string) => setExpandedCriteria((s) => ({ ...s, [id]: !s[id] }));

  const getPrettyJson = (raw?: string | null) => {
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return JSON.stringify(obj, null, 2);
    } catch {
      return raw;
    }
  };

  const copyAiPretty = async () => {
    if (!aiCheck.raw) return;
    const pretty = getPrettyJson(aiCheck.raw) ?? aiCheck.raw;
    try {
      await navigator.clipboard.writeText(pretty);
    } catch {
      console.warn("Copy to clipboard failed");
    }
  };

  const downloadAiPretty = () => {
    if (!aiCheck.raw) return;
    const pretty = getPrettyJson(aiCheck.raw) ?? aiCheck.raw;
    const blob = new Blob([pretty], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-check.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border rounded-md p-4 w-full overflow-x-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">AI Check Overall</div>
          <div className="text-xs text-slate-500">{overallRating ?? "No status"}</div>
          {overallSummaryShort && <div className="mt-1 text-sm text-slate-500 line-clamp-2">{overallSummaryShort}</div>}
        </div>

        <div className="w-48">
          {overallScorePercent != null ? (
            <div>
              <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                <div style={{ width: `${overallScorePercent}%` }} className="h-2 bg-emerald-500" />
              </div>
              {(() => {
                let scoreColorClass = "text-rose-600";
                if (overallScorePercent >= 80) scoreColorClass = "text-emerald-600";
                else if (overallScorePercent >= 60) scoreColorClass = "text-amber-600";
                return (
                  <div
                    className={[
                      "mt-1 text-sm",
                      scoreColorClass,
                    ].join(" ")}
                  >
                    {overallScorePercent}%{aiCheck.parsed?.overall_rating ? ` • ${aiCheck.parsed.overall_rating}` : ""}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No overall score</div>
          )}
        </div>
      </div>

      <div className="border-t my-3" />

      {aiCheck.error && <div className="text-sm text-yellow-600 mb-3">Không thể parse aiCheckDetails: {aiCheck.error}</div>}
      {!aiCheck.parsed && !aiCheck.error && <div className="text-sm text-slate-500">Không có AI Check details.</div>}

      {aiCheck.parsed && (
        <div className="space-y-4">
          {aiCheck.parsed.summary && (
            <div>
              <div className="text-sm font-semibold">Summary</div>
              <div className="mt-1 text-sm">{aiCheck.parsed.summary}</div>
            </div>
          )}

          {Array.isArray(aiCheck.parsed.criteria) && aiCheck.parsed.criteria.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">Criteria</div>
              <div className="space-y-2">
                {aiCheck.parsed.criteria.map((c, idx) => {
                  const rawId = c?.id ?? `crit-${idx}`;
                  const idStr = String(rawId);
                  const expanded = !!expandedCriteria[idStr];
                  const score = typeof c.score === "number" ? c.score : undefined;
                  const pct = clamp(typeof score === "number" && score <= 10 ? score * 10 : (score ?? 0), 0, 100);

                  let pctColorClass = "bg-rose-500";
                  if (pct >= 80) {
                    pctColorClass = "bg-emerald-500";
                  } else if (pct >= 60) {
                    pctColorClass = "bg-amber-500";
                  }

                  const recs = Array.isArray(c.recommendations) ? c.recommendations : [];

                  return (
                    <div key={idStr} className="border rounded">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-3"
                        onClick={() => toggleCriterion(idStr)}
                        aria-expanded={expanded}
                      >
                        <div className="text-left font-medium truncate">{c.question ?? `Criterion ${idx + 1}`}</div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={["text-xs px-2 py-0.5 rounded", pctColorClass, "text-white font-semibold"].join(" ")}
                              style={{ minWidth: 44, textAlign: "center" }}
                            >
                              {typeof score === "number" ? score : "-"}
                            </div>

                            <div style={{ width: 120 }} className="hidden sm:block">
                              <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                <div style={{ width: `${pct}%` }} className={`${pctColorClass} h-2`} />
                              </div>
                            </div>

                            <div className="text-sm text-slate-500">{expanded ? "▲" : "▼"}</div>
                          </div>
                        </div>
                      </button>

                      {expanded && (
                        <div className="p-3 pt-0">
                          {c.assessment && <div className="text-sm mb-2">{String(c.assessment)}</div>}
                          {c.evidence && <div className="text-xs text-slate-500 mb-2">Evidence: {String(c.evidence)}</div>}
                          {recs.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold mb-1">Recommendations</div>
                              <ul className="list-disc ml-5 text-sm">
                                {recs.map((r) => {
                                  const key = `${String(r ?? "")}-${Math.random().toString(36).slice(2, 8)}`;
                                  return <li key={key}>{String(r)}</li>;
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {Array.isArray(aiCheck.parsed.missing_fields) && aiCheck.parsed.missing_fields.length > 0 && (
              <div className="rounded border p-3">
                <div className="text-sm font-semibold mb-1">Missing fields</div>
                <ul className="list-disc ml-5 text-sm">
                  {aiCheck.parsed.missing_fields.map((m, i) => (
                    <li key={`${String(m)}-${i}`}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(aiCheck.parsed.risks) && aiCheck.parsed.risks.length > 0 && (
              <div className="rounded border p-3">
                <div className="text-sm font-semibold mb-1">Risks</div>
                <ul className="list-disc ml-5 text-sm">
                  {aiCheck.parsed.risks.map((r, i) => (
                    <li key={`${String(r)}-${i}`}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(aiCheck.parsed.next_steps) && aiCheck.parsed.next_steps.length > 0 && (
              <div className="rounded border p-3">
                <div className="text-sm font-semibold mb-1">Next steps</div>
                <ul className="list-disc ml-5 text-sm">
                  {aiCheck.parsed.next_steps.map((s, i) => (
                    <li key={`${String(s)}-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-2 flex gap-2">
            {aiCheck.raw && (
              <>
                <button className="rounded border px-2 py-1 text-sm" onClick={copyAiPretty}>
                  Copy JSON
                </button>
                <button className="rounded border px-2 py-1 text-sm" onClick={downloadAiPretty}>
                  Tải JSON
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
