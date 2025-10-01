import { useMemo, useState } from "react";

type Props = { submissionDetail?: any };

type AiCheckDetails = {
  overall_score?: number;
  overall_rating?: string;
  summary?: string;
  criteria?: Array<any>;
  missing_fields?: string[];
  risks?: string[];
  next_steps?: string[];
  [k: string]: any;
};

function clamp(n?: number, min = 0, max = 100) {
  if (typeof n !== "number" || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}
function scoreColorSmall(score?: number) {
  if (score == null) return "text-gray-600";
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

export default function AICheckSection({ submissionDetail }: Props) {
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const aiCheck = useMemo(() => {
    const raw: unknown = submissionDetail?.aiCheckDetails;
    if (!raw) return { raw: null, parsed: null, error: null };
    const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);
    try {
      const parsed = JSON.parse(rawStr) as AiCheckDetails;
      return { raw: rawStr, parsed, error: null };
    } catch (err) {
      return { raw: rawStr, parsed: null, error: String(err) };
    }
  }, [submissionDetail]);

  const overallScorePercent = useMemo(() => {
    if (aiCheck.parsed?.overall_score != null) return clamp(aiCheck.parsed.overall_score);
    const score10 = submissionDetail?.aiCheckScore;
    if (typeof score10 === "number") return clamp(score10 * 10);
    return null;
  }, [aiCheck.parsed, submissionDetail]);

  const overallScoreRaw = useMemo(() => {
    if (aiCheck.parsed?.overall_score != null) return aiCheck.parsed.overall_score;
    const score10 = submissionDetail?.aiCheckScore;
    if (typeof score10 === "number") return score10;
    return null;
  }, [aiCheck.parsed, submissionDetail]);

  const overallRating = aiCheck.parsed?.overall_rating ?? submissionDetail?.aiCheckStatus ?? null;
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
    } catch { }
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
              <div className={`mt-1 text-sm ${scoreColorSmall(overallScorePercent)}`}>
                {overallScorePercent}% {aiCheck.parsed?.overall_rating ? ` • ${aiCheck.parsed.overall_rating}` : ""}
              </div>
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
                  const idKey = c.id ?? `crit-${idx}`;
                  const expanded = !!expandedCriteria[idKey];
                  const score = typeof c.score === "number" ? c.score : undefined;
                  const pct = clamp(typeof score === "number" && score <= 10 ? score * 10 : (score ?? 0), 0, 100);
                  return (
                    <div key={idKey} className="border rounded">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-3"
                        onClick={() => toggleCriterion(idKey)}
                        aria-expanded={expanded}
                      >
                        <div className="text-left font-medium truncate">{c.question ?? `Criterion ${idx + 1}`}</div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`text-xs px-2 py-0.5 rounded ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"} text-white font-semibold`} style={{ minWidth: 44, textAlign: "center" }}>
                              {score ?? "-"}
                            </div>
                            <div style={{ width: 120 }} className="hidden sm:block">
                              <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                <div style={{ width: `${pct}%` }} className={`${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"} h-2`} />
                              </div>
                            </div>
                            <div className="text-sm text-slate-500">{expanded ? "▲" : "▼"}</div>
                          </div>
                        </div>
                      </button>

                      {expanded && (
                        <div className="p-3 pt-0">
                          {c.assessment && <div className="text-sm mb-2">{c.assessment}</div>}
                          {c.evidence && <div className="text-xs text-slate-500 mb-2">Evidence: {c.evidence}</div>}
                          {Array.isArray(c.recommendations) && c.recommendations.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold mb-1">Recommendations</div>
                              <ul className="list-disc ml-5 text-sm">
                                {c.recommendations.map((r: any, i: number) => <li key={i}>{r}</li>)}
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
                <ul className="list-disc ml-5 text-sm">{aiCheck.parsed.missing_fields.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
            )}
            {Array.isArray(aiCheck.parsed.risks) && aiCheck.parsed.risks.length > 0 && (
              <div className="rounded border p-3">
                <div className="text-sm font-semibold mb-1">Risks</div>
                <ul className="list-disc ml-5 text-sm">{aiCheck.parsed.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {Array.isArray(aiCheck.parsed.next_steps) && aiCheck.parsed.next_steps.length > 0 && (
              <div className="rounded border p-3">
                <div className="text-sm font-semibold mb-1">Next steps</div>
                <ul className="list-disc ml-5 text-sm">{aiCheck.parsed.next_steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </div>

          <div className="mt-2 flex gap-2">
            {aiCheck.raw && (
              <>
                <button className="rounded border px-2 py-1 text-sm" onClick={copyAiPretty}>Copy JSON</button>
                <button className="rounded border px-2 py-1 text-sm" onClick={downloadAiPretty}>Tải JSON</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
