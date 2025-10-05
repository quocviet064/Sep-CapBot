// src/pages/reviews/ReviewDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import LoadingPage from "@/pages/loading-page";
import { formatDateTime } from "@/utils/formatter";
import { getReviewDetail, type ReviewDetailDTO, type ReviewCriteriaScoreDTO } from "@/services/reviewService";
import { ArrowLeft, ListChecks, Star } from "lucide-react";

const VN_RECOMMENDATION: Record<string, string> = {
  approve: "Chấp thuận",
  reject: "Từ chối",
  minorrevision: "Sửa nhỏ",
  majorrevision: "Sửa lớn",
};

const VN_STATUS: Record<string, string> = {
  submitted: "Đã nộp",
  pending: "Chờ nộp",
  inprogress: "Đang thực hiện",
  completed: "Hoàn tất",
};

function toVN(map: Record<string, string>, v?: string | null) {
  if (!v) return undefined;
  const k = String(v).trim().toLowerCase().replace(/\s+/g, "");
  return map[k] || v;
}

function cell(n: number | null | undefined, digits = 2) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(digits).replace(/\.00$/, "");
}

function ReviewDetailHeader({ data }: { data: ReviewDetailDTO }) {
  const rec = toVN(VN_RECOMMENDATION, data.recommendation);
  const st = toVN(VN_STATUS, data.status);
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-amber-600 via-orange-600 to-orange-500 p-5 text-white shadow-sm">
      <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-14 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Chi tiết đánh giá #{data.id}</h2>
            <p className="text-xs text-white/80">Assignment ID: {data.assignmentId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rec ? <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/25">{rec}</Badge> : null}
          {st ? <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/25">{st}</Badge> : null}
        </div>
      </div>
    </div>
  );
}

function SummaryCards({ data }: { data: ReviewDetailDTO }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Điểm tổng (server)</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <Star className="h-5 w-5" />
          {cell(data.overallScore)}
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Thời gian đánh giá (phút)</div>
        <div className="mt-1 text-2xl font-semibold">{cell(data.timeSpentMinutes, 0)}</div>
      </div>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Trạng thái</div>
        <div className="mt-1 text-xl font-semibold">
          {toVN(VN_STATUS, data.status) || "—"}
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Thời điểm nộp</div>
        <div className="mt-1 text-base font-semibold">
          {data.submittedAt ? formatDateTime(data.submittedAt) : "—"}
        </div>
      </div>
    </div>
  );
}

function CriteriaTable({ rows }: { rows: ReviewCriteriaScoreDTO[] }) {
  const totals = useMemo(() => {
    const sumWeight = rows.reduce((s, r) => s + (r.criteria?.weight ?? 0), 0);
    const sumWeighted = rows.reduce((s, r) => {
      const max = r.criteria?.maxScore ?? 0;
      const w = r.criteria?.weight ?? 0;
      if (!max || !w) return s;
      return s + (r.score / max) * w;
    }, 0);
    return { sumWeight, sumWeighted };
  }, [rows]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="grid grid-cols-12 bg-neutral-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-600">
        <div className="col-span-5">Tiêu chí</div>
        <div className="col-span-1 text-right">Trọng số</div>
        <div className="col-span-1 text-right">Tối đa</div>
        <div className="col-span-1 text-right">Điểm</div>
        <div className="col-span-1 text-right">%</div>
        <div className="col-span-1 text-right">Điểm quy đổi</div>
        <div className="col-span-2 text-right pr-0">Ghi chú</div>
      </div>
      <div className="divide-y">
        {rows.map((r, idx) => {
          const max = r.criteria?.maxScore ?? 0;
          const w = r.criteria?.weight ?? 0;
          const pct = max ? (r.score / max) * 100 : null;
          const conv = max ? (r.score / max) * w : null;
          return (
            <div key={`${r.criteriaId}-${idx}`} className="grid grid-cols-12 items-start px-4 py-3 text-sm">
              <div className="col-span-5 pr-4">
                <div className="font-medium">{r.criteria?.name || "—"}</div>
   
              </div>
              <div className="col-span-1 text-right">{cell(w, 0)}</div>
              <div className="col-span-1 text-right">{cell(max, 0)}</div>
              <div className="col-span-1 text-right">{cell(r.score, 0)}</div>
              <div className="col-span-1 text-right">{pct == null ? "—" : `${cell(pct)}%`}</div>
              <div className="col-span-1 text-right">{cell(conv)}</div>
              <div className="col-span-2 text-right text-neutral-700">{r.comment?.trim() || "—"}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-12 bg-neutral-50 px-4 py-3 text-sm font-semibold">
        <div className="col-span-5">Tổng</div>
        <div className="col-span-1 text-right">{cell(totals.sumWeight, 0)}</div>
        <div className="col-span-1 text-right">—</div>
        <div className="col-span-1 text-right">—</div>
        <div className="col-span-1 text-right">—</div>
        <div className="col-span-1 text-right">{cell(totals.sumWeighted)}</div>
        <div className="col-span-2 text-right">—</div>
      </div>
    </div>
  );
}

export default function ReviewDetailPage() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ReviewDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getReviewDetail(Number(reviewId));
        setData(res);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, [reviewId]);

  if (loading) return <LoadingPage />;
  if (err)
    return (
      <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
        {err}
      </div>
    );
  if (!data) return <div className="p-4">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="space-y-4">
      <ReviewDetailHeader data={data} />
      <SummaryCards data={data} />
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium text-neutral-700">Nhận xét tổng quát</div>
        <div className="min-h-[80px] whitespace-pre-wrap break-words rounded-xl border bg-white/70 px-3 py-2 text-sm text-neutral-800 ring-1 ring-black/5">
          {data.overallComment?.trim() || "—"}
        </div>
      </div>
      <CriteriaTable rows={data.criteriaScores || []} />
      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-4xl items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <Button variant="ghost" onClick={() => navigate(-1)} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div className="text-sm text-neutral-600">
            Điểm tổng (server): <span className="font-semibold">{cell(data.overallScore)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
